// The Library of Celsus: the library at Ephesus, built by Gaius Julius Aquila for his father Tiberius Julius Celsus
// Polemaeanus, consul in 92 and proconsul of Asia. Begun about 110 and finished by his heirs, it held as many as twelve
// thousand scrolls in niches round a single hall, and Celsus himself was buried in a marble sarcophagus in a vault under
// the apse, which almost nobody was. The interior fell in an earthquake in the third century and the front at some later
// one; the two-storey facade standing at Ephesus today was raised again from its own fallen stones between 1970 and 1978.
//
// The reader comes out of the Long Corridor (fifth east bay; long-corridor.js hands over `celsusDoor`) into the court
// before the facade at dusk, the low sun on the marble from the west. Four statues stand in the facade's lower niches:
// Sophia, Episteme, Ennoia and Arete — wisdom, knowledge, thought and virtue — and they are this room's catalogue. Up
// the steps and through one of the three doorways is the hall, where each of the four has a case of the library's own
// books under her name cut in Greek: Sophia on the west wall, Episteme on the east, Ennoia and Arete either side of the
// apse. The upper tiers of niches hold the scrolls (InstancedMeshes, out of reach, as the painted books are at Boullée's).
//
// Only the facade survives, so the hall behind it is a reconstruction and its card says so; the statues at Ephesus are
// copies too, the originals being in Vienna. The secret is the crypt: a stair in the hall floor east of the apse goes
// down to the vault, and reading the inscription on the sarcophagus leaves the library's Meditations on its lid — a
// Roman who wrote, over and over, to remind himself that he would die. Found once, found for good
// (athenaeum-celsus-crypt; ?crypt shows it). Built when the reader comes near its door, freed a little while after they
// leave. Two lights: the sun low in the court, and the bronze lamp in the apse.
(function(){
  'use strict';

  // The library's own copies, by the virtue they stand under. A book may stand on several shelves: each room shows its
  // own. Every number here is in game.js's core list or data/new-books.js, which are always loaded: the Latin Reading
  // Room's Boethius, Tacitus and Ovid are in data/new-books-wing.js, which is fetched only near the International Wing,
  // so they would have come up empty here. A test keeps that from happening again.
  const GROUPS=[
    {key:'sophia',greek:'ΣΟΦΙΑ',name:'Sophia',sub:'Wisdom · philosophy, and the examined life',wall:'west',along:-.8,length:5.2,max:6,ids:[1497,1600,3296]},
    {key:'episteme',greek:'ΕΠΙΣΤΗΜΗ',name:'Episteme',sub:'Knowledge · the lives, the histories and the natural world',wall:'east',along:-.8,length:5.2,max:6,ids:[674,1572,1571]},
    {key:'ennoia',greek:'ΕΝΝΟΙΑ',name:'Ennoia',sub:'Thought · the poets, and what they imagined',wall:'north',along:-4.6,length:3.6,max:6,ids:[6130,1727,228,230,1666,7700]},
    {key:'arete',greek:'ΑΡΕΤΗ',name:'Arete',sub:'Virtue · conduct, the fable, and a man defending his character',wall:'north',along:4.6,length:3.6,max:6,ids:[11339,26294,226]}
  ];
  // The four statues, in the facade's lower niches from west to east (x from the middle of the front), each between a
  // pair of columns as at Ephesus, and each pointing at the case that stands under her name inside.
  const STATUES=[
    {key:'sophia',x:-7.6,points:'Her case is the long one on the hall’s west wall.'},
    {key:'episteme',x:-3.2,points:'Her case is on the hall’s east wall, opposite Sophia’s.'},
    {key:'ennoia',x:3.2,points:'Her case is in the hall, west of the apse.'},
    {key:'arete',x:7.6,points:'Her case is in the hall, east of the apse.'}
  ];
  const CARDS={
    facade:['The facade','Two storeys of paired columns, three doorways and four statues, finished about the year 117 by the heirs of Gaius Julius Aquila for his father, Tiberius Julius Celsus Polemaeanus, consul in 92 and proconsul of Asia. It is built a little convex, and its columns are not all of a size, so that it looks wider and taller than it is. It fell in an earthquake and lay in its own stones until it was raised again between 1970 and 1978.'],
    inscription:['The inscription over the doorways','In Latin and in Greek, and it names Celsus: his consulship, his proconsulship of Asia, and the son who built the library and left money for the books and their keeping. Twelve thousand scrolls were a great library for a provincial city.'],
    sophia:['Sophia','Wisdom, in the first niche. The statues at Ephesus are copies; the four originals are in the Ephesos Museum in Vienna.'],
    episteme:['Episteme','Knowledge, in the second niche: not what is guessed at, but what is known and can be shown.'],
    ennoia:['Ennoia','Thought, in the third niche — the mind at work, before it has anything to show for it.'],
    arete:['Arete','Virtue, in the fourth niche: excellence of the kind that has to be practised rather than learnt.'],
    hall:['The hall','Seventeen metres by eleven, with three tiers of niches round three walls for the armaria the scrolls stood in, and a gallery to reach the upper ones. Its walls are double, with a gap of about a metre behind them, which kept the damp off the scrolls. Only the facade ever survived, so what you are standing in is a reconstruction, and the library would rather say so than pretend otherwise.'],
    scrolls:['The scrolls','Rolls of papyrus in their cases, each with a tag hanging from the end so that a reader could find one without unrolling it. The library has no scrolls of its own, so the four cases below hold its books instead: an honest anachronism, and not a reconstruction.'],
    apse:['The apse','A statue stood here, Athena by most accounts, in the middle of the rear wall, where a reader coming through the middle doorway would see her first. The vault beneath it is Celsus’s own.'],
    steps:['The steps','Nine of them at Ephesus, to lift the front above the square it faced. The library has made do with three.'],
    lamp:['The bronze lamp','Oil, and not much of it. A Roman library worked by daylight through its doorways, which is one reason the front faces the morning sun at Ephesus and the evening sun here.'],
    sarcophagus:['The sarcophagus of Celsus','Marble, in a vaulted chamber under the apse, and found still in place. To be buried inside a public building was all but unheard of in a Roman city: Celsus was given the library as a tomb, or gave himself one, and his son carried it out.'],
    crypt:['The vault','Down the stair east of the apse. A library above and a grave below, which is a plainer statement about books and dying than anything written on the walls.'],
    table:['A reading table','A roll was read by unwinding it with one hand and winding it up with the other, a column of writing at a time. This one is the library’s own prop: its columns are only lines, as the library has no scrolls of its own.'],
    bench:['A marble bench','Somewhere to sit in the court and look at the front while the light goes. It is one of the library’s seats: sit, and one of the four cases’ books comes with you.'],
    torch:['A torch on its stand','Lit for the evening, as the court has only the setting sun. It gives the front its flicker and nothing else: the library has added no light of its own.']
  };

  window.createCelsusRoom=function(options){
    const {THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,arrivals={},showNotice,playSample,move,analytics,
      isHolding=()=>false,registerSeat=null,doorKit=null,corridor=null,storage=null,search=''}=options;
    const DOOR=corridor?.celsusDoor||{x:1702.33,z:-6,yaw:-Math.PI/2};
    // The court before the facade (south of it), the hall behind it, and the vault under the apse. The facade is on z=0.
    const COURT={cx:2500,cz:12,w:22,d:22,y:0};
    const HALL={cx:2500,cz:-6,w:17,d:12,h:11,y:.5};
    const CRYPT={cx:2501.4,cz:-10.6,w:3.6,d:3.8,h:2.4,y:-2.9};
    // The three steps up to the platform, the thresholds through the front's one-metre thickness, and the stair down
    // to the vault (a real opening in the hall floor).
    const STEPS={z0:.6,z1:1.8,n:3};
    const THRESHOLD={z0:-1.1,z1:STEPS.z0};
    const STAIR={x:2502.2,half:.8,z0:-6.8,z1:-10.4,n:12};
    const PRELOAD=7,KEEP=25;
    const FOUND_KEY='athenaeum-celsus-crypt';
    const DOOR_LOOK={style:'plain',color:0xcfc4ac,width:1.9,height:3.1};
    const through=(data,go)=>doorKit&&data.kit?doorKit.pass(data.kit,data,go):go();
    const wasFound=()=>{try{return storage?.getItem(FOUND_KEY)==='1'||/[?&](crypt|celsus-crypt|sarcophagus)\b/.test(search)}catch(e){return false}};
    let root=null,time=0,lastNeeded=-1e9,crypt=null;
    const owned=[],ours=[],books=[],blockers=[];
    const own=thing=>{owned.push(thing);return thing};
    const std=params=>own(new THREE.MeshStandardMaterial(params));
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    // The door in the corridor stays when the room is freed, so its parts are not among the room's own.
    function markDoor(object,data){object.userData=data;interactables.push(object);return object}
    // Colliders are flat, and the vault lies under the hall's north wall, so each one says which floor it stands on:
    // Arete's case fenced off the sarcophagus below it until it did.
    function block(x,z,w,d,level='hall'){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,level})}
    const card=key=>({type:'celsus-card',title:CARDS[key][0],author:CARDS[key][1],action:'READ'});
    // The three doorways in the facade, by their middle (from the front's own middle) and their width: the only way
    // between the court and the hall.
    const DOORWAYS=[{x:-5.4,w:2.4},{x:0,w:3.4},{x:5.4,w:2.4}];
    const inDoorway=x=>DOORWAYS.some(d=>Math.abs(x-(HALL.cx+d.x))<d.w/2-.4);

    function sign(parent,text,sub,w,h,x,y,z){
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle='#e8e1cf';c.fillRect(0,0,W,H);c.strokeStyle='#8a7c5c';c.lineWidth=3;c.strokeRect(7,7,W-14,H-14);
        c.fillStyle='#3a3122';c.textAlign='center';c.font='bold 30px Georgia';c.fillText(text,W/2,sub?54:H/2+10);if(sub){c.font='italic 19px Georgia';c.fillText(sub,W/2,85)}},620,sub?104:70));
      return add(own(new THREE.PlaneGeometry(w,h)),std({map,emissive:0x3c3524,emissiveIntensity:.3,roughness:.9}),x,y,z,parent)}
    // A name cut in the marble over a case: Greek capitals, and the English under them.
    function cut(parent,greek,english,w,x,y,z,yaw){
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle='#cdc3ab';c.fillRect(0,0,W,H);c.textAlign='center';
        c.fillStyle='rgba(58,50,36,.85)';c.font='bold 52px Georgia';c.fillText(greek,W/2,64);
        c.fillStyle='rgba(70,62,46,.72)';c.font='italic 24px Georgia';c.fillText(english,W/2,100)},512,128));
      const m=add(own(new THREE.PlaneGeometry(w,w/4)),std({map,roughness:.92}),x,y,z,parent);m.rotation.y=yaw;return m}

    const shelfBooks=(ids,key,max)=>[...new Set([...ids,...(arrivals[key]||[])])].map(id=>findBook(id)).filter(Boolean).slice(0,max);
    function catalogue(){return {groups:GROUPS.map(group=>({...group,books:shelfBooks(group.ids,`celsus-${group.key}`,group.max)})),
      crypt:shelfBooks([2680],'celsus-crypt',1)}}

    // ---------- the door, in the Long Corridor ----------
    function buildDoor(){
      const g=new THREE.Group();g.name='celsus-door';g.position.set(DOOR.x,0,DOOR.z);g.rotation.y=DOOR.yaw;scene.add(g);
      const data={type:'celsus-door',title:'The Library of Celsus',author:'Ephesus, about the year 117: a court at dusk, a front of two storeys, and twelve thousand scrolls behind it.',action:'ENTER'};
      if(!doorKit?.hang(g,{data,mark:markDoor,...DOOR_LOOK,...doorKit.readingRoom?.('THE LIBRARY\nOF CELSUS','Ephesus · about 117')}))
        markDoor(add(new THREE.BoxGeometry(1.9,3.1,.14),new THREE.MeshStandardMaterial({color:DOOR_LOOK.color,roughness:.8}),0,1.55,.08,g),data);
    }

    // ---------- the court, the facade, the hall ----------
    function buildRoom(){
      root=new THREE.Group();root.name='celsus-room';
      const marble=own(canvasTexture((c,W,H)=>{c.fillStyle='#d8cdb4';c.fillRect(0,0,W,H);let k=7;const r=()=>(k=(k*9301+49297)%233280)/233280;
        for(let i=0;i<40;i++){c.strokeStyle=`rgba(150,136,110,${.1+r()*.16})`;c.lineWidth=1+r()*2;c.beginPath();const x=r()*W,y=r()*H;c.moveTo(x,y);
          for(let s=0;s<5;s++)c.lineTo(x+(r()-.5)*90,y+(r()-.5)*90);c.stroke()}
        for(let i=0;i<300;i++){c.fillStyle=`rgba(255,250,235,${r()*.12})`;c.fillRect(r()*W,r()*H,2+r()*4,2+r()*4)}},256,256));
      marble.wrapS=marble.wrapT=THREE.RepeatWrapping;marble.repeat?.set?.(4,4);
      const stone=std({color:0xb9ad92,map:marble,roughness:.85}),warm=std({color:0xcabd9e,map:marble,roughness:.8}),
        shade=std({color:0x7a6f5c,roughness:.95}),bronze=MAT.brass||std({color:0x9a7b36,metalness:.55,roughness:.45});
      // The court: paving, and walls of dressed stone on its three other sides.
      seed=31;flames.length=0;
      box(COURT.w,.3,COURT.d,std({color:0xd8cfbd,map:tiled(paving(),COURT.w,COURT.d,4),roughness:.9}),COURT.cx,-.15,COURT.cz,root);
      const courses=ashlar();
      for(const [bx,bz,bw,bd] of [[COURT.cx,COURT.cz+COURT.d/2,COURT.w,.4],[COURT.cx-COURT.w/2,COURT.cz,.4,COURT.d],[COURT.cx+COURT.w/2,COURT.cz,.4,COURT.d]]){
        box(bw,5.5,bd,std({color:0xd9cdb6,map:tiled(courses,Math.max(bw,bd),5.5,2.75),roughness:.9}),bx,2.75,bz,root);
        box(bw+.2,.3,bd+.2,warm,bx,5.6,bz,root)}
      buildDusk();
      buildCourt(warm,bronze);
      buildFacade(stone,warm,shade);
      buildHall(stone,warm,shade,bronze);
      // The sun, low in the west over the court wall, and the lamp in the apse: the room's two lights.
      const sun=new THREE.PointLight(0xff9f54,5,42,1.7);sun.position.set(COURT.cx-COURT.w/2+1.5,6.2,COURT.cz+1.5);root.add(sun);
      const lamp=new THREE.PointLight(0xffc07a,2.6,13,2);lamp.position.set(HALL.cx,HALL.y+1.5,HALL.cz-HALL.d/2+2.2);root.add(lamp);
      // The way back to the corridor, in the court's south wall.
      const exit={type:'celsus-exit',title:'Back to the Long Corridor',author:'Out of the court, and along the corridor to the Grand Hall.',action:'RETURN'};
      if(!doorKit?.hang(root,{data:exit,mark,x:COURT.cx,z:COURT.cz+COURT.d/2-.22,yaw:Math.PI,onward:'towards the Grand Hall',label:'THE LONG CORRIDOR',own,...DOOR_LOOK}))
        mark(box(1.9,3.1,.16,stone,COURT.cx,1.55,COURT.cz+COURT.d/2-.25,root),exit);
      scene.add(root);
    }

    // One of the library's seats, opening a book from the four cases; freed with the room.
    function seatHere(parts,group,yaw,info){if(!registerSeat)return false;
      const data=registerSeat(parts,group,new THREE.Vector3(0,1.15,.05),yaw,info);
      if(data&&typeof data==='object')Object.defineProperty(data,'bookIds',{get:()=>books.map(mesh=>mesh.userData.book.id),configurable:true});
      ours.push(...parts);return true}
    // The court's furniture: cypresses along the side walls, a marble bench facing the front, and torches either side of
    // the middle doorway.
    function buildCourt(warm,bronze){
      const {cx,cz,w,d}=COURT,dummy=new THREE.Object3D(),spots=[];
      for(const side of [-1,1])for(let i=0;i<4;i++)spots.push([cx+side*(w/2-1.1),cz-d/2+4.5+i*4.4,.9+rand()*.25]);
      const crowns=new THREE.InstancedMesh(own(new THREE.ConeGeometry(.75,6,9)),std({color:0x2c3a24,roughness:1}),spots.length),
        trunks=new THREE.InstancedMesh(own(new THREE.CylinderGeometry(.1,.14,1,6)),std({color:0x4a3a28,roughness:1}),spots.length);
      spots.forEach(([x,z,k],i)=>{dummy.scale.set(k,k,k);dummy.position.set(x,.5+3*k,z);dummy.updateMatrix?.();crowns.setMatrixAt?.(i,dummy.matrix);
        dummy.position.set(x,.5,z);dummy.updateMatrix?.();trunks.setMatrixAt?.(i,dummy.matrix);block(x,z,1.2,1.2)});
      for(const m of [crowns,trunks]){m.raycast=()=>{};root.add(m)}
      // The bench, one of the library's seats, a little east of the way in, facing the front.
      const g=new THREE.Group();g.position.set(cx+4.2,0,cz+1.2);g.rotation.y=Math.PI;root.add(g);
      const seat=box(2.2,.14,.6,warm,0,.48,0,g),ends=[-.9,.9].map(x=>box(.3,.42,.55,warm,x,.21,0,g));
      block(cx+4.2,cz+1.2,2.4,.8);
      const info={title:CARDS.bench[0],author:CARDS.bench[1],categories:['Classics']};
      if(!seatHere([seat,...ends],g,Math.PI,info))for(const part of [seat,...ends])mark(part,card('bench'));
      const flame=std({color:0xffc06a,emissive:0xff8a2a,emissiveIntensity:1.8,roughness:.6,transparent:true,opacity:.92});
      for(const sx of [-2.6,2.6]){torch(root,cx+sx,2.6,0,bronze,flame,card('torch'));block(cx+sx,2.6,.5,.5)}
    }

    // The dusk: a painted sky round and over the court, the sun just going down behind its western wall. No light of its own.
    function buildDusk(){
      const sky=own(canvasTexture((c,W,H)=>{const g=c.createLinearGradient(0,H,0,0);g.addColorStop(0,'#f0b071');g.addColorStop(.26,'#c98a62');g.addColorStop(.6,'#5d6584');g.addColorStop(1,'#2b3350');
        c.fillStyle=g;c.fillRect(0,0,W,H);let k=5;const r=()=>(k=(k*9301+49297)%233280)/233280;
        c.fillStyle='#fff';for(let i=0;i<60;i++){c.globalAlpha=.15+r()*.5;c.fillRect(r()*W,r()*H*.45,1.6,1.6)}c.globalAlpha=1;
        for(let i=0;i<9;i++){c.fillStyle=`rgba(255,214,170,${.08+r()*.1})`;c.beginPath();c.ellipse(r()*W,H*(.5+r()*.3),60+r()*120,8+r()*14,0,0,7);c.fill()}},512,256));
      const dome=add(own(new THREE.CylinderGeometry(28,28,24,24,1,true)),
        std({map:sky,emissive:0xffffff,emissiveMap:sky,emissiveIntensity:.5,roughness:1,side:THREE.BackSide,fog:false}),COURT.cx,9,COURT.cz,root);
      dome.raycast=()=>{};
      const lid=add(own(new THREE.PlaneGeometry(58,58)),std({color:0x2b3350,emissive:0x2b3350,emissiveIntensity:.45,roughness:1,side:THREE.BackSide,fog:false}),COURT.cx,21,COURT.cz,root);
      lid.rotation.x=-Math.PI/2;lid.raycast=()=>{};
    }

    // The facade: a screen wall on z=0, so it stands taller than the hall behind it. Three doorways and four statue
    // niches below, three aediculae above; columns and capitals are instanced.
    function buildFacade(stone,warm,shade){
      const g=new THREE.Group();g.position.set(HALL.cx,0,0);root.add(g);
      const LOW=8.2,UP=6.4,SILL=HALL.y+LOW+1.3;
      // Three steps from the court up to the platform the front stands on.
      for(let i=0;i<STEPS.n;i++){const depth=(STEPS.z1-STEPS.z0)/STEPS.n,z=STEPS.z1-depth*(i+.5),top=HALL.y*(i+1)/STEPS.n;
        mark(box(21,top,depth,warm,0,top/2,z,g),card('steps'))}
      // The lower storey: the solid runs between the three openings, worked out from the doorways themselves so that no
      // gap is left to see the hall through, and a lintel over each opening.
      const WIDE=21,edges=[-WIDE/2,...DOORWAYS.flatMap(d=>[d.x-d.w/2,d.x+d.w/2]),WIDE/2];
      for(let i=0;i<edges.length;i+=2){const w=edges[i+1]-edges[i];if(w>.01)box(w,LOW,1,stone,(edges[i]+edges[i+1])/2,HALL.y+LOW/2,0,g)}
      for(const d of DOORWAYS)box(d.w,LOW-4.6,1,stone,d.x,HALL.y+LOW-(LOW-4.6)/2,0,g);
      mark(box(22,1.3,1.6,warm,0,HALL.y+LOW+.65,0,g),card('inscription'));
      mark(add(own(new THREE.PlaneGeometry(21.6,1.05)),std({map:lintel(),roughness:.85}),0,HALL.y+LOW+.65,.81,g),card('inscription'));
      // The upper storey: three aediculae, a cornice, and the pediments over them (triangular at the ends, segmental
      // in the middle, as at Ephesus).
      box(21,UP,.8,stone,0,SILL+UP/2,0,g);
      for(const sx of [-7,0,7]){box(3.3,UP-.6,.5,warm,sx,SILL+(UP-.6)/2,.5,g);box(2.5,UP-1.6,.3,shade,sx,SILL+(UP-1.6)/2,.62,g)}
      mark(box(21,.9,1.3,warm,0,SILL+UP+.45,0,g),card('facade'));
      const garlands=frieze();garlands.wrapS=THREE.RepeatWrapping;garlands.repeat?.set?.(3,1);
      mark(add(own(new THREE.PlaneGeometry(21,.62)),std({map:garlands,roughness:.85}),0,SILL+UP+.45,.66,g),card('facade'));
      // Triangular pediments over the outer aediculae: a triangle drawn out into a slab.
      const tri=new THREE.Shape();tri.moveTo(-2,0);tri.lineTo(2,0);tri.lineTo(0,1.1);tri.lineTo(-2,0);
      const pediment=own(new THREE.ExtrudeGeometry(tri,{depth:.9,bevelEnabled:false}));
      for(const sx of [-7,7]){const p=add(pediment,warm,sx,SILL+UP+.9,-.35,g);p.raycast=()=>{}}
      const arch=add(own(new THREE.CylinderGeometry(1.9,1.9,.9,16,1,false,0,Math.PI)),warm,0,SILL+UP+.9,.1,g);
      arch.rotation.x=Math.PI/2;arch.rotation.z=Math.PI;arch.raycast=()=>{};
      // Eight columns below on their pedestals, six above.
      const shaft=own(new THREE.CylinderGeometry(.42,.46,LOW-1.5,24)),cap=own(new THREE.CylinderGeometry(.66,.44,.6,16)),abacus=own(new THREE.BoxGeometry(1.4,.16,1.4)),dummy=new THREE.Object3D(),places=[];
      for(const dx of [-7.6,-3.2,3.2,7.6])for(const s of [-.9,.9])places.push({x:dx+s,y:HALL.y+1+(LOW-1.5)/2,z:1.5,k:1,h:LOW-1.5});
      for(const dx of [-7,0,7])for(const s of [-1.55,1.55])places.push({x:dx+s,y:SILL+UP/2,z:1.1,k:.82,h:(LOW-1.5)*.82});
      const fluted=flutes();fluted.wrapS=THREE.RepeatWrapping;
      const shafts=new THREE.InstancedMesh(shaft,std({color:0xe9dfc8,map:fluted,roughness:.75}),places.length),
        caps=new THREE.InstancedMesh(cap,std({color:0xeee4cc,map:acanthus(),roughness:.8}),places.length),slabs=new THREE.InstancedMesh(abacus,warm,places.length);
      places.forEach((p,i)=>{dummy.rotation.set(0,0,0);dummy.scale.set(p.k,p.k,p.k);dummy.position.set(p.x,p.y,p.z);dummy.updateMatrix?.();shafts.setMatrixAt?.(i,dummy.matrix);
        dummy.position.set(p.x,p.y+p.h/2+.3*p.k,p.z);dummy.updateMatrix?.();caps.setMatrixAt?.(i,dummy.matrix);
        dummy.position.set(p.x,p.y+p.h/2+.66*p.k,p.z);dummy.updateMatrix?.();slabs.setMatrixAt?.(i,dummy.matrix)});
      for(const m of [shafts,caps,slabs]){m.raycast=()=>{};g.add(m)}
      for(const dx of [-7.6,-3.2,3.2,7.6])box(2.8,1,1.6,warm,dx,HALL.y+.5,1.5,g);
      for(const s of STATUES)buildStatue(g,s,warm,shade);
    }

    // A statue in her niche in the lower storey, facing the court.
    function buildStatue(parent,s,warm,shade){
      const g=new THREE.Group();g.position.set(s.x,HALL.y,.4);parent.add(g);
      const data={...card(s.key),author:`${CARDS[s.key][1]} ${s.points}`};
      box(2,3.6,.5,shade,0,2.4,-.35,g);box(1.1,.5,.8,warm,0,.25,0,g);
      for(const part of figure(warm,1.85,g,0,.5,0))mark(part,data);
      mark(sign(parent,s.key.toUpperCase(),null,1.2,.32,s.x,HALL.y+4.3,.14),data);
      block(HALL.cx+s.x,.4,1.7,1.3);
    }

    // The hall behind the front: its floor laid round the stairwell, double walls, niches, apse and the four cases.
    function buildHall(stone,warm,shade,bronze){
      const {cx,cz,w,d,h,y}=HALL,x0=cx-w/2,x1=cx+w/2,z0=cz-d/2,z1=cz+d/2;
      // The floor, in four pieces, so that the stairwell down to the vault is a real opening and not a trapdoor; each
      // piece tiles the opus sectile at its own size, so the squares and discs keep their shape.
      const pattern=sectile(),floor=(u,v)=>std({color:0xe8e0cc,map:tiled(pattern,u,v,3.2),roughness:.6});
      const hx0=STAIR.x-STAIR.half,hx1=STAIR.x+STAIR.half;
      box(hx0-x0,.3,d,floor(hx0-x0,d),(x0+hx0)/2,y-.15,cz,root);
      box(x1-hx1,.3,d,floor(x1-hx1,d),(hx1+x1)/2,y-.15,cz,root);
      box(hx1-hx0,.3,STAIR.z1-z0,floor(hx1-hx0,STAIR.z1-z0),STAIR.x,y-.15,(z0+STAIR.z1)/2,root);
      box(hx1-hx0,.3,z1-STAIR.z0,floor(hx1-hx0,z1-STAIR.z0),STAIR.x,y-.15,(STAIR.z0+z1)/2,root);
      // A coffered timber ceiling, and a cornice where it meets the walls.
      box(w+2,.3,d,std({color:0xffffff,map:tiled(coffers(),w+2,d,1.6),roughness:.9}),cx,y+h,cz,root);
      boxes([[cx,y+h-.25,z0+.35,w,.5,.4],[x0+.35,y+h-.25,cz,.4,.5,d],[x1-.35,y+h-.25,cz,.4,.5,d]],warm);
      // The inner walls, and a metre behind each the outer: what kept the damp off the scrolls.
      const panels=revetment(),dressed=(len)=>std({color:0xffffff,map:tiled(panels,len,h,2.5),roughness:.6});
      panels.wrapT=THREE.ClampToEdgeWrapping;
      for(const [bx,bz,bw,bd,ox,oz] of [[x0,cz,.5,d,-1,0],[x1,cz,.5,d,1,0]]){
        box(bw,h,bd,dressed(d),bx,y+h/2,bz,root);box(bw,h,bd,shade,bx+ox,y+h/2,bz+oz,root)}
      // The north wall stands either side of the apse and carries over its head, so the recess is open to the hall.
      const APSE=2.5;
      for(const sx of [-1,1])box(w/2-APSE,h,.5,dressed(w/2-APSE),cx+sx*(w/2+APSE)/2,y+h/2,z0,root);
      box(APSE*2,h-5.6,.5,stone,cx,y+5.6+(h-5.6)/2,z0,root);
      box(w,h,.5,shade,cx,y+h/2,z0-1,root);
      mark(sign(root,'THE HALL','Seventeen metres by eleven, and a reconstruction',2.6,.44,cx-5.6,y+2.6,z0+.3),card('hall'));
      buildNiches(stone,shade,warm);
      buildApse(stone,warm,bronze);
      buildTable(warm,bronze);
      const {groups,crypt:cryptBooks}=catalogue(),geometry=own(new THREE.BoxGeometry(.64,.88,.12));
      for(const group of groups)buildCase(group,geometry,stone);
      buildStair(stone,warm);
      buildCrypt(stone,shade,bronze,cryptBooks[0]||null);
    }
    function marbleFloor(){
      return own(canvasTexture((c,W,H)=>{c.fillStyle='#cfc3a8';c.fillRect(0,0,W,H);c.strokeStyle='rgba(120,108,86,.5)';c.lineWidth=3;
        for(let i=0;i<=4;i++){c.beginPath();c.moveTo(i*W/4,0);c.lineTo(i*W/4,H);c.stroke();c.beginPath();c.moveTo(0,i*H/4);c.lineTo(W,i*H/4);c.stroke()}
        let k=19;const r=()=>(k=(k*9301+49297)%233280)/233280;
        for(let i=0;i<120;i++){c.fillStyle=`rgba(160,146,118,${r()*.14})`;c.fillRect(r()*W,r()*H,8+r()*26,4+r()*10)}},256,256));
    }

    // ---------- dressing: textures drawn once a visit, and boxes in bulk ----------
    let seed=31;const rand=()=>(seed=(seed*9301+49297)%233280)/233280;
    // Many boxes of one material as one InstancedMesh: [x,y,z,w,h,d] each, in the parent's frame.
    function boxes(list,material,parent=root){
      const m=new THREE.InstancedMesh(own(new THREE.BoxGeometry(1,1,1)),material,list.length),dummy=new THREE.Object3D();
      list.forEach(([x,y,z,w,h,d],i)=>{dummy.position.set(x,y,z);dummy.rotation.set(0,0,0);dummy.scale.set(w,h,d);dummy.updateMatrix?.();m.setMatrixAt?.(i,dummy.matrix)});
      m.raycast=()=>{};parent.add(m);return m}
    // A texture tiled so that one copy covers `size` metres of a face `u` by `v` metres.
    function tiled(texture,u,v,size){const t=texture.clone?.()||texture;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat?.set?.(u/size,v/size);t.needsUpdate=true;return own(t)}
    // Dressed stone in courses, for the court's walls.
    function ashlar(){return own(canvasTexture((c,W,H)=>{c.fillStyle='#a4977c';c.fillRect(0,0,W,H);
      for(let row=0;row<8;row++){const y=row*H/8,off=row%2?W/6:0;for(let col=-1;col<3;col++){const x=off+col*W/3;
        c.fillStyle=`hsl(38,${16+rand()*8}%,${50+rand()*9}%)`;c.fillRect(x+2,y+2,W/3-4,H/8-4)}}
      for(let i=0;i<200;i++){c.fillStyle=`rgba(60,48,32,${rand()*.12})`;c.fillRect(rand()*W,rand()*H,2+rand()*5,2+rand()*3)}},256,256))}
    // Big slabs of grey-gold marble, worn, for the court.
    function paving(){return own(canvasTexture((c,W,H)=>{c.fillStyle='#8f8470';c.fillRect(0,0,W,H);
      for(let row=0;row<4;row++){const y=row*H/4,off=row%2?W/4:0;for(let col=-1;col<2;col++){const x=off+col*W/2;
        c.fillStyle=`hsl(40,${12+rand()*10}%,${58+rand()*10}%)`;c.fillRect(x+3,y+3,W/2-6,H/4-6);
        c.strokeStyle='rgba(120,104,80,.25)';c.lineWidth=1;for(let v=0;v<3;v++){c.beginPath();c.moveTo(x+rand()*W/2,y+rand()*H/4);c.lineTo(x+rand()*W/2,y+rand()*H/4);c.stroke()}}}},256,256))}
    // Flutes, for the shafts of the columns.
    function flutes(){return own(canvasTexture((c,W,H)=>{for(let i=0;i<24;i++){const g=c.createLinearGradient(i*W/24,0,(i+1)*W/24,0);
      g.addColorStop(0,'#a8987a');g.addColorStop(.35,'#e4d8bd');g.addColorStop(.75,'#d5c8aa');g.addColorStop(1,'#9a8b6e');c.fillStyle=g;c.fillRect(i*W/24,0,W/24+1,H)}},256,64))}
    // Acanthus round a capital: rows of leaves curling outward.
    function acanthus(){return own(canvasTexture((c,W,H)=>{c.fillStyle='#d9ccb0';c.fillRect(0,0,W,H);
      for(const [row,y0,s] of [[0,H*.95,1],[1,H*.6,.85]])for(let i=0;i<8;i++){const x=(i+(row?.5:0))*W/8;
        c.fillStyle='#b9a986';c.beginPath();c.moveTo(x-W/18*s,y0);c.quadraticCurveTo(x-W/14*s,y0-H*.45*s,x,y0-H*.55*s);c.quadraticCurveTo(x+W/14*s,y0-H*.45*s,x+W/18*s,y0);c.fill();
        c.strokeStyle='#8f7f5e';c.lineWidth=2;c.beginPath();c.moveTo(x,y0);c.lineTo(x,y0-H*.5*s);c.stroke()}
      c.fillStyle='#c9bb9b';for(let i=0;i<8;i++){c.beginPath();c.arc((i+.5)*W/8,H*.12,W/40,0,7);c.fill()}},256,128))}
    // A run of carved garlands and rosettes, for the frieze under the upper cornice.
    function frieze(){return own(canvasTexture((c,W,H)=>{c.fillStyle='#d4c7aa';c.fillRect(0,0,W,H);
      c.strokeStyle='#9c8c6c';c.lineWidth=H*.12;for(let i=0;i<6;i++){const x=i*W/6;c.beginPath();c.moveTo(x+W*.02,H*.25);c.quadraticCurveTo(x+W/12,H*.95,x+W/6-W*.02,H*.25);c.stroke()}
      c.fillStyle='#b4a482';for(let i=0;i<=6;i++){c.beginPath();c.arc(i*W/6,H*.32,H*.18,0,7);c.fill()}
      c.fillStyle='#8f7f5e';for(let i=0;i<=6;i++){c.beginPath();c.arc(i*W/6,H*.32,H*.07,0,7);c.fill()}},1024,96))}
    // The lintel over the doorways, with Celsus's name cut in it (the card says what the inscriptions say).
    function lintel(){return own(canvasTexture((c,W,H)=>{c.fillStyle='#d6caae';c.fillRect(0,0,W,H);c.strokeStyle='#a39373';c.lineWidth=4;c.strokeRect(10,10,W-20,H-20);
      c.fillStyle='rgba(70,58,38,.8)';c.textAlign='center';c.font=`bold ${Math.round(H*.36)}px Georgia`;c.fillText('TI · IVLIO · CELSO · POLEMAEANO · COS',W/2,H*.64)},1536,96))}
    // Coloured marble panelling for the hall's lower walls, and plain veined slabs above it: one copy is 2.5 m wide.
    function revetment(){return own(canvasTexture((c,W,H)=>{const m=H/11;c.fillStyle='#d9cfb8';c.fillRect(0,0,W,H);
      for(let i=0;i<30;i++){c.strokeStyle=`rgba(150,136,110,${.08+rand()*.12})`;c.lineWidth=1+rand()*2;c.beginPath();let x=rand()*W,y=rand()*H*.7;c.moveTo(x,y);for(let k=0;k<4;k++)c.lineTo(x+=(rand()-.5)*60,y+=(rand()-.5)*60);c.stroke()}
      c.fillStyle='#5f6b5a';c.fillRect(0,H-m*1.1,W,m*1.1);
      for(let i=0;i<40;i++){c.strokeStyle=`rgba(200,210,190,${.12+rand()*.2})`;c.lineWidth=1;c.beginPath();const y=H-m*1.1+rand()*m;c.moveTo(0,y);c.bezierCurveTo(W*.3,y+(rand()-.5)*20,W*.6,y+(rand()-.5)*20,W,y+(rand()-.5)*14);c.stroke()}
      c.fillStyle='#c7b48a';c.fillRect(0,H-m*1.15,W,m*.06);
      c.fillStyle='#e9e1d0';c.fillRect(W*.06,H-m*3.3,W*.88,m*2);
      for(let i=0;i<14;i++){c.strokeStyle=`rgba(120,70,110,${.25+rand()*.3})`;c.lineWidth=1+rand()*2;c.beginPath();let x=W*.06+rand()*W*.88,y=H-m*3.3+rand()*m*2;c.moveTo(x,y);for(let k=0;k<3;k++)c.lineTo(x+=(rand()-.5)*50,y+=(rand()-.5)*40);c.stroke()}
      c.strokeStyle='#a68f62';c.lineWidth=5;c.strokeRect(W*.06,H-m*3.3,W*.88,m*2)},256,1024))}
    // The coffered ceiling: one coffer a copy, with a rosette in its middle.
    function coffers(){return own(canvasTexture((c,W,H)=>{c.fillStyle='#6d5638';c.fillRect(0,0,W,H);
      for(const [inset,col] of [[.08,'#7f6542'],[.16,'#5b4630'],[.24,'#3f3022']]){c.fillStyle=col;c.fillRect(W*inset,H*inset,W*(1-2*inset),H*(1-2*inset))}
      c.fillStyle='#b8924a';for(let i=0;i<8;i++){const a=i*Math.PI/4;c.beginPath();c.ellipse(W/2+Math.cos(a)*W*.06,H/2+Math.sin(a)*H*.06,W*.05,W*.025,a,0,7);c.fill()}
      c.fillStyle='#d8b465';c.beginPath();c.arc(W/2,H/2,W*.035,0,7);c.fill()},128,128))}
    // Opus sectile: squares of giallo antico round a disc of porphyry or serpentine, in bands of white marble.
    function sectile(){return own(canvasTexture((c,W,H)=>{c.fillStyle='#e6dcc6';c.fillRect(0,0,W,H);
      for(let i=0;i<2;i++)for(let j=0;j<2;j++){const x=i*W/2,y=j*H/2,u=W/2;
        c.fillStyle='#c4a874';c.fillRect(x+u*.08,y+u*.08,u*.84,u*.84);
        c.fillStyle=(i+j)%2?'#5e2c28':'#3b4f40';c.beginPath();c.arc(x+u/2,y+u/2,u*.22,0,7);c.fill();
        c.strokeStyle='#e6dcc6';c.lineWidth=u*.03;c.beginPath();c.arc(x+u/2,y+u/2,u*.22,0,7);c.stroke();
        for(let k=0;k<20;k++){c.fillStyle=`rgba(255,255,255,${rand()*.08})`;c.fillRect(x+rand()*u,y+rand()*u,3,3)}}
      c.strokeStyle='rgba(120,104,80,.5)';c.lineWidth=2;for(let i=0;i<=2;i++){c.beginPath();c.moveTo(i*W/2,0);c.lineTo(i*W/2,H);c.stroke();c.beginPath();c.moveTo(0,i*H/2);c.lineTo(W,i*H/2);c.stroke()}},256,256))}
    // A draped figure turned on a lathe: a robe falling to the feet, narrower at the shoulders. `h` is its height.
    function figure(material,h,parent,x,y,z){
      const P=[[0,0],[.44,0],[.46,.06],[.4,.3],[.34,.6],[.3,.8],[.27,.88],[.29,.92],[.22,.96],[.1,.99],[0,1]];
      const body=add(own(new THREE.LatheGeometry(P.map(([r,v])=>new THREE.Vector2(r*h*.42,v*h*.82)),20)),material,x,y,z,parent);
      const head=add(own(new THREE.SphereGeometry(h*.075,14,10)),material,x,y+h*.88,z,parent);head.scale.set(1,1.15,.95);
      const arm=add(own(new THREE.CylinderGeometry(h*.04,h*.035,h*.36,8)),material,x+h*.15,y+h*.6,z+h*.06,parent);arm.rotation.set(-.5,0,.35);
      return [body,head,arm]}
    // A bronze torch stand with a flame that flickers: the flame is drawn, not lit.
    const flames=[];
    function torch(parent,x,z,y,bronze,flameMat,data){
      const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);
      const pole=add(own(new THREE.CylinderGeometry(.04,.05,1.6,8)),bronze,0,.8,0,g),cup=add(own(new THREE.CylinderGeometry(.2,.08,.18,12)),bronze,0,1.65,0,g);
      for(let i=0;i<3;i++){const a=i*Math.PI*2/3,leg=add(own(new THREE.CylinderGeometry(.025,.025,.5,6)),bronze,Math.cos(a)*.16,.18,Math.sin(a)*.16,g);leg.rotation.set(-Math.sin(a)*.45,0,Math.cos(a)*.45)}
      const flame=add(own(new THREE.ConeGeometry(.12,.38,10)),flameMat,0,1.92,0,g);flame.raycast=()=>{};flames.push(flame);
      for(const part of [pole,cup])mark(part,data);return g}

    // The niches round three walls: three tiers, the upper two full of scrolls and out of reach.
    function buildNiches(stone,shade,warm){
      const {cx,cz,w,d,y,h}=HALL,TIERS=[y+1.1,y+4.1,y+7.1],wood=std({color:0x5a3d24,roughness:.8}),frames=[],linings=[],shelves=[],pilasters=[];
      // Each niche: a timber lining (the armarium), shelves for the upper tiers, and a marble frame standing proud of the wall.
      const niche=(x,yc,z,across)=>{const W=1.8,H=2.2,fx=across==='z'?(a,b)=>[x+b,yc+a[1],z+a[0]]:(a,b)=>[x+a[0],yc+a[1],z+b];
        if(across==='z'){linings.push([x,yc,z,.5,H,W]);for(const [dz,dy,fw,fh] of [[0,H/2+.08,W+.36,.16],[0,-H/2-.06,W+.36,.12],[-W/2-.09,0,.18,H+.3],[W/2+.09,0,.18,H+.3]])frames.push([x+(x<cx?.27:-.27),yc+dy,z+dz,.12,fh,fw])}
        else{linings.push([x,yc,z,W,H,.5]);for(const [dx,dy,fw,fh] of [[0,H/2+.08,W+.36,.16],[0,-H/2-.06,W+.36,.12],[-W/2-.09,0,.18,H+.3],[W/2+.09,0,.18,H+.3]])frames.push([x+dx,yc+dy,z+.27,fw,fh,.12])}
        void fx};
      for(const side of [{wall:'west',x:cx-w/2+.3,yaw:Math.PI/2,s:1},{wall:'east',x:cx+w/2-.3,yaw:-Math.PI/2,s:-1}])
        for(const tier of TIERS)for(let i=0;i<4;i++){
          const z=cz-d/2+2.2+i*2.5;niche(side.x,tier+.5,z,'z');
          if(tier!==TIERS[0]){scrolls(side.x+side.s*.3,tier+.5,z,side.yaw);for(const dy of [-.95,-.43,.09,.61])shelves.push([side.x+side.s*.12,tier+.5+dy,z,.5,.04,1.7])}}
      for(const sx of [-6.6,-2.3,2.3,6.6])for(const tier of TIERS.slice(1)){
        niche(cx+sx,tier+.5,cz-d/2+.3,'x');scrolls(cx+sx,tier+.5,cz-d/2+.58,0);for(const dy of [-.95,-.43,.09,.61])shelves.push([cx+sx,tier+.5+dy,cz-d/2+.42,1.7,.04,.5])}
      // Pilasters between the niches on the side walls, from the floor to the cornice.
      for(const px of [cx-w/2+.3,cx+w/2-.3])for(let i=0;i<5;i++)pilasters.push([px+(px<cx?.04:-.04),y+h/2,cz-d/2+.95+i*2.5,.5,h,.34]);
      boxes(linings,wood);boxes(shelves,wood);boxes(frames,warm);boxes(pilasters,std({color:0xe2d6bb,map:flutes(),roughness:.7}));
      // The gallery that reached the upper tiers: a ledge only, as the reader keeps to the floor.
      for(const bx of [cx-w/2+1.2,cx+w/2-1.2])box(1.7,.22,d-1.4,stone,bx,y+3.3,cz,root);
      mark(sign(root,'THE SCROLLS','Papyrus rolls in their cases, each with its tag',2.4,.4,cx-w/2+.62,y+6.4,cz+3.4),card('scrolls')).rotation.y=Math.PI/2;
    }
    // A niche full of rolls: one InstancedMesh, standing where its instances are, so focus finds it by its own position.
    function scrolls(x,y,z,yaw){
      const N=28,m=new THREE.InstancedMesh(own(new THREE.CylinderGeometry(.07,.07,.52,7)),std({color:0xffffff,roughness:.95}),N),dummy=new THREE.Object3D(),
        tags=new THREE.InstancedMesh(own(new THREE.BoxGeometry(.012,.09,.06)),std({color:0xffffff,roughness:.9}),N),tone=new THREE.Color();
      let k=13+Math.round(x*7+z*3);const r=()=>(k=Math.abs(k*9301+49297)%233280)/233280;
      for(let i=0;i<N;i++){const row=Math.floor(i/7),col=i%7,lift=-.86+row*.52+(r()<.3?.07:0);
        dummy.position.set(0,lift,-.6+col*.2);dummy.rotation.set(0,0,Math.PI/2+(r()-.5)*.14);dummy.scale.set(1,.8+r()*.34,1);dummy.updateMatrix?.();m.setMatrixAt?.(i,dummy.matrix);
        m.setColorAt?.(i,tone.setHSL(.1+r()*.04,.28+r()*.2,.62+r()*.16));
        dummy.position.set(.27,lift-.07,-.6+col*.2);dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);dummy.updateMatrix?.();tags.setMatrixAt?.(i,dummy.matrix);
        tags.setColorAt?.(i,tone.set([0x8e2b22,0xb8862e,0x2f4e6e,0xd8cfb8][Math.floor(r()*4)]))}
      for(const n of [m,tags]){n.position.set(x,y,z);n.rotation.y=yaw;n.raycast=()=>{};root.add(n)}return m}

    // The apse in the middle of the rear wall, its statue, and the bronze lamp before it.
    function buildApse(stone,warm,bronze){
      const {cx,cz,d,y}=HALL,z=cz-d/2+1.4;
      const curve=add(own(new THREE.CylinderGeometry(2.4,2.4,5.6,18,1,true,Math.PI/2,Math.PI)),stone,cx,y+2.8,z-.5,root);
      curve.material.side=THREE.DoubleSide;curve.raycast=()=>{};
      const half=add(own(new THREE.SphereGeometry(2.4,18,9,0,Math.PI*2,0,Math.PI/2)),stone,cx,y+5.6,z-.5,root);
      half.material.side=THREE.DoubleSide;half.raycast=()=>{};
      const plinth=box(1.4,1.1,1,warm,cx,y+.55,z-1.2,root);
      const marbleWhite=std({color:0xf1e9d6,roughness:.55});
      for(const part of [plinth,...figure(marbleWhite,2.7,root,cx,y+1.1,z-1.2)])mark(part,card('apse'));
      const spear=add(own(new THREE.CylinderGeometry(.025,.025,3,6)),bronze,cx+.55,y+2.5,z-1.15,root);spear.raycast=()=>{};
      // The bronze lamp: a tall stand on three feet, its bowl of oil, and a flame that flickers.
      const lampData=card('lamp'),stem=mark(add(own(new THREE.CylinderGeometry(.035,.05,1.3,10)),bronze,cx,y+.7,z+1.8,root),lampData);
      const bowl=mark(add(own(new THREE.SphereGeometry(.2,14,9,0,Math.PI*2,0,Math.PI/2)),bronze,cx,y+1.38,z+1.8,root),lampData);bowl.rotation.x=Math.PI;bowl.scale.set(1.3,.55,1);
      for(let i=0;i<3;i++){const a=i*Math.PI*2/3+.5,foot=add(own(new THREE.CylinderGeometry(.02,.03,.36,6)),bronze,cx+Math.cos(a)*.13,y+.13,z+1.8+Math.sin(a)*.13,root);foot.rotation.set(-Math.sin(a)*.6,0,Math.cos(a)*.6)}
      const flame=add(own(new THREE.ConeGeometry(.07,.24,10)),std({color:0xffc06a,emissive:0xff8a2a,emissiveIntensity:1.8,roughness:.6,transparent:true,opacity:.92}),cx,y+1.52,z+1.8,root);
      flame.raycast=()=>{};flames.push(flame);
      block(cx,z-1.2,1.8,1.4);block(cx,z+1.8,.7,.7);
    }

    // A reading table west of the middle of the hall, a roll open on it, and a bench either side (the library's seats).
    function buildTable(warm,bronze){
      const {cx,y}=HALL,x=cx-3.3,z=-5.7,g=new THREE.Group();g.position.set(x,y,z);root.add(g);
      const data=card('table'),top=mark(box(2.4,.1,.85,warm,0,.78,0,g),data);
      for(const lx of [-1,1])mark(box(.16,.73,.6,warm,lx,.37,0,g),data);
      const papyrus=own(canvasTexture((c,W,H)=>{c.fillStyle='#d8c79c';c.fillRect(0,0,W,H);
        for(let col=0;col<4;col++){const x0=W*(.06+col*.24);for(let line=0;line<16;line++){c.fillStyle=`rgba(52,38,22,${.45+rand()*.3})`;c.fillRect(x0,H*(.1+line*.05),W*(.15+rand()*.04),H*.012)}}},512,128));
      const sheet=mark(add(own(new THREE.PlaneGeometry(1.4,.32)),std({map:papyrus,roughness:.95,side:THREE.DoubleSide}),0,.835,0,g),data);sheet.rotation.x=-Math.PI/2;
      for(const rx of [-.74,.74]){const roll=add(own(new THREE.CylinderGeometry(.045,.045,.36,10)),std({color:0xc9b88c,roughness:.95}),rx,.87,0,g);roll.rotation.x=Math.PI/2;roll.raycast=()=>{}}
      void top;void bronze;block(x,z,2.6,1);
      const info={title:'A bench at the reading table',author:'Sit, and a book from one of the four cases comes to the table with you.',categories:['Classics']};
      for(const side of [-1,1]){const b=new THREE.Group();b.position.set(x,y,z+side*.85);b.rotation.y=side<0?0:Math.PI;root.add(b);
        const seat=box(2,.1,.4,warm,0,.45,0,b),legs=[-.8,.8].map(lx=>box(.12,.42,.36,warm,lx,.21,0,b));block(x,z+side*.85,2.1,.45);
        if(!seatHere([seat,...legs],b,b.rotation.y,info))for(const part of [seat,...legs])mark(part,data)}
    }

    // A case of the library's books in the lowest tier of niches, under a name cut in the marble.
    function buildCase(group,geometry,stone){
      const {cx,cz,w,d,y}=HALL;
      const side=group.wall==='west'?-1:1;
      const spot=group.wall==='north'
        ? {x:cx+group.along,z:cz-d/2+.95,yaw:0}
        : {x:cx+side*(w/2-.95),z:cz+group.along,yaw:-side*Math.PI/2};
      const ROWS=[y+.85,y+1.78];
      const per=group.books.length>3?Math.ceil(group.books.length/2):Math.max(1,group.books.length),
        step=Math.min(.95,(group.length-.6)/Math.max(1,per));
      group.books.forEach((book,i)=>{const row=i<per?0:1,n=row?group.books.length-per:per,col=row?i-per:i,offset=(col-(n-1)/2)*step;
        const place=group.wall==='north'?{x:spot.x+offset,z:spot.z,yaw:0}:{x:spot.x,z:spot.z-side*offset,yaw:spot.yaw};
        placeBook(book,{...place,y:ROWS[row]},geometry,group.key)});
      const rows=group.books.length>per?ROWS:ROWS.slice(0,1);
      for(const ry of rows){
        if(group.wall==='north')box(group.length,.07,.52,stone,spot.x,ry-.46,spot.z,root);
        else box(.52,.07,group.length,stone,spot.x,ry-.46,spot.z,root)}
      if(group.wall==='north')block(spot.x,spot.z,group.length+.2,.66);else block(spot.x,spot.z,.66,group.length+.2);
      const top=rows.at(-1)+.95;
      const name=cut(root,group.greek,group.name,1.9,
        group.wall==='north'?spot.x:spot.x-side*.28,top,group.wall==='north'?spot.z-.26:spot.z,
        group.wall==='north'?0:spot.yaw);
      mark(name,{type:'celsus-card',title:`${group.greek} · ${group.name}`,
        author:`${group.sub}. Her statue stands in the front, in the court outside.`,action:'READ'});
    }

    // The stair down to the vault, in the opening left in the hall floor east of the apse.
    function buildStair(stone,warm){
      const run=(STAIR.z0-STAIR.z1)/STAIR.n,drop=(HALL.y-CRYPT.y)/STAIR.n;
      for(let i=0;i<STAIR.n;i++){const top=HALL.y-drop*(i+1),z=STAIR.z0-run*(i+.5);
        box(STAIR.half*2,.26,run,stone,STAIR.x,top-.13,z,root)}
      // A low parapet either side of the opening, so nobody walks into it.
      for(const sx of [-1,1])box(.22,.75,STAIR.z0-STAIR.z1+.4,warm,STAIR.x+sx*(STAIR.half+.11),HALL.y+.37,(STAIR.z0+STAIR.z1)/2,root);
      for(const sx of [-1,1])block(STAIR.x+sx*(STAIR.half+.11),STAIR.z0-1.5,.3,3);
      mark(sign(root,'THE VAULT','Down the stair, under the apse',2,.34,STAIR.x,HALL.y+1.9,STAIR.z0+.3),card('crypt')).rotation.y=Math.PI;
    }

    // The vault under the apse, and the sarcophagus in it.
    function buildCrypt(stone,shade,bronze,book){
      const {cx,cz,w,d,h,y}=CRYPT;
      box(w,.3,d,stone,cx,y-.15,cz,root);
      // The barrel springs a metre above the floor and its crown keeps under the hall floor overhead.
      const vault=add(own(new THREE.CylinderGeometry(w/2,w/2,d,16,1,true,0,Math.PI)),shade,cx,y+1,cz,root);
      vault.rotation.x=Math.PI/2;vault.rotation.z=Math.PI;vault.material.side=THREE.DoubleSide;vault.raycast=()=>{};
      for(const [bx,bz,bw,bd] of [[cx-w/2,cz,.3,d],[cx+w/2,cz,.3,d],[cx,cz-d/2,w,.3]])box(bw,1,bd,shade,bx,y+.5,bz,root);
      // The south end, either side of the stair's foot, so the chamber is a room and not an open cellar.
      for(const sx of [-1,1])box((w-STAIR.half*2-.3)/2,1.9,.3,shade,cx+sx*(w/4+STAIR.half/2),y+.95,cz+d/2,root);
      const chest=box(1.8,.9,1,stone,cx-.85,y+.45,cz,root),lid=box(2,.36,1.2,stone,cx-.85,y+1.08,cz,root);
      const data={type:'celsus-sarcophagus',title:CARDS.sarcophagus[0],author:CARDS.sarcophagus[1],action:'READ THE INSCRIPTION'};
      for(const part of [chest,lid])mark(part,data);
      const stand=box(.16,.5,.16,bronze,cx+1.2,y+.25,cz-1.1,root);
      const flame=add(own(new THREE.SphereGeometry(.08,10,8)),std({color:0xffd9a0,emissive:0xffb35c,emissiveIntensity:1.6,roughness:.4}),cx+1.2,y+.58,cz-1.1,root);
      flame.scale.set(1,1.7,1);flame.raycast=()=>{};void stand;
      block(cx-.85,cz,2.2,1.4,'vault');
      crypt={data,book,copy:null,found:false,lidY:y+1.08,x:cx-.85,z:cz};
      if(wasFound())reveal();
    }
    function reveal(){
      if(!crypt||crypt.found)return;crypt.found=true;
      crypt.data.title='The sarcophagus of Celsus, read';
      crypt.data.author=`${CARDS.sarcophagus[1]} The library has left a book on the lid: a Roman who wrote, over and over, to remind himself that he would die.`;
      crypt.data.action='LOOK';
      if(crypt.book&&!crypt.copy){const geometry=own(new THREE.BoxGeometry(.64,.88,.12));
        crypt.copy=placeBook(crypt.book,{x:crypt.x+.4,y:crypt.lidY+.26,z:crypt.z,yaw:.3,tilt:-Math.PI/2},geometry,'crypt')}
    }

    function placeBook(book,spot,geometry,shelf,parent=root){
      const mesh=add(geometry,own(bookMaterial(book)),spot.x,spot.y,spot.z,parent);mesh.rotation.order='YXZ';
      mesh.rotation.y=spot.yaw||0;mesh.rotation.x=spot.tilt??-.08;
      mesh.userData={type:'book',book,loaded:false,celsus:true,shelf,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent}};
      interactables.push(mesh);ours.push(mesh);books.push(mesh);return mesh}

    // ---------- walking ----------
    const inBox=(x,z,b,m=0)=>x>b.cx-b.w/2+m&&x<b.cx+b.w/2-m&&z>b.cz-b.d/2+m&&z<b.cz+b.d/2-m;
    // The steps are climbed in the doorways: the rest of the front is a wall, as it was.
    const onSteps=(x,z)=>z>=STEPS.z0&&z<=STEPS.z1&&inDoorway(x);
    // The doorway itself: through the thickness of the front, at the hall's own level.
    const onThreshold=(x,z)=>z>=THRESHOLD.z0&&z<THRESHOLD.z1&&inDoorway(x);
    const onStair=(x,z)=>Math.abs(x-STAIR.x)<STAIR.half&&z<=STAIR.z0&&z>=STAIR.z1;
    function contains(x,z){return inBox(x,z,COURT)||inBox(x,z,HALL)||inBox(x,z,CRYPT)||onSteps(x,z)||onThreshold(x,z)||onStair(x,z)}
    function floorAt(x,z){
      if(onStair(x,z)){const t=Math.ceil(Math.min(1,Math.max(0,(STAIR.z0-z)/(STAIR.z0-STAIR.z1)))*STAIR.n)/STAIR.n;return HALL.y-(HALL.y-CRYPT.y)*t}
      if(inBox(x,z,CRYPT))return CRYPT.y;
      if(onThreshold(x,z))return HALL.y;
      if(onSteps(x,z)){const t=Math.ceil(Math.min(1,Math.max(0,(STEPS.z1-z)/(STEPS.z1-STEPS.z0)))*STEPS.n)/STEPS.n;return HALL.y*t}
      if(inBox(x,z,HALL))return HALL.y;
      if(inBox(x,z,COURT))return COURT.y;
      return null}
    function allowed(x,z){
      const r=player.radius||.42,level=onStair(x,z)||inBox(x,z,CRYPT)?'vault':'hall';
      if(blockers.some(b=>b.level===level&&x+r>b.minX&&x-r<b.maxX&&z+r>b.minZ&&z-r<b.maxZ))return false;
      // In the doorways and on the steps and the stair, where the walls are close, the reader passes.
      if(onStair(x,z)||onSteps(x,z)||onThreshold(x,z))return true;
      if(inBox(x,z,CRYPT))return inBox(x,z,CRYPT,.5);
      if(inBox(x,z,HALL))return inBox(x,z,HALL,.8)&&!inBox(x,z,{cx:STAIR.x,cz:(STAIR.z0+STAIR.z1)/2,w:STAIR.half*2+.6,d:STAIR.z0-STAIR.z1});
      if(inBox(x,z,COURT))return inBox(x,z,COURT,.6);
      return false}

    // ---------- doing things ----------
    function enter(){
      activate();move(COURT.cx,COURT.cz+COURT.d/2-1.6,0);playSample?.('doorOpen',.8,.9);
      showNotice('The court before the Library of Celsus, at dusk. The four statues in the front are Sophia, Episteme, Ennoia and Arete; the middle doorway leads into the hall, where each of them has a case of books. Only the front ever survived: the hall is a reconstruction.',13);
      analytics?.track('Room Explored',{room:'celsus-room'})}
    function leave(){
      const p=corridor?.standBefore?.(DOOR,2.2)||{x:DOOR.x-2.2,z:DOOR.z,yaw:Math.PI/2};
      move(p.x,p.z,p.yaw);playSample?.('doorOpen',.8,1);showNotice('The Long Corridor again.',3)}
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('celsus-'))return false;
      if(data.type==='celsus-door'){through(data,enter);return true}
      if(data.type==='celsus-exit'){through(data,leave);return true}
      if(data.type==='celsus-sarcophagus'){
        if(crypt?.found){showNotice(`${data.title}: ${data.author}`,13);return true}
        reveal();try{storage?.setItem(FOUND_KEY,'1')}catch(e){}playSample?.('pageTurn',.6,.7);
        showNotice(`You read the inscription. Tiberius Julius Celsus Polemaeanus lies here, in a marble sarcophagus under the apse of his own library: a thing all but unheard of inside a Roman city.${crypt.book?' There is a book on the lid.':''}`,15);
        return true}
      if(data.type==='celsus-card'){showNotice(`${data.title}: ${data.author}`,data.author.length>260?17:data.author.length>130?12:9);return true}
      return false}

    // ---------- lifecycle ----------
    function activate(){if(!root)buildRoom();lastNeeded=time}
    function unload(){
      if(!root)return;flames.length=0;root.removeFromParent();root.traverse(object=>{if(object.isLight)object.userData.freed=true});root=null;crypt=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0}
    function update(t){
      if(root)flames.forEach((f,i)=>{const k=1+Math.sin(t*9+i*1.7)*.08+Math.sin(t*15.3+i)*.05;f.scale.set(1/k,k,1/k)});
      time=t;const inside=contains(player.pos.x,player.pos.z),near=Math.hypot(player.pos.x-DOOR.x,player.pos.z-DOOR.z)<PRELOAD;
      if(inside||near&&(root||window.libraryMayBuild?.()!==false))activate();
      else if(root&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==b.userData.home.parent))unload()}
    buildDoor();
    return {contains,floorAt,allowed,interact,update,enter,leave,activate,unload,catalogue,door:DOOR,court:COURT,hall:HALL,vault:CRYPT,
      steps:STEPS,threshold:THRESHOLD,stair:STAIR,doorways:DOORWAYS,groups:GROUPS,statues:STATUES,cards:CARDS,inDoorway,
      get built(){return !!root},get books(){return books.slice()},get found(){return !!crypt?.found||wasFound()},
      zoneAt:(x,z)=>inBox(x,z,CRYPT)||onStair(x,z)?'celsus-crypt':inBox(x,z,HALL)||onThreshold(x,z)?'celsus-hall':onSteps(x,z)||inBox(x,z,COURT)?'celsus-court':null};
  };
})();
