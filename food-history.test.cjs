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
  const arrivals={cookbooks:shelfIds('food-cookbooks'),preservation:shelfIds('food-preservation'),spices:shelfIds('food-spices'),kitchen:shelfIds('food-kitchen'),dormouse:shelfIds('food-dormouse'),victorian:shelfIds('food-victorian'),bells:shelfIds('food-bells')};
  const tones=[];
  const w=context.window.createFoodHistoryWing({THREE,scene:thing(),MAT:new Proxy({},{get:()=>thing()}),player,interactables,canvasTexture:()=>thing(),bookMaterial:()=>thing(),
    findBook:id=>books.get(id),arrivals,showNotice:t=>notices.push(t),playSample(){},tone:(...a)=>tones.push(a),move:(x,z,yaw)=>{moves.push({x,z,yaw});player.pos.set(x,0,z)}});
  return {w,player,interactables,notices,moves,tones};
}

test('the wing loads before game.js and is wired into the library',()=>{
  assert.ok(index.indexOf("startupScript('food-history-wing.js')")>0);
  assert.ok(index.indexOf("startupScript('food-history-wing.js')")<index.indexOf("startupScript('game.js')"));
  for(const term of ["'food-history':foodHistoryWing","'ancient-kitchen':foodHistoryWing","foodHistoryWing.floorAt","foodHistoryWing.allowed","foodHistoryWing.interact","foodHistoryWing.update","foodHistoryWing?.zoneAt(x,z)"])
    assert.ok(game.includes(term),term);
  assert.match(game,/\['food-history','The Gastronomic Athenaeum'\],\['ancient-kitchen','The Ancient Kitchen'\],\['victorian-kitchen','The kitchen below stairs'\]/,'all three places are in the journal');
  assert.ok(game.includes("'victorian-kitchen':foodHistoryWing"),'?room=victorian-kitchen');
  for(const place of ['food-history','ancient-kitchen','victorian-kitchen'])assert.ok(ambience.includes(`'${place}':{beds:`),place+' has an ambience');
});

test('its books are the food-* shelves of data/new-books.js, not numbers typed into the room',()=>{
  assert.doesNotMatch(source,/TITLES|registerBook/);
  for(const room of ['cookbooks','preservation','spices','kitchen','dormouse','victorian','bells'])assert.ok(game.includes(`${room}:arrivalIds('food-${room}')`),room);
  // The four numbers first given here named other books (docs/food-history-catalogue.md).
  for(const wrong of [6501,44915])assert.ok(!food.some(e=>e[0]===wrong),wrong);
  const doc=fs.readFileSync('docs/food-history-catalogue.md','utf8');
  for(const [id,title] of food)assert.ok(doc.includes(`| ${id} |`),`${title} (${id}) is in the checked list`);
  for(const room of ['food-cookbooks','food-preservation','food-spices','food-kitchen','food-dormouse','food-victorian','food-bells'])assert.ok(shelfIds(room).length,room);
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
  const kitchen=source.slice(source.indexOf('function buildKitchen()'),source.indexOf('function buildVictorian()'));
  assert.equal((kitchen.match(/new THREE\.PointLight/g)||[]).length,2,'the oil lamp and the fire');
  assert.match(kitchen,/new THREE\.InstancedMesh/);
  assert.match(source,/const near=Math\.hypot\(player\.pos\.x-KITCHEN\.cx,player\.pos\.z-KITCHEN\.cz\)<16;if\(!near\)return/);
  assert.doesNotMatch(kitchen,/spices? (?:were used to )?(?:hide|mask)[^.]*rotten meat\./i,'the cards do not repeat the rotten-meat myth as fact');
});

