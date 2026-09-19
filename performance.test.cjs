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


test('east wing shelves are reserved but not constructed at startup',()=>{
  assert.match(game,/const eastWingAddedBookStart=addedBookCursor;addedBookCursor\+=16;let eastWingBuilt=false/);
  assert.match(game,/function buildEastWing\(\).*shelf\(28,-12,0,6\);shelf\(28,8,Math\.PI,6\)/);
  assert.match(game,/id:'east-wing',build:buildEastWing/);
  assert.match(game,/player\.pos\.x>13.*zoneManager\.activate\('east-wing'\)/);
  const eagerPrefix=game.slice(0,game.indexOf('function buildEastWing'));
  assert.doesNotMatch(eagerPrefix,/shelf\(28,-12,0,6\)/);
});


test('west wing shelves are reserved and lazy-built on approach',()=>{
  assert.match(game,/const westWingAddedBookStart=addedBookCursor;addedBookCursor\+=16;let westWingBuilt=false/);
  assert.match(game,/function buildWestWing\(\).*shelf\(-28,-12,0,6\);shelf\(-28,8,Math\.PI,6\)/);
  assert.match(game,/id:'west-wing',build:buildWestWing/);
  assert.match(game,/player\.pos\.x<-13.*zoneManager\.activate\('west-wing'\)/);
  const eagerPrefix=game.slice(0,game.indexOf('function buildWestWing'));
  assert.doesNotMatch(eagerPrefix,/shelf\(-28,-12,0,6\)/);
});
