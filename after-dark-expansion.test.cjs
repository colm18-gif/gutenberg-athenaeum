const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const html=fs.readFileSync('index.html','utf8');
const game=fs.readFileSync('game.js','utf8');
const expansion=fs.readFileSync('after-dark-expansion.js','utf8');
const stair=fs.readFileSync('high-staircase.js','utf8');
const books=fs.readFileSync('data/after-dark-books.js','utf8');

test('new rooms are discoverable through physical doors and retain the existing reader contract',()=>{
  assert.match(html,/startupScript\('data\/after-dark-books\.js'\)/);
  assert.match(html,/startupScript\('after-dark-expansion\.js'\)/);
  assert.match(game,/window\.createAfterDarkExpansion/);
  assert.match(expansion,/STAFF · SORTING/);
  assert.match(expansion,/DEPARTURES/);
  assert.match(expansion,/type:'book',book,loaded:false,home:/);
  assert.match(game,/afterDarkExpansion\.interact/);
  assert.match(game,/afterDarkExpansion\.allowed/);
});

test('Sorting Room contains the working archive labels, slips and one-off handling props',()=>{
  for(const label of ['RETURNED WITHOUT EXPLANATION','SHELF UNKNOWN','DO NOT RE-SHELVE','Found in the rain','Reader never returned','Catalogue disagrees'])assert.match(expansion,new RegExp(label));
  for(const asset of ['CheeseBox_01','wooden_crate_01','wooden_crate_02','wooden_ladder_02','hand_truck'])assert.match(expansion,new RegExp(asset));
  assert.equal((expansion.match(/models\/hand_truck\/hand_truck_1k\.gltf/g)||[]).length,1);
  assert.match(books,/room:'sorting'/);
  assert.match(books,/The Book of Were-Wolves/);
  assert.match(books,/Curiosities of Literature/);
});

test('staff doors clear the hidden paintings and the office sits on the south wall',()=>{
  const sorting=expansion.match(/sorting:\{[^\n]*entrance:\{x:([-\d.]+),z:([-\d.]+)/);
  const departures=expansion.match(/departures:\{[^\n]*entrance:\{x:([-\d.]+),z:([-\d.]+)/);
  assert.ok(sorting&&departures);
  for(const door of [sorting,departures]){
    assert.ok(Math.abs(Number(door[2])-5)>(3.5+2.45)/2+.4,'service door must clear its portrait');
    assert.ok(Number(door[2])+2.85/2<10,'service door frame must fit the wall');
  }
  const office=fs.readFileSync('librarian-office.js','utf8');
  assert.match(office,/entrance\.position\.set\(35,0,-13\.65\)/);
  assert.match(office,/move\(35, -11\.1, Math\.PI\)/);
});

test('sorting shelves visibly contain books with a small number of draw calls',()=>{
  assert.match(expansion,/new THREE\.InstancedMesh\(new THREE\.BoxGeometry\(\.23,\.78,\.38\)/);
  assert.match(expansion,/spines\.setMatrixAt\(spineCount,dummy\.matrix\)/);
  assert.match(expansion,/TO BE RETURNED/);
  assert.match(expansion,/KEEP FOR THE LIBRARIAN/);
});

test('Cabinet of Travel and Expeditions has distinct books, weather and restrained hero props',()=>{
  for(const title of ['The Narrative of Arthur Gordon Pym','The Voyage of the Beagle','Travels in West Africa','The Innocents Abroad','The Worst Journey in the World'])assert.match(books,new RegExp(title));
  assert.match(expansion,/oldStone=publicStone,bluePlaster=publicStone/);
  assert.match(expansion,/seadogs_compass/);
  assert.equal((expansion.match(/models\/seadogs_compass\/seadogs_compass_1k\.gltf/g)||[]).length,1);
  assert.equal((expansion.match(/models\/vintage_suitcase\/vintage_suitcase_1k\.gltf/g)||[]).length,2);
  assert.match(expansion,/kind:'rain'/);
});

test('the two new rooms preload at their thresholds, stay warm and detach when distant',()=>{
  assert.match(expansion,/KEEP_WARM_SECONDS=20,PRELOAD_DISTANCE=8/);
  assert.match(expansion,/if\(threshold\|\|occupied\)\{activate\(room\)/);
  assert.match(expansion,/time-room\.lastNeeded>KEEP_WARM_SECONDS\)unload\(room\)/);
  assert.match(expansion,/room\.root\.removeFromParent\(\)/);
  assert.doesNotMatch(expansion,/build\(rooms\.sorting\)/);
  assert.doesNotMatch(expansion,/build\(rooms\.departures\)/);
});

test('Rocket Hall is spacious, astronomical and uses its spacecraft instrument once',()=>{
  assert.match(stair,/absarc\(0,0,9\.45,0,Math\.PI\*2/);
  // The summit floor has a stairwell cut into it, so the stair arrives through an opening, not the boards.
  assert.match(stair,/floorShape\.holes\.push\(wellPath\(\)\)/);
  assert.match(stair,/SphereGeometry\(9\.72,48,24/);
  assert.match(stair,/absarc\(0,0,7\.1,0,Math\.PI\*2/);
  assert.match(stair,/hallStarField\.rotation\.y/);
  assert.match(stair,/platformX=cx\+6\.75,platformZ=cz\+5\.25/);
  assert.equal((stair.match(/models\/vintage_spacecraft_instrument\/vintage_spacecraft_instrument_1k\.gltf/g)||[]).length,1);
});

test('return-and-discovery table is communal and preserves left-at-desk behavior',()=>{
  assert.match(game,/return-and-discovery-table/);
  assert.match(game,/BoxGeometry\(15,\.34,3\.2\)/);
  assert.match(game,/WoodenTable_01\/WoodenTable_01_1k\.gltf/);
  assert.match(game,/for\(const x of \[-5,0,5\]\)/);
  assert.match(game,/The date stamp/);
  assert.match(game,/A fan of return slips/);
  assert.match(game,/function leaveSelectedAtDesk/);
  assert.match(game,/athenaeum-desk-books/);
});

test('requested Poly Haven assets are local 1K files with no runtime model hotlinks',()=>{
  const requested=['CheeseBox_01','wooden_crate_01','wooden_crate_02','wooden_ladder_02','hand_truck','vintage_spacecraft_instrument','WoodenTable_01','ArmChair_01','seadogs_compass','vintage_suitcase'];
  for(const asset of requested){const directory=`assets/polyhaven/models/${asset}`;assert.ok(fs.existsSync(directory),`${asset} directory should exist`);const gltf=fs.readdirSync(directory).find(file=>file.endsWith('_1k.gltf'));assert.ok(gltf,`${asset} should have a 1K glTF`);assert.ok(fs.statSync(`${directory}/${gltf}`).size>100,`${asset} glTF should not be empty`)}
  for(const material of ['smoked_walnut_veneer','leather_red_02']){const directory=`assets/polyhaven/materials/${material}`;assert.ok(fs.existsSync(directory));assert.ok(fs.readdirSync(directory).every(file=>!/_[248]k\./.test(file)),`${material} must remain 1K`)}
  assert.doesNotMatch(game,/dl\.polyhaven\.org/);
  assert.doesNotMatch(expansion,/dl\.polyhaven\.org/);
  assert.doesNotMatch(stair,/dl\.polyhaven\.org/);
});
