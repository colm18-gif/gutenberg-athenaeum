const test=require('node:test'),assert=require('node:assert'),fs=require('fs');
const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8'),css=fs.readFileSync('styles.css','utf8'),analytics=fs.readFileSync('analytics.js','utf8');
test('a returning reader is offered the room they were last in, by its own ?room= path',()=>{
  assert.match(game,/localStorage\.setItem\('athenaeum-last-place',JSON\.stringify\(\{key,label,t:Date\.now\(\)\}\)\)/);
  assert.match(game,/get\('room'\)\|\|window\.__ATHENAEUM_RESUME__/);
  assert.match(html,/id="resumePlace"/);
  assert.match(html,/window\.__ATHENAEUM_RESUME__=saved\.key/);
  // never over a link that already says where to go, and the wing's books come along for a wing room
  assert.match(html,/!q\.get\('room'\)&&!q\.has\('book'\)/);
  assert.match(html,/WING_ROOM\.test\(saved\.key\)/);
  assert.match(analytics,/'Place Resumed'/);
});
test('the journal map takes the reader back to a room already found',()=>{
  assert.match(game,/else if\(known&&linkKeyFor\(id\)\)card\.append\(journeyButton\(id,label\)\)/);
  assert.match(game,/button\.textContent='Go there'/);
  assert.match(css,/\.atlas-go\{/);
  assert.match(analytics,/'Journal Journey'/);
});
test('on phones the small buttons move into the menu, and the status lines fade',()=>{
  assert.match(css,/body\.mobile-started #mute,body\.mobile-started #settingsButton,body\.mobile-started #visitorsButton\{display:none\}/);
  assert.match(css,/#status\.quiet\{opacity:0\}/);
  assert.match(html,/id="pauseSound"/);
  assert.doesNotMatch(css,/#prompt\{top:44%\}\.prompt-key\{display:none\}/);
});
test('the prompt says what a press or tap will do',()=>{
  const src=game.slice(game.indexOf('function verbFor'),game.indexOf('function interact(){'));
  const verbFor=new Function(src+';return verbFor')();
  for(const [type,verb] of [['seat','SIT'],['cat','STROKE'],['librarian','TALK'],['pitcairn-bell','RING'],['irish-exit','GO THROUGH'],['poe-door','OPEN'],['irish-card','READ'],['tristan-picture','LOOK'],['object','USE']])
    assert.equal(verbFor(type),verb,type);
  assert.match(game,/\$\{touchMode\?'TAP':'E'\}&nbsp;&nbsp; \$\{action\}/);
});
test('the parlour bookcase swings inward, away from the reader, and is a way in while open',()=>{
  const doors=fs.readFileSync('curious-doors.js','utf8');
  assert.equal((doors.match(/door\.kind==='bookcase'\)door\.swing\.rotation\.y=e\*1\.15/g)||[]).length,2);
  assert.doesNotMatch(doors,/swing\.rotation\.y=-e\*1\.15/);
  assert.match(doors,/door\.state='open';bookcaseWayIn\(door,true\)/);
});
