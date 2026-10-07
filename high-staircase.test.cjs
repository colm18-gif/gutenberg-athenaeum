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
  assert.match(stair,/for\(const interactive of interactiveParts\)\{interactive\.userData=rocketData;own\(interactive\)\}/);
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

// The module run for real against a stand-in for Three.js: every object keeps its children, position and userData,
// and anything else it is asked to do is a no-op.
function runStair(){
  const vm=require('node:vm');
  const anything=()=>new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>0:k in t?t[k]:(t[k]=anything()),apply:()=>anything(),construct:()=>anything()});
  class V{constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}set(x,y,z){Object.assign(this,{x,y,z});return this}copy(v){return this.set(v.x,v.y,v.z)}clone(){return new V(this.x,this.y,this.z)}}
  const counts={disposed:0};
  class Node{constructor(geometry,material){this.geometry=geometry;this.material=material;this.children=[];this.parent=null;this.position=new V();this.rotation=new V();this.scale=new V(1,1,1);this.scale.setScalar=()=>{};this.quaternion={clone:()=>({})};this.userData={};this.visible=true;this.instanceMatrix={};this.matrix={};this.holes=[];this.attributes={uv:{count:0},position:{count:0}};this.image={getContext:()=>anything()}}
    add(...m){for(const c of m){c.removeFromParent();c.parent=this;this.children.push(c)}return this}
    removeFromParent(){if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1);this.parent=null}
    traverse(f){f(this);for(const c of this.children)c.traverse(f)}
    dispose(){counts.disposed++}updateMatrixWorld(){}updateProjectionMatrix(){}absarc(){}moveTo(){}lineTo(){}closePath(){}setMatrixAt(){}updateMatrix(){}setAttribute(){}setIndex(){}computeVertexNormals(){}}
  const THREE=new Proxy({},{get:(t,k)=>k==='BackSide'||k==='DoubleSide'?1:class extends Node{constructor(...a){super(...a);this.isPointLight=k==='PointLight';this.isLight=/Light$/.test(k)}}});
  const context={window:{},Math,localStorage:{getItem:()=>'1',setItem(){}},document:{getElementById:()=>null,createElement:()=>anything(),body:anything()}};vm.runInNewContext(stair,context);
  const scene=new Node(),interactables=[],notices=[],player={pos:new V(-33.5,0,-11),vel:new V(),yaw:0,pitch:0},camera=new Node();
  const MAT={wood:new Node(),wood2:new Node(),darkWood:new Node(),brass:new Node()};
  const s=context.window.createHighStaircase({THREE,scene,MAT,player,camera,interactables,books:[26,35,4552].map(id=>({id,title:'Book '+id})),coverTexture:()=>new Node(),canvasTexture:()=>new Node(),
    showNotice:t=>notices.push(t),sound(){},playSample:()=>true,lastSafePosition:new V()});
  return {s,scene,interactables,notices,player,camera,counts};
}

test('only the door in the western wing is built at startup; the stair, the Moon and the rocket are built on the way in',()=>{
  const {s,scene,interactables,player}=runStair(),startChildren=scene.children.length,startInteractables=interactables.length;
  assert.equal(s.built,false);
  assert.deepEqual(interactables.map(o=>o.userData.type).sort(),['high-stair-door','high-stair-door','rocket-interior-detail']);
  // What the game asks before anything is built is still answered.
  assert.equal(s.contains(224,30),true);assert.equal(s.onMoon(340,30),true);assert.equal(s.contains(0,0),false);assert.equal(s.floorAt(0,0),null);
  assert.equal(s.built,false,'asking about the hall does not build the stair');
  assert.equal(s.interact(interactables.find(o=>o.userData.type==='rocket-interior-detail')),true,'the hatch answers on its own');assert.equal(s.built,false);
  assert.equal(s.interact(interactables.find(o=>o.userData.type==='high-stair-door')),true);
  assert.equal(s.built,true);assert.equal(s.contains(player.pos.x,player.pos.z),true,'the door takes the reader to the foot of the stair');
  assert(interactables.length>startInteractables+40);assert(interactables.some(o=>o.userData.type==='moon-rocket-launch'));
  assert.equal(scene.children.length,startChildren+1);
});

test('the stair is freed a while after the reader leaves, and built again for a room link or a flight home from Mars',()=>{
  const {s,scene,interactables,player,counts}=runStair(),startChildren=scene.children.length,startInteractables=interactables.length;
  s.interact(interactables.find(o=>o.userData.type==='high-stair-door'));s.update(1,.016);
  player.pos.set(-33.5,0,-11);s.update(20,.016);assert.equal(s.built,true,'kept while the reader may come back');
  s.update(27,.016);assert.equal(s.built,false);
  assert.equal(scene.children.length,startChildren);assert.equal(interactables.length,startInteractables);assert(counts.disposed>100);
  assert(interactables.some(o=>o.userData.type==='high-stair-door'),'the door stays');
  // ?room=rocket-hall puts the reader up there, then the game asks for the floor under them.
  player.pos.set(s.center.x-1.3,s.topY,s.center.z+1.6);assert.equal(s.floorAt(player.pos.x,player.pos.z),s.topY);assert.equal(s.built,true);
  s.update(30,.016);player.pos.set(-33.5,0,-11);s.update(60,.016);assert.equal(s.built,false);
  s.board('summit-mars');assert.equal(s.built,true);assert.equal(s.contains(player.pos.x,player.pos.z),true,'boarded in the cabin');
});

test('a stair book carried away keeps the stair until it comes home',()=>{
  const {s,interactables,player,camera}=runStair();
  s.interact(interactables.find(o=>o.userData.type==='high-stair-door'));s.update(1,.016);
  const book=interactables.find(o=>o.userData.type==='book');assert(book);const home=book.parent;camera.add(book);
  player.pos.set(-33.5,0,-11);s.update(60,.016);assert.equal(s.built,true);
  home.add(book);s.update(61,.016);assert.equal(s.built,false);
});
