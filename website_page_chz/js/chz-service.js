/* =============================================
   Страница «Фиксация кодов „Честный ЗНАК“ при отгрузке груза»
   1. События аналитики (ТЗ, раздел 6)
   2. Форма заявки: view / start / submit
   3. Поле даты: маска ДД.ММ.ГГГГ + календарь в стиле сайта
   4. Выпадающие списки в стиле календаря (вместо нативного select)
   Без зависимостей. Подключать с defer.
   ============================================= */

/* Номер счётчика Яндекс Метрики — заполнить при подключении.
   Если не задан, события уходят только в window.dataLayer. */
const CHZ_YM_COUNTER_ID = null;

function chzTrack(eventName) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName });
  if (CHZ_YM_COUNTER_ID && typeof window.ym === 'function') {
    window.ym(CHZ_YM_COUNTER_ID, 'reachGoal', eventName);
  }
}

/* ---- Клики: телефон, хранение, главная, статьи, личный кабинет ----
   Разметка: <a ... data-chz-event="chz_outbound_storage_click"> */
function initClickEvents() {
  document.addEventListener('click', (event) => {
    const link = event.target.closest('[data-chz-event]');
    if (link) {
      chzTrack(link.dataset.chzEvent);
      return;
    }
    // телефон — в шапке и подвале сайта (в контенте страницы его нет)
    if (event.target.closest('a[href^="tel:"]')) chzTrack('chz_outbound_phone_click');
  });
}

/* ---- Форма ---- */
function initForm() {
  const wrap = document.getElementById('chz-form');
  if (!wrap) return;
  const form = wrap.querySelector('form');

  // chz_outbound_form_view — форма появилась на экране
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        chzTrack('chz_outbound_form_view');
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    observer.observe(wrap);
  }

  // chz_outbound_form_start — первое взаимодействие с полем
  form.addEventListener('focusin', () => chzTrack('chz_outbound_form_start'), { once: true });

  // chz_outbound_form_submit — успешная отправка Contact Form 7
  wrap.addEventListener('wpcf7mailsent', () => chzTrack('chz_outbound_form_submit'));

  // Прототип: без CF7 показываем сообщение после отправки
  if (form.hasAttribute('data-prototype')) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      chzTrack('chz_outbound_form_submit');
      form.hidden = true;
      wrap.querySelector('[data-form-success]').hidden = false;
    });
  }
}

/* ---- Поле даты: ручной ввод по маске ДД.ММ.ГГГГ + календарь ----
   Разметка: <span class="chz_date"><input type="text" data-datepicker></span>.
   Календарь открывается по клику или фокусу на поле, ввод с клавиатуры
   остается доступен; прошедшие даты недоступны. */
const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function pad(n) {
  return String(n).padStart(2, '0');
}

function formatDate(date) {
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

function parseDate(value) {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);
  if (!m) return null;
  const date = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  // отсекаем несуществующие даты вроде 31.02
  return date.getDate() === Number(m[1]) && date.getMonth() === Number(m[2]) - 1 ? date : null;
}

