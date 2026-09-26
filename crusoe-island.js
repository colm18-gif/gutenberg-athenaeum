// The Boathouse and Crusoe's island. A sea-blue door in the Grand Hall opens onto an old boathouse at night;
// a rowing boat at the end of its jetty crosses the sea as the sun comes up, to a small island where Robinson
// Crusoe has left his camp, his calendar post, his parrot and a castaways' library.
//
// Nothing here exists until the reader walks up to the door: the boathouse, the sea and the sky are built then,
// the island when the reader steps into the boathouse, and all of it is freed a while after they leave. It
// adds no lamps of its own beyond the lanterns and the campfire, which count within the library's lamp budget,
// and the sunrise reuses the library's own moonlight and sky light rather than adding new ones.
(function(){
  'use strict';

  window.createCrusoeIsland=function(options){
    const {THREE,scene,MAT,player,camera,interactables,canvasTexture,bookMaterial,findBook,showNotice,playSample,sound,noise,move,fade,renderer,ambient,moon,analytics,isReducedMotion=()=>false,isHolding=()=>false,storage=null}=options;
    const DOOR={x:-4.5,z:30.45,yaw:Math.PI};
    // Where the reader stands on coming back through the door: just in front of it, facing into the hall.
    const HALL_SPOT={x:DOOR.x+Math.sin(DOOR.yaw)*1.9,z:DOOR.z+Math.cos(DOOR.yaw)*1.9,yaw:DOOR.yaw+Math.PI};
    const HOUSE={x0:-426,x1:-414,z0:325,z1:335},JETTY={x0:-421.2,x1:-418.8,z0:312,z1:325};
    const ISLE={x:-420,z:182,rx:19,rz:13},SAND={rx:23,rz:17};
    const BOAT_START={x:-420,z:310.4},LANDING={x:-420,z:193.4},SHIP={x:-326,z:180};
    const SEA_Y=-.6,PRELOAD=5.5,KEEP=25,DAY_MS=86400000;
    const SHELF_BOOKS=[1268,46597,829,159,421],CRUSOE=521,TREASURE=120,SEA_BOOKS=[2701,164,3704,103];
    const QUOTES={
      footprint:'“It happened one day, about noon, going towards my boat, I was exceedingly surprised with the print of a man’s naked foot on the shore, which was very plain to be seen on the sand.” (Robinson Crusoe)',
      poll:'Poll: “Poor Robin Crusoe! Where are you? Where have you been? How came you here?”',
      bottle:'A bottle bobs past the boat with a note curled inside: “I learned to look more upon the bright side of my condition, and less upon the dark side.” (Robinson Crusoe)',
      calendar:'Carved into the cross: “I came on shore here on the 30th September 1659.” Crusoe cut a notch for every day, every seventh a little longer.',
      chest:'“Fifteen men on the dead man’s chest— Yo-ho-ho, and a bottle of rum!” The chest holds a copy of Treasure Island.'
    };

    let root=null,isle=null,time=0,lastNeeded=-1e9,dawn=0,landed=false,travel=null,transition=null,spy=null,saved=null,applied=false,doorParts=null;
    const owned=[],ours=[],blockers=[],flames=[],books=[];
    const state={chest:null,chestOpen:0,dug:false,fire:null,fireLit:0,poll:null,pollTalk:0,sea:null,sky:null,boat:null,bottle:null,bottleSeen:false,ship:null,calendar:null};
    const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,smooth=t=>t*t*(3-2*t);

    // ---------- small builders ----------
    const own=thing=>{owned.push(thing);return thing};
    const std=(params)=>own(new THREE.MeshStandardMaterial(params));
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=m.receiveShadow=false;parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(new THREE.BoxGeometry(w,h,d),material,x,y,z,parent);
    const cyl=(rt,rb,h,seg,material,x,y,z,parent)=>add(new THREE.CylinderGeometry(rt,rb,h,seg),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    function lamp(parent,color,intensity,distance,x,y,z){const l=new THREE.PointLight(color,intensity,distance,2);l.position.set(x,y,z);l.castShadow=false;parent.add(l);return l}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    function texture(draw,w,h,linear=false){const t=own(canvasTexture(draw,w,h));if(linear)t.colorSpace=THREE.NoColorSpace;return t}
    function sign(text,w,h,parent,x,y,z,sub=''){
      const map=texture((c,W,H)=>{c.fillStyle='#24170d';c.fillRect(0,0,W,H);c.strokeStyle='#d7ae60';c.lineWidth=6;c.strokeRect(5,5,W-10,H-10);c.fillStyle='#ffe2a0';c.textAlign='center';c.font=`bold ${sub?30:34}px Georgia`;c.fillText(text,W/2,sub?44:H/2+12);if(sub){c.font='italic 22px Georgia';c.fillText(sub,W/2,78)}},512,sub?100:72);
      return add(new THREE.PlaneGeometry(w,h),std({map,emissive:0x6b461e,emissiveIntensity:.3,roughness:.8}),x,y,z,parent);
    }
    // A book standing face-out, ready to be taken down like any other in the library.
    const displayGeometry=()=>own(new THREE.BoxGeometry(.82,1.08,.14));
    function placeBook(id,parent,x,y,z,yaw,tilt=-.08){
      const book=findBook(id);if(!book)return null;const material=own(bookMaterial(book));
      const mesh=add(displayGeometry(),material,x,y,z,parent);mesh.rotation.order='YXZ';mesh.rotation.y=yaw;mesh.rotation.x=tilt;
      mesh.userData={type:'book',book,loaded:false,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent}};interactables.push(mesh);ours.push(mesh);books.push(mesh);return mesh;
    }

    // ---------- the door in the Grand Hall ----------
    function buildDoor(){
      const g=new THREE.Group();g.name='boathouse-door';g.position.set(DOOR.x,0,DOOR.z);g.rotation.y=DOOR.yaw;scene.add(g);
      const data={type:'isle-door',title:'The Boathouse',author:'A sea-blue door that smells faintly of salt. Somewhere behind it, water is lapping.',action:'ENTER'};
      const paint=new THREE.MeshStandardMaterial({color:0x2f5561,roughness:.8}),glass=new THREE.MeshStandardMaterial({color:0x1d3440,emissive:0x0d2330,emissiveIntensity:.8,roughness:.2,metalness:.1});
      mark(box(1.9,3.1,.14,paint,0,1.55,.08,g),data);
      for(let i=-3;i<=3;i++)box(.025,2.95,.02,MAT.darkWood,i*.26,1.55,.16,g);
      const ring=cyl(.38,.38,.06,24,MAT.brass,0,2.25,.17,g);ring.rotation.x=Math.PI/2;const pane=cyl(.3,.3,.07,24,glass,0,2.25,.18,g);pane.rotation.x=Math.PI/2;mark(pane,data);
      for(const px of [-1.07,1.07])box(.22,3.45,.3,MAT.brass,px,1.72,.1,g);box(2.36,.22,.3,MAT.brass,0,3.44,.1,g);
      mark(add(new THREE.SphereGeometry(.08,10,8),MAT.brass,.68,1.35,.22,g),data);
      const plate=texture((c,W,H)=>{c.fillStyle='#16282e';c.fillRect(0,0,W,H);c.strokeStyle='#d7ae60';c.lineWidth=6;c.strokeRect(5,5,W-10,H-10);c.fillStyle='#ffe2a0';c.textAlign='center';c.font='bold 30px Georgia';c.fillText('THE BOATHOUSE',W/2,44)},560,64);
      mark(add(new THREE.PlaneGeometry(1.9,.3),new THREE.MeshStandardMaterial({map:plate,emissive:0x6b461e,emissiveIntensity:.35}),0,3.72,.12,g),data);
      owned.splice(owned.indexOf(plate),1);
      doorParts={group:g,glow:lamp(g,0xbfe3ff,1.1,5,0,3.9,1.1)};
    }

    // ---------- textures ----------
    function seaTextures(){
      const N=256,normal=texture((c,W,H)=>{
        const img=c.createImageData(W,H),h=(x,y)=>Math.sin(2*Math.PI*(2*x+y)/N)*.5+Math.sin(2*Math.PI*(3*x-2*y)/N)*.3+Math.sin(2*Math.PI*(5*x+4*y)/N)*.16+Math.sin(2*Math.PI*(9*x-7*y)/N)*.07;
        for(let y=0;y<H;y++)for(let x=0;x<W;x++){const dx=h(x+1,y)-h(x-1,y),dy=h(x,y+1)-h(x,y-1),nx=-dx*3,ny=-dy*3,len=Math.hypot(nx,ny,1),i=(y*W+x)*4;img.data[i]=(nx/len*.5+.5)*255;img.data[i+1]=(ny/len*.5+.5)*255;img.data[i+2]=(1/len*.5+.5)*255;img.data[i+3]=255}
        c.putImageData(img,0,0)},N,N,true);
      const colour=texture((c,W,H)=>{c.fillStyle='#1f5d6b';c.fillRect(0,0,W,H);for(let k=0;k<400;k++){c.fillStyle=Math.random()<.5?'rgba(16,58,70,.35)':'rgba(60,130,140,.25)';c.fillRect(Math.random()*W,Math.random()*H,3,3)}},64,64);
      const rough=texture((c,W,H)=>{c.fillStyle='#fff';c.fillRect(0,0,W,H)},4,4,true);
      for(const t of [normal,colour,rough]){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(60,60)}
      return {normal,colour,rough};
    }
    // The sky is painted once, as it looks at sunrise with the sun just clear of the sea to the north; at night
    // the same painting is simply dimmed. It hangs on a ring that travels with the reader, inside the far plane.
    function skyTexture(){return texture((c,W,H)=>{
      const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#5a73a6');g.addColorStop(.45,'#9c8fb2');g.addColorStop(.72,'#e3a38e');g.addColorStop(.86,'#f7c585');g.addColorStop(.92,'#ffe0a8');g.addColorStop(1,'#e8ae7c');c.fillStyle=g;c.fillRect(0,0,W,H);
      for(let k=0;k<120;k++){c.fillStyle=`rgba(255,255,255,${Math.random()*.5})`;c.fillRect(Math.random()*W,Math.random()*H*.35,1.5,1.5)}
      const sx=W/2,sy=H*.8,glow=c.createRadialGradient(sx,sy,8,sx,sy,W*.22);glow.addColorStop(0,'rgba(255,232,170,1)');glow.addColorStop(.08,'rgba(255,196,110,.95)');glow.addColorStop(.35,'rgba(255,190,120,.35)');glow.addColorStop(1,'rgba(255,170,110,0)');c.fillStyle=glow;c.fillRect(0,0,W,H);
      c.fillStyle='#ffd27a';c.beginPath();c.arc(sx,sy,18,0,7);c.fill();c.fillStyle='#fff0c8';c.beginPath();c.arc(sx,sy,12,0,7);c.fill();
      for(let k=0;k<9;k++){const y=H*(.62+Math.random()*.2),x=Math.random()*W,w=80+Math.random()*220;c.fillStyle=`rgba(255,${170+Math.random()*50|0},${150+Math.random()*40|0},.35)`;c.beginPath();c.ellipse(x,y,w,4+Math.random()*5,0,0,7);c.fill()}
    },1024,512)}
    function sandTexture(){const t=texture((c,W,H)=>{c.fillStyle='#dcc392';c.fillRect(0,0,W,H);for(let k=0;k<5000;k++){c.fillStyle=['#c9ad7a','#e8d4a8','#bfa071','#f0e0bb'][k%4];c.fillRect(Math.random()*W,Math.random()*H,1.5,1.5)}},256,256);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(8,6);return t}
    function firstLanding(){try{return storage?.getItem('athenaeum-island-first')||null}catch(e){return null}}
    function daysAshore(){const first=firstLanding();if(!first)return 0;return Math.max(0,Math.floor((Date.now()-Number(first))/DAY_MS))}
    function calendarTexture(){const days=daysAshore();return texture((c,W,H)=>{
      c.fillStyle='#6b4f33';c.fillRect(0,0,W,H);c.strokeStyle='rgba(40,26,14,.5)';for(let k=0;k<30;k++){c.lineWidth=1;c.beginPath();const x=Math.random()*W;c.moveTo(x,0);c.lineTo(x+Math.random()*8-4,H);c.stroke()}
      c.strokeStyle='#2a1b0e';c.lineCap='round';for(let i=0;i<=Math.min(days,48);i++){const col=i%2,row=Math.floor(i/2),x=col?W*.62:W*.18,y=24+row*20,long=(i+1)%7===0;c.lineWidth=5;c.beginPath();c.moveTo(x,y);c.lineTo(x+(long?W*.32:W*.2),y);c.stroke()}
      c.fillStyle='#f1e0bd';c.textAlign='center';c.font='bold 26px Georgia';c.fillText(`DAY ${days+1}`,W/2,H-22)},160,560)}
    function inscriptionTexture(){return texture((c,W,H)=>{c.fillStyle='#6b4f33';c.fillRect(0,0,W,H);c.fillStyle='#2a1b0e';c.textAlign='center';c.font='bold 24px Georgia';c.fillText('I CAME ON SHORE HERE ON THE',W/2,36);c.fillText('30TH SEPTEMBER 1659',W/2,70)},512,90)}
    function mapTexture(){return texture((c,W,H)=>{
      c.fillStyle='#e6d3a3';c.fillRect(0,0,W,H);c.strokeStyle='rgba(120,80,40,.4)';c.lineWidth=14;c.strokeRect(0,0,W,H);
      c.fillStyle='#cbb07a';c.beginPath();c.ellipse(W/2,H/2+10,W*.36,H*.3,0,0,7);c.fill();c.strokeStyle='#6b4a2a';c.lineWidth=3;c.stroke();
      c.fillStyle='#4a6b3a';for(const [x,y] of [[.3,.5],[.62,.42],[.7,.58],[.4,.36],[.5,.66]]){c.beginPath();c.arc(W*x,H*y,7,0,7);c.fill()}
      c.strokeStyle='#8c2a22';c.lineWidth=6;const X=W*.26,Y=H*.62;c.beginPath();c.moveTo(X-12,Y-12);c.lineTo(X+12,Y+12);c.moveTo(X+12,Y-12);c.lineTo(X-12,Y+12);c.stroke();
      c.strokeStyle='#6b4a2a';c.setLineDash([4,6]);c.lineWidth=2;c.beginPath();c.moveTo(W*.5,H*.86);c.quadraticCurveTo(W*.3,H*.8,X,Y);c.stroke();c.setLineDash([]);
      c.fillStyle='#4a2c18';c.textAlign='center';c.font='italic bold 30px Georgia';c.fillText('Treasure Island',W/2,44);c.font='italic 20px Georgia';c.fillText('Dig where the X is marked on the western shore',W/2,H-20);
      c.font='bold 18px Georgia';c.fillText('N',W-40,40);c.beginPath();c.moveTo(W-40,50);c.lineTo(W-40,90);c.stroke()},512,384)}
    function footprintTexture(){return texture((c,W,H)=>{c.clearRect(0,0,W,H);c.fillStyle='rgba(120,90,50,.55)';c.beginPath();c.ellipse(W/2,H*.62,W*.26,H*.3,0,0,7);c.fill();c.beginPath();c.ellipse(W/2+4,H*.3,W*.2,H*.12,0,0,7);c.fill();for(let k=0;k<5;k++){c.beginPath();c.ellipse(W*(.28+k*.11),H*(.12-(k===0?0:.01*k)),6-k*.6,8-k*.6,0,0,7);c.fill()}},128,192)}

    // ---------- the boathouse, the sea and the sky ----------
    function buildWorld(){
      root=new THREE.Group();root.name='boathouse';
      const cx=(HOUSE.x0+HOUSE.x1)/2,cz=(HOUSE.z0+HOUSE.z1)/2;
      const sea=seaTextures();state.sea=sea;
      state.seaMat=std({map:sea.colour,normalMap:sea.normal,roughnessMap:sea.rough,normalScale:new THREE.Vector2(.55,.55),roughness:.32,metalness:.12});add(new THREE.PlaneGeometry(380,380),state.seaMat,cx,SEA_Y,250,root).rotation.x=-Math.PI/2;
      const skyGeometry=new THREE.CylinderGeometry(105,105,90,48,1,true);skyGeometry.scale(-1,1,1);// turned inside out, so it is seen from within
      const sky=add(skyGeometry,own(new THREE.MeshBasicMaterial({map:skyTexture(),fog:false})),cx,38,cz,root);sky.frustumCulled=false;state.sky=sky;
      // The boathouse: planked floor, three walls, a pitched roof and a wide mouth open to the sea.
      box(12,.3,10,MAT.wood,cx,-.15,cz,root);
      box(12,4.2,.3,MAT.wood2,cx,2.1,HOUSE.z1,root);box(.3,4.2,10,MAT.wood2,HOUSE.x0,2.1,cz,root);box(.3,4.2,10,MAT.wood2,HOUSE.x1,2.1,cz,root);
      for(const side of [-1,1]){const r=box(6.6,.2,10.6,MAT.darkWood,cx+side*3.1,4.9,cz,root);r.rotation.z=side*-.42}
      box(12.2,.3,.3,MAT.darkWood,cx,4.1,HOUSE.z0,root);for(const x of [HOUSE.x0,HOUSE.x1])cyl(.14,.16,4.2,8,MAT.darkWood,x,2.1,HOUSE.z0,root);
      // Lanterns either side of the open mouth, and one by the door.
      const lanternGlass=std({color:0xffe2b0,emissive:0xffb35c,emissiveIntensity:1.2,roughness:.6});
      for(const [x,z] of [[HOUSE.x0+1.2,HOUSE.z0+1],[HOUSE.x1-1.2,HOUSE.z0+1],[cx+2.2,HOUSE.z1-1]]){box(.22,.32,.22,lanternGlass,x,2.6,z,root);box(.3,.05,.3,MAT.brass,x,2.8,z,root);lamp(root,0xffb866,5.5,11,x,2.4,z)}
      // A shelf of sea books along the west wall.
      box(.36,.06,6.4,MAT.darkWood,HOUSE.x0+.35,.95,cz-.4,root);SEA_BOOKS.forEach((id,i)=>placeBook(id,root,HOUSE.x0+.38,1.5,cz-2.6+i*1.5,Math.PI/2));
      sign('BOOKS FOR A SEA VOYAGE',2.6,.36,root,HOUSE.x0+.18,2.45,cz-.4).rotation.y=Math.PI/2;
      // Barrels, oars and a coil of rope for company.
      for(const [x,z] of [[HOUSE.x1-1,HOUSE.z1-1.4],[HOUSE.x1-1.8,HOUSE.z1-1]]){cyl(.42,.36,1,14,MAT.wood2,x,.5,z,root);block(x,z,1,1)}
      for(const k of [0,1]){const oar=box(.08,2.8,.12,MAT.wood,HOUSE.x1-.3,1.4,cz+k*.5-1,root);oar.rotation.z=.18}
      cyl(.5,.5,.18,18,std({color:0x9c8458,roughness:1}),cx-3,.09,HOUSE.z1-1.5,root);
      // The door home.
      const exit={type:'isle-exit',title:'Back to the Grand Hall',author:'The lamplit hall is just the other side.',action:'RETURN'};
      mark(box(1.9,3.1,.16,MAT.darkWood,cx,1.55,HOUSE.z1-.2,root),exit);for(const px of [-1.05,1.05])box(.16,3.35,.24,MAT.brass,cx+px,1.68,HOUSE.z1-.22,root);box(2.3,.16,.24,MAT.brass,cx,3.3,HOUSE.z1-.22,root);
      // The jetty, and the boat at the end of it.
      const jx=(JETTY.x0+JETTY.x1)/2,jl=JETTY.z1-JETTY.z0;box(JETTY.x1-JETTY.x0,.2,jl,MAT.wood,jx,-.1,(JETTY.z0+JETTY.z1)/2,root);
      for(let z=JETTY.z0+.3;z<JETTY.z1;z+=3)for(const x of [JETTY.x0,JETTY.x1])cyl(.1,.12,1.6,8,MAT.darkWood,x,-.5,z,root);
      const post=cyl(.08,.08,1.8,8,MAT.darkWood,JETTY.x1-.2,.9,JETTY.z0+1.2,root);sign('TO THE ISLAND',1.3,.3,root,JETTY.x1-.2,1.65,JETTY.z0+1.25,).rotation.y=0;post.name='jetty-sign';
      state.boat=buildBoat(root,BOAT_START.x,BOAT_START.z,{type:'isle-boat',title:'A rowing boat',author:'The oars are shipped and the painter is loosely tied. Someone has left a note: “To the island, at first light.”',action:'ROW TO THE ISLAND'});
      scene.add(root);
    }
    function buildBoat(parent,x,z,data,yaw=0){
      const g=new THREE.Group();g.position.set(x,SEA_Y+.15,z);g.rotation.y=yaw;parent.add(g);
      const hull=std({color:0x6d4a2c,roughness:.85}),paint=std({color:0x2f5561,roughness:.8});
      const body=box(1.3,.5,3.2,hull,0,.2,0,g);box(1.36,.08,3.26,paint,0,.46,0,g);const bow=add(new THREE.ConeGeometry(.66,1.1,4),hull,0,.2,-2.05,g);bow.rotation.x=-Math.PI/2;bow.rotation.y=Math.PI/4;bow.scale.set(1,1,.45);
      for(const bz of [-.7,.6])box(1.2,.06,.3,MAT.wood,0,.42,bz,g);
      for(const side of [-1,1]){const oar=box(.06,.05,2.6,MAT.wood,side*.95,.5,.2,g);oar.rotation.y=side*.22}
      if(data){mark(body,data);mark(bow,data)}
      return g;
    }

    // ---------- the island ----------
    function buildIsland(){
      isle=new THREE.Group();isle.name='crusoe-island';
      const {x:ix,z:iz}=ISLE;
      const shallows=add(new THREE.CylinderGeometry(1,1,.1,48),std({color:0x3fa5a0,roughness:.3,metalness:.05}),ix,SEA_Y+.07,iz,isle);shallows.scale.set(SAND.rx+4,1,SAND.rz+4);
      const beach=add(new THREE.CylinderGeometry(1,1.08,.9,48),std({map:sandTexture(),roughness:1}),ix,-.45,iz,isle);beach.scale.set(SAND.rx,1,SAND.rz);
      // A green hill with rocks behind the camp, to the north, where the sun comes up.
      const hill=add(new THREE.SphereGeometry(1,24,12),std({color:0x5f7f36,roughness:1}),ix-2,-.8,iz-19,isle);hill.scale.set(14,5.5,7.5);
      const rock=std({color:0x7d7468,roughness:1,flatShading:true});for(const [x,y,z,s] of [[ix-10,.6,iz-15,1.6],[ix+8,.8,iz-16,2],[ix+13,.3,iz-11,1.2],[ix-15,.2,iz-9,1.1]]){const r=add(new THREE.DodecahedronGeometry(s,0),rock,x,y,z,isle);r.scale.y=.7}
      buildPalms(ix,iz);
      // Crusoe's camp: a stockade of stakes, a hut inside, and a fire at the gate.
      const cx=ix-4,cz=iz-6,stakes=[],R=4.2;for(let a=0;a<Math.PI*2;a+=.16){if(Math.abs(Math.atan2(Math.sin(a),Math.cos(a))-Math.PI/2)<.42)continue;stakes.push([cx+Math.cos(a)*R,cz+Math.sin(a)*R])}
      const stakeGeo=own(new THREE.CylinderGeometry(.08,.11,2.3,6)),stakeMat=std({color:0x5c4630,roughness:1}),stakeMesh=new THREE.InstancedMesh(stakeGeo,stakeMat,stakes.length),m=new THREE.Matrix4();
      stakes.forEach(([x,z],i)=>{m.makeTranslation(x,1.1,z);stakeMesh.setMatrixAt(i,m);block(x,z,.4,.4)});stakeMesh.instanceMatrix.needsUpdate=true;isle.add(stakeMesh);
      box(3,2,2.4,MAT.wood2,cx-.5,1,cz-1.6,isle);const roof=add(new THREE.ConeGeometry(2.5,1.6,4),std({color:0xb49b62,roughness:1}),cx-.5,2.8,cz-1.6,isle);roof.rotation.y=Math.PI/4;block(cx-.5,cz-1.6,3.4,2.8);
      box(.9,1.5,.05,std({color:0x1a120b,roughness:1}),cx-.5,.75,cz-.38,isle);
      box(1.4,.08,.8,MAT.wood2,cx+1.6,.8,cz-1,isle);for(const [dx,dz] of [[-.6,-.3],[.6,-.3],[-.6,.3],[.6,.3]])box(.08,.8,.08,MAT.wood2,cx+1.6+dx,.4,cz-1+dz,isle);block(cx+1.6,cz-1,1.6,1);
      const fx=cx+1,fz=cz+6.2;const stone=std({color:0x6e6860,roughness:1});for(let k=0;k<8;k++){const a=k/8*Math.PI*2;add(new THREE.DodecahedronGeometry(.16,0),stone,fx+Math.cos(a)*.55,.08,fz+Math.sin(a)*.55,isle)}
      for(const a of [0,1.1,2.2]){const log=cyl(.07,.07,1,6,MAT.darkWood,fx,.12,fz,isle);log.rotation.set(Math.PI/2,a,0)}
      const flameMat=own(new THREE.MeshBasicMaterial({color:0xffa040})),coreMat=own(new THREE.MeshBasicMaterial({color:0xffe08a}));
      for(const [m2,s,dx] of [[flameMat,1,0],[coreMat,.6,.05],[flameMat,.7,-.12]]){const f=add(new THREE.ConeGeometry(.2*s,.7*s,7),m2,fx+dx,.45*s,fz,isle);flames.push({mesh:f,base:s,phase:Math.random()*6})}
      lamp(isle,0xff9a4a,5,10,fx,.9,fz);block(fx,fz,1.3,1.3);
      // The calendar: a great cross by the shore with a notch for every day.
      const kx=ix+1.2,kz=iz-2.5,postTex=calendarTexture();
      const post=box(.3,2.6,.3,MAT.wood2,kx,1.3,kz,isle),bar=box(1.7,.3,.26,MAT.wood2,kx,2.05,kz,isle);
      const face=add(new THREE.PlaneGeometry(.26,.9),std({map:postTex,roughness:1}),kx,1,kz+.16,isle),words=add(new THREE.PlaneGeometry(1.6,.28),std({map:inscriptionTexture(),roughness:1}),kx,2.05,kz+.14,isle);
      const calendarData={type:'isle-calendar',title:'Crusoe’s calendar',author:'',action:'READ'};for(const part of [post,bar,face,words])mark(part,calendarData);state.calendar={face,data:calendarData};block(kx,kz,.6,.6);
      // Poll on her perch. She says nothing unless spoken to.
      const px=ix-8.8,pz=iz-1.8;cyl(.05,.06,1.6,8,MAT.darkWood,px,.8,pz,isle);box(.7,.05,.05,MAT.darkWood,px,1.6,pz,isle);block(px,pz,.5,.5);
      const poll=new THREE.Group();poll.position.set(px,1.62,pz);isle.add(poll);
      const green=std({color:0x2f8f45,roughness:.7}),red=std({color:0xc0392b,roughness:.7}),grey=std({color:0x3a3a3a,roughness:.6});
      const body=add(new THREE.SphereGeometry(.13,12,10),green,0,.2,0,poll);body.scale.set(1,1.45,1);const head=add(new THREE.SphereGeometry(.09,12,10),red,0,.43,.02,poll);
      const beak=add(new THREE.ConeGeometry(.035,.09,8),grey,0,.42,.11,poll);beak.rotation.x=Math.PI/2;const tail=box(.07,.26,.03,green,0,.05,-.1,poll);tail.rotation.x=.45;
      for(const side of [-1,1]){const wing=box(.03,.2,.14,std({color:0xe0b43a,roughness:.7}),side*.12,.22,-.01,poll);wing.rotation.z=side*.12}
      const pollData={type:'isle-poll',title:'Poll the parrot',author:'She watches you with one bright eye.',action:'SPEAK TO POLL'};for(const part of [body,head,beak,tail])mark(part,pollData);state.poll={group:poll,head};
      // The castaways' library: a driftwood shelf, and Crusoe's own story on a sea chest.
      const drift=std({color:0x9a8b72,roughness:1}),sx=ix+10.8,sz=iz-2.5;
      for(const y of [.95,2.05])box(.4,.08,4.4,drift,sx,y,sz,isle);for(const dz of [-2.1,2.1])box(.12,2.4,.12,drift,sx,1.2,sz+dz,isle);block(sx,sz,.7,4.6);
      SHELF_BOOKS.forEach((id,i)=>{const row=i<3?0:1,col=row?i-3:i;placeBook(id,isle,sx-.03,row?2.6:1.5,sz-1.4+col*(row?2.8:1.4)+(row?-.0:0),-Math.PI/2)});
      sign('THE CASTAWAYS’ LIBRARY',2.4,.34,isle,sx-.22,3.2,sz).rotation.y=-Math.PI/2;
      const chestX=ix+8.6,chestZ=iz+2.5;box(1.1,.6,.7,MAT.darkWood,chestX,.3,chestZ,isle);box(1.14,.06,.74,MAT.brass,chestX,.62,chestZ,isle);placeBook(CRUSOE,isle,chestX,.92,chestZ,0,-.9);block(chestX,chestZ,1.3,.9);
      // Stevenson's map, and a mark on the western shore.
      const mx=ix+5.5,mz=iz+8.5;cyl(.06,.06,1.8,8,MAT.darkWood,mx,.9,mz,isle);const mapBoard=add(new THREE.PlaneGeometry(1.2,.9),std({map:mapTexture(),roughness:.9}),mx,1.55,mz+.05,isle);
      mark(mapBoard,{type:'isle-map',title:'A map pinned to a post',author:'Stevenson’s island, with an X on its western shore. This island has a western shore too.',action:'READ'});block(mx,mz,.4,.4);
      const dx=ix-12.5,dz=iz+6.5,sandMat=std({color:0xcfb383,roughness:1});const mound=add(new THREE.SphereGeometry(.7,14,8),sandMat,dx,-.25,dz,isle);mound.scale.y=.5;
      const xMat=std({color:0x5a3a20,roughness:1});for(const r of [.8,-.8]){const bar2=box(.9,.03,.12,xMat,dx,.1,dz,isle);bar2.rotation.y=r}
      const digData={type:'isle-dig',title:'A mark in the sand',author:'Someone has scratched an X here, and left a spade.',action:'DIG'};mark(mound,digData);
      const spade=box(.08,1.1,.05,MAT.darkWood,dx+.9,.55,dz-.3,isle);spade.rotation.z=.25;mark(spade,digData);
      const chest=new THREE.Group();chest.position.set(dx,-1,dz);isle.add(chest);box(.8,.45,.5,MAT.darkWood,0,.22,0,chest);for(const bx of [-.3,.3])box(.05,.47,.52,MAT.brass,bx,.22,0,chest);
      const lid=new THREE.Group();lid.position.set(0,.45,-.25);chest.add(lid);box(.82,.12,.52,MAT.darkWood,0,.06,.25,lid);chest.visible=false;
      state.chest={group:chest,lid,mound,x:dx,z:dz};block(dx,dz,1.1,1.1);
      // The footprint.
      const fpx=ix-16,fpz=iz+4;const print=add(new THREE.PlaneGeometry(.34,.52),own(new THREE.MeshBasicMaterial({map:footprintTexture(),transparent:true,depthWrite:false,color:0xd2b88a})),fpx,.012,fpz,isle);print.rotation.x=-Math.PI/2;print.rotation.z=.4;
      mark(print,{type:'isle-footprint',title:'A footprint',author:'A single bare footprint, and no others near it.',action:'LOOK CLOSER'});
      // The spyglass on the eastern point, and a ship far out.
      const gx=ix+16.5,gz=iz-1;for(const a of [0,2.1,4.2]){const leg=cyl(.025,.025,1.3,6,MAT.darkWood,gx+Math.cos(a)*.22,.62,gz+Math.sin(a)*.22,isle);leg.rotation.set(Math.sin(a)*.18,0,-Math.cos(a)*.18)}
      const glassTube=cyl(.06,.045,.9,10,MAT.brass,gx,1.32,gz,isle);glassTube.rotation.z=Math.PI/2;mark(glassTube,{type:'isle-spyglass',title:'A brass spyglass',author:'Trained on the eastern horizon.',action:'LOOK THROUGH'});block(gx,gz,.7,.7);
      state.ship=buildShip();
      // The signal fire, built and waiting.
      const sfx=ix+11,sfz=iz+7.5;for(let k=0;k<6;k++){const a=k/6*Math.PI*2,log=cyl(.06,.07,1.6,6,MAT.darkWood,sfx+Math.cos(a)*.22,.7,sfz+Math.sin(a)*.22,isle);log.rotation.set(Math.sin(a)*.32,0,-Math.cos(a)*.32)}
      const fireData={type:'isle-fire',title:'A signal fire',author:'Dry wood and palm leaves, stacked ready. A passing ship would see its smoke.',action:'LIGHT THE SIGNAL FIRE'};mark(add(new THREE.ConeGeometry(.55,1.1,7),std({color:0x7d6a45,roughness:1}),sfx,.55,sfz,isle),fireData);block(sfx,sfz,1.2,1.2);
      state.fire={x:sfx,z:sfz,flames:[],light:null};
      // The boat drawn up on the beach, for rowing home.
      buildBoat(isle,ix+2.6,iz+14.4,{type:'isle-return',title:'The rowing boat',author:'Drawn up on the sand, ready for the row home.',action:'ROW BACK TO THE BOATHOUSE'},Math.PI/2);
      state.bottle=add(new THREE.CylinderGeometry(.07,.08,.32,10),std({color:0x5f8f78,roughness:.2,metalness:.1}),BOAT_START.x-1.8,SEA_Y+.05,lerp(BOAT_START.z,LANDING.z,.52),root||isle);state.bottle.rotation.z=1.3;
      scene.add(isle);
    }
    function buildPalms(ix,iz){
      const spots=[[-17,1],[-14,-8],[-10,9],[10,8],[15,2],[11,-10],[6,-14],[-6,-15],[-20,-4],[3,11]],segs=7,trunks=[],fronds=[];
      for(const [dx,dz] of spots){
        const x=ix+dx,z=iz+dz,lean=(Math.random()-.5)*.5,dir=Math.random()*Math.PI*2;let px=x,py=0,pz=z;
        for(let s=0;s<segs;s++){const bend=lean*s/segs;px+=Math.cos(dir)*bend*.35;pz+=Math.sin(dir)*bend*.35;trunks.push([px,py+.45,pz,bend,dir,1-s*.06]);py+=.88}
        for(let k=0;k<8;k++)fronds.push([px,py,pz,k/8*Math.PI*2+Math.random()*.3]);block(x,z,.7,.7);
      }
      const m=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),s=new THREE.Vector3(),p=new THREE.Vector3();
      const trunk=new THREE.InstancedMesh(own(new THREE.CylinderGeometry(.16,.21,.95,7)),std({color:0x6b5237,roughness:.95}),trunks.length);
      trunks.forEach(([x,y,z,bend,dir,scale],i)=>{e.set(Math.sin(dir)*bend*.6,0,-Math.cos(dir)*bend*.6);q.setFromEuler(e);s.set(scale,1,scale);p.set(x,y,z);m.compose(p,q,s);trunk.setMatrixAt(i,m)});
      const frond=new THREE.InstancedMesh(own(new THREE.BoxGeometry(2.8,.03,.5)),std({color:0x3d6b2d,roughness:.8}),fronds.length);
      fronds.forEach(([x,y,z,a],i)=>{e.set(0,a,-.38,'YXZ');q.setFromEuler(e);s.set(1,1,1);p.set(x+Math.cos(a)*1.25,y-.35,z-Math.sin(a)*1.25);m.compose(p,q,s);frond.setMatrixAt(i,m)});
      trunk.instanceMatrix.needsUpdate=frond.instanceMatrix.needsUpdate=true;isle.add(trunk,frond);
    }
    function buildShip(){
      const g=new THREE.Group();g.position.set(SHIP.x,SEA_Y+.4,SHIP.z);g.rotation.y=Math.PI/2;isle.add(g);
      const dark=std({color:0x2c2118,roughness:.9}),sail=std({color:0xf1e6cf,roughness:.9});
      box(1.8,1.1,7,dark,0,.2,0,g);for(const [mz,h] of [[-2,6],[0,7.2],[2.2,5.4]]){cyl(.08,.1,h,6,dark,0,h/2+.6,mz,g);for(const y of [h*.45,h*.8])box(2.4,h*.32,.05,sail,0,y+.6,mz+.12,g)}
      return g;
    }

    // ---------- where the reader can walk ----------
    const inRect=(r,x,z)=>x>r.x0&&x<r.x1&&z>r.z0&&z<r.z1;
    const inEllipse=(x,z,rx,rz)=>((x-ISLE.x)/rx)**2+((z-ISLE.z)/rz)**2<1;
    function zoneAt(x,z){if(travel)return 'boathouse';if(inRect(HOUSE,x,z)||inRect(JETTY,x,z))return 'boathouse';if(inEllipse(x,z,SAND.rx,SAND.rz))return 'crusoe-island';return null}
    function contains(x,z){return inRect(HOUSE,x,z)||inRect(JETTY,x,z)||inEllipse(x,z,SAND.rx,SAND.rz)}
    function floorAt(x,z){return contains(x,z)?0:null}
    function allowed(x,z){
      const r=player.radius||.42;
      if(inEllipse(x,z,SAND.rx,SAND.rz)){if(!isle||!inEllipse(x,z,ISLE.rx-r,ISLE.rz-r))return false}
      else{const house={x0:HOUSE.x0+.4,x1:HOUSE.x1-.4,z0:HOUSE.z0,z1:HOUSE.z1-.4},fits=(px,pz)=>inRect(house,px,pz)||inRect(JETTY,px,pz);for(const [dx,dz] of [[r,0],[-r,0],[0,r],[0,-r],[r*.7,r*.7],[-r*.7,r*.7],[r*.7,-r*.7],[-r*.7,-r*.7]])if(!fits(x+dx,z+dz))return false}
      return !blockers.some(b=>x+r>b.minX&&x-r<b.maxX&&z+r>b.minZ&&z-r<b.maxZ);
    }
    const onSand=(x,z)=>!!isle&&inEllipse(x,z,SAND.rx,SAND.rz);

    // ---------- the sunrise ----------
    // Reuses the library's own moonlight and sky light: coloured and turned toward the rising sun while the
    // reader is out here, and put back exactly as they were on the way home. No new lights, no new shaders.
    const NIGHT={background:new THREE.Color(0x070a14),fog:new THREE.Color(0x0e1520),sky:new THREE.Color(0x1b2433),sea:new THREE.Color(0x2c434d)},DAWN={background:new THREE.Color(0x6d86b8),fog:new THREE.Color(0xf0c49c),sky:new THREE.Color(0xffffff),sun:new THREE.Color(0xffc27d),skyLight:new THREE.Color(0xffe0bd),ground:new THREE.Color(0xd8b27c)};
    const tmp=new THREE.Color(),sunPosition=new THREE.Vector3(0,22,-100);
    function applyAtmosphere(d){
      if(!applied){saved={background:scene.background.clone(),fogDensity:scene.fog.density,moonColor:moon.color.clone(),moonPosition:moon.position.clone(),skyColor:ambient.color.clone(),groundColor:ambient.groundColor?.clone()}}
      applied=true;
      scene.background.copy(NIGHT.background).lerp(DAWN.background,d);scene.fog.color.copy(NIGHT.fog).lerp(DAWN.fog,d);scene.fog.density=lerp(.012,.0045,d);
      state.sky?.material.color.copy(NIGHT.sky).lerp(DAWN.sky,d);state.seaMat?.color.copy(NIGHT.sea).lerp(DAWN.sky,d);
      moon.color.copy(saved.moonColor).lerp(DAWN.sun,d);moon.intensity=lerp(1.1,2.5,d);moon.position.copy(saved.moonPosition).lerp(sunPosition,d);
      ambient.color.copy(saved.skyColor).lerp(DAWN.skyLight,d);if(ambient.groundColor)ambient.groundColor.copy(saved.groundColor).lerp(DAWN.ground,d);ambient.intensity=lerp(1.3,1.75,d);
      renderer.toneMappingExposure=lerp(1.85,1.4,d);
    }
    function restoreAtmosphere(){if(!applied||!saved)return;scene.background.copy(saved.background);scene.fog.color.copy(saved.background);scene.fog.density=saved.fogDensity;moon.color.copy(saved.moonColor);moon.position.copy(saved.moonPosition);ambient.color.copy(saved.skyColor);if(ambient.groundColor)ambient.groundColor.copy(saved.groundColor);applied=false}

    // ---------- journeys ----------
    function boatAt(p){return {x:BOAT_START.x,z:lerp(BOAT_START.z,LANDING.z+1.4,p)}}
    function startCrossing(){
      if(travel||transition)return;if(!isle)buildIsland();
      travel={t:0,duration:isReducedMotion()?14:36,stroke:0};state.bottleSeen=false;
      showNotice('You untie the boat and push off. The oars dip, and the boathouse lamps grow small behind you.',6);analytics?.track('Journey Taken',{journey:'crusoe-island'});
    }
    function finishCrossing(){
      travel=null;state.boat.position.set(BOAT_START.x,SEA_Y+.15,BOAT_START.z);landed=true;dawn=1;
      try{if(!firstLanding())storage?.setItem('athenaeum-island-first',String(Date.now()))}catch(e){}
      refreshCalendar();move(LANDING.x,LANDING.z-.4,0);
      showNotice('Sunrise. The boat grounds on a small island. Somewhere nearby, someone has been counting the days.',7);
    }
    function refreshCalendar(){if(!state.calendar)return;const material=state.calendar.face.material,old=material.map;material.map=calendarTexture();material.needsUpdate=true;if(old){old.dispose();owned.splice(owned.indexOf(old),1)}}
    function beginTransition(action,message){if(transition)return;transition={t:0,action,message,done:false}}
    function goHome(){beginTransition(()=>{landed=false;dawn=0;move(HALL_SPOT.x,HALL_SPOT.z,HALL_SPOT.yaw)},'The Grand Hall again, lamplit and dry. Your boots still have sand on them.')}

    // ---------- interaction ----------
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('isle-'))return false;
      if(transition||travel)return true;
      switch(data.type){
        case 'isle-door':enter();return true;
        case 'isle-exit':move(HALL_SPOT.x,HALL_SPOT.z,HALL_SPOT.yaw);playSample?.('doorOpen',.8,1);showNotice('The Grand Hall again. Behind you, faintly, the sea.',4);return true;
        case 'isle-boat':startCrossing();return true;
        case 'isle-return':beginTransition(()=>{landed=false;dawn=0;move(-420,321.5,Math.PI)},'Back at the boathouse. Behind you, the sea is dark again.');return true;
        case 'isle-calendar':{const days=daysAshore();showNotice(`${QUOTES.calendar} You first came ashore ${days?`${days} day${days===1?'':'s'} ago`:'today'}.`,9);return true}
        case 'isle-poll':state.pollTalk=1.6;sound?.(1500,.16,'sawtooth',.045);setTimeout(()=>sound?.(1900,.12,'square',.03),160);showNotice(QUOTES.poll,6);return true;
        case 'isle-footprint':showNotice(QUOTES.footprint,10);analytics?.track('Secret Found',{secret:'crusoe-footprint'});return true;
        case 'isle-map':showNotice(data.author,6);return true;
        case 'isle-dig':dig();return true;
        case 'isle-spyglass':lookThroughSpyglass();return true;
        case 'isle-fire':lightFire();return true;
      }
      return false;
    }
    function enter(){activate();if(!isle)buildIsland();landed=false;dawn=0;move(-420,333.4,0);playSample?.('doorOpen',.8,.95);showNotice('The boathouse. Beyond the jetty the sea is dark and very still, and a boat is waiting.',6);analytics?.track('Room Explored',{room:'boathouse'})}
    function dig(){
      if(state.dug){showNotice(state.chestOpen?QUOTES.chest:'Nothing more down there.',6);return}
      state.dug=true;for(let k=0;k<4;k++)setTimeout(()=>noise?.(.25,.12,520),k*380);
      const chest=state.chest;chest.group.visible=true;chest.mound.visible=false;chest.rise=0;
      setTimeout(()=>{state.chestOpen=1;if(state.chest===chest)placeBook(TREASURE,chest.group,0,.62,.02,0,-1.1);showNotice(QUOTES.chest,8);analytics?.track('Secret Found',{secret:'treasure-chest'})},1900);
    }
    function lookThroughSpyglass(){
      const dx=SHIP.x-player.pos.x,dz=state.ship.position.z-player.pos.z;player.yaw=Math.atan2(-dx,-dz);player.pitch=.01;
      spy={t:0,x:player.pos.x,z:player.pos.z};showNotice('Through the glass: a ship under full sail, far out on the gold water, heading somewhere else.',6);
    }
    function lightFire(){
      const fire=state.fire;if(fire.light){showNotice('The fire is burning. Someone out there will have seen it by now.',4);return}
      const flameMat=own(new THREE.MeshBasicMaterial({color:0xff8a30})),core=own(new THREE.MeshBasicMaterial({color:0xffd070}));
      for(const [m,s,dx] of [[flameMat,1.4,0],[core,.9,.08],[flameMat,1,-.15]]){const f=add(new THREE.ConeGeometry(.3*s,1.1*s,7),m,fire.x+dx,.7*s,fire.z,isle);flames.push({mesh:f,base:s,phase:Math.random()*6})}
      fire.light=lamp(isle,0xff8a3a,6,14,fire.x,1.4,fire.z);for(let k=0;k<5;k++)setTimeout(()=>noise?.(.35,.07,900),k*260);
      showNotice('The dry leaves catch at once, and a column of smoke climbs into the morning.',5);
      setTimeout(()=>{if(isle&&zoneAt(player.pos.x,player.pos.z)==='crusoe-island')goHome()},isReducedMotion()?3500:7000);
    }

    // ---------- lifecycle ----------
    function activate(){if(!root)buildWorld();lastNeeded=time}
    function unload(){
      restoreAtmosphere();for(const group of [root,isle]){if(!group)continue;group.removeFromParent();group.traverse(o=>{o.geometry?.dispose?.()})}
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;blockers.length=0;flames.length=0;books.length=0;
      root=isle=null;Object.assign(state,{chest:null,chestOpen:0,dug:false,fire:null,poll:null,sea:null,seaMat:null,sky:null,boat:null,bottle:null,ship:null,calendar:null});landed=false;dawn=0;
    }
    function reset(){travel=null;transition=null;spy=null;if(camera.userData)camera.userData.zoom=0;fade?.(0);restoreAtmosphere()}
    function update(t,dt){
      time=t;const reduced=isReducedMotion();
      let where=zoneAt(player.pos.x,player.pos.z);const nearDoor=Math.hypot(player.pos.x-DOOR.x,player.pos.z-DOOR.z)<PRELOAD;
      if(where||nearDoor||travel||transition)activate();
      if(where==='boathouse'&&!isle&&!travel)buildIsland();
      if(root&&!where&&!travel&&!transition&&!nearDoor&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==b.userData.home.parent))unload();
      if(transition){
        transition.t+=dt;const out=reduced?.15:.6;fade?.(transition.t<out?transition.t/out:clamp(1-(transition.t-out-.15)/out,0,1));
        if(!transition.done&&transition.t>=out){transition.done=true;transition.action();where=zoneAt(player.pos.x,player.pos.z);if(transition.message)showNotice(transition.message,6)}
        if(transition.t>=out*2+.15){transition=null;fade?.(0)}
      }
      if(travel){
        travel.t+=dt;const p=clamp(travel.t/travel.duration,0,1),e=smooth(p),at=boatAt(e),bob=reduced?0:Math.sin(t*1.7)*.06;
        dawn=smooth(clamp((p-.1)/.75,0,1));state.boat.position.set(at.x,SEA_Y+.15+bob,at.z);state.boat.rotation.x=reduced?0:Math.sin(t*1.3)*.03;
        player.pos.set(at.x,0,at.z);camera.position.set(at.x,1.25+bob,at.z+.4);camera.rotation.set(reduced?0:.02+Math.sin(t*.9)*.01,reduced?0:Math.sin(t*.4)*.05,0,'YXZ');
        travel.stroke-=dt;if(travel.stroke<=0){travel.stroke=2.4;sound?.(95,.35,'triangle',.05);setTimeout(()=>noise?.(.45,.06,650),220)}
        if(!state.bottleSeen&&state.bottle&&Math.abs(at.z-state.bottle.position.z)<4){state.bottleSeen=true;showNotice(QUOTES.bottle,9)}
        if(p>=1)finishCrossing();
      }
      else if(where==='crusoe-island')dawn=1;else if(where==='boathouse'&&!transition)dawn=0;
      if(where||travel||(transition&&!transition.done))applyAtmosphere(dawn);else restoreAtmosphere();
      if(!root)return;
      state.sky.position.set(camera.position.x,38,camera.position.z);
      state.sea.normal.offset.set(t*.012,t*.008);
      if(!travel)state.boat.position.y=SEA_Y+.15+(reduced?0:Math.sin(t*1.4)*.04);
      if(state.bottle)state.bottle.position.y=SEA_Y+.05+(reduced?0:Math.sin(t*2.1)*.04);
      for(const f of flames)f.mesh.scale.set(1,reduced?1:1+Math.sin(t*9+f.phase)*.12+Math.sin(t*15.3+f.phase)*.06,1);
      if(state.ship)state.ship.position.z=SHIP.z+Math.sin(t*.02)*30;
      if(state.poll){state.pollTalk=Math.max(0,state.pollTalk-dt);state.poll.head.rotation.x=state.pollTalk>0?Math.sin(t*14)*.25:0}
      if(state.chest?.group.visible){const c=state.chest.group;c.position.y=Math.min(.02,c.position.y+dt*.55);if(state.chestOpen)state.chest.lid.rotation.x=Math.max(-1.9,state.chest.lid.rotation.x-dt*1.6)}
      if(spy){spy.t+=dt;const moved=Math.hypot(player.pos.x-spy.x,player.pos.z-spy.z)>.6;camera.userData.zoom=spy.t<5.5&&!moved?46:0;if(spy.t>6||moved){spy=null;camera.userData.zoom=0}}
    }
    buildDoor();
    return {contains,floorAt,allowed,interact,update,reset,zoneAt,onSand,door:DOOR,enter,
      get travelling(){return !!travel||!!transition},get built(){return !!root},get islandBuilt(){return !!isle},get dawn(){return dawn},get landed(){return landed},
      get books(){return books.slice()},startCrossing,unload};
  };
})();
