/* lead-config.js — конфигурация заявок и аналитики. Подключается первым
   на всех страницах сайта.

   ВАЖНО: здесь не должно быть никаких секретов. Файл отдаётся браузеру как
   есть, поэтому токен Telegram-бота живёт в Cloudflare Worker (см. worker/),
   а сюда попадает только публичный адрес эндпойнта. */

/* Адрес прокси-эндпойнта. Пока пусто — формы честно предложат написать
   в мессенджер вместо тихой потери заявки. */
window.LEAD_ENDPOINT = '';

/* Запасные каналы связи — используются, если эндпойнт не настроен или лёг. */
window.LEAD_WA_PHONE = '79963470065';
window.LEAD_TG_URL = 'https://t.me/Daniil_065';

/* Идентификатор счётчика Яндекс.Метрики. */
window.YM_ID = 109681858;

(function () {
  /* ---- Цели Метрики ---------------------------------------------------
     Вызывать так: ymGoal('lead_form_submit', { source: 'Попап' }).
     Если счётчик ещё не инициализирован или заблокирован — молча выходим. */
  window.ymGoal = function (goal, params) {
    try {
      if (typeof window.ym === 'function' && window.YM_ID) {
        window.ym(window.YM_ID, 'reachGoal', goal, params || {});
      }
    } catch (e) {}
  };

  /* Текст заявки для мессенджера — тот же формат, что уходит в Telegram. */
  window.leadText = function (d) {
    return [
      'Заявка с сайта' + (d.source ? ' (' + d.source + ')' : ''),
      'Имя: ' + (d.name || '—'),
      'Телефон: ' + (d.phone || '—'),
      d.site ? 'Сайт: ' + d.site : null,
      d.comment ? 'Комментарий: ' + d.comment : null,
    ].filter(Boolean).join('\n');
  };

  window.leadWhatsAppUrl = function (d) {
    return 'https://wa.me/' + window.LEAD_WA_PHONE +
      '?text=' + encodeURIComponent(window.leadText(d));
  };

  /* ---- Отправка заявки ------------------------------------------------
     Возвращает Promise<{ok, reason}>. Никогда не реджектится и никогда не
     сообщает об успехе, если заявка не доставлена: вызывающий код обязан
     показать запасной канал, когда ok === false. */
  window.sendLead = function (d) {
    var endpoint = window.LEAD_ENDPOINT || '';
    if (!endpoint) return Promise.resolve({ ok: false, reason: 'not_configured' });

    var payload = {
      name: d.name || '',
      phone: d.phone || '',
      site: d.site || '',
      comment: d.comment || '',
      source: d.source || '',
      page: location.pathname,
      company: d.company || '', // honeypot
    };

    return fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (r.ok && j && j.ok) {
            window.ymGoal('lead_form_submit', { source: d.source || '' });
            return { ok: true };
          }
          return { ok: false, reason: (j && j.error) || 'http_' + r.status };
        });
      })
      .catch(function () { return { ok: false, reason: 'network' }; });
  };

  /* ---- Панель «не доставлено» ----------------------------------------
     Показывается вместо ложного «Заявка отправлена!», когда эндпойнт не
     настроен или недоступен. Даёт прямые каналы с уже готовым текстом. */
  window.showLeadFallback = function (d) {
    window.ymGoal('lead_form_fallback', { source: (d && d.source) || '' });

    var existing = document.getElementById('leadFallbackOverlay');
    if (existing) existing.remove();

    var wrap = document.createElement('div');
    wrap.id = 'leadFallbackOverlay';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.style.cssText = 'position:fixed;inset:0;z-index:400;background:rgba(0,0,0,.75);' +
      'display:flex;align-items:center;justify-content:center;padding:20px';

    var card = document.createElement('div');
    card.style.cssText = 'max-width:420px;width:100%;background:#161618;color:#f5f5f7;' +
      'border:1px solid rgba(255,255,255,.14);border-radius:18px;padding:28px;text-align:center;' +
      'font-family:Nunito,system-ui,-apple-system,sans-serif';

    var h = document.createElement('h3');
    h.textContent = 'Не получилось отправить';
    h.style.cssText = 'margin:0 0 10px;font-size:22px;font-weight:700';

    var p = document.createElement('p');
    p.textContent = 'Форма не смогла достучаться до сервера. Чтобы заявка не потерялась, ' +
      'отправьте её напрямую — текст уже подставлен.';
    p.style.cssText = 'margin:0 0 22px;font-size:15px;line-height:1.5;color:#a1a1a6';

    var row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;justify-content:center';

    var wa = document.createElement('a');
    wa.href = window.leadWhatsAppUrl(d || {});
    wa.target = '_blank';
    wa.rel = 'noopener noreferrer';
    wa.textContent = 'Отправить в WhatsApp';
    wa.style.cssText = 'background:#b6f01e;color:#0c1402;text-decoration:none;font-weight:700;' +
      'padding:12px 18px;border-radius:10px;font-size:15px';

    var tg = document.createElement('a');
    tg.href = window.LEAD_TG_URL;
    tg.target = '_blank';
    tg.rel = 'noopener noreferrer';
    tg.textContent = 'Написать в Telegram';
    tg.style.cssText = 'border:1px solid rgba(255,255,255,.25);color:#f5f5f7;text-decoration:none;' +
      'font-weight:700;padding:12px 18px;border-radius:10px;font-size:15px';

    var close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'Закрыть';
    close.style.cssText = 'margin-top:18px;background:none;border:none;color:#6e6e73;' +
      'cursor:pointer;font-size:14px;font-family:inherit';
    close.onclick = function () { wrap.remove(); };

    row.appendChild(wa);
    row.appendChild(tg);
    card.appendChild(h);
    card.appendChild(p);
    card.appendChild(row);
    card.appendChild(close);
    wrap.appendChild(card);
    wrap.addEventListener('click', function (e) { if (e.target === wrap) wrap.remove(); });
    document.body.appendChild(wrap);
    wa.focus();
  };

  /* ---- Заглушка вместо битой картинки ---------------------------------
     Если файла нет, браузер рисует иконку «сломанное изображение». Ставим
     вместо неё нейтральный плейсхолдер в цветах сайта. Событие error не
     всплывает, поэтому слушаем на фазе перехвата. */
  var BROKEN = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">' +
    '<rect width="800" height="600" fill="#161618"/>' +
    '<path d="M340 250h120v100H340z" fill="none" stroke="#3a3a3f" stroke-width="6"/>' +
    '<circle cx="372" cy="282" r="12" fill="#3a3a3f"/>' +
    '<path d="M340 330l40-36 34 30 26-22 20 18v30H340z" fill="#3a3a3f"/></svg>');

  document.addEventListener('error', function (e) {
    var el = e.target;
    if (!el || el.tagName !== 'IMG' || el.dataset.fallbackApplied) return;
    el.dataset.fallbackApplied = '1';
    // <picture> с WebP-источником: сначала убираем <source>, иначе браузер
    // продолжит брать отсутствующий webp вместо нашей заглушки.
    var pic = el.parentElement;
    if (pic && pic.tagName === 'PICTURE') {
      var sources = pic.querySelectorAll('source');
      for (var i = 0; i < sources.length; i++) sources[i].remove();
    }
    el.src = BROKEN;
  }, true);

  /* ---- Автоцели на исходящие контакты --------------------------------
     Один делегированный слушатель на документ — работает и для элементов,
     отрисованных React'ом позже. */
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('t.me/') > -1) window.ymGoal('tg_click');
    else if (href.indexOf('max.ru/') > -1) window.ymGoal('max_click');
    else if (href.indexOf('wa.me/') > -1) window.ymGoal('wa_click');
    else if (href.indexOf('tel:') === 0) window.ymGoal('phone_click');
  }, true);
})();
