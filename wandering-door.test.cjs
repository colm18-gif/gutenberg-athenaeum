const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('wandering-door.js','utf8'),game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8');
class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){Object.assign(this,{x,y,z});return this}}
class O{constructor(){this.children=[];this.position=new V();this.rotation={x:0,y:0,z:0};this.userData={}}add(...m){this.children.push(...m);return this}updateMatrixWorld(){}}
class Mesh extends O{constructor(g,m){super();this.geometry=g;this.material=m}}
const G=class{},M=class{constructor(p){Object.assign(this,p)}};
const THREE={Group:O,Mesh,BoxGeometry:G,PlaneGeometry:G,MeshBasicMaterial:M};
function door({destinations,known=()=>false,holding=false,storage={}}={}){
  const context={window:{},Math,localStorage:{getItem:k=>storage[k]??null,setItem:(k,v)=>{storage[k]=v}}};vm.runInNewContext(source,context);
  const notices=[],went=[],colliders=[],player={pos:new V().set(10.5,0,-24.5)};
  const d=context.window.createWanderingDoor({THREE,scene:new O(),MAT:{darkWood:new M({}),stone:new M({})},interactables:[],player,showNotice:t=>notices.push(t),
    collider:(...a)=>colliders.push(a),isHolding:()=>holding,known,destinations,link:key=>()=>went.push(key)});
  return {d,notices,went,colliders,player,storage};
}
const open=d=>d.interact({userData:{type:'wandering-door'}});

test('the Wandering Door is loaded at startup and opens on rooms behind ordinary doors only',()=>{
  assert.match(html,/startupScript\('wandering-door\.js'\)/);
  const call=game.match(/createWanderingDoor\?\.\(\{[\s\S]*?\]\}\);/)?.[0];assert(call,'game.js creates the door');
  // The rooms reached by carpet, balloon, boat, rocket, the globe, a model or a window, and the secret ones, keep their own ways in.
  for(const key of ['nights-room','african-room','boathouse','mars','moon','rocket-hall','antipodes','australian-room','new-zealand-room','nemo-room','forest','within-room','poe-room','chance-room','cinder-archive','lost-property','voynich'])
    assert(!call.includes(`'${key}'`),`${key} is not on the door's list`);
  for(const key of ['irish-room','austen-room','map-room','international-wing','ukrainian-room'])assert(call.includes(`'${key}'`));
  assert.match(game,/'wandering-door':\(\)=>moveReaderTo\(/,'?room=wandering-door stands the reader before it');
});

test('it never opens on the same room twice running, and favours rooms not yet found',()=>{
  const destinations=['a','b','c'].map(key=>({key,place:key}));
  const {d,went,storage}=door({destinations,known:place=>place!=='c'});
  for(let i=0;i<300;i++){open(d);if(i)assert.notEqual(went[i],went[i-1])}
  assert.equal(storage['athenaeum-wandering-door-last'],went.at(-1));
  const counts=Object.fromEntries(['a','b','c'].map(k=>[k,went.filter(w=>w===k).length]));
  assert(counts.c>counts.a&&counts.c>counts.b,'the unfound room comes up more often');
});

test('from behind, or with a book in hand, it stays shut',()=>{
  const destinations=[{key:'a',place:'a'}];
  let t=door({destinations});t.player.pos.set(2,0,-24.5);open(t.d);assert.deepEqual(t.went,[]);assert.match(t.notices[0],/back of a door/);
  t=door({destinations,holding:true});open(t.d);assert.deepEqual(t.went,[]);assert.match(t.notices[0],/book/);
  t=door({destinations});open(t.d);assert.deepEqual(t.went,['a']);
  assert.equal(t.colliders.length,1,'it stands in the way like any other door');
});
