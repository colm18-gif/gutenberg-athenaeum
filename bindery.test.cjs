const test=require('node:test'),assert=require('node:assert'),fs=require('fs'),vm=require('vm');
const src=fs.readFileSync('bindery-room.js','utf8'),game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),periodicals=fs.readFileSync('periodicals-room.js','utf8');
test('the bindery opens off the Periodicals Room, behind the press, and is wired like the other rooms',()=>{
  assert.match(html,/startupScript\('bindery-room\.js'\)/);
  assert.match(periodicals,/for\(const hook of doorHooks\)hook\(root,/,'the Periodicals Room hangs other rooms’ doors while it is built');
  assert.match(src,/const DOOR=\{x:P\.cx-5\.6,z:P\.cz\+P\.d\/2-\.2,yaw:Math\.PI\}/,'the door is in the south wall, behind the press at cx-5.6');
  assert.match(src,/periodicals\?\.addDoorHook\?\.\(hangDoor\)/);
  assert.match(game,/bindery:binderyRoom&&\(\(\)=>binderyRoom\.enter\(\)\)/);
  assert.match(game,/\['bindery','The bindery'\]/);
  assert.match(game,/'periodicals-room','bindery',/,'the Wandering Door can open on it');
  assert.match(fs.readFileSync('room-ambience.js','utf8'),/bindery:\{beds:/);
  // its exit plate names the room it opens on, and the way on
  assert.match(src,/label:'THE PERIODICALS ROOM',onward:'towards the Grand Hall'/);
});
test('a book is bound in five steps, in order, and its shelves come from the new books',()=>{
  const ctx={window:{}};vm.runInNewContext(src,ctx);
  const steps=src.match(/const STEPS=\[([\s\S]*?)\n  \];/)[1].match(/\{key:'/g);assert.equal(steps.length,5);
  for(const key of ['fold','sew','round','cover','tool'])assert.match(src,new RegExp(`key:'${key}'`));
  assert.match(src,/if\(i>stage\)\{showNotice\(`\$\{step\.title\} comes later/,'a later step must wait');
  const nb=fs.readFileSync('data/new-books.js','utf8');
  assert((nb.match(/'bindery-books'/g)||[]).length>=10,'the binding shelf');
  assert.match(nb,/\[28540,'Bibliomania','Thomas Frognall Dibdin','Archive','bindery-fore-edge'/);
  assert.match(fs.readFileSync('scripts/new-books.mjs','utf8'),/'bindery-books','bindery-fore-edge'/);
});
