const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const room=fs.readFileSync('periodicals-room.js','utf8'),game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8');
const load=(file,name)=>{const context={window:{}};vm.runInNewContext(fs.readFileSync(file,'utf8'),context);return context.window[name]};

test('the Periodicals Room has its periodicals, each with a note',()=>{
  const shelf=load('data/new-books.js','ATHENAEUM_NEW_BOOKS').filter(entry=>entry[4]==='periodicals');
  assert.ok(shelf.length>=16&&shelf.length<=22,'the racks hold twenty-two');
  for(const entry of shelf)assert.ok(entry[5].length>=120,entry[1]);
  assert.doesNotMatch(JSON.stringify(shelf),/AI Journal/i);
});

test('the door sits beneath the clock, and the room is built only when needed',()=>{
  assert.match(room,/const DOOR=\{x:0,z:30\.45,yaw:Math\.PI\}/);
  assert.match(room,/if\(inside\|\|near\)activate\(\)/);
  assert.match(room,/else if\(root&&t-lastNeeded>KEEP&&!isHolding\(\)/);
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);assert.ok(order.indexOf('periodicals-room.js')>-1&&order.indexOf('periodicals-room.js')<order.indexOf('game.js'));
  assert.match(game,/if\(periodicalsRoom\?\.contains\(x,z\)\)return 'periodicals-room';/);
  assert.match(game,/\['periodicals-room','The periodicals room'\]/);
  assert.match(game,/periodicalsRoom\?\.update\(t\)/);
});

test('The After Dark Gazette prints tonight’s room, the latest signatures and the library’s news',()=>{
  const context={window:{}};vm.runInNewContext(room,context);
  const noop=()=>{};
  // Only the Gazette's text is exercised here: the room is never built in this test.
  const THREE=new Proxy({},{get:()=>function(){return {position:{set:noop,clone(){return this}},rotation:{set:noop},add:noop,name:'',scale:{set:noop}}}});
  const api=context.window.createPeriodicalsRoom({THREE,scene:{add:noop},MAT:{},player:{pos:{x:0,z:0}},interactables:[],canvasTexture:()=>({}),bookMaterial:noop,findBook:noop,
    news:()=>({room:{title:'A Rainy Evening',intro:'Books for the rain.'},visitors:[{name:'Mei',place:'Singapore',note:'Got happily lost.'}],weather:'RAIN'}),showNotice:noop,move:noop,today:()=>new Date('2026-09-28T20:00:00Z')});
  const g=api.gazetteText();
  assert.equal(g.room.title,'A Rainy Evening');assert.equal(g.visitors[0].name,'Mei');assert.equal(g.items.length,3);
  assert.match(g.date,/28 September 2026/);
  assert.ok(api.notes.length>=9);
});
