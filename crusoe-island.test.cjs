const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const html=fs.readFileSync('index.html','utf8');
const game=fs.readFileSync('game.js','utf8');
const source=fs.readFileSync('crusoe-island.js','utf8');
const ambience=fs.readFileSync('room-ambience.js','utf8');

// A small stand-in for three.js: enough to build the world, walk it and take it down again.
class Vector{constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}set(x,y,z){this.x=x;this.y=y;this.z=z;return this}copy(v){return this.set(v.x,v.y,v.z)}clone(){return new Vector(this.x,this.y,this.z)}lerp(v,t){return this.set(this.x+(v.x-this.x)*t,this.y+(v.y-this.y)*t,this.z+(v.z-this.z)*t)}}
class Color{constructor(hex=0){this.setHex(hex)}setHex(h){this.r=(h>>16&255)/255;this.g=(h>>8&255)/255;this.b=(h&255)/255;return this}getHex(){return Math.round(this.r*255)<<16|Math.round(this.g*255)<<8|Math.round(this.b*255)}copy(c){this.r=c.r;this.g=c.g;this.b=c.b;return this}clone(){return new Color().copy(this)}lerp(c,t){this.r+=(c.r-this.r)*t;this.g+=(c.g-this.g)*t;this.b+=(c.b-this.b)*t;return this}}
class Object3D{constructor(){this.children=[];this.parent=null;this.position=new Vector();this.scale=new Vector(1,1,1);this.rotation={x:0,y:0,z:0,order:'XYZ',set(x,y,z){this.x=x;this.y=y;this.z=z}};this.quaternion={clone:()=>({})};this.visible=true;this.userData={}}
  add(...items){for(const m of items){m.parent=this;this.children.push(m)}return this}removeFromParent(){if(this.parent){this.parent.children.splice(this.parent.children.indexOf(this),1);this.parent=null}return this}traverse(fn){fn(this);for(const m of this.children.slice())m.traverse(fn)}}
let disposed=0;
class Geometry{constructor(){this.params=[...arguments]}scale(){return this}dispose(){disposed++}}
class Material{constructor(p={}){Object.assign(this,p);this.color=new Color(p.color??0xffffff)}dispose(){disposed++}}
class Mesh extends Object3D{constructor(geometry,material){super();this.geometry=geometry;this.material=material;this.isMesh=true}}
class InstancedMesh extends Mesh{constructor(g,m,count){super(g,m);this.count=count;this.instanceMatrix={}}setMatrixAt(){}}
class PointLight extends Object3D{constructor(color,intensity,distance){super();Object.assign(this,{color,intensity,distance,isPointLight:true})}}
const THREE={Group:Object3D,Mesh,InstancedMesh,PointLight,BoxGeometry:Geometry,PlaneGeometry:Geometry,CylinderGeometry:Geometry,SphereGeometry:Geometry,ConeGeometry:Geometry,DodecahedronGeometry:Geometry,
  MeshStandardMaterial:Material,MeshBasicMaterial:Material,Color,Vector3:Vector,Vector2:class{constructor(x,y){this.x=x;this.y=y}},
  Matrix4:class{makeTranslation(){return this}compose(){return this}},Quaternion:class{setFromEuler(){return this}},Euler:class{set(){return this}},RepeatWrapping:1000,NoColorSpace:''};

