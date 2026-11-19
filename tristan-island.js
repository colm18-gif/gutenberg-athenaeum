// Tristan da Cunha: a stone cottage in Edinburgh of the Seven Seas on a clearing evening after a gale, reached through
// the third ship in a bottle on the Long Corridor's shelf (ships-in-bottles.js, handed `bottles`). The island is the
// most remote inhabited one in the world: its one village lies on a strip of green plain on the north coast, under the
// cliffs of a volcano more than two thousand metres high, with the sea in front of it and nothing else for some 2,400
// kilometres. The cottage has its shelves, its hearth and a table with the bottle home; its door opens on a walled yard
// with a longboat drawn up, and the view all round is painted inside a ring: the sea to the north under the evening sun,
// the cliffs and the cloud-capped peak behind, the village's houses along the plain, and to the east the dark cone of
// 1961. Walking is the cottage and its yard. Two lights: the low sun, and the fire on the hearth.
//
// The cards keep to what is attested: sighted in 1506 by Tristão da Cunha; garrisoned in 1816 while Napoleon was on St
// Helena; Corporal William Glass, who stayed with his family when the garrison left in 1817; the women who came from St
// Helena in 1827; the two Italians of 1892; the seven surnames; the eruption of 10 October 1961, the whole island taken
// to England, and the return in 1963; Prince Alfred's visit of 1867, which named the village. Gutenberg has one book about
// the island itself (Katherine Barrow's), and the library had a surprising number that call there: Poe's Pym meets
// Glass, Verne's Duncan and Halbrane come in, Bligh looked for it and could not find it, Flinders passed it by, Darwin
// read of its tame birds, a correspondent wrote of its penguins (shelves `tristan-*` in data/new-books.js, after `OWN`).
// Every quotation (`QUOTES`) is checked against the library's own texts by a test.
//
// The secret is the telescope at the window. "Do many ships put in to Tristan d'Acunha?" Verne has a passenger ask Glass
// in An Antarctic Mystery, and Glass answers, "As many as we require." Looked through, it shows a ship from one of the
// library's books standing in, a different one each time: Poe's Jane, Verne's Duncan, Verne's Halbrane. After the third,
// An Antarctic Mystery is left on the window sill, found for good (athenaeum-tristan-ships; ?glass).
(function(){
  'use strict';

  // The library's own books that tell of the island: Earle's (whose introduction tells how he was stranded there), the
  // Curiosities of Food (its penguins' eggs) and the Book of Buried Treasure (Nightingale Island's silver) on the island's
  // shelf; and the novels and voyages that call there, or try to, on the ships' shelf.
  const OWN={island:[11933,71509,33318],ships:[51060,46597,15411,12929,944],atlantic:[32021]};
  const SECRET_BOOK=10339;
  const GROUPS=[
    {key:'ships',name:'SHIPS THAT CALLED',sub:'And some that could not find it',wall:'west',along:0,length:4.6,max:8,ids:OWN.ships},
    {key:'island',name:'THE ISLAND',sub:'Its one book, and the books that tell of it',wall:'south',along:-2.35,length:2.7,max:4,ids:OWN.island},
    {key:'atlantic',name:'THE SOUTH ATLANTIC',sub:'St Helena, and the ocean round',wall:'south',along:2.35,length:2.7,max:4,ids:OWN.atlantic}
  ];
  // Their own words, from the library's texts, checked by a test (letters alone).
  const QUOTES={
    glass:'an Englishman of the name of Glass, formerly a corporal in the British artillery',
    governor:'He claimed to be supreme governor of the islands',
    sealskins:'Captain Guy also purchased of Glass five hundred sealskins and some ivory.',
    duncan:'there was the barren mountain-top of Tristan d’Acunha',
    speck:'the little speck in the ocean known by the name of Tristan d’Acunha',
    ask:'Do many ships put in to Tristan d’Acunha?',
    many:'As many as we require',
    port:'No, Tristan has no port, and Tristan can do without one.',
    boiler:'the big boiler of the African seas',
    bligh:'I therefore determined to give over the search and to resume our course towards the Cape of Good Hope.',
    flinders:'I should not have considered it to be lost time, had the wind made it advisable to put in at Tristan d’Acunha',
    tame:'so tame as to suffer themselves to be caught with a hand-net',
    penguins:'they are the most interesting, curious things in Tristan',
    cover:'Cover up! cover up!',
    earle:'he read the whole service of the Church of England to that little community every Sunday',
    silver:'One chest of pirate’s silver was found here and brought to the United States, but much more is said to remain hidden.',
    tragedies:'St. Helena has been an island of tragedies',
    face:'They all face the sea',
    woodwork:'The woodwork of nearly all the houses is from wrecked ships; boards from the decks form the flooring, masts and yards appear as beams, cabin doors give entrance to the rooms.',
    fires:'There are large open fire-places, but no grates or stoves, the cooking being done on two iron bars supported by fixed stones.',
    staple:'Potatoes are their staple food, and are grown in walled-in patches about three miles off.',
    spin:'The women and girls card and spin their own wool, which they knit into socks and stockings.',
    expectantly:'Every one is looking out expectantly for a ship',
    months:'To get to Tristan da Cunha is no easy matter; it took us nearly five months.',
    canvas:'two of their canvas boats',
    thatched:'the settlement below with its quaint little stone, thatched houses',
    gaveup:'The third day towards evening the skipper gave up the search and headed for the Cape.',
    remain:'Three of the men asked to remain, the chief being William Glass of Kelso'
  };
  // Which book each quotation is checked against.
  const SOURCES={glass:51060,governor:51060,sealskins:51060,duncan:46597,speck:46597,ask:10339,many:10339,port:10339,boiler:10339,bligh:15411,flinders:12929,tame:944,
    penguins:71509,cover:71509,earle:11933,silver:33318,tragedies:6317,face:8213,woodwork:8213,fires:8213,staple:8213,spin:8213,expectantly:8213,months:8213,canvas:8213,thatched:8213,gaveup:8213,remain:8213};
  const q=key=>`“${QUOTES[key]}”`;
  const CARDS={
    sign:['Tristan da Cunha','A volcanic island in the South Atlantic, about 2,400 kilometres from St Helena, its nearest inhabited neighbour, and about 2,800 from Cape Town: the most remote inhabited island in the world. Its one village, Edinburgh of the Seven Seas, lies on a strip of plain on the north coast under the cliffs of the volcano, Queen Mary’s Peak, more than 2,000 metres high. Fewer than three hundred people live there. It is a British Overseas Territory, with St Helena and Ascension.'],
    found:['1506 and 1816','The island is named for the Portuguese navigator Tristão da Cunha, who sighted it in 1506. Sealers and whalers came and went for three centuries. In 1816, while Napoleon was held on St Helena, Britain put a garrison on Tristan so that nobody could use it to rescue him, and took the island; the garrison was withdrawn the next year.'],
    glass:['Corporal Glass',`When the garrison was withdrawn in 1817, Katherine Barrow writes, ${q('remain')}, a corporal of artillery, with his wife and their two children. The settlement grew from them, from sailors and whalers who stayed on, some of them by shipwreck, from five women a whaler’s captain brought from St Helena for its bachelors, and in the 1890s from two shipwrecked Italian sailors, Repetto and Lavarello. Seven surnames are the island’s still: Glass, Green, Hagan, Lavarello, Repetto, Rogers and Swain. Poe met him in fiction, in Pym: ${q('glass')}. ${q('governor')}.`],
    village:['Edinburgh of the Seven Seas','The village is named for Prince Alfred, Duke of Edinburgh, Queen Victoria’s son, who came in 1867 as captain of HMS Galatea. The islanders mostly call it the Settlement.'],
    eruption:['10 October 1961','In 1961 the volcano opened a new vent right beside the village. On 10 October the whole island was taken off, first to Nightingale Island and then by ship to Cape Town and England, where the islanders lived at Calshot, near Southampton. In 1963 most of them chose to go home. The cone of 1961 is the dark hill to the east, and its lava runs into the sea there.'],
    longboat:['The longboat',`The islanders’ boats are built of canvas over a wooden frame, light enough to carry up the beach and to launch through the surf; Katherine Barrow, arriving on Palm Sunday 1906 in a high wind and a rough sea, watched them set off in ${q('canvas')} to the steamer. There is no harbour for ships: they lie off, and the boats go out to them.`],
    potatoes:['Potatoes',`${q('staple')} Katherine Barrow wrote that in 1906; the walled patches are still there, along the plain to the west, and still called the Patches. A sack of them stands by the door.`],
    hearth:['The hearth',`${q('fires')} The houses are of the island’s stone, thatched with tussock grass, and ${q('face')}, Katherine Barrow wrote.`],
    wheel:['The spinning wheel',`${q('spin')} (Katherine Barrow, 1906.)`],
    telescope:['The telescope',`A telescope on its stand at the window, turned to the sea, where a ship would come from. ${q('expectantly')}, Katherine Barrow wrote one May, with letters waiting. In Verne’s An Antarctic Mystery a passenger asks Glass, ${q('ask')} ${q('many')}, Glass replies.`],
    window:['The north window','The sea, and nothing else for more than two thousand kilometres. Ships stand off the island and wait for the weather and the boats.'],
    south:['The south window','The cliffs behind the village, and above them the peak, mostly in its cloud.'],
    edge:['The yard wall',`A wall of the island’s stone round the yard, and beyond it the plain, the sea, and the village: ${q('thatched')}, as Katherine Barrow first saw it from the cliff road in 1906.`],
    solitude:['Solitude',`Augustus Earle, a travelling painter, was put ashore on Tristan in 1824 and his ship was driven off in a gale; he stayed for six months, until a passing ship took him off. He painted himself on the rocks with his dog, and called it Solitude, watching the horizon at sun set, in the hopes of seeing a vessel. Later he sailed as draughtsman in the Beagle, with Darwin.`],
    glasshouse:['Corporal Glass at his house','William Glass in his red coat at the gate of his thatched house, his dogs about him: a picture after Augustus Earle, who lived among the settlers for six months in 1824.'],
    birds:['The two land-birds',`The island’s land-birds that Darwin read of, ${q('tame')}, in Joseph Smit’s plates of 1881: the Tristan thrush, and the bunting named for the island, Nesospiza acunhae, now called the Inaccessible Island finch.`],
    space:['From space','The whole island from the International Space Station in February 2013: a round volcano about twelve kilometres across, with cloud gathering on its windward side, and the plain where the village is on its north-west coast.'],
    stamp:['The first stamps','Tristan da Cunha had no stamps of its own until 1952, when stamps of St Helena were overprinted TRISTAN DA CUNHA. This is the five shillings, with a ship under sail.'],
    beams:['The beams',`${q('woodwork')} (Katherine Barrow, 1906.)`],
    ships:['Ships that called',`The library had more books that call at Tristan than anyone would think. Poe’s Pym meets Glass himself. Verne sent the Duncan in search of Captain Grant past ${q('speck')}, and the Halbrane in An Antarctic Mystery to water there. Bligh, in the Bounty in 1788, looked for it and could not find it: ${q('bligh')} The ship that brought its first clergyman in 1851 nearly did the same: ${q('gaveup')} Then the peak came out of the clouds. Flinders passed it by in 1801: ${q('flinders')}, he wrote. Darwin read that its only two land-birds were ${q('tame')}.`],
    island:['The island',`Katherine Barrow’s book is the only one on Gutenberg about Tristan itself: ${q('months')} Around it are the books that tell of it: Earle the painter was stranded there in 1824, and his editor says ${q('earle')}; a correspondent there wrote of its penguins, ${q('penguins')}, all calling ${q('cover')}; and of Nightingale Island, the Book of Buried Treasure says, ${q('silver')}`],
    atlantic:['The South Atlantic',`St Helena, where Napoleon was held and which made Tristan British: ${q('tragedies')}, Slocum wrote, calling there alone in the Spray in 1898. Wallace on the Atlantic’s volcanic islands, and a shipwreck in the same ocean.`],
    secret:['As many as we require',`${q('ask')} ${q('many')} ${q('port')} Verne’s Glass is sixty and vigorous, and proud of his island; Verne calls it ${q('boiler')}. Someone has left An Antarctic Mystery on the window sill, Verne’s sequel to Pym, in which the Halbrane calls at Tristan and its passenger meets Glass.`]
  };
  // The ships the telescope finds, one a look: each from a book in the library.
  const SHIPS=[
    {key:'jane',name:'The Jane',book:'Poe, The Narrative of Arthur Gordon Pym',x:-6,masts:2,text:`A schooner is standing in from the west: the Jane, of New York, Captain Guy, in Poe’s Narrative of Arthur Gordon Pym. Glass is at the landing to meet her. ${q('sealskins')}`},
    {key:'duncan',name:'The Duncan',book:'Verne, In Search of the Castaways',x:2,masts:2,funnel:true,text:`A steam yacht with a funnel between her masts: Lord Glenarvan’s Duncan, in Verne’s In Search of the Castaways, following the thirty-seventh parallel in search of Captain Grant. ${q('duncan')}`},
    {key:'halbrane',name:'The Halbrane',book:'Verne, An Antarctic Mystery',x:7,masts:2,text:`A schooner bound south for the ice, the Halbrane, Captain Len Guy, in Verne’s An Antarctic Mystery, put in for water. Her passenger asks Glass, ${q('ask')}`}
  ];
  const PICTURES={
    solitude:{file:'tristan-solitude',title:'Solitude, 1824',credit:'Augustus Earle, 1824, watercolour. National Library of Australia. Public domain, from Wikimedia Commons.',ratio:.71,card:'solitude'},
    glass:{file:'tristan-glass',title:'Corporal Glass at his house',credit:'After Augustus Earle. Public domain, from Wikimedia Commons.',ratio:.68,card:'glasshouse'},
    thrush:{file:'tristan-thrush',title:'The Tristan thrush',credit:'Joseph Smit, 1881. Public domain, from Wikimedia Commons.',ratio:.97,card:'birds'},
    bunting:{file:'tristan-bunting',title:'Nesospiza acunhae',credit:'Joseph Smit, 1881. Public domain, from Wikimedia Commons.',ratio:1.06,card:'birds'},
    space:{file:'tristan-space',title:'Tristan da Cunha from the International Space Station, 2013',credit:'NASA, Expedition 34, 6 February 2013. Public domain, from Wikimedia Commons.',ratio:.67,card:'space'},
    stamp:{file:'tristan-stamp',title:'The first stamps, 1952',credit:'St Helena five-shilling stamp overprinted TRISTAN DA CUNHA, 1952. Public domain, from Wikimedia Commons.',ratio:.72,card:'stamp'}
  };
  const FOUND_KEY='athenaeum-tristan-ships';

  window.createTristanIsland=function(options){
    const {placeVisitorsBook=null,THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,arrivals={},showNotice,playSample,move,analytics,isHolding=()=>false,registerSeat=null,
      bottles=null,showPicture=null,tone=null,storage=null,search='',pictures='assets/pictures/'}=options;
    const ROOM={cx:2600,cz:1200,w:8,d:5.5,h:2.8},YARD=4.5;
    const x0=ROOM.cx-ROOM.w/2,x1=ROOM.cx+ROOM.w/2,z0=ROOM.cz-ROOM.d/2,z1=ROOM.cz+ROOM.d/2,zy=z0-YARD;
    // The front door, in the north wall, and the window west of it where the telescope stands.
    const DOOR={x:ROOM.cx+1.45,w:1.3},WINDOW={x:ROOM.cx-1.2,w:1.3,sill:.95,top:2.05};
    const KEEP=25,R=24,EYE=1.72,HORIZON=.59,PANO=24;
    const wasFound=()=>{try{return storage?.getItem(FOUND_KEY)==='1'||/[?&](glass|asmanyasrequire|halbrane)\b/.test(search)}catch(e){return false}};
    let root=null,time=0,lastNeeded=-1e9,sails=[],looks=0,sill=null,sillBook=null,fire=null,fireLight=null;
    const owned=[],ours=[],books=[],blockers=[];
    const own=thing=>{owned.push(thing);return thing};
    const std=params=>own(new THREE.MeshStandardMaterial(params));
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const card=key=>({type:'tristan-card',key,title:CARDS[key][0],author:CARDS[key][1],action:'READ'});
    function sign(parent,text,sub,w,h,x,y,z){
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle='#ece6d6';c.fillRect(0,0,W,H);c.strokeStyle='#2c4a5a';c.lineWidth=3;c.strokeRect(7,7,W-14,H-14);
        c.fillStyle='#1c2630';c.textAlign='center';c.font='bold 27px Georgia';c.fillText(text,W/2,sub?50:H/2+10);if(sub){c.font='italic 19px Georgia';c.fillText(sub,W/2,82)}},620,sub?104:70));
      return add(own(new THREE.PlaneGeometry(w,h)),std({map,emissive:0x2a3036,emissiveIntensity:.25,roughness:.9}),x,y,z,parent)}
    const shelfBooks=(ids,key,max)=>[...new Set([...ids,...(arrivals[key]||[])])].map(id=>findBook(id)).filter(Boolean).slice(0,max);
    function catalogue(){return {groups:GROUPS.map(group=>({...group,books:shelfBooks(group.ids,group.key,group.max)})),secret:[findBook(SECRET_BOOK)].filter(Boolean)}}

    // ---------- the bottle on the corridor's shelf: a ship for a high, lonely cone with a cap of cloud ----------
    bottles?.add({key:'tristan',title:'Tristan da Cunha',label:'TRISTAN DA CUNHA',author:'A ship under sail for a single high island alone in a grey sea, a round volcano with a cap of cloud on its peak.',
      island:[[.1,.05,.06]],smoke:[.1,.085],land:0x4a6a44,enter});

    // ---------- the cottage and its yard ----------
    function buildCottage(){
      root=new THREE.Group();root.name='tristan';const {cx,cz,w,d,h}=ROOM;
      let k=11;const r=()=>(k=(k*9301+49297)%233280)/233280;
      const stoneTex=own(canvasTexture((c,W,H)=>{c.fillStyle='#34302c';c.fillRect(0,0,W,H);let y=0;while(y<H){const sh=22+r()*18;let x=-r()*40;while(x<W){const sw=30+r()*46,v=92+r()*40,t=r()*12;c.fillStyle=`rgb(${v+t},${v},${v-8-t})`;c.fillRect(x+3,y+3,sw-6,sh-5);c.fillStyle='rgba(255,255,255,.06)';c.fillRect(x+3,y+3,sw-6,3);x+=sw}y+=sh}},256,256));
      stoneTex.wrapS=stoneTex.wrapT=THREE.RepeatWrapping;stoneTex.repeat?.set?.(3,1.2);
      const floorTex=own(canvasTexture((c,W,H)=>{c.fillStyle='#6a5038';c.fillRect(0,0,W,H);for(let x=0;x<W;x+=32){c.fillStyle=`rgba(${30+((x*5)%30)},20,10,.4)`;c.fillRect(x,0,2,H)}},256,256));
      floorTex.wrapS=floorTex.wrapT=THREE.RepeatWrapping;floorTex.repeat?.set?.(4,3);
      const grassTex=own(canvasTexture((c,W,H)=>{c.fillStyle='#4e6b38';c.fillRect(0,0,W,H);for(let i=0;i<1400;i++){c.fillStyle=`rgba(${40+r()*50},${80+r()*50},${30+r()*30},.5)`;c.fillRect(r()*W,r()*H,1.5,3+r()*4)}},256,256));
      grassTex.wrapS=grassTex.wrapT=THREE.RepeatWrapping;grassTex.repeat?.set?.(6,4);
      const stone=std({color:0x8a857c,map:stoneTex,roughness:.95}),lime=std({color:0xe9e4d6,roughness:.95}),floor=std({color:0x8a6a4a,map:floorTex,roughness:.85}),
        thatch=std({color:0x8a7444,roughness:1}),wood=MAT.darkWood||std({color:0x3a2416,roughness:.7}),grass=std({color:0x6a8a50,map:grassTex,roughness:1});
      // Ground: the yard's grass, and the cottage's boards.
      box(w+2,.3,YARD+2,grass,cx,-.15,zy+YARD/2-.5,root);box(w,.3,d,floor,cx,-.149,cz,root);
      // Walls of stone, limewashed inside (thin skins on the inner faces), and the north wall cut for the door and window.
      const T=.4,wallAt=(width,height,x,y,z,inner,axis)=>{box(axis==='x'?width:T,height,axis==='x'?T:width,stone,x,y,z,root);
        if(inner)box(axis==='x'?width:.02,height,axis==='x'?.02:width,lime,x+(axis==='z'?inner*(T/2+.011):0),y,z+(axis==='x'?inner*(T/2+.011):0),root)};
      wallAt(w+T,h,cx,h/2,z1,-1,'x');wallAt(d,h,x0,h/2,cz,1,'z');wallAt(d,h,x1,h/2,cz,-1,'z');
      // The north wall in pieces: west of the window, under and over it, between window and door, over the door, east of the door.
      const wl=WINDOW.x-WINDOW.w/2,wr=WINDOW.x+WINDOW.w/2,dl=DOOR.x-DOOR.w/2,dr=DOOR.x+DOOR.w/2;
      const piece=(a,b,y0,y1)=>wallAt(b-a,y1-y0,(a+b)/2,(y0+y1)/2,z0,1,'x');
      piece(x0-T/2,wl,0,h);piece(wl,wr,0,WINDOW.sill);piece(wl,wr,WINDOW.top,h);piece(wr,dl,0,h);piece(dl,dr,2.1,h);piece(dr,x1+T/2,0,h);
      // The window's frame and the sill (where the book is left), and the door standing open into the room.
      const frame=std({color:0x2f5a6a,roughness:.7});
      for(const fx of [wl,wr])box(.06,WINDOW.top-WINDOW.sill,.12,frame,fx,(WINDOW.sill+WINDOW.top)/2,z0+.14,root);box(WINDOW.w,.06,.12,frame,WINDOW.x,WINDOW.top,z0+.14,root);box(.04,WINDOW.top-WINDOW.sill,.04,frame,WINDOW.x,(WINDOW.sill+WINDOW.top)/2,z0+.14,root);
      sill=new THREE.Group();sill.position.set(WINDOW.x+.3,WINDOW.sill+.03,z0+.28);root.add(sill);box(WINDOW.w+.1,.05,.36,lime,-.3,-.025,-.06,sill);
      const leaf=new THREE.Group();leaf.position.set(dr-.04,0,z0+.22);leaf.rotation.y=-1.9;root.add(leaf);box(DOOR.w-.08,2.05,.06,frame,-(DOOR.w-.08)/2,1.03,0,leaf);
      for(const fx of [dl,dr])box(.08,2.12,.44,wood,fx,1.06,z0,root);box(DOOR.w+.16,.1,.44,wood,DOOR.x,2.12,z0,root);
      // The ceiling's beams, and a roof of thatch over the whole, seen from the yard.
      box(w,.06,d,std({color:0x8a7458,roughness:.9}),cx,h-.03,cz,root);for(let i=0;i<5;i++)mark(box(.14,.16,d,wood,x0+.8+i*(w-1.6)/4,h-.12,cz,root),card('beams'));
      for(const side of [-1,1]){const slope=box(w+.8,.25,d/2+.9,thatch,cx,h+.65,cz+side*(d/4+.15),root);slope.rotation.x=side*.5}
      box(w+.8,.3,.3,thatch,cx,h+1.2,cz,root);
      // The cottage's front, outside: a name board over the door.
      const board=sign(root,'TRISTAN DA CUNHA','Edinburgh of the Seven Seas',2.2,.37,ROOM.cx-.1,2.42,z0-T/2-.02);board.rotation.y=Math.PI;mark(board,card('village'));
      // Blocks for the walls (the door is a gap in the north one: see allowed).
      // Inside: the sign, the shelves, the hearth, the table, the wheel and the potatoes.
      mark(sign(root,'TRISTAN DA CUNHA','The most remote inhabited island in the world',2.6,.42,cx,2.35,z1-.25),card('sign')).rotation.y=Math.PI;
      const {groups}=catalogue(),geometry=own(new THREE.BoxGeometry(.62,.86,.12)),ROWS=[1.05,1.95];
      for(const group of groups){
        const per=group.books.length>4?Math.ceil(group.books.length/2):Math.max(1,group.books.length),step=Math.min(1.0,(group.length-.3)/Math.max(1,per));
        group.books.forEach((book,i)=>{const row=i<per?0:1,n=row?group.books.length-per:per,col=row?i-per:i,offset=(col-(n-1)/2)*step;placeBook(book,{...shelfSpot(group,offset),y:ROWS[row]},geometry,group.key)});
        const rows=group.books.length>per?ROWS:ROWS.slice(0,1),s=shelfSpot(group,0,.36),top=group.wall==='west'?rows.at(-1)+.66:1.92,label=sign(root,group.name,group.sub,2.2,.36,0,top,0);
        if(group.wall==='west'){for(const y of rows)box(.34,.05,group.length,wood,s.x,y-.46,s.z,root);block(s.x,s.z,.7,group.length+.2);label.position.set(x0+.23,top,s.z);label.rotation.y=Math.PI/2}
        else{for(const y of rows)box(group.length,.05,.34,wood,s.x,y-.46,s.z,root);block(s.x,s.z,group.length+.2,.7);label.position.set(s.x,top,z1-.23);label.rotation.y=Math.PI}
        mark(label,card(group.key));
      }
      // The pictures: Earle's Solitude west of the window, Glass's house between window and door, the island from space east
      // of the door; the birds and the stamp on the east wall either side of the hearth.
      hang('solitude',x0+1.05,1.75,z0+.24,0,1.0);hang('glass',ROOM.cx+.12,1.65,z0+.24,0,.8);hang('space',ROOM.cx+3.05,1.85,z0+.24,0,.95);
      hang('thrush',x1-.24,1.85,cz-2.0,-Math.PI/2,.55);hang('bunting',x1-.24,1.9,cz+1.55,-Math.PI/2,.5);hang('stamp',x1-.24,1.95,cz+2.25,-Math.PI/2,.38);
      buildSouthWindow();buildHearth(stone,wood);buildTable(cx-.5,cz+.15,wood);buildWheel(wood);buildTelescope();buildYard(stone,wood);buildView();
      // The potatoes, in a sack by the door.
      const sack=add(own(new THREE.CylinderGeometry(.26,.3,.6,10)),std({color:0x9a8460,roughness:1}),DOOR.x+.95,.3,z0+.55,root);mark(sack,card('potatoes'));
      const spud=std({color:0xa8865a,roughness:.9});for(let i=0;i<5;i++)add(own(new THREE.SphereGeometry(.06,8,6)),spud,DOOR.x+.95+(r()-.5)*.25,.62,z0+.55+(r()-.5)*.25,root);block(DOOR.x+.95,z0+.55,.6,.6);
      // The evening sun, low in the north-west (the sun is north here), and the fire's glow.
      const sun=new THREE.DirectionalLight(0xffcf9a,1.25);sun.position.set(cx-30,9,cz-26);sun.target.position.set(cx,0,cz);root.add(sun);root.add(sun.target);
      fireLight=new THREE.PointLight(0xff9a4a,2.2,9,2);fireLight.position.set(x1-.75,.7,cz);root.add(fireLight);
      if(wasFound())leaveBook();
      placeVisitorsBook?.({parent:root,x:cx-2.65,z:cz+1.5,mark,own});
      scene.add(root);
    }
    function shelfSpot(group,offset,inset=.3){
      const {cx,cz}=ROOM;if(group.wall==='south')return {x:cx+group.along+offset,z:z1-inset,yaw:Math.PI};
      return {x:x0+inset,z:cz+group.along+offset,yaw:Math.PI/2}}
    function placeBook(book,spot,geometry,shelf,parent=root){
      const mesh=add(geometry,own(bookMaterial(book)),spot.x,spot.y,spot.z,parent);mesh.rotation.order='YXZ';mesh.rotation.y=spot.yaw||0;mesh.rotation.x=spot.tilt??-.08;
      mesh.userData={type:'book',book,loaded:false,tristan:true,shelf,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent}};
      interactables.push(mesh);ours.push(mesh);books.push(mesh);return mesh}
    // A framed picture from assets/pictures: a mount until the picture arrives, then the picture at its own shape.
    function hang(key,x,y,z,yaw,width){
      const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=yaw;root.add(g);const p=PICTURES[key],height=width*p.ratio;
      const data={type:'tristan-picture',picture:key,title:p.title,author:CARDS[p.card][1],action:'LOOK CLOSELY'};
      const frame=mark(box(width+.1,height+.1,.04,MAT.darkWood||std({color:0x2c1c12,roughness:.6}),0,0,0,g),data);
      const mat=std({color:0x9a927f,roughness:.9}),sheet=mark(add(own(new THREE.PlaneGeometry(width,height)),mat,0,0,.025,g),data);
      try{new THREE.TextureLoader().load(`${pictures}${p.file}-wall.jpg`,texture=>{if(!root)return texture.dispose?.();texture.colorSpace=THREE.SRGBColorSpace;own(texture);mat.map=texture;mat.color?.set?.(0xd8d4c8);mat.needsUpdate=true;
        const image=texture.image;if(image?.width&&image?.height){const k=image.height/image.width/p.ratio;sheet.scale.y=k;frame.scale.y=(height*k+.1)/(height+.1)}})}catch(e){}
      return g}
    // The small south window between the shelves, on the cliffs behind the village.
    function buildSouthWindow(){
      const {cx}=ROOM,g=new THREE.Group();g.position.set(cx,1.55,z1-.24);root.add(g);
      const view=own(canvasTexture((c,W,H)=>{const sky=c.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#7c8aa6');sky.addColorStop(1,'#d8b89a');c.fillStyle=sky;c.fillRect(0,0,W,H);
        c.fillStyle='rgba(240,240,245,.85)';c.beginPath();c.ellipse(W*.5,H*.12,W*.6,H*.14,0,0,7);c.fill();
        c.fillStyle='#3e5a36';c.beginPath();c.moveTo(0,H);c.lineTo(0,H*.32);for(let x=0;x<=W;x+=8)c.lineTo(x,H*(.26+.05*Math.sin(x*.05)+.03*Math.sin(x*.17)));c.lineTo(W,H);c.fill();
        c.fillStyle='rgba(30,40,30,.45)';for(let i=0;i<9;i++){const x=W*(i+.5)/9;c.fillRect(x,H*.3,3,H*.5)}
        c.fillStyle='#5f7d45';c.fillRect(0,H*.82,W,H*.18)},256,192));
      mark(add(own(new THREE.PlaneGeometry(.9,.68)),own(new THREE.MeshBasicMaterial({map:view,fog:false})),0,0,-.01,g),card('south')).rotation.y=Math.PI;
      const frame=std({color:0x2f5a6a,roughness:.7});box(1.02,.06,.08,frame,0,.37,0,g);box(1.02,.06,.08,frame,0,-.37,0,g);box(.06,.8,.08,frame,-.48,0,0,g);box(.06,.8,.08,frame,.48,0,0,g);box(.03,.7,.04,frame,0,0,0,g);
    }
    // The hearth in the east wall: a stone chimney breast, a fire of embers that flickers, a kettle on its hook.
    function buildHearth(stone,wood){
      const {cz}=ROOM,g=new THREE.Group();g.position.set(x1-.45,0,cz);root.add(g);const data=card('hearth');
      for(const part of [box(.5,ROOM.h,.4,stone,0,ROOM.h/2,-.85,g),box(.5,ROOM.h,.4,stone,0,ROOM.h/2,.85,g),box(.5,ROOM.h-1.1,1.3,stone,0,1.1+(ROOM.h-1.1)/2,0,g),box(.7,.08,2.1,wood,-.05,1.15,0,g)])mark(part,data);
      box(.4,.1,1.3,std({color:0x2a2420,roughness:1}),.02,.05,0,g);
      fire=add(own(new THREE.SphereGeometry(.22,10,6,0,Math.PI*2,0,Math.PI/2)),std({color:0x3a1a0a,emissive:0xff6a1a,emissiveIntensity:1.6,roughness:1}),0,.1,0,g);fire.scale.set(1,.5,1.6);mark(fire,data);
      for(let i=0;i<3;i++){const log=add(own(new THREE.CylinderGeometry(.04,.05,.6,6)),std({color:0x3a2a1a,roughness:1}),0,.14,(i-1)*.14,g);log.rotation.x=Math.PI/2;log.rotation.z=(i-1)*.3}
      const iron=std({color:0x2a2622,metalness:.4,roughness:.6}),hob=std({color:0x5a554e,roughness:1});for(const sz of [-.42,.42])box(.3,.26,.16,hob,-.02,.13,sz,g);for(const sx of [-.08,.06])box(.025,.025,1.0,iron,sx,.27,0,g);
      const pot=add(own(new THREE.CylinderGeometry(.14,.12,.2,14)),iron,0,.39,.12,g);mark(pot,data);
      block(x1-.45,cz,.7,2.2);
    }
    // The table with the lamp and the bottle home, and two chairs that are the library's seats.
    function buildTable(x,z,wood){
      const g=new THREE.Group();g.position.set(x,0,z);root.add(g);
      const top=box(1.6,.05,.95,wood,0,.76,0,g);for(const [lx,lz] of [[-.72,-.4],[.72,-.4],[-.72,.4],[.72,.4]])box(.06,.75,.06,wood,lx,.375,lz,g);
      box(1.4,.012,.75,std({color:0xcfc6b0,roughness:.95}),0,.79,0,g);
      // A knitted pair of socks and a mug, and the lamp.
      box(.24,.03,.1,std({color:0x6a5a48,roughness:1}),-.45,.81,.2,g);add(own(new THREE.CylinderGeometry(.045,.04,.1,12)),std({color:0xe8e2d2,roughness:.5}),-.2,.85,-.2,g);
      const brass=MAT.brass||std({color:0xb08d3a,metalness:.6,roughness:.4});add(own(new THREE.CylinderGeometry(.06,.08,.06,12)),brass,-.55,.83,-.15,g);
      add(own(new THREE.CylinderGeometry(.06,.05,.18,12,1,true)),std({color:0xfff4d6,emissive:0xffc070,emissiveIntensity:1.3,transparent:true,opacity:.8}),-.55,.95,-.15,g);
      // The bottle home: the same ship in its cradle, a brass plate, and the sign behind it.
      const glass=std({color:0xd9efe6,transparent:true,opacity:.22,roughness:.05,metalness:.1,depthWrite:false}),exit={type:'tristan-exit',title:'Back to the Long Corridor',author:'Into the bottle, and out again on the shelf in the Long Corridor, towards the Grand Hall.',action:'RETURN'};
      const b=new THREE.Group();b.position.set(.38,.88,.12);g.add(b);const body=add(own(new THREE.CylinderGeometry(.085,.085,.38,18,1,true)),glass,0,0,0,b);body.rotation.z=Math.PI/2;
      const neck=add(own(new THREE.CylinderGeometry(.028,.032,.12,10,1,true)),glass,-.25,0,0,b);neck.rotation.z=Math.PI/2;add(own(new THREE.CylinderGeometry(.026,.022,.05,10)),std({color:0x9a7448,roughness:.9}),-.33,0,0,b).rotation.z=Math.PI/2;
      const hull=box(.12,.022,.035,std({color:0x3b2414,roughness:.6}),-.04,-.03,0,b);box(.003,.1,.003,std({color:0x5a3a1e}),-.04,.02,0,b);add(own(new THREE.PlaneGeometry(.05,.05)),std({color:0xf1e9d4,side:THREE.DoubleSide}),-.04,.02,.003,b);
      box(.4,.03,.12,wood,0,-.1,0,b);
      const plate=own(canvasTexture((c,W,H)=>{c.fillStyle='#caa15a';c.fillRect(0,0,W,H);c.strokeStyle='#6b4d22';c.lineWidth=4;c.strokeRect(5,5,W-10,H-10);c.fillStyle='#2b1d0e';c.textAlign='center';
        c.font='bold 26px Georgia';c.fillText('THE LONG CORRIDOR',W/2,40);c.font='italic 18px Georgia';c.fillText('towards the Grand Hall',W/2,68)},400,86));
      const label=add(own(new THREE.PlaneGeometry(.34,.075)),std({map:plate,roughness:.5,metalness:.3}),0,-.1,.065,b);
      const signTex=own(canvasTexture((c,W,H)=>{c.fillStyle='#c9a057';c.fillRect(0,0,W,H);c.strokeStyle='#6b4d22';c.lineWidth=6;c.strokeRect(8,8,W-16,H-16);c.fillStyle='#2b1d0e';c.textAlign='center';
        c.font='bold 40px Georgia';c.fillText('THE WAY HOME',W/2,66);c.font='italic 32px Georgia';c.fillText('look into the bottle',W/2,112);c.font='bold 28px Georgia';c.fillText('THE LONG CORRIDOR',W/2,150)},420,180));
      const signMat=std({map:signTex,roughness:.45,metalness:.35}),brassMat=std({color:0xb08d3a,metalness:.6,roughness:.4}),signParts=[];
      for(const side of [1,-1]){const face=add(own(new THREE.PlaneGeometry(.36,.155)),signMat,0,.12,-.13+side*.004,b);if(side<0)face.rotation.y=Math.PI;signParts.push(face)}
      signParts.push(box(.37,.165,.006,brassMat,0,.12,-.13,b),box(.012,.14,.012,brassMat,0,-.03,-.13,b),box(.09,.012,.05,brassMat,0,-.1,-.13,b));
      for(const part of [body,neck,hull,label,...signParts])mark(part,exit);
      block(x,z,1.8,1.15);
      for(const side of [-1,1]){const chair=new THREE.Group();chair.position.set(x+side*1.15,0,z);chair.rotation.y=side*Math.PI/2;root.add(chair);
        const parts=[box(.44,.04,.42,wood,0,.46,0,chair),box(.44,.55,.035,wood,0,.8,.2,chair)];for(const [lx,lz] of [[-.19,-.18],[.19,-.18],[-.19,.18],[.19,.18]])box(.035,.46,.035,wood,lx,.23,lz,chair);
        block(x+side*1.15,z,.5,.5);registerSeat?.(parts,chair,new THREE.Vector3(0,1.18,-.05),side*Math.PI/2,{title:'A chair at the table',author:'Sit at the cottage table and read one of the island’s books.',bookIds:books.map(b=>b.userData.book.id)});for(const part of parts)ours.push(part)}
    }
    // A spinning wheel by the hearth.
    function buildWheel(wood){
      const g=new THREE.Group();g.position.set(x1-1.25,0,ROOM.cz-1.45);g.rotation.y=.5;root.add(g);const data=card('wheel');
      const rim=add(own(new THREE.TorusGeometry(.32,.02,6,28)),wood,0,.72,0,g);rim.rotation.y=Math.PI/2;mark(rim,data);
      for(let i=0;i<6;i++){const spoke=box(.015,.62,.015,wood,0,.72,0,g);spoke.rotation.x=i*Math.PI/6}
      for(const part of [box(.05,.06,.9,wood,0,.32,.15,g),box(.04,.7,.04,wood,0,.36,-.05,g),box(.04,.5,.04,wood,0,.26,.5,g)])mark(part,data);
      add(own(new THREE.SphereGeometry(.07,8,6)),std({color:0xe8e0cc,roughness:1}),0,.82,.5,g);block(x1-1.25,ROOM.cz-1.45,.7,.9);
    }
    // The telescope on its stand at the north window: the secret.
    function buildTelescope(){
      const g=new THREE.Group();g.position.set(WINDOW.x-.15,0,z0+.75);root.add(g);const brass=std({color:0xb08d3a,metalness:.65,roughness:.35}),wood=MAT.darkWood||std({color:0x3a2416,roughness:.7});
      const data={type:'tristan-telescope',title:CARDS.telescope[0],author:CARDS.telescope[1],action:'LOOK THROUGH'};
      const parts=[];for(let i=0;i<3;i++){const leg=box(.03,1.15,.03,wood,Math.cos(i*2.1)*.18,.55,Math.sin(i*2.1)*.18,g);leg.rotation.set(Math.sin(i*2.1)*.16,0,-Math.cos(i*2.1)*.16);parts.push(leg)}
      const tube=add(own(new THREE.CylinderGeometry(.035,.05,.85,14)),brass,0,1.18,0,g);tube.rotation.x=Math.PI/2-.08;parts.push(tube,add(own(new THREE.CylinderGeometry(.055,.055,.08,14)),brass,0,1.21,-.4,g));parts[4].rotation.x=Math.PI/2;
      for(const part of parts)mark(part,data);block(WINDOW.x-.15,z0+.75,.5,.5);
    }
    // The yard: a stone wall round it, a longboat on trestles, flax.
    function buildYard(stone,wood){
      const {cx}=ROOM,data=card('edge'),wh=.85;
      for(const part of [box(ROOM.w+.4,wh,.4,stone,cx,wh/2,zy,root),box(.4,wh,YARD,stone,x0-.1,wh/2,zy+YARD/2,root),box(.4,wh,YARD,stone,x1+.1,wh/2,zy+YARD/2,root)])mark(part,data);
      const g=new THREE.Group();g.position.set(cx-1.3,0,zy+2.1);root.add(g);const lb=card('longboat');
      const canvas=std({color:0xe6dfcc,roughness:.9}),blue=std({color:0x2f5a6a,roughness:.8});
      const hullGeo=own(new THREE.SphereGeometry(1,24,10,0,Math.PI*2,Math.PI/2,Math.PI/2));const shell=add(hullGeo,canvas,0,.95,0,g);shell.scale.set(2.1,.45,.62);mark(shell,lb);
      const inner=add(hullGeo,std({color:0x6a4a2e,roughness:.85,side:THREE.BackSide}),0,.95,0,g);inner.scale.set(2.06,.43,.6);mark(inner,lb);
      for(const tx of [-1.1,-.3,.5,1.2])mark(box(.12,.04,1.2*Math.sqrt(1-(tx/2.1)**2),wood,tx,.9,0,g),lb);
      for(const sx of [-1.3,1.3]){for(const sz of [-.35,.35])box(.08,.6,.08,wood,sx,.3,sz,g);box(.08,.08,.9,wood,sx,.6,0,g)}
      add(own(new THREE.CylinderGeometry(.02,.02,.5,6)),blue,1.95,1.12,0,g).rotation.z=.6;
      const oar=box(2.6,.04,.08,wood,.2,1.0,.1,g);oar.rotation.y=.08;block(cx-1.3,zy+2.1,4.4,1.4);
      const flax=std({color:0x4a6a38,roughness:.9,side:THREE.DoubleSide});
      for(const [fx,fz] of [[x1-.7,zy+.7],[x1-1.5,zy+.6],[x0+.6,zy+.6]]){for(let i=0;i<7;i++){const blade=add(own(new THREE.PlaneGeometry(.08,1.1)),flax,fx,.5,fz,root);blade.rotation.set(Math.sin(i)*.35,i*.9,Math.cos(i*1.3)*.3)}block(fx,fz,.5,.5)}
    }
    // The view: the sea from west through north to east under the evening sun in the north-west; the plain running east and
    // west with the village's houses; the cone of 1961 to the east; and behind, to the south, the cliffs and the peak in its
    // cloud. One painted ring all round the yard, a dome of sky, and the ships the telescope finds, out to the north.
    function buildView(){
      const {cx}=ROOM;
      const pano=own(canvasTexture((c,W,H)=>{c.translate(W,0);c.scale(-1,1);// seen from inside: drawn mirrored. North at 0 and W, east at W/4, south at W/2, west at 3W/4.
        let k=31;const r=()=>(k=(k*9301+49297)%233280)/233280,hz=H*HORIZON;
        const sky=c.createLinearGradient(0,0,0,hz);sky.addColorStop(0,'#3a4a6e');sky.addColorStop(.55,'#8a8aa4');sky.addColorStop(1,'#e6b48a');c.fillStyle=sky;c.fillRect(0,0,W,H);
        // The sun low in the north-west (between 3W/4 and W), and its glow.
        const sx=W*.9;for(const gx of [sx,sx-W]){const glow=c.createRadialGradient(gx,hz-H*.06,4,gx,hz-H*.06,W*.16);glow.addColorStop(0,'rgba(255,226,170,1)');glow.addColorStop(.12,'rgba(255,200,140,.7)');glow.addColorStop(1,'rgba(255,170,120,0)');c.fillStyle=glow;c.fillRect(0,0,W,hz)}
        c.fillStyle='#fff3d6';c.beginPath();c.arc(sx,hz-H*.06,9,0,7);c.fill();
        // Clouds breaking after the gale: long dark bars lit underneath.
        for(let i=0;i<26;i++){const x=r()*W,y=H*(.12+r()*.3),w=60+r()*200;c.fillStyle=`rgba(${70+r()*40},${70+r()*40},${96+r()*40},.55)`;c.beginPath();c.ellipse(x,y,w,7+r()*9,0,0,7);c.fill();c.fillStyle='rgba(255,200,150,.25)';c.beginPath();c.ellipse(x,y+6,w*.8,3,0,0,7);c.fill()}
        // The sea, with the swell, and the sun's path on it.
        const sea=c.createLinearGradient(0,hz,0,H);sea.addColorStop(0,'#4a5e7a');sea.addColorStop(1,'#1c2a3e');c.fillStyle=sea;c.fillRect(0,hz,W,H-hz);
        c.fillStyle='rgba(255,226,170,.45)';for(let i=0;i<80;i++)c.fillRect(sx-W*.03+r()*W*.06,hz+r()*H*.1,6+r()*24,1.2);
        c.fillStyle='rgba(255,255,255,.4)';for(let i=0;i<140;i++)c.fillRect(r()*W,hz+H*.01+r()*H*.08,3+r()*10,1);
        // The south: the cliffs behind the plain, steep and green-black, with the peak's cone above them in its cloud.
        const ridge=(from,to,top,color)=>{c.fillStyle=color;c.beginPath();c.moveTo(W*from,H);for(let t=0;t<=1.0001;t+=.01){const x=from+(to-from)*t,edge=Math.min(1,Math.min(t,1-t)*9);c.lineTo(W*x,hz-H*top*edge+H*.012*Math.sin(t*47)+H*.008*Math.sin(t*13))}c.lineTo(W*to,H);c.fill()};
        // The peak's cone, behind and above the cliffs.
        c.fillStyle='#4a4e52';c.beginPath();c.moveTo(W*.4,hz-H*.3);c.lineTo(W*.485,hz-H*.47);c.lineTo(W*.515,hz-H*.47);c.lineTo(W*.6,hz-H*.3);c.fill();
        c.fillStyle='rgba(235,235,242,.92)';for(let i=0;i<10;i++){c.beginPath();c.ellipse(W*(.44+r()*.12),hz-H*(.42+r()*.06),W*(.02+r()*.03),H*(.025+r()*.02),0,0,7);c.fill()}
        ridge(.3,.7,.34,'#2e3f2a');
        c.fillStyle='rgba(20,30,20,.35)';for(let i=0;i<40;i++){const x=W*(.32+r()*.36);c.fillRect(x,hz-H*(.05+r()*.25),2,H*.2)}
        // The cone of 1961 to the east, dark, and its lava running to the sea.
        c.fillStyle='#3a3430';c.beginPath();c.moveTo(W*.19,hz+H*.04);c.quadraticCurveTo(W*.205,hz-H*.045,W*.215,hz-H*.05);c.quadraticCurveTo(W*.225,hz-H*.045,W*.24,hz+H*.04);c.fill();c.fillStyle='rgba(80,110,60,.5)';c.beginPath();c.moveTo(W*.2,hz+H*.03);c.quadraticCurveTo(W*.215,hz-H*.01,W*.23,hz+H*.03);c.fill();
        c.fillStyle='#1e1c1c';c.beginPath();c.moveTo(W*.19,hz+H*.06);c.lineTo(W*.16,hz+H*.02);c.lineTo(W*.21,hz+H*.03);c.fill();
        // The plain: green, running along the coast both ways, with the village's houses, white with green and red roofs.
        c.fillStyle='#4f6e3a';c.beginPath();c.moveTo(W*.08,H);c.quadraticCurveTo(W*.14,hz+H*.03,W*.24,hz+H*.02);c.lineTo(W*.76,hz+H*.02);c.quadraticCurveTo(W*.86,hz+H*.03,W*.92,H);c.fill();
        for(let i=0;i<34;i++){const side=r()<.5,x=W*(side?.27+r()*.2:.55+r()*.2),y=hz+H*(.035+r()*.05),s=6+r()*8;c.fillStyle='#e6e2d6';c.fillRect(x,y,s*1.6,s*.8);c.fillStyle=r()<.5?'#4a7a4a':'#8a3a2a';c.beginPath();c.moveTo(x-2,y);c.lineTo(x+s*.8,y-s*.6);c.lineTo(x+s*1.6+2,y);c.fill()}
        c.strokeStyle='rgba(60,56,50,.6)';c.lineWidth=1.5;for(let i=0;i<20;i++){const x=W*(.25+r()*.5),y=hz+H*(.04+r()*.1);c.beginPath();c.moveTo(x,y);c.lineTo(x+40+r()*80,y+r()*4);c.stroke()}
        // The near ground under the yard wall, all round.
        c.fillStyle='#41602f';c.beginPath();c.moveTo(0,H);for(let x=0;x<=W;x+=16)c.lineTo(x,H*(.84+.02*Math.sin(x/W*Math.PI*2*9)+.008*Math.sin(x/W*Math.PI*2*23)));c.lineTo(W,H);c.fill()},4096,512));
      const g=new THREE.Group();g.position.set(cx,0,z0);root.add(g);
      const ring=add(own(new THREE.CylinderGeometry(R,R,PANO,64,1,true,-Math.PI,Math.PI*2)),own(new THREE.MeshBasicMaterial({map:pano,side:THREE.BackSide,fog:false})),0,EYE+PANO*(HORIZON-.5),0,g);ring.raycast=()=>{};
      const domeTex=own(canvasTexture((c,W,H)=>{const gr=c.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#2a3858');gr.addColorStop(1,'#3a4a6e');c.fillStyle=gr;c.fillRect(0,0,W,H)},64,64));
      const dome=add(own(new THREE.SphereGeometry(R+.5,32,12,0,Math.PI*2,0,Math.PI/2)),own(new THREE.MeshBasicMaterial({map:domeTex,side:THREE.BackSide,fog:false})),0,EYE+PANO*HORIZON-.4,0,g);dome.raycast=()=>{};
      const under=add(own(new THREE.CircleGeometry(R-.2,48)),own(new THREE.MeshBasicMaterial({color:0x2c4a24,fog:false})),0,EYE+PANO*(HORIZON-.5)-PANO/2+.05,0,g);under.rotation.x=-Math.PI/2;under.raycast=()=>{};
      // The ships, out to the north, hidden until the telescope finds them.
      sails=SHIPS.map(ship=>{
        const tex=own(canvasTexture((c,W,H)=>{c.clearRect(0,0,W,H);c.fillStyle='#2a2420';c.beginPath();c.moveTo(W*.1,H*.74);c.lineTo(W*.9,H*.74);c.lineTo(W*.82,H*.86);c.lineTo(W*.18,H*.86);c.fill();
          const masts=ship.funnel?[.32,.72]:[.36,.62];c.strokeStyle='#3a3028';c.lineWidth=2;for(const m of masts){c.fillStyle='#2a2420';c.fillRect(W*m-1,H*.1,2.5,H*.64);c.fillStyle='#c9b08a';c.beginPath();c.moveTo(W*m,H*.14);c.lineTo(W*(m+.17),H*.68);c.lineTo(W*(m-.02),H*.68);c.closePath();c.fill();c.stroke()}
          if(ship.funnel){c.fillStyle='#1c1a18';c.fillRect(W*.5,H*.46,W*.06,H*.28);c.fillStyle='rgba(80,76,72,.6)';c.beginPath();c.ellipse(W*.58,H*.38,W*.08,H*.06,0,0,7);c.fill()}},96,96));
        const a=ship.x*.05,sail=add(own(new THREE.PlaneGeometry(1.3,1.3)),own(new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,fog:false,opacity:0})),Math.sin(a)*(R-1),EYE+.47,-Math.cos(a)*(R-1),g);sail.rotation.y=-a;
        sail.raycast=()=>{};sail.visible=false;sail.userData.rise=0;return sail});
    }
    function leaveBook(){
      const book=catalogue().secret[0];if(!book||sillBook||!sill)return;
      sillBook=placeBook(book,{x:0,y:.07,z:0,yaw:0,tilt:-Math.PI/2},own(new THREE.BoxGeometry(.62,.86,.12)),'secret',sill)}

    // ---------- walking ----------
    function contains(x,z){return x>x0-.3&&x<x1+.3&&z>zy&&z<z1}
    function floorAt(x,z){return contains(x,z)?0:null}
    function allowed(x,z){
      if(!contains(x,z))return false;const rad=player.radius||.42;
      // Through the front door only, between the yard and the cottage.
      if(z>z0-.45&&z<z0+.45)return Math.abs(x-DOOR.x)<.32;
      if(z<z0){if(x-rad<x0+.15||x+rad>x1-.15||z-rad<zy+.25)return false}
      else if(x-rad<x0+.25||x+rad>x1-.25||z+rad>z1-.25||z-rad<z0+.22)return false;
      return !blockers.some(b=>x+rad>b.minX&&x-rad<b.maxX&&z+rad>b.minZ&&z-rad<b.maxZ)}

    // ---------- doing things ----------
    function enter(){
      activate();move(ROOM.cx+.4,ROOM.cz+1.6,0);playSample?.('pageTurn',.35,.6);
      showNotice('Tristan da Cunha, on an evening after a gale: a stone cottage in the Settlement, its door open on a yard, the sea and the low sun beyond. The bottle you came through is on the table, to take you back.',13);
      analytics?.track('Room Explored',{room:'tristan'})}
    function leave(){const p=bottles?.standBefore?.('tristan')||{x:1701,z:-2,yaw:-Math.PI/2};move(p.x,p.z,p.yaw);playSample?.('pageTurn',.35,.6);showNotice('The Long Corridor again, and the bottle back on its shelf.',4)}
    function look(){
      const i=looks%SHIPS.length,ship=SHIPS[i];looks++;
      for(const [j,sail] of sails.entries()){sail.visible=j===i;if(j===i)sail.userData.rise=0}
      const first=!wasFound()&&looks>=SHIPS.length;
      if(first){try{storage?.setItem(FOUND_KEY,'1')}catch(e){}leaveBook();analytics?.track('Secret Found',{room:'tristan',secret:'as-many-as-we-require'});
        showNotice(`${ship.text} ${q('many')}, Glass replies. ${q('port')} Three ships from three books, and someone has left An Antarctic Mystery on the window sill.`,18);return}
      showNotice(`${ship.name} (${ship.book}). ${ship.text}`,ship.text.length>220?14:10)}
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('tristan-'))return false;
      if(data.type==='tristan-exit'){leave();return true}
      if(data.type==='tristan-telescope'){look();return true}
      if(data.type==='tristan-picture'){const p=PICTURES[data.picture];if(showPicture)showPicture({kicker:'TRISTAN DA CUNHA',title:p.title,src:`${pictures}${p.file}.jpg`,caption:data.author,credit:p.credit});else showNotice(`${p.title}: ${data.author}`,12);return true}
      if(data.type==='tristan-card'){showNotice(`${data.title}: ${data.author}`,data.author.length>320?18:data.author.length>160?13:9);return true}
      return false}

    // ---------- lifecycle ----------
    function activate(){if(!root)buildCottage();lastNeeded=time}
    function unload(){
      if(!root)return;root.removeFromParent();root.traverse(object=>{if(object.isLight)object.userData.freed=true});root=null;sails=[];sill=null;sillBook=null;fire=null;fireLight=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0}
    function update(t){
      // Built ahead while the reader stands by the bottles' shelf, so that looking in does not wait.
      const dt=Math.min(.1,Math.max(0,t-time));time=t;const inside=contains(player.pos.x,player.pos.z),bay=bottles?.bay,near=!!bay&&Math.hypot(player.pos.x-bay.x,player.pos.z-bay.z)<3.2;
      if(inside||near&&(root||window.libraryMayBuild?.()!==false))activate();
      else if(root&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==b.userData.home.parent))unload();
      if(!inside||!root)return;
      const flick=1+.12*Math.sin(t*9)+.07*Math.sin(t*23+1);if(fire)fire.material.emissiveIntensity=1.6*flick;if(fireLight)fireLight.intensity=2.2*flick;
      for(const sail of sails)if(sail.visible&&sail.userData.rise<1){sail.userData.rise=Math.min(1,sail.userData.rise+dt/4);sail.material.opacity=sail.userData.rise}}
    return {contains,floorAt,allowed,interact,update,enter,leave,activate,unload,catalogue,room:ROOM,yard:YARD,door:DOOR,window:WINDOW,groups:GROUPS,own:OWN,quotes:QUOTES,sources:SOURCES,cards:CARDS,ships:SHIPS,pictures:PICTURES,
      get built(){return !!root},get books(){return books.slice()},get found(){return wasFound()},get looks(){return looks},zoneAt:(x,z)=>contains(x,z)?'tristan':null};
  };
})();
