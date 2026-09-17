(function(){
  'use strict';

  window.createHighStaircase=function(options){
    const {THREE,scene,MAT,player,camera,interactables,books,coverTexture,canvasTexture,showNotice,sound,lastSafePosition}=options;
    const root=new THREE.Group();root.name='the-impossible-stair';scene.add(root);
    const cx=224,cz=30,topY=30,steps=180,turns=3.2,outerRadius=12,innerRadius=4.35,mx=340,mz=30,moonRadius=18;
    const stepPath=[],topBooks=[],moonBooks=[],animatedLights=[];
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

    function primitiveRocket(x,y,z,type,title,author){
      const rocket=new THREE.Group();rocket.position.set(x,y,z);root.add(rocket);
      const part=(geometry,material,px,py,pz)=>{const m=new THREE.Mesh(geometry,material);m.position.set(px,py,pz);rocket.add(m);return m};
      part(new THREE.CylinderGeometry(.7,.86,3.35,12),rocketMetal,0,2.05,0);part(new THREE.ConeGeometry(.72,1.6,12),rocketRed,0,4.52,0);part(new THREE.CylinderGeometry(.9,.9,.16,12),MAT.brass,0,.38,0);
      for(const yy of [.7,1.55,2.4,3.25])part(new THREE.TorusGeometry(.77,.045,6,18),MAT.brass,0,yy,0).rotation.x=Math.PI/2;
      for(let i=0;i<3;i++){const a=i/3*Math.PI*2,fin=part(new THREE.BoxGeometry(.12,1.15,1.05),rocketRed,Math.cos(a)*.82,.75,Math.sin(a)*.82);fin.rotation.y=-a}
      const hatch=part(new THREE.CircleGeometry(.42,18),new THREE.MeshStandardMaterial({color:0x172633,emissive:0x2d5871,emissiveIntensity:.45,metalness:.5,roughness:.25}),0,2.45,.72);hatch.userData={type,title,author,action:'BOARD'};interactables.push(hatch);
      for(let i=0;i<16;i++){const a=i/16*Math.PI*2,rivet=part(new THREE.SphereGeometry(.035,6,4),MAT.brass,Math.cos(a)*.52,1.12,Math.sin(a)*.52);rivet.scale.y=.7}
      for(const xx of [-.39,.39]){const rail=part(new THREE.BoxGeometry(.055,1.75,.055),MAT.brass,xx,1.08,.91);rail.rotation.x=.1}for(let i=0;i<5;i++)part(new THREE.BoxGeometry(.82,.045,.055),MAT.brass,0,.48+i*.35,.98);
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
    const moonSignTex=canvasTexture((ctx,w,h)=>{ctx.fillStyle='#161616';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#c39a52';ctx.lineWidth=11;ctx.strokeRect(8,8,w-16,h-16);ctx.fillStyle='#eee1b9';ctx.textAlign='center';ctx.font='bold 39px Georgia';ctx.fillText('THE SELENITE READING OUTPOST',w/2,56);ctx.font='italic 22px Georgia';ctx.fillText('Fictions sent ahead of their century',w/2,94)},820,116);
    const moonSign=add(new THREE.PlaneGeometry(4.9,.7),new THREE.MeshStandardMaterial({map:moonSignTex,roughness:.75}),mx,2.5,mz-10.8);moonSign.userData={type:'moon-sign',title:'The Selenite Reading Outpost',author:'The first librarians arrived several decades before the first astronauts.',action:'READ'};interactables.push(moonSign);
    const scienceFiction=[35,36,62,4552,16457,72,5230,159,10002].map(id=>books.find(book=>book.id===id)).filter(Boolean);
    scienceFiction.forEach((book,index)=>{const col=index%5,row=Math.floor(index/5),x=mx-5.2+col*2.6,z=mz-5.3-row*3.3;const pedestal=cylinder(.62,.76,.92,10,MAT.darkWood,x,.46,z),bm=add(new THREE.BoxGeometry(.9,1.18,.15),new THREE.MeshStandardMaterial({map:coverTexture(book),roughness:.7}),x,1.2,z);bm.rotation.x=-.35;bm.userData={type:'book',book,loaded:true,home:{position:bm.position.clone(),quaternion:bm.quaternion.clone(),parent:root}};interactables.push(bm);moonBooks.push(bm)});

    const exitDoor=box(2.25,3.55,.2,MAT.darkWood,bottomX+1.55,1.78,bottomZ);exitDoor.rotation.y=Math.PI/2;exitDoor.userData={type:'high-stair-exit',title:'The door back to the western wing',author:'The brass handle is warm from the library below.',action:'RETURN'};interactables.push(exitDoor);

    function onMoon(x,z){return Math.hypot(x-mx,z-mz)<moonRadius+.4}
    function contains(x,z){return Math.hypot(x-cx,z-cz)<14.2||onMoon(x,z)}
    function closestStep(x,z){let nearest=null,best=Infinity;for(const step of stepPath){const d=(x-step.x)**2+(z-step.z)**2;if(d<best){best=d;nearest=step}}return best<1.15?nearest:null}
    function floorAt(x,z){if(onMoon(x,z))return 0;if(!contains(x,z))return null;const r=Math.hypot(x-cx,z-cz);if(r<4.85)return topY;if(Math.hypot(x-bottomX,z-bottomZ)<2.7)return 0;return closestStep(x,z)?.y??null}
    function allowed(x,z){if(onMoon(x,z))return Math.hypot(x-mx,z-mz)<moonRadius-1;const y=floorAt(x,z);if(y===null)return false;const r=Math.hypot(x-cx,z-cz);if(r<4.55)return true;if(Math.hypot(x-bottomX,z-bottomZ)<2.35)return true;return !!closestStep(x,z)}
    function moveTo(x,y,z,yaw){player.pos.set(x,y,z);player.vel.set(0,0,0);player.yaw=yaw;player.pitch=0;lastSafePosition.copy(player.pos);camera.position.set(x,y+1.72,z);camera.rotation.set(0,yaw,0,'YXZ');camera.updateMatrixWorld()}
    function interact(object){const type=object?.userData?.type;if(type==='high-stair-door'){moveTo(bottomX,0,bottomZ+1.25,-Math.PI/2);showNotice('The door shuts below you. The stair coils upward beyond the reach of its own lamplight.',7);sound(92,1.1,'triangle',.15);localStorage.setItem('athenaeum-high-stair-discovered','1');return true}if(type==='high-stair-exit'){moveTo(entranceX,0,-11.15,0);showNotice('The western wing receives you at the same hour you left it.',5);sound(145,.7,'triangle',.1);return true}if(type==='high-stair-inscription'){showNotice('The catalogue calls this the top. A narrow continuation vanishes into the dome, proving the catalogue optimistic.',7);sound(523,.7,'sine',.07);return true}if(type==='moon-rocket-launch'){sound(48,2.4,'sawtooth',.13);moveTo(mx,0,mz+6,Math.PI);showNotice('The primitive rocket objects violently to gravity. When the rattling stops, the Moon is waiting outside.',8);localStorage.setItem('athenaeum-moon-visited','1');window.libraryAnalytics?.track('Room Explored',{room:'selenite-outpost'});return true}if(type==='moon-rocket-return'){sound(62,1.8,'sawtooth',.11);moveTo(cx-1.3,topY,cz+1.6,Math.PI);showNotice('The return voyage takes three heartbeats and, according to the clock below, no time at all.',7);return true}if(type==='moon-sign'){showNotice('Only books that imagined other worlds before anyone could reach them are admitted here.',6);return true}return false}
    function update(time){for(const item of animatedLights)item.light.intensity=5.3+Math.sin(time*2.1+item.phase)*.8;summitLight.intensity=13+Math.sin(time*.7)*1.2;outpostLight.intensity=11+Math.sin(time*.8)*1.1;earth.rotation.y=time*.025;const moonActive=onMoon(player.pos.x,player.pos.z);if(moonActive){scene.background.setHex(0x03050b);scene.fog.color.setHex(0x070910);scene.fog.density=.004}const r=Math.hypot(player.pos.x-cx,player.pos.z-cz);if(r<5&&player.pos.y>topY-1&&!localStorage.getItem('athenaeum-high-stair-summit')){localStorage.setItem('athenaeum-high-stair-summit','1');showNotice('The Last Landing: a reading room above the roof, beneath a sky the library keeps for itself.',7);window.libraryAnalytics?.track('Room Explored',{room:'last-landing'})}}
    function reset(){root.visible=true}
    return {contains,floorAt,allowed,interact,update,reset,onMoon,center:{x:cx,z:cz},topY,topBooks,moonBooks};
  };
})();
