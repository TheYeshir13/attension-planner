import json
from pathlib import Path

current_path = Path("data.json")
old_path = Path("data-old.json")

current = json.loads(current_path.read_text(encoding="utf-8"))
old = json.loads(old_path.read_text(encoding="utf-8"))

def key(item):
    return (
        (item.get("title") or "").strip().casefold(),
        (item.get("organizer") or "").strip().casefold()
    )

old_by_key = {key(item): item for item in old}

for item in current:
    previous = old_by_key.get(key(item))

    if previous:
        item["fullDescription"] = (
            previous.get("fullDescription")
            or previous.get("shortDescription")
            or item.get("shortDescription")
        )
        item["programUrl"] = (
            previous.get("programUrl")
            or "https://attension-festival.de/programm"
        )
    else:
        item["fullDescription"] = item.get("shortDescription")
        item["programUrl"] = "https://attension-festival.de/programm"

current_path.write_text(
    json.dumps(current, ensure_ascii=False, indent=2),
    encoding="utf-8"
)

print(f"{len(current)} Termine aktualisiert.")