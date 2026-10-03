// The Set Texts Room: through a door in the English Reading Room's east wall, the plays and novels most often set for
// GCSE English Literature, for students and their teachers. Shakespeare on the west wall, the nineteenth-century novel
// on the north wall, a long table with chairs that open one of the room's books, and on the east wall a board telling
// teachers how to link straight to a book, a chapter or a scene (set-texts/index.html, read.html#…), with the
// anthology of poems on a lectern beside it (scripts/anthology.mjs).
//
// The English Reading Room keeps only one darker book, so these are in a room of their own. Like the other rooms behind
// doors, nothing is built until the reader walks up to it, and it is freed a little while after they leave.
(function(){
  'use strict';

  // The novels on the north wall, in the order of the board; the plays on the west wall are Romeo and Juliet and the
  // new arrivals (data/new-books.js, room set-texts).
  const NOVELS=[43,46,1400,1260,84,1342,2097,550,36];
  const PLAYS=[1513];
  // Poems from the Anthologies, the library's own binding (scripts/anthology.mjs).
  const ANTHOLOGY=940001;
  const CARDS={
    board:['Set texts','The plays and novels most often set for GCSE English Literature. Every one has a page of its own and a plain-text version for any school computer, with a link to each chapter, act and scene: libraryafterdark.space/set-texts'],
    sign:['The Set Texts Room','Shakespeare on the west wall, the nineteenth-century novel on the north. Sit at the table to read one of them.']
  };

  window.createSetTextsRoom=function(options){
    const {THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,arrivals=[],showNotice,playSample,move,analytics,isHolding=()=>false,registerSeat=null,doorKit=null,
      learners={cx:-330,cz:-60,w:16,d:14}}=options;
    // In the English Reading Room's east wall, near its south-east corner, facing into that room.
    const DOOR={x:learners.cx+learners.w/2-.15,z:learners.cz+learners.d/2-1.9,yaw:-Math.PI/2};
    const ROOM={cx:-330,cz:60,w:14,d:12,h:5};
    const PRELOAD=7,KEEP=25;
    // A schoolroom door, painted ink blue and glazed above.
    const DOOR_LOOK={style:'painted',color:0x26405e,fanColor:0xffd08a,glazed:true,width:1.9,height:3.1};
    const through=(data,go)=>doorKit&&data.kit?doorKit.pass(data.kit,data,go):go();
    let root=null,time=0,lastNeeded=-1e9;
    const owned=[],ours=[],books=[],blockers=[];
    const own=thing=>{owned.push(thing);return thing};
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    // The door in the English Reading Room stays when this room is freed, so its parts are not among the room's own.
    function markDoor(object,data){object.userData=data;interactables.push(object);return object}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const card=key=>({type:'settexts-card',title:CARDS[key][0],author:CARDS[key][1],action:'READ'});
    function sign(parent,text,sub,w,h,x,y,z){
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle='#1d2c3d';c.fillRect(0,0,W,H);c.strokeStyle='#d7ae60';c.lineWidth=6;c.strokeRect(5,5,W-10,H-10);c.fillStyle='#ffe2a0';c.textAlign='center';
        c.font='bold 30px Georgia';c.fillText(text,W/2,sub?48:H/2+11);if(sub){c.font='italic 21px Georgia';c.fillText(sub,W/2,82)}},620,sub?104:70));
      return add(own(new THREE.PlaneGeometry(w,h)),own(new THREE.MeshStandardMaterial({map,emissive:0x2a2418,emissiveIntensity:.35,roughness:.85})),x,y,z,parent);
    }

    // The books for each wall: those listed, then the new arrivals; a book the library does not hold is left out.
    function catalogue(){
      const found=ids=>[...new Set(ids)].map(id=>findBook(id)).filter(Boolean);
      return {plays:found([...arrivals.slice(0,1),...PLAYS,...arrivals.slice(1)]).slice(0,6),novels:found(NOVELS).slice(0,10),poems:findBook(ANTHOLOGY)||null};
    }

    // ---------- the door, in the English Reading Room ----------
    function buildDoor(){
      const g=new THREE.Group();g.name='settexts-door';g.position.set(DOOR.x,0,DOOR.z);g.rotation.y=DOOR.yaw;scene.add(g);
      const data={type:'settexts-door',title:'The Set Texts Room',author:'The plays and novels set for GCSE English Literature, for students and their teachers.',action:'ENTER'};
      if(!doorKit?.hang(g,{data,mark:markDoor,...DOOR_LOOK,...doorKit.readingRoom?.('THE SET TEXTS ROOM','For the English classroom')}))markDoor(add(new THREE.BoxGeometry(1.9,3.1,.14),new THREE.MeshStandardMaterial({color:DOOR_LOOK.color,roughness:.7}),0,1.55,.08,g),data);
    }

    // ---------- the room ----------
    function buildRoom(){
      root=new THREE.Group();root.name='set-texts-room';const {cx,cz,w,d,h}=ROOM;
      const wall=own(new THREE.MeshStandardMaterial({color:0x6d6252,roughness:.95}));
      box(w,.3,d,MAT.wood,cx,-.15,cz,root);box(w,.25,d,MAT.darkWood,cx,h+.12,cz,root);
      box(w,h,.3,wall,cx,h/2,cz-d/2,root);box(w,h,.3,wall,cx,h/2,cz+d/2,root);box(.3,h,d,wall,cx-w/2,h/2,cz,root);box(.3,h,d,wall,cx+w/2,h/2,cz,root);
      for(const [x,z,sw,sd] of [[cx,cz-d/2+.17,w-.4,.05],[cx,cz+d/2-.17,w-.4,.05],[cx-w/2+.17,cz,.05,d-.4],[cx+w/2-.17,cz,.05,d-.4]])box(sw,1.05,sd,MAT.darkWood,x,.52,z,root);
      mark(sign(root,'THE SET TEXTS ROOM','Books for the English classroom',3.6,.6,cx,4.35,cz-d/2+.17),card('sign'));
      const {plays,novels,poems}=catalogue(),geometry=own(new THREE.BoxGeometry(.72,.96,.13));
      // The nineteenth-century novel along the north wall: two shelves of five.
      const nz=cz-d/2+.3;for(const y of [1.05,2.4])box(6.6,.05,.36,MAT.darkWood,cx,y,nz+.05,root);block(cx,nz+.2,6.8,.7);
      // In reading order: the top shelf first, from the left.
      novels.forEach((book,i)=>placeBook(book,{x:cx-2.64+(i%5)*1.32,y:i<5?2.9:1.55,z:nz,yaw:0},geometry,'novel'));
      const novelSign=sign(root,'THE NINETEENTH-CENTURY NOVEL','',3.4,.4,cx,3.65,cz-d/2+.17);mark(novelSign,{type:'settexts-card',title:'The nineteenth-century novel',author:'Dickens, the Brontës, Austen, Mary Shelley, Stevenson, Conan Doyle, George Eliot and H. G. Wells.',action:'READ'});
      // Shakespeare along the west wall: two shelves of three.
      const sx=cx-w/2+.3;for(const y of [1.05,2.4])box(.36,.05,4.2,MAT.darkWood,sx+.05,y,cz,root);block(sx+.2,cz,.7,4.4);
      plays.forEach((book,i)=>placeBook(book,{x:sx,y:i<3?2.9:1.55,z:cz+1.32-(i%3)*1.32,yaw:Math.PI/2},geometry,'play'));
      const playSign=sign(root,'SHAKESPEARE','',2.2,.4,cx-w/2+.17,3.65,cz);playSign.rotation.y=Math.PI/2;mark(playSign,{type:'settexts-card',title:'Shakespeare',author:'The tragedies, the comedies and the Roman play most often set for GCSE.',action:'READ'});
      // The board on the east wall, for teachers.
      const boardMap=own(canvasTexture((c,W,H)=>{
        c.fillStyle='#24332b';c.fillRect(0,0,W,H);c.strokeStyle='#8a6a3e';c.lineWidth=16;c.strokeRect(0,0,W,H);c.textAlign='center';c.fillStyle='#f4f1e6';
        c.font='bold 44px Georgia';c.fillText('FOR TEACHERS',W/2,74);c.font='30px Georgia';c.fillStyle='#e8e0c8';
        const lines=['Every book here has a page of its own,','and a plain-text version for any school computer,','with a link to each chapter, act and scene.','','Read it, listen to it, or set a chapter for homework:'];
        lines.forEach((l,i)=>c.fillText(l,W/2,140+i*44));c.font='bold 38px Georgia';c.fillStyle='#ffe2a0';c.fillText('libraryafterdark.space/set-texts',W/2,400);
      },1024,460));
      const board=add(own(new THREE.PlaneGeometry(3.8,1.7)),own(new THREE.MeshStandardMaterial({map:boardMap,roughness:.95,emissive:0x151515,emissiveIntensity:.3})),cx+w/2-.17,2.45,cz-.6,root);board.rotation.y=-Math.PI/2;mark(board,card('board'));
      // The anthology on a lectern by the board, open towards the room.
      if(poems){const lx=cx+w/2-.95,lz=cz+3.2;box(.5,1.05,.4,MAT.darkWood,lx,.52,lz,root);const top=box(.6,.05,.8,MAT.darkWood,lx,1.1,lz,root);top.rotation.z=.3;block(lx,lz,.8,.9);
        placeBook(poems,{x:lx-.02,y:1.42,z:lz,yaw:-Math.PI/2,tilt:-1.05},geometry,'poems');
        const label=sign(root,'POETRY','',1.2,.3,cx+w/2-.17,2.05,lz);label.rotation.y=-Math.PI/2;mark(label,{type:'settexts-card',title:'Poetry',author:'Poems from the Anthologies: the poems in the GCSE anthologies that are in the public domain, each with a note and a link of its own.',action:'READ'})}
      // A long table down the middle, with chairs that are the library's own seats.
      box(5.2,.1,1.4,MAT.wood,cx,1.0,cz+1.2,root);for(const dx of [-2.4,2.4])for(const dz of [-.55,.55])box(.1,.98,.1,MAT.darkWood,cx+dx,.49,cz+1.2+dz,root);block(cx,cz+1.2,5.4,1.6);
      const fabric=own(new THREE.MeshStandardMaterial({color:0x34465a,roughness:.9}));
      for(const [dx,side] of [[-1.5,-1],[1.5,-1],[-1.5,1],[1.5,1]]){
        const x=cx+dx,z=cz+1.2+side*1.25,yaw=side<0?Math.PI:0,chair=new THREE.Group();chair.position.set(x,0,z);chair.rotation.y=yaw;root.add(chair);
        const seat=box(.8,.1,.75,fabric,0,.55,0,chair),back=box(.8,.85,.1,MAT.darkWood,0,1.02,.36,chair);for(const lx of [-.34,.34])for(const lz of [-.3,.3])box(.06,.52,.06,MAT.darkWood,lx,.27,lz,chair);block(x,z,.9,.9);
        if(registerSeat){const data=registerSeat([seat,back],chair,new THREE.Vector3(0,1.3,.1),yaw,{title:'A chair at the long table',author:'Sit and read one of the set texts.'});
          Object.defineProperty(data,'bookIds',{get:()=>books.map(mesh=>mesh.userData.book.id),configurable:true});ours.push(seat,back)}
      }
      // A pendant lamp over the table.
      const lamp=new THREE.PointLight(0xffd49a,9,16,2);lamp.position.set(cx,h-1.2,cz+.4);root.add(lamp);
      add(own(new THREE.CylinderGeometry(.2,.38,.32,14,1,true)),own(new THREE.MeshStandardMaterial({color:0xf2d6a0,emissive:0xffb35c,emissiveIntensity:1.1,roughness:.7})),cx,h-1,cz+.4,root);
      // The door back to the English Reading Room.
      const exit={type:'settexts-exit',title:'Back to the English Reading Room',author:'The schoolroom is just the other side.',action:'RETURN'};
      if(!doorKit?.hang(root,{data:exit,mark,x:cx,z:cz+d/2-.2,yaw:Math.PI,label:'THE ENGLISH READING ROOM',own,...DOOR_LOOK}))mark(box(1.9,3.1,.16,own(new THREE.MeshStandardMaterial({color:DOOR_LOOK.color,roughness:.7})),cx,1.55,cz+d/2-.2,root),exit);
      scene.add(root);
    }
    function placeBook(book,spot,geometry,shelf){
      const mesh=add(geometry,own(bookMaterial(book)),spot.x,spot.y,spot.z,root);mesh.rotation.order='YXZ';mesh.rotation.y=spot.yaw;mesh.rotation.x=spot.tilt??-.08;
      mesh.userData={type:'book',book,loaded:false,setText:true,shelf,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:root}};
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
      showNotice('The Set Texts Room: the plays and novels set for GCSE English Literature. Shakespeare on the left, the nineteenth-century novel ahead, and a board for teachers on the right.',9);
      analytics?.track('Room Explored',{room:'set-texts-room'});
    }
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('settexts-'))return false;
      if(data.type==='settexts-door'){through(data,enter);return true}
      if(data.type==='settexts-exit'){through(data,()=>{move(DOOR.x-1.6,DOOR.z,Math.PI/2);playSample?.('doorOpen',.8,1);showNotice('The English Reading Room again.',3)});return true}
      if(data.type==='settexts-card'){showNotice(`${data.title}: ${data.author}`,10);return true}
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
    return {contains,floorAt,allowed,interact,update,enter,unload,catalogue,door:DOOR,room:ROOM,novels:NOVELS,plays:PLAYS,anthology:ANTHOLOGY,get built(){return !!root},get books(){return books.slice()},zoneAt:(x,z)=>contains(x,z)?'set-texts-room':null};
  };
})();
