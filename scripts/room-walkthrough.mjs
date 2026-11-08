#!/usr/bin/env node
// Room walkthrough: visits every room a `?room=` link can reach, in a real browser, and photographs it.
//
//   node scripts/room-walkthrough.mjs [--out walkthrough] [--only irish-room,poe-room] [--three DIR] [--strict]
//
// For each room it opens index.html?room=<key>&debug&noktx2, enters the library, waits for the reader to arrive
// and the frame to settle, then records:
//   - whether the reader was moved at all, where they ended up (`analyticsRoom`) and whether they stand on floor they are allowed on;
//   - how bright the picture is, and how much it varies (a room drawn black, or a camera inside a wall, is flat);
//   - any page error while getting there.
// It writes <out>/<key>.png, <out>/report.json and <out>/index.html (a contact sheet with the problems first).
// With --strict it exits 1 when any room has a page error, did not arrive, stands where walking is refused, or
// shows a blank picture. Dark rooms are flagged but never fail: some rooms are meant to be dim.
//
// Three.js comes from jsDelivr. With no network (the cloud sessions), pass --three with an unpacked three@0.160.1
// package (`npm pack three@0.160.1`) and the CDN requests are answered from it.
// Uses the pre-installed Playwright and Chromium (in Actions: `npx playwright install --with-deps chromium`).
import {createServer} from 'node:http';
import {readFileSync,existsSync,statSync,mkdirSync,writeFileSync} from 'node:fs';
import {join,extname,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');

// Every key roomLink() in game.js knows: the theme rooms behind hidden passages and the rooms in its table.
export function roomKeys(game=readFileSync(join(ROOT,'game.js'),'utf8')){
  const theme=game.match(/const themeRoomKeys=new Set\(\[([^\]]+)\]\)/);
  const body=game.slice(game.indexOf('function roomLink(key){'));
  const table=body.slice(body.indexOf('return {'),body.indexOf('}[key]||null'));
  const keys=new Set(theme?[...theme[1].matchAll(/'([a-z-]+)'/g)].map(m=>m[1]):[]);
  for(const m of table.matchAll(/(?:^|[{,\s])'?([a-z][a-z-]*)'?:(?=\w+&&\(|\(\)=>)/g))keys.add(m[1]);
  return [...keys];
}

const TYPES={'.html':'text/html','.js':'application/javascript','.mjs':'application/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.gz':'application/gzip','.txt':'text/plain','.glb':'model/gltf-binary','.ktx2':'image/ktx2','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav','.woff2':'font/woff2'};
function serve(){return new Promise(ok=>{const server=createServer((req,res)=>{let p=decodeURIComponent(new URL(req.url,'http://x').pathname);if(p.endsWith('/'))p+='index.html';const f=join(ROOT,p);
  if(!f.startsWith(ROOT)||!existsSync(f)||!statSync(f).isFile()){res.writeHead(404);res.end();return}res.writeHead(200,{'content-type':TYPES[extname(f)]||'application/octet-stream'});res.end(readFileSync(f))});
  server.listen(0,'127.0.0.1',()=>ok(server))})}

const args=process.argv.slice(2),arg=name=>{const i=args.indexOf(name);return i>=0?args[i+1]:null};
async function main(){
  const out=resolve(arg('--out')||'walkthrough'),three=arg('--three'),strict=args.includes('--strict');
  const only=arg('--only')?.split(',').filter(Boolean),keys=only||roomKeys();
  mkdirSync(out,{recursive:true});
  const require=createRequire(import.meta.url);let playwright;try{playwright=require('playwright')}catch(e){playwright=require(require.resolve('playwright',{paths:[process.cwd(),'/usr/lib/node_modules','/usr/local/lib/node_modules']}))}
  const server=await serve(),base=`http://127.0.0.1:${server.address().port}/index.html`;
  const browser=await playwright.chromium.launch({args:['--use-angle=swiftshader','--autoplay-policy=no-user-gesture-required']});
  const context=await browser.newContext({viewport:{width:960,height:600},deviceScaleFactor:1});
  if(three)await context.route(/cdn\.jsdelivr\.net\/npm\/three@0\.160\.1\/(.*)/,route=>{let u=new URL(route.request().url()).pathname.replace(/^\/npm\/three@0\.160\.1\/?/,'').replace(/\/?\+esm$/,'');if(!u)u='build/three.module.js';
    const f=join(three,u);if(!existsSync(f)||!statSync(f).isFile())return route.continue();let body=readFileSync(f,'utf8');
    if(u!=='build/three.module.js')body=body.replace(/from ['"]three['"]/g,"from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js'");
    return route.fulfill({body,contentType:'application/javascript'})});
  const report=[];
  for(const key of keys){
    const page=await context.newPage(),errors=[],started=Date.now();page.on('pageerror',e=>errors.push(e.message));
    const entry={key,errors};
    try{
      await page.goto(`${base}?room=${key}&debug&noktx2`,{waitUntil:'load',timeout:90000});
      await page.waitForSelector('#enter',{state:'visible',timeout:90000});await page.waitForTimeout(1500);await page.click('#enter');
      // window.__athenaeum appears once the library has started; readers start under the entrance clock (0, 24).
      await page.waitForFunction(()=>window.__athenaeum?.player,null,{timeout:90000});const start=[0,24];
      // The reader is sent on 0.6 s after entering; journeys (falls, wing rooms, carpets) can take longer to arrive.
      // Arrival is a move of more than three metres: some rooms (the Kipling case, the Wandering Door) are in the hall.
      entry.arrived=await page.waitForFunction(([x,z])=>{const p=window.__athenaeum.player.pos;return Math.hypot(p.x-x,p.z-z)>3},start,{timeout:25000}).then(()=>true,()=>false);
      await page.waitForTimeout(4000);
      Object.assign(entry,await page.evaluate(()=>{const a=window.__athenaeum,p=a.player.pos;return {place:a.analyticsRoom(),pos:[+p.x.toFixed(2),+p.y.toFixed(2),+p.z.toFixed(2)],allowed:a.allowedAt(p.x,p.z)!==false}}));
      const shot=await page.screenshot({path:join(out,`${key}.png`)});
      Object.assign(entry,await page.evaluate(async b64=>{const img=new Image();img.src='data:image/png;base64,'+b64;await img.decode();const c=document.createElement('canvas'),w=c.width=160,h=c.height=100,g=c.getContext('2d');g.drawImage(img,0,0,w,h);
        const d=g.getImageData(0,0,w,h).data;let s=0,s2=0;const n=w*h;for(let i=0;i<d.length;i+=4){const l=.2126*d[i]+.7152*d[i+1]+.0722*d[i+2];s+=l;s2+=l*l}const mean=s/n;return {brightness:+mean.toFixed(1),contrast:+Math.sqrt(Math.max(0,s2/n-mean*mean)).toFixed(1)}},shot.toString('base64')));
    }catch(e){entry.failure=String(e.message||e).split('\n')[0]}
    entry.seconds=Math.round((Date.now()-started)/1000);
    entry.problems=[...(entry.failure?[entry.failure]:[]),...(errors.length?[`${errors.length} page error(s)`]:[]),...(entry.arrived===false?['the reader was never moved']:[]),
      ...(entry.allowed===false?['standing where walking is refused']:[]),...(entry.contrast!=null&&entry.contrast<3?['blank picture']:[])];
    entry.warnings=entry.brightness!=null&&entry.brightness<18?['very dark']:[];
    report.push(entry);console.log(`${entry.problems.length?'✗':entry.warnings.length?'~':'✓'} ${key.padEnd(22)} ${String(entry.place).padEnd(22)} light ${entry.brightness??'-'} contrast ${entry.contrast??'-'} ${[...entry.problems,...entry.warnings].join('; ')}`);
    await page.close();
  }
  await browser.close();server.close();
  writeFileSync(join(out,'report.json'),JSON.stringify(report,null,1));
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const order=[...report].sort((a,b)=>b.problems.length-a.problems.length||b.warnings.length-a.warnings.length||a.key.localeCompare(b.key));
  writeFileSync(join(out,'index.html'),`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Room walkthrough</title>
<style>body{font:14px system-ui;background:#16120e;color:#eee;margin:16px}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px}figure{margin:0;background:#241d16;padding:8px;border-radius:6px}figure.bad{outline:2px solid #e05a4a}figure.warn{outline:2px solid #d8a840}img{width:100%;display:block}figcaption{margin-top:6px}small{color:#bbb}</style>
<h1>Room walkthrough</h1><p>${report.length} rooms, ${report.filter(r=>r.problems.length).length} with problems, ${report.filter(r=>r.warnings.length).length} very dark. ${new Date().toISOString().slice(0,16).replace('T',' ')} UTC.</p><main>
${order.map(r=>`<figure class="${r.problems.length?'bad':r.warnings.length?'warn':''}"><img src="${esc(r.key)}.png" alt="${esc(r.key)}" loading="lazy"><figcaption><b>${esc(r.key)}</b> → ${esc(r.place??'?')}<br><small>light ${r.brightness??'-'} · contrast ${r.contrast??'-'} · at ${esc((r.pos||[]).join(', '))} · ${r.seconds}s</small>${[...r.problems,...r.warnings].map(p=>`<br>${esc(p)}`).join('')}${r.errors.slice(0,3).map(e=>`<br><small>${esc(e)}</small>`).join('')}</figcaption></figure>`).join('\n')}
</main>`);
  const bad=report.filter(r=>r.problems.length);console.log(`\n${report.length} rooms; ${bad.length} with problems. Contact sheet: ${join(out,'index.html')}`);
  if(strict&&bad.length)process.exit(1);
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(e=>{console.error(e);process.exit(1)});
