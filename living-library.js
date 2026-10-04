// Small, local memories: invented paper trails, return slips and conversations.
// A trail only remembers clues actually examined, in order. No timer or quest list.
(function(){
  'use strict';
  const KEY='athenaeum-library-memory-v1';
  const TRAILS=[
    {id:'unaddressed',title:'The parcel with no address',steps:[
      {event:'sorting-slip',title:'A parcel held for the librarian',text:'A sorting slip, tied with green thread: “No address. Try the Bellman’s map in the Map Room, through the door in the west wing’s north wall. A blank sea ought to leave room for a railway.”'},
      {event:'map-snark',title:'Green thread at the edge of the sea',text:'Tucked behind the Bellman’s blank chart: “The parcel went by the night railway. Ask its conductor for the Signal House; the signalman kept the receipt in his ledger.”'},
      {event:'signal-ledger',title:'The signalman’s receipt',text:'A green-threaded receipt lies between the ledger’s pages: “Delivered to a reader, not an address. Find Mugby Junction among the railway books here. The warning was meant to be read.”'},
      {event:'read-27924',title:'The parcel is opened',text:'The green thread has led to Mugby Junction. On the back of the receipt: “A story is a warning that can arrive in time. Keep the book as long as you need it.” The parcel was always waiting for a reader.'}
    ]},
    {id:'long-way',title:'The reader who took the long way',steps:[
      {event:'returns-letter',title:'A salt-marked return slip',text:'Beneath the return slips: “I took the long way back. My luggage is still in Departures, through the east wing’s service door. Look for the label on the cases. — M.”'},
      {event:'departures-label',title:'A label without a destination',text:'On the luggage label: “The island was not on my ticket. Find its map in the Map Room, through the door in the west wing’s north wall. Look for Treasure Island. — M.”'},
      {event:'map-treasure-island',title:'The island on the paper',text:'Pencilled on a loose slip beside the map: “I came for the treasure and stayed for the telling. Treasure Island waits among this room’s books of imaginary lands. Start there. — M.”'},
      {event:'read-120',title:'The long way home',text:'Inside the imagined traveller’s last letter: “There was no treasure to bring back but the story. I left that where the next reader could find it.” You have followed M. home to Treasure Island.'}
    ]}
  ];
  const RETURNS=[
    [614,'Recovered from the balloon basket. A cloud was pressed between the pages.'],
    [1874,'Left in the reading carriage. The ticket inside was never punched.'],
    [120,'Returned with salt in the binding. Please shake gently.'],
    [11,'Found beside a door that has since become smaller.'],
    [16,'Returned after the reader outgrew the handwriting on the slip.'],
    [84,'Delivered during a thunderstorm. The string was still warm.'],
    [27924,'Sent back from the Signal House. The receipt bears no hour.'],
    [2701,'Found dry beside an open window in very wet weather.']
  ];

  window.createLibraryMemory=function({storage,books}){
    const read=key=>{try{return storage?.getItem(key)}catch(e){return null}};
    const write=(key,value)=>{try{storage?.setItem(key,value)}catch(e){/* Private browsing still gets this visit's story. */}};
    let saved;try{saved=JSON.parse(read(KEY)||'{}')}catch(e){}
    if(!saved||typeof saved!=='object'||Array.isArray(saved))saved={};
    // Only restore consecutive, recognised clues; malformed saves never unlock later pages.
    const clues=new Set();for(const trail of TRAILS)for(const step of trail.steps){if(!Array.isArray(saved.clues)||!saved.clues.includes(step.event))break;clues.add(step.event)}
    const heard=new Set(Array.isArray(saved.heard)?saved.heard.filter(x=>typeof x==='string'):[]);
    const visit=Number.isSafeInteger(saved.visit)&&saved.visit>=0&&saved.visit<1000000?saved.visit+1:1;
    const save=()=>write(KEY,JSON.stringify({visit,clues:[...clues],heard:[...heard]}));save();
    function encounter(event){
      for(const trail of TRAILS){const index=trail.steps.findIndex(step=>step.event===event);if(index<0)continue;
        if(index>0&&!clues.has(trail.steps[index-1].event))return null;
        const fresh=!clues.has(event);clues.add(event);if(fresh)save();
        return {...trail.steps[index],trail:trail.title,fresh,complete:index===trail.steps.length-1};
      }return null;
    }
    function journal(){return TRAILS.map(trail=>({id:trail.id,title:trail.title,entries:trail.steps.filter(step=>clues.has(step.event)),complete:clues.has(trail.steps.at(-1).event)})).filter(trail=>trail.entries.length)}
    function returnSlips(){const pool=RETURNS.filter(([id])=>books.some(book=>book.id===id));if(!pool.length)return [];
      return Array.from({length:Math.min(3,pool.length)},(_,i)=>{const [id,text]=pool[((visit-1)*3+i)%pool.length];return {book:books.find(book=>book.id===id),text}});
    }
    function unfinished(){
      return books.map(book=>{let progress;try{progress=JSON.parse(read('athenaeum-progress-'+book.id)||'null')}catch(e){}
        const valid=progress&&Number.isFinite(progress.p)&&progress.p>=0&&progress.p<.95&&Number.isFinite(progress.n)&&progress.n>1;
        return valid&&book.progress<.95?{book,time:Number.isFinite(progress.t)?progress.t:0}:null;
      }).filter(Boolean).sort((a,b)=>b.time-a.time).map(item=>item.book);
    }
    function conversations(explored){
      const hint=()=>!explored.has('map-room')?'There is a door in the west wing’s north wall. Its maps are worth looking at closely.':!explored.has('periodicals-room')?'Beneath the entrance clock, the Periodicals Room keeps a press that still has work to do.':!explored.has('antipodes')?'The great globe in the Grand Hall has more to offer than a view of the surface.':'Take a look at the return slips. A journey sometimes leaves its paperwork behind.';
      const found=[];
      if(read('athenaeum-kells-found')==='1')found.push({id:'kells',label:'About the book under the turf',text:'You found the facsimile under the turf. I had wondered whether anyone would notice that sod. Some books deserve to be looked at as carefully as they are read. '+hint()});
      if(explored.has('antipodes'))found.push({id:'antipodes',label:'About the journey through the Earth',text:'Back from the Antipodes? You have taken the longest possible shortcut. I hope you gave the southern stars a little of your time. '+hint()});
      if(explored.has('map-room'))found.push({id:'maps',label:'About the maps I found',text:'You have seen our maps, then. The blank one has caused fewer disputes than most. There is sometimes a loose slip at its edge; the Sorting Room may explain whose it is.'});
      for(const trail of journal().filter(t=>t.complete))found.push({id:trail.id,label:'About '+trail.title.toLowerCase(),text:trail.id==='unaddressed'?'So the parcel found its reader. The sorting staff will be delighted; they dislike leaving a story undelivered. Keep the receipt in your journal.':'M. always did take the long way. I am glad someone followed the paper trail all the way into the book. That is where a traveller’s story ought to end.'});
      return found;
    }
    function greeting(explored){const next=conversations(explored).find(item=>!heard.has(item.id));if(!next)return null;heard.add(next.id);save();return next.text}
    return {encounter,journal,returnSlips,unfinished,conversations,greeting,visit};
  };

  // Original library bindings, not claimed reproductions of historic editions.
  // Seven complete texts already held locally: no new downloads or renderer lights.
  window.createHiddenEditions=function({THREE,scene,MAT,books,interactables,canvasTexture,collider}){
    const editions=[
      {id:174,room:'portrait',x:21.2,z:17.25,floor:5,colour:'#213b32',motif:'mirror',note:'A painted likeness keeps what its sitter conceals. Wilde’s story belongs behind a portrait: beauty is the invitation, and the hidden cost is the subject.'},
      {id:1952,room:'portrait',x:24,z:17.25,floor:5,colour:'#655024',motif:'vine',note:'A room’s decoration becomes something to read, mistrust and struggle against. Look again at the wall you have just passed through; Gilman’s short story makes a familiar interior deeply strange.'},
      {id:8492,room:'portrait',x:26.7,z:17.25,floor:5,colour:'#483244',motif:'mask',note:'Artists, an unsettling play and the suggestion of a world behind this one. The early tales in Chambers’s collection make this private room feel less safely sealed than it first appeared.'},
      {id:10002,room:'tunnel',x:-54.2,z:-4.55,floor:0,colour:'#253c42',motif:'door',note:'A house stands where ordinary space gives way. Hodgson’s strange manuscript is a fitting first discovery beyond a wall that should have stayed solid.'},
      {id:456,room:'tunnel',x:-57,z:-4.55,floor:0,colour:'#263e2d',motif:'door',note:'A door in an ordinary wall opens onto an extraordinary possibility. Wells asks what happens when a person spends a life remembering the threshold they once crossed.'},
      {id:28174,room:'archive',x:-67,z:-2.6,floor:0,colour:'#493020',motif:'vine',note:'The final room keeps a book about the making of a private library. After all those concealed thresholds, Humphreys turns the question back to you: what makes a collection worth keeping?'},
      {id:900002,room:'tunnel',x:-59.8,z:-4.55,floor:0,colour:'#302d51',motif:'stars',note:'The passage has led from a hidden house to a hidden door, and now to another world. Lindsay’s unsettling voyage makes the reward a stranger question, rather than a familiar answer.'}
    ];
    function drawCover(c,w,h,edition,book){
      const gold='#ddbd78',light='#f5e1b4';c.fillStyle=edition.colour;c.fillRect(0,0,w,h);
      const shade=c.createLinearGradient(0,0,w,0);shade.addColorStop(0,'#100e0d');shade.addColorStop(.1,'rgba(0,0,0,0)');shade.addColorStop(.9,'rgba(0,0,0,0)');shade.addColorStop(1,'rgba(0,0,0,.4)');c.fillStyle=shade;c.fillRect(0,0,w,h);
      c.strokeStyle=gold;for(const [inset,width] of [[18,4],[28,1],[41,2]]){c.lineWidth=width;c.strokeRect(inset,inset,w-2*inset,h-2*inset)}
      for(const x of [55,w-55])for(const y of [55,h-55]){c.save();c.translate(x,y);c.rotate(Math.PI/4);c.strokeRect(-9,-9,18,18);c.restore()}
      c.fillStyle=gold;c.textAlign='center';c.font='17px Georgia';c.fillText(edition.room==='portrait'?'BEHIND THE PORTRAIT':'BEYOND THE BREATHING WALL',w/2,78);
      function lines(text,y,font,width,step){c.font=font;let line='';for(const word of text.split(' ')){if(c.measureText(line+word).width>width){c.fillText(line.trim(),w/2,y);line='';y+=step}line+=word+' '}c.fillText(line.trim(),w/2,y)}
      c.fillStyle=light;lines(book.title,135,'bold 30px Georgia',w-112,36);
      c.strokeStyle=gold;c.lineWidth=2;c.save();c.translate(w/2,340);
      if(edition.motif==='mirror'||edition.motif==='mask'){
        for(const r of [0,9,15]){c.beginPath();c.ellipse(0,0,57+r,75+r,0,0,Math.PI*2);c.stroke()}
        if(edition.motif==='mirror'){c.beginPath();c.moveTo(22,-58);c.lineTo(-12,-8);c.lineTo(14,10);c.lineTo(-22,62);c.stroke()}
        else{for(const x of [-23,23]){c.beginPath();c.ellipse(x,-10,12,6,0,0,Math.PI*2);c.stroke()}c.beginPath();c.arc(0,20,25,.2,Math.PI-.2);c.stroke()}
      }else if(edition.motif==='door'){
        c.strokeRect(-53,-63,106,140);c.beginPath();c.arc(0,-63,53,Math.PI,0);c.stroke();c.strokeRect(-40,-60,80,125);c.beginPath();c.moveTo(-40,-60);c.lineTo(10,-40);c.lineTo(10,65);c.stroke();c.beginPath();c.arc(1,13,3,0,Math.PI*2);c.stroke();
        for(let i=0;i<5;i++){c.beginPath();c.moveTo(-60-i*8,82+i*9);c.lineTo(60+i*8,82+i*9);c.stroke()}
      }else if(edition.motif==='vine'){
        for(const side of [-1,1]){c.beginPath();c.moveTo(0,80);c.bezierCurveTo(side*110,20,-side*20,-45,side*38,-85);c.stroke();for(let i=0;i<5;i++){c.beginPath();c.ellipse(side*(28+i%2*15),50-i*27,20,7,side*.7,0,Math.PI*2);c.stroke()}}
      }else{
        for(const r of [26,53,80]){c.beginPath();c.ellipse(0,0,r,r*.42,-.4,0,Math.PI*2);c.stroke()}for(const [x,y] of [[0,0],[-55,-56],[69,24],[-29,71],[48,-77]]){c.beginPath();c.moveTo(x-7,y);c.lineTo(x+7,y);c.moveTo(x,y-7);c.lineTo(x,y+7);c.stroke()}
      }c.restore();c.fillStyle=light;lines(book.author,h-92,'italic 21px Georgia',w-110,25);c.fillStyle=gold;c.font='14px Georgia';c.fillText('THE LIBRARY’S SECRET SHELVES',w/2,h-48);
    }
    const meshes=[];
    for(const edition of editions){const book=books.find(b=>b.id===edition.id);if(!book)continue;
      const {x,z,floor}=edition,stand=new THREE.Group();stand.position.set(x,floor,z);scene.add(stand);
      const part=(w,h,d,mat,px,py,pz)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(px,py,pz);stand.add(m);return m};
      part(1.6,.13,.72,MAT.darkWood,0,.83,0);part(1.42,.07,.6,MAT.fabric,0,.925,0);for(const sx of [-.63,.63])part(.12,.82,.5,MAT.wood,sx,.41,0);part(1.65,.045,.045,MAT.brass,0,.91,.36);
      collider(x,z,1.75,.82,'secret book stand',floor-.1,floor+2.4);
      const texture=canvasTexture((c,w,h)=>drawCover(c,w,h,edition,book),384,560);book.secretBindingTexture=texture;book.machineNote=edition.note;
      const bm=new THREE.Mesh(new THREE.BoxGeometry(1.25,1.65,.22),new THREE.MeshStandardMaterial({map:texture,roughness:.58,metalness:.16}));bm.position.set(x,floor+1.54,z);bm.rotation.x=-.15;bm.scale.setScalar(.68);scene.add(bm);
      bm.userData={type:'book',book,loaded:true,realCover:true,customBinding:true,hiddenReward:edition.room,machineNote:edition.note,home:{parent:scene,position:bm.position.clone(),quaternion:bm.quaternion.clone(),scale:.68}};
      // Narrow gilt page edges and five raised spine bands; these move with the book.
      for(const [w,h,d,px,py,pz] of [[.035,1.5,.14,.62,0,0],[1.15,.025,.14,0,.81,0],[1.15,.025,.14,0,-.81,0],...[-.6,-.3,0,.3,.6].map(y=>[.055,.035,.24,-.61,y,0])]){const trim=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),MAT.brass);trim.position.set(px,py,pz);trim.userData.bindingTrim=true;bm.add(trim)}
      const cardTexture=canvasTexture((c,w,h)=>{c.fillStyle='#e6d6b5';c.fillRect(0,0,w,h);c.fillStyle='#3d2a1d';c.textAlign='center';c.font='bold 22px Georgia';c.fillText('WHY THIS BOOK IS HIDDEN HERE',w/2,35);c.font='italic 18px Georgia';c.fillText('A note from the librarian',w/2,66)},512,90);
      const card=part(1.5,.26,.04,new THREE.MeshStandardMaterial({map:cardTexture,roughness:1}),0,.66,.39);card.userData={type:'object',title:book.title,author:edition.note+' The gilt binding was designed for this library.',action:'READ NOTE'};
      interactables.push(bm,card);meshes.push(bm);
    }
    return {editions,meshes};
  };
})();
