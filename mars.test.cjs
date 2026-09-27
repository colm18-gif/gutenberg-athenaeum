const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const mars=fs.readFileSync('mars.js','utf8'),stair=fs.readFileSync('high-staircase.js','utf8'),game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8');

test('the rocket can be set for Mars and flies there and back',()=>{
  assert.match(stair,/mars:\{from:'earth',to:'mars',names:\['ROCKET HALL','MARS'\],miles:140000000\}/);
  assert.match(stair,/'summit-mars':\{from:'mars',to:'earth'/);
  assert.match(stair,/if\(type==='rocket-course'\)\{turnCourse\(\);return true\}/);
  assert.match(stair,/rocketBoarded=rocketBoarded==='mars'\?'moon':'mars'/,'the dial turns between the Moon and Mars');
  assert.match(stair,/if\(direction==='mars'&&mars\)\{mars\.arrive\(\)\}/,'landing hands the reader to mars.js');
  assert.match(stair,/else if\(kind==='mars'\)/,'Mars is painted in the porthole');
  assert.match(stair,/board:boardRocket/);
});

test('Mars is built only on landing, adds no lights, and is wired into the game',()=>{
  const context={window:{}};vm.runInNewContext(mars,context);assert.equal(typeof context.window.createMars,'function');
  assert.doesNotMatch(mars,/new THREE\.(Point|Directional|Spot|Hemisphere|Ambient)Light/,'the Martian night borrows the library’s own lights');
  assert.match(mars,/function arrive\(\)\{\s*if\(!root\)build\(\)/);
  assert.match(mars,/if\(root&&t-lastHere>KEEP&&!isHolding\(\)/,'freed again after the reader leaves');
  assert.match(mars,/restoreAtmosphere\(\)/);
  assert.match(mars,/SphereGeometry\(118,/,'the sky stays inside the camera’s far plane');
  assert.match(game,/boardHome:\(\)=>highStaircase\.board\('summit-mars'\)/);
  assert.match(game,/if\(marsWorld\?\.contains\(x,z\)\)return 'mars';/);
  assert.match(game,/\['mars','Mars'\]/);
  assert.match(game,/marsWorld\?\.update\(t\)/);
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);assert.ok(order.indexOf('mars.js')>-1&&order.indexOf('mars.js')<order.indexOf('game.js'));
});

test('the Reading Room of Helium has its books, each new one with a note',()=>{
  const context={window:{}};vm.runInNewContext(fs.readFileSync('data/new-books.js','utf8'),context);
  const shelf=context.window.ATHENAEUM_NEW_BOOKS.filter(entry=>entry[4]==='mars');
  assert.ok(shelf.length>=6);for(const entry of shelf)assert.ok(entry[5].length>120,entry[1]);
  assert.match(mars,/const SHELF=\[62,72,36\]/,'A Princess of Mars, Thuvia and The War of the Worlds are already in the library');
});
