// The book lift and the Lost Property Office. In the west wing, in the plain stretch of the south wall between the
// hidden passage and the STAFF · SORTING door, is the hatch of an old book lift: a dumbwaiter, meant for carrying
// books between floors. Ring its bell and the shutter rises; the reader folds into the car and is let down the shaft,
// past the wing and the basement, to the Lost Property Office far below, where unclaimed books wait in pigeonholes,
// each with a tag saying where it was found. Which books are out is chosen at random on every visit, from a stock of
// books that no other shelf in the library holds (room lost-property in data/new-books.js); the bell on the counter
// sends for another lot. The car takes the reader up again.
// Like the rooms behind doors, the office and the shaft are built when the reader rings and freed a while after they
// leave; the hatch in the west wing stays.
(function(){
  'use strict';

  // Where each book was found: invented, like the library's other traces of readers.
  const FOUND=['Left on a seat in the reading carriage of the night train','Found in the roof garden, in the rain','Handed in at the Antipodes, upside down',
    'Found in the basket of the balloon','Left on the Moon','Found in the Boathouse, rather damp','Left beside the great globe in the Grand Hall',
    'Found behind the turf creel in the Irish Room','Left open on the map table in the Map Room','Handed in by Quill, the library cat',
    'Found halfway up the high staircase','Left in the Evening Room when the fire burned down','Found in the Room of Chance, which did not want it',
    'Left on the lectern in the Set Texts Room','Found on the rug in the Children’s Attic','Left in the Poe Room, under the raven',
    'Handed in by the conductor of the night train','Found among the returns, with no slip'];
  const SLOTS=9;
  // The hatch's opening runs from its sill (0.62 m) to 1.96 m; the shutter rolls up into the top of it.
  const HATCH_TOP=1.96;

  window.createBookLift=function(options){
    const {THREE,scene,MAT,player,camera,interactables,bookMaterial,findBook,canvasTexture,showNotice,playSample,sound,fade,move,
      analytics,arrivals=[],isHolding=()=>false,isReducedMotion=()=>false}=options;
    // The hatch is set into the wainscot of the west wing's south wall (its face at z 9.56), clear of the hidden passage
    // (x −31.1 to −28.9) and the STAFF · SORTING door on the west wall (x −36.6).
    const ENTRANCE={x:-33.9,z:9.56,yaw:Math.PI};
    // The office stands far from everything else: the Room of Chance is at x 500, z 60, Mars at x 620, z 120.
    const ROOM={cx:500,cz:220,w:14,d:12,h:4.4};
    // The shaft runs up behind the office's north wall. The car's floor travels between y 0 and TOP.
    const SHAFT={x:ROOM.cx,z:ROOM.cz-ROOM.d/2-1.05,w:1.9,top:15};
    const OPENING={w:1.6,h:2.3};
    const KEEP=25;
    let root=null,car=null,time=0,lastNeeded=-1e9,ride=null,shutter=null,shutterOpen=0,shutterTarget=0;
    const hatchParts=[],books=[],slots=[],ours=[],owned=[],blockers=[];

    const own=o=>{owned.push(o);return o};
    function add(geometry,material,x,y,z,parent=scene){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    function shuffle(list){const a=list.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
    const pick=list=>list[Math.floor(Math.random()*list.length)];
    const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),smooth=p=>p*p*(3-2*p);
    const card=(title,text,action='READ')=>({type:'lift-card',title,author:text,action});
    function signTexture(title,sub,{bg='#17110c',ink='#e2c995',rule='#a98653',w=640,h=150}={}){return canvasTexture((c,cw,ch)=>{c.fillStyle=bg;c.fillRect(0,0,cw,ch);c.strokeStyle=rule;c.lineWidth=6;c.strokeRect(9,9,cw-18,ch-18);c.fillStyle=ink;c.textAlign='center';c.font=`bold ${Math.round(ch*.3)}px Georgia`;c.fillText(title,cw/2,sub?ch*.48:ch*.62);if(sub){c.font=`italic ${Math.round(ch*.16)}px Georgia`;c.fillText(sub,cw/2,ch*.78)}},w,h)}

    // ---------- the hatch in the west wing (stays) ----------
    function buildHatch(){
      const g=new THREE.Group();g.position.set(ENTRANCE.x,0,ENTRANCE.z);g.rotation.y=ENTRANCE.yaw;scene.add(g);
      // Local +z faces into the wing (local z 0 is the wainscot's face). The frame stands proud of it; behind the shutter is dark.
      const frameMat=MAT.darkWood,sill=.62,H=1.34,W=1.24;
      const parts=[box(W+.3,.16,.26,frameMat,0,sill-.08,.04,g),box(W+.3,.16,.26,frameMat,0,sill+H+.08,.04,g),box(.15,H+.32,.26,frameMat,-(W/2+.075),sill+H/2,.04,g),box(.15,H+.32,.26,frameMat,W/2+.075,sill+H/2,.04,g)];
      const dark=add(new THREE.PlaneGeometry(W,H),new THREE.MeshStandardMaterial({color:0x050403,roughness:1}),0,sill+H/2,.02,g);
      // The shutter: a panelled wooden blind that rises into the frame when the bell is rung.
      const slatTex=canvasTexture((c,w,h)=>{c.fillStyle='#3b2416';c.fillRect(0,0,w,h);for(let y=0;y<h;y+=24){c.fillStyle='#24150c';c.fillRect(0,y,w,3);c.fillStyle='#4a2e1c';c.fillRect(0,y+3,w,2)}},128,256);
      shutter=add(new THREE.BoxGeometry(W,H,.04),new THREE.MeshStandardMaterial({map:slatTex,roughness:.8}),0,sill+H/2,.07,g);
      const plate=add(new THREE.PlaneGeometry(1.2,.3),new THREE.MeshStandardMaterial({map:signTexture('BOOK LIFT','Lost Property · below',{bg:'#2a1d0f',ink:'#f0d79a',rule:'#c79a4c',w:512,h:128}),roughness:.5,metalness:.3}),0,sill+H+.36,.18,g);
      // A brass bell-pull on a chain beside the hatch.
      const pullRod=add(new THREE.CylinderGeometry(.012,.012,.7,6),MAT.brass,W/2+.32,sill+H-.05,.12,g);
      const pull=add(new THREE.SphereGeometry(.06,10,8),MAT.brass,W/2+.32,sill+H-.45,.12,g);
      const data={type:'lift-hatch',title:'A service hatch with a bell-pull',author:'An old book lift. A brass plate reads: LOST PROPERTY, BELOW. Ring and step in.',action:'RING FOR THE LIFT'};
      for(const part of [...parts,dark,shutter,plate,pullRod,pull]){part.userData=data;interactables.push(part);hatchParts.push(part)}
    }

    // ---------- the office and the shaft (built on demand) ----------
    function brickTexture(){
      const t=canvasTexture((c,w,h)=>{c.fillStyle='#3a2a22';c.fillRect(0,0,w,h);for(let row=0;row<8;row++)for(let col=-1;col<5;col++){const x=col*64+(row%2?32:0),y=row*32,shade=34+Math.floor(Math.random()*22);c.fillStyle=`rgb(${shade+30},${shade+6},${shade-8})`;c.fillRect(x+2,y+2,60,28)}},256,256);
      t.wrapS=t.wrapT=THREE.RepeatWrapping;return own(t);
    }
    function buildShaft(parent,brick){
      const {x,z,w,top}=SHAFT,H=top+3.4,front=ROOM.cz-ROOM.d/2;
      const shaftMat=own(new THREE.MeshStandardMaterial({map:brick,roughness:.95}));
      const wall=(ww,hh,dd,mx,my,mz,rx,ry)=>{const m=box(ww,hh,dd,shaftMat,mx,my,mz,parent);return m};
      brick.repeat.set(1,H/2);
      wall(w+.4,H,.2,x,H/2-.2,z-w/2-.1);                    // back
      wall(.2,H,w,x-w/2-.1,H/2-.2,z);wall(.2,H,w,x+w/2+.1,H/2-.2,z); // sides
      // The front wall, open at the bottom into the office.
      const above=H-OPENING.h;wall(w+.4,above,.2,x,OPENING.h+above/2-.2,front-.1);
      box(w+.4,.2,w+.4,MAT.darkWood,x,-.1,z,parent);box(w+.4,.2,w+.4,MAT.darkWood,x,H-.1,z,parent);
      // The floors the car passes, painted on the front wall of the shaft, lit faintly so they can be read going by.
      const marks=[[top+1.15,'WEST WING','the hatch by Staff · Sorting'],[top*.7,'BASEMENT','below the catalogue'],[top*.42,'SUB-BASEMENT','no admittance'],[OPENING.h+.55,'LOST PROPERTY','all enquiries at the counter']];
      for(const [y,title,sub] of marks){const tex=own(signTexture(title,sub,{bg:'#20160f',ink:'#e8cf96',rule:'#8b6a3c',w:512,h:128}));const p=add(own(new THREE.PlaneGeometry(1.5,.38)),own(new THREE.MeshStandardMaterial({map:tex,emissive:0xffffff,emissiveMap:tex,emissiveIntensity:.35,roughness:.9})),x,y,front-.215,parent);p.rotation.y=Math.PI}
      // Counterweight rails and the hauling ropes.
      for(const dx of [-w/2+.12,w/2-.12])box(.06,H,.06,MAT.brass,x+dx,H/2-.2,z-w/2+.06,parent);
      // The car: an open-fronted wooden box on ropes, with a little lamp.
      car=new THREE.Group();car.position.set(x,0,z);parent.add(car);
      const cw=w-.16;
      box(cw,.1,cw,MAT.wood,0,.05,0,car);box(cw,.1,cw,MAT.wood,0,1.75,0,car);
      box(cw,1.8,.08,MAT.wood2,0,.9,-cw/2+.04,car);box(.08,1.8,cw,MAT.wood2,-cw/2+.04,.9,0,car);box(.08,1.8,cw,MAT.wood2,cw/2-.04,.9,0,car);
      for(const dx of [-cw/2+.06,cw/2-.06])box(.04,1.7,.04,MAT.brass,dx,.9,cw/2-.04,car);
      for(const dx of [-.3,.3])add(own(new THREE.CylinderGeometry(.02,.02,H,5)),MAT.brass,dx,1.8+H/2,0,car);
      const bulb=add(own(new THREE.SphereGeometry(.06,10,8)),own(new THREE.MeshStandardMaterial({color:0xffd59a,emissive:0xffb050,emissiveIntensity:2})),0,1.62,-cw/2+.25,car);
      const lamp=new THREE.PointLight(0xffc47e,.9,6,2);lamp.position.set(0,1.6,-.3);car.add(lamp);
      // In the office, the car's open side is the way back up.
      const upData={type:'lift-car',title:'The book lift',author:'The car waits at the bottom of the shaft. It goes up to the west wing.',action:'RIDE UP'};
      for(const part of car.children)if(part.isMesh&&part!==bulb){part.userData=upData;interactables.push(part);ours.push(part)}
    }

    // A rack of pigeonholes, three by three, its open side (local −z) turned by yaw to face the room.
    function rack(parent,x,z,yaw){
      const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=yaw;parent.add(g);
      const W=7.1,H=4.3,D=.72;
      for(const y of [.18,1.55,2.92,4.2])box(W,.12,D,MAT.darkWood,0,y,0,g);
      for(const dx of [-W/2,-W/6,W/6,W/2])box(dx===-W/2||dx===W/2?.2:.08,H,D,MAT.darkWood,dx,H/2,0,g);
      box(W,H,.1,MAT.wood2,0,H/2,.31,g);
      for(let i=0;i<SLOTS;i++){const row=Math.floor(i/3),col=i%3;slots.push({group:g,x:-2.37+col*2.37,y:.88+row*1.37,z:-.46,mesh:null,tag:'',id:null})}
      block(x,z,Math.abs(Math.cos(yaw))*W+Math.abs(Math.sin(yaw))*D,Math.abs(Math.sin(yaw))*W+Math.abs(Math.cos(yaw))*D);
    }
    let tagGeo=null,tagMat=null;
    function shelve(slot,book){
      const bm=add(own(new THREE.BoxGeometry(1.05,1.2,.16)),own(bookMaterial(book)),slot.x,slot.y,slot.z,slot.group);
      bm.rotation.x=(Math.random()-.5)*.06;bm.rotation.z=(Math.random()-.5)*.12;
      const tagText=pick(FOUND);
      bm.userData={type:'book',book,loaded:false,lostProperty:true,tag:tagText,home:{position:bm.position.clone(),quaternion:bm.quaternion.clone(),parent:slot.group}};
      // A paper luggage tag tied to the corner.
      const tag=new THREE.Mesh(tagGeo,tagMat);tag.position.set(.46,-.5,-.09);tag.rotation.set(0,Math.PI,.35);bm.add(tag);
      interactables.push(bm);ours.push(bm);books.push(bm);slot.mesh=bm;slot.tag=tagText;slot.id=book.id;
    }
    // The stock: every book on the lost-property shelf that the library could find. The ones not out are in the back.
    const stock=()=>arrivals.map(id=>findBook(id)).filter(Boolean);
    function unshelve(slot){
      const bm=slot.mesh;if(!bm)return;slot.mesh=null;slot.id=null;
      bm.removeFromParent();
      for(const list of [interactables,ours,books]){const i=list.indexOf(bm);if(i>=0)list.splice(i,1)}
      for(const thing of [bm.geometry,bm.material]){const i=owned.indexOf(thing);if(i>=0){owned.splice(i,1);thing.dispose?.()}}
    }
    // Fill the empty pigeonholes from the stock, at random, never putting out a book that is already out or carried.
    // Sending for another lot clears the pigeonholes first, and brings out books that were not just there if it can.
    function restock(clearing=false){
      const away=new Set(books.filter(b=>b.parent!==b.userData.home.parent).map(b=>b.userData.book.id)),shown=new Set();
      if(clearing)for(const slot of slots)if(slot.mesh&&slot.mesh.parent===slot.group){shown.add(slot.id);unshelve(slot)}
      const out=new Set([...away,...slots.filter(s=>s.mesh).map(s=>s.id)]),free=stock().filter(book=>!out.has(book.id));
      const choices=[...shuffle(free.filter(book=>shown.has(book.id))),...shuffle(free.filter(book=>!shown.has(book.id)))];
      for(const slot of shuffle(slots)){if(slot.mesh)continue;const book=choices.pop();if(!book)break;shelve(slot,book)}
    }

    function buildRoom(){
      if(root)return;root=new THREE.Group();scene.add(root);
      const {cx,cz,w,d,h}=ROOM,brick=brickTexture();
      tagGeo=own(new THREE.PlaneGeometry(.2,.12));tagMat=own(new THREE.MeshStandardMaterial({color:0xe6d7b0,roughness:.9,side:THREE.DoubleSide}));
      box(w,.35,d,MAT.wood,cx,-.18,cz,root);
      box(w,.3,d,MAT.darkWood,cx,h+.15,cz,root);
      box(w,h,.4,MAT.stone,cx,h/2,cz+d/2,root);
      box(.4,h,d,MAT.stone,cx-w/2,h/2,cz,root);box(.4,h,d,MAT.stone,cx+w/2,h/2,cz,root);
      // The north wall, with the mouth of the lift shaft in the middle.
      const side=(w-OPENING.w)/2;
      box(side,h,.4,MAT.stone,cx-OPENING.w/2-side/2,h/2,cz-d/2,root);box(side,h,.4,MAT.stone,cx+OPENING.w/2+side/2,h/2,cz-d/2,root);
      box(OPENING.w,h-OPENING.h,.4,MAT.stone,cx,OPENING.h+(h-OPENING.h)/2,cz-d/2,root);
      for(const dx of [-OPENING.w/2-.08,OPENING.w/2+.08])box(.16,OPENING.h+.1,.5,MAT.darkWood,cx+dx,(OPENING.h+.1)/2,cz-d/2,root);
      box(OPENING.w+.32,.16,.5,MAT.darkWood,cx,OPENING.h+.08,cz-d/2,root);
      buildShaft(root,brick);
      const upTex=own(signTexture('BOOK LIFT','up to the west wing',{bg:'#2a1d0f',ink:'#f0d79a',rule:'#c79a4c',w:512,h:128}));
      mark(add(own(new THREE.PlaneGeometry(1.3,.32)),own(new THREE.MeshStandardMaterial({map:upTex,roughness:.5,metalness:.3})),cx,OPENING.h+.42,cz-d/2+.21,root),car.children.find(part=>part.userData.type==='lift-car').userData);
      const rug=add(own(new THREE.PlaneGeometry(7,5)),own(new THREE.MeshStandardMaterial({color:0x3a2a1c,roughness:1})),cx,.015,cz+.4,root);rug.rotation.x=-Math.PI/2;
      const lamp=new THREE.PointLight(0xffc47e,10,16,2);lamp.position.set(cx,3.4,cz+.6);root.add(lamp);
      add(own(new THREE.SphereGeometry(.16,12,10)),own(new THREE.MeshStandardMaterial({color:0xffe0a8,emissive:0xffb85c,emissiveIntensity:1.6})),cx,3.55,cz+.6,root);
      add(own(new THREE.CylinderGeometry(.01,.01,.75,4)),MAT.brass,cx,4.0,cz+.6,root);
      // Pigeonholes on the east and west walls.
      rack(root,cx-w/2+.62,cz+.4,-Math.PI/2);rack(root,cx+w/2-.62,cz+.4,Math.PI/2);
      // The counter across the south of the room, with its bell, ledger and sign.
      const counterZ=cz+d/2-2.1;
      box(6.2,1.05,.9,MAT.wood2,cx,.525,counterZ,root);box(6.5,.08,1.05,MAT.wood,cx,1.09,counterZ,root);block(cx,counterZ,6.6,1.2);
      const bellBase=box(.34,.05,.34,MAT.darkWood,cx+1.6,1.16,counterZ-.1,root);
      const bell=add(own(new THREE.SphereGeometry(.15,14,10,0,Math.PI*2,0,Math.PI/2)),MAT.brass,cx+1.6,1.18,counterZ-.1,root);
      const knob=add(own(new THREE.SphereGeometry(.035,8,6)),MAT.brass,cx+1.6,1.35,counterZ-.1,root);
      for(const part of [bellBase,bell,knob])mark(part,{type:'lift-bell',title:'A bell on the counter',author:'A card propped against it: RING FOR ANOTHER LOT.',action:'RING'});
      const ledger=box(.9,.06,.62,MAT.paper,cx-1.4,1.16,counterZ-.05,root);ledger.rotation.y=-.18;
      box(.92,.07,.64,own(new THREE.MeshStandardMaterial({color:0x5a2a1e,roughness:.8})),cx-1.4,1.125,counterZ-.05,root).rotation.y=-.18;
      mark(ledger,card('The ledger of lost property','Every entry in the same patient hand: what was found, where, and by whom. Not one of them has been claimed. The last line reads: “Books not claimed within the year may be read on the premises.”'));
      const signTex=own(signTexture('LOST PROPERTY','Unclaimed books may be read on the premises',{w:768,h:160}));
      const sign=mark(add(own(new THREE.PlaneGeometry(4.4,.92)),own(new THREE.MeshStandardMaterial({map:signTex,roughness:.85})),cx,3.2,cz+d/2-.21,root),card('Lost Property','Books left behind anywhere in the library end up down here, tagged with where they were found. None of them are on any other shelf. Which ones are out is a matter of chance; the bell on the counter sends for another lot, and the lift takes you up again.'));
      sign.rotation.y=Math.PI;
      // Things that are always left behind: umbrellas, a hat, a pair of cases.
      const leather=own(new THREE.MeshStandardMaterial({color:0x5b3a22,roughness:.7}));
      box(.5,.7,.5,MAT.darkWood,cx+w/2-.6,.35,cz+d/2-.6,root);
      for(let i=0;i<4;i++){const u=add(own(new THREE.CylinderGeometry(.035,.02,1.1,6)),i%2?MAT.fabric:MAT.darkWood,cx+w/2-.6+(i%2-.5)*.18,.95,cz+d/2-.6+(i<2?-.1:.1),root);u.rotation.z=(i-1.5)*.08}
      mark(add(own(new THREE.CylinderGeometry(.3,.3,.12,12)),MAT.darkWood,cx+w/2-.6,1.4,cz+d/2-.6,root),card('Umbrellas','Four umbrellas, none of them furled the same way. Nobody has ever come back for an umbrella.'));
      box(1.1,.32,.7,leather,cx-w/2+1.1,.16,cz+d/2-.7,root);box(.9,.28,.6,MAT.fabric,cx-w/2+1.1,.46,cz+d/2-.72,root);block(cx-w/2+1.1,cz+d/2-.7,1.2,.8);
      mark(box(.95,.02,.12,MAT.brass,cx-w/2+1.1,.33,cz+d/2-.36,root),card('Two suitcases','Labels from hotels in towns that may not exist. Both are locked, and both, by the weight of them, are full of books.'));
      restock();
      lastNeeded=time;
    }

    // ---------- riding the lift ----------
    function startRide(dir){
      if(ride)return;buildRoom();lastNeeded=time;
      const reduced=isReducedMotion();
      ride={dir,t:0,duration:reduced?3.2:(dir>0?8:6.5),reduced,faded:false,said:0,next:0};
      playSample?.('floorboardCreak',.7,.8);
      if(dir>0){showNotice('You fold yourself into the car. Somewhere above, a rope takes the weight.',4);analytics?.track('Room Explored',{room:'book-lift'})}
      else showNotice('The car lurches, and the office drops away beneath you.',3.5);
    }
    const DOWN_LINES=[[.3,'Past the west wing.'],[.58,'Past the basement, where the trains rumble.'],[.82,'Further down than the basement goes.']];
    function updateRide(dt){
      ride.t+=dt;const p=clamp(ride.t/ride.duration,0,1),e=smooth(p);
      const y=ride.dir>0?SHAFT.top*(1-e):SHAFT.top*e;
      car.position.y=y;
      // The car jolts a little on the rope, never in reduced motion.
      const jolt=ride.reduced?0:Math.sin(ride.t*19)*.008+Math.sin(ride.t*7.3)*.006;
      camera.position.set(SHAFT.x+(ride.reduced?0:Math.sin(ride.t*1.7)*.03),y+1.15+jolt,SHAFT.z-.25);
      camera.rotation.set(-.05,Math.PI,ride.reduced?0:Math.sin(ride.t*2.1)*.012,'YXZ');camera.updateMatrixWorld();
      if(ride.t>=ride.next){ride.next=ride.t+(ride.reduced?2:.9);sound?.(52+Math.random()*10,.8,'sawtooth',.035)}
      if(ride.dir>0)while(ride.said<DOWN_LINES.length&&p>=DOWN_LINES[ride.said][0]){showNotice(DOWN_LINES[ride.said][1],2.5);ride.said++}
      if(p>=1&&!ride.faded){ride.faded=true;fade?.(1);const dir=ride.dir;setTimeout(()=>{ride=null;arrive(dir);setTimeout(()=>fade?.(0),120)},ride.reduced?120:340)}
    }
    function arrive(dir){
      if(dir>0){
        if(car)car.position.y=0;
        move(ROOM.cx,ROOM.cz-ROOM.d/2+1.5,Math.PI);playSample?.('doorOpen',.6,.8);
        showNotice('The Lost Property Office. Every book here was left behind somewhere in the library, and none of them is on any other shelf. A different lot is out each time; ring the bell on the counter for more.',10);
      }else{
        if(car)car.position.y=0;
        move(ENTRANCE.x,ENTRANCE.z-1.35,0);shutterTarget=0;playSample?.('doorOpen',.6,1.1);
        showNotice('The shutter of the book lift rattles down behind you. The west wing again.',4);
      }
    }
    function ringHatch(){
      if(ride)return;sound?.(1320,.7,'sine',.12);setTimeout(()=>sound?.(1320,.7,'sine',.1),220);
      shutterTarget=1;
      if(isHolding()){showNotice('The car is too small for you and a book. Put the book back first.',4);return}
      setTimeout(()=>startRide(1),isReducedMotion()?150:800);
    }
    function ringCounter(){
      sound?.(1480,1,'sine',.14);sound?.(2220,.6,'sine',.05);
      const before=slots.filter(s=>s.mesh&&s.mesh.parent===s.group).length;
      restock(true);
      showNotice(before?'Somewhere out of sight a trolley squeaks, and the pigeonholes are filled with a different lot.':'The pigeonholes fill up again.',4);
      analytics?.track('Room Explored',{room:'lost-property-restock'});
    }

    function contains(x,z){return x>ROOM.cx-ROOM.w/2&&x<ROOM.cx+ROOM.w/2&&z>ROOM.cz-ROOM.d/2&&z<ROOM.cz+ROOM.d/2}
    function floorAt(x,z){return contains(x,z)?0:null}
    function allowed(x,z){if(!contains(x,z))return false;const r=player.radius||.42;if(x-r<ROOM.cx-ROOM.w/2+.45||x+r>ROOM.cx+ROOM.w/2-.45||z-r<ROOM.cz-ROOM.d/2+.45||z+r>ROOM.cz+ROOM.d/2-.45)return false;return !blockers.some(b=>x+r>b.minX&&x-r<b.maxX&&z+r>b.minZ&&z-r<b.maxZ)}
    // A link (/?room=lost-property) goes straight to the office; the ride is saved for the way up.
    function enter(){buildRoom();arrive(1);analytics?.track('Room Explored',{room:'lost-property'})}
    function interact(object){
      const d=object?.userData;if(!d||typeof d.type!=='string'||!d.type.startsWith('lift-'))return false;
      if(d.type==='lift-hatch'){ringHatch();return true}
      if(d.type==='lift-car'){startRide(-1);return true}
      if(d.type==='lift-bell'){ringCounter();return true}
      if(d.type==='lift-card'){showNotice(`${d.title}: ${d.author}`,9);return true}
      return false;
    }
    // A reader carrying one of the office's books to the car puts it back first: the books stay down here.
    function carryUp(returnBook){returnBook();showNotice('You put the book back in its pigeonhole; lost property stays in the office.',4);startRide(-1)}
    function unload(){
      if(!root||ride)return;root.removeFromParent();root.traverse(object=>{if(object.isLight)object.userData.freed=true});root=null;car=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();
      ours.length=0;books.length=0;slots.length=0;blockers.length=0;tagGeo=tagMat=null;
    }
    function update(t,dt=0){
      time=t;
      if(shutter){shutterOpen+=(shutterTarget-shutterOpen)*Math.min(1,dt*5);shutter.scale.y=1-shutterOpen*.9;shutter.position.y=HATCH_TOP-.67*shutter.scale.y}
      if(ride){lastNeeded=t;updateRide(dt);return}
      if(contains(player.pos.x,player.pos.z))lastNeeded=t;
      // A book the reader is carrying keeps the office until it comes home.
      else if(root&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==b.userData.home?.parent))unload();
    }
    function reset(){if(ride){ride=null;fade?.(0);if(car)car.position.y=0}}
    buildHatch();
    return {contains,floorAt,allowed,interact,update,enter,unload,reset,carryUp,room:ROOM,entrance:ENTRANCE,shaft:SHAFT,
      get travelling(){return !!ride},get built(){return !!root},get books(){return books.slice()},get stockCount(){return stock().length},
      zoneAt:(x,z)=>contains(x,z)?'lost-property':null};
  };
})();
