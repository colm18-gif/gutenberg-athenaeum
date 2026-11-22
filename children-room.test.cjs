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
  const interactables=[],notices=[],player={pos:new V(),radius:.42},seats=[],tracked=[],purrs=[];
  const w=context.window.createInternationalWing({THREE,scene:thing(),MAT:any,player,interactables,canvasTexture:()=>thing(),bookMaterial:()=>thing(),
    findBook:id=>ukrainian.find(b=>b.id===id),arrivals:key=>key==='ukrainian'?ukrainian.map(b=>b.id):[],showNotice:t=>notices.push(t),playSample:()=>{},
    move:(x,z)=>player.pos.set(x,0,z),analytics:{track:(n,p)=>tracked.push([n,p])},today:()=>date,storage,
    registerSeat:(parts,group,at,yaw,data)=>{seats.push(data);return data},purr:(d,v)=>purrs.push([d,v])});
  return {w,interactables,notices,player,seats,store,tracked,purrs};
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
  assert.equal(U.annex.cx-U.annex.w/2,U.cx+U.w/2,'the two rooms meet at the east wall');assert(U.annex.cz-U.annex.d/2>=U.cz-U.d/2&&U.annex.cz+U.annex.d/2<=U.cz+U.d/2,'the children’s room’s west wall is part of the reading room’s east wall');
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
  // The arch is in the middle of the children’s room’s wall (K.cz), not of the deeper reading room’s.
  for(const dx of [-.1,.1])assert.equal(a.w.allowed(wallX+dx,K.cz),true,'through the arch');
  for(const dx of [-.1,.1])for(const z of [K.cz-4,K.cz+4,U.cz+U.d/2-1])assert.equal(a.w.allowed(wallX+dx,z),false,'but not past the wall beside it');
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
  // Read for the children's room too: Малий Мирон (it foretells the boy's ruin) and Галя (she ends in the Dnipro) are for adults.
  for(const t of ['Малий Мирон','Дев’ять братів і десята сестриця Галя'])assert(!titles.includes(t)&&main.includes(t),`${t} is on the main racks only`);
  for(const t of ['Біда навчить','Харитя','Ялинка','Грицева шкільна наука'])assert(titles.includes(t),`${t} is in the children’s room`);
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
  for(const f of walkers){const p=world(f);assert(Math.abs(p.x-(U.cx+U.w/2))<1&&Math.abs(p.z-K.cz)<3.2,'beside the arch, in the reading room')}
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

test('the children’s books have painted picture covers, which the game’s real-cover swap leaves alone',()=>{
  const a=wing();a.w.enter('ukrainian');const kids=a.w.books.filter(m=>m.userData.childrenRoom);
  assert(kids.length>=10);for(const m of kids)assert.equal(m.userData.pictureCover,true,`${m.userData.book.title} has a picture cover`);
  for(const t of ['Рукавичка','Котигорошко','Біда навчить','Ялинка','Байки'])assert(source.includes(`case '${t}':`),`a picture for ${t}`);
  assert.match(game,/object\.userData\.cinderBinding\|\|object\.userData\.pictureCover\|\|/,'applyBookCover skips them');
});

