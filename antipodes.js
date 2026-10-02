// The Antipodes: the far side of the world, reached by falling through it. A great globe stands in the middle of the
// Grand Hall; turn it and a trapdoor opens at its foot, and the reader falls down a well like Alice's (cupboards,
// book-shelves, maps and pictures hung upon pegs), past the glowing centre of the Earth, where everything turns over,
// and up through a trapdoor on the other side. There a small hall under a skylight full of southern stars opens on
// the Australian Room to the west and the New Zealand Room to the east. A globe there turns the other way, home.
// Like the rooms behind doors, nothing beyond the globe is built until the reader turns it (or arrives by a link),
// and it is freed a little while after they leave.
(function(){
  'use strict';

  // ---------- the shelves ----------
  // The new arrivals for each room (data/new-books.js, rooms antipodes, australian and new-zealand) are added to the
  // books listed here, which the library already holds.
  const SHELVES=[
    {key:'voyages',name:'THE WAY HERE',sub:'Voyages to the far side of the world',ids:[11],max:6},
    {key:'australian',name:'AUSTRALIA',sub:'The Australian Room',ids:[213],max:16},
    {key:'nz',name:'AOTEAROA NEW ZEALAND',sub:'The New Zealand Room',ids:[1429,1906],max:15}
  ];
  const RECORDS={11:['Alice’s Adventures in Wonderland','Lewis Carroll'],213:['The Man from Snowy River','A. B. Paterson'],1429:['The Garden Party, and Other Stories','Katherine Mansfield'],1906:['Erewhon','Samuel Butler']};
  const CARDS={
    globe:['The great globe','An old terrestrial globe, a little faded at Europe from being turned so often. A brass plate on its stand reads: TURN TO THE ANTIPODES. MIND THE DROP.'],
    home:['The great globe','The same globe, or its twin, turned to where you are now. A brass plate on its stand reads: TURN FOR HOME. MIND THE DROP.'],
    antipodes:['The antipodes','The antipodes of a place is the point exactly opposite it, through the centre of the Earth. Dig straight down from Dublin and you come out in the Southern Ocean south-east of New Zealand; from London, near the little Antipodes Islands, which are named for it; from northern Spain, in New Zealand itself, where Christchurch lies almost opposite A Coruña. Most of the land on Earth has only sea on the other side.'],
    cross:['The Southern Cross','Crux, the smallest of the constellations and the best known in the southern sky, with the two Pointers, Alpha and Beta Centauri, beside it. It is on the flags of both countries: four red stars on New Zealand’s, five white ones on Australia’s, which counts the small fifth star, Epsilon Crucis. The dark patch beside it is the Coalsack, a cloud of dust in front of the Milky Way.'],
    alice:['Alice, falling','“I wonder if I shall fall right through the earth! How funny it’ll seem to come out among the people that walk with their heads downward! The Antipathies, I think— … but I shall have to ask them what the name of the country is, you know. Please, Ma’am, is this New Zealand or Australia?” Lewis Carroll, Alice’s Adventures in Wonderland, 1865.'],
    first:['The first Australians','Aboriginal and Torres Strait Islander peoples have lived in Australia for tens of thousands of years, and have told its stories all that time, in hundreds of languages. The printed books on these shelves are recent by comparison, and some of the stories in them were told first by others.'],
    billy:['A billy on the fire','A tin can with a wire handle, for boiling water for tea over an open fire. Henry Lawson called his first book of stories While the Billy Boils, and in Banjo Paterson’s “Waltzing Matilda” the swagman sings as he watches and waits till his billy boils.'],
    swag:['A swag','A blanket rolled round a few belongings and carried on the shoulder by men who walked from station to station looking for work. Carrying it was “humping the bluey”, or, as in the song, “waltzing Matilda”.'],
    kookaburra:['A kookaburra','The laughing kookaburra, a big kingfisher of eastern Australia, calls in a chorus that sounds like laughter, most of all at dawn and dusk; bushmen called it the bushman’s clock. It eats insects, lizards and small snakes.'],
    bush:['The bush at night','Grey-green gum trees under the stars. There are more than seven hundred kinds of eucalyptus, and almost all of them grow wild only in Australia.'],
    ausSign:['The Australian Room','Bush ballads and bush stories, convicts and bushrangers, the novels of the towns and the stations, and a few books for children. Pull up the bench by the fire.'],
    alps:['The Southern Alps by night','Aoraki / Mount Cook, at 3,724 metres the highest mountain in New Zealand, above the snowfields. Samuel Butler ran sheep in the high country of Canterbury in the 1860s, and the mountains and the passes behind his station became the way into Erewhon.'],
    fern:['A silver fern','The ponga, or silver fern, whose fronds are silver-white underneath. Turned over, they catch the moonlight, and it is said they were used to mark a path through the bush at night. It is the emblem of many New Zealand teams.'],
    kiwi:['A kiwi','New Zealand’s flightless bird, about the size of a hen and out and about at night. Its nostrils are at the very tip of its long bill, which it pushes into the ground to smell out worms, and the female lays an egg up to a fifth of her own weight.'],
    desk:['Katherine Mansfield’s desk','Katherine Mansfield was born in Wellington in 1888 and left for London at nineteen. Many of her finest stories, written in Europe in the last years of a short life, go back to the Wellington of her childhood.'],
    nzSign:['Aotearoa New Zealand','Nau mai, haere mai: welcome. Katherine Mansfield, the settlers and the high country, and accounts of the Māori world by those who lived in it. Aotearoa, the Māori name for the country, is often translated “the land of the long white cloud”.'],
    hallSign:['The Antipodes','You fell through the Earth to get here. The Australian Room is through the arch to the west, the New Zealand Room through the arch to the east, and the globe will take you home.']
  };
  // What the reader hears on the way down (and up), at fractions of the fall.
  const DOWN=[[.02,'“Down, down, down. Would the fall never come to an end!”'],
    [.14,'The sides of the well are filled with cupboards and book-shelves; here and there, maps and pictures hung upon pegs.'],
    [.3,'“I wonder how many miles I’ve fallen by this time? I must be getting somewhere near the centre of the earth.”'],
    [.45,'The centre of the Earth, glowing and very warm. Here everything turns over: from now on, down is the way you came.'],
    [.62,'“I wonder if I shall fall right through the earth! How funny it’ll seem to come out among the people that walk with their heads downward!”'],
    [.8,'“Please, Ma’am, is this New Zealand or Australia?”']];
  const UP=[[.02,'Down again, or up: it depends which end of the world you count from.'],
    [.42,'The centre of the Earth again. Everything turns over, back the way it was.'],
    [.75,'Lamplight above, and the smell of old books. The Grand Hall.']];

  // A coarse map of the world, in degrees of longitude and latitude, drawn on the globes.
  const LAND=[
    [[-168,66],[-162,70],[-125,70],[-95,72],[-80,73],[-62,60],[-55,52],[-66,45],[-76,35],[-81,31],[-80,25],[-83,29],[-90,30],[-97,27],[-97,22],[-92,18],[-87,21],[-88,16],[-83,10],[-79,8],[-92,15],[-105,20],[-110,23],[-112,30],[-117,32],[-121,36],[-124,41],[-124,48],[-130,54],[-140,60],[-150,61],[-158,57],[-165,60]],
    [[-50,60],[-42,60],[-20,70],[-18,80],[-35,83],[-60,82],[-72,78],[-55,68]],
    [[-80,9],[-75,11],[-62,10],[-50,0],[-35,-5],[-39,-15],[-48,-26],[-58,-35],[-63,-41],[-68,-52],[-74,-52],[-73,-40],[-71,-30],[-70,-18],[-76,-14],[-81,-5],[-80,0]],
    [[-9,37],[-9,43],[-2,44],[-4,48],[2,51],[8,54],[10,57],[5,58],[5,62],[14,67],[25,71],[40,68],[55,70],[70,73],[90,76],[110,77],[140,72],[160,70],[180,68],[180,65],[170,60],[163,58],[156,51],[140,53],[135,43],[129,35],[127,38],[121,40],[122,31],[120,23],[110,21],[108,15],[105,9],[100,13],[103,1],[98,8],[98,16],[92,22],[88,22],[80,15],[77,8],[73,18],[67,25],[57,25],[56,27],[50,30],[48,29],[52,24],[56,24],[60,22],[55,17],[44,12],[42,16],[35,28],[34,31],[35,36],[27,37],[26,40],[23,38],[19,42],[13,46],[12,44],[16,41],[16,38],[12,44],[8,44],[3,43],[-1,37],[-5,36]],
    [[-5,50],[1,51],[2,53],[-3,56],[-2,58],[-5,59],[-6,56],[-3,54],[-5,52]],
    [[-10,51.5],[-6,52],[-6,54],[-8,55.3],[-10,54]],
    [[-24,64],[-14,64],[-15,66],[-22,66]],
    [[-17,21],[-10,30],[-5,36],[10,37],[20,32],[32,31],[34,28],[43,12],[51,12],[42,-2],[40,-15],[35,-24],[32,-29],[20,-35],[18,-30],[12,-17],[13,-5],[9,4],[-8,4],[-17,14]],
    [[44,-25],[47,-25],[50,-15],[49,-12],[44,-17]],
    [[130,31],[135,34],[140,35],[142,40],[141,45],[139,40],[133,35]],
    [[95,5],[98,4],[106,-6],[104,-5],[100,-1]],[[109,1],[117,7],[119,1],[116,-4],[110,-3]],[[131,-1],[141,-3],[150,-10],[144,-9],[138,-8],[135,-4]],
    [[114,-22],[114,-34],[118,-35],[124,-33],[131,-31],[138,-35],[141,-38],[146,-39],[150,-37],[153,-28],[153,-25],[146,-19],[142,-11],[141,-17],[136,-15],[137,-12],[132,-11],[129,-15],[125,-14],[122,-18]],
    [[145,-41],[148,-41],[148,-43],[146,-43.5]],
    [[172.7,-34.4],[174.5,-36],[176,-37.5],[178.5,-37.7],[177,-39.5],[176,-41],[174.8,-41.3],[174.6,-39.8],[173.8,-39.2],[174.6,-37.5]],
    [[172.7,-40.5],[174.3,-41.2],[173.5,-43],[171.2,-44.5],[170.6,-46],[168.3,-46.6],[166.5,-46],[167,-44.8],[170.5,-43],[172,-41.5]],
    [[-180,-72],[-120,-73],[-60,-64],[-30,-77],[30,-69],[90,-66],[150,-68],[180,-72],[180,-90],[-180,-90]]
  ];
  // The Southern Cross and the Pointers: [right ascension (hours), declination (degrees), magnitude].
  const STARS=[[12.443,-63.1,.8],[12.795,-59.69,1.25],[12.519,-57.11,1.6],[12.252,-58.75,2.8],[12.356,-60.4,3.6],[14.66,-60.83,-.1],[14.064,-60.37,.6]];

  window.createAntipodes=function(options){
    const {THREE,scene,MAT,player,camera,interactables,canvasTexture,bookMaterial,findBook,arrivals={},showNotice,playSample,sound,move,fade,analytics,
      isHolding=()=>false,isReducedMotion=()=>false,registerSeat=null}=options;
    // In the Grand Hall: the globe on the open floor between the reading tables and the long north bookcase, with
    // the trapdoor on the side the reader comes from.
    const GLOBE={x:0,z:-9.6},HATCH={x:0,z:-7.7,r:.62};
    // At the Antipodes: the hall between the two rooms, each 14 m deep.
    const HALL={cx:-330,cz:-290,w:12,d:14,h:7},AUS={cx:-345,cz:-290,w:18,d:14,h:5.4},NZ={cx:-315,cz:-290,w:18,d:14,h:5.4};
    const FAR_HATCH={x:HALL.cx,z:HALL.cz+1.4,r:.62},FAR_GLOBE={x:HALL.cx,z:HALL.cz-1.6};
    const ARCH=3,KEEP=25,SHAFT={x:-330,z:-420,r:2.6,top:62};
    const TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),smooth=p=>p*p*(3-2*p);
    let timber=null,root=null,shaft=null,time=0,lastNeeded=-1e9,fall=null,fire=null,laughing=0;
    const owned=[],ours=[],books=[],blockers=[];
    const own=thing=>{owned.push(thing);return thing};
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    // The globe and the trapdoor in the Grand Hall stay when the far side is freed, so they are not among its parts.
    function markHall(object,data){object.userData=data;interactables.push(object);return object}
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const card=key=>({type:'antipodes-card',title:CARDS[key][0],author:CARDS[key][1],action:'READ'});

    // ---------- the globe ----------
    let mapTexture=null;
    function worldMap(){
      return mapTexture||(mapTexture=canvasTexture((c,W,H)=>{
        const sea=c.createLinearGradient(0,0,0,H);sea.addColorStop(0,'#5d6f6a');sea.addColorStop(.5,'#6f8075');sea.addColorStop(1,'#5a6a66');c.fillStyle=sea;c.fillRect(0,0,W,H);
        const at=([lon,lat])=>[(lon+180)/360*W,(90-lat)/180*H];
        c.strokeStyle='rgba(235,220,180,.22)';c.lineWidth=1;for(let lon=-180;lon<=180;lon+=30){c.beginPath();c.moveTo(...at([lon,90]));c.lineTo(...at([lon,-90]));c.stroke()}for(let lat=-60;lat<=60;lat+=30){c.beginPath();c.moveTo(...at([-180,lat]));c.lineTo(...at([180,lat]));c.stroke()}
        c.strokeStyle='rgba(150,40,30,.5)';c.setLineDash([6,5]);c.beginPath();c.moveTo(...at([-180,0]));c.lineTo(...at([180,0]));c.stroke();c.setLineDash([]);
        for(const shape of LAND){c.beginPath();shape.forEach((p,i)=>i?c.lineTo(...at(p)):c.moveTo(...at(p)));c.closePath();c.fillStyle='#d9c79c';c.fill();c.strokeStyle='#7a6440';c.lineWidth=1.5;c.stroke()}
        // Australia and New Zealand picked out, as on a globe a librarian has marked.
        c.fillStyle='#c98f5a';for(const i of [13,14]){c.beginPath();LAND[i].forEach((p,k)=>k?c.lineTo(...at(p)):c.moveTo(...at(p)));c.closePath();c.fill()}
        c.fillStyle='#8fae7a';for(const i of [15,16]){c.beginPath();LAND[i].forEach((p,k)=>k?c.lineTo(...at(p)):c.moveTo(...at(p)));c.closePath();c.fill()}
        c.fillStyle='#4a3420';c.textAlign='center';c.font='bold 15px Georgia';
        for(const [text,lon,lat] of [['AUSTRALIA',134,-25],['NEW ZEALAND',172,-49],['IRELAND',-8,49.5],['AFRICA',20,5],['ASIA',95,50],['EUROPE',20,52],['AMERICA',-100,42],['AMERICA',-60,-12],['ANTARCTICA',0,-80]])c.fillText(text,...at([lon,lat]));
        c.font='italic 13px Georgia';c.fillStyle='#e9dcb8';for(const [text,lon,lat] of [['Pacific Ocean',-150,-10],['Atlantic Ocean',-35,25],['Indian Ocean',78,-25],['Southern Ocean',120,-58]])c.fillText(text,...at([lon,lat]));
      },1024,512));
    }
    // The globe on its stand, turned so a given longitude and latitude face the reader (at +z on the stand's side).
    function buildGlobe(parent,x,z,mine,data){
      const g=new THREE.Group();g.position.set(x,0,z);parent.add(g);
      const brass=MAT.brass,wood=MAT.darkWood,R=.78,shared=mine?own:t=>t;
      const legGeo=shared(new THREE.BoxGeometry(.09,.9,.09));
      for(let k=0;k<3;k++){const a=k*TAU/3,leg=add(legGeo,wood,Math.sin(a)*.42,.45,Math.cos(a)*.42,g);leg.rotation.set(Math.cos(a)*.22,0,-Math.sin(a)*.22)}
      add(shared(new THREE.CylinderGeometry(.62,.62,.07,32)),wood,0,.08,0,g);
      add(shared(new THREE.CylinderGeometry(.92,.92,.05,40,1,true)),brass,0,.93,0,g);// the horizon ring
      const tilt=new THREE.Group();tilt.position.y=1.72;g.add(tilt);
      const meridian=add(shared(new THREE.TorusGeometry(R+.06,.022,6,48)),brass,0,0,0,tilt);
      const spin=new THREE.Group();tilt.add(spin);
      const sphere=add(shared(new THREE.SphereGeometry(R,40,24)),shared(new THREE.MeshStandardMaterial({map:worldMap(),roughness:.55,metalness:.05})),0,0,0,spin);
      add(shared(new THREE.CylinderGeometry(.03,.03,.95,8)),wood,0,-1.25,0,tilt);
      const mk=mine?mark:markHall;mk(sphere,data);mk(meridian,data);
      return {group:g,tilt,spin,sphere,turn:null};
    }
    // Rotation (about the axis) that brings a longitude round to face +z, and the tilt that brings a latitude up to it.
    const facing=lon=>{const phi=(lon+180)/360*TAU;return -Math.atan2(-Math.cos(phi),Math.sin(phi))};
    function turnGlobe(globe,lon,lat,then){
      // At least a turn and a half, always the same way, ending with that longitude towards the reader.
      const start=globe.spin.rotation.y,target=facing(lon),end=target+Math.ceil((start+TAU*1.5-target)/TAU)*TAU;
      globe.turn={t:0,duration:isReducedMotion()?.6:2.6,start,end,tilt0:globe.tilt.rotation.x,tilt1:lat*Math.PI/180*.8,then};
      sound?.(220,.5,'triangle',.04);
    }
    function updateGlobe(globe,dt){
      const turn=globe?.turn;if(!turn)return;turn.t+=dt;const p=clamp(turn.t/turn.duration,0,1),e=1-Math.pow(1-p,3);
      globe.spin.rotation.y=turn.start+(turn.end-turn.start)*e;globe.tilt.rotation.x=turn.tilt0+(turn.tilt1-turn.tilt0)*e;
      if(p>=1){globe.turn=null;turn.then?.()}
    }

    // ---------- the trapdoors ----------
    // A round trapdoor in two leaves that fold up, and a painted well below: rings of shelves going down into the dark.
    let wellTexture=null;
    function wellMap(){
      return wellTexture||(wellTexture=canvasTexture((c,W,H)=>{
        const cx=W/2,cy=H/2;c.fillStyle='#000';c.fillRect(0,0,W,H);
        for(let i=0;i<14;i++){const r=W/2*Math.pow(.8,i);c.fillStyle=i%2?'#3a2414':'#2c1a0e';c.beginPath();c.arc(cx,cy,r,0,TAU);c.fill();
          c.strokeStyle=`rgba(210,160,90,${.35*Math.pow(.82,i)})`;c.lineWidth=2;c.stroke();
          for(let k=0;k<18;k++){const a=k/18*TAU+i*.4,r2=r*.92;c.fillStyle=['#6a2a20','#2a4a3a','#7a6030','#2a3a5a'][(k+i)%4];c.globalAlpha=.55*Math.pow(.8,i);c.fillRect(cx+Math.cos(a)*r2-2,cy+Math.sin(a)*r2-2,4,4);c.globalAlpha=1}}
        const glow=c.createRadialGradient(cx,cy,0,cx,cy,W*.08);glow.addColorStop(0,'rgba(255,140,40,.7)');glow.addColorStop(1,'rgba(255,90,20,0)');c.fillStyle=glow;c.fillRect(0,0,W,H);
      },256,256));
    }
    function buildHatch(parent,x,z,mine,data){
      const g=new THREE.Group();g.position.set(x,0,z);parent.add(g);const shared=mine?own:t=>t,R=HATCH.r;
      add(shared(new THREE.TorusGeometry(R+.04,.045,6,40)),MAT.brass,0,.012,0,g).rotation.x=Math.PI/2;
      const well=add(shared(new THREE.CircleGeometry(R,40)),shared(new THREE.MeshBasicMaterial({map:wellMap(),fog:false})),0,.006,0,g);well.rotation.x=-Math.PI/2;well.visible=false;
      const leaves=[-1,1].map(side=>{const hinge=new THREE.Group();hinge.position.set(side*R,.02,0);g.add(hinge);
        const leaf=add(shared(new THREE.CylinderGeometry(R,R,.04,24,1,false,side<0?Math.PI:0,Math.PI)),MAT.darkWood,-side*R,0,0,hinge);
        add(shared(new THREE.BoxGeometry(.05,.03,R*1.6)),MAT.brass,-side*R*.5,.03,0,hinge);return {hinge,leaf,side}});
      const mk=mine?mark:markHall;for(const l of leaves)mk(l.leaf,data);mk(well,data);
      return {group:g,well,leaves,open:0,target:0,openedAt:0};
    }
    function updateHatch(h,dt){
      if(!h)return;h.open=h.target>h.open?Math.min(h.target,h.open+dt*1.4):Math.max(h.target,h.open-dt*1.4);
      for(const l of h.leaves)l.hinge.rotation.z=-l.side*smooth(h.open)*Math.PI*.55;h.well.visible=h.open>.05;
    }

    // ---------- the Grand Hall side ----------
    const hallGlobeData={type:'antipodes-globe',title:CARDS.globe[0],author:CARDS.globe[1],action:'TURN THE GLOBE'};
    const hallHatchData={type:'antipodes-hatch',title:'A trapdoor',author:'Round, brass-rimmed, and set in the floor at the globe’s foot.',action:'LOOK'};
    const hall={globe:null,hatch:null};
    function buildHall(){
      hall.globe=buildGlobe(scene,GLOBE.x,GLOBE.z,false,hallGlobeData);hall.globe.group.name='antipodes-globe';
      hall.globe.spin.rotation.y=facing(-8);hall.globe.tilt.rotation.x=.42;// Europe to the fore, as you would expect
      hall.hatch=buildHatch(scene,HATCH.x,HATCH.z,false,hallHatchData);hall.hatch.group.name='antipodes-trapdoor';
    }
    function openHatch(h,data,where){
      h.target=1;h.openedAt=time;Object.assign(data,{title:'The trapdoor is open',author:where==='hall'?'A well goes down out of sight, lined with shelves. Step in, or press E.':'The well goes down out of sight. Step in to go home, or press E.',action:'JUMP IN'});
      playSample?.('secretDoor',.8,1.05);
    }
    function closeHatch(h,data){h.target=0;Object.assign(data,{title:'A trapdoor',author:'Round, brass-rimmed, and set in the floor at the globe’s foot.',action:'LOOK'})}

    // ---------- the far side ----------
    function sign(parent,text,sub,w,h,x,y,z,colours=['#2a1a10','#e8d6a8','#c9a45a']){
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle=colours[0];c.fillRect(0,0,W,H);c.strokeStyle=colours[2];c.lineWidth=5;c.strokeRect(6,6,W-12,H-12);c.fillStyle=colours[1];c.textAlign='center';
        let size=30;do{c.font=`bold ${size}px Georgia`;size-=2}while(c.measureText(text).width>W-40);c.fillText(text,W/2,sub?52:H/2+11);if(sub){c.font='italic 21px Georgia';c.fillText(sub,W/2,84)}},560,sub?104:72));
      return add(own(new THREE.PlaneGeometry(w,h)),own(new THREE.MeshStandardMaterial({map,emissive:0x3a2a12,emissiveIntensity:.35,roughness:.85})),x,y,z,parent);
    }
    // A picture: drawn on a canvas, hung in a frame, lit from within so it reads in a dim room.
    function picture(parent,draw,w,h,x,y,z,yaw,data,frame=timber){
      const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=yaw;parent.add(g);
      box(w+.2,h+.2,.08,frame,0,0,0,g);
      const p=add(own(new THREE.PlaneGeometry(w,h)),own(new THREE.MeshBasicMaterial({color:0xcfc4aa,map:own(canvasTexture(draw,512,Math.round(512*h/w)))})),0,0,.045,g);
      if(data)mark(p,data);return g;
    }
    // Bush slabs: rough split boards standing side by side, with daylight-dark gaps between them.
    function slabs(c,W,H){
      let seed=11;const rand=()=>(seed=(seed*16807)%2147483647)/2147483647;let x=0;
      while(x<W){const w=24+rand()*22,tone=70+rand()*30|0;c.fillStyle=`rgb(${tone+40},${tone},${tone-30})`;c.fillRect(x,0,w,H);
        c.strokeStyle='rgba(30,15,5,.35)';c.lineWidth=1;for(let k=0;k<4;k++){const gx=x+rand()*w;c.beginPath();c.moveTo(gx,0);c.bezierCurveTo(gx+4,H*.3,gx-4,H*.6,gx+2,H);c.stroke()}
        c.fillStyle='rgba(20,10,4,.85)';c.fillRect(x+w-2,0,2,H);x+=w}
      c.fillStyle='rgba(20,10,4,.5)';c.fillRect(0,H*.04,W,6);c.fillRect(0,H*.55,W,6);// the rails the slabs are nailed to
    }
    // Kauri boards: narrow, honey-coloured, tongue and groove.
    function boards(c,W,H){
      let seed=5;const rand=()=>(seed=(seed*16807)%2147483647)/2147483647;const step=19;
      for(let y=0;y<H;y+=step){const tone=150+rand()*30|0;c.fillStyle=`rgb(${tone},${tone*.72|0},${tone*.42|0})`;c.fillRect(0,y,W,step);
        c.strokeStyle='rgba(90,50,20,.25)';for(let k=0;k<3;k++){c.beginPath();const gy=y+3+rand()*(step-6);c.moveTo(0,gy);for(let x=0;x<=W;x+=40)c.lineTo(x,gy+Math.sin(x*.02+k)*2);c.stroke()}
        c.fillStyle='rgba(50,25,10,.55)';c.fillRect(0,y+step-2,W,2)}
    }
    // Warm plaster with a frieze near the top: a gold rule and a band of stars.
    function frieze(c,W,H){
      c.fillStyle='#b49a76';c.fillRect(0,0,W,H);let seed=3;const rand=()=>(seed=(seed*16807)%2147483647)/2147483647;
      for(let k=0;k<1400;k++){c.fillStyle=`rgba(${rand()<.5?'255,240,210':'90,60,30'},.06)`;c.fillRect(rand()*W,rand()*H,3,3)}
      const top=H*.1,band=H*.07;c.fillStyle='#1a2340';c.fillRect(0,top,W,band);c.fillStyle='#c9a45a';c.fillRect(0,top-4,W,4);c.fillRect(0,top+band,W,4);
      c.fillStyle='#f0dca0';for(let x=24;x<W;x+=64){const y=top+band/2,r=7;c.beginPath();for(let k=0;k<10;k++){const a=k*Math.PI/5-Math.PI/2,rr=k%2?r*.45:r;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}c.closePath();c.fill()}
      c.fillStyle='#6e5638';c.fillRect(0,H*.82,W,H*.18);c.fillStyle='#c9a45a';c.fillRect(0,H*.82,W,3);// a dado below
    }
    function stoneWork(c,W,H){
      c.fillStyle='#3a3028';c.fillRect(0,0,W,H);let seed=9;const rand=()=>(seed=(seed*16807)%2147483647)/2147483647;
      for(let y=0;y<H;y+=36){let x=-rand()*40;while(x<W){const w=40+rand()*50,tone=95+rand()*40|0;c.fillStyle=`rgb(${tone},${tone*.88|0},${tone*.74|0})`;c.beginPath();c.roundRect?c.roundRect(x+2,y+2,w-4,32,6):c.rect(x+2,y+2,w-4,32);c.fill();x+=w}}
    }
    function starrySky(c,W,H,{cross=true,glow='#0b1530'}={}){
      const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#03060f');g.addColorStop(1,glow);c.fillStyle=g;c.fillRect(0,0,W,H);
      // The Milky Way, running through the Cross.
      c.save();c.translate(W/2,H/2);c.rotate(-.5);const band=c.createLinearGradient(0,-H*.18,0,H*.18);band.addColorStop(0,'rgba(170,180,220,0)');band.addColorStop(.5,'rgba(170,180,220,.16)');band.addColorStop(1,'rgba(170,180,220,0)');c.fillStyle=band;c.fillRect(-W,-H*.18,W*2,H*.36);c.restore();
      let seed=7;const rand=()=>(seed=(seed*16807)%2147483647)/2147483647;
      for(let i=0;i<W*H/900;i++){const s=rand()*rand()*1.6+.3;c.fillStyle=`rgba(255,250,235,${.25+rand()*.6})`;c.fillRect(rand()*W,rand()*H,s,s)}
      if(!cross)return;
      const scale=W/26,at=([ra,dec])=>[W/2-(ra-13.4)*15*Math.cos(dec*Math.PI/180)*scale,H/2-(dec+60.2)*scale];
      // The Coalsack, to the south-east of the Cross.
      const [sx,sy]=at([12.85,-62.5]),dark=c.createRadialGradient(sx,sy,0,sx,sy,scale*2.4);dark.addColorStop(0,'rgba(2,3,8,.9)');dark.addColorStop(1,'rgba(2,3,8,0)');c.fillStyle=dark;c.fillRect(0,0,W,H);
      for(const star of STARS){const [x,y]=at(star),r=Math.max(2.4,(4.2-star[2])*3.2),halo=c.createRadialGradient(x,y,0,x,y,r*3);halo.addColorStop(0,'rgba(255,255,255,1)');halo.addColorStop(.25,'rgba(220,230,255,.8)');halo.addColorStop(1,'rgba(200,220,255,0)');c.fillStyle=halo;c.beginPath();c.arc(x,y,r*3,0,TAU);c.fill()}
    }
    function bushNight(c,W,H){
      starrySky(c,W,H,{cross:false,glow:'#1a2236'});
      c.fillStyle='#0d0d0a';c.fillRect(0,H*.82,W,H*.18);
      for(const [x,s] of [[.18,1],[.52,1.3],[.83,.9]]){c.strokeStyle='#d9d2c0';c.lineWidth=10*s;c.beginPath();c.moveTo(W*x,H);c.bezierCurveTo(W*x-10,H*.7,W*x+20,H*.55,W*x+5,H*.4*1/s+H*.1);c.stroke();
        c.fillStyle='rgba(40,52,40,.92)';for(let k=0;k<7;k++){c.beginPath();c.ellipse(W*x+(k-3)*24*s,H*.36+((k*37)%40)-10,48*s,22*s,0,0,TAU);c.fill()}}
      c.fillStyle='rgba(255,240,200,.85)';c.beginPath();c.arc(W*.7,H*.16,14,0,TAU);c.fill();
    }
    function alpsNight(c,W,H){
      starrySky(c,W,H,{cross:true,glow:'#16233c'});
      const ridge=(base,amp,colour,peaks)=>{c.fillStyle=colour;c.beginPath();c.moveTo(0,H);for(let x=0;x<=W;x+=8){let y=base;for(const [px,ph,pw] of peaks)y=Math.min(y,H*ph+Math.abs(x-W*px)*pw);c.lineTo(x,y+Math.sin(x*.07)*amp)}c.lineTo(W,H);c.closePath();c.fill()};
      ridge(H*.62,3,'#c9d3e2',[[.42,.3,.9],[.62,.4,1.1],[.2,.45,1]]);
      c.fillStyle='rgba(60,72,95,.55)';c.beginPath();c.moveTo(W*.42,H*.3);c.lineTo(W*.42+120,H*.62);c.lineTo(W*.42+40,H*.62);c.closePath();c.fill();
      ridge(H*.78,4,'#232c38',[[.1,.6,.6],[.8,.58,.5]]);ridge(H*.9,2,'#10151a',[[.5,.84,.3]]);
    }
    function buildFar(){
      root=new THREE.Group();root.name='antipodes';
      timber=own(new THREE.MeshStandardMaterial({color:0x5e3c22,roughness:.75}));
      const floor=own(new THREE.MeshStandardMaterial({color:0x6a4a30,roughness:.9,map:MAT.wood?.map||null}));
      // Walls painted in metres: bush slabs in the Australian Room, kauri boards in the New Zealand Room, plaster with
      // a frieze of stars in the hall between.
      const walls=(draw,len,h)=>own(new THREE.MeshStandardMaterial({roughness:.95,map:(()=>{const t=own(canvasTexture(draw,512,Math.round(512*h/4)));t.wrapS=THREE.RepeatWrapping;t.repeat.set(len/4,1);return t})()}));
      const AUS_W=(len)=>walls(slabs,len,AUS.h),NZ_W=(len)=>walls(boards,len,NZ.h),HALL_W=(len)=>walls(frieze,len,HALL.h);
      const plaster=HALL_W(HALL.d),ochre=AUS_W(AUS.w),kauri=NZ_W(NZ.w);
      // Floors and ceilings, and the outer walls.
      const west=AUS.cx-AUS.w/2,east=NZ.cx+NZ.w/2,north=HALL.cz-HALL.d/2,south=HALL.cz+HALL.d/2,length=east-west;
      box(length,.3,HALL.d,floor,(west+east)/2,-.15,HALL.cz,root);
      box(AUS.w,.25,AUS.d,timber,AUS.cx,AUS.h+.12,AUS.cz,root);box(NZ.w,.25,NZ.d,timber,NZ.cx,NZ.h+.12,NZ.cz,root);
      for(const [room,wall] of [[AUS,ochre],[HALL,HALL_W(HALL.w)],[NZ,kauri]]){box(room.w,room.h,.3,wall,room.cx,room.h/2,north,root);box(room.w,room.h,.3,wall,room.cx,room.h/2,south,root)}
      box(.3,AUS.h,AUS.d,AUS_W(AUS.d),west,AUS.h/2,AUS.cz,root);box(.3,NZ.h,NZ.d,NZ_W(NZ.d),east,NZ.h/2,NZ.cz,root);
      // The walls between, each with an arch through it, and the hall's higher walls above the rooms' ceilings.
      for(const x of [HALL.cx-HALL.w/2,HALL.cx+HALL.w/2]){const side=(HALL.d-ARCH)/2;for(const s of [-1,1])box(.4,HALL.h,side,plaster,x,HALL.h/2,HALL.cz+s*(ARCH+side)/2,root);box(.4,HALL.h-3.6,ARCH,plaster,x,3.6+(HALL.h-3.6)/2,HALL.cz,root);
        for(const s of [-1,1])box(.5,3.6,.18,timber,x,1.8,HALL.cz+s*(ARCH/2+.05),root);box(.5,.2,ARCH+.3,timber,x,3.6,HALL.cz,root);
        block(x,HALL.cz-(ARCH+(HALL.d-ARCH)/2)/2,.5,(HALL.d-ARCH)/2+.1);block(x,HALL.cz+(ARCH+(HALL.d-ARCH)/2)/2,.5,(HALL.d-ARCH)/2+.1)}
      buildHallRoom(plaster);buildAustralia();buildNewZealand();
      scene.add(root);
    }
    let far={globe:null,hatch:null},farGlobeData=null,farHatchData=null,clocks=null,clockStamp='';
    // The time in Perth, Sydney and Wellington, read from the reader's own clock (Intl knows the zones, and their summer time).
    const ZONES=[['PERTH','Australia/Perth'],['SYDNEY','Australia/Sydney'],['WELLINGTON','Pacific/Auckland']];
    function zoneTime(zone,date=new Date()){
      try{const parts=new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric',hourCycle:'h23'}).formatToParts(date),get=type=>Number(parts.find(p=>p.type===type)?.value);
        const h=get('hour'),m=get('minute'),local=Date.UTC(get('year'),get('month')-1,get('day'),h,m);
        // How far the zone is ahead of the reader, in minutes: its wall clock read as if it were UTC, less the reader's.
        const reader=Date.UTC(date.getFullYear(),date.getMonth(),date.getDate(),date.getHours(),date.getMinutes());return {h,m,ahead:Math.round((local-reader)/60000)}}catch(e){return null}}
    function drawClocks(c,W,H){
      c.fillStyle='#2a1a10';c.fillRect(0,0,W,H);c.strokeStyle='#c9a45a';c.lineWidth=5;c.strokeRect(6,6,W-12,H-12);
      ZONES.forEach(([name,zone],i)=>{const x=W*(i+.5)/3,y=H*.44,r=H*.3,t=zoneTime(zone);
        c.fillStyle='#efe4c8';c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.strokeStyle='#8a6a30';c.lineWidth=6;c.stroke();
        c.fillStyle='#3a2a1a';for(let k=0;k<12;k++){const a=k/12*TAU;c.fillRect(x+Math.sin(a)*r*.82-2,y-Math.cos(a)*r*.82-2,4,4)}
        if(t){const hand=(a,len,w)=>{c.lineWidth=w;c.strokeStyle='#2a1a10';c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.sin(a)*len,y-Math.cos(a)*len);c.stroke()};hand((t.h%12+t.m/60)/12*TAU,r*.5,7);hand(t.m/60*TAU,r*.75,4)}
        c.fillStyle='#e8d6a8';c.font='bold 30px Georgia';c.textAlign='center';c.fillText(name,x,H-26)});
    }
    function clockWords(date=new Date()){
      const say=([name,zone])=>{const t=zoneTime(zone,date);if(!t)return null;const hours=Math.abs(t.ahead)/60,hm=`${String(t.h).padStart(2,'0')}:${String(t.m).padStart(2,'0')}`;
        return `${name[0]+name.slice(1).toLowerCase()} ${hm}${t.ahead?`, ${hours} hour${hours===1?'':'s'} ${t.ahead>0?'ahead of':'behind'} you`:', the same as you'}`};
      return ZONES.map(say).filter(Boolean).join('; ')+'.';
    }
    function buildHallRoom(plaster){
      const {cx,cz,w,d,h}=HALL;
      // The ceiling, with a skylight full of southern stars in the middle of it.
      const sky=5.6,rim=(w-sky)/2;for(const s of [-1,1]){box(rim,.25,d,timber,cx+s*(sky+rim)/2,h+.12,cz,root);box(sky,.25,(d-sky)/2,timber,cx,h+.12,cz+s*(sky+(d-sky)/2)/2,root)}
      const skylight=add(own(new THREE.PlaneGeometry(sky,sky)),own(new THREE.MeshBasicMaterial({map:own(canvasTexture((c,W,H)=>starrySky(c,W,H),1024,1024))})),cx,h+.2,cz,root);skylight.rotation.x=Math.PI/2;mark(skylight,card('cross'));
      for(let k=1;k<4;k++){box(.08,.12,sky,timber,cx-sky/2+k*sky/4,h+.05,cz,root);box(sky,.12,.08,timber,cx,h+.05,cz-sky/2+k*sky/4,root)}
      // A stone floor in the middle, round the trapdoor, with a compass rose laid into it.
      const rose=add(own(new THREE.CircleGeometry(2.6,48)),own(new THREE.MeshStandardMaterial({roughness:.8,map:own(canvasTexture((c,W,H)=>{c.fillStyle='#4c4238';c.fillRect(0,0,W,H);c.translate(W/2,H/2);c.strokeStyle='#c9a45a';c.lineWidth=4;c.beginPath();c.arc(0,0,W*.47,0,TAU);c.stroke();
        for(let k=0;k<8;k++){c.save();c.rotate(k*Math.PI/4);c.fillStyle=k%2?'#7a6a50':'#c9a45a';c.beginPath();c.moveTo(0,-W*(k%2?.3:.44));c.lineTo(W*.05,0);c.lineTo(-W*.05,0);c.closePath();c.fill();c.restore()}
        c.fillStyle='#e8d6a8';c.font='bold 30px Georgia';c.textAlign='center';c.fillText('N',0,-W*.36);c.fillText('S',0,W*.4);c.fillText('E',W*.4,10);c.fillText('W',-W*.4,10)},512,512))})),cx,.005,FAR_HATCH.z,root);rose.rotation.x=-Math.PI/2;
      farGlobeData={type:'antipodes-globe-home',title:CARDS.home[0],author:CARDS.home[1],action:'TURN THE GLOBE'};
      farHatchData={type:'antipodes-hatch-home',title:'A trapdoor',author:'The one you came up through, closed again behind you.',action:'LOOK'};
      far.globe=buildGlobe(root,FAR_GLOBE.x,FAR_GLOBE.z,true,farGlobeData);far.globe.spin.rotation.y=facing(150);far.globe.tilt.rotation.x=-.5;block(FAR_GLOBE.x,FAR_GLOBE.z,1.4,1.4);
      far.hatch=buildHatch(root,FAR_HATCH.x,FAR_HATCH.z,true,farHatchData);
      mark(sign(root,'THE ANTIPODES','Through the Earth from the Grand Hall',4.4,.82,cx,5.35,cz-d/2+.17),card('hallSign'));
      // Three clocks keeping the time where the books on these shelves were written, and the time back home.
      clocks=new THREE.Group();clocks.position.set(cx,3.55,cz-d/2+.2);root.add(clocks);clocks.texture=own(canvasTexture(drawClocks,1024,360));
      mark(add(own(new THREE.PlaneGeometry(4.6,1.62)),own(new THREE.MeshStandardMaterial({map:clocks.texture,emissive:0x2a1c0c,emissiveIntensity:.3,roughness:.6})),0,0,0,clocks),{type:'antipodes-card',title:'Three clocks',author:'The time in Perth, Sydney and Wellington, now.',action:'READ',clocks:true});
      mark(sign(root,'AUSTRALIA','The Australian Room',2.6,.5,cx-w/2+.22,4.1,cz),card('ausSign')).rotation.y=Math.PI/2;
      mark(sign(root,'AOTEAROA NEW ZEALAND','The New Zealand Room · Nau mai, haere mai',2.9,.54,cx+w/2-.22,4.1,cz),card('nzSign')).rotation.y=-Math.PI/2;
      // On the south wall: the books that came this way, a picture of Alice falling, and a card on the antipodes.
      const voyages=shelfBooks('voyages');const caseX=cx-2.4;box(3.6,1.1,.5,timber,caseX,.55,cz+d/2-.4,root);block(caseX,cz+d/2-.4,3.8,.8);
      voyages.forEach((book,i)=>placeBook(book,{x:caseX-1.4+i*.56,y:1.42,z:cz+d/2-.45,yaw:Math.PI,lean:.12},'voyages',.5));
      mark(sign(root,'THE WAY HERE','Voyages to the far side of the world',2.6,.5,caseX,2.6,cz+d/2-.17,['#2a1a10','#e8d6a8','#c9a45a']),{type:'antipodes-card',title:'The way here',author:'Cook, Flinders, Darwin and Mark Twain all came by sea. Alice, like you, expected to come straight through.',action:'READ'}).rotation.y=Math.PI;
      picture(root,(c,W,H)=>{c.fillStyle='#e9dfc6';c.fillRect(0,0,W,H);c.strokeStyle='#3a2a1a';c.lineWidth=3;
        for(let k=0;k<6;k++){c.strokeRect(30,30+k*70,90,50);c.strokeRect(W-120,60+k*70,90,50)}// the cupboards and shelves of the well
        c.fillStyle='#3a2a1a';c.beginPath();c.arc(W/2,H*.32,26,0,TAU);c.fill();c.fillStyle='#e9dfc6';c.beginPath();c.arc(W/2,H*.32,20,0,TAU);c.fill();
        c.beginPath();c.moveTo(W/2-60,H*.75);c.lineTo(W/2,H*.4);c.lineTo(W/2+60,H*.75);c.closePath();c.strokeStyle='#3a2a1a';c.lineWidth=4;c.stroke();
        c.beginPath();c.moveTo(W/2-20,H*.42);c.lineTo(W/2-90,H*.3);c.moveTo(W/2+20,H*.42);c.lineTo(W/2+90,H*.3);c.moveTo(W/2-20,H*.75);c.lineTo(W/2-30,H*.9);c.moveTo(W/2+20,H*.75);c.lineTo(W/2+30,H*.9);c.stroke();
        c.fillStyle='#3a2a1a';c.font='italic 22px Georgia';c.textAlign='center';c.fillText('“Down, down, down.”',W/2,H-22)},1.3,1.6,cx+2.2,2.2,cz+d/2-.2,Math.PI,card('alice'));
      picture(root,(c,W,H)=>{c.fillStyle='#e9dfc6';c.fillRect(0,0,W,H);c.translate(W/2,H/2);c.strokeStyle='#3a2a1a';c.lineWidth=3;c.beginPath();c.arc(0,0,W*.4,0,TAU);c.stroke();
        c.setLineDash([8,6]);c.beginPath();c.moveTo(0,-W*.4);c.lineTo(0,W*.4);c.stroke();c.setLineDash([]);c.fillStyle='#a03a2a';c.beginPath();c.arc(0,-W*.4,8,0,TAU);c.arc(0,W*.4,8,0,TAU);c.fill();
        c.fillStyle='#3a2a1a';c.font='bold 20px Georgia';c.textAlign='center';c.fillText('DUBLIN',0,-W*.4-16);c.fillText('THE ANTIPODES',0,W*.4+30);c.font='italic 18px Georgia';c.fillText('12,742 km',40,0)},1.1,1.1,cx+4.3,2.2,cz+d/2-.2,Math.PI,card('antipodes'));
      // A lantern hung from the skylight frame: the hall's one light, and the one the stars are seen past.
      const lamp=new THREE.PointLight(0xffd9a8,5,16,2);lamp.position.set(cx,h-1.6,cz-2.6);root.add(lamp);
      add(own(new THREE.SphereGeometry(.16,12,8)),own(new THREE.MeshStandardMaterial({color:0xffe2a8,emissive:0xffb35c,emissiveIntensity:1.2})),cx,h-1.55,cz-2.6,root);
      add(own(new THREE.CylinderGeometry(.01,.01,1.5,4)),MAT.brass,cx,h-.8,cz-2.6,root);
    }
    function wallBooks(group,list,spots){list.forEach((book,i)=>placeBook(book,spots[i],group))}
    // Two rows of five face-out books along a wall, with their shelves.
    function rowSpots(count,{x0,z0,dx,dz,yaw,ys=[1.55,2.85],step=1.8}){const out=[];for(let i=0;i<count;i++){const row=Math.floor(i/5),col=i%5;out.push({x:x0+dx*col*step,z:z0+dz*col*step,y:ys[row]??ys[0]+row*1.3,yaw})}return out}
    function shelfBoards(x,z,len,along,ys){for(const y of ys)along==='x'?box(len,.05,.34,timber,x,y-.5,z,root):box(.34,.05,len,timber,x,y-.5,z,root)}
    function buildAustralia(){
      const {cx,cz,w,d,h}=AUS,west=cx-w/2,north=cz-d/2,south=cz+d/2;
      // Slab walls: a dado of rough boards round the room.
      const slab=own(new THREE.MeshStandardMaterial({color:0x5a3a22,roughness:1}));
      for(const [x,z,sw,sd] of [[cx,north+.17,w-.4,.05],[cx,south-.17,w-.4,.05],[west+.17,cz,.05,d-.4]])box(sw,1.05,sd,slab,x,.52,z,root);
      for(let i=0;i<5;i++)box(.2,.18,d-.3,timber,west+1.8+i*3.6,h-.05,cz,root);// rafters
      // A bush fireplace of stone in the west wall, with a billy hung over the fire.
      const stone=own(new THREE.MeshStandardMaterial({roughness:1,map:own(canvasTexture(stoneWork,256,256))})),fz=cz,fx=west+.55;
      box(.9,2.7,3.2,stone,fx,1.35,fz,root);box(.7,2.6,1.4,stone,fx-.05,4,fz,root);box(1.1,.16,3.6,timber,fx+.1,2.75,fz,root);
      add(own(new THREE.PlaneGeometry(1.8,1.3)),own(new THREE.MeshBasicMaterial({color:0x140a06})),fx+.46,.75,fz,root).rotation.y=Math.PI/2;
      const logs=own(new THREE.MeshStandardMaterial({color:0x4a3020,roughness:1})),ember=own(new THREE.MeshStandardMaterial({color:0x5a2a10,emissive:0xff6a1e,emissiveIntensity:1.3,roughness:.9}));
      for(const [dz,a,m] of [[-.3,.4,logs],[.3,-.4,logs],[0,0,ember]])add(own(new THREE.CylinderGeometry(.08,.09,.9,7)),m,fx+.75,.12,fz+dz,root).rotation.set(Math.PI/2,a,0);
      const flame=own(new THREE.MeshBasicMaterial({color:0xff8a36,transparent:true,opacity:.85}));
      const flames=[[-.15,.8],[.12,1],[0,.7]].map(([dz,s])=>({mesh:add(own(new THREE.ConeGeometry(.12*s,.5*s,7)),flame,fx+.75,.35+.2*s,fz+dz,root),phase:Math.random()*6}));
      const tin=own(new THREE.MeshStandardMaterial({color:0x9a9a92,metalness:.7,roughness:.35}));
      const billy=add(own(new THREE.CylinderGeometry(.13,.12,.24,14)),tin,fx+.75,.95,fz,root);mark(billy,card('billy'));
      add(own(new THREE.TorusGeometry(.13,.008,4,16,Math.PI)),tin,fx+.75,1.07,fz,root).rotation.y=Math.PI/2;
      add(own(new THREE.CylinderGeometry(.012,.012,.9,4)),tin,fx+.75,1.5,fz,root);
      const hearth=add(own(new THREE.PlaneGeometry(1.6,1)),own(new THREE.MeshBasicMaterial({visible:false})),fx+.7,.6,fz,root);hearth.rotation.y=Math.PI/2;mark(hearth,card('billy'));
      fire={flames,light:new THREE.PointLight(0xff8a3a,7,16,1.8)};fire.light.position.set(fx+1.6,1.1,fz);root.add(fire.light);block(fx+.3,fz,1.7,3.4);
      // A swag against the fireplace, and the bench in front of the fire: one of the library's seats.
      const canvas=own(new THREE.MeshStandardMaterial({color:0x7a6a48,roughness:1}));
      const swag=add(own(new THREE.CylinderGeometry(.2,.2,1.1,12)),canvas,fx+.75,.2,fz+2.1,root);swag.rotation.x=Math.PI/2;mark(swag,card('swag'));
      for(const dz of [-.3,.3])add(own(new THREE.TorusGeometry(.205,.02,4,14)),timber,fx+.75,.2,fz+2.1+dz,root).rotation.y=0;
      block(fx+.75,fz+2.1,.5,1.2);
      const bench=new THREE.Group();bench.position.set(fx+2.6,0,fz);bench.rotation.y=-Math.PI/2;root.add(bench);
      const seat=box(2.2,.1,.5,timber,0,.46,0,bench);for(const sx of [-.9,.9])box(.1,.44,.4,timber,sx,.22,0,bench);block(fx+2.6,fz,.7,2.4);
      if(registerSeat){const data=registerSeat([seat],bench,new THREE.Vector3(0,1.2,.1),-Math.PI/2,{title:'A bench by the fire',author:'Sit and read one of the Australian Room’s books.'});
        Object.defineProperty(data,'bookIds',{get:()=>books.filter(b=>b.userData.shelf==='australian').map(b=>b.userData.book.id),configurable:true});ours.push(seat)}
      // The books: ten along the north wall, six on the south wall either side of the window.
      const list=shelfBooks('australian');
      const northSpots=rowSpots(10,{x0:cx-3.6,z0:north+.3,dx:1,dz:0,yaw:0});
      const southSpots=[[-3,1.55],[3,1.55],[-4.6,1.55],[4.6,1.55],[-3.8,2.85],[3.8,2.85]].map(([dx,y])=>({x:cx+dx,z:south-.3,y,yaw:Math.PI}));
      wallBooks('australian',list.slice(0,10),northSpots);wallBooks('australian',list.slice(10),southSpots);
      shelfBoards(cx,north+.34,9.6,'x',[1.55,2.85]);for(const s of [-1,1])shelfBoards(cx+s*3.8,south-.34,3,'x',[1.55,2.85]);
      block(cx,north+.4,9.8,.6);for(const s of [-1,1])block(cx+s*3.8,south-.4,3.2,.6);
      mark(sign(root,'AUSTRALIA','The Australian Room',3,.56,cx,4.05,north+.2,['#3a1e10','#f0dcb0','#c98f5a']),card('ausSign'));
      // A window on the bush at night, a kookaburra on a gum branch above it, and a card for the first Australians.
      picture(root,bushNight,2.6,1.7,cx,2.2,south-.2,Math.PI,card('bush'),timber);
      const branch=add(own(new THREE.CylinderGeometry(.04,.06,2.2,6)),own(new THREE.MeshStandardMaterial({color:0xcfc6b0,roughness:.9})),cx,3.4,south-.35,root);branch.rotation.z=Math.PI/2+.08;
      const bird=kookaburra(cx+.3,3.47,south-.35);mark(bird,card('kookaburra'));
      picture(root,(c,W,H)=>{c.fillStyle='#2a1a10';c.fillRect(0,0,W,H);const dot=(x,y,r,col)=>{c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,TAU);c.fill()};
        for(let ring=0;ring<6;ring++)for(let k=0;k<12+ring*8;k++){const a=k/(12+ring*8)*TAU;dot(W/2+Math.cos(a)*(30+ring*34),H/2+Math.sin(a)*(30+ring*34)*.7,5,ring%2?'#e8d6a8':'#c98f5a')}
        dot(W/2,H/2,22,'#e8d6a8');c.fillStyle='#f0dcb0';c.font='italic 22px Georgia';c.textAlign='center';c.fillText('The first Australians',W/2,H-18)},1.2,.9,cx+6.6,2.2,north+.2,0,card('first'));
    }
    function kookaburra(x,y,z){
      const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=Math.PI*.85;root.add(g);
      const brown=own(new THREE.MeshStandardMaterial({color:0x5a4430,roughness:.9})),cream=own(new THREE.MeshStandardMaterial({color:0xe8dcc0,roughness:.9})),dark=own(new THREE.MeshStandardMaterial({color:0x2a2018,roughness:.6}));
      const body=add(own(new THREE.SphereGeometry(.13,12,8)),cream,0,.1,0,g);body.scale.set(1,1.25,.95);
      add(own(new THREE.SphereGeometry(.135,12,8)),brown,0,.12,-.04,g).scale.set(1.02,1.2,.8);
      add(own(new THREE.SphereGeometry(.09,12,8)),cream,0,.29,.02,g);
      add(own(new THREE.BoxGeometry(.04,.03,.18)),dark,0,.28,.15,g);add(own(new THREE.BoxGeometry(.12,.02,.06)),dark,0,.31,.03,g);
      add(own(new THREE.BoxGeometry(.08,.2,.03)),brown,0,-.05,-.12,g).rotation.x=.4;
      return body;
    }
    function laugh(){
      if(laughing>time)return;laughing=time+3;const notes=[[0,520],[90,560],[180,620],[260,700],[340,760],[420,820],[500,880],[600,820],[700,900],[800,860],[900,940],[1050,700],[1180,620],[1320,540],[1480,460]];
      for(const [at,f] of notes)setTimeout(()=>sound?.(f+Math.random()*60,.11,'sawtooth',.035),at);
    }
    function buildNewZealand(){
      const {cx,cz,w,d,h}=NZ,east=cx+w/2,north=cz-d/2,south=cz+d/2;
      const panel=own(new THREE.MeshStandardMaterial({color:0x5e4428,roughness:.7}));
      for(const [x,z,sw,sd] of [[cx,north+.17,w-.4,.05],[cx,south-.17,w-.4,.05],[east-.17,cz,.05,d-.4]])box(sw,1.05,sd,panel,x,.52,z,root);
      for(let i=0;i<5;i++)box(.2,.18,d-.3,timber,east-1.8-i*3.6,h-.05,cz,root);
      // A wide window on the Southern Alps under the stars, in the east wall.
      picture(root,alpsNight,5.2,2.3,east-.2,2.45,cz,-Math.PI/2,card('alps'),own(new THREE.MeshStandardMaterial({color:0xe8e2d2,roughness:.8})));
      for(const dz of [-1.3,1.3])box(.1,2.3,.08,own(new THREE.MeshStandardMaterial({color:0xe8e2d2,roughness:.8})),east-.24,2.45,cz+dz,root);
      // A chair by the window, one of the library's seats.
      const fabric=own(new THREE.MeshStandardMaterial({color:0x2e4a4a,roughness:.9})),chair=new THREE.Group();chair.position.set(east-2.4,0,cz+3.2);chair.rotation.y=-Math.PI/2-.6;root.add(chair);
      const seat=box(.95,.42,.9,fabric,0,.4,0,chair),back=box(.95,.85,.2,fabric,0,.95,.38,chair);for(const sx of [-.42,.42])box(.13,.32,.9,fabric,sx,.74,0,chair);block(east-2.4,cz+3.2,1.2,1.2);
      if(registerSeat){const data=registerSeat([seat,back],chair,new THREE.Vector3(0,1.3,.12),-Math.PI/2-.6,{title:'A chair by the window',author:'Sit and read one of the New Zealand Room’s books.'});
        Object.defineProperty(data,'bookIds',{get:()=>books.filter(b=>b.userData.shelf==='nz').map(b=>b.userData.book.id),configurable:true});ours.push(seat,back)}
      // A silver fern in a pot, and a kiwi out on the floor at night.
      const pot=add(own(new THREE.CylinderGeometry(.3,.24,.5,12)),own(new THREE.MeshStandardMaterial({color:0x7a4a30,roughness:.9})),east-1,.25,north+1.2,root);block(east-1,north+1.2,.9,.9);
      const frond=own(new THREE.MeshStandardMaterial({color:0x2f5a34,roughness:.8,side:THREE.DoubleSide})),silver=own(new THREE.MeshStandardMaterial({color:0xc8d2cc,roughness:.6,side:THREE.DoubleSide}));
      const fern=new THREE.Group();fern.position.set(east-1,.5,north+1.2);root.add(fern);const frondGeo=own(new THREE.PlaneGeometry(.22,1.2));
      for(let k=0;k<9;k++){const a=k/9*TAU,f=add(frondGeo,k===4?silver:frond,Math.cos(a)*.3,.45,Math.sin(a)*.3,fern);f.rotation.set(0,-a+Math.PI/2,0);f.rotateX(-.75);if(k===4)mark(f,card('fern'))}
      mark(pot,card('fern'));
      const kiwiBody=kiwi(east-3.2,cz-1.6);mark(kiwiBody,card('kiwi'));block(east-3.2,cz-1.6,.6,.6);
      // Katherine Mansfield's writing desk, in the middle of the south wall, with five books either side of it.
      const desk=new THREE.Group();desk.position.set(cx,0,south-.6);desk.rotation.y=Math.PI;root.add(desk);
      const top=box(1.6,.06,.7,timber,0,.78,0,desk);for(const sx of [-.72,.72])for(const sz of [-.28,.28])box(.06,.76,.06,timber,sx,.38,sz,desk);
      const paper=own(new THREE.MeshStandardMaterial({color:0xefe6d0,roughness:.9}));box(.3,.01,.4,paper,-.2,.815,0,desk).rotation.y=.2;box(.012,.012,.18,MAT.brass,.15,.82,0,desk).rotation.y=-.5;
      mark(top,card('desk'));block(cx,south-.6,1.8,.9);
      mark(sign(root,'AOTEAROA NEW ZEALAND','Nau mai, haere mai · The New Zealand Room',3.4,.6,cx,4.05,north+.2,['#14262a','#e8e2d0','#9ab8b0']),card('nzSign'));
      const list=shelfBooks('nz');
      const northSpots=rowSpots(10,{x0:cx-3.6,z0:north+.3,dx:1,dz:0,yaw:0});
      const southSpots=[[-2.8,1.55],[2.8,1.55],[-4.6,1.55],[4.6,1.55],[-3.7,2.85]].map(([dx,y])=>({x:cx+dx,z:south-.3,y,yaw:Math.PI}));
      wallBooks('nz',list.slice(0,10),northSpots);wallBooks('nz',list.slice(10),southSpots);
      // A second shelf either side of the desk only when there are books for it.
      shelfBoards(cx,north+.34,9.6,'x',[1.55,2.85]);for(const s of [-1,1])shelfBoards(cx+s*3.7,south-.34,2.9,'x',list.length>14&&s<0?[1.55,2.85]:[1.55]);
      block(cx,north+.4,9.8,.6);for(const s of [-1,1])block(cx+s*3.7,south-.4,3.1,.6);
      const lamp=new THREE.PointLight(0xffd49a,4.5,15,2);lamp.position.set(cx,h-.7,cz);root.add(lamp);
      add(own(new THREE.SphereGeometry(.16,12,8)),own(new THREE.MeshStandardMaterial({color:0xffe2a8,emissive:0xffb35c,emissiveIntensity:1.2})),cx,h-.65,cz,root);
    }
    function kiwi(x,z){
      const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=.9;root.add(g);
      const feather=own(new THREE.MeshStandardMaterial({color:0x5a4632,roughness:1})),bill=own(new THREE.MeshStandardMaterial({color:0xc8b48a,roughness:.6}));
      const body=add(own(new THREE.SphereGeometry(.2,14,10)),feather,0,.24,0,g);body.scale.set(.9,.85,1.25);
      add(own(new THREE.SphereGeometry(.08,10,8)),feather,0,.33,.24,g);
      const beak=add(own(new THREE.CylinderGeometry(.008,.016,.32,6)),bill,0,.2,.42,g);beak.rotation.x=1.9;
      for(const s of [-1,1])add(own(new THREE.CylinderGeometry(.018,.018,.16,5)),bill,s*.07,.07,0,g);
      return body;
    }

    // ---------- books ----------
    const bookGeometry=()=>own(new THREE.BoxGeometry(.72,.96,.13));
    function shelfBooks(key){
      const shelf=SHELVES.find(s=>s.key===key);
      return [...new Set([...shelf.ids,...(arrivals[key]||[])])].map(id=>{const [title,author]=RECORDS[id]||[];return findBook(id,title?{id,title,author}:null)}).filter(Boolean).slice(0,shelf.max);
    }
    let sharedBookGeometry=null;
    function placeBook(book,spot,shelf,scale=1){
      if(!spot)return null;sharedBookGeometry=sharedBookGeometry||bookGeometry();
      const mesh=add(sharedBookGeometry,own(bookMaterial(book)),spot.x,spot.y,spot.z,root);mesh.rotation.order='YXZ';mesh.rotation.y=spot.yaw;mesh.rotation.x=-(spot.lean??.08);if(scale!==1)mesh.scale.setScalar(scale);
      mesh.userData={type:'book',book,loaded:false,antipodes:true,shelf,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:root}};
      interactables.push(mesh);ours.push(mesh);books.push(mesh);return mesh;
    }

    // ---------- the well through the Earth ----------
    // A tube 124 m long, built a long way from anything else: the reader's eye falls down it while the world waits.
    // Its walls are one tall painting, laid on top to bottom: Alice's well (wood, cupboards, shelves), the rock, the
    // glowing centre, the rock again and the other well, painted upside down, because by then so is the reader.
    function shaftPainting(){
      return own(canvasTexture((c,W,H)=>{
        const L=SHAFT.top*2,m=H/L,yOf=depth=>depth*m;
        const band=(d0,d1,top,bottom)=>{const g=c.createLinearGradient(0,yOf(d0),0,yOf(d1));g.addColorStop(0,top);g.addColorStop(1,bottom);c.fillStyle=g;c.fillRect(0,yOf(d0),W,yOf(d1)-yOf(d0))};
        band(0,30,'#4a2e1a','#3a2414');band(30,50,'#3a3028','#2a2018');band(50,56,'#4a2010','#b0400c');band(56,68,'#ffb040','#ffb040');band(68,74,'#b0400c','#4a2010');band(74,94,'#2a2018','#3a3028');band(94,124,'#3a2414','#4a2e1a');
        // Panelling in the two wells, strata in the rock, cracks of light near the centre.
        for(const [d0,d1] of [[0,30],[94,124]]){c.strokeStyle='rgba(20,10,4,.6)';c.lineWidth=3;for(let x=0;x<W;x+=W/8){c.beginPath();c.moveTo(x,yOf(d0));c.lineTo(x,yOf(d1));c.stroke()}for(let d=d0;d<d1;d+=1.5){c.beginPath();c.moveTo(0,yOf(d));c.lineTo(W,yOf(d));c.stroke()}}
        for(let d=30;d<94;d+=.8){if(d>50&&d<74)continue;c.strokeStyle=`rgba(${d%3<1.5?'0,0,0':'255,230,200'},.12)`;c.lineWidth=1+((d*7)%3);c.beginPath();c.moveTo(0,yOf(d));for(let x=0;x<=W;x+=32)c.lineTo(x,yOf(d)+Math.sin(x*.05+d)*3);c.stroke()}
        for(let k=0;k<60;k++){const d=50+Math.random()*24,x=Math.random()*W;c.strokeStyle=`rgba(255,${180+Math.random()*60|0},80,.8)`;c.lineWidth=2;c.beginPath();c.moveTo(x,yOf(d));c.lineTo(x+(Math.random()-.5)*40,yOf(d)+(Math.random()-.5)*60);c.stroke()}
      },256,4096));
    }
    const PROPS={
      shelf:(c,W,H)=>{c.fillStyle='#3a2414';c.fillRect(0,0,W,H);for(let r=0;r<3;r++){const y0=10+r*(H-20)/3,h=(H-20)/3-10;let x=12;while(x<W-16){const w=10+Math.random()*12;c.fillStyle=['#6a2a20','#2a4a3a','#7a6030','#2a3a5a','#5a2a4a','#8a7a5a'][Math.random()*6|0];c.fillRect(x,y0+h*(.15+Math.random()*.15),w,h*.8);c.fillStyle='rgba(230,200,120,.6)';c.fillRect(x+2,y0+h*.4,w-4,3);x+=w+1}c.fillStyle='#24160c';c.fillRect(0,y0+h,W,10)}c.strokeStyle='#24160c';c.lineWidth=12;c.strokeRect(0,0,W,H)},
      cupboard:(c,W,H)=>{c.fillStyle='#5a3a22';c.fillRect(0,0,W,H);c.strokeStyle='#2a180c';c.lineWidth=8;c.strokeRect(4,4,W-8,H-8);c.beginPath();c.moveTo(W/2,8);c.lineTo(W/2,H-8);c.stroke();for(const x of [W*.08,W*.58]){c.lineWidth=4;c.strokeRect(x,H*.1,W*.34,H*.8)}c.fillStyle='#c9a45a';c.beginPath();c.arc(W/2-14,H/2,6,0,TAU);c.arc(W/2+14,H/2,6,0,TAU);c.fill()},
      map:(c,W,H)=>{c.fillStyle='#e6d7b0';c.fillRect(0,0,W,H);c.save();c.scale(W/1024,H/512);const at=([lon,lat])=>[(lon+180)/360*1024,(90-lat)/180*512];for(const shape of LAND){c.beginPath();shape.forEach((p,i)=>i?c.lineTo(...at(p)):c.moveTo(...at(p)));c.closePath();c.fillStyle='#b9a070';c.fill();c.strokeStyle='#5a4428';c.lineWidth=2;c.stroke()}c.restore();c.strokeStyle='#5a4428';c.lineWidth=6;c.strokeRect(3,3,W-6,H-6);c.fillStyle='#4a3420';c.font='bold 16px Georgia';c.textAlign='center';c.fillText('THE WORLD',W/2,22)},
      picture:(c,W,H)=>{c.fillStyle='#8a6a30';c.fillRect(0,0,W,H);c.fillStyle='#2a3a4a';c.fillRect(14,14,W-28,H-28);const g=c.createLinearGradient(0,14,0,H-14);g.addColorStop(0,'#4a6a8a');g.addColorStop(1,'#c9b48a');c.fillStyle=g;c.fillRect(14,14,W-28,H-28);c.fillStyle='#2a3a2a';c.beginPath();c.moveTo(14,H*.7);c.quadraticCurveTo(W*.4,H*.45,W-14,H*.68);c.lineTo(W-14,H-14);c.lineTo(14,H-14);c.closePath();c.fill()}
    };
    function buildShaft(){
      if(shaft)return;shaft={group:new THREE.Group(),props:[]};const g=shaft.group;g.name='antipodes-well';g.position.set(SHAFT.x,0,SHAFT.z);
      const tube=add(own(new THREE.CylinderGeometry(SHAFT.r,SHAFT.r,SHAFT.top*2,28,1,true)),own(new THREE.MeshBasicMaterial({map:shaftPainting(),side:THREE.BackSide})),0,0,0,g);tube.material.map.wrapS=THREE.RepeatWrapping;tube.material.map.repeat.set(4,1);
      // Cupboards, shelves, maps and pictures on pegs in both wells: one instanced mesh each.
      const kinds=Object.keys(PROPS),sizes={shelf:[1.4,1.6],cupboard:[1.1,1.4],map:[1.3,.7],picture:[.8,.6]},spots={shelf:[],cupboard:[],map:[],picture:[]};
      let seed=3;const rand=()=>(seed=(seed*16807)%2147483647)/2147483647;
      for(let y=SHAFT.top-3;y>30;y-=2.1)for(let k=0;k<3;k++){const kind=kinds[(Math.floor(y)+k*3)%4],a=k/3*TAU+y*.9+rand()*.6;spots[kind].push([a,y,false]);spots[kind].push([a+.4,-y,true])}
      const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),s=new THREE.Vector3(1,1,1),p=new THREE.Vector3();
      for(const kind of kinds){const list=spots[kind],[w,h]=sizes[kind];if(!list.length)continue;
        const mesh=new THREE.InstancedMesh(own(new THREE.PlaneGeometry(w,h)),own(new THREE.MeshBasicMaterial({map:own(canvasTexture(PROPS[kind],256,Math.round(256*h/w))),side:THREE.DoubleSide})),list.length);
        list.forEach(([a,y,flip],i)=>{const r=SHAFT.r-.08;p.set(Math.sin(a)*r,y,Math.cos(a)*r);e.set(0,a+Math.PI,flip?Math.PI:0,'YXZ');q.setFromEuler(e);m4.compose(p,q,s);mesh.setMatrixAt(i,m4)});
        g.add(mesh);shaft.props.push(mesh)}
      // The marmalade jar, which falls beside the reader for a while.
      const jar=new THREE.Group();g.add(jar);
      add(own(new THREE.CylinderGeometry(.09,.09,.2,14)),own(new THREE.MeshBasicMaterial({color:0xd8862a,transparent:true,opacity:.75})),0,0,0,jar);
      const label=add(own(new THREE.CylinderGeometry(.092,.092,.09,14,1,true)),own(new THREE.MeshBasicMaterial({map:own(canvasTexture((c,W,H)=>{c.fillStyle='#f2e8cc';c.fillRect(0,0,W,H);c.fillStyle='#3a2410';c.font='bold 22px Georgia';c.textAlign='center';c.fillText('ORANGE MARMALADE',W/2,H/2+8)},256,48))})),0,0,0,jar);
      add(own(new THREE.CylinderGeometry(.095,.095,.03,14)),own(new THREE.MeshBasicMaterial({color:0xc9c2b0})),0,.11,0,jar);shaft.jar=jar;jar.visible=false;
      // Sparks at the centre, and the lamplit trapdoors at either end.
      const sparks=new THREE.BufferGeometry(),pts=[];for(let i=0;i<220;i++){const a=rand()*TAU,r=rand()*SHAFT.r*.9;pts.push(Math.sin(a)*r,(rand()-.5)*20,Math.cos(a)*r)}
      sparks.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));shaft.sparks=new THREE.Points(own(sparks),own(new THREE.PointsMaterial({color:0xffc070,size:.08,transparent:true,opacity:.9})));g.add(shaft.sparks);
      for(const s of [1,-1]){const cap=add(own(new THREE.CircleGeometry(SHAFT.r,28)),own(new THREE.MeshBasicMaterial({map:own(canvasTexture((c,W,H)=>{const r=c.createRadialGradient(W/2,H/2,0,W/2,H/2,W/2);r.addColorStop(0,'#fff0c8');r.addColorStop(.25,'#ffcf7a');r.addColorStop(.32,'#3a2414');r.addColorStop(1,'#24160c');c.fillStyle=r;c.fillRect(0,0,W,H)},256,256)),fog:false})),0,s*SHAFT.top,0,g);cap.rotation.x=s*Math.PI/2}
      scene.add(g);
    }
    function freeShaft(){if(!shaft)return;shaft.group.removeFromParent();shaft=null}

    // ---------- falling ----------
    // dir 1: from the Grand Hall to the Antipodes (down the world's y); dir -1: home again. The reader turns over at
    // the centre, so that after it the far end is up.
    function startFall(dir){
      if(fall)return;activate();buildShaft();const reduced=isReducedMotion();
      fall={dir,t:0,duration:reduced?9:(dir>0?26:16),said:0,lines:dir>0?DOWN:UP,yaw:player.yaw,faded:false};
      fade?.(1);setTimeout(()=>fade?.(0),reduced?150:350);playSample?.('secretDoor',.7,.8);sound?.(140,1.6,'sine',.05);
      analytics?.track('Room Explored',{room:dir>0?'antipodes-fall':'antipodes-return'});
    }
    function updateFall(dt,reduced){
      fall.t+=dt;const p=clamp(fall.t/fall.duration,0,1),e=smooth(p),y=fall.dir*(SHAFT.top-2-(SHAFT.top-2)*2*e);
      // Turning over: smoothly, or with reduced motion a fade at the centre and a cut.
      let roll;if(reduced){roll=p<.5?0:Math.PI;const k=Math.abs(p-.5);fade?.(k<.04?1-k/.04:0)}else roll=smooth(clamp((p-.44)/.14,0,1))*Math.PI;
      if(fall.dir<0)roll+=Math.PI;
      fall.yaw+=dt*(reduced?.05:.22);
      camera.position.set(SHAFT.x+Math.sin(fall.t*.3)*.25,y,SHAFT.z+Math.cos(fall.t*.23)*.25);
      camera.rotation.set(-.18,fall.yaw,roll,'YXZ');camera.updateMatrixWorld();
      if(shaft){shaft.sparks.rotation.y+=dt*.6;
        // The jar drifts in front of the reader for a while, and slowly falls behind.
        const jarOn=fall.dir>0&&p>.13&&p<.3;shaft.jar.visible=jarOn;
        if(jarOn){const k=(p-.13)/.17,a=fall.yaw+.4-k*.8;shaft.jar.position.set(camera.position.x-SHAFT.x-Math.sin(a)*1.2,y-.25+k*k*4,camera.position.z-SHAFT.z-Math.cos(a)*1.2);shaft.jar.rotation.set(fall.t*.7,fall.t*.4,0)}}
      // The air warms towards the centre.
      const heat=clamp(1-Math.abs(y)/26,0,1);scene.background.setRGB(.05+heat*.45,.03+heat*.17,.02+heat*.03);scene.fog.color.copy(scene.background);scene.fog.density=.03+heat*.02;
      while(fall.said<fall.lines.length&&p>=fall.lines[fall.said][0]){showNotice(fall.lines[fall.said][1],fall.dir>0?6:5);fall.said++}
      if(!reduced&&Math.random()<dt*.8)sound?.(90+Math.random()*60,.6,'sine',.015+heat*.03);
      if(p>=1&&!fall.faded){fall.faded=true;fade?.(1);const dir=fall.dir;setTimeout(()=>{fall=null;arrive(dir);setTimeout(()=>fade?.(0),120)},reduced?120:380)}
    }
    function arrive(dir){
      if(dir>0){enterFar(true);showNotice('The Antipodes. Nobody here walks with their head downward; from here it is the Grand Hall that is upside down.',5);
        setTimeout(()=>{if(zoneAt(player.pos.x,player.pos.z)==='antipodes')showNotice('The Australian Room is through the arch on your left, to the west; Aotearoa New Zealand through the arch on your right. The globe will take you home.',9)},5200)}
      else{closeHatch(hall.hatch,hallHatchData);move(HATCH.x,HATCH.z+1.4,0);hall.globe.spin.rotation.y=facing(-8);showNotice('The Grand Hall again, the right way up. Or at least the way it was.',6)}
      playSample?.('doorOpen',.6,.8);
    }
    // Arriving: on the trapdoor, which closes under you, facing north (Australia to the left, as on a map).
    function enterFar(fromWell){
      activate();far.hatch.open=fromWell?1:0;far.hatch.target=0;Object.assign(farHatchData,{title:'A trapdoor',author:'The one you came up through, closed again behind you.',action:'LOOK'});
      move(FAR_HATCH.x,FAR_HATCH.z+.9,0);analytics?.track('Room Explored',{room:'antipodes'});
    }
    // A link (/?room=antipodes, australia, new-zealand) goes straight there, the fall saved for the way home.
    function enter(where='antipodes'){
      enterFar(false);
      if(where==='australian-room'){move(AUS.cx+4,AUS.cz+2,Math.PI/2);showNotice('The Australian Room, at the Antipodes. The fire is lit and the billy is on.',7)}
      else if(where==='new-zealand-room'){move(NZ.cx-4,NZ.cz+2,-Math.PI/2);showNotice('The New Zealand Room, at the Antipodes. Nau mai, haere mai.',7)}
      else showNotice('The Antipodes, the far side of the world from the Grand Hall. The globe will take you home.',7);
    }

    // ---------- walking ----------
    function zoneAt(x,z){
      if(z<HALL.cz-HALL.d/2||z>HALL.cz+HALL.d/2)return null;
      if(x>AUS.cx-AUS.w/2&&x<HALL.cx-HALL.w/2)return 'australian-room';if(x>=HALL.cx-HALL.w/2&&x<=HALL.cx+HALL.w/2)return 'antipodes';if(x>HALL.cx+HALL.w/2&&x<NZ.cx+NZ.w/2)return 'new-zealand-room';return null;
    }
    const contains=(x,z)=>!!zoneAt(x,z);
    const floorAt=(x,z)=>contains(x,z)?0:null;
    function allowed(x,z){
      if(!contains(x,z))return false;const r=player.radius||.42,west=AUS.cx-AUS.w/2,east=NZ.cx+NZ.w/2;
      if(x-r<west+.45||x+r>east-.45||z-r<HALL.cz-HALL.d/2+.45||z+r>HALL.cz+HALL.d/2-.45)return false;
      return !blockers.some(b=>x+r>b.minX&&x-r<b.maxX&&z+r>b.minZ&&z-r<b.maxZ);
    }
    // The globe's stand, in the Grand Hall.
    const blocksHall=(x,z,r=.42)=>Math.hypot(x-GLOBE.x,z-GLOBE.z)<.95+r;

    // ---------- doing things ----------
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('antipodes-'))return false;
      if(fall)return true;
      switch(data.type){
        case 'antipodes-globe':
          if(hall.globe.turn)return true;
          if(hall.hatch.target>0){showNotice('The globe is turned to the far side of the world, and the trapdoor at your feet is open.',5);return true}
          turnGlobe(hall.globe,152,-32,()=>{activate();buildShaft();openHatch(hall.hatch,hallHatchData,'hall');showNotice('The globe turns under your hand and stops with Australia and New Zealand towards you. At your feet, with a click, a round trapdoor swings open.',8)});
          showNotice('You set the globe spinning.',3);return true;
        case 'antipodes-hatch':
          if(hall.hatch.target>0)startFall(1);else showNotice('A round trapdoor, shut fast. There is no handle on this side. The globe beside it has a brass plate: TURN TO THE ANTIPODES.',7);return true;
        case 'antipodes-globe-home':
          if(far.globe.turn)return true;
          if(far.hatch.target>0){showNotice('The globe is turned towards home, and the trapdoor is open.',5);return true}
          turnGlobe(far.globe,-7,53,()=>{openHatch(far.hatch,farHatchData,'far');showNotice('The globe turns until Ireland and Britain come round, at the bottom of the world. The trapdoor at your feet swings open again.',8)});
          return true;
        case 'antipodes-hatch-home':
          if(far.hatch.target>0)startFall(-1);else showNotice('The trapdoor you came up through. Turn the globe to open it again.',5);return true;
        case 'antipodes-card':
          if(data.title===CARDS.kookaburra[0])laugh();
          if(data.clocks){showNotice(`Three clocks keep the time on this side of the world. ${clockWords()}`,10);return true}
          showNotice(`${data.title}: ${data.author}`,10);return true;
      }
      return false;
    }

    // ---------- lifecycle ----------
    function activate(){if(!root)buildFar();lastNeeded=time}
    function unload(){
      if(!root)return;root.removeFromParent();root=null;fire=null;clocks=null;clockStamp='';freeShaft();far={globe:null,hatch:null};
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0;sharedBookGeometry=null;
    }
    function reset(){if(fall){fall=null;fade?.(0)}}
    function update(t,dt=0){
      time=t;const reduced=isReducedMotion(),x=player.pos.x,z=player.pos.z,inside=contains(x,z);
      updateGlobe(hall.globe,dt);updateHatch(hall.hatch,dt);
      if(fall){lastNeeded=t;updateFall(dt,reduced);return}
      // Stepping onto an open trapdoor.
      if(hall.hatch.target>0&&Math.hypot(x-HATCH.x,z-HATCH.z)<HATCH.r*.75&&player.pos.y<.5)startFall(1);
      else if(hall.hatch.target>0&&t-hall.hatch.openedAt>40&&Math.hypot(x-HATCH.x,z-HATCH.z)>4)closeHatch(hall.hatch,hallHatchData);
      if(inside)activate();
      if(root){
        updateGlobe(far.globe,dt);updateHatch(far.hatch,dt);
        if(clocks&&inside){const stamp=new Date().getMinutes();if(stamp!==clockStamp){clockStamp=stamp;const c=clocks.texture.image.getContext('2d');drawClocks(c,c.canvas.width,c.canvas.height);clocks.texture.needsUpdate=true}}
        if(far.hatch.target>0&&Math.hypot(x-FAR_HATCH.x,z-FAR_HATCH.z)<FAR_HATCH.r*.75)startFall(-1);
        if(fire&&zoneAt(x,z)==='australian-room'&&!reduced){for(const f of fire.flames)f.mesh.scale.y=1+Math.sin(t*8+f.phase)*.16;fire.light.intensity=7+Math.sin(t*5)*.8+Math.sin(t*11.3)*.3}
        if(!inside&&hall.hatch.target===0&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==root))unload();
      }
    }
    buildHall();
    return {contains,floorAt,allowed,blocksHall,interact,update,reset,enter,unload,startFall,zoneAt,shelfBooks,clockWords,
      globe:GLOBE,hatch:HATCH,hall:HALL,rooms:{australian:AUS,nz:NZ},shelves:SHELVES,records:RECORDS,cards:CARDS,
      get travelling(){return !!fall},get built(){return !!root},get shaftBuilt(){return !!shaft},get books(){return books.slice()},get hatchOpen(){return hall.hatch.target>0}};
  };
})();
