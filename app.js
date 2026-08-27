let shows = [];
let selection = new Set();

async function loadData() {
  try {
    const res = await fetch('data.json');
    if (!res.ok) {
      console.error('Fehler beim Laden von data.json:', res.status, res.statusText);
      return;
    }
    shows = await res.json();
    initDayFilter();
    renderCalendar();
    renderPlan();
  } catch (err) {
    console.error('Fehler beim Parsen von data.json:', err);
  }
}

function getDays() {
  const days = Array.from(new Set(shows.map(s => s.day))).filter(Boolean);
  const order = ['Do', 'Fr', 'Sa', 'So'];
  return days.sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
}

function getTimes() {
  const times = Array.from(new Set(shows.map(s => s.time))).filter(Boolean);
  return times.sort();
}

function initDayFilter() {
  const select = document.getElementById('day-filter');
  const days = getDays();
  select.innerHTML = '';
  const optAll = document.createElement('option');
  optAll.value = '';
  optAll.textContent = 'Alle Tage';
  select.appendChild(optAll);
  days.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    select.appendChild(opt);
  });
  select.addEventListener('change', () => {
    renderCalendar();
  });
}

function currentDayFilter() {
  const select = document.getElementById('day-filter');
  return select.value || null;
}

function renderCalendar() {
  const container = document.getElementById('calendar-grid');
  container.innerHTML = '';

  const dayFilter = currentDayFilter();
  const days = getDays();
  const times = getTimes();

  times.forEach(time => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'time-row';

    const labelDiv = document.createElement('div');
    labelDiv.className = 'time-label';
    labelDiv.textContent = time;
    rowDiv.appendChild(labelDiv);

    const slotDiv = document.createElement('div');
    slotDiv.className = 'slot-list';

    const daysToShow = dayFilter ? days.filter(d => d === dayFilter) : days;
    daysToShow.forEach(day => {
      const slotShows = shows.filter(s => s.day === day && s.time === time);
      slotShows.forEach(s => {
        const item = document.createElement('div');
        item.className = 'show-item';

        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = selection.has(showKey(s));
        cb.addEventListener('change', () => toggleShow(s));

        const main = document.createElement('div');
        main.className = 'show-main';
        const titleDiv = document.createElement('div');
        titleDiv.className = 'show-title';
        titleDiv.textContent = `${day} ${time} · ${s.title}`;
        const metaDiv = document.createElement('div');
        metaDiv.className = 'show-meta';
        const parts = [];
        if (s.type) parts.push(s.type);
        if (s.stage) parts.push(s.stage);
        if (s.language) parts.push(s.language);
        metaDiv.textContent = parts.join(' · ');
        main.appendChild(titleDiv);
        if (parts.length) main.appendChild(metaDiv);

        const actions = document.createElement('div');
        actions.className = 'show-actions';
        const detailsBtn = document.createElement('button');
        detailsBtn.type = 'button';
        detailsBtn.textContent = 'Details';
        detailsBtn.addEventListener('click', () => openDetails(s));
        actions.appendChild(detailsBtn);

        item.appendChild(cb);
        item.appendChild(main);
        item.appendChild(actions);
        slotDiv.appendChild(item);
      });
    });

    if (slotDiv.children.length > 0) {
      rowDiv.appendChild(slotDiv);
      container.appendChild(rowDiv);
    }
  });
}

function showKey(s) {
  return `${s.day}|${s.time}|${s.title}`;
}

function toggleShow(show) {
  const key = showKey(show);
  if (selection.has(key)) selection.delete(key);
  else selection.add(key);
  renderCalendar();
  renderPlan();
}

function getSelectedShows() {
  const keys = Array.from(selection);
  return keys.map(k => {
    const [day, time, title] = k.split('|');
    return shows.find(s => s.day === day && s.time === time && s.title === title);
  }).filter(Boolean).sort((a, b) => {
    const order = ['Do', 'Fr', 'Sa', 'So'];
    const da = order.indexOf(a.day);
    const db = order.indexOf(b.day);
    if (da !== db) return da - db;
    if (a.time === b.time) return a.title.localeCompare(b.title);
    return a.time.localeCompare(b.time);
  });
}

