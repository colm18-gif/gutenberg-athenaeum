// The Bindery: a binder's workshop of about 1900, behind an oxblood door in the Periodicals Room's south wall, behind
// the Albion press (periodicals-room.js hangs it through `addDoorHook`): print the sheets there, bind them here.
//
// At the long bench the reader binds a book, one station at a time, in order: folding, sewing, rounding and backing,
// covering and finishing. The book in hand moves along the bench as it is made, and at the end its title is tooled in
// gold and it goes on the shelf of books finished tonight, a real copy from the library's shelves that can be opened
// (athenaeum-bindery-bound counts them). At the marbling tray every pull of a sheet gives a new pattern, which is hung
// on the drying line. A standing press, the finishing stove with its glue pot, leather skins and a stack of boards.
// Books on binding and on books are on the north wall (shelf `bindery-books` in data/new-books.js).
//
// The secret is a plain gilt-edged book on the stand by the shelves: fan its leaves and a painting appears on the edge,
// as on the fore-edge paintings of the eighteenth century, and the painting is of the library itself; then the shelf
// `bindery-fore-edge` leaves its book on the stand, found once, found for good (athenaeum-bindery-fore-edge;
// ?foreedge shows it). Built when the reader comes near its door, freed a little while after they leave. One light.
(function(){
  'use strict';

  const STEPS=[
    {key:'fold',name:'FOLDING',title:'Folding',action:'FOLD THE SHEETS',done:'The sheets are folded into sections and creased with the bone folder.',
      text:'A printed sheet carries several pages, laid out so that when it is folded, once, twice or three times, they fall in order. Each folded sheet is a section, also called a gathering or a signature. The binder creases the folds with a bone folder.'},
    {key:'sew',name:'SEWING',title:'Sewing',action:'SEW THE SECTIONS',done:'The sections are sewn onto the cords, one after another, and linked with a kettle stitch.',
      text:'The sections are sewn one at a time through their folds onto cords or tapes stretched on a sewing frame, and linked to each other at head and tail with a kettle stitch. Sewn this way, a book opens well and lasts.'},
    {key:'round',name:'ROUNDING AND BACKING',title:'Rounding and backing',action:'ROUND AND BACK',done:'The spine is glued, knocked round, and backed in the lying press.',
      text:'The spine is glued, then knocked round with a hammer so that the book will not sag forwards with use. Held tight in a lying press, the folds along the spine are hammered over to make shoulders for the boards to sit against.'},
    {key:'cover',name:'COVERING',title:'Covering',action:'COVER IN LEATHER',done:'Boards are laced on, and the pared leather is pasted, drawn over and turned in.',
      text:'Boards are cut and attached, in fine work by lacing the cords through holes in them. The leather is pared thin at its edges, pasted, drawn over the boards and spine, and turned in.'},
    {key:'tool',name:'FINISHING',title:'Finishing',action:'TOOL THE TITLE',done:'The title is tooled in gold.',
      text:'Titles and ornaments are pressed into the leather with brass tools heated on the finishing stove, through gold leaf laid on a little glaire, which is beaten egg white. The gold stays where the hot tool touched.'}
  ];
  const CARDS={
    sign:['The Bindery','A binder’s workshop of about 1900, when Arts and Crafts binders such as T. J. Cobden-Sanderson, who set up the Doves Bindery in 1893, and Douglas Cockerell, who worked under him there, brought fine hand binding back into esteem. Bind a book at the bench, station by station, or marble a sheet at the tray.'],
    shelf:['On binding, and on books','Books about how books are made, kept and loved, from the library’s shelves.'],
    press:['A standing press','A tall screw press. Books just bound are stacked in it between boards and left under pressure, often overnight, so that they dry flat.'],
    boards:['Boards','Millboard, cut to size for the covers. The binder cuts each pair a little larger than the pages, so that the covers stand out round the edges and protect them: the overhang is called the squares.'],
    leather:['Leather','Goatskin, often called morocco, calfskin and sheepskin are the usual leathers for binding. Goatskin is prized for its strength and its grain.'],
    stove:['The finishing stove','A small stove where the finishing tools are heated before use, and where the glue pot is kept warm. Binders’ glue was animal glue, used hot.'],
    marble:['Marbling','Colours are dropped onto a bath of size, water thickened with carrageen moss or gum, where they float and spread. They are drawn into patterns with a stylus and a comb, and a sheet of paper laid on top lifts the pattern off. The craft came to Europe from Turkey and Persia, where it is called ebru, and European binders used marbled paper for endpapers and covers.'],
    line:['Marbled sheets, drying','Sheets marbled tonight, hung on the line to dry. Each one is different: a marbled pattern can never be made twice.'],
    finished:['Bound tonight','Books bound at the bench this evening. Each is a copy from the library’s own shelves, and can be opened and read.'],
    foreEdge:['A fore-edge painting','A picture painted on the edges of the leaves while they are fanned out, then hidden under gilding when the book is closed. Fore-edge paintings were a speciality of Edwards of Halifax in the second half of the eighteenth century. This one is the library’s own: it shows the Grand Hall, by lamplight.'],
    plain:['A gilt-edged book','A plain book in calf, its edges gilt all round. The edges are a little thicker than gilding alone should make them.']
  };
  // Copies a reader may find they have bound: well-loved books from the library's own shelves.
  const BINDABLE=[1342,84,11,1260,2701,46,120,35,55,74,1400,145,768,161,174,345,236,113,16,1661];
  const FOUND_KEY='athenaeum-bindery-fore-edge',BOUND_KEY='athenaeum-bindery-bound';

  window.createBinderyRoom=function(options){
    const {THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,arrivals={},showNotice,playSample,move,analytics,isHolding=()=>false,registerSeat=null,doorKit=null,
      periodicals=null,storage=null,search=''}=options;
    const P=periodicals?.room||{cx:-330,cz:100,w:16,d:14};
    // The door: in the Periodicals Room's south wall, behind the press (which stands at cx-5.6, cz+3.1).
    const DOOR={x:P.cx-5.6,z:P.cz+P.d/2-.2,yaw:Math.PI};
    const ROOM={cx:3300,cz:-300,w:13,d:11,h:4};
    const PRELOAD=7,KEEP=25;
    const DOOR_LOOK={style:'painted',color:0x5a1c18,fanColor:0xe8b860,width:1.7,height:2.9};
    const through=(data,go)=>doorKit&&data.kit?doorKit.pass(data.kit,data,go):go();
    const get=key=>{try{return storage?.getItem(key)}catch(e){return null}},put=(key,value)=>{try{storage?.setItem(key,value)}catch(e){}};
    const wasFound=()=>get(FOUND_KEY)==='1'||/[?&]fore-?edge\b/.test(search);
    let root=null,time=0,lastNeeded=-1e9,stage=0,work=null,stationAt=[],tray=null,line=[],lineNext=0,finishedSlots=[],finishedNext=0,foreEdge=null,embers=[];
    const owned=[],ours=[],books=[],blockers=[];
    const own=thing=>{owned.push(thing);return thing};
    const std=params=>own(new THREE.MeshStandardMaterial(params));
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    const cyl=(rt,rb,h,material,x,y,z,parent,seg=12)=>add(own(new THREE.CylinderGeometry(rt,rb,h,seg)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const card=key=>({type:'bindery-card',title:CARDS[key][0],author:CARDS[key][1],action:'READ'});
    const shelfBooks=(room,max,ids=[])=>[...new Set([...ids,...(arrivals[room]||[])])].map(id=>findBook(id)).filter(Boolean).slice(0,max);
    function sign(text,sub,w,h){
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle='#2a1410';c.fillRect(0,0,W,H);c.strokeStyle='#d9b060';c.lineWidth=5;c.strokeRect(8,8,W-16,H-16);c.strokeRect(16,16,W-32,H-32);
        c.fillStyle='#f0d088';c.textAlign='center';c.font='bold 28px Georgia';c.fillText(text,W/2,sub?52:H/2+10);if(sub){c.font='italic 19px Georgia';c.fillText(sub,W/2,84)}},640,sub?108:72));
      return add(own(new THREE.PlaneGeometry(w,h)),std({map,emissive:0x3a2010,emissiveIntensity:.3,roughness:.8}),0,0,0,root)}

    // ---------- the door, hung in the Periodicals Room whenever that room is built ----------
    function hangDoor(parent,{mark:markThere}){
      const data={type:'bindery-door',title:'The Bindery',author:'Behind the press: where the printed sheets are folded, sewn and bound.',action:'ENTER'};
      if(!doorKit?.hang(parent,{data,mark:markThere,x:DOOR.x,z:DOOR.z,yaw:DOOR.yaw,label:'THE BINDERY',...DOOR_LOOK}))markThere(add(new THREE.BoxGeometry(1.7,2.9,.14),new THREE.MeshStandardMaterial({color:DOOR_LOOK.color,roughness:.7}),DOOR.x,1.45,DOOR.z,parent),data);
    }

    // ---------- the room ----------
    function buildRoom(){
      root=new THREE.Group();root.name='bindery';const {cx,cz,w,d,h}=ROOM,x0=cx-w/2,x1=cx+w/2,z0=cz-d/2,z1=cz+d/2;
      let k=11;const rnd=()=>(k=(k*9301+49297)%233280)/233280;
      const plaster=own(canvasTexture((c,W,H)=>{c.fillStyle='#b9a27c';c.fillRect(0,0,W,H);for(let i=0;i<420;i++){c.fillStyle=`rgba(70,45,20,${rnd()*.07})`;c.fillRect(rnd()*W,rnd()*H,3+rnd()*10,2+rnd()*5)}},256,256));
      const wall=std({color:0xcbb48c,map:plaster,roughness:.95}),oak=std({color:0x6a4524,roughness:.7}),dark=std({color:0x3a2412,roughness:.75}),iron=std({color:0x2a2b2e,metalness:.5,roughness:.55}),brass=MAT.brass||std({color:0xb08d3a,metalness:.6,roughness:.4});
      const boardsTex=own(canvasTexture((c,W,H)=>{c.fillStyle='#7a5530';c.fillRect(0,0,W,H);for(let x=0;x<W;x+=40){c.fillStyle=`rgba(40,22,8,${.15+rnd()*.15})`;c.fillRect(x,0,2,H)}for(let i=0;i<300;i++){c.fillStyle=`rgba(30,15,5,${rnd()*.08})`;c.fillRect(rnd()*W,rnd()*H,1,8+rnd()*20)}},256,256));
      boardsTex.wrapS=boardsTex.wrapT=THREE.RepeatWrapping;boardsTex.repeat?.set?.(4,4);
      box(w,.3,d,std({color:0x8a6238,map:boardsTex,roughness:.85}),cx,-.15,cz,root);box(w,.2,d,std({color:0x5a3c22,roughness:.9}),cx,h+.1,cz,root);
      box(w,h,.3,wall,cx,h/2,z0,root);box(w,h,.3,wall,cx,h/2,z1,root);box(.3,h,d,wall,x0,h/2,cz,root);box(.3,h,d,wall,x1,h/2,cz,root);
      for(let i=0;i<4;i++)box(w,.22,.24,dark,cx,h-.11,z0+1.6+i*2.6,root);// beams
      for(const [bx,bz,bw,bd] of [[cx,z0+.17,w,.05],[cx,z1-.17,w,.05],[x0+.17,cz,.05,d],[x1-.17,cz,.05,d]])box(bw,.18,bd,dark,bx,.09,bz,root);
      const s=sign('THE BINDERY','Folding · sewing · forwarding · finishing',3,.5);s.position.set(cx+2.6,h-.5,z0+.17);mark(s,card('sign'));
      buildShelves(oak);buildBench(oak,dark,iron,brass);buildStove(iron,brass);buildPress(iron,oak);buildMarbling(oak);buildLeather(dark);buildForeEdge(oak);buildFinishedShelf(oak);
      // A Windsor chair by the stove: one of the library's seats, opening a book from the shelves here.
      const ch=new THREE.Group();ch.position.set(cx+3.9,0,cz+3.2);ch.rotation.y=-.6;root.add(ch);
      const chair=[box(.56,.06,.52,oak,0,.46,0,ch),box(.56,.7,.06,oak,0,.86,.24,ch)];for(const [lx,lz] of [[-.24,-.22],[.24,-.22],[-.24,.22],[.24,.22]])chair.push(box(.05,.46,.05,oak,lx,.23,lz,ch));
      block(cx+3.9,cz+3.2,.8,.8);for(const p of chair)ours.push(p);
      registerSeat?.(chair,ch,new THREE.Vector3(0,1.1,.05),-.6,{title:'A Windsor chair',author:'Sit by the stove and read one of the books on binding.',bookIds:books.map(b=>b.userData.book.id)});
      // The lamp over the bench: the room's one light.
      const shade=std({color:0x2f4a2a,emissive:0x1a3a1a,emissiveIntensity:.5,roughness:.5});
      cyl(.005,.005,1.2,iron,cx-1,h-.6,cz-1.2,root,4);add(own(new THREE.ConeGeometry(.34,.24,16,1,true)),shade,cx-1,h-1.28,cz-1.2,root);
      add(own(new THREE.SphereGeometry(.07,10,8)),std({color:0xfff1d0,emissive:0xffd890,emissiveIntensity:1.8}),cx-1,h-1.36,cz-1.2,root);
      const lamp=new THREE.PointLight(0xffd8a0,5.5,16,2);lamp.position.set(cx-1,h-1.5,cz-1.2);root.add(lamp);
      const exit={type:'bindery-exit',title:'Back to the Periodicals Room',author:'Out past the press, and on to the Grand Hall.',action:'RETURN'};
      if(!doorKit?.hang(root,{data:exit,mark,x:cx,z:z1-.2,yaw:Math.PI,label:'THE PERIODICALS ROOM',onward:'towards the Grand Hall',own,...DOOR_LOOK}))mark(box(1.7,2.9,.16,std({color:DOOR_LOOK.color,roughness:.7}),cx,1.45,z1-.2,root),exit);
      scene.add(root);
    }

    function placeBook(book,spot,geometry,shelf){
      const mesh=add(geometry,own(bookMaterial(book)),spot.x,spot.y,spot.z,root);mesh.rotation.order='YXZ';mesh.rotation.y=spot.yaw||0;mesh.rotation.x=spot.tilt??-.08;
      mesh.userData={type:'book',book,loaded:false,bindery:true,shelf,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:root}};
      interactables.push(mesh);ours.push(mesh);books.push(mesh);return mesh}

    // The books on binding, face-out on two oak shelves along the north wall, west of the sign.
    function buildShelves(oak){
      const {cx,cz,d}=ROOM,z=cz-d/2+.3,list=shelfBooks('books',12),geometry=own(new THREE.BoxGeometry(.6,.84,.1)),per=Math.max(1,Math.ceil(list.length/2)),step=Math.min(.82,4.6/per);
      list.forEach((book,i)=>{const row=i<per?0:1,n=row?list.length-per:per,col=row?i-per:i;placeBook(book,{x:cx-3.2+(col-(n-1)/2)*step,y:row?2.4:1.32,z,yaw:0},geometry,'books')});
      for(const y of [.86,1.94])box(5.2,.05,.34,oak,cx-3.2,y,z,root);block(cx-3.2,z,5.4,.7);
      const label=sign('ON BINDING, AND ON BOOKS','',2.6,.3);label.position.set(cx-3.2,3.2,cz-d/2+.17);mark(label,card('shelf'));
    }

    // ---------- the bench, and the book made along it ----------
    function buildBench(oak,dark,iron,brass){
      const {cx,cz}=ROOM,bz=cz-1.2,top=.92,x0=cx-5,len=8;
      box(len,.08,1,oak,x0+len/2,top-.04,bz,root);for(const lx of [x0+.2,x0+len/2,x0+len-.2])for(const lz of [bz-.4,bz+.4])box(.09,top-.08,.09,dark,lx,(top-.08)/2,lz,root);
      box(len-.4,.04,.8,dark,x0+len/2,.2,bz,root);block(x0+len/2,bz,len+.1,1.1);
      const paper=std({color:0xeee4cc,roughness:.95}),bone=std({color:0xe8dcc0,roughness:.6}),cord=std({color:0xc9b48a,roughness:.9}),leatherMat=std({color:0x6a1f1a,roughness:.6}),gold=std({color:0xd8b048,metalness:.7,roughness:.35,emissive:0x2a1a00});
      const xs=[x0+.8,x0+2.3,x0+3.9,x0+5.5,x0+7.1];stationAt=xs.map(x=>({x,y:top,z:bz}));
      const station=(i,parts)=>{const step=STEPS[i];for(const p of parts)mark(p,{type:'bindery-station',station:i,title:`${i+1}. ${step.title}`,author:step.text,action:step.action})};
      // 1. Folding: a stack of flat printed sheets and a bone folder.
      const fold=[];for(let i=0;i<5;i++)fold.push(box(.56,.006,.4,paper,xs[0]-.1,top+.004+i*.007,bz+.05,root));fold.push(box(.22,.012,.035,bone,xs[0]+.33,top+.01,bz+.2,root));fold[fold.length-1].rotation.y=.4;station(0,fold);
      // 2. Sewing: a sewing frame, its crossbar on two screws, cords stretched from bar to bed.
      const sew=[box(.7,.05,.42,oak,xs[1],top+.025,bz,root),cyl(.025,.025,.62,oak,xs[1]-.3,top+.36,bz-.1,root,8),cyl(.025,.025,.62,oak,xs[1]+.3,top+.36,bz-.1,root,8),box(.7,.05,.06,oak,xs[1],top+.66,bz-.1,root)];
      for(const dx of [-.15,-.05,.05,.15])sew.push(box(.005,.6,.005,cord,xs[1]+dx,top+.35,bz-.1,root));station(1,sew);
      // 3. Rounding and backing: a lying press, two oak cheeks on wooden screws, and a backing hammer.
      const round=[box(.9,.12,.14,oak,xs[2],top+.06,bz-.1,root),box(.9,.12,.14,oak,xs[2],top+.06,bz+.14,root)];for(const dx of [-.33,.33])round.push(cyl(.035,.035,.46,dark,xs[2]+dx,top+.1,bz+.02,root,8));round[2].rotation.x=round[3].rotation.x=Math.PI/2;
      round.push(cyl(.02,.02,.3,oak,xs[2]+.32,top+.02,bz+.32,root,6),box(.1,.05,.05,iron,xs[2]+.32,top+.03,bz+.18,root));round[4].rotation.x=Math.PI/2;station(2,round);
      // 4. Covering: a skin of leather, a paste pot with its brush, and a pair of boards.
      const cover=[box(.62,.004,.44,leatherMat,xs[3]-.05,top+.003,bz+.05,root),cyl(.08,.07,.12,std({color:0xd8ccb0,roughness:.7}),xs[3]+.34,top+.06,bz-.22,root),cyl(.01,.01,.24,oak,xs[3]+.37,top+.17,bz-.2,root,6),
        box(.3,.012,.4,std({color:0x4a3a2a,roughness:.9}),xs[3]-.3,top+.012,bz-.32,root)];cover[2].rotation.z=.3;station(3,cover);
      // 5. Finishing: a rack of brass tools, a gold cushion with a leaf on it, and a pallet.
      const tool=[box(.5,.18,.08,oak,xs[4]+.05,top+.09,bz-.38,root)];for(let i=0;i<7;i++){tool.push(cyl(.01,.01,.22,oak,xs[4]-.13+i*.06,top+.27,bz-.38,root,6),cyl(.016,.012,.04,brass,xs[4]-.13+i*.06,top+.4,bz-.38,root,6))}
      tool.push(box(.3,.03,.2,std({color:0xa07a50,roughness:.9}),xs[4]-.15,top+.015,bz+.18,root),box(.08,.002,.08,gold,xs[4]-.15,top+.032,bz+.18,root));station(4,tool);
      for(let i=0;i<5;i++){const label=sign(`${i+1}  ${STEPS[i].name}`,'',.9,.14);label.position.set(xs[i],top+.06,bz+.5);label.rotation.x=-.9;mark(label,{type:'bindery-station',station:i,title:`${i+1}. ${STEPS[i].title}`,author:STEPS[i].text,action:STEPS[i].action})}
      work={group:new THREE.Group(),paper,cord,leatherMat,gold};root.add(work.group);showWork();
    }
    // The book in hand, at the station where its next step is done.
    function showWork(){
      if(!work)return;const g=work.group;for(const c of [...g.children]){g.remove(c);c.geometry?.dispose?.()}
      const at=stationAt[Math.min(stage,4)];if(!at)return;g.position.set(at.x+(stage===0?.08:0),at.y,at.z+(stage===1?-.02:.08));
      const b=(w,h,d,m,x,y,z)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);g.add(mesh);mark(mesh,{type:'bindery-station',station:Math.min(stage,4),title:`${Math.min(stage,4)+1}. ${STEPS[Math.min(stage,4)].title}`,author:STEPS[Math.min(stage,4)].text,action:STEPS[Math.min(stage,4)].action});return mesh};
      if(stage===0)return;// the flat sheets are the station's own stack
      if(stage===1){for(let i=0;i<6;i++)b(.2,.022,.3,work.paper,0,.012+i*.024,0);return}
      if(stage===2){for(let i=0;i<6;i++)b(.2,.022,.3,work.paper,0,.012+i*.024,0);for(const z of [-.09,-.03,.03,.09])b(.012,.15,.01,work.cord,-.105,.075,z);return}
      if(stage===3){const blockMesh=b(.2,.15,.3,work.paper,0,.075,0);const spine=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,.3,12,1,false,0,Math.PI),work.paper);spine.rotation.x=Math.PI/2;spine.rotation.z=Math.PI/2;spine.position.set(-.1,.075,0);g.add(spine);return blockMesh}
      if(stage===4){b(.23,.17,.33,work.leatherMat,0,.085,0);return}
    }
    function doStep(i){
      const step=STEPS[i];
      if(i>stage){showNotice(`${step.title} comes later. First: ${STEPS[stage].title.toLowerCase()}, at station ${stage+1} along the bench.`,7);return}
      if(i<stage){showNotice(`${i+1}. ${step.title}: ${step.text} (This book has had that done; it is at station ${stage+1} now.)`,12);return}
      playSample?.(i===2?'stoneStep1':'pageTurn',.5,i===2?1.3:.9);
      stage++;
      if(stage<5){showNotice(`${step.done} ${step.text} Next, at station ${stage+1}: ${STEPS[stage].title.toLowerCase()}.`,13);showWork();return}
      // Finished: a real copy, its title tooled, onto the shelf of books bound tonight.
      const count=(parseInt(get(BOUND_KEY)||'0',10)||0)+1;put(BOUND_KEY,String(count));
      const pool=BINDABLE.map(id=>findBook(id)).filter(Boolean),book=pool.length?pool[Math.floor(Math.random()*pool.length)]:null;
      if(book)shelveFinished(book);stage=0;showWork();
      showNotice(`${step.done} ${step.text} The book is bound${book?`: ${book.title}, in red morocco, on the shelf of books bound tonight`:''}. ${count===1?'Your first binding.':`You have bound ${count} books in the library.`}`,14);
      analytics?.track('Secret Found',{secret:'bindery-bound'});
    }
    function buildFinishedShelf(oak){
      const {cx,cz,w}=ROOM,x=cx+w/2-.3;box(.34,.05,3.2,oak,x,1.3,cz-2.2,root);box(.34,.05,3.2,oak,x,1.31-.62,cz-2.2,root);block(x,cz-2.2,.7,3.3);
      const label=sign('BOUND TONIGHT','',1.6,.24);label.position.set(cx+w/2-.17,2.15,cz-2.2);label.rotation.y=-Math.PI/2;mark(label,card('finished'));
      finishedSlots=[0,1,2,3,4].map(i=>({x:x-.02,y:1.74,z:cz-3.4+i*.6,yaw:-Math.PI/2,mesh:null}));
    }
    function shelveFinished(book){
      const slot=finishedSlots[finishedNext%finishedSlots.length];finishedNext++;if(!slot)return;
      if(slot.mesh){const i=interactables.indexOf(slot.mesh);if(i>=0)interactables.splice(i,1);slot.mesh.removeFromParent();books.splice(books.indexOf(slot.mesh),1)}
      slot.mesh=placeBook(book,{x:slot.x,y:slot.y,z:slot.z,yaw:slot.yaw,tilt:0},own(new THREE.BoxGeometry(.56,.8,.1)),'finished')}

    // ---------- the finishing stove, the standing press, leather and boards ----------
    function buildStove(iron,brass){
      const {cx,cz}=ROOM,x=cx+3.6,z=cz-1.2,parts=[cyl(.26,.3,.7,iron,x,.35,z,root),cyl(.3,.3,.06,iron,x,.73,z,root),cyl(.05,.05,3.2,iron,x,2.36,z-.12,root,8)];
      const ember=std({color:0xff6a20,emissive:0xff5010,emissiveIntensity:1.4,roughness:.6});parts.push(box(.2,.08,.02,ember,x,.25,z+.28,root));embers.push(parts.at(-1));
      parts.push(cyl(.11,.1,.16,brass,x+.1,.84,z+.06,root),cyl(.012,.012,.22,std({color:0x6a4524,roughness:.7}),x+.14,.96,z+.08,root,6));
      for(const p of parts)mark(p,card('stove'));block(x,z,.8,.8)}
    function buildPress(iron,oak){
      const {cx,cz}=ROOM,x=cx-5.3,z=cz+3.2,parts=[box(1,.2,.8,oak,x,.1,z,root),box(.14,2.2,.14,iron,x-.42,1.1,z,root),box(.14,2.2,.14,iron,x+.42,1.1,z,root),box(1.02,.2,.3,iron,x,2.2,z,root),
        cyl(.05,.05,.9,iron,x,1.7,z,root,10),box(.8,.08,.6,oak,x,1.24,z,root),cyl(.3,.3,.04,iron,x,2.38,z,root,18)];
      for(let i=0;i<8;i++)parts.push(box(.62,.04,.44,i%2?std({color:0x6a1f1a,roughness:.6}):std({color:0x3a2a20,roughness:.9}),x,.24+i*.045,z,root));
      for(const p of parts)mark(p,card('press'));block(x,z,1.2,1);
      const boards=[];for(let i=0;i<9;i++)boards.push(box(.5,.02,.36,std({color:0x5a4632,roughness:.95}),cx-4.3,.01+i*.022,cz+4.1+(i%2)*.01,root));for(const b of boards)mark(b,card('boards'));block(cx-4.3,cz+4.1,.6,.5)}
    function buildLeather(dark){
      const {cx,cz,w}=ROOM,x=cx-w/2+.2,colors=[0x6a1f1a,0x2a3f2a,0x8a5a2a];
      box(.08,.08,4,dark,x+.04,3,cz,root);
      colors.forEach((color,i)=>{const skin=add(own(new THREE.PlaneGeometry(1.1,1.4,3,3)),std({color,roughness:.7,side:THREE.DoubleSide}),x+.05,2.25,cz-1.4+i*1.4,root);skin.rotation.y=Math.PI/2;
        const p=skin.geometry.attributes.position;for(let j=0;j<p.count;j++)p.setX(j,p.getX(j)*(1+.08*Math.sin(j*1.7)));p.needsUpdate=true;mark(skin,card('leather'))});
      block(x+.2,cz,.4,4.4)}

    // ---------- marbling ----------
    const PALETTES=[['#1f3a6a','#c9a13a','#8a2a1e','#e8dcc0'],['#2f5a3a','#d8c08a','#6a2a4a','#f0e6cc'],['#3a2a6a','#d86a3a','#2a6a7a','#efe4c8'],['#7a1f1f','#2a2a3a','#c9b06a','#e6dcc4']];
    function drawMarble(c,W,H,seed){
      let k=seed;const r=()=>(k=(k*9301+49297)%233280)/233280;const pal=PALETTES[Math.floor(r()*PALETTES.length)],img=c.createImageData(W,H),p1=r()*6,p2=r()*6,p3=r()*6,comb=6+r()*10,wave=10+r()*22,band=5+r()*7;
      const rgb=pal.map(hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)));
      for(let y=0;y<H;y++)for(let x=0;x<W;x++){const d=x+wave*Math.sin(y*.045+p1)+wave*.45*Math.sin(y*.13+p2)+comb*Math.sin(x*.42)*Math.sin(y*.02+p3);const idx=((Math.floor(d/band)%rgb.length)+rgb.length)%rgb.length,col=rgb[idx],o=(y*W+x)*4;
        img.data[o]=col[0];img.data[o+1]=col[1];img.data[o+2]=col[2];img.data[o+3]=255}
      c.putImageData(img,0,0)}
    function buildMarbling(oak){
      const {cx,cz,w}=ROOM,x=cx+4.4,z=cz+.9,parts=[box(1.4,.08,.9,oak,x,.82,z,root)];for(const [lx,lz] of [[-.62,-.38],[.62,-.38],[-.62,.38],[.62,.38]])parts.push(box(.07,.78,.07,oak,x+lx,.39,z+lz,root));
      parts.push(box(1.24,.1,.76,std({color:0x3a3a3a,roughness:.5}),x,.91,z,root));
      const texture=own(canvasTexture((c,W,H)=>drawMarble(c,W,H,1234),256,160));const surface=add(own(new THREE.PlaneGeometry(1.14,.68)),std({map:texture,roughness:.2}),x,.965,z,root);surface.rotation.x=-Math.PI/2;parts.push(surface);
      for(const p of parts)mark(p,{type:'bindery-marble',title:'The marbling tray',author:CARDS.marble[1],action:'MARBLE A SHEET'});block(x,z,1.6,1.1);
      tray={texture,surface,seed:1234};
      // The drying line along the east wall, south of the stove, with pegs.
      const lx=cx+w/2-.5;cyl(.006,.006,4.6,std({color:0xd8ccb0,roughness:.9}),lx,2.75,cz+2.3,root,4).rotation.x=Math.PI/2;
      line=[0,1,2,3,4].map(i=>({x:lx,y:2.36,z:cz+.5+i*.9,mesh:null}));
    }
    function marble(){
      if(!tray)return;tray.seed=(tray.seed*7+Math.floor(Math.random()*9973)+1)%233280;const seed=tray.seed;
      const sheet=own(canvasTexture((c,W,H)=>drawMarble(c,W,H,seed),256,160));tray.surface.material.map=sheet;tray.surface.material.needsUpdate=true;
      const spot=line[lineNext%line.length];lineNext++;if(spot.mesh){const i=interactables.indexOf(spot.mesh);if(i>=0)interactables.splice(i,1);spot.mesh.removeFromParent()}
      const hung=add(own(new THREE.PlaneGeometry(.7,.44)),std({map:sheet,roughness:.9,side:THREE.DoubleSide}),spot.x,spot.y,spot.z,root);hung.rotation.y=-Math.PI/2;spot.mesh=mark(hung,card('line'));
      playSample?.('pageTurn',.45,1.2);
      showNotice(lineNext===1?`You drop the colours on the size, draw them through with the comb, and lay a sheet on top. ${CARDS.marble[1]} The sheet is hung on the line to dry.`:'Another sheet, and another pattern: no two are ever the same. It goes on the line to dry.',lineNext===1?16:5)}

    // ---------- the secret: a fore-edge painting ----------
    function drawHall(c,W,H){
      const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#2a1a10');g.addColorStop(1,'#5a3a1c');c.fillStyle=g;c.fillRect(0,0,W,H);
      c.fillStyle='#3a2414';for(let i=0;i<7;i++){c.fillRect(20+i*W/7,H*.18,W/7-30,H*.62)}c.fillStyle='#8a2a1e';for(let i=0;i<7;i++)for(let j=0;j<5;j++){c.fillStyle=['#8a2a1e','#2a4a3a','#6a4a1a','#2a2a5a'][(i+j)%4];c.fillRect(26+i*W/7,H*.22+j*H*.11,W/7-42,H*.08)}
      for(let i=0;i<6;i++){const x=W*(i+.5)/6;const halo=c.createRadialGradient(x,H*.12,2,x,H*.12,40);halo.addColorStop(0,'rgba(255,220,150,.9)');halo.addColorStop(1,'rgba(255,220,150,0)');c.fillStyle=halo;c.fillRect(x-40,H*.12-40,80,80)}
      c.fillStyle='#c9a66a';c.beginPath();c.arc(W/2,H*.7,22,0,7);c.fill();c.fillStyle='#2a1a10';c.fillRect(W/2-3,H*.7+20,6,H*.2);c.fillStyle='#5a1c18';c.fillRect(W*.2,H*.92,W*.6,H*.05)}
    function buildForeEdge(oak){
      const {cx,cz,d}=ROOM,x=cx+.2,z=cz-d/2+.55,stand=[box(.5,1.05,.4,oak,x,.52,z,root),box(.62,.05,.46,oak,x,1.08,z,root)];stand[1].rotation.x=.18;for(const p of stand)mark(p,card('plain'));block(x,z,.7,.6);
      const g=new THREE.Group();g.position.set(x,1.16,z+.02);g.rotation.x=.18;root.add(g);
      const calf=std({color:0x7a4a26,roughness:.6}),gilt=std({color:0xd8b048,metalness:.75,roughness:.3,emissive:0x2a1a00});
      const parts=[box(.44,.03,.32,calf,0,.015,0,g),box(.42,.05,.3,gilt,0,.055,0,g),box(.44,.03,.32,calf,0,.095,0,g)];
      const painting=own(canvasTexture(drawHall,512,160));const edge=add(own(new THREE.PlaneGeometry(.44,.14)),std({map:painting,emissive:0xffffff,emissiveMap:painting,emissiveIntensity:.25,roughness:.7,transparent:true,opacity:0}),0,.06,.22,g);edge.rotation.x=-.5;edge.visible=false;
      const data={type:'bindery-fore-edge',title:CARDS.plain[0],author:CARDS.plain[1],action:'FAN THE LEAVES'};for(const p of parts)mark(p,data);
      foreEdge={g,edge,parts,data,t:0,found:false,book:null,x,z};
      if(wasFound())revealForeEdge(false)}
    function revealForeEdge(announce=true){
      if(!foreEdge)return;const f=foreEdge;
      if(announce){f.t=.001;playSample?.('pageTurn',.6,.7)}else{f.edge.visible=true;f.edge.material.opacity=1}
      Object.assign(f.data,{title:CARDS.foreEdge[0],author:CARDS.foreEdge[1],action:'LOOK'});
      if(!f.found){f.found=true;const left=shelfBooks('foreEdge',1)[0];if(left&&!f.book)f.book=placeBook(left,{x:f.x+.62,y:1.2,z:f.z+.02,yaw:0,tilt:-1.1},own(new THREE.BoxGeometry(.5,.72,.08)),'foreEdge')}
      if(announce){put(FOUND_KEY,'1');analytics?.track('Secret Found',{secret:'bindery-fore-edge'});
        showNotice(`You bend the book back and fan its leaves, and under the gilt a picture appears: the Grand Hall, by lamplight, with the globe on its stand. ${CARDS.foreEdge[1]}${f.book?` Beside it, a book has been left: ${f.book.userData.book.title}.`:''}`,18)}}

    // ---------- walking ----------
    function contains(x,z){return x>ROOM.cx-ROOM.w/2&&x<ROOM.cx+ROOM.w/2&&z>ROOM.cz-ROOM.d/2&&z<ROOM.cz+ROOM.d/2}
    function floorAt(x,z){return contains(x,z)?0:null}
    function allowed(x,z){
      if(!contains(x,z))return false;const r=player.radius||.42;
      if(x-r<ROOM.cx-ROOM.w/2+.45||x+r>ROOM.cx+ROOM.w/2-.45||z-r<ROOM.cz-ROOM.d/2+.45||z+r>ROOM.cz+ROOM.d/2-.45)return false;
      return !blockers.some(b=>x+r>b.minX&&x-r<b.maxX&&z+r>b.minZ&&z-r<b.maxZ)}

    // ---------- doing things ----------
    function enter(){
      activate();move(ROOM.cx,ROOM.cz+ROOM.d/2-1.4,0);playSample?.('doorOpen',.8,.9);
      showNotice('The Bindery. The bench runs across the room: five stations, from folding the printed sheets to tooling the title in gold. Begin at the left. The marbling tray is to your right, by the stove.',12);
      analytics?.track('Room Explored',{room:'bindery'})}
    function leave(){periodicals?.activate?.();move(DOOR.x,DOOR.z-1.55,0);playSample?.('doorOpen',.8,1);showNotice('The Periodicals Room again, behind the press.',4)}
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('bindery-'))return false;
      if(data.type==='bindery-door'){through(data,enter);return true}
      if(data.type==='bindery-exit'){through(data,leave);return true}
      if(data.type==='bindery-station'){doStep(data.station);return true}
      if(data.type==='bindery-marble'){marble();return true}
      if(data.type==='bindery-fore-edge'){if(foreEdge?.found){showNotice(`${CARDS.foreEdge[0]}: ${CARDS.foreEdge[1]}`,12);return true}revealForeEdge(true);return true}
      if(data.type==='bindery-card'){showNotice(`${data.title}: ${data.author}`,data.author.length>260?17:data.author.length>130?12:8);return true}
      return false}

    // ---------- lifecycle ----------
    function activate(){if(!root)buildRoom();lastNeeded=time}
    function unload(){
      if(!root)return;root.removeFromParent();root.traverse(object=>{if(object.isLight)object.userData.freed=true;if(object.parent===work?.group)object.geometry?.dispose?.()});root=null;
      work=null;tray=null;foreEdge=null;stationAt=[];line=[];lineNext=0;finishedSlots=[];finishedNext=0;embers.length=0;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0}
    function update(t){
      const dt=Math.min(.1,Math.max(0,t-time));time=t;const inside=contains(player.pos.x,player.pos.z),near=periodicals?.contains?.(player.pos.x,player.pos.z)&&Math.hypot(player.pos.x-DOOR.x,player.pos.z-DOOR.z)<PRELOAD;
      if(inside||near&&(root||window.libraryMayBuild?.()!==false))activate();
      else if(root&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==b.userData.home.parent))unload();
      if(!inside)return;
      for(const e of embers)e.material.emissiveIntensity=1.2+Math.sin(t*7)*.25+Math.sin(t*3.1)*.2;
      if(foreEdge&&foreEdge.t>0){foreEdge.t+=dt;const f=foreEdge,s=Math.min(1,f.t/1.6);f.edge.visible=true;f.edge.material.opacity=s;f.parts[1].scale.set(1,1+s*.6,1);if(s>=1){f.t=0;f.parts[1].scale.set(1,1,1)}}
    }
    periodicals?.addDoorHook?.(hangDoor);
    return {contains,floorAt,allowed,interact,update,enter,leave,activate,unload,door:DOOR,room:ROOM,steps:STEPS,cards:CARDS,
      get built(){return !!root},get stage(){return stage},get books(){return books.slice()},get found(){return !!foreEdge?.found||wasFound()},zoneAt:(x,z)=>contains(x,z)?'bindery':null};
  };
})();
