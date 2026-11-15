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
  // The four statues, in the facade's lower niches from west to east (x from the middle of the front), each pointing at
  // the case that stands under her name inside.
  const STATUES=[
    {key:'sophia',x:-8.55,points:'Her case is the long one on the hall’s west wall.'},
    {key:'episteme',x:-2.95,points:'Her case is on the hall’s east wall, opposite Sophia’s.'},
    {key:'ennoia',x:2.95,points:'Her case is in the hall, west of the apse.'},
    {key:'arete',x:8.55,points:'Her case is in the hall, east of the apse.'}
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
    crypt:['The vault','Down the stair east of the apse. A library above and a grave below, which is a plainer statement about books and dying than anything written on the walls.']
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
      // The court: paving, and rubble walls on its three other sides.
      box(COURT.w,.3,COURT.d,std({color:0x9b907a,map:marble,roughness:.92}),COURT.cx,-.15,COURT.cz,root);
      for(const [bx,bz,bw,bd] of [[COURT.cx,COURT.cz+COURT.d/2,COURT.w,.4],[COURT.cx-COURT.w/2,COURT.cz,.4,COURT.d],[COURT.cx+COURT.w/2,COURT.cz,.4,COURT.d]])
        box(bw,5.5,bd,shade,bx,2.75,bz,root);
      buildDusk();
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
      // The upper storey: three aediculae, a cornice, and the pediments over them (triangular at the ends, segmental
      // in the middle, as at Ephesus).
      box(21,UP,.8,stone,0,SILL+UP/2,0,g);
      for(const sx of [-7,0,7]){box(3.3,UP-.6,.5,warm,sx,SILL+(UP-.6)/2,.5,g);box(2.5,UP-1.6,.3,shade,sx,SILL+(UP-1.6)/2,.62,g)}
      mark(box(21,.9,1.3,warm,0,SILL+UP+.45,0,g),card('facade'));
      for(const sx of [-7,7]){const p=add(own(new THREE.ConeGeometry(1.9,1.2,3)),warm,sx,SILL+UP+1.5,.1,g);p.rotation.y=Math.PI/2;p.scale.set(1,1,.42);p.raycast=()=>{}}
      const arch=add(own(new THREE.CylinderGeometry(1.9,1.9,.9,16,1,false,0,Math.PI)),warm,0,SILL+UP+.9,.1,g);
      arch.rotation.x=Math.PI/2;arch.rotation.z=Math.PI;arch.raycast=()=>{};
      // Eight columns below on their pedestals, six above.
      const shaft=own(new THREE.CylinderGeometry(.42,.46,LOW-1.5,12)),cap=own(new THREE.BoxGeometry(1.2,.6,1.2)),dummy=new THREE.Object3D(),places=[];
      for(const dx of [-7.6,-3.2,3.2,7.6])for(const s of [-.9,.9])places.push({x:dx+s,y:HALL.y+1+(LOW-1.5)/2,z:1.5,k:1,h:LOW-1.5});
      for(const dx of [-7,0,7])for(const s of [-1.55,1.55])places.push({x:dx+s,y:SILL+UP/2,z:1.1,k:.82,h:(LOW-1.5)*.82});
      const shafts=new THREE.InstancedMesh(shaft,warm,places.length),caps=new THREE.InstancedMesh(cap,warm,places.length);
      places.forEach((p,i)=>{dummy.rotation.set(0,0,0);dummy.scale.set(p.k,p.k,p.k);dummy.position.set(p.x,p.y,p.z);dummy.updateMatrix?.();shafts.setMatrixAt?.(i,dummy.matrix);
        dummy.position.set(p.x,p.y+p.h/2+.3*p.k,p.z);dummy.updateMatrix?.();caps.setMatrixAt?.(i,dummy.matrix)});
      for(const m of [shafts,caps]){m.raycast=()=>{};g.add(m)}
      for(const dx of [-7.6,-3.2,3.2,7.6])box(2.8,1,1.6,warm,dx,HALL.y+.5,1.5,g);
      for(const s of STATUES)buildStatue(g,s,warm,shade);
    }

    // A statue in her niche in the lower storey, facing the court.
    function buildStatue(parent,s,warm,shade){
      const g=new THREE.Group();g.position.set(s.x,HALL.y,.4);parent.add(g);
      const data={...card(s.key),author:`${CARDS[s.key][1]} ${s.points}`};
      box(2,3.6,.5,shade,0,2.4,-.35,g);box(1.1,.5,.8,warm,0,.25,0,g);
      const body=add(own(new THREE.CylinderGeometry(.26,.44,1.5,14)),warm,0,1.25,0,g),
        head=add(own(new THREE.SphereGeometry(.17,12,10)),warm,0,2.15,0,g),
        arm=add(own(new THREE.CylinderGeometry(.08,.07,.8,8)),warm,.28,1.5,.1,g);
      head.scale.set(1,1.15,.95);arm.rotation.z=.5;
      for(const part of [body,head,arm])mark(part,data);
      mark(sign(parent,s.key.toUpperCase(),null,1.2,.32,s.x,HALL.y+4.3,.14),data);
      block(HALL.cx+s.x,.4,1.7,1.3);
    }

    // The hall behind the front: its floor laid round the stairwell, double walls, niches, apse and the four cases.
    function buildHall(stone,warm,shade,bronze){
      const {cx,cz,w,d,h,y}=HALL,x0=cx-w/2,x1=cx+w/2,z0=cz-d/2,z1=cz+d/2;
      const floor=std({color:0xc2b69b,map:marbleFloor(),roughness:.8});
      // The floor, in four pieces, so that the stairwell down to the vault is a real opening and not a trapdoor.
      const hx0=STAIR.x-STAIR.half,hx1=STAIR.x+STAIR.half;
      box(hx0-x0,.3,d,floor,(x0+hx0)/2,y-.15,cz,root);
      box(x1-hx1,.3,d,floor,(hx1+x1)/2,y-.15,cz,root);
      box(hx1-hx0,.3,STAIR.z1-z0,floor,STAIR.x,y-.15,(z0+STAIR.z1)/2,root);
      box(hx1-hx0,.3,z1-STAIR.z0,floor,STAIR.x,y-.15,(STAIR.z0+z1)/2,root);
      box(w+2,.3,d,std({color:0x6f6757,roughness:1}),cx,y+h,cz,root);
      // The inner walls, and a metre behind each the outer: what kept the damp off the scrolls.
      for(const [bx,bz,bw,bd,ox,oz] of [[x0,cz,.5,d,-1,0],[x1,cz,.5,d,1,0]]){
        box(bw,h,bd,stone,bx,y+h/2,bz,root);box(bw,h,bd,shade,bx+ox,y+h/2,bz+oz,root)}
      // The north wall stands either side of the apse and carries over its head, so the recess is open to the hall.
      const APSE=2.5;
      for(const sx of [-1,1])box(w/2-APSE,h,.5,stone,cx+sx*(w/2+APSE)/2,y+h/2,z0,root);
      box(APSE*2,h-5.6,.5,stone,cx,y+5.6+(h-5.6)/2,z0,root);
      box(w,h,.5,shade,cx,y+h/2,z0-1,root);
      mark(sign(root,'THE HALL','Seventeen metres by eleven, and a reconstruction',2.6,.44,cx-5.6,y+2.6,z0+.3),card('hall'));
      buildNiches(stone,shade);
      buildApse(stone,warm,bronze);
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

    // The niches round three walls: three tiers, the upper two full of scrolls and out of reach.
    function buildNiches(stone,shade){
      const {cx,cz,w,d,y}=HALL,TIERS=[y+1.1,y+4.1,y+7.1];
      for(const side of [{wall:'west',x:cx-w/2+.3,yaw:Math.PI/2,s:1},{wall:'east',x:cx+w/2-.3,yaw:-Math.PI/2,s:-1}])
        for(const tier of TIERS)for(let i=0;i<4;i++){
          const z=cz-d/2+2.2+i*2.5;box(.5,2.2,1.8,shade,side.x,tier+.5,z,root);
          if(tier!==TIERS[0])scrolls(side.x+side.s*.3,tier+.5,z,side.yaw)}
      for(const sx of [-6.6,-2.3,2.3,6.6])for(const tier of TIERS.slice(1)){
        box(1.8,2.2,.5,shade,cx+sx,tier+.5,cz-d/2+.3,root);scrolls(cx+sx,tier+.5,cz-d/2+.58,0)}
      // The gallery that reached the upper tiers: a ledge only, as the reader keeps to the floor.
      for(const bx of [cx-w/2+1.2,cx+w/2-1.2])box(1.7,.22,d-1.4,stone,bx,y+3.3,cz,root);
      mark(sign(root,'THE SCROLLS','Papyrus rolls in their cases, each with its tag',2.4,.4,cx-w/2+.62,y+6.4,cz+3.4),card('scrolls')).rotation.y=Math.PI/2;
    }
    // A niche full of rolls: one InstancedMesh, standing where its instances are, so focus finds it by its own position.
    function scrolls(x,y,z,yaw){
      const N=18,m=new THREE.InstancedMesh(own(new THREE.CylinderGeometry(.07,.07,.52,7)),std({color:0xcbbc96,roughness:.95}),N),dummy=new THREE.Object3D();
      let k=13;const r=()=>(k=(k*9301+49297)%233280)/233280;
      for(let i=0;i<N;i++){const row=Math.floor(i/6);dummy.position.set(0,-.72+row*.52,-.52+(i%6)*.21);
        dummy.rotation.set(0,0,Math.PI/2+(r()-.5)*.12);dummy.scale.set(1,.84+r()*.3,1);dummy.updateMatrix?.();m.setMatrixAt?.(i,dummy.matrix)}
      m.position.set(x,y,z);m.rotation.y=yaw;m.raycast=()=>{};root.add(m);return m}

    // The apse in the middle of the rear wall, its statue, and the bronze lamp before it.
    function buildApse(stone,warm,bronze){
      const {cx,cz,d,y}=HALL,z=cz-d/2+1.4;
      const curve=add(own(new THREE.CylinderGeometry(2.4,2.4,5.6,18,1,true,Math.PI/2,Math.PI)),stone,cx,y+2.8,z-.5,root);
      curve.material.side=THREE.DoubleSide;curve.raycast=()=>{};
      const half=add(own(new THREE.SphereGeometry(2.4,18,9,0,Math.PI*2,0,Math.PI/2)),stone,cx,y+5.6,z-.5,root);
      half.material.side=THREE.DoubleSide;half.raycast=()=>{};
      const plinth=box(1.4,1.1,1,warm,cx,y+.55,z-1.2,root),figure=add(own(new THREE.CylinderGeometry(.3,.5,2,14)),warm,cx,y+2.1,z-1.2,root);
      for(const part of [plinth,figure])mark(part,card('apse'));
      const bowl=mark(add(own(new THREE.SphereGeometry(.22,12,9)),bronze,cx,y+1.05,z+1.8,root),card('lamp'));
      bowl.scale.set(1.4,.6,1);box(.1,.9,.1,bronze,cx,y+.55,z+1.8,root);box(.5,.08,.5,bronze,cx,y+.08,z+1.8,root);
      block(cx,z-1.2,1.8,1.4);block(cx,z+1.8,.7,.7);
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
      if(!root)return;root.removeFromParent();root.traverse(object=>{if(object.isLight)object.userData.freed=true});root=null;crypt=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0}
    function update(t){
      time=t;const inside=contains(player.pos.x,player.pos.z),near=Math.hypot(player.pos.x-DOOR.x,player.pos.z-DOOR.z)<PRELOAD;
      if(inside||near&&(root||window.libraryMayBuild?.()!==false))activate();
      else if(root&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==b.userData.home.parent))unload()}
    buildDoor();
    void registerSeat;
    return {contains,floorAt,allowed,interact,update,enter,leave,activate,unload,catalogue,door:DOOR,court:COURT,hall:HALL,vault:CRYPT,
      steps:STEPS,threshold:THRESHOLD,stair:STAIR,doorways:DOORWAYS,groups:GROUPS,statues:STATUES,cards:CARDS,inDoorway,
      get built(){return !!root},get books(){return books.slice()},get found(){return !!crypt?.found||wasFound()},
      zoneAt:(x,z)=>inBox(x,z,CRYPT)||onStair(x,z)?'celsus-crypt':inBox(x,z,HALL)||onThreshold(x,z)?'celsus-hall':onSteps(x,z)||inBox(x,z,COURT)?'celsus-court':null};
  };
})();