test('through the green baize door, down the back stairs, to the kitchen below stairs and back up',()=>{
  const {w,interactables,moves}=wing();w.activate();
  const R=w.room,V=w.victorian,door=interactables.find(o=>o.userData.type==='food-history-baize-door');assert.ok(door);
  assert.ok(w.allowed(R.cx+w.baizeDoor.dx,R.cz-R.d/2+1.8),'clear floor before the baize door');
  for(const p of [-11,-7,-3,1,5,9])assert.ok(Math.abs(w.baizeDoor.dx-p)>1.1&&Math.abs(w.kitchenDoor.dx-p)>1.1,'neither door is on a pilaster at '+p);
  w.interact(door);const at=moves.at(-1);assert.equal(w.zoneAt(at.x,at.z),'victorian-kitchen');assert.ok(w.allowed(at.x,at.z),'the reader arrives on open floor at the foot of the stairs');
  for(let x=at.x;x>V.cx-6;x-=.2)assert.ok(w.allowed(x,V.cz+V.d/2-1.5),'a clear way west along the south wall, x '+x.toFixed(1));
  for(let z=at.z;z>V.cz-1.5;z-=.2)assert.ok(w.allowed(V.cx+2.2,z),'and north past the table, z '+z.toFixed(1));
  w.interact(interactables.find(o=>o.userData.type==='food-history-stair'));const up=moves.at(-1);
  assert.equal(w.zoneAt(up.x,up.z),'food-history');assert.ok(w.allowed(up.x,up.z),'up the back stairs into the hall');
  for(const name of ['THE LIBRARY','DRAWING ROOM','FRONT DOOR'])assert.ok(w.bells.includes(name),name);
});

test('the library’s bell rings below stairs, and answered while it swings, the dumbwaiter sends down a book',()=>{
  const {w,player,interactables,notices,tones}=wing();w.enterBelow();
  const bell=interactables.find(o=>o.userData.type==='food-history-bell');assert.ok(bell);
  w.interact(bell);assert.equal(w.bellAnswered,false,'a still bell is not answered');assert.match(notices.at(-1),/still/);
  w.update(5,.016);assert.equal(tones.length,0,'not straight away');
  w.update(13,.016);assert.ok(tones.length>0,'it rings soon after the reader comes down');
  w.update(14,.016);w.interact(bell);assert.equal(w.bellAnswered,true);assert.match(notices.at(-1),/dumbwaiter/);
  assert.ok(w.books.some(b=>b.userData.book.id===shelfIds('food-bells')[0]),'the book is on the tray');
  const n=tones.length;w.update(200,.016);assert.equal(tones.length,n,'once answered, it does not ring again');
  const shown=wing({search:'?bell'});shown.w.activate();assert.equal(shown.w.bellAnswered,true,'?bell shows it at once');
});

test('the kitchen below stairs keeps to two lights and an instanced dresser',()=>{
  const below=source.slice(source.indexOf('function buildVictorian()'),source.indexOf('function sendDown('));
  assert.equal((below.match(/new THREE\.PointLight/g)||[]).length,2,'the gas and the range');
  assert.match(below,/new THREE\.InstancedMesh/);
  assert.ok(shelfIds('food-victorian').length<=12,'two cases of six');
});

test('the hall side is the library’s walnut with the name gilded on the glass, kept when the far wing unloads',()=>{
  assert.match(source,/doorKit\.readingRoom\?\.\('THE GASTRONOMIC\\nATHENAEUM'/);
  for(const gone of ['function dressThreshold()','gastronomic-entry-arch','function botanical(side)','display-cabinet'])assert.ok(!source.includes(gone),gone+' no longer crowds the wall');
  assert.ok(source.indexOf('const entranceOwned=owned.splice(0)')<source.indexOf('function unload()'));
});

test('the entrance in the Grand Hall keeps clear of the other doors and cases on the west wall',()=>{
  const at=+source.match(/const THRESHOLD=\{x:-18\.1,z:(-?[\d.]+),yaw:Math\.PI\/2\}/)[1],half=+source.match(/const ENTRANCE_HALF=([\d.]+)/)[1];
  // Its neighbours, from the files that place them: the Horologist's round door (a ring of radius 1.78) and the Kipling case.
  const curious=fs.readFileSync('curious-doors.js','utf8'),kipling=fs.readFileSync('kipling-shelf.js','utf8');
  assert.ok(curious.includes("door:{x:-18.72,z:22.9")&&curious.includes('new THREE.TorusGeometry(1.58,.2,'),'the Horologist’s door is where and as big as this test thinks');
  assert.ok(kipling.includes('CASE={x:-18.54,z:29.1,w:2.2'),'so is the Kipling case');
  const taken=[['the Horologist’s door',22.9-1.78,22.9+1.78],['the Kipling bookcase',29.1-1.1,29.1+1.1],['the Austen Room',11.8,14],['the Room of the Day',-15.6,-13.4]];
  for(const [name,a,b] of taken)assert.ok(at+half+.5<=a||at-half-.5>=b,`the entrance (z ${at-half} to ${at+half}) keeps half a metre from ${name}`);
  assert.ok(source.includes('move(THRESHOLD.x+2.75,THRESHOLD.z,-Math.PI/2)'),'the way back out stands the reader in front of it');
});
