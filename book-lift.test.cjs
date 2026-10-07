const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('book-lift.js','utf8'),game=fs.readFileSync('game.js','utf8'),stairs=fs.readFileSync('high-staircase.js','utf8'),
  mars=fs.readFileSync('mars.js','utf8'),chance=fs.readFileSync('chance-room.js','utf8'),list=fs.readFileSync('data/new-books.js','utf8');
class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){Object.assign(this,{x,y,z});return this}clone(){return new V().set(this.x,this.y,this.z)}}
class O{constructor(){this.children=[];this.parent=null;this.position=new V();this.rotation={x:0,y:0,z:0,set(x,y,z){Object.assign(this,{x,y,z})}};this.scale={x:1,y:1,z:1};this.quaternion={clone:()=>({})};this.userData={}}
  add(...m){for(const c of m){c.parent=this;this.children.push(c)}return this}removeFromParent(){if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1);this.parent=null}traverse(f){f(this);for(const c of this.children)c.traverse(f)}}
class Mesh extends O{constructor(g,m){super();this.geometry=g;this.material=m;this.isMesh=true}}
const G=class{constructor(...a){this.args=a}dispose(){this.disposed=true}},M=class{constructor(p){Object.assign(this,p)}dispose(){this.disposed=true}};
const THREE={Group:O,Mesh,BoxGeometry:G,PlaneGeometry:G,CylinderGeometry:G,SphereGeometry:G,MeshStandardMaterial:M,RepeatWrapping:1,DoubleSide:2,PointLight:class extends O{constructor(){super();this.isLight=true}}};
const STOCK=Array.from({length:36},(_,i)=>1000+i);
function lift({reduced=false,stock=STOCK}={}){
  const context={window:{},Math,setTimeout:f=>f()};vm.runInNewContext(source,context);
  const scene=new O(),interactables=[],notices=[],player={pos:new V(),radius:.42,yaw:0},camera={position:new V(),rotation:{set(){}},updateMatrixWorld(){}};
  let holding=false;
  const r=context.window.createBookLift({THREE,scene,MAT:{wood:new M({}),wood2:new M({}),darkWood:new M({}),stone:new M({}),brass:new M({}),paper:new M({}),fabric:new M({})},player,camera,interactables,
    canvasTexture:()=>({dispose(){},repeat:{set(){}}}),bookMaterial:()=>new M({}),findBook:id=>({id,title:'Book '+id}),arrivals:stock,showNotice:t=>notices.push(t),
    isHolding:()=>holding,isReducedMotion:()=>reduced,move:(x,z,yaw)=>{player.pos.set(x,0,z);player.yaw=yaw}});
  return {r,scene,interactables,notices,player,camera,hold:v=>{holding=v}};
}
const of=(a,type)=>a.interactables.find(o=>o.userData.type===type);
const shelved=a=>a.interactables.filter(o=>o.userData.lostProperty);
// Run the ride to its end, a frame at a time.
function ride(a,t0=0){let t=t0;for(let i=0;i<2000&&a.r.travelling;i++){t+=1/30;a.r.update(t,1/30)}return t}
const facing=yaw=>({x:-Math.sin(yaw),z:-Math.cos(yaw)});

test('the hatch is set in the west wing’s south wall, facing into the wing, clear of the hidden passage and the sorting door',()=>{
  const a=lift(),hatch=of(a,'lift-hatch'),g=hatch.parent;
  assert.equal(g.rotation.y,Math.PI);const front=facing(g.rotation.y+Math.PI);assert(front.z<-.9,'its front looks north, into the wing');
  assert(Math.abs(g.position.z-9.56)<.05,'at the face of the wainscot');
  assert(g.position.x-.85>-36.4,'clear of the STAFF · SORTING door on the west wall');assert(g.position.x+.85<-31.3,'clear of the hidden passage');
  for(const part of g.children)assert(part.position.z>0,'every part stands in front of the wainscot, not inside it');
});

