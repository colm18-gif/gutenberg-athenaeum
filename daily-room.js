// The Room of the Day: a door on the west wall of the Grand Hall opens onto one reusable room, dressed each
// day with ten books from data/daily-rooms.js. Only one day's room exists at a time: it is built when the
// reader comes near the door, freed a while after they leave, and re-dressed (old books and textures
// disposed) when the day changes or the reader leafs back through the day book to an earlier room.
(function(){
  'use strict';

  window.createDailyRoom=function(options){
    const {THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,registerBook,showNotice,playSample,sound,move,analytics,now=()=>new Date()}=options;
    const schedule=window.ATHENAEUM_DAILY_ROOMS;if(!schedule?.days?.length)return null;
    const room={cx:-240,cz:110,w:14,d:14,h:5.2},door={x:-18.72,z:-14.5,yaw:Math.PI/2};
    const KEEP_WARM_SECONDS=25,PRELOAD_DISTANCE=9,DAY_MS=86400000,ARCHIVE=Math.max(1,schedule.archiveDays||14);
    const PALETTES={
      'mood':{wall:0x2d3446,rug:'#28324a',ink:'#dfe6f2',accent:'#9fb3d6',light:0xbcd0ff},
      'journeys':{wall:0x23413f,rug:'#1f3a38',ink:'#f1e6c8',accent:'#d9c28a',light:0xffe2b0},
      'curiosities':{wall:0x4a2f45,rug:'#3d2539',ink:'#f3e1c6',accent:'#e6c7a0',light:0xffd0e8},
      'seasons':{wall:0x4a3322,rug:'#4a2c18',ink:'#f6e3c0',accent:'#e7b870',light:0xffc070},
      'on-this-day':{wall:0x3a2a1d,rug:'#3b2616',ink:'#f2e2bb',accent:'#e5c98f',light:0xffd49a},
      'short-reads':{wall:0x3d4a2c,rug:'#34401f',ink:'#f1ecd0',accent:'#e8dcae',light:0xfff0c0},
      'deep-dive':{wall:0x2b2f3a,rug:'#23283a',ink:'#ebe3cf',accent:'#d8b26a',light:0xffdca0},
      'firsts':{wall:0x4b2324,rug:'#3f1a1c',ink:'#f5e3c2',accent:'#f0d49a',light:0xffc890}
    };
    let root=null,active=false,lastNeeded=0,time=0,dressing=null,dressedKey=null,shownOffset=0,todayKey=dateKey(now()),nextDayCheck=0,doorParts=null;
    const disposables=[],dayBooks=[],blockers=[];

    // ---------- dates ----------
    function dateKey(date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}
    function utc(key){const [y,m,d]=key.split('-').map(Number);return Date.UTC(y,m-1,d)}
    function addDays(key,n){return new Date(utc(key)+n*DAY_MS).toISOString().slice(0,10)}
    function dayIndex(key){return Math.round((utc(key)-utc(schedule.start))/DAY_MS)}
    function entryFor(key){const i=dayIndex(key);if(i<0)return null;const L=schedule.days.length;return {entry:schedule.days[i%L],looped:i>=L,key}}
    function niceDate(key){return new Date(utc(key)).toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',timeZone:'UTC'})}
    function shortDate(key){return new Date(utc(key)).toLocaleDateString('en-GB',{day:'numeric',month:'long',timeZone:'UTC'})}
    // The oldest day the day book reaches: two weeks back, never before the first room.
    function oldestOffset(){return Math.max(0,Math.min(ARCHIVE-1,dayIndex(todayKey)))}
    function labelFor(found){const kind=schedule.kinds[found.entry.kind]||{};return found.looped&&found.entry.kind==='on-this-day'?'AN ANNIVERSARY':(kind.label||found.entry.kind.toUpperCase())}
    // Checked lists from the nightly job take precedence; before it has run, books with known ids are shown.
    function booksFor(entry){
      const resolved=window.ATHENAEUM_DAILY_RESOLVED?.days?.[entry.date]?.books;
      const list=(resolved?.length?resolved:entry.books.filter(book=>book[0]).map(([id,title,author])=>({id,title,author}))).slice(0,10);
      const featuredTitle=entry.books[entry.featured||0]?.[1],featured=Math.max(0,list.findIndex(book=>book.title===featuredTitle));
      return {list,featured};
    }

    // ---------- small builders ----------
    const add=(geometry,material,x,y,z,parent)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=m.receiveShadow=false;parent.add(m);return m};
    const box=(w,h,d,material,x,y,z,parent)=>add(new THREE.BoxGeometry(w,h,d),material,x,y,z,parent);
    const mark=(object,data)=>{object.userData=data;interactables.push(object);return object};
    function light(parent,color,intensity,distance,x,y,z){const l=new THREE.PointLight(color,intensity,distance,2);l.position.set(x,y,z);l.castShadow=false;parent.add(l);return l}
    function wrap(c,text,x,y,maxWidth,lineHeight,maxLines=9){const words=String(text).split(/\s+/);let line='',lines=0;for(const word of words){const test=line?line+' '+word:word;if(c.measureText(test).width>maxWidth&&line){c.fillText(line,x,y);y+=lineHeight;line=word;if(++lines>=maxLines-1)break}else line=test}if(line)c.fillText(line,x,y);return y+lineHeight}
    const displayGeometry=new THREE.BoxGeometry(.82,1.08,.14);
    // The librarian's note for each daily book (data/daily-room-notes.js). A note the library already has for
    // that edition wins; the rest are filed where "Ask the librarian" looks for them.
    function attachNote(book,title){const note=window.ATHENAEUM_DAILY_NOTES?.[title];if(!note)return;window.ATHENAEUM_EXTRA_NOTES=window.ATHENAEUM_EXTRA_NOTES||{};window.ATHENAEUM_EXTRA_NOTES[book.id]=window.ATHENAEUM_EXTRA_NOTES[book.id]||note}

    // ---------- the door in the Grand Hall ----------
    function calendarTexture(found){return canvasTexture((c,w,h)=>{
      const p=PALETTES[found?.entry.kind]||PALETTES['on-this-day'];c.fillStyle='#efe4cc';c.fillRect(0,0,w,h);c.fillStyle='#8c2a22';c.fillRect(0,0,w,70);
      c.fillStyle='#f6ead0';c.textAlign='center';c.font='bold 36px Georgia';c.fillText(new Date(utc(todayKey)).toLocaleDateString('en-GB',{month:'long',timeZone:'UTC'}).toUpperCase(),w/2,50);
      c.fillStyle='#2a1c12';c.font='bold 150px Georgia';c.fillText(String(Number(todayKey.slice(8))),w/2,215);
      c.fillStyle='#6b4a2a';c.font='bold 26px Georgia';c.fillText(found?labelFor(found):'THE ROOM OF THE DAY',w/2,268);
      c.fillStyle='#2a1c12';c.font='italic 30px Georgia';wrap(c,found?found.entry.title:'Opening soon',w/2,310,w-40,34,2);
      c.strokeStyle=p.accent;c.lineWidth=6;c.strokeRect(3,3,w-6,h-6)},360,360)}
    function buildDoor(){
      const g=new THREE.Group();g.position.set(door.x,0,door.z);g.rotation.y=door.yaw;scene.add(g);
      const data={type:'daily-door',title:'The Room of the Day',author:'A new room behind this door every day: ten books, chosen for the date.',action:'ENTER'};
      const doorWood=new THREE.MeshStandardMaterial({map:MAT.wood.map||null,color:MAT.wood.map?0x8a6448:0x4a2c18,roughness:.85,metalness:0,envMapIntensity:.15}),panelWood=new THREE.MeshStandardMaterial({map:MAT.darkWood.map||null,color:MAT.darkWood.map?0x6a4a36:0x2e1a0e,roughness:.85,metalness:0,envMapIntensity:.15});mark(box(1.9,3.1,.14,doorWood,0,1.55,.08,g),data);
      for(const [py,ph] of [[.95,1.2],[2.35,1.05]])for(const px of [-.46,.46])box(.72,ph,.04,panelWood,px,py,.17,g);
      for(const px of [-1.07,1.07])box(.22,3.45,.3,MAT.brass,px,1.72,.1,g);box(2.36,.22,.3,MAT.brass,0,3.44,.1,g);
      const knob=add(new THREE.SphereGeometry(.08,10,8),MAT.brass,.68,1.45,.22,g);mark(knob,data);
      const sign=add(new THREE.PlaneGeometry(1.9,.3),new THREE.MeshStandardMaterial({map:canvasTexture((c,w,h)=>{c.fillStyle='#24170d';c.fillRect(0,0,w,h);c.strokeStyle='#d7ae60';c.lineWidth=6;c.strokeRect(5,5,w-10,h-10);c.fillStyle='#ffe2a0';c.textAlign='center';c.font='bold 30px Georgia';c.fillText('THE ROOM OF THE DAY',w/2,44)},560,64),emissive:0x6b461e,emissiveIntensity:.35}),0,3.72,.12,g);mark(sign,data);
      // A tear-off calendar above the door shows today's date and what is behind it.
      const calendarMaterial=new THREE.MeshStandardMaterial({map:calendarTexture(entryFor(todayKey)),roughness:.85});
      const calendar=add(new THREE.PlaneGeometry(1.05,1.05),calendarMaterial,0,4.55,.12,g);mark(calendar,data);box(1.15,.08,.06,MAT.brass,0,5.1,.12,g);
      const glow=light(g,0xffc27a,1.4,5,0,3.9,1.1);
      doorParts={group:g,calendarMaterial,glow};
    }
    function refreshCalendar(){if(!doorParts)return;const old=doorParts.calendarMaterial.map;doorParts.calendarMaterial.map=calendarTexture(entryFor(todayKey));doorParts.calendarMaterial.needsUpdate=true;old?.dispose()}

    // ---------- the room ----------
    function buildShell(){
      root=new THREE.Group();root.name='daily-room';const {cx,cz,w,d,h}=room;
      const wallMaterial=new THREE.MeshStandardMaterial({color:0x3a2a1d,roughness:.88});root.userData.wallMaterial=wallMaterial;
      box(w,.3,d,MAT.wood,cx,-.15,cz,root);
      box(w,h,.3,wallMaterial,cx,h/2,cz-d/2,root);box(.3,h,d,wallMaterial,cx-w/2,h/2,cz,root);box(.3,h,d,wallMaterial,cx+w/2,h/2,cz,root);box(w,h,.3,wallMaterial,cx,h/2,cz+d/2,root);
      box(w,.25,d,MAT.darkWood,cx,h+.12,cz,root);
      for(const [x,z,sw,sd,rail] of [[cx,cz-d/2+.17,w-.4,.05,false],[cx,cz+d/2-.17,w-.4,.05,true],[cx-w/2+.17,cz,.05,d-.4,true],[cx+w/2-.17,cz,.05,d-.4,true]]){box(sw,.22,sd,MAT.darkWood,x,.11,z,root);if(rail)box(sw,.08,sd,MAT.brass,x,3.6,z,root)}
      // Standard lamps either side of the placard.
      const shade=new THREE.MeshStandardMaterial({color:0xf2d6a0,emissive:0xffb35c,emissiveIntensity:1.1,roughness:.7});for(const side of [-1,1]){const lx=cx+side*(w/2-1.3),lz=cz-d/2+1.2;box(.36,.06,.36,MAT.brass,lx,.03,lz,root);add(new THREE.CylinderGeometry(.03,.03,1.7,8),MAT.brass,lx,.88,lz,root);add(new THREE.CylinderGeometry(.2,.32,.38,14,1,true),shade,lx,1.86,lz,root);light(root,0xffc27a,4.5,7,lx,1.7,lz+.3);block(lx,lz,.6,.6)}
      // Face-out ledges along both side walls: five on the left, four on the right.
      for(let i=0;i<5;i++)box(.36,.06,1.1,MAT.darkWood,cx-w/2+.33,.93,cz-4.6+i*1.7,root);
      for(let i=0;i<4;i++)box(.36,.06,1.1,MAT.darkWood,cx+w/2-.33,.93,cz-3.75+i*1.7,root);
      // The lectern for the book of the day, and the day book by the door.
      box(.9,1.05,.62,MAT.darkWood,cx,.52,cz-2.6,root);const top=box(1.05,.08,.8,MAT.darkWood,cx,1.1,cz-2.55,root);top.rotation.x=.32;block(cx,cz-2.6,1.2,.9);
      const dx=cx+w/2-2.3,dz=cz+d/2-2.4,dayBookStand=box(.8,1.0,.55,MAT.darkWood,dx,.5,dz,root),bookTop=box(.95,.08,.7,MAT.darkWood,dx,1.06,dz,root);bookTop.rotation.x=-.28;block(dx,dz,1.1,.85);
      root.userData.dayBookParts=[dayBookStand,bookTop].map(part=>mark(part,{type:'daily-daybook',title:'The day book',author:'',action:'READ'}));
      // A reading bench facing the lectern.
      box(2.6,.12,.62,MAT.darkWood,cx,.5,cz+1.4,root);for(const lx of [-1.15,1.15])box(.12,.46,.5,MAT.darkWood,cx+lx,.23,cz+1.4,root);block(cx,cz+1.4,2.8,.8);
      // Exit.
      const exitData={type:'daily-exit',title:'Back to the Grand Hall',author:'The door remembers which way the lamps are.',action:'RETURN'};
      mark(box(1.9,3.1,.16,MAT.darkWood,cx,1.55,cz+d/2-.2,root),exitData);
      for(const px of [-1.05,1.05])box(.16,3.35,.24,MAT.brass,cx+px,1.68,cz+d/2-.22,root);box(2.3,.16,.24,MAT.brass,cx,3.3,cz+d/2-.22,root);
      mark(add(new THREE.SphereGeometry(.08,10,8),MAT.brass,cx+.65,1.45,cz+d/2-.32,root),exitData);
      root.userData.lights=[light(root,0xffd49a,14,16,cx,h-.5,cz-2.5),light(root,0xffd49a,10,14,cx,h-.5,cz+3.5),light(root,0xffd49a,7,9,cx,3.1,cz-d/2+2.6)];
      scene.add(root);active=true;
    }
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}

    function clearDressing(){
      if(!dressing)return;dressing.removeFromParent();
      for(let i=interactables.length-1;i>=0;i--)if(dayBooks.includes(interactables[i])||interactables[i].userData?.dailyDressing)interactables.splice(i,1);
      for(const item of disposables.splice(0))item.dispose?.();dayBooks.length=0;dressing=null;
    }
    function dress(offset){
      const key=addDays(todayKey,-offset),found=entryFor(key);clearDressing();dressedKey=`${todayKey}:${offset}`;shownOffset=offset;if(!found)return;
      const {entry}=found,{cx,cz,w,d}=room,p=PALETTES[entry.kind]||PALETTES['on-this-day'],label=labelFor(found),{list,featured}=booksFor(entry);
      dressing=new THREE.Group();dressing.name='daily-dressing';root.add(dressing);root.userData.wallMaterial.color.setHex(p.wall);for(const l of root.userData.lights)l.color.setHex(p.light);
      const own=(thing)=>{disposables.push(thing);return thing};
      // The placard on the far wall.
      const placardTexture=own(canvasTexture((c,W,H)=>{
        c.fillStyle='#17110c';c.fillRect(0,0,W,H);c.strokeStyle=p.accent;c.lineWidth=10;c.strokeRect(14,14,W-28,H-28);c.lineWidth=2;c.strokeRect(30,30,W-60,H-60);
        c.textAlign='center';c.fillStyle=p.accent;c.font='bold 34px Georgia';c.fillText((offset?'FROM THE DAY BOOK · ':'')+label.split('').join(' '),W/2,96);
        c.fillStyle=p.ink;c.font='bold 84px Georgia';const after=wrap(c,entry.title,W/2,196,W-160,90,2);
        c.fillStyle=p.accent;c.font='italic 34px Georgia';c.fillText(entry.kind==='on-this-day'&&found.looped?shortDate(entry.date):niceDate(key),W/2,after+2);
        c.fillStyle=p.ink;c.font='38px Georgia';wrap(c,entry.intro,W/2,after+74,W-200,50,5);
        c.fillStyle=p.accent;c.font='italic 26px Georgia';c.fillText(`${list.length} books · the book of the day waits on the lectern`,W/2,H-54)},1280,720));
      const placardMaterial=own(new THREE.MeshBasicMaterial({map:placardTexture,color:0xe8e2d6}));
      const placard=add(own(new THREE.PlaneGeometry(6.4,3.6)),placardMaterial,cx,2.7,cz-d/2+.2,dressing);placard.userData={type:'daily-detail',title:entry.title,author:entry.intro,action:'READ',dailyDressing:true};interactables.push(placard);
      const rug=add(own(new THREE.PlaneGeometry(7.5,5.2)),own(new THREE.MeshStandardMaterial({map:own(canvasTexture((c,W,H)=>{c.fillStyle=p.rug;c.fillRect(0,0,W,H);c.strokeStyle=p.accent;c.globalAlpha=.55;c.lineWidth=10;c.strokeRect(22,22,W-44,H-44);c.lineWidth=3;c.strokeRect(44,44,W-88,H-88)},512,356)),roughness:.95})),cx,.012,cz-.6,dressing);rug.rotation.x=-Math.PI/2;
      // The books: one on the lectern, the rest face-out on the side ledges.
      const spots=[];for(let i=0;i<5;i++)spots.push({x:cx-w/2+.36,z:cz-4.6+i*1.7,yaw:Math.PI/2});for(let i=0;i<4;i++)spots.push({x:cx+w/2-.36,z:cz-3.75+i*1.7,yaw:-Math.PI/2});
      let spot=0;
      list.forEach((record,i)=>{
        const book=registerBook(record);if(!book)return;attachNote(book,record.title);const material=own(bookMaterial(book));
        let mesh;
        if(i===featured){mesh=add(displayGeometry,material,cx,1.32,cz-2.5,dressing);mesh.rotation.order='YXZ';mesh.rotation.x=-.9}
        else{const s=spots[spot++];if(!s)return;mesh=add(displayGeometry,material,s.x,1.5,s.z,dressing);mesh.rotation.order='YXZ';mesh.rotation.y=s.yaw;mesh.rotation.x=-.08}
        mesh.userData={type:'book',book,loaded:false,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:dressing}};interactables.push(mesh);dayBooks.push(mesh);
      });
      const featuredBook=list[featured];
      const plate=add(own(new THREE.PlaneGeometry(.9,.2)),own(new THREE.MeshStandardMaterial({map:own(canvasTexture((c,W,H)=>{c.fillStyle='#24170d';c.fillRect(0,0,W,H);c.fillStyle=p.accent;c.textAlign='center';c.font='bold 26px Georgia';c.fillText('THE BOOK OF THE DAY',W/2,40)},360,64))})),cx,.82,cz-2.6+.315,dressing);plate.userData={type:'daily-detail',title:'The book of the day',author:featuredBook?`${featuredBook.title}, by ${featuredBook.author}.`:'Not yet chosen.',action:'READ',dailyDressing:true};interactables.push(plate);
      // The day book: leaf back through the last fortnight's rooms.
      const olderKey=addDays(todayKey,-(offset>=oldestOffset()?0:offset+1)),older=entryFor(olderKey);
      const pageTexture=own(canvasTexture((c,W,H)=>{c.fillStyle='#efe4cc';c.fillRect(0,0,W,H);c.fillStyle='#2a1c12';c.textAlign='center';c.font='bold 28px Georgia';c.fillText('THE DAY BOOK',W/2,48);c.font='22px Georgia';for(let k=0;k<=Math.min(6,oldestOffset());k++){const dayKey=addDays(todayKey,-k),e=entryFor(dayKey);if(!e)continue;c.fillStyle=k===offset?'#8c2a22':'#3a2a1d';c.fillText(`${shortDate(dayKey)} · ${e.entry.title}`.slice(0,40),W/2,96+k*34)}},512,340));
      const page=add(own(new THREE.PlaneGeometry(.9,.6)),own(new THREE.MeshStandardMaterial({map:pageTexture,roughness:.9})),cx+w/2-2.3,1.12,cz+d/2-2.4,dressing);/* Lies on the sloping top, text upright for a reader facing the door. */page.rotation.x=-Math.PI/2-.28;page.rotation.z=Math.PI;
      const dayBookAuthor=oldestOffset()===0?'Today is the first room; tomorrow the day book begins.':offset>=oldestOffset()?`Showing ${shortDate(key)}. Turn back to today.`:`Showing ${offset?shortDate(key):'today'}. Leaf back to ${shortDate(olderKey)}: ${older?.entry.title||''}.`;
      const dayBookAction=oldestOffset()===0?'READ':offset>=oldestOffset()?'BACK TO TODAY':'LEAF BACK A DAY';page.userData={type:'daily-daybook',title:'The day book',author:dayBookAuthor,action:dayBookAction,dailyDressing:true};interactables.push(page);
      for(const part of root.userData.dayBookParts)Object.assign(part.userData,{author:dayBookAuthor,action:dayBookAction});
    }

    // ---------- lifecycle ----------
    function activate(){if(!root)buildShell();else if(!active){scene.add(root);active=true}lastNeeded=time;if(dressedKey!==`${todayKey}:${shownOffset}`)dress(shownOffset)}
    function unload(){if(!active)return;root.removeFromParent();active=false;/* Free the day's books and textures; they are rebuilt next visit. */clearDressing();dressedKey=null;shownOffset=0}
    function contains(x,z){return x>room.cx-room.w/2&&x<room.cx+room.w/2&&z>room.cz-room.d/2&&z<room.cz+room.d/2}
    function floorAt(x,z){return contains(x,z)?0:null}
    function allowed(x,z){if(!contains(x,z))return false;const radius=player.radius||.42;if(x-radius<room.cx-room.w/2+.55||x+radius>room.cx+room.w/2-.55||z-radius<room.cz-room.d/2+.4||z+radius>room.cz+room.d/2-.4)return false;return !blockers.some(b=>x+radius>b.minX&&x-radius<b.maxX&&z+radius>b.minZ&&z-radius<b.maxZ)}
    function enter(){
      activate();move(room.cx,room.cz+room.d/2-1.8,0);playSample?.('doorOpen',.8,1.05);
      const found=entryFor(addDays(todayKey,-shownOffset));
      showNotice(found?`${labelFor(found)[0]+labelFor(found).slice(1).toLowerCase()} · ${found.entry.title}. ${(schedule.kinds[found.entry.kind]||{}).hint||''}`:'The room is being prepared. The first books arrive soon.',7);
      analytics?.track('Room Explored',{room:'daily-room'});
    }
    function interact(object){
      const data=object?.userData;if(!data)return false;
      if(data.type==='daily-door'){enter();return true}
      if(data.type==='daily-exit'){move(door.x+Math.sin(door.yaw)*1.9,door.z+Math.cos(door.yaw)*1.9,door.yaw+Math.PI);playSample?.('doorOpen',.8,1);showNotice('The Grand Hall again. Tomorrow the room will be different.',4);return true}
      if(data.type==='daily-daybook'){if(oldestOffset()===0){showNotice(data.author,5);return true}const next=shownOffset>=oldestOffset()?0:shownOffset+1;dress(next);sound?.(620,.12,'triangle',.04);const found=entryFor(addDays(todayKey,-next));showNotice(next?`The room rearranges itself: ${shortDate(found.key)}, ${found.entry.title}.`:`Back to today: ${found.entry.title}.`,5);return true}
      if(data.type==='daily-detail'){showNotice(data.author,8);return true}
      return false;
    }
    function update(t){
      time=t;
      if(t>=nextDayCheck){nextDayCheck=t+30;const key=dateKey(now());if(key!==todayKey){todayKey=key;refreshCalendar();/* A new day: re-dress when the reader is not standing in the old one. */if(!contains(player.pos.x,player.pos.z)){shownOffset=0;if(active)dress(0)}}}
      const near=Math.hypot(player.pos.x-door.x,player.pos.z-door.z)<PRELOAD_DISTANCE,inside=contains(player.pos.x,player.pos.z);
      // Built and dressed as the reader walks up to the door, not when it opens, so the game can compile its
      // shaders in the background and stepping inside is instant.
      if(inside||near)activate();else if(active&&t-lastNeeded>KEEP_WARM_SECONDS)unload();
    }
    buildDoor();
    return {contains,floorAt,allowed,interact,update,enter,door,room,get todayKey(){return todayKey},entryFor,booksFor,get shownOffset(){return shownOffset},get active(){return active},get dayBooks(){return dayBooks.slice()},zoneAt:(x,z)=>contains(x,z)?room:null};
  };
})();
