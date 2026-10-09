// The Map Room: a room off the west wing, behind a door in its north wall, hung edge to edge with old maps of the world
// (public-domain images from Wikimedia Commons, fetched by scripts/fetch-maps.mjs into assets/maps). Any map can be
// taken down and looked at closely in the map viewer, zoomed and panned, with a card on who made it and why it
// matters. Three shelves: voyages of discovery, maps and their makers, and lands that are not on any map. A great
// map table in the middle with two maps that changed things laid on it, and two chairs. Like the other rooms behind
// doors, nothing is built until the reader walks up to it, and it is freed a little while after they leave.
(function(){
  'use strict';

  // Three shelves. The new arrivals for each (data/new-books.js, rooms map-*) are added to the books listed here.
  const GROUPS=[
    {key:'voyages',name:'VOYAGES OF DISCOVERY',sub:'The journeys the maps were made from',ids:[10636,8106,24777]},
    {key:'makers',name:'MAPS AND THEIR MAKERS',sub:'Geographers, surveyors and the history of the map',ids:[]},
    {key:'lands',name:'NOT ON ANY MAP',sub:'Imaginary lands, most of them with maps',ids:[120,2166,829,2130,13,12,16,1906,201,55,139]}
  ];
  const RECORDS={10636:['The Travels of Marco Polo — Volume 1','Marco Polo'],8106:['Captain Cook’s Journal During His First Voyage Round the World','James Cook'],24777:['Celebrated Travels and Travellers, Part 1','Jules Verne'],
    120:['Treasure Island','Robert Louis Stevenson'],2166:['King Solomon’s Mines','H. Rider Haggard'],829:['Gulliver’s Travels','Jonathan Swift'],2130:['Utopia','Thomas More'],13:['The Hunting of the Snark','Lewis Carroll'],
    12:['Through the Looking-Glass','Lewis Carroll'],16:['Peter Pan','J. M. Barrie'],1906:['Erewhon','Samuel Butler'],201:['Flatland','Edwin A. Abbott'],55:['The Wonderful Wizard of Oz','L. Frank Baum'],139:['The Lost World','Arthur Conan Doyle']};

  // The maps: [title, maker and date, the card]. Their images are assets/maps/<key>.jpg (and <key>-wall.jpg for the
  // frame); assets/maps/maps.json says which Commons file each is, who made it and its licence.
  const MAPS={
    mercator:['A new and enlarged description of the Earth','Gerardus Mercator, Duisburg, 1569','Mercator drew it for sailors: on his projection a course of constant compass bearing is a straight line, which is worth a great deal at sea. The price is that the far north and south are stretched, so Greenland looks as big as Africa, which is about fourteen times larger. It was engraved on eighteen sheets, and most of the maps on phones still use his projection.'],
    waldseemuller:['Universalis Cosmographia','Martin Waldseemüller, Saint-Dié, 1507','The first map to give the New World the name America, after Amerigo Vespucci, whose letters Waldseemüller had read. A thousand copies are thought to have been printed and only one survives; the Library of Congress bought it in 2003 for ten million dollars. Waldseemüller left the name off his later maps, but by then it had caught on.'],
    hondius:['A new map of the whole world, by land and sea','Hendrik Hondius, Amsterdam, 1630','Published in Amsterdam when the Dutch were the finest mapmakers in Europe, it shows the world in two hemispheres. In the corners are portraits of Julius Caesar, Ptolemy, Mercator and the mapmaker’s father, Jodocus Hondius. It was also the first dated map in an atlas to show any part of Australia, a few stretches of coast the Dutch ships had found.'],
    ortelius:['Typus Orbis Terrarum','Abraham Ortelius, Antwerp, 1570','The world map from Ortelius’s Theatrum Orbis Terrarum, usually called the first modern atlas: maps of one size and style, bound together as a book. Along the bottom runs a vast southern continent, Terra Australis, marked as not yet known, which was honest. Ortelius later wondered whether the Americas had once been joined to Europe and Africa, three centuries before anyone could say why.'],
    ptolemy:['The world according to Ptolemy','After Claudius Ptolemy; printed at Ulm, 1482','In about 150 AD Ptolemy, working in Alexandria, listed some eight thousand places by latitude and longitude, so that anyone could draw the world from his tables. No map from his own time survives; this one was drawn from them thirteen centuries later, when his Geography had been rediscovered in the West. The Indian Ocean is a closed lake and Asia runs on far too long, which encouraged Columbus.'],
    hereford:['The Hereford Mappa Mundi','Made about 1300; it names Richard of Haldingham','Drawn on a single calf skin about a metre and a half high, it is the largest medieval map to survive, and it still hangs in Hereford Cathedral. Jerusalem is at the centre and east is at the top, with Paradise, and the world is full of history, scripture and strange peoples. Europe and Africa are labelled the wrong way round, which is a comfort to anyone who has ever made a map.'],
    'piri-reis':['The Piri Reis map','Piri Reis, Gallipoli, 1513','Piri Reis, an Ottoman admiral, drew this world map on parchment in 1513, and only its western part survives, with the Atlantic coasts of Europe, Africa and South America. His notes on it say he worked from about twenty older maps, among them one by Columbus that is now lost. It was found in the Topkapı Palace in Istanbul in 1929, while the palace was being made into a museum.'],
    idrisi:['The Tabula Rogeriana','Muhammad al-Idrisi, Palermo, 1154','Al-Idrisi, a geographer from Ceuta, made his map of the world for King Roger II of Sicily, with a book about it called The Pleasure of Him Who Longs to Cross the Horizons. As on most Arab maps of the time, south is at the top. It survives in later copies of the book as seventy regional maps; this is Konrad Miller’s copy of the 1920s, which puts them together as one, with the names written out in the Latin alphabet.'],
    catalan:['The Catalan Atlas','Attributed to Abraham Cresques, Majorca, 1375','Made on Majorca and sent to King Charles V of France, it is one of the most splendid maps of the Middle Ages, painted on leaves of vellum. In West Africa sits Mansa Musa, king of Mali, holding up a nugget of gold; his pilgrimage to Mecca half a century before had made Mali famous for its wealth. Timbuktu is marked near him.'],
    ricci:['A map of the myriad countries of the world','Matteo Ricci with Li Zhizao, Beijing, 1602; a later coloured copy, made in Japan','Matteo Ricci, an Italian Jesuit, made it in Beijing with the scholar Li Zhizao, with China near the middle and the Americas at the right, for the first time on a Chinese map. It was printed from wooden blocks on six large panels, and the Wanli Emperor had copies made. Its notes, in Chinese, describe the lands and peoples of the world and explain, politely, that the earth is round.'],
    pacific:['Maris Pacifici','Abraham Ortelius, Antwerp, 1589','The first printed map of the Pacific Ocean on its own, made by Ortelius from Spanish and Portuguese sources. Magellan’s ship the Victoria sails across it, the only one of his five ships to come home. Below lies the great southern land the mapmakers were sure of, not yet discovered, and indeed not there.'],
    'de-la-cosa':['The map of Juan de la Cosa','Juan de la Cosa, 1500','Juan de la Cosa sailed with Columbus, and owned the Santa María, which ran aground off Hispaniola on the first voyage. His map, drawn on two hides joined together, is the oldest to survive that shows the New World. It is kept in the Naval Museum in Madrid, and the new lands on it are painted green.'],
    snow:['Cholera in Soho','John Snow, London, 1854','In the cholera outbreak of 1854 the doctor John Snow marked each death in Soho as a small black bar at its house, and the bars piled up around the water pump in Broad Street. He persuaded the parish to take the handle off the pump, though by then the outbreak was already waning. The map, published the next year, helped to show that cholera is carried in water, not in bad air.'],
    smith:['A delineation of the strata of England and Wales','William Smith, London, 1815','William Smith, a canal surveyor with little schooling, spent years noting which rocks lay under which, and made the first geological map of a whole country, more than two and a half metres tall and coloured by hand. The gentlemen of the Geological Society borrowed his work without much credit, and he was in a debtors’ prison in 1819. In 1831 the same society gave him the first Wollaston Medal.'],
    'speed-ireland':['The Kingdome of Irland','John Speed, London, 1610','From John Speed’s atlas of the British Isles, The Theatre of the Empire of Great Britaine, published in 1611 and 1612. Down the sides stand Irish men and women of different ranks in their dress, as an English mapmaker imagined them. The Irish Room, across the Grand Hall, has the country’s own books.'],
    'treasure-island':['The map of Treasure Island','Robert Louis Stevenson, 1883','One wet summer at Braemar in 1881, Stevenson drew a map of an island with his stepson, and the story of Treasure Island grew out of it. The first map was lost in the post on its way to the publishers, and he had to draw it again to fit the book, which he said was much harder. Billy Bones’s notes in the corner are worth reading closely.'],
    snark:['The Bellman’s map','After Henry Holiday’s chart for Lewis Carroll’s The Hunting of the Snark, 1876','The Bellman had bought a large map representing the sea, without the least vestige of land, and the crew were much pleased to find it a map they could all understand. Henry Holiday drew it for the first edition, and this copy was made for the library from the poem. It is the only map in this room that is entirely accurate.'],
    mars:['A map of Mars','Giovanni Schiaparelli’s map of 1888, from a book of the time','In 1877 the Italian astronomer Giovanni Schiaparelli mapped Mars, naming its seas and lands from classical myth and geography, and crossing them with fine dark lines he called canali, channels. In English they became canals, and Percival Lowell spent years arguing that Martians had dug them. The Reading Room of Helium, on Mars itself, has the rest of the argument.'],
    riccioli:['The Moon','Giovanni Battista Riccioli and Francesco Maria Grimaldi, Bologna, 1651','Two Jesuit astronomers at Bologna drew this map of the Moon for Riccioli’s Almagestum Novum, and named its craters after astronomers and philosophers and its dark plains after the weather. Most of their names are still in use. Apollo 11 came down in their Sea of Tranquillity.'],
    cellarius:['The Copernican system','Andreas Cellarius, Harmonia Macrocosmica, Amsterdam, 1660–61','Andreas Cellarius, a schoolmaster in Hoorn, made the most beautiful celestial atlas of his age. This plate shows the Sun at the centre with the planets around it, as Copernicus had argued; other plates in the same book put the Earth at the centre, so readers could take their pick. It is a map of the heavens, the one map nobody has finished.']
  };
  const CARDS={
    sign:['The Map Room','Maps of the world as it was known, and as it was imagined, from the Middle Ages to the age of the surveyors. Look at any map and it will come down for you to read closely.'],
    glass:['A reading glass','For the small print at the edges of old maps, where the sea monsters live. Any map on these walls can be looked at closely: just look at it.'],
    dividers:['A pair of dividers','Brass map dividers, for walking distances across a chart one step at a time. Set them to a league on the scale and count.'],
    rose:['The compass rose','Painted on the ceiling, as on the old charts: thirty-two points, north marked with a fleur-de-lis, east with a cross for Jerusalem.']};

  // Where each map hangs: the wall, its centre along the wall (offset from the room's middle), its height, and the
  // largest it may be. Each is fitted to its own shape once its image arrives.
  const HANG=[
    // the north wall: the great world maps, in two tiers
    ['mercator','north',0,2.55,5.2,2.9],['waldseemuller','north',-5.7,2.55,4,2.7],['hondius','north',5.7,2.55,4,2.7],
    ['ortelius','north',-4.6,5.05,3.4,1.55],['ptolemy','north',0,5.05,3.4,1.55],['de-la-cosa','north',4.6,5.05,3.4,1.55],
    // the west wall, above the voyages: maps of the oceans and of the world seen from elsewhere
    ['piri-reis','west',-4.2,4.6,2.6,1.8],['catalan','west',-1.4,4.6,2.6,1.8],['pacific','west',1.4,4.6,2.6,1.8],['ricci','west',4.2,4.6,2.6,1.8],
    // the east wall, above the mapmakers: the older ways of drawing the world
    ['hereford','east',-4.2,4.6,2.6,1.8],['idrisi','east',-1.4,4.6,2.6,1.8],['speed-ireland','east',1.4,4.6,2.6,1.8],['cellarius','east',4.2,4.6,2.6,1.8],
    // the south wall, either side of the door, above the lands not on any map
    ['treasure-island','south',-6.2,4.6,2.4,1.8],['snark','south',-3.4,4.6,2.4,1.8],['mars','south',3.4,4.6,2.4,1.8],['riccioli','south',6.2,4.6,2.4,1.8]
  ];
  // Two maps that changed things, laid flat on the map table under glass.
  const TABLE=[['snow',-.95],['smith',.95]];
  const ORDER=[...HANG.map(h=>h[0]),...TABLE.map(t=>t[0])];

  // ---------- the map viewer ----------
  // A page over the library: the map as large as the screen allows, to be zoomed (wheel, pinch, + and −, a double
  // click) and dragged, with its card beside it and arrows to walk round the room's other maps.
  function createViewer({base,manifest,onOpen,onClose,onView}){
    let root=null,img=null,stage=null,caption=null,index=0,open=false,scale=1,x=0,y=0,fitScale=1;
    const pointers=new Map();let pinch=null,drag=null;
    function style(){
      if(document.getElementById('mapViewerStyle'))return;const s=document.createElement('style');s.id='mapViewerStyle';
      s.textContent=`#mapViewer{position:fixed;inset:0;z-index:42;display:grid;grid-template-columns:1fr minmax(260px,340px);background:rgba(8,9,8,.94);color:#e8dcc0;font-family:Georgia,serif}
#mapViewer.hidden{display:none}#mapViewer .mv-stage{position:relative;overflow:hidden;touch-action:none;cursor:grab;background:radial-gradient(circle at 50% 50%,#2a2218,#0b0a08)}
#mapViewer .mv-stage.dragging{cursor:grabbing}#mapViewer img{position:absolute;left:0;top:0;transform-origin:0 0;max-width:none;user-select:none;-webkit-user-drag:none;box-shadow:0 10px 60px #000}
#mapViewer .mv-missing{position:absolute;inset:0;display:grid;place-items:center;padding:30px;text-align:center;font-style:italic;color:#bfae8e}
#mapViewer aside{padding:28px 24px 20px;overflow:auto;border-left:1px solid #5a4528;background:linear-gradient(160deg,#241a10,#121512)}
#mapViewer small{color:#c9a46b;letter-spacing:.2em;font-size:12px}#mapViewer h2{font-weight:normal;font-size:25px;line-height:1.2;color:#f3e3bf;margin:10px 0 6px}
#mapViewer .mv-maker{font-style:italic;color:#cbb58c;margin:0 0 14px}#mapViewer .mv-note{line-height:1.55;margin:0 0 16px}#mapViewer .mv-credit{font-size:13px;color:#a8987a;line-height:1.45}
#mapViewer .mv-credit a{color:#d9b97a}#mapViewer .mv-tools{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}
#mapViewer button{font:inherit;font-size:15px;color:#f0dfbd;background:#2c2014;border:1px solid #9a7a48;border-radius:3px;padding:7px 12px;cursor:pointer}#mapViewer button:hover,#mapViewer button:focus-visible{background:#4a3520;outline:none}
#mapViewer .mv-close{position:absolute;top:10px;right:12px}#mapViewer .mv-hint{font-size:13px;color:#8f826a;margin-top:14px;font-style:italic}
@media (max-height:520px) and (min-width:761px){#mapViewer{grid-template-columns:1fr minmax(220px,36vw)}#mapViewer aside{padding:14px 16px}#mapViewer h2{font-size:19px;margin-top:4px}#mapViewer .mv-note{font-size:14px;line-height:1.45}#mapViewer .mv-hint{display:none}}
@media (max-width:760px){#mapViewer{grid-template-columns:1fr;grid-template-rows:1fr auto}#mapViewer aside{max-height:42vh;border-left:0;border-top:1px solid #5a4528;padding:16px 16px 14px}#mapViewer h2{font-size:20px;margin-top:6px}#mapViewer .mv-close{top:auto;bottom:calc(42vh + 10px)}}`;
      document.head.appendChild(s);
    }
    function build(){
      style();root=document.createElement('div');root.id='mapViewer';root.className='hidden';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-labelledby','mvTitle');
      root.innerHTML=`<div class="mv-stage" aria-label="The map. Drag to move it, scroll or pinch to zoom."><img alt=""><div class="mv-missing hidden">This map has not arrived yet. Its card is beside it.</div></div>
        <aside><small>THE MAP ROOM</small><h2 id="mvTitle"></h2><p class="mv-maker"></p><p class="mv-note"></p><p class="mv-credit"></p>
        <div class="mv-tools"><button type="button" data-act="prev" aria-label="The previous map">← Previous</button><button type="button" data-act="next" aria-label="The next map">Next →</button>
        <button type="button" data-act="out" aria-label="Zoom out">−</button><button type="button" data-act="in" aria-label="Zoom in">+</button><button type="button" data-act="fit">Whole map</button></div>
        <p class="mv-hint">Drag to move the map; scroll, pinch or double-click to look closer. Escape puts it back.</p></aside>
        <button type="button" class="mv-close" data-act="close">Back to the room</button>`;
      document.body.appendChild(root);stage=root.querySelector('.mv-stage');img=root.querySelector('img');caption=root.querySelector('aside');
      root.addEventListener('click',e=>{const act=e.target.closest('[data-act]')?.dataset.act;if(!act)return;if(act==='close')close();else if(act==='prev')show(index-1);else if(act==='next')show(index+1);else if(act==='in')zoom(1.6);else if(act==='out')zoom(1/1.6);else if(act==='fit')fit()});
      img.addEventListener('load',()=>{root.querySelector('.mv-missing').classList.add('hidden');fit()});
      img.addEventListener('error',()=>{root.querySelector('.mv-missing').classList.remove('hidden');img.style.visibility='hidden'});
      stage.addEventListener('wheel',e=>{e.preventDefault();const r=stage.getBoundingClientRect();zoom(Math.exp(-e.deltaY*.0015),e.clientX-r.left,e.clientY-r.top)},{passive:false});
      stage.addEventListener('dblclick',e=>{const r=stage.getBoundingClientRect();if(scale>fitScale*1.5)fit();else zoom(2.5,e.clientX-r.left,e.clientY-r.top)});
      stage.addEventListener('pointerdown',e=>{stage.setPointerCapture?.(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===1)drag={x:e.clientX-x,y:e.clientY-y};else if(pointers.size===2){const [a,b]=[...pointers.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),scale};drag=null}stage.classList.add('dragging')});
      stage.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
        if(pinch&&pointers.size===2){const [a,b]=[...pointers.values()],r=stage.getBoundingClientRect(),d=Math.hypot(a.x-b.x,a.y-b.y);zoomTo(pinch.scale*d/pinch.d,(a.x+b.x)/2-r.left,(a.y+b.y)/2-r.top)}
        else if(drag){x=e.clientX-drag.x;y=e.clientY-drag.y;apply()}});
      const up=e=>{pointers.delete(e.pointerId);if(pointers.size<2)pinch=null;if(pointers.size===1){const p=[...pointers.values()][0];drag={x:p.x-x,y:p.y-y}}else if(!pointers.size){drag=null;stage.classList.remove('dragging')}};
      stage.addEventListener('pointerup',up);stage.addEventListener('pointercancel',up);
      window.addEventListener('resize',()=>{if(open)fit()});
      // While the map is down, keys belong to it: nothing walks, and Escape puts it back.
      window.addEventListener('keydown',e=>{if(!open)return;e.stopImmediatePropagation();const k=e.key;
        if(k==='Escape'){e.preventDefault();close()}else if(k==='ArrowRight'){e.preventDefault();show(index+1)}else if(k==='ArrowLeft'){e.preventDefault();show(index-1)}
        else if(k==='+'||k==='='){zoom(1.4)}else if(k==='-'||k==='_'){zoom(1/1.4)}else if(k==='0'){fit()}},true);
      window.addEventListener('keyup',e=>{if(open)e.stopImmediatePropagation()},true);
    }
    function apply(){if(!img.naturalWidth)return;const r=stage.getBoundingClientRect(),w=img.naturalWidth*scale,h=img.naturalHeight*scale;
      // Keep some of the map on the screen however far it is dragged.
      const m=60;x=Math.min(r.width-m,Math.max(m-w,x));y=Math.min(r.height-m,Math.max(m-h,y));img.style.transform=`translate(${x}px,${y}px) scale(${scale})`}
    function fit(){if(!img.naturalWidth)return;const r=stage.getBoundingClientRect();fitScale=Math.min((r.width-24)/img.naturalWidth,(r.height-24)/img.naturalHeight);scale=fitScale;x=(r.width-img.naturalWidth*scale)/2;y=(r.height-img.naturalHeight*scale)/2;apply()}
    function zoomTo(next,cx,cy){const r=stage.getBoundingClientRect();if(cx==null){cx=r.width/2;cy=r.height/2}next=Math.max(fitScale*.8,Math.min(fitScale*14,Math.max(next,.02)));x=cx-(cx-x)*next/scale;y=cy-(cy-y)*next/scale;scale=next;apply()}
    function zoom(f,cx,cy){zoomTo(scale*f,cx,cy)}
    function show(i){
      index=(i+ORDER.length)%ORDER.length;const key=ORDER[index],[title,maker,note]=MAPS[key],info=manifest()[key];
      caption.querySelector('h2').textContent=title;caption.querySelector('.mv-maker').textContent=maker;caption.querySelector('.mv-note').textContent=note;
      const credit=caption.querySelector('.mv-credit');credit.replaceChildren();
      if(info?.drawn)credit.textContent='Drawn for the library after the poem; the chart itself is in the public domain.';
      else if(info){credit.append('Image: ');const a=document.createElement('a');a.href=info.page;a.target='_blank';a.rel='noopener';a.textContent='Wikimedia Commons';credit.append(a,`, ${/public domain|^pd/i.test(info.licence)?'in the public domain':info.licence}.`)}
      img.style.visibility='visible';root.querySelector('.mv-missing').classList.add('hidden');img.removeAttribute('src');img.alt=`${title}, ${maker}`;
      if(info)img.src=`${base}${key}.jpg`;else{img.style.visibility='hidden';root.querySelector('.mv-missing').classList.remove('hidden')}
      const trailText=onView?.(key);let slip=caption.querySelector('.mv-trail');if(trailText){if(!slip){slip=document.createElement('p');slip.className='mv-note mv-trail';caption.querySelector('.mv-note').after(slip)}slip.textContent='A loose slip — '+trailText+' (Kept in your journal.)'}else slip?.remove();
    }
    function openAt(key){if(!root)build();open=true;root.classList.remove('hidden');onOpen?.();show(Math.max(0,ORDER.indexOf(key)));setTimeout(()=>root.querySelector('.mv-close').focus(),30)}
    function close(){if(!open)return;open=false;root.classList.add('hidden');img.removeAttribute('src');onClose?.()}
    return {open:openAt,close,get isOpen(){return open},get current(){return ORDER[index]}};
  }

  window.createMapRoom=function(options){
    const {THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,arrivals={},showNotice,playSample,move,analytics,isHolding=()=>false,registerSeat=null,doorKit=null,
      base='assets/maps/',fetchJson=url=>fetch(url).then(r=>r.ok?r.json():{}),loadTexture=null,onViewerOpen=null,onViewerClose=null,onMapViewed=null}=options;
    // In the west wing's north wall, between the wing's doorway from the Grand Hall and its bookcase.
    const DOOR={x:-21.4,z:-13.45,yaw:0};
    const ROOM={cx:-420,cz:-60,w:18,d:14,h:6};
    const PRELOAD=8,KEEP=25;
    // The east wall's shelf, from its middle (along the wall from the room's centre, southwards) and its length: it leaves
    // the wall's south end clear for the door to the Medicine Room.
    const EAST_SHELF={z:-1.3,length:7};
    // Its own side of the door: oak, with a fanlight lit warm from the map table.
    const DOOR_LOOK={style:'walnut',color:0x6b4a2a,fanColor:0xffc878,width:1.9,height:3.1};
    const through=(data,go)=>doorKit&&data.kit?doorKit.pass(data.kit,data,go):go();
    let root=null,time=0,lastNeeded=-1e9,manifest={},manifestAsked=false;
    const owned=[],ours=[],books=[],blockers=[],frames=[];
    const own=thing=>{owned.push(thing);return thing};
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    // The door in the wing stays when the room is freed, so its parts are not among the room's own.
    function markDoor(object,data){object.userData=data;interactables.push(object);return object}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const card=key=>({type:'map-card',title:CARDS[key][0],author:CARDS[key][1],action:'READ'});
    const viewer=createViewer({base,manifest:()=>manifest,onOpen:onViewerOpen,onClose:onViewerClose,onView:key=>{analytics?.track('Map Viewed',{map:key});return onMapViewed?.(key)}});
    function askManifest(){if(manifestAsked)return;manifestAsked=true;Promise.resolve().then(()=>fetchJson(`${base}maps.json`)).then(data=>{manifest=data&&typeof data==='object'?data:{};if(root)for(const f of frames)dress(f)}).catch(()=>{manifestAsked=false})}

    function sign(parent,text,sub,w,h,x,y,z){
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle='#1d2a24';c.fillRect(0,0,W,H);c.strokeStyle='#c9a45a';c.lineWidth=4;c.strokeRect(8,8,W-16,H-16);c.fillStyle='#f1e2b8';c.textAlign='center';let size=30;c.font=`bold ${size}px Georgia`;while(c.measureText(text).width>W-40&&size>14){size-=2;c.font=`bold ${size}px Georgia`}c.fillText(text,W/2,sub?50:H/2+11);if(sub){c.font='italic 20px Georgia';c.fillText(sub,W/2,82)}},560,sub?104:72));
      return add(own(new THREE.PlaneGeometry(w,h)),own(new THREE.MeshStandardMaterial({map,emissive:0x2a2414,emissiveIntensity:.3,roughness:.85})),x,y,z,parent);
    }

    // The books for each shelf: those listed, then the new arrivals; a book the library does not hold is left out.
    const ROOM_FOR={voyages:14,makers:8,lands:16};
    function catalogue(){
      return GROUPS.map(group=>({...group,books:[...new Set([...group.ids,...(arrivals[group.key]||[])])].map(id=>{const [title,author]=RECORDS[id]||[];return findBook(id,title?{id,title,author}:null)}).filter(Boolean).slice(0,ROOM_FOR[group.key])}));
    }

    // ---------- the door, in the west wing ----------
    function buildDoor(){
      const g=new THREE.Group();g.name='map-room-door';g.position.set(DOOR.x,0,DOOR.z);g.rotation.y=DOOR.yaw;scene.add(g);
      const data={type:'map-door',title:'The Map Room',author:'Old maps of the world, to be looked at closely, and the books of the voyages they came from.',action:'ENTER'};
      if(!doorKit?.hang(g,{data,mark:markDoor,...DOOR_LOOK,...doorKit.readingRoom?.('THE MAP ROOM','Charts, atlases and voyages')}))markDoor(add(new THREE.BoxGeometry(1.9,3.1,.14),new THREE.MeshStandardMaterial({color:DOOR_LOOK.color,roughness:.7}),0,1.55,.08,g),data);
    }

    // ---------- the maps on the walls ----------
    // A frame is a dark moulding, a gilt slip and the map, all from unit shapes stretched to the map's own proportions.
    let unit=null;
    function unitParts(){if(unit)return unit;unit={moulding:own(new THREE.BoxGeometry(1,1,.06)),slip:own(new THREE.BoxGeometry(1,1,.02)),face:own(new THREE.PlaneGeometry(1,1)),
      frame:own(new THREE.MeshStandardMaterial({color:0x2a1a0e,roughness:.6,map:MAT.darkWood?.map||null})),gilt:own(new THREE.MeshStandardMaterial({color:0xb08a44,roughness:.4,metalness:.6})),
      parchment:own(new THREE.MeshStandardMaterial({color:0xcdb88c,roughness:.95}))};return unit}
    function wallPose(wall,along,y){const {cx,cz,w,d}=ROOM;
      if(wall==='north')return {x:cx+along,y,z:cz-d/2+.2,yaw:0};if(wall==='south')return {x:cx-along,y,z:cz+d/2-.2,yaw:Math.PI};
      if(wall==='west')return {x:cx-w/2+.2,y,z:cz+along,yaw:Math.PI/2};return {x:cx+w/2-.2,y,z:cz-along,yaw:-Math.PI/2}}
    function hangMap(key,pose,maxW,maxH,flat=false){
      const u=unitParts(),g=new THREE.Group();g.position.set(pose.x,pose.y,pose.z);g.rotation.y=pose.yaw;if(flat)g.rotation.x=-Math.PI/2;root.add(g);
      // Layers a few centimetres apart, so the gilt never shows through the map at a distance.
      const moulding=add(u.moulding,u.frame,0,0,0,g),slip=add(u.slip,u.gilt,0,0,.045,g),face=add(u.face,u.parchment,0,0,.08,g);
      const data={type:'map-view',key,title:MAPS[key][0],author:MAPS[key][1],action:'LOOK CLOSELY'};mark(face,data);mark(moulding,data);
      const frame={key,g,moulding,slip,face,maxW,maxH,flat,material:null,texture:null};frames.push(frame);fitFrame(frame,maxW/maxH);dress(frame);return frame;
    }
    function fitFrame(f,aspect){let w=f.maxW,h=w/aspect;if(h>f.maxH){h=f.maxH;w=h*aspect}f.face.scale.set(w,h,1);f.slip.scale.set(w+.06,h+.06,1);f.moulding.scale.set(w+.24,h+.24,1)}
    function dress(f){
      const info=manifest[f.key];if(!info||f.texture)return;if(info.width&&info.height)fitFrame(f,info.width/info.height);
      const done=texture=>{if(!root||!frames.includes(f)){texture.dispose?.();return}texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;f.texture=own(texture);
        f.material=own(new THREE.MeshStandardMaterial({map:texture,roughness:.9,emissive:0xffffff,emissiveMap:texture,emissiveIntensity:f.flat?.03:.1}));f.face.material=f.material;
        const img=texture.image;if(img?.width&&img?.height)fitFrame(f,img.width/img.height)};
      f.texture=true;(loadTexture||((url,ok,fail)=>new THREE.TextureLoader().load(url,ok,undefined,fail)))(`${base}${f.key}-wall.jpg`,done,()=>{f.texture=null});
    }

    // ---------- the room ----------
    function buildRoom(){
      root=new THREE.Group();root.name='map-room';const {cx,cz,w,d,h}=ROOM;
      // Deep green walls above an oak dado, as in the old map rooms, a boarded floor and a coffered ceiling.
      const wall=own(new THREE.MeshStandardMaterial({color:0x2f4438,roughness:.95})),oak=own(new THREE.MeshStandardMaterial({color:0x6b4a2a,roughness:.7,map:MAT.wood?.map||null}));
      box(w,.3,d,MAT.wood,cx,-.15,cz,root);box(w,.25,d,MAT.darkWood,cx,h+.12,cz,root);
      box(w,h,.3,wall,cx,h/2,cz-d/2,root);box(w,h,.3,wall,cx,h/2,cz+d/2,root);box(.3,h,d,wall,cx-w/2,h/2,cz,root);box(.3,h,d,wall,cx+w/2,h/2,cz,root);
      for(const [x,z,sw,sd] of [[cx,cz-d/2+.17,w-.4,.05],[cx,cz+d/2-.17,w-.4,.05],[cx-w/2+.17,cz,.05,d-.4],[cx+w/2-.17,cz,.05,d-.4]]){box(sw,.95,sd,oak,x,.47,z,root);box(sw+.02,.06,sd+.03,MAT.darkWood,x,.97,z,root)}
      // A cornice, and beams across the ceiling.
      for(const [x,z,sw,sd] of [[cx,cz-d/2+.2,w-.4,.12],[cx,cz+d/2-.2,w-.4,.12],[cx-w/2+.2,cz,.12,d-.4],[cx+w/2-.2,cz,.12,d-.4]])box(sw,.2,sd,MAT.darkWood,x,h-.12,z,root);
      for(const dx of [-6,6])box(.3,.22,d-.3,MAT.darkWood,cx+dx,h-.1,cz,root);
      // The compass rose painted on the ceiling between the beams.
      const roseMap=own(canvasTexture((c,W,H)=>{const r=W/2;c.fillStyle='#22302a';c.fillRect(0,0,W,H);c.translate(r,r);
        c.strokeStyle='rgba(201,164,90,.55)';c.lineWidth=3;for(const rr of [r*.92,r*.86,r*.3]){c.beginPath();c.arc(0,0,rr,0,Math.PI*2);c.stroke()}
        for(let i=0;i<32;i++){const a=i/32*Math.PI*2,len=i%8===0?r*.86:i%4===0?r*.62:i%2===0?r*.48:r*.38,wd=i%8===0?r*.09:i%4===0?r*.06:r*.035;
          c.save();c.rotate(a);c.beginPath();c.moveTo(0,-len);c.lineTo(wd,0);c.lineTo(0,0);c.closePath();c.fillStyle=i%8===0?'#e7d29c':i%4===0?'#b8955a':'#8a6e44';c.fill();
          c.beginPath();c.moveTo(0,-len);c.lineTo(-wd,0);c.lineTo(0,0);c.closePath();c.fillStyle=i%8===0?'#9c7a42':'#5e4a2e';c.fill();c.restore()}
        c.fillStyle='#e7d29c';c.font='bold 40px Georgia';c.textAlign='center';c.textBaseline='middle';[['N',0],['E',1],['S',2],['W',3]].forEach(([l,k])=>{const a=k*Math.PI/2;c.fillText(l,Math.sin(a)*r*.95*.97,-Math.cos(a)*r*.95*.97)})},512,512));
      const rose=add(own(new THREE.CircleGeometry(4.6,48)),own(new THREE.MeshStandardMaterial({map:roseMap,emissive:0xffffff,emissiveMap:roseMap,emissiveIntensity:.12,roughness:.9})),cx,h-.02,cz,root);rose.rotation.x=Math.PI/2;rose.rotation.z=Math.PI;mark(rose,card('rose'));
      // The room's sign, over the door.
      mark(sign(root,'THE MAP ROOM','Charts, atlases and voyages',3,.56,cx,5.2,cz+d/2-.2),card('sign')).rotation.y=Math.PI;
      // The maps.
      for(const [key,wallName,along,y,mw,mh] of HANG)hangMap(key,wallPose(wallName,along,y),mw,mh);
      // The map table: a long oak table with two maps laid on it under glass, a reading glass and a pair of dividers.
      const tz=cz+.6,top=1.0;box(4.6,.1,2.2,oak,cx,top-.05,tz,root);for(const sx of [-2.1,2.1])for(const sz of [-.9,.9])box(.14,top-.1,.14,MAT.darkWood,cx+sx,(top-.1)/2,tz+sz,root);
      box(4.3,.05,1.9,MAT.darkWood,cx,.18,tz,root);block(cx,tz,4.9,2.5);
      for(const [key,dx] of TABLE)hangMap(key,{x:cx+dx,y:top+.005,z:tz,yaw:0},1.75,1.6,true);
      const glassTop=add(own(new THREE.PlaneGeometry(4.3,1.9)),own(new THREE.MeshStandardMaterial({color:0xcfe0e8,transparent:true,opacity:.08,roughness:.05,metalness:.3,depthWrite:false})),cx,top+.06,tz,root);glassTop.rotation.x=-Math.PI/2;
      const lens=new THREE.Group();lens.position.set(cx+1.6,top+.08,tz+.75);lens.rotation.y=.5;root.add(lens);
      const ring=add(own(new THREE.TorusGeometry(.11,.014,8,24)),MAT.brass,0,0,0,lens);ring.rotation.x=-Math.PI/2;const handle=add(own(new THREE.CylinderGeometry(.016,.02,.22,8)),MAT.darkWood,.21,0,0,lens);handle.rotation.z=Math.PI/2;
      mark(ring,card('glass'));mark(handle,card('glass'));
      const div=new THREE.Group();div.position.set(cx-1.7,top+.08,tz-.7);div.rotation.y=-.4;root.add(div);
      for(const s of [-1,1]){const leg=add(own(new THREE.CylinderGeometry(.008,.012,.36,6)),MAT.brass,s*.04,0,0,div);leg.rotation.set(Math.PI/2,0,s*.22);mark(leg,card('dividers'))}
      // Two chairs at the table, the library's own seats, each opening one of the room's books.
      const leather=own(new THREE.MeshStandardMaterial({color:0x4a2a1a,roughness:.65}));
      for(const [x,z,yaw] of [[cx-1.2,tz+1.75,0],[cx+1.2,tz+1.75,0]]){
        const chair=new THREE.Group();chair.position.set(x,0,z);chair.rotation.y=yaw;root.add(chair);
        const seat=box(.62,.1,.6,leather,0,.5,0,chair),back=box(.62,.7,.08,leather,0,.9,.28,chair);for(const sx of [-.27,.27])for(const sz of [-.25,.25])box(.06,.48,.06,MAT.darkWood,sx,.24,sz,chair);block(x,z,.8,.8);
        if(registerSeat){const data=registerSeat([seat,back],chair,new THREE.Vector3(0,1.25,.05),yaw,{title:'A chair at the map table',author:'Sit and read one of the Map Room’s books.'});
          Object.defineProperty(data,'bookIds',{get:()=>books.map(mesh=>mesh.userData.book.id),configurable:true});ours.push(seat,back)}
      }
      // The books: west wall (voyages), east wall (maps and their makers), and either side of the door (not on any map).
      const groups=catalogue(),geometry=own(new THREE.BoxGeometry(.72,.96,.13));
      const ROWS=[1.35,2.5];
      // The east wall's shelf stops short of its south end, where the door to the Medicine Room is (medicine-room.js).
      const SHELF={voyages:{z:cz,length:10.4},makers:{z:cz+EAST_SHELF.z,length:EAST_SHELF.length}};
      const sideSpots=(side,count)=>{const out=[],x=side<0?cx-w/2+.3:cx+w/2-.3,yaw=side<0?Math.PI/2:-Math.PI/2,shelf=SHELF[side<0?'voyages':'makers'],per=Math.ceil(count/2),gap=Math.min(1.4,(shelf.length-.4)/per);for(let i=0;i<count;i++){const row=i<per?0:1,col=row?i-per:i,n=row?count-per:per;out.push({x,z:shelf.z+(col-(n-1)/2)*gap*-side,y:ROWS[row],yaw})}return out};
      const southSpots=count=>{const out=[];for(let i=0;i<count;i++){const half=i%2,k=Math.floor(i/2),row=k<4?0:1,col=k%4;out.push({x:half?cx+2.4+col*1.3:cx-2.4-col*1.3,z:cz+d/2-.3,y:ROWS[row],yaw:Math.PI})}return out};
      const spots={voyages:sideSpots(-1,groups[0].books.length),makers:sideSpots(1,groups[1].books.length),lands:southSpots(16)};
      for(const group of groups){
        group.books.forEach((book,i)=>placeBook(book,spots[group.key][i],geometry,group.key));
        const info={type:'map-card',title:group.name,author:group.sub+'.',action:'READ'};
        if(group.key!=='lands'){const s=spots[group.key][0],x=s?.x??(group.key==='voyages'?cx-w/2+.3:cx+w/2-.3),shelf=SHELF[group.key];for(const y of ROWS)box(.34,.05,shelf.length,MAT.darkWood,x,y-.5,shelf.z,root);
          const label=sign(root,group.name,group.sub,2.9,.46,x+(group.key==='voyages'?.08:-.08),3.36,shelf.z);label.rotation.y=group.key==='voyages'?Math.PI/2:-Math.PI/2;mark(label,info);block(x,shelf.z,.7,shelf.length+.4)}
        else{for(const side of [-1,1])for(const y of ROWS)box(5.4,.05,.34,MAT.darkWood,cx+side*4.35,y-.5,cz+d/2-.34,root);const label=sign(root,group.name,group.sub,2.6,.44,cx-4.35,3.36,cz+d/2-.2);label.rotation.y=Math.PI;mark(label,info);block(cx-4.35,cz+d/2-.4,5.6,.6);block(cx+4.35,cz+d/2-.4,5.6,.6)}
      }
      // A lamp hung over the map table, and one before the great maps of the north wall.
      const lamp=new THREE.PointLight(0xffd49a,3.6,16,2);lamp.position.set(cx,h-1.4,tz);root.add(lamp);
      add(own(new THREE.CylinderGeometry(.5,.32,.3,16,1,true)),own(new THREE.MeshStandardMaterial({color:0x1f3a2c,emissive:0x5a3a10,emissiveIntensity:.5,roughness:.6,side:THREE.DoubleSide})),cx,h-1.25,tz,root);
      add(own(new THREE.CylinderGeometry(.008,.008,1.1,4)),MAT.brass,cx,h-.55,tz,root);
      const wallLamp=new THREE.PointLight(0xffe0b0,3.2,14,2);wallLamp.position.set(cx,4.2,cz-d/2+3.2);root.add(wallLamp);
      // The door back to the west wing.
      const exit={type:'map-exit',title:'Back to the west wing',author:'The wing, and the Grand Hall beyond it.',action:'RETURN'};
      if(!doorKit?.hang(root,{data:exit,mark,x:cx,z:cz+d/2-.2,yaw:Math.PI,label:'THE WEST WING',own,...DOOR_LOOK}))mark(box(1.9,3.1,.16,own(new THREE.MeshStandardMaterial({color:DOOR_LOOK.color,roughness:.7})),cx,1.55,cz+d/2-.2,root),exit);
      scene.add(root);
    }
    function placeBook(book,spot,geometry,group){
      if(!spot)return null;
      const mesh=add(geometry,own(bookMaterial(book)),spot.x,spot.y,spot.z,root);mesh.rotation.order='YXZ';mesh.rotation.y=spot.yaw;mesh.rotation.x=-.08;
      mesh.userData={type:'book',book,loaded:false,mapRoom:true,shelf:group,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:root}};
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
      showNotice('The Map Room. The world as it was known and as it was imagined, edge to edge on the walls. Look at any map to see it closely.',9);
      analytics?.track('Room Explored',{room:'map-room'});
    }
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('map-'))return false;
      if(data.type==='map-door'){through(data,enter);return true}
      if(data.type==='map-exit'){through(data,()=>{move(DOOR.x+Math.sin(DOOR.yaw)*1.9,DOOR.z+Math.cos(DOOR.yaw)*1.9,DOOR.yaw+Math.PI);playSample?.('doorOpen',.8,1);showNotice('The west wing again.',3)});return true}
      if(data.type==='map-view'){viewer.open(data.key);playSample?.('pageTurn',.6,1);return true}
      if(data.type==='map-card'){showNotice(`${data.title}: ${data.author}`,9);return true}
      return false;
    }

    // ---------- lifecycle ----------
    function activate(){askManifest();if(!root)buildRoom();lastNeeded=time}
    function unload(){
      if(!root)return;root.removeFromParent();root=null;unit=null;frames.length=0;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0;
    }
    function update(t){
      time=t;const inside=contains(player.pos.x,player.pos.z),near=Math.hypot(player.pos.x-DOOR.x,player.pos.z-DOOR.z)<PRELOAD;
      if(inside||near||viewer.isOpen)activate();
      else if(root&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==root))unload();
    }
    buildDoor();
    return {contains,floorAt,allowed,interact,update,enter,unload,catalogue,viewer,door:DOOR,room:ROOM,eastShelf:EAST_SHELF,groups:GROUPS,records:RECORDS,maps:MAPS,hang:HANG,table:TABLE,
      get built(){return !!root},get books(){return books.slice()},get frames(){return frames.slice()},get manifest(){return manifest},zoneAt:(x,z)=>contains(x,z)?'map-room':null};
  };
})();
