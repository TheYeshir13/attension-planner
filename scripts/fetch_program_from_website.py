#!/usr/bin/env python3
"""Fetch the official at.tension program and generate data.json."""

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import Request, urlopen


PROGRAM_URL = "https://attension-festival.de/programm"
CATEGORY_PATH = Path(__file__).with_name("program_categories.json")
VOUCHERSHOW = "Vouchershow"
THEATER = "Theater/Tanz/Zirkus"
SIDESHOWS = "Sideshows/Walkacts/Installationen"
CHILDREN = "Kinderprogramm"
DAY_MAP = {"DO": "Do", "FR": "Fr", "SA": "Sa", "SO": "So"}
DAY_ORDER = ["Do", "Fr", "Sa", "So"]
TIME_RE = re.compile(r"\b(DO|FR|SA|SO)\s+(\d{1,2})[.:](\d{2})\b", re.IGNORECASE)


class Node:
    def __init__(self, tag, attrs):
        self.tag = tag
        self.attrs = dict(attrs)
        self.children = []


class TreeParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("root", [])
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs)
        self.stack[-1].children.append(node)
        if tag not in {"area", "base", "br", "col", "embed", "hr", "img",
                       "input", "link", "meta", "param", "source", "track", "wbr"}:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.stack[-1].children.append(Node(tag, attrs))

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                del self.stack[index:]
                break

    def handle_data(self, data):
        self.stack[-1].children.append(data)


def descendants(node):
    for child in node.children:
        if isinstance(child, Node):
            yield child
            yield from descendants(child)


def text(node):
    parts = []
    for child in node.children:
        parts.append(child if isinstance(child, str) else text(child))
    return " ".join(" ".join(parts).split())


def class_contains(node, name):
    return name in node.attrs.get("class", "").split()


def first_descendant(node, predicate):
    return next((item for item in descendants(node) if predicate(item)), None)


def has_program_item_descendant(node):
    return any(class_contains(item, "program-item") for item in descendants(node))


def label_value(node, label):
    label_node = first_descendant(node, lambda item: text(item).casefold() == label.casefold())
    if not label_node or not label_node.children:
        return None
    parent = next(
        (item for item in descendants(node) if label_node in item.children),
        None,
    )
    if not parent:
        return None
    values = [text(child) for child in parent.children if isinstance(child, Node) and child is not label_node]
    value = " ".join(value for value in values if value).strip()
    return value or None


def normalize_time(hour, minute):
    return f"{int(hour):02d}:{minute}"


def fallback_category(item_type, title):
    value = f"{item_type or ''} {title}".casefold()
    if any(word in value for word in ("kind", "bilderbuch", "tante moos")):
        return CHILDREN
    if any(word in value for word in (
        "workshop", "lesung", "vortrag", "kino", "installation", "walkact",
        "sideshow", "radioballett", "spielhalle", "skate", "siebdruck",
        "spendenlauf", "quiz", "crêpe", "crepe", "beauty salon",
    )):
        return SIDESHOWS
    return THEATER


def parse_items(source, category_map=None):
    category_map = category_map or {}
    parser = TreeParser()
    parser.feed(source)
    items = []
    for node in descendants(parser.root):
        if not class_contains(node, "program-item"):
            continue
        if has_program_item_descendant(node):
            continue
        anchor = first_descendant(
            node, lambda item: item.attrs.get("id", "").startswith("program_")
        )
        if not anchor:
            continue

        title_node = first_descendant(
            node,
            lambda item: class_contains(item, "h2")
            or "font-bold" in item.attrs.get("class", ""),
        )
        title = text(title_node) if title_node else ""
        if not title:
            title_node = first_descendant(
                node,
                lambda item: (
                    item.tag == "div"
                    and "pb-2" in item.attrs.get("class", "")
                    and "text-sm" in item.attrs.get("class", "")
                ),
            )
            title = text(title_node) if title_node else ""
        if not title:
            continue

        times_text = label_value(node, "Spielzeiten") or ""
        appointments = [
            (DAY_MAP[day.upper()], normalize_time(hour, minute))
            for day, hour, minute in TIME_RE.findall(times_text)
        ]
        description_nodes = [
            item for item in descendants(node)
            if class_contains(item, "hypertext")
        ]
        description = ""
        for candidate in description_nodes:
            candidate_text = text(candidate)
            if title not in candidate_text and len(candidate_text) > len(description):
                description = candidate_text

        type_node = first_descendant(
            node,
            lambda item: item.tag == "div"
            and "bg-primary" in item.attrs.get("class", ""),
        )
        item_type = text(type_node) if type_node else None
        organizer_node = first_descendant(
            node,
            lambda item: item.tag == "span"
            and "block" in item.attrs.get("class", "")
            and bool(text(item)),
        )
        organizer = text(organizer_node) if organizer_node else None
        fields = {
            "title": title,
            "type": category_map.get(
                anchor.attrs["id"], fallback_category(item_type, title)
            ),
            "genre": item_type,
            "organizer": organizer,
            "duration": label_value(node, "Dauer"),
            "minAge": label_value(node, "Mindestalter"),
            "language": label_value(node, "Sprache"),
            "stage": label_value(node, "Bühne"),
            "shortDescription": description or None,
            "fullDescription": description or None,
            "programUrl": f"{PROGRAM_URL}#{anchor.attrs['id']}",
        }
        for day, time in appointments:
            items.append({**fields, "day": day, "time": time})
    items.sort(key=lambda item: (
        DAY_ORDER.index(item["day"]),
        item["time"],
        item["title"].casefold(),
    ))
    return items


def fetch_source(url):
    request = Request(url, headers={"User-Agent": "attension-planner-data-fetcher/1.0"})
    with urlopen(request, timeout=30) as response:
        return response.read().decode("utf-8")


def main():
    output = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("data.json")
    source = fetch_source(PROGRAM_URL)
    category_map = json.loads(CATEGORY_PATH.read_text(encoding="utf-8"))
    entries = parse_items(source, category_map)
    if not entries:
        raise RuntimeError("No program appointments found; refusing to overwrite data.json.")
    output.write_text(json.dumps(entries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Created {output} with {len(entries)} show appointments.")


if __name__ == "__main__":
    main()
