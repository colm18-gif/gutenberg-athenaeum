const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const zlib=require('node:zlib');

const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8'),source=fs.readFileSync('walden.js','utf8');
const arrivals=(()=>{const c={window:{}};vm.runInNewContext(fs.readFileSync('data/new-books.js','utf8'),c);return c.window.ATHENAEUM_NEW_BOOKS})();
const byRoom=room=>arrivals.filter(e=>e[4]===room).map(e=>e[0]);
const letters=text=>String(text).toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const bundled=id=>{const file=`texts/bundled-gzip/pg${id}.txt.gz`;return fs.existsSync(file)?letters(zlib.gunzipSync(fs.readFileSync(file)).toString('utf8')):null};
const walden=letters(fs.readFileSync('texts/pg205.txt','utf8'));

// Just enough of three.js for the clearing to build itself without drawing anything.
class V{constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}set(x,y,z){Object.assign(this,{x,y,z});return this}setScalar(s){return this.set(s,s,s)}clone(){return new V(this.x,this.y,this.z)}copy(v){return this.set(v.x,v.y,v.z)}
  applyMatrix4(){return this}lerp(v,t){return this.set(this.x+(v.x-this.x)*t,this.y+(v.y-this.y)*t,this.z+(v.z-this.z)*t)}}
class Matrix4{compose(){return this}makeRotationY(){return this}multiply(){return this}}
class O{constructor(){this.children=[];this.parent=null;this.visible=true;this.position=new V();this.scale=new V(1,1,1);this.rotation={x:0,y:0,z:0,order:'XYZ',set(x,y,z){Object.assign(this,{x,y,z})}};this.quaternion={clone:()=>({})};this.userData={};this.matrix=new Matrix4()}
  add(...m){for(const c of m){c.parent=this;this.children.push(c)}return this}removeFromParent(){if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1);this.parent=null}traverse(fn){fn(this);for(const c of this.children)c.traverse(fn)}
  updateMatrix(){}lookAt(){}}
class Mesh extends O{constructor(g,m){super();this.geometry=g;this.material=m}}
class InstancedMesh extends Mesh{constructor(g,m,n){super(g,m);this.count=n;this.isInstancedMesh=true;this.instanceMatrix={needsUpdate:false}}setMatrixAt(){}computeBoundingSphere(){}}
class Sprite extends O{constructor(m){super();this.material=m}}
class Points extends O{constructor(g,m){super();this.geometry=g;this.material=m;this.isPoints=true}}
class PointLight extends O{constructor(c,i){super();this.isLight=true;this.isPointLight=true;this.intensity=i}}
const attribute={count:0,getX:()=>0,getY:()=>0,getZ:()=>0};
class G{constructor(){this.index=null;this.attributes={position:attribute,normal:attribute}}toNonIndexed(){return this}applyMatrix4(){return this}computeVertexNormals(){}setAttribute(){}dispose(){}}
const M=class{constructor(p){Object.assign(this,p)}dispose(){}};
const THREE={Group:O,Object3D:O,Mesh,InstancedMesh,Sprite,Points,PointLight,Vector3:V,Matrix4,Quaternion:class{setFromEuler(){return this}},Euler:class{},Color:class{setHex(){return this}},
  BufferGeometry:G,Float32BufferAttribute:class{},BoxGeometry:G,CylinderGeometry:G,PlaneGeometry:G,SphereGeometry:G,CircleGeometry:G,IcosahedronGeometry:G,DodecahedronGeometry:G,TorusGeometry:G,
  MeshStandardMaterial:M,MeshBasicMaterial:M,SpriteMaterial:M,PointsMaterial:M,DoubleSide:2,RepeatWrapping:1000,AdditiveBlending:2};
