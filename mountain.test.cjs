const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const zlib=require('node:zlib');

const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8'),source=fs.readFileSync('mountain.js','utf8');
const arrivals=(()=>{const c={window:{}};vm.runInNewContext(fs.readFileSync('data/new-books.js','utf8'),c);return c.window.ATHENAEUM_NEW_BOOKS})();
const byRoom=room=>arrivals.filter(e=>e[4]===room).map(e=>e[0]);
const text=id=>{const gz=`texts/bundled-gzip/pg${id}.txt.gz`;return fs.existsSync(gz)?zlib.gunzipSync(fs.readFileSync(gz)).toString('utf8'):fs.readFileSync(`texts/pg${id}.txt`,'utf8')};
const letters=s=>s.toLowerCase().replace(/[^a-z]/g,'');

// Just enough of three.js for the mountain to build itself without drawing anything.
class V{constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}set(x,y,z){Object.assign(this,{x,y,z});return this}setScalar(s){return this.set(s,s,s)}clone(){return new V(this.x,this.y,this.z)}copy(v){return this.set(v.x,v.y,v.z)}
  applyMatrix4(){return this}lerp(v,t){return this.set(this.x+(v.x-this.x)*t,this.y+(v.y-this.y)*t,this.z+(v.z-this.z)*t)}}
class Matrix4{compose(){return this}makeRotationY(){return this}multiply(){return this}}
const rotation=()=>({x:0,y:0,z:0,order:'XYZ',set(x,y,z){Object.assign(this,{x,y,z})}});
class O{constructor(){this.children=[];this.parent=null;this.visible=true;this.position=new V();this.scale=new V(1,1,1);this.rotation=rotation();this.quaternion={clone:()=>({})};this.userData={};this.matrix=new Matrix4()}
  add(...m){for(const c of m){c.parent=this;this.children.push(c)}return this}removeFromParent(){if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1);this.parent=null}traverse(fn){fn(this);for(const c of this.children)c.traverse(fn)}
  updateMatrix(){}updateMatrixWorld(){}lookAt(){}clone(){const c=new this.constructor(this.geometry,this.material);c.position.copy(this.position);Object.assign(c.rotation,{x:this.rotation.x,y:this.rotation.y,z:this.rotation.z});return c}
  getObjectByName(name){let found=null;this.traverse(o=>{if(!found&&o.name===name)found=o});return found}}
class Mesh extends O{constructor(g,m){super();this.geometry=g;this.material=m}}
class InstancedMesh extends Mesh{constructor(g,m,n){super(g,m);this.count=n;this.instanceMatrix={needsUpdate:false}}setMatrixAt(){}computeBoundingSphere(){}}
class Sprite extends O{constructor(m){super();this.material=m}}
class Points extends Mesh{}
class Line extends Mesh{}
let disposed=0;
const attribute={count:0,getX:()=>0,getY:()=>0,getZ:()=>0};
class G{constructor(){this.index=null;this.attributes={position:attribute,normal:attribute}}toNonIndexed(){return this}applyMatrix4(){return this}computeVertexNormals(){}setAttribute(k,v){this.attributes[k]=v}setIndex(){}setFromPoints(){return this}rotateX(){return this}dispose(){disposed++}}
class Attr{constructor(array){this.array=array;this.needsUpdate=false}}
const M=class{constructor(p){Object.assign(this,{opacity:1},p)}dispose(){disposed++}};
const THREE={Group:O,Object3D:O,Mesh,InstancedMesh,Sprite,Points,Line,Vector3:V,Matrix4,Quaternion:class{setFromEuler(){return this}},Euler:class{},Color:class{setHex(){return this}},
  BufferGeometry:G,Float32BufferAttribute:Attr,BoxGeometry:G,CylinderGeometry:G,PlaneGeometry:G,SphereGeometry:G,CircleGeometry:G,ConeGeometry:G,IcosahedronGeometry:G,DodecahedronGeometry:G,TorusGeometry:G,
  MeshStandardMaterial:M,MeshBasicMaterial:M,SpriteMaterial:M,PointsMaterial:M,LineBasicMaterial:M,DoubleSide:2,FrontSide:0,BackSide:1,RepeatWrapping:1000,AdditiveBlending:2};
