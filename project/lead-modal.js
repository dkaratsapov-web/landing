/* lead-modal.js — переиспользуемая попап-форма заявки для статических страниц.
   Самовставляющийся модуль: создаёт разметку модалки один раз, навешивает
   открытие на все CTA-кнопки-якоря (href="#contacts" и помеченные
   data-lead-modal), отправляет заявку через прокси-эндпойнт (см. worker/).

   Отправка и цели Метрики живут в lead-config.js — он должен быть подключён
   раньше этого файла на каждой странице. */
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
            '<label for="lm-name">Имя <span class="opt">(необязательно)</span></label>' +
            '<input type="text" id="lm-name" name="name" autocomplete="name" placeholder="Как к вам обращаться">' +
          '</div>' +
          '<div class="field">' +
            '<label for="lm-phone">Телефон <span class="req">*</span></label>' +
            '<input type="tel" id="lm-phone" name="phone" autocomplete="tel" inputmode="tel" placeholder="+7 (___) ___-__-__" required>' +
            '<span class="field-err">Укажите телефон для связи</span>' +
          '</div>' +
          '<div class="field">' +
            '<label for="lm-site">Сайт <span class="opt">(необязательно)</span></label>' +
            '<input type="text" id="lm-site" name="site" inputmode="url" placeholder="example.ru">' +
          '</div>' +
          '<div class="field">' +
            '<label for="lm-comment">Комментарий <span class="opt">(необязательно)</span></label>' +
            '<textarea id="lm-comment" name="comment" rows="2" placeholder="Коротко о задаче или вопросе"></textarea>' +
          '</div>' +
          // Honeypot: скрыт от людей, приманка для ботов. Не убирать.
          '<div class="field lm-hp" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden">' +
            '<label for="lm-company">Компания</label>' +
            '<input type="text" id="lm-company" name="company" tabindex="-1" autocomplete="off">' +
          '</div>' +
          '<div class="field lm-consent-field">' +
            '<label class="lm-consent" for="lm-consent">' +
              '<input type="checkbox" id="lm-consent" name="consent" checked>' +
              '<span>Согласен на обработку персональных данных в соответствии с ' +
                '<a href="/privacy/" target="_blank" rel="noopener">политикой конфиденциальности</a>.</span>' +
            '</label>' +
            '<span class="field-err">Без согласия я не могу принять заявку</span>' +
          '</div>' +
          '<button type="submit" class="btn btn-lime" style="width:100%; justify-content:center;">Обсудить мой проект <span class="arr">→</span></button>' +
        '</form>' +
        '<div class="lead-ok-box" id="leadModalOk" hidden>' +
          '<div class="lead-ok-ic"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>' +
          '<h3>Заявка отправлена!</h3>' +
          '<p>Спасибо! Я свяжусь с вами в ближайшее время. Можно также написать мне в <a href="https://t.me/Daniil_065" target="_blank" rel="noopener noreferrer">Telegram</a>.</p>' +
        '</div>' +
        '<div class="lead-fallback-box" id="leadModalFallback" hidden>' +
          '<h3>Не получилось отправить</h3>' +
          '<p>Форма не смогла достучаться до сервера. Чтобы заявка не потерялась, отправьте её напрямую — текст уже подставлен:</p>' +
          '<div class="lead-fallback-actions">' +
            '<a class="btn btn-lime" id="leadModalWa" href="#" target="_blank" rel="noopener noreferrer">Отправить в WhatsApp</a>' +
            '<a class="btn btn-ghost" id="leadModalTg" href="https://t.me/Daniil_065" target="_blank" rel="noopener noreferrer">Написать в Telegram</a>' +
          '</div>' +
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
    var fallback = document.getElementById('leadModalFallback');
    var phone = document.getElementById('lm-phone');
    var phoneField = phone.closest('.field');
    var consent = document.getElementById('lm-consent');
    var consentField = consent.closest('.field');
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

    function phoneOk() { return (phone.value.match(/\d/g) || []).length >= 11; }

    // Валидация на blur — ошибку видно до нажатия кнопки.
    phone.addEventListener('blur', function () {
      if (phone.value && !phoneOk()) phoneField.classList.add('invalid');
    });
    consent.addEventListener('change', function () {
      if (consent.checked) consentField.classList.remove('invalid');
    });

    function val(id) { var el = document.getElementById(id); return (el && el.value) || ''; }

    function payload() {
      return {
        name: val('lm-name'),
        phone: phone.value,
        site: val('lm-site'),
        comment: val('lm-comment'),
        company: val('lm-company'),
        source: SOURCE + ' · попап',
      };
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!phoneOk()) { phoneField.classList.add('invalid'); phone.focus(); return; }
      phoneField.classList.remove('invalid');
      if (!consent.checked) { consentField.classList.add('invalid'); consent.focus(); return; }
      consentField.classList.remove('invalid');

      var data = payload();
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.style.opacity = '.6'; }

      window.sendLead(data).then(function (res) {
        form.hidden = true;
        if (res && res.ok) {
          ok.hidden = false;
          return;
        }
        // Заявка НЕ доставлена — честно говорим об этом и даём прямые каналы.
        var wa = document.getElementById('leadModalWa');
        if (wa) wa.href = window.leadWhatsAppUrl(data);
        fallback.hidden = false;
        window.ymGoal('lead_form_fallback', { reason: (res && res.reason) || 'unknown' });
      });
    });

    // ---- Открытие / закрытие ----
    function open() {
      lastFocused = document.activeElement;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      window.ymGoal('lead_modal_open', { source: SOURCE });
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

    // ---- Focus trap: Tab не должен уходить на фон под оверлеем ----
    var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    card.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var items = Array.prototype.filter.call(card.querySelectorAll(FOCUSABLE), function (el) {
        return el.offsetParent !== null || el === document.activeElement;
      });
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
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
