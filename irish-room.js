// The Irish Room, Seomra na hÉireann: a room off the Grand Hall's south wall, behind a green Georgian door, for the
// books of Ireland. Four shelves: myth and legend (Seanchas), the Revival (An Athbheochan), Irish writers
// (Scríbhneoirí) and a small shelf of books in Irish (As Gaeilge). A turf fire, a harp, a St Brigid's cross over the
// hearth and an ogham stone by the door, each with a card. Like the other rooms behind doors, nothing is built until
// the reader walks up to it, and it is freed a little while after they leave.
//
// In the middle of the room, under glass, the facsimile of the Book of Kells (kells-book.js) lies open for anyone to turn.
// The room's secret: by the hearth one sod has fallen from the turf creel, cut cleaner than the rest. Under it, in a
// hollow in the boards, is the Book of Kells's elder, the Book of Durrow (durrow-book.js), hidden as the great Gospel of
// Colum Cille was found under a sod in 1007. Once found it stays found (athenaeum-durrow-found; ?durrow shows it).
(function(){
  'use strict';

  // Four shelves. The new arrivals for each (data/new-books.js, rooms irish-*) are added to any books listed here.
  const GROUPS=[
    {key:'myth',name:'SEANCHAS',sub:'Myth and legend',ids:[]},
    {key:'revival',name:'AN ATHBHEOCHAN',sub:'The Revival',ids:[]},
    // Irish writers the library already has on its shelves, and the new arrivals.
    {key:'writers',name:'SCRÍBHNEOIRÍ',sub:'Irish writers',ids:[2814,4217,829,174,345,10007]},
    {key:'gaeilge',name:'AS GAEILGE',sub:'Books in Irish',ids:[]}
  ];
  const RECORDS={2814:['Dubliners','James Joyce'],4217:['A Portrait of the Artist as a Young Man','James Joyce'],829:['Gulliver’s Travels','Jonathan Swift'],
    174:['The Picture of Dorian Gray','Oscar Wilde'],345:['Dracula','Bram Stoker'],10007:['Carmilla','J. Sheridan Le Fanu']};
  const CARDS={
    cross:['A St Brigid’s cross','Woven from rushes on the eve of St Brigid’s day, the first of February, and hung in the house to keep it from fire and harm. A new one is made each year.'],
    harp:['A harp','The old instrument of the Irish poets, and the emblem of Ireland on its coins and seals. The oldest Irish harp to survive, the one in Trinity College Dublin that is called Brian Boru’s, was made in the fourteenth or fifteenth century.'],
    ogham:['An ogham stone','Ogham, the oldest way of writing Irish, was cut as notches along the edge of standing stones from about the fourth century, most of them names. More ogham stones survive in Kerry, Cork and Waterford than anywhere else.'],
    fire:['A turf fire','Sods of turf cut from the bog and dried through the summer. In many houses in the west the fire was never let go out.'],
    sign:['Seomra na hÉireann','The Irish Room: the old stories, the writers of the Revival and the novelists, and a small shelf of books in Irish. Fáilte romhat, you are welcome.']};

  window.createIrishRoom=function(options){
    const {THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,arrivals={},showNotice,playSample,move,analytics,isHolding=()=>false,registerSeat=null,doorKit=null,kells=null,durrow=null,storage=window.localStorage}=options;
    // In the Grand Hall's south wall, between the Boathouse door and the pillar.
    const DOOR={x:-8.3,z:30.45,yaw:Math.PI};
    const ROOM={cx:-330,cz:-205,w:16,d:14,h:5};
    const PRELOAD=7,KEEP=25;
    // A Georgian door, painted green, with its fanlight lit from the fire beyond.
    const DOOR_LOOK={style:'painted',color:0x1d5a3c,fanColor:0xffb35c,width:1.9,height:3.1};
    const through=(data,go)=>doorKit&&data.kit?doorKit.pass(data.kit,data,go):go();
    let root=null,time=0,lastNeeded=-1e9,fire=null,secret=null;
    const FOUND_KEY='athenaeum-durrow-found';
    const wasFound=()=>{try{return storage?.getItem(FOUND_KEY)==='1'||/[?&]durrow\b/.test(location.search)}catch(e){return false}};
    const owned=[],ours=[],books=[],blockers=[];
    const own=thing=>{owned.push(thing);return thing};
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    // The door in the hall stays when the room is freed, so its parts are not among the room's own.
    function markDoor(object,data){object.userData=data;interactables.push(object);return object}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const card=key=>({type:'irish-card',title:CARDS[key][0],author:CARDS[key][1],action:'READ'});
    // A band of simple interlace along the edges of the room's signs.
    function knot(c,W,H,colour){c.strokeStyle=colour;c.lineWidth=3;for(const y of [12,H-12])for(let x=10;x<W-10;x+=24){c.beginPath();c.arc(x+6,y,6,0,Math.PI);c.stroke();c.beginPath();c.arc(x+18,y,6,Math.PI,Math.PI*2);c.stroke()}}
    function sign(parent,text,sub,w,h,x,y,z){
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle='#14281c';c.fillRect(0,0,W,H);knot(c,W,H,'#c9a45a');c.fillStyle='#f1e2b8';c.textAlign='center';c.font='bold 30px Georgia';c.fillText(text,W/2,sub?52:H/2+12);if(sub){c.font='italic 22px Georgia';c.fillText(sub,W/2,84)}},560,sub?104:72));
      return add(own(new THREE.PlaneGeometry(w,h)),own(new THREE.MeshStandardMaterial({map,emissive:0x3a2a12,emissiveIntensity:.3,roughness:.85})),x,y,z,parent);
    }

    // The books for each shelf: those listed, then the new arrivals; a book the library does not hold is left out.
    const ROOM_FOR={myth:10,revival:10,writers:12,gaeilge:4};
    function catalogue(){
      return GROUPS.map(group=>({...group,books:[...new Set([...group.ids,...(arrivals[group.key]||[])])].map(id=>{const [title,author]=RECORDS[id]||[];return findBook(id,title?{id,title,author}:null)}).filter(Boolean).slice(0,ROOM_FOR[group.key])}));
    }

    // ---------- the door, in the Grand Hall ----------
    function buildDoor(){
      const g=new THREE.Group();g.name='irish-door';g.position.set(DOOR.x,0,DOOR.z);g.rotation.y=DOOR.yaw;scene.add(g);
      const data={type:'irish-door',title:'The Irish Room',author:'Seomra na hÉireann: the stories of Ireland, its writers, and books in Irish.',action:'ENTER'};
      if(!doorKit?.hang(g,{data,mark:markDoor,...DOOR_LOOK,...doorKit.readingRoom?.('THE IRISH ROOM','Seomra na hÉireann')}))markDoor(add(new THREE.BoxGeometry(1.9,3.1,.14),new THREE.MeshStandardMaterial({color:DOOR_LOOK.color,roughness:.7}),0,1.55,.08,g),data);
      const plate=canvasTexture((c,W,H)=>{c.fillStyle='#14281c';c.fillRect(0,0,W,H);c.strokeStyle='#c9a45a';c.lineWidth=6;c.strokeRect(5,5,W-10,H-10);c.textAlign='center';c.fillStyle='#f1e2b8';c.font='bold 32px Georgia';c.fillText('THE IRISH ROOM',W/2,46);c.font='italic 22px Georgia';c.fillText('Seomra na hÉireann',W/2,80)},600,100);
      // The name is gilded on the door's glass; the old board above is kept only for a door built without the kit.
      if(!doorKit?.readingRoom)markDoor(add(new THREE.PlaneGeometry(2.1,.35),new THREE.MeshStandardMaterial({map:plate,emissive:0x3a2a12,emissiveIntensity:.35}),0,4.82,.12,g),data);
    }

    // ---------- the room ----------
    function buildRoom(){
      root=new THREE.Group();root.name='irish-room';const {cx,cz,w,d,h}=ROOM;
      // Lime-washed walls above a dark wooden dado, and a wooden floor.
      const wall=own(new THREE.MeshStandardMaterial({color:0x8f836c,roughness:1})),stone=own(new THREE.MeshStandardMaterial({color:0x5b5750,roughness:1}));
      box(w,.3,d,MAT.wood,cx,-.15,cz,root);box(w,.25,d,MAT.darkWood,cx,h+.12,cz,root);
      box(w,h,.3,wall,cx,h/2,cz-d/2,root);box(w,h,.3,wall,cx,h/2,cz+d/2,root);box(.3,h,d,wall,cx-w/2,h/2,cz,root);box(.3,h,d,wall,cx+w/2,h/2,cz,root);
      for(const [x,z,sw,sd] of [[cx,cz-d/2+.17,w-.4,.05],[cx,cz+d/2-.17,w-.4,.05],[cx-w/2+.17,cz,.05,d-.4],[cx+w/2-.17,cz,.05,d-.4]])box(sw,1.05,sd,MAT.darkWood,x,.52,z,root);
      for(let i=0;i<5;i++)box(w-.3,.18,.2,MAT.darkWood,cx,h-.05,cz-d/2+1.4+i*2.8,root);// the beams
      // The hearth in the middle of the north wall, with a turf fire.
      const fz=cz-d/2+.5;box(3.4,2.6,.8,stone,cx,1.3,fz,root);box(3.8,.18,1,MAT.darkWood,cx,2.65,fz+.05,root);box(1.6,2.3,.6,stone,cx,3.8,fz-.1,root);
      add(own(new THREE.PlaneGeometry(1.8,1.3)),own(new THREE.MeshBasicMaterial({color:0x140a06})),cx,.75,fz+.405,root);box(2.4,.08,.6,stone,cx,.04,fz+.7,root);
      const turf=own(new THREE.MeshStandardMaterial({color:0x3a2616,roughness:1})),ember=own(new THREE.MeshStandardMaterial({color:0x5a2a10,emissive:0xff6a1e,emissiveIntensity:1.2,roughness:.9}));
      const sods=[];[[-.35,.12,.05,.3],[0,.13,-.05,-.2],[.35,.12,.05,.25],[-.15,.3,0,.6],[.18,.3,.02,-.5]].forEach(([dx,y,dz,a],i)=>{const sod=add(own(new THREE.BoxGeometry(.36,.16,.2)),i>2?ember:turf,cx+dx,y,fz+.55+dz,root);sod.rotation.set(0,a,i>2?.5:.1);sods.push(sod)});
      const flame=own(new THREE.MeshBasicMaterial({color:0xff8a36,transparent:true,opacity:.85}));
      const flames=[[-.2,.8],[.15,1],[0,.7]].map(([dx,s])=>({mesh:add(own(new THREE.ConeGeometry(.12*s,.45*s,7)),flame,cx+dx,.5+.2*s,fz+.55,root),phase:Math.random()*6}));
      const hearthMark=add(own(new THREE.PlaneGeometry(1.6,1)),own(new THREE.MeshBasicMaterial({visible:false})),cx,.7,fz+.5,root);mark(hearthMark,card('fire'));
      fire={flames,light:new THREE.PointLight(0xff8a3a,6,11,2)};fire.light.position.set(cx,1,fz+1.4);root.add(fire.light);block(cx,fz+.25,4,1.5);
      // A St Brigid's cross on the chimney breast: four arms of rushes woven round a square.
      const straw=own(new THREE.MeshStandardMaterial({color:0xc9a860,roughness:.9})),cross=new THREE.Group();cross.position.set(cx,3.3,fz+.23);root.add(cross);
      for(let k=0;k<4;k++){const arm=new THREE.Group();arm.rotation.z=k*Math.PI/2;cross.add(arm);for(const off of [-.045,0,.045])add(own(new THREE.BoxGeometry(.04,.5,.04)),straw,off+.05,.3,0,arm);add(own(new THREE.BoxGeometry(.16,.05,.05)),straw,.05,.5,0,arm)}// each arm off-centre, so the cross turns like a pinwheel
      const core=add(own(new THREE.BoxGeometry(.2,.2,.06)),straw,0,0,.01,cross);core.rotation.z=Math.PI/4;mark(core,card('cross'));
      if(kells)buildShowcase(cx,cz+.4);
      if(durrow)buildSecret(cx,fz);
      // The room's sign above the hearth.
      mark(sign(root,'SEOMRA NA hÉIREANN','The Irish Room',3.2,.6,cx,4.3,fz+.24),card('sign'));
      // Two chairs by the fire, the library's own seats, each opening one of the room's books.
      const fabric=own(new THREE.MeshStandardMaterial({color:0x2e4a33,roughness:.9}));
      for(const [x,z,yaw] of [[cx-2.1,cz-3.2,.6],[cx+2.1,cz-3.2,-.6]]){
        const chair=new THREE.Group();chair.position.set(x,0,z);chair.rotation.y=yaw;root.add(chair);
        const seat=box(1,.42,.9,fabric,0,.4,0,chair),back=box(1,.85,.2,fabric,0,.95,.38,chair);for(const sx of [-.45,.45])box(.14,.32,.9,fabric,sx,.74,0,chair);block(x,z,1.2,1.2);
        if(registerSeat){const data=registerSeat([seat,back],chair,new THREE.Vector3(0,1.3,.12),yaw,{title:'A chair by the turf fire',author:'Sit and read one of the Irish Room’s books.'});
          Object.defineProperty(data,'bookIds',{get:()=>books.map(mesh=>mesh.userData.book.id),configurable:true});ours.push(seat,back)}
      }
      // The harp, in the corner by the door.
      harp(cx+5.4,cz+4.2);
      // The ogham stone, by the door.
      const og=add(own(new THREE.BoxGeometry(.5,1.7,.36)),own(new THREE.MeshStandardMaterial({color:0x7a766c,roughness:1})),cx+2.6,.85,cz+d/2-1,root);og.rotation.y=.25;mark(og,card('ogham'));
      const notch=own(new THREE.MeshStandardMaterial({color:0x3e3b35,roughness:1})),notchGeo=own(new THREE.BoxGeometry(.08,.03,.05));
      [.35,.42,.49,.62,.69,.84,.91,.98,1.05,1.18,1.3,1.37].forEach((y,i)=>{const n=add(notchGeo,notch,0,0,0,root);const side=i%3===1?-1:1;n.position.set(cx+2.6+Math.cos(.25)*.25*side,y,cz+d/2-1-Math.sin(.25)*.25*side+.18);n.rotation.y=.25});
      block(cx+2.6,cz+d/2-1,.8,.7);
      // The books: west wall (myth), east wall (the Revival), either side of the hearth (Irish writers), and a short
      // case beside the door (books in Irish).
      const groups=catalogue(),geometry=own(new THREE.BoxGeometry(.72,.96,.13));
      const wallSpots=(side,count)=>{const out=[],x=side<0?cx-w/2+.3:cx+w/2-.3,yaw=side<0?Math.PI/2:-Math.PI/2;for(let i=0;i<count;i++){const row=i<5?0:1,col=i%5;out.push({x,z:cz-4.4+col*1.9,y:row?2.85:1.55,yaw})}return out};
      const northSpots=count=>{const out=[];for(let i=0;i<count;i++){const half=i%2,k=Math.floor(i/2),row=k<3?0:1,col=k%3;out.push({x:(half?cx+2.6:cx-2.6)+(half?1:-1)*col*1.3,z:cz-d/2+.3,y:row?3.05:1.65,yaw:0})}return out};
      const doorSpots=count=>{const out=[];for(let i=0;i<count;i++)out.push({x:cx-2.4-(i%2)*1.2,z:cz+d/2-.3,y:i<2?1.65:2.95,yaw:Math.PI});return out};
      const spots={myth:wallSpots(-1,10),revival:wallSpots(1,10),writers:northSpots(12),gaeilge:doorSpots(4)};
      for(const group of groups){
        group.books.forEach((book,i)=>placeBook(book,spots[group.key][i],geometry,group.key));
        if(group.key==='myth'||group.key==='revival'){const s=spots[group.key][0];for(const y of [1.55,2.85])box(.34,.05,9.6,MAT.darkWood,s.x,y-.5,cz-.6,root);const label=sign(root,group.name,group.sub,2.9,.52,s.x+(group.key==='myth'?.08:-.08),4.05,cz-.6);label.rotation.y=s.yaw;mark(label,{type:'irish-card',title:group.name,author:group.sub+'.',action:'READ'});block(s.x,cz-.6,.7,10)}
        else if(group.key==='writers'){for(const side of [-1,1])for(const y of [1.65,3.05])box(4,.05,.34,MAT.darkWood,cx+side*3.9,y-.5,cz-d/2+.34,root);const label=sign(root,group.name,group.sub,2.6,.5,cx-3.9,3.85,cz-d/2+.2);mark(label,{type:'irish-card',title:group.name,author:group.sub+'.',action:'READ'});block(cx-3.9,cz-d/2+.4,4.1,.6);block(cx+3.9,cz-d/2+.4,4.1,.6)}
        else{const x=cx-3;for(const y of [1.65,2.95])box(2.6,.05,.34,MAT.darkWood,x,y-.5,cz+d/2-.34,root);const label=sign(root,group.name,group.sub,2.4,.46,x,3.9,cz+d/2-.2);label.rotation.y=Math.PI;mark(label,{type:'irish-card',title:group.name,author:group.sub+'. A small shelf of books written in Irish, for readers of the language and learners.',action:'READ'});block(x,cz+d/2-.4,2.8,.6)}
      }
      // A lamp hung from the middle beam.
      const lamp=new THREE.PointLight(0xffd49a,4.5,15,2);lamp.position.set(cx,h-.6,cz+1.5);root.add(lamp);
      add(own(new THREE.SphereGeometry(.16,12,8)),own(new THREE.MeshStandardMaterial({color:0xffe2a8,emissive:0xffb35c,emissiveIntensity:1.2})),cx,h-.55,cz+1.5,root);
      // The door back to the Grand Hall.
      const exit={type:'irish-exit',title:'Back to the Grand Hall',author:'The lamplit library is just the other side.',action:'RETURN'};
      if(!doorKit?.hang(root,{data:exit,mark,x:cx,z:cz+d/2-.2,yaw:Math.PI,label:'THE GRAND HALL',own,...DOOR_LOOK}))mark(box(1.9,3.1,.16,own(new THREE.MeshStandardMaterial({color:DOOR_LOOK.color,roughness:.7})),cx,1.55,cz+d/2-.2,root),exit);
      scene.add(root);
    }
    // The Book of Kells on show in the middle of the room: a glass case on a plinth, the facsimile lying open in a cradle at
    // a real opening of the manuscript, folio 32v (Christ enthroned) facing 33r (the carpet page), lit from within.
    function buildShowcase(x,z){
      const g=new THREE.Group();g.position.set(x,0,z);root.add(g);
      const brass=MAT.brass||own(new THREE.MeshStandardMaterial({color:0xb08a3e,metalness:.7,roughness:.35}));
      const leaves=kells.folios?Object.keys(kells.folios).length:0;
      const data={type:'irish-kells',title:'The Book of Kells, in facsimile',author:`Leabhar Cheanannais, open at Christ enthroned and the carpet page.${leaves?` ${leaves} of its pages, on board leaves.`:''}`,action:'OPEN'};
      const plinth=box(1.5,.95,1,MAT.darkWood,0,.475,0,g);box(1.6,.06,1.1,MAT.darkWood,0,.97,0,g);box(1.6,.08,1.1,MAT.darkWood,0,.04,0,g);
      // The open book: two pages in a cradle, each sloping down from the spine.
      const loader=THREE.TextureLoader?new THREE.TextureLoader():null,pageW=.52,pageH=.68;
      const page=(key,side)=>{const map=loader?own(loader.load(`assets/kells/${key}-case.jpg`)):null;if(map&&THREE.SRGBColorSpace)map.colorSpace=THREE.SRGBColorSpace;
        const mat=own(new THREE.MeshStandardMaterial({color:0xd6cdbb,map,emissive:0xffffff,emissiveMap:map,emissiveIntensity:.1,roughness:.9}));
        const hinge=new THREE.Group();hinge.position.set(side*.01,1.09,0);hinge.rotation.z=side*-.16;g.add(hinge);
        const m=add(own(new THREE.PlaneGeometry(pageW,pageH)),mat,side*pageW/2,0,0,hinge);m.rotation.x=-Math.PI/2;return m};
      const left=page('032v',-1),right=page('033r',1);
      for(const side of [-1,1]){const wedge=box(.56,.08,.7,MAT.darkWood,side*.28,.95,0,g);wedge.rotation.z=side*-.16}
      // The glass, with brass at its edges.
      const glass=own(new THREE.MeshStandardMaterial({color:0xdfeee8,transparent:true,opacity:.045,roughness:.05,depthWrite:false}));
      const pane=box(1.42,.5,1,glass,0,1.25,0,g);
      for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]])box(.03,.5,.03,brass,sx*.71,1.25,sz*.5,g);
      for(const sz of [-1,1])box(1.45,.03,.03,brass,0,1.5,sz*.5,g);for(const sx of [-1,1])box(.03,.03,1.03,brass,sx*.71,1.5,0,g);
      // Its card, on the front of the plinth.
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle='#14281c';c.fillRect(0,0,W,H);knot(c,W,H,'#c9a45a');c.fillStyle='#f1e2b8';c.textAlign='center';c.font='bold 34px Georgia';c.fillText('LEABHAR CHEANANNAIS',W/2,64);
        c.font='italic 24px Georgia';c.fillText('The Book of Kells, about the year 800',W/2,100);c.font='20px Georgia';c.fillText('A facsimile. Trinity College Dublin, MS 58',W/2,134)},560,160));
      const label=add(own(new THREE.PlaneGeometry(1.05,.3)),own(new THREE.MeshStandardMaterial({map,emissive:0x3a2a12,emissiveIntensity:.3,roughness:.85})),0,.7,.505,g);
      for(const part of [plinth,pane,left,right,label])mark(part,data);
      block(x,z,1.8,1.3);
    }
    // A creel of turf beside the hearth, a sod fallen from it, and under the sod a hollow in the boards with the book.
    function buildSecret(cx,fz){
      const turf=own(new THREE.MeshStandardMaterial({color:0x3a2616,roughness:1})),wicker=own(new THREE.MeshStandardMaterial({color:0x4e361c,roughness:.95})),dark=own(new THREE.MeshStandardMaterial({color:0x120b06,roughness:1}));
      const creel=new THREE.Group();creel.position.set(cx+1.78,0,fz+.98);creel.rotation.y=.3;root.add(creel);
      // Woven willow: upright staves with rods wound round them.
      const weave=own(canvasTexture((c,W,H)=>{c.fillStyle='#4a331b';c.fillRect(0,0,W,H);for(let y=0;y<H;y+=8){c.fillStyle=(y/8)%2?'#6b4a26':'#5c3f20';c.fillRect(0,y,W,6);c.fillStyle='rgba(0,0,0,.35)';for(let x=(y/8)%2?0:16;x<W;x+=32)c.fillRect(x,y,4,8)}},256,64));
      weave.wrapS=weave.wrapT=THREE.RepeatWrapping;weave.repeat?.set(3,2);
      add(own(new THREE.CylinderGeometry(.34,.27,.5,18,1,true)),own(new THREE.MeshStandardMaterial({map:weave,color:0xb08a5a,roughness:1,side:THREE.DoubleSide})),0,.25,0,creel);
      for(const y of [.06,.5])add(own(new THREE.TorusGeometry(y>.3?.34:.275,.022,6,20)),wicker,0,y,0,creel).rotation.x=Math.PI/2;add(own(new THREE.CylinderGeometry(.27,.27,.04,14)),wicker,0,.02,0,creel);
      [[-.1,.46,.05,.4],[.12,.47,-.08,-.3],[0,.58,.04,1.2],[-.06,.62,-.06,.1]].forEach(([x,y,z,a])=>{const s=add(own(new THREE.BoxGeometry(.3,.13,.17)),turf,x,y,z,creel);s.rotation.set(.15,a,.1)});
      block(cx+1.78,fz+.98,.75,.75);
      const at={x:cx+1,z:fz+1.6},found=wasFound();
      // The hollow: a dark space between lifted boards, and the book lying in it.
      const hollow=new THREE.Group();hollow.position.set(at.x,0,at.z);hollow.visible=found;root.add(hollow);
      const pit=add(own(new THREE.PlaneGeometry(.84,1.08)),dark,0,.004,0,hollow);pit.rotation.x=-Math.PI/2;
      for(const [w,d,x,z] of [[.92,.06,0,-.57],[.92,.06,0,.57],[.06,1.08,-.45,0],[.06,1.08,.45,0]])add(own(new THREE.BoxGeometry(w,.03,d)),MAT.darkWood,x,.012,z,hollow);
      const closed=own(durrow.closedBook(.5));closed.group.position.set(0,.006,0);closed.group.rotation.y=.06;hollow.add(closed.group);
      const bookData={type:'irish-durrow',title:'The Book of Durrow, in facsimile',author:'Leabhar Darú, the older Gospel book of Colum Cille’s community, hidden under a sod as the Book of Kells once was. Its pages are board.',action:'OPEN'};
      const reveal=()=>{for(const part of closed.parts)mark(part,bookData)};if(found)reveal();
      const sod=add(own(new THREE.BoxGeometry(.56,.17,.34)),turf,0,0,0,root);
      const rest={x:at.x,y:.085,z:at.z,ry:.4,rz:.06},aside={x:at.x-.62,y:.085,z:at.z+.55,ry:1.3,rz:0};
      const where=found?aside:rest;sod.position.set(where.x,where.y,where.z);sod.rotation.set(0,where.ry,where.rz);
      if(!found)mark(sod,{type:'irish-sod',title:'A sod of turf on the floor',author:'Fallen from the creel, perhaps. It is cut cleaner than the rest, and it does not lie flat.',action:'LIFT'});
      secret={sod,hollow,rest,aside,reveal,lift:found?1:0,lifting:false};
    }
    function liftSod(){
      if(!secret||secret.lifting||secret.lift>=1)return;secret.lifting=true;secret.hollow.visible=true;secret.reveal();
      const i=interactables.indexOf(secret.sod);if(i>=0)interactables.splice(i,1);secret.sod.userData={};
      playSample?.('stoneStep0',.35,.7);
      try{storage?.setItem(FOUND_KEY,'1')}catch(e){}
      analytics?.track('Secret Found',{secret:'irish-durrow'});
      showNotice('Under the sod there is a book: the Book of Durrow, older than Kells by a century or more and the earliest of the great Irish Gospel books to survive, painted in the second half of the seventh century. In the 1600s a farmer who kept it was said to pour water over it to cure his sick cattle. This one is a facsimile, and its pages are board.',15);
    }
    // A harp on a low stand: soundbox, neck and forepillar, and its strings.
    function harp(x,z){
      const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=-Math.PI/2+.35;root.add(g);
      const willow=own(new THREE.MeshStandardMaterial({color:0x7a4a24,roughness:.6})),brass=MAT.brass,wire=own(new THREE.MeshStandardMaterial({color:0xd9c28a,metalness:.7,roughness:.3}));
      box(.7,.5,.5,MAT.darkWood,0,.25,0,g);
      const soundbox=add(own(new THREE.BoxGeometry(.16,1.05,.14)),willow,-.18,1.02,0,g);soundbox.rotation.z=-.18;
      const pillar=add(own(new THREE.CylinderGeometry(.035,.045,1.12,8)),willow,.3,1.06,0,g);pillar.rotation.z=.08;
      const neck=add(own(new THREE.BoxGeometry(.6,.08,.08)),willow,.05,1.6,0,g);neck.rotation.z=-.12;
      for(let i=0;i<9;i++){const sx=-.12+i*.045,top=1.6-(sx+.05)*.12-.05,bottom=.62+(sx+.18)*1.2;const len=Math.max(.1,top-bottom);add(own(new THREE.CylinderGeometry(.004,.004,len,4)),wire,sx,bottom+len/2,0,g)}
      add(own(new THREE.SphereGeometry(.04,8,6)),brass,.33,1.64,0,g);
      mark(soundbox,card('harp'));mark(pillar,card('harp'));block(x,z,.9,.9);
    }
    function placeBook(book,spot,geometry,group){
      if(!spot)return null;
      const mesh=add(geometry,own(bookMaterial(book)),spot.x,spot.y,spot.z,root);mesh.rotation.order='YXZ';mesh.rotation.y=spot.yaw;mesh.rotation.x=-.08;
      mesh.userData={type:'book',book,loaded:false,irish:true,shelf:group,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:root}};
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
    function enter(){
      activate();move(ROOM.cx,ROOM.cz+ROOM.d/2-1.4,0);playSample?.('doorOpen',.8,.96);
      showNotice('Seomra na hÉireann, the Irish Room. A turf fire, the old stories and the writers of Ireland, a shelf of books in Irish, and under glass, the Book of Kells, open for you to turn. Fáilte romhat.',10);
      analytics?.track('Room Explored',{room:'irish-room'});
    }
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('irish-'))return false;
      if(data.type==='irish-door'){through(data,enter);return true}
      if(data.type==='irish-exit'){through(data,()=>{move(DOOR.x+Math.sin(DOOR.yaw)*1.9,DOOR.z+Math.cos(DOOR.yaw)*1.9,DOOR.yaw+Math.PI);playSample?.('doorOpen',.8,1);showNotice('The Grand Hall again.',3)});return true}
      if(data.type==='irish-card'){showNotice(`${data.title}: ${data.author}`,9);return true}
      if(data.type==='irish-sod'){liftSod();return true}
      if(data.type==='irish-kells'){kells?.open();return true}
      if(data.type==='irish-durrow'){durrow?.open();return true}
      return false;
    }

    // ---------- lifecycle ----------
    function activate(){if(!root)buildRoom();lastNeeded=time}
    function unload(){
      if(!root)return;root.removeFromParent();root=null;fire=null;secret=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0;
    }
    function update(t,dt=0,reduced=false){
      time=t;const inside=contains(player.pos.x,player.pos.z),near=Math.hypot(player.pos.x-DOOR.x,player.pos.z-DOOR.z)<PRELOAD;
      if(inside||near)activate();
      else if(root&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==root))unload();
      // The sod is lifted and set down beside the hollow.
      if(secret?.lifting){const s=secret,k=Math.min(1,s.lift+dt/.7),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,a=s.rest,b=s.aside;s.lift=k;
        s.sod.position.set(a.x+(b.x-a.x)*e,a.y+(b.y-a.y)*e+Math.sin(k*Math.PI)*.45,a.z+(b.z-a.z)*e);s.sod.rotation.set(0,a.ry+(b.ry-a.ry)*e,a.rz*(1-e));if(k>=1)s.lifting=false}
      if(fire&&inside&&!reduced){for(const f of fire.flames)f.mesh.scale.y=1+Math.sin(t*8+f.phase)*.16;fire.light.intensity=6+Math.sin(t*5)*.7+Math.sin(t*11.3)*.3}
    }
    buildDoor();
    return {contains,floorAt,allowed,interact,update,enter,unload,catalogue,door:DOOR,room:ROOM,groups:GROUPS,records:RECORDS,get built(){return !!root},get books(){return books.slice()},get durrowFound(){return !!secret&&secret.lift>0},zoneAt:(x,z)=>contains(x,z)?'irish-room':null};
  };
})();
