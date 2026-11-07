const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const zlib=require('node:zlib');

const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8'),source=fs.readFileSync('gulliver-room.js','utf8');
const arrivals=(()=>{const c={window:{}};vm.runInNewContext(fs.readFileSync('data/new-books.js','utf8'),c);return c.window.ATHENAEUM_NEW_BOOKS})();
const byRoom=room=>arrivals.filter(e=>e[4]===room).map(e=>e[0]);

class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){Object.assign(this,{x,y,z});return this}clone(){return new V().set(this.x,this.y,this.z)}copy(v){return this.set(v.x,v.y,v.z)}}
class O{constructor(){this.children=[];this.parent=null;this.visible=true;this.position=new V();this.scale=new V().set(1,1,1);this.rotation={x:0,y:0,z:0,order:'XYZ',set(x,y,z){Object.assign(this,{x,y,z})}};this.quaternion={clone:()=>({})};this.userData={}}
  add(...m){for(const c of m){c.parent=this;this.children.push(c)}return this}removeFromParent(){if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1);this.parent=null}traverse(fn){fn(this);for(const c of this.children)c.traverse(fn)}}
class Mesh extends O{constructor(g,m){super();this.isMesh=true;this.geometry=g;this.material=m}}
let disposed=0;const G=class{dispose(){disposed++}setAttribute(){}},M=class{constructor(p){Object.assign(this,p)}dispose(){disposed++}};
class Matrix4{makeTranslation(){return this}compose(){return this}}
class Quaternion{identity(){return this}setFromAxisAngle(){return this}}
class Shape{moveTo(){}lineTo(){}absarc(){}}
const THREE={Group:O,Mesh,Vector3:V,Matrix4,Quaternion,Shape,BoxGeometry:G,CylinderGeometry:G,PlaneGeometry:G,SphereGeometry:G,CircleGeometry:G,ConeGeometry:G,ShapeGeometry:G,BufferGeometry:G,
  Float32BufferAttribute:class{},LineSegments:class extends O{},LineBasicMaterial:M,MeshStandardMaterial:M,MeshBasicMaterial:M,DoubleSide:2,RepeatWrapping:1000,
  InstancedMesh:class extends Mesh{constructor(g,m,n){super(g,m);this.count=n}setMatrixAt(){}},
  PointLight:class extends O{constructor(c,i){super();this.isPointLight=true;this.isLight=true;this.intensity=i}}};
const MAT={wood:new M({}),darkWood:new M({}),brass:new M({})};
function room({search='',stored=null}={}){
  const store=new Map(stored?[[stored,'1']]:[]),storage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
  const context={window:{},Math,location:{search}};vm.runInNewContext(source,context);
  const scene=new O(),interactables=[],notices=[],player={pos:new V(),radius:.42},tracked=[],seats=[],sounds=[];
  const r=context.window.createGulliverRoom({THREE,scene,MAT,player,interactables,canvasTexture:()=>({dispose(){disposed++}}),bookMaterial:()=>new M({}),
    findBook:id=>({id,title:'Book '+id,author:'A'}),arrivals:{swift:byRoom('lilliput-swift'),small:byRoom('lilliput-small'),bigend:byRoom('lilliput-bigend'),giants:byRoom('brob-giants'),seeing:byRoom('brob-seeing'),life:byRoom('brob-swift')},
    showNotice:t=>notices.push(t),playSample:name=>sounds.push(name),move:(x,z)=>player.pos.set(x,0,z),analytics:{track:(n,p)=>tracked.push([n,p])},storage,
    registerSeat:()=>{const data={};seats.push(data);return data},irishRoom:{cx:-330,cz:-205,w:16,d:14}});
  return {r,scene,interactables,notices,player,tracked,seats,sounds,store};
}
function irish(){
  const context={window:{},Math};vm.runInNewContext(fs.readFileSync('irish-room.js','utf8'),context);
  const scene=new O(),player={pos:new V(),radius:.42};
  const r=context.window.createIrishRoom({THREE,scene,MAT,player,interactables:[],canvasTexture:()=>({dispose(){}}),bookMaterial:()=>new M({}),findBook:id=>({id,title:'Book '+id,author:'A'}),
    arrivals:{},showNotice:()=>{},playSample:()=>{},move:(x,z)=>player.pos.set(x,0,z)});
  r.enter();return r;
}
const find=(a,type,extra=()=>true)=>a.interactables.find(o=>o.userData.type===type&&extra(o.userData));
// Can a reader walk from one spot to within reach of another? The reader stands at each spot in turn, since the
// reading machine's steps are taken one at a time from where the reader is.
function walk(r,player,from,to,reach=.25){
  const seen=new Set(),queue=[[from.x,from.z]],key=(x,z)=>`${x.toFixed(1)},${z.toFixed(1)}`;
  while(queue.length){const [x,z]=queue.shift();if(Math.hypot(x-to.x,z-to.z)<reach)return true;
    for(const [dx,dz] of [[.2,0],[-.2,0],[0,.2],[0,-.2]]){const nx=x+dx,nz=z+dz,k=key(nx,nz);if(seen.has(k))continue;player.pos.set(x,0,z);if(!r.allowed(nx,nz))continue;seen.add(k);queue.push([nx,nz])}}
  return false;
}
const letters=text=>text.toLowerCase().replace(/[^a-z]+/g,'');

