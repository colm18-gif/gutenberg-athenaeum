// The Long Corridor (long-corridor.js): built for real with a stand-in for Three.js that keeps positions, then walked
// from the Grand Hall to the Gastronomic Athenaeum's door and back.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('long-corridor.js','utf8');
const food=fs.readFileSync('food-history-wing.js','utf8');
const game=fs.readFileSync('game.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const ambience=fs.readFileSync('room-ambience.js','utf8');
const exploration=fs.readFileSync('exploration.js','utf8');

class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){Object.assign(this,{x,y,z});return this}}
const any=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>0:any,apply:()=>any,construct:()=>any});
function thing(){
  let self;
  const t={children:[],parent:null,visible:true,position:new V(),userData:{},rotation:{x:0,y:0,z:0,set(){return this}},
    add(...c){for(const x of c){x.parent=self;t.children.push(x)}return self},removeFromParent(){if(t.parent)t.parent.children.splice(t.parent.children.indexOf(t),1);t.parent=null},
    traverse(fn){fn(t);for(const c of t.children)c.traverse?.(fn)}};
  return self=new Proxy(t,{get:(o,k)=>k in o?o[k]:typeof k==='symbol'?undefined:any});
}
const THREE=new Proxy({},{get:()=>function(){return thing()}});
function corridor(){
  const context={window:{},Math,Object,Array,Number,String};vm.runInNewContext(source,context);
  const player={pos:new V(),radius:.42},interactables=[],notices=[],moves=[],scene=thing();
  const c=context.window.createLongCorridor({THREE,scene,MAT:new Proxy({},{get:()=>thing()}),player,interactables,canvasTexture:()=>thing(),
    showNotice:t=>notices.push(t),playSample(){},move:(x,z,yaw)=>{moves.push({x,z,yaw});player.pos.set(x,0,z)}});
  return {c,player,interactables,notices,moves,scene};
}

test('the corridor loads before game.js and is wired into the library',()=>{
  assert.ok(index.indexOf("startupScript('long-corridor.js')")>0);
  assert.ok(index.indexOf("startupScript('long-corridor.js')")<index.indexOf("startupScript('game.js')"));
  for(const term of ['longCorridor.floorAt','longCorridor.allowed','longCorridor.interact','longCorridor.update',"if(longCorridor?.contains(x,z))return 'long-corridor'","'long-corridor':longCorridor&&(()=>longCorridor.enter())","corridor:'long-corridor'","['long-corridor','The Long Corridor']"])
    assert.ok(game.includes(term),term);
  assert.ok(ambience.includes("'long-corridor':{beds:"),'it has an ambience');
});

test('its door in the hall is the library’s walnut with the name gilded on the glass, and stays when the corridor is freed',()=>{
  const {c,interactables}=corridor();
  assert.match(source,/doorKit\.readingRoom\?\.\('THE LONG\\nCORRIDOR','The Gastronomic Athenaeum'\)/);
  const door=interactables.find(o=>o.userData.type==='corridor-door');assert.ok(door,'the hall door is built at startup');
  c.activate();assert.ok(c.built);c.unload();assert.ok(!c.built);
  assert.ok(interactables.includes(door),'the hall door still answers once the corridor is freed');
  assert.ok(!interactables.some(o=>o.userData.type==='corridor-exit'),'the corridor’s own parts go with it');
});

test('the door stands on bare wall in the hall’s east wall, clear of its neighbours, with Havisham’s clock above it',()=>{
  const {c}=corridor(),d=c.door,half=1.25;
  assert.equal(d.x,18.72);assert.equal(d.yaw,-Math.PI/2);
  const curious=fs.readFileSync('curious-doors.js','utf8');
  assert.ok(curious.includes("conservatory:{key:'conservatory'")&&curious.includes("door:{x:18.72,z:-28,yaw:-Math.PI/2}"),'the Night Conservatory’s door is where this test thinks');
  assert.ok(game.includes("galleryPicture(18.65,4,-20,3.5,4.9,-Math.PI/2,'assets/painting-journey-caravan.jpg'"),'so is The Long Road East');
  // The conservatory's stained-glass door is about 2.6 m across its frame; the picture 3.5 m wide.
  for(const [name,a,b] of [['the Night Conservatory’s door',-28-1.3,-28+1.3],['The Long Road East',-20-1.75,-20+1.75]])
    assert.ok(d.z+half+.5<=a||d.z-half-.5>=b,`the door (z ${d.z-half} to ${d.z+half}) keeps half a metre from ${name}`);
  // In front of it the floor is open: north of the station subway's well (x 12.6–15.4, z −21 to −14.5).
  assert.ok(d.z+half<-21,'clear of the subway steps');
  const havisham=exploration.match(/\{key:'havisham',x:([\d.]+),z:(-?[\d.]+),y:([\d.]+),/);
  assert.ok(havisham,'Havisham’s clock is hung at a height of its own');
  assert.equal(+havisham[1],d.x);assert.equal(+havisham[2],d.z);assert.ok(+havisham[3]-.45>3.45,'above the door’s cornice');
  assert.ok(exploration.includes('spec.y??3.05'),'the other clocks keep their height');
});

test('a reader goes in from the hall, walks to the Gastronomic Athenaeum’s door, and comes back out',()=>{
  const {c,player,interactables,moves}=corridor();
  c.interact(interactables.find(o=>o.userData.type==='corridor-door'));
  let p=moves.at(-1);assert.ok(c.contains(p.x,p.z)&&c.allowed(p.x,p.z),'in, on open floor');
  // Down the runner to the far end, every step allowed.
  for(let z=p.z;z>c.room.cz-c.room.d/2+1;z-=.5)assert.ok(c.allowed(c.room.cx,z),`the corridor is walkable at z ${z}`);
  // The Gastronomic door is on the west wall, facing in, and the reader can stand before it.
  const f=c.foodDoor;assert.ok(Math.abs(f.x-(c.room.cx-c.room.w/2))<.4,'on the west wall');assert.equal(f.yaw,Math.PI/2);
  const before=c.standBefore(f,2.75);assert.ok(c.allowed(before.x,before.z),'open floor in front of it');assert.equal(before.yaw,f.yaw+Math.PI);
  assert.ok(Math.abs(f.z-c.bayZ(1))<1e-9,'in its second bay');
  // And back out to the hall, in front of the door.
  c.interact(interactables.find(o=>o.userData.type==='corridor-exit'));p=moves.at(-1);
  assert.ok(Math.abs(p.x-(18.72-1.9))<1e-9&&Math.abs(p.z-c.door.z)<1e-9,'standing in the hall before the door');
  assert.ok(!c.contains(p.x,p.z));
});

test('the corridor is built as the reader comes near and freed when they have gone',()=>{
  const {c,player}=corridor();
  player.pos.set(c.door.x-3,0,c.door.z);c.update(1);assert.ok(c.built,'built ahead of the reader at the door');
  player.pos.set(0,0,24);c.update(10);assert.ok(c.built,'kept a while');c.update(40);assert.ok(!c.built,'then freed');
});

test('it stands far from every other room',()=>{
  const {c}=corridor(),R=c.room;
  // Rooms out at these distances: the Uncatalogued (x 1400), the falls cave (x 1500, z 1000), the explorers' anteroom (x 1320).
  for(const [x,z] of [[1400,-250],[1500,1000],[1320,320],[1260,-620],[1200,-600]])assert.ok(Math.hypot(R.cx-x,R.cz-z)>200,`clear of ${x},${z}`);
  assert.ok(food.includes('const THRESHOLD=corridor?.foodDoor||'));
});
