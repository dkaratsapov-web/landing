/* niche-kit.mjs — общий каркас страниц под нишу.

   Зачем эти страницы. Страница услуги отвечает на запрос «настройка Яндекс
   Директа», нишевая — на «реклама для ресторана». Второй запрос ищут те,
   кто уже обжёгся на универсальном подрядчике: им важно, что человек знает
   их специфику, а не только интерфейс кабинета. Конкуренция там ниже, а
   доверие выше — при условии, что за словами стоит кейс.

   Отсюда правило: страница делается только под нишу, где есть свой кейс с
   цифрами. Штамповать страницы под ниши без опыта — верный путь к фильтру
   за малополезный контент, и это ровно то, чем забита выдача по таким
   запросам сейчас.

   Каркас общий, чтобы четыре страницы не разъехались по вёрстке, но
   середина у каждой своя: у ниши есть механика, которая её и отличает —
   недельный провал загрузки в общепите, длинный цикс сделки в B2B,
   ограничения закона в медицине. Эта часть приходит из данных страницы, а
   не из шаблона.
*/
import { SITE, breadcrumbs, faqItems } from './layout.mjs';
import { CASES } from './cases-data.mjs';
import { caseUrl } from './case-page.mjs';

export const NICHE_CSS = `
/* ── Первый экран ─────────────────────────────────────────────────────── */
.nh { padding: 104px 0 0; }
@media (max-width: 900px) { .nh { padding-top: 88px; } }
.nh-top { display: grid; gap: 30px; margin-top: 20px; align-items: center; }
@media (min-width: 1000px) { .nh-top { grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 56px; } }
.nh-eyebrow { display: inline-block; margin-bottom: 14px; padding: 5px 12px;
  border-radius: var(--r-pill); background: rgba(255,255,255,.06); color: var(--muted);
  font-size: 11.5px; font-weight: 700; letter-spacing: .09em; text-transform: uppercase; }
.nh h1 { margin: 0 0 16px; font-size: clamp(30px, 4vw, 52px); line-height: 1.05; letter-spacing: -0.03em; }
.nh-utp { margin: 0 0 16px; font-size: clamp(16px, 1.7vw, 19px); line-height: 1.55; color: var(--ink); }
.nh-utp b { color: var(--lime-bright); font-weight: 700; }
.nh-lead { margin: 0; font-size: 16px; line-height: 1.65; color: var(--muted); max-width: 56ch; }
.nh-btns { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 26px; }

/* Цифры лентой, а не карточками: четыре рамки под первым экраном дают
   четыре одинаковых прямоугольника и много воздуха внутри каждого. */
.nh-nums { display: grid; gap: 1px; margin-top: 34px; background: var(--line);
  border: 1px solid var(--line); border-radius: 18px; overflow: hidden; }
@media (min-width: 620px) { .nh-nums { grid-template-columns: repeat(3, 1fr); } }
.nh-num { padding: 18px 20px; background: var(--surface); }
.nh-num-v { font-size: clamp(22px, 2.2vw, 28px); font-weight: 800; letter-spacing: -0.03em;
  color: var(--lime-bright); font-variant-numeric: tabular-nums; }
.nh-num-l { margin-top: 5px; font-size: 13px; line-height: 1.4; color: var(--muted); }

/* ── Секции ────────────────────────────────────────────────────────────── */
.nsec { padding: 60px 0 0; }
.nsec-last { padding-bottom: 60px; }
.nsec h2 { margin: 0 0 12px; font-size: clamp(22px, 2.4vw, 32px); letter-spacing: -0.02em; }
.nsec-lead { margin: 0 0 26px; font-size: 16px; line-height: 1.65; color: var(--muted); max-width: 68ch; }

/* ── Боли и ответы ─────────────────────────────────────────────────────── */
.npain { display: grid; gap: 1px; background: var(--line);
  border: 1px solid var(--line); border-radius: 18px; overflow: hidden; }
@media (min-width: 860px) { .npain { grid-template-columns: 1fr 1fr; } }
.npain-i { background: var(--surface); padding: 22px 24px; }
.npain-q { display: block; margin-bottom: 8px; font-size: 16px; font-weight: 700; color: var(--ink); }
/* Красное тире — только у списка проблем. Тот же блок используется для
   нейтрального разбора механики ниши, и там маркер сбивал бы с толку:
   особенность ниши читалась бы как ошибка. */
.npain.bad .npain-q::before { content: '— '; color: #ff8a80; }
.npain-a { margin: 0; font-size: 14.5px; line-height: 1.6; color: var(--muted); }

/* ── Порядок работ ─────────────────────────────────────────────────────── */
.nwork { display: grid; gap: 20px 30px; }
@media (min-width: 760px)  { .nwork { grid-template-columns: 1fr 1fr; } }
@media (min-width: 1100px) { .nwork { grid-template-columns: repeat(3, 1fr); } }
.nwork-i { padding-top: 16px; border-top: 2px solid var(--line-2); }
.nwork-n { font-size: 12px; font-weight: 800; letter-spacing: .06em; color: var(--lime-bright);
  font-variant-numeric: tabular-nums; margin-bottom: 6px; }
.nwork-t { margin: 0 0 8px; font-size: 17px; letter-spacing: -0.01em; }
.nwork-d { margin: 0; font-size: 14.5px; line-height: 1.55; color: var(--muted); }

/* ── Кейсы ниши ────────────────────────────────────────────────────────── */
.ncase { display: grid; gap: 14px; }
@media (min-width: 760px)  { .ncase { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1080px) { .ncase { grid-template-columns: repeat(3, 1fr); } }
.ncase-i { display: flex; flex-direction: column; padding: 0 0 20px; overflow: hidden;
  border: 1px solid var(--line); border-radius: 18px; background: var(--surface);
  text-decoration: none; color: inherit;
  transition: border-color .2s cubic-bezier(.32,.72,0,1), transform .2s cubic-bezier(.32,.72,0,1); }
.ncase-i:hover { border-color: var(--line-2); transform: translateY(-2px); }
.ncase-img { position: relative; aspect-ratio: 16 / 9; overflow: hidden;
  background: linear-gradient(135deg, #16241c, #0b120e); }
.ncase-img img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
.ncase-b { padding: 18px 20px 0; display: flex; flex-direction: column; flex: 1; }
.ncase-f { font-size: 10.5px; font-weight: 700; letter-spacing: .09em; text-transform: uppercase;
  color: var(--lime-bright); margin-bottom: 7px; }
.ncase-t { margin: 0 0 6px; font-size: 16.5px; line-height: 1.3; letter-spacing: -0.02em; }
.ncase-g { font-size: 13px; color: var(--muted); }
.ncase-m { margin-top: auto; padding-top: 16px; display: flex; flex-direction: column; gap: 6px;
  font-size: 13.5px; color: var(--muted); }
.ncase-m b { color: var(--ink); font-weight: 700; font-variant-numeric: tabular-nums; }

/* ── Цена и призыв ─────────────────────────────────────────────────────── */
.nfoot { display: grid; gap: 24px; }
@media (min-width: 980px) { .nfoot { grid-template-columns: minmax(0, 1fr) minmax(0, .85fr); gap: 34px; } }
.nprice { padding: 26px 28px; border-radius: 20px; border: 1px solid var(--line); background: var(--surface); }
.nprice-v { font-size: clamp(24px, 2.6vw, 30px); font-weight: 800; letter-spacing: -0.02em; color: var(--ink); }
.nprice-l { margin: 6px 0 18px; font-size: 14px; color: var(--muted); }
.nprice-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 9px; }
.nprice-list li { position: relative; padding-left: 24px; font-size: 14.5px; line-height: 1.5; color: var(--muted); }
.nprice-list li::before { content: '✓'; position: absolute; left: 0; color: var(--lime-bright); font-weight: 700; }
.ncta { padding: 26px 28px 28px; border-radius: 20px; border: 1px solid var(--line-2);
  background: linear-gradient(165deg, var(--surface-2), var(--surface)); }
.ncta h2 { font-size: clamp(20px, 2vw, 26px); }
.ncta p { margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: var(--muted); }
`;

