const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const html=fs.readFileSync('index.html','utf8');
const game=fs.readFileSync('game.js','utf8');
const source=fs.readFileSync('room-ambience.js','utf8');

function stub(){const target=function(){};return new Proxy(target,{get(t,k){if(k in t)return t[k];if(k===Symbol.toPrimitive)return()=>0;if(k==='then'||k===Symbol.iterator)return undefined;t[k]=stub();return t[k]},apply(){return stub()},construct(){return stub()},set(t,k,v){t[k]=v;return true}})}
function recipes(){const context={window:{},Math};vm.runInNewContext(source,context);return context.window.createRoomAmbience({audioCtx:stub(),master:stub()}).recipes}

test('room ambience loads before the game and runs on its own timer, so clocks keep ticking while reading',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(match=>match[1]);
  assert.ok(order.indexOf('room-ambience.js')>-1&&order.indexOf('room-ambience.js')<order.indexOf('game.js'));
  assert.match(game,/roomAmbience=window\.createRoomAmbience\?\.\(\{audioCtx,master\}\)/);
  assert.match(game,/roomAmbience\.update\(\{place:analyticsRoom\(\),covered:worldIsCovered\(\)&&!reading,reading,height:player\.pos\.y\}\)\},250\)/);
  assert.doesNotMatch(source,/fetch\(|new Audio\(|\.ogg|\.mp3/,'every sound is generated, so nothing is downloaded');
});

test('every charted room has its own ambience',()=>{
  const all=recipes(),register=game.slice(game.indexOf('const PLACE_GROUPS=['),game.indexOf('const PLACE_INFO=')),places=[...register.matchAll(/\['([a-z-]+)','[^']+'\]/g)].map(m=>m[1]);
  const themeKeys=[...game.matchAll(/\{key:'([a-z]+)',wall:/g)].map(m=>m[1]);
  assert.ok(places.length>25&&themeKeys.length>=10);
  for(const id of [...places,...themeKeys,'contested'])assert.ok(all[id],`no ambience for ${id}`);
});

test('recipes only use sounds the module can make',()=>{
  const all=recipes(),events=new Set([...source.matchAll(/^\s{6}([a-z]+):\(\)=>buffer\(/gm)].map(m=>m[1]).concat('chimes')),beds=new Set([...source.matchAll(/kind==='([a-z]+)'/g)].map(m=>m[1]));
  for(const [id,recipe] of Object.entries(all)){
    for(const [kind] of recipe.beds||[])assert.ok(beds.has(kind),`${id} bed ${kind}`);
    for(const [type] of recipe.events||[])assert.ok(events.has(type),`${id} event ${type}`);
    for(const [interval,type] of recipe.ticks||[]){assert.ok(events.has(type),`${id} tick ${type}`);assert.ok(interval>=.25,`${id} tick interval`)}
  }
});

test('rooms left behind are torn down once silent, and menus soften the sound',()=>{
  assert.match(source,/if\(now-room\.silentSince>6\)teardown\(room\)/);
  assert.match(source,/const target=state\.covered\?\.25:state\.reading\?\.7:1/);
});

test('the Grand Hall and gallery add nothing, and the horologist and Wells rooms do not tick',()=>{
  const all=recipes();
  for(const id of ['main-library','upper-floor'])assert.equal((all[id].events||[]).length+(all[id].ticks||[]).length+all[id].beds.length,0,id);
  for(const id of ['curious-horologist','wells'])assert.ok(!(all[id].ticks||[]).length,`${id} has no ticking clock`);
});

test('there is no background drone',()=>{
  assert.doesNotMatch(game,/ambientPadGain|padFilter|\[73\.42,'sine'/);
});

test('there is no continuous rain hiss',()=>{
  assert.doesNotMatch(game,/soundscape\.makeRainSource\(\)|src\.connect\(filter\)\.connect\(noiseGain\)/);
});
