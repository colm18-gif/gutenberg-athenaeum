const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('other-readers.js','utf8'),game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8');
class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){Object.assign(this,{x,y,z});return this}setScalar(s){return this.set(s,s,s)}}
class O{constructor(){this.children=[];this.position=new V();this.scale=new V().setScalar(1);this.rotation={x:0,y:0,z:0,set(x,y,z){Object.assign(this,{x,y,z})}};this.userData={};this.visible=true}add(...m){for(const c of m){c.parent=this;this.children.push(c)}}traverse(fn){fn(this);this.children.forEach(c=>c.traverse(fn))}}
class Mesh extends O{constructor(g,m){super();this.geometry=g;this.material=m}}
const G=class{},M=class{constructor(p){Object.assign(this,p)}};
const THREE={Group:O,Mesh,BoxGeometry:G,CylinderGeometry:G,SphereGeometry:G,ConeGeometry:G,TorusGeometry:G,PlaneGeometry:G,CircleGeometry:G,MeshStandardMaterial:M,MeshBasicMaterial:M};
const titles={16:'Peter Pan',164:'Twenty Thousand Leagues',1342:'Pride and Prejudice',11:'Alice’s Adventures in Wonderland',120:'Treasure Island',84:'Frankenstein',521:'Robinson Crusoe',103:'Around the World in Eighty Days',2701:'Moby-Dick',345:'Dracula'};

function make(day,quiet=()=>true){
  const context={window:{},Math,Date,setTimeout:fn=>fn()};vm.runInNewContext(source,context);
  const scene=new O(),interactables=[],notices=[],samples=[];
  const readers=context.window.createOtherReaders({THREE,scene,MAT:{darkWood:new M({})},interactables,canvasTexture:()=>({}),findBook:id=>titles[id]&&{id,title:titles[id]},
    showNotice:t=>notices.push(t),playSample:(...a)=>samples.push(a),isQuietMoment:quiet,today:()=>new Date(day+'T20:00:00Z')});
  return {readers,scene,interactables,notices,samples};
}

test('the traces are loaded before the game and wired into it',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);
  assert(order.indexOf('other-readers.js')>=0&&order.indexOf('other-readers.js')<order.indexOf('game.js'));
  assert.match(game,/const otherReaders=window\.createOtherReaders\?\.\(/);
  assert.match(game,/otherReaders\?\.update\(dt\)/);
  assert(!fs.existsSync('data/reader-traces.js')&&!fs.existsSync('.github/workflows/reader-traces.yml'),'nothing is fetched from Plausible');
});

test('each day leaves the same few things for everyone, and a different set on other days',()=>{
  const a=make('2026-09-26'),b=make('2026-09-26');
  assert.deepEqual([...a.readers.tonight],[...b.readers.tonight]);
  assert(a.readers.tonight.length>=4&&a.readers.tonight.length<=5);
  const sets=new Set();for(let d=1;d<=20;d++)sets.add(make(`2026-10-${String(d).padStart(2,'0')}`).readers.tonight.join());
  assert(sets.size>=15,'the choice changes from day to day');
  for(let d=1;d<=28;d++){const picks=a.readers.choose(`2026-11-${String(d).padStart(2,'0')}`);
    assert(picks.filter(p=>p.trace.on==='table').length<=3);
    for(const floor of ['boathouse','stair'])assert(picks.filter(p=>p.trace.on===floor).length<=1);
    const spots=picks.filter(p=>p.trace.on==='table').map(p=>p.spot);assert.equal(new Set(spots).size,spots.length,'never two things in one spot')}
});

test('every trace and the visitors’ book answer when looked at, and add no lights',()=>{
  const w=make('2026-09-26');let lights=0;w.scene.traverse(o=>{if(o.isPointLight||o.isSpotLight)lights++});assert.equal(lights,0);
  const traces=w.interactables.filter(o=>o.userData.type==='reader-trace'&&o.userData.id!=='visitors-book');assert.equal(traces.length,w.readers.tonight.length);
  for(const t of traces){assert.equal(w.readers.interact(t),true);assert.equal(w.notices.at(-1),t.userData.text)}
  const book=w.interactables.find(o=>o.userData.id==='visitors-book');assert.equal(w.readers.signed.length,6);
  for(let i=0;i<7;i++)w.readers.interact(book);
  assert.match(w.notices.at(-1),/^\d+ \w+ — .+, .+: “.+”/);assert(w.readers.signed.every(e=>e.book),'every visitor names a book the library has');
  assert.equal(w.readers.interact({userData:{type:'book'}}),false);
});

test('someone else is heard now and then, but never while reading',()=>{
  const busy=make('2026-09-26',()=>false);for(let i=0;i<6000;i++)busy.readers.update(.1);assert.equal(busy.samples.length,0);
  const quiet=make('2026-09-26');for(let i=0;i<6000;i++)quiet.readers.update(.1);
  assert(quiet.samples.length>=3,'a few sounds in ten minutes');assert(quiet.samples.every(([,volume])=>volume<=.35),'always faint');
});
