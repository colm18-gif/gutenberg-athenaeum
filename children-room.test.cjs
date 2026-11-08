const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const zlib=require('node:zlib');

// The Ukrainian Reading Room's children's room, Дитяча кімната (international-wing.js): built for real, with a stand-in
// for Three.js that keeps positions and visibility, so a reader can walk through the arch, use the lobby's little door,
// pick up the pea and take the books down.
const source=fs.readFileSync('international-wing.js','utf8'),game=fs.readFileSync('game.js','utf8');
const load=(file,name)=>{const c={window:{}};vm.runInNewContext(fs.readFileSync(file,'utf8'),c);return c.window[name]};
const wingList=load('data/new-books-wing.js','ATHENAEUM_NEW_BOOKS_WING'),resolved=load('data/new-books-resolved.js','ATHENAEUM_NEW_BOOKS_RESOLVED').books;
const ukrainian=wingList.filter(e=>e[4]==='ukrainian').map(e=>({id:resolved[`${e[1]} [uk]`]?.id,title:e[1],author:e[2]})).filter(b=>b.id);

class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){Object.assign(this,{x,y,z});return this}clone(){return new V().set(this.x,this.y,this.z)}copy(v){return this.set(v.x,v.y,v.z)}setScalar(){return this}}
const any=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>0:any,apply:()=>any,construct:()=>any});
function thing(){
  // `scale` is a vector on an object and a method on a geometry: the stand-in is both.
  const scale=Object.assign(function(){return t},{x:1,y:1,z:1,set(x,y,z){Object.assign(scale,{x,y,z});return scale},setScalar(){return scale}});
  const t={children:[],parent:null,visible:true,position:new V(),scale,userData:{},
    rotation:{x:0,y:0,z:0,set(x,y,z){Object.assign(this,{x,y,z});return this}},quaternion:{clone:()=>({copy(){}}),copy(){}},
    add(...c){for(const x of c){x.parent=t;t.children.push(x)}return t},removeFromParent(){if(t.parent)t.parent.children.splice(t.parent.children.indexOf(t),1);t.parent=null},
    traverse(fn){fn(t);for(const c of t.children)c.traverse?.(fn)}};
  return new Proxy(t,{get:(o,k)=>k in o?o[k]:typeof k==='symbol'?undefined:any});
}
const THREE=new Proxy({},{get:()=>function(){return thing()}});
function wing({search='',stored=[],date=new Date(2026,10,8)}={}){
  const store=new Map(stored.map(k=>[k,'1'])),storage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
  const context={window:{},Math,Date,JSON,Set,Map,Object,Array,Number,String,location:{search},setTimeout:()=>0};
  vm.runInNewContext(source,context);
  const interactables=[],notices=[],player={pos:new V(),radius:.42},seats=[],tracked=[];
  const w=context.window.createInternationalWing({THREE,scene:thing(),MAT:any,player,interactables,canvasTexture:()=>thing(),bookMaterial:()=>thing(),
    findBook:id=>ukrainian.find(b=>b.id===id),arrivals:key=>key==='ukrainian'?ukrainian.map(b=>b.id):[],showNotice:t=>notices.push(t),playSample:()=>{},
    move:(x,z)=>player.pos.set(x,0,z),analytics:{track:(n,p)=>tracked.push([n,p])},today:()=>date,storage,
    registerSeat:(parts,group,at,yaw,data)=>{seats.push(data);return data}});
  return {w,interactables,notices,player,seats,store,tracked};
}
const ROOM=/const CHILDREN_ROOM=\{w:(\d+),d:(\d+),h:(\d+),cx:(-?\d+),cz:(-?\d+)\}/.exec(source).slice(1).map(Number),[KW_,KD,,KCX,KCZ]=ROOM;
const K={w:KW_,d:KD,cx:KCX,cz:KCZ},inK=(x,z)=>Math.abs(x-K.cx)<K.w/2&&Math.abs(z-K.cz)<K.d/2;
const world=m=>{let x=m.position.x,z=m.position.z;for(let p=m.parent;p&&p.parent;p=p.parent){x+=p.position.x;z+=p.position.z}return {x,z}};
const find=(a,type)=>a.interactables.find(o=>o.userData?.type===type);
function walk(allowed,from,to,reach=.3){
  const seen=new Set(),queue=[[from.x,from.z]],key=(x,z)=>`${x.toFixed(1)},${z.toFixed(1)}`;
  while(queue.length){const [x,z]=queue.shift();if(Math.hypot(x-to.x,z-to.z)<reach)return true;
    for(const [dx,dz] of [[.2,0],[-.2,0],[0,.2],[0,-.2]]){const nx=x+dx,nz=z+dz,k=key(nx,nz);if(seen.has(k)||!allowed(nx,nz))continue;seen.add(k);queue.push([nx,nz])}}
  return false;
}

