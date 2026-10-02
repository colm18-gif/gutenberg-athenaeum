// The African Reading Room, reached by balloon. A hot-air balloon is moored in a corner of the roof garden; climb
// into its basket and it rises over the library and the old town, into the clouds, and drifts through the night
// (after Jules Verne's Five Weeks in a Balloon) until it sinks into a walled courtyard beside a baobab. The reading
// room opens off the courtyard: earthen walls in the Sahelian manner of Djenné and Timbuktu, three shelves (ancient
// Africa, African writers, and stories), a chest of manuscripts, a kora and a map. The balloon in the courtyard
// flies the reader home to the roof. Nothing but the moored balloon is built until the reader goes that way, and
// it is all freed a little while after they leave.
(function(){
  'use strict';

  // The new arrivals for each shelf (data/new-books.js, rooms african-*) are added to the books listed here, which
  // the library already holds.
  const SHELVES=[
    {key:'ancient',name:'ANCIENT AFRICA',sub:'Carthage, Numidia and the Nile',ids:[3296],max:8},
    {key:'voices',name:'AFRICAN WRITERS',sub:'The first African writers in English, and after',ids:[],max:10},
    {key:'tales',name:'STORIES',sub:'Tales and epics from across the continent',ids:[],max:8},
    {key:'balloon',name:'THE BALLOON',sub:'',ids:[3526],max:1}
  ];
  const RECORDS={3296:['The Confessions of St. Augustine','Saint Augustine'],3526:['Five Weeks in a Balloon','Jules Verne']};
  const CARDS={
    balloon:['A hot-air balloon','In Jules Verne’s Five Weeks in a Balloon (1863), Dr Samuel Fergusson crosses Africa from Zanzibar to the Senegal in a balloon called the Victoria. It was Verne’s first novel for his publisher Hetzel, and the first of his Extraordinary Voyages. This balloon is smaller, and takes one passenger.'],
    home:['The balloon','The same balloon, its burner ticking as it cools. It will take you back over the clouds to the roof garden.'],
    building:['Earth and palm wood','The walls are built in the Sahelian manner of Djenné and Timbuktu in Mali: sun-dried mud brick, plastered with more mud. The palm-wood beams that stick out of them, called toron, are both decoration and scaffolding: in Djenné the townspeople climb them every year to replaster the Great Mosque together, the largest mud-brick building in the world.'],
    baobab:['A baobab','The baobab stores water in its swollen trunk to see it through the dry season, and some have lived for more than two thousand years. In many villages its shade is where people gather.'],
    manuscripts:['A chest of manuscripts','From the fifteenth century Timbuktu was a city of scholars, and its families kept hundreds of thousands of manuscripts, on law, astronomy, medicine, poetry and much else, in private libraries. When armed groups occupied the city in 2012, librarians smuggled most of them south to safety in Bamako, a few trunks at a time. Hardly any of them are in print, and none are on these shelves: they are here so you know they exist.'],
    kora:['A kora','A harp-lute with twenty-one strings and a body made from half a calabash, played by the jeli, or griots, of the Mande peoples of West Africa. The jeli keep histories and genealogies in song, among them the epic of Sundiata Keita, who founded the Mali Empire in the thirteenth century.'],
    map:['A map of Africa','Where some of the writers on these shelves came from: Carthage (Terence), Madauros (Apuleius) and Thagaste (Augustine) in North Africa; Thebes on the Nile; Igboland, where Olaudah Equiano said he was born; Kimberley (Sol Plaatje) and the Eastern Cape (Olive Schreiner). Timbuktu and Djenné are marked for their manuscripts.'],
    shelves:['A small room','Africa has fifty-four countries and somewhere between 1,500 and 2,000 languages, and most of its literature was spoken or sung, or written by hand in Arabic, Ge’ez or Ajami scripts, long before it was printed. Little of it has reached the public domain in print, which is why this room is small. Suggestions for it are very welcome.'],
    sign:['The African Reading Room','Ancient Africa’s writers, the first Africans to publish in English, and stories gathered from across the continent. You came by balloon, as Verne’s travellers did.']
  };
  const OUT=[[.02,'The mooring rope slips free, and the roof garden drops away beneath the basket.'],
    [.1,'Below, the library’s lamps and the dark roofs of the old town, getting smaller.'],
    [.24,'Above the clouds. In Jules Verne’s Five Weeks in a Balloon, Dr Fergusson crossed Africa from Zanzibar to the Senegal in a balloon called the Victoria.'],
    [.44,'The burner roars now and then, and the envelope glows above you like a lantern.'],
    [.58,'The clouds open below: a river catching the moon, and the dark shapes of trees on the plain.'],
    [.72,'Ahead, a lantern in a walled courtyard. The balloon begins to sink.']];
  const BACK=[[.02,'Up out of the courtyard, past the baobab, into the night.'],
    [.3,'Over the clouds again, and north.'],
    [.72,'The lamps of the library, far below, and the roof garden waiting.']];
  // Africa and Madagascar, in degrees of longitude and latitude, and the places on the map.
  const AFRICA=[[-17,21],[-10,30],[-5,36],[10,37],[20,32],[32,31],[34,28],[43,12],[51,12],[42,-2],[40,-15],[35,-24],[32,-29],[20,-35],[18,-30],[12,-17],[13,-5],[9,4],[-8,4],[-17,14]];
  const MADAGASCAR=[[44,-25],[47,-25],[50,-15],[49,-12],[44,-17]];
  const PLACES=[['Carthage',10.3,36.8],['Thagaste',8,36.3],['Madauros',7.8,35.6],['Thebes',32.6,25.7],['Timbuktu',-3,16.8],['Djenné',-4.6,13.9],['Igboland',7.5,6],['Kimberley',24.8,-28.7],['Eastern Cape',26.5,-32.5]];

  window.createAfricanRoom=function(options){
    const {THREE,scene,MAT,player,camera,interactables,canvasTexture,bookMaterial,findBook,arrivals={},showNotice,playSample,sound,moveTo,floorAt:libraryFloor=()=>null,
      prepareRoof=()=>{},analytics,isHolding=()=>false,isReducedMotion=()=>false,registerSeat=null,overlay=null}=options;
    // The mooring on the roof garden, in its south-west corner clear of the canopy; the room, far off to the west.
    const MOOR={x:-13,y:10,z:51.5},YARD={cx:-600,cz:-294,w:16,d:16,h:3.4},ROOM={cx:-600,cz:-309,w:18,d:14,h:5.6};
    const PARK={x:YARD.cx-3.6,z:YARD.cz+2.6},SKY={x:-900,y:300,z:-600},DOOR={x:YARD.cx,w:2.4,h:3.3},KEEP=25;
    // Landing beside the basket, facing the doorway of the reading room.
    const FACE_DOOR=Math.atan2(-(DOOR.x-(PARK.x+1.8)),-((YARD.cz-YARD.d/2)-(PARK.z+.8)));
    const TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),smooth=p=>p*p*(3-2*p);
    let roof=null,root=null,sky=null,flight=null,time=0,lastNeeded=-1e9,lantern=null,laughOff=0;
    const owned=[],ours=[],books=[],blockers=[],roofOwned=[],roofOurs=[];
    const own=thing=>{owned.push(thing);return thing},ownRoof=thing=>{roofOwned.push(thing);return thing};
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    function mark(object,data,list=ours){object.userData=data;interactables.push(object);list.push(object);return object}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const card=key=>({type:'african-card',title:CARDS[key][0],author:CARDS[key][1],action:'READ'});

    // ---------- the balloon ----------
    // A wicker basket, ropes up to the mouth of the envelope, a burner, and an envelope of red and ochre gores.
    // The two balloon textures are made once and shared by every balloon, so they are never freed.
    const textures={};
    function wicker(){return textures.wicker||(textures.wicker=canvasTexture((c,W,H)=>{c.fillStyle='#6a4a26';c.fillRect(0,0,W,H);for(let y=0;y<H;y+=8)for(let x=0;x<W;x+=16){c.fillStyle=(x/16+y/8)%2?'#a07a44':'#8a6434';c.fillRect(x+((y/8)%2?8:0),y,14,6)}c.fillStyle='#4a3218';c.fillRect(0,0,W,10);c.fillRect(0,H-10,W,10)},128,128))}
    function gores(){return textures.gores||(textures.gores=canvasTexture((c,W,H)=>{const n=12;for(let i=0;i<n;i++){c.fillStyle=i%2?'#a8321f':'#d39a3c';c.fillRect(i*W/n,0,W/n+1,H)}
      c.fillStyle='rgba(240,225,190,.9)';c.fillRect(0,H*.56,W,H*.05);c.fillStyle='#2a1a10';c.font='bold 26px Georgia';c.textAlign='center';for(let i=0;i<3;i++)c.fillText('VICTORIA',W*(i+.5)/3,H*.6);
      c.fillStyle='rgba(0,0,0,.18)';for(let i=0;i<n;i++)c.fillRect(i*W/n,0,2,H)},1024,512))}
    function makeBalloon(parent,keep){
      const g=new THREE.Group();parent.add(g);
      const basket=add(keep(new THREE.BoxGeometry(1.5,1.05,1.5)),keep(new THREE.MeshStandardMaterial({map:wicker(),roughness:1})),0,.52,0,g);
      const profile=[[.5,3.2],[.9,3.9],[1.9,5],[2.65,6.3],[2.8,7.2],[2.55,8.2],[1.9,8.95],[.9,9.35],[.01,9.45]].map(([r,y])=>new THREE.Vector2(r,y));
      const envelope=add(keep(new THREE.LatheGeometry(profile,24)),keep(new THREE.MeshStandardMaterial({map:gores(),roughness:.8,side:THREE.DoubleSide,emissive:0xff8a30,emissiveIntensity:0})),0,0,0,g);
      const pts=[];for(const [x,z] of [[-.7,-.7],[.7,-.7],[.7,.7],[-.7,.7]]){pts.push(x,1.05,z,x*.72,3.25,z*.72);pts.push(x,1.05,z,0,2.45,0)}
      const ropes=new THREE.BufferGeometry();ropes.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));g.add(new THREE.LineSegments(keep(ropes),keep(new THREE.LineBasicMaterial({color:0x3a2a1a}))));
      add(keep(new THREE.CylinderGeometry(.16,.2,.3,10)),MAT.brass,0,2.45,0,g);
      const flame=add(keep(new THREE.ConeGeometry(.18,.7,8)),keep(new THREE.MeshBasicMaterial({color:0xffa040,transparent:true,opacity:.9})),0,2.95,0,g);flame.visible=false;
      return {group:g,basket,envelope,flame,burnUntil:0};
    }
    function fire(b,seconds=1.2){if(!b)return;b.burnUntil=time+seconds;sound?.(70,seconds*.9,'sawtooth',.03);sound?.(140,seconds*.6,'triangle',.02)}
    function updateBalloon(b,reduced){
      if(!b)return;const on=time<b.burnUntil;b.flame.visible=on;b.flame.scale.y=on?1+(reduced?0:Math.sin(time*40)*.2):1;
      b.envelope.material.emissiveIntensity+=((on?.55:.08)-b.envelope.material.emissiveIntensity)*.12;
    }

    // ---------- the roof garden: the moored balloon ----------
    const roofData={type:'african-balloon',title:CARDS.balloon[0],author:'Moored to the parapet, burner ticking. Climb into the basket to fly.',action:'CLIMB IN'};
    function buildRoof(){
      if(roof)return;roof=makeBalloon(scene,ownRoof);roof.group.name='african-balloon';roof.group.position.set(MOOR.x,MOOR.y,MOOR.z);
      mark(roof.basket,roofData,roofOurs);mark(roof.envelope,roofData,roofOurs);
      const stake=add(ownRoof(new THREE.CylinderGeometry(.05,.07,.6,6)),MAT.brass,1.6,.3,-1.2,roof.group);
      mark(stake,{type:'african-card',title:CARDS.balloon[0],author:CARDS.balloon[1],action:'READ'},roofOurs);
    }
    function freeRoof(){
      if(!roof)return;roof.group.removeFromParent();roof=null;
      for(let i=interactables.length-1;i>=0;i--)if(roofOurs.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of roofOwned.splice(0))thing.dispose?.();roofOurs.length=0;
    }
    const nearMoor=(x,y,z,r=.42)=>y>8&&Math.hypot(x-MOOR.x,z-MOOR.z)<1.15+r;

    // ---------- the courtyard and the reading room ----------
    function earth(c,W,H,base='#a8744a'){
      c.fillStyle=base;c.fillRect(0,0,W,H);let seed=4;const rand=()=>(seed=(seed*16807)%2147483647)/2147483647;
      for(let k=0;k<900;k++){c.fillStyle=`rgba(${rand()<.5?'60,30,10':'230,190,140'},.07)`;c.beginPath();c.ellipse(rand()*W,rand()*H,6+rand()*20,3+rand()*8,rand()*3,0,TAU);c.fill()}
    }
    function nightSky(c,W,H,trees=true){
      const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#02040c');g.addColorStop(.45,'#0a1430');g.addColorStop(.5,'#1a2236');g.addColorStop(1,'#05060a');c.fillStyle=g;c.fillRect(0,0,W,H);
      let seed=21;const rand=()=>(seed=(seed*16807)%2147483647)/2147483647;
      for(let i=0;i<W*H/700;i++){const y=rand()*H*.48,s=rand()*rand()*.9+.25;c.fillStyle=`rgba(255,250,235,${.3+rand()*.6})`;c.beginPath();c.arc(rand()*W,y,s,0,TAU);c.fill()}
      c.fillStyle='rgba(255,244,214,.95)';c.beginPath();c.arc(W*.3,H*.18,12,0,TAU);c.fill();c.fillStyle='#050a1c';c.beginPath();c.arc(W*.3+6,H*.18-3,11,0,TAU);c.fill();
      // Flat-topped acacias on the horizon (only from the ground).
      if(trees){c.fillStyle='#05060a';for(let k=0;k<14;k++){const x=rand()*W,y=H*.5,s=10+rand()*16;c.fillRect(x-1,y-s,2,s);c.beginPath();c.ellipse(x,y-s,s*1.4,s*.3,0,0,TAU);c.fill()}}
    }
    let farAway=null;
    function buildFar(){
      root=new THREE.Group();root.name='african-room';
      const {cx,cz,w,d,h}=YARD,R=ROOM;
      const mud=own(new THREE.MeshStandardMaterial({roughness:1,map:own(canvasTexture((c,W,H)=>earth(c,W,H),256,256))})),inner=own(new THREE.MeshStandardMaterial({roughness:1,map:own(canvasTexture((c,W,H)=>earth(c,W,H,'#c08a5c'),256,256))}));
      const sand=own(new THREE.MeshStandardMaterial({color:0xb08a5a,roughness:1})),palm=own(new THREE.MeshStandardMaterial({color:0x5a3e24,roughness:.9}));
      // The sky over the courtyard: stars, a crescent moon, acacias on the horizon.
      add(own(new THREE.SphereGeometry(90,24,12)),own(new THREE.MeshBasicMaterial({map:own(canvasTexture(nightSky,1024,512)),side:THREE.BackSide,fog:false})),cx,0,cz,root);
      // The courtyard: a sand floor and low walls with rounded copings.
      box(w,.3,d,sand,cx,-.15,cz,root);
      for(const s of [-1,1]){box(.6,h,d,mud,cx+s*w/2,h/2,cz,root);add(own(new THREE.CylinderGeometry(.3,.3,d,8,1,false,0,Math.PI)),mud,cx+s*w/2,h,cz,root).rotation.x=Math.PI/2}
      box(w,h,.6,mud,cx,h/2,cz+d/2,root);add(own(new THREE.CylinderGeometry(.3,.3,w,8,1,false,0,Math.PI)),mud,cx,h,cz+d/2,root).rotation.set(Math.PI/2,0,Math.PI/2);
      // The façade of the reading room: tall, with buttresses rising into pinnacles, and toron beams set in rows.
      const fz=cz-d/2,fh=7.2,side=(w-DOOR.w)/2;
      for(const s of [-1,1])box(side,fh,.8,mud,cx+s*(DOOR.w+side)/2,fh/2,fz,root);box(DOOR.w,fh-DOOR.h,.8,mud,cx,DOOR.h+(fh-DOOR.h)/2,fz,root);
      const cone=own(new THREE.ConeGeometry(.55,1.6,6));
      for(const x of [-7.6,-3.8,0,3.8,7.6]){box(1.1,fh+.4,1.2,mud,cx+x,(fh+.4)/2,fz+.2,root);add(cone,mud,cx+x,fh+1.2,fz+.2,root)}
      const torons=[];for(const y of [2.4,4.2,6])for(let x=-7.2;x<=7.2;x+=.9)if(Math.abs(x)>1.5)torons.push([cx+x,y,fz+.75]);
      const toronMesh=new THREE.InstancedMesh(own(new THREE.CylinderGeometry(.06,.07,.7,5)),palm,torons.length),m4=new THREE.Matrix4(),q=new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI/2,0,0));
      torons.forEach(([x,y,z],i)=>{m4.compose(new THREE.Vector3(x,y,z),q,new THREE.Vector3(1,1,1));toronMesh.setMatrixAt(i,m4)});root.add(toronMesh);
      const facadeCard=add(own(new THREE.PlaneGeometry(4,3)),own(new THREE.MeshBasicMaterial({visible:false})),cx-5,2.5,fz+.45,root);mark(facadeCard,card('building'));
      block(cx-(DOOR.w+side)/2,fz,side+.2,1.4);block(cx+(DOOR.w+side)/2,fz,side+.2,1.4);
      mark(sign(root,'THE AFRICAN READING ROOM','Karibu · Welcome · Barka da zuwa',3.6,.62,cx,DOOR.h+.75,fz+.43),card('sign'));
      // A baobab in the courtyard's far corner, and a lantern on a post by the door.
      baobab(cx+5,cz+4.6,mud);
      lantern=new THREE.PointLight(0xffb060,5,18,1.7);lantern.position.set(cx+1.8,2.6,fz+1.6);root.add(lantern);
      add(own(new THREE.CylinderGeometry(.05,.06,2.4,6)),palm,cx+1.8,1.2,fz+1.6,root);
      add(own(new THREE.BoxGeometry(.28,.36,.28)),own(new THREE.MeshStandardMaterial({color:0xffd7a0,emissive:0xffa040,emissiveIntensity:1.4})),cx+1.8,2.55,fz+1.6,root);
      // The balloon that flies home, and Verne's book in its basket.
      farAway=makeBalloon(root,own);farAway.group.position.set(PARK.x,0,PARK.z);farAway.group.rotation.y=.6;
      const homeData={type:'african-balloon-home',title:CARDS.home[0],author:CARDS.home[1],action:'FLY HOME'};mark(farAway.basket,homeData);mark(farAway.envelope,homeData);block(PARK.x,PARK.z,1.9,1.9);
      const verne=shelfBooks('balloon')[0];if(verne)placeBook(verne,{x:PARK.x+.95,y:.62,z:PARK.z-.6,yaw:Math.PI*.8,lean:.3},'balloon',.5);
      box(.5,.5,.5,palm,PARK.x+.95,.25,PARK.z-.6,root);
      buildRoom(mud,inner,palm,sand);
      scene.add(root);
    }
    function baobab(x,z,bark){
      const g=new THREE.Group();g.position.set(x,0,z);root.add(g);const trunkMat=own(new THREE.MeshStandardMaterial({color:0x8a7a68,roughness:1}));
      const trunk=add(own(new THREE.CylinderGeometry(.75,1.15,4.2,10)),trunkMat,0,2.1,0,g);mark(trunk,card('baobab'));
      const limb=own(new THREE.CylinderGeometry(.08,.2,1.9,6));
      for(let k=0;k<7;k++){const a=k/7*TAU,b=add(limb,trunkMat,Math.cos(a)*.5,4.6,Math.sin(a)*.5,g);b.rotation.set(Math.sin(a)*.7,0,-Math.cos(a)*.7)}
      const leaves=own(new THREE.MeshStandardMaterial({color:0x2e3a22,roughness:1}));for(let k=0;k<5;k++){const a=k/5*TAU;add(own(new THREE.SphereGeometry(.7,8,6)),leaves,Math.cos(a)*1.3,5.4,Math.sin(a)*1.3,g).scale.y=.45}
      block(x,z,2.6,2.6);
    }
    function sign(parent,text,sub,w,h,x,y,z){
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle='#3a1e0e';c.fillRect(0,0,W,H);c.strokeStyle='#d8a050';c.lineWidth=5;c.strokeRect(6,6,W-12,H-12);
        // A border of small triangles, as painted on Sahelian doors and cloth.
        c.fillStyle='#d8a050';for(let x=14;x<W-14;x+=18){c.beginPath();c.moveTo(x,14);c.lineTo(x+9,24);c.lineTo(x+18,14);c.fill();c.beginPath();c.moveTo(x,H-14);c.lineTo(x+9,H-24);c.lineTo(x+18,H-14);c.fill()}
        c.fillStyle='#f3e2bc';c.textAlign='center';let size=30;do{c.font=`bold ${size}px Georgia`;size-=2}while(c.measureText(text).width>W-50);c.fillText(text,W/2,sub?54:H/2+11);if(sub){c.font='italic 20px Georgia';c.fillText(sub,W/2,82)}},560,sub?108:72));
      return add(own(new THREE.PlaneGeometry(w,h)),own(new THREE.MeshStandardMaterial({map,emissive:0x3a2210,emissiveIntensity:.4,roughness:.85})),x,y,z,parent);
    }
    function buildRoom(mud,inner,palm,sand){
      const {cx,cz,w,d,h}=ROOM,north=cz-d/2,west=cx-w/2,east=cx+w/2;
      box(w,.3,d,sand,cx,-.15,cz,root);
      box(w,h,.4,inner,cx,h/2,north,root);box(.4,h,d,inner,west,h/2,cz,root);box(.4,h,d,inner,east,h/2,cz,root);
      // The ceiling: palm-wood joists laid close under a mat, in one instanced mesh.
      box(w,.2,d,own(new THREE.MeshStandardMaterial({color:0x6a4a2a,roughness:1})),cx,h+.1,cz,root);
      const joists=new THREE.InstancedMesh(own(new THREE.CylinderGeometry(.07,.07,w,5)),palm,Math.floor(d/.45)),m4=new THREE.Matrix4(),q=new THREE.Quaternion().setFromEuler(new THREE.Euler(0,0,Math.PI/2));
      for(let i=0;i<joists.count;i++){m4.compose(new THREE.Vector3(cx,h-.05,north+.3+i*.45),q,new THREE.Vector3(1,1,1));joists.setMatrixAt(i,m4)}root.add(joists);
      // Rugs, a long bench with cushions (one of the library's seats), and a lamp.
      const rug=own(new THREE.MeshStandardMaterial({roughness:1,map:own(canvasTexture((c,W,H)=>{c.fillStyle='#7a2a1a';c.fillRect(0,0,W,H);for(let y=0;y<H;y+=32){c.fillStyle=(y/32)%2?'#d8a050':'#1a1a1a';for(let x=0;x<W;x+=32){c.beginPath();c.moveTo(x,y+16);c.lineTo(x+16,y);c.lineTo(x+32,y+16);c.lineTo(x+16,y+32);c.fill()}}c.strokeStyle='#f0e0c0';c.lineWidth=10;c.strokeRect(5,5,W-10,H-10)},256,384))}));
      add(own(new THREE.PlaneGeometry(4,6)),rug,cx,.012,cz+.5,root).rotation.x=-Math.PI/2;
      const bench=new THREE.Group();bench.position.set(cx,0,cz+3.6);root.add(bench);
      const seat=box(3.4,.42,.8,mud,0,.21,0,bench),cushion=own(new THREE.MeshStandardMaterial({color:0x2a3a6a,roughness:1}));for(const x of [-1.1,0,1.1])box(.9,.14,.7,cushion,x,.49,0,bench);block(cx,cz+3.6,3.6,1);
      if(registerSeat){const data=registerSeat([seat],bench,new THREE.Vector3(0,1.2,.1),0,{title:'A bench with cushions',author:'Sit and read one of the African Reading Room’s books.'});
        Object.defineProperty(data,'bookIds',{get:()=>books.filter(b=>b.userData.shelf!=='balloon').map(b=>b.userData.book.id),configurable:true});ours.push(seat)}
      const lamp=new THREE.PointLight(0xffc888,5,17,1.8);lamp.position.set(cx,h-1,cz);root.add(lamp);
      add(own(new THREE.SphereGeometry(.2,10,8)),own(new THREE.MeshStandardMaterial({color:0xffe2a8,emissive:0xffb35c,emissiveIntensity:1.2})),cx,h-.95,cz,root);
      // The shelves: writers along the north wall, ancient Africa on the west, stories on the east.
      // Each wall's books in two balanced rows, centred on the shelf: [along the wall, height] for book i of n.
      const step=1.75,rows=(n,i)=>{const top=Math.floor(n/2),lower=n-top,row=i<lower?0:1,inRow=row?top:lower,k=row?i-lower:i;return [(k-(inRow-1)/2)*step,row?2.85:1.55]};
      const wallBooks=(key,spot)=>{const list=shelfBooks(key);list.forEach((book,i)=>placeBook(book,spot(...rows(list.length,i)),key))};
      wallBooks('voices',(a,y)=>({x:cx+a,z:north+.3,y,yaw:0}));
      wallBooks('ancient',(a,y)=>({x:west+.3,z:cz+a,y,yaw:Math.PI/2}));wallBooks('tales',(a,y)=>({x:east-.3,z:cz-a,y,yaw:-Math.PI/2}));
      for(const y of [1.55,2.85]){box(9.2,.06,.34,palm,cx,y-.5,north+.34,root);box(.34,.06,7.2,palm,west+.34,y-.5,cz-.0,root);box(.34,.06,7.2,palm,east-.34,y-.5,cz,root)}
      block(cx,north+.4,9.4,.7);block(west+.4,cz,.7,7.4);block(east-.4,cz,.7,7.4);
      for(const [shelf,x,z,yaw] of [['voices',cx,north+.22,0],['ancient',west+.22,cz,Math.PI/2],['tales',east-.22,cz,-Math.PI/2]]){
        const s=SHELVES.find(v=>v.key===shelf),label=sign(root,s.name,s.sub,3,.54,x,4.1,z);label.rotation.y=yaw;mark(label,{type:'african-card',title:s.name,author:s.sub+'.',action:'READ'})}
      // A chest of manuscripts, a kora on its stand, and a map of Africa.
      const chest=box(1.3,.62,.7,palm,cx-6.4,.31,north+1.2,root);mark(chest,card('manuscripts'));
      const leather=own(new THREE.MeshStandardMaterial({color:0x7a4a22,roughness:.9}));for(const [dx,dz] of [[-.3,0],[0,.05],[.3,-.02]])box(.32,.12,.42,leather,cx-6.4+dx,.68,north+1.2+dz,root);block(cx-6.4,north+1.2,1.5,.9);
      kora(cx+6.3,north+1.3);
      const map=add(own(new THREE.PlaneGeometry(2.2,2.4)),own(new THREE.MeshBasicMaterial({color:0xd8ccb0,map:own(canvasTexture(drawMap,512,560))})),cx+6.6,2.6,north+.23,root);mark(map,card('map'));
      const note=add(own(new THREE.PlaneGeometry(1.4,.9)),own(new THREE.MeshBasicMaterial({color:0xd8ccb0,map:own(canvasTexture((c,W,H)=>{c.fillStyle='#efe4c8';c.fillRect(0,0,W,H);c.fillStyle='#3a2a1a';c.font='italic 26px Georgia';c.textAlign='center';['A small room,','and why.'].forEach((t,i)=>c.fillText(t,W/2,H/2-10+i*36))},384,256))})),cx-6.6,2.6,north+.23,root);mark(note,card('shelves'));
    }
    function kora(x,z){
      const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=-.5;root.add(g);const gourd=own(new THREE.MeshStandardMaterial({color:0xb07a3a,roughness:.7})),wood=own(new THREE.MeshStandardMaterial({color:0x4a2e18,roughness:.6}));
      box(.6,.5,.5,wood,0,.25,0,g);const body=add(own(new THREE.SphereGeometry(.32,12,8,0,TAU,0,Math.PI/2)),gourd,0,.55,0,g);body.rotation.x=-Math.PI/2;
      const neck=add(own(new THREE.CylinderGeometry(.03,.035,1.3,6)),wood,0,1.15,.05,g);
      const pts=[];for(let i=0;i<11;i++){const dx=-.12+i*.024;pts.push(dx,.62,.2,dx*.3,1.65,.06)}const strings=new THREE.BufferGeometry();strings.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));g.add(new THREE.LineSegments(own(strings),own(new THREE.LineBasicMaterial({color:0xe8dcc0}))));
      mark(body,card('kora'));mark(neck,card('kora'));block(x,z,.9,.9);
    }
    function drawMap(c,W,H){
      c.fillStyle='#e9dcbc';c.fillRect(0,0,W,H);const at=([lon,lat])=>[W*.08+(lon+20)/75*W*.84,H*.06+(38-lat)/75*H*.88];
      for(const shape of [AFRICA,MADAGASCAR]){c.beginPath();shape.forEach((p,i)=>i?c.lineTo(...at(p)):c.moveTo(...at(p)));c.closePath();c.fillStyle='#c9a46a';c.fill();c.strokeStyle='#5a3a1a';c.lineWidth=2;c.stroke()}
      c.strokeStyle='rgba(60,90,140,.7)';c.lineWidth=2;c.beginPath();[[31,31],[32,24],[33,15],[32,4],[33,-1]].forEach((p,i)=>i?c.lineTo(...at(p)):c.moveTo(...at(p)));c.stroke();// the Nile
      c.beginPath();[[-10,10],[-4,15],[-3,17],[2,15],[6,10],[6.5,5]].forEach((p,i)=>i?c.lineTo(...at(p)):c.moveTo(...at(p)));c.stroke();// the Niger
      c.font='15px Georgia';for(const [name,lon,lat] of PLACES){const [x,y]=at([lon,lat]);c.fillStyle='#8a1a10';c.beginPath();c.arc(x,y,4,0,TAU);c.fill();c.fillStyle='#2a1a0a';c.fillText(name,x+6,y+5)}
      c.font='bold 22px Georgia';c.fillStyle='#3a2a1a';c.textAlign='center';c.fillText('AFRICA',W/2,H-16);
    }

    // ---------- books ----------
    function shelfBooks(key){
      const shelf=SHELVES.find(s=>s.key===key);
      return [...new Set([...shelf.ids,...(arrivals[key]||[])])].map(id=>{const [title,author]=RECORDS[id]||[];return findBook(id,title?{id,title,author}:null)}).filter(Boolean).slice(0,shelf.max);
    }
    let bookGeometry=null;
    function placeBook(book,spot,shelf,scale=1){
      if(!spot)return null;bookGeometry=bookGeometry||own(new THREE.BoxGeometry(.72,.96,.13));
      const mesh=add(bookGeometry,own(bookMaterial(book)),spot.x,spot.y,spot.z,root);mesh.rotation.order='YXZ';mesh.rotation.y=spot.yaw;mesh.rotation.x=-(spot.lean??.08);if(scale!==1)mesh.scale.setScalar(scale);
      mesh.userData={type:'book',book,loaded:false,african:true,shelf,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:root}};
      interactables.push(mesh);ours.push(mesh);books.push(mesh);return mesh;
    }

    // ---------- above the clouds ----------
    // (The camera sees 130 m, so all of this is drawn within that.)
    // A night sky that travels with the balloon, a floor of moonlit cloud that streams past beneath it, and far
    // below, the plain and a river, glimpsed where the clouds open. Built for the flight and freed after it.
    function buildSky(){
      if(sky)return;const g=new THREE.Group();g.name='african-sky';g.position.set(SKY.x,SKY.y,SKY.z);scene.add(g);const keep=own;
      const dome=add(keep(new THREE.SphereGeometry(120,24,12)),keep(new THREE.MeshBasicMaterial({map:keep(canvasTexture((c,W,H)=>{nightSky(c,W,H,false);const g=c.createLinearGradient(0,H*.5,0,H);g.addColorStop(0,'#2a3450');g.addColorStop(.2,'#0c1428');g.addColorStop(1,'#04060c');c.fillStyle=g;c.fillRect(0,H*.5,W,H*.5)},1024,512)),side:THREE.BackSide,fog:false})),0,0,0,g);
      const puff=keep(canvasTexture((c,W,H)=>{for(let k=0;k<9;k++){const x=W*(.25+Math.random()*.5),y=H*(.3+Math.random()*.4),r=W*(.15+Math.random()*.18),gr=c.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(220,228,240,.85)');gr.addColorStop(1,'rgba(220,228,240,0)');c.fillStyle=gr;c.fillRect(0,0,W,H)}},256,256));
      const cloudMat=keep(new THREE.MeshBasicMaterial({map:puff,color:0x8a96b0,transparent:true,depthWrite:false,fog:false,opacity:.9})),COUNT=150;
      const clouds=new THREE.InstancedMesh(keep(new THREE.PlaneGeometry(70,70)),cloudMat,COUNT),spots=[];let seed=8;const rand=()=>(seed=(seed*16807)%2147483647)/2147483647;
      for(let i=0;i<COUNT;i++)spots.push({x:(rand()-.5)*220,y:-16-rand()*14,z:(rand()-.5)*220,s:.35+rand()*.45,a:rand()*TAU});g.add(clouds);
      const ground=add(keep(new THREE.PlaneGeometry(260,260)),keep(new THREE.MeshBasicMaterial({fog:false,map:keep(canvasTexture((c,W,H)=>{c.fillStyle='#10140c';c.fillRect(0,0,W,H);
        for(let k=0;k<600;k++){c.fillStyle=`rgba(${40+Math.random()*30|0},${48+Math.random()*30|0},${30+Math.random()*20|0},.5)`;c.beginPath();c.arc(Math.random()*W,Math.random()*H,2+Math.random()*10,0,TAU);c.fill()}
        c.strokeStyle='rgba(180,200,230,.75)';c.lineWidth=5;c.beginPath();c.moveTo(0,H*.6);for(let x=0;x<=W;x+=16)c.lineTo(x,H*.6+Math.sin(x*.012)*60+Math.sin(x*.031)*20);c.stroke()},1024,1024))})),0,-60,0,g);ground.rotation.x=-Math.PI/2;ground.material.map.wrapS=ground.material.map.wrapT=THREE.RepeatWrapping;
      sky={group:g,dome,clouds,cloudMat,spots,ground,m4:new THREE.Matrix4(),q:new THREE.Quaternion(),e:new THREE.Euler(),v:new THREE.Vector3(),sv:new THREE.Vector3()};
    }
    function freeSky(){if(!sky)return;sky.group.removeFromParent();sky=null}
    function updateSky(dt,travelled,open){
      if(!sky)return;const {spots,clouds,m4,q,e,v,sv}=sky;
      spots.forEach((s,i)=>{const z=((s.z+travelled+110)%220+220)%220-110;v.set(s.x,s.y,z);e.set(-Math.PI/2,0,s.a);q.setFromEuler(e);sv.set(s.s,s.s,s.s);m4.compose(v,q,sv);clouds.setMatrixAt(i,m4)});
      clouds.instanceMatrix.needsUpdate=true;sky.cloudMat.opacity=.9-open*.65;sky.ground.material.map.offset.y=-travelled/900;
    }

    // ---------- flying ----------
    // dir 1: from the roof garden to the courtyard; dir -1: home. The flight balloon is the one that left: the
    // moored one is hidden until it comes back, so there is only ever one balloon in each place.
    function startFlight(dir){
      if(flight)return;activate();buildSky();if(dir<0)prepareRoof();buildRoof();
      const reduced=isReducedMotion(),from=dir>0?{x:MOOR.x,y:MOOR.y,z:MOOR.z}:{x:PARK.x,y:0,z:PARK.z},to=dir>0?{x:PARK.x,y:0,z:PARK.z}:{x:MOOR.x,y:MOOR.y,z:MOOR.z};
      const balloon=dir>0?roof:farAway;
      flight={dir,t:0,duration:reduced?12:(dir>0?36:22),from,to,balloon,said:0,lines:dir>0?OUT:BACK,stage:'rise',travelled:0,done:false};
      player.pitch=-.28;fire(balloon,2.2);playSample?.('secretDoor',.5,.7);
      analytics?.track('Room Explored',{room:dir>0?'balloon-flight':'balloon-return'});
    }
    function cloudCover(o){if(overlay)overlay(o)}
    function updateFlight(dt,reduced){
      const f=flight;f.t+=dt;const p=clamp(f.t/f.duration,0,1),b=f.balloon;
      // Where the balloon is: rising from the start, cruising in the sky, sinking onto the destination.
      let pos;
      if(p<.18){const k=smooth(p/.18);pos={x:f.from.x,y:f.from.y+k*55,z:f.from.z};b.group.position.set(pos.x,pos.y,pos.z)}
      else if(p<.8){f.travelled+=dt*(reduced?14:18);pos={x:SKY.x,y:SKY.y,z:SKY.z};b.group.position.set(pos.x,pos.y,pos.z);if(f.stage==='rise'){f.stage='cruise';b.group.removeFromParent();scene.add(b.group)}}
      else{const k=smooth((p-.8)/.2);pos={x:f.to.x,y:f.to.y+(1-k)*55,z:f.to.z};
        if(f.stage==='cruise'){f.stage='sink';const arriving=f.dir>0?farAway:roof;arriving.group.visible=false;f.arriving=arriving}
        b.group.position.set(pos.x,pos.y,pos.z);b.group.rotation.y=f.dir>0?.6:0}
      // Through the clouds at either end of the cruise: a white-out that hides the change of scene.
      const cover=Math.max(0,1-Math.abs(p-.18)/.05,1-Math.abs(p-.8)/.05);cloudCover(cover);
      updateSky(dt,f.travelled,clamp((p-.5)/.12,0,1)*clamp((.78-p)/.06,0,1));
      if(sky)sky.group.position.set(SKY.x,SKY.y,SKY.z);
      if(Math.random()<dt*.35&&p>.15&&p<.85)fire(b,.9+Math.random()*.8);
      // The reader stands in the basket and may look wherever they like.
      const sway=reduced?0:Math.sin(f.t*.7)*.02;
      camera.position.set(b.group.position.x+Math.sin(f.t*.5)*.05,b.group.position.y+1.6,b.group.position.z+Math.cos(f.t*.4)*.05);
      camera.rotation.set(player.pitch,player.yaw,sway,'YXZ');camera.updateMatrixWorld();
      if(f.stage==='cruise'){scene.background.setRGB(.02,.04,.1);scene.fog.color.copy(scene.background);scene.fog.density=.0015}
      while(f.said<f.lines.length&&p>=f.lines[f.said][0]){showNotice(f.lines[f.said][1],f.dir>0?7:6);f.said++}
      if(p>=1&&!f.done){f.done=true;land(f)}
    }
    function land(f){
      const b=f.balloon,arriving=f.arriving||(f.dir>0?farAway:roof);
      // The balloon that flew goes back to where it came from, out of sight, and the one waiting here appears.
      b.group.removeFromParent();(f.dir>0?scene:root||scene).add(b.group);
      if(f.dir>0){b.group.position.set(MOOR.x,MOOR.y,MOOR.z);b.group.rotation.y=0}else{b.group.position.set(PARK.x,0,PARK.z);b.group.rotation.y=.6}
      if(f.dir>0){roof&&(roof.group.visible=true);arriving.group.visible=true;moveTo(PARK.x+1.8,0,PARK.z+.8,FACE_DOOR);
        setTimeout(()=>showNotice('The basket settles in a walled courtyard under the stars, beside a baobab. Lamplight comes from the doorway of the African Reading Room.',9),400)}
      else{arriving.group.visible=true;farAway&&(farAway.group.visible=true);const y=libraryFloor(MOOR.x+1.9,MOOR.z)??MOOR.y;moveTo(MOOR.x+1.9,y,MOOR.z,-Math.PI/2);showNotice('The roof garden. The basket bumps down by the parapet, and the weather vane turns to watch.',7)}
      flight=null;freeSky();cloudCover(0);playSample?.('doorOpen',.4,.7);
    }
    // A link (/?room=africa) goes straight to the courtyard; the balloon is there for the way home.
    function enter(){activate();moveTo(PARK.x+1.8,0,PARK.z+.8,FACE_DOOR);showNotice('A walled courtyard under the stars, beside a baobab, and the doorway of the African Reading Room. The balloon will take you home to the library.',8);analytics?.track('Room Explored',{room:'african-room'})}

    // ---------- walking ----------
    function zoneAt(x,z){
      if(x<YARD.cx-YARD.w/2||x>YARD.cx+YARD.w/2)return null;
      if(z>=YARD.cz-YARD.d/2&&z<=YARD.cz+YARD.d/2)return 'african-courtyard';
      if(z>=ROOM.cz-ROOM.d/2&&z<YARD.cz-YARD.d/2&&x>ROOM.cx-ROOM.w/2&&x<ROOM.cx+ROOM.w/2)return 'african-room';return null;
    }
    const contains=(x,z)=>!!zoneAt(x,z);
    const floorAt=(x,z)=>contains(x,z)?0:null;
    function allowed(x,z){
      const zone=zoneAt(x,z);if(!zone)return false;const r=player.radius||.42;
      if(x-r<YARD.cx-YARD.w/2+.5||x+r>YARD.cx+YARD.w/2-.5)return false;
      if(z+r>YARD.cz+YARD.d/2-.5||z-r<ROOM.cz-ROOM.d/2+.4)return false;
      // The façade between the courtyard and the room: only through the door.
      const wallZ=YARD.cz-YARD.d/2;if(Math.abs(z-wallZ)<.4+r&&Math.abs(x-DOOR.x)>DOOR.w/2-r)return false;
      return !blockers.some(b=>x+r>b.minX&&x-r<b.maxX&&z+r>b.minZ&&z-r<b.maxZ);
    }

    // ---------- doing things ----------
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('african-'))return false;
      if(flight)return true;
      if(data.type==='african-balloon'){startFlight(1);return true}
      if(data.type==='african-balloon-home'){startFlight(-1);return true}
      if(data.type==='african-card'){if(data.title===CARDS.kora[0])pluck();showNotice(`${data.title}: ${data.author}`,11);return true}
      return false;
    }
    function pluck(){if(laughOff>time)return;laughOff=time+2;[392,440,494,587,659,587,494].forEach((f,i)=>setTimeout(()=>sound?.(f,.5,'triangle',.03),i*170))}

    // ---------- lifecycle ----------
    function activate(){if(!root)buildFar();lastNeeded=time}
    function unload(){
      if(!root)return;root.removeFromParent();root=null;lantern=null;farAway=null;freeSky();bookGeometry=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0;
    }
    function reset(){if(flight){const f=flight;f.t=f.duration;f.done=true;land(f)}}
    function update(t,dt=0){
      time=t;const reduced=isReducedMotion(),{x,y,z}=player.pos,inside=contains(x,z);
      // The moored balloon is built when the reader is up on the roof, and freed when they have gone back down.
      const onRoof=y>8&&Math.hypot(x-MOOR.x,z-MOOR.z)<40;if(onRoof||flight)buildRoof();else if(roof&&!root&&y<5)freeRoof();
      updateBalloon(roof,reduced);updateBalloon(farAway,reduced);if(flight)updateBalloon(flight.balloon,reduced);
      if(flight){lastNeeded=t;updateFlight(dt,reduced);return}
      if(inside)activate();
      if(root){
        if(zoneAt(x,z)==='african-courtyard'){scene.background.setRGB(.02,.03,.08);scene.fog.color.copy(scene.background);scene.fog.density=.012}
        if(lantern&&!reduced)lantern.intensity=5+Math.sin(t*6)*.3+Math.sin(t*13.1)*.15;
        if(!inside&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==root))unload();
      }
    }
    return {contains,floorAt,allowed,nearMoor,interact,update,reset,enter,unload,startFlight,zoneAt,shelfBooks,
      moor:MOOR,yard:YARD,room:ROOM,shelves:SHELVES,records:RECORDS,cards:CARDS,
      get travelling(){return !!flight},get built(){return !!root},get roofBuilt(){return !!roof},get skyBuilt(){return !!sky},get books(){return books.slice()}};
  };
})();
