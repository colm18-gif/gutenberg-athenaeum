const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const zlib=require('node:zlib');

const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8'),source=fs.readFileSync('naturalist-room.js','utf8');
const arrivals=(()=>{const c={window:{}};vm.runInNewContext(fs.readFileSync('data/new-books.js','utf8'),c);return c.window.ATHENAEUM_NEW_BOOKS})();
const byRoom=room=>arrivals.filter(e=>e[4]===room).map(e=>e[0]);
const letters=text=>String(text).toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const bundled=id=>{const file=`texts/bundled-gzip/pg${id}.txt.gz`;return fs.existsSync(file)?letters(zlib.gunzipSync(fs.readFileSync(file)).toString('utf8')):null};

class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){Object.assign(this,{x,y,z});return this}clone(){return new V().set(this.x,this.y,this.z)}}
class O{constructor(){this.children=[];this.parent=null;this.visible=true;this.position=new V();this.scale=new V().set(1,1,1);this.rotation={x:0,y:0,z:0,order:'XYZ',set(x,y,z){Object.assign(this,{x,y,z})}};this.quaternion={clone:()=>({})};this.userData={}}
  add(c){c.parent=this;this.children.push(c);return this}removeFromParent(){if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1);this.parent=null}traverse(fn){fn(this);for(const c of this.children)c.traverse(fn)}}
class Mesh extends O{constructor(g,m){super();this.geometry=g;this.material=m}}
class Instanced extends Mesh{constructor(g,m,n){super(g,m);this.count=n;this.instanceMatrix={};this.colors=0}setMatrixAt(){}setColorAt(){this.colors++;this.instanceColor={}}dispose(){}}
const G=class{dispose(){}},M=class{constructor(p){Object.assign(this,p)}dispose(){}};
class Q{setFromAxisAngle(){return this}}class M4{compose(){return this}}
const THREE={Group:O,Mesh,InstancedMesh:Instanced,Vector3:V,Quaternion:Q,Matrix4:M4,Color:class{constructor(c){this.c=c}},BoxGeometry:G,CylinderGeometry:G,PlaneGeometry:G,SphereGeometry:G,ConeGeometry:G,MeshStandardMaterial:M,DoubleSide:2,
  PointLight:class extends O{constructor(c,i){super();this.isPointLight=true;this.isLight=true;this.intensity=i}}};
function room({search='',stored=null}={}){
  const store=new Map(stored?[[stored,'1']]:[]),storage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
  const context={window:{},Math,location:{search}};vm.runInNewContext(source,context);
  const scene=new O(),interactables=[],notices=[],player={pos:new V(),radius:.42},tracked=[],seats=[],sounds=[];
  const r=context.window.createNaturalistRoom({THREE,scene,MAT:{wood:new M({}),darkWood:new M({}),brass:new M({})},player,interactables,canvasTexture:()=>({dispose(){}}),bookMaterial:()=>new M({}),
    findBook:id=>({id,title:'Book '+id,author:'A'}),arrivals:{origin:byRoom('nature-origin'),collectors:byRoom('nature-collectors'),observers:byRoom('nature-observers'),sealed:byRoom('nature-sealed')},
    showNotice:t=>notices.push(t),playSample:name=>sounds.push(name),move:(x,z)=>player.pos.set(x,0,z),analytics:{track:(n,p)=>tracked.push([n,p])},storage,
    registerSeat:()=>{const data={};seats.push(data);return data},medicineRoom:{cx:-420,cz:-140,w:16,d:14}});
  return {r,scene,interactables,notices,player,tracked,seats,sounds,store};
}
const find=(a,type)=>a.interactables.find(o=>o.userData.type===type);

