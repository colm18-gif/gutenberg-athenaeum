const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8'),source=fs.readFileSync('irish-room.js','utf8');
const arrivals=(()=>{const c={window:{}};vm.runInNewContext(fs.readFileSync('data/new-books.js','utf8'),c);return c.window.ATHENAEUM_NEW_BOOKS})();
class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){Object.assign(this,{x,y,z});return this}clone(){return new V().set(this.x,this.y,this.z)}}
class O{constructor(){this.children=[];this.parent=null;this.position=new V();this.scale=new V().set(1,1,1);this.rotation={x:0,y:0,z:0,order:'XYZ',set(x,y,z){Object.assign(this,{x,y,z})}};this.quaternion={clone:()=>({})};this.userData={}}
  add(...m){for(const c of m){c.parent=this;this.children.push(c)}}removeFromParent(){if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1);this.parent=null}traverse(fn){fn(this);this.children.forEach(c=>c.traverse(fn))}}
class Mesh extends O{constructor(g,m){super();this.geometry=g;this.material=m}}
let disposed=0;const G=class{dispose(){disposed++}},M=class{constructor(p){Object.assign(this,p)}dispose(){disposed++}};
const THREE={Group:O,Mesh,Vector3:V,BoxGeometry:G,CylinderGeometry:G,SphereGeometry:G,PlaneGeometry:G,ConeGeometry:G,MeshStandardMaterial:M,MeshBasicMaterial:M,PointLight:class extends O{constructor(c,i){super();this.isPointLight=true;this.intensity=i}}};
const byRoom=room=>arrivals.filter(e=>e[4]===room);
function room(){
  const context={window:{},Math};vm.runInNewContext(source,context);
  const scene=new O(),interactables=[],notices=[],player={pos:new V(),radius:.42};
  const r=context.window.createIrishRoom({THREE,scene,MAT:{wood:new M({}),darkWood:new M({}),brass:new M({})},player,interactables,canvasTexture:()=>({dispose(){disposed++}}),bookMaterial:()=>new M({}),
    findBook:id=>({id,title:'Book '+id,author:'A'}),arrivals:{myth:byRoom('irish-myth').map(e=>e[0]),revival:byRoom('irish-revival').map(e=>e[0]),writers:byRoom('irish-writers').map(e=>e[0]),gaeilge:byRoom('irish-gaeilge').map(e=>e[0])},
    showNotice:t=>notices.push(t),playSample:()=>{},move:(x,z)=>player.pos.set(x,0,z)});
  return {r,scene,interactables,notices,player};
}

test('the Irish Room loads before the game, is wired in, and its books in Irish are checked as Irish',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);assert(order.indexOf('irish-room.js')>=0&&order.indexOf('irish-room.js')<order.indexOf('game.js'));
  assert.match(game,/const irishRoom=window\.createIrishRoom\?\.\(/);assert.match(game,/\['irish-room','The Irish room'\]/);assert.match(game,/irish:'irish-room'/);
  assert.match(game,/'irish-gaeilge':'ga'/);assert.match(fs.readFileSync('scripts/new-books.mjs','utf8'),/'irish-gaeilge':'ga'/);assert.match(fs.readFileSync('scripts/daily-room.mjs','utf8'),/ga:'Irish'/);
  for(const key of ['irish-myth','irish-revival','irish-writers','irish-gaeilge'])assert.match(fs.readFileSync('scripts/new-books.mjs','utf8'),new RegExp(`'${key}'`));
  assert.match(fs.readFileSync('room-ambience.js','utf8'),/'irish-room':\{/);
});

test('every book on its shelves has a note of three sentences, and each shelf fits',()=>{
  const irish=arrivals.filter(e=>/^irish-/.test(e[4]));assert(irish.length>=25);
  for(const [id,title,,,shelf,note] of irish){assert(Number.isInteger(id),`${title}: a Gutenberg number`);assert.equal(note.split(/(?<=[a-z0-9”’)I][.!?])\s+(?=[A-ZÁÉÍÓÚŒ“])/).length,3,`${title}: three sentences`)}
  assert(byRoom('irish-myth').length<=10&&byRoom('irish-revival').length<=10&&byRoom('irish-gaeilge').length<=4);
  const {r}=room(),writers=r.groups.find(g=>g.key==='writers');assert(writers.ids.length+byRoom('irish-writers').length<=12);
  for(const id of writers.ids)assert(fs.readdirSync('book').some(f=>f.startsWith(id+'-')),`${id} is already in the library`);
});

