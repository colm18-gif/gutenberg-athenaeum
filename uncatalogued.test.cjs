const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

// The Uncatalogued (uncatalogued-room.js): built for real, with a stand-in for Three.js that keeps positions and
// parents, beside the staff Sorting Room it opens from (after-dark-expansion.js), so a reader can walk to every book in
// the heaps and every case, and sort a whole lot.
const source=fs.readFileSync('uncatalogued-room.js','utf8'),game=fs.readFileSync('game.js','utf8'),afterDark=fs.readFileSync('after-dark-expansion.js','utf8');

class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){Object.assign(this,{x,y,z});return this}clone(){return new V().set(this.x,this.y,this.z)}copy(v){return this.set(v.x,v.y,v.z)}setScalar(){return this}}
const any=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>0:any,apply:()=>any,construct:()=>any});
function thing(){
  const scale=Object.assign(function(){return proxy},{x:1,y:1,z:1,set(x,y,z){Object.assign(scale,{x,y,z});return scale},setScalar(){return scale}});
  const t={children:[],parent:null,visible:true,position:new V(),scale,userData:{},
    rotation:{x:0,y:0,z:0,set(x,y,z){Object.assign(this,{x,y,z});return this}},quaternion:{clone:()=>({copy(){}}),copy(){}},
    add(...c){for(const x of c){x.removeFromParent?.();x.parent=proxy;t.children.push(x)}return proxy},attach(x){return proxy.add(x)},
    removeFromParent(){if(t.parent)t.parent.children.splice(t.parent.children.indexOf(proxy),1);t.parent=null},
    traverse(fn){fn(proxy);for(const c of t.children)c.traverse?.(fn)}};
  const proxy=new Proxy(t,{get:(o,k)=>k in o?o[k]:typeof k==='symbol'?undefined:any});
  return proxy;
}
const THREE=new Proxy({},{get:()=>function(){return thing()}});
function seeded(seed){return ()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646}}

function room({seed=7,stored={}}={}){
  const store=new Map(Object.entries(stored)),storage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v))};
  const context={window:{},Math,Object,Array,Map,Set,String,Number,parseInt,setTimeout:()=>0};vm.runInNewContext(source,context);
  const interactables=[],notices=[],tracked=[],seats=[],player={pos:new V(),radius:.42,yaw:0};
  const r=context.window.createUncataloguedRoom({THREE,scene:thing(),MAT:any,player,interactables,canvasTexture:()=>thing(),bookMaterial:()=>thing(),
    findBook:id=>({id,title:'Book '+id}),showNotice:t=>notices.push(t),playSample:()=>{},sound:()=>{},storage,random:seeded(seed),
    analytics:{track:(n,p)=>tracked.push([n,p])},registerSeat:(parts,group,at,yaw,data)=>{seats.push(data);return data},
    move:(x,z,yaw)=>{player.pos.set(x,0,z);player.yaw=yaw}});
  return {r,interactables,notices,tracked,seats,player,store};
}
function sortingRoom(){
  const context={window:{},Math,Object,Array,Map,Set,Promise};vm.runInNewContext(afterDark,context);
  const player={pos:new V(),radius:.42},interactables=[];
  const x=context.window.createAfterDarkExpansion({doorKit:null,THREE,scene:thing(),MAT:any,publicStone:any,publicParquet:any,player,camera:thing(),interactables,books:[],
    bookMaterial:()=>thing(),canvasTexture:()=>thing(),showNotice:()=>{},playSample:()=>{},sound:()=>{},move:()=>{},modelTemplate:()=>new Promise(()=>{}),isLowBandwidth:()=>true});
  x.activate(x.rooms.sorting);return x;
}
// Every point a reader can walk to from where they arrive, on a grid a quarter of a metre square.
function reach(r,from){
  const step=.25,seen=new Set(),out=[],key=(i,j)=>i+','+j,queue=[[0,0]];seen.add(key(0,0));
  while(queue.length){const [i,j]=queue.shift(),x=from.x+i*step,z=from.z+j*step;out.push({x,z});
    for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const k=key(i+di,j+dj);if(seen.has(k))continue;seen.add(k);if(r.allowed(from.x+(i+di)*step,from.z+(j+dj)*step))queue.push([i+di,j+dj])}}
  return out;
}
const caseOf=(a,kind)=>a.interactables.find(o=>o.userData.type==='uncat-case'&&o.userData.kind===kind);