const colour={setRGB(){return this},copy(){return this}};
const texture=()=>({dispose(){disposed++},offset:{set(){}},repeat:{set(){}},clone(){return texture()}});
function mountain({stored={}}={}){
  const store=new Map(Object.entries(stored)),storage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
  const context={window:{},Math,JSON,Set,Map,Float32Array,Object,String,parseInt,location:{search:''}};vm.runInNewContext(source,context);
  const scene=new O();scene.background=colour;scene.fog={color:colour,density:0};
  const interactables=[],notices=[],player={pos:new V(),radius:.42,yaw:0},tracked=[],hall=[],seats=[];
  const look=new V(0,0,-1),camera={position:new V(),rotation:rotation(),updateMatrixWorld(){},getWorldDirection:v=>v.copy(look)};
  const findBook=id=>({id,title:'Book '+id,author:'A'});
  const m=context.window.createMountain({THREE,scene,MAT:{},player,camera,interactables,canvasTexture:()=>texture(),bookMaterial:()=>new M({}),findBook,
    arrivals:{valley:byRoom('mountain-valley'),path:byRoom('mountain-path'),spectre:byRoom('mountain-spectre')},storage,
    showNotice:t=>notices.push(t),playSample:()=>{},sound:()=>{},analytics:{track:(n,p)=>tracked.push([n,p])},
    move:(x,z,yaw)=>{player.pos.set(x,0,z);player.yaw=yaw},moveTo:(x,y,z,yaw)=>{player.pos.set(x,y,z);player.yaw=yaw;camera.position.set(x,y+1.72,z)},
    toHall:spot=>{hall.push(spot);player.pos.set(spot.x,0,spot.z)},registerSeat:(parts,group,eye,yaw,info)=>{const data={type:'seat',...info};seats.push(data);for(const p of parts){p.userData=data;interactables.push(p)}return data}});
  return {m,scene,interactables,notices,player,tracked,store,hall,camera,look,seats};
}
// A part's place in the world (the groups here are never turned far enough for it to matter at this scale).
const world=o=>{const p={x:0,z:0};for(let q=o;q;q=q.parent){p.x+=q.position.x;p.z+=q.position.z}return p};
const find=(a,type,key)=>a.interactables.find(o=>o.userData.type===type&&(!key||o.userData.key===key));

test('the mountain loads before the game and is wired in like the other rooms',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);
  assert(order.indexOf('mountain.js')>=0&&order.indexOf('mountain.js')<order.indexOf('game.js'));
  assert.match(game,/const mountain=window\.createMountain\?\.\(/);
  assert.match(game,/arrivals:\{valley:arrivalIds\('mountain-valley'\),path:arrivalIds\('mountain-path'\),spectre:arrivalIds\('mountain-spectre'\)\}/);
  assert.match(game,/mountain:mountain&&\(\(\)=>mountain\.enter\(\)\)/);assert.match(game,/mountain:'mountain',peak:'mountain'/);
  assert.match(game,/const peak=mountain\?\.zoneAt\(x,z\);if\(peak\)return peak;/);
  assert.match(game,/\['mountain','The meadow below the mountain'\],\['mountain-heights','The mountain path'\],\['mountain-summit','The summit'\]/);
  assert.match(game,/gameActive=function\(\)\{return !mountain\.travelling&&preMountainActive\(\)\}/);assert.match(game,/mountain\.update\(t,dt\)/);
  const ambience=fs.readFileSync('room-ambience.js','utf8');
  for(const id of ['mountain','mountain-heights','mountain-summit'])assert.match(ambience,new RegExp(`'?${id}'?:\\{beds:\\[\\['wind',`));
  const pages=fs.readFileSync('scripts/book-pages.mjs','utf8'),resolver=fs.readFileSync('scripts/new-books.mjs','utf8');
  for(const key of ['mountain-valley','mountain-path','mountain-spectre']){assert.match(resolver,new RegExp(`'${key}'`));assert.match(pages,new RegExp(`'${key}':'The Mountain in the Painting'`))}
  assert.match(pages,/'The Mountain in the Painting':'mountain'/);assert.match(pages,/idsIn\('mountain\.js',\/const OWN=/);
  // No light of its own.
  assert.doesNotMatch(source,/new THREE\.(Point|Spot|Directional|Hemisphere|RectArea)Light/);
});

