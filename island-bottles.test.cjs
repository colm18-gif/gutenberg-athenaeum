const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8'),source=fs.readFileSync('island-bottles.js','utf8');

class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){Object.assign(this,{x,y,z});return this}}
class O{constructor(){this.children=[];this.parent=null;this.position=new V();this.scale=new V().set(1,1,1);this.rotation={x:0,y:0,z:0};this.userData={}}
  add(c){if(c.parent)c.parent.remove(c);c.parent=this;this.children.push(c);return this}remove(c){const i=this.children.indexOf(c);if(i>=0)this.children.splice(i,1);c.parent=null;return this}
  removeFromParent(){if(this.parent)this.parent.remove(this);return this}traverse(fn){fn(this);for(const c of this.children)c.traverse(fn)}}
class Mesh extends O{constructor(g,m){super();this.geometry=g;this.material=m;this.isMesh=true}}
const G=class{dispose(){}},M=class{constructor(p){Object.assign(this,p)}dispose(){}};
const THREE={Group:O,Mesh,BoxGeometry:G,PlaneGeometry:G,SphereGeometry:G,CylinderGeometry:G,CircleGeometry:G,ConeGeometry:G,MeshStandardMaterial:M,DoubleSide:2};
// Each place as its module defines it.
const box=(file,re=/const ROOM=\{cx:(-?[\d.]+),cz:(-?[\d.]+),w:([\d.]+),d:([\d.]+)/)=>{const m=fs.readFileSync(file,'utf8').match(re);return {cx:+m[1],cz:+m[2],w:+m[3],d:+m[4]}};
const PLACES={irish:box('irish-room.js'),burns:box('burns-room.js'),faroe:box('faroe-islands.js'),montserrat:box('montserrat-room.js'),norfolk:box('norfolk-island.js'),australian:box('antipodes.js',/AUS=\{cx:(-?[\d.]+),cz:(-?[\d.]+),w:([\d.]+),d:([\d.]+)/),
  pitcairn:box('pitcairn-island.js',/SQ=\{cx:(-?[\d.]+),cz:(-?[\d.]+),w:([\d.]+),d:([\d.]+)/),sthelena:box('st-helena.js'),tristan:box('tristan-island.js')};
const inside=(b,x,z,m=0)=>Math.abs(x-b.cx)<b.w/2-m&&Math.abs(z-b.cz)<b.d/2-m;

function world(){
  const context={window:{},Math,JSON};vm.runInNewContext(source,context);
  const scene=new O(),interactables=[],notices=[],player={pos:new V(),yaw:0},tracked=[],store=new Map(),places={};
  for(const key of Object.keys(PLACES))places[key]={built:false,activate(){this.built=true}};
  const bottles=context.window.createIslandBottles({THREE,scene,MAT:{darkWood:new M({}),brass:new M({})},interactables,canvasTexture:()=>({dispose(){}}),showNotice:t=>notices.push(t),
    playSample:()=>{},analytics:{track:(n,p)=>tracked.push([n,p])},places,storage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)},
    move:(x,z,yaw)=>{player.pos.set(x,0,z);player.yaw=yaw}});
  return {bottles,scene,interactables,notices,player,tracked,places,store};
}

test('the island bottles load before the game and are wired in',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);
  for(const file of ['irish-room.js','burns-room.js','faroe-islands.js','montserrat-room.js','norfolk-island.js','antipodes.js','pitcairn-island.js','st-helena.js','tristan-island.js'])assert(order.indexOf(file)<order.indexOf('island-bottles.js'),`${file} loads first`);
  assert(order.indexOf('island-bottles.js')<order.indexOf('game.js'));
  assert.match(game,/places:\{irish:irishRoom,burns:burnsRoom,faroe:faroeIslands,montserrat:montserratRoom,norfolk:norfolkIsland,australian:antipodes&&\{get built\(\)\{return antipodes\.built\},go:\(\)=>antipodes\.enter\('australian-room'\)\},pitcairn:pitcairnIsland,sthelena:stHelena,tristan:tristanIsland\}/);
  assert.match(game,/islandBottles\.interact\(focus\)/);assert.match(game,/islandBottles\.update\(t\)/);
  for(const name of ['irishRoom','burnsRoom','faroeIslands','montserratRoom','norfolkIsland','antipodes','pitcairnIsland','stHelena','tristanIsland'])assert(Math.max(game.indexOf(`const ${name}=`),game.indexOf(`var ${name}=`))<game.indexOf('const islandBottles='),`${name} is made first`);
});

