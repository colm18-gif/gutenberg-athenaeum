const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8'),source=fs.readFileSync('map-room.js','utf8'),fetcher=fs.readFileSync('scripts/fetch-maps.mjs','utf8');
const manifest=JSON.parse(fs.readFileSync('assets/maps/maps.json','utf8'));
const arrivals=(()=>{const c={window:{}};vm.runInNewContext(fs.readFileSync('data/new-books.js','utf8'),c);return c.window.ATHENAEUM_NEW_BOOKS})();
class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){Object.assign(this,{x,y,z});return this}clone(){return new V().set(this.x,this.y,this.z)}}
class O{constructor(){this.children=[];this.parent=null;this.position=new V();this.scale=new V().set(1,1,1);this.rotation={x:0,y:0,z:0,order:'XYZ',set(x,y,z){Object.assign(this,{x,y,z})}};this.quaternion={clone:()=>({})};this.userData={}}
  add(c){c.parent=this;this.children.push(c);return this}removeFromParent(){if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1);this.parent=null}traverse(fn){fn(this);for(const c of this.children)c.traverse(fn)}}
class Mesh extends O{constructor(g,m){super();this.geometry=g;this.material=m}}
let disposed=0;const G=class{dispose(){disposed++}},M=class{constructor(p){Object.assign(this,p)}dispose(){disposed++}};
const THREE={Group:O,Mesh,Vector3:V,BoxGeometry:G,CylinderGeometry:G,SphereGeometry:G,PlaneGeometry:G,ConeGeometry:G,CircleGeometry:G,TorusGeometry:G,MeshStandardMaterial:M,MeshBasicMaterial:M,DoubleSide:2,SRGBColorSpace:'srgb',
  PointLight:class extends O{constructor(c,i){super();this.isPointLight=true;this.intensity=i}}};
const byRoom=room=>arrivals.filter(e=>e[4]===room);
const flush=()=>new Promise(r=>setTimeout(r,0));
function room(){
  const context={window:{},Math,Promise,setTimeout};vm.runInNewContext(source,context);
  const scene=new O(),interactables=[],notices=[],player={pos:new V(),radius:.42},loads=[],viewed=[];
  const r=context.window.createMapRoom({THREE,scene,MAT:{wood:new M({}),darkWood:new M({}),brass:new M({})},player,interactables,canvasTexture:()=>({dispose(){disposed++}}),bookMaterial:()=>new M({}),
    findBook:id=>({id,title:'Book '+id,author:'A'}),arrivals:{voyages:byRoom('map-voyages').map(e=>e[0]),makers:byRoom('map-makers').map(e=>e[0]),lands:byRoom('map-lands').map(e=>e[0])},
    showNotice:t=>notices.push(t),playSample:()=>{},move:(x,z)=>player.pos.set(x,0,z),analytics:{track:(name,props)=>viewed.push([name,props])},
    fetchJson:()=>Promise.resolve(manifest),loadTexture:(url,ok)=>{loads.push(url);ok({image:{width:400,height:300},dispose(){disposed++}})}});
  return {r,scene,interactables,notices,player,loads,viewed};
}

test('the Map Room loads before the game and is wired in like the other rooms behind doors',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);assert(order.indexOf('map-room.js')>=0&&order.indexOf('map-room.js')<order.indexOf('game.js'));
  assert.match(game,/const mapRoom=window\.createMapRoom\?\.\(/);assert.match(game,/\['map-room','The map room'\]/);assert.match(game,/maps:'map-room'/);
  assert.match(game,/'map-room':mapRoom&&\(\(\)=>mapRoom\.enter\(\)\)/);assert.match(game,/mapRoom\?\.update\(t\)/);assert.match(game,/!mapRoom\.viewer\.isOpen&&preMapActive\(\)/,'nothing walks while a map is down');
  for(const key of ['map-voyages','map-makers','map-lands']){assert.match(fs.readFileSync('scripts/new-books.mjs','utf8'),new RegExp(`'${key}'`));assert.match(fs.readFileSync('scripts/book-pages.mjs','utf8'),new RegExp(`'${key}':'The Map Room'`))}
  assert.match(fs.readFileSync('room-ambience.js','utf8'),/'map-room':\{/);
  const analytics=fs.readFileSync('analytics.js','utf8');assert.match(analytics,/'Map Viewed'/);assert.match(analytics,/map: label/);
});

test('every map has a card, a public-domain image in two sizes, and a place in the room',()=>{
  const {r}=room(),keys=[...r.hang.map(h=>h[0]),...r.table.map(t=>t[0])];
  assert.equal(new Set(keys).size,keys.length,'each map hangs once');assert.deepEqual([...keys].sort(),Object.keys(r.maps).sort());
  const fetched=[...fetcher.matchAll(/key: '([a-z-]+)'/g)].map(m=>m[1]);assert.deepEqual([...fetched].sort(),[...keys].sort(),'scripts/fetch-maps.mjs fetches each of them');
  for(const key of keys){
    const [title,maker,note]=r.maps[key];assert(title&&maker,key);
    assert.equal(note.split(/(?<=[a-z0-9”’)I][.!?])\s+(?=[A-ZÁÉÍÓÚ“])/).length,3,`${key}: a card of three sentences`);
    const info=manifest[key];assert(info,`${key} is in assets/maps/maps.json`);assert.match(info.licence,/public domain|^pd|cc0/i,`${key}: public domain`);
    assert(info.drawn||/^https:\/\/commons\.wikimedia\.org\//.test(info.page),`${key}: credited to its Commons page`);
    for(const file of [`assets/maps/${key}.jpg`,`assets/maps/${key}-wall.jpg`]){assert(fs.existsSync(file),file);assert(fs.statSync(file).size<1.2e6,`${file} is small enough for phones`)}
  }
  const total=fs.readdirSync('assets/maps').reduce((n,f)=>n+fs.statSync('assets/maps/'+f).size,0);assert(total<16e6,'all the maps together stay modest');
});

