/* blog.mjs — движок блога: Markdown-файлы → страницы статей + лента.

   Зачем блог вообще. Сайт целиком состоит из коммерческих страниц, и весь
   трафик на нём — по запросам с намерением «купить». Таких запросов конечное
   число, конкуренция за них максимальная, и растёт по ним сайт медленно.
   Информационные запросы («сколько стоит настройка Директа», «Директ или
   SEO») на порядок частотнее, конкуренция ниже, а человек, прочитавший
   разбор, приходит в заявку уже прогретым. Плюс статьи с указанным автором —
   главный источник E-E-A-T: поисковик видит, что за текстами стоит живой
   специалист с профилем, а не безымянный копирайтер.

   Формат статьи — Markdown с фронтматтером. Не CMS и не база: тексты лежат
   в git рядом с кодом, правятся в редакторе, историю правок видно в diff.
   Для одного автора это надёжнее любой админки.

   Фронтматтер (--- ... --- в начале файла):
     title       — H1 и <title>, обязателен
     description — meta description и анонс в ленте, обязателен
     date        — дата публикации ГГГГ-ММ-ДД, обязательна
     updated     — дата существенной правки, необязательна
     tags        — [через, запятую], необязательны
     service     — путь к смежной услуге для перелинковки, необязателен
     cover       — путь к обложке от корня сайта, необязателен
     draft       — true исключает статью из сборки
*/
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { marked } from 'marked';
import { SITE, breadcrumbs, renderPage } from './layout.mjs';

const AUTHOR = 'Даниил Карацапов';
const WORDS_PER_MINUTE = 180;

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/* ── Фронтматтер ─────────────────────────────────────────────────────────
   Свой разбор вместо gray-matter: нужен десяток полей вида «ключ: значение»
   и один список — тащить ради этого js-yaml в зависимости незачем. */
function parseFrontmatter(raw, file) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!m) throw new Error(`blog: в ${file} нет фронтматтера (блок --- в начале файла)`);

  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const i = line.indexOf(':');
    if (i === -1) throw new Error(`blog: ${file}, строка «${line}» — нет двоеточия`);
    const key = line.slice(0, i).trim();
    let value = line.slice(i + 1).trim();

    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean);
    } else if (value === 'true' || value === 'false') {
      value = value === 'true';
    } else {
      value = value.replace(/^["']|["']$/g, '');
    }
    data[key] = value;
  }
  return { data, content: raw.slice(m[0].length) };
}

/* ── Дата ────────────────────────────────────────────────────────────────
   Intl вместо ручного массива месяцев: он же корректно склоняет «15 августа». */
const MONTH_FMT = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric', month: 'long', year: 'numeric',
});
function humanDate(iso) {
  const d = new Date(iso + 'T00:00:00Z');
  if (Number.isNaN(d.getTime())) throw new Error(`blog: некорректная дата «${iso}»`);
  return MONTH_FMT.format(d);
}

function readingTime(markdown) {
  const words = markdown.replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean).length;
  const min = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  // 1 минута, 2–4 минуты, 5+ минут
  const last = min % 10, tens = min % 100;
  const word = (last === 1 && tens !== 11) ? 'минута'
    : (last >= 2 && last <= 4 && (tens < 12 || tens > 14)) ? 'минуты' : 'минут';
  return { min, label: `${min} ${word} чтения` };
}

/* ── Разбор Markdown ─────────────────────────────────────────────────────
   Заголовкам H2 проставляем id: по ним строится оглавление и работают
   якорные ссылки из других статей. */
function slugifyHeading(text, used) {
  const map = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
    и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's',
    т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y',
    ь: '', э: 'e', ю: 'yu', я: 'ya' };
  let s = text.toLowerCase().replace(/<[^>]+>/g, '')
    .split('').map((c) => (map[c] !== undefined ? map[c] : c)).join('')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'section';
  // Коллизия id ломает и оглавление, и якоря — добиваем номером.
  let out = s, n = 2;
  while (used.has(out)) out = `${s}-${n++}`;
  used.add(out);
  return out;
}

function renderMarkdown(md) {
  const used = new Set();
  const headings = [];
  const renderer = new marked.Renderer();

  renderer.heading = function ({ tokens, depth }) {
    const text = this.parser.parseInline(tokens);
    if (depth !== 2) return `<h${depth}>${text}</h${depth}>\n`;
    const id = slugifyHeading(text, used);
    headings.push({ id, text });
    return `<h2 id="${id}">${text}</h2>\n`;
  };

  // Внешние ссылки открываем в новой вкладке и закрываем от передачи прав.
  renderer.link = function ({ href, title, tokens }) {
    const text = this.parser.parseInline(tokens);
    const ext = /^https?:\/\//.test(href) && !href.includes('xn-----6kcaabbmngo7aadrlotojgvup6c4e');
    return `<a href="${href}"${title ? ` title="${esc(title)}"` : ''}`
      + (ext ? ' target="_blank" rel="noopener noreferrer"' : '') + `>${text}</a>`;
  };

  // Картинки — ленивые и с размерами по умолчанию, чтобы не прыгала вёрстка.
  renderer.image = ({ href, title, text }) =>
    `<img src="${href}" alt="${esc(text || '')}"${title ? ` title="${esc(title)}"` : ''} loading="lazy" decoding="async">`;

  const html = marked.parse(md, { renderer, gfm: true, breaks: false });
  return { html, headings };
}