test('Lilliput and Brobdingnag load before the game and are wired in like the other rooms behind doors',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);
  assert(order.indexOf('irish-room.js')<order.indexOf('gulliver-room.js')&&order.indexOf('gulliver-room.js')<order.indexOf('game.js'));
  assert.match(game,/const gulliverRoom=window\.createGulliverRoom\?\.\(/);assert(game.indexOf('const irishRoom=')<game.indexOf('const gulliverRoom='),'the Irish Room is built first: its wall holds the door');
  assert.match(game,/\['lilliput','Lilliput'\],\['brobdingnag','Brobdingnag'\]/);assert.match(game,/gulliver:'lilliput'/);assert.match(game,/bigend:'lilliput'/);
  assert.match(game,/lilliput:gulliverRoom&&\(\(\)=>gulliverRoom\.enter\('lilliput'\)\)/);assert.match(game,/brobdingnag:gulliverRoom&&\(\(\)=>gulliverRoom\.enter\('brobdingnag'\)\)/);
  assert.match(game,/gulliverRoom\?\.update\(t\)/);assert.match(game,/if\(gulliverRoom\?\.contains\(x,z\)\)return gulliverRoom\.zoneAt\(x,z\)/);
  assert.match(game,/'canada-room','lilliput'\]\.map/,'the Wandering Door may open on Lilliput, a room behind an ordinary door');
  const ambience=fs.readFileSync('room-ambience.js','utf8');assert.match(ambience,/lilliput:\{beds:/);assert.match(ambience,/brobdingnag:\{beds:/);
  const resolver=fs.readFileSync('scripts/new-books.mjs','utf8'),pages=fs.readFileSync('scripts/book-pages.mjs','utf8');
  for(const key of ['lilliput-swift','lilliput-small','lilliput-bigend','brob-giants','brob-seeing','brob-swift']){assert.match(resolver,new RegExp(`'${key}'`));assert.match(pages,new RegExp(`'${key}':'(Lilliput|Brobdingnag)'`))}
  assert.match(pages,/'Lilliput':'lilliput','Brobdingnag':'brobdingnag'/);
  const exploration=fs.readFileSync('exploration.js','utf8');assert.match(exploration,/lilliput:\['The narrow door/);assert.match(exploration,/brobdingnag:\['Through Lilliput/);
});

test('the door is at the east end of the Irish Room’s north wall, clear of the writers’ shelves and the corner, and the Irish Room’s floor leads to it',()=>{
  const {r}=room(),ir=irish();
  assert.equal(r.door.yaw,0);assert.equal(r.door.z,-205-7+.2);
  assert(r.door.x-.65-.22>-330+5.9,'clear of the writers’ shelves');assert(r.door.x+.65+.22<-330+8-.1,'clear of the corner');
  const front={x:r.door.x,z:r.door.z+1.2},player={pos:new V()};assert(ir.allowed(front.x,front.z),'there is room to stand at the door');
  assert(walk({allowed:ir.allowed},player,{x:-330,z:-205+5},front),'a reader can walk to the door from the Irish Room’s own door');
  // Well apart from every other place.
  for(const [name,box] of [['Lilliput',r.lilliput],['Brobdingnag',r.brobdingnag]])
    for(const [ox,oz,ow,od] of [[-600,-309,18,14],[-420,165,30,40],[-530,132,16,14],[-530,164,16,14],[-820,-620,120,120],[-900,-600,60,60],[-500,-140,20,16],[-330,100,16,14]])
      assert(Math.abs(box.cx-ox)>(box.w+ow)/2+60||Math.abs(box.cz-oz)>(box.d+od)/2+60,`${name} is well clear of ${ox}, ${oz}`);
  assert(r.lilliput.cz+r.lilliput.d/2<r.brobdingnag.cz-r.brobdingnag.d/2||r.brobdingnag.cz+r.brobdingnag.d/2<r.lilliput.cz-r.lilliput.d/2,'the two rooms do not overlap');
});

test('the rooms are built on approach, the books are in the Emperor’s library and Gulliver’s chamber, and they are freed after',()=>{
  const a=room();assert.equal(a.r.built,false);a.player.pos.set(a.r.door.x,0,a.r.door.z+2);a.r.update(1);assert.equal(a.r.built,true);
  const L=a.r.lilliput,B=a.r.brobdingnag,inside=(m,box)=>Math.abs(m.position.x-box.cx)<box.w/2&&Math.abs(m.position.z-box.cz)<box.d/2;
  // Books in groups are positioned in world space whatever their parent group, since the groups stand at the origin.
  const world=m=>{let x=m.position.x,z=m.position.z;for(let p=m.parent;p&&p.parent;p=p.parent){x+=p.position.x;z+=p.position.z}return {position:{x,z}}};
  const shelf=s=>a.r.books.filter(m=>m.userData.shelf===s);
  for(const s of ['swift','small'])for(const m of shelf(s))assert(inside(world(m),L),`a ${s} book is in Lilliput`);
  for(const s of ['giants','seeing','life'])for(const m of shelf(s)){const w=world(m),c=a.r.chamber;assert(inside(w,B));assert(Math.abs(w.position.x-c.x)<c.half&&Math.abs(w.position.z-c.z)<c.half,`a ${s} book is inside Gulliver’s chamber`)}
  assert(shelf('swift').length>=8&&shelf('small').length>=4&&shelf('giants').length>=6&&shelf('seeing').length>=6&&shelf('life').length>=6);
  assert(shelf('life').some(m=>m.userData.book.id===829),'Gulliver’s own Travels, in his chamber');
  assert.equal(shelf('bigend').length,0,'the forbidden book is not out until the egg is broken');
  for(const type of ['gulliver-exit','gulliver-onward','gulliver-back','gulliver-egg'])assert(find(a,type),type);
  for(const title of ['The wall of Mildendo','The Emperor’s palace','Gulliver’s hat','The fleet of Blefuscu','The royal park','The reading machine','Gulliver’s chamber','The King of Brobdingnag'])
    assert(a.interactables.some(o=>o.userData.title===title),title);
  assert.equal(a.seats.length,1,'Gulliver’s chair is one of the library’s seats');
  a.player.pos.set(0,0,0);a.r.update(20);assert.equal(a.r.built,true,'kept a while');a.r.update(60);assert.equal(a.r.built,false,'then freed');
  assert(!a.interactables.some(o=>/^gulliver-(card|egg|exit|onward|back)$/.test(o.userData.type)),'its parts go with it');assert(find(a,'gulliver-door'),'but the door stays');
});

test('through the door to Lilliput, on to Brobdingnag, back through the mouse-hole and out to the Irish Room',()=>{
  const a=room();
  a.r.interact(find(a,'gulliver-door'));assert.equal(a.r.zoneAt(a.player.pos.x,a.player.pos.z),'lilliput');assert(a.r.allowed(a.player.pos.x,a.player.pos.z),'onto open floor');
  assert.match(a.notices.at(-1),/^Lilliput/);assert.equal(JSON.stringify(a.tracked.at(-1)),JSON.stringify(['Room Explored',{room:'lilliput'}]));
  a.r.interact(find(a,'gulliver-onward'));assert.equal(a.r.zoneAt(a.player.pos.x,a.player.pos.z),'brobdingnag');assert(a.r.allowed(a.player.pos.x,a.player.pos.z));
  assert.equal(JSON.stringify(a.tracked.at(-1)),JSON.stringify(['Room Explored',{room:'brobdingnag'}]));
  a.r.interact(find(a,'gulliver-back'));assert.equal(a.r.zoneAt(a.player.pos.x,a.player.pos.z),'lilliput');assert(a.r.allowed(a.player.pos.x,a.player.pos.z));
  a.r.interact(find(a,'gulliver-exit'));assert(!a.r.contains(a.player.pos.x,a.player.pos.z));assert(Math.abs(a.player.pos.z-(a.r.door.z+1.9))<.01,'out into the Irish Room');
});

test('in Lilliput the reader walks round Mildendo and through its streets, but not over its houses, and reaches the library, the egg and the doors',()=>{
  const a=room();a.r.enter('lilliput');const L=a.r.lilliput,start={x:a.player.pos.x,z:a.player.pos.z};
  const north=L.cz-L.d/2;
  assert(walk(a.r,a.player,start,{x:L.cx,z:north+1.4}),'to the door on to Brobdingnag');
  assert(walk(a.r,a.player,start,{x:L.cx-4.4,z:north+2.3},.35),'to the Emperor’s breakfast');
  assert(walk(a.r,a.player,start,{x:L.cx-5,z:L.cz-1.6+2.6}),'into the palace court, by the streets');
  a.player.pos.set(L.cx,0,L.cz);
  assert.equal(a.r.allowed(L.cx-5+2.6,L.cz-1.6+2.6),false,'not over the houses');assert.equal(a.r.allowed(L.cx-5,L.cz-1.6),false,'not through the palace');
  assert.equal(a.r.allowed(L.cx-5-3,L.cz-1.6),true,'along a street');
});

test('in Brobdingnag the reader climbs the reading machine a step at a time, reads from the top, and goes into Gulliver’s chamber',()=>{
  const a=room();a.r.enter('brobdingnag');const B=a.r.brobdingnag,m=a.r.machine,start={x:a.player.pos.x,z:a.player.pos.z};
  assert(Math.abs(m.steps*m.rise-7.62)<.05,'twenty-five feet high');assert(Math.abs(m.length-15.24)<.3,'steps fifty feet long');assert(Math.abs(m.gap-3.05)<.01,'ten feet from the wall');
  const wallZ=B.cz-B.d/2+.4,topZ=wallZ+m.gap+m.tread/2;
  assert.equal(a.r.floorAt(B.cx,topZ),m.steps*m.rise,'the top step');
  assert(walk(a.r,a.player,start,{x:B.cx+5,z:topZ}),'up to the top step, and along it');
  // From the floor beside the machine, no climbing on to a high step; from the top, no stepping off into the air.
  a.player.pos.set(B.cx-m.length/2-1,0,topZ+4);assert.equal(a.r.allowed(B.cx-m.length/2+.5,topZ+4),false,'not on from the side');
  a.player.pos.set(B.cx,0,topZ);assert.equal(a.r.allowed(B.cx,topZ-m.tread*1.5),false,'not off the top');
  const c=a.r.chamber;assert(walk(a.r,a.player,start,{x:c.x,z:c.z+1.4},.3),'into Gulliver’s chamber, by its door');
  a.player.pos.set(c.x,0,c.z+c.half+1);assert.equal(a.r.allowed(c.x+1.5,c.z+c.half),false,'not through its walls');
});

test('the Emperor’s egg: the small end, as the edict commands, does nothing; the big end lets out the forbidden book, and it stays found',()=>{
  const a=room();a.r.enter('lilliput');
  a.r.interact(find(a,'gulliver-egg',d=>d.end==='small'));assert.equal(a.r.bigEndFound,false);assert.match(a.notices.at(-1),/smaller end/);
  a.r.interact(find(a,'gulliver-egg',d=>d.end==='big'));assert.equal(a.r.bigEndFound,true);assert.equal(a.store.get('athenaeum-gulliver-big-end'),'1');
  assert.equal(JSON.stringify(a.tracked.at(-1)),JSON.stringify(['Secret Found',{secret:'gulliver-big-end'}]));
  const tub=a.r.books.filter(m=>m.userData.shelf==='bigend');assert.equal(JSON.stringify(tub.map(m=>m.userData.book.id)),JSON.stringify(byRoom('lilliput-bigend')));assert(tub.every(m=>m.visible&&a.interactables.includes(m)));
  const b=room({stored:'athenaeum-gulliver-big-end'});b.r.enter();assert.equal(b.r.bigEndFound,true,'found once, found for good');
  const c=room({search:'?bigend'});c.r.enter();assert.equal(c.r.bigEndFound,true,'?bigend shows it');
});

test('every word given to Swift is in Gulliver’s Travels, and the cards quote nothing else',()=>{
  const text=letters(zlib.gunzipSync(fs.readFileSync('texts/bundled-gzip/pg829.txt.gz')).toString('utf8'));
  const {r}=room();
  for(const [key,words] of Object.entries(r.swift))assert(text.includes(letters(words)),`${key} is Swift’s`);
  const quoted=Object.values(r.swift).map(letters);
  for(const [title,body] of Object.values(r.cards))for(const [,inner] of body.matchAll(/“([^”]+)”/g)){const l=letters(inner);assert(quoted.some(s=>s.includes(l)||l.includes(s)),`${title}: “${inner.slice(0,40)}…” is one of Swift’s`)}
});

test('its books each have a note of three sentences, appear once, and fit their shelves',()=>{
  const ours=arrivals.filter(e=>/^(lilliput|brob)-/.test(e[4]));assert(ours.length>=20);
  for(const [id,title,,,,note] of ours){assert(Number.isInteger(id),`${title} has its number`);
    assert.equal(note.split(/(?<=[a-z0-9”’)I][.!?])\s+(?=[A-ZÁÉÍÓÚŒ“])/).length,3,`${title}: three sentences`)}
  assert.equal(new Set(ours.map(e=>e[0])).size,ours.length,'each once');assert.equal(byRoom('lilliput-bigend').length,1,'one book in the press');
  assert(byRoom('lilliput-swift').length<=10&&byRoom('lilliput-small').length+1<=6);
  for(const [shelf,own] of [['brob-giants',3],['brob-seeing',4],['brob-swift',1]])assert(byRoom(shelf).length+own<=10,`${shelf} fits a wall of the chamber`);
});