test('the children’s room shares the Ukrainian room’s east wall, through an open arch, and stands clear of every other room',()=>{
  const {w}=wing(),U=w.rooms.ukrainian;
  assert.equal(U.annex.cx-U.annex.w/2,U.cx+U.w/2,'the two rooms meet at the east wall');assert.equal(U.annex.cz,U.cz,'the arch is in the middle of the wall');
  for(const [key,r] of Object.entries(w.rooms))if(key!=='ukrainian')
    assert(Math.abs(r.cx-K.cx)>=(r.w+K.w)/2+2||Math.abs(r.cz-K.cz)>=(r.d+K.d)/2+2,`clear of the ${key} room`);
  // Crusoe's island (x -420, z 165-199) is far to the south-east.
  assert(K.cz+K.d/2<165||K.cx+K.w/2<-440);
  assert.equal(w.roomAt(K.cx,K.cz),'ukrainian','one room with the reading room: its lamps, books and freeing go together');
});

test('a reader walks from the reading room through the arch, but not through the wall either side of it',()=>{
  const a=wing();a.w.enter('ukrainian');const U=a.w.rooms.ukrainian;
  assert(walk(a.w.allowed,{x:U.cx+1.5,z:U.cz-2.8},{x:K.cx,z:K.cz-1.5}),'into the children’s room');
  const wallX=U.cx+U.w/2;
  for(const dx of [-.1,.1])assert.equal(a.w.allowed(wallX+dx,U.cz),true,'through the arch');
  for(const dx of [-.1,.1])for(const z of [U.cz-4,U.cz+4])assert.equal(a.w.allowed(wallX+dx,z),false,'but not past the wall beside it');
});

test('its shelves: the youngest readers’ tales and, for older readers, stories that also stand on the main racks',()=>{
  const a=wing();a.w.enter('ukrainian');const books=a.w.books;
  const kids=books.filter(m=>m.userData.childrenRoom),titles=kids.map(m=>m.userData.book.title);
  for(const m of kids)assert(inK(world(m).x,world(m).z),`${m.userData.book.title} is in the children’s room`);
  const children=JSON.parse(source.match(/const CHILDREN=(\[[^\]]*\])/)[1].replace(/\\'/g,'’').replace(/'/g,'"')).map(t=>t.replace(/’/g,"'"));
  const older=JSON.parse(source.match(/const OLDER=(\[[^\]]*\])/)[1].replace(/'/g,'"'));
  for(const t of [...children,...older])if(ukrainian.some(b=>b.title===t))assert(titles.includes(t),`${t} is on a low shelf`);
  for(const t of older)assert(ukrainian.some(b=>b.title===t),`${t} is in the room’s own list`);
  const main=books.filter(m=>!m.userData.childrenRoom).map(m=>m.userData.book.title);
  for(const t of ['Олеся','Захар Беркут'])assert(main.includes(t),`${t} stays on the main racks too`);
  // Read for a child's shelf: Облога Буші is kept for adults (a hero nicknamed for killing Jews; an ending of mass death).
  assert(!titles.includes('Облога Буші')&&main.includes('Облога Буші'),'Облога Буші is on the main racks only');
  for(const t of ['Рукавичка','Пан Коцький','Котигорошко'])assert(!main.includes(t),`${t} is kept for the children`);
  assert(a.seats.some(s=>/Лавка з подушками/.test(s.title)),'the bench is one of the library’s seats');
  const bench=a.seats.find(s=>/Лавка/.test(s.title));assert(bench.bookIds.length>=8,'and opens one of the children’s books');
});

