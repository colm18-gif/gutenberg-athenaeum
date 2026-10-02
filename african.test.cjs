const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8'),source=fs.readFileSync('african-room.js','utf8');
const arrivals=(()=>{const c={window:{}};vm.runInNewContext(fs.readFileSync('data/new-books.js','utf8'),c);return c.window.ATHENAEUM_NEW_BOOKS})();
const byRoom=room=>arrivals.filter(e=>e[4]===room);

// Just enough of Three.js to build the balloon, the sky and the room, and a canvas that takes any drawing.
class V{constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}set(x,y,z){Object.assign(this,{x,y,z});return this}clone(){return new V(this.x,this.y,this.z)}copy(v){return this.set(v.x,v.y,v.z)}setScalar(s){return this.set(s,s,s)}}
class O{constructor(){this.children=[];this.parent=null;this.position=new V();this.scale=new V(1,1,1);this.visible=true;this.rotation={x:0,y:0,z:0,order:'XYZ',set(x,y,z){Object.assign(this,{x,y,z})}};this.quaternion={clone:()=>({})};this.userData={}}
  add(...m){for(const c of m){if(c.parent)c.removeFromParent();c.parent=this;this.children.push(c)}}removeFromParent(){if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1);this.parent=null}traverse(fn){fn(this);this.children.forEach(c=>c.traverse(fn))}}
class Mesh extends O{constructor(g,m){super();this.geometry=g;this.material=m}}
let disposed=0;const G=class{dispose(){disposed++}setAttribute(){}},M=class{constructor(p){Object.assign(this,p)}dispose(){disposed++}};
const any=new Proxy(function(){},{get:(t,k)=>k==='width'?100:k===Symbol.toPrimitive?()=>0:any,apply:()=>any,set:()=>true});
const canvasTexture=(draw,w=384,h=560)=>{const ctx=new Proxy({canvas:{width:w,height:h}},{get:(t,k)=>k in t?t[k]:any,set:()=>true});draw(ctx,w,h);return {dispose(){disposed++},repeat:{set(){}},offset:{x:0,y:0},image:{getContext:()=>ctx}}};
const THREE={Group:O,Mesh,Vector3:V,Vector2:class{constructor(x,y){this.x=x;this.y=y}},BoxGeometry:G,CylinderGeometry:G,SphereGeometry:G,PlaneGeometry:G,ConeGeometry:G,LatheGeometry:G,BufferGeometry:G,
  MeshStandardMaterial:M,MeshBasicMaterial:M,LineBasicMaterial:M,Float32BufferAttribute:class{},LineSegments:Mesh,RepeatWrapping:1,BackSide:1,DoubleSide:2,
  InstancedMesh:class extends Mesh{constructor(g,m,n){super(g,m);this.count=n;this.instanceMatrix={}}setMatrixAt(){}},Matrix4:class{compose(){return this}},Quaternion:class{setFromEuler(){return this}},Euler:class{set(){return this}},
  PointLight:class extends O{constructor(c,i){super();this.isPointLight=true;this.intensity=i}}};
function world({reduced=true}={}){
  const context={window:{},Math,setTimeout};vm.runInNewContext(source,context);
  const scene=new O();scene.background={setRGB(){}};scene.fog={color:{copy(){}},density:.013};
  const interactables=[],notices=[],player={pos:new V(),yaw:0,pitch:0,radius:.42},camera={position:new V(),rotation:{set(x,y,z){this.x=x;this.y=y;this.z=z}},updateMatrixWorld(){}},seats=[],covers=[];let roofPrepared=0;
  const r=context.window.createAfricanRoom({THREE,scene,MAT:{wood:new M({}),darkWood:new M({}),brass:new M({})},player,camera,interactables,canvasTexture,bookMaterial:()=>new M({}),
    findBook:id=>({id,title:'Book '+id,author:'A'}),arrivals:{ancient:byRoom('african-ancient').map(e=>e[0]),voices:byRoom('african-voices').map(e=>e[0]),tales:byRoom('african-tales').map(e=>e[0])},
    registerSeat:(parts,group,eye,yaw,options)=>{const data={type:'seat',...options};seats.push(data);return data},overlay:o=>covers.push(o),prepareRoof:()=>roofPrepared++,
    showNotice:t=>notices.push(t),playSample:()=>{},sound:()=>{},isReducedMotion:()=>reduced,floorAt:()=>10,moveTo:(x,y,z,yaw)=>{player.pos.set(x,y,z);player.yaw=yaw}});
  return {r,scene,interactables,notices,player,camera,seats,covers,prepared:()=>roofPrepared};
}
const wait=ms=>new Promise(res=>setTimeout(res,ms));
let clock=0;const run=(r,seconds,dt=.05)=>{for(let k=0;k<seconds/dt;k++)r.update(clock+=dt,dt)};

