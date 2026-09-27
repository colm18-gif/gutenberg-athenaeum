const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8'),source=fs.readFileSync('evening-room.js','utf8');
const notes=JSON.parse(fs.readFileSync('data/librarian-notes.json','utf8'));
const levels=(()=>{const c={window:{}};vm.runInNewContext(fs.readFileSync('data/learner-levels.js','utf8'),c);return c.window.ATHENAEUM_LEARNER_LEVELS})();
class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){Object.assign(this,{x,y,z});return this}clone(){return new V().set(this.x,this.y,this.z)}}
class O{constructor(){this.children=[];this.parent=null;this.position=new V();this.scale=new V().set(1,1,1);this.rotation={x:0,y:0,z:0,order:'XYZ',set(x,y,z){Object.assign(this,{x,y,z})}};this.quaternion={clone:()=>({})};this.userData={}}add(...m){for(const c of m){c.parent=this;this.children.push(c)}}removeFromParent(){if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1);this.parent=null}traverse(fn){fn(this);this.children.forEach(c=>c.traverse(fn))}}
class Mesh extends O{constructor(g,m){super();this.geometry=g;this.material=m}}
let disposed=0;const G=class{dispose(){disposed++}},M=class{constructor(p){Object.assign(this,p)}dispose(){disposed++}};
const THREE={Group:O,Mesh,BoxGeometry:G,CylinderGeometry:G,SphereGeometry:G,PlaneGeometry:G,ConeGeometry:G,MeshStandardMaterial:M,MeshBasicMaterial:M,PointLight:class extends O{constructor(c,i){super();this.isPointLight=true;this.intensity=i}}};
function room(){
  const context={window:{},Math};vm.runInNewContext(source,context);
  const scene=new O(),interactables=[],notices=[],player={pos:new V(),radius:.42};
  const r=context.window.createEveningRoom({THREE,scene,MAT:{wood:new M({}),darkWood:new M({}),brass:new M({})},player,interactables,canvasTexture:()=>({dispose(){disposed++}}),bookMaterial:()=>new M({}),
    findBook:(id,record)=>id===932?(record?.title?{...record}:null):{id,title:'Book '+id,author:'A'},levels,showNotice:t=>notices.push(t),playSample:()=>{},move:(x,z)=>player.pos.set(x,0,z)});
  return {r,scene,interactables,notices,player};
}

test('the Evening Room loads before the game and is wired in',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);assert(order.indexOf('evening-room.js')>=0&&order.indexOf('evening-room.js')<order.indexOf('game.js'));
  assert.match(game,/const eveningRoom=window\.createEveningRoom\?\.\(/);assert.match(game,/\['evening-room','The evening room'\]/);
  assert.match(game,/if\(d\?\.evening\)\{.*The librarian’s note/,'picking up a book shows its note');
});

test('every book can be read in one sitting and has a librarian’s note',()=>{
  const {r}=room(),ids=r.groups.flatMap(g=>[...g.ids]);assert(ids.length>=24);assert.equal(new Set(ids).size,ids.length);
  for(const id of ids){
    assert(levels[id],`${id} has a measured length`);assert(levels[id][2]/250<=110,`${id} fits in an evening`);
    assert(typeof notes[id]==='string'&&notes[id].length>80,`${id} has a librarian’s note`);
    assert(r.records[id]?.[0]&&r.records[id]?.[1],`${id} has a title and author`);
  }
  // Groups really are in order of length.
  const minutes=id=>levels[id][2]/250;const [quick,hour,evening]=r.groups;
  assert(quick.ids.every(id=>minutes(id)<20));assert(hour.ids.every(id=>minutes(id)>=20&&minutes(id)<=60));assert(evening.ids.every(id=>minutes(id)>60));
  assert.equal(r.readingTime(1060),'4 min');assert.equal(r.readingTime(11791),'45 min');assert.equal(r.readingTime(22618),'1 hr 30 min');assert.equal(r.readingTime(25787),'1 hr 45 min');
});

test('the room builds on approach, shows every book with its time, and is freed after',()=>{
  const {r,scene,interactables,notices,player}=room();const doorOnly=scene.children.length;
  assert.equal(r.built,false);player.pos.set(21.8,0,5);r.update(1,.1);assert.equal(r.built,true);
  const shown=r.books;assert.equal(shown.length,r.groups.reduce((n,g)=>n+g.ids.length,0));assert(shown.every(b=>b.userData.evening&&/min|hr/.test(b.userData.readingTime)));
  let lights=0;scene.traverse(o=>{if(o.isPointLight)lights++});assert(lights<=4,'the fire, two lamps and the door glow');
  r.interact(interactables.find(o=>o.userData.type==='evening-door'));assert.equal(r.contains(player.pos.x,player.pos.z),true);assert.match(notices.at(-1),/^The Evening Room/);
  assert.equal(r.allowed(player.pos.x,player.pos.z),true);
  r.interact(interactables.find(o=>o.userData.type==='evening-exit'));player.pos.set(0,0,0);disposed=0;r.update(40,.1);
  assert.equal(r.built,false);assert.equal(scene.children.length,doorOnly);assert(disposed>40);
  assert.equal(interactables.filter(o=>o.userData.type!=='evening-door').length,0);
});
