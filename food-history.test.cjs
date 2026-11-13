// The Gastronomic Athenaeum (food-history-wing.js): its hall and the Ancient Kitchen. The wing is built for real, with a
// stand-in for Three.js that keeps positions, so the doors, the arch and the dormouse jar can be walked and tried.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('food-history-wing.js','utf8');
const game=fs.readFileSync('game.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const ambience=fs.readFileSync('room-ambience.js','utf8');
const load=(file,name)=>{const c={window:{}};vm.runInNewContext(fs.readFileSync(file,'utf8'),c);return c.window[name]};
const list=load('data/new-books.js','ATHENAEUM_NEW_BOOKS');
const food=list.filter(e=>String(e[4]).startsWith('food-'));
const shelfIds=room=>food.filter(e=>e[4]===room).map(e=>e[0]);

class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){Object.assign(this,{x,y,z});return this}clone(){return new V().set(this.x,this.y,this.z)}copy(v){return this.set(v.x,v.y,v.z)}}
const any=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>0:any,apply:()=>any,construct:()=>any});
function thing(){
  let self;
  const scale=Object.assign(function(){return t},{x:1,y:1,z:1,set(x,y,z){Object.assign(scale,{x,y,z});return scale}});
  const t={children:[],parent:null,visible:true,position:new V(),scale,userData:{},
    rotation:{x:0,y:0,z:0,set(x,y,z){Object.assign(this,{x,y,z});return this}},quaternion:{clone:()=>({copy(){}}),copy(){}},
    add(...c){for(const x of c){x.parent=self;t.children.push(x)}return self},removeFromParent(){if(t.parent)t.parent.children.splice(t.parent.children.indexOf(t),1);t.parent=null},
    traverse(fn){fn(t);for(const c of t.children)c.traverse?.(fn)}};
  return self=new Proxy(t,{get:(o,k)=>k in o?o[k]:typeof k==='symbol'?undefined:any});
}
const THREE=new Proxy({},{get:()=>function(){return thing()}});
function wing({search=''}={}){
  const context={window:{},Math,Date,JSON,Set,Map,Object,Array,Number,String,Float32Array,URLSearchParams,location:{search}};
  vm.runInNewContext(source,context);
  const books=new Map(food.map(([id,title,author])=>[id,{id,title,author}]));
  const player={pos:new V(),radius:.42},interactables=[],notices=[],moves=[];
  const arrivals={cookbooks:shelfIds('food-cookbooks'),preservation:shelfIds('food-preservation'),spices:shelfIds('food-spices'),kitchen:shelfIds('food-kitchen'),dormouse:shelfIds('food-dormouse')};
  const w=context.window.createFoodHistoryWing({THREE,scene:thing(),MAT:new Proxy({},{get:()=>thing()}),player,interactables,canvasTexture:()=>thing(),bookMaterial:()=>thing(),
    findBook:id=>books.get(id),arrivals,showNotice:t=>notices.push(t),playSample(){},move:(x,z,yaw)=>{moves.push({x,z,yaw});player.pos.set(x,0,z)}});
  return {w,player,interactables,notices,moves};
}

test('the wing loads before game.js and is wired into the library',()=>{
  assert.ok(index.indexOf("startupScript('food-history-wing.js')")>0);
  assert.ok(index.indexOf("startupScript('food-history-wing.js')")<index.indexOf("startupScript('game.js')"));
  for(const term of ["'food-history':foodHistoryWing","'ancient-kitchen':foodHistoryWing","foodHistoryWing.floorAt","foodHistoryWing.allowed","foodHistoryWing.interact","foodHistoryWing.update","foodHistoryWing?.zoneAt(x,z)"])
    assert.ok(game.includes(term),term);
  assert.match(game,/\['food-history','The Gastronomic Athenaeum'\],\['ancient-kitchen','The Ancient Kitchen'\]/,'both places are in the journal');
  for(const place of ['food-history','ancient-kitchen'])assert.ok(ambience.includes(`'${place}':{beds:`),place+' has an ambience');
});

