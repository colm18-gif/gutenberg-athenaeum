// The Poe Room: a lamplit parlour of the 1840s behind a door in the Gothic Parlour, where a raven sits on a bust of
// Pallas just above the chamber door. Poe's books are on the shelves, each with a librarian's note, and the room keeps
// a few of his stories about the place: a pendulum swinging from the ceiling, the oval portrait, a letter left in plain
// view in the card rack, and a cask in the corner. Somewhere under the floorboards a heart is beating, louder as the
// reader comes near the loose board; lift it and the second volume of his works is underneath, open at The Tell-Tale
// Heart. The beat is made in the browser (no sound file), and the room is built only when the reader comes near its
// door and freed a little while after they leave, like the library's other rooms behind doors.
(function(){
  'use strict';

  // The shelves: the five volumes of the Raven Edition, then the books Poe published on their own.
  const IDS=[2147,2148,2149,2150,2151,1065,932,1064,51060,32037];
  const RECORDS={2147:['The Works of Edgar Allan Poe — Volume 1','Edgar Allan Poe'],2148:['The Works of Edgar Allan Poe — Volume 2','Edgar Allan Poe'],
    2149:['The Works of Edgar Allan Poe — Volume 3','Edgar Allan Poe'],2150:['The Works of Edgar Allan Poe — Volume 4','Edgar Allan Poe'],2151:['The Works of Edgar Allan Poe — Volume 5','Edgar Allan Poe'],
    1065:['The Raven','Edgar Allan Poe'],932:['The Fall of the House of Usher','Edgar Allan Poe'],1064:['The Masque of the Red Death','Edgar Allan Poe'],
    51060:['The Narrative of Arthur Gordon Pym of Nantucket','Edgar Allan Poe'],32037:['Eureka: A Prose Poem','Edgar Allan Poe']};
  // Notes for the books that have none elsewhere in the library (game.js keeps any it already has).
  const NOTES={
    1065:'A grieving student, a midnight visitor tapping at the chamber door, and a single word: nevermore. Poe’s 1845 poem made him famous overnight, though it earned him only a few dollars. Read it aloud, quietly, near midnight.',
    51060:'Poe’s only finished novel, published in 1838: a young stowaway goes to sea and meets mutiny, shipwreck and famine on the way towards the South Pole. It breaks off in a curtain of white mist, with a note claiming the last chapters were lost. Jules Verne found that unbearable and wrote a sequel, An Antarctic Mystery.',
    32037:'Poe’s last major work, published in 1848, tries to explain the origin and fate of the universe. It imagines the cosmos expanding from a single particle and collapsing back again. Poe thought it his masterpiece; scientists still find it uncanny.'};
  // The book under the floorboards, and the story it opens at.
  const HIDDEN={id:2148,story:'THE TELL-TALE HEART'};
  const CARDS={
    pendulum:['The Pit and the Pendulum','A prisoner of the Inquisition in Toledo wakes strapped down beneath a crescent blade that sinks a little with every swing. Rats, a closing cell and the French army arriving just in time. It is in the second volume, on the shelf.'],
    portrait:['The Oval Portrait','A painter works for weeks on a portrait of his young wife and never notices that the colour he puts on the canvas is leaving her cheeks. It is one of Poe’s shortest tales, in the first volume on the shelf.'],
    letter:['The Purloined Letter','The Paris police take a minister’s rooms apart looking for a stolen letter. Dupin finds it at once, crumpled in a card rack in plain view, turned inside out and addressed again. It is in the second volume, on the shelf.'],
    cask:['The Cask of Amontillado','During the carnival Montresor leads Fortunato, who prides himself on his wine, down into the family catacombs to taste a rare Amontillado. Only one of them comes back up. It is in the second volume, on the shelf.'],
    raven:['The raven on the bust of Pallas','Quoth the Raven, “Nevermore.”'],
    sign:['The Poe Room','Edgar Allan Poe, 1809–1849: the detective story, the tale of terror and The Raven, all from one small writing desk in Philadelphia, New York and Baltimore. Listen to the floorboards.']};
  const CONFESSION='“Villains!” I shrieked, “dissemble no more! I admit the deed! — tear up the planks! — here, here! — it is the beating of his hideous heart!” (The Tell-Tale Heart)';

  window.createPoeRoom=function(options){
    const {THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,showNotice,playSample,sound=null,move,analytics,isHolding=()=>false,isReading=()=>false,prepareReturn=null,registerSeat=null,doorKit=null}=options;
    // The door in the Gothic Parlour's west wall, facing into the parlour.
    const DOOR={x:85.25,z:10.6,yaw:Math.PI/2};
    const ROOM={cx:-330,cz:-140,w:14,d:12,h:5.4};
    const BOARD={x:ROOM.cx+1.55,z:ROOM.cz+.4};
    const PRELOAD=8,KEEP=25;
    // Near-black red, matt, so the Gothic Parlour's violet light does not turn it lilac.
    const DOOR_LOOK={style:'painted',color:new THREE.MeshStandardMaterial({color:0x1c0b0d,roughness:.88}),fanColor:0x9a6a3a,width:1.9,height:3.1};
    const through=(data,go)=>doorKit&&data.kit?doorKit.pass(data.kit,data,go):go();
    let doorGroup=null,root=null,time=0,lastNeeded=-1e9,lastBeat=-9,pendulum=null,board=null,hidden=null,nextBeat=0,insideSince=null,confessed=false,lifted=false;
    const owned=[],ours=[],books=[],blockers=[];
    const own=thing=>{owned.push(thing);return thing};
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    // The door and its raven in the Gothic Parlour stay when the room is freed, so their parts are not among the room's own.
    function markDoor(object,data){object.userData=data;interactables.push(object);return object}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const card=key=>({type:'poe-card',title:CARDS[key][0],author:CARDS[key][1],action:'READ'});
    function plaque(text,sub,w,h){
      return canvasTexture((c,W,H)=>{c.fillStyle='#1c0e0e';c.fillRect(0,0,W,H);c.strokeStyle='#b8925a';c.lineWidth=5;c.strokeRect(6,6,W-12,H-12);c.textAlign='center';c.fillStyle='#e8d2a6';
        c.font='bold 34px Georgia';c.fillText(text,W/2,sub?50:H/2+12);if(sub){c.font='italic 22px Georgia';c.fillText(sub,W/2,86)}},w,h);
    }

    // A raven on a bust of Pallas, on a small shelf: the same figure over the door on both sides.
    function raven(parent,x,y,z,yaw,{keep=own,marker=mark,data=card('raven')}={}){
      const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=yaw;parent.add(g);
      const marble=keep(new THREE.MeshStandardMaterial({color:0xd9d2c4,roughness:.55})),black=keep(new THREE.MeshStandardMaterial({color:0x0c0b10,roughness:.45,metalness:.1}));
      const part=(geometry,material,px,py,pz)=>add(keep(geometry),material,px,py,pz,g);
      part(new THREE.BoxGeometry(.7,.06,.34),MAT.darkWood,0,0,.1);// the shelf
      part(new THREE.BoxGeometry(.3,.12,.26),marble,0,.09,.1);part(new THREE.CylinderGeometry(.13,.16,.14,12),marble,0,.22,.1);// the base and shoulders
      part(new THREE.CylinderGeometry(.05,.07,.1,10),marble,0,.33,.1);const head=part(new THREE.SphereGeometry(.11,14,10),marble,0,.45,.12);head.scale.set(.9,1.1,1);
      const helm=part(new THREE.SphereGeometry(.12,14,8,0,Math.PI*2,0,Math.PI/2),marble,0,.49,.11);helm.scale.set(1,.8,1.1);// Athena's helmet
      const body=part(new THREE.SphereGeometry(.1,12,8),black,0,.66,.1);body.scale.set(.9,.8,1.5);
      part(new THREE.SphereGeometry(.058,10,8),black,0,.75,.24);const beak=part(new THREE.ConeGeometry(.024,.1,8),black,0,.74,.33);beak.rotation.x=Math.PI/2;
      const tail=part(new THREE.BoxGeometry(.1,.02,.2),black,0,.62,-.1);tail.rotation.x=-.4;
      for(const s of [-1,1]){const wing=part(new THREE.SphereGeometry(.08,10,6),black,s*.07,.67,.08);wing.scale.set(.35,.7,1.5)}
      const eye=keep(new THREE.MeshStandardMaterial({color:0x2a0808,emissive:0xff7a2a,emissiveIntensity:.8}));for(const s of [-1,1])part(new THREE.SphereGeometry(.011,6,4),eye,s*.04,.77,.28);
      marker(body,data);marker(head,data);return g;
    }

    // ---------- the door, in the Gothic Parlour ----------
    function buildDoor(){
      const g=doorGroup=new THREE.Group();g.name='poe-door';g.position.set(DOOR.x,0,DOOR.z);g.rotation.y=DOOR.yaw;scene.add(g);
      const data={type:'poe-door',title:'A chamber door',author:'Something is perched above it, quite still.',action:'KNOCK'};
      if(!doorKit?.hang(g,{data,mark:markDoor,...DOOR_LOOK}))markDoor(add(new THREE.BoxGeometry(1.9,3.1,.14),DOOR_LOOK.color,0,1.55,.08,g),data);
      raven(g,0,3.95,.06,0,{keep:thing=>thing,marker:markDoor,data}).scale.setScalar(1.6);
    }

    // ---------- the room ----------
    function buildRoom(){
      root=new THREE.Group();root.name='poe-room';const {cx,cz,w,d,h}=ROOM;
      const wall=own(new THREE.MeshStandardMaterial({color:0x3a1718,roughness:.9})),ceiling=own(new THREE.MeshStandardMaterial({color:0x1a1212,roughness:1}));
      box(w,.3,d,MAT.darkWood,cx,-.17,cz,root);box(w,.25,d,ceiling,cx,h+.12,cz,root);
      box(w,h,.3,wall,cx,h/2,cz-d/2,root);box(w,h,.3,wall,cx,h/2,cz+d/2,root);box(.3,h,d,wall,cx-w/2,h/2,cz,root);box(.3,h,d,wall,cx+w/2,h/2,cz,root);
      for(const [x,z,sw,sd] of [[cx,cz-d/2+.17,w-.4,.05],[cx,cz+d/2-.17,w-.4,.05],[cx-w/2+.17,cz,.05,d-.4],[cx+w/2-.17,cz,.05,d-.4]]){box(sw,1.05,sd,MAT.darkWood,x,.52,z,root);box(sw,.06,sd+.04,MAT.darkWood,x,1.07,z,root)}
      floorboards();
      // The shelves on the north wall, under the room's sign.
      const bw=5.8,nz=cz-d/2+.3,geometry=own(new THREE.BoxGeometry(.72,.96,.13));box(bw+.3,2.9,.08,MAT.darkWood,cx,1.95,nz-.1,root);box(bw+.5,.12,.5,MAT.darkWood,cx,3.45,nz+.05,root);
      for(const y of [1.02,2.32])box(bw+.2,.05,.34,MAT.darkWood,cx,y,nz+.05,root);block(cx,nz+.2,bw+.6,.8);
      IDS.map(id=>findBook(id,{id,title:RECORDS[id][0],author:RECORDS[id][1]})).filter(Boolean).forEach((book,i)=>{
        const mesh=add(geometry,own(bookMaterial(book)),cx-2.4+(i%5)*1.2,i<5?2.82:1.52,nz+.06,root);mesh.rotation.x=-.08;
        mesh.userData={type:'book',book,loaded:false,poe:true,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:root}};interactables.push(mesh);ours.push(mesh);books.push(mesh)});
      const sign=add(own(new THREE.PlaneGeometry(4.2,.6)),own(new THREE.MeshStandardMaterial({map:own(plaque('THE POE ROOM','Quoth the Raven, “Nevermore.”',840,120)),emissive:0x4a2a14,emissiveIntensity:.3,roughness:.85})),cx,4.02,cz-d/2+.17,root);mark(sign,card('sign'));
      // The writing desk and its oil lamp, the room's own light, and a velvet armchair that is one of the library's seats.
      const dx=cx-3.6,dz=cz+.6;box(1.8,.07,.9,MAT.darkWood,dx,.8,dz,root);for(const [px,pz] of [[-.8,-.38],[.8,-.38],[-.8,.38],[.8,.38]])box(.07,.78,.07,MAT.darkWood,dx+px,.39,dz+pz,root);block(dx,dz,2,1.1);
      const glass=own(new THREE.MeshStandardMaterial({color:0xffd9a0,emissive:0xffa04a,emissiveIntensity:1.3,roughness:.3,transparent:true,opacity:.9}));
      add(own(new THREE.CylinderGeometry(.09,.12,.12,12)),MAT.brass,dx+.55,.9,dz-.15,root);add(own(new THREE.CylinderGeometry(.07,.1,.28,12)),glass,dx+.55,1.1,dz-.15,root);
      const paper=own(new THREE.MeshStandardMaterial({color:0xe6dcc0,roughness:.95}));const sheet=box(.42,.004,.3,paper,dx-.2,.84,dz,root);sheet.rotation.y=.2;
      const quill=add(own(new THREE.ConeGeometry(.02,.34,5)),own(new THREE.MeshStandardMaterial({color:0xf2efe6,roughness:.8})),dx+.1,.9,dz+.1,root);quill.rotation.set(.3,0,1.2);
      const lamp=new THREE.PointLight(0xffb870,5.5,13,2);lamp.position.set(dx+.55,1.5,dz-.1);root.add(lamp);
      const fill=new THREE.PointLight(0xc88a6a,2.2,14,2);fill.position.set(cx+2,h-.5,cz+1);root.add(fill);
      const velvet=own(new THREE.MeshStandardMaterial({color:0x3e1d4a,roughness:.9}));const chair=new THREE.Group();chair.position.set(dx,0,dz+1.3);chair.rotation.y=Math.PI;root.add(chair);
      const seat=box(.8,.4,.75,velvet,0,.4,0,chair),back=box(.8,.9,.16,velvet,0,.95,.34,chair);for(const s of [-.36,.36])box(.1,.3,.75,velvet,s,.72,0,chair);block(dx,dz+1.3,.95,.95);
      if(registerSeat){const data=registerSeat([seat,back],chair,new THREE.Vector3(0,1.25,.1),Math.PI,{title:'A velvet armchair',author:'Violet velvet, with the lamplight gloating o’er it. Sit and read one of Poe’s books.'});
        Object.defineProperty(data,'bookIds',{get:()=>books.map(mesh=>mesh.userData.book.id),configurable:true});ours.push(seat,back)}
      // The pendulum, swinging slowly from the ceiling well above the reader's head.
      const pivot=new THREE.Group();pivot.position.set(cx+.2,h,cz-1.6);root.add(pivot);const steel=own(new THREE.MeshStandardMaterial({color:0x8d8f94,metalness:.8,roughness:.35}));
      add(own(new THREE.CylinderGeometry(.015,.015,1.9,6)),steel,0,-.95,0,pivot);
      const blade=add(own(new THREE.CircleGeometry(.42,20,Math.PI,Math.PI)),own(new THREE.MeshStandardMaterial({color:0xb8bcc4,metalness:.9,roughness:.25,side:THREE.DoubleSide})),0,-1.9,0,pivot);mark(blade,card('pendulum'));
      pendulum=pivot;
      // The oval portrait on the east wall.
      const portrait=own(canvasTexture((c,W,H)=>{c.clearRect(0,0,W,H);c.save();c.beginPath();c.ellipse(W/2,H/2,W/2-6,H/2-6,0,0,Math.PI*2);c.clip();
        const bg=c.createRadialGradient(W/2,H*.42,20,W/2,H/2,W*.6);bg.addColorStop(0,'#5a4636');bg.addColorStop(1,'#140d0a');c.fillStyle=bg;c.fillRect(0,0,W,H);
        c.fillStyle='#231612';c.beginPath();c.ellipse(W/2,H*.4,W*.19,H*.2,0,0,Math.PI*2);c.fill();// hair
        c.fillStyle='#d8c0a4';c.beginPath();c.ellipse(W/2,H*.42,W*.13,H*.15,0,0,Math.PI*2);c.fill();// face
        c.fillStyle='#e9dccb';c.beginPath();c.moveTo(W*.25,H);c.quadraticCurveTo(W*.3,H*.62,W/2,H*.6);c.quadraticCurveTo(W*.7,H*.62,W*.75,H);c.fill();// shoulders
        c.fillStyle='#2b1a14';for(const s of [-1,1]){c.beginPath();c.ellipse(W/2+s*W*.05,H*.41,W*.018,H*.01,0,0,Math.PI*2);c.fill()}c.restore();
        c.strokeStyle='#b8924a';c.lineWidth=14;c.beginPath();c.ellipse(W/2,H/2,W/2-8,H/2-8,0,0,Math.PI*2);c.stroke();c.strokeStyle='#6e5224';c.lineWidth=3;c.beginPath();c.ellipse(W/2,H/2,W/2-16,H/2-16,0,0,Math.PI*2);c.stroke()},256,340));
      const oval=add(own(new THREE.PlaneGeometry(1,1.33)),own(new THREE.MeshStandardMaterial({map:portrait,transparent:true,alphaTest:.3,roughness:.8})),cx+w/2-.17,2.5,cz-1.8,root);oval.rotation.y=-Math.PI/2;mark(oval,card('portrait'));
      // The card rack by the door on the west wall, with one soiled, crumpled letter in plain view.
      const rx=cx-w/2+.2,rz=cz+3.4,walnut=own(new THREE.MeshStandardMaterial({color:0x3a2416,roughness:.8}));const rack=box(.04,.5,.62,walnut,rx,1.85,rz,root);mark(rack,card('letter'));
      const ribbon=own(new THREE.MeshStandardMaterial({color:0x5a1a22,roughness:.8}));for(const y of [1.7,1.95])box(.05,.03,.64,ribbon,rx+.02,y,rz,root);
      const letter=add(own(new THREE.PlaneGeometry(.3,.2)),own(new THREE.MeshStandardMaterial({map:own(canvasTexture((c,W,H)=>{c.fillStyle='#d7c9a4';c.fillRect(0,0,W,H);c.fillStyle='#7a2a1e';c.beginPath();c.arc(W*.78,H*.3,9,0,Math.PI*2);c.fill();c.strokeStyle='#4a3a2a';c.lineWidth=2;for(const y of [H*.55,H*.7])c.strokeRect(W*.2,y,W*.45,.5);c.strokeStyle='#b8a888';c.lineWidth=1.5;c.beginPath();c.moveTo(0,H*.4);c.lineTo(W,H*.6);c.stroke()},120,80)),roughness:.95,side:THREE.DoubleSide})),rx+.04,1.82,rz+.05,root);
      letter.rotation.set(0,Math.PI/2,.12);mark(letter,card('letter'));
      // The cask in the south-west corner.
      const kx=cx-w/2+.8,kz=cz+d/2-.8,oak=own(new THREE.MeshStandardMaterial({color:0x5a3a20,roughness:.85})),hoop=own(new THREE.MeshStandardMaterial({color:0x2c2a28,metalness:.6,roughness:.5}));
      const cask=add(own(new THREE.CylinderGeometry(.34,.34,.86,16)),oak,kx,.62,kz,root);cask.rotation.z=Math.PI/2;mark(cask,card('cask'));
      for(const s of [-.3,.3]){const band=add(own(new THREE.CylinderGeometry(.352,.352,.05,16)),hoop,kx+s,.62,kz,root);band.rotation.z=Math.PI/2}
      for(const s of [-.3,.3])box(.1,.3,.7,MAT.darkWood,kx+s,.15,kz,root);block(kx,kz,1,.9);
      const stencil=add(own(new THREE.PlaneGeometry(.5,.18)),own(new THREE.MeshStandardMaterial({map:own(canvasTexture((c,W,H)=>{c.fillStyle='#5a3a20';c.fillRect(0,0,W,H);c.fillStyle='#e8d8b0';c.textAlign='center';c.font='bold 28px Georgia';c.fillText('AMONTILLADO',W/2,H*.68)},256,64)),roughness:.9})),kx,.62,kz-.352,root);stencil.rotation.y=Math.PI;
      // The raven over the chamber door, inside, and the door back to the Gothic Parlour.
      const exit={type:'poe-exit',title:'The chamber door',author:'Back to the Gothic Parlour.',action:'RETURN'};
      if(!doorKit?.hang(root,{data:exit,mark,x:cx,z:cz+d/2-.2,yaw:Math.PI,label:'THE GOTHIC PARLOUR',own,...DOOR_LOOK}))mark(box(1.9,3.1,.16,DOOR_LOOK.color,cx,1.55,cz+d/2-.2,root),exit);
      raven(root,cx,3.95,cz+d/2-.26,Math.PI).scale.setScalar(1.6);
      scene.add(root);
    }

    // The floor: boards laid north to south in one instanced mesh, staggered, with the one loose board left out.
    function floorboards(){
      const {cx,cz,w,d}=ROOM,width=.28,cols=Math.floor((w-.4)/width),x0=cx-(cols-1)*width/2,z0=cz-d/2+.2,z1=cz+d/2-.2,pieces=[];
      for(let i=0;i<cols;i++){const x=x0+i*width,cuts=[z0];for(let z=z0+.6+(i*1.37)%2.4;z<z1-.4;z+=2.4)cuts.push(z);cuts.push(z1);
        const loose=Math.abs(x-BOARD.x)<width/2;
        for(let k=0;k<cuts.length-1;k++){let a=cuts[k],b=cuts[k+1];if(loose&&a<BOARD.z+.7&&b>BOARD.z-.7){if(BOARD.z-.7-a>.2)pieces.push([x,a,BOARD.z-.7]);if(b-(BOARD.z+.7)>.2)pieces.push([x,BOARD.z+.7,b]);continue}pieces.push([x,a,b])}}
      const planks=own(new THREE.InstancedMesh(own(new THREE.BoxGeometry(width-.012,.04,1)),own(new THREE.MeshStandardMaterial({color:0x5c3b24,roughness:.78})),pieces.length));
      const dummy=new THREE.Object3D(),shade=new THREE.Color();
      pieces.forEach(([x,a,b],i)=>{dummy.position.set(x,.02,(a+b)/2);dummy.scale.set(1,1,b-a-.01);dummy.updateMatrix();planks.setMatrixAt(i,dummy.matrix);planks.setColorAt(i,shade.setHSL(.075,.42,.2+((i*37)%11)/110))});
      root.add(planks);
      // The hollow under the loose board, the board itself on a hinge at its north end, and what is hidden there.
      add(own(new THREE.PlaneGeometry(width-.02,1.38)),own(new THREE.MeshBasicMaterial({color:0x050303})),BOARD.x,.003,BOARD.z,root).rotation.x=-Math.PI/2;
      const hinge=new THREE.Group();hinge.position.set(BOARD.x,.04,BOARD.z-.69);root.add(hinge);
      const plank=add(own(new THREE.BoxGeometry(width-.012,.04,1.38)),own(new THREE.MeshStandardMaterial({color:new THREE.Color(0x5c3b24).multiply(new THREE.Color().setHSL(.075,.42,.31)),roughness:.78})),0,-.02,.69,hinge);
      mark(plank,{type:'poe-board',title:'A loose floorboard',author:'It sits a little proud of the others, and the sound seems to come from under it.',action:'LIFT'});
      board={hinge,plank,open:0};lifted=false;
      const book=findBook(HIDDEN.id,{id:HIDDEN.id,title:RECORDS[HIDDEN.id][0],author:RECORDS[HIDDEN.id][1]});
      if(book){const mesh=add(own(new THREE.BoxGeometry(.2,.03,.28)),own(bookMaterial(book)),BOARD.x,.018,BOARD.z,root);mesh.rotation.y=.1;mesh.visible=false;
        mesh.userData={type:'book',book,loaded:false,poe:true,story:HIDDEN.story,underBoard:true,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:root}};hidden=mesh}
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
      activate();move(ROOM.cx,ROOM.cz+ROOM.d/2-1.4,0);playSample?.('doorOpen',.7,.86);insideSince=time;
      showNotice('The Poe Room. Lamplight, a writing desk and Poe’s books on the shelves. Listen: something under the floor is keeping time.',9);
      analytics?.track('Room Explored',{room:'poe-room'});
    }
    function liftBoard(){
      if(!board||lifted)return;lifted=true;board.plank.userData.action='';
      if(hidden){hidden.visible=true;interactables.push(hidden);ours.push(hidden);books.push(hidden)}
      playSample?.('doorOpen',.5,1.4);showNotice('Under the board: the second volume of Poe’s works, open at The Tell-Tale Heart. The beating is coming from the book.',9);
      analytics?.track('Secret Found',{secret:'poe-tell-tale-heart'});
    }
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('poe-'))return false;
      if(data.type==='poe-door'){showNotice('Quoth the Raven, “Nevermore.” The chamber door swings open all the same.',4);through(data,enter);return true}
      if(data.type==='poe-exit'){through(data,()=>{prepareReturn?.();move(DOOR.x+Math.sin(DOOR.yaw)*1.9,DOOR.z+Math.cos(DOOR.yaw)*1.9,DOOR.yaw+Math.PI);playSample?.('doorOpen',.7,1);showNotice('The Gothic Parlour again. The raven has not moved.',3)});return true}
      if(data.type==='poe-board'){if(lifted)showNotice(hidden&&hidden.parent===root?'The book is still down there, beating.':'Only the hollow where the book was hidden. The house is quiet now.',4);else liftBoard();return true}
      if(data.type==='poe-card'){showNotice(`${data.title}: ${data.author}`,9);return true}
      return false;
    }

    // The heart under the floor: a low double beat, quicker and louder the nearer the reader comes to the board.
    function heartbeat(t){
      // It stops once the book under the board has been taken up.
      if(!sound||isReading()||(hidden&&lifted&&hidden.parent!==root))return;const dist=Math.hypot(player.pos.x-BOARD.x,player.pos.z-BOARD.z),near=1-Math.min(1,dist/9);
      if(t<nextBeat)return;lastBeat=t;nextBeat=t+1.15-near*.55;const vol=.012+near*near*.11;
      sound(58,.2,'sine',vol);setTimeout(()=>sound(50,.18,'sine',vol*.7),170);
    }

    // ---------- lifecycle ----------
    function activate(){if(!root)buildRoom();lastNeeded=time}
    function unload(){
      if(!root)return;root.removeFromParent();root=null;pendulum=null;board=null;hidden=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0;insideSince=null;confessed=false;lifted=false;
    }
    function update(t,dt=0,reduced=false){
      time=t;const inside=contains(player.pos.x,player.pos.z),near=Math.hypot(player.pos.x-DOOR.x,player.pos.z-DOOR.z)<PRELOAD;
      // The door is drawn only for a reader in or near the Gothic Parlour; it stands in its wall, and nowhere else can see it.
      if(doorGroup)doorGroup.visible=Math.hypot(player.pos.x-DOOR.x,player.pos.z-DOOR.z)<16;
      if(inside||near)activate();
      else if(root&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==root))unload();
      if(!root)return;
      if(inside){if(insideSince===null)insideSince=t;heartbeat(t);
        // A reader who lingers without lifting the board hears the narrator give himself away.
        if(!lifted&&!confessed&&t-insideSince>45){confessed=true;showNotice(CONFESSION,10)}}
      else insideSince=null;
      if(pendulum&&!reduced)pendulum.rotation.z=Math.sin(t*1.25)*.55;
      if(board){const target=lifted?1:0;board.open+=(target-board.open)*Math.min(1,dt*4);board.hinge.rotation.x=-board.open*1.25}
      // The book under the board swells a little with each beat, until it is taken up.
      if(hidden&&hidden.visible&&hidden.parent===root&&!reduced){const since=t-lastBeat;hidden.scale.setScalar(1+(since<.4?.07*Math.sin(since/.4*Math.PI):0))}
    }
    buildDoor();
    return {contains,floorAt,allowed,interact,update,enter,unload,notes:NOTES,ids:IDS,hidden:HIDDEN,door:DOOR,room:ROOM,board:BOARD,get built(){return !!root},get lifted(){return lifted},get books(){return books.slice()},zoneAt:(x,z)=>contains(x,z)?'poe-room':null};
  };
})();