test('the African Reading Room loads before the game and is wired in: the roof, links, the map, sounds and the shelves',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);assert(order.indexOf('african-room.js')>=0&&order.indexOf('african-room.js')<order.indexOf('game.js'));
  assert.match(game,/const africanRoom=window\.createAfricanRoom\?\.\(/);assert.match(game,/gameActive=function\(\)\{return !africanRoom\.travelling/,'no walking while flying');
  assert.match(game,/africanRoom\.nearMoor\(/,'the basket is solid on the roof');assert.match(game,/prepareRoof:\(\)=>buildRoofGarden\(\)/,'a flight home can land on a roof not yet built');
  for(const alias of ["africa:'african-room'","balloon:'african-room'"])assert(game.includes(alias),alias);
  assert.match(game,/\{title:'By balloon',places:\[\['african-courtyard'/);
  const ambience=fs.readFileSync('room-ambience.js','utf8');for(const key of ["'african-courtyard':","'african-room':"])assert(ambience.includes(key),key);
  const script=fs.readFileSync('scripts/new-books.mjs','utf8');for(const key of ['african-ancient','african-voices','african-tales'])assert.match(script,new RegExp(`'${key}'`));
});

test('every book bound for the African Reading Room has a number and a note of three sentences, and each shelf fits',()=>{
  const room=arrivals.filter(e=>/^african-/.test(e[4]));assert(room.length>=15);
  for(const [id,title,,,,note] of room){assert(Number.isInteger(id),`${title}: a Gutenberg number`);assert.equal(note.split(/(?<=[a-z0-9”’)I][.!?])\s+(?=[A-ZÁÉÍÓÚŒ“])/).length,3,`${title}: three sentences`)}
  assert(!room.some(e=>/kaffir/i.test(e[1])),'no titles with slurs in them');
  const {r}=world();for(const key of ['ancient','voices','tales']){const shelf=r.shelves.find(s=>s.key===key);assert(shelf.ids.length+byRoom('african-'+key).length<=shelf.max,key)}
  for(const shelf of r.shelves)for(const id of shelf.ids)assert(fs.readdirSync('book').some(f=>f.startsWith(id+'-')),`${id} is already in the library`);
});

test('the balloon is moored in a clear corner of the roof garden, and the room is well away from everything else',()=>{
  const {r}=world();
  // Inside the parapet, outside the canopy, and clear of the telescope, the benches, the planters and the weather vane.
  assert(r.moor.x>-16&&r.moor.x<-9&&r.moor.z>38&&r.moor.z<60);
  for(const [x,z] of [[-7,49],[-11.5,42],[12,49],[-12,57],[11.5,48]])assert(Math.hypot(r.moor.x-x,r.moor.z-z)>4.5,`clear of ${x},${z}`);
  assert(r.nearMoor(r.moor.x,10,r.moor.z)&&!r.nearMoor(r.moor.x,0,r.moor.z),'solid on the roof only');
  for(const [x,z] of [[-330,-290],[-330,-205],[-330,-140],[-420,180],[-410,100],[-530,100],[-330,-420]])assert(Math.hypot(r.yard.cx-x,r.yard.cz-z)>60,`far from ${x},${z}`);
  assert.equal(r.zoneAt(r.yard.cx,r.yard.cz),'african-courtyard');assert.equal(r.zoneAt(r.room.cx,r.room.cz),'african-room');
  assert(!r.allowed(r.yard.cx+4,r.yard.cz-r.yard.d/2),'the façade is solid');assert(r.allowed(r.yard.cx,r.yard.cz-r.yard.d/2),'except at the door');
});

test('climbing into the basket flies the reader over the clouds to the courtyard, and the balloon there flies them home',async()=>{
  const {r,scene,interactables,notices,player,camera,seats,covers,prepared}=world();
  assert.equal(r.built,false);assert.equal(r.roofBuilt,false,'nothing is built until the reader is on the roof');
  player.pos.set(-8,10,48);run(r,.2);assert(r.roofBuilt,'the moored balloon, once the reader is up there');
  const basket=interactables.find(o=>o.userData.type==='african-balloon');assert(basket);assert.equal(basket.userData.action,'CLIMB IN');
  r.interact(basket);assert(r.travelling&&r.built&&r.skyBuilt);
  let lights=0;scene.traverse(o=>{if(o.isPointLight)lights++});assert(lights<=2,'a lantern and a lamp');
  assert.equal(seats.length,1,'the bench with cushions');
  for(const title of ['A baobab','A kora','A chest of manuscripts','A map of Africa','Earth and palm wood','A small room'])assert(interactables.some(o=>o.userData.title===title),title);
  player.yaw=1.1;run(r,3);assert(Math.abs(camera.rotation.y-1.1)<1e-9,'the reader looks where they like');
  run(r,14);assert(!r.travelling);assert(Math.max(...covers)>.9,'through the clouds');assert(notices.some(n=>/Zanzibar to the Senegal/.test(n)));
  assert.equal(r.zoneAt(player.pos.x,player.pos.z),'african-courtyard');assert(r.allowed(player.pos.x,player.pos.z));assert.equal(r.skyBuilt,false,'the sky is freed on landing');
  // Home again.
  r.interact(interactables.find(o=>o.userData.type==='african-balloon-home'));assert(r.travelling);assert.equal(prepared(),1);run(r,14);
  assert(Math.hypot(player.pos.x-r.moor.x,player.pos.z-r.moor.z)<3&&player.pos.y===10,'back beside the mooring on the roof');
  player.pos.set(0,0,0);disposed=0;run(r,30,.5);assert.equal(r.built,false);assert.equal(r.roofBuilt,false);assert(disposed>60);
});

test('a link goes straight to the courtyard',()=>{
  const {r,player,notices}=world();r.enter();assert.equal(r.zoneAt(player.pos.x,player.pos.z),'african-courtyard');assert.match(notices.at(-1),/baobab/);
});
