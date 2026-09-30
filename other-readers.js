// Traces of other readers. None of them are real: the library simply behaves as if other people had been
// in tonight. A few things are left lying about the Grand Hall and its wings (a cup of tea, a scarf, a
// punched railway ticket, sandy footprints from the boathouse door), a visitors' book by the entrance fills
// with names, and now and then someone can be heard somewhere else in the building.
//
// What is left, and where, changes each day but is the same for everyone on that day. It is all small and
// static: a handful of meshes in the library's existing materials, no lights, and one texture for the page.
(function(){
  'use strict';

  // Places to leave things: tops of tables and desks, and the floor by doors that lead somewhere.
  const TABLES=[
    {x:-15.1,y:1.43,z:14.3,yaw:.2},      // the writing desk
    {x:26.7,y:1.62,z:-2.25,yaw:-.3},     // east wing reading table, near its edges so they can be seen
    {x:29.3,y:1.62,z:-3.75,yaw:2.8},
    {x:-26.7,y:1.62,z:-3.75,yaw:2.6},    // west wing reading table
    {x:-29.3,y:1.62,z:-2.25,yaw:.4}
  ];
  const FLOORS={
    boathouse:{x:-3.1,z:29.6,yaw:0},         // beside the Boathouse door, prints heading into the hall
    stair:{x:-33.5,z:-12.6,yaw:Math.PI}      // in front of the stair that is not on the plan
  };

  // Everything a reader might leave. `on` says where it can go.
  const TRACES=[
    {id:'tea',on:'table',title:'A cup of tea',text:'A cup of tea, still faintly warm. Tucked under the saucer: “Back in five minutes. Please don’t let the cat drink this. — M.”'},
    {id:'spectacles',on:'table',title:'Reading glasses',text:'Reading glasses, folded on an open book. Whoever owns them has underlined one sentence twice and written “yes” beside it.'},
    {id:'scarf',on:'table',title:'A green scarf',text:'A long green scarf, still holding the shape of someone’s shoulders. There is sand in its folds.'},
    {id:'candle',on:'table',title:'A candle stub',text:'A candle burned right down to the saucer. Someone read here very late indeed.'},
    {id:'ticket',on:'table',title:'A railway ticket',text:'A ticket for the night railway, punched once. On the back, in pencil: “Missed my stop on purpose.”'},
    {id:'notebook',on:'table',title:'An open notebook',text:'A notebook left open at a list headed “To read before I am old”. It runs to four pages. The last entry is “everything else”.'},
    {id:'drawing',on:'table',title:'A child’s drawing',text:'A crayon drawing of the library cat, labelled QUILL (ASLEEP). It is a very good likeness.'},
    {id:'flower',on:'table',title:'A pressed violet',text:'A pressed violet, fallen out of some book and left here as if to be put back later. Nobody remembers which book.'},
    {id:'slip',on:'table',title:'A reservation slip',text:'A library slip: “Reserved for Thomas, aged 9. He is coming back for the one with the dragon.”'},
    {id:'knitting',on:'table',title:'Some knitting',text:'Half a sock on four needles, abandoned mid-row. The pattern is pencilled in the margin of a cookery book.'},
    {id:'umbrella',on:'boathouse',title:'A wet umbrella',text:'An umbrella leaning by the Boathouse door, standing in a small puddle. The water tastes of salt.'},
    {id:'sand',on:'boathouse',title:'Sandy footprints',text:'Sandy footprints come in through the Boathouse door and stop halfway across the floor, as if their owner thought better of it.'},
    {id:'dust',on:'stair',title:'Grey footprints',text:'A trail of very fine grey dust leads out from the stair door. It does not look like any dust from Earth.'}
  ];

  // The visitors' book. Invented readers from invented evenings; a few new names each day.
  const VISITORS=[
    ['Aoife','Cork','Came back for the Moon.',16],['Tomasz','Gdańsk','The train waited for me.',164],['Grace','Leeds','Read by the fire until my tea went cold.',1342],
    ['Hamid','Toronto','Found the rabbit. Will not say where.',11],['Nell','Hobart','My grandmother read me this one.',16],['Joseph','Accra','Stayed for one chapter. Stayed for six.',120],
    ['Marguerite','Lyon','The cat ignored me beautifully.',84],['Ruth','Galway','I walked out on to the island and forgot the time.',521],['Iqbal','Leicester','Slid down the stair twice. No regrets.',103],
    ['Freya','Bergen','The rain on the windows sounded like home.',2701],['Declan','Waterford','Borrowed the quiet for an hour.',1342],['Mei','Singapore','Too frightened to finish it in the dark.',345],
    ['Sam and Ellie','Bristol','We took turns reading aloud.',11],['Oluwaseun','Lagos','The librarian said nothing, which was perfect.',84],['Clara','Vienna','Dug up the chest. Kept the secret.',120],
    ['Pádraig','Sligo','Left my scarf. Will be back for it.',521],['Hannah','Melbourne','Went all the way down to the sea under the earth.',164],['Leo','Buenos Aires','Read standing up, like a heron.',2701],
    ['Ines','Porto','A good book and nobody asking me anything.',1342],['Ravi','Pune','I only meant to look.',103],['Bridget','Boston','Read the first line forty times. It is a very good line.',2701],
    ['Kofi','Kumasi','The Moon was quieter than I expected.',16],['Annika','Uppsala','Someone had left me a cup of tea. Or it felt that way.',84],['Oisín','Dublin','Brought my daughter. She wants to live here.',11]
  ];

  window.createOtherReaders=function(options){
    const {THREE,scene,MAT,interactables,canvasTexture,findBook,showNotice,playSample,isQuietMoment=()=>true,today=()=>new Date(),visitorsBook=null}=options;
    const dayKey=()=>today().toISOString().slice(0,10);
    // A small repeatable shuffle, so each day's choice is the same for everyone.
    function seeded(key){let h=2166136261;for(const ch of key){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return()=>{h=Math.imul(h^h>>>15,2246822507);h=Math.imul(h^h>>>13,3266489909);return((h^=h>>>16)>>>0)/4294967296}}
    const shuffle=(list,rand)=>{const out=list.slice();for(let i=out.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out};

    // ---- what is left tonight
    function choose(key=dayKey()){
      const rand=seeded('traces:'+key),picked=[],tables=shuffle(TABLES,rand);let used=0;
      for(const trace of shuffle(TRACES,rand)){
        if(picked.length>=5)break;
        if(trace.on==='table'){if(used>=3)continue;picked.push({trace,spot:tables[used++]})}
        else if(!picked.some(p=>p.trace.on===trace.on))picked.push({trace,spot:FLOORS[trace.on]});
      }
      return picked;
    }

    const std=params=>new THREE.MeshStandardMaterial(params);
    const colours={paper:std({color:0xe9dcc0,roughness:.95}),china:std({color:0xf1ece2,roughness:.4}),tea:std({color:0x6b3d1d,roughness:.2}),green:std({color:0x2e5b3a,roughness:.9}),wax:std({color:0xefe2c2,roughness:.7}),
      violet:std({color:0x6b4a9c,roughness:.8}),wool:std({color:0xa8483c,roughness:1}),metal:std({color:0x2b2b2b,roughness:.4,metalness:.5}),brolly:std({color:0x1f2a3a,roughness:.7}),ticket:std({color:0xd8b86a,roughness:.9})};
    const flameMaterial=new THREE.MeshBasicMaterial({color:0xffc062});
    function part(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,m,x,y,z,p)=>part(new THREE.BoxGeometry(w,h,d),m,x,y,z,p);
    const cyl=(r1,r2,h,m,x,y,z,p,seg=12)=>part(new THREE.CylinderGeometry(r1,r2,h,seg),m,x,y,z,p);
    let printTexture=null;
    function prints(g,colour,count,step){
      printTexture=printTexture||canvasTexture((c,W,H)=>{c.clearRect(0,0,W,H);c.fillStyle='rgba(255,255,255,.75)';c.beginPath();c.ellipse(W/2,H*.62,W*.26,H*.3,0,0,7);c.fill();c.beginPath();c.ellipse(W/2,H*.24,W*.22,H*.16,0,0,7);c.fill()},64,96);
      const material=new THREE.MeshBasicMaterial({map:printTexture,transparent:true,depthWrite:false,color:colour,opacity:.8});
      for(let i=0;i<count;i++){const p=part(new THREE.PlaneGeometry(.18,.3),material,(i%2?.16:-.16),.045,-i*step,g);p.rotation.x=-Math.PI/2}
    }
    const BUILDERS={
      tea(g){cyl(.16,.16,.02,colours.china,0,.01,0,g,16);cyl(.07,.055,.1,colours.china,0,.07,0,g);cyl(.062,.062,.005,colours.tea,0,.115,0,g);box(.14,.004,.1,colours.paper,.2,.004,.08,g).rotation.y=.4},
      spectacles(g){for(const side of [-1,1])box(.34,.03,.5,colours.paper,side*.18,.02,0,g).rotation.z=side*-.06;for(const x of [-.07,.07]){const lens=part(new THREE.TorusGeometry(.045,.007,6,16),colours.metal,x,.06,0,g);lens.rotation.x=-Math.PI/2}},
      scarf(g){box(.26,.03,1.1,colours.green,0,.02,0,g);const tail=box(.26,.5,.03,colours.green,0,-.23,.56,g);tail.rotation.x=.12},
      candle(g){cyl(.12,.12,.02,colours.china,0,.01,0,g,14);cyl(.035,.035,.06,colours.wax,0,.05,0,g);part(new THREE.ConeGeometry(.018,.05,6),flameMaterial,0,.105,0,g)},
      ticket(g){box(.22,.004,.1,colours.ticket,0,.003,0,g)},
      notebook(g){box(.3,.02,.42,colours.paper,0,.01,0,g);const pencil=cyl(.008,.008,.34,colours.ticket,.22,.02,0,g,6);pencil.rotation.x=Math.PI/2},
      drawing(g){const map=canvasTexture((c,W,H)=>{c.fillStyle='#f3ecda';c.fillRect(0,0,W,H);c.strokeStyle='#2b2b2b';c.lineWidth=5;c.beginPath();c.ellipse(W/2,H*.62,W*.28,H*.2,0,0,7);c.stroke();c.beginPath();c.arc(W*.3,H*.42,W*.12,0,7);c.stroke();c.beginPath();c.moveTo(W*.22,H*.33);c.lineTo(W*.25,H*.22);c.lineTo(W*.29,H*.31);c.moveTo(W*.32,H*.31);c.lineTo(W*.37,H*.22);c.lineTo(W*.39,H*.33);c.stroke();c.fillStyle='#d9822b';c.font='bold 26px Comic Sans MS, cursive';c.textAlign='center';c.fillText('QUILL (ASLEEP)',W/2,H*.92)},256,256);
        const sheet=part(new THREE.PlaneGeometry(.36,.36),std({map,roughness:1}),0,.004,0,g);sheet.rotation.x=-Math.PI/2},
      flower(g){part(new THREE.SphereGeometry(.03,8,6),colours.violet,0,.015,0,g).scale.y=.3;const stem=cyl(.004,.004,.16,colours.green,0,.006,.09,g,4);stem.rotation.x=Math.PI/2},
      slip(g){box(.1,.003,.2,colours.paper,0,.002,0,g)},
      knitting(g){part(new THREE.SphereGeometry(.07,10,8),colours.wool,0,.06,0,g);for(const a of [-.4,.1,.6]){const n=cyl(.005,.005,.36,colours.metal,.1,.03,0,g,5);n.rotation.set(Math.PI/2,0,a)}box(.16,.02,.12,colours.wool,.1,.02,.02,g)},
      umbrella(g){const shaft=cyl(.012,.012,.9,colours.metal,0,.48,0,g,6);shaft.rotation.z=.18;const canopy=part(new THREE.ConeGeometry(.09,.7,8),colours.brolly,-.06,.42,0,g);canopy.rotation.z=.18+Math.PI;part(new THREE.CircleGeometry(.35,16),std({color:0x1d2d33,roughness:.1,metalness:.2}),0,.04,0,g).rotation.x=-Math.PI/2},
      sand(g){prints(g,0xa98552,6,.55)},
      dust(g){prints(g,0x9ea2a6,6,.6)}
    };

    const group=new THREE.Group();group.name='other-readers';scene.add(group);
    const tonight=choose();
    for(const {trace,spot} of tonight){
      const g=new THREE.Group();g.position.set(spot.x,spot.y||0,spot.z);g.rotation.y=spot.yaw||0;if(spot.y)g.scale.setScalar(1.5);group.add(g);BUILDERS[trace.id](g);
      // A generous invisible handle, so small things are easy to point at.
      const handle=part(new THREE.BoxGeometry(.7,.35,.7),new THREE.MeshBasicMaterial({visible:false}),0,.15,0,g);
      handle.userData={type:'reader-trace',id:trace.id,title:trace.title,author:'Left by another reader.',action:'LOOK',text:trace.text};interactables.push(handle);
    }

    // ---- the visitors' book on a lectern by the entrance
    function entries(key=dayKey()){
      const rand=seeded('visitors:'+key),out=[],base=new Date(key+'T12:00:00Z');
      for(const [i,visitor] of shuffle(VISITORS,rand).slice(0,6).entries()){
        const book=findBook(visitor[3]);const date=new Date(base.getTime()-Math.floor(i/2)*86400000);
        out.push({name:visitor[0],place:visitor[1],note:visitor[2],book:book?.title||null,date:date.toLocaleDateString('en-GB',{day:'numeric',month:'long',timeZone:'UTC'})});
      }
      return out;
    }
    // Once the real visitors' book is set up (visitors-book.js), the lectern shows real signatures and can be signed;
    // until then it holds the invented entries above.
    const signed=entries();let shown=visitorsBook?[]:signed;
    function drawPage(c,W,H){
      c.fillStyle='#efe4c8';c.fillRect(0,0,W,H);c.fillStyle='rgba(120,90,50,.18)';c.fillRect(W/2-3,0,6,H);
      c.fillStyle='#3a2a1a';c.textAlign='center';c.font='bold 22px Georgia';c.fillText('VISITORS',W/4,40);c.fillText(visitorsBook?'— sign the book —':'— tonight —',W*.75,40);
      if(!shown.length){c.font='italic 22px Georgia';c.fillStyle='#4a3a28';c.fillText('Be the first to sign.',W/4,190);return}
      c.textAlign='left';shown.slice(0,6).forEach((entry,i)=>{const x=i<3?26:W/2+22,y=86+(i%3)*104;c.font='italic 20px Georgia';c.fillStyle='#2c3e66';c.fillText(`${entry.name}, ${entry.place}`.slice(0,30),x,y);c.font='16px Georgia';c.fillStyle='#4a3a28';
        const words=`“${entry.note}”`.split(' ');let line='',row=0;for(const w of words){if(c.measureText(line+w).width>W/2-54){c.fillText(line,x,y+24+row*20);line='';row++}line+=w+' '}c.fillText(line,x,y+24+row*20);
        if(entry.book){c.font='italic 14px Georgia';c.fillStyle='#7a5a38';c.fillText(entry.book.length>34?entry.book.slice(0,33)+'…':entry.book,x,y+70)}});
    }
    const pageMap=canvasTexture(drawPage,640,400);
    if(visitorsBook){
      visitorsBook.onChange(list=>{shown=list;const canvas=pageMap?.image;if(canvas?.getContext){drawPage(canvas.getContext('2d'),canvas.width,canvas.height);pageMap.needsUpdate=true}});
      setTimeout(()=>visitorsBook.refresh().catch(()=>{}),6000);
    }
    const lectern=new THREE.Group();lectern.position.set(4.5,0,29.7);lectern.rotation.y=Math.PI;scene.add(lectern);
    box(.5,1.05,.4,MAT.darkWood,0,.52,0,lectern);box(.9,.06,.7,MAT.darkWood,0,.08,0,lectern);
    const desk=box(.86,.05,.58,MAT.darkWood,0,1.12,.02,lectern);desk.rotation.x=.32;
    // The open pages glow a little, as if a reading lamp were on them, so the book catches the eye from the hall.
    const pages=part(new THREE.PlaneGeometry(.8,.5),std({map:pageMap,color:0x9e9582,roughness:1,emissive:0xffffff,emissiveMap:pageMap,emissiveIntensity:.28}),0,1.155,.03,lectern);pages.rotation.x=-Math.PI/2+.32;
    const pen=cyl(.006,.006,.2,colours.metal,.3,1.17,-.1,lectern,5);pen.rotation.set(Math.PI/2+.32,0,.6);
    let page=0;
    const bookData={type:'reader-trace',id:'visitors-book',title:'The visitors’ book',author:visitorsBook?'Signed by readers from all over the world. Add your name.':'Signed by readers who came in after dark.',action:visitorsBook?'READ & SIGN':'READ'};
    // A lit sign on a brass stand beside the lectern, so nobody walks past the book without noticing it.
    const signMap=canvasTexture((c,W,H)=>{c.fillStyle='#24170d';c.fillRect(0,0,W,H);c.strokeStyle='#d7ae60';c.lineWidth=8;c.strokeRect(8,8,W-16,H-16);c.lineWidth=2;c.strokeRect(20,20,W-40,H-40);
      c.fillStyle='#ffe2a0';c.textAlign='center';c.font='bold 46px Georgia';c.fillText('THE VISITORS’ BOOK',W/2,92);c.fillStyle='#d7ae60';c.fillRect(W/2-90,112,180,3);
      c.fillStyle='#f3dcae';c.font='italic 30px Georgia';
      const lines=visitorsBook?['Please sign your name','and tell us where you are reading from']:['Read the names of readers','who came in after dark'];lines.forEach((line,i)=>c.fillText(line,W/2,168+i*40));
      c.font='34px Georgia';c.fillStyle='#d7ae60';c.fillText('✒',W/2,H-34)},640,300);
    const stand=new THREE.Group();stand.position.set(-.95,0,.05);lectern.add(stand);
    const signMaterial=std({map:signMap,emissive:0xffffff,emissiveMap:signMap,emissiveIntensity:.55,roughness:.8});
    cyl(.025,.025,1.7,colours.metal,0,.85,0,stand,8);cyl(.2,.24,.04,colours.metal,0,.02,0,stand,16);
    const board=box(1.04,.52,.04,MAT.darkWood,0,1.86,0,stand);board.rotation.x=-.12;
    const sign=part(new THREE.PlaneGeometry(.96,.45),signMaterial,0,1.865,.025,stand);sign.rotation.x=-.12;
    // And a larger plaque on the wall above, which can be read from across the Grand Hall.
    const plaqueMap=canvasTexture((c,W,H)=>{c.fillStyle='#24170d';c.fillRect(0,0,W,H);c.strokeStyle='#d7ae60';c.lineWidth=10;c.strokeRect(10,10,W-20,H-20);
      c.fillStyle='#ffe2a0';c.textAlign='center';c.font='bold 64px Georgia';c.fillText(visitorsBook?'PLEASE SIGN THE VISITORS’ BOOK':'THE VISITORS’ BOOK',W/2,H/2+10);
      c.fillStyle='#d7ae60';c.font='italic 30px Georgia';c.fillText(visitorsBook?'Readers from every corner of the world have signed ↓':'Readers who came in after dark ↓',W/2,H-40)},1280,220);
    box(2.5,.48,.06,MAT.darkWood,0,3.05,-.68,lectern);
    const plaque=part(new THREE.PlaneGeometry(2.4,.41),std({map:plaqueMap,emissive:0xffffff,emissiveMap:plaqueMap,emissiveIntensity:.6,roughness:.8}),0,3.05,-.645,lectern);
    for(const m of [pages,desk,board,sign,plaque]){m.userData=bookData;interactables.push(m)}

    function interact(object){
      const data=object?.userData;if(data?.type!=='reader-trace')return false;
      if(data.id==='visitors-book'&&visitorsBook){visitorsBook.open();playSample?.('pageTurn',.5,.95);return true}
      if(data.id==='visitors-book'){const entry=signed[page++%signed.length];showNotice(`${entry.date} — ${entry.name}, ${entry.place}: “${entry.note}”${entry.book?` (${entry.book})`:''}`,7);playSample?.('pageTurn',.5,.95);return true}
      showNotice(data.text,8);return true;
    }

    // ---- someone else, somewhere in the building
    const SOUNDS=[
      ()=>{for(let i=0;i<5;i++)setTimeout(()=>playSample?.('woodStep'+(i%3),.22,.86),i*560)},
      ()=>playSample?.('pageTurn',.18,.92),
      ()=>playSample?.('floorboardCreak',.35,.9),
      ()=>playSample?.('doorOpen',.14,.9),
      ()=>{playSample?.('pageTurn',.14,.95);setTimeout(()=>playSample?.('pageTurn',.12,.9),1400)}
    ];
    let wait=40+Math.random()*50;
    function update(dt){
      wait-=dt;if(wait>0)return;
      wait=55+Math.random()*95;
      if(isQuietMoment())SOUNDS[Math.floor(Math.random()*SOUNDS.length)]();
    }

    return {interact,update,tonight:tonight.map(p=>p.trace.id),signed,choose,entries,group};
  };
})();