const colour={setRGB(){return this}};
const CABINET={cx:-500,cz:-140,w:20,d:16};
function clearing({search='',stored={}}={}){
  const store=new Map(Object.entries(stored)),storage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
  const context={window:{},Math,JSON,Set,location:{search}};vm.runInNewContext(source,context);
  const scene=new O();scene.background=colour;scene.fog={color:colour,density:0};
  const interactables=[],notices=[],player={pos:new V(),radius:.42},tracked=[],seats=[],tones=[],sounds=[];
  const w=context.window.createWalden({THREE,scene,MAT:{},player,interactables,canvasTexture:()=>({dispose(){},repeat:{set(){}}}),bookMaterial:()=>new M({}),
    findBook:id=>({id,title:'Book '+id,author:'A'}),arrivals:{thoreau:byRoom('walden-thoreau'),concord:byRoom('walden-concord'),journal:byRoom('walden-journal')},storage,
    showNotice:t=>notices.push(t),playSample:()=>{},sound:(...a)=>sounds.push(a),tone:(...a)=>tones.push(a),later:fn=>fn(),move:(x,z)=>player.pos.set(x,0,z),analytics:{track:(n,p)=>tracked.push([n,p])},
    registerSeat:(parts,group,eye,yaw,info)=>{const data={...info};seats.push(data);return data},cabinet:CABINET});
  return {w,scene,interactables,notices,player,tracked,seats,tones,sounds,store};
}
const find=(a,type)=>a.interactables.find(o=>o.userData.type===type);
// Walks from one point to another in small steps, saying where (if anywhere) the way is barred.
function barred(a,from,to){const n=Math.ceil(Math.hypot(to.x-from.x,to.z-from.z)/.15);for(let i=0;i<=n;i++){const x=from.x+(to.x-from.x)*i/n,z=from.z+(to.z-from.z)*i/n;if(!a.w.allowed(x,z))return `${x.toFixed(2)}, ${z.toFixed(2)}`}return null}

