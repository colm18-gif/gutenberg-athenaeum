// Loaded only after the cold hearth is discovered. All damage is an original theatrical representation.
(function(){
  'use strict';
  window.buildCinderRoom=function(options){
    const {THREE,scene,MAT,player,interactables,canvasTexture,findBook,arrivals,move,prepareReturn,showNotice,playSample,isHolding=()=>false,isLowBandwidth=()=>false,entrance}=options;
    const ROOM={cx:700,cz:-180,w:16,d:15,h:5.7},KEEP=25;
    let root=null,time=0,lastNeeded=0;const owned=[],ours=[],volumes=[],blockers=[];
    const own=o=>{owned.push(o);return o};
    const material=color=>own(new THREE.MeshStandardMaterial({color,roughness:1}));
    function box(w,h,d,mat,x,y,z,parent=root){const g=own(new THREE.BoxGeometry(w,h,d));
      // Metre-based UVs keep masonry and floor tiles the same size on every face.
      if(mat.userData?.metreUV&&g.getAttribute){const p=g.getAttribute('position'),n=g.getAttribute('normal'),uv=g.getAttribute('uv');for(let i=0;i<p.count;i++){const nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i));uv.setXY(i,nx>.5?p.getZ(i):p.getX(i),ny>.5?p.getZ(i):p.getY(i))}}
      const m=new THREE.Mesh(g,mat);m.position.set(x,y,z);parent.add(m);return m}
    // Locally hosted CC0 Poly Haven maps. A late response must not revive an unloaded room.
    function photoMaterial(name,color,tile=2.4){
      const mat=material(color);mat.userData={metreUV:true};
      if(!THREE.TextureLoader||isLowBandwidth())return mat;
      const generation=root,loader=new THREE.TextureLoader();
      for(const [file,slot] of [['diffuse','map'],['normal','normalMap']])loader.load(`assets/polyhaven/materials/${name}/${file}.jpg`,tex=>{
        if(root!==generation){tex.dispose();return}own(tex);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(1/tile,1/tile);
        if(slot==='map')tex.colorSpace=THREE.SRGBColorSpace;mat[slot]=tex;if(slot==='normalMap')mat.normalScale?.set(.5,.5);mat.needsUpdate=true;
      },undefined,()=>{});
      return mat;
    }
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
      const char=photoMaterial('smoked_walnut_veneer',0x302a25,1.8),stone=photoMaterial('sandstone_blocks_08',0x939084),paper=material(0xc5b18c),ash=material(0x514e48),water=material(0x43484a);
      const brass=own(new THREE.MeshStandardMaterial({color:0x9d7845,metalness:.65,roughness:.55})),velvet=material(0x384846);
      const glow=own(new THREE.MeshStandardMaterial({color:0xffddac,emissive:0xffbf70,emissiveIntensity:1.2,roughness:.6}));
      const floorTex=own(canvasTexture((c,W,H)=>{c.fillStyle='#302f2b';c.fillRect(0,0,W,H);for(let j=0;j<4;j++)for(let i=0;i<4;i++){c.fillStyle=['#69685f','#77746a','#615f58','#858074'][(i+j*3)%4];c.fillRect(i*W/4+2,j*H/4+2,W/4-4,H/4-4);c.strokeStyle='#34332f';c.lineWidth=1;c.beginPath();c.moveTo(i*W/4+12,j*H/4+14);c.lineTo(i*W/4+26,j*H/4+39);c.lineTo(i*W/4+19,j*H/4+48);c.stroke()}},512,512));
      floorTex.wrapS=floorTex.wrapT=THREE.RepeatWrapping;floorTex.repeat?.set(.25,.25);
      const floor=own(new THREE.MeshStandardMaterial({map:floorTex,color:0x98958b,roughness:.95}));floor.userData={metreUV:true};
      box(w,.3,d,floor,cx,-.16,cz);
      // A quiet brass inlay leads along the open aisle; nothing stands in its centre.
      for(const dx of [-1.45,1.45])box(.025,.012,9.8,brass,cx+dx,.005,cz+.1);
      for(const z of [cz-d/2,cz+d/2])box(w,h,.35,stone,cx,h/2,z);
      for(const x of [cx-w/2,cx+w/2])box(.35,h,d,stone,x,h/2,cz);
      // Scarred masonry piers and shallow vault ribs frame the original room shell.
      for(const z of [cz-5.9,cz+4.8]){
        for(const side of [-1,1]){box(.45,3.7,.55,stone,cx+side*7.55,1.85,z);box(.65,.18,.75,brass,cx+side*7.55,3.45,z)}
        for(let i=0;i<18;i++){const a=i*Math.PI/18,b=(i+1)*Math.PI/18,x1=7.55*Math.cos(a),x2=7.55*Math.cos(b),y1=3.6+1.8*Math.sin(a),y2=3.6+1.8*Math.sin(b);const rib=box(Math.hypot(x2-x1,y2-y1)+.03,.2,.38,stone,cx+(x1+x2)/2,(y1+y2)/2,z);rib.rotation.z=Math.atan2(y2-y1,x2-x1)}
      }
      // A broken ceiling leaves a pale light well above the open aisle.
      for(const dx of [-5.5,5.5])box(5,h*.035,d,char,cx+dx,h,cz);
      for(const dz of [-5.5,5.5])box(6,.2,4,char,cx,h,cz+dz);
      for(let i=0;i<8;i++){const beam=box(.17,.23,5.8,char,cx-6+i*1.7,h-.2,cz-3);beam.rotation.z=(i%3-1)*.08}
      // Soft, irregular smoke staining rather than solid rectangular strips on the wall.
      const soot=own(canvasTexture((c,W,H)=>{
        const wash=c.createLinearGradient(0,0,0,H);wash.addColorStop(0,'rgba(9,8,7,.94)');wash.addColorStop(.42,'rgba(16,13,10,.52)');wash.addColorStop(1,'rgba(16,13,10,0)');c.fillStyle=wash;c.fillRect(0,0,W,H);
        for(let i=0;i<45;i++){const x=(i*.618%1)*W,y=H*(.08+(i*.377%1)*.45),r=35+(i%5)*19;const plume=c.createRadialGradient(x,y,0,x,y,r);plume.addColorStop(0,'rgba(8,7,6,.25)');plume.addColorStop(1,'rgba(8,7,6,0)');c.fillStyle=plume;c.fillRect(x-r,y-r,r*2,r*2)}
      },1024,512));
      const smoke=own(new THREE.MeshStandardMaterial({map:soot,transparent:true,depthWrite:false,roughness:1}));
      for(const side of [-1,1]){const stain=new THREE.Mesh(own(new THREE.PlaneGeometry(w-.4,h)),smoke);stain.position.set(cx,h/2,cz+side*(d/2-.19));stain.rotation.y=side<0?0:Math.PI;root.add(stain)}
      for(let i=0;i<22;i++)box(.4,.15,.02,water,cx-w/2+.6+i*.68,.6+(i%3)*.1,cz+d/2-.19);
      print('THE CINDER ARCHIVE','What survived. What was copied. What is missing.',cx,4.65,cz-d/2+.2,0,6.4);
      const lamp=new THREE.PointLight(0xffd5a0,19,22,2);lamp.position.set(cx,3.8,cz);root.add(lamp);
      const sky=new THREE.PointLight(0xc4d6e1,14,22,2);sky.position.set(cx,h-.3,cz-3);root.add(sky);
      // Shelves face inward; snapped boards and fallen bindings remain outside the central path.
      for(const side of [-1,1]){const x=cx+side*5.9;for(const z of [cz-4,cz,cz+4]){box(.13,3.3,2.7,char,x+side*.3,1.65,z);for(const dz of [-1.35,1.35])box(1.05,3.3,.12,char,x-side*.2,1.65,z+dz);for(const y of [.18,1.4,2.7]){const shelf=box(1.15,.1,2.9,char,x-side*.4,y,z);shelf.rotation.x=(z===cz&&y===1.4)?.13:0}block(x-side*.15,z,1.7,3)}
        for(let i=0;i<18;i++){const b=box(.13,.65+(i%3)*.09,.5,i%3?char:paper,x-side*.78,.55+(i%3)*1.1,cz-5.1+Math.floor(i/3)*1.8);b.rotation.x=(i%4-2)*.13;b.rotation.z=side*.08}
      }
      for(let i=0;i<12;i++){const b=box(.52,.08,.7,i%2?char:paper,cx+(i%2?1:-1)*(5.1+(i%3)*.3),.08,cz-5+i*.82);b.rotation.y=i*.73}
      // Three readable survivors and three explicitly labelled absences/fragment exhibits.
      exhibits.forEach(([title,status,note,id],i)=>{const x=cx+(i%2?3.5:-3.5),z=cz-3.8+Math.floor(i/2)*3.7;
        box(2.5,.13,1.2,char,x,1.05,z);box(2.3,.035,1.03,velvet,x,1.135,z);box(2.52,.04,.04,brass,x,1.1,z+.6);
        // Low brass display lamps sit on the outer edge, clear of books and sight lines.
        const lx=x+(i%2?1.05:-1.05);box(.25,.06,.25,brass,lx,1.16,z);box(.035,.55,.035,brass,lx,1.45,z);box(.38,.08,.24,brass,lx,1.75,z);box(.3,.025,.18,glow,lx,1.7,z);for(const dx of [-1,1])box(.14,1,.7,char,x+dx,.5,z);block(x,z,2.65,1.4);
        const card=print(title,status,x,.83,z+.62,0,2.5);mark(card,{type:'cinder-note',title,author:note,action:'EXAMINE'});
        const book=id&&(findBook(id)||arrivals().find(b=>b.id===id));
        if(book){const tex=own(canvasTexture((c,W,H)=>{c.fillStyle='#4a3425';c.fillRect(0,0,W,H);const g=c.createRadialGradient(W/2,H/2,35,W/2,H/2,W*.65);g.addColorStop(0,'rgba(12,10,8,0)');g.addColorStop(1,'#080706');c.fillStyle=g;c.fillRect(0,0,W,H);c.strokeStyle='#a78b53';c.lineWidth=5;c.strokeRect(30,40,W-60,H-80);c.fillStyle='#e3cf9e';c.textAlign='center';c.font='bold 20px Georgia';title.split(' ').forEach((s,j)=>c.fillText(s,W/2,95+j*27));for(let n=0;n<14;n++){c.fillStyle='#090807';c.fillRect(n%2?0:W-22,n*26,22+(n%3)*8,28)}},256,384));
          const m=box(.9,1.25,.14,own(new THREE.MeshStandardMaterial({map:tex,roughness:1})),x,1.76,z-.2);m.rotation.x=-.12;
          mark(m,{type:'book',book,loaded:true,cinderBinding:true,customBinding:true,home:{position:m.position.clone(),quaternion:m.quaternion.clone(),parent:root}});volumes.push(m);
        }else {for(const dx of [-.35,.35]){const support=box(.2,.12,.8,char,x+dx,1.18,z-.2);support.rotation.z=dx<0?.3:-.3}
          const remnant=box(.85,.035,.7,i===4?ash:char,x,1.16,z-.2);mark(remnant,{type:'cinder-note',title,author:note+(id?' The checked reading copy is still being prepared.':''),action:'EXAMINE'});
          if(i===5){const scroll=new THREE.Mesh(own(new THREE.CylinderGeometry(.18,.18,.85,12)),char);scroll.position.set(x,1.4,z-.2);scroll.rotation.z=Math.PI/2;root.add(scroll);mark(scroll,{type:'cinder-note',title,author:note,action:'EXAMINE'})}
        }
      });
      // The workbench belongs at the far wall, never between the two exhibit rows.
      const workZ=cz-6.25;
      box(2.6,.15,1.1,char,cx,1,workZ);block(cx,workZ,2.7,1.2);for(const dx of [-1,1])box(.16,1,.8,char,cx+dx,.5,workZ);
      print('THE WORK OF SAVING','A conservator’s table',cx,2.15,workZ-.3,0,2.8);
      for(const dx of [-.45,.45]){const sheet=box(.72,.025,.8,paper,cx+dx,1.1,workZ);sheet.rotation.y=dx*.2;mark(sheet,{type:'cinder-note',title:'A conservator’s table',author:'The room and its bindings are imagined. The losses and survivals on its labels are documented. A destroyed manuscript and a destroyed work are not always the same thing.',action:'EXAMINE'})}
      const exit=print('THE COLD HEARTH','Back to the Gothic Parlour',cx,1.9,cz+d/2-.2,Math.PI,2.8);exit.material.emissive.setHex(0xb18b4c);exit.material.emissiveIntensity=.7;mark(exit,{type:'cinder-exit',title:'The passage through the hearth',author:'Familiar lamplight waits beyond.',action:'RETURN'});
      // A short soot-blackened passage leads out into the archive.
      for(const side of [-1,1]){box(.18,3,1.4,char,cx+side*1.35,1.5,cz+d/2-.85);block(cx+side*1.35,cz+d/2-.85,.18,1.4)}
      for(let i=0;i<7;i++){const scrap=box(.12,.012,.18,paper,cx+(i%3-1)*.36,.015,cz+d/2-1-i*.36);scrap.rotation.y=i*.9}
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
