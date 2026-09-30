const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8'),source=fs.readFileSync('poe-room.js','utf8');
class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){Object.assign(this,{x,y,z});return this}clone(){return new V().set(this.x,this.y,this.z)}setScalar(s){return this.set(s,s,s)}}
class O{constructor(){this.children=[];this.parent=null;this.visible=true;this.position=new V();this.scale=new V().set(1,1,1);this.rotation={x:0,y:0,z:0,order:'XYZ',set(x,y,z){Object.assign(this,{x,y,z})}};this.quaternion={clone:()=>({})};this.userData={};this.matrix={}}
  add(...m){for(const c of m){c.parent=this;this.children.push(c)}}removeFromParent(){if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1);this.parent=null}traverse(fn){fn(this);this.children.forEach(c=>c.traverse(fn))}updateMatrix(){}}
class Mesh extends O{constructor(g,m){super();this.geometry=g;this.material=m}}
let disposed=0;const G=class{dispose(){disposed++}},M=class{constructor(p){Object.assign(this,p)}dispose(){disposed++}};
class Instanced extends Mesh{constructor(g,m,n){super(g,m);this.count=n}setMatrixAt(){}setColorAt(){}dispose(){disposed++}}
const THREE={Group:O,Object3D:O,Mesh,InstancedMesh:Instanced,Color:class{setHSL(){return this}multiply(){return this}},Vector3:V,BoxGeometry:G,CylinderGeometry:G,SphereGeometry:G,PlaneGeometry:G,ConeGeometry:G,CircleGeometry:G,
  MeshStandardMaterial:M,MeshBasicMaterial:M,DoubleSide:2,PointLight:class extends O{constructor(c,i){super();this.isPointLight=true;this.intensity=i}}};
function room(){
  const context={window:{},Math,setTimeout:fn=>fn()};vm.runInNewContext(source,context);
  const scene=new O(),interactables=[],notices=[],beats=[],events=[],player={pos:new V(),radius:.42};let reading=false;
  const r=context.window.createPoeRoom({THREE,scene,MAT:{wood:new M({}),darkWood:new M({}),brass:new M({})},player,interactables,canvasTexture:()=>({dispose(){disposed++}}),bookMaterial:()=>new M({}),
    findBook:(id,record)=>({id,title:record?.title||'Book '+id,author:'Edgar Allan Poe'}),showNotice:t=>notices.push(t),playSample:()=>{},sound:(f,d,type,vol)=>beats.push(vol),
    analytics:{track:(name,props)=>events.push([name,props])},isReading:()=>reading,move:(x,z)=>player.pos.set(x,0,z)});
  return {r,scene,interactables,notices,beats,events,player,setReading:v=>{reading=v}};
}

test('the Poe Room loads before the game and is wired in',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);assert(order.indexOf('poe-room.js')>=0&&order.indexOf('poe-room.js')<order.indexOf('game.js'));
  assert.match(game,/const poeRoom=window\.createPoeRoom\?\.\(/);assert.match(game,/\['poe-room','The Poe room'\]/);assert.match(game,/poe:'poe-room'/);
  assert.match(game,/'poe-room':poeRoom&&\(\(\)=>poeRoom\.enter\(\)\)/);assert.match(game,/prepareReturn:\(\)=>buildThemeRooms\('gothic'\)/,'the way back always has a Gothic Parlour to come out into');
  assert.match(game,/if\(d\.story\)d\.book\.pendingStory=d\.story/,'the book from under the boards opens at its story');
  assert.match(fs.readFileSync('room-ambience.js','utf8'),/'poe-room':\{/);
});

test('its door stands in the Gothic Parlour, clear of the parlour’s own shelves, chair and exit',()=>{
  const {r}=room(),g={cx:95,cz:14,w:20,d:16};
  assert(Math.abs(r.door.x-(g.cx-g.w/2))<.5,'on the west wall');assert(r.door.z>g.cz-g.d/2+2&&r.door.z<g.cz+g.d/2-2);
  assert(Math.hypot(r.door.x-(g.cx-5.4),r.door.z-(g.cz+2.4))>3,'away from the reading chair');
  for(const [x,z] of [[-330,20],[-330,-60],[-330,100],[-326,180]])assert(Math.hypot(r.room.cx-x,r.room.cz-z)>40,'clear of the other rooms behind doors');
});