test('its books each have a note of three sentences, and a place on the mountain',()=>{
  const shelf=arrivals.filter(e=>/^mountain-/.test(e[4]));assert(shelf.length>=20);
  for(const [id,title,,,,note] of shelf){
    assert(Number.isInteger(id),`${title} has its number`);
    assert.equal(note.split(/(?<=[a-z0-9”’)I][.!?])\s+(?=[A-ZÁÉÍÓÚŒ“])/).length,3,`${title}: three sentences`);
  }
  assert.equal(new Set(shelf.map(e=>e[0])).size,shelf.length,'each once');
  const {m}=mountain(),atCairns=m.stations.flatMap(s=>s.ids);
  assert.equal(new Set(atCairns).size,atCairns.length,'each book at one cairn');
  for(const id of [...byRoom('mountain-path'),...m.own])assert(atCairns.includes(id),`book ${id} has a cairn`);
  for(const id of atCairns)assert(byRoom('mountain-path').includes(id)||m.own.includes(id),`the cairns hold only the path’s books (${id})`);
  // The library's own copies are not listed again among the new books.
  for(const id of m.own)assert(!arrivals.some(e=>e[0]===id&&/^mountain-/.test(e[4])),`${id} is the library's own, not listed again`);
  assert.equal(JSON.stringify(byRoom('mountain-spectre')),'[29090]','Coleridge alone waits on the summit');
  // The cairns go up in the order of their climbs, but for Whymper's, by the rope.
  const years=m.stations.slice(0,-1).map(s=>s.year);assert.equal(JSON.stringify(years),JSON.stringify([...years].sort((a,b)=>a-b)));assert.equal(m.stations.at(-1).ids[0],41234);
  for(let i=1;i<m.stations.length;i++)assert(m.stations[i].f>m.stations[i-1].f);
});

test('every quotation is in its book',()=>{
  const {m}=mountain();
  const checks=[['rope',41234],['pine',10012],['spectre',29090]];
  for(const [key,id] of checks){const book=letters(text(id)),quotes=[...m.quotes[key].matchAll(/“([^”]+)”/g)].map(q=>q[1]);assert(quotes.length,key);
    for(const quote of quotes)for(const line of quote.split(' / '))assert(book.includes(letters(line)),`${key}: “${line}” is in book ${id}`)}
});

test('the path climbs gently all the way, and never comes near itself',()=>{
  const {m}=mountain(),pts=m.path.pts;
  assert.equal(pts[0].y,0,'it starts in the meadow');assert(pts.at(-1).y>44,'and ends on the summit');assert(m.path.length>180&&m.path.length<280,'a climb of a few minutes');
  for(let i=1;i<pts.length;i++){const run=Math.hypot(pts[i].x-pts[i-1].x,pts[i].z-pts[i-1].z),rise=Math.abs(pts[i].y-pts[i-1].y);assert(rise<=run*.25+.02,`a gentle grade at ${pts[i].s.toFixed(1)} m`)}
  for(let i=0;i<pts.length;i+=4)for(let j=i+60;j<pts.length;j+=4)assert(Math.hypot(pts[i].x-pts[j].x,pts[i].z-pts[j].z)>4.5,'the turns of the path stay apart');
  // The floor on the path is the path's own height: no steps, no drops.
  const {x:cx,z:cz}=m.centre;for(let i=0;i<pts.length;i+=3)assert(Math.abs(m.groundAt(cx+pts[i].x,cz+pts[i].z)-pts[i].y)<.05,'the floor follows the path');
});