function initDatepicker(input) {
  const wrap = input.parentElement;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let selected = null;
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();

  const picker = document.createElement('div');
  picker.className = 'chz_datepicker';
  picker.setAttribute('role', 'dialog');
  picker.setAttribute('aria-label', 'Выбор даты');
  picker.hidden = true;
  wrap.append(picker);

  function render() {
    const first = new Date(viewYear, viewMonth, 1);
    const offset = (first.getDay() + 6) % 7; // неделя с понедельника
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

    let cells = WEEKDAYS.map((d) => `<span class="chz_datepicker_weekday">${d}</span>`).join('');
    cells += '<span></span>'.repeat(offset);
    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(viewYear, viewMonth, day);
      const classes = ['chz_datepicker_day'];
      if (date.getTime() === today.getTime()) classes.push('is-today');
      if (selected && date.getTime() === selected.getTime()) classes.push('is-selected');
      cells += `<button type="button" class="${classes.join(' ')}" data-day="${day}" ${date < today ? 'disabled' : ''} aria-label="${formatDate(date)}">${day}</button>`;
    }

    picker.innerHTML = `
      <div class="chz_datepicker_head">
        <button type="button" class="chz_datepicker_nav" data-step="-1" aria-label="Предыдущий месяц" ${isCurrentMonth ? 'disabled' : ''}></button>
        <p class="chz_datepicker_title">${MONTHS[viewMonth]} ${viewYear}</p>
        <button type="button" class="chz_datepicker_nav" data-step="1" aria-label="Следующий месяц"></button>
      </div>
      <div class="chz_datepicker_grid">${cells}</div>`;
  }

  function open() {
    const parsed = parseDate(input.value);
    if (parsed) {
      selected = parsed;
      viewYear = parsed.getFullYear();
      viewMonth = parsed.getMonth();
    }
    render();
    picker.hidden = false;
    // если снизу не хватает места на экране — открываем календарь вверх
    const below = window.innerHeight - input.getBoundingClientRect().bottom;
    const above = input.getBoundingClientRect().top;
    picker.classList.toggle('is-up', below < picker.offsetHeight + 8 && above > below);
    input.setAttribute('aria-expanded', 'true');
  }

  function close() {
    picker.hidden = true;
    input.setAttribute('aria-expanded', 'false');
  }

  function validate() {
    const date = parseDate(input.value);
    if (input.value && (!date || date < today)) {
      input.setCustomValidity('Введите будущую дату в формате ДД.ММ.ГГГГ');
    } else {
      input.setCustomValidity('');
    }
  }

  input.addEventListener('focus', open);
  input.addEventListener('click', open);

  // маска: только цифры, точки ставятся автоматически
  input.addEventListener('input', () => {
    const digits = input.value.replace(/\D/g, '').slice(0, 8);
    input.value = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join('.');
    const date = parseDate(input.value);
    if (date) {
      selected = date;
      viewYear = date.getFullYear();
      viewMonth = date.getMonth();
      if (!picker.hidden) render();
    }
    validate();
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !picker.hidden) {
      event.stopPropagation(); // не закрывать модальное окно вместе с календарем
      close();
    }
    if (event.key === 'Tab') close();
  });

  input.addEventListener('blur', validate);

  picker.addEventListener('click', (event) => {
    const nav = event.target.closest('[data-step]');
    if (nav) {
      viewMonth += Number(nav.dataset.step);
      if (viewMonth < 0) { viewMonth = 11; viewYear -= 1; }
      if (viewMonth > 11) { viewMonth = 0; viewYear += 1; }
      render();
      return;
    }
    const dayBtn = event.target.closest('[data-day]');
    if (dayBtn) {
      selected = new Date(viewYear, viewMonth, Number(dayBtn.dataset.day));
      input.value = formatDate(selected);
      validate();
      close();
    }
  });

  document.addEventListener('mousedown', (event) => {
    if (!wrap.contains(event.target)) close();
  });
}

/* ---- Выпадающие списки в стиле календаря ----
   Нативный <select> остаётся в форме (значение уходит в CF7), но скрыт;
   вместо него — кнопка и список role="listbox". Пункт с пустым value
   («Выберите») — подсказка, в список не попадает. */
