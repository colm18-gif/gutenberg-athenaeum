// Emily Dickinson's room (dickinson-room.js): built for real with a stand-in for Three.js, entered from the Long
// Corridor, its shelves filled from the catalogue, its quotations read against the library's own texts.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const zlib=require('node:zlib');
const source=fs.readFileSync('dickinson-room.js','utf8'),corridorSource=fs.readFileSync('long-corridor.js','utf8');
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
  const t={children:[],parent:null,visible:true,position:new V(),scale,userData:{},rotation:{x:0,y:0,z:0,set(){return this}},quaternion:{clone:()=>({})},
    add(...c){for(const x of c){x.parent=self;t.children.push(x)}return self},removeFromParent(){if(t.parent)t.parent.children.splice(t.parent.children.indexOf(self),1);t.parent=null},
    traverse(fn){fn(self);for(const c of t.children)c.traverse?.(fn)}};
  return self=new Proxy(t,{get:(o,k)=>k in o?o[k]:typeof k==='symbol'?undefined:any});
}
const THREE=new Proxy({},{get:()=>function(){return thing()}});
function room({stored=[],search='',date=new Date(2026,6,1)}={}){
  const context={window:{},Math,Object,Array,Number,String,Set,Date};vm.runInNewContext(corridorSource,context);vm.runInNewContext(source,context);
  const player={pos:new V(),radius:.42},interactables=[],notices=[],seats=[],shown=[],scene=thing(),store=new Map(stored.map(k=>[k,'1']));
  const shared={THREE,scene,MAT:new Proxy({},{get:()=>thing()}),player,interactables,canvasTexture:()=>thing(),showNotice:t=>notices.push(t),playSample(){},move:(x,z)=>player.pos.set(x,0,z)};
  const corridor=context.window.createLongCorridor(shared);
  const r=context.window.createDickinsonRoom({...shared,corridor,bookMaterial:()=>thing(),findBook:id=>({id,title:'Book '+id}),registerSeat:(parts,group,at,yaw,data)=>seats.push(data),showPicture:p=>shown.push(p),
    arrivals:{poems:byRoom('dickinson-poems'),read:byRoom('dickinson-read'),circle:byRoom('dickinson-circle'),garden:byRoom('dickinson-garden'),drawer:byRoom('dickinson-drawer')},
    storage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)},search,now:()=>date});
  return {r,corridor,player,interactables,notices,seats,shown,store};
}

test('it loads before game.js and is wired into the library',()=>{
  const order=[...index.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);assert.ok(order.indexOf('dickinson-room.js')>order.indexOf('long-corridor.js')&&order.indexOf('dickinson-room.js')<order.indexOf('game.js'));
  for(const term of ['dickinsonRoom.floorAt','dickinsonRoom.allowed','dickinsonRoom.interact','dickinsonRoom.update',"if(dickinsonRoom?.contains(x,z))return 'dickinson-room'","'dickinson-room':dickinsonRoom&&(()=>dickinsonRoom.enter())","dickinson:'dickinson-room'","['dickinson-room','Emily Dickinson’s room']","'dickinson-room','canada-room','lilliput']"])
    assert.ok(game.includes(term),term);
  for(const key of ['poems','read','circle','garden','drawer'])assert.ok(game.includes(`arrivalIds('dickinson-${key}')`),key);
  assert.ok(ambience.includes("'dickinson-room':{beds:"),'it has an ambience');
  assert.match(source,/if\(inside\|\|near&&\(root\|\|window\.libraryMayBuild\?\.\(\)!==false\)\)activate\(\)/,'it asks before building ahead of the reader');
  assert.equal((source.match(/new THREE\.PointLight/g)||[]).length,1,'one lamp');
});

test('its door is in the Long Corridor’s fourth west bay, on bare wall, and stays when the room is freed',()=>{
  const h=room(),c=h.corridor,d=h.r.door;
  assert.deepEqual({side:d.side,bay:d.bay},{side:'west',bay:3});assert.equal(d.z,c.bayZ(3));assert.notEqual(d.bay,c.foodDoor.bay);
  assert.match(corridorSource,/if\(side===DICKINSON_DOOR\.side&&k===DICKINSON_DOOR\.bay\)continue/,'no panel behind the door');
  assert.match(source,/doorKit\.readingRoom\?\.\('EMILY DICKINSON','Amherst · 1830–1886'\)/);assert.match(source,/onward:'towards the Grand Hall',label:'THE LONG CORRIDOR'/);
  const door=h.interactables.find(o=>o.userData.type==='dickinson-door');assert.ok(door,'hung at startup');
  assert.ok(h.r.interact(door));assert.ok(h.r.built);assert.ok(h.r.allowed(h.player.pos.x,h.player.pos.z),'the reader arrives on open floor');
  assert.ok(h.r.interact(h.interactables.find(o=>o.userData.type==='dickinson-exit')));assert.ok(c.contains(h.player.pos.x,h.player.pos.z)&&c.allowed(h.player.pos.x,h.player.pos.z),'and comes out in the corridor');
  h.r.update(1);h.player.pos.set(0,0,0);h.r.update(40);assert.ok(!h.r.built,'freed a while after the reader has gone');assert.ok(h.interactables.includes(door));assert.ok(!h.interactables.some(o=>o.userData.dickinson||o.userData.type==='dickinson-exit'));
});

