// The Faroe Islands: the roykstova, the old smoke-room of a farmhouse at Kirkjubøur on the south of Streymoy, on a light
// night at midsummer, reached through the sixth ship in a bottle on the Long Corridor's shelf (ships-in-bottles.js, handed
// `bottles`). The roykstova was the room of the old Faroese house where the fire burned on an open hearth, the smoke went
// out through a hole in the roof, and the household sat in the evenings carding, spinning and knitting while stories were
// told and ballads sung. This one is built after Johannes Klein's photograph of 1898: the hearth in its plank box, the
// kettle hung from a wooden arm over the turf fire. Its door stands open on a walled yard with a drying-shed, and beyond
// it, painted inside a ring, the fjord, the islands of Hestur and Koltur, the ruin of the cathedral on the shore, and a sky
// that does not get dark. Two lights: the fire, and the pale night.
//
// The cards keep to what is attested: the Irish hermits Dicuil heard of about 825; the Norse settlement; Sigmund Brestisson
// and Thrand of Gata in Heimskringla; Kirkjubøur, the bishop's seat, and its unfinished cathedral; Hammershaimb's
// written Faroese of 1846; the Løgting at Tinganes; the flag; the chain dance and the ballads. Every quotation (`QUOTES`)
// is checked against the library's own texts by a test.
//
// The secret is the sea chest with its key left in the lock, as in the story told at Mikladalur on Kalsoy of the seal
// woman: open it and it is empty, and out in the fjord a seal lifts her head, looks at the house, and is gone. Selous's
// Bird Watcher in the Shetlands, with its notes on seals, is then on the chest (shelf `faroe-seal`), found for good
// (athenaeum-faroe-seal; ?sealwoman).
(function(){
  'use strict';

  // The library's own books: Nansen (Dicuil and the Irish hermits), Markham and Verne (who pass the islands on the way
  // north), Heimskringla (Sigmund Brestisson, Thrand of Gata, and the people of the Farey Islands).
  const OWN={islands:[40633,18857,71127],sagas:[598],neighbours:[]};
  const GROUPS=[
    {key:'islands',name:'THE ISLANDS',sub:'And those who came to them',wall:'west',along:0,length:3.6,max:6,ids:OWN.islands},
    {key:'sagas',name:'THE SAGAS',sub:'And the ballads',wall:'east',along:-1.3,length:2.3,max:4,ids:OWN.sagas},
    {key:'neighbours',name:'THE NEIGHBOURS',sub:'Orkney, Shetland and the sea-birds',wall:'east',along:1.3,length:2.3,max:3,ids:OWN.neighbours}
  ];
  // Their own words, from the library's texts, checked by a test (letters alone).
  const QUOTES={
    turf:'The green tint we had observed is grassy turf—but it happens to be growing on the roofs of the wooden houses',
    sickle:'Observed a man on the top of a house cutting grass with a sickle.',
    broth:'a savoury pot of puffin broth, suspended from the ceiling and boiling on a turf fire built open like a smith’s forge, the smoke finding only a very partial egress by the hole overhead',
    lochlong:'The scenery around is not unlike that of Loch Long in Scotland',
    kirkuboe:'On the west coast of Stromoe is the roofless ruin of the church of Kirkuboe.',
    lonely:'What a strange lonely place for a church!',
    heights:'we see Hestoe, Kolter, Vaagoe, and other distant blue island heights',
    puffin:'ending with the puffin, which takes the highest station in this bird congress',
    kinder:'No people could have been kinder.',
    amber:'we leave the Faröe islands astern, relieved against an amber sky',
    dicuil:'But as since the beginning of the world they had always been deserted, so are they now by reason of the Northman pirates emptied of anchorites, but full of innumerable sheep and a great number of different kinds of sea-birds.',
    peopled:'the out-countries of Iceland and the Farey Isles were discovered and peopled',
    wool:'Here are all the houses full of wool, which is neither used nor sold.',
    gales:'unless, indeed, we meet with some northeast gales among the Faroe Islands',
    seal:'a very human—mildly human—and extremely intelligent appearance they had',
    english:'So far as I am aware no version of any of the Faroese ballads has appeared in English.'
  };
  const SOURCES={turf:71936,sickle:71936,broth:71936,lochlong:71936,kirkuboe:71936,lonely:71936,heights:71936,puffin:71936,kinder:71936,amber:71936,dicuil:40633,peopled:598,wool:598,gales:18857,seal:51429,english:33471};
  const q=key=>`“${QUOTES[key]}”`;
  const CARDS={
    sign:['The Faroe Islands','Føroyar: eighteen islands in the North Atlantic between Shetland and Iceland, steep and green and treeless, with some fifty-five thousand people and more sheep than people. They govern themselves within the Kingdom of Denmark, with their own parliament, the Løgting, and their own language, Faroese.'],
    roykstova:['The roykstova','The smoke-room: the living room of the old Faroese house, where the fire burned on an open hearth and the smoke found its way out through a hole in the roof. In the evenings the household sat here together, carding, spinning and knitting the wool, while stories were told and the old ballads sung.'],
    hearth:['The hearth','A turf fire on an open hearth, banked in a box of planks, with the kettle hung over it from a wooden arm. Bread was baked in the embers. The fire was not let out.'],
    smoke:['The smoke-hole',`There is no chimney. The smoke goes up through a hole in the roof, and the light of the night comes down through it. In a fisherman’s house in Thorshavn in 1859, Andrew Symington saw ${q('broth')}.`],
    roof:['A turf roof',`The house is roofed with birch bark and turf, as Faroese houses were, and the grass grows on it. Coming into Thorshavn in 1859, Symington wrote: ${q('turf')}. ${q('sickle')}`],
    dicuil:['About 825',`The Irish monk Dicuil, writing about 825 at the court of the Franks, was told of islands two days’ sail north of Britain where Irish hermits had lived for about a hundred years, until the Northmen came. They are thought to have been the Faroes. ${q('dicuil')}`],
    settlement:['The Norse',`Norse settlers came to the islands in the ninth century, from Norway and by way of the Scottish islands: in Snorri’s words, when King Harald took the lands of Norway, ${q('peopled')}. Their law-meeting, the thing, met on the rocky point of Tinganes in Tórshavn, and the Løgting, which comes down from it, is counted among the oldest parliaments in the world.`],
    sigmund:['Sigmund and Thrand',`About the year 1000 Sigmund Brestisson came home from the court of Olaf Tryggvason in Norway to bring the islands to Christianity, and his great rival was Thrand of Gata, who held to the old ways. Their story is the Færeyinga saga, and Snorri tells part of it in Heimskringla, where old Thrand, at Gata, taunts his idle nephews: ${q('wool')}`],
    kirkjubour:['Kirkjubøur',`For most of the Middle Ages the bishops of the Faroes had their seat here. The cathedral of St Magnus by the shore was begun about 1300 and never finished; its walls still stand without a roof. Beside it are the old church of St Olaf and the farmhouse of Kirkjubøargarður, among the oldest wooden houses still lived in. Symington, sailing past in 1859: ${q('kirkuboe')} ${q('lonely')}`],
    language:['Faroese','Faroese comes down from the Norse of the settlers. For centuries the church and the law used Danish, and Faroese was spoken and sung but hardly written, until V. U. Hammershaimb set down its written form in 1846.'],
    ballads:['The chain dance',`The Faroese still dance as the Middle Ages did: in a long linked ring, stepping to the singing of the kvæði, ballads of heroes and kings, some of them hundreds of verses long, with no instrument but the voices and the feet. It is danced at Ólavsøka, the national festival at the end of July. When Nora Kershaw put some of them into English in 1921, she wrote, ${q('english')}`],
    night:['A light night','At midsummer the sun goes down here for only a few hours, and it does not get dark. The sky stays pale over the fjord all night.'],
    yard:['The yard',`A walled yard before the door, with the infield beyond it and the fjord below. Across the water are the islands of Hestur and Koltur; from the deck of his steamer Symington wrote, ${q('heights')}.`],
    hjallur:['The hjallur','A shed of slatted boards that the wind blows through, where mutton and fish hang to dry in the salt air until they are ready to eat. Wind-dried mutton, skerpikjøt, is one of the islands’ old foods.'],
    flag:['Merkið','The Faroese flag, a red cross edged with blue on white, first raised in 1919. During the Second World War, while Denmark was occupied and the islands were held by Britain, it was recognised for Faroese ships, on 25 April 1940, and that day is still kept as Flag Day.'],
    chest:['A sea chest','A painted wooden chest, with its key left in the lock.'],
    bench:['A bench in the yard','Sit and watch the fjord.'],
    roykstova_picture:['A roykstova, 1898','Johannes Klein’s photograph of the smoke-room of a house at Skipanes: the kettle hangs over the turf fire from a wooden arm, and the woman on the left is baking bread in the embers.'],
    thorshavn:['Tórshavn, 1898','Tórshavn from the harbour, with boats drawn up on the shore, in a photograph of 1898.'],
    milkmaids:['Milkmaids at Haraldsund, 1898','Milkmaids on their way to milk the cows in the outfield at Haraldsund, on Kunoy, photographed by Johannes Klein. The pails are carried on their backs on woollen bands.'],
    fishermen:['Fishermen, 1898','Faroese fishermen in their caps and knitted jumpers, photographed by Johannes Klein in 1898.'],
    dance:['The chain dance','Faroese men in the chain dance, about 1930, photographed by Sophie Petersen.'],
    map:['Debes’s map, 1673','The map of the islands from Lucas Debes’s description of the Faroes, published in Copenhagen in 1673, the first full description of the islands. Debes was the provost of the Faroes, at Tórshavn.'],
    shelf_islands:['The islands',`The travellers who called, and those who passed on their way north: Nansen on the Irish hermits; Symington, who sailed from Leith in 1859 and wrote of Thorshavn, ${q('kinder')}; Bisiker in 1900; Markham; and Verne’s skipper, who promised ten days to Iceland ${q('gales')}. Symington left at evening: ${q('amber')}.`],
    shelf_sagas:['The sagas','Heimskringla, the sagas of Olaf Tryggvason and Harald the Tyrant, and Faroese ballads in English.'],
    shelf_neighbours:['The neighbours',`Orkney and Shetland, settled by the same people in the same centuries, and the sea-birds the islands share. On the cliffs, Symington saw the birds sit in rows, ${q('puffin')}.`],
    secret:['The seal woman',`At Mikladalur on Kalsoy they tell of the seals who came ashore on the thirteenth night after Christmas and danced as people. A young man hid the skin of one of the seal women, and she stayed and was his wife; he kept the skin locked in a chest and the key always on him. One day he went out fishing and forgot the key. The chest is empty. Out in the fjord a seal lifts her head and looks at the house, and is gone; and someone has left a book on the chest: Selous’s notes on the seals of Shetland, of whom he wrote, ${q('seal')}.`]
  };
  const PICTURES={
    roykstova:{file:'faroe-roykstova',title:'The roykstova of a house at Skipanes, 1898',credit:'Johannes Klein, 1898. Nationalmuseet, Copenhagen. Public domain, from Wikimedia Commons.',ratio:.71,card:'roykstova_picture'},
    thorshavn:{file:'faroe-thorshavn',title:'Tórshavn from the harbour, 1898',credit:'1898. Public domain, from Wikimedia Commons.',ratio:.79,card:'thorshavn'},
    milkmaids:{file:'faroe-milkmaids',title:'Milkmaids at Haraldsund, 1898',credit:'Johannes Klein, 1898. Nationalmuseet, Copenhagen. Public domain, from Wikimedia Commons.',ratio:.69,card:'milkmaids'},
    fishermen:{file:'faroe-fishermen',title:'Faroese fishermen, 1898',credit:'Johannes Klein, 1898. Public domain, from Wikimedia Commons.',ratio:.7,card:'fishermen'},
    dance:{file:'faroe-dance',title:'The chain dance, about 1930',credit:'Sophie Petersen, about 1930. Royal Danish Geographical Society, Nationalmuseet. Public domain, from Wikimedia Commons.',ratio:.64,card:'dance'},
    map:{file:'faroe-map',title:'Lucas Debes’s map of the Faroes, 1673',credit:'From Lucas Debes, Færoæ & Færoa reserata, 1673. Public domain, from Wikimedia Commons.',ratio:1.29,card:'map'}
  };
  const FOUND_KEY='athenaeum-faroe-seal';

  window.createFaroeIslands=function(options){
    const {placeVisitorsBook=null,THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,arrivals={},showNotice,playSample,move,analytics,isHolding=()=>false,registerSeat=null,
      bottles=null,showPicture=null,storage=null,search='',pictures='assets/pictures/'}=options;
    // The room (its south wall open on the yard) and the yard south of it.
    const ROOM={cx:2600,cz:2100,w:8,d:5.5,h:3.0},YARD=3.4;
    const x0=ROOM.cx-ROOM.w/2,x1=ROOM.cx+ROOM.w/2,z0=ROOM.cz-ROOM.d/2,z1=ROOM.cz+ROOM.d/2,zy=z1+YARD;
    const DOOR={x:ROOM.cx,w:1.8},CHEST={x:ROOM.cx-3.2,z:z0+.45},KEEP=25,R=26,EYE=1.72,HORIZON=.6,PANO=26;
    const wasFound=()=>{try{return storage?.getItem(FOUND_KEY)==='1'||/[?&](sealwoman|kopakonan)\b/.test(search)}catch(e){return false}};
    let root=null,time=0,lastNeeded=-1e9,chest=null,lid=null,chestBook=null,fire=null,seal=null,sealShow=0,lidOpen=0;
    const owned=[],ours=[],books=[],blockers=[];
    const own=thing=>{owned.push(thing);return thing};
    const std=params=>own(new THREE.MeshStandardMaterial(params));
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const card=key=>({type:'faroe-card',key,title:CARDS[key][0],author:CARDS[key][1],action:'READ'});
    function sign(parent,text,sub,w,h,x,y,z){
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle='#ece6d6';c.fillRect(0,0,W,H);c.strokeStyle='#1f3d6b';c.lineWidth=3;c.strokeRect(7,7,W-14,H-14);
        c.fillStyle='#c8102e';c.fillRect(7,7,W-14,5);c.fillRect(7,H-12,W-14,5);
        c.fillStyle='#1c2630';c.textAlign='center';c.font='bold 27px Georgia';c.fillText(text,W/2,sub?50:H/2+10);if(sub){c.font='italic 19px Georgia';c.fillText(sub,W/2,82)}},620,sub?104:70));
      return add(own(new THREE.PlaneGeometry(w,h)),std({map,emissive:0x2a3036,emissiveIntensity:.25,roughness:.9}),x,y,z,parent)}
    const shelfBooks=(ids,key,max)=>[...new Set([...ids,...(arrivals[key]||[])])].map(id=>findBook(id)).filter(Boolean).slice(0,max);
    function catalogue(){return {groups:GROUPS.map(group=>({...group,books:shelfBooks(group.ids,group.key,group.max)})),secret:(arrivals.seal||[]).map(id=>findBook(id)).filter(Boolean)}}

    // ---------- the bottle on the corridor's shelf: a ship for a cluster of steep green islands ----------
    bottles?.add({key:'faroe',title:'The Faroe Islands',label:'THE FAROE ISLANDS',author:'A ship under sail for a cluster of steep green islands in a grey sea, their tops in cloud.',
      island:[[.06,.035,.06],[.1,.04,.075],[.14,.03,.05]],land:0x4c7a44,enter});

    // ---------- the room and the yard ----------
    function build(){
      root=new THREE.Group();root.name='faroe';const {cx,cz,w,d,h}=ROOM;
      const boardTex=own(canvasTexture((c,W,H)=>{c.fillStyle='#6a4a2e';c.fillRect(0,0,W,H);for(let x=0;x<W;x+=32){const v=90+((x*13)%40);c.fillStyle=`rgb(${v},${v*.72|0},${v*.48|0})`;c.fillRect(x+1,0,30,H);c.fillStyle='rgba(20,10,4,.6)';c.fillRect(x,0,1.5,H)}},256,256));
      boardTex.wrapS=boardTex.wrapT=THREE.RepeatWrapping;boardTex.repeat?.set?.(3,1);
      const floorTex=own(canvasTexture((c,W,H)=>{c.fillStyle='#5a4028';c.fillRect(0,0,W,H);for(let y=0;y<H;y+=26){c.fillStyle=`rgba(${20+((y*7)%30)},12,6,.5)`;c.fillRect(0,y,W,2)}},256,256));
      floorTex.wrapS=floorTex.wrapT=THREE.RepeatWrapping;floorTex.repeat?.set?.(3,4);
      const panel=std({color:0xb08a60,map:boardTex,roughness:.85}),floor=std({color:0x8a6a4a,map:floorTex,roughness:.9}),tar=std({color:0x1c1814,roughness:.9}),
        wood=MAT.darkWood||std({color:0x3a2416,roughness:.7}),turf=std({color:0x4f6e34,roughness:1}),flag=std({color:0x9a948a,roughness:.95}),stone=std({color:0x4a4640,roughness:1});
      // Floors: the room's boards, the yard's flags, and the infield below the wall.
      box(w,.3,d,floor,cx,-.149,cz,root);box(w+1,.3,YARD,flag,cx,-.15,z1+YARD/2,root);
      box(w+6,.3,5,std({color:0x557a3c,roughness:1}),cx,-.5,zy+2.5,root);
      // Walls: tarred timber outside, panelled inside; the south wall with the doorway onto the yard.
      const T=.3;
      for(const [ww,hh,dd,x,z,ix,iz] of [[w+T,h,T,cx,z0,0,1],[T,h,d,x0,cz,1,0],[T,h,d,x1,cz,-1,0]]){box(ww,hh,dd,tar,x,hh/2,z,root);box(ix?.02:ww-T,hh,iz?.02:dd,panel,x+ix*(T/2+.011),hh/2,z+iz*(T/2+.011),root)}
      const dl=DOOR.x-DOOR.w/2,dr=DOOR.x+DOOR.w/2,piece=(a,b,y0,y1)=>{box(b-a,y1-y0,T,tar,(a+b)/2,(y0+y1)/2,z1,root);box(b-a,y1-y0,.02,panel,(a+b)/2,(y0+y1)/2,z1-T/2-.011,root)};
      piece(x0-T/2,dl,0,h);piece(dr,x1+T/2,0,h);piece(dl,dr,2.2,h);
      // The ceiling, with the smoke-hole over the hearth; the turf roof over it, and a little wooden flue.
      const hole=.7,hz=z0+1.1;
      box(w,.08,hz-hole/2-z0,wood,cx,h,(z0+hz-hole/2)/2,root);box(w,.08,z1-(hz+hole/2),wood,cx,h,(hz+hole/2+z1)/2,root);
      box((w-hole)/2,.08,hole,wood,(x0+cx-hole/2)/2,h,hz,root);box((w-hole)/2,.08,hole,wood,(x1+cx+hole/2)/2,h,hz,root);
      for(let bx=x0+1;bx<x1;bx+=1.6)box(.18,.2,d,wood,bx,h-.14,cz,root);
      const sky=add(own(new THREE.PlaneGeometry(hole,hole)),own(new THREE.MeshBasicMaterial({color:0xd8dcec,fog:false})),cx,h+.45,hz,root);sky.rotation.x=Math.PI/2;mark(sky,card('smoke'));
      for(const [sx,sz,ww,dd] of [[cx-hole/2-.03,hz,.06,hole],[cx+hole/2+.03,hz,.06,hole],[cx,hz-hole/2-.03,hole+.12,.06],[cx,hz+hole/2+.03,hole+.12,.06]])box(ww,.5,dd,wood,sx,h+.25,sz,root);
      for(const side of [-1,1]){const slope=box(w+1,.3,d/2+.9,turf,cx,h+1.05,cz+side*(d/4+.2),root);slope.rotation.x=side*.5;mark(slope,card('roof'))}
      // Inside: the sign over the hearth, the shelves on the side walls, the pictures, the table with the bottle home.
      mark(sign(root,'THE FAROE ISLANDS','Kirkjubøur, the roykstova',2.4,.4,cx,2.5,z0+.18),card('sign'));
      const {groups}=catalogue(),geometry=own(new THREE.BoxGeometry(.62,.86,.12)),ROWS=[1.05,1.95];
      for(const group of groups){
        const per=group.books.length>3?Math.ceil(group.books.length/2):Math.max(1,group.books.length),step=Math.min(1.0,(group.length-.3)/Math.max(1,per));
        const side=group.wall==='west'?1:-1,sx=group.wall==='west'?x0+.34:x1-.34,yaw=side*Math.PI/2,zc=cz+group.along;
        group.books.forEach((book,i)=>{const row=i<per?0:1,n=row?group.books.length-per:per,col=row?i-per:i,offset=(col-(n-1)/2)*step;placeBook(book,{x:sx,y:ROWS[row],z:zc+offset,yaw},geometry,group.key)});
        const rows=group.books.length>per?ROWS:ROWS.slice(0,1);for(const y of rows)box(.34,.05,group.length,wood,sx-side*.02,y-.46,zc,root);block(sx,zc,.7,group.length+.2);
        const label=sign(root,group.name,group.sub,Math.min(2.2,group.length-.1),.34,group.wall==='west'?x0+.22:x1-.22,rows.at(-1)+.64,zc);label.rotation.y=yaw;mark(label,card(`shelf_${group.key}`));
      }
      hang('roykstova',cx-2.85,1.75,z0+.18,0,.95);hang('milkmaids',cx-1.55,1.75,z0+.18,0,.8);hang('fishermen',cx+1.55,1.75,z0+.18,0,.8);hang('thorshavn',cx+2.85,1.75,z0+.18,0,.95);
      hang('map',cx-2.6,1.65,z1-.18,Math.PI,.62);hang('dance',cx+2.75,1.65,z1-.18,Math.PI,.95);
      const plate=(key,x,y,z,yaw)=>{const p=add(own(new THREE.PlaneGeometry(.42,.26)),std({color:0xb08d3a,metalness:.6,roughness:.4}),x,y,z,root);p.rotation.y=yaw;mark(p,card(key))};
      plate('dicuil',cx-1.55,1.45,z1-.18,Math.PI);plate('settlement',cx-.55,2.6,z1-.18,Math.PI);plate('sigmund',cx+.55,2.6,z1-.18,Math.PI);
      plate('language',cx-1.55,1.08,z0+.18,0);plate('ballads',cx+1.55,1.08,z0+.18,0);
      buildHearth(cx,z0,wood);buildTable(cx,cz+.5,wood);buildChest(wood);buildYard(wood,stone,turf);buildView();
      // The fire, and the light night through the door and the smoke-hole.
      const night=new THREE.DirectionalLight(0xc8d0ec,.55);night.position.set(cx+6,10,cz+20);night.target.position.set(cx,0,cz);root.add(night);root.add(night.target);
      fire=new THREE.PointLight(0xffa860,.9,8,2);fire.position.set(cx,1.0,z0+.9);root.add(fire);
      if(wasFound())leaveBook();
      if(placeVisitorsBook){placeVisitorsBook({parent:root,x:cx+3.3,z:z1+1.1,mark,own});block(cx+3.3,z1+1.1,1.0,.7)}
      scene.add(root);
    }
    function placeBook(book,spot,geometry,shelf,parent=root){
      const mesh=add(geometry,own(bookMaterial(book)),spot.x,spot.y,spot.z,parent);mesh.rotation.order='YXZ';mesh.rotation.y=spot.yaw||0;mesh.rotation.x=spot.tilt??-.08;
      mesh.userData={type:'book',book,loaded:false,faroe:true,shelf,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent}};
      interactables.push(mesh);ours.push(mesh);books.push(mesh);return mesh}
    function hang(key,x,y,z,yaw,width){
      const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=yaw;root.add(g);const p=PICTURES[key],height=width*p.ratio;
      const data={type:'faroe-picture',picture:key,title:p.title,author:CARDS[p.card][1],action:'LOOK CLOSELY'};
      const frame=mark(box(width+.1,height+.1,.04,MAT.darkWood||std({color:0x2c1c12,roughness:.6}),0,0,0,g),data);
      const mat=std({color:0x9a927f,roughness:.9}),sheet=mark(add(own(new THREE.PlaneGeometry(width,height)),mat,0,0,.025,g),data);
      try{new THREE.TextureLoader().load(`${pictures}${p.file}-wall.jpg`,texture=>{if(!root)return texture.dispose?.();texture.colorSpace=THREE.SRGBColorSpace;own(texture);mat.map=texture;mat.color?.set?.(0xd8d4c8);mat.needsUpdate=true;
        const image=texture.image;if(image?.width&&image?.height){const k=image.height/image.width/p.ratio;sheet.scale.y=k;frame.scale.y=(height*k+.1)/(height+.1)}})}catch(e){}
      return g}
    // The hearth against the north wall, as in Klein's photograph: a box of planks filled with stones and ash, the turf
    // fire on it, and the kettle hung from a wooden arm.
    function buildHearth(x,wallZ,wood){
      const g=new THREE.Group();g.position.set(x,0,wallZ+.7);root.add(g);const fireCard=card('hearth');
      for(const part of [box(1.3,.45,.9,wood,0,.225,0,g),box(1.2,.04,.8,std({color:0x5a5650,roughness:1}),0,.47,0,g)])mark(part,fireCard);
      const embers=mark(box(.6,.06,.45,std({color:0x2a0e06,emissive:0xc8360c,emissiveIntensity:.8,roughness:.9}),0,.52,.05,g),fireCard);
      // Peats laid on the embers, dark, glowing only at their edges.
      const peat=std({color:0x2a1c12,emissive:0x6a1e08,emissiveIntensity:.35,roughness:1});
      for(const [tx,tz,ry] of [[-.16,-.08,.3],[.14,.1,-.5],[0,-.14,1.2],[-.04,.14,.9]]){const p=mark(box(.2,.07,.1,peat,tx,.58,tz,g),fireCard);p.rotation.y=ry}
      const post=box(.12,2.3,.12,wood,.75,1.15,-.35,g),arm=box(1.0,.1,.1,wood,.3,2.0,-.35,g);
      const chain=box(.02,1.0,.02,std({color:0x1a1714,metalness:.4,roughness:.6}),-.05,1.5,-.35,g);
      const kettle=add(own(new THREE.SphereGeometry(.18,12,8)),std({color:0x1a1714,roughness:.5,metalness:.4}),-.05,.92,-.3,g);kettle.scale.set(1,.85,1);
      for(const part of [post,arm,chain,kettle])mark(part,fireCard);
      root.userData.embers=embers;block(x,wallZ+.7,1.6,1.2);
      // A stool by the fire, and the knitting left on it.
      const stool=new THREE.Group();stool.position.set(x+1.3,0,wallZ+1.3);root.add(stool);box(.4,.05,.4,wood,0,.42,0,stool);for(const [lx,lz] of [[-.15,-.15],[.15,-.15],[0,.15]])box(.04,.42,.04,wood,lx,.21,lz,stool);
      mark(add(own(new THREE.SphereGeometry(.08,8,6)),std({color:0xd8d0bc,roughness:1}),.05,.5,0,stool),card('roykstova'));block(x+1.3,wallZ+1.3,.45,.45);
    }
    // The table with the bottle home, and two chairs that are the library's seats.
    function buildTable(x,z,wood){
      const g=new THREE.Group();g.position.set(x,0,z);root.add(g);
      box(1.5,.05,.85,wood,0,.76,0,g);for(const [lx,lz] of [[-.66,-.36],[.66,-.36],[-.66,.36],[.66,.36]])box(.06,.75,.06,wood,lx,.375,lz,g);
      add(own(new THREE.CylinderGeometry(.06,.05,.12,12)),std({color:0xd8d0bc,roughness:1}),-.5,.84,-.1,g);
      const glass=std({color:0xd9efe6,transparent:true,opacity:.22,roughness:.05,metalness:.1,depthWrite:false}),exit={type:'faroe-exit',title:'Back to the Long Corridor',author:'Into the bottle, and out again on the shelf in the Long Corridor, towards the Grand Hall.',action:'RETURN'};
      const b=new THREE.Group();b.position.set(.3,.88,0);g.add(b);const body=add(own(new THREE.CylinderGeometry(.085,.085,.38,18,1,true)),glass,0,0,0,b);body.rotation.z=Math.PI/2;
      const neck=add(own(new THREE.CylinderGeometry(.028,.032,.12,10,1,true)),glass,-.25,0,0,b);neck.rotation.z=Math.PI/2;add(own(new THREE.CylinderGeometry(.026,.022,.05,10)),std({color:0x9a7448,roughness:.9}),-.33,0,0,b).rotation.z=Math.PI/2;
      const hull=box(.12,.022,.035,std({color:0x3b2414,roughness:.6}),-.04,-.03,0,b);box(.003,.1,.003,std({color:0x5a3a1e}),-.04,.02,0,b);add(own(new THREE.PlaneGeometry(.05,.05)),std({color:0xf1e9d4,side:THREE.DoubleSide}),-.04,.02,.003,b);
      box(.4,.03,.12,wood,0,-.1,0,b);
      const plateTex=own(canvasTexture((c,W,H)=>{c.fillStyle='#caa15a';c.fillRect(0,0,W,H);c.strokeStyle='#6b4d22';c.lineWidth=4;c.strokeRect(5,5,W-10,H-10);c.fillStyle='#2b1d0e';c.textAlign='center';
        c.font='bold 26px Georgia';c.fillText('THE LONG CORRIDOR',W/2,40);c.font='italic 18px Georgia';c.fillText('towards the Grand Hall',W/2,68)},400,86));
      const label=add(own(new THREE.PlaneGeometry(.34,.075)),std({map:plateTex,roughness:.5,metalness:.3}),0,-.1,.065,b);
      const signTex=own(canvasTexture((c,W,H)=>{c.fillStyle='#c9a057';c.fillRect(0,0,W,H);c.strokeStyle='#6b4d22';c.lineWidth=6;c.strokeRect(8,8,W-16,H-16);c.fillStyle='#2b1d0e';c.textAlign='center';
        c.font='bold 40px Georgia';c.fillText('THE WAY HOME',W/2,66);c.font='italic 32px Georgia';c.fillText('look into the bottle',W/2,112);c.font='bold 28px Georgia';c.fillText('THE LONG CORRIDOR',W/2,150)},420,180));
      const signMat=std({map:signTex,roughness:.45,metalness:.35}),brassMat=std({color:0xb08d3a,metalness:.6,roughness:.4}),signParts=[];
      for(const side of [1,-1]){const face=add(own(new THREE.PlaneGeometry(.36,.155)),signMat,0,.12,-.13+side*.004,b);if(side<0)face.rotation.y=Math.PI;signParts.push(face)}
      signParts.push(box(.37,.165,.006,brassMat,0,.12,-.13,b),box(.012,.14,.012,brassMat,0,-.03,-.13,b),box(.09,.012,.05,brassMat,0,-.1,-.13,b));
      for(const part of [body,neck,hull,label,...signParts])mark(part,exit);
      block(x,z,1.7,1.05);
      for(const side of [-1,1]){const chair=new THREE.Group();chair.position.set(x+side*1.1,0,z);chair.rotation.y=side*Math.PI/2;root.add(chair);
        const parts=[box(.44,.04,.42,wood,0,.46,0,chair),box(.44,.55,.035,wood,0,.8,.2,chair)];for(const [lx,lz] of [[-.19,-.18],[.19,-.18],[-.19,.18],[.19,.18]])box(.035,.46,.035,wood,lx,.23,lz,chair);
        block(x+side*1.1,z,.5,.5);registerSeat?.(parts,chair,new THREE.Vector3(0,1.18,-.05),side*Math.PI/2,{title:'A chair at the table',author:'Sit in the roykstova and read one of the islands’ books.',bookIds:books.map(b=>b.userData.book.id)});for(const part of parts)ours.push(part)}
    }
    // The sea chest in the north-west corner, painted, with its key in the lock. Its lid is a group of its own, hinged at
    // the back, so that it can be opened.
    function buildChest(wood){
      chest=new THREE.Group();chest.position.set(CHEST.x,0,CHEST.z);root.add(chest);const paint=std({color:0x3c5a78,roughness:.8}),data={type:'faroe-chest',title:CARDS.chest[0],author:CARDS.chest[1],action:'OPEN'};
      mark(box(1.0,.48,.5,paint,0,.24,0,chest),data);for(const bx of [-.42,.42])box(.05,.5,.52,wood,bx,.25,0,chest);
      lid=new THREE.Group();lid.position.set(0,.48,-.25);chest.add(lid);mark(box(1.02,.06,.52,paint,0,.03,.26,lid),data);
      const iron=std({color:0x1a1714,metalness:.5,roughness:.5});mark(box(.1,.12,.02,iron,0,.38,.26,chest),data);mark(box(.02,.06,.04,MAT.brass||iron,0,.36,.29,chest),data);
      block(CHEST.x,CHEST.z,1.1,.6)}
    // The yard: flagstones, a drystone wall along its south edge with turf on top, the hjallur at its west end, a bench
    // facing the fjord, and the flag at the east end.
    function buildYard(wood,stone,turf){
      const {cx}=ROOM,wallData=card('yard');
      for(const part of [box(ROOM.w+1,.85,.4,stone,cx,.425,zy-.2,root),box(ROOM.w+1,.12,.44,turf,cx,.91,zy-.2,root)])mark(part,wallData);
      const hj=new THREE.Group();hj.position.set(x0+.4,0,z1+1.6);root.add(hj);const slat=std({color:0x6a5a48,roughness:.95}),hData=card('hjallur');
      for(let i=0;i<7;i++){mark(box(.06,2.0,1.4,slat,-.55+i*.18,1.0,0,hj),hData)}box(1.3,.08,1.6,std({color:0x2a2420,roughness:.9}),0,2.05,0,hj);block(x0+.4,z1+1.6,1.3,1.5);
      const bench=new THREE.Group();bench.position.set(cx+1.6,0,zy-.75);bench.rotation.y=Math.PI;root.add(bench);
      const parts=[box(1.2,.06,.4,wood,0,.44,0,bench)];for(const lx of [-.5,.5])box(.08,.44,.36,wood,lx,.22,0,bench);
      block(cx+1.6,zy-.75,1.3,.5);registerSeat?.(parts,bench,new THREE.Vector3(0,1.18,-.05),Math.PI,{title:CARDS.bench[0],author:CARDS.bench[1],bookIds:books.map(b=>b.userData.book.id)});for(const part of parts)ours.push(part);
      const pole=box(.07,4.2,.07,std({color:0xeeeae0,roughness:.7}),x1+.1,2.1,zy-.6,root);mark(pole,card('flag'));block(x1+.1,zy-.6,.3,.3);
      const flagTex=own(canvasTexture((c,W,H)=>{c.fillStyle='#ffffff';c.fillRect(0,0,W,H);const u=H/16;c.fillStyle='#0065bd';c.fillRect(W*7/22-u*3,0,u*6,H);c.fillRect(0,H/2-u*3,W,u*6);c.fillStyle='#ef303e';c.fillRect(W*7/22-u*2,0,u*4,H);c.fillRect(0,H/2-u*2,W,u*4)},220,160));
      const f=add(own(new THREE.PlaneGeometry(1.1,.8)),std({map:flagTex,side:THREE.DoubleSide,roughness:.9}),x1+.1-.58,3.75,zy-.6,root);mark(f,card('flag'));
      // Two signs on the inside face of the yard wall, facing the house.
      for(const [text,sub,x,key] of [['KIRKJUBØUR','A light night at midsummer',cx-1.6,'night'],['ST MAGNUS','The cathedral that was never finished',cx+.0,'kirkjubour']]){const s=sign(root,text,sub,1.5,.26,x,.6,zy-.41);s.rotation.y=Math.PI;mark(s,card(key))}
    }
    // The view: south over the infield to the fjord, with Hestur and Koltur across it to the west and Sandoy far off to
    // the south; the roofless walls of the cathedral on the shore to the east, St Olaf's church beside them; the steep
    // green hillside behind. The sky is pale all round, palest in the north where the sun is just below the hills. The seal
    // waits in the fjord, hidden until she is seen.
    function buildView(){
      const {cx}=ROOM;
      const pano=own(canvasTexture((c,W,H)=>{c.translate(W,0);c.scale(-1,1);// seen from inside: drawn mirrored. North at 0 and W, east at W/4, south at W/2, west at 3W/4.
        let k=61;const r=()=>(k=(k*9301+49297)%233280)/233280,hz=H*HORIZON;
        const sky=c.createLinearGradient(0,0,0,hz);sky.addColorStop(0,'#2c3660');sky.addColorStop(.55,'#6c7598');sky.addColorStop(1,'#c9b2a6');c.fillStyle=sky;c.fillRect(0,0,W,H);
        for(const nx of [0,W]){const glow=c.createRadialGradient(nx,hz,4,nx,hz,W*.16);glow.addColorStop(0,'rgba(240,190,150,.8)');glow.addColorStop(1,'rgba(255,200,160,0)');c.fillStyle=glow;c.fillRect(0,0,W,hz)}
        // Low cloud lying along the tops.
        c.fillStyle='rgba(230,232,240,.35)';for(let i=0;i<18;i++){c.beginPath();c.ellipse(W*r(),hz-H*(.08+r()*.1),W*(.03+r()*.05),H*.02,0,0,7);c.fill()}
        // The fjord, from east round through south to west.
        const sea=c.createLinearGradient(0,hz,0,H);sea.addColorStop(0,'#7a849c');sea.addColorStop(1,'#2a3446');c.fillStyle=sea;c.fillRect(W*.2,hz,W*.65,H-hz);
        // Sandoy, long and low, far to the south; Hestur, steep, across the fjord to the south-west; Koltur, a green hump
        // with a high head, to the west.
        const isle=(a,b,top,color,sharp=.3)=>{c.fillStyle=color;c.beginPath();c.moveTo(W*a,hz+2);for(let t=0;t<=1.0001;t+=.02){const x=a+(b-a)*t,rise=Math.min(1,Math.min(t,1-t)/sharp)**.7;c.lineTo(W*x,hz-H*top*rise*(.9+.08*Math.sin(t*19)+.05*Math.sin(t*7)))}c.lineTo(W*b,hz+2);c.fill()};
        isle(.4,.5,.05,'#4c5670',.4);isle(.53,.64,.16,'#34483c',.2);isle(.67,.73,.13,'#3a4e40',.3);
        // Their cliffs, dark bands at the foot of each.
        c.fillStyle='rgba(20,22,24,.55)';c.fillRect(W*.53,hz-H*.03,W*.11,H*.03);c.fillRect(W*.67,hz-H*.025,W*.06,H*.025);
        // The hillside behind the house, north round to east and west: steep green slopes with bands of rock.
        const land=(from,to,top,color)=>{c.fillStyle=color;c.beginPath();c.moveTo(W*from,H);for(let t=0;t<=1.0001;t+=.01){const x=from+(to-from)*t;c.lineTo(W*x,hz-H*top*Math.min(1,Math.min(t,1-t)*5)+H*.012*Math.sin(t*23))}c.lineTo(W*to,H);c.fill()};
        land(-.22,.24,.3,'#34502c');land(.84,1.22,.3,'#34502c');
        c.strokeStyle='rgba(60,56,50,.55)';c.lineWidth=3;for(const [a,b] of [[-.2,.22],[.86,1.2]])for(let j=1;j<4;j++){c.beginPath();for(let t=0;t<=1;t+=.02){const x=a+(b-a)*t,y=hz-H*.3*Math.min(1,Math.min(t,1-t)*5)*(1-j*.22);t?c.lineTo(W*x,y):c.moveTo(W*x,y)}c.stroke()}
        // The infield, near, with sheep, and the shore below it.
        c.fillStyle='#4a6e38';c.beginPath();c.moveTo(0,H);for(let x=0;x<=W;x+=16)c.lineTo(x,H*(.78+.02*Math.sin(x/W*Math.PI*2*4)));c.lineTo(W,H);c.fill();
        for(let i=0;i<30;i++){const x=W*r(),y=H*(.8+r()*.15);c.fillStyle='#e8e2d4';c.beginPath();c.ellipse(x,y,7,4.5,0,0,7);c.fill();c.fillStyle='#2a2420';c.fillRect(x+5,y-3,3,3)}
        // The cathedral's roofless walls on the shore to the south-east, with their pointed windows; St Olaf's church, white
        // with a black roof, beside them.
        const mx=W*.33,my=hz+H*.07;c.fillStyle='#6a665e';c.fillRect(mx-W*.014,my-H*.07,W*.028,H*.07);c.beginPath();c.moveTo(mx-W*.014,my-H*.07);c.lineTo(mx-W*.014,my-H*.1);c.lineTo(mx-W*.009,my-H*.07);c.fill();
        c.fillStyle='#3a3832';for(let i=0;i<4;i++){const wx=mx-W*.011+i*W*.0062;c.beginPath();c.moveTo(wx,my-H*.015);c.lineTo(wx,my-H*.045);c.lineTo(wx+W*.0018,my-H*.055);c.lineTo(wx+W*.0036,my-H*.045);c.lineTo(wx+W*.0036,my-H*.015);c.fill()}
        const ox=W*.3,oy=hz+H*.08;c.fillStyle='#e6e2d8';c.fillRect(ox-W*.01,oy-H*.04,W*.02,H*.04);c.fillStyle='#1e1e20';c.beginPath();c.moveTo(ox-W*.011,oy-H*.04);c.lineTo(ox,oy-H*.062);c.lineTo(ox+W*.011,oy-H*.04);c.fill();
        // The farmhouse's neighbours: tarred houses with grass roofs, along the shore.
        for(let i=0;i<5;i++){const x=W*(.24+r()*.1),y=hz+H*(.1+r()*.04),s=10+r()*8;c.fillStyle='#2a2622';c.fillRect(x,y,s*2,s);c.fillStyle='#4f6e34';c.fillRect(x-3,y-5,s*2+6,6)}},4096,512));
      const g=new THREE.Group();g.position.set(cx,0,z1);root.add(g);
      const ring=add(own(new THREE.CylinderGeometry(R,R,PANO,64,1,true,-Math.PI,Math.PI*2)),own(new THREE.MeshBasicMaterial({map:pano,side:THREE.BackSide,fog:false})),0,EYE+PANO*(HORIZON-.5),0,g);ring.raycast=()=>{};
      const domeTex=own(canvasTexture((c,W,H)=>{const gr=c.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#222a4c');gr.addColorStop(1,'#2c3660');c.fillStyle=gr;c.fillRect(0,0,W,H)},64,64));
      const dome=add(own(new THREE.SphereGeometry(R+.5,32,12,0,Math.PI*2,0,Math.PI/2)),own(new THREE.MeshBasicMaterial({map:domeTex,side:THREE.BackSide,fog:false})),0,EYE+PANO*HORIZON-.4,0,g);dome.raycast=()=>{};
      const under=add(own(new THREE.CircleGeometry(R-.2,48)),own(new THREE.MeshBasicMaterial({color:0x4a6a3a,fog:false})),0,EYE+PANO*(HORIZON-.5)-PANO/2+.05,0,g);under.rotation.x=-Math.PI/2;under.raycast=()=>{};
      // The seal, her head above the water in the fjord, facing the house.
      const a=-.25,sealTex=own(canvasTexture((c,W,H)=>{c.clearRect(0,0,W,H);c.fillStyle='rgba(220,226,236,.5)';c.beginPath();c.ellipse(W*.5,H*.82,W*.4,H*.08,0,0,7);c.fill();
        c.fillStyle='#3a3a3c';c.beginPath();c.ellipse(W*.5,H*.7,W*.16,H*.12,0,0,7);c.fill();c.beginPath();c.ellipse(W*.5,H*.45,W*.13,H*.2,0,0,7);c.fill();
        c.fillStyle='#111';c.beginPath();c.arc(W*.45,H*.4,W*.022,0,7);c.arc(W*.55,H*.4,W*.022,0,7);c.fill();c.fillStyle='#1a1a1a';c.beginPath();c.ellipse(W*.5,H*.52,W*.03,H*.02,0,0,7);c.fill()},128,128));
      seal=add(own(new THREE.PlaneGeometry(1.6,1.6)),own(new THREE.MeshBasicMaterial({map:sealTex,transparent:true,opacity:0,depthWrite:false,fog:false})),Math.sin(a)*(R-3),EYE-1.3,Math.cos(a)*(R-3),g);
      seal.rotation.y=a+Math.PI;seal.raycast=()=>{};seal.visible=false;
    }
    function leaveBook(){
      const book=catalogue().secret[0];if(!book||chestBook||!chest)return;
      chestBook=placeBook(book,{x:.15,y:.6,z:0,yaw:.3,tilt:-Math.PI/2},own(new THREE.BoxGeometry(.62,.86,.12)),'secret',chest)}

    // ---------- walking ----------
    function contains(x,z){return x>x0-.6&&x<x1+.6&&z>z0&&z<zy+.2}
    function floorAt(x,z){return contains(x,z)?0:null}
    function allowed(x,z){
      if(!contains(x,z))return false;const rad=player.radius||.42;
      if(z>z1-.35&&z<z1+.35)return Math.abs(x-DOOR.x)<DOOR.w/2-.3;
      if(z>z1){if(x-rad<x0-.4||x+rad>x1+.4||z+rad>zy-.4)return false}
      else if(x-rad<x0+.2||x+rad>x1-.2||z-rad<z0+.2)return false;
      return !blockers.some(b=>x+rad>b.minX&&x-rad<b.maxX&&z+rad>b.minZ&&z-rad<b.maxZ)}

    // ---------- doing things ----------
    function enter(){
      activate();move(ROOM.cx,ROOM.cz+1.6,0);playSample?.('pageTurn',.35,.6);
      showNotice('The Faroe Islands, on a light night at midsummer: the roykstova of an old farmhouse at Kirkjubøur, its turf fire low, its door open on the yard and the fjord. The bottle you came through is on the table, to take you back.',14);
      analytics?.track('Room Explored',{room:'faroe'})}
    function leave(){const p=bottles?.standBefore?.('faroe')||{x:1701,z:-2,yaw:-Math.PI/2};move(p.x,p.z,p.yaw);playSample?.('pageTurn',.35,.6);showNotice('The Long Corridor again, and the bottle back on its shelf.',4)}
    function openChest(){
      lidOpen=2.5;if(seal){seal.visible=true;sealShow=9}playSample?.('pageTurn',.3,.5);
      if(!wasFound()){try{storage?.setItem(FOUND_KEY,'1')}catch(e){}leaveBook();analytics?.track('Secret Found',{room:'faroe',secret:'seal-woman'});showNotice(`${CARDS.secret[0]}. ${CARDS.secret[1]}`,20);return}
      showNotice('The chest is empty. Out in the fjord, for a moment, a seal looks back at the house.',8)}
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('faroe-'))return false;
      if(data.type==='faroe-exit'){leave();return true}
      if(data.type==='faroe-chest'){openChest();return true}
      if(data.type==='faroe-picture'){const p=PICTURES[data.picture];if(showPicture)showPicture({kicker:'THE FAROE ISLANDS',title:p.title,src:`${pictures}${p.file}.jpg`,caption:data.author,credit:p.credit});else showNotice(`${p.title}: ${data.author}`,12);return true}
      if(data.type==='faroe-card'){showNotice(`${data.title}: ${data.author}`,data.author.length>320?18:data.author.length>160?13:9);return true}
      return false}

    // ---------- lifecycle ----------
    function activate(){if(!root)build();lastNeeded=time}
    function unload(){
      if(!root)return;root.removeFromParent();root.traverse(object=>{if(object.isLight)object.userData.freed=true});root=null;chest=null;lid=null;chestBook=null;fire=null;seal=null;sealShow=0;lidOpen=0;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0}
    function update(t){
      // Built ahead while the reader stands by the bottles' shelf, so that looking in does not wait.
      const dt=Math.min(.1,Math.max(0,t-time));time=t;const inside=contains(player.pos.x,player.pos.z),bay=bottles?.bay,near=!!bay&&Math.hypot(player.pos.x-bay.x,player.pos.z-bay.z)<3.2;
      if(inside||near&&(root||window.libraryMayBuild?.()!==false))activate();
      else if(root&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==b.userData.home.parent))unload();
      if(!inside||!root)return;
      // The turf fire breathes.
      if(fire)fire.intensity=.85+.15*Math.sin(t*5.3)*Math.sin(t*2.1);const embers=root.userData.embers;if(embers)embers.material.emissiveIntensity=.7+.2*Math.sin(t*4.7)*Math.sin(t*1.9);
      // The lid: up while the chest is open, down again after.
      if(lid){lidOpen=Math.max(0,lidOpen-dt);const target=lidOpen>0?-1.2:0;lid.rotation.x+=(target-lid.rotation.x)*Math.min(1,dt*4)}
      if(seal&&sealShow>0){sealShow-=dt;seal.material.opacity=Math.min(1,sealShow>7?(9-sealShow)/2:sealShow/2.5);if(sealShow<=0)seal.visible=false}}
    return {contains,floorAt,allowed,interact,update,enter,leave,activate,unload,catalogue,room:ROOM,yard:YARD,door:DOOR,chestAt:CHEST,groups:GROUPS,own:OWN,quotes:QUOTES,sources:SOURCES,cards:CARDS,pictures:PICTURES,
      get built(){return !!root},get books(){return books.slice()},get found(){return wasFound()},get sealShowing(){return !!seal?.visible},zoneAt:(x,z)=>contains(x,z)?'faroe':null};
  };
})();
