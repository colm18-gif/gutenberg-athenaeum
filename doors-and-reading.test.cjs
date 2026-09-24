const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const game=fs.readFileSync('game.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const train=fs.readFileSync('night-train.js','utf8');
function stub(){const target=function(){};return new Proxy(target,{get(t,k){if(k in t)return t[k];if(k===Symbol.toPrimitive)return()=>0;if(k==='then'||k===Symbol.iterator)return undefined;t[k]=stub();return t[k]},apply(){return stub()},construct(){return stub()},set(t,k,v){t[k]=v;return true}})}

test('every door style builds, swings open, lets the reader through once and settles shut',()=>{
  const context={window:{},Math,Map};vm.runInNewContext(fs.readFileSync('library-doors.js','utf8'),context);
  const kit=context.window.createDoorKit({THREE:stub(),MAT:stub(),canvasTexture:()=>stub()});
  for(const style of ['walnut','painted','iron','forbidden']){
    const door=kit.build(stub(),{style,label:'TEST'});let passed=0;
    kit.open(door,()=>passed++);for(let i=0;i<40;i++)kit.update(.05);
    assert.equal(passed,1,`${style} door lets the reader through exactly once`);
    for(let i=0;i<40;i++)kit.update(.05);assert.equal(door.open,0,`${style} door closes again`);
  }
});

test('memory doors and after-dark entrances use the kit and wait for the swing before moving the reader',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);assert.ok(order.indexOf('library-doors.js')>-1&&order.indexOf('library-doors.js')<order.indexOf('game.js'));
  assert.match(game,/dressMemoryDoor\(group,door,destination,industrial,forbidden,themeExit\);return door/);
  assert.match(game,/getDoorKit\(\)\.open\(d\.kit,\(\)=>\{d\.opening=false;passMemoryDoor\(d\)\}\)/);
  assert.match(game,/getDoorKit\(\)\?\.update\(dt\)/);
  const afterDark=fs.readFileSync('after-dark-expansion.js','utf8');
  assert.match(afterDark,/doorKit\.build\(group,/);assert.match(afterDark,/doorKit\.open\(data\.kit,/);
  assert.doesNotMatch(afterDark,/root\.add\(g\),parts=\[\]/,'the sorting-room shelves no longer assign an undeclared variable');
});

test('after reading in a chair the book can stay on the chair, go back, go to a table, or be carried',()=>{
  assert.match(html,/id="leaveOnChair"/);assert.match(html,/id="placeNearby"/);
  assert.match(game,/function closeReader\(\)\{stopReaderAside\(\);cancelAmbientRustle\(\);if\(seated\)\{const seat=seated\.seat;leaveSeat\(\);ui\.reader\.classList\.add\('hidden'\);offerAfterReading\(seat\);return\}/);
  assert.match(game,/function leaveBookOnSeat\(\)/);assert.match(game,/function placeOnNearestTable\(\)/);
  assert.match(game,/document\.exitPointerLock\?\.\(\);setTimeout\(\(\)=>\$\('#leaveOnChair'\)\?\.focus\(\),0\)/,'the mouse is free to choose');
  // While carrying, any flat surface takes the book.
  assert.match(game,/placeOnSurface\(\);return\}return carriedBookInteract\(\)/);
  assert.match(game,/if\(surfaceNormal\.y<\.72\)return false/);
  assert.match(game,/'E&nbsp;&nbsp; SET DOWN'/);
});

test('the reading carriage uses real models with licences and a proper journey picker',()=>{
  for(const file of ['assets/models/khronos/lantern/Lantern.gltf','assets/models/khronos/lantern/LICENSE.md','assets/models/khronos/stained-glass-lamp/StainedGlassLamp.gltf','assets/models/khronos/stained-glass-lamp/LICENSE.md'])assert.ok(fs.statSync(file).size>500,file);
  assert.match(fs.readFileSync('assets/models/khronos/lantern/LICENSE.md','utf8'),/CC0|Creative Commons Zero/i);
  assert.match(fs.readFileSync('assets/models/khronos/stained-glass-lamp/LICENSE.md','utf8'),/CC-BY-4\.0|Attribution 4\.0/);
  const credits=fs.readFileSync('ASSET_CREDITS.md','utf8');assert.match(credits,/Stained Glass Lamp/);assert.match(credits,/Wayfair/);
  assert.match(html,/id="journeyPicker"/);assert.match(game,/chooseDestination:openJourneyPicker/);
  assert.match(train,/function lanternPost\(/);assert.match(train,/StainedGlassLamp\.gltf/);assert.match(train,/vintage_suitcase_1k\.gltf/);
  for(const gltf of ['assets/models/khronos/lantern/Lantern.gltf','assets/models/khronos/stained-glass-lamp/StainedGlassLamp.gltf']){const g=JSON.parse(fs.readFileSync(gltf,'utf8')),dir=gltf.replace(/[^/]+$/,'');for(const i of g.images)assert.ok(fs.existsSync(dir+i.uri),i.uri);for(const b of g.buffers)assert.ok(fs.existsSync(dir+b.uri),b.uri)}
});