test('the mountain stands far from everything, and every book on it can be walked to',()=>{
  const {m}=mountain(),{x:cx,z:cz}=m.centre;
  for(const [ox,oz,r] of [[800,400,62],[900,-100,32],[1000,200,20],[620,120,34],[500,220,10],[700,-420,30],[1200,-600,40],[1260,-620,30]])assert(Math.hypot(cx-ox,cz-oz)>r+130,`well clear of ${ox}, ${oz}`);
  const a=mountain();a.m.enter();assert(a.m.built);assert(a.m.counts.pines>100&&a.m.counts.rocks>200&&a.m.counts.crags>30,'pines, boulders and crags');
  const {x,z}=a.player.pos;assert(a.m.contains(x,z)&&a.m.allowed(x,z),'the reader arrives on open ground');assert.equal(a.m.zoneAt(x,z),'mountain');
  const step=.5,key=(x,z)=>`${Math.round(x/step)},${Math.round(z/step)}`,seen=new Set([key(x,z)]),queue=[[x,z]],reached=[];
  while(queue.length){const [px,pz]=queue.shift();reached.push([px,pz]);for(const [dx,dz] of [[step,0],[-step,0],[0,step],[0,-step]]){const nx=px+dx,nz=pz+dz,k=key(nx,nz);if(seen.has(k)||!a.m.allowed(nx,nz))continue;seen.add(k);queue.push([nx,nz])}}
  const near=(p,d)=>reached.some(([px,pz])=>Math.hypot(px-p.x,pz-p.z)<d);
  assert.equal(a.m.books.length,byRoom('mountain-valley').length+byRoom('mountain-path').length+a.m.own.length,'every book is on the mountain (Coleridge waits for the shadow)');
  for(const b of a.m.books)assert(near(b.position,2.2),`${b.userData.book.id} can be reached`);
  assert(reached.some(([px,pz])=>a.m.zoneAt(px,pz)==='mountain-summit'),'the summit can be reached');
  for(const type of ['mountain-rope','mountain-register','mountain-exit'])assert(near(world(find(a,type)),3),`${type} can be reached`);
  // The hut can be walked into, as far as the shelf at its back.
  const hut={x:cx+a.m.hut.x,z:cz+a.m.hut.z};assert(near(hut,.5),'the reader can step inside the hut');
  for(const b of a.m.books.filter(b=>b.userData.shelf==='valley'))assert(near(b.position,1.3),`the hut’s book ${b.userData.book.id} is within reach from inside`);
  // The path is walkable across its whole drawn width, not only down its middle.
  const pts=a.m.path.pts;for(let i=20;i<pts.length-20;i+=25){const p=pts[i],q=pts[i+1],l=Math.hypot(q.x-p.x,q.z-p.z),nx=-(q.z-p.z)/l,nz=(q.x-p.x)/l;
    for(const side of [-1.3,1.3])assert(a.m.allowed(cx+p.x+nx*side,cz+p.z+nz*side),`1.3 m off the middle of the path at ${p.s.toFixed(0)} m`)}
  // The signpost's arms point where they say.
  const post={x:cx+2.2,z:cz+53.2},to={'THE SUMMIT':{x:cx+pts[Math.round(.03*(pts.length-1))].x,z:cz+pts[Math.round(.03*(pts.length-1))].z},'THE HUT':hut,'THE PAINTING':a.m.frame};
  assert.equal(a.m.signs.length,3);
  for(const sign of a.m.signs){const t=to[sign.text],dx=t.x-post.x,dz=t.z-post.z,l=Math.hypot(dx,dz);assert(sign.x*dx/l+sign.z*dz/l>.98,`${sign.text} points the right way`)}
  assert.equal(a.seats.length,1);assert(near(world(find(a,'seat')),2),'the bench by the hut is a seat, and can be sat on');
});

