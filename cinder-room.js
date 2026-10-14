// Loaded only after the cold hearth is discovered. All damage is an original theatrical representation.
(function(){
  'use strict';
  window.buildCinderRoom=function(options){
    const {THREE,scene,MAT,player,interactables,canvasTexture,findBook,arrivals,move,prepareReturn,showNotice,playSample,isHolding=()=>false,entrance}=options;
    const ROOM={cx:700,cz:-180,w:16,d:15,h:5.7},KEEP=25;
    let root=null,time=0,lastNeeded=0;const owned=[],ours=[],volumes=[],blockers=[];
    const own=o=>{owned.push(o);return o};
    const material=color=>own(new THREE.MeshStandardMaterial({color,roughness:1}));
    function box(w,h,d,mat,x,y,z,parent=root){const m=new THREE.Mesh(own(new THREE.BoxGeometry(w,h,d)),mat);m.position.set(x,y,z);parent.add(m);return m}
    function mark(m,data){m.userData=data;interactables.push(m);ours.push(m);return m}
    function block(x,z,w,d){blockers.push({x,z,w,d})}
    function print(title,subtitle,x,y,z,yaw=0,width=3){const tex=own(canvasTexture((c,w,h)=>{c.fillStyle='#322c25';c.fillRect(0,0,w,h);c.strokeStyle='#8c7960';c.lineWidth=5;c.strokeRect(8,8,w-16,h-16);c.fillStyle='#ead9b8';c.textAlign='center';c.font='bold 26px Georgia';c.fillText(title,w/2,43);c.font='italic 19px Georgia';c.fillText(subtitle,w/2,79)},640,100));const m=new THREE.Mesh(own(new THREE.PlaneGeometry(width,width/6.4)),own(new THREE.MeshStandardMaterial({map:tex,emissive:0x35291b,emissiveIntensity:.4,roughness:1})));m.position.set(x,y,z);m.rotation.y=yaw;root.add(m);return m}
    const exhibits=[
      ['BEOWULF','A manuscript survived, 1731','The Beowulf manuscript was damaged in the Cotton Library fire of 1731; much of its text remained readable. This scorched binding is the library’s imagined representation, not a facsimile. The readable book is an English translation.',16328],
      ['THE FRENCH REVOLUTION','A first volume rewritten','The manuscript of Carlyle’s first volume was accidentally burnt while in John Stuart Mill’s care in 1835. Carlyle rewrote it; the published history survives. This is a theatrical binding of the surviving work, not the lost draft.',1301],
      ['THE BATTLE OF MALDON','The manuscript lost; a copy survived','The Cotton manuscript containing The Battle of Maldon was destroyed in the 1731 fire. A transcript made before the fire preserved its surviving text. The readable volume here is James M. Garnett’s collection of translated Anglo-Saxon poems.',15879],
      ['COTTON GENESIS','Fragments, not a complete book','The fifth-century Greek Cotton Genesis was severely damaged in the 1731 fire at Ashburnham House. Burnt fragments survive. These symbolic scraps are not photographs or a reconstruction of its text.',null],
      ['HORTUS DELICIARUM','Strasbourg, 1870','Herrad of Landsberg’s medieval manuscript was destroyed in the Strasbourg library fire of 1870. Earlier copies and tracings preserve parts of its imagery. The empty cradle marks the original’s loss; it does not pretend to contain the missing book.',null],
      ['THE HERCULANEUM PAPYRI','Carbonised by volcanic heat, 79 CE','The eruption of Vesuvius carbonised the Herculaneum papyri rather than simply burning them away. Fragile scrolls survive, and imaging can recover text without physically unrolling them. This symbolic scroll has no invented readable text.',null]
    ];
    function build(){if(root)return;root=new THREE.Group();root.name='cinder-archive';scene.add(root);const {cx,cz,w,d,h}=ROOM;
      const char=material(0x25211d),stone=material(0x665d50),paper=material(0xa8997e),ash=material(0x514e48),water=material(0x43484a);
      box(w,.3,d,stone,cx,-.16,cz);
      for(const z of [cz-d/2,cz+d/2])box(w,h,.35,stone,cx,h/2,z);
      for(const x of [cx-w/2,cx+w/2])box(.35,h,d,stone,x,h/2,cz);
      // A broken ceiling: four strips leave a light well above the restoration table.
      for(const dx of [-5.5,5.5])box(5,h*.035,d,char,cx+dx,h,cz);
      for(const dz of [-5.5,5.5])box(6,.2,4,char,cx,h,cz+dz);
      for(let i=0;i<8;i++){const beam=box(.17,.23,5.8,char,cx-6+i*1.7,h-.2,cz-3);beam.rotation.z=(i%3-1)*.08}
      // Smoke streaks and the uneven tide marks left by extinguishing water.
      for(let i=0;i<22;i++){box(.25+(i%4)*.18,1.4+(i%5)*.5,.015,char,cx-w/2+.6+i*.68,h-1.2,cz-d/2+.19);box(.4,.15,.02,water,cx-w/2+.6+i*.68,.6+(i%3)*.1,cz+d/2-.19)}
      print('THE CINDER ARCHIVE','What survived. What was copied. What is missing.',cx,4.65,cz-d/2+.2,0,6.4);
      const lamp=new THREE.PointLight(0xffd5a0,12,19,2);lamp.position.set(cx,3.8,cz);root.add(lamp);
      const sky=new THREE.PointLight(0xc4d6e1,9,20,2);sky.position.set(cx,h-.3,cz-3);root.add(sky);
      // Shelves face inward; snapped boards and fallen bindings remain outside the central path.
      for(const side of [-1,1]){const x=cx+side*5.9;for(const z of [cz-4,cz,cz+4]){box(.75,3.3,2.7,char,x,1.65,z);for(const y of [.18,1.4,2.7]){const shelf=box(1.15,.1,2.9,char,x-side*.4,y,z);shelf.rotation.x=(z===cz&&y===1.4)?.13:0}block(x-side*.15,z,1.7,3)}
        for(let i=0;i<18;i++){const b=box(.13,.65+(i%3)*.09,.5,i%3?char:paper,x-side*.78,.55+(i%3)*1.1,cz-5.1+Math.floor(i/3)*1.8);b.rotation.x=(i%4-2)*.13;b.rotation.z=side*.08}
      }
      for(let i=0;i<12;i++){const b=box(.52,.08,.7,i%2?char:paper,cx+(i%2?1:-1)*(5.1+(i%3)*.3),.08,cz-5+i*.82);b.rotation.y=i*.73}
      // Three readable survivors and three explicitly labelled absences/fragment exhibits.
      exhibits.forEach(([title,status,note,id],i)=>{const x=cx+(i%2?3:-3),z=cz-4+Math.floor(i/2)*3.7;
        box(2.5,.13,1.2,stone,x,1.05,z);for(const dx of [-1,1])box(.14,1,.7,char,x+dx,.5,z);block(x,z,2.65,1.4);
        const card=print(title,status,x,1.55,z+.49,0,2.5);mark(card,{type:'cinder-note',title,author:note,action:'EXAMINE'});
        const book=id&&(findBook(id)||arrivals().find(b=>b.id===id));
        if(book){const tex=own(canvasTexture((c,W,H)=>{c.fillStyle='#4a3425';c.fillRect(0,0,W,H);const g=c.createRadialGradient(W/2,H/2,35,W/2,H/2,W*.65);g.addColorStop(0,'rgba(12,10,8,0)');g.addColorStop(1,'#080706');c.fillStyle=g;c.fillRect(0,0,W,H);c.strokeStyle='#a78b53';c.lineWidth=5;c.strokeRect(30,40,W-60,H-80);c.fillStyle='#e3cf9e';c.textAlign='center';c.font='bold 20px Georgia';title.split(' ').forEach((s,j)=>c.fillText(s,W/2,95+j*27));for(let n=0;n<14;n++){c.fillStyle='#090807';c.fillRect(n%2?0:W-22,n*26,22+(n%3)*8,28)}},256,384));
          const m=box(.9,1.25,.14,own(new THREE.MeshStandardMaterial({map:tex,roughness:1})),x,1.76,z-.2);m.rotation.x=-.12;
          mark(m,{type:'book',book,loaded:true,cinderBinding:true,customBinding:true,home:{position:m.position.clone(),quaternion:m.quaternion.clone(),parent:root}});volumes.push(m);
        }else {for(const dx of [-.35,.35]){const support=box(.2,.12,.8,char,x+dx,1.18,z-.2);support.rotation.z=dx<0?.3:-.3}
          const remnant=box(.85,.035,.7,i===4?ash:char,x,1.16,z-.2);mark(remnant,{type:'cinder-note',title,author:note+(id?' The checked reading copy is still being prepared.':''),action:'EXAMINE'});
          if(i===5){const scroll=new THREE.Mesh(own(new THREE.CylinderGeometry(.18,.18,.85,12)),char);scroll.position.set(x,1.4,z-.2);scroll.rotation.z=Math.PI/2;root.add(scroll);mark(scroll,{type:'cinder-note',title,author:note,action:'EXAMINE'})}
        }
      });
      // Clear central restoration table; debris never intrudes on the route to the exit.
      box(2,.15,1.3,stone,cx,1,cz);block(cx,cz,2.2,1.5);for(const dx of [-.8,.8])box(.16,1,.8,char,cx+dx,.5,cz);
      for(const dx of [-.45,.45]){const sheet=box(.72,.025,.8,paper,cx+dx,1.1,cz);sheet.rotation.y=dx*.2;mark(sheet,{type:'cinder-note',title:'A conservator’s table',author:'The room and its bindings are imagined. The losses and survivals on its labels are documented. A destroyed manuscript and a destroyed work are not always the same thing.',action:'EXAMINE'})}
      const exit=print('THE COLD HEARTH','Back to the Gothic Parlour',cx,1.9,cz+d/2-.2,Math.PI,2.8);exit.material.emissive.setHex(0xb18b4c);exit.material.emissiveIntensity=.7;mark(exit,{type:'cinder-exit',title:'The passage through the hearth',author:'Familiar lamplight waits beyond.',action:'RETURN'});
      lastNeeded=time;
    }
    function contains(x,z){return x>ROOM.cx-ROOM.w/2&&x<ROOM.cx+ROOM.w/2&&z>ROOM.cz-ROOM.d/2&&z<ROOM.cz+ROOM.d/2}
    function allowed(x,z){const r=player.radius||.42;return contains(x,z)&&Math.abs(x-ROOM.cx)<ROOM.w/2-.3-r&&Math.abs(z-ROOM.cz)<ROOM.d/2-.3-r&&!blockers.some(b=>Math.abs(x-b.x)<b.w/2+r&&Math.abs(z-b.z)<b.d/2+r)}
    function enter(){build();lastNeeded=time;move(ROOM.cx,ROOM.cz+ROOM.d/2-1.6,0);playSample?.('doorOpen',.55,.8);showNotice('The Cinder Archive. Read the labels beside the rescued books and empty cradles. The way back is the lit hearth behind you.',9)}
    function leave(){prepareReturn?.();move(entrance.x,entrance.z-1.8,0);playSample?.('doorOpen',.55,.85);showNotice('You emerge from the cold hearth into the Gothic Parlour.',5)}
    function atExit(){return !!root&&contains(player.pos.x,player.pos.z)&&Math.abs(player.pos.x-ROOM.cx)<1.8&&player.pos.z>ROOM.cz+ROOM.d/2-2.7}
    function interact(o){if(o?.userData?.type==='cinder-exit'){leave();return true}if(o?.userData?.type==='cinder-note'){showNotice(o.userData.title+'. '+o.userData.author,14);return true}return false}
    function unload(){if(!root)return;root.traverse(o=>{if(o.isLight)o.userData.freed=true});root.removeFromParent();root=null;for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);for(const o of owned.splice(0))o.dispose?.();ours.length=volumes.length=blockers.length=0}
    function update(t){time=t;if(contains(player.pos.x,player.pos.z))lastNeeded=t;else if(root&&t-lastNeeded>KEEP&&!isHolding()&&!volumes.some(b=>b.parent!==root||b.userData.singleCopyMoved))unload()}
    return {enter,leave,interact,contains,allowed,atExit,update,unload,floorAt:(x,z)=>contains(x,z)?0:null,room:ROOM,get built(){return !!root}};
  };
})();
