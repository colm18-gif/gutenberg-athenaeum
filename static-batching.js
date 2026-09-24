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
window.createStaticBatcher=function({THREE,scene,exclusions=()=>[],cell=14,scanEvery=2}){
  const MERGEABLE=new Set(['MeshStandardMaterial','MeshPhysicalMaterial','MeshBasicMaterial','MeshLambertMaterial','MeshPhongMaterial']);
  const ALLOWED_ATTRIBUTES=new Set(['position','normal','uv','uv1','uv2','color']);
  const defaultBeforeRender=THREE.Object3D.prototype.onBeforeRender;
  const members=new Map();        // hidden original -> {batch,state}
  const sightings=new Map();      // candidate -> state when first seen unchanged
  const released=new WeakSet();   // pieces that moved after batching: never batched again
  const batches=new Map();        // key -> batch
  const dirty=new Set();
  let nextScan=performance.now()+500,enabled=true;
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

  function release(mesh){const record=members.get(mesh);if(!record)return;members.delete(mesh);show(mesh);released.add(mesh);record.batch.pieces.delete(mesh);dirty.add(record.batch)}
  function rebuild(batch){
    if(batch.mesh){batch.mesh.parent?.remove(batch.mesh);batch.mesh.geometry.dispose();batch.mesh=null}
    const pieces=[...batch.pieces].filter(piece=>piece.parent===batch.parent);
    if(pieces.length<2||!batch.parent.parent&&batch.parent!==scene){for(const piece of pieces){if(members.delete(piece))show(piece)}batch.pieces.clear();batches.delete(batch.key);return}
    const first=pieces[0],mesh=new THREE.Mesh(mergeGeometry(pieces),batch.material);
    mesh.name='static-batch';mesh.castShadow=first.castShadow;mesh.receiveShadow=first.receiveShadow;mesh.matrixAutoUpdate=false;mesh.updateMatrix();
    batch.parent.add(mesh);batch.mesh=mesh;
  }

  function scan(){
    const excluded=new Set(exclusions()),now=performance.now(),ready=new Map();
    scene.traverse(object=>{
      if(members.has(object)||!eligible(object,excluded))return;
      const current=state(object),seen=sightings.get(object);
      if(!seen||!sameState(seen.state,current)){sightings.set(object,{state:current,at:now});return}
      if(now-seen.at<scanEvery*900)return;
      const key=keyFor(object);if(!ready.has(key))ready.set(key,[]);ready.get(key).push(object);
    });
    for(const [key,pieces] of ready){
      let batch=batches.get(key);
      if(!batch&&pieces.length<2)continue;
      if(!batch){batch={key,parent:pieces[0].parent,material:pieces[0].material,pieces:new Set(),mesh:null};batches.set(key,batch)}
      for(const piece of pieces){sightings.delete(piece);members.set(piece,{batch,state:state(piece)});batch.pieces.add(piece);hide(piece)}
      dirty.add(batch);
    }
    // Forget candidates that have left the scene.
    for(const object of sightings.keys())if(!object.parent)sightings.delete(object);
  }

  function update(dt){
    if(!enabled)return;
    for(const [mesh,record] of members)if(mesh.boundingSphere!==hiddenSphere||!mesh.frustumCulled||mesh.layers.mask!==1||!unchanged(mesh,record.state))release(mesh);
    /* Wall-clock timing: a slow device's clamped frame times would otherwise delay every scan. */const now=performance.now();if(now>=nextScan){nextScan=now+scanEvery*1000;scan()}
    if(dirty.size){for(const batch of dirty)rebuild(batch);dirty.clear()}
  }
  function setEnabled(on){enabled=on;if(!on){for(const mesh of members.keys())show(mesh);members.clear();for(const batch of batches.values())if(batch.mesh){batch.mesh.parent?.remove(batch.mesh);batch.mesh.geometry.dispose()}batches.clear();sightings.clear()}}
  return {update,setEnabled,release,get stats(){let meshes=0;for(const batch of batches.values())if(batch.mesh)meshes++;return {batches:meshes,pieces:members.size}}};
};
})();
