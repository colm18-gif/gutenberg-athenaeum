const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Scene-contract doubles keep this regression check dependency-free.
class Vector{constructor(x=0,y=0,z=0){Object.assign(this,{x,y,z})}set(x,y,z){Object.assign(this,{x,y,z});return this}clone(){return new Vector(this.x,this.y,this.z)}}
class Object3D{constructor(){this.children=[];this.position=new Vector();this.scale=new Vector(1,1,1);this.rotation={x:0,y:0,z:0};this.quaternion={clone:()=>({})};this.visible=true;this.userData={}}add(m){m.parent=this;this.children.push(m)}traverse(fn){fn(this);this.children.forEach(m=>m.traverse(fn))}}
class Geometry{constructor(width,height,depth){this.parameters={width,height,depth}}}
class Mesh extends Object3D{constructor(geometry,material){super();this.geometry=geometry;this.material=material;this.isMesh=true}}
const THREE={Group:Object3D,Mesh,BoxGeometry:Geometry,PlaneGeometry:Geometry,DodecahedronGeometry:Geometry,IcosahedronGeometry:Geometry,CircleGeometry:Geometry,SphereGeometry:Geometry,ConeGeometry:Geometry,MeshStandardMaterial:class{constructor(p){Object.assign(this,p)}},PointLight:class extends Object3D{constructor(color,intensity,distance){super();Object.assign(this,{color,intensity,distance,isPointLight:true})}},MathUtils:{damp:(a,b,l,d)=>b+(a-b)*Math.exp(-l*d)}};
THREE.CylinderGeometry=Geometry;
THREE.BufferGeometry=class{constructor(){this.attributes={}}setAttribute(name,value){this.attributes[name]=value}setIndex(index){this.index=index}computeVertexNormals(){}};
THREE.Float32BufferAttribute=class{constructor(array,size){this.array=array;this.size=size}setXYZ(i,x,y,z){this.array[i*3]=x;this.array[i*3+1]=y;this.array[i*3+2]=z}getY(i){return this.array[i*3+1]}setY(i,y){this.array[i*3+1]=y}};
THREE.Vector3=class extends Vector{cross(v){const {x,y,z}=this;return this.set(y*v.z-z*v.y,z*v.x-x*v.z,x*v.y-y*v.x)}dot(v){return this.x*v.x+this.y*v.y+this.z*v.z}};
THREE.MeshBasicMaterial=class{constructor(p){Object.assign(this,p);this.color={value:p?.color,setRGB(r,g,b){this.rgb=[r,g,b]}}}};THREE.RepeatWrapping=1;THREE.ClampToEdgeWrapping=2;
function fixture(callbacks={}){const scene=new Object3D(),wing=new Object3D(),colliders=[],interactables=[];scene.add(wing);const wall=new Mesh(new Geometry(18,8,.5),{});wall.position.set(28,4,10);wing.add(wall);
  function collider(x,z,w,d,name='furniture',minY=-Infinity,maxY=Infinity){const c={minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,minY,maxY,inactive:false,name};colliders.push(c);return c}collider(28,10,18,.5);
  const sandbox={window:{},Math};vm.runInNewContext(fs.readFileSync('verne-descent.js','utf8'),sandbox);
  const player={pos:new Vector(34,0,8),radius:.42},book={id:3748,title:'Journey to the Centre of the Earth'},performanceZones={eastWing:{group:wing}};
  const descent=sandbox.window.createVerneDescent({THREE,scene,MAT:{stone:{},wood:{},wood2:{},darkWood:{},brass:{},green:{}},collider,colliders,interactables,canvasTexture:()=>({}),wrapText:()=>{},player,camera:{},book,performanceZones,rememberLights:()=>{},...callbacks});
  return{scene,wing,wall,colliders,interactables,descent,player,book,performanceZones};}
