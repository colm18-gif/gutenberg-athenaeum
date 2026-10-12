const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const zlib=require('node:zlib');

const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8'),source=fs.readFileSync('within-room.js','utf8');
const arrivals=(()=>{const c={window:{}};vm.runInNewContext(fs.readFileSync('data/new-books.js','utf8'),c);return c.window.ATHENAEUM_NEW_BOOKS})();
const byRoom=room=>arrivals.filter(e=>e[4]===room).map(e=>e[0]);

class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){Object.assign(this,{x,y,z});return this}clone(){return new V().set(this.x,this.y,this.z)}}
class O{constructor(){this.children=[];this.parent=null;this.visible=true;this.position=new V();this.scale=new V().set(1,1,1);this.rotation={x:0,y:0,z:0,order:'XYZ',set(x,y,z){Object.assign(this,{x,y,z})}};this.quaternion={clone:()=>({})};this.userData={}}
  add(...m){for(const c of m){c.parent=this;this.children.push(c)}return this}removeFromParent(){if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1);this.parent=null}traverse(fn){fn(this);for(const c of this.children)c.traverse(fn)}}
class Mesh extends O{constructor(g,m){super();this.geometry=g;this.material=m}}
const G=class{dispose(){}},M=class{constructor(p){Object.assign(this,p)}dispose(){}};
const THREE={Group:O,Mesh,Vector3:V,BoxGeometry:G,CylinderGeometry:G,PlaneGeometry:G,SphereGeometry:G,MeshStandardMaterial:M,MeshBasicMaterial:M,DoubleSide:2,RepeatWrapping:1000,
  PointLight:class extends O{constructor(c,i){super();this.isPointLight=true;this.isLight=true;this.intensity=i}}};
const MAT={wood:new M({}),darkWood:new M({}),brass:new M({})};
function room({search='',stored=null}={}){
  const store=new Map(stored?[[stored,'1']]:[]),storage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
  const context={window:{},Math,location:{search}};vm.runInNewContext(source,context);
  const scene=new O(),interactables=[],notices=[],player={pos:new V(),radius:.42},tracked=[],seats=[],opened=[],colliders=[];
  const r=context.window.createWithinRoom({THREE,scene,MAT,player,interactables,canvasTexture:()=>({dispose(){}}),bookMaterial:()=>new M({}),
    findBook:id=>({id,title:'Book '+id,author:'A'}),arrivals:{copperfield:byRoom('within-copperfield'),read:byRoom('within-read'),lectern:byRoom('within-lectern')},
    showNotice:t=>notices.push(t),playSample:()=>{},move:(x,z)=>player.pos.set(x,0,z),analytics:{track:(n,p)=>tracked.push([n,p])},storage,
    collider:(...a)=>colliders.push(a),openBook:(id,passage)=>{opened.push([id,passage]);return true},
    registerSeat:()=>{const data={};seats.push(data);return data}});
  return {r,scene,interactables,notices,player,tracked,seats,opened,colliders,store};
}
const find=(a,type)=>a.interactables.find(o=>o.userData.type===type);
const letters=text=>String(text).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const bundled=id=>{const file=`texts/bundled-gzip/pg${id}.txt.gz`;return fs.existsSync(file)?letters(zlib.gunzipSync(fs.readFileSync(file)).toString('utf8')):null};

test('the room loads before the game and is wired in like the other rooms behind doors',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);
  assert(order.indexOf('within-room.js')>=0&&order.indexOf('within-room.js')<order.indexOf('game.js'));
  assert.match(game,/const withinRoom=window\.createWithinRoom\?\.\(/);assert.match(game,/\['within-room','The room of books within books'\]/);
  for(const alias of ['within','imaginary','card-catalogue'])assert.match(game,new RegExp(`'?${alias}'?:'within-room'`));
  assert.match(game,/'within-room':withinRoom&&\(\(\)=>withinRoom\.enter\(\)\)/);assert.match(game,/withinRoom\?\.update\(t\)/);assert.match(game,/if\(withinRoom\?\.contains\(x,z\)\)return 'within-room'/);
  assert.match(game,/pendingPassage/,'a book that never was opens the real one at its page');
  assert.match(fs.readFileSync('room-ambience.js','utf8'),/'within-room':\{beds:/);
  const pages=fs.readFileSync('scripts/book-pages.mjs','utf8'),resolver=fs.readFileSync('scripts/new-books.mjs','utf8');
  for(const key of ['within-copperfield','within-read','within-lectern','within-hosts']){assert.match(resolver,new RegExp(`'${key}'`));assert.match(pages,new RegExp(`'${key}':'The Room of Books Within Books'`))}
  assert.match(pages,/'The Room of Books Within Books':'within'/);
});

