/* build-kp.mjs — собирает самодостаточный HTML коммерческого предложения:
   подставляет шрифт в base64 вместо плейсхолдера, чтобы файл открывался
   и печатался одинаково на любой машине без интернета. */
import { readFileSync, writeFileSync } from 'node:fs';
const src = readFileSync('kp-plainglobal.src.html', 'utf8');
const font = readFileSync('nunito-embed.css', 'utf8');
if (!src.includes('/*FONTS*/')) throw new Error('нет плейсхолдера /*FONTS*/');
writeFileSync('kp-plainglobal.html', src.replace('/*FONTS*/', font));
console.log('kp-plainglobal.html готов');
