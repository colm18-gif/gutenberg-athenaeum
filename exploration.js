// Exploration: small things that make the library worth wandering, all in one place and none of them with a light
// of its own (the explorers' anteroom has its one lamp, like every room behind a door).
//
//   Sounds under the doors   a room not yet found is heard, muffled, through its closed door (room-ambience.js `leak`)
//   The night porter         now and then a lantern moves far off and leads towards a door not yet opened
//   The plan                 the journal's plan of the hall keeps the reader's route, a compass and its dragons
//   Draughts                 dust drifts towards a mystery not yet solved
//   Footprints               the reader's own in the dusty places below, and an earlier reader's in the basement
//   The despatch tube        a brass tube on a column of the Grand Hall drops capsules with slips from the stacks
//   Marginalia               a book picked up may have a pencilled note on its flyleaf pointing to its room
//   Treasures                the Book of Kells is pointed out by a slip and a pencilled note until it has been opened
//   Closing time             from half past ten at night the wings and then the hall dim, and the reader's lantern shows
//   The real sky             the moonlight follows tonight's moon; the Antipodes skylight turns with the southern sky
//   Stopped clocks           three clocks on the hall's columns stopped at the hours books stopped them
//   The explorers' anteroom  through the kit locker in the Map Room's corner: kit on pegs, a sledge, a ledger of departures
//   The book trolley         a trolley met somewhere new each visit, with three books and their return slips
//
// Every quotation is checked against the bundled texts by exploration.test.cjs.
(function(){
  'use strict';
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

  // ---------- Where the rooms are, and how to find them ----------
  // A room's door as the hall sees it: the place it opens on, the door, and a step in front of it.
  const DOORS=[
    ['irish-room',-8.3,30.45,-8.3,29.1],['boathouse',-4.5,30.45,-4.5,29.1],['periodicals-room',0,30.45,0,29.1],['international-wing',8.6,30.45,8.6,29.1],
    ['austen-room',-18.72,12.9,-17.4,12.9],['within-room',-18.45,7.3,-17.2,7.3],['daily-room',-18.72,-14.5,-17.4,-14.5],
    ['map-room',-21.4,-13.45,-21.4,-12.2],['learners-room',-23,9.45,-23,8.2],['lost-property',-33.9,9.5,-33.9,8.2],
    ['evening-room',21.8,9.45,21.8,8.2],['chance-room',36.6,2.05,35.3,2.05],['station-subway',14,-17.7,14,-13.4],
    ['mountain',-7.78,-29.93,-7.78,-28.4],['contested',56.5,-2,55.2,-2]
  ];
  // Slips from the stacks and pencilled notes: how to find each room, in the library's own words. A room behind another
  // is offered only once the room before it is found.
  const HINTS={
    'irish-room':['The green door in the Grand Hall’s south wall, gilded IRELAND & SCOTLAND.'],
    boathouse:['The planked door in the Grand Hall’s south wall. Mind the tide.'],
    'periodicals-room':['The middle door of the Grand Hall’s south wall. The evening papers are in.'],
    'international-wing':['The door beside the visitors’ book, by the sunflowers.'],
    'austen-room':['The Grand Hall’s west wall, between the gramophone and the botanist’s portrait.'],
    'within-room':['The card catalogue against the Grand Hall’s west wall. Pull more than one drawer.'],
    'daily-room':['The door at the north end of the Grand Hall’s west wall. It is a different room every day.'],
    'map-room':['The west wing’s north wall. Twenty maps, edge to edge.'],
    'learners-room':['The west wing’s south wall, the green door.'],
    'lost-property':['Ring the bell at the book lift in the west wing’s south wall.'],
    'evening-room':['The east wing’s south wall, the red door.'],
    'chance-room':['A small crooked portrait on the east wing’s east wall.'],
    'station-subway':['The steps going down through the Grand Hall’s floor, TO THE TRAINS.'],
    mountain:['The painting of a mountain by moonlight on the Grand Hall’s north wall. Look closely.'],
    contested:['Through the Restricted Catalogue, the door bound in banned books.'],
    antipodes:['Turn the great globe in the middle of the Grand Hall.'],
    'nights-courtyard':['The carpet rolled and tied by the Grand Hall’s fire.'],
    'roof-garden':['Up the stair on the Grand Hall’s east side, and on past the roofline.'],
    'african-courtyard':['The balloon moored in the roof garden.','roof-garden'],
    'medicine-room':['Through the Map Room: the door at the south end of its east wall.','map-room'],
    'naturalist-room':['Through the Medicine Room: the conservatory-green door in its west wall.','medicine-room'],
    walden:['Out through the garden door of the Naturalist’s Cabinet.','naturalist-room'],
    'burns-room':['Through the Irish Room, past the harp.','irish-room'],
    'canada-room':['Through the Burns Room, past the fiddle.','burns-room'],
    lilliput:['The narrow door in the corner of the Irish Room, past the writers’ shelves.','irish-room'],
    brobdingnag:['Through Lilliput: the door at the far end of the Emperor’s library.','lilliput'],
    'set-texts-room':['The blue door in the English Reading Room’s east wall.','learners-room'],
    'crusoe-island':['Through the Boathouse, and out to sea.','boathouse'],
    'explorers-anteroom':['The kit locker in the Map Room’s north-west corner. Push past the oilskins.','map-room']
  };
  // A book’s shelf (its `room` in data/new-books.js), and the room it stands in.
  const SHELF_PLACES=[[/^irish-/,'irish-room'],[/^burns-(works|lives|scotland)$/,'burns-room'],[/^canada-(stories|north|poets)$/,'canada-room'],[/^lilliput-(swift|small)$/,'lilliput'],[/^brob-/,'brobdingnag'],[/^austen-(writings|lives|read|novels)$/,'austen-room'],
    [/^nature-(origin|collectors|observers)$/,'naturalist-room'],[/^medicine-/,'medicine-room'],[/^map-/,'map-room'],[/^walden-(thoreau|concord)$/,'walden'],[/^nights-(tales|poets|echoes)$/,'nights-courtyard'],
    [/^african-/,'african-courtyard'],[/^within-/,'within-room'],[/^contested$/,'contested'],[/^set-texts$/,'set-texts-room'],[/^lost-property$/,'lost-property'],[/^(antipodes|australian|new-zealand)$/,'antipodes'],[/^mountain-valley$/,'mountain']];
  // The shelves the book trolley takes from: books on their way back to their rooms.
  const TROLLEY_SHELVES=['irish-myth','irish-revival','irish-writers','burns-works','burns-lives','burns-scotland','canada-stories','canada-north','canada-poets','lilliput-swift','lilliput-small','brob-giants','brob-seeing','brob-swift','austen-writings','austen-lives','austen-read',
    'nature-collectors','nature-observers','medicine-physic','medicine-discovery','medicine-healers','map-voyages','map-makers','map-lands','walden-thoreau','walden-concord','nights-tales','nights-poets','nights-echoes',
    'african-ancient','african-voices','african-tales','within-read','contested','mountain-valley'];
  // Pencilled notes: a book by one of these, picked up anywhere, may point to the room kept for them.
  const MARGINS=[[/Jane Austen/,'austen-room','There is a whole room of her. West wall of the Grand Hall.'],[/Robert Burns/,'burns-room','Burns has a cottage. Through the Irish Room, past the harp.'],
    [/Thoreau/,'walden','The pond is real. Out through the Naturalist’s garden door.'],[/Charles Darwin|Russel Wallace/,'naturalist-room','His study is kept, beetles and all. Through the Medicine Room.'],
    [/Jules Verne/,'nemo-room','Look into the lit windows of the model Nautilus.'],[/Edgar Allan Poe/,'poe-room','Listen for a heart under the floor. The Gothic Parlour, under the raven.'],
    [/Daniel Defoe/,'crusoe-island','He is still on his island. Through the Boathouse door.'],[/Shakespeare/,'set-texts-room','The Folio is under glass. Blue door, English Reading Room.'],
    [/W\. ?B\. Yeats|Lady Gregory|J\. ?M\. Synge|James Joyce/,'irish-room','Green door, south wall. There is a turf fire.'],[/Montgomery|Robert W\. Service|John McCrae/,'canada-room','Snow on the window. Through the Burns Room.'],[/Jonathan Swift/,'lilliput','Mind where you step. The narrow door in the Irish Room.'],
    [/Lewis Carroll/,'antipodes','Turn the globe and fall, as she did.'],[/Coleridge|Whymper|John Muir/,'mountain','Climb the painting on the north wall.'],
    [/Arabian Nights|Thousand and One Nights/,'nights-courtyard','The carpet by the fire flies.'],[/Hakluyt|Pigafetta|Lewis and Clark|Matthew Henson/,'explorers-anteroom','Their kit is in the locker in the Map Room’s corner.']];
  // Treasures a reader may walk past: the stacks send a slip, and a book about them carries a pencilled note, until the
  // reader has looked into the case (game.js sets `seen` when the book is first opened).
  const TREASURES={kells:{seen:'athenaeum-kells-seen',room:'irish-room',slip:'The Book of Kells lies open under glass in the middle of the Irish Room, at Christ enthroned. The green door in the Grand Hall’s south wall.',
    margin:[/Kells|Durrow|Colum ?Cille|Columba|Celtic|Patricii|Saint Patrick|W\. ?B\. Yeats|Lady Gregory|J\. ?M\. Synge/i,'The Book of Kells is open under glass in the Irish Room. Green door, south wall.']}};
  // Where a mystery is: dust drifts towards the ones not yet recorded (positions as Clio leads to them).
  const DRAUGHTS={'folded-note':[5.2,.95,3.6],'book-under-table':[7,.44,6.4],'book-mantel':[-13,5.6,-27.25],'book-balcony':[15,5.5,25],'roof-book':[-13.2,10.44,41.15],
    'west-shelf':[-36.3,1.6,-3],'tunnel':[-51.8,1.5,-3],'below-catalogue':[-7,.1,-25.8]};

  // ---------- Three stopped clocks, on columns of the Grand Hall ----------
  const CLOCKS=[
    {key:'havisham',x:10.52,z:-5,yaw:-Math.PI/2,h:8,m:40,ebony:false,title:'A clock stopped at twenty minutes to nine',
      text:'As at Satis House, in Great Expectations: “her watch had stopped at twenty minutes to nine, and that a clock in the room had stopped at twenty minutes to nine.” It was the hour her letter came, while she was dressing to be married.',
      quote:'her watch had stopped at twenty minutes to nine, and that a clock in the room had stopped at twenty minutes to nine',source:'pg1400'},
    {key:'hatter',x:10.52,z:27,yaw:-Math.PI/2,h:6,m:0,ebony:false,title:'A clock stopped at six o’clock',
      text:'The Hatter quarrelled with Time, and Time stopped for him at tea-time, in Alice’s Adventures in Wonderland: “It’s always six o’clock now.” So the table is always laid for tea.',
      quote:'It’s always six o’clock now.',source:'pg11'},
    {key:'ebony',x:-11,z:-24.52,yaw:0,h:12,m:0,ebony:true,title:'An ebony clock stopped at midnight',
      text:'The ebony clock of Poe’s The Masque of the Red Death, which struck the hours in the black apartment until, at midnight, the uninvited guest was unmasked: “And the life of the ebony clock went out with that of the last of the gay.”',
      quote:'And the life of the ebony clock went out with that of the last of the gay.',source:'pg2148'}
  ];
  // ---------- The explorers' anteroom ----------
  const ANTE={cx:1320,cz:320,w:12,d:9,h:5};
  const LOCKER={x:-428.45,z:-66.2,yaw:Math.PI/2};
  const DEPARTURES=[
    ['20 September 1519','Sanlúcar de Barrameda','Magellan’s five ships, Antonio Pigafetta aboard to keep the account'],
    ['14 May 1804','Camp Dubois, on the Mississippi','Lewis and Clark’s Corps of Discovery, up the Missouri'],
    ['27 December 1831','Plymouth','HMS Beagle, with Charles Darwin, for a voyage of nearly five years'],
    ['May 1846','Vienna','Ida Pfeiffer, alone, on the first of her two journeys round the world'],
    ['July 1860','Boston','Isaac Hayes in the schooner United States, for the open polar sea'],
    ['6 July 1908','New York','The Roosevelt, with Robert Peary and Matthew Henson'],
    ['15 June 1910','Cardiff','The Terra Nova, with Robert Falcon Scott']
  ];
  const CONRAD='When I grow up I will go there.';

  // Each part dims in turn: the west wing from half past ten, the east wing from half past eleven, the hall from half past
  // midnight; all of it comes up again between five and six.
  const START={west:22.5,east:23.5,hall:24.5};
  function dimFor(x,z,date=new Date()){const h=date.getHours()+date.getMinutes()/60,H=h<12?h+24:h,s=x<-19?START.west:x>19?START.east:START.hall;return 1-.45*clamp(H-s,0,1)*clamp(30-H,0,1)}
  const synodic=29.530588853,moonPhase=(ms=Date.now())=>{const days=ms/86400000-10962.76;return ((days%synodic)+synodic)%synodic/synodic};
    const moonLight=(ms)=>(1-Math.cos(2*Math.PI*moonPhase(ms)))/2;
  // The porter's way: A* over a grid of cells a reader could stand in (8 neighbours, no cutting corners), then pulled
  // straight wherever the line between two points stays on open floor. `open` is a Uint8Array of nx by nz cells.
  function gridPath(open,nx,nz,from,to){
    const n=nx*nz,g=new Float32Array(n).fill(Infinity),came=new Int32Array(n).fill(-1),closed=new Uint8Array(n),heap=[],h=k=>Math.hypot(k%nx-to%nx,((k/nx)|0)-((to/nx)|0));
    const push=(k,f)=>{heap.push([f,k]);let i=heap.length-1;while(i>0){const up=(i-1)>>1;if(heap[up][0]<=heap[i][0])break;[heap[up],heap[i]]=[heap[i],heap[up]];i=up}};
    const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let i=0;for(;;){const l=2*i+1,r=l+1;let m=i;if(l<heap.length&&heap[l][0]<heap[m][0])m=l;if(r<heap.length&&heap[r][0]<heap[m][0])m=r;if(m===i)break;[heap[m],heap[i]]=[heap[i],heap[m]];i=m}}return top[1]};
    if(!open[from]||!open[to])return null;g[from]=0;push(from,h(from));
    while(heap.length){const k=pop();if(closed[k])continue;if(k===to){const out=[];for(let c=k;c>=0;c=came[c])out.push(c);return out.reverse()}closed[k]=1;const i=k%nx,j=(k/nx)|0;
      for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const a=i+di,b=j+dj;if(a<0||b<0||a>=nx||b>=nz)continue;const q=b*nx+a;if(!open[q]||closed[q])continue;
        if(di&&dj&&(!open[j*nx+a]||!open[b*nx+i]))continue;const cost=g[k]+(di&&dj?Math.SQRT2:1);if(cost<g[q]){g[q]=cost;came[q]=k;push(q,cost+h(q))}}}
    return null}
  function smoothPath(points,clear){if(points.length<3)return points.slice();const out=[points[0]];let i=0;while(i<points.length-1){let j=points.length-1;while(j>i+1&&!clear(points[i],points[j]))j--;out.push(points[j]);i=j}return out}
  window.createExploration=function(o){
    const {THREE,scene,camera,MAT,player,interactables,canvasTexture,softTexture,showNotice,sound,playSample=()=>false,collider,allowedAt,floorAt,
      placeKnown,placeLabel=id=>id,currentPlace,isDiscovered,books,bookMaterial,audio=()=>null,moon,ambient,readerLantern,lampShade,flickerLights=[],isHolding=()=>false,isReading=()=>false,
      freeable,curatedShelf,chair,arrivalIds=()=>[],findBook=()=>null,enterMapRoom,move,analytics,storage=window.localStorage}=o;
    const load=(key,fallback)=>{try{const v=JSON.parse(storage?.getItem(key)||'null');return v??fallback}catch(e){return fallback}};
    const save=(key,value)=>{try{storage?.setItem(key,JSON.stringify(value))}catch(e){}};
    const mark=(object,data)=>{object.userData=data;interactables.push(object);return object};
    const add=(parent,geometry,material,x,y,z)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m};
    const brass=MAT.brass,dark=MAT.darkWood,ink='#2a1d12';
    const reachable=place=>{const h=HINTS[place];return !!h&&!placeKnown(place)&&(!h[1]||placeKnown(h[1]))};
    const p=player.pos,ground=()=>p.y>-1&&p.y<4.5,inHall=()=>ground()&&((Math.abs(p.x)<19&&Math.abs(p.z)<31)||(Math.abs(p.x)<37&&p.z>-14&&p.z<10)||(p.x>=37&&p.x<57&&p.z>-12&&p.z<8));

    // ---------- 1. Sounds under the doors ----------
    function doorLeak(){if(!ground())return null;let best=null,bd=4.6;for(const [place,x,z] of DOORS){if(placeKnown(place))continue;const d=Math.hypot(p.x-x,p.z-z);if(d<bd){bd=d;best=place}}
      return best?{place:best,level:.42*clamp((4.6-bd)/3.2,0,1)}:null}

    // ---------- 2. The night porter's lantern ----------
    const porter=new THREE.Group();porter.visible=false;scene.add(porter);
    const glassMat=new THREE.MeshBasicMaterial({color:0xffc070,transparent:true,opacity:1}),frameMat=new THREE.MeshStandardMaterial({color:0x2a2018,roughness:.5,metalness:.6,transparent:true,opacity:1});
    add(porter,new THREE.BoxGeometry(.13,.17,.13),glassMat,0,0,0);for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]])add(porter,new THREE.BoxGeometry(.018,.2,.018),frameMat,sx*.07,0,sz*.07);
    add(porter,new THREE.ConeGeometry(.1,.08,4),frameMat,0,.13,0).rotation.y=Math.PI/4;add(porter,new THREE.BoxGeometry(.16,.02,.16),frameMat,0,-.1,0);add(porter,new THREE.TorusGeometry(.05,.008,5,12),frameMat,0,.2,0);
    const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:softTexture(),color:0xffb050,transparent:true,opacity:.75,depthWrite:false,blending:THREE.AdditiveBlending}));halo.scale.set(1.3,1.3,1);porter.add(halo);
    // Nothing of the porter's can be looked at or stood against: the library raycasts the scene for walls, and a sprite cannot be raycast without a camera.
    halo.raycast=()=>{};
    const pool=new THREE.Mesh(new THREE.CircleGeometry(1.5,20),new THREE.MeshBasicMaterial({map:softTexture(),color:0xff9a40,transparent:true,opacity:.3,depthWrite:false,blending:THREE.AdditiveBlending}));pool.rotation.x=-Math.PI/2;scene.add(pool);pool.visible=false;pool.raycast=()=>{};porter.traverse(m=>{m.raycast=()=>{}});
    const walk={mode:'off',next:75,path:[],seg:0,alpha:0,seen:false,at:new THREE.Vector3(),hallTime:0};
    function setPorterAlpha(a){walk.alpha=a;glassMat.opacity=a;frameMat.opacity=a;halo.material.opacity=.75*a;pool.material.opacity=.3*a;porter.visible=pool.visible=a>.01}
    // The floor the porter can walk: the hall, the wings and the Restricted Catalogue, surveyed a slice a frame (the
    // same test that stops the reader at a bookcase, so the lantern keeps a reader's width from every shelf).
    const GRID={x0:-37,z0:-31,x1:57,z1:31,step:.5},NX=Math.round((GRID.x1-GRID.x0)/GRID.step)+1,NZ=Math.round((GRID.z1-GRID.z0)/GRID.step)+1;
    let floorGrid=null,survey=null,surveyedAt=-1e9;
    const cellOf=(x,z)=>{const i=Math.round((x-GRID.x0)/GRID.step),j=Math.round((z-GRID.z0)/GRID.step);return i<0||j<0||i>=NX||j>=NZ?-1:j*NX+i},cellPoint=k=>[GRID.x0+(k%NX)*GRID.step,GRID.z0+((k/NX)|0)*GRID.step];
    function surveyFloor(t){if(!survey){if(floorGrid&&t-surveyedAt<600)return;survey={k:0,cells:new Uint8Array(NX*NZ)}}
      const end=Math.min(NX*NZ,survey.k+1200);for(;survey.k<end;survey.k++){const [x,z]=cellPoint(survey.k);survey.cells[survey.k]=allowedAt(x,z)?1:0}
      if(survey.k>=NX*NZ){floorGrid=survey.cells;survey=null;surveyedAt=t}}
    function nearestOpen(x,z){const k=cellOf(x,z);if(k<0)return -1;if(floorGrid[k])return k;const i0=k%NX,j0=(k/NX)|0;for(let r=1;r<=6;r++)for(let dj=-r;dj<=r;dj++)for(let di=-r;di<=r;di++){if(Math.max(Math.abs(di),Math.abs(dj))!==r)continue;const i=i0+di,j=j0+dj;if(i>=0&&j>=0&&i<NX&&j<NZ&&floorGrid[j*NX+i])return j*NX+i}return -1}
    const clearLine=(a,b)=>{const d=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(d/.2);for(let s=1;s<n;s++){const k=cellOf(a[0]+(b[0]-a[0])*s/n,a[1]+(b[1]-a[1])*s/n);if(k<0||!floorGrid[k])return false}return true};
    function startPorter(t){
      if(!floorGrid)return false;const yaw=player.yaw,ahead={x:-Math.sin(yaw),z:-Math.cos(yaw)},from=nearestOpen(p.x,p.z);if(from<0)return false;
      const choices=[];for(const [place,,,ax,az] of DOORS){if(placeKnown(place))continue;const dx=ax-p.x,dz=az-p.z,d=Math.hypot(dx,dz);if(d<9||d>42)continue;choices.push([(dx*ahead.x+dz*ahead.z)/d*2-d/30,ax,az])}
      choices.sort((a,b)=>b[0]-a[0]);
      for(const [,ax,az] of choices.slice(0,3)){const to=nearestOpen(ax,az);if(to<0)continue;const cells=gridPath(floorGrid,NX,NZ,from,to);if(!cells)continue;
        // It appears a little way along the route, round whatever is in between, and goes on from there.
        const pts=cells.map(cellPoint);let run=0,s=0;const total=pts.reduce((sum,q,i)=>i?sum+Math.hypot(q[0]-pts[i-1][0],q[1]-pts[i-1][1]):0,0);if(total<10)continue;const startAt=Math.min(11,total*.45);
        while(s<pts.length-1&&run+Math.hypot(pts[s+1][0]-pts[s][0],pts[s+1][1]-pts[s][1])<startAt){run+=Math.hypot(pts[s+1][0]-pts[s][0],pts[s+1][1]-pts[s][1]);s++}
        const way=smoothPath(pts.slice(s),clearLine);walk.path=way.map(([x,z])=>new THREE.Vector3(x,0,z));walk.seg=0;walk.at.copy(walk.path[0]);walk.mode='walk';setPorterAlpha(.01);
        if(!walk.seen){walk.seen=true;setTimeout(()=>showNotice('Far off, a lantern moves between the shelves. Whoever carries it keeps just out of the light.',7),400)}
        return true}
      return false}
    function updatePorter(t,dt){
      const watching=inHall()&&!isReading();walk.hallTime=watching?walk.hallTime+dt:0;if(watching&&walk.mode==='off')surveyFloor(t);
      if(walk.mode==='off'){if(watching&&walk.hallTime>20&&t>walk.next&&!startPorter(t))walk.next=t+30;return}
      if(walk.mode==='fade'||!watching){setPorterAlpha(Math.max(0,walk.alpha-dt*(watching?.8:2)));if(walk.alpha<=0){walk.mode='off';walk.next=t+240+Math.random()*150}}
      else{setPorterAlpha(Math.min(1,walk.alpha+dt*.6));const target=walk.path[walk.seg+1],r=Math.hypot(walk.at.x-p.x,walk.at.z-p.z),speed=r>18?0:r<5?2.6:1.15,to=target?target.clone().sub(walk.at):null;
        if(!to||to.length()<.12){if(target&&walk.seg<walk.path.length-2)walk.seg++;else{walk.mode='fade';playSample('doorOpen',.18,.82)||sound(120,.4,'triangle',.02)}}else{to.y=0;const d=to.length();walk.at.addScaledVector(to.normalize(),Math.min(d,speed*dt))}}
      porter.position.set(walk.at.x,1.12+Math.sin(t*3.6)*.035,walk.at.z);porter.rotation.z=Math.sin(t*1.8)*.08;pool.position.set(walk.at.x,.02,walk.at.z)}

    // ---------- 3. The plan: the reader's route, a compass, and dragons ----------
    let route=load('athenaeum-hall-route',[]);if(!Array.isArray(route))route=[];let routeDirty=false,routeSaved=0;
    function updateRoute(t){if(!ground()||Math.abs(p.x)>75||p.z<-36||p.z>37)return;const last=route[route.length-1];if(!last||Math.hypot(last[0]-p.x,last[1]-p.z)>1.5){route.push([+p.x.toFixed(1),+p.z.toFixed(1)]);if(route.length>600)route.splice(0,route.length-600);routeDirty=true}
      if(routeDirty&&t-routeSaved>15){routeSaved=t;routeDirty=false;save('athenaeum-hall-route',route)}}
    function planOverlay(bounds,uncharted){const out=[];
      // The route, broken where the reader left the plan and came back somewhere else.
      let run=[];const flush=()=>{if(run.length>1)out.push(`<polyline class="route" points="${run.map(q=>q.join(',')).join(' ')}"/>`);run=[]};
      for(const q of route){const prev=run[run.length-1];if(prev&&Math.hypot(prev[0]-q[0],prev[1]-q[1])>4)flush();if(q[0]>=bounds.x0&&q[0]<=bounds.x1&&q[1]>=bounds.z0&&q[1]<=bounds.z1)run.push(q);else flush()}flush();
      const cx=bounds.x1-4.2,cz=bounds.z0+4.6;out.push(`<g class="compass" transform="translate(${cx.toFixed(1)} ${cz.toFixed(1)})"><circle r="2.4"/><path d="M0 -2.4 L.7 0 L0 2.4 L-.7 0 Z"/><text y="-3.2">N</text></g>`);
      if(uncharted)out.push(`<text class="dragons" x="${(bounds.x0+6.5).toFixed(1)}" y="${(bounds.z1-2.2).toFixed(1)}">here be dragons</text>`);
      return out.join('')}

    // ---------- 4. Draughts towards the mysteries ----------
    const DRAUGHT_N=28,draughtPos=new Float32Array(DRAUGHT_N*3),draughtStart=new Float32Array(DRAUGHT_N*3),draughtLife=new Float32Array(DRAUGHT_N);
    const draughtGeo=new THREE.BufferGeometry();draughtGeo.setAttribute('position',new THREE.BufferAttribute(draughtPos,3));
    const draught=new THREE.Points(draughtGeo,new THREE.PointsMaterial({color:0xe8dcc0,size:.06,map:softTexture(),transparent:true,opacity:.5,depthWrite:false}));draught.visible=false;draught.frustumCulled=false;draught.raycast=()=>{};scene.add(draught);
    let draughtSpot=null,draughtCheck=0;
    function seedDraught(i,spot){const a=Math.random()*Math.PI*2,r=1.4+Math.random()*1.2;draughtStart[i*3]=spot[0]+Math.cos(a)*r;draughtStart[i*3+1]=spot[1]+(Math.random()-.3)*1.1;draughtStart[i*3+2]=spot[2]+Math.sin(a)*r;draughtLife[i]=Math.random()}
    function updateDraught(t,dt){
      if(t>draughtCheck){draughtCheck=t+1;let best=null,bd=9;for(const id in DRAUGHTS){if(isDiscovered(id))continue;const s=DRAUGHTS[id],d=Math.hypot(s[0]-p.x,s[2]-p.z);if(d<bd&&Math.abs(s[1]-(p.y+1))<4.5){bd=d;best=s}}
        if(best!==draughtSpot){draughtSpot=best;if(best)for(let i=0;i<DRAUGHT_N;i++)seedDraught(i,best)}draught.visible=!!best}
      if(!draughtSpot)return;const s=draughtSpot;
      for(let i=0;i<DRAUGHT_N;i++){draughtLife[i]+=dt*.16;if(draughtLife[i]>=1){seedDraught(i,s);draughtLife[i]=0}const f=draughtLife[i],e=f*f*(3-2*f),swirl=Math.sin(t*1.3+i)*.12*(1-f);
        draughtPos[i*3]=draughtStart[i*3]+(s[0]-draughtStart[i*3])*e+swirl;draughtPos[i*3+1]=draughtStart[i*3+1]+(s[1]-draughtStart[i*3+1])*e+Math.sin(t*.9+i*2)*.05;draughtPos[i*3+2]=draughtStart[i*3+2]+(s[2]-draughtStart[i*3+2])*e+Math.cos(t*1.1+i)*.12*(1-f)}
      draughtGeo.attributes.position.needsUpdate=true}

    // ---------- 5. Footprints in the dust ----------
    const printTex=canvasTexture((c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle='rgba(30,22,14,.75)';c.beginPath();c.ellipse(w/2,h*.3,w*.36,h*.24,0,0,7);c.fill();c.beginPath();c.ellipse(w/2,h*.78,w*.3,h*.16,0,0,7);c.fill()},32,96);
    const printMat=new THREE.MeshBasicMaterial({map:printTex,transparent:true,opacity:.55,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}),printGeo=new THREE.PlaneGeometry(.12,.29).rotateX(-Math.PI/2);
    const OWN_PRINTS=180,ownPrints=new THREE.InstancedMesh(printGeo,printMat,OWN_PRINTS);ownPrints.count=0;ownPrints.frustumCulled=false;ownPrints.raycast=()=>{};scene.add(ownPrints);
    const dummy=new THREE.Object3D();let printNext=0,printSide=1,printWalked=0,lastPrint=null;
    const dusty=()=>(p.y<-3&&Math.abs(p.x)<17.8&&p.z>-67.8&&p.z<-40.2)||(ground()&&p.x>63&&p.x<167&&p.z>-29&&p.z<-9)||(ground()&&p.x<-52&&p.x>-72&&p.z>-8&&p.z<2);
    function stamp(mesh,i,x,z,yaw,side){const y=floorAt(x,z)+.012;dummy.position.set(x+Math.cos(yaw)*.1*side,y,z-Math.sin(yaw)*.1*side);dummy.rotation.set(0,yaw,0);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix)}
    function updatePrints(){if(!dusty()){lastPrint=null;return}if(!lastPrint){lastPrint={x:p.x,z:p.z};return}const dx=p.x-lastPrint.x,dz=p.z-lastPrint.z,d=Math.hypot(dx,dz);if(d<.62)return;
      const yaw=Math.atan2(-dx,-dz);stamp(ownPrints,printNext,p.x,p.z,yaw,printSide);printSide=-printSide;printNext=(printNext+1)%OWN_PRINTS;ownPrints.count=Math.min(OWN_PRINTS,ownPrints.count+1);ownPrints.instanceMatrix.needsUpdate=true;lastPrint={x:p.x,z:p.z}}
    // Someone came down the hatch before the reader, and went straight to the narrow door behind the pipes.
    const trail=[];for(let f=0;f<=1.0001;f+=1/26){const x=.6+f*15.8,z=-44.2-Math.sin(f*Math.PI*.5)*3.9+Math.sin(f*9)*.25;trail.push([x,z])}
    const earlier=new THREE.InstancedMesh(printGeo,printMat,trail.length);earlier.frustumCulled=false;earlier.raycast=()=>{};trail.forEach(([x,z],i)=>{const n=trail[Math.min(i+1,trail.length-1)],q=trail[Math.max(i-1,0)],yaw=Math.atan2(-(n[0]-q[0]),-(n[1]-q[1]));dummy.position.set(x+Math.cos(yaw)*.1*(i%2?1:-1),-5.988,z-Math.sin(yaw)*.1*(i%2?1:-1));dummy.rotation.set(0,yaw,0);dummy.updateMatrix();earlier.setMatrixAt(i,dummy.matrix)});scene.add(earlier);

    // ---------- 6. The despatch tube ----------
    const TUBE={x:-10.53,z:-5};const tube=new THREE.Group();tube.position.set(TUBE.x,0,TUBE.z);scene.add(tube);
    const tubeInfo={type:'despatch-tube',title:'The despatch tube',author:'A brass tube from the stacks, run down the column into a wire basket. Now and then something comes down it.',action:'LOOK'};
    for(const part of [add(tube,new THREE.CylinderGeometry(.055,.055,6.4,10),brass,.12,4.95,0),add(tube,new THREE.CylinderGeometry(.13,.11,.5,14),brass,.16,1.55,0),add(tube,new THREE.TorusGeometry(.13,.02,6,14),brass,.16,1.3,0)])mark(part,tubeInfo).rotation.x=part.geometry.type==='TorusGeometry'?Math.PI/2:0;
    for(const y of [2.4,4.2,6,7.6])add(tube,new THREE.BoxGeometry(.05,.06,.2),dark,.04,y,0);
    const basket=mark(add(tube,new THREE.CylinderGeometry(.26,.2,.2,12,1,true),new THREE.MeshStandardMaterial({color:0x2c2a26,metalness:.7,roughness:.5,side:THREE.DoubleSide,wireframe:true}),.42,1.02,0),tubeInfo);
    add(tube,new THREE.CircleGeometry(.2,12),new THREE.MeshStandardMaterial({color:0x2c2a26,metalness:.6,roughness:.6}),.42,.925,0).rotation.x=-Math.PI/2;add(tube,new THREE.BoxGeometry(.3,.03,.05),dark,.2,.98,0);
    const plateTex=canvasTexture((c,w,h)=>{c.fillStyle='#b8914a';c.fillRect(0,0,w,h);c.strokeStyle='#5a3e1a';c.lineWidth=4;c.strokeRect(5,5,w-10,h-10);c.fillStyle='#2b1d0e';c.textAlign='center';c.font='bold 26px Georgia';c.fillText('PNEUMATIC DESPATCH',w/2,40);c.font='italic 20px Georgia';c.fillText('from the stacks',w/2,70)},320,90);
    const plate=mark(add(tube,new THREE.PlaneGeometry(.62,.18),new THREE.MeshStandardMaterial({map:plateTex,metalness:.4,roughness:.5}),.04,2.05,0),tubeInfo);plate.rotation.y=Math.PI/2;plate.position.x=.06;
    const capsule=mark(add(tube,new THREE.CylinderGeometry(.045,.045,.24,10),brass,.42,1.08,0),{type:'despatch-capsule',title:'A brass capsule',author:'It has come down the tube from the stacks. There is a slip of paper inside.',action:'OPEN'});capsule.rotation.z=Math.PI/2-.3;capsule.visible=false;
    collider(TUBE.x+.3,TUBE.z,.6,.6);
    const despatch={next:120,waiting:false,given:new Set()};
    function hiss(){const a=audio();if(!a?.ctx||a.ctx.state!=='running'){sound(900,.5,'sawtooth',.01);return}const {ctx,master}=a,n=Math.floor(ctx.sampleRate*.9),b=ctx.createBuffer(1,n,ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.sin(Math.PI*i/n);
      const src=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain(),near=clamp(1-Math.hypot(p.x-TUBE.x,p.z-TUBE.z)/26,0,1);src.buffer=b;f.type='bandpass';f.frequency.value=2600;f.Q.value=.7;g.gain.value=.12*near;src.connect(f).connect(g).connect(master);src.start();src.onended=()=>{src.disconnect();f.disconnect();g.disconnect()}}
    function updateDespatch(t){if(despatch.waiting||t<despatch.next||!inHall()||isReading())return;despatch.waiting=true;hiss();setTimeout(()=>{capsule.visible=true;sound(70,.22,'square',.07);if(Math.hypot(p.x-TUBE.x,p.z-TUBE.z)<16)showNotice('Something rattles down the brass tube on the column and drops into the wire basket.',5)},900)}
    const unseen=key=>{try{return storage?.getItem(TREASURES[key].seen)!=='1'}catch(e){return false}};
    function openCapsule(){const options=Object.keys(HINTS).filter(k=>reachable(k)&&!despatch.given.has(k)),treasures=Object.keys(TREASURES).filter(k=>unseen(k)&&!despatch.given.has('treasure:'+k));
      capsule.visible=false;despatch.waiting=false;despatch.next=nowT+200+Math.random()*140;sound(520,.08,'triangle',.05);
      if(treasures.length&&(!options.length||Math.random()<.5)){const t=treasures[Math.floor(Math.random()*treasures.length)];despatch.given.add('treasure:'+t);showNotice(`A slip from the stacks: “${TREASURES[t].slip}”`,9);return}
      const key=options[Math.floor(Math.random()*options.length)];
      if(!key){showNotice('A slip from the stacks: “All is in order here. — The Stacks”',6);return}despatch.given.add(key);showNotice(`A slip from the stacks: “${HINTS[key][0]}”`,9)}

    // ---------- 7. Marginalia, and the trolley's return slips ----------
    const noted=new Set();let lastNote=-1e9;
    function onSelect(bm){const d=bm?.userData,book=d?.book;if(!book)return;
      if(d.trolleySlip){setTimeout(()=>showNotice(`A return slip, in the librarian’s hand: ${d.trolleySlip}`,8),900);return}
      const now=performance.now()/1000;if(now-lastNote<120||Math.random()>.45)return;const who=`${book.title} ${book.author}`,rule=MARGINS.find(([re,place])=>re.test(who)&&!placeKnown(place)&&!noted.has(place)&&currentPlace()!==place)
        ||Object.keys(TREASURES).filter(k=>TREASURES[k].margin[0].test(who)&&unseen(k)&&currentPlace()!==TREASURES[k].room&&!noted.has('treasure:'+k)).map(k=>[,'treasure:'+k,TREASURES[k].margin[1]])[0];if(!rule)return;
      noted.add(rule[1]);lastNote=now;setTimeout(()=>showNotice(`Pencilled on the flyleaf: “${rule[2]}”`,8),1200)}

    // ---------- 8 and 9. Closing time, the reader's lantern, and the real sky ----------
    const handFrame=new THREE.MeshStandardMaterial({color:0x2a2018,roughness:.5,metalness:.6}),handLantern=new THREE.Group();handLantern.visible=false;camera.add(handLantern);handLantern.position.set(.34,-.36,-.66);
    add(handLantern,new THREE.BoxGeometry(.07,.09,.07),new THREE.MeshBasicMaterial({color:0xffcf80}),0,0,0);for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]])add(handLantern,new THREE.BoxGeometry(.01,.11,.01),handFrame,sx*.038,0,sz*.038);
    add(handLantern,new THREE.ConeGeometry(.055,.045,4),handFrame,0,.07,0).rotation.y=Math.PI/4;add(handLantern,new THREE.TorusGeometry(.03,.005,5,10),handFrame,0,.11,0);
    let shadeBase=null,dimLights=[],dimRefresh=0;
    function moonName(ms){const f=moonPhase(ms);return f<.03||f>.97?'a new moon':f<.22?'a waxing crescent':f<.28?'the first quarter':f<.47?'a waxing gibbous moon':f<.53?'the full moon':f<.72?'a waning gibbous moon':f<.78?'the last quarter':'a waning crescent'}
    let skylight=null,skyCheck=0;
    function updateLight(t,dt){
      const mainActive=p.y>-1&&Math.abs(p.x)<80&&Math.abs(p.z)<48,date=new Date(),here=dimFor(p.x,p.z,date);
      if(t>dimRefresh){dimRefresh=t+5;dimLights=[];for(const l of flickerLights){const w=l.getWorldPosition(new THREE.Vector3());if(Math.abs(w.x)<57&&Math.abs(w.z)<32&&w.y>-1&&w.y<9)dimLights.push([l,w.x,w.z])}}
      for(const [l,lx,lz] of dimLights){const d=l.userData;if(d.flickerBase===undefined)continue;if(d.lateBase===undefined)d.lateBase=d.flickerBase;d.flickerBase=d.lateBase*dimFor(lx,lz,date)}
      if(shadeBase===null&&lampShade)shadeBase=lampShade.emissiveIntensity;if(lampShade)lampShade.emissiveIntensity=shadeBase*(mainActive?.45+.55*here:1);
      if(mainActive){ambient.intensity*=.78+.22*here;moon.intensity*=.55+.45*moonLight()}
      const dark=dusty()||(mainActive&&ground()&&here<.85),show=dark&&!isHolding()&&!isReading();handLantern.visible=show;
      if(show){const sway=Math.min(1,player.vel?.length?.()||0);handLantern.position.y=-.36+Math.sin(t*7)*.012*sway;handLantern.rotation.z=Math.sin(t*3.5)*.06*(.3+sway);readerLantern.intensity*=1.35}
      // The southern sky over the Antipodes turns once a sidereal day, as it does over Sydney.
      if(Math.abs(p.x+330)<7&&Math.abs(p.z+290)<8){if(t>skyCheck){skyCheck=t+2;if(!skylight?.parent)skylight=interactables.find(m=>m.userData?.title==='The Southern Cross'&&m.geometry?.type==='PlaneGeometry')||null}
        if(skylight){const jd=Date.now()/86400000+2440587.5,lst=(280.46061837+360.98564736629*(jd-2451545)+151.21)*Math.PI/180;skylight.rotation.z=-lst}}}

    // ---------- 10. Stopped clocks ----------
    const wound=new Set(load('athenaeum-stopped-clocks',[]));
    function clockFace(spec){return canvasTexture((c,w,h)=>{const r=w/2;c.fillStyle=spec.ebony?'#121010':'#efe6cf';c.beginPath();c.arc(r,r,r-2,0,7);c.fill();c.strokeStyle=spec.ebony?'#8a7550':'#3a2a18';c.lineWidth=6;c.beginPath();c.arc(r,r,r-8,0,7);c.stroke();
      c.fillStyle=spec.ebony?'#c9b27a':ink;c.font='bold 26px Georgia';c.textAlign='center';c.textBaseline='middle';const R=['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'];R.forEach((n,i)=>{const a=i/12*Math.PI*2;c.fillText(n,r+Math.sin(a)*(r-36),r-Math.cos(a)*(r-36))});
      const hand=(a,len,wd)=>{c.lineWidth=wd;c.lineCap='round';c.beginPath();c.moveTo(r,r);c.lineTo(r+Math.sin(a)*len,r-Math.cos(a)*len);c.stroke()};c.strokeStyle=spec.ebony?'#d8c08a':'#1a120a';
      hand(((spec.h%12)+spec.m/60)/12*Math.PI*2,r*.48,9);hand(spec.m/60*Math.PI*2,r*.72,5);c.fillStyle=c.strokeStyle;c.beginPath();c.arc(r,r,8,0,7);c.fill()},256,256)}
    for(const spec of CLOCKS){const g=new THREE.Group();g.position.set(spec.x,3.05,spec.z);g.rotation.y=spec.yaw;scene.add(g);
      const caseMat=spec.ebony?new THREE.MeshStandardMaterial({color:0x0c0a09,roughness:.35,metalness:.1}):dark,info={type:'stopped-clock',key:spec.key,title:spec.title,author:spec.text,action:'LOOK'};
      mark(add(g,new THREE.CylinderGeometry(.42,.42,.09,28),caseMat,0,0,.04),info).rotation.x=Math.PI/2;add(g,new THREE.TorusGeometry(.4,.03,6,28),brass,0,0,.09);
      mark(add(g,new THREE.CircleGeometry(.36,28),new THREE.MeshStandardMaterial({map:clockFace(spec),roughness:.6}),0,0,.091),info);
      add(g,new THREE.BoxGeometry(.06,.5,.04),caseMat,0,.55,.02);}
    function readClock(d){if(wound.has(d.key))return;wound.add(d.key);save('athenaeum-stopped-clocks',[...wound]);
      if(CLOCKS.every(c=>wound.has(c.key))){setTimeout(()=>{showNotice('Twenty to nine, six o’clock and midnight. For a moment every clock in the library holds its breath; then they all go on.',9);[784,659,523,392].forEach((f,i)=>setTimeout(()=>sound(f,1.1,'sine',.05),i*420))},2600);analytics?.track?.('Secret Found',{secret:'stopped-clocks'})}
      else setTimeout(()=>showNotice(`${wound.size} of ${CLOCKS.length} stopped clocks found. The others are on the hall’s columns too.`,5),2600)}

    // ---------- 11. The explorers' anteroom ----------
    const lockerTex=canvasTexture((c,w,h)=>{c.fillStyle='#b8914a';c.fillRect(0,0,w,h);c.strokeStyle='#5a3e1a';c.lineWidth=4;c.strokeRect(5,5,w-10,h-10);c.fillStyle='#2b1d0e';c.textAlign='center';c.font='bold 24px Georgia';c.fillText('EXPEDITION STORES',w/2,38);c.font='italic 17px Georgia';c.fillText('not wanted on voyage',w/2,64)},300,84);
    function locker(parent,x,z,yaw,data){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=yaw;parent.add(g);const wood=new THREE.MeshStandardMaterial({color:0x5b4128,roughness:.75,map:MAT.darkWood.map||null});
      const body=add(g,new THREE.BoxGeometry(1.1,2.3,.7),wood,0,1.15,0);add(g,new THREE.BoxGeometry(1.16,.08,.76),dark,0,2.34,0);
      // Two doors, one a little open on oilskins and a fur hood.
      const left=add(g,new THREE.BoxGeometry(.53,2.12,.04),wood,-.27,1.14,.37),right=add(g,new THREE.BoxGeometry(.53,2.12,.04),wood,.27,1.14,.37);right.rotation.y=-.5;right.position.set(.43,1.14,.5);
      add(g,new THREE.BoxGeometry(.42,1.3,.08),new THREE.MeshStandardMaterial({color:0xc8a030,roughness:.55}),.18,1.25,.3);add(g,new THREE.SphereGeometry(.14,10,8),new THREE.MeshStandardMaterial({color:0x8a7a62,roughness:1}),.2,1.95,.3);
      for(const k of [-.04,.04])add(g,new THREE.BoxGeometry(.02,.16,.03),brass,k,1.15,.4);
      const plate=add(g,new THREE.PlaneGeometry(.62,.17),new THREE.MeshStandardMaterial({map:lockerTex,metalness:.4,roughness:.5}),-.24,1.95,.395);
      for(const m of [body,left,right,plate])mark(m,data);return g}
    const mapLocker=locker(scene,LOCKER.x,LOCKER.z,LOCKER.yaw,{type:'explorers-locker',title:'A kit locker',author:'EXPEDITION STORES, not wanted on voyage. One door stands open on oilskins and a fur hood, and there is more room behind them than a locker should have.',action:'STEP IN'});
    let ante=null;
    function anteContains(x,z){return Math.abs(x-ANTE.cx)<ANTE.w/2&&Math.abs(z-ANTE.cz)<ANTE.d/2}
    function anteAllowed(x,z){const r=player.radius||.42;return !!ante&&Math.abs(x-ANTE.cx)+r<ANTE.w/2-.3&&Math.abs(z-ANTE.cz)+r<ANTE.d/2-.3}
    function buildAnteroom(){if(ante)return;freeable('explorers-anteroom',()=>anteContains(p.x,p.z)||Math.hypot(p.x-LOCKER.x,p.z-LOCKER.z)<6,()=>{
      const {cx,cz,w,d,h}=ANTE,wall=new THREE.MeshStandardMaterial({color:0x6e5a3e,roughness:.95}),plank=new THREE.MeshStandardMaterial({color:0x5a3e26,roughness:.85,map:MAT.darkWood.map||null}),room=new THREE.Group();scene.add(room);
      add(room,new THREE.BoxGeometry(w,.2,d),plank,cx,-.1,cz);add(room,new THREE.BoxGeometry(w,.2,d),new THREE.MeshStandardMaterial({color:0x2a2118,roughness:1}),cx,h,cz);
      for(const [ww,dd,x,z] of [[w,.3,cx,cz-d/2],[w,.3,cx,cz+d/2],[.3,d,cx-w/2,cz],[.3,d,cx+w/2,cz]])add(room,new THREE.BoxGeometry(ww,h,dd),wall,x,h/2,z);
      for(const [ww,dd,x,z] of [[w,.06,cx,cz-d/2+.18],[w,.06,cx,cz+d/2-.18],[.06,d,cx-w/2+.18,cz],[.06,d,cx+w/2-.18,cz]])add(room,new THREE.BoxGeometry(ww,1,dd),plank,x,.5,z);
      const lamp=new THREE.PointLight(0xffc98a,14,16,2);lamp.position.set(cx,h-1.1,cz);room.add(lamp);add(room,new THREE.CylinderGeometry(.16,.2,.34,10),new THREE.MeshBasicMaterial({color:0xffd9a0}),cx,h-1.2,cz);add(room,new THREE.CylinderGeometry(.01,.01,1,4),dark,cx,h-.55,cz);
      // The way back: the same locker, from inside.
      locker(room,cx-w/2+.5,cz,Math.PI/2,{type:'explorers-locker-back',title:'The kit locker',author:'Back through the oilskins to the Map Room.',action:'GO BACK'});
      // Kit on its pegs along the north wall, under a plaque.
      const zN=cz-d/2+.2;add(room,new THREE.BoxGeometry(8.4,.14,.06),dark,cx,2.05,zN+.03);for(let i=0;i<7;i++)add(room,new THREE.CylinderGeometry(.025,.025,.16,6),brass,cx-3.6+i*1.2,2.0,zN+.12).rotation.x=Math.PI/2;
      const kitInfo={type:'object',title:'Kit on its pegs',author:'An ice axe, a coil of rope, a sun helmet, a sledging flag, snowshoes and a storm lantern: kit left on its pegs between journeys. Officers on the British polar expeditions each carried a sledging flag of their own.',action:'LOOK'};
      const axe=new THREE.Group();axe.position.set(cx-3.6,1.45,zN+.16);room.add(axe);mark(add(axe,new THREE.BoxGeometry(.05,1.0,.04),plank,0,0,0),kitInfo);add(axe,new THREE.BoxGeometry(.36,.05,.04),new THREE.MeshStandardMaterial({color:0x8a8f94,metalness:.8,roughness:.35}),.04,.48,0);
      for(let i=0;i<5;i++)mark(add(room,new THREE.TorusGeometry(.2-i*.004,.03,6,18),new THREE.MeshStandardMaterial({color:0xb79a62,roughness:.9}),cx-2.4,1.7-i*.035,zN+.14),kitInfo);
      const helmet=mark(add(room,new THREE.SphereGeometry(.2,14,8,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:0xd9cfb0,roughness:.85}),cx-1.2,1.78,zN+.2),kitInfo);add(room,new THREE.CylinderGeometry(.3,.3,.02,16),helmet.material,cx-1.2,1.78,zN+.2);
      const flagTex=canvasTexture((c,W,H)=>{c.fillStyle='#e9e2cc';c.beginPath();c.moveTo(0,0);c.lineTo(W,0);c.lineTo(W*.78,H/2);c.lineTo(W,H);c.lineTo(0,H);c.closePath();c.fill();c.fillStyle='#7a1f22';c.fillRect(0,0,W*.3,H);c.strokeStyle='#22406e';c.lineWidth=10;c.beginPath();c.moveTo(W*.36,H*.5);c.lineTo(W*.7,H*.5);c.stroke();c.fillStyle='#22406e';c.beginPath();c.arc(W*.15,H*.5,H*.16,0,7);c.fill()},256,128);
      add(room,new THREE.CylinderGeometry(.015,.015,1.5,6),dark,cx,2.2,zN+.16);mark(add(room,new THREE.PlaneGeometry(.9,.45),new THREE.MeshStandardMaterial({map:flagTex,side:THREE.DoubleSide,transparent:true,alphaTest:.5,roughness:.9}),cx+.47,2.68,zN+.17),kitInfo);
      for(const k of [0,1]){const shoe=mark(add(room,new THREE.TorusGeometry(.2,.02,6,18),plank,cx+1.15+k*.28,1.6,zN+.15+k*.02),kitInfo);shoe.scale.set(.7,1.6,1)}
      const storm=new THREE.Group();storm.position.set(cx+3.6,1.7,zN+.18);room.add(storm);add(storm,new THREE.BoxGeometry(.13,.18,.13),new THREE.MeshBasicMaterial({color:0xffcf80}),0,0,0);add(storm,new THREE.ConeGeometry(.1,.08,4),frameMat,0,.13,0);mark(storm.children[0],kitInfo);
      // A sledge, with a canvas bag lashed on.
      const sledge=new THREE.Group();sledge.position.set(cx-2,0,cz+.6);room.add(sledge);for(const sz of [-.4,.4]){add(sledge,new THREE.BoxGeometry(2.8,.05,.06),plank,0,.06,sz);add(sledge,new THREE.BoxGeometry(.3,.05,.06),plank,1.5,.16,sz).rotation.z=.6;for(const sx of [-1,0,1])add(sledge,new THREE.BoxGeometry(.05,.24,.05),plank,sx*1.1,.2,sz)}
      for(let i=0;i<9;i++)add(sledge,new THREE.BoxGeometry(.1,.03,.9),plank,-1.2+i*.3,.33,0);mark(add(sledge,new THREE.BoxGeometry(1.2,.36,.6),new THREE.MeshStandardMaterial({color:0x8f8466,roughness:1}),-.3,.52,0),{type:'object',title:'A sledge',author:'A man-hauling sledge, its runners worn bright, with a canvas bag lashed on. The polar books are in the Antipodes, beyond the sea-chart cabinet; the voyages are on the shelf here.',action:'LOOK'});collider(cx-2,cz+.6,3,1.1);
      // A chart with its middle left blank, on the east wall.
      const chart=canvasTexture((c,W,H)=>{c.fillStyle='#d9c79c';c.fillRect(0,0,W,H);c.strokeStyle='#6a4e2c';c.lineWidth=6;c.strokeRect(10,10,W-20,H-20);c.lineWidth=2;c.beginPath();let x=40,y=60;c.moveTo(x,y);for(let i=0;i<60;i++){x+=Math.cos(i*.4)*14+6;y+=Math.sin(i*.7)*12+(i<30?4:-4);c.lineTo(x,y)}c.stroke();c.beginPath();c.moveTo(60,H-40);for(let i=0;i<50;i++)c.lineTo(60+i*16,H-40-Math.sin(i*.5)*18-i*1.5);c.stroke();
        c.fillStyle='#6a4e2c';c.font='italic 30px Georgia';c.textAlign='center';c.fillText('Unexplored',W/2,H/2);c.font='16px Georgia';c.fillText('N',W-40,48);for(let i=0;i<16;i++){const a=i/16*Math.PI*2;c.beginPath();c.moveTo(W-40,80);c.lineTo(W-40+Math.cos(a)*(i%2?14:24),80+Math.sin(a)*(i%2?14:24));c.stroke()}},768,512);
      const chartMesh=mark(add(room,new THREE.PlaneGeometry(3.3,2.2),new THREE.MeshStandardMaterial({map:chart,roughness:.95}),cx+w/2-.17,2.55,cz-.6),{type:'object',title:'A chart left blank in the middle',author:`The old charts left what nobody had seen blank, or wrote Unexplored across it. Conrad’s Marlow, in Heart of Darkness, had a passion for maps as a boy, and would put his finger on a blank space and say, “${CONRAD}”`,action:'LOOK'});chartMesh.rotation.y=-Math.PI/2;
      // The ledger of departures, on a lectern.
      const ledgerTex=canvasTexture(drawLedger,768,512),lect=new THREE.Group();lect.position.set(cx+3.9,0,cz+1.8);lect.rotation.y=-Math.PI/2;room.add(lect);add(lect,new THREE.BoxGeometry(.12,1.05,.12),dark,0,.53,0);add(lect,new THREE.BoxGeometry(.6,.05,.45),dark,0,.03,0);
      const desk=add(lect,new THREE.BoxGeometry(.8,.05,.58),dark,0,1.1,0);desk.rotation.x=-.32;const book=add(lect,new THREE.PlaneGeometry(.74,.5),new THREE.MeshStandardMaterial({map:ledgerTex,roughness:.9}),0,1.14,.012);book.rotation.x=-Math.PI/2-.32;book.position.y=1.135;
      for(const m of [desk,book])mark(m,{type:'departures-ledger',title:'The ledger of departures',author:'Who set out, from where, and when.',action:'READ'});collider(cx+3.9,cz+1.8,.8,.8);
      ante={room,ledgerTex};
      // The voyages, on the south wall: the Map Room's shelf, here too.
      const ids=[...new Set(arrivalIds('map-voyages'))].slice(0,10);if(ids.length)curatedShelf(ids,cx,cz+d/2-.55,Math.PI);
      chair(cx+2.4,cz-1.4,Math.PI*.8,{title:'A camp chair',author:'Folding, canvas and teak, made to be carried. Sit and read one of the voyages.',categories:['Journey']});
    },()=>{ante=null})}
    function drawLedger(c,W,H){const signed=load('athenaeum-departures',[]);c.fillStyle='#e8dcbc';c.fillRect(0,0,W,H);c.fillStyle='#c9b88f';c.fillRect(W/2-2,0,4,H);c.fillStyle=ink;c.textAlign='left';c.font='bold 22px Georgia';c.fillText('DEPARTURES',30,40);
      let y=74;c.font='15px Georgia';for(const [when,where,who] of DEPARTURES){c.font='italic 14px Georgia';c.fillText(`${when} · ${where}`,30,y);c.font='13px Georgia';c.fillText(who.length>48?who.slice(0,46)+'…':who,30,y+17);y+=48;if(y>H-30)break}
      c.font='bold 18px Georgia';c.fillText('Signed out of this library',W/2+24,40);y=74;for(const [when,line] of signed.slice(-8)){c.font='italic 14px Georgia';c.fillText(when,W/2+24,y);c.font='13px Georgia';c.fillText(line,W/2+24,y+17);y+=48}}
    let ledgerReadAt=-1e9;
    function readLedger(){const now=performance.now()/1000;if(now-ledgerReadAt>=10){ledgerReadAt=now;showNotice('The ledger of departures. '+DEPARTURES.map(e=>`${e[0]}, ${e[1]}: ${e[2]}.`).join(' ')+' Read it again to sign it.',14);return}if(true){ledgerReadAt=-1e9;const signed=load('athenaeum-departures',[]),today=new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});signed.push([today,'A reader, for the rooms not yet on the plan']);save('athenaeum-departures',signed.slice(-20));
      if(ante){const c=ante.ledgerTex.image.getContext('2d');drawLedger(c,ante.ledgerTex.image.width,ante.ledgerTex.image.height);ante.ledgerTex.needsUpdate=true}showNotice('You sign the ledger of departures, under the others.',5);sound(330,.2,'triangle',.04)}}
    function enterAnteroom(){buildAnteroom();playSample('doorOpen',.6,.8);move(ANTE.cx-ANTE.w/2+1.6,ANTE.cz,-Math.PI/2);showNotice('Past the oilskins, the locker goes on into a narrow store room: the explorers’ anteroom, with their kit on its pegs and a ledger of departures.',8);analytics?.track?.('Room Explored',{room:'explorers-anteroom'})}
    function leaveAnteroom(){playSample('doorOpen',.6,.8);enterMapRoom();move(LOCKER.x+1.3,LOCKER.z+.2,-Math.PI/2);showNotice('Back through the oilskins, into the Map Room.',4)}
    const blocks=(x,z)=>Math.abs(x-LOCKER.x)<.78&&Math.abs(z-LOCKER.z)<.95;

    // ---------- 12. The book trolley ----------
    let trolleyBuilt=false;
    function placeFor(book){const r=book.room||'';for(const [re,place] of SHELF_PLACES)if(re.test(r))return place;return null}
    function buildTrolley(){if(trolleyBuilt)return;trolleyBuilt=true;
      const spots=[[-13.5,20.5,0],[13.5,-1,Math.PI/2],[-28,-6,0],[30,-6,0],[-4,-14.4,0],[6,12,Math.PI/2],[-14,-1,Math.PI/2]].filter(([x,z,yaw])=>{const hw=Math.abs(Math.cos(yaw))*.75+Math.abs(Math.sin(yaw))*.45,hd=Math.abs(Math.sin(yaw))*.75+Math.abs(Math.cos(yaw))*.45;return [[x-hw,z-hd],[x+hw,z-hd],[x-hw,z+hd],[x+hw,z+hd],[x,z]].every(([a,b])=>allowedAt(a,b))});
      if(!spots.length)return;const [x,z,yaw]=spots[Math.floor(Math.random()*spots.length)];
      // The books come from the rooms' own shelves (their arrivals in data/new-books.js), one per room.
      const pool=[];for(const shelf of TROLLEY_SHELVES){const place=placeFor({room:shelf});for(const id of arrivalIds(shelf)){const book=findBook(id);if(book)pool.push({book,place})}}
      const unknown=pool.filter(e=>!placeKnown(e.place)),from=(new Set(unknown.map(e=>e.place)).size>=3?unknown:pool).sort(()=>Math.random()-.5),chosen=[];
      for(const e of from){if(chosen.length>=3)break;if(!chosen.some(c=>c.place===e.place))chosen.push(e)}
      const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=yaw;scene.add(g);const wood=new THREE.MeshStandardMaterial({color:0x6a4a2c,roughness:.7,map:MAT.darkWood.map||null});
      for(const y of [.35,.82])add(g,new THREE.BoxGeometry(1.4,.04,.7),wood,0,y,0);for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]){add(g,new THREE.BoxGeometry(.05,.95,.05),wood,sx*.67,.5,sz*.32);add(g,new THREE.CylinderGeometry(.06,.06,.04,10),MAT.black||dark,sx*.6,.06,sz*.32).rotation.x=Math.PI/2}
      add(g,new THREE.CylinderGeometry(.02,.02,.7,6),brass,-.78,1.0,0).rotation.x=Math.PI/2;for(const sz of [-.32,.32])add(g,new THREE.BoxGeometry(.14,.04,.03),brass,-.72,1.0,sz);
      const slipMat=new THREE.MeshStandardMaterial({color:0xf0e8d0,roughness:.9}),geometry=new THREE.BoxGeometry(1.05,1.2,.16);
      const AS_ROOM={'nights-courtyard':'nights-room','african-courtyard':'african-room'};
      chosen.forEach(({book,place},i)=>{const slip=`Return to ${placeLabel(AS_ROOM[place]||place).replace(/^The /,'the ')}. ${HINTS[place]?.[0]||''}`.trim();
        const bm=add(g,geometry,bookMaterial(book),-.45+i*.45,.884,(i-1)*.04);bm.scale.setScalar(.42);bm.rotation.set(-Math.PI/2,0,(i-1)*.14);
        bm.userData={type:'book',book,loaded:false,trolleySlip:slip,home:{position:bm.position.clone(),quaternion:bm.quaternion.clone(),parent:g}};interactables.push(bm);
        const tab=add(g,new THREE.BoxGeometry(.09,.006,.16),slipMat,-.45+i*.45+.1,.9,(i-1)*.04-.28);tab.rotation.y=(i-1)*.14});
      const plaqueInfo={type:'object',title:'A book trolley',author:'Three books on their way back to their rooms, each with a return slip. The trolley is never in the same place twice.',action:'LOOK'};
      for(const m of g.children.slice(0,2))mark(m,plaqueInfo);
      collider(x,z,Math.abs(Math.cos(yaw))*1.5+Math.abs(Math.sin(yaw))*.8,Math.abs(Math.sin(yaw))*1.5+Math.abs(Math.cos(yaw))*.8)}

    // ---------- the frame ----------
    let started=0,nowT=0;
    function update(t,dt){nowT=t;if(!started)started=t;if(!trolleyBuilt&&t-started>3)buildTrolley();
      updatePorter(t,dt);updateRoute(t);updateDraught(t,dt);updatePrints();updateDespatch(t);updateLight(t,dt)}
    function interact(object){const d=object?.userData;if(!d)return false;
      if(d.type==='despatch-capsule'){openCapsule();return true}
      if(d.type==='stopped-clock'){showNotice(`${d.title}. ${d.author}`,11);readClock(d);return true}
      if(d.type==='explorers-locker'){enterAnteroom();return true}
      if(d.type==='explorers-locker-back'){leaveAnteroom();return true}
      if(d.type==='departures-ledger'){readLedger();return true}
      return false}
    const timeTitle=()=>`Tonight, ${moonName()}.`;
    return {update,interact,onSelect,doorLeak,planOverlay,blocks,timeTitle,dimFor,moonPhase,moonName,
      anteroom:{contains:anteContains,allowed:anteAllowed,floorAt:(x,z)=>anteContains(x,z)?0:null,enter:enterAnteroom,leave:leaveAnteroom,room:ANTE,locker:LOCKER,get built(){return !!ante}},
      doors:DOORS,hints:HINTS,margins:MARGINS,clocks:CLOCKS,departures:DEPARTURES,draughts:DRAUGHTS,tube:TUBE,get route(){return route.slice()},get porter(){return {...walk,group:porter}},get floorGrid(){return floorGrid},grid:GRID,startPorter:()=>startPorter(0),capsule,buildTrolley,openCapsule,mapLocker};
  };
  Object.assign(window.createExploration,{gridPath,smoothPath,TROLLEY_SHELVES,SHELF_PLACES,CLOCKS,CONRAD,DOORS,HINTS,MARGINS,TREASURES,DEPARTURES,DRAUGHTS,dimFor,moonPhase});
})();
