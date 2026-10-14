const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){Object.assign(this,{x,y,z});return this}clone(){return new V().set(this.x,this.y,this.z)}}
class O{constructor(){this.children=[];this.parent=null;this.position=new V();this.rotation={x:0,y:0,z:0};this.quaternion={clone:()=>({})};this.userData={}}
  add(...m){for(const c of m){c.parent=this;this.children.push(c)}return this}removeFromParent(){if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1);this.parent=null}traverse(f){f(this);for(const c of this.children)c.traverse(f)}}
class Mesh extends O{constructor(g,m){super();this.geometry=g;this.material=m}}
const G=class{constructor(...a){this.args=a}dispose(){this.disposed=true}},M=class{constructor(p){Object.assign(this,p);this.emissive={setHex(){}}}dispose(){this.disposed=true}};
const THREE={Group:O,Mesh,BoxGeometry:G,PlaneGeometry:G,MeshStandardMaterial:M,CylinderGeometry:G,PointLight:class extends O{constructor(){super();this.isLight=true}}};

function setup(extra={}){
 const context={window:{},Math};vm.runInNewContext(fs.readFileSync('cinder-room.js','utf8'),context);
 const scene=new O(),interactables=[],player={pos:new V(),radius:.42},notices=[];
 const r=context.window.buildCinderRoom({THREE,scene,MAT:{},player,interactables,canvasTexture:()=>({dispose(){this.disposed=true}}),findBook:id=>({id,title:'Book '+id}),arrivals:()=>[],entrance:{x:101,z:21.55},showNotice:t=>notices.push(t),move:(x,z)=>player.pos.set(x,0,z),...extra});
 return {r,scene,interactables,player,notices};
}
test('Cinder Archive builds on entry, has safe arrival and exit routes, and frees its resources',()=>{
 const a=setup();assert.equal(a.r.built,false);assert.equal(a.scene.children.length,0);
 a.r.enter();assert.equal(a.r.built,true);assert(a.r.allowed(a.player.pos.x,a.player.pos.z));assert(a.r.atExit());
 const R=a.r.room;for(let z=R.cz+6;z>R.cz+1.6;z-=.2)assert(a.r.allowed(R.cx,z),'central route stays clear');
 assert.equal(a.interactables.filter(o=>o.userData.type==='book').length,3);assert(a.interactables.every(o=>o.userData.type!=='book'||o.userData.cinderBinding));
 const note=a.interactables.find(o=>o.userData.title==='HORTUS DELICIARUM');assert(a.r.interact(note));assert.match(a.notices.at(-1),/empty cradle/);
 const root=a.scene.children[0],geo=root.children[0].geometry,lights=[];root.traverse(o=>{if(o.isLight)lights.push(o)});
 a.r.update(1);a.r.leave();a.r.update(20);assert(a.r.built);a.r.update(30);assert(!a.r.built);assert.equal(a.interactables.length,0);assert(geo.disposed);assert(lights.every(l=>l.userData.freed));
 a.r.enter();assert(a.r.built);assert.equal(a.interactables.filter(o=>o.userData.type==='book').length,3);
});
test('an archive volume moved outside prevents disposal while it is in use',()=>{
 const a=setup();a.r.enter();const b=a.interactables.find(o=>o.userData.type==='book');a.scene.add(b);a.r.leave();a.r.update(40);assert(a.r.built);
});
test('only the entrance bootstrap is warmed at startup and the room is wired into discovery and carrying',()=>{
 const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8'),entry=fs.readFileSync('cinder-archive.js','utf8');
 assert.match(html,/startupScript\('cinder-archive.js'\)/);assert.doesNotMatch(html,/startupScript\('cinder-room.js'\)/);
 assert.match(entry,/libraryVersionedSource\?\.\('cinder-room.js'\)/);assert.match(entry,/script.onerror/);assert.match(entry,/if\(pending\)return pending/);
 assert.match(game,/cinderArchive\?\.contains\(x,z\)\)return 'cinder-archive'/);assert.match(game,/carryingBook&&cinderArchive\?\.atExit/);assert.match(game,/object.userData.cinderBinding/);
});
test('the hearth reveals before downloading, shares a load request, and retries network failure',async()=>{
 const scripts=[],notices=[],interactables=[],scene=new O();let timer;
 const context={window:{libraryVersionedSource:s=>s+'?v=test'},Math,document:{createElement:()=>({remove(){}}),head:{appendChild:s=>scripts.push(s)}},setTimeout:f=>{timer=f;return 1},clearTimeout(){}};
 vm.runInNewContext(fs.readFileSync('cinder-archive.js','utf8'),context);
 const r=context.window.createCinderArchive({THREE,scene,MAT:{},interactables,canvasTexture:()=>({}),showNotice:s=>notices.push(s)});
 assert.equal(scripts.length,0);assert.equal(r.built,false);
 r.interact(interactables.find(o=>o.userData.type==='cinder-key'));assert.equal(scripts.length,0);assert(interactables.some(o=>o.userData.type==='cinder-door'));
 const first=r.enter();r.enter();assert.equal(scripts.length,1);assert.match(scripts[0].src,/cinder-room.js\?v=test/);scripts[0].onerror();await first;assert.equal(r.pending,false);assert.match(notices.at(-1),/Try the hearth again/);
 let entered=0;const retry=r.enter();assert.equal(scripts.length,2);context.window.buildCinderRoom=()=>({enter(){entered++},built:true});scripts[1].onload();await retry;assert.equal(entered,1);assert(r.built);
});