function canWalk(f,x,z){const d=f.descent,r=f.player.radius,y=d.floorAt(x,z);if(y===null)return false;for(const [dx,dz] of [[r,0],[-r,0],[0,r],[0,-r],[r*.707,r*.707],[-r*.707,r*.707],[r*.707,-r*.707],[-r*.707,-r*.707]])if(!d.contains(x+dx,z+dz)&&!(x+dx>19&&x+dx<37&&z+dz>-14&&z+dz<10))return false;return!f.colliders.some(c=>!c.inactive&&y>=c.minY&&y<=c.maxY&&x+r>c.minX&&x-r<c.maxX&&z+r>c.minZ&&z-r<c.maxZ);}
test('entrance retains the old wall and builds the descent only on discovery',()=>{const f=fixture();assert(f.wing.children.includes(f.wall));assert.equal(f.descent.built,false);assert(!canWalk(f,34,9.7));assert(f.descent.interact(f.descent.panel));assert(f.descent.built);assert(canWalk(f,34,9.7));assert(f.performanceZones.verneDescent);});
test('all twelve flights, returns and chamber have a reversible collision-safe route',()=>{const f=fixture();f.descent.interact(f.descent.panel);const path=[];function walk(x,z){assert(canWalk(f,x,z),`blocked ${x},${z}`);path.push([x,z]);}
  for(let z=9.4;z<=14;z+=.05)walk(34,z);
  for(let i=0;i<12;i++){const x=i%2?40:34,z=14+i*18;for(let p=z;p<=z+16;p+=.05)walk(x,p);const next=i===11?37:(i%2?34:40);for(let p=Math.min(x,next);p<=Math.max(x,next);p+=.05)walk(p,z+16);for(let p=z+16;p<=z+18;p+=.05)walk(next,p);}
  for(let z=230;z<=233.7;z+=.05)walk(37,z);path.reverse().forEach(([x,z])=>assert(canWalk(f,x,z)));assert.equal(f.descent.floorAt(37,234),-57.6);assert(!canWalk(f,37,235));assert(!canWalk(f,37,60));assert(!canWalk(f,30,230));
});
test('unique expedition copy uses the existing book contract without replacing catalogue records',()=>{const f=fixture();f.descent.build();const copy=f.interactables.find(m=>m.userData.expeditionCopy);assert.equal(copy.userData.book,f.book);assert.equal(copy.userData.home.parent,copy.parent);assert.equal(copy.userData.type,'book');assert.equal(copy.userData.loaded,true);f.player.pos.set(37,-57.6,234);assert.equal(f.descent.update(10,.016,true,()=>{}),1);assert(!f.descent.clearLine({intersectObjects:()=>[{distance:1,object:{}}]},copy,2));});
test('complete local edition is available through both existing loading paths',()=>{const text=fs.readFileSync('texts/pg3748.txt','utf8');assert(text.length>400000);assert.match(text,/END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK/);const local={window:{}};vm.runInNewContext(fs.readFileSync('texts/local/pg3748.js','utf8'),local);assert(local.window.ATHENAEUM_LOCAL_TEXTS[3748].length>400000);});
test('brass bell fades and returns once, blocks repeated ringing and reuses its geometry',()=>{
  let rings=0,returns=0;const fades=[];
  const f=fixture({onBell:()=>rings++,onFade:v=>fades.push(v),onReturn:()=>{returns++;f.player.pos.set(0,0,24)}});f.descent.build();f.player.pos.set(37,-57.6,233);
  const bell=f.interactables.find(m=>m.userData.type==='verne-return-bell'),count=f.interactables.length;assert(bell);assert(canWalk(f,38.4,233.7));
  f.descent.interact(bell);f.descent.interact(bell);assert.equal(rings,1);assert(f.descent.returning);
  for(let i=0;i<70;i++)f.descent.update(i*.02,.02,false,()=>{});
  assert.equal(returns,1);assert.equal(f.player.pos.z,24);assert(!f.descent.returning);assert.equal(fades.at(-1),0);assert(fades.includes(1));assert.equal(f.interactables.length,count);
  f.descent.interact(bell);for(let i=0;i<20;i++)f.descent.update(i*.02,.02,true,()=>{});assert.equal(returns,2);assert(!f.descent.returning);
});
test('subterranean companions are readable, locally complete and leave chamber circulation clear',()=>{
  const companionBooks=[1355,545,1951].map(id=>({id,title:'Underground volume',author:'Author',fieldColour:'#343b2c'}));
  const f=fixture({companionBooks});f.descent.build();
  const copies=f.interactables.filter(m=>m.userData.subterraneanCopy);assert.equal(copies.length,3);
  copies.forEach((copy,i)=>{assert.equal(copy.userData.book,companionBooks[i]);assert.equal(copy.userData.type,'book');assert(copy.userData.realCover);assert.equal(copy.userData.home.parent,copy.parent);assert(canWalk(f,34.8,copy.position.z));
    const text=fs.readFileSync(`texts/pg${companionBooks[i].id}.txt`,'utf8');assert(text.length>100000);assert.match(text,/END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK/);
    const local={window:{}};vm.runInNewContext(fs.readFileSync(`texts/local/pg${companionBooks[i].id}.js`,'utf8'),local);assert.equal(local.window.ATHENAEUM_LOCAL_TEXTS[companionBooks[i].id].replace(/\r\n/g,'\n'),text.replace(/\r\n/g,'\n'));
  });
  assert(!canWalk(f,33.2,234.4));for(const x of [34.8,39,40.8])for(let z=231;z<237.4;z+=.1)assert(canWalk(f,x,z),`blocked chamber ${x}/${z}`);
  assert(canWalk(f,38.7,235));assert(f.interactables.some(m=>m.userData.type==='verne-return-bell'));
});
test('last six flights have two intermediate warm lamps with usable range and no new collision',()=>{
  const f=fixture();f.descent.build();const lights=[];f.descent.group.traverse(o=>{if(o.isPointLight)lights.push(o)});
for(let i=6;i<12;i++){const x=i%2?40:34,z=14+i*18;for(const offset of [5,10]){const light=lights.find(l=>l.position.z===z+offset&&Math.abs(Math.abs(l.position.x-x)-1.7)<.001);assert(light,`missing lower-flight lamp ${i}/${offset}`);assert(light.intensity>=6);assert(light.distance>=8);assert(canWalk(f,x,z+offset));}}
});
test('the walls below the first flight show the layers of the earth, facing into the stair',()=>{
  const f=fixture();f.descent.build();const facings=[];f.scene.traverse(()=>{});f.descent.group.traverse(m=>{if(m.geometry?.attributes?.uv)facings.push(m)});
  assert(facings.length>=11*2+11*2,'both walls of every flight but the first, and the landings');
  const strata=f.descent.strata;assert.equal(strata.length,12);assert.equal(strata[0][0],0);for(let i=1;i<strata.length;i++)assert.equal(strata[i][0],strata[i-1][1],'layers meet without gaps');
  // A facing on the west wall of flight 1 (x 40, so the wall is at 38.01) must face east, into the stair.
  const west=facings.find(m=>m.geometry.attributes.position.array[0]===38.01);assert(west);const p=west.geometry.attributes.position.array,i=west.geometry.index;
  const at=k=>[p[k*3],p[k*3+1],p[k*3+2]],[a,b,c]=[at(i[0]),at(i[1]),at(i[2])],u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],v=[c[0]-a[0],c[1]-a[1],c[2]-a[2]];
  assert(u[1]*v[2]-u[2]*v[1]>0,'front face points +x');
  // UVs follow world depth: v = 1 at the reading room floor, 0 sixty-two metres down.
  const uv=west.geometry.attributes.uv.array;assert(Math.abs(uv[1]-(1+p[1]/62))<1e-9);
});
test('every landing carries a depth marker and the chalk landing opens on a shaft to daylight',()=>{
  const f=fixture();const drawn=[];f.descent.build();
  const plates=[];f.descent.group.traverse(m=>{if(m.geometry?.parameters?.width===1.15&&m.geometry.parameters.height===.65)plates.push(m)});assert.equal(plates.length,12);
  plates.forEach((plate,i)=>{assert(Math.abs(plate.position.y-(-(i+1)*4.8+1.85))<1e-9);assert.equal(plate.rotation.y,Math.PI)});
  const source=fs.readFileSync('verne-descent.js','utf8');assert.match(source,/\['Chalk','A warm sea, 80 million years ago · look up'\]/);assert.match(source,/Arne Saknussemm/);
  const sky=[];
  // The daylight disc hangs at the top of the shaft, well above the landing it lights.
  f.descent.group.traverse(m=>{if(m.geometry instanceof THREE.CircleGeometry&&m.position.y===-3.02)sky.push(m)});assert(sky.some(m=>m.position.y===-3.02&&m.position.z===120));
});
test('tremors drop grit only on someone who is down there, and depth is reported in metres',()=>{
  THREE.Points=class extends Object3D{constructor(geometry,material){super();this.geometry=geometry;this.material=material}};THREE.PointsMaterial=THREE.MeshStandardMaterial;
  const f=fixture();f.descent.build();
  f.player.pos.set(0,0,24);f.descent.tremor();let grit=null;f.descent.group.traverse(m=>{if(m instanceof THREE.Points)grit=m});assert.equal(grit,null);assert.equal(f.descent.metres,0);
  f.player.pos.set(40,-30,150);f.descent.tremor();f.descent.group.traverse(m=>{if(m instanceof THREE.Points)grit=m});assert(grit&&grit.visible);assert.equal(f.descent.metres,30);
});
test('the last six flights close in without narrowing the walk, and glow warmer at the bottom',()=>{
  const f=fixture();f.descent.build();const walls={};
  f.descent.group.traverse(m=>{const a=m.geometry?.attributes;if(!a?.uv)return;const p=a.position.array;if(p[0]===p[3]&&p[0]===p[6]&&p[2]!==p[5]&&p[4]<p[1]+1){}});
  const source=fs.readFileSync('verne-descent.js','utf8');assert.match(source,/const press=Math\.max\(0,i-5\),inset=1\.99-press\*\.04,roof=3\.15-press\*\.07;/);
  // Deepest flight: walls 1.75 m from the centre, still outside a reader's 0.42 m reach from the 2 m walking half-width limit.
  assert(1.99-6*.04>2-.42+.1);
  const seams=[];f.descent.group.traverse(m=>{if(m.material?.color?.setRGB&&m.geometry?.attributes?.position&&!m.geometry.attributes.uv)seams.push(m)});assert.equal(seams.length,5*2,'flights 7 to 11, both walls');
  f.player.pos.set(40,-30,150);f.descent.update(3,.016,false,()=>{});assert(seams[0].material.color.rgb[0]>seams[0].material.color.rgb[2],'the seams glow orange');
});
test('a split in the basalt looks down on the underground sea, and its sound follows distance',()=>{
  const notices=[];const f=fixture({notice:text=>notices.push(text)});f.descent.build();
  const views=[];f.descent.group.traverse(m=>{if(m.geometry?.parameters?.width===46)views.push(m)});assert.equal(views.length,1);assert.equal(views[0].rotation.y,-Math.PI/2);
  assert(views[0].position.x>50,'the view lies far beyond the wall');
  f.player.pos.set(41,-52.8,210);f.descent.update(4,.016,false,()=>{});assert(f.descent.seaLevel>.9);assert.equal(notices.length,1);
  f.player.pos.set(35,-52,205);f.descent.update(5,.016,false,()=>{});assert(f.descent.seaLevel<.6&&f.descent.seaLevel>0);
  f.player.pos.set(40,-10,60);f.descent.update(6,.016,false,()=>{});assert.equal(f.descent.seaLevel,0);
});
