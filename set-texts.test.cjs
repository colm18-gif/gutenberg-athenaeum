const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8'),source=fs.readFileSync('set-texts-room.js','utf8'),reader=fs.readFileSync('read.html','utf8');
const arrivals=(()=>{const c={window:{}};vm.runInNewContext(fs.readFileSync('data/new-books.js','utf8'),c);return c.window.ATHENAEUM_NEW_BOOKS})();
const resolved=(()=>{const c={window:{}};vm.runInNewContext(fs.readFileSync('data/new-books-resolved.js','utf8'),c);return c.window.ATHENAEUM_NEW_BOOKS_RESOLVED.books})();
class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){Object.assign(this,{x,y,z});return this}clone(){return new V().set(this.x,this.y,this.z)}}
class O{constructor(){this.children=[];this.parent=null;this.position=new V();this.scale=new V().set(1,1,1);this.rotation={x:0,y:0,z:0,order:'XYZ',set(x,y,z){Object.assign(this,{x,y,z})}};this.quaternion={clone:()=>({})};this.userData={}}
  add(...m){for(const c of m){c.parent=this;this.children.push(c)}return this}removeFromParent(){if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1);this.parent=null}traverse(fn){fn(this);this.children.forEach(c=>c.traverse(fn))}}
class Mesh extends O{constructor(g,m){super();this.geometry=g;this.material=m}}
const G=class{dispose(){}},M=class{constructor(p){Object.assign(this,p)}dispose(){}};
const THREE={Group:O,Mesh,Vector3:V,BoxGeometry:G,CylinderGeometry:G,PlaneGeometry:G,MeshStandardMaterial:M,MeshBasicMaterial:M,PointLight:class extends O{}};
const plays=arrivals.filter(e=>e[4]==='set-texts');
function room(){
  const context={window:{},Math};vm.runInNewContext(source,context);
  const scene=new O(),interactables=[],notices=[],seats=[],player={pos:new V(),radius:.42};
  const r=context.window.createSetTextsRoom({THREE,scene,MAT:{wood:new M({}),darkWood:new M({})},player,interactables,canvasTexture:()=>({dispose(){}}),bookMaterial:()=>new M({}),
    findBook:id=>({id,title:'Book '+id,author:'A'}),arrivals:plays.map(e=>resolved[e[1]]?.id||e[0]),showNotice:t=>notices.push(t),playSample:()=>{},move:(x,z)=>player.pos.set(x,0,z),
    registerSeat:(parts,group,eye,yaw,options)=>{const data={...options};seats.push(data);return data}});
  return {r,scene,interactables,notices,seats,player};
}

test('the Set Texts Room loads before the game and is wired in like the other rooms behind doors',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);assert(order.indexOf('set-texts-room.js')>=0&&order.indexOf('set-texts-room.js')<order.indexOf('game.js'));
  assert.match(game,/const setTextsRoom=window\.createSetTextsRoom\?\.\(/);assert.match(game,/\['set-texts-room','The set texts room'\]/);assert.match(game,/'set-texts':'set-texts-room'/);
  assert.match(game,/'set-texts-room':setTextsRoom&&\(\(\)=>setTextsRoom\.enter\(\)\)/);assert.match(game,/setTextsRoom\?\.update\(t\)/);
  assert(game.indexOf('const learnersRoom=')<game.indexOf('const setTextsRoom='),'the English Reading Room is built first: its east wall holds the door');
  assert.match(fs.readFileSync('room-ambience.js','utf8'),/'set-texts-room':\{/);
  assert.match(fs.readFileSync('scripts/new-books.mjs','utf8'),/'set-texts'/);assert.match(fs.readFileSync('scripts/book-pages.mjs','utf8'),/'set-texts':'The Set Texts Room'/);
});

test('the Shakespeare plays set for GCSE are all here, each with a librarian’s note',()=>{
  const titles=plays.map(e=>e[1]);
  for(const t of ['Macbeth','The Tempest','The Merchant of Venice','Much Ado About Nothing','Julius Caesar'])assert(titles.includes(t),t);
  for(const e of plays){assert.equal(e[2],'William Shakespeare');assert(e[5].length>120,`${e[1]} has a note`);assert(resolved[e[1]]?.id,`${e[1]} is resolved`)}
  const {r}=room(),{plays:shelved,novels}=r.catalogue();assert.equal(shelved.length,6,'six plays on the west wall');assert.equal(novels.length,9);
  assert.equal(shelved[0].id,resolved.Macbeth.id,'Macbeth first');assert.equal(shelved[1].id,1513,'then Romeo and Juliet');
});

test('the room is kept out of the English Reading Room, which keeps only one darker book',()=>{
  const learners=fs.readFileSync('learners-room.js','utf8'),shelves=learners.match(/const SHELVES=\[([\s\S]*?)\];/)[1];
  for(const id of [1533,84,2097,36])assert(!new RegExp(`\\b${id}\\b`).test(shelves),`${id} is not on the English Reading Room's shelves`);
  for(const e of arrivals)assert(!(/^learners/.test(e[4])&&e[1]==='Macbeth'));
});

