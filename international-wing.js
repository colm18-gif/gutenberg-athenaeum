// The International Wing: behind a door on the Grand Hall's south wall, beside the visitors' book. Its first room is
// the Sala de lectura en español, the Spanish Reading Room: classics in Spanish, face-out on racks above a dado of
// blue and white tiles, each with a librarian's note in Spanish (data/new-books.js, room 'spanish'). One book is out
// on the lectern each night. Two further doors wait, shut, for the Portuguese and Chinese rooms.
//
// Like the other rooms behind doors, nothing is built until the reader walks up to it, and it is freed a little
// while after they leave.
(function(){
  'use strict';

  // The rooms still to come, each announced in its own language as well as in English.
  const COMING=[
    {key:'portuguese',sign:'SALA DE LEITURA EM PORTUGUÊS',sub:'Em breve · The Portuguese Reading Room, coming soon',
      notice:'Sala de leitura em português: em breve. The Portuguese Reading Room is still being shelved; Machado de Assis and Eça de Queirós are on their way.'},
    {key:'chinese',sign:'中文閱覽室',sub:'即將開放 · The Chinese Reading Room, coming soon',
      notice:'中文閱覽室：即將開放。The Chinese Reading Room is still being shelved: the great classical novels are on their way.'}
  ];

  window.createInternationalWing=function(options){
    const {THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,arrivals=()=>[],showNotice,playSample,move,analytics,isHolding=()=>false,today=()=>new Date()}=options;
    const DOOR={x:8.6,z:30.45,yaw:Math.PI};
    const ROOM={cx:-410,cz:100,w:24,d:15,h:5.2};
    const PRELOAD=7,KEEP=25;
    let root=null,time=0,lastNeeded=-1e9;
    const owned=[],ours=[],books=[],blockers=[];
    const own=thing=>{owned.push(thing);return thing};
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    function lamp(parent,color,intensity,distance,x,y,z){const l=new THREE.PointLight(color,intensity,distance,2);l.position.set(x,y,z);parent.add(l);return l}
    const dayNumber=()=>Math.floor(Date.parse(today().toISOString().slice(0,10)+'T12:00:00Z')/86400000);
    function plaque(text,sub,w,h,dark='#1d2a3d',font='Georgia'){return canvasTexture((c,W,H)=>{c.fillStyle=dark;c.fillRect(0,0,W,H);c.strokeStyle='#d7ae60';c.lineWidth=6;c.strokeRect(5,5,W-10,H-10);c.fillStyle='#ffe2a0';c.textAlign='center';
      c.font=`bold ${Math.round(H*(sub?.3:.36))}px ${font}`;c.fillText(text,W/2,sub?H*.46:H/2+H*.12);if(sub){c.font=`italic ${Math.round(H*.19)}px Georgia`;c.fillText(sub,W/2,H*.8)}},w,h)}
    // Blue and white tiles, as in an Andalusian patio: one tile of the pattern, repeated along the dado.
    function tileTexture(){return canvasTexture((c,W,H)=>{c.fillStyle='#e9e1cc';c.fillRect(0,0,W,H);c.strokeStyle='#23457a';c.fillStyle='#2c5592';c.lineWidth=5;
      c.strokeRect(3,3,W-6,H-6);c.beginPath();c.moveTo(W/2,10);c.lineTo(W-10,H/2);c.lineTo(W/2,H-10);c.lineTo(10,H/2);c.closePath();c.stroke();
      c.beginPath();c.arc(W/2,H/2,W*.16,0,Math.PI*2);c.fill();c.fillStyle='#d99a2b';c.beginPath();c.arc(W/2,H/2,W*.07,0,Math.PI*2);c.fill();
      c.fillStyle='#2c5592';for(const [x,y] of [[0,0],[W,0],[0,H],[W,H]]){c.beginPath();c.arc(x,y,W*.14,0,Math.PI*2);c.fill()}},128,128)}

    // ---------- the books ----------
    function shelf(){return [...new Set(arrivals())].map(id=>findBook(id)).filter(Boolean)}
    // One book is out on the lectern each night, a different one tomorrow.
    function featured(list=shelf()){return list.length?list[((dayNumber()%list.length)+list.length)%list.length]:null}

    // ---------- the door, beside the visitors' book ----------
    function buildDoor(){
      const g=new THREE.Group();g.name='international-door';g.position.set(DOOR.x,0,DOOR.z);g.rotation.y=DOOR.yaw;scene.add(g);
      const data={type:'intl-door',title:'The International Wing',author:'Sala de lectura en español: clásicos en español, cada uno con una nota de la bibliotecaria. Portuguese and Chinese rooms to follow.',action:'ENTER'};
      const paint=new THREE.MeshStandardMaterial({color:0x1f3350,roughness:.75}),glass=new THREE.MeshStandardMaterial({color:0x8a6a3a,emissive:0xd9923a,emissiveIntensity:.45,roughness:.3});
      mark(add(new THREE.BoxGeometry(1.9,3.1,.14),paint,0,1.55,.08,g),data);
      const pane=add(new THREE.BoxGeometry(1.2,.7,.05),glass,0,2.35,.17,g);mark(pane,data);for(const bx of [-.2,.2])add(new THREE.BoxGeometry(.04,.72,.07),MAT.darkWood,bx,2.35,.18,g);add(new THREE.BoxGeometry(1.22,.04,.07),MAT.darkWood,0,2.35,.18,g);
      for(const px of [-.46,.46])add(new THREE.BoxGeometry(.72,1.2,.04),MAT.darkWood,px,.95,.17,g);
      for(const px of [-1.07,1.07])add(new THREE.BoxGeometry(.22,3.45,.3),MAT.brass,px,1.72,.1,g);add(new THREE.BoxGeometry(2.36,.22,.3),MAT.brass,0,3.44,.1,g);
      mark(add(new THREE.SphereGeometry(.08,10,8),MAT.brass,.68,1.45,.22,g),data);
      const plate=plaque('THE INTERNATIONAL WING','Sala de lectura en español',640,100);// the door's plaque stays for good
      mark(add(new THREE.PlaneGeometry(2.3,.36),new THREE.MeshStandardMaterial({map:plate,emissive:0xffffff,emissiveMap:plate,emissiveIntensity:.35}),0,3.8,.12,g),data);
      lamp(g,0xffc27a,1.1,5,0,3.9,1.1);
    }

    // ---------- the room ----------
    function buildRoom(){
      root=new THREE.Group();root.name='international-wing';const {cx,cz,w,d,h}=ROOM;
      const wall=own(new THREE.MeshStandardMaterial({color:0x8c5f3c,roughness:.92})),tiles=own(tileTexture());tiles.wrapS=tiles.wrapT=THREE.RepeatWrapping;
      box(w,.3,d,MAT.wood,cx,-.15,cz,root);box(w,.25,d,MAT.darkWood,cx,h+.12,cz,root);
      box(w,h,.3,wall,cx,h/2,cz-d/2,root);box(w,h,.3,wall,cx,h/2,cz+d/2,root);box(.3,h,d,wall,cx-w/2,h/2,cz,root);box(.3,h,d,wall,cx+w/2,h/2,cz,root);
      // The tiled dado, 1.1 m high all round, capped with a wooden rail.
      for(const [x,z,sw,sd,len] of [[cx,cz-d/2+.17,w-.4,.05,w],[cx,cz+d/2-.17,w-.4,.05,w],[cx-w/2+.17,cz,.05,d-.4,d],[cx+w/2-.17,cz,.05,d-.4,d]]){
        const t=own(tiles.clone());t.repeat.set(Math.round(len/.55),2);box(sw,1.1,sd,own(new THREE.MeshStandardMaterial({map:t,roughness:.45})),x,.55,z,root);box(sw,.07,sd+.06,MAT.darkWood,x,1.13,z,root)}
      const sign=add(own(new THREE.PlaneGeometry(6,.86)),own(new THREE.MeshStandardMaterial({map:own(plaque('SALA DE LECTURA EN ESPAÑOL','The Spanish Reading Room · El ala internacional',1100,158)),roughness:.8,emissive:0x5a3a18,emissiveIntensity:.3})),cx,4.55,cz-d/2+.17,root);
      mark(sign,{type:'intl-card',title:'Sala de lectura en español',author:'Clásicos de España, de América y de Filipinas, cada uno con una nota de la bibliotecaria. El libro de la noche está en el atril. (The Spanish Reading Room: classics from Spain, the Americas and the Philippines.)',action:'READ'});
      // Books face-out on sloping racks: three tiers along the north wall, three along the west wall.
      const spots=[];
      for(let row=0;row<3;row++)for(let i=0;i<10;i++)spots.push({x:cx-9.9+i*2.2,z:cz-d/2+.42,y:1.62+row*1.12,yaw:0});
      for(let row=0;row<3;row++)for(let i=0;i<6;i++)spots.push({x:cx-w/2+.42,z:cz-5.5+i*2.05,y:1.62+row*1.12,yaw:Math.PI/2});
      for(let row=0;row<3;row++){const y=1.1+row*1.12;box(22.4,.05,.36,MAT.darkWood,cx,y,cz-d/2+.36,root);box(.36,.05,12.6,MAT.darkWood,cx-w/2+.36,y,cz,root)}
      block(cx,cz-d/2+.4,w,.8);block(cx-w/2+.4,cz,.8,d);
      const list=shelf(),geometry=own(new THREE.BoxGeometry(.78,1.04,.05));
      list.slice(0,spots.length).forEach((book,i)=>placeBook(book,spots[i],geometry));
      // The rooms to come: two shut doors in the east wall, each signed in its own language.
      COMING.forEach((room,i)=>{
        const z=cz-3.2+i*6.4,x=cx+w/2-.2,data={type:'intl-coming',title:room.sign,author:room.notice,action:'LOOK',key:room.key};
        const leaf=box(.16,3.1,1.9,own(new THREE.MeshStandardMaterial({color:i?0x5a1c1a:0x1f4a33,roughness:.7})),x,1.55,z,root);mark(leaf,data);
        for(const pz of [-1.05,1.05])box(.24,3.35,.16,MAT.brass,x-.02,1.68,z+pz,root);box(.24,.16,2.3,MAT.brass,x-.02,3.3,z,root);
        const board=add(own(new THREE.PlaneGeometry(2.6,.5)),own(new THREE.MeshStandardMaterial({map:own(plaque(room.sign,room.sub,780,150,'#23170e',i?'"Noto Serif TC","Songti TC","PMingLiU",serif':'Georgia')),roughness:.8,emissive:0x5a3a18,emissiveIntensity:.25})),x-.14,3.85,z,root);
        board.rotation.y=-Math.PI/2;mark(board,data);block(x-.3,z,.6,2.4);
      });
      // The reading table, with a brass lamp, and the lectern by the door with tonight's book.
      const table=box(4.2,.08,1.6,MAT.darkWood,cx+1.5,.78,cz+1.2,root);table.name='intl-table';for(const [dx,dz] of [[-1.9,-.6],[1.9,-.6],[-1.9,.6],[1.9,.6]])box(.1,.74,.1,MAT.darkWood,cx+1.5+dx,.39,cz+1.2+dz,root);block(cx+1.5,cz+1.2,4.4,1.8);
      const leather=own(new THREE.MeshStandardMaterial({color:0x5b2418,roughness:.75}));
      for(const [dx,dz,yaw] of [[-1,-1.35,0],[1,-1.35,0],[-1,1.35,Math.PI],[1,1.35,Math.PI]]){const chair=new THREE.Group();chair.position.set(cx+1.5+dx,0,cz+1.2+dz);chair.rotation.y=yaw;root.add(chair);box(.5,.08,.5,leather,0,.46,0,chair);box(.5,.6,.08,leather,0,.78,-.24,chair);for(const [lx,lz] of [[-.2,-.2],[.2,-.2],[-.2,.2],[.2,.2]])box(.05,.44,.05,MAT.darkWood,lx,.22,lz,chair)}
      box(.1,.5,.1,MAT.brass,cx+1.5,1.07,cz+1.2,root);const shade=add(own(new THREE.CylinderGeometry(.16,.3,.24,14,1,true)),own(new THREE.MeshStandardMaterial({color:0x2c4f86,emissive:0x2c5592,emissiveIntensity:.7,roughness:.5,side:THREE.DoubleSide})),cx+1.5,1.38,cz+1.2,root);shade.name='intl-shade';
      const pick=featured(list);
      if(pick){const lx=cx-4,lz=cz+d/2-2.6;box(.5,1.05,.4,MAT.darkWood,lx,.52,lz,root);const top=box(.8,.05,.6,MAT.darkWood,lx,1.1,lz,root);top.rotation.x=.3;block(lx,lz,.8,.7);
        const card=own(plaque('EL LIBRO DE LA NOCHE','',420,70));const label=add(own(new THREE.PlaneGeometry(.8,.14)),own(new THREE.MeshStandardMaterial({map:card,roughness:.8,emissive:0xffffff,emissiveMap:card,emissiveIntensity:.3})),lx,1.34,lz-.2,root);label.rotation.x=-.2;
        const mesh=placeBook(pick,{x:lx,y:1.42,z:lz-.02,yaw:0},geometry);if(mesh){mesh.rotation.x=-1.05;mesh.userData.home.quaternion.copy(mesh.quaternion);mesh.userData.featured=true}}
      lamp(root,0xffe2b0,7,16,cx,h-.4,cz-1);lamp(root,0xfff0d0,2.4,5,cx+1.5,1.5,cz+1.2);
      // The door back to the Grand Hall.
      const exit={type:'intl-exit',title:'Back to the Grand Hall',author:'The visitors’ book is just outside.',action:'RETURN'};
      mark(box(1.9,3.1,.16,MAT.darkWood,cx,1.55,cz+d/2-.2,root),exit);for(const px of [-1.05,1.05])box(.16,3.35,.24,MAT.brass,cx+px,1.68,cz+d/2-.22,root);box(2.3,.16,.24,MAT.brass,cx,3.3,cz+d/2-.22,root);
      scene.add(root);
    }
    function placeBook(book,spot,geometry){
      if(!spot)return null;
      const mesh=add(geometry,own(bookMaterial(book)),spot.x,spot.y,spot.z,root);mesh.rotation.order='YXZ';mesh.rotation.y=spot.yaw;mesh.rotation.x=-.1;
      mesh.userData={type:'book',book,loaded:false,international:true,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:root}};
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
      activate();move(ROOM.cx,ROOM.cz+ROOM.d/2-1.4,0);playSample?.('doorOpen',.8,.96);
      const pick=featured();showNotice(`Sala de lectura en español. Bienvenidos: clásicos en español, cada uno con una nota de la bibliotecaria.${pick?` En el atril esta noche: ${pick.title}.`:''} (The International Wing: the Spanish Reading Room.)`,9);
      analytics?.track('Room Explored',{room:'international-wing'});
    }
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('intl-'))return false;
      if(data.type==='intl-door'){enter();return true}
      if(data.type==='intl-exit'){move(DOOR.x+Math.sin(DOOR.yaw)*1.9,DOOR.z+Math.cos(DOOR.yaw)*1.9,DOOR.yaw+Math.PI);playSample?.('doorOpen',.8,1);showNotice('The Grand Hall again, beside the visitors’ book.',3);return true}
      if(data.type==='intl-coming'){showNotice(data.author,8);playSample?.('pageTurn',.3,.8);return true}
      if(data.type==='intl-card'){showNotice(`${data.title}: ${data.author}`,9);return true}
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
    return {contains,floorAt,allowed,interact,update,enter,unload,featured,door:DOOR,room:ROOM,coming:COMING,get built(){return !!root},get books(){return books.slice()},zoneAt:(x,z)=>contains(x,z)?'international-wing':null};
  };
})();