/* ── Куски разметки ─────────────────────────────────────────────────────── */

function caseCard(id) {
  const c = CASES.find((x) => x.id === id);
  if (!c) throw new Error(`niche-kit: нет кейса с id ${id}`);
  const [v1, l1] = c.metrics[0];
  const [v2, l2] = c.metrics[1] || [];
  /* Снимка может не быть — тогда остаётся плашка-градиент под тем же
     соотношением сторон, и ряд карточек не разъезжается по высоте. */
  const img = c.img
    ? `<img src="/${c.img}" alt="${c.field}, ${c.geo}" loading="lazy" decoding="async">`
    : '';
  return `      <a class="ncase-i" href="${caseUrl(c.slug)}">
        <div class="ncase-img">${img}</div>
        <div class="ncase-b">
          <div class="ncase-f">${c.field}</div>
          <h3 class="ncase-t">${c.h1}</h3>
          <div class="ncase-g">${c.geo}</div>
          <div class="ncase-m">
            <span><b>${v1}</b> ${l1}</span>
            ${v2 ? `<span><b>${v2}</b> ${l2}</span>` : ''}
          </div>
        </div>
      </a>`;
}

export function nichePage(n) {
  const meta = {
    path: n.path,
    title: n.seo.title,
    description: n.seo.description,
    ogImage: n.ogImage || '/assets/og/uslugi.jpg',
  };

  function render() {
    const crumbs = breadcrumbs([[n.path, n.crumb]]);

    const nums = n.numbers.map(([v, l]) => `      <div class="nh-num">
        <div class="nh-num-v">${v}</div>
        <div class="nh-num-l">${l}</div>
      </div>`).join('\n');

    const pains = n.pains.map(([q, a]) => `      <div class="npain-i">
        <span class="npain-q">${q}</span>
        <p class="npain-a">${a}</p>
      </div>`).join('\n');

    const works = n.works.map(([t, d], i) => `      <div class="nwork-i">
        <div class="nwork-n">${String(i + 1).padStart(2, '0')}</div>
        <h3 class="nwork-t">${t}</h3>
        <p class="nwork-d">${d}</p>
      </div>`).join('\n');

    const body = `<header class="nh">
  <div class="wrap">
    ${crumbs.visible}
    <div class="nh-top">
      <div>
        <div class="nh-eyebrow">${n.eyebrow}</div>
        <h1>${n.h1}</h1>
        <p class="nh-utp">${n.utp}</p>
        <p class="nh-lead">${n.lead}</p>
        <div class="nh-btns">
          <a class="btn btn-lime btn-lg" href="/contacts/" data-lead-modal>Обсудить задачу <span class="arr">→</span></a>
          <a class="btn btn-ghost btn-lg" href="#kejsy">Смотреть кейсы ниши</a>
        </div>
      </div>
      <div class="nh-visual" aria-hidden="true">
${n.visual}
      </div>
    </div>
    <div class="nh-nums">
${nums}
    </div>
  </div>
</header>

<section class="nsec">
  <div class="wrap">
    <h2>${n.mechanicsTitle}</h2>
    <p class="nsec-lead">${n.mechanicsLead}</p>
${n.mechanics}
  </div>
</section>

<section class="nsec">
  <div class="wrap">
    <h2>Что обычно ломается</h2>
    <p class="nsec-lead">${n.painsLead}</p>
    <div class="npain bad">
${pains}
    </div>
  </div>
</section>

<section class="nsec">
  <div class="wrap">
    <h2>Что я делаю</h2>
    <p class="nsec-lead">${n.worksLead}</p>
    <div class="nwork">
${works}
    </div>
  </div>
</section>

<section class="nsec" id="kejsy">
  <div class="wrap">
    <h2>Кейсы из этой ниши</h2>
    <p class="nsec-lead">${n.casesLead}</p>
    <div class="ncase">
${n.cases.map(caseCard).join('\n')}
    </div>
  </div>
</section>

<section class="nsec nsec-last">
  <div class="wrap">
    <div class="nfoot">
      <div class="nprice">
        <div class="nprice-v">${n.price}</div>
        <p class="nprice-l">${n.priceNote}</p>
        <ul class="nprice-list">
${n.priceIncludes.map((i) => `          <li>${i}</li>`).join('\n')}
        </ul>
      </div>
      <aside class="ncta">
        <h2>${n.ctaTitle}</h2>
        <p>${n.ctaText}</p>
        <a class="btn btn-lime" href="/contacts/" data-lead-modal>Написать мне <span class="arr">→</span></a>
      </aside>
    </div>
  </div>
</section>

<section class="nsec nsec-last">
  <div class="wrap wrap-narrow">
    <h2>Вопросы</h2>
    <div class="faq-list">
${faqItems(n.faq)}
    </div>
  </div>
</section>`;

    const schema = [
      crumbs.schema,
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: n.serviceName,
        serviceType: 'Интернет-маркетинг',
        description: n.seo.description,
        url: SITE + n.path,
        areaServed: { '@type': 'Country', name: 'Россия' },
        provider: { '@type': 'Person', name: 'Даниил Карацапов', url: SITE },
        audience: { '@type': 'BusinessAudience', audienceType: n.audience },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: n.faq.map(([q, a]) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, '') },
        })),
      },
    ];

    return { body, schema, extraHead: `<style>${NICHE_CSS}${n.css || ''}</style>` };
  }

  return { meta, render };
}
