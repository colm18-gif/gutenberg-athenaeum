const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8'),source=fs.readFileSync('passages.js','utf8');

class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){Object.assign(this,{x,y,z});return this}}
class O{constructor(){this.children=[];this.parent=null;this.position=new V();this.scale=new V().set(1,1,1);this.rotation={x:0,y:0,z:0};this.userData={}}
  add(c){if(c.parent)c.parent.remove(c);c.parent=this;this.children.push(c);return this}remove(c){const i=this.children.indexOf(c);if(i>=0)this.children.splice(i,1);c.parent=null;return this}
  removeFromParent(){if(this.parent)this.parent.remove(this);return this}traverse(fn){fn(this);for(const c of this.children)c.traverse(fn)}}
class Mesh extends O{constructor(g,m){super();this.geometry=g;this.material=m;this.isMesh=true}}
class Instanced extends Mesh{constructor(g,m,n){super(g,m);this.count=n;this.instanceMatrix={}}setMatrixAt(){}dispose(){}}
const G=class{dispose(){}},M=class{constructor(p){Object.assign(this,p)}dispose(){}};
const THREE={Group:O,Mesh,InstancedMesh:Instanced,Vector3:V,Quaternion:class{},Matrix4:class{compose(){return this}},BoxGeometry:G,PlaneGeometry:G,SphereGeometry:G,MeshStandardMaterial:M,RepeatWrapping:1000,
  PointLight:class extends O{constructor(c,i){super();this.isPointLight=true;this.isLight=true;this.intensity=i}}};
// The rooms the passages join, as their modules define them.
const ROOMS={poe:'poe-room.js',irish:'irish-room.js',learners:'learners-room.js',medicine:'medicine-room.js',austen:'austen-room.js',burns:'burns-room.js',within:'within-room.js',
  evening:'evening-room.js',setTexts:'set-texts-room.js',periodicals:'periodicals-room.js',chance:'chance-room.js',lostProperty:'book-lift.js',canada:'canada-room.js',walden:'walden.js'};
// Walden is a clearing with no walls: its door stands at a place it keeps for it, facing east.
const waldenSource=fs.readFileSync('walden.js','utf8');
const CLEARING=(()=>{const c=waldenSource.match(/const CENTRE=\{x:(-?[\d.]+),z:(-?[\d.]+)\}/),t=waldenSource.match(/trail:\{x:(-?[\d.]+),z:(-?[\d.]+)\}/);
  return {centre:{x:+c[1],z:+c[2]},trail:{x:+c[1]+ +t[1],z:+c[2]+ +t[2],yaw:Math.PI/2}}})();
const roomOf=file=>{const m=fs.readFileSync(file,'utf8').match(/const ROOM=\{cx:(-?[\d.]+),cz:(-?[\d.]+),w:([\d.]+),d:([\d.]+)/);return {cx:+m[1],cz:+m[2],w:+m[3],d:+m[4]}};
function world(){
  const context={window:{},Math,JSON};vm.runInNewContext(source,context);
  const scene=new O(),interactables=[],notices=[],player={pos:new V(),radius:.42},tracked=[],store=new Map();
  const rooms={};for(const [key,file] of Object.entries(ROOMS)){
    if(key==='walden'){const {centre,trail}=CLEARING;rooms.walden={trail,built:false,activate(){this.built=true},contains:(x,z)=>Math.hypot(x-centre.x,z-centre.z)<33.5};continue}
    const room=roomOf(file);rooms[key]={room,built:false,activate(){this.built=true},contains:(x,z)=>Math.abs(x-room.cx)<room.w/2&&Math.abs(z-room.cz)<room.d/2}}
  const passages=context.window.createPassages({THREE,scene,MAT:{wood:new M({}),darkWood:new M({}),brass:new M({}),stone:new M({})},player,interactables,
    canvasTexture:()=>({repeat:{set(){}},dispose(){}}),showNotice:t=>notices.push(t),playSample:()=>{},analytics:{track:(n,p)=>tracked.push([n,p])},rooms,
    storage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)},move:(x,z,yaw,y=0)=>player.pos.set(x,y,z)});
  return {passages,scene,interactables,notices,player,tracked,rooms,store};
}

