const daysOfWeek = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado'
];

const hours = [...Array(19).keys()].map((i) => i + 5); // 5h até 23h
hours.push(0); // 00h

const weeklyGrid = document.getElementById('weekly-grid');
const calendarDaysContainer = document.getElementById('calendar-days');
const monthLabel = document.getElementById('month-label');
const monthRange = document.getElementById('month-range');
const viewButtons = document.querySelectorAll('.view-toggle button');
const weeklyPanel = document.getElementById('weekly-view');
const monthlyPanel = document.getElementById('monthly-view');

const storageKey = 'agenda-weekly-entries';

function formatHour(hour) {
  return `${hour.toString().padStart(2, '0')}:00`;
}

function getStorage() {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return parsed;
  } catch (err) {
    return {};
  }
}

function saveStorage(data) {
  localStorage.setItem(storageKey, JSON.stringify(data));
}

function buildWeeklyGrid() {
  const savedEntries = getStorage();
  weeklyGrid.innerHTML = '';

  const table = document.createElement('div');
  table.className = 'grid-table';
  table.style.gridTemplateColumns = `160px repeat(${hours.length}, minmax(140px, 1fr))`;

  // Header row
  const headerRow = document.createElement('div');
  headerRow.className = 'grid-row';
  const corner = document.createElement('div');
  corner.className = 'header-cell';
  corner.textContent = 'Dias / Horas';
  headerRow.appendChild(corner);

  hours.forEach((hour) => {
    const cell = document.createElement('div');
    cell.className = 'header-cell';
    cell.textContent = formatHour(hour);
    headerRow.appendChild(cell);
  });
  table.appendChild(headerRow);

  // Days rows
  daysOfWeek.forEach((day) => {
    const row = document.createElement('div');
    row.className = 'grid-row';

    const dayCell = document.createElement('div');
    dayCell.className = 'day-cell';
    dayCell.textContent = day;
    row.appendChild(dayCell);

    hours.forEach((hour) => {
      const cell = createHourCell(day, hour, savedEntries);
      row.appendChild(cell);
    });

    table.appendChild(row);
  });

  weeklyGrid.appendChild(table);
}

function createHourCell(day, hour, savedEntries) {
  const template = document.getElementById('hour-cell-template');
  const fragment = template.content.cloneNode(true);
  const container = fragment.querySelector('.hour-cell');
  const label = fragment.querySelector('label');
  const textarea = fragment.querySelector('textarea');

  const key = `${day}-${hour}`;
  const ariaLabel = `${day} às ${formatHour(hour)}`;

  label.textContent = ariaLabel;
  textarea.setAttribute('aria-label', ariaLabel);
  textarea.value = savedEntries[key] || '';

  textarea.addEventListener('input', () => {
    const current = getStorage();
    current[key] = textarea.value;
    saveStorage(current);
  });

  return container;
}

function buildMonthlyCalendar(baseDate = new Date()) {
  const firstDay = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const lastDay = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
  const startDay = firstDay.getDay();
  const totalDays = lastDay.getDate();
  const today = new Date();

  monthLabel.textContent = firstDay.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric'
  });

  monthRange.textContent = `${firstDay.toLocaleDateString('pt-BR')} até ${lastDay.toLocaleDateString('pt-BR')}`;

  calendarDaysContainer.innerHTML = '';

  for (let i = 0; i < startDay; i += 1) {
    const empty = document.createElement('div');
    empty.className = 'calendar-day';
    calendarDaysContainer.appendChild(empty);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const date = new Date(baseDate.getFullYear(), baseDate.getMonth(), day);
    const cell = document.createElement('div');
    cell.className = 'calendar-day';

    if (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      day === today.getDate()
    ) {
      cell.classList.add('today');
    }

    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;

    const weekdayLabel = document.createElement('div');
    weekdayLabel.className = 'weekday';
    weekdayLabel.textContent = daysOfWeek[date.getDay()].slice(0, 3);

    cell.appendChild(dayNumber);
    cell.appendChild(weekdayLabel);
    calendarDaysContainer.appendChild(cell);
  }
}

function setupViewToggle() {
  viewButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.view;
      viewButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      weeklyPanel.classList.toggle('visible', target === 'weekly');
      monthlyPanel.classList.toggle('visible', target === 'monthly');
    });
  });
}

function setupMonthNavigation() {
  let currentDate = new Date();

  const render = () => buildMonthlyCalendar(currentDate);

  document.getElementById('prev-month').addEventListener('click', () => {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    render();
  });

  document.getElementById('next-month').addEventListener('click', () => {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    render();
  });

  render();
}

buildWeeklyGrid();
setupViewToggle();
setupMonthNavigation();
