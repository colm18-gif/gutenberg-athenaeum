// The Evening Room: a fireside parlour off the east wing where every book can be finished in one sitting.
// Short stories, novellas, long poems and pamphlets, from five minutes of Peter Rabbit to a long evening with
// Tristan and Iseult, each with a librarian's note (data/librarian-notes.json) and a card giving its reading time.
//
// Reading times are measured from each book's own text (the word counts in data/learner-levels.js) at an
// unhurried 250 words a minute. Like the other rooms behind doors, nothing is built until the reader walks up
// to it, and it is freed a little while after they leave.
(function(){
  'use strict';

  // Three groups, shortest first. All of these books are held in the library itself, so they open offline too.
  const GROUPS=[
    {name:'A QUICK READ',sub:'Under twenty minutes',ids:[14838,1064,1080,151,23218,11757,67071]},
    {name:'AN HOUR OR SO',sub:'Twenty minutes to an hour',ids:[13,1934,2002,1952,932,14522,41]},
    {name:'AN EVENING',sub:'One to two hours, by the fire',ids:[921,29220,10897,208,389,147,5200,62779,213,43,14244]}
  ];
  // Titles and authors, so a book the library's main shelves do not list can still be brought in.
  const RECORDS={14838:['The Tale of Peter Rabbit','Beatrix Potter'],1064:['The Masque of the Red Death','Edgar Allan Poe'],1080:['A Modest Proposal','Jonathan Swift'],
    151:['The Rime of the Ancient Mariner','Samuel Taylor Coleridge'],23218:['The Red Room','H. G. Wells'],11757:['The Velveteen Rabbit','Margery Williams'],67071:['The Star','H. G. Wells'],
    13:['The Hunting of the Snark','Lewis Carroll'],1934:['Songs of Innocence and of Experience','William Blake'],2002:['Sonnets from the Portuguese','Elizabeth Barrett Browning'],
    1952:['The Yellow Wallpaper','Charlotte Perkins Gilman'],932:['The Fall of the House of Usher','Edgar Allan Poe'],14522:['The Canterville Ghost','Oscar Wilde'],41:['The Legend of Sleepy Hollow','Washington Irving'],
    921:['De Profundis','Oscar Wilde'],29220:['Monday or Tuesday','Virginia Woolf'],10897:['The Wendigo','Algernon Blackwood'],208:['Daisy Miller','Henry James'],389:['The Great God Pan','Arthur Machen'],
    147:['Common Sense','Thomas Paine'],5200:['Metamorphosis','Franz Kafka'],62779:['The Moon Hoax','Richard Adams Locke'],213:['The Man from Snowy River','A. B. Paterson'],
    43:['Strange Case of Dr Jekyll and Mr Hyde','Robert Louis Stevenson'],14244:['The Romance of Tristan and Iseult','Joseph Bédier']};
  const WPM=250;

  function readingTime(words){
    const m=Math.max(1,Math.round(words/WPM));if(m<15)return `${m} min`;
    const r=Math.round(m/5)*5;if(r<60)return `${r} min`;const h=Math.floor(r/60),rest=r%60;return rest?`${h} hr ${rest} min`:`${h} hr`;
  }

  window.createEveningRoom=function(options){
    const {THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,levels={},showNotice,playSample,move,analytics,isHolding=()=>false}=options;
    const DOOR={x:21.8,z:9.45,yaw:Math.PI};
    const ROOM={cx:-330,cz:20,w:14,d:12,h:4.6};
    const PRELOAD=7,KEEP=25;
    let root=null,time=0,lastNeeded=-1e9,fire=null;
    const owned=[],ours=[],books=[],blockers=[];
    const own=thing=>{owned.push(thing);return thing};
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    function lamp(parent,color,intensity,distance,x,y,z){const l=new THREE.PointLight(color,intensity,distance,2);l.position.set(x,y,z);parent.add(l);return l}
    function sign(parent,text,sub,w,h,x,y,z){
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle='#24170d';c.fillRect(0,0,W,H);c.strokeStyle='#d7ae60';c.lineWidth=6;c.strokeRect(5,5,W-10,H-10);c.fillStyle='#ffe2a0';c.textAlign='center';c.font='bold 30px Georgia';c.fillText(text,W/2,sub?46:H/2+12);if(sub){c.font='italic 22px Georgia';c.fillText(sub,W/2,80)}},560,sub?100:72));
      return add(own(new THREE.PlaneGeometry(w,h)),own(new THREE.MeshStandardMaterial({map,emissive:0x6b461e,emissiveIntensity:.3,roughness:.85})),x,y,z,parent);
    }

    // The books, with their measured reading times. A book the library does not hold is simply left out.
    function catalogue(){
      return GROUPS.map(group=>({...group,books:group.ids.map(id=>{const [title,author]=RECORDS[id]||[],book=findBook(id,{id,title,author}),words=levels[id]?.[2];return book&&words?{book,words,time:readingTime(words)}:null}).filter(Boolean)}));
    }

    // ---------- the door, off the east wing ----------
    function buildDoor(){
      const g=new THREE.Group();g.name='evening-door';g.position.set(DOOR.x,0,DOOR.z);g.rotation.y=DOOR.yaw;scene.add(g);
      const data={type:'evening-door',title:'The Evening Room',author:'A fireside room of books you can finish in one sitting.',action:'ENTER'};
      const paint=new THREE.MeshStandardMaterial({color:0x5a2a2a,roughness:.8}),glass=new THREE.MeshStandardMaterial({color:0xf3d9a8,emissive:0xff9a4a,emissiveIntensity:.7,roughness:.4});
      mark(add(new THREE.BoxGeometry(1.9,3.1,.14),paint,0,1.55,.08,g),data);
      for(const px of [-.46,.46])add(new THREE.BoxGeometry(.72,1.2,.04),MAT.darkWood,px,.95,.17,g);
      const fan=add(new THREE.CylinderGeometry(.62,.62,.05,20,1,false,-Math.PI/2,Math.PI),glass,0,2.3,.18,g);fan.rotation.x=-Math.PI/2;/* the upper half: a fanlight */mark(fan,data);
      for(const px of [-1.07,1.07])add(new THREE.BoxGeometry(.22,3.45,.3),MAT.brass,px,1.72,.1,g);add(new THREE.BoxGeometry(2.36,.22,.3),MAT.brass,0,3.44,.1,g);
      mark(add(new THREE.SphereGeometry(.08,10,8),MAT.brass,.68,1.45,.22,g),data);
      const plate=canvasTexture((c,W,H)=>{c.fillStyle='#2a1512';c.fillRect(0,0,W,H);c.strokeStyle='#d7ae60';c.lineWidth=6;c.strokeRect(5,5,W-10,H-10);c.textAlign='center';c.fillStyle='#ffe2a0';c.font='bold 32px Georgia';c.fillText('THE EVENING ROOM',W/2,46);c.font='italic 21px Georgia';c.fillText('Every book here can be read in one sitting',W/2,80)},600,100);
      mark(add(new THREE.PlaneGeometry(2.1,.35),new THREE.MeshStandardMaterial({map:plate,emissive:0x6b461e,emissiveIntensity:.35}),0,3.78,.12,g),data);
      lamp(g,0xffb46a,1.2,5,0,3.9,1.1);
    }

    // ---------- the room ----------
    function buildRoom(){
      root=new THREE.Group();root.name='evening-room';const {cx,cz,w,d,h}=ROOM;
      const wall=own(new THREE.MeshStandardMaterial({color:0x4a2e25,roughness:.9})),stone=own(new THREE.MeshStandardMaterial({color:0x4a423b,roughness:1}));
      box(w,.3,d,MAT.wood,cx,-.15,cz,root);box(w,.25,d,MAT.darkWood,cx,h+.12,cz,root);
      box(w,h,.3,wall,cx,h/2,cz-d/2,root);box(w,h,.3,wall,cx,h/2,cz+d/2,root);box(.3,h,d,wall,cx-w/2,h/2,cz,root);box(.3,h,d,wall,cx+w/2,h/2,cz,root);
      for(const [x,z,sw,sd] of [[cx,cz-d/2+.17,w-.4,.05],[cx,cz+d/2-.17,w-.4,.05],[cx-w/2+.17,cz,.05,d-.4],[cx+w/2-.17,cz,.05,d-.4]]){box(sw,1.05,sd,MAT.darkWood,x,.52,z,root);box(sw,.06,sd+.04,MAT.brass,x,1.07,z,root)}
      // The fireplace in the middle of the far wall, with a real glow.
      const fz=cz-d/2+.45;box(3.2,2.4,.7,stone,cx,1.2,fz,root);box(3.6,.18,.9,MAT.darkWood,cx,2.45,fz+.05,root);
      const opening=own(new THREE.MeshBasicMaterial({color:0x160c08}));add(own(new THREE.PlaneGeometry(1.7,1.3)),opening,cx,.75,fz+.356,root);box(2.2,.08,.5,stone,cx,.04,fz+.6,root);
      const flameMaterial=own(new THREE.MeshBasicMaterial({color:0xff8a36})),coreMaterial=own(new THREE.MeshBasicMaterial({color:0xffd27a}));
      const flames=[];for(const [dx,s,m] of [[-.3,.8,flameMaterial],[0,1,flameMaterial],[.3,.75,flameMaterial],[0,.55,coreMaterial]]){const f=add(own(new THREE.ConeGeometry(.16*s,.6*s,7)),m,cx+dx,.38+.3*s,fz+.55,root);flames.push({mesh:f,phase:Math.random()*6})}
      for(const a of [-.35,.35]){const log=add(own(new THREE.CylinderGeometry(.07,.07,1.2,7)),MAT.darkWood,cx,.15,fz+.55,root);log.rotation.set(0,a,Math.PI/2)}
      fire={flames,light:lamp(root,0xff8a3a,6,10,cx,1,fz+1.5)};block(cx,fz+.2,3.8,1.4);
      const card=own(canvasTexture((c,W,H)=>{c.fillStyle='#f1e6c8';c.fillRect(0,0,W,H);c.fillStyle='#3a2a1d';c.textAlign='center';c.font='bold 30px Georgia';c.fillText('Every book in this room',W/2,52);c.fillText('can be read in one sitting.',W/2,92);c.font='italic 22px Georgia';c.fillText('Times are for an unhurried reader, about 250 words a minute.',W/2,140)},720,170));
      const mantelCard=add(own(new THREE.PlaneGeometry(1.2,.28)),own(new THREE.MeshStandardMaterial({map:card,color:0xa89f8a,roughness:1})),cx,2.72,fz+.32,root);
      mark(mantelCard,{type:'evening-card',title:'A card on the mantelpiece',author:'Every book in this room can be read in one sitting. Times are for an unhurried reader, about 250 words a minute.',action:'READ'});
      // A rug, three armchairs round the fire and a side table.
      const rugMap=own(canvasTexture((c,W,H)=>{c.fillStyle='#5b2320';c.fillRect(0,0,W,H);c.strokeStyle='#c9a15a';c.lineWidth=10;c.strokeRect(20,20,W-40,H-40);c.lineWidth=3;c.strokeRect(40,40,W-80,H-80)},512,340));
      const rug=add(own(new THREE.PlaneGeometry(6,4)),own(new THREE.MeshStandardMaterial({map:rugMap,roughness:1})),cx,.012,cz-.5,root);rug.rotation.x=-Math.PI/2;
      const fabric=own(new THREE.MeshStandardMaterial({color:0x6d2b24,roughness:.9}));
      for(const [x,z,yaw] of [[cx-2.2,cz-.8,.6],[cx+2.2,cz-.8,-.6],[cx,cz+1.2,0]]){
        const chair=new THREE.Group();chair.position.set(x,0,z);chair.rotation.y=yaw;root.add(chair);
        box(1.1,.45,1,fabric,0,.42,0,chair);box(1.1,.9,.22,fabric,0,1,.42,chair);for(const sx of [-.5,.5])box(.16,.35,1,fabric,sx,.78,0,chair);block(x,z,1.3,1.3);
      }
      box(.6,.06,.6,MAT.darkWood,cx+3.3,.72,cz+.6,root);box(.1,.7,.1,MAT.darkWood,cx+3.3,.36,cz+.6,root);block(cx+3.3,cz+.6,.7,.7);
      // Books face-out on ledges, in three groups: west wall, east wall, and either side of the fireplace.
      const groups=catalogue(),geometry=own(new THREE.BoxGeometry(.72,.96,.13));
      const wallSpots=(side,count)=>{const out=[],x=side<0?cx-w/2+.3:cx+w/2-.3,yaw=side<0?Math.PI/2:-Math.PI/2;for(let i=0;i<count;i++){const row=i<4?0:1,col=i%4;out.push({x,z:cz-3.3+col*2.2,y:row?2.75:1.45,yaw})}return out};
      const northSpots=count=>{const out=[];for(let i=0;i<count;i++){const half=i%2,k=Math.floor(i/2),row=k<3?0:1,col=k%3;out.push({x:(half?cx+2.35:cx-2.35)+(half?1:-1)*col*1.2,z:cz-d/2+.3,y:row?2.9:1.55,yaw:0})}return out};
      const spots=[wallSpots(-1,groups[0].books.length),wallSpots(1,groups[1].books.length),northSpots(groups[2].books.length)];
      groups.forEach((group,g)=>{
        group.books.forEach((entry,i)=>placeBook(entry,spots[g][i],geometry));
        // Ledges under each row, and the group's sign above.
        if(g<2){const s=spots[g][0];for(const y of [1.45,2.75])box(.34,.05,8.2,MAT.darkWood,s.x,y-.5,cz,root);const label=sign(root,group.name,group.sub,2.9,.5,s.x+(g?-.08:.08),3.95,cz);label.rotation.y=s.yaw;mark(label,{type:'evening-card',title:group.name[0]+group.name.slice(1).toLowerCase(),author:group.sub+'.',action:'READ'});block(s.x,cz,.7,8.6)}
        else{for(const side of [-1,1])for(const y of [1.55,2.9]){box(3.6,.05,.34,MAT.darkWood,cx+side*3.55,y-.5,cz-d/2+.34,root)}const label=sign(root,group.name,group.sub,3,.5,cx,3.75,cz-d/2+.2);mark(label,{type:'evening-card',title:'An evening',author:group.sub+'.',action:'READ'});block(cx-3.55,cz-d/2+.4,3.7,.6);block(cx+3.55,cz-d/2+.4,3.7,.6)}
      });
      // Lamps: one standard lamp in a corner and the fire.
      const shade=own(new THREE.MeshStandardMaterial({color:0xf2d6a0,emissive:0xffb35c,emissiveIntensity:1.1,roughness:.7}));
      box(.36,.06,.36,MAT.brass,cx+3.3,.03,cz+3.4,root);add(own(new THREE.CylinderGeometry(.03,.03,1.7,8)),MAT.brass,cx+3.3,.88,cz+3.4,root);add(own(new THREE.CylinderGeometry(.2,.32,.38,14,1,true)),shade,cx+3.3,1.86,cz+3.4,root);lamp(root,0xffc27a,6,10,cx+3.3,1.7,cz+3.1);block(cx+3.3,cz+3.4,.6,.6);
      lamp(root,0xffd49a,6,12,cx,h-.4,cz+1.5);
      // The door back to the east wing.
      const exit={type:'evening-exit',title:'Back to the east wing',author:'The lamplit library is just the other side.',action:'RETURN'};
      mark(box(1.9,3.1,.16,MAT.darkWood,cx,1.55,cz+d/2-.2,root),exit);for(const px of [-1.05,1.05])box(.16,3.35,.24,MAT.brass,cx+px,1.68,cz+d/2-.22,root);box(2.3,.16,.24,MAT.brass,cx,3.3,cz+d/2-.22,root);
      scene.add(root);
    }
    function placeBook(entry,spot,geometry){
      if(!spot)return null;
      const mesh=add(geometry,own(bookMaterial(entry.book)),spot.x,spot.y,spot.z,root);mesh.rotation.order='YXZ';mesh.rotation.y=spot.yaw;mesh.rotation.x=-.08;
      mesh.userData={type:'book',book:entry.book,loaded:false,evening:true,readingTime:entry.time,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:root}};
      interactables.push(mesh);ours.push(mesh);books.push(mesh);
      // A small card on the ledge in front of the book with its reading time.
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle='#f1e6c8';c.fillRect(0,0,W,H);c.fillStyle='#3a2a1d';c.textAlign='center';c.font='bold 30px Georgia';c.fillText(entry.time,W/2,42)},200,60));
      const tag=add(own(new THREE.PlaneGeometry(.5,.15)),own(new THREE.MeshStandardMaterial({map,roughness:.9})),0,0,0,root);
      tag.position.set(spot.x+Math.sin(spot.yaw)*.12,spot.y-.62,spot.z+Math.cos(spot.yaw)*.12);tag.rotation.set(0,spot.yaw,0,'YXZ');
      return mesh;
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
      showNotice('The Evening Room. A fire, three chairs, and books you can finish before it burns down: from five minutes to a long evening.',8);
      analytics?.track('Room Explored',{room:'evening-room'});
    }
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('evening-'))return false;
      if(data.type==='evening-door'){enter();return true}
      if(data.type==='evening-exit'){move(DOOR.x+Math.sin(DOOR.yaw)*1.9,DOOR.z+Math.cos(DOOR.yaw)*1.9,DOOR.yaw+Math.PI);playSample?.('doorOpen',.8,1);showNotice('The east wing again.',3);return true}
      if(data.type==='evening-card'){showNotice(`${data.title}: ${data.author}`,6);return true}
      return false;
    }

    // ---------- lifecycle ----------
    function activate(){if(!root)buildRoom();lastNeeded=time}
    function unload(){
      if(!root)return;root.removeFromParent();root=null;fire=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0;
    }
    function update(t,dt=0,reduced=false){
      time=t;const inside=contains(player.pos.x,player.pos.z),near=Math.hypot(player.pos.x-DOOR.x,player.pos.z-DOOR.z)<PRELOAD;
      if(inside||near)activate();
      else if(root&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==root))unload();
      if(fire&&inside&&!reduced){for(const f of fire.flames)f.mesh.scale.y=1+Math.sin(t*9+f.phase)*.14+Math.sin(t*15+f.phase)*.06;fire.light.intensity=6+Math.sin(t*7)*.8+Math.sin(t*13.7)*.4}
    }
    buildDoor();
    return {contains,floorAt,allowed,interact,update,enter,unload,catalogue,readingTime,door:DOOR,room:ROOM,groups:GROUPS,records:RECORDS,get built(){return !!root},get books(){return books.slice()},zoneAt:(x,z)=>contains(x,z)?'evening-room':null};
  };
})();
