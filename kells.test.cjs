const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8'),source=fs.readFileSync('kells-book.js','utf8'),room=fs.readFileSync('irish-room.js','utf8'),fetcher=fs.readFileSync('scripts/fetch-book-pages.mjs','utf8');
const manifest=JSON.parse(fs.readFileSync('assets/kells/kells.json','utf8'));
const book=(()=>{const context={window:{},Math,setTimeout};vm.runInNewContext(fs.readFileSync('fine-books.js','utf8'),context);vm.runInNewContext(source,context);return context.window.createKellsBook({THREE:{},renderer:{}})})();

class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){Object.assign(this,{x,y,z});return this}clone(){return new V().set(this.x,this.y,this.z)}}
class O{constructor(){this.children=[];this.parent=null;this.position=new V();this.scale=new V().set(1,1,1);this.rotation={x:0,y:0,z:0,order:'XYZ',set(x,y,z){Object.assign(this,{x,y,z})}};this.quaternion={clone:()=>({})};this.userData={};this.visible=true}
  add(...m){for(const c of m){c.parent=this;this.children.push(c)}return this}removeFromParent(){if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1);this.parent=null}traverse(fn){fn(this);this.children.forEach(c=>c.traverse(fn))}}
class Mesh extends O{constructor(g,m){super();this.geometry=g;this.material=m}}
const G=class{dispose(){}},M=class{constructor(p){Object.assign(this,p)}dispose(){}};
const THREE={Group:O,Mesh,Vector3:V,BoxGeometry:G,CylinderGeometry:G,SphereGeometry:G,PlaneGeometry:G,ConeGeometry:G,TorusGeometry:G,MeshStandardMaterial:M,MeshBasicMaterial:M,DoubleSide:2,RepeatWrapping:1,PointLight:class extends O{}};
function irishRoom(stored={}){
  const context={window:{},Math};vm.runInNewContext(room,context);
  const scene=new O(),interactables=[],notices=[],tracked=[],opened=[],player={pos:new V(),radius:.42},storage={getItem:k=>stored[k]??null,setItem:(k,v)=>{stored[k]=v}};
  const closedBook=()=>{const parts=[new Mesh(new G(),new M({})),new Mesh(new G(),new M({}))];const group=new O();group.add(...parts);return {group,parts,dispose(){}}};
  const kells={open:()=>opened.push('kells'),closedBook,folios:book.folios},durrow={open:()=>opened.push('durrow'),closedBook};
  const r=context.window.createIrishRoom({THREE,scene,MAT:{wood:new M({}),darkWood:new M({}),brass:new M({})},player,interactables,canvasTexture:()=>({dispose(){},repeat:{set(){}}}),bookMaterial:()=>new M({}),
    findBook:id=>({id,title:'Book '+id,author:'A'}),arrivals:{},showNotice:t=>notices.push(t),playSample:()=>{},move:(x,z)=>player.pos.set(x,0,z),analytics:{track:(n,p)=>tracked.push([n,p])},kells,durrow,storage});
  return {r,interactables,notices,tracked,opened,stored,player};
}

test('the Book of Kells loads before the game, is handed to the Irish Room, and stops the world while it is open',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);assert(order.indexOf('kells-book.js')>0&&order.indexOf('kells-book.js')<order.indexOf('game.js'));
  assert.match(game,/const kellsBook=window\.createKellsBook\?\.\(/);assert.match(game,/kells:kellsBook/);
  assert.match(game,/const fineBookOpen=\(\)=>!!\(kellsBook\?\.isOpen\|\|durrowBook\?\.isOpen\|\|kelmscottBook\?\.isOpen\|\|vesaliusBook\?\.isOpen\)/);
  assert.match(game,/worldIsCovered=function\(\)\{return fineBookOpen\(\)\|\|preFineCovered\(\)\}/,'the library does not draw the world under the open book');
  assert.match(game,/gameActive=function\(\)\{return !fineBookOpen\(\)&&preFineActive\(\)\}/,'nothing walks while the book is open');
  assert.match(fs.readFileSync('analytics.js','utf8'),/'Secret Found'/);assert(fs.existsSync('assets/fonts/uncial-antiqua-latin-400-normal.woff2')&&fs.existsSync('assets/fonts/OFL-Uncial-Antiqua.txt'));
});

