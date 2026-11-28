// The Galápagos: Post Office Bay on Floreana, which Darwin knew as Charles Island, at dusk, reached through the seventh
// ship in a bottle on the Long Corridor's shelf (ships-in-bottles.js, handed `bottles`; the first on its lower tier).
// A shelter of driftwood and whale-ship timber at the head of the beach holds the books: the Beagle's on the west wall,
// the whalers' on the east, and on the north, between FitzRoy's chart and Gould's finches, the argument the islands
// started. Outside, on black sand among the lava, are the post-office barrel on its post, a giant tortoise, prickly
// pears, a sea lion asleep and marine iguanas on the rocks; all round, painted inside a ring, the bay at sunset, the other
// islands, and a whale-ship at anchor. Two lights: the low sun, and the lantern in the shelter.
//
// The cards keep to what is attested: the Beagle among the islands from 15 September to 20 October 1835, Darwin ashore on
// Chatham, Charles, Albemarle and James; Gould's finches; the whalers and their tortoises; Ecuador's since 1832, a World
// Heritage site since 1978; the barrel's tradition, told without quotation. Every quotation (`QUOTES`) is checked against
// the library's own texts by a test: Darwin's Voyage, Melville's Encantadas, Chase's Essex.
//
// The secret is the barrel. Look in it: letters for all over the world, for whoever is going their way to carry by hand,
// and among them, with no address at all, Melville's Piazza Tales (shelf `galapagos-encantadas`), left on the barrel's lid,
// found for good (athenaeum-galapagos-barrel; ?barrel). Melville had been among the islands on the whaler Acushnet in 1841.
(function(){
  'use strict';

  // The library's own books: Darwin's Voyage and his Journal of Researches; Moby-Dick; the Origin and Wallace's Island Life.
  const OWN={beagle:[944,3704],whalers:[2701],taught:[1228,32021]};
  const GROUPS=[
    {key:'beagle',name:'THE BEAGLE, 1835',sub:'Darwin, his captain, and what they brought home',wall:'west',max:6,ids:OWN.beagle},
    {key:'whalers',name:'THE WHALERS',sub:'The ships that called for tortoises',wall:'east',max:4,ids:OWN.whalers},
    {key:'taught',name:'WHAT THE ISLANDS TAUGHT',sub:'The argument they started',wall:'north',max:3,ids:OWN.taught}
  ];
  // Their own words, from the library's texts, checked by a test (letters alone).
  const QUOTES={
    curious:'The natural history of these islands is eminently curious, and well deserves attention.',
    mystery:'that great fact--that mystery of mysteries--the first appearance of new beings on this earth',
    different:'the different islands to a considerable extent are inhabited by a different set of beings',
    lawson:'he could with certainty tell from which island any one was brought',
    raps:'I frequently got on their backs, and then giving a few raps on the hinder part of their shells, they would rise up and walk away',
    balance:'but I found it very difficult to keep my balance',
    antediluvian:'These huge reptiles, surrounded by the black lava, the leafless shrubs, and large cacti, seemed to my fancy like some antediluvian animals.',
    hideous:'It is a hideous-looking creature, of a dirty black colour, stupid, and sluggish in its movements.',
    whalers:'This archipelago has long been frequented, first by the bucaniers, and latterly by whalers',
    birds:'The few dull-coloured birds cared no more for me than they did for the great tortoises.',
    cinders:'Take five-and-twenty heaps of cinders dumped here and there in an outside city lot',
    enchanted:'the Encantadas, or Enchanted Isles',
    turtle:'obtained three hundred turtle',
    charles:'We then visited Charles Island, where we procured sixty more.'
  };
  const SOURCES={curious:944,mystery:944,different:944,lawson:944,raps:944,balance:944,antediluvian:944,hideous:944,whalers:944,birds:944,cinders:15859,enchanted:15859,turtle:61931,charles:61931};
  const q=key=>`“${QUOTES[key].replace(/--/g,'—')}”`;
  const CARDS={
    sign:['The Galápagos','Volcanic islands on the equator in the Pacific, about a thousand kilometres west of the coast of South America. They have belonged to Ecuador since 1832, most of their land is a national park, and they have been a World Heritage site since 1978.'],
    bay:['Post Office Bay','On Floreana, which Darwin knew as Charles Island. By tradition the whalers left letters in a barrel here for ships going home to carry, from about the end of the eighteenth century, and visitors still leave postcards in it, and take away any they can deliver by hand.'],
    barrel:['The post office','A barrel on a post, with letters in it, waiting for someone going their way.'],
    beagle:['September 1835',`The Beagle reached the islands on 15 September 1835 and sailed on 20 October, while her officers surveyed them. Darwin went ashore on Chatham, Charles, Albemarle and James Islands. ${q('curious')}`],
    different:['Island by island',`On Charles Island the vice-governor, Mr Lawson, told Darwin that ${q('lawson')}. Darwin had mixed his collections together before he saw what that meant: ${q('different')}. And so, he wrote, ${q('mystery')}.`],
    finches:['Darwin’s finches','Darwin collected the finches but did not label most of them by island. It was John Gould, in London in 1837, who saw that they were a group of distinct species. They are named for Darwin now, though the Origin does not mention them.'],
    tortoise:['A giant tortoise',`${q('raps')}, Darwin wrote, ${q('balance')}. The whale-ships took them away by the thousand, alive, for meat on the voyage, and some of the islands’ kinds are gone.`],
    iguanas:['Marine iguanas',`Lizards that feed on seaweed in the sea, and nowhere else in the world. Darwin was not taken with them: ${q('hideous')}`],
    sealion:['A sea lion','Asleep on the sand, and not about to move for anyone.'],
    cactus:['Prickly pear',`The tree-high prickly pears of the islands, which the tortoises eat. ${q('antediluvian')}`],
    whalers:['The whalers',`${q('whalers')}, Darwin wrote. The whale-ships of Nantucket and New Bedford called for water, wood and tortoises. The Essex called in October 1820, the month before a whale sank her. Off Hood’s Island she ${q('turtle')}, her mate wrote; ${q('charles')} That is this island.`],
    melville:['The Encantadas',`Melville came among the islands as a young sailor on the whaler Acushnet in 1841, and wrote of them in ten sketches: ${q('cinders')}, he begins, and imagine it all magnified, and you have ${q('enchanted')}.`],
    shelf_beagle:['The Beagle, 1835','Darwin’s own account of the voyage, in its two forms; his captain’s narrative; and the birds and reptiles he brought home, as Gould and Bell described them.'],
    shelf_whalers:['The whalers','The ships that came for tortoises: Melville’s book of the whale, and the Essex, sunk by a whale the month after she called here, whose story he read.'],
    shelf_taught:['What the islands taught',`What Darwin made of it twenty years on, and Wallace’s book on why islands have the animals they have. ${q('mystery')}.`],
    chart:['The chart','The Admiralty’s chart of the Galápagos, published in 1841 from the survey that FitzRoy and the Beagle’s officers made in 1835.'],
    map1794:['The Enchanted Isles','A map of 1794 with their old name. The Spanish called them las Islas Encantadas, the enchanted isles, for the currents and mists that made them hard to find.'],
    finches_picture:['Gould’s finches','The heads of four of the Galápagos finches, after John Gould, as Darwin printed them in the second edition of his Journal of Researches, in 1845.'],
    tortoise_picture:['The tortoises','Giant tortoises of the Galápagos, from Cassell’s Natural History, 1878.'],
    bench:['A bench','Driftwood on two blocks of lava, looking out over the bay.'],
    secret:['A letter with no address','You look into the barrel. Letters for Boston and Bristol, Valparaíso and New Bedford, waiting for someone going their way; and at the bottom, with no address at all, a book. Melville’s Piazza Tales, with his ten sketches of these islands, now on the barrel’s lid.']
  };
  const PICTURES={
    chart:{file:'galapagos-chart',title:'Galapagos Islands, surveyed by Captn. Robt. Fitz Roy R.N. and the officers of H.M.S. Beagle, 1836',credit:'Admiralty Chart No. 1375, published 1841. Royal Museums Greenwich. Public domain, from Wikimedia Commons.',ratio:1.35,card:'chart'},
    finches:{file:'galapagos-finches',title:'Darwin’s finches',credit:'After John Gould, from Darwin’s Journal of Researches, 1845. Public domain, from Wikimedia Commons.',ratio:.75,card:'finches_picture'},
    tortoise:{file:'galapagos-tortoise',title:'Gigantic land tortoises from the Galapagos Islands',credit:'Cassell’s Natural History, 1878. Public domain, from Wikimedia Commons.',ratio:.77,card:'tortoise_picture'},
    map1794:{file:'galapagos-1794',title:'Galapagos or Inchanted Islands',credit:'1794. Public domain, from Wikimedia Commons.',ratio:.82,card:'map1794'}
  };
  const FOUND_KEY='athenaeum-galapagos-barrel';

  window.createGalapagosIsland=function(options){
    const {placeVisitorsBook=null,THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,arrivals={},showNotice,playSample,move,analytics,isHolding=()=>false,registerSeat=null,
      bottles=null,showPicture=null,storage=null,search='',pictures='assets/pictures/'}=options;
    // The shelter (open to the south) and the beach south of it, down to the lava and the sea.
    const ROOM={cx:2600,cz:2400,w:8,d:4,h:2.8},SHORE=10,BEACH=8.5;
    const x0=ROOM.cx-ROOM.w/2,x1=ROOM.cx+ROOM.w/2,z0=ROOM.cz-ROOM.d/2,z1=ROOM.cz+ROOM.d/2,zs=z1+SHORE;
    const KEEP=25,R=26,EYE=1.72,HORIZON=.6,PANO=26;
    const BARREL={x:ROOM.cx+4.6,z:z1+3},TORTOISE={x:ROOM.cx-4.2,z:z1+4.2},BENCH={x:ROOM.cx-.8,z:z1+5.4};
    const wasFound=()=>{try{return storage?.getItem(FOUND_KEY)==='1'||/[?&](barrel|postoffice|post-office|encantadas)\b/.test(search)}catch(e){return false}};
    let root=null,time=0,lastNeeded=-1e9,barrelTop=null,barrelBook=null,lantern=null,tortoise=null;
    const owned=[],ours=[],books=[],blockers=[];
    const own=thing=>{owned.push(thing);return thing};
    const std=params=>own(new THREE.MeshStandardMaterial(params));
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const card=key=>({type:'galapagos-card',key,title:CARDS[key][0],author:CARDS[key][1],action:'READ'});
    function sign(parent,text,sub,w,h,x,y,z){
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle='#e8dcc0';c.fillRect(0,0,W,H);c.strokeStyle='#5a3e22';c.lineWidth=3;c.strokeRect(7,7,W-14,H-14);
        c.fillStyle='#2a1c10';c.textAlign='center';c.font='bold 27px Georgia';c.fillText(text,W/2,sub?50:H/2+10);if(sub){c.font='italic 19px Georgia';c.fillText(sub,W/2,82)}},620,sub?104:70));
      return add(own(new THREE.PlaneGeometry(w,h)),std({map,emissive:0x2a2218,emissiveIntensity:.25,roughness:.9}),x,y,z,parent)}
    const shelfBooks=(ids,key,max)=>[...new Set([...ids,...(arrivals[key]||[])])].map(id=>findBook(id)).filter(Boolean).slice(0,max);
    function catalogue(){return {groups:GROUPS.map(group=>({...group,books:shelfBooks(group.ids,group.key,group.max)})),secret:(arrivals.encantadas||[]).map(id=>findBook(id)).filter(Boolean)}}

    // ---------- the bottle on the corridor's shelf: the Beagle under sail for low black volcanic islands ----------
    bottles?.add({key:'galapagos',title:'The Galápagos',label:'THE GALÁPAGOS',author:'A brig under sail for a scatter of low black islands on the equator, each with its crater, as the Beagle sailed among them in 1835.',
      island:[[.06,.035,.03],[.1,.045,.04],[.14,.03,.025]],land:0x3e3a34,enter});

    // ---------- the shelter and the beach ----------
    function build(){
      root=new THREE.Group();root.name='galapagos';const {cx,cz,w,d,h}=ROOM;
      let k=31;const r=()=>(k=(k*9301+49297)%233280)/233280;
      const plankTex=own(canvasTexture((c,W,H)=>{c.fillStyle='#8a7a66';c.fillRect(0,0,W,H);for(let y=0;y<H;y+=32){const v=110+r()*40;c.fillStyle=`rgb(${v},${v-12},${v-30})`;c.fillRect(0,y+2,W,28);c.fillStyle='rgba(40,30,20,.35)';for(let i=0;i<6;i++)c.fillRect(r()*W,y+4+r()*22,20+r()*60,1)}},256,256));
      plankTex.wrapS=plankTex.wrapT=THREE.RepeatWrapping;plankTex.repeat?.set?.(2,1);
      const sandTex=own(canvasTexture((c,W,H)=>{c.fillStyle='#4a4440';c.fillRect(0,0,W,H);for(let i=0;i<2600;i++){const v=50+r()*60;c.fillStyle=`rgb(${v},${v-4},${v-8})`;c.fillRect(r()*W,r()*H,2,2)}},256,256));
      sandTex.wrapS=sandTex.wrapT=THREE.RepeatWrapping;sandTex.repeat?.set?.(6,6);
      const planks=std({color:0xb8a890,map:plankTex,roughness:.95}),timber=std({color:0x5a4634,roughness:.85}),sand=std({color:0x8a8078,map:sandTex,roughness:1}),
        lava=std({color:0x2a2624,roughness:.95,flatShading:true}),thatch=std({color:0x8a7a52,roughness:1}),wood=MAT.darkWood||std({color:0x3a2416,roughness:.7});
      // The ground: black sand from the shelter to the lava, and the sea beyond.
      box(w+16,.3,d+SHORE+2,sand,cx,-.15,cz+SHORE/2-1,root);
      const sea=add(own(new THREE.PlaneGeometry(60,30)),std({color:0x24506a,roughness:.3,metalness:.1,emissive:0x0a1a28,emissiveIntensity:.3}),cx,-.25,zs+15,root);sea.rotation.x=-Math.PI/2;
      // The shelter: three walls of weathered planks on whale-ship timbers, open to the south, under a thatch of palm.
      const T=.12;
      box(w+T,h,T,planks,cx,h/2,z0,root);box(T,h,d,planks,x0,h/2,cz,root);box(T,h,d,planks,x1,h/2,cz,root);
      for(const px of [x0,cx-1.4,cx+1.4,x1])box(.2,h+.15,.2,timber,px,(h+.15)/2,z1,root);for(const px of [x0,x1])box(.2,h+.15,.2,timber,px,(h+.15)/2,z0,root);
      box(w+.4,.16,.2,timber,cx,h+.08,z1,root);box(w+.4,.16,.2,timber,cx,h+.08,z0,root);
      const roof=box(w+1,.14,d+1.4,thatch,cx,h+.42,cz+.2,root);roof.rotation.x=-.12;
      box(w,.04,d,std({color:0x6a5a44,roughness:.95}),cx,.02,cz,root);
      mark(sign(root,'POST OFFICE BAY','Floreana, the Galápagos',2.6,.42,cx,2.4,z0+.08),card('sign'));
      // The shelves: the Beagle on the west wall, the whalers on the east, what the islands taught on the north.
      const {groups}=catalogue(),geometry=own(new THREE.BoxGeometry(.62,.86,.12)),ROWS=[1.0,1.9];
      for(const group of groups){
        if(group.wall==='north'){
          const sx=cx+2.4,sz=z0+.3,step=.85;group.books.forEach((book,i)=>placeBook(book,{x:sx+(i-(group.books.length-1)/2)*step,y:ROWS[0],z:sz,yaw:0},geometry,group.key));
          box(2.4,.05,.34,wood,sx,ROWS[0]-.46,sz-.02,root);block(sx,sz,2.5,.7);
          mark(sign(root,group.name,group.sub,2.2,.36,sx,ROWS[0]+.68,z0+.08),card(`shelf_${group.key}`));continue}
        const length=group.wall==='west'?3.2:2.2,c=group.wall==='west'?cz:cz-.7;
        const per=group.books.length>3?Math.ceil(group.books.length/2):Math.max(1,group.books.length),step=Math.min(1.0,(length-.3)/Math.max(1,per));
        const side=group.wall==='west'?1:-1,sx=group.wall==='west'?x0+.3:x1-.3,yaw=side*Math.PI/2;
        group.books.forEach((book,i)=>{const row=i<per?0:1,n=row?group.books.length-per:per,col=row?i-per:i,offset=(col-(n-1)/2)*step;placeBook(book,{x:sx,y:ROWS[row],z:c+side*offset,yaw},geometry,group.key)});
        const rows=group.books.length>per?ROWS:ROWS.slice(0,1);for(const y of rows)box(.34,.05,length,wood,sx-side*.02,y-.46,c,root);block(sx,c,.7,length+.2);
        const label=sign(root,group.name,group.sub,2.2,.36,group.wall==='west'?x0+.08:x1-.08,rows.at(-1)+.66,c);label.rotation.y=yaw;mark(label,card(`shelf_${group.key}`));
      }
      hang('chart',cx-2.3,1.55,z0+.08,0,1.0);hang('finches',cx-.55,1.6,z0+.08,0,.8);hang('tortoise',cx+.65,1.6,z0+.08,0,.8);hang('map1794',cx+2.4,2.28,z0+.08,0,.5);
      buildTable(cx-1.6,cz+.6,wood);buildShore(lava,timber,wood);buildView();
      // The low sun in the west, and the lantern in the shelter.
      const sun=new THREE.DirectionalLight(0xffc89a,1.2);sun.position.set(cx-30,7,cz+12);sun.target.position.set(cx,0,cz+4);root.add(sun);root.add(sun.target);
      lantern=new THREE.PointLight(0xffd090,.9,10,2);lantern.position.set(cx-1.6,1.4,cz+.6);root.add(lantern);
      if(wasFound())leaveBook();
      placeVisitorsBook?.({parent:root,x:cx+.4,z:cz-1.1,mark,own});
      scene.add(root);
    }
    function placeBook(book,spot,geometry,shelf,parent=root){
      const mesh=add(geometry,own(bookMaterial(book)),spot.x,spot.y,spot.z,parent);mesh.rotation.order='YXZ';mesh.rotation.y=spot.yaw||0;mesh.rotation.x=spot.tilt??-.08;
      mesh.userData={type:'book',book,loaded:false,galapagos:true,shelf,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent}};
      interactables.push(mesh);ours.push(mesh);books.push(mesh);return mesh}
    function hang(key,x,y,z,yaw,width){
      const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=yaw;root.add(g);const p=PICTURES[key],height=width*p.ratio;
      const data={type:'galapagos-picture',picture:key,title:p.title,author:CARDS[p.card][1],action:'LOOK CLOSELY'};
      const frame=mark(box(width+.08,height+.08,.04,MAT.darkWood||std({color:0x2c1c12,roughness:.6}),0,0,0,g),data);
      const mat=std({color:0x9a927f,roughness:.9}),sheet=mark(add(own(new THREE.PlaneGeometry(width,height)),mat,0,0,.025,g),data);
      try{new THREE.TextureLoader().load(`${pictures}${p.file}-wall.jpg`,texture=>{if(!root)return texture.dispose?.();texture.colorSpace=THREE.SRGBColorSpace;own(texture);mat.map=texture;mat.color?.set?.(0xd8d4c8);mat.needsUpdate=true;
        const image=texture.image;if(image?.width&&image?.height){const k=image.height/image.width/p.ratio;sheet.scale.y=k;frame.scale.y=(height*k+.08)/(height+.08)}})}catch(e){}
      return g}
    // The table with the lantern and the bottle home, and a sea chest to sit on.
    function buildTable(x,z,wood){
      const g=new THREE.Group();g.position.set(x,0,z);root.add(g);
      box(1.3,.05,.75,wood,0,.74,0,g);for(const [lx,lz] of [[-.58,-.3],[.58,-.3],[-.58,.3],[.58,.3]])box(.06,.73,.06,wood,lx,.365,lz,g);
      // A ship's lantern.
      add(own(new THREE.CylinderGeometry(.07,.07,.2,10,1,true)),std({color:0xfff0c8,emissive:0xffb050,emissiveIntensity:1.4,transparent:true,opacity:.8}),-.4,.88,-.05,g);
      box(.16,.02,.16,std({color:0x2a2a2a,metalness:.5,roughness:.5}),-.4,.77,-.05,g);box(.12,.02,.12,std({color:0x2a2a2a,metalness:.5,roughness:.5}),-.4,.99,-.05,g);
      const glass=std({color:0xd9efe6,transparent:true,opacity:.22,roughness:.05,metalness:.1,depthWrite:false}),exit={type:'galapagos-exit',title:'Back to the Long Corridor',author:'Into the bottle, and out again on the shelf in the Long Corridor, towards the Grand Hall.',action:'RETURN'};
      const b=new THREE.Group();b.position.set(.3,.86,0);g.add(b);const body=add(own(new THREE.CylinderGeometry(.085,.085,.38,18,1,true)),glass,0,0,0,b);body.rotation.z=Math.PI/2;
      const neck=add(own(new THREE.CylinderGeometry(.028,.032,.12,10,1,true)),glass,-.25,0,0,b);neck.rotation.z=Math.PI/2;add(own(new THREE.CylinderGeometry(.026,.022,.05,10)),std({color:0x9a7448,roughness:.9}),-.33,0,0,b).rotation.z=Math.PI/2;
      const hull=box(.12,.022,.035,std({color:0x3b2414,roughness:.6}),-.04,-.03,0,b);box(.003,.1,.003,std({color:0x5a3a1e}),-.04,.02,0,b);add(own(new THREE.PlaneGeometry(.05,.05)),std({color:0xf1e9d4,side:THREE.DoubleSide}),-.04,.02,.003,b);
      box(.4,.03,.12,wood,0,-.1,0,b);
      const plateTex=own(canvasTexture((c,W,H)=>{c.fillStyle='#caa15a';c.fillRect(0,0,W,H);c.strokeStyle='#6b4d22';c.lineWidth=4;c.strokeRect(5,5,W-10,H-10);c.fillStyle='#2b1d0e';c.textAlign='center';
        c.font='bold 26px Georgia';c.fillText('THE LONG CORRIDOR',W/2,40);c.font='italic 18px Georgia';c.fillText('towards the Grand Hall',W/2,68)},400,86));
      const label=add(own(new THREE.PlaneGeometry(.34,.075)),std({map:plateTex,roughness:.5,metalness:.3}),0,-.1,.065,b);
      for(const part of [body,neck,hull,label])mark(part,exit);
      block(x,z,1.4,.9);
      // A sea chest by the table, a seat.
      const chest=new THREE.Group();chest.position.set(x,0,z+.85);chest.rotation.y=Math.PI;root.add(chest);
      const parts=[box(.9,.46,.5,std({color:0x4a3424,roughness:.8}),0,.23,0,chest),box(.92,.05,.52,std({color:0x2a2a2a,metalness:.4,roughness:.6}),0,.47,0,chest)];
      block(x,z+.85,.95,.55);registerSeat?.(parts,chest,new THREE.Vector3(0,1.15,-.05),Math.PI,{title:'A sea chest',author:'Sit by the lantern and read one of the islands’ books.',bookIds:books.map(b=>b.userData.book.id)});for(const part of parts)ours.push(part);
    }
    // The beach: the barrel on its post, a tortoise, prickly pears, a sea lion asleep, the lava along the water with its
    // iguanas, and a driftwood bench.
    function buildShore(lava,timber,wood){
      const {cx}=ROOM;
      // The post office: a barrel on a post, its lid ajar, with a board nailed to the post.
      const g=new THREE.Group();g.position.set(BARREL.x,0,BARREL.z);root.add(g);barrelTop=g;
      const staves=std({color:0x6a4a2e,roughness:.85}),hoop=std({color:0x3a3a36,metalness:.4,roughness:.6}),data={type:'galapagos-barrel',title:CARDS.barrel[0],author:CARDS.barrel[1],action:'LOOK IN'};
      const post=box(.18,1.0,.18,timber,0,.5,0,g),barrel=add(own(new THREE.CylinderGeometry(.3,.27,.7,16)),staves,0,1.35,0,g);
      for(const y of [1.08,1.62])add(own(new THREE.TorusGeometry(.295,.015,4,20)),hoop,0,y,0,g).rotation.x=Math.PI/2;
      const lid=add(own(new THREE.CylinderGeometry(.31,.31,.04,16)),staves,.08,1.72,0,g);lid.rotation.z=.18;
      const board=box(.5,.18,.03,std({color:0xd8ccb0,roughness:.9}),0,.78,.1,g);
      for(const part of [post,barrel,lid,board])mark(part,data);
      // A few letters showing over the rim.
      for(const [lx,lz,rz] of [[-.1,.05,.3],[.05,-.08,-.4],[.12,.08,.1]]){const l=box(.12,.002,.08,std({color:0xf0e8d4,roughness:.9}),lx,1.71,lz,g);l.rotation.z=rz}
      block(BARREL.x,BARREL.z,.75,.75);
      // A giant tortoise, cropping at a fallen cactus pad: a domed shell, four legs, a long neck.
      const t=new THREE.Group();t.position.set(TORTOISE.x,0,TORTOISE.z);t.rotation.y=.6;root.add(t);tortoise=t;
      const shellMat=std({color:0x3a3428,roughness:.8}),skin=std({color:0x5a5244,roughness:.95}),tdata=card('tortoise');
      const shell=add(own(new THREE.SphereGeometry(.62,20,12,0,Math.PI*2,0,Math.PI/2)),shellMat,0,.32,0,t);shell.scale.set(1,.85,1.25);mark(shell,tdata);
      for(const [lx,lz] of [[-.45,-.5],[.45,-.5],[-.45,.5],[.45,.5]])box(.2,.34,.2,skin,lx,.17,lz,t);
      const neckG=add(own(new THREE.CylinderGeometry(.08,.11,.55,8)),skin,0,.48,.9,t);neckG.rotation.x=1.1;const head=add(own(new THREE.SphereGeometry(.12,10,8)),skin,0,.36,1.15,t);head.scale.set(.9,.8,1.3);mark(head,tdata);
      block(TORTOISE.x,TORTOISE.z,1.6,1.9);
      // Prickly pears: a trunk of plates and pads, tree-high.
      const pad=std({color:0x5a7a3a,roughness:.85}),trunk=std({color:0x7a6a50,roughness:.9}),cdata=card('cactus');
      for(const [px,pz,s] of [[cx-6.4,z1+1.4,1],[cx+6.6,z1+6.4,1.2],[cx-6.8,z1+7.6,.8]]){const c=new THREE.Group();c.position.set(px,0,pz);c.scale.set(s,s,s);root.add(c);
        mark(box(.22,1.6,.22,trunk,0,.8,0,c),cdata);
        for(const [ox,oy,oz,ry,rz] of [[0,1.85,0,0,0],[.35,2.15,.1,.6,.5],[-.35,2.1,-.1,-.5,-.5],[.15,2.5,0,.2,.2],[-.1,2.55,.15,1.2,-.2]]){const p=add(own(new THREE.SphereGeometry(.28,10,8)),pad,ox,oy,oz,c);p.scale.set(1,1.3,.25);p.rotation.set(0,ry,rz);mark(p,cdata)}
        block(px,pz,.7*s,.7*s)}
      // A sea lion asleep on the sand.
      const sl=new THREE.Group();sl.position.set(cx+1.8,0,z1+7.4);sl.rotation.y=-.4;root.add(sl);const slMat=std({color:0x3e3630,roughness:.45});
      const body=add(own(new THREE.SphereGeometry(.4,16,10)),slMat,0,.22,0,sl);body.scale.set(.75,.55,2.0);mark(body,card('sealion'));
      const slHead=add(own(new THREE.SphereGeometry(.16,10,8)),slMat,0,.22,.86,sl);slHead.scale.set(1,.9,1.3);mark(slHead,card('sealion'));for(const side of [-1,1]){const fl=box(.32,.03,.16,slMat,side*.34,.06,.45,sl);fl.rotation.y=side*.5}const tail=box(.4,.03,.18,slMat,0,.05,-.9,sl);tail.rotation.y=.2;
      block(cx+1.8,z1+7.4,1.0,1.8);
      // The lava along the water, with marine iguanas basking on it: two InstancedMeshes.
      const rocks=new THREE.InstancedMesh(own(new THREE.DodecahedronGeometry(.5,0)),lava,26),m=new THREE.Matrix4(),q4=new THREE.Quaternion(),e=new THREE.Euler(),s3=new THREE.Vector3(),p3=new THREE.Vector3();
      let n=0;for(let i=0;i<26;i++){const rx=cx-8+i*.62+(i%3)*.15,rz=z1+BEACH+.4+((i*37)%7)/7*1.2,sc=.5+((i*53)%10)/10*.7;e.set(i,i*1.7,i*.3);q4.setFromEuler(e);p3.set(rx,.1*sc,rz);s3.set(sc,sc*.6,sc);m.compose(p3,q4,s3);rocks.setMatrixAt(n++,m)}
      rocks.instanceMatrix.needsUpdate=true;root.add(rocks);ours.push(rocks);
      const iguanaMat=std({color:0x1e1c1c,roughness:.9}),iguanas=new THREE.InstancedMesh(own(new THREE.SphereGeometry(.5,10,6)),iguanaMat,6);
      const spots=[[-5.2,.2],[-3.1,.6],[-1.2,.25],[1.1,.7],[3.6,.35],[5.4,.6]];
      spots.forEach(([dx,dz],i)=>{e.set(0,i*1.3,0);q4.setFromEuler(e);p3.set(cx+dx,.36,z1+BEACH+.5+dz);s3.set(.2,.12,.85);m.compose(p3,q4,s3);iguanas.setMatrixAt(i,m)});
      iguanas.instanceMatrix.needsUpdate=true;iguanas.position.set(0,0,0);root.add(iguanas);
      // The iguanas are picked by a clear box over the middle of the rocks (an InstancedMesh answers for its own place).
      const pick=add(own(new THREE.BoxGeometry(12,.8,1.6)),own(new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false})),cx,.4,z1+BEACH+.8,root);mark(pick,card('iguanas'));
      // The bench, facing the bay.
      const bench=new THREE.Group();bench.position.set(BENCH.x,0,BENCH.z);bench.rotation.y=Math.PI;root.add(bench);
      const bparts=[box(1.6,.1,.36,std({color:0xa89a84,roughness:.95}),0,.46,0,bench)];for(const bx of [-.6,.6])bparts.push(box(.34,.42,.34,lava,bx,.21,0,bench));
      block(BENCH.x,BENCH.z,1.7,.45);registerSeat?.(bparts,bench,new THREE.Vector3(0,1.15,0),Math.PI,{title:CARDS.bench[0],author:CARDS.bench[1],bookIds:books.map(b=>b.userData.book.id)});for(const part of bparts)ours.push(part);
      // Brass plates at the front posts: the bay, the Beagle, the islands one by one, the whalers, Melville.
      const plate=(key,x,z,yaw)=>{const p=add(own(new THREE.PlaneGeometry(.42,.26)),std({color:0xb08d3a,metalness:.6,roughness:.4}),x,1.45,z,root);p.rotation.y=yaw;mark(p,card(key))};
      plate('bay',x0+.13,z1-.25,Math.PI/2);plate('beagle',cx-1.4,z1+.12,0);plate('different',cx+1.4,z1+.12,0);plate('whalers',x1-.13,z1-.25,-Math.PI/2);
      const mp=add(own(new THREE.PlaneGeometry(.42,.26)),std({color:0xb08d3a,metalness:.6,roughness:.4}),0,.58,.12,g);mark(mp,card('melville'));
    }
    // The view: south over the bay at sunset, Champion and the other islets, a whale-ship at anchor; the dry hills and craters
    // of Floreana behind, north.
    function buildView(){
      const {cx}=ROOM;
      const pano=own(canvasTexture((c,W,H)=>{c.translate(W,0);c.scale(-1,1);// seen from inside: drawn mirrored. North at 0 and W, east at W/4, south at W/2, west at 3W/4.
        let k=61;const r=()=>(k=(k*9301+49297)%233280)/233280,hz=H*HORIZON;
        const sky=c.createLinearGradient(0,0,0,hz);sky.addColorStop(0,'#3e4a7a');sky.addColorStop(.55,'#c88a78');sky.addColorStop(1,'#f4b878');c.fillStyle=sky;c.fillRect(0,0,W,H);
        const sx=W*.74;const glow=c.createRadialGradient(sx,hz-H*.03,4,sx,hz-H*.03,W*.14);glow.addColorStop(0,'rgba(255,214,150,1)');glow.addColorStop(1,'rgba(255,170,110,0)');c.fillStyle=glow;c.fillRect(0,0,W,hz);
        c.fillStyle='#ffe0a0';c.beginPath();c.arc(sx,hz-H*.015,H*.03,Math.PI,0);c.fill();
        // The sea from east through south to west, with the sun's path on it.
        const sea=c.createLinearGradient(0,hz,0,H);sea.addColorStop(0,'#5a6e8a');sea.addColorStop(1,'#243e56');c.fillStyle=sea;c.fillRect(W*.12,hz,W*.76,H-hz);
        c.fillStyle='rgba(255,200,130,.5)';for(let i=0;i<30;i++)c.fillRect(sx-W*.02+r()*W*.04,hz+i*H*.012,W*.01+r()*W*.02,2);
        // Islets and far islands on the horizon: low, dark, cratered.
        const isle=(x,w,hgt,color)=>{c.fillStyle=color;c.beginPath();c.moveTo(W*x,hz);c.quadraticCurveTo(W*(x+w*.3),hz-H*hgt,W*(x+w*.5),hz-H*hgt*.8);c.quadraticCurveTo(W*(x+w*.7),hz-H*hgt*1.05,W*(x+w),hz);c.fill()};
        isle(.32,.05,.04,'#3a3440');isle(.42,.03,.025,'#3a3440');isle(.56,.08,.05,'#40384a');isle(.82,.06,.035,'#4a3a44');
        // A whale-ship at anchor in the bay, sails furled.
        const wx=W*.47,wy=hz+H*.06;c.fillStyle='#1e1812';c.beginPath();c.moveTo(wx-34,wy);c.lineTo(wx+34,wy);c.lineTo(wx+28,wy+9);c.lineTo(wx-28,wy+9);c.fill();
        for(const mx of [-18,2,20]){c.fillRect(wx+mx,wy-46,2,46);c.fillRect(wx+mx-10,wy-34,22,2);c.fillRect(wx+mx-8,wy-22,18,2)}
        // The land, north round to east and west: dry hills, craters, grey scrub.
        const land=(from,to,top,color)=>{c.fillStyle=color;c.beginPath();c.moveTo(W*from,H);for(let t=0;t<=1.0001;t+=.01){const x=from+(to-from)*t;c.lineTo(W*x,hz-H*top*Math.min(1,Math.min(t,1-t)*5)+H*.012*Math.sin(t*23))}c.lineTo(W*to,H);c.fill()};
        land(-.22,.24,.2,'#5a5048');land(.76,1.22,.2,'#5a5048');land(-.22,.24,.1,'#4a4038');land(.76,1.22,.1,'#4a4038');
        for(const [x,y,s] of [[.04,.12,.05],[.92,.1,.04],[.14,.08,.03]]){c.fillStyle='#3a322c';c.beginPath();c.ellipse(W*x,hz-H*y,W*s,H*.02,0,0,Math.PI*2);c.fill()}
        // Grey scrub (palo santo, leafless) over the hills.
        c.strokeStyle='rgba(150,140,130,.7)';c.lineWidth=2;for(let i=0;i<120;i++){const x=W*(r()<.5?r()*.22:.78+r()*.22),y=hz-H*(r()*.08)+H*.02;c.beginPath();c.moveTo(x,y);c.lineTo(x+(r()-.5)*12,y-10-r()*12);c.stroke()}
        // The near beach: black sand and lava.
        c.fillStyle='#2a2624';c.beginPath();c.moveTo(0,H);for(let x=0;x<=W;x+=16)c.lineTo(x,H*(.82+.03*Math.sin(x/W*Math.PI*2*7)));c.lineTo(W,H);c.fill()},4096,512));
      const g=new THREE.Group();g.position.set(cx,0,z1+4);root.add(g);
      const ring=add(own(new THREE.CylinderGeometry(R,R,PANO,64,1,true,-Math.PI,Math.PI*2)),own(new THREE.MeshBasicMaterial({map:pano,side:THREE.BackSide,fog:false})),0,EYE+PANO*(HORIZON-.5),0,g);ring.raycast=()=>{};
      const domeTex=own(canvasTexture((c,W,H)=>{const gr=c.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#2a3260');gr.addColorStop(1,'#3e4a7a');c.fillStyle=gr;c.fillRect(0,0,W,H)},64,64));
      const dome=add(own(new THREE.SphereGeometry(R+.5,32,12,0,Math.PI*2,0,Math.PI/2)),own(new THREE.MeshBasicMaterial({map:domeTex,side:THREE.BackSide,fog:false})),0,EYE+PANO*HORIZON-.4,0,g);dome.raycast=()=>{};
      const under=add(own(new THREE.CircleGeometry(R-.2,48)),own(new THREE.MeshBasicMaterial({color:0x243e56,fog:false})),0,EYE+PANO*(HORIZON-.5)-PANO/2+.05,0,g);under.rotation.x=-Math.PI/2;under.raycast=()=>{};
    }
    function leaveBook(){
      const book=catalogue().secret[0];if(!book||barrelBook||!barrelTop)return;
      barrelBook=placeBook(book,{x:-.05,y:1.76,z:.02,yaw:.4,tilt:-Math.PI/2},own(new THREE.BoxGeometry(.62,.86,.12)),'secret',barrelTop)}

    // ---------- walking ----------
    // The shelter's floor and the beach in front of it, down to the lava; the shelter's three walls keep the reader in.
    function contains(x,z){return x>x0-8.5&&x<x1+8.5&&z>z0&&z<zs}
    function floorAt(x,z){return contains(x,z)?0:null}
    function allowed(x,z){
      if(!contains(x,z))return false;const rad=player.radius||.42;
      if(z<z1+.15){// in the shelter, or under its front beam: within its walls.
        if(x-rad<x0+.1||x+rad>x1-.1||z-rad<z0+.1)return false}
      else if(x-rad<x0-8||x+rad>x1+8||z+rad>z1+BEACH)return false;
      // Its back corners are walled: no stepping round the side walls into them from the beach.
      if(z<z1&&(x<x0||x>x1))return false;
      // The front posts.
      for(const px of [x0,ROOM.cx-1.4,ROOM.cx+1.4,x1])if(Math.abs(x-px)<.1+rad&&Math.abs(z-z1)<.1+rad)return false;
      return !blockers.some(b=>x+rad>b.minX&&x-rad<b.maxX&&z+rad>b.minZ&&z-rad<b.maxZ)}

    // ---------- doing things ----------
    function enter(){
      activate();move(ROOM.cx,ROOM.cz+.6,Math.PI);playSample?.('pageTurn',.35,.6);
      showNotice('The Galápagos, at dusk: Post Office Bay on Floreana, a shelter of driftwood at the head of a black beach, and beyond it the lava, the sea and a whale-ship at anchor. The bottle you came through is on the table, to take you back.',14);
      analytics?.track('Room Explored',{room:'galapagos'})}
    function leave(){const p=bottles?.standBefore?.('galapagos')||{x:1701,z:-2,yaw:-Math.PI/2};move(p.x,p.z,p.yaw);playSample?.('pageTurn',.35,.6);showNotice('The Long Corridor again, and the bottle back on its shelf.',4)}
    function lookInBarrel(){
      playSample?.('pageTurn',.45,.8);
      if(!wasFound()){try{storage?.setItem(FOUND_KEY,'1')}catch(e){}leaveBook();analytics?.track('Secret Found',{room:'galapagos',secret:'barrel'});showNotice(`${CARDS.secret[0]}. ${CARDS.secret[1]}`,16);return}
      showNotice(`${CARDS.bay[0]}: ${CARDS.bay[1]}`,12)}
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('galapagos-'))return false;
      if(data.type==='galapagos-exit'){leave();return true}
      if(data.type==='galapagos-barrel'){lookInBarrel();return true}
      if(data.type==='galapagos-picture'){const p=PICTURES[data.picture];if(showPicture)showPicture({kicker:'THE GALÁPAGOS',title:p.title,src:`${pictures}${p.file}.jpg`,caption:data.author,credit:p.credit});else showNotice(`${p.title}: ${data.author}`,12);return true}
      if(data.type==='galapagos-card'){showNotice(`${data.title}: ${data.author}`,data.author.length>320?18:data.author.length>160?13:9);return true}
      return false}

    // ---------- lifecycle ----------
    function activate(){if(!root)build();lastNeeded=time}
    function unload(){
      if(!root)return;root.removeFromParent();root.traverse(object=>{if(object.isLight)object.userData.freed=true});root=null;barrelTop=null;barrelBook=null;lantern=null;tortoise=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0}
    function update(t){
      // Built ahead while the reader stands by the bottles' shelf, so that looking in does not wait.
      time=t;const inside=contains(player.pos.x,player.pos.z),bay=bottles?.bay,near=!!bay&&Math.hypot(player.pos.x-bay.x,player.pos.z-bay.z)<3.2;
      if(inside||near&&(root||window.libraryMayBuild?.()!==false))activate();
      else if(root&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==b.userData.home.parent))unload();
      if(!inside||!root)return;
      // The lantern's flame, and the tortoise, which turns its head now and then.
      if(lantern)lantern.intensity=.85+.08*Math.sin(t*7.3)+.05*Math.sin(t*13.1);
      if(tortoise)tortoise.rotation.y=.6+.12*Math.sin(t*.15)}
    return {contains,floorAt,allowed,interact,update,enter,leave,activate,unload,catalogue,room:ROOM,shore:SHORE,beach:BEACH,barrel:BARREL,groups:GROUPS,own:OWN,quotes:QUOTES,sources:SOURCES,cards:CARDS,pictures:PICTURES,
      get built(){return !!root},get books(){return books.slice()},get found(){return wasFound()},zoneAt:(x,z)=>contains(x,z)?'galapagos':null};
  };
})();
