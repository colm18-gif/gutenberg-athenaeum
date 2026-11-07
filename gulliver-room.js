// Lilliput and Brobdingnag: the first two of Gulliver's voyages, through a narrow door at the east end of the Irish Room's
// north wall (Swift was Dean of St Patrick's in Dublin when he wrote them). Two rooms, one after the other, as in the book.
//
// Lilliput (x -760, z 700) is a country at night at a twelfth of the reader's size: Mildendo inside its wall "two feet and
// a half high", the palace where the two great streets meet, lit windows, the royal park's seven-foot trees, the Blefuscu
// fleet across the channel with Gulliver's cables at the prows, the pegs and ligatures where he was tied down, and his hat.
// The Emperor's library holds the room's books, very small, under signs written aslant as the Lilliputians write. The
// secret: the Emperor's breakfast egg. Cracked at the smaller end, as the edict commands, nothing happens; at the big end,
// the forbidden books of the Big-endians are let out of the library's locked press: A Tale of a Tub (found for good,
// athenaeum-gulliver-big-end; ?bigend shows it).
//
// Through Lilliput's north door the reader comes out by a mouse-hole into Brobdingnag (x -760, z 880): one of
// Glumdalclitch's rooms, built twelve times over. The queen's joiner's reading machine stands as Swift measured it, a
// standing ladder twenty-five feet high with steps fifty feet long, ten feet from the wall where a book leans open; the
// reader climbs it and reads the page by walking along the lines. Gulliver's own chamber, sixteen feet square with
// sash-windows and its ceiling lifted off, stands on the floor, and the room's books are inside it. One lamp in each room.
// Every quotation from Swift is checked against texts/bundled-gzip/pg829.txt.gz by a test (SWIFT).
(function(){
  'use strict';

  const LIL={cx:-760,cz:700,w:22,d:18,h:5.5},BROB={cx:-760,cz:880,w:44,d:36,h:22};
  // The library's own copies, before the new arrivals for each shelf (data/new-books.js, rooms lilliput-* and brob-*).
  const OWN={swift:[],small:[1018],giants:[1200,7439,902],seeing:[15491,19942,1906,2130],life:[829],bigend:[]};
  const GROUPS={
    lilliput:[{key:'swift',name:'THE DEAN AND HIS FRIENDS',sub:'Swift and the Scriblerus Club',max:10},{key:'small',name:'SMALL FOLK',sub:'Very small people',max:6}],
    brob:[{key:'giants',name:'GIANTS',sub:'Very large people',wall:'west',max:10},{key:'life',name:'THE DEAN',sub:'Swift, his Ireland, and Gulliver’s heirs',wall:'north',max:10},
      {key:'seeing',name:'SEEN LARGE',sub:'The microscope, and the view from above',wall:'east',max:10}]
  };
  // Swift's words, from Gulliver's Travels. Each must be found, word for word, in the bundled text.
  const SWIFT={
    edict:'the emperor his father published an edict, commanding all his subjects, upon great penalties, to break the smaller end of their eggs',
    computed:'It is computed that eleven thousand persons have at several times suffered death, rather than submit to break their eggs at the smaller end.',
    forbidden:'Many hundred large volumes have been published upon this controversy: but the books of the Big-endians have been long forbidden',
    wall:'The wall which encompassed it is two feet and a half high',
    stepped:'I stepped over the great western gate, and passed very gently, and sidling, through the two principal streets',
    palace:'The emperor’s palace is in the centre of the city where the two great streets meet.',
    fastened:'I found my arms and legs were strongly fastened on each side to the ground',
    ligatures:'I likewise felt several slender ligatures across my body, from my arm-pits to my thighs.',
    hat:'a great black substance lying on the ground, very oddly shaped, extending its edges round, as wide as his majesty’s bedchamber, and rising up in the middle as high as a man',
    fleet:'the enemy’s fleet at anchor, consisting of about fifty men of war',
    cable:'The cable was about as thick as packthread',
    channel:'parted only by a channel of eight hundred yards wide',
    trees:'Their tallest trees are about seven feet high: I mean some of those in the great royal park, the tops whereof I could but just reach with my fist clenched.',
    aslant:'aslant, from one corner of the paper to the other, like ladies in England',
    rats:'two rats crept up the curtains, and ran smelling backwards and forwards on the bed',
    library:'their libraries are not very large; for that of the king, which is reckoned the largest, does not amount to above a thousand volumes, placed in a gallery of twelve hundred feet long',
    machine:'a kind of wooden machine five-and-twenty feet high, formed like a standing ladder; the steps were each fifty feet long',
    reading:'The book I had a mind to read, was put up leaning against the wall: I first mounted to the upper step of the ladder, and turning my face towards the book, began at the top of the page, and so walking to the right and left about eight or ten paces, according to the length of the lines',
    treatise:'a little old treatise, which always lay in Glumdalclitch’s bed chamber',
    giants:'it was very reasonable to think, not only that the species of men were originally much larger, but also that there must have been giants in former ages',
    chamber:'a wooden chamber of sixteen feet square, and twelve high, with sash-windows, a door, and two closets, like a London bed-chamber',
    ceiling:'The board, that made the ceiling, was to be lifted up and down by two hinges',
    corn:'whoever could make two ears of corn, or two blades of grass, to grow upon a spot of ground where only one grew before, would deserve better of mankind',
    vermin:'the most pernicious race of little odious vermin that nature ever suffered to crawl upon the surface of the earth'
  };
  const q=key=>`“${SWIFT[key].charAt(0).toUpperCase()}${SWIFT[key].slice(1)}${/[.!?]$/.test(SWIFT[key])?'':'.'}”`;
  const CARDS={
    door:['Lilliput and Brobdingnag','The first two of Gulliver’s four voyages: a country at a twelfth of your size, and then one at twelve times it. Swift was Dean of St Patrick’s in Dublin when he wrote them; the book came out in London in 1726.'],
    lilSign:['Lilliput','You are the Man-Mountain here. Mildendo is on your left, the Emperor’s library ahead, and the Blefuscu fleet out on the water to the east. Walk gently.'],
    wall:['The wall of Mildendo',`${q('wall')} Gulliver went into the city the only way he could: ${q('stepped')}`],
    palace:['The Emperor’s palace',q('palace')],
    ligatures:['Where he was tied down',`Gulliver woke on his back on the shore after the wreck: ${q('fastened')} ${q('ligatures')}`],
    hat:['Gulliver’s hat','Lost in the wreck and found by riders, who reported to the Emperor “'+SWIFT.hat+'.” Gulliver had it fetched, and it was dragged to him by horses, with two holes in the brim.'],
    fleet:['The fleet of Blefuscu',`Blefuscu is an island to the north-east, ${SWIFT.channel}. Gulliver waded out to ${SWIFT.fleet}, fastened a hook to every prow, and towed them home. ${q('cable')}`],
    trees:['The royal park',q('trees')],
    aslant:['Lilliputian writing',`The signs here are written as the Lilliputians write: not from left to right, nor from right to left, nor up and down, but ${q('aslant')}`],
    breakfast:['The Emperor’s breakfast',`A Lilliputian egg, boiled and waiting. Since a prince cut his finger opening one at the big end, ${SWIFT.edict}. ${q('computed')}`],
    press:['A locked press','The bottom shelf of the Emperor’s library has a press of its own, with a padlock smaller than a grain of rice. Something is kept in it that the law does not allow on the shelves.'],
    brobSign:['Brobdingnag','One of Glumdalclitch’s rooms, at twelve times your size. The queen’s joiner’s reading machine is against the far wall; Gulliver’s own chamber stands on the floor, and the room’s books are in it.'],
    mousehole:['A mouse-hole','The way back to Lilliput, low in the wainscot. Gulliver’s first night in Brobdingnag, '+SWIFT.rats+'; he killed one with his hanger and the other ran off.'],
    machine:['The reading machine',`${q('library')} Gulliver could borrow what he liked, and to read them the queen’s joiner made ${SWIFT.machine}. Climb it.`],
    book:['A book leaning against the wall',`${q('reading')}. This is ${SWIFT.treatise}, a book of morality on the weakness of humankind.`],
    top:['The top of the page',`Now walk along the lines. The old treatise argues that men have dwindled, that ${SWIFT.giants}; Gulliver thought the same complaint was made in every country, by people of every size.`],
    chamber:['Gulliver’s chamber',`Made for him by the queen’s cabinet-maker: ${SWIFT.chamber}. ${q('ceiling')} It is lifted off now; go in.`],
    table:['A table','A table in Glumdalclitch’s room. Gulliver was often set on one, among the salt-cellars and the bread, to walk about at dinner.'],
    king:['The King of Brobdingnag','Gulliver told the King all about England, its parliament, its courts and its wars, and the King concluded that its people were '+SWIFT.vermin+'. The King’s own opinion was that '+SWIFT.corn+'.']
  };

  window.createGulliverRoom=function(options){
    const {THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,arrivals={},showNotice,playSample,move,analytics,isHolding=()=>false,registerSeat=null,doorKit=null,storage=window.localStorage,
      irishRoom={cx:-330,cz:-205,w:16,d:14}}=options;
    // At the east end of the Irish Room's north wall, between the writers' shelves and the corner, facing into the room.
    const DOOR={x:irishRoom.cx+6.85,z:irishRoom.cz-irishRoom.d/2+.2,yaw:0};
    const PRELOAD=7,KEEP=25,STEP_RISE=.38,STEP_TREAD=.55,STEPS=20,MACHINE_GAP=3.05,MACHINE_LENGTH=15;
    const LOOK={style:'painted',color:0x6b4a2a,fanColor:0xffd08a,width:1.3,height:2.9};
    const through=(data,go)=>doorKit&&data.kit?doorKit.pass(data.kit,data,go):go();
    const FOUND_KEY='athenaeum-gulliver-big-end';
    const wasFound=()=>{try{return storage?.getItem(FOUND_KEY)==='1'||/[?&]bigend\b/.test(location.search)}catch(e){return false}};
    let root=null,time=0,lastNeeded=-1e9,egg=null,lamps=[];
    const owned=[],ours=[],books=[],blockers=[],cityRule={};
    const own=thing=>{owned.push(thing);return thing};
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    function markDoor(object,data){object.userData=data;interactables.push(object);return object}
    function block(room,x,z,w,d){blockers.push({room,minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const card=key=>({type:'gulliver-card',title:CARDS[key][0],author:CARDS[key][1],action:'READ'});
    const std=(color,extra={})=>own(new THREE.MeshStandardMaterial({color,roughness:.85,...extra}));
    // A sign. In Lilliput the words run aslant, from one corner to the other.
    function sign(parent,text,sub,w,h,{aslant=false,ink='#2a1d10',paper='#efe4c8'}={}){
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle=paper;c.fillRect(0,0,W,H);c.strokeStyle=ink;c.lineWidth=4;c.strokeRect(6,6,W-12,H-12);
        c.save();c.translate(W/2,H/2);if(aslant)c.rotate(-Math.atan2(H-40,W-40)*.55);c.fillStyle=ink;c.textAlign='center';
        c.font=`bold ${aslant?26:30}px Georgia`;c.fillText(text,0,sub?-8:10);if(sub){c.font=`italic ${aslant?18:21}px Georgia`;c.fillText(sub,0,24)}c.restore()},560,sub?120:76));
      return add(own(new THREE.PlaneGeometry(w,h)),own(new THREE.MeshStandardMaterial({map,emissive:0x3a3020,emissiveIntensity:.3,roughness:.9})),0,0,0,parent);
    }
    const shelfBooks=(key,max)=>[...new Set([...(OWN[key]||[]),...(arrivals[key]||[])])].map(id=>findBook(id)).filter(Boolean).slice(0,max);
    function catalogue(){
      const pick=list=>list.map(group=>({...group,books:shelfBooks(group.key,group.max)}));
      return {lilliput:pick(GROUPS.lilliput),brob:pick(GROUPS.brob),bigend:shelfBooks('bigend',1)};
    }
    function placeBook(book,{x,y,z,yaw},geometry,shelf,parent=root){
      const mesh=add(geometry,own(bookMaterial(book)),x,y,z,parent);mesh.rotation.order='YXZ';mesh.rotation.y=yaw;mesh.rotation.x=-.08;
      mesh.userData={type:'book',book,loaded:false,gulliver:true,shelf,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent}};
      interactables.push(mesh);ours.push(mesh);books.push(mesh);return mesh;
    }

    // ---------- the door, in the Irish Room ----------
    function buildDoor(){
      const g=new THREE.Group();g.name='gulliver-door';g.position.set(DOOR.x,0,DOOR.z);g.rotation.y=DOOR.yaw;scene.add(g);
      const data={type:'gulliver-door',title:CARDS.door[0],author:CARDS.door[1],action:'ENTER'};
      if(!doorKit?.hang(g,{data,mark:markDoor,...LOOK,...doorKit.readingRoom?.('LILLIPUT','Brobdingnag beyond'),width:1.3,height:2.9,cornice:false}))markDoor(add(new THREE.BoxGeometry(1.3,2.9,.14),new THREE.MeshStandardMaterial({color:LOOK.color,roughness:.7}),0,1.45,.08,g),data);
    }

    // ---------- Lilliput ----------
    function buildLilliput(){
      const {cx,cz,w,d,h}=LIL,g=new THREE.Group();g.name='lilliput';root.add(g);
      // The floor is the country: fields, hedges and roads, by moonlight. The walls are the night sky over it.
      const fields=own(canvasTexture((c,W,H)=>{c.fillStyle='#24361f';c.fillRect(0,0,W,H);const tones=['#2b4126','#30472a','#263b22','#35492b','#2e3f24'];
        for(let y=0;y<H;y+=48)for(let x=0;x<W;x+=48){c.fillStyle=tones[(x*7+y*13)/48%5|0];c.fillRect(x+2,y+2,44,44);c.strokeStyle='#1a2a17';c.lineWidth=3;c.strokeRect(x+1,y+1,46,46)}
        c.fillStyle='#5a5240';c.fillRect(W/2-5,0,10,H);c.fillRect(0,H*.62,W,8)},512,512));
      fields.wrapS=fields.wrapT=THREE.RepeatWrapping;fields.repeat?.set?.(w/6,d/6);
      box(w,.3,d,std(0x6f7a5a,{map:fields,roughness:1}),cx,-.15,cz,g);
      const sky=own(canvasTexture((c,W,H)=>{const grad=c.createLinearGradient(0,0,0,H);grad.addColorStop(0,'#050914');grad.addColorStop(.7,'#16233a');grad.addColorStop(1,'#26344a');c.fillStyle=grad;c.fillRect(0,0,W,H);
        c.fillStyle='#e8ecff';for(let i=0;i<220;i++){const x=(i*97)%W,y=((i*61)%(H*.62));c.globalAlpha=.3+(i%5)*.14;c.fillRect(x,y,i%7?1:2,i%7?1:2)}c.globalAlpha=1;
        c.fillStyle='#0c1410';c.beginPath();c.moveTo(0,H);for(let x=0;x<=W;x+=32)c.lineTo(x,H*.8-Math.sin(x*.013)*18-Math.sin(x*.041)*9);c.lineTo(W,H);c.fill()},1024,256));
      const skyMat=own(new THREE.MeshStandardMaterial({map:sky,emissive:0xffffff,emissiveMap:sky,emissiveIntensity:.55,roughness:1}));
      box(w,h,.3,skyMat,cx,h/2,cz-d/2,g);box(w,h,.3,skyMat,cx,h/2,cz+d/2,g);box(.3,h,d,skyMat,cx-w/2,h/2,cz,g);box(.3,h,d,skyMat,cx+w/2,h/2,cz,g);
      box(w,.2,d,std(0x070b16,{roughness:1}),cx,h+.1,cz,g);
      // A moon on the east wall, over Blefuscu.
      add(own(new THREE.CircleGeometry(.42,28)),own(new THREE.MeshBasicMaterial({color:0xf3eed8})),cx+w/2-.17,h-1.1,cz-3.5,g).rotation.y=-Math.PI/2;
      mark(sign(placeAt(g,cx-2.2,1.5,cz+d/2-.18,Math.PI),'LILLIPUT','You are the Man-Mountain',1.5,.32,{aslant:true}),card('lilSign'));
      buildMildendo(g,cx-5,cz-1.6);
      buildShore(g,cx+w/2,cz);
      buildPark(g,cx+3.4,cz+4.6);
      buildLigatures(g,cx-6.4,cz+6);
      buildHat(g,cx-2.9,cz+6.6);
      buildEmperorsLibrary(g,cx,cz-d/2);
      // One lamp, high over the city, like the moon's own light.
      const lamp=new THREE.PointLight(0xc8d4ff,9,30,1.6);lamp.position.set(cx-1,h-.6,cz);g.add(lamp);lamps.push(lamp);
      // The door back to the Irish Room, and the door on to Brobdingnag.
      const back={type:'gulliver-exit',title:'Back to the Irish Room',author:'Out of Lilliput, the way you came.',action:'RETURN'};
      if(!doorKit?.hang(g,{data:back,mark,x:cx,z:cz+d/2-.2,yaw:Math.PI,label:'THE IRISH ROOM',own,...LOOK}))mark(box(1.3,2.9,.16,std(LOOK.color),cx,1.45,cz+d/2-.2,g),back);
      const on={type:'gulliver-onward',title:'Brobdingnag',author:'On to the second voyage: a country where you are the size of a Lilliputian.',action:'ENTER'};
      if(!doorKit?.hang(g,{data:on,mark,x:cx,z:cz-d/2+.2,yaw:0,label:'BROBDINGNAG',own,...LOOK}))mark(box(1.3,2.9,.16,std(LOOK.color),cx,1.45,cz-d/2+.2,g),on);
    }
    const placeAt=(parent,x,y,z,yaw=0)=>{const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=yaw;parent.add(g);return g};
    // Mildendo: a square wall with towers, two great streets crossing at the palace, and houses of three to five stories
    // with lit windows, all instanced. The reader may walk only in the streets and the palace court, as Gulliver did.
    function buildMildendo(g,x,z){
      const S=4,STREET=.78,COURT=1.75,KEEP_HALF=.72;Object.assign(cityRule,{x,z,S,STREET,COURT,KEEP_HALF});
      const stone=std(0x8a8476,{roughness:.95}),tower=std(0x7a7466,{roughness:.95}),wallParts=[];
      for(const side of [-1,1]){
        for(const [a,b] of [[-S,-STREET-.15],[STREET+.15,S]]){const len=b-a,mid=(a+b)/2;
          wallParts.push(box(len,.76,.26,stone,x+mid,.38,z+side*S,g),box(.26,.76,len,stone,x+side*S,.38,z+mid,g))}
        // A gate over each street where it passes through the wall: the great western gate is the one Gulliver stepped over.
        wallParts.push(box(.3,.3,STREET*2+.3,tower,x+side*S,.9,z,g),box(STREET*2+.3,.3,.3,tower,x,.9,z+side*S,g));
      }
      const towerGeo=own(new THREE.CylinderGeometry(.2,.22,1.05,8)),towers=[];
      for(let t=-S;t<=S+.01;t+=S/2.5)for(const [tx,tz] of [[t,-S],[t,S],[-S,t],[S,t]])if(Math.abs(t)>STREET+.2||Math.abs(Math.abs(t)-S)<.01)towers.push([tx,tz]);
      const tm=new THREE.InstancedMesh(towerGeo,tower,towers.length),m4=new THREE.Matrix4();towers.forEach(([tx,tz],i)=>{m4.makeTranslation(x+tx,.52,z+tz);tm.setMatrixAt(i,m4)});g.add(tm);
      const wallData=card('wall');for(const part of wallParts)mark(part,wallData);mark(tm,wallData);
      // Houses, in the four quarters between the streets and outside the palace wall.
      const windows=own(canvasTexture((c,W,H)=>{c.fillStyle='#c9bda2';c.fillRect(0,0,W,H);for(let y=6;y<H-4;y+=16)for(let x=5;x<W-4;x+=12){c.fillStyle=((x*3+y*7)%5)<2?'#ffcf72':'#2c2a26';c.fillRect(x,y,6,9)}},64,128));
      const houseMat=own(new THREE.MeshStandardMaterial({map:windows,emissive:0xffffff,emissiveMap:windows,emissiveIntensity:.28,roughness:.9})),roofMat=std(0x5b2f24);
      const spots=[];for(const qx of [-1,1])for(const qz of [-1,1])for(let i=0;i<5;i++)for(let j=0;j<5;j++){
        const hx=qx*(STREET+.42+i*.62),hz=qz*(STREET+.42+j*.62);if(Math.abs(hx)>S-.3||Math.abs(hz)>S-.3)continue;if(Math.abs(hx)<COURT+.35&&Math.abs(hz)<COURT+.35)continue;
        spots.push([hx,hz,.6+((i*3+j*5+qx+qz*2)&3)*.13])}
      const houseGeo=own(new THREE.BoxGeometry(.48,1,.48)),roofGeo=own(new THREE.ConeGeometry(.36,.3,4));
      const houses=new THREE.InstancedMesh(houseGeo,houseMat,spots.length),roofs=new THREE.InstancedMesh(roofGeo,roofMat,spots.length),q4=new THREE.Quaternion(),scale=new THREE.Vector3(),pos=new THREE.Vector3(),turn=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),Math.PI/4);
      spots.forEach(([hx,hz,hh],i)=>{houses.setMatrixAt(i,m4.compose(pos.set(x+hx,hh/2,z+hz),q4.identity(),scale.set(1,hh,1)));roofs.setMatrixAt(i,m4.compose(pos.set(x+hx,hh+.15,z+hz),turn,scale.set(1,1,1)))});
      g.add(houses,roofs);mark(houses,{type:'gulliver-card',title:'Mildendo',author:'The metropolis of Lilliput. The houses are from three to five stories, as Gulliver found them; he passed through the streets in his short waistcoat, for fear of the skirts of his coat.',action:'READ'});
      // The palace, in its own wall two feet high, at the crossing.
      for(const side of [-1,1]){box(COURT*2,.6,.18,stone,x,.3,z+side*COURT,g);box(.18,.6,COURT*2,stone,x+side*COURT,.3,z,g)}
      const gold=MAT.brass||std(0xc8a050,{metalness:.6,roughness:.4}),keep=box(KEEP_HALF*2,1.2,KEEP_HALF*2,std(0xd6cdb6),x,.6,z,g);
      for(const tx of [-1,1])for(const tz of [-1,1]){add(own(new THREE.CylinderGeometry(.14,.15,1.6,8)),std(0xd6cdb6),x+tx*KEEP_HALF,.8,z+tz*KEEP_HALF,g);add(own(new THREE.ConeGeometry(.18,.4,8)),gold,x+tx*KEEP_HALF,1.8,z+tz*KEEP_HALF,g)}
      const dome=add(own(new THREE.SphereGeometry(.5,16,8,0,Math.PI*2,0,Math.PI/2)),gold,x,1.2,z,g);
      for(const part of [keep,dome])mark(part,card('palace'));
    }
    function inCity(x,z){const r=cityRule;return r.S&&Math.abs(x-r.x)<r.S+.6&&Math.abs(z-r.z)<r.S+.6}
    function cityAllows(x,z){
      const r=cityRule,dx=Math.abs(x-r.x),dz=Math.abs(z-r.z),rad=Math.min(player.radius||.42,.3);
      if(dx<r.KEEP_HALF+rad&&dz<r.KEEP_HALF+rad)return false;
      if(dx<r.COURT&&dz<r.COURT)return true;
      return dx<r.STREET-rad||dz<r.STREET-rad;
    }
    // The shore to the east, the channel, and the fleet of Blefuscu with Gulliver's cables at the prows.
    function buildShore(g,eastX,z){
      const seaTex=own(canvasTexture((c,W,H)=>{c.fillStyle='#0f2236';c.fillRect(0,0,W,H);c.strokeStyle='rgba(170,200,230,.22)';c.lineWidth=2;for(let i=0;i<60;i++){const y=(i*37)%H,x=(i*53)%W;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+10,y-4,x+20,y);c.stroke()}},256,256));
      seaTex.wrapS=seaTex.wrapT=THREE.RepeatWrapping;seaTex.repeat?.set?.(1,3);
      const sea=add(own(new THREE.PlaneGeometry(4.6,LIL.d-.3)),own(new THREE.MeshStandardMaterial({map:seaTex,emissive:0x0a1a2c,emissiveIntensity:.6,roughness:.25,metalness:.1})),eastX-2.45,.012,z,g);sea.rotation.x=-Math.PI/2;
      const sand=add(own(new THREE.PlaneGeometry(.7,LIL.d-.3)),std(0x8c7f5e,{roughness:1}),eastX-5.05,.008,z,g);sand.rotation.x=-Math.PI/2;
      mark(sea,{type:'gulliver-card',title:'The channel',author:`Blefuscu is an island to the north-east of Lilliput, ${SWIFT.channel}. Gulliver waded it; you may too, as far as the fleet.`,action:'READ'});
      // Fifty men of war, hulls and masts instanced, at anchor in rows.
      const hull=own(new THREE.BoxGeometry(.13,.07,.42)),mast=own(new THREE.CylinderGeometry(.008,.008,.34,4)),sail=own(new THREE.PlaneGeometry(.16,.18));
      const hulls=new THREE.InstancedMesh(hull,std(0x3d2a1a),50),masts=new THREE.InstancedMesh(mast,std(0x2a1c10),50),sails=new THREE.InstancedMesh(sail,own(new THREE.MeshStandardMaterial({color:0xe8e0c8,side:THREE.DoubleSide,roughness:.9})),50);
      const m4=new THREE.Matrix4(),q4=new THREE.Quaternion(),one=new THREE.Vector3(1,1,1),pos=new THREE.Vector3(),cableEnds=[];
      for(let i=0;i<50;i++){const sx=eastX-1.3-(i%5)*.36-((i/5|0)%2)*.12,sz=z-6.6+(i/5|0)*1.35+(i%3)*.12,yaw=-.15+(i%4)*.08;q4.setFromAxisAngle(new THREE.Vector3(0,1,0),yaw);
        hulls.setMatrixAt(i,m4.compose(pos.set(sx,.045,sz),q4,one));masts.setMatrixAt(i,m4.compose(pos.set(sx,.24,sz),q4,one));sails.setMatrixAt(i,m4.compose(pos.set(sx,.26,sz),q4,one));cableEnds.push([sx,sz])}
      g.add(hulls,masts,sails);const fleetData=card('fleet');for(const part of [hulls,masts,sails])mark(part,fleetData);
      // The cables, gathered from the prows towards the shore, where Gulliver stood to tow them.
      const pts=[];for(const [sx,sz] of cableEnds)pts.push(sx-.06,.06,sz-.18,eastX-4.15,.05,z+(sz-z)*.25);
      const geo=own(new THREE.BufferGeometry());geo.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));g.add(new THREE.LineSegments(geo,own(new THREE.LineBasicMaterial({color:0xcdbf98,transparent:true,opacity:.7}))));
      block('lilliput',eastX-1.95,z,1.9,LIL.d);
      // Blefuscu's coast, low on the east wall, with a few lights.
      const coast=own(canvasTexture((c,W,H)=>{c.clearRect(0,0,W,H);c.fillStyle='#0b120f';c.beginPath();c.moveTo(0,H);for(let x=0;x<=W;x+=16)c.lineTo(x,H*.45-Math.sin(x*.02)*10);c.lineTo(W,H);c.fill();c.fillStyle='#ffd27a';for(let i=0;i<14;i++)c.fillRect(20+i*67%W,H*.6+(i*13)%20,3,3)},512,64));
      const strip=add(own(new THREE.PlaneGeometry(LIL.d-.6,.7)),own(new THREE.MeshBasicMaterial({map:coast,transparent:true})),eastX-.17,.55,z,g);strip.rotation.y=-Math.PI/2;
      mark(strip,{type:'gulliver-card',title:'Blefuscu',author:`The empire across the channel, at war with Lilliput over the eggs. ${q('forbidden')} The Big-endian exiles fled there.`,action:'READ'});
    }
    // The royal park: Lilliput's tallest trees, seven feet high, a grove the reader can just reach the tops of.
    function buildPark(g,x,z){
      const spots=[[0,0,2.1],[-.9,.6,1.8],[.9,-.5,1.95],[-.3,-1.2,1.7],[1.1,1,1.6],[-1.2,-.4,1.9],[.3,1.3,1.75]];
      const trunk=own(new THREE.CylinderGeometry(.05,.07,1,6)),crown=own(new THREE.ConeGeometry(.42,1,9));
      const trunks=new THREE.InstancedMesh(trunk,std(0x3b2a1c),spots.length),crowns=new THREE.InstancedMesh(crown,std(0x1d3a22),spots.length),m4=new THREE.Matrix4(),q4=new THREE.Quaternion(),pos=new THREE.Vector3(),sc=new THREE.Vector3();
      spots.forEach(([dx,dz,ht],i)=>{trunks.setMatrixAt(i,m4.compose(pos.set(x+dx,ht*.2,z+dz),q4,sc.set(1,ht*.4,1)));crowns.setMatrixAt(i,m4.compose(pos.set(x+dx,ht*.4+ht*.3,z+dz),q4,sc.set(1,ht*.6,1)));block('lilliput',x+dx,z+dz,.3,.3)});
      g.add(trunks,crowns);const data=card('trees');mark(trunks,data);mark(crowns,data);
    }
    // The pegs and threads on the shore, round the shape of a man lying on his back.
    function buildLigatures(g,x,z){
      const outline=[];const add2=(a,b)=>outline.push(a,b);
      // Head, shoulders, arms out, body, legs: points (x along the body, z across), joined by threads to pegs either side.
      const pegs=[];for(let i=0;i<14;i++){const along=-.85+i*.13;const half=i<2?.13:i<5?.32:i<8?.2:.16;pegs.push([along,-half-.06],[along,half+.06])}
      for(let i=-4;i<=4;i++)pegs.push([-.95,i*.05]);// the hair, tied down too
      const peg=own(new THREE.CylinderGeometry(.008,.008,.06,4)),pm=new THREE.InstancedMesh(peg,std(0x6a5236),pegs.length),m4=new THREE.Matrix4();
      pegs.forEach(([a,b],i)=>{m4.makeTranslation(x+a,.03,z+b);pm.setMatrixAt(i,m4)});g.add(pm);
      for(let i=0;i<pegs.length-9;i+=2)add2([x+pegs[i][0],.05,z+pegs[i][1]],[x+pegs[i+1][0],.05,z+pegs[i+1][1]]);
      const pts=outline.flat(),geo=own(new THREE.BufferGeometry());geo.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));
      const threads=new THREE.LineSegments(geo,own(new THREE.LineBasicMaterial({color:0xd8ccaa})));g.add(threads);
      // A pale hollow in the grass where he lay, the thing to look at.
      const hollow=add(own(new THREE.PlaneGeometry(1.9,.7)),own(new THREE.MeshStandardMaterial({color:0x4c5a3a,roughness:1,transparent:true,opacity:.85})),x,.006,z,g);hollow.rotation.x=-Math.PI/2;
      mark(hollow,card('ligatures'));mark(pm,card('ligatures'));
    }
    function buildHat(g,x,z){
      const felt=std(0x141210,{roughness:.95}),brim=add(own(new THREE.CylinderGeometry(.42,.44,.03,24)),felt,x,.02,z,g),crown=add(own(new THREE.CylinderGeometry(.21,.24,.24,20)),felt,x,.16,z,g);
      for(const part of [brim,crown])mark(part,card('hat'));block('lilliput',x,z,.8,.8);
    }
    // The Emperor's library along the north wall, either side of the door on to Brobdingnag: two low colonnaded cases
    // of very small books, and below the west one a locked press. Before it, the Emperor's breakfast.
    function buildEmperorsLibrary(g,cx,northZ){
      const {lilliput,bigend}=catalogue(),stone=std(0xd8cfba,{roughness:.9}),wood=MAT.darkWood||std(0x3a2a1c);
      const geometry=own(new THREE.BoxGeometry(.14,.2,.03)),TIERS=[.62,.95];
      const cases=[{group:lilliput[0],from:cx-8.2,to:cx-1.4},{group:lilliput[1],from:cx+1.4,to:cx+5.6}];
      for(const {group,from,to} of cases){
        const len=to-from,mid=(from+to)/2,z=northZ+.45;
        box(len,.3,.5,stone,mid,.15,z,g);box(len,.08,.5,stone,mid,1.22,z,g);box(len,1.2,.05,wood,mid,.7,northZ+.22,g);
        for(let i=0;i<=Math.round(len/.45);i++)add(own(new THREE.CylinderGeometry(.03,.035,.9,8)),stone,from+i*len/Math.round(len/.45),.75,z+.22,g);
        for(const y of TIERS)box(len-.1,.02,.32,wood,mid,y-.11,z,g);
        const per=Math.ceil(group.books.length/TIERS.length)||1,step=Math.min(.32,(len-.4)/per);
        group.books.forEach((book,i)=>{const row=Math.floor(i/per),col=i%per,n=Math.min(per,group.books.length-row*per);placeBook(book,{x:mid+(col-(n-1)/2)*step,y:TIERS[row],z:z-.02,yaw:0},geometry,group.key,g)});
        const label=sign(placeAt(g,mid,1.5,northZ+.17),group.name,group.sub,Math.min(2.6,len-.4),.5,{aslant:true});mark(label,{type:'gulliver-card',title:CARDS.aslant[0],author:`${group.name.charAt(0)+group.name.slice(1).toLowerCase()}: ${group.sub}. ${CARDS.aslant[1]}`,action:'READ'});
        block('lilliput',mid,z,len+.1,.6);
      }
      // The press under the west case: a little door with a padlock. Its book is the forbidden one.
      const pressX=cx-2.3,pressZ=northZ+.72,press=placeAt(g,pressX,.15,pressZ);
      const pressDoor=box(.5,.26,.03,std(0x4a2e1c),0,0,0,press),lock=add(own(new THREE.BoxGeometry(.03,.035,.015)),MAT.brass||std(0xc8a050),.12,0,.02,press);
      mark(pressDoor,card('press'));mark(lock,card('press'));
      let tub=null;if(bigend[0]){tub=placeBook(bigend[0],{x:pressX,y:.37,z:pressZ+.02,yaw:0},geometry,'bigend',g);tub.visible=false;const i=interactables.indexOf(tub);if(i>=0)interactables.splice(i,1);books.splice(books.indexOf(tub),1)}
      // The Emperor's breakfast, on a little table before the press: an egg on its dish, its two ends to choose between.
      const table=placeAt(g,cx-4.4,0,northZ+1.55);box(.7,.04,.42,wood,0,.62,0,table);for(const lx of [-.3,.3])for(const lz of [-.17,.17])box(.03,.6,.03,wood,lx,.3,lz,table);
      add(own(new THREE.CylinderGeometry(.11,.09,.015,20)),std(0xf0ebe0,{roughness:.4}),0,.65,0,table);
      const shell=std(0xf3ead6,{roughness:.6}),eggGroup=placeAt(table,0,.7,0);eggGroup.rotation.z=Math.PI/2;
      const big=add(own(new THREE.SphereGeometry(.05,16,10,0,Math.PI*2,Math.PI/2,Math.PI/2)),shell,0,0,0,eggGroup);big.scale.set(1,1.15,1);
      const small=add(own(new THREE.SphereGeometry(.05,16,10,0,Math.PI*2,0,Math.PI/2)),shell,0,0,0,eggGroup);small.scale.set(1,1.55,1);
      eggGroup.position.x=-.04;
      mark(big,{type:'gulliver-egg',end:'big',title:'The Emperor’s breakfast egg: the big end',author:`${CARDS.breakfast[1]}`,action:'BREAK THE BIG END'});
      mark(small,{type:'gulliver-egg',end:'small',title:'The Emperor’s breakfast egg: the smaller end',author:`${CARDS.breakfast[1]}`,action:'BREAK THE SMALL END'});
      const edict=sign(placeAt(table,0,.9,-.16),'THE EDICT','Break the smaller end',.42,.1,{aslant:true});mark(edict,card('breakfast'));
      block('lilliput',cx-4.4,northZ+1.55,.8,.5);
      egg={big,small,eggGroup,pressDoor,lock,tub,found:false};
      if(wasFound())openPress(true);
    }
    function openPress(quiet){
      if(!egg||egg.found)return;egg.found=true;
      egg.big.visible=false;egg.pressDoor.rotation.y=0;egg.pressDoor.position.set(-.27,0,.2);egg.pressDoor.rotation.y=-1.3;egg.lock.visible=false;
      const open={type:'gulliver-card',title:'The press, unlocked',author:`${q('forbidden')} Here is one of them, out of its press at last.`,action:'READ'};egg.pressDoor.userData=open;egg.lock.userData=open;
      egg.big.userData={type:'gulliver-card',title:'The egg, broken at the big end',author:'The heresy is committed. Nobody has come.',action:'READ'};
      if(egg.tub){egg.tub.visible=true;interactables.push(egg.tub);books.push(egg.tub)}
      if(!quiet)playSample?.('doorOpen',.35,1.6);
    }

    // ---------- Brobdingnag ----------
    function buildBrobdingnag(){
      const {cx,cz,w,d,h}=BROB,g=new THREE.Group();g.name='brobdingnag';root.add(g);
      // Floorboards a foot and a half wide, times twelve; a dark wainscot ten metres high, plaster above, and a ceiling lost in shadow.
      const boards=own(canvasTexture((c,W,H)=>{for(let x=0;x<W;x+=64){c.fillStyle=['#5e4128','#674830','#583c25','#6c4c31'][(x/64)%4];c.fillRect(x,0,64,H);c.fillStyle='rgba(0,0,0,.35)';c.fillRect(x,0,3,H);
        c.strokeStyle='rgba(40,24,12,.35)';c.lineWidth=2;for(let k=0;k<6;k++){c.beginPath();c.moveTo(x+10+k*8,0);c.bezierCurveTo(x+4+k*9,H*.3,x+20+k*7,H*.6,x+12+k*8,H);c.stroke()}}},512,512));
      boards.wrapS=boards.wrapT=THREE.RepeatWrapping;boards.repeat?.set?.(w/14,d/14);
      box(w,.3,d,std(0x9a7a58,{map:boards}),cx,-.15,cz,g);box(w,.3,d,std(0x1c140e,{roughness:1}),cx,h+.15,cz,g);
      const plaster=std(0x9d917a,{roughness:1}),panel=std(0x4a3220,{roughness:.8,map:MAT.darkWood?.map||null});
      for(const [x,z,ww,dd] of [[cx,cz-d/2,w,.4],[cx,cz+d/2,w,.4],[cx-w/2,cz,.4,d],[cx+w/2,cz,.4,d]]){box(ww,h,dd,plaster,x,h/2,z,g);
        const inward=ww>dd?(z<cz?1:-1):(x<cx?1:-1),px=ww>dd?x:x+inward*.4,pz=ww>dd?z+inward*.4:z;box(ww>dd?ww-.8:.5,10,ww>dd?.5:dd-.8,panel,px,5,pz,g);box(ww>dd?ww-.8:.9,.8,ww>dd?.9:dd-.8,panel,px+(ww>dd?0:inward*.2),10.2,pz+(ww>dd?inward*.2:0),g)}
      mark(sign(placeAt(g,cx-5,2.6,cz+d/2-.66,Math.PI),'BROBDINGNAG','One of Glumdalclitch’s rooms',2.6,.56,{paper:'#e9dfc6'}),card('brobSign'));
      // The mouse-hole in the south wainscot: the way back to Lilliput.
      const hole=new THREE.Shape();hole.moveTo(-.9,0);hole.lineTo(-.9,1.5);hole.absarc(0,1.5,.9,Math.PI,0,true);hole.lineTo(.9,0);hole.lineTo(-.9,0);
      const mouth=add(own(new THREE.ShapeGeometry(hole)),own(new THREE.MeshBasicMaterial({color:0x050302})),cx,0,cz+d/2-.66,g);mouth.rotation.y=Math.PI;
      mark(mouth,{type:'gulliver-back',title:CARDS.mousehole[0],author:CARDS.mousehole[1],action:'CREEP THROUGH'});
      buildMachine(g,cx,cz-d/2+.4);
      buildChamber(g,cx-11,cz+5);
      buildTable(g,cx+12,cz+3);
      // One lamp, the candle on the table, high over the floor.
      const lamp=new THREE.PointLight(0xffc27a,70,80,1.25);lamp.position.set(cx+12,17.5,cz+3);g.add(lamp);lamps.push(lamp);
    }
    // The reading machine: a standing ladder 7.6 m (twenty-five feet) high, steps 15 m (fifty feet) long, its lowest end
    // three metres (ten feet) from the wall, and the book leaning open against the wall behind it.
    function buildMachine(g,cx,wallZ){
      const wood=std(0x8a6a44,{roughness:.75,map:MAT.wood?.map||null}),dark=std(0x4a3220);
      for(let i=0;i<STEPS;i++){const top=(i+1)*STEP_RISE,zNear=wallZ+MACHINE_GAP+(STEPS-1-i)*STEP_TREAD;
        const step=box(MACHINE_LENGTH,.12,STEP_TREAD+.02,wood,cx,top-.06,zNear+STEP_TREAD/2,g);if(i===STEPS-1||i===0)mark(step,card(i?'top':'machine'))}
      // The two long stringers, and posts down to the floor.
      const run=STEPS*STEP_TREAD,rise=STEPS*STEP_RISE,len=Math.hypot(run,rise),angle=Math.atan2(rise,run);
      for(const side of [-1,1]){const s=box(.35,.5,len,dark,cx+side*(MACHINE_LENGTH/2+.18),rise/2,wallZ+MACHINE_GAP+run/2,g);s.rotation.x=angle;mark(s,card('machine'));
        for(const k of [.15,.5,.85]){const z=wallZ+MACHINE_GAP+run*(1-k),y=rise*k;box(.3,y,.3,dark,cx+side*(MACHINE_LENGTH/2+.18),y/2,z,g)}}
      block('brob',cx-MACHINE_LENGTH/2-.4,wallZ+MACHINE_GAP+run/2,.5,run);block('brob',cx+MACHINE_LENGTH/2+.4,wallZ+MACHINE_GAP+run/2,.5,run);
      // The book: two great pages, written in a hand you can read a line of in eight or ten paces.
      const pageW=6.8,pageH=9.4,lean=.1,bookZ=wallZ+.9;
      const cover=box(pageW*2+.8,pageH+.6,.3,std(0x3a1e12,{roughness:.7}),cx,pageH/2+.25,bookZ-.45,g);cover.rotation.x=-lean;
      const pageText=(lines)=>own(canvasTexture((c,W,H)=>{c.fillStyle='#e8dcc0';c.fillRect(0,0,W,H);c.fillStyle='rgba(120,90,50,.12)';c.fillRect(W-40,0,40,H);c.fillStyle='#2a1c10';
        c.font='34px Georgia';let y=110;const max=W-150;for(const para of lines){const words=para.split(' ');let line='';for(const word of words){const t=line?line+' '+word:word;if(c.measureText(t).width>max){c.fillText(line,75,y);y+=50;line=word}else line=t}if(line){c.fillText(line,75,y);y+=50}y+=36}},720,1000));
      const left=pageText([q('reading'),'— Gulliver, of the books in Brobdingnag.']),right=pageText([`Of ${SWIFT.treatise}:`,`He said “${SWIFT.giants}.”`,'— the old treatise, as Gulliver tells it.']);
      const pages=[];for(const [side,map] of [[-1,left],[1,right]]){const p=add(own(new THREE.PlaneGeometry(pageW,pageH)),own(new THREE.MeshStandardMaterial({map,emissive:0xffffff,emissiveMap:map,emissiveIntensity:.18,roughness:.95,side:THREE.DoubleSide})),cx+side*pageW/2,pageH/2+.3,bookZ+.06,g);p.rotation.x=-lean;p.rotation.y=-side*.05;mark(p,card('book'));pages.push(p)}
      block('brob',cx,bookZ-.2,pageW*2+1,1.6);
    }
    function onMachine(x,z){const wallZ=BROB.cz-BROB.d/2+.4,z0=wallZ+MACHINE_GAP;return Math.abs(x-BROB.cx)<MACHINE_LENGTH/2&&z>=z0&&z<z0+STEPS*STEP_TREAD}
    function machineHeight(x,z){if(!onMachine(x,z))return null;const z0=BROB.cz-BROB.d/2+.4+MACHINE_GAP,i=STEPS-1-Math.floor((z-z0)/STEP_TREAD);return (Math.max(0,Math.min(STEPS-1,i))+1)*STEP_RISE}
    // Gulliver's chamber: sixteen feet square and twelve high (4.9 m by 3.7), sash-windows, a door, and no ceiling; the
    // room's books on its three walls, and a chair at its table.
    function buildChamber(g,x,z){
      const S=4.88,H=3.66,t=.12,half=S/2,wood=std(0xb08a5c,{roughness:.7}),trim=std(0xece4d2,{roughness:.6});
      const cg=placeAt(g,x,0,z);
      box(S,t,S,std(0x7a5a3a),0,.06,0,cg);
      box(t,H,S,wood,-half,H/2,0,cg);box(t,H,S,wood,half,H/2,0,cg);box(S,H,t,wood,0,H/2,-half,cg);
      for(const side of [-1,1])box(half-.65,H,t,wood,side*(half/2+.33),H/2,half,cg);box(1.3,H-2.4,t,wood,0,H-(H-2.4)/2,half,cg);
      box(S+.2,.14,S+.2,trim,0,H+.07,0,cg);
      // Sash windows in the east and west walls, outside; the chamber's ceiling board, lifted, leans against the south wall.
      const glass=own(new THREE.MeshStandardMaterial({color:0x8fa6b8,emissive:0x1d2a36,emissiveIntensity:.5,roughness:.15,transparent:true,opacity:.6}));
      for(const side of [-1,1]){const pane=add(own(new THREE.PlaneGeometry(1.2,1.4)),glass,side*(half+.07),2,0,cg);pane.rotation.y=side*Math.PI/2;box(.05,.05,1.3,trim,side*(half+.08),2,0,cg)}
      const lid=box(S,.08,S,wood,-half-2.9,.04,0,cg);lid.rotation.z=.02;
      const outside=[...cg.children];for(const part of outside)if(part.isMesh&&part!==lid)mark(part,card('chamber'));mark(lid,card('chamber'));
      // The shelves inside.
      const {brob}=catalogue(),geometry=own(new THREE.BoxGeometry(.5,.68,.09)),ROWS=[1.05,2.25];
      for(const group of brob){
        const n=group.books.length,per=Math.ceil(n/2)||1,step=Math.min(.78,(S-1.2)/per);
        const wallPos=group.wall==='west'?{x:-half+.25,z:0,yaw:Math.PI/2,along:'z'}:group.wall==='east'?{x:half-.25,z:0,yaw:-Math.PI/2,along:'z'}:{x:0,z:-half+.25,yaw:0,along:'x'};
        group.books.forEach((book,i)=>{const row=i<per?0:1,k=row?n-per:per,col=row?i-per:i,off=(col-(k-1)/2)*step;
          const lx=wallPos.along==='x'?off:wallPos.x,lz=wallPos.along==='z'?-off*(group.wall==='west'?-1:1):wallPos.z;
          placeBook(book,{x:x+lx,y:ROWS[row],z:z+lz,yaw:wallPos.yaw},geometry,group.key,g)});
        for(const y of ROWS){box(wallPos.along==='x'?S-.6:.3,.04,wallPos.along==='x'?.3:S-.6,std(0x5a3c24),wallPos.x,y-.37,wallPos.z,cg)}
        const label=sign(placeAt(cg,wallPos.along==='x'?0:wallPos.x+(group.wall==='west'?.07:-.07),3.05,wallPos.along==='x'?wallPos.z+.07:0,wallPos.yaw),group.name,group.sub,2.3,.46);
        mark(label,{type:'gulliver-card',title:group.name.charAt(0)+group.name.slice(1).toLowerCase(),author:group.sub+'.',action:'READ'});
      }
      // His table and chair, the library's own seat.
      box(.9,.05,.6,std(0x5a3c24),0,.76,.5,cg);for(const lx of [-.4,.4])for(const lz of [-.25,.25])box(.04,.74,.04,std(0x3a2a1c),lx,.37,.5+lz,cg);
      const chair=placeAt(cg,0,0,1.25,Math.PI);const seat=box(.48,.05,.46,std(0x6a4a2c),0,.46,0,chair),back=box(.48,.55,.05,std(0x6a4a2c),0,.76,-.21,chair);
      for(const lx of [-.2,.2])for(const lz of [-.19,.19])box(.04,.44,.04,std(0x3a2a1c),lx,.22,lz,chair);
      if(registerSeat){const data=registerSeat([seat,back],chair,new THREE.Vector3(0,1.2,-.05),Math.PI,{title:'Gulliver’s chair',author:'Sit at his table and read one of the books in his chamber.'});
        Object.defineProperty(data,'bookIds',{get:()=>books.map(mesh=>mesh.userData.book.id),configurable:true});ours.push(seat,back)}
      // Walls are solid; the doorway in the south wall is 1.1 m wide.
      block('brob',x-half,z,.3,S+.2);block('brob',x+half,z,.3,S+.2);block('brob',x,z-half,S+.2,.3);
      for(const side of [-1,1])block('brob',x+side*(half/2+.33),z+half,half-.65,.3);
      block('brob',x,z+.5,1,.7);block('brob',x-half+.3,z,.5,S-.4);block('brob',x+half-.3,z,.5,S-.4);block('brob',x,z-half+.3,S-.4,.5);
      chamberAt={x,z,half};
    }
    let chamberAt=null;
    // A table in Glumdalclitch's room, legs to walk between, and a candlestick on it that is the room's lamp.
    function buildTable(g,x,z){
      const oak=std(0x5a3c24,{roughness:.7,map:MAT.wood?.map||null}),TOP=9.2;
      const top=box(14,.5,9,oak,x,TOP,z,g);const legs=[];for(const lx of [-6.3,6.3])for(const lz of [-3.8,3.8]){legs.push(box(1,TOP,1,oak,x+lx,TOP/2,z+lz,g));block('brob',x+lx,z+lz,1.1,1.1)}
      for(const part of [top,...legs])mark(part,card('table'));
      const brass=MAT.brass||std(0xc8a050,{metalness:.6,roughness:.4});add(own(new THREE.CylinderGeometry(1.4,1.8,.6,24)),brass,x,TOP+.55,z,g);
      add(own(new THREE.CylinderGeometry(.55,.55,6.5,20)),std(0xefe6d0,{roughness:.6}),x,TOP+4,z,g);
      const flame=add(own(new THREE.SphereGeometry(.4,12,10)),own(new THREE.MeshBasicMaterial({color:0xffd27a})),x,TOP+7.8,z,g);flame.scale.set(.7,1.6,.7);
      // A coin dropped under the table, big as a cartwheel: the King's opinion of mankind on one side, of farmers on the other.
      const coin=add(own(new THREE.CylinderGeometry(1.1,1.1,.12,32)),brass,x-3,.06,z+6.2,g);mark(coin,card('king'));block('brob',x-3,z+6.2,2.2,2.2);
    }

    // ---------- walking ----------
    const inLil=(x,z)=>x>LIL.cx-LIL.w/2&&x<LIL.cx+LIL.w/2&&z>LIL.cz-LIL.d/2&&z<LIL.cz+LIL.d/2;
    const inBrob=(x,z)=>x>BROB.cx-BROB.w/2&&x<BROB.cx+BROB.w/2&&z>BROB.cz-BROB.d/2&&z<BROB.cz+BROB.d/2;
    function contains(x,z){return inLil(x,z)||inBrob(x,z)}
    function floorAt(x,z){if(inLil(x,z))return 0;if(inBrob(x,z))return machineHeight(x,z)??0;return null}
    function allowed(x,z){
      const r=player.radius||.42,room=inLil(x,z)?LIL:inBrob(x,z)?BROB:null;if(!room)return false;
      if(x-r<room.cx-room.w/2+.45||x+r>room.cx+room.w/2-.45||z-r<room.cz-room.d/2+.45||z+r>room.cz+room.d/2-.45)return false;
      const key=room===LIL?'lilliput':'brob';
      if(key==='lilliput'&&inCity(x,z)&&!cityAllows(x,z))return false;
      // On the reading machine a step up or down is one step at a time: no climbing on from the side, no stepping off the top.
      if(key==='brob'){const here=floorAt(player.pos.x,player.pos.z)??0,there=floorAt(x,z)??0;if(Math.abs(there-here)>.45)return false;if(there>0)return true}
      return !blockers.some(b=>b.room===key&&x+r>b.minX&&x-r<b.maxX&&z+r>b.minZ&&z-r<b.maxZ);
    }

    // ---------- doing things ----------
    function enter(where='lilliput'){
      activate();
      if(where==='brobdingnag'){move(BROB.cx,BROB.cz+BROB.d/2-2.2,0);playSample?.('doorOpen',.5,.6);
        showNotice('Brobdingnag, at twelve times your size. The reading machine is against the far wall: climb it. Gulliver’s chamber is on the left, with the books in it.',10);
        analytics?.track('Room Explored',{room:'brobdingnag'});return}
      move(LIL.cx,LIL.cz+LIL.d/2-1.4,0);playSample?.('doorOpen',.8,1.2);
      showNotice('Lilliput, by night, at a twelfth of your size. Mildendo is on your left, the Emperor’s library ahead, the fleet of Blefuscu on the water. Walk gently; the streets are narrow.',10);
      analytics?.track('Room Explored',{room:'lilliput'});
    }
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('gulliver-'))return false;
      if(data.type==='gulliver-door'){through(data,()=>enter('lilliput'));return true}
      if(data.type==='gulliver-onward'){through(data,()=>enter('brobdingnag'));return true}
      if(data.type==='gulliver-back'){activate();move(LIL.cx,LIL.cz-LIL.d/2+1.9,Math.PI);playSample?.('doorOpen',.6,1.3);showNotice('Lilliput again, and you are the giant.',4);return true}
      if(data.type==='gulliver-exit'){through(data,()=>{move(DOOR.x+Math.sin(DOOR.yaw)*1.9,DOOR.z+Math.cos(DOOR.yaw)*1.9,DOOR.yaw+Math.PI);playSample?.('doorOpen',.8,1);showNotice('The Irish Room again.',3)});return true}
      if(data.type==='gulliver-egg'){
        if(data.end==='small'||egg?.found){showNotice('Cracked at the smaller end, as the edict commands. The law is satisfied, and nothing else happens.',7);return true}
        openPress(false);try{storage?.setItem(FOUND_KEY,'1')}catch(e){}
        showNotice(`Broken at the big end, against the edict. Somewhere below the Emperor’s library a padlock smaller than a grain of rice falls open. ${q('forbidden')}`,13);
        analytics?.track('Secret Found',{secret:'gulliver-big-end'});return true;
      }
      if(data.type==='gulliver-card'){showNotice(`${data.title}: ${data.author}`,11);return true}
      return false;
    }

    // ---------- lifecycle ----------
    function activate(){if(!root){root=new THREE.Group();root.name='gulliver';buildLilliput();buildBrobdingnag();scene.add(root)}lastNeeded=time}
    function unload(){
      if(!root)return;root.removeFromParent();root.traverse(object=>{if(object.isLight)object.userData.freed=true});root=null;egg=null;lamps=[];chamberAt=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0;for(const k in cityRule)delete cityRule[k];
    }
    function update(t){
      time=t;const inside=contains(player.pos.x,player.pos.z),near=Math.hypot(player.pos.x-DOOR.x,player.pos.z-DOOR.z)<PRELOAD;
      if(inside||near)activate();
      else if(root&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==b.userData.home.parent))unload();
    }
    function zoneAt(x,z){return inLil(x,z)?'lilliput':inBrob(x,z)?'brobdingnag':null}
    buildDoor();
    return {contains,floorAt,allowed,interact,update,enter,activate,unload,catalogue,zoneAt,door:DOOR,lilliput:LIL,brobdingnag:BROB,room:LIL,
      machine:{steps:STEPS,rise:STEP_RISE,tread:STEP_TREAD,gap:MACHINE_GAP,length:MACHINE_LENGTH},swift:SWIFT,cards:CARDS,
      get built(){return !!root},get books(){return books.slice()},get bigEndFound(){return !!egg?.found},get chamber(){return chamberAt}};
  };
})();
