'use strict';

/* ============================================================
   AgendaDigital PWA - App logic
   ============================================================ */

const STORAGE_KEY = 'agendadigital_state_v1';

const CATEGORIES = ['Trabajo', 'Personal', 'Estudios', 'Salud', 'Recordatorio'];
const PRIORITIES = ['Alta', 'Media', 'Baja'];
const NOTE_COLORS = ['#3F51B5', '#8E24AA', '#00897B', '#43A047', '#FB8C00', '#E53935'];

const CATEGORY_COLORS = {
  trabajo: '#3F51B5',
  personal: '#8E24AA',
  estudios: '#00897B',
  salud: '#43A047',
  recordatorio: '#FB8C00'
};

const PRIORITY_COLORS = {
  alta: '#E53935',
  media: '#FB8C00',
  baja: '#43A047'
};

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DAY_SHORT = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

const SVG = {
  clock: '<svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>',
  bell: '<svg viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
  fire: '<svg viewBox="0 0 24 24"><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
  pushpin: '<svg viewBox="0 0 24 24"><path d="M14 4v5c0 1.12.37 2.16 1 3H9c.65-.86 1-1.9 1-3V4h4m3-2H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3V4h1c.55 0 1-.45 1-1s-.45-1-1-1z"/></svg>',
  pushpinOff: '<svg viewBox="0 0 24 24"><path d="M14 4v5c0 1.12.37 2.16 1 3H9c.65-.86 1-1.9 1-3V4h4m3-2H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3V4h1c.55 0 1-.45 1-1s-.45-1-1-1z"/></svg>'
};

/* ---------------- State ---------------- */

let state = loadState();

function defaultProfile() {
  return {
    userEmail: 'usuario@agendadigital.app',
    userName: 'Usuario AgendaDigital',
    isCloudSyncEnabled: true,
    lastSyncTimeMillis: Date.now(),
    cloudBackupCount: 12,
    storageUsedMb: 1.4,
    isAutoSync: true
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      s.profile = Object.assign(defaultProfile(), s.profile);
      s.syncStatus = s.syncStatus || 'synced';
      s.selectedDate = s.selectedDate != null ? s.selectedDate : toEpochDay(new Date());
      s.searchQuery = s.searchQuery || '';
      s.selectedCategory = s.selectedCategory || null;
      return s;
    }
  } catch (e) {
    console.warn('No se pudo cargar el estado', e);
  }
  return seedSampleData();
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('No se pudo guardar el estado', e);
  }
}

function seedSampleData() {
  const today = toEpochDay(new Date());
  const now = Date.now();
  const s = {
    agendaItems: [
      {
        id: 1, title: 'Reunión de Planificación Semanal',
        description: 'Revisar objetivos del proyecto y asignar entregables clave.',
        dateEpochDay: today, startTimeMinutes: 540, durationMinutes: 60,
        category: 'Trabajo', priority: 'Alta', isTask: false, isCompleted: false,
        hasReminder: true, reminderMinutesBefore: 15, createdAtMillis: now
      },
      {
        id: 2, title: 'Presentar Informe de Avance',
        description: 'Enviar PDF resumido con los hitos alcanzados.',
        dateEpochDay: today, startTimeMinutes: 660, durationMinutes: 30,
        category: 'Trabajo', priority: 'Alta', isTask: true, isCompleted: false,
        hasReminder: true, reminderMinutesBefore: 15, createdAtMillis: now
      },
      {
        id: 3, title: 'Caminata y Ejercicio 30 min',
        description: 'Mantener rutina de actividad física y estiramiento diario.',
        dateEpochDay: today, startTimeMinutes: 1080, durationMinutes: 45,
        category: 'Salud', priority: 'Media', isTask: true, isCompleted: true,
        hasReminder: true, reminderMinutesBefore: 15, createdAtMillis: now
      },
      {
        id: 4, title: 'Comprar insumos y lecturas',
        description: 'Pasar por la librería y supermercado.',
        dateEpochDay: today + 1, startTimeMinutes: 600, durationMinutes: 90,
        category: 'Personal', priority: 'Baja', isTask: true, isCompleted: false,
        hasReminder: true, reminderMinutesBefore: 15, createdAtMillis: now
      }
    ],
    notes: [
      {
        id: 1, title: 'Ideas para Proyectos 2026',
        content: '- Sincronización automática con la nube\n- Diseño moderno y modo oscuro\n- Recordatorios diarios personalizados',
        category: 'Ideas', colorHex: '#3F51B5', updatedAtMillis: now, isPinned: true
      },
      {
        id: 2, title: 'Contactos de Interés',
        content: 'Soporte técnico: soporte@agendadigital.app\nTeléfono de consultas: +52 55 1234 5678',
        category: 'Contactos', colorHex: '#00897B', updatedAtMillis: now, isPinned: false
      }
    ],
    habits: [
      { id: 1, title: 'Beber 2 Litros de Agua', category: 'Salud', streakDays: 5, lastCompletedEpochDay: today - 1, targetDaysPerWeek: 7 },
      { id: 2, title: 'Leer 20 Páginas', category: 'Estudios', streakDays: 12, lastCompletedEpochDay: today, targetDaysPerWeek: 7 },
      { id: 3, title: 'Meditación 10 Minutos', category: 'Bienestar', streakDays: 3, lastCompletedEpochDay: today - 1, targetDaysPerWeek: 5 }
    ],
    profile: defaultProfile(),
    syncStatus: 'synced',
    selectedDate: today,
    searchQuery: '',
    selectedCategory: null
  };
  return s;
}