test('the back ways load before the game, after the rooms they join, and are wired in like the rooms',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);
  for(const file of Object.values(ROOMS))assert(order.indexOf(file)<order.indexOf('passages.js'),`${file} loads first`);
  assert.equal(order.indexOf('passages.js'),order.indexOf('game.js')-1);
  assert.match(game,/const passages=window\.createPassages\?\.\(/);
  assert.match(game,/rooms:\{poe:poeRoom,irish:irishRoom,learners:learnersRoom,medicine:medicineRoom,austen:austenRoom,burns:burnsRoom,within:withinRoom,evening:eveningRoom,setTexts:setTextsRoom,periodicals:periodicalsRoom,chance:chanceRoom,lostProperty:bookLift,canada:canadaRoom,walden\}/);
  for(const name of ['poeRoom','irishRoom','learnersRoom','medicineRoom','austenRoom','burnsRoom','withinRoom','eveningRoom','setTextsRoom','periodicalsRoom','chanceRoom','bookLift','canadaRoom','walden'])
    assert(game.indexOf(`const ${name}=`)<game.indexOf('const passages='),`${name} is made before the passages`);
  assert.match(game,/passages\.floorAt\(x,z\)\?\?prePassageFloor/);assert.match(game,/passages\.contains\(x,z\)\?passages\.allowed\(x,z\)/);assert.match(game,/passages\.interact\(focus\)/);
  assert.match(game,/passages\?\.update\(t\)/);assert.match(game,/const backWay=passages\?\.zoneAt\(x,z\);if\(backWay\)return backWay;/);
  const ambience=fs.readFileSync('room-ambience.js','utf8'),{passages}=world();
  for(const p of passages.passages){assert(game.includes(`['${p.key}','`),`${p.key} is in the journal`);assert(ambience.includes(`'${p.key}':{`),`${p.key} has an ambience`)}
  // Each room can be built by a passage before the reader steps in.
  for(const file of Object.values(ROOMS))assert.match(fs.readFileSync(file,'utf8'),/return \{contains,floorAt,allowed,interact,update,enter,(leave,unload,)?activate(:buildRoom)?,/,`${file} exports activate`);
  assert.match(waldenSource,/\btrail:TRAIL,centre:CENTRE,/,'Walden says where the Portage’s door stands');
});

test('the rooms reached by air, by boat and by rocket stay that way',()=>{
  const {passages}=world(),joined=new Set(passages.passages.flatMap(p=>p.ends.map(e=>e.room)));
  for(const room of ['nights','african','crusoe','boathouse','moon','mars','rocket','antipodes','forest'])assert(!joined.has(room),`${room} has no back way`);
  assert.equal(passages.passages.length,8);
});

test('each door stands on its wall, clear of the corners and of the other doors there',()=>{
  const {passages}=world();const seen={};
  for(const p of passages.passages)for(const end of p.ends){
    if(end.spot)continue;// Walden's door stands in the pines, in no wall (checked with the Portage)
    const room=roomOf(ROOMS[end.room]),len=end.wall==='north'||end.wall==='south'?room.w:room.d;
    assert(Math.abs(end.at)+1.05<len/2-.3,`${p.key} at ${end.room} ${end.wall} ${end.at} is clear of the corner`);
    const key=end.room+end.wall;for(const other of seen[key]||[])assert(Math.abs(other-end.at)>2.6,`${p.key} keeps apart from the other door on ${key}`);(seen[key]||=[]).push(end.at);
    // The rooms' own doors to the Grand Hall are in the middle of their south walls.
    if(end.wall==='south'&&end.room!=='lostProperty')assert(Math.abs(end.at)>2.3,`${p.key} keeps clear of ${end.room}'s door to the hall`);
  }
});

test('the passages stand apart, far from every room, beyond the camera’s reach',()=>{
  const {passages}=world(),boxes=passages.passages.map((p,i)=>{const d=passages.passageDoor(p,0);return {x:d.x,z:d.z-.1,w:p.width,l:p.length}});
  for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++)assert(Math.abs(boxes[i].z-boxes[j].z)>Math.max(boxes[i].l,boxes[j].l)+15,'passages keep apart, their walls between');
  for(const b of boxes)assert(b.x>1000&&b.x<1400,'out past everything else (the Deep Wood is at x 800, the Nights’ sky at 900)');
});

