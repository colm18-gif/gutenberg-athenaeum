const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const zlib=require('node:zlib');

const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8'),source=fs.readFileSync('nights-room.js','utf8');
const arrivals=(()=>{const c={window:{}};vm.runInNewContext(fs.readFileSync('data/new-books.js','utf8'),c);return c.window.ATHENAEUM_NEW_BOOKS})();
const byRoom=room=>arrivals.filter(e=>e[4]===room);

// Just enough of Three.js to build the carpets, the sky and the room, and a canvas that takes any drawing.
class V{constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}set(x,y,z){Object.assign(this,{x,y,z});return this}clone(){return new V(this.x,this.y,this.z)}copy(v){return this.set(v.x,v.y,v.z)}setScalar(s){return this.set(s,s,s)}}
class O{constructor(){this.children=[];this.parent=null;this.position=new V();this.scale=new V(1,1,1);this.visible=true;this.rotation={x:0,y:0,z:0,order:'XYZ',set(x,y,z){Object.assign(this,{x,y,z})}};this.quaternion={clone:()=>({})};this.userData={}}
  add(...m){for(const c of m){if(c.parent)c.removeFromParent();c.parent=this;this.children.push(c)}}removeFromParent(){if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1);this.parent=null}traverse(fn){fn(this);this.children.forEach(c=>c.traverse(fn))}}
class Mesh extends O{constructor(g,m){super();this.geometry=g;this.material=m}}
let disposed=0;const G=class{dispose(){disposed++}setAttribute(){}},M=class{constructor(p){Object.assign(this,p)}dispose(){disposed++}};
const any=new Proxy(function(){},{get:(t,k)=>k==='width'?100:k===Symbol.toPrimitive?()=>0:any,apply:()=>any,set:()=>true});
const canvasTexture=(draw,w=384,h=560)=>{const ctx=new Proxy({canvas:{width:w,height:h}},{get:(t,k)=>k in t?t[k]:any,set:()=>true});draw(ctx,w,h);return {dispose(){disposed++},repeat:{set(){}},offset:{x:0,y:0},image:{getContext:()=>ctx}}};
const THREE={Group:O,Mesh,Vector3:V,BoxGeometry:G,CylinderGeometry:G,SphereGeometry:G,PlaneGeometry:G,ConeGeometry:G,TorusGeometry:G,OctahedronGeometry:G,BufferGeometry:G,
  MeshStandardMaterial:M,MeshBasicMaterial:M,LineBasicMaterial:M,Float32BufferAttribute:class{},LineSegments:Mesh,RepeatWrapping:1,BackSide:1,DoubleSide:2,
  InstancedMesh:class extends Mesh{constructor(g,m,n){super(g,m);this.count=n;this.instanceMatrix={}}setMatrixAt(){}},Matrix4:class{compose(){return this}},Quaternion:class{setFromEuler(){return this}},
  PointLight:class extends O{constructor(c,i){super();this.isPointLight=true;this.intensity=i}}};
const memory=()=>{const m=new Map();return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),map:m}};
function world({reduced=true,storage=memory()}={}){
  const context={window:{localStorage:storage},location:{search:''},Math,setTimeout:fn=>fn(),JSON,Date};vm.runInNewContext(source,context);
  const scene=new O();scene.background={setRGB(){}};scene.fog={color:{copy(){}},density:.013};
  const interactables=[],notices=[],player={pos:new V(-8,0,-10),yaw:0,pitch:0,radius:.42},camera={position:new V(),rotation:{set(x,y,z){this.x=x;this.y=y;this.z=z}},updateMatrixWorld(){}},seats=[],covers=[];
  const r=context.window.createNightsRoom({THREE,scene,MAT:{brass:new M({})},player,camera,interactables,canvasTexture,bookMaterial:()=>new M({}),storage,
    findBook:id=>({id,title:'Book '+id,author:'A'}),arrivals:Object.fromEntries(['tales','poets','echoes','lamp'].map(k=>[k,byRoom('nights-'+k).map(e=>e[0])])),
    registerSeat:(parts,group,eye,yaw,options)=>{const data={type:'seat',...options};seats.push(data);return data},overlay:o=>covers.push(o),
    showNotice:t=>notices.push(t),playSample:()=>{},sound:()=>{},isReducedMotion:()=>reduced,moveTo:(x,y,z,yaw)=>{player.pos.set(x,y,z);player.yaw=yaw}});
  return {r,scene,interactables,notices,player,camera,seats,covers,storage};
}
let clock=0;const run=(r,seconds,dt=.05)=>{for(let k=0;k<seconds/dt;k++)r.update(clock+=dt,dt)};
const find=(list,type)=>list.find(o=>o.userData.type===type);

