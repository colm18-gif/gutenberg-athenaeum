const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const zlib=require('node:zlib');

// The polonyna (carpathians.js): the high pasture of Kotsiubynsky's Shadows of Forgotten Ancestors, reached by the
// trembita in the Ukrainian Reading Room.
const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8'),source=fs.readFileSync('carpathians.js','utf8'),wing=fs.readFileSync('international-wing.js','utf8');

// Just enough of three.js for the forest to build itself without drawing anything.
class V{constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}set(x,y,z){Object.assign(this,{x,y,z});return this}setScalar(s){return this.set(s,s,s)}clone(){return new V(this.x,this.y,this.z)}copy(v){return this.set(v.x,v.y,v.z)}
  applyMatrix4(){return this}lerp(v,t){return this.set(this.x+(v.x-this.x)*t,this.y+(v.y-this.y)*t,this.z+(v.z-this.z)*t)}}
class Matrix4{compose(){return this}makeRotationY(){return this}multiply(){return this}}
class O{constructor(){this.children=[];this.parent=null;this.visible=true;this.position=new V();this.scale=new V(1,1,1);this.rotation={x:0,y:0,z:0,order:'XYZ',set(x,y,z){Object.assign(this,{x,y,z})}};this.quaternion={clone:()=>({})};this.userData={};this.matrix=new Matrix4();this.matrixWorld=new Matrix4()}
  add(...m){for(const c of m){c.parent=this;this.children.push(c)}return this}removeFromParent(){if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1);this.parent=null}traverse(fn){fn(this);for(const c of this.children)c.traverse(fn)}
  updateMatrix(){}updateMatrixWorld(){}lookAt(){}}
class Mesh extends O{constructor(g,m){super();this.geometry=g;this.material=m}}
class InstancedMesh extends Mesh{constructor(g,m,n){super(g,m);this.count=n;this.instanceMatrix={needsUpdate:false,setUsage(){}}}setMatrixAt(){}computeBoundingSphere(){}}
class Sprite extends O{constructor(m){super();this.material=m}}
class Points extends O{constructor(g,m){super();this.geometry=g;this.material=m}}
const attribute={count:0,getX:()=>0,getY:()=>0,getZ:()=>0};
class G{constructor(){this.index=null;this.attributes={position:attribute,normal:attribute}}toNonIndexed(){return this}clone(){return new G()}applyMatrix4(){return this}computeVertexNormals(){}setAttribute(k,v){this.attributes[k]=v}rotateX(){return this}scale(){return this}dispose(){}}
const M=class{constructor(p){Object.assign(this,p);this.color={setRGB(){return this}};if(this.opacity===undefined)this.opacity=1}dispose(){}};
const THREE={Group:O,Object3D:O,Mesh,InstancedMesh,Sprite,Points,Vector3:V,Matrix4,Quaternion:class{setFromEuler(){return this}},Euler:class{},Color:class{setHex(){return this}setRGB(r,g,b){Object.assign(this,{r,g,b});return this}},
  BufferGeometry:G,Float32BufferAttribute:class{},BufferAttribute:class{constructor(a){this.array=a;this.needsUpdate=false}},BoxGeometry:G,CylinderGeometry:G,PlaneGeometry:G,TorusGeometry:G,SphereGeometry:G,CircleGeometry:G,ConeGeometry:G,
  IcosahedronGeometry:G,DodecahedronGeometry:G,MeshStandardMaterial:M,MeshBasicMaterial:M,SpriteMaterial:M,PointsMaterial:M,DoubleSide:2,RepeatWrapping:1000,AdditiveBlending:2};
const colour={setRGB(){return this},copy(){return this}};
function polonyna({stored=null,book=true,search=''}={}){
  const store=new Map(stored?[['athenaeum-carpathians-goats','1']]:[]),storage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
  const context={window:{},Math,JSON,Set,Float32Array,location:{search:''}};vm.runInNewContext(source,context);
  const scene=new O();scene.background=colour;scene.fog={color:colour,density:0};
  const interactables=[],notices=[],player={pos:new V(),radius:.42},tracked=[],home=[],notes=[],seats=[];
  const titles={988269:'Тіні забутих предків',958034:'Верховина'};
  const f=context.window.createCarpathians({THREE,scene,MAT:{},player,interactables,canvasTexture:()=>({dispose(){},offset:{set(){}},repeat:{set(){}}}),bookMaterial:()=>new M({}),
    findBook:id=>book&&titles[id]?{id,title:titles[id],author:''}:null,storage,search:()=>search,tone:(...a)=>notes.push(a),
    registerSeat:(parts,group,eye,yaw,data)=>{for(const p of parts){p.userData={type:'seat',...data};interactables.push(p)}seats.push(data)},
    showNotice:t=>notices.push(t),playSample:()=>{},move:(x,z)=>player.pos.set(x,0,z),analytics:{track:(n,p)=>tracked.push([n,p])},
    toRoom:()=>{home.push(1);player.pos.set(-530,0,106)}});
  return {f,scene,interactables,notices,player,tracked,store,home,notes,seats};
}
const find=(a,type)=>a.interactables.find(o=>o.userData.type===type);
const run=(a,from,to,dt=.1)=>{for(let t=from;t<=to+1e-9;t+=dt)a.f.update(t,dt)};