test('Walden loads before the game and is wired in like the other rooms behind doors',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);
  assert(order.indexOf('walden.js')>order.indexOf('naturalist-room.js')&&order.indexOf('walden.js')<order.indexOf('game.js'));
  assert.match(game,/const walden=window\.createWalden\?\.\(/);assert.match(game,/cabinet:naturalistRoom\?\.room/);
  assert(game.indexOf('const naturalistRoom=')<game.indexOf('const walden='),'the Naturalist’s Cabinet is built first: its wall holds the door');
  assert(game.indexOf('const pianoTone=')<game.indexOf('const walden='),'the flute plays on the library’s own synthesiser');
  assert.match(game,/arrivals:\{thoreau:arrivalIds\('walden-thoreau'\),concord:arrivalIds\('walden-concord'\),journal:arrivalIds\('walden-journal'\)\}/);
  assert.match(game,/thoreau:'walden'/);assert.match(game,/walden:walden&&\(\(\)=>walden\.enter\(\)\)/);assert.match(game,/walden\?\.update\(t,dt\)/);
  assert.match(game,/if\(walden\?\.contains\(x,z\)\)return walden\.zoneAt\(x,z\)/);assert.match(game,/\['walden','Walden Pond'\],\['walden-house','Thoreau’s house'\]/);
  assert.match(game,/voice==='flute'\?\[\[1,'sine',1\]/,'a flute voice');
  const ambience=fs.readFileSync('room-ambience.js','utf8');assert.match(ambience,/walden:\{beds:/);assert.match(ambience,/'walden-house':\{beds:/);
  for(const event of ['frog','whippoorwill'])assert.match(ambience,new RegExp(`${event}:\\(\\)=>buffer`));
  const pages=fs.readFileSync('scripts/book-pages.mjs','utf8'),resolver=fs.readFileSync('scripts/new-books.mjs','utf8');
  for(const key of ['walden-thoreau','walden-concord','walden-journal']){assert.match(resolver,new RegExp(`'${key}'`));assert.match(pages,new RegExp(`'${key}':'Walden Pond'`))}
  assert.match(pages,/'Walden Pond':'walden'/);
  const page=fs.readdirSync('book').find(f=>/^205-/.test(f));assert(page);assert.match(fs.readFileSync('book/'+page,'utf8'),/<a href="\/\?room=walden">Walden Pond<\/a>/,'Walden’s page says where it is');
  // One light of its own, the lamp in the house.
  assert.equal((source.match(/new THREE\.(Point|Spot|Directional|Hemisphere|RectArea)Light/g)||[]).length,1);
});

test('the door is at the east end of the Naturalist’s Cabinet’s south wall, clear of its window and writing table, and the pond is far from everything',()=>{
  const {w}=clearing();
  assert.equal(w.door.yaw,Math.PI);assert(Math.abs(w.door.z-(CABINET.cz+CABINET.d/2-.2))<1e-9,'on the south wall');
  // The cabinet's south window is 3.2 m wide at x cx+4; its writing table is 2.1 m wide at the same x, its chair north of it.
  assert(w.door.x-.95>CABINET.cx+4+1.6+.4,'clear of the window');assert(w.door.x+.95<CABINET.cx+CABINET.w/2-.4,'clear of the east wall');
  const naturalist=fs.readFileSync('naturalist-room.js','utf8');assert.match(naturalist,/buildWindow\(cx\+4,cz\+d\/2\)/);assert.match(naturalist,/buildDesk\(cx\+4,cz\+d\/2-1\.5\)/);
  const {x,z}=w.centre;
  for(const [ox,oz,r] of [[800,400,62],[700,-434,20],[700,-180,15],[500,-160,15],[500,-300,15],[500,-440,15],[500,60,15],[500,220,15],[620,120,30],[340,30,25],[1200,-600,40],[900,600,60]])
    assert(Math.hypot(x-ox,z-oz)>70+r+20,`well clear of the place at ${ox}, ${oz}`);
});

test('the clearing is built on approach: the house, two places of books, three chairs, paths that can be walked, and a door back',()=>{
  const a=clearing();assert.equal(a.w.built,false);a.player.pos.set(a.w.door.x,0,a.w.door.z-2);a.w.update(1);assert.equal(a.w.built,true,'built as the reader comes near the door');
  const door=find(a,'walden-door');assert(door,'the door hangs in the Naturalist’s Cabinet');a.w.interact(door);
  assert(a.w.contains(a.player.pos.x,a.player.pos.z),'the door leads out');assert(a.w.allowed(a.player.pos.x,a.player.pos.z),'onto open ground');assert.match(a.notices.at(-1),/^Walden Pond/);
  assert.deepEqual(JSON.stringify(a.tracked.at(-1)),JSON.stringify(['Room Explored',{room:'walden'}]));
  const {groups,journal}=a.w.catalogue();
  assert.equal(groups[0].books[0].id,205,'the library’s own Walden heads his shelf');assert(groups[0].books.length>=9&&groups[0].books.length<=12);assert(groups[1].books.length>=12&&groups[1].books.length<=16);
  assert.deepEqual([...journal.map(b=>b.id)],[57393]);
  assert.equal(a.w.books.length,groups[0].books.length+groups[1].books.length,'every book is out, but the journal');
  for(const mesh of a.w.books){assert(mesh.userData.walden);const p={x:mesh.parent.position.x+mesh.position.x,z:mesh.parent.position.z+mesh.position.z};assert(a.w.contains(p.x,p.z))}
  assert(a.w.books.filter(m=>m.userData.shelf==='thoreau').every(m=>a.w.inHouse(m.parent.position.x+m.position.x,m.parent.position.z+m.position.z)),'his own books are in the house');
  const own=a.w.books.filter(m=>m.userData.ownCopy);assert.deepEqual([...own.map(m=>m.userData.book.id)],[205],'Walden lies on his desk as his own copy, always there');
  assert(own[0].position.y>.75&&own[0].position.x>a.w.house.w/2-.6,'on the desk under the east window');
  assert.deepEqual(a.seats.map(s=>s.title),['The first chair: for solitude','The second chair: for friendship','The third chair: for society']);
  for(const key of ['house','fireplace','bed','desk','page','lamp','mirror','limestone','shelf','table','awning','beans','hoe','woodpile','boat','pond','loon','woods','cost'])
    assert(a.interactables.some(o=>o.userData.type==='walden-card'&&o.userData.key===key),key);
  for(const type of ['walden-flute','walden-sound','walden-exit'])assert(find(a,type),type);
  const lamps=[];a.scene.traverse(o=>{if(o.isPointLight)lamps.push(o)});assert.equal(lamps.length,1,'one lamp, in the house');
  const instanced=[];a.scene.traverse(o=>{if(o.isInstancedMesh)instanced.push(o.name)});for(const name of ['walden-pines','walden-hickories','walden-beans','walden-woodpile'])assert(instanced.includes(name),name);
  assert(a.w.trees.pines+a.w.trees.hickories>300,'a wood round the clearing');
  // From the door in the pines down the path to the house, in at its door to the desk and the fire, and down the footpath to the boat.
  const C=a.w.centre,at=(x,z)=>({x:C.x+x,z:C.z+z}),H=a.w.house;
  for(const [from,to] of [[[-2,-28.6],[1.1,-24]],[[1.1,-24],[1.3,-15.2]],[[1.3,-15.2],[-2,-14.8]],[[-2,-14.8],[H.x,H.z+1.5]],[[H.x,H.z+1.5],[H.x+.05,H.z-1.2]],[[H.x,H.z+1.5],[H.x+.15,H.z+.1]],[[-2,-14.8],[-3.4,-4]],[[-3.4,-4],[-5.2,6.4]],[[1.3,-15.2],[3.6,-15.1]]])
    assert.equal(barred(a,at(...from),at(...to)),null,`the way from ${from} to ${to}`);
  assert(a.w.inHouse(C.x+H.x,C.z+H.z)&&a.w.zoneAt(C.x+H.x,C.z+H.z)==='walden-house'&&a.w.zoneAt(C.x,C.z-5)==='walden');
  assert(!a.w.allowed(C.x+H.x-H.w/2,C.z+H.z),'the house has walls');assert(!a.w.allowed(C.x,C.z+a.w.pond.z),'nobody walks on the water');
  // The three places of the lost can be reached.
  for(const key of a.w.lost){const s=a.w.spots[key];assert(a.w.allowed(C.x+s.x,C.z+s.z),`${key}’s place is open ground`)}
  const exit=find(a,'walden-exit');a.w.interact(exit);assert(!a.w.contains(a.player.pos.x,a.player.pos.z),'back to the cabinet');assert(Math.abs(a.player.pos.z-(a.w.door.z-1.6))<.01);
  a.player.pos.set(0,0,0);a.w.update(100);assert.equal(a.w.built,false,'freed once the reader has gone');for(const lamp of lamps)assert.equal(lamp.userData.freed,true);
  assert(!a.interactables.some(o=>/^walden-(card|exit|flute|sound)$/.test(o.userData.type)),'its parts go with it');assert(find(a,'walden-door'),'but the door stays');
});

test('the flute charms the perch, and the pond is sounded to its bottom',()=>{
  const a=clearing();a.w.enter();a.w.interact(find(a,'walden-flute'));
  assert.equal(a.tones.length,a.w.air.length);assert(a.tones.every(t=>t[4]==='flute'));assert(a.notices.at(-1).includes(a.w.quotes.flute));
  a.w.interact(find(a,'walden-sound'));assert.match(a.notices.at(-1),/one hundred and two feet/);
});

test('the hound, the bay horse and the turtle-dove: found by going to them, and the journal left on the doorstep for good',()=>{
  const a=clearing();a.w.enter();const C=a.w.centre;
  assert(a.interactables.find(o=>o.userData.key==='page').userData.author.includes(a.w.quotes.lost),'the page on the desk tells of them');
  assert.equal(a.w.journalFound,false);assert(!a.w.books.some(m=>m.userData.shelf==='journal'));
  const go=key=>{const s=a.w.spots[key];a.player.pos.set(C.x+s.x,0,C.z+s.z);a.w.update(a.t=(a.t||1)+1,.1)};
  go('hound');assert.match(a.notices.at(-1),/hound bays/);assert.match(a.notices.at(-1),/1 of the three/);assert(a.sounds.length>0);
  go('hound');assert.equal(a.notices.filter(n=>/hound bays/.test(n)).length,1,'once');
  go('horse');assert.match(a.notices.at(-1),/Hoofbeats/);assert.equal(a.w.journalFound,false);
  go('dove');assert.match(a.notices.at(-1),/disappears behind a cloud/);assert(a.notices.at(-1).includes(a.w.quotes.met));assert.match(a.notices.at(-1),/doorstep/);
  assert.equal(a.w.journalFound,true);assert.deepEqual([...a.w.books.filter(m=>m.userData.shelf==='journal').map(m=>m.userData.book.id)],[57393]);
  assert.deepEqual(JSON.stringify(a.tracked.at(-1)),JSON.stringify(['Secret Found',{secret:'walden-hound'}]));assert.equal(a.store.get('athenaeum-walden-journal'),'1');
  for(let t=10;t<20;t+=.1)a.w.update(t,.1);
  const b=clearing({stored:{'athenaeum-walden-journal':'1'}});b.w.enter();assert.equal(b.w.journalFound,true,'found once, found for good');
  const c=clearing({search:'?hound'});c.w.enter();assert.equal(c.w.journalFound,true,'?hound shows it');
  // The three are remembered between visits, each heard once.
  const d=clearing({stored:{'athenaeum-walden-lost':JSON.stringify(['hound','horse'])}});d.w.enter();const s=d.w.spots.dove;d.player.pos.set(C.x+s.x,0,C.z+s.z);d.w.update(2,.1);assert.equal(d.w.journalFound,true);
});

test('every word given to Thoreau is in Walden, and the cards quote it right',()=>{
  const {w}=clearing();
  for(const [key,words] of Object.entries(w.quotes))assert(walden.includes(letters(words)),`${key}: “${words.slice(0,50)}…” is in Walden`);
  for(const [key,[,text]] of Object.entries(w.cards))for(const [,quoted] of text.matchAll(/“([^”]+)”/g))assert(walden.includes(letters(quoted)),`${key}: “${quoted.slice(0,50)}…”`);
});

test('its books each have a note of three sentences, and the notes quote their books right',()=>{
  const here=arrivals.filter(e=>/^walden-/.test(e[4]));assert(here.length>=20);
  const core=[...game.slice(game.indexOf('const books=['),game.indexOf('const books=[')+40000).matchAll(/\[(\d+),\s*['"]/g)].map(m=>Number(m[1]));
  for(const [id,title,,,,note] of here){
    assert(Number.isInteger(id),`${title} has its number`);
    assert.equal(note.split(/(?<=[a-z0-9”’)I][.!?])\s+(?=[A-ZÁÉÍÓÚŒ“])/).length,3,`${title}: three sentences`);
  }
  assert.equal(new Set(here.map(e=>e[0])).size,here.length,'each once');assert.equal(byRoom('walden-journal').length,1,'one journal on the doorstep');
  assert(core.includes(205),'Walden is the library’s own copy');
  // Checked when the texts are bundled (the New books workflow bundles them).
  const quoted=[[9846,'chose to be rich by making his wants few'],[9846,'captain of a huckleberry-party'],[1022,'in Wildness is the preservation of the World'],[34392,'put all America behind him'],
    [2567,'a transcendentalist above all'],[43523,'but of course I know nothing about it'],[59988,'Icarian bird'],[29433,'transparent eye-ball'],[29433,'original relation to the universe'],
    [2944,'foolish consistency is the hobgoblin of little minds'],[15963,'So nigh is grandeur to our dust'],[15963,'It is time to be old'],[15963,'Boston Hymn'],[8642,'let them be sea-captains, if you will'],[53683,'Transcendental Wild Oats'],
    [57393,'Yesterday I came here to live'],[57393,'Do you keep a journal']];
  for(const [id,words] of quoted){const text=bundled(id);if(text)assert(text.includes(letters(words)),`“${words}” is in book ${id}`)}
});
