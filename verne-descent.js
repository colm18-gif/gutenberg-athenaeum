/* An additive, uncatalogued discovery. No existing rooms or book records are replaced. */
(()=>{
  'use strict';
  window.createVerneDescent=function({THREE,scene,MAT,collider,colliders,interactables,canvasTexture,wrapText,player,camera,book,companionBooks=[],performanceZones,rememberLights,onReturn=()=>{},onFade=()=>{},onBell=()=>{},notice=()=>{},click=()=>{}}){
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
    // ---------- The layers of the earth ----------
    // One tall painting of the ground from the cellars to the bottom (1 px = 3 cm, the same across and down),
    // laid on the walls in world space so each layer sits at its true depth and the stair cuts down through
    // them. Flights and landings keep their stone; these are thin facings just in front of it.
    const DEPTH=62,STRATA=[
      [0,7,'Topsoil and roots','#3b2b1d','#4a3524','roots'],[7,12,'London clay','#5c3e28','#6b4a2f','brick'],
      [12,17,'The Roman layer','#4a3a2d','#594536','roman'],[17,22,'River gravels','#39413a','#465046','wet'],
      [22,27,'Ice-age gravels','#6a5a45','#786650','pebbles'],[27,32,'Chalk','#aaa088','#bdb298','flint'],
      [32,37,'Jurassic clay','#474e57','#566069','ammonites'],[37,41,'Coal measures','#1d1b19','#2f2b27','seams'],
      [41,46,'Slate','#333843','#3f4550','slate'],[46,51,'Granite','#4a4040','#574b49','granite'],
      [51,56,'Basalt','#1f1f22','#2b2b2e','basalt'],[56,62,'Crystal caverns','#241e2c','#2f2739','crystals']];
    function strataTexture(){
      return canvasTexture((c,w,h)=>{
        const m=h/DEPTH,rand=(a,b)=>a+Math.random()*(b-a),wave=(depth,seed)=>x=>depth*m+Math.sin(x/w*Math.PI*2*2+seed)*5+Math.sin(x/w*Math.PI*2*5+seed*3)*2.5;
        const edges=STRATA.map(([top],i)=>i?wave(top,i*1.7):()=>0);edges.push(()=>h+10);
        STRATA.forEach(([top,bottom,,base,light,kind],i)=>{
          const upper=edges[i],lower=edges[i+1],y0=top*m,y1=bottom*m;
          c.save();c.beginPath();c.moveTo(0,upper(0));for(let x=8;x<=w;x+=8)c.lineTo(x,upper(x));for(let x=w;x>=0;x-=8)c.lineTo(x,lower(x));c.closePath();c.clip();
          const g=c.createLinearGradient(0,y0-8,0,y1+8);g.addColorStop(0,light);g.addColorStop(1,base);c.fillStyle=g;c.fillRect(0,y0-12,w,y1-y0+24);
          // Fine bedding lines and grit in every layer.
          c.globalAlpha=.18;for(let k=0;k<(y1-y0)/5;k++){const y=rand(y0,y1);c.strokeStyle=Math.random()<.5?'#000':'#fff';c.lineWidth=rand(.5,1.4);c.beginPath();c.moveTo(0,y);for(let x=0;x<=w;x+=32)c.lineTo(x,y+Math.sin(x*.03+k)*1.5);c.stroke()}
          c.globalAlpha=.2;for(let k=0;k<(y1-y0)*5;k++){c.fillStyle=Math.random()<.5?'#0c0a08':'#d8cdb8';c.fillRect(rand(0,w),rand(y0,y1),1,1)}c.globalAlpha=1;
          const blob=(x,y,rx,ry,fill,rot=0)=>{c.fillStyle=fill;c.beginPath();c.ellipse(x,y,rx,ry,rot,0,7);c.fill()};
          if(kind==='roots'){c.strokeStyle='#1a110a';for(let k=0;k<26;k++){let x=rand(0,w),y=y0-4;c.lineWidth=rand(1,3.2);c.beginPath();c.moveTo(x,y);const n=rand(6,14);for(let j=0;j<n;j++){x+=rand(-7,7);y+=rand(6,16);c.lineTo(x,y)}c.stroke()}}
          if(kind==='brick'){for(let k=0;k<14;k++){c.save();c.translate(rand(0,w),rand(y0+6,y1-6));c.rotate(rand(-.6,.6));c.fillStyle=['#6e3a26','#7a452d','#5e3222'][k%3];c.fillRect(-7,-3,rand(8,15),rand(4,6));c.restore()}
            const px=rand(60,w-60),py=(y0+y1)/2;c.strokeStyle='#8f5a3a';c.lineWidth=5;c.beginPath();c.arc(px,py,14,0,7);c.stroke();blob(px,py,11,11,'#140e0a')}
          if(kind==='roman'){for(let k=0;k<14;k++){c.save();c.translate(rand(0,w),rand(y0+4,y1-4));c.rotate(rand(0,3));c.fillStyle=['#7e4a30','#8a5a3a','#6e3f2a'][k%3];c.fillRect(-5,-2,rand(6,12),3);c.restore()}
            for(let k=0;k<5;k++)blob(rand(0,w),rand(y0+6,y1-6),2.4,2.4,'#b08c42');for(let k=0;k<4;k++)blob(rand(0,w),rand(y0+6,y1-6),3.2,1.8,'#a9a291',rand(0,3))}
          if(kind==='wet'||kind==='pebbles'){const tones=kind==='wet'?['#59625a','#6f766b','#2e3530','#7d837a']:['#8d7b61','#a08d72','#5f5344','#b3a58c'];for(let k=0;k<230;k++)blob(rand(0,w),rand(y0,y1),rand(1.5,5),rand(1.2,3.6),tones[k%4],rand(0,3));
            if(kind==='wet'){c.globalAlpha=.25;c.strokeStyle='#9fb4b0';for(let k=0;k<30;k++){const x=rand(0,w),y=rand(y0,y1);c.lineWidth=1;c.beginPath();c.moveTo(x,y);c.lineTo(x+rand(-2,2),y+rand(10,30));c.stroke()}c.globalAlpha=1}}
          if(kind==='flint'){for(let row=0;row<4;row++){const y=y0+(row+.6)*(y1-y0)/4.2;for(let x=rand(0,20);x<w;x+=rand(18,40))blob(x,y+rand(-3,3),rand(4,9),rand(2.5,4.5),'#26262a',rand(-.3,.3))}
            c.strokeStyle='#8d846e';c.lineWidth=1;for(let k=0;k<8;k++){const x=rand(0,w),y=rand(y0,y1);c.beginPath();c.arc(x,y,5,Math.PI,0);for(let r=-4;r<=4;r+=2){c.moveTo(x,y);c.lineTo(x+r,y-4.5)}c.stroke()}}
          if(kind==='ammonites'){c.strokeStyle='#9aa3a8';for(let k=0;k<12;k++){const x=rand(10,w-10),y=rand(y0+12,y1-12),size=rand(6,12);c.lineWidth=1.3;c.beginPath();for(let a=0;a<Math.PI*6;a+=.2){const r=size*a/(Math.PI*6);c.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}c.stroke();for(let a=Math.PI*3;a<Math.PI*6;a+=.5){const r=size*a/(Math.PI*6);c.beginPath();c.moveTo(x+Math.cos(a)*r*.82,y+Math.sin(a)*r*.82);c.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);c.stroke()}}}
          if(kind==='seams'){for(let k=0;k<7;k++){const y=rand(y0,y1),t=rand(2,8);c.fillStyle='#0b0a09';c.fillRect(0,y,w,t);c.fillStyle='rgba(190,190,200,.35)';for(let j=0;j<30;j++)c.fillRect(rand(0,w),y+rand(0,t),1,1)}}
          if(kind==='slate'){c.strokeStyle='rgba(15,18,25,.8)';c.lineWidth=1;for(let k=0;k<80;k++){const x=rand(-40,w),y=rand(y0,y1);c.beginPath();c.moveTo(x,y);c.lineTo(x+60,y+14);c.stroke()}}
          if(kind==='granite'){c.globalAlpha=.55;for(let k=0;k<(y1-y0)*5;k++){c.fillStyle=['#161212','#9c8f8a','#7a5552','#141111'][k%4];c.fillRect(rand(0,w),rand(y0,y1),rand(1,2),rand(1,2))}c.globalAlpha=1}
          if(kind==='basalt'){c.strokeStyle='#0a0a0b';c.lineWidth=2;for(let x=0;x<w;x+=rand(12,22)){c.beginPath();let y=y0;c.moveTo(x,y);while(y<y1){y+=rand(10,24);c.lineTo(x+rand(-3,3),y)}c.stroke()}for(let k=0;k<40;k++){const x=rand(0,w),y=rand(y0,y1);c.beginPath();c.moveTo(x,y);c.lineTo(x+rand(8,16),y+rand(-2,2));c.stroke()}}
          if(kind==='crystals'){for(let k=0;k<60;k++){const x=rand(0,w),y=rand(y0+4,y1),s=rand(2,7);c.fillStyle=['#8a6fb8','#b89ce0','#e2d8ff','#6f8fb8'][k%4];c.beginPath();c.moveTo(x,y-s*1.8);c.lineTo(x+s*.6,y);c.lineTo(x,y+s*.5);c.lineTo(x-s*.6,y);c.closePath();c.fill()}for(let k=0;k<160;k++){c.fillStyle='#fff';c.fillRect(rand(0,w),rand(y0,y1),1,1)}}
          c.restore();
        });
        // Dark hairline between layers.
        c.strokeStyle='rgba(8,6,4,.55)';c.lineWidth=1.5;for(let i=1;i<STRATA.length;i++){c.beginPath();for(let x=0;x<=w;x+=8)c.lineTo(x,edges[i](x));c.stroke()}
      },512,Math.round(512*DEPTH/15.5));
    }
    let strata=null;
    // A flat facing between four world-space corners, textured by depth. corners: bottom-a, bottom-b, top-b, top-a.
    function facing(parent,corners,normal){
      if(!strata){const map=strataTexture();map.wrapS=THREE.RepeatWrapping;map.wrapT=THREE.ClampToEdgeWrapping;strata=new THREE.MeshStandardMaterial({map,roughness:.94})}
      const positions=[],uvs=[];for(const [x,y,z] of corners){positions.push(x,y,z);uvs.push((x+z)/15.5,1+y/DEPTH)}
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
      const [a,b,,d]=corners,cross=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]).cross(new THREE.Vector3(d[0]-a[0],d[1]-a[1],d[2]-a[2]));
      geometry.setIndex(cross.dot(new THREE.Vector3(...normal))>0?[0,1,2,0,2,3]:[0,2,1,0,3,2]);geometry.computeVertexNormals();
      const mesh=new THREE.Mesh(geometry,strata);parent.add(mesh);return mesh;
    }
    // ---------- Depth markers ----------
    const MARKERS=[['The cellars end here','Below this line the building has no say.'],['London clay','Victorian drains, 1860s'],['The Roman layer','Coins of Claudius, AD 50'],
      ['River gravels','Below the water table'],['Ice-age gravels','Mammoth country, 20,000 years ago'],['Chalk','A warm sea, 80 million years ago · look up'],
      ['Jurassic clay','Ammonites, 160 million years ago'],['Coal measures','Forests turned to stone, 310 million years ago'],['Slate','Mud of an older ocean, 450 million years ago'],
      ['Granite','Cooled from fire, 500 million years ago'],['Basalt','The old fire, still warm to the hand'],['Further than the catalogue goes','“Descend, bold traveller, and you will reach the centre of the earth.” — Arne Saknussemm']];
    function marker(parent,index,x,y,z){
      const metres=Math.round((index+1)*4.8),[layer,line]=MARKERS[index];
      const map=canvasTexture((c,w,h)=>{c.fillStyle='#2b2318';c.fillRect(0,0,w,h);c.strokeStyle='#b8925a';c.lineWidth=6;c.strokeRect(10,10,w-20,h-20);c.lineWidth=1.5;c.strokeRect(22,22,w-44,h-44);
        c.fillStyle='#d9b878';c.textAlign='center';c.font='600 20px Georgia';c.fillText('DEPTH BELOW THE READING ROOM',w/2,62);c.font='bold 64px Georgia';c.fillText(`${metres} m`,w/2,132);
        c.font='italic 30px Georgia';c.fillText(layer,w/2,180);c.fillStyle='#b69f78';c.font='20px Georgia';wrapText(c,line,w/2,216,w-80,25)},512,288);
      const plate=new THREE.Mesh(new THREE.PlaneGeometry(1.15,.65),new THREE.MeshStandardMaterial({map,roughness:.5,metalness:.25}));plate.position.set(x,y,z);plate.rotation.y=Math.PI;parent.add(plate);return plate;
    }
    // ---------- The shaft ----------
    // Half-way down, a grating in a landing's ceiling opens on a shaft climbing through every layer already
    // passed, with a coin of daylight at the top. Now and then a pebble comes down it.
    const SHAFT_LANDING=5,shaft={x:37,z:14+SHAFT_LANDING*18+16,floor:-(SHAFT_LANDING+1)*4.8,top:-3,pebble:null,nextPebble:0,fall:-1,told:false};
    function buildShaft(parent){
      const {x,z,floor,top}=shaft,h=.8,bottom=floor+3.1;
      for(const [nx,nz] of [[1,0],[-1,0],[0,1],[0,-1]]){const px=x-nx*h,pz=z-nz*h,ax=nz*h,az=nx*h;facing(parent,[[px-ax,bottom,pz-az],[px+ax,bottom,pz+az],[px+ax,top,pz+az],[px-ax,top,pz-az]],[nx,0,nz])}
      const sky=new THREE.Mesh(new THREE.CircleGeometry(.62,24),new THREE.MeshBasicMaterial({color:0xe4eeff}));sky.position.set(x,top-.02,z);sky.rotation.x=Math.PI/2;parent.add(sky);
      const cap=new THREE.Mesh(new THREE.PlaneGeometry(1.6,1.6),new THREE.MeshBasicMaterial({color:0x060606}));cap.position.set(x,top-.01,z);cap.rotation.x=Math.PI/2;parent.add(cap);
      const iron=new THREE.MeshStandardMaterial({color:0x1c1d1e,metalness:.6,roughness:.5});
      for(let k=-2;k<=2;k++){box(parent,1.6,.06,.06,iron,x,bottom+.03,z+k*.32,false);box(parent,.06,.06,1.6,iron,x+k*.32,bottom+.03,z,false)}
      const pool=new THREE.Mesh(new THREE.CircleGeometry(.85,24),new THREE.MeshBasicMaterial({color:0x9fb6d8,transparent:true,opacity:.07,depthWrite:false}));pool.position.set(x,floor+.02,z);pool.rotation.x=-Math.PI/2;parent.add(pool);
      shaft.pebble=new THREE.Mesh(new THREE.SphereGeometry(.035,6,4),damp);shaft.pebble.visible=false;parent.add(shaft.pebble);
    }
    // ---------- Falling grit ----------
    const GRAINS=90,grit={points:null,life:0,speeds:new Float32Array(GRAINS)};
    function tremor(){
      if(!built||!contains(player.pos.x,player.pos.z))return;
      if(!grit.points){const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(GRAINS*3),3));grit.points=new THREE.Points(geometry,new THREE.PointsMaterial({color:0x9d8a70,size:.035,transparent:true,opacity:.85,depthWrite:false}));grit.points.frustumCulled=false;group.add(grit.points)}
      const p=grit.points.geometry.attributes.position;for(let k=0;k<GRAINS;k++){p.setXYZ(k,player.pos.x+(Math.random()-.5)*3.6,player.pos.y+2.6+Math.random()*.5,player.pos.z+(Math.random()-.2)*5);grit.speeds[k]=.8+Math.random()*2.2}
      p.needsUpdate=true;grit.life=2.6;grit.delay=.6;grit.points.visible=true;
    }
    function updateGrit(dt){if(!grit.points||grit.life<=0)return;if(grit.delay>0){grit.delay-=dt;return}grit.life-=dt;const p=grit.points.geometry.attributes.position;for(let k=0;k<GRAINS;k++){const y=p.getY(k)-grit.speeds[k]*dt;p.setY(k,Math.max(y,player.pos.y-.02))}p.needsUpdate=true;grit.points.material.opacity=.85*Math.min(1,grit.life);if(grit.life<=0)grit.points.visible=false}
    function updateShaft(t,dt,reduced){
      if(!shaft.pebble)return;const near=Math.hypot(player.pos.x-shaft.x,player.pos.z-shaft.z)<9&&Math.abs(player.pos.y-shaft.floor)<3;
      if(near&&!shaft.told){shaft.told=true;notice('A cold draught falls from somewhere high above. Look up.')}
      if(shaft.fall<0){if(near&&!reduced&&t>shaft.nextPebble){shaft.fall=0;shaft.pebble.visible=true}return}
      shaft.fall+=dt;const y=shaft.top-.1-4.9*shaft.fall*shaft.fall;shaft.pebble.position.set(shaft.x+.18,Math.max(y,shaft.floor+.035),shaft.z-.1);
      if(y<=shaft.floor+.035){click();shaft.fall=-1;shaft.nextPebble=t+22+Math.random()*30;setTimeout(()=>{if(shaft.fall<0)shaft.pebble.visible=false},1600)}
    }
    // ---------- Warmth ----------
    // Towards the bottom thin seams in the rock glow and slowly breathe, like embers under ash. No lamps: one
    // shared unlit material whose colour is changed once a frame.
    const seamMaterial=new THREE.MeshBasicMaterial({color:0xff7a2a});
    function seams(parent,x,side,inset,z,slope,count){
      const positions=[],wx=x+side*(inset-.012),quad=(a,b,c,d)=>{for(const [p,q,r] of [[a,b,c],[a,c,d],[a,c,b],[a,d,c]])positions.push(...p,...q,...r)};
      for(let k=0;k<count;k++){let cz=z+1.5+Math.random()*11,cy=slope(cz)+.35+Math.random()*.8;const width=.02+Math.random()*.025;
        for(let j=0;j<7;j++){const nz=cz+(Math.random()-.5)*.55,ny=cy+.16+Math.random()*.2;quad([wx,cy-width,cz],[wx,ny-width,nz],[wx,ny+width,nz],[wx,cy+width,cz]);cz=nz;cy=ny}}
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));parent.add(new THREE.Mesh(geometry,seamMaterial));
    }
    // ---------- The crack ----------
    // Near the bottom a split in the basalt looks out and down on Verne's underground sea: a painted cavern,
    // lit by its own pale light, with the forest of giant mushrooms on the shore.
    const CRACK_LANDING=10,crack={x:42,y:-(CRACK_LANDING+1)*4.8,z:14+CRACK_LANDING*18+16,told:false,level:0};
    function seaPainting(){
      // Laid out for the view through the split: cavern roof and its pale light, far cliffs on the horizon at
      // eye level, the sea below them and the near shore with its mushrooms at the bottom of the view.
      return canvasTexture((c,w,h)=>{
        const sky=c.createLinearGradient(0,0,0,h*.37);sky.addColorStop(0,'#081110');sky.addColorStop(1,'#1d4541');c.fillStyle=sky;c.fillRect(0,0,w,h);
        const haze=c.createRadialGradient(w*.5,h*.12,10,w*.5,h*.12,w*.5);haze.addColorStop(0,'rgba(220,245,230,.6)');haze.addColorStop(1,'rgba(220,245,230,0)');c.fillStyle=haze;c.fillRect(0,0,w,h*.4);
        c.fillStyle='#0a1414';c.beginPath();c.moveTo(0,h*.38);for(let x=0;x<=w;x+=12)c.lineTo(x,h*(.33+Math.sin(x*.012)*.025+Math.sin(x*.047)*.012+Math.random()*.006));c.lineTo(w,h*.38);c.fill();
        const sea=c.createLinearGradient(0,h*.37,0,h*.64);sea.addColorStop(0,'#5aa89c');sea.addColorStop(.2,'#2a6e67');sea.addColorStop(1,'#11312f');c.fillStyle=sea;c.fillRect(0,h*.37,w,h*.27);
        c.strokeStyle='rgba(200,248,232,.4)';for(let k=0;k<260;k++){const y=h*.375+Math.pow(Math.random(),1.8)*h*.25,len=6+(y-h*.37)*.35;c.lineWidth=y>h*.5?1.5:1;c.beginPath();const x=Math.random()*w;c.moveTo(x,y);c.lineTo(x+len,y);c.stroke()}
        c.fillStyle='rgba(215,245,230,.5)';c.beginPath();c.moveTo(0,h*.64);for(let x=0;x<=w;x+=16)c.lineTo(x,h*(.62+Math.sin(x*.008+1)*.02));c.lineTo(w,h*.66);c.lineTo(0,h*.66);c.fill();
        const shore=c.createLinearGradient(0,h*.62,0,h);shore.addColorStop(0,'#2a2a22');shore.addColorStop(1,'#0c0d0b');c.fillStyle=shore;c.beginPath();c.moveTo(0,h*.65);for(let x=0;x<=w;x+=16)c.lineTo(x,h*(.635+Math.sin(x*.008+1)*.02));c.lineTo(w,h);c.lineTo(0,h);c.fill();
        // Verne's forest of giant mushrooms, pale and faintly glowing, on the near shore.
        c.shadowColor='rgba(225,248,205,.9)';c.shadowBlur=22;
        for(const [mx,size] of [[.1,1.1],[.19,.75],[.27,1.35],[.36,.6],[.45,.9],[.58,.7],[.67,1.2],[.77,.85],[.86,1.4],[.95,.9]]){const x=mx*w,base=h*(.74+size*.1),stalk=h*.2*size,cap=h*.13*size;
          c.fillStyle='#bdb8a0';c.fillRect(x-h*.012*size,base-stalk,h*.024*size,stalk);c.fillStyle='#ece6cc';c.beginPath();c.ellipse(x,base-stalk,cap,cap*.42,0,Math.PI,0);c.fill();c.fillStyle='#cfc8ac';c.fillRect(x-cap,base-stalk-1,cap*2,3)}
        c.shadowBlur=0;
      },1024,640);
    }
    function buildCrack(parent,mat){
      const {x,y,z}=crack;
      for(const [dz,dy,r] of [[-.62,1.0,.32],[-.58,2.1,.3],[.6,.8,.34],[.63,1.8,.28],[.6,2.45,.3],[-.2,.58,.26],[.25,2.56,.27],[-.6,2.5,.26]]){const tooth=new THREE.Mesh(new THREE.DodecahedronGeometry(r,0),mat);tooth.position.set(x+.1,y+dy,z+dz);tooth.scale.set(.7,1.2,1);parent.add(tooth)}
      box(parent,1,.2,1.2,mat,43,y+.5,z,false);box(parent,1,.3,1.2,mat,43,y+2.65,z,false);for(const dz of [-.7,.7])box(parent,1,2.2,.2,mat,43,y+1.55,z+dz,false);
      const view=new THREE.Mesh(new THREE.PlaneGeometry(46,20),new THREE.MeshBasicMaterial({map:seaPainting()}));view.position.set(58,y-.1,z);view.rotation.y=-Math.PI/2;parent.add(view);
    }
    function updateCrack(){
      const d=Math.hypot(player.pos.x-crack.x,player.pos.z-crack.z),level=Math.abs(player.pos.y-crack.y)<8?Math.max(0,1-d/14):0;crack.level=level;
      if(!crack.told&&d<4.5&&Math.abs(player.pos.y-crack.y)<2){crack.told=true;notice('Through a split in the basalt: a sea beneath the earth, and a light that is not a lamp.')}
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
        // The last six flights close in: a little narrower and lower each time (the walking width is unchanged).
        const press=Math.max(0,i-5),inset=1.99-press*.04,roof=3.15-press*.07;
        segments.push({group:parent,z:z+9});
        // Visual treads and a continuous walking envelope share exactly the same endpoints.
        for(let s=0;s<28;s++){
          const sy=y-(s+1)*4.8/28,sz=z+(s+.5)*.5;
          box(parent,4,.55,.51,mat,x,sy-.275,sz);
          box(parent,5,.6,.51,mat,x,sy+3.4,sz);
          for(const side of [-1,1]){
            box(parent,.5,3.8,.51,mat,x+side*2.25,sy+1.5,sz);
            if(i>2&&s%3===0){const r=new THREE.Mesh(new THREE.DodecahedronGeometry(.4+i*.025,0),mat);r.position.set(x+side*(inset+.21),sy+1.6,sz);r.scale.set(.6,1.6,1.4);parent.add(r)}
            if(i<2&&s%4===0)box(parent,.12,.14,2,MAT.darkWood,x+side*2.03,sy+2.6,sz,false);
          }
        }
        // The walls of the flight, faced with the layers it cuts through (the first flight is still the building's own masonry).
        const slope=zz=>y-(zz-z)/14*4.8;
        if(i>0)for(const side of [-1,1]){const wx=x+side*inset;facing(parent,[[wx,slope(z)-.3,z],[wx,slope(z+14)-.3,z+14],[wx,slope(z+14)+roof,z+14],[wx,slope(z)+roof,z]],[-side,0,0]);if(i>=7)seams(parent,x,side,inset,z,slope,i-5)}
        if(press)facing(parent,[[x-inset,slope(z)+roof,z],[x+inset,slope(z)+roof,z],[x+inset,slope(z+14)+roof,z+14],[x-inset,slope(z+14)+roof,z+14]],[0,-1,0]);
        const ly=y-4.8,lz=z+16;
        box(parent,10,.5,4,mat,37,ly-.25,lz);
        if(i===SHAFT_LANDING){box(parent,4.2,.6,4,mat,34.1,ly+3.4,lz);box(parent,4.2,.6,4,mat,39.9,ly+3.4,lz);box(parent,1.6,.6,1.2,mat,37,ly+3.4,lz-1.4);box(parent,1.6,.6,1.2,mat,37,ly+3.4,lz+1.4);buildShaft(parent)}
        else box(parent,10,.6,4,mat,37,ly+3.4,lz);
        if(i>0){facing(parent,[[32.01,ly-.1,z+14],[32.01,ly-.1,z+18],[32.01,ly+3.15,z+18],[32.01,ly+3.15,z+14]],[1,0,0]);if(i===CRACK_LANDING)for(const [a,b,lo,hi] of [[z+14,lz-.55,-.1,3.15],[lz+.55,z+18,-.1,3.15],[lz-.55,lz+.55,-.1,.6],[lz-.55,lz+.55,2.5,3.15]])facing(parent,[[41.99,ly+lo,a],[41.99,ly+lo,b],[41.99,ly+hi,b],[41.99,ly+hi,a]],[-1,0,0]);
          else facing(parent,[[41.99,ly-.1,z+14],[41.99,ly-.1,z+18],[41.99,ly+3.15,z+18],[41.99,ly+3.15,z+14]],[-1,0,0])}
        if(i===CRACK_LANDING){box(parent,.5,3.8,4,mat,31.75,ly+1.5,lz);box(parent,.5,3.8,1.45,mat,42.25,ly+1.5,lz-1.275);box(parent,.5,3.8,1.45,mat,42.25,ly+1.5,lz+1.275);box(parent,.5,1,1.1,mat,42.25,ly+.1,lz);box(parent,.5,.9,1.1,mat,42.25,ly+2.95,lz);buildCrack(parent,mat)}
        else for(const sx of [31.75,42.25])box(parent,.5,3.8,4,mat,sx,ly+1.5,lz);
        // Every return is walled off except its two offset openings. No view into other rooms.
        for(const edge of [0,1]){const ox=edge?(i===11?37:(i%2?34:40)):x,ez=z+14+edge*4;
          for(const [a,b] of [[32,ox-2],[ox+2,42]])if(b>a){box(parent,b-a,3.8,.4,mat,(a+b)/2,ly+1.5,ez);if(i>0){const fz=edge?ez-.21:ez+.21;facing(parent,[[a,ly-.1,fz],[b,ly-.1,fz],[b,ly+3.15,fz],[a,ly+3.15,fz]],[0,0,edge?-1:1])}}
        }
        // Where the stair arrives, the wall ahead says how far down this is.
        marker(parent,i,i===11?40.5:(i%2?39:35),ly+1.85,z+17.77);
        lamp(parent,x-1.7,y+1.8,z+1,i);lamp(parent,i===SHAFT_LANDING?35.3:37,ly+2.3,lz,i+2);
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
        if(below){updateShaft(t,dt,reduced);updateGrit(dt);updateCrack();const glow=.62+.38*Math.sin(t*(reduced?.25:.7));seamMaterial.color.setRGB(1.5*glow,.48*glow,.12*glow)}else crack.level=0;
        if(depth>.2&&t>nextDrip){nextDrip=t+2+Math.random()*5;if(!reduced)sound(700+Math.random()*450,.13,'sine',.035*depth)}
      }
      return depth;
    }
    return {floorAt,contains,build,interact,update,clearLine,tremor,group,panel,regions,strata:STRATA,get seaLevel(){return crack.level},get metres(){return built&&contains(player.pos.x,player.pos.z)?Math.max(0,-player.pos.y):0},get built(){return built},get returning(){return returnTime!==null}};
  };
})();
