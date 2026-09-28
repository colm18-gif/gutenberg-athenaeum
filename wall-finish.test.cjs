const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const game=fs.readFileSync('game.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const source=fs.readFileSync('wall-finish.js','utf8');

// Just enough of three.js for the geometry work: a box laid out face by face as BoxGeometry does it.
class BufferAttribute{constructor(array,itemSize){this.array=array;this.itemSize=itemSize;this.count=array.length/itemSize}
  getX(i){return this.array[i*this.itemSize]}getY(i){return this.array[i*this.itemSize+1]}getZ(i){return this.array[i*this.itemSize+2]}
  setXY(i,x,y){this.array[i*this.itemSize]=x;this.array[i*this.itemSize+1]=y}setY(i,y){this.array[i*this.itemSize+1]=y}}
class Vector3{constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}set(x,y,z){this.x=x;this.y=y;this.z=z;return this}}
function boxGeometry(w,h,d){
  const pos=[],nor=[],faces=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
  for(const n of faces){const axis=n.findIndex(v=>v!==0),others=[0,1,2].filter(a=>a!==axis),size=[w,h,d];
    for(const [s,t] of [[-1,-1],[1,-1],[-1,1],[1,1]]){const p=[0,0,0];p[axis]=n[axis]*size[axis]/2;p[others[0]]=s*size[others[0]]/2;p[others[1]]=t*size[others[1]]/2;pos.push(...p);nor.push(...n)}}
  const geometry={attributes:{position:new BufferAttribute(new Float32Array(pos),3),normal:new BufferAttribute(new Float32Array(nor),3),uv:new BufferAttribute(new Float32Array(48),2)},setAttribute(name,attribute){this.attributes[name]=attribute}};
  return geometry;
}
function finisher(){const window={};vm.runInNewContext(source,{window});return window.createWallFinish({THREE:{BufferAttribute,Vector3}})}
function wall(finish,w,h,d,x,y,z){const mesh={geometry:boxGeometry(w,h,d),position:new Vector3(x,y,z),parent:{}};finish.finishBox(mesh,w,h,d);return mesh}
// Vertex indices of one face (BoxGeometry order: +x, -x, +y, -y, +z, -z).
const face=(index)=>[0,1,2,3].map(k=>index*4+k);

test('wall textures are laid out in metres, so a long wall shows more stone than a short pier',()=>{
  const finish=finisher(),long=wall(finish,38,10,.6,0,5,-31),pier=wall(finish,1,10,.6,5,5,0);
  const span=(mesh,f)=>{const us=face(f).map(i=>mesh.geometry.attributes.uv.getX(i));return Math.max(...us)-Math.min(...us)};
  assert.equal(span(long,4),38);assert.equal(span(pier,4),1);
  const heights=face(4).map(i=>long.geometry.attributes.uv.getY(i));assert.equal(Math.min(...heights),0);assert.equal(Math.max(...heights),10);
});

test('walls standing on the floor are shaded along their foot; raised pieces are not',()=>{
  const finish=finisher(),standing=wall(finish,10,6,.45,0,3,0),lintel=wall(finish,3,1.9,.45,20,5.05,0);
  const floorDistances=mesh=>face(4).map(i=>mesh.geometry.attributes.uv1.getX(i));
  assert.deepEqual(floorDistances(standing).sort((a,b)=>a-b),[0,0,6,6]);
  assert(floorDistances(lintel).every(d=>d===finish.FAR));
});

test('inside corners are found where walls meet, and open ends stay unshaded',()=>{
  // A 10 x 10 room: north and south walls run along x, west and east walls along z.
  const finish=finisher(),north=wall(finish,10,6,.45,0,3,-5),south=wall(finish,10,6,.45,0,3,5),west=wall(finish,.45,6,10,-5,3,0),east=wall(finish,.45,6,10,5,3,0),lone=wall(finish,4,6,.45,40,3,40);
  finish.settle([north,south,west,east,lone],{ceiling:true});
  const edges=(mesh,f)=>face(f).map(i=>[mesh.geometry.attributes.uv2.getX(i),mesh.geometry.attributes.uv2.getY(i)]);
  // The north wall's inner (+z) face meets the west and east walls at both ends.
  for(const [left,right] of edges(north,4)){assert(left<finish.FAR&&right<finish.FAR);assert(Math.abs(left+right-10)<1e-6)}
  // A wall standing alone has no corners, but still meets the ceiling when asked.
  for(const [left,right] of edges(lone,4)){assert.equal(left,finish.FAR);assert.equal(right,finish.FAR)}
  assert(face(4).some(i=>lone.geometry.attributes.uv1.getY(i)===0));
});

test('reading-room floors carry their distance to all four walls',()=>{
  const finish=finisher(),geometry={attributes:{position:new BufferAttribute(new Float32Array([-5,4,0,5,4,0,-5,-4,0,5,-4,0]),3)},setAttribute(name,attribute){this.attributes[name]=attribute}};
  finish.finishFloor(geometry,10,8);
  assert.deepEqual([...geometry.attributes.uv1.array],[0,10,10,0,0,10,10,0]);
  assert.deepEqual([...geometry.attributes.uv2.array],[8,0,8,0,0,8,0,8]);
});

test('the contact shadows are drawn in the wall shader, without lights, textures or unbatchable attributes',()=>{
  assert.match(source,/#ifndef USE_UV1\\nattribute vec2 uv1;/,'three.js declares uv1 itself when the geometry has it');
  assert.match(source,/reflectedLight\.indirectDiffuse\*=wallOcc/);
  assert.match(source,/customProgramCacheKey/);
  assert.match(fs.readFileSync('static-batching.js','utf8'),/ALLOWED_ATTRIBUTES=new Set\(\[[^\]]*'uv1','uv2'/,'the batcher must keep merging wall pieces');
  assert.doesNotMatch(source,/Light\(/);
});

test('the photographic walls load once, fall back to the drawn stone, and stay out of low-bandwidth mode',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(match=>match[1]);
  assert(order.indexOf('wall-finish.js')>-1&&order.indexOf('wall-finish.js')<order.indexOf('game.js'));
  assert.match(game,/const wallFinish=lowBandwidth\?null:window\.createWallFinish/);
  assert.match(game,/const hallWall=wallFinish\?photoWall\('sandstone_blocks_08'/);
  assert.match(game,/wallStandIn=wallFinish\?wallFinish\.scaleTexture\(entranceStone\.map\.clone\(\)/);
  assert.match(game,/if\(wallFinish\?\.isWall\(mat\)\)wallFinish\.finishBox\(m,w,h,d\)/);
  for(const map of ['diffuse.jpg','diffuse.ktx2','normal.jpg','normal.ktx2'])assert(fs.existsSync(`assets/polyhaven/materials/sandstone_blocks_08/${map}`),map);
  // Other rooms build their own walls from entranceStone with their own geometry: its scale must not change.
  assert.match(game,/entranceStone=lowBandwidth\?MAT\.stone:\(\(\)=>\{const tex=tileTex\([\s\S]{0,900}?,512,512,8,4\)/);
});