test('every page of the facsimile has a card, a public-domain photograph, and a place in the book',()=>{
  const block=fetcher.slice(fetcher.indexOf('kells: {'),fetcher.indexOf('durrow: {')),folios=Object.keys(book.folios),fetched=[...block.matchAll(/key: '(\d{3}[rv])'/g)].map(m=>m[1]);
  assert.equal(folios.length,18);assert.deepEqual(fetched,folios,'scripts/fetch-book-pages.mjs fetches the same pages, in the same order');
  for(const key of folios){
    assert(fs.existsSync(`assets/kells/${key}.jpg`),`${key}.jpg`);assert.match(manifest[key]?.licence||'',/public domain|^pd|cc0/i,`${key} is in the public domain`);
    assert.match(manifest[key].page,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    const [label,title,note]=book.folios[key];assert.equal(label,`Folio ${Number(key.slice(0,3))}${key[3]}`);assert(title&&note.length>40);
  }
  // In manuscript order.
  const order=folios.map(k=>Number(k.slice(0,3))+(k[3]==='v'?.5:0));assert.deepEqual([...order].sort((a,b)=>a-b),order);
  assert.equal(new Set(book.faces).size,book.faces.length);assert.equal(book.faces.length,2*book.pages);
  for(const key of folios)assert(book.faces.includes(key),`${key} is bound in`);
});

test('the leaves turn into spreads, with the manuscript’s own facing pages facing',()=>{
  assert.deepEqual([...book.spreadAt(0)],[null,'cover']);assert.deepEqual([...book.spreadAt(1)],['paste-front','title']);
  assert.deepEqual([...book.spreadAt(book.pages)],['colophon','paste-back']);
  const spreads=Array.from({length:book.pages},(_,n)=>book.spreadAt(n+1).join('|'));
  for(const pair of ['028v|029r','032v|033r'])assert(spreads.includes(pair),`${pair} face each other`);
});

test('the Book of Kells is on show in the middle of the Irish Room, open in a lit glass case, for anyone to turn',()=>{
  const a=irishRoom();a.r.enter();const {room:R}=a.r;
  const shown=a.interactables.filter(o=>o.userData.type==='irish-kells');assert(shown.length>=4,'the case, its glass, its pages and its card all open the book');
  const at=shown[0].parent.position;assert(Math.abs(at.x-R.cx)<.01&&Math.abs(at.z-R.cz)<1.5,'in the middle of the room');
  assert(!a.r.allowed(at.x,at.z)&&a.r.allowed(at.x,at.z+1.4),'the reader walks round it and can stand before it');
  assert.match(shown[0].userData.author,/18 of its pages/);
  a.r.interact(shown[0]);assert.deepEqual(a.opened,['kells']);
  assert.match(room,/page\('032v',-1\),right=page\('033r',1\)/,'it lies open at a real opening of the manuscript');
  for(const key of ['032v','033r'])assert(fs.existsSync(`assets/kells/${key}.jpg`));
});

test('the Book of Durrow lies hidden under a sod by the hearth until the sod is lifted, and then stays found',()=>{
  const a=irishRoom();a.r.enter();
  const sod=a.interactables.find(o=>o.userData.type==='irish-sod');assert(sod,'the sod is there to be lifted');
  assert(!a.interactables.some(o=>o.userData.type==='irish-durrow'),'the book cannot be found through the floor');
  assert(a.r.allowed(sod.position.x,sod.position.z+1.2),'the reader can stand by it');
  assert.equal(a.r.interact(sod),true);
  assert(a.interactables.some(o=>o.userData.type==='irish-durrow'),'lifting the sod uncovers the book');assert(!a.interactables.includes(sod));
  assert.equal(a.stored['athenaeum-durrow-found'],'1');assert.equal(JSON.stringify(a.tracked.at(-1)),JSON.stringify(['Secret Found',{secret:'irish-durrow'}]));assert.match(a.notices.at(-1),/Book of Durrow/);
  a.r.interact(a.interactables.find(o=>o.userData.type==='irish-durrow'));assert.deepEqual(a.opened,['durrow'],'and the book opens');
  const b=irishRoom({'athenaeum-durrow-found':'1'});b.r.enter();
  assert(b.interactables.some(o=>o.userData.type==='irish-durrow')&&!b.interactables.some(o=>o.userData.type==='irish-sod'),'found once, found for good');
  b.r.unload();assert(!b.interactables.some(o=>o.userData.type==='irish-durrow'||o.userData.type==='irish-kells'),'and freed with the room');
});
