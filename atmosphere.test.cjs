const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const html=fs.readFileSync('index.html','utf8');
const game=fs.readFileSync('game.js','utf8');
const css=fs.readFileSync('styles.css','utf8');
const ambience=fs.readFileSync('room-ambience.js','utf8');
const train=fs.readFileSync('night-train.js','utf8');
const stair=fs.readFileSync('high-staircase.js','utf8');

test('the creak is a low wooden groan, not a high chirp',()=>{
  const creak=ambience.match(/creak:\(\)=>buffer\([^\n]*/)[0];
  assert.match(creak,/2\*Math\.PI\*190\/sr/);assert.match(creak,/2\*Math\.PI\*310\/sr/);
  assert.doesNotMatch(creak,/520|4700/);
});

test('unused files are gone and nothing still points at them',()=>{
  for(const file of ['assets/gallery-data.js','assets/secret-librarian-portrait-data.js','assets/secret-librarian-portrait.png','assets/polyhaven/materials/brown_leather','assets/polyhaven/materials/old_stone_wall','assets/polyhaven/materials/blue_plaster_weathered','assets/polyhaven/models/Shelf_01'])assert.ok(!fs.existsSync(file),file);
  for(const source of [game,html,fs.readFileSync('after-dark-expansion.js','utf8')])assert.doesNotMatch(source,/gallery-data|portrait-data|brown_leather|old_stone_wall|blue_plaster|Shelf_01|displacement/);
});

test('lamplight dust drifts above the hall lamps and flames flicker, both still under Reduce motion',()=>{
  assert.match(game,/function addLamp\(x,y,z,scale=1\)\{lampSpots\.push\(\[x,y,z\]\)/);
  assert.match(game,/function updateLamplight\(t\)\{\s*const still=reducedMotion/);
  assert.match(game,/const flame=i=>still\?1:/);
  assert.match(game,/d\.flickerBase=light\.intensity\/\(d\.flickerFactor\|\|1\)/,'flicker rides on top of any brightness other code sets');
});

test('shelves vary: per-title sizes resting on the shelf, the odd leaning book, and spine-out fillers',()=>{
  assert.match(game,/const bookSize=book=>BOOK_SIZES\[/);
  assert.match(game,/bm\.position\.y-=\(1\.65-size\.h\)\/2/,'shorter books still stand on the shelf');
  assert.match(game,/if\(!secret\)settleShelvedBook\(bm,b\)/,'the secret pull-book keeps its exact place');
  assert.match(game,/new THREE\.InstancedMesh\(spineGeometry,spineMaterial,spines\.length\)/);
});

test('the north windows show the sky for the time of day, which can follow the reader’s clock',()=>{
  assert.match(html,/<select id="timeMode"><option value="library">/);
  assert.match(game,/dayPhase=timeMode==='clock'\?clockDayPhase\(\):/);
  assert.match(game,/function clockDayPhase\(\)/);
  assert.match(game,/pane\.position\.set\(x,5\.2,-30\.68\)/,'the sky sits in front of the wall face and behind the glass');
  assert.match(game,/localStorage\.setItem\('athenaeum-time-mode',timeMode\)/);
});

test('first visit: a skippable tour that follows the reader and hands over to the usual advice',()=>{
  for(const id of ['tour','tourStep','tourText','tourSkip'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(game,/localStorage\.setItem\('athenaeum-tour-done','1'\)/);
  assert.match(game,/function leadToShelf\(\)/);
  assert.match(game,/function enterLibrary\(\)\{if\(started\)return;started=true;tour\?\.begin\(\);/);
  assert.match(css,/\.tour\{/);
});

test('books in progress wait on a Continue reading rest by the entrance',()=>{
  assert.match(game,/const continueDisplay=\(\(\)=>\{/);
  assert.match(game,/book\.progress>\.02&&book\.progress<\.95\)\.slice\(0,4\)/);
  assert.match(game,/home:\{parent:group,position:bm\.position\.clone\(\),quaternion:bm\.quaternion\.clone\(\),scale:\.5\}/);
  assert.match(game,/refreshReadingStack=function\(\)\{preStack\(\);continueDisplay\.refresh\(\)\}/);
});

test('journeys: rain and passing lights on the train, painted worlds in the rocket porthole',()=>{
  assert.match(train,/rainGlass\.uniforms\.uSpeed\.value=reduced\?0:moving/);
  assert.match(train,/passLight\.intensity=Math\.sin\(Math\.PI\*k\)\*16/);
  assert.match(stair,/function drawWorld\(c,kind,x,y,r\)/);
  assert.match(stair,/drawWorld\(c,toMoon\?'earth':'moon'/);
  assert.match(stair,/drawWorld\(c,toMoon\?'moon':'earth'/);
});

test('the tour leads to a real shelf and never hides behind the book panel',()=>{
  assert.match(game,/if\(data\?\.type!=='book'\|\|data\.secret\|\|data\.secretId\|\|data\.seatCopy\|\|!shelf\?\.userData\?\.collider\|\|object\.parent!==shelf\)continue;/,'never a hidden, secret or loose book');
  assert.match(game,/const stand=at\.clone\(\)\.addScaledVector\(forward,1\.7\)\.setY\(0\);if\(!allowed\(stand\.x,stand\.z\)\)continue;/,'Quill waits somewhere the reader can stand');
  assert.match(game,/lastHintAt=performance\.now\(\);lastDiscoveryAt=performance\.now\(\)\}/,'the mystery hints do not pull Quill away mid-tour');
  assert.match(game,/box\.classList\.toggle\('tour-top',!ui\.actions\.classList\.contains\('hidden'\)\)/);
  assert.match(css,/\.tour\.tour-top\{top:/);
});
