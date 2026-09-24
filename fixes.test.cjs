const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const game=fs.readFileSync('game.js','utf8');
const html=fs.readFileSync('index.html','utf8');

test('every catalogued book resolves to a written librarian note',()=>{
  const order=[...html.matchAll(/startupScript\('(data\/[^']+)'\)/g)].map(m=>m[1]);
  assert.ok(order.indexOf('data/remaining-notes.js')>order.indexOf('data/book-completions.js'),'remaining notes load after the cover completions');
  const context={window:{}};vm.createContext(context);for(const file of order)vm.runInContext(fs.readFileSync(file,'utf8'),context);
  const w=context.window,json=JSON.parse(fs.readFileSync('data/librarian-notes.json','utf8')),has=id=>!!(w.ATHENAEUM_EXTRA_NOTES[id]||json[id]);
  const ids=[...(w.ATHENAEUM_VERNE_BOOKS||[]).map(([id])=>id),...(w.ATHENAEUM_DOYLE_BOOKS||[]).map(([id])=>id),...(w.ATHENAEUM_WELLS_BOOKS||[]).map(([id])=>id),...(w.ATHENAEUM_HAGGARD_BOOKS||[]).map(([id])=>id),...w.ATHENAEUM_AFTER_DARK_BOOKS.map(b=>b.id),...w.ATHENAEUM_CURIOUS_BOOKS.map(b=>b.id),...w.ATHENAEUM_RAILWAY_BOOKS.map(b=>b.id)];
  const missing=ids.filter(id=>!has(id));assert.deepEqual(missing,[],'books without a note');
  assert.ok(Object.keys(w.ATHENAEUM_EXTRA_NOTES).length>300,'the Doyle, Wells and Haggard notes survive the cover-completion file');
  assert.match(fs.readFileSync('data/book-completions.js','utf8'),/window\.ATHENAEUM_EXTRA_NOTES=Object\.assign\(\{/,'notes are merged, never replaced');
  assert.match(game,/note=librarianNotes\[book\.id\]\|\|window\.ATHENAEUM_EXTRA_NOTES\?\.\[book\.id\]\|\|fallbackNote\(book\)/);
});

test('open doors show a lamplit passage through a stencil portal, never the wall behind',()=>{
  const kit=fs.readFileSync('library-doors.js','utf8'),curious=fs.readFileSync('curious-doors.js','utf8'),visual=fs.readFileSync('visual-quality.js','utf8');
  assert.match(kit,/stencilFunc:THREE\.AlwaysStencilFunc,stencilZPass:THREE\.ReplaceStencilOp/);
  assert.match(kit,/depthTest:false,depthWrite:false,stencilWrite:true,stencilRef:1,stencilFunc:THREE\.EqualStencilFunc/);
  assert.match(kit,/function drawAfterPortal\(object\)/);
  for(const kind of ['clockOpening','glassPortal','caseOpening','nurseryOpening'])assert.match(curious,new RegExp(kind));
  assert.match(visual,/stencilBuffer:samples>=0/,'the post-processing target keeps a stencil buffer');
});

test('every room has a visible, working way out',()=>{
  assert.match(game,/wells:\{title:'The clock that ran ahead'/,'the Wells laboratory builds (it lacked a room record and threw before its exit door)');
  for(const type of ['night-exit','librarian-office-exit','high-stair-exit','summit-library-exit','after-dark-exit','curious-exit'])assert.match(game,new RegExp(`'${type}':\\['`));
  assert.match(game,/getDoorKit\(\)\?\.update\(dt\);dressExitDoors\(dt\)/);
  const train=fs.readFileSync('night-train.js','utf8');assert.match(train,/if\(!fogFound\)\{move\(300,-20,Math\.PI\/2\)/,'the fog waiting room always lets you back out');
});

test('the Moon has low gravity: loping bounds, a Space leap, drifting momentum and dusty landings',()=>{
  assert.match(game,/const MOON_GRAVITY=2\.1/);
  assert.match(game,/const grip=onMoon\?\(moonHop>\.02\?\.55:2\.2\):12/);
  assert.match(game,/if\(moonJumpQueued\)\{moonJumpQueued=false;moonVy=2\.9\}/);
  assert.match(game,/spawnDustPuff\(tmpVector\.set\(player\.pos\.x,player\.pos\.y\+\.05,player\.pos\.z\)\)/);
  assert.match(game,/player\.pos\.y\+1\.72\+bobLift\+moonHop/);
});
