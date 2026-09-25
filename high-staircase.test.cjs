const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const html=fs.readFileSync('index.html','utf8');
const game=fs.readFileSync('game.js','utf8');
const stair=fs.readFileSync('high-staircase.js','utf8');

test('impossible stair is loaded and integrated with movement, interaction and reset',()=>{
  assert.match(html,/startupScript\('high-staircase\.js'\)/);
  assert.match(game,/window\.createHighStaircase/);
  assert.match(game,/highStaircase\.floorAt/);
  assert.match(game,/highStaircase\.allowed/);
  assert.match(game,/highStaircase\.interact/);
  assert.match(game,/highStaircase\.reset/);
});

test('stair rises through many walkable turns to a distinct Rocket Hall',()=>{
  assert.match(stair,/topY=30,steps=180,turns=3\.2/);
  assert.match(stair,/stepPath\.push\(\{x,z,y,a\}\)/);
  assert.match(stair,/function closestStep/);
  assert.match(stair,/if\(r<9\.4&&player\.pos\.y>topY-2\)return topY/);
  assert.match(stair,/The Rocket Hall/);
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
  assert.match(stair,/moveTo\(bottomX,0,bottomZ\+1\.25,Math\.PI\)/);
  assert.match(stair,/first rising tread is directly ahead/);
  assert.match(stair,/entranceX=-33\.5,entranceZ=-13\.58/);
  assert.match(stair,/moveTo\(entranceX,0,-11\.15,0\)/);
});

test('the summit has an unmistakable illuminated shortcut back to the library',()=>{
  assert.match(stair,/type:'summit-library-exit'/);
  assert.match(stair,/DOWN TO THE LIBRARY/);
  assert.match(stair,/action:'DESCEND'/);
  assert.match(stair,/summitExitGlow=new THREE\.PointLight/);
  assert.match(stair,/type==='high-stair-exit'\|\|type==='summit-library-exit'/);
});

test('western entrance is clear of the north-wall bookcase and visibly marked',()=>{
  assert.match(game,/shelf\(-28,-12,0,6\)/);
  assert.match(stair,/entranceX=-33\.5/);
  assert.match(stair,/entranceGlow=new THREE\.PointLight\(0xffbd72,11,8,2\)/);
  assert.match(stair,/for\(let i=0;i<5;i\+\+\).*marker=box/);
});

