// The Naturalist's Cabinet: Darwin's study and a Victorian cabinet of curiosities, through a door at the south end of
// the Medicine Room's west wall (Darwin went to Edinburgh to study medicine, and left it for beetles). Round the walls,
// three shelves: the origin (Darwin, and the argument he started), the collectors (voyages, specimens and the long way
// home) and the observers (those who watched one place closely), from data/new-books.js (rooms nature-*). In the middle,
// a glass dome of hummingbirds; on the east wall, a glazed case of shells, eggs and butterflies; by the south window,
// which looks out on the Sandwalk, Darwin's writing table with a microscope and Wallace's letter from Ternate, a cabinet
// of beetles, and his armchair. At the east end of the south wall, past the window, a garden door opens on Walden Pond
// (walden.js), which hangs it. The room's secret is in the writing table's drawer: the essay of 1844, put away with a
// letter asking Emma to publish it if he died (The Foundations of the Origin of Species, room nature-sealed). Found
// once, found for good (athenaeum-darwin-sketch; ?sketch opens it). Like the other rooms behind doors, nothing is built
// until the reader walks up to it, and it is freed a little while after they leave.
(function(){
  'use strict';

  // Three shelves. Their books are the new arrivals for each (data/new-books.js), with any listed here first: the
  // library's own Origin of Species heads Darwin's shelf, and its Natural History of Selborne the observers'.
  const GROUPS=[
    {key:'origin',name:'THE ORIGIN',sub:'Darwin, and the argument he started',wall:'west',ids:[1228],max:12},
    {key:'collectors',name:'THE COLLECTORS',sub:'Voyages, specimens and the long way home',wall:'north',ids:[],max:12},
    {key:'observers',name:'THE OBSERVERS',sub:'A parish, a hive, a shore, a mountain',wall:'south',ids:[1408],max:10}
  ];
  // The secret: Darwin's essay of 1844, sealed away with his letter to Emma.
  const SEALED=[22728];
  // The opening of that letter, 5 July 1844, as Francis Darwin printed it in The Foundations of the Origin of Species.
  const LETTER='I have just finished my sketch of my species theory. If, as I believe, my theory in time be accepted even by one competent judge, it will be a considerable step in science.';
  const CARDS={
    sign:['The Naturalist’s Cabinet','Darwin and the argument he started, the collectors who went to the ends of the earth, and those who watched one place closely.'],
    hummingbirds:['A dome of hummingbirds','John Gould’s hummingbirds drew crowds to the Zoological Gardens in 1851, the year of the Great Exhibition, and Queen Victoria came to see them. Domes like this stood in parlours for decades after. These birds are made of silk and wire.'],
    specimens:['A cabinet of specimens','Shells, birds’ eggs and butterflies, of the kind every Victorian naturalist kept and many a Victorian parlour copied, sent home from beaches, nests and forests all over the world.'],
    beetles:['A drawer of beetles','Darwin collected beetles at Cambridge with a passion. Once, with a rare beetle in each hand, he saw a third and put one in his mouth to free a hand; it squirted something so acrid that he spat it out, and lost it, and the third as well.'],
    microscope:['Darwin’s microscope','He spent eight years, from 1846 to 1854, dissecting barnacles under a microscope like this one, living and fossil, and wrote four volumes on them. They taught him how much the members of one species differ.'],
    ternate:['A letter from Ternate','In June 1858 a letter reached Down House from Alfred Russel Wallace in the Moluccas, with an essay setting out, on his own, the theory Darwin had been working on for twenty years. Lyell and Hooker had both men’s papers read at the Linnean Society on 1 July, and the Origin followed in November 1859.'],
    sandwalk:['The Sandwalk','The path Darwin laid round a strip of woodland at Down House, which he walked every day and called his thinking path. He kept a pile of flints at the turn and knocked one away on each lap, so as not to lose count.'],
    chair:['Darwin’s chair','Darwin did not write at a desk: he sat in an armchair with a board across its arms. Sit and read one of the cabinet’s books.']
  };

  window.createNaturalistRoom=function(options){
    const {THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,arrivals={},showNotice,playSample,move,analytics,isHolding=()=>false,registerSeat=null,doorKit=null,storage=window.localStorage,
      medicineRoom={cx:-420,cz:-140,w:16,d:14}}=options;
    // At the south end of the Medicine Room's west wall, facing into the Medicine Room (medicine-room.js stops its west
    // shelf short to leave that end of the wall clear).
    const DOOR={x:medicineRoom.cx-medicineRoom.w/2+.15,z:medicineRoom.cz+medicineRoom.d/2-4,yaw:Math.PI/2};
    const ROOM={cx:-500,cz:-140,w:20,d:16,h:5.6};
    // The way in, on the room's east wall.
    const DOOR_Z=ROOM.cz+1;
    const PRELOAD=7,KEEP=25;
    // The room's side of its door: a conservatory green, glazed above.
    const DOOR_LOOK={style:'painted',color:0x34503a,fanColor:0xe0f0c8,glazed:true,width:1.9,height:3.1};
    const FOUND_KEY='athenaeum-darwin-sketch';
    const wasFound=()=>{try{return storage?.getItem(FOUND_KEY)==='1'||/[?&]sketch\b/.test(location.search)}catch(e){return false}};
    const through=(data,go)=>doorKit&&data.kit?doorKit.pass(data.kit,data,go):go();
    let root=null,time=0,lastNeeded=-1e9,drawer=null;
    const owned=[],ours=[],books=[],blockers=[];
    const own=thing=>{owned.push(thing);return thing};
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    // The door in the Medicine Room stays when this room is freed, so its parts are not among the room's own.
    function markDoor(object,data){object.userData=data;interactables.push(object);return object}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const card=key=>({type:'naturalist-card',title:CARDS[key][0],author:CARDS[key][1],action:'READ'});
    function sign(parent,text,sub,w,h,x,y,z){
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle='#22301f';c.fillRect(0,0,W,H);c.strokeStyle='#c9a85a';c.lineWidth=6;c.strokeRect(5,5,W-10,H-10);c.fillStyle='#efe2b8';c.textAlign='center';
        c.font='bold 30px Georgia';c.fillText(text,W/2,sub?48:H/2+11);if(sub){c.font='italic 21px Georgia';c.fillText(sub,W/2,82)}},620,sub?104:70));
      return add(own(new THREE.PlaneGeometry(w,h)),own(new THREE.MeshStandardMaterial({map,emissive:0x2a2418,emissiveIntensity:.35,roughness:.85})),x,y,z,parent);
    }
    // An instanced set of one shape, each placed, scaled and coloured.
    function instances(geometry,material,list,parent){
      const mesh=new THREE.InstancedMesh(own(geometry),own(material),list.length),m=new THREE.Matrix4(),q=new THREE.Quaternion(),v=new THREE.Vector3(),s=new THREE.Vector3(),axis=new THREE.Vector3(0,1,0);
      list.forEach(([x,y,z,sx,sy,sz,turn,color],i)=>{q.setFromAxisAngle(axis,turn||0);v.set(x,y,z);s.set(sx,sy,sz);m.compose(v,q,s);mesh.setMatrixAt(i,m);if(color!=null&&mesh.setColorAt)mesh.setColorAt(i,new THREE.Color(color))});
      mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;own(mesh);parent.add(mesh);return mesh;
    }
    // A little generator so the specimens are the same on every visit.
    const seeded=seed=>()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646};

    // The books for each shelf: those listed, then the new arrivals; a book the library does not hold is left out.
    const shelfBooks=(ids,key,max)=>[...new Set([...ids,...(arrivals[key]||[])])].map(id=>findBook(id)).filter(Boolean).slice(0,max);
    function catalogue(){return {groups:GROUPS.map(group=>({...group,books:shelfBooks(group.ids,group.key,group.max)})),sealed:shelfBooks(SEALED,'sealed',2)}}

    // ---------- the door, in the Medicine Room ----------
    function buildDoor(){
      const g=new THREE.Group();g.name='naturalist-door';g.position.set(DOOR.x,0,DOOR.z);g.rotation.y=DOOR.yaw;scene.add(g);
      const data={type:'naturalist-door',title:'The Naturalist’s Cabinet',author:'Darwin’s study and a cabinet of curiosities: the origin of species, the collectors and the observers.',action:'ENTER'};
      if(!doorKit?.hang(g,{data,mark:markDoor,...DOOR_LOOK,...doorKit.readingRoom?.('THE NATURALIST’S CABINET','Darwin and natural history')}))markDoor(add(new THREE.BoxGeometry(1.9,3.1,.14),new THREE.MeshStandardMaterial({color:DOOR_LOOK.color,roughness:.7}),0,1.55,.08,g),data);
    }

    // ---------- the room ----------
    function buildRoom(){
      root=new THREE.Group();root.name='naturalist-room';const {cx,cz,w,d,h}=ROOM;
      // Sage-green walls above a mahogany dado, a boarded floor and a dark ceiling.
      const wall=own(new THREE.MeshStandardMaterial({color:0x6c7558,roughness:.95})),mahogany=own(new THREE.MeshStandardMaterial({color:0x5a2e1c,roughness:.6,map:MAT.wood?.map||null}));
      box(w,.3,d,MAT.wood,cx,-.15,cz,root);box(w,.25,d,MAT.darkWood,cx,h+.12,cz,root);
      box(w,h,.3,wall,cx,h/2,cz-d/2,root);box(w,h,.3,wall,cx,h/2,cz+d/2,root);box(.3,h,d,wall,cx-w/2,h/2,cz,root);box(.3,h,d,wall,cx+w/2,h/2,cz,root);
      for(const [x,z,sw,sd] of [[cx,cz-d/2+.17,w-.4,.05],[cx,cz+d/2-.17,w-.4,.05],[cx-w/2+.17,cz,.05,d-.4],[cx+w/2-.17,cz,.05,d-.4]]){box(sw,.95,sd,mahogany,x,.47,z,root);box(sw+.02,.06,sd+.03,MAT.darkWood,x,.97,z,root)}
      for(const [x,z,sw,sd] of [[cx,cz-d/2+.2,w-.4,.12],[cx,cz+d/2-.2,w-.4,.12],[cx-w/2+.2,cz,.12,d-.4],[cx+w/2-.2,cz,.12,d-.4]])box(sw,.2,sd,MAT.darkWood,x,h-.12,z,root);
      mark(sign(root,'THE NATURALIST’S CABINET','Darwin and natural history',3.8,.6,cx-1.4,4.75,cz-d/2+.17),card('sign'));
      buildShelves();
      buildDome(cx,cz-.5);
      buildSpecimens(cx+w/2-.5,cz-d/2+2.2);
      buildWindow(cx+4,cz+d/2);
      buildDesk(cx+4,cz+d/2-1.5);
      buildBeetles(cx-.5,cz+d/2-.45);
      buildArmchair(cx-2.6,cz+2.2);
      // A lamp hung over the dome.
      const lamp=new THREE.PointLight(0xffdcaa,8,18,2);lamp.position.set(cx,h-1.4,cz-.5);root.add(lamp);
      add(own(new THREE.CylinderGeometry(.22,.4,.3,16,1,true)),own(new THREE.MeshStandardMaterial({color:0x34503a,emissive:0xffb35c,emissiveIntensity:.9,roughness:.6,side:THREE.DoubleSide})),cx,h-1.2,cz-.5,root);
      add(own(new THREE.CylinderGeometry(.008,.008,1,4)),MAT.brass||MAT.darkWood,cx,h-.55,cz-.5,root);
      // The door back to the Medicine Room.
      const exit={type:'naturalist-exit',title:'Back to the Medicine Room',author:'The Fabrica of Vesalius is just the other side.',action:'RETURN'};
      if(!doorKit?.hang(root,{data:exit,mark,x:cx+w/2-.2,z:DOOR_Z,yaw:-Math.PI/2,label:'THE MEDICINE ROOM',own,...DOOR_LOOK}))mark(box(.16,3.1,1.9,own(new THREE.MeshStandardMaterial({color:DOOR_LOOK.color,roughness:.7})),cx+w/2-.2,1.55,DOOR_Z,root),exit);
      scene.add(root);
    }
    // Two rows of books on each of three walls: the origin on the west, the collectors on the north (short of the
    // specimen cabinet in the corner), the observers on the west half of the south wall (the window has the rest).
    function buildShelves(){
      const {cx,cz,w,d}=ROOM,{groups}=catalogue(),geometry=own(new THREE.BoxGeometry(.72,.96,.13)),ROWS=[1.45,2.65];
      const RUN={west:{along:d-3.4,c:cz},north:{along:w-5.6,c:cx-1.4},south:{along:7.4,c:cx-5.3}};
      for(const group of groups){
        const {along,c}=RUN[group.wall],per=Math.max(1,Math.ceil(group.books.length/2)),gap=Math.min(1.3,(along-.6)/per);
        // Left to right as the reader faces the wall.
        const at=(i,row)=>{const n=row?group.books.length-per:per,col=row?i-per:i,offset=(col-(n-1)/2)*gap;
          if(group.wall==='north')return {x:c+offset,z:cz-d/2+.3,yaw:0};if(group.wall==='west')return {x:cx-w/2+.3,z:c-offset,yaw:Math.PI/2};return {x:c-offset,z:cz+d/2-.3,yaw:Math.PI}};
        group.books.forEach((book,i)=>{const row=i<per?0:1;placeBook(book,{...at(i,row),y:ROWS[row]},geometry,group.key)});
        const info={type:'naturalist-card',title:group.name,author:group.sub+'.',action:'READ'};
        if(group.wall==='west'){const x=cx-w/2+.35;for(const y of ROWS)box(.36,.05,along,MAT.darkWood,x,y-.5,c,root);block(x,c,.7,along+.2);
          const label=sign(root,group.name,group.sub,2.9,.46,cx-w/2+.17,3.62,c);label.rotation.y=Math.PI/2;mark(label,info)}
        else{const z=group.wall==='north'?cz-d/2+.35:cz+d/2-.35;for(const y of ROWS)box(along,.05,.36,MAT.darkWood,c,y-.5,z,root);block(c,z,along+.2,.7);
          const label=sign(root,group.name,group.sub,2.9,.46,c,3.62,group.wall==='north'?cz-d/2+.17:cz+d/2-.17);if(group.wall==='south')label.rotation.y=Math.PI;mark(label,info)}
      }
    }
    // A glass dome of hummingbirds on a round table, perched about a bare branch.
    function buildDome(x,z){
      const g=new THREE.Group();g.position.set(x,0,z);root.add(g);
      const top=add(own(new THREE.CylinderGeometry(.75,.75,.06,28)),MAT.darkWood,0,.8,0,g),stem=add(own(new THREE.CylinderGeometry(.1,.16,.77,12)),MAT.darkWood,0,.39,0,g);
      add(own(new THREE.CylinderGeometry(.4,.44,.04,20)),MAT.darkWood,0,.02,0,g);
      const base=add(own(new THREE.CylinderGeometry(.44,.46,.1,28)),own(new THREE.MeshStandardMaterial({color:0x1d1410,roughness:.4})),0,.88,0,g);
      // A mossy mound and a branch of three twigs.
      const moss=add(own(new THREE.SphereGeometry(.3,16,8,0,Math.PI*2,0,Math.PI/2)),own(new THREE.MeshStandardMaterial({color:0x2e3a1c,roughness:1})),0,.93,0,g);moss.scale.y=.35;
      const bark=own(new THREE.MeshStandardMaterial({color:0x5b4632,roughness:.9}));
      const twigs=[[0,1.18,0,.022,.5,0,0],[.1,1.42,.02,.014,.36,0,-.7],[-.08,1.36,-.03,.014,.32,.2,.8],[.02,1.55,.08,.01,.24,-.6,.3]];
      for(const [tx,ty,tz,r,len,rx,rz] of twigs){const twig=add(own(new THREE.CylinderGeometry(r*.6,r,len,6)),bark,tx,ty,tz,g);twig.rotation.set(rx,0,rz)}
      // Eleven birds in their jewel colours: green, ruby, violet, copper, blue.
      const colors=[0x1f8a4c,0xb3122e,0x3d9a3a,0x6a2fa0,0xc26b1c,0x177a8a,0x2a64c4,0x8fb52a,0xb3122e,0x1f8a4c,0x9a2a7a],rand=seeded(7);
      const birds=colors.map((color,i)=>{const a=i/colors.length*Math.PI*2,r=.12+rand()*.16,y=1.1+rand()*.55;return [Math.cos(a)*r,y,Math.sin(a)*r,1,.8,1.9,a+Math.PI/2,color]});
      instances(new THREE.SphereGeometry(.03,10,8),new THREE.MeshStandardMaterial({color:0xffffff,metalness:.55,roughness:.28}),birds,g);
      // Each a long fine beak ahead and a forked tail behind, along the way it faces.
      const along=([bx,by,bz,,,,turn],k)=>[bx+Math.sin(turn)*k,by,bz+Math.cos(turn)*k];
      instances(new THREE.BoxGeometry(.006,.006,.07),new THREE.MeshStandardMaterial({color:0x151515,roughness:.6}),birds.map(b=>[...along(b,.085),1,1,1,b[6],null]),g);
      instances(new THREE.BoxGeometry(.04,.005,.06),new THREE.MeshStandardMaterial({color:0xffffff,metalness:.4,roughness:.35}),birds.map(b=>[...along(b,-.075),1,1,1,b[6],b[7]]),g);
      const glass=own(new THREE.MeshStandardMaterial({color:0xe8f2ee,transparent:true,opacity:.07,roughness:.05,depthWrite:false}));
      const wallGlass=add(own(new THREE.CylinderGeometry(.42,.42,.6,28,1,true)),glass,0,1.23,0,g),cap=add(own(new THREE.SphereGeometry(.42,28,12,0,Math.PI*2,0,Math.PI/2)),glass,0,1.53,0,g);cap.scale.y=.75;
      for(const part of [top,stem,base,moss,wallGlass,cap])mark(part,card('hummingbirds'));
      block(x,z,1.6,1.6);
    }
    // A tall glazed case against the east wall: shells below, birds' eggs in the middle, butterflies pinned at the top.
    function buildSpecimens(x,z){
      const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=-Math.PI/2;root.add(g);
      const L=3,D=.56,H=2.6,parts=[];
      parts.push(box(L,.7,D,MAT.darkWood,0,.35,0,g),box(L+.06,.06,D+.04,MAT.darkWood,0,H,0,g),box(L,H-.7,.04,own(new THREE.MeshStandardMaterial({color:0x2a3a2a,roughness:.9})),0,.35+H/2,-D/2+.02,g));
      for(const sx of [-1,1])parts.push(box(.05,H-.7,D,MAT.darkWood,sx*(L/2-.025),.35+H/2,0,g));
      for(const y of [1.3,1.9])box(L-.1,.02,D-.08,own(new THREE.MeshStandardMaterial({color:0xcfe0da,transparent:true,opacity:.25,roughness:.1})),0,y,0,g);
      for(const sx of [-.5,0,.5])box(.03,H-.72,.03,MAT.darkWood,sx*L*.98,.35+H/2,D/2,g);
      const rand=seeded(31),shells=[],cones=[],eggs=[],flies=[];
      for(let i=0;i<14;i++){const sx=-1.3+i*.2,c=[0xe8d6b8,0xd9a066,0xf0e6da,0xb8643a,0xe4c4a8][i%5];(i%2?cones:shells).push([sx,.74+(i%2?.06:.04),(rand()-.5)*.2,1,i%2?1:.6,1,rand()*6,c])}
      for(let i=0;i<16;i++){const c=[0x9ec9d6,0xf2ede2,0xc9b18a,0x7fb7a8,0xe8dccb,0xb0c4ce][i%6];eggs.push([-1.3+i*.17,1.36,(rand()-.5)*.18,1,1.3,1,0,c])}
      for(let i=0;i<10;i++){const c=[0x2d6fd0,0xe08a1e,0xf2e04a,0x8a2b2b,0x3aa0a8][i%5];flies.push([-1.25+i*.28,2.2+(i%2)*.18,-D/2+.06,1,1,1,0,c])}
      const pale=()=>new THREE.MeshStandardMaterial({color:0xffffff,roughness:.5});
      instances(new THREE.SphereGeometry(.06,10,8),pale(),shells,g);instances(new THREE.ConeGeometry(.045,.14,10),pale(),cones,g);
      instances(new THREE.SphereGeometry(.04,10,8),pale(),eggs,g);
      // The butterflies: one drawing, tinted for each.
      const wing=own(canvasTexture((c,W,H)=>{c.clearRect(0,0,W,H);c.fillStyle='#ffffff';for(const s of [-1,1]){c.beginPath();c.ellipse(W/2+s*W*.22,H*.36,W*.22,H*.26,s*.5,0,Math.PI*2);c.fill();c.beginPath();c.ellipse(W/2+s*W*.16,H*.7,W*.14,H*.18,-s*.4,0,Math.PI*2);c.fill()}
        c.fillStyle='#222';c.fillRect(W/2-3,H*.18,6,H*.66);for(const s of [-1,1]){c.beginPath();c.arc(W/2+s*W*.3,H*.3,7,0,Math.PI*2);c.fill()}},64,64));
      instances(new THREE.PlaneGeometry(.2,.2),new THREE.MeshStandardMaterial({map:wing,transparent:true,alphaTest:.4,roughness:.7,side:THREE.DoubleSide}),flies,g);
      const glass=own(new THREE.MeshStandardMaterial({color:0xe2eeea,transparent:true,opacity:.06,roughness:.05,depthWrite:false}));
      parts.push(box(L-.08,H-.74,.02,glass,0,.37+H/2,D/2,g));
      for(const part of parts)mark(part,card('specimens'));
      block(x-.05,z,D+.25,L+.2);
    }
    // The south window, looking out at dusk on the Sandwalk: the gravel path, the trees and the pile of flints.
    function buildWindow(x,z){
      const view=own(canvasTexture((c,W,H)=>{const sky=c.createLinearGradient(0,0,0,H*.62);sky.addColorStop(0,'#1d2a4a');sky.addColorStop(.7,'#6a5a6e');sky.addColorStop(1,'#d89a5a');c.fillStyle=sky;c.fillRect(0,0,W,H);
        c.fillStyle='#2a3322';c.fillRect(0,H*.6,W,H*.4);c.fillStyle='#141c12';for(let i=0;i<26;i++){const tx=i*W/24-10,th=H*(.18+((i*37)%11)/40);c.beginPath();c.ellipse(tx,H*.6-th*.5,W*.06,th*.6,0,0,Math.PI*2);c.fill()}
        c.fillStyle='#b8ab8e';c.beginPath();c.moveTo(W*.35,H);c.bezierCurveTo(W*.45,H*.8,W*.75,H*.72,W*.62,H*.6);c.lineTo(W*.66,H*.6);c.bezierCurveTo(W*.85,H*.74,W*.6,H*.85,W*.6,H);c.fill();
        c.fillStyle='#d8d2c4';for(let i=0;i<9;i++){c.beginPath();c.arc(W*.27+(i%3)*9,H*.9-Math.floor(i/3)*7,5,0,Math.PI*2);c.fill()}
        c.fillStyle='#fff6d8';c.beginPath();c.arc(W*.8,H*.18,3,0,Math.PI*2);c.fill()},512,512));
      const pane=add(own(new THREE.PlaneGeometry(2.8,2.6)),own(new THREE.MeshStandardMaterial({map:view,emissive:0xffffff,emissiveMap:view,emissiveIntensity:.55,roughness:.9})),x,2.4,z-.16,root);pane.rotation.y=Math.PI;
      const frame=[box(3.1,.12,.12,MAT.darkWood,x,3.75,z-.2,root),box(3.2,.08,.3,MAT.darkWood,x,1.06,z-.28,root),box(.12,2.8,.12,MAT.darkWood,x-1.5,2.4,z-.2,root),box(.12,2.8,.12,MAT.darkWood,x+1.5,2.4,z-.2,root),
        box(.05,2.6,.05,MAT.darkWood,x,2.4,z-.19,root)];for(const y of [1.75,2.45,3.1])frame.push(box(2.8,.04,.05,MAT.darkWood,x,y,z-.19,root));
      for(const part of [pane,...frame])mark(part,card('sandwalk'));
    }
    // Darwin's writing table under the window, with the microscope, Wallace's letter and, in the drawer, the essay.
    function buildDesk(x,z){
      const {sealed}=catalogue(),g=new THREE.Group();g.position.set(x,0,z);root.add(g);
      const top=box(1.9,.06,.9,MAT.darkWood,0,.78,0,g);for(const sx of [-.88,.88])for(const sz of [-.38,.38])box(.07,.75,.07,MAT.darkWood,sx,.375,sz,g);
      box(1.8,.14,.04,MAT.darkWood,-.45,.68,-.42,g);block(x,z,2.1,1.1);
      // The microscope, brass on a black foot.
      const brass=MAT.brass||own(new THREE.MeshStandardMaterial({color:0xb08a3e,metalness:.7,roughness:.35}));
      const scope=[add(own(new THREE.CylinderGeometry(.07,.09,.03,14)),own(new THREE.MeshStandardMaterial({color:0x151515,roughness:.5})),-.55,.825,.1,g),add(own(new THREE.CylinderGeometry(.012,.012,.2,8)),brass,-.55,.94,.1,g),
        add(own(new THREE.BoxGeometry(.12,.012,.1)),brass,-.55,.9,.1,g),add(own(new THREE.CylinderGeometry(.022,.026,.24,12)),brass,-.55,1.08,.06,g)];scope[3].rotation.x=-.25;
      for(const part of scope)mark(part,card('microscope'));
      // The letter from Ternate, open on the blotter.
      const paper=own(canvasTexture((c,W,H)=>{c.fillStyle='#efe4c8';c.fillRect(0,0,W,H);c.strokeStyle='#5a4a3a';c.lineWidth=1.4;for(let y=26;y<H-14;y+=11){c.beginPath();c.moveTo(14,y);for(let x=14;x<W-14;x+=8)c.lineTo(x+8,y+Math.sin(x*.7+y)*1.4);c.stroke()}
        c.fillStyle='#5a4a3a';c.font='italic 13px Georgia';c.fillText('Ternate',W-80,18)},160,200));
      const letter=add(own(new THREE.PlaneGeometry(.26,.32)),own(new THREE.MeshStandardMaterial({map:paper,roughness:.95})),.15,.812,.05,g);letter.rotation.x=-Math.PI/2;letter.rotation.z=.15;mark(letter,card('ternate'));
      // An oil lamp, glowing with no light of its own.
      add(own(new THREE.CylinderGeometry(.06,.08,.14,12)),brass,.7,.88,-.2,g);add(own(new THREE.SphereGeometry(.07,12,10)),own(new THREE.MeshStandardMaterial({color:0xfff0c8,emissive:0xffc070,emissiveIntensity:1.2,transparent:true,opacity:.85})),.7,1.02,-.2,g);
      // The drawer, on the reader's side (north), and the packet in it.
      const slide=new THREE.Group();slide.position.set(.45,.68,-.42);g.add(slide);
      const front=box(.62,.12,.03,mahogany(),0,0,-.02,slide),knob=add(own(new THREE.SphereGeometry(.018,8,6)),brass,0,0,-.05,slide);box(.58,.02,.4,MAT.darkWood,0,-.05,.2,slide);
      const packet=box(.3,.04,.22,own(new THREE.MeshStandardMaterial({color:0xe2d4b0,roughness:.9})),0,-.02,.2,slide);add(own(new THREE.CylinderGeometry(.025,.025,.012,12)),own(new THREE.MeshStandardMaterial({color:0x8a1a1a,roughness:.5})),0,.004,.2,slide);
      const data={type:'naturalist-drawer',title:'A drawer in the writing table',author:'Shut, but not locked.',action:'OPEN'};for(const part of [front,knob])mark(part,data);
      // The Foundations of the Origin of Species, out on the table once the drawer is opened.
      const small=own(new THREE.BoxGeometry(.24,.34,.05)),inside=sealed.map((book,i)=>{const mesh=add(small,own(bookMaterial(book)),.15+i*.28,.84,-.25,g);mesh.rotation.x=-Math.PI/2+.02;mesh.visible=false;
        mesh.userData={type:'book',book,loaded:false,naturalist:true,shelf:'sealed',home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:g}};return mesh});
      drawer={g,slide,parts:[front,knob],packet,inside,open:0,target:0};
      if(wasFound())openDrawer(true);
      // The writing chair, facing the window: one of the library's seats.
      chair(x,z-1.05,Math.PI,{title:'The chair at the writing table',author:'Sit and read one of the cabinet’s books.'},false);
      mark(top,card('ternate'));
    }
    const mahogany=()=>own(new THREE.MeshStandardMaterial({color:0x5a2e1c,roughness:.6}));
    // A collector's cabinet of shallow drawers, the top one pulled out on its rows of beetles.
    function buildBeetles(x,z){
      const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=Math.PI;root.add(g);const parts=[];
      parts.push(box(1.6,1.2,.6,mahogany(),0,.6,0,g));for(let i=0;i<5;i++)parts.push(box(1.5,.18,.02,MAT.darkWood,0,.18+i*.21,.31,g));
      const tray=box(1.46,.06,.5,MAT.darkWood,0,1.12,.42,g);parts.push(tray);parts.push(box(1.4,.005,.44,own(new THREE.MeshStandardMaterial({color:0xece4d0,roughness:1})),0,1.153,.42,g));
      const rand=seeded(53),colors=[0x1a1a12,0x2a5a2a,0x5a3a14,0x1c3a6a,0x6a1a1a,0x3a4a1a],beetles=[];
      for(let r=0;r<4;r++)for(let k=0;k<8;k++)beetles.push([-.6+k*.17,1.165,.25+r*.11,.9+rand()*.5,.4,1.3+rand()*.6,0,colors[(r*8+k)%colors.length]]);
      instances(new THREE.SphereGeometry(.025,8,6),new THREE.MeshStandardMaterial({color:0xffffff,metalness:.45,roughness:.35}),beetles,g);
      parts.push(box(1.62,.04,.62,MAT.darkWood,0,1.22,0,g));
      for(const part of parts)mark(part,card('beetles'));
      block(x,z,1.7,1.4);
    }
    // Darwin's armchair, with a writing board across its arms.
    function buildArmchair(x,z){
      const g=chair(x,z,-Math.PI/4,{title:CARDS.chair[0],author:CARDS.chair[1]},true);
      box(.9,.025,.34,own(new THREE.MeshStandardMaterial({color:0x9a7a52,roughness:.8})),0,.82,-.18,g);
    }
    function chair(x,z,yaw,info,arms){
      const leather=own(new THREE.MeshStandardMaterial({color:arms?0x2a1c14:0x3e2a1c,roughness:.65})),g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=yaw;root.add(g);
      const seat=box(arms?.78:.62,.12,.66,leather,0,.48,0,g),back=box(arms?.78:.62,arms?.9:.7,.1,leather,0,arms?.98:.9,.3,g);
      for(const lx of [-.27,.27])for(const lz of [-.25,.25])box(.06,.44,.06,MAT.darkWood,lx*(arms?1.25:1),.22,lz,g);
      if(arms)for(const sx of [-.36,.36])box(.08,.24,.6,leather,sx,.66,0,g);
      block(x,z,arms?1:.8,arms?1:.8);
      if(registerSeat){const data=registerSeat([seat,back],g,new THREE.Vector3(0,1.25,.05),yaw,info);
        Object.defineProperty(data,'bookIds',{get:()=>books.map(mesh=>mesh.userData.book.id),configurable:true});ours.push(seat,back)}
      else for(const part of [seat,back])mark(part,{type:'naturalist-card',title:info.title,author:info.author,action:'READ'});
      return g;
    }
    function openDrawer(quiet){
      if(!drawer||drawer.target)return;drawer.target=1;if(quiet)drawer.open=1;
      for(const mesh of drawer.inside){mesh.visible=true;interactables.push(mesh);ours.push(mesh);books.push(mesh)}
      const opened={type:'naturalist-card',title:'The drawer, open',author:'The packet is empty now: its essay of 1844 lies on the table, beside the letter from Ternate that made Darwin finish the book it had become.',action:'READ'};
      for(const part of drawer.parts)part.userData=opened;
    }
    function placeBook(book,spot,geometry,shelf){
      const mesh=add(geometry,own(bookMaterial(book)),spot.x,spot.y,spot.z,root);mesh.rotation.order='YXZ';mesh.rotation.y=spot.yaw;mesh.rotation.x=-.08;
      mesh.userData={type:'book',book,loaded:false,naturalist:true,shelf,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:root}};
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
      activate();move(ROOM.cx+ROOM.w/2-1.4,DOOR_Z,Math.PI/2);playSample?.('doorOpen',.8,1.02);
      showNotice('The Naturalist’s Cabinet: Darwin and the argument he started ahead of you, the collectors on the right, and those who watched one place closely on the left, by the window. In the middle, a dome of hummingbirds; past the window, a garden door.',10);
      analytics?.track('Room Explored',{room:'naturalist-room'});
    }
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('naturalist-'))return false;
      if(data.type==='naturalist-door'){through(data,enter);return true}
      if(data.type==='naturalist-exit'){through(data,()=>{move(DOOR.x+Math.sin(DOOR.yaw)*1.6,DOOR.z+Math.cos(DOOR.yaw)*1.6,DOOR.yaw+Math.PI);playSample?.('doorOpen',.8,1);showNotice('The Medicine Room again.',3)});return true}
      if(data.type==='naturalist-drawer'){
        openDrawer(false);try{storage?.setItem(FOUND_KEY,'1')}catch(e){}playSample?.('doorOpen',.4,1.3);
        showNotice(`In the drawer, a packet, and on it a letter to Emma Darwin, dated 5 July 1844: “${LETTER}” If he died, she was to see the essay published. He lived, and kept it fifteen years.`,14);
        analytics?.track('Secret Found',{secret:'darwin-sketch'});return true;
      }
      if(data.type==='naturalist-card'){showNotice(`${data.title}: ${data.author}`,10);return true}
      return false;
    }

    // ---------- lifecycle ----------
    function activate(){if(!root)buildRoom();lastNeeded=time}
    function unload(){
      // Its lamp is marked freed, so the light budget lets it go.
      if(!root)return;root.removeFromParent();root.traverse(object=>{if(object.isLight)object.userData.freed=true});root=null;drawer=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0;
    }
    function update(t,dt=1/60){
      time=t;const inside=contains(player.pos.x,player.pos.z),near=Math.hypot(player.pos.x-DOOR.x,player.pos.z-DOOR.z)<PRELOAD;
      if(inside||near)activate();
      else if(root&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==root&&b.parent!==drawer?.g))unload();
      if(drawer&&drawer.open!==drawer.target)drawer.open=Math.min(drawer.target,drawer.open+dt*1.5);
      if(drawer)drawer.slide.position.z=-.42-.3*(1-Math.pow(1-drawer.open,3));
    }
    buildDoor();
    return {contains,floorAt,allowed,interact,update,enter,unload,catalogue,door:DOOR,doorZ:DOOR_Z,room:ROOM,groups:GROUPS,sealed:SEALED,letter:LETTER,
      get built(){return !!root},get books(){return books.slice()},get drawerOpen(){return !!drawer?.target},zoneAt:(x,z)=>contains(x,z)?'naturalist-room':null};
  };
})();
