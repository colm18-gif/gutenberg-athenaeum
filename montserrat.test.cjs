// The ships in bottles (ships-in-bottles.js) and Montserrat (montserrat-room.js): built for real with a stand-in for
// Three.js; the shelf in the Long Corridor, the bottle that leads to the island and back, its shelves filled from the
// catalogue, Equiano's words and his deed read against the library's own text, and the cards kept to what is so.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const zlib=require('node:zlib');
const source=fs.readFileSync('montserrat-room.js','utf8'),shelfSource=fs.readFileSync('ships-in-bottles.js','utf8'),corridorSource=fs.readFileSync('long-corridor.js','utf8');
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
  const context={window:{},Math,Object,Array,Number,String,Set,Date};for(const s of [corridorSource,shelfSource,source])vm.runInNewContext(s,context);
  const player={pos:new V(),radius:.42},interactables=[],notices=[],seats=[],shown=[],tones=[],scene=thing(),store=new Map(stored.map(k=>[k,'1']));
  const shared={THREE,scene,MAT:new Proxy({},{get:()=>thing()}),player,interactables,canvasTexture:()=>thing(),showNotice:t=>notices.push(t),playSample(){},move:(x,z)=>player.pos.set(x,0,z)};
  const corridor=context.window.createLongCorridor(shared);
  const bottles=context.window.createShipsInBottles({...shared,corridor});
  const r=context.window.createMontserratRoom({...shared,bottles,bookMaterial:()=>thing(),findBook:id=>({id,title:'Book '+id}),registerSeat:(parts,group,at,yaw,data)=>seats.push(data),showPicture:p=>shown.push(p),tone:(...a)=>tones.push(a),
    arrivals:{voices:byRoom('montserrat-voices'),islands:byRoom('montserrat-islands'),travellers:byRoom('montserrat-travellers')},
    storage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)},search});
  return {r,corridor,bottles,player,interactables,notices,seats,shown,tones,store,find:type=>interactables.find(o=>o.userData.type===type)};
}

test('they load before game.js and are wired into the library',()=>{
  const order=[...index.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]),at=f=>order.indexOf(f);
  assert.ok(at('long-corridor.js')<at('ships-in-bottles.js')&&at('ships-in-bottles.js')<at('montserrat-room.js')&&at('montserrat-room.js')<at('game.js'));
  for(const term of ['montserratRoom.floorAt','montserratRoom.allowed','montserratRoom.interact','montserratRoom.update','shipsInBottles.interact(focus)',"if(montserratRoom?.contains(x,z))return 'montserrat'",
    "montserrat:montserratRoom&&(()=>montserratRoom.enter())","'emerald-isle':'montserrat'","['montserrat','Montserrat']","bottles:shipsInBottles"])assert.ok(game.includes(term),term);
  for(const key of ['voices','islands','travellers'])assert.ok(game.includes(`arrivalIds('montserrat-${key}')`),key);
  assert.ok(ambience.includes("montserrat:{beds:"),'it has an ambience');for(const sound of ['treefrog','whoop'])assert.ok(ambience.includes(`      ${sound}:()=>buffer(`),sound);
  assert.match(source,/if\(inside\|\|near&&\(root\|\|window\.libraryMayBuild\?\.\(\)!==false\)\)activate\(\)/,'it asks before building ahead of the reader');
  assert.equal((source.match(/new THREE\.PointLight/g)||[]).length,1,'one lamp');assert.equal((shelfSource.match(/PointLight/g)||[]).length,0,'the shelf has none');
  // Not a room behind an ordinary door: the Wandering Door does not go there.
  assert.ok(!/destinations:\[[^\n]*'montserrat'/.test(game),'the Wandering Door does not open on the island');
});

