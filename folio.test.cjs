const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const crypto=require('node:crypto');

const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8'),source=fs.readFileSync('set-texts-room.js','utf8'),fetcher=fs.readFileSync('scripts/fetch-book-pages.mjs','utf8');
const context={window:{},Math,setTimeout};for(const f of ['whole-book.js','fine-books.js','folio-book.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),context);
const spec=context.window.FOLIO_BOOK,book=context.window.createFolioBook({THREE:{},renderer:{}});
const manifestFile='assets/folio/folio.json',manifest=fs.existsSync(manifestFile)?JSON.parse(fs.readFileSync(manifestFile,'utf8')):{};

class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){Object.assign(this,{x,y,z});return this}clone(){return new V().set(this.x,this.y,this.z)}}
class O{constructor(){this.children=[];this.parent=null;this.position=new V();this.scale=new V().set(1,1,1);this.rotation={x:0,y:0,z:0,order:'XYZ',set(x,y,z){Object.assign(this,{x,y,z})}};this.quaternion={clone:()=>({})};this.userData={}}
  add(...m){for(const c of m){c.parent=this;this.children.push(c)}return this}removeFromParent(){if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1);this.parent=null}traverse(fn){fn(this);this.children.forEach(c=>c.traverse(fn))}}
class Mesh extends O{constructor(g,m){super();this.geometry=g;this.material=m}}
const G=class{dispose(){}},M=class{constructor(p){Object.assign(this,p)}dispose(){}};
const loaded=[];
const THREE={Group:O,Mesh,Vector3:V,BoxGeometry:G,CylinderGeometry:G,PlaneGeometry:G,MeshStandardMaterial:M,MeshBasicMaterial:M,PointLight:class extends O{},SRGBColorSpace:'srgb',
  TextureLoader:class{load(url){loaded.push(url);return {dispose(){}}}}};
function room(folio){
  const c={window:{},Math};vm.runInNewContext(source,c);
  const scene=new O(),interactables=[],notices=[],player={pos:new V(),radius:.42};
  const r=c.window.createSetTextsRoom({THREE,scene,MAT:{wood:new M({}),darkWood:new M({})},player,interactables,canvasTexture:()=>({dispose(){}}),bookMaterial:()=>new M({}),
    findBook:id=>({id,title:'Book '+id,author:'A'}),arrivals:[],showNotice:t=>notices.push(t),playSample:()=>{},move:(x,z)=>player.pos.set(x,0,z),registerSeat:()=>({}),folio});
  return {r,interactables,notices,player};
}

test('the First Folio loads before the game and is wired in like the other fine books',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);
  assert(order.indexOf('fine-books.js')<order.indexOf('folio-book.js')&&order.indexOf('folio-book.js')<order.indexOf('game.js'));
  assert.match(game,/folioBook=window\.createFolioBook\?\.\(fineBookOptions\)/);assert.match(game,/\|\|folioBook\?\.isOpen\)/,'the world stops while the book is open');
  assert(game.indexOf('let folioBook=null')<game.indexOf('const setTextsRoom='),'the room is given the book before it is made');
  assert.match(game,/folio:\{open:\(\)=>folioBook\?\.open\(\),get folios\(\)\{return folioBook\?\.folios\}\}/);
  assert.match(game,/folio:'set-texts-room','first-folio':'set-texts-room'/,'?room=folio goes to it');
});

test('every page of the Folio has a card and a public-domain photograph from the one complete copy, and the book is bound in real openings',()=>{
  const folios=Object.keys(book.folios),block=fetcher.slice(fetcher.indexOf('BOOKS.folio = {')),fetched=[...block.matchAll(/key: '([a-z0-9-]+)', files: \[scan\((\d+)\)\]/g)];
  assert.deepEqual(fetched.map(m=>m[1]),folios,'scripts/fetch-book-pages.mjs fetches the same pages, in the same order');
  for(const [,key,n] of fetched)assert.equal(spec.SCAN[key],Number(n),`${key} is scan ${n} in both`);
  for(const key of folios){
    const [label,title,note]=book.folios[key];assert(label&&title&&note.length>60,`${key} has a card`);
    assert(manifest[key],`${key} has been fetched`);assert(fs.existsSync(`assets/folio/${key}.jpg`),`${key}.jpg`);assert.match(manifest[key].licence,/public domain|^pd|cc0/i,`${key} is free to use`);
    assert.equal(manifest[key].file,`First Folio, Shakespeare - ${String(spec.SCAN[key]).padStart(4,'0')}.jpg`,`${key} is the scan's page`);
  }
  assert.equal(new Set(book.faces).size,book.faces.length);assert.equal(book.faces.length,2*book.pages);for(const key of folios)assert(book.faces.includes(key),`${key} is bound in`);
  assert.deepEqual([...book.spreadAt(1)],['paste-front','f-title']);assert.deepEqual([...book.spreadAt(2)],['reader','title'],'the engraving faces Jonson’s lines, as in the book');
  assert.deepEqual([...book.spreadAt(book.pages)],['about','paste-back']);
  // A real opening is a verso and the recto after it: the scan's next photograph. The Actors and the Catalogue are
  // the one exception (the leaf between them has a blank side), and the drawn note faces the Tempest.
  for(let n=2;n<=book.pages;n++){const [l,r]=book.spreadAt(n);if(spec.SCAN[l]&&spec.SCAN[r]&&l!=='actors')assert.equal(spec.SCAN[r],spec.SCAN[l]+1,`${l} and ${r} face each other in the book`)}
  // The Comedies' page n is scan n + 18, and each card names the page printed on it.
  for(const key of folios){const m=/^Comedies, page (\d+)$/.exec(book.folios[key][0]);if(m)assert.equal(spec.SCAN[key],Number(m[1])+18,key)}
  assert(!fs.existsSync('assets/folio/survey'),'the survey pictures are gone');
});

