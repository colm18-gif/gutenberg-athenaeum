const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const game=fs.readFileSync('game.js','utf8');
const stair=fs.readFileSync('high-staircase.js','utf8');
const train=fs.readFileSync('night-train.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const coverMap=fs.readFileSync('data/cover-shard-map.js','utf8');
const zoneManager=fs.readFileSync('zone-manager.js','utf8');

test('real cover art is requested by proximity instead of at startup',()=>{
  assert.match(html,/loadScript\('data\/cover-shard-map\.js'\)/);
  assert.match(coverMap,/window\.ATHENAEUM_COVER_SHARDS=/);
  assert.match(game,/function requestRealCover\(book\)/);
  assert.match(game,/fetch\(`covers\/shard_\$\{shardIndex\}\.json`\)/);
  assert.doesNotMatch(game,/Promise\.all\(Array\.from\(\{length:9\}/);
  assert.match(game,/wp\.distanceTo\(camera\.position\)<12/);
});

test('the impossible stair batches its repeated structure',()=>{
  assert.match(stair,/new THREE\.InstancedMesh\(new THREE\.BoxGeometry\(1\.42,\.24,1\.62\)/);
  assert.match(stair,/new THREE\.InstancedMesh\(new THREE\.CylinderGeometry\(\.055,\.07,1\.05,8\)/);
  assert.match(stair,/treads\.setMatrixAt/);
  assert.match(stair,/posts\.setMatrixAt/);
  assert.match(stair,/rails\.setMatrixAt/);
});

test('distant animation systems pause outside their zones',()=>{
  assert.match(game,/const mainActive=/);
  assert.match(game,/if\(roofActive\)\{roofClouds\.forEach/);
  assert.match(game,/if\(mainActive\|\|catGuideTarget\|\|librarianGuideTarget\|\|chatOpen\)/);
  assert.match(stair,/const active=contains\(player\.pos\.x,player\.pos\.z\)\|\|rocketTrip;if\(!active\)return/);
  assert.match(train,/if\(!zone\)return false/);
});


test('zone manager provides an incremental lifecycle without eagerly building zones',()=>{
  assert.match(html,/loadScript\('zone-manager\.js'\)/);
  assert.match(zoneManager,/UNLOADED:'unloaded'/);
  assert.match(zoneManager,/PRELOADING:'preloading'/);
  assert.match(zoneManager,/ACTIVE:'active'/);
  assert.match(zoneManager,/DORMANT:'dormant'/);
  assert.match(zoneManager,/async preload\(id\)/);
  assert.match(zoneManager,/if\(!z\.built\)\{await z\.build\?\.\(\);z\.built=true\}/);
  assert.match(zoneManager,/async dispose\(id\)/);
  assert.match(zoneManager,/trimWarmCache/);
});


test('first room proof of concept uses ZoneManager without eager construction',()=>{
  assert.match(game,/new window\.AthenaeumZoneManager\(\{warmLimit:2\}\)/);
  assert.match(game,/id:'library-at-night',build:buildNightRoom/);
  assert.match(game,/zoneManager\.activate\('library-at-night'\)/);
  assert.match(game,/zoneManager\?\.sleep\('library-at-night'\)/);
  const registration=game.indexOf("id:'library-at-night',build:buildNightRoom");
  const activation=game.indexOf("zoneManager.activate('library-at-night')");
  assert.ok(registration>-1&&activation>registration);
});




test('public wings have independent render-tree boundaries',()=>{
  assert.match(game,/id:'east-wing'.*activate:\(\)=>attachPerformanceZone\('eastWing'\),deactivate:\(\)=>detachPerformanceZone\('eastWing'\)/);
  assert.match(game,/id:'west-wing'.*activate:\(\)=>attachPerformanceZone\('westWing'\),deactivate:\(\)=>detachPerformanceZone\('westWing'\)/);
  assert.match(game,/function captureNewZoneObjects\(name,existing\)/);
  assert.match(game,/captureNewZoneObjects\('eastWing',existing\)/);
  assert.match(game,/captureNewZoneObjects\('westWing',existing\)/);
  assert.match(game,/zone\.group\.removeFromParent\(\);zone\.active=false/);
});


test('Grand Hall is the permanent startup core and prepared destinations begin detached',()=>{
  assert.match(game,/Startup contract: the Grand Hall is the permanent core/);
  assert.match(game,/for\(const zone of Object\.values\(performanceZones\)\)\{zone\.group\.removeFromParent\(\);zone\.active=false\}/);
  assert.match(game,/__ATHENAEUM_STARTUP_CORE__=\{name:'grand-hall',deferred:Object\.keys\(performanceZones\)\}/);
});

test('wing lifecycle sleeps outside its render boundary and can reactivate on return',()=>{
  assert.match(game,/name==='eastWing'.*managed\?\.state==='dormant'.*activate\('east-wing'\).*managed\?\.state==='active'.*sleep\('east-wing'\)/);
  assert.match(game,/name==='westWing'.*managed\?\.state==='dormant'.*activate\('west-wing'\).*managed\?\.state==='active'.*sleep\('west-wing'\)/);
});


test('distant optional environments use managed on-demand zones',()=>{
  assert.match(game,/id:'memory-rooms',build:buildMemoryRooms,activate:\(\)=>attachPerformanceZone\('memory'\)/);
  assert.match(game,/id:'theme-rooms',build:buildThemeRooms,activate:\(\)=>attachPerformanceZone\('theme'\)/);
  assert.match(game,/id:'roof-garden',build:buildRoofGarden,activate:\(\)=>attachPerformanceZone\('roof'\)/);
  assert.match(game,/captureNewZoneObjects\('memory',existing\)/);
  assert.match(game,/captureNewZoneObjects\('theme',existing\)/);
  assert.match(game,/captureNewZoneObjects\('roof',existing\)/);
  assert.match(game,/zoneManager\.activate\('roof-garden'\)/);
  assert.match(game,/zoneManager\.activate\('theme-rooms'\)/);
});


test('night railway attaches only the current station, carriage, or depot group',()=>{
  assert.match(train,/performanceZones\['nightRail'\+key\]=\{group:g,isNeeded:.*active:false\}/);
  assert.match(train,/if\(active&&!g\.parent\)scene\.add\(g\)/);
  assert.match(train,/else if\(!active&&g\.parent\)g\.removeFromParent\(\)/);
});


test('lazy wing catalogue cursors preserve the original shelf sequence',()=>{
  assert.match(game,/const westWingBookStart=bookCursor,westWingAddedBookStart=addedBookCursor;bookCursor\+=16;addedBookCursor\+=16/);
  assert.match(game,/const eastWingBookStart=bookCursor,eastWingAddedBookStart=addedBookCursor;bookCursor\+=10;addedBookCursor\+=16/);
  assert.match(game,/bookCursor=westWingBookStart;addedBookCursor=westWingAddedBookStart/);
  assert.match(game,/bookCursor=eastWingBookStart;addedBookCursor=eastWingAddedBookStart/);
});

test('managed zones are not independently reattached by the legacy visibility loop',()=>{
  assert.match(game,/managedName=name==='eastWing'\?'east-wing':name==='westWing'\?'west-wing':name==='memory'\?'memory-rooms':name==='theme'\?'theme-rooms':name==='roof'\?'roof-garden':null/);
  assert.match(game,/if\(!managedName\)\{if\(needed&&!zone\.active\)/);
});

test('impossible staircase keeps its discovery entrance while detaching only the remote world',()=>{
  assert.match(stair,/entrance\.name='high-stair-entrance'/);
  assert.match(stair,/return \{contains,floorAt,allowed,interact,update,reset,onMoon,root,entrance/);
  assert.match(game,/const highStairWorld=\[highStaircase\.root\]/);
  assert.match(game,/focus\.userData\?\.type==='high-stair-door'\)attachHighStair\(\)/);
});


test('memory doors enter managed optional zones instead of bypassing lifecycle ownership',()=>{
  assert.match(game,/zoneManager&&!memoryRoomsBuilt\)zoneManager\.activate\('memory-rooms'\)/);
  assert.match(game,/zoneManager&&!themeRoomsBuilt\)zoneManager\.activate\('theme-rooms'\)/);
});


test('office entrance is physically blocked and moved away from the wing threshold',()=>{
  const office=fs.readFileSync('librarian-office.js','utf8');
  assert.match(office,/entrance\.position\.set\(36\.55,0,5\.8\)/);
  assert.match(office,/function blocksEntrance\(x,z\)/);
  assert.match(game,/librarianOffice\.blocksEntrance\?\.\(x,z\)/);
});

test('public wings use overlapping hysteresis so doorway movement does not flicker geometry',()=>{
  assert.match(game,/westWing'.*player\.pos\.x<25&&player\.pos\.x>-43/);
  assert.match(game,/eastWing'.*player\.pos\.x>-25&&player\.pos\.x<43/);
});

test('Last Landing is widened and its walkable summit matches the larger room',()=>{
  assert.match(stair,/innerRadius=5\.15/);
  assert.match(stair,/cylinder\(6\.8,6\.8,\.38/);
  assert.match(stair,/const summit=Math\.hypot\(x-cx,z-cz\)<6\.15/);
  assert.match(stair,/Math\.hypot\(x\+dx-cx,z\+dz-cz\)<6\.35/);
});
