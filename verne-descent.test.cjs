const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Scene-contract doubles keep this regression check dependency-free.
class Vector{constructor(x=0,y=0,z=0){Object.assign(this,{x,y,z})}set(x,y,z){Object.assign(this,{x,y,z});return this}clone(){return new Vector(this.x,this.y,this.z)}}
class Object3D{constructor(){this.children=[];this.position=new Vector();this.scale=new Vector(1,1,1);this.rotation={x:0,y:0,z:0};this.quaternion={clone:()=>({})};this.visible=true;this.userData={}}add(m){m.parent=this;this.children.push(m)}traverse(fn){fn(this);this.children.forEach(m=>m.traverse(fn))}}
class Geometry{constructor(width,height,depth){this.parameters={width,height,depth}}}
class Mesh extends Object3D{constructor(geometry,material){super();this.geometry=geometry;this.material=material;this.isMesh=true}}
const THREE={Group:Object3D,Mesh,BoxGeometry:Geometry,PlaneGeometry:Geometry,DodecahedronGeometry:Geometry,IcosahedronGeometry:Geometry,CircleGeometry:Geometry,SphereGeometry:Geometry,ConeGeometry:Geometry,MeshStandardMaterial:class{constructor(p){Object.assign(this,p)}},PointLight:class extends Object3D{constructor(color,intensity,distance){super();Object.assign(this,{color,intensity,distance,isPointLight:true})}},MathUtils:{damp:(a,b,l,d)=>b+(a-b)*Math.exp(-l*d)}};
THREE.CylinderGeometry=Geometry;
function fixture(callbacks={}){const scene=new Object3D(),wing=new Object3D(),colliders=[],interactables=[];scene.add(wing);const wall=new Mesh(new Geometry(18,8,.5),{});wall.position.set(28,4,10);wing.add(wall);
  function collider(x,z,w,d,name='furniture',minY=-Infinity,maxY=Infinity){const c={minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,minY,maxY,inactive:false,name};colliders.push(c);return c}collider(28,10,18,.5);
  const sandbox={window:{},Math};vm.runInNewContext(fs.readFileSync('verne-descent.js','utf8'),sandbox);
  const player={pos:new Vector(34,0,8),radius:.42},book={id:3748,title:'Journey to the Centre of the Earth'},performanceZones={eastWing:{group:wing}};
  const descent=sandbox.window.createVerneDescent({THREE,scene,MAT:{stone:{},wood:{},wood2:{},darkWood:{},brass:{},green:{}},collider,colliders,interactables,canvasTexture:()=>({}),wrapText:()=>{},player,camera:{},book,performanceZones,rememberLights:()=>{},...callbacks});
  return{scene,wing,wall,colliders,interactables,descent,player,book,performanceZones};}
function canWalk(f,x,z){const d=f.descent,r=f.player.radius,y=d.floorAt(x,z);if(y===null)return false;for(const [dx,dz] of [[r,0],[-r,0],[0,r],[0,-r],[r*.707,r*.707],[-r*.707,r*.707],[r*.707,-r*.707],[-r*.707,-r*.707]])if(!d.contains(x+dx,z+dz)&&!(x+dx>19&&x+dx<37&&z+dz>-14&&z+dz<10))return false;return!f.colliders.some(c=>!c.inactive&&y>=c.minY&&y<=c.maxY&&x+r>c.minX&&x-r<c.maxX&&z+r>c.minZ&&z-r<c.maxZ);}
test('entrance retains the old wall and builds the descent only on discovery',()=>{const f=fixture();assert(f.wing.children.includes(f.wall));assert.equal(f.descent.built,false);assert(!canWalk(f,34,9.7));assert(f.descent.interact(f.descent.panel));assert(f.descent.built);assert(canWalk(f,34,9.7));assert(f.performanceZones.verneDescent);});
test('all twelve flights, returns and chamber have a reversible collision-safe route',()=>{const f=fixture();f.descent.interact(f.descent.panel);const path=[];function walk(x,z){assert(canWalk(f,x,z),`blocked ${x},${z}`);path.push([x,z]);}
  for(let z=9.4;z<=14;z+=.05)walk(34,z);
  for(let i=0;i<12;i++){const x=i%2?40:34,z=14+i*18;for(let p=z;p<=z+16;p+=.05)walk(x,p);const next=i===11?37:(i%2?34:40);for(let p=Math.min(x,next);p<=Math.max(x,next);p+=.05)walk(p,z+16);for(let p=z+16;p<=z+18;p+=.05)walk(next,p);}
  for(let z=230;z<=233.7;z+=.05)walk(37,z);path.reverse().forEach(([x,z])=>assert(canWalk(f,x,z)));assert.equal(f.descent.floorAt(37,234),-57.6);assert(!canWalk(f,37,235));assert(!canWalk(f,37,60));assert(!canWalk(f,30,230));
});
test('unique expedition copy uses the existing book contract without replacing catalogue records',()=>{const f=fixture();f.descent.build();const copy=f.interactables.find(m=>m.userData.expeditionCopy);assert.equal(copy.userData.book,f.book);assert.equal(copy.userData.home.parent,copy.parent);assert.equal(copy.userData.type,'book');assert.equal(copy.userData.loaded,true);f.player.pos.set(37,-57.6,234);assert.equal(f.descent.update(10,.016,true,()=>{}),1);assert(!f.descent.clearLine({intersectObjects:()=>[{distance:1,object:{}}]},copy,2));});
test('complete local edition is available through both existing loading paths',()=>{const text=fs.readFileSync('texts/pg3748.txt','utf8');assert(text.length>400000);assert.match(text,/END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK/);const local={window:{}};vm.runInNewContext(fs.readFileSync('texts/local/pg3748.js','utf8'),local);assert(local.window.ATHENAEUM_LOCAL_TEXTS[3748].length>400000);});
test('brass bell fades and returns once, blocks repeated ringing and reuses its geometry',()=>{
  let rings=0,returns=0;const fades=[];
  const f=fixture({onBell:()=>rings++,onFade:v=>fades.push(v),onReturn:()=>{returns++;f.player.pos.set(0,0,24)}});f.descent.build();f.player.pos.set(37,-57.6,233);
  const bell=f.interactables.find(m=>m.userData.type==='verne-return-bell'),count=f.interactables.length;assert(bell);assert(canWalk(f,38.4,233.7));
  f.descent.interact(bell);f.descent.interact(bell);assert.equal(rings,1);assert(f.descent.returning);
  for(let i=0;i<70;i++)f.descent.update(i*.02,.02,false,()=>{});
  assert.equal(returns,1);assert.equal(f.player.pos.z,24);assert(!f.descent.returning);assert.equal(fades.at(-1),0);assert(fades.includes(1));assert.equal(f.interactables.length,count);
  f.descent.interact(bell);for(let i=0;i<20;i++)f.descent.update(i*.02,.02,true,()=>{});assert.equal(returns,2);assert(!f.descent.returning);
});
