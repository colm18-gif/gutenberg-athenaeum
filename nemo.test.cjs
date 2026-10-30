const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const zlib=require('node:zlib');

const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8'),source=fs.readFileSync('nemo-room.js','utf8');
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
function room({search='',stored=null}={}){
  const store=new Map(stored?[[stored,'1']]:[]),storage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
  const context={window:{},Math,location:{search}};vm.runInNewContext(source,context);
  const scene=new O(),interactables=[],notices=[],player={pos:new V(),radius:.42},tracked=[],seats=[],tones=[],sounds=[],back=[];
  const r=context.window.createNemoRoom({THREE,scene,MAT,player,interactables,canvasTexture:()=>({dispose(){}}),bookMaterial:()=>new M({}),
    findBook:id=>({id,title:'Book '+id,author:'A'}),arrivals:{tales:byRoom('nemo-tales'),deep:byRoom('nemo-deep'),lost:byRoom('nemo-lost'),atlantis:byRoom('nemo-atlantis')},
    showNotice:t=>notices.push(t),playSample:name=>sounds.push(name),move:(x,z)=>player.pos.set(x,0,z),analytics:{track:(n,p)=>tracked.push([n,p])},storage,tone:(...a)=>tones.push(a),
    registerSeat:()=>{const data={};seats.push(data);return data},toVerne:()=>back.push(1),model:{x:220,z:70}});
  return {r,scene,interactables,notices,player,tracked,seats,tones,sounds,store,back};
}
const find=(a,type)=>a.interactables.find(o=>o.userData.type===type);
function walk(allowed,from,to,reach=.25){
  const seen=new Set(),queue=[[from.x,from.z]],key=(x,z)=>`${x.toFixed(1)},${z.toFixed(1)}`;
  while(queue.length){const [x,z]=queue.shift();if(Math.hypot(x-to.x,z-to.z)<reach)return true;for(const [dx,dz] of [[.2,0],[-.2,0],[0,.2],[0,-.2]]){const nx=x+dx,nz=z+dz,k=key(nx,nz);if(seen.has(k)||!allowed(nx,nz))continue;seen.add(k);queue.push([nx,nz])}}
  return false;
}
const letters=text=>text.toLowerCase().replace(/[^a-z]+/g,'');

