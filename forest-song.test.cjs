const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const zlib=require('node:zlib');

const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8'),source=fs.readFileSync('forest-song.js','utf8'),wing=fs.readFileSync('international-wing.js','utf8');

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
class G{constructor(){this.index=null;this.attributes={position:attribute,normal:attribute}}toNonIndexed(){return this}applyMatrix4(){return this}computeVertexNormals(){}setAttribute(k,v){this.attributes[k]=v}rotateX(){return this}scale(){return this}dispose(){}}
const M=class{constructor(p){Object.assign(this,p);this.color={setRGB(){return this}};if(this.opacity===undefined)this.opacity=1}dispose(){}};
const THREE={Group:O,Object3D:O,Mesh,InstancedMesh,Sprite,Points,Vector3:V,Matrix4,Quaternion:class{setFromEuler(){return this}},Euler:class{},Color:class{setHex(){return this}},
  BufferGeometry:G,Float32BufferAttribute:class{},BufferAttribute:class{constructor(a){this.array=a;this.needsUpdate=false}},BoxGeometry:G,CylinderGeometry:G,PlaneGeometry:G,SphereGeometry:G,CircleGeometry:G,ConeGeometry:G,
  IcosahedronGeometry:G,DodecahedronGeometry:G,MeshStandardMaterial:M,MeshBasicMaterial:M,SpriteMaterial:M,PointsMaterial:M,DoubleSide:2,RepeatWrapping:1000,AdditiveBlending:2};
const colour={setRGB(){return this},copy(){return this}};
function forest({stored=null,book=true}={}){
  const store=new Map(stored?[['athenaeum-forest-song-mavka','1']]:[]),storage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
  const context={window:{},Math,JSON,Set,Float32Array,location:{search:''}};vm.runInNewContext(source,context);
  const scene=new O();scene.background=colour;scene.fog={color:colour,density:0};
  const interactables=[],notices=[],player={pos:new V(),radius:.42},tracked=[],home=[],notes=[],seats=[];
  const f=context.window.createForestSong({THREE,scene,MAT:{},player,interactables,canvasTexture:()=>({dispose(){},offset:{set(){}},repeat:{set(){}}}),bookMaterial:()=>new M({}),
    findBook:id=>book?{id,title:'Лісова пісня',author:'Леся Українка'}:null,storage,tone:(...a)=>notes.push(a),registerSeat:(parts,group,eye,yaw,data)=>{for(const p of parts){p.userData={type:'seat',...data};interactables.push(p)}seats.push(data)},
    showNotice:t=>notices.push(t),playSample:()=>{},move:(x,z)=>player.pos.set(x,0,z),analytics:{track:(n,p)=>tracked.push([n,p])},
    toRoom:()=>{home.push(1);player.pos.set(-530,0,106)}});
  return {f,scene,interactables,notices,player,tracked,store,home,notes,seats};
}
const find=(a,type)=>a.interactables.find(o=>o.userData.type===type);
const run=(a,from,to,dt=.1)=>{for(let t=from;t<=to;t+=dt)a.f.update(t,dt)};

