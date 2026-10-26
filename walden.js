// Walden Pond: Thoreau's house in the woods on a warm summer night, out through a garden door in the south wall of
// the Naturalist's Cabinet (Thoreau, too, watched one place closely). A clearing of pitch pines and hickories on the
// north shore, half a dozen rods from the water, with the house he built for $28.12½: ten feet wide by fifteen long,
// one door at the end and a brick fireplace opposite, a large window on each side. Inside, his bed, his desk with its
// japanned lamp, three chairs, and a shelf of his own books (Walden first, the library's own copy); outside, his
// three-legged table set out among the pines as on the mornings he scrubbed the floor, with the books of the Concord
// circle on it under an awning; the bean-field, the woodpile, the footpath down to the shore and his boat drawn up
// on the sand, with a flute on the seat and the cod-line and stone he sounded the pond with. A loon on the water.
//
// The room's secret is the hound, the bay horse and the turtle-dove he said he had long ago lost and was still on
// the trail of: the page on his desk says so. Somewhere in the clearing a reader may hear the hound, and the tramp of
// the horse, and see the dove disappear behind a cloud; whoever has done all three finds the first volume of his
// journal on the doorstep (room walden-journal). Found once, found for good (athenaeum-walden-journal; ?hound shows
// it). Every word given to Thoreau is checked against texts/pg205.txt by a test. Nothing is built until the reader
// comes near the door, and it is freed a little while after they leave. The trees are two InstancedMeshes, and the
// only light of its own is the lamp in the house: outside, the sky and fog are darkened and the library's ambient
// and moonlight turned down, as in the Deep Wood.
(function(){
  'use strict';

  // Far from everything else: the Austen Room is at x 500, z −160, the Nights' qa'a at x 700, z −434.
  const CENTRE={x:900,z:-100},WALK=32,EDGE=70,KEEP=25,PRELOAD=7;
  // The pond, an ellipse to the south (yaw 0 faces north, −z): its near shore is about 9 m below the house.
  const POND={x:0,z:45,rx:75,rz:37};
  // The house, its long sides east and west, its door at the south end, facing the pond.
  const HOUSE={x:-2,z:-18,w:3.05,d:4.57,h:2.44,ridge:3.45,door:.9};
  // Places in the clearing, relative to its centre.
  const SPOTS={
    gate:{x:-2,z:-31},arrival:{x:-2,z:-28.6},table:{x:4.8,z:-15.6},beans:{x:15,z:-17,w:9,d:15},
    woodpile:{x:-5.3,z:-21.6},boat:{x:-6.5,z:7.5},
    hound:{x:20,z:-22},horse:{x:-19.5,z:-18.5},dove:{x:21,z:6}
  };
  // The footpath, the path round to the house, and the road to the village; as chains of points.
  const PATHS=[[[-2,-29.6],[1.1,-24],[1.3,-15.2],[-2,-14.8]],[[-2,-14.8],[-3.4,-4],[-5.6,8]],[[-34,-6],[-19.5,-18.5],[-6,-33.5]],[[1.3,-15.2],[3.6,-15.1]]];
  // The three he lost, in the order the page names them.
  const LOST=['hound','horse','dove'];
  // Thoreau's own words, each checked against the bundled Walden (texts/pg205.txt).
  const WALDEN={
    lost:'I long ago lost a hound, a bay horse, and a turtle-dove, and am still on their trail.',
    met:'I have met one or two who had heard the hound, and the tramp of the horse, and even seen the dove disappear behind a cloud, and they seemed as anxious to recover them as if they had lost them themselves.',
    woods:'I went to the woods because I wished to live deliberately, to front only the essential facts of life, and see if I could not learn what it had to teach, and not, when I came to die, discover that I had not lived.',
    house:'I have thus a tight shingled and plastered house, ten feet wide by fifteen long, and eight-feet posts, with a garret and a closet, a large window on each side, two trap doors, one door at the end, and a brick fireplace opposite.',
    cost:'In all,..................... $28.12½',
    furniture:'My furniture, part of which I made myself, and the rest cost me nothing of which I have not rendered an account, consisted of a bed, a table, a desk, three chairs, a looking-glass three inches in diameter, a pair of tongs and andirons, a kettle, a skillet, and a frying-pan, a dipper, a wash-bowl, two knives and forks, three plates, one cup, one spoon, a jug for oil, a jug for molasses, and a japanned lamp.',
    chairs:'I had three chairs in my house; one for solitude, two for friendship, three for society.',
    lock:'I had no lock nor bolt but for the desk which held my papers, not even a nail to put over my latch or windows. I never fastened my door night or day, though I was to be absent several days;',
    limestone:'I had three pieces of limestone on my desk, but I was terrified to find that they required to be dusted daily, when the furniture of my mind was all undusted still, and I threw them out the window in disgust.',
    table:'It was pleasant to see my whole household effects out on the grass, making a little pile like a gypsy’s pack, and my three-legged table, from which I did not remove the books and pen and ink, standing amid the pines and hickories.',
    awning:'I was sometimes tempted to stretch an awning over them and take my seat there.',
    beans:'Meanwhile my beans, the length of whose rows, added together, was seven miles already planted, were impatient to be hoed, for the earliest had grown considerably before the latest were in the ground;',
    know:'I was determined to know beans.',
    stumps:'I got out several cords of stumps in ploughing, which supplied me with fuel for a long time,',
    flute:'In warm evenings I frequently sat in the boat playing the flute, and saw the perch, which I seemed to have charmed, hovering around me, and the moon travelling over the ribbed bottom, which was strewed with the wrecks of the forest.',
    bottomless:'Some think it is bottomless.',
    sounding:'I fathomed it easily with a cod-line and a stone weighing about a pound and a half,',
    depth:'The greatest depth was exactly one hundred and two feet;',
    spared:'not an inch of it can be spared by the imagination.',
    looning:'This was his looning,—perhaps the wildest sound that is ever heard here, making the woods ring far and wide.',
    whippoorwill:'Regularly at half past seven, in one part of the summer, after the evening train had gone by, the whippoorwills chanted their vespers for half an hour,',
    path:'My house was on the side of a hill, immediately on the edge of the larger wood, in the midst of a young forest of pitch pines and hickories, and half a dozen rods from the pond, to which a narrow footpath led down the hill.',
    time:'Time is but the stream I go a-fishing in.'
  };
  const CARDS={
    house:['Thoreau’s house',`He built it himself in the spring of 1845, on land Emerson owned, and went to live in it on the Fourth of July. “${WALDEN.house}”`],
    cost:['What it cost','He set the cost down to the half-cent in Walden, from boards at $8.03½ to chalk at one cent: “'+WALDEN.cost.replace(/\.{3,}/,' ')+'.”'],
    woods:['Why he came',`“${WALDEN.woods}” He lived here two years and two months, and went back to the village in September 1847.`],
    bed:['His bed','A narrow bed of his own making, with a blanket over it. “'+WALDEN.furniture.slice(0,WALDEN.furniture.indexOf(', a table'))+'…”'],
    fireplace:['The fireplace','A brick fireplace at the north end, built in the autumn of 1845 from a thousand old bricks, which cost him four dollars. The tongs and andirons, the kettle, the skillet and the frying-pan are all of the house’s kitchen.'],
    lamp:['A japanned lamp','A tin lamp, black-lacquered: the last thing on his list of furniture, after a jug for oil and a jug for molasses.'],
    mirror:['A looking-glass three inches across','The only mirror in the house. He bought nothing he could do without.'],
    desk:['His desk',`The one thing in the house with a lock. “${WALDEN.lock}”`],
    page:['A page on the desk',`In his hand, the ink barely dry: “${WALDEN.lost}” And further down: “${WALDEN.met}” Whoever comes upon any of the three, he would be glad to know.`],
    limestone:['Three pieces of limestone',`In the grass under the east window. “${WALDEN.limestone}”`],
    shelf:['His own books','Walden, and everything else he wrote that was printed, most of it after he died at forty-four in 1862. In his lifetime he published two books.'],
    table:['His three-legged table',`Set out among the pines, as on the mornings he scrubbed the floor of the house with white sand from the pond. “${WALDEN.table}”`],
    awning:['An awning',`“${WALDEN.awning}” Someone has. The books under it are his neighbours’: Emerson, Margaret Fuller, Bronson Alcott, Hawthorne, and those who wrote about them.`],
    beans:['The bean-field',`About two acres and a half of light and sandy soil, mostly beans, to earn ten or twelve dollars. “${WALDEN.beans.slice(0,-1)}.”`],
    hoe:['A hoe',`“${WALDEN.know}” He hoed them from five in the morning till noon, and spent the rest of the day about other affairs.`],
    woodpile:['The woodpile',`Stumps, mostly, and driftwood from the pond. “${WALDEN.stumps}”`],
    boat:['His boat','Drawn up on the sand at the foot of the path, with a flute on the seat, and a cod-line wound round a stone.'],
    pond:['Walden Pond',`Deep, cold and clear, half a mile long, with no visible inlet or outlet. “${WALDEN.bottomless}” He sounded it in the winter of 1846, through the ice.`],
    path:['The footpath',`“${WALDEN.path}”`],
    loon:['A loon',`It dives as you look, and comes up a long way off, laughing. “${WALDEN.looning}”`],
    gate:['The door back','A garden door standing on its own among the pines, with the lamplight of the Naturalist’s Cabinet behind its glass.']
  };
  // A slow air for the flute, in D (hertz, and beats held). Nobody wrote down what he played.
  const AIR=[[587.33,1],[659.25,.5],[739.99,.5],[880,1.5],[739.99,.5],[659.25,1],[587.33,1],[493.88,1.5],[587.33,.5],[659.25,2],
    [739.99,1],[880,.5],[987.77,.5],[880,1.5],[739.99,.5],[659.25,1],[739.99,.5],[659.25,.5],[587.33,3]];
  const mulberry=seed=>()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296};
  // The pond's near shore, relative to the centre: the water starts here.
  const shoreZ=x=>POND.z-POND.rz*Math.sqrt(Math.max(0,1-(x/POND.rx)**2));
  const inPond=(x,z,pad=0)=>((x-POND.x)/(POND.rx+pad))**2+((z-POND.z)/(POND.rz+pad))**2<1;

  window.createWalden=function(options){
    const {THREE,scene,MAT,player,ambient=null,moon:moonlight=null,interactables,canvasTexture,bookMaterial,findBook,arrivals={},showNotice,playSample,sound=null,tone=null,move,analytics,
      isHolding=()=>false,isReducedMotion=()=>false,registerSeat=null,doorKit=null,storage=window.localStorage,later=(fn,ms)=>setTimeout(fn,ms),
      cabinet={cx:-500,cz:-140,w:20,d:16}}=options;
    // The garden door, at the east end of the Naturalist's Cabinet's south wall (past the window and the writing
    // table), facing into the cabinet.
    const DOOR={x:cabinet.cx+cabinet.w/2-2.1,z:cabinet.cz+cabinet.d/2-.2,yaw:Math.PI};
    // The cabinet's conservatory green, glazed: it opens on a garden, after all.
    const DOOR_LOOK={style:'painted',color:0x3d5a3c,fanColor:0xe0f0c8,glazed:true,width:1.9,height:3.1};
    const through=(data,go)=>doorKit&&data.kit?doorKit.pass(data.kit,data,go):go();
    const LOST_KEY='athenaeum-walden-lost',FOUND_KEY='athenaeum-walden-journal';
    const preview=()=>{try{return /[?&]hound\b/.test(location.search)}catch(e){return false}};
    const heard=()=>{try{const list=JSON.parse(storage?.getItem(LOST_KEY)||'[]');return new Set(Array.isArray(list)?list.filter(k=>LOST.includes(k)):[])}catch(e){return new Set()}};
    const wasFound=()=>{try{return storage?.getItem(FOUND_KEY)==='1'||preview()}catch(e){return false}};
    let root=null,time=0,lastNeeded=-1e9,state=null;
    const owned=[],ours=[],books=[],blockers=[],trunks=[];
    const own=thing=>{owned.push(thing);return thing};
    const std=params=>own(new THREE.MeshStandardMaterial(params));
    const W=(x,z)=>({x:CENTRE.x+x,z:CENTRE.z+z});
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    const cyl=(rt,rb,h,seg,material,x,y,z,parent)=>add(own(new THREE.CylinderGeometry(rt,rb,h,seg)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    // The door in the Naturalist's Cabinet stays when this place is freed, so its parts are not among its own.
    function markDoor(object,data){object.userData=data;interactables.push(object);return object}
    // Blockers are in world coordinates.
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const card=key=>({type:'walden-card',key,title:CARDS[key][0],author:CARDS[key][1],action:'LOOK'});
    function sign(text,sub,w,h){
      const map=own(canvasTexture((c,W,H)=>{c.fillStyle='#e9e0c8';c.fillRect(0,0,W,H);c.strokeStyle='#4a3a26';c.lineWidth=4;c.strokeRect(7,7,W-14,H-14);
        c.fillStyle='#2a2116';c.textAlign='center';c.font='bold 30px Georgia';c.fillText(text,W/2,sub?50:H/2+11);if(sub){c.font='italic 21px Georgia';c.fillText(sub,W/2,84)}},620,sub?104:70));
      return new THREE.Mesh(own(new THREE.PlaneGeometry(w,h)),std({map,emissive:0x2a2418,emissiveIntensity:.3,roughness:.9}));
    }

    // The books: those listed, then the new arrivals; a book the library does not hold is left out.
    const GROUPS=[
      {key:'thoreau',name:'HIS OWN BOOKS',sub:'Henry David Thoreau, 1817–1862',ids:[205],max:12},
      {key:'concord',name:'THE CONCORD CIRCLE',sub:'His neighbours, and their historians',ids:[],max:16}
    ];
    const shelfBooks=(ids,key,max)=>[...new Set([...ids,...(arrivals[key]||[])])].map(id=>findBook(id)).filter(Boolean).slice(0,max);
    function catalogue(){return {groups:GROUPS.map(group=>({...group,books:shelfBooks(group.ids,group.key,group.max)})),journal:shelfBooks([],'journal',1)}}

    // ---------- the door, in the Naturalist's Cabinet ----------
    function buildDoor(){
      const g=new THREE.Group();g.name='walden-door';g.position.set(DOOR.x,0,DOOR.z);g.rotation.y=DOOR.yaw;scene.add(g);
      const data={type:'walden-door',title:'Walden Pond',author:'A garden door, and beyond it the woods: Thoreau’s house by the pond, on a summer night, with his books and his neighbours’.',action:'ENTER'};
      if(!doorKit?.hang(g,{data,mark:markDoor,...DOOR_LOOK,...doorKit.readingRoom?.('WALDEN POND','Henry David Thoreau, 1817–1862')}))markDoor(add(new THREE.BoxGeometry(1.9,3.1,.14),new THREE.MeshStandardMaterial({color:DOOR_LOOK.color,roughness:.7}),0,1.55,.08,g),data);
    }

    // ---------- geometry helpers ----------
    // Several geometries joined into one, each painted a single colour, so a whole tree is one instance of one mesh.
    function joined(parts){
      const positions=[],normals=[],colours=[],colour=new THREE.Color();
      for(const [geometry,hex,matrix] of parts){const g=geometry.index?geometry.toNonIndexed():geometry;if(matrix)g.applyMatrix4(matrix);g.computeVertexNormals();colour.setHex(hex);
        const p=g.attributes.position,n=g.attributes.normal;for(let i=0;i<p.count;i++){positions.push(p.getX(i),p.getY(i),p.getZ(i));normals.push(n.getX(i),n.getY(i),n.getZ(i));colours.push(colour.r,colour.g,colour.b)}
        g.dispose();if(g!==geometry)geometry.dispose()}
      const out=new THREE.BufferGeometry();out.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));out.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));out.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));return own(out);
    }
    const placed=(x,y,z,rx=0,ry=0,rz=0,s=1,sy=s)=>new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)),new THREE.Vector3(s,sy,s));
    // A pitch pine, 1 m to the scale: a tall bare trunk and ragged tufts of needles near the top.
    function pineGeometry(){return joined([[new THREE.CylinderGeometry(.018,.04,1,7),0x3a2a1e,placed(0,.5,0)],[new THREE.IcosahedronGeometry(.16,0),0x1c2c1c,placed(.05,.86,0,0,0,0,1,.6)],
      [new THREE.IcosahedronGeometry(.13,0),0x223222,placed(-.08,.74,.04,0,0,0,1,.55)],[new THREE.IcosahedronGeometry(.11,0),0x1a2a1a,placed(.02,.98,-.05,0,0,0,1,.6)],[new THREE.IcosahedronGeometry(.1,0),0x203020,placed(.1,.66,-.03,0,0,0,1,.5)]])}
    // A hickory: a grey trunk and a round, broad crown.
    function hickoryGeometry(){return joined([[new THREE.CylinderGeometry(.025,.045,.6,7),0x4a4238,placed(0,.3,0)],[new THREE.IcosahedronGeometry(.3,1),0x243020,placed(0,.72,0,0,0,0,1,.8)],
      [new THREE.IcosahedronGeometry(.2,0),0x2a3624,placed(.18,.62,.05,0,0,0,1,.75)],[new THREE.IcosahedronGeometry(.18,0),0x1f2a1c,placed(-.16,.66,-.08,0,0,0,1,.8)]])}
    function nearPath(x,z,distance){
      for(const chain of PATHS)for(let i=0;i<chain.length-1;i++){const [ax,az]=chain[i],[bx,bz]=chain[i+1],dx=bx-ax,dz=bz-az,l=dx*dx+dz*dz,t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/l));if(Math.hypot(x-ax-t*dx,z-az-t*dz)<distance)return true}
      return false;
    }
    const inBeans=(x,z,pad=0)=>Math.abs(x-SPOTS.beans.x)<SPOTS.beans.w/2+pad&&Math.abs(z-SPOTS.beans.z)<SPOTS.beans.d/2+pad;
    const inYard=(x,z,pad=0)=>Math.hypot(x-1.4,z+18.2)<8+pad;

    // ---------- the ground and the pond ----------
    function buildGround(){
      const size=EDGE+10,map=own(canvasTexture((c,Wd,Ht)=>{const k=Wd/(size*2),px=x=>(x+size)*k,pz=z=>(z+size)*k,rand=mulberry(11);
        c.fillStyle='#1d2316';c.fillRect(0,0,Wd,Ht);
        for(let i=0;i<9000;i++){c.fillStyle=['#242b1b','#1a2014','#2b2a1b','#2a2418','#20281a'][i%5];const r=1+rand()*3;c.fillRect(rand()*Wd,rand()*Ht,r,r)}
        // The sandy shore, and the yard round the house worn bare.
        c.fillStyle='rgba(150,136,104,.75)';c.beginPath();for(let x=-size;x<=size;x+=2){const z=shoreZ(x)-1.6;x===-size?c.moveTo(px(x),pz(z)):c.lineTo(px(x),pz(z))}c.lineTo(px(size),pz(size));c.lineTo(px(-size),pz(size));c.fill();
        const yard=c.createRadialGradient(px(0),pz(-18),0,px(0),pz(-18),9*k);yard.addColorStop(0,'rgba(84,72,52,.7)');yard.addColorStop(1,'rgba(84,72,52,0)');c.fillStyle=yard;c.beginPath();c.arc(px(0),pz(-18),9*k,0,7);c.fill();
        // The bean-field: dug soil in rows.
        const b=SPOTS.beans;c.fillStyle='#3a3022';c.fillRect(px(b.x-b.w/2),pz(b.z-b.d/2),b.w*k,b.d*k);c.strokeStyle='#4a3e2c';c.lineWidth=.35*k;for(let x=b.x-b.w/2+.45;x<b.x+b.w/2;x+=.9){c.beginPath();c.moveTo(px(x),pz(b.z-b.d/2+.2));c.lineTo(px(x),pz(b.z+b.d/2-.2));c.stroke()}
        // The paths, the road wider.
        c.lineCap='round';c.lineJoin='round';
        PATHS.forEach((chain,i)=>{for(const [width,colour] of [[i===2?3.4:1.8,'rgba(78,66,46,.7)'],[i===2?2.2:1,'rgba(110,94,66,.75)']]){c.strokeStyle=colour;c.lineWidth=width*k;c.beginPath();chain.forEach(([x,z],j)=>j?c.lineTo(px(x),pz(z)):c.moveTo(px(x),pz(z)));c.stroke()}});
        // A horse's prints along the road by the horse's place, and a hound's across the grass to the north-east.
        c.fillStyle='rgba(40,32,22,.85)';const h=SPOTS.horse;for(let i=-4;i<=4;i++){const x=h.x+i*.95,z=h.z-i*.95*(13/14.5),side=i%2?.25:-.25;c.beginPath();c.ellipse(px(x+side*.7),pz(z+side*.6),.11*k,.13*k,.7,0,7);c.fill()}
        const d=SPOTS.hound;for(let i=-5;i<=5;i++){const x=d.x+i*.6,z=d.z+i*.35+(i%2?.12:-.12);for(const [ox,oz] of [[0,0],[.05,-.06],[-.05,-.06],[.07,0],[-.07,0]]){c.beginPath();c.arc(px(x+ox),pz(z+oz),(ox||oz?.025:.05)*k,0,7);c.fill()}}
        for(let i=0;i<5000;i++){c.fillStyle=['rgba(120,84,40,.3)','rgba(60,72,40,.35)','rgba(20,24,16,.45)'][i%3];c.fillRect(rand()*Wd,rand()*Ht,1.5,1.5)}
      },1024,1024));
      const ground=add(own(new THREE.CircleGeometry(size,48)),std({map,roughness:1,color:0xa8b0a0}),CENTRE.x,0,CENTRE.z,root);ground.rotation.x=-Math.PI/2;
      // The water: dark and still, the moon's path across it, and the far shore black with trees.
      const water=add(own(new THREE.CircleGeometry(1,64)),std({color:0x0a141c,roughness:.12,metalness:.65}),CENTRE.x+POND.x,.03,CENTRE.z+POND.z,root);water.rotation.x=-Math.PI/2;water.scale.set(POND.rx,POND.rz,1);mark(water,card('pond'));
      const glitter=own(canvasTexture((c,Wd,Ht)=>{c.clearRect(0,0,Wd,Ht);const rand=mulberry(3);for(let i=0;i<500;i++){const y=rand()*Ht,spread=Wd*(.12+.38*y/Ht),x=Wd/2+(rand()-.5)*spread,a=.2+rand()*.6;c.fillStyle=`rgba(225,232,245,${a*(1-y/Ht*.4)})`;c.fillRect(x,y,2+rand()*5,1.2)}},128,512));
      const path=add(own(new THREE.PlaneGeometry(10,58)),own(new THREE.MeshBasicMaterial({map:glitter,transparent:true,opacity:.55,depthWrite:false,blending:THREE.AdditiveBlending})),CENTRE.x+6,.05,CENTRE.z+42,root);path.rotation.x=-Math.PI/2;path.rotation.z=-.1;state.glitter=path;
      // The sand beach a little proud of the water, so the shore line reads at night.
      const sand=std({color:0x6a604c,roughness:1});for(let x=-24;x<=24;x+=4){const z=shoreZ(x)-.2,s=add(own(new THREE.BoxGeometry(4.3,.06,1.4)),sand,CENTRE.x+x,.02,CENTRE.z+z,root);s.rotation.y=Math.atan2(shoreZ(x+1)-shoreZ(x-1),2)*-1}
    }

    // ---------- the trees ----------
    function buildTrees(){
      const rand=mulberry(29),pines=[],hickories=[];
      const take=(x,z,s)=>{(rand()<.3?hickories:pines).push({x,z,s,yaw:rand()*Math.PI*2,lean:(rand()-.5)*.06})};
      for(let tries=0;tries<9000&&pines.length+hickories.length<420;tries++){
        const a=rand()*Math.PI*2,r=Math.sqrt(rand())*EDGE,x=Math.cos(a)*r,z=Math.sin(a)*r;
        if(inPond(x,z,3)||inYard(x,z,.5)||inBeans(x,z,1.5)||nearPath(x,z,2.2))continue;
        if(Object.values(SPOTS).some(s=>s.w==null&&Math.hypot(s.x-x,s.z-z)<3.4))continue;
        if([...pines,...hickories].some(t=>Math.hypot(t.x-x,t.z-z)<(r>WALK?1.8:2.6)))continue;
        take(x,z,(r>WALK?12:9)+rand()*7);
      }
      // The far shore and the hills round the pond, wooded to the water.
      for(let i=0;i<220;i++){const a=rand()*Math.PI*2,k=1.05+rand()*.35,x=POND.x+Math.cos(a)*POND.rx*k,z=POND.z+Math.sin(a)*POND.rz*k;if(z<POND.z-POND.rz*.6||Math.hypot(x,z)<EDGE*.8)continue;take(x,z,13+rand()*9)}
      const material=std({vertexColors:true,roughness:.95});
      for(const [list,geometry,name,radius] of [[pines,pineGeometry(),'walden-pines',.4],[hickories,hickoryGeometry(),'walden-hickories',.45]]){
        const mesh=new THREE.InstancedMesh(geometry,material,list.length);mesh.name=name;const o=new THREE.Object3D();
        list.forEach((t,i)=>{o.position.set(CENTRE.x+t.x,0,CENTRE.z+t.z);o.rotation.set(t.lean,t.yaw,0);o.scale.set(t.s*.9,t.s,t.s*.9);o.updateMatrix();mesh.setMatrixAt(i,o.matrix);
          if(Math.hypot(t.x,t.z)<WALK+1)trunks.push({x:CENTRE.x+t.x,z:CENTRE.z+t.z,r:radius*t.s/10+.15})});
        mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere?.();own(mesh);root.add(mesh);
      }
      state.trees={pines:pines.length,hickories:hickories.length};
    }

    // ---------- the house ----------
    function buildHouse(){
      const {groups,journal}=catalogue(),g=new THREE.Group(),c=W(HOUSE.x,HOUSE.z);g.name='walden-house';g.position.set(c.x,0,c.z);root.add(g);
      const {w,d,h,ridge}=HOUSE,t=.08,dw=HOUSE.door/2;
      const shingles=own(canvasTexture((cx,Wd,Ht)=>{cx.fillStyle='#5e5a52';cx.fillRect(0,0,Wd,Ht);const rand=mulberry(17);for(let y=0,row=0;y<Ht;y+=16,row++)for(let x=-(row%2)*12;x<Wd;x+=24){const v=70+rand()*40|0;cx.fillStyle=`rgb(${v+14},${v+8},${v})`;cx.fillRect(x+1,y+1,22,15);cx.fillStyle='rgba(0,0,0,.35)';cx.fillRect(x,y+14,24,2)}},256,256));
      shingles.wrapS=shingles.wrapT=THREE.RepeatWrapping;shingles.repeat?.set?.(2,1.5);
      const outside=std({map:shingles,roughness:.95}),plaster=std({color:0xd8d0bc,roughness:1}),boards=MAT.wood||std({color:0x8a6a48,roughness:.8}),trim=std({color:0xd9d2c2,roughness:.7});
      const parts=[];
      // The walls: shingles outside, plaster within, each long side with its window and the south end with the door.
      const wall=(len,x,z,alongX,openings)=>{let start=-len/2;for(const [from,to,bottom,top] of [...openings,[len/2,len/2,0,0]]){
          if(from>start){const run=from-start,mid=start+run/2;for(const [mat,off] of [[outside,t*.75],[plaster,-t*.25]]){const m=alongX?box(run,h,t/2,mat,x+mid,h/2,z+off*Math.sign(z),g):box(t/2,h,run,mat,x+off*Math.sign(x),h/2,z+mid,g);parts.push(m)}}
          if(to>from){const run=to-from,mid=from+run/2;for(const [y0,y1] of [[0,bottom],[top,h]])if(y1>y0)for(const [mat,off] of [[outside,t*.75],[plaster,-t*.25]]){const m=alongX?box(run,y1-y0,t/2,mat,x+mid,(y0+y1)/2,z+off*Math.sign(z),g):box(t/2,y1-y0,run,mat,x+off*Math.sign(x),(y0+y1)/2,z+mid,g);parts.push(m)}}
          start=Math.max(start,to)}};
      wall(d,-w/2,0,false,[[-.5,.5,.85,1.95]]);wall(d,w/2,0,false,[[-.5,.5,.85,1.95]]);wall(w,0,-d/2,true,[]);wall(w,0,d/2,true,[[-dw,dw,0,2.05]]);
      for(const part of parts)mark(part,card('house'));
      // The windows: two second-hand sashes, lamplit glass, and the door's frame.
      const glass=std({color:0x1a1a14,emissive:0xffc070,emissiveIntensity:.55,roughness:.2,transparent:true,opacity:.55});
      for(const side of [-1,1]){const x=side*w/2;box(.02,1.1,1,glass,x,1.4,0,g);for(const [bw,bh,bd,by,bz] of [[.06,1.22,.06,1.4,-.53],[.06,1.22,.06,1.4,.53],[.08,.06,1.12,.82,0],[.06,.06,1.12,1.98,0],[.04,1.1,.03,1.4,0],[.04,.03,1,1.4,0]])box(bw,bh,bd,trim,x,by,bz,g)}
      for(const [bw,bh,bx,by] of [[.07,2.1,-dw-.035,1.05],[.07,2.1,dw+.035,1.05],[HOUSE.door+.14,.08,0,2.09]])box(bw,bh,.12,trim,bx,by,d/2,g);
      // The door, standing open: he never fastened it.
      const leaf=new THREE.Group();leaf.position.set(-dw,0,d/2+.03);leaf.rotation.y=-1.9;g.add(leaf);box(HOUSE.door,2.02,.04,std({color:0x6a5a44,roughness:.8}),HOUSE.door/2,1.01,0,leaf);
      // The floor, the garret's ceiling boards, and the roof: two slopes of shingles over gable ends.
      box(w-.04,.04,d-.04,boards,0,.02,0,g);box(w-.08,.03,d-.08,std({color:0x6e5a40,roughness:.85}),0,h-.02,0,g);
      const half=w/2+.2,rise=ridge-h,slope=Math.hypot(half,rise),pitch=Math.atan2(rise,half),roofMat=std({map:shingles,color:0x8a847a,roughness:.95});
      for(const side of [-1,1]){const r=box(slope,.07,d+.36,roofMat,side*half/2,h+rise/2,0,g);r.rotation.z=-side*pitch;mark(r,card('house'))}
      const gable=own(new THREE.BufferGeometry());gable.setAttribute('position',new THREE.Float32BufferAttribute([-w/2,0,0,w/2,0,0,0,rise,0],3));gable.computeVertexNormals();
      for(const z of [-d/2-.025,d/2+.025]){const m=add(gable,own(new THREE.MeshStandardMaterial({map:shingles,color:0x8a847a,roughness:.95,side:THREE.DoubleSide})),0,h,z,g);mark(m,card('house'))}
      // The chimney at the north end: the fireplace within, the stack above the roof.
      const brick=own(canvasTexture((cx,Wd,Ht)=>{cx.fillStyle='#4a3a30';cx.fillRect(0,0,Wd,Ht);for(let y=0,row=0;y<Ht;y+=12,row++)for(let x=-(row%2)*14;x<Wd;x+=28){cx.fillStyle=['#7a3e2c','#6e3626','#83452e','#743a2a'][(x/28+row)&3];cx.fillRect(x+1,y+1,26,10)}},128,128));
      const brickMat=std({map:brick,roughness:.95});
      const hearth=[box(1.15,1.15,.42,brickMat,0,.575,-d/2+.25,g),box(1.15,.06,.5,brickMat,0,1.18,-d/2+.27,g),box(.75,1.4,.32,brickMat,0,1.9,-d/2+.2,g)];
      box(.6,.6,.03,own(new THREE.MeshBasicMaterial({color:0x0c0806})),0,.38,-d/2+.47,g);
      const iron=std({color:0x1d1b18,roughness:.55,metalness:.4});for(const sx of [-.18,.18])box(.04,.16,.28,iron,sx,.12,-d/2+.36,g);
      const kettle=add(own(new THREE.SphereGeometry(.12,12,8)),iron,.38,1.3,-d/2+.3,g);kettle.scale.y=.8;
      for(const part of [...hearth,kettle])mark(part,card('fireplace'));
      box(.55,1.3,.55,brickMat,0,ridge+.3,-d/2+.3,g);
      block(c.x,c.z-d/2+.25,1.2,.6);
      // His bed against the west wall, south of the window.
      const bedFrame=std({color:0x5a4430,roughness:.8});
      const bed=[box(.78,.36,1.82,bedFrame,-w/2+.47,.18,d/2-1.06,g),box(.72,.08,1.76,std({color:0x5c4a3a,roughness:1}),-w/2+.47,.4,d/2-1.06,g),box(.5,.1,.3,std({color:0xd9d2c0,roughness:1}),-w/2+.47,.48,d/2-.35,g)];
      for(const part of bed)mark(part,card('bed'));block(c.x-w/2+.47,c.z+d/2-1.06,.8,1.86);
      // His shelf on the west wall, north of the window: Walden first.
      const shelfX=-w/2+.15,rows=[1.0,1.45,1.9],zs=[-d/2+.4,-d/2+.77,-d/2+1.14,-d/2+1.51];
      for(const y of rows)box(.24,.03,1.62,boards,shelfX+.04,y-.18,-d/2+.96,g);
      const label=sign(GROUPS[0].name,GROUPS[0].sub,1.4,.24);label.position.set(-w/2+.05,2.28,-d/2+.96);label.rotation.y=Math.PI/2;g.add(label);mark(label,card('shelf'));
      const small=own(new THREE.BoxGeometry(.24,.32,.04));
      groups[0].books.forEach((book,i)=>{const row=Math.floor(i/zs.length),col=i%zs.length;if(row>=rows.length)return;placeBook(book,g,small,{x:shelfX+.06,y:rows[row]-.01,z:zs[col],yaw:Math.PI/2},'thoreau')});
      block(c.x-w/2+.2,c.z-d/2+.96,.4,1.7);
      // His desk under the east window, the japanned lamp lit on it, the page about the three he lost, and the chair.
      const desk=[box(.52,.05,.95,boards,w/2-.32,.76,0,g)];for(const sz of [-.42,.42])for(const sx of [-.22,.22])desk.push(box(.04,.74,.04,bedFrame,w/2-.32+sx,.37,sz,g));
      desk.push(box(.48,.16,.9,bedFrame,w/2-.32,.6,0,g));for(const part of desk)mark(part,card('desk'));block(c.x+w/2-.32,c.z,.6,1.05);
      const lampBody=[cyl(.05,.07,.14,12,std({color:0x111111,roughness:.3,metalness:.5}),w/2-.38,.86,-.3,g),add(own(new THREE.SphereGeometry(.055,12,8)),std({color:0xfff0c8,emissive:0xffc070,emissiveIntensity:1.6,transparent:true,opacity:.9}),w/2-.38,1,-.3,g)];
      for(const part of lampBody)mark(part,card('lamp'));
      const lamp=new THREE.PointLight(0xffc27a,3.4,11,2);lamp.position.set(w/2-.5,1.25,-.3);g.add(lamp);state.lamp=lamp;
      const pageMap=own(canvasTexture((cx,Wd,Ht)=>{cx.fillStyle='#ece2c6';cx.fillRect(0,0,Wd,Ht);cx.strokeStyle='#3e3428';cx.lineWidth=1.3;for(let y=22;y<Ht-12;y+=10){cx.beginPath();cx.moveTo(12,y);for(let x=12;x<Wd-12;x+=7)cx.lineTo(x+7,y+Math.sin(x*.8+y)*1.2);cx.stroke()}},160,200));
      const page=add(own(new THREE.PlaneGeometry(.22,.28)),std({map:pageMap,roughness:.95}),w/2-.3,.79,.12,g);page.rotation.x=-Math.PI/2;page.rotation.z=.2;mark(page,card('page'));
      cyl(.02,.025,.05,8,std({color:0x101010,roughness:.4}),w/2-.18,.81,.32,g);
      const mirror=add(own(new THREE.CircleGeometry(.04,16)),std({color:0xcfd8dc,roughness:.05,metalness:.9}),w/2-.06,1.62,.62,g);mirror.rotation.y=-Math.PI/2;mark(mirror,card('mirror'));
      seat(g,.7,0,-Math.PI/2,{title:'The first chair: for solitude',author:WALDEN.chairs+' Sit and read one of his books.'});
      // The second, by the fire: for friendship.
      seat(g,.78,-1.25,.64,{title:'The second chair: for friendship',author:'Two chairs for friendship, he said. Sit and read one of the books here.'});
      // The doorstep, a flat stone, and what is left on it once the three have been heard and seen.
      const step=box(1.1,.08,.55,std({color:0x5e5a50,roughness:1}),0,.04,d/2+.32,g);mark(step,card('house'));
      const journalMesh=journal[0]?(()=>{const m=add(own(new THREE.BoxGeometry(.2,.03,.28)),own(bookMaterial(journal[0])),.18,.1,d/2+.3,g);m.rotation.y=.35;m.visible=false;
        m.userData={type:'book',book:journal[0],loaded:false,walden:true,shelf:'journal',home:{position:m.position.clone(),quaternion:m.quaternion.clone(),parent:g}};return m})():null;
      state.house={group:g,journal:journalMesh,shown:false};
      // The house's walls, as the reader meets them (the door's gap left open).
      const wx=c.x,wz=c.z;block(wx-w/2,wz,t,d);block(wx+w/2,wz,t,d);block(wx,wz-d/2,w,t);block(wx-(w/2+dw)/2,wz+d/2,w/2-dw,t);block(wx+(w/2+dw)/2,wz+d/2,w/2-dw,t);
      // Three pieces of limestone, in the grass under the east window.
      const stone=std({color:0xbdb6a4,roughness:.9});for(const [sx,sz,s] of [[.5,-.3,.07],[.75,.2,.06],[.62,.55,.08]]){const m=add(own(new THREE.DodecahedronGeometry(s,0)),stone,w/2+sx,s*.6,sz,g);m.rotation.set(sx*3,sz*5,0);mark(m,card('limestone'))}
      if(wasFound())showJournal(true);
    }
    // A chair, one of the library's seats: plain pine, as he made his own.
    function seat(parent,x,z,yaw,info){
      const pine=std({color:0x7a5c3c,roughness:.8}),g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=yaw;parent.add(g);
      const base=box(.42,.04,.42,pine,0,.44,0,g),back=box(.42,.5,.04,pine,0,.72,.2,g);for(const lx of [-.18,.18])for(const lz of [-.18,.18])box(.035,.44,.035,pine,lx,.22,lz,g);
      // Its parent stands square in the world, so its place there is the parent's plus its own.
      block(parent.position.x+x,parent.position.z+z,.5,.5);
      if(registerSeat){const data=registerSeat([base,back],g,new THREE.Vector3(0,1.2,.05),yaw,info);Object.defineProperty(data,'bookIds',{get:()=>books.map(mesh=>mesh.userData.book.id),configurable:true});ours.push(base,back)}
      else for(const part of [base,back])mark(part,{type:'walden-card',title:info.title,author:info.author,action:'READ'});
      return g;
    }
    function showJournal(quiet){
      const house=state?.house;if(!house||house.shown)return;house.shown=true;
      if(house.journal){house.journal.visible=true;interactables.push(house.journal);ours.push(house.journal);books.push(house.journal)}
      if(!quiet)playSample?.('doorOpen',.3,1.4);
    }

    // ---------- the yard ----------
    function buildYard(){
      // The three-legged table among the pines, the awning over it, and the Concord circle's books on a stand of boards.
      const {groups}=catalogue(),t=W(SPOTS.table.x,SPOTS.table.z),g=new THREE.Group();g.position.set(t.x,0,t.z);root.add(g);
      const pine=std({color:0x7a5c3c,roughness:.8}),top=cyl(.42,.42,.04,20,pine,0,.74,.4,g),legs=[];
      for(let i=0;i<3;i++){const a=i/3*Math.PI*2,leg=box(.04,.74,.04,pine,Math.cos(a)*.3,.37,.4+Math.sin(a)*.3,g);leg.rotation.set(Math.sin(a)*.12,0,-Math.cos(a)*.12);legs.push(leg)}
      cyl(.025,.03,.05,8,std({color:0x101010,roughness:.4}),.15,.79,.3,g);const pen=box(.2,.008,.008,std({color:0xd9cfb4,roughness:.6}),-.05,.765,.45,g);pen.rotation.y=.6;
      for(const part of [top,...legs])mark(part,card('table'));block(t.x,t.z+.4,1,1);
      const run=3.2,rows=[.62,1.18],per=Math.max(1,Math.ceil(groups[1].books.length/2)),gap=Math.min(.4,(run-.3)/per);
      for(const y of rows)box(run,.03,.3,pine,0,y-.2,-.75,g);for(const sx of [-run/2,run/2])box(.06,1.45,.3,pine,sx,.72,-.75,g);box(run,.5,.03,pine,0,.3,-.89,g);
      const geometry=own(new THREE.BoxGeometry(.28,.38,.04));
      groups[1].books.forEach((book,i)=>{const row=i<per?0:1,n=row?groups[1].books.length-per:per,col=row?i-per:i;placeBook(book,g,geometry,{x:(col-(n-1)/2)*gap,y:rows[row]-.01,z:-.68,yaw:0},'concord')});
      block(t.x,t.z-.75,run+.2,.5);
      const label=sign(GROUPS[1].name,GROUPS[1].sub,1.8,.3);label.position.set(0,1.62,-.88);g.add(label);mark(label,card('awning'));
      // The awning, stretched on four poles.
      const canvas=std({color:0xcfc4a8,roughness:1,side:THREE.DoubleSide});const awning=box(3.8,.02,2.6,canvas,0,2.35,-.2,g);awning.rotation.x=.08;mark(awning,card('awning'));
      for(const [px,pz] of [[-1.85,-1.45],[1.85,-1.45],[-1.85,1.05],[1.85,1.05]]){cyl(.025,.03,2.4,6,pine,px,1.2,pz,g);block(t.x+px,t.z+pz,.15,.15)}
      // The third chair, by the table: for society.
      seat(g,0,1.2,0,{title:'The third chair: for society',author:'Three for society. When more visitors came, he said, they generally economized the room by standing up. Sit and read one of the Concord books.'});
      // The bean-field: rows of beans, one instanced mesh, and a hoe left at the end of a row.
      const b=SPOTS.beans,plants=[];for(let x=b.x-b.w/2+.45;x<b.x+b.w/2;x+=.9)for(let z=b.z-b.d/2+.4;z<b.z+b.d/2-.3;z+=.42)plants.push([x,z]);
      const leafMesh=new THREE.InstancedMesh(own(new THREE.IcosahedronGeometry(.17,0)),std({color:0x3a5a2a,roughness:.9}),plants.length),o=new THREE.Object3D(),rand=mulberry(41);leafMesh.name='walden-beans';
      plants.forEach(([x,z],i)=>{o.position.set(CENTRE.x+x,.16,CENTRE.z+z);o.rotation.set(0,rand()*6,0);const s=.8+rand()*.5;o.scale.set(s,s*.8,s);o.updateMatrix();leafMesh.setMatrixAt(i,o.matrix)});
      leafMesh.instanceMatrix.needsUpdate=true;own(leafMesh);root.add(leafMesh);mark(leafMesh,card('beans'));
      const hoe=new THREE.Group(),hp=W(b.x-b.w/2-.4,b.z+b.d/2-1);hoe.position.set(hp.x,0,hp.z);hoe.rotation.z=.25;root.add(hoe);mark(cyl(.018,.018,1.5,6,pine,0,.75,0,hoe),card('hoe'));mark(box(.18,.12,.02,std({color:0x2a2622,metalness:.5,roughness:.5}),.06,.06,0,hoe),card('hoe'));
      // The woodpile: stumps and split logs, one instanced mesh.
      const wp=W(SPOTS.woodpile.x,SPOTS.woodpile.z),logs=[];for(let layer=0;layer<4;layer++)for(let i=0;i<6-layer;i++)logs.push([wp.x-1.1+i*.42+layer*.21,.14+layer*.24,wp.z]);
      const logMesh=new THREE.InstancedMesh(own(new THREE.CylinderGeometry(.13,.13,1.1,8)),std({color:0x6a5238,roughness:.95}),logs.length);logMesh.name='walden-woodpile';
      logs.forEach(([x,y,z],i)=>{o.position.set(x,y,z);o.rotation.set(Math.PI/2,0,0);o.scale.set(1,1,1);o.updateMatrix();logMesh.setMatrixAt(i,o.matrix)});logMesh.instanceMatrix.needsUpdate=true;own(logMesh);root.add(logMesh);mark(logMesh,card('woodpile'));
      block(wp.x,wp.z,2.8,1.3);
      // The boat, drawn up on the sand: a flute on the seat, and the cod-line wound round its stone.
      const bt=W(SPOTS.boat.x,SPOTS.boat.z),boat=new THREE.Group();boat.position.set(bt.x,0,bt.z);boat.rotation.y=.25;root.add(boat);
      const hull=std({color:0x4a3a2a,roughness:.75}),hullParts=[box(1.1,.08,3.2,hull,0,.1,0,boat),box(.06,.38,3.2,hull,-.55,.28,0,boat),box(.06,.38,3.2,hull,.55,.28,0,boat),box(1.1,.38,.06,hull,0,.28,-1.6,boat),box(1.1,.32,.06,hull,0,.3,1.6,boat),box(1.04,.04,.3,hull,0,.36,.2,boat)];
      for(const part of hullParts)mark(part,card('boat'));
      const flute=cyl(.012,.012,.62,8,std({color:0x2a1c12,roughness:.4}),.1,.4,.2,boat);flute.rotation.z=Math.PI/2;
      mark(flute,{type:'walden-flute',title:'His flute',author:WALDEN.flute,action:'PLAY'});
      const line=add(own(new THREE.TorusGeometry(.07,.025,6,12)),std({color:0xd8cfb8,roughness:.9}),-.25,.16,-.8,boat);line.rotation.x=Math.PI/2;
      const stone=add(own(new THREE.DodecahedronGeometry(.07,0)),std({color:0x7a766c,roughness:.9}),-.1,.17,-.8,boat);
      for(const part of [line,stone])mark(part,{type:'walden-sound',title:'A cod-line and a stone',author:`“${WALDEN.bottomless}” He did not: “${WALDEN.sounding}”`,action:'SOUND THE POND'});
      block(bt.x,bt.z,1.6,3.4);
      // The perch that come to the flute: faint glints in the water by the boat.
      const glints=new THREE.InstancedMesh(own(new THREE.SphereGeometry(.06,6,4)),own(new THREE.MeshBasicMaterial({color:0xc8d8b0,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending})),9);glints.name='walden-perch';
      for(let i=0;i<9;i++){const a=i/9*Math.PI*2;o.position.set(bt.x+.8+Math.cos(a)*1.4,.06,bt.z+4.2+Math.sin(a)*1.1);o.rotation.set(0,a,0);o.scale.set(1,.4,2.4);o.updateMatrix();glints.setMatrixAt(i,o.matrix)}
      glints.instanceMatrix.needsUpdate=true;own(glints);root.add(glints);state.perch={mesh:glints,until:0};
      // The loon, far out on the water.
      const loon=new THREE.Group();loon.name='walden-loon';const dark=std({color:0x101214,roughness:.5});const body=add(own(new THREE.SphereGeometry(.28,10,8)),dark,0,.1,0,loon);body.scale.set(.7,.45,1.5);
      add(own(new THREE.SphereGeometry(.12,8,6)),dark,0,.32,-.42,loon);add(own(new THREE.SphereGeometry(.05,6,4)),std({color:0xe8e8e8,roughness:.5}),0,.16,.05,loon).scale.set(3,1,5);
      root.add(loon);state.loon={group:loon,at:{x:8,z:28},next:6,down:0};placeLoon();for(const part of loon.children)mark(part,card('loon'));
      // The garden door back, standing on its own among the pines.
      const gate=W(SPOTS.gate.x,SPOTS.gate.z),exit={type:'walden-exit',title:'The Naturalist’s Cabinet',author:CARDS.gate[1],action:'RETURN'};
      if(!doorKit?.hang(root,{data:exit,mark,x:gate.x,z:gate.z,yaw:0,label:'THE NATURALIST’S CABINET',own,...DOOR_LOOK}))mark(box(1.9,3.1,.16,std({color:DOOR_LOOK.color,roughness:.7}),gate.x,1.55,gate.z,root),exit);
      block(gate.x,gate.z-.2,2.4,.7);
      // A sign by the path, and the footpath's own card where it leaves the house.
      const s=sign('WALDEN POND','Concord, Massachusetts · 1845–1847',1.5,.25),post=W(1.9,-26.5);s.position.set(post.x,1.45,post.z);s.rotation.y=-.4;root.add(s);mark(s,card('woods'));
      mark(cyl(.04,.05,1.4,6,pine,post.x,.7,post.z-.03,root),card('woods'));block(post.x,post.z,.3,.3);
      const cost=sign('$28.12½','The cost of the house, to the half-cent',.9,.2);const cp=W(HOUSE.x-1.7,HOUSE.z+2.6);cost.position.set(cp.x,1.1,cp.z);cost.rotation.y=Math.PI/2.4;root.add(cost);mark(cost,card('cost'));
      mark(cyl(.03,.04,1,6,pine,cp.x,.5,cp.z,root),card('cost'));block(cp.x,cp.z,.25,.25);
    }
    function placeLoon(){const l=state?.loon;if(!l)return;const p=W(l.at.x,l.at.z);l.group.position.set(p.x,.03,p.z);l.group.rotation.y=Math.atan2(-l.at.x,-l.at.z)}
    // A book on a shelf or a stand, face out.
    function placeBook(book,parent,geometry,spot,shelf){
      const mesh=add(geometry,own(bookMaterial(book)),spot.x,spot.y,spot.z,parent);mesh.rotation.order='YXZ';mesh.rotation.y=spot.yaw;mesh.rotation.x=-.08;
      mesh.userData={type:'book',book,loaded:false,walden:true,shelf,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent}};
      interactables.push(mesh);ours.push(mesh);books.push(mesh);return mesh;
    }

    // ---------- the night ----------
    function buildSky(){
      // The moon, over the pond to the south, a cloud drifting near it, and stars.
      const moon=add(own(new THREE.CircleGeometry(3.4,32)),own(new THREE.MeshBasicMaterial({color:0xf0ecdc,fog:false})),CENTRE.x+10,40,CENTRE.z+105,root);moon.lookAt(CENTRE.x,0,CENTRE.z);
      const halo=own(canvasTexture((c,Wd,Ht)=>{const gr=c.createRadialGradient(Wd/2,Ht/2,0,Wd/2,Ht/2,Wd/2);gr.addColorStop(0,'rgba(230,228,210,.5)');gr.addColorStop(1,'rgba(230,228,210,0)');c.fillStyle=gr;c.fillRect(0,0,Wd,Ht)},128,128));
      const haloSprite=new THREE.Sprite(own(new THREE.SpriteMaterial({map:halo,fog:false,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending})));haloSprite.scale.set(24,24,1);haloSprite.position.copy(moon.position);root.add(haloSprite);
      const cloudMap=own(canvasTexture((c,Wd,Ht)=>{c.clearRect(0,0,Wd,Ht);const rand=mulberry(23);for(let i=0;i<40;i++){const x=Wd*(.15+rand()*.7),y=Ht*(.35+rand()*.3),r=Wd*(.05+rand()*.12),gr=c.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(60,66,80,.55)');gr.addColorStop(1,'rgba(60,66,80,0)');c.fillStyle=gr;c.fillRect(x-r,y-r,r*2,r*2)}},256,128));
      const cloud=new THREE.Sprite(own(new THREE.SpriteMaterial({map:cloudMap,fog:false,transparent:true,depthWrite:false})));cloud.scale.set(30,12,1);cloud.position.set(CENTRE.x-8,46,CENTRE.z+98);root.add(cloud);state.cloud=cloud;
      const rand=mulberry(5),stars=[];for(let i=0;i<500;i++){const a=rand()*Math.PI*2,e=.12+rand()*1.3,r=120;stars.push(CENTRE.x+Math.cos(a)*Math.cos(e)*r,Math.sin(e)*r*.9+8,CENTRE.z+Math.sin(a)*Math.cos(e)*r)}
      const sky=own(new THREE.BufferGeometry());sky.setAttribute('position',new THREE.Float32BufferAttribute(stars,3));
      const points=new THREE.Points(sky,own(new THREE.PointsMaterial({color:0xdde4f0,size:.5,sizeAttenuation:true,fog:false,transparent:true,opacity:.85})));points.name='walden-stars';root.add(points);
      // The dove: grey, going up from the pines on the east shore towards the cloud.
      const dove=new THREE.Group();dove.visible=false;const grey=std({color:0x9a958e,roughness:.8});const db=add(own(new THREE.SphereGeometry(.12,8,6)),grey,0,0,0,dove);db.scale.set(.8,.7,1.4);
      for(const side of [-1,1]){const wing=box(.32,.015,.16,grey,side*.2,.02,0,dove);wing.userData.side=side}root.add(dove);state.dove={group:dove,t:-1};
      // Fireflies in the long grass by the shore.
      const flies=[],fr=mulberry(13);for(let i=0;i<40;i++){const x=(fr()-.5)*40,z=-6+fr()*14;if(inPond(x,z,1))continue;flies.push(CENTRE.x+x,.5+fr()*1.2,CENTRE.z+z)}
      const flyGeo=own(new THREE.BufferGeometry());flyGeo.setAttribute('position',new THREE.Float32BufferAttribute(flies,3));
      // Each a soft round glow, not a square.
      const spark=own(canvasTexture((c,Wd,Ht)=>{const gr=c.createRadialGradient(Wd/2,Ht/2,0,Wd/2,Ht/2,Wd/2);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.3,'rgba(255,255,255,.5)');gr.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=gr;c.fillRect(0,0,Wd,Ht)},32,32));
      const fireflies=new THREE.Points(flyGeo,own(new THREE.PointsMaterial({color:0xd8f07a,map:spark,size:.09,transparent:true,opacity:.7,depthWrite:false,blending:THREE.AdditiveBlending})));fireflies.name='walden-fireflies';root.add(fireflies);state.fireflies=fireflies;
    }

    // ---------- building and freeing ----------
    function build(){
      if(root)return;root=new THREE.Group();root.name='walden';state={};
      buildGround();buildHouse();buildYard();buildTrees();buildSky();scene.add(root);
    }
    function unload(){
      // Its lamp is marked freed, so the light budget lets it go.
      if(!root)return;root.removeFromParent();root.traverse(object=>{if(object.isLight)object.userData.freed=true});root=null;state=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0;trunks.length=0;
    }
    function activate(){build();lastNeeded=time}

    // ---------- walking ----------
    const local=(x,z)=>({x:x-CENTRE.x,z:z-CENTRE.z});
    function contains(x,z){return Math.hypot(x-CENTRE.x,z-CENTRE.z)<WALK+1.5}
    function inHouse(x,z){const p=local(x,z);return Math.abs(p.x-HOUSE.x)<HOUSE.w/2&&Math.abs(p.z-HOUSE.z)<HOUSE.d/2}
    function floorAt(x,z){return contains(x,z)?0:null}
    function allowed(x,z){
      const p=local(x,z),nearHouse=Math.abs(p.x-HOUSE.x)<HOUSE.w/2+1&&Math.abs(p.z-HOUSE.z)<HOUSE.d/2+1;
      // A small house: the reader moves more carefully in and around it.
      const r=nearHouse?Math.min(.25,player.radius||.42):(player.radius||.42);
      if(Math.hypot(p.x,p.z)>WALK-r)return false;
      if(p.z>shoreZ(p.x)-.6-r)return false;
      if(blockers.some(b=>x+r>b.minX&&x-r<b.maxX&&z+r>b.minZ&&z-r<b.maxZ))return false;
      return !trunks.some(t=>Math.abs(t.x-x)<2&&Math.abs(t.z-z)<2&&Math.hypot(t.x-x,t.z-z)<t.r+r);
    }

    // ---------- doing things ----------
    const ARRIVAL=W(SPOTS.arrival.x,SPOTS.arrival.z);
    function enter(){
      activate();move(ARRIVAL.x,ARRIVAL.z,Math.PI);playSample?.('doorOpen',.6,1.08);
      showNotice('Walden Pond, on a summer night. A path goes down through the pines to Thoreau’s house, with the lamp lit; beyond it, the pond, and the moon on the water.',10);
      analytics?.track('Room Explored',{room:'walden'});
    }
    function leave(){move(DOOR.x+Math.sin(DOOR.yaw)*1.6,DOOR.z+Math.cos(DOOR.yaw)*1.6,DOOR.yaw+Math.PI);playSample?.('doorOpen',.6,1);showNotice('The Naturalist’s Cabinet again, and the lamp over the hummingbirds.',4)}
    function play(notes,voice,beat){if(!tone)return 0;let at=0;for(const [freq,beats] of notes){tone(freq,at,beats*beat+.15,.06,voice);at+=beats*beat}return at}
    const SIGNS={
      hound:{text:'Somewhere off among the trees to the north-east, a hound bays, once and then again, and does not come. Its tracks cross the grass here and go on into the dark.',
        sound:()=>{sound?.(430,1.3,'triangle',.05);later(()=>sound?.(410,1.7,'triangle',.045),1500)}},
      horse:{text:'Hoofbeats on the road to the village: a horse at a trot, going away, and nobody on it that you can see. Its prints are fresh in the sand of the road.',
        sound:()=>{for(let i=0;i<14;i++)later(()=>sound?.(150,.07,'square',.03*(1-i/16)),i*240+(i%2?110:0))}},
      dove:{text:'A turtle-dove goes up from the pines along the shore, and you watch it climb towards the moon until it disappears behind a cloud.',
        sound:()=>{for(let i=0;i<6;i++)later(()=>sound?.(900,.05,'triangle',.015),i*90);later(()=>sound?.(470,.7,'sine',.03),900)}}
    };
    function noticeSign(key){
      const all=heard();if(all.has(key)&&!preview())return;all.add(key);try{storage?.setItem(LOST_KEY,JSON.stringify([...all]))}catch(e){}
      SIGNS[key].sound();if(key==='dove'&&state?.dove){const p=W(SPOTS.dove.x,SPOTS.dove.z);state.dove.group.position.set(p.x,4,p.z);state.dove.from=state.dove.group.position.clone();state.dove.t=0;state.dove.group.visible=true}
      const done=LOST.every(k=>all.has(k));
      if(done&&!wasFound()){try{storage?.setItem(FOUND_KEY,'1')}catch(e){}showJournal(false);
        showNotice(`${SIGNS[key].text} “${WALDEN.met}” Now you are one of them. Something has been left on the doorstep of the house.`,16);analytics?.track('Secret Found',{secret:'walden-hound'});return}
      const left=LOST.filter(k=>!all.has(k)).length;showNotice(SIGNS[key].text+(left?` (${3-left} of the three he lost.)`:''),11);
    }
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('walden-'))return false;
      if(data.type==='walden-door'){through(data,enter);return true}
      if(data.type==='walden-exit'){through(data,leave);return true}
      if(data.type==='walden-flute'){
        const length=play(AIR,'flute',.62)||6;if(state?.perch)state.perch.until=time+length+2;
        showNotice(`${data.title}: “${data.author}”`,12);return true;
      }
      if(data.type==='walden-sound'){
        sound?.(260,.4,'sine',.02);
        showNotice(`You pay out the line from the shore and the stone goes down through the black water: twenty feet, fifty, eighty, and still going, until at last it rests. “${WALDEN.depth}” Not bottomless, then; though, as he said, “${WALDEN.spared}”`,15);return true;
      }
      if(data.type==='walden-card'){
        if(data.key==='loon'&&state?.loon)state.loon.next=Math.min(state.loon.next,time+.5);
        showNotice(`${data.title}: ${data.author}`,data.author.length>200?14:10);return true;
      }
      return false;
    }

    // ---------- each frame ----------
    function update(t,dt=0){
      time=t;const {x,z}=player.pos,inside=contains(x,z),near=Math.hypot(x-DOOR.x,z-DOOR.z)<PRELOAD;
      if(inside||near)activate();
      if(!root)return;
      if(!inside&&!near&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==b.userData.home.parent))unload();
      if(!root||!inside)return;
      // A summer night whatever the hour in the library: a deep blue sky, light fog, and the library's light turned down.
      scene.background?.setRGB?.(.012,.018,.035);if(scene.fog){scene.fog.color.setRGB(.014,.02,.03);scene.fog.density=.013}if(ambient)ambient.intensity*=.55;if(moonlight)moonlight.intensity*=.9;
      const still=isReducedMotion()?0:1,p=local(x,z);
      // The three he lost: each comes once, to the reader who goes near enough its place.
      for(const key of LOST){const s=SPOTS[key];if(Math.hypot(p.x-s.x,p.z-s.z)<4.2&&!state.signs?.[key]){(state.signs||(state.signs={}))[key]=true;noticeSign(key)}}
      if(state.glitter)state.glitter.material.opacity=.45+.12*Math.sin(t*.7)*still;
      if(state.cloud)state.cloud.position.x=CENTRE.x-8+Math.sin(t*.02)*6*still;
      if(state.fireflies)state.fireflies.material.opacity=.35+.35*Math.max(0,Math.sin(t*2.1))*Math.max(0,Math.sin(t*.73+1));
      if(state.perch){const on=t<state.perch.until;state.perch.mesh.material.opacity+=((on?.5:0)-state.perch.mesh.material.opacity)*Math.min(1,dt*1.5)}
      // The dove climbs towards the cloud by the moon, smaller and fainter, and is gone.
      const dove=state.dove;if(dove&&dove.t>=0){dove.t+=dt/7;const k=Math.min(1,dove.t),c=state.cloud.position;dove.group.position.set(dove.from.x+(c.x-dove.from.x)*k,dove.from.y+(c.y-dove.from.y)*k,dove.from.z+(c.z-dove.from.z)*k);
        dove.group.lookAt?.(c);for(const wing of dove.group.children)if(wing.userData.side)wing.rotation.z=wing.userData.side*Math.sin(t*14)*.6*still;if(k>=1){dove.group.visible=false;dove.t=-1}}
      // The loon dives, and comes up somewhere else, laughing.
      const l=state.loon;if(l&&t>l.next){if(!l.down){l.down=1;l.group.visible=false;l.next=t+5+Math.random()*5}
        else{l.down=0;const a=Math.random()*Math.PI*2,r=.25+Math.random()*.45;l.at={x:POND.x+Math.cos(a)*POND.rx*r*.6,z:POND.z+Math.sin(a)*POND.rz*r};if(l.at.z<shoreZ(l.at.x)+6)l.at.z=shoreZ(l.at.x)+6;placeLoon();l.group.visible=true;l.next=t+14+Math.random()*20;
          sound?.(640,1.4,'sine',.025);later(()=>sound?.(760,1.1,'sine',.02),1200)}}
    }

    buildDoor();
    return {contains,floorAt,allowed,interact,update,enter,leave,unload,activate,catalogue,inHouse,
      zoneAt:(x,z)=>contains(x,z)?(inHouse(x,z)?'walden-house':'walden'):null,
      centre:CENTRE,walk:WALK,pond:POND,house:HOUSE,spots:SPOTS,lost:LOST,quotes:WALDEN,cards:CARDS,air:AIR,door:DOOR,arrival:ARRIVAL,groups:GROUPS,shoreZ:x=>CENTRE.z+shoreZ(x-CENTRE.x),
      get built(){return !!root},get books(){return books.slice()},get trees(){return state?.trees||null},get trunks(){return trunks.slice()},get journalFound(){return !!state?.house?.shown}};
  };
})();
