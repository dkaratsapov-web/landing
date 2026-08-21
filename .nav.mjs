const { chromium } = await import('file:///opt/node22/lib/node_modules/playwright/index.mjs');
import http from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
const ROOT='/home/user/landing/dist';
const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.json':'application/json'};
const srv=http.createServer((q,r)=>{let p=join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(existsSync(p)&&statSync(p).isDirectory())p=join(p,'index.html');if(!existsSync(p)){r.writeHead(404);return r.end()}r.writeHead(200,{'Content-Type':MIME[extname(p)]||'application/octet-stream'});r.end(readFileSync(p))});
await new Promise(r=>srv.listen(4915,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for (const [name,u] of [['nav-case','/keysy/sajt-marketologa/'],['nav-home','/']]) {
  const pg=await b.newPage({viewport:{width:1440,height:760}});
  await pg.goto('http://127.0.0.1:4915'+u,{waitUntil:'networkidle'});
  await pg.waitForTimeout(800);
  const box = await pg.evaluate(()=>{
    const el=[...document.querySelectorAll('a,button,span,div')].find(e=>/^Услуги/.test((e.textContent||'').trim()) && e.getBoundingClientRect().width<160 && e.getBoundingClientRect().width>0);
    if(!el) return null;
    const r=el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2};
  });
  if(box){ await pg.mouse.move(box.x,box.y); await pg.waitForTimeout(900); }
  else console.log(name,'— пункт «Услуги» не найден');
  await pg.screenshot({path:`/tmp/claude-0/-home-user-landing/8dbff4aa-6e7e-59bf-a92f-7f23d86c8c04/scratchpad/${name}.png`});
  await pg.close();
}
await b.close(); srv.close(); console.log('ok');
