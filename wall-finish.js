(()=>{
'use strict';

// Wall finish: real-scale wall textures and contact shadows, at no cost in lights or draw calls.
//
// Texture scale. A BoxGeometry stretches its texture over each face, so a 38 m wall and a 1 m pier used
// to show the same number of stones. Wall pieces are given UVs in metres instead (projected along each
// face), and the material's textures repeat once per tile, so every block is its real size and pieces
// that meet line up.
//
// Contact shadows. A real room darkens where a wall meets the floor, the ceiling or another wall. Each
// vertex carries its distance in metres to those edges: uv1 = (floor, ceiling), uv2 = (left, right) along
// the face. Distances are linear across a flat face, so the fragment shader can shade a band of constant
// width from them with a handful of instructions. An edge with nothing against it gets FAR, i.e. no
// shadow. uv1 and uv2 are attributes the static batcher already merges, so batching is unaffected.
// Reading-room floors use the same attributes for their four edges (the hall floor has its own lightmap).
const FAR=99;

window.createWallFinish=function({THREE}){
  const registered=new WeakSet();   // materials whose boxes are laid out in metres
  const pieces=[];               // every finished wall piece: {mesh,w,h,d,min,max} (world box, unrotated)
  const tmp=new THREE.Vector3();

  function shaderPatch(floor){
    return shader=>{
      shader.vertexShader=shader.vertexShader
        // three.js declares uv1/uv2 itself when the geometry has them (it always does here, but stay safe).
        .replace('#include <common>','#include <common>\n#ifndef USE_UV1\nattribute vec2 uv1;\n#endif\n#ifndef USE_UV2\nattribute vec2 uv2;\n#endif\nvarying vec4 vWallEdge;')
        .replace('#include <begin_vertex>','#include <begin_vertex>\nvWallEdge=vec4(uv1,uv2);');
      // Applied after the lights are summed: fully to ambient light, most of the way to direct light.
      const occlusion=floor
        ?'float wallOcc=1.-.55*(1.-smoothstep(0.,1.,min(min(vWallEdge.x,vWallEdge.y),min(vWallEdge.z,vWallEdge.w))));'
        :'float wallOcc=(1.-.62*(1.-smoothstep(0.,1.1,vWallEdge.x)))*(1.-.4*(1.-smoothstep(0.,.7,vWallEdge.y)))*(1.-.5*(1.-smoothstep(0.,.9,min(vWallEdge.z,vWallEdge.w))));';
      shader.fragmentShader=shader.fragmentShader
        .replace('#include <common>','#include <common>\nvarying vec4 vWallEdge;')
        .replace('#include <aomap_fragment>',`#include <aomap_fragment>\n{${occlusion}\nreflectedLight.indirectDiffuse*=wallOcc;reflectedLight.directDiffuse*=mix(1.,wallOcc,.75);reflectedLight.directSpecular*=wallOcc;reflectedLight.indirectSpecular*=wallOcc;}`);
    };
  }
  function patch(material,floor){
    material.onBeforeCompile=shaderPatch(floor);
    material.customProgramCacheKey=()=>floor?'wall-finish-floor':'wall-finish-wall';
    material.needsUpdate=true;
    return material;
  }

  // A material whose boxes are laid out in metres (its textures then repeat once per tile, see scaleTexture).
  function wallMaterial(material){registered.add(material);return patch(material,false)}
  // A texture showing tile = [width,height] metres of wall.
  function scaleTexture(texture,tile){texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(1/tile[0],1/tile[1]);return texture}

  // Called for every box built with a registered material, once it has its position.
  function finishBox(mesh,w,h,d){
    const geometry=mesh.geometry,pos=geometry.attributes.position,normal=geometry.attributes.normal,count=pos.count;
    const p=mesh.position,uv=geometry.attributes.uv,uv1=new Float32Array(count*2),uv2=new Float32Array(count*2);
    const onFloor=Math.abs(p.y-h/2)<.2;
    for(let i=0;i<count;i++){
      const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),nx=normal.getX(i),ny=normal.getY(i),nz=normal.getZ(i);
      if(Math.abs(ny)>.5){uv.setXY(i,p.x+x,p.z+z);uv1[i*2]=uv1[i*2+1]=FAR;uv2[i*2]=uv2[i*2+1]=FAR;continue}
      // u runs to the viewer's right as they face the wall, v upwards.
      uv.setXY(i,Math.abs(nx)>.5?-nx*(p.z+z):nz*(p.x+x),p.y+y);
      uv1[i*2]=onFloor?y+h/2:FAR;uv1[i*2+1]=FAR;uv2[i*2]=uv2[i*2+1]=FAR;
    }
    uv.needsUpdate=true;
    geometry.setAttribute('uv1',new THREE.BufferAttribute(uv1,2));
    geometry.setAttribute('uv2',new THREE.BufferAttribute(uv2,2));
    pieces.push({mesh,w,h,d,min:new THREE.Vector3(p.x-w/2,p.y-h/2,p.z-d/2),max:new THREE.Vector3(p.x+w/2,p.y+h/2,p.z+d/2)});
  }

  function inside(point,self){for(const piece of pieces)if(piece!==self&&point.x>piece.min.x&&point.x<piece.max.x&&point.y>piece.min.y&&point.y<piece.max.y&&point.z>piece.min.z&&point.z<piece.max.z)return true;return false}
  // Once a group of walls is standing: find the inside corners (another wall piece just in front of a face,
  // at or beyond its end) and switch those edges on; optionally shade the top edge as meeting a ceiling.
  function settle(meshes,{ceiling=false}={}){
    for(let i=pieces.length-1;i>=0;i--)if(!pieces[i].mesh.parent)pieces.splice(i,1);   // rooms freed since
    const wanted=new Set(meshes);
    for(const piece of pieces){
      if(!wanted.has(piece.mesh))continue;
      const {mesh,w,h,d}=piece,geometry=mesh.geometry,pos=geometry.attributes.position,normal=geometry.attributes.normal,uv1=geometry.attributes.uv1,uv2=geometry.attributes.uv2,p=mesh.position;
      const probeY=Math.min(p.y,piece.min.y+1.2);
      const edgeCache=new Map();
      for(let i=0;i<pos.count;i++){
        const nx=normal.getX(i),nz=normal.getZ(i);if(Math.abs(normal.getY(i))>.5)continue;
        // The face's rightward axis and half-width, and this vertex's offset along it.
        const rx=Math.abs(nx)>.5?0:nz,rz=Math.abs(nx)>.5?-nx:0,half=Math.abs(nx)>.5?d/2:w/2,halfN=Math.abs(nx)>.5?w/2:d/2;
        const t=pos.getX(i)*rx+pos.getZ(i)*rz,key=`${nx},${nz}`;
        if(!edgeCache.has(key)){
          const corner=side=>{for(const along of [-.06,.12]){tmp.set(p.x+nx*(halfN+.15)+rx*side*(half+along),probeY,p.z+nz*(halfN+.15)+rz*side*(half+along));if(inside(tmp,piece))return true}return false};
          edgeCache.set(key,[corner(-1),corner(1)]);
        }
        const [left,right]=edgeCache.get(key);
        uv2.setXY(i,left?t+half:FAR,right?half-t:FAR);
        if(ceiling)uv1.setY(i,h/2-pos.getY(i));
      }
      uv1.needsUpdate=uv2.needsUpdate=true;
    }
  }

  // A floor plane (PlaneGeometry, local x across, y along) that meets walls on all four sides.
  function finishFloor(geometry,w,d){
    const pos=geometry.attributes.position,count=pos.count,uv1=new Float32Array(count*2),uv2=new Float32Array(count*2);
    for(let i=0;i<count;i++){const x=pos.getX(i),y=pos.getY(i);uv1[i*2]=x+w/2;uv1[i*2+1]=w/2-x;uv2[i*2]=y+d/2;uv2[i*2+1]=d/2-y}
    geometry.setAttribute('uv1',new THREE.BufferAttribute(uv1,2));
    geometry.setAttribute('uv2',new THREE.BufferAttribute(uv2,2));
    return geometry;
  }
  const floorMaterial=material=>patch(material,true);

  return {wallMaterial,floorMaterial,scaleTexture,finishBox,finishFloor,settle,isWall:material=>registered.has(material),FAR,pieces};
};
})();