test('the mitten, the letters and the procession: the mitten and all six letters are in the children’s room, and the animals walk to the arch',()=>{
  const a=wing();a.w.enter('ukrainian');
  const mitten=a.interactables.filter(o=>o.userData?.type==='intl-mitten');assert(mitten.length);for(const m of mitten)assert(inK(world(m).x,world(m).z),'the mitten is in the children’s room');
  const letters=a.interactables.filter(o=>o.userData?.type==='intl-letter');assert.equal(letters.length,6);
  for(const l of letters)assert(inK(world(l).x,world(l).z),`${l.userData.title} is hidden in the children’s room`);
  const U=a.w.rooms.ukrainian,walkers=a.interactables.filter(o=>o.userData?.title==='До рукавички');assert.equal(walkers.length,4);
  for(const f of walkers){const p=world(f);assert(Math.abs(p.x-(U.cx+U.w/2))<1&&Math.abs(p.z-U.cz)<3.2,'beside the arch, in the reading room')}
  assert(a.interactables.some(o=>o.userData?.title==='Дитяча кімната'),'its name, over the arch and inside');
});

test('the lobby’s little yellow door goes straight in, and the children’s room’s own takes the reader back',()=>{
  const a=wing();a.w.enter('hub');const door=find(a,'intl-children');assert(door,'the little door in the lobby');
  a.w.interact(door);assert(inK(a.player.pos.x,a.player.pos.z),'into the children’s room');assert(a.w.allowed(a.player.pos.x,a.player.pos.z),'onto open floor');
  a.w.interact(find(a,'intl-children-out'));assert.equal(a.w.roomAt(a.player.pos.x,a.player.pos.z),'hub','back in the lobby');assert(a.w.allowed(a.player.pos.x,a.player.pos.z));
});

test('the secret: the pea rolls along the skirting; picked up, Kotyhoroshko’s mace and his tale are in the corner, for good',()=>{
  const a=wing();a.w.enter('ukrainian');const pea=find(a,'intl-pea');assert(pea);
  const before=world(pea.parent).x;a.w.update(30);const after=world(pea.parent).x;assert.notEqual(before,after,'it rolls');
  assert(!a.interactables.some(o=>/Булава/.test(o.userData?.title||'')),'no mace yet');
  a.w.interact(pea);assert.equal(a.store.get('athenaeum-kotyhoroshko-pea'),'1');assert.match(a.notices.at(-1),/котиться горошина/);
  assert.equal(JSON.stringify(a.tracked.at(-1)),JSON.stringify(['Secret Found',{secret:'kotyhoroshko-pea'}]));
  assert(a.interactables.some(o=>/Булава/.test(o.userData?.title||'')),'the mace');
  assert(a.w.books.some(m=>m.userData.book.title==='Котигорошко'&&inK(world(m).x,world(m).z)&&world(m).z>K.cz+K.d/2-1.5),'and his tale at its foot');
  for(const [opts,why] of [[{stored:['athenaeum-kotyhoroshko-pea']},'found for good'],[{search:'?pea'},'?pea shows it']]){const b=wing(opts);b.w.enter('ukrainian');assert(b.interactables.some(o=>/Булава/.test(o.userData?.title||'')),why)}
});