test('the Naturalist’s Cabinet loads before the game and is wired in like the other rooms behind doors',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);
  assert(order.indexOf('naturalist-room.js')>order.indexOf('medicine-room.js')&&order.indexOf('naturalist-room.js')<order.indexOf('game.js'));
  assert.match(game,/const naturalistRoom=window\.createNaturalistRoom\?\.\(/);assert.match(game,/medicineRoom:medicineRoom\?\.room/);
  assert(game.indexOf('const medicineRoom=')<game.indexOf('const naturalistRoom='),'the Medicine Room is built first: its west wall holds the door');
  assert.match(game,/\['naturalist-room','The naturalist’s cabinet'\]/);assert.match(game,/naturalist:'naturalist-room'/);assert.match(game,/darwin:'naturalist-room'/);
  assert.match(game,/'naturalist-room':naturalistRoom&&\(\(\)=>naturalistRoom\.enter\(\)\)/);assert.match(game,/naturalistRoom\?\.update\(t,dt\)/);assert.match(game,/if\(naturalistRoom\?\.contains\(x,z\)\)return 'naturalist-room'/);
  assert.match(fs.readFileSync('room-ambience.js','utf8'),/'naturalist-room':\{/);
  const pages=fs.readFileSync('scripts/book-pages.mjs','utf8'),resolver=fs.readFileSync('scripts/new-books.mjs','utf8');
  for(const key of ['nature-origin','nature-collectors','nature-observers','nature-sealed']){assert.match(resolver,new RegExp(`'${key}'`));assert.match(pages,new RegExp(`'${key}':'The Naturalist’s Cabinet'`))}
  assert.match(pages,/'The Naturalist’s Cabinet':'naturalist'/);
  assert.match(fs.readFileSync('book/1228-on-the-origin-of-species.html','utf8'),/<a href="\/\?room=naturalist">The Naturalist’s Cabinet<\/a>/,'the Origin’s page says where it is');
});

test('the door is at the south end of the Medicine Room’s west wall, clear of its shelf and its cabinet, and the room stands apart',()=>{
  const {r}=room(),medicine=fs.readFileSync('medicine-room.js','utf8');
  assert.equal(r.door.x,-420-8+.15);assert.equal(r.door.yaw,Math.PI/2);
  const shelf=medicine.match(/const WEST_SHELF=\{z:(-?[\d.]+),length:([\d.]+)\}/);assert(shelf,'the Medicine Room’s west shelf is set back');
  const shelfEnd=-140+Number(shelf[1])+Number(shelf[2])/2;assert(r.door.z-1.2>shelfEnd+.2,'clear of the west shelf');
  // The apothecary's cabinet stands in the south-west corner, 2.4 m along the south wall and 0.9 m deep.
  assert(r.door.z+1.2<-140+7-1.2-.45,'clear of the apothecary’s cabinet');
  // The Fabrica's case and the reading table are well out in the room.
  assert(Math.hypot(r.door.x-(-420),r.door.z-(-139.4))>5);
  const {cx,cz,w,d}=r.room;
  for(const [ox,oz,ow,od] of [[-420,-140,16,14],[-420,-60,18,14],[-330,-140,14,12],[-330,-205,16,14],[-330,-290,30,14],[-600,-294,16,16],[-600,-309,18,14],[-410,100,24,15],[-470,100,24,15],[-530,100,24,15]])
    assert(Math.abs(cx-ox)>(w+ow)/2+20||Math.abs(cz-oz)>(d+od)/2+20,`well clear of the room at ${ox}, ${oz}`);
});

test('the room is built on approach: three shelves, the dome, the cabinets, the writing table, seats, and a door back',()=>{
  const a=room();assert.equal(a.r.built,false);a.player.pos.set(a.r.door.x+2,0,a.r.door.z);a.r.update(1);assert.equal(a.r.built,true,'built as the reader comes near the door');
  const door=find(a,'naturalist-door');assert(door,'the door hangs in the Medicine Room');a.r.interact(door);
  assert(a.r.contains(a.player.pos.x,a.player.pos.z),'the door leads in');assert(a.r.allowed(a.player.pos.x,a.player.pos.z),'onto open floor');assert.match(a.notices.at(-1),/^The Naturalist’s Cabinet/);
  assert.deepEqual(JSON.stringify(a.tracked.at(-1)),JSON.stringify(['Room Explored',{room:'naturalist-room'}]));
  const {groups,sealed}=a.r.catalogue();for(const group of groups)assert(group.books.length>=8,`${group.key} has its books`);
  assert.equal(groups.find(g=>g.key==='origin').books[0].id,1228,'the library’s own Origin heads Darwin’s shelf');
  assert.deepEqual([...sealed.map(b=>b.id)],[22728]);
  for(const mesh of a.r.books){assert(a.r.contains(mesh.position.x,mesh.position.z),'every book is inside the room');assert(mesh.userData.naturalist)}
  assert(!a.r.books.some(m=>m.userData.shelf==='sealed'),'the essay is not out yet');
  for(const title of ['A dome of hummingbirds','A cabinet of specimens','A drawer of beetles','Darwin’s microscope','A letter from Ternate','The Sandwalk'])assert(a.interactables.some(o=>o.userData.type==='naturalist-card'&&o.userData.title===title),title);
  assert.equal(a.seats.length,2,'Darwin’s armchair and the writing chair');
  // From the door, across to Darwin's shelf on the far wall, and down to the writing table, the floor is clear.
  for(let x=a.r.room.cx+a.r.room.w/2-1.4;x>a.r.room.cx-a.r.room.w/2+1.4;x-=.2)assert(a.r.allowed(x,a.r.doorZ),`the way across the room is clear at x ${x.toFixed(1)}`);
  assert(a.r.allowed(a.r.room.cx+4,a.r.room.cz+a.r.room.d/2-3.6),'the way to the writing table');
  const exit=find(a,'naturalist-exit');a.r.interact(exit);assert(!a.r.contains(a.player.pos.x,a.player.pos.z),'back to the Medicine Room');assert(Math.abs(a.player.pos.x-(a.r.door.x+1.6))<.01);
  const lamps=[];a.scene.traverse(o=>{if(o.isPointLight)lamps.push(o)});assert.equal(lamps.length,1,'one lamp');
  let colored=0;a.scene.traverse(o=>{if(o.colors)colored++});assert(colored>=4,'the birds, shells, eggs and beetles are each one instanced mesh');
  a.player.pos.set(0,0,0);a.r.update(100);assert.equal(a.r.built,false,'freed once the reader has gone');for(const lamp of lamps)assert.equal(lamp.userData.freed,true);
  assert(!a.interactables.some(o=>/^naturalist-(card|exit|drawer)$/.test(o.userData.type)),'its parts go with it');assert(find(a,'naturalist-door'),'but the door stays');
});

