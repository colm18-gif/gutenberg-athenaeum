const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const html=fs.readFileSync('index.html','utf8');
const game=fs.readFileSync('game.js','utf8');
const stair=fs.readFileSync('high-staircase.js','utf8');

test('impossible stair is loaded and integrated with movement, interaction and reset',()=>{
  assert.match(html,/loadScript\('high-staircase\.js'\)/);
  assert.match(game,/window\.createHighStaircase/);
  assert.match(game,/highStaircase\.floorAt/);
  assert.match(game,/highStaircase\.allowed/);
  assert.match(game,/highStaircase\.interact/);
  assert.match(game,/highStaircase\.reset/);
});

test('stair rises through many walkable turns to a distinct summit room',()=>{
  assert.match(stair,/topY=30,steps=180,turns=3\.2/);
  assert.match(stair,/stepPath\.push\(\{x,z,y,a\}\)/);
  assert.match(stair,/function closestStep/);
  assert.match(stair,/if\(r<4\.85\)return topY/);
  assert.match(stair,/THE LAST LANDING/);
  assert.match(stair,/athenaeum-high-stair-summit/);
});

test('summit collection is curated for height, time and impossible journeys',()=>{
  assert.match(stair,/wanted=\[26,35,103,164,4552,16457,829,159\]/);
  assert.match(stair,/looking down, looking up, and looking beyond/);
  assert.match(stair,/userData=\{type:'book',book,loaded:true/);
});

test('both doors provide reversible, explicit travel',()=>{
  assert.match(stair,/type:'high-stair-door'/);
  assert.match(stair,/type:'high-stair-exit'/);
  assert.match(stair,/moveTo\(bottomX,0,bottomZ\+1\.25/);
  assert.match(stair,/entranceX=-33\.5,entranceZ=-13\.58/);
  assert.match(stair,/moveTo\(entranceX,0,-11\.15,0\)/);
});

test('western entrance is clear of the north-wall bookcase and visibly marked',()=>{
  assert.match(game,/shelf\(-28,-12,0,6\)/);
  assert.match(stair,/entranceX=-33\.5/);
  assert.match(stair,/entranceGlow=new THREE\.PointLight\(0xffbd72,11,8,2\)/);
  assert.match(stair,/for\(let i=0;i<5;i\+\+\).*marker=box/);
});
