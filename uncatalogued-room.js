// The Uncatalogued: a house's library, delivered this evening and not yet sorted. Through a plain planked door in the
// west wall of the staff Sorting Room (after-dark-expansion.js), a lamplit store room is knee-deep in it: books in
// leaning towers, books spilled across the boards, tea chests prised open (one tipped over on its side), an armchair
// under a dust sheet, and a trestle table with the day book on it. Round the walls stand five empty cases, each with a
// hand-lettered card: POETRY & PLAYS, NOVELS, CHILDREN'S BOOKS, LIVES & LETTERS, PHILOSOPHY & SCIENCE.
// Among the heaps are twenty real books, four of each kind, drawn afresh from the library's own each time the room is
// built. Take one, carry it, and set it down at the right case (game.js hands a carried book to `accepts` and, when
// it fits, places it with `place`); a wrong case says so, and the second time says what the book is. When all twenty
// are in, the day book gains a line and the lamp burns up a little (the lots sorted are counted for good,
// `athenaeum-uncatalogued-lots`). Leave, and the next time the room is built there is a fresh lot, in a fresh mess.
// The heaps are two InstancedMeshes (covers and pages, sharing their matrices); the room adds one lamp of its own.
// Like the other rooms behind doors, it is built when the reader comes near its door and freed a while after they leave.
(function(){
  'use strict';

  // The five kinds, and the library's books that may turn up in a lot (all from the core list in game.js).
  const KINDS=[
    {key:'poetry',name:'POETRY & PLAYS',ids:[1934,1322,3011,2002,1524,1513,2542,26,6130,1727,16328,651]},
    {key:'novels',name:'NOVELS',ids:[1342,1400,768,1260,145,161,158,105,141,730,766,1023,550,2641,77,98,2701,110,153,33]},
    {key:'children',name:'CHILDREN’S BOOKS',ids:[11,12,55,54,146,2591,1597,236,74,120,1154]},
    {key:'lives',name:'LIVES & LETTERS',ids:[20203,2376,3296,921,5197,19553]},
    {key:'ideas',name:'PHILOSOPHY & SCIENCE',ids:[1232,5740,3207,1497,1600,2680,132,3300,1228,66510,19103,4363,3420]}
  ];
  const PER_KIND=4,LOT=KINDS.length*PER_KIND,SLOTS=8;
  const LOTS_KEY='athenaeum-uncatalogued-lots';
  const CARDS={
    chest:['A tea chest','Plywood lined with foil, the lid prised off. Packed tight with books, spines up, and straw.'],
    tipped:['A tea chest on its side','THIS WAY UP, it says, upside down. Its books have gone out across the floor like a hand of cards.'],
    stacked:['A tea chest','BOOKS · NOT TO BE STACKED. Somebody has stacked books on it.'],
    lot:['A tea chest','LOT 4 · LIBRARY, in a carrier’s crayon. There is no lot 1, 2 or 3 in the room.'],
    crowbar:['A crowbar','Left where it fell after the last lid came off.'],
    string:['A ball of packing string','For tying up the books nobody will want. Nobody has used any.']
  };

  window.createUncataloguedRoom=function(options){
    const {THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,showNotice,playSample,sound,move,analytics,
      isHolding=()=>false,registerSeat=null,doorKit=null,storage=(()=>{try{return window.localStorage}catch(e){return null}})(),random=Math.random}=options;
    // In the Sorting Room's west wall (x −194), between the service shelves (to z −28.5) and the hand truck (from z −23.4),
    // facing east into the room.
    const DOOR={x:-193.72,z:-26.4,yaw:Math.PI/2};
    // Far out east, clear of every other room (Walden at x 900, the passages at x 1200, z −600, the explorers at x 1320, z 320).
    const ROOM={cx:1400,cz:-250,w:18,d:16,h:4.4};
    const PRELOAD=7,KEEP=25;
    // The cases: where each stands (offsets from the room's middle) and which way its open side faces.
    const CASES=[
      {kind:'poetry',x:-5,z:-7.55,yaw:0},{kind:'novels',x:0,z:-7.55,yaw:0},{kind:'children',x:5,z:-7.55,yaw:0},
      {kind:'lives',x:-8.55,z:-1,yaw:Math.PI/2},{kind:'ideas',x:8.55,z:-1,yaw:-Math.PI/2}
    ];
    const CASE={w:3.2,h:2.75,d:.45,shelves:[.5,1.45,2.4]};
    // Towers of books: where each stands and how many books high.
    const TOWERS=[[-1.7,-5.1,22],[2.1,-5.3,15],[-7.5,-6.5,18],[7.5,-6.6,13],[-2.5,3.3,11],[2.7,2.1,17],[7.4,2.8,9],[-7.5,5.6,14],[6.6,6.3,10],[-4.6,-2.6,8]];
    // Tea chests: where, turned how far, and what they are (the tipped one lies on its side).
    const CHESTS=[{x:-3.4,z:-4.3,turn:.2,card:'lot'},{x:4.3,z:4.4,turn:-.3,card:'chest'},{x:6.2,z:-4.3,turn:.5,card:'tipped',tipped:true},{x:-6.9,z:1.7,turn:1.4,card:'stacked'}];
    const TABLE={x:0,z:.4,w:2.6,d:1.1},CHAIR={x:-5.4,z:4.6,yaw:-.86};
    const DOOR_LOOK={style:'painted',color:0x5d4a36,planked:true,fanlight:false,cornice:false,width:1.9,height:3.1};
    const through=(data,go)=>doorKit&&data.kit?doorKit.pass(data.kit,data,go):go();

    let root=null,time=0,lastNeeded=-1e9,lamp=null,done=false,decor=null;
    const owned=[],ours=[],books=[],blockers=[],cases=new Map(),towers=[],slumps=[];
    const wrong=new Map();
    const own=thing=>{owned.push(thing);return thing};
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    // The door in the Sorting Room stays when this room is freed, so its parts are not among the room's own.
    function markDoor(object,data){object.userData=data;interactables.push(object);return object}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const kindOf=key=>KINDS.find(k=>k.key===key);
    const card=key=>({type:'uncat-card',title:CARDS[key][0],author:CARDS[key][1],action:'READ'});
    function lotsSorted(){try{return Math.max(0,parseInt(storage?.getItem(LOTS_KEY)||'0',10)||0)}catch(e){return 0}}
    function shuffle(list){const a=list.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
    const jitter=(n=1)=>(random()-.5)*2*n;

    // ---------- the door, in the Sorting Room ----------
    function buildDoor(){
      const g=new THREE.Group();g.name='uncatalogued-door';g.position.set(DOOR.x,0,DOOR.z);g.rotation.y=DOOR.yaw;scene.add(g);
      const data={type:'uncat-door',title:'UNCATALOGUED',author:'A plain store-room door. Straw has worked its way out under it.',action:'ENTER'};
      if(!doorKit?.hang(g,{data,mark:markDoor,...DOOR_LOOK,label:'UNCATALOGUED'}))markDoor(add(new THREE.BoxGeometry(1.9,3.1,.14),new THREE.MeshStandardMaterial({color:DOOR_LOOK.color,roughness:.8}),0,1.55,.08,g),data);
    }

    // ---------- the lot ----------
    // Four books of each kind, drawn afresh; a kind with fewer the library holds gives what it has.
    function drawLot(){
      const lot=[];
      for(const kind of KINDS){for(const book of shuffle(kind.ids.map(id=>findBook(id)).filter(Boolean)).slice(0,PER_KIND))lot.push({book,kind:kind.key})}
      return lot;
    }

    // ---------- the heaps ----------
    // Each decorative book is a coloured cover and a cream block of pages that shows at the head, tail and fore-edge,
    // two InstancedMeshes drawing the same matrices. A book is described lying flat: width (spine to fore-edge) along x,
    // thickness along y, height (head to tail) along z.
    function heaps(){
      const items=[];
      const put=(x,y,z,w,t,d,rx=0,ry=0,rz=0)=>{items.push({x,y,z,w,t,d,rx,ry,rz});return items.length-1};
      const size=()=>({w:.42+random()*.3,t:.045+random()*.07,d:.6+random()*.36});
      // Towers: each book a little off the one below, so the stacks lean and wander as stacks of books do.
      for(const [tx,tz,n] of TOWERS){
        let y=0,ox=0,oz=0,turn=random()*Math.PI;const lean=random()*Math.PI*2,start=items.length;
        for(let i=0;i<n;i++){const s=i===0?{w:.74,t:.09,d:1}:size();ox+=Math.cos(lean)*.012+jitter(.025);oz+=Math.sin(lean)*.012+jitter(.025);turn+=jitter(.35);
          put(tx+ox,y+s.t/2,tz+oz,s.w,s.t,s.d,jitter(.02),turn,jitter(.02));y+=s.t}
        towers.push({x:tx,z:tz,top:y,ox,oz,start,count:n,slumped:false});block(tx+ox/2,tz+oz/2,.95,.95);
      }
      // Drifts across the floor: single books and little piles, wherever there is room for them.
      let tries=0,laid=0;
      while(laid<70&&tries<900){tries++;const x=jitter(ROOM.w/2-.7),z=jitter(ROOM.d/2-.7);
        if(Math.abs(x)<1.2&&z>ROOM.d/2-2.6)continue; // the way in stays clear
        if(near(x,z,.55))continue;
        const pile=random()<.25?2+Math.floor(random()*3):1;let y=0;
        for(let i=0;i<pile;i++){const s=size();put(x+jitter(.06),y+s.t/2,z+jitter(.06),s.w,s.t,s.d,0,random()*Math.PI*2,0);y+=s.t}
        laid++;
      }
      // The tipped chest's books, fanned out across the floor from its open top.
      const tip=CHESTS.find(c=>c.tipped);
      for(let i=0;i<16;i++){const a=Math.PI-tip.turn+jitter(.7),r=.6+random()*1.5,s=size();
        put(tip.x+Math.cos(a)*r,s.t/2+(i%3)*.05,tip.z+Math.sin(a)*r,s.w,s.t,s.d,jitter(.05),random()*Math.PI*2,jitter(.12))}
      // Books packed upright in the chests, spines up.
      for(const chest of CHESTS){if(chest.tipped)continue;
        const c=Math.cos(chest.turn),sn=Math.sin(chest.turn);
        for(let row=0;row<2;row++)for(let i=0;i<9;i++){const s={w:.4+random()*.12,t:.06+random()*.03,d:.34+random()*.04};
          const lx=-.32+i*.08,lz=row?.17:-.17,x=chest.x+lx*c+lz*sn,z=chest.z-lx*sn+lz*c;
          put(x,.12+s.w/2,z,s.w,s.t,s.d,0,chest.turn,-Math.PI/2+jitter(.08))}
      }
      // A stack on the chest that says not to stack on it.
      const stacked=CHESTS.find(c=>c.card==='stacked');{let y=.76;for(let i=0;i<6;i++){const s=size();put(stacked.x+jitter(.04),y+s.t/2,stacked.z+jitter(.04),s.w,s.t,s.d,0,stacked.turn+jitter(.3),0);y+=s.t}stacked.top=y}
      // A few on the armchair's arms and under the table.
      for(const side of [-1,1]){const s=size(),c=Math.cos(CHAIR.yaw),sn=Math.sin(CHAIR.yaw),lx=side*.47;put(CHAIR.x+lx*c,.77+s.t/2,CHAIR.z-lx*sn,.26,s.t,.5,0,CHAIR.yaw,0)}
      for(let i=0;i<5;i++){const s=size();put(TABLE.x-.8+i*.4+jitter(.05),s.t/2,TABLE.z+jitter(.2),s.w,s.t,s.d,0,random()*Math.PI*2,0)}
      return items;
    }
    // Whether a point on the floor is too near something that stands there (towers, chests, cases, the table, the chair).
    function near(x,z,gap){
      const ax=ROOM.cx+x,az=ROOM.cz+z;
      return blockers.some(b=>ax>b.minX-gap&&ax<b.maxX+gap&&az>b.minZ-gap&&az<b.maxZ+gap);
    }
    function drawHeaps(items){
      const coverGeometry=own(new THREE.BoxGeometry(1,1,1)),pageGeometry=own(new THREE.BoxGeometry(1,.8,1.012));pageGeometry.translate(.016,0,0);
      const covers=own(new THREE.InstancedMesh(coverGeometry,own(new THREE.MeshStandardMaterial({color:0xffffff,roughness:.82})),items.length));
      const pages=own(new THREE.InstancedMesh(pageGeometry,own(new THREE.MeshStandardMaterial({color:0xd9cdb0,roughness:.95})),items.length));
      const colours=[0x5a2a24,0x2f3f2e,0x23314a,0x6b4a2a,0x3a2a3e,0x7a5a32,0x4a1f1c,0x2c4a46,0x8a6a40,0x403a30,0x6e2f22,0x1f2a2a];
      const colour=new THREE.Color();
      items.forEach((item,i)=>{colour.setHex(colours[Math.floor(random()*colours.length)]).multiplyScalar(.8+random()*.4);covers.setColorAt(i,colour)});
      covers.position.set(ROOM.cx,0,ROOM.cz);pages.position.copy(covers.position);
      root.add(covers,pages);decor={items,covers,pages};setMatrices();
      covers.instanceColor.needsUpdate=true;
    }
    const tmp={m:null,q:null,e:null,v:null,s:null};
    function setMatrices(from=0,to=decor.items.length){
      tmp.m=tmp.m||new THREE.Matrix4();tmp.q=tmp.q||new THREE.Quaternion();tmp.e=tmp.e||new THREE.Euler(0,0,0,'YXZ');tmp.v=tmp.v||new THREE.Vector3();tmp.s=tmp.s||new THREE.Vector3();
      for(let i=from;i<to;i++){const b=decor.items[i];tmp.e.set(b.rx,b.ry,b.rz,'YXZ');tmp.q.setFromEuler(tmp.e);tmp.v.set(b.x,b.y,b.z);tmp.s.set(b.w,b.t,b.d);tmp.m.compose(tmp.v,tmp.q,tmp.s);
        decor.covers.setMatrixAt(i,tmp.m);decor.pages.setMatrixAt(i,tmp.m)}
      decor.covers.instanceMatrix.needsUpdate=true;decor.pages.instanceMatrix.needsUpdate=true;
    }

    // ---------- the room ----------
    function buildRoom(){
      root=new THREE.Group();root.name='uncatalogued';const {cx,cz,w,d,h}=ROOM;done=false;wrong.clear();
      const plaster=own(new THREE.MeshStandardMaterial({color:0x6f6352,roughness:.97})),boards=own(new THREE.MeshStandardMaterial({color:0x5b4430,roughness:.85,map:MAT.wood?.map||null}));
      box(w,.3,d,boards,cx,-.15,cz,root);box(w,.2,d,MAT.darkWood,cx,h+.1,cz,root);
      box(w,h,.3,plaster,cx,h/2,cz-d/2,root);box(w,h,.3,plaster,cx,h/2,cz+d/2,root);box(.3,h,d,plaster,cx-w/2,h/2,cz,root);box(.3,h,d,plaster,cx+w/2,h/2,cz,root);
      for(const [x,z,sw,sd] of [[cx,cz-d/2+.17,w-.4,.04],[cx,cz+d/2-.17,w-.4,.04],[cx-w/2+.17,cz,.04,d-.4],[cx+w/2-.17,cz,.04,d-.4]])box(sw,.18,sd,MAT.darkWood,x,.09,z,root);
      for(const dz of [-4.5,0,4.5])box(w-.3,.26,.3,MAT.darkWood,cx,h-.13,cz+dz,root);
      // The cases, empty, with their cards.
      for(const spec of CASES)buildCase(spec);
      // The trestle table with the day book, a crowbar and the string.
      buildTable();
      buildChair();
      for(const chest of CHESTS)buildChest(chest);
      const items=heaps();drawHeaps(items);
      // The lot, thrown in among the heaps.
      placeLot(drawLot());
      // One lamp, hung low over the table, its shade green.
      lamp=new THREE.PointLight(0xffcf94,9,22,2);lamp.position.set(cx+TABLE.x,h-1.2,cz+TABLE.z);root.add(lamp);
      add(own(new THREE.CylinderGeometry(.2,.42,.28,16,1,true)),own(new THREE.MeshStandardMaterial({color:0x2f4a37,emissive:0xffb35c,emissiveIntensity:.8,roughness:.6,side:THREE.DoubleSide})),cx+TABLE.x,h-1.05,cz+TABLE.z,root);
      add(own(new THREE.CylinderGeometry(.008,.008,.9,4)),MAT.brass||MAT.darkWood,cx+TABLE.x,h-.48,cz+TABLE.z,root);
      // The door back to the Sorting Room.
      const exit={type:'uncat-exit',title:'Back to the Sorting Room',author:'The staff room, where the string and the returns are.',action:'RETURN'};
      if(!doorKit?.hang(root,{data:exit,mark,x:cx,z:cz+d/2-.2,yaw:Math.PI,label:'STAFF · SORTING',own,...DOOR_LOOK}))mark(box(1.9,3.1,.16,own(new THREE.MeshStandardMaterial({color:DOOR_LOOK.color,roughness:.8})),cx,1.55,cz+d/2-.2,root),exit);
      scene.add(root);
    }
    function caseCard(kind){
      return own(canvasTexture((c,W,H)=>{c.fillStyle='#e6dcc2';c.fillRect(0,0,W,H);c.strokeStyle='#8a7550';c.lineWidth=3;c.strokeRect(6,6,W-12,H-12);
        c.fillStyle='#2b2118';c.textAlign='center';c.font='bold 34px Georgia';c.fillText(kind.name,W/2,H*.5);c.font='italic 19px Georgia';c.fillText('in pencil, and underlined twice',W/2,H*.8)},460,110));
    }
    function buildCase(spec){
      const kind=kindOf(spec.kind),g=new THREE.Group();g.position.set(ROOM.cx+spec.x,0,ROOM.cz+spec.z);g.rotation.y=spec.yaw;root.add(g);
      const data={type:'uncat-case',kind:spec.kind,title:kind.name,author:'',action:'SHELVE',place:mesh=>shelve(mesh,spec.kind)};
      Object.defineProperty(data,'author',{get:()=>`An empty case, waiting. ${count(spec.kind)} of ${PER_KIND} shelved.`,configurable:true});
      const {w,h,d,shelves}=CASE,parts=[];
      parts.push(box(w,h,.05,MAT.wood2||MAT.darkWood,0,h/2,-d/2+.025,g));
      for(const x of [-w/2,w/2])parts.push(box(.07,h,d,MAT.darkWood,x,h/2,0,g));
      for(const y of shelves)parts.push(box(w,.05,d,MAT.darkWood,0,y,0,g));
      parts.push(box(w+.12,.08,d+.06,MAT.darkWood,0,h,0,g));parts.push(box(w,.12,d,MAT.darkWood,0,.06,0,g));
      const label=add(own(new THREE.PlaneGeometry(1.6,.38)),own(new THREE.MeshStandardMaterial({map:caseCard(kind),roughness:.95})),0,shelves[2]+.27,-d/2+.06,g);label.rotation.x=-.08;parts.push(label);
      for(const part of parts)mark(part,data);
      const yaw=spec.yaw,cw=Math.abs(Math.cos(yaw))*w+Math.abs(Math.sin(yaw))*(d+.15),cd=Math.abs(Math.sin(yaw))*w+Math.abs(Math.cos(yaw))*(d+.15);
      block(ROOM.cx+spec.x,ROOM.cz+spec.z,cw,cd);
      cases.set(spec.kind,{group:g,spec,slots:new Array(SLOTS).fill(null)});
    }
    function buildTable(){
      const {cx,cz}=ROOM,x=cx+TABLE.x,z=cz+TABLE.z,oak=MAT.wood2||MAT.darkWood;
      box(TABLE.w,.06,TABLE.d,oak,x,.92,z,root);
      for(const s of [-1,1]){const leg=box(.08,.95,.9,MAT.darkWood,x+s*(TABLE.w/2-.25),.46,z,root);leg.rotation.z=s*.06}
      box(TABLE.w-.5,.06,.06,MAT.darkWood,x,.3,z,root);block(x,z,TABLE.w+.2,TABLE.d+.2);
      // The day book, open.
      const page=own(canvasTexture((c,W,H)=>{c.fillStyle='#ece3cc';c.fillRect(0,0,W,H);c.strokeStyle='#b9a983';c.lineWidth=1;for(let y=40;y<H;y+=22){c.beginPath();c.moveTo(14,y);c.lineTo(W-14,y);c.stroke()}
        c.fillStyle='#3a2c1e';c.font='italic 17px Georgia';const lines=['Recd. by carrier, 8 p.m.','12 tea chests, books.','Contents not listed.','To be sorted.'];lines.forEach((t,i)=>c.fillText(t,22,36+22*i))},256,200));
      const ledgerData={type:'uncat-ledger',title:'The day book',author:'',action:'READ'};
      Object.defineProperty(ledgerData,'author',{get:dayBook,configurable:true});
      const cover=mark(box(.86,.03,.56,own(new THREE.MeshStandardMaterial({color:0x3b2a1e,roughness:.7})),x-.5,.965,z,root),ledgerData);
      for(const s of [-1,1]){const p=add(own(new THREE.PlaneGeometry(.4,.52)),own(new THREE.MeshStandardMaterial({map:page,roughness:.95})),x-.5+s*.205,.985,z,root);p.rotation.x=-Math.PI/2;p.rotation.y=s*-.04;mark(p,ledgerData)}
      const iron=MAT.iron||own(new THREE.MeshStandardMaterial({color:0x26282a,metalness:.6,roughness:.5}));
      const bar=mark(box(.9,.03,.03,iron,x+.6,.965,z+.25,root),card('crowbar'));bar.rotation.y=.4;
      mark(add(own(new THREE.SphereGeometry(.08,12,8)),own(new THREE.MeshStandardMaterial({color:0x9a8358,roughness:1})),x+.85,1.03,z-.22,root),card('string'));
    }
    function buildChair(){
      const g=new THREE.Group();g.position.set(ROOM.cx+CHAIR.x,0,ROOM.cz+CHAIR.z);g.rotation.y=CHAIR.yaw;root.add(g);
      const cloth=own(new THREE.MeshStandardMaterial({color:0x5a3b2c,roughness:.85})),sheet=own(new THREE.MeshStandardMaterial({color:0xd8d3c6,roughness:1}));
      const seat=box(.86,.2,.78,cloth,0,.48,0,g),back=box(.86,.8,.18,cloth,0,.95,.36,g);for(const s of [-1,1])box(.14,.3,.78,cloth,s*.47,.62,0,g);
      for(const lx of [-.38,.38])for(const lz of [-.32,.32])box(.07,.38,.07,MAT.darkWood,lx,.19,lz,g);
      // The dust sheet, thrown back over the chair's back so that a reader can sit.
      const drape=box(1.02,.9,.05,sheet,0,.82,.5,g);drape.rotation.x=.08;box(1.02,.06,.4,sheet,0,1.36,.4,g);
      block(ROOM.cx+CHAIR.x,ROOM.cz+CHAIR.z,1.2,1.2);
      if(registerSeat){const data=registerSeat([seat,back],g,new THREE.Vector3(0,1.2,.05),CHAIR.yaw,{title:'An armchair under a dust sheet',author:'Sit, and read one of the books from the heaps.'});
        Object.defineProperty(data,'bookIds',{get:()=>books.map(mesh=>mesh.userData.book.id),configurable:true});ours.push(seat,back)}
    }
    function stencil(text){
      return own(canvasTexture((c,W,H)=>{c.fillStyle='#a9875a';c.fillRect(0,0,W,H);c.fillStyle='rgba(30,20,12,.82)';c.textAlign='center';c.font='bold 30px "Courier New",monospace';
        const parts=text.split('\n');parts.forEach((t,i)=>c.fillText(t,W/2,H/2+10+(i-(parts.length-1)/2)*36))},320,140));
    }
    function buildChest(chest){
      const g=new THREE.Group();g.position.set(ROOM.cx+chest.x,0,ROOM.cz+chest.z);g.rotation.y=chest.turn;root.add(g);
      const ply=own(new THREE.MeshStandardMaterial({color:0xa9875a,roughness:.9})),foil=own(new THREE.MeshStandardMaterial({color:0xb7b4ad,metalness:.5,roughness:.45}));
      const body=new THREE.Group();g.add(body);
      if(chest.tipped){body.rotation.z=Math.PI/2;body.position.set(.38,.4,0)}
      const W=.8,H=.76,T=.03,parts=[];
      parts.push(box(W,T,W,ply,0,T/2,0,body));
      for(const s of [-1,1]){parts.push(box(T,H,W,ply,s*(W/2-T/2),H/2,0,body));parts.push(box(W,H,T,ply,0,H/2,s*(W/2-T/2),body))}
      box(W-.08,.02,W-.08,foil,0,.05,0,body);
      for(const s of [-1,1])box(W+.01,.05,.035,MAT.darkWood,0,H-.06,s*(W/2-.01),body);
      const text=chest.card==='tipped'?'THIS WAY UP\n↑ ↑':chest.card==='stacked'?'BOOKS · NOT\nTO BE STACKED':chest.card==='lot'?'LOT 4\nLIBRARY':'FRAGILE\nBOOKS';
      const label=add(own(new THREE.PlaneGeometry(.66,.29)),own(new THREE.MeshStandardMaterial({map:stencil(text),roughness:.95})),0,H*.55,W/2+.002,body);
      if(chest.card==='tipped')label.rotation.z=Math.PI/2;
      for(const part of [...parts,label])mark(part,card(chest.card));
      // Its lid, prised off and leaning against it (or flat on the floor by the tipped one).
      const lid=box(W,.025,W,ply,0,0,0,g);
      if(chest.tipped){lid.position.set(-.9,.013,.3);lid.rotation.y=.4}else{lid.position.set(0,.4,-W/2-.08);lid.rotation.x=Math.PI/2-.22}
      block(ROOM.cx+chest.x,ROOM.cz+chest.z,1.15,1.15);
    }

    // The twenty books go on the tops of towers, standing up out of the chests, in the drifts and on the table.
    function placeLot(lot){
      const spots=[];
      for(const [i,t] of towers.entries())spots.push({x:t.x+t.ox,y:t.top+.06,z:t.z+t.oz,rx:-Math.PI/2,ry:random()*Math.PI*2,rz:0,tower:i});
      for(const chest of CHESTS){if(chest.tipped||chest.card==='stacked')continue;const c=Math.cos(chest.turn),sn=Math.sin(chest.turn);
        for(const lx of [-.18,.2]){spots.push({x:chest.x+lx*c,y:.12+.47+.43,z:chest.z-lx*sn,rx:0,ry:chest.turn+(lx<0?0:Math.PI),rz:jitter(.25)})}}
      const stacked=CHESTS.find(c=>c.card==='stacked');spots.push({x:stacked.x,y:stacked.top+.06,z:stacked.z,rx:-Math.PI/2,ry:random()*6,rz:0});
      spots.push({x:TABLE.x+.45,y:.95+.06,z:TABLE.z-.15,rx:-Math.PI/2,ry:.3,rz:0});
      // The floor, among the drifts: open boards a reader can step to.
      let tries=0;
      while(spots.length<LOT+4&&tries<500){tries++;const x=jitter(ROOM.w/2-1.2),z=jitter(ROOM.d/2-1.2);if(Math.abs(x)<1.3&&z>ROOM.d/2-2.6)continue;if(near(x,z,.7))continue;
        if(spots.some(s=>Math.hypot(s.x-x,s.z-z)<1.2))continue;spots.push({x,y:.065,z,rx:-Math.PI/2,ry:random()*Math.PI*2,rz:0})}
      const chosen=shuffle(spots).slice(0,lot.length),geometry=own(new THREE.BoxGeometry(.62,.86,.12));
      lot.forEach(({book,kind},i)=>{const s=chosen[i];
        const mesh=add(geometry,own(bookMaterial(book)),ROOM.cx+s.x,s.y,ROOM.cz+s.z,root);mesh.rotation.order='YXZ';mesh.rotation.set(s.rx,s.ry,s.rz);
        mesh.userData={type:'book',book,loaded:false,uncatalogued:true,kind,tower:s.tower,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:root}};
        interactables.push(mesh);ours.push(mesh);books.push(mesh)});
    }

    // ---------- shelving ----------
    // How many of a kind stand in their case now.
    function count(kind){const c=cases.get(kind);return c?books.filter(b=>b.userData.kind===kind&&b.parent===c.group).length:0}
    function sortedCount(){return KINDS.reduce((n,k)=>n+count(k.key),0)}
    // Whether a carried book may go in a case: true, or what to say instead.
    function accepts(mesh,target){
      const d=mesh?.userData,kind=target?.userData?.kind,name=kindOf(kind)?.name||'this case';
      if(!d?.uncatalogued||!books.includes(mesh))return `That one is the library’s own, already catalogued. These cases are for the books from the heaps.`;
      if(d.kind===kind)return true;
      const tries=(wrong.get(mesh)||0)+1;wrong.set(mesh,tries);sound?.(150,.12,'triangle',.04);
      return tries<2?`Not one for ${name}, surely. Look again at what it is.`:`Not ${name}. The pencilled ticket inside its cover says ${kindOf(d.kind).name}.`;
    }
    // Stand the book in the first free place in its case (or the place it had), and say how the lot is going.
    function shelve(mesh,kind){
      const c=cases.get(kind);let slot=c.slots.indexOf(mesh);if(slot<0){slot=c.slots.findIndex(s=>!s||s.parent!==c.group);if(slot<0)slot=0;c.slots[slot]=mesh}
      const row=Math.floor(slot/4),col=slot%4;
      c.group.attach(mesh);mesh.position.set(-1.14+col*.76,CASE.shelves[row]+.025+.43,-CASE.d/2+.14);mesh.rotation.set(-.07,0,jitter(.03),'YXZ');
      const n=count(kind),all=sortedCount();sound?.(392,.12,'triangle',.05);
      if(all>=books.length&&!done)return 'The last book goes in.';
      return `${mesh.userData.book.title}: shelved under ${kindOf(kind).name} (${n} of ${PER_KIND}). ${all} of ${books.length} in order.`;
    }
    function dayBook(){
      const lots=lotsSorted(),n=sortedCount();
      return `Recd. by carrier, 8 p.m.: twelve tea chests of books, contents not listed. To be sorted. Tonight’s lot: ${n} of ${books.length} in their cases.`+
        (lots?` Lots put in order since: ${lots}.`:'');
    }
    function finish(){
      done=true;let lots=lotsSorted()+1;try{storage?.setItem(LOTS_KEY,String(lots))}catch(e){lots=lotsSorted()||1}
      if(lamp)lamp.intensity*=1.35;
      for(const [i,f] of [523.25,659.25,783.99].entries())setTimeout(()=>sound?.(f,.5,'triangle',.05),i*160);
      showNotice(`The last of the lot is in its case. The day book gains a line in pencil: “${lots===1?'One lot':`${lots} lots`} put in order. Thank you.” There are eleven more chests, but not tonight.`,10);
      analytics?.track('Room Explored',{room:'uncatalogued-sorted'});
    }

    // ---------- walking ----------
    function contains(x,z){return x>ROOM.cx-ROOM.w/2&&x<ROOM.cx+ROOM.w/2&&z>ROOM.cz-ROOM.d/2&&z<ROOM.cz+ROOM.d/2}
    function floorAt(x,z){return contains(x,z)?0:null}
    function allowed(x,z){
      if(!contains(x,z))return false;const r=player.radius||.42;
      if(x-r<ROOM.cx-ROOM.w/2+.3||x+r>ROOM.cx+ROOM.w/2-.3||z-r<ROOM.cz-ROOM.d/2+.3||z+r>ROOM.cz+ROOM.d/2-.3)return false;
      return !blockers.some(b=>x+r>b.minX&&x-r<b.maxX&&z+r>b.minZ&&z-r<b.maxZ);
    }
    // Standing by the way out: a reader carrying a book can leave from here too (the book goes back where it was).
    function atExit(x=player.pos.x,z=player.pos.z){return !!root&&contains(x,z)&&Math.abs(x-ROOM.cx)<1.5&&z>ROOM.cz+ROOM.d/2-2.4}

    // ---------- doing things ----------
    function enter(){
      activate();move(ROOM.cx,ROOM.cz+ROOM.d/2-1.4,0);playSample?.('doorOpen',.8,.95);
      showNotice(sortedCount()>=books.length&&books.length?'The Uncatalogued: tonight’s lot is in its cases. The rest of the house’s books can wait for another night.':
        'The Uncatalogued: a house’s library, delivered this evening and not yet sorted. Among the heaps are twenty books worth keeping. Carry each to its case, and the day book on the table will keep count.',10);
      analytics?.track('Room Explored',{room:'uncatalogued'});
    }
    function leave(withBook=false){
      move(DOOR.x+1.6,DOOR.z,-Math.PI/2);playSample?.('doorOpen',.8,1);
      showNotice(withBook?'You leave the book where it was, for now. The Sorting Room again.':'The Sorting Room again.',3);
    }
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('uncat-'))return false;
      if(data.type==='uncat-door'){through(data,enter);return true}
      if(data.type==='uncat-exit'){through(data,()=>leave(false));return true}
      if(data.type==='uncat-case'){showNotice(`${data.title}: ${data.author} Carry a book here from the heaps to shelve it.`,6);return true}
      if(data.type==='uncat-ledger'){showNotice(`The day book. ${data.author}`,10);sound?.(300,.1,'triangle',.03);return true}
      if(data.type==='uncat-card'){showNotice(`${data.title}: ${data.author}`,7);return true}
      return false;
    }

    // ---------- lifecycle ----------
    function activate(){if(!root)buildRoom();lastNeeded=time}
    function unload(){
      // Its lamp is marked freed, so the light budget lets it go.
      if(!root)return;root.removeFromParent();root.traverse(object=>{if(object.isLight)object.userData.freed=true});root=null;lamp=null;decor=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0;cases.clear();towers.length=0;slumps.length=0;wrong.clear();
    }
    // A book taken from the top of a tower leaves it a little lower and less straight: its top few books settle.
    function slump(i){
      const t=towers[i];if(!t||t.slumped||!decor)return;t.slumped=true;sound?.(90,.18,'sine',.05);
      const from=t.start+Math.max(0,t.count-4),to=t.start+t.count,start=time;
      const goal=[];for(let k=from;k<to;k++){const b=decor.items[k];goal.push({b,rz:b.rz+jitter(.06),rx:b.rx+jitter(.05),ry:b.ry+jitter(.25),x:b.x+jitter(.03),z:b.z+jitter(.03),y:b.y-.015*(k-from+1),from:{...b}})}
      slumps.push({start,goal,from,to});
    }
    function update(t){
      time=t;const inside=contains(player.pos.x,player.pos.z),near=Math.hypot(player.pos.x-DOOR.x,player.pos.z-DOOR.z)<PRELOAD;
      if(inside||near&&(root||window.libraryMayBuild?.()!==false))activate();
      else if(root&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==root&&!(cases.get(b.userData.kind)?.group===b.parent)))unload();
      if(!root)return;
      for(const b of books){const i=b.userData.tower;if(i!=null&&b.parent!==root&&!towers[i].slumped)slump(i)}
      for(let s=slumps.length-1;s>=0;s--){const sl=slumps[s],k=Math.min(1,(time-sl.start)/.5),e=k*k*(3-2*k);
        for(const g of sl.goal){for(const key of ['x','y','z','rx','ry','rz'])g.b[key]=g.from[key]+(g[key]-g.from[key])*e}
        setMatrices(sl.from,sl.to);if(k>=1)slumps.splice(s,1)}
      if(!done&&books.length&&sortedCount()>=books.length)finish();
    }
    buildDoor();
    return {contains,floorAt,allowed,interact,update,enter,leave,activate,unload,accepts,atExit,count,sortedCount,door:DOOR,room:ROOM,kinds:KINDS,cases:CASES,towers,
      get built(){return !!root},get books(){return books.slice()},get done(){return done},zoneAt:(x,z)=>contains(x,z)?'uncatalogued':null};
  };
})();
