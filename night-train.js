/* A request-stop railway. Existing rooms, mysteries and train ambience remain intact. */
(()=>{
  'use strict';
  window.createNightTrain=function({THREE,scene,MAT,player,collider,colliders,interactables,canvasTexture,wrapText,coverTexture,books,performanceZones,rememberLights,move,notice,home,modelTemplate,isLowBandwidth}){
    const regions=[{key:'platform',a:210,b:216,c:-35,d:-5},{key:'carriage',a:218,b:223,c:-30,d:-10},{key:'depot',a:248,b:272,c:-34,d:-6}];
    const solids=[],scenery=[],landscapes=[],groups={},controls={};let built=false,travelling=false,elapsed=0,arrived=false,nextWheel=0,conductorTalk=0;
    const metal=new THREE.MeshStandardMaterial({color:0x253230,roughness:.65,metalness:.4});
    const cloth=new THREE.MeshStandardMaterial({color:0x493e32,roughness:1});
    const leather=new THREE.MeshStandardMaterial({color:0x4f1f1a,roughness:.76,metalness:.02});
    const leatherDark=new THREE.MeshStandardMaterial({color:0x29100f,roughness:.86});
    const iron=new THREE.MeshStandardMaterial({color:0x111615,roughness:.48,metalness:.72});
    const paintedGreen=new THREE.MeshStandardMaterial({color:0x183b32,roughness:.58,metalness:.2});
    const night=new THREE.MeshStandardMaterial({color:0x111d29,emissive:0x111d29,emissiveIntensity:.5});
    const glow=new THREE.MeshStandardMaterial({color:0xffc881,emissive:0xffb45d,emissiveIntensity:1.3});
    function zoneAt(x,z){return regions.find(r=>x>=r.a&&x<=r.b&&z>=r.c&&z<=r.d)}
    function box(g,w,h,d,mat,x,y,z,solid=false){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);g.add(m);if(solid){solids.push(m);collider(x,z,w,d,'Night railway furniture',-.5,h+1)}return m}
    function label(g,text,x,y,z,w=2.8,h=.65,rot=0){const map=canvasTexture((c,cw,ch)=>{c.fillStyle='#282b25';c.fillRect(0,0,cw,ch);c.fillStyle='#d6bd90';c.textAlign='center';c.font='25px Georgia';wrapText(c,text,cw/2,40,cw-30,32)},640,160);const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map}));m.position.set(x,y,z);m.rotation.y=rot;g.add(m);return m}
    function control(g,key,title,author,action,x,y,z,w=.7,h=.45,d=.12){const m=box(g,w,h,d,MAT.brass,x,y,z);m.userData={type:'night-railway',key,title,author,action};interactables.push(m);controls[key]=m;return m}
    function lamp(g,x,y,z,bright=false){box(g,.22,.4,.22,glow,x,y,z);const light=new THREE.PointLight(0xffbd77,bright?30:18,bright?15:11,1.7);light.position.set(x,y,z);g.add(light)}
    function cylinder(g,rt,rb,h,segments,mat,x,y,z,rx=0,ry=0,rz=0){const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,segments),mat);m.position.set(x,y,z);m.rotation.x=rx;m.rotation.y=ry;m.rotation.z=rz;g.add(m);return m}
    function railModel(g,file,x,y,z,size,yaw=0){
      if(!modelTemplate||isLowBandwidth?.())return;
      modelTemplate('assets/models/kenney-train/'+file).then(template=>{
        const model=template.clone(true),bounds=new THREE.Box3().setFromObject(model),dimensions=bounds.getSize(new THREE.Vector3());
        model.scale.set(size.x/Math.max(dimensions.x,.001),size.y/Math.max(dimensions.y,.001),size.z/Math.max(dimensions.z,.001));model.rotation.y=yaw;model.updateMatrixWorld(true);
        const fitted=new THREE.Box3().setFromObject(model),center=fitted.getCenter(new THREE.Vector3());model.position.set(x-center.x,y-fitted.min.y,z-center.z);
        model.traverse(node=>{if(node.isMesh){node.castShadow=false;node.receiveShadow=false}});g.add(model)
      }).catch(error=>console.warn('CC0 railway detail unavailable; keeping procedural fallback.',file,error))
    }
    function rivetLine(g,x,y,z,count,step,axis='z',mat=MAT.brass){for(let i=0;i<count;i++){const r=cylinder(g,.045,.045,.035,8,mat,x,y,z,0,0,Math.PI/2);r.position[axis]+=(i-(count-1)/2)*step}}
    function carriageSeat(g,z){
      const seatGroup=new THREE.Group();seatGroup.position.set(218.72,0,z);g.add(seatGroup);
      const cushion=box(seatGroup,1.22,.28,1.52,leather,0,.62,0);solids.push(cushion);collider(218.72,z,1.22,1.52,'Night railway furniture',-.5,2.2);box(seatGroup,.3,1.55,1.54,MAT.darkWood,-.52,1.28,.02);box(seatGroup,.22,1.25,1.4,leatherDark,-.35,1.25,.02);
      box(seatGroup,.13,.72,1.58,MAT.brass,.57,.88,0);box(seatGroup,.22,.18,1.48,MAT.darkWood,.58,1.22,0);
      for(const dz of [-.57,0,.57]){const button=cylinder(seatGroup,.052,.052,.035,8,MAT.brass,-.225,1.34,dz,0,0,Math.PI/2);button.position.x=-.235}
      for(const dz of [-.55,.55])box(seatGroup,.16,.55,.16,MAT.darkWood,-.38,.27,dz);
      box(seatGroup,.08,.08,1.3,MAT.brass,.01,.77,0);return seatGroup
    }
    function conductor(g,x,z,rot=0){const person=new THREE.Group(),data={type:'night-railway',key:'conductor',title:'The Night Collections conductor',author:'His watch has thirteen numerals and his ticket punch bears the library crest.',action:'SPEAK'};person.position.set(x,0,z);person.rotation.y=rot;g.add(person);const coat=box(person,.78,1.45,.46,paintedGreen,0,1.25,0),head=cylinder(person,.28,.3,.5,14,new THREE.MeshStandardMaterial({color:0xb98b69,roughness:.9}),0,2.22,0),hat=box(person,.72,.14,.62,iron,0,2.58,0),brim=box(person,.92,.06,.76,iron,0,2.48,0);for(const part of [coat,head,hat,brim]){part.userData=data;interactables.push(part)}for(const sx of [-.47,.47]){const arm=box(person,.18,1.18,.2,paintedGreen,sx,1.38,0);arm.rotation.z=sx*.16;arm.userData=data;interactables.push(arm)}const watch=cylinder(person,.13,.13,.05,14,MAT.brass,.25,1.55,-.27,Math.PI/2);watch.userData=data;interactables.push(watch);return person}
    function volume(g,book,x,y,z){const m=box(g,1.25,1.65,.22,new THREE.MeshStandardMaterial({map:coverTexture(book),roughness:.8}),x,y,z);m.rotation.x=-Math.PI/2;const uv=m.geometry.attributes?.uv;if(uv){for(let f=0;f<6;f++)if(f!==4)for(let i=0;i<4;i++)uv.setXY(f*4+i,.005,.005);uv.needsUpdate=true}m.userData={type:'book',book,loaded:true,realCover:true,railwayCopy:true,home:{parent:g,position:m.position.clone(),quaternion:m.quaternion.clone()}};interactables.push(m)}
    // Only this small service panel exists before discovery; the railway is built on demand.
    const entranceGroup=new THREE.Group();scene.add(entranceGroup);
    // The concealed library entrance reads as a Victorian station portal rather than an ordinary cupboard.
    const entrance=control(entranceGroup,'entrance','The Night Collections platform','Ironwork trembles faintly beneath the station clock.','ENTER PLATFORM',165,1.9,-27,.18,3.8,2.2);entrance.material=paintedGreen;
    for(const z of [-28.35,-25.65])box(entranceGroup,.42,4.45,.42,MAT.stone,164.98,2.05,z);box(entranceGroup,.42,.5,3.15,MAT.stone,164.98,4.18,-27);box(entranceGroup,.3,.2,3.55,MAT.brass,164.76,3.88,-27);
    for(const z of [-27.56,-26.44]){box(entranceGroup,.06,1.28,.82,MAT.darkWood,164.83,1.22,z);box(entranceGroup,.06,1.28,.82,MAT.darkWood,164.83,2.7,z);rivetLine(entranceGroup,164.78,2.7,z,3,.27,'z',MAT.brass)}
    box(entranceGroup,.08,.08,2.05,MAT.brass,164.74,3.46,-27);rivetLine(entranceGroup,164.7,3.47,-27,9,.23,'z',MAT.brass);
    const portalRoundel=cylinder(entranceGroup,.58,.58,.1,28,paintedGreen,164.69,4.58,-27,0,0,Math.PI/2);const portalRing=cylinder(entranceGroup,.67,.67,.055,28,MAT.brass,164.63,4.58,-27,0,0,Math.PI/2);portalRoundel.renderOrder=2;portalRing.renderOrder=1;
    label(entranceGroup,'NIGHT PLATFORM',164.58,4.58,-27,1.05,.28,-Math.PI/2);label(entranceGroup,'PARCELS · BOOKS · REQUEST STOP',164.68,3.72,-27,2.35,.34,-Math.PI/2);
    collider(165,-27,.24,2.2,'Night-platform gates',-.5,4.35);lamp(entranceGroup,164.55,3.25,-28.72);lamp(entranceGroup,164.55,3.25,-25.28);rememberLights(entranceGroup);
    performanceZones.nightRailEntrance={group:entranceGroup,isNeeded:()=>player.pos.x>135&&player.pos.x<170&&player.pos.z<-8,active:true};
    function room(key){const g=new THREE.Group();g.name='night-railway-'+key;groups[key]=g;scene.add(g);performanceZones['nightRail'+key]={group:g,isNeeded:()=>zoneAt(player.pos.x,player.pos.z)?.key===key,active:true};return g}
    function build(){if(built)return;built=true;
      const platform=room('platform');box(platform,6,.4,30,MAT.stone,213,-.2,-20);box(platform,.4,5,30,metal,209.8,2.5,-20);box(platform,6,5,.4,metal,213,2.5,-35.2);box(platform,6,5,.4,metal,213,2.5,-4.8);box(platform,6,.3,30,metal,213,5,-20);
      // The CC0 track adds correctly proportioned sleepers and rail chairs; these boxes remain as a fallback.
      for(const x of [219.6,221.4])box(platform,.1,.1,48,MAT.brass,x,-.8,-23);for(let z=-45;z<0;z+=1.5)box(platform,4,.12,.25,MAT.darkWood,220.5,-.9,z);for(let z=-43;z<-1;z+=4)railModel(platform,'track-detailed.glb',220.5,-.98,z,{x:4,y:.42,z:4});
      // Exterior carriage: panelled body, clerestory roof, running boards, suspension and lit compartment windows.
      box(platform,5,3.8,20,paintedGreen,220.5,1.9,-20);box(platform,5.5,.34,20.7,MAT.darkWood,220.5,4.08,-20);box(platform,3.4,.42,20.1,metal,220.5,4.43,-20);box(platform,4.7,.8,19,iron,220.5,-.6,-20);box(platform,5.65,.14,20.2,MAT.brass,220.5,.18,-20);
      for(const z of [-27,-20,-13])for(const x of [218.2,222.8]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.78,.78,.25,20),metal);wheel.rotation.z=Math.PI/2;wheel.position.set(x,-.3,z);platform.add(wheel);const rim=new THREE.Mesh(new THREE.CylinderGeometry(.62,.62,.06,20),MAT.brass);rim.rotation.z=Math.PI/2;rim.position.set(x+(x<220?.14:-.14),-.3,z);platform.add(rim)}
      for(const z of [-28,-24,-16,-12]){box(platform,.055,1.36,2.15,night,217.96,2.48,z);box(platform,.04,1.52,2.35,MAT.brass,217.9,2.48,z);box(platform,.035,.08,2.2,MAT.brass,217.85,2.48,z)}
      for(let z=-28.8;z<-10.8;z+=1.2)rivetLine(platform,217.86,.58,z,2,.18,'y',iron);for(const z of [-28.9,-10.9])box(platform,.18,3.6,.16,MAT.brass,217.82,2.05,z);
      for(const z of [-27,-20,-13]){box(platform,.22,.18,2.65,iron,218.02,-.52,z);for(const dz of [-.9,0,.9])box(platform,.16,.32,.16,MAT.brass,217.86,-.52,z+dz)}
      // A detailed steam locomotive: cab glazing, boiler bands, domes, handrails, motion gear and proper front hardware.
      box(platform,4.4,4.2,4.3,paintedGreen,220.5,1.5,-33.4);box(platform,4.8,.32,4.75,iron,220.5,3.76,-33.4);for(const x of [218.25,222.75]){box(platform,.08,1.45,1.65,night,x,2.25,-33.4);box(platform,.09,1.6,.09,MAT.brass,x+(x<220?-.06:.06),2.25,-33.4);box(platform,.09,.09,1.78,MAT.brass,x+(x<220?-.06:.06),2.25,-33.4)}
      const boiler=cylinder(platform,1.28,1.28,7.4,28,iron,220.5,1.25,-39,Math.PI/2),smokebox=cylinder(platform,1.37,1.37,.48,28,iron,220.5,1.25,-42.78,Math.PI/2);for(const z of [-36,-38,-40,-42])cylinder(platform,1.34,1.34,.14,28,MAT.brass,220.5,1.25,z,Math.PI/2);
      for(const x of [219.22,221.78]){box(platform,.075,.075,6.25,MAT.brass,x,2.15,-39);for(const z of [-36.2,-39,-41.8])box(platform,.15,.55,.15,MAT.brass,x,1.88,z)}
      for(const z of [-37.1,-39.3]){cylinder(platform,.48,.54,.62,20,metal,220.5,2.58,z);cylinder(platform,.33,.4,.16,20,MAT.brass,220.5,2.94,z)}
      const chimney=new THREE.Group();chimney.position.set(220.5,2.55,-41.15);platform.add(chimney);cylinder(chimney,.35,.52,1.55,20,iron,0,.65,0);const stackTop=new THREE.Mesh(new THREE.ConeGeometry(.66,.72,20),iron);stackTop.position.y=1.65;chimney.add(stackTop);
      const headlamp=box(platform,.58,.56,.4,glow,220.5,2.15,-43.14);box(platform,.78,.12,.5,MAT.brass,220.5,2.5,-43.12);const bufferBeam=box(platform,4.35,.32,.36,new THREE.MeshStandardMaterial({color:0x59201a,roughness:.7}),220.5,.18,-43.3);for(const x of [219.08,221.92]){box(platform,.18,.18,.52,iron,x,.2,-43.55);const buffer=cylinder(platform,.24,.24,.14,16,iron,x,.2,-43.87,Math.PI/2)}for(const x of [218.7,219.6,220.5,221.4,222.3]){const bar=box(platform,.09,.09,2.5,MAT.brass,x,-.42,-44.05);bar.rotation.x=-.32}
      for(const z of [-41,-38,-35])for(const x of [218.15,222.85]){const wheel=cylinder(platform,z===-38?.92:.72,z===-38?.92:.72,.3,24,iron,x,-.28,z,0,0,Math.PI/2);const hub=cylinder(platform,.18,.18,.38,14,MAT.brass,x+(x<220?-.1:.1),-.28,z,0,0,Math.PI/2)}for(const x of [218.03,222.97]){box(platform,.13,.13,6.6,MAT.brass,x,-.2,-38);for(const z of [-41,-38,-35])cylinder(platform,.15,.15,.1,12,MAT.brass,x,-.2,z,0,0,Math.PI/2)}
      label(platform,'NIGHT COLLECTIONS · No. 1874',217.93,2.08,-38.5,3.6,.42,Math.PI/2);railModel(platform,'train-connector.glb',220.5,-.67,-30.45,{x:1.7,y:.9,z:.55},Math.PI/2);
      // The boarding control is now a brass-framed carriage vestibule attached to the train.
      const board=control(platform,'board','The reading carriage','A proper vestibule door; beyond its glass, a lamp is already burning.','BOARD',217.79,1.82,-20,.14,3.1,1.72);board.material=MAT.darkWood;
      box(platform,.08,3.46,.18,MAT.brass,217.7,1.82,-20.98);box(platform,.08,3.46,.18,MAT.brass,217.7,1.82,-19.02);box(platform,.08,.18,2.12,MAT.brass,217.7,3.51,-20);box(platform,.07,1.06,1.18,night,217.68,2.58,-20);box(platform,.055,.08,1.24,MAT.brass,217.63,2.58,-20);box(platform,.07,.08,1.12,MAT.brass,217.62,1.32,-20);box(platform,.07,.08,1.12,MAT.brass,217.62,.9,-20);cylinder(platform,.08,.08,.18,12,MAT.brass,217.58,1.68,-19.42,0,0,Math.PI/2);
      for(let i=0;i<3;i++)box(platform,.62,.12,2.25-i*.28,iron,217.25-i*.38,.28-i*.16,-20);label(platform,'THE NIGHT COLLECTIONS SERVICE',213,3.7,-34.95,4,.8);
      control(platform,'platform-home','A library return ticket','The entrance clock is printed on the reverse.','RETURN TO LIBRARY',210.2,1.6,-19,.12,.8,1);lamp(platform,212,3,-28);lamp(platform,212,3,-12);
      conductor(platform,212.2,-23,-Math.PI/2);
      const car=room('carriage');box(car,5,.4,20,MAT.wood,220.5,-.2,-20);box(car,5,.3,20,MAT.darkWood,220.5,3.9,-20);box(car,3.25,.24,19.6,metal,220.5,4.2,-20);for(const z of [-30.2,-9.8])box(car,5,3.9,.4,MAT.wood2,220.5,1.95,z);
      for(const x of [217.8,223.2]){
        box(car,.4,1.4,20,MAT.wood2,x,.7,-20);box(car,.4,.6,20,MAT.wood2,x,3.55,-20);box(car,.1,.1,19.4,MAT.brass,x+(x<220?.23:-.23),1.42,-20);
        for(let z=-29;z<-10;z+=3){box(car,.4,2,.22,MAT.brass,x,2.4,z);box(car,.08,1.72,2.56,night,x+(x<220?.23:-.23),2.35,z+1.5);box(car,.06,.07,2.34,MAT.brass,x+(x<220?.28:-.28),2.35,z+1.5)}
        // Brass luggage rack with leather retaining straps.
        box(car,.18,.1,18.5,MAT.brass,x+(x<220?.48:-.48),3.2,-20);box(car,.12,.1,18.5,MAT.brass,x+(x<220?.92:-.92),3.2,-20);for(let z=-28;z<-11;z+=2)box(car,.82,.08,.1,MAT.brass,x+(x<220?.7:-.7),3.2,z)
      }
      for(let z=-29;z<-10;z+=2){box(car,4.7,.08,.08,MAT.brass,220.5,3.78,z);cylinder(car,.055,.055,4.55,8,MAT.brass,220.5,3.78,z,0,0,Math.PI/2)}
      // Deep buttoned-leather railway seats retain a full-width clear aisle.
      for(const z of [-26,-22,-18]){carriageSeat(car,z);box(car,.95,.12,1.4,MAT.darkWood,222.25,1.05,z,true);box(car,.82,.08,1.25,MAT.brass,222.25,1.14,z);for(const dz of [-.54,.54])box(car,.12,1,.12,MAT.darkWood,222.25,.52,z+dz)}
      // A small travel library accompanies the railway titles: across plains, around worlds and into overlooked places.
      for(const [i,z] of [-27.2,-25,-22.8,-20.6,-18.4,-16.2].entries())if(books[i])volume(car,books[i],222.25,1.25,z);label(car,'TRAVEL LIBRARY · ROUTES REAL AND IMAGINED',222.88,2.45,-21.8,5.4,.48,Math.PI/2);
      control(car,'depart','A conductor’s brass punch','The ticket reads: Collections Depot — works awaiting another reader.','BEGIN JOURNEY',220.5,1.6,-28.9);
      conductor(car,220.7,-26.7,Math.PI);
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
      else if(key==='conductor'){const waiting=['“Tickets are optional. Curiosity is not.”','“The depot keeps books between readers, not books without readers.”','“Departure is whenever you touch the brass punch. The timetable dislikes being consulted.”'],moving=['“Mind the sway. The shelves travel better than some passengers.”','“We are passing the Unwritten Junction. Nothing stops there twice.”','“You may read during the journey. Most distances become shorter inside a book.”'],done=['“Collections Depot. No deadline, no fines, and no promise that the return platform will be where you left it.”','“Take your time. A waiting book is not the same thing as an impatient one.”'];const lines=arrived?done:travelling?moving:waiting;notice(lines[conductorTalk++%lines.length],8)}
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
