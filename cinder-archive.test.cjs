const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){Object.assign(this,{x,y,z});return this}clone(){return new V().set(this.x,this.y,this.z)}}
class O{constructor(){this.children=[];this.parent=null;this.position=new V();this.rotation={x:0,y:0,z:0};this.quaternion={clone:()=>({})};this.userData={}}
  add(...m){for(const c of m){c.parent=this;this.children.push(c)}return this}removeFromParent(){if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1);this.parent=null}traverse(f){f(this);for(const c of this.children)c.traverse(f)}}
class Mesh extends O{constructor(g,m){super();this.geometry=g;this.material=m}}
const G=class{constructor(...a){this.args=a}dispose(){this.disposed=true}},M=class{constructor(p){Object.assign(this,p);this.emissive={setHex(){}}}dispose(){this.disposed=true}};
const THREE={Group:O,Mesh,BoxGeometry:G,PlaneGeometry:G,MeshStandardMaterial:M,CylinderGeometry:G,PointLight:class extends O{constructor(){super();this.isLight=true}}};

function setup(){
 const context={window:{},Math};vm.runInNewContext(fs.readFileSync('cinder-room.js','utf8'),context);
 const scene=new O(),interactables=[],player={pos:new V(),radius:.42},notices=[];
 const r=context.window.buildCinderRoom({THREE,scene,MAT:{},player,interactables,canvasTexture:()=>({dispose(){this.disposed=true}}),findBook:id=>({id,title:'Book '+id}),arrivals:()=>[],entrance:{x:101,z:21.55},showNotice:t=>notices.push(t),move:(x,z)=>player.pos.set(x,0,z)});
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