test('pictures from old public-domain editions: Lissitzky’s Pan Kotsky in the reader, and two of Narbut’s letters on the walls',()=>{
  const c={window:{},Math,Date,JSON,Set,Map,Object,Array,Number,String,location:{search:''},setTimeout:()=>0};vm.runInNewContext(source,c);
  const P=c.window.createInternationalWing.BOOK_PICTURES;assert(P['Пан Коцький']?.length,'Pan Kotsky has a picture');
  for(const [title,list] of Object.entries(P)){assert(ukrainian.some(b=>b.title===title),`${title} is a book of the room`);
    for(const p of list){assert(fs.existsSync(p.src),p.src);assert.match(p.credit,/Public domain/);assert(p.caption&&/\(.+\)/.test(p.caption),'Ukrainian, with English after it')}}
  const shown=JSON.parse(fs.readFileSync('assets/pictures/pictures.json','utf8'));
  for(const key of ['kids-pan-kotsky-1922','kids-narbut-z','kids-narbut-y'])assert.equal(shown[key]?.licence,'Public domain',key);
  assert.equal(shown['kids-pan-kotsky-1922'].artist,'El Lissitzky');assert.equal(shown['kids-narbut-z'].artist,'Heorhii Narbut');
  assert.match(source,/picture\('kids-narbut-z',/);assert.match(source,/picture\('kids-narbut-y',/);assert.doesNotMatch(source,/picture\('kids-narbut-a',/,'Narbut’s А was left out');
  assert.match(game,/button\.textContent='Малюнки · Pictures'/);assert.match(game,/list=pictures\(\)\[book\?\.title\]\|\|\[\];button\.classList\.toggle\('hidden',!list\.length\)/);
  assert.match(fs.readFileSync('index.html','utf8'),/<div id="pictureCard" class="hidden" role="dialog"/);
});

test('the kitten purrs when stroked, comes running for treats (three in five minutes) and scratches at her post',()=>{
  const a=wing();a.w.enter('ukrainian');const cat=()=>a.interactables.find(o=>o.userData?.type==='intl-kitten'),at=()=>world(cat().parent?.parent?.parent?cat().parent:cat());
  a.w.update(1);a.w.interact(cat());assert.equal(a.purrs.length,1,'she purrs');assert.match(a.notices.at(-1),/муркоче/);
  const post=a.interactables.find(o=>/Кігтеточка/.test(o.userData?.title||''));assert(post,'a scratching post');assert(inK(world(post).x,world(post).z));
  const tin=a.interactables.find(o=>o.userData?.type==='intl-treats');assert(tin,'a tin of treats');const tp=world(tin);
  a.w.interact(tin);assert.match(a.notices.at(-1),/біжить/);let t=1;for(;t<40;t+=.1){a.w.update(t);const p=at();if(Math.hypot(p.x-(tp.x-.4),p.z-tp.z)<.1)break}
  assert(t<40,'she runs to the treats');const before=a.purrs.length;for(let k=0;k<5;k++)a.w.update(t+=.1);assert(a.purrs.length>before,'and purrs over them');
  a.w.interact(tin);a.w.interact(tin);a.w.interact(tin);assert.match(a.notices.at(-1),/наївся/,'three in five minutes, then she has had enough');
  // On her rounds she comes to the post.
  const b=wing();b.w.enter('ukrainian');const pp=world(b.interactables.find(o=>/Кігтеточка/.test(o.userData?.title||'')));let near=false;
  const kit=()=>b.interactables.find(o=>o.userData?.type==='intl-kitten');for(let t2=1;t2<400&&!near;t2+=.1){b.w.update(t2);const p=world(kit().parent?.parent?.parent?kit().parent:kit());if(Math.hypot(p.x-pp.x,p.z-pp.z)<.6)near=true}
  assert(near,'she visits her post');
});

test('when Clio comes to sleep in the children’s room, the kitten trots over and curls up against her',()=>{
  const a=wing();a.w.enter('ukrainian');a.w.update(1);const k=a.w.kitten;assert(k?.meet,'game.js can reach the kitten');
  assert.deepEqual(Object.keys(a.w.children).filter(x=>['cx','cz','w','d'].includes(x)).sort(),['cx','cz','d','w']);
  // Clio's place there (game.js) is open floor, and so is the kitten's beside her.
  const spot=/x:K\.cx\+([\d.]+),y:0,z:K\.cz-([\d.]+),yaw:0,key:'ukrainian'/.exec(game);assert(spot,'Clio’s place in the children’s room');
  const cx=K.cx+Number(spot[1]),cz=K.cz-Number(spot[2]);
  for(const [x,z] of [[cx,cz],[cx+.5,cz],[cx-.5,cz],[cx+.15,cz+.62]])assert(inK(x,z)&&a.w.allowed(x,z),`(${x.toFixed(1)}, ${z.toFixed(1)}) is open floor`);
  k.meet(cx+.15,cz+.62);let t=1;for(;t<40&&!k.asleep;t+=.1)a.w.update(t);
  assert(k.asleep,'she curls up');assert(Math.hypot(k.x-(cx+.15),k.z-(cz+.62))<.1,'against Clio');
  assert.match(a.interactables.find(o=>o.userData?.type==='intl-kitten').userData.title,/Clio/);
  for(;t<90&&k.asleep;t+=.1)a.w.update(t);assert(!k.asleep,'and wakes, and goes back to her rounds');
});

// Україна англійською: the case of Ukrainian books in English on the Ukrainian room's south wall, west of the door, and
// the reader's links between a book and its translation.
const englishShelf=load('data/new-books.js','ATHENAEUM_NEW_BOOKS')||[];
test('the case of Ukrainian books in English stands on the south wall between the door and Pymonenko, and holds its shelf',()=>{
  const list=(Array.isArray(englishShelf)?englishShelf:[]).filter(e=>e[4]==='ukrainian-english');
  assert(list.length>=4,'the shelf has its books');
  const english=list.map(e=>({id:e[0]??resolved[e[1]]?.id,title:e[1],author:e[2]})).filter(b=>b.id&&resolved[b.title]);
  const store=new Map(),context={window:{},Math,Date,JSON,Set,Map,Object,Array,Number,String,location:{search:''},setTimeout:()=>0};
  vm.runInNewContext(source,context);const interactables=[];
  const w=context.window.createInternationalWing({THREE,scene:thing(),MAT:any,player:{pos:new V(),radius:.42},interactables,canvasTexture:()=>thing(),bookMaterial:()=>thing(),
    findBook:id=>ukrainian.find(b=>b.id===id)||english.find(b=>b.id===id),arrivals:key=>key==='ukrainian'?ukrainian.map(b=>b.id):key==='ukrainian-english'?english.map(b=>b.id):[],
    showNotice:()=>{},playSample:()=>{},move:()=>{},analytics:{track:()=>{}},today:()=>new Date(2026,10,8),storage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)},registerSeat:(p,g,a,y,d)=>d});
  w.enter('ukrainian');const U=w.rooms.ukrainian,S=U.cz+U.d/2;
  const books=interactables.filter(o=>o.userData?.wingRoom==='ukrainian-english');
  assert.equal(books.length,Math.min(6,english.length),'every book of the shelf is out, up to six');
  for(const b of books){const {x,z}=world(b);assert(x>U.cx-5.3&&x<U.cx-1.9,'west of the door, east of the picture and the bandura');assert(Math.abs(z-(S-.42))<.01,'against the south wall')}
  const sign=interactables.find(o=>o.userData?.title==='Україна англійською');assert(sign,'the plaque has its card');
  assert.match(sign.userData.author,/[А-Яа-яІіЇїЄє].*\(.*Ukrainian books in English.*\)/,'in Ukrainian, then English');
});

test('a Ukrainian book and its English translation link to each other, both ways, and the reader shows the link',()=>{
  const context={window:{},Math,Date,JSON,Set,Map,Object,Array,Number,String,location:{search:''},setTimeout:()=>0};vm.runInNewContext(source,context);
  const links=context.window.createInternationalWing.TRANSLATIONS,ids=new Set(Object.values(resolved).map(r=>r.id));
  assert(Object.keys(links).length>=2);
  for(const [from,list] of Object.entries(links))for(const to of list){
    assert(ids.has(Number(from))&&ids.has(to.id),`${from} and ${to.id} are both in the library`);
    assert(links[to.id]?.some(back=>back.id===Number(from)),`${to.id} links back to ${from}`);
    assert.match(to.label,/In English|In Ukrainian/)}
  // Пан Коцький opens Bain's book at The Fox and the Cat, which is the same tale.
  const bain=zlib.gunzipSync(fs.readFileSync('texts/bundled-gzip/pg29672.txt.gz')).toString(),flat=t=>t.replace(/\s+/g,' ');
  for(const list of Object.values(links))for(const to of list)if(to.at)assert(flat(fs.existsSync(`texts/bundled-gzip/pg${to.id}.txt.gz`)?zlib.gunzipSync(fs.readFileSync(`texts/bundled-gzip/pg${to.id}.txt.gz`)).toString():'').includes(to.at),`${to.at} is in ${to.id}`);
  assert.match(flat(bain),/THE FOX AND THE CAT In a certain forest there once lived a fox/);
  assert.match(game,/button.id=i\?'bookTranslation2':'bookTranslation'/);assert.match(game,/createInternationalWing\?\.TRANSLATIONS/);
  assert.match(game,/wingBooks\.load\(\)\.then\(\(\)=>\{const book=books\.find\(b=>b\.id===link\.id\)/,'the wing’s books are fetched before a Ukrainian original is opened');
});

test('the memorial bay: a reader walks in from the room through its opening, not through the wall either side of it, and finds both memorials there',()=>{
  const a=wing();a.w.enter('ukrainian');const U=a.w.rooms.ukrainian,S=U.cz+U.d/2,B=U.bay,b0=U.cx+B.x0,b1=U.cx+B.x1,mid=(b0+b1)/2;
  assert.equal(U.cz-U.d/2,92.5,'the north wall stayed where it was');
  assert(walk(a.w.allowed,{x:a.player.pos.x,z:a.player.pos.z},{x:mid,z:S+1}),'from the door into the bay');
  assert.equal(a.w.roomAt(mid,S+2),'ukrainian','the bay is part of the room');
  for(const x of [b0-1,b1+1])assert.equal(a.w.allowed(x,S+.3),false,'not through the south wall beside the opening');
  assert.equal(a.w.allowed(mid,S+B.depth-.1),false,'nor through the bay’s back wall');assert.equal(a.w.allowed(b0+.1,S+2),false);assert.equal(a.w.allowed(b1-.1,S+2),false);
  const inBay=o=>{const p=world(o);return p.x>b0&&p.x<b1&&p.z>S&&p.z<S+B.depth};
  const memorial=a.interactables.filter(o=>o.userData?.type==='book'&&!o.userData.wingRoom?.includes('english')&&inBay(o));
  assert.equal(memorial.length,8,'the Executed Renaissance’s eight books are in the bay');
  for(const o of memorial)assert(world(o).x<mid,'on its west side');
  const unwritten=a.interactables.filter(o=>o.userData?.title==='Недописані · The Unwritten');assert.equal(unwritten.length,2,'the spines and their plaque');
  for(const o of unwritten){assert(inBay(o),'the Unwritten is in the bay');assert(world(o).x>mid,'on its east side');assert(o.position.y>1&&o.position.y<2.2,'at eye level')}
  const candle=a.interactables.filter(o=>o.userData?.title==='Розстріляне відродження'&&inBay(o));assert(candle.length>=3,'the candle and the board');
  assert(a.seats.some(s=>s.title==='Лава · A bench'&&s.bookIds.length===8),'the bench is a seat, opening one of the eight');
  // The bay must not reach the Italian room to the south.
  const I=a.w.rooms.italian;assert(S+B.depth+2<I.cz-I.d/2);
});

test('the Wikisource books stand on the west wall either side of the window, facing into the room, and none in the middle of it',()=>{
  const a=wing();a.w.enter('ukrainian');const U=a.w.rooms.ukrainian,W=U.cx-U.w/2,N=U.cz-U.d/2;
  const books=a.interactables.filter(o=>o.userData?.type==='book'&&o.userData.wingRoom==='ukrainian'&&!o.userData.childrenRoom&&!o.userData.featured);
  const west=books.filter(o=>Math.abs(world(o).x-(W+.52))<.01),north=books.filter(o=>Math.abs(world(o).z-(N+.42))<.01);
  assert.equal(north.length,36,'the north racks are full');assert(west.length>0,'the rest are on the west wall');
  for(const o of west){const {z}=world(o);assert.equal(o.rotation.y,Math.PI/2,'facing into the room');
    assert(Math.abs(z-U.cz)>3.6,'clear of the window and its rushnyk');assert(z>N+.9&&z<U.cz+U.d/2-.3,'between the north racks and the south wall')}
  const placed=new Set([...west,...north]);
  for(const o of books.filter(o=>!placed.has(o))){const {x,z}=world(o);
    assert(Math.abs(x-U.cx)>U.w/2-1.2||Math.abs(z-U.cz)>U.d/2-1.2||z>U.cz+U.d/2,`${o.userData.book.title} stands against a wall or in the bay, not in the middle of the room`)}
});

test('the chronicle frieze: its panels run in order along the top of the south wall, clear of everything below, each with a card in Ukrainian and English',()=>{
  const a=wing();a.w.enter('ukrainian');const U=a.w.rooms.ukrainian,S=U.cz+U.d/2;
  const H=vm.runInNewContext(`(()=>{${source.slice(source.indexOf('const HISTORY='),source.indexOf('}];',source.indexOf('const HISTORY='))+3)};return HISTORY})()`);
  assert(H.length>=12,'a long history');
  const panels=a.interactables.filter(o=>H.some(h=>o.userData?.title===`${h.name} · ${h.years}`));
  assert.equal(panels.length,H.length,'one panel for each moment');
  panels.forEach((p,i)=>{const {x,z}=world(p);assert(Math.abs(z-(S-.16))<.01,'on the south wall');assert(p.position.y-.5>=4.7,'above the door, the cases and the bay’s lintel');
    assert.equal(p.userData.title,`${H[i].name} · ${H[i].years}`,'in order');if(i)assert(x<world(panels[i-1]).x,'read left to right from inside the room')});
  for(const h of H)assert.match(h.card,/[А-Яа-яІіЇїЄєҐґ].*\. \([A-Z].*\)$/,`${h.name}: Ukrainian, then English in brackets`);
});
