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
  evening:'evening-room.js',setTexts:'set-texts-room.js',periodicals:'periodicals-room.js',chance:'chance-room.js',lostProperty:'book-lift.js',canada:'canada-room.js',walden:'walden.js',
  dickinson:'dickinson-room.js',celsus:'celsus-room.js',latin:'international-wing.js',scrooge:'scrooge-room.js',corridor:'long-corridor.js'};
// Walden is a clearing with no walls: its door stands at a place it keeps for it, facing east.
const waldenSource=fs.readFileSync('walden.js','utf8');
const CLEARING=(()=>{const c=waldenSource.match(/const CENTRE=\{x:(-?[\d.]+),z:(-?[\d.]+)\}/),t=waldenSource.match(/trail:\{x:(-?[\d.]+),z:(-?[\d.]+)\}/);
  const h=waldenSource.match(/homestead:\{x:(-?[\d.]+),z:(-?[\d.]+)\}/),q=waldenSource.match(/quarter:\{x:(-?[\d.]+),z:(-?[\d.]+)\}/);
  return {centre:{x:+c[1],z:+c[2]},trail:{x:+c[1]+ +t[1],z:+c[2]+ +t[2],yaw:Math.PI/2},homestead:{x:+c[1]+ +h[1],z:+c[2]+ +h[2],yaw:Math.atan2(-h[1],-h[2])},
    quarter:{x:+c[1]+ +q[1],z:+c[2]+ +q[2],yaw:Math.atan2(-q[1],-q[2])}}})();