test('the shelves hold her Poems as first published, her circle, what she read and the garden, all resolved and bundled',()=>{
  const h=room();h.r.enter();const {groups,drawer}=h.r.catalogue(),ids=g=>[...groups].find(x=>x.key===g).books.map(b=>b.id).slice(0,99).reduce((a,x)=>[...a,x],[]);
  assert.deepEqual(ids('poems'),[2678,2679,12241]);assert.deepEqual([...drawer].map(b=>b.id),[12242]);
  assert.deepEqual(ids('read').slice(0,4),[1260,145,2002,6312],'the library’s own Jane Eyre, Middlemarch, the Sonnets and Representative Men first');
  for(const id of h.r.own)assert.ok(game.includes(`[${id},'`)||arrivals.some(e=>e[0]===id),`${id} is in the catalogue`);
  for(const g of groups){assert.ok(g.books.length>=3,g.key);assert.ok(g.books.length<=g.max&&byRoom('dickinson-'+g.key).length+g.ids.length<=g.max,`${g.key} fits its shelf`)}
  const mine=arrivals.filter(e=>String(e[4]).startsWith('dickinson-'));assert.equal(mine.length,16);
  for(const e of mine){assert.ok(resolved[e[1]]?.id===e[0],`${e[1]} resolved`);assert.ok(fs.existsSync(`texts/bundled-gzip/pg${e[0]}.txt.gz`),`${e[1]} bundled`);assert.ok(e[5].split(/[.!?]”?\s/).length>=3,`${e[1]} has a note`)}
  assert.equal(h.r.books.length,groups.reduce((n,g)=>n+g.books.length,0),'every shelf book is in the room, and the drawer’s is not out yet');
  assert.equal(h.seats.length,1);assert.ok(h.seats[0].bookIds.length>=12,'her chair opens one of the room’s books');
  // Every book stands inside the room, and there is open floor in front of the shelves and the case.
  for(const [dx,dz] of [[0,2.6],[-2.5,-2.6],[3.4,-1.6],[3.4,2.6],[-3.3,-2.6],[.2,2.2],[-3.4,2.6]])assert.ok(h.r.allowed(h.r.room.cx+dx,h.r.room.cz+dz),`(${dx}, ${dz}) is open floor`);
});

test('every line of hers is in the library’s Poems, and her letters are as Higginson printed them',()=>{
  const poems=letters(text(12242)),essay=letters(text(68129));
  for(const [key,line] of Object.entries(room().r.lines))assert.ok(poems.includes(letters(line)),`${key}: ${line}`);
  for(const [key,line] of Object.entries(room().r.letters))assert.ok(essay.includes(letters(line)),`${key}: ${line}`);
  // Every “quotation” on a card is one of those, whole.
  const h=room(),known=[...Object.values(h.r.lines),...Object.values(h.r.letters),'Grand go the Years'];
  for(const [key,[,body]] of Object.entries(h.r.cards))for(const [,quoted] of body.matchAll(/“([^”]+)”/g))assert.ok(known.includes(quoted),`${key}: “${quoted}”`);
  assert.ok(poems.includes(letters('Grand go the years in the crescent above them')));assert.ok(essay.includes('daylilies'),'the day-lilies are in his essay');assert.ok(essay.includes('yourgnome'));
  // The herbarium is drawn, and says so; its four flowers each have a poem.
  assert.match(h.r.cards.herbarium[1],/drawn by the library/);assert.match(h.r.cards.herbarium[1],/Houghton Library/);
  for(const s of h.r.specimens)assert.ok(h.r.lines[s.line],s.name);
});

test('the pictures are public-domain files the workflow fetched, and looking at one opens it large',()=>{
  const credits=JSON.parse(fs.readFileSync('assets/pictures/pictures.json','utf8')),script=fs.readFileSync('scripts/fetch-maps.mjs','utf8');
  const h=room();h.r.enter();
  for(const [key,p] of Object.entries(h.r.pictures)){assert.ok(script.includes(`key: '${p.file}'`),p.file);for(const f of [`${p.file}.jpg`,`${p.file}-wall.jpg`])assert.ok(fs.existsSync(`assets/pictures/${f}`),f);
    const entry=Array.isArray(credits)?credits.find(c=>c.key===p.file):credits[p.file];assert.ok(entry,`${p.file} is credited`);assert.match(JSON.stringify(entry),/public domain/i);
    const frame=h.interactables.find(o=>o.userData.type==='dickinson-picture'&&o.userData.picture===key);assert.ok(frame,key);h.r.interact(frame);assert.equal(h.shown.at(-1).src,`assets/pictures/${p.file}.jpg`);assert.match(h.shown.at(-1).credit,/Public domain/)}
});

test('the secret: the bureau’s bottom drawer holds the booklets, and leaves the complete Poems on top, for good',()=>{
  const h=room();h.r.enter();const drawer=()=>h.interactables.find(o=>o.userData.type==='dickinson-drawer'),has=()=>h.r.books.some(b=>b.userData.book.id===12242);
  assert.ok(drawer());assert.ok(!has());assert.equal(drawer().userData.action,'OPEN');
  h.r.interact(drawer());assert.ok(has(),'the Poems are on the bureau');assert.equal(h.store.get('athenaeum-dickinson-drawer'),'1');
  assert.match(h.notices.at(-1),/forty of them/);assert.ok(h.notices.at(-1).includes(h.r.lines.letter));assert.equal(drawer().userData.action,'LOOK');
  for(let t=0;t<3;t+=.1)h.r.update(t);const n=h.r.books.length;h.r.interact(drawer());assert.equal(h.r.books.length,n,'opened once');
  for(const again of [room({stored:['athenaeum-dickinson-drawer']}),room({search:'?room=dickinson&drawer'})]){again.r.enter();assert.ok(again.r.books.some(b=>b.userData.book.id===12242))}
  // The window is snowy from November to February.
  assert.ok(room({date:new Date(2026,11,20)}).r.winter());assert.ok(room({date:new Date(2027,1,10)}).r.winter());assert.ok(!room({date:new Date(2026,5,20)}).r.winter());
});
