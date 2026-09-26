const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const load=()=>import('./scripts/reader-traces.mjs');

test('only totals reach the library, and only books several different people opened',async()=>{
  const {summarise,validate,render}=await load();
  const data=summarise('2026-09-25',[{metrics:[214],dimensions:[]}],[
    {dimensions:['345'],metrics:[18]},{dimensions:['84'],metrics:[3]},{dimensions:['1342'],metrics:[2]},
    {dimensions:['(none)'],metrics:[40]},{dimensions:['someone@example.com'],metrics:[9]}]);
  assert.deepEqual(data,{date:'2026-09-25',readers:214,books:{345:18,84:3}});
  assert.deepEqual(validate(data),[]);
  assert.match(validate({date:'2026-09-25',readers:5,books:{11:1}})[0],/privacy threshold/);
  const context={window:{}};require('node:vm').runInNewContext(render(data),context);
  assert.equal(context.window.ATHENAEUM_READER_TRACES.books['345'],18);
});

test('the published file is valid, and starts empty so nothing shows until there is data',async()=>{
  const {read,validate}=await load();const data=read();
  assert.deepEqual(validate(data),[]);
  const r=require('node:child_process').spawnSync(process.execPath,['scripts/reader-traces.mjs'],{encoding:'utf8',env:{...process.env,PLAUSIBLE_API_KEY:''}});
  assert.equal(r.status,0);assert.match(r.stdout,/left as they are/);
});

test('a nightly job publishes the totals, and the library shows them by the entrance',()=>{
  const workflow=fs.readFileSync('.github/workflows/reader-traces.yml','utf8'),game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8');
  assert.match(workflow,/cron: '41 1 \* \* \*'/);assert.match(workflow,/PLAUSIBLE_API_KEY: \$\{\{ secrets\.PLAUSIBLE_API_KEY \}\}/);assert.match(workflow,/git add data\/reader-traces\.js/);
  assert.match(html,/startupScript\('data\/reader-traces\.js'\);startupScript\('game\.js'\)/);
  assert.match(game,/if\(readers>=5&&data\?\.date\)\{/);
  assert.match(game,/if\(n>=3\)ui\.actions\.querySelector\('em'\)\.textContent=`\$\{book\.author\} · opened by \$\{n\} readers this week`/);
  assert.match(game,/track\('Book Opened',\{book:book\.id\}\)/);
  assert.match(game,/allowRooms\?\.\(\[\.\.\.Object\.keys\(PLACE_INFO\)/);
});