test('every passage can be walked from end to end, on a floor without a jump, and only within its walls',()=>{
  const {passages,player}=world();
  for(const p of passages.passages){
    const a=passages.passageDoor(p,0),b=passages.passageDoor(p,1);let prev=null;
    for(let k=0;k<=80;k++){const t=k/80,x=a.out.x+(b.out.x-a.out.x)*t,z=a.out.z+(b.out.z-a.out.z)*t;
      assert(passages.allowed(x,z),`${p.key} is walkable at ${t}`);const f=passages.floorAt(x,z);if(prev!=null)assert(Math.abs(f-prev)<.2,`${p.key} has no jump at ${t}`);prev=f;assert.equal(passages.zoneAt(x,z),p.key)}
    for(const i of p.ends.map((e,k)=>k)){const d=passages.passageDoor(p,i);assert(passages.allowed(d.out.x,d.out.z),`${p.key} door ${i} opens onto the floor`);assert.equal(passages.floorAt(d.out.x,d.out.z),d.out.y)}
    assert(!passages.allowed(a.x+p.width/2-.1,a.z+3),'not through the walls');
    if(p.kind==='stair')assert(Math.abs(passages.floorAt(a.out.x,a.out.z)-passages.floorAt(b.out.x,b.out.z))>=2,`${p.key} climbs`);
    for(const lz of [0,p.length/2,p.length])assert(passages.floorY(p,lz)>=0&&passages.floorY(p,lz)<4,'never below the ground (the basement) nor near the roof garden');
  }
  assert.equal(passages.floorAt(0,0),null);assert.equal(passages.zoneAt(0,0),null);
});

test('a door appears only while its room is built; going through builds the passage and its one lamp, and leaving frees it',()=>{
  const w=world(),{passages,rooms,interactables,scene,player,notices,tracked,store}=w;
  passages.update(0);assert.equal(interactables.length,0,'nothing at startup');assert.equal(scene.children.length,0);
  rooms.poe.built=true;passages.update(1);
  const doors=interactables.filter(o=>o.userData.type==='passage-door');assert.equal(doors.length,2,'the Poe Room has two back ways');
  const cellar=doors.find(o=>o.userData.passage==='cellar-stair');assert.equal(cellar.userData.end,0);assert.match(cellar.userData.author,/The Irish Room/);
  assert(passages.interact(cellar));assert.equal(passages.zoneAt(player.pos.x,player.pos.z),'cellar-stair');assert.equal(player.pos.y,2.4,'the Cellar Stair goes down from the Poe Room');
  assert.match(notices.at(-1),/The Cellar Stair: down to The Irish Room/);assert.equal(JSON.stringify(tracked.at(-1)),'["Room Explored",{"room":"cellar-stair"}]');assert.equal(store.get('athenaeum-back-ways'),'["cellar-stair"]');
  let lights=0;scene.traverse(o=>{if(o.isLight)lights++});assert.equal(lights,1);
  // Out at the far end, into the Irish Room, which is built first.
  const exit=interactables.find(o=>o.userData.type==='passage-exit'&&o.userData.end===1);assert.equal(exit.userData.title,'The Irish Room');
  assert(passages.interact(exit));assert(rooms.irish.built);assert(rooms.irish.contains(player.pos.x,player.pos.z));assert.equal(player.pos.y,0);
  passages.update(2);assert(interactables.some(o=>o.userData.type==='passage-door'&&o.userData.passage==='cellar-stair'&&o.userData.end===1),'the door on the Irish side');
  // A second passage takes the lamp with it.
  rooms.poe.built=true;passages.update(3);passages.enterPassage(passages.passages[1],1);lights=0;scene.traverse(o=>{if(o.isLight)lights++});assert.equal(lights,1,'one lamp, however many passages are built');
  passages.enterPassage(passages.passages[0],1);let lamp=null;scene.traverse(o=>{if(o.isLight)lamp=o});assert.equal(lamp.parent.name,'passage-cellar-stair','the lamp comes back to a passage still built');
  // Left for long enough, the passages are freed, and a room taken down takes its doors with it.
  passages.leavePassage(passages.passages[0],1);passages.update(10);assert.equal(passages.built.length,2);passages.update(40);assert.equal(passages.built.length,0);
  assert(!interactables.some(o=>o.userData.type==='passage-exit'||o.userData.type==='passage-card'));
  rooms.poe.built=false;passages.update(41);assert(!interactables.some(o=>o.userData.type==='passage-door'&&o.userData.passage==='night-corridor'&&o.userData.end===1));
  assert(!scene.children.some(c=>c.name==='passage-door-night-corridor'),'its door group is gone from the scene');
  assert.equal(scene.children.map(c=>c.name).join(),'passage-door-cellar-stair','only the Irish Room, still built, keeps its door');
});

