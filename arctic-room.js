// The Arctic Room: the great cabin of a ship wintering in the ice, through a planked door at the east end of the
// explorers' anteroom's north wall, past the kit on its pegs (exploration.js builds the anteroom; this module hangs its
// door there whenever the anteroom is built). The Antarctic is the polar hut's, across the Southern Ocean from the
// Antipodes; this is the north.
//
// Inside: painted panelling under the deck beams, stern windows on the frozen sea and a sister ship held fast under the
// aurora (painted; no light of its own), a settee beneath them (a seat), the chart table with the Arctic archipelago
// drawn on it and The Frozen Deep lying open, a captain's chair (a seat), the box stove, one hanging lamp (the room's
// one light), and three shelves: the North-West Passage and Franklin's searchers (west), Greenland and the Inuit (east),
// and the way to the Pole (south, either side of the door). Shelves `arctic-*` in data/new-books.js, after the library's
// own Franklin, Hearne, Henson and Nansen (`OWN`).
//
// The Franklin cards put the Inuit at the heart of the story, as it now stands: Rae's news from Inuit hunters in 1854,
// Schwatka's search by asking them, and the finding of Erebus (2014) and Terror (2016) with Inuit knowledge.
//
// The secret is the cairn on the sea chest. Lifting its top stones finds a tin cylinder and in it the Victory Point
// record, the only written word from Franklin's expedition ever found: the printed form of May 1847, "All well", and
// round its margin the note of April 1848. Then M'Clintock's In the Arctic Seas (`arctic-record`), the account of its
// finding, lies on the chest: found once, found for good (athenaeum-arctic-victory-point; ?victorypoint shows it).
// Every word of the record (`RECORD`) is checked against M'Clintock's text (pg37669) by a test.
(function(){
  'use strict';

  const OWN={passage:[18979,38404],inuit:[],pole:[20923,34120]};
  const GROUPS=[
    {key:'arctic-passage',name:'THE NORTH-WEST PASSAGE',sub:'Franklin, and those who went to look for him',wall:'west',along:.6,length:4.6,max:10,ids:OWN.passage},
    {key:'arctic-inuit',name:'GREENLAND AND THE INUIT',sub:'The people of the north, and those who lived among them',wall:'east',along:.6,length:4.6,max:10,ids:OWN.inuit},
    {key:'arctic-pole',name:'TOWARDS THE POLE',sub:'The long way north',wall:'south',along:-2.9,length:3.5,max:8,ids:OWN.pole,part:0},
    {key:'arctic-pole',name:'TOWARDS THE POLE',sub:'The long way north',wall:'south',along:2.9,length:3.5,max:8,ids:[],part:1}
  ];
  // The Victory Point record, as M'Clintock prints it in In the Arctic Seas.
  const RECORD={
    form:'Sir John Franklin commanding the expedition. All well.',
    party:'Party consisting of 2 officers and 6 men left the ships on Monday 24th May, 1847.',
    margin:'H.M. ships ‘Terror’ and ‘Erebus’ were deserted on the 22nd April, 5 leagues N.N.W. of this, having been beset since 12th September, 1846.',
    deaths:'Sir John Franklin died on the 11th June, 1847; and the total loss by deaths in the expedition has been to this date 9 officers and 15 men.',
    fish:'and start (on) to-morrow, 26th, for Back’s Fish River.'
  };
  const r=key=>`“${RECORD[key]}”`;
  const CARDS={
    sign:['The Arctic Room','The great cabin of a ship wintering in the ice, as the ships of the Franklin searches wintered, banked with snow and housed over, with the stove going and the lamp lit. The library has filled it with the books of the north.'],
    franklin:['What became of Franklin','Sir John Franklin sailed in May 1845 with the Erebus and the Terror and a hundred and twenty-nine men to make the North-West Passage, and none of them came back. In 1854 John Rae heard from Inuit hunters at Pelly Bay that a party of white men had starved far to the west, and bought from them things that had been the expedition’s; London did not want to believe what he reported of the end. In 1859 M’Clintock’s men found the one written record, and remains along the coast of King William Island. The Inuit had seen the last of the expedition and remembered it, and the searchers did not always listen; Schwatka, in 1879, did. The Erebus was found in 2014 where Inuit accounts had placed a ship, with the help of the oral histories the Inuk historian Louie Kamookak had spent his life gathering; the Terror in 2016, in Terror Bay, after an Inuk hunter, Sammy Kogvik, told of a mast he had once seen standing out of the ice. The wrecks are a National Historic Site, cared for by Parks Canada with the Inuit.'],
    windows:['The stern windows','The frozen sea under the aurora, pressure ridges, and a sister ship held fast a cable or two astern, housed over for the winter. Painted for the library.'],
    chart:['The chart table','The Arctic archipelago north of Canada, as the searchers charted it in the 1850s: Lancaster Sound, Barrow Strait, Peel Sound and Victoria Strait, and King William Island, where the ships were lost. Their courses are drawn in, and where nobody had been is left blank.'],
    stove:['The stove','A cast-iron box stove, the heart of a wintering ship. Coal was counted by the bag, and the cabin was kept just above freezing.'],
    lamp:['The lamp','One lamp, burning whale oil or tallow, for the whole long winter night.'],
    cairn:['A cairn','A small cairn of limestone, built as the expedition’s men built theirs, to hold a message. Explorers left records in cairns and looked for them in other people’s.'],
    cairnFound:['The Victory Point record',`A printed Admiralty form, of the kind put in bottles and thrown overboard to learn the currents, filled in by Lieutenant Graham Gore on 28 May 1847: ${r('form')} ${r('party')} Round its margin, on 25 April 1848, Captain Crozier and Captain Fitzjames wrote: ${r('margin')} ${r('deaths')} And, squeezed in at the end, ${r('fish')} None of them reached it. William Hobson, of M’Clintock’s Fox, found the cylinder in a cairn at Victory Point on King William Island in May 1859; it is the only written record of the expedition ever found.`],
    table:['The Frozen Deep','Wilkie Collins and Charles Dickens’s play of an Arctic expedition lost in the ice, written after John Rae’s news, and played in 1857 with Dickens in the lead. Collins later made it into a story, and that is what lies open here.']
  };
  const FOUND_KEY='athenaeum-arctic-victory-point';

  window.createArcticRoom=function(options){
    const {THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,arrivals={},showNotice,playSample,sound=null,move,analytics,isHolding=()=>false,
      registerSeat=null,doorKit=null,anteroom=null,storage=null,search=''}=options;
    // The anteroom's north wall is at z 315.5 (exploration.js: ANTE {cx:1320,cz:320,w:12,d:9}); the door stands at its east
    // end, past the kit pegs (which run to x 1324.2) and the storm lantern.
    const DOOR={x:1325.05,z:315.67,yaw:0};
    const ROOM={cx:1320,cz:262,w:10,d:7,h:2.8};
    const PRELOAD=6,KEEP=25;
    const DOOR_LOOK={style:'painted',color:0x2f3d45,frame:0x6b5a44,planked:true,fanlight:false,cornice:false,width:1.25,height:2.45};
    const through=(data,go)=>doorKit&&data.kit?doorKit.pass(data.kit,data,go):go();
    const wasFound=()=>{try{return storage?.getItem(FOUND_KEY)==='1'||/[?&](victorypoint|victory-point|record)\b/.test(search)}catch(e){return false}};
    let root=null,time=0,lastNeeded=-1e9,stove=null,cairn=null,chest=null,door=null;
    const owned=[],ours=[],books=[],blockers=[],seatIds=[];
    const own=thing=>{owned.push(thing);return thing};
    const std=params=>own(new THREE.MeshStandardMaterial(params));
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const card=key=>({type:'arctic-card',title:CARDS[key][0],author:CARDS[key][1],action:'READ'});
    function sign(parent,text,sub,w,h,x,y,z){
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle='#e9e1cc';c.fillRect(0,0,W,H);c.strokeStyle='#26343c';c.lineWidth=3;c.strokeRect(7,7,W-14,H-14);
        c.fillStyle='#1d2a31';c.textAlign='center';c.font='bold 28px Georgia';c.fillText(text,W/2,sub?52:H/2+10);if(sub){c.font='italic 19px Georgia';c.fillText(sub,W/2,83)}},640,sub?104:70));
      return add(own(new THREE.PlaneGeometry(w,h)),std({map,emissive:0x22262a,emissiveIntensity:.3,roughness:.9}),x,y,z,parent)}
    const shelfBooks=(ids,room,max)=>[...new Set([...ids,...(arrivals[room]||[])])].map(id=>findBook(id)).filter(Boolean).slice(0,max);
    function catalogue(){
      const pole=shelfBooks(OWN.pole,'arctic-pole',16),half=Math.ceil(pole.length/2);
      return {groups:GROUPS.map(group=>({...group,books:group.key==='arctic-pole'?(group.part?pole.slice(half):pole.slice(0,half)):shelfBooks(group.ids,group.key,group.max)})),
        table:shelfBooks([],'arctic-table',1),record:shelfBooks([],'arctic-record',1)}}

    // ---------- the door, in the explorers' anteroom ----------
    // Hung while the anteroom is built, as the back ways' doors are: it goes when the anteroom is freed.
    function hangDoor(){
      if(door)return;const g=new THREE.Group();g.name='arctic-door';g.position.set(DOOR.x,0,DOOR.z);g.rotation.y=DOOR.yaw;scene.add(g);
      const data={type:'arctic-door',title:'The Arctic Room',author:'A planked door at the end of the pegs, with the cold coming under it: the great cabin of a ship wintering in the ice, and the books of the north.',action:'ENTER'};
      const marked=[],markDoor=(object,d)=>{object.userData=d;interactables.push(object);marked.push(object);return object};
      const hung=doorKit?.hang(g,{data,mark:markDoor,label:'THE ARCTIC ROOM',...DOOR_LOOK});
      if(!hung)markDoor(add(new THREE.BoxGeometry(1.25,2.45,.12),new THREE.MeshStandardMaterial({color:DOOR_LOOK.color,roughness:.8}),0,1.22,.06,g),data);
      door={g,marked};
    }
    function dropDoor(){
      if(!door)return;door.g.removeFromParent();for(const m of door.marked){const i=interactables.indexOf(m);if(i>=0)interactables.splice(i,1)}
      door.g.traverse(o=>{o.geometry?.dispose?.()});door=null}

    // ---------- the cabin ----------
    function buildRoom(){
      root=new THREE.Group();root.name='arctic-room';const {cx,cz,w,d,h}=ROOM,x0=cx-w/2,x1=cx+w/2,z0=cz-d/2,z1=cz+d/2;
      // Painted panelling, cream above a dark dado; deck planks; the deck beams overhead.
      const paint=own(canvasTexture((c,W,H)=>{c.fillStyle='#d9d0b8';c.fillRect(0,0,W,H);c.strokeStyle='rgba(90,76,56,.35)';c.lineWidth=3;
        for(let x=0;x<W;x+=128){c.strokeRect(x+10,20,108,H-40);c.strokeRect(x+22,34,84,H-68)}},512,256));
      paint.wrapS=THREE.RepeatWrapping;paint.repeat?.set?.(5,1);
      const wall=std({color:0xb9ae95,map:paint,roughness:.9}),dado=std({color:0x3c2a1c,roughness:.75}),oak=MAT.darkWood||std({color:0x3a2616,roughness:.7}),
        iron=std({color:0x1d1e20,roughness:.55,metalness:.55}),brass=MAT.brass||std({color:0xb08d3a,metalness:.6,roughness:.4}),beam=std({color:0x4a3524,roughness:.85});
      box(w,.3,d,MAT.wood||oak,cx,-.15,cz,root);box(w,.2,d,std({color:0x6f6352,roughness:1}),cx,h+.1,cz,root);
      for(let i=0;i<6;i++)box(.22,.2,d,beam,x0+.9+i*1.65,h-.1,cz,root);
      box(w,h,.3,wall,cx,h/2,z0,root);box(w,h,.3,wall,cx,h/2,z1,root);box(.3,h,d,wall,x0,h/2,cz,root);box(.3,h,d,wall,x1,h/2,cz,root);
      for(const [bx,bz,bw,bd] of [[cx,z0+.18,w,.06],[cx,z1-.18,w,.06],[x0+.18,cz,.06,d],[x1-.18,cz,.06,d]])box(bw,.9,bd,dado,bx,.45,bz,root);
      mark(sign(root,'THE ARCTIC ROOM','The great cabin of a ship wintering in the ice',2.6,.42,cx,h-.42,z1-.17),card('sign')).rotation.y=Math.PI;
      buildWindows(cx,z0,oak);
      buildStove(x1-.85,z0+.8,iron);
      buildChartTable(cx,cz-.25,oak,brass);
      buildChest(x0+1.15,z0+.6,oak,iron);
      buildLamp(cx,h,cz-.25,brass);
      // A framed card on the west wall, north of the shelf: what the Inuit saw, and what the searchers found.
      const franklin=mark(sign(root,'WHAT BECAME OF FRANKLIN','Read the card',1.5,.3,x0+.17,1.85,z0+.75),card('franklin'));franklin.rotation.y=Math.PI/2;
      // The shelves: dark oak, two rows, each under its label.
      const {groups,table,record}=catalogue(),geometry=own(new THREE.BoxGeometry(.5,.7,.1)),ROWS=[1.12,1.98];
      for(const group of groups){
        if(!group.books.length)continue;
        const per=Math.ceil(group.books.length/2),step=Math.min(.82,(group.length-.3)/per);
        group.books.forEach((book,i)=>{const row=i<per?0:1,n=row?group.books.length-per:per,col=row?i-per:i,offset=(col-(n-1)/2)*step;placeBook(book,{...shelfSpot(group,offset),y:ROWS[row]},geometry,group.key)});
        const s=shelfSpot(group,0,.3),rows=group.books.length>per?ROWS:ROWS.slice(0,1),top=rows.at(-1)+.55,label=sign(root,group.name,group.sub,Math.min(2.4,group.length-.2),.34,0,top,0);
        if(group.wall==='south'){for(const y of rows)box(group.length,.04,.3,oak,s.x,y-.37,s.z,root);block(s.x,s.z,group.length+.2,.6);label.position.set(s.x,top,z1-.17);label.rotation.y=Math.PI}
        else{for(const y of rows)box(.3,.04,group.length,oak,s.x,y-.37,s.z,root);block(s.x,s.z,.6,group.length+.2);const side=group.wall==='west'?-1:1;label.position.set(cx+side*(w/2-.17),top,s.z);label.rotation.y=-side*Math.PI/2}
        mark(label,{type:'arctic-card',title:group.name.charAt(0)+group.name.slice(1).toLowerCase(),author:group.sub+'.',action:'READ'});
      }
      seatIds.splice(0,seatIds.length,...books.map(b=>b.userData.book.id));
      // The Frozen Deep, lying open on the chart table.
      if(table[0])placeBook(table[0],{x:cx+.62,y:.86,z:cz-.12,yaw:-.35,tilt:-Math.PI/2},geometry,'arctic-table').scale.set?.(.8,.8,.8);
      if(chest)chest.book=record[0]||null;if(wasFound())reveal(false);
      // The way back to the anteroom.
      const exit={type:'arctic-exit',title:'Back to the explorers’ anteroom',author:'Out past the kit on its pegs, and through the locker to the Map Room.',action:'RETURN'};
      if(!doorKit?.hang(root,{data:exit,mark,x:cx,z:z1-.2,yaw:Math.PI,onward:'towards the Map Room',label:'THE EXPLORERS’ ANTEROOM',own,...DOOR_LOOK}))mark(box(1.25,2.45,.14,oak,cx,1.22,z1-.2,root),exit);
      scene.add(root);
    }
    function shelfSpot(group,offset,inset=.28){
      const {cx,cz,w,d}=ROOM;if(group.wall==='south')return {x:cx+group.along-offset,z:cz+d/2-inset,yaw:Math.PI};
      const side=group.wall==='west'?-1:1;return {x:cx+side*(w/2-inset),z:cz+group.along-side*offset,yaw:-side*Math.PI/2}}
    function placeBook(book,spot,geometry,shelf,parent=root){
      const mesh=add(geometry,own(bookMaterial(book)),spot.x,spot.y,spot.z,parent);mesh.rotation.order='YXZ';mesh.rotation.y=spot.yaw||0;mesh.rotation.x=spot.tilt??-.06;
      mesh.userData={type:'book',book,loaded:false,arctic:true,shelf,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent}};
      interactables.push(mesh);ours.push(mesh);books.push(mesh);return mesh}
    // The stern windows: five lights in a row on the frozen sea, a sister ship housed over a cable astern, the aurora.
    function iceView(c,W,H){
      const sky=c.createLinearGradient(0,0,0,H*.62);sky.addColorStop(0,'#06101c');sky.addColorStop(1,'#1d3550');c.fillStyle=sky;c.fillRect(0,0,W,H*.62);
      let k=11;const r=()=>(k=(k*9301+49297)%233280)/233280;c.fillStyle='rgba(255,255,255,.85)';for(let i=0;i<120;i++)c.fillRect(r()*W,r()*H*.5,1.5,1.5);
      for(const [y,a,col] of [[.16,.3,'90,220,170'],[.26,.22,'120,200,190'],[.1,.15,'160,120,200']]){c.strokeStyle=`rgba(${col},${a})`;c.lineWidth=H*.06;c.beginPath();for(let x=0;x<=W;x+=W/40)c.lineTo(x,H*(y+.05*Math.sin(x/W*7+y*20)));c.stroke()}
      c.fillStyle='#b9c9d6';c.fillRect(0,H*.62,W,H*.38);c.fillStyle='#93a9bb';for(let i=0;i<14;i++){const x=r()*W,y=H*(.62+r()*.3);c.beginPath();c.moveTo(x-W*.05,y+H*.03);c.lineTo(x,y-H*.03);c.lineTo(x+W*.06,y+H*.03);c.fill()}
      // The sister ship: black hull, housed over with a peaked roof of canvas, her masts struck to the lower yards.
      const sx=W*.62,sy=H*.66;c.fillStyle='#121417';c.beginPath();c.moveTo(sx-W*.16,sy);c.lineTo(sx+W*.15,sy);c.lineTo(sx+W*.18,sy-H*.05);c.lineTo(sx-W*.18,sy-H*.06);c.closePath();c.fill();
      c.fillStyle='#d8d2c0';c.beginPath();c.moveTo(sx-W*.15,sy-H*.055);c.lineTo(sx,sy-H*.14);c.lineTo(sx+W*.15,sy-H*.05);c.closePath();c.fill();
      c.strokeStyle='#e8eef2';c.lineWidth=2;for(const mx of [-.09,0,.08]){c.beginPath();c.moveTo(sx+W*mx,sy-H*.12);c.lineTo(sx+W*mx,sy-H*.4);c.stroke();c.beginPath();c.moveTo(sx+W*(mx-.04),sy-H*.3);c.lineTo(sx+W*(mx+.04),sy-H*.3);c.stroke()}
      c.fillStyle='rgba(255,210,140,.9)';c.fillRect(sx-W*.03,sy-H*.03,W*.012,H*.012);
      c.fillStyle='rgba(20,30,45,.65)';c.font=`italic ${Math.round(H*.035)}px Georgia`;c.textAlign='right';c.fillText('painted for the library',W*.98,H*.97)}
    function buildWindows(cx,z0,oak){
      const view=own(canvasTexture(iceView,1024,320)),g=new THREE.Group();g.position.set(cx,1.72,z0+.17);root.add(g);
      const pane=mark(add(own(new THREE.PlaneGeometry(3.8,1.15)),std({map:view,emissive:0xffffff,emissiveMap:view,emissiveIntensity:.5,roughness:.4}),0,0,0,g),card('windows'));
      for(let i=0;i<=5;i++)box(.07,1.25,.06,oak,-1.9+i*.76,0,.03,g);for(const y of [-.6,0,.6])box(3.9,y?.08:.04,.06,oak,0,y,.03,g);
      // The settee under the windows, cushioned: one of the library's seats.
      const s=new THREE.Group();s.position.set(cx,0,z0+.5);root.add(s);const cushion=std({color:0x5a2a26,roughness:1});
      const parts=[box(3.4,.42,.5,oak,0,.21,0,s),box(3.3,.1,.46,cushion,0,.47,0,s),box(3.3,.42,.08,cushion,0,.78,-.2,s)];block(cx,z0+.5,3.5,.65);
      for(const part of parts)ours.push(part);
      registerSeat?.(parts,s,new THREE.Vector3(0,1.15,.1),Math.PI,{title:'The settee under the stern windows',author:'Sit with the ice behind you and read one of the books of the north.',bookIds:seatIds});
    }
    function buildStove(x,z,iron){
      const g=new THREE.Group();g.position.set(x,0,z);root.add(g);const parts=[box(.7,.7,.55,iron,0,.45,0,g),box(.78,.06,.62,iron,0,.82,0,g)];
      for(const [lx,lz] of [[-.3,-.22],[.3,-.22],[-.3,.22],[.3,.22]])box(.06,.12,.06,iron,lx,.06,lz,g);
      const pipe=add(own(new THREE.CylinderGeometry(.08,.08,ROOM.h-.85,10)),iron,0,.85+(ROOM.h-.85)/2,-.1,g);parts.push(pipe);
      const glowMat=std({color:0x2a0c04,emissive:0xff6a1e,emissiveIntensity:1.2,roughness:.9}),glow=box(.36,.2,.02,glowMat,-.0,.42,.28,g);parts.push(glow);
      for(const part of parts)mark(part,card('stove'));block(x,z,.95,.85);stove={glowMat};
    }
    // The chart of the archipelago, on the table: coasts, the searchers' courses, King William Island, blanks.
    function chartTexture(c,W,H){
      c.fillStyle='#e3d6b4';c.fillRect(0,0,W,H);c.strokeStyle='#7a5c34';c.lineWidth=5;c.strokeRect(8,8,W-16,H-16);
      let k=5;const r=()=>(k=(k*9301+49297)%233280)/233280;
      const island=(x,y,rx,ry,name)=>{c.fillStyle='#cdbb92';c.strokeStyle='#5a4426';c.lineWidth=2;c.beginPath();for(let a=0;a<=24;a++){const t=a/24*Math.PI*2,q=1+.18*Math.sin(t*5+x);c.lineTo(W*(x+rx*q*Math.cos(t)),H*(y+ry*q*Math.sin(t)))}c.closePath();c.fill();c.stroke();
        if(name){c.fillStyle='#3a2a16';c.font=`italic ${Math.round(H*.035)}px Georgia`;c.textAlign='center';c.fillText(name,W*x,H*y+4)}};
      island(.2,.22,.1,.1,'Devon I.');island(.42,.2,.08,.08,'Cornwallis I.');island(.68,.2,.12,.09,'Melville I.');island(.3,.52,.09,.14,'N. Somerset');island(.62,.55,.14,.12,'Victoria Land');island(.44,.75,.07,.07,'King William I.');
      c.fillStyle='#cdbb92';c.fillRect(W*.05,H*.86,W*.9,H*.1);c.fillStyle='#3a2a16';c.font=`${Math.round(H*.035)}px Georgia`;c.textAlign='center';c.fillText('THE CONTINENT OF AMERICA',W/2,H*.93);
      c.strokeStyle='#8a1f1f';c.setLineDash([8,6]);c.lineWidth=3;c.beginPath();c.moveTo(W*.06,H*.32);c.lineTo(W*.3,H*.33);c.lineTo(W*.36,H*.36);c.lineTo(W*.38,H*.55);c.lineTo(W*.42,H*.68);c.stroke();c.setLineDash([]);
      c.fillStyle='#8a1f1f';c.beginPath();c.arc(W*.395,H*.71,5,0,7);c.fill();c.font=`italic ${Math.round(H*.03)}px Georgia`;c.textAlign='left';c.fillText('Victory Point',W*.405,H*.705);
      c.fillStyle='#3a2a16';c.font=`bold ${Math.round(H*.045)}px Georgia`;c.textAlign='center';c.fillText('THE ARCTIC SEAS',W/2,H*.08);
      c.font=`${Math.round(H*.028)}px Georgia`;for(const [t,x,y] of [['Lancaster Sound',.12,.36],['Barrow Strait',.55,.33],['Peel Sound',.36,.45],['Victoria Strait',.53,.72]])c.fillText(t,W*x,H*y);
      c.font=`italic ${Math.round(H*.04)}px Georgia`;c.fillStyle='rgba(58,42,22,.6)';c.fillText('Unexplored',W*.84,H*.5);
      for(let i=0;i<40;i++){c.fillStyle=`rgba(90,60,30,${r()*.08})`;c.beginPath();c.arc(r()*W,r()*H,4+r()*16,0,7);c.fill()}}
    function buildChartTable(x,z,oak,brass){
      const g=new THREE.Group();g.position.set(x,0,z);root.add(g);const top=box(2.2,.06,1.1,oak,0,.8,0,g);for(const [lx,lz] of [[-1,-.45],[1,-.45],[-1,.45],[1,.45]])box(.08,.78,.08,oak,lx,.39,lz,g);
      const chart=mark(add(own(new THREE.PlaneGeometry(1.9,.95)),std({map:own(canvasTexture(chartTexture,1024,512)),color:0xb5a688,roughness:.95}),0,.835,0,g),card('chart'));chart.rotation.x=-Math.PI/2;
      mark(top,card('chart'));
      // Dividers and a parallel rule.
      const rule=box(.6,.012,.06,std({color:0x2a1c10,roughness:.5}),-.5,.84,.28,g);rule.rotation.y=.3;const div=box(.18,.01,.012,brass,-.2,.845,-.25,g);div.rotation.y=-.6;
      block(x,z,2.4,1.3);
      // The captain's chair at the table's south side, facing north over the chart: one of the library's seats.
      const c=new THREE.Group();c.position.set(x,0,z+.95);c.rotation.y=Math.PI;root.add(c);const leather=std({color:0x3a1f14,roughness:.8});
      const parts=[box(.56,.08,.52,leather,0,.46,0,c),box(.56,.55,.07,oak,0,.78,-.24,c)];for(const [lx,lz] of [[-.24,-.2],[.24,-.2],[-.24,.2],[.24,.2]])box(.05,.44,.05,oak,lx,.22,lz,c);
      block(x,z+.95,.62,.6);for(const part of parts)ours.push(part);
      registerSeat?.(parts,c,new THREE.Vector3(0,1.15,.05),0,{title:'The captain’s chair',author:'Draw it up to the chart table and read one of the books of the north.',bookIds:seatIds});
    }
    // The sea chest in the north-west corner, and on it the cairn: limestone slabs, with the tin hidden under the top.
    function buildChest(x,z,oak,iron){
      const g=new THREE.Group();g.position.set(x,0,z);root.add(g);box(1.0,.5,.55,oak,0,.25,0,g);box(1.04,.04,.59,iron,0,.5,0,g);
      for(const sx of [-.42,.42])box(.04,.5,.6,iron,sx,.25,0,g);block(x,z,1.15,.75);
      const stone=std({color:0x9a958a,roughness:1}),stones=[];
      for(const [sx,sy,sz,s] of [[-.12,.58,-.05,.16],[.1,.58,.06,.15],[0,.7,0,.14],[-.04,.81,.02,.12],[.03,.91,-.01,.1]]){const st=add(own(new THREE.DodecahedronGeometry(s,0)),stone,sx,sy,sz,g);st.scale.y=.55;st.rotation.y=sx*7;stones.push(st)}
      const tin=add(own(new THREE.CylinderGeometry(.035,.035,.2,12)),std({color:0x8c8f8c,metalness:.7,roughness:.45}),.18,.6,-.12,g);tin.rotation.z=Math.PI/2;tin.visible=false;
      const paper=add(own(new THREE.PlaneGeometry(.3,.22)),std({color:0xe8dfc6,roughness:.9}),-.2,.535,.12,g);paper.rotation.x=-Math.PI/2;paper.rotation.z=.2;paper.visible=false;
      const data={type:'arctic-cairn',title:CARDS.cairn[0],author:CARDS.cairn[1],action:'LIFT THE STONES'};
      for(const st of stones)mark(st,data);
      cairn={g,stones,tin,paper,data,t:-1,found:false};chest={g,book:null,copy:null};
    }
    function buildLamp(x,h,z,brass){
      const g=new THREE.Group();g.position.set(x,h-.55,z);root.add(g);add(own(new THREE.CylinderGeometry(.006,.006,.45,4)),brass,0,.32,0,g);
      const glass=add(own(new THREE.CylinderGeometry(.1,.12,.2,12)),std({color:0xfff0c8,emissive:0xffc070,emissiveIntensity:1.6,roughness:.3}),0,0,0,g);
      add(own(new THREE.CylinderGeometry(.14,.06,.08,12)),brass,0,-.13,0,g);add(own(new THREE.ConeGeometry(.14,.1,12)),brass,0,.14,0,g);mark(glass,card('lamp'));
      const light=new THREE.PointLight(0xffc98a,4.2,13,1.6);light.position.set(x,h-.7,z);root.add(light);g.userData.light=light;
    }
    function reveal(announce=true){
      if(!cairn||cairn.found)return;cairn.found=true;cairn.data.title=CARDS.cairnFound[0];cairn.data.author=CARDS.cairnFound[1];cairn.data.action='READ';
      cairn.tin.visible=cairn.paper.visible=true;cairn.stones.slice(-2).forEach(s=>{s.position.x-=.3;s.position.y=.56});
      if(chest?.book&&!chest.copy){const geometry=own(new THREE.BoxGeometry(.5,.7,.1));chest.copy=placeBook(chest.book,{x:.22,y:.53,z:.12,yaw:-.5,tilt:-Math.PI/2},geometry,'arctic-record',chest.g);chest.copy.scale.set?.(.7,.7,.7)}
    }

    // ---------- walking ----------
    function contains(x,z){return x>ROOM.cx-ROOM.w/2&&x<ROOM.cx+ROOM.w/2&&z>ROOM.cz-ROOM.d/2&&z<ROOM.cz+ROOM.d/2}
    function floorAt(x,z){return contains(x,z)?0:null}
    function allowed(x,z){
      if(!contains(x,z))return false;const r=player.radius||.42;
      if(x-r<ROOM.cx-ROOM.w/2+.4||x+r>ROOM.cx+ROOM.w/2-.4||z-r<ROOM.cz-ROOM.d/2+.4||z+r>ROOM.cz+ROOM.d/2-.4)return false;
      return !blockers.some(b=>x+r>b.minX&&x-r<b.maxX&&z+r>b.minZ&&z-r<b.maxZ)}

    // ---------- doing things ----------
    function enter(){
      activate();move(ROOM.cx,ROOM.cz+ROOM.d/2-1.1,0);playSample?.('doorOpen',.7,.7);
      showNotice('The Arctic Room: the great cabin of a ship wintering in the ice, the stove lit and the lamp over the chart table. Franklin and his searchers are on your left, Greenland and the Inuit on your right, and the way to the Pole either side of the door.',11);
      analytics?.track('Room Explored',{room:'arctic-room'})}
    function leave(){anteroom?.build?.();move(DOOR.x,DOOR.z+1.3,Math.PI);playSample?.('doorOpen',.7,.75);showNotice('The explorers’ anteroom again.',3)}
    const STEPS=[
      [0,()=>showNotice('You lift the top stones of the cairn. Under them, wedged among the slabs, is a tin cylinder, its soldered end opened once already.',7)],
      [6,()=>showNotice(`Inside is a printed Admiralty form, filled in by hand on 28 May 1847: “${RECORD.form}” “${RECORD.party}”`,9)],
      [14,()=>showNotice(`And round the margin, in another hand, eleven months later: “${RECORD.margin}”`,11)],
      [23,()=>showNotice(`“${RECORD.deaths}” Then, squeezed in at the end: “${RECORD.fish}”`,12)],
      [34,()=>{reveal(true);try{storage?.setItem(FOUND_KEY,'1')}catch(e){}playSample?.('pageTurn',.6,.8);
        showNotice(chest?.book?`It is the only written record of Franklin’s expedition ever found. On the chest beside the cairn there is a book that was not there before: ${chest.book.title}, M’Clintock’s account of how it was found, in May 1859.`:'It is the only written record of Franklin’s expedition ever found.',12)}]
    ];
    function readRecord(dt){
      if(!cairn||cairn.t<0)return;const before=cairn.t;cairn.t+=dt;for(const [at,run] of STEPS)if(before<at&&cairn.t>=at)run();
      if(cairn.t>2&&!cairn.tin.visible){cairn.tin.visible=true;sound?.(240,.15,'triangle',.02)}
      if(cairn.t>36)cairn.t=-1}
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('arctic-'))return false;
      if(data.type==='arctic-door'){through(data,enter);return true}
      if(data.type==='arctic-exit'){through(data,leave);return true}
      if(data.type==='arctic-cairn'){
        if(cairn?.found){showNotice(`${data.title}: ${data.author}`,18);return true}
        if(cairn&&cairn.t<0){cairn.t=0;STEPS[0][1]()}return true}
      if(data.type==='arctic-card'){showNotice(`${data.title}: ${data.author}`,data.author.length>260?17:data.author.length>130?12:9);return true}
      return false}

    // ---------- lifecycle ----------
    function activate(){if(!root)buildRoom();lastNeeded=time}
    function unload(){
      if(!root)return;root.removeFromParent();root.traverse(object=>{if(object.isLight)object.userData.freed=true});root=null;stove=null;cairn=null;chest=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0}
    function update(t){
      const dt=Math.min(.1,Math.max(0,t-time));time=t;const x=player.pos.x,z=player.pos.z,inside=contains(x,z);
      if(anteroom){if(anteroom.built)hangDoor();else dropDoor()}
      const near=!!door&&Math.hypot(x-DOOR.x,z-DOOR.z)<PRELOAD;
      if(inside||near&&(root||window.libraryMayBuild?.()!==false))activate();
      else if(root&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==b.userData.home.parent))unload();
      if(!inside||!root)return;
      readRecord(dt);
      if(stove)stove.glowMat.emissiveIntensity=1.1+Math.sin(t*6.1)*.18+Math.sin(t*13.7)*.08}
    return {contains,floorAt,allowed,interact,update,enter,leave,activate,unload,catalogue,door:DOOR,room:ROOM,groups:GROUPS,own:OWN,record:RECORD,cards:CARDS,seatBooks:seatIds,
      get built(){return !!root},get doorHung(){return !!door},get books(){return books.slice()},get found(){return !!cairn?.found||wasFound()},get reading(){return !!cairn&&cairn.t>=0},
      zoneAt:(x,z)=>contains(x,z)?'arctic-room':null};
  };
})();