/* ---------------- Date helpers ---------------- */

function toEpochDay(date) {
  return Math.floor(date.getTime() / 86400000);
}

function fromEpochDay(day) {
  return new Date(day * 86400000);
}

function today() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function selectedDate() {
  return fromEpochDay(state.selectedDate);
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function formatTime(minutesFromMidnight) {
  const h = Math.floor(minutesFromMidnight / 60);
  const m = minutesFromMidnight % 60;
  return pad2(h) + ':' + pad2(m);
}

function formatTimeRange(item) {
  const end = Math.min(item.startTimeMinutes + item.durationMinutes, 1439);
  return formatTime(item.startTimeMinutes) + ' - ' + formatTime(end);
}

function formatDateShort(date) {
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) + ', ' + formatTime(date.getHours() * 60 + date.getMinutes());
}

function formatLastSync(millis) {
  return new Date(millis).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/* ---------------- Utilities ---------------- */

function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function categoryColor(cat) {
  return CATEGORY_COLORS[(cat || '').toLowerCase()] || CATEGORY_COLORS.recordatorio;
}

function priorityColor(prio) {
  return PRIORITY_COLORS[(prio || '').toLowerCase()] || PRIORITY_COLORS.media;
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function nextId(list) {
  return list.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0) + 1;
}

let toastTimer = null;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 3000);
}

/* ---------------- Filtering ---------------- */

