/* score.mjs — превращаем результат проверки в повод для разговора.

   Смысл модуля в одном: список из семи тысяч строк бесполезен, а список из
   трёхсот строк с готовой первой фразой — это работа на неделю. Поэтому на
   выходе не абстрактный «балл качества лида», а конкретика: что у компании
   не так, какую услугу это продаёт и с чего начать разговор.

   Все правила — здесь, в одном месте и словами. Их придётся менять, когда
   станет видно, какие заходы срабатывают, а какие нет. */

/* Ниши, в которых есть кейс по Твери. «Я это уже сделал для компании с
   соседней улицы» — самый сильный аргумент, который вообще бывает в холодном
   контакте, поэтому такие компании поднимаются в приоритете. */
export const NICHE_FIT = {
  'Автосервис / Автотовары': 'ДиАвто69, iPapa',
  'Медицина / Здоровье / Красота': 'BM Clinic, салон «Блондинки»',
  'Строительство / Недвижимость / Ремонт': 'Каркас Комфорт',
  'Строительные / отделочные материалы': 'производитель окон',
  'Досуг / Развлечения / Общественное питание': 'Nebo Lounge, «Берёзка»',
  'Образование / Работа / Карьера': 'школа «Дмитровский», детский центр',
};

export const SERVICES = {
  geo: { name: 'Гео-сервисы', url: '/geo-servisy/' },
  site: { name: 'Разработка сайта', url: '/razrabotka-sajtov/' },
  context: { name: 'Контекстная реклама', url: '/kontekstnaya-reklama/' },
  target: { name: 'Таргетированная реклама', url: '/targetirovannaya-reklama/' },
  analytics: { name: 'Сквозная аналитика', url: '/skvoznaya-analitika/' },
};

const BUILDERS = ['Tilda', 'uCoz', '1С-UMI', 'Nethouse', 'Megagroup'];

export function score(c) {
  const ch = c.check;
  const needs = [];       // какие услуги уместны
  const reasons = [];     // что именно нашли — это и есть первая фраза
  let priority = 0;

  if (!ch) return { needs: [], reasons: [], priority: 0, hook: '' };

  switch (ch.verdict) {
    case 'no_site':
      needs.push('geo', 'site');
      reasons.push('сайта нет вообще');
      priority += 30;
      break;
    case 'dns_dead':
      needs.push('geo', 'site');
      reasons.push('домен из справочника больше не существует');
      priority += 25;
      break;
    case 'http_dead':
    case 'http_error':
      needs.push('geo', 'site');
      reasons.push('сайт не открывается');
      priority += 20;
      break;
    case 'parked':
      needs.push('geo', 'site');
      reasons.push('на домене заглушка, сайта фактически нет');
      priority += 25;
      break;
    case 'moved':
      reasons.push(`переехали на ${ch.new_domain} — контакт в справочнике устарел`);
      priority += 5;
      break;
  }

  const t = ch.tech || {};
  if (ch.verdict === 'live' || ch.verdict === 'moved') {
    const ads = t.metrika || t.ga || t.mailru;
    if (!ads) {
      /* Самый сильный сигнал во всей проверке. Счётчика нет — значит,
         рекламу не ведут: никто не станет платить за клики вслепую. */
      needs.push('context', 'geo');
      reasons.push('на сайте нет ни одного счётчика — рекламу не ведут и не видят, откуда приходят клиенты');
      priority += 35;
    } else {
      if (!t.metrika && t.ga) {
        needs.push('analytics');
        reasons.push('стоит только Google Analytics, Метрики нет — для Яндекса это слепая зона');
        priority += 10;
      }
      const counters = [t.metrika, t.ga, t.mailru, t.vk].filter(Boolean).length;
      if (counters >= 2) {
        needs.push('analytics');
        reasons.push('несколько рекламных каналов, но данные по ним не сведены');
        priority += 8;
      }
    }

    if (BUILDERS.includes(t.cms)) {
      needs.push('site');
      reasons.push(`сайт на конструкторе ${t.cms} — визитка, а не инструмент продаж`);
      priority += 12;
    }
    if (!t.viewport) {
      needs.push('site');
      reasons.push('сайт не адаптирован под телефон');
      priority += 15;
    }
    if (!t.form) {
      reasons.push('на сайте нет формы заявки — заявку оставить негде');
      priority += 10;
    }
    if (t.year && t.year <= new Date().getFullYear() - 3) {
      reasons.push(`в копирайте ${t.year} год — сайтом давно не занимались`);
      priority += 8;
    }
    if (!t.chat) priority += 2;
  }

  /* Достижимость. Самый горячий лид бесполезен, если до него не дозвониться. */
  const reach = (c.mobiles?.length ? 2 : 0) + (c.phones?.length ? 1 : 0) + (c.emails?.length ? 1 : 0);
  priority += reach * 3;
  if (!reach) { priority = 0; reasons.push('нет ни одного контакта'); }

  /* Профильная ниша. */
  const fit = (c.categories || []).find((k) => NICHE_FIT[k]);
  if (fit) {
    priority += 20;
    reasons.push(`ниша совпадает с кейсом: ${NICHE_FIT[fit]}`);
  }

  const uniq = [...new Set(needs)];
  return {
    needs: uniq,
    reasons,
    priority,
    fit: fit || '',
    hook: reasons[0] || '',
    main: uniq[0] ? SERVICES[uniq[0]].name : '',
  };
}
