/* =============================================
   Амбар — главная страница, новые блоки
   1. Якорь «Что нельзя хранить» → открывает вопрос в FAQ
   2. Калькулятор объёма
   Без зависимостей. Подключать с defer.
   Кнопки «Получить консультацию» открывают окно сайта #callback-popup
   через Fancybox темы (data-fancybox) — отдельного кода не нужно.
   ============================================= */

/* ---- Данные калькулятора ----
   boxes — объём в коробках Амбар 60×40×40 см (1 коробка ≈ 0,1 м³).
   Средние значения; крупная корпусная мебель — в разобранном виде.
   Шины и велосипед считаем как 0,5 м³ (по согласованию).
   icon — имя файла иконки строки без .svg (необязательно, по умолчанию icn-box). */
const CALC_ICON_PATH = 'assets/icons/'; // на сайте — путь к иконкам в папке темы
const CALC_DEFAULT_ICON = 'icn-box';
const CALC_CATEGORIES = [
  {
    id: 'furniture',
    title: 'Мебель',
    items: [
      { id: 'sofa2', name: 'Диван 2-местный', boxes: 12, icon: 'icn-sofa-2' },
      { id: 'sofa3', name: 'Диван 3-местный', boxes: 19, icon: 'icn-sofa-3' },
      { id: 'armchair', name: 'Кресло', boxes: 6, icon: 'icn-armchair' },
      { id: 'bed2', name: 'Кровать двуспальная с матрасом', hint: 'в разобранном виде', boxes: 12, icon: 'icn-bed-double' },
      { id: 'bed1', name: 'Кровать односпальная с матрасом', hint: 'в разобранном виде', boxes: 6, icon: 'icn-bed-single' },
      { id: 'wardrobe', name: 'Шкаф 2-дверный', hint: 'в разобранном виде', boxes: 6, icon: 'icn-wardrobe' },
      { id: 'dresser', name: 'Комод', boxes: 3, icon: 'icn-dresser' },
      { id: 'table', name: 'Стол обеденный', boxes: 5, icon: 'icn-dining-table' },
      { id: 'desk', name: 'Стол письменный', boxes: 4, icon: 'icn-desk' },
      { id: 'chair', name: 'Стул', boxes: 2, icon: 'icn-chair' },
      { id: 'shelf', name: 'Стеллаж книжный', hint: 'в разобранном виде', boxes: 3, icon: 'icn-bookshelf' },
    ],
  },
  {
    id: 'appliances',
    title: 'Техника',
    items: [
      { id: 'fridge', name: 'Холодильник двухкамерный', boxes: 7, icon: 'icn-fridge' },
      { id: 'washer', name: 'Стиральная машина', boxes: 3, icon: 'icn-washing-machine' },
      { id: 'dishwasher', name: 'Посудомоечная машина', boxes: 3, icon: 'icn-dishwasher' },
      { id: 'tv', name: 'Телевизор 55″', boxes: 2, icon: 'icn-tv' },
      { id: 'microwave', name: 'Микроволновка', boxes: 1, icon: 'icn-microwave' },
    ],
  },
  {
    id: 'boxes',
    title: 'Коробки и вещи',
    items: [
      { id: 'box', name: 'Коробка Амбар 60×40×40 см', hint: 'одежда, посуда, книги', boxes: 1 },
      { id: 'suitcase', name: 'Чемодан большой', boxes: 1, icon: 'icn-suitcase' },
      { id: 'carpet', name: 'Ковёр свёрнутый, 2×3 м', boxes: 2, icon: 'icn-rug-rolled' },
    ],
  },
  {
    id: 'season',
    title: 'Спорт, сезон, детское',
    items: [
      { id: 'bike', name: 'Велосипед', boxes: 5, icon: 'icn-bicycle' },
      { id: 'tires', name: 'Комплект шин, 4 шт.', boxes: 5, icon: 'icn-tires' },
      { id: 'stroller', name: 'Детская коляска', boxes: 3, icon: 'icn-stroller-folded' },
      { id: 'crib', name: 'Детская кроватка', hint: 'в разобранном виде', boxes: 3, icon: 'icn-baby-crib' },
      { id: 'ski', name: 'Лыжи или сноуборд', boxes: 1, icon: 'icn-skis-snowboard' },
    ],
  },
];

/* Тарифы со страницы /prices/ — volume в м³, price в ₽/мес.
   Чтобы не показывать цену, поставьте SHOW_PRICE = false. */
const SHOW_PRICE = true;
const TARIFFS = [
  { volume: 0.5, name: 'Детские и сезонные вещи', price: 1156 },
  { volume: 1.5, name: 'Гардероб', price: 2215 },
  { volume: 3, name: 'Комната', price: 3403 },
  { volume: 6, name: 'Однокомнатная квартира', price: 6313 },
  { volume: 9, name: 'Двухкомнатная квартира', price: 9523 },
  { volume: 13, name: 'Трёхкомнатная квартира', price: 12733 },
  { volume: 18, name: 'Загородный дом', price: 18083 },
  { volume: 22, name: 'Большой проект', price: 21293 },
];

