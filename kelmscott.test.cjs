const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8'),source=fs.readFileSync('kelmscott-book.js','utf8'),room=fs.readFileSync('periodicals-room.js','utf8'),fetcher=fs.readFileSync('scripts/fetch-book-pages.mjs','utf8');
const manifest=JSON.parse(fs.readFileSync('assets/kelmscott/kelmscott.json','utf8'));
const book=(()=>{const context={window:{},Math,setTimeout};vm.runInNewContext(fs.readFileSync('fine-books.js','utf8'),context);vm.runInNewContext(source,context);return context.window.createKelmscottBook({THREE:{},renderer:{}})})();

class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){Object.assign(this,{x,y,z});return this}clone(){return new V().set(this.x,this.y,this.z)}}
class O{constructor(){this.children=[];this.parent=null;this.position=new V();this.scale=new V().set(1,1,1);this.rotation={x:0,y:0,z:0,order:'XYZ',set(x,y,z){Object.assign(this,{x,y,z})}};this.quaternion={clone:()=>({})};this.userData={};this.visible=true}
  add(...m){for(const c of m){c.parent=this;this.children.push(c)}return this}removeFromParent(){if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1);this.parent=null}traverse(fn){fn(this);this.children.forEach(c=>c.traverse(fn))}}
class Mesh extends O{constructor(g,m){super();this.geometry=g;this.material=m}}
const G=class{dispose(){}},M=class{constructor(p){Object.assign(this,p);this.color={set(){}}}dispose(){}};
const THREE={Group:O,Mesh,Vector3:V,BoxGeometry:G,CylinderGeometry:G,SphereGeometry:G,PlaneGeometry:G,ConeGeometry:G,CircleGeometry:G,TorusGeometry:G,MeshStandardMaterial:M,MeshBasicMaterial:M,DoubleSide:2,PointLight:class extends O{}};
function periodicalsRoom(stored={}){
  const context={window:{},Math};vm.runInNewContext(room,context);
  const scene=new O(),interactables=[],notices=[],tracked=[],opened=[],player={pos:new V(),radius:.42},storage={getItem:k=>stored[k]??null,setItem:(k,v)=>{stored[k]=v}};
  const kelmscott={open:()=>opened.push(1),closedBook:()=>{const parts=[new Mesh(new G(),new M({})),new Mesh(new G(),new M({}))];const group=new O();group.add(...parts);return {group,parts,dispose(){}}}};
  const r=context.window.createPeriodicalsRoom({THREE,scene,MAT:{wood:new M({}),darkWood:new M({}),brass:new M({})},player,interactables,canvasTexture:()=>({dispose(){}}),bookMaterial:()=>new M({}),
    findBook:id=>({id,title:'Book '+id,author:'A'}),arrivals:()=>[],showNotice:t=>notices.push(t),playSample:()=>{},move:(x,z)=>player.pos.set(x,0,z),analytics:{track:(n,p)=>tracked.push([n,p])},kelmscott,storage});
  return {r,interactables,notices,tracked,opened,stored,player};
}

test('the Kelmscott Chaucer loads before the game and is handed to the Periodicals Room',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);
  assert(order.indexOf('fine-books.js')>=0&&order.indexOf('fine-books.js')<order.indexOf('kelmscott-book.js')&&order.indexOf('kelmscott-book.js')<order.indexOf('game.js'));
  assert.match(game,/kelmscottBook=window\.createKelmscottBook\?\.\(fineBookOptions\)/);assert.match(game,/kelmscott:kelmscottBook/);
});

test('every page of the facsimile has a card, a public-domain photograph, and a place in the book',()=>{
  const folios=Object.keys(book.folios);assert(folios.length>=10,'at least ten of its pages');
  const block=fetcher.slice(fetcher.indexOf('kelmscott: {'),fetcher.indexOf('vesalius: {')),fetched=[...block.matchAll(/key: '([a-z0-9-]+)'/g)].map(m=>m[1]);
  assert.deepEqual(fetched,folios,'scripts/fetch-book-pages.mjs fetches the same pages, in the same order');
  for(const key of folios){
    assert(fs.existsSync(`assets/kelmscott/${key}.jpg`),`${key}.jpg`);assert.match(manifest[key]?.licence||'',/public domain|^pd|cc0/i,`${key} is in the public domain`);
    assert.match(manifest[key].page,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    const [label,title,note]=book.folios[key];assert(label&&title&&note.length>40,`${key} has a card`);
  }
  assert.equal(new Set(book.faces).size,book.faces.length);assert.equal(book.faces.length,2*book.pages);
  for(const key of folios)assert(book.faces.includes(key),`${key} is bound in`);
  assert.deepEqual([...book.spreadAt(1)],['paste-front','title']);assert.deepEqual([...book.spreadAt(book.pages)],['colophon','paste-back']);
  assert(book.sheetUrl&&fs.existsSync(book.sheetUrl),'the press prints a real page');
  assert(!fs.existsSync('assets/kelmscott/survey'),'the survey pictures are gone');
});

test('the Albion press prints the Chaucer’s first page and gives up the book, which then stays found',()=>{
  const a=periodicalsRoom();a.r.enter();
  const press=a.interactables.find(o=>o.userData.type==='periodicals-press');assert(press,'the press is there');assert.equal(press.userData.action,'PULL THE BAR');
  assert(!a.interactables.some(o=>o.userData.type==='periodicals-kelmscott'),'the book is not found before the bar is pulled');
  assert(a.r.allowed(-330-5.6+1.3,100+3.1),'the reader can stand at the bar');
  assert.equal(a.r.interact(press),true);
  for(let t=1;t<6;t+=.1)a.r.update(t);
  assert(a.interactables.some(o=>o.userData.type==='periodicals-kelmscott'),'the pull gives up the book');assert.equal(press.userData.action,'EXAMINE');
  assert.equal(a.stored['athenaeum-kelmscott-found'],'1');assert.equal(JSON.stringify(a.tracked.at(-1)),JSON.stringify(['Secret Found',{secret:'periodicals-kelmscott'}]));assert.match(a.notices.at(-1),/Kelmscott Chaucer/);
  a.r.interact(a.interactables.find(o=>o.userData.type==='periodicals-kelmscott'));assert.equal(a.opened.length,1,'and the book opens');
  const b=periodicalsRoom({'athenaeum-kelmscott-found':'1'});b.r.enter();
  assert(b.interactables.some(o=>o.userData.type==='periodicals-kelmscott'),'found once, found for good');
  b.r.unload();assert(!b.interactables.some(o=>o.userData.type==='periodicals-kelmscott'||o.userData.type==='periodicals-press'),'and freed with the room');
});
