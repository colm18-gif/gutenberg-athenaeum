// Pitcairn Island (pitcairn-island.js), the second ship in a bottle: built for real with a stand-in for Three.js; its
// bottle on the Long Corridor's shelf, the square at Adamstown, its shelves filled from the catalogue, every quotation
// read against the library's own texts, and the bell that brings a sail.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const zlib=require('node:zlib');
const source=fs.readFileSync('pitcairn-island.js','utf8'),shelfSource=fs.readFileSync('ships-in-bottles.js','utf8'),corridorSource=fs.readFileSync('long-corridor.js','utf8'),montserratSource=fs.readFileSync('montserrat-room.js','utf8');
const game=fs.readFileSync('game.js','utf8'),index=fs.readFileSync('index.html','utf8'),ambience=fs.readFileSync('room-ambience.js','utf8');
const load=(file,name)=>{const c={window:{}};vm.runInNewContext(fs.readFileSync(file,'utf8'),c);return c.window[name]};
const arrivals=load('data/new-books.js','ATHENAEUM_NEW_BOOKS'),resolved=load('data/new-books-resolved.js','ATHENAEUM_NEW_BOOKS_RESOLVED').books;
const byRoom=room=>arrivals.filter(e=>e[4]===room).map(e=>e[0]);
const text=id=>zlib.gunzipSync(fs.readFileSync(`texts/bundled-gzip/pg${id}.txt.gz`)).toString('utf8');
const letters=s=>s.toLowerCase().replace(/[^a-z]/g,'');

class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){Object.assign(this,{x,y,z});return this}clone(){return new V().set(this.x,this.y,this.z)}copy(v){return this.set(v.x,v.y,v.z)}}
const any=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>0:any,apply:()=>any,construct:()=>any});
function thing(){
  let self;const scale=Object.assign(function(){return self},{x:1,y:1,z:1,set(){return scale}});
  const t={children:[],parent:null,visible:true,position:new V(),scale,userData:{},rotation:{x:0,y:0,z:0,set(){return this}},quaternion:{clone:()=>({})},material:{opacity:1},
    add(...c){for(const x of c){x.parent=self;t.children.push(x)}return self},removeFromParent(){if(t.parent)t.parent.children.splice(t.parent.children.indexOf(self),1);t.parent=null},
    traverse(fn){fn(self);for(const c of t.children)c.traverse?.(fn)}};
  return self=new Proxy(t,{get:(o,k)=>k in o?o[k]:typeof k==='symbol'?undefined:any});
}
const THREE=new Proxy({},{get:()=>function(){return thing()}});
function island({stored=[],search=''}={}){
  const context={window:{},Math,Object,Array,Number,String,Set,Date};for(const s of [corridorSource,shelfSource,montserratSource,source])vm.runInNewContext(s,context);
  const player={pos:new V(),radius:.42},interactables=[],notices=[],seats=[],shown=[],tones=[],scene=thing(),store=new Map(stored.map(k=>[k,'1']));
  const shared={THREE,scene,MAT:new Proxy({},{get:()=>thing()}),player,interactables,canvasTexture:()=>thing(),showNotice:t=>notices.push(t),playSample(){},move:(x,z)=>player.pos.set(x,0,z),bookMaterial:()=>thing(),findBook:id=>({id,title:'Book '+id})};
  const corridor=context.window.createLongCorridor(shared),bottles=context.window.createShipsInBottles({...shared,corridor});
  context.window.createMontserratRoom({...shared,bottles});
  const r=context.window.createPitcairnIsland({...shared,bottles,registerSeat:(parts,group,at,yaw,data)=>seats.push(data),showPicture:p=>shown.push(p),tone:(...a)=>tones.push(a),
    arrivals:{island:byRoom('pitcairn-island'),bounty:byRoom('pitcairn-bounty'),seas:byRoom('pitcairn-seas'),bell:byRoom('pitcairn-bell')},
    storage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)},search});
  return {r,corridor,bottles,player,interactables,notices,seats,shown,tones,store,find:(type,key)=>interactables.find(o=>o.userData.type===type&&(key==null||o.userData.key===key))};
}