test('every new book on its shelves has a note of three sentences, and each shelf fits',()=>{
  const maps=arrivals.filter(e=>/^map-/.test(e[4]));assert(maps.length>=20);
  for(const [,title,,,,note] of maps)assert.equal(note.split(/(?<=[a-z0-9”’)I][.!?])\s+(?=[A-ZÁÉÍÓÚŒ“])/).length,3,`${title}: three sentences`);
  const {r}=room();for(const group of r.groups){const all=new Set([...group.ids,...byRoom('map-'+group.key).map(e=>e[0])]);assert(all.size<=({voyages:14,makers:8,lands:16})[group.key],group.key);
    for(const id of group.ids)assert(fs.readdirSync('book').some(f=>f.startsWith(id+'-')),`${id} is already in the library`)}
});

test('the door is in the west wing’s north wall, clear of its bookcase and doorway, and the room is well away from the others',()=>{
  const {r}=room();assert.equal(r.door.z,-13.45);assert.equal(r.door.yaw,0);
  assert(r.door.x<-20.3,'clear of the wing’s doorway from the Grand Hall');assert(r.door.x>-22.5,'clear of the wing’s bookcase (x −23.5 to −32.5)');
  for(const [x,z] of [[-330,20],[-330,-60],[-330,100],[-330,-140],[-330,-205],[-330,-290],[-410,100],[-470,100],[-420,182],[-240,-60],[-240,-20],[-180,-24]])assert(Math.hypot(r.room.cx-x,r.room.cz-z)>45,`away from ${x}, ${z}`);
});

test('the room builds on approach, hangs its maps, and is freed after',async()=>{
  const {r,scene,interactables,notices,player,loads}=room();const doorOnly=scene.children.length;
  player.pos.set(r.door.x,0,r.door.z+3);r.update(1);assert.equal(r.built,true);await flush();
  let lights=0;scene.traverse(o=>{if(o.isPointLight)lights++});assert(lights<=2,'a lamp over the table and one before the north wall');
  assert.deepEqual([...new Set(r.books.map(b=>b.userData.shelf))].sort(),['lands','makers','voyages']);
  assert.equal(r.frames.length,Object.keys(r.maps).length);assert.equal(loads.length,Object.keys(manifest).length,'each wall copy is loaded once');assert(loads.every(u=>/-wall\.jpg$/.test(u)));
  for(const f of r.frames){const {cx,cz,w,d,h}=r.room,p=f.g.position;assert(Math.abs(p.x-cx)<=w/2&&Math.abs(p.z-cz)<=d/2&&p.y>.9&&p.y+f.face.scale.y/2<h-.1,`${f.key} fits on its wall`);
    assert(f.face.scale.x<=f.maxW+1e-9&&f.face.scale.y<=f.maxH+1e-9,`${f.key} keeps within its space`)}
  r.interact(interactables.find(o=>o.userData.type==='map-door'));assert(r.contains(player.pos.x,player.pos.z));assert.match(notices.at(-1),/^The Map Room/);assert(r.allowed(player.pos.x,player.pos.z));
  r.interact(interactables.find(o=>o.userData.type==='map-exit'));assert(!r.contains(player.pos.x,player.pos.z));player.pos.set(0,0,0);disposed=0;r.update(40);
  assert.equal(r.built,false);assert.equal(scene.children.length,doorOnly);assert(disposed>60);assert(interactables.some(o=>o.userData.type==='map-door'));
  assert(!interactables.some(o=>o.userData.type==='map-view'),'the maps go with the room');
});

test('a map on the wall can be taken down into the viewer, which loads the large copy only then',async()=>{
  const {r,interactables,player,viewed}=room();player.pos.set(r.door.x,0,r.door.z+3);r.update(1);await flush();
  // The viewer is a page over the library; here it is only checked for what it is given.
  assert.match(source,/role','dialog'/);assert.match(source,/aria-modal','true'/);assert.match(source,/e\.key==='Escape'|k==='Escape'/);assert.match(source,/addEventListener\('wheel'/);assert.match(source,/pointers\.size===2/,'pinch to zoom');
  assert.match(source,/\$\{base\}\$\{key\}\.jpg/,'the large copy only when looked at');assert.match(source,/Wikimedia Commons/);
  const frame=interactables.find(o=>o.userData.type==='map-view'&&o.userData.key==='snow');assert(frame,'the cholera map on the table can be looked at');
  assert.equal(frame.userData.action,'LOOK CLOSELY');assert.match(game,/onViewerOpen:\(\)=>\{dragging=false;for\(const k in keys\)keys\[k\]=false/);
  assert.equal(typeof r.viewer.open,'function');assert.equal(r.viewer.isOpen,false);assert.equal(viewed.length,0);
});