test('the Servants’ Passage opens into three rooms, the Set Texts Room halfway along',()=>{
  const {passages,player,rooms}=world(),p=passages.passages.find(x=>x.key==='servants-passage');
  assert.equal(p.ends.map(e=>e.room).join(),'evening,periodicals,setTexts');const mid=passages.passageDoor(p,2);
  assert.equal(mid.lz,p.length/2);assert(passages.allowed(mid.out.x,mid.out.z));
  passages.enterPassage(p,2);assert.equal(passages.zoneAt(player.pos.x,player.pos.z),'servants-passage');
  passages.leavePassage(p,2);assert(rooms.setTexts.contains(player.pos.x,player.pos.z));
});

test('the Portage: from a door in Walden’s pines, through the seasons, into the Canadian Room',()=>{
  const {passages,rooms,interactables,player,notices,scene}=world(),p=passages.passages.find(x=>x.key==='portage');
  assert.equal(p.ends.map(e=>e.room).join(),'walden,canada');assert.equal(p.kind,'trail');
  // The Walden end: a door standing in the clearing, facing east, opening onto the clearing's own ground.
  const at=passages.roomDoor(p.ends[0]);assert.equal(at.x,CLEARING.trail.x);assert.equal(at.yaw,Math.PI/2);
  assert(at.out.x>at.x&&Math.hypot(at.out.x-CLEARING.centre.x,at.out.z-CLEARING.centre.z)<30,'the reader steps out into the clearing');
  // The Canadian end: the east end of the south wall, past the poppies and the snowshoes, clear of the east shelf.
  const canada=roomOf('canada-room.js'),c=passages.roomDoor(p.ends[1]);assert.equal(c.x,canada.cx+5);assert(c.out.z<c.z&&rooms.canada.contains(c.out.x,c.out.z));
  rooms.walden.built=true;passages.update(1);const door=interactables.find(o=>o.userData.type==='passage-door'&&o.userData.passage==='portage');
  assert(door,'its door is hung while Walden is built');assert.match(door.userData.author,/The Canadian Room/);
  assert(passages.interact(door));assert.equal(passages.zoneAt(player.pos.x,player.pos.z),'portage');assert.match(notices.at(-1),/The Portage: through to The Canadian Room/);
  // Lanterns on posts and mileposts down the way, a hat on one, and the path down the middle kept clear of them.
  const cards=interactables.filter(o=>o.userData.type==='passage-card').map(o=>o.userData.title);
  for(const title of ['A milepost','The trees','A palm-leaf hat'])assert(cards.includes(title),title);
  let lights=0;scene.traverse(o=>{if(o.isLight)lights++});assert.equal(lights,1,'the passages’ one lamp, and no other');
  const o=passages.passageDoor(p,0);for(let lz=.7;lz<p.length-.7;lz+=.2)assert(passages.allowed(o.x,o.z-.1+lz),`the path is clear at ${lz.toFixed(1)}`);
  for(const m of p.posts)assert(!passages.allowed(o.x+m.side*(p.width/2-.32),o.z-.1+m.at),'nobody walks through a post');
  const exit=interactables.find(o=>o.userData.type==='passage-exit'&&o.userData.passage==='portage'&&o.userData.end===1);assert.equal(exit.userData.title,'The Canadian Room');
  assert(passages.interact(exit));assert(rooms.canada.built);assert(rooms.canada.contains(player.pos.x,player.pos.z));
});

test('every word given to Thoreau on the Portage is in A Yankee in Canada',()=>{
  const zlib=require('node:zlib'),letters=t=>String(t).toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  const text=letters(zlib.gunzipSync(fs.readFileSync('texts/bundled-gzip/pg70123.txt.gz')).toString('utf8'));
  const {passages}=world(),p=passages.passages.find(x=>x.key==='portage');let quoted=0;
  for(const m of p.posts)for(const [,words] of m.text.matchAll(/“([^”]+)”/g)){quoted++;assert(text.includes(letters(words)),`“${words.slice(0,50)}…” is in the book`)}
  assert(quoted>=6);
});