test('every exhibit is reachable from the hearth, with room to stand and return',()=>{
 for(const radius of [.42,.6]){
  const a=setup();a.player.radius=radius;a.r.enter();const R=a.r.room,step=.1;
  const key=(x,z)=>`${x},${z}`,queue=[[0,59]],seen=new Set([key(0,59)]);
  for(let head=0;head<queue.length;head++){
   const [x,z]=queue[head];
   for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,nz=z+dz,k=key(nx,nz);if(!seen.has(k)&&a.r.allowed(R.cx+nx*step,R.cz+nz*step)){seen.add(k);queue.push([nx,nz])}}
  }
  const exhibits=a.interactables.filter(o=>o.userData.type==='cinder-note'&&o.geometry.args.length===2&&['BEOWULF','THE FRENCH REVOLUTION','THE BATTLE OF MALDON','COTTON GENESIS','HORTUS DELICIARUM','THE HERCULANEUM PAPYRI'].includes(o.userData.title));
  for(const o of exhibits){const x=Math.round((o.position.x-R.cx)/step),z=Math.round((o.position.z-R.cz+.8)/step);assert(seen.has(key(x,z)),`${o.userData.title} must have a reachable viewing position (radius ${radius})`)}
  for(let z=-48;z<40;z++)assert(seen.has(key(0,z)),'the central aisle must be continuously open');
 }
});

test('optional photo textures stay lazy, respect low bandwidth, and dispose late responses',()=>{
 const requests=[],PhotoTHREE={...THREE,TextureLoader:class{load(url,ok){requests.push({url,ok})}}};
 const a=setup({THREE:PhotoTHREE});assert.equal(requests.length,0);a.r.enter();assert.equal(requests.length,4);
 const texture=()=>({repeat:{set(){}},dispose(){this.disposed=true}});
 const accepted=texture();requests[0].ok(accepted);a.r.unload();assert(accepted.disposed);
 a.r.enter();const late=texture();requests[1].ok(late);assert(late.disposed,'old textures must not attach to a rebuilt room');a.r.unload();
 requests.length=0;const low=setup({THREE:PhotoTHREE,isLowBandwidth:()=>true});low.r.enter();assert.equal(requests.length,0);
});
