// The Canadian Room: a log room for the writers of Canada, through a door in the Burns Room's north wall, past the
// fiddle (Scots went to Canada in their tens of thousands, and Robert Service grew up in Ayrshire). Squared logs
// under a plank ceiling, a box stove, a birchbark canoe hung from the beams, and in the north wall a window on a frozen
// lake under the northern lights. Novels and stories on the west wall, from Anne's Island to the prairies; the poets
// either side of the window; on the east, the settlers, the travellers and the country itself.
//
// The room's secret is Sam McGee's: open the stove and there he sits, cool and calm, in the heart of the fire, and asks
// for the door to be closed; and on the woodbox lies The Spell of the Yukon. Once seen it stays found
// (athenaeum-canada-sam-mcgee; ?mcgee shows it). From 1 to 11 November a wreath of poppies hangs inside the door, for
// John McCrae (?poppies shows it). Like the other rooms behind doors, nothing is built until the reader walks up to it,
// and it is freed a little while after they leave.
(function(){
  'use strict';

  // The library's own copies that stand here too, first on the shelf of stories: Anne of Green Gables.
  const OWN=[45];
  // Three shelves. Their books are the new arrivals for each (data/new-books.js, rooms canada-*), after any listed here.
  const GROUPS=[
    {key:'stories',name:'NOVELS AND STORIES',sub:'From the Island to the prairies',wall:'west',along:-.3,length:10,max:12,ids:OWN},
    {key:'north',name:'THE BUSH AND THE NORTH',sub:'Settlers, travellers and the country itself',wall:'east',along:-.3,length:10,max:12,ids:[]},
    {key:'poets',name:'THE POETS',sub:'From the Yukon to Flanders',wall:'north',along:-4.6,length:4.2,max:8,ids:[]}
  ];
  const CARDS={
    sign:['The Canadian Room','The writers of Canada, from the Island to the Yukon: novels and stories, the poets, and the settlers and travellers who wrote the country down. A mari usque ad mare, from sea to sea.'],
    window:['The window','A frozen lake under the northern lights, black spruce along the far shore, and not a light anywhere but the sky’s. The Cree and the Ojibwe, among others, have their own stories of what the lights are.'],
    canoe:['A birchbark canoe','Bark from the paper birch, sewn with spruce root and sealed with spruce gum over cedar ribs. The peoples of the northern woods built them long before Europeans came, and the fur trade went from Montreal to the far North-West in them.'],
    snowshoes:['Snowshoes','Ash frames laced with rawhide, the long kind made for open country. Without them no one crossed the northern woods in winter.'],
    blanket:['A point blanket','A wool blanket, cream with stripes of green, red, yellow and indigo, of the kind the Hudson’s Bay Company traded for furs. The short black lines at its edge, the points, give its size.'],
    stove:['A box stove','A cast-iron stove, roaring. Somebody has stoked it right up; the iron ticks with the heat, and behind the little door something seems to be moving.'],
    woodbox:['The woodbox','Split spruce and birch, enough for the night.'],
    table:['A table','Pine boards, scrubbed white, with a lamp over them.'],
    poppies:['A wreath of poppies','“In Flanders fields the poppies blow / Between the crosses, row on row.” John McCrae, a doctor from Guelph, Ontario, wrote it at Ypres in May 1915, the day after he buried a friend; he died of pneumonia in France in January 1918. The wreath hangs here until the eleventh of November.']
  };
  // The poem's own words, checked against the text of The Spell of the Yukon by a test (canada.test.cjs).
  const MCGEE={
    opening:'There are strange things done in the midnight sun / By the men who moil for gold;',
    stove:'And there sat Sam, looking cool and calm, in the heart of the furnace roar; / And he wore a smile you could see a mile, and he said: “Please close that door. / It’s fine in here, but I greatly fear you’ll let in the cold and storm— / Since I left Plumtree, down in Tennessee, it’s the first time I’ve been warm.”'
  };
  // The poppies hang from 1 to 11 November, by the reader's own date.
  const remembrance=date=>date.getMonth()===10&&date.getDate()<=11;

  window.createCanadaRoom=function(options){
    const {THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,arrivals={},showNotice,playSample,move,analytics,isHolding=()=>false,registerSeat=null,doorKit=null,storage=window.localStorage,
      now=()=>new Date(),burnsRoom={cx:500,cz:-300,w:15,d:13}}=options;
    // At the east end of the Burns Room's north wall, past the hearth and the fiddle, facing into the Burns Room.
    const DOOR={x:burnsRoom.cx+4.5,z:burnsRoom.cz-burnsRoom.d/2+.2,yaw:0};
    const ROOM={cx:500,cz:-580,w:15,d:13,h:4.2};
    const PRELOAD=7,KEEP=25;
    // The log room's side of the door: planked, painted barn red.
    const DOOR_LOOK={style:'painted',color:0x5a1f19,planked:true,fanColor:0xffd08a,width:1.8,height:2.9};
    const through=(data,go)=>doorKit&&data.kit?doorKit.pass(data.kit,data,go):go();
    const FOUND_KEY='athenaeum-canada-sam-mcgee';
    const search=()=>{try{return location.search||''}catch(e){return ''}};
    const wasFound=()=>{try{return storage?.getItem(FOUND_KEY)==='1'||/[?&]mcgee\b/.test(search())}catch(e){return false}};
    const poppiesOut=()=>/[?&]poppies\b/.test(search())||remembrance(now());
    let root=null,time=0,lastNeeded=-1e9,stove=null,aurora=null;
    const owned=[],ours=[],books=[],blockers=[];
    const own=thing=>{owned.push(thing);return thing};
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    // The door in the Burns Room stays when this room is freed, so its parts are not among the room's own.
    function markDoor(object,data){object.userData=data;interactables.push(object);return object}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const card=key=>({type:'canada-card',title:CARDS[key][0],author:CARDS[key][1],action:'READ'});
    function sign(parent,text,sub,w,h,x,y,z){
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle='#ece2c8';c.fillRect(0,0,W,H);c.strokeStyle='#7a2a22';c.lineWidth=4;c.strokeRect(7,7,W-14,H-14);
        // A border of the point blanket's stripes along the top and bottom.
        const stripes=['#2f6b45','#b8322a','#e0b23a','#2a3a6e'];stripes.forEach((s,i)=>{c.fillStyle=s;c.fillRect(7,9+i*3,W-14,3);c.fillRect(7,H-21+i*3,W-14,3)});
        c.fillStyle='#24201a';c.textAlign='center';c.font='bold 29px Georgia';c.fillText(text,W/2,sub?54:H/2+11);if(sub){c.font='italic 21px Georgia';c.fillText(sub,W/2,85)}},620,sub?104:70));
      return add(own(new THREE.PlaneGeometry(w,h)),own(new THREE.MeshStandardMaterial({map,emissive:0x3a3226,emissiveIntensity:.25,roughness:.9})),x,y,z,parent);
    }

    // The books for each shelf: those listed, then the new arrivals; a book the library does not hold is left out.
    const shelfBooks=(ids,room,max)=>[...new Set([...ids,...(arrivals[room]||[])])].map(id=>findBook(id)).filter(Boolean).slice(0,max);
    function catalogue(){return {groups:GROUPS.map(group=>({...group,books:shelfBooks(group.ids,group.key,group.max)})),sourdough:shelfBooks([],'sourdough',1)}}

    // ---------- the door, in the Burns Room ----------
    function buildDoor(){
      const g=new THREE.Group();g.name='canada-door';g.position.set(DOOR.x,0,DOOR.z);g.rotation.y=DOOR.yaw;scene.add(g);
      const data={type:'canada-door',title:'The Canadian Room',author:'Where so many from these parts went: the writers of Canada, in a log room under the northern lights.',action:'ENTER'};
      if(!doorKit?.hang(g,{data,mark:markDoor,...DOOR_LOOK,...doorKit.readingRoom?.('THE CANADIAN ROOM','A mari usque ad mare')}))markDoor(add(new THREE.BoxGeometry(1.8,2.9,.14),new THREE.MeshStandardMaterial({color:DOOR_LOOK.color,roughness:.7}),0,1.45,.08,g),data);
    }

    // ---------- the room ----------
    function buildRoom(){
      root=new THREE.Group();root.name='canada-room';const {cx,cz,w,d,h}=ROOM;
      // Squared logs, chinked with lime, a floor of wide pine boards, and dark beams under a plank ceiling.
      const logs=own(canvasTexture((c,W,H)=>{for(let y=0,i=0;y<H;y+=64,i++){const g=c.createLinearGradient(0,y,0,y+64);g.addColorStop(0,'#5e4128');g.addColorStop(.5,['#80583a','#7a5436','#86603e'][i%3]);g.addColorStop(1,'#5a3d25');c.fillStyle=g;c.fillRect(0,y,W,58);
        c.fillStyle='#cfc4a8';c.fillRect(0,y+58,W,6);c.strokeStyle='rgba(40,26,14,.35)';c.lineWidth=1;for(let k=0;k<6;k++){c.beginPath();c.moveTo(0,y+10+k*8);c.bezierCurveTo(W*.3,y+12+k*8,W*.6,y+6+k*8,W,y+10+k*8);c.stroke()}}},256,256));
      logs.wrapS=logs.wrapT=THREE.RepeatWrapping;logs.repeat?.set?.(w/3,h/1.2);
      const boards=own(canvasTexture((c,W,H)=>{for(let x=0,i=0;x<W;x+=48,i++){c.fillStyle=['#9a7650','#a07a52','#93704a','#9c784e'][i%4];c.fillRect(x,0,46,H);c.fillStyle='#4a3420';c.fillRect(x+46,0,2,H)}},384,384));
      boards.wrapS=boards.wrapT=THREE.RepeatWrapping;boards.repeat?.set?.(w/4,d/4);
      const wall=own(new THREE.MeshStandardMaterial({color:0xb08a68,map:logs,roughness:.95})),dark=own(new THREE.MeshStandardMaterial({color:0x3a2a1c,roughness:.8}));
      box(w,.3,d,own(new THREE.MeshStandardMaterial({color:0xb8936a,map:boards,roughness:.9})),cx,-.15,cz,root);box(w,.2,d,dark,cx,h+.1,cz,root);
      box(w,h,.3,wall,cx,h/2,cz-d/2,root);box(w,h,.3,wall,cx,h/2,cz+d/2,root);box(.3,h,d,wall,cx-w/2,h/2,cz,root);box(.3,h,d,wall,cx+w/2,h/2,cz,root);
      for(let z=cz-d/2+1.6;z<cz+d/2;z+=2.6)box(w-.3,.28,.3,dark,cx,h-.14,z,root);
      mark(sign(root,'THE CANADIAN ROOM','A mari usque ad mare · from sea to sea',3.4,.56,cx,h-.5,cz-d/2+.17),card('sign'));
      buildWindow(cx,cz-d/2);
      // The shelves: two rows on each run, under its own label; the poets' on the north wall, left of the window.
      const {groups,sourdough}=catalogue(),geometry=own(new THREE.BoxGeometry(.72,.96,.13)),ROWS=[1.4,2.55];
      for(const group of groups){
        const per=Math.max(1,Math.ceil(group.books.length/2)),step=Math.min(1.25,(group.length-.4)/per);
        group.books.forEach((book,i)=>{const row=i<per?0:1,n=row?group.books.length-per:per,col=row?i-per:i,offset=(col-(n-1)/2)*step;
          placeBook(book,{...shelfSpot(group,offset),y:ROWS[row]},geometry,group.key)});
        const s=shelfSpot(group,0,.35),label=sign(root,group.name,group.sub,2.9,.46,0,3.45,0);
        if(group.wall==='north'){for(const y of ROWS)box(group.length,.05,.36,dark,s.x,y-.5,s.z,root);block(s.x,s.z,group.length+.2,.7);label.position.set(s.x,3.45,cz-d/2+.17)}
        else{for(const y of ROWS)box(.36,.05,group.length,dark,s.x,y-.5,s.z,root);block(s.x,s.z,.7,group.length+.2);const side=group.wall==='west'?-1:1;label.position.set(cx+side*(w/2-.17),3.45,s.z);label.rotation.y=-side*Math.PI/2}
        mark(label,{type:'canada-card',title:group.name.charAt(0)+group.name.slice(1).toLowerCase(),author:group.sub+'.',action:'READ'});
      }
      buildStove(cx+4.3,cz-d/2+2.1,sourdough[0]||null);
      buildTable(cx,cz+.6);
      buildCanoe(cx,cz+3.3);
      // Snowshoes crossed on the wall left of the door.
      const shoes=new THREE.Group();shoes.position.set(cx-2.6,2.1,cz+d/2-.2);shoes.rotation.y=Math.PI;root.add(shoes);
      const ash=own(new THREE.MeshStandardMaterial({color:0xc9a878,roughness:.7})),lacing=own(new THREE.MeshStandardMaterial({color:0xe2d6b8,roughness:.9,transparent:true,map:own(canvasTexture((c,W,H)=>{c.clearRect(0,0,W,H);c.strokeStyle='#e2d6b8';c.lineWidth=3;for(let k=-H;k<W+H;k+=14){c.beginPath();c.moveTo(k,0);c.lineTo(k+H,H);c.stroke();c.beginPath();c.moveTo(k+H,0);c.lineTo(k,H);c.stroke()}},128,128))}));
      for(const tilt of [-.35,.35]){const shoe=new THREE.Group();shoe.rotation.z=tilt;shoes.add(shoe);const frame=add(own(new THREE.TorusGeometry(.5,.025,6,24)),ash,0,0,0,shoe);frame.scale.set(.42,1.5,1);
        const web=add(own(new THREE.CircleGeometry(.48,20)),lacing,0,0,.01,shoe);web.scale.set(.4,1.45,1);mark(frame,card('snowshoes'));mark(web,card('snowshoes'))}
      if(poppiesOut())buildWreath(cx+2.4,1.95,cz+d/2-.18);
      // One lamp, over the table; the stove glows without a light of its own.
      const lamp=new THREE.PointLight(0xffc68a,6.5,16,2);lamp.position.set(cx,h-1.2,cz+.6);root.add(lamp);
      add(own(new THREE.CylinderGeometry(.12,.18,.3,10)),own(new THREE.MeshStandardMaterial({color:0x3a2e22,emissive:0xffb060,emissiveIntensity:.9,roughness:.6})),cx,h-1.05,cz+.6,root);
      add(own(new THREE.CylinderGeometry(.01,.01,.85,4)),MAT.brass||dark,cx,h-.47,cz+.6,root);
      // The door back to the Burns Room.
      const exit={type:'canada-exit',title:'Back to the Burns Room',author:'Across the Atlantic again, the way the emigrant ships came.',action:'RETURN'};
      if(!doorKit?.hang(root,{data:exit,mark,x:cx,z:cz+d/2-.2,yaw:Math.PI,label:'THE BURNS ROOM',own,...DOOR_LOOK}))mark(box(1.8,2.9,.16,own(new THREE.MeshStandardMaterial({color:DOOR_LOOK.color,roughness:.7})),cx,1.45,cz+d/2-.2,root),exit);
      scene.add(root);
    }
    // Where a shelf's books stand: along its wall, a distance from its middle, facing into the room.
    function shelfSpot(group,offset,inset=.3){
      const {cx,cz,w,d}=ROOM;
      if(group.wall==='north')return {x:cx+group.along+offset,z:cz-d/2+inset,yaw:0};
      const side=group.wall==='west'?-1:1;return {x:cx+side*(w/2-inset),z:cz+group.along-side*offset,yaw:-side*Math.PI/2};
    }
    // The window in the north wall: a frozen lake under the northern lights. The view is one painted texture; the lights
    // are a second, drawn over it, that drift and brighten and fade.
    function buildWindow(x,wallZ){
      const view=own(canvasTexture((c,W,H)=>{
        const sky=c.createLinearGradient(0,0,0,H*.62);sky.addColorStop(0,'#030712');sky.addColorStop(1,'#0c1a2a');c.fillStyle=sky;c.fillRect(0,0,W,H);
        c.fillStyle='#dfe8f5';for(let i=0;i<90;i++){const sx=(i*137)%W,sy=(i*71)%(H*.55),r=i%7?0.8:1.5;c.globalAlpha=.4+(i%5)*.12;c.beginPath();c.arc(sx,sy,r,0,7);c.fill()}c.globalAlpha=1;
        // The far shore: a ragged line of black spruce.
        c.fillStyle='#04070b';c.beginPath();c.moveTo(0,H*.62);for(let sx=0;sx<=W;sx+=6){const tall=((sx*7)%23)/23;c.lineTo(sx,H*.62-6-tall*26);c.lineTo(sx+3,H*.62-2)}c.lineTo(W,H*.66);c.lineTo(0,H*.66);c.fill();
        // The lake, frozen and snowed over, with the sky's green faint on it.
        const ice=c.createLinearGradient(0,H*.64,0,H);ice.addColorStop(0,'#2b4a4a');ice.addColorStop(1,'#cfd8e0');c.fillStyle=ice;c.fillRect(0,H*.65,W,H*.35);
        c.strokeStyle='rgba(255,255,255,.25)';for(let i=0;i<8;i++){c.beginPath();c.moveTo((i*91)%W,H*(.72+i*.03));c.lineTo((i*91)%W+60,H*(.72+i*.03)+4);c.stroke()}
      },512,256));
      const lights=own(canvasTexture((c,W,H)=>{
        c.clearRect(0,0,W,H);
        for(const [base,amp,colour,width] of [[.3,.12,'rgba(80,255,150,',.16],[.22,.08,'rgba(60,220,170,',.1],[.38,.1,'rgba(170,90,220,',.07]])
          for(let sx=0;sx<W;sx+=2){const y=H*(base+amp*Math.sin(sx/W*Math.PI*3.1+base*10)+.04*Math.sin(sx/W*Math.PI*11)),g=c.createLinearGradient(0,y-H*width*2.2,0,y);g.addColorStop(0,colour+'0)');g.addColorStop(.8,colour+'.55)');g.addColorStop(1,colour+'0)');c.fillStyle=g;c.fillRect(sx,y-H*width*2.2,2,H*width*2.2)}
      },512,256));
      lights.wrapS=THREE.RepeatWrapping;
      const g=new THREE.Group();g.position.set(x,2.1,wallZ+.16);root.add(g);
      const glass=add(own(new THREE.PlaneGeometry(3.2,1.9)),own(new THREE.MeshBasicMaterial({map:view})),0,0,0,g);
      const glow=own(new THREE.MeshBasicMaterial({map:lights,transparent:true,opacity:.8,depthWrite:false,blending:THREE.AdditiveBlending}));
      add(own(new THREE.PlaneGeometry(3.2,1.9)),glow,0,.05,.005,g);
      const frame=own(new THREE.MeshStandardMaterial({color:0xe9e2cf,roughness:.6}));
      for(const [fw,fh,px,py] of [[3.4,.1,0,1],[3.4,.1,0,-1],[.1,2.1,-1.65,0],[.1,2.1,1.65,0],[.05,1.9,-.55,0],[.05,1.9,.55,0],[3.2,.05,0,0]])box(fw,fh,.06,frame,px,py,.03,g);
      box(3.5,.06,.32,frame,0,-1.06,.14,g);
      mark(glass,card('window'));
      aurora={lights,glow};
      // A window seat under it, with a point blanket over it: one of the library's seats.
      const seat=box(2.8,.12,.6,own(new THREE.MeshStandardMaterial({color:0x6a4a30,roughness:.8})),x,.45,wallZ+.5,root);box(2.8,.4,.05,own(new THREE.MeshStandardMaterial({color:0x3a2a1c,roughness:.8})),x,.2,wallZ+.78,root);
      const stripes=own(canvasTexture((c,W,H)=>{c.fillStyle='#efe6d0';c.fillRect(0,0,W,H);[['#2f6b45',20],['#b8322a',44],['#e0b23a',68],['#2a3a6e',92]].forEach(([s,y])=>{c.fillStyle=s;c.fillRect(0,y,W,16)});c.fillStyle='#1a1410';for(let i=0;i<4;i++)c.fillRect(14+i*14,6,4,10)},256,128));
      const blanket=box(1.5,.04,.62,own(new THREE.MeshStandardMaterial({map:stripes,roughness:.95})),x+.5,.53,wallZ+.5,root);mark(blanket,card('blanket'));
      block(x,wallZ+.5,3,.8);
      if(registerSeat){const anchor=new THREE.Group();anchor.position.set(x,0,wallZ+.5);anchor.rotation.y=Math.PI;root.add(anchor);
        const data=registerSeat([seat],anchor,new THREE.Vector3(0,1.2,-.05),Math.PI,{title:'The window seat',author:'Sit under the northern lights and read one of the Canadian Room’s books.'});
        Object.defineProperty(data,'bookIds',{get:()=>books.map(mesh=>mesh.userData.book.id),configurable:true});ours.push(seat)}
    }
    // The box stove, its pipe up through the ceiling, and the woodbox beside it. Its door glows; opened, there is Sam.
    function buildStove(x,z,book){
      const iron=own(new THREE.MeshStandardMaterial({color:0x1d1b1a,roughness:.55,metalness:.4}));
      const body=box(1.1,.6,.62,iron,x,.62,z,root);box(1.2,.05,.7,iron,x,.94,z,root);
      for(const lx of [-.48,.48])for(const lz of [-.24,.24])box(.07,.32,.07,iron,x+lx,.16,z+lz,root);
      add(own(new THREE.CylinderGeometry(.09,.09,ROOM.h-.97,10)),iron,x+.3,(ROOM.h+.97)/2,z,root);
      const glowMat=own(new THREE.MeshStandardMaterial({color:0x3a1208,emissive:0xff6a20,emissiveIntensity:1.5,roughness:.8}));
      const door=box(.36,.3,.04,glowMat,x-.15,.62,z+.32,root);
      for(const part of [body,door])mark(part,{type:'canada-stove',title:CARDS.stove[0],author:CARDS.stove[1],action:'OPEN'});
      block(x,z,1.5,1);
      // The woodbox, between the stove and the east wall's shelves.
      const wood=own(new THREE.MeshStandardMaterial({color:0x6a4a2e,roughness:.85})),bark=own(new THREE.MeshStandardMaterial({color:0xd9d0bc,roughness:.9}));
      const wx=x+1.45,wz=z-.35,crate=box(.75,.55,.6,wood,wx,.28,wz,root);mark(crate,card('woodbox'));
      for(let i=0;i<5;i++){const log=add(own(new THREE.CylinderGeometry(.06,.06,.55,7)),i%2?bark:wood,wx-.24+i*.12,.6,wz,root);log.rotation.x=Math.PI/2}
      block(wx,wz,.85,.7);
      let mesh=null;
      if(book){mesh=add(own(new THREE.BoxGeometry(.3,.04,.42)),own(bookMaterial(book)),wx,.68,wz,root);mesh.rotation.order='YXZ';mesh.rotation.y=-.3;mesh.visible=false;
        mesh.userData={type:'book',book,loaded:false,canada:true,shelf:'sourdough',home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:root}}}
      stove={body,door,glowMat,book:mesh,found:false,open:0};
      if(wasFound())reveal(true);
    }
    // The table, scrubbed pine, with two chairs at its ends: the library's own seats.
    function buildTable(x,z){
      const pine=own(new THREE.MeshStandardMaterial({color:0x9a7a54,roughness:.75}));
      const top=box(2.4,.08,1.1,pine,x,.96,z,root);for(const sx of [-1.05,1.05])for(const sz of [-.42,.42])box(.08,.92,.08,MAT.darkWood||pine,x+sx,.46,z+sz,root);block(x,z,2.6,1.3);mark(top,card('table'));
      for(const side of [-1,1]){
        const cxp=x+side*1.65,chair=new THREE.Group();chair.position.set(cxp,0,z);chair.rotation.y=side*Math.PI/2;root.add(chair);
        const seat=box(.55,.06,.52,pine,0,.46,0,chair),back=box(.55,.6,.05,pine,0,.8,.24,chair);for(const lx of [-.23,.23])for(const lz of [-.22,.22])box(.05,.44,.05,MAT.darkWood||pine,lx,.22,lz,chair);block(cxp,z,.7,.7);
        if(registerSeat){const data=registerSeat([seat,back],chair,new THREE.Vector3(0,1.2,.05),side*Math.PI/2,{title:'A chair at the table',author:'Sit and read one of the Canadian Room’s books.'});
          Object.defineProperty(data,'bookIds',{get:()=>books.map(mesh=>mesh.userData.book.id),configurable:true});ours.push(seat,back)}
      }
    }
    // A birchbark canoe hung on ropes from the beams over the way in, its high stems at either end.
    let canoeWood=null;
    function buildCanoe(x,z){
      canoeWood=null;
      const birch=own(canvasTexture((c,W,H)=>{c.fillStyle='#d8c9a6';c.fillRect(0,0,W,H);c.fillStyle='#3a2a1a';for(let i=0;i<40;i++){c.fillRect((i*53)%W,(i*29)%H,10+(i%4)*6,2)}c.fillStyle='#5a4028';for(let sx=W/6;sx<W;sx+=W/6)c.fillRect(sx,0,3,H)},256,64));
      const g=new THREE.Group();g.position.set(x,3.45,z);root.add(g);
      const hull=add(own(new THREE.SphereGeometry(1,20,8,0,Math.PI*2,Math.PI/2,Math.PI/2)),own(new THREE.MeshStandardMaterial({map:birch,roughness:.85,side:THREE.DoubleSide})),0,0,0,g);hull.scale.set(2.6,.5,.48);
      for(const end of [-1,1]){const stem=box(.05,.42,.1,gunwaleMat(),end*2.5,.12,0,g);stem.rotation.z=-end*.5}
      const gunwale=gunwaleMat();
      const rim=add(own(new THREE.TorusGeometry(1,.03,4,32)),gunwale,0,0,0,g);rim.rotation.x=Math.PI/2;rim.scale.set(2.6,.48,1);
      for(const tx of [-1.2,0,1.2])box(.06,.03,(.48*Math.sqrt(1-(tx/2.6)**2))*2,gunwale,tx,0,0,g);
      for(const tx of [-1.6,1.6])add(own(new THREE.CylinderGeometry(.01,.01,ROOM.h-3.45,4)),gunwale,tx,(ROOM.h-3.45)/2,0,g);
      mark(hull,card('canoe'));
      function gunwaleMat(){return canoeWood||(canoeWood=own(new THREE.MeshStandardMaterial({color:0x8a6a44,roughness:.7})))}
    }
    // From 1 to 11 November, a wreath of poppies inside the door.
    function buildWreath(x,y,z){
      const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=Math.PI;root.add(g);
      const leaf=own(new THREE.MeshStandardMaterial({color:0x2c4a2a,roughness:.8})),red=own(new THREE.MeshStandardMaterial({color:0xc4161c,roughness:.6})),black=own(new THREE.MeshStandardMaterial({color:0x111111,roughness:.6}));
      const ring=add(own(new THREE.TorusGeometry(.3,.06,8,24)),leaf,0,0,0,g);mark(ring,card('poppies'));
      for(let i=0;i<10;i++){const a=i/10*Math.PI*2,p=add(own(new THREE.CircleGeometry(.07,10)),red,Math.cos(a)*.3,Math.sin(a)*.3,.07,g);mark(p,card('poppies'));add(own(new THREE.CircleGeometry(.025,8)),black,Math.cos(a)*.3,Math.sin(a)*.3,.075,g)}
    }
    function reveal(quiet){
      if(!stove||stove.found)return;stove.found=true;
      const data={type:'canada-card',title:'The box stove',author:'Closed again, as he asked. It is still roaring, and nobody else in here is complaining of the cold.',action:'READ'};
      stove.body.userData=data;stove.door.userData=data;
      if(stove.book){stove.book.visible=true;interactables.push(stove.book);ours.push(stove.book);books.push(stove.book)}
      if(!quiet)stove.open=1;
    }
    function placeBook(book,spot,geometry,shelf){
      const mesh=add(geometry,own(bookMaterial(book)),spot.x,spot.y,spot.z,root);mesh.rotation.order='YXZ';mesh.rotation.y=spot.yaw;mesh.rotation.x=-.08;
      mesh.userData={type:'book',book,loaded:false,canada:true,shelf,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:root}};
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
      activate();move(ROOM.cx,ROOM.cz+ROOM.d/2-1.4,0);playSample?.('doorOpen',.8,.92);
      showNotice('The Canadian Room. Novels and stories on the left, the bush and the North on the right, the poets by the window; and the northern lights over the lake.',10);
      analytics?.track('Room Explored',{room:'canada-room'});
    }
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('canada-'))return false;
      if(data.type==='canada-door'){through(data,enter);return true}
      if(data.type==='canada-exit'){through(data,()=>{move(DOOR.x+Math.sin(DOOR.yaw)*1.9,DOOR.z+Math.cos(DOOR.yaw)*1.9,DOOR.yaw+Math.PI);playSample?.('doorOpen',.8,1);showNotice('The Burns Room again.',3)});return true}
      if(data.type==='canada-stove'){
        reveal(false);try{storage?.setItem(FOUND_KEY,'1')}catch(e){}
        showNotice(`You open the stove door, and there in the heart of the fire is a man from Tennessee. ${MCGEE.stove} You close it. On the woodbox there is a book.`,16);
        analytics?.track('Secret Found',{secret:'canada-sam-mcgee'});return true;
      }
      if(data.type==='canada-card'){showNotice(`${data.title}: ${data.author}`,10);return true}
      return false;
    }

    // ---------- lifecycle ----------
    function activate(){if(!root)buildRoom();lastNeeded=time}
    function unload(){
      // Its lamp is marked freed, so the light budget lets it go.
      if(!root)return;root.removeFromParent();root.traverse(object=>{if(object.isLight)object.userData.freed=true});root=null;stove=null;aurora=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0;
    }
    function update(t){
      const dt=Math.min(.1,Math.max(0,t-time));time=t;const inside=contains(player.pos.x,player.pos.z),near=Math.hypot(player.pos.x-DOOR.x,player.pos.z-DOOR.z)<PRELOAD;
      if(inside||near)activate();
      else if(root&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==root))unload();
      if(!inside)return;
      // The stove roars, and blazes for a moment when its door has been opened.
      if(stove){stove.open=Math.max(0,stove.open-dt/3);stove.glowMat.emissiveIntensity=1.3+.35*Math.sin(t*8.3)*Math.sin(t*3.1)+stove.open*2.5}
      // The lights drift along the sky and swell and fade.
      if(aurora){if(aurora.lights.offset)aurora.lights.offset.x=(t*.006)%1;aurora.glow.opacity=.55+.3*Math.sin(t*.37)*Math.sin(t*.13+1)}
    }
    buildDoor();
    return {contains,floorAt,allowed,interact,update,enter,activate,unload,catalogue,door:DOOR,room:ROOM,groups:GROUPS,mcgee:MCGEE,cards:CARDS,remembrance,
      get built(){return !!root},get books(){return books.slice()},get mcgeeSeen(){return !!stove?.found},get poppies(){return poppiesOut()},zoneAt:(x,z)=>contains(x,z)?'canada-room':null};
  };
})();
