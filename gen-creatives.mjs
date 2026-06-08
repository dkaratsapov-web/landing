import sharp from 'sharp';
import { mkdirSync, existsSync } from 'fs';

const CASES = 'project/assets/cases';
const OUT   = 'creatives';
mkdirSync(OUT, { recursive: true });

const BG     = '#0a0b0a';
const SURFACE= '#141513';
const ACCENT = '#b6f01e';
const WHITE  = '#ffffff';
const W = 1080, H = 1350, PAD = 80;
const IMGH = 500;

const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

function charW(size, weight) {
  const f = weight >= 800 ? 0.56 : weight >= 700 ? 0.54 : weight >= 600 ? 0.52 : 0.50;
  return size * f;
}
function wrap(text, size, weight, maxW) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (t.length * charW(size, weight) <= maxW || !cur) cur = t;
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines;
}

async function creative(d, idx) {
  const maxW   = W - PAD * 2;
  const parts  = [];
  const hasPhoto = !!d.photo && existsSync(d.photo);

  // ── gradients ──────────────────────────────────────────────
  parts.push(`<defs>
    <radialGradient id="gl" cx="75%" cy="0%" r="75%">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0"/></radialGradient>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${BG}" stop-opacity="0"/>
      <stop offset="52%" stop-color="${BG}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${BG}" stop-opacity="1"/></linearGradient>
    <linearGradient id="topscrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000" stop-opacity="0.60"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/></linearGradient></defs>`);

  if (!hasPhoto) {
    parts.push(`<rect width="${W}" height="${IMGH}" fill="${SURFACE}"/>`);
    parts.push(`<rect width="${W}" height="${IMGH}" fill="url(#gl)"/>`);
  }
  parts.push(`<rect x="0" y="0" width="${W}" height="${IMGH}" fill="url(#fade)"/>`);
  parts.push(`<rect x="0" y="0" width="${W}" height="220"   fill="url(#topscrim)"/>`);
  // bottom half bg
  parts.push(`<rect x="0" y="${IMGH}" width="${W}" height="${H-IMGH}" fill="${BG}"/>`);

  // ── header (over photo) ───────────────────────────────────
  parts.push(`<circle cx="${PAD+8}" cy="96" r="8" fill="${ACCENT}"/>`);
  parts.push(`<text x="${PAD+30}" y="105" font-family="Nunito" font-weight="700" font-size="24" letter-spacing="2" fill="${WHITE}">ДАНИИЛ КАРАЦАПОВ</text>`);

  // ── eyebrow ───────────────────────────────────────────────
  let y = IMGH + 56;
  parts.push(`<text x="${PAD}" y="${y}" font-family="Nunito" font-weight="700" font-size="28" letter-spacing="1" fill="${ACCENT}">${esc(d.eyebrow.toUpperCase())}</text>`);

  // ── headline ──────────────────────────────────────────────
  y += 72;
  const hSize  = d.headline.length > 44 ? 54 : 62;
  const hLines = wrap(d.headline, hSize, 800, maxW);
  for (const ln of hLines) {
    parts.push(`<text x="${PAD}" y="${y}" font-family="Nunito" font-weight="800" font-size="${hSize}" fill="${WHITE}">${esc(ln)}</text>`);
    y += Math.round(hSize * 1.15);
  }

  // ── tools chips ───────────────────────────────────────────
  y += 24;
  const chipH = 44, chipR = 8, chipPadX = 18, chipGap = 12;
  const chipFontSize = 24;
  let cx = PAD;
  for (const tool of d.tools) {
    const tw = tool.length * charW(chipFontSize, 600) + chipPadX * 2;
    // wrap to next row if needed
    if (cx + tw > W - PAD && cx > PAD) { cx = PAD; y += chipH + 10; }
    const chipTop = y - chipH + 8;
    const chipTextY = chipTop + chipH / 2 + chipFontSize * 0.34;
    parts.push(`<rect x="${cx}" y="${chipTop}" width="${tw}" height="${chipH}" rx="${chipR}" fill="#1e2018"/>`);
    parts.push(`<text x="${cx + tw/2}" y="${chipTextY}" text-anchor="middle" font-family="Nunito" font-weight="600" font-size="${chipFontSize}" fill="${ACCENT}">${esc(tool)}</text>`);
    cx += tw + chipGap;
  }
  y += chipH + 30;

  // ── metrics ───────────────────────────────────────────────
  const metrics = d.metrics.slice(0, 3);
  const rowH = 116;
  for (const m of metrics) {
    parts.push(`<rect x="${PAD}" y="${y-44}" width="5" height="62" rx="3" fill="${ACCENT}"/>`);
    const numX = PAD + 24;
    parts.push(`<text x="${numX}" y="${y}" font-family="Nunito" font-weight="800" font-size="56" fill="${ACCENT}">${esc(m.v)}</text>`);
    const lx = numX + m.v.length * charW(56, 800) * 1.08 + 28;
    const lLines = wrap(m.l, 26, 600, W - PAD - lx);
    let ly = lLines.length > 1 ? y - 22 : y - 10;
    for (const ll of lLines) {
      parts.push(`<text x="${lx}" y="${ly}" font-family="Nunito" font-weight="600" font-size="26" fill="${WHITE}">${esc(ll)}</text>`);
      ly += 32;
    }
    y += rowH;
  }

  // ── footer ────────────────────────────────────────────────
  const fY = H - PAD;
  parts.push(`<line x1="${PAD}" y1="${fY-42}" x2="${W-PAD}" y2="${fY-42}" stroke="#2a2b2a" stroke-width="1.5"/>`);
  parts.push(`<text x="${PAD}" y="${fY}" font-family="Nunito" font-weight="700" font-size="24" fill="${WHITE}">Частный маркетолог · реклама и сайты</text>`);
  parts.push(`<text x="${W-PAD}" y="${fY}" text-anchor="end" font-family="Nunito" font-weight="700" font-size="22" fill="${ACCENT}">карацапов-даниил-маркетинг.рф</text>`);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${parts.join('')}</svg>`;

  const layers = [];
  if (hasPhoto) {
    const photoBuf = await sharp(d.photo)
      .resize(W, IMGH, { fit: 'cover', position: 'attention' })
      .toBuffer();
    layers.push({ input: photoBuf, top: 0, left: 0 });
  }
  layers.push({ input: Buffer.from(svg), top: 0, left: 0 });

  return sharp({ create: { width: W, height: H, channels: 4, background: BG } })
    .composite(layers).png()
    .toFile(`${OUT}/post-${String(idx).padStart(2,'0')}.png`);
}

// ── data ──────────────────────────────────────────────────────────────────────
const data = [
  { eyebrow: 'Частная школа · Москва',
    headline: 'Родители не записывались. Дело было в сайте',
    tools: ['Разработка сайта','Яндекс Директ','VK Ads','Яндекс Бизнес','RoiStat'],
    metrics: [{v:'+400%',l:'посетителей за 4 мес.'},{v:'322%',l:'ROI'},{v:'+42%',l:'набор в классы'}] },

  { eyebrow: 'Салоны дверей · Москва',
    headline: 'Три канала, сквозная аналитика — и −38% к стоимости лида',
    tools: ['Яндекс Директ','VK Ads','Яндекс Бизнес','RoiStat'],
    metrics: [{v:'+45%',l:'продаж'},{v:'−38%',l:'стоимость лида'},{v:'7,3%',l:'ДРР'}] },

  { eyebrow: 'Трансферы · Анталия',
    headline: 'Туристы искали в Google — и не находили бизнес',
    tools: ['Разработка сайта','Google Ads'],
    metrics: [{v:'+85%',l:'заявок'},{v:'450%',l:'ROAS'},{v:'−18%',l:'расходов на рекламу'}] },

  { eyebrow: 'Пластиковые окна · Тверь',
    headline: 'Соцсети с нуля — и 40% всех заказов из VK Ads',
    tools: ['Яндекс Директ','VK Ads','Сообщество ВКонтакте','RoiStat'],
    metrics: [{v:'220%',l:'ROI'},{v:'−30%',l:'стоимость лида'},{v:'+1200',l:'подписчиков в ВКонтакте'}] },

  { eyebrow: 'Производство мебели · Казахстан',
    headline: 'Не было сайта. За 2 месяца — ROI 340% и 4500 визитов',
    tools: ['Разработка сайта','Google Ads'],
    metrics: [{v:'+85%',l:'заявок'},{v:'340%',l:'ROI'},{v:'4500+',l:'посещений в месяц'}] },

  { eyebrow: 'Техника Apple · Тверь',
    headline: 'Конкурировать с М.Видео и DNS — и выиграть',
    tools: ['Яндекс Директ','Яндекс Бизнес','RoiStat'],
    metrics: [{v:'+53%',l:'продаж'},{v:'420%',l:'ROI'},{v:'−45%',l:'стоимость заявки'}] },

  { eyebrow: 'Lounge Bar · Москва',
    headline: 'Бар пустовал в будни. Теперь 170+ броней из Директа',
    tools: ['Яндекс Директ','Яндекс Бизнес','RoiStat'],
    metrics: [{v:'+90%',l:'бронирований'},{v:'520%',l:'ROI'},{v:'40%',l:'новых из Яндекс Бизнес'}] },

  { eyebrow: 'Коворкинг · Сочи',
    headline: 'Стартап без имени — с нуля до 80% заполняемости',
    tools: ['Разработка сайта','Яндекс Директ','VK Ads','SEO','SMM','Яндекс Бизнес'],
    metrics: [{v:'+80%',l:'бронирований за 5 мес.'},{v:'400%',l:'ROI'},{v:'+250%',l:'трафика сайта'}] },

  { eyebrow: 'Клиника · Москва',
    headline: 'Записей к врачам стало вдвое больше, расходов — меньше',
    tools: ['Яндекс Директ','Яндекс Бизнес','RoiStat'],
    metrics: [{v:'+120%',l:'записей на приём'},{v:'−28%',l:'расходов на рекламу'},{v:'55%',l:'записей через Яндекс Бизнес'}] },

  { eyebrow: 'Производство упаковки · B2B',
    headline: 'Оптовые заявки выросли в 2,5 раза, лид подешевел на 60%',
    tools: ['Разработка сайта','Яндекс Директ','Яндекс Бизнес','RoiStat'],
    metrics: [{v:'+150%',l:'B2B-заявок'},{v:'−60%',l:'стоимость лида'},{v:'520%',l:'ROI'}] },

  { eyebrow: 'Ресторан · Рублёвка',
    headline: 'ТОП-3 в поиске и 65% гостей из Яндекс Бизнес',
    tools: ['Яндекс Директ','Яндекс Бизнес'],
    metrics: [{v:'+110%',l:'бронирований'},{v:'65%',l:'гостей из Яндекс Бизнес'},{v:'ТОП-3',l:'в поиске по нише'}] },

  { eyebrow: 'Каркасные дома · Тверь',
    headline: 'Тот же бюджет, глубокая оптимизация — заявок вдвое больше',
    tools: ['Яндекс Директ','Яндекс Бизнес'],
    metrics: [{v:'+120%',l:'заявок'},{v:'−45%',l:'стоимость лида'},{v:'280%',l:'ROI'}] },

  { eyebrow: 'Опт сувениров · Балашиха',
    headline: '75% заказов без менеджера и 42 города за полгода',
    tools: ['Яндекс Директ'],
    metrics: [{v:'+150%',l:'оптовых заказов'},{v:'75%',l:'заказов без менеджера'},{v:'42',l:'города'}] },

  { eyebrow: 'Доставка еды · Москва',
    headline: 'Стартап без клиентов вышел в ТОП-5 поиска за 3 месяца',
    tools: ['Разработка сайта','Яндекс Директ'],
    metrics: [{v:'+70%',l:'онлайн-заказов'},{v:'ТОП-5',l:'в поиске'},{v:'−50%',l:'затрат на поддержку'}] },

  { eyebrow: 'Здоровое питание · Москва',
    headline: 'Конкуренция в ЗОЖ-нише — и рекордный ROI 580%',
    tools: ['Разработка сайта','Яндекс Директ','RoiStat'],
    metrics: [{v:'+120%',l:'заказов'},{v:'580%',l:'ROI — рекорд'},{v:'−35%',l:'стоимость лида'}] },

  { eyebrow: 'Детский центр · Тверь',
    headline: 'Победили сезонность: 80% заполняемость круглый год',
    tools: ['Яндекс Директ'],
    metrics: [{v:'+120%',l:'записей'},{v:'−42%',l:'стоимость лида'},{v:'80%',l:'заполняемость в межсезонье'}] },

  { eyebrow: 'Салон красоты · Тверь',
    headline: 'Онлайн-запись выросла с 12% до 77% — без нового администратора',
    tools: ['VK Ads','Яндекс Бизнес','Яндекс Директ'],
    metrics: [{v:'+75%',l:'новых клиентов'},{v:'77%',l:'онлайн-записей (было 12%)'},{v:'320%',l:'ROI'}] },

  { eyebrow: 'Караоке-клуб · Санкт-Петербург',
    headline: 'Открытие с нуля — реклама выстроила поток с первого дня',
    tools: ['Разработка сайта','Яндекс Директ','Яндекс Бизнес','SEO','RoiStat'],
    metrics: [{v:'+78%',l:'заявок за 2 месяца'},{v:'−31%',l:'стоимость лида'},{v:'351%',l:'ROI'}] },
];

const photos = ['school','profildoors','tosun','okna','mebeline','ipapa','nebo','artlife',
  'bmclinic','kaspack','berezka','karkas','alankara','ledizoj','zojefina','mishlenium',
  'blondinki','royalneva'];
data.forEach((d, i) => { d.photo = `${CASES}/${photos[i]}.jpg`; });

for (let i = 0; i < data.length; i++) await creative(data[i], i + 1);
console.log('done', data.length);
