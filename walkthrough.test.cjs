const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

// scripts/room-walkthrough.mjs visits every room a ?room= link reaches; its list is read from roomLink in game.js,
// so a room added there is walked without anyone remembering to add it.
test('the room walkthrough finds every room roomLink knows',async()=>{
  const {roomKeys}=await import('./scripts/room-walkthrough.mjs');
  const keys=roomKeys();
  for(const key of ['gothic','verne','irish-room','lilliput','brobdingnag','forest-song','mountain-falls','ukrainian-room','station-subway','kipling','wandering-door','explorers-anteroom'])
    assert.ok(keys.includes(key),`${key} is walked`);
  assert.equal(new Set(keys).size,keys.length,'no room is walked twice');
  const game=fs.readFileSync('game.js','utf8'),body=game.slice(game.indexOf('function roomLink(key){'),game.indexOf('}[key]||null'));
  const theme=game.match(/const themeRoomKeys=new Set\(\[([^\]]+)\]\)/)[1];
  for(const key of keys)assert.ok(theme.includes(`'${key}'`)||body.includes(`'${key}'`)||new RegExp(`[{,\\s]${key}:`).test(body),`${key} is a key of roomLink`);
  assert.ok(keys.length>=55,`${keys.length} rooms`);
});

test('the walkthrough runs by hand and weekly, never on a pull request, and keeps its contact sheet',()=>{
  const yml=fs.readFileSync('.github/workflows/room-walkthrough.yml','utf8');
  assert.match(yml,/workflow_dispatch/);assert.match(yml,/schedule:/);assert.doesNotMatch(yml,/pull_request/);
  assert.match(yml,/room-walkthrough\.mjs --out walkthrough --strict/);assert.match(yml,/upload-artifact@v4[\s\S]*path: walkthrough/);
  assert.match(fs.readFileSync('.gitignore','utf8'),/^\/?walkthrough\/?$/m,'its photographs are not committed');
});
