(function(){
  'use strict';

  window.createAfterDarkExpansion=function(options){
    const {THREE,scene,MAT,player,camera,interactables,books,bookMaterial,canvasTexture,showNotice,playSample,sound,move,modelTemplate,isLowBandwidth,analytics}=options;
    const KEEP_WARM_SECONDS=20,PRELOAD_DISTANCE=8;
    const rooms={
      sorting:{key:'sorting',cx:-180,cz:-24,w:28,d:23,entrance:{x:-36.72,z:5.2,yaw:Math.PI/2},title:'The Sorting Room'},
      departures:{key:'departures',cx:-180,cz:28,w:32,d:26,entrance:{x:36.72,z:5.2,yaw:-Math.PI/2},title:'Cabinet of Travel & Expeditions'}
    };
    const roomStates=new Map(),blockers=[],animated=[],sharedGeometries={book:new THREE.BoxGeometry(.82,1.08,.14)};let currentTime=0;
    const emissiveAmber=new THREE.MeshStandardMaterial({color:0xe2b46b,emissive:0xb76d27,emissiveIntensity:2.1,roughness:.8});
    const twine=new THREE.MeshStandardMaterial({color:0x8d7550,roughness:1});
    const iron=new THREE.MeshStandardMaterial({color:0x17191a,metalness:.56,roughness:.55});

    const add=(geometry,material,x,y,z,parent)=>{const object=new THREE.Mesh(geometry,material);object.position.set(x,y,z);object.castShadow=false;object.receiveShadow=false;parent.add(object);return object};
    const box=(w,h,d,material,x,y,z,parent)=>add(new THREE.BoxGeometry(w,h,d),material,x,y,z,parent);
    const cylinder=(rt,rb,h,segments,material,x,y,z,parent)=>add(new THREE.CylinderGeometry(rt,rb,h,segments),material,x,y,z,parent);
    const mark=(object,data)=>{object.userData=data;interactables.push(object);return object};
    const block=(key,x,z,w,d)=>blockers.push({key,minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2});
    const textureMaterial=(path,color=0xffffff)=>new THREE.MeshStandardMaterial({color,roughness:.9,map:new THREE.TextureLoader().load(path,texture=>{texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(3,2)})});
    const oldStone=textureMaterial('assets/polyhaven/materials/old_stone_wall/diffuse.jpg',0x69645b);
    const bluePlaster=textureMaterial('assets/polyhaven/materials/blue_plaster_weathered/diffuse.jpg',0x617a7b);

    function paperTexture(title,subtitle='',width=760,height=170){
      return canvasTexture((ctx,w,h)=>{ctx.fillStyle='#d6c7a2';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#775c34';ctx.lineWidth=7;ctx.strokeRect(8,8,w-16,h-16);ctx.fillStyle='#34271b';ctx.textAlign='center';ctx.font='bold 38px Georgia';ctx.fillText(title,w/2,h*.44);if(subtitle){ctx.font='italic 24px Georgia';ctx.fillText(subtitle,w/2,h*.72)}},width,height);
    }

    function sign(parent,x,y,z,title,subtitle='',rotation=0,scale=1){
      const texture=paperTexture(title,subtitle),panel=add(new THREE.PlaneGeometry(3.2*scale,.72*scale),new THREE.MeshStandardMaterial({map:texture,roughness:.88}),x,y,z,parent);panel.rotation.y=rotation;return panel;
    }

    function addModel(parent,url,x,y,z,{height=2,rotation=0,fallback=[]}={}){
      if(isLowBandwidth())return;
      modelTemplate(url).then(template=>{
        const model=template.clone(true),initial=new THREE.Box3().setFromObject(model),size=initial.getSize(new THREE.Vector3()),scale=height/Math.max(size.y,.001);
        model.scale.setScalar(scale);model.rotation.y=rotation;model.updateMatrixWorld(true);
        const fitted=new THREE.Box3().setFromObject(model),center=fitted.getCenter(new THREE.Vector3());
        model.position.set(x-center.x,y-fitted.min.y,z-center.z);model.traverse(node=>{if(node.isMesh){node.castShadow=false;node.receiveShadow=false}});
        fallback.forEach(part=>part.visible=false);parent.add(model);
      }).catch(()=>{});
    }

    function roomShell(room,material){
      const root=room.root;
      box(room.w,.36,room.d,MAT.wood,room.cx,-.18,room.cz,root);
      box(room.w,6,.42,material,room.cx,3,room.cz-room.d/2,root);
      box(.42,6,room.d,material,room.cx-room.w/2,3,room.cz,root);
      box(.42,6,room.d,material,room.cx+room.w/2,3,room.cz,root);
      box((room.w-3)/2,6,.42,material,room.cx-(room.w+3)/4,3,room.cz+room.d/2,root);
      box((room.w-3)/2,6,.42,material,room.cx+(room.w+3)/4,3,room.cz+room.d/2,root);
      box(3,.9,.42,material,room.cx,5.55,room.cz+room.d/2,root);
      box(room.w,.28,room.d,new THREE.MeshStandardMaterial({color:0x25231f,roughness:.96}),room.cx,6.05,room.cz,root);
      const exitData={type:'after-dark-exit',room:room.key,title:'Return to the Grand Hall',author:'The warm light beneath the door remembers the way back.',action:'RETURN'};
      const exit=mark(box(2.55,4.25,.22,MAT.darkWood,room.cx,2.13,room.cz+room.d/2-.22,root),exitData);
      const lintel=mark(box(3,.18,.3,MAT.brass,room.cx,4.27,room.cz+room.d/2-.3,root),exitData);
      for(const x of [-1.43,1.43])box(.18,4.55,.3,MAT.brass,room.cx+x,2.28,room.cz+room.d/2-.3,root);
      return {exit,lintel};
    }

    function entrance(room,label,description){
      const group=new THREE.Group();group.position.set(room.entrance.x,0,room.entrance.z);group.rotation.y=room.entrance.yaw;scene.add(group);
      const data={type:'after-dark-entrance',room:room.key,title:label,author:description,action:'ENTER'};
      mark(box(2.45,4.15,.2,MAT.darkWood,0,2.08,0,group),data);
      for(const x of [-1.35,1.35])box(.17,4.5,.28,MAT.brass,x,2.25,.01,group);
      box(2.85,.18,.28,MAT.brass,0,4.42,.01,group);
      const plaque=mark(sign(group,0,3.2,.13,label,'',0,.72),data);plaque.material.emissive=new THREE.Color(0x3a210d);plaque.material.emissiveIntensity=.35;
      room.entranceGroup=group;
    }

    function utilityShelf(room,x,z,rotation=0){
      const root=room.root,g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotation;root.add(g),parts=[];
      for(const y of [.3,1.35,2.4,3.45])parts.push(box(4.2,.14,.72,MAT.darkWood,0,y,0,g));
      for(const px of [-1.95,1.95])parts.push(box(.18,3.8,.72,MAT.wood2,px,1.9,0,g));
      addModel(g,'assets/polyhaven/models/Shelf_01/Shelf_01_1k.gltf',0,0,0,{height:3.85,rotation:Math.PI,fallback:parts});
      const width=Math.abs(Math.cos(rotation))*4.5+Math.abs(Math.sin(rotation))*.95,depth=Math.abs(Math.sin(rotation))*4.5+Math.abs(Math.cos(rotation))*.95;block(room.key,x,z,width,depth);
    }

    function crate(room,x,z,label,asset,rotation=0){
      const root=room.root,g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotation;root.add(g);
      const fallback=[box(2.2,1.25,1.45,MAT.wood,0,.63,0,g)];for(const px of [-.9,.9])fallback.push(box(.12,1.3,1.5,MAT.darkWood,px,.65,0,g));
      const data={type:'after-dark-detail',title:label,author:'The handwriting changes halfway through the label.',action:'READ'};fallback.forEach(part=>mark(part,data));
      const tag=sign(g,0,.72,.735,label,'',0,.45);tag.userData=data;interactables.push(tag);
      addModel(g,`assets/polyhaven/models/${asset}/${asset}_1k.gltf`,0,0,0,{height:1.3,rotation:Math.PI,fallback});block(room.key,x,z,2.5,1.75);return g;
    }

    function placeBook(room,book,x,y,z,rotation=0,tilt=-.35){
      if(!book)return null;const mesh=add(sharedGeometries.book,bookMaterial(book),x,y,z,room.root);mesh.rotation.order='YXZ';mesh.rotation.y=rotation;mesh.rotation.x=tilt;mesh.rotation.z=Math.sin(book.id)*.07;mesh.userData={type:'book',book,loaded:false,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:room.root}};interactables.push(mesh);return mesh;
    }

    function slip(room,x,z,text,rotation=0){
      const texture=paperTexture(text,'',500,110),paper=add(new THREE.PlaneGeometry(1.45,.42),new THREE.MeshStandardMaterial({map:texture,roughness:1,side:THREE.DoubleSide}),x,1.38,z,room.root);paper.rotation.set(-Math.PI/2,0,rotation);mark(paper,{type:'after-dark-detail',title:text,author:'A sorting hand added no date and no initials.',action:'READ'});
    }

    function buildSorting(room){
      roomShell(room,oldStone);sign(room.root,room.cx,4.65,room.cz-room.d/2+.23,'THE SORTING ROOM','Staff may disagree with the catalogue',0,1.05);
      utilityShelf(room,room.cx-9.5,room.cz-7,0);utilityShelf(room,room.cx-4.7,room.cz-7,0);utilityShelf(room,room.cx+9.6,room.cz-4.8,-Math.PI/2);
      crate(room,room.cx-8.8,room.cz+5.8,'RETURNED WITHOUT EXPLANATION','CheeseBox_01',.08);
      crate(room,room.cx+7.6,room.cz+5.6,'SHELF UNKNOWN','wooden_crate_01',-.11);
      crate(room,room.cx+8.8,room.cz-.8,'DO NOT RE-SHELVE','wooden_crate_02',.06);
      const deskX=room.cx+4.2,deskZ=room.cz-6.3;box(4.4,.22,2.1,MAT.darkWood,deskX,1.35,deskZ,room.root);for(const dx of [-1.8,1.8])for(const dz of [-.75,.75])box(.2,1.3,.2,MAT.wood2,deskX+dx,.65,deskZ+dz,room.root);block(room.key,deskX,deskZ,4.7,2.4);
      cylinder(.3,.52,.48,12,MAT.brass,deskX-1.45,1.63,deskZ,room.root);cylinder(.24,.5,.55,12,emissiveAmber,deskX-1.45,2.08,deskZ,room.root);const lamp=new THREE.PointLight(0xffbd72,7,8,2);lamp.position.set(deskX-1.45,2.6,deskZ);lamp.castShadow=false;room.root.add(lamp);
      const trolleyX=room.cx-1.8,trolleyZ=room.cz+1.3;box(3.6,.18,1.1,MAT.darkWood,trolleyX,1.2,trolleyZ,room.root);box(3.6,.18,1.1,MAT.darkWood,trolleyX,.35,trolleyZ,room.root);for(const dx of [-1.65,1.65])box(.15,1.2,.9,iron,trolleyX+dx,.72,trolleyZ,room.root);for(const dx of [-1.65,1.65])for(const dz of [-.35,.35]){const wheel=cylinder(.18,.18,.1,12,iron,trolleyX+dx,.13,trolleyZ+dz,room.root);wheel.rotation.x=Math.PI/2}block(room.key,trolleyX,trolleyZ,4,1.45);
      const ladderFallback=[box(.22,4.6,.18,MAT.wood,room.cx+11.2,2.3,room.cz-7.4,room.root),box(.22,4.6,.18,MAT.wood,room.cx+9.9,2.3,room.cz-7.4,room.root)];for(let i=0;i<8;i++)ladderFallback.push(box(1.35,.11,.18,MAT.wood,room.cx+10.55,.45+i*.52,room.cz-7.4,room.root));addModel(room.root,'assets/polyhaven/models/wooden_ladder_02/wooden_ladder_02_1k.gltf',room.cx+10.55,0,room.cz-7.4,{height:4.6,rotation:.04,fallback:ladderFallback});
      const truckFallback=[box(.12,2.4,1.1,iron,room.cx-10.8,1.2,room.cz+1.5,room.root),box(1.15,.12,1.1,iron,room.cx-10.25,.18,room.cz+1.5,room.root)];addModel(room.root,'assets/polyhaven/models/hand_truck/hand_truck_1k.gltf',room.cx-10.5,0,room.cz+1.5,{height:2.5,rotation:Math.PI/2,fallback:truckFallback});block(room.key,room.cx-10.4,room.cz+1.5,1.7,1.8);
      const stringLine=add(new THREE.TorusGeometry(.65,.025,6,28),twine,room.cx+1.3,.04,room.cz+6.8,room.root);stringLine.rotation.x=Math.PI/2;
      const roomBooks=books.filter(book=>book.room==='sorting');const spots=[[-7,1.52,-6.2,.15],[-4.8,1.32,1.1,-.8],[-1.4,1.42,1.3,.15],[1.7,.72,5.9,-.35],[4.1,1.58,-6.1,.4],[7.4,1.48,5.5,-.25],[9.2,.82,-.6,.8],[-8.5,.74,5.6,-.4],[3.2,.67,3.5,.22]];roomBooks.forEach((book,index)=>{const p=spots[index%spots.length];placeBook(room,book,room.cx+p[0],p[1],room.cz+p[2],p[3],index%3===0?-.48:-.28)});
      slip(room,room.cx-3.5,room.cz+4.2,'Found in the rain',.12);slip(room,room.cx+4.3,room.cz-5.8,'Reader never returned',-.08);slip(room,room.cx+7.4,room.cz+5.2,'Catalogue disagrees',.04);
      for(let i=0;i<55;i++){const mote=add(new THREE.SphereGeometry(.014,4,3),new THREE.MeshBasicMaterial({color:0xc9b78d,transparent:true,opacity:.3}),room.cx-room.w/2+1+Math.random()*(room.w-2),.4+Math.random()*4.8,room.cz-room.d/2+1+Math.random()*(room.d-2),room.root);animated.push({kind:'dust',mesh:mote,room,phase:Math.random()*9})}
    }

    function mapTable(room,x,z){
      box(5.4,.22,2.8,MAT.darkWood,x,1.28,z,room.root);for(const dx of [-2.25,2.25])for(const dz of [-1.05,1.05])box(.2,1.22,.2,MAT.wood2,x+dx,.61,z+dz,room.root);block(room.key,x,z,5.7,3.1);
      const map=add(new THREE.PlaneGeometry(3.8,1.75),new THREE.MeshStandardMaterial({map:paperTexture('SOUNDINGS & ROUTES','notations continue beyond the paper',900,420),roughness:1,side:THREE.DoubleSide}),x,1.41,z,room.root);map.rotation.x=-Math.PI/2;
      for(const dx of [-1.65,1.65]){const roll=cylinder(.09,.09,1.9,10,MAT.paper,x+dx,1.49,z,room.root);roll.rotation.x=Math.PI/2}
    }

    function travelShelf(room,x,z,rotation=0){
      const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotation;room.root.add(g);for(const y of [.25,1.42,2.58,3.74])box(5.5,.15,.64,MAT.darkWood,0,y,0,g);for(const px of [-2.6,2.6])box(.2,4.1,.65,MAT.wood2,px,2,0,g);const width=Math.abs(Math.cos(rotation))*5.8+Math.abs(Math.sin(rotation))*.9,depth=Math.abs(Math.sin(rotation))*5.8+Math.abs(Math.cos(rotation))*.9;block(room.key,x,z,width,depth);
    }

    function buildDepartures(room){
      roomShell(room,bluePlaster);sign(room.root,room.cx,4.72,room.cz-room.d/2+.23,'DEPARTURES','Voyages, expeditions & disputed horizons',0,1.2);
      for(const x of [room.cx-10,room.cx-3.4,room.cx+3.4,room.cx+10])travelShelf(room,x,room.cz-room.d/2+.65,0);
      travelShelf(room,room.cx-room.w/2+.65,room.cz-3.2,Math.PI/2);travelShelf(room,room.cx+room.w/2-.65,room.cz-3.2,-Math.PI/2);
      mapTable(room,room.cx-4.2,room.cz+2.2);mapTable(room,room.cx+4.2,room.cz+2.2);
      const windowMat=new THREE.MeshStandardMaterial({color:0x172934,emissive:0x142f3e,emissiveIntensity:.5,roughness:.2});for(const x of [room.cx-7,room.cx,room.cx+7]){box(4.2,4.2,.08,windowMat,x,3.15,room.cz+room.d/2-.25,room.root);for(const dx of [-2.05,0,2.05])box(.08,4.35,.1,MAT.brass,x+dx,3.15,room.cz+room.d/2-.31,room.root);box(4.25,.08,.1,MAT.brass,x,3.15,room.cz+room.d/2-.31,room.root)}
      const lantern=cylinder(.38,.48,.72,12,MAT.brass,room.cx,2.05,room.cz-1.8,room.root);cylinder(.28,.34,.65,12,emissiveAmber,room.cx,2.08,room.cz-1.8,room.root);const lanternLight=new THREE.PointLight(0xffba69,8,11,2);lanternLight.position.set(room.cx,2.65,room.cz-1.8);lanternLight.castShadow=false;room.root.add(lanternLight);
      const compassFallback=[cylinder(.85,.85,.12,28,MAT.brass,room.cx-4.2,1.52,room.cz+2.2,room.root)];addModel(room.root,'assets/polyhaven/models/seadogs_compass/seadogs_compass_1k.gltf',room.cx-4.2,1.43,room.cz+2.2,{height:.55,rotation:.16,fallback:compassFallback});
      const suitcaseA=[box(1.7,.75,1.1,MAT.wood,room.cx-10.8,.38,room.cz+8.4,room.root)],suitcaseB=[box(1.55,.68,1,MAT.wood2,room.cx-9.2,.34,room.cz+8.7,room.root)];addModel(room.root,'assets/polyhaven/models/vintage_suitcase/vintage_suitcase_1k.gltf',room.cx-10.8,0,room.cz+8.4,{height:.78,rotation:.2,fallback:suitcaseA});addModel(room.root,'assets/polyhaven/models/vintage_suitcase/vintage_suitcase_1k.gltf',room.cx-9.2,0,room.cz+8.7,{height:.68,rotation:-.22,fallback:suitcaseB});block(room.key,room.cx-10,room.cz+8.5,3.2,1.6);
      const roomBooks=books.filter(book=>book.room==='departures');roomBooks.forEach((book,index)=>{const side=index<6?-1:1,i=index%6,x=room.cx+side*(4.2+(i%3-1)*1.05),z=room.cz+2.2+(Math.floor(i/3)-.5)*.72;placeBook(room,book,x,1.52+.04*(i%2),z,(i%3-1)*.22,-.48)});
      for(let i=0;i<90;i++){const drop=box(.014,.34,.014,new THREE.MeshBasicMaterial({color:0x8bb0c2,transparent:true,opacity:.36}),room.cx-11+Math.random()*22,.5+Math.random()*4.8,room.cz+room.d/2-.45-Math.random()*.25,room.root);animated.push({kind:'rain',mesh:drop,room,phase:Math.random()*5})}
      for(const p of [[room.cx+10.5,room.cz+7.7,.1],[room.cx+8.9,room.cz+8.8,-.15],[room.cx+11.2,room.cz+9,.08]]){const chart=cylinder(.1,.1,2.1,10,MAT.paper,p[0],.48,p[1],room.root);chart.rotation.z=Math.PI/2+p[2]}
    }

    function build(room){
      if(room.built)return;room.built=true;room.root=new THREE.Group();room.root.name=`deferred-after-dark-${room.key}`;
      if(room.key==='sorting')buildSorting(room);else buildDepartures(room);scene.add(room.root);room.active=true;room.lastNeeded=currentTime;
    }

    function activate(room){build(room);if(!room.active){scene.add(room.root);room.active=true}room.lastNeeded=currentTime}
    function unload(room){if(!room.active)return;room.root.removeFromParent();room.active=false}
    function zoneAt(x,z){return Object.values(rooms).find(room=>x>room.cx-room.w/2&&x<room.cx+room.w/2&&z>room.cz-room.d/2&&z<room.cz+room.d/2)||null}
    function contains(x,z){return !!zoneAt(x,z)}
    function floorAt(x,z){return contains(x,z)?0:null}
    function allowed(x,z){const room=zoneAt(x,z);if(!room)return false;const radius=player.radius||.42;if(x-radius<=room.cx-room.w/2+.45||x+radius>=room.cx+room.w/2-.45||z-radius<=room.cz-room.d/2+.45||z+radius>=room.cz+room.d/2-.45)return false;return !blockers.some(item=>item.key===room.key&&x+radius>item.minX&&x-radius<item.maxX&&z+radius>item.minZ&&z-radius<item.maxZ)}

    function interact(object){
      const data=object?.userData;if(data?.type==='after-dark-entrance'){
        const room=rooms[data.room];activate(room);move(room.cx,room.cz+room.d/2-3,Math.PI);showNotice(data.room==='sorting'?'The staff door closes on a room of rain-marked returns, string, dust, and unresolved shelving.':'Rain combs the tall windows. Every chart on the tables appears to begin here and end elsewhere.',7);playSample?.('doorOpen',.86,.96);analytics?.track('Room Explored',{room:data.room});return true
      }
      if(data?.type==='after-dark-exit'){
        const room=rooms[data.room];room.lastNeeded=currentTime;move(room.entrance.x+(data.room==='sorting'?1.8:-1.8),room.entrance.z,room.entrance.yaw+Math.PI);showNotice('The Grand Hall receives you with familiar lamplight.',5);playSample?.('doorOpen',.82,1);return true
      }
      if(data?.type==='after-dark-detail'){showNotice(data.author,7);sound?.(280,.12,'triangle',.035);return true}
      return false;
    }

    function update(time,dt,reducedMotion=false){
      currentTime=time;
      for(const room of Object.values(rooms)){
        const threshold=Math.hypot(player.pos.x-room.entrance.x,player.pos.z-room.entrance.z)<PRELOAD_DISTANCE;
        const occupied=zoneAt(player.pos.x,player.pos.z)===room;
        if(threshold||occupied){activate(room);room.lastNeeded=time}else if(room.active&&time-room.lastNeeded>KEEP_WARM_SECONDS)unload(room);
      }
      const active=zoneAt(player.pos.x,player.pos.z);if(!active||!active.active)return;
      for(const item of animated){if(item.room!==active||!item.mesh.parent)continue;if(item.kind==='rain'&&!reducedMotion){item.mesh.position.y-=dt*(2.8+item.phase*.25);if(item.mesh.position.y<.25)item.mesh.position.y=5.4}else if(item.kind==='dust'&&!reducedMotion){item.mesh.position.y+=Math.sin(time*.45+item.phase)*dt*.035;item.mesh.position.x+=Math.cos(time*.28+item.phase)*dt*.018}}
      if(active.key==='departures'&&Math.floor(time)%19===0&&Math.floor((time-dt)*10)!==Math.floor(time*10))sound?.(72,1.6,'sine',.012);else if(active.key==='sorting'&&Math.floor(time)%23===0&&Math.floor((time-dt)*10)!==Math.floor(time*10))sound?.(118,.28,'triangle',.02);
    }

    entrance(rooms.sorting,'STAFF · SORTING','A plain service door. Packing string is caught beneath it.');
    entrance(rooms.departures,'DEPARTURES','Travel, voyages, expeditions, natural history, and uncertain returns.');

    return {contains,floorAt,allowed,interact,update,zoneAt,rooms,activate};
  };
})();
