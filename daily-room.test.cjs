const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const zlib=require('node:zlib');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');

const html=fs.readFileSync('index.html','utf8');
const game=fs.readFileSync('game.js','utf8');
const room=fs.readFileSync('daily-room.js','utf8');
const load=(file,name)=>{const context={window:{}};vm.runInNewContext(fs.readFileSync(file,'utf8'),context);return context.window[name]};
const schedule=load('data/daily-rooms.js','ATHENAEUM_DAILY_ROOMS');
const KINDS=['mood','journeys','curiosities','seasons','on-this-day','short-reads','deep-dive','firsts'];

test('the schedule alternates all eight kinds of room, one a day, with ten books each',()=>{
  assert.equal(schedule.start,'2026-09-25');
  assert.deepEqual(Object.keys(schedule.kinds).sort(),[...KINDS].sort());
  schedule.days.forEach((day,i)=>{
    assert.equal(day.kind,KINDS[i%8],`${day.date} breaks the rotation`);
    assert.equal(day.books.length,10,`${day.date} needs ten books`);
    assert.equal(new Date(Date.UTC(2026,8,25+i)).toISOString().slice(0,10),day.date);
    assert(day.featured>=0&&day.featured<10);
  });
  assert(schedule.days.length>=40);
  const r=spawnSync(process.execPath,['scripts/daily-room.mjs','--validate'],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);
});

test('the room is one reusable space behind a Grand Hall door, freed when the reader leaves',()=>{
  assert.match(html,/startupScript\('data\/daily-rooms\.js'\);startupScript\('data\/daily-rooms-resolved\.js'\);startupScript\('daily-room\.js'\)/);
  assert.match(game,/const dailyRoom=window\.createDailyRoom\?\.\(/);
  assert.match(game,/if\(dailyRoom\?\.contains\(x,z\)\)return 'daily-room'/);
  assert.match(game,/\['daily-room','The room of the day'\]/);
  assert.match(room,/door=\{x:-18\.72,z:-14\.5,yaw:Math\.PI\/2\}/);
  // Leaving frees the day's books and textures; re-dressing disposes the old ones first.
  assert.match(room,/function unload\(\)\{if\(!active\)return;root\.removeFromParent\(\);active=false;.*clearDressing\(\)/);
  assert.match(room,/for\(const item of disposables\.splice\(0\)\)item\.dispose\?\.\(\)/);
  // The day book reaches back two weeks at most, never before the first room.
  assert.match(room,/function oldestOffset\(\)\{return Math\.max\(0,Math\.min\(ARCHIVE-1,dayIndex\(todayKey\)\)\)\}/);
  // Checked lists from the nightly job win over the hand-written schedule.
  assert.match(room,/window\.ATHENAEUM_DAILY_RESOLVED\?\.days\?\.\[entry\.date\]\?\.books/);
});

test('the nightly job checks every book, bundles the texts for the window, and removes old ones',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'daily-room-'));
  for(const file of ['scripts/daily-room.mjs','data/daily-rooms.js'])fs.mkdirSync(path.join(dir,path.dirname(file)),{recursive:true}),fs.copyFileSync(file,path.join(dir,file));
  fs.mkdirSync(path.join(dir,'texts/bundled-gzip'),{recursive:true});
  // A fake Project Gutenberg: listed ids serve their own book, except 2014, which serves the wrong one;
  // searches find a made-up id for any title.
  const byId={};for(const day of schedule.days)for(const [id,title,author] of day.books)if(id)byId[id]=[title,author];
  const byTitle={};let next=900001;for(const day of schedule.days)for(const [,title,author] of day.books)byTitle[title]=byTitle[title]||[next++,title,author];
  const mock=path.join(dir,'mock.mjs');
  fs.writeFileSync(mock,`const byId=${JSON.stringify(byId)},byTitle=${JSON.stringify(byTitle)};
    const book=id=>{if(id==2014)return ['A Completely Different Book','Someone Else'];if(byId[id])return byId[id];const t=Object.values(byTitle).find(b=>b[0]==id);return t&&[t[1],t[2]]};
    globalThis.fetch=async url=>{url=String(url);const ok=body=>({ok:true,status:200,text:async()=>body,json:async()=>body});
      const m=url.match(/epub\\/(\\d+)\\//);if(m){const b=book(Number(m[1]));return b?ok('Title: '+b[0]+'\\nAuthor: '+b[1]+'\\n\\n'+'Once upon a time. '.repeat(400)):{ok:false,status:404}}
      if(url.includes('gutendex')){const q=decodeURIComponent(url.split('search=')[1]).toLowerCase();const first=q.split(' ')[0];const hits=Object.values(byTitle).filter(([,t])=>t.toLowerCase().includes(first));return ok({results:hits.map(([id,title,author])=>({id,title,authors:[{name:author}],copyright:false,download_count:1}))})}
      return {ok:false,status:404}};`);
  const run=date=>spawnSync(process.execPath,['--import',mock,path.join(dir,'scripts/daily-room.mjs'),'--date',date],{encoding:'utf8',env:{...process.env,DAILY_ROOM_PAUSE_MS:'0'}});
  let r=run('2026-09-26');assert.equal(r.status,0,r.stderr+r.stdout);
  let resolved=vm.runInNewContext(fs.readFileSync(path.join(dir,'data/daily-rooms-resolved.js'),'utf8')+';window',{window:{}}).ATHENAEUM_DAILY_RESOLVED;
  assert.deepEqual(Object.keys(resolved.days),['2026-09-25','2026-09-26','2026-09-27','2026-09-28']);
  const rainy=resolved.days['2026-09-25'].books;assert.equal(rainy.length,10);
  assert.notEqual(rainy.find(b=>b.title==='The Lodger').id,2014,'a wrong id is replaced by a search');
  assert(rainy.find(b=>b.title==='Uncle Silas').id>=900001,'a missing id is found by title');
  const gz=path.join(dir,'texts/bundled-gzip',`pg${rainy[0].id}.txt.gz`);assert.match(zlib.gunzipSync(fs.readFileSync(gz)).toString(),/^Title: The Woman in White/);
  // Three weeks on, the first days have left the window and their texts are removed.
  r=run('2026-10-20');assert.equal(r.status,0,r.stderr+r.stdout);
  resolved=vm.runInNewContext(fs.readFileSync(path.join(dir,'data/daily-rooms-resolved.js'),'utf8')+';window',{window:{}}).ATHENAEUM_DAILY_RESOLVED;
  assert.equal(Object.keys(resolved.days).length,16);assert(!resolved.days['2026-09-25']);
  assert(!fs.existsSync(gz),'texts for days outside the window are removed');
  const tracked=JSON.parse(fs.readFileSync(path.join(dir,'data/daily-room-texts.json'),'utf8')).ids,files=fs.readdirSync(path.join(dir,'texts/bundled-gzip'));
  assert.equal(files.length,tracked.length);
  fs.rmSync(dir,{recursive:true,force:true});
});

test('a workflow runs the job every night and publishes what changed',()=>{
  const flow=fs.readFileSync('.github/workflows/daily-room.yml','utf8');
  assert.match(flow,/schedule:\s*\n\s*- cron:/);assert.match(flow,/workflow_dispatch:/);
  assert.match(flow,/node scripts\/daily-room\.mjs/);assert.match(flow,/node --test \*\.test\.cjs/);
  assert.match(flow,/git add data\/daily-rooms-resolved\.js data\/daily-room-texts\.json texts\/bundled-gzip/);
});
