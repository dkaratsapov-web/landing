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

Object.assign(window, {
  Icon, IconTarget, IconUsers, IconMonitor, IconChart, IconLayers, IconPhone,
  IconSend, IconArrowRight, IconArrowDown, IconChevron, IconCheck, IconClose,
  IconBolt, IconShield, IconEye, IconHandshake, IconStar, IconQuote, IconSearch,
  IconClock, IconMap,
});
