// The Forest Song (Лісова пісня): the world of Lesia Ukrainka's play of 1911, reached from the Ukrainian Reading Room.
// Lukash's reed pipe hangs on the room's south wall; play it, and the reader is standing in the old forest in Volyn
// where the play begins, on a spring night: the glade with the weeping birch and the great ancient oak, the forest
// lake covered with duckweed and water-lilies but clear in the middle, the stream that runs in and out of it, the
// reeds where Lukash cut his pipe, the old split willow, half-withered, the fallen tree where the Forest Elder sat
// smoking, and the embers of a fire. The trees are still almost bare, as in the prologue. The pipe lies against the
// oak: play it, and as the stage directions say, as the music unfolds, so everything in the forest unfolds with it,
// the catkins, the birch's leaves, the white lilies on the lake; and then Mavka steps out from behind the willow.
// The library's own copy of the play lies on the fallen tree, which is a seat. A blue door with a rushnyk beside it
// stands among the pines and leads back to the reading room. Every quotation is from the library's own text of the
// play (book 999793), checked by a test; the English after each is the library's plain rendering.
//
// Nothing is built until the reader goes in, and it is freed a while after they leave. It adds no lights: the
// library's moonlight lights it, the embers, fireflies and Mavka glow through their own colour, and the trees are
// InstancedMeshes, so the whole forest costs a handful of draw calls.
(function(){
  'use strict';

  // Far from everything else: the Deep Wood is at x 800, z 400, the mountain at x 1100, z 700.
  const CENTRE={x:600,z:900},WALK=32,EDGE=56,KEEP=25,BOOK=999793;
  // Places in the forest, relative to its centre (yaw 0 faces north, -z). The lake is an ellipse to the north.
  const SPOTS={door:{x:0,z:26,r:3.5},glade:{x:0,z:2,r:11},oak:{x:5,z:-1,r:2.4},birch:{x:-5,z:-2,r:1.6},fire:{x:1,z:8,r:1.3},
    log:{x:8.5,z:7,r:2},willow:{x:-9.5,z:-11.5,r:2.2},reeds:{x:6.5,z:-12.5,r:2.5}};
  const LAKE={x:0,z:-20,rx:11,rz:7};
  const PATHS=[['door','glade'],['glade','willow'],['glade','reeds']];
  // Everything said here is the play's own words (book 999793), with the library's plain English after.
  const QUOTES={
    glade:'«Старезний, густий, предковічний ліс на Волині. Посеред лісу простора галява з плакучою березою і з великим прастарим дубом.» (An ancient, dense, primeval forest in Volyn. In the middle of the forest, a wide glade with a weeping birch and a great, ancient oak. The prologue.)',
    flowers:'«По узліссі і на галяві зеленіє перший ряст і цвітуть проліски та сон-трава.» (At the forest’s edge and on the glade the first corydalis is green, and squills and pasque-flowers are in bloom.)',
    lake:'«Саме озеро - тиховоде, вкрите ряскою та лататтям, але з чистим плесом посередині.» (The lake itself is still, covered with duckweed and water-lilies, but with clear water in the middle.)',
    stream:'«Струмок той вибігає з гущавини лісу, впадає в озеро, потім, по другім боці озера, знов витікає і губиться в хащах.» (The stream runs out of the thick of the forest, falls into the lake, then flows out again on its far side and is lost in the thickets.)',
    reeds:'Лукаш: «Та я хотів собі сопілку втяти, - хороший тута вельми очерет.» (Lukash: “I wanted to cut myself a pipe: the reeds here are very good.”)',
    willow:'«З-за стовбура старої розщепленої верби, півусохлої, виходить Мавка» (From behind the trunk of the old split willow, half-withered, Mavka comes out.) Mavka is a spirit of the forest; this willow is where she sleeps the winter through.',
    birch:'Мавка: «Чом ти, березо, така журлива?» (Mavka: “Why are you so sorrowful, birch?”)',
    oak:'The great ancient oak at the heart of the glade. In the play Lukash plays his spring songs leaning against it: «Лукаш грає веснянки.» (Lukash plays spring songs.)',
    log:'«Лісовик, щось воркочучи, закурює люльку, сівши на заваленому дереві.» (The Forest Elder, muttering something, lights his pipe, sitting on a fallen tree.) The play lies on the trunk where he sat. Sit, and read it.',
    fire:'«тільки жевріє долі жар, позосталий від огнища» (only the embers left from the fire glow low on the ground). Act One ends here, at night.',
    sopilka:'Lukash’s reed pipe, leaning against the oak. «З очеретів чутно голос сопілки» … «ніжний, кучерявий, і як він розвивається, так розвивається все в лісі.» (From the reeds comes the voice of a pipe, tender and curling, and as it unfolds, so everything in the forest unfolds.)',
    bloom:'«Спочатку на вербі та вільхах замайоріли сережки, потім береза листом залепетала. На озері розкрились лілеї білі» (First the catkins sway on the willow and the alders, then the birch begins to babble with its leaves. White lilies open on the lake.)',
    awake:'Мавка: «Ох, як я довго спала!» (Mavka: “Oh, how long I have slept!”)',
    song:'Мавка: «Як солодко грає, як глибоко крає, розтинає білі груди, серденько виймає!» (Mavka: “How sweetly it plays, how deeply it cuts, it opens my white breast and draws out my heart!”)',
    mavka:'Мавка, лісова русалка, у ясно-зеленій одежі, з розпущеними чорними косами. Наприкінці п’єси вона каже: «Я в серці маю те, що не вмирає.» (Mavka, a spirit of the forest, in light green, her black hair loose. At the end of the play she says: “I have in my heart that which does not die.”)',
    door:'Блакитні двері з рушником, як у читальні. За ними Українська читальня. (A blue door with a rushnyk beside it, like the reading room’s. Through it, the Ukrainian Reading Room.)'
  };
  // Lukash's spring song on the pipe: the library's own tune in the Dorian mode, not one of the play's melodies.
  const TUNE=[[440,.5],[587.33,.5],[659.25,.5],[698.46,1],[659.25,.5],[587.33,.5],[659.25,1.5],[698.46,.5],[783.99,.5],[880,1],[783.99,.5],[698.46,.5],[659.25,.5],[587.33,1.5],
    [880,.5],[783.99,.5],[698.46,.5],[659.25,.5],[698.46,.5],[659.25,.5],[587.33,1],[523.25,.5],[587.33,2]];
  const mulberry=seed=>()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296};

  window.createForestSong=function(options){
    const {THREE,scene,MAT,player,ambient=null,moon:moonlight=null,interactables,canvasTexture,bookMaterial,findBook,showNotice,playSample,tone=null,registerSeat=null,move,analytics,
      toRoom=null,isHolding=()=>false,isReducedMotion=()=>false,storage=window.localStorage}=options;
    const MET_KEY='athenaeum-forest-song-mavka';
    const ARRIVAL={x:CENTRE.x+SPOTS.door.x,z:CENTRE.z+SPOTS.door.z-2.6,yaw:0};
    let root=null,time=0,lastNeeded=-1e9,state=null;
    const owned=[],ours=[],books=[],blockers=[],trunks=[];
    const own=thing=>{owned.push(thing);return thing};
    const std=params=>own(new THREE.MeshStandardMaterial(params));
    const at=key=>({x:CENTRE.x+SPOTS[key].x,z:CENTRE.z+SPOTS[key].z});
    function add(geometry,material,x,y,z,parent=root){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    const cyl=(rt,rb,h,seg,material,x,y,z,parent)=>add(own(new THREE.CylinderGeometry(rt,rb,h,seg)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    const card=(key,title,action='LOOK')=>({type:'song-card',key,title,author:QUOTES[key],action});
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const met=()=>{try{return storage?.getItem(MET_KEY)==='1'}catch(e){return false}};
    const inLake=(x,z,pad=0)=>((x-LAKE.x)/(LAKE.rx+pad))**2+((z-LAKE.z)/(LAKE.rz+pad))**2<1;

    // ---------- geometry helpers ----------
    function joined(parts){
      const positions=[],normals=[],colours=[],colour=new THREE.Color();
      for(const [geometry,hex,matrix] of parts){const g=geometry.index?geometry.toNonIndexed():geometry;if(matrix)g.applyMatrix4(matrix);g.computeVertexNormals();colour.setHex(hex);
        const p=g.attributes.position,n=g.attributes.normal;for(let i=0;i<p.count;i++){positions.push(p.getX(i),p.getY(i),p.getZ(i));normals.push(n.getX(i),n.getY(i),n.getZ(i));colours.push(colour.r,colour.g,colour.b)}
        g.dispose();if(g!==geometry)geometry.dispose()}
      const out=new THREE.BufferGeometry();out.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));out.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));out.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));return own(out);
    }
    const placed=(x,y,z,rx=0,ry=0,rz=0,s=1)=>new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)),new THREE.Vector3(s,s,s));
    // Trees 1 m to the scale. A Polissian pine: a tall reddish trunk, the crown high up. A birch: a white trunk. An alder: dark.
    const pineGeometry=()=>joined([[new THREE.CylinderGeometry(.01,.02,1,7),0x3f2d22,placed(0,.5,0)],[new THREE.ConeGeometry(.17,.3,8),0x1b2e1e,placed(0,.82,0)],[new THREE.IcosahedronGeometry(.13,0),0x1e3322,placed(.04,.7,.02)]]);
    const trunkGeometry=hex=>joined([[new THREE.CylinderGeometry(.01,.02,.72,6),hex,placed(0,.36,0)],[new THREE.CylinderGeometry(.006,.012,.3,4),hex,placed(.06,.62,0,0,0,-.6)],[new THREE.CylinderGeometry(.006,.012,.28,4),hex,placed(-.05,.6,.02,0,0,.65)]]);
    const crownGeometry=()=>joined([[new THREE.IcosahedronGeometry(.16,0),0xffffff,placed(0,0,0)],[new THREE.IcosahedronGeometry(.12,0),0xffffff,placed(.1,-.03,.04)],[new THREE.IcosahedronGeometry(.11,0),0xffffff,placed(-.09,-.02,-.05)]]);
    function nearPath(x,z,distance){
      for(const [a0,b0] of PATHS){const a=SPOTS[a0],b=SPOTS[b0],dx=b.x-a.x,dz=b.z-a.z,l=dx*dx+dz*dz,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/l));if(Math.hypot(x-a.x-t*dx,z-a.z-t*dz)<distance)return true}
      return false;
    }
    const inClearing=(x,z,pad=0)=>Object.values(SPOTS).some(s=>Math.hypot(x-s.x,z-s.z)<s.r+pad);

    // ---------- the ground ----------
    // Moss and last year's leaves; the glade's new grass; the bright green bog by the willow; the stream; the paths.
    function buildGround(){
      const size=EDGE+12,map=own(canvasTexture((c,W,H)=>{const k=W/(size*2),px=x=>(x+size)*k,pz=z=>(z+size)*k,rand=mulberry(11);
        c.fillStyle='#1b2116';c.fillRect(0,0,W,H);
        for(let i=0;i<9000;i++){c.fillStyle=['#232a1b','#1a1f15','#2b2a1b','#2d2518','#202818'][i%5];const r=1+rand()*3;c.fillRect(rand()*W,rand()*H,r,r)}
        const glow=(x,z,r,colour)=>{const g=c.createRadialGradient(px(x),pz(z),0,px(x),pz(z),r*k);g.addColorStop(0,colour);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.beginPath();c.arc(px(x),pz(z),r*k,0,7);c.fill()};
        glow(SPOTS.glade.x,SPOTS.glade.z,SPOTS.glade.r+3,'rgba(70,96,46,.85)');glow(-8,-14,6,'rgba(84,140,40,.8)');glow(LAKE.x,LAKE.z,LAKE.rx+3,'rgba(40,52,30,.7)');
        c.lineCap='round';
        for(const [width,colour] of [[2.4,'rgba(70,60,40,.6)'],[1.3,'rgba(98,84,58,.7)']])for(const [a,b] of PATHS){c.strokeStyle=colour;c.lineWidth=width*k;c.beginPath();c.moveTo(px(SPOTS[a].x),pz(SPOTS[a].z));c.lineTo(px(SPOTS[b].x),pz(SPOTS[b].z));c.stroke()}
        // The stream: in from the north-east thicket, out to the west.
        c.strokeStyle='rgba(20,34,44,.9)';c.lineWidth=1.4*k;c.beginPath();c.moveTo(px(40),pz(-44));c.quadraticCurveTo(px(18),pz(-34),px(8),pz(-25));c.stroke();
        c.beginPath();c.moveTo(px(-10),pz(-22));c.quadraticCurveTo(px(-26),pz(-26),px(-44),pz(-36));c.stroke();
        c.strokeStyle='rgba(120,150,170,.25)';c.lineWidth=.4*k;c.beginPath();c.moveTo(px(40),pz(-44));c.quadraticCurveTo(px(18),pz(-34),px(8),pz(-25));c.stroke();
        for(let i=0;i<4000;i++){c.fillStyle=['rgba(120,86,42,.3)','rgba(62,80,40,.35)','rgba(18,22,14,.45)'][i%3];c.fillRect(rand()*W,rand()*H,1.5,1.5)}
      },1024,1024));
      const ground=add(own(new THREE.CircleGeometry(size,48)),std({map,roughness:1,color:0xa6ae9c}),CENTRE.x,0,CENTRE.z);ground.rotation.x=-Math.PI/2;
      // The spring flowers of the glade: corydalis, squills and pasque-flowers, three small instanced meshes.
      const rand=mulberry(23),dummy=new THREE.Object3D(),flowerGeometry=own(new THREE.IcosahedronGeometry(.032,0));
      state.flowers=[];
      for(const [hex,n] of [[0xb18ad8,90],[0x3f6fd8,110],[0x8a4fc4,70]]){const mesh=own(new THREE.InstancedMesh(flowerGeometry,std({color:hex,emissive:hex,emissiveIntensity:.12,roughness:.8}),n));let i=0;
        for(let tries=0;tries<n*20&&i<n;tries++){const a=rand()*Math.PI*2,r=Math.sqrt(rand())*(SPOTS.glade.r+2),x=SPOTS.glade.x+Math.cos(a)*r,z=SPOTS.glade.z+Math.sin(a)*r;
          if(nearPath(x,z,.9)||Math.hypot(x-SPOTS.fire.x,z-SPOTS.fire.z)<1.6||Math.hypot(x-SPOTS.oak.x,z-SPOTS.oak.z)<1.3)continue;
          dummy.position.set(CENTRE.x+x,.05,CENTRE.z+z);dummy.scale.setScalar(.7+rand()*.6);dummy.updateMatrix();mesh.setMatrixAt(i++,dummy.matrix)}
        mesh.count=i;mesh.instanceMatrix.needsUpdate=true;root.add(mesh);mark(mesh,card('flowers','Ряст, проліски, сон-трава'))}
    }

    // ---------- the trees ----------
    // Pines and bare birches and alders all round; the deciduous ones have crowns of their own, which grow with the song.
    function buildTrees(){
      const rand=mulberry(41),pines=[],birches=[],alders=[];
      for(let tries=0;tries<9000&&pines.length+birches.length+alders.length<430;tries++){
        const a=rand()*Math.PI*2,r=Math.sqrt(rand())*EDGE,x=Math.cos(a)*r,z=Math.sin(a)*r;
        if(inClearing(x,z,1.4)||nearPath(x,z,2)||inLake(x,z,3)||Math.hypot(x-SPOTS.glade.x,z-SPOTS.glade.z)<SPOTS.glade.r+1.5)continue;
        if([...pines,...birches,...alders].some(t=>Math.hypot(t.x-x,t.z-z)<(r>WALK?1.7:2.4)))continue;
        const roll=rand();(roll<.55?pines:roll<.8?birches:alders).push({x,z,s:(r>WALK?13:10)+rand()*7,yaw:rand()*Math.PI*2,lean:(rand()-.5)*.07});
      }
      // The glade's own two: the weeping birch and the great oak, which are built in buildPlaces.
      const crowns=[];
      for(const [list,geometry,material,name,radius] of [[pines,pineGeometry(),std({vertexColors:true,roughness:.95}),'song-pines',.45],
        [birches,trunkGeometry(0xbdb9ad),std({vertexColors:true,roughness:.9}),'song-birches',.32],[alders,trunkGeometry(0x3a352d),std({vertexColors:true,roughness:1}),'song-alders',.36]]){
        const mesh=new THREE.InstancedMesh(geometry,material,list.length);mesh.name=name;const o=new THREE.Object3D();
        list.forEach((t,i)=>{o.position.set(CENTRE.x+t.x,0,CENTRE.z+t.z);o.rotation.set(t.lean,t.yaw,0);o.scale.set(t.s,t.s,t.s);o.updateMatrix();mesh.setMatrixAt(i,o.matrix);
          if(name!=='song-pines')crowns.push({x:CENTRE.x+t.x+Math.sin(t.lean)*t.s*.6,y:t.s*.68,z:CENTRE.z+t.z,s:t.s,yaw:t.yaw,birch:name==='song-birches'});
          if(Math.hypot(t.x,t.z)<WALK+1)trunks.push({x:CENTRE.x+t.x,z:CENTRE.z+t.z,r:radius*t.s/10+.15})});
        mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere?.();root.add(mesh);
      }
      // The crowns: a green haze of buds now; leaves when the pipe is played.
      const crownMesh=new THREE.InstancedMesh(crownGeometry(),std({color:0x2c3520,roughness:.95,flatShading:true}),crowns.length);crownMesh.name='song-crowns';root.add(crownMesh);
      state.crowns={mesh:crownMesh,list:crowns};state.trees={pines:pines.length,birches:birches.length,alders:alders.length};
    }
    // Scale the crowns, lilies and catkins to how far the forest has unfolded (0 the bare prologue, 1 full spring).
    function applyBloom(b){
      const o=new THREE.Object3D(),{mesh,list}=state.crowns,grow=.35+.65*b;
      list.forEach((c,i)=>{o.position.set(c.x,c.y,c.z);o.rotation.set(0,c.yaw,0);o.scale.setScalar(c.s*grow*(c.birch?.9:1.1));o.updateMatrix();mesh.setMatrixAt(i,o.matrix)});
      mesh.instanceMatrix.needsUpdate=true;mesh.material.color.setRGB(.17-.05*b,.2+.14*b,.12+.02*b);
      if(state.lilies){const {mesh:lily,list:pads}=state.lilies;pads.forEach((p,i)=>{o.position.set(p.x,.06,p.z);o.rotation.set(0,p.yaw,0);o.scale.set(b*p.s,b*p.s*.8,b*p.s);o.updateMatrix();lily.setMatrixAt(i,o.matrix)});lily.instanceMatrix.needsUpdate=true;lily.visible=b>.02}
      if(state.catkins)state.catkins.scale.setScalar(Math.max(.001,b));
      state.applied=b;
    }

    // ---------- the places of the play ----------
    function buildPlaces(){
      const bark=std({color:0x3b3127,roughness:1}),deadwood=std({color:0x4a443c,roughness:1});
      // The great ancient oak: a broad trunk, heavy limbs, and a crown of its own (oaks leaf last, so it stays bare).
      {const p=at('oak'),g=new THREE.Group();g.position.set(p.x,0,p.z);root.add(g);
        const trunk=cyl(.62,.95,4.6,12,bark,0,2.3,0,g);
        for(const [yaw,tilt,len,y] of [[0,1,4.5,3.8],[2.1,.9,4,4.1],[4.2,1.1,4.2,3.6],[1,.6,3.4,4.5],[3.2,.5,3.2,4.6],[5.2,.7,3.6,4.3]]){const limb=cyl(.12,.3,len,7,bark,0,0,0,g);
          // Tilted about z, then turned about y: the limb's top points along (-sin tilt cos yaw, cos tilt, sin tilt sin yaw).
          limb.rotation.order='YXZ';limb.rotation.set(0,yaw,tilt);limb.position.set(-Math.sin(tilt)*Math.cos(yaw)*len/2,y+Math.cos(tilt)*len/2,Math.sin(tilt)*Math.sin(yaw)*len/2)}
        mark(trunk,card('oak','Прастарий дуб'));trunks.push({x:p.x,z:p.z,r:1.05});
        // Lukash's pipe, leaning against the oak's south side.
        const pipe=cyl(.018,.022,.62,8,std({color:0xc9a76a,roughness:.55}),0,.36,1.02,g);pipe.rotation.x=-.28;
        const holes=own(canvasTexture((c,W,H)=>{c.fillStyle='#c9a76a';c.fillRect(0,0,W,H);c.fillStyle='#3a2a16';for(let i=0;i<6;i++){c.beginPath();c.arc(W/2,H*.3+i*H*.08,W*.18,0,7);c.fill()}c.fillStyle='#8a3a1e';c.fillRect(0,H*.08,W,H*.04)},16,128));
        pipe.material.map=holes;pipe.material.needsUpdate=true;
        const glint=add(own(new THREE.SphereGeometry(.05,8,6)),std({color:0xfff2c8,emissive:0xffe6a0,emissiveIntensity:1.2}),0,.68,.94,g);state.pipeGlint=glint;
        mark(pipe,{type:'song-pipe',title:'Сопілка Лукашева',author:QUOTES.sopilka,action:'PLAY'});mark(glint,pipe.userData);}
      // The weeping birch: a white trunk, and long branches hanging down.
      {const p=at('birch'),white=std({color:0xe2ded2,roughness:.85}),twig=std({color:0x3a3028,roughness:1});
        const trunk=cyl(.16,.24,7,10,white,p.x,3.5,p.z);mark(trunk,card('birch','Плакуча береза'));trunks.push({x:p.x,z:p.z,r:.35});
        for(let i=0;i<14;i++){const a=i/14*Math.PI*2,r=.9+(i%3)*.45,hang=cyl(.01,.02,3.6,4,twig,p.x+Math.cos(a)*r,4.6,p.z+Math.sin(a)*r);hang.rotation.z=Math.cos(a)*.12;hang.rotation.x=Math.sin(a)*.12}
        const catkins=new THREE.Group();catkins.position.set(p.x,4.2,p.z);root.add(catkins);const leaf=own(new THREE.IcosahedronGeometry(.42,0)),green=std({color:0x6f9a44,roughness:.8,flatShading:true});
        for(let i=0;i<18;i++){const a=i*2.4,r=.7+(i%4)*.35;const m=add(leaf,green,Math.cos(a)*r,(i%5)*.45-.6,Math.sin(a)*r,catkins);m.scale.set(1,1.6,1)}
        state.catkins=catkins;}
      // The old split willow on the lake's south-west shore, half-withered, leaning over the bog.
      {const p=at('willow'),g=new THREE.Group();g.position.set(p.x,0,p.z);g.rotation.y=.5;root.add(g);
        const left=cyl(.3,.48,4.4,9,bark,-.5,2.05,0,g);left.rotation.z=.26;const right=cyl(.28,.44,2.8,9,deadwood,.36,1.3,.1,g);right.rotation.z=-.42;
        for(const [x,y,z,rz,len,dead] of [[-1.1,3,0,.9,2.4,0],[-.7,3.2,.4,.4,2,0],[1.2,2.6,0,-1,2.2,1],[1,2.8,-.3,-.6,1.8,1]]){const limb=cyl(.04,.1,len,5,dead?deadwood:bark,x,y,z,g);limb.rotation.z=rz}
        const wisps=std({color:0x4d6a32,roughness:.9});for(let i=0;i<16;i++)cyl(.008,.012,2.4,3,wisps,-2.3+i*.16,3.4,(i%3-1)*.3,g);
        const foliage=std({color:0x3d5a2c,roughness:.9,flatShading:true});for(let i=0;i<7;i++){const f=add(own(new THREE.IcosahedronGeometry(.55,0)),foliage,-1.6+(i%4)*.45,4.3+(i%3)*.3,(i%2?.3:-.3),g);f.scale.set(1.3,.7,1)}
        mark(left,card('willow','Стара розщеплена верба'));mark(right,left.userData);trunks.push({x:p.x,z:p.z,r:.9});}
      // The lake: dark water, duckweed and lily pads round the edge, clear in the middle; white lilies to come.
      {const water=add(own(new THREE.CircleGeometry(1,48)),std({color:0x0b151a,roughness:.12,metalness:.35}),CENTRE.x+LAKE.x,.02,CENTRE.z+LAKE.z);water.rotation.x=-Math.PI/2;water.scale.set(LAKE.rx,LAKE.rz,1);
        mark(water,card('lake','Лісове озеро'));
        const rand=mulberry(57),pads=[],dummy=new THREE.Object3D();
        for(let tries=0;tries<2000&&pads.length<110;tries++){const a=rand()*Math.PI*2,r=.55+rand()*.4,x=LAKE.x+Math.cos(a)*LAKE.rx*r,z=LAKE.z+Math.sin(a)*LAKE.rz*r;if(pads.some(q=>Math.hypot(q.x-x,q.z-z)<.75))continue;pads.push({x,z,s:.8+rand()*.5,yaw:rand()*7})}
        const padMesh=own(new THREE.InstancedMesh(own(new THREE.CircleGeometry(.34,10)),std({color:0x2f5a26,roughness:.7,side:THREE.DoubleSide}),pads.length));
        pads.forEach((q,i)=>{dummy.position.set(CENTRE.x+q.x,.04,CENTRE.z+q.z);dummy.rotation.set(-Math.PI/2,0,q.yaw);dummy.scale.setScalar(q.s);dummy.updateMatrix();padMesh.setMatrixAt(i,dummy.matrix)});root.add(padMesh);mark(padMesh,card('lake','Лілеї й латаття'));
        const lilyPads=pads.filter((q,i)=>i%3===0).map(q=>({x:CENTRE.x+q.x,z:CENTRE.z+q.z,s:q.s,yaw:q.yaw}));
        const lily=own(new THREE.InstancedMesh(own(new THREE.SphereGeometry(.16,10,6)),std({color:0xf4f1e6,emissive:0xf4f1e6,emissiveIntensity:.35,roughness:.6}),lilyPads.length));lily.visible=false;root.add(lily);
        state.lilies={mesh:lily,list:lilyPads};
        // Reeds along the south-east shore, where Lukash went in, and a band on the west by the bog.
        const reeds=[],rr=mulberry(61);for(let i=0;i<260;i++){const a=(i<170?-.2+rr()*1.4:2.1+rr()*1.1)+Math.PI/2,r=1+rr()*.16,x=LAKE.x+Math.cos(a)*LAKE.rx*r,z=LAKE.z+Math.sin(a)*LAKE.rz*r;reeds.push({x,z,h:1.4+rr()*1.1,tilt:(rr()-.5)*.3})}
        const reedMesh=own(new THREE.InstancedMesh(own(new THREE.ConeGeometry(.025,1,4)),std({color:0x4e5a2c,roughness:.9}),reeds.length));
        reeds.forEach((q,i)=>{dummy.position.set(CENTRE.x+q.x,q.h/2,CENTRE.z+q.z);dummy.rotation.set(q.tilt,0,q.tilt*.6);dummy.scale.set(1,q.h,1);dummy.updateMatrix();reedMesh.setMatrixAt(i,dummy.matrix)});root.add(reedMesh);
        mark(reedMesh,card('reeds','Очерет'));
        // Mist lying on the water.
        const mistMap=own(canvasTexture((c,W,H)=>{c.clearRect(0,0,W,H);const r0=mulberry(5);for(let i=0;i<60;i++){const x=r0()*W,y=r0()*H,r=20+r0()*60,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(205,215,228,.2)');g.addColorStop(1,'rgba(205,215,228,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)}},512,512));
        mistMap.wrapS=mistMap.wrapT=THREE.RepeatWrapping;
        const mist=add(own(new THREE.PlaneGeometry(LAKE.rx*2.6,LAKE.rz*2.6)),own(new THREE.MeshBasicMaterial({map:mistMap,transparent:true,opacity:.55,depthWrite:false,color:0x9aa6b8})),CENTRE.x+LAKE.x,.45,CENTRE.z+LAKE.z);mist.rotation.x=-Math.PI/2;state.mist=mist;
        // The stream, where it leaves the lake: a strip of water going west.
        const run=add(own(new THREE.PlaneGeometry(9,1)),std({color:0x0e1a20,roughness:.15,metalness:.3}),CENTRE.x-14.5,.025,CENTRE.z-23.5);run.rotation.set(-Math.PI/2,0,.25);mark(run,card('stream','Струмок'));}
      // The fallen tree, where the Forest Elder sat with his pipe, and the play lying on it. It is a seat.
      {const p=at('log'),g=new THREE.Group();g.position.set(p.x,0,p.z);g.rotation.y=-.35;root.add(g);
        const log=cyl(.32,.4,5,10,std({color:0x4a3b2c,roughness:1}),0,.34,0,g);log.rotation.z=Math.PI/2;const root0=cyl(.2,.7,.5,8,bark,2.6,.5,0,g);root0.rotation.z=Math.PI/2;
        block(p.x,p.z,4.6,1.4);
        const book=findBook?.(BOOK);
        if(book){const mesh=add(own(new THREE.BoxGeometry(.32,.44,.05)),own(bookMaterial(book)),p.x-.6,.7,p.z+.15);mesh.rotation.order='YXZ';mesh.rotation.set(-Math.PI/2+.08,-.35,0);
          mesh.userData={type:'book',book,loaded:false,forestSong:true,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:root}};interactables.push(mesh);ours.push(mesh);books.push(mesh);
          if(registerSeat){registerSeat([log],g,new THREE.Vector3(.6,1.25,.55),g.rotation.y,{title:'Завалене дерево',author:QUOTES.log,bookIds:[BOOK]});ours.push(log)}}
        if(!ours.includes(log))mark(log,card('log','Завалене дерево'))}
      // The embers of the fire, in a ring of stones.
      {const p=at('fire'),stone=std({color:0x5a5650,roughness:1});
        for(let i=0;i<9;i++){const a=i/9*Math.PI*2,s=add(own(new THREE.DodecahedronGeometry(.16,0)),stone,p.x+Math.cos(a)*.55,.08,p.z+Math.sin(a)*.55);s.scale.set(1,.6,1)}
        const embers=add(own(new THREE.CircleGeometry(.45,16)),std({color:0x2a0c04,emissive:0xff5a14,emissiveIntensity:.6,roughness:1}),p.x,.04,p.z);embers.rotation.x=-Math.PI/2;state.embers=embers;
        for(let i=0;i<4;i++){const b=cyl(.04,.05,.8,5,std({color:0x1c120c,roughness:1}),p.x+(i-1.5)*.12,.08,p.z);b.rotation.set(Math.PI/2,i*.8,0)}
        mark(embers,card('fire','Огнище'));block(p.x,p.z,1.4,1.4);}
      // The door home: blue, glazed, under a yellow fanlight, with a rushnyk hung beside it, standing among the pines.
      {const p=at('door'),g=new THREE.Group();g.position.set(p.x,0,p.z+1.2);root.add(g);
        const blue=std({color:0x1f4f9a,roughness:.6}),frame=std({color:0xe8dfc8,roughness:.7});
        const leaf=box(1.5,2.6,.12,blue,0,1.3,0,g);const pane=box(.9,1.1,.13,std({color:0xffd27a,emissive:0xffc060,emissiveIntensity:.7,roughness:.3}),0,1.85,0,g);
        for(const [w,h,x,y] of [[1.74,.12,0,2.66],[.12,2.7,-.81,1.35],[.12,2.7,.81,1.35]])box(w,h,.18,frame,x,y,0,g);
        const fan=add(own(new THREE.CircleGeometry(.75,20,0,Math.PI)),std({color:0xffc93a,emissive:0xffc93a,emissiveIntensity:.6,side:THREE.DoubleSide}),0,2.72,.02,g);
        const towel=own(canvasTexture((c,W,H)=>{c.fillStyle='#efe6d2';c.fillRect(0,0,W,H);for(let y=20;y<H;y+=70){c.fillStyle='#b3202a';for(let i=0;i<5;i++){c.fillRect(W/2-6-i*6,y+i*6,12+i*12,6)}c.fillStyle='#1c1c1c';c.fillRect(W*.2,y+34,W*.6,4)}},64,256));
        const rushnyk=add(own(new THREE.PlaneGeometry(.32,1.6)),std({map:towel,roughness:.9,side:THREE.DoubleSide}),1.12,1.7,.08,g);
        const data={type:'song-exit',title:'Блакитні двері',author:QUOTES.door,action:'RETURN'};for(const part of [leaf,pane,fan,rushnyk])mark(part,data);block(p.x,p.z+1.2,2,.5);}
      // Mavka: a pale figure in light green with loose black hair, who steps out from behind the willow when the forest has unfolded.
      {const map=own(canvasTexture((c,W,H)=>{c.clearRect(0,0,W,H);
          const glow=c.createRadialGradient(W/2,H*.45,0,W/2,H*.45,W*.5);glow.addColorStop(0,'rgba(190,255,210,.25)');glow.addColorStop(1,'rgba(190,255,210,0)');c.fillStyle=glow;c.fillRect(0,0,W,H);
          c.fillStyle='#bfe6a4';c.beginPath();c.moveTo(W*.42,H*.24);c.quadraticCurveTo(W*.3,H*.6,W*.22,H*.98);c.lineTo(W*.78,H*.98);c.quadraticCurveTo(W*.7,H*.6,W*.58,H*.24);c.fill();
          c.strokeStyle='#d6f2c2';c.lineWidth=W*.05;c.lineCap='round';c.beginPath();c.moveTo(W*.43,H*.27);c.quadraticCurveTo(W*.24,H*.3,W*.12,H*.2);c.moveTo(W*.57,H*.27);c.quadraticCurveTo(W*.76,H*.3,W*.88,H*.2);c.stroke();
          c.fillStyle='#14201a';c.beginPath();c.ellipse(W/2,H*.15,W*.12,H*.07,0,0,7);c.fill();c.beginPath();c.moveTo(W*.38,H*.15);c.quadraticCurveTo(W*.32,H*.4,W*.36,H*.62);c.lineTo(W*.42,H*.3);c.moveTo(W*.62,H*.15);c.quadraticCurveTo(W*.68,H*.4,W*.64,H*.62);c.lineTo(W*.58,H*.3);c.fill();
          c.fillStyle='#e8efe2';c.beginPath();c.ellipse(W/2,H*.165,W*.075,H*.05,0,0,7);c.fill()},128,256));
        const mavka=new THREE.Sprite(own(new THREE.SpriteMaterial({map,transparent:true,opacity:0,depthWrite:false})));mavka.scale.set(1,2,1);const w=at('willow');mavka.position.set(w.x+1.8,1.02,w.z+1.6);mavka.visible=false;root.add(mavka);
        // Sprites cannot be picked, so a clear pane stands where she does; it answers only while she is here.
        const hit=add(own(new THREE.PlaneGeometry(.8,1.9)),own(new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide})),mavka.position.x,mavka.position.y,mavka.position.z);hit.userData=card('mavka','Мавка');
        state.mavka=mavka;state.mavkaHit=hit;state.mavkaHome=mavka.position.clone();}
    }

    // ---------- the air ----------
    function buildAir(){
      const moon=add(own(new THREE.CircleGeometry(3.6,32)),own(new THREE.MeshBasicMaterial({color:0xeef0f6,fog:false})),CENTRE.x-20,54,CENTRE.z-44);moon.lookAt(CENTRE.x,0,CENTRE.z);
      const halo=own(canvasTexture((c,W,H)=>{const g=c.createRadialGradient(W/2,H/2,0,W/2,H/2,W/2);g.addColorStop(0,'rgba(215,228,255,.5)');g.addColorStop(1,'rgba(215,228,255,0)');c.fillStyle=g;c.fillRect(0,0,W,H)},128,128));
      const haloSprite=new THREE.Sprite(own(new THREE.SpriteMaterial({map:halo,fog:false,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending})));haloSprite.scale.set(24,24,1);haloSprite.position.copy(moon.position);root.add(haloSprite);
      // Fireflies over the glade; a dozen of them make Mavka's wreath when she is here.
      const N=90,positions=new Float32Array(N*3),rand=mulberry(73),homes=[];
      for(let i=0;i<N;i++){const a=rand()*Math.PI*2,r=Math.sqrt(rand())*16;homes.push({x:CENTRE.x+Math.cos(a)*r,y:.5+rand()*2.2,z:CENTRE.z-4+Math.sin(a)*r,phase:rand()*7})}
      const geometry=own(new THREE.BufferGeometry());geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
      const dot=own(canvasTexture((c,W,H)=>{const g=c.createRadialGradient(W/2,H/2,0,W/2,H/2,W/2);g.addColorStop(0,'rgba(240,255,200,1)');g.addColorStop(.3,'rgba(200,255,140,.6)');g.addColorStop(1,'rgba(160,255,120,0)');c.fillStyle=g;c.fillRect(0,0,W,H)},32,32));
      const flies=new THREE.Points(geometry,own(new THREE.PointsMaterial({map:dot,size:.22,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,color:0xd8ff9a})));root.add(flies);
      state.fireflies={flies,positions,homes,geometry};
    }

    // ---------- building and freeing ----------
    function build(){
      if(root)return;root=new THREE.Group();root.name='forest-song';state={bloom:.15,target:.15,applied:-1,mavkaAt:0,mavkaUntil:0,swaying:0,playingUntil:0};
      buildGround();buildPlaces();buildTrees();buildAir();applyBloom(state.bloom);scene.add(root);
    }
    function unload(){
      if(!root)return;root.removeFromParent();root=null;state=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0;trunks.length=0;
    }
    function activate(){build();lastNeeded=time}

    // ---------- walking ----------
    function contains(x,z){return Math.hypot(x-CENTRE.x,z-CENTRE.z)<WALK+1.5}
    function floorAt(x,z){return contains(x,z)?0:null}
    function allowed(x,z){
      const r=player.radius||.42,lx=x-CENTRE.x,lz=z-CENTRE.z;if(Math.hypot(lx,lz)>WALK-r)return false;
      if(inLake(lx,lz,r+.3))return false;
      if(blockers.some(b=>x+r>b.minX&&x-r<b.maxX&&z+r>b.minZ&&z-r<b.maxZ))return false;
      return !trunks.some(t=>Math.abs(t.x-x)<2.5&&Math.abs(t.z-z)<2.5&&Math.hypot(t.x-x,t.z-z)<t.r+r);
    }

    // ---------- doing things ----------
    function enter(from='link'){
      activate();move(ARRIVAL.x,ARRIVAL.z,ARRIVAL.yaw);
      showNotice((from==='sopilka'?'Ви граєте на сопілці, і читальня зникає. ':from==='book'?'Сторінка відкривається, як галява. ':'')+
        'Лісова пісня: старий ліс на Волині, весняна ніч, галява з березою й дубом, а за нею озеро в тумані. Біля дуба лежить сопілка. ('+
        (from==='sopilka'?'You play the pipe, and the reading room is gone. ':from==='book'?'The page opens like a glade. ':'')+
        'The Forest Song: an old forest in Volyn on a spring night, a glade with a birch and an oak, and a misty lake beyond. A pipe lies by the oak.)',13);
      analytics?.track('Room Explored',{room:'forest-song'});
    }
    function leave(){if(toRoom)toRoom();playSample?.('doorOpen',.6,1.05)}
    // Lukash's tune on the pipe, through the library's synthesiser; returns how long it lasts.
    function playTune(){if(!tone)return 0;const beat=.36;let at=0;for(const [freq,beats] of TUNE){tone(freq,at,beats*beat+.18,.06,'flute');at+=beats*beat}return at}
    function play(){
      if(!state)return;if(time<state.playingUntil){showNotice('Сопілка ще грає. (The pipe is still playing.)',3);return}
      state.playingUntil=time+Math.max(4,playTune());
      if(state.mavkaAt&&time<state.mavkaUntil){state.swaying=1;state.mavkaUntil=time+60;showNotice(QUOTES.song,12);analytics?.track('Secret Found',{secret:'forest-song-mavka-song'});return}
      if(state.target<1){state.target=1;state.bloomAt=time;state.bloomFrom=state.bloom;showNotice(QUOTES.bloom,12);return}
      showNotice(QUOTES.sopilka,10);
    }
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('song-'))return false;
      if(data.type==='song-pipe'){play();return true}
      if(data.type==='song-exit'){leave();return true}
      if(data.type==='song-card'){showNotice(`${data.title}: ${data.author}`,data.author.length>180?14:10);return true}
      return false;
    }
    // A book picked up here shows its note (game.js does that); the count is only for the play itself.
    function noteFound(){return null}

    // ---------- each frame ----------
    function update(t,dt=0){
      time=t;const {x,z}=player.pos,inside=contains(x,z);if(inside)activate();
      if(!root)return;
      if(!inside&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==root)){unload();return}
      if(inside){scene.background.setRGB(.008,.012,.024);scene.fog.color.setRGB(.012,.018,.028);scene.fog.density=.038;if(ambient)ambient.intensity*=.45;if(moonlight)moonlight.intensity*=.75}
      const still=isReducedMotion()?0:1;
      // The forest unfolds while the pipe plays, over about eight seconds.
      if(state.bloom<state.target){state.bloom=Math.min(state.target,state.bloomFrom+(t-state.bloomAt)*.11);if(Math.abs(state.bloom-state.applied)>.01||state.bloom===state.target)applyBloom(state.bloom)}
      // When it has, Mavka steps out from behind the willow, once a visit.
      if(state.bloom>=.99&&!state.mavkaAt){state.mavkaAt=t;state.mavkaUntil=t+60;state.mavka.visible=true;showNotice(QUOTES.awake,10);
        if(!interactables.includes(state.mavkaHit)){interactables.push(state.mavkaHit);ours.push(state.mavkaHit)}
        const first=!met();try{storage?.setItem(MET_KEY,'1')}catch(e){}if(first)analytics?.track('Secret Found',{secret:'forest-song-mavka'})}
      const m=state.mavka;
      if(state.mavkaAt){const shown=t<state.mavkaUntil,o=m.material.opacity,goal=shown?.88:0;m.material.opacity=o+(goal-o)*Math.min(1,dt*.8);m.visible=m.material.opacity>.01;
        state.swaying=Math.max(0,state.swaying-dt*.08);m.position.x=state.mavkaHome.x+Math.sin(t*.8)*.06*still+Math.sin(t*1.6)*.25*state.swaying*still;m.position.y=state.mavkaHome.y+Math.sin(t*.6)*.03*still;state.mavkaHit.position.x=m.position.x;
        if(!m.visible){const i=interactables.indexOf(state.mavkaHit);if(i>=0)interactables.splice(i,1)}}
      if(state.embers)state.embers.material.emissiveIntensity=.55+(.12*Math.sin(t*3.1)+.08*Math.sin(t*7.3))*still;
      if(state.pipeGlint)state.pipeGlint.material.emissiveIntensity=t<state.playingUntil?2:.9+.3*Math.sin(t*1.7);
      if(state.mist?.material.map)state.mist.material.map.offset.set(t*.004*still,t*.002*still);
      // Fireflies wander; while Mavka is here, the first twelve circle her head as her wreath.
      const {flies,positions,homes,geometry}=state.fireflies,wreath=m.visible&&m.material.opacity>.3;
      homes.forEach((h,i)=>{let px,py,pz;
        if(wreath&&i<12){const a=i/12*Math.PI*2+t*.4*still;px=m.position.x+Math.cos(a)*.24;py=m.position.y+.72;pz=m.position.z+Math.sin(a)*.24}
        else{px=h.x+Math.sin(t*.23*still+h.phase)*1.6;py=h.y+Math.sin(t*.7*still+h.phase*2)*.35;pz=h.z+Math.cos(t*.19*still+h.phase)*1.6}
        positions[i*3]+=(px-positions[i*3])*Math.min(1,dt*2);positions[i*3+1]+=(py-positions[i*3+1])*Math.min(1,dt*2);positions[i*3+2]+=(pz-positions[i*3+2])*Math.min(1,dt*2)});
      geometry.attributes.position.needsUpdate=true;flies.material.opacity=.75+.25*Math.sin(t*2.2);
    }

    return {contains,floorAt,allowed,interact,update,enter,leave,unload,noteFound,play,zoneAt:(x,z)=>contains(x,z)?'forest-song':null,
      centre:CENTRE,walk:WALK,spots:SPOTS,lake:LAKE,quotes:QUOTES,arrival:ARRIVAL,book:BOOK,tune:TUNE,
      get built(){return !!root},get books(){return books.slice()},get trees(){return state?.trees||null},get bloom(){return state?.bloom??null},
      get mavkaHere(){return !!(state?.mavkaAt&&time<state.mavkaUntil)},get met(){return met()}};
  };
})();