function initSelect(select) {
  const wrap = select.parentElement;
  const label = document.querySelector(`label[for="${select.id}"]`);
  const placeholder = [...select.options].find((o) => o.value === '');
  const choices = [...select.options].filter((o) => o !== placeholder);
  let active = -1;

  wrap.classList.add('chz_select', 'is-enhanced');
  select.tabIndex = -1;
  select.setAttribute('aria-hidden', 'true');

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'chz_select_btn';
  btn.id = `${select.id}-btn`;
  btn.setAttribute('aria-haspopup', 'listbox');
  btn.setAttribute('aria-expanded', 'false');
  if (label) {
    label.id = label.id || `${select.id}-label`;
    btn.setAttribute('aria-labelledby', `${label.id} ${btn.id}`);
    label.htmlFor = btn.id;
  }

  const list = document.createElement('ul');
  list.className = 'chz_listbox';
  list.id = `${select.id}-list`;
  list.setAttribute('role', 'listbox');
  list.hidden = true;
  btn.setAttribute('aria-controls', list.id);

  choices.forEach((option, index) => {
    const li = document.createElement('li');
    li.className = 'chz_listbox_option';
    li.id = `${select.id}-opt-${index}`;
    li.setAttribute('role', 'option');
    li.textContent = option.text;
    list.append(li);
  });
  const items = [...list.children];

  wrap.append(btn, list);

  function syncButton() {
    const current = select.selectedOptions[0];
    const empty = !current || current === placeholder;
    btn.textContent = empty ? (placeholder ? placeholder.text : '') : current.text;
    btn.classList.toggle('is-placeholder', empty);
    items.forEach((li) => {
      li.setAttribute('aria-selected', String(!empty && li.textContent === current.text));
    });
  }

  function setActive(index) {
    items.forEach((li) => li.classList.remove('is-active'));
    active = Math.max(0, Math.min(items.length - 1, index));
    const li = items[active];
    if (!li) return;
    li.classList.add('is-active');
    btn.setAttribute('aria-activedescendant', li.id);
    li.scrollIntoView({ block: 'nearest' });
  }

  function open() {
    list.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    const below = window.innerHeight - btn.getBoundingClientRect().bottom;
    const above = btn.getBoundingClientRect().top;
    list.classList.toggle('is-up', below < list.offsetHeight + 8 && above > below);
    const selectedIndex = items.findIndex((li) => li.getAttribute('aria-selected') === 'true');
    setActive(selectedIndex >= 0 ? selectedIndex : 0);
  }

  function close() {
    list.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    btn.removeAttribute('aria-activedescendant');
  }

  function choose(index) {
    const option = choices[index];
    if (!option) return;
    option.selected = true;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    syncButton();
    close();
    btn.focus();
  }

  btn.addEventListener('click', () => (list.hidden ? open() : close()));

  btn.addEventListener('keydown', (event) => {
    const isOpen = !list.hidden;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) open(); else setActive(active + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) open(); else setActive(active - 1);
        break;
      case 'Home':
        if (isOpen) { event.preventDefault(); setActive(0); }
        break;
      case 'End':
        if (isOpen) { event.preventDefault(); setActive(items.length - 1); }
        break;
      case 'Enter':
      case ' ':
        if (isOpen) { event.preventDefault(); choose(active); }
        break;
      case 'Escape':
        if (isOpen) {
          event.stopPropagation(); // не закрывать модальное окно вместе со списком
          close();
        }
        break;
      case 'Tab':
        close();
        break;
      default:
    }
  });

  list.addEventListener('mousedown', (event) => event.preventDefault()); // фокус остаётся на кнопке
  list.addEventListener('click', (event) => {
    const li = event.target.closest('.chz_listbox_option');
    if (li) choose(items.indexOf(li));
  });
  list.addEventListener('mousemove', (event) => {
    const li = event.target.closest('.chz_listbox_option');
    if (li && items.indexOf(li) !== active) setActive(items.indexOf(li));
  });

  document.addEventListener('mousedown', (event) => {
    if (!wrap.contains(event.target)) close();
  });

  // сброс формы — вернуть подпись на кнопке
  select.form?.addEventListener('reset', () => setTimeout(syncButton));

  syncButton();
}

document.addEventListener('DOMContentLoaded', () => {
  initClickEvents();
  initForm();
  document.querySelectorAll('input[data-datepicker]').forEach(initDatepicker);
  document.querySelectorAll('#chz-popup select').forEach(initSelect);
});