test('a primitive rocket makes a reversible journey from the summit to the Moon',()=>{
  assert.match(stair,/function primitiveRocket/);
  assert.match(stair,/interactiveParts=\[\],rocketData=\{type,title,author,action:'BOARD'\}/);
  assert.match(stair,/for\(const interactive of interactiveParts\)\{interactive\.userData=rocketData;interactables\.push\(interactive\)\}/);
  assert.match(stair,/The Librarian’s Lunar Projectile/);
  assert.match(stair,/type==='moon-rocket-launch'/);
  assert.match(stair,/moveTo\(mx,0,mz\+6,Math\.PI\)/);
  assert.match(stair,/type==='moon-rocket-return'/);
  assert.match(stair,/moveTo\(cx-1\.3,topY,cz\+1\.6,Math\.PI\)/);
  assert.match(stair,/athenaeum-moon-visited/);
  assert.match(game,/playSample,lastSafePosition/);
  assert.match(stair,/playSample\?\.\('rocketLaunch'/);
  // Since #31 the reader boards first, then presses the red launch button inside the cabin.
  assert.match(stair,/type==='moon-rocket-launch'\)\{boardRocket\('moon'\)/);
  assert.match(stair,/type==='moon-rocket-return'\)\{boardRocket\('summit'\)/);
  assert.match(stair,/function boardRocket\(direction\)\{if\(rocketTrip\)return;rocketBoarded=direction/);
  assert.match(stair,/type==='rocket-start'\)\{beginRocketTrip\(\)/);
  assert.match(stair,/function beginRocketTrip\(\)\{if\(rocketTrip\|\|!rocketBoarded\)return/);
  assert.match(stair,/LAUNCH SEQUENCE · 4…/);
  assert.match(stair,/rocketTrip\.elapsed\+=dt/);
  assert.match(stair,/e>=25/);
});

test('the rocket cabin is a decorated and inspectable Victorian reading vessel',()=>{
  for(const detail of ['buttoned launch couch','lunar navigation desk','Aether pressure','Narrative velocity','A practical chart of impractical orbits','secured travelling library','aether lamp'])assert.match(stair,new RegExp(detail,'i'));
  assert.match(stair,/type:'rocket-interior-detail'/);
  assert.match(stair,/type==='rocket-interior-detail'/);
  assert.match(stair,/Horsehair padding, library-red leather/);
  assert.match(stair,/Verne, Wells, Kepler, and de Bergerac/);
});

test('stair containment checks the full player radius and current vertical turn',()=>{
  assert.match(stair,/Math\.abs\(stepY-y\)>1\.35/);
  assert.match(stair,/samples=\[\[0,0\],\[radius,0\]/);
  assert.match(stair,/stepY=from\.y\+\(to\.y-from\.y\)\*u/);
  assert.match(stair,/const pathStep=closestStep\(x,z\);.*if\(inStairwell\(x,z\)\)return !!pathStep&&Math\.abs\(pathStep\.y-player\.pos\.y\)<\.7;if\(pathStep\)return true/);
  // In flight the cabin floor stays walkable; refusing every position made the game spam "returns you to firm ground".
  assert.match(stair,/if\(rocketTrip\)return inTransit\(x,z\)&&Math\.hypot\(x-tx,z-tz\)<2\.45/);
});

test('continuous spiral collision has no impassable gaps between outer treads',()=>{
  const cx=224,cz=30,topY=30,steps=180,turns=3.2,outerRadius=12,innerRadius=4.35,path=[];
  for(let i=0;i<steps;i++){const p=i/(steps-1),a=p*turns*Math.PI*2,r=outerRadius+(innerRadius-outerRadius)*p;path.push({x:cx+Math.cos(a)*r,z:cz+Math.sin(a)*r,y:p*topY})}
  const midpoint={x:(path[0].x+path[1].x)/2,z:(path[0].z+path[1].z)/2};
  const oldNearest=Math.min(...path.map(step=>Math.hypot(midpoint.x-step.x,midpoint.z-step.z)));
  assert(oldNearest>.55,'the old isolated-centre collision leaves an outer gap');
  assert.match(stair,/for\(let i=0;i<stepPath\.length-1;i\+\+\)/);
  assert.match(stair,/\(\(x-from\.x\)\*dx\+\(z-from\.z\)\*dz\)\/lengthSquared/);
});

test('stair entrance faces along the first ascending turn',()=>{
  const yaw=Math.PI,forward={x:-Math.sin(yaw),z:-Math.cos(yaw)};
  assert(Math.abs(forward.x)<1e-9);
  assert(forward.z>.99,'forward movement should lead toward the next rising tread');
  assert.match(stair,/moveTo\(bottomX,0,bottomZ\+1\.25,Math\.PI\)/);
});

test('the spiral path takes priority across the landing safety boundary',()=>{
  const playerRadius=.42,landingLimit=2.38-playerRadius,oldSwitch=2.2;
  assert(landingLimit<oldSwitch,'the previous landing-only rules created a locked ring');
  const pathPriority=stair.indexOf('if(pathStep)return true');
  const landingCheck=stair.indexOf('const summit=Math.hypot');
  assert(pathPriority>0&&pathPriority<landingCheck,'the overlapping stair path must be accepted before the landing perimeter is checked');
});

test('the lunar outpost is walkable and holds an early science-fiction collection',()=>{
  assert.match(stair,/mx=340,mz=30,moonRadius=18/);
  assert.match(stair,/function onMoon/);
  assert.match(stair,/if\(onMoon\(x,z\)\|\|inTransit\(x,z\)\)return 0/);
  assert.match(stair,/THE SELENITE READING OUTPOST/);
  assert.match(stair,/lunarCollection=\[4552,16457,1013,1633,46547,10430,10005,69338,66510,62779,19103\]/);
  assert.doesNotMatch(stair,/scienceFiction=\[35,36,62/);
  assert.match(stair,/moonBooks\.push\(bm\)/);
  assert.match(stair,/scene\.background\.setHex\(0x03050b\)/);
});
