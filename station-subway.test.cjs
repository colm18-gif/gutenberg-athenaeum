const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8'),source=fs.readFileSync('station-subway.js','utf8');

// Just enough of Three.js to build the stairwell and the subway.
class V{constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}set(x,y,z){Object.assign(this,{x,y,z});return this}}
class O{constructor(){this.children=[];this.parent=null;this.position=new V();this.rotation={x:0,y:0,z:0};this.userData={};this.visible=true}
  add(...cs){for(const c of cs){if(c.parent)c.parent.remove(c);c.parent=this;this.children.push(c)}return this}remove(c){const i=this.children.indexOf(c);if(i>=0)this.children.splice(i,1);c.parent=null;return this}
  removeFromParent(){if(this.parent)this.parent.remove(this);return this}traverse(fn){fn(this);for(const c of this.children)c.traverse(fn)}}
class Mesh extends O{constructor(g,m){super();this.geometry=g;this.material=m;this.isMesh=true;this.renderOrder=0}}
class Instanced extends Mesh{constructor(g,m,n){super(g,m);this.count=n;this.instanceMatrix={}}setMatrixAt(){}dispose(){}}
const G=class{dispose(){}},M=class{constructor(p={}){Object.assign(this,p)}dispose(){}};
class Shape{moveTo(){return this}lineTo(){return this}absarc(){return this}}
const THREE={Group:O,Mesh,InstancedMesh:Instanced,Vector3:V,Quaternion:class{},Matrix4:class{compose(){return this}},Color:class{setScalar(){return this}},BoxGeometry:G,PlaneGeometry:G,SphereGeometry:G,CylinderGeometry:G,ShapeGeometry:G,Shape,
  MeshStandardMaterial:M,MeshBasicMaterial:M,RepeatWrapping:1000,BackSide:1,DoubleSide:2,PointLight:class extends O{constructor(c,i){super();this.isLight=true;this.intensity=i}}};
const texture=()=>({repeat:{set(){}},clone(){return texture()},dispose(){}});

function world({railwayBuilt=false}={}){
  const context={window:{},Math};vm.runInNewContext(source,context);
  const scene=new O(),interactables=[],notices=[],colliders=[],player={pos:new V(0,0,24),radius:.42},tracked=[],calls=[];
  const platform=new O(),railway={built:railwayBuilt,groups:{platform},entrance:{userData:{type:'night-railway',key:'entrance'}},interact:o=>{calls.push(o.userData.key);player.pos.set(213,0,-20);return true}};
  const subway=context.window.createStationSubway({THREE,scene,MAT:{brass:new M(),stone:new M(),darkWood:new M()},interactables,player,canvasTexture:texture,railway,
    collider:(x,z,w,d,name)=>colliders.push({x,z,w,d,name}),showNotice:t=>notices.push(t),analytics:{track:(n,p)=>tracked.push([n,p])},
    move:(x,z,yaw,y=0)=>{player.pos.set(x,y,z);player.yaw=yaw}});
  return {subway,scene,interactables,notices,colliders,player,tracked,calls,railway,platform};
}
const find=(list,key)=>list.find(o=>o.userData.type==='station-subway'&&o.userData.key===key);