test('the shelf is in the corridor’s fourth east bay, on bare wall, and stays when the corridor is freed',()=>{
  const h=island(),c=h.corridor,b=h.bottles.bay;
  assert.equal(b.side,'east');assert.equal(b.bay,3);assert.equal(b.z,c.bayZ(3));
  for(const taken of [c.pictureBay,c.celsusDoor,c.scroogeDoor])assert.ok(!(taken.side==='east'&&taken.bay===3),'nothing else is in that bay');
  assert.match(corridorSource,/if\(side===BOTTLE_BAY\.side&&k===BOTTLE_BAY\.bay\)continue/,'no panel behind the shelf');
  assert.deepEqual(Array.from(h.bottles.bottles,x=>x.key),['montserrat'],'one bottle, and it leads somewhere');
  const bottle=h.find('bottle');assert.ok(bottle,'its bottle is on the shelf at startup');
  c.enter();c.update(1);h.player.pos.set(0,0,0);c.update(60);assert.ok(!c.built);assert.ok(h.interactables.includes(bottle),'the shelf outlasts the corridor');
  // A reader stands in front of the bottle on open floor, facing the shelf.
  const p=h.bottles.standBefore('montserrat');assert.ok(c.contains(p.x,p.z)&&c.allowed(p.x,p.z));assert.ok(Math.abs(p.z-(b.z+h.bottles.slotX(0)))<1e-9,'in front of its slot');
  assert.ok(p.x<b.x,'west of the shelf, in the corridor');assert.ok(Math.abs(Math.cos(p.yaw-b.yaw)-1)<1e-9,'facing it, as the shelf faces out');
});

