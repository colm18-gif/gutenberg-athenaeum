const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const zlib=require('node:zlib');

const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8'),source=fs.readFileSync('canada-room.js','utf8');
const arrivals=(()=>{const c={window:{}};vm.runInNewContext(fs.readFileSync('data/new-books.js','utf8'),c);return c.window.ATHENAEUM_NEW_BOOKS})();
const byRoom=room=>arrivals.filter(e=>e[4]===room).map(e=>e[0]);

class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){Object.assign(this,{x,y,z});return this}clone(){return new V().set(this.x,this.y,this.z)}}
class O{constructor(){this.children=[];this.parent=null;this.visible=true;this.position=new V();this.scale=new V().set(1,1,1);this.rotation={x:0,y:0,z:0,order:'XYZ',set(x,y,z){Object.assign(this,{x,y,z})}};this.quaternion={clone:()=>({})};this.userData={}}
  add(...m){for(const c of m){c.parent=this;this.children.push(c)}return this}removeFromParent(){if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1);this.parent=null}traverse(fn){fn(this);for(const c of this.children)c.traverse(fn)}}
class Mesh extends O{constructor(g,m){super();this.geometry=g;this.material=m}}
const G=class{dispose(){}},M=class{constructor(p){Object.assign(this,p)}dispose(){}};
const THREE={Group:O,Mesh,Vector3:V,BoxGeometry:G,CylinderGeometry:G,PlaneGeometry:G,SphereGeometry:G,CircleGeometry:G,TorusGeometry:G,MeshStandardMaterial:M,MeshBasicMaterial:M,DoubleSide:2,AdditiveBlending:2,RepeatWrapping:1000,
  PointLight:class extends O{constructor(c,i){super();this.isPointLight=true;this.isLight=true;this.intensity=i}}};
const MAT={wood:new M({}),darkWood:new M({}),brass:new M({})};
function room({search='',stored=null,date=new Date(2026,5,1)}={}){
  const store=new Map(stored?[[stored,'1']]:[]),storage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
  const context={window:{},Math,location:{search}};vm.runInNewContext(source,context);
  const scene=new O(),interactables=[],notices=[],player={pos:new V(),radius:.42},tracked=[],seats=[],sounds=[];
  const r=context.window.createCanadaRoom({THREE,scene,MAT,player,interactables,canvasTexture:()=>({dispose(){}}),bookMaterial:()=>new M({}),
    findBook:id=>({id,title:'Book '+id,author:'A'}),arrivals:{stories:byRoom('canada-stories'),north:byRoom('canada-north'),poets:byRoom('canada-poets'),sourdough:byRoom('canada-sourdough')},
    showNotice:t=>notices.push(t),playSample:name=>sounds.push(name),move:(x,z)=>player.pos.set(x,0,z),analytics:{track:(n,p)=>tracked.push([n,p])},storage,now:()=>date,
    registerSeat:()=>{const data={};seats.push(data);return data},burnsRoom:{cx:500,cz:-300,w:15,d:13}});
  return {r,scene,interactables,notices,player,tracked,seats,sounds,store};
}
// The Burns Room itself, built as the game builds it, to walk to the door across its floor.
function burns(){
  const context={window:{},Math,location:{search:''}};vm.runInNewContext(fs.readFileSync('burns-room.js','utf8'),context);
  const scene=new O(),player={pos:new V(),radius:.42};
  const r=context.window.createBurnsRoom({THREE,scene,MAT,player,interactables:[],canvasTexture:()=>({dispose(){}}),bookMaterial:()=>new M({}),findBook:id=>({id,title:'Book '+id,author:'A'}),
    arrivals:{},showNotice:()=>{},playSample:()=>{},move:(x,z)=>player.pos.set(x,0,z),storage:{getItem:()=>null,setItem:()=>{}}});
  r.enter();return r;
}
const find=(a,type)=>a.interactables.find(o=>o.userData.type===type);
// Can a reader walk from one spot to within reach of another, over this floor?
function walk(allowed,from,to,reach=.25){
  const seen=new Set(),queue=[[from.x,from.z]],key=(x,z)=>`${x.toFixed(1)},${z.toFixed(1)}`;
  while(queue.length){const [x,z]=queue.shift();if(Math.hypot(x-to.x,z-to.z)<reach)return true;for(const [dx,dz] of [[.2,0],[-.2,0],[0,.2],[0,-.2]]){const nx=x+dx,nz=z+dz,k=key(nx,nz);if(seen.has(k)||!allowed(nx,nz))continue;seen.add(k);queue.push([nx,nz])}}
  return false;
}
// The words alone, for checking a quotation against a text whatever its quotes, dashes and line breaks.
const letters=text=>text.toLowerCase().replace(/[^a-z]+/g,'');
const bundled=id=>{const file=`texts/bundled-gzip/pg${id}.txt.gz`;return fs.existsSync(file)?zlib.gunzipSync(fs.readFileSync(file)).toString('utf8'):null};