/* ---- Утилиты ---- */

/* Типограф для текстов, которые выводит скрипт (те же правила, что execution/typograph.py):
   неразрывный пробел после коротких слов и предлогов, перед тире,
   между числом и единицей, после «≈» */
const NBSP = ' ';
const SHORT_WORDS_3 = ['без', 'для', 'над', 'под', 'при', 'про', 'или', 'что', 'как', 'все', 'это', 'уже', 'нет'];

function typo(text) {
  let s = String(text);
  s = s.replace(/ (—|–)(?= )/g, `${NBSP}$1`);
  s = s.replace(/(^|[\s(«])([A-Za-zА-Яа-яЁё]{1,3}) (?=\S)/g, (m, before, word) => (
    word.length <= 2 || SHORT_WORDS_3.includes(word.toLowerCase()) ? `${before}${word}${NBSP}` : m
  ));
  s = s.replace(/(\d) (?=\d{3}(?!\d))/g, `$1${NBSP}`);
  s = s.replace(/(\d) (?=[A-Za-zА-Яа-яЁё₽%×″])/g, `$1${NBSP}`);
  s = s.replace(/≈ /g, `≈${NBSP}`);
  return s;
}

function plural(n, one, few, many) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

function formatVolume(boxes) {
  return (boxes / 10).toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function formatPrice(price) {
  return price.toLocaleString('ru-RU');
}


/* =============================================
   1. Якорь в FAQ
   Ссылка: <a href="#faq-forbidden" data-faq-open>.
   Аккордеон сайта открывает вопрос классом .active — делаем так же.
   ============================================= */
function openFaqItem(id, { smooth = true } = {}) {
  const item = document.getElementById(id);
  if (!item || !item.classList.contains('faq_item')) return false;

  item.parentElement.querySelectorAll('.faq_item').forEach((el) => {
    el.classList.remove('active', 'is-anchored');
  });
  item.classList.add('active', 'is-anchored');
  item.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'center' });
  return true;
}

function initFaqAnchors() {
  document.querySelectorAll('[data-faq-open]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href').slice(1);
      if (openFaqItem(id)) {
        event.preventDefault();
        history.replaceState(null, '', `#${id}`);
      }
    });
  });

  // переход по прямой ссылке /#faq-forbidden; ждём, пока аккордеон сайта откроет первый вопрос
  if (location.hash.startsWith('#faq-')) {
    window.addEventListener('load', () => openFaqItem(location.hash.slice(1), { smooth: false }));
  }
}


/* =============================================
   2. Калькулятор
   ============================================= */
