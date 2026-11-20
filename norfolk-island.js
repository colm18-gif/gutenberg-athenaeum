// Norfolk Island: a room in one of the Georgian houses the convicts built at Kingston, on an evening late in autumn, and
// its verandah, reached through the fifth ship in a bottle on the Long Corridor's shelf (ships-in-bottles.js, handed
// `bottles`). The island was settled in 1788, a few weeks after the First Fleet reached Sydney; its second settlement, from
// 1825 to 1855, was a prison for the worst offenders of the colonies; and in 1856 the people of Pitcairn Island, the
// descendants of the Bounty's mutineers and the Tahitians who came with them, were brought here, and were given the
// convicts' buildings. The room has the island's books, its pictures and the bottle home; the verandah looks south over the
// lawns of Kingston and the Norfolk pines to Slaughter Bay and its reef, where the Sirius was lost in 1790, and out to
// Nepean and Phillip Islands, all painted inside a ring. Two lights: the low sun, and the lamp.
//
// The cards keep to what is attested: Cook's landfall in October 1774; Philip Gidley King's settlement of 6 March 1788;
// the wreck of the Sirius on 19 March 1790; the second settlement; the Morayshire's arrival with the Pitcairners on 8 June
// 1856, still kept as Bounty Day; the convict buildings now a World Heritage site. Every quotation (`QUOTES`) is checked
// against the library's own texts by a test: Hunter, the Sirius's captain; King's journal with his; the chaplain Johnson;
// Rosalind Young of Pitcairn; and Clarke's novel, whose chaplain lands at Kingston.
//
// The secret is the reef. The tide goes out and comes in, and at low water the reef off Slaughter Bay lies bare; look at
// it then, and the Sirius is there, as George Raper painted her. Tench's Complete Account, in which the
// news of her loss reaches Sydney, is then on the verandah's table (shelf `norfolk-sirius`), found for good
// (athenaeum-norfolk-sirius; ?sirius).
(function(){
  'use strict';

  // The library's own books: the Pitcairners' story (Rosalind Young of Pitcairn, Barrow, Bligh), and Clarke's novel of
  // the convict system, whose last part is set at Kingston.
  const OWN={pitcairners:[69363,14424,20337],first:[3424]};
  const GROUPS=[
    {key:'pitcairners',name:'FROM PITCAIRN, 1856',sub:'The Bounty, and the people who came of it',wall:'west',max:6,ids:OWN.pitcairners},
    {key:'first',name:'THE SETTLEMENTS',sub:'1788, and the convicts',wall:'east',max:6,ids:OWN.first}
  ];
  // Their own words, from the library's texts, checked by a test (letters alone).
  const QUOTES={
    struck:'she struck upon a reef of coral rocks which lies parallel to the shore, and in a few strokes was bulged',
    masts:'I ordered the masts to be cut away',
    surf:'so continually does the surf break all round it',
    news:'we learned, that the Sirius had been wrecked on Norfolk Island',
    saved:'Happily, however, Captain Hunter, and every other person belonging to her, were saved.',
    unhappy:'and especially to the unhappy prisoners and convicts',
    arrived:'On the 8th of June, 1856, the Morayshire arrived at Norfolk Island',
    rock:'Utterly lonely and desolate, the little rock stood in the vast ocean as it slowly receded from view',
    penal:'Norfolk Island, once a penal settlement',
    pine:'the Norfolk Island pine, which rears its stately head a hundred feet above the surrounding forest',
    banishment:'A solitary rock in the tropical ocean, the island seems, indeed, a fit place of banishment.',
    wild:'The appearance of the place is very wild and beautiful'
  };
  const SOURCES={struck:15662,masts:15662,surf:15662,news:3534,saved:3534,unhappy:4052,arrived:69363,rock:69363,penal:69363,pine:3424,banishment:3424,wild:3424};
  const q=key=>`“${QUOTES[key]}”`;
  const CARDS={
    sign:['Norfolk Island','A green island of about thirty-five square kilometres in the south-western Pacific, some fourteen hundred kilometres east of Australia. About two thousand people live there, many of them descended from the Bounty’s mutineers and the Tahitians who came with them to Pitcairn, and they have a language of their own, Norf’k. It is an external territory of Australia.'],
    cook:['1774','Cook came on the island in October 1774, on his second voyage, and found it uninhabited, though Polynesian voyagers had lived there centuries before. He named it for the Duchess of Norfolk, and reported its tall pines and its flax, which the navy wanted for masts and sails.'],
    first:['6 March 1788','A few weeks after the First Fleet reached Sydney, Lieutenant Philip Gidley King landed on Norfolk Island on 6 March 1788 with a small party of free men and convicts to settle it, as the colony’s first offshoot. It never had a harbour: ships lay off, and boats went in through the surf, '+'and Hunter wrote of the island, '+`${q('surf')}. The first settlement was given up in 1814.`],
    sirius:['The Sirius',`HMS Sirius, flagship of the First Fleet, was wrecked here on 19 March 1790, landing people and stores in Sydney Bay, the bay below this verandah: ${q('struck')}, her captain, John Hunter, wrote. ${q('masts')}. All were got ashore along a rope through the surf, and stranded on the island for most of a year. In Sydney, Tench wrote, ${q('news')}. ${q('saved')}`],
    second:['The second settlement','From 1825 to 1855 Norfolk Island was a prison for convicts already convicted again in the colonies: a place of hard labour and harsh punishment, meant to be feared. Most of the stone buildings of Kingston are from these years. In Marcus Clarke’s novel, its chaplain lands here: '+`${q('banishment')} ${q('wild')}.`],
    pitcairners:['8 June 1856',`By the 1850s Pitcairn could no longer hold its people, and the British government offered them Norfolk Island, ${q('penal')}, Rosalind Young of Pitcairn wrote. The whole community, nearly two hundred people, sailed in the Morayshire. Leaving, ${q('rock')}. ${q('arrived')}. They were given the convicts’ houses at first. Some went home to Pitcairn in 1858 and 1864; most stayed. The day is still kept every year as Bounty Day.`],
    kingston:['Kingston','The settlement on the south coast: the Georgian houses of Quality Row, built by convicts for the officers, the barracks, the gaol, the commissariat store, and the pier. Since 2010 it has been a World Heritage site, one of the Australian Convict Sites.'],
    pine:['The Norfolk Island pine',`A tall, level-branched tree found growing wild nowhere else, now planted on coasts all over the world. In Clarke’s novel, ${q('pine')}.`],
    johnson:['The chaplain',`Richard Johnson, chaplain to the colony, wrote an address in 1792 to all the people of Port Jackson and Norfolk Island, ${q('unhappy')}.`],
    verandah:['The verandah','It looks south over the lawns of Kingston and the pines to Slaughter Bay, its reef, and Nepean and Phillip Islands beyond. At low water the reef comes out of the sea.'],
    reef:['The reef','The reef off Slaughter Bay, where the Sirius struck in 1790. The tide comes and goes over it.'],
    sirius_picture:['The loss of the Sirius','George Raper, a midshipman of the Sirius, painted her on the reef where she was lost, off Norfolk Island, on 19 March 1790.'],
    convicts:['The convict establishment, 1848','Kingston in the years of the second settlement: the prisoners’ barracks, the walls and the buildings along the shore.'],
    government:['Government House','The commandant’s house on the rise above Kingston, painted by James Glen Wilson in about 1855, the year before the Pitcairners came.'],
    kingston_photo:['Kingston, 1898','Kingston forty years after the Pitcairners came, from a glass-plate photograph.'],
    beach:['The beach, 1898','The beach at Kingston, from a glass-plate photograph of 1898.'],
    gaol:['The old gaol, 1898','The ruins of the gaol at Kingston, from a glass-plate photograph of 1898.'],
    shelf_pitcairners:['From Pitcairn',`The Pitcairners brought their story with them: Rosalind Young’s history, written by one of them; Barrow’s account of the mutiny; Bligh’s own. ${q('arrived')}.`],
    shelf_first:['The settlements',`Hunter’s journal, with King’s of the first years on the island; the chaplain’s address; and Clarke’s novel of the convict system, which ends here.`],
    secret:['The Sirius on the reef',`The tide is out, and for a moment she is there on the reef as Raper painted her, her masts gone: ${q('struck')}. In Sydney, weeks later, Tench heard the news. Someone has left his Complete Account on the verandah table.`]
  };
  const PICTURES={
    sirius:{file:'norfolk-sirius',title:'The melancholy loss of HMS Sirius, 19 March 1790',credit:'George Raper, 1790. National Library of Australia. Public domain, from Wikimedia Commons.',ratio:.79,card:'sirius_picture'},
    convicts:{file:'norfolk-convicts',title:'The convict establishment, Norfolk Island, 1848',credit:'1848. Public domain, from Wikimedia Commons.',ratio:.73,card:'convicts'},
    government:{file:'norfolk-government',title:'Government House, Norfolk Island',credit:'James Glen Wilson, about 1855. Libraries Tasmania. Public domain, from Wikimedia Commons.',ratio:.64,card:'government'},
    kingston:{file:'norfolk-kingston',title:'Kingston, Norfolk Island, 1898',credit:'Tyrrell Collection, Powerhouse Museum, 1898. Public domain, from Wikimedia Commons.',ratio:.77,card:'kingston_photo'},
    beach:{file:'norfolk-beach',title:'The beach, Kingston, 1898',credit:'Tyrrell Collection, Powerhouse Museum, 1898. Public domain, from Wikimedia Commons.',ratio:.76,card:'beach'},
    gaol:{file:'norfolk-gaol',title:'The old gaol, Kingston, 1898',credit:'Tyrrell Collection, Powerhouse Museum, 1898. Public domain, from Wikimedia Commons.',ratio:.77,card:'gaol'}
  };
  const FOUND_KEY='athenaeum-norfolk-sirius';
  // The tide: a full turn a minute and a half, low water for a third of it.
  const TIDE=90;

  window.createNorfolkIsland=function(options){
    const {placeVisitorsBook=null,THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,arrivals={},showNotice,playSample,move,analytics,isHolding=()=>false,registerSeat=null,
      bottles=null,showPicture=null,storage=null,search='',pictures='assets/pictures/'}=options;
    // The room (its south wall open on the verandah) and the verandah south of it.
    const ROOM={cx:2600,cz:1800,w:8,d:5,h:3.2},VER=3.2;
    const x0=ROOM.cx-ROOM.w/2,x1=ROOM.cx+ROOM.w/2,z0=ROOM.cz-ROOM.d/2,z1=ROOM.cz+ROOM.d/2,zv=z1+VER;
    const DOOR={x:ROOM.cx,w:2.2},KEEP=25,R=26,EYE=1.72,HORIZON=.6,PANO=26;
    const wasFound=()=>{try{return storage?.getItem(FOUND_KEY)==='1'||/[?&](sirius|reef)\b/.test(search)}catch(e){return false}};
    let root=null,time=0,lastNeeded=-1e9,table=null,tableBook=null,lamp=null,water=null,ship=null,shipShow=0;
    const owned=[],ours=[],books=[],blockers=[];
    const own=thing=>{owned.push(thing);return thing};
    const std=params=>own(new THREE.MeshStandardMaterial(params));
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const card=key=>({type:'norfolk-card',key,title:CARDS[key][0],author:CARDS[key][1],action:'READ'});
    function sign(parent,text,sub,w,h,x,y,z){
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle='#ecebe2';c.fillRect(0,0,W,H);c.strokeStyle='#2c4a5a';c.lineWidth=3;c.strokeRect(7,7,W-14,H-14);
        c.fillStyle='#1c2630';c.textAlign='center';c.font='bold 27px Georgia';c.fillText(text,W/2,sub?50:H/2+10);if(sub){c.font='italic 19px Georgia';c.fillText(sub,W/2,82)}},620,sub?104:70));
      return add(own(new THREE.PlaneGeometry(w,h)),std({map,emissive:0x2a3036,emissiveIntensity:.25,roughness:.9}),x,y,z,parent)}
    const shelfBooks=(ids,key,max)=>[...new Set([...ids,...(arrivals[key]||[])])].map(id=>findBook(id)).filter(Boolean).slice(0,max);
    function catalogue(){return {groups:GROUPS.map(group=>({...group,books:shelfBooks(group.ids,group.key,group.max)})),secret:(arrivals.sirius||[]).map(id=>findBook(id)).filter(Boolean)}}
    // Low water: the middle third of each turn of the tide.
    const tideLow=(t=time)=>{const f=((t%TIDE)+TIDE)%TIDE/TIDE;return f>.33&&f<.67};

    // ---------- the bottle on the corridor's shelf: a ship for a green island with tall pines ----------
    bottles?.add({key:'norfolk',title:'Norfolk Island',label:'NORFOLK ISLAND',author:'A ship under sail for a low green island with a line of tall pines along it, and two islets off its shore.',
      island:[[.08,.06,.03],[.13,.02,.02],[.05,.02,.06]],land:0x3e6a3a,enter});

    // ---------- the room and the verandah ----------
    function build(){
      root=new THREE.Group();root.name='norfolk';const {cx,cz,w,d,h}=ROOM;
      let k=23;const r=()=>(k=(k*9301+49297)%233280)/233280;
      const stoneTex=own(canvasTexture((c,W,H)=>{c.fillStyle='#cbbf9e';c.fillRect(0,0,W,H);let y=0;while(y<H){const sh=30+r()*10;let x=-r()*40;while(x<W){const sw=50+r()*30,v=186+r()*26;c.fillStyle=`rgb(${v},${v-10},${v-34})`;c.fillRect(x+2,y+2,sw-4,sh-4);x+=sw}y+=sh}},256,256));
      stoneTex.wrapS=stoneTex.wrapT=THREE.RepeatWrapping;stoneTex.repeat?.set?.(3,1.2);
      const floorTex=own(canvasTexture((c,W,H)=>{c.fillStyle='#7a5a3a';c.fillRect(0,0,W,H);for(let x=0;x<W;x+=28){c.fillStyle=`rgba(${30+((x*7)%30)},20,10,.4)`;c.fillRect(x,0,2,H)}},256,256));
      floorTex.wrapS=floorTex.wrapT=THREE.RepeatWrapping;floorTex.repeat?.set?.(4,3);
      const stone=std({color:0xd8ccae,map:stoneTex,roughness:.95}),plaster=std({color:0xd6cfbc,roughness:.95}),floor=std({color:0x9a7a5a,map:floorTex,roughness:.85}),
        wood=MAT.darkWood||std({color:0x3a2416,roughness:.7}),white=std({color:0xeeeae0,roughness:.8}),roof=std({color:0x5a5e60,roughness:.8});
      // Floors: the room's boards, the verandah's flags, and grass below the rail.
      box(w,.3,d,floor,cx,-.149,cz,root);box(w+1,.3,VER,std({color:0x9a9488,roughness:.95}),cx,-.15,z1+VER/2,root);
      box(w+20,.3,20,std({color:0x5f8a46,roughness:1}),cx,-.5,zv+10,root);
      // Walls: north, west and east of stone, plastered inside; the south wall with a wide doorway onto the verandah and a
      // sash window either side.
      const T=.4;
      for(const [ww,hh,dd,x,z,ix,iz] of [[w+T,h,T,cx,z0,0,1],[T,h,d,x0,cz,1,0],[T,h,d,x1,cz,-1,0]]){box(ww,hh,dd,stone,x,hh/2,z,root);box(ix?.02:ww-T,hh,iz?.02:dd,plaster,x+ix*(T/2+.011),hh/2,z+iz*(T/2+.011),root)}
      const dl=DOOR.x-DOOR.w/2,dr=DOOR.x+DOOR.w/2,piece=(a,b,y0,y1)=>{box(b-a,y1-y0,T,stone,(a+b)/2,(y0+y1)/2,z1,root);box(b-a,y1-y0,.02,plaster,(a+b)/2,(y0+y1)/2,z1-T/2-.011,root)};
      piece(x0-T/2,dl,0,h);piece(dr,x1+T/2,0,h);piece(dl,dr,2.5,h);
      for(const wx of [cx-2.6,cx+2.6]){const glass=add(own(new THREE.PlaneGeometry(1.1,1.5)),own(new THREE.MeshBasicMaterial({color:0xd8dccf,transparent:true,opacity:.35,fog:false})),wx,1.55,z1-T/2-.02,root);glass.rotation.y=Math.PI;
        for(const fx of [-.56,0,.56])box(.05,1.6,.05,white,wx+fx,1.55,z1-T/2-.03,root);for(const fy of [.78,1.55,2.32])box(1.16,.05,.05,white,wx,fy,z1-T/2-.03,root)}
      box(w+.8,.2,d+.8,white,cx,h+.1,cz,root);for(const side of [-1,1]){const slope=box(w+1,.18,d/2+.8,roof,cx,h+.75,cz+side*(d/4+.2),root);slope.rotation.x=side*.55}
      // The verandah: posts, a roof, and a rail along its edge.
      for(const px of [x0-.3,cx-2,cx+2,x1+.3])box(.16,2.6,.16,white,px,1.3,zv-.12,root);box(w+1,.12,VER+.2,roof,cx,2.65,z1+VER/2,root);
      const railData=card('verandah');for(const part of [box(w+1,.06,.06,white,cx,1.0,zv-.12,root),box(w+1,.06,.06,white,cx,.55,zv-.12,root)])mark(part,railData);
      // Inside: the sign, the shelves on the side walls, the pictures, the table with the bottle home.
      mark(sign(root,'NORFOLK ISLAND','Kingston, a house on Quality Row',2.6,.42,cx,2.55,z0+.22),card('sign'));
      const {groups}=catalogue(),geometry=own(new THREE.BoxGeometry(.62,.86,.12)),ROWS=[1.05,1.95],length=3.6;
      for(const group of groups){
        const per=group.books.length>3?Math.ceil(group.books.length/2):Math.max(1,group.books.length),step=Math.min(1.0,(length-.3)/Math.max(1,per));
        const side=group.wall==='west'?1:-1,sx=group.wall==='west'?x0+.34:x1-.34,yaw=side*Math.PI/2;
        group.books.forEach((book,i)=>{const row=i<per?0:1,n=row?group.books.length-per:per,col=row?i-per:i,offset=(col-(n-1)/2)*step;placeBook(book,{x:sx,y:ROWS[row],z:cz+offset,yaw},geometry,group.key)});
        const rows=group.books.length>per?ROWS:ROWS.slice(0,1);for(const y of rows)box(.34,.05,length,wood,sx-side*.02,y-.46,cz,root);block(sx,cz,.7,length+.2);
        const label=sign(root,group.name,group.sub,2.2,.36,group.wall==='west'?x0+.22:x1-.22,rows.at(-1)+.66,cz);label.rotation.y=yaw;mark(label,card(`shelf_${group.key}`));
      }
      hang('sirius',cx-2.3,1.75,z0+.22,0,1.1);hang('government',cx+2.3,1.75,z0+.22,0,1.0);
      hang('convicts',x0+.22,2.65,cz-1.6,Math.PI/2,.62);hang('kingston',x0+.22,2.65,cz+1.6,Math.PI/2,.5);hang('beach',x1-.22,2.65,cz-1.6,-Math.PI/2,.5);hang('gaol',x1-.22,2.65,cz+1.6,-Math.PI/2,.5);
      const plate=(key,x,z,yaw)=>{const p=add(own(new THREE.PlaneGeometry(.42,.26)),std({color:0xb08d3a,metalness:.6,roughness:.4}),x,1.45,z,root);p.rotation.y=yaw;mark(p,card(key))};
      plate('cook',cx-1.15,z0+.22,0);plate('first',cx+1.15,z0+.22,0);plate('second',dl-.6,z1-.22,Math.PI);plate('kingston',dr+.6,z1-.22,Math.PI);
      buildTable(cx,cz-.3,wood);buildVerandah(wood,white);buildView();
      // The low sun in the west, and the lamp.
      const sun=new THREE.DirectionalLight(0xffd8a8,1.1);sun.position.set(cx-30,8,cz+16);sun.target.position.set(cx,0,cz+2);root.add(sun);root.add(sun.target);
      lamp=new THREE.PointLight(0xffd9a0,.8,9,2);lamp.position.set(cx,2.4,cz-.3);root.add(lamp);
      if(wasFound())leaveBook();
      placeVisitorsBook?.({parent:root,x:cx-2.4,z:cz+1.6,mark,own});
      scene.add(root);
    }
    function placeBook(book,spot,geometry,shelf,parent=root){
      const mesh=add(geometry,own(bookMaterial(book)),spot.x,spot.y,spot.z,parent);mesh.rotation.order='YXZ';mesh.rotation.y=spot.yaw||0;mesh.rotation.x=spot.tilt??-.08;
      mesh.userData={type:'book',book,loaded:false,norfolk:true,shelf,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent}};
      interactables.push(mesh);ours.push(mesh);books.push(mesh);return mesh}
    function hang(key,x,y,z,yaw,width){
      const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=yaw;root.add(g);const p=PICTURES[key],height=width*p.ratio;
      const data={type:'norfolk-picture',picture:key,title:p.title,author:CARDS[p.card][1],action:'LOOK CLOSELY'};
      const frame=mark(box(width+.1,height+.1,.04,MAT.darkWood||std({color:0x2c1c12,roughness:.6}),0,0,0,g),data);
      const mat=std({color:0x9a927f,roughness:.9}),sheet=mark(add(own(new THREE.PlaneGeometry(width,height)),mat,0,0,.025,g),data);
      try{new THREE.TextureLoader().load(`${pictures}${p.file}-wall.jpg`,texture=>{if(!root)return texture.dispose?.();texture.colorSpace=THREE.SRGBColorSpace;own(texture);mat.map=texture;mat.color?.set?.(0xd8d4c8);mat.needsUpdate=true;
        const image=texture.image;if(image?.width&&image?.height){const k=image.height/image.width/p.ratio;sheet.scale.y=k;frame.scale.y=(height*k+.1)/(height+.1)}})}catch(e){}
      return g}
    // The table with the lamp and the bottle home, and two chairs that are the library's seats.
    function buildTable(x,z,wood){
      const g=new THREE.Group();g.position.set(x,0,z);root.add(g);
      box(1.5,.05,.85,wood,0,.76,0,g);for(const [lx,lz] of [[-.66,-.36],[.66,-.36],[-.66,.36],[.66,.36]])box(.06,.75,.06,wood,lx,.375,lz,g);
      add(own(new THREE.CylinderGeometry(.06,.05,.18,12,1,true)),std({color:0xfff4d6,emissive:0xffc070,emissiveIntensity:1.3,transparent:true,opacity:.8}),-.5,.88,-.1,g);
      const glass=std({color:0xd9efe6,transparent:true,opacity:.22,roughness:.05,metalness:.1,depthWrite:false}),exit={type:'norfolk-exit',title:'Back to the Long Corridor',author:'Into the bottle, and out again on the shelf in the Long Corridor, towards the Grand Hall.',action:'RETURN'};
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
        block(x+side*1.1,z,.5,.5);registerSeat?.(parts,chair,new THREE.Vector3(0,1.18,-.05),side*Math.PI/2,{title:'A chair at the table',author:'Sit in the house at Kingston and read one of the island’s books.',bookIds:books.map(b=>b.userData.book.id)});for(const part of parts)ours.push(part)}
    }
    // The verandah: a small table (where the book is left) and a cane chair, and the plate on the chaplain's address.
    function buildVerandah(wood,white){
      const {cx}=ROOM;table=new THREE.Group();table.position.set(cx+2.6,0,z1+1.6);root.add(table);
      box(.7,.04,.7,white,0,.7,0,table);box(.06,.7,.06,white,0,.35,0,table);block(cx+2.6,z1+1.6,.8,.8);
      const chair=new THREE.Group();chair.position.set(cx+1.6,0,z1+1.7);chair.rotation.y=Math.PI;root.add(chair);
      const parts=[box(.5,.05,.5,std({color:0xb89a64,roughness:.9}),0,.44,0,chair),box(.5,.6,.05,std({color:0xb89a64,roughness:.9}),0,.78,.24,chair)];for(const [lx,lz] of [[-.21,-.2],[.21,-.2],[-.21,.2],[.21,.2]])box(.04,.44,.04,wood,lx,.22,lz,chair);
      block(cx+1.6,z1+1.7,.55,.55);registerSeat?.(parts,chair,new THREE.Vector3(0,1.18,-.05),Math.PI,{title:'A chair on the verandah',author:'Sit and watch the bay.',bookIds:books.map(b=>b.userData.book.id)});for(const part of parts)ours.push(part);
      const p=add(own(new THREE.PlaneGeometry(.42,.26)),std({color:0xb08d3a,metalness:.6,roughness:.4}),cx-2.6,1.45,z1+.22,root);mark(p,card('johnson'));
    }
    // The view: south over the lawns and the pines to Slaughter Bay, its reef, and Nepean and Phillip Islands; the hills and
    // more pines behind the house to the north. The bay's water is a pane of its own, which draws back off the reef at low
    // tide; the Sirius, as Raper painted her, waits on the reef, hidden until she is seen.
    function buildView(){
      const {cx}=ROOM;
      const pano=own(canvasTexture((c,W,H)=>{c.translate(W,0);c.scale(-1,1);// seen from inside: drawn mirrored. North at 0 and W, east at W/4, south at W/2, west at 3W/4.
        let k=47;const r=()=>(k=(k*9301+49297)%233280)/233280,hz=H*HORIZON;
        const sky=c.createLinearGradient(0,0,0,hz);sky.addColorStop(0,'#4a5e86');sky.addColorStop(.6,'#c8a890');sky.addColorStop(1,'#f0c896');c.fillStyle=sky;c.fillRect(0,0,W,H);
        const sx=W*.72;const glow=c.createRadialGradient(sx,hz-H*.05,4,sx,hz-H*.05,W*.12);glow.addColorStop(0,'rgba(255,226,170,1)');glow.addColorStop(1,'rgba(255,190,130,0)');c.fillStyle=glow;c.fillRect(0,0,W,hz);
        // The sea from east through south to west.
        const sea=c.createLinearGradient(0,hz,0,H);sea.addColorStop(0,'#4a7a96');sea.addColorStop(1,'#2a4e66');c.fillStyle=sea;c.fillRect(W*.15,hz,W*.7,H-hz);
        // Phillip Island, high and red-brown, to the south; Nepean, low and pale, nearer and east of it.
        c.fillStyle='#8a5a44';c.beginPath();c.moveTo(W*.46,hz);c.quadraticCurveTo(W*.49,hz-H*.09,W*.52,hz-H*.07);c.quadraticCurveTo(W*.55,hz-H*.04,W*.57,hz);c.fill();
        c.fillStyle='#b8a888';c.beginPath();c.ellipse(W*.4,hz+H*.005,W*.025,H*.012,0,Math.PI,0);c.fill();
        // The land, north round to east and west, green with pines.
        const land=(from,to,top,color)=>{c.fillStyle=color;c.beginPath();c.moveTo(W*from,H);for(let t=0;t<=1.0001;t+=.01){const x=from+(to-from)*t;c.lineTo(W*x,hz-H*top*Math.min(1,Math.min(t,1-t)*6)+H*.01*Math.sin(t*31))}c.lineTo(W*to,H);c.fill()};
        land(-.2,.22,.12,'#4e7a40');land(.78,1.2,.12,'#4e7a40');land(-.2,.22,.06,'#3e6a34');land(.78,1.2,.06,'#3e6a34');
        // Norfolk pines: tall, with level tiers, along the shore and over the hills.
        for(let i=0;i<46;i++){const x=W*r(),south=x>W*.3&&x<W*.7,base=south?hz+H*(.1+r()*.06):hz+H*(.02+r()*.05),ht=H*(south?.22+r()*.12:.16+r()*.14);
          c.fillStyle='#1e3a24';c.fillRect(x-1.5,base-ht,3,ht);for(let j=0;j<10;j++){const y=base-ht+j*ht/10,w=5+j*3.2;c.fillRect(x-w,y,w*2,4)}}
        // The lawns of Kingston, near, and the low walls and white buildings of Quality Row along the shore.
        c.fillStyle='#5f8a46';c.beginPath();c.moveTo(0,H);for(let x=0;x<=W;x+=16)c.lineTo(x,H*(.8+.02*Math.sin(x/W*Math.PI*2*5)));c.lineTo(W,H);c.fill();
        for(let i=0;i<9;i++){const x=W*(.2+r()*.6),y=hz+H*(.12+r()*.05),s=10+r()*10;c.fillStyle='#e8e2d2';c.fillRect(x,y,s*2,s);c.fillStyle='#6a6e70';c.fillRect(x-2,y-4,s*2+4,4)}},4096,512));
      const g=new THREE.Group();g.position.set(cx,0,z1);root.add(g);
      const ring=add(own(new THREE.CylinderGeometry(R,R,PANO,64,1,true,-Math.PI,Math.PI*2)),own(new THREE.MeshBasicMaterial({map:pano,side:THREE.BackSide,fog:false})),0,EYE+PANO*(HORIZON-.5),0,g);ring.raycast=()=>{};
      const domeTex=own(canvasTexture((c,W,H)=>{const gr=c.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#3a4a72');gr.addColorStop(1,'#4a5e86');c.fillStyle=gr;c.fillRect(0,0,W,H)},64,64));
      const dome=add(own(new THREE.SphereGeometry(R+.5,32,12,0,Math.PI*2,0,Math.PI/2)),own(new THREE.MeshBasicMaterial({map:domeTex,side:THREE.BackSide,fog:false})),0,EYE+PANO*HORIZON-.4,0,g);dome.raycast=()=>{};
      const under=add(own(new THREE.CircleGeometry(R-.2,48)),own(new THREE.MeshBasicMaterial({color:0x4a6a3a,fog:false})),0,EYE+PANO*(HORIZON-.5)-PANO/2+.05,0,g);under.rotation.x=-Math.PI/2;under.raycast=()=>{};
      // The reef, a pale band in the bay, south-west; the water over it; and the Sirius on it, hidden. All face the house.
      const at=(a,dist,y,w,h,map,opacity)=>{const m=add(own(new THREE.PlaneGeometry(w,h)),own(new THREE.MeshBasicMaterial({map,color:map?0xffffff:0x4a7a96,transparent:true,opacity,depthWrite:false,fog:false})),Math.sin(a)*dist,y,Math.cos(a)*dist,g);m.rotation.y=a+Math.PI;return m};
      const a=-.35,reefTex=own(canvasTexture((c,W,H)=>{c.clearRect(0,0,W,H);c.fillStyle='rgba(200,190,160,.95)';for(let i=0;i<40;i++){c.beginPath();c.ellipse(W*(.05+i*.023),H*(.5+.12*Math.sin(i)),W*.03,H*.18,0,0,7);c.fill()}c.fillStyle='rgba(255,255,255,.7)';for(let i=0;i<30;i++)c.fillRect(W*Math.random(),H*.25,6,2)},256,32));
      const reef=at(a,R-2,EYE-1.15,9,.5,reefTex,1);mark(reef,{type:'norfolk-reef',title:CARDS.reef[0],author:CARDS.reef[1],action:'LOOK'});
      water=at(a,R-2.1,EYE-1.15,9.4,.6,null,.92);water.raycast=()=>{};
      const shipTex=own(canvasTexture((c,W,H)=>{c.clearRect(0,0,W,H);c.save();c.translate(W*.5,H*.7);c.rotate(-.22);c.fillStyle='#2a2018';c.beginPath();c.moveTo(-W*.36,0);c.lineTo(W*.36,0);c.lineTo(W*.3,H*.12);c.lineTo(-W*.3,H*.12);c.fill();
        c.fillStyle='#e8ddc4';c.fillRect(-W*.3,-H*.03,W*.6,H*.03);c.fillStyle='#3a2a1e';for(const mx of [-.18,.02,.2]){c.fillRect(W*mx,-H*.14,4,H*.14)}c.restore();
        c.fillStyle='rgba(255,255,255,.75)';for(let i=0;i<24;i++){c.beginPath();c.ellipse(W*(.1+Math.random()*.8),H*(.78+Math.random()*.1),W*.04,H*.03,0,0,7);c.fill()}},256,128));
      ship=at(a-.04,R-2.3,EYE-.95,3,1.5,shipTex,0);ship.raycast=()=>{};ship.visible=false;
    }
    function leaveBook(){
      const book=catalogue().secret[0];if(!book||tableBook||!table)return;
      tableBook=placeBook(book,{x:0,y:.76,z:0,yaw:.4,tilt:-Math.PI/2},own(new THREE.BoxGeometry(.62,.86,.12)),'secret',table)}

    // ---------- walking ----------
    function contains(x,z){return x>x0-.6&&x<x1+.6&&z>z0&&z<zv+.2}
    function floorAt(x,z){return contains(x,z)?0:null}
    function allowed(x,z){
      if(!contains(x,z))return false;const rad=player.radius||.42;
      if(z>z1-.45&&z<z1+.45)return Math.abs(x-DOOR.x)<DOOR.w/2-.3;
      if(z>z1){if(x-rad<x0-.4||x+rad>x1+.4||z+rad>zv-.25)return false}
      else if(x-rad<x0+.22||x+rad>x1-.22||z-rad<z0+.22)return false;
      return !blockers.some(b=>x+rad>b.minX&&x-rad<b.maxX&&z+rad>b.minZ&&z-rad<b.maxZ)}

    // ---------- doing things ----------
    function enter(){
      activate();move(ROOM.cx,ROOM.cz+.9,0);playSample?.('pageTurn',.35,.6);
      showNotice('Norfolk Island, on an autumn evening: a room in one of the stone houses the convicts built at Kingston, its door open on a verandah, and beyond it the pines, the bay and its reef. The bottle you came through is on the table, to take you back.',14);
      analytics?.track('Room Explored',{room:'norfolk'})}
    function leave(){const p=bottles?.standBefore?.('norfolk')||{x:1701,z:-2,yaw:-Math.PI/2};move(p.x,p.z,p.yaw);playSample?.('pageTurn',.35,.6);showNotice('The Long Corridor again, and the bottle back on its shelf.',4)}
    function lookAtReef(){
      if(!tideLow()){showNotice('The tide is in, and the surf breaks over the reef. It goes out again before long.',6);return}
      if(ship){ship.visible=true;shipShow=8}
      if(!wasFound()){try{storage?.setItem(FOUND_KEY,'1')}catch(e){}leaveBook();analytics?.track('Secret Found',{room:'norfolk',secret:'sirius'});showNotice(`${CARDS.secret[0]}. ${CARDS.secret[1]}`,16);return}
      showNotice(`The tide is out, and the reef lies bare where the Sirius struck: ${q('struck')}.`,10)}
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('norfolk-'))return false;
      if(data.type==='norfolk-exit'){leave();return true}
      if(data.type==='norfolk-reef'){lookAtReef();return true}
      if(data.type==='norfolk-picture'){const p=PICTURES[data.picture];if(showPicture)showPicture({kicker:'NORFOLK ISLAND',title:p.title,src:`${pictures}${p.file}.jpg`,caption:data.author,credit:p.credit});else showNotice(`${p.title}: ${data.author}`,12);return true}
      if(data.type==='norfolk-card'){showNotice(`${data.title}: ${data.author}`,data.author.length>320?18:data.author.length>160?13:9);return true}
      return false}

    // ---------- lifecycle ----------
    function activate(){if(!root)build();lastNeeded=time}
    function unload(){
      if(!root)return;root.removeFromParent();root.traverse(object=>{if(object.isLight)object.userData.freed=true});root=null;table=null;tableBook=null;lamp=null;water=null;ship=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0}
    function update(t){
      // Built ahead while the reader stands by the bottles' shelf, so that looking in does not wait.
      const dt=Math.min(.1,Math.max(0,t-time));time=t;const inside=contains(player.pos.x,player.pos.z),bay=bottles?.bay,near=!!bay&&Math.hypot(player.pos.x-bay.x,player.pos.z-bay.z)<3.2;
      if(inside||near&&(root||window.libraryMayBuild?.()!==false))activate();
      else if(root&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==b.userData.home.parent))unload();
      if(!inside||!root)return;
      // The water over the reef: thin at low tide, deep at high.
      const f=((t%TIDE)+TIDE)%TIDE/TIDE,depth=.5+.5*Math.cos(f*Math.PI*2);if(water)water.material.opacity=.15+.8*depth;
      if(ship&&shipShow>0){shipShow-=dt;ship.material.opacity=Math.min(1,shipShow>6?(8-shipShow)/2:shipShow/2);if(shipShow<=0)ship.visible=false}}
    return {contains,floorAt,allowed,interact,update,enter,leave,activate,unload,catalogue,tideLow,room:ROOM,verandah:VER,door:DOOR,groups:GROUPS,own:OWN,quotes:QUOTES,sources:SOURCES,cards:CARDS,pictures:PICTURES,tide:TIDE,
      get built(){return !!root},get books(){return books.slice()},get found(){return wasFound()},zoneAt:(x,z)=>contains(x,z)?'norfolk':null};
  };
})();