test('the door is in the Sorting Room’s west wall, facing in, with open floor before it',()=>{
  const a=room(),sorting=sortingRoom(),S=sorting.rooms.sorting,{door:D}=a.r;
  const door=a.interactables.find(o=>o.userData.type==='uncat-door');assert(door,'the door hangs');
  assert(Math.abs(D.x-(S.cx-S.w/2))<.5,'in the west wall');assert(Math.abs(D.yaw-Math.PI/2)<1e-9,'facing east, into the Sorting Room');
  assert(D.z>S.cz-S.d/2+2&&D.z<S.cz+S.d/2-2,'clear of the corners');
  for(const dx of [1.2,1.6,2.2])assert(sorting.allowed(D.x+dx,D.z),`a reader can stand ${dx} m in front of it`);
  assert(sorting.allowed(D.x+1.6,D.z)&&sorting.zoneAt(D.x+1.6,D.z)===S,'and comes back out into the Sorting Room');
  a.r.interact(door);assert.equal(a.r.built,true);assert(a.r.allowed(a.player.pos.x,a.player.pos.z),'arriving on open floor');
  a.r.interact(a.interactables.find(o=>o.userData.type==='uncat-exit'));assert(Math.abs(a.player.pos.x-(D.x+1.6))<1e-9&&a.player.pos.z===D.z,'back in front of the door');
});

test('a lot is twenty books, four of each kind, and every book and every case can be walked to',()=>{
  for(const seed of [3,7,11,19,23,101]){
    const a=room({seed});a.r.enter();
    const books=a.r.books;assert.equal(books.length,20);assert.equal(new Set(books.map(b=>b.userData.book.id)).size,20,'no book twice');
    for(const kind of a.r.kinds){const n=books.filter(b=>b.userData.kind===kind.key);assert.equal(n.length,4,kind.key);for(const b of n)assert(kind.ids.includes(b.userData.book.id))}
    const R=a.r.room,ground=reach(a.r,a.player.pos);
    for(const b of books){const p=b.position,d=Math.min(...ground.map(g=>Math.hypot(g.x-p.x,g.z-p.z)));
      assert(d<1.6,`seed ${seed}: ${b.userData.book.id} at ${p.x.toFixed(1)}, ${p.z.toFixed(1)} is in reach (${d.toFixed(2)} m)`);
      assert(Math.abs(p.x-R.cx)<R.w/2-.3&&Math.abs(p.z-R.cz)<R.d/2-.3,'inside the room');assert(p.y>0&&p.y<2.6,'within reach of a hand')}
    for(const c of a.r.cases){const x=R.cx+c.x+Math.sin(c.yaw)*.9,z=R.cz+c.z+Math.cos(c.yaw)*.9;
      assert(ground.some(g=>Math.hypot(g.x-x,g.z-z)<.5),`seed ${seed}: a reader can stand before ${c.kind}`)}
  }
});

test('a carried book goes only in its own case, the second wrong try says where, and a whole lot is counted for good',()=>{
  const a=room({stored:{'athenaeum-uncatalogued-lots':'2'}});a.r.enter();
  const books=a.r.books,own={userData:{type:'book',book:{id:1}}};
  assert.match(a.r.accepts(own,caseOf(a,'novels')),/library’s own/,'a catalogued book is not one of these');
  for(const [i,b] of books.entries()){
    const kind=b.userData.kind,other=a.r.kinds.find(k=>k.key!==kind).key,target=caseOf(a,kind);
    if(i===0){const first=a.r.accepts(b,caseOf(a,other)),second=a.r.accepts(b,caseOf(a,other));
      assert.equal(typeof first,'string');assert.doesNotMatch(first,new RegExp(a.r.kinds.find(k=>k.key===kind).name.replace(/[&’]/g,'.')));
      assert.match(second,new RegExp(a.r.kinds.find(k=>k.key===kind).name.replace(/[&’]/g,'.')),'the second time says what it is')}
    assert.equal(a.r.accepts(b,target),true);
    const before=a.r.count(kind),note=target.userData.place(b);assert.equal(typeof note,'string');assert.equal(a.r.count(kind),before+1,'it stands in its case');a.r.update(i+1);
  }
  assert.equal(a.r.sortedCount(),20);assert.equal(a.r.done,true);assert.equal(a.store.get('athenaeum-uncatalogued-lots'),'3');
  assert.match(a.notices.at(-1),/3 lots put in order/);assert(a.tracked.some(([n,p])=>n==='Room Explored'&&p.room==='uncatalogued-sorted'));
  assert.match(a.interactables.find(o=>o.userData.type==='uncat-ledger').userData.author,/20 of 20.*Lots put in order since: 3/);
  // Shelving a book again keeps its place in the case.
  const b=books[0],c=caseOf(a,b.userData.kind);const {x,y}=b.position;c.userData.place(b);assert.deepEqual([b.position.x,b.position.y],[x,y]);
  for(const kind of a.r.kinds){const xs=books.filter(b=>b.userData.kind===kind.key).map(b=>`${b.position.x},${b.position.y}`);assert.equal(new Set(xs).size,4,`${kind.key}: each in its own place`)}
});

