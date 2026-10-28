/* =============================================
   Только для прототипа — НЕ переносить на сайт.
   Повторяет поведение main.js сайта: аккордеон FAQ (initFaqAccordion),
   модальные окна Fancybox (fancyboxInit), отправку встроенной формы.
   ============================================= */
document.querySelectorAll('.faq_items').forEach((list) => {
  const items = list.querySelectorAll('.faq_item');
  items.forEach((item) => {
    const firstP = item.querySelector('p');
    if (firstP) firstP.classList.add('first_p_faq');
    item.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      items.forEach((el) => el.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });
  if (items[0]) items[0].classList.add('active');
});

// Модальные окна — как fancyboxInit() в main.js сайта
if (typeof Fancybox !== 'undefined') {
  Fancybox.bind('[data-fancybox]');
}

// Встроенная форма блока 13: на сайте ее отправляет Contact Form 7
document.querySelectorAll('form[data-prototype-inline]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (form.reportValidity()) form.querySelector('[type="submit"]').value = 'Заявка отправлена';
  });
});