test('the salon loads before the game and is wired in like the other rooms out of the way',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);
  assert(order.indexOf('nemo-room.js')>=0&&order.indexOf('nemo-room.js')<order.indexOf('game.js'));
  assert.match(game,/const nemoRoom=window\.createNemoRoom\?\.\(/);assert.match(game,/toVerne:\(\)=>buildThemeRooms\('verne'\)/);
  assert.match(game,/\['nemo-room','Captain Nemo’s salon'\]/);assert.match(game,/nemo:'nemo-room'/);assert.match(game,/atlantis:'nemo-room'/);
  assert.match(game,/'nemo-room':nemoRoom&&\(\(\)=>nemoRoom\.enter\(\)\)/);assert.match(game,/nemoRoom\?\.update\(t\)/);assert.match(game,/if\(nemoRoom\?\.contains\(x,z\)\)return 'nemo-room'/);
  // The model Nautilus in the Extraordinary Voyages is the way in.
  assert.match(game,/hull\.userData=\{type:window\.createNemoRoom\?'nemo-model':'object',title:'A model of the Nautilus'/);
  assert.match(game,/voice==='organ'\?\[\[\.5,'sine'/,'the organ has a voice of its own');
  const ambience=fs.readFileSync('room-ambience.js','utf8');assert.match(ambience,/'nemo-room':\{beds:\[\['rumble',/);
  const pages=fs.readFileSync('scripts/book-pages.mjs','utf8'),resolver=fs.readFileSync('scripts/new-books.mjs','utf8');
  for(const key of ['nemo-tales','nemo-deep','nemo-lost','nemo-atlantis']){assert.match(resolver,new RegExp(`'${key}'`));assert.match(pages,new RegExp(`'${key}':'Captain Nemo’s Salon'`))}
  assert.match(pages,/'Captain Nemo’s Salon':'nemo'/);
  const {r}=room(),{cx,cz,w,d}=r.room;
  for(const [ox,oz,ow,od] of [[900,-100,64,64],[800,400,80,80],[700,-420,16,30],[700,-180,16,15],[500,220,14,12],[500,60,18,16],[1200,-600,10,400]])
    assert(Math.abs(cx-ox)>(w+ow)/2+60||Math.abs(cz-oz)>(d+od)/2+60,`well clear of ${ox}, ${oz}`);
});

test('looking into the model goes aboard: three runs of shelves, the table, divans, the organ, one lamp, and the hatch back',()=>{
  const a=room();assert.equal(a.r.built,false);a.player.pos.set(221,0,73);a.r.update(1);assert.equal(a.r.built,true,'built as the reader nears the model');
  assert(a.r.interact({userData:{type:'nemo-model'}}));assert(a.r.contains(a.player.pos.x,a.player.pos.z));assert(a.r.allowed(a.player.pos.x,a.player.pos.z),'onto open floor');
  assert.match(a.notices.at(-1),/^Captain Nemo’s Salon/);assert.equal(JSON.stringify(a.tracked.at(-1)),JSON.stringify(['Room Explored',{room:'nemo-room'}]));
  const {groups}=a.r.catalogue();for(const group of groups)assert(group.books.length>=5&&group.books.length<=group.max,`${group.key} has its books`);
  assert.equal(JSON.stringify(groups.find(g=>g.key==='tales').books.slice(0,2).map(b=>b.id)),'[164,1268]','the library’s own Verne first');
  const entry={...a.player.pos};
  for(const mesh of a.r.books){assert(a.r.contains(mesh.position.x,mesh.position.z),'every book is inside the room');assert(mesh.userData.nemo);
    const spot={x:mesh.position.x+Math.sin(mesh.rotation.y)*1.1,z:mesh.position.z+Math.cos(mesh.rotation.y)*1.1};assert(walk(a.r.allowed,entry,spot,.6),`a reader can walk up to ${mesh.userData.book.id}`)}
  const organ=find(a,'nemo-organ');assert(organ);assert(walk(a.r.allowed,entry,{x:a.r.room.cx+4.4,z:a.r.room.cz+a.r.room.d/2-1.6},.5),'the organ can be reached');
  assert(walk(a.r.allowed,entry,{x:a.r.room.cx,z:a.r.room.cz-a.r.room.d/2+1.2},.5),'and the great panel');
  assert.equal(a.seats.length,2,'two divans');assert(find(a,'nemo-window'));
  // The panels open by themselves a moment after the reader comes aboard.
  assert.equal(a.r.panels.target,0);for(let t=1;t<4;t+=.1)a.r.update(t);assert.equal(a.r.panels.target,1);assert(a.r.panels.open>.9,'the panels slide open');
  a.r.interact(find(a,'nemo-window'));assert.equal(a.r.panels.target,0,'and close again when asked');
  a.r.interact(find(a,'nemo-exit'));assert.equal(a.back.length,1,'the Extraordinary Voyages are built for the way back');assert(!a.r.contains(a.player.pos.x,a.player.pos.z));
  assert.equal(a.player.pos.x,220);assert(Math.abs(a.player.pos.z-72.8)<.01,'in front of the model');
  const lamps=[];a.scene.traverse(o=>{if(o.isPointLight)lamps.push(o)});assert.equal(lamps.length,1,'one lamp');
  a.player.pos.set(0,0,0);a.r.update(100);assert.equal(a.r.built,false,'freed once the reader has gone');for(const lamp of lamps)assert.equal(lamp.userData.freed,true);
  assert(!a.interactables.some(o=>/^nemo-/.test(o.userData.type)),'its parts go with it');
});

test('the organ plays on the black keys alone, and opens the panels on Atlantis, leaving the Critias on its desk, for good',()=>{
  const a=room();a.r.enter();for(let t=1;t<4;t+=.1)a.r.update(t);assert.equal(a.r.atlantisSeen,false);assert(!a.r.books.some(m=>m.userData.shelf==='atlantis'),'not on the desk yet');
  a.r.interact(find(a,'nemo-organ'));assert.equal(a.r.atlantisSeen,true);
  assert(a.tones.length>=a.r.tune.length&&a.tones.every(t=>t[4]==='organ'),'the organ plays');
  const black=new Set(a.r.blackKeys.map(f=>f.toFixed(2)));for(const [f] of a.r.tune)assert(black.has(f.toFixed(2)),`${f} is a black key`);
  assert.match(a.notices.at(-1),/only the black keys/);assert.match(a.notices.at(-1),/traced the one word: ATLANTIS/);
  assert.equal(JSON.stringify(a.tracked.at(-1)),JSON.stringify(['Secret Found',{secret:'nemo-atlantis'}]));assert.equal(a.store.get('athenaeum-nemo-atlantis'),'1');
  for(let t=4;t<12;t+=.1)a.r.update(t);assert.equal(a.r.panels.showing,'atlantis','the panels open on the drowned city');assert(a.r.panels.open>.9);
  for(let t=12;t<70;t+=.1)a.r.update(t);assert.equal(a.r.panels.showing,'sea','and on the sea again after a while');
  const critias=a.r.books.filter(m=>m.userData.shelf==='atlantis');assert.equal(JSON.stringify(critias.map(m=>m.userData.book.id)),JSON.stringify(byRoom('nemo-atlantis')));for(const m of critias)assert.equal(m.visible,true);
  const b=room({stored:'athenaeum-nemo-atlantis'});b.r.enter();assert.equal(b.r.atlantisSeen,true,'found once, found for good');
  const c=room({search:'?atlantis'});c.r.enter();assert.equal(c.r.atlantisSeen,true,'?atlantis shows it');
});

test('every word given to Verne is in the library’s own Twenty Thousand Leagues',()=>{
  const {r}=room(),text=letters(fs.readFileSync('texts/pg164.txt','utf8'));
  for(const line of Object.values(r.verne))assert(text.includes(letters(line)),line);
});

test('its books each have a note of three sentences',()=>{
  const nemo=arrivals.filter(e=>/^nemo-/.test(e[4]));assert(nemo.length>=18);
  for(const [id,title,,,,note] of nemo){
    assert(Number.isInteger(id),`${title} has its number`);
    assert.equal(note.split(/(?<=[a-z0-9”’)I][.!?])\s+(?=[A-ZÁÉÍÓÚŒ“])/).length,3,`${title}: three sentences`);
  }
  assert.equal(new Set(nemo.map(e=>e[0])).size,nemo.length,'each once');assert.equal(JSON.stringify(byRoom('nemo-atlantis')),'[1571]','the Critias on the music desk');
  assert(!nemo.some(e=>[164,1268].includes(e[0])),'the Verne are the library’s own copies');
});