test('looking into the bottle goes to the island, and its own bottle brings the reader back to the shelf',()=>{
  const h=island();h.bottles.interact(h.find('bottle'));
  assert.ok(h.r.built);assert.equal(h.r.zoneAt(h.player.pos.x,h.player.pos.z),'montserrat');assert.ok(h.r.allowed(h.player.pos.x,h.player.pos.z),'the reader arrives on open floor');
  assert.match(h.notices.at(-1),/Montserrat, at night/);
  const exit=h.find('montserrat-exit');assert.ok(exit);h.r.interact(exit);
  assert.ok(h.corridor.contains(h.player.pos.x,h.player.pos.z)&&h.corridor.allowed(h.player.pos.x,h.player.pos.z),'and comes out in the corridor');
  assert.match(source,/THE LONG CORRIDOR',W\/2,40\);c\.font='italic 18px Georgia';c\.fillText\('towards the Grand Hall'/,'its brass plate names the corridor and the way on');
  h.r.update(1);h.player.pos.set(0,0,0);h.r.update(40);assert.ok(!h.r.built,'freed a while after the reader has gone');
  assert.ok(!h.interactables.some(o=>o.userData.montserrat||String(o.userData.type).startsWith('montserrat-')));assert.ok(h.find('bottle'),'the corridor’s bottle stays');
  // It is built ahead while the reader stands at the shelf.
  const g=island(),p=g.bottles.standBefore('montserrat');g.player.pos.set(p.x,0,p.z);g.r.update(1);assert.ok(g.r.built);
});

test('the walls hold the Caribbean around the island, every book resolved and bundled, with open floor to reach them',()=>{
  const h=island();h.r.enter();const {groups}=h.r.catalogue(),ids=k=>Array.from(groups.find(g=>g.key===k).books,b=>b.id);
  assert.deepEqual(ids('voices').slice(0,2),[15399,23031],'the library’s own Equiano and Seacole first');
  for(const id of h.r.own)assert.ok(game.includes(`[${id},'`)||arrivals.some(e=>e[0]===id),`${id} is in the catalogue`);
  assert.ok(ids('voices').includes(4068)&&ids('travellers').includes(32728),'Froude and the answer to him are both here');
  for(const g of groups){assert.ok(g.books.length>=3,g.key);assert.ok(byRoom('montserrat-'+g.key).length+g.ids.length<=g.max,`${g.key} fits its shelf`)}
  const mine=arrivals.filter(e=>String(e[4]).startsWith('montserrat-'));assert.equal(mine.length,11);
  for(const e of mine){assert.ok(resolved[e[1]]?.id===e[0],`${e[1]} resolved`);assert.ok(fs.existsSync(`texts/bundled-gzip/pg${e[0]}.txt.gz`),`${e[1]} bundled`);assert.ok(e[5].split(/[.!?]”?\s/).length>=3,`${e[1]} has a note`)}
  assert.equal(h.r.books.length,groups.reduce((n,g)=>n+g.books.length,0));
  assert.equal(h.seats.length,3,'two chairs at the table and the rocking chair');assert.ok(h.seats.every(s=>s.bookIds.length>=13),'each opens one of the house’s books');
  const {cx,cz}=h.r.room;for(const [dx,dz] of [[-3.6,0],[3.6,-1.5],[3.6,1.8],[0,-2.6],[-3.1,-2.6],[2.6,-2.6],[0,4.5],[-3.2,5.2]])assert.ok(h.r.allowed(cx+dx,cz+dz),`(${dx}, ${dz}) is open floor`);
  assert.ok(!h.r.allowed(cx,cz+h.r.room.d/2+h.r.verandah),'the rail is the edge');
});

test('Equiano’s words and his deed are as his book prints them, and every quotation on a card is one of them',()=>{
  const book=letters(text(15399)),h=island();
  for(const [key,line] of Object.entries(h.r.equiano))assert.ok(book.includes(letters(line)),`${key}: ${line}`);
  assert.ok(book.includes(letters(h.r.manumission)),'the deed, whole');assert.ok(book.includes(letters('Montserrat.--To all men unto whom these presents shall come')));
  assert.ok(book.includes(letters('seventy pounds current money of the said island'))&&book.includes(letters('forty pounds sterling')),'both sums are his');
  assert.ok(book.includes('brimstonehill')&&book.includes(letters('some few miles from the town of Plymouth')),'the hill above Plymouth');
  for(const [key,[,body]] of Object.entries(h.r.cards))for(const [,quoted] of body.matchAll(/“([^”]+)”/g))assert.ok(Object.values(h.r.equiano).includes(quoted),`${key}: “${quoted}”`);
});

test('the cards keep to what is so: servants bound for years, the enslaved for life, and no “Irish slaves”',()=>{
  const h=island(),cards=Object.values(h.r.cards).map(([t,b])=>t+' '+b).join(' '),notes=arrivals.filter(e=>String(e[4]).startsWith('montserrat-')).map(e=>e[5]).join(' ');
  for(const words of [cards,notes,source])assert.doesNotMatch(words,/irish slaves?|white slaves?|slaves? from ireland|enslaved irish/i);
  assert.match(h.r.cards.irish[1],/indentured servants, bound to work for a master for a term of years/);assert.match(h.r.cards.irish[1],/enslaved for life, and so were their children/);
  assert.match(h.r.cards.patrick[1],/17 March 1768/);assert.match(h.r.cards.rising[1],/betrayed/);assert.match(h.r.cards.sign[1],/1493/);
  assert.match(h.r.cards.islands[1],/No book in the library is about Montserrat itself/,'the shelf says why it is the islands around');
});

test('the pictures are public-domain files the workflow fetched, and looked at, open large',()=>{
  const credits=JSON.parse(fs.readFileSync('assets/pictures/pictures.json','utf8')),script=fs.readFileSync('scripts/fetch-maps.mjs','utf8');
  const h=island();h.r.enter();
  for(const [key,p] of Object.entries(h.r.pictures)){assert.ok(script.includes(`key: '${p.file}'`),p.file);for(const f of [`${p.file}.jpg`,`${p.file}-wall.jpg`])assert.ok(fs.existsSync(`assets/pictures/${f}`),f);
    assert.match(JSON.stringify(credits[p.file]),/public domain/i,`${p.file} is public domain`);assert.match(p.credit,/Public domain/);
    if(key==='frog')continue;// the frog's picture is the frog's, and it hides until found
    const frame=h.interactables.find(o=>o.userData.type==='montserrat-picture'&&o.userData.picture===key);assert.ok(frame,key);h.r.interact(frame);assert.equal(h.shown.at(-1).src,`assets/pictures/${p.file}.jpg`)}
  assert.match(credits['montserrat-stamp'].description,/1929/);assert.match(h.r.cards.stamp[1],/Erin/);
});

test('the secret: something whoops among the ferns, and it is the mountain chicken, for good',()=>{
  const h=island();h.r.enter();const fern=h.find('montserrat-ferns');assert.ok(fern);assert.ok(!h.r.found);
  for(let t=0;t<60;t+=.5)h.r.update(t);assert.ok(h.tones.length>=2,'it calls before it is found');
  h.r.interact(fern);assert.ok(h.r.found);assert.equal(h.store.get('athenaeum-montserrat-mountain-chicken'),'1');assert.match(h.notices.at(-1),/mountain chicken/);assert.match(h.notices.at(-1),/Montserrat and Dominica/);
  const frog=h.interactables.find(o=>o.userData.picture==='frog');h.r.interact(frog);assert.equal(h.shown.at(-1).src,'assets/pictures/montserrat-frog.jpg');
  const n=h.tones.length;for(let t=60;t<200;t+=.5)h.r.update(t);assert.equal(h.tones.length,n,'and is quiet once found');
  for(const again of [island({stored:['athenaeum-montserrat-mountain-chicken']}),island({search:'?room=montserrat&mountainchicken'})]){again.r.enter();assert.ok(again.r.found)}
});