test('the card catalogue stands on the hall’s plain west wall, clear of the wing door and the gramophone, and the room is far from the others',()=>{
  const {r,colliders}=room(),c=r.cabinet;
  assert(c.x-c.d/2>=-18.75-.01,'in front of the wall’s face');assert.equal(c.yaw,Math.PI/2,'facing into the hall');
  assert(c.z-c.w/2>6.02+.2,'clear of the wing door’s leaf when it slides open');assert(c.z+c.w/2<9.3,'clear of the gramophone');assert(c.z+c.w/2<12.9-1,'well clear of the Austen Room’s door');
  assert.equal(colliders.length,1,'the hall’s readers walk round it');
  const {cx,cz,w,d}=r.room;
  for(const [ox,oz,ow,od] of [[500,-160,16,14],[500,-300,15,13],[500,60,18,16],[500,220,14,12],[340,30,36,36],[384,-20,20,10],[300,-70,18,16],[620,120,68,68],[-330,-420,20,20]])
    assert(Math.abs(cx-ox)>(w+ow)/2+60||Math.abs(cz-oz)>(d+od)/2+60,`well clear of ${ox}, ${oz}`);
});

test('a drawer holds a card for a book that never was; the next goes on into the room, and stays found',()=>{
  const a=room();const drawer=find(a,'within-drawer');assert(drawer);assert.equal(a.r.built,false);
  a.r.interact(drawer);assert.match(a.notices.at(-1),/Shelf mark: none/);assert.equal(a.r.found,false);
  a.r.interact(drawer);assert.equal(a.r.found,true);assert.match(a.notices.at(-1),/further than the cabinet is deep/);
  assert.equal(a.store.get('athenaeum-within-found'),'1');assert.deepEqual(JSON.stringify(a.tracked.at(-1)),JSON.stringify(['Secret Found',{secret:'within-catalogue'}]));
  for(let t=.1;t<3;t+=.1)a.r.update(t);
  assert(a.r.contains(a.player.pos.x,a.player.pos.z),'through the drawer into the room');assert(a.r.allowed(a.player.pos.x,a.player.pos.z),'onto open floor');
  assert.deepEqual(JSON.stringify(a.tracked.at(-1)),JSON.stringify(['Room Explored',{room:'within-room'}]));
  const b=room({stored:'athenaeum-within-found'});b.r.interact(find(b,'within-drawer'));assert.match(b.notices.at(-1),/room at the back of it/,'found once, found for good');
  const c=room({search:'?within'});assert.equal(c.r.found,true,'?within finds it');
});

