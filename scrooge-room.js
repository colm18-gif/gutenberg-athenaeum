// Scrooge's chambers: the gloomy suite "up a yard" where Ebenezer Scrooge lived in A Christmas Carol (1843), made one
// room by the library (sitting-room, bedroom and closet), through a heavy door in the Long Corridor's east wall (second
// bay; long-corridor.js hands over `scroogeDoor`). On the corridor side the door has a large brass knocker, and the first
// time a reader comes up to it the knocker is, for a moment, not a knocker but Marley's face (drawn on a pane in front of
// it, fading in and out; no light). Inside: the old fireplace "paved all round with quaint Dutch tiles, designed to
// illustrate the Scriptures" (one drawn texture), a very low fire (the room's one light, flickering), the saucepan of
// gruel on the hob, Scrooge's armchair before it (a seat), the dressing-gown hanging in a suspicious attitude, a
// curtained bed, the closet, a window on the foggy yard (snow in December and January), and the disused bell high on
// the wall.
//
// Books: Dickens's Christmas books (after the library's own Carol), tales for a winter's night (after the library's own
// Gift of the Magi, Tales for Christmas Eve and Andersen) and Dickens and his London (after the library's own novels);
// shelves `scrooge-*` in data/new-books.js.
//
// The secret is the bell. Looked at, it begins to swing, softly and then loudly, with every bell in the house; the bells
// cease together; a chain is dragged over the casks in the cellar below, the cellar door booms, the clanking comes up the
// stairs, the dying flame leaps up, and for a moment there is a copy of old Marley's head on every tile. When it has
// gone, The Chimes (`scrooge-chimes`), Dickens's "goblin story of some bells", lies on the table by the fire: found once,
// found for good (athenaeum-scrooge-chimes; ?chimes shows it). Every word of Dickens quoted here (`QUOTES`) is checked
// against the library's own text of the Carol (texts/pg46.txt) by a test. Built when the reader comes near its door,
// freed a little while after they leave.
(function(){
  'use strict';

  // The library's own copies: the Carol heads the Christmas shelf; the winter tales start from O. Henry's Gift of the
  // Magi, Rhoda Broughton's Tales for Christmas Eve and Andersen; Dickens's London from Pickwick and four of the novels.
  const OWN={christmas:[46],winter:[7256,69297,1597],london:[580,766,1400,730,1023]};
  const GROUPS=[
    {key:'christmas',name:'THE CHRISTMAS BOOKS',sub:'Charles Dickens, 1843 to 1848',wall:'east',along:-1.3,length:3.2,max:6,ids:OWN.christmas},
    {key:'winter',name:'FOR A WINTER’S NIGHT',sub:'Tales told by the fire',wall:'west',along:1.6,length:3,max:8,ids:OWN.winter},
    {key:'london',name:'DICKENS’S LONDON',sub:'His city, and his life',wall:'south',along:-2.75,length:2.7,max:8,ids:OWN.london}
  ];
  // Dickens's own words, as the library's text of the Carol has them.
  const QUOTES={
    doornail:'Marley was as dead as a door-nail.',
    knocker:'not a knocker, but Marley’s face.',
    face:'It was not angry or ferocious, but looked at Scrooge as Marley used to look: with ghostly spectacles turned up on its ghostly forehead.',
    darkness:'Darkness is cheap, and Scrooge liked it.',
    gruel:'the little saucepan of gruel (Scrooge had a cold in his head) upon the hob.',
    gown:'nobody in his dressing-gown, which was hanging up in a suspicious attitude against the wall.',
    closet:'Nobody under the bed; nobody in the closet;',
    fire:'It was a very low fire indeed; nothing on such a bitter night.',
    tiles:'quaint Dutch tiles, designed to illustrate the Scriptures.',
    butter:'Apostles putting off to sea in butter-boats,',
    heads:'there would have been a copy of old Marley’s head on every one.',
    bell:'a bell, a disused bell, that hung in the room, and communicated for some purpose now forgotten with a chamber in the highest story of the building.',
    swing:'It swung so softly in the outset that it scarcely made a sound; but soon it rang out loudly, and so did every bell in the house.',
    cease:'The bells ceased as they had begun, together.',
    chain:'as if some person were dragging a heavy chain over the casks in the wine-merchant’s cellar.',
    cellar:'The cellar-door flew open with a booming sound,',
    flame:'the dying flame leaped up,',
    oyster:'secret, and self-contained, and solitary as an oyster.',
    idea:'to raise the Ghost of an Idea, which shall not put my readers out of humour with themselves, with each other, with the season, or with me.',
    tim:'God bless us every one!'
  };
  const q=key=>`“${QUOTES[key]}”`;
  const CARDS={
    sign:['Scrooge’s chambers',`A Christmas Carol, 1843. Scrooge lived in chambers that had once been his partner Jacob Marley’s, a gloomy suite of rooms up a yard in the City of London. The library has made one room of his sitting-room, bedroom and closet. ${q('darkness')}`],
    knocker:['The knocker',`There was nothing at all particular about the knocker on Scrooge’s door, Dickens says, except that it was very large; and yet one night, with his key in the lock, Scrooge saw in it ${q('knocker')} ${q('face')}`],
    fire:['The fire',`${q('fire')} The fireplace was an old one, built by some Dutch merchant long ago.`],
    tiles:['The Dutch tiles',`The fireplace is paved all round with ${q('tiles')} Cains and Abels, Pharaoh’s daughters, Queens of Sheba, ${q('butter')} and hundreds of figures more.`],
    gruel:['The hob',`Spoon and basin ready, and ${q('gruel')}`],
    chair:['Scrooge’s armchair','He sat close to the fire in his dressing-gown, slippers and nightcap, and brooded over it, to take his gruel.'],
    gown:['A dressing-gown',`Scrooge looked about his rooms before he locked himself in for the night, and found ${q('gown')}`],
    bed:['The bed',`A four-poster with heavy curtains. ${q('closet')} The Spirits drew these curtains aside, one after another.`],
    closet:['The closet',`${q('closet')} Nor is there now.`],
    window:['The window on the yard','A yard so dark and foggy, Dickens says, that even Scrooge, who knew its every stone, had to grope his way with his hands. The lamp in it does not help much.'],
    candle:['Scrooge’s dip','A tallow candle in a tin stick, the cheapest light there was. Scrooge went up his stairs by it.'],
    preface:['The preface',`Dickens wrote the Carol in six weeks in the autumn of 1843, and it was published on the nineteenth of December. His preface hopes ${q('idea')}`],
    bellStill:['The disused bell',`${q('bell')} It hangs still now. ${q('cease')}`]
  };
  const FOUND_KEY='athenaeum-scrooge-chimes';

  window.createScroogeRoom=function(options){
    const {THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,arrivals={},showNotice,playSample,sound=null,tone=null,move,analytics,isHolding=()=>false,
      registerSeat=null,doorKit=null,corridor=null,storage=null,search='',now=()=>new Date()}=options;
    const DOOR=corridor?.scroogeDoor||{x:1702.33,z:6,yaw:-Math.PI/2};
    const ROOM={cx:2200,cz:-300,w:9,d:8,h:3.6};
    const PRELOAD=7,KEEP=25;
    // The room's side of the door: heavy, black-brown, four panels. The corridor's side is the library's walnut, gilded.
    const DOOR_LOOK={style:'painted',color:0x241c17,fanColor:0x8a7a5a,width:1.8,height:3};
    const through=(data,go)=>doorKit&&data.kit?doorKit.pass(data.kit,data,go):go();
    const wasFound=()=>{try{return storage?.getItem(FOUND_KEY)==='1'||/[?&](chimes|marley)\b/.test(search)}catch(e){return false}};
    const snowy=()=>{const m=now().getMonth();return m===11||m===0};
    let root=null,time=0,lastNeeded=-1e9,fire=null,tiles=null,bell=null,table=null,knocker=null;
    const owned=[],ours=[],books=[],blockers=[],seatIds=[];
    const own=thing=>{owned.push(thing);return thing};
    const std=params=>own(new THREE.MeshStandardMaterial(params));
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    // The door and knocker in the corridor stay when the room is freed, so their parts are not among the room's own.
    function markDoor(object,data){object.userData=data;interactables.push(object);return object}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const card=key=>({type:'scrooge-card',title:CARDS[key][0],author:CARDS[key][1],action:'READ'});
    function sign(parent,text,sub,w,h,x,y,z){
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle='#e6dcc4';c.fillRect(0,0,W,H);c.strokeStyle='#3b2a1a';c.lineWidth=3;c.strokeRect(7,7,W-14,H-14);
        c.fillStyle='#21170e';c.textAlign='center';c.font='bold 28px Georgia';c.fillText(text,W/2,sub?52:H/2+10);if(sub){c.font='italic 20px Georgia';c.fillText(sub,W/2,83)}},620,sub?104:70));
      return add(own(new THREE.PlaneGeometry(w,h)),std({map,emissive:0x2a2218,emissiveIntensity:.3,roughness:.9}),x,y,z,parent)}
    const shelfBooks=(ids,room,max)=>[...new Set([...ids,...(arrivals[room]||[])])].map(id=>findBook(id)).filter(Boolean).slice(0,max);
    function catalogue(){return {groups:GROUPS.map(group=>({...group,books:shelfBooks(group.ids,group.key,group.max)})),chimes:shelfBooks([],'chimes',1)}}

    // ---------- the door and its knocker, in the Long Corridor ----------
    // Marley's face, drawn: pale and livid, the spectacles pushed up on the forehead, the hair stirred as if by hot air.
    function faceTexture(c,W,H,small=false){
      const cx=W/2,cy=H*.54,rx=W*.3,ry=H*.36;if(!small)c.clearRect(0,0,W,H);
      if(!small){const glow=c.createRadialGradient(cx,cy,rx*.4,cx,cy,W*.5);glow.addColorStop(0,'rgba(170,200,190,.5)');glow.addColorStop(1,'rgba(170,200,190,0)');c.fillStyle=glow;c.fillRect(0,0,W,H)}
      c.strokeStyle=small?'#2f4f8f':'rgba(200,214,206,.85)';c.lineWidth=W/90;for(let i=0;i<9;i++){const a=-2.6+i*.65;c.beginPath();c.moveTo(cx+Math.cos(a)*rx*.8,cy-ry*.7+Math.sin(a)*ry*.2);c.quadraticCurveTo(cx+Math.cos(a)*rx*1.4,cy-ry*1.15,cx+Math.cos(a)*rx*1.2+Math.sin(i)*W*.04,cy-ry*1.3)}c.stroke();
      c.fillStyle=small?'#f4f1e8':'#b8c8be';c.beginPath();c.ellipse(cx,cy,rx,ry,0,0,7);c.fill();if(small){c.strokeStyle='#2f4f8f';c.lineWidth=W/40;c.stroke()}
      const ink=small?'#2f4f8f':'#4d5d58';c.strokeStyle=ink;c.fillStyle=ink;c.lineWidth=W/70;
      for(const s of [-1,1]){c.beginPath();c.arc(cx+s*rx*.38,cy-ry*.62,rx*.2,0,7);c.stroke()}c.beginPath();c.moveTo(cx-rx*.18,cy-ry*.62);c.lineTo(cx+rx*.18,cy-ry*.62);c.stroke();
      for(const s of [-1,1]){c.beginPath();c.ellipse(cx+s*rx*.4,cy-ry*.08,rx*.16,ry*.1,0,0,7);c.stroke();c.beginPath();c.arc(cx+s*rx*.4,cy-ry*.08,rx*.06,0,7);c.fill()}
      c.beginPath();c.moveTo(cx,cy-ry*.02);c.lineTo(cx-rx*.1,cy+ry*.3);c.lineTo(cx+rx*.05,cy+ry*.32);c.stroke();c.beginPath();c.moveTo(cx-rx*.32,cy+ry*.55);c.quadraticCurveTo(cx,cy+ry*.5,cx+rx*.32,cy+ry*.55);c.stroke();
      if(!small){c.beginPath();c.moveTo(cx-rx*.62,cy+ry*.62);c.quadraticCurveTo(cx,cy+ry*1.15,cx+rx*.62,cy+ry*.62);c.stroke()}
    }
    function buildDoor(){
      const g=new THREE.Group();g.name='scrooge-door';g.position.set(DOOR.x,0,DOOR.z);g.rotation.y=DOOR.yaw;scene.add(g);
      const data={type:'scrooge-door',title:'Scrooge’s chambers',author:'A gloomy suite of rooms up a yard, a very low fire, and a disused bell. A Christmas Carol, 1843.',action:'ENTER'};
      const door=doorKit?.hang(g,{data,mark:markDoor,...DOOR_LOOK,...doorKit.readingRoom?.('SCROOGE’S\nCHAMBERS','A Christmas Carol · 1843')});
      let leaf=door?.leaf;if(!leaf){markDoor(add(new THREE.BoxGeometry(1.8,3,.14),new THREE.MeshStandardMaterial({color:DOOR_LOOK.color,roughness:.7}),0,1.5,.08,g),data);leaf=g}
      // The knocker: a boss and a heavy ring on the middle rail, below the glass, on the corridor's side of the leaf.
      const brass=MAT.brass||new THREE.MeshStandardMaterial({color:0xb08d3a,metalness:.6,roughness:.4}),k=new THREE.Group();k.position.set(0,1.22,.1);leaf.add(k);
      const knockerData={type:'scrooge-knocker',title:CARDS.knocker[0],author:CARDS.knocker[1],action:'LOOK'};
      const plate=markDoor(add(new THREE.CylinderGeometry(.09,.09,.025,16),brass,0,.06,0,k),knockerData);plate.rotation.x=Math.PI/2;
      const boss=markDoor(add(new THREE.SphereGeometry(.05,12,8),brass,0,.06,.02,k),knockerData);
      const ring=markDoor(add(new THREE.TorusGeometry(.11,.018,8,24),brass,0,-.07,.035,k),knockerData);
      // Marley's face, in front of the knocker, unseen until the reader comes up to the door. Drawn when first needed.
      const faceMat=new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false});
      const face=add(new THREE.PlaneGeometry(.42,.5),faceMat,0,0,.05,k);face.visible=false;face.raycast=()=>{};
      doorKit?.drawAfterPortal?.(leaf);
      knocker={plate,boss,ring,face,faceMat,drawn:false,t:-1,seen:false};
    }
    function showFace(){
      if(!knocker||knocker.t>=0)return;
      if(!knocker.drawn){knocker.drawn=true;knocker.faceMat.map=canvasTexture((c,W,H)=>faceTexture(c,W,H),256,320);knocker.faceMat.needsUpdate=true}
      knocker.t=0;knocker.seen=true;knocker.face.visible=true;
      showNotice(`For a moment the knocker on this door is ${QUOTES.knocker.replace(/\.$/,'')}. Then it is a knocker again.`,7);
    }

    // ---------- the room ----------
    function buildRoom(){
      root=new THREE.Group();root.name='scrooge-room';const {cx,cz,w,d,h}=ROOM,x0=cx-w/2,x1=cx+w/2,z0=cz-d/2,z1=cz+d/2;
      // Dark panelling to the dado, smoke-browned paper above, bare boards.
      const paper=own(canvasTexture((c,W,H)=>{c.fillStyle='#4a3e30';c.fillRect(0,0,W,H);for(let x=0;x<W;x+=32){c.fillStyle='rgba(30,22,14,.35)';c.fillRect(x,0,10,H)}
        let k=7;const r=()=>(k=(k*9301+49297)%233280)/233280;for(let i=0;i<300;i++){c.fillStyle=`rgba(20,14,8,${r()*.12})`;c.fillRect(r()*W,r()*H,2+r()*8,2+r()*12)}},256,256));
      paper.wrapS=paper.wrapT=THREE.RepeatWrapping;paper.repeat?.set?.(6,2);
      const wall=std({color:0x8a7a66,map:paper,roughness:.95}),panel=MAT.darkWood||std({color:0x2a1a10,roughness:.7}),iron=std({color:0x1c1b1a,roughness:.6,metalness:.5}),
        oak=std({color:0x3a2616,roughness:.7}),cloth=std({color:0x3c1c1a,roughness:.95}),stone=std({color:0x2e2924,roughness:.9});
      box(w,.3,d,MAT.wood||oak,cx,-.15,cz,root);box(w,.2,d,std({color:0x3a332b,roughness:1}),cx,h+.1,cz,root);
      box(w,h,.3,wall,cx,h/2,z0,root);box(w,h,.3,wall,cx,h/2,z1,root);box(.3,h,d,wall,x0,h/2,cz,root);box(.3,h,d,wall,x1,h/2,cz,root);
      for(const [bx,bz,bw,bd] of [[cx,z0+.18,w,.06],[cx,z1-.18,w,.06],[x0+.18,cz,.06,d],[x1-.18,cz,.06,d]]){box(bw,1,bd,panel,bx,.5,bz,root);box(bw+(bd>.1?0:.04),.06,bd+(bd>.1?.04:0),panel,bx,1.02,bz,root)}
      mark(sign(root,'SCROOGE’S CHAMBERS','A Christmas Carol · 1843',2.6,.44,cx-2.6,h-.45,z0+.17),card('sign'));
      buildFireplace(cx,z0,stone,iron);
      buildBell(cx+1.75,h-.5,z0+.2);
      buildChair(cx-.6,z0+2.05,cloth,oak);
      buildTable(cx+.95,z0+2.15,oak,iron);
      buildBed(x0+1.25,z0+1.35,oak,cloth);
      buildGown(x0+.24,cz-.55);
      buildWindow(x1-.16,cz+2.55);
      buildCloset(cx+2.7,z1-.17,panel);
      // A framed card by the door: the Carol's preface.
      const pre=mark(sign(root,'A GHOSTLY LITTLE BOOK','Read the preface',1.5,.26,cx+1.5,1.75,z1-.17),card('preface'));pre.rotation.y=Math.PI;
      // The shelves: dark oak, one or two rows, each under its label.
      const {groups,chimes}=catalogue(),geometry=own(new THREE.BoxGeometry(.66,.9,.12)),ROWS=[1.3,2.36];
      for(const group of groups){
        const per=group.books.length>4?Math.ceil(group.books.length/2):Math.max(1,group.books.length),step=Math.min(1.05,(group.length-.3)/per);
        group.books.forEach((book,i)=>{const row=i<per?0:1,n=row?group.books.length-per:per,col=row?i-per:i,offset=(col-(n-1)/2)*step;placeBook(book,{...shelfSpot(group,offset),y:ROWS[row]},geometry,group.key)});
        const s=shelfSpot(group,0,.34),rows=group.books.length>per?ROWS:ROWS.slice(0,1),top=rows.at(-1)+.82,label=sign(root,group.name,group.sub,2.3,.38,0,top,0);
        if(group.wall==='south'){for(const y of rows)box(group.length,.05,.34,oak,s.x,y-.47,s.z,root);block(s.x,s.z,group.length+.2,.7);label.position.set(s.x,top,z1-.17);label.rotation.y=Math.PI}
        else{for(const y of rows)box(.34,.05,group.length,oak,s.x,y-.47,s.z,root);block(s.x,s.z,.7,group.length+.2);const side=group.wall==='west'?-1:1;label.position.set(cx+side*(w/2-.17),top,s.z);label.rotation.y=-side*Math.PI/2}
        mark(label,{type:'scrooge-card',title:group.name.charAt(0)+group.name.slice(1).toLowerCase(),author:group.sub+'.',action:'READ'});
      }
      seatIds.splice(0,seatIds.length,...books.map(b=>b.userData.book.id));
      table.book=chimes[0]||null;if(wasFound())reveal(false);
      // The way back to the corridor.
      const exit={type:'scrooge-exit',title:'Back to the Long Corridor',author:'Out through the heavy door, and along the corridor to the Grand Hall.',action:'RETURN'};
      if(!doorKit?.hang(root,{data:exit,mark,x:cx,z:z1-.2,yaw:Math.PI,onward:'towards the Grand Hall',label:'THE LONG CORRIDOR',own,...DOOR_LOOK}))mark(box(1.8,3,.16,panel,cx,1.5,z1-.2,root),exit);
      scene.add(root);
    }
    function shelfSpot(group,offset,inset=.3){
      const {cx,cz,w,d}=ROOM;if(group.wall==='south')return {x:cx+group.along-offset,z:cz+d/2-inset,yaw:Math.PI};
      const side=group.wall==='west'?-1:1;return {x:cx+side*(w/2-inset),z:cz+group.along-side*offset,yaw:-side*Math.PI/2}}
    function placeBook(book,spot,geometry,shelf,parent=root){
      const mesh=add(geometry,own(bookMaterial(book)),spot.x,spot.y,spot.z,parent);mesh.rotation.order='YXZ';mesh.rotation.y=spot.yaw||0;mesh.rotation.x=spot.tilt??-.08;
      mesh.userData={type:'book',book,loaded:false,scrooge:true,shelf,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent}};
      interactables.push(mesh);ours.push(mesh);books.push(mesh);return mesh}
    // The Dutch tiles: Scripture in blue on white, figures from Dickens's list; and the same tiles with Marley on every one.
    function tileTexture(marley){
      return own(canvasTexture((c,W,H)=>{const T=64,cols=W/T,rows=H/T;c.fillStyle='#d9d3c3';c.fillRect(0,0,W,H);let k=marley?5:3;const r=()=>(k=(k*9301+49297)%233280)/233280;
        for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){if(i>=2&&i<cols-2&&j>=2)continue;const x=i*T,y=j*T;c.fillStyle='#efeadb';c.fillRect(x+2,y+2,T-4,T-4);c.strokeStyle='#2f4f8f';c.lineWidth=1.5;
          for(const [ax,ay] of [[x+8,y+8],[x+T-8,y+8],[x+8,y+T-8],[x+T-8,y+T-8]]){c.beginPath();c.moveTo(ax-4,ay);c.lineTo(ax+4,ay);c.moveTo(ax,ay-4);c.lineTo(ax,ay+4);c.stroke()}
          c.save();c.translate(x+T/2,y+T/2);if(marley){c.translate(-T*.3,-T*.32);faceTexture(c,T*.6,T*.66,true);c.restore();continue}
          c.strokeStyle='#2f4f8f';c.fillStyle='#2f4f8f';c.lineWidth=2;const kind=Math.floor(r()*5);
          if(kind===0){c.beginPath();c.arc(0,-12,4,0,7);c.fill();c.beginPath();c.moveTo(0,-8);c.lineTo(-8,14);c.lineTo(8,14);c.closePath();c.fill()}// a figure
          else if(kind===1){c.beginPath();c.moveTo(-16,6);c.quadraticCurveTo(0,16,16,6);c.closePath();c.fill();c.beginPath();c.moveTo(0,6);c.lineTo(0,-14);c.lineTo(10,0);c.closePath();c.stroke()}// a butter-boat
          else if(kind===2){for(const [px,py,pr] of [[-8,4,7],[0,-2,9],[9,4,7]]){c.beginPath();c.arc(px,py,pr,0,7);c.stroke()}c.beginPath();c.arc(0,-14,3,0,7);c.fill()}// an angel on a cloud
          else if(kind===3){c.beginPath();c.moveTo(0,14);c.lineTo(0,-2);c.stroke();c.beginPath();c.arc(0,-8,9,0,7);c.stroke()}// a tree
          else{c.beginPath();c.arc(0,-10,4,0,7);c.fill();c.beginPath();c.moveTo(0,-6);c.lineTo(0,8);c.moveTo(-8,-2);c.lineTo(8,-2);c.moveTo(0,8);c.lineTo(-6,16);c.moveTo(0,8);c.lineTo(6,16);c.stroke()}// a king
          c.restore()}
        c.fillStyle='#0c0907';c.fillRect(2*T,2*T,W-4*T,H-2*T)},512,384));
    }
    // The old fireplace in the north wall's chimney breast, its tiles, a very low fire and the hob with the gruel.
    function buildFireplace(x,z0,stone,iron){
      const g=new THREE.Group();g.position.set(x,0,z0+.15);root.add(g);
      box(2.3,ROOM.h,.6,stone,0,ROOM.h/2,.3,g);const shelf=box(2.5,.08,.36,MAT.darkWood||stone,0,1.5,.68,g);mark(shelf,card('fire'));
      for(const s of [-1,1])box(.14,1.46,.14,MAT.darkWood||stone,s*1.12,.73,.62,g);
      const plain=tileTexture(false),marley=tileTexture(true),tileMat=std({map:plain,color:0x9c958a,roughness:.6});
      const face=mark(add(own(new THREE.PlaneGeometry(2,1.5)),tileMat,0,.75,.605,g),card('tiles'));
      // The grate and its handful of coals, glowing; a flame that the reader sees leap when the time comes.
      box(.8,.04,.3,iron,0,.18,.42,g);for(const bx of [-.3,-.15,0,.15,.3])box(.03,.3,.03,iron,bx,.33,.56,g);
      const coalMat=std({color:0x2a0c04,emissive:0xff5a12,emissiveIntensity:1.1,roughness:.9});for(const [cx2,cz2] of [[-.12,.45],[.06,.48],[.18,.43],[-.02,.4],[.1,.52]])box(.11,.08,.1,coalMat,cx2,.23,cz2,g);
      const flameMat=own(new THREE.MeshBasicMaterial({color:0xffa040,transparent:true,opacity:.7,depthWrite:false,blending:THREE.AdditiveBlending}));
      const flame=add(own(new THREE.ConeGeometry(.12,.3,8)),flameMat,0,.4,.47,g);flame.raycast=()=>{};
      const hob=box(.36,.05,.3,iron,.6,.42,.5,g);const pan=add(own(new THREE.CylinderGeometry(.09,.08,.09,14)),iron,.6,.5,.5,g);const handle=box(.22,.015,.03,iron,.78,.53,.5,g);
      const gruel=add(own(new THREE.CircleGeometry(.08,14)),std({color:0xc9bfa2,roughness:.8}),.6,.546,.5,g);gruel.rotation.x=-Math.PI/2;for(const part of [hob,pan,handle,gruel])mark(part,card('gruel'));
      const light=new THREE.PointLight(0xff9a50,4.2,14,2);light.position.set(x,1.1,z0+1.9);root.add(light);
      block(x,z0+.45,2.6,1.1);fire={light,flame,flameMat,coalMat,tileMat,plain,marley,flare:0,heads:0};
    }
    // The disused bell, high on the wall by the chimney breast, on a coiled spring, its wire going up into the ceiling.
    function buildBell(x,y,z){
      const g=new THREE.Group();g.position.set(x,y,z);root.add(g);const brass=MAT.brass||std({color:0xb08d3a,metalness:.6,roughness:.4});
      box(.08,.18,.05,MAT.darkWood||brass,0,.08,0,g);const coil=add(own(new THREE.TorusGeometry(.05,.008,5,14)),brass,0,.04,.06,g);coil.rotation.y=Math.PI/2;
      add(own(new THREE.CylinderGeometry(.004,.004,.55,4)),std({color:0x55504a,metalness:.6}),.02,.42,.03,g);
      const pivot=new THREE.Group();pivot.position.set(0,0,.08);g.add(pivot);
      const cup=add(own(new THREE.CylinderGeometry(.04,.1,.14,16,1,true)),brass,0,-.14,0,pivot);const crown=add(own(new THREE.SphereGeometry(.04,10,6)),brass,0,-.07,0,pivot);
      const arm=box(.012,.12,.012,brass,0,-.04,0,pivot);
      const data={type:'scrooge-bell',title:'A disused bell',author:`High on the wall by the chimney breast hangs ${q('bell')}`,action:'LOOK'};
      for(const part of [cup,crown,arm,coil])mark(part,data);
      // A bigger, invisible target round it, since it is high and small.
      const hit=mark(add(own(new THREE.SphereGeometry(.26,8,6)),own(new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false})),0,-.12,.08,g),data);hit.visible=true;
      bell={pivot,data,t:-1,found:false};
    }
    // Scrooge's armchair, drawn up close to the fire: one of the library's seats.
    function buildChair(x,z,cloth,oak){
      const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=Math.PI;root.add(g);
      const parts=[box(.66,.14,.6,cloth,0,.45,0,g),box(.66,.8,.14,cloth,0,.9,-.28,g),box(.12,.3,.6,cloth,-.33,.62,0,g),box(.12,.3,.6,cloth,.33,.62,0,g)];
      for(const [lx,lz] of [[-.28,-.24],[.28,-.24],[-.28,.24],[.28,.24]])box(.05,.38,.05,oak,lx,.19,lz,g);
      block(x,z,.8,.8);for(const part of parts)ours.push(part);
      // Facing the fire (north). Its books are the room's, filled in once the shelves are up.
      registerSeat?.(parts,g,new THREE.Vector3(0,1.18,.05),0,{title:'Scrooge’s armchair',author:'Sit close to the very low fire and read one of the room’s books.',bookIds:seatIds});
    }
    // The little table by the chair: spoon and basin, Scrooge's dip, and (once the bell has rung) The Chimes.
    function buildTable(x,z,oak,iron){
      const g=new THREE.Group();g.position.set(x,0,z);root.add(g);const top=box(.55,.04,.55,oak,0,.66,0,g);for(const [lx,lz] of [[-.22,-.22],[.22,-.22],[-.22,.22],[.22,.22]])box(.04,.64,.04,oak,lx,.32,lz,g);
      mark(top,card('gruel'));const basin=add(own(new THREE.CylinderGeometry(.08,.05,.05,14)),std({color:0xe8e2d0,roughness:.5}),-.14,.705,.1,g);mark(basin,card('gruel'));
      const stick=add(own(new THREE.CylinderGeometry(.06,.07,.02,12)),iron,.14,.69,-.12,g);const dip=add(own(new THREE.CylinderGeometry(.016,.016,.14,8)),std({color:0xe4dcc0,roughness:.8}),.14,.77,-.12,g);
      const glow=add(own(new THREE.SphereGeometry(.022,8,6)),std({color:0xfff0c8,emissive:0xffb050,emissiveIntensity:2,roughness:.4}),.14,.86,-.12,g);for(const part of [stick,dip,glow])mark(part,card('candle'));
      block(x,z,.7,.7);table={g,book:null,copy:null};
    }
    function reveal(announce=true){
      if(!bell||bell.found)return;bell.found=true;bell.data.title=CARDS.bellStill[0];bell.data.author=CARDS.bellStill[1];bell.data.action='READ';
      if(table?.book&&!table.copy){const geometry=own(new THREE.BoxGeometry(.66,.9,.12));table.copy=placeBook(table.book,{x:-.05,y:.69,z:-.08,yaw:.4,tilt:-Math.PI/2},geometry,'chimes',table.g);table.copy.scale.set?.(.6,.6,.6)}
    }
    // The bed, head to the north wall, with heavy curtains drawn back at the corners.
    function buildBed(x,z,oak,cloth){
      const g=new THREE.Group();g.position.set(x,0,z);root.add(g);const linen=std({color:0x9c968a,roughness:.95});
      const parts=[box(1.4,.3,2.1,oak,0,.35,0,g),box(1.32,.16,2,linen,0,.56,0,g),box(1.4,1.1,.08,oak,0,.85,-1.04,g),box(.6,.12,.36,linen,-.3,.68,-.75,g),box(1.5,.12,2.2,cloth,0,2.3,0,g)];
      for(const [px,pz] of [[-.68,-1.02],[.68,-1.02],[-.68,1.02],[.68,1.02]]){parts.push(box(.07,2.3,.07,oak,px,1.15,pz,g));parts.push(box(.22,2.1,.18,cloth,px*.93,1.2,pz*.95,g))}
      for(const part of parts)mark(part,card('bed'));block(x,z,1.6,2.3);
    }
    // The dressing-gown on its peg, hanging in a suspicious attitude: shoulders, sleeves and the nightcap above.
    function buildGown(x,z){
      const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=Math.PI/2;root.add(g);const wool=std({color:0x4b3a2a,roughness:1}),cap=std({color:0x9a9284,roughness:1});
      const parts=[add(own(new THREE.CylinderGeometry(.18,.34,1.35,12,1,true)),wool,0,1.2,.12,g),add(own(new THREE.SphereGeometry(.17,10,8)),wool,0,1.9,.12,g)];parts[0].material.side=THREE.DoubleSide;parts[1].scale.set(1.3,.45,.7);
      for(const s of [-1,1]){const sleeve=add(own(new THREE.CylinderGeometry(.07,.09,.8,8)),wool,s*.25,1.5,.16,g);sleeve.rotation.z=s*.12;parts.push(sleeve)}
      const nightcap=add(own(new THREE.ConeGeometry(.1,.32,10)),cap,.05,2.22,.1,g);nightcap.rotation.z=.6;parts.push(nightcap);box(.05,.05,.12,MAT.brass||wool,0,2.05,.05,g);
      for(const part of parts)mark(part,card('gown'));block(x+.2,z,.5,.8);
    }
    // The window on the yard: fog, a lamp, the wet stones; snow in December and January. Painted; no light of its own.
    function buildWindow(x,z){
      const snow=snowy(),view=own(canvasTexture((c,W,H)=>{c.fillStyle='#1c2226';c.fillRect(0,0,W,H);
        c.fillStyle='#0f1214';c.fillRect(0,H*.08,W*.36,H*.8);c.fillRect(W*.7,H*.15,W*.3,H*.75);c.fillStyle='rgba(255,200,120,.55)';for(const [wx,wy] of [[.1,.3],[.2,.55],[.8,.4]])c.fillRect(W*wx,H*wy,14,20);
        const lamp=c.createRadialGradient(W*.55,H*.42,2,W*.55,H*.42,W*.35);lamp.addColorStop(0,'rgba(255,214,140,.95)');lamp.addColorStop(.2,'rgba(230,180,110,.35)');lamp.addColorStop(1,'rgba(120,120,110,0)');c.fillStyle=lamp;c.fillRect(0,0,W,H);
        c.strokeStyle='#0a0a0a';c.lineWidth=4;c.beginPath();c.moveTo(W*.55,H*.46);c.lineTo(W*.55,H*.95);c.stroke();c.fillStyle=snow?'#c9ccd0':'#2a2f30';c.fillRect(0,H*.9,W,H*.1);
        const fog=c.createLinearGradient(0,0,0,H);fog.addColorStop(0,'rgba(140,140,128,.15)');fog.addColorStop(.6,'rgba(150,148,136,.4)');fog.addColorStop(1,'rgba(120,120,112,.55)');c.fillStyle=fog;c.fillRect(0,0,W,H);
        if(snow){let k=9;const r=()=>(k=(k*9301+49297)%233280)/233280;c.fillStyle='rgba(240,240,240,.8)';for(let i=0;i<160;i++){c.beginPath();c.arc(r()*W,r()*H,1+r()*1.6,0,7);c.fill()}}},256,384));
      const g=new THREE.Group();g.position.set(x,1.8,z);g.rotation.y=-Math.PI/2;root.add(g);
      mark(add(own(new THREE.PlaneGeometry(1.1,1.7)),std({map:view,emissive:0xffffff,emissiveMap:view,emissiveIntensity:.45,roughness:.4}),0,0,0,g),card('window'));
      const frame=MAT.darkWood||std({color:0x2a1a10});for(const sx of [-.58,0,.58])box(sx?.08:.04,1.86,.06,frame,sx,0,.03,g);for(const sy of [-.89,0,.89])box(1.24,sy?.08:.04,.06,frame,0,sy,.03,g);
    }
    // The closet: a narrow painted door in the panelling, with nobody in it.
    function buildCloset(x,z,panel){
      const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=Math.PI;root.add(g);
      const leaf=box(.9,2.1,.06,std({color:0x2c231c,roughness:.7}),0,1.05,.03,g);box(1,.08,.08,panel,0,2.14,.03,g);const knob=add(own(new THREE.SphereGeometry(.03,8,6)),MAT.brass||panel,.34,1,.08,g);
      for(const part of [leaf,knob])mark(part,card('closet'));
    }

    // ---------- walking ----------
    function contains(x,z){return x>ROOM.cx-ROOM.w/2&&x<ROOM.cx+ROOM.w/2&&z>ROOM.cz-ROOM.d/2&&z<ROOM.cz+ROOM.d/2}
    function floorAt(x,z){return contains(x,z)?0:null}
    function allowed(x,z){
      if(!contains(x,z))return false;const r=player.radius||.42;
      if(x-r<ROOM.cx-ROOM.w/2+.45||x+r>ROOM.cx+ROOM.w/2-.45||z-r<ROOM.cz-ROOM.d/2+.45||z+r>ROOM.cz+ROOM.d/2-.45)return false;
      return !blockers.some(b=>x+r>b.minX&&x-r<b.maxX&&z+r>b.minZ&&z-r<b.maxZ)}

    // ---------- doing things ----------
    function enter(){
      activate();move(ROOM.cx,ROOM.cz+ROOM.d/2-1.4,0);playSample?.('doorOpen',.8,.8);
      showNotice(`Scrooge’s chambers. A very low fire in an old Dutch fireplace, an armchair drawn up to it, the gruel on the hob. Dickens’s Christmas books are on your right. ${q('darkness')}`,11);
      analytics?.track('Room Explored',{room:'scrooge-room'})}
    function leave(){const p=corridor?.standBefore?.(DOOR,2.2)||{x:DOOR.x-2.2,z:DOOR.z,yaw:Math.PI/2};move(p.x,p.z,p.yaw);playSample?.('doorOpen',.8,.85);showNotice('The Long Corridor again.',3)}
    // The bell: what happens, second by second, once the reader has looked at it.
    const STEPS=[
      [0,()=>showNotice(`As you look at it, the bell begins to swing. ${q('swing')}`,9)],
      [6.5,()=>showNotice(`${q('cease')} They are succeeded by a clanking noise, deep down below, ${QUOTES.chain.replace(/\.$/,'')}…`,8)],
      [10,()=>{playSample?.('doorOpen',1,.45);showNotice(`${q('cellar')} and the clanking comes up the stairs, and straight towards the door.`,6)}],
      [13.5,()=>{if(fire){fire.flare=1;fire.heads=9}showNotice(`Then it stops, at the door. In the grate ${q('flame')} as though it knew him, and fell again; and for a moment the tiles are as Dickens has them: ${q('heads')}`,9)}],
      [19,()=>{reveal(true);try{storage?.setItem(FOUND_KEY,'1')}catch(e){}playSample?.('pageTurn',.6,.8);
        showNotice(table?.book?`The room is quiet again. On the little table by the fire, beside the basin, there is a book that was not there before: ${table.book.title}, Dickens’s goblin story of some bells.`:'The room is quiet again.',11)}]
    ];
    function ringOut(dt){
      if(!bell||bell.t<0)return;const before=bell.t;bell.t+=dt;const t=bell.t;
      for(const [at,run] of STEPS)if(before<at&&t>=at)run();
      // The swing: soft at first, then wide; it stops when the bells cease.
      const amp=t<2.5?.08*t/2.5:t<6.5?.5:Math.max(0,.5*(1-(t-6.5)/.6));bell.pivot.rotation.z=Math.sin(t*9)*amp;
      // The ringing: one bell, then every bell in the house; then the chain, deep below and coming up.
      const tick=Math.floor(t*4),last=Math.floor(before*4);
      if(tick!==last){
        if(t>1&&t<2.5&&tick%2===0)tone?.(1568,0,.25,.008);
        if(t>=2.5&&t<6.5){tone?.(1568,0,.3,.03);tone?.([1319,1760,2093,1175][tick%4],.05,.3,.012)}
        if(t>=7&&t<13.5&&tick%(t<10?3:2)===0)sound?.(70+tick%3*12,.12,'square',t<10?.02:.045)}
      if(t>21)bell.t=-1}
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('scrooge-'))return false;
      if(data.type==='scrooge-door'){through(data,enter);return true}
      if(data.type==='scrooge-exit'){through(data,leave);return true}
      if(data.type==='scrooge-knocker'){if(!knocker?.seen&&knocker?.t<0){showFace();return true}showNotice(`${data.title}: ${data.author}`,13);return true}
      if(data.type==='scrooge-bell'){
        if(bell?.found){showNotice(`${data.title}: ${data.author}`,11);return true}
        if(bell&&bell.t<0){bell.t=0;STEPS[0][1]()}return true}
      if(data.type==='scrooge-card'){showNotice(`${data.title}: ${data.author}`,data.author.length>260?17:data.author.length>130?12:9);return true}
      return false}

    // ---------- lifecycle ----------
    function activate(){if(!root)buildRoom();lastNeeded=time}
    function unload(){
      if(!root)return;root.removeFromParent();root.traverse(object=>{if(object.isLight)object.userData.freed=true});root=null;fire=null;bell=null;table=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0}
    function update(t){
      const dt=Math.min(.1,Math.max(0,t-time));time=t;const inside=contains(player.pos.x,player.pos.z),door=Math.hypot(player.pos.x-DOOR.x,player.pos.z-DOOR.z),near=door<PRELOAD;
      if(inside||near&&(root||window.libraryMayBuild?.()!==false))activate();
      else if(root&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==b.userData.home.parent))unload();
      // The knocker: the first time a reader comes up to the door from the corridor, Marley's face, for three seconds.
      if(knocker){
        if(!knocker.seen&&door<2.8&&corridor?.contains?.(player.pos.x,player.pos.z))showFace();
        if(knocker.t>=0){knocker.t+=dt;const k=knocker.t,o=k<.7?k/.7:k<3?1:Math.max(0,1-(k-3)/.9);knocker.faceMat.opacity=o*.92;knocker.ring.visible=knocker.boss.visible=o<.45;
          if(k>3.9){knocker.t=-1;knocker.face.visible=false;knocker.ring.visible=knocker.boss.visible=true}}}
      if(!inside||!fire)return;
      ringOut(dt);
      // The fire: a handful of coals, flickering; it leaps once when the time comes.
      fire.flare=Math.max(0,fire.flare-dt*.7);const flick=.85+Math.sin(t*7.3)*.08+Math.sin(t*13.1)*.05;
      fire.light.intensity=4.2*flick+fire.flare*9;fire.flame.scale.set?.(1+fire.flare,(.6+flick*.4)*(1+fire.flare*3),1+fire.flare);fire.flameMat.opacity=.55+fire.flare*.4;
      if(fire.heads>0){fire.heads-=dt;if(fire.tileMat.map!==fire.marley){fire.tileMat.map=fire.marley;fire.tileMat.needsUpdate=true}}
      else if(fire.tileMat.map!==fire.plain){fire.tileMat.map=fire.plain;fire.tileMat.needsUpdate=true}}
    buildDoor();
    return {contains,floorAt,allowed,interact,update,enter,leave,activate,unload,catalogue,door:DOOR,room:ROOM,groups:GROUPS,own:OWN,quotes:QUOTES,cards:CARDS,snowy,seatBooks:seatIds,
      get built(){return !!root},get books(){return books.slice()},get found(){return !!bell?.found||wasFound()},get faceSeen(){return !!knocker?.seen},get ringing(){return !!bell&&bell.t>=0},
      zoneAt:(x,z)=>contains(x,z)?'scrooge-room':null};
  };
})();
