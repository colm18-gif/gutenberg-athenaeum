const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8'),credits=fs.readFileSync('ASSET_CREDITS.md','utf8');
const dictionary=JSON.parse(fs.readFileSync('data/learner-dictionary.json','utf8'));
const levels=(()=>{const c={window:{}};vm.runInNewContext(fs.readFileSync('data/learner-levels.js','utf8'),c);return c.window.ATHENAEUM_LEARNER_LEVELS})();
function wordHelp(){
  const store=new Map(),context={window:{},document:{getElementById:()=>null},localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v))},
    fetch:async()=>({ok:true,json:async()=>dictionary}),setTimeout,Promise,JSON,Object,Array,String,RegExp,Math};
  vm.runInNewContext(fs.readFileSync('word-help.js','utf8'),context);return {help:context.window.libraryWordHelp,core:context.window.ATHENAEUM_WORD_HELP_CORE,store};
}

test('the room, the word help and their data load before the game',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);
  for(const file of ['data/learner-levels.js','word-help.js','learners-room.js'])assert(order.indexOf(file)>=0&&order.indexOf(file)<order.indexOf('game.js'),file);
  assert(!order.includes('data/learner-dictionary.json'),'the dictionary is only fetched when a word is looked up');
  assert.match(game,/const learnersRoom=window\.createLearnersRoom\?\.\(/);assert.match(game,/\['learners-room','The English reading room'\]/);
  assert.match(game,/window\.libraryWordHelp\?\.install\(\)/);
  assert.match(game,/if\(window\.libraryWordHelp\?\.active\)return;if\(f>\.68\)pageStep\(1\)/,'with word help on, a tap looks up a word instead of turning the page');
  assert.match(credits,/WordNet 3\.0 Copyright 2006 by Princeton University/);
});

test('every graded book has a level from 1 to 4 and a reading time, spread evenly',()=>{
  const entries=Object.entries(levels);assert(entries.length>=300);
  for(const [id,[level,minutes,words]] of entries){assert(/^\d+$/.test(id));assert([1,2,3,4].includes(level));assert(minutes>=1&&words>=800)}
  for(const level of [1,2,3,4])assert(entries.filter(([,v])=>v[0]===level).length>=entries.length*.2);
  assert.equal(levels[11][0]<=2,true,'Alice is among the gentler books');
});

test('the pocket dictionary is compact and suitable for learners',()=>{
  assert.equal(Object.keys(dictionary.w).length,20000);assert.match(dictionary.about,/WordNet 3\.0, Copyright 2006 by Princeton University/);
  assert(fs.statSync('data/learner-dictionary.json').size<2.5e6);
  for(const [word,senses] of Object.entries(dictionary.w)){assert(senses.length>=1&&senses.length<=2,word);for(const [pos,gloss] of senses){assert(['noun','verb','adjective','adverb'].includes(pos));assert(gloss.length<=110,word);assert.doesNotMatch(gloss,/offensive|slur|obscene/i,word)}}
  assert.match(dictionary.w.run[0][1],/move fast/);assert.match(dictionary.w.queer[0][1],/usual/);assert.match(dictionary.w.whale[0][1],/sea mammal/);
  assert.equal(dictionary.w.peking,undefined,'names are left out');assert.equal(dictionary.f.went,'go');
});

test('looking up a word finds its dictionary form, old words and small words',async()=>{
  const {help,core}=wordHelp();await help.load();
  assert.deepEqual([...core.lemmaCandidates('running')].slice(-1),['run']);
  assert.equal(help.lookup('went').lemma,'go');assert.equal(help.lookup('children').lemma,'child');assert.equal(help.lookup('books').lemma,'book');assert.equal(help.lookup('happier').lemma,'happy');
  assert.equal(help.lookup("'Tis").old,true);assert.match(help.lookup('thee').senses[0][1],/you/);
  assert.match(help.lookup('a').senses[0][1],/one; any/,'small words come from the hand-written list, not the physics unit');
  assert.equal(help.lookup('art').senses[0][0],'in older books');assert.equal(help.lookup('Xylophonist-Qq'),null);
  help.save({w:'lantern',m:'a lamp you can carry',b:'Dracula'});help.save({w:'lantern',m:'a lamp you can carry',b:'Dracula'});assert.equal(help.notebook().length,1,'a word is saved once');
  assert.equal(help.active,false);help.setEnabled(true);assert.equal(help.active,true,'active follows the switch');help.setEnabled(false);assert.equal(help.active,false);
});

