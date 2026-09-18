(function(){
  'use strict';

  window.createHighStaircase=function(options){
    const {THREE,scene,MAT,player,camera,interactables,books,coverTexture,canvasTexture,showNotice,sound,playSample,lastSafePosition}=options;
    const root=new THREE.Group();root.name='the-impossible-stair';scene.add(root);
    const cx=224,cz=30,topY=30,steps=180,turns=3.2,outerRadius=12,innerRadius=4.35,mx=340,mz=30,moonRadius=18,tx=380,tz=30;
    const stepPath=[],topBooks=[],moonBooks=[],animatedLights=[];let rocketTrip=null;
    const stone=new THREE.MeshStandardMaterial({color:0x302d30,roughness:.96}),iron=new THREE.MeshStandardMaterial({color:0x151516,metalness:.62,roughness:.5}),blueGlass=new THREE.MeshPhysicalMaterial({color:0x26384d,transparent:true,opacity:.42,roughness:.08}),night=new THREE.MeshBasicMaterial({color:0x080b16,side:THREE.BackSide}),lunarDust=new THREE.MeshStandardMaterial({color:0x8b8982,roughness:1}),rocketMetal=new THREE.MeshStandardMaterial({color:0x706c61,metalness:.72,roughness:.48}),rocketRed=new THREE.MeshStandardMaterial({color:0x6c2421,metalness:.28,roughness:.7});
    const add=(geometry,material,x,y,z,parent=root)=>{const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.castShadow=false;mesh.receiveShadow=false;parent.add(mesh);return mesh};
    const box=(w,h,d,material,x,y,z,parent=root)=>add(new THREE.BoxGeometry(w,h,d),material,x,y,z,parent);
    const cylinder=(rt,rb,h,segments,material,x,y,z,parent=root)=>add(new THREE.CylinderGeometry(rt,rb,h,segments),material,x,y,z,parent);

    // The entrance is deliberately ordinary in scale; the impossible height is hidden behind it.
    const entranceX=-33.5,entranceZ=-13.58;
    const entrance=new THREE.Group();entrance.position.set(entranceX,0,entranceZ);scene.add(entrance);
    const door=box(2.7,4.35,.24,MAT.darkWood,0,2.18,0,entrance);door.userData={type:'high-stair-door',title:'The stair that is not on the plan',author:'A brass plate reads: ASCENTS, DISTANCES & IMPOSSIBLE HEIGHTS.',action:'ASCEND'};interactables.push(door);
    for(const x of [-1.48,1.48])box(.22,4.72,.32,MAT.brass,x,2.36,.01,entrance);
    box(3.18,.24,.34,MAT.brass,0,4.66,.01,entrance);
    const plaqueTex=canvasTexture((ctx,w,h)=>{ctx.fillStyle='#21170d';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#c29a50';ctx.lineWidth=12;ctx.strokeRect(8,8,w-16,h-16);ctx.fillStyle='#e1c98d';ctx.textAlign='center';ctx.font='bold 30px Georgia';ctx.fillText('ASCENTS & IMPOSSIBLE HEIGHTS',w/2,52)},640,78);
    const plaque=add(new THREE.PlaneGeometry(2.45,.3),new THREE.MeshStandardMaterial({map:plaqueTex,roughness:.7}),0,3.28,.135,entrance);plaque.userData=door.userData;interactables.push(plaque);
    const knob=cylinder(.1,.1,.12,14,MAT.brass,.82,2.05,.2,entrance);knob.rotation.x=Math.PI/2;
    const entranceLamp=cylinder(.16,.24,.3,10,MAT.brass,0,4.98,.2,entrance),entranceGlow=new THREE.PointLight(0xffbd72,11,8,2);entranceGlow.position.set(0,4.72,.65);entrance.add(entranceGlow);
    for(let i=0;i<5;i++){const marker=box(.42,.025,.09,MAT.brass,entranceX+(i-2)*.58,.035,-11.15);marker.rotation.y=(i-2)*.06}

    // A bottom landing and a shaft whose ceiling is always farther away than it looks.
    const bottomAngle=0,bottomX=cx+outerRadius,bottomZ=cz;
    box(5,.35,5,MAT.wood,bottomX,-.18,bottomZ);
    const shaft=add(new THREE.CylinderGeometry(14,14,38,48,1,true),stone,cx,19,cz);shaft.material.side=THREE.BackSide;
    add(new THREE.CylinderGeometry(13.7,13.7,64,48,1,true),night,cx,40,cz);
    const shaftStars=new THREE.BufferGeometry(),starPositions=[];for(let i=0;i<180;i++){const a=Math.random()*Math.PI*2,r=13.35,y=2+Math.random()*57;starPositions.push(cx+Math.cos(a)*r,y,cz+Math.sin(a)*r)}shaftStars.setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3));root.add(new THREE.Points(shaftStars,new THREE.PointsMaterial({color:0x9fbde5,size:.09,transparent:true,opacity:.75})));

    // Radius changes on every turn, so the walkable path never overlaps itself in 2D.
    for(let i=0;i<steps;i++){
      const p=i/(steps-1),a=bottomAngle+p*turns*Math.PI*2,r=outerRadius+(innerRadius-outerRadius)*p,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r,y=p*topY;
      stepPath.push({x,z,y,a});
      const tread=box(1.42,.24,1.62,MAT.wood,x,y-.12,z);tread.rotation.y=-a;
      const innerR=r-.94,outerR=r+.94;
      for(const rr of [innerR,outerR]){
        const post=cylinder(.055,.07,1.05,8,iron,cx+Math.cos(a)*rr,y+.48,cz+Math.sin(a)*rr);post.userData.stairPost=true;
      }
      if(i%4===0){
        for(const rr of [innerR,outerR]){const rail=box(.09,.09,2.12,iron,cx+Math.cos(a)*rr,y+1,cz+Math.sin(a)*rr);rail.rotation.y=-a;rail.rotation.z=-Math.atan2(topY/(steps-1)*4,4*.9)}
      }
      if(i%15===0){const lamp=cylinder(.18,.25,.34,10,MAT.brass,cx+Math.cos(a)*(r+1.25),y+.82,cz+Math.sin(a)*(r+1.25));const glow=new THREE.PointLight(0xe5ad67,5.8,7,2);glow.position.set(lamp.position.x,y+1.2,lamp.position.z);root.add(glow);animatedLights.push({light:glow,phase:i*.43})}
    }

    // The summit: a circular reading room floating inside the upper darkness.
    cylinder(4.9,4.9,.38,48,MAT.wood,cx,topY-.19,cz);
    const rugTex=canvasTexture((ctx,w,h)=>{ctx.fillStyle='#201329';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#b58b4a';ctx.lineWidth=16;ctx.beginPath();ctx.arc(w/2,h/2,w*.4,0,Math.PI*2);ctx.stroke();ctx.lineWidth=4;for(let i=0;i<16;i++){const a=i/16*Math.PI*2;ctx.beginPath();ctx.moveTo(w/2+Math.cos(a)*w*.15,h/2+Math.sin(a)*h*.15);ctx.lineTo(w/2+Math.cos(a)*w*.36,h/2+Math.sin(a)*h*.36);ctx.stroke()}},512,512);
    const summitRug=add(new THREE.CircleGeometry(4.15,48),new THREE.MeshStandardMaterial({map:rugTex,roughness:.92}),cx,topY+.012,cz);summitRug.rotation.x=-Math.PI/2;
    for(let i=0;i<10;i++){if(i===5)continue;const a=i/10*Math.PI*2,r=4.45,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r,shelf=box(2.15,3.2,.45,MAT.darkWood,x,topY+1.6,z);shelf.rotation.y=-a+Math.PI/2;for(const yy of [topY+.58,topY+1.48,topY+2.38]){const ledge=box(2.05,.1,.54,MAT.brass,x,yy,z);ledge.rotation.y=shelf.rotation.y}}
    const dome=add(new THREE.SphereGeometry(5.15,32,16,0,Math.PI*2,0,Math.PI/2),blueGlass,cx,topY,cz);dome.material.side=THREE.DoubleSide;
    const summitLight=new THREE.PointLight(0xffd28b,14,18,2);summitLight.position.set(cx,topY+4,cz);root.add(summitLight);
    const chandelier=add(new THREE.TorusGeometry(1.15,.07,8,24),MAT.brass,cx,topY+3.7,cz);chandelier.rotation.x=Math.PI/2;

    const wanted=[26,35,103,164,4552,16457,829,159].map(id=>books.find(book=>book.id===id)).filter(Boolean);
    wanted.forEach((book,index)=>{
      const a=-Math.PI*.72+index/(Math.max(1,wanted.length-1))*Math.PI*1.44,r=2.65,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;
      const lectern=box(.82,1.02,.62,MAT.wood,x,topY+.51,z);lectern.rotation.y=-a+Math.PI/2;
      const bm=add(new THREE.BoxGeometry(.82,1.08,.14),new THREE.MeshStandardMaterial({map:coverTexture(book),roughness:.68}),x,topY+1.18,z);bm.rotation.order='YXZ';bm.rotation.y=-a+Math.PI/2;bm.rotation.x=-.43;bm.userData={type:'book',book,loaded:true,home:{position:bm.position.clone(),quaternion:bm.quaternion.clone(),parent:root}};interactables.push(bm);topBooks.push(bm)
    });
    const summitTitleTex=canvasTexture((ctx,w,h)=>{ctx.fillStyle='#17100b';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#c69a50';ctx.lineWidth=10;ctx.strokeRect(8,8,w-16,h-16);ctx.fillStyle='#edd9a6';ctx.textAlign='center';ctx.font='bold 38px Georgia';ctx.fillText('THE LAST LANDING',w/2,54);ctx.font='italic 22px Georgia';ctx.fillText('books for looking down, looking up, and looking beyond',w/2,91)},760,112);
    const summitTitle=add(new THREE.PlaneGeometry(3.8,.56),new THREE.MeshStandardMaterial({map:summitTitleTex,roughness:.75}),cx,topY+2.1,cz-4.72);summitTitle.userData={type:'high-stair-inscription',title:'The Last Landing',author:'The catalogue calls this the top. The staircase disagrees.',action:'READ'};interactables.push(summitTitle);

    // The return route is a full-height, illuminated door rather than an implied walk
    // back onto the spiral. It returns directly to the western wing for clarity.
    const summitExitData={type:'summit-library-exit',title:'Down to the Library',author:'An illuminated brass plate promises a mercifully abbreviated descent.',action:'DESCEND'};
    const summitExit=box(2.3,3.7,.22,MAT.darkWood,cx-4.63,topY+1.85,cz);summitExit.rotation.y=Math.PI/2;summitExit.userData=summitExitData;interactables.push(summitExit);
    for(const zz of [-1.28,1.28])box(.2,4.05,.3,MAT.brass,cx-4.65,topY+2.02,cz+zz);
    const exitLintel=box(.22,.2,2.75,MAT.brass,cx-4.65,topY+4.02,cz);exitLintel.userData=summitExitData;interactables.push(exitLintel);
    const summitExitTex=canvasTexture((ctx,w,h)=>{ctx.fillStyle='#24170d';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#d7ae60';ctx.lineWidth=10;ctx.strokeRect(7,7,w-14,h-14);ctx.fillStyle='#ffe2a0';ctx.textAlign='center';ctx.font='bold 34px Georgia';ctx.fillText('DOWN TO THE LIBRARY',w/2,49)},620,72);
    const summitExitSign=add(new THREE.PlaneGeometry(2.5,.3),new THREE.MeshStandardMaterial({map:summitExitTex,emissive:0x6b461e,emissiveIntensity:.45}),cx-4.76,topY+3.35,cz);summitExitSign.rotation.y=Math.PI/2;summitExitSign.userData=summitExitData;interactables.push(summitExitSign);
    const summitExitGlow=new THREE.PointLight(0xffbd72,14,8,2);summitExitGlow.position.set(cx-3.65,topY+2.8,cz);root.add(summitExitGlow);

    function primitiveRocket(x,y,z,type,title,author){
      const rocket=new THREE.Group(),interactiveParts=[],rocketData={type,title,author,action:'BOARD'};rocket.position.set(x,y,z);root.add(rocket);
      const part=(geometry,material,px,py,pz)=>{const m=new THREE.Mesh(geometry,material);m.position.set(px,py,pz);rocket.add(m);return m};
      const body=part(new THREE.CylinderGeometry(.7,.86,3.35,12),rocketMetal,0,2.05,0),nose=part(new THREE.ConeGeometry(.72,1.6,12),rocketRed,0,4.52,0),base=part(new THREE.CylinderGeometry(.9,.9,.16,12),MAT.brass,0,.38,0);interactiveParts.push(body,nose,base);
      for(const yy of [.7,1.55,2.4,3.25])part(new THREE.TorusGeometry(.77,.045,6,18),MAT.brass,0,yy,0).rotation.x=Math.PI/2;
      for(let i=0;i<3;i++){const a=i/3*Math.PI*2,fin=part(new THREE.BoxGeometry(.12,1.15,1.05),rocketRed,Math.cos(a)*.82,.75,Math.sin(a)*.82);fin.rotation.y=-a;interactiveParts.push(fin)}
      const hatch=part(new THREE.CircleGeometry(.42,18),new THREE.MeshStandardMaterial({color:0x172633,emissive:0x2d5871,emissiveIntensity:.45,metalness:.5,roughness:.25}),0,2.45,.72);interactiveParts.push(hatch);
      for(let i=0;i<16;i++){const a=i/16*Math.PI*2,rivet=part(new THREE.SphereGeometry(.035,6,4),MAT.brass,Math.cos(a)*.52,1.12,Math.sin(a)*.52);rivet.scale.y=.7}
      for(const xx of [-.39,.39]){const rail=part(new THREE.BoxGeometry(.055,1.75,.055),MAT.brass,xx,1.08,.91);rail.rotation.x=.1;interactiveParts.push(rail)}for(let i=0;i<5;i++)interactiveParts.push(part(new THREE.BoxGeometry(.82,.045,.055),MAT.brass,0,.48+i*.35,.98));
      for(const interactive of interactiveParts){interactive.userData=rocketData;interactables.push(interactive)}
      return rocket
    }
    const summitRocket=primitiveRocket(cx+1.15,topY,cz+.15,'moon-rocket-launch','The Librarian’s Lunar Projectile','Riveted by hand, steered by optimism, and supplied with one return ticket.');

    // A small lunar outpost: open sky, cratered ground and shelves of early speculative fiction.
    const moonFloor=cylinder(moonRadius,moonRadius,.5,64,lunarDust,mx,-.25,mz);
    for(let i=0;i<22;i++){const a=i*2.37,r=3.5+(i*7%13),size=.35+(i%5)*.17,rock=add(new THREE.SphereGeometry(size,9,6),stone,mx+Math.cos(a)*r,size*.25,mz+Math.sin(a)*r);rock.scale.y=.34}
    for(const [dx,dz,r] of [[-8,-5,2.4],[7,-6,1.7],[-10,7,1.3],[5,8,2.1]]){const rim=add(new THREE.TorusGeometry(r,.16,7,28),stone,mx+dx,.04,mz+dz);rim.rotation.x=Math.PI/2}
    const earth=add(new THREE.SphereGeometry(2.15,24,16),new THREE.MeshStandardMaterial({color:0x326a91,emissive:0x13283a,emissiveIntensity:.5,roughness:.82}),mx-10,18,mz-22);const earthCloud=add(new THREE.TorusGeometry(1.65,.16,8,32),new THREE.MeshBasicMaterial({color:0xdce8e6,transparent:true,opacity:.62}),mx-10,18,mz-22);earthCloud.rotation.x=.72;
    const moonDome=add(new THREE.SphereGeometry(8.2,32,16,0,Math.PI*2,0,Math.PI/2),new THREE.MeshPhysicalMaterial({color:0x758ca0,transparent:true,opacity:.17,roughness:.12,metalness:.18,side:THREE.DoubleSide}),mx,0,mz-3);
    const moonLight=new THREE.DirectionalLight(0xc8dcff,2.8);moonLight.position.set(mx-12,22,mz-14);root.add(moonLight);const outpostLight=new THREE.PointLight(0xffcf87,12,17,2);outpostLight.position.set(mx,4,mz-3);root.add(outpostLight);
    primitiveRocket(mx,0,mz+10,'moon-rocket-return','The return projectile','Its brass plate promises to put every reader back where the staircase left them.');
    // A small riveted cabin makes launch a journey rather than a teleport. The player
    // is boarded here for a countdown, ignition and a short flight in either direction.
    cylinder(3.1,3.1,.35,28,iron,tx,-.18,tz);const cabinWall=add(new THREE.CylinderGeometry(3.05,3.05,4.6,28,1,true),rocketMetal,tx,2.3,tz);cabinWall.material.side=THREE.BackSide;
    cylinder(3.1,3.1,.3,28,iron,tx,4.65,tz);for(let i=0;i<12;i++){const a=i/12*Math.PI*2;cylinder(.05,.05,4.1,8,MAT.brass,tx+Math.cos(a)*2.88,2.25,tz+Math.sin(a)*2.88)}
    const porthole=add(new THREE.CircleGeometry(.78,24),new THREE.MeshStandardMaterial({color:0x07101e,emissive:0x102544,emissiveIntensity:.7}),tx,2.65,tz-3.01);porthole.userData={type:'rocket-transit-window',title:'The rocket porthole',author:'Stars wait beyond the glass for the engine to remember which way is up.',action:'LOOK'};interactables.push(porthole);
    const countdownTex=canvasTexture((ctx,w,h)=>{ctx.fillStyle='#24170d';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#c69a50';ctx.lineWidth=10;ctx.strokeRect(8,8,w-16,h-16);ctx.fillStyle='#ead39d';ctx.textAlign='center';ctx.font='bold 34px Georgia';ctx.fillText('LUNAR POST · COUNTDOWN',w/2,50)},640,78);const countdownPlate=add(new THREE.PlaneGeometry(2.8,.36),new THREE.MeshStandardMaterial({map:countdownTex,roughness:.7}),tx,3.85,tz-3.02);countdownPlate.userData=porthole.userData;interactables.push(countdownPlate);
    const cabinLight=new THREE.PointLight(0xffb968,12,8,2);cabinLight.position.set(tx,3.4,tz);root.add(cabinLight);
    const moonSignTex=canvasTexture((ctx,w,h)=>{ctx.fillStyle='#161616';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#c39a52';ctx.lineWidth=11;ctx.strokeRect(8,8,w-16,h-16);ctx.fillStyle='#eee1b9';ctx.textAlign='center';ctx.font='bold 39px Georgia';ctx.fillText('THE SELENITE READING OUTPOST',w/2,56);ctx.font='italic 22px Georgia';ctx.fillText('Fictions sent ahead of their century',w/2,94)},820,116);
    const moonSign=add(new THREE.PlaneGeometry(4.9,.7),new THREE.MeshStandardMaterial({map:moonSignTex,roughness:.75}),mx,2.5,mz-10.8);moonSign.userData={type:'moon-sign',title:'The Selenite Reading Outpost',author:'The first librarians arrived several decades before the first astronauts.',action:'READ'};interactables.push(moonSign);
    const lunarCollection=[4552,16457,1013,1633,46547,10430,10005,69338,66510,62779,19103].map(id=>books.find(book=>book.id===id)).filter(Boolean);
    lunarCollection.forEach((book,index)=>{const col=index%4,row=Math.floor(index/4),x=mx-4.5+col*3,z=mz-3.8-row*2.8;const pedestal=cylinder(.62,.76,.92,10,MAT.darkWood,x,.46,z),bm=add(new THREE.BoxGeometry(.9,1.18,.15),new THREE.MeshStandardMaterial({map:coverTexture(book),roughness:.7}),x,1.2,z);bm.rotation.x=-.35;bm.userData={type:'book',book,loaded:true,home:{position:bm.position.clone(),quaternion:bm.quaternion.clone(),parent:root}};interactables.push(bm);moonBooks.push(bm)});

    const exitDoor=box(2.25,3.55,.2,MAT.darkWood,bottomX+1.55,1.78,bottomZ);exitDoor.rotation.y=Math.PI/2;exitDoor.userData={type:'high-stair-exit',title:'The door back to the western wing',author:'The brass handle is warm from the library below.',action:'RETURN'};interactables.push(exitDoor);

    function onMoon(x,z){return Math.hypot(x-mx,z-mz)<moonRadius+.4}
    function inTransit(x,z){return Math.hypot(x-tx,z-tz)<3.2}
    function contains(x,z){return Math.hypot(x-cx,z-cz)<14.2||onMoon(x,z)||inTransit(x,z)}
    function closestStep(x,z,y=player.pos.y){let nearest=null,best=Infinity;for(const step of stepPath){if(Math.abs(step.y-y)>1.35)continue;const d=(x-step.x)**2+(z-step.z)**2;if(d<best){best=d;nearest=step}}return best<1.08?nearest:null}
    function floorAt(x,z){if(onMoon(x,z)||inTransit(x,z))return 0;if(!contains(x,z))return null;const r=Math.hypot(x-cx,z-cz);if(r<4.85&&player.pos.y>topY-2)return topY;if(Math.hypot(x-bottomX,z-bottomZ)<2.7&&player.pos.y<2)return 0;return closestStep(x,z)?.y??null}
    function allowed(x,z){if(rocketTrip)return false;if(onMoon(x,z))return Math.hypot(x-mx,z-mz)<moonRadius-1;if(inTransit(x,z))return Math.hypot(x-tx,z-tz)<2.45;const radius=player.radius||.42,samples=[[0,0],[radius,0],[-radius,0],[0,radius],[0,-radius],[radius*.707,radius*.707],[-radius*.707,radius*.707],[radius*.707,-radius*.707],[-radius*.707,-radius*.707]];const summit=Math.hypot(x-cx,z-cz)<4.35&&player.pos.y>topY-2,bottom=Math.hypot(x-bottomX,z-bottomZ)<2.2&&player.pos.y<2;if(summit||bottom)return samples.every(([dx,dz])=>summit?Math.hypot(x+dx-cx,z+dz-cz)<4.48:Math.hypot(x+dx-bottomX,z+dz-bottomZ)<2.38);return samples.every(([dx,dz])=>!!closestStep(x+dx,z+dz))}
    function moveTo(x,y,z,yaw){player.pos.set(x,y,z);player.vel.set(0,0,0);player.yaw=yaw;player.pitch=0;lastSafePosition.copy(player.pos);camera.position.set(x,y+1.72,z);camera.rotation.set(0,yaw,0,'YXZ');camera.updateMatrixWorld()}
    function beginRocketTrip(direction){if(rocketTrip)return;moveTo(tx,0,tz+1.2,Math.PI);rocketTrip={direction,elapsed:0,stage:0};showNotice('The hatch seals. Launch in 3…',2);if(!playSample?.('doorOpen',.65,.9))sound(120,.5,'triangle',.08)}
    function interact(object){const type=object?.userData?.type;if(type==='high-stair-door'){moveTo(bottomX,0,bottomZ+1.25,-Math.PI/2);showNotice('The door shuts below you. The stair coils upward beyond the reach of its own lamplight.',7);if(!playSample?.('doorOpen',.9,.96))sound(92,1.1,'triangle',.15);localStorage.setItem('athenaeum-high-stair-discovered','1');return true}if(type==='high-stair-exit'||type==='summit-library-exit'){moveTo(entranceX,0,-11.15,0);showNotice(type==='summit-library-exit'?'The marked door folds thirty impossible floors into one quiet step. The western wing is waiting.':'The western wing receives you at the same hour you left it.',5);if(!playSample?.('doorOpen',.9,1))sound(145,.7,'triangle',.1);return true}if(type==='high-stair-inscription'){showNotice('The catalogue calls this the top. A narrow continuation vanishes into the dome, proving the catalogue optimistic.',7);sound(523,.7,'sine',.07);return true}if(type==='moon-rocket-launch'){beginRocketTrip('moon');return true}if(type==='moon-rocket-return'){beginRocketTrip('summit');return true}if(type==='rocket-transit-window'){showNotice(rocketTrip?'The stars move with unnerving deliberation beyond the riveted glass.':'The porthole reflects an empty cabin awaiting its next impossible journey.',5);return true}if(type==='moon-sign'){showNotice('Only books that imagined other worlds before anyone could reach them are admitted here.',6);return true}return false}
    function update(time,dt=.016){for(const item of animatedLights)item.light.intensity=5.3+Math.sin(time*2.1+item.phase)*.8;summitLight.intensity=13+Math.sin(time*.7)*1.2;outpostLight.intensity=11+Math.sin(time*.8)*1.1;earth.rotation.y=time*.025;if(rocketTrip){rocketTrip.elapsed+=dt;const e=rocketTrip.elapsed;if(e>=1&&rocketTrip.stage===0){rocketTrip.stage=1;showNotice('2…',1)}else if(e>=2&&rocketTrip.stage===1){rocketTrip.stage=2;showNotice('1…',1)}else if(e>=3&&rocketTrip.stage===2){rocketTrip.stage=3;showNotice('IGNITION — the cabin shudders and the library falls away.',3);if(!playSample?.('rocketLaunch',1,.94))sound(48,2.4,'sawtooth',.13)}else if(e>=5.7&&rocketTrip.stage===3){rocketTrip.stage=4;showNotice(rocketTrip.direction==='moon'?'Earth fills the porthole, then becomes small enough to shelve.':'The library roof appears below, exactly where space ought to be.',3)}else if(e>=8.5){const direction=rocketTrip.direction;rocketTrip=null;if(direction==='moon'){moveTo(mx,0,mz+6,Math.PI);showNotice('The engine coughs into silence. The Moon is waiting outside.',6);localStorage.setItem('athenaeum-moon-visited','1');window.libraryAnalytics?.track('Room Explored',{room:'selenite-outpost'})}else{moveTo(cx-1.3,topY,cz+1.6,Math.PI);showNotice('The hatch opens onto the Last Landing. According to the clock below, no time has passed.',6)}}}const moonActive=onMoon(player.pos.x,player.pos.z)||inTransit(player.pos.x,player.pos.z);if(moonActive){scene.background.setHex(0x03050b);scene.fog.color.setHex(0x070910);scene.fog.density=.004}const r=Math.hypot(player.pos.x-cx,player.pos.z-cz);if(r<5&&player.pos.y>topY-1&&!localStorage.getItem('athenaeum-high-stair-summit')){localStorage.setItem('athenaeum-high-stair-summit','1');showNotice('The Last Landing: a reading room above the roof, beneath a sky the library keeps for itself.',7);window.libraryAnalytics?.track('Room Explored',{room:'last-landing'})}}
    function reset(){root.visible=true;rocketTrip=null}
    return {contains,floorAt,allowed,interact,update,reset,onMoon,center:{x:cx,z:cz},topY,topBooks,moonBooks};
  };
})();