function initCalculator(root) {
  const tabsEl = root.querySelector('[data-calc-tabs]');
  const panelsEl = root.querySelector('[data-calc-panels]');
  const totalEl = root.querySelector('[data-calc-total]');
  const metaEl = root.querySelector('[data-calc-meta]');
  const itemsEl = root.querySelector('[data-calc-items]');
  const fillEl = root.querySelector('[data-calc-fill]');
  const ticksEl = root.querySelector('[data-calc-ticks]');
  const tariffNameEl = root.querySelector('[data-calc-tariff-name]');
  const tariffPriceEl = root.querySelector('[data-calc-tariff-price]');
  const stickyEl = root.querySelector('[data-calc-sticky]');
  const stickyTotalEl = root.querySelector('[data-calc-sticky-total]');
  const resetBtn = root.querySelector('[data-calc-reset]');

  const counts = new Map();
  const itemById = new Map();
  CALC_CATEGORIES.forEach((cat) => cat.items.forEach((item) => itemById.set(item.id, { ...item, category: cat.id })));

  // --- Вкладки и списки ---
  CALC_CATEGORIES.forEach((cat, index) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'calc_tab';
    tab.id = `calc-tab-${cat.id}`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', `calc-panel-${cat.id}`);
    tab.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    tab.tabIndex = index === 0 ? 0 : -1;
    tab.innerHTML = `<span>${typo(cat.title)}</span><span class="calc_tab_count" data-tab-count="${cat.id}" hidden></span>`;
    tabsEl.append(tab);

    const panel = document.createElement('ul');
    panel.className = 'calc_panel';
    panel.id = `calc-panel-${cat.id}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.hidden = index !== 0;

    cat.items.forEach((item) => {
      const hint = typo([item.hint, `≈ ${item.boxes} ${plural(item.boxes, 'коробка', 'коробки', 'коробок')}`]
        .filter(Boolean)
        .join(' '));
      const li = document.createElement('li');
      li.className = 'calc_item';
      li.dataset.item = item.id;
      li.innerHTML = `
        <img class="calc_item_icon" src="${CALC_ICON_PATH}${item.icon || CALC_DEFAULT_ICON}.svg" alt="" width="24" height="24">
        <div class="calc_item_info">
          <p class="calc_item_name" id="calc-name-${item.id}">${typo(item.name)}</p>
          <p class="calc_item_hint">${hint}</p>
        </div>
        <div class="calc_stepper" role="group" aria-labelledby="calc-name-${item.id}">
          <button type="button" class="calc_step calc_step--minus" data-step="-1" aria-label="Убрать: ${item.name}" disabled></button>
          <output aria-live="polite">0</output>
          <button type="button" class="calc_step calc_step--plus" data-step="1" aria-label="Добавить: ${item.name}"></button>
        </div>`;
      panel.append(li);
    });
    panelsEl.append(panel);
  });

  // --- Деления шкалы ---
  TARIFFS.forEach((tariff, index) => {
    const li = document.createElement('li');
    li.style.left = `${((index + 1) / TARIFFS.length) * 100}%`;
    li.textContent = tariff.volume.toLocaleString('ru-RU');
    ticksEl.append(li);
  });

  function selectTab(tab) {
    tabsEl.querySelectorAll('[role="tab"]').forEach((t) => {
      const active = t === tab;
      t.setAttribute('aria-selected', active ? 'true' : 'false');
      t.tabIndex = active ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !active;
    });
  }

  tabsEl.addEventListener('click', (event) => {
    const tab = event.target.closest('[role="tab"]');
    if (tab) selectTab(tab);
  });

  tabsEl.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const tabs = [...tabsEl.querySelectorAll('[role="tab"]')];
    const current = tabs.indexOf(document.activeElement);
    if (current === -1) return;
    const next = tabs[(current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
    next.focus();
    selectTab(next);
  });

  // --- Счётчики ---
  panelsEl.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-step]');
    if (!btn) return;
    const id = btn.closest('.calc_item').dataset.item;
    const value = Math.max(0, (counts.get(id) || 0) + Number(btn.dataset.step));
    if (value) counts.set(id, value);
    else counts.delete(id);
    update();
  });

  resetBtn.addEventListener('click', () => {
    counts.clear();
    update();
  });

  // Позиция на шкале: 0 м³ — левый край, ступени тарифов — равномерно
  function scalePosition(volume) {
    if (volume <= 0) return 0;
    let prev = 0;
    for (let i = 0; i < TARIFFS.length; i += 1) {
      const cur = TARIFFS[i].volume;
      if (volume <= cur) return (i + (volume - prev) / (cur - prev)) / TARIFFS.length;
      prev = cur;
    }
    return 1;
  }

  function update() {
    let totalBoxes = 0;
    let totalItems = 0;
    const perCategory = new Map();

    counts.forEach((count, id) => {
      const item = itemById.get(id);
      totalBoxes += item.boxes * count;
      totalItems += count;
      perCategory.set(item.category, (perCategory.get(item.category) || 0) + count);
    });

    // строки и кнопки
    root.querySelectorAll('.calc_item').forEach((row) => {
      const count = counts.get(row.dataset.item) || 0;
      row.querySelector('output').textContent = count;
      row.querySelector('[data-step="-1"]').disabled = count === 0;
      row.classList.toggle('is-selected', count > 0);
    });

    // счётчики на вкладках
    root.querySelectorAll('[data-tab-count]').forEach((el) => {
      const n = perCategory.get(el.dataset.tabCount) || 0;
      el.textContent = n;
      el.hidden = n === 0;
    });

    const volume = totalBoxes / 10;
    totalEl.textContent = typo(`${formatVolume(totalBoxes)} м³`);
    metaEl.textContent = typo(totalBoxes
      ? `≈ ${totalBoxes} ${plural(totalBoxes, 'коробка', 'коробки', 'коробок')}`
      : 'Добавьте вещи из списка');
    itemsEl.textContent = typo(`${totalItems} ${plural(totalItems, 'предмет', 'предмета', 'предметов')}`);
    itemsEl.hidden = totalItems === 0;

    // шкала и тариф
    fillEl.style.width = `${scalePosition(volume) * 100}%`;
    const tariffIndex = totalBoxes ? TARIFFS.findIndex((t) => volume <= t.volume) : -1;
    ticksEl.querySelectorAll('li').forEach((li, i) => li.classList.toggle('is-active', i === tariffIndex));

    tariffPriceEl.hidden = !totalBoxes || !SHOW_PRICE;
    if (!totalBoxes) {
      tariffNameEl.textContent = typo('Подберём, когда добавите вещи');
    } else if (tariffIndex === -1) {
      tariffNameEl.textContent = typo('Персональный объём — больше 22 м³');
      tariffPriceEl.textContent = typo('Рассчитаем индивидуально');
    } else {
      const tariff = TARIFFS[tariffIndex];
      tariffNameEl.textContent = typo(`${tariff.name} — до ${tariff.volume.toLocaleString('ru-RU')} м³`);
      tariffPriceEl.textContent = typo(`${formatPrice(tariff.price)} ₽/месяц`);
    }

    stickyEl.hidden = totalBoxes === 0;
    stickyTotalEl.textContent = typo(`≈ ${formatVolume(totalBoxes)} м³`);
  }

  update();
}


/* ---- Запуск ---- */
document.addEventListener('DOMContentLoaded', () => {
  initFaqAnchors();

  const calcRoot = document.querySelector('[data-calc]');
  if (calcRoot) initCalculator(calcRoot);
});