test('the Station Subway loads at startup and is wired into the game like the back ways',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);
  assert(order.includes('station-subway.js'));assert(order.indexOf('station-subway.js')<order.indexOf('game.js'));
  assert.match(game,/const stationSubway=window\.createStationSubway\?\.\(\{[^]*?railway:nightRailway/);
  assert(game.indexOf('const nightRailway=')<game.indexOf('const stationSubway='),'the railway is made first');
  assert.match(game,/stationSubway\.floorAt\(x,z\)\?\?preSubwayFloor/);assert.match(game,/stationSubway\.contains\(x,z\)\?stationSubway\.allowed\(x,z\)/);
  assert.match(game,/stationSubway\?\.update\(t\)/);assert.match(game,/if\(stationSubway\?\.contains\(x,z\)\)return 'station-subway';/);
  assert.match(game,/'station-subway':stationSubway&&\(\(\)=>stationSubway\.enter\('hall'\)\)/,'?room=station-subway goes down the steps');
  for(const alias of ['subway','station','trains'])assert.match(game,new RegExp(`[{,]${alias}:'station-subway'`),`?room=${alias}`);
  assert.match(game,/\{title:'The night railway',places:\[\['station-subway','The station subway'\]/,'it is in the journal, with the railway');
  assert.match(fs.readFileSync('room-ambience.js','utf8'),/'station-subway':\{beds:/);
});

test('the stairwell is in the Grand Hall’s east aisle, clear of the columns, the Wandering Door and its forecourt',()=>{
  const {subway,colliders,interactables}=world(),{x0,x1,z0,z1}=subway.well;
  const c=colliders.find(c=>c.name==='station-stairwell');assert(c,'readers cannot walk into the well');
  const box={minX:c.x-c.w/2,maxX:c.x+c.w/2,minZ:c.z-c.d/2,maxZ:c.z+c.d/2};
  assert(box.minX<x0&&box.maxX>x1&&box.minZ<z0&&box.maxZ>z1,'the collider covers the opening and its railings');
  // The hall's columns stand at x ±11 and ±17, z −25, −5, 15 and 27.
  for(const x of [11,17])for(const z of [-25,-5])assert(!(x+.6>box.minX&&x-.6<box.maxX&&z+.6>box.minZ&&z-.6<box.maxZ),`clear of the column at ${x}, ${z}`);
  // The Wandering Door (x 6, z −24.5) opens towards readers standing at x 10.5.
  assert(box.minX>11,'clear of the Wandering Door and the reader in front of it');
  assert(Math.abs(box.maxX)<18.5&&box.minZ>-30&&box.maxZ<-12,'inside the hall');
  const down=find(interactables,'down');assert.equal(down.userData.action,'GO DOWN');
});

test('the well is sunk below the floor: its walls are drawn first, then a lid that writes only depth',()=>{
  const {scene}=world(),hall=scene.children.find(c=>c.name==='station-subway-stairwell');
  const meshes=[];hall.traverse(o=>{if(o.isMesh)meshes.push(o)});
  const lid=meshes.find(m=>m.material.colorWrite===false);assert(lid,'a lid');assert.equal(lid.renderOrder,-1);assert(lid.position.y>.005&&lid.position.y<.02,'just above the parquet (y .005)');
  assert(meshes.filter(m=>m.renderOrder===-2).length>=6,'the well’s tiles, steps, landing and sign are drawn before the lid');
  assert(meshes.filter(m=>m.renderOrder===-2).every(m=>m.position.y<=0),'only what is below the floor is drawn first');
});

test('going down builds the subway; walking it, the gates lead to the platform and the way out to the hall',()=>{
  const {subway,scene,interactables,player,calls,tracked}=world();
  assert(!scene.children.some(c=>c.name==='station-subway'),'nothing is built until a reader goes down');
  subway.update(1);assert(subway.interact(find(interactables,'down')));
  assert(subway.built);assert(scene.children.some(c=>c.name==='station-subway'));
  assert.equal(player.pos.y,3,'the reader arrives at the head of the subway’s stair');assert(subway.contains(player.pos.x,player.pos.z));
  assert.equal(JSON.stringify(tracked.at(-1)),'["Journey Taken",{"journey":"station-subway"}]');
  // The stair goes down to the passage, and the passage is walkable to the gates.
  const {x,north,landing,foot,south}=subway.subway;
  assert.equal(subway.floorAt(x,north+1),3);assert.equal(subway.floorAt(x,foot+1),0);assert(subway.floorAt(x,(landing+foot)/2)>0&&subway.floorAt(x,(landing+foot)/2)<3);
  for(let z=north+.7;z<south-.6;z+=.5)assert(subway.allowed(x-.6,z),`walkable at z ${z.toFixed(1)}`);
  assert(!subway.allowed(x+1.7,-620),'not through the tiles');assert(!subway.allowed(x,south-.2),'not through the gates');
  assert(!subway.allowed(x+1.4,-618),'not through the ticket machine');
  for(const key of ['board','machine','poster-signal','poster-children','poster-mugby'])assert(find(interactables,key),key);
  // The gates: the night railway's own entrance takes the reader to the Library Platform.
  assert(subway.interact(find(interactables,'gates')));assert.equal(calls.join(),'entrance');
  // Left behind, the subway is freed.
  subway.update(20);assert(subway.built);subway.update(40);assert(!subway.built);
  assert(!scene.children.some(c=>c.name==='station-subway'));assert(!find(interactables,'gates'),'its parts no longer answer');
  // And the way out goes up into the hall, in front of the well.
  subway.enter('hall');subway.interact(find(interactables,'up'));
  assert.equal(player.pos.y,0);assert(player.pos.z>subway.well.z1+.6,'the reader comes up facing away from the well, outside its railings');
});

test('a way out on the Library Platform leads back through the subway, once the railway is built',()=>{
  const w=world();w.subway.update(1);assert.equal(w.subway.platformExit,null,'nothing is hung on a platform not yet built');
  w.railway.built=true;w.subway.update(2);assert(w.subway.platformExit);assert.equal(w.subway.platformExit.parent,w.platform,'it is shown and hidden with the platform');
  const exit=find(w.interactables,'from-platform');assert(exit);assert(w.subway.interact(exit));
  assert(w.subway.contains(w.player.pos.x,w.player.pos.z));assert(w.player.pos.z>w.subway.subway.south-2&&w.player.pos.z<w.subway.subway.south,'the reader comes in by the gates');
  w.subway.update(3);assert.equal(w.platform.children.length,1,'hung once');
});

test('every poster card names only stops on the line and books the library keeps',()=>{
  const {subway}=world(),railBooks=fs.readFileSync('data/night-railway-books.js','utf8');
  for(const id of ['1874','27924'])assert.match(railBooks,new RegExp(`id:${id},`),`book ${id} is one of the railway books`);
  const cards=subway.posters.map(p=>p.card).join(' ');
  assert.match(cards,/The Railway Children \(1906\)/);assert.match(cards,/All the Year Round for 1866/);
  const train=fs.readFileSync('night-train.js','utf8');for(const stop of ['the Signal House','Tidebound Quay','the Collections Depot'])assert(train.includes(stop),stop);
});
