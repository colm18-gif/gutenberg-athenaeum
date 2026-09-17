(function(){
  'use strict';

  window.createHighStaircase=function(options){
    const {THREE,scene,MAT,player,camera,interactables,books,coverTexture,canvasTexture,showNotice,sound,lastSafePosition}=options;
    const root=new THREE.Group();root.name='the-impossible-stair';scene.add(root);
    const cx=224,cz=30,topY=30,steps=180,turns=3.2,outerRadius=12,innerRadius=4.35;
    const stepPath=[],topBooks=[],animatedLights=[];
    const stone=new THREE.MeshStandardMaterial({color:0x302d30,roughness:.96}),iron=new THREE.MeshStandardMaterial({color:0x151516,metalness:.62,roughness:.5}),blueGlass=new THREE.MeshPhysicalMaterial({color:0x26384d,transparent:true,opacity:.42,roughness:.08}),night=new THREE.MeshBasicMaterial({color:0x080b16,side:THREE.BackSide});
    const add=(geometry,material,x,y,z,parent=root)=>{const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.castShadow=false;mesh.receiveShadow=false;parent.add(mesh);return mesh};
    const box=(w,h,d,material,x,y,z,parent=root)=>add(new THREE.BoxGeometry(w,h,d),material,x,y,z,parent);
    const cylinder=(rt,rb,h,segments,material,x,y,z,parent=root)=>add(new THREE.CylinderGeometry(rt,rb,h,segments),material,x,y,z,parent);

    // The entrance is deliberately ordinary in scale; the impossible height is hidden behind it.
    const entrance=new THREE.Group();entrance.position.set(-28,0,-13.58);scene.add(entrance);
    const door=box(2.7,4.35,.24,MAT.darkWood,0,2.18,0,entrance);door.userData={type:'high-stair-door',title:'The stair that is not on the plan',author:'A brass plate reads: ASCENTS, DISTANCES & IMPOSSIBLE HEIGHTS.',action:'ASCEND'};interactables.push(door);
    for(const x of [-1.48,1.48])box(.22,4.72,.32,MAT.brass,x,2.36,.01,entrance);
    box(3.18,.24,.34,MAT.brass,0,4.66,.01,entrance);
    const plaqueTex=canvasTexture((ctx,w,h)=>{ctx.fillStyle='#21170d';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#c29a50';ctx.lineWidth=12;ctx.strokeRect(8,8,w-16,h-16);ctx.fillStyle='#e1c98d';ctx.textAlign='center';ctx.font='bold 30px Georgia';ctx.fillText('ASCENTS & IMPOSSIBLE HEIGHTS',w/2,52)},640,78);
    const plaque=add(new THREE.PlaneGeometry(2.45,.3),new THREE.MeshStandardMaterial({map:plaqueTex,roughness:.7}),0,3.28,.135,entrance);plaque.userData=door.userData;interactables.push(plaque);
    const knob=cylinder(.1,.1,.12,14,MAT.brass,.82,2.05,.2,entrance);knob.rotation.x=Math.PI/2;

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

    const exitDoor=box(2.25,3.55,.2,MAT.darkWood,bottomX+1.55,1.78,bottomZ);exitDoor.rotation.y=Math.PI/2;exitDoor.userData={type:'high-stair-exit',title:'The door back to the western wing',author:'The brass handle is warm from the library below.',action:'RETURN'};interactables.push(exitDoor);

    function contains(x,z){return Math.hypot(x-cx,z-cz)<14.2}
    function closestStep(x,z){let nearest=null,best=Infinity;for(const step of stepPath){const d=(x-step.x)**2+(z-step.z)**2;if(d<best){best=d;nearest=step}}return best<1.15?nearest:null}
    function floorAt(x,z){if(!contains(x,z))return null;const r=Math.hypot(x-cx,z-cz);if(r<4.85)return topY;if(Math.hypot(x-bottomX,z-bottomZ)<2.7)return 0;return closestStep(x,z)?.y??null}
    function allowed(x,z){const y=floorAt(x,z);if(y===null)return false;const r=Math.hypot(x-cx,z-cz);if(r<4.55)return true;if(Math.hypot(x-bottomX,z-bottomZ)<2.35)return true;return !!closestStep(x,z)}
    function moveTo(x,y,z,yaw){player.pos.set(x,y,z);player.vel.set(0,0,0);player.yaw=yaw;player.pitch=0;lastSafePosition.copy(player.pos);camera.position.set(x,y+1.72,z);camera.rotation.set(0,yaw,0,'YXZ');camera.updateMatrixWorld()}
    function interact(object){const type=object?.userData?.type;if(type==='high-stair-door'){moveTo(bottomX,0,bottomZ+1.25,-Math.PI/2);showNotice('The door shuts below you. The stair coils upward beyond the reach of its own lamplight.',7);sound(92,1.1,'triangle',.15);localStorage.setItem('athenaeum-high-stair-discovered','1');return true}if(type==='high-stair-exit'){moveTo(-28,0,-11.4,0);showNotice('The western wing receives you at the same hour you left it.',5);sound(145,.7,'triangle',.1);return true}if(type==='high-stair-inscription'){showNotice('The catalogue calls this the top. A narrow continuation vanishes into the dome, proving the catalogue optimistic.',7);sound(523,.7,'sine',.07);return true}return false}
    function update(time){for(const item of animatedLights)item.light.intensity=5.3+Math.sin(time*2.1+item.phase)*.8;summitLight.intensity=13+Math.sin(time*.7)*1.2;const r=Math.hypot(player.pos.x-cx,player.pos.z-cz);if(r<5&&player.pos.y>topY-1&&!localStorage.getItem('athenaeum-high-stair-summit')){localStorage.setItem('athenaeum-high-stair-summit','1');showNotice('The Last Landing: a reading room above the roof, beneath a sky the library keeps for itself.',7);window.libraryAnalytics?.track('Room Explored',{room:'last-landing'})}}
    function reset(){root.visible=true}
    return {contains,floorAt,allowed,interact,update,reset,center:{x:cx,z:cz},topY,topBooks};
  };
})();
