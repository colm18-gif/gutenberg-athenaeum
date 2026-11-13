(()=>{
'use strict';

// Static batching. The library is built from thousands of small boxes, rails, brackets and trims
// that share a handful of materials (wood, brass, stone), and each one used to cost a draw call.
// Once a piece has stayed still for a couple of seconds it is merged with its neighbours of the
// same material into a single mesh. The original stays where it was, hidden from the camera; if
// any code later moves, hides, re-parents or restyles it, it is handed straight back (within the
// same frame) and its batch is rebuilt without it, so animated or scripted pieces keep working.
// Originals are hidden by giving them an empty culling sphere rather than by changing layers or
// visibility, so collision and picking rays (which use the geometry itself) still find them.
window.createStaticBatcher=function({THREE,scene,exclusions=()=>[],cell=14,scanEvery=2,changeStamp=null}){
  const MERGEABLE=new Set(['MeshStandardMaterial','MeshPhysicalMaterial','MeshBasicMaterial','MeshLambertMaterial','MeshPhongMaterial']);
  const ALLOWED_ATTRIBUTES=new Set(['position','normal','uv','uv1','uv2','color']);
  const defaultBeforeRender=THREE.Object3D.prototype.onBeforeRender;
  const members=new Map();        // hidden original -> {batch,state}
  const sightings=new Map();      // candidate -> state when first seen unchanged
  const released=new WeakSet();   // pieces that moved after batching: never batched again
  const batches=new Map();        // key -> batch
  const dirty=new Set();
  const urgent=new Set();        // batches that lost a piece and must be rebuilt this frame
  let nextScan=performance.now()+500,enabled=true,lastStamp=null,scansLeft=3;
  const matrix=new THREE.Matrix3(),vector=new THREE.Vector3(),hiddenSphere=new THREE.Sphere(new THREE.Vector3(0,-1e9,0),0);
  function hide(mesh){mesh.boundingSphere=hiddenSphere}
  function show(mesh){delete mesh.boundingSphere}

  function state(mesh){const p=mesh.position,q=mesh.quaternion,s=mesh.scale;return [p.x,p.y,p.z,q.x,q.y,q.z,q.w,s.x,s.y,s.z,mesh.visible,mesh.parent,mesh.material,mesh.geometry,mesh.geometry?.attributes.position?.version,mesh.renderOrder,mesh.castShadow,mesh.receiveShadow]}
  function sameState(a,b){for(let i=0;i<a.length;i++)if(a[i]!==b[i])return false;return true}
  // The per-frame check compares in place, so watching thousands of pieces allocates nothing.
  function unchanged(mesh,s){const p=mesh.position,q=mesh.quaternion,k=mesh.scale;return p.x===s[0]&&p.y===s[1]&&p.z===s[2]&&q.x===s[3]&&q.y===s[4]&&q.z===s[5]&&q.w===s[6]&&k.x===s[7]&&k.y===s[8]&&k.z===s[9]&&mesh.visible===s[10]&&mesh.parent===s[11]&&mesh.material===s[12]&&mesh.geometry===s[13]&&mesh.geometry?.attributes.position?.version===s[14]&&mesh.renderOrder===s[15]&&mesh.castShadow===s[16]&&mesh.receiveShadow===s[17]}
  function attributeSignature(geometry){const names=Object.keys(geometry.attributes).sort();for(const name of names)if(!ALLOWED_ATTRIBUTES.has(name))return null;if(!geometry.attributes.position||!geometry.attributes.normal||geometry.attributes.position.itemSize!==3)return null;return names.map(name=>name+geometry.attributes[name].itemSize).join('|')}
  function eligible(mesh,excluded){
    if(!mesh.isMesh||mesh.isInstancedMesh||mesh.isSkinnedMesh||mesh.type!=='Mesh'||!mesh.parent||mesh.parent.isCamera||mesh.children.length)return false;
    if(released.has(mesh)||excluded.has(mesh)||!mesh.visible||mesh.layers.mask!==1||!mesh.frustumCulled||mesh.boundingSphere!==undefined||mesh.renderOrder!==0||mesh.onBeforeRender!==defaultBeforeRender)return false;
    for(const key in mesh.userData)return false;
    const material=mesh.material;if(!material||Array.isArray(material)||!MERGEABLE.has(material.type)||material.transparent||!material.visible||material.colorWrite===false||material.depthTest===false||material.depthWrite===false||material.stencilWrite)return false;
    const geometry=mesh.geometry;if(!geometry?.isBufferGeometry||Object.keys(geometry.morphAttributes).length||geometry.drawRange.start!==0||geometry.drawRange.count!==Infinity||mesh.morphTargetInfluences)return false;
    if(mesh.scale.x*mesh.scale.y*mesh.scale.z<=0)return false;
    return !!attributeSignature(geometry);
  }
  function keyFor(mesh){return `${mesh.parent.id}:${mesh.material.id}:${attributeSignature(mesh.geometry)}:${mesh.castShadow?1:0}${mesh.receiveShadow?1:0}:${Math.floor(mesh.position.x/cell)},${Math.floor(mesh.position.z/cell)}`}

  function component(attribute,index,c){return c===0?attribute.getX(index):c===1?attribute.getY(index):c===2?attribute.getZ(index):attribute.getW(index)}
  function mergeGeometry(pieces){
    const names=Object.keys(pieces[0].geometry.attributes);let vertexCount=0,indexCount=0;
    for(const piece of pieces){const g=piece.geometry;vertexCount+=g.attributes.position.count;indexCount+=g.index?g.index.count:g.attributes.position.count}
    const arrays={};for(const name of names)arrays[name]=new Float32Array(vertexCount*pieces[0].geometry.attributes[name].itemSize);
    const index=vertexCount>65535?new Uint32Array(indexCount):new Uint16Array(indexCount);let vertexOffset=0,indexOffset=0;
    for(const piece of pieces){
      piece.updateMatrix();const g=piece.geometry,count=g.attributes.position.count;matrix.getNormalMatrix(piece.matrix);
      for(const name of names){const source=g.attributes[name],size=source.itemSize,target=arrays[name];
        for(let i=0;i<count;i++){const o=(vertexOffset+i)*size;
          if(name==='position'){vector.set(source.getX(i),source.getY(i),source.getZ(i)).applyMatrix4(piece.matrix);target[o]=vector.x;target[o+1]=vector.y;target[o+2]=vector.z}
          else if(name==='normal'){vector.set(source.getX(i),source.getY(i),source.getZ(i)).applyMatrix3(matrix).normalize();target[o]=vector.x;target[o+1]=vector.y;target[o+2]=vector.z}
          else for(let c=0;c<size;c++)target[o+c]=component(source,i,c)}}
      if(g.index)for(let i=0;i<g.index.count;i++)index[indexOffset+i]=g.index.getX(i)+vertexOffset;else for(let i=0;i<count;i++)index[indexOffset+i]=i+vertexOffset;
      vertexOffset+=count;indexOffset+=g.index?g.index.count:count;
    }
    const merged=new THREE.BufferGeometry();for(const name of names)merged.setAttribute(name,new THREE.BufferAttribute(arrays[name],pieces[0].geometry.attributes[name].itemSize));merged.setIndex(new THREE.BufferAttribute(index,1));merged.computeBoundingBox();merged.computeBoundingSphere();return merged;
  }

  function release(mesh){const record=members.get(mesh);if(!record)return;members.delete(mesh);show(mesh);released.add(mesh);record.batch.pieces.delete(mesh);urgent.add(record.batch)}
  function rebuild(batch){
    if(batch.mesh){batch.mesh.parent?.remove(batch.mesh);batch.mesh.geometry.dispose();batch.mesh=null}
    for(const piece of batch.pieces)if(piece.parent!==batch.parent){if(members.delete(piece))show(piece);batch.pieces.delete(piece)}
    const pieces=[...batch.pieces];
    if(pieces.length<2||!batch.parent.parent&&batch.parent!==scene){for(const piece of pieces){if(members.delete(piece))show(piece)}batch.pieces.clear();batches.delete(batch.key);return}
    for(const piece of pieces){const record=members.get(piece);if(record?.pending){record.pending=false;hide(piece)}}
    const first=pieces[0],mesh=new THREE.Mesh(mergeGeometry(pieces),batch.material);
    mesh.name='static-batch';mesh.castShadow=first.castShadow;mesh.receiveShadow=first.receiveShadow;mesh.matrixAutoUpdate=false;mesh.updateMatrix();
    batch.parent.add(mesh);batch.mesh=mesh;
  }

  // Spread over frames: the scene is walked a slice at a time and batches are merged a few at a time, a few
  // milliseconds a frame, and none of it in the frame after a tap (`defer`), so a tap is answered first.
  // A piece joins its batch (`pending`) but stays drawn on its own until the batch is merged with it.
  const SLICE_MS=3;
  let scanning=null; // {queue,at,excluded,ready}
  function startScan(){const queue=[];scene.traverse(object=>{if(object.isMesh)queue.push(object)});scanning={queue,at:0,excluded:new Set(exclusions()),ready:new Map()}}
  function stepScan(until){
    const {queue,excluded,ready}=scanning;
    while(scanning.at<queue.length){
      if((scanning.at&63)===0&&performance.now()>until)return false;
      const object=queue[scanning.at++];
      if(members.has(object)||!object.parent||!eligible(object,excluded))continue;
      const current=state(object),seen=sightings.get(object),now=performance.now();
      if(!seen||!sameState(seen.state,current)){sightings.set(object,{state:current,at:now});continue}
      if(now-seen.at<scanEvery*900)continue;
      const key=keyFor(object);if(!ready.has(key))ready.set(key,[]);ready.get(key).push(object);
    }
    for(const [key,pieces] of ready){
      let batch=batches.get(key);
      if(!batch&&pieces.length<2)continue;
      if(!batch){batch={key,parent:pieces[0].parent,material:pieces[0].material,pieces:new Set(),mesh:null};batches.set(key,batch)}
      for(const piece of pieces){if(!piece.parent||!unchanged(piece,sightings.get(piece)?.state||state(piece)))continue;sightings.delete(piece);members.set(piece,{batch,state:state(piece),pending:true});batch.pieces.add(piece)}
      dirty.add(batch);
    }
    // Forget candidates that have left the scene.
    for(const object of sightings.keys())if(!object.parent)sightings.delete(object);
    scanning=null;return true;
  }

  function update(dt,defer=false){
    if(!enabled)return;
    for(const [mesh,record] of members){
      if(record.pending){if(!unchanged(mesh,record.state)){members.delete(mesh);record.batch.pieces.delete(mesh)}continue}
      if(mesh.boundingSphere!==hiddenSphere||!mesh.frustumCulled||mesh.layers.mask!==1||!unchanged(mesh,record.state))release(mesh);
    }
    // A batch that lost a moved piece is rebuilt at once, so the piece is never drawn twice.
    if(urgent.size){for(const batch of urgent){dirty.delete(batch);rebuild(batch)}urgent.clear()}
    if(defer)return;
    const until=performance.now()+SLICE_MS;
    if(scanning){if(!stepScan(until))return}
    /* Wall-clock timing: a slow device's clamped frame times would otherwise delay every scan. */else{const now=performance.now();if(now>=nextScan){nextScan=now+scanEvery*1000;
      /* Walking the whole scene every couple of seconds caused regular hitches. Scan only after something
         changes (a room is built or a zone swapped in), a few times so newly placed pieces can settle. */
      const stamp=changeStamp?changeStamp():undefined;if(stamp===undefined||stamp!==lastStamp){lastStamp=stamp;scansLeft=3}if(scansLeft>0){scansLeft--;startScan();if(!stepScan(until))return}}}
    // At least one batch a frame, then more while the slice lasts.
    for(const batch of dirty){dirty.delete(batch);rebuild(batch);if(performance.now()>until)break}
  }
  function setEnabled(on){enabled=on;if(!on){for(const mesh of members.keys())show(mesh);members.clear();for(const batch of batches.values())if(batch.mesh){batch.mesh.parent?.remove(batch.mesh);batch.mesh.geometry.dispose()}batches.clear();sightings.clear();dirty.clear();urgent.clear();scanning=null}}
  return {update,setEnabled,release,get stats(){let meshes=0;for(const batch of batches.values())if(batch.mesh)meshes++;return {batches:meshes,pieces:members.size}}};
};
})();