test('the Thousand and One Nights loads before the game and is wired in: the carpet, links, the map, sounds and the shelves',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);assert(order.indexOf('nights-room.js')>=0&&order.indexOf('nights-room.js')<order.indexOf('game.js'));
  assert.match(game,/const nightsRoom=window\.createNightsRoom\?\.\(/);assert.match(game,/gameActive=function\(\)\{return !nightsRoom\.travelling/,'no walking while flying');
  assert.match(game,/resetPosition=function\(\)\{nightsRoom\.reset\(\)/,'R lands the carpet at once');
  for(const alias of ["nights:'nights-room'","carpet:'nights-room'","scheherazade:'nights-room'","'nights-room':nightsRoom&&"])assert(game.includes(alias),alias);
  assert.match(game,/\{title:'By carpet',places:\[\['nights-courtyard'/);assert.match(game,/'carpet-flight','carpet-return','nights-lamp'/,'its analytics names are allowed');
  const ambience=fs.readFileSync('room-ambience.js','utf8');for(const key of ["'nights-courtyard':","'nights-room':"])assert(ambience.includes(key),key);
  const script=fs.readFileSync('scripts/new-books.mjs','utf8');for(const key of ['nights-tales','nights-poets','nights-echoes','nights-lamp'])assert.match(script,new RegExp(`'${key}'`));
});

test('its books are held nowhere else, each has a note of three sentences, and each shelf fits',()=>{
  const room=arrivals.filter(e=>/^nights-/.test(e[4]));assert(room.length>=18);
  const elsewhere=new Set(arrivals.filter(e=>!/^nights-/.test(e[4])).map(e=>e[0]));
  const core=[...game.slice(game.indexOf('const books=['),game.indexOf('const books=[')+40000).matchAll(/\[(\d+),'/g)].map(m=>Number(m[1]));
  const catalogues=fs.readdirSync('data').filter(f=>/catalog|books\.js$/.test(f)&&f!=='new-books.js'&&f!=='new-books-resolved.js').map(f=>fs.readFileSync('data/'+f,'utf8')).join('\n');
  for(const [id,title,,,,note] of room){
    assert(Number.isInteger(id),`${title} has its number`);assert(!elsewhere.has(id),`${title} is on no other shelf`);assert(!core.includes(id),`${title} is not already in the hall`);
    assert(!new RegExp(`id:${id},`).test(catalogues),`${title} is in no other catalogue`);
    assert.equal(note.split(/(?<=[a-z0-9”’)I][.!?])\s+(?=[A-ZÁÉÍÓÚŒ“])/).length,3,`${title}: three sentences`);
  }
  assert.equal(new Set(room.map(e=>e[0])).size,room.length,'each once');assert.equal(byRoom('nights-lamp').length,1,'one book by the lamp');
  const {r}=world();for(const s of r.shelves)assert(byRoom('nights-'+s.key).length<=s.max,`${s.key} fits its wall`);
});

test('the words given to Scheherazade and the genie are Andrew Lang’s',()=>{
  const plain=t=>t.replace(/[“”]/g,'"').replace(/[‘’]/g,"'").replace(/\s+/g,' ');
  const lang=plain(zlib.gunzipSync(fs.readFileSync('texts/bundled-gzip/pg128.txt.gz')).toString('utf8'));
  const {r}=world();for(const [key,words] of Object.entries(r.lang))assert(lang.includes(plain(words).replace(/^"|"$/g,'')),`${key}: ${words}`);
  assert(r.cards.scheherazade[1].includes(r.lang.rest)&&r.cards.spent[1].includes(r.lang.lamps));
});

test('the carpet lies on open floor by the Grand Hall’s fire, and the room is well away from everything else',()=>{
  const {r}=world();
  // Inside the hall, clear of Clio's corner by the fire, the north rug and the globe, and the bookcases at z −17.
  assert(r.roll.x>-17&&r.roll.x<-8&&r.roll.z>-16&&r.roll.z<-12);
  for(const [x,z,clear] of [[-18,-20,4],[0,-9.6,6],[-6.5,-15,3.5]])assert(Math.hypot(r.roll.x-x,r.roll.z-z)>clear,`clear of ${x},${z}`);
  for(const [x,z] of [[700,-180],[500,-440],[500,-300],[620,120],[500,-160],[-600,-294],[340,30]])assert(Math.hypot(r.yard.cx-x,r.yard.cz-z)>150,`far from ${x},${z}`);
  assert(Math.hypot(r.yard.cx-800,r.yard.cz-400)>300,'far from the Deep Wood');
  assert.equal(r.zoneAt(r.yard.cx,r.yard.cz+3),'nights-courtyard');assert.equal(r.zoneAt(r.room.cx,r.room.cz),'nights-room');
  assert(!r.allowed(r.yard.cx+4,r.yard.cz-r.yard.d/2),'the façade is solid');assert(r.allowed(r.yard.cx,r.yard.cz-r.yard.d/2),'except at the door');
  r.enter();assert(!r.allowed(r.yard.cx,r.yard.cz),'the fountain is solid');assert(r.allowed(r.park.x+1.6,r.park.z+.4),'the reader lands on open floor');
});

test('untying the carpet unrolls it; sitting on it flies the reader to the courtyard; the lamp gives up Aladdin; the carpet there flies them home',()=>{
  const {r,scene,interactables,notices,player,camera,seats,covers,storage}=world();
  run(r,.1);const carpet=find(interactables,'nights-carpet');assert(carpet,'the rolled carpet is in the hall from the start');assert.equal(r.built,false,'nothing else is built yet');
  assert.equal(carpet.userData.action,'UNTIE THE CORD');r.interact(carpet);assert.equal(r.carpetUnrolled,1);assert.equal(carpet.userData.action,'SIT ON THE CARPET');assert(!r.travelling,'untying is not flying');
  run(r,2);r.interact(carpet);assert(r.travelling&&r.built&&r.skyBuilt);
  let lights=0;scene.traverse(o=>{if(o.isPointLight)lights++});assert(lights<=2,'a lantern and a lamp');
  assert.equal(seats.length,1,'the divan');
  for(const title of ['A courtyard','The fountain','A mashrabiya','The qa’a','The Thousand and One Nights','Scheherazade','An oil lamp','A brass plate'])assert(interactables.some(o=>o.userData.title===title),title);
  player.yaw=1.1;run(r,3);assert(Math.abs(camera.rotation.y-1.1)<1e-9,'the reader looks where they like');
  run(r,11);assert(!r.travelling);assert(Math.max(...covers)>.9,'through the dark');assert(notices.some(n=>/Bisnagar/.test(n)));
  assert.equal(r.zoneAt(player.pos.x,player.pos.z),'nights-courtyard');assert(r.allowed(player.pos.x,player.pos.z));assert.equal(r.skyBuilt,false,'the sky is freed on landing');
  assert(notices.some(n=>/your first night/.test(n)),'Scheherazade’s count begins');
  // The lamp.
  assert.equal(r.books.filter(b=>b.userData.shelf==='lamp').length,0,'Aladdin is not out until the lamp is rubbed');
  const lamp=find(interactables,'nights-lamp');r.interact(lamp);run(r,3);
  assert(r.lampFound);assert.equal(storage.getItem('athenaeum-nights-lamp'),'1','found for good');assert(notices.some(n=>n.includes('“What is thy will?”')));
  const aladdin=r.books.find(b=>b.userData.shelf==='lamp');assert(aladdin&&aladdin.visible&&interactables.includes(aladdin));assert(interactables.some(o=>o.userData.title==='Hanna Diyab'));
  r.interact(lamp);assert.match(notices.at(-1),/gone back into the story/);
  // Home again.
  r.interact(find(interactables,'nights-carpet-home'));assert(r.travelling);run(r,14);
  assert(Math.hypot(player.pos.x-r.roll.x,player.pos.z-r.roll.z)<2&&player.pos.y===0,'back by the fire');assert.equal(r.carpetUnrolled,1,'the carpet lies unrolled where it came down');
  player.pos.set(0,0,10);disposed=0;run(r,30,.5);assert.equal(r.built,false);assert(disposed>60);assert.equal(r.carpetUnrolled,0,'and rolls itself up once the reader has gone');
  assert(interactables.includes(carpet),'the hall’s carpet stays');
});

test('a lamp once rubbed stays rubbed, and a link goes straight to the courtyard',()=>{
  const storage=memory();storage.setItem('athenaeum-nights-lamp','1');const {r,player,notices}=world({storage});
  r.enter();assert.equal(r.zoneAt(player.pos.x,player.pos.z),'nights-courtyard');assert.match(notices.at(-1),/fountain/);assert(r.lampFound);
  assert(r.books.some(b=>b.userData.shelf==='lamp'));
  assert.match(r.nightLine(3),/third night/);assert.match(r.nightLine(1001),/thousand and first/);
});