test('the tale’s words are the tale’s own, in the library’s Котигорошко',()=>{
  const text=zlib.gunzipSync(fs.readFileSync(`texts/bundled-gzip/pg${resolved['Котигорошко [uk]'].id}.txt.gz`)).toString('utf8'),letters=s=>s.toLowerCase().replace(/[^а-яіїєґ]/g,'');
  const block=source.slice(source.indexOf('const KOTYHOROSHKO='),source.indexOf('};',source.indexOf('const KOTYHOROSHKO=')));let n=0;
  for(const [,quote] of block.matchAll(/«([^»]+)»/g)){assert(letters(text).includes(letters(quote)),`«${quote}»`);n++}
  assert.equal(n,2);
});

test('its seasons: St Nicholas’s pillow from 1 to 19 December, bunting on 1 June, and neither on an ordinary day',()=>{
  const has=(a,re)=>a.interactables.some(o=>re.test(o.userData?.title||''));
  const plain=wing();plain.w.enter('ukrainian');assert(!has(plain,/Святий Миколай/));assert(!has(plain,/День захисту дітей/));
  const dec=wing({date:new Date(2026,11,6)});dec.w.enter('ukrainian');assert(has(dec,/Святий Миколай/));
  const jun=wing({date:new Date(2027,5,1)});jun.w.enter('ukrainian');assert(has(jun,/День захисту дітей/));
  const asked=wing({search:'?mykolai&bunting'});asked.w.enter('ukrainian');assert(has(asked,/Святий Миколай/)&&has(asked,/День захисту дітей/));
});

