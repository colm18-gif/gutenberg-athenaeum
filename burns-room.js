// The Burns Room: an Ayrshire cottage parlour for Robert Burns, through a door at the east end of the Irish Room's south
// wall (Kintyre is twelve miles from Antrim across the North Channel). Whitewashed walls under dark rafters, a box bed
// like the one he was born in at Alloway, a fire in the hearth, and a table set for a Burns Supper with a haggis on it.
// His poems, songs and letters and the first lives of him on the west wall; on the east, the Scotland around him, from
// Allan Ramsay to James Hogg. The fiddle by the hearth plays Auld Lang Syne (game.js's tone, no file).
//
// The room's secret is Tam o' Shanter's: the little window in the south wall looks out through the dark towards Alloway
// Kirk, where a light shows. Look through it and the witches are dancing to the Devil's pipes, until Tam roars
// "Weel done, Cutty-sark!" and in an instant all is dark; and on the sill lies the poem. Once seen it stays found
// (athenaeum-burns-cutty-sark; ?cuttysark shows it). Like the other rooms behind doors, nothing is built until the
// reader walks up to it, and it is freed a little while after they leave.
(function(){
  'use strict';

  // Three shelves. Their books are the new arrivals for each (data/new-books.js, rooms burns-*), with any listed here first.
  const GROUPS=[
    {key:'works',name:'HIS POEMS, SONGS AND LETTERS',sub:'In his own words',wall:'west',along:-3.1,length:4.4,ids:[]},
    {key:'lives',name:'HIS LIVES',sub:'And what the nineteenth century made of him',wall:'west',along:2.2,length:5.2,ids:[]},
    {key:'scotland',name:'HIS SCOTLAND',sub:'The country, the songs and the writers round him',wall:'east',along:-.3,length:10,ids:[]}
  ];
  const CARDS={
    sign:['The Burns Room','Robert Burns, 1759–1796: his poems, songs and letters, the first lives of him, and the Scotland around him. Ye’re welcome.'],
    bed:['A box bed','A bed built into the wall of the room, with curtains or doors to close it in. Burns was born in one at Alloway, in the clay cottage his father built, on 25 January 1759.'],
    haggis:['A haggis','“Fair fa’ your honest, sonsie face, / Great chieftain o’ the puddin-race!” The first Burns Supper was held by nine of his friends at the cottage in Alloway in 1801, five years after his death, and they have been held round the world every year since.'],
    sampler:['A man’s a man for a’ that','Burns’s song of 1795 for the equal worth of every man, whatever his coat. It was sung at the opening of the Scottish Parliament in 1999.'],
    fire:['The fire','A coal fire, banked for the night. The kettle is on the swee, the iron arm that swings it over the flames.'],
    window:['A small window','Dark, and wet. Through the trees a light is showing at Alloway Kirk, where no light should be at this hour.'],
    fiddle:['A fiddle','Burns sent Auld Lang Syne to James Johnson’s Scots Musical Museum, saying he had taken it down from an old man’s singing. The tune it is sung to everywhere now is not the one first printed with it; it was set to this one in George Thomson’s collection, after his death.']
  };
  // Auld Lang Syne, in G: the melody (in hertz) and how long each note is held, in beats.
  const TUNE=[[293.66,1],[392,1.5],[392,.5],[392,1],[493.88,1],[440,1.5],[392,.5],[440,1],[493.88,.5],[440,.5],[392,1.5],[392,.5],[493.88,1],[587.33,1],[659.25,3]];
  // The Devil's pipes in the kirk: a reel on the chanter over the drones.
  const REEL=[[440,.22],[554.37,.22],[659.25,.22],[554.37,.22],[493.88,.22],[587.33,.22],[739.99,.22],[587.33,.22],[440,.22],[554.37,.22],[659.25,.44],[880,.66]];

  window.createBurnsRoom=function(options){
    const {THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,arrivals={},showNotice,playSample,move,analytics,isHolding=()=>false,registerSeat=null,doorKit=null,tone=null,storage=window.localStorage,
      irishRoom={cx:-330,cz:-205,w:16,d:14}}=options;
    // At the east end of the Irish Room's south wall, past the harp, facing into the Irish Room.
    const DOOR={x:irishRoom.cx+6,z:irishRoom.cz+irishRoom.d/2-.2,yaw:Math.PI};
    const ROOM={cx:500,cz:-300,w:15,d:13,h:4.4};
    const PRELOAD=7,KEEP=25;
    // The cottage side of the door: planked, painted a dark Ayrshire green.
    const DOOR_LOOK={style:'painted',color:0x2f4a38,planked:true,fanColor:0xffc27a,width:1.8,height:2.9};
    const through=(data,go)=>doorKit&&data.kit?doorKit.pass(data.kit,data,go):go();
    const FOUND_KEY='athenaeum-burns-cutty-sark';
    const wasFound=()=>{try{return storage?.getItem(FOUND_KEY)==='1'||/[?&]cuttysark\b/.test(location.search)}catch(e){return false}};
    let root=null,time=0,lastNeeded=-1e9,kirk=null,fire=null;
    const owned=[],ours=[],books=[],blockers=[];
    const own=thing=>{owned.push(thing);return thing};
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    // The door in the Irish Room stays when this room is freed, so its parts are not among the room's own.
    function markDoor(object,data){object.userData=data;interactables.push(object);return object}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const card=key=>({type:'burns-card',title:CARDS[key][0],author:CARDS[key][1],action:'READ'});
    function sign(parent,text,sub,w,h,x,y,z){
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle='#efe8d6';c.fillRect(0,0,W,H);c.strokeStyle='#26405e';c.lineWidth=4;c.strokeRect(7,7,W-14,H-14);
        // A border of tartan-ish checks along the top and bottom.
        for(let x=7;x<W-7;x+=18){c.fillStyle=(x/18|0)%2?'#26405e':'#7a2b2b';c.fillRect(x,7,9,6);c.fillRect(x+9,H-13,9,6)}
        c.fillStyle='#24201a';c.textAlign='center';c.font='bold 29px Georgia';c.fillText(text,W/2,sub?52:H/2+11);if(sub){c.font='italic 21px Georgia';c.fillText(sub,W/2,85)}},620,sub?104:70));
      return add(own(new THREE.PlaneGeometry(w,h)),own(new THREE.MeshStandardMaterial({map,emissive:0x3a3226,emissiveIntensity:.25,roughness:.9})),x,y,z,parent);
    }

    // The books for each shelf: those listed, then the new arrivals; a book the library does not hold is left out.
    const shelfBooks=(ids,room,max)=>[...new Set([...ids,...(arrivals[room]||[])])].map(id=>findBook(id)).filter(Boolean).slice(0,max);
    function catalogue(){return {groups:GROUPS.map(group=>({...group,books:shelfBooks(group.ids,group.key,group.wall==='east'?12:6)})),cutty:shelfBooks([],'cutty',1)}}

    // ---------- the door, in the Irish Room ----------
    function buildDoor(){
      const g=new THREE.Group();g.name='burns-door';g.position.set(DOOR.x,0,DOOR.z);g.rotation.y=DOOR.yaw;scene.add(g);
      const data={type:'burns-door',title:'The Burns Room',author:'Across the North Channel: Robert Burns’s poems, songs and letters, in an Ayrshire cottage.',action:'ENTER'};
      if(!doorKit?.hang(g,{data,mark:markDoor,...DOOR_LOOK,...doorKit.readingRoom?.('THE BURNS ROOM','Robert Burns, 1759–1796')}))markDoor(add(new THREE.BoxGeometry(1.8,2.9,.14),new THREE.MeshStandardMaterial({color:DOOR_LOOK.color,roughness:.7}),0,1.45,.08,g),data);
    }

    // ---------- the room ----------
    function buildRoom(){
      root=new THREE.Group();root.name='burns-room';const {cx,cz,w,d,h}=ROOM;
      // Whitewashed walls, a flagstone floor, and dark rafters under a boarded ceiling.
      const lime=own(new THREE.MeshStandardMaterial({color:0xd9d2c0,roughness:1})),dark=own(new THREE.MeshStandardMaterial({color:0x2e2218,roughness:.8}));
      const flags=own(canvasTexture((c,W,H)=>{c.fillStyle='#6d665c';c.fillRect(0,0,W,H);c.strokeStyle='#4a453e';c.lineWidth=3;
        for(let y=0,row=0;y<H;y+=64,row++)for(let x=-(row%2)*40;x<W;x+=96){c.fillStyle=['#6f685e','#665f55','#746c60','#6a6359'][(x/96+row)&3];c.fillRect(x+2,y+2,92,60);c.strokeRect(x,y,96,64)}},384,384));
      flags.wrapS=flags.wrapT=THREE.RepeatWrapping;flags.repeat?.set?.(w/4,d/4);
      box(w,.3,d,own(new THREE.MeshStandardMaterial({color:0x8a8478,map:flags,roughness:.95})),cx,-.15,cz,root);box(w,.2,d,dark,cx,h+.1,cz,root);
      box(w,h,.3,lime,cx,h/2,cz-d/2,root);box(w,h,.3,lime,cx,h/2,cz+d/2,root);box(.3,h,d,lime,cx-w/2,h/2,cz,root);box(.3,h,d,lime,cx+w/2,h/2,cz,root);
      for(let x=cx-w/2+1.5;x<cx+w/2;x+=2.4)box(.26,.3,d-.3,dark,x,h-.15,cz,root);
      mark(sign(root,'THE BURNS ROOM','Robert Burns, 1759–1796',3.4,.56,cx,h-.75,cz-d/2+.17),card('sign'));
      buildHearth(cx,cz-d/2);
      // The shelves on the west and east walls: two rows on each run, under its own label.
      const {groups,cutty}=catalogue(),geometry=own(new THREE.BoxGeometry(.72,.96,.13)),ROWS=[1.4,2.55];
      for(const group of groups){
        const per=Math.max(1,Math.ceil(group.books.length/2)),step=Math.min(1.25,(group.length-.4)/per),side=group.wall==='west'?-1:1,x=cx+side*(w/2-.3),zc=cz+group.along;
        group.books.forEach((book,i)=>{const row=i<per?0:1,n=row?group.books.length-per:per,col=row?i-per:i,offset=(col-(n-1)/2)*step;
          placeBook(book,{x,y:ROWS[row],z:zc+side*-offset,yaw:-side*Math.PI/2},geometry,group.key)});
        for(const y of ROWS)box(.36,.05,group.length,dark,cx+side*(w/2-.35),y-.5,zc,root);block(cx+side*(w/2-.35),zc,.7,group.length+.2);
        const label=sign(root,group.name,group.sub,2.9,.46,cx+side*(w/2-.17),3.45,zc);label.rotation.y=-side*Math.PI/2;
        mark(label,{type:'burns-card',title:group.name.charAt(0)+group.name.slice(1).toLowerCase(),author:group.sub+'.',action:'READ'});
      }
      buildBoxBed(cx-4.4,cz+d/2-.6);
      buildSupper(cx,cz+.4);
      buildKirkWindow(cx+4.2,cz+d/2-.16,cutty[0]||null);
      // One lamp, low over the supper table; the fire glows without a light of its own.
      const lamp=new THREE.PointLight(0xffc68a,6.5,16,2);lamp.position.set(cx,h-1.1,cz+.4);root.add(lamp);
      add(own(new THREE.CylinderGeometry(.16,.22,.32,10)),own(new THREE.MeshStandardMaterial({color:0x3a2e22,emissive:0xffb060,emissiveIntensity:.9,roughness:.6})),cx,h-.95,cz+.4,root);
      add(own(new THREE.CylinderGeometry(.01,.01,.75,4)),MAT.brass||dark,cx,h-.42,cz+.4,root);
      // The door back to the Irish Room.
      const exit={type:'burns-exit',title:'Back to the Irish Room',author:'Twelve miles of water, at the narrowest.',action:'RETURN'};
      if(!doorKit?.hang(root,{data:exit,mark,x:cx,z:cz+d/2-.2,yaw:Math.PI,label:'THE IRISH ROOM',own,...DOOR_LOOK}))mark(box(1.8,2.9,.16,own(new THREE.MeshStandardMaterial({color:DOOR_LOOK.color,roughness:.7})),cx,1.45,cz+d/2-.2,root),exit);
      scene.add(root);
    }
    // The hearth in the north wall: a stone chimney breast, a coal fire, the kettle on its swee, and a fiddle on a peg.
    function buildHearth(x,wallZ){
      const stone=own(new THREE.MeshStandardMaterial({color:0x8b8274,roughness:1})),black=own(new THREE.MeshStandardMaterial({color:0x1a1714,roughness:.6,metalness:.3}));
      const breast=box(2.8,ROOM.h,.6,stone,x,ROOM.h/2,wallZ+.45,root);box(1.4,1.1,.2,own(new THREE.MeshBasicMaterial({color:0x120c08})),x,.75,wallZ+.66,root);
      const mantel=box(3,.12,.4,MAT.darkWood,x,1.62,wallZ+.82,root);
      const embers=box(.9,.18,.35,own(new THREE.MeshStandardMaterial({color:0x3a1208,emissive:0xff5a1a,emissiveIntensity:1.6,roughness:.8})),x,.32,wallZ+.82,root);
      box(1.1,.08,.5,black,x,.2,wallZ+.85,root);
      const kettle=add(own(new THREE.SphereGeometry(.17,12,8)),black,x+.25,.72,wallZ+.85,root);kettle.scale.set(1,.8,1);
      box(.04,.04,.6,black,x+.25,.98,wallZ+.62,root);
      fire=embers.material;
      for(const part of [breast,embers,kettle])mark(part,card('fire'));
      block(x,wallZ+.6,3.2,1.2);
      // A sampler over the mantel.
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle='#ece3cc';c.fillRect(0,0,W,H);c.strokeStyle='#7a2b2b';c.lineWidth=5;c.strokeRect(8,8,W-16,H-16);
        c.fillStyle='#26405e';c.textAlign='center';c.font='bold 26px Georgia';c.fillText('A MAN’S A MAN',W/2,58);c.fillText('FOR A’ THAT',W/2,94);
        c.fillStyle='#7a2b2b';for(let i=0;i<9;i++){c.beginPath();c.arc(40+i*(W-80)/8,H-26,5,0,7);c.fill()}},360,160));
      const sampler=add(own(new THREE.PlaneGeometry(1.1,.5)),own(new THREE.MeshStandardMaterial({map,emissive:0x2a2418,emissiveIntensity:.2,roughness:.95})),x,2.3,wallZ+.76,root);mark(sampler,card('sampler'));
      // The fiddle, on a peg to the right of the chimney.
      const g=new THREE.Group();g.position.set(x+2.1,1.75,wallZ+.2);g.rotation.z=.12;root.add(g);
      const varnish=own(new THREE.MeshStandardMaterial({color:0x7a3a14,roughness:.35,metalness:.05}));
      const body=add(own(new THREE.SphereGeometry(.2,14,10)),varnish,0,0,0,g);body.scale.set(.85,1.45,.25);
      const neck=box(.05,.42,.04,MAT.darkWood,0,.48,.02,g);box(.06,.08,.05,MAT.darkWood,0,.72,.02,g);
      for(const sx of [-.015,-.005,.005,.015])add(own(new THREE.CylinderGeometry(.002,.002,.9,3)),MAT.brass||varnish,sx,.22,.06,g);
      for(const part of [body,neck])mark(part,{type:'burns-fiddle',title:CARDS.fiddle[0],author:CARDS.fiddle[1],action:'PLAY'});
    }
    // The box bed against the south wall, its curtains drawn back, with a patchwork quilt.
    function buildBoxBed(x,z){
      const g=new THREE.Group();g.position.set(x,0,z);root.add(g);
      const wood=own(new THREE.MeshStandardMaterial({color:0x4a3322,roughness:.75}));
      box(2.1,2.3,.1,wood,0,1.15,.45,g);for(const sx of [-1.02,1.02])box(.1,2.3,1.1,wood,sx,1.15,0,g);box(2.1,.1,1.1,wood,0,2.3,0,g);box(2,.5,1,wood,0,.25,0,g);
      const quilt=own(canvasTexture((c,W,H)=>{const colours=['#7a2b2b','#26405e','#c9b48a','#3e5a3a','#8a6a3a'];for(let y=0;y<H;y+=32)for(let x=0;x<W;x+=32){c.fillStyle=colours[(x/32*3+y/32*2)%5];c.fillRect(x,y,32,32)}},256,128));
      box(1.95,.12,.95,own(new THREE.MeshStandardMaterial({map:quilt,roughness:.95})),0,.56,0,g);box(.6,.14,.35,own(new THREE.MeshStandardMaterial({color:0xece6d6,roughness:.95})),-.6,.66,.2,g);
      const curtain=own(new THREE.MeshStandardMaterial({color:0x6e2a24,roughness:.95}));for(const sx of [-.85,.85])box(.3,1.9,.06,curtain,sx,1.3,-.52,g);
      for(const child of g.children)mark(child,card('bed'));
      block(x,z,2.3,1.3);
    }
    // The table set for a Burns Supper: a haggis on its ashet, neeps and tatties, a quaich, candles; and two chairs.
    function buildSupper(x,z){
      const oak=own(new THREE.MeshStandardMaterial({color:0x5a3c24,roughness:.7,map:MAT.wood?.map||null}));
      box(2.4,.08,1.1,oak,x,.96,z,root);for(const sx of [-1.05,1.05])for(const sz of [-.42,.42])box(.08,.92,.08,MAT.darkWood,x+sx,.46,z+sz,root);block(x,z,2.6,1.3);
      const ashet=add(own(new THREE.CylinderGeometry(.32,.28,.04,24)),own(new THREE.MeshStandardMaterial({color:0xeee8da,roughness:.4})),x,1.02,z,root);
      const haggis=add(own(new THREE.SphereGeometry(.17,16,12)),own(new THREE.MeshStandardMaterial({color:0x6b4428,roughness:.55})),x,1.14,z,root);haggis.scale.set(1.35,.8,1);
      for(const [dx,colour] of [[-.55,0xe6a23a],[.55,0xefe6c8]])add(own(new THREE.CylinderGeometry(.13,.11,.06,16)),own(new THREE.MeshStandardMaterial({color:colour,roughness:.8})),x+dx,1.03,z,root);
      const quaich=add(own(new THREE.CylinderGeometry(.08,.05,.05,14)),MAT.brass||oak,x+.2,1.03,z+.35,root);
      for(const dx of [-.9,.9]){add(own(new THREE.CylinderGeometry(.025,.025,.22,8)),own(new THREE.MeshStandardMaterial({color:0xefe6d0,roughness:.6})),x+dx,1.11,z-.3,root);
        add(own(new THREE.SphereGeometry(.022,8,6)),own(new THREE.MeshStandardMaterial({color:0xffc870,emissive:0xffa040,emissiveIntensity:2})),x+dx,1.24,z-.3,root)}
      for(const part of [ashet,haggis])mark(part,card('haggis'));mark(quaich,{type:'burns-card',title:'A quaich',author:'A shallow two-handled cup, for sharing a dram. At a Burns Supper the haggis is toasted with whisky after the Address.',action:'READ'});
      // Two chairs at the table's ends, the library's own seats.
      for(const side of [-1,1]){
        const cxp=x+side*1.65,chair=new THREE.Group();chair.position.set(cxp,0,z);chair.rotation.y=side*Math.PI/2;root.add(chair);
        const seat=box(.55,.06,.52,oak,0,.46,0,chair),back=box(.55,.6,.05,oak,0,.8,.24,chair);for(const lx of [-.23,.23])for(const lz of [-.22,.22])box(.05,.44,.05,MAT.darkWood,lx,.22,lz,chair);block(cxp,z,.7,.7);
        if(registerSeat){const data=registerSeat([seat,back],chair,new THREE.Vector3(0,1.2,.05),side*Math.PI/2,{title:'A chair at the supper table',author:'Sit and read one of the Burns Room’s books.'});
          Object.defineProperty(data,'bookIds',{get:()=>books.map(mesh=>mesh.userData.book.id),configurable:true});ours.push(seat,back)}
      }
    }
    // A small window in the south wall, looking out through the dark to Alloway Kirk. Its glass is a painted texture: the
    // kirk with one lit window; and, once looked into, the dance inside it.
    function buildKirkWindow(x,z,book){
      const night=own(canvasTexture((c,W,H)=>drawKirk(c,W,H,false),256,256)),dance=own(canvasTexture((c,W,H)=>drawKirk(c,W,H,true),256,256));
      const g=new THREE.Group();g.position.set(x,1.75,z);g.rotation.y=Math.PI;root.add(g);
      const glassMat=own(new THREE.MeshStandardMaterial({map:night,emissive:0xffffff,emissiveMap:night,emissiveIntensity:.6,roughness:.2}));
      const glass=add(own(new THREE.PlaneGeometry(1,1)),glassMat,0,0,.01,g);
      const frame=own(new THREE.MeshStandardMaterial({color:0xe7e1d2,roughness:.6}));
      for(const [fw,fh,px,py] of [[1.16,.08,0,.54],[1.16,.08,0,-.54],[.08,1.16,-.54,0],[.08,1.16,.54,0],[1,.04,0,0],[.04,1,0,0]])box(fw,fh,.05,frame,px,py,.03,g);
      const sill=box(1.3,.06,.3,frame,0,-.6,.12,g);
      const data={type:'burns-window',title:CARDS.window[0],author:CARDS.window[1],action:'LOOK'};mark(glass,data);mark(sill,data);
      let mesh=null;
      if(book){const geo=own(new THREE.BoxGeometry(.3,.04,.42));mesh=add(geo,own(bookMaterial(book)),.15,-.555,.14,g);mesh.rotation.x=-Math.PI/2;mesh.rotation.order='YXZ';mesh.visible=false;
        mesh.userData={type:'book',book,loaded:false,burns:true,shelf:'cutty',home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:g}}}
      kirk={g,glass,glassMat,night,dance,sill,book:mesh,lit:0,found:false};
      block(x,z-.3,1.4,.5);
      if(wasFound())reveal(true);
    }
    function drawKirk(c,W,H,lit){
      const sky=c.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#0b1220');sky.addColorStop(1,'#2a3446');c.fillStyle=sky;c.fillRect(0,0,W,H);
      c.strokeStyle='rgba(180,190,210,.25)';c.lineWidth=1;for(let i=0;i<60;i++){const x=(i*53)%W,y=(i*37)%H;c.beginPath();c.moveTo(x,y);c.lineTo(x-4,y+12);c.stroke()}
      // The kirk: a roofless gable with a belfry, among black trees.
      c.fillStyle='#0b0c0e';c.beginPath();c.moveTo(60,190);c.lineTo(60,120);c.lineTo(128,78);c.lineTo(196,120);c.lineTo(196,190);c.fill();c.fillRect(118,58,20,24);
      for(const [tx,tr] of [[20,46],[236,52],[30,38]]){c.beginPath();c.arc(tx,190-tr,tr,0,7);c.fill()}
      c.fillRect(0,188,W,H-188);
      if(!lit){c.fillStyle='#ffcf70';c.fillRect(116,130,24,34);c.fillStyle='rgba(255,200,110,.25)';c.beginPath();c.arc(128,147,30,0,7);c.fill();return}
      // Lit: the whole window blazing, the dancers black against it, and Auld Nick on the sill with his pipes.
      const glow=c.createRadialGradient(128,150,4,128,150,70);glow.addColorStop(0,'rgba(255,190,90,.95)');glow.addColorStop(1,'rgba(255,120,40,0)');c.fillStyle=glow;c.fillRect(40,90,176,110);
      c.fillStyle='#ffd27a';c.fillRect(80,120,96,58);c.fillStyle='#1a0d06';
      for(let i=0;i<6;i++){const dx=88+i*15,dy=176,lean=(i%2?1:-1)*4;c.beginPath();c.arc(dx+lean,dy-30,4,0,7);c.fill();c.beginPath();c.moveTo(dx+lean,dy-26);c.lineTo(dx-6,dy);c.lineTo(dx+6,dy);c.fill();c.fillRect(dx-7+lean,dy-22,14,2)}
      c.beginPath();c.arc(128,124,6,0,7);c.fill();c.fillRect(124,126,8,14);c.beginPath();c.moveTo(122,118);c.lineTo(119,111);c.lineTo(125,117);c.moveTo(134,118);c.lineTo(137,111);c.lineTo(131,117);c.fill();
      c.fillRect(132,128,14,3);c.fillRect(144,120,2,10);c.fillRect(140,122,2,8);
    }
    function reveal(quiet){
      if(!kirk||kirk.found)return;kirk.found=true;
      const data={type:'burns-card',title:'The window towards Alloway Kirk',author:'Dark again. Whatever was dancing there has gone, and left the poem on the sill.',action:'READ'};
      kirk.glass.userData=data;kirk.sill.userData=data;
      if(kirk.book){kirk.book.visible=true;interactables.push(kirk.book);ours.push(kirk.book);books.push(kirk.book)}
      if(!quiet)kirk.lit=1;
    }
    function placeBook(book,spot,geometry,shelf){
      const mesh=add(geometry,own(bookMaterial(book)),spot.x,spot.y,spot.z,root);mesh.rotation.order='YXZ';mesh.rotation.y=spot.yaw;mesh.rotation.x=-.08;
      mesh.userData={type:'book',book,loaded:false,burns:true,shelf,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:root}};
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
    function play(notes,voice,beat){if(!tone)return;let at=0;for(const [freq,beats] of notes){tone(freq,at,beats*beat+.2,.07,voice);at+=beats*beat}return at}
    function drones(seconds){if(!tone)return;for(const freq of [110,220])tone(freq,0,seconds,.03,'pipes')}
    function enter(){
      activate();move(ROOM.cx,ROOM.cz+ROOM.d/2-1.4,0);playSample?.('doorOpen',.8,.96);
      showNotice('The Burns Room. His poems, songs and letters on the left, with the first lives of him; the Scotland around him on the right; the supper on the table, and a fire in the hearth.',10);
      analytics?.track('Room Explored',{room:'burns-room'});
    }
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('burns-'))return false;
      if(data.type==='burns-door'){through(data,enter);return true}
      if(data.type==='burns-exit'){through(data,()=>{move(DOOR.x+Math.sin(DOOR.yaw)*1.9,DOOR.z+Math.cos(DOOR.yaw)*1.9,DOOR.yaw+Math.PI);playSample?.('doorOpen',.8,1);showNotice('The Irish Room again.',3)});return true}
      if(data.type==='burns-fiddle'){play(TUNE,'fiddle',.42);showNotice(`${data.title}: ${data.author}`,10);return true}
      if(data.type==='burns-window'){
        reveal(false);try{storage?.setItem(FOUND_KEY,'1')}catch(e){}
        const length=play(REEL,'pipes',.95)||3;drones(length+.4);
        showNotice('Warlocks and witches in a dance, and on the window-sill Auld Nick himself, in shape o’ beast, with his pipes. Tam forgets himself and roars out, “Weel done, Cutty-sark!” And in an instant all is dark. On the sill there is a book.',13);
        analytics?.track('Secret Found',{secret:'burns-cutty-sark'});return true;
      }
      if(data.type==='burns-card'){showNotice(`${data.title}: ${data.author}`,10);return true}
      return false;
    }

    // ---------- lifecycle ----------
    function activate(){if(!root)buildRoom();lastNeeded=time}
    function unload(){
      // Its lamp is marked freed, so the light budget lets it go.
      if(!root)return;root.removeFromParent();root.traverse(object=>{if(object.isLight)object.userData.freed=true});root=null;kirk=null;fire=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0;
    }
    function update(t){
      const dt=Math.min(.1,Math.max(0,t-time));time=t;const inside=contains(player.pos.x,player.pos.z),near=Math.hypot(player.pos.x-DOOR.x,player.pos.z-DOOR.z)<PRELOAD;
      if(inside||near)activate();
      else if(root&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==root&&b.parent!==kirk?.g))unload();
      // The fire flickers as it crackles.
      if(fire)fire.emissiveIntensity=1.35+.35*Math.sin(t*9.1)*Math.sin(t*3.7)+(Math.random()<.04?.5:0);
      // The dance in the window: it blazes, flickers, and goes out all at once.
      if(kirk&&kirk.lit>0){kirk.lit=Math.max(0,kirk.lit-dt/4.5);const on=kirk.lit>0;kirk.glassMat.map=kirk.glassMat.emissiveMap=on?kirk.dance:kirk.night;kirk.glassMat.emissiveIntensity=on?.8+.3*Math.sin(t*23):.6;kirk.glassMat.needsUpdate=true}
    }
    buildDoor();
    return {contains,floorAt,allowed,interact,update,enter,unload,catalogue,door:DOOR,room:ROOM,groups:GROUPS,tune:TUNE,
      get built(){return !!root},get books(){return books.slice()},get cuttySarkSeen(){return !!kirk?.found},zoneAt:(x,z)=>contains(x,z)?'burns-room':null};
  };
})();
