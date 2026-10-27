const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const zlib=require('node:zlib');

const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8'),source=fs.readFileSync('forest.js','utf8');
const arrivals=(()=>{const c={window:{}};vm.runInNewContext(fs.readFileSync('data/new-books.js','utf8'),c);return c.window.ATHENAEUM_NEW_BOOKS})();
const byRoom=room=>arrivals.filter(e=>e[4]===room).map(e=>e[0]);

// Just enough of three.js for the wood to build itself without drawing anything.
class V{constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}set(x,y,z){Object.assign(this,{x,y,z});return this}setScalar(s){return this.set(s,s,s)}clone(){return new V(this.x,this.y,this.z)}copy(v){return this.set(v.x,v.y,v.z)}
  applyMatrix4(){return this}lerp(v,t){return this.set(this.x+(v.x-this.x)*t,this.y+(v.y-this.y)*t,this.z+(v.z-this.z)*t)}}
class Matrix4{compose(){return this}makeRotationY(){return this}multiply(){return this}}
class O{constructor(){this.children=[];this.parent=null;this.visible=true;this.position=new V();this.scale=new V(1,1,1);this.rotation={x:0,y:0,z:0,order:'XYZ',set(x,y,z){Object.assign(this,{x,y,z})}};this.quaternion={clone:()=>({})};this.userData={};this.matrix=new Matrix4();this.matrixWorld=new Matrix4()}
  add(...m){for(const c of m){c.parent=this;this.children.push(c)}return this}removeFromParent(){if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1);this.parent=null}traverse(fn){fn(this);for(const c of this.children)c.traverse(fn)}
  updateMatrix(){}updateMatrixWorld(){}lookAt(){}}
class Mesh extends O{constructor(g,m){super();this.geometry=g;this.material=m}}
class InstancedMesh extends Mesh{constructor(g,m,n){super(g,m);this.count=n;this.instanceMatrix={needsUpdate:false,setUsage(){}}}setMatrixAt(){}computeBoundingSphere(){}}
class Sprite extends O{constructor(m){super();this.material=m}}
let disposed=0;
const attribute={count:0,getX:()=>0,getY:()=>0,getZ:()=>0};
class G{constructor(){this.index=null;this.attributes={position:attribute,normal:attribute}}toNonIndexed(){return this}applyMatrix4(){return this}computeVertexNormals(){}setAttribute(){}rotateX(){return this}dispose(){disposed++}}
const M=class{constructor(p){Object.assign(this,p)}dispose(){disposed++}};
const THREE={Group:O,Object3D:O,Mesh,InstancedMesh,Sprite,Vector3:V,Matrix4,Quaternion:class{setFromEuler(){return this}},Euler:class{},Color:class{setHex(){return this}},
  BufferGeometry:G,Float32BufferAttribute:class{},BoxGeometry:G,CylinderGeometry:G,PlaneGeometry:G,SphereGeometry:G,CircleGeometry:G,ConeGeometry:G,IcosahedronGeometry:G,DodecahedronGeometry:G,TorusGeometry:G,CapsuleGeometry:G,
  MeshStandardMaterial:M,MeshBasicMaterial:M,SpriteMaterial:M,DoubleSide:2,RepeatWrapping:1000,AdditiveBlending:2};
const colour={setRGB(){return this},copy(){return this}};
function wood({stored=null}={}){
  const store=new Map(stored?[['athenaeum-forest-found',JSON.stringify(stored)]]:[]),storage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
  const context={window:{},Math,JSON,Set,location:{search:''}};vm.runInNewContext(source,context);
  const scene=new O();scene.background=colour;scene.fog={color:colour,density:0};
  const interactables=[],notices=[],player={pos:new V(),radius:.42},tracked=[],garden=[];
  const f=context.window.createForest({THREE,scene,MAT:{},player,interactables,canvasTexture:()=>({dispose(){disposed++},offset:{set(){}},repeat:{set(){}}}),bookMaterial:()=>new M({}),
    findBook:id=>({id,title:'Book '+id,author:'A'}),arrivals:{tales:byRoom('forest-tales'),eerie:byRoom('forest-eerie')},storage,
    showNotice:t=>notices.push(t),playSample:()=>{},sound:()=>{},move:(x,z)=>player.pos.set(x,0,z),analytics:{track:(n,p)=>tracked.push([n,p])},
    toGarden:spot=>{garden.push(spot);player.pos.set(spot.x,0,spot.z)},garden:{cx:145,cz:46,w:20,d:16}});
  return {f,scene,interactables,notices,player,tracked,store,garden};
}
const find=(a,type)=>a.interactables.find(o=>o.userData.type===type);