test('the Canadian Room loads before the game and is wired in like the other rooms behind doors',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);
  assert(order.indexOf('burns-room.js')>=0&&order.indexOf('burns-room.js')<order.indexOf('canada-room.js')&&order.indexOf('canada-room.js')<order.indexOf('game.js'));
  assert.match(game,/const canadaRoom=window\.createCanadaRoom\?\.\(/);assert.match(game,/burnsRoom:burnsRoom\?\.room/);assert(game.indexOf('const burnsRoom=')<game.indexOf('const canadaRoom='),'the Burns Room is built first: its wall holds the door');
  assert.match(game,/\['canada-room','The Canadian room'\]/);assert.match(game,/canada:'canada-room'/);assert.match(game,/mcgee:'canada-room'/);
  assert.match(game,/'canada-room':canadaRoom&&\(\(\)=>canadaRoom\.enter\(\)\)/);assert.match(game,/canadaRoom\?\.update\(t\)/);assert.match(game,/if\(canadaRoom\?\.contains\(x,z\)\)return 'canada-room'/);
  const ambience=fs.readFileSync('room-ambience.js','utf8');assert.match(ambience,/'canada-room':\{beds:\[\['fire',/);assert.match(ambience,/\['loon',/);assert.match(ambience,/loon:\(\)=>buffer/);
  const pages=fs.readFileSync('scripts/book-pages.mjs','utf8'),resolver=fs.readFileSync('scripts/new-books.mjs','utf8');
  for(const key of ['canada-stories','canada-north','canada-poets','canada-sourdough']){assert.match(resolver,new RegExp(`'${key}'`));assert.match(pages,new RegExp(`'${key}':'The Canadian Room'`))}
  assert.match(pages,/'The Canadian Room':'canada'/);
});

test('the door is in the Burns Room’s north wall, past the hearth and the fiddle, and the Burns Room’s floor leads to it',()=>{
  const {r}=room(),b=burns();
  assert.equal(r.door.yaw,0);assert.equal(r.door.z,-300-6.5+.2);
  // Clear of the hearth and the fiddle beside it, of the Stacks Stair's door at the other end of the wall, and of the corner.
  assert(r.door.x-.9>500+2.1+.35,'clear of the fiddle');assert(r.door.x+.9<500+7.5-.3,'clear of the corner');
  const stacks=fs.readFileSync('passages.js','utf8').match(/room:'burns',label:'THE BURNS ROOM',wall:'north',at:(-?[\d.]+)/);assert(stacks&&Math.abs(500+Number(stacks[1])-r.door.x)>3,'clear of the Stacks Stair');
  const front={x:r.door.x,z:r.door.z+1.2};assert(b.allowed(front.x,front.z),'there is room to stand at the door');
  assert(walk(b.allowed,{x:500,z:-300+4.5},front),'a reader can walk to the door from the Burns Room’s own door');
  const {cx,cz,w,d}=r.room;
  for(const [ox,oz,ow,od] of [[500,-440,16,14],[500,-300,15,13],[700,-434,16,14],[700,-420,14,14],[700,-180,16,15],[340,30,36,36]])
    assert(Math.abs(cx-ox)>(w+ow)/2+60||Math.abs(cz-oz)>(d+od)/2+60,`well clear of ${ox}, ${oz}`);
});

test('the room is built on approach: three shelves, the stove, the canoe, the window, seats, and a door back',()=>{
  const a=room();assert.equal(a.r.built,false);a.player.pos.set(a.r.door.x,0,a.r.door.z+2);a.r.update(1);assert.equal(a.r.built,true);
  a.r.interact(find(a,'canada-door'));assert(a.r.contains(a.player.pos.x,a.player.pos.z));assert(a.r.allowed(a.player.pos.x,a.player.pos.z),'onto open floor');assert.match(a.notices.at(-1),/^The Canadian Room/);
  assert.equal(JSON.stringify(a.tracked.at(-1)),JSON.stringify(['Room Explored',{room:'canada-room'}]));
  const {groups}=a.r.catalogue();for(const group of groups)assert(group.books.length>=5&&group.books.length<=group.max,`${group.key} has its books`);
  assert.equal(groups.find(g=>g.key==='stories').books[0].id,45,'the library’s own Anne first');
  const entry={...a.player.pos};
  for(const mesh of a.r.books){assert(a.r.contains(mesh.position.x,mesh.position.z),'every book is inside the room');assert(mesh.userData.canada);
    const spot={x:mesh.position.x+Math.sin(mesh.rotation.y)*1.1,z:mesh.position.z+Math.cos(mesh.rotation.y)*1.1};assert(walk(a.r.allowed,entry,spot,.6),`a reader can walk up to ${mesh.userData.book.id}`)}
  assert(!a.r.books.some(m=>m.userData.shelf==='sourdough'),'The Spell of the Yukon is not on the woodbox yet');assert.equal(a.seats.length,3,'a window seat and two chairs');
  for(const type of ['canada-stove'])assert(find(a,type),type);for(const title of ['A birchbark canoe','The window','Snowshoes','A point blanket'])assert(a.interactables.some(o=>o.userData.title===title),title);
  const stove=find(a,'canada-stove');assert(walk(a.r.allowed,entry,{x:stove.position.x,z:stove.position.z+1.1},.5),'the stove can be reached');
  a.r.interact(find(a,'canada-exit'));assert(!a.r.contains(a.player.pos.x,a.player.pos.z),'back to the Burns Room');assert(Math.abs(a.player.pos.z-(a.r.door.z+1.9))<.01,'out into the Burns Room');
  const lamps=[];a.scene.traverse(o=>{if(o.isPointLight)lamps.push(o)});assert.equal(lamps.length,1,'one lamp');
  a.player.pos.set(0,0,0);a.r.update(100);assert.equal(a.r.built,false,'freed once the reader has gone');for(const lamp of lamps)assert.equal(lamp.userData.freed,true);
  assert(!a.interactables.some(o=>/^canada-(card|exit|stove)$/.test(o.userData.type)),'its parts go with it');assert(find(a,'canada-door'),'but the door stays');
});

test('in the stove sits Sam McGee, and The Spell of the Yukon is left on the woodbox, for good',()=>{
  const a=room();a.r.enter();const stove=find(a,'canada-stove');assert(stove);assert.equal(a.r.mcgeeSeen,false);
  a.r.interact(stove);assert.equal(a.r.mcgeeSeen,true);assert.match(a.notices.at(-1),/Please close that door/);assert.match(a.notices.at(-1),/first time I’ve been warm/);
  assert.equal(JSON.stringify(a.tracked.at(-1)),JSON.stringify(['Secret Found',{secret:'canada-sam-mcgee'}]));assert.equal(a.store.get('athenaeum-canada-sam-mcgee'),'1');
  const book=a.r.books.filter(m=>m.userData.shelf==='sourdough');assert.equal(JSON.stringify(book.map(m=>m.userData.book.id)),JSON.stringify(byRoom('canada-sourdough')));for(const m of book)assert.equal(m.visible,true);
  assert(!a.interactables.some(o=>o.userData.type==='canada-stove'),'opened once');for(let t=1;t<6;t+=.1)a.r.update(t);
  const b=room({stored:'athenaeum-canada-sam-mcgee'});b.r.enter();assert.equal(b.r.mcgeeSeen,true,'found once, found for good');
  const c=room({search:'?mcgee'});c.r.enter();assert.equal(c.r.mcgeeSeen,true,'?mcgee shows it');
});

test('the poppies hang from 1 to 11 November',()=>{
  const {r}=room();
  for(const [y,m,d,out] of [[2026,10,1,true],[2026,10,11,true],[2026,10,12,false],[2026,9,31,false],[2026,0,1,false]])assert.equal(r.remembrance(new Date(y,m,d)),out,`${y}-${m+1}-${d}`);
  const hung=a=>{a.r.enter();return a.interactables.some(o=>o.userData.title==='A wreath of poppies')};
  assert.equal(hung(room({date:new Date(2026,10,5)})),true);assert.equal(hung(room({date:new Date(2026,5,5)})),false);assert.equal(hung(room({search:'?poppies'})),true,'?poppies shows them');
});

test('the words given to Sam McGee and John McCrae are theirs',t=>{
  const {r}=room(),yukon=bundled(207),flanders=bundled(353);
  if(!yukon||!flanders)return t.skip('the texts are bundled by the New books workflow');
  for(const line of Object.values(r.mcgee))assert(letters(yukon).includes(letters(line)),line);
  const poppies=r.cards.poppies[1].match(/“([^”]+)”/)[1];assert(letters(flanders).includes(letters(poppies)),poppies);
});

test('its books each have a note of three sentences',()=>{
  const canada=arrivals.filter(e=>/^canada-/.test(e[4]));assert(canada.length>=25);
  for(const [id,title,,,,note] of canada){
    assert(Number.isInteger(id),`${title} has its number`);
    assert.equal(note.split(/(?<=[a-z0-9”’)I][.!?])\s+(?=[A-ZÁÉÍÓÚŒ“])/).length,3,`${title}: three sentences`);
  }
  assert.equal(new Set(canada.map(e=>e[0])).size,canada.length,'each once');assert.equal(byRoom('canada-sourdough').length,1,'one book by the stove');
  assert(!canada.some(e=>e[0]===45),'Anne is the library’s own copy');
  assert(byRoom('canada-stories').length+1<=12&&byRoom('canada-north').length<=12&&byRoom('canada-poets').length<=8,'each run of shelves holds them');
});
