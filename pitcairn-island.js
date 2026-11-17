// Pitcairn Island: the square at Adamstown at dawn, reached through the second ship in a bottle on the Long Corridor's
// shelf (ships-in-bottles.js, handed `bottles`). The island's one village stands at the top of the Hill of Difficulty,
// above Bounty Bay: an open-fronted public hall on the north side of the square, with the shelves and pictures, the
// church to the east with the Bounty's Bible under glass inside its door, the bell under its little roof to the west, and
// the Bounty's anchor on its plinth. Beyond the low wall on the south edge the land drops to the bay and the Pacific;
// the island rises behind. All of it painted inside a ring, with a dome of dawn sky; the square is all there is to walk.
// One light, the sun, low in the east, while the square is built.
//
// The cards keep to what is attested: the mutiny of 28 April 1789, the nine mutineers and the Polynesian men and women
// who came with them (some of the women not by choice), the burning of the ship, the killings of the early years, John
// Adams left in 1800, the Topaz in 1808, Thursday October Christian in 1814, the Bible taken away in 1839 and given back
// in 1949, the anchor raised in 1957. The shelves start with the only book here by an islander, Rosalind Amelia Young's
// history (shelves `pitcairn-*` in data/new-books.js). Every quotation (`QUOTES`) is checked against the library's own
// texts by a test. The secret is the bell: rung, it calls the island to the edge, and a sail comes up out of the sea to
// the south, in the words of the islanders who first saw the frigates of 1814; Ballantyne's The Lonely Island is then on
// the bell's ledge, found for good (athenaeum-pitcairn-sail; ?sailho).
(function(){
  'use strict';

  const GROUPS=[
    {key:'island',name:'THE ISLAND’S STORY',sub:'Told first by one of its own',wall:'west',along:0,length:3.2,max:4,ids:[]},
    {key:'bounty',name:'THE BOUNTY',sub:'The voyage, the mutiny and the hunt',wall:'north',along:-2.6,length:3.4,max:4,ids:[]},
    {key:'seas',name:'THE SOUTH SEAS',sub:'Tahiti, and those who wrote about it',wall:'east',along:0,length:3.2,max:4,ids:[]}
  ];
  // Their own words, from the library's texts, checked by a test: Rosalind Amelia Young's history (69363) and Bligh's
  // Narrative (20337). The Bounty is in italics in Young's text; the test reads letters alone.
  const QUOTES={
    cabin:'Just before sun-rising, Mr. Christian, with the master at arms, gunner’s mate, and Thomas Burket, seaman, came into my cabin while I was asleep, and seizing me, tied my hands with a cord behind my back',
    rope:'Won’t you heave us a rope now?',
    paafata:'two paafata',
    posts:'were floating in toward the shore, with their posts turned wrong end up.',
    bible:'A Bible and prayer book saved from the Bounty were the only means at his command in teaching the young people to read.',
    point:'Ship-landing Point, because it stands directly over the place where the Bounty was driven near the rocks and destroyed'
  };
  const q=key=>`“${QUOTES[key]}”`;
  const CARDS={
    sign:['Pitcairn Island','A volcanic island in the South Pacific, about two miles long, halfway between New Zealand and Peru. Its one village is Adamstown, and about forty people live there, most of them descended from the mutineers of the Bounty and the Tahitians who came with them. There is no harbour a ship can enter.'],
    mutiny:['28 April 1789',`After five months at Tahiti gathering breadfruit plants, part of the Bounty’s crew, led by Fletcher Christian, seized the ship and set Lieutenant William Bligh and eighteen men adrift in the ship’s launch. ${q('cabin')}, Bligh wrote. He sailed the launch more than three thousand six hundred nautical miles to Timor.`],
    landing:['January 1790','Christian took the Bounty back to Tahiti, then sailed away with eight other mutineers, six Polynesian men and eleven or twelve women, some of whom had not come by choice. They found Pitcairn, which the charts put in the wrong place, landed what they could, and burned the ship in the bay below. Within a few years most of the men, Polynesian and English, had been killed in quarrels over land and over the women, Christian among them. By 1800 one mutineer was left, John Adams, with the women and the children.'],
    found:['Found',`No ship called until 1808, when the American sealer Topaz, under Mayhew Folger, found the colony and its last mutineer. In 1814 two British frigates, the Briton and the Tagus, came, and a canoe came out to them with Thursday October Christian, Fletcher Christian’s son, and George Young, son of the midshipman Edward Young; from it came the call, in plain English: ${q('rope')}`],
    bible:['The Bounty’s Bible',`The ship’s Bible came ashore with the mutineers. When John Adams, the last of them, set himself to teach the island’s children, Rosalind Young writes, ${q('bible')} It was carried off the island in 1839 and ended up in Connecticut, and in 1949 it was given back. It is kept here, in the church, under glass.`],
    anchor:['The Bounty’s anchor','Raised from Bounty Bay in 1957, where the ship was burned, and set up here in the square.'],
    bell:['The bell','The bell in the square calls the island together: for church, for meetings and for work, and when a ship is sighted. It hangs under its own small roof.'],
    edge:['Bounty Bay',`Below the square the Hill of Difficulty goes down to Bounty Bay, the landing and the boat sheds, under the peak the islanders call ${q('point')}. Ships stand off, and the islanders go out to them in longboats.`],
    chart:['Admiralty Chart No. 1113, Pitcairn Island','Surveyed by Captain F. W. Beechey of HMS Blossom, who stayed at the island in December 1825, and published in 1829: the whole island, its landing places and its heights, and its profile from the sea.'],
    adams:['John Adams','The last of the mutineers, drawn by Richard Beechey, a midshipman of the Blossom, in 1825, and lithographed in 1829, the year Adams died. He had led the island for nearly thirty years.'],
    thursday:['Thursday October Christian',`Fletcher Christian’s son, born on the island in 1790, drawn in 1814 by John Shillibeer, a lieutenant of marines on the Briton, when he came out to the frigates in a canoe with George Young, and the call came from it: ${q('rope')}`],
    stamp:['A stamp of 1940','From Pitcairn’s first set of stamps, issued in 1940: a map of the Pacific, with the island halfway between New Zealand and South America.'],
    church:['The church','The island’s church faces the square, across from the public hall. Its door stands open.'],
    island:['The island’s story','Rosalind Amelia Young’s history of her island first: the only book here by an islander. Then Barrow’s history of 1831, from the Admiralty’s papers.'],
    bounty:['The Bounty','The voyage, the mutiny and the hunt: Bligh’s own two accounts, and the Pandora, sent to bring the mutineers home.'],
    seas:['The South Seas','Tahiti, and those who wrote about it: Cook’s journal of the Endeavour’s voyage, when Joseph Banks first saw the breadfruit, and Frederick O’Brien’s Tahiti of 1921.']
  };
  const PICTURES={
    adrift:{file:'pitcairn-adrift',title:'The Mutineers turning Lieut. Bligh adrift',credit:'Robert Dodd, 1790. Royal Museums Greenwich. Public domain, from Wikimedia Commons.',ratio:.76,card:'mutiny'},
    chart:{file:'pitcairn-chart',title:'Admiralty Chart No. 1113, Pitcairn Island, 1829',credit:'Surveyed by F. W. Beechey, 1825; published 1829. United Kingdom Hydrographic Office. Public domain, from Wikimedia Commons.',ratio:.76,card:'chart'},
    draught:{file:'pitcairn-draught',title:'The Bounty’s sheer draught, 1787',credit:'Admiralty ship plan, 1787. Royal Museums Greenwich. Public domain, from Wikimedia Commons.',ratio:.61,card:'mutiny'},
    thursday:{file:'pitcairn-thursday',title:'Thursday October Christian, 1814',credit:'John Shillibeer, 1814. State Library of New South Wales. Public domain, from Wikimedia Commons.',ratio:1.25,card:'thursday'},
    adams:{file:'pitcairn-adams',title:'John Adams',credit:'Lithograph by J. A. Vinter after Richard Beechey, 1829. British Museum. Public domain, from Wikimedia Commons.',ratio:1.3,card:'adams'},
    stamp:{file:'pitcairn-stamp-3',title:'A Pitcairn stamp of 1940',credit:'Pitcairn Islands threepenny stamp, 1940. Public domain, from Wikimedia Commons.',ratio:.67,card:'stamp'},
    house:{file:'pitcairn-house',title:'John Adams’s house and grave, 12 August 1849',credit:'Edward Gennys Fanshawe, 1849. Public domain, from Wikimedia Commons.',ratio:.85,card:'landing'},
    bay:{file:'pitcairn-bay',title:'Bounty Bay',credit:'From Lady Belcher, The Mutineers of the Bounty, 1870. Public domain, from Wikimedia Commons.',ratio:.63,card:'edge'}
  };
  const FOUND_KEY='athenaeum-pitcairn-sail';

  window.createPitcairnIsland=function(options){
    const {THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,arrivals={},showNotice,playSample,move,analytics,isHolding=()=>false,registerSeat=null,
      bottles=null,showPicture=null,tone=null,storage=null,search='',pictures='assets/pictures/'}=options;
    const SQ={cx:2600,cz:900,w:16,d:12},HALL={depth:5,w:10,h:3.4};
    const x0=SQ.cx-SQ.w/2,x1=SQ.cx+SQ.w/2,z0=SQ.cz-SQ.d/2,z1=SQ.cz+SQ.d/2,hz=z0+HALL.depth,hx0=SQ.cx-HALL.w/2,hx1=SQ.cx+HALL.w/2;
    const KEEP=25,R=24,EYE=1.72,HORIZON=.59,PANO=24;
    const wasFound=()=>{try{return storage?.getItem(FOUND_KEY)==='1'||/[?&](sailho|sail-ho)\b/.test(search)}catch(e){return false}};
    let root=null,time=0,lastNeeded=-1e9,sail=null,ringing=null,ledge=null,ledgeBook=null;
    const owned=[],ours=[],books=[],blockers=[];
    const own=thing=>{owned.push(thing);return thing};
    const std=params=>own(new THREE.MeshStandardMaterial(params));
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const card=key=>({type:'pitcairn-card',key,title:CARDS[key][0],author:CARDS[key][1],action:'READ'});
    function sign(parent,text,sub,w,h,x,y,z){
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle='#f2ead6';c.fillRect(0,0,W,H);c.strokeStyle='#7a4a2a';c.lineWidth=3;c.strokeRect(7,7,W-14,H-14);
        c.fillStyle='#2a1c10';c.textAlign='center';c.font='bold 27px Georgia';c.fillText(text,W/2,sub?50:H/2+10);if(sub){c.font='italic 19px Georgia';c.fillText(sub,W/2,82)}},620,sub?104:70));
      return add(own(new THREE.PlaneGeometry(w,h)),std({map,emissive:0x3a3024,emissiveIntensity:.2,roughness:.9}),x,y,z,parent)}
    const shelfBooks=(ids,key,max)=>[...new Set([...ids,...(arrivals[key]||[])])].map(id=>findBook(id)).filter(Boolean).slice(0,max);
    function catalogue(){return {groups:GROUPS.map(group=>({...group,books:shelfBooks(group.ids,group.key,group.max)})),bell:shelfBooks([],'bell',1)}}

    // ---------- the bottle on the corridor's shelf: the Bounty under sail for a steep green island ----------
    bottles?.add({key:'pitcairn',title:'Pitcairn Island',label:'PITCAIRN',author:'A ship under full sail for a small, steep island in a wide sea, with a wisp of cloud on its height.',
      island:[[.1,.035,.055],[.125,.03,.045]],land:0x3f6b3a,enter});

    // ---------- the square ----------
    function buildSquare(){
      root=new THREE.Group();root.name='pitcairn';const {cx,cz,w,d}=SQ;
      // The ground: the square's concrete, red dust at its edges, and the low wall along the south edge.
      const ground=own(canvasTexture((c,W,H)=>{c.fillStyle='#a89c8a';c.fillRect(0,0,W,H);let k=5;const r=()=>(k=(k*9301+49297)%233280)/233280;for(let i=0;i<900;i++){c.fillStyle=`rgba(${120+r()*60},${70+r()*30},${50+r()*20},${r()*.18})`;c.fillRect(r()*W,r()*H,2+r()*8,2+r()*8)}
        c.strokeStyle='rgba(60,50,40,.25)';c.lineWidth=2;for(let x=0;x<W;x+=64){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke()}for(let y=0;y<H;y+=64){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke()}},256,256));
      ground.wrapS=ground.wrapT=THREE.RepeatWrapping;ground.repeat?.set?.(5,4);
      box(w+6,.3,d+6,std({color:0xb0a28e,map:ground,roughness:.95}),cx,-.15,cz,root);
      const stone=std({color:0x6a5a4a,roughness:.95}),white=std({color:0xeeeae0,roughness:.75}),roof=std({color:0x8a3a2a,roughness:.8}),wood=MAT.darkWood||std({color:0x3a2416,roughness:.7});
      const wall=box(w,.7,.4,stone,cx,.35,z1+.2,root);mark(wall,card('edge'));
      mark(sign(root,'PITCAIRN ISLAND','Adamstown · the square',2.6,.42,cx,HALL.h-.4,z0+.17),card('sign'));
      buildHall(white,roof,wood);buildChurch(white,roof);buildBell(wood,roof);buildAnchor(stone);buildTrees();buildView();
      // The sun, low over the sea to the east, while the square is built: its one light.
      const sun=new THREE.DirectionalLight(0xffd2a0,1.3);sun.position.set(cx+30,8,cz+10);sun.target.position.set(cx,0,cz);root.add(sun);root.add(sun.target);
      scene.add(root);
    }
    // The public hall: open to the square on its south side, with the shelves, the pictures and a table with the bottle home.
    function buildHall(white,roof,wood){
      const {cx}=SQ,h=HALL.h;
      const boards=own(canvasTexture((c,W,H)=>{c.fillStyle='#e6dccb';c.fillRect(0,0,W,H);for(let y=0;y<H;y+=28){c.fillStyle='rgba(90,70,50,.22)';c.fillRect(0,y,W,2)}},256,256));boards.wrapS=boards.wrapT=THREE.RepeatWrapping;boards.repeat?.set?.(4,1.4);
      const wallMat=std({color:0xe6dccb,map:boards,roughness:.9});
      box(HALL.w,h,.3,wallMat,cx,h/2,z0,root);box(.3,h,HALL.depth,wallMat,hx0,h/2,z0+HALL.depth/2,root);box(.3,h,HALL.depth,wallMat,hx1,h/2,z0+HALL.depth/2,root);
      box(HALL.w+.6,.14,HALL.depth+.8,roof,cx,h+.07,z0+HALL.depth/2+.2,root);box(HALL.w,.04,HALL.depth,std({color:0xf0ebe0,roughness:.9}),cx,h-.03,z0+HALL.depth/2,root);for(const px of [hx0+.15,cx-1.7,cx+1.7,hx1-.15])box(.16,h,.16,white,px,h/2,hz,root);box(HALL.w,.2,.2,white,cx,h-.1,hz,root);
      block(cx,z0+.1,HALL.w,.5);block(hx0,z0+HALL.depth/2,.5,HALL.depth);block(hx1,z0+HALL.depth/2,.5,HALL.depth);
      const {groups}=catalogue(),geometry=own(new THREE.BoxGeometry(.62,.86,.12));
      for(const group of groups){
        const n=Math.max(1,group.books.length),step=Math.min(1.05,(group.length-.3)/n);
        group.books.forEach((book,i)=>placeBook(book,{...shelfSpot(group,(i-(n-1)/2)*step),y:1.25},geometry,group.key));
        const s=shelfSpot(group,0,.34),label=sign(root,group.name,group.sub,2.3,.38,0,2.03,0);
        if(group.wall==='north'){box(group.length,.05,.34,wood,s.x,.8,s.z,root);label.position.set(s.x,2.03,z0+.17)}
        else{const side=group.wall==='west'?-1:1;box(.34,.05,group.length,wood,s.x,.8,s.z,root);label.position.set(side<0?hx0+.17:hx1-.17,2.03,s.z);label.rotation.y=-side*Math.PI/2}
        mark(label,card(group.key));
      }
      // The pictures: Dodd's print and the chart on the north wall, the draught between; the two portraits on the west
      // wall over the island's shelf, the house and the bay on the east wall over the South Seas.
      hang('adrift',cx+.15,2.65,z0+.17,0,.95);hang('chart',cx+1.65,2.65,z0+.17,0,1.05);hang('draught',cx+3.35,2.6,z0+.17,0,1.15);
      hang('thursday',hx0+.17,2.75,z0+1.6,Math.PI/2,.5);hang('adams',hx0+.17,2.75,z0+3.3,Math.PI/2,.5);
      hang('house',hx1-.17,2.72,z0+1.6,-Math.PI/2,.72);hang('stamp',cx-1.9,2.65,z0+.17,0,.42);hang('bay',hx1-.17,2.72,z0+3.4,-Math.PI/2,.9);
      buildTable(cx-.3,z0+2.95,wood);
    }
    function shelfSpot(group,offset,inset=.3){
      const {cx}=SQ;if(group.wall==='north')return {x:cx+group.along+offset,z:z0+inset,yaw:0};
      const side=group.wall==='west'?-1:1;return {x:(side<0?hx0:hx1)-side*inset,z:z0+HALL.depth/2+group.along-side*offset,yaw:-side*Math.PI/2}}
    function placeBook(book,spot,geometry,shelf,parent=root){
      const mesh=add(geometry,own(bookMaterial(book)),spot.x,spot.y,spot.z,parent);mesh.rotation.order='YXZ';mesh.rotation.y=spot.yaw||0;mesh.rotation.x=spot.tilt??-.08;
      mesh.userData={type:'book',book,loaded:false,pitcairn:true,shelf,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent}};
      interactables.push(mesh);ours.push(mesh);books.push(mesh);return mesh}
    function hang(key,x,y,z,yaw,width){
      const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=yaw;root.add(g);const p=PICTURES[key],height=width*p.ratio;
      const data={type:'pitcairn-picture',picture:key,title:p.title,author:CARDS[p.card][1],action:'LOOK CLOSELY'};
      const frame=mark(box(width+.1,height+.1,.04,MAT.darkWood||std({color:0x2c1c12,roughness:.6}),0,0,0,g),data);
      const mat=std({color:0x9a927f,roughness:.9}),sheet=mark(add(own(new THREE.PlaneGeometry(width,height)),mat,0,0,.025,g),data);
      try{new THREE.TextureLoader().load(`${pictures}${p.file}-wall.jpg`,texture=>{if(!root)return texture.dispose?.();texture.colorSpace=THREE.SRGBColorSpace;own(texture);mat.map=texture;mat.color?.set?.(0xd8d4c8);mat.needsUpdate=true;
        const image=texture.image;if(image?.width&&image?.height){const k=image.height/image.width/p.ratio;sheet.scale.y=k;frame.scale.y=(height*k+.1)/(height+.1)}})}catch(e){}
      return g}
    // A long table with a bench either side (the library's seats), and the bottle home on it.
    function buildTable(x,z,wood){
      const g=new THREE.Group();g.position.set(x,0,z);root.add(g);box(2.6,.06,.9,wood,0,.76,0,g);for(const [lx,lz] of [[-1.2,-.38],[1.2,-.38],[-1.2,.38],[1.2,.38]])box(.07,.74,.07,wood,lx,.37,lz,g);
      block(x,z,2.8,1);
      for(const side of [-1,1]){const bench=new THREE.Group();bench.position.set(x,0,z+side*.85);root.add(bench);const parts=[box(2.4,.05,.34,wood,0,.45,0,bench)];for(const lx of [-1.05,1.05])box(.06,.44,.3,wood,lx,.22,0,bench);
        block(x,z+side*.85,2.5,.4);registerSeat?.(parts,bench,new THREE.Vector3(.4,1.15,0),side<0?0:Math.PI,{title:'A bench at the hall table',author:'Sit at the long table in the hall and read one of the island’s books.',bookIds:books.map(b=>b.userData.book.id)});for(const part of parts)ours.push(part)}
      // The bottle home: the same ship, lying in its cradle, with a brass plate naming where it goes.
      const glass=std({color:0xd9efe6,transparent:true,opacity:.22,roughness:.05,metalness:.1,depthWrite:false}),exit={type:'pitcairn-exit',title:'Back to the Long Corridor',author:'Into the bottle, and out again on the shelf in the Long Corridor, towards the Grand Hall.',action:'RETURN'};
      const b=new THREE.Group();b.position.set(.85,.9,-.2);g.add(b);const body=add(own(new THREE.CylinderGeometry(.085,.085,.38,18,1,true)),glass,0,0,0,b);body.rotation.z=Math.PI/2;
      const neck=add(own(new THREE.CylinderGeometry(.028,.032,.12,10,1,true)),glass,-.25,0,0,b);neck.rotation.z=Math.PI/2;add(own(new THREE.CylinderGeometry(.026,.022,.05,10)),std({color:0x9a7448,roughness:.9}),-.33,0,0,b).rotation.z=Math.PI/2;
      const hull=box(.12,.022,.035,std({color:0x3b2414,roughness:.6}),-.04,-.03,0,b);box(.003,.1,.003,std({color:0x5a3a1e}),-.04,.02,0,b);add(own(new THREE.PlaneGeometry(.05,.05)),std({color:0xf1e9d4,side:THREE.DoubleSide}),-.04,.02,.003,b);
      box(.4,.03,.12,wood,0,-.1,0,b);
      const plate=own(canvasTexture((c,W,H)=>{c.fillStyle='#caa15a';c.fillRect(0,0,W,H);c.strokeStyle='#6b4d22';c.lineWidth=4;c.strokeRect(5,5,W-10,H-10);c.fillStyle='#2b1d0e';c.textAlign='center';
        c.font='bold 26px Georgia';c.fillText('THE LONG CORRIDOR',W/2,40);c.font='italic 18px Georgia';c.fillText('towards the Grand Hall',W/2,68)},400,86));
      const label=add(own(new THREE.PlaneGeometry(.34,.075)),std({map:plate,roughness:.5,metalness:.3}),0,-.1,.065,b);
      // And standing behind it, a brass sign that can be read from across the room, so the way home is not missed.
      const signTex=own(canvasTexture((c,W,H)=>{c.fillStyle='#c9a057';c.fillRect(0,0,W,H);c.strokeStyle='#6b4d22';c.lineWidth=6;c.strokeRect(8,8,W-16,H-16);c.fillStyle='#2b1d0e';c.textAlign='center';
        c.font='bold 40px Georgia';c.fillText('THE WAY HOME',W/2,66);c.font='italic 32px Georgia';c.fillText('look into the bottle',W/2,112);c.font='bold 28px Georgia';c.fillText('THE LONG CORRIDOR',W/2,150)},420,180));
      const signMat=std({map:signTex,roughness:.45,metalness:.35}),brassMat=std({color:0xb08d3a,metalness:.6,roughness:.4}),sign=[];
      for(const side of [1,-1]){const face=add(own(new THREE.PlaneGeometry(.36,.155)),signMat,0,.12,-.13+side*.004,b);if(side<0)face.rotation.y=Math.PI;sign.push(face)}
      sign.push(box(.37,.165,.006,brassMat,0,.12,-.13,b),box(.012,.14,.012,brassMat,0,-.03,-.13,b),box(.09,.012,.05,brassMat,0,-.1,-.13,b));
      for(const part of [body,neck,hull,label,...sign])mark(part,exit);
    }
    // The church on the east side of the square: a white front with a red gable, its doors open, and just inside, the
    // Bounty's Bible open under glass on a small table.
    function buildChurch(white,roof){
      const g=new THREE.Group();g.position.set(x1+.3,0,SQ.cz+1.2);root.add(g);const data=card('church'),bibleData={...card('bible'),action:'LOOK'};
      const front=[box(.3,3.4,2.2,white,0,1.7,-2.6,g),box(.3,3.4,2.2,white,0,1.7,2.6,g),box(.3,.9,3,white,0,2.95,0,g)];for(const part of front)mark(part,data);
      const gable=add(own(new THREE.ConeGeometry(4.6,1.8,4,1)),roof,1.6,4.3,0,g);gable.rotation.y=Math.PI/4;gable.scale.set(.75,1,1.25);mark(gable,data);
      // Its walls, white outside, and inside dim: dark boards, a dark floor, and the case on its table by the door.
      const inside=std({color:0x3a302a,roughness:1});for(const zz of [-3.6,3.6]){box(4,3.4,.2,white,2,1.7,zz,g);box(4,3.4,.04,inside,2,1.7,zz-Math.sign(zz)*.12,g)}
      box(.2,3.4,7.2,inside,4,1.7,0,g);box(4,.1,7.2,inside,2,3.35,0,g);box(4,.02,7,inside,2,.01,0,g);
      const page=own(canvasTexture((c,W,H)=>{c.fillStyle='#d9cba8';c.fillRect(0,0,W,H);c.fillStyle='rgba(90,60,30,.4)';c.fillRect(W/2-3,0,6,H);c.fillStyle='#3a2a1a';for(let col=0;col<2;col++)for(let i=0;i<20;i++)c.fillRect(col*W/2+30,30+i*22,W/2-60-(i%5)*6,4);
        c.fillStyle='#8a2a1a';c.font='bold 22px Georgia';c.textAlign='center';c.fillText('THE HOLY BIBLE',W*.75,24)},512,480));
      const t=new THREE.Group();t.position.set(.75,0,0);g.add(t);box(.7,.8,.9,std({color:0x4a3020,roughness:.6}),0,.4,0,t);
      const bible=add(own(new THREE.PlaneGeometry(.5,.36)),std({map:page,roughness:.9,emissive:0x2a2018,emissiveIntensity:.4}),0,.83,0,t);bible.rotation.x=-Math.PI/2;bible.rotation.z=Math.PI/2;
      const glassCase=box(.64,.22,.8,std({color:0xdfeee8,transparent:true,opacity:.12,roughness:.05}),0,.92,0,t);for(const part of [bible,glassCase])mark(part,bibleData);
      block(x1+.3,SQ.cz+1.2,.6,7.2);block(x1+1.05,SQ.cz+1.2,1,1.2);
    }
    // The bell under its own small roof, on the west side of the square, with a ledge where the book is left.
    function buildBell(wood,roof){
      const g=new THREE.Group();g.position.set(x0+1.6,0,SQ.cz+2.6);root.add(g);
      for(const [px,pz] of [[-.6,-.6],[.6,-.6],[-.6,.6],[.6,.6]])box(.12,2.8,.12,wood,px,1.4,pz,g);box(1.6,.1,1.6,roof,0,2.85,0,g);box(1.3,.12,.12,wood,0,2.5,0,g);
      const bronze=std({color:0x8a6a32,metalness:.7,roughness:.35}),swing=new THREE.Group();swing.position.set(0,2.44,0);g.add(swing);
      const bell=add(own(new THREE.CylinderGeometry(.12,.26,.38,18,1,true)),bronze,0,-.22,0,swing);bell.material.side=THREE.DoubleSide;add(own(new THREE.SphereGeometry(.12,14,8,0,Math.PI*2,0,Math.PI/2)),bronze,0,-.03,0,swing);
      const rope=add(own(new THREE.CylinderGeometry(.012,.012,1.4,6)),std({color:0xc9b48a,roughness:1}),.08,-.95,0,swing);
      const data={type:'pitcairn-bell',title:'The bell',author:CARDS.bell[1],action:'RING'};for(const part of [bell,rope])mark(part,data);
      ledge=new THREE.Group();ledge.position.set(0,1.05,-.62);g.add(ledge);box(1.1,.05,.24,wood,0,0,0,ledge);
      ringing={swing,t:-1};block(x0+1.6,SQ.cz+2.6,1.5,1.5);
      if(wasFound())leaveBook();
    }
    function leaveBook(){
      const book=catalogue().bell[0];if(!book||ledgeBook||!ledge)return;
      ledgeBook=placeBook(book,{x:0,y:.03,z:0,yaw:0,tilt:-Math.PI/2},own(new THREE.BoxGeometry(.62,.86,.12)),'bell',ledge)}
    // The Bounty's anchor on a stone plinth by the bell.
    function buildAnchor(stone){
      const g=new THREE.Group();g.position.set(x0+3.6,0,z1-1.4);g.rotation.y=.4;root.add(g);const iron=std({color:0x3a3430,metalness:.5,roughness:.75}),data=card('anchor');
      const plinth=box(1.6,.5,.7,stone,0,.25,0,g);const shank=add(own(new THREE.CylinderGeometry(.06,.07,1.7,10)),iron,0,.62,0,g);shank.rotation.z=Math.PI/2;
      const arms=add(own(new THREE.TorusGeometry(.42,.06,8,20,Math.PI)),iron,.85,.62,0,g);arms.rotation.z=-Math.PI/2;const stock=add(own(new THREE.CylinderGeometry(.05,.05,1,8)),iron,-.78,.62,0,g);stock.rotation.x=Math.PI/2;
      for(const part of [plinth,shank,arms,stock])mark(part,data);block(x0+3.6,z1-1.4,1.8,1.2);
    }
    // A few coconut palms and a banyan's shade at the square's edges.
    function buildTrees(){
      const trunk=std({color:0x6a5440,roughness:.9}),frond=std({color:0x3f6b30,roughness:.85,side:THREE.DoubleSide});
      for(const [px,pz,lean] of [[x0+.6,z1-.6,.15],[x1-.6,z1-.4,-.12],[x0+.4,SQ.cz-1,.08]]){const g=new THREE.Group();g.position.set(px,0,pz);g.rotation.z=lean;root.add(g);add(own(new THREE.CylinderGeometry(.1,.16,5.4,8)),trunk,0,2.7,0,g);
        for(let i=0;i<8;i++){const leaf=add(own(new THREE.PlaneGeometry(.5,2.4)),frond,0,5.4,0,g);leaf.rotation.order='YXZ';leaf.rotation.set(-1.1,i*.785,0);leaf.translateY?.(1)}block(px,pz,.5,.5)}
    }
    // The view: the sea to the south far below and the bay under the hill, the island rising behind, and the dawn in the
    // east. One painted ring all the way round, a dome of sky, and a sail that comes up when the bell has been rung.
    function buildView(){
      const {cx,cz}=SQ;
      const pano=own(canvasTexture((c,W,H)=>{c.translate(W,0);c.scale(-1,1);// seen from inside: drawn mirrored. North at 0 and W, east at W/4, south at W/2, west at 3W/4.
        const sky=c.createLinearGradient(0,0,0,H*HORIZON);sky.addColorStop(0,'#2a3a66');sky.addColorStop(.6,'#7a7aa0');sky.addColorStop(1,'#e8b48c');c.fillStyle=sky;c.fillRect(0,0,W,H);
        const dawn=c.createRadialGradient(W*.25,H*HORIZON,4,W*.25,H*HORIZON,W*.18);dawn.addColorStop(0,'rgba(255,214,150,.95)');dawn.addColorStop(1,'rgba(255,170,120,0)');c.fillStyle=dawn;c.fillRect(0,0,W,H*HORIZON);
        let k=23;const r=()=>(k=(k*9301+49297)%233280)/233280;c.fillStyle='rgba(255,236,210,.55)';for(let i=0;i<14;i++){const cxx=r()*W,cy=H*(.2+r()*.25);c.beginPath();c.ellipse(cxx,cy,40+r()*90,6+r()*6,0,0,7);c.fill()}
        const sea=c.createLinearGradient(0,H*HORIZON,0,H);sea.addColorStop(0,'#5a7aa6');sea.addColorStop(1,'#1d3a5a');c.fillStyle=sea;c.fillRect(0,H*HORIZON,W,H);
        c.fillStyle='rgba(255,220,170,.4)';for(let i=0;i<60;i++)c.fillRect(W*(.2+r()*.1),H*(HORIZON+.005+r()*.08),6+r()*20,1);
        // The island behind (north, at both ends) rising green above the horizon, and falling to the sea at east and west.
        const hill=(from,to,top)=>{c.fillStyle='#2f5a2a';c.beginPath();c.moveTo(W*from,H*.75);for(let t=0;t<=1.0001;t+=.02){const x=from+(to-from)*t,bump=Math.sin(Math.PI*t);c.lineTo(W*x,H*(HORIZON+.05-bump*top-.015*Math.sin(t*31)))}c.lineTo(W*to,H);c.lineTo(W*from,H);c.fill()};
        hill(-.02,.2,.22);hill(.8,1.02,.22);
        // The bay below the square to the south: cliffs either side, the landing and the boat sheds, a longboat.
        c.fillStyle='#3d6a34';c.beginPath();c.moveTo(W*.36,H);c.lineTo(W*.36,H*.72);c.quadraticCurveTo(W*.43,H*.66,W*.46,H*.74);c.lineTo(W*.47,H);c.fill();
        c.beginPath();c.moveTo(W*.64,H);c.lineTo(W*.64,H*.7);c.quadraticCurveTo(W*.57,H*.66,W*.53,H*.75);c.lineTo(W*.52,H);c.fill();
        c.fillStyle='rgba(255,255,255,.6)';for(let i=0;i<30;i++)c.fillRect(W*(.47+r()*.06),H*(.8+r()*.03),4+r()*8,1.5);
        c.fillStyle='#8a5a3a';c.fillRect(W*.52,H*.77,W*.012,H*.02);c.fillRect(W*.534,H*.772,W*.01,H*.018);c.fillStyle='#d8d8d0';c.fillRect(W*.505,H*.8,W*.012,3);
        // The near slopes, under the square's wall.
        c.fillStyle='#2b4f26';c.beginPath();c.moveTo(0,H);for(let x=0;x<=W;x+=24)c.lineTo(x,H*(.86+.02*Math.sin(x*.01)));c.lineTo(W,H);c.fill()},4096,512));
      const g=new THREE.Group();g.position.set(cx,0,cz);root.add(g);
      const ring=add(own(new THREE.CylinderGeometry(R,R,PANO,64,1,true,-Math.PI,Math.PI*2)),own(new THREE.MeshBasicMaterial({map:pano,side:THREE.BackSide,fog:false})),0,EYE+PANO*(HORIZON-.5),0,g);ring.raycast=()=>{};
      const domeTex=own(canvasTexture((c,W,H)=>{const gr=c.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#1e2c55');gr.addColorStop(1,'#2a3a66');c.fillStyle=gr;c.fillRect(0,0,W,H)},64,64));
      const dome=add(own(new THREE.SphereGeometry(R+.5,32,12,0,Math.PI*2,0,Math.PI/2)),own(new THREE.MeshBasicMaterial({map:domeTex,side:THREE.BackSide,fog:false})),0,EYE+PANO*HORIZON-.4,0,g);dome.raycast=()=>{};
      // The ring's own foot, far below the square, so that nothing of the library shows under the painted bay.
      const under=add(own(new THREE.CircleGeometry(R-.2,48)),own(new THREE.MeshBasicMaterial({color:0x22421f,fog:false})),0,EYE+PANO*(HORIZON-.5)-PANO/2+.05,0,g);under.rotation.x=-Math.PI/2;under.raycast=()=>{};
      // The sail, far out to the south-south-east (east is +x), hidden until the bell has been rung.
      const sailTex=own(canvasTexture((c,W,H)=>{c.clearRect(0,0,W,H);c.fillStyle='#f6efe0';c.beginPath();c.moveTo(W*.5,H*.05);c.lineTo(W*.8,H*.75);c.lineTo(W*.2,H*.75);c.fill();c.fillStyle='#3a2a1e';c.fillRect(W*.15,H*.75,W*.7,H*.12)},64,64));
      sail=add(own(new THREE.PlaneGeometry(.9,.9)),own(new THREE.MeshBasicMaterial({map:sailTex,transparent:true,depthWrite:false,fog:false})),0,EYE+.25,R-.8,g);sail.position.x=3.5;sail.rotation.y=Math.PI;sail.raycast=()=>{};sail.visible=false;sail.userData.rise=0;
    }

    // ---------- walking ----------
    function contains(x,z){return x>x0&&x<x1&&z>z0&&z<z1}
    function floorAt(x,z){return contains(x,z)?0:null}
    function allowed(x,z){
      if(!contains(x,z))return false;const r=player.radius||.42;
      if(x-r<x0+.4||x+r>x1-.4||z-r<z0+.45||z+r>z1-.1)return false;
      // The hall's back corners are outside it, behind its side walls.
      if(z<hz&&(x<hx0||x>hx1))return false;
      return !blockers.some(b=>x+r>b.minX&&x-r<b.maxX&&z+r>b.minZ&&z-r<b.maxZ)}

    // ---------- doing things ----------
    function enter(){
      activate();move(SQ.cx,SQ.cz+1.6,0);playSample?.('pageTurn',.35,.6);
      showNotice('Pitcairn Island, at dawn: the square at Adamstown, high above Bounty Bay. The public hall is open in front of you, with the island’s books; the church is to your right, the bell and the Bounty’s anchor to your left. The bottle you came through is on the hall table.',14);
      analytics?.track('Room Explored',{room:'pitcairn'})}
    function leave(){const p=bottles?.standBefore?.('pitcairn')||{x:1701,z:-2,yaw:-Math.PI/2};move(p.x,p.z,p.yaw);playSample?.('pageTurn',.35,.6);showNotice('The Long Corridor again, and the bottle back on its shelf.',4)}
    function ring(){
      if(!ringing)return;ringing.t=0;for(let i=0;i<5;i++)tone?.(392,i*.9,1.6,.05);
      const first=!wasFound();if(sail){sail.visible=true;sail.userData.rise=0}
      if(first){try{storage?.setItem(FOUND_KEY,'1')}catch(e){}analytics?.track('Secret Found',{room:'pitcairn',secret:'sail-ho'})}
      showNotice(first?`The bell rings out over the square, and far out to the south-east a sail is coming up out of the sea. When the first frigates came in 1814, the young woman who saw them ran to tell the others that ${q('paafata')}, the goats’ feeding platforms on their four posts, ${q('posts')} Someone has left a book on the ledge under the bell.`:'The bell rings out, and far out to the south-east the sail comes up again.',first?14:6);
      if(first)leaveBook()}
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('pitcairn-'))return false;
      if(data.type==='pitcairn-exit'){leave();return true}
      if(data.type==='pitcairn-bell'){ring();return true}
      if(data.type==='pitcairn-picture'){const p=PICTURES[data.picture];if(showPicture)showPicture({kicker:'PITCAIRN ISLAND',title:p.title,src:`${pictures}${p.file}.jpg`,caption:data.author,credit:p.credit});else showNotice(`${p.title}: ${data.author}`,12);return true}
      if(data.type==='pitcairn-card'){showNotice(`${data.title}: ${data.author}`,data.author.length>320?18:data.author.length>160?13:9);return true}
      return false}

    // ---------- lifecycle ----------
    function activate(){if(!root)buildSquare();lastNeeded=time}
    function unload(){
      if(!root)return;root.removeFromParent();root.traverse(object=>{if(object.isLight)object.userData.freed=true});root=null;sail=null;ringing=null;ledge=null;ledgeBook=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0}
    function update(t){
      // Built ahead while the reader stands by the bottles' shelf, so that looking in does not wait.
      const dt=Math.min(.1,Math.max(0,t-time));time=t;const inside=contains(player.pos.x,player.pos.z),bay=bottles?.bay,near=!!bay&&Math.hypot(player.pos.x-bay.x,player.pos.z-bay.z)<3.2;
      if(inside||near&&(root||window.libraryMayBuild?.()!==false))activate();
      else if(root&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==b.userData.home.parent))unload();
      if(!inside||!root)return;
      if(ringing&&ringing.t>=0){ringing.t+=dt;ringing.swing.rotation.x=Math.sin(ringing.t*4.2)*.35*Math.max(0,1-ringing.t/4.5);if(ringing.t>4.5)ringing.t=-1}
      if(sail?.visible&&sail.userData.rise<1){sail.userData.rise=Math.min(1,sail.userData.rise+dt/6);sail.position.y=EYE-.35+.6*sail.userData.rise}}
    return {contains,floorAt,allowed,interact,update,enter,leave,activate,unload,catalogue,square:SQ,hall:HALL,groups:GROUPS,quotes:QUOTES,cards:CARDS,pictures:PICTURES,
      get built(){return !!root},get books(){return books.slice()},get found(){return wasFound()},get sailing(){return !!sail?.visible},zoneAt:(x,z)=>contains(x,z)?'pitcairn':null};
  };
})();
