// The English Reading Room: a schoolroom off the west wing for everyone reading in English as a second (or
// third, or fourth) language. Books sit on four shelves graded from gentle to challenging, with a shelf of
// stories short enough for one sitting; a blackboard has a word of the day; the teacher's desk keeps the
// words a reader has saved. Books taken from here open with word help switched on (word-help.js).
//
// Levels come from data/learner-levels.js, measured from each book's text by scripts/build-learner-data.mjs.
// Like the other rooms behind doors, nothing is built until the reader walks up to it, and it is freed a
// little while after they leave.
(function(){
  'use strict';

  const LEVELS=[
    {name:'GENTLE',note:'Short sentences and everyday words.',colour:'#6f9a52'},
    {name:'STEADY',note:'A little longer, and still friendly.',colour:'#c9a13f'},
    {name:'RICHER',note:'More unusual words to discover.',colour:'#c7733a'},
    {name:'CHALLENGING',note:'Long sentences and old words. Take your time.',colour:'#a8483c'}
  ];
  // A word a day for the blackboard, each with a plain meaning and a sentence of its own.
  const WORDS=[
    ['curious','wanting to know or learn about something','The curious cat looked inside every box.'],['gloomy','dark and sad','It was a gloomy afternoon, and the rain did not stop.'],
    ['whisper','to speak very quietly','She whispered the answer so the others could not hear.'],['brave','ready to face danger or pain','The brave girl climbed down to rescue the lamb.'],
    ['wander','to walk slowly with no fixed plan','We wandered through the old streets until dark.'],['cheerful','happy and bright','His cheerful letter made the whole family smile.'],
    ['journey','a long trip from one place to another','The journey across the sea took three weeks.'],['glimpse','a quick look at something','I caught a glimpse of the ship before the fog came down.'],
    ['ancient','very, very old','They found an ancient map inside the wall.'],['astonished','very surprised','The crowd was astonished when the balloon rose into the air.'],
    ['fierce','strong, wild and frightening','A fierce wind shook the windows all night.'],['gentle','kind and soft; not rough','The old horse was gentle with the children.'],
    ['hesitate','to stop for a moment before doing something','He hesitated at the door, then knocked.'],['lantern','a lamp you can carry, with a case around the flame','She lit the lantern and went down to the cellar.'],
    ['mysterious','strange and hard to explain','A mysterious letter arrived with no name on it.'],['nervous','worried and a little afraid','I always feel nervous before an exam.'],
    ['ordinary','normal; not special','It began as an ordinary Tuesday.'],['peculiar','strange or unusual','There was a peculiar smell in the kitchen.'],
    ['quarrel','an angry argument','The brothers had a quarrel about the last apple.'],['remarkable','worth noticing; unusual in a good way','She has a remarkable memory for faces.'],
    ['shelter','a place that protects you from weather or danger','We found shelter from the storm in a barn.'],['tremble','to shake a little, from fear or cold','His hands trembled as he opened the box.'],
    ['vanish','to disappear suddenly','The rabbit vanished down the hole.'],['weary','very tired','The weary travellers slept until noon.'],
    ['yearn','to want something very much','She yearned to see the sea again.'],['eager','wanting very much to do something','The children were eager to begin the story.'],
    ['fortunate','lucky','We were fortunate to find the last two seats.'],['humble','not proud; simple','He lived in a humble cottage by the river.'],
    ['linger','to stay a little longer than needed','The smell of bread lingered in the kitchen.'],['solemn','serious and without smiling','The judge gave a solemn nod.'],
    ['splendid','very beautiful or very good','What a splendid view of the mountains!'],['stumble','to almost fall while walking','I stumbled on the dark stairs.']
  ];
  // "Welcome" in the visitor's own language, taken from the browser's language setting.
  const WELCOME={es:'¡Bienvenidos!',pt:'Boas-vindas!',fr:'Bienvenue !',de:'Willkommen!',it:'Benvenuti!',nl:'Welkom!',pl:'Witamy!',tr:'Hoş geldiniz!',ru:'Добро пожаловать!',uk:'Ласкаво просимо!',
    el:'Καλώς ήρθατε!',ar:'أهلاً وسهلاً!',he:'ברוכים הבאים!',fa:'خوش آمدید!',ur:'خوش آمدید!',hi:'स्वागत है!',ne:'स्वागत छ!',bn:'স্বাগতম!',ta:'வரவேற்கிறோம்!',th:'ยินดีต้อนรับ!',vi:'Chào mừng!',
    id:'Selamat datang!',ms:'Selamat datang!',tl:'Maligayang pagdating!',fil:'Maligayang pagdating!',zh:'欢迎！',ja:'ようこそ！',ko:'환영합니다!',sw:'Karibu!',ga:'Fáilte!',ro:'Bun venit!',hu:'Üdvözöljük!',cs:'Vítejte!',sv:'Välkommen!',no:'Velkommen!',nb:'Velkommen!',da:'Velkommen!',fi:'Tervetuloa!'};
  const BANNER=['Welcome','Bienvenidos','Bienvenue','Boas-vindas','Willkommen','Karibu','Witamy','Hoş geldiniz','Selamat datang','Chào mừng','欢迎','ようこそ','환영합니다','स्वागत है','أهلاً وسهلاً','Добро пожаловать','Fáilte'];

  window.createLearnersRoom=function(options){
    const {THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,levels={},arrivals={},wordHelp=null,showNotice,playSample,sound,move,analytics,language=()=>'en',today=()=>new Date(),isHolding=()=>false,doorKit=null}=options;
    const DOOR={x:-23,z:9.45,yaw:Math.PI};
    const ROOM={cx:-330,cz:-60,w:16,d:14,h:5};
    const PRELOAD=7,KEEP=25;
    // The same door from either side: green, glazed above and hung in the library's own kit (library-doors.js).
    const DOOR_LOOK={style:'painted',color:0x3f6b4f,fanColor:0xffc978,glazed:true,width:1.9,height:3.1};
    const through=(data,go)=>doorKit&&data.kit?doorKit.pass(data.kit,data,go):go();
    let root=null,time=0,lastNeeded=-1e9,doorParts=null;
    const owned=[],ours=[],books=[],blockers=[];
    const own=thing=>{owned.push(thing);return thing};
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    const cyl=(r1,r2,h,material,x,y,z,parent,seg=12)=>add(own(new THREE.CylinderGeometry(r1,r2,h,seg)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    // The door in the hall stays when the room is freed, so its parts are not among the room's own.
    function markDoor(object,data){object.userData=data;interactables.push(object);return object}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    function lamp(parent,color,intensity,distance,x,y,z){const l=new THREE.PointLight(color,intensity,distance,2);l.position.set(x,y,z);parent.add(l);return l}
    const dayKey=()=>today().toISOString().slice(0,10);
    function seeded(key){let h=2166136261;for(const ch of key){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return()=>{h=Math.imul(h^h>>>15,2246822507);h=Math.imul(h^h>>>13,3266489909);return((h^=h>>>16)>>>0)/4294967296}}
    function wordOfTheDay(key=dayKey()){const n=Math.floor(Date.parse(key+'T12:00:00Z')/86400000);return WORDS[((n%WORDS.length)+WORDS.length)%WORDS.length]}
    function greeting(){const tag=String(language()||'en').toLowerCase(),code=tag.split(/[-_]/)[0];return WELCOME[tag]||WELCOME[code]||null}

    // ---------- which books go on which shelf ----------
    // Every book in this room is chosen by hand for readers learning English: warm, well-loved and not grim
    // for the sake of it. The measured levels decide reading times; the shelves were set with them in mind.
    // One darker classic is kept, with a pencilled note so nobody is taken by surprise.
    const SHELVES=[
      [11,46,55,16,1874,1597,2591],             // Gentle: Alice, A Christmas Carol, Oz, Peter Pan, The Railway Children, Andersen, Grimm
      [2781,289,45,74,120,113],                 // Steady: Just So Stories, The Wind in the Willows, Anne of Green Gables, Tom Sawyer, Treasure Island, The Secret Garden
      [236,1661,514,1448,103],                  // Richer: The Jungle Book, Sherlock Holmes, Little Women, Heidi, Around the World in Eighty Days
      [1342,1260,1400,161,158,43]               // Challenging: Austen, Jane Eyre, Great Expectations … and Jekyll and Hyde
    ];
    const SHORT=[14838,11757,13,14522];         // Peter Rabbit, The Velveteen Rabbit, The Hunting of the Snark, The Canterville Ghost
    const NOTES={43:'A darker story: a respected doctor and the monster he lets out. Short, gripping, and one of the great English classics.'};
    function shelves(key=dayKey()){
      const rand=seeded('learners:'+key),entry=(id,level)=>{const book=findBook(id);if(!book)return null;const measured=levels[id];return {book,level,minutes:measured?.[1]||null,note:NOTES[id]||null}};
      // Four of each shelf's books are out on a given day, a different four tomorrow.
      const pick=(ids,level)=>ids.map(id=>({id,w:rand()})).sort((a,b)=>a.w-b.w).map(x=>entry(x.id,level)).filter(Boolean).slice(0,4);
      // New arrivals (data/new-books.js) join each shelf's pool and the short-reads table, which also shows four a day.
      const graded=SHELVES.map((ids,i)=>pick([...new Set([...ids,...(arrivals[i+1]||[])])],i+1));
      const short=[...new Set([...SHORT,...(arrivals.short||[])])].map(id=>({id,w:rand()})).sort((a,b)=>a.w-b.w).map(x=>entry(x.id,levels[x.id]?.[0]||1)).filter(e=>e&&e.minutes).slice(0,4).sort((a,b)=>a.minutes-b.minutes);
      return {graded,short};
    }

    // ---------- the door, off the west wing ----------
    function sign(parent,text,sub,w,h,x,y,z,colour='#24170d',ink='#ffe2a0'){
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle=colour;c.fillRect(0,0,W,H);c.strokeStyle='#d7ae60';c.lineWidth=6;c.strokeRect(5,5,W-10,H-10);c.fillStyle=ink;c.textAlign='center';c.font=`bold ${sub?30:34}px Georgia`;c.fillText(text,W/2,sub?46:H/2+12);if(sub){c.font='italic 21px Georgia';c.fillText(sub,W/2,80)}},560,sub?100:72));
      return add(own(new THREE.PlaneGeometry(w,h)),own(new THREE.MeshStandardMaterial({map,emissive:0x6b461e,emissiveIntensity:.3,roughness:.85})),x,y,z,parent);
    }
    function buildDoor(){
      const g=new THREE.Group();g.name='learners-door';g.position.set(DOOR.x,0,DOOR.z);g.rotation.y=DOOR.yaw;scene.add(g);
      const data={type:'learners-door',title:'The English Reading Room',author:'For everyone reading in English as a new language. Graded shelves, and help with every word.',action:'ENTER'};
      if(!doorKit?.hang(g,{data,mark:markDoor,...DOOR_LOOK}))markDoor(add(new THREE.BoxGeometry(1.9,3.1,.14),new THREE.MeshStandardMaterial({color:DOOR_LOOK.color,roughness:.8}),0,1.55,.08,g),data);
      // A slate by the door with the word of the day, as on the blackboard inside.
      const [word,meaning]=wordOfTheDay(),slate=canvasTexture((c,W,H)=>{c.fillStyle='#2b3530';c.fillRect(0,0,W,H);for(let k=0;k<260;k++){c.fillStyle=`rgba(255,255,255,${Math.random()*.04})`;c.fillRect(Math.random()*W,Math.random()*H,3+Math.random()*24,1+Math.random()*2)}
        c.textAlign='center';c.fillStyle='#f4f1e6';c.font='bold 24px Georgia';c.fillText('WORD OF THE DAY',W/2,46);c.font='bold 62px Georgia';c.fillText(word,W/2,132);
        c.font='italic 23px Georgia';c.fillStyle='#e8e0c8';let size=23;while(c.measureText(meaning).width>W-36&&size>14){size-=1;c.font=`italic ${size}px Georgia`}c.fillText(meaning,W/2,184)},384,224);
      add(new THREE.BoxGeometry(.98,.62,.05),MAT.darkWood,-1.78,1.72,.04,g);markDoor(add(new THREE.PlaneGeometry(.88,.52),new THREE.MeshStandardMaterial({map:slate,roughness:.95}),-1.78,1.72,.07,g),{type:'learners-word',title:'Word of the day',author:`${word}: ${meaning}.`,action:'SAY IT',word,meaning});
      add(new THREE.BoxGeometry(.5,.04,.08),MAT.darkWood,-1.78,1.38,.09,g);add(new THREE.BoxGeometry(.08,.025,.025),new THREE.MeshStandardMaterial({color:0xf2efe4,roughness:1}),-1.66,1.41,.1,g);
      const plate=canvasTexture((c,W,H)=>{c.fillStyle='#1e3326';c.fillRect(0,0,W,H);c.strokeStyle='#d7ae60';c.lineWidth=6;c.strokeRect(5,5,W-10,H-10);c.textAlign='center';c.fillStyle='#ffe2a0';c.font='bold 30px Georgia';c.fillText('THE ENGLISH READING ROOM',W/2,46);c.font='italic 21px Georgia';c.fillText('Welcome · Bienvenidos · Bienvenue · Karibu · 欢迎',W/2,80)},640,100);
      markDoor(add(new THREE.PlaneGeometry(2.2,.34),new THREE.MeshStandardMaterial({map:plate,emissive:0x6b461e,emissiveIntensity:.35}),0,4.82,.12,g),data);
      doorParts={group:g,glow:lamp(g,0xffd79a,1.2,5,0,3.9,1.1)};
    }

    // ---------- the room ----------
    function buildRoom(){
      root=new THREE.Group();root.name='learners-room';const {cx,cz,w,d,h}=ROOM;
      const wall=own(new THREE.MeshStandardMaterial({color:0x5b4a36,roughness:.9})),board=own(new THREE.MeshStandardMaterial({color:0x2d3a33,roughness:.95}));
      box(w,.3,d,MAT.wood,cx,-.15,cz,root);box(w,.25,d,MAT.darkWood,cx,h+.12,cz,root);
      box(w,h,.3,wall,cx,h/2,cz-d/2,root);box(w,h,.3,wall,cx,h/2,cz+d/2,root);box(.3,h,d,wall,cx-w/2,h/2,cz,root);box(.3,h,d,wall,cx+w/2,h/2,cz,root);
      for(const [x,z,sw,sd] of [[cx,cz-d/2+.17,w-.4,.05],[cx,cz+d/2-.17,w-.4,.05],[cx-w/2+.17,cz,.05,d-.4],[cx+w/2-.17,cz,.05,d-.4]]){box(sw,1.1,sd,MAT.darkWood,x,.55,z,root);box(sw,.06,sd+.04,MAT.brass,x,1.12,z,root)}
      // The blackboard, with the welcome above it and the word of the day on it.
      const [word,meaning,example]=wordOfTheDay();
      const chalk=own(canvasTexture((c,W,H)=>{
        c.fillStyle='#26332c';c.fillRect(0,0,W,H);for(let k=0;k<900;k++){c.fillStyle=`rgba(255,255,255,${Math.random()*.035})`;c.fillRect(Math.random()*W,Math.random()*H,3+Math.random()*30,1+Math.random()*3)}
        c.strokeStyle='#8a6a3e';c.lineWidth=18;c.strokeRect(0,0,W,H);c.textAlign='center';c.fillStyle='#f4f1e6';
        c.font='bold 40px Georgia';c.fillText('WORD OF THE DAY',W/2,78);c.font='bold 96px Georgia';c.fillText(word,W/2,196);
        c.font='italic 38px Georgia';c.fillText(meaning,W/2,262);c.font='34px Georgia';c.fillStyle='#e8e0c8';c.fillText(`“${example}”`,W/2,330);
        c.font='28px Georgia';c.fillStyle='#cfe0cf';c.fillText('Tap any word in a book to see what it means, hear it, and save it.',W/2,420);
        c.fillText('Books from this room open with word help switched on.',W/2,460);
      },1280,512));
      const blackboard=add(own(new THREE.PlaneGeometry(7.2,2.9)),own(new THREE.MeshStandardMaterial({map:chalk,roughness:.95,emissive:0x1a1a1a,emissiveIntensity:.25})),cx,2.55,cz-d/2+.18,root);
      mark(blackboard,{type:'learners-word',title:'Word of the day',author:`${word}: ${meaning}.`,action:'SAY IT',word,meaning});
      box(7.2,.08,.18,MAT.darkWood,cx,1.05,cz-d/2+.26,root);
      const banner=own(canvasTexture((c,W,H)=>{c.fillStyle='#f1e6c8';c.fillRect(0,0,W,H);c.fillStyle='#3a2a1d';c.textAlign='center';c.font='30px Georgia, "Noto Sans", sans-serif';
        let x=40;const gap=46;c.textAlign='left';for(const wd of BANNER){const wdt=c.measureText(wd).width;if(x+wdt>W-30)break;c.fillText(wd,x,50);x+=wdt+gap;c.fillStyle='#b08a4a';c.fillText('·',x-gap/2-5,50);c.fillStyle='#3a2a1d'}},2048,76));
      add(own(new THREE.PlaneGeometry(14.5,.54)),own(new THREE.MeshStandardMaterial({map:banner,roughness:.9})),cx,4.45,cz-d/2+.18,root);
      // The four graded shelves, two on each side wall, and their labels.
      const {graded,short}=shelves();
      const shelfSpots=[{x:cx-w/2+.33,z:cz-3.2,yaw:Math.PI/2},{x:cx-w/2+.33,z:cz+1.6,yaw:Math.PI/2},{x:cx+w/2-.33,z:cz-3.2,yaw:-Math.PI/2},{x:cx+w/2-.33,z:cz+1.6,yaw:-Math.PI/2}];
      const displayGeometry=own(new THREE.BoxGeometry(.82,1.08,.14));
      graded.forEach((list,level)=>{
        const s=shelfSpots[level],side=Math.sign(s.yaw);
        for(const y of [.93,2.33])box(.36,.06,4.3,MAT.darkWood,s.x,y,s.z,root);
        const label=sign(root,`${LEVELS[level].name}`,LEVELS[level].note,2.7,.46,s.x-side*.14,3.55,s.z,'#24170d');label.rotation.y=s.yaw;
        mark(label,{type:'learners-level',title:`${LEVELS[level].name[0]}${LEVELS[level].name.slice(1).toLowerCase()} books`,author:LEVELS[level].note,action:'READ',level:level+1});
        const stripe=box(.03,.07,4.3,own(new THREE.MeshStandardMaterial({color:LEVELS[level].colour,roughness:.8})),s.x+side*.19,.86,s.z,root);stripe.userData.levelStripe=true;
        list.forEach((entry,i)=>{const row=i<2?0:1,col=i%2;placeBook(entry,s.x,row?2.9:1.5,s.z-1+col*2,s.yaw,displayGeometry)});
        block(s.x,s.z,.8,4.4);
      });
      // Short reads: books on a table by the door, each with its reading time.
      const tx=cx+3.4,tz=cz+d/2-2.2;box(3.8,.1,1.1,MAT.wood,tx,1.02,tz,root);for(const dx of [-1.75,1.75])for(const dz of [-.45,.45])box(.1,1,.1,MAT.darkWood,tx+dx,.5,tz+dz,root);block(tx,tz,4,1.3);
      const oneSign=sign(root,'SHORT READS','Stories you can finish in an evening',2.2,.4,tx,2.55,tz+.3);oneSign.rotation.y=Math.PI;
      short.forEach((entry,i)=>{const bx=tx+1.35-i*.9;placeBook(entry,bx,1.64,tz+.1,Math.PI,displayGeometry,-.12);
        const card=own(canvasTexture((c,W,H)=>{c.fillStyle='#f1e6c8';c.fillRect(0,0,W,H);c.fillStyle='#3a2a1d';c.textAlign='center';c.font='bold 34px Georgia';c.fillText(`${entry.minutes} min`,W/2,44)},160,64));
        const tag=add(own(new THREE.PlaneGeometry(.42,.17)),own(new THREE.MeshStandardMaterial({map:card,roughness:.9})),bx,1.075,tz-.38,root);tag.rotation.x=-Math.PI/2;tag.rotation.z=Math.PI});
      // Desks for readers, and the teacher's desk with the notebook and a globe.
      const deskTop=own(new THREE.MeshStandardMaterial({color:0x7a5534,roughness:.8}));
      for(const dx of [-3,0,3])for(const dz of [-.6,2]){const x=cx+dx,z=cz+dz;box(1.5,.07,.8,deskTop,x,.95,z,root);for(const lx of [-.65,.65])box(.07,.95,.7,MAT.darkWood,x+lx,.47,z,root);box(.9,.06,.6,MAT.darkWood,x,.55,z+.85,root);box(.9,.7,.06,MAT.darkWood,x,.88,z+1.14,root);block(x,z+.3,1.6,1.5)}
      const kx=cx-4.8,kz=cz-d/2+2.2;box(2.4,.1,1.1,MAT.wood,kx,1.02,kz,root);box(2.3,.95,1,MAT.darkWood,kx,.5,kz,root);block(kx,kz,2.6,1.3);
      const notebookCover=own(new THREE.MeshStandardMaterial({color:0x7a2f2a,roughness:.8})),pages=own(new THREE.MeshStandardMaterial({color:0xf1e6c8,roughness:.9}));
      const nb=new THREE.Group();nb.position.set(kx+.35,1.08,kz+.1);root.add(nb);box(.62,.03,.44,notebookCover,0,0,0,nb);box(.58,.035,.4,pages,0,.012,0,nb);
      const notebookData={type:'learners-notebook',title:'My words',author:'The notebook where your saved words are kept, on this device.',action:'READ MY WORDS'};for(const m of nb.children)mark(m,notebookData);
      const globeMap=own(canvasTexture((c,W,H)=>{c.fillStyle='#4f7fa6';c.fillRect(0,0,W,H);c.fillStyle='#c9b27a';for(const [x,y,rx,ry] of [[.2,.35,.1,.14],[.27,.66,.06,.14],[.5,.3,.07,.08],[.53,.58,.08,.16],[.72,.33,.16,.12],[.83,.7,.06,.05]]){c.beginPath();c.ellipse(W*x,H*y,W*rx,H*ry,0,0,7);c.fill()}},256,128));
      const globe=add(own(new THREE.SphereGeometry(.26,20,14)),own(new THREE.MeshStandardMaterial({map:globeMap,roughness:.6})),kx-.6,1.4,kz,root);cyl(.02,.02,.3,MAT.brass,kx-.6,1.18,kz,root,6);cyl(.12,.14,.04,MAT.brass,kx-.6,1.07,kz,root);
      mark(globe,{type:'learners-globe',title:'A globe',author:'People read in this room from all over the world.',action:'SPIN'});root.userData.globe=globe;
      // Warm pendant lamps over the room.
      const shade=own(new THREE.MeshStandardMaterial({color:0xf2d6a0,emissive:0xffb35c,emissiveIntensity:1.1,roughness:.7}));
      for(const [x,z] of [[cx-2.5,cz-1],[cx+2.5,cz+1.5]]){cyl(.012,.012,1.2,MAT.brass,x,h-.6,z,root,4);add(own(new THREE.CylinderGeometry(.18,.34,.3,14,1,true)),shade,x,h-1.3,z,root);lamp(root,0xffd49a,10,13,x,h-1.5,z)}
      lamp(root,0xffd49a,6,9,cx,3.2,cz-d/2+2.2);
      // The door back to the west wing.
      const exit={type:'learners-exit',title:'Back to the west wing',author:'The lamplit library is just the other side.',action:'RETURN'};
      if(!doorKit?.hang(root,{data:exit,mark,x:cx-3.4,z:cz+d/2-.2,yaw:Math.PI,label:'THE WEST WING',...DOOR_LOOK})){mark(box(1.9,3.1,.16,MAT.darkWood,cx-3.4,1.55,cz+d/2-.2,root),exit);for(const px of [-1.05,1.05])box(.16,3.35,.24,MAT.brass,cx-3.4+px,1.68,cz+d/2-.22,root);box(2.3,.16,.24,MAT.brass,cx-3.4,3.3,cz+d/2-.22,root)}
      scene.add(root);
    }
    function placeBook(entry,x,y,z,yaw,geometry,tilt=-.08){
      const material=own(bookMaterial(entry.book)),mesh=add(geometry,material,x,y,z,root);mesh.rotation.order='YXZ';mesh.rotation.y=yaw;mesh.rotation.x=tilt;
      mesh.userData={type:'book',book:entry.book,loaded:false,learners:true,level:entry.level,minutes:entry.minutes,...(entry.note?{machineNote:entry.note}:{}),home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:root}};
      interactables.push(mesh);ours.push(mesh);books.push(mesh);return mesh;
    }

    // ---------- walking ----------
    function contains(x,z){return x>ROOM.cx-ROOM.w/2&&x<ROOM.cx+ROOM.w/2&&z>ROOM.cz-ROOM.d/2&&z<ROOM.cz+ROOM.d/2}
    function floorAt(x,z){return contains(x,z)?0:null}
    function allowed(x,z){
      if(!contains(x,z))return false;const r=player.radius||.42;
      if(x-r<ROOM.cx-ROOM.w/2+.5||x+r>ROOM.cx+ROOM.w/2-.5||z-r<ROOM.cz-ROOM.d/2+.45||z+r>ROOM.cz+ROOM.d/2-.45)return false;
      return !blockers.some(b=>x+r>b.minX&&x-r<b.maxX&&z+r>b.minZ&&z-r<b.maxZ);
    }

    // ---------- doing things ----------
    function enter(){
      activate();move(ROOM.cx-3.4,ROOM.cz+ROOM.d/2-1.6,0);playSample?.('doorOpen',.8,1.08);
      const hello=greeting();
      showNotice(`${hello?hello+' ':''}The English Reading Room. The shelves go from gentle to challenging, and any book from here opens with word help: tap a word to see what it means.`,9);
      analytics?.track('Room Explored',{room:'learners-room'});
    }
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('learners-'))return false;
      switch(data.type){
        case 'learners-door':through(data,enter);return true;
        case 'learners-exit':through(data,()=>{move(DOOR.x+Math.sin(DOOR.yaw)*1.9,DOOR.z+Math.cos(DOOR.yaw)*1.9,DOOR.yaw+Math.PI);playSample?.('doorOpen',.8,1);showNotice('The west wing again.',3)});return true;
        case 'learners-word':wordHelp?.speak?.(data.word);showNotice(`${data.word}: ${data.meaning}.`,6);return true;
        case 'learners-level':showNotice(`${data.title}: ${data.author} Every book in this room was chosen for readers learning English.`,8);return true;
        case 'learners-notebook':{const list=wordHelp?.notebook?.()||[];showNotice(list.length?`My words (${list.length}): ${list.slice(0,12).map(e=>e.m?`${e.w} (${e.m.split(/[;(]/)[0].trim()})`:e.w).join(' · ')}${list.length>12?' …':''}`:'Your notebook is empty. While reading, tap a word and choose “Save to my words”.',12);return true}
        case 'learners-globe':{root.userData.spin=2.4;sound?.(420,.2,'triangle',.03);const hello=greeting();showNotice(hello&&!/^Welcome/.test(hello)?`${hello} Readers come to this room from all over the world.`:'Readers come to this room from all over the world. Welcome!',5);return true}
      }
      return false;
    }

    // ---------- lifecycle ----------
    function activate(){if(!root)buildRoom();lastNeeded=time}
    function unload(){
      if(!root)return;root.removeFromParent();root=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0;
    }
    function update(t,dt=0){
      time=t;const inside=contains(player.pos.x,player.pos.z),near=Math.hypot(player.pos.x-DOOR.x,player.pos.z-DOOR.z)<PRELOAD;
      if(inside||near)activate();
      else if(root&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==root))unload();
      if(root?.userData.spin>0){root.userData.spin=Math.max(0,root.userData.spin-dt);root.userData.globe.rotation.y+=dt*root.userData.spin*2}
    }
    buildDoor();
    return {contains,floorAt,allowed,interact,update,enter,unload,door:DOOR,room:ROOM,shelves,wordOfTheDay,greeting,get built(){return !!root},get books(){return books.slice()},zoneAt:(x,z)=>contains(x,z)?'learners-room':null};
  };
})();
