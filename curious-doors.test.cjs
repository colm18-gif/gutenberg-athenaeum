const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const html=fs.readFileSync('index.html','utf8');
const game=fs.readFileSync('game.js','utf8');
const train=fs.readFileSync('night-train.js','utf8');
const stair=fs.readFileSync('high-staircase.js','utf8');

// A permissive stand-in for three.js: every property and call yields another stub,
// so the room builders run end to end without a GPU.
function stub(){const target=function(){};return new Proxy(target,{get(t,k){if(k in t)return t[k];if(k===Symbol.toPrimitive)return()=>0;if(k==='then'||k===Symbol.iterator)return undefined;t[k]=stub();return t[k]},apply(){return stub()},construct(){return stub()},set(t,k,v){t[k]=v;return true}})}
function loadBooks(){const context={window:{}};vm.runInNewContext(fs.readFileSync('data/curious-rooms-books.js','utf8'),context);return context.window.ATHENAEUM_CURIOUS_BOOKS}
function fixture(){
  const books=loadBooks().map(book=>({...book})),interactables=[],seats=[],moves=[],notices=[],player={pos:{x:0,y:0,z:0},radius:.42};
  const context={window:{},localStorage:{getItem:()=>null,setItem(){}},Math,Object,Array,Number,String,Set,Map,Float32Array,setTimeout:()=>0};
  vm.runInNewContext(fs.readFileSync('curious-doors.js','utf8'),context);
  const doors=context.window.createCuriousDoors({THREE:stub(),scene:stub(),MAT:stub(),player,camera:stub(),interactables,books,bookMaterial:()=>stub(),canvasTexture:()=>stub(),showNotice:text=>notices.push(text),playSample:()=>true,sound:()=>{},registerSeat:(parts,group,eye,yaw,options)=>seats.push(options),move:(x,z,yaw)=>{moves.push({x,z,yaw});player.pos.x=x;player.pos.z=z}});
  return {doors,books,interactables,seats,moves,notices,player};
}