test('it loads after Montserrat, before game.js, and is wired into the library',()=>{
  const order=[...index.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]),at=f=>order.indexOf(f);
  assert.ok(at('ships-in-bottles.js')<at('montserrat-room.js')&&at('montserrat-room.js')<at('pitcairn-island.js')&&at('pitcairn-island.js')<at('game.js'),'Montserrat takes the first slot, Pitcairn the second');
  for(const term of ['pitcairnIsland.floorAt','pitcairnIsland.allowed','pitcairnIsland.interact','pitcairnIsland.update',"if(pitcairnIsland?.contains(x,z))return 'pitcairn'",
    "pitcairn:pitcairnIsland&&(()=>pitcairnIsland.enter())","adamstown:'pitcairn'","['pitcairn','Pitcairn Island']"])assert.ok(game.includes(term),term);
  for(const key of ['island','bounty','seas','bell'])assert.ok(game.includes(`arrivalIds('pitcairn-${key}')`),key);
  assert.ok(ambience.includes('pitcairn:{beds:'),'it has an ambience');
  assert.match(source,/if\(inside\|\|near&&\(root\|\|window\.libraryMayBuild\?\.\(\)!==false\)\)activate\(\)/,'it asks before building ahead of the reader');
  assert.equal((source.match(/new THREE\.(Point|Directional|Spot)Light/g)||[]).length,1,'one light, the sun');
});

test('its bottle is the second on the shelf, and looking in goes to the square and back',()=>{
  const h=island();assert.deepEqual(Array.from(h.bottles.bottles,b=>b.key),['montserrat','pitcairn']);
  const bottle=h.find('bottle','pitcairn');assert.ok(bottle);h.bottles.interact(bottle);
  assert.ok(h.r.built);assert.equal(h.r.zoneAt(h.player.pos.x,h.player.pos.z),'pitcairn');assert.ok(h.r.allowed(h.player.pos.x,h.player.pos.z),'the reader arrives on open ground');
  assert.match(h.notices.at(-1),/Pitcairn Island, at dawn/);
  h.r.interact(h.find('pitcairn-exit'));const p=h.player.pos;assert.ok(h.corridor.contains(p.x,p.z)&&h.corridor.allowed(p.x,p.z));
  assert.ok(Math.abs(p.z-(h.bottles.bay.z+h.bottles.slotX(1)))<1e-9,'in front of its own bottle');
  h.r.update(1);h.player.pos.set(0,0,0);h.r.update(40);assert.ok(!h.r.built,'freed after the reader has gone');assert.ok(!h.interactables.some(o=>o.userData.pitcairn||String(o.userData.type).startsWith('pitcairn-')));
  assert.ok(h.find('bottle','pitcairn'),'its bottle stays on the shelf');
});

test('the hall’s shelves hold the island’s story first, every book resolved and bundled, with open ground to reach them',()=>{
  const h=island();h.r.enter();const {groups}=h.r.catalogue(),ids=k=>Array.from(groups.find(g=>g.key===k).books,b=>b.id);
  assert.equal(ids('island')[0],69363,'Rosalind Amelia Young, an islander, first');
  for(const g of groups){assert.ok(g.books.length>=2,g.key);assert.ok(byRoom('pitcairn-'+g.key).length<=g.max,`${g.key} fits its shelf`)}
  const mine=arrivals.filter(e=>String(e[4]).startsWith('pitcairn-'));assert.ok(mine.length>=8);
  for(const e of mine){assert.ok(resolved[e[1]]?.id===e[0],`${e[1]} resolved`);assert.ok(fs.existsSync(`texts/bundled-gzip/pg${e[0]}.txt.gz`),`${e[1]} bundled`);assert.ok(e[5].split(/[.!?]”?\s/).length>=3,`${e[1]} has a note`)}
  assert.equal(h.seats.length,2,'the two benches at the hall table');
  const {cx,cz}=h.r.square;for(const [dx,dz] of [[0,1.6],[-3.6,-3.4],[3.6,-3.4],[0,-4.7],[-1.6,-4.7],[-4.5,0],[4,3],[-2,4.6],[5.5,-0]])assert.ok(h.r.allowed(cx+dx,cz+dz),`(${dx}, ${dz}) is open ground`);
  assert.ok(!h.r.allowed(cx-7,cz-4),'not behind the hall');assert.ok(!h.r.allowed(cx,cz+6.2),'the wall is the edge');
});