test('the thirty-six plays: eighteen first printed in the Folio',()=>{
  const plays=spec.PLAYS.flatMap(([,list])=>list);assert.equal(plays.length,36);assert.equal(plays.filter(p=>p[1]).length,18);
  for(const t of ['Macbeth','The Tempest','Julius Caesar','Twelfth Night'])assert(plays.find(p=>p[0]===t)[1],`${t} was first printed in it`);
  for(const t of ['Romeo and Juliet','Hamlet','Much Ado About Nothing','The Merchant of Venice'])assert(!plays.find(p=>p[0]===t)[1],`${t} had been printed before`);
});

test('the whole book reads every page of the same copy from Commons',()=>{
  const w=spec.whole;assert.equal(w.pages,907);assert.equal(w.hashes.length,2*w.pages);assert.deepEqual([...w.widths],[960],'every photograph is at least 960 wide, and none 1280');
  for(const n of [1,3,19,450,906,907]){const name=w.series(n).replace(/ /g,'_'),md5=crypto.createHash('md5').update(name).digest('hex');
    assert.equal(w.hashes.slice(2*(n-1),2*n),md5.slice(0,2),`page ${n}'s folders`);
    assert.equal(context.window.wholeBookPageUrl(w,n,960),`https://upload.wikimedia.org/wikipedia/commons/thumb/${md5[0]}/${md5.slice(0,2)}/${encodeURIComponent(name)}/960px-${encodeURIComponent(name)}`)}
  for(const [label,n] of w.marks)assert(label&&Number.isInteger(n)&&n>=1&&n<=w.pages,label);
  for(const key of Object.keys(book.folios))assert.equal(w.pageFor(key),spec.SCAN[key],`the facsimile opens the whole book at ${key}`);
  assert.equal(w.pageFor('plays'),null,'a drawn page has no place in the scan');
});

test('the Folio lies open under glass in the Set Texts Room, its small copies only, and opens from the case',()=>{
  loaded.length=0;const opened=[];const a=room({open:()=>opened.push(1),folios:book.folios});
  a.r.interact(a.interactables.find(o=>o.userData.type==='settexts-door'));
  const parts=a.interactables.filter(o=>o.userData.type==='settexts-folio');assert(parts.length>=4,'the case answers');assert.match(parts[0].userData.author,/25 of its pages/);
  assert.deepEqual(loaded,['assets/folio/reader-case.jpg','assets/folio/title-case.jpg'],'the room never loads a full page');
  for(const key of ['reader','title'])assert(fs.existsSync(`assets/folio/${key}-case.jpg`),`${key}-case.jpg`);assert.match(fetcher,/display: \['reader', 'title'\]/);
  a.r.interact(parts[0]);assert.equal(opened.length,1);
  const {cx,cz,d}=a.r.room;assert(!a.r.allowed(cx,cz-2.6),'the case stands in the room');assert(a.r.allowed(cx,cz-2.6+1.3),'a reader can stand before it');
  assert(a.r.allowed(cx,cz-d/2+.3+1.3),'and still before the novels');assert(a.r.allowed(cx,cz+d/2-1.4),'the reader arrives on open floor');
  const b=room(null);b.r.interact(b.interactables.find(o=>o.userData.type==='settexts-door'));b.r.interact(b.interactables.find(o=>o.userData.type==='settexts-folio'));assert.match(b.notices.at(-1),/locked/);
});
