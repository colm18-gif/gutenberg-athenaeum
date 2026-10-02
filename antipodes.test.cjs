const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8'),source=fs.readFileSync('antipodes.js','utf8');
const arrivals=(()=>{const c={window:{}};vm.runInNewContext(fs.readFileSync('data/new-books.js','utf8'),c);return c.window.ATHENAEUM_NEW_BOOKS})();
const byRoom=room=>arrivals.filter(e=>e[4]===room);

// Just enough of Three.js to build the rooms and the well, and a canvas that takes any drawing without complaint.
class V{constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}set(x,y,z){Object.assign(this,{x,y,z});return this}clone(){return new V(this.x,this.y,this.z)}copy(v){return this.set(v.x,v.y,v.z)}setScalar(s){return this.set(s,s,s)}}
class O{constructor(){this.children=[];this.parent=null;this.position=new V();this.scale=new V(1,1,1);this.visible=true;this.rotation={x:0,y:0,z:0,order:'XYZ',set(x,y,z){Object.assign(this,{x,y,z})}};this.quaternion={clone:()=>({})};this.userData={}}
  add(...m){for(const c of m){c.parent=this;this.children.push(c)}}removeFromParent(){if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1);this.parent=null}traverse(fn){fn(this);this.children.forEach(c=>c.traverse(fn))}rotateX(){}}
class Mesh extends O{constructor(g,m){super();this.geometry=g;this.material=m}}
let disposed=0;const G=class{dispose(){disposed++}setAttribute(){}},M=class{constructor(p){Object.assign(this,p)}dispose(){disposed++}};
const any=new Proxy(function(){},{get:(t,k)=>k==='width'?100:k===Symbol.toPrimitive?()=>0:any,apply:()=>any,set:()=>true});
const canvasTexture=(draw,w=384,h=560)=>{const ctx=new Proxy({canvas:{width:w,height:h}},{get:(t,k)=>k in t?t[k]:any,set:()=>true});draw(ctx,w,h);return {dispose(){disposed++},repeat:{set(){}},image:{getContext:()=>ctx},needsUpdate:false}};
const THREE={Group:O,Mesh,Vector3:V,BoxGeometry:G,CylinderGeometry:G,SphereGeometry:G,PlaneGeometry:G,ConeGeometry:G,TorusGeometry:G,CircleGeometry:G,BufferGeometry:G,
  MeshStandardMaterial:M,MeshBasicMaterial:M,PointsMaterial:M,Float32BufferAttribute:class{},Points:Mesh,RepeatWrapping:1,BackSide:1,DoubleSide:2,
  InstancedMesh:class extends Mesh{constructor(g,m,n){super(g,m);this.count=n}setMatrixAt(){}},Matrix4:class{compose(){return this}},Quaternion:class{setFromEuler(){return this}},Euler:class{set(){return this}},
  PointLight:class extends O{constructor(c,i){super();this.isPointLight=true;this.intensity=i}}};
function world({reduced=true}={}){
  const context={window:{},Math,Intl,Date,setTimeout};vm.runInNewContext(source,context);
  const scene=new O();scene.background={setRGB(){}};scene.fog={color:{copy(){}},density:.013};
  const interactables=[],notices=[],player={pos:new V(),yaw:0,radius:.42},camera={position:new V(),rotation:{set(x,y,z){this.z=z}},updateMatrixWorld(){}},seats=[];
  const a=context.window.createAntipodes({THREE,scene,MAT:{wood:new M({}),darkWood:new M({}),brass:new M({})},player,camera,interactables,canvasTexture,bookMaterial:()=>new M({}),
    findBook:id=>({id,title:'Book '+id,author:'A'}),arrivals:{voyages:byRoom('antipodes').map(e=>e[0]),australian:byRoom('australian').map(e=>e[0]),nz:byRoom('new-zealand').map(e=>e[0])},
    registerSeat:(parts,group,eye,yaw,options)=>{const data={type:'seat',...options};seats.push(data);return data},
    showNotice:t=>notices.push(t),playSample:()=>{},sound:()=>{},fade:()=>{},isReducedMotion:()=>reduced,move:(x,z,yaw)=>{player.pos.set(x,0,z);player.yaw=yaw}});
  return {a,scene,interactables,notices,player,camera,seats};
}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
let clock=0;const run=(a,seconds,dt=.05)=>{for(let k=0;k<seconds/dt;k++)a.update(clock+=dt,dt)};

test('the Antipodes loads before the game and is wired in: links, the map, sounds and the shelves',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);assert(order.indexOf('antipodes.js')>=0&&order.indexOf('antipodes.js')<order.indexOf('game.js'));
  assert.match(game,/const antipodes=window\.createAntipodes\?\.\(/);assert.match(game,/gameActive=function\(\)\{return !antipodes\.travelling/,'no walking while falling');
  assert.match(game,/antipodes\.blocksHall\(/,'the globe’s stand is solid');
  for(const alias of ['australia:','nz:','aotearoa:',"'new-zealand':"])assert(game.includes(alias),alias);
  assert.match(game,/\{title:'Through the Earth',places:\[\['antipodes','The Antipodes'\],\['australian-room','The Australian room'\],\['new-zealand-room','The New Zealand room'\]\]\}/);
  const ambience=fs.readFileSync('room-ambience.js','utf8');for(const key of ['antipodes:',"'australian-room':","'new-zealand-room':"])assert(ambience.includes(key),key);
  const script=fs.readFileSync('scripts/new-books.mjs','utf8');for(const key of ['antipodes','australian','new-zealand'])assert.match(script,new RegExp(`'${key}'`));
  assert.match(fs.readFileSync('scripts/book-pages.mjs','utf8'),/'new-zealand':'The New Zealand Room, at the Antipodes'/);
});

test('every book bound for the Antipodes has a number and a note of three sentences, and each shelf fits',()=>{
  const far=arrivals.filter(e=>['antipodes','australian','new-zealand'].includes(e[4]));assert(far.length>=25);
  for(const [id,title,,,,note] of far){assert(Number.isInteger(id),`${title}: a Gutenberg number`);assert.equal(note.split(/(?<=[a-z0-9”’)I][.!?])\s+(?=[A-ZÁÉÍÓÚŒ“])/).length,3,`${title}: three sentences`)}
  const {a}=world();for(const [key,room] of [['voyages','antipodes'],['australian','australian'],['nz','new-zealand']]){const shelf=a.shelves.find(s=>s.key===key);assert(shelf.ids.length+byRoom(room).length<=shelf.max,key)}
  for(const shelf of a.shelves)for(const id of shelf.ids)assert(fs.readdirSync('book').some(f=>f.startsWith(id+'-')),`${id} is already in the library`);
});