test('every quotation is in its book, and every quotation on a card is one of them',()=>{
  const young=letters(text(69363)),bligh=letters(text(20337)),h=island();
  for(const [key,line] of Object.entries(h.r.quotes))assert.ok(young.includes(letters(line))||bligh.includes(letters(line)),`${key}: ${line}`);
  assert.ok(bligh.includes(letters(h.r.quotes.cabin)),'the morning of the mutiny is Bligh’s');
  for(const [key,[,body]] of Object.entries(h.r.cards))for(const [,quoted] of body.matchAll(/“([^”]+)”/g))assert.ok(Object.values(h.r.quotes).includes(quoted),`${key}: “${quoted}”`);
  for(const [,quoted] of source.matchAll(/q\('([a-z]+)'\)/g))assert.ok(h.r.quotes[quoted],quoted);
  assert.match(h.r.cards.landing[1],/some of whom had not come by choice/,'the women’s coming is not made romantic');
  for(const fact of [/1808/,/Topaz/,/1814/])assert.match(h.r.cards.found[1],fact);assert.match(h.r.cards.bible[1],/1839/);assert.match(h.r.cards.bible[1],/1949/);assert.match(h.r.cards.anchor[1],/1957/);
});

test('the pictures are public-domain files the workflow fetched, and looked at, open large',()=>{
  const credits=JSON.parse(fs.readFileSync('assets/pictures/pictures.json','utf8')),script=fs.readFileSync('scripts/fetch-maps.mjs','utf8');
  const h=island();h.r.enter();
  for(const [key,p] of Object.entries(h.r.pictures)){assert.ok(script.includes(`key: '${p.file}'`),p.file);for(const f of [`${p.file}.jpg`,`${p.file}-wall.jpg`])assert.ok(fs.existsSync(`assets/pictures/${f}`),f);
    assert.match(JSON.stringify(credits[p.file]),/public domain/i,`${p.file} is public domain`);assert.match(p.credit,/Public domain/);assert.ok(h.r.cards[p.card],`${key} has a card`);
    const frame=h.interactables.find(o=>o.userData.type==='pitcairn-picture'&&o.userData.picture===key);assert.ok(frame,key);h.r.interact(frame);assert.equal(h.shown.at(-1).src,`assets/pictures/${p.file}.jpg`)}
  for(const k of ['2','5','7','8'])assert.ok(!fs.existsSync(`assets/pictures/pitcairn-stamp-${k}.jpg`)&&!credits[`pitcairn-stamp-${k}`],'the stamps looked at and not used are gone');
});

test('the secret: the bell brings a sail up out of the sea, and leaves a book on its ledge, for good',()=>{
  const h=island();h.r.enter();const bell=h.find('pitcairn-bell');assert.ok(bell);assert.ok(!h.r.found);assert.ok(!h.r.sailing);
  const bookCount=h.r.books.length,hasBell=byRoom('pitcairn-bell').length>0;
  h.r.interact(bell);assert.ok(h.r.found);assert.ok(h.r.sailing);assert.equal(h.store.get('athenaeum-pitcairn-sail'),'1');assert.ok(h.tones.length>=3,'it rings');
  assert.ok(h.notices.at(-1).includes(h.r.quotes.posts),'the frigates of 1814, in the islanders’ words');
  if(hasBell)assert.equal(h.r.books.length,bookCount+1,'a book is left on the ledge');
  for(let t=0;t<10;t+=.1)h.r.update(t);h.r.interact(bell);assert.equal(h.r.books.length,bookCount+(hasBell?1:0),'left once');
  for(const again of [island({stored:['athenaeum-pitcairn-sail']}),island({search:'?room=pitcairn&sailho'})]){again.r.enter();assert.ok(again.r.found);if(hasBell)assert.ok(again.r.books.some(b=>b.userData.shelf==='bell'))}
});