test('in through the painting, up, round, down the rope, and out again',()=>{
  const a=mountain();assert.equal(a.m.built,false);
  const painting=find(a,'mountain-painting');assert(painting,'the painting hangs in the Grand Hall at startup');
  const p=a.m.hallPainting;assert(p.z<-29.8&&p.x-p.w/2-.18>-9&&p.x+p.w/2+.18<-6.5,'on the pier between the fireplace and the window');
  a.m.interact(painting);assert(a.m.built);assert(a.m.contains(a.player.pos.x,a.player.pos.z));assert.match(a.notices.at(-1),/step up into the frame/);
  assert.deepEqual(JSON.stringify(a.tracked.at(-1)),JSON.stringify(['Room Explored',{room:'mountain'}]));
  for(const [type,key] of [['mountain-card','signpost'],['mountain-card','hut'],['mountain-card','pine'],['mountain-card','cairn'],['mountain-card','summit'],['mountain-card','cloud'],['mountain-rope'],['mountain-register'],['mountain-exit']])assert(find(a,type,key),`${type} ${key||''}`);
  // A book found on the path is counted, once.
  const first=a.m.books.find(b=>b.userData.shelf==='path').userData.book.id,total=a.m.books.length;
  assert.equal(a.m.noteFound(first),`Found on the mountain: 1 of ${total}.`);assert.equal(a.m.noteFound(first),null);assert.deepEqual(JSON.parse(a.store.get('athenaeum-mountain-found')),[first]);
  // Signing the register at the top.
  a.m.interact(find(a,'mountain-register'));assert.match(a.notices.at(-1),/first time at the top/);a.m.interact(find(a,'mountain-register'));assert.match(a.notices.at(-1),/2nd time/);
  // On the summit, looking down at the cloud away from the moon, the shadow appears, and Coleridge is on the cairn.
  const {x:cx,z:cz}=a.m.centre,top=a.m.groundAt(cx,cz-1.5);a.player.pos.set(cx,top,cz-1.5);a.camera.position.set(cx,top+1.72,cz-1.5);
  assert.equal(a.m.zoneAt(cx,cz-1.5),'mountain-summit');
  const d=a.m.moonDir;a.look.set(-d.x,-d.y,-d.z);a.m.update(1,.5);a.m.update(1.6,.5);a.m.update(2.2,.5);
  assert(a.m.spectreSeen,'the shadow on the cloud is seen');assert.equal(a.store.get('athenaeum-mountain-spectre'),'1');
  assert.match(a.notices.at(-1),/spectre of the Brocken/);assert.deepEqual(JSON.stringify(a.tracked.at(-1)),JSON.stringify(['Secret Found',{secret:'mountain-spectre'}]));
  assert(a.m.books.some(b=>b.userData.book.id===29090),'Coleridge lies on the cairn');
  // Found for good: on the next visit Coleridge is there from the start.
  const b=mountain({stored:{'athenaeum-mountain-spectre':'1'}});b.m.enter();assert(b.m.books.some(m=>m.userData.book.id===29090));
  // Down the rope: the reader is carried, not walking, down through the cloud, and set down in the Grand Hall in front of
  // the painting, facing it.
  a.m.interact(find(a,'mountain-rope'));assert(a.m.travelling);let lowest=1e9;for(let t=3;t<14&&a.m.travelling;t+=.5){a.m.update(t,.5);lowest=Math.min(lowest,a.camera.position.y)}
  assert(lowest<30,'it goes down into the cloud');
  assert.equal(a.m.travelling,false);assert.equal(a.hall.length,1);const landing=a.hall[0],frame=a.m.hallPainting;
  assert(Math.abs(landing.x-frame.x)<.3&&landing.z>frame.z&&landing.z-frame.z<4,'in front of the painting');assert.equal(landing.yaw,0,'facing it');
  assert.match(a.notices.at(-1),/in front of the painting/);a.m.enter();
  // And R mid-abseil lands at once.
  a.m.interact(find(a,'mountain-rope'));a.m.update(15,.1);a.m.reset();assert.equal(a.m.travelling,false);
  // Out through the frame, and freed a while after the reader has gone, with all its parts.
  assert.equal(a.hall.length,2,'R mid-abseil lands in the hall too');const before=a.hall.length;a.m.interact(find(a,'mountain-exit'));assert.equal(a.hall.length,before+1);assert(!a.m.contains(a.player.pos.x,a.player.pos.z),'back in the Grand Hall');
  a.m.update(20,.016);assert(a.m.built);a.m.update(60,.016);assert.equal(a.m.built,false);
  assert(!a.interactables.some(o=>/^mountain-(card|exit|rope|register)$/.test(o.userData.type)),'its parts go with it');assert(find(a,'mountain-painting'),'but the painting stays');
});
