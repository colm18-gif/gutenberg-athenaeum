// The Long Corridor: a panelled corridor behind a walnut door in the Grand Hall's east wall (x 18.72, z -24.25, between the
// Night Conservatory's stained-glass door and The Long Road East), with Miss Havisham's stopped clock hung over the door.
// The hall's own walls are full, so rooms that come after it open off this corridor instead: its bays are hung with doors
// as rooms are built (and its east wall's third bay with Boullée's drawing, the way into boullee-library.js; Emily Dickinson's door, dickinson-room.js, in the west wall's fourth bay; the Indian room's, india-room.js, in its fifth; the Library of Celsus's, celsus-room.js, in the east wall's fifth; Scrooge's chambers', scrooge-room.js, in the east wall's second; and the shelf of ships in bottles, ships-in-bottles.js, in the east wall's fourth, each bottle opening on an island). The first is the Gastronomic Athenaeum's (food-history-wing.js, handed `corridor`), whose door stood
// squeezed between the Horologist's and the Kipling case on the west wall until 14 November 2026. The empty bays are plain
// panelling, not doors that open on nothing. Like the other rooms behind doors it is built as the reader comes near and
// freed ~25 s after they leave; the hall side of its door stays. Two lamps of its own, marked freed with the room.
(function(){
  'use strict';
  window.createLongCorridor=function(options){
    const {THREE,scene,MAT,player,interactables,canvasTexture,showNotice,playSample,move,analytics,doorKit=null}=options;
    const DOOR={x:18.72,z:-24.25,yaw:-Math.PI/2};
    const ROOM={cx:1700,cz:0,w:5,d:24,h:5.2};
    // Six bays a side, four metres each, between pilasters; bay 0 is by the door from the hall, bay 5 at the far (north) end.
    const BAY=4,BAYS=6,bayZ=k=>ROOM.cz+ROOM.d/2-BAY/2-k*BAY;
    // The Gastronomic Athenaeum's door: in the west wall's second bay, ahead and to the left of a reader coming in.
    const WALL=.3,FOOD_DOOR={x:ROOM.cx-ROOM.w/2+WALL/2+.02,z:bayZ(1),yaw:Math.PI/2,bay:1,side:'west'};
    // Emily Dickinson's room (dickinson-room.js): the west wall's fourth bay.
    const DICKINSON_DOOR={x:ROOM.cx-ROOM.w/2+WALL/2+.02,z:bayZ(3),yaw:Math.PI/2,bay:3,side:'west'};
    // The east wall's third bay is kept for a picture: Boullée's drawing of the library that was never built.
    const PICTURE_BAY={side:'east',bay:2};
    // The Library of Celsus (celsus-room.js): the east wall's fifth bay, opposite nothing in particular.
    const CELSUS_DOOR={x:ROOM.cx+ROOM.w/2-WALL/2-.02,z:bayZ(4),yaw:-Math.PI/2,bay:4,side:'east'};
    // Scrooge's chambers (scrooge-room.js): the east wall's second bay, opposite the Gastronomic Athenaeum.
    const SCROOGE_DOOR={x:ROOM.cx+ROOM.w/2-WALL/2-.02,z:bayZ(1),yaw:-Math.PI/2,bay:1,side:'east'};
    // The east wall's fourth bay holds the shelf of ships in bottles (ships-in-bottles.js), between Boullée's drawing and Celsus.
    const BOTTLE_BAY={side:'east',bay:3};
    // The Indian room (india-room.js): the west wall's fifth bay.
    const INDIA_DOOR={x:ROOM.cx-ROOM.w/2+WALL/2+.02,z:bayZ(4),yaw:Math.PI/2,bay:4,side:'west'};
    // The quarters' doors (passages.js): Britain and Ireland in the east wall's sixth bay, at the far end; the Americas in
    // the west wall's third, beside Emily Dickinson's door. Each opens on a hall with a door into each of its rooms.
    const BRITAIN_DOOR={x:ROOM.cx+ROOM.w/2-WALL/2-.02,z:bayZ(5),yaw:-Math.PI/2,bay:5,side:'east'};
    const AMERICAS_DOOR={x:ROOM.cx-ROOM.w/2+WALL/2+.02,z:bayZ(2),yaw:Math.PI/2,bay:2,side:'west'};
    // The quarters' names, a gilt board over each bay that belongs to one: two quarters have halls (above), and two are
    // gathered here in the corridor already (Boullée's drawing and Celsus's door; the shelf of ships in bottles).
    const QUARTER_SIGNS=[
      {side:'east',bay:5,name:'BRITAIN & IRELAND',text:'The quarter of Britain and Ireland: through this door, a hall with doors to the Irish Room, the Burns Room, the Austen Room and Scrooge’s chambers.'},
      {side:'east',bay:1,name:'BRITAIN & IRELAND',text:'Scrooge’s chambers belong to the quarter of Britain and Ireland, whose hall is through the door at the far end of this wall.'},
      {side:'west',bay:2,name:'THE AMERICAS',text:'The quarter of the Americas: through this door, a hall with doors to Emily Dickinson’s room, Walden Pond, the Canadian Room and the Poe Room.'},
      {side:'west',bay:3,name:'THE AMERICAS',text:'Emily Dickinson’s room belongs to the quarter of the Americas, whose hall is through the door beside it.'},
      {side:'east',bay:2,name:'OLD LIBRARIES',text:'The quarter of old libraries: Boullée’s drawing of the library he designed for the King in 1785 and never built, and two bays along, the Library of Celsus at Ephesus. The Restricted Catalogue, in the east wing, is the third.'},
      {side:'east',bay:4,name:'OLD LIBRARIES',text:'The quarter of old libraries: the Library of Celsus at Ephesus, and two bays back, Boullée’s library that was never built. The Restricted Catalogue, in the east wing, is the third.'},
      {side:'east',bay:3,name:'ISLANDS & SEAS',text:'The quarter of islands and seas: each bottle on this shelf sails for a small island. The library’s other islands and seas keep their own ways in: Crusoe’s island by the boat from the Boathouse, Captain Nemo’s salon through the model Nautilus in the Extraordinary Voyages, the Antipodes through the great globe in the Grand Hall, and the polar hut by ship from the New Zealand Room.'}
    ];
    const PRELOAD=7,KEEP=25;
    const LOOK={style:'walnut',width:1.9,height:3.1};
    const through=(data,go)=>doorKit&&data.kit?doorKit.pass(data.kit,data,go):go();
    let root=null,time=0,lastNeeded=-1e9;
    const owned=[],ours=[],lights=[];
    const own=thing=>{owned.push(thing);return thing};
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    // The door in the hall stays when the corridor is freed, so its parts are not among the corridor's own.
    function markDoor(object,data){object.userData=data;interactables.push(object);return object}

    // ---------- the door, in the Grand Hall's east wall ----------
    function buildDoor(){
      const g=new THREE.Group();g.name='long-corridor-door';g.position.set(DOOR.x,0,DOOR.z);g.rotation.y=DOOR.yaw;scene.add(g);
      const data={type:'corridor-door',title:'The Long Corridor',author:'A panelled corridor, and the library’s newer rooms along it: the Gastronomic Athenaeum, Scrooge’s chambers, Emily Dickinson’s room, the Indian room, the Library of Celsus, Boullée’s library that was never built, a shelf of ships in bottles bound for six small islands, and the doors to two quarters of the library, Britain and Ireland and the Americas.',action:'ENTER'};
      if(!doorKit?.hang(g,{data,mark:markDoor,...LOOK,...doorKit.readingRoom?.('THE LONG\nCORRIDOR','Rooms, a lost library and islands')}))
        markDoor(add(new THREE.BoxGeometry(1.9,3.1,.14),MAT.darkWood,0,1.55,.08,g),data);
    }

    // ---------- the corridor ----------
    function buildRoom(){
      root=new THREE.Group();root.name='long-corridor';
      const {cx,cz,w,d,h}=ROOM,x0=cx-w/2,x1=cx+w/2,z0=cz-d/2,z1=cz+d/2;
      const plaster=own(new THREE.MeshStandardMaterial({color:0x6e5a42,roughness:.95})),panel=MAT.darkWood||own(new THREE.MeshStandardMaterial({color:0x3a2416,roughness:.7}));
      const ceiling=own(new THREE.MeshStandardMaterial({color:0x4a3a2c,roughness:1})),brass=MAT.brass;
      // Floor, ceiling and the four walls, with a walnut wainscot to the dado rail.
      box(w,.2,d,MAT.wood,cx,-.1,cz,root);box(w,.2,d,ceiling,cx,h+.1,cz,root);
      box(WALL,h,d,plaster,x0,h/2,cz,root);box(WALL,h,d,plaster,x1,h/2,cz,root);box(w,h,WALL,plaster,cx,h/2,z0,root);box(w,h,WALL,plaster,cx,h/2,z1,root);
      for(const [x,s] of [[x0,1],[x1,-1]]){box(.06,1.1,d,panel,x+s*.17,.55,cz,root);box(.1,.08,d,panel,x+s*.19,1.12,cz,root);box(.08,.18,d,panel,x+s*.19,.09,cz,root)}
      box(w,1.1,.06,panel,cx,.55,z0+.17,root);box(w,1.1,.06,panel,cx,.55,z1-.17,root);
      // A cornice, pilasters between the bays and beams across the ceiling over them.
      for(const [x,s] of [[x0,1],[x1,-1]])box(.22,.24,d,panel,x+s*.22,h-.12,cz,root);
      for(let k=0;k<=BAYS;k++){const z=z1-k*BAY;for(const [x,s] of [[x0,1],[x1,-1]]){box(.14,h,.42,panel,x+s*.22,h/2,z,root);box(.24,.3,.52,panel,x+s*.26,.15,z,root)}
        box(w,.24,.3,panel,cx,h-.12,z,root)}
      // The empty bays: a raised panel each, waiting for a door, and a brass sconce (no light of its own) on every pilaster.
      const glow=own(new THREE.MeshStandardMaterial({color:0xffd9a0,emissive:0xffb35c,emissiveIntensity:1.2,roughness:.4}));
      for(let k=0;k<BAYS;k++)for(const [x,s,side] of [[x0,1,'west'],[x1,-1,'east']]){
        if(side===FOOD_DOOR.side&&k===FOOD_DOOR.bay)continue;if(k===0&&side==='east')continue;// the east bay by the door has the corridor's card
        if(side===DICKINSON_DOOR.side&&k===DICKINSON_DOOR.bay)continue;
        if(side===INDIA_DOOR.side&&k===INDIA_DOOR.bay)continue;
        if(side===PICTURE_BAY.side&&k===PICTURE_BAY.bay)continue;// Boullée's drawing hangs there (boullee-library.js)
        if(side===CELSUS_DOOR.side&&k===CELSUS_DOOR.bay)continue;
        if(side===SCROOGE_DOOR.side&&k===SCROOGE_DOOR.bay)continue;
        if(side===BOTTLE_BAY.side&&k===BOTTLE_BAY.bay)continue;// the ships in bottles' shelf is there
        if(side===BRITAIN_DOOR.side&&k===BRITAIN_DOOR.bay||side===AMERICAS_DOOR.side&&k===AMERICAS_DOOR.bay)continue;// the quarters' doors (passages.js)
        const z=bayZ(k);box(.05,2.2,2.6,panel,x+s*.18,2.5,z,root);box(.03,2,2.4,plaster,x+s*.2,2.5,z,root)}
      for(let k=1;k<BAYS;k++){const z=z1-k*BAY;for(const [x,s] of [[x0,1],[x1,-1]]){box(.08,.08,.22,brass,x+s*.33,2.75,z,root);add(own(new THREE.SphereGeometry(.09,10,8)),glow,x+s*.46,2.85,z,root)}}
      // The quarters' boards, gilt on walnut, above the bays that belong to them.
      const signGeo=own(new THREE.PlaneGeometry(1.9,.34)),signBoard=own(new THREE.BoxGeometry(.06,.44,2.04)),signMats=new Map();
      for(const q of QUARTER_SIGNS){
        if(!signMats.has(q.name))signMats.set(q.name,own(new THREE.MeshStandardMaterial({roughness:.5,emissive:0x2a1a0c,emissiveIntensity:.5,map:own(canvasTexture((c,W,H)=>{c.fillStyle='#24170d';c.fillRect(0,0,W,H);
          c.strokeStyle='#c9a24a';c.lineWidth=5;c.strokeRect(6,6,W-12,H-12);c.fillStyle='#e6c675';c.textAlign='center';c.textBaseline='middle';let size=40;c.font=`bold ${size}px Georgia`;
          while(c.measureText(q.name).width>W-40&&size>18){size-=2;c.font=`bold ${size}px Georgia`}c.fillText(q.name,W/2,H/2+2)},512,92))})));
        const [x,s]=q.side==='west'?[x0,1]:[x1,-1],z=bayZ(q.bay),y=3.95,data={type:'corridor-card',title:q.name.replace('&','and').toLowerCase().replace(/(^|\s)\S/g,m=>m.toUpperCase()),author:q.text,action:'READ'};
        add(signBoard,panel,x+s*.2,y,z,root);const face=add(signGeo,signMats.get(q.name),x+s*.235,y,z,root);face.rotation.y=s*Math.PI/2;mark(face,data)}
      // A long runner down the middle of the floor.
      const runner=own(canvasTexture((c,W,H)=>{c.fillStyle='#5a1a16';c.fillRect(0,0,W,H);c.strokeStyle='#c9a24a';c.lineWidth=6;c.strokeRect(14,14,W-28,H-28);c.lineWidth=2;c.strokeRect(26,26,W-52,H-52);
        c.fillStyle='#7a2a20';for(let y=80;y<H-60;y+=120){c.beginPath();c.moveTo(W/2,y);c.lineTo(W/2+40,y+40);c.lineTo(W/2,y+80);c.lineTo(W/2-40,y+40);c.closePath();c.fill()}},160,1280));
      add(own(new THREE.PlaneGeometry(1.8,d-1.6)),own(new THREE.MeshStandardMaterial({map:runner,roughness:.95})),cx,.005,cz,root).rotation.x=-Math.PI/2;
      // At the far end a tall window on the night: the library's roofs and a garden under the moon (painted; no light).
      const view=own(canvasTexture((c,W,H)=>{const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0b1428');g.addColorStop(.7,'#22304c');g.addColorStop(1,'#1a2030');c.fillStyle=g;c.fillRect(0,0,W,H);
        let k=11;const rnd=()=>(k=(k*9301+49297)%233280)/233280;c.fillStyle='#fff';for(let i=0;i<90;i++){c.globalAlpha=.3+rnd()*.6;c.fillRect(rnd()*W,rnd()*H*.6,1.5,1.5)}c.globalAlpha=1;
        c.fillStyle='#f2ecd2';c.beginPath();c.arc(W*.7,H*.18,22,0,7);c.fill();
        c.fillStyle='#0d1018';c.beginPath();c.moveTo(0,H*.72);for(let x=0;x<=W;x+=16)c.lineTo(x,H*.66-Math.abs(Math.sin(x*.05))*28-(x>W*.3&&x<W*.5?40:0));c.lineTo(W,H);c.lineTo(0,H);c.fill();
        c.fillStyle='#121a14';for(let i=0;i<7;i++){const x=rnd()*W;c.beginPath();c.ellipse(x,H*.8,30+rnd()*30,50+rnd()*30,0,0,7);c.fill()}},256,512));
      add(own(new THREE.PlaneGeometry(2,3.6)),own(new THREE.MeshStandardMaterial({map:view,emissive:0xffffff,emissiveMap:view,emissiveIntensity:.55,roughness:.3})),cx,2.6,z0+.17,root);
      for(const x of [-1,0,1])box(.08,3.7,.08,panel,cx+x,2.6,z0+.2,root);for(const y of [.8,2.6,4.4])box(2.1,.1,.1,panel,cx,y,z0+.2,root);
      // The card by the door, on the east wall's first bay.
      const card=own(canvasTexture((c,W,H)=>{c.fillStyle='#efe4cc';c.fillRect(0,0,W,H);c.strokeStyle='#6b4d22';c.lineWidth=6;c.strokeRect(8,8,W-16,H-16);c.fillStyle='#2b1d0e';c.textAlign='center';
        c.font='bold 34px Georgia';c.fillText('THE LONG CORRIDOR',W/2,62);c.font='italic 22px Georgia';
        ['The Grand Hall’s walls are full, so the','library’s new rooms open off this corridor,','each through a door in one of its bays.','The first is the Gastronomic Athenaeum’s.'].forEach((l,i)=>c.fillText(l,W/2,112+i*34))},512,280));
      const cardData={type:'corridor-card',title:'The Long Corridor',author:'The Grand Hall’s walls are full, so the library’s new rooms open off this corridor, each through a door in one of its bays. The first, on the left, is the Gastronomic Athenaeum’s: food, cooking and culinary history.',action:'READ'};
      const cardMesh=add(own(new THREE.PlaneGeometry(1.1,.6)),own(new THREE.MeshStandardMaterial({map:card,roughness:.85})),x1-.18,1.7,bayZ(0),root);cardMesh.rotation.y=-Math.PI/2;mark(cardMesh,cardData);
      box(.05,.7,1.2,brass,x1-.16,1.7,bayZ(0),root);
      // Two lamps, a third and two thirds of the way along.
      for(const z of [cz+d/4,cz-d/4]){const l=new THREE.PointLight(0xffc98a,5,15,2);l.position.set(cx,h-.7,z);root.add(l);lights.push(l);
        add(own(new THREE.CylinderGeometry(.02,.02,.5,6)),brass,cx,h-.25,z,root);add(own(new THREE.SphereGeometry(.16,12,10)),glow,cx,h-.6,z,root)}
      // The way back to the hall, in the south wall.
      const exit={type:'corridor-exit',title:'The Grand Hall',author:'Back through the walnut door into the hall.',action:'RETURN'};
      if(!doorKit?.hang(root,{data:exit,mark,x:cx,z:z1-WALL/2-.02,yaw:Math.PI,label:'THE GRAND HALL',...LOOK}))mark(box(1.9,3.1,.16,panel,cx,1.55,z1-.2,root),exit);
      scene.add(root);
    }

    // ---------- walking ----------
    function contains(x,z){return x>ROOM.cx-ROOM.w/2&&x<ROOM.cx+ROOM.w/2&&z>ROOM.cz-ROOM.d/2&&z<ROOM.cz+ROOM.d/2}
    function floorAt(x,z){return contains(x,z)?0:null}
    function allowed(x,z){
      if(!contains(x,z))return false;const r=player.radius||.42,m=.45;
      return !(x-r<ROOM.cx-ROOM.w/2+m||x+r>ROOM.cx+ROOM.w/2-m||z-r<ROOM.cz-ROOM.d/2+m||z+r>ROOM.cz+ROOM.d/2-m);
    }

    // ---------- doing things ----------
    function enter(){
      activate();move(ROOM.cx,ROOM.cz+ROOM.d/2-1.6,0);playSample?.('doorOpen',.8,.95);
      showNotice('The Long Corridor. The boards over the bays name the library’s quarters: the Americas on the left, Britain and Ireland at the far end on the right, old libraries and islands between.',8);
      analytics?.track('Room Explored',{room:'long-corridor'});
    }
    // Where a reader stands coming back out of a room off the corridor: in front of that room's door, facing away from it.
    function standBefore(door,back=2.2){activate();return {x:door.x+Math.sin(door.yaw)*back,z:door.z+Math.cos(door.yaw)*back,yaw:door.yaw+Math.PI}}
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('corridor-'))return false;
      if(data.type==='corridor-door'){through(data,enter);return true}
      if(data.type==='corridor-exit'){through(data,()=>{move(DOOR.x+Math.sin(DOOR.yaw)*1.9,DOOR.z+Math.cos(DOOR.yaw)*1.9,DOOR.yaw+Math.PI);playSample?.('doorOpen',.8,1);showNotice('The Grand Hall again.',3)});return true}
      if(data.type==='corridor-card'){showNotice(`${data.title}: ${data.author}`,9);return true}
      return false;
    }

    // ---------- lifecycle ----------
    function activate(){if(!root)buildRoom();lastNeeded=time}
    function unload(){
      if(!root)return;for(const l of lights)l.userData.freed=true;lights.length=0;root.removeFromParent();root=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      ours.length=0;for(const o of owned.splice(0))o.dispose?.();
    }
    function update(t){
      time=t;const inside=contains(player.pos.x,player.pos.z),near=Math.hypot(player.pos.x-DOOR.x,player.pos.z-DOOR.z)<PRELOAD;
      if(inside||near&&(root||window.libraryMayBuild?.()!==false))activate();
      else if(root&&t-lastNeeded>KEEP)unload();
    }
    buildDoor();
    return {contains,floorAt,allowed,interact,update,enter,activate,unload,standBefore,door:DOOR,room:ROOM,foodDoor:FOOD_DOOR,pictureBay:PICTURE_BAY,dickinsonDoor:DICKINSON_DOOR,indiaDoor:INDIA_DOOR,celsusDoor:CELSUS_DOOR,scroogeDoor:SCROOGE_DOOR,bottleBay:BOTTLE_BAY,britainDoor:BRITAIN_DOOR,americasDoor:AMERICAS_DOOR,quarterSigns:QUARTER_SIGNS,bayZ,bays:BAYS,
      get built(){return !!root},zoneAt:(x,z)=>contains(x,z)?'long-corridor':null};
  };
})();
