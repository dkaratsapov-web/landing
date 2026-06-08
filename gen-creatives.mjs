import sharp from 'sharp';
import { mkdirSync, existsSync } from 'fs';

const CASES = 'project/assets/cases';

const OUT = 'creatives';
mkdirSync(OUT, { recursive: true });

// ---- brand tokens ----
const BG = '#0a0b0a';
const SURFACE = '#141513';
const ACCENT = '#b6f01e';
const WHITE = '#ffffff';
const MUTED = '#9a9c97';
const W = 1080, H = 1350, PAD = 90;

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// approximate character width factor for Nunito by weight
function charW(size, weight) {
  const f = weight >= 800 ? 0.55 : weight >= 700 ? 0.54 : weight >= 600 ? 0.52 : 0.5;
  return size * f;
}
function wrap(text, size, weight, maxW) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  const fits = s => s.length * charW(size, weight) <= maxW;
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (fits(t) || !cur) cur = t; else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines;
}

const IMGH = 520; // photo band height

async function creative(d, idx) {
  const maxW = W - PAD * 2;
  const parts = [];
  const hasPhoto = !!d.photo && existsSync(d.photo);
  parts.push(`<defs>
    <radialGradient id="g" cx="80%" cy="0%" r="70%">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0"/></radialGradient>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${BG}" stop-opacity="0"/>
      <stop offset="55%" stop-color="${BG}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${BG}" stop-opacity="1"/></linearGradient>
    <linearGradient id="topscrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/></linearGradient></defs>`);

  if (!hasPhoto) {
    // fallback branded photo band
    parts.push(`<rect x="0" y="0" width="${W}" height="${IMGH}" fill="${SURFACE}"/>`);
    parts.push(`<rect x="0" y="0" width="${W}" height="${IMGH}" fill="url(#g)"/>`);
  }
  // gradient that fades photo into the background
  parts.push(`<rect x="0" y="0" width="${W}" height="${IMGH}" fill="url(#fade)"/>`);
  parts.push(`<rect x="0" y="0" width="${W}" height="200" fill="url(#topscrim)"/>`);

  // header row (over photo)
  parts.push(`<circle cx="${PAD+8}" cy="98" r="8" fill="${ACCENT}"/>`);
  parts.push(`<text x="${PAD+30}" y="107" font-family="Nunito" font-weight="700" font-size="26" letter-spacing="2" fill="${WHITE}">ДАНИИЛ КАРАЦАПОВ</text>`);

  // eyebrow (niche · city)
  let y = IMGH + 70;
  parts.push(`<text x="${PAD}" y="${y}" font-family="Nunito" font-weight="700" font-size="30" letter-spacing="1" fill="${ACCENT}">${esc(d.eyebrow.toUpperCase())}</text>`);

  // headline
  y += 80;
  const hSize = d.headline.length > 48 ? 56 : 64;
  const hLines = wrap(d.headline, hSize, 800, maxW);
  for (const ln of hLines) {
    parts.push(`<text x="${PAD}" y="${y}" font-family="Nunito" font-weight="800" font-size="${hSize}" fill="${WHITE}">${esc(ln)}</text>`);
    y += hSize * 1.12;
  }

  // metrics block (bottom anchored)
  const metrics = d.metrics.slice(0, 4);
  const rowH = 132;
  let my = H - PAD - 150 - (metrics.length - 1) * rowH;
  for (const m of metrics) {
    parts.push(`<rect x="${PAD}" y="${my - 52}" width="6" height="74" rx="3" fill="${ACCENT}"/>`);
    parts.push(`<text x="${PAD+34}" y="${my}" font-family="Nunito" font-weight="800" font-size="62" fill="${ACCENT}">${esc(m.v)}</text>`);
    const lx = PAD + 34 + m.v.length * charW(62, 800) * 1.12 + 40;
    const labelLines = wrap(m.l, 28, 600, W - PAD - lx);
    let ly = labelLines.length > 1 ? my - 32 : my - 18;
    for (const ll of labelLines) {
      parts.push(`<text x="${lx}" y="${ly}" font-family="Nunito" font-weight="600" font-size="28" fill="${WHITE}">${esc(ll)}</text>`);
      ly += 36;
    }
    my += rowH;
  }

  // footer
  parts.push(`<line x1="${PAD}" y1="${H-PAD-40}" x2="${W-PAD}" y2="${H-PAD-40}" stroke="#2a2b2a" stroke-width="2"/>`);
  parts.push(`<text x="${PAD}" y="${H-PAD}" font-family="Nunito" font-weight="700" font-size="26" fill="${WHITE}">Частный маркетолог · реклама и сайты</text>`);
  parts.push(`<text x="${W-PAD}" y="${H-PAD}" text-anchor="end" font-family="Nunito" font-weight="700" font-size="24" fill="${ACCENT}">карацапов-даниил-маркетинг.рф</text>`);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${parts.join('')}</svg>`;

  const layers = [];
  if (hasPhoto) {
    const photoBuf = await sharp(d.photo)
      .resize(W, IMGH, { fit: 'cover', position: 'attention' })
      .toBuffer();
    layers.push({ input: photoBuf, top: 0, left: 0 });
  }
  layers.push({ input: Buffer.from(svg), top: 0, left: 0 });

  return sharp({ create: { width: W, height: H, channels: 4, background: BG } })
    .composite(layers)
    .png()
    .toFile(`${OUT}/post-${String(idx).padStart(2,'0')}.png`);
}

const data = [
  { eyebrow: 'Частная школа · Москва', headline: 'Родители не записывались. Дело было в сайте', metrics: [
    {v:'+400%', l:'посетителей сайта за 4 месяца'},
    {v:'322%', l:'ROI за полгода'},
    {v:'+42%', l:'набор в классы и группы'} ] },
  { eyebrow: 'Салоны дверей · Москва', headline: '−38% к стоимости лида. Без смены бюджета', metrics: [
    {v:'+45%', l:'продаж'},
    {v:'−38%', l:'стоимость лида (CPL)'},
    {v:'7,3%', l:'ДРР — топ для мебельной ниши'} ] },
  { eyebrow: 'Трансферы · Анталия', headline: 'Туристы искали в Google — и не находили бизнес', metrics: [
    {v:'+85%', l:'заявок'},
    {v:'450%', l:'ROAS'},
    {v:'65%', l:'трафика из Google Ads'} ] },
  { eyebrow: 'Пластиковые окна · Тверь', headline: 'VK Ads дал 40% заказов. Начинали с нуля', metrics: [
    {v:'220%', l:'ROI'},
    {v:'−30%', l:'стоимость лида'},
    {v:'40%', l:'заказов из VK Ads'} ] },
  { eyebrow: 'Производство мебели · Казахстан', headline: 'Не было сайта. Через 3 месяца — ROI 340%', metrics: [
    {v:'+85%', l:'заявок'},
    {v:'340%', l:'ROI'},
    {v:'4500+', l:'посещений сайта в месяц'} ] },
  { eyebrow: 'Техника Apple · Тверь', headline: 'Конкуренция с федсетями. ROI 420%', metrics: [
    {v:'+53%', l:'продаж'},
    {v:'420%', l:'ROI'},
    {v:'−45%', l:'стоимость заявки'} ] },
  { eyebrow: 'Lounge Bar · Москва', headline: 'Бар был пустым в будни. ROI 520%', metrics: [
    {v:'+90%', l:'бронирований'},
    {v:'520%', l:'ROI с учётом повторных визитов'},
    {v:'170+', l:'броней в месяц из Директа'} ] },
  { eyebrow: 'Коворкинг · Сочи', headline: 'Запустили с нуля. +80% бронирований', metrics: [
    {v:'+80%', l:'бронирований за 5 месяцев'},
    {v:'400%', l:'ROI'},
    {v:'+250%', l:'посетителей сайта'} ] },
  { eyebrow: 'Клиника · Москва', headline: 'Записи +120%. Расходы на рекламу −28%', metrics: [
    {v:'+120%', l:'записей на приём'},
    {v:'−28%', l:'неэффективных расходов'},
    {v:'55%', l:'онлайн-записей из Яндекс Бизнес'} ] },
  { eyebrow: 'Производство упаковки · B2B', headline: 'B2B: +150% оптовых заявок, −60% CPL', metrics: [
    {v:'+150%', l:'заявок от B2B-клиентов'},
    {v:'−60%', l:'стоимость лида'},
    {v:'520%', l:'ROI'} ] },
  { eyebrow: 'Ресторан · Рублёвка', headline: 'ТОП-3 по запросу — без SEO-бюджета', metrics: [
    {v:'+110%', l:'бронирований'},
    {v:'65%', l:'новых гостей из Яндекс Бизнес'},
    {v:'ТОП-3', l:'по запросу «рестораны на Рублёвке»'} ] },
  { eyebrow: 'Каркасные дома · Тверь', headline: '+120% заявок при том же бюджете', metrics: [
    {v:'+120%', l:'заявок'},
    {v:'−45%', l:'стоимость лида'},
    {v:'280%', l:'ROI'} ] },
  { eyebrow: 'Опт сувениров · Балашиха', headline: '75% заказов без менеджера. 42 города', metrics: [
    {v:'+150%', l:'оптовых заказов'},
    {v:'75%', l:'заказов без участия менеджера'},
    {v:'42', l:'города новой географии'} ] },
  { eyebrow: 'Доставка еды · Москва', headline: 'Стартап → ТОП-5 в поиске, −50% поддержки', metrics: [
    {v:'+70%', l:'онлайн-заказов'},
    {v:'ТОП-5', l:'в поиске по ключевым запросам'},
    {v:'−50%', l:'затрат на поддержку'} ] },
  { eyebrow: 'Здоровое питание · Москва', headline: 'ROI 580%. Рекорд в нише доставки еды', metrics: [
    {v:'+120%', l:'заказов'},
    {v:'580%', l:'ROI — рекорд проекта'},
    {v:'−35%', l:'стоимость лида'} ] },
  { eyebrow: 'Детский центр · Тверь', headline: 'Набор вне сезона: 80% заполняемости', metrics: [
    {v:'+120%', l:'записей'},
    {v:'−42%', l:'стоимость лида'},
    {v:'80%', l:'заполняемость в межсезонье'} ] },
  { eyebrow: 'Салон красоты · Тверь', headline: 'Онлайн-записи выросли с 12% до 77%', metrics: [
    {v:'+75%', l:'новых клиентов'},
    {v:'77%', l:'онлайн-записей (было 12%)'},
    {v:'320%', l:'ROI'} ] },
  { eyebrow: 'Караоке-клуб · Санкт-Петербург', headline: 'Запуск с нуля: +78% заявок за 2 месяца', metrics: [
    {v:'+78%', l:'заявок'},
    {v:'−31%', l:'стоимость лида'},
    {v:'351%', l:'ROI'} ] },
];

const photos = ['school','profildoors','tosun','okna','mebeline','ipapa','nebo','artlife',
  'bmclinic','kaspack','berezka','karkas','alankara','ledizoj','zojefina','mishlenium',
  'blondinki','royalneva'];
data.forEach((d, i) => { d.photo = `${CASES}/${photos[i]}.jpg`; });

for (let i = 0; i < data.length; i++) await creative(data[i], i + 1);
console.log('done', data.length);
