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
  assert.match(game,/if\(!\['armchair','sofa','feature'\]\.includes\(modelKey\)\|\|lowBandwidth\|\|lowPowerDevice\)return/);
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

test('shaders are compiled behind the entrance veil before the first frame is drawn',()=>{
  assert.match(game,/async function warmShaders\(progress,\{roots=\[scene\],chunkSize=3,pause=0\}=\{\}\)/);
  assert.match(game,/renderer\.compile\(object,camera,scene\)/);
  assert.match(game,/renderer\.properties\.get\(material\)\.currentProgram\?\.getUniforms\(\)/,'without parallel compile, linking is finished during warm-up');
  assert.match(game,/warmShaders\([^)]*\)[^;]*\.finally\(\(\)=>\{shadersWarm=true;animate\(\);if\(window\.__ATHENAEUM_ENTERED__\)enterLibrary\(\);/);
  assert.doesNotMatch(game,/\n    animate\(\);\n/,'the render loop must not start before warm-up');
  assert.match(game,/ui\.enter\.addEventListener\('click',\(\)=>\{if\(shadersWarm\)enterLibrary\(\)\}\)/);
  assert.match(fs.readFileSync('visual-quality.js','utf8'),/function bindSceneTarget\(\)/);
});

test('static pieces are batched per material without breaking collision rays or animation',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(match=>match[1]);
  assert.ok(order.indexOf('static-batching.js')>-1&&order.indexOf('static-batching.js')<order.indexOf('game.js'));
  const batching=fs.readFileSync('static-batching.js','utf8');
  new (require('node:vm').Script)(batching);
  assert.match(game,/window\.createStaticBatcher\?\.\(\{THREE,scene,exclusions:\(\)=>interactables,changeStamp:sceneStamp\}\)/);
  assert.match(batching,/if\(stamp===undefined\|\|stamp!==lastStamp\)\{lastStamp=stamp;scansLeft=3\}if\(scansLeft>0\)\{scansLeft--;scan\(\)\}/,'the scene is only walked after it changes');
  assert.match(game,/if\(warmingShaders\|\|stamp===warmedStamp\)return;/,'shader warm-up also waits for a change');
  assert.match(game,/staticBatcher\?\.update\(dt\);if\(visual\)/,'the batch check runs right before rendering, so a moved piece is never drawn stale');
  // Originals must stay raycastable: hide them from the camera only, never via layers or visibility.
  assert.match(batching,/function hide\(mesh\)\{mesh\.boundingSphere=hiddenSphere\}/);
  assert.doesNotMatch(batching,/layers\.mask=|\.visible=false/);
  for(const rule of [/material\.transparent/,/excluded\.has\(mesh\)/,/for\(const key in mesh\.userData\)return false/,/mesh\.renderOrder!==0/,/material\.stencilWrite/])assert.match(batching,rule);
  assert.match(batching,/if\(mesh\.boundingSphere!==hiddenSphere\|\|!mesh\.frustumCulled\|\|mesh\.layers\.mask!==1\|\|!unchanged\(mesh,record\.state\)\)release\(mesh\)/);
});

test('photographic textures ship GPU-compressed copies with the originals kept as fallback',()=>{
  const path=require('node:path');
  for(const set of ['smoked_walnut_veneer','leather_red_02'])for(const map of ['diffuse','normal','roughness'])assert.ok(fs.statSync(`assets/polyhaven/materials/${set}/${map}.ktx2`).size>1000,`${set} ${map}.ktx2`);
  assert.match(game,/compressedTextureFormats=\[/);
  assert.match(game,/new Promise\(resolve=>setTimeout\(\(\)=>resolve\(null\),8000\)\)/,'a missing decoder falls back to JPG instead of leaving surfaces bare');
  assert.match(game,/if\(ktx2\)loader\.setKTX2Loader\(ktx2\)/);
  const gltfs=[];const walk=dir=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())walk(full);else if(entry.name.endsWith('.gltf'))gltfs.push(full)}};walk('assets/polyhaven/models');walk('assets/models');
  for(const file of gltfs){
    const gltf=JSON.parse(fs.readFileSync(file,'utf8'));
    assert.ok(!(gltf.extensionsRequired||[]).includes('KHR_texture_basisu'),`${file} must stay loadable without KTX2`);
    for(const texture of gltf.textures||[]){
      assert.ok(/\.(jpe?g|png)$/i.test(gltf.images[texture.source].uri),`${file} keeps a JPG/PNG fallback`);
      const ktx=texture.extensions?.KHR_texture_basisu;assert.ok(ktx,`${file} texture has a KTX2 copy`);
      assert.ok(fs.existsSync(path.join(path.dirname(file),decodeURIComponent(gltf.images[ktx.source].uri))),`${file} KTX2 image exists`);
    }
  }
});

test('rooms and wings are compiled before the reader reaches them',()=>{
  const curious=fs.readFileSync('curious-doors.js','utf8'),daily=fs.readFileSync('daily-room.js','utf8');
  // Areas built but not yet in the scene are compiled in the background after entering, with their own lamps off.
  assert.match(game,/const detachedAreas=\(\)=>Object\.values\(performanceZones\)\.filter\(zone=>!zone\.active&&zone\.group\)/);
  assert.match(game,/warmShaders\(null,\{roots:detachedAreas\(\),chunkSize:2,pause:16\}\)/);
  assert.match(game,/if\(root!==scene\)root\.traverse\(object=>\{if\(object\.isLight&&object\.visible\)\{object\.visible=false;hidden\.push\(object\)\}\}\)/);
  assert.match(game,/refreshBudgetLights\.stamp=null;budgetRefreshTimer=0;applyLightBudget\(\);/,'warming uses the light count that will be drawn');
  // Door rooms are built as the reader approaches, so the regular warm-up catches them before they are seen.
  assert.match(curious,/if\(near\|\|inside\)\{activate\(room\)\}/);
  assert.match(daily,/if\(inside\|\|near\)activate\(\)/);
});

test('paintings and plates download when the reader comes near, not all at entry',()=>{
  assert.match(game,/else if\(imageUrl\)pendingPaintings\.push\(\{group,load:/);
  assert.match(game,/const PAINTING_LOAD_DISTANCE=30/);
  assert.match(game,/loadNearbyCovers\(t\);loadNearbyPaintings\(t\);/);
  assert.match(game,/let requested=false;t\.onUpdate=\(\)=>\{if\(requested\)return;requested=true;const img=new Image\(\)/,'plates wait until first drawn');
});

test('the leather fallback textures are compressed sensibly',()=>{
  // Most devices use the .ktx2 versions; these JPEGs are the fallback and were 1.8 MB together.
  const total=['diffuse','normal','roughness'].reduce((sum,map)=>sum+fs.statSync(`assets/polyhaven/materials/leather_red_02/${map}.jpg`).size,0);
  assert(total<1.1*1024*1024,`leather JPEGs are ${Math.round(total/1024)} KB`);
});