test('the polonyna loads before the game and is wired in like the Forest Song',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);
  assert(order.indexOf('carpathians.js')>=0&&order.indexOf('carpathians.js')<order.indexOf('game.js'));
  assert.match(game,/const carpathians=window\.createCarpathians\?\.\(/);assert.match(game,/carpathians\.update\(t,dt\)/);
  assert.match(game,/polonyna:'carpathians'/);assert.match(game,/carpathians:carpathians&&\(\(\)=>wingBooks\.load\(\)\.then\(\(\)=>carpathians\.enter\(\)\)\)/);
  assert.match(game,/if\(carpathians\?\.contains\(x,z\)\)return 'carpathians'/);assert.match(game,/\['carpathians','The polonyna under Chornohora'\]/);
  assert.match(game,/carpathians:carpathians&&\(\(\)=>carpathians\.enter\('trembita'\)\)/,'the trembita in the reading room leads there');
  assert.match(game,/intoPolonyna\.classList\.toggle\('hidden',book\?\.id!==carpathians\.book\)/,'and so does the story itself, in the reader');
  assert.match(game,/voice==='trembita'\?1150/,'the synthesiser has a trembita');
  assert.match(html,/\|carpathians\|karpaty\|polonyna\|/,'a link there loads the wing’s books first');
  assert.match(fs.readFileSync('room-ambience.js','utf8'),/carpathians:\{beds:/);
  assert.match(wing,/type:'intl-trembita'/);assert.match(wing,/if\(data\.type==='intl-trembita'\)\{if\(carpathians\)/);
});

test('every quotation is in the library’s own text of the story',()=>{
  const text=zlib.gunzipSync(fs.readFileSync('texts/bundled-gzip/pg988269.txt.gz')).toString('utf8'),letters=s=>s.toLowerCase().replace(/[^а-яіїєґ]/g,'');const story=letters(text);
  const {f}=polonyna();let checked=0;
  for(const [key,line] of Object.entries(f.quotes))for(const [,quote] of line.matchAll(/«([^»]+)»/g)){assert(story.includes(letters(quote)),`${key}: «${quote}»`);checked++}
  assert(checked>=20,'the story is quoted, not paraphrased');
  const card=wing.slice(wing.indexOf("type:'intl-trembita'"),wing.indexOf("action:'BLOW'"));assert.match(card,/Коцюбинського \(1911\)/);
  assert.equal(f.book,988269);
});

test('the polonyna stands far from everything, and everything on it can be walked to from the door',()=>{
  const {f}=polonyna(),{x:cx,z:cz}=f.centre;
  for(const [ox,oz,r] of [[600,900,62],[800,400,62],[1100,700,140],[-760,700,40],[-760,880,40],[500,-580,20],[-330,60,20]])assert(Math.hypot(cx-ox,cz-oz)>r+130,`well clear of ${ox}, ${oz}`);
  const a=polonyna();a.f.enter();assert(a.f.built);assert(a.f.spruces>300,'a real forest round it');assert(a.f.sheep>=40,'and a flock');
  const {x,z}=a.player.pos;assert(a.f.contains(x,z)&&a.f.allowed(x,z),'the reader arrives on open ground');assert.equal(a.f.zoneAt(x,z),'carpathians');
  const s=f.spots.staia;assert(!a.f.allowed(cx+s.x,cz+s.z-f.staia.d/2),'the hut’s walls stand');assert(!a.f.allowed(cx+f.spots.pen.x,cz+f.spots.pen.z),'nobody walks among the sheep');
  const step=.25,key=(x,z)=>`${Math.round(x/step)},${Math.round(z/step)}`,seen=new Set([key(x,z)]),queue=[[x,z]],reached=[];
  while(queue.length){const [px,pz]=queue.shift();reached.push([px,pz]);for(const [dx,dz] of [[step,0],[-step,0],[0,step],[0,-step]]){const nx=px+dx,nz=pz+dz,k=key(nx,nz);if(seen.has(k)||!a.f.allowed(nx,nz))continue;seen.add(k);queue.push([nx,nz])}}
  const near=(wx,wz,d)=>reached.some(([px,pz])=>Math.hypot(px-wx,pz-wz)<d);
  assert(near(cx+s.x,cz+s.z+.9,.5),'into the hut, by the fire');
  // A part's place in the world: its own position plus its group's (the parts here are never more than one group deep).
  const world=o=>({x:o.position.x+(o.parent?.position?.x||0),z:o.position.z+(o.parent?.position?.z||0)});
  for(const type of ['carp-trembita','carp-floyara','carp-exit']){const w=world(find(a,type));assert(near(w.x,w.z,2.2),`${type} can be reached`)}
  for(const b of a.f.books)assert(near(b.position.x,b.position.z,2.4),`${b.userData.book.title} can be reached`);
  assert.equal(a.f.books.length,1);assert(a.seats.length===2&&a.seats.every(d=>d.bookIds[0]===988269),'the bench in the hut and the lookout are seats that open the story');
});

test('the floyara brings the goats out of the roots and leaves Cheremshyna’s stories on the stone, once',()=>{
  const a=polonyna();a.f.enter('trembita');assert.match(a.notices.at(-1),/Полонина під Чорногорою/);
  assert.deepEqual(JSON.stringify(a.tracked.at(-1)),JSON.stringify(['Room Explored',{room:'carpathians'}]));
  assert(a.interactables.filter(o=>o.userData.type==='carp-floyara').length>=3,'the floyara, its glint and a wider target round them all answer');
  run(a,0,1);a.f.interact(find(a,'carp-floyara'));assert(a.notes.length>=19&&a.notes.every(n=>n[4]==='flute'),'it plays the shcheznyk’s tune');assert.match(a.notices.at(-1),/Нема моїх кіз/);
  run(a,1.1,3.5);assert(!a.f.goatsOut,'not yet: first the goats are lost');run(a,3.6,6);assert(a.f.goatsOut,'the goats are out');assert.match(a.notices.at(-1),/бородаті цапи/);
  assert.equal(a.f.books.length,1);run(a,8.1,20);assert(!a.f.goatsOut,'back into the roots');assert.equal(a.f.books.length,2,'and a book on the stone');
  assert.equal(a.f.books.at(-1).userData.book.title,'Верховина');assert.match(a.notices.at(-1),/Так знайшов він у лісі те, чого шукав/);
  assert.equal(a.store.get('athenaeum-carpathians-goats'),'1');assert(a.tracked.some(([n,p])=>n==='Secret Found'&&p.secret==='carpathians-goats'));
  const b=polonyna({stored:true});b.f.enter();assert.equal(b.f.books.length,2,'found for good: the book is on the stone on the next visit');
  run(b,0,1);b.f.interact(find(b,'carp-floyara'));run(b,1.1,20);assert(!b.tracked.some(([n,p])=>p?.secret==='carpathians-goats'),'counted once');assert.match(b.notices.at(-1),/обернулись в коріння/);
  const c=polonyna({search:'?goats'});c.f.enter();assert.equal(c.f.books.length,2,'?goats shows it at once');
});

test('the trembita sounds, the white herdsman comes once a visit, and the carved door leads home',()=>{
  const a=polonyna();a.f.enter();run(a,0,1);
  a.f.interact(find(a,'carp-trembita'));assert(a.notes.length>=8&&a.notes.every(n=>n[4]==='trembita'));assert.match(a.notices.at(-1),/трубить побідно/);
  run(a,1.1,39);assert(!a.f.herdsmanSeen);run(a,39.1,43);assert(a.f.herdsmanSeen);assert(a.notices.some(n=>/вийшли з лісу олені/.test(n)));
  run(a,43.1,60,.5);assert.match(a.notices.at(-1),/хухнув на скло/);const count=a.notices.filter(n=>/олені/.test(n)).length;run(a,60.5,140,1);assert.equal(a.notices.filter(n=>/олені/.test(n)).length,count,'once a visit');
  assert(a.interactables.some(o=>o.userData.key==='mist')&&a.interactables.some(o=>o.userData.key==='sheep')&&a.interactables.some(o=>o.userData.key==='fence'),'the mist, the flock and the fence answer');
  a.f.interact(find(a,'carp-exit'));assert.equal(a.home.length,1);assert(!a.f.contains(a.player.pos.x,a.player.pos.z),'back in the reading room');
  run(a,141,160,1);assert(a.f.built);run(a,167,190,1);assert.equal(a.f.built,false,'freed once the reader has gone');
  assert(!a.interactables.some(o=>/^carp-/.test(o.userData.type||'')),'with all its parts');
});

test('without the wing’s books the polonyna still stands, with no book and no seat',()=>{
  const a=polonyna({book:false});a.f.enter();assert.equal(a.f.books.length,0);assert.equal(a.seats.length,0);assert(a.interactables.some(o=>o.userData.key==='book'),'the bench is still there');
});
