// Montserrat: a timber house in the north of the island at night, reached through a ship in a bottle on the Long
// Corridor's shelf (ships-in-bottles.js, handed `bottles`). Its verandah looks south over the Centre Hills to the
// Soufrière Hills, the dome glowing and the ash of Plymouth grey below it, painted on a backdrop that goes nowhere: the
// house and its verandah are all there is to walk. One light, the lamp on the table; the view glows a little of itself.
//
// Montserrat is the Emerald Isle of the Caribbean: settled from 1632 by English and Irish from St Kitts, with Irish
// Catholics after them, and by the 1670s mostly Irish among its Europeans; Erin with her harp is on its flag, and St
// Patrick's Day is a public holiday that also remembers the rising planned by enslaved Africans for 17 March 1768. The
// cards say only that much, and keep to the difference between a servant bound for years and a person enslaved for
// life (a test keeps off them the myth that the Irish there were slaves). No book on Gutenberg is about the island, so the shelves are the
// Caribbean around it: its own people's voices (after the library's own Equiano and Seacole), its neighbours, and the
// Victorian travellers, with notes that say what they were (shelves `montserrat-*` in data/new-books.js).
//
// Equiano bought his freedom on Montserrat on 10 July 1766, and his book prints the deed whole: it hangs on the north
// wall, every word checked against the library's text (book 15399) by a test, as is every quotation on a card. He also
// climbed the hot springs above Plymouth and boiled potatoes in them, and that is the view's card. The secret is the
// mountain chicken, the great frog found now only here and on Dominica: something whoops among the ferns at the
// verandah's west end, and looking there finds it, for good (athenaeum-montserrat-mountain-chicken; ?mountainchicken).
(function(){
  'use strict';

  // The library's own copies that head the shelf of voices: Equiano, and Mary Seacole from the Medicine Room.
  const OWN=[15399,23031];
  const GROUPS=[
    {key:'voices',name:'IN THEIR OWN WORDS',sub:'Caribbean lives, told by those who lived them',wall:'west',along:0,length:4.6,max:6,ids:OWN},
    {key:'islands',name:'THE ISLANDS AROUND',sub:'Antigua, Dominica, Barbados, Martinique',wall:'east',along:-1.55,length:3.1,max:4,ids:[]},
    {key:'travellers',name:'VISITORS',sub:'Victorian travellers, and what they thought',wall:'east',along:1.85,length:2.4,max:3,ids:[]}
  ];
  // Equiano's own words, from the library's text of his Interesting Narrative (1789): checked by a test.
  const EQUIANO={
    hill:'a high and steep mountain, some few miles from the town of Plymouth in Montserrat',
    potatoes:'I had taken some potatoes with me, and I put them into different ponds, and in a few minutes they were well boiled.',
    forty:'Have you got forty pounds sterling?',
    master:'I who had been a slave in the morning, trembling at the will of another, was become my own master, and completely free.',
    happiest:'I thought this was the happiest day I had ever experienced'
  };
  // The deed itself, as his book prints it.
  const MANUMISSION='To all men unto whom these presents shall come: I Robert King, of the parish of St. Anthony in the said island, merchant, send greeting: Know ye, that I the aforesaid Robert King, for and in consideration of the sum of seventy pounds current money of the said island, to me in hand paid, and to the intent that a negro man-slave, named Gustavus Vassa, shall and may become free, have manumitted, emancipated, enfranchised, and set free, and by these presents do manumit, emancipate, enfranchise, and set free, the aforesaid negro man-slave, named Gustavus Vassa, for ever, hereby giving, granting, and releasing unto him, the said Gustavus Vassa, all right, title, dominion, sovereignty, and property, which, as lord and master over the aforesaid Gustavus Vassa, I had, or now I have, or by any means whatsoever I may or can hereafter possibly have over him the aforesaid negro, for ever. In witness whereof I the abovesaid Robert King have unto these presents set my hand and seal, this tenth day of July, in the year of our Lord one thousand seven hundred and sixty-six.';
  const q=key=>`“${EQUIANO[key]}”`;
  const CARDS={
    sign:['Montserrat','A volcanic island of the Leeward Islands, about eleven miles long, named by Columbus in 1493 after the monastery of Montserrat near Barcelona. It is a British Overseas Territory, and it is called the Emerald Isle of the Caribbean: for its green hills, and for the Irish who settled it.'],
    irish:['The Irish on Montserrat','English and Irish settlers came to Montserrat from St Kitts in 1632, and Irish Catholics followed them, from St Kitts, from Virginia and from Ireland itself, many as indentured servants, bound to work for a master for a term of years. By the 1670s most of the island’s European settlers were Irish, and their names are still the island’s names. The Africans brought to the island were enslaved for life, and so were their children.'],
    stamp:['Erin and her harp','A Montserrat penny stamp of 1929. Beside King George V stands Erin, the figure of Ireland, holding a cross, with her harp at her side: the badge Montserrat has carried on its flag since 1909.'],
    patrick:['St Patrick’s Day','The seventeenth of March is a public holiday on Montserrat, and the end of a week of festival. It remembers two things: Patrick, and the night of 17 March 1768, when the island’s enslaved Africans planned to rise while the planters were celebrating. The plan was betrayed, and its leaders were executed.'],
    rising:['17 March 1768','On St Patrick’s Day in 1768 the enslaved people of Montserrat planned to rise while their owners feasted. They were betrayed, and the leaders were put to death. Slavery on the island ended with emancipation in 1834. The island keeps the day for them as well as for the saint.'],
    goat:['Goat water','A thick stew of goat, with spices and hot peppers, served at every festival: Montserrat’s national dish. Here it is on a table laid for St Patrick’s Day, under the lamp.'],
    view:['The Soufrière Hills',`In 1763 Olaudah Equiano climbed what he called Brimstone-Hill, “${EQUIANO.hill}”, to see its boiling ponds of many colours. ${q('potatoes')} The hills were quiet then. In July 1995 they began to erupt; in 1997 the flows from the dome buried Plymouth, the capital, nineteen people were killed, and the south of the island was closed. More than half of the islanders left. The volcano is watched day and night from the Montserrat Volcano Observatory.`],
    manumission:['Equiano’s freedom',`Olaudah Equiano was taken from Africa as a child, and on Montserrat he belonged to Robert King, a merchant, who let him trade a little on his own account. By 1766 he had saved enough to buy himself. ${q('forty')} King asked him, and he had: the deed, drawn up the same day for seventy pounds of the island’s money, is printed in full in his book, and is here as he printed it. ${q('master')}`],
    chart:['Admiralty Chart No. 254, Montserrat, 1869','The Royal Navy’s chart of the island, surveyed in 1867 by Staff Commander J. Parsons and published in 1869: its soundings and hills, its profile seen from the sea, and below, the anchorage at Plymouth. Plymouth, on the south-west coast, lies now under the volcano’s ash.'],
    oriole:['The Montserrat oriole','Icterus oberi, the island’s national bird, found nowhere else, and named for Frederick Ober, who collected it in the 1870s. This hand-coloured plate is from The Ibis of 1882. The eruptions destroyed much of its forest, and it lives now in the Centre Hills.'],
    frog:['The mountain chicken','Leptodactylus fallax: one of the largest frogs in the world, called a chicken for its size and, once, its place on the table. It used to live on several islands; now it lives only on Montserrat and Dominica, and it is critically endangered. At night it calls with a deep whoop.'],
    ferns:['Ferns in pots','A row of potted ferns at the end of the verandah, where it is damp and dark.'],
    voices:['In their own words','Caribbean lives told by the people who lived them: Equiano, who bought his freedom here, Mary Prince, Mary Seacole, J. J. Thomas, Nancy Prince and Claude McKay.'],
    islands:['The islands around','No book in the library is about Montserrat itself, so this shelf is its neighbours: Antigua, Dominica, Barbados and Martinique.'],
    travellers:['Visitors','Victorian travellers in the West Indies: Trollope, Froude and Kingsley. They saw a great deal and understood less; their notes say so, and J. J. Thomas’s Froudacity, across the room, answers Froude.']
  };
  const PICTURES={
    chart:{file:'montserrat-chart',credit:'Admiralty Chart No. 254, surveyed 1867, published 1869. United Kingdom Hydrographic Office. Public domain, from Wikimedia Commons.',ratio:1.45},
    oriole:{file:'montserrat-oriole',credit:'The Ibis, 1882, plate XIII. Public domain, from Wikimedia Commons.',ratio:1.64},
    stamp:{file:'montserrat-stamp',credit:'Montserrat penny stamp, 1929. Public domain, from Wikimedia Commons.',ratio:1.2},
    frog:{file:'montserrat-frog',credit:'Photograph of Leptodactylus fallax. Public domain, from Wikimedia Commons.',ratio:.68},
    view:{file:'montserrat-volcano',credit:'Photograph of the Soufrière Hills. Public domain, from Wikimedia Commons.',ratio:.75}
  };
  const FOUND_KEY='athenaeum-montserrat-mountain-chicken';

  window.createMontserratRoom=function(options){
    const {THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,arrivals={},showNotice,playSample,move,analytics,isHolding=()=>false,registerSeat=null,
      bottles=null,showPicture=null,tone=null,storage=null,search='',pictures='assets/pictures/'}=options;
    const ROOM={cx:2600,cz:600,w:10,d:7,h:3.3},VERANDAH=3;
    const x0=ROOM.cx-ROOM.w/2,x1=ROOM.cx+ROOM.w/2,z0=ROOM.cz-ROOM.d/2,z1=ROOM.cz+ROOM.d/2,zEnd=z1+VERANDAH;
    const KEEP=25;
    const wasFound=()=>{try{return storage?.getItem(FOUND_KEY)==='1'||/[?&](mountainchicken|mountain-chicken|frog)\b/.test(search)}catch(e){return false}};
    let root=null,time=0,lastNeeded=-1e9,frog=null,glow=null,flame=null,nextWhoop=8;
    const owned=[],ours=[],books=[],blockers=[];
    const own=thing=>{owned.push(thing);return thing};
    const std=params=>own(new THREE.MeshStandardMaterial(params));
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const card=key=>({type:'montserrat-card',key,title:CARDS[key][0],author:CARDS[key][1],action:'READ'});
    function sign(parent,text,sub,w,h,x,y,z){
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle='#eef0e0';c.fillRect(0,0,W,H);c.strokeStyle='#2f6b3c';c.lineWidth=3;c.strokeRect(7,7,W-14,H-14);
        c.fillStyle='#1f2a1c';c.textAlign='center';c.font='bold 27px Georgia';c.fillText(text,W/2,sub?50:H/2+10);if(sub){c.font='italic 19px Georgia';c.fillText(sub,W/2,82)}},620,sub?104:70));
      return add(own(new THREE.PlaneGeometry(w,h)),std({map,emissive:0x2a3324,emissiveIntensity:.25,roughness:.9}),x,y,z,parent)}

    const shelfBooks=(ids,key,max)=>[...new Set([...ids,...(arrivals[key]||[])])].map(id=>findBook(id)).filter(Boolean).slice(0,max);
    function catalogue(){return {groups:GROUPS.map(group=>({...group,books:shelfBooks(group.ids,group.key,group.max)}))}}

    // ---------- the bottle on the corridor's shelf ----------
    // A schooner under sail, bound for a green island with a smoking cone at its south end.
    bottles?.add({key:'montserrat',title:'Montserrat',label:'MONTSERRAT',author:'A schooner under sail for a green island in the Leeward Islands, with a cone at its south end and a wisp of smoke over it.',
      island:[[.07,.045,.045],[.11,.04,.06],[.14,.03,.04]],smoke:[.11,.075],land:0x3d7040,enter});

    // ---------- the house ----------
    function buildRoom(){
      root=new THREE.Group();root.name='montserrat';const {cx,cz,w,d,h}=ROOM;
      const boards=own(canvasTexture((c,W,H)=>{c.fillStyle='#b9cfb4';c.fillRect(0,0,W,H);for(let y=0;y<H;y+=32){c.fillStyle='rgba(60,80,58,.35)';c.fillRect(0,y,W,2);c.fillStyle='rgba(255,255,240,.12)';c.fillRect(0,y+3,W,2)}},256,256));
      boards.wrapS=boards.wrapT=THREE.RepeatWrapping;boards.repeat?.set?.(5,1.6);
      const floorTex=own(canvasTexture((c,W,H)=>{c.fillStyle='#6b4a2c';c.fillRect(0,0,W,H);for(let x=0;x<W;x+=26){c.fillStyle=`rgba(${30+((x*7)%40)},18,8,.35)`;c.fillRect(x,0,2,H)}},256,256));
      floorTex.wrapS=floorTex.wrapT=THREE.RepeatWrapping;floorTex.repeat?.set?.(5,5);
      const wall=std({color:0xb5c4ae,map:boards,roughness:.9}),trim=std({color:0xe9e6da,roughness:.7}),floor=std({color:0x8a6a48,map:floorTex,roughness:.85}),wood=MAT.darkWood||std({color:0x3a2416,roughness:.7});
      // Floor through to the verandah's edge, the ceiling over the room and a lower roof over the verandah.
      box(w,.3,d+VERANDAH,floor,cx,-.15,cz+VERANDAH/2,root);box(w,.2,d,std({color:0xd9d6c8,roughness:1}),cx,h+.1,cz,root);
      const roof=box(w+.4,.12,VERANDAH+.3,std({color:0x5c4632,roughness:.9}),cx,h-.25,z1+VERANDAH/2,root);roof.rotation.x=-.06;
      box(w,h,.3,wall,cx,h/2,z0,root);box(.3,h,d,wall,x0,h/2,cz,root);box(.3,h,d,wall,x1,h/2,cz,root);
      // The south side is open: four posts, a beam, and the verandah's rail with its posts.
      for(const px of [x0+.15,cx-1.8,cx+1.8,x1-.15]){box(.16,h,.16,trim,px,h/2,z1,root);box(.12,h-.3,.12,trim,px,(h-.3)/2,zEnd-.1,root)}
      box(w,.2,.2,trim,cx,h-.1,z1,root);
      // The verandah's ends are boarded, with the photograph of the hills on the west one.
      for(const ex of [x0,x1])box(.2,h-.3,VERANDAH,wall,ex,(h-.3)/2,z1+VERANDAH/2,root);
      hang('view',x0+.12,1.85,z1+1.35,Math.PI/2,.95);
      const rail=box(w,.06,.1,trim,cx,1,zEnd-.1,root);box(w,.06,.08,trim,cx,.45,zEnd-.1,root);for(let i=0;i<=24;i++)box(.035,.55,.035,trim,x0+.2+i*(w-.4)/24,.72,zEnd-.1,root);
      mark(rail,card('view'));
      mark(sign(root,'MONTSERRAT','The Emerald Isle of the Caribbean',2.4,.4,cx,h-.4,z0+.17),card('sign'));
      buildView();
      // The shelves, face-out, one or two rows under their labels.
      const {groups}=catalogue(),geometry=own(new THREE.BoxGeometry(.62,.86,.12)),ROWS=[1.25,2.25];
      for(const group of groups){
        const per=group.books.length>4?Math.ceil(group.books.length/2):Math.max(1,group.books.length),step=Math.min(1.05,(group.length-.3)/per);
        group.books.forEach((book,i)=>{const row=i<per?0:1,n=row?group.books.length-per:per,col=row?i-per:i,offset=(col-(n-1)/2)*step;placeBook(book,{...shelfSpot(group,offset),y:ROWS[row]},geometry,group.key)});
        const s=shelfSpot(group,0,.34),rows=group.books.length>per?ROWS:ROWS.slice(0,1),top=rows.at(-1)+.78,label=sign(root,group.name,group.sub,2.3,.38,0,top,0),side=group.wall==='west'?-1:1;
        for(const y of rows)box(.34,.05,group.length,wood,s.x,y-.45,s.z,root);block(s.x,s.z,.7,group.length+.2);
        label.position.set(cx+side*(w/2-.17),top,s.z);label.rotation.y=-side*Math.PI/2;mark(label,card(group.key));
      }
      // The north wall: the deed, the chart, the oriole, and the plaque for 1768 with its candle.
      buildDeed(cx-3.1,1.85,z0+.17);
      hang('chart',cx-.8,1.9,z0+.17,0,1.05);hang('oriole',cx+1.35,1.85,z0+.17,0,.62);
      hang('stamp',cx+2.65,2.2,z0+.17,0,.42);
      buildRising(cx+3.75,1.55,z0+.17);
      buildTable(cx,cz+.2,wood);
      buildVerandah(wood);
      // The lamp on the table is the house's one light.
      const lamp=new THREE.PointLight(0xffd29a,4.2,16,2);lamp.position.set(cx+.4,1.55,cz+.1);root.add(lamp);
      scene.add(root);
    }
    function shelfSpot(group,offset,inset=.3){const side=group.wall==='west'?-1:1;return {x:ROOM.cx+side*(ROOM.w/2-inset),z:ROOM.cz+group.along-side*offset,yaw:-side*Math.PI/2}}
    function placeBook(book,spot,geometry,shelf,parent=root){
      const mesh=add(geometry,own(bookMaterial(book)),spot.x,spot.y,spot.z,parent);mesh.rotation.order='YXZ';mesh.rotation.y=spot.yaw||0;mesh.rotation.x=spot.tilt??-.08;
      mesh.userData={type:'book',book,loaded:false,montserrat:true,shelf,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent}};
      interactables.push(mesh);ours.push(mesh);books.push(mesh);return mesh}
    // A framed picture from assets/pictures: a mount until the photograph arrives, then the photograph at its own shape.
    function hang(key,x,y,z,yaw,width){
      const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=yaw;root.add(g);const p=PICTURES[key],height=width*p.ratio;
      const data={type:'montserrat-picture',picture:key,title:CARDS[key][0],author:CARDS[key][1],action:'LOOK CLOSELY'};
      const frame=mark(box(width+.1,height+.1,.04,MAT.darkWood||std({color:0x2c1c12,roughness:.6}),0,0,0,g),data);
      const mat=std({color:0x9a927f,roughness:.9}),sheet=mark(add(own(new THREE.PlaneGeometry(width,height)),mat,0,0,.025,g),data);
      try{new THREE.TextureLoader().load(`${pictures}${p.file}-wall.jpg`,texture=>{if(!root)return texture.dispose?.();texture.colorSpace=THREE.SRGBColorSpace;own(texture);mat.map=texture;mat.color?.set?.(0xd2cec2);mat.needsUpdate=true;
        const image=texture.image;if(image?.width&&image?.height){const k=image.height/image.width/p.ratio;sheet.scale.y=k;frame.scale.y=(height*k+.1)/(height+.1)}})}catch(e){}
      return g}
    // Equiano's deed of manumission, written out on a sheet of parchment in a plain frame.
    function buildDeed(x,y,z){
      const W=640,H=900,sheet=own(canvasTexture((c)=>{c.fillStyle='#e6d6ae';c.fillRect(0,0,W,H);let k=7;const r=()=>(k=(k*9301+49297)%233280)/233280;
        for(let i=0;i<500;i++){c.fillStyle=`rgba(120,90,40,${r()*.06})`;c.fillRect(r()*W,r()*H,2+r()*6,1+r()*3)}
        c.fillStyle='#2a1c0e';c.textAlign='center';c.font='italic bold 34px Georgia';c.fillText('Montserrat.',W/2,70);c.textAlign='left';c.font='italic 21px Georgia';
        let line='',yy=120;for(const word of MANUMISSION.split(' ')){const test=line?line+' '+word:word;if(c.measureText(test).width>W-90){c.fillText(line,45,yy);yy+=29;line=word}else line=test}c.fillText(line,45,yy);
        c.textAlign='right';c.font='italic 26px Georgia';c.fillText('Robert King.',W-50,yy+56);c.textAlign='left';c.font='italic 17px Georgia';c.fillText('Registered the eleventh day of July, 1766.',45,yy+100)},W,H));
      const g=new THREE.Group();g.position.set(x,y,z);root.add(g);const data={...card('manumission'),action:'READ'};
      mark(box(.86,1.18,.04,MAT.darkWood||std({color:0x2c1c12,roughness:.6}),0,0,0,g),data);mark(add(own(new THREE.PlaneGeometry(.76,1.07)),std({map:sheet,roughness:.95}),0,0,.025,g),data)}
    // The plaque for 17 March 1768, and a candle in a glass beneath it, whose flame flickers (no light of its own).
    function buildRising(x,y,z){
      const plate=own(canvasTexture((c,W,H)=>{c.fillStyle='#2a2a26';c.fillRect(0,0,W,H);c.strokeStyle='#b08d3a';c.lineWidth=4;c.strokeRect(8,8,W-16,H-16);c.fillStyle='#e9dfc2';c.textAlign='center';
        c.font='bold 34px Georgia';c.fillText('17 MARCH 1768',W/2,64);c.font='italic 20px Georgia';['For those who planned to rise','on St Patrick’s night,','and for their leaders, who were','betrayed and put to death.'].forEach((l,i)=>c.fillText(l,W/2,108+i*30))},420,240));
      const data=card('rising');mark(add(own(new THREE.PlaneGeometry(.84,.48)),std({map:plate,roughness:.6,metalness:.2}),x,y+.5,z+.01,root),data);
      const brass=MAT.brass||std({color:0xb08d3a,metalness:.6,roughness:.4});box(.4,.04,.16,brass,x,y,z+.08,root);
      mark(add(own(new THREE.CylinderGeometry(.045,.045,.12,12,1,true)),std({color:0xe8f0ea,transparent:true,opacity:.25,roughness:.1}),x,y+.08,z+.1,root),data);
      add(own(new THREE.CylinderGeometry(.03,.03,.07,10)),std({color:0xf3ecd8,roughness:.8}),x,y+.055,z+.1,root);
      flame=add(own(new THREE.ConeGeometry(.012,.04,8)),std({color:0xffd27a,emissive:0xffa040,emissiveIntensity:2,roughness:.4}),x,y+.11,z+.1,root);flame.raycast=()=>{}}
    // The table laid for St Patrick's Day: a green cloth, a pot of goat water and bowls, the lamp, and the bottle home.
    function buildTable(x,z,wood){
      const g=new THREE.Group();g.position.set(x,0,z);root.add(g);
      const top=box(1.9,.05,1.05,wood,0,.76,0,g);for(const [lx,lz] of [[-.85,-.45],[.85,-.45],[-.85,.45],[.85,.45]])box(.06,.75,.06,wood,lx,.375,lz,g);
      const cloth=box(1.6,.012,.8,std({color:0x2f7a3c,roughness:.95}),0,.79,0,g);for(const part of [top,cloth])mark(part,card('patrick'));
      const iron=std({color:0x2a2622,roughness:.6,metalness:.4}),pot=add(own(new THREE.CylinderGeometry(.16,.13,.18,16)),iron,-.35,.89,0,g);mark(pot,card('goat'));
      mark(add(own(new THREE.CylinderGeometry(.15,.15,.02,16)),std({color:0x8a5a2c,roughness:.6}),-.35,.985,0,g),card('goat'));
      for(const [bx,bz] of [[.1,-.25],[.1,.25],[-.75,.25]])add(own(new THREE.CylinderGeometry(.08,.05,.05,14)),std({color:0xefe7d6,roughness:.5}),bx,.82,bz,g);
      const brass=MAT.brass||std({color:0xb08d3a,metalness:.6,roughness:.4});add(own(new THREE.CylinderGeometry(.06,.08,.06,12)),brass,.4,.83,-.1,g);
      add(own(new THREE.CylinderGeometry(.06,.05,.18,12,1,true)),std({color:0xfff4d6,emissive:0xffc070,emissiveIntensity:1.4,transparent:true,opacity:.8}),.4,.95,-.1,g);
      // The bottle home: the same schooner, lying in a cradle, with a brass plate naming where it goes.
      const glass=std({color:0xd9efe6,transparent:true,opacity:.22,roughness:.05,metalness:.1,depthWrite:false}),exit={type:'montserrat-exit',title:'Back to the Long Corridor',author:'Into the bottle, and out again on the shelf in the Long Corridor, towards the Grand Hall.',action:'RETURN'};
      const b=new THREE.Group();b.position.set(.62,.88,.22);g.add(b);const body=add(own(new THREE.CylinderGeometry(.085,.085,.38,18,1,true)),glass,0,0,0,b);body.rotation.z=Math.PI/2;
      const neck=add(own(new THREE.CylinderGeometry(.028,.032,.12,10,1,true)),glass,-.25,0,0,b);neck.rotation.z=Math.PI/2;add(own(new THREE.CylinderGeometry(.026,.022,.05,10)),std({color:0x9a7448,roughness:.9}),-.33,0,0,b).rotation.z=Math.PI/2;
      const hull=box(.12,.022,.035,std({color:0x3b2414,roughness:.6}),-.04,-.03,0,b);box(.003,.1,.003,std({color:0x5a3a1e}),-.04,.02,0,b);add(own(new THREE.PlaneGeometry(.05,.05)),std({color:0xf1e9d4,side:THREE.DoubleSide}),-.04,.02,.003,b);
      box(.4,.03,.12,wood,0,-.1,0,b);
      const plate=own(canvasTexture((c,W,H)=>{c.fillStyle='#caa15a';c.fillRect(0,0,W,H);c.strokeStyle='#6b4d22';c.lineWidth=4;c.strokeRect(5,5,W-10,H-10);c.fillStyle='#2b1d0e';c.textAlign='center';
        c.font='bold 26px Georgia';c.fillText('THE LONG CORRIDOR',W/2,40);c.font='italic 18px Georgia';c.fillText('towards the Grand Hall',W/2,68)},400,86));
      const label=add(own(new THREE.PlaneGeometry(.34,.075)),std({map:plate,roughness:.5,metalness:.3}),0,-.1,.065,b);
      for(const part of [body,neck,hull,label])mark(part,exit);
      block(x,z,2.1,1.3);
      // Two chairs at the table: the library's seats.
      for(const side of [-1,1]){const chair=new THREE.Group();chair.position.set(x+side*1.35,0,z);chair.rotation.y=side*Math.PI/2;root.add(chair);
        const parts=[box(.44,.04,.42,wood,0,.46,0,chair),box(.44,.55,.035,wood,0,.8,.2,chair)];for(const [lx,lz] of [[-.19,-.18],[.19,-.18],[-.19,.18],[.19,.18]])box(.035,.46,.035,wood,lx,.23,lz,chair);
        block(x+side*1.35,z,.5,.5);registerSeat?.(parts,chair,new THREE.Vector3(0,1.18,-.05),side*Math.PI/2,{title:'A chair at the table',author:'Sit at the table under the lamp and read one of the house’s books.',bookIds:books.map(b=>b.userData.book.id)});for(const part of parts)ours.push(part)}
    }
    // The verandah: a rocking chair turned to the hills, and potted ferns at the dark west end, where the frog is.
    function buildVerandah(wood){
      const {cx}=ROOM,chair=new THREE.Group();chair.position.set(cx+2.6,0,z1+1.4);chair.rotation.y=Math.PI;root.add(chair);
      const cane=std({color:0xb48a52,roughness:.85}),parts=[box(.5,.04,.48,cane,0,.44,0,chair),box(.5,.62,.04,cane,0,.8,.24,chair)];
      for(const sx of [-.24,.24]){const rocker=add(own(new THREE.TorusGeometry(.5,.02,5,16,1.1)),wood,sx,.5,0,chair);rocker.rotation.set(0,Math.PI/2,Math.PI+.98);box(.03,.42,.03,wood,sx,.22,-.18,chair);box(.03,.42,.03,wood,sx,.22,.2,chair)}
      block(cx+2.6,z1+1.4,.65,.65);registerSeat?.(parts,chair,new THREE.Vector3(0,1.15,.05),Math.PI,{title:'The rocking chair on the verandah',author:'Sit and look at the hills, and read one of the house’s books.',bookIds:books.map(b=>b.userData.book.id)});for(const part of parts)ours.push(part);
      // The ferns: four clay pots, and in the shadow of the last the mountain chicken, if it has been found.
      const clay=std({color:0x8a4a2c,roughness:.9});
      // A fern frond: a stem with paired leaflets, drawn once on a transparent sheet and cut out by its alpha.
      const frondTex=own(canvasTexture((c,W,H)=>{c.clearRect(0,0,W,H);c.strokeStyle='#2c4a22';c.lineWidth=3;c.beginPath();c.moveTo(W/2,H);c.quadraticCurveTo(W/2+6,H/2,W/2,6);c.stroke();
        for(let i=0;i<16;i++){const y=H-18-i*(H-30)/16,len=(W*.42)*Math.sin(Math.PI*(i+2)/19);c.fillStyle=i%2?'#3f6e2f':'#4a7a36';for(const sd of [-1,1]){c.beginPath();c.ellipse(W/2+sd*len/2,y-4,len/2,5,sd*-.35,0,7);c.fill()}}},128,256));
      const fern=std({map:frondTex,alphaTest:.5,transparent:false,roughness:.9,side:THREE.DoubleSide});
      [[x0+.55,z1+.7],[x0+.6,z1+1.55],[x0+.55,z1+2.35],[x0+1.35,zEnd-.55]].forEach(([px,pz],i)=>{const pot=add(own(new THREE.CylinderGeometry(.2,.15,.32,12)),clay,px,.16,pz,root);mark(pot,{type:'montserrat-ferns',key:'ferns',title:CARDS.ferns[0],author:CARDS.ferns[1],action:'LOOK'});
        for(let f=0;f<7;f++){const frond=add(own(new THREE.PlaneGeometry(.34,.62)),fern,px,.56,pz,root);frond.rotation.order='YXZ';frond.rotation.set(-.75,f*.9+i,0);frond.translateY?.(.16);frond.userData={type:'montserrat-ferns',key:'ferns',title:CARDS.ferns[0],author:CARDS.ferns[1],action:'LOOK'};interactables.push(frond);ours.push(frond)}
        block(px,pz,.45,.45)});
      const g=new THREE.Group();g.position.set(x0+1.05,0,zEnd-.85);g.rotation.y=.6;root.add(g);const skin=std({color:0x7a5532,roughness:.7}),belly=std({color:0xcfb08a,roughness:.8});
      const body=add(own(new THREE.SphereGeometry(.11,14,10)),skin,0,.09,0,g);body.scale.set(1,.7,1.3);const head=add(own(new THREE.SphereGeometry(.075,12,8)),skin,0,.12,.12,g);head.scale.set(1.2,.7,1);
      add(own(new THREE.SphereGeometry(.07,10,8)),belly,0,.06,.04,g).scale.set(1,.5,1.2);for(const sx of [-1,1]){add(own(new THREE.SphereGeometry(.018,8,6)),std({color:0x1a1208,roughness:.3}),sx*.04,.165,.16,g);const leg=add(own(new THREE.CylinderGeometry(.025,.025,.16,6)),skin,sx*.1,.04,-.08,g);leg.rotation.set(1.2,0,sx*.4)}
      g.visible=false;frog={g,found:false};for(const part of [body,head])mark(part,{type:'montserrat-picture',picture:'frog',title:CARDS.frog[0],author:CARDS.frog[1],action:'LOOK CLOSELY'});
      if(wasFound()){frog.found=true;g.visible=true}
    }
    // The view south: the Centre Hills falling away, the Soufrière Hills with the dome glowing and a plume over it, the ash
    // of Plymouth grey to the west of them, and the sea on either hand under a waning moon. Painted inside a half
    // cylinder, with a dome of stars over it; the dome's glow is a second, additive patch that breathes.
    function buildView(){
      const {cx}=ROOM,R=24,cyl=R*1.0;
      const pano=own(canvasTexture((c,W,H)=>{c.translate(W,0);c.scale(-1,1);// seen from inside: drawn mirrored so that east is on the left, as it is facing south
        const sky=c.createLinearGradient(0,0,0,H*.62);sky.addColorStop(0,'#050a1c');sky.addColorStop(1,'#1b2a4a');c.fillStyle=sky;c.fillRect(0,0,W,H);let k=17;const r=()=>(k=(k*9301+49297)%233280)/233280;
        c.fillStyle='#fff';for(let i=0;i<260;i++){c.globalAlpha=.25+r()*.7;c.fillRect(r()*W,r()*H*.55,1.4,1.4)}c.globalAlpha=1;
        c.fillStyle='#efe9d0';c.beginPath();c.arc(W*.8,H*.18,12,0,7);c.fill();c.fillStyle='#050a1c';c.beginPath();c.arc(W*.8+7,H*.18-3,11,0,7);c.fill();
        // The sea to the horizon (at .59, the eye's height), with the moon's path on it to the west.
        const sea=c.createLinearGradient(0,H*.59,0,H);sea.addColorStop(0,'#22355a');sea.addColorStop(1,'#08111f');c.fillStyle=sea;c.fillRect(0,H*.59,W,H);
        c.fillStyle='rgba(230,220,180,.22)';for(let i=0;i<46;i++)c.fillRect(W*(.76+r()*.08),H*(.6+r()*.1),4+r()*16,1);
        // The Soufrière Hills, about thirty degrees wide and seven high from the north of the island: Chances Peak and the
        // dome, darker below, and the grey fan of the flows running west (to the right here) down to the sea at Plymouth.
        c.fillStyle='#1a2422';c.beginPath();c.moveTo(W*.34,H*.6);c.bezierCurveTo(W*.4,H*.57,W*.44,H*.5,W*.485,H*.475);c.lineTo(W*.5,H*.468);c.lineTo(W*.515,H*.474);
        c.bezierCurveTo(W*.535,H*.482,W*.55,H*.49,W*.565,H*.488);c.bezierCurveTo(W*.6,H*.5,W*.64,H*.56,W*.68,H*.6);c.closePath();c.fill();
        const fan=c.createLinearGradient(W*.52,H*.48,W*.64,H*.6);fan.addColorStop(0,'rgba(62,62,58,.5)');fan.addColorStop(1,'rgba(44,46,44,.25)');c.fillStyle=fan;
        for(const [a,b] of [[.004,.022]]){c.beginPath();c.moveTo(W*.506,H*.478);c.bezierCurveTo(W*(.53+a),H*.51,W*(.57+a),H*.555,W*(.63+b),H*.598);c.lineTo(W*(.59-a),H*.6);c.bezierCurveTo(W*(.55-a),H*.56,W*.525,H*.52,W*.5,H*.482);c.fill()}
        c.fillStyle='rgba(200,196,186,.45)';for(let i=0;i<14;i++)c.fillRect(W*(.6+r()*.03),H*(.592+r()*.006),2,1.5);
        // The dome glowing, and its plume drifting west on the trade wind, lit from below.
        const dome=c.createRadialGradient(W*.5,H*.472,1,W*.5,H*.472,W*.016);dome.addColorStop(0,'rgba(255,190,110,1)');dome.addColorStop(.4,'rgba(255,120,40,.7)');dome.addColorStop(1,'rgba(255,80,20,0)');c.fillStyle=dome;c.fillRect(W*.47,H*.42,W*.06,H*.1);
        for(let i=0;i<22;i++){const u=i/21,px=W*(.5+u*.09+(r()-.5)*.006),py=H*(.462-u*.12-Math.sin(u*2.4)*.02);c.fillStyle=`rgba(${150-40*u+30*(1-u)},${120-30*u},${105-20*u},${.42-.32*u})`;c.beginPath();c.ellipse(px,py,W*(.006+u*.012),H*(.012+u*.02),-.3,0,7);c.fill()}
        // The Centre Hills in front, dark, their crest just below the horizon, and a few house lights on them.
        c.fillStyle='#0a130d';c.beginPath();c.moveTo(0,H*.7);for(let x=0;x<=W;x+=20)c.lineTo(x,H*(.64+.025*Math.sin(x*.006)+.012*Math.sin(x*.021+1))+(Math.abs(x/W-.5)<.18?H*.005:H*.03));c.lineTo(W,H);c.lineTo(0,H);c.fill();
        c.fillStyle='#ffd99a';for(let i=0;i<18;i++){const lx=r()<.5?r()*W*.18:W*.82+r()*W*.18;c.fillRect(lx,H*(.72+r()*.08),2,2)}},2048,512));
      const g=new THREE.Group();g.position.set(cx,0,zEnd);root.add(g);
      const wallMat=own(new THREE.MeshBasicMaterial({map:pano,side:THREE.BackSide,fog:false}));
      // The horizon (.59 of the way down the picture) at the eye's height, 1.72 m.
      const wall=add(own(new THREE.CylinderGeometry(cyl,cyl,24,48,1,true,-Math.PI*.56,Math.PI*1.12)),wallMat,0,1.72+24*(.59-.5),0,g);wall.raycast=()=>{};
      const domeTex=own(canvasTexture((c,W,H)=>{c.fillStyle='#050a1c';c.fillRect(0,0,W,H);let k=29;const r=()=>(k=(k*9301+49297)%233280)/233280;c.fillStyle='#fff';for(let i=0;i<220;i++){c.globalAlpha=.2+r()*.7;c.fillRect(r()*W,r()*H,1.3,1.3)}},512,256));
      const sky=add(own(new THREE.SphereGeometry(cyl+.5,32,12,0,Math.PI*2,0,Math.PI/2)),own(new THREE.MeshBasicMaterial({map:domeTex,side:THREE.BackSide,fog:false})),0,1.72+24*.59-.4,0,g);sky.raycast=()=>{};
      const patch=own(canvasTexture((c,W,H)=>{const gr=c.createRadialGradient(W/2,H/2,2,W/2,H/2,W/2);gr.addColorStop(0,'rgba(255,150,60,.9)');gr.addColorStop(1,'rgba(255,80,20,0)');c.fillStyle=gr;c.fillRect(0,0,W,H)},128,128));
      glow=add(own(new THREE.PlaneGeometry(1.1,.8)),own(new THREE.MeshBasicMaterial({map:patch,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,opacity:.5})),0,1.72+24*(.59-.472),cyl-.6,g);
      glow.rotation.y=Math.PI;glow.raycast=()=>{};
      // Below the rail, the dark hillside running down to the backdrop, so nothing of the library shows under the view.
      const hillside=add(own(new THREE.CircleGeometry(cyl-.2,40,Math.PI*.94,Math.PI*1.12)),own(new THREE.MeshBasicMaterial({color:0x07100a,fog:false})),0,-.35,0,g);hillside.rotation.x=-Math.PI/2;hillside.raycast=()=>{};
    }

    // ---------- walking ----------
    function contains(x,z){return x>x0&&x<x1&&z>z0&&z<zEnd}
    function floorAt(x,z){return contains(x,z)?0:null}
    function allowed(x,z){
      if(!contains(x,z))return false;const r=player.radius||.42;
      if(x-r<x0+.45||x+r>x1-.45||z-r<z0+.45||z+r>zEnd-.35)return false;
      return !blockers.some(b=>x+r>b.minX&&x-r<b.maxX&&z+r>b.minZ&&z-r<b.maxZ)}

    // ---------- doing things ----------
    function enter(){
      activate();move(ROOM.cx-.6,ROOM.cz+1.9,Math.PI);playSample?.('pageTurn',.35,.6);
      showNotice('Montserrat, at night: a timber house in the north of the island, a verandah, and to the south the Soufrière Hills, their dome glowing. The table is laid for St Patrick’s Day. The bottle you came through is on it, to take you back.',13);
      analytics?.track('Room Explored',{room:'montserrat'})}
    function leave(){const p=bottles?.standBefore?.('montserrat')||{x:1701,z:-2,yaw:-Math.PI/2};move(p.x,p.z,p.yaw);playSample?.('pageTurn',.35,.6);showNotice('The Long Corridor again, and the bottle back on its shelf.',4)}
    function whoop(){tone?.(185,0,.22,.05,'flute');tone?.(246,.16,.34,.05,'flute')}
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('montserrat-'))return false;
      if(data.type==='montserrat-exit'){leave();return true}
      if(data.type==='montserrat-ferns'){
        if(frog?.found){showNotice(`${CARDS.frog[0]}: ${CARDS.frog[1]}`,12);return true}
        if(!frog)return true;frog.found=true;frog.g.visible=true;try{storage?.setItem(FOUND_KEY,'1')}catch(e){}whoop();
        showNotice(`Something heavy shifts in the shadow of the last pot, and whoops. It is a frog, brown and as big as a small rabbit: a mountain chicken. ${CARDS.frog[1]}`,16);analytics?.track('Secret Found',{room:'montserrat',secret:'mountain-chicken'});return true}
      if(data.type==='montserrat-picture'){const p=PICTURES[data.picture];if(showPicture)showPicture({kicker:'MONTSERRAT',title:data.title,src:`${pictures}${p.file}.jpg`,caption:data.author,credit:p.credit});else showNotice(`${data.title}: ${data.author}`,12);return true}
      if(data.type==='montserrat-card'){showNotice(`${data.title}: ${data.author}`,data.author.length>320?18:data.author.length>160?13:9);return true}
      return false}

    // ---------- lifecycle ----------
    function activate(){if(!root)buildRoom();lastNeeded=time}
    function unload(){
      if(!root)return;root.removeFromParent();root.traverse(object=>{if(object.isLight)object.userData.freed=true});root=null;frog=null;glow=null;flame=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0}
    function update(t){
      // Built ahead while the reader stands by the bottles' shelf, so that looking in does not wait.
      time=t;const inside=contains(player.pos.x,player.pos.z),bay=bottles?.bay,near=!!bay&&Math.hypot(player.pos.x-bay.x,player.pos.z-bay.z)<3.2;
      if(inside||near&&(root||window.libraryMayBuild?.()!==false))activate();
      else if(root&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==b.userData.home.parent))unload();
      if(!inside||!root)return;
      if(glow)glow.material.opacity=.3+.1*Math.sin(t*.7)+.04*Math.sin(t*2.3);
      if(flame){const s=1+.15*Math.sin(t*11)+.08*Math.sin(t*23);flame.scale.set(1,s,1)}
      // Now and then, until it is found, the frog calls from the ferns.
      if(frog&&!frog.found&&t>nextWhoop){nextWhoop=t+40+Math.random()*30;whoop()}}
    return {contains,floorAt,allowed,interact,update,enter,leave,activate,unload,catalogue,room:ROOM,verandah:VERANDAH,groups:GROUPS,own:OWN,equiano:EQUIANO,manumission:MANUMISSION,cards:CARDS,pictures:PICTURES,
      get built(){return !!root},get books(){return books.slice()},get found(){return !!frog?.found||wasFound()},zoneAt:(x,z)=>contains(x,z)?'montserrat':null};
  };
})();
