// The Austen Room: a Regency drawing room behind a door in the Grand Hall's west wall, beside the gramophone, for Jane
// Austen. Her six novels stand face-out on the north wall between two sash windows, in the order they were published,
// under a silhouette; the west wall holds what else she wrote (the juvenilia, Lady Susan, the unfinished novels, her
// letters) and the books her family and her first critics wrote about her; the east wall, the books she read and her
// characters argue over. A little round writing table stands by the window, a square pianoforte in the corner plays a
// few bars, and the door creaks, as the swing door at Chawton did, which she would not have mended because it warned
// her that someone was coming.
//
// The room's secret is Catherine Morland's: a high, old-fashioned black cabinet, japanned in black and yellow. Open it
// and there is a roll of paper at the back, which by daylight is only a list of linen; behind it, where Catherine never
// looked, someone has kept Mrs Radcliffe. Once found it stays found (athenaeum-austen-cabinet; ?udolpho opens it).
// Like the other rooms behind doors, nothing is built until the reader walks up to it, and it is freed a little while
// after they leave.
(function(){
  'use strict';

  // The six novels, in the order they were published. Five are the library's own copies, already in its catalogue;
  // Northanger Abbey, which came out with Persuasion after her death, is a new arrival (data/new-books.js, austen-novels).
  const NOVELS=[161,1342,141,158,121,105];
  // The other shelves are the new arrivals for each (data/new-books.js, rooms austen-*), with any listed here first.
  const GROUPS=[
    {key:'writings',name:'IN HER OWN HAND',sub:'The juvenilia, the letters and the unfinished novels',wall:'west',along:-2.9,length:5.2,ids:[]},
    {key:'lives',name:'HER FAMILY AND HER CRITICS',sub:'The first lives of Jane Austen',wall:'west',along:2.7,length:5.2,ids:[]},
    {key:'read',name:'WHAT SHE READ',sub:'And what her characters argue over',wall:'east',along:-.3,length:10.6,ids:[]}
  ];
  // Mrs Radcliffe, in the black cabinet: The Mysteries of Udolpho is the library's own copy.
  const CABINET=[3268];
  const CARDS={
    sign:['The Austen Room','Jane Austen’s six novels, in the order they were published, with what else she wrote, what she read, and the first books written about her. Sit down; nobody here will ask you to play.'],
    novels:['Her six novels','Sense and Sensibility (1811), Pride and Prejudice (1813), Mansfield Park (1814) and Emma (1815) came out in her lifetime, all of them anonymously. Northanger Abbey and Persuasion were published together a few months after her death in July 1817, with a notice by her brother Henry that at last gave her name.'],
    silhouette:['L’aimable Jane','A cut-paper silhouette of a young woman, of the kind sold to visitors at Bath. One very like it was found pasted into a copy of the second edition of Mansfield Park, inscribed “L’aimable Jane”, and is now in the National Portrait Gallery; nobody can be quite sure it is her.'],
    table:['A little round writing table','Her nephew’s Memoir says she wrote in the family sitting-room, on small sheets of paper that could be put away or covered with blotting paper when anyone came in. A swing door between the rooms creaked when it opened, and she would not have it seen to, because it gave her warning.'],
    door:['The door that creaks','It has not been oiled, and is not to be.'],
    window:['A sash window','Night, and the lane outside. A carriage would be heard a long way off.'],
    rug:['A Turkey carpet','Knotted carpets from Turkey and Persia were laid in English drawing rooms through the eighteenth century, and by the end of it there were English copies of them too.'],
    piano:['A square pianoforte','Her niece Caroline remembered that she practised every morning, before the rest of the house was about. Her music books survive, copied out in her own hand: songs, marches and country dances.']
  };
  // A country-dance strain for the pianoforte: the melody (in hertz) and how long each note is held, in beats.
  const TUNE=[[392,1],[392,.5],[440,.5],[494,1],[392,1],[523,1],[494,.5],[440,.5],[392,1],[370,1],[392,2]];

  window.createAustenRoom=function(options){
    const {THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,arrivals={},showNotice,playSample,move,analytics,isHolding=()=>false,registerSeat=null,doorKit=null,tone=null,storage=window.localStorage}=options;
    // In the Grand Hall's west wall, between the gramophone's listening corner (z 10) and the botanist's portrait (from
    // z 17.25), on the hall floor. (Not the east side south of the stair: the upper gallery runs over it, and the floor
    // there is the gallery's.)
    const DOOR={x:-18.72,z:12.9,yaw:Math.PI/2};
    const ROOM={cx:500,cz:-160,w:16,d:14,h:5};
    const PRELOAD=7,KEEP=25;
    // The room's side of its door: a Regency door painted a soft grey-green, with a fanlight.
    const DOOR_LOOK={style:'painted',color:0x6d7f73,fanColor:0xffd9a0,width:1.9,height:3.1};
    const through=(data,go)=>doorKit&&data.kit?doorKit.pass(data.kit,data,go):go();
    const FOUND_KEY='athenaeum-austen-cabinet';
    const wasFound=()=>{try{return storage?.getItem(FOUND_KEY)==='1'||/[?&]udolpho\b/.test(location.search)}catch(e){return false}};
    let root=null,time=0,lastNeeded=-1e9,cabinet=null,lastCreak=-1e9;
    const owned=[],ours=[],books=[],blockers=[];
    const own=thing=>{owned.push(thing);return thing};
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    // The door in the hall stays when the room is freed, so its parts are not among the room's own.
    function markDoor(object,data){object.userData=data;interactables.push(object);return object}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const card=key=>({type:'austen-card',title:CARDS[key][0],author:CARDS[key][1],action:'READ'});
    function sign(parent,text,sub,w,h,x,y,z){
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle='#f1ead8';c.fillRect(0,0,W,H);c.strokeStyle='#8a6d3b';c.lineWidth=3;c.strokeRect(7,7,W-14,H-14);c.strokeRect(13,13,W-26,H-26);
        c.fillStyle='#3b3226';c.textAlign='center';c.font='30px Georgia';c.fillText(text,W/2,sub?50:H/2+11);if(sub){c.font='italic 21px Georgia';c.fillText(sub,W/2,84)}},620,sub?104:70));
      return add(own(new THREE.PlaneGeometry(w,h)),own(new THREE.MeshStandardMaterial({map,emissive:0x3a3226,emissiveIntensity:.25,roughness:.9})),x,y,z,parent);
    }

    // The books for each shelf: those listed, then the new arrivals; a book the library does not hold is left out.
    const shelfBooks=(ids,room,max)=>[...new Set([...ids,...(arrivals[room]||[])])].map(id=>findBook(id)).filter(Boolean).slice(0,max);
    function catalogue(){
      return {novels:shelfBooks(NOVELS,'novels',6),
        groups:GROUPS.map(group=>({...group,books:shelfBooks(group.ids,group.key,group.wall==='east'?12:6)})),
        cabinet:shelfBooks(CABINET,'horrid',4)};
    }

    // ---------- the door, in the Grand Hall ----------
    function buildDoor(){
      const g=new THREE.Group();g.name='austen-door';g.position.set(DOOR.x,0,DOOR.z);g.rotation.y=DOOR.yaw;scene.add(g);
      const data={type:'austen-door',title:'The Austen Room',author:'Jane Austen’s six novels, what else she wrote, and what she read, in a Regency drawing room.',action:'ENTER'};
      if(!doorKit?.hang(g,{data,mark:markDoor,...DOOR_LOOK,...doorKit.readingRoom?.('THE AUSTEN ROOM','Jane Austen, 1775–1817')}))markDoor(add(new THREE.BoxGeometry(1.9,3.1,.14),new THREE.MeshStandardMaterial({color:DOOR_LOOK.color,roughness:.7}),0,1.55,.08,g),data);
    }

    // ---------- the room ----------
    function buildRoom(){
      root=new THREE.Group();root.name='austen-room';const {cx,cz,w,d,h}=ROOM;
      // Walls in a soft green distemper above a painted dado, a white cornice, boarded floor and a pale ceiling.
      const wall=own(new THREE.MeshStandardMaterial({color:0x9aa58c,roughness:.95})),dado=own(new THREE.MeshStandardMaterial({color:0xd6cfbb,roughness:.8})),white=own(new THREE.MeshStandardMaterial({color:0xece6d6,roughness:.7})),ceiling=own(new THREE.MeshStandardMaterial({color:0xa79e8a,roughness:.95}));
      const mahogany=own(new THREE.MeshStandardMaterial({color:0x5a2a18,roughness:.5,map:MAT.wood?.map||null}));
      box(w,.3,d,MAT.wood,cx,-.15,cz,root);box(w,.25,d,ceiling,cx,h+.12,cz,root);
      box(w,h,.3,wall,cx,h/2,cz-d/2,root);box(w,h,.3,wall,cx,h/2,cz+d/2,root);box(.3,h,d,wall,cx-w/2,h/2,cz,root);box(.3,h,d,wall,cx+w/2,h/2,cz,root);
      for(const [x,z,sw,sd] of [[cx,cz-d/2+.17,w-.4,.05],[cx,cz+d/2-.17,w-.4,.05],[cx-w/2+.17,cz,.05,d-.4],[cx+w/2-.17,cz,.05,d-.4]]){box(sw,.9,sd,dado,x,.45,z,root);box(sw+.02,.05,sd+.03,white,x,.92,z,root)}
      for(const [x,z,sw,sd] of [[cx,cz-d/2+.2,w-.4,.14],[cx,cz+d/2-.2,w-.4,.14],[cx-w/2+.2,cz,.14,d-.4],[cx+w/2-.2,cz,.14,d-.4]])box(sw,.22,sd,white,x,h-.12,z,root);
      mark(sign(root,'THE AUSTEN ROOM','Jane Austen, 1775–1817',3.6,.6,cx,4.45,cz-d/2+.17),card('sign'));
      const {novels,groups,cabinet:hidden}=catalogue(),geometry=own(new THREE.BoxGeometry(.72,.96,.13));
      // The six novels on the north wall, face-out on a mahogany shelf, under the silhouette.
      const gap=.84;novels.forEach((book,i)=>placeBook(book,{x:cx+(i-(novels.length-1)/2)*gap,y:1.55,z:cz-d/2+.3,yaw:0},geometry,'novels'));
      box(5.4,.06,.4,mahogany,cx,1.05,cz-d/2+.36,root);box(5.6,1.05,.36,mahogany,cx,.52,cz-d/2+.34,root);block(cx,cz-d/2+.4,5.8,.75);
      const novelsCard={...card('novels')};mark(sign(root,'HER SIX NOVELS','In the order they were published, 1811–1817',2.9,.46,cx,3.55,cz-d/2+.17),novelsCard);
      buildSilhouette(cx,2.55,cz-d/2+.18);
      for(const side of [-1,1])buildWindow(cx+side*5.6,cz-d/2+.16);
      // The west and east walls: two rows of books, each run under its own label.
      const ROWS=[1.45,2.6];
      for(const group of groups){
        const per=Math.max(1,Math.ceil(group.books.length/2)),step=Math.min(1.25,(group.length-.4)/per),side=group.wall==='west'?-1:1,x=cx+side*(w/2-.3),zc=cz+group.along;
        group.books.forEach((book,i)=>{const row=i<per?0:1,n=row?group.books.length-per:per,col=row?i-per:i,offset=(col-(n-1)/2)*step;
          placeBook(book,{x,y:ROWS[row],z:zc+side*-offset,yaw:-side*Math.PI/2},geometry,group.key)});
        for(const y of ROWS)box(.36,.05,group.length,mahogany,cx+side*(w/2-.35),y-.5,zc,root);block(cx+side*(w/2-.35),zc,.7,group.length+.2);
        const label=sign(root,group.name,group.sub,2.9,.46,cx+side*(w/2-.17),3.55,zc);label.rotation.y=-side*Math.PI/2;mark(label,{type:'austen-card',title:group.name.charAt(0)+group.name.slice(1).toLowerCase(),author:group.sub+'.',action:'READ'});
      }
      buildRug(cx,cz+.4);
      buildSofa(cx,cz+2.2);
      buildWritingTable(cx-4.4,cz-3.9);
      buildPiano(cx+4.6,cz+d/2-.75);
      buildCabinet(cx-4.6,cz+d/2-.5,hidden);
      // A lamp hung from the ceiling rose, and candles that glow without lights of their own.
      const lamp=new THREE.PointLight(0xffd9a6,6.5,17,2);lamp.position.set(cx,h-1.3,cz);root.add(lamp);
      add(own(new THREE.SphereGeometry(.3,16,10)),own(new THREE.MeshStandardMaterial({color:0xfff1d0,emissive:0xffc87a,emissiveIntensity:.95,roughness:.4,transparent:true,opacity:.9})),cx,h-1.15,cz,root);
      add(own(new THREE.CylinderGeometry(.008,.008,.9,4)),MAT.brass||MAT.darkWood,cx,h-.5,cz,root);
      // The door back to the Grand Hall.
      const exit={type:'austen-exit',title:'Back to the Grand Hall',author:'The door creaks. It always has.',action:'RETURN'};
      if(!doorKit?.hang(root,{data:exit,mark,x:cx,z:cz+d/2-.2,yaw:Math.PI,label:'THE GRAND HALL',own,...DOOR_LOOK}))mark(box(1.9,3.1,.16,own(new THREE.MeshStandardMaterial({color:DOOR_LOOK.color,roughness:.7})),cx,1.55,cz+d/2-.2,root),exit);
      scene.add(root);
    }
    function buildSilhouette(x,y,z){
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle='#efe6cf';c.fillRect(0,0,W,H);c.fillStyle='#16120e';c.beginPath();
        // A young woman's head and shoulders in profile, facing left, with her hair up.
        c.moveTo(W*.36,H*.92);c.bezierCurveTo(W*.38,H*.78,W*.4,H*.72,W*.42,H*.66);c.lineTo(W*.39,H*.6);c.lineTo(W*.37,H*.56);c.lineTo(W*.39,H*.53);c.lineTo(W*.36,H*.5);
        c.lineTo(W*.38,H*.47);c.lineTo(W*.36,H*.42);c.bezierCurveTo(W*.37,H*.33,W*.42,H*.26,W*.5,H*.25);c.bezierCurveTo(W*.56,H*.17,W*.68,H*.17,W*.7,H*.27);
        c.bezierCurveTo(W*.75,H*.33,W*.66,H*.42,W*.64,H*.5);c.bezierCurveTo(W*.62,H*.6,W*.6,H*.66,W*.62,H*.72);c.bezierCurveTo(W*.74,H*.78,W*.8,H*.86,W*.82,H*.92);c.closePath();c.fill()},180,240));
      const g=new THREE.Group();g.position.set(x,y,z);root.add(g);
      const frame=add(own(new THREE.CylinderGeometry(.34,.34,.05,28)),MAT.brass||MAT.darkWood,0,0,0,g);frame.rotation.x=Math.PI/2;frame.scale.set(1,1,1.3);
      const oval=add(own(new THREE.CircleGeometry(.29,28)),own(new THREE.MeshStandardMaterial({map,emissive:0x2a2418,emissiveIntensity:.2,roughness:.9})),0,0,.03,g);oval.scale.set(1,1.3,1);
      for(const part of [frame,oval])mark(part,card('silhouette'));
    }
    function buildWindow(x,z){
      // A sash window looking out on a moonlit night: the glass is a painted texture, so it needs no light.
      const map=own(canvasTexture((c,W,H)=>{const sky=c.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#0c1426');sky.addColorStop(1,'#26344a');c.fillStyle=sky;c.fillRect(0,0,W,H);
        c.fillStyle='#e9e4cf';c.beginPath();c.arc(W*.7,H*.2,12,0,Math.PI*2);c.fill();c.fillStyle='rgba(255,255,255,.7)';for(let i=0;i<28;i++)c.fillRect((i*73)%W,(i*41)%(H*.5),2,2);
        c.fillStyle='#0b0f14';c.beginPath();c.moveTo(0,H*.78);for(let i=0;i<=8;i++)c.lineTo(W*i/8,H*(.7-.06*Math.sin(i*1.7)));c.lineTo(W,H);c.lineTo(0,H);c.fill()},128,256));
      const g=new THREE.Group();g.position.set(x,2.35,z);root.add(g);
      const glass=add(own(new THREE.PlaneGeometry(1.4,2.6)),own(new THREE.MeshStandardMaterial({map,emissive:0xffffff,emissiveMap:map,emissiveIntensity:.35,roughness:.2})),0,0,.02,g);
      const paint=own(new THREE.MeshStandardMaterial({color:0xe9e3d3,roughness:.6}));
      for(const [w,h,px,py] of [[1.6,.1,0,1.35],[1.6,.1,0,-1.35],[.1,2.8,-.75,0],[.1,2.8,.75,0],[1.4,.06,0,0],[.04,2.6,0,0],[1.4,.04,0,.65],[1.4,.04,0,-.65]])box(w,h,.06,paint,px,py,.05,g);
      box(1.8,.08,.25,paint,0,-1.42,.12,g);
      // Curtains either side, falling to the floor.
      const curtain=own(new THREE.MeshStandardMaterial({color:0x7a2f2a,roughness:.9}));for(const side of [-1,1])box(.34,3.4,.1,curtain,side*.98,-.3,.1,g);
      mark(glass,card('window'));
    }
    function buildRug(x,z){
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle='#7c2a22';c.fillRect(0,0,W,H);c.strokeStyle='#1f2f4a';c.lineWidth=16;c.strokeRect(14,14,W-28,H-28);c.strokeStyle='#d9b56a';c.lineWidth=4;c.strokeRect(30,30,W-60,H-60);
        c.fillStyle='#1f2f4a';c.beginPath();c.moveTo(W/2,H*.22);c.lineTo(W*.72,H/2);c.lineTo(W/2,H*.78);c.lineTo(W*.28,H/2);c.closePath();c.fill();c.fillStyle='#d9b56a';c.beginPath();c.moveTo(W/2,H*.34);c.lineTo(W*.6,H/2);c.lineTo(W/2,H*.66);c.lineTo(W*.4,H/2);c.closePath();c.fill();
        c.fillStyle='#e8dcc0';for(let i=0;i<10;i++){c.fillRect(48+i*(W-96)/9-4,44,8,8);c.fillRect(48+i*(W-96)/9-4,H-52,8,8)}},256,384));
      const rug=add(own(new THREE.PlaneGeometry(4.4,5.6)),own(new THREE.MeshStandardMaterial({map,roughness:.95})),x,.012,z,root);rug.rotation.x=-Math.PI/2;mark(rug,card('rug'));
    }
    // A sofa in pale silk, facing the novels: one of the library's seats.
    function buildSofa(x,z){
      const silk=own(new THREE.MeshStandardMaterial({color:0xc9b98a,roughness:.75})),g=new THREE.Group();g.position.set(x,0,z);root.add(g);
      const seat=box(2.1,.22,.8,silk,0,.5,0,g),back=box(2.1,.6,.14,silk,0,.88,.36,g);
      for(const side of [-1,1])box(.12,.36,.8,silk,side*1.06,.72,0,g);for(const sx of [-.95,.95])for(const sz of [-.32,.32])box(.07,.4,.07,MAT.darkWood,sx,.2,sz,g);
      block(x,z,2.4,1.1);
      if(registerSeat){const data=registerSeat([seat,back],g,new THREE.Vector3(0,1.2,.05),0,{title:'A sofa in pale silk',author:'Sit and read one of the Austen Room’s books.'});
        Object.defineProperty(data,'bookIds',{get:()=>books.map(mesh=>mesh.userData.book.id),configurable:true});ours.push(seat,back)}
    }
    // The little twelve-sided table she wrote at, with a writing slope, sheets of paper, a quill and a candle.
    function buildWritingTable(x,z){
      const walnut=own(new THREE.MeshStandardMaterial({color:0x4a2c18,roughness:.5,map:MAT.wood?.map||null})),g=new THREE.Group();g.position.set(x,0,z);root.add(g);
      const top=add(own(new THREE.CylinderGeometry(.42,.42,.04,12)),walnut,0,.74,0,g),stem=add(own(new THREE.CylinderGeometry(.04,.06,.66,8)),walnut,0,.4,0,g);
      for(let i=0;i<3;i++){const foot=box(.36,.04,.06,walnut,Math.cos(i*2.094)*.16,.05,Math.sin(i*2.094)*.16,g);foot.rotation.y=-i*2.094}
      const slope=box(.42,.06,.3,walnut,0,.8,.02,g);slope.rotation.x=.18;
      const paper=own(new THREE.MeshStandardMaterial({color:0xf3ecd8,roughness:.95}));for(const [px,pz,r] of [[-.02,.0,.1],[.05,-.03,-.2]]){const sheet=box(.16,.004,.2,paper,px,.85,pz,g);sheet.rotation.set(.18,r,0)}
      const quill=box(.012,.012,.3,paper,.15,.86,-.06,g);quill.rotation.set(0,.6,.2);add(own(new THREE.CylinderGeometry(.03,.035,.05,10)),own(new THREE.MeshStandardMaterial({color:0x111111,roughness:.3})),.2,.79,-.12,g);
      add(own(new THREE.CylinderGeometry(.018,.018,.16,8)),paper,-.25,.84,-.15,g);add(own(new THREE.SphereGeometry(.022,8,6)),own(new THREE.MeshStandardMaterial({color:0xffc870,emissive:0xffa040,emissiveIntensity:2})),-.25,.94,-.15,g);
      for(const part of [top,stem,slope])mark(part,card('table'));block(x,z,1,1);
      // A plain chair at it, one of the library's seats.
      const cx=x+.1,cz=z+.75,chair=new THREE.Group();chair.position.set(cx,0,cz);root.add(chair);
      const seat=box(.5,.06,.48,walnut,0,.46,0,chair),back=box(.5,.5,.05,walnut,0,.75,.22,chair);for(const lx of [-.21,.21])for(const lz of [-.2,.2])box(.04,.44,.04,walnut,lx,.22,lz,chair);block(cx,cz,.65,.65);
      if(registerSeat){const data=registerSeat([seat,back],chair,new THREE.Vector3(0,1.2,.05),0,{title:'The chair at the writing table',author:'Sit and read, and listen for the door.'});
        Object.defineProperty(data,'bookIds',{get:()=>books.map(mesh=>mesh.userData.book.id),configurable:true});ours.push(seat,back)}
    }
    // A square pianoforte on turned legs, with its music on the stand and a candle.
    function buildPiano(x,z){
      const g=new THREE.Group();g.position.set(x,0,z);root.add(g);const mahogany=own(new THREE.MeshStandardMaterial({color:0x4b1f12,roughness:.4,metalness:.05}));
      const body=box(1.7,.3,.62,mahogany,0,.82,0,g);const lid=box(1.72,.03,.64,mahogany,0,.985,0,g);
      for(const sx of [-.75,.75])for(const sz of [-.24,.24])add(own(new THREE.CylinderGeometry(.035,.025,.68,8)),mahogany,sx,.34,sz,g);
      const keys=own(canvasTexture((c,W,H)=>{c.fillStyle='#efe8d6';c.fillRect(0,0,W,H);c.fillStyle='#1a1410';for(let i=0;i<W;i+=8){c.fillRect(i,0,1,H);if([1,2,4,5,6].includes((i/8)%7))c.fillRect(i+5,0,5,H*.6)}},480,40));
      const board=add(own(new THREE.PlaneGeometry(1.2,.14)),own(new THREE.MeshStandardMaterial({map:keys,roughness:.5})),.1,.975,-.25,g);board.rotation.x=-Math.PI/2;
      const music=box(.4,.28,.01,own(new THREE.MeshStandardMaterial({color:0xf0e6cc,roughness:.95})),.1,1.13,.12,g);music.rotation.x=-.25;
      for(const part of [body,lid,board,music])mark(part,{type:'austen-piano',title:CARDS.piano[0],author:CARDS.piano[1],action:'PLAY'});
      block(x,z,1.9,.85);
    }
    // Catherine Morland's black cabinet, japanned in black and gold on a gilt stand, with its doors shut.
    function buildCabinet(x,z,hidden){
      const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=Math.PI;root.add(g);
      const lacquer=own(new THREE.MeshStandardMaterial({color:0x0e0c0b,roughness:.25,metalness:.15})),gilt=MAT.brass||own(new THREE.MeshStandardMaterial({color:0xb08a3e,metalness:.7,roughness:.35}));
      const japan=own(canvasTexture((c,W,H)=>{c.fillStyle='#0e0c0b';c.fillRect(0,0,W,H);c.strokeStyle='#c9a24e';c.lineWidth=3;c.strokeRect(8,8,W-16,H-16);c.fillStyle='#c9a24e';c.strokeStyle='#c9a24e';
        // Chinoiserie in gold: a pagoda roof, a willow and a bridge, and two birds.
        c.beginPath();c.moveTo(W*.2,H*.36);c.lineTo(W*.5,H*.26);c.lineTo(W*.8,H*.36);c.closePath();c.fill();c.fillRect(W*.3,H*.36,W*.4,H*.14);c.fillStyle='#0e0c0b';c.fillRect(W*.45,H*.4,W*.1,H*.1);c.fillStyle='#c9a24e';
        c.lineWidth=2;c.beginPath();c.arc(W*.5,H*.82,W*.3,Math.PI*1.15,Math.PI*1.85);c.stroke();for(let i=0;i<7;i++){c.beginPath();c.moveTo(W*.15,H*.12);c.quadraticCurveTo(W*(.08+i*.03),H*.3,W*(.04+i*.04),H*(.5+i*.03));c.stroke()}
        for(const [bx,by] of [[.7,.15],[.8,.2]]){c.beginPath();c.moveTo(W*bx-8,H*by);c.quadraticCurveTo(W*bx,H*by-6,W*bx+8,H*by);c.stroke()}},128,256));
      const doorMat=own(new THREE.MeshStandardMaterial({map:japan,roughness:.3,metalness:.1}));
      const stand=box(1.24,.06,.56,gilt,0,.68,0,g);for(const sx of [-.56,.56])for(const sz of [-.22,.22])box(.05,.66,.05,gilt,sx,.33,sz,g);
      const back=box(1.2,1.2,.04,lacquer,0,1.31,-.24,g),top=box(1.26,.06,.56,lacquer,0,1.94,0,g),bottom=box(1.2,.04,.5,lacquer,0,.73,0,g);for(const sx of [-.58,.58])box(.04,1.2,.5,lacquer,sx,1.31,0,g);
      box(1.12,.03,.46,lacquer,0,1.3,0,g);
      // The roll of paper at the back of the upper shelf.
      add(own(new THREE.CylinderGeometry(.025,.025,.3,8)),own(new THREE.MeshStandardMaterial({color:0xefe4c8,roughness:.95})),.3,1.35,-.15,g).rotation.z=Math.PI/2;
      const doors=[];for(const side of [-1,1]){const hinge=new THREE.Group();hinge.position.set(side*.6,1.31,.25);g.add(hinge);
        const leaf=box(.6,1.18,.03,lacquer,-side*.3,0,0,hinge),face=add(own(new THREE.PlaneGeometry(.58,1.16)),doorMat,-side*.3,0,.017,hinge);if(side>0)face.scale.x=-1;
        add(own(new THREE.SphereGeometry(.022,8,6)),gilt,-side*.54,0,.04,hinge);doors.push({hinge,side,leaf,face})}
      const data={type:'austen-cabinet',title:'A high, old-fashioned black cabinet',author:'Japanned in black and yellow. Catherine Morland found one like it in her room at Northanger Abbey, and opened it at midnight, in a storm.',action:'OPEN'};
      const parts=[top,back,...doors.flatMap(door=>[door.leaf,door.face])];for(const part of parts)mark(part,data);
      // Mrs Radcliffe, at the back of the lower shelf: put away until the cabinet is opened.
      const small=own(new THREE.BoxGeometry(.24,.34,.05)),inside=hidden.map((book,i)=>{const mesh=add(small,own(bookMaterial(book)),(i-(hidden.length-1)/2)*.27,.93,-.12,g);mesh.rotation.x=-.06;mesh.visible=false;
        mesh.userData={type:'book',book,loaded:false,austen:true,shelf:'cabinet',home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:g}};return mesh});
      block(x,z,1.4,.75);
      cabinet={g,doors,parts,inside,open:0,target:0};
      if(wasFound())openCabinet(true);
    }
    function openCabinet(quiet){
      if(!cabinet||cabinet.target)return;cabinet.target=1;if(quiet)cabinet.open=1;
      for(const mesh of cabinet.inside){mesh.visible=true;interactables.push(mesh);ours.push(mesh);books.push(mesh)}
      const opened={type:'austen-card',title:'The black cabinet, open',author:'A roll of paper, which turns out to be a list of linen; and behind it, Mrs Radcliffe.',action:'READ'};for(const part of cabinet.parts)part.userData=opened;
    }
    function placeBook(book,spot,geometry,shelf){
      const mesh=add(geometry,own(bookMaterial(book)),spot.x,spot.y,spot.z,root);mesh.rotation.order='YXZ';mesh.rotation.y=spot.yaw;mesh.rotation.x=-.08;
      mesh.userData={type:'book',book,loaded:false,austen:true,shelf,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:root}};
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
    // The door creaks, as the one at Chawton did; not more than once every few seconds.
    function creak(){if(time-lastCreak<4)return;lastCreak=time;playSample?.('floorboardCreak',2.2,.8)}
    function enter(){
      activate();move(ROOM.cx,ROOM.cz+ROOM.d/2-1.4,0);playSample?.('doorOpen',.7,1.04);creak();
      showNotice('The Austen Room. Her six novels ahead, in the order they were published; what else she wrote, and the first books about her, on the left; what she read on the right. The door creaks: it always has.',10);
      analytics?.track('Room Explored',{room:'austen-room'});
    }
    function play(){
      if(!tone)return;let at=0;for(const [freq,beats] of TUNE){tone(freq,at,beats*.36+.25);tone(freq/2,at,beats*.36+.25,.05);at+=beats*.36}
    }
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('austen-'))return false;
      if(data.type==='austen-door'){creak();through(data,enter);return true}
      if(data.type==='austen-exit'){creak();through(data,()=>{move(DOOR.x+Math.sin(DOOR.yaw)*1.9,DOOR.z+Math.cos(DOOR.yaw)*1.9,DOOR.yaw+Math.PI);playSample?.('doorOpen',.7,1);showNotice('The Grand Hall again.',3)});return true}
      if(data.type==='austen-piano'){play();showNotice(`${data.title}: ${data.author}`,9);return true}
      if(data.type==='austen-cabinet'){
        openCabinet(false);try{storage?.setItem(FOUND_KEY,'1')}catch(e){}playSample?.('doorOpen',.45,1.25);
        showNotice('The key turns at last. At the back of the cabinet, a roll of paper: by daylight Catherine found hers was only a list of linen, shirts and stockings and cravats. Behind it, where she never looked, someone has kept Mrs Radcliffe.',12);
        analytics?.track('Secret Found',{secret:'austen-cabinet'});return true;
      }
      if(data.type==='austen-card'){showNotice(`${data.title}: ${data.author}`,10);return true}
      return false;
    }

    // ---------- lifecycle ----------
    function activate(){if(!root)buildRoom();lastNeeded=time}
    function unload(){
      // Its lamp is marked freed, so the light budget lets it go.
      if(!root)return;root.removeFromParent();root.traverse(object=>{if(object.isLight)object.userData.freed=true});root=null;cabinet=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0;
    }
    function update(t){
      const dt=Math.min(.1,Math.max(0,t-time));time=t;const inside=contains(player.pos.x,player.pos.z),near=Math.hypot(player.pos.x-DOOR.x,player.pos.z-DOOR.z)<PRELOAD;
      if(inside||near)activate();
      else if(root&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==root&&b.parent!==cabinet?.g))unload();
      if(cabinet&&cabinet.open!==cabinet.target){cabinet.open=Math.min(cabinet.target,cabinet.open+dt*.8);const ease=1-Math.pow(1-cabinet.open,3);for(const door of cabinet.doors)door.hinge.rotation.y=door.side*ease*1.9}
      else if(cabinet)for(const door of cabinet.doors)door.hinge.rotation.y=door.side*cabinet.open*1.9;
    }
    buildDoor();
    return {contains,floorAt,allowed,interact,update,enter,unload,catalogue,door:DOOR,room:ROOM,groups:GROUPS,novels:NOVELS,cabinetIds:CABINET,tune:TUNE,
      get built(){return !!root},get books(){return books.slice()},get cabinetOpen(){return !!cabinet?.target},zoneAt:(x,z)=>contains(x,z)?'austen-room':null};
  };
})();
