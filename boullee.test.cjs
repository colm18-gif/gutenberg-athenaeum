// The library that was never built (boullee-library.js): built for real with a stand-in for Three.js that keeps
// positions, then walked from the frame at the south end up the stairs to the top terrace, where the floor can be read.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('boullee-library.js','utf8'),corridorSource=fs.readFileSync('long-corridor.js','utf8');
const game=fs.readFileSync('game.js','utf8'),index=fs.readFileSync('index.html','utf8'),ambience=fs.readFileSync('room-ambience.js','utf8');

class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){Object.assign(this,{x,y,z});return this}clone(){return new V().set(this.x,this.y,this.z)}copy(v){return this.set(v.x,v.y,v.z)}}
const any=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>0:any,apply:()=>any,construct:()=>any});
function thing(){
  let self;const scale=Object.assign(function(){return self},{x:1,y:1,z:1,set(){return scale}});
  const t={children:[],parent:null,visible:true,position:new V(),scale,userData:{},rotation:{x:0,y:0,z:0,set(){return this}},quaternion:{clone:()=>({})},
    add(...c){for(const x of c){x.parent=self;t.children.push(x)}return self},removeFromParent(){if(t.parent)t.parent.children.splice(t.parent.children.indexOf(self),1);t.parent=null},
    traverse(fn){fn(self);for(const c of t.children)c.traverse?.(fn)}};
  return self=new Proxy(t,{get:(o,k)=>k in o?o[k]:typeof k==='symbol'?undefined:any});
}
const THREE=new Proxy({},{get:()=>function(){return thing()}});
const core=id=>{const m=new RegExp(`\\[${id},'([^']+)','([^']+)','([^']+)'`).exec(game);return m&&{id,title:m[1],author:m[2],category:m[3]}};
function hall({stored=[],search=''}={}){
  const context={window:{},Math,Object,Array,Number,String};vm.runInNewContext(corridorSource,context);vm.runInNewContext(source,context);
  const player={pos:new V(),radius:.42,pitch:0},interactables=[],notices=[],moves=[],seats=[],scene=thing(),store=new Map(stored.map(k=>[k,'1']));
  const shared={THREE,scene,MAT:new Proxy({},{get:()=>thing()}),player,interactables,canvasTexture:()=>thing(),showNotice:t=>notices.push(t),playSample(){},
    move:(x,z,yaw)=>{moves.push({x,z,yaw});player.pos.set(x,0,z)}};
  const corridor=context.window.createLongCorridor(shared);
  const b=context.window.createBoulleeLibrary({...shared,corridor,bookMaterial:()=>thing(),findBook:core,registerSeat:(parts,group,at,yaw,data)=>seats.push(data),
    storage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)},search});
  return {b,corridor,player,interactables,notices,moves,seats,store};
}
// Walk in a straight line a tenth of a metre at a time, as a reader would; false if `allowed` stops them.
function walk(h,x,z){const p=h.player.pos;for(let i=0;i<2000;i++){const dx=x-p.x,dz=z-p.z,d=Math.hypot(dx,dz);if(d<.05)return true;const s=Math.min(.1,d),nx=p.x+dx/d*s,nz=p.z+dz/d*s;if(!h.b.allowed(nx,nz))return false;p.set(nx,h.b.floorAt(nx,nz),nz)}return false}

test('it loads before game.js and is wired into the library',()=>{
  const order=[...index.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);assert.ok(order.indexOf('boullee-library.js')>order.indexOf('long-corridor.js')&&order.indexOf('boullee-library.js')<order.indexOf('game.js'));
  for(const term of ['boulleeLibrary.floorAt','boulleeLibrary.allowed','boulleeLibrary.interact','boulleeLibrary.update',"if(boulleeLibrary?.contains(x,z))return 'boullee-library'","'boullee-library':boulleeLibrary&&(()=>boulleeLibrary.enter())","boullee:'boullee-library'","['boullee-library','The library that was never built']",'corridor:longCorridor'])
    assert.ok(game.includes(term),term);
  assert.ok(ambience.includes("'boullee-library':{beds:"),'it has an ambience');
  assert.doesNotMatch(source,/PointLight|SpotLight|DirectionalLight|AmbientLight/,'no lights: the daylight is painted');
});

test('his drawing hangs in the corridor’s third east bay, kept clear for it, and stays when everything else is freed',()=>{
  const h=hall(),p=h.b.picture,c=h.corridor;
  assert.deepEqual({...c.pictureBay},{side:'east',bay:2});assert.match(corridorSource,/if\(side===PICTURE_BAY\.side&&k===PICTURE_BAY\.bay\)continue/,'no panel behind the picture');
  assert.equal(p.z,c.bayZ(2));assert.ok(p.x>c.room.cx&&p.x<c.room.cx+c.room.w/2,'on the east wall, inside the corridor');
  assert.ok(!(c.foodDoor.side==='east'&&c.foodDoor.bay===2),'not the Gastronomic Athenaeum’s bay');
  const picture=h.interactables.find(o=>o.userData.type==='boullee-picture');assert.ok(picture,'hung at startup');assert.equal(picture.userData.action,'STEP IN');
  const before=c.standBefore(p,2);assert.ok(c.allowed(before.x,before.z),'there is floor to stand on in front of it');
  assert.ok(h.b.interact(picture));assert.ok(h.b.built);assert.ok(h.b.contains(h.player.pos.x,h.player.pos.z));assert.ok(h.b.allowed(h.player.pos.x,h.player.pos.z),'the reader arrives on open floor');
  assert.match(h.notices.at(-1),/never built/);
  assert.ok(h.b.interact(h.interactables.find(o=>o.userData.type==='boullee-out')),'the frame at the south end leads back');
  assert.ok(c.contains(h.player.pos.x,h.player.pos.z)&&c.allowed(h.player.pos.x,h.player.pos.z),'into the corridor, before the drawing');
  h.b.update(1,.1);h.b.update(40,.1);assert.ok(!h.b.built,'freed a while after the reader leaves');
  assert.ok(h.interactables.includes(picture),'the drawing still answers');assert.ok(!h.interactables.some(o=>o.userData.type==='boullee-out'||o.userData.boullee),'the hall’s own parts go with it');
});