test('its books are the food-* shelves of data/new-books.js, not numbers typed into the room',()=>{
  assert.doesNotMatch(source,/TITLES|registerBook/);
  for(const room of ['cookbooks','preservation','spices','kitchen','dormouse'])assert.ok(game.includes(`${room}:arrivalIds('food-${room}')`),room);
  // The four numbers first given here named other books (docs/food-history-catalogue.md).
  for(const wrong of [6501,44915])assert.ok(!food.some(e=>e[0]===wrong),wrong);
  const doc=fs.readFileSync('docs/food-history-catalogue.md','utf8');
  for(const [id,title] of food)assert.ok(doc.includes(`| ${id} |`),`${title} (${id}) is in the checked list`);
  for(const room of ['food-cookbooks','food-preservation','food-spices','food-kitchen','food-dormouse'])assert.ok(shelfIds(room).length,room);
  assert.ok(shelfIds('food-preservation').length<=10&&shelfIds('food-spices').length<=10,'the side cases hold two rows of five');
  assert.ok(shelfIds('food-cookbooks').length<=14,'the gallery holds two rows of seven');
});

test('the hall and kitchen are built only when wanted, and freed again',()=>{
  const {w,player}=wing();assert.equal(w.built,false);
  w.enterKitchen();assert.equal(w.built,true);
  player.pos.set(0,0,0);w.update(100,.016);assert.equal(w.built,false,'freed once the reader has been away');
});

test('a reader walks from the hall through the planked door into the kitchen, across the arch and back',()=>{
  const {w,player,interactables,moves}=wing();w.activate();
  const R=w.room,K=w.kitchen,door=interactables.find(o=>o.userData.type==='food-history-kitchen-door');
  assert.ok(door,'the hall has the kitchen door');
  // In the hall, in front of the door, the reader can stand.
  assert.ok(w.allowed(R.cx+w.kitchenDoor.dx,R.cz-R.d/2+1.8),'clear floor before the hall side of the door');
  w.interact(door);const arrive=moves.at(-1);
  assert.equal(w.zoneAt(arrive.x,arrive.z),'ancient-kitchen');assert.ok(w.allowed(arrive.x,arrive.z),'the reader arrives on open floor');
  for(let z=K.cz+K.d/2-1.6;z>K.cz+1.2;z-=.2)assert.ok(w.allowed(arrive.x,z),'a clear walk north from the door to the work table, z '+z.toFixed(1));
  assert.equal(w.allowed(arrive.x,K.cz),false,'the Roman work table stands in the middle of its side');
  for(let x=K.cx-2;x<K.cx+2;x+=.1)assert.ok(w.allowed(x,K.cz),'through the arch at x '+x.toFixed(1));
  assert.equal(w.allowed(K.cx,K.cz-3.5),false,'the dividing wall stands either side of the arch');
  assert.ok(w.allowed(w.clioSpot.x,w.clioSpot.z),'Clio’s place by the fire is open floor');
  w.interact(interactables.find(o=>o.userData.type==='food-history-kitchen-exit'));
  const back=moves.at(-1);assert.equal(w.zoneAt(back.x,back.z),'food-history');assert.ok(w.allowed(back.x,back.z),'and back into the hall');
});

test('the dormouse jar gives up Trimalchio’s dinner once, and remembers',()=>{
  const {w,interactables,notices}=wing();w.activate();
  const jar=interactables.find(o=>o.userData.type==='food-history-dormouse');assert.ok(jar);
  assert.equal(w.dormouseFound,false);w.interact(jar);assert.equal(w.dormouseFound,true);
  assert.match(notices.at(-1),/dormouse/i);assert.match(notices.at(-1),/Trimalchio/);
  assert.ok(w.books.some(b=>b.userData.book.id===shelfIds('food-dormouse')[0]),'the book is out on the stool');
  w.interact(jar);assert.match(notices.at(-1),/still asleep/);
  const shown=wing({search:'?dormouse'});shown.w.activate();assert.equal(shown.w.dormouseFound,true,'?dormouse shows it at once');
});

test('the kitchen keeps to the library’s budget: two lights, instanced herbs, nothing that moves unless near',()=>{
  const kitchen=source.slice(source.indexOf('function buildKitchen()'),source.indexOf('function steamAt('));
  assert.equal((kitchen.match(/new THREE\.PointLight/g)||[]).length,2,'the oil lamp and the fire');
  assert.match(kitchen,/new THREE\.InstancedMesh/);
  assert.match(source,/const near=Math\.hypot\(player\.pos\.x-KITCHEN\.cx,player\.pos\.z-KITCHEN\.cz\)<16;if\(!near\)return/);
  assert.doesNotMatch(kitchen,/spices? (?:were used to )?(?:hide|mask)[^.]*rotten meat\./i,'the cards do not repeat the rotten-meat myth as fact');
});