test('the room is built on the way in, has seats, a board for teachers, and a door each way; it is freed after',()=>{
  const a=room();assert.equal(a.r.built,false);
  const door=a.interactables.find(o=>o.userData.type==='settexts-door');assert(door,'the door hangs in the English Reading Room');
  assert(Math.abs(a.r.door.x-(-322.15))<.01&&a.r.door.z<-53&&a.r.door.z>-56,'on its east wall, near the south-east corner');
  a.r.interact(door);assert.equal(a.r.built,true);assert(a.r.contains(a.player.pos.x,a.player.pos.z),'through the door into the room');assert.match(a.notices.at(-1),/Set Texts Room/);
  assert.equal(a.r.books.length,16,'six plays, nine novels and the anthology');assert(a.r.books.some(b=>b.userData.book.id===940001&&b.userData.shelf==='poems'),'the anthology is on its lectern');assert.equal(a.seats.length,4);
  for(const b of a.r.books)assert(a.r.allowed(b.position.x+Math.sin(b.rotation.y)*1.3,b.position.z+Math.cos(b.rotation.y)*1.3),`a reader can stand before ${b.userData.book.id}`);
  const board=a.interactables.find(o=>o.userData.type==='settexts-card'&&o.userData.title==='Set texts');assert.match(board.userData.author,/libraryafterdark\.space\/set-texts/);
  assert(a.r.allowed(a.r.room.cx,a.r.room.cz+a.r.room.d/2-1.4),'the reader arrives on open floor');
  const exit=a.interactables.find(o=>o.userData.type==='settexts-exit');a.r.interact(exit);assert(Math.abs(a.player.pos.x-(a.r.door.x-1.6))<.01,'back into the English Reading Room');
  a.player.pos.set(0,0,0);a.r.update(1);a.r.update(40);assert.equal(a.r.built,false);assert(!a.interactables.some(o=>o.userData.type==='book'));assert(a.interactables.includes(door),'the door stays');
});

test('the plain text reader gives every chapter, act and scene an address, and opens at it',()=>{
  assert.match(reader,/\(chapter\|book\|part\|canto\|act\|scene\|stave\|letter\|prologue\|epilogue/);
  assert.match(reader,/function headings\(\)/);assert.match(reader,/if\(\/\^scene\\b\/i\.test\(t\)&&act\)return \{p,key:act\+'-'\+key,sub:true\}/);
  assert.match(reader,/const target=location\.hash\.length>1&&document\.getElementById/);
  const page=fs.readFileSync('set-texts/index.html','utf8');
  for(const id of [1533,1513,43,46])assert(page.includes(`/read.html?book=${id}&amp;from=`),`the page links to ${id}'s plain text`);
  assert.match(page,/<a class="read" href="\/\?room=set-texts">/);assert.match(fs.readFileSync('sitemap.xml','utf8'),/\/set-texts\/<\/loc>/);
});

test('the poetry anthology is bound from Wikisource, every poem with its poet, a note, its page, and an address on the teachers’ page',async()=>{
  const {ANTHOLOGY,POEMS,tidy,extract}=await import('./scripts/anthology.mjs');
  const text=require('node:zlib').gunzipSync(fs.readFileSync(`texts/bundled-gzip/pg${ANTHOLOGY.id}.txt.gz`)).toString('utf8');
  assert.match(text,/^Title: Poems from the Anthologies\nAuthor: Various\nLanguage: English\nSource: Wikisource/);
  assert.match(game,new RegExp(`books\\.push\\(\\{id:${ANTHOLOGY.id},title:'${ANTHOLOGY.title}'`));
  const note=JSON.parse(fs.readFileSync('data/librarian-notes.json','utf8'))[ANTHOLOGY.id];assert(note,'the anthology has a librarian’s note');
  for(const section of new Set(POEMS.map(p=>p[0])))assert(text.includes(`\n\n${section.toUpperCase()}\n\n`),section);
  const page=fs.readFileSync('set-texts/index.html','utf8'),bound=POEMS.filter(([,heading])=>text.includes(`\n\n${heading.toUpperCase()}\n\n`));
  assert.equal(bound.length,POEMS.length,'every poem is bound');
  const counts=['Twenty','Twenty-one','Twenty-two','Twenty-three','Twenty-four','Twenty-five'];assert(note.startsWith(counts[POEMS.length-20]+' poems'),'the note counts the poems');
  for(const [,heading,poet,,,,blurb] of POEMS){const at=text.indexOf(`\n\n${heading.toUpperCase()}\n\n${poet}\n\n`);assert(at>0,`${heading} has its poet`);
    const part=text.slice(at,text.indexOf('From Wikisource: https://en.wikisource.org/wiki/',at));assert(part.includes(blurb),`${heading} has its note`);
    assert(!/^[A-Z]{2,}[ ,]+[a-z]/m.test(part.slice(heading.length+4)),`${heading} keeps no printer’s capitals`);assert(!/--|\d\s*$/m.test(part.slice(heading.length+4)),`${heading} has no line numbers or typed dashes`);
    const id=heading.normalize('NFKD').toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
    assert(page.includes(`/read.html?book=${ANTHOLOGY.id}&amp;from=`)&&page.includes(`#${id}">${heading.replace(/&/g,'&amp;')}</a>`),`the teachers’ page links to ${heading}`)}
  assert.equal(tidy('THE fountains mingle with the river,\nAnd the rivers --- with the ocean;10',{stanzas:[2]}).poem,'The fountains mingle with the river,\nAnd the rivers — with the ocean;');
  assert.match(tidy('one\ntwo',{stanzas:[3]}).error,/2 lines/);
  assert.equal(extract('EXPOSURE\nOur brains ache\nBut nothing happens.\nmore\nBut nothing happens.\nNotes',['Our brains ache'],'But nothing happens',{final:true}).split('\n').length,4,'to the refrain’s last return');
});