// ---- the room, with a small stand-in for three.js ----
class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){Object.assign(this,{x,y,z});return this}clone(){return new V().set(this.x,this.y,this.z)}}
class O{constructor(){this.children=[];this.parent=null;this.position=new V();this.rotation={x:0,y:0,z:0,order:'XYZ'};this.quaternion={clone:()=>({})};this.userData={}}add(...m){for(const c of m){c.parent=this;this.children.push(c)}}removeFromParent(){if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1);this.parent=null}traverse(fn){fn(this);this.children.forEach(c=>c.traverse(fn))}}
class Mesh extends O{constructor(g,m){super();this.geometry=g;this.material=m}}
let disposed=0;const G=class{dispose(){disposed++}},M=class{constructor(p){Object.assign(this,p)}dispose(){disposed++}};
const THREE={Group:O,Mesh,BoxGeometry:G,CylinderGeometry:G,SphereGeometry:G,PlaneGeometry:G,MeshStandardMaterial:M,MeshBasicMaterial:M,PointLight:class extends O{constructor(c,i){super();this.isPointLight=true;this.intensity=i}}};
function room(language='es-ES'){
  const context={window:{},Math,Date};vm.runInNewContext(fs.readFileSync('learners-room.js','utf8'),context);
  const scene=new O(),interactables=[],notices=[],player={pos:new V(),radius:.42},catalogue=[...new Set([...Object.keys(levels).map(Number),1448])].map(id=>({id,title:'Book '+id,author:'A'}));
  const r=context.window.createLearnersRoom({THREE,scene,MAT:{wood:new M({}),darkWood:new M({}),brass:new M({})},player,interactables,canvasTexture:()=>({dispose(){disposed++}}),bookMaterial:()=>new M({}),
    findBook:id=>catalogue.find(b=>b.id===id),levels,wordHelp:{notebook:()=>[{w:'lantern',m:'a lamp you can carry'}],speak:()=>true},showNotice:t=>notices.push(t),playSample:()=>{},sound:()=>{},
    move:(x,z)=>player.pos.set(x,0,z),language:()=>language,today:()=>new Date('2026-09-27T12:00:00Z')});
  return {r,scene,interactables,notices,player};
}
test('the room builds on approach with graded shelves, and is freed after the reader leaves',()=>{
  const {r,scene,interactables,notices,player}=room();const doorOnly=scene.children.length;
  assert.equal(r.built,false);player.pos.set(-23,0,5);r.update(1,.1);assert.equal(r.built,true);
  const {graded,short}=r.shelves('2026-09-27');assert.equal(JSON.stringify(graded.map(s=>s.length)),'[4,4,4,4]');
  graded.forEach((list,i)=>list.forEach(e=>assert.equal(e.level,i+1)));
  assert.notEqual(JSON.stringify(r.shelves('2026-09-28').graded.map(l=>l.map(e=>e.book.id))),JSON.stringify(graded.map(l=>l.map(e=>e.book.id))),'a different selection tomorrow');
  assert.deepEqual([...short.map(e=>e.book.id)],[14838,11757,13,14522]);assert(short.every(e=>e.minutes<=90));assert(r.books.every(b=>b.userData.learners===true),'books from here open with word help');
  let lights=0;scene.traverse(o=>{if(o.isPointLight)lights++});assert(lights<=4,'three lamps and the door glow');
  r.interact(interactables.find(o=>o.userData.type==='learners-door'));assert.equal(r.contains(player.pos.x,player.pos.z),true);assert.match(notices.at(-1),/^¡Bienvenidos!/);
  r.interact(interactables.find(o=>o.userData.type==='learners-notebook'));assert.match(notices.at(-1),/lantern \(a lamp you can carry\)/);
  r.interact(interactables.find(o=>o.userData.type==='learners-word'));assert.match(notices.at(-1),/^\w+: /);
  r.interact(interactables.find(o=>o.userData.type==='learners-exit'));player.pos.set(0,0,0);disposed=0;r.update(40,.1);
  assert.equal(r.built,false);assert.equal(scene.children.length,doorOnly);assert(disposed>40);
  assert.equal(interactables.filter(o=>!['learners-door','learners-word'].includes(o.userData.type)).length,0);
  assert(interactables.some(o=>o.userData.type==='learners-door'),'the door in the west wing still answers once the room is freed');
  assert.equal(interactables.filter(o=>o.userData.type==='learners-word').length,1,'only the slate by the door is left, with the word of the day');
});
test('an English browser gets a plain welcome, and the walls keep readers inside',()=>{
  const {r,notices,interactables}=room('en-GB');r.interact(interactables.find(o=>o.userData.type==='learners-door'));assert.match(notices.at(-1),/^The English Reading Room/);
  assert.equal(r.allowed(-330,-60+8),false);assert.equal(r.allowed(-340,-60),false);assert.equal(r.floorAt(-330,-60),0);assert.equal(r.floorAt(0,0),null);
});

test('only hand-picked books for learners, with one darker classic and its note',()=>{
  const {r}=room();const all=new Set();for(let d=1;d<=30;d++)for(const list of r.shelves(`2026-10-${String(d).padStart(2,'0')}`).graded)for(const e of list)all.add(e.book.id);
  for(const id of all)assert([11,46,55,16,1874,1597,2591,2781,289,45,74,120,113,236,1661,514,1448,103,1342,1260,1400,161,158,43].includes(id),`${id} was not chosen by hand`);
  assert(all.has(43),'Jekyll and Hyde appears some days');
  for(const dark of [5200,526,1952,10007,23218,389,64031])assert(!all.has(dark)&&!r.shelves('2026-10-01').short.some(e=>e.book.id===dark),`book ${dark} is not in the room`);
  const shelf=r.shelves('2026-10-01');let jekyll=null;for(let d=1;d<=30&&!jekyll;d++)for(const e of r.shelves(`2026-10-${String(d).padStart(2,'0')}`).graded[3])if(e.book.id===43)jekyll=e;
  assert.match(jekyll.note,/darker story/);assert.equal(shelf.graded[3].every(e=>e.level===4),true);
});
