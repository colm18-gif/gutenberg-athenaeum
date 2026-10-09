// The Medicine Room: a history of medicine, through a door at the south end of the Map Room's east wall, a few steps
// from John Snow's cholera map on the map table. In the middle of the room, under glass, the facsimile of Vesalius's
// Fabrica (vesalius-book.js) lies open at its skeletons, for anyone to turn; round the walls, three shelves: the old
// physic (Hippocrates to the household doctor), discoveries (Harvey to Pasteur), and the healers (nurses, doctors and
// their historians), from data/new-books.js (rooms medicine-*). The title page and Vesalius's portrait hang either side
// of the door, a row of apothecary's jars stands on a cabinet, and two chairs at a reading table open the room's books.
// Like the other rooms behind doors, nothing is built until the reader walks up to it, and it is freed a little while
// after they leave.
(function(){
  'use strict';

  // Three shelves. Their books are the new arrivals for each (data/new-books.js), with any listed here first.
  const GROUPS=[
    {key:'physic',name:'THE OLD PHYSIC',sub:'From Hippocrates to the household doctor',wall:'west',ids:[]},
    {key:'discovery',name:'DISCOVERIES',sub:'The blood, the foxglove, the cowpox and the germ',wall:'north',ids:[]},
    {key:'healers',name:'THE HEALERS',sub:'Nurses, doctors and their historians',wall:'east',ids:[]}
  ];
  const CARDS={
    sign:['The Medicine Room','A history of medicine, from Hippocrates to Pasteur. Under the glass in the middle, the Fabrica of Vesalius lies open for you to turn.'],
    jars:['Apothecary’s jars','Tin-glazed jars of the kind apothecaries kept their drugs in, painted blue on white. These ones are empty.'],
    title:['The title page of the Fabrica','Vesalius at the dissecting table in a crowded anatomy theatre: the woodcut that opens the book, Basel, 1543.'],
    portrait:['Andreas Vesalius','The portrait from the Fabrica: Vesalius at twenty-eight, laying bare the muscles of a forearm.']
  };

  window.createMedicineRoom=function(options){
    const {THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,arrivals={},showNotice,playSample,move,analytics,isHolding=()=>false,registerSeat=null,doorKit=null,vesalius=null,
      mapRoom={cx:-420,cz:-60,w:18,d:14}}=options;
    // At the south end of the Map Room's east wall, facing into the Map Room (map-room.js keeps that end of the wall clear).
    const DOOR={x:mapRoom.cx+mapRoom.w/2-.15,z:mapRoom.cz+mapRoom.d/2-2.1,yaw:-Math.PI/2};
    const ROOM={cx:-420,cz:-140,w:16,d:14,h:5.4};
    const PRELOAD=7,KEEP=25;
    // The room's side of its door: an apothecary's green, glazed above.
    const DOOR_LOOK={style:'painted',color:0x2c4a3e,fanColor:0xffd9a0,glazed:true,width:1.9,height:3.1};
    const through=(data,go)=>doorKit&&data.kit?doorKit.pass(data.kit,data,go):go();
    let root=null,time=0,lastNeeded=-1e9;
    const owned=[],ours=[],books=[],blockers=[];
    const own=thing=>{owned.push(thing);return thing};
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    // The door in the Map Room stays when this room is freed, so its parts are not among the room's own.
    function markDoor(object,data){object.userData=data;interactables.push(object);return object}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const card=key=>({type:'medicine-card',title:CARDS[key][0],author:CARDS[key][1],action:'READ'});
    function sign(parent,text,sub,w,h,x,y,z){
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle='#1f3029';c.fillRect(0,0,W,H);c.strokeStyle='#cfa65a';c.lineWidth=6;c.strokeRect(5,5,W-10,H-10);c.fillStyle='#f3e2b4';c.textAlign='center';
        c.font='bold 30px Georgia';c.fillText(text,W/2,sub?48:H/2+11);if(sub){c.font='italic 21px Georgia';c.fillText(sub,W/2,82)}},620,sub?104:70));
      return add(own(new THREE.PlaneGeometry(w,h)),own(new THREE.MeshStandardMaterial({map,emissive:0x2a2418,emissiveIntensity:.35,roughness:.85})),x,y,z,parent);
    }
    const loader=()=>THREE.TextureLoader?new THREE.TextureLoader():null;
    function photo(url){const l=loader(),map=l?own(l.load(url)):null;if(map&&THREE.SRGBColorSpace)map.colorSpace=THREE.SRGBColorSpace;return map}

    // The books for each shelf: those listed, then the new arrivals; a book the library does not hold is left out.
    function catalogue(){return GROUPS.map(group=>({...group,books:[...new Set([...group.ids,...(arrivals[group.key]||[])])].map(id=>findBook(id)).filter(Boolean).slice(0,10)}))}

    // ---------- the door, in the Map Room ----------
    function buildDoor(){
      const g=new THREE.Group();g.name='medicine-door';g.position.set(DOOR.x,0,DOOR.z);g.rotation.y=DOOR.yaw;scene.add(g);
      const data={type:'medicine-door',title:'The Medicine Room',author:'A history of medicine, from Hippocrates to Pasteur, with the Fabrica of Vesalius under glass.',action:'ENTER'};
      if(!doorKit?.hang(g,{data,mark:markDoor,...DOOR_LOOK,...doorKit.readingRoom?.('THE MEDICINE ROOM','A history of medicine')}))markDoor(add(new THREE.BoxGeometry(1.9,3.1,.14),new THREE.MeshStandardMaterial({color:DOOR_LOOK.color,roughness:.7}),0,1.55,.08,g),data);
    }

    // ---------- the room ----------
    function buildRoom(){
      root=new THREE.Group();root.name='medicine-room';const {cx,cz,w,d,h}=ROOM;
      // Plaster walls the colour of old vellum above an oak dado, a boarded floor and a dark ceiling.
      const wall=own(new THREE.MeshStandardMaterial({color:0x7e705a,roughness:.95})),oak=own(new THREE.MeshStandardMaterial({color:0x6b4a2a,roughness:.7,map:MAT.wood?.map||null}));
      box(w,.3,d,MAT.wood,cx,-.15,cz,root);box(w,.25,d,MAT.darkWood,cx,h+.12,cz,root);
      box(w,h,.3,wall,cx,h/2,cz-d/2,root);box(w,h,.3,wall,cx,h/2,cz+d/2,root);box(.3,h,d,wall,cx-w/2,h/2,cz,root);box(.3,h,d,wall,cx+w/2,h/2,cz,root);
      for(const [x,z,sw,sd] of [[cx,cz-d/2+.17,w-.4,.05],[cx,cz+d/2-.17,w-.4,.05],[cx-w/2+.17,cz,.05,d-.4],[cx+w/2-.17,cz,.05,d-.4]]){box(sw,.95,sd,oak,x,.47,z,root);box(sw+.02,.06,sd+.03,MAT.darkWood,x,.97,z,root)}
      for(const [x,z,sw,sd] of [[cx,cz-d/2+.2,w-.4,.12],[cx,cz+d/2-.2,w-.4,.12],[cx-w/2+.2,cz,.12,d-.4],[cx+w/2-.2,cz,.12,d-.4]])box(sw,.2,sd,MAT.darkWood,x,h-.12,z,root);
      mark(sign(root,'THE MEDICINE ROOM','A history of medicine, from Hippocrates to Pasteur',3.6,.6,cx,4.6,cz-d/2+.17),card('sign'));
      // The shelves: two rows on each of three walls.
      const groups=catalogue(),geometry=own(new THREE.BoxGeometry(.72,.96,.13)),ROWS=[1.45,2.65];
      for(const group of groups){
        const along=group.wall==='north'?w-3:d-3.4,per=Math.max(1,Math.ceil(group.books.length/2)),gap=Math.min(1.3,(along-.6)/per);
        const at=(i,row)=>{const n=row?group.books.length-per:per,col=row?i-per:i,offset=(col-(n-1)/2)*gap;
          if(group.wall==='north')return {x:cx+offset,z:cz-d/2+.3,yaw:0};if(group.wall==='west')return {x:cx-w/2+.3,z:cz-.4+offset,yaw:Math.PI/2};return {x:cx+w/2-.3,z:cz-.4-offset,yaw:-Math.PI/2}};
        group.books.forEach((book,i)=>{const row=i<per?0:1,spot=at(i,row);placeBook(book,{...spot,y:ROWS[row]},geometry,group.key)});
        const info={type:'medicine-card',title:group.name,author:group.sub+'.',action:'READ'};
        if(group.wall==='north'){for(const y of ROWS)box(along,.05,.36,MAT.darkWood,cx,y-.5,cz-d/2+.35,root);block(cx,cz-d/2+.4,along+.2,.7);
          mark(sign(root,group.name,group.sub,2.9,.46,cx,3.62,cz-d/2+.17),info)}
        else{const side=group.wall==='west'?-1:1,x=cx+side*(w/2-.35);for(const y of ROWS)box(.36,.05,along,MAT.darkWood,x,y-.5,cz-.4,root);block(x,cz-.4,.7,along+.2);
          const label=sign(root,group.name,group.sub,2.9,.46,cx+side*(w/2-.17),3.62,cz-.4);label.rotation.y=-side*Math.PI/2;mark(label,info)}
      }
      buildShowcase(cx,cz+.6);
      // The Fabrica's title page and its portrait of Vesalius, framed either side of the door.
      for(const [key,dx,file] of [['title',-3.6,'title'],['portrait',3.6,'portrait']]){
        const g=new THREE.Group();g.position.set(cx+dx,2.7,cz+d/2-.2);g.rotation.y=Math.PI;root.add(g);
        const frame=box(1.5,2.1,.08,MAT.darkWood,0,0,0,g),mount=add(own(new THREE.PlaneGeometry(1.32,1.92)),own(new THREE.MeshStandardMaterial({color:0xe6dcc4,roughness:.95})),0,0,.045,g);
        const map=photo(`assets/vesalius/${file}.jpg`),print=add(own(new THREE.PlaneGeometry(1.12,1.68)),own(new THREE.MeshStandardMaterial({color:0xddd2bb,map,emissive:0xffffff,emissiveMap:map,emissiveIntensity:.08,roughness:.9})),0,0,.05,g);
        for(const part of [frame,mount,print])mark(part,card(key));
      }
      // An apothecary's cabinet in the south-west corner, with a row of blue-and-white drug jars on it.
      const jx=cx-w/2+1.4,jz=cz+d/2-1.2;box(2.2,1.1,.7,MAT.darkWood,jx,.55,jz,root);box(2.3,.06,.78,oak,jx,1.13,jz,root);block(jx,jz,2.4,.9);
      for(const dx of [-.55,.55])box(.9,.8,.02,oak,jx+dx,.55,jz-.36,root);
      const jarMap=own(canvasTexture((c,W,H)=>{c.fillStyle='#ece6d8';c.fillRect(0,0,W,H);c.strokeStyle='#2f4f8c';c.fillStyle='#2f4f8c';
        c.lineWidth=6;for(const y of [18,H-18]){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke()}
        for(let x=0;x<W;x+=64){c.beginPath();c.moveTo(x,40);c.bezierCurveTo(x+20,70,x+44,30,x+64,60);c.lineWidth=4;c.stroke();c.beginPath();c.ellipse(x+32,H/2+20,14,22,.4,0,Math.PI*2);c.fill()}
        c.fillStyle='#f6f0e2';c.fillRect(W*.2,H*.42,W*.6,H*.2);c.strokeRect(W*.2,H*.42,W*.6,H*.2)},256,128));
      jarMap.wrapS=THREE.RepeatWrapping;
      const jarGeometry=own(new THREE.CylinderGeometry(.11,.1,.3,14)),jarMaterial=own(new THREE.MeshStandardMaterial({map:jarMap,roughness:.35,metalness:.05}));
      const jars=new THREE.InstancedMesh(jarGeometry,jarMaterial,7),m=new THREE.Matrix4(),q=new THREE.Quaternion(),v=new THREE.Vector3(),sc=new THREE.Vector3();
      for(let i=0;i<7;i++){const tall=i%3===1?1.25:1;q.setFromAxisAngle(new THREE.Vector3(0,1,0),i*.9);v.set(jx-.84+i*.28,1.16+.15*tall,jz);sc.set(1,tall,1);m.compose(v,q,sc);jars.setMatrixAt(i,m)}
      jars.instanceMatrix.needsUpdate=true;own(jars);root.add(jars);mark(jars,card('jars'));
      // A reading table on the east side, with two chairs that are the library's own seats.
      const tx=cx+3.2,tz=cz+3.6;box(2.4,.08,1.1,oak,tx,.98,tz,root);for(const sx of [-1.05,1.05])for(const sz of [-.42,.42])box(.08,.94,.08,MAT.darkWood,tx+sx,.47,tz+sz,root);block(tx,tz,2.6,1.3);
      const leather=own(new THREE.MeshStandardMaterial({color:0x3e2a1c,roughness:.65}));
      for(const [dx,side] of [[-.6,-1],[.6,1]]){
        const x=tx+dx,z=tz+side*1.05,yaw=side<0?Math.PI:0,chair=new THREE.Group();chair.position.set(x,0,z);chair.rotation.y=yaw;root.add(chair);
        const seat=box(.62,.1,.6,leather,0,.5,0,chair),back=box(.62,.7,.08,leather,0,.9,.28,chair);for(const lx of [-.27,.27])for(const lz of [-.25,.25])box(.06,.48,.06,MAT.darkWood,lx,.24,lz,chair);block(x,z,.8,.8);
        if(registerSeat){const data=registerSeat([seat,back],chair,new THREE.Vector3(0,1.25,.05),yaw,{title:'A chair at the reading table',author:'Sit and read one of the Medicine Room’s books.'});
          Object.defineProperty(data,'bookIds',{get:()=>books.map(mesh=>mesh.userData.book.id),configurable:true});ours.push(seat,back)}
      }
      // A lamp hung over the case.
      const lamp=new THREE.PointLight(0xffd9a6,8,16,2);lamp.position.set(cx,h-1.4,cz+.6);root.add(lamp);
      add(own(new THREE.CylinderGeometry(.22,.4,.3,16,1,true)),own(new THREE.MeshStandardMaterial({color:0x2c4a3e,emissive:0xffb35c,emissiveIntensity:.9,roughness:.6,side:THREE.DoubleSide})),cx,h-1.2,cz+.6,root);
      add(own(new THREE.CylinderGeometry(.008,.008,1,4)),MAT.brass||MAT.darkWood,cx,h-.55,cz+.6,root);
      // The door back to the Map Room.
      const exit={type:'medicine-exit',title:'Back to the Map Room',author:'Snow’s cholera map is on the table just the other side.',action:'RETURN'};
      if(!doorKit?.hang(root,{data:exit,mark,x:cx,z:cz+d/2-.2,yaw:Math.PI,label:'THE MAP ROOM',own,...DOOR_LOOK}))mark(box(1.9,3.1,.16,own(new THREE.MeshStandardMaterial({color:DOOR_LOOK.color,roughness:.7})),cx,1.55,cz+d/2-.2,root),exit);
      scene.add(root);
    }
    // The Fabrica on show in the middle of the room: a glass case on a plinth, the facsimile lying open in a cradle at the
    // skeletons of pages 164 and 165, which face each other in the book.
    function buildShowcase(x,z){
      const g=new THREE.Group();g.position.set(x,0,z);root.add(g);
      const brass=MAT.brass||own(new THREE.MeshStandardMaterial({color:0xb08a3e,metalness:.7,roughness:.35}));
      const leaves=vesalius?.folios?Object.keys(vesalius.folios).length:0;
      const data={type:'medicine-fabrica',title:'The Fabrica of Vesalius, in facsimile',author:`De humani corporis fabrica, Basel, 1543, open at its skeletons.${leaves?` ${leaves} of its pages, on board leaves.`:''}`,action:'OPEN'};
      const plinth=box(1.5,.95,1.05,MAT.darkWood,0,.475,0,g);box(1.6,.06,1.15,MAT.darkWood,0,.97,0,g);box(1.6,.08,1.15,MAT.darkWood,0,.04,0,g);
      const pageW=.5,pageH=.75;
      const page=(key,side)=>{const map=photo(`assets/vesalius/${key}.jpg`);
        const mat=own(new THREE.MeshStandardMaterial({color:0xd8cdb6,map,emissive:0xffffff,emissiveMap:map,emissiveIntensity:.1,roughness:.9}));
        const hinge=new THREE.Group();hinge.position.set(side*.01,1.09,0);hinge.rotation.z=side*-.16;g.add(hinge);
        const m=add(own(new THREE.PlaneGeometry(pageW,pageH)),mat,side*pageW/2,0,0,hinge);m.rotation.x=-Math.PI/2;return m};
      const left=page('p164',-1),right=page('p165',1);
      for(const side of [-1,1]){const wedge=box(.54,.08,.78,MAT.darkWood,side*.27,.95,0,g);wedge.rotation.z=side*-.16}
      const glass=own(new THREE.MeshStandardMaterial({color:0xdfeee8,transparent:true,opacity:.045,roughness:.05,depthWrite:false}));
      const pane=box(1.42,.5,1.05,glass,0,1.25,0,g);
      for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]])box(.03,.5,.03,brass,sx*.71,1.25,sz*.525,g);
      for(const sz of [-1,1])box(1.45,.03,.03,brass,0,1.5,sz*.525,g);for(const sx of [-1,1])box(.03,.03,1.08,brass,sx*.71,1.5,0,g);
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle='#1f3029';c.fillRect(0,0,W,H);c.strokeStyle='#cfa65a';c.lineWidth=4;c.strokeRect(8,8,W-16,H-16);c.fillStyle='#f3e2b4';c.textAlign='center';
        c.font='bold 30px Georgia';c.fillText('DE HUMANI CORPORIS FABRICA',W/2,60);c.font='italic 24px Georgia';c.fillText('Andreas Vesalius, Basel, 1543',W/2,98);c.font='20px Georgia';c.fillText('A facsimile. Open the case to turn its pages.',W/2,132)},560,160));
      const label=add(own(new THREE.PlaneGeometry(1.05,.3)),own(new THREE.MeshStandardMaterial({map,emissive:0x3a2a12,emissiveIntensity:.3,roughness:.85})),0,.7,.53,g);
      for(const part of [plinth,pane,left,right,label])mark(part,data);
      block(x,z,1.8,1.4);
    }
    function placeBook(book,spot,geometry,shelf){
      const mesh=add(geometry,own(bookMaterial(book)),spot.x,spot.y,spot.z,root);mesh.rotation.order='YXZ';mesh.rotation.y=spot.yaw;mesh.rotation.x=-.08;
      mesh.userData={type:'book',book,loaded:false,medicine:true,shelf,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:root}};
      interactables.push(mesh);ours.push(mesh);books.push(mesh);return mesh;
    }

    // ---------- walking ----------
    function contains(x,z){return x>ROOM.cx-ROOM.w/2&&x<ROOM.cx+ROOM.w/2&&z>ROOM.cz-ROOM.d/2&&z<ROOM.cz+ROOM.d/2}
    function floorAt(x,z){return contains(x,z)?0:null}
    function allowed(x,z){
      if(!contains(x,z))return false;const r=player.radius||.42;
      if(x-r<ROOM.cx-ROOM.w/2+.45||x+r>ROOM.cx+ROOM.w/2-.45||z-r<ROOM.cz-ROOM.d/2+.45||z+r>ROOM.cz+ROOM.d/2-.45)return false;
      return !blockers.some(b=>x+r>b.minX&&x-r<b.maxX&&z+r>b.minZ&&z-r<b.maxZ);
    }

    // ---------- doing things ----------
    function enter(){
      activate();move(ROOM.cx,ROOM.cz+ROOM.d/2-1.4,0);playSample?.('doorOpen',.8,1.02);
      showNotice('The Medicine Room: a history of medicine, from Hippocrates to Pasteur. The old physic on the left, the discoveries ahead, the healers on the right, and under the glass, the Fabrica of Vesalius, open for you to turn.',10);
      analytics?.track('Room Explored',{room:'medicine-room'});
    }
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('medicine-'))return false;
      if(data.type==='medicine-door'){through(data,enter);return true}
      if(data.type==='medicine-exit'){through(data,()=>{move(DOOR.x-1.6,DOOR.z,Math.PI/2);playSample?.('doorOpen',.8,1);showNotice('The Map Room again.',3)});return true}
      if(data.type==='medicine-fabrica'){if(vesalius)vesalius.open();else showNotice('The case is locked tonight.',4);return true}
      if(data.type==='medicine-card'){showNotice(`${data.title}: ${data.author}`,10);return true}
      return false;
    }

    // ---------- lifecycle ----------
    function activate(){if(!root)buildRoom();lastNeeded=time}
    function unload(){
      if(!root)return;root.removeFromParent();root=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0;
    }
    function update(t){
      time=t;const inside=contains(player.pos.x,player.pos.z),near=Math.hypot(player.pos.x-DOOR.x,player.pos.z-DOOR.z)<PRELOAD;
      if(inside||near)activate();
      else if(root&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==root))unload();
    }
    buildDoor();
    return {contains,floorAt,allowed,interact,update,enter,unload,catalogue,door:DOOR,room:ROOM,groups:GROUPS,get built(){return !!root},get books(){return books.slice()},zoneAt:(x,z)=>contains(x,z)?'medicine-room':null};
  };
})();
