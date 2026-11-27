// The Indian room: a lamplit reading room in the manner of a Rajasthani haveli, through a saffron door in the Long
// Corridor's west wall (fifth bay; long-corridor.js hands over `indiaDoor`). Ochre plaster under a painted band of
// flowers, a carpet in the middle, a low divan with bolsters, a rehal (a folding book-stand) with a book open on it, and
// a lattice (jali) screen on the north wall. The south window looks out on a banyan in the moonlight.
//
// Books: Tagore (north wall, left), the poets and mystics (north wall, right), the epics, plays and scripture (east,
// north end), tales and fables (east, south end, after the library's own Kim) and history, travel and the modern writers
// (west wall): shelves `india-*` in data/new-books.js. Gutenberg has no Hindi, Bengali or Urdu texts, so every book here
// is in English, and the cards say so. There are no Russian authors on these shelves (the owner's wish).
//
// The secret is at the window: in the Sanskrit Twenty-Two Goblins King Vikram carries a vetala, a goblin that lives in a
// corpse, back from a tree in the burning-ground, and the goblin tells him riddling stories on the way. Look at the
// window and the goblin hangs from the banyan; Burton's Vikram and the Vampire (`india-vampire`) is then left on the
// sill, found once, found for good (athenaeum-india-vetala; ?vetala shows it). Built when the reader comes near its
// door, freed a little while after they leave.
(function(){
  'use strict';

  // The library's own copies that stand with these: Gitanjali (a lost-property book) and Kim.
  const GROUPS=[
    {key:'tagore',name:'TAGORE',sub:'Bengal’s poet, in English',wall:'north',along:-3.2,length:4.4,max:12,ids:[7164]},
    {key:'poets',name:'POETS AND MYSTICS',sub:'Kabir, Naidu, Toru Dutt, Iqbal',wall:'north',along:2.8,length:3.2,max:8,ids:[]},
    {key:'epics',name:'EPICS, PLAYS, SCRIPTURE',sub:'The Ramayana, the Mahabharata, Kalidasa',wall:'east',along:-3.4,length:3.2,max:8,ids:[]},
    {key:'tales',name:'TALES AND FABLES',sub:'Jataka, Punjab, Bengal and the Deccan',wall:'east',along:1.8,length:4.8,max:14,ids:[2226]},
    {key:'history',name:'HISTORY AND THE MODERN WRITERS',sub:'Rajasthan to the Raj, and Gandhi',wall:'west',along:-1.4,length:5.2,max:14,ids:[]}
  ];
  const CARDS={
    sign:['The Indian room','The library’s English-language books of the subcontinent, from the Sanskrit epics in Victorian translation to Tagore and Gandhi. Gutenberg has no texts in Hindi, Bengali, Urdu or Sanskrit themselves, so every book here is in English, and many are translations. The room is made after a haveli, a courtyard house of Rajasthan.'],
    divan:['A divan','A low platform spread with white cotton and bolsters, the usual seat of a reading room in an Indian house. People sit on it, or lie along it, and put the book on the rehal.'],
    rehal:['A rehal','A rehal is a folding book-stand, made of two pieces of wood crossed and pinned, which holds a book open at a slant. It is used for scripture and for anything that is meant to be handled with care.'],
    lamp:['A brass lamp','A tall lamp of brass, with a bowl at the top for oil and a wick. In many houses a lamp of this kind is lit at dusk. It is the room’s one light.'],
    jali:['A jali screen','A lattice cut from a single slab of stone or wood, the pattern repeated, which lets in air and light while screening the people behind it. Jali work is common in the old palaces and tombs of Rajasthan and Mughal India.'],
    carpet:['A carpet','A woven carpet with a medallion in the middle and a border of flowering plants, drawn by the library after the style of those made in northern India.'],
    window:['The south window','A banyan in the moonlight. There is a story, in the Sanskrit tales of the Twenty-Two Goblins, about a tree of this kind in a burning-ground.'],
    vetala:['The goblin in the banyan','In the Sanskrit tales, King Vikram is told to fetch a corpse hanging from a tree. A vetala, a spirit that lives in the dead, is in it, and tells him a story as he carries it. At the end of each tale it asks him a riddle, and if he knows the answer and keeps quiet his head will split. The king answers, and the vetala goes back to the tree, and he has to fetch it again.']
  };
  const FOUND_KEY='athenaeum-india-vetala';

  window.createIndiaRoom=function(options){
    const {THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,arrivals={},showNotice,playSample,move,analytics,isHolding=()=>false,registerSeat=null,doorKit=null,
      corridor=null,storage=null,search=''}=options;
    const DOOR=corridor?.indiaDoor||{x:1697.67,z:-18,yaw:Math.PI/2};
    const ROOM={cx:2800,cz:-300,w:12,d:11,h:3.6};
    const PRELOAD=7,KEEP=25;
    const DOOR_LOOK={style:'painted',color:0xd88a1e,fanColor:0xffe0a0,width:1.7,height:2.9};
    const through=(data,go)=>doorKit&&data.kit?doorKit.pass(data.kit,data,go):go();
    const wasFound=()=>{try{return storage?.getItem(FOUND_KEY)==='1'||/[?&](vetala|vampire)\b/.test(search)}catch(e){return false}};
    let root=null,time=0,lastNeeded=-1e9,window_=null;
    const owned=[],ours=[],books=[],blockers=[];
    const own=thing=>{owned.push(thing);return thing};
    const std=params=>own(new THREE.MeshStandardMaterial(params));
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    function markDoor(object,data){object.userData=data;interactables.push(object);return object}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const card=key=>({type:'india-card',title:CARDS[key][0],author:CARDS[key][1],action:'READ'});
    function sign(parent,text,sub,w,h,x,y,z){
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle='#f4e7c8';c.fillRect(0,0,W,H);c.strokeStyle='#a2441c';c.lineWidth=4;c.strokeRect(7,7,W-14,H-14);
        c.fillStyle='#3a1a0c';c.textAlign='center';c.font='bold 26px Georgia';c.fillText(text,W/2,sub?50:H/2+10);if(sub){c.font='italic 19px Georgia';c.fillText(sub,W/2,83)}},620,sub?104:70));
      return add(own(new THREE.PlaneGeometry(w,h)),std({map,emissive:0x3a2a14,emissiveIntensity:.25,roughness:.9}),x,y,z,parent)}
    const shelfBooks=(ids,room,max)=>[...new Set([...ids,...(arrivals[room]||[])])].map(id=>findBook(id)).filter(Boolean).slice(0,max);
    function catalogue(){return {groups:GROUPS.map(group=>({...group,books:shelfBooks(group.ids,group.key,group.max)})),vampire:shelfBooks([],'vampire',1)}}

    function buildDoor(){
      const g=new THREE.Group();g.name='india-door';g.position.set(DOOR.x,0,DOOR.z);g.rotation.y=DOOR.yaw;scene.add(g);
      const data={type:'india-door',title:'The Indian room',author:'A haveli reading room: Tagore, the epics, the tales of the Jataka and a banyan at the window.',action:'ENTER'};
      if(!doorKit?.hang(g,{data,mark:markDoor,...DOOR_LOOK,...doorKit.readingRoom?.('THE INDIAN ROOM','Tagore · Kabir · the epics')}))markDoor(add(new THREE.BoxGeometry(1.7,2.9,.14),new THREE.MeshStandardMaterial({color:DOOR_LOOK.color,roughness:.7}),0,1.45,.08,g),data);
      indianSurround(g,data);
    }
    // What makes the door Indian: a cusped (multifoil) arch of red sandstone carved with a lotus over it, slim pilasters with
    // lotus capitals and brass finials, a chhajja (the little overhanging eave of a haveli) and two swags of marigolds.
    // All of it is plain geometry hung in the door's own group, so it stays when the room is freed.
    function indianSurround(g,data){
      const stoneMat=new THREE.MeshStandardMaterial({color:0xb4553a,roughness:.85}),brass=new THREE.MeshStandardMaterial({color:0xc9a24a,metalness:.6,roughness:.4}),W=DOOR_LOOK.width,H=DOOR_LOOK.height;
      const part=(geometry,material,x,y,z)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);g.add(m);return m};
      const arch=canvasTexture((c)=>{c.clearRect(0,0,512,256);c.fillStyle='#b4553a';c.fillRect(0,0,512,256);
      // The opening: a cusped arch, cut out, with the night-blue of a painted tympanum behind it.
      c.save();c.globalCompositeOperation='destination-out';c.beginPath();c.moveTo(70,256);c.lineTo(70,150);
      for(let i=0;i<=9;i++){const a=Math.PI+i*Math.PI/9,x=256+Math.cos(a)*186,y=150+Math.sin(a)*120;const b=Math.PI+(i+.5)*Math.PI/9;c.quadraticCurveTo(256+Math.cos(b)*(186+22),150+Math.sin(b)*(120+22),x,y)}
      c.lineTo(442,256);c.closePath();c.fill();c.restore();
      c.fillStyle='#e6c878';c.strokeStyle='#7a2a16';c.lineWidth=3;c.beginPath();c.arc(256,62,12,0,7);c.fill();c.stroke();for(let p=0;p<8;p++){c.save();c.translate(256,62);c.rotate(p*Math.PI/4);c.beginPath();c.ellipse(0,-24,7,13,0,0,7);c.fill();c.stroke();c.restore()}
      c.fillStyle='#e6c878';for(let i=0;i<14;i++){c.beginPath();c.arc(24+i*36,236,5,0,7);c.fill()}},512,256);
      const panel=part(new THREE.PlaneGeometry(W+1.4,.7*(W+1.4)/2.0),new THREE.MeshStandardMaterial({map:arch,transparent:true,roughness:.85,alphaTest:.1}),0,H+.45+.35,.12);panel.scale.set(1,.55,1);
      for(const sx of [-1,1]){
        part(new THREE.BoxGeometry(.2,H+.5,.2),stoneMat,sx*(W/2+.55),(H+.5)/2,.1);
        part(new THREE.CylinderGeometry(.16,.09,.14,10),stoneMat,sx*(W/2+.55),H+.55,.1);part(new THREE.SphereGeometry(.06,10,8),brass,sx*(W/2+.55),H+.7,.1);
        part(new THREE.BoxGeometry(.26,.12,.26),stoneMat,sx*(W/2+.55),.06,.1)}
      part(new THREE.BoxGeometry(W+1.5,.07,.34),stoneMat,0,H+.3,.2);
      // Two swags of marigolds.
      const flowers=new THREE.InstancedMesh(new THREE.SphereGeometry(.055,8,6),new THREE.MeshStandardMaterial({color:0xf09a1c,roughness:.8}),30),dummy=new THREE.Object3D();
      for(let i=0;i<30;i++){const side=i<15?-1:1,t=(i%15)/14,R=W/2+.55,sag=Math.sin(t*Math.PI)*.22;dummy.position.set(side*(R-t*R),H+.12-sag,.28);dummy.scale.set(1,1+((i*7)%3)*.2,1);dummy.updateMatrix();flowers.setMatrixAt(i,dummy.matrix)}
      flowers.instanceMatrix.needsUpdate=true;g.add(flowers);
    }

    // ---------- the room ----------
    function buildRoom(){
      root=new THREE.Group();root.name='india-room';const {cx,cz,w,d,h}=ROOM,x0=cx-w/2,x1=cx+w/2,z0=cz-d/2,z1=cz+d/2;
      let k=7;const rnd=()=>(k=(k*9301+49297)%233280)/233280;
      const plaster=own(canvasTexture((c,W,H)=>{c.fillStyle='#d9a45c';c.fillRect(0,0,W,H);for(let i=0;i<500;i++){c.fillStyle=`rgba(120,70,20,${rnd()*.08})`;c.fillRect(rnd()*W,rnd()*H,3+rnd()*9,2+rnd()*5)}
        c.fillStyle='#9a3d1a';c.fillRect(0,H*.78,W,14);c.fillStyle='#e9d6a0';for(let x=0;x<W;x+=32){c.beginPath();c.arc(x+16,H*.78+7,5,0,7);c.fill()}
        c.fillStyle='rgba(60,90,50,.55)';for(let x=0;x<W;x+=64){c.beginPath();c.ellipse(x+32,H*.9,10,24,.6,0,7);c.fill();c.beginPath();c.ellipse(x+32,H*.9,10,24,-.6,0,7);c.fill()}},512,256));
      plaster.wrapS=plaster.wrapT=THREE.RepeatWrapping;plaster.repeat?.set?.(3,1);
      const wall=std({color:0xd8c4a0,map:plaster,roughness:.95}),cedar=std({color:0x4a2a14,roughness:.6}),dark=std({color:0x2a160a,roughness:.7}),white=std({color:0xe6dcc4,roughness:.95}),stone=std({color:0xb69a6c,roughness:.9});
      const floorTex=own(canvasTexture((c,W,H)=>{c.fillStyle='#c9b48a';c.fillRect(0,0,W,H);c.strokeStyle='rgba(90,60,30,.35)';for(let x=0;x<W;x+=64){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke()}for(let y=0;y<H;y+=64){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke()}},256,256));
      floorTex.wrapS=floorTex.wrapT=THREE.RepeatWrapping;floorTex.repeat?.set?.(6,6);
      box(w,.3,d,std({color:0xc9b48a,map:floorTex,roughness:.9}),cx,-.15,cz,root);box(w,.2,d,std({color:0xcdb690,roughness:1}),cx,h+.1,cz,root);
      box(w,h,.3,wall,cx,h/2,z0,root);box(w,h,.3,wall,cx,h/2,z1,root);box(.3,h,d,wall,x0,h/2,cz,root);box(.3,h,d,wall,x1,h/2,cz,root);
      for(const [bx,bz,bw,bd] of [[cx,z0+.17,w,.05],[cx,z1-.17,w,.05],[x0+.17,cz,.05,d],[x1-.17,cz,.05,d]]){box(bw,.14,bd,cedar,bx,.07,bz,root);box(bw,.1,bd,cedar,bx,h-.05,bz,root)}
      mark(sign(root,'THE INDIAN ROOM','Tagore · Kabir · the epics · the tales',2.8,.46,cx+.4,h-.42,z0+.17),card('sign'));
      // The shelves: cedar, one or two rows, each under its label.
      const {groups}=catalogue(),geometry=own(new THREE.BoxGeometry(.66,.9,.12)),ROWS=[1.3,2.36];
      for(const group of groups){
        const per=group.books.length>4?Math.ceil(group.books.length/2):Math.max(1,group.books.length),step=Math.min(1.05,(group.length-.3)/per);
        group.books.forEach((book,i)=>{const row=i<per?0:1,n=row?group.books.length-per:per,col=row?i-per:i,offset=(col-(n-1)/2)*step;placeBook(book,{...shelfSpot(group,offset),y:ROWS[row]},geometry,group.key)});
        const s=shelfSpot(group,0,.34),rows=group.books.length>per?ROWS:ROWS.slice(0,1),top=rows.at(-1)+.82,label=sign(root,group.name,group.sub,Math.min(3,group.length),.38,0,top,0);
        if(group.wall==='north'){for(const y of rows)box(group.length,.05,.34,cedar,s.x,y-.47,s.z,root);block(s.x,s.z,group.length+.2,.7);label.position.set(s.x,top,z0+.17)}
        else{for(const y of rows)box(.34,.05,group.length,cedar,s.x,y-.47,s.z,root);block(s.x,s.z,.7,group.length+.2);const side=group.wall==='west'?-1:1;label.position.set(cx+side*(w/2-.17),top,s.z);label.rotation.y=-side*Math.PI/2}
        mark(label,{type:'india-card',title:group.name.charAt(0)+group.name.slice(1).toLowerCase(),author:group.sub+'.',action:'READ'});
      }
      buildCarpet(cx,cz+.3);buildJali(cx-.6,z0+.2);buildDivan(cx-3.2,cz+2.6,white,cedar);buildRehal(cx+2.3,cz+1.2,cedar);buildWindow(cx-3.8,z1-.17);
      const lampPost=new THREE.Group();lampPost.position.set(cx+3.6,0,cz+3.6);root.add(lampPost);const brass=MAT.brass||std({color:0xb08d3a,metalness:.6,roughness:.4}),parts=[];
      parts.push(add(own(new THREE.CylinderGeometry(.16,.2,.06,12)),brass,0,.03,0,lampPost),add(own(new THREE.CylinderGeometry(.03,.03,1.5,8)),brass,0,.78,0,lampPost),add(own(new THREE.CylinderGeometry(.14,.06,.08,12)),brass,0,1.55,0,lampPost));
      parts.push(add(own(new THREE.SphereGeometry(.075,12,8)),std({color:0xfff1d0,emissive:0xffc060,emissiveIntensity:1.6,roughness:.4,transparent:true,opacity:.95}),0,1.66,0,lampPost));
      for(const part of parts)mark(part,card('lamp'));block(cx+3.6,cz+3.6,.5,.5);
      const lamp=new THREE.PointLight(0xffc27a,4.5,16,2);lamp.position.set(cx+3.6,1.75,cz+3.6);root.add(lamp);
      const exit={type:'india-exit',title:'Back to the Long Corridor',author:'Out through the saffron door, and along the corridor to the Grand Hall.',action:'RETURN'};
      if(!doorKit?.hang(root,{data:exit,mark,x:cx,z:z1-.2,yaw:Math.PI,onward:'towards the Grand Hall',label:'THE LONG CORRIDOR',own,...DOOR_LOOK}))mark(box(1.7,2.9,.16,std({color:DOOR_LOOK.color,roughness:.7}),cx,1.45,z1-.2,root),exit);
      scene.add(root);
    }
    function shelfSpot(group,offset,inset=.3){
      const {cx,cz,w,d}=ROOM;if(group.wall==='north')return {x:cx+group.along+offset,z:cz-d/2+inset,yaw:0};
      const side=group.wall==='west'?-1:1;return {x:cx+side*(w/2-inset),z:cz+group.along-side*offset,yaw:-side*Math.PI/2}}
    function placeBook(book,spot,geometry,shelf,parent=root){
      const mesh=add(geometry,own(bookMaterial(book)),spot.x,spot.y,spot.z,parent);mesh.rotation.order='YXZ';mesh.rotation.y=spot.yaw||0;mesh.rotation.x=spot.tilt??-.08;
      mesh.userData={type:'book',book,loaded:false,india:true,shelf,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent}};
      interactables.push(mesh);ours.push(mesh);books.push(mesh);return mesh}
    // A carpet: a medallion and a flowering border, drawn.
    function buildCarpet(x,z){
      const tex=own(canvasTexture((c,W,H)=>{c.fillStyle='#8a1f1a';c.fillRect(0,0,W,H);c.strokeStyle='#e6c878';c.lineWidth=6;c.strokeRect(16,16,W-32,H-32);c.strokeStyle='#1f3a5a';c.lineWidth=10;c.strokeRect(34,34,W-68,H-68);
        for(let i=0;i<14;i++){const px=60+i*(W-120)/13;for(const py of [58,H-58]){c.fillStyle='#e6c878';c.beginPath();c.arc(px,py,8,0,7);c.fill()}}
        c.fillStyle='#1f3a5a';c.beginPath();c.ellipse(W/2,H/2,150,90,0,0,7);c.fill();c.fillStyle='#e6c878';c.beginPath();c.ellipse(W/2,H/2,110,62,0,0,7);c.fill();c.fillStyle='#8a1f1a';c.beginPath();c.ellipse(W/2,H/2,70,36,0,0,7);c.fill();
        for(let p=0;p<8;p++){c.save();c.translate(W/2,H/2);c.rotate(p*Math.PI/4);c.fillStyle='#2f6a46';c.beginPath();c.ellipse(34,0,16,6,0,0,7);c.fill();c.restore()}},512,320));
      const carpet=add(own(new THREE.PlaneGeometry(5.6,3.5)),std({map:tex,roughness:1}),x,.012,z,root);carpet.rotation.x=-Math.PI/2;mark(carpet,card('carpet'))}
    // The jali: a lattice of eight-pointed stars on a slab, with the library's light behind it.
    function buildJali(x,z){
      const tex=own(canvasTexture((c,W,H)=>{c.fillStyle='#8c6a3c';c.fillRect(0,0,W,H);c.fillStyle='#1a0e06';for(let i=0;i<8;i++)for(let j=0;j<10;j++){const px=(i+.5)*W/8,py=(j+.5)*H/10;c.beginPath();for(let a=0;a<8;a++){const r=a%2?9:19,t=a*Math.PI/4;c.lineTo(px+Math.cos(t)*r,py+Math.sin(t)*r)}c.closePath();c.fill()}},256,320));
      const g=new THREE.Group();g.position.set(x,1.9,z);root.add(g);const panel=add(own(new THREE.PlaneGeometry(1.6,2.1)),std({map:tex,roughness:.9}),0,0,0,g);mark(panel,card('jali'));
      for(const part of [box(1.8,.12,.1,std({color:0x4a2a14,roughness:.6}),0,1.1,0,g),box(1.8,.12,.1,std({color:0x4a2a14,roughness:.6}),0,-1.1,0,g),box(.12,2.3,.1,std({color:0x4a2a14,roughness:.6}),-.9,0,0,g),box(.12,2.3,.1,std({color:0x4a2a14,roughness:.6}),.9,0,0,g)])mark(part,card('jali'))}
    // The divan: a platform under white cotton with bolsters, a seat.
    function buildDivan(x,z,white,cedar){
      const g=new THREE.Group();g.position.set(x,0,z);root.add(g);const parts=[box(2.8,.36,1.2,cedar,0,.18,0,g),box(2.7,.1,1.1,white,0,.41,0,g)];
      for(const sx of [-1.15,1.15])parts.push(add(own(new THREE.CylinderGeometry(.13,.13,.9,10)),std({color:0x8a1f1a,roughness:.9}),sx,.6,.1,g));parts[2].rotation.x=Math.PI/2;parts[3].rotation.x=Math.PI/2;
      for(const part of parts)mark(part,card('divan'));block(x,z,2.9,1.3);
      registerSeat?.(parts,g,new THREE.Vector3(0,1.0,.1),0,{title:'The divan',author:'Sit on the white cotton and read one of the room’s books.',bookIds:books.map(b=>b.userData.book.id)});
      for(const part of parts)ours.push(part);
    }
    // The rehal: two crossed boards, with a book open.
    function buildRehal(x,z,cedar){
      const g=new THREE.Group();g.position.set(x,0,z);root.add(g);const table=box(.7,.04,.5,cedar,0,.3,0,g),legs=[box(.04,.3,.04,cedar,-.28,.15,-.2,g),box(.04,.3,.04,cedar,.28,.15,-.2,g),box(.04,.3,.04,cedar,-.28,.15,.2,g),box(.04,.3,.04,cedar,.28,.15,.2,g)];
      const b1=box(.4,.02,.3,cedar,-.04,.44,0,g),b2=box(.4,.02,.3,cedar,.04,.44,0,g);b1.rotation.z=.5;b2.rotation.z=-.5;
      const pageMat=std({color:0xf1e6c8,roughness:.9}),p1=box(.3,.01,.22,pageMat,-.045,.46,0,g),p2=box(.3,.01,.22,pageMat,.045,.46,0,g);p1.rotation.z=.5;p2.rotation.z=-.5;
      for(const part of [table,...legs,b1,b2,p1,p2])mark(part,card('rehal'));block(x,z,.9,.7)}
    // The south window: a banyan at night, the moon, and (once looked at) a figure hanging from a bough.
    function buildWindow(x,z){
      const view=own(canvasTexture((c,W,H)=>{const gr=c.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#0c1830');gr.addColorStop(1,'#1d2c44');c.fillStyle=gr;c.fillRect(0,0,W,H);
        c.fillStyle='#f5eed0';c.beginPath();c.arc(W*.76,H*.2,22,0,7);c.fill();const halo=c.createRadialGradient(W*.76,H*.2,10,W*.76,H*.2,90);halo.addColorStop(0,'rgba(245,238,208,.5)');halo.addColorStop(1,'rgba(245,238,208,0)');c.fillStyle=halo;c.fillRect(0,0,W,H);
        let k=3;const r=()=>(k=(k*9301+49297)%233280)/233280;for(let i=0;i<60;i++){c.fillStyle='rgba(255,255,255,.7)';c.fillRect(r()*W,r()*H*.5,2,2)}
        c.fillStyle='#0a1a14';c.fillRect(0,H*.82,W,H);c.strokeStyle='#1a120a';c.lineWidth=14;c.beginPath();c.moveTo(W*.3,H*.9);c.lineTo(W*.32,H*.4);c.stroke();c.lineWidth=7;for(const [bx,by] of [[W*.1,H*.34],[W*.52,H*.36],[W*.7,H*.5]]){c.beginPath();c.moveTo(W*.32,H*.46);c.quadraticCurveTo((W*.32+bx)/2,by-30,bx,by);c.stroke()}
        c.fillStyle='#143822';for(let i=0;i<40;i++){c.beginPath();c.ellipse(W*.3+(r()-.5)*W*.7,H*.34+(r()-.3)*H*.2,22+r()*18,10+r()*8,r(),0,7);c.fill()}
        c.strokeStyle='#1a120a';c.lineWidth=3;for(let i=0;i<8;i++){const ax=W*.2+r()*W*.5;c.beginPath();c.moveTo(ax,H*.5);c.lineTo(ax+(r()-.5)*6,H*.84);c.stroke()}},384,512));
      const g=new THREE.Group();g.position.set(x,1.85,z);g.rotation.y=Math.PI;root.add(g);
      const pane=add(own(new THREE.PlaneGeometry(1.5,2.1)),std({map:view,emissive:0xffffff,emissiveMap:view,emissiveIntensity:.5,roughness:.4}),0,0,0,g);
      const data={type:'india-window',title:CARDS.window[0],author:CARDS.window[1],action:'LOOK'};mark(pane,data);
      const goblinTex=own(canvasTexture((c,W,H)=>{c.clearRect(0,0,W,H);c.strokeStyle='#d8d4c6';c.lineWidth=5;c.beginPath();c.moveTo(W/2,0);c.lineTo(W/2,H*.2);c.stroke();c.fillStyle='#cfcab8';c.beginPath();c.ellipse(W/2,H*.42,16,26,0,0,7);c.fill();c.beginPath();c.arc(W/2,H*.74,13,0,7);c.fill();c.fillStyle='#0a0a0a';c.fillRect(W/2-8,H*.72,5,5);c.fillRect(W/2+4,H*.72,5,5);c.strokeStyle='#cfcab8';c.lineWidth=5;c.beginPath();c.moveTo(W/2-12,H*.32);c.lineTo(W/2-34,H*.55);c.moveTo(W/2+12,H*.32);c.lineTo(W/2+34,H*.55);c.stroke()},96,192));
      const figure=add(own(new THREE.PlaneGeometry(.36,.72)),own(new THREE.MeshBasicMaterial({map:goblinTex,transparent:true,opacity:0,depthWrite:false})),.22,.14,.02,g);figure.visible=false;figure.raycast=()=>{};
      const frame=std({color:0x4a2a14,roughness:.6});for(const sx of [-.78,.78])mark(box(.12,2.3,.1,frame,sx,0,.04,g),data);for(const sy of [-1.1,1.1])mark(box(1.7,.12,.1,frame,0,sy,.04,g),data);
      mark(box(1.9,.08,.3,frame,0,-1.14,.14,g),data);
      window_={g,figure,t:0,book:null,found:false,sillX:x,sillZ:z-.14};
      if(wasFound())reveal(false);
    }
    function reveal(announce=true){
      if(!window_||window_.found)return;window_.found=true;if(announce){window_.t=.001;window_.figure.visible=true}
      const v=catalogue().vampire[0];if(v&&!window_.book){const geometry=own(new THREE.BoxGeometry(.66,.9,.12));window_.book=placeBook(v,{x:window_.sillX,y:.8,z:window_.sillZ,yaw:Math.PI,tilt:-Math.PI/2},geometry,'vampire')}
    }

    // ---------- walking ----------
    function contains(x,z){return x>ROOM.cx-ROOM.w/2&&x<ROOM.cx+ROOM.w/2&&z>ROOM.cz-ROOM.d/2&&z<ROOM.cz+ROOM.d/2}
    function floorAt(x,z){return contains(x,z)?0:null}
    function allowed(x,z){
      if(!contains(x,z))return false;const r=player.radius||.42;
      if(x-r<ROOM.cx-ROOM.w/2+.45||x+r>ROOM.cx+ROOM.w/2-.45||z-r<ROOM.cz-ROOM.d/2+.45||z+r>ROOM.cz+ROOM.d/2-.45)return false;
      return !blockers.some(b=>x+r>b.minX&&x-r<b.maxX&&z+r>b.minZ&&z-r<b.maxZ)}

    // ---------- doing things ----------
    function enter(){
      activate();move(ROOM.cx,ROOM.cz+ROOM.d/2-1.4,0);playSample?.('doorOpen',.8,1.05);
      showNotice('The Indian room. Tagore and the poets are on the far wall, the epics and tales to your right, history to your left; a banyan stands in the window behind you.',11);
      analytics?.track('Room Explored',{room:'india-room'})}
    function leave(){const p=corridor?.standBefore?.(DOOR,2.2)||{x:DOOR.x+2.2,z:DOOR.z,yaw:-Math.PI/2};move(p.x,p.z,p.yaw);playSample?.('doorOpen',.8,1);showNotice('The Long Corridor again.',3)}
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('india-'))return false;
      if(data.type==='india-door'){through(data,enter);return true}
      if(data.type==='india-exit'){through(data,leave);return true}
      if(data.type==='india-window'){
        if(window_?.found){showNotice(`${data.title}: ${CARDS.vetala[1]}`,17);return true}
        reveal(true);try{storage?.setItem(FOUND_KEY,'1')}catch(e){}playSample?.('pageTurn',.6,.8);
        showNotice(`You look at the banyan, and something hangs from a bough, quite still. ${CARDS.vetala[1]}${window_?.book?' A book has been left on the sill.':''}`,18);return true}
      if(data.type==='india-card'){showNotice(`${data.title}: ${data.author}`,data.author.length>260?17:data.author.length>130?12:9);return true}
      return false}

    // ---------- lifecycle ----------
    function activate(){if(!root)buildRoom();lastNeeded=time}
    function unload(){
      if(!root)return;root.removeFromParent();root.traverse(object=>{if(object.isLight)object.userData.freed=true});root=null;window_=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0}
    function update(t){
      const dt=Math.min(.1,Math.max(0,t-time));time=t;const inside=contains(player.pos.x,player.pos.z),near=Math.hypot(player.pos.x-DOOR.x,player.pos.z-DOOR.z)<PRELOAD;
      if(inside||near&&(root||window.libraryMayBuild?.()!==false))activate();
      else if(root&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==b.userData.home.parent))unload();
      if(!inside||!window_||!(window_.t>0))return;
      // The goblin swings in, hangs a while and fades again.
      window_.t+=dt;const s=window_.t,fade=s<1.5?s/1.5:s>9?Math.max(0,1-(s-9)/2):1;window_.figure.material.opacity=fade*.9;window_.figure.rotation.z=Math.sin(s*1.2)*.08;
      if(s>11){window_.figure.visible=false;window_.t=0}}
    buildDoor();
    return {contains,floorAt,allowed,interact,update,enter,leave,activate,unload,catalogue,door:DOOR,room:ROOM,groups:GROUPS,cards:CARDS,
      get built(){return !!root},get books(){return books.slice()},get found(){return !!window_?.found||wasFound()},zoneAt:(x,z)=>contains(x,z)?'india-room':null};
  };
})();