test('inside: the books that never were, the real books read in books, the lectern, two seats and the way back',()=>{
  const a=room();a.r.enter();assert.equal(a.r.built,true);
  assert.equal(a.r.props.length,a.r.never.length,'every book that never was is on the west wall');
  for(const g of a.r.props)assert(g.position.x<a.r.room.cx,'on the west wall');
  const shelves=group=>a.r.books.filter(m=>m.userData.shelf===group);
  assert(shelves('copperfield').length>=8,'David Copperfield’s father’s books');assert(shelves('read').length>=8);assert.equal(shelves('lectern').length,1,'Heimskringla on the lectern');
  for(const m of a.r.books){if(m.userData.shelf!=='lectern')assert(a.r.contains(m.position.x,m.position.z),'every book is inside the room');assert(m.userData.within)}
  assert.equal(a.seats.length,2);
  assert(a.interactables.some(o=>/parchment/i.test(o.userData.title||'')),'Saknussemm’s parchment');
  const lamps=[];a.scene.traverse(o=>{if(o.isPointLight)lamps.push(o)});assert.equal(lamps.length,1,'one lamp');
  for(const m of a.r.books)assert(a.r.readBy(m.userData.book.id),`who read ${m.userData.book.id} is said`);
  a.r.interact(find(a,'within-exit'));assert(!a.r.contains(a.player.pos.x,a.player.pos.z),'back to the Grand Hall');
  assert(Math.abs(a.player.pos.x-(a.r.cabinet.x+1.7))<.01&&Math.abs(a.player.pos.z-a.r.cabinet.z)<.01,'standing in front of the catalogue');
  a.player.pos.set(0,0,0);a.r.update(100);assert.equal(a.r.built,false,'freed once the reader has gone');for(const lamp of lamps)assert.equal(lamp.userData.freed,true);
  assert(!a.interactables.some(o=>/^within-(card|exit|book)$/.test(o.userData.type)),'its parts go with it');assert(find(a,'within-drawer'),'but the catalogue stays');
});

test('reading a card, then reading it again, opens the real book at the page; the secret editions are not given away',()=>{
  const a=room();a.r.enter();
  for(const b of a.r.never){
    const prop=a.interactables.find(o=>o.userData.type==='within-book'&&o.userData.key===b.key);assert(prop,b.key);
    a.r.interact(prop);assert(a.notices.at(-1).includes(b.card),`${b.key}: its card`);assert.equal(a.opened.length,0);
    a.r.interact(prop);
    if(b.hidden){assert.equal(a.opened.length,0,`${b.key} stays where it has to be found`);assert.match(b.card,/keeps it where it has to be found/)}
    else{assert.deepEqual(JSON.stringify(a.opened.pop()),JSON.stringify([b.host,b.passage]))}
  }
});

test('every quotation on the cards is in the book it comes from',()=>{
  const {r}=room();let checked=0;
  for(const b of r.never){
    const text=bundled(b.host);if(!text)continue;
    if(b.passage)assert(text.includes(letters(b.passage)),`${b.key}: “${b.passage}” is in ${b.hostTitle}`);
    for(const [,quote] of b.card.matchAll(/“([^”]+)”/g)){assert(text.includes(letters(quote)),`${b.key}: “${quote}” is in ${b.hostTitle}`);checked++}
  }
  const verne=bundled(18857);if(verne){for(const [,quote] of source.match(/parchment:\['A scrap of parchment','([^']+)'\]/)[1].matchAll(/“([^”]+)”/g))assert(verne.includes(letters(quote).replace(/^read backwards in latin /,'')),quote);checked++}
  assert(checked>=8,`checked ${checked} quotations against the bundled texts`);
});

test('the room’s new books are held nowhere else, and each has a note of three sentences',()=>{
  const ours=arrivals.filter(e=>/^within-/.test(e[4]));assert(ours.length>=12);
  const elsewhere=new Set(arrivals.filter(e=>!/^within-/.test(e[4])).map(e=>e[0]));
  for(const [id,title,,,,note] of ours){
    assert(Number.isInteger(id),`${title} has its number`);assert(!elsewhere.has(id),`${title} is on no other shelf`);
    assert.equal(note.split(/(?<=[a-z0-9”’)I][.!?])\s+(?=[A-ZÁÉÍÓÚŒ“])/).length,3,`${title}: three sentences`);
  }
  assert.equal(byRoom('within-lectern').length,1,'one book on the lectern');assert.equal(JSON.stringify(byRoom("within-lectern")),"[598]");
  const {r}=room();
  for(const b of r.never)if(!b.hidden)assert(b.host&&b.passage,`${b.key} names its book and its page`);
  for(const id of [...byRoom('within-read'),...byRoom('within-copperfield')])assert(r.reads[id],`who read ${id} is said`);
});
