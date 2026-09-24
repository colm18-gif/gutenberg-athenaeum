(function(){
  'use strict';

  window.createHighStaircase=function(options){
    const {THREE,scene,MAT,player,camera,interactables,books,coverTexture,canvasTexture,showNotice:gameNotice,sound,playSample,lastSafePosition,modelTemplate,isLowBandwidth,isReducedMotion=()=>false}=options;
    // During a flight only the rocket's own messages reach the screen; the game asks noticeAllowed() first.
    let speaking=false;function showNotice(text,seconds){speaking=true;try{gameNotice(text,seconds)}finally{speaking=false}}
    const root=new THREE.Group();root.name='the-impossible-stair';scene.add(root);
    const cx=224,cz=30,topY=30,steps=180,turns=3.2,outerRadius=12,innerRadius=4.35,mx=340,mz=30,moonRadius=18,tx=380,tz=30;
    const stepPath=[],topBooks=[],moonBooks=[],animatedLights=[];let rocketTrip=null,rocketBoarded=null,lastSpaceTone=-30,hallStarField=null;
    const stone=new THREE.MeshStandardMaterial({color:0x302d30,roughness:.96}),iron=new THREE.MeshStandardMaterial({color:0x151516,metalness:.62,roughness:.5}),blueGlass=new THREE.MeshPhysicalMaterial({color:0x26384d,transparent:true,opacity:.42,roughness:.08}),night=new THREE.MeshBasicMaterial({color:0x080b16,side:THREE.BackSide}),lunarDust=new THREE.MeshStandardMaterial({color:0x8b8982,roughness:1}),rocketMetal=new THREE.MeshStandardMaterial({color:0x706c61,metalness:.72,roughness:.48}),rocketRed=new THREE.MeshStandardMaterial({color:0x6c2421,metalness:.28,roughness:.7});
    const add=(geometry,material,x,y,z,parent=root)=>{const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.castShadow=false;mesh.receiveShadow=false;parent.add(mesh);return mesh};
    const box=(w,h,d,material,x,y,z,parent=root)=>add(new THREE.BoxGeometry(w,h,d),material,x,y,z,parent);
    const cylinder=(rt,rb,h,segments,material,x,y,z,parent=root)=>add(new THREE.CylinderGeometry(rt,rb,h,segments),material,x,y,z,parent);
    function celestialDoorDetails(parent,x,y,z,sideways=false){for(const py of [-.92,.62]){const panel=box(sideways?.06:1.85,1.12,sideways?1.85:.06,MAT.wood2,x,y+py,z,parent);const trim=box(sideways?.08:2.08,1.3,sideways?2.08:.08,MAT.brass,x+(sideways?-.13:0),y+py,z+(sideways?0:.13),parent)}const star=add(new THREE.TorusGeometry(.34,.055,7,18),MAT.brass,x+(sideways?-.15:0),y+1.48,z+(sideways?0:.16),parent);star.rotation.y=sideways?Math.PI/2:0;for(let i=0;i<8;i++){const ray=box(sideways?.04:.045,.36,sideways?.36:.04,MAT.brass,x+(sideways?-.16:Math.sin(i*Math.PI/4)*.42),y+1.48+Math.cos(i*Math.PI/4)*.42,z+(sideways?Math.sin(i*Math.PI/4)*.42:.17),parent);ray.rotation[sideways?'x':'z']=i*Math.PI/4}}

    // The entrance is deliberately ordinary in scale; the impossible height is hidden behind it.
    const entranceX=-33.5,entranceZ=-13.58;
    const entrance=new THREE.Group();entrance.position.set(entranceX,0,entranceZ);scene.add(entrance);
    const door=box(2.7,4.35,.24,MAT.darkWood,0,2.18,0,entrance);door.userData={type:'high-stair-door',title:'The stair that is not on the plan',author:'A brass plate reads: ASCENTS, DISTANCES & IMPOSSIBLE HEIGHTS.',action:'ASCEND'};interactables.push(door);
    celestialDoorDetails(entrance,0,2.18,0);
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
    // The repeated stair parts share three geometries and three draw calls.
    const railCount=Math.ceil(steps/4)*2,treads=new THREE.InstancedMesh(new THREE.BoxGeometry(1.42,.24,1.62),MAT.wood,steps),posts=new THREE.InstancedMesh(new THREE.CylinderGeometry(.055,.07,1.05,8),iron,steps*2),rails=new THREE.InstancedMesh(new THREE.BoxGeometry(.09,.09,2.12),iron,railCount),stairPart=new THREE.Object3D();
    for(const batch of [treads,posts,rails]){batch.castShadow=false;batch.receiveShadow=false;root.add(batch)}
    let postIndex=0,railIndex=0;
    for(let i=0;i<steps;i++){
      const p=i/(steps-1),a=bottomAngle+p*turns*Math.PI*2,r=outerRadius+(innerRadius-outerRadius)*p,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r,y=p*topY;
      stepPath.push({x,z,y,a});
      stairPart.position.set(x,y-.12,z);stairPart.rotation.set(0,-a,0);stairPart.updateMatrix();treads.setMatrixAt(i,stairPart.matrix);
      const innerR=r-.94,outerR=r+.94;
      for(const rr of [innerR,outerR]){
        stairPart.position.set(cx+Math.cos(a)*rr,y+.48,cz+Math.sin(a)*rr);stairPart.rotation.set(0,0,0);stairPart.updateMatrix();posts.setMatrixAt(postIndex++,stairPart.matrix);
      }
      if(i%4===0){
        for(const rr of [innerR,outerR]){stairPart.position.set(cx+Math.cos(a)*rr,y+1,cz+Math.sin(a)*rr);stairPart.rotation.set(0,-a,-Math.atan2(topY/(steps-1)*4,4*.9));stairPart.updateMatrix();rails.setMatrixAt(railIndex++,stairPart.matrix)}
      }
      if(i%15===0){const lamp=cylinder(.18,.25,.34,10,MAT.brass,cx+Math.cos(a)*(r+1.25),y+.82,cz+Math.sin(a)*(r+1.25));const glow=new THREE.PointLight(0xe5ad67,5.8,7,2);glow.position.set(lamp.position.x,y+1.2,lamp.position.z);root.add(glow);animatedLights.push({light:glow,phase:i*.43})}
    }
    treads.instanceMatrix.needsUpdate=posts.instanceMatrix.needsUpdate=rails.instanceMatrix.needsUpdate=true;

    // The summit is a generous observatory-scale Rocket Hall: the projectile is a
    // destination at its centre, with a complete circular route around it.
    cylinder(9.45,9.45,.38,64,MAT.wood,cx,topY-.19,cz);
    const rugTex=canvasTexture((ctx,w,h)=>{ctx.fillStyle='#201329';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#b58b4a';ctx.lineWidth=16;ctx.beginPath();ctx.arc(w/2,h/2,w*.4,0,Math.PI*2);ctx.stroke();ctx.lineWidth=4;for(let i=0;i<16;i++){const a=i/16*Math.PI*2;ctx.beginPath();ctx.moveTo(w/2+Math.cos(a)*w*.15,h/2+Math.sin(a)*h*.15);ctx.lineTo(w/2+Math.cos(a)*w*.36,h/2+Math.sin(a)*h*.36);ctx.stroke()}},512,512);
    const summitRug=add(new THREE.RingGeometry(2.25,7.1,64),new THREE.MeshStandardMaterial({map:rugTex,roughness:.92,side:THREE.DoubleSide}),cx,topY+.012,cz);summitRug.rotation.x=-Math.PI/2;
    for(let i=0;i<14;i++){if(i===7)continue;const a=i/14*Math.PI*2,r=8.75,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r,shelf=box(3.35,4.15,.5,MAT.darkWood,x,topY+2.08,z);shelf.rotation.y=-a+Math.PI/2;for(const yy of [topY+.52,topY+1.62,topY+2.72,topY+3.82]){const ledge=box(3.25,.1,.58,MAT.brass,x,yy,z);ledge.rotation.y=shelf.rotation.y}}
    const dome=add(new THREE.SphereGeometry(9.72,48,24,0,Math.PI*2,0,Math.PI/2),blueGlass,cx,topY,cz);dome.material.side=THREE.DoubleSide;
    const ribMaterial=new THREE.MeshStandardMaterial({color:0x26282b,metalness:.72,roughness:.4});for(let i=0;i<12;i++){const rib=add(new THREE.TorusGeometry(9.5,.055,6,54,Math.PI/2),ribMaterial,cx,topY,cz);rib.rotation.y=i/12*Math.PI*2;rib.rotation.z=Math.PI/2}
    const hallStars=new THREE.BufferGeometry(),hallStarPositions=[];for(let i=0;i<260;i++){const a=Math.random()*Math.PI*2,r=5.8+Math.random()*3.1,y=topY+4.3+Math.random()*4.5;hallStarPositions.push(cx+Math.cos(a)*r,y,cz+Math.sin(a)*r)}hallStars.setAttribute('position',new THREE.Float32BufferAttribute(hallStarPositions,3));hallStarField=new THREE.Points(hallStars,new THREE.PointsMaterial({color:0xc9dcff,size:.075,transparent:true,opacity:.72,depthWrite:false}));root.add(hallStarField);
    const summitLight=new THREE.PointLight(0xffd28b,13,23,2);summitLight.position.set(cx,topY+5.6,cz);root.add(summitLight);
    const chandelier=add(new THREE.TorusGeometry(1.65,.07,8,32),MAT.brass,cx,topY+5.1,cz);chandelier.rotation.x=Math.PI/2;
    const astronomyWindow=add(new THREE.CircleGeometry(1.65,32),new THREE.MeshStandardMaterial({color:0x07101d,emissive:0x183b66,emissiveIntensity:.8,roughness:.2}),cx+4.8,topY+3.8,cz-8.86);const astronomyRim=add(new THREE.TorusGeometry(1.72,.12,10,36),MAT.brass,cx+4.8,topY+3.8,cz-8.82);for(let i=0;i<18;i++){const a=i*2.399,r=.25+(i%5)*.24,star=add(new THREE.SphereGeometry(.025+(i%3)*.008,6,4),new THREE.MeshBasicMaterial({color:0xdceaff}),cx+4.8+Math.cos(a)*r,topY+3.8+Math.sin(a)*r,cz-8.75);star.userData.astronomicalStar=true}

    const wanted=[26,35,103,164,4552,16457,829,159].map(id=>books.find(book=>book.id===id)).filter(Boolean);
    wanted.forEach((book,index)=>{
      const a=-Math.PI*.72+index/(Math.max(1,wanted.length-1))*Math.PI*1.44,r=6.15,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;
      const lectern=box(.82,1.02,.62,MAT.wood,x,topY+.51,z);lectern.rotation.y=-a+Math.PI/2;
      const bm=add(new THREE.BoxGeometry(.82,1.08,.14),new THREE.MeshStandardMaterial({map:coverTexture(book),roughness:.68}),x,topY+1.18,z);bm.rotation.order='YXZ';bm.rotation.y=-a+Math.PI/2;bm.rotation.x=-.43;bm.userData={type:'book',book,loaded:true,home:{position:bm.position.clone(),quaternion:bm.quaternion.clone(),parent:root}};interactables.push(bm);topBooks.push(bm)
    });
    const summitTitleTex=canvasTexture((ctx,w,h)=>{ctx.fillStyle='#17100b';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#c69a50';ctx.lineWidth=10;ctx.strokeRect(8,8,w-16,h-16);ctx.fillStyle='#edd9a6';ctx.textAlign='center';ctx.font='bold 38px Georgia';ctx.fillText('THE ROCKET HALL',w/2,54);ctx.font='italic 22px Georgia';ctx.fillText('books for looking down, looking up, and looking beyond',w/2,91)},760,112);
    const summitTitle=add(new THREE.PlaneGeometry(4.8,.7),new THREE.MeshStandardMaterial({map:summitTitleTex,roughness:.75}),cx-1.4,topY+2.4,cz-9.12);summitTitle.userData={type:'high-stair-inscription',title:'The Rocket Hall',author:'The catalogue calls this the top. The staircase and the observatory both disagree.',action:'READ'};interactables.push(summitTitle);

    // A small brass-railed observing platform leaves the circular route open.
    const platformX=cx+6.25,platformZ=cz+4.85;box(4.15,.42,3.35,MAT.wood,platformX,topY+.21,platformZ);for(const [dx,dz] of [[-1.9,-1.45],[1.9,-1.45],[-1.9,1.45],[1.9,1.45]])cylinder(.055,.065,1.08,8,MAT.brass,platformX+dx,topY+.75,platformZ+dz);for(const dz of [-1.45,1.45])box(4,.075,.075,MAT.brass,platformX,topY+1.26,platformZ+dz);box(2.9,.2,1.25,MAT.darkWood,platformX,topY+1.18,platformZ);for(const dx of [-1.2,1.2])for(const dz of [-.45,.45])box(.16,1.12,.16,MAT.wood,platformX+dx,topY+.58,platformZ+dz);
    const consoleData={type:'rocket-interior-detail',title:'The vintage spacecraft instrument',author:'Its restrained needles track altitude, aether pressure, and the reader’s distance from the plausible.',action:'INSPECT'},consoleFallback=[box(2.1,1.2,.8,rocketMetal,platformX,topY+1.82,platformZ)];consoleFallback[0].userData=consoleData;interactables.push(consoleFallback[0]);for(let i=0;i<4;i++){const gauge=add(new THREE.CircleGeometry(.14,16),new THREE.MeshStandardMaterial({color:0xd8c89c,roughness:.72}),platformX-.62+i*.42,topY+1.94,platformZ-.41);gauge.rotation.x=-.08;gauge.userData=consoleData;interactables.push(gauge);consoleFallback.push(gauge)}
    if(modelTemplate&&!isLowBandwidth?.())modelTemplate('assets/polyhaven/models/vintage_spacecraft_instrument/vintage_spacecraft_instrument_1k.gltf').then(template=>{const model=template.clone(true),bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),scale=1.25/Math.max(size.y,.001);model.scale.setScalar(scale);model.updateMatrixWorld(true);const fitted=new THREE.Box3().setFromObject(model),center=fitted.getCenter(new THREE.Vector3());model.position.set(platformX-center.x,topY+1.28-fitted.min.y,platformZ-center.z);model.rotation.y=Math.PI;model.traverse(node=>{if(node.isMesh){node.castShadow=false;node.receiveShadow=false;node.userData=consoleData;interactables.push(node)}});consoleFallback.forEach(part=>part.visible=false);root.add(model)}).catch(()=>{});

    // The return route is a full-height, illuminated door rather than an implied walk
    // back onto the spiral. It returns directly to the western wing for clarity.
    const summitExitData={type:'summit-library-exit',title:'Down to the Library',author:'An illuminated brass plate promises a mercifully abbreviated descent.',action:'DESCEND'};
    const summitExit=box(2.3,3.7,.22,MAT.darkWood,cx-9.15,topY+1.85,cz);summitExit.rotation.y=Math.PI/2;summitExit.userData=summitExitData;interactables.push(summitExit);
    celestialDoorDetails(root,cx-9.15,topY+1.85,cz,true);
    for(const zz of [-1.28,1.28])box(.2,4.05,.3,MAT.brass,cx-9.17,topY+2.02,cz+zz);
    const exitLintel=box(.22,.2,2.75,MAT.brass,cx-9.17,topY+4.02,cz);exitLintel.userData=summitExitData;interactables.push(exitLintel);
    const summitExitTex=canvasTexture((ctx,w,h)=>{ctx.fillStyle='#24170d';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#d7ae60';ctx.lineWidth=10;ctx.strokeRect(7,7,w-14,h-14);ctx.fillStyle='#ffe2a0';ctx.textAlign='center';ctx.font='bold 34px Georgia';ctx.fillText('DOWN TO THE LIBRARY',w/2,49)},620,72);
    const summitExitSign=add(new THREE.PlaneGeometry(2.5,.3),new THREE.MeshStandardMaterial({map:summitExitTex,emissive:0x6b461e,emissiveIntensity:.45}),cx-9.28,topY+3.35,cz);summitExitSign.rotation.y=Math.PI/2;summitExitSign.userData=summitExitData;interactables.push(summitExitSign);
    const summitExitGlow=new THREE.PointLight(0xffbd72,12,8,2);summitExitGlow.position.set(cx-8.05,topY+2.8,cz);root.add(summitExitGlow);

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
    cylinder(3.1,3.1,.3,28,iron,tx,4.65,tz);for(let i=0;i<12;i++){if(i===9)continue;/* keep the porthole clear */const a=i/12*Math.PI*2;cylinder(.05,.05,4.1,8,MAT.brass,tx+Math.cos(a)*2.88,2.25,tz+Math.sin(a)*2.88)}
    const windowTexture=canvasTexture((c,w,h)=>{c.fillStyle='#07101e';c.fillRect(0,0,w,h)},256,256);
    const porthole=add(new THREE.CircleGeometry(.98,32),new THREE.MeshStandardMaterial({map:windowTexture,emissive:0x102544,emissiveIntensity:.45,side:THREE.DoubleSide}),tx,2.65,tz-2.78);
    function paintJourneyWindow(stage){const c=windowTexture.image.getContext('2d'),w=256;c.fillStyle='#07101e';c.fillRect(0,0,w,w);for(let i=0;i<48;i++){const x=(i*83+17)%w,y=(i*151+37)%w,r=1+i%3;c.fillStyle=i%4?'#c8d2dc':'#f6dfa8';c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill()}if(stage>=3){const radius=stage===3?76:stage===4?48:23;c.fillStyle=rocketBoarded==='moon'?'#3d7292':'#a7a29a';c.beginPath();c.arc(stage===3?155:173,176,radius,0,Math.PI*2);c.fill();c.fillStyle='rgba(247,240,213,.23)';c.beginPath();c.arc(153,156,radius*.5,0,Math.PI*2);c.fill()}windowTexture.needsUpdate=true}porthole.userData={type:'rocket-transit-window',title:'The rocket porthole',author:'Stars wait beyond the glass for the engine to remember which way is up.',action:'LOOK'};interactables.push(porthole);
    const countdownTex=canvasTexture((ctx,w,h)=>{ctx.fillStyle='#24170d';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#c69a50';ctx.lineWidth=10;ctx.strokeRect(8,8,w-16,h-16);ctx.fillStyle='#ead39d';ctx.textAlign='center';ctx.font='bold 34px Georgia';ctx.fillText('LUNAR POST · COUNTDOWN',w/2,50)},640,78);const countdownPlate=add(new THREE.PlaneGeometry(2.1,.27),new THREE.MeshStandardMaterial({map:countdownTex,roughness:.7}),tx,3.85,tz-2.76);countdownPlate.userData=porthole.userData;interactables.push(countdownPlate);
    const cabinDetail=(mesh,title,author,action='EXAMINE')=>{mesh.userData={type:'rocket-interior-detail',title,author,action};interactables.push(mesh);return mesh},cabinLeather=new THREE.MeshStandardMaterial({color:0x4b1d1b,roughness:.82}),gaugeFace=new THREE.MeshStandardMaterial({color:0xd8c89c,roughness:.72}),pipeMetal=new THREE.MeshStandardMaterial({color:0x7d5b2c,metalness:.7,roughness:.36}),cabinGlow=new THREE.MeshStandardMaterial({color:0xe8ba68,emissive:0xc77a28,emissiveIntensity:2.2,roughness:.72});
    // The projectile interior is a compact Victorian reading cabin rather than an empty shell.
    for(const side of [-1,1]){const bench=box(.58,.7,2.35,cabinLeather,tx+side*2.35,.5,tz+.45);cabinDetail(bench,'A buttoned launch couch','Horsehair padding, library-red leather, and straps labelled PLEASE REMAIN SEATED DURING GRAVITY.','SIT');for(const z of [tz-.5,tz+.2,tz+.9]){const button=cylinder(.035,.035,.04,8,MAT.brass,tx+side*2.04,.62,z);button.rotation.z=Math.PI/2}}
    const consoleTop=box(2.7,.22,.72,MAT.darkWood,tx,1.18,tz-2.45);consoleTop.rotation.x=-.18;cabinDetail(consoleTop,'The lunar navigation desk','Its brass instructions read: aim for the brightest impossible destination, then pull gently.');
    for(let i=0;i<5;i++){const gx=tx-1.02+i*.51,gauge=add(new THREE.CircleGeometry(.19,16),gaugeFace,gx,1.62,tz-2.78);gauge.rotation.x=-.12;cabinDetail(gauge,['Altitude','Aether pressure','Narrative velocity','Tea temperature','Return likelihood'][i],['The needle insists the library is thirty floors below and immediately adjacent.','The dial has regions marked CALM, VERNE, and UNWISE.','Currently measured in chapters per second.','Too cold. It has apparently been too cold since 1897.','The scale runs from PROBABLY to EVENTUALLY.'][i],'READ')}
    for(const x of [tx-.72,tx,tx+.72]){const lever=cylinder(.055,.055,.62,8,MAT.brass,x,1.28,tz-2.18);lever.rotation.x=.62;const grip=cylinder(.12,.12,.24,10,rocketRed,x,1.52,tz-1.98);grip.rotation.x=Math.PI/2}
    const startButton=add(new THREE.CylinderGeometry(.19,.19,.15,16),new THREE.MeshStandardMaterial({color:0xb33426,emissive:0x5c100b,emissiveIntensity:.35,roughness:.45}),tx+.72,1.37,tz-2.05);startButton.userData={type:'rocket-start',title:'The red launch button',author:'Press only after boarding; the engines will answer with a full countdown.',action:'PRESS · LAUNCH'};interactables.push(startButton);
    const cabinExit=box(.58,.68,.12,MAT.brass,tx-2.7,1.1,tz+1.4);cabinExit.userData={type:'rocket-cabin-exit',title:'The cabin hatch',author:'You may leave the projectile before the launch begins.',action:'EXIT HATCH'};interactables.push(cabinExit);
    const chartTex=canvasTexture((ctx,w,h)=>{ctx.fillStyle='#101827';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#b99653';ctx.lineWidth=3;for(let i=0;i<26;i++){const x=24+(i*83)%w,y=18+(i*47)%h,r=2+i%4;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle='#e5d7aa';ctx.fill();if(i>0){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(24+((i-1)*83)%w,18+((i-1)*47)%h);ctx.stroke()}}ctx.font='bold 24px Georgia';ctx.textAlign='center';ctx.fillStyle='#d8bd78';ctx.fillText('A PRACTICAL CHART OF IMPRACTICAL ORBITS',w/2,h-18)},620,330);
    const starChart=add(new THREE.PlaneGeometry(2.35,1.25),new THREE.MeshStandardMaterial({map:chartTex,roughness:.85}),tx-2.78,2.55,tz);starChart.rotation.y=Math.PI/2;cabinDetail(starChart,'A hand-drawn lunar chart','Several routes are crossed out. One travels through a footnote.','STUDY');
    const locker=box(.45,1.65,1.55,MAT.darkWood,tx+2.68,2.05,tz);cabinDetail(locker,'The secured travelling library','A brass grille protects slim volumes by Verne, Wells, Kepler, and de Bergerac. A note says: OPEN ONLY BETWEEN WORLDS.','INSPECT');for(let i=0;i<6;i++){const volume=box(.12,.72,.18,[rocketRed,MAT.green,MAT.wood,MAT.brass][i%4],tx+2.42,1.55+i%2*.76,tz-.52+Math.floor(i/2)*.48);volume.rotation.z=(i%3-1)*.05}
    for(const side of [-1,1]){const pipe=cylinder(.07,.07,3.35,8,pipeMetal,tx+side*2.72,2.15,tz+1.1);for(const y of [.65,2.1,3.6]){const collar=cylinder(.11,.11,.12,10,MAT.brass,tx+side*2.72,y,tz+1.1);collar.scale.y=.55}}
    const compass=add(new THREE.TorusGeometry(.72,.045,8,32),MAT.brass,tx,.025,tz+.15);compass.rotation.x=Math.PI/2;for(let i=0;i<8;i++){const spoke=box(.035,.018,.62,MAT.brass,tx,.035,tz+.15);spoke.rotation.y=i*Math.PI/4}
    const lampRing=add(new THREE.TorusGeometry(.48,.055,8,20),MAT.brass,tx,4.08,tz+.25);lampRing.rotation.x=Math.PI/2;for(let i=0;i<6;i++){const a=i/6*Math.PI*2,bulb=add(new THREE.SphereGeometry(.09,10,6),cabinGlow,tx+Math.cos(a)*.48,4.02,tz+.25+Math.sin(a)*.48);cabinDetail(bulb,'An aether lamp','It brightens during launch, though no wire appears to reach it.','INSPECT')}
    const cabinLight=new THREE.PointLight(0xffb968,12,8,2);cabinLight.position.set(tx,3.4,tz);root.add(cabinLight);
    const moonSignTex=canvasTexture((ctx,w,h)=>{ctx.fillStyle='#161616';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#c39a52';ctx.lineWidth=11;ctx.strokeRect(8,8,w-16,h-16);ctx.fillStyle='#eee1b9';ctx.textAlign='center';ctx.font='bold 39px Georgia';ctx.fillText('THE SELENITE READING OUTPOST',w/2,56);ctx.font='italic 22px Georgia';ctx.fillText('Fictions sent ahead of their century',w/2,94)},820,116);
    const moonSign=add(new THREE.PlaneGeometry(4.9,.7),new THREE.MeshStandardMaterial({map:moonSignTex,roughness:.75}),mx,2.5,mz-10.8);moonSign.userData={type:'moon-sign',title:'The Selenite Reading Outpost',author:'The first librarians arrived several decades before the first astronauts.',action:'READ'};interactables.push(moonSign);
    const lunarCollection=[4552,16457,1013,1633,46547,10430,10005,69338,66510,62779,19103].map(id=>books.find(book=>book.id===id)).filter(Boolean);
    lunarCollection.forEach((book,index)=>{const col=index%4,row=Math.floor(index/4),x=mx-4.5+col*3,z=mz-3.8-row*2.8;const pedestal=cylinder(.62,.76,.92,10,MAT.darkWood,x,.46,z),bm=add(new THREE.BoxGeometry(.9,1.18,.15),new THREE.MeshStandardMaterial({map:coverTexture(book),roughness:.7}),x,1.2,z);bm.rotation.x=-.35;bm.userData={type:'book',book,loaded:true,home:{position:bm.position.clone(),quaternion:bm.quaternion.clone(),parent:root}};interactables.push(bm);moonBooks.push(bm)});

    const exitDoor=box(2.25,3.55,.2,MAT.darkWood,bottomX+1.55,1.78,bottomZ);exitDoor.rotation.y=Math.PI/2;exitDoor.userData={type:'high-stair-exit',title:'The door back to the western wing',author:'The brass handle is warm from the library below.',action:'RETURN'};interactables.push(exitDoor);

    function onMoon(x,z){return Math.hypot(x-mx,z-mz)<moonRadius+.4}
    function inTransit(x,z){return Math.hypot(x-tx,z-tz)<3.2}
    function contains(x,z){return Math.hypot(x-cx,z-cz)<14.2||onMoon(x,z)||inTransit(x,z)}
    function closestStep(x,z,y=player.pos.y){let nearest=null,best=Infinity;for(let i=0;i<stepPath.length-1;i++){const from=stepPath[i],to=stepPath[i+1],dx=to.x-from.x,dz=to.z-from.z,lengthSquared=dx*dx+dz*dz,u=Math.max(0,Math.min(1,((x-from.x)*dx+(z-from.z)*dz)/lengthSquared)),stepY=from.y+(to.y-from.y)*u;if(Math.abs(stepY-y)>1.35)continue;const stepX=from.x+dx*u,stepZ=from.z+dz*u,d=(x-stepX)**2+(z-stepZ)**2;if(d<best){best=d;nearest={x:stepX,z:stepZ,y:stepY,a:from.a+(to.a-from.a)*u,distance:Math.sqrt(d)}}}return best<.48*.48?nearest:null}
    function floorAt(x,z){if(onMoon(x,z)||inTransit(x,z))return 0;if(!contains(x,z))return null;const r=Math.hypot(x-cx,z-cz);if(r<9.4&&player.pos.y>topY-2)return topY;if(Math.hypot(x-bottomX,z-bottomZ)<2.7&&player.pos.y<2)return 0;return closestStep(x,z)?.y??null}
    function allowed(x,z){if(rocketTrip)return inTransit(x,z)&&Math.hypot(x-tx,z-tz)<2.45;if(onMoon(x,z))return Math.hypot(x-mx,z-mz)<moonRadius-1;if(inTransit(x,z))return Math.hypot(x-tx,z-tz)<2.45;const pathStep=closestStep(x,z);if(pathStep)return true;const radius=player.radius||.42,samples=[[0,0],[radius,0],[-radius,0],[0,radius],[0,-radius],[radius*.707,radius*.707],[-radius*.707,radius*.707],[radius*.707,-radius*.707],[-radius*.707,-radius*.707]];const summit=Math.hypot(x-cx,z-cz)<9.05&&player.pos.y>topY-2,bottom=Math.hypot(x-bottomX,z-bottomZ)<2.2&&player.pos.y<2;if(summit||bottom)return samples.every(([dx,dz])=>summit?Math.hypot(x+dx-cx,z+dz-cz)<9.08:Math.hypot(x+dx-bottomX,z+dz-bottomZ)<2.38);return false}
    function moveTo(x,y,z,yaw){player.pos.set(x,y,z);player.vel.set(0,0,0);player.yaw=yaw;player.pitch=0;lastSafePosition.copy(player.pos);camera.position.set(x,y+1.72,z);camera.rotation.set(0,yaw,0,'YXZ');camera.updateMatrixWorld()}
    function boardRocket(direction){if(rocketTrip)return;rocketBoarded=direction;moveTo(tx,0,tz+.35,0);player.pitch=.12;paintJourneyWindow(0);showNotice('The hatch closes behind you. The red launch button is on the navigation desk ahead, beneath the porthole. Press it to begin.',8);if(!playSample?.('doorOpen',.65,.9))sound(120,.5,'triangle',.08)}
    function beginRocketTrip(){if(rocketTrip||!rocketBoarded)return;rocketTrip={direction:rocketBoarded,elapsed:0,stage:0,nextRumble:6.3};flightHud.show(rocketBoarded);showNotice('LAUNCH SEQUENCE · 4…',2);if(!playSample?.('rocketLaunch',.25,.85))sound(80,.7,'sine',.06)}
    function interact(object){const type=object?.userData?.type;if(type==='high-stair-door'){moveTo(bottomX,0,bottomZ+1.25,Math.PI);showNotice('The door shuts below you. The first rising tread is directly ahead; follow the brass rail upward.',7);if(!playSample?.('doorOpen',.9,.96))sound(92,1.1,'triangle',.15);localStorage.setItem('athenaeum-high-stair-discovered','1');return true}if(type==='high-stair-exit'||type==='summit-library-exit'){moveTo(entranceX,0,-11.15,0);showNotice(type==='summit-library-exit'?'The marked door folds thirty impossible floors into one quiet step. The western wing is waiting.':'The western wing receives you at the same hour you left it.',5);if(!playSample?.('doorOpen',.9,1))sound(145,.7,'triangle',.1);return true}if(type==='high-stair-inscription'){showNotice('The catalogue calls this the top. A narrow continuation vanishes into the dome, proving the catalogue optimistic.',7);sound(523,.7,'sine',.07);return true}if(type==='moon-rocket-launch'){boardRocket('moon');return true}if(type==='moon-rocket-return'){boardRocket('summit');return true}if(type==='rocket-start'){beginRocketTrip();return true}if(type==='rocket-cabin-exit'){if(rocketTrip){showNotice('The hatch is sealed during flight.',4)}else if(rocketBoarded==='moon'){rocketBoarded=null;moveTo(cx+2,topY,cz+3,Math.PI);showNotice('You step back into the Rocket Hall. The projectile waits.',5)}else if(rocketBoarded){rocketBoarded=null;moveTo(mx,0,mz+7,Math.PI);showNotice('You step back beneath the lunar sky. The projectile waits.',5)}return true}if(type==='rocket-transit-window'){showNotice(rocketTrip?'The stars move with unnerving deliberation beyond the riveted glass.':'The porthole reflects an empty cabin awaiting its next impossible journey.',5);return true}if(type==='rocket-interior-detail'){showNotice(object.userData.author,7);sound(310,.12,'triangle',.035);return true}if(type==='moon-sign'){showNotice('Only books that imagined other worlds before anyone could reach them are admitted here.',6);return true}return false}
    // ---------- Making the flight read as a flight ----------
    // Thrust over the 25-second trip: countdown, hard ignition, cruise, then a braking descent.
    function thrustAt(e){if(e<4)return 0;if(e<9)return (e-4)/5;if(e<20)return 1;if(e<25)return .55-(e-20)*.08;return 0}
    function speedAt(e){if(e<4)return 0;if(e<12)return Math.pow((e-4)/8,1.6);if(e<18)return 1;if(e<25)return Math.max(.06,1-(e-18)/7);return 0}
    const streakStars=Array.from({length:70},(_,i)=>({x:(i*83+17)%256,y:(i*151+37)%256,r:.6+(i%3)*.55,warm:i%5===0}));
    function paintFlightWindow(trip,e,dt){
      const c=windowTexture.image.getContext('2d'),w=256,speed=speedAt(e),toMoon=trip.direction==='moon';
      const sky=c.createLinearGradient(0,0,0,w),lift=Math.min(1,Math.max(0,(e-4)/6));sky.addColorStop(0,'#040914');sky.addColorStop(1,lift<1?`rgba(${40-lift*33|0},${54-lift*44|0},${82-lift*62|0},1)`:'#070d1c');c.fillStyle=sky;c.fillRect(0,0,w,w);
      // Stars stream past the glass: still on the pad, long streaks at full speed.
      const travel=dt*speed*420,streak=2+speed*38;
      for(const star of streakStars){star.y+=travel*(.55+star.r*.35);if(star.y>w+streak){star.y-=w+streak;star.x=(star.x+97)%w}c.strokeStyle=star.warm?'rgba(246,223,168,.9)':'rgba(200,214,230,.9)';c.lineWidth=star.r;c.beginPath();c.moveTo(star.x,star.y);c.lineTo(star.x,star.y-streak*(.5+star.r*.4));c.stroke()}
      // The world left behind sinks away below; the destination swells from above.
      const leave=Math.min(1,Math.max(0,(e-4)/9)),origin=toMoon?'#3d7292':'#a7a29a',target=toMoon?'#b3aea3':'#3f7aa0';
      if(leave<1){const r=190*(1-leave)+10,cy=w+r*.72+leave*120;c.fillStyle=origin;c.beginPath();c.arc(w/2,cy,r,0,Math.PI*2);c.fill();if(toMoon){c.fillStyle='rgba(255,196,110,.8)';for(let i=0;i<9;i++){c.beginPath();c.arc(w/2-60+i*15,cy-r+6+(i%3)*3,1.6,0,Math.PI*2);c.fill()}}}
      const arrive=Math.min(1,Math.max(0,(e-13)/12));if(arrive>0){const r=8+Math.pow(arrive,2.2)*210,cy=-r*.35+arrive*(w*.55);c.fillStyle=target;c.beginPath();c.arc(w/2+18*(1-arrive),cy,r,0,Math.PI*2);c.fill();c.fillStyle='rgba(255,248,225,.18)';c.beginPath();c.arc(w/2+18*(1-arrive)-r*.28,cy-r*.28,r*.45,0,Math.PI*2);c.fill()}
      // Exhaust glow licks the lower rim while the engine burns.
      const burn=thrustAt(e);if(burn>0){const g=c.createRadialGradient(w/2,w+30,10,w/2,w+30,150);g.addColorStop(0,`rgba(255,170,70,${.55*burn})`);g.addColorStop(1,'rgba(255,120,40,0)');c.fillStyle=g;c.fillRect(0,0,w,w)}
      windowTexture.needsUpdate=true;
    }
    const flightHud=(()=>{
      let el=null;const phases=[[4,'COUNTDOWN'],[9,'IGNITION · CLIMBING'],[18,'CRUISING BETWEEN WORLDS'],[22,'BRAKING'],[25,'LANDING']];
      function ensure(){if(el)return el;el=document.createElement('div');el.id='flightHud';el.setAttribute('aria-live','off');el.innerHTML='<div class="flight-phase"></div><div class="flight-track"><span class="flight-from"></span><div class="flight-line"><i></i><b>▲</b></div><span class="flight-to"></span></div><div class="flight-readout"></div>';document.body.appendChild(el);return el}
      return {
        show(direction){const h=ensure();h.querySelector('.flight-from').textContent=direction==='moon'?'ROCKET HALL':'SELENITE OUTPOST';h.querySelector('.flight-to').textContent=direction==='moon'?'SELENITE OUTPOST':'ROCKET HALL';h.classList.add('active');document.body.classList.add('in-flight')},
        hide(){if(el)el.classList.remove('active');document.body.classList.remove('in-flight')},
        update(e){if(!el)return;const progress=Math.min(1,Math.max(0,(e-4)/21)),eased=progress*progress*(3-2*progress),phase=phases.find(([until])=>e<until)?.[1]||'LANDING';el.querySelector('.flight-phase').textContent=e<4?`LAUNCH IN ${Math.ceil(4-e)}`:phase;el.querySelector('.flight-line i').style.width=`${eased*100}%`;el.querySelector('.flight-line b').style.left=`${eased*100}%`;const miles=Math.round(eased*238900);el.querySelector('.flight-readout').textContent=e<4?'ALL READERS SEATED':`${miles.toLocaleString('en-GB')} MILES · ${Math.round(speedAt(e)*2400).toLocaleString('en-GB')} MPH`}
      };
    })();
    function flightMotion(trip,e,time){
      const dt=Math.min(.05,Math.max(0,e-(trip.lastE??e)));trip.lastE=e;
      paintFlightWindow(trip,e,dt);flightHud.update(e);
      // The cabin shudders hardest at ignition and on landing; Reduce motion keeps it still.
      const burn=thrustAt(e),shake=isReducedMotion()?0:(e>=4&&e<6.5?.045*(1-(e-4)/2.5)+.012:burn*.009+(e>21&&e<25?.012:0));
      if(shake>0){camera.position.x+=(Math.sin(time*63.1)+Math.sin(time*41.7))*.5*shake;camera.position.y+=(Math.sin(time*57.3)+Math.sin(time*29.9))*.5*shake;camera.updateMatrixWorld()}
      // The engine keeps roaring for as long as it burns, not only at ignition.
      if(e>=trip.nextRumble&&burn>.05){trip.nextRumble=e+2.3;if(!playSample?.('rocketLaunch',.35+burn*.45,.82+burn*.12))sound(46,2.3,'sawtooth',.05*burn)}
    }
    function update(time,dt=.016){
      const active=contains(player.pos.x,player.pos.z)||rocketTrip;if(!active)return;
      for(const item of animatedLights)item.light.intensity=5.3+Math.sin(time*2.1+item.phase)*.8;
      summitLight.intensity=13+Math.sin(time*.7)*1.2;outpostLight.intensity=11+Math.sin(time*.8)*1.1;earth.rotation.y=time*.025;if(hallStarField)hallStarField.rotation.y=time*.004;
      if(rocketTrip){rocketTrip.elapsed+=dt;const e=rocketTrip.elapsed;cabinLight.intensity=12+(e>4&&e<20?Math.sin(e*8)*2:0);flightMotion(rocketTrip,e,time);
        if(e>=1&&rocketTrip.stage===0){rocketTrip.stage=1;showNotice('3…',1)}
        else if(e>=2&&rocketTrip.stage===1){rocketTrip.stage=2;showNotice('2…',1)}
        else if(e>=3&&rocketTrip.stage===2){rocketTrip.stage=3;showNotice('1…',1)}
        else if(e>=4&&rocketTrip.stage===3){rocketTrip.stage=4;showNotice('IGNITION · the cabin shudders and the launch tower sinks below the porthole.',5);if(!playSample?.('rocketLaunch',1,.94))sound(48,2.4,'sawtooth',.13)}
        else if(e>=9&&rocketTrip.stage===4){rocketTrip.stage=5;showNotice('The engine settles into a steady roar. The library is now a patch of light far below.',5)}
        else if(e>=15&&rocketTrip.stage===5){rocketTrip.stage=6;showNotice(rocketTrip.direction==='moon'?'The Moon grows in the porthole. Rows of lamps appear beneath its dust.':'Earth fills the glass; the impossible staircase finds its roof again.',5)}
        else if(e>=20&&rocketTrip.stage===6){rocketTrip.stage=7;showNotice('Descent thrusters fire. The floor tilts gently as a landing place comes into view.',4)}
        else if(e>=25){const direction=rocketTrip.direction;rocketTrip=null;flightHud.hide();rocketBoarded=null;cabinLight.intensity=12;if(direction==='moon'){moveTo(mx,0,mz+6,Math.PI);showNotice('The landing legs settle. The hatch opens at the Selenite Reading Outpost.',7);localStorage.setItem('athenaeum-moon-visited','1');window.libraryAnalytics?.track('Room Explored',{room:'selenite-outpost'})}else{moveTo(cx-1.3,topY,cz+1.6,Math.PI);showNotice('The hatch opens onto the Rocket Hall. According to the clock below, no time has passed.',6)}}}
      const moonActive=onMoon(player.pos.x,player.pos.z)||inTransit(player.pos.x,player.pos.z);if(moonActive){scene.background.setHex(0x03050b);scene.fog.color.setHex(0x070910);scene.fog.density=.004}
      const r=Math.hypot(player.pos.x-cx,player.pos.z-cz),inHall=r<9.25&&player.pos.y>topY-1;if(inHall&&time-lastSpaceTone>18){lastSpaceTone=time;sound(64,2.6,'sine',.012)}
      if(inHall&&!localStorage.getItem('athenaeum-high-stair-summit')){localStorage.setItem('athenaeum-high-stair-summit','1');showNotice('The Rocket Hall: a glass-and-iron observatory above the roof, built around one impossible destination.',7);window.libraryAnalytics?.track('Room Explored',{room:'rocket-hall'})}
    }
    function reset(){root.visible=true;rocketTrip=null;rocketBoarded=null;flightHud.hide()}
    return {contains,floorAt,allowed,interact,update,reset,onMoon,noticeAllowed:()=>!rocketTrip||speaking,get inFlight(){return !!rocketTrip},center:{x:cx,z:cz},topY,topBooks,moonBooks};
  };
})();
