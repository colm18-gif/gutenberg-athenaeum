/* A request-stop railway. Existing rooms, mysteries and train ambience remain intact. */
(()=>{
  'use strict';
  window.createNightTrain=function({THREE,scene,MAT,player,collider,colliders,interactables,canvasTexture,wrapText,coverTexture,books,performanceZones,rememberLights,move,notice,home}){
    const regions=[{key:'platform',a:210,b:216,c:-35,d:-5},{key:'carriage',a:218,b:223,c:-30,d:-10},{key:'depot',a:248,b:272,c:-34,d:-6}];
    const solids=[],scenery=[],landscapes=[],groups={},controls={};let built=false,travelling=false,elapsed=0,arrived=false,nextWheel=0;
    const metal=new THREE.MeshStandardMaterial({color:0x253230,roughness:.65,metalness:.4});
    const cloth=new THREE.MeshStandardMaterial({color:0x493e32,roughness:1});
    const night=new THREE.MeshStandardMaterial({color:0x111d29,emissive:0x111d29,emissiveIntensity:.5});
    const glow=new THREE.MeshStandardMaterial({color:0xffc881,emissive:0xffb45d,emissiveIntensity:1.3});
    function zoneAt(x,z){return regions.find(r=>x>=r.a&&x<=r.b&&z>=r.c&&z<=r.d)}
    function box(g,w,h,d,mat,x,y,z,solid=false){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);g.add(m);if(solid){solids.push(m);collider(x,z,w,d,'Night railway furniture',-.5,h+1)}return m}
    function label(g,text,x,y,z,w=2.8,h=.65,rot=0){const map=canvasTexture((c,cw,ch)=>{c.fillStyle='#282b25';c.fillRect(0,0,cw,ch);c.fillStyle='#d6bd90';c.textAlign='center';c.font='25px Georgia';wrapText(c,text,cw/2,40,cw-30,32)},640,160);const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map}));m.position.set(x,y,z);m.rotation.y=rot;g.add(m);return m}
    function control(g,key,title,author,action,x,y,z,w=.7,h=.45,d=.12){const m=box(g,w,h,d,MAT.brass,x,y,z);m.userData={type:'night-railway',key,title,author,action};interactables.push(m);controls[key]=m;return m}
    function lamp(g,x,y,z,bright=false){box(g,.22,.4,.22,glow,x,y,z);const light=new THREE.PointLight(0xffbd77,bright?30:18,bright?15:11,1.7);light.position.set(x,y,z);g.add(light)}
    function volume(g,book,x,y,z){const m=box(g,1.25,1.65,.22,new THREE.MeshStandardMaterial({map:coverTexture(book),roughness:.8}),x,y,z);m.rotation.x=-Math.PI/2;const uv=m.geometry.attributes?.uv;if(uv){for(let f=0;f<6;f++)if(f!==4)for(let i=0;i<4;i++)uv.setXY(f*4+i,.005,.005);uv.needsUpdate=true}m.userData={type:'book',book,loaded:true,realCover:true,railwayCopy:true,home:{parent:g,position:m.position.clone(),quaternion:m.quaternion.clone()}};interactables.push(m)}
    // Only this small service panel exists before discovery; the railway is built on demand.
    const entranceGroup=new THREE.Group();scene.add(entranceGroup);
    const entrance=control(entranceGroup,'entrance','A railway parcels door','The distant train sounds closer against the worn timber.','OPEN',165,1.9,-27,.16,3.8,2.1);
    label(entranceGroup,'PARCELS · NIGHT SERVICE',164.9,2.7,-27,1.8,.4,-Math.PI/2);
    collider(165,-27,.2,2.1,'Railway parcels door',-.5,4.2);lamp(entranceGroup,164.7,3.7,-27);rememberLights(entranceGroup);
    performanceZones.nightRailEntrance={group:entranceGroup,isNeeded:()=>player.pos.x>135&&player.pos.x<170&&player.pos.z<-8,active:true};
    function room(key){const g=new THREE.Group();g.name='night-railway-'+key;groups[key]=g;scene.add(g);performanceZones['nightRail'+key]={group:g,isNeeded:()=>zoneAt(player.pos.x,player.pos.z)?.key===key,active:true};return g}
    function build(){if(built)return;built=true;
      const platform=room('platform');box(platform,6,.4,30,MAT.stone,213,-.2,-20);box(platform,.4,5,30,metal,209.8,2.5,-20);box(platform,6,5,.4,metal,213,2.5,-35.2);box(platform,6,5,.4,metal,213,2.5,-4.8);box(platform,6,.3,30,metal,213,5,-20);
      // Exterior carriage, running gear and locomotive are visible from a protected platform.
      box(platform,5,3.8,20,metal,220.5,1.9,-20);box(platform,5.4,.4,20.5,MAT.darkWood,220.5,4,-20);box(platform,4.7,.8,19,metal,220.5,-.6,-20);
      for(const z of [-27,-13])for(const x of [218.2,222.8]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.75,.75,.25,16),metal);wheel.rotation.z=Math.PI/2;wheel.position.set(x,-.3,z);platform.add(wheel)}
      for(const z of [-28,-24,-20,-16,-12])box(platform,.05,1.3,2.3,night,217.97,2.5,z);
      box(platform,4,3,4,metal,220.5,1.5,-33);const boiler=new THREE.Mesh(new THREE.CylinderGeometry(1.25,1.25,6,16),metal);boiler.rotation.x=Math.PI/2;boiler.position.set(220.5,1.3,-38);platform.add(boiler);box(platform,.65,2,.65,metal,220.5,3,-39);
      for(const x of [219.6,221.4])box(platform,.1,.1,48,MAT.brass,x,-.8,-23);for(let z=-45;z<0;z+=1.5)box(platform,4,.12,.25,MAT.darkWood,220.5,-.9,z);
      control(platform,'board','The reading carriage','No timetable. A lamp is already burning inside.','BOARD',215.8,1.8,-20,.12,3,1.8);label(platform,'THE NIGHT COLLECTIONS SERVICE',213,3.7,-34.95,4,.8);
      control(platform,'platform-home','A library return ticket','The entrance clock is printed on the reverse.','RETURN TO LIBRARY',210.2,1.6,-19,.12,.8,1);lamp(platform,212,3,-28);lamp(platform,212,3,-12);
      const car=room('carriage');box(car,5,.4,20,MAT.wood,220.5,-.2,-20);box(car,5,.3,20,MAT.darkWood,220.5,3.9,-20);for(const z of [-30.2,-9.8])box(car,5,3.9,.4,MAT.wood2,220.5,1.95,z);
      for(const x of [217.8,223.2]){box(car,.4,1.4,20,MAT.wood2,x,.7,-20);box(car,.4,.6,20,MAT.wood2,x,3.55,-20);for(let z=-29;z<-10;z+=3){box(car,.4,2,.22,MAT.brass,x,2.4,z);box(car,.08,2,2.75,night,x+(x<220?-3.3:3.3),2.3,z+1.5)}}
      // A full-width clear aisle joins reading and observation ends; no forced camera motion.
      for(const z of [-26,-22,-18]){box(car,1.1,.55,1.35,cloth,218.7,.45,z,true);box(car,.2,1.3,1.35,MAT.darkWood,218.1,1,z);box(car,.95,.1,1.3,MAT.darkWood,222.25,1.05,z,true)}
      volume(car,books[0],222.25,1.25,-26);volume(car,books[1],222.25,1.25,-22);
      control(car,'depart','A conductor’s brass punch','The ticket reads: Collections Depot — works awaiting another reader.','BEGIN JOURNEY',220.5,1.6,-28.9);
      control(car,'settle','A worn reading seat','Close your eyes for a moment; the next stop will come sooner.','SETTLE · ARRIVE SOONER',218.8,1.1,-18);
      control(car,'alight','The carriage door','The platform waits until you choose to leave.','BACK TO PLATFORM',220.5,1.7,-10.1,1.2,2.8,.12);
      control(car,'car-home','A return ticket beside the window','Valid whenever you wish to go home.','RETURN TO LIBRARY',222.5,1.6,-14);
      label(car,'Some journeys begin with a book left behind.',220.5,3,-29.95,4,.7);for(const z of [-26,-19,-12])lamp(car,220.5,3.25,z);
      for(const x of [217.3,223.7])for(let i=0;i<14;i++){const m=box(car,.12,1.5+(i%4)*.5,.35,metal,x,1.8,-35+i*2);scenery.push({mesh:m,base:-35+i*2})}
      // Recycled silhouettes make three landscapes pass the windows without moving the player.
      const litWindow=new THREE.MeshStandardMaterial({color:0xba9968,emissive:0xba9968,emissiveIntensity:.65});
      for(let stage=0;stage<3;stage++)for(const x of [216.5,224.5])for(let i=0;i<7;i++){
        const silhouette=new THREE.Group();silhouette.position.set(x,0,-35+i*5);car.add(silhouette);landscapes.push({mesh:silhouette,base:-35+i*5,stage});
        if(stage===0){box(silhouette,.6,2.4+i%3*.6,2.6,metal,0,1.4,0);for(const z of [-.7,.7])box(silhouette,.62,.25,.4,litWindow,0,2.1,z)}
        else if(stage===1){box(silhouette,.25,2,.25,MAT.darkWood,0,1,0);box(silhouette,.7,1.2,1.5,metal,0,2.1,0);box(silhouette,.5,.8,1,metal,0,2.9,0)}
        else{box(silhouette,.12,2.3,.12,metal,0,1.15,0);box(silhouette,.35,.4,.35,glow,0,2.4,0);box(silhouette,.7,.1,2.5,MAT.stone,0,.05,0)}
      }
      const depot=room('depot');box(depot,24,.4,28,MAT.wood,260,-.2,-20);box(depot,24,.3,28,MAT.darkWood,260,5.8,-20);for(const x of [247.8,272.2])box(depot,.4,5.8,28,MAT.stone,x,2.9,-20);for(const z of [-34.2,-5.8])box(depot,24,5.8,.4,MAT.stone,260,2.9,z);
      label(depot,'COLLECTIONS DEPOT · HELD FOR DISCOVERY',260,4,-33.95,8,1);label(depot,'Not lost. Only waiting for a different reader.',260,2.9,-33.95,6,.6);
      const themes=['DEPARTURES & RETURNS','JUNCTIONS & GHOSTS','PASSENGERS & DISTANCES'];
      for(let i=0;i<3;i++){const x=252+i*8;box(depot,3.4,.9,3,MAT.wood2,x,.45,-26,true);box(depot,3.7,.12,3.2,MAT.darkWood,x,1,-26);volume(depot,books[i],x,1.22,-26);label(depot,themes[i],x,1.7,-27.65,3,.6);
        const drawer=control(depot,'drawer-'+i,'A catalogue drawer',themes[i]+' — a relationship, rather than a ranking.','READ NOTE',x,1.5,-28.6,2.4,.4,.4);drawer.userData.note=books[i].depotNote;
        for(let j=0;j<4;j++){box(depot,1.1,.65,.9,MAT.wood2,x-1.1+j%2*2.2,.325+Math.floor(j/2)*.7,-31.6,true)}lamp(depot,x,3.5,-26);
      }
      // New acquisitions and familiar overlooked companions share two browsable rows without replacing their old shelves.
      label(depot,'OTHER PRESSES · UNCOMMON ROUTES',260,2.5,-21.2,7,.55);
      for(let i=3;i<books.length;i++){const n=i-3,row=Math.floor(n/6),x=251+(n%6)*4,z=-18.5+row*5;box(depot,2,.9,1.8,MAT.wood2,x,.45,z,true);volume(depot,books[i],x,1.12,z);if(books[i].depotNote){const card=control(depot,'card-'+i,'A librarian’s depot card',books[i].source||'Open-access acquisition','READ NOTE',x+.72,1.18,z+.45,.34,.18,.28);card.userData.note=books[i].depotNote}}
      box(depot,3.2,1,1.8,MAT.darkWood,268,.5,-10,true);control(depot,'depot-home','A conductor’s return bell','One note will carry you back beneath the library clock.','RING · RETURN TO LIBRARY',268,1.35,-10);
      control(depot,'reboard','The waiting night train','The reading carriage remains yours for as long as you need it.','BOARD READING CARRIAGE',260,1.9,-6.1,1.5,3,.12);lamp(depot,260,3,-10,true);lamp(depot,260,3,-20,true);lamp(depot,251,3,-15,true);lamp(depot,268,3,-15,true);label(depot,'RETURNS · NO DEADLINE',268,2,-9.9,3,.6,Math.PI);
      depot.add(new THREE.AmbientLight(0xffd4a1,2.6));
      depot.traverse(o=>{if(o.isPointLight)o.intensity*=2});
      for(const g of Object.values(groups))rememberLights(g);sync();
    }
    function sync(){const zone=zoneAt(player.pos.x,player.pos.z)?.key;for(const [key,g] of Object.entries(groups))g.visible=key===zone}
    function cancel(){travelling=false;elapsed=0;nextWheel=0}
    function interact(object){if(object?.userData?.type!=='night-railway')return false;const key=object.userData.key;
      if(key==='entrance'){build();cancel();move(213,-20,-Math.PI/2);notice('A night train waits beside a platform the public catalogue never mentioned.',7)}
      else if(key.endsWith('home')){cancel();home()}
      else if(key==='board'||key==='reboard'){build();move(220.5,-13,0);notice(arrived?'The reading carriage waits. The depot is still outside.':'The carriage is yours to explore. The brass ticket punch starts the journey.',7)}
      else if(key==='depart'){if(!travelling&&!arrived){travelling=true;elapsed=0;controls.depart.userData.action='UNDER WAY';controls.alight.userData.author='The doors will open at the collections depot.';notice('The wheels begin to turn. Read, watch the windows, or settle into the worn seat to arrive sooner.',8)}else notice(arrived?'You have reached the depot. The carriage door opens onto it.':'The depot lies ahead. The reading seat offers a shorter journey.',5)}
      else if(key==='settle'){if(!arrived){travelling=true;elapsed=Math.max(elapsed,58);notice('You settle into the seat. The rhythm softens; a station lamp appears.',4)}else notice('The train waits here without a timetable. Take your time with a book.',5)}
      else if(key==='alight'){if(travelling)notice('The train is moving. Settle into the reading seat if you would like to arrive sooner.',5);else if(arrived){move(260,-9,0);notice('Crates, catalogue drawers, and books held for another reader. Nothing here is arranged by popularity.',8)}else move(213,-20,-Math.PI/2)}
      else if(key.startsWith('drawer-')||key.startsWith('card-'))notice(object.userData.note,12);
      sync();return true;
    }
    function allowed(x,z){const r=player.radius;if(!zoneAt(x-r,z-r)||!zoneAt(x+r,z+r))return false;return !colliders.some(c=>!c.inactive&&0>=c.minY&&0<=c.maxY&&x+r>c.minX&&x-r<c.maxX&&z+r>c.minZ&&z-r<c.maxZ)}
    function clearLine(ray,target,distance){const blockers=solids.filter(m=>m.parent?.visible);const hit=ray.intersectObjects(blockers,false)[0];return !hit||hit.object===target||hit.distance>=distance-.04}
    function update(t,dt,reduced,active,sound){sync();const zone=zoneAt(player.pos.x,player.pos.z)?.key;if(zone!=='carriage'&&travelling)cancel();if(travelling&&active){elapsed+=dt;if(t>nextWheel){nextWheel=t+.7;sound(65,.3,'triangle',.04);sound(115,.1,'sine',.025)}if(elapsed>=60){travelling=false;arrived=true;controls.alight.userData.action='ENTER COLLECTIONS DEPOT';controls.alight.userData.author='The doors open onto books awaiting another reader.';controls.depart.userData.action='ARRIVED';notice('The night train comes to rest. Beyond the carriage door, the forgotten collections depot is waiting.',8)}}
      for(const item of scenery)item.mesh.position.z=reduced?item.base:-35+((item.base+35+elapsed*3)%40);
      const stage=reduced?0:Math.min(2,Math.floor(elapsed/20));for(const item of landscapes){item.mesh.visible=item.stage===stage;item.mesh.position.z=reduced?item.base:-35+((item.base+35+elapsed*2)%40)}
      return !!zone;
    }
    return {build,interact,update,allowed,clearLine,zoneAt,regions,groups,controls,entrance,cancel,get travelling(){return travelling},get arrived(){return arrived},get built(){return built}};
  };
})();