test('the office stands far from the Room of Chance, Mars and the Moon',()=>{
  const {room:R}=lift().r,[mx,mz,mr]=['mx','mz','moonRadius'].map(k=>+stairs.match(new RegExp(`\\b${k}=([\\d.]+)`))[1]);
  const m=mars.match(/CENTRE=\{x:(-?\d+),z:(-?\d+)\},RADIUS=(\d+)/),c=chance.match(/ROOM=\{cx:(-?\d+),cz:(-?\d+),w:(\d+),d:(\d+)/);
  for(const [x,z] of [[R.cx-R.w/2,R.cz-R.d/2],[R.cx-R.w/2,R.cz+R.d/2],[R.cx+R.w/2,R.cz-R.d/2],[R.cx+R.w/2,R.cz+R.d/2]]){
    assert(Math.hypot(x-mx,z-mz)>mr+130,'beyond the camera’s reach from the Moon');assert(Math.hypot(x-+m[1],z-+m[2])>+m[3]+100,'well clear of Mars');
    assert(Math.abs(z-+c[2])>+c[4]/2+100,'well clear of the Room of Chance')}
});

test('ringing at the hatch rides the lift down to the office, where a random lot of the stock is out, tagged and facing the room',()=>{
  const a=lift();a.r.interact(of(a,'lift-hatch'));assert.equal(a.r.travelling,true,'the car sets off');assert.equal(a.r.built,true);
  a.r.update(.03,.03);const start=a.camera.position.y;assert(start>10,'from the top of the shaft');a.r.update(1,1);assert(a.camera.position.y<start,'and goes down');
  ride(a,1);assert.equal(a.r.travelling,false);
  const {room:R}=a.r;assert(a.r.contains(a.player.pos.x,a.player.pos.z)&&a.r.allowed(a.player.pos.x,a.player.pos.z),'the reader steps out onto open floor');
  assert.equal(a.player.yaw,Math.PI,'facing into the office');assert.match(a.notices.at(-1),/Lost Property Office/);
  const books=shelved(a),ids=books.map(b=>b.userData.book.id);
  assert.equal(books.length,18);assert.equal(new Set(ids).size,18,'no book twice');assert(ids.every(id=>STOCK.includes(id)),'all from the stock');
  for(const b of books){assert.match(b.userData.tag,/\w/,'each has a tag');const g=b.parent,f=facing(g.rotation.y),toCentre={x:R.cx-g.position.x,z:R.cz-g.position.z};assert(f.x*toCentre.x+f.z*toCentre.z>0,'and faces the room')}
});

test('a different lot is out on each visit, and the bell on the counter sends for one that was not just there',()=>{
  const a=lift();a.r.enter();const first=new Set(shelved(a).map(b=>b.userData.book.id));
  a.r.interact(of(a,'lift-bell'));const second=shelved(a).map(b=>b.userData.book.id);
  assert.equal(second.length,18);assert(second.every(id=>!first.has(id)),'none of the books that were just out');
  // With a small stock the bell still fills every pigeonhole, from the books that were out.
  const small=lift({stock:STOCK.slice(0,20)});small.r.enter();small.r.interact(of(small,'lift-bell'));assert.equal(shelved(small).length,18);
  // Visits are random: across a few builds, not every lot is the same.
  const lots=new Set();for(let i=0;i<6;i++){const b=lift();b.r.enter();lots.add(shelved(b).map(x=>x.userData.book.id).sort().join())}
  assert(lots.size>1,'the lot changes from visit to visit');
});

test('the car goes up again, and the reader comes out in front of the hatch in the west wing',()=>{
  const a=lift();a.r.enter();a.r.interact(of(a,'lift-car'));assert.equal(a.r.travelling,true);ride(a);
  const {entrance:E}=a.r;assert(Math.abs(a.player.pos.x-E.x)<.01&&a.player.pos.z<E.z-1,'just in front of the hatch');assert.equal(a.player.yaw,0,'facing into the wing');
  assert.match(game,/if\(carryingBook&&focus\?\.userData\?\.type==='lift-car'&&bookLift\)\{bookLift\.carryUp\(\(\)=>returnSelected\(false\)\)/,'a reader carrying a book is not trapped');
});

test('reduced motion makes the ride short and still',()=>{
  const a=lift({reduced:true});a.r.interact(of(a,'lift-hatch'));let t=0,ys=[];
  while(a.r.travelling&&t<10){t+=1/30;a.r.update(t,1/30);ys.push(a.camera.position.y)}
  assert(t<3.6,'over in a few seconds');for(let i=1;i<ys.length;i++)assert(ys[i]<=ys[i-1]+1e-9,'no jolting on the way down');
});

test('the office is freed a while after the reader leaves, keeps the hatch, and is built again with a new lot',()=>{
  const a=lift(),hatch=of(a,'lift-hatch');a.r.enter();a.r.update(1,0);
  a.r.interact(of(a,'lift-car'));const t=ride(a,1);a.r.update(t+5,0);assert.equal(a.r.built,true,'not straight away');
  a.r.update(t+40,0);assert.equal(a.r.built,false,'freed after twenty-five seconds away');
  assert(!a.interactables.some(o=>o.userData.lostProperty||String(o.userData.type).match(/lift-(car|bell|card)/)),'its books, car and cards go with it');
  assert(a.interactables.includes(hatch),'the hatch stays');
  a.r.interact(hatch);assert.equal(a.r.built,true);ride(a,t+41);assert.equal(shelved(a).length,18,'and the office is stocked again');
});

test('the lost property books are new to the library, each with a note, and the office is wired in',()=>{
  const entries=[...list.matchAll(/^\s*\[(\d+|null),'((?:[^'\\]|\\.)+)','(?:[^'\\]|\\.)+','(?:[^'\\]|\\.)+','([a-z-]+)','((?:[^'\\]|\\.)+)'\]/gm)];
  const lost=entries.filter(m=>m[3]==='lost-property');assert(lost.length>=30,'a good stock, enough for two lots');
  const others=entries.filter(m=>m[3]!=='lost-property');
  const elsewhere=[game,...fs.readdirSync('data').filter(f=>f.endsWith('.js')&&!f.startsWith('new-books')).map(f=>fs.readFileSync('data/'+f,'utf8'))].join('\n');
  for(const [,id,title,,note] of lost){
    assert(note.split(/[.!?”](?:\s|$)/).filter(Boolean).length>=2,`${title} has a librarian’s note`);
    assert(!others.some(m=>m[2]===title),`${title} is on no other new-arrivals shelf`);
    assert(!elsewhere.includes(`'${title}'`)&&!elsewhere.includes(`"${title}"`),`${title} is in no other catalogue`);
    if(id!=='null')assert(!new RegExp(`\\[${id},'`).test(game)&&!others.some(m=>m[1]===id),`${title} (${id}) is not already in the library`);
  }
  assert.match(fs.readFileSync('scripts/new-books.mjs','utf8'),/'lost-property'/);
  assert.match(game,/arrivals:arrivalIds\('lost-property'\)/);
  assert.match(game,/'lost-property':bookLift&&\(\(\)=>bookLift\.enter\(\)\)/);assert.match(game,/lift:'lost-property'/);
  assert.match(game,/\['lost-property','The Lost Property Office'\]/);assert.match(game,/bookLift\?\.contains\(x,z\)\)return 'lost-property'/);
  assert.match(game,/gameActive=function\(\)\{return !bookLift\.travelling&&/,'the reader cannot walk off mid-ride');
  assert.match(fs.readFileSync('room-ambience.js','utf8'),/'lost-property':\{/);
  const html=fs.readFileSync('index.html','utf8'),order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);
  assert(order.indexOf('book-lift.js')>=0&&order.indexOf('book-lift.js')<order.indexOf('game.js'));
});