/* ── Чтение статей ───────────────────────────────────────────────────────── */
export function loadPosts(srcDir) {
  const dir = join(srcDir, 'blog');
  if (!existsSync(dir)) return [];

  const posts = readdirSync(dir).filter((f) => f.endsWith('.md')).map((file) => {
    const raw = readFileSync(join(dir, file), 'utf8');
    const { data, content } = parseFrontmatter(raw, file);

    for (const req of ['title', 'description', 'date']) {
      if (!data[req]) throw new Error(`blog: в ${file} не заполнено обязательное поле «${req}»`);
    }
    const slug = file.replace(/\.md$/, '');
    const { html, headings } = renderMarkdown(content);

    return {
      slug,
      file: `blog/${file}`,
      path: `/blog/${slug}/`,
      title: data.title,
      description: data.description,
      date: data.date,
      updated: data.updated || null,
      tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []),
      service: data.service || null,
      cover: data.cover || null,
      draft: data.draft === true,
      html,
      headings,
      reading: readingTime(content),
    };
  }).filter((p) => !p.draft);

  // Свежие сверху: и в ленте, и в блоке «читайте также».
  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return posts;
}

/* ── Блок автора ─────────────────────────────────────────────────────────
   Стоит под каждой статьёй и ведёт на /about/. Это и польза читателю, и
   сигнал авторства для поисковика: текст написан конкретным человеком,
   чья квалификация подтверждена на отдельной странице. */
const authorCard = `<aside class="post-author">
  <img src="/assets/portrait.jpg" alt="${AUTHOR}" width="72" height="72" loading="lazy">
  <div>
    <div class="post-author-name">${AUTHOR}</div>
    <p class="post-author-bio">Частный интернет-маркетолог. В digital с 2019 года, прошёл путь от младшего специалиста до тимлида команды контекстологов, с 2025 года веду проекты самостоятельно. <a href="/about/">Подробнее обо мне</a></p>
  </div>
</aside>`;

function ctaBlock(service) {
  const link = service || '/contacts/';
  return `<section class="section">
  <div class="wrap">
    <div class="cta-final reveal">
      <h2>Нужна помощь с задачей из статьи?</h2>
      <p>Разберу вашу ситуацию на бесплатной консультации и скажу честно, что стоит делать, а что — нет.</p>
      <div class="btn-row" style="justify-content:center;">
        <a class="btn btn-fill btn-lg" href="/contacts/">Обсудить задачу</a>
        <a class="btn btn-ghost btn-lg" href="${link}">Посмотреть услугу</a>
      </div>
    </div>
  </div>
</section>`;
}

/* ── Страница статьи ─────────────────────────────────────────────────────── */
export function renderPost(post, allPosts) {
  const crumbs = breadcrumbs([['/blog/', 'Блог'], [post.path, post.title]]);

  const toc = post.headings.length >= 3 ? `<nav class="post-toc" aria-label="Содержание статьи">
      <div class="post-toc-title">В статье</div>
      <ol>
${post.headings.map((h) => `        <li><a href="#${h.id}">${h.text}</a></li>`).join('\n')}
      </ol>
    </nav>` : '';

  const tags = post.tags.length
    ? `<div class="post-tags">${post.tags.map((t) => `<span class="post-tag">${esc(t)}</span>`).join('')}</div>`
    : '';

  const related = allPosts.filter((p) => p.slug !== post.slug).slice(0, 3);
  const relatedBlock = related.length ? `<section class="section">
  <div class="wrap">
    <h2 class="reveal">Читайте также</h2>
    <div class="post-grid reveal">
${related.map(postCard).join('\n')}
    </div>
  </div>
</section>` : '';

  const body = `<article class="section post">
  <div class="wrap wrap-narrow">
    ${crumbs.visible}
    ${tags}
    <h1>${esc(post.title)}</h1>
    <div class="post-meta">
      <time datetime="${post.date}">${humanDate(post.date)}</time>
      <span class="post-meta-sep">·</span>
      <span>${post.reading.label}</span>
      ${post.updated ? `<span class="post-meta-sep">·</span><span>обновлено ${humanDate(post.updated)}</span>` : ''}
    </div>
    ${post.cover ? `<img class="post-cover" src="${post.cover}" alt="${esc(post.title)}" width="1200" height="630">` : ''}
    ${toc}
    <div class="prose">
${post.html}
    </div>
    ${authorCard}
  </div>
</article>

${ctaBlock(post.service)}

${relatedBlock}`;

  /* BlogPosting: author и publisher ссылаются на #person с главной — тот же
     идентификатор, что у Person в ProfilePage. Так статьи, сайт и профиль
     специалиста связываются в одну сущность. */
  const schema = [
    crumbs.schema,
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.updated || post.date,
      inLanguage: 'ru-RU',
      author: { '@id': SITE + '/#person' },
      publisher: { '@id': SITE + '/#person' },
      mainEntityOfPage: { '@type': 'WebPage', '@id': SITE + post.path },
      url: SITE + post.path,
      ...(post.cover ? { image: SITE + post.cover } : {}),
      ...(post.tags.length ? { keywords: post.tags.join(', ') } : {}),
      wordCount: post.reading.min * WORDS_PER_MINUTE,
    },
  ];

  return renderPage({
    path: post.path,
    title: `${post.title} — блог Даниила Карацапова`,
    description: post.description,
    ogImage: post.cover || '/assets/og/blog.jpg',
    ogType: 'article',
    body,
    schema,
  });
}

