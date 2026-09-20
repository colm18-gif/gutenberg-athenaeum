/* An additive, uncatalogued discovery. No existing rooms or book records are replaced. */
(()=>{
  'use strict';
  window.createVerneDescent=function({THREE,scene,MAT,collider,colliders,interactables,canvasTexture,wrapText,player,camera,book,companionBooks=[],performanceZones,rememberLights,onReturn=()=>{},onFade=()=>{},onBell=()=>{}}){
    const regions=[],segments=[],drops=[],lamps=[],solidMeshes=[];
    const group=new THREE.Group();group.name='uncatalogued-verne-descent';
    let built=false,opened=false,doorAngle=0,nextDrip=0,returnTime=null,returned=false,returnBell=null;
    const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
    const rock=new THREE.MeshStandardMaterial({color:0x363832,roughness:1,flatShading:true});
    const damp=new THREE.MeshStandardMaterial({color:0x24352e,roughness:.23,metalness:.08});
    const glow=new THREE.MeshStandardMaterial({color:0xe3aa62,emissive:0xffa04c,emissiveIntensity:1.5});
    function box(parent,w,h,d,mat,x,y,z,solid=true){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);parent.add(m);if(solid)solidMeshes.push(m);return m}
    function region(a,b,c,d,y,end=y){regions.push({a,b,c,d,y,end})}
    function floorAt(x,z){const r=regions.find(r=>x>=r.a&&x<=r.b&&z>=r.c&&z<=r.d);return r?r.y+(r.end-r.y)*clamp((z-r.c)/(r.d-r.c),0,1):null}
    function contains(x,z){return floorAt(x,z)!==null}
    // A four-metre recess at the unoccupied edge of the east wing's south wall.
    const wing=performanceZones.eastWing.group;
    const wall=wing.children.find(m=>m.isMesh&&m.position.x===28&&m.position.z===10&&m.geometry.parameters.width===18&&m.geometry.parameters.height===8);
    const wallCollider=colliders.find(c=>c.minX===19&&c.maxX===37&&c.minZ===9.75&&c.maxZ===10.25);
    if(!wall||!wallCollider)throw new Error('Verne entrance: expected east-wing wall not found');
    wall.visible=false;wallCollider.inactive=true;
    box(wing,13,8,.5,MAT.stone,25.5,4,10);collider(25.5,10,13,.5);
    box(wing,1,8,.5,MAT.stone,36.5,4,10);collider(36.5,10,1,.5);
    box(wing,4,4.8,.5,MAT.stone,34,5.6,10);collider(34,10,4,.5,'descent lintel',3.2,9);
    const pivot=new THREE.Group();pivot.position.set(36,0,9.72);wing.add(pivot);
    const panel=box(pivot,3.95,3.1,.16,MAT.wood2,-2,1.55,0);
    for(const x of [-3.85,-.15])box(pivot,.065,2.85,.06,MAT.darkWood,x,1.55,-.11);
    box(pivot,3.7,.07,.06,MAT.darkWood,-2,2.9,-.11);for(const y of [.45,2.62])box(pivot,3.55,.16,.08,MAT.brass,-2,y,-.15);for(const x of [-3.62,-.38])for(const y of [.38,1.55,2.72]){const rivet=new THREE.Mesh(new THREE.SphereGeometry(.075,8,6),MAT.brass);rivet.position.set(x,y,-.21);pivot.add(rivet)}const porthole=new THREE.Mesh(new THREE.CylinderGeometry(.46,.46,.08,22),MAT.brass);porthole.position.set(-2,1.75,-.18);porthole.rotation.x=Math.PI/2;pivot.add(porthole);const glass=new THREE.Mesh(new THREE.CircleGeometry(.37,20),new THREE.MeshStandardMaterial({color:0x142f38,emissive:0x102831,emissiveIntensity:.5,roughness:.2}));glass.position.set(-2,1.75,-.225);pivot.add(glass);
    const handle=box(pivot,.09,.25,.08,MAT.brass,-3.7,1.35,-.13,false);
    const doorCollider=collider(34,9.72,4,.2,'uncatalogued panel',-1,3.3);
    panel.userData={type:'verne-descent-panel',title:'A recessed wooden panel',author:'A faint draught stirs the dust at its edge.',action:'OPEN'};
    interactables.push(panel);
    region(32,36,9.4,14,0);
    for(let i=0;i<12;i++){const x=i%2?40:34,z=14+i*18,y=-i*4.8;region(x-2,x+2,z,z+14,y,y-4.8);region(32,42,z+14,z+18,y-4.8)}
    region(32,42,230,238,-57.6);
    function lamp(parent,x,y,z,stage,final=false){
      box(parent,.15,.32,.15,glow,x,y,z,false);box(parent,.25,.05,.25,MAT.brass,x,y-.2,z,false);
      const light=new THREE.PointLight(0xffb367,final?34:Math.max(6,10-stage*.35),final?10:8,1.7);light.position.set(x,y,z);parent.add(light);lamps.push(light);
    }
    function build(){
      if(built)return;built=true;
      const start=new THREE.Group();group.add(start);segments.push({group:start,z:11.5});
      box(start,4,.5,4.6,MAT.stone,34,-.25,11.7);box(start,5,.6,4.6,MAT.stone,34,3.4,11.7);
      for(const x of [31.75,36.25])box(start,.5,3.8,4.6,MAT.wood2,x,1.5,11.7);
      const inscription=canvasTexture((c,w,h)=>{c.fillStyle='#3d3931';c.fillRect(0,0,w,h);c.fillStyle='#a2947a';c.textAlign='center';c.font='italic 26px Georgia';c.fillText('Some books are found only',w/2,59);c.fillText('by going deeper.',w/2,104)},640,150);
      const plaque=new THREE.Mesh(new THREE.PlaneGeometry(2.9,.68),new THREE.MeshStandardMaterial({map:inscription}));plaque.position.set(32.015,1.55,12);plaque.rotation.y=Math.PI/2;start.add(plaque);
      lamp(start,35.6,2,12,0);
      for(let i=0;i<12;i++){
        const parent=new THREE.Group();group.add(parent);
        const x=i%2?40:34,z=14+i*18,y=-i*4.8,mat=i<3?MAT.stone:rock;
        segments.push({group:parent,z:z+9});
        // Visual treads and a continuous walking envelope share exactly the same endpoints.
        for(let s=0;s<28;s++){
          const sy=y-(s+1)*4.8/28,sz=z+(s+.5)*.5;
          box(parent,4,.55,.51,mat,x,sy-.275,sz);
          box(parent,5,.6,.51,mat,x,sy+3.4,sz);
          for(const side of [-1,1]){
            box(parent,.5,3.8,.51,mat,x+side*2.25,sy+1.5,sz);
            if(i>2&&s%3===0){const r=new THREE.Mesh(new THREE.DodecahedronGeometry(.4+i*.025,0),mat);r.position.set(x+side*2.35,sy+1.6,sz);r.scale.set(.6,1.6,1.4);parent.add(r)}
            if(i<2&&s%4===0)box(parent,.12,.14,2,MAT.darkWood,x+side*2.03,sy+2.6,sz,false);
          }
        }
        const ly=y-4.8,lz=z+16;
        box(parent,10,.5,4,mat,37,ly-.25,lz);box(parent,10,.6,4,mat,37,ly+3.4,lz);
        for(const sx of [31.75,42.25])box(parent,.5,3.8,4,mat,sx,ly+1.5,lz);
        // Every return is walled off except its two offset openings. No view into other rooms.
        for(const edge of [0,1]){const ox=edge?(i===11?37:(i%2?34:40)):x,ez=z+14+edge*4;
          for(const [a,b] of [[32,ox-2],[ox+2,42]])if(b>a)box(parent,b-a,3.8,.4,mat,(a+b)/2,ly+1.5,ez);
        }
        lamp(parent,x-1.7,y+1.8,z+1,i);lamp(parent,37,ly+2.3,lz,i+2);
        // Lower rock-cut flights need intermediate lanterns, not just lights at their ends.
        // Keep fixtures outside the walking envelope and register lights for distance culling.
        if(i>=6){
          lamp(parent,x+1.7,y+1.8-5*4.8/14,z+5,i);
          lamp(parent,x-1.7,y+1.8-10*4.8/14,z+10,i);
        }
        const px=41.4;
        if(i%3===0){const plank=box(parent,.45,.13,2,MAT.darkWood,px,ly+.2,lz,false);plank.rotation.x=.3;box(parent,.45,.8,.3,MAT.wood2,px,ly+.4,lz-.8,false);box(parent,.7,.12,.8,MAT.wood,px-.3,ly+.07,lz+.4,false)}
        if(i%3===1){box(parent,.8,.65,.9,MAT.wood2,px-.1,ly+.325,lz,false);for(let j=0;j<3;j++){const sample=new THREE.Mesh(new THREE.IcosahedronGeometry(.17+j*.025,0),j%2?MAT.brass:damp);sample.position.set(px-.2,ly+.78,lz-.3+j*.3);parent.add(sample)}}
        if(i%3===2){box(parent,.8,.4,.7,MAT.green,px-.1,ly+.2,lz,false);const pick=box(parent,.08,.08,1.4,MAT.wood,px-.2,ly+.5,lz,false);pick.rotation.y=.5;box(parent,.6,.08,.12,MAT.brass,px-.45,ly+.5,lz-.5,false)}
        collider(px-.1,lz,1,1.8,'expedition remnants',ly-.5,ly+1.5);
        if(i>1){const p=new THREE.Mesh(new THREE.CircleGeometry(.62,16),damp);p.position.set(x+1.2,ly+.015,lz);p.rotation.x=-Math.PI/2;parent.add(p);const drop=new THREE.Mesh(new THREE.SphereGeometry(.035,5,4),damp);drop.position.set(x+1.4,ly+2,lz);parent.add(drop);drops.push({mesh:drop,y:ly,phase:i*.73});
          for(let j=0;j<3;j++){const tooth=new THREE.Mesh(new THREE.ConeGeometry(.12,.65+j*.2,5),rock);tooth.position.set(x+1.6,ly+2.95,lz-.8+j*.8);tooth.rotation.z=Math.PI;parent.add(tooth)}
        }
      }
      const chamber=new THREE.Group();group.add(chamber);segments.push({group:chamber,z:234});
      const y=-57.6;box(chamber,10,.5,8,rock,37,y-.25,234);box(chamber,10,.6,8,rock,37,y+3.4,234);
      for(const x of [31.75,42.25])box(chamber,.5,3.8,8,rock,x,y+1.5,234);box(chamber,10,3.8,.5,rock,37,y+1.5,238.25);
      box(chamber,2.4,.2,1.5,MAT.darkWood,37,y+1.05,235);box(chamber,.6,1,.6,MAT.wood2,37,y+.5,235);collider(37,235,2.4,1.5,'Verne lectern',y-.5,y+2);
      lamp(chamber,37,y+2.4,235,0,true);
      // A desk bell, not a menu exit: the expedition's quiet way back to the shelves.
      box(chamber,.5,.06,.5,MAT.darkWood,37.9,y+1.18,235,false);
      returnBell=new THREE.Mesh(new THREE.CylinderGeometry(.16,.24,.23,16),MAT.brass);returnBell.position.set(37.9,y+1.325,235);chamber.add(returnBell);
      const button=new THREE.Mesh(new THREE.SphereGeometry(.055,8,6),MAT.brass);button.position.set(0,.15,0);returnBell.add(button);
      returnBell.userData={type:'verne-return-bell',title:'A small brass bell',author:'For those who have gone far enough. Its note belongs upstairs.',action:'RING · RETURN TO LIBRARY'};interactables.push(returnBell);
      const cover=canvasTexture((c,w,h)=>{c.fillStyle='#333b2d';c.fillRect(0,0,w,h);c.strokeStyle='#c0a276';c.lineWidth=4;c.strokeRect(24,24,w-48,h-48);c.fillStyle='#c0a276';c.textAlign='center';c.font='18px Georgia';c.fillText('FIELD LIBRARY · ICELAND',w/2,68);c.font='bold 33px Georgia';wrapText(c,'Journey to the Centre of the Earth',w/2,132,w-65,42);for(let i=0;i<6;i++){c.beginPath();c.moveTo(45,310+i*20);c.lineTo(130,290+i*19);c.lineTo(215,320+i*18);c.lineTo(w-45,302+i*20);c.stroke()}c.beginPath();c.arc(w/2,402,35,0,7);c.moveTo(w/2,356);c.lineTo(w/2,448);c.stroke();c.font='italic 25px Georgia';c.fillText('Jules Verne',w/2,494);c.font='15px Georgia';c.fillText('EXPEDITION COPY · 1864',w/2,530)});
      const volume=box(chamber,1.25,1.65,.22,new THREE.MeshStandardMaterial({map:cover,roughness:.92}),37,y+1.22,235,false);volume.rotation.x=-Math.PI/2;
      // Keep the reader's single-material contract; side UVs sample plain cloth, not stretched titles.
      const uv=volume.geometry.attributes?.uv;if(uv){for(let face=0;face<6;face++)if(face!==4)for(let v=0;v<4;v++)uv.setXY(face*4+v,.005,.005);uv.needsUpdate=true}
      volume.userData={type:'book',book,loaded:true,realCover:true,expeditionCopy:true,home:{parent:chamber,position:volume.position.clone(),quaternion:volume.quaternion.clone()}};interactables.push(volume);
      // A quiet side collection: no obstruction to the arrival route or return bell.
      if(companionBooks.length){
        box(chamber,1.8,.18,5.4,MAT.darkWood,33.2,y+1.05,234.4);
        for(const z of [232.2,236.6])box(chamber,1.3,1,.2,MAT.wood2,33.2,y+.5,z);
        collider(33.2,234.4,1.8,5.4,'Subterranean field library',y-.5,y+2);
        lamp(chamber,33.2,y+2.4,234.4,0,true);
        companionBooks.slice(0,3).forEach((entry,i)=>{
          const cover=canvasTexture((c,w,h)=>{
            c.fillStyle=entry.fieldColour;c.fillRect(0,0,w,h);c.strokeStyle='#c0a276';c.lineWidth=4;c.strokeRect(24,24,w-48,h-48);
            c.fillStyle='#c0a276';c.textAlign='center';c.font='18px Georgia';c.fillText('FIELD LIBRARY · BELOW GROUND',w/2,68);
            c.font='bold 32px Georgia';wrapText(c,entry.title,w/2,130,w-70,42);
            for(let layer=0;layer<7;layer++){c.beginPath();c.moveTo(45,300+layer*22);c.lineTo(w*.35,315+layer*20);c.lineTo(w*.65,290+layer*23);c.lineTo(w-45,310+layer*21);c.stroke()}
            c.font='italic 23px Georgia';wrapText(c,entry.author,w/2,485,w-70,28);c.font='15px Georgia';c.fillText('SUBTERRANEAN COLLECTION',w/2,550);
          });
          const copy=box(chamber,1.25,1.65,.22,new THREE.MeshStandardMaterial({map:cover,roughness:.92}),33.2,y+1.25,232.6+i*1.8,false);copy.rotation.x=-Math.PI/2;
          const uv=copy.geometry.attributes?.uv;if(uv){for(let face=0;face<6;face++)if(face!==4)for(let v=0;v<4;v++)uv.setXY(face*4+v,.005,.005);uv.needsUpdate=true}
          copy.userData={type:'book',book:entry,loaded:true,realCover:true,subterraneanCopy:true,home:{parent:chamber,position:copy.position.clone(),quaternion:copy.quaternion.clone()}};interactables.push(copy);
        });
      }
      rememberLights(group);scene.add(group);
      performanceZones.verneDescent={group,isNeeded:()=>opened&&player.pos.x>29&&player.pos.x<45&&player.pos.z>5,active:true};
    }
    function interact(object){
      if(object===returnBell&&returnBell){if(returnTime===null){returnTime=0;returned=false;onBell()}return true}
      if(object!==panel)return false;build();opened=!opened;doorCollider.inactive=opened;panel.userData.action=opened?'CLOSE':'OPEN';return true
    }
    function clearLine(ray,target,distance){const blockers=solidMeshes.filter(m=>{let p=m;while(p){if(!p.visible)return false;p=p.parent}return true});const first=ray.intersectObjects(blockers,false)[0];return !first||first.object===target||first.distance>=distance-.04}
    function update(t,dt,reduced,sound){
      if(returnTime!==null){
        returnTime+=dt;
        const out=reduced?.12:.45,hold=.1,back=reduced?.12:.5;
        onFade(returnTime<out?returnTime/out:clamp(1-(returnTime-out-hold)/back,0,1));
        if(!returned&&returnTime>=out){returned=true;onReturn()}
        if(returnTime>=out+hold+back){returnTime=null;onFade(0)}
      }
      doorAngle=THREE.MathUtils.damp(doorAngle,opened?-Math.PI*.49:0,6,dt);pivot.rotation.y=doorAngle;
      const below=contains(player.pos.x,player.pos.z),depth=below?clamp(-player.pos.y/14,0,1):0;
      if(built){for(const s of segments)s.group.visible=below?Math.abs(player.pos.z-s.z)<30:opened&&s.z<30;
        for(const d of drops)d.mesh.position.y=d.y+2.7-(reduced?1.1:(t*.8+d.phase)%2.7);
        if(depth>.2&&t>nextDrip){nextDrip=t+2+Math.random()*5;if(!reduced)sound(700+Math.random()*450,.13,'sine',.035*depth)}
      }
      return depth;
    }
    return {floorAt,contains,build,interact,update,clearLine,group,panel,regions,get built(){return built},get returning(){return returnTime!==null}};
  };
})();
