/* =============================================
   Только для прототипа — НЕ переносить на сайт.
   Повторяет поведение main.js и media-lazyload.js сайта
   для существующих секций: аккордеон FAQ и видео первого экрана.
   ============================================= */

// Аккордеон FAQ — как initFaqAccordion() в main.js сайта
document.querySelectorAll('.faq_items').forEach((list) => {
  const items = list.querySelectorAll('.faq_item');
  items.forEach((item) => {
    item.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      items.forEach((el) => el.classList.remove('active', 'is-anchored'));
      if (!isActive) item.classList.add('active');
    });
  });
  if (items[0]) items[0].classList.add('active');
});

// Видео первого экрана: подставляем src из data-src
document.querySelectorAll('video.lazy-video[data-src]').forEach((video) => {
  video.src = video.dataset.src;
});