/* ── Карточка в ленте ────────────────────────────────────────────────────── */
function postCard(post) {
  return `      <a class="post-card" href="${post.path}">
        ${post.cover ? `<img class="post-card-cover" src="${post.cover}" alt="" width="600" height="315" loading="lazy">` : ''}
        <div class="post-card-body">
          <div class="post-card-meta"><time datetime="${post.date}">${humanDate(post.date)}</time> · ${post.reading.label}</div>
          <h3 class="post-card-title">${esc(post.title)}</h3>
          <p class="post-card-desc">${esc(post.description)}</p>
          <span class="post-card-more">Читать →</span>
        </div>
      </a>`;
}

/* ── Лента /blog/ ────────────────────────────────────────────────────────── */
export function renderIndex(posts) {
  const crumbs = breadcrumbs([['/blog/', 'Блог']]);

  const body = `<header class="hero" data-screen-label="Блог">
  <div class="wrap">
    ${crumbs.visible}
    <div class="eyebrow">Блог</div>
    <h1>Разборы по <span class="accent">интернет-маркетингу</span></h1>
    <p class="lead">Пишу о том, с чем сталкиваюсь в работе: как устроен Яндекс Директ, куда утекает рекламный бюджет, что считать результатом. Без пересказа справки Яндекса — только практика.</p>
  </div>
</header>

<section class="section">
  <div class="wrap">
${posts.length ? `    <div class="post-grid reveal">
${posts.map(postCard).join('\n')}
    </div>`
    : `    <p class="lead">Первые статьи скоро появятся.</p>`}
  </div>
</section>`;

  const schema = [
    crumbs.schema,
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      '@id': SITE + '/blog/#blog',
      name: 'Блог Даниила Карацапова',
      description: 'Разборы по контекстной рекламе, таргету, аналитике и продвижению малого бизнеса.',
      url: SITE + '/blog/',
      inLanguage: 'ru-RU',
      author: { '@id': SITE + '/#person' },
      publisher: { '@id': SITE + '/#person' },
      blogPost: posts.map((p) => ({
        '@type': 'BlogPosting',
        headline: p.title,
        description: p.description,
        datePublished: p.date,
        url: SITE + p.path,
        author: { '@id': SITE + '/#person' },
      })),
    },
  ];

  return renderPage({
    path: '/blog/',
    title: 'Блог о контекстной рекламе и интернет-маркетинге — Даниил Карацапов',
    description: 'Практические разборы по Яндекс Директу, таргетированной рекламе, аналитике и продвижению малого бизнеса от частного интернет-маркетолога.',
    ogImage: '/assets/og/blog.jpg',
    body,
    schema,
  });
}

/* ── RSS ─────────────────────────────────────────────────────────────────
   Дёшево и полезно: по фиду статьи забирают агрегаторы, а Яндекс быстрее
   узнаёт о новых публикациях, чем при обходе по карте сайта. */
export function renderRss(posts) {
  const items = posts.map((p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${SITE}${p.path}</link>
      <guid isPermaLink="true">${SITE}${p.path}</guid>
      <description>${esc(p.description)}</description>
      <pubDate>${new Date(p.date + 'T00:00:00Z').toUTCString()}</pubDate>
      <author>${AUTHOR}</author>
    </item>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Блог Даниила Карацапова</title>
    <link>${SITE}/blog/</link>
    <description>Разборы по контекстной рекламе, таргету и интернет-маркетингу</description>
    <language>ru</language>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}