function world({reduced=false,stored=null}={}){
  disposed=0;
  const context={window:{},Math,Date,setTimeout:(fn)=>{fn();return 0},console};vm.runInNewContext(source,context);
  const scene=new Object3D();scene.background=new Color(0x251e19);scene.fog={color:new Color(0x251e19),density:.012};
  const moon=new PointLight(new Color(0xbfcfff),1.2,0);moon.position.set(-10,20,10);
  const ambient={color:new Color(0x8a90a8),groundColor:new Color(0x2a1d14),intensity:1.7};
  const player={pos:new Vector(0,0,24),vel:new Vector(),yaw:0,pitch:0,radius:.42};
  const camera={position:new Vector(0,1.72,24),rotation:{set(){}},userData:{}};
  const notices=[],sounds=[],interactables=[],store={value:stored};
  const texture=()=>({wrapS:0,wrapT:0,repeat:new Vector(),offset:new Vector(),dispose(){disposed++}});
  const books={521:'Robinson Crusoe',120:'Treasure Island',1268:'The Mysterious Island',46597:'In Search of the Castaways',829:'Gulliver’s Travels',159:'The Island of Doctor Moreau',421:'Kidnapped',2701:'Moby-Dick',164:'Twenty Thousand Leagues',3704:'The Voyage of the Beagle',103:'Around the World in Eighty Days'};
  const island=context.window.createCrusoeIsland({THREE,scene,MAT:{wood:new Material(),wood2:new Material(),darkWood:new Material(),brass:new Material()},player,camera,interactables,
    canvasTexture:texture,bookMaterial:()=>new Material(),findBook:id=>books[id]&&{id,title:books[id]},showNotice:text=>notices.push(text),playSample:()=>{},sound:(...a)=>sounds.push(a),noise:()=>{},
    move:(x,z,yaw)=>{player.pos.set(x,0,z);player.yaw=yaw},fade:()=>{},renderer:{toneMappingExposure:1.95},ambient,moon,isReducedMotion:()=>reduced,
    storage:{getItem:()=>store.value,setItem:(k,v)=>{store.value=v}}});
  let t=0;const run=(seconds,step=.05)=>{for(let s=0;s<seconds;s+=step){t+=step;island.update(t,step)}};
  const lights=()=>{let n=0;scene.traverse(o=>{if(o.isPointLight)n++});return n};
  const find=type=>interactables.find(o=>o.userData.type===type);
  return {island,scene,player,camera,notices,sounds,interactables,moon,ambient,run,lights,find,store};
}