test('curious rooms load before the game and their books are new, bundled and complete',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(match=>match[1]);
  assert.ok(order.indexOf('curious-doors.js')>-1&&order.indexOf('curious-doors.js')<order.indexOf('game.js'));
  assert.ok(order.indexOf('data/curious-rooms-books.js')>-1&&order.indexOf('data/curious-rooms-books.js')<order.indexOf('game.js'));
  const books=loadBooks(),rooms=new Set(books.map(book=>book.room));
  assert.deepEqual([...rooms].sort(),['attic','conservatory','horologist','parlour']);
  assert.equal(new Set(books.map(book=>book.id)).size,books.length,'no duplicate ids');
  for(const book of books){
    const text=fs.readFileSync(`texts/pg${book.id}.txt`,'utf8');
    assert.ok(text.length>20000,`${book.title} text is bundled`);
    assert.ok(!/THE SMALL PRINT!/.test(text.slice(0,2000))||/START OF TH/i.test(text),`${book.title} starts at the book, not the legal header`);
  }
  // None of them may already live elsewhere in the catalogue.
  const elsewhere=new Set();
  for(const match of game.matchAll(/\[(\d+),'/g))elsewhere.add(+match[1]);
  for(const file of fs.readdirSync('data'))if(file.endsWith('.js')&&file!=='curious-rooms-books.js')for(const match of fs.readFileSync(`data/${file}`,'utf8').matchAll(/\bid:\s*(\d+)/g))elsewhere.add(+match[1]);
  for(const book of books)assert.ok(!elsewhere.has(book.id),`${book.title} (${book.id}) is already in the library`);
  assert.match(game,/window\.ATHENAEUM_CURIOUS_BOOKS\|\|\[\]/);
});

test('every curious door opens onto its room and the room door leads back to the hall',()=>{
  const f=fixture();
  for(const key of ['horologist','conservatory','attic']){
    const room=f.doors.rooms[key];f.moves.length=0;
    f.doors.interact({userData:{type:'curious-door',room:key}});
    for(let t=0;t<3;t+=.05)f.doors.update(t,.05,false);
    assert.equal(f.moves.length,1,`${key} door moved the reader once`);
    assert.equal(f.doors.zoneAt(f.player.pos.x,f.player.pos.z),room,`${key} arrival is inside the room`);
    assert.ok(f.doors.allowed(f.player.pos.x,f.player.pos.z),`${key} arrival point is walkable`);
    f.doors.interact({userData:{type:'curious-exit',room:key}});
    assert.equal(f.doors.zoneAt(f.player.pos.x,f.player.pos.z),null,`${key} exit returns to the hall`);
    assert.ok(Math.abs(f.player.pos.x)<18.5,'the reader is set down inside the Grand Hall');
  }
});

test('the parlour is a secret: the bookcase must swing open before the passage can be entered',()=>{
  const f=fixture(),door=f.doors.doors.parlour;
  assert.equal(door.state,'closed');
  f.doors.interact({userData:{type:'curious-door',room:'parlour'}});
  for(let t=0;t<2;t+=.05)f.doors.update(t,.05,false);
  assert.equal(door.state,'open','tilting the volume swings the case aside');
  assert.equal(f.moves.length,0,'opening the case does not carry the reader through');
  f.doors.interact({userData:{type:'curious-door',room:'parlour'}});
  assert.equal(f.doors.zoneAt(f.player.pos.x,f.player.pos.z)?.key,'parlour');
});

test('room furniture blocks movement but the rooms keep clear walkways and seats',()=>{
  const f=fixture(),c=f.doors.rooms.conservatory;
  f.doors.activate(c);
  assert.equal(f.doors.allowed(c.cx,c.cz-1),false,'the fountain is solid');
  assert.equal(f.doors.allowed(c.cx-c.w/2+.2,c.cz),false,'walls are solid');
  assert.ok(f.doors.allowed(c.cx,c.cz+c.d/2-1.8),'the entrance is clear');
  for(const key of ['horologist','parlour','attic'])f.doors.activate(f.doors.rooms[key]);
  assert.ok(f.seats.length>=5,'every room offers somewhere to sit and read');
  const shelved=f.interactables.filter(object=>object.userData?.type==='book').map(object=>object.userData.book.id);
  assert.equal(new Set(shelved).size,f.books.length,'every new book is on display');
});

test('reading from a chair releases the mouse so the reader controls are usable',()=>{
  assert.match(game,/ui\.reader\.classList\.remove\('hidden'\);document\.exitPointerLock\?\.\(\);/);
});

test('the reading carriage has window seats that offer railway books',()=>{
  assert.match(train,/registerSeat\?\.\(\[cushion,back\],seatGroup/);
  assert.match(train,/bookIds:\(window\.ATHENAEUM_RAILWAY_BOOKS\|\|\[\]\)\.map\(book=>book\.id\)/);
  assert.match(game,/preferred=seat\.bookIds\?\.length\?available\.filter\(b=>seat\.bookIds\.includes\(b\.id\)\)/);
  assert.match(game,/createNightTrain\(\{[^}]*registerSeat,/);
});

test('the rocket flight faces the porthole, shows its progress and keeps other messages away',()=>{
  assert.match(stair,/moveTo\(tx,0,tz\+\.35,0\)/,'boarding faces the porthole');
  assert.match(stair,/if\(i===9\)continue;/,'no rail stands in front of the porthole');
  assert.match(stair,/noticeAllowed:\(\)=>!rocketTrip\|\|speaking/);
  assert.match(game,/showNotice\.gate=\(\)=>highStaircase\.noticeAllowed\(\)/);
  assert.match(game,/function showNotice\(t,seconds=3\)\{if\(showNotice\.gate&&!showNotice\.gate\(\)\)return;/);
  assert.match(stair,/function paintFlightWindow\(trip,e,dt\)/);
  assert.match(stair,/flightHud\.show\(rocketBoarded\)/);
  assert.match(stair,/isReducedMotion\(\)\?0:/,'cabin shake respects Reduce motion');
});

test('the floor sign beside the cellar hatch no longer sits under the hatch frame',()=>{
  const x=+game.match(/side:THREE\.DoubleSide\}\),(-?[\d.]+),\.115,-25\.8,false\);restrictedEntrySign/)[1];
  assert.ok(x-3.1/2>-5.25,'sign clears the hatch rim at x=-5.3');
});
