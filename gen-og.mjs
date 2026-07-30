import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const W = 1200, H = 630;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0d0d0f"/>
      <stop offset="60%" stop-color="#111114"/>
      <stop offset="100%" stop-color="#08080a"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.82" cy="0.22" r="0.55">
      <stop offset="0%" stop-color="#b6f01e" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="#b6f01e" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="#ffffff" stroke-opacity="0.035" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect x="0" y="0" width="${W}" height="6" fill="#b6f01e"/>

  <g transform="translate(88 92) scale(1.5)">
    <path d="M5 5L13.1505 42L27.1012 29.4506L12.6396 13.0136L34.6486 25.502L46 20.4601L5 5Z" fill="#D6FF41"/>
    <path d="M35 29.0967L30.2839 45V29.6413L24.6612 23L35 29.0967ZM23 39.4725L27.4277 45V35.3329L23 39.4725Z" fill="#D6FF41"/>
  </g>

  <text x="176" y="140" font-family="DejaVu Sans, Nunito, sans-serif" font-size="30" font-weight="600"
        fill="#a1a1a6" letter-spacing="1.5">ИНТЕРНЕТ-МАРКЕТОЛОГ</text>

  <text x="88" y="290" font-family="DejaVu Sans, Nunito, sans-serif" font-size="82" font-weight="700" fill="#f5f5f7">Даниил Карацапов</text>

  <text x="88" y="374" font-family="DejaVu Sans, Nunito, sans-serif" font-size="40" font-weight="400" fill="#c8c8cd">Контекст, таргет, GEO и сайты —</text>
  <text x="88" y="428" font-family="DejaVu Sans, Nunito, sans-serif" font-size="40" font-weight="400" fill="#c8c8cd">веду проект <tspan fill="#c4f53e" font-weight="700">лично</tspan>, без посредников</text>

  <g font-family="DejaVu Sans, Nunito, sans-serif">
    <rect x="88"  y="490" width="224" height="66" rx="33" fill="#ffffff" fill-opacity="0.05" stroke="#ffffff" stroke-opacity="0.14"/>
    <text x="200" y="532" font-size="28" font-weight="600" fill="#e8e8ec" text-anchor="middle">9+ лет опыта</text>

    <rect x="336" y="490" width="176" height="66" rx="33" fill="#ffffff" fill-opacity="0.05" stroke="#ffffff" stroke-opacity="0.14"/>
    <text x="424" y="532" font-size="28" font-weight="600" fill="#e8e8ec" text-anchor="middle">70+ ниш</text>

    <rect x="536" y="490" width="344" height="66" rx="33" fill="#b6f01e" fill-opacity="0.13" stroke="#b6f01e" stroke-opacity="0.34"/>
    <text x="708" y="532" font-size="28" font-weight="700" fill="#c4f53e" text-anchor="middle">окупаемость до 520%</text>
  </g>
</svg>`;

writeFileSync('/tmp/claude-0/og.svg', svg);
await sharp(Buffer.from(svg)).jpeg({ quality: 86, mozjpeg: true }).toFile('project/assets/og-cover.jpg');
const meta = await sharp('project/assets/og-cover.jpg').metadata();
console.log('og-cover.jpg', meta.width + 'x' + meta.height);