test('the Forest Song loads before the game and is wired in like the other places',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);
  assert(order.indexOf('forest-song.js')>=0&&order.indexOf('forest-song.js')<order.indexOf('game.js'));
  assert.match(game,/const forestSong=window\.createForestSong\?\.\(/);assert.match(game,/toRoom:\(\)=>enterWing\('ukrainian'\)/);
  assert.match(game,/'forest-song':'forest-song','lisova-pisnia':'forest-song'/);assert.match(game,/'forest-song':forestSong&&\(\(\)=>wingBooks\.load\(\)\.then\(\(\)=>forestSong\.enter\(\)\)\)/);
  assert.match(game,/if\(forestSong\?\.contains\(x,z\)\)return 'forest-song'/);assert.match(game,/\['forest-song','The Forest Song'\]/);assert.match(game,/forestSong\.update\(t,dt\)/);
  assert.match(game,/forestSong:forestSong&&\(\(\)=>forestSong\.enter\('sopilka'\)\)/,'the pipe on the reading room’s wall leads there');
  assert.match(game,/intoSong\.classList\.toggle\('hidden',book\?\.id!==forestSong\.book\)/,'and so does the play itself, in the reader');
  assert.match(html,/\|forest-song\|lisova-pisnia\|/,'a link there loads the wing’s books first');
  assert.match(fs.readFileSync('room-ambience.js','utf8'),/'forest-song':\{beds:/);
  assert.match(wing,/type:'intl-sopilka'/);assert.match(wing,/if\(data\.type==='intl-sopilka'\)\{if\(forestSong\)/);
});

test('every quotation from the play is in the library’s own text of it',()=>{
  const text=zlib.gunzipSync(fs.readFileSync('texts/bundled-gzip/pg999793.txt.gz')).toString('utf8'),letters=s=>s.toLowerCase().replace(/[^а-яіїєґ]/g,'');const play=letters(text);
  const {f}=forest();let checked=0;
  for(const [key,line] of Object.entries(f.quotes))for(const [,quote] of line.matchAll(/«([^»]+)»/g)){
    if(/Українська читальня|Лісової пісні|Лісову пісню/.test(quote))continue;
    assert(play.includes(letters(quote)),`${key}: «${quote}»`);checked++}
  assert(checked>=14,'the play is quoted, not paraphrased');
  assert.equal(f.book,999793);
});

test('the forest stands far from everything, and every place in it can be walked to from the door',()=>{
  const {f}=forest(),{x:cx,z:cz}=f.centre;
  for(const [ox,oz,r] of [[800,400,62],[1100,700,140],[900,-100,32],[1000,200,20],[620,120,34],[500,220,10],[700,-420,30],[1200,-600,40],[1260,-620,30]])assert(Math.hypot(cx-ox,cz-oz)>r+f.walk+130,`well clear of ${ox}, ${oz}`);
  const a=forest();a.f.enter();assert(a.f.built);assert(a.f.trees.pines>150&&a.f.trees.birches>50&&a.f.trees.alders>40,'a real forest');
  const {x,z}=a.player.pos;assert(a.f.contains(x,z)&&a.f.allowed(x,z),'the reader arrives on open ground');assert.equal(a.f.zoneAt(x,z),'forest-song');
  assert(!a.f.allowed(cx+f.lake.x,cz+f.lake.z),'nobody walks on the lake');
  const step=.5,key=(x,z)=>`${Math.round(x/step)},${Math.round(z/step)}`,seen=new Set([key(x,z)]),queue=[[x,z]],reached=[];
  while(queue.length){const [px,pz]=queue.shift();reached.push([px,pz]);for(const [dx,dz] of [[step,0],[-step,0],[0,step],[0,-step]]){const nx=px+dx,nz=pz+dz,k=key(nx,nz);if(seen.has(k)||!a.f.allowed(nx,nz))continue;seen.add(k);queue.push([nx,nz])}}
  const near=(sx,sz,d)=>reached.some(([px,pz])=>Math.hypot(px-cx-sx,pz-cz-sz)<d);
  for(const name of ['oak','birch','fire','log','willow','reeds','door'])assert(near(f.spots[name].x,f.spots[name].z,f.spots[name].r+1.6),`${name} can be reached`);
  for(const b of a.f.books)assert(reached.some(([px,pz])=>Math.hypot(px-b.position.x,pz-b.position.z)<2),'the play on the fallen tree can be reached');
  assert.equal(a.f.books.length,1);assert(a.seats.length===1&&a.seats[0].bookIds[0]===999793,'and the tree is a seat that opens it');
});

test('the pipe makes the forest unfold, Mavka steps out, and the door leads home',()=>{
  const a=forest();assert.equal(a.f.built,false);a.f.enter('sopilka');assert.match(a.notices.at(-1),/Лісова пісня/);
  assert.deepEqual(JSON.stringify(a.tracked.at(-1)),JSON.stringify(['Room Explored',{room:'forest-song'}]));
  run(a,0,2);assert(a.f.bloom<.2,'bare, as in the prologue');assert(!a.f.mavkaHere);
  assert(a.interactables.filter(o=>o.userData.type==='song-pipe').length>=3,'the pipe, its glint and a wider target round them all answer');
  a.f.interact(find(a,'song-pipe'));assert(a.notes.length>=20,'the pipe plays its tune');assert.match(a.notices.at(-1),/лілеї білі/);
  run(a,2.1,12);assert.equal(a.f.bloom,1,'spring');assert(a.f.mavkaHere,'Mavka is here');assert.match(a.notices.at(-1),/Ох, як я довго спала!/);
  assert.equal(a.store.get('athenaeum-forest-song-mavka'),'1');assert(a.tracked.some(([n,p])=>n==='Secret Found'&&p.secret==='forest-song-mavka'));
  assert(a.interactables.some(o=>o.userData.key==='mavka'),'she can be looked at');
  run(a,12.1,20);a.f.interact(find(a,'song-pipe'));assert.match(a.notices.at(-1),/Як солодко грає/,'and played to');
  const b=forest({stored:true});b.f.enter();run(b,0,2);b.f.interact(find(b,'song-pipe'));run(b,2.1,12);assert(!b.tracked.some(([n,p])=>p?.secret==='forest-song-mavka'),'met once, counted once');
  a.f.interact(find(a,'song-exit'));assert.equal(a.home.length,1);assert(!a.f.contains(a.player.pos.x,a.player.pos.z),'back in the reading room');
  run(a,25,40,1);assert(a.f.built);run(a,41,60,1);assert.equal(a.f.built,false,'freed once the reader has gone');
  assert(!a.interactables.some(o=>/^song-/.test(o.userData.type||'')),'with all its parts');
});

test('without the wing’s books, the forest still stands, with no book and no seat',()=>{
  const a=forest({book:false});a.f.enter();assert.equal(a.f.books.length,0);assert.equal(a.seats.length,0);assert(a.interactables.some(o=>o.userData.key==='log'),'the fallen tree is still there');
});

test('the Holodomor candle stands for the week up to the fourth Saturday of November, and is lit by the reader',()=>{
  const lines=wing.match(/const holodomorDay=.*\n.*const holodomorWeek=.*\n.*const isHolodomorDay=.*\n/)[0];
  const c={Date};vm.runInNewContext(lines+'this.h={holodomorDay,holodomorWeek,isHolodomorDay}',c);const {holodomorDay,holodomorWeek,isHolodomorDay}=c.h;
  for(const [year,day] of [[2025,22],[2026,28],[2027,27],[2028,25]]){const d=holodomorDay(year);assert.equal(d.getMonth(),10);assert.equal(d.getDate(),day,`${year}`);assert.equal(d.getDay(),6,'a Saturday')}
  assert(holodomorWeek(new Date(2026,10,22))&&holodomorWeek(new Date(2026,10,28,23)),'from the Sunday before to the day itself');
  assert(!holodomorWeek(new Date(2026,10,21))&&!holodomorWeek(new Date(2026,10,29))&&!holodomorWeek(new Date(2026,11,25)));
  assert(isHolodomorDay(new Date(2026,10,28,9))&&!isHolodomorDay(new Date(2026,10,27)));
  assert.match(wing,/if\(holodomorWeek\(now\)\|\|askedFor\('holodomor'\)\)/);assert.match(wing,/action:'LIGHT A CANDLE'/);assert.match(wing,/room\.lightCandle=/);
  assert.match(wing,/Сьогодні День пам’яті жертв голодоморів/);assert.match(wing,/Голодомору 1932–1933 років/);
});
