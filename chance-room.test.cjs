const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('chance-room.js','utf8'),game=fs.readFileSync('game.js','utf8'),stairs=fs.readFileSync('high-staircase.js','utf8');
class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){Object.assign(this,{x,y,z});return this}clone(){return new V().set(this.x,this.y,this.z)}}
class O{constructor(){this.children=[];this.parent=null;this.position=new V();this.rotation={x:0,y:0,z:0};this.quaternion={clone:()=>({})};this.userData={}}
  add(...m){for(const c of m){c.parent=this;this.children.push(c)}return this}}
class Mesh extends O{constructor(g,m){super();this.geometry=g;this.material=m}}
const G=class{constructor(...a){this.args=a}dispose(){}},M=class{constructor(p){Object.assign(this,p)}dispose(){}};
const THREE={Group:O,Mesh,BoxGeometry:G,PlaneGeometry:G,MeshStandardMaterial:M,PointLight:class extends O{}};
function room(){
  const context={window:{},Math};vm.runInNewContext(source,context);
  const scene=new O(),interactables=[],notices=[],player={pos:new V(),radius:.42,yaw:0};
  const r=context.window.createChanceRoom({THREE,scene,MAT:{wood:new M({}),wood2:new M({}),darkWood:new M({}),stone:new M({})},player,interactables,canvasTexture:()=>({dispose(){}}),
    bookMaterial:()=>new M({}),findBook:id=>({id,title:'Book '+id}),showNotice:t=>notices.push(t),move:(x,z,yaw)=>{player.pos.set(x,0,z);player.yaw=yaw}});
  return {r,scene,interactables,notices,player};
}
const facing=yaw=>({x:-Math.sin(yaw),z:-Math.cos(yaw)});// where a plane's front, or a bookcase's open side, looks

test('the crooked portrait faces into the east wing, clear of the Verne engraving and the Restricted Catalogue’s gate',()=>{
  const {r,interactables}=room(),portrait=interactables.find(o=>o.userData.type==='chance-door');
  assert(portrait,'the portrait hangs');assert.equal(facing(portrait.rotation.y+Math.PI).x<0,true,'its picture faces west, into the wing');
  const [w]=portrait.geometry.args,lo=portrait.position.z-w/2,hi=portrait.position.z+w/2;
  const verne=game.match(/hiddenPainting\(36\.65,[\d.]+,([\d.]+),([\d.]+),/);assert(verne,'the Verne engraving is where it was');
  assert(hi<+verne[1]-+verne[2]/2-.1,'south of the Verne engraving');assert(lo>.95+.1,'north of the gate’s rail');
  assert(Math.abs(portrait.position.x-36.6)<.1,'on the east wall');
});

test('the room stands clear of the Moon, has its books facing in, and is reached by the portrait or ?room=chance',()=>{
  const a=room(),{room:R}=a.r,[mx,mz,mr]=['mx','mz','moonRadius'].map(k=>+stairs.match(new RegExp(`\\b${k}=([\\d.]+)`))[1]);
  for(const [x,z] of [[R.cx-R.w/2,R.cz-R.d/2],[R.cx-R.w/2,R.cz+R.d/2],[R.cx+R.w/2,R.cz-R.d/2],[R.cx+R.w/2,R.cz+R.d/2]])assert(Math.hypot(x-mx,z-mz)>mr+130,'beyond the camera’s reach from the Moon');
  a.r.interact(a.interactables.find(o=>o.userData.type==='chance-door'));assert.equal(a.r.built,true);assert(a.r.allowed(a.player.pos.x,a.player.pos.z),'the reader arrives on open floor');
  const books=a.interactables.filter(o=>o.userData.chance);assert.equal(books.length,42,'every listed book is shelved');
  for(const b of books){const shelf=b.parent,f=facing(shelf.rotation.y),toCentre={x:R.cx-shelf.position.x,z:R.cz-shelf.position.z};assert(f.x*toCentre.x+f.z*toCentre.z>0,`${b.userData.book.id} faces the room`)}
  a.r.interact(a.interactables.find(o=>o.userData.type==='chance-exit'));assert(Math.abs(a.player.pos.z-a.r.entrance.z)<.01&&a.player.pos.x<a.r.entrance.x,'back out in front of the portrait');
  assert.match(game,/chance:'chance-room'/);assert.match(game,/'chance-room':chanceRoom&&\(\(\)=>chanceRoom\.enter\(\)\)/);
});

test('the way back is lit, in a clear gap, works while carrying a book, and the room is named in the journal',()=>{
  const a=room();a.r.enter();const {room:R}=a.r,exit=a.interactables.find(o=>o.userData.type==='chance-exit');
  assert(exit.material.emissiveMap,'the way back glows');assert(Math.abs(exit.position.x-R.cx)<.01&&exit.position.z>R.cz+R.d/2-.6,'on the south wall, behind the arrival point');
  const south=[...new Set(a.interactables.filter(o=>o.userData.chance).map(b=>b.parent))].filter(g=>g.position.z>R.cz);
  for(const g of south)assert(Math.abs(g.position.x-R.cx)-7.1/2-.22>.8,'the bookcases either side leave the passage clear');
  assert(a.r.allowed(R.cx,R.cz+R.d/2-1.3)&&a.r.atExit(R.cx,R.cz+R.d/2-1.3),'a reader can stand at the way back');assert(!a.r.atExit(R.cx,R.cz),'but not from the middle of the room');
  assert.match(a.notices.at(-1),/way back/);
  assert.match(game,/if\(carryingBook&&chanceRoom\?\.atExit\(\)\)\{returnSelected\(false\);chanceRoom\.leave\(true\)/,'carrying a book does not trap the reader');
  assert.match(game,/\['chance-room','The Room of Chance'\]/);assert.match(game,/chanceRoom\?\.contains\(x,z\)\)return 'chance-room'/);
  assert.match(fs.readFileSync('room-ambience.js','utf8'),/'chance-room':\{/);
});
