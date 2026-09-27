// The Periodicals Room: behind a door beneath the clock on the Grand Hall's south wall. Magazines, journals and
// papers as they first appeared: first numbers, famous issues and a few children's weeklies, face-out on sloping
// racks, each with a librarian's note (data/new-books.js, room 'periodicals'). On the reading slopes in the middle,
// the library's own paper, The After Dark Gazette, is printed fresh each night with tonight's Room of the Day, the
// latest signatures in the visitors' book and the news from around the library.
//
// Like the other rooms behind doors, nothing is built until the reader walks up to it, and it is freed a little
// while after they leave.
(function(){
  'use strict';

  // Library news for the Gazette's back column: three a night, in turn.
  const NOTES=[
    ['ROCKET RETURNS FROM MARS','The projectile landed in the Rocket Hall on time. Its passenger reports canals, two moons and a wireless set that would not stop ticking.'],
    ['PARROT DECLINES TO COMMENT','Poll, of the island beyond the Boathouse, answered our questions only when spoken to, and then only with her own.'],
    ['CAT CONTINUES TO IGNORE READERS','The library cat was seen in three wings last night and acknowledged nobody. Staff describe this as normal.'],
    ['LAMPS LIT AT DUSK','Every lamp in the library was burning by nightfall. No caretaker admits to lighting them.'],
    ['NIGHT TRAIN RUNS TO TIMETABLE','The conductor reports a quiet night between stations and one passenger who read the whole way to the Signal House.'],
    ['BOOK FOUND ON THE WRONG SHELF','A volume of sermons was discovered among the ghost stories. It has been returned, and seemed relieved.'],
    ['EVENING ROOM FIRE KEPT IN','The fire in the Evening Room was still glowing at two in the morning. So, it is understood, were several readers.'],
    ['FOG AT THE CONSULTING ROOM WINDOWS','Baker Street was reported yellow and impenetrable. A hansom waited under the gas lamp for most of the night.'],
    ['NEW ARRIVALS SHELVED','The librarian asks readers to look out for newcomers on the station shelves and in the secret bookcase.'],
    ['A PAGE TURNED AT MIDNIGHT','Readers in the Grand Hall heard a page turn at midnight with nobody near it. Investigations continue.'],
    ['WORD OF THE DAY CHALKED UP','The English Reading Room’s blackboard carries a new word tonight. Readers are invited to use it at least once.'],
    ['SLIDE STILL FASTER THAN RECOMMENDED','Riders of the chute from the Rocket Hall continue to arrive in the western wing at speed. Management notes the handrail.']
  ];

  window.createPeriodicalsRoom=function(options){
    const {THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,arrivals=()=>[],notes={},news=()=>({}),showNotice,playSample,move,analytics,isHolding=()=>false,today=()=>new Date()}=options;
    const DOOR={x:0,z:30.45,yaw:Math.PI};
    const ROOM={cx:-330,cz:100,w:16,d:14,h:5};
    const PRELOAD=7,KEEP=25;
    let root=null,time=0,lastNeeded=-1e9,gazette=null;
    const owned=[],ours=[],books=[],blockers=[];
    const own=thing=>{owned.push(thing);return thing};
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    function lamp(parent,color,intensity,distance,x,y,z){const l=new THREE.PointLight(color,intensity,distance,2);l.position.set(x,y,z);parent.add(l);return l}
    const dayKey=()=>today().toISOString().slice(0,10),dayNumber=()=>Math.floor(Date.parse(dayKey()+'T12:00:00Z')/86400000);
    function plaque(text,sub,w,h,dark='#24170d'){return own(canvasTexture((c,W,H)=>{c.fillStyle=dark;c.fillRect(0,0,W,H);c.strokeStyle='#d7ae60';c.lineWidth=6;c.strokeRect(5,5,W-10,H-10);c.fillStyle='#ffe2a0';c.textAlign='center';c.font='bold 32px Georgia';c.fillText(text,W/2,sub?46:H/2+11);if(sub){c.font='italic 21px Georgia';c.fillText(sub,W/2,80)}},w,h))}

    // ---------- the periodicals ----------
    function periodicals(){return [...new Set(arrivals())].map(id=>findBook(id)).filter(Boolean)}
    // One number is out on the lectern each night, a different one tomorrow.
    function featured(list=periodicals()){return list.length?list[((dayNumber()%list.length)+list.length)%list.length]:null}

    // ---------- The After Dark Gazette ----------
    function gazetteText(){
      const n=news()||{},date=today().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}),k=dayNumber();
      const items=[0,1,2].map(i=>NOTES[((k*3+i)%NOTES.length+NOTES.length)%NOTES.length]);
      return {date,room:n.room||null,visitors:(n.visitors||[]).slice(0,5),weather:n.weather||'',items};
    }
    function drawGazette(c,W,H){
      const g=gazetteText();c.fillStyle='#ece3cc';c.fillRect(0,0,W,H);c.fillStyle='#1d1812';c.textAlign='center';
      c.font='bold 64px Georgia';c.fillText('The After Dark Gazette',W/2,78);c.fillRect(40,96,W-80,3);c.font='italic 20px Georgia';
      c.fillText(`${g.date}  ·  Printed nightly in the Library After Dark  ·  Price: one quiet evening`,W/2,124);c.fillRect(40,136,W-80,1.5);
      const col=(W-100)/3,wrap=(text,x,y,width,size=18,lineH=24,max=12)=>{c.font=`${size}px Georgia`;let line='',rows=0;for(const word of String(text).split(' ')){if(c.measureText(line+word).width>width&&line){c.fillText(line,x,y+rows*lineH);line='';rows++;if(rows>=max)return rows}line+=word+' '}c.fillText(line,x,y+rows*lineH);return rows+1};
      c.textAlign='left';let x=40;
      c.font='bold 26px Georgia';c.fillText('TONIGHT’S ROOM OF THE DAY',x,176);
      if(g.room){c.font='bold italic 24px Georgia';c.fillText(g.room.title,x,212);wrap(g.room.intro,x,244,col-10,18,24,10)}else wrap('The Room of the Day is being dressed. Its door in the Grand Hall will tell you what is inside.',x,212,col-10);
      x+=col+10;c.fillRect(x-8,150,1.5,H-190);
      c.font='bold 26px Georgia';c.fillText('SIGNED IN THE VISITORS’ BOOK',x,176);
      if(g.visitors.length)g.visitors.forEach((v,i)=>{c.font='bold 19px Georgia';c.fillText(`${v.name}, ${v.place}`.slice(0,36),x,214+i*62);c.font='italic 17px Georgia';c.fillText(`“${v.note}”`.slice(0,44),x,238+i*62)});
      else wrap('The book by the entrance is waiting for tonight’s first signature. Readers are invited to sign it on their way in.',x,214,col-10);
      x+=col+10;c.fillRect(x-8,150,1.5,H-190);
      c.font='bold 26px Georgia';c.fillText('AROUND THE LIBRARY',x,176);let y=214;
      for(const [head,body] of g.items){c.font='bold 19px Georgia';c.fillText(head,x,y);y+=26+wrap(body,x,y+26-4,col-10,17,22,5)*22+18}
      c.textAlign='center';c.font='italic 18px Georgia';const sky={CLEAR:'clear and still',RAIN:'rain beyond the glass',STORM:'storm over the roof'}[g.weather];c.fillText(sky?`Weather tonight: ${sky}.  All the news that fits between two lamps.`:'All the news that fits between two lamps.',W/2,H-30);
    }
    function readGazette(){
      const g=gazetteText(),parts=[`The After Dark Gazette, ${g.date}.`];
      if(g.room)parts.push(`Tonight’s Room of the Day: ${g.room.title}. ${g.room.intro}`);
      if(g.visitors.length)parts.push(`Signed in the visitors’ book: ${g.visitors.map(v=>`${v.name} (${v.place})`).join(', ')}.`);
      parts.push(g.items.map(([head,body])=>`${head[0]+head.slice(1).toLowerCase()}: ${body}`).join(' '));
      showNotice(parts.join(' '),16);
    }

    // ---------- the door, beneath the clock ----------
    function buildDoor(){
      const g=new THREE.Group();g.name='periodicals-door';g.position.set(DOOR.x,0,DOOR.z);g.rotation.y=DOOR.yaw;scene.add(g);
      const data={type:'periodicals-door',title:'The Periodicals Room',author:'Magazines, journals and papers, as they first appeared. Tonight’s Gazette is on the slopes.',action:'ENTER'};
      const paint=new THREE.MeshStandardMaterial({color:0x2e3b2a,roughness:.8}),glass=new THREE.MeshStandardMaterial({color:0x8a6a3a,emissive:0xd9923a,emissiveIntensity:.45,roughness:.3});
      mark(add(new THREE.BoxGeometry(1.9,3.1,.14),paint,0,1.55,.08,g),data);
      const pane=add(new THREE.BoxGeometry(1.2,.7,.05),glass,0,2.35,.17,g);mark(pane,data);for(const bx of [-.2,.2])add(new THREE.BoxGeometry(.04,.72,.07),MAT.darkWood,bx,2.35,.18,g);add(new THREE.BoxGeometry(1.22,.04,.07),MAT.darkWood,0,2.35,.18,g);
      for(const px of [-.46,.46])add(new THREE.BoxGeometry(.72,1.2,.04),MAT.darkWood,px,.95,.17,g);
      for(const px of [-1.07,1.07])add(new THREE.BoxGeometry(.22,3.45,.3),MAT.brass,px,1.72,.1,g);add(new THREE.BoxGeometry(2.36,.22,.3),MAT.brass,0,3.44,.1,g);
      mark(add(new THREE.SphereGeometry(.08,10,8),MAT.brass,.68,1.45,.22,g),data);
      const plate=plaque('THE PERIODICALS ROOM','Magazines, journals and papers',640,100);owned.pop();// the door's plaque stays for good
      mark(add(new THREE.PlaneGeometry(2.3,.36),new THREE.MeshStandardMaterial({map:plate,emissive:0xffffff,emissiveMap:plate,emissiveIntensity:.35}),0,3.8,.12,g),data);
      lamp(g,0xffc27a,1.1,5,0,3.9,1.1);
    }

    // ---------- the room ----------
    function buildRoom(){
      root=new THREE.Group();root.name='periodicals-room';const {cx,cz,w,d,h}=ROOM;
      const wall=own(new THREE.MeshStandardMaterial({color:0x33402f,roughness:.9})),paper=own(new THREE.MeshStandardMaterial({color:0xe8dfc6,roughness:.95}));
      box(w,.3,d,MAT.wood,cx,-.15,cz,root);box(w,.25,d,MAT.darkWood,cx,h+.12,cz,root);
      box(w,h,.3,wall,cx,h/2,cz-d/2,root);box(w,h,.3,wall,cx,h/2,cz+d/2,root);box(.3,h,d,wall,cx-w/2,h/2,cz,root);box(.3,h,d,wall,cx+w/2,h/2,cz,root);
      for(const [x,z,sw,sd] of [[cx,cz-d/2+.17,w-.4,.05],[cx,cz+d/2-.17,w-.4,.05],[cx-w/2+.17,cz,.05,d-.4],[cx+w/2-.17,cz,.05,d-.4]]){box(sw,1.05,sd,MAT.darkWood,x,.52,z,root);box(sw,.06,sd+.04,MAT.brass,x,1.07,z,root)}
      const sign=add(own(new THREE.PlaneGeometry(4.6,.72)),own(new THREE.MeshStandardMaterial({map:plaque('THE PERIODICALS ROOM','Magazines, journals and papers, as they first appeared',860,110),roughness:.8,emissive:0x5a3a18,emissiveIntensity:.3})),cx,4.25,cz-d/2+.17,root);
      mark(sign,{type:'periodicals-card',title:'The Periodicals Room',author:'First numbers, famous issues and a few children’s weeklies, each as its first readers held it. One is out on the lectern by the door tonight.',action:'READ'});
      // Magazines face-out on sloping racks: two tiers along the north wall and the west wall.
      const list=periodicals(),spots=[];
      for(let row=0;row<2;row++)for(let i=0;i<6;i++)spots.push({x:cx-5.5+i*2.2,z:cz-d/2+.42,y:row?2.9:1.55,yaw:0});
      for(let row=0;row<2;row++)for(let i=0;i<5;i++)spots.push({x:cx-w/2+.42,z:cz-4.4+i*2.2,y:row?2.9:1.55,yaw:Math.PI/2});
      for(const y of [1.02,2.37]){box(13.4,.05,.36,MAT.darkWood,cx,y,cz-d/2+.36,root);box(.36,.05,10.6,MAT.darkWood,cx-w/2+.36,y,cz,root)}
      block(cx,cz-d/2+.4,14,.8);block(cx-w/2+.4,cz,.8,11);
      const geometry=own(new THREE.BoxGeometry(.78,1.04,.05));
      list.slice(0,spots.length).forEach((book,i)=>placeBook(book,spots[i],geometry));
      // Reading slopes down the middle, with tonight's Gazette open on each.
      const gazetteMap=own(canvasTexture(drawGazette,1280,860));gazette=gazetteMap;
      const gazetteMat=own(new THREE.MeshStandardMaterial({map:gazetteMap,color:0xa99f89,roughness:.95}));
      for(const x of [cx-2.3,cx+2.3]){
        box(1.2,.9,3.4,MAT.darkWood,x,.45,cz-.4,root);block(x,cz-.4,1.4,3.6);
        for(const side of [-1,1]){const slope=box(.62,.05,3.3,MAT.wood,x+side*.3,1.02,cz-.4,root);slope.rotation.z=side*-.32;
          for(const dz of [-.8,.8]){const sheet=add(own(new THREE.PlaneGeometry(.84,.56)),gazetteMat,x+side*.33,1.075,cz-.4+dz,root);sheet.rotation.order='YXZ';sheet.rotation.set(-(Math.PI/2-.32),side*Math.PI/2,0);
            mark(sheet,{type:'periodicals-gazette',title:'The After Dark Gazette',author:'Tonight’s number, still smelling faintly of ink.',action:'READ THE GAZETTE'})}}
      }
      // Newspaper sticks on the east wall: papers hung over wooden poles, as in a club or a coffee house.
      const rackX=cx+w/2-.3;box(.12,2.4,.12,MAT.darkWood,rackX,1.2,cz-3.6,root);box(.12,2.4,.12,MAT.darkWood,rackX,1.2,cz+1.6,root);block(rackX-.2,cz-1,.7,5.6);
      const sheets=[];for(let i=0;i<7;i++){const z=cz-3.2+i*.72;box(.05,.05,.05,MAT.brass,rackX-.12,2.2,z,root);const pole=add(own(new THREE.CylinderGeometry(.025,.025,.95,6)),MAT.darkWood,rackX-.55,2.2,z,root);pole.rotation.z=Math.PI/2;
        const sheet=add(own(new THREE.PlaneGeometry(.66,1.05)),gazetteMat,rackX-.55,1.66,z,root);sheet.rotation.y=-Math.PI/2;sheet.rotation.z=(i%2?.02:-.02);sheets.push(sheet)}
      for(const s of sheets)mark(s,{type:'periodicals-gazette',title:'Papers on their sticks',author:'Tonight’s Gazette, several copies deep.',action:'READ THE GAZETTE'});
      const clockFace=own(canvasTexture((c,W,H)=>{c.fillStyle='#efe6cf';c.beginPath();c.arc(W/2,H/2,W/2-4,0,7);c.fill();c.strokeStyle='#2a1c12';c.lineWidth=6;c.stroke();c.fillStyle='#2a1c12';c.textAlign='center';c.font='bold 22px Georgia';for(let i=1;i<=12;i++){const a=i/12*Math.PI*2;c.fillText(['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'][i-1],W/2+Math.sin(a)*(W/2-28),H/2-Math.cos(a)*(W/2-28)+8)}},256,256));
      const clock=add(own(new THREE.CircleGeometry(.5,28)),own(new THREE.MeshStandardMaterial({map:clockFace,roughness:.8})),rackX+.12,3.6,cz-1,root);clock.rotation.y=-Math.PI/2;
      // The lectern by the door with tonight's featured number.
      const pick=featured(list);
      if(pick){const lx=cx-3.4,lz=cz+d/2-2.4;box(.5,1.05,.4,MAT.darkWood,lx,.52,lz,root);const top=box(.8,.05,.6,MAT.darkWood,lx,1.1,lz,root);top.rotation.x=.3;block(lx,lz,.8,.7);
        const card=plaque('TONIGHT’S NUMBER','',420,70);const label=add(own(new THREE.PlaneGeometry(.8,.14)),own(new THREE.MeshStandardMaterial({map:card,roughness:.8,emissive:0xffffff,emissiveMap:card,emissiveIntensity:.3})),lx,1.34,lz-.2,root);label.rotation.x=-.2;
        const mesh=placeBook(pick,{x:lx,y:1.42,z:lz-.02,yaw:0},geometry);if(mesh){mesh.rotation.x=-1.05;mesh.userData.home.quaternion.copy(mesh.quaternion);mesh.userData.featured=true}}
      // Armchairs and a green-shaded reading lamp.
      const leather=own(new THREE.MeshStandardMaterial({color:0x4a2019,roughness:.75})),shade=own(new THREE.MeshStandardMaterial({color:0x2f6b3a,emissive:0x2c7a3a,emissiveIntensity:.8,roughness:.5}));
      for(const [x,z,yaw] of [[cx+4.4,cz+3.4,-.5],[cx+1.8,cz+4.2,.3]]){const chair=new THREE.Group();chair.position.set(x,0,z);chair.rotation.y=yaw;root.add(chair);box(1.05,.45,1,leather,0,.42,0,chair);box(1.05,.85,.22,leather,0,.98,.42,chair);for(const sx of [-.48,.48])box(.16,.32,1,leather,sx,.78,0,chair);block(x,z,1.3,1.3)}
      box(.5,.05,.5,MAT.darkWood,cx+3.1,.72,cz+4.8,root);box(.08,.7,.08,MAT.darkWood,cx+3.1,.36,cz+4.8,root);box(.08,.4,.08,MAT.brass,cx+3.1,.95,cz+4.8,root);
      add(own(new THREE.CylinderGeometry(.14,.24,.2,14,1,true)),shade,cx+3.1,1.2,cz+4.8,root);block(cx+3.1,cz+4.8,.6,.6);
      lamp(root,0xffe0a8,7,14,cx,h-.4,cz-1);lamp(root,0xd8f0c0,2.5,5,cx+3.1,1.3,cz+4.8);
      // The door back to the Grand Hall.
      const exit={type:'periodicals-exit',title:'Back to the Grand Hall',author:'The clock is on the other side.',action:'RETURN'};
      mark(box(1.9,3.1,.16,MAT.darkWood,cx,1.55,cz+d/2-.2,root),exit);for(const px of [-1.05,1.05])box(.16,3.35,.24,MAT.brass,cx+px,1.68,cz+d/2-.22,root);box(2.3,.16,.24,MAT.brass,cx,3.3,cz+d/2-.22,root);
      scene.add(root);
    }
    function placeBook(book,spot,geometry){
      if(!spot)return null;
      const mesh=add(geometry,own(bookMaterial(book)),spot.x,spot.y,spot.z,root);mesh.rotation.order='YXZ';mesh.rotation.y=spot.yaw;mesh.rotation.x=-.1;
      mesh.userData={type:'book',book,loaded:false,periodical:true,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:root}};
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
      const pick=featured();showNotice(`The Periodicals Room: magazines and papers as they first appeared, and tonight’s Gazette on the slopes.${pick?` On the lectern by the door: ${pick.title}.`:''}`,8);
      analytics?.track('Room Explored',{room:'periodicals-room'});
    }
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('periodicals-'))return false;
      if(data.type==='periodicals-door'){enter();return true}
      if(data.type==='periodicals-exit'){move(DOOR.x+Math.sin(DOOR.yaw)*1.9,DOOR.z+Math.cos(DOOR.yaw)*1.9,DOOR.yaw+Math.PI);playSample?.('doorOpen',.8,1);showNotice('The Grand Hall again, under the clock.',3);return true}
      if(data.type==='periodicals-gazette'){playSample?.('pageTurn',.5,1);readGazette();return true}
      if(data.type==='periodicals-card'){showNotice(`${data.title}: ${data.author}`,7);return true}
      return false;
    }

    // ---------- lifecycle ----------
    function activate(){if(!root)buildRoom();lastNeeded=time}
    function unload(){
      if(!root)return;root.removeFromParent();root=null;gazette=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0;
    }
    function update(t){
      time=t;const inside=contains(player.pos.x,player.pos.z),near=Math.hypot(player.pos.x-DOOR.x,player.pos.z-DOOR.z)<PRELOAD;
      if(inside||near)activate();
      else if(root&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==root))unload();
    }
    buildDoor();
    return {contains,floorAt,allowed,interact,update,enter,unload,featured,gazetteText,door:DOOR,room:ROOM,notes:NOTES,get built(){return !!root},get books(){return books.slice()},zoneAt:(x,z)=>contains(x,z)?'periodicals-room':null};
  };
})();
