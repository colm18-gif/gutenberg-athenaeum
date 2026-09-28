const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('halloween.js','utf8'),game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8');
const w={};vm.runInNewContext(source,{window:w,URLSearchParams,location:{search:''}});
const inSeason=w.createHalloween.inSeason;

test('Halloween night runs from 24 October to 2 November, and can be previewed or hidden',()=>{
  for(const [date,expected] of [['2026-10-23',false],['2026-10-24',true],['2026-10-31',true],['2026-11-02',true],['2026-11-03',false],['2027-06-01',false]])
    assert.equal(inSeason(new Date(date+'T20:00:00'),''),expected,date);
  assert.equal(inSeason(new Date('2027-06-01T20:00:00'),'?halloween'),true,'?halloween shows it on any night');
  assert.equal(inSeason(new Date('2026-10-31T20:00:00'),'?nohalloween'),false,'?nohalloween hides it');
  // Out of season nothing is built at all.
  const quiet=w.createHalloween({THREE:{},scene:null,today:()=>new Date('2027-03-01T12:00:00'),search:''});
  assert.equal(quiet.active,false);
});

test('the lanterns glow without lights, as one instanced mesh with one shared material',()=>{
  assert.doesNotMatch(source,/new THREE\.(Point|Spot|Directional|Hemisphere|RectArea)Light/,'no new lights: the faces glow through emissiveMap');
  assert.match(source,/new THREE\.InstancedMesh\(ribbedSphere\(8,\.07\),pumpkinMaterial/);
  assert.match(source,/pumpkinMaterial\.emissiveIntensity=f/,'one number flickers every lantern');
  assert.match(source,/collider\?\.\(TABLE\.x,TABLE\.z,/);assert.match(source,/collider\?\.\(l\.x,l\.z,/);
  // The card is accurate about Samhain and the turnip, and the table carries the Irish books it names.
  assert.match(source,/The Irish carved their lanterns from turnips/);
  for(const id of [345,10007,14851,14522])assert.ok(source.match(/TABLE_BOOKS=\[([^\]]*)\]/)[1].split(',').slice(0,8).map(Number).includes(id),`book ${id} is on the table`);
});

test('the library wires Halloween night in, before game.js',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);
  assert.ok(order.indexOf('halloween.js')>-1&&order.indexOf('halloween.js')<order.indexOf('game.js'));
  assert.match(game,/const halloween=window\.createHalloween\?\.\(/);
  assert.match(game,/if\(focus&&!selected&&halloween\.interact\(focus\)\)/);
  assert.match(game,/halloween\.update\(t\)/);
});