test('it borrows the wing’s second lamp, adds no light of its own, and is wired as the rest of the wing',()=>{
  const body=source.slice(source.indexOf('function furnishUkrainian('),source.indexOf('// ---------- the books ----------'));assert.doesNotMatch(body,/Light\(/);
  assert.match(source,/if\(annex\)\{lamps\[1\]\.position\.set\(annex\.cx,annex\.h-\.75,annex\.cz\)/);
  assert.match(source,/older:OLDER,annex:CHILDREN_ROOM/);assert.match(source,/PEA_KEY='athenaeum-kotyhoroshko-pea'/);
});

test('a window over the bench looks out on the season: a snowy evening of sledging from November to February, summer the rest of the year',()=>{
  const view=a=>a.interactables.find(o=>o.userData?.title==='Вікно · A window');
  const jan=wing({date:new Date(2027,0,10)});jan.w.enter('ukrainian');const w=view(jan);assert(w,'the window');assert.equal(w.userData.season,'winter');assert.match(w.userData.author,/санчатах/);
  const p=world(w);assert(inK(p.x,p.z)&&p.x>K.cx+K.w/2-.5,'in the children’s room’s east wall');assert(w.position.y>1.5,'above the bench');
  for(const [y,m] of [[2026,10],[2026,11],[2027,1]]){const a=wing({date:new Date(y,m,8)});a.w.enter('ukrainian');assert.equal(view(a).userData.season,'winter',`snow in month ${m+1}`)}
  for(const m of [2,9]){const a=wing({date:new Date(2027,m,8)});a.w.enter('ukrainian');assert.equal(view(a).userData.season,'summer',`summer in month ${m+1}`)}
  const jul=wing({date:new Date(2027,6,10)});jul.w.enter('ukrainian');assert.equal(view(jul).userData.season,'summer');assert.match(view(jul).userData.author,/соняшники/);
  const asked=wing({date:new Date(2027,6,10),search:'?winter'});asked.w.enter('ukrainian');assert.equal(view(asked).userData.season,'winter','?winter shows the snow');
});

const SLIDE=(()=>{const m=source.match(/const SLIDE=\{z:([\d.-]+),half:([\d.]+),x0:([\d.-]+),step:([\d.]+),rise:([\d.]+),steps:(\d+),deck:([\d.]+),chute:([\d.]+)\}/).slice(1).map(Number);
  const [z,half,x0,step,rise,steps,deck,chute]=m,xDeck=x0+steps*step;return {z,half,x0,step,rise,steps,deck,chute,top:steps*rise,xDeck,xChute:xDeck+deck,xEnd:xDeck+deck+chute}})();
// Walk standing at each spot in turn, as the slide's steps are taken from where the reader is.
function climb(a,from,to,reach=.25){
  const seen=new Set(),queue=[[from.x,from.z]],key=(x,z)=>`${x.toFixed(1)},${z.toFixed(1)}`;
  while(queue.length){const [x,z]=queue.shift();if(Math.hypot(x-to.x,z-to.z)<reach)return true;
    for(const [dx,dz] of [[.1,0],[-.1,0],[0,.1],[0,-.1]]){const nx=x+dx,nz=z+dz,k=key(nx,nz);if(seen.has(k))continue;a.player.pos.set(x,0,z);if(!a.w.allowed(nx,nz))continue;seen.add(k);queue.push([nx,nz])}}
  return false;
}

test('the slide: up the steps one at a time, never on from the side or off the top, and down the chute in a whoosh',()=>{
  const a=wing();a.w.enter('ukrainian');
  assert(inK(SLIDE.x0,SLIDE.z)&&inK(SLIDE.xEnd,SLIDE.z),'in the children’s room');
  assert.equal(a.w.floorAt(SLIDE.xDeck+SLIDE.deck/2,SLIDE.z),SLIDE.top,'the platform');assert.equal(a.w.floorAt(SLIDE.xEnd-.01,SLIDE.z)<.05,true,'the chute comes down to the floor');
  // Standing at the foot of the steps, a reader can climb to the platform.
  const deck={x:SLIDE.xDeck+SLIDE.deck/2,z:SLIDE.z};assert(climb(a,{x:SLIDE.x0-.6,z:SLIDE.z},deck),'up the steps to the platform');
  a.player.pos.set(SLIDE.xDeck+.2,0,SLIDE.z-1);assert.equal(a.w.allowed(SLIDE.xDeck+.2,SLIDE.z),false,'not onto the platform from the side');
  a.player.pos.set(deck.x,0,deck.z);assert.equal(a.w.allowed(deck.x,SLIDE.z+SLIDE.half+.3),false,'not off the top');
  // From the platform, the slide carries the reader down to the bottom.
  const part=find(a,'intl-slide');assert(part);a.w.interact(part);for(let t=1;t<4;t+=.05)a.w.update(t);
  assert(a.player.pos.x>SLIDE.xEnd&&a.w.floorAt(a.player.pos.x,a.player.pos.z)===0,'at the bottom, on the floor');assert(a.w.allowed(a.player.pos.x,a.player.pos.z));
  // From the floor, it says to climb first.
  a.player.pos.set(SLIDE.x0-1,0,SLIDE.z);a.w.interact(part);assert.match(a.notices.at(-1),/Up the steps first/);
});

test('the grey kitten from the lullaby pads about the children’s room and, now and then, curls up asleep in her basket',()=>{
  const a=wing();a.w.enter('ukrainian');const part=()=>a.interactables.find(o=>o.userData?.type==='intl-kitten');
  assert(part(),'the kitten');assert.match(part().userData.author,/«Котику сіренький, котику біленький, котку волохатий, не ходи по хаті»/);
  const at=()=>world(part().parent?.parent?.parent?part().parent:part()),start=JSON.stringify(at());
  const seen=[];let slept=false;for(let t=1;t<600&&!slept;t+=.1){a.w.update(t);seen.push(at());if(/спить/.test(part().userData.title))slept=true}
  assert(new Set(seen.map(p=>`${p.x.toFixed(1)},${p.z.toFixed(1)}`)).size>20,'she walks about');for(const p of seen)assert(inK(p.x,p.z),'always in the children’s room');
  assert(slept,'and falls asleep');a.w.interact(part());assert.match(a.notices.at(-1),/Котик спить/);
  for(let t=600;t<660;t+=.1)a.w.update(t);assert(!/спить/.test(part().userData.title),'and wakes again');
});
