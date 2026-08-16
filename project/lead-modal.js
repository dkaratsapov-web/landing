/* lead-modal.js — переиспользуемая попап-форма заявки для статических страниц.
   Самовставляющийся модуль: создаёт разметку модалки один раз, навешивает
   открытие на все CTA-кнопки-якоря (href="#contacts" и помеченные
   data-lead-modal), отправляет заявку в Telegram с фолбэком в WhatsApp.
   Подключать на каждой странице: <script src="<путь>/lead-modal.js"></script> */
(function () {
  // Текст-источник заявки берём из data-атрибута body или из <title>
  var SOURCE = (document.body && document.body.getAttribute('data-lead-source')) ||
    (document.title || '').split('|')[0].split('—')[0].trim() || 'Сайт';

  // ---- Разметка модалки (вставляется в конец body один раз) ----
  var html =
    '<div class="lead-modal" id="leadModal" role="dialog" aria-modal="true" aria-labelledby="leadModalTitle" aria-hidden="true">' +
      '<div class="lead-modal-card" role="document">' +
        '<button type="button" class="lead-modal-close" id="leadModalClose" aria-label="Закрыть">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
        '</button>' +
        '<p class="lead-modal-eyebrow">Обсудим проект</p>' +
        '<h2 id="leadModalTitle">Расскажите о задаче</h2>' +
        '<p class="lead-modal-sub">Оставьте заявку — я свяжусь лично, отвечу на вопросы и предложу решение.</p>' +
        '<form id="leadModalForm" class="lead-form" novalidate>' +
          '<div class="field">' +
            '<label for="lm-name">Имя <span class="req">*</span></label>' +
            '<input type="text" id="lm-name" name="name" autocomplete="name" placeholder="Как к вам обращаться">' +
          '</div>' +
          '<div class="field">' +
            '<label for="lm-phone">Телефон <span class="req">*</span></label>' +
            '<input type="tel" id="lm-phone" name="phone" autocomplete="tel" placeholder="+7 (___) ___-__-__" required>' +
            '<span class="field-err">Укажите телефон для связи</span>' +
          '</div>' +
          /* Только имя и телефон. Поля «сайт» и «комментарий» убраны: форма
             открывается по кнопке «Обсудить задачу», где человек ещё ничего не
             решил, и каждое лишнее поле здесь стоит заявок. Всё остальное
             выясняется в разговоре. Форма на главной ровно такая же — сайт
             должен вести себя одинаково в обоих местах. */
          '<button type="submit" class="btn btn-lime" style="width:100%; justify-content:center;">Обсудить мой проект <span class="arr">→</span></button>' +
          '<p class="lead-note">Нажимая кнопку, вы соглашаетесь на обработку персональных данных ' +
            'в соответствии с <a href="/politika/" target="_blank" rel="noopener noreferrer">политикой конфиденциальности</a>.</p>' +
        '</form>' +
        '<div class="lead-ok-box" id="leadModalOk" hidden>' +
          '<div class="lead-ok-ic"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>' +
          '<h3>Заявка отправлена!</h3>' +
          '<p>Спасибо! Я свяжусь с вами в ближайшее время. Можно также написать мне в <a href="https://t.me/Daniil_065" target="_blank" rel="noopener noreferrer">Telegram</a>.</p>' +
        '</div>' +
      '</div>' +
    '</div>';

  function init() {
    if (document.getElementById('leadModal')) return;
    document.body.insertAdjacentHTML('beforeend', html);

    var modal = document.getElementById('leadModal');
    var card = modal.querySelector('.lead-modal-card');
    var closeBtn = document.getElementById('leadModalClose');
    var form = document.getElementById('leadModalForm');
    var ok = document.getElementById('leadModalOk');
    var phone = document.getElementById('lm-phone');
    var phoneField = phone.closest('.field');
    var lastFocused = null;

    // ---- Маска телефона (как на остальных формах сайта) ----
    phone.addEventListener('input', function () {
      var d = phone.value.replace(/\D/g, '');
      if (d.startsWith('8')) d = '7' + d.slice(1);
      if (d.startsWith('9')) d = '7' + d;
      d = d.slice(0, 11);
      var out = '+7';
      if (d.length > 1) out += ' (' + d.slice(1, 4);
      if (d.length >= 4) out += ') ' + d.slice(4, 7);
      if (d.length >= 7) out += '-' + d.slice(7, 9);
      if (d.length >= 9) out += '-' + d.slice(9, 11);
      phone.value = d.length ? out : '';
      if (phoneField.classList.contains('invalid')) phoneField.classList.remove('invalid');
    });

    /* ---- Отправка заявки ----------------------------------------------
       Первый путь — Telegram Bot API, если в lead-config.js заданы токен и
       чат. Сейчас они пустые намеренно: файл отдаётся браузеру как есть, и
       любой секрет в нём публичен. Рабочий путь — WhatsApp с готовым
       текстом заявки.

       Возвращается способ доставки, а не true. Разница существенная: при
       отправке ботом заявка действительно у владельца, а при переходе в
       WhatsApp её отправляет человек — и если браузер заблокировал новое
       окно, не отправляет никто. Экран «заявка отправлена» в этот момент
       был бы прямым обманом. */
    function wa(text) {
      var w = window.open('https://wa.me/79963470065?text=' + encodeURIComponent(text), '_blank');
      return w ? 'wa' : 'none';
    }
    function sendLead(text) {
      var TOKEN = window.LEAD_TG_TOKEN || '';
      var CHAT = window.LEAD_TG_CHAT || '';
      if (TOKEN && CHAT) {
        var url = 'https://api.telegram.org/bot' + TOKEN + '/sendMessage' +
          '?chat_id=' + encodeURIComponent(CHAT) +
          '&disable_web_page_preview=true' +
          '&text=' + encodeURIComponent(text);
        return fetch(url).then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (j) {
            if (r.ok && j && j.ok) return 'tg';
            return wa(text);
          });
        }).catch(function () { return wa(text); });
      }
      return Promise.resolve(wa(text));
    }

    function val(id) { var el = document.getElementById(id); return (el && el.value) || ''; }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      // Имя стало обязательным — проверяем его так же, как телефон.
      var nameEl = document.getElementById('lm-name');
      var nameField = nameEl.closest('.field');
      if (nameEl.value.trim().length < 2) { nameField.classList.add('invalid'); nameEl.focus(); return; }
      nameField.classList.remove('invalid');

      var digits = (phone.value.match(/\d/g) || []).length;
      if (digits < 11) { phoneField.classList.add('invalid'); phone.focus(); return; }
      phoneField.classList.remove('invalid');
      var text =
        '🟢 Новая заявка с сайта (' + SOURCE + ' · попап)\n' +
        '👤 Имя: ' + (val('lm-name') || '—') + '\n' +
        '📞 Телефон: ' + phone.value;
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.style.opacity = '.6'; }
      sendLead(text).then(function (how) {
        if (how !== 'tg') {
          var okH = ok.querySelector('h3');
          var okP = ok.querySelector('p');
          if (how === 'wa') {
            okH.textContent = 'Открыл WhatsApp';
            okP.innerHTML = 'В новой вкладке готовый текст заявки — осталось нажать «Отправить». '
              + 'Если вкладка не открылась: <a href="tel:+79963470065">+7 (996) 347-00-65</a> '
              + 'или <a href="https://t.me/Daniil_065" target="_blank" rel="noopener noreferrer">Telegram</a>.';
          } else {
            okH.textContent = 'Почти готово';
            okP.innerHTML = 'Браузер заблокировал новое окно, поэтому заявка не ушла. '
              + 'Позвоните — <a href="tel:+79963470065">+7 (996) 347-00-65</a> — '
              + 'или напишите в <a href="https://t.me/Daniil_065" target="_blank" rel="noopener noreferrer">Telegram</a>.';
          }
        }
        form.hidden = true;
        ok.hidden = false;
      });
    });

    // ---- Открытие / закрытие ----
    function open() {
      lastFocused = document.activeElement;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      // фокус на первое поле
      setTimeout(function () { document.getElementById('lm-name').focus(); }, 30);
    }
    function close() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocused && lastFocused.focus) { try { lastFocused.focus(); } catch (e) {} }
    }
    window.openLeadModal = open;
    window.closeLeadModal = close;

    closeBtn.addEventListener('click', close);
    // клик по затемнённому фону (но не по карточке)
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    // закрытие по ESC
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) close();
    });

    // ---- Навешиваем открытие на все CTA-якоря ----
    var ctas = document.querySelectorAll('a[href="#contacts"], [data-lead-modal]');
    ctas.forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        open();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