test('the drawer of the writing table gives up the essay of 1844, and stays open',()=>{
  const a=room();a.r.enter();const drawer=find(a,'naturalist-drawer');assert(drawer);assert.equal(a.r.drawerOpen,false);
  a.r.interact(drawer);assert.equal(a.r.drawerOpen,true);assert.match(a.notices.at(-1),/5 July 1844/);assert(a.notices.at(-1).includes(a.r.letter));
  assert.deepEqual(JSON.stringify(a.tracked.at(-1)),JSON.stringify(['Secret Found',{secret:'darwin-sketch'}]));assert.equal(a.store.get('athenaeum-darwin-sketch'),'1');
  const essay=a.r.books.filter(m=>m.userData.shelf==='sealed');assert.deepEqual([...essay.map(m=>m.userData.book.id)],[22728]);for(const m of essay)assert.equal(m.visible,true);
  assert(!a.interactables.some(o=>o.userData.type==='naturalist-drawer'),'opened once');
  for(let t=1;t<4;t+=.1)a.r.update(t,.1);
  const b=room({stored:'athenaeum-darwin-sketch'});b.r.enter();assert.equal(b.r.drawerOpen,true,'found once, found for good');
  const c=room({search:'?sketch'});c.r.enter();assert.equal(c.r.drawerOpen,true,'?sketch opens it');
});

test('its books are held nowhere else, each has a note of three sentences, and the quotations are in their books',()=>{
  const nature=arrivals.filter(e=>/^nature-/.test(e[4]));assert(nature.length>=30);
  const elsewhere=new Set(arrivals.filter(e=>!/^nature-/.test(e[4])).map(e=>e[0]));
  const core=[...game.slice(game.indexOf('const books=['),game.indexOf('const books=[')+40000).matchAll(/\[(\d+),'/g)].map(m=>Number(m[1]));
  for(const [id,title,,,,note] of nature){
    assert(Number.isInteger(id),`${title} has its number`);assert(!elsewhere.has(id),`${title} is on no other shelf`);assert(!core.includes(id),`${title} is not already in the hall`);
    assert.equal(note.split(/(?<=[a-z0-9”’)I][.!?])\s+(?=[A-ZÁÉÍÓÚŒ“])/).length,3,`${title}: three sentences`);
  }
  assert.equal(new Set(nature.map(e=>e[0])).size,nature.length,'each once');
  const {r}=room();const catalogues=fs.readdirSync('data').filter(f=>/catalog|books\.js$/.test(f)&&f!=='new-books.js').map(f=>fs.readFileSync('data/'+f,'utf8')).join('\n');
  for(const group of r.groups)for(const id of group.ids)assert(core.includes(id)||new RegExp(`id:${id},`).test(catalogues),`${id} is the library’s own copy`);
  // Darwin's letter to Emma, as printed in The Foundations; Huxley's first thought, in his own account. Checked when the
  // texts are bundled (the New books workflow bundles them).
  const quoted=[[22728,r.letter],[2089,'How extremely stupid not to have thought of that']];
  for(const [id,words] of quoted){const text=bundled(id);if(text)assert(text.includes(letters(words)),`“${words.slice(0,40)}…” is in book ${id}`)}
});
