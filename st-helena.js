// St Helena: the lawn of Plantation House on a misty afternoon, reached through the fourth ship in a bottle on the Long
// Corridor's shelf (ships-in-bottles.js, handed `bottles`). Plantation House, built for the East India Company's governors
// in 1792, stands in the green hills in the middle of the island, where Darwin found the vegetation "decidedly British";
// its lawn is where Jonathan lives, the giant tortoise who came from the Seychelles in 1882, already full grown, and is
// thought to be the oldest living land animal. The library has put a small stone garden room at the lawn's edge, open to
// the grass, with the island's books, its pictures and the bottle home; the lawn runs out before it, with Jonathan and two
// other tortoises on it and a bench; all round, painted inside a ring, are the house among its trees, the Norfolk pines,
// the hills going up into cloud towards Diana's Peak, and to the west, far below, the sea. Two lights: the hazy sun, and
// the lamp in the garden room.
//
// The cards keep to what is attested: found uninhabited by the Portuguese in 1502; the East India Company from 1659;
// Napoleon's exile from October 1815 to his death at Longwood on 5 May 1821, and his body taken to France in 1840; the
// Liberated Africans landed at Rupert's Valley from 1840; the Boer prisoners of 1900 to 1902; Jacob's Ladder; the
// wirebird; the islanders, who call themselves Saints. Every quotation (`QUOTES`) is checked against the library's own
// texts by a test: Darwin, who called in 1836; Cook in 1771; Slocum in 1898, who slept in Plantation House's haunted
// west room.
//
// The secret is Jonathan. He is not to be hurried: stand still on the lawn near him, and he comes over, at a tortoise's
// pace, to see who it is. The first time he arrives, D. H. Lawrence's Tortoises is on the bench (shelf
// `st-helena-jonathan`), found for good (athenaeum-sthelena-jonathan; ?jonathan).
(function(){
  'use strict';

  // The library's own books that call at the island: Napoleon's exile on the captive's shelf (the Tragedy of St Helena),
  // and the voyages that called there on the other (Cook in 1771, Darwin in 1836, Slocum in 1898).
  const OWN={captive:[15246],callers:[944,8106,6317]};
  const SECRET='st-helena-jonathan';
  const GROUPS=[
    {key:'captive',name:'THE CAPTIVE',sub:'Napoleon on St Helena, 1815 to 1821',wall:'west',max:6,ids:OWN.captive},
    {key:'callers',name:'SHIPS THAT CALLED',sub:'Cook, Darwin and Slocum',wall:'east',max:6,ids:OWN.callers}
  ];
  // Their own words, from the library's texts, checked by a test (letters alone).
  const QUOTES={
    castle:'rises abruptly like a huge black castle from the ocean',
    tomb:'I obtained lodgings within a stone’s throw of Napoleon’s tomb',
    british:'it is surprising to behold a vegetation possessing a character decidedly British',
    clouds:'every now and then the whole scene was veiled in thick clouds',
    freedom:'Now that the people are blessed with freedom, a right which I believe they value fully',
    sixty:'One large tortoise, which I watched, walked at the rate of sixty yards in ten minutes',
    backs:'I frequently got on their backs',
    speck:'Oh, what a speck in the sea!',
    face:'thinking that maybe I should meet the great Napoleon face to face',
    beacon:'I watched the beacon-light at Plantation House, the governor’s parting signal',
    tragedies:'St. Helena has been an island of tragedies',
    crime:'not one criminal case had come to court within the year',
    cook:'At Noon Anchor’d in the Road, before James’s Fort',
    themistocles:'I come, like Themistocles, to throw myself upon the hospitality of the British people',
    questions:'whom they overwhelmed with the most whimsical and ridiculous questions',
    ball:'We have been to a masked ball',
    ageless:'you make slow, ageless progress'
  };
  const SOURCES={castle:944,tomb:944,british:944,clouds:944,freedom:944,sixty:944,backs:944,speck:6317,face:6317,beacon:6317,tragedies:6317,crime:6317,cook:8106,themistocles:28934,questions:53967,ball:53967,ageless:22475};
  const q=key=>`“${QUOTES[key]}”`;
  const CARDS={
    sign:['St Helena','A volcanic island in the South Atlantic, about seventeen kilometres long, nearly two thousand kilometres off the coast of south-west Africa. Its town, Jamestown, lies in a narrow valley running down to the sea, and about four and a half thousand people live on the island. They call themselves Saints. It is a British Overseas Territory, with Ascension and Tristan da Cunha.'],
    found:['1502 and 1659','Portuguese sailors found the island uninhabited in 1502 and named it for Saint Helena. The English East India Company settled it in 1659 as a place for its ships to take on water and food on the long way home from India, and named the town for James, Duke of York.'],
    plantation:['Plantation House',`The governors’ house, built for the East India Company in 1792 in the green hills in the middle of the island, where Darwin found ${q('british')}. Joshua Slocum, sailing round the world alone, stayed there in 1898 and was put in the haunted west room, ${q('face')}. When he sailed, ${q('beacon')}.`],
    jonathan:['Jonathan',`A giant tortoise from the Seychelles, brought to St Helena in 1882 already full grown, so hatched in about 1832 or before. He was photographed at Plantation House a few years after he came, and he is still here, with the governor’s other tortoises: thought to be the oldest living land animal. Darwin watched a tortoise on another island: ${q('sixty')}. Jonathan is not to be hurried. Stand still on the lawn, and he may come over.`],
    tortoises:['The other tortoises','Jonathan is not the lawn’s only giant tortoise: the governor’s house has others, much younger, grazing near him.'],
    bench:['A bench on the lawn','A bench at the edge of the grass, for watching the tortoises, which takes some patience.'],
    napoleon:['Napoleon',`After Waterloo, Napoleon surrendered to the Royal Navy and was sent to St Helena, an island small and far enough to be guarded. He landed in October 1815, lived his first weeks in a pavilion at The Briars, and then at Longwood, on a windy plateau, under guard. He died there on 5 May 1821 and was buried in a valley below the house; in 1840 his body was taken home to Paris. Darwin, calling in 1836, ${q('tomb')}.`],
    longwood:['Longwood','Longwood, where Napoleon lived from December 1815 until his death in 1821, painted by Louis-Joseph Marchand, his valet, who was with him to the end. Longwood and the valley of the tomb have belonged to France since 1858.'],
    dwelling:['Napoleon’s dwelling','The buildings at Longwood where Napoleon was held, drawn in ink by a Swedish visitor, Johan Gustaf Thun, in the 1830s, and numbered beneath: the billiard room, the dining room, his study and bedroom, and the lodging of Las Cases, who took down his talk.'],
    ladder:['Jacob’s Ladder','Six hundred and ninety-nine steps straight up the side of Ladder Hill from Jamestown, built in 1829 as an inclined plane, to haul goods up the hill and the town’s manure out of it. The rails are long gone; the steps are still climbed, for the view.'],
    governor:['The Governor’s House, 1794','Plantation House two years after it was built, by Thomas Daniell, 1794. It is the house across the lawn.'],
    space:['From space','The whole island from the International Space Station in May 2009: about seventeen kilometres long, its ridges green at the top and bare and red-brown down to the sea, as Darwin found them.'],
    africans:['Rupert’s Valley',`From 1840 the Royal Navy brought the ships it took from slave traders off West Africa into St Helena, and until 1872 many thousands of the Africans freed from them were landed in Rupert’s Valley, next to Jamestown. Many died there; many went on to the West Indies or the Cape; some stayed, and their descendants are Saints. Slavery itself had ended on the island in the 1830s; Darwin met people who remembered it: ${q('freedom')}.`],
    boers:['The Boer prisoners','From 1900 to 1902, during the war in South Africa, thousands of Boer prisoners of war were held on St Helena, most of them in camps on Deadwood Plain next to Longwood. Some stayed on after the peace.'],
    wirebird:['The wirebird','The St Helena plover, a small brown wader on long thin legs, found nowhere else. It lives on the open plains, Deadwood and Prosperous Bay, and is the island’s bird.'],
    darwin:['Darwin',`Darwin came in the Beagle in July 1836, on the way home, and spent four days walking over the island. From the sea it ${q('castle')}; on top it was green, and ${q('clouds')}.`],
    captive:['The captive',`Napoleon’s exile, from the letter he gave Captain Maitland of the Bellerophon for the Prince Regent in July 1815, ${q('themistocles')}, to his last years at Longwood. Las Cases took down his talk for a year, and saw the Balcombe girls at The Briars meet him in their garden, ${q('questions')}: ${q('ball')}, he said. Montholon signed the appeal against his treatment; Betsy Balcombe’s story is told for young readers; and Slocum, calling in 1898, wrote ${q('tragedies')}.`],
    callers:['Ships that called',`The island was a port of call for anyone on the long way home round the Cape. Cook in the Endeavour in May 1771: ${q('cook')}. Darwin in the Beagle in 1836. Slocum alone in the Spray in 1898: ${q('speck')}, he called out when he saw it; and while he was there ${q('crime')}.`],
    secret:['Jonathan comes over',`He came over the lawn at his own pace, and looked, and stayed. Darwin, on another island, ${q('backs')}; nobody does that to Jonathan. On the bench someone has left D. H. Lawrence’s Tortoises, six poems of 1921; of a baby tortoise he wrote, ${q('ageless')}.`]
  };
  const PICTURES={
    jonathan:{file:'sthelena-jonathan',title:'Jonathan and another tortoise, about 1886',credit:'Photograph, about 1886. Public domain, from Wikimedia Commons.',ratio:.75,card:'jonathan'},
    governor:{file:'sthelena-governor',title:'View of the Governor’s House in St Helena, 1794',credit:'Thomas Daniell, 1794. National Gallery of Art, Washington. CC0, from Wikimedia Commons.',ratio:.69,card:'governor'},
    longwood:{file:'sthelena-longwood',title:'Longwood',credit:'Louis-Joseph Marchand, watercolour. Public domain, from Wikimedia Commons.',ratio:.73,card:'longwood'},
    dwelling:{file:'sthelena-dwelling',title:'Napoleon’s dwelling, Longwood',credit:'Johan Gustaf Thun, ink and wash, 1830s. Skara Diocesan and County Library. Public domain, from Wikimedia Commons.',ratio:.61,card:'dwelling'},
    ladder:{file:'sthelena-ladder',title:'Jacob’s Ladder, Jamestown',credit:'Public domain, from Wikimedia Commons.',ratio:1.14,card:'ladder'},
    space:{file:'sthelena-space',title:'St Helena from the International Space Station, 2009',credit:'NASA, Expedition 19, 7 May 2009. Public domain, from Wikimedia Commons.',ratio:.66,card:'space'}
  };
  const FOUND_KEY='athenaeum-sthelena-jonathan';
  // Jonathan's pace: Darwin's tortoise walked sixty yards in ten minutes; a tortoise in a hurry, on a lawn, and a reader
  // with a little less time, are allowed a quarter of a metre a second.
  const PACE=.25,WAIT=2.5,REACH=10,STOP=1.5;

  window.createStHelena=function(options){
    const {placeVisitorsBook=null,THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,arrivals={},showNotice,playSample,move,analytics,isHolding=()=>false,registerSeat=null,
      bottles=null,showPicture=null,storage=null,search='',pictures='assets/pictures/'}=options;
    // The garden room (open to the north, onto the lawn) and the lawn before it.
    const ROOM={cx:2600,cz:1500,w:7,d:4.4,h:3},LAWN={w:18,d:12};
    const x0=ROOM.cx-ROOM.w/2,x1=ROOM.cx+ROOM.w/2,z0=ROOM.cz-ROOM.d/2,z1=ROOM.cz+ROOM.d/2,lx0=ROOM.cx-LAWN.w/2,lx1=ROOM.cx+LAWN.w/2,lz=z0-LAWN.d;
    const PILLARS=[ROOM.cx-ROOM.w/2+.25,ROOM.cx-1.3,ROOM.cx+1.3,ROOM.cx+ROOM.w/2-.25],BENCH={x:ROOM.cx-5,z:z0-3.2};
    const KEEP=25,R=26,EYE=1.72,HORIZON=.6,PANO=26;
    const wasFound=()=>{try{return storage?.getItem(FOUND_KEY)==='1'||/[?&](jonathan|tortoise)\b/.test(search)}catch(e){return false}};
    let root=null,time=0,lastNeeded=-1e9,bench=null,benchBook=null,lamp=null,jonathan=null;
    const owned=[],ours=[],books=[],blockers=[];
    // Jonathan's place on the lawn, which way he faces, what he is doing, and how long the reader has stood still.
    const jon={x:ROOM.cx+5,z:z0-8.5,yaw:-2.4,mode:'grazing',still:0,last:null,arrived:false};
    const own=thing=>{owned.push(thing);return thing};
    const std=params=>own(new THREE.MeshStandardMaterial(params));
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const card=key=>({type:'sthelena-card',key,title:CARDS[key][0],author:CARDS[key][1],action:'READ'});
    function sign(parent,text,sub,w,h,x,y,z){
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle='#eef0e6';c.fillRect(0,0,W,H);c.strokeStyle='#2c5a3e';c.lineWidth=3;c.strokeRect(7,7,W-14,H-14);
        c.fillStyle='#1c2a20';c.textAlign='center';c.font='bold 27px Georgia';c.fillText(text,W/2,sub?50:H/2+10);if(sub){c.font='italic 19px Georgia';c.fillText(sub,W/2,82)}},620,sub?104:70));
      return add(own(new THREE.PlaneGeometry(w,h)),std({map,emissive:0x2a3630,emissiveIntensity:.25,roughness:.9}),x,y,z,parent)}
    const shelfBooks=(ids,key,max)=>[...new Set([...ids,...(arrivals[key]||[])])].map(id=>findBook(id)).filter(Boolean).slice(0,max);
    function catalogue(){return {groups:GROUPS.map(group=>({...group,books:shelfBooks(group.ids,group.key,group.max)})),secret:(arrivals.jonathan||[]).map(id=>findBook(id)).filter(Boolean)}}

    // ---------- the bottle on the corridor's shelf: a ship for a dark, steep island ----------
    bottles?.add({key:'st-helena',title:'St Helena',label:'ST HELENA',author:'A ship under sail for a steep dark island rising straight out of the sea, green on its tops, with cloud on them.',
      island:[[.09,.055,.05],[.12,.035,.035]],land:0x3e5a36,enter});

    // ---------- the garden room and the lawn ----------
    function build(){
      root=new THREE.Group();root.name='st-helena';const {cx,cz,w,d,h}=ROOM;
      let k=17;const r=()=>(k=(k*9301+49297)%233280)/233280;
      const grassTex=own(canvasTexture((c,W,H)=>{c.fillStyle='#4f7a3a';c.fillRect(0,0,W,H);for(let i=0;i<1600;i++){c.fillStyle=`rgba(${40+r()*50},${90+r()*60},${30+r()*30},.5)`;c.fillRect(r()*W,r()*H,1.5,3+r()*4)}},256,256));
      grassTex.wrapS=grassTex.wrapT=THREE.RepeatWrapping;grassTex.repeat?.set?.(8,6);
      const stoneTex=own(canvasTexture((c,W,H)=>{c.fillStyle='#b9b3a4';c.fillRect(0,0,W,H);let y=0;while(y<H){const sh=26+r()*14;let x=-r()*40;while(x<W){const sw=44+r()*40,v=176+r()*30;c.fillStyle=`rgb(${v},${v-4},${v-14})`;c.fillRect(x+2,y+2,sw-4,sh-4);x+=sw}y+=sh}},256,256));
      stoneTex.wrapS=stoneTex.wrapT=THREE.RepeatWrapping;stoneTex.repeat?.set?.(3,1.2);
      const grass=std({color:0x7a9a60,map:grassTex,roughness:1}),stone=std({color:0xd8d2c2,map:stoneTex,roughness:.95}),plaster=std({color:0xcfc6b0,roughness:.95}),
        flags=std({color:0x8a8478,roughness:.9}),wood=MAT.darkWood||std({color:0x3a2416,roughness:.7}),white=std({color:0xf0ece0,roughness:.8});
      // Ground: the lawn, a little wider than the walking, and the garden room's flagstones.
      box(LAWN.w+6,.3,LAWN.d+6,grass,cx,-.15,z0-LAWN.d/2,root);box(w,.3,d,flags,cx,-.149,cz,root);
      // Walls: west, east and south, stone outside and plaster within; the north side open, on four pillars.
      const T=.35;
      for(const [ww,hh,dd,x,z,ix,iz] of [[w+T,h,T,cx,z1,0,-1],[T,h,d,x0,cz,1,0],[T,h,d,x1,cz,-1,0]]){box(ww,hh,dd,stone,x,hh/2,z,root);box(ix?.02:ww-T,hh,iz?.02:dd,plaster,x+ix*(T/2+.011),hh/2,z+iz*(T/2+.011),root)}
      for(const px of PILLARS){box(.32,h,.32,white,px,h/2,z0,root);block(px,z0,.42,.42)}
      box(w+.6,.35,d+.6,white,cx,h+.17,cz,root);box(w+.8,.08,d+.8,stone,cx,h+.38,cz,root);
      // Inside: the sign, the shelves on the side walls, the pictures, the table with the bottle home.
      mark(sign(root,'ST HELENA','Plantation House, in the middle of the island',2.6,.42,cx,2.55,z1-.2),card('sign')).rotation.y=Math.PI;
      const {groups}=catalogue(),geometry=own(new THREE.BoxGeometry(.62,.86,.12)),ROWS=[1.05,1.95],length=3.4;
      for(const group of groups){
        const per=group.books.length>3?Math.ceil(group.books.length/2):Math.max(1,group.books.length),step=Math.min(1.0,(length-.3)/Math.max(1,per));
        const side=group.wall==='west'?1:-1,sx=group.wall==='west'?x0+.32:x1-.32,yaw=side*Math.PI/2;
        group.books.forEach((book,i)=>{const row=i<per?0:1,n=row?group.books.length-per:per,col=row?i-per:i,offset=(col-(n-1)/2)*step;placeBook(book,{x:sx,y:ROWS[row],z:cz+.2+offset,yaw},geometry,group.key)});
        const rows=group.books.length>per?ROWS:ROWS.slice(0,1);for(const y of rows)box(.34,.05,length,wood,sx-side*.02,y-.46,cz+.2,root);block(sx,cz+.2,.7,length+.2);
        const label=sign(root,group.name,group.sub,2.2,.36,group.wall==='west'?x0+.2:x1-.2,rows.at(-1)+.66,cz+.2);label.rotation.y=yaw;mark(label,card(group.key));
      }
      hang('governor',cx-2.45,1.85,z1-.2,Math.PI,1.05);hang('jonathan',cx+2.45,1.85,z1-.2,Math.PI,.9);
      hang('longwood',x0+.2,2.6,cz-1.75,Math.PI/2,.7);hang('dwelling',x1-.2,2.6,cz-1.75,-Math.PI/2,.75);
      hang('ladder',cx-1.15,1.3,z1-.2,Math.PI,.42);hang('space',cx+1.15,1.3,z1-.2,Math.PI,.62);
      // Cards on the walls by the pillars: the island's history, small brass plates.
      const plate=(key,x,z,yaw)=>{const p=add(own(new THREE.PlaneGeometry(.42,.26)),std({color:0xb08d3a,metalness:.6,roughness:.4}),x,1.45,z,root);p.rotation.y=yaw;mark(p,card(key))};
      plate('found',x0+.19,cz+1.85,Math.PI/2);plate('napoleon',x0+.19,cz-1.05,Math.PI/2);plate('africans',x1-.19,cz+1.85,-Math.PI/2);plate('boers',x1-.19,cz-1.05,-Math.PI/2);
      buildTable(cx,cz+.55,wood);buildLawn(wood,white,r);buildView();
      // The hazy sun, low in the west, and the lamp in the garden room.
      const sun=new THREE.DirectionalLight(0xfff0d8,1.05);sun.position.set(cx-30,14,cz-10);sun.target.position.set(cx,0,cz-4);root.add(sun);root.add(sun.target);
      lamp=new THREE.PointLight(0xffd9a0,.7,9,2);lamp.position.set(cx,2.4,cz+.4);root.add(lamp);
      if(wasFound())leaveBook();
      placeVisitorsBook?.({parent:root,x:cx+2.2,z:cz+1.4,mark,own});
      scene.add(root);
    }
    function placeBook(book,spot,geometry,shelf,parent=root){
      const mesh=add(geometry,own(bookMaterial(book)),spot.x,spot.y,spot.z,parent);mesh.rotation.order='YXZ';mesh.rotation.y=spot.yaw||0;mesh.rotation.x=spot.tilt??-.08;
      mesh.userData={type:'book',book,loaded:false,sthelena:true,shelf,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent}};
      interactables.push(mesh);ours.push(mesh);books.push(mesh);return mesh}
    // A framed picture from assets/pictures: a mount until the picture arrives, then the picture at its own shape.
    function hang(key,x,y,z,yaw,width){
      const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=yaw;root.add(g);const p=PICTURES[key],height=width*p.ratio;
      const data={type:'sthelena-picture',picture:key,title:p.title,author:CARDS[p.card][1],action:'LOOK CLOSELY'};
      const frame=mark(box(width+.1,height+.1,.04,MAT.darkWood||std({color:0x2c1c12,roughness:.6}),0,0,0,g),data);
      const mat=std({color:0x9a927f,roughness:.9}),sheet=mark(add(own(new THREE.PlaneGeometry(width,height)),mat,0,0,.025,g),data);
      try{new THREE.TextureLoader().load(`${pictures}${p.file}-wall.jpg`,texture=>{if(!root)return texture.dispose?.();texture.colorSpace=THREE.SRGBColorSpace;own(texture);mat.map=texture;mat.color?.set?.(0xd8d4c8);mat.needsUpdate=true;
        const image=texture.image;if(image?.width&&image?.height){const k=image.height/image.width/p.ratio;sheet.scale.y=k;frame.scale.y=(height*k+.1)/(height+.1)}})}catch(e){}
      return g}
    // The table with a lamp and the bottle home, and two chairs that are the library's seats.
    function buildTable(x,z,wood){
      const g=new THREE.Group();g.position.set(x,0,z);root.add(g);
      box(1.5,.05,.85,wood,0,.76,0,g);for(const [lx,lz] of [[-.66,-.36],[.66,-.36],[-.66,.36],[.66,.36]])box(.06,.75,.06,wood,lx,.375,lz,g);
      add(own(new THREE.CylinderGeometry(.06,.05,.18,12,1,true)),std({color:0xfff4d6,emissive:0xffc070,emissiveIntensity:1.3,transparent:true,opacity:.8}),-.5,.88,-.1,g);
      const glass=std({color:0xd9efe6,transparent:true,opacity:.22,roughness:.05,metalness:.1,depthWrite:false}),exit={type:'sthelena-exit',title:'Back to the Long Corridor',author:'Into the bottle, and out again on the shelf in the Long Corridor, towards the Grand Hall.',action:'RETURN'};
      const b=new THREE.Group();b.position.set(.3,.88,0);g.add(b);const body=add(own(new THREE.CylinderGeometry(.085,.085,.38,18,1,true)),glass,0,0,0,b);body.rotation.z=Math.PI/2;
      const neck=add(own(new THREE.CylinderGeometry(.028,.032,.12,10,1,true)),glass,-.25,0,0,b);neck.rotation.z=Math.PI/2;add(own(new THREE.CylinderGeometry(.026,.022,.05,10)),std({color:0x9a7448,roughness:.9}),-.33,0,0,b).rotation.z=Math.PI/2;
      const hull=box(.12,.022,.035,std({color:0x3b2414,roughness:.6}),-.04,-.03,0,b);box(.003,.1,.003,std({color:0x5a3a1e}),-.04,.02,0,b);add(own(new THREE.PlaneGeometry(.05,.05)),std({color:0xf1e9d4,side:THREE.DoubleSide}),-.04,.02,.003,b);
      box(.4,.03,.12,wood,0,-.1,0,b);
      const plateTex=own(canvasTexture((c,W,H)=>{c.fillStyle='#caa15a';c.fillRect(0,0,W,H);c.strokeStyle='#6b4d22';c.lineWidth=4;c.strokeRect(5,5,W-10,H-10);c.fillStyle='#2b1d0e';c.textAlign='center';
        c.font='bold 26px Georgia';c.fillText('THE LONG CORRIDOR',W/2,40);c.font='italic 18px Georgia';c.fillText('towards the Grand Hall',W/2,68)},400,86));
      const label=add(own(new THREE.PlaneGeometry(.34,.075)),std({map:plateTex,roughness:.5,metalness:.3}),0,-.1,-.065,b);label.rotation.y=Math.PI;
      const signTex=own(canvasTexture((c,W,H)=>{c.fillStyle='#c9a057';c.fillRect(0,0,W,H);c.strokeStyle='#6b4d22';c.lineWidth=6;c.strokeRect(8,8,W-16,H-16);c.fillStyle='#2b1d0e';c.textAlign='center';
        c.font='bold 40px Georgia';c.fillText('THE WAY HOME',W/2,66);c.font='italic 32px Georgia';c.fillText('look into the bottle',W/2,112);c.font='bold 28px Georgia';c.fillText('THE LONG CORRIDOR',W/2,150)},420,180));
      const signMat=std({map:signTex,roughness:.45,metalness:.35}),brassMat=std({color:0xb08d3a,metalness:.6,roughness:.4}),signParts=[];
      for(const side of [1,-1]){const face=add(own(new THREE.PlaneGeometry(.36,.155)),signMat,0,.12,.13+side*.004,b);if(side>0)face.rotation.y=Math.PI;signParts.push(face)}
      signParts.push(box(.37,.165,.006,brassMat,0,.12,.13,b),box(.012,.14,.012,brassMat,0,-.03,.13,b),box(.09,.012,.05,brassMat,0,-.1,.13,b));
      for(const part of [body,neck,hull,label,...signParts])mark(part,exit);
      block(x,z,1.7,1.05);
      for(const side of [-1,1]){const chair=new THREE.Group();chair.position.set(x+side*1.1,0,z);chair.rotation.y=side*Math.PI/2;root.add(chair);
        const parts=[box(.44,.04,.42,wood,0,.46,0,chair),box(.44,.55,.035,wood,0,.8,.2,chair)];for(const [lx,lz] of [[-.19,-.18],[.19,-.18],[-.19,.18],[.19,.18]])box(.035,.46,.035,wood,lx,.23,lz,chair);
        block(x+side*1.1,z,.5,.5);registerSeat?.(parts,chair,new THREE.Vector3(0,1.18,-.05),side*Math.PI/2,{title:'A chair at the table',author:'Sit in the garden room and read one of the island’s books.',bookIds:books.map(b=>b.userData.book.id)});for(const part of parts)ours.push(part)}
    }
    // The lawn: a low stone edge, flax and agapanthus along it, a bench, the two younger tortoises, and Jonathan.
    function buildLawn(wood,white,r){
      const {cx}=ROOM,edge=std({color:0x8a8478,roughness:1}),data=card('plantation');
      for(const part of [box(LAWN.w,.35,.3,edge,cx,.17,lz,root),box(.3,.35,LAWN.d,edge,lx0,.17,z0-LAWN.d/2,root),box(.3,.35,LAWN.d,edge,lx1,.17,z0-LAWN.d/2,root)])mark(part,data);
      const leaf=std({color:0x3e6a34,roughness:.9,side:THREE.DoubleSide}),flower=std({color:0x6a7ad8,roughness:.8});
      for(let i=0;i<14;i++){const side=i%2?1:-1,fx=side>0?lx1-.6:lx0+.6,fz=z0-1-i*.8;for(let j=0;j<5;j++){const blade=add(own(new THREE.PlaneGeometry(.06,.8)),leaf,fx+(r()-.5)*.4,.38,fz+(r()-.5)*.4,root);blade.rotation.set((r()-.5)*.5,r()*3,(r()-.5)*.5)}
        if(i%3===0)add(own(new THREE.SphereGeometry(.12,8,6)),flower,fx,.85,fz,root)}
      // The bench, a seat, where the book is left.
      bench=new THREE.Group();bench.position.set(BENCH.x,0,BENCH.z);bench.rotation.y=Math.PI;root.add(bench);
      const parts=[box(1.6,.06,.45,white,0,.45,0,bench),box(1.6,.5,.05,white,0,.78,.22,bench)];for(const lx of [-.7,.7])for(const lz of [-.18,.18])box(.06,.45,.06,white,lx,.22,lz,bench);
      for(const part of parts)mark(part,card('bench'));block(BENCH.x,BENCH.z,1.7,.6);
      registerSeat?.(parts,bench,new THREE.Vector3(0,1.18,-.05),Math.PI,{title:'The bench on the lawn',author:'Sit and watch the tortoises.',bookIds:books.map(b=>b.userData.book.id)});
      // The two younger tortoises, grazing, smaller and paler.
      for(const [tx,tz,yaw,s] of [[cx-6,z0-9,.6,.75],[cx-2.5,z0-10.3,-.4,.68]]){const t=tortoise(s,0x6a5a44);t.position.set(tx,0,tz);t.rotation.y=yaw;root.add(t);mark(t.userData.shell,card('tortoises'));block(tx,tz,1.1*s,1.4*s)}
      jonathan=tortoise(1,0x4a3e30);jonathan.position.set(jon.x,0,jon.z);jonathan.rotation.y=jon.yaw;root.add(jonathan);
      const jd={type:'sthelena-jonathan',title:CARDS.jonathan[0],author:CARDS.jonathan[1],action:'LOOK'};for(const part of jonathan.userData.parts)mark(part,jd);
    }
    // A giant tortoise: a high domed shell with its plates, a long neck and head, four pillar legs. Faces +z.
    function tortoise(scale,color){
      const g=new THREE.Group();g.scale.set(scale,scale,scale);
      const shellMat=std({color,roughness:.85}),skin=std({color:0x6a6050,roughness:.95}),plate=std({color:0x2e2620,roughness:.9});
      const shell=add(own(new THREE.SphereGeometry(.6,18,10,0,Math.PI*2,0,Math.PI/2)),shellMat,0,.32,0,g);shell.scale.set(1,.95,1.25);
      add(own(new THREE.CylinderGeometry(.62,.6,.1,18)),plate,0,.32,0,g).scale.set(1,1,1.25);
      for(let i=0;i<9;i++){const a=i/9*Math.PI*2,p=add(own(new THREE.CircleGeometry(.12,6)),plate,Math.sin(a)*.36,.68,Math.cos(a)*.45,g);p.rotation.x=-Math.PI/2+.5*Math.cos(a);p.rotation.z=.5*Math.sin(a)}
      for(const [lx,lz] of [[-.42,.45],[.42,.45],[-.42,-.45],[.42,-.45]])add(own(new THREE.CylinderGeometry(.11,.13,.34,8)),skin,lx,.17,lz,g);
      const neck=new THREE.Group();neck.position.set(0,.36,.66);g.add(neck);const n=add(own(new THREE.CylinderGeometry(.08,.1,.42,8)),skin,0,.06,.16,neck);n.rotation.x=Math.PI/2-.5;
      const head=add(own(new THREE.SphereGeometry(.12,10,8)),skin,0,.18,.38,neck);head.scale.set(.9,.8,1.25);
      g.userData.shell=shell;g.userData.neck=neck;g.userData.parts=[shell,n,head];return g}
    // The view: the house across the lawn among its trees to the east, Norfolk pines, the hills up into cloud to the south
    // towards Diana's Peak, and to the west, far below past the falling ground, the sea under a hazy sun.
    function buildView(){
      const {cx}=ROOM;
      const pano=own(canvasTexture((c,W,H)=>{c.translate(W,0);c.scale(-1,1);// seen from inside: drawn mirrored. North at 0 and W, east at W/4, south at W/2, west at 3W/4.
        let k=41;const r=()=>(k=(k*9301+49297)%233280)/233280,hz=H*HORIZON;
        const sky=c.createLinearGradient(0,0,0,hz);sky.addColorStop(0,'#8c9cae');sky.addColorStop(.6,'#c6ccce');sky.addColorStop(1,'#e8e2d2');c.fillStyle=sky;c.fillRect(0,0,W,H);
        // The hazy sun in the west, and the sea far below it, between the hills.
        const sx=W*.75;const glow=c.createRadialGradient(sx,hz-H*.12,4,sx,hz-H*.12,W*.12);glow.addColorStop(0,'rgba(255,248,226,.95)');glow.addColorStop(1,'rgba(255,240,210,0)');c.fillStyle=glow;c.fillRect(0,0,W,hz);
        c.fillStyle='#7a8ea0';c.fillRect(W*.62,hz-H*.02,W*.26,H*.05);
        // Hills all round, green, rising highest in the south into cloud.
        const hills=(top,color,amp,seed)=>{c.fillStyle=color;c.beginPath();c.moveTo(0,H);for(let x=0;x<=W;x+=8){const t=x/W,south=Math.exp(-((t-.5)**2)/.02),west=Math.exp(-((t-.75)**2)/.006);c.lineTo(x,hz-H*(top+.18*south-.12*west+amp*Math.sin(t*seed)+amp*.6*Math.sin(t*seed*2.7)))}c.lineTo(W,H);c.fill()};
        hills(.06,'#6a8a5a',.015,31);hills(.02,'#4e7442',.012,53);
        c.fillStyle='rgba(235,236,236,.9)';for(let i=0;i<16;i++){c.beginPath();c.ellipse(W*(.38+r()*.24),hz-H*(.18+r()*.1),W*(.03+r()*.05),H*(.03+r()*.02),0,0,7);c.fill()}
        // Norfolk pines: tall, with level tiers of branches, here and there.
        for(let i=0;i<22;i++){const x=W*r(),base=hz+H*(.02+r()*.06),ht=H*(.18+r()*.14);c.fillStyle='#24402a';c.fillRect(x-1,base-ht,2.5,ht);for(let j=0;j<9;j++){const y=base-ht+j*ht/9,w=6+j*3.4;c.fillRect(x-w,y,w*2,4);c.fillRect(x-w,y+4,4,3);c.fillRect(x+w-4,y+4,4,3)}}
        // Plantation House to the east: white, two storeys, a row of windows, among dark trees.
        const hx=W*.25,hy=hz+H*.03;c.fillStyle='#5f8a4a';c.beginPath();c.ellipse(hx,hy+H*.01,W*.08,H*.03,0,0,7);c.fill();c.fillStyle='#2e4a30';for(let i=0;i<10;i++){c.beginPath();c.ellipse(hx-W*.06+r()*W*.12,hy-H*.1-r()*H*.06,W*.012,H*.06,0,0,7);c.fill()}
        c.fillStyle='#f2efe6';c.fillRect(hx-W*.035,hy-H*.11,W*.07,H*.11);c.fillStyle='#8a8a86';c.beginPath();c.moveTo(hx-W*.038,hy-H*.11);c.lineTo(hx,hy-H*.15);c.lineTo(hx+W*.038,hy-H*.11);c.fill();
        c.fillStyle='#3a4a52';for(let row=0;row<2;row++)for(let i=0;i<7;i++)c.fillRect(hx-W*.03+i*W*.0095,hy-H*(.095-row*.05),W*.004,H*.03);
        // The near grass of the paddock, all round.
        c.fillStyle='#5a8442';c.beginPath();c.moveTo(0,H);for(let x=0;x<=W;x+=16)c.lineTo(x,H*(.8+.015*Math.sin(x/W*Math.PI*2*7)));c.lineTo(W,H);c.fill()},4096,512));
      const g=new THREE.Group();g.position.set(cx,0,z0-4);root.add(g);
      const ring=add(own(new THREE.CylinderGeometry(R,R,PANO,64,1,true,-Math.PI,Math.PI*2)),own(new THREE.MeshBasicMaterial({map:pano,side:THREE.BackSide,fog:false})),0,EYE+PANO*(HORIZON-.5),0,g);ring.raycast=()=>{};
      const domeTex=own(canvasTexture((c,W,H)=>{const gr=c.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#7a8a9c');gr.addColorStop(1,'#8c9cae');c.fillStyle=gr;c.fillRect(0,0,W,H)},64,64));
      const dome=add(own(new THREE.SphereGeometry(R+.5,32,12,0,Math.PI*2,0,Math.PI/2)),own(new THREE.MeshBasicMaterial({map:domeTex,side:THREE.BackSide,fog:false})),0,EYE+PANO*HORIZON-.4,0,g);dome.raycast=()=>{};
      const under=add(own(new THREE.CircleGeometry(R-.2,48)),own(new THREE.MeshBasicMaterial({color:0x4a6a3a,fog:false})),0,EYE+PANO*(HORIZON-.5)-PANO/2+.05,0,g);under.rotation.x=-Math.PI/2;under.raycast=()=>{};
    }
    function leaveBook(){
      const book=catalogue().secret[0];if(!book||benchBook||!bench)return;
      benchBook=placeBook(book,{x:.3,y:.5,z:0,yaw:0,tilt:-Math.PI/2},own(new THREE.BoxGeometry(.62,.86,.12)),'secret',bench)}

    // ---------- walking ----------
    function onLawn(x,z){return x>lx0&&x<lx1&&z>lz&&z<z0}
    function inRoom(x,z){return x>x0&&x<x1&&z>=z0&&z<z1}
    function contains(x,z){return x>lx0-.5&&x<lx1+.5&&z>lz-.5&&z<z1+.3}
    function floorAt(x,z){return contains(x,z)?0:null}
    function allowed(x,z){
      if(!contains(x,z))return false;const rad=player.radius||.42;
      if(z<z0){if(x-rad<lx0+.2||x+rad>lx1-.2||z-rad<lz+.2)return false;if(Math.hypot(x-jon.x,z-jon.z)<.85+rad*.6)return false}
      else if(x-rad<x0+.2||x+rad>x1-.2||z+rad>z1-.2)return false;
      return !blockers.some(b=>x+rad>b.minX&&x-rad<b.maxX&&z+rad>b.minZ&&z-rad<b.maxZ)}

    // ---------- Jonathan ----------
    // He grazes until a reader on the lawn within reach has stood still a little while; then he comes, and stops short of
    // them. If they walk off, he stops and grazes where he is. The first time he arrives, the book is on the bench.
    function tend(dt){
      const p=player.pos,dist=Math.hypot(p.x-jon.x,p.z-jon.z),here=onLawn(p.x,p.z);
      const moved=jon.last?Math.hypot(p.x-jon.last.x,p.z-jon.last.z):0;jon.last={x:p.x,z:p.z};
      jon.still=here&&dist<REACH&&moved<.02*Math.max(1,dt*60)?jon.still+dt:0;
      if(jon.mode==='grazing'&&jon.still>WAIT&&dist>STOP+.1)jon.mode='coming';
      if(jon.mode==='coming'){
        if(!here||jon.still===0&&moved>.05){jon.mode='grazing';return}
        const want=Math.atan2(p.x-jon.x,p.z-jon.z);let turn=want-jon.yaw;while(turn>Math.PI)turn-=Math.PI*2;while(turn<-Math.PI)turn+=Math.PI*2;
        jon.yaw+=Math.sign(turn)*Math.min(Math.abs(turn),dt*.8);
        if(dist>STOP){const step=Math.min(PACE*dt,dist-STOP)*Math.max(0,Math.cos(turn));jon.x+=Math.sin(jon.yaw)*step;jon.z=Math.min(z0-1.1,jon.z+Math.cos(jon.yaw)*step)}
        if(Math.hypot(p.x-jon.x,p.z-jon.z)<=STOP+.05&&Math.abs(turn)<.4)arrive()}
      else if(jon.mode==='arrived'&&dist>STOP+1.5)jon.mode='grazing'}
    function arrive(){
      jon.mode='arrived';const first=!wasFound();
      if(first){try{storage?.setItem(FOUND_KEY,'1')}catch(e){}jon.arrived=true;leaveBook();analytics?.track('Secret Found',{room:'st-helena',secret:'jonathan'});showNotice(`${CARDS.secret[0]}. ${CARDS.secret[1]}`,16);return}
      jon.arrived=true;showNotice('Jonathan has come over to see who it is. He looks, and stays a while.',6)}

    // ---------- doing things ----------
    function enter(){
      activate();move(ROOM.cx,ROOM.cz-.6,Math.PI);playSample?.('pageTurn',.35,.6);
      showNotice('St Helena, on a misty afternoon: a garden room at the edge of the lawn of Plantation House, the governor’s house, in the green hills in the middle of the island. Out on the grass, the tortoises. The bottle you came through is on the table, to take you back.',14);
      analytics?.track('Room Explored',{room:'st-helena'})}
    function leave(){const p=bottles?.standBefore?.('st-helena')||{x:1701,z:-2,yaw:-Math.PI/2};move(p.x,p.z,p.yaw);playSample?.('pageTurn',.35,.6);showNotice('The Long Corridor again, and the bottle back on its shelf.',4)}
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('sthelena-'))return false;
      if(data.type==='sthelena-exit'){leave();return true}
      if(data.type==='sthelena-picture'){const p=PICTURES[data.picture];if(showPicture)showPicture({kicker:'ST HELENA',title:p.title,src:`${pictures}${p.file}.jpg`,caption:data.author,credit:p.credit});else showNotice(`${p.title}: ${data.author}`,12);return true}
      if(data.type==='sthelena-jonathan'){showNotice(`${data.title}: ${data.author}`,16);return true}
      if(data.type==='sthelena-card'){showNotice(`${data.title}: ${data.author}`,data.author.length>320?18:data.author.length>160?13:9);return true}
      return false}

    // ---------- lifecycle ----------
    function activate(){if(!root)build();lastNeeded=time}
    function unload(){
      if(!root)return;root.removeFromParent();root.traverse(object=>{if(object.isLight)object.userData.freed=true});root=null;bench=null;benchBook=null;lamp=null;jonathan=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0}
    function update(t){
      // Built ahead while the reader stands by the bottles' shelf, so that looking in does not wait.
      const dt=Math.min(.1,Math.max(0,t-time));time=t;const inside=contains(player.pos.x,player.pos.z),bay=bottles?.bay,near=!!bay&&Math.hypot(player.pos.x-bay.x,player.pos.z-bay.z)<3.2;
      if(inside||near&&(root||window.libraryMayBuild?.()!==false))activate();
      else if(root&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==b.userData.home.parent))unload();
      if(!inside||!root)return;
      tend(dt);
      if(jonathan){jonathan.position.set(jon.x,0,jon.z);jonathan.rotation.y=jon.yaw;const neck=jonathan.userData.neck;if(neck)neck.rotation.x=jon.mode==='grazing'?.35+.12*Math.sin(t*.8):jon.mode==='arrived'?-.25:0}}
    return {contains,floorAt,allowed,interact,update,enter,leave,activate,unload,catalogue,room:ROOM,lawn:LAWN,bench:BENCH,groups:GROUPS,own:OWN,quotes:QUOTES,sources:SOURCES,cards:CARDS,pictures:PICTURES,jonathan:jon,
      get built(){return !!root},get books(){return books.slice()},get found(){return wasFound()},zoneAt:(x,z)=>contains(x,z)?'st-helena':null,inRoom,onLawn};
  };
})();