function renderPlan() {
  const ul = document.getElementById('plan-list');
  ul.innerHTML = '';
  const selected = getSelectedShows();
  selected.forEach(s => {
    const li = document.createElement('li');
    li.textContent = `${s.day} ${s.time} – ${s.title}${s.stage ? ' (' + s.stage + ')' : ''}`;
    ul.appendChild(li);
  });
}

function printPlan() {
  window.print();
}

function openDetails(show) {
  const modal = document.getElementById('detail-modal');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');

  document.getElementById('detail-title').textContent = show.title;

  const metaParts = [];
  if (show.organizer) metaParts.push(show.organizer);
  if (show.stage) metaParts.push(show.stage);
  if (show.type) metaParts.push(show.type);
  if (show.language) metaParts.push(show.language);
  if (show.duration) metaParts.push(show.duration);
  if (show.minAge) metaParts.push(`ab ${show.minAge}`);
  document.getElementById('detail-meta').textContent = metaParts.join(' · ');

  const desc = show.fullDescription || show.shortDescription || '';
  document.getElementById('detail-description').textContent = desc;

  const extraParts = [];
  if (show.day && show.time) extraParts.push(`Festival-Slot: ${show.day} ${show.time}`);
  document.getElementById('detail-extra').textContent = extraParts.join(' · ');

  const linkContainer = document.getElementById('detail-link-container');
  linkContainer.innerHTML = '';
  if (show.programUrl) {
    const a = document.createElement('a');
    a.href = show.programUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = 'Zum Programm auf attension-festival.de';
    linkContainer.appendChild(a);
  }
}

function closeDetails() {
  const modal = document.getElementById('detail-modal');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

function setupModal() {
  document.querySelectorAll('[data-close-modal]').forEach(el => {
    el.addEventListener('click', closeDetails);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDetails();
  });
}

function toICSDateTime(show) {
  const dayMap = { 'Do': '20260903', 'Fr': '20260904', 'Sa': '20260905', 'So': '20260906' };
  const dateStr = dayMap[show.day] || '20260903';
  const time = (show.time || '00:00').replace(':', '');
  const timeHM = time + '00';
  return `${dateStr}T${timeHM}`;
}

function icsEscape(text) {
  return (text || '').replace(/,/g, '\,').replace(/;/g, '\;');
}

function parseDurationMinutes(show) {
  const d = show.duration;
  if (!d || typeof d !== 'string') return 60;
  const m = d.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 60;
}

function addMinutesToICS(dt, minutes) {
  const year = parseInt(dt.slice(0,4),10);
  const month = parseInt(dt.slice(4,6),10);
  const day = parseInt(dt.slice(6,8),10);
  const hour = parseInt(dt.slice(9,11),10);
  const min = parseInt(dt.slice(11,13),10);
  const sec = parseInt(dt.slice(13,15),10);
  const dateObj = new Date(Date.UTC(year, month-1, day, hour, min, sec));
  dateObj.setUTCMinutes(dateObj.getUTCMinutes() + minutes);
  const y = dateObj.getUTCFullYear();
  const m2 = String(dateObj.getUTCMonth()+1).padStart(2,'0');
  const d2 = String(dateObj.getUTCDate()).padStart(2,'0');
  const h2 = String(dateObj.getUTCHours()).padStart(2,'0');
  const mi2 = String(dateObj.getUTCMinutes()).padStart(2,'0');
  const s2 = String(dateObj.getUTCSeconds()).padStart(2,'0');
  return `${y}${m2}${d2}T${h2}${mi2}${s2}`;
}

function createICS(showsInPlan) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//theYeshir at.tension Planner//DE'
  ];

  showsInPlan.forEach(s => {
    const dtStart = toICSDateTime(s);
    const minutes = parseDurationMinutes(s);
    const dtEnd = addMinutesToICS(dtStart, minutes);
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${showKey(s)}@theYeshir-attension`);
    lines.push(`DTSTAMP:${dtStart}`);
    lines.push(`DTSTART:${dtStart}`);
    lines.push(`DTEND:${dtEnd}`);
    lines.push(`SUMMARY:${icsEscape(s.title)}`);
    if (s.stage) lines.push(`LOCATION:${icsEscape(s.stage)}`);
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('');
}

function downloadICS() {
  const selected = getSelectedShows();
  if (!selected.length) return;
  const icsContent = createICS(selected);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'attension-plan.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupModal();
  document.getElementById('btn-print').addEventListener('click', printPlan);
  document.getElementById('btn-ical').addEventListener('click', downloadICS);
});