test('each bottle stands in its own room, against a wall or on its table, with the reader’s arrival in front of it and facing it',()=>{
  const {bottles}=world();
  for(const link of bottles.links)for(const end of link.ends){const room=PLACES[end.place],{bottle:b,stand:s}=end;
    assert(inside(room,b.x,b.z),`${link.key}: the bottle is in ${end.place}`);
    const wall=Math.min(Math.abs(b.z-(room.cz-room.d/2)),Math.abs(b.z-(room.cz+room.d/2)),Math.abs(b.x-(room.cx-room.w/2)),Math.abs(b.x-(room.cx+room.w/2)));
    // A bottle on a table lies beside the island's own bottle home, at the table's height.
    if(b.table)assert(Math.abs(b.y-.79)<.03,`${link.key}: on the table in ${end.place}`);else assert(wall<.9,`${link.key}: against a wall of ${end.place}`);
    // Its plate faces out from the wall it stands against, into the room.
    assert(inside(room,b.x+Math.sin(b.yaw)*1.2,b.z+Math.cos(b.yaw)*1.2),`${link.key}: it faces into ${end.place}`);
    assert(inside(room,s.x,s.z,.85),`${link.key}: the reader arrives within ${end.place}, clear of its walls`);
    const dist=Math.hypot(s.x-b.x,s.z-b.z),ahead=(-Math.sin(s.yaw)*(b.x-s.x)-Math.cos(s.yaw)*(b.z-s.z))/dist;
    assert(dist>.9&&dist<3.2,'a step or two from the bottle');assert(ahead>.9,`${link.key}: the reader faces the bottle`);assert(b.y>.75&&b.y<3,'within reach of the eye')}
});

test('a bottle appears only while its room is built, and looking in takes the reader to the other end, builds it first and stands them before its bottle',()=>{
  const {bottles,places,interactables,scene,player,notices,tracked,store}=world();
  bottles.update(0);assert.equal(interactables.length,0,'nothing at startup');
  places.irish.built=true;bottles.update(1);assert.equal(bottles.hung.join(),'montserrat-irish:irish');
  const b=interactables.find(o=>o.userData.type==='island-bottle');assert.match(b.userData.title,/MONTSERRAT/);assert.match(b.userData.author,/Emerald Isle/);
  assert(bottles.interact(b));assert(places.montserrat.built,'Montserrat is built before the reader arrives');
  const there=bottles.links.find(l=>l.key==='montserrat-irish').ends[1].stand;assert.equal(player.pos.x,there.x);assert.equal(player.pos.z,there.z);assert.match(notices.at(-1),/Montserrat/);
  assert.equal(JSON.stringify(tracked.at(-1)),'["Room Explored",{"room":"montserrat","via":"island-bottle"}]');assert.equal(store.get('athenaeum-island-bottles'),'["montserrat-irish"]');
  bottles.update(2);const back=interactables.find(o=>o.userData.type==='island-bottle'&&o.userData.end===1);assert.match(back.userData.title,/THE IRISH ROOM/);
  // The Australian Room is reached through the Antipodes' own way in.
  let went=0;places.australian.go=()=>{went++;places.australian.built=true};places.norfolk.built=true;bottles.update(3);
  assert(bottles.interact(interactables.find(o=>o.userData.link==='norfolk-australian'&&o.userData.end===0)));assert.equal(went,1);assert.match(notices.at(-1),/Australian Room/);
  // Taken down with their rooms, and no light anywhere.
  for(const p of Object.values(places))p.built=false;bottles.update(4);assert.equal(interactables.length,0);assert.equal(scene.children.length,0);
  let lights=0;scene.traverse(o=>{if(o.isLight)lights++});assert.equal(lights,0);
});

test('the cards say only what is so',()=>{
  const {bottles}=world(),text=bottles.links.flatMap(l=>l.ends.map(e=>e.author+' '+e.arrive)).join(' ');
  assert.match(text,/St Patrick’s Day is a public holiday/);assert.match(text,/settlement was made from Sydney in 1788/);assert.match(text,/Australian territory since 1914/);
  assert.doesNotMatch(text,/slave/i,'the Irish on Montserrat were not slaves: no card goes near the myth');
});
