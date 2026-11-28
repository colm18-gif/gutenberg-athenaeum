// The Waterford room (waterford-room.js): built for real with a stand-in for Three.js, reached from the end of the
// Britain and Ireland quarter's hall, its shelves filled from the catalogue, its pictures on disk, and Declan's bell rung.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('waterford-room.js','utf8');
const game=fs.readFileSync('game.js','utf8'),index=fs.readFileSync('index.html','utf8'),ambience=fs.readFileSync('room-ambience.js','utf8'),exploration=fs.readFileSync('exploration.js','utf8'),passages=fs.readFileSync('passages.js','utf8');
const load=(file,name)=>{const c={window:{}};vm.runInNewContext(fs.readFileSync(file,'utf8'),c);return c.window[name]};
const arrivals=load('data/new-books.js','ATHENAEUM_NEW_BOOKS');

class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){Object.assign(this,{x,y,z});return this}clone(){return new V().set(this.x,this.y,this.z)}copy(v){return this.set(v.x,v.y,v.z)}}
const any=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>0:any,apply:()=>any,construct:()=>any});
function thing(){
  let self;const scale=Object.assign(function(){return self},{x:1,y:1,z:1,set(){return scale},setScalar(){return scale}});
  const t={children:[],parent:null,visible:true,position:new V(),scale,userData:{},rotation:{x:0,y:0,z:0,set(){return this}},quaternion:{clone:()=>({})},
    add(...c){for(const x of c){x.parent=self;t.children.push(x)}return self},removeFromParent(){if(t.parent)t.parent.children.splice(t.parent.children.indexOf(self),1);t.parent=null},
    traverse(fn){fn(self);for(const c of t.children)c.traverse?.(fn)}};
  return self=new Proxy(t,{get:(o,k)=>k in o?o[k]:typeof k==='symbol'?undefined:any,set:(o,k,v)=>{o[k]=v;return true}});
}
const THREE=new Proxy({},{get:()=>function(){return thing()}});
const KEYS=['deise','lismore','people','history','tower'];
const listed=room=>arrivals.filter(e=>e[4]===room).map((e,i)=>typeof e[0]==='number'?e[0]:90000+i);
function room({stored=[],search=''}={}){
  const context={window:{},Math,Object,Array,Number,String,Set,Date};vm.runInNewContext(source,context);
  const player={pos:new V(),radius:.42},interactables=[],notices=[],seats=[],tones=[],pictures=[],scene=thing(),store=new Map(stored.map(k=>[k,'1']));
  const r=context.window.createWaterfordRoom({THREE,scene,MAT:new Proxy({},{get:()=>thing()}),player,interactables,canvasTexture:()=>thing(),showNotice:t=>notices.push(t),playSample(){},
    move:(x,z)=>player.pos.set(x,0,z),bookMaterial:()=>thing(),findBook:id=>({id,title:'Book '+id}),registerSeat:(parts,group,at,yaw,data)=>seats.push(data),tone:(...a)=>tones.push(a),
    showPicture:p=>pictures.push(p),arrivals:Object.fromEntries(KEYS.map(k=>[k,listed('waterford-'+k)])),storage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)},search});
  return {r,player,interactables,notices,seats,tones,pictures,store};
}

test('it loads before game.js and is wired in like the other rooms',()=>{
  const order=[...index.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);
  assert.ok(order.includes('waterford-room.js')&&order.indexOf('waterford-room.js')<order.indexOf('passages.js'));
  for(const term of ['waterfordRoom.floorAt','waterfordRoom.allowed','waterfordRoom.interact','waterfordRoom?.update(t)',"if(waterfordRoom?.contains(x,z))return 'waterford-room'","'waterford-room':waterfordRoom&&(()=>waterfordRoom.enter())","['waterford-room','The Waterford room']","waterford:'waterford-room'",'waterford:waterfordRoom'])
    assert.ok(game.includes(term),term);
  assert.ok(game.indexOf('const waterfordRoom=')<game.indexOf('const passages='),'made before the back ways and quarters');
  assert.ok(ambience.includes("'waterford-room':{beds:"),'it has an ambience');
  assert.ok(exploration.includes("'waterford-room':["),'the despatch tube has a hint for it');
});

