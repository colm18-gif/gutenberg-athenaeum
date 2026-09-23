const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const game=fs.readFileSync('game.js','utf8');
const stair=fs.readFileSync('high-staircase.js','utf8');
const train=fs.readFileSync('night-train.js','utf8');
const html=fs.readFileSync('index.html','utf8');
test('real cover art is requested individually, visibly and only while stationary',()=>{
  assert.doesNotMatch(html,/cover-shard-map/);
  assert.match(game,/function requestRealCover\(book\)/);
  assert.match(game,/fetch\(`covers\/books\/\$\{encodeURIComponent\(id\)\}\.jpg`/);
  assert.doesNotMatch(game,/covers\/shard_/);
  assert.match(game,/tmpWorldPosition\.distanceToSquared\(camera\.position\)<144/);
  assert.match(game,/coverFrustum\.containsPoint\(tmpWorldPosition\)/);
  assert.match(game,/requestIdleCallback/);
  assert.match(game,/playerIsMoving\(\)/);
  assert.match(game,/noteCoverMotion\(\)/);
  assert.match(game,/realCoverController\.abort\(\)/);
  assert.match(game,/queueCoverMesh\(bm\)/);
});

test('individual cover assets exist for every former shard entry',()=>{
  const ids=new Set();
  for(const name of fs.readdirSync('covers').filter(name=>/^shard_\d+\.json$/.test(name))){
    const shard=JSON.parse(fs.readFileSync(`covers/${name}`,'utf8'));
    for(const id of Object.keys(shard))ids.add(id);
  }
  assert.ok(ids.size>100);
  for(const id of ids)assert.ok(fs.statSync(`covers/books/${id}.jpg`).size>100,`missing cover ${id}`);
});

test('lightweight illustrated covers remain visible before detailed covers load',()=>{
  assert.match(game,/function lightweightCoverTexture\(book\)/);
  assert.match(game,/\},128,188\)/);
  assert.match(game,/new THREE\.MeshStandardMaterial\(\{map:lightweightCoverTexture\(book\),color:0xffffff,roughness\}\)/);
  assert.match(game,/if\(lowBandwidth\)data\.loaded=true;else requestRealCover\(data\.book\)/);
});

test('Arm Chair 01 replaces reading-chair visuals while keeping interaction and a fallback',()=>{
  assert.match(game,/ArmChair_01\/ArmChair_01_1k\.gltf/);
  assert.match(game,/if\(modelKey!=='armchair'\|\|lowBandwidth\|\|lowPowerDevice\)return/);
  assert.match(game,/seatTemplate\(asset\)\.then\(template=>/);
  assert.match(game,/node\.userData=data;interactables\.push\(node\)/);
  assert.match(game,/group\.add\(model\);\s*parts\.forEach\(part=>\{part\.visible=false\}\)/);
  assert.match(game,/\}\)\.catch\(\(\)=>\{\}\)/);
  assert.match(game,/const seat=new THREE\.Mesh\(new THREE\.BoxGeometry\(2\.1,\.55,1\.9\),MAT\.fabric\)/);
});

test('movement and interaction use nearby spatial cells instead of whole-library scans',()=>{
  assert.match(game,/const SPATIAL_CELL_SIZE=12,colliderCells=new Map\(\)/);
  assert.match(game,/for\(const c of nearbyColliders\(x,z\)\)/);
  assert.match(train,/nearbyColliders\(x,z\)\.some/);
  assert.match(game,/function collectActiveInteractables\(\)/);
  assert.match(game,/focusCheckTimer=\.065/);
  assert.match(game,/raycaster\.intersectObjects\(focusCandidates,false\)/);
});

test('closed rooms are independently detached and remote rooms build only when entered',()=>{
  assert.match(game,/registerRoomPerformanceZones\('theme-'\+destination/);
  assert.match(game,/buildThemeRooms\(hp\.destination\)/);
  assert.match(game,/themeRoomDefs\.filter\(def=>def\.key===destination\)/);
  assert.match(game,/registerRoomPerformanceZones\('memory'/);
  assert.match(game,/if\(focus\?\.userData\?\.type==='basement-hatch'\)buildBasement\(\)/);
  assert.match(game,/else if\(themeRoomKeys\.has\(d\.destination\)\)buildThemeRooms\(d\.destination\)/);
  assert.match(game,/if\(!roofBuilt&&player\.pos\.y>8\.5&&player\.pos\.z>34\)buildRoofGarden\(\)/);
  assert.doesNotMatch(game,/const openingWarmupTasks=/);
});

test('a hidden frame-time monitor reports long frames on demand',()=>{
  assert.match(game,/performanceMonitor\.id='performanceMonitor'/);
  assert.match(game,/event\.code!=='F3'/);
  assert.match(game,/frame spikes >40 ms/);
  assert.match(game,/renderInfo\.calls/);
  assert.match(game,/function updateAdaptiveQuality/);
  assert.match(game,/adaptiveRenderScale/);
});

test('the night-room chandelier uses one real light for its decorative flames',()=>{
  assert.match(game,/const chandelierGlow=new THREE\.PointLight/);
  assert.match(game,/const flame=new THREE\.Mesh\(new THREE\.SphereGeometry\(\.13,8,6\),lampShadeMaterial\)/);
  assert.doesNotMatch(game,/const flame=new THREE\.PointLight\(0xf1c787,3\.2,13,2\)/);
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