function filteredAgendaItems() {
  const items = state.agendaItems.filter((i) => Number(i.dateEpochDay) === Number(state.selectedDate));
  const q = state.searchQuery.trim().toLowerCase();
  let out = items;
  if (q) {
    out = out.filter((i) => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
  }
  if (state.selectedCategory) {
    out = out.filter((i) => i.category.toLowerCase() === state.selectedCategory.toLowerCase());
  }
  return out.slice().sort((a, b) => a.startTimeMinutes - b.startTimeMinutes);
}

function filteredNotes() {
  const q = state.searchQuery.trim().toLowerCase();
  let out = state.notes;
  if (q) {
    out = out.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
  }
  return out.slice().sort((a, b) => (b.isPinned - a.isPinned) || (b.updatedAtMillis - a.updatedAtMillis));
}

/* ---------------- Rendering ---------------- */

function renderAll() {
  renderAgenda();
  renderTasks();
  renderNotes();
  renderCloud();
}

function renderAgenda() {
  const date = selectedDate();
  document.getElementById('month-year').textContent = MONTHS[date.getMonth()] + ' ' + date.getFullYear();

  const daysEl = document.getElementById('days-strip');
  const todayEpoch = toEpochDay(today());
  const start = state.selectedDate - 3;
  daysEl.innerHTML = '';
  for (let i = 0; i < 7; i++) {
    const day = start + i;
    const d = fromEpochDay(day);
    const isSelected = day === Number(state.selectedDate);
    const isToday = day === todayEpoch;
    const cls = ['day-cell', isSelected ? 'selected' : '', isToday ? 'today' : ''].join(' ').trim();
    const btn = document.createElement('button');
    btn.className = cls;
    btn.dataset.action = 'date-select';
    btn.dataset.day = day;
    btn.innerHTML = `<div class="day-name">${DAY_SHORT[d.getDay()]}</div><div class="day-num">${d.getDate()}</div>`;
    daysEl.appendChild(btn);
  }

  const dayItems = state.agendaItems.filter((i) => Number(i.dateEpochDay) === Number(state.selectedDate));
  const tasksCount = dayItems.filter((i) => i.isTask).length;
  const completedCount = dayItems.filter((i) => i.isTask && i.isCompleted).length;

  const banner = document.getElementById('progress-banner');
  if (tasksCount > 0) {
    banner.classList.remove('hidden');
    document.getElementById('progress-text').textContent = `Progreso del Día: ${completedCount}/${tasksCount} tareas`;
    document.getElementById('progress-fill').style.width = `${tasksCount ? Math.round((completedCount / tasksCount) * 100) : 0}%`;
  } else {
    banner.classList.add('hidden');
  }

  const chips = document.getElementById('category-chips');
  chips.innerHTML = '';
  const allChip = document.createElement('button');
  allChip.className = 'chip' + (state.selectedCategory == null ? ' selected' : '');
  allChip.dataset.action = 'category-filter';
  allChip.dataset.cat = '';
  allChip.textContent = 'Todas';
  chips.appendChild(allChip);
  CATEGORIES.forEach((cat) => {
    const c = document.createElement('button');
    c.className = 'chip' + (state.selectedCategory === cat ? ' selected' : '');
    c.dataset.action = 'category-filter';
    c.dataset.cat = cat;
    c.textContent = cat;
    chips.appendChild(c);
  });

  const title = document.getElementById('agenda-day-title');
  title.textContent = `Agenda del Día (${filteredAgendaItems().length})`;

  const list = document.getElementById('agenda-list');
  const items = filteredAgendaItems();
  if (items.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="empty-title">¡Sin pendientes para esta fecha!</div><div class="empty-sub">Presiona '+' para agendar un evento, tarea o recordatorio.</div></div>`;
  } else {
    list.innerHTML = items.map(itemCardHTML).join('');
  }
}

function itemCardHTML(item) {
  const cat = categoryColor(item.category);
  const prio = priorityColor(item.priority);
  const done = !!item.isCompleted;
  const iconLeft = item.isTask
    ? `<button class="checkbox ${done ? 'checked' : ''}" data-action="toggle-task" data-id="${item.id}" aria-label="Completar tarea">${done ? SVG.check : ''}</button>`
    : `<span class="event-icon" style="background:${hexToRgba(cat, 0.15)}">${SVG.clock}</span>`;

  return `
  <div class="item-card ${done ? 'completed' : ''}">
    <span class="prio-bar" style="background:${prio}"></span>
    ${iconLeft}
    <div class="item-body" data-action="edit-item" data-id="${item.id}">
      <div class="item-top">
        <span class="item-title">${esc(item.title)}</span>
        <span class="item-time">${formatTimeRange(item)}</span>
      </div>
      ${item.description ? `<div class="item-desc">${esc(item.description)}</div>` : ''}
      <div class="item-tags">
        <span class="badge badge-cat" style="color:${cat};background:${hexToRgba(cat, 0.18)}">${esc(item.category)}</span>
        <span class="badge badge-prio ${item.priority.toLowerCase()}" style="color:${prio};background:${hexToRgba(prio, 0.15)}">Prioridad ${esc(item.priority)}</span>
        ${item.hasReminder ? `<span class="reminder-ico">${SVG.bell}</span>` : ''}
      </div>
    </div>
    <button class="delete-btn" data-action="delete-item" data-id="${item.id}" aria-label="Eliminar">${SVG.trash}</button>
  </div>`;
}

function renderTasks() {
  const tasks = state.agendaItems.filter((i) => i.isTask);
  const pending = document.getElementById('chip-pending');
  const showPending = pending.classList.contains('active-filter');
  pending.textContent = showPending ? 'Mostrar Todas' : 'Solo Pendientes';
  pending.classList.toggle('active-filter', showPending);

  document.getElementById('tasks-title').textContent = showPending ? 'Tareas Pendientes' : `Todas las Tareas (${tasks.length})`;

  const list = document.getElementById('tasks-list');
  const filtered = showPending ? tasks.filter((t) => !t.isCompleted) : tasks;
  if (filtered.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="empty-title">¡Excelente! No hay tareas pendientes.</div><div class="empty-sub">Añade una nueva tarea desde el botón '+'.</div></div>`;
  } else {
    list.innerHTML = filtered.slice().sort((a, b) => (a.isCompleted - b.isCompleted) || (a.startTimeMinutes - b.startTimeMinutes)).map(itemCardHTML).join('');
  }

  const habitList = document.getElementById('habits-list');
  if (state.habits.length === 0) {
    habitList.innerHTML = `<div class="empty-state"><div class="empty-title">Aún no tienes hábitos.</div><div class="empty-sub">Añade hábitos diarios para dar seguimiento a tus rachas.</div></div>`;
  } else {
    habitList.innerHTML = state.habits.map(habitCardHTML).join('');
  }

  const tabs = document.querySelectorAll('.tab[data-ttab]');
  tabs.forEach((t) => t.classList.toggle('active', t.dataset.ttab === 'tasks' || t.dataset.ttab === (getTTab())));
}

let ttab = 'tasks';
function getTTab() {
  return ttab;
}

function habitCardHTML(habit) {
  const done = Number(habit.lastCompletedEpochDay) === toEpochDay(today());
  return `
  <div class="habit-card">
    <div class="habit-left">
      <span class="habit-fire">${SVG.fire}</span>
      <div>
        <div class="habit-title">${esc(habit.title)}</div>
        <div class="habit-meta"><span class="habit-streak">Racha: ${habit.streakDays} días</span><span>• Meta: ${habit.targetDaysPerWeek}d/sem</span></div>
      </div>
    </div>
    <div class="habit-right">
      <button class="habit-check ${done ? 'done' : ''}" data-action="toggle-habit" data-id="${habit.id}" aria-label="Completar hábito hoy">${SVG.check}</button>
      <button class="delete-btn" data-action="delete-habit" data-id="${habit.id}" aria-label="Eliminar hábito">${SVG.trash}</button>
    </div>
  </div>`;
}

function renderNotes() {
  const notes = filteredNotes();
  const pinned = notes.filter((n) => n.isPinned);
  const others = notes.filter((n) => !n.isPinned);

  const pinnedSection = document.getElementById('pinned-section');
  const pinnedList = document.getElementById('pinned-list');
  pinnedSection.classList.toggle('hidden', pinned.length === 0);
  pinnedList.innerHTML = pinned.map(noteCardHTML).join('');

  document.getElementById('notes-title').textContent = pinned.length > 0 ? 'Otras Notas' : `Todas las Notas (${notes.length})`;

  const list = document.getElementById('notes-list');
  if (notes.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="empty-title">No hay notas aún.</div><div class="empty-sub">Crea una nueva nota o bitácora personal desde el botón '+'.</div></div>`;
  } else {
    list.innerHTML = others.map(noteCardHTML).join('');
  }
}

function noteCardHTML(note) {
  const accent = note.colorHex || '#3F51B5';
  return `
  <div class="note-card">
    <div class="note-inner" style="background:${hexToRgba(accent, 0.08)}">
      <div class="note-top">
        <div class="note-title-wrap" data-action="edit-note" data-id="${note.id}">
          <span class="note-dot" style="background:${accent}"></span>
          <span class="note-title">${esc(note.title)}</span>
        </div>
        <div class="note-actions">
          <button class="icon-btn" data-action="toggle-note-pin" data-id="${note.id}" aria-label="Fijar nota" style="color:${note.isPinned ? accent : ''}">${note.isPinned ? SVG.pushpin : SVG.pushpinOff}</button>
          <button class="delete-btn" data-action="delete-note" data-id="${note.id}" aria-label="Eliminar nota">${SVG.trash}</button>
        </div>
      </div>
      <div class="note-content">${esc(note.content)}</div>
      <div class="note-footer">
        <span class="badge badge-cat" style="color:${accent};background:${hexToRgba(accent, 0.18)}">${esc(note.category)}</span>
        <span class="note-date">${formatDateShort(fromEpochDay(Math.floor(note.updatedAtMillis / 86400000)))}</span>
      </div>
    </div>
  </div>`;
}

function renderCloud() {
  const p = state.profile;
  document.getElementById('profile-name').textContent = p.userName;
  document.getElementById('profile-email').textContent = p.userEmail;
  document.getElementById('last-sync').textContent = 'Última copia: ' + formatLastSync(p.lastSyncTimeMillis);
  document.getElementById('backup-count').textContent = p.cloudBackupCount + ' Respaldos en nube';

  const syncing = state.syncStatus === 'syncing';
  document.getElementById('sync-dot').classList.toggle('syncing', syncing);
  document.getElementById('sync-text').textContent = syncing ? 'Sincronizando...' : 'Nube conectada';
  document.getElementById('cloud-sync-dot').classList.toggle('syncing', syncing);
  document.getElementById('cloud-sync-text').textContent = syncing ? 'Sincronizando cambios...' : 'Sincronizado';
}

/* ---------------- Navigation ---------------- */

function switchTab(tab) {
  ['agenda', 'tasks', 'notes', 'cloud'].forEach((t) => {
    document.getElementById('screen-' + t).classList.toggle('hidden', t !== tab);
  });
  document.querySelectorAll('.nav-item').forEach((b) => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
  window.scrollTo({ top: 0 });
}

function switchTTab(t) {
  ttab = t;
  document.getElementById('tasks-view').classList.toggle('hidden', t !== 'tasks');
  document.getElementById('habits-view').classList.toggle('hidden', t !== 'habits');
  document.querySelectorAll('.tab[data-ttab]').forEach((b) => b.classList.toggle('active', b.dataset.ttab === t));
}

/* ---------------- Sync / Cloud ---------------- */

function performSync(delayMs) {
  state.syncStatus = 'syncing';
  renderCloud();
  return new Promise((resolve) => {
    setTimeout(() => {
      state.syncStatus = 'synced';
      const p = state.profile;
      p.lastSyncTimeMillis = Date.now();
      if (delayMs > 900) {
        p.cloudBackupCount += 1;
        p.storageUsedMb = Math.round((p.storageUsedMb + 0.1) * 100) / 100;
      }
      state.agendaItems.forEach((i) => { i.isSynced = true; });
      saveState();
      renderCloud();
      resolve();
    }, delayMs || 800);
  });
}

async function triggerAutoSync() {
  if (state.profile.isAutoSync) {
    await performSync(800);
  }
}

async function performManualCloudSync() {
  const btn = document.getElementById('btn-manual-sync');
  btn.disabled = true;
  await performSync(1200);
  btn.disabled = false;
  toast('Datos sincronizados con la nube');
}

/* ---------------- Notifications ---------------- */

async function testNotification() {
  const dayItems = state.agendaItems.filter((i) => Number(i.dateEpochDay) === Number(state.selectedDate));
  const pendingCount = dayItems.filter((i) => i.isTask && !i.isCompleted).length;
  const msg = pendingCount > 0
    ? `AgendaDigital: Tienes ${pendingCount} tareas pendientes para hoy.`
    : 'AgendaDigital: ¡Agenda al día! No tienes eventos pendientes.';

  if (!('Notification' in window)) {
    toast('Las notificaciones no están disponibles en este navegador.');
    return;
  }
  const perm = await Notification.requestPermission();
  if (perm === 'granted') {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification('Resumen Diario de AgendaDigital', {
        body: msg,
        icon: './icons/icon-192.png',
        badge: './icons/icon-192.png'
      });
    } catch (e) {
      new Notification('Resumen Diario de AgendaDigital', { body: msg, icon: './icons/icon-192.png' });
    }
    toast('Notificación enviada');
  } else {
    toast('Permiso de notificaciones denegado.');
  }
}

/* ---------------- Export ---------------- */

function exportDataAsJson() {
  const items = filteredAgendaItems();
  const payload = {
    appName: 'AgendaDigital',
    exportDateMillis: Date.now(),
    items: items.map((i) => ({
      title: i.title,
      description: i.description,
      category: i.category,
      priority: i.priority,
      isTask: i.isTask,
      isCompleted: i.isCompleted
    }))
  };
  showExportDialog(JSON.stringify(payload, null, 2));
}

function showExportDialog(json) {
  const overlay = document.getElementById('dialog-overlay');
  document.getElementById('dialog').innerHTML = `
    <div class="dialog-title">Respaldo Exportado (JSON)</div>
    <label class="field-label">Datos en la Nube</label>
    <textarea class="export-text" readonly>${esc(json)}</textarea>
    <div class="dialog-actions">
      <button class="btn-cancel" data-action="close-dialog">Cerrar</button>
    </div>`;
  overlay.classList.remove('hidden');
}

/* ---------------- Add/Edit Dialog ---------------- */

function openAddDialog() {
  buildDialog('event', null, null, null);
}

function openEditItem(id) {
  const item = state.agendaItems.find((i) => Number(i.id) === Number(id));
  if (item) buildDialog(item.isTask ? 'task' : 'event', item, null, null);
}

function openEditNote(id) {
  const note = state.notes.find((n) => Number(n.id) === Number(id));
  if (note) buildDialog('note', null, note, null);
}

function openEditHabit(id) {
  const habit = state.habits.find((h) => Number(h.id) === Number(id));
  if (habit) buildDialog('habit', null, null, habit);
}

function buildDialog(type, item, note, habit) {
  const overlay = document.getElementById('dialog-overlay');
  const isEdit = !!(item || note || habit);
  const title = isEdit ? 'Editar Elemento' : 'Añadir a AgendaDigital';

  let html = `<div class="dialog-title">${title}</div>`;

  if (!isEdit) {
    html += `
      <div class="dialog-tabs">
        <button class="tab ${type === 'event' ? 'active' : ''}" data-dtype="event">Evento</button>
        <button class="tab ${type === 'task' ? 'active' : ''}" data-dtype="task">Tarea</button>
        <button class="tab ${type === 'note' ? 'active' : ''}" data-dtype="note">Nota</button>
        <button class="tab ${type === 'habit' ? 'active' : ''}" data-dtype="habit">Hábito</button>
      </div>`;
  }

  const v = {
    title: item?.title || note?.title || habit?.title || '',
    description: item?.description || note?.content || '',
    category: item?.category || note?.category || habit?.category || 'Trabajo',
    priority: item?.priority || 'Media',
    startHour: item ? Math.floor(item.startTimeMinutes / 60) : 9,
    startMinute: item ? item.startTimeMinutes % 60 : 0,
    durationMinutes: item?.durationMinutes || 60,
    hasReminder: item ? item.hasReminder : true,
    colorHex: note?.colorHex || '#3F51B5',
    targetDays: habit?.targetDaysPerWeek || 7
  };

  html += `
    <label class="field-label">Título *</label>
    <input id="d-title" class="input" type="text" value="${esc(v.title)}" placeholder="Título" />

    ${type !== 'habit' ? `
      <label class="field-label">${type === 'note' ? 'Contenido de la nota *' : 'Detalles o Notas'}</label>
      <textarea id="d-description" class="textarea" placeholder="${type === 'note' ? 'Escribe tu nota...' : 'Detalles'}" style="${type === 'note' ? 'min-height:120px;' : ''}">${esc(v.description)}</textarea>
    ` : ''}

    <label class="field-label">Categoría:</label>
    <div class="chip-group" id="d-cats">
      ${CATEGORIES.map((c) => `<button type="button" class="chip ${v.category === c ? 'selected' : ''}" data-cat="${c}">${c}</button>`).join('')}
    </div>

    ${type === 'event' || type === 'task' ? `
      <label class="field-label">Hora de inicio (00:00 - 23:59):</label>
      <div class="time-row">
        <input id="d-hour" class="input" type="number" min="0" max="23" value="${v.startHour}" aria-label="Hora" />
        <input id="d-minute" class="input" type="number" min="0" max="59" value="${v.startMinute}" aria-label="Minuto" />
      </div>

      <label class="field-label">Prioridad:</label>
      <div class="chip-group" id="d-prios">
        ${PRIORITIES.map((p) => `<button type="button" class="chip ${v.priority === p ? 'selected' : ''}" data-prio="${p}">${p}</button>`).join('')}
      </div>

      <div class="switch-row">
        <span>Activar Recordatorio Diario</span>
        <label class="switch">
          <input id="d-reminder" type="checkbox" ${v.hasReminder ? 'checked' : ''} />
          <span class="slider-track"></span>
        </label>
      </div>
    ` : ''}

    ${type === 'note' ? `
      <label class="field-label">Color de la nota:</label>
      <div class="color-dots" id="d-colors">
        ${NOTE_COLORS.map((c) => `<button type="button" class="color-dot ${v.colorHex === c ? 'selected' : ''}" data-color="${c}" style="background:${c}"></button>`).join('')}
      </div>
    ` : ''}

    ${type === 'habit' ? `
      <label class="field-label">Días meta por semana (<span id="d-target-label">${v.targetDays}</span> días):</label>
      <div class="range-row">
        <input id="d-target" type="range" min="1" max="7" step="1" value="${v.targetDays}" />
        <span class="range-value" id="d-target-val">${v.targetDays}d</span>
      </div>
    ` : ''}
  `;

  html += `
    <div class="dialog-actions">
      <button class="btn-cancel" data-action="close-dialog">Cancelar</button>
      <button class="btn-save" data-action="save-dialog">Guardar</button>
    </div>`;

  document.getElementById('dialog').innerHTML = html;
  document.getElementById('dialog').dataset.dtype = type;
  document.getElementById('dialog').dataset.editId = item ? item.id : (note ? note.id : habit ? habit.id : '');
  overlay.classList.remove('hidden');

  const cats = document.getElementById('d-cats');
  if (cats) cats.querySelectorAll('.chip').forEach((c) => {
    c.addEventListener('click', () => {
      cats.querySelectorAll('.chip').forEach((x) => x.classList.remove('selected'));
      c.classList.add('selected');
    });
  });
  const prios = document.getElementById('d-prios');
  if (prios) prios.querySelectorAll('.chip').forEach((p) => {
    p.addEventListener('click', () => {
      prios.querySelectorAll('.chip').forEach((x) => x.classList.remove('selected'));
      p.classList.add('selected');
    });
  });
  const colors = document.getElementById('d-colors');
  if (colors) colors.querySelectorAll('.color-dot').forEach((c) => {
    c.addEventListener('click', () => {
      colors.querySelectorAll('.color-dot').forEach((x) => x.classList.remove('selected'));
      c.classList.add('selected');
    });
  });
  const target = document.getElementById('d-target');
  if (target) {
    target.addEventListener('input', () => {
      document.getElementById('d-target-val').textContent = target.value + 'd';
      document.getElementById('d-target-label').textContent = target.value;
    });
  }
}

function saveDialog() {
  const dialog = document.getElementById('dialog');
  const type = dialog.dataset.dtype;
  const editId = Number(dialog.dataset.editId) || 0;
  const title = document.getElementById('d-title').value.trim();
  if (!title) {
    toast('El título es obligatorio');
    return;
  }
  const description = document.getElementById('d-description') ? document.getElementById('d-description').value : '';
  const selectedCat = dialog.querySelector('#d-cats .chip.selected')?.dataset.cat || 'Trabajo';

  if (type === 'event' || type === 'task') {
    const hour = Math.max(0, Math.min(23, Number(document.getElementById('d-hour').value) || 0));
    const minute = Math.max(0, Math.min(59, Number(document.getElementById('d-minute').value) || 0));
    const priority = dialog.querySelector('#d-prios .chip.selected')?.dataset.prio || 'Media';
    const hasReminder = document.getElementById('d-reminder').checked;
    const existing = state.agendaItems.find((i) => Number(i.id) === editId);
    const item = {
      id: editId || nextId(state.agendaItems),
      title,
      description,
      dateEpochDay: existing ? existing.dateEpochDay : state.selectedDate,
      startTimeMinutes: hour * 60 + minute,
      durationMinutes: existing?.durationMinutes || 60,
      category: selectedCat,
      priority,
      isTask: type === 'task',
      isCompleted: existing?.isCompleted || false,
      hasReminder,
      reminderMinutesBefore: 15,
      createdAtMillis: existing?.createdAtMillis || Date.now()
    };
    if (editId) {
      state.agendaItems = state.agendaItems.map((i) => Number(i.id) === editId ? item : i);
    } else {
      state.agendaItems.push(item);
    }
    closeDialog();
    renderAll();
    triggerAutoSync();
    toast(type === 'task' ? 'Tarea guardada' : 'Evento guardado');
  } else if (type === 'note') {
    const colorHex = dialog.querySelector('#d-colors .color-dot.selected')?.dataset.color || '#3F51B5';
    const existing = state.notes.find((n) => Number(n.id) === editId);
    const note = {
      id: editId || nextId(state.notes),
      title,
      content: description,
      category: selectedCat,
      colorHex,
      updatedAtMillis: Date.now(),
      isPinned: existing?.isPinned || false
    };
    if (editId) {
      state.notes = state.notes.map((n) => Number(n.id) === editId ? note : n);
    } else {
      state.notes.push(note);
    }
    closeDialog();
    renderAll();
    triggerAutoSync();
    toast('Nota guardada');
  } else if (type === 'habit') {
    const targetDays = Number(document.getElementById('d-target').value) || 7;
    const existing = state.habits.find((h) => Number(h.id) === editId);
    const habit = {
      id: editId || nextId(state.habits),
      title,
      category: selectedCat,
      streakDays: existing?.streakDays || 0,
      lastCompletedEpochDay: existing?.lastCompletedEpochDay || -1,
      targetDaysPerWeek: targetDays,
      iconName: 'CheckCircle'
    };
    if (editId) {
      state.habits = state.habits.map((h) => Number(h.id) === editId ? habit : h);
    } else {
      state.habits.push(habit);
    }
    closeDialog();
    renderAll();
    triggerAutoSync();
    toast('Hábito guardado');
  }
  saveState();
}

function closeDialog() {
  document.getElementById('dialog-overlay').classList.add('hidden');
  document.getElementById('dialog').innerHTML = '';
}

/* ---------------- Actions ---------------- */

function toggleTask(id) {
  const item = state.agendaItems.find((i) => Number(i.id) === Number(id));
  if (!item) return;
  item.isCompleted = !item.isCompleted;
  saveState();
  renderAll();
  triggerAutoSync();
}

function deleteItem(id) {
  state.agendaItems = state.agendaItems.filter((i) => Number(i.id) !== Number(id));
  saveState();
  renderAll();
  triggerAutoSync();
  toast('Elemento eliminado');
}

function toggleNotePin(id) {
  const note = state.notes.find((n) => Number(n.id) === Number(id));
  if (!note) return;
  note.isPinned = !note.isPinned;
  note.updatedAtMillis = Date.now();
  saveState();
  renderNotes();
}

function deleteNote(id) {
  state.notes = state.notes.filter((n) => Number(n.id) !== Number(id));
  saveState();
  renderNotes();
  triggerAutoSync();
  toast('Nota eliminada');
}

function toggleHabit(id) {
  const habit = state.habits.find((h) => Number(h.id) === Number(id));
  if (!habit) return;
  const todayEpoch = toEpochDay(today());
  if (Number(habit.lastCompletedEpochDay) === todayEpoch) {
    habit.streakDays = Math.max(0, (habit.streakDays || 1) - 1);
    habit.lastCompletedEpochDay = -1;
  } else {
    habit.streakDays = (habit.streakDays || 0) + 1;
    habit.lastCompletedEpochDay = todayEpoch;
  }
  saveState();
  renderTasks();
  triggerAutoSync();
}

function deleteHabit(id) {
  state.habits = state.habits.filter((h) => Number(h.id) !== Number(id));
  saveState();
  renderTasks();
  triggerAutoSync();
  toast('Hábito eliminado');
}

/* ---------------- Install Prompt ---------------- */

let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

function promptInstall() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => { deferredPrompt = null; });
  } else {
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOS) {
      toast('En iOS: pulsa Compartir (botón cuadrado con flecha ↑) y elige "Agregar a la pantalla de inicio".');
    } else {
      toast('Usa el menú del navegador > "Añadir a la pantalla de inicio" para instalar la app.');
    }
  }
}

/* ---------------- Event Wiring ---------------- */

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;

  switch (action) {
    case 'nav-tab':
      switchTab(el.dataset.tab);
      break;
    case 'date-select':
      state.selectedDate = Number(el.dataset.day);
      saveState();
      renderAgenda();
      break;
    case 'category-filter':
      state.selectedCategory = el.dataset.cat === '' ? null : el.dataset.cat;
      saveState();
      renderAgenda();
      break;
    case 'toggle-task':
      toggleTask(el.dataset.id);
      break;
    case 'edit-item':
      openEditItem(el.dataset.id);
      break;
    case 'delete-item':
      deleteItem(el.dataset.id);
      break;
    case 'toggle-habit':
      toggleHabit(el.dataset.id);
      break;
    case 'delete-habit':
      deleteHabit(el.dataset.id);
      break;
    case 'toggle-note-pin':
      toggleNotePin(el.dataset.id);
      break;
    case 'edit-note':
      openEditNote(el.dataset.id);
      break;
    case 'delete-note':
      deleteNote(el.dataset.id);
      break;
    case 'save-dialog':
      saveDialog();
      break;
    case 'close-dialog':
      closeDialog();
      break;
    case 'ttab':
      switchTTab(el.dataset.ttab);
      break;
  }
});

document.addEventListener('change', (e) => {
  const el = e.target;
  if (el.id === 'chip-pending') return;
  if (el.classList && el.classList.contains('dtype-btn')) return;
});

document.getElementById('btn-sync').addEventListener('click', performManualCloudSync);
document.getElementById('btn-add').addEventListener('click', openAddDialog);
document.getElementById('btn-manual-sync').addEventListener('click', performManualCloudSync);
document.getElementById('btn-test-notif').addEventListener('click', testNotification);
document.getElementById('btn-export').addEventListener('click', exportDataAsJson);
document.getElementById('btn-prev-month').addEventListener('click', () => {
  const d = fromEpochDay(state.selectedDate);
  state.selectedDate = toEpochDay(new Date(d.getFullYear(), d.getMonth() - 1, d.getDate()));
  saveState();
  renderAgenda();
});
document.getElementById('btn-next-month').addEventListener('click', () => {
  const d = fromEpochDay(state.selectedDate);
  state.selectedDate = toEpochDay(new Date(d.getFullYear(), d.getMonth() + 1, d.getDate()));
  saveState();
  renderAgenda();
});
document.getElementById('btn-today').addEventListener('click', () => {
  state.selectedDate = toEpochDay(today());
  saveState();
  renderAgenda();
});
document.getElementById('input-search').addEventListener('input', (e) => {
  state.searchQuery = e.target.value;
  renderAgenda();
  renderNotes();
});
document.getElementById('chip-pending').addEventListener('click', () => {
  document.getElementById('chip-pending').classList.toggle('active-filter');
  renderTasks();
});
document.getElementById('dialog-overlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeDialog();
});

document.querySelectorAll('.nav-item').forEach((b) => {
  b.addEventListener('click', () => switchTab(b.dataset.tab));
});
document.querySelectorAll('.tab[data-ttab]').forEach((b) => {
  b.addEventListener('click', () => switchTTab(b.dataset.ttab));
});
document.querySelectorAll('#dialog .dialog-tabs .tab').forEach(() => {});

document.addEventListener('click', (e) => {
  const t = e.target.closest('.dialog-tabs .tab');
  if (!t) return;
  const dialog = document.getElementById('dialog');
  const type = t.dataset.dtype;
  document.querySelectorAll('.dialog-tabs .tab').forEach((x) => x.classList.remove('active'));
  t.classList.add('active');
  const editId = dialog.dataset.editId;
  const existingItem = state.agendaItems.find((i) => Number(i.id) === Number(editId));
  const existingNote = state.notes.find((n) => Number(n.id) === Number(editId));
  const existingHabit = state.habits.find((h) => Number(h.id) === Number(editId));
  buildDialog(type, existingItem, existingNote, existingHabit);
});

/* ---------------- Init ---------------- */

document.addEventListener('DOMContentLoaded', () => {
  switchTTab('tasks');
  renderAll();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch((err) => {
      console.warn('No se pudo registrar el service worker', err);
    });
  }

  document.getElementById('app-logo').addEventListener('click', promptInstall);
});