test('its door is at the end of the Britain and Ireland quarter’s hall, in its own south wall, clear of the corners',()=>{
  assert.match(passages,/\{room:'waterford',label:'THE WATERFORD ROOM',wall:'south',at:-4\}\]/);
  const {r}=room(),R=r.room;assert.ok(Math.abs(-4)+1.05<R.w/2-.3,'clear of the corner');
  // The reader comes in facing the window, on open floor.
  r.activate();const a=r.arrival;assert.ok(r.contains(a.x,a.z)&&r.allowed(a.x,a.z),'arrives on open floor');assert.equal(a.yaw,0);
  // Far from every other room (the islands are at x 2600, the Indian room at 2800, the Bindery and camera obscura at 3300).
  for(const [x,z] of [[2600,900],[2600,600],[2600,1200],[2800,-300],[3300,300],[3300,-300],[2200,300]])assert.ok(Math.hypot(R.cx-x,R.cz-z)>250,`clear of ${x},${z}`);
});

test('its four shelves are filled from the catalogue, every book with a librarian’s note, and the library’s own Raleigh on Lismore’s',()=>{
  for(const key of ['deise','lismore','people','history']){const rows=arrivals.filter(e=>e[4]==='waterford-'+key);assert.ok(rows.length>=2,`${key} has books`);
    for(const row of rows)assert.ok(row[5].split(/(?<=[.!?])\s+/).length>=3,`${row[1]} has a three-sentence note`)}
  assert.ok(arrivals.some(e=>e[0]==='ws:The Sword Speech'&&e[4]==='waterford-people'),'Meagher’s Sword Speech, from English Wikisource');
  const {r}=room();assert.ok(r.groups.find(g=>g.key==='lismore').ids.includes(2272));
  r.activate();const shelved=r.books.map(b=>b.userData.shelf);for(const key of ['deise','lismore','people','history'])assert.ok(shelved.includes(key),key);
  assert.ok(!shelved.includes('tower'),'the Round Towers wait for the bell');
  // Raleigh's Guiana is here for Lismore, not for its subject, and its copy says so.
  const guiana=r.ownNotes[2272];assert.ok(guiana&&/Lismore/.test(guiana)&&/1602/.test(guiana)&&!/[“”]/.test(guiana));
  assert.ok(game.includes('waterfordRoom.ownNotes?.[d.book.id]'),'the room’s note is shown when the book is taken down');
});

test('its pictures are on disk, and open large',()=>{
  const {r,interactables,pictures}=room();
  for(const p of Object.values(r.pictures))for(const suffix of ['','-wall'])assert.ok(fs.existsSync(`assets/pictures/${p.file}${suffix}.jpg`),`${p.file}${suffix}.jpg`);
  r.activate();const maclise=interactables.find(o=>o.userData.type==='waterford-picture'&&o.userData.picture==='strongbow');assert.ok(maclise);
  assert.ok(r.interact(maclise));assert.match(pictures[0].src,/waterford-strongbow\.jpg$/);assert.match(pictures[0].credit,/Public domain/);
});

test('ringing Declan’s bell shows Ardmore, leaves the Round Towers on the table, and is found for good',()=>{
  const w=room(),{r,interactables,notices,tones,store}=w;r.activate();
  const bell=interactables.find(o=>o.userData.type==='waterford-bell');assert.ok(bell);assert.equal(bell.userData.action,'RING');
  assert.ok(r.interact(bell));assert.ok(tones.length>=3,'an old bell, with its overtones');assert.match(notices.at(-1),/Ardmore/);
  assert.equal(store.get('athenaeum-waterford-ardmore'),'1');assert.ok(r.books.some(b=>b.userData.shelf==='tower'),'the book is on the table');
  assert.equal(bell.userData.title,'Declan’s bell');
  const again=room({stored:['athenaeum-waterford-ardmore']});again.r.activate();assert.ok(again.r.books.some(b=>b.userData.shelf==='tower'),'found for good');
  const linked=room({search:'?ardmore'});linked.r.activate();assert.ok(linked.r.found);
});

test('its cards keep to what is attested and quote nobody',()=>{
  const {r}=room();
  for(const [title,text] of Object.values(r.cards)){assert.ok(!/[“”]/.test(text),`${title} quotes nobody`);assert.ok(text.length>40)}
  assert.match(r.cards.flag[1],/some historians now doubt it was the first/,'the first tricolour is contested, and the card says so');
  assert.match(r.cards.strongbow[1],/not a record/,'Maclise’s wedding is an imagining');
});
