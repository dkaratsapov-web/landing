/* icons.jsx — minimal thin-stroke line icons (Lucide-style), inlined for reliability.
   All inherit currentColor. Exported to window. */
const Icon = ({ d, paths, size = 24, sw = 1.6, fill = "none", style, ...rest }) => (
  <svg className="i" width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
    style={style} {...rest}>
    {d ? <path d={d} /> : paths}
  </svg>
);

const IconTarget = (p) => <Icon {...p} paths={<>
  <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
</>} />;
const IconUsers = (p) => <Icon {...p} paths={<>
  <path d="M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19" /><circle cx="10" cy="8" r="3.2" />
  <path d="M20 19v-1.5a3.5 3.5 0 0 0-2.7-3.4" /><path d="M15.2 5.2a3.2 3.2 0 0 1 0 5.6" />
</>} />;
const IconMonitor = (p) => <Icon {...p} paths={<>
  <rect x="3" y="4" width="18" height="12" rx="1.5" /><path d="M8 20h8M12 16v4" />
</>} />;
const IconChart = (p) => <Icon {...p} paths={<>
  <path d="M4 19V5M4 19h16" /><path d="M8 16v-4M12 16V8M16 16v-6M20 16v-9" />
</>} />;
const IconLayers = (p) => <Icon {...p} paths={<>
  <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" /><path d="m4 12 8 4.5 8-4.5" /><path d="m4 16.5 8 4.5 8-4.5" />
</>} />;
const IconPhone = (p) => <Icon {...p} paths={<>
  <path d="M6.5 4h3l1.3 4-2 1.4a11 11 0 0 0 4.8 4.8l1.4-2 4 1.3v3a1.5 1.5 0 0 1-1.6 1.5A15.5 15.5 0 0 1 5 6.6 1.5 1.5 0 0 1 6.5 4Z" />
</>} />;
const IconSend = (p) => <Icon {...p} paths={<>
  <path d="M21 4 3 11l6 2.5L11 20l3.5-6L21 4Z" /><path d="m9 13.5 5.5-5" />
</>} />;
const IconPlane = (p) => <Icon {...p} fill="currentColor" sw={0} paths={<path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />} />;
const IconArrowRight = (p) => <Icon {...p} paths={<><path d="M5 12h14M13 6l6 6-6 6" /></>} />;
const IconArrowDown = (p) => <Icon {...p} paths={<><path d="M12 5v14M6 13l6 6 6-6" /></>} />;
const IconChevron = (p) => <Icon {...p} paths={<><path d="m6 9 6 6 6-6" /></>} />;
const IconCheck = (p) => <Icon {...p} paths={<><path d="m5 12.5 4.5 4.5L19 7" /></>} />;
const IconClose = (p) => <Icon {...p} paths={<><path d="M6 6l12 12M18 6 6 18" /></>} />;
const IconBolt = (p) => <Icon {...p} paths={<><path d="M13 3 5 13h5l-1 8 8-10h-5l1-8Z" /></>} />;
const IconShield = (p) => <Icon {...p} paths={<><path d="M12 3 5 6v5c0 4.2 2.9 7.6 7 9 4.1-1.4 7-4.8 7-9V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></>} />;
const IconEye = (p) => <Icon {...p} paths={<><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.6" /></>} />;
const IconHandshake = (p) => <Icon {...p} paths={<>
  <path d="m11 14 2 2 4-4 4 4M3 12l4-4 4 4-2 2" /><path d="M7 8 9 6h6l2 2" />
</>} />;
const IconStar = (p) => <Icon {...p} paths={<><path d="m12 4 2.3 4.7 5.2.8-3.8 3.7.9 5.1L12 16l-4.6 2.4.9-5.1L4.5 9.5l5.2-.8L12 4Z" /></>} />;
const IconQuote = (p) => <Icon {...p} paths={<>
  <path d="M9 7H6a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v-1a4 4 0 0 1-2-3.5M19 7h-3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v-1a4 4 0 0 1-2-3.5" />
</>} />;
const IconSearch = (p) => <Icon {...p} paths={<><circle cx="11" cy="11" r="6" /><path d="m20 20-3.5-3.5" /></>} />;
const IconClock = (p) => <Icon {...p} paths={<><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>} />;
const IconMap = (p) => <Icon {...p} paths={<><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></>} />;
const IconCar = (p) => <Icon {...p} paths={<><path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13M5 13h14v4H5zM5 17v2M19 17v2" /><circle cx="8" cy="14.5" r="0.6" fill="currentColor" /><circle cx="16" cy="14.5" r="0.6" fill="currentColor" /></>} />;

/* ── Брендовые знаки ──────────────────────────────────────────────────────
   Здесь не тонкие линии, а заливка: логотип мессенджера обведённым контуром
   перестаёт узнаваться, а узнавание — единственное, зачем он тут нужен.
   Те же самые пути лежат в contacts/index.html (страница со своей вёрсткой,
   она не проходит через JSX). Расхождение ловит checkBrandIcons() в
   build.mjs: два самолётика разной формы на соседних страницах читаются как
   недосмотр быстрее, чем любая другая мелочь.

   Про MAX. Официального знака у меня нет, и рисовать «похожий» я не стал:
   выдуманный логотип хуже честной иконки сообщения. Здесь силуэт диалога —
   он не притворяется фирменным. Появится настоящий SVG — меняется в одном
   месте, оба места подхватят. */
const BRAND = {
  telegram: 'M21.94 4.6 18.6 20.3c-.25 1.1-.9 1.37-1.83.85l-5.05-3.72-2.44 2.35c-.27.27-.5.5-1 .5l.36-5.1L17.9 6.1c.4-.36-.09-.56-.62-.2L5.8 13.06l-4.98-1.56c-1.08-.34-1.1-1.08.23-1.6L20.5 2.55c.9-.33 1.7.22 1.44 2.05Z',
  whatsapp: 'M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.97L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.02h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.37c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.69 8.4-8.23 8.4Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z',
  max: 'M12.4 3.5C16.9 3.5 20.5 6.9 20.5 11C20.5 15.1 16.9 18.5 12.4 18.5C11.3 18.5 10.2 18.3 9.3 17.9L5.6 19.8C5.2 20 4.8 19.6 4.9 19.2L5.7 15.9C4.8 14.6 4.3 12.9 4.3 11C4.3 6.9 7.9 3.5 12.4 3.5ZM13 7.5A3.1 3.1 0 1 0 13 13.7A3.1 3.1 0 1 0 13 7.5Z',
  dzen: 'M12 1.5c0 5.8 4.7 10.5 10.5 10.5-5.8 0-10.5 4.7-10.5 10.5 0-5.8-4.7-10.5-10.5-10.5C7.3 12 12 7.3 12 1.5Z',
};
const brandIcon = (key) => (p) => <Icon {...p} fill="currentColor" sw={0} d={BRAND[key]} />;
const IconTelegram = brandIcon('telegram');
const IconWhatsApp = brandIcon('whatsapp');
const IconMax = brandIcon('max');
const IconDzen = brandIcon('dzen');
const IconMail = (p) => <Icon {...p} paths={<>
  <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" /><path d="m2.9 7.5 9.1 5.6 9.1-5.6" />
</>} />;
const IconCopy = (p) => <Icon {...p} paths={<>
  <rect x="9" y="9" width="11" height="11" rx="2.4" /><path d="M15 5.5A2.5 2.5 0 0 0 12.5 4H6a2 2 0 0 0-2 2v6.5A2.5 2.5 0 0 0 6.5 15" />
</>} />;

Object.assign(window, {
  Icon, IconTarget, IconUsers, IconMonitor, IconChart, IconLayers, IconPhone,
  IconSend, IconArrowRight, IconArrowDown, IconChevron, IconCheck, IconClose,
  IconBolt, IconShield, IconEye, IconHandshake, IconStar, IconQuote, IconSearch,
  IconClock, IconMap, IconCar, IconPlane,
  IconTelegram, IconWhatsApp, IconMax, IconDzen, IconMail, IconCopy, BRAND,
});