test('every book on the shelves has a note or a record, and the hidden one opens at The Tell-Tale Heart',()=>{
  const {r}=room(),notes=JSON.parse(fs.readFileSync('data/librarian-notes.json','utf8')),newBooks=fs.readFileSync('data/new-books.js','utf8');
  for(const id of r.ids)assert(notes[id]||r.notes[id]||new RegExp(`\\[${id},'`).test(newBooks),`${id} has a librarian’s note`);
  for(const note of Object.values(r.notes)){const sentences=note.split(/(?<=[.!?])\s+/).length;assert(sentences===3,`three sentences: ${note}`)}
  assert.equal(r.hidden.id,2148);assert.equal(r.hidden.story,'THE TELL-TALE HEART');
});

test('the room builds on approach, the heart beats louder near the loose board, and lifting it gives up the book',()=>{
  const {r,scene,interactables,notices,beats,events,player,setReading}=room();const doorOnly=scene.children.length;
  assert.equal(r.built,false);player.pos.set(r.door.x+3,0,r.door.z);r.update(1,.1);assert.equal(r.built,true);
  let lights=0;scene.traverse(o=>{if(o.isPointLight)lights++});assert(lights<=2,'the desk lamp and one fill light, and only while the room is built');
  r.interact(interactables.find(o=>o.userData.type==='poe-door'));assert(r.contains(player.pos.x,player.pos.z));assert(notices.some(n=>/Nevermore/.test(n)));assert(r.allowed(player.pos.x,player.pos.z));
  // Far from the board, then beside it: the beat is louder close by.
  player.pos.set(r.room.cx-5,0,r.room.cz+4);r.update(2,.1);const far=beats.at(-2);
  player.pos.set(r.board.x+.6,0,r.board.z+.6);r.update(5,.1);const near=beats.at(-2);assert(near>far*3,`louder near the board (${far} → ${near})`);
  setReading(true);const count=beats.length;r.update(9,.1);assert.equal(beats.length,count,'quiet while a book is open in the reader');setReading(false);
  const hiddenBefore=r.books.length;r.interact(interactables.find(o=>o.userData.type==='poe-board'));assert.equal(r.lifted,true);
  const hidden=r.books.find(b=>b.userData.underBoard);assert.equal(r.books.length,hiddenBefore+1);assert(hidden&&hidden.visible&&interactables.includes(hidden));
  assert.equal(hidden.userData.story,'THE TELL-TALE HEART');assert(events.some(([name,p])=>name==='Secret Found'&&p.secret==='poe-tell-tale-heart'));
  for(const key of ['pendulum','portrait','letter','cask'])assert(interactables.some(o=>o.userData.type==='poe-card'&&o.userData.title&&o.userData.author.length>60),key);
  // Out through the chamber door, and freed once the reader has been away a while.
  r.interact(interactables.find(o=>o.userData.type==='poe-exit'));player.pos.set(0,0,0);disposed=0;r.update(60,.1);
  assert.equal(r.built,false);assert.equal(scene.children.length,doorOnly);assert(disposed>40);
  assert.equal(interactables.filter(o=>o.userData.type!=='poe-door').length,0);assert(interactables.some(o=>o.userData.type==='poe-door'),'the door in the Gothic Parlour still answers');
});

test('a reader who lingers without lifting the board hears the narrator confess',()=>{
  const {r,notices,player,interactables}=room();player.pos.set(r.door.x+2,0,r.door.z);r.update(1,.1);r.interact(interactables.find(o=>o.userData.type==='poe-door'));
  r.update(2,.1);r.update(60,.1);assert(notices.some(n=>/Villains!/.test(n)&&/hideous heart/.test(n)));
});