test('the door is on the Grand Hall’s south wall, clear of its neighbours, and the room is well away from the others',()=>{
  const {r}=room();assert.equal(r.door.z,30.45);
  for(const x of [-12.9,-4.5,0,8.6])assert(Math.abs(r.door.x-x)>=3.5,`clear of the door at x ${x}`);
  for(const [x,z] of [[-330,20],[-330,-60],[-330,100],[-330,-140],[-326,180]])assert(Math.hypot(r.room.cx-x,r.room.cz-z)>40);
});

test('the room builds on approach, shows its four shelves, and is freed after',()=>{
  const {r,scene,interactables,notices,player}=room();const doorOnly=scene.children.length;
  player.pos.set(r.door.x,0,r.door.z-3);r.update(1,.1);assert.equal(r.built,true);
  let lights=0;scene.traverse(o=>{if(o.isPointLight)lights++});assert(lights<=2,'the fire and one lamp');
  const shelves=new Set(r.books.map(b=>b.userData.shelf));assert.deepEqual([...shelves].sort(),['gaeilge','myth','revival','writers']);
  for(const title of ['A St Brigid’s cross','A harp','An ogham stone','A turf fire'])assert(interactables.some(o=>o.userData.title===title),title);
  assert.match(interactables.find(o=>o.userData.title==='An ogham stone').userData.author,/Waterford/);
  r.interact(interactables.find(o=>o.userData.type==='irish-door'));assert(r.contains(player.pos.x,player.pos.z));assert.match(notices.at(-1),/^Seomra na hÉireann/);assert(r.allowed(player.pos.x,player.pos.z));
  r.interact(interactables.find(o=>o.userData.type==='irish-exit'));player.pos.set(0,0,0);disposed=0;r.update(40,.1);
  assert.equal(r.built,false);assert.equal(scene.children.length,doorOnly);assert(disposed>40);assert(interactables.some(o=>o.userData.type==='irish-door'));
});

test('Quill is sometimes found asleep in the rooms behind doors, as the same cat, and goes home with the reader',()=>{
  const block=game.slice(game.indexOf("// Quill's haunts"),game.indexOf("// Quill's haunts")+4000);
  for(const zone of ['irish-room','poe-room','international-wing'])assert(block.includes(`zone==='${zone}'`),zone);
  assert.match(block,/home=cat\.position\.clone\(\)/);assert.match(block,/cat\.position\.copy\(home\)/,'back to the Grand Hall afterwards');
  assert.match(block,/!catGuideTarget/,'never while leading the reader');assert.doesNotMatch(block,/new THREE\.|PointLight/,'nothing new is built');
  assert.match(block,/has\('quill'\)/,'?quill shows Quill every time, for checking');
});

test('the Grand Hall side of every room behind a door is the library’s walnut, with the room’s name gilded on the glass',()=>{
  const kit=fs.readFileSync('library-doors.js','utf8');assert.match(kit,/const readingRoom=\(title,sub=''\)=>\(\{style:'walnut',color:null/);assert.match(kit,/if\(label&&!gilt\)/,'no brass plate over the gilding');
  for(const [file,name] of [['irish-room.js','THE IRISH ROOM'],['periodicals-room.js','THE PERIODICALS ROOM'],['crusoe-island.js','THE BOATHOUSE'],['evening-room.js','THE EVENING ROOM'],['learners-room.js','THE ENGLISH\\nREADING ROOM'],['international-wing.js','THE INTERNATIONAL WING']])
    assert(fs.readFileSync(file,'utf8').includes(`readingRoom?.('${name}'`),file);
});