test('the globe stands in the open middle of the Grand Hall, and the far side is well away from every other room',()=>{
  const {a}=world();
  // The central reading chair, the reading tables, the long north bookcase and the serendipity machine.
  for(const [x,z] of [[0,8],[-4.7,4],[0,-17],[12,1],[-7,-25.8]])assert(Math.hypot(a.globe.x-x,a.globe.z-z)>4,`clear of ${x},${z}`);
  assert(a.blocksHall(a.globe.x,a.globe.z)&&!a.blocksHall(a.hatch.x,a.hatch.z+1.4),'the stand is solid; the trapdoor’s edge is not');
  for(const [x,z] of [[-330,-205],[-330,-140],[-330,-60],[-330,20],[-330,100],[-420,180],[-410,100],[-240,110]])assert(Math.hypot(a.hall.cx-x,a.hall.cz-z)>60,`far from ${x},${z}`);
  assert(!a.contains(0,0)&&a.zoneAt(a.rooms.australian.cx,a.rooms.australian.cz)==='australian-room'&&a.zoneAt(a.rooms.nz.cx,a.rooms.nz.cz)==='new-zealand-room');
  assert(a.rooms.australian.cx<a.hall.cx&&a.rooms.nz.cx>a.hall.cx,'Australia to the west of New Zealand, as on the map');
});

test('turning the globe opens the trapdoor; the reader falls through the Earth, turning over at the centre, and comes up at the Antipodes',async()=>{
  const {a,scene,interactables,notices,player,camera,seats}=world();const before=scene.children.length;
  assert.equal(a.built,false,'nothing beyond the globe is built at first');
  const globe=interactables.find(o=>o.userData.type==='antipodes-globe'),hatch=interactables.find(o=>o.userData.type==='antipodes-hatch');assert(globe&&hatch);
  a.interact(hatch);assert.match(notices.at(-1),/shut fast/);
  a.interact(globe);run(a,1);assert(a.hatchOpen&&a.built&&a.shaftBuilt);assert.match(notices.at(-1),/Australia and New Zealand/);
  let lights=0;scene.traverse(o=>{if(o.isPointLight)lights++});assert(lights<=3,'a fire and two lamps at most');
  assert.equal(seats.length,2,'a bench by the fire and a chair by the window');
  for(const title of ['A billy on the fire','A swag','A kookaburra','A kiwi','A silver fern','The Southern Cross','The antipodes','Alice, falling','Three clocks'])assert(interactables.some(o=>o.userData.title===title),title);
  player.pos.set(a.hatch.x,0,a.hatch.z+.1);run(a,.1);assert(a.travelling,'stepping onto the open trapdoor');
  let turned=false;for(let k=0;k<400&&a.travelling;k++){a.update(clock+=.05,.05);if(Math.abs(camera.rotation.z-Math.PI)<.01)turned=true}
  assert(turned,'upside down after the centre');assert(notices.some(n=>/New Zealand or Australia/.test(n)),'Alice’s question on the way');
  await wait(300);assert.equal(a.zoneAt(player.pos.x,player.pos.z),'antipodes');assert(a.allowed(player.pos.x,player.pos.z));
  // Home again, by the other globe.
  a.interact(interactables.find(o=>o.userData.type==='antipodes-globe-home'));run(a,1);
  a.interact(interactables.find(o=>o.userData.type==='antipodes-hatch-home'));assert(a.travelling);run(a,12);await wait(300);
  assert(Math.hypot(player.pos.x-a.hatch.x,player.pos.z-a.hatch.z)<2,'back beside the trapdoor in the Grand Hall');assert(!a.hatchOpen,'and it is shut');
  player.pos.set(0,0,0);disposed=0;run(a,30,.5);
  assert.equal(a.built,false);assert.equal(a.shaftBuilt,false);assert.equal(scene.children.length,before);assert(disposed>100);
  assert(interactables.some(o=>o.userData.type==='antipodes-globe'),'the globe in the Grand Hall stays');
});

test('a link goes straight to either room, and the clocks keep Perth, Sydney and Wellington time',()=>{
  const {a,player}=world();a.enter('australian-room');assert.equal(a.zoneAt(player.pos.x,player.pos.z),'australian-room');
  a.enter('new-zealand-room');assert.equal(a.zoneAt(player.pos.x,player.pos.z),'new-zealand-room');
  const words=a.clockWords(new Date('2026-10-02T08:06:00Z'));assert.match(words,/Perth 16:06/);assert.match(words,/Sydney 18:06/);assert.match(words,/Wellington 21:06/);
  const summer=a.clockWords(new Date('2027-01-15T00:00:00Z'));assert.match(summer,/Sydney 11:00/);assert.match(summer,/Wellington 13:00/,'their summer time');
});