// The Long Corridor keeps the quarters' doors in its bays: Britain and Ireland in the east wall's sixth, the Americas in the west wall's third.
const corridorSource=fs.readFileSync('long-corridor.js','utf8');
const CORRIDOR=(()=>{const m=corridorSource.match(/const ROOM=\{cx:(-?[\d.]+),cz:(-?[\d.]+),w:([\d.]+),d:([\d.]+)/),R={cx:+m[1],cz:+m[2],w:+m[3],d:+m[4]},bayZ=k=>R.cz+R.d/2-2-k*4;
  return {room:R,britainDoor:{x:R.cx+R.w/2-.17,z:bayZ(5),yaw:-Math.PI/2},americasDoor:{x:R.cx-R.w/2+.17,z:bayZ(2),yaw:Math.PI/2}}})();
// The Library of Celsus keeps the Stoa's door in its court's west wall, facing east.
const celsusSource=fs.readFileSync('celsus-room.js','utf8');
const COURT=(()=>{const m=celsusSource.match(/const COURT=\{cx:(-?[\d.]+),cz:(-?[\d.]+),w:([\d.]+),d:([\d.]+)/);return {cx:+m[1],cz:+m[2],w:+m[3],d:+m[4]}})();
const roomOf=file=>{
  // The Latin Reading Room is one of the International Wing's rooms.
  if(file==='international-wing.js'){const m=fs.readFileSync(file,'utf8').match(/latin:\{cx:(-?[\d.]+),cz:(-?[\d.]+),w:([\d.]+),d:([\d.]+)/);return {cx:+m[1],cz:+m[2],w:+m[3],d:+m[4]}}
  const m=fs.readFileSync(file,'utf8').match(/const ROOM=\{cx:(-?[\d.]+),cz:(-?[\d.]+),w:([\d.]+),d:([\d.]+)/);return {cx:+m[1],cz:+m[2],w:+m[3],d:+m[4]}};
function world(){
  const context={window:{},Math,JSON};vm.runInNewContext(source,context);
  const scene=new O(),interactables=[],notices=[],player={pos:new V(),radius:.42},tracked=[],store=new Map();
  const rooms={};for(const [key,file] of Object.entries(ROOMS)){
    if(key==='corridor'){const {room,britainDoor,americasDoor}=CORRIDOR;rooms.corridor={room,britainDoor,americasDoor,built:false,activate(){this.built=true},contains:(x,z)=>Math.abs(x-room.cx)<room.w/2&&Math.abs(z-room.cz)<room.d/2};continue}
    if(key==='walden'){const {centre,trail,homestead,quarter}=CLEARING;rooms.walden={trail,homestead,quarter,built:false,activate(){this.built=true},contains:(x,z)=>Math.hypot(x-centre.x,z-centre.z)<33.5};continue}
    if(key==='celsus'){rooms.celsus={stoa:{x:COURT.cx-COURT.w/2+.22,z:COURT.cz+.1,yaw:Math.PI/2},built:false,activate(){this.built=true},contains:(x,z)=>Math.abs(x-COURT.cx)<COURT.w/2&&Math.abs(z-COURT.cz)<COURT.d/2};continue}
    const room=roomOf(file);rooms[key]={room,built:false,activate(){this.built=true},enter(){this.built=true;player.pos.set(room.cx,0,room.cz+room.d/2-1.4)},contains:(x,z)=>Math.abs(x-room.cx)<room.w/2&&Math.abs(z-room.cz)<room.d/2}}
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
  assert.match(game,/rooms:\{poe:poeRoom,irish:irishRoom,learners:learnersRoom,medicine:medicineRoom,austen:austenRoom,burns:burnsRoom,within:withinRoom,evening:eveningRoom,setTexts:setTextsRoom,periodicals:periodicalsRoom,chance:chanceRoom,lostProperty:bookLift,canada:canadaRoom,walden,dickinson:dickinsonRoom,celsus:celsusRoom,/);
  for(const name of ['poeRoom','irishRoom','learnersRoom','medicineRoom','austenRoom','burnsRoom','withinRoom','eveningRoom','setTextsRoom','periodicalsRoom','chanceRoom','bookLift','canadaRoom','walden','dickinsonRoom','celsusRoom']){
    const made=Math.max(game.indexOf(`const ${name}=`),game.indexOf(`var ${name}=`));assert(made>0&&made<game.indexOf('const passages='),`${name} is made before the passages`)}
  // The Latin Reading Room is built through the International Wing, once the wing's books are here.
  assert.match(game,/latin:\{get room\(\)\{return internationalWing\?\.rooms\?\.latin\},get built\(\)\{return !!internationalWing\?\.isBuilt\('latin'\)\}/);
  assert.match(game,/passages\?\.zoneAt\(x,z\)==='stoa'\|\|celsusRoom\?\.contains\?\.\(x,z\)\)\)this\.load\(\)/,'the wing’s books are fetched on the way through the Stoa');
  assert.match(fs.readFileSync('international-wing.js','utf8'),/activateRoom:key=>\{if\(!ROOMS\[key\]\)return;activate\(key\);placeLamps\(key\)\}/);
  assert.match(game,/passages\.floorAt\(x,z\)\?\?prePassageFloor/);assert.match(game,/passages\.contains\(x,z\)\?passages\.allowed\(x,z\)/);assert.match(game,/passages\.interact\(focus\)/);
  assert.match(game,/passages\?\.update\(t\)/);assert.match(game,/const backWay=passages\?\.zoneAt\(x,z\);if\(backWay\)return backWay;/);
  const ambience=fs.readFileSync('room-ambience.js','utf8'),{passages}=world();
  for(const p of passages.passages){assert(game.includes(`['${p.key}','`),`${p.key} is in the journal`);assert(ambience.includes(`'${p.key}':{`),`${p.key} has an ambience`)}
  // Each room can be built by a passage before the reader steps in.
  for(const file of Object.values(ROOMS))if(file!=='international-wing.js')assert.match(fs.readFileSync(file,'utf8'),/return \{contains,floorAt,allowed,interact,update,enter,(leave,)?(unload,)?activate(:buildRoom)?,/,`${file} exports activate`);
  assert.match(waldenSource,/\btrail:TRAIL,homestead:HOMESTEAD,quarter:QUARTER,centre:CENTRE,/,'Walden says where the Portage’s, the Homestead Stair’s and the Americas quarter’s doors stand');
  assert.match(celsusSource,/door:DOOR,stoa:STOA,/,'the Library of Celsus says where the Stoa’s door stands');
});

test('the rooms reached by air, by boat and by rocket stay that way',()=>{
  const {passages}=world(),joined=new Set(passages.passages.flatMap(p=>p.ends.map(e=>e.room)));
  for(const room of ['nights','african','crusoe','boathouse','moon','mars','rocket','antipodes','forest'])assert(!joined.has(room),`${room} has no back way`);
  assert.equal(passages.passages.length,12);
});

test('each door stands on its wall, clear of the corners and of the other doors there',()=>{
  const {passages}=world();const seen={};
  for(const p of passages.passages)for(const end of p.ends){
    if(end.spot)continue;// Walden's door stands in the pines, in no wall (checked with the Portage)
    if(end.enter)continue;// a quarter's door into a room off the corridor goes in by that room's own door
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
  const doors=interactables.filter(o=>o.userData.type==='passage-door'&&!o.userData.passage.startsWith('quarter-'));assert.equal(doors.length,2,'the Poe Room has two back ways');
  assert(interactables.some(o=>o.userData.type==='passage-door'&&o.userData.passage==='quarter-americas'),'and a door to its quarter');
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
  assert.equal(scene.children.map(c=>c.name).join(),'passage-door-cellar-stair,passage-door-quarter-britain','only the Irish Room, still built, keeps its doors');
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

test('the Homestead Stair goes down from Emily Dickinson’s room to Walden, and the Stoa from the Latin Reading Room to Ephesus',()=>{
  const {passages,rooms,player}=world(),stair=passages.passages.find(x=>x.key==='homestead-stair'),stoa=passages.passages.find(x=>x.key==='stoa');
  assert.equal(stair.ends.map(e=>e.room).join(),'dickinson,walden');assert.equal(stair.kind,'stair');assert(stair.ends[0].high,'her room was upstairs at the Homestead');
  // In her room: the west wall, south of the window (its pane spans cz−0.45 to cz+1.05) and north of the bureau.
  const room=roomOf('dickinson-room.js'),d=passages.roomDoor(stair.ends[0]);assert.equal(d.x,room.cx-room.w/2+.15);assert(d.z-.75>room.cz+1.1&&d.z+.75<room.cz+room.d/2-.3);
  assert(d.out.z<room.cz+3.65-.42,'the reader steps out clear of the bureau');
  // At Walden: a door by the road, turned to the clearing, opening onto ground within it.
  const w=passages.roomDoor(stair.ends[1]),{centre}=CLEARING;assert(Math.hypot(w.out.x-centre.x,w.out.z-centre.z)<Math.hypot(w.x-centre.x,w.z-centre.z),'it faces into the clearing');
  assert(Math.hypot(w.out.x-centre.x,w.out.z-centre.z)<30);assert(Math.hypot(w.x-CLEARING.trail.x,w.z-CLEARING.trail.z)>8,'well apart from the Portage’s door');
  passages.enterPassage(stair,0);assert.equal(passages.zoneAt(player.pos.x,player.pos.z),'homestead-stair');passages.leavePassage(stair,1);assert(rooms.walden.built);assert(rooms.walden.contains(player.pos.x,player.pos.z));
  // The Stoa: the Latin room's east wall, north of its door to the Italian room; at Ephesus the court's west wall, between the cypresses.
  assert.equal(stoa.ends.map(e=>e.room).join(),'latin,celsus');const latin=roomOf('international-wing.js'),l=passages.roomDoor(stoa.ends[0]);
  assert.equal(l.x,latin.cx+latin.w/2-.15);assert(Math.abs(l.z-latin.cz)>2.6,'clear of the door to the Italian room');
  const c=passages.roomDoor(stoa.ends[1]);assert(c.out.x>c.x&&rooms.celsus.contains(c.out.x,c.out.z));
  for(const i of [1,2])assert(Math.abs(c.z-(COURT.cz-COURT.d/2+4.5+i*4.4))>.6+.75,'clear of the cypresses either side');
  passages.enterPassage(stoa,0);assert.equal(passages.zoneAt(player.pos.x,player.pos.z),'stoa');passages.leavePassage(stoa,1);assert(rooms.celsus.built);
});

test('the quarters: a hall off the Long Corridor for Britain and Ireland and one for the Americas, a door into each of their rooms',()=>{
  const {passages,rooms,player,interactables,notices}=world(),q=key=>passages.passages.find(p=>p.key===key);
  const britain=q('quarter-britain'),americas=q('quarter-americas');
  assert.equal(britain.ends.map(e=>e.room).join(),'corridor,irish,burns,austen,scrooge');
  assert.equal(americas.ends.map(e=>e.room).join(),'corridor,dickinson,walden,canada,poe');
  for(const p of [britain,americas]){
    assert.equal(p.kind,'quarter');assert.equal(p.ends[0].room,'corridor');
    // The corridor's door opens onto the corridor's floor, facing across it.
    const c=passages.roomDoor(p.ends[0]);assert(rooms.corridor.contains(c.out.x,c.out.z),`${p.key}: out into the corridor`);
    // Its side doors stand apart on their walls, and every one opens onto the hall's floor.
    for(const side of [-1,1]){const along=p.ends.filter(e=>e.side===side).map(e=>e.along).sort((a,b)=>a-b);for(let i=1;i<along.length;i++)assert(along[i]-along[i-1]>3,`${p.key}: doors apart`)}
    for(let i=1;i<p.ends.length;i++){const d=passages.passageDoor(p,i);assert(passages.allowed(d.out.x,d.out.z),`${p.key} door ${i} opens onto the floor`);assert(d.lz>2&&d.lz<p.length-2)}
    // In from the corridor, and out through each door into its room.
    for(let i=1;i<p.ends.length;i++){passages.enterPassage(p,0);assert.equal(passages.zoneAt(player.pos.x,player.pos.z),p.key);
      const room=rooms[p.ends[i].room];room.built=false;passages.leavePassage(p,i);assert(room.built,`${p.ends[i].room} is built`);assert(room.contains(player.pos.x,player.pos.z),`into ${p.ends[i].room}`)}
    // And back from the corridor.
    passages.enterPassage(p,0);passages.leavePassage(p,0);assert(rooms.corridor.contains(player.pos.x,player.pos.z));
  }
  assert.match(notices.find(n=>n.startsWith('Britain and Ireland')),/^Britain and Ireland, a quarter of the library: The Irish Room, The Burns Room, The Austen Room, Scrooge’s chambers\.$/);
  // A door is hung only where there is a wall for it: rooms that open off the corridor, or have no wall to spare, are
  // gone into as their own doors go in.
  assert.deepEqual([...britain.ends,...americas.ends].filter(e=>e.enter).map(e=>e.room).sort(),['austen','burns','dickinson','scrooge']);
  rooms.corridor.built=true;rooms.irish.built=true;rooms.burns.built=true;passages.update(1);
  const hung=interactables.filter(o=>o.userData.type==='passage-door'&&o.userData.passage==='quarter-britain').map(o=>o.userData.end);
  assert(hung.includes(0)&&hung.includes(1)&&!hung.includes(2),'the corridor and the Irish Room have doors; the Burns Room is gone into by its own');
});

test('the Long Corridor names the four quarters over their bays, and keeps the islands’ own ways in',()=>{
  const signs=[...corridorSource.matchAll(/\{side:'(east|west)',bay:(\d),name:'([^']+)',text:'([^']+)'\}/g)].map(m=>({side:m[1],bay:+m[2],name:m[3],text:m[4]}));
  assert.deepEqual([...new Set(signs.map(s=>s.name))].sort(),['BRITAIN & IRELAND','ISLANDS & SEAS','OLD LIBRARIES','THE AMERICAS']);
  const at=(side,bay)=>signs.find(s=>s.side===side&&s.bay===bay)?.name;
  assert.equal(at('east',5),'BRITAIN & IRELAND');assert.equal(at('west',2),'THE AMERICAS');assert.equal(at('east',3),'ISLANDS & SEAS');
  assert.match(corridorSource,/const BRITAIN_DOOR=\{[^}]*bay:5,side:'east'\}/);assert.match(corridorSource,/const AMERICAS_DOOR=\{[^}]*bay:2,side:'west'\}/);
  // The islands reached by boat, globe, model and ship are named with the ways that lead to them, and given no door.
  const islands=signs.find(s=>s.name==='ISLANDS & SEAS').text;for(const way of ['Boathouse','model Nautilus','great globe','New Zealand Room'])assert(islands.includes(way),way);
});