test('the hall is as large as it says, and the stairs climb it a tier at a time to the top',()=>{
  const h=hall(),{hall:H,top,face,flight}=h.b,cx=H.cx,cz=H.cz;h.b.enter();
  assert.equal(H.len,96);assert.ok(Math.abs(top-H.tiers*H.rise)<1e-9);assert.ok(Math.abs(flight.steps*flight.rise-H.rise)<1e-9,'a flight climbs exactly one tier');assert.ok(flight.rise<.22,'steps a reader can take');
  // Everything is inside what the camera draws (130 m), corner to corner.
  assert.ok(Math.hypot(H.len,2*H.wallX,top+H.colH+H.ent+H.colX)<130);
  // No stepping up a bookcase or off a terrace.
  assert.ok(walk(h,cx+face(0)-.6,cz+10));assert.ok(!walk(h,cx+face(0)+1,cz+10),'a tier’s face is a wall');
  // Up the south-east stairs: four flights, doubling back.
  h.player.pos.set(cx,0,cz+42);
  const route=[[7.1,37],[7.1,29.9],[10.5,29.9],[9.6,29],[10.7,29],[10.7,35.5],[14,35.5],[14.3,36.5],[14.3,29.9],[17.5,29.9],[16.8,29],[17.9,29],[17.9,35.5],[20,35.5]];
  for(const [lx,lz] of route)assert.ok(walk(h,cx+lx,cz+lz),`walking to (${lx}, ${lz})`);
  assert.ok(Math.abs(h.b.floorAt(h.player.pos.x,h.player.pos.z)-top)<1e-9,'the top terrace');
  assert.ok(walk(h,cx+19.9,cz+10),'along the top terrace, in front of the columns');
  assert.ok(!walk(h,cx+face(3)-1,cz+10),'and no stepping off its edge');
  // The mirror stairs at the other end and the other side are there too.
  for(const [s,z0] of [[-1,36],[1,-36],[-1,-36]])assert.ok(Math.abs(h.b.heightAt(s*(face(0)-.7),z0+(z0>0?-1:1)*.1)-flight.rise)<1e-9,'a first step');
});

test('eight of the library’s own books about books stand on lecterns a reader can walk up to, with cards that say what is so',()=>{
  const h=hall(),{hall:H,face}=h.b;h.b.enter();
  assert.equal(h.b.own.length,8);assert.equal(h.b.books.length,8);
  for(const [id,s,level,lz] of h.b.own){const book=core(id);assert.ok(book,`${id} is in the core list`);assert.equal(book.category,'Archive');
    const lx=level?s*(face(level-1)+.75):s*5.6,open=level?s*(face(level-1)+1.7):s*4.6;assert.ok(Math.abs(h.b.heightAt(lx,lz)-level*H.rise)<1e-9,`${book.title} stands on tier ${level}`);
    h.player.pos.set(H.cx+open,level*H.rise,H.cz+lz);assert.ok(h.b.allowed(H.cx+open,H.cz+lz),`open floor before ${book.title}`)}
  assert.ok(!h.b.own.some(([id])=>id===28174),'The Private Library stays a secret edition');
  const about=h.b.cards.about[1];for(const fact of ['1785','Étienne-Louis Boullée','never built','Bibliothèque nationale de France','School of Athens'])assert.ok(about.includes(fact),fact);
  assert.equal(h.seats.length,1);assert.ok(h.interactables.filter(o=>o.userData.type==='boullee-card').length>=6);
});

test('the secret: from the top terrace, looking down, the floor can be read, and Dee’s catalogue is left on the stand for good',()=>{
  const h=hall(),{hall:H,top,face}=h.b;h.b.enter();const has=()=>h.b.books.some(b=>b.userData.book.id===h.b.secret);
  assert.equal(h.b.secret,19553);assert.match(core(19553).title,/John Dee and the Catalog of His Library/);assert.ok(!has());
  // Looking down from the floor does nothing; nor does standing at the top looking ahead.
  h.player.pitch=-.6;for(let t=0;t<3;t+=.1)h.b.update(t,.1);assert.ok(!h.b.found);
  h.player.pos.set(H.cx+face(3)+.8,top,H.cz+10);h.player.pitch=0;for(let t=3;t<6;t+=.1)h.b.update(t,.1);assert.ok(!h.b.found);
  h.player.pitch=-.6;for(let t=6;t<8;t+=.1)h.b.update(t,.1);
  assert.ok(h.b.found);assert.ok(has(),'the catalogue is on the stand');assert.equal(h.store.get('athenaeum-boullee-pavement'),'1');
  assert.ok(h.notices.at(-1).includes(h.b.pavement));assert.match(source,new RegExp(`fillText\\(PAVEMENT`),'the same words are in the floor');
  // Found once, found for good; and ?pavement shows it.
  for(const again of [hall({stored:['athenaeum-boullee-pavement']}),hall({search:'?room=boullee&pavement'})]){again.b.enter();assert.ok(again.b.books.some(b=>b.userData.book.id===19553))}
});