test('the Deep Wood loads before the game and is wired in like the other rooms',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);
  assert(order.indexOf('forest.js')>=0&&order.indexOf('forest.js')<order.indexOf('game.js'));
  assert.match(game,/const forest=window\.createForest\?\.\(/);assert.match(game,/arrivals:\{tales:arrivalIds\('forest-tales'\),eerie:arrivalIds\('forest-eerie'\)\}/);
  assert.match(game,/garden:themeZones\.find\(room=>room\.key==='garden'\)/);
  assert.match(game,/forest:'forest',/);assert.match(game,/grimm:'forest'/);assert.match(game,/forest:forest&&\(\(\)=>forest\.enter\(\)\)/);
  assert.match(game,/if\(forest\?\.contains\(x,z\)\)return 'forest'/);assert.match(game,/\['forest','The Deep Wood'\]/);assert.match(game,/forest\?\.update\(t,dt\)/);
  // The window is hung whenever the Garden Room is built, and the Grimm alone offers its woodcut in the reader.
  assert.match(game,/if\(destination==='garden'\)forest\.hangGardenWindow\(\)/);assert.match(game,/if\(themeRoomsBuilt\.has\('garden'\)\)forest\.hangGardenWindow\(\)/);
  assert.match(game,/intoWood\.classList\.toggle\('hidden',book\?\.id!==2591\)/);assert.match(game,/forest\.enter\('grimm'\)/);
  assert.match(fs.readFileSync('room-ambience.js','utf8'),/forest:\{beds:\[\['wind',/);
  const pages=fs.readFileSync('scripts/book-pages.mjs','utf8'),resolver=fs.readFileSync('scripts/new-books.mjs','utf8');
  for(const key of ['forest-tales','forest-eerie']){assert.match(resolver,new RegExp(`'${key}'`));assert.match(pages,new RegExp(`'${key}':'The Deep Wood'`))}
  assert.match(pages,/'The Deep Wood':'forest'/);
  // No light of its own.
  assert.doesNotMatch(source,/new THREE\.(Point|Spot|Directional|Hemisphere|RectArea)Light/);
});

test('its books each have a note of three sentences and a place to be found',()=>{
  const forest=arrivals.filter(e=>/^forest-/.test(e[4]));assert(forest.length>=16);
  for(const [id,title,,,,note] of forest){
    assert(Number.isInteger(id),`${title} has its number`);
    assert.equal(note.split(/(?<=[a-z0-9”’)I][.!?])\s+(?=[A-ZÁÉÍÓÚŒ“])/).length,3,`${title}: three sentences`);
  }
  assert.equal(new Set(forest.map(e=>e[0])).size,forest.length,'each once');
  const {f}=wood();for(const id of byRoom('forest-tales'))assert(f.places[id]&&f.spots[f.places[id]],`book ${id} has a place in the wood`);
  assert(byRoom('forest-eerie').length>=6&&byRoom('forest-eerie').length<=9,'the old oak’s roots hold the eerie shelf');
});

test('every quotation from the Grimms is in the library’s own Grimm',()=>{
  const text=zlib.gunzipSync(fs.readFileSync('texts/bundled-gzip/pg2591.txt.gz')).toString('utf8'),letters=s=>s.toLowerCase().replace(/[^a-z]/g,'');const book=letters(text);
  const {f}=wood();let checked=0;
  for(const [key,line] of Object.entries(f.quotes))for(const [,quote] of line.matchAll(/“([^”]+)”/g)){
    if(/Hansel and Gretel|Rapunzel|Frog-Prince|Red-Cap|Briar Rose/.test(line)||key==='braid'){assert(book.includes(letters(quote)),`${key}: “${quote}”`);checked++}}
  assert(checked>=8,'the tales are quoted, not paraphrased');
});

test('the wood stands far from everything, and every place in it can be walked to from the window',()=>{
  const {f}=wood(),{x:cx,z:cz}=f.centre;
  for(const [ox,oz,r] of [[620,120,34],[500,220,10],[500,60,12],[700,-180,12],[340,30,20],[500,-160,10]])assert(Math.hypot(cx-ox,cz-oz)>r+f.walk+60,`well clear of ${ox}, ${oz}`);
  for(const s of Object.values(f.spots))assert(Math.hypot(s.x,s.z)+2<f.walk,'every clearing is inside the walkable wood');
  const a=wood();a.f.enter();assert(a.f.built);assert(a.f.trees.firs>200&&a.f.trees.bare>40,'a real wood');
  const {x,z}=a.player.pos;assert(a.f.contains(x,z)&&a.f.allowed(x,z),'the reader arrives on open ground');
  // Walk the wood on a half-metre grid from the arrival, and reach a spot beside every book.
  const step=.5,key=(x,z)=>`${Math.round(x/step)},${Math.round(z/step)}`,seen=new Set([key(x,z)]),queue=[[x,z]],reached=[];
  while(queue.length){const [px,pz]=queue.shift();reached.push([px,pz]);for(const [dx,dz] of [[step,0],[-step,0],[0,step],[0,-step]]){const nx=px+dx,nz=pz+dz,k=key(nx,nz);if(seen.has(k)||!a.f.allowed(nx,nz))continue;seen.add(k);queue.push([nx,nz])}}
  assert.equal(a.f.books.length,byRoom('forest-tales').length+byRoom('forest-eerie').length,'every book is in the wood');
  for(const b of a.f.books)assert(reached.some(([px,pz])=>Math.hypot(px-b.position.x,pz-b.position.z)<2.2),`${b.userData.book.id} can be reached`);
  const exit=find(a,'forest-exit');assert(reached.some(([px,pz])=>Math.hypot(px-a.f.centre.x-a.f.spots.window.x,pz-a.f.centre.z-a.f.spots.window.z)<2.5),'and the window home');void exit;
});

test('in through the Garden Room’s window, out again, and the books found are remembered',()=>{
  const a=wood();assert.equal(a.f.built,false);
  a.f.hangGardenWindow();const window=find(a,'forest-window');assert(window,'the window hangs in the Garden Room');
  assert(Math.abs(a.f.gardenWindow.x-(145-10))<.4&&a.f.gardenWindow.yaw===Math.PI/2,'on its west wall, facing in');
  assert(a.f.gardenSpot.x>135.5&&a.f.gardenSpot.x<155&&Math.abs(a.f.gardenSpot.z-46)<1,'and the reader comes back inside the room');
  a.f.interact(window);assert(a.f.built);assert(a.f.contains(a.player.pos.x,a.player.pos.z));assert.match(a.notices.at(-1),/climb out over the sill/);
  assert.deepEqual(JSON.stringify(a.tracked.at(-1)),JSON.stringify(['Room Explored',{room:'forest'}]));
  for(const type of ['forest-card','forest-exit'])assert(find(a,type),type);
  assert(a.interactables.some(o=>o.userData.key==='pebbles')&&a.interactables.some(o=>o.userData.key==='crumbs'),'the pebbles home, and the crumbs to nowhere');
  const total=a.f.books.length,first=a.f.books[0].userData.book.id;assert.equal(a.f.noteFound(first),`Found in the wood: 1 of ${total}.`);assert.equal(a.f.noteFound(first),null,'counted once');
  assert.deepEqual(JSON.parse(a.store.get('athenaeum-forest-found')),[first]);
  const b=wood({stored:a.f.books.slice(1).map(m=>m.userData.book.id)});b.f.enter();assert.match(b.f.noteFound(first),new RegExp(`all ${total}`));assert.deepEqual(JSON.stringify(b.tracked.at(-1)),JSON.stringify(['Secret Found',{secret:'forest-every-book'}]));
  a.f.interact(find(a,'forest-exit'));assert.equal(a.garden.length,1);assert(!a.f.contains(a.player.pos.x,a.player.pos.z),'back in the Garden Room');
  // Freed a while after the reader has gone, with all its parts.
  a.f.update(10,.016);assert(a.f.built);a.f.update(40,.016);assert.equal(a.f.built,false);
  assert(!a.interactables.some(o=>/^forest-(card|exit)$/.test(o.userData.type)),'its parts go with it');assert(find(a,'forest-window'),'but the Garden Room’s window stays');
});
