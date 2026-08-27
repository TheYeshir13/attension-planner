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
    initTypeFilter();
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

function getTypes() {
  return Array.from(new Set(shows.map(s => s.type))).filter(Boolean).sort();
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

function initTypeFilter() {
  const select = document.getElementById('type-filter');
  const types = getTypes();
  select.innerHTML = '';

  const optAll = document.createElement('option');
  optAll.value = '';
  optAll.textContent = 'Alle Typen';
  select.appendChild(optAll);

  types.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
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

function currentTypeFilter() {
  const select = document.getElementById('type-filter');
  return select.value || null;
}

function renderCalendar() {
  const grid = document.getElementById('calendar-grid');
  grid.innerHTML = '';

  const days = getDays();
  const times = getTimes();
  const dayFilter = currentDayFilter();
  const typeFilter = currentTypeFilter();

  times.forEach(time => {
    const row = document.createElement('div');
    row.className = 'calendar-row';

    const timeCell = document.createElement('div');
    timeCell.className = 'calendar-time-cell';
    timeCell.textContent = time;
    row.appendChild(timeCell);

    const dayRow = document.createElement('div');
    dayRow.className = 'calendar-day-row';

    const daysToShow = dayFilter ? days.filter(d => d === dayFilter) : days;
    daysToShow.forEach(day => {
      const col = document.createElement('div');
      col.className = 'calendar-slot-col';
      const slotDiv = document.createElement('div');
      slotDiv.className = 'calendar-slot';

      const slotShows = shows.filter(s => s.day === day && s.time === time && (!typeFilter || s.type === typeFilter));
      slotShows.forEach(show => {
        const card = document.createElement('div');
        const typeClass = show.type ? 'show-type-' + show.type.replace(/\//g, '\/') : '';
        card.className = 'show-card mobile-clickable ' + typeClass;

        const titleDiv = document.createElement('div');
        titleDiv.className = 'show-card-title';
        titleDiv.textContent = show.title;

        const metaDiv = document.createElement('div');
        metaDiv.className = 'show-card-meta';
        const metaParts = [];
        if (show.stage) metaParts.push(show.stage);
        if (show.type) metaParts.push(show.type);
        if (show.language) metaParts.push(show.language);
        metaDiv.textContent = metaParts.join(' · ');

        const controls = document.createElement('div');
        controls.className = 'show-card-controls';
        const left = document.createElement('div');
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = selection.has(showKey(show));
        cb.addEventListener('change', e => {
          e.stopPropagation();
          toggleShow(show);
        });
        left.appendChild(cb);

        const right = document.createElement('div');
        const detailsBtn = document.createElement('button');
        detailsBtn.type = 'button';
        detailsBtn.textContent = 'Details';
        detailsBtn.addEventListener('click', e => {
          e.stopPropagation();
          openDetails(show);
        });
        right.appendChild(detailsBtn);

        controls.appendChild(left);
        controls.appendChild(right);

        card.appendChild(titleDiv);
        card.appendChild(metaDiv);
        card.appendChild(controls);

        // Mobil: Klick auf Titel oder Karte fügt zum Plan hinzu
        card.addEventListener('click', () => {
          toggleShow(show);
        });

        slotDiv.appendChild(card);
      });

      col.appendChild(slotDiv);
      dayRow.appendChild(col);
    });

    row.appendChild(dayRow);
    grid.appendChild(row);
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
  return keys
    .map(k => {
      const [day, time, title] = k.split('|');
      return shows.find(s => s.day === day && s.time === time && s.title === title);
    })
    .filter(Boolean)
    .sort((a, b) => {
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

// Detail-Modal
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

// iCal-Export
function toICSDateTime(show) {
  const dayMap = { Do: '20260903', Fr: '20260904', Sa: '20260905', So: '20260906' };
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
  const match = d.match(/[0-9]+/);
  return match ? parseInt(match[0], 10) : 60;
}

function addMinutesToICS(dt, minutes) {
  const year = parseInt(dt.slice(0, 4), 10);
  const month = parseInt(dt.slice(4, 6), 10);
  const day = parseInt(dt.slice(6, 8), 10);
  const hour = parseInt(dt.slice(9, 11), 10);
  const min = parseInt(dt.slice(11, 13), 10);
  const sec = parseInt(dt.slice(13, 15), 10);
  const dateObj = new Date(Date.UTC(year, month - 1, day, hour, min, sec));
  dateObj.setUTCMinutes(dateObj.getUTCMinutes() + minutes);
  const y = dateObj.getUTCFullYear();
  const m2 = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const d2 = String(dateObj.getUTCDate()).padStart(2, '0');
  const h2 = String(dateObj.getUTCHours()).padStart(2, '0');
  const mi2 = String(dateObj.getUTCMinutes()).padStart(2, '0');
  const s2 = String(dateObj.getUTCSeconds()).padStart(2, '0');
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
  return lines.join('
');
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
