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
    const {THREE,scene,MAT,player,interactables,canvasTexture,showNotice,playSample,move,analytics,doorKit=null,plan=null,openPlan=null}=options;
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
    // The plan of the library, lit, on the west wall's first bay, ahead and to the left of a reader coming in: every room
    // the reader has found named, and a blank for each one still to find (game.js hands over the journal's register as
    // `plan`; looking at it opens the journal's map, `openPlan`). Drawn on paper, lit by a brass picture light; no lamp.
    const PLAN_BAY={side:'west',bay:0};
    // The north branch (28 November 2026): at the far end an arch opens on a cross corridor running east and west, with
    // ten more bays for rooms still to come (plain panelling until a room is ready for one), a painted window at each end
    // and a lamp of its own. The corridor's own far window moved to the branch's west end.
    const BRANCH={cx:ROOM.cx,cz:ROOM.cz-ROOM.d/2-2.5,w:24,d:5,h:ROOM.h},ARCH={w:3,h:3.8};
    const branchBays=side=>side==='north'?[0,1,2,3,4,5].map(k=>BRANCH.cx-BRANCH.w/2+2+k*4):[-10,-6,6,10].map(dx=>BRANCH.cx+dx);
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
      box(WALL,h,d,plaster,x0,h/2,cz,root);box(WALL,h,d,plaster,x1,h/2,cz,root);box(w,h,WALL,plaster,cx,h/2,z1,root);
      for(const [x,s] of [[x0,1],[x1,-1]]){box(.06,1.1,d,panel,x+s*.17,.55,cz,root);box(.1,.08,d,panel,x+s*.19,1.12,cz,root);box(.08,.18,d,panel,x+s*.19,.09,cz,root)}
      box(w,1.1,.06,panel,cx,.55,z1-.17,root);
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
        if(side===PLAN_BAY.side&&k===PLAN_BAY.bay)continue;// the plan of the library
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
      buildBranch(plaster,panel,ceiling,brass,glow);
      buildPlan(x0,panel,brass);
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
      mergeStatic();scene.add(root);
    }


    // ---------- the north branch ----------
    // A painted night through a window: the library's roofs and a garden under the moon (no light).
    function nightView(seed){return own(canvasTexture((c,W,H)=>{const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0b1428');g.addColorStop(.7,'#22304c');g.addColorStop(1,'#1a2030');c.fillStyle=g;c.fillRect(0,0,W,H);
        let k=seed;const rnd=()=>(k=(k*9301+49297)%233280)/233280;c.fillStyle='#fff';for(let i=0;i<90;i++){c.globalAlpha=.3+rnd()*.6;c.fillRect(rnd()*W,rnd()*H*.6,1.5,1.5)}c.globalAlpha=1;
        c.fillStyle='#f2ecd2';c.beginPath();c.arc(W*(.3+rnd()*.4),H*.18,22,0,7);c.fill();
        c.fillStyle='#0d1018';c.beginPath();c.moveTo(0,H*.72);for(let x=0;x<=W;x+=16)c.lineTo(x,H*.66-Math.abs(Math.sin(x*.05+seed))*28-(x>W*.3&&x<W*.5?40:0));c.lineTo(W,H);c.lineTo(0,H);c.fill();
        c.fillStyle='#121a14';for(let i=0;i<7;i++){const x=rnd()*W;c.beginPath();c.ellipse(x,H*.8,30+rnd()*30,50+rnd()*30,0,0,7);c.fill()}},256,512))}
    function buildBranch(plaster,panel,ceiling,brass,glow){
      const {cx,cz,w,d,h}=BRANCH,x0=cx-w/2,x1=cx+w/2,z0=cz-d/2,z1=cz+d/2,side=(x1-x0-ARCH.w)/2;
      // Floor, ceiling, the north and end walls, and the south wall either side of the arch with a lintel over it.
      box(w,.2,d,MAT.wood,cx,-.1,cz,root);box(w,.2,d,ceiling,cx,h+.1,cz,root);
      box(w,h,WALL,plaster,cx,h/2,z0,root);box(WALL,h,d,plaster,x0,h/2,cz,root);box(WALL,h,d,plaster,x1,h/2,cz,root);
      for(const s of [-1,1])box(side,h,WALL,plaster,cx+s*(ARCH.w/2+side/2),h/2,z1,root);box(ARCH.w,h-ARCH.h,WALL,plaster,cx,(h+ARCH.h)/2,z1,root);
      // The arch: walnut jambs and a head on both faces, so it reads from the corridor and from the branch.
      for(const s of [-1,1])box(.22,ARCH.h,.5,panel,cx+s*(ARCH.w/2+.06),ARCH.h/2,z1,root);box(ARCH.w+.56,.26,.5,panel,cx,ARCH.h+.1,z1,root);
      // Wainscot, dado rail and skirting round the walls, and a cornice.
      for(const [bx,bz,bw,bd] of [[cx,z0+.17,w,.06],[x0+.17,cz,.06,d],[x1-.17,cz,.06,d]])box(bw,1.1,bd,panel,bx,.55,bz,root);
      for(const s of [-1,1])box(side,1.1,.06,panel,cx+s*(ARCH.w/2+side/2),.55,z1-.17,root);
      box(w,.24,.22,panel,cx,h-.12,z0+.22,root);for(const s of [-1,1])box(side,.24,.22,panel,cx+s*(ARCH.w/2+side/2),h-.12,z1-.22,root);
      // Pilasters between the bays, a beam over each, and the bays themselves: a raised panel each, waiting for a door.
      for(let k=0;k<=6;k++){const x=x0+k*4;box(.42,h,.14,panel,x,h/2,z0+.22,root);box(.3,.24,d,panel,x,h-.12,cz,root);if(k>0&&k<6)add(own(new THREE.SphereGeometry(.09,10,8)),glow,x,2.85,z0+.46,root)}
      for(const dx of [-12,-8,-4,4,8,12]){const x=cx+dx;box(.42,h,.14,panel,x,h/2,z1-.22,root)}
      for(const x of branchBays('north')){box(2.6,2.2,.05,panel,x,2.5,z0+.18,root);box(2.4,2,.03,plaster,x,2.5,z0+.2,root)}
      for(const x of branchBays('south')){box(2.6,2.2,.05,panel,x,2.5,z1-.18,root);box(2.4,2,.03,plaster,x,2.5,z1-.2,root)}
      // A painted window at each end: the corridor's own night view moved to the west end, and another to the east.
      [[x0+.17,Math.PI/2,11],[x1-.17,-Math.PI/2,29]].forEach(([x,yaw,seed])=>{const view=nightView(seed);
        add(own(new THREE.PlaneGeometry(2,3.6)),own(new THREE.MeshStandardMaterial({map:view,emissive:0xffffff,emissiveMap:view,emissiveIntensity:.55,roughness:.3})),x,2.6,cz,root).rotation.y=yaw;
        const s=Math.sign(cx-x);for(const dz of [-1,0,1])box(.08,3.7,.08,panel,x+s*.03,2.6,cz+dz,root);for(const y of [.8,2.6,4.4])box(.1,.1,2.1,panel,x+s*.03,y,cz,root)});
      // A runner along the branch, and over the bay facing the arch, the branch's name.
      const runner=own(canvasTexture((c,W,H)=>{c.fillStyle='#5a1a16';c.fillRect(0,0,W,H);c.strokeStyle='#c9a24a';c.lineWidth=6;c.strokeRect(14,14,W-28,H-28)},160,1280));
      const rm=add(own(new THREE.PlaneGeometry(1.8,w-1.6)),own(new THREE.MeshStandardMaterial({map:runner,roughness:.95})),cx,.005,cz,root);rm.rotation.x=-Math.PI/2;rm.rotation.z=Math.PI/2;
      const name=own(canvasTexture((c,W,H)=>{c.fillStyle='#24170d';c.fillRect(0,0,W,H);c.strokeStyle='#c9a24a';c.lineWidth=5;c.strokeRect(6,6,W-12,H-12);c.fillStyle='#e6c675';c.textAlign='center';c.textBaseline='middle';
        c.font='bold 38px Georgia';c.fillText('THE NORTH BRANCH',W/2,H/2-12);c.font='italic 22px Georgia';c.fillText('for the rooms still to come',W/2,H/2+24)},512,110));
      const data={type:'corridor-card',title:'The north branch',author:'The corridor turns here, east and west, for the rooms still to come. Its bays are plain panelling until a room is ready to open from one of them: no door in the library opens on nothing.',action:'READ'};
      box(2.5,.56,.06,panel,cx,3.95,z0+.33,root);mark(add(own(new THREE.PlaneGeometry(2.3,.5)),own(new THREE.MeshStandardMaterial({map:name,roughness:.5,emissive:0x2a1a0c,emissiveIntensity:.5})),cx,3.95,z0+.37,root),data);
      // One lamp of its own, in the middle of the branch.
      const l=new THREE.PointLight(0xffc98a,5,15,2);l.position.set(cx,h-.7,cz);root.add(l);lights.push(l);
      add(own(new THREE.CylinderGeometry(.02,.02,.5,6)),brass,cx,h-.25,cz,root);add(own(new THREE.SphereGeometry(.16,12,10)),glow,cx,h-.6,cz,root);
    }

    // ---------- the plan of the library ----------
    // Each group of the journal's register, its rooms found named in ink, the rest left as blank lines to fill; a secret
    // group appears only once one of its places has been found, and shows only what has been.
    // Half the size it was at first (2048 wide), and redrawn only when the rooms found have changed: a large texture
    // sent to the graphics card again every few seconds made the corridor stutter.
    const PLAN={w:2.9,h:1.8,W:1024,H:636};
    let planTex=null,planDrawn=-1e9,planSig='';
    const planGroups=()=>{try{return plan?.()||null}catch(e){return null}};
    const signature=groups=>groups?groups.map(g=>g.places.map(p=>p[1]?1:0).join('')).join('|'):'';
    function drawPlan(c,W,H,groups=planGroups()){
      c.save();c.scale(W/2048,H/1272);W=2048;H=1272;
      c.fillStyle='#ddcca4';c.fillRect(0,0,W,H);c.strokeStyle='#5a3a12';c.lineWidth=10;c.strokeRect(14,14,W-28,H-28);c.lineWidth=2;c.strokeRect(30,30,W-60,H-60);
      c.fillStyle='#1a1006';c.textAlign='center';c.font='bold 54px Georgia';c.fillText('A PLAN OF THE LIBRARY',W/2,98);
      if(!groups){c.font='italic 30px Georgia';c.fillText('The rooms you find will be written in here.',W/2,160);c.restore();return}
      const all=groups.flatMap(g=>g.places),found=all.filter(p=>p[1]).length;
      c.font='italic 30px Georgia';c.fillText(`${found} of ${all.length} rooms found · the blank lines are rooms still to find`,W/2,146);
      const cols=5,colW=(W-120)/cols,top=200,line=28,bottom=H-56;let col=0,y=top;
      const fit=(text,max)=>{if(c.measureText(text).width<=max)return text;while(text.length>3&&c.measureText(text+'…').width>max)text=text.slice(0,-1);return text+'…'};
      const next=need=>{if(y+need>bottom){col++;y=top}};
      c.textAlign='left';
      for(const g of groups){
        const shown=g.secret?g.places.filter(p=>p[1]):g.places;if(!shown.length)continue;
        next(line*2);if(col>=cols)break;const x=60+col*colW;
        c.fillStyle='#4a2c0a';c.font='bold 25px Georgia';c.fillText(fit(g.title.toUpperCase(),colW-20),x,y);y+=line+2;
        for(const [label,known] of shown){next(line);if(col>=cols)break;const px=60+col*colW;
          if(known){c.fillStyle='#1a1006';c.font='bold 23px Georgia';c.fillText(fit(label,colW-40),px+18,y);c.fillStyle='#b8842a';c.beginPath();c.arc(px+6,y-7,5,0,7);c.fill()}
          else{c.strokeStyle='rgba(90,62,24,.7)';c.lineWidth=2;c.setLineDash([4,7]);c.beginPath();c.moveTo(px+18,y-4);c.lineTo(px+colW-60,y-4);c.stroke();c.setLineDash([]);c.beginPath();c.arc(px+6,y-7,5,0,7);c.stroke()}
          y+=line}
        y+=line*.6}
      c.fillStyle='#6b4d22';c.textAlign='right';c.font='italic 22px Georgia';c.fillText('Look closer: the journal’s map',W-60,H-44);c.restore();
    }
    function redrawPlan(){planDrawn=time;if(!planTex)return;const groups=planGroups(),sig=signature(groups);if(sig===planSig)return;planSig=sig;const ctx=planTex.image?.getContext?.('2d');if(!ctx)return;drawPlan(ctx,PLAN.W,PLAN.H,groups);planTex.needsUpdate=true}
    function buildPlan(x0,panel,brass){
      const z=bayZ(PLAN_BAY.bay),x=x0+WALL/2;
      const groups=planGroups();planSig=signature(groups);planTex=own(canvasTexture((c,W,H)=>drawPlan(c,W,H,groups),PLAN.W,PLAN.H));planDrawn=time;
      box(.08,PLAN.h+.16,PLAN.w+.16,panel,x+.06,2.35,z,root);
      const face=add(own(new THREE.PlaneGeometry(PLAN.w,PLAN.h)),own(new THREE.MeshStandardMaterial({map:planTex,emissive:0xffffff,emissiveMap:planTex,emissiveIntensity:.04,roughness:.9})),x+.11,2.35,z,root);face.rotation.y=Math.PI/2;
      // The picture light over it: a brass hood and a warm glowing strip (no lamp; the board is lit from within).
      box(.24,.06,1.9,brass,x+.2,3.36,z,root);add(own(new THREE.BoxGeometry(.04,.03,1.8)),own(new THREE.MeshStandardMaterial({color:0xffe2b0,emissive:0xffc070,emissiveIntensity:1.6})),x+.3,3.32,z,root);
      for(const dz of [-.7,.7])box(.2,.04,.04,brass,x+.1,3.36,z+dz,root);
      mark(face,{type:'corridor-plan',title:'A plan of the library',author:'Every room you have found is written in, and every one you have not is a blank line. Look closer, and the journal opens at its map.',action:'LOOK'});
    }

    // ---------- merging ----------
    // The corridor's fixed parts (walls, panelling, pilasters, beams, frames: a couple of hundred boxes) are merged into
    // one mesh for each material as soon as it is built, so it is drawn in a handful of calls from its first frame rather
    // than waiting for the library's static batcher. Anything a reader can look at or use is left as it is.
    function mergeStatic(){
      try{
        const byMaterial=new Map();
        for(const m of [...root.children]){
          if(!m.isMesh||m.isInstancedMesh||m.children.length||ours.includes(m)||Object.keys(m.userData||{}).length||Array.isArray(m.material))continue;
          if(!(m.geometry?.attributes?.position?.array instanceof Float32Array))continue;
          if(!byMaterial.has(m.material))byMaterial.set(m.material,[]);byMaterial.get(m.material).push(m)}
        for(const [material,list] of byMaterial){
          if(list.length<2)continue;
          const parts=list.map(m=>{m.updateMatrix();const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();g.applyMatrix4(m.matrix);return g});
          const count=parts.reduce((n,g)=>n+g.attributes.position.count,0),pos=new Float32Array(count*3),nor=new Float32Array(count*3),uv=new Float32Array(count*2);
          let at=0;for(const g of parts){pos.set(g.attributes.position.array,at*3);if(g.attributes.normal)nor.set(g.attributes.normal.array,at*3);if(g.attributes.uv)uv.set(g.attributes.uv.array,at*2);at+=g.attributes.position.count;g.dispose()}
          const merged=own(new THREE.BufferGeometry());merged.setAttribute('position',new THREE.BufferAttribute(pos,3));merged.setAttribute('normal',new THREE.BufferAttribute(nor,3));merged.setAttribute('uv',new THREE.BufferAttribute(uv,2));
          merged.computeBoundingSphere();const mesh=new THREE.Mesh(merged,material);mesh.name='long-corridor-merged';root.add(mesh);for(const m of list)m.removeFromParent()}
      }catch(e){}
    }

    // ---------- walking ----------
    const inMain=(x,z)=>x>ROOM.cx-ROOM.w/2&&x<ROOM.cx+ROOM.w/2&&z>ROOM.cz-ROOM.d/2&&z<ROOM.cz+ROOM.d/2;
    const inBranch=(x,z)=>x>BRANCH.cx-BRANCH.w/2&&x<BRANCH.cx+BRANCH.w/2&&z>BRANCH.cz-BRANCH.d/2&&z<=BRANCH.cz+BRANCH.d/2;
    function contains(x,z){return inMain(x,z)||inBranch(x,z)}
    function floorAt(x,z){return contains(x,z)?0:null}
    function allowed(x,z){
      const r=player.radius||.42,m=.45,arch=Math.abs(x-ROOM.cx)+r<ARCH.w/2;
      // Between the corridor and its north branch, only through the arch.
      if(inMain(x,z))return !(x-r<ROOM.cx-ROOM.w/2+m||x+r>ROOM.cx+ROOM.w/2-m||z+r>ROOM.cz+ROOM.d/2-m||z-r<ROOM.cz-ROOM.d/2+m&&!arch);
      if(inBranch(x,z))return !(Math.abs(x-BRANCH.cx)+r>BRANCH.w/2-m||z-r<BRANCH.cz-BRANCH.d/2+m||z+r>BRANCH.cz+BRANCH.d/2-m&&!arch);
      return false;
    }

    // ---------- doing things ----------
    function enter(){
      activate();redrawPlan();move(ROOM.cx,ROOM.cz+ROOM.d/2-1.6,0);playSample?.('doorOpen',.8,.95);
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
      if(data.type==='corridor-plan'){redrawPlan();if(openPlan)openPlan();else showNotice(`${data.title}: ${data.author}`,8);return true}
      return false;
    }

    // ---------- lifecycle ----------
    function activate(){if(!root)buildRoom();lastNeeded=time}
    function unload(){
      if(!root)return;planTex=null;planSig='';for(const l of lights)l.userData.freed=true;lights.length=0;root.removeFromParent();root=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      ours.length=0;for(const o of owned.splice(0))o.dispose?.();
    }
    function update(t){
      time=t;const inside=contains(player.pos.x,player.pos.z),near=Math.hypot(player.pos.x-DOOR.x,player.pos.z-DOOR.z)<PRELOAD;
      if(inside||near&&(root||window.libraryMayBuild?.()!==false))activate();
      if(inside&&root&&t-planDrawn>5)redrawPlan();
      else if(root&&t-lastNeeded>KEEP)unload();
    }
    buildDoor();
    return {contains,floorAt,allowed,interact,update,enter,activate,unload,standBefore,door:DOOR,room:ROOM,foodDoor:FOOD_DOOR,pictureBay:PICTURE_BAY,dickinsonDoor:DICKINSON_DOOR,indiaDoor:INDIA_DOOR,celsusDoor:CELSUS_DOOR,scroogeDoor:SCROOGE_DOOR,bottleBay:BOTTLE_BAY,planBay:PLAN_BAY,branch:BRANCH,arch:ARCH,branchBays,britainDoor:BRITAIN_DOOR,americasDoor:AMERICAS_DOOR,quarterSigns:QUARTER_SIGNS,bayZ,bays:BAYS,
      get built(){return !!root},zoneAt:(x,z)=>contains(x,z)?'long-corridor':null};
  };
})();
