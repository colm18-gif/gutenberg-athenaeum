// The International Wing: behind a door on the Grand Hall's south wall, beside the visitors' book. Its rooms hold
// classics in their own languages, face-out on racks above a dado of tiles, each book with a librarian's note in
// that language (data/new-books.js, rooms 'spanish', 'portuguese', 'chinese' and 'french'), and one on the lectern each night:
//   the Sala de lectura en español, entered from the Grand Hall;
//   the Sala de leitura em português, through the green door in the Spanish room's east wall;
//   the Salle de lecture en français, through the blue door between them;
//   the 中文閱覽室 (the Chinese Reading Room), through the red door.
//
// Like the other rooms behind doors, each room is built only when the reader walks up to it and freed a little
// while after they leave. The wing's two lamps are moved to whichever room the reader is in, so the number of
// lights in the scene (and with it every shader) stays the same.
(function(){
  'use strict';
  const CJK='"Noto Serif TC","Songti TC","PMingLiU","Noto Serif CJK TC",serif';

  const ROOMS={
    spanish:{cx:-410,cz:100,w:24,d:15,h:6,language:'es',sign:'SALA DE LECTURA EN ESPAÑOL',sub:'The Spanish Reading Room · El ala internacional',
      card:['Sala de lectura en español','Clásicos de España, de América y de Filipinas, cada uno con una nota de la bibliotecaria. El libro de la noche está en el atril. (The Spanish Reading Room: classics from Spain, the Americas and the Philippines.)'],
      lectern:'EL LIBRO DE LA NOCHE',shade:0x2c5592,tiles:'andalusian',
      welcome:pick=>`Sala de lectura en español. Bienvenidos: clásicos en español, cada uno con una nota de la bibliotecaria.${pick?` En el atril esta noche: ${pick.title}.`:''} (The International Wing: the Spanish Reading Room.)`,
      note:'La nota de la bibliotecaria'},
    portuguese:{cx:-410,cz:132,w:24,d:15,h:6,language:'pt',sign:'SALA DE LEITURA EM PORTUGUÊS',sub:'The Portuguese Reading Room · A ala internacional',
      card:['Sala de leitura em português','Clássicos do Brasil, de Portugal e de além-mar, cada um com uma nota da bibliotecária. O livro da noite está no atril. (The Portuguese Reading Room: classics from Brazil, Portugal and beyond.)'],
      lectern:'O LIVRO DA NOITE',shade:0x2f6b4a,tiles:'lisbon',
      welcome:pick=>`Sala de leitura em português. Bem-vindos: clássicos em português, cada um com uma nota da bibliotecária.${pick?` No atril esta noite: ${pick.title}.`:''} (The International Wing: the Portuguese Reading Room.)`,
      note:'A nota da bibliotecária'},
    chinese:{cx:-410,cz:164,w:24,d:15,h:6,language:'zh',sign:'中文閱覽室',sub:'The Chinese Reading Room · 國際館',font:CJK,
      card:['中文閱覽室','古典小說、詩詞、戲曲、諸子和魯迅，每一本都附有館員的短評。今晚的書在書台上。(The Chinese Reading Room: novels, poetry, drama and philosophy, each with a note from the librarian.)'],
      lectern:'今夜之書',shade:0x8a2a1e,tiles:'lattice',
      welcome:pick=>`中文閱覽室，歡迎光臨：中文經典，每一本都附有館員的短評。${pick?`今晚書台上的是《${pick.title}》。`:''} (The International Wing: the Chinese Reading Room.)`,
      note:'館員的話'},
    french:{cx:-410,cz:196,w:24,d:15,h:6,language:'fr',sign:'SALLE DE LECTURE EN FRANÇAIS',sub:'The French Reading Room · L’aile internationale',
      card:['Salle de lecture en français','Des classiques de France et de toute la francophonie, chacun avec une note de la bibliothécaire. Le livre du soir est sur le lutrin. (The French Reading Room: classics from France and the French-speaking world.)'],
      lectern:'LE LIVRE DU SOIR',shade:0x2a3f6e,tiles:'toile',
      welcome:pick=>`Salle de lecture en français. Bienvenue : des classiques en français, chacun avec une note de la bibliothécaire.${pick?` Sur le lutrin ce soir : ${pick.title}.`:''} (The International Wing: the French Reading Room.)`,
      note:'La note de la bibliothécaire'}
  };

  window.createInternationalWing=function(options){
    const {THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,arrivals=()=>[],showNotice,playSample,move,analytics,isHolding=()=>false,today=()=>new Date(),
      wallMaterial=null,finishWalls=null}=options;   // the library's own stone walls and contact shadows (wall-finish.js), when game.js offers them
    const DOOR={x:8.6,z:30.45,yaw:Math.PI};
    // The doors in the Spanish room's east wall, to the other rooms.
    const ROOM=ROOMS.spanish,EAST=ROOM.cx+ROOM.w/2-.2,ROOM_DOORS={portuguese:{x:EAST,z:ROOM.cz-4.7},french:{x:EAST,z:ROOM.cz},chinese:{x:EAST,z:ROOM.cz+4.7}};
    const PRELOAD=7,KEEP=25;
    let time=0,lamps=null;
    const built={},lastNeeded=Object.fromEntries(Object.keys(ROOMS).map(key=>[key,-1e9]));
    const doorData={type:'intl-door',title:'The International Wing',author:'Clásicos en español · Clássicos em português · Classiques en français · 中文經典. Each book with a note from the librarian in its own language.',action:'ENTER'};
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const dayNumber=()=>Math.floor(Date.parse(today().toISOString().slice(0,10)+'T12:00:00Z')/86400000);
    function plaque(text,sub,w,h,dark='#1d2a3d',font='Georgia'){return canvasTexture((c,W,H)=>{c.fillStyle=dark;c.fillRect(0,0,W,H);c.strokeStyle='#d7ae60';c.lineWidth=6;c.strokeRect(5,5,W-10,H-10);c.fillStyle='#ffe2a0';c.textAlign='center';
      let size=Math.round(H*(sub?.3:.36));do{c.font=`bold ${size}px ${font}`;size-=2}while(c.measureText(text).width>W-40&&size>12);c.fillText(text,W/2,sub?H*.46:H/2+H*.12);if(sub){c.font=`italic ${Math.round(H*.19)}px Georgia`;c.fillText(sub,W/2,H*.8)}},w,h)}
    // One tile of each pattern, repeated along the dado: an Andalusian patio for Spain, a Lisbon façade for Portugal,
    // for France a gold fleur-de-lis on French blue, and for China a red lacquer panel with a gold key-fret border and a
    // round window.
    function tileTexture(kind){return canvasTexture((c,W,H)=>{
      if(kind==='toile'){c.fillStyle='#24386a';c.fillRect(0,0,W,H);c.strokeStyle='#d6b35a';c.fillStyle='#d6b35a';c.lineWidth=4;c.strokeRect(5,5,W-10,H-10);
        // A fleur-de-lis: a tall middle petal, two curling side petals and a band across.
        const lily=(x,y,k)=>{c.save();c.translate(x,y);c.scale(k,k);c.beginPath();c.moveTo(0,-26);c.bezierCurveTo(9,-14,8,-2,0,6);c.bezierCurveTo(-8,-2,-9,-14,0,-26);c.fill();
          for(const s of [-1,1]){c.beginPath();c.moveTo(s*2,4);c.bezierCurveTo(s*22,-2,s*24,-20,s*12,-18);c.bezierCurveTo(s*18,-10,s*12,0,s*2,8);c.fill()}
          c.fillRect(-12,6,24,5);c.beginPath();c.moveTo(-5,11);c.lineTo(5,11);c.lineTo(0,22);c.closePath();c.fill();c.restore()};
        lily(W/2,H/2-4,1.9);return}
      if(kind==='lattice'){c.fillStyle='#7a1f16';c.fillRect(0,0,W,H);c.strokeStyle='#d6a64a';c.lineWidth=4;c.strokeRect(6,6,W-12,H-12);
        c.lineWidth=3;for(const [x,y,sx,sy] of [[14,14,1,1],[W-14,14,-1,1],[14,H-14,1,-1],[W-14,H-14,-1,-1]]){c.beginPath();c.moveTo(x,y+sy*22);c.lineTo(x,y);c.lineTo(x+sx*22,y);c.lineTo(x+sx*22,y+sy*14);c.lineTo(x+sx*8,y+sy*14);c.lineTo(x+sx*8,y+sy*8);c.stroke()}
        c.beginPath();c.arc(W/2,H/2,W*.26,0,Math.PI*2);c.stroke();c.lineWidth=2;for(const k of [-1,0,1]){c.beginPath();c.moveTo(W/2+k*W*.09,H/2-W*.24);c.lineTo(W/2+k*W*.09,H/2+W*.24);c.stroke();c.beginPath();c.moveTo(W/2-W*.24,H/2+k*W*.09);c.lineTo(W/2+W*.24,H/2+k*W*.09);c.stroke()}return}c.fillStyle='#e9e1cc';c.fillRect(0,0,W,H);c.strokeStyle='#23457a';c.fillStyle='#2c5592';c.lineWidth=5;c.strokeRect(3,3,W-6,H-6);
      if(kind==='lisbon'){c.lineWidth=4;for(let k=0;k<4;k++){c.save();c.translate(W/2,H/2);c.rotate(k*Math.PI/2);c.beginPath();c.moveTo(0,-8);c.bezierCurveTo(W*.18,-H*.2,W*.1,-H*.42,0,-H*.46);c.bezierCurveTo(-W*.1,-H*.42,-W*.18,-H*.2,0,-8);c.fill();c.restore()}
        c.fillStyle='#e9e1cc';c.beginPath();c.arc(W/2,H/2,W*.09,0,Math.PI*2);c.fill();c.fillStyle='#2c5592';c.beginPath();c.arc(W/2,H/2,W*.05,0,Math.PI*2);c.fill();
        for(const [x,y] of [[0,0],[W,0],[0,H],[W,H]]){c.beginPath();c.arc(x,y,W*.1,0,Math.PI*2);c.stroke()}return}
      c.beginPath();c.moveTo(W/2,10);c.lineTo(W-10,H/2);c.lineTo(W/2,H-10);c.lineTo(10,H/2);c.closePath();c.stroke();
      c.beginPath();c.arc(W/2,H/2,W*.16,0,Math.PI*2);c.fill();c.fillStyle='#d99a2b';c.beginPath();c.arc(W/2,H/2,W*.07,0,Math.PI*2);c.fill();
      c.fillStyle='#2c5592';for(const [x,y] of [[0,0],[W,0],[0,H],[W,H]]){c.beginPath();c.arc(x,y,W*.14,0,Math.PI*2);c.fill()}},128,128)}

    // ---------- the books ----------
    function shelf(key){return [...new Set(arrivals(key))].map(id=>findBook(id)).filter(Boolean)}
    // One book is out on each lectern each night, a different one tomorrow.
    function featured(key='spanish',list=shelf(key)){return list.length?list[((dayNumber()%list.length)+list.length)%list.length]:null}

    // ---------- the door, beside the visitors' book ----------
    function buildDoor(){
      const g=new THREE.Group();g.name='international-door';g.position.set(DOOR.x,0,DOOR.z);g.rotation.y=DOOR.yaw;scene.add(g);
      const mark=(object,data)=>{object.userData=data;interactables.push(object);return object};
      const paint=new THREE.MeshStandardMaterial({color:0x1f3350,roughness:.75}),glass=new THREE.MeshStandardMaterial({color:0x8a6a3a,emissive:0xd9923a,emissiveIntensity:.45,roughness:.3});
      mark(add(new THREE.BoxGeometry(1.9,3.1,.14),paint,0,1.55,.08,g),doorData);
      const pane=add(new THREE.BoxGeometry(1.2,.7,.05),glass,0,2.35,.17,g);mark(pane,doorData);for(const bx of [-.2,.2])add(new THREE.BoxGeometry(.04,.72,.07),MAT.darkWood,bx,2.35,.18,g);add(new THREE.BoxGeometry(1.22,.04,.07),MAT.darkWood,0,2.35,.18,g);
      for(const px of [-.46,.46])add(new THREE.BoxGeometry(.72,1.2,.04),MAT.darkWood,px,.95,.17,g);
      for(const px of [-1.07,1.07])add(new THREE.BoxGeometry(.22,3.45,.3),MAT.brass,px,1.72,.1,g);add(new THREE.BoxGeometry(2.36,.22,.3),MAT.brass,0,3.44,.1,g);
      mark(add(new THREE.SphereGeometry(.08,10,8),MAT.brass,.68,1.45,.22,g),doorData);
      const plate=plaque('THE INTERNATIONAL WING','Español · Português · Français · 中文',640,100);// the door's plaque stays for good
      mark(add(new THREE.PlaneGeometry(2.3,.36),new THREE.MeshStandardMaterial({map:plate,emissive:0xffffff,emissiveMap:plate,emissiveIntensity:.35}),0,3.8,.12,g),doorData);
      const l=new THREE.PointLight(0xffc27a,1.1,5,2);l.position.set(0,3.9,1.1);g.add(l);
    }

    // ---------- a room ----------
    function buildRoom(key){
      const def=ROOMS[key],{cx,cz,w,d,h}=def,root=new THREE.Group();root.name=`international-${key}`;
      const room=built[key]={root,owned:[],ours:[],books:[],blockers:[]};
      const own=thing=>{room.owned.push(thing);return thing};
      const box=(bw,bh,bd,material,x,y,z,parent=root)=>add(own(new THREE.BoxGeometry(bw,bh,bd)),material,x,y,z,parent);
      const mark=(object,data)=>{object.userData=data;interactables.push(object);room.ours.push(object);return object};
      const block=(x,z,bw,bd)=>room.blockers.push({minX:x-bw/2,maxX:x+bw/2,minZ:z-bd/2,maxZ:z+bd/2});
      const wall=wallMaterial||own(new THREE.MeshStandardMaterial({color:0x7a5236,roughness:.92})),tiles=own(tileTexture(def.tiles));tiles.wrapS=tiles.wrapT=THREE.RepeatWrapping;
      box(w,.3,d,MAT.wood,cx,-.15,cz);box(w,.25,d,MAT.darkWood,cx,h+.12,cz);
      const walls=[box(w,h,.3,wall,cx,h/2,cz-d/2),box(w,h,.3,wall,cx,h/2,cz+d/2),box(.3,h,d,wall,cx-w/2,h/2,cz),box(.3,h,d,wall,cx+w/2,h/2,cz)];
      finishWalls?.(walls.map((mesh,i)=>[mesh,...(i<2?[w,h,.3]:[.3,h,d])]));
      // The tiled dado, 1.1 m high all round, capped with a wooden rail.
      for(const [x,z,sw,sd,len] of [[cx,cz-d/2+.17,w-.4,.05,w],[cx,cz+d/2-.17,w-.4,.05,w],[cx-w/2+.17,cz,.05,d-.4,d],[cx+w/2-.17,cz,.05,d-.4,d]]){
        const t=own(tiles.clone());t.repeat.set(Math.round(len/.55),2);box(sw,1.1,sd,own(new THREE.MeshStandardMaterial({map:t,roughness:.45})),x,.55,z);box(sw,.07,sd+.06,MAT.darkWood,x,1.13,z)}
      const sign=add(own(new THREE.PlaneGeometry(6,.86)),own(new THREE.MeshStandardMaterial({map:own(plaque(def.sign,def.sub,1100,158,'#1d2a3d',def.font)),roughness:.8,emissive:0x5a3a18,emissiveIntensity:.3})),cx,5.28,cz-d/2+.24,root);
      mark(sign,{type:'intl-card',title:def.card[0],author:def.card[1],action:'READ'});
      // Books face-out on sloping racks: three tiers along the north wall, three along the west wall.
      const spots=[];
      for(let row=0;row<3;row++)for(let i=0;i<10;i++)spots.push({x:cx-9.9+i*2.2,z:cz-d/2+.42,y:1.62+row*1.12,yaw:0});
      for(let row=0;row<3;row++)for(let i=0;i<6;i++)spots.push({x:cx-w/2+.42,z:cz-5.5+i*2.05,y:1.62+row*1.12,yaw:Math.PI/2});
      // Dark wooden bookcases behind the racks, with uprights between the columns and a cornice along the top.
      box(22.6,3.45,.06,MAT.darkWood,cx,2.84,cz-d/2+.2);box(.06,3.45,12.8,MAT.darkWood,cx-w/2+.2,2.84,cz);
      box(22.8,.14,.46,MAT.darkWood,cx,4.6,cz-d/2+.36);box(.46,.14,13,MAT.darkWood,cx-w/2+.36,4.6,cz);
      for(let i=0;i<=10;i++)box(.07,3.45,.4,MAT.darkWood,cx-11+i*2.2,2.84,cz-d/2+.38);for(let i=0;i<=6;i++)box(.4,3.45,.07,MAT.darkWood,cx-w/2+.38,2.84,cz-6.52+i*2.05);
      for(let row=0;row<3;row++){const y=1.1+row*1.12;box(22.4,.05,.36,MAT.darkWood,cx,y,cz-d/2+.36);box(.36,.05,12.6,MAT.darkWood,cx-w/2+.36,y,cz)}
      block(cx,cz-d/2+.4,w,.8);block(cx-w/2+.4,cz,.8,d);
      const list=shelf(key),geometry=own(new THREE.BoxGeometry(.78,1.04,.05));
      const placeBook=(book,spot)=>{const mesh=add(geometry,own(bookMaterial(book)),spot.x,spot.y,spot.z,root);mesh.rotation.order='YXZ';mesh.rotation.y=spot.yaw;mesh.rotation.x=-.1;
        mesh.userData={type:'book',book,loaded:false,international:true,wingRoom:key,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:root}};
        interactables.push(mesh);room.ours.push(mesh);room.books.push(mesh);return mesh};
      list.slice(0,spots.length).forEach((book,i)=>placeBook(book,spots[i]));
      // The doors in the east wall of the Spanish room: green to the Portuguese room, blue to the French, red to the Chinese.
      const eastDoor=(z,color,data,signText,signSub,font='Georgia')=>{const x=cx+w/2-.2;
        mark(box(.16,3.1,1.9,own(new THREE.MeshStandardMaterial({color,roughness:.7})),x,1.55,z),data);
        for(const pz of [-1.05,1.05])box(.24,3.35,.16,MAT.brass,x-.02,1.68,z+pz);box(.24,.16,2.3,MAT.brass,x-.02,3.3,z);
        const board=add(own(new THREE.PlaneGeometry(2.6,.5)),own(new THREE.MeshStandardMaterial({map:own(plaque(signText,signSub,780,150,'#23170e',font)),roughness:.8,emissive:0x5a3a18,emissiveIntensity:.25})),x-.14,3.85,z,root);
        board.rotation.y=-Math.PI/2;mark(board,data);block(x-.3,z,.6,2.4)};
      if(key==='spanish'){
        eastDoor(ROOM_DOORS.portuguese.z,0x1f4a33,{type:'intl-go',room:'portuguese',title:'Sala de leitura em português',author:'Clássicos em português, cada um com uma nota da bibliotecária. (The Portuguese Reading Room.)',action:'ENTER'},'SALA DE LEITURA EM PORTUGUÊS','Entre · The Portuguese Reading Room');
        eastDoor(ROOM_DOORS.french.z,0x1f3160,{type:'intl-go',room:'french',title:'Salle de lecture en français',author:'Des classiques en français, chacun avec une note de la bibliothécaire. (The French Reading Room.)',action:'ENTER'},'SALLE DE LECTURE EN FRANÇAIS','Entrez · The French Reading Room');
        eastDoor(ROOM_DOORS.chinese.z,0x5a1c1a,{type:'intl-go',room:'chinese',title:'中文閱覽室',author:'中文經典，每一本都附有館員的短評。(The Chinese Reading Room.)',action:'ENTER'},'中文閱覽室','請進 · The Chinese Reading Room',CJK);
      }
      // The reading table, with a lamp, and the lectern by the door with tonight's book.
      box(4.2,.08,1.6,MAT.darkWood,cx+1.5,.78,cz+1.2);for(const [dx,dz] of [[-1.9,-.6],[1.9,-.6],[-1.9,.6],[1.9,.6]])box(.1,.74,.1,MAT.darkWood,cx+1.5+dx,.39,cz+1.2+dz);block(cx+1.5,cz+1.2,4.4,1.8);
      const leather=own(new THREE.MeshStandardMaterial({color:0x5b2418,roughness:.75}));
      for(const [dx,dz,yaw] of [[-1,-1.35,0],[1,-1.35,0],[-1,1.35,Math.PI],[1,1.35,Math.PI]]){const chair=new THREE.Group();chair.position.set(cx+1.5+dx,0,cz+1.2+dz);chair.rotation.y=yaw;root.add(chair);box(.5,.08,.5,leather,0,.46,0,chair);box(.5,.6,.08,leather,0,.78,-.24,chair);for(const [lx,lz] of [[-.2,-.2],[.2,-.2],[-.2,.2],[.2,.2]])box(.05,.44,.05,MAT.darkWood,lx,.22,lz,chair)}
      box(.1,.5,.1,MAT.brass,cx+1.5,1.07,cz+1.2);add(own(new THREE.CylinderGeometry(.16,.3,.24,14,1,true)),own(new THREE.MeshStandardMaterial({color:def.shade,emissive:def.shade,emissiveIntensity:.7,roughness:.5,side:THREE.DoubleSide})),cx+1.5,1.38,cz+1.2,root);
      const pick=featured(key,list);
      if(pick){const lx=cx-4,lz=cz+d/2-2.6;box(.5,1.05,.4,MAT.darkWood,lx,.52,lz);const top=box(.8,.05,.6,MAT.darkWood,lx,1.1,lz);top.rotation.x=.3;block(lx,lz,.8,.7);
        const card=own(plaque(def.lectern,'',420,70,'#1d2a3d',def.font));const label=add(own(new THREE.PlaneGeometry(.8,.14)),own(new THREE.MeshStandardMaterial({map:card,roughness:.8,emissive:0xffffff,emissiveMap:card,emissiveIntensity:.3})),lx,1.34,lz-.2,root);label.rotation.x=-.2;
        const mesh=placeBook(pick,{x:lx,y:1.42,z:lz-.02,yaw:0});mesh.rotation.x=-1.05;mesh.userData.home.quaternion.copy(mesh.quaternion);mesh.userData.featured=true}
      // The way out: to the Grand Hall from the Spanish room, back to the Spanish room from the others.
      const exit=key==='spanish'?{type:'intl-exit',title:'Back to the Grand Hall',author:'The visitors’ book is just outside.',action:'RETURN'}
        :{type:'intl-go',room:'spanish',back:key,title:'Sala de lectura en español',author:({chinese:'回到西班牙文閱覽室。',french:'Retour à la salle espagnole. '}[key]||'')+'Back to the Spanish Reading Room.',action:'RETURN'};
      mark(box(1.9,3.1,.16,MAT.darkWood,cx,1.55,cz+d/2-.2),exit);for(const px of [-1.05,1.05])box(.16,3.35,.24,MAT.brass,cx+px,1.68,cz+d/2-.22);box(2.3,.16,.24,MAT.brass,cx,3.3,cz+d/2-.22);
      scene.add(root);
    }

    // The wing's two lamps, moved to the room the reader is in: one overhead, one on the reading table.
    function placeLamps(key){
      if(!lamps){lamps=[new THREE.PointLight(0xffe2b0,7,16,2),new THREE.PointLight(0xfff0d0,2.4,5,2)];for(const l of lamps)scene.add(l)}
      const {cx,cz,h}=ROOMS[key];lamps[0].position.set(cx,h-.4,cz-1);lamps[1].position.set(cx+1.5,1.5,cz+1.2);
    }

    // ---------- walking ----------
    const inRoom=(def,x,z)=>x>def.cx-def.w/2&&x<def.cx+def.w/2&&z>def.cz-def.d/2&&z<def.cz+def.d/2;
    const roomAt=(x,z)=>Object.keys(ROOMS).find(key=>inRoom(ROOMS[key],x,z))||null;
    function contains(x,z){return !!roomAt(x,z)}
    function floorAt(x,z){return contains(x,z)?0:null}
    function allowed(x,z){
      const key=roomAt(x,z);if(!key)return false;const def=ROOMS[key],r=player.radius||.42;
      if(x-r<def.cx-def.w/2+.45||x+r>def.cx+def.w/2-.45||z-r<def.cz-def.d/2+.45||z+r>def.cz+def.d/2-.45)return false;
      return !(built[key]?.blockers||[]).some(b=>x+r>b.minX&&x-r<b.maxX&&z+r>b.minZ&&z-r<b.maxZ);
    }

    // ---------- doing things ----------
    function enter(key='spanish'){
      const def=ROOMS[key]||ROOMS.spanish;key=ROOMS[key]?key:'spanish';
      activate(key);placeLamps(key);move(def.cx,def.cz+def.d/2-1.4,0);playSample?.('doorOpen',.8,.96);
      showNotice(def.welcome(featured(key)),9);
      analytics?.track('Room Explored',{room:key==='spanish'?'international-wing':`international-wing-${key}`});
    }
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('intl-'))return false;
      if(data.type==='intl-door'){enter('spanish');return true}
      if(data.type==='intl-go'){
        // Back from the Portuguese or Chinese room: out through its door, into the Spanish room.
        if(data.back){const from=ROOM_DOORS[data.back]||ROOM_DOORS.portuguese;activate('spanish');placeLamps('spanish');move(from.x-1.8,from.z,-Math.PI/2);playSample?.('doorOpen',.8,1);showNotice('Sala de lectura en español.',3)}
        else enter(data.room);
        return true;
      }
      if(data.type==='intl-exit'){move(DOOR.x+Math.sin(DOOR.yaw)*1.9,DOOR.z+Math.cos(DOOR.yaw)*1.9,DOOR.yaw+Math.PI);playSample?.('doorOpen',.8,1);showNotice('The Grand Hall again, beside the visitors’ book.',3);return true}
      if(data.type==='intl-card'){showNotice(`${data.title}: ${data.author}`,9);return true}
      return false;
    }

    // ---------- lifecycle ----------
    function activate(key){if(!built[key])buildRoom(key);lastNeeded[key]=time}
    function unload(key){
      const room=built[key];if(!room)return;room.root.removeFromParent();delete built[key];
      for(let i=interactables.length-1;i>=0;i--)if(room.ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of room.owned)thing.dispose?.();
      if(!Object.keys(built).length&&lamps){for(const l of lamps)l.removeFromParent();lamps=null}
    }
    function update(t){
      time=t;const {x,z}=player.pos,here=roomAt(x,z);
      if(here){activate(here);placeLamps(here)}
      if(Math.hypot(x-DOOR.x,z-DOOR.z)<PRELOAD)activate('spanish');
      if(here==='spanish')for(const [key,door] of Object.entries(ROOM_DOORS))if(Math.hypot(x-door.x,z-door.z)<PRELOAD)activate(key);
      for(const key of Object.keys(built)){const room=built[key];
        if(key!==here&&t-lastNeeded[key]>KEEP&&!isHolding()&&!room.books.some(b=>b.parent!==room.root))unload(key)}
    }
    buildDoor();
    return {contains,floorAt,allowed,interact,update,enter,unload:()=>{for(const key of Object.keys(built))unload(key)},featured,roomAt,door:DOOR,room:ROOM,rooms:ROOMS,
      get built(){return !!built.spanish},isBuilt:key=>!!built[key],get books(){return Object.values(built).flatMap(room=>room.books)},zoneAt:(x,z)=>contains(x,z)?'international-wing':null};
  };
})();