test('taking a book from a tower lets it settle, and the room is freed after the reader leaves, with a fresh lot next time',()=>{
  const a=room();a.r.enter();a.r.update(1);
  const b=a.r.books.find(b=>b.userData.tower!=null);assert(b,'some books are on the towers');const t=a.r.towers[b.userData.tower];
  thing().add(b);a.r.update(1.2);assert.equal(t.slumped,true,'the tower settles');
  a.r.interact(a.interactables.find(o=>o.userData.type==='uncat-exit'));a.r.update(2);a.r.update(20);assert.equal(a.r.built,true,'kept while the reader is still by its door');a.player.pos.set(0,0,0);a.r.update(30);a.r.update(60);assert.equal(a.r.built,true,'a book away from its place keeps the room');
  b.userData.home.parent.add(b);a.r.update(61);a.r.update(100);assert.equal(a.r.built,false,'freed once it is back');
  assert(!a.interactables.some(o=>/^uncat-(case|exit|ledger|card)$/.test(o.userData.type)||o.userData.uncatalogued),'its parts go with it');
  assert(a.interactables.some(o=>o.userData.type==='uncat-door'),'the door in the Sorting Room stays');
  a.r.enter();assert.equal(a.r.books.length,20);assert.equal(a.r.sortedCount(),0,'a fresh lot, in a fresh mess');
  assert(a.seats.length>=1&&a.seats[0].bookIds.length===20,'the armchair is a seat, reading from the heaps');
});

test('the room is wired into the library',()=>{
  assert.match(fs.readFileSync('index.html','utf8'),/startupScript\('uncatalogued-room\.js'\)/);
  assert.match(game,/uncatalogued:uncatalogued&&\(\(\)=>uncatalogued\.enter\(\)\)/,'a ?room= link');
  assert.match(game,/\['uncatalogued','The Uncatalogued'\]/,'in the journal');
  assert.match(game,/uncatalogued\?\.contains\(x,z\)\)return 'uncatalogued'/,'a place of its own');
  assert.match(game,/object\.userData\?\.type!=='uncat-case'/,'a case can be aimed at while carrying a book');
  assert.match(game,/typeof data\.place==='function'\)\{placedNote=data\.place\(bm\)\}/,'placeSelected lets the case stand the book in it');
  assert.match(game,/uncatalogued\.accepts\(selected,focus\)/);assert.match(game,/uncatalogued\.atExit\(\)\)\{returnSelected\(false\);uncatalogued\.leave\(true\)/,'carrying a book does not trap the reader');
  // The carrying wrapper must come after game.js's own, which would otherwise set every carried book down on the case.
  assert(game.indexOf('const preUncatCarry=interact')>game.indexOf('const carriedBookInteract=interact'));
  assert.match(fs.readFileSync('room-ambience.js','utf8'),/'uncatalogued':\{/);
  assert.match(fs.readFileSync('exploration.js','utf8'),/uncatalogued:\['[^']+','afterdark-sorting'\]/);
  // Clear of every other room's centre the library knows.
  const centres=[...new Set([...fs.readdirSync('.').filter(f=>f.endsWith('.js')&&f!=='uncatalogued-room.js')].flatMap(f=>[...fs.readFileSync(f,'utf8').matchAll(/\bc?x:(-?\d{3,4}),\s*c?z:(-?\d{2,4})/g)].map(m=>[+m[1],+m[2]])))];
  const R=room().r.room;for(const [x,z] of centres)assert(Math.hypot(x-R.cx,z-R.cz)>150,`clear of ${x}, ${z}`);
});