test('the island loads with the library, and its door hangs in the Grand Hall',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);
  assert(order.indexOf('crusoe-island.js')>=0&&order.indexOf('crusoe-island.js')<order.indexOf('game.js'));
  assert.match(game,/const crusoeIsland=window\.createCrusoeIsland\?\.\(/);
  assert.match(game,/const isle=crusoeIsland\?\.zoneAt\(x,z\);if\(isle\)return isle;/);
  assert.match(game,/\{title:'Across the water',places:\[\['boathouse','The boathouse'\],\['crusoe-island','Crusoe’s island'\]\]\}/);
  assert.match(game,/gameActive=function\(\)\{return !crusoeIsland\.travelling&&preIsleActive\(\)\}/);
  assert.match(game,/updateLamplight\(t\);crusoeIsland\?\.update\(t,dt\)/);
  assert.match(game,/baseFov=67-\(camera\.userData\.pressing\|\|0\)-\(camera\.userData\.zoom\|\|0\)/);
  assert.match(ambience,/boathouse:\{beds:\[\['waves'/);assert.match(ambience,/'crusoe-island':\{beds:\[\['waves'/);
  const w=world();const door=w.find('isle-door');assert(door,'the door is there from the start');
  assert.equal(w.island.door.yaw,Math.PI);assert(Math.abs(w.island.door.z-30.45)<.01,'on the south wall of the hall');
});

test('nothing is built until the reader walks up to the door, and it is all freed after they leave',()=>{
  const w=world(),doorOnly=w.scene.children.length,doorLights=w.lights();
  w.run(1);assert.equal(w.island.built,false,'the entrance is far enough away not to build it');
  w.player.pos.set(-4.5,0,26);w.run(.2);assert.equal(w.island.built,true);assert.equal(w.island.islandBuilt,false,'the island waits for the boathouse');
  w.island.interact(w.find('isle-door'));w.run(.2);assert.equal(w.island.islandBuilt,true);assert.equal(w.island.zoneAt(w.player.pos.x,w.player.pos.z),'boathouse');
  assert(w.lights()-doorLights<=4,'three boathouse lanterns and one campfire at most');
  const shelf=[...w.island.books.map(b=>b.userData.book.id)].sort((a,b)=>a-b);assert.deepEqual(shelf,[103,159,164,421,521,829,1268,2701,3704,46597]);
  w.island.interact(w.find('isle-exit'));assert(Math.abs(w.player.pos.z-28.55)<.01);
  w.run(10);assert.equal(w.island.built,true,'kept warm for a while');
  w.player.pos.set(0,0,0);w.run(30);assert.equal(w.island.built,false);
  assert.equal(w.scene.children.length,doorOnly);assert.equal(w.lights(),doorLights);assert(disposed>50);
  assert.equal(w.interactables.filter(o=>o.userData.type!=='isle-door').length,0,'nothing left to point at');
});

test('the crossing turns night to sunrise, lands on the island and puts the library’s light back afterwards',()=>{
  const w=world({reduced:true}),moonBefore=w.moon.color.getHex(),skyBefore=w.ambient.color.getHex(),backgroundBefore=w.scene.background.getHex();
  w.player.pos.set(-4.5,0,26);w.run(.2);w.island.interact(w.find('isle-door'));w.run(.2);
  assert.equal(w.island.dawn,0);w.island.interact(w.find('isle-boat'));assert.equal(w.island.travelling,true);
  w.run(7);assert(w.island.dawn>.2&&w.island.dawn<.9,'the sun is coming up halfway over');assert(w.notices.some(n=>n.includes('bright side of my condition')),'the message in the bottle');
  w.run(8);assert.equal(w.island.travelling,false);assert.equal(w.island.landed,true);assert.equal(w.island.zoneAt(w.player.pos.x,w.player.pos.z),'crusoe-island');
  assert.notEqual(w.moon.color.getHex(),moonBefore,'the moonlight has become the sun');assert(w.store.value,'the first landing is remembered for the calendar');
  w.island.interact(w.find('isle-return'));w.run(2);assert.equal(w.island.zoneAt(w.player.pos.x,w.player.pos.z),'boathouse');assert.equal(w.island.dawn,0);
  w.island.interact(w.find('isle-exit'));w.run(.2);
  assert.equal(w.moon.color.getHex(),moonBefore);assert.equal(w.ambient.color.getHex(),skyBefore);assert.equal(w.scene.background.getHex(),backgroundBefore);
});

test('Poll only speaks when spoken to, and the island’s secrets answer the reader',()=>{
  const w=world({reduced:true});w.player.pos.set(-4.5,0,26);w.run(.2);w.island.interact(w.find('isle-door'));w.island.interact(w.find('isle-boat'));w.run(15);
  const before=w.notices.length;w.run(60);assert(!w.notices.slice(before).some(n=>n.startsWith('Poll')),'Poll keeps quiet on her own');assert.equal(w.sounds.filter(s=>s[0]>=1500).length,0);
  w.island.interact(w.find('isle-poll'));assert(w.notices.at(-1).startsWith('Poll: “Poor Robin Crusoe!'));assert(w.sounds.some(s=>s[0]===1500));
  w.island.interact(w.find('isle-calendar'));assert.match(w.notices.at(-1),/30th September 1659/);
  w.island.interact(w.find('isle-footprint'));assert.match(w.notices.at(-1),/print of a man’s naked foot/);
  w.island.interact(w.find('isle-dig'));assert.match(w.notices.at(-1),/Fifteen men on the dead man’s chest/);assert(w.island.books.some(b=>b.userData.book.id===120),'Treasure Island is in the chest');
  w.island.interact(w.find('isle-spyglass'));w.run(1);assert.equal(w.camera.userData.zoom,46);w.run(6);assert.equal(w.camera.userData.zoom,0);
  const lights=w.lights();w.island.interact(w.find('isle-fire'));assert.equal(w.lights(),lights+1,'the signal fire is the only lamp it adds');
  w.run(2);assert.equal(w.island.zoneAt(w.player.pos.x,w.player.pos.z),null,'the smoke is seen, and the reader is home');assert.equal(w.island.landed,false);
});

test('the walkable island keeps the reader on the sand and out of the sea',()=>{
  const w=world({reduced:true});w.player.pos.set(-4.5,0,26);w.run(.2);w.island.interact(w.find('isle-door'));w.run(.2);
  assert.equal(w.island.allowed(-420,330),true);assert.equal(w.island.allowed(-420,318),true,'along the jetty');assert.equal(w.island.allowed(-423,318),false,'not off the side of it');
  assert.equal(w.island.allowed(-420,193),true);assert.equal(w.island.allowed(-420,168),false,'not beyond the beach');assert.equal(w.island.floorAt(-420,190),0);assert.equal(w.island.floorAt(-420,250),null);
  assert.equal(w.island.onSand(-420,190),true);assert.equal(w.island.contains(0,24),false);
});
