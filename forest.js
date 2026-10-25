// The Deep Wood: a forest at night, out through the window in the Garden Room's west wall, or into the woodcut in the
// Grimms' Fairy Tales (a button in the reader, for that book alone). Eerie, not frightening: moonlight, mist, owls,
// will-o'-the-wisps, and the places of the tales standing in their clearings: the house built of bread with windows of
// clear sugar, Rapunzel's tower, the cool spring where the golden ball fell, Grandmother's house under the three large
// oak-trees, the hedge of thorns round Briar Rose's palace, and, further from the Grimms, Baba Yaga's hut turning on
// its hen's legs and the great fir of the Little Glass Man. The books are found, not shelved: on a sill, in a basket,
// caught in the thorns. The eerie wood's books, for older readers, lie among the roots of the old oak at its heart.
// Hansel's white pebbles shine in the moonlight and lead back to the window; the crumbs on the other path have been
// eaten by the birds. Every quotation is from the library's own Grimm (book 2591), checked by a test.
//
// Nothing is built until the reader goes in, and it is all freed a while after they leave. It adds no lights: the
// library's moonlight and the reader's own lantern light it, the wisps glow through their own colour, and the trees
// are two InstancedMeshes, so the whole wood costs a handful of draw calls.
(function(){
  'use strict';

  // Far from everything else: Mars is at x 620, z 120, the Lost Property Office at x 500, z 220.
  const CENTRE={x:800,z:400},WALK=40,EDGE=62,KEEP=25;
  // Places in the wood, relative to its centre (yaw 0 faces north, -z).
  const SPOTS={
    window:{x:0,z:35,r:4},cross:{x:0,z:16,r:3.5},hub:{x:0,z:0,r:4},
    spring:{x:15,z:19,r:4.5},basket:{x:-11,z:17,r:2},granny:{x:-23,z:21,r:6.5},
    cottage:{x:-23,z:-5,r:6},hut:{x:-25,z:-23,r:5},oak:{x:-5,z:-21,r:6},
    hedge:{x:6,z:-33,r:6},tower:{x:23,z:-10,r:5},fir:{x:30,z:9,r:4.5}
  };
  // The paths, as chains of places; the first is the way home, which Hansel's pebbles follow.
  const PATHS=[['hub','cross','window'],['cross','basket','granny'],['cross','spring'],['hub','cottage','hut'],['hub','oak','hedge'],['hub','tower','fir']];
  // Where the crumbs run out: off the cottage path to the west, into nothing.
  const CRUMBS={from:{x:-26,z:-2},to:{x:-37,z:6}};
  // Which book is found where (data/new-books.js, rooms forest-tales and forest-eerie).
  const PLACES={52521:'cottage',540:'hedge',7277:'hedge',5615:'hedge',29021:'basket',49724:'granny',76322:'spring',8933:'tower',62509:'hut',45606:'fir'};
  const QUOTES={
    pebbles:'“Hansel took his little sister by the hand, and followed the pebbles which shone like newly-coined silver pieces, and showed them the way.” (Hansel and Gretel)',
    crumbs:'“They found no crumbs, for the many thousands of birds which fly about in the woods and fields had picked them all up.” (Hansel and Gretel)',
    cottage:'“They saw that it was built of bread and covered with cakes, but that the windows were of clear sugar.” (Hansel and Gretel) Nobody is at home, and the oven is cold.',
    tower:'“A tower, which lay in a forest, and had neither stairs nor door, but quite at the top was a little window.” (Rapunzel)',
    braid:'You call up: “Rapunzel, Rapunzel, / Let down your hair to me.” Nobody answers, but the braid stirs, as if someone at the window had moved.',
    spring:'“When she came to a cool spring of water, that rose in the midst of it, she sat herself down to rest a while. Now she had a golden ball in her hand.” (The Frog-Prince) The ball is here, on the stones. So is the frog.',
    granny:'“Her house stands under the three large oak-trees, the nut-trees are just below; you surely must know it.” (Little Red-Cap) The door is on the latch.',
    basket:'“Here is a piece of cake and a bottle of wine; take them to your grandmother.” (Little Red-Cap) Someone has set the basket down and gone off the path.',
    hedge:'“A large hedge of thorns soon grew round the palace, and every year it became higher and thicker.” (Briar Rose) Somewhere behind it, everyone is asleep.',
    hut:'A hut on hen’s legs, turning slowly in its clearing, as Baba Yaga’s does in the Russian tales. It has its back to you. It always has its back to you.',
    fir:'The greatest fir in the wood. In Wilhelm Hauff’s tale of the Black Forest, the Little Glass Man, the good spirit of the pines, shows himself only to those born on a Sunday between eleven and two.',
    oak:'The oldest tree in the wood, hollow at the heart, with books among its roots: the wood at its darkest, for older readers. A raven sits above them and watches you read the titles.',
    ring:'A ring of pale toadstools. In the old belief, step inside a fairy ring and you may dance with the fair folk for what feels like a night, and come out a hundred years later.',
    post:'A fingerpost, leaning. Its arms say GRANDMOTHER’S, THE SPRING, DEEPER IN, and, pointing back the way you came, THE WINDOW.',
    window:'The window you climbed through, standing on its own among the trees, with the Garden Room’s lamplight behind the glass.'
  };
  const mulberry=seed=>()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296};

  window.createForest=function(options){
    const {THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,arrivals={},showNotice,playSample,sound,move,analytics,toGarden=null,isHolding=()=>false,isReducedMotion=()=>false,storage=window.localStorage,
      garden={cx:145,cz:46,w:20,d:16}}=options;
    const FOUND_KEY='athenaeum-forest-found';
    // The window in the Garden Room's west wall, and where the reader stands on coming back through it.
    const GARDEN_WINDOW={x:garden.cx-garden.w/2+.27,z:garden.cz,yaw:Math.PI/2};
    const GARDEN_SPOT={x:GARDEN_WINDOW.x+1.9,z:GARDEN_WINDOW.z,yaw:-Math.PI/2};
    const ARRIVAL={x:CENTRE.x+SPOTS.window.x,z:CENTRE.z+SPOTS.window.z-3,yaw:0};
    let root=null,time=0,lastNeeded=-1e9,state=null,gardenWindow=null,foundCache=null;
    const owned=[],ours=[],books=[],blockers=[],trunks=[];
    const own=thing=>{owned.push(thing);return thing};
    const std=params=>own(new THREE.MeshStandardMaterial(params));
    const at=key=>({x:CENTRE.x+SPOTS[key].x,z:CENTRE.z+SPOTS[key].z});
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    const cyl=(rt,rb,h,seg,material,x,y,z,parent)=>add(own(new THREE.CylinderGeometry(rt,rb,h,seg)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    const card=(key,title,action='LOOK')=>({type:'forest-card',key,title,author:QUOTES[key],action});
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const found=()=>{try{return new Set(JSON.parse(storage?.getItem(FOUND_KEY)||'[]'))}catch(e){return new Set()}};

    // The books: those listed for each room in data/new-books.js, placed where PLACES says (the eerie ones at the oak).
    const shelf=room=>(arrivals[room]||[]).map(id=>findBook(id)).filter(Boolean);
    function catalogue(){return {tales:shelf('tales'),eerie:shelf('eerie')}}

    // ---------- geometry helpers ----------
    // Several geometries joined into one, each painted a single colour, so a whole tree is one instance of one mesh.
    function joined(parts){
      const positions=[],normals=[],colours=[],colour=new THREE.Color();
      for(const [geometry,hex,matrix] of parts){const g=geometry.index?geometry.toNonIndexed():geometry;if(matrix)g.applyMatrix4(matrix);g.computeVertexNormals();colour.setHex(hex);
        const p=g.attributes.position,n=g.attributes.normal;for(let i=0;i<p.count;i++){positions.push(p.getX(i),p.getY(i),p.getZ(i));normals.push(n.getX(i),n.getY(i),n.getZ(i));colours.push(colour.r,colour.g,colour.b)}
        g.dispose();if(g!==geometry)geometry.dispose()}
      const out=new THREE.BufferGeometry();out.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));out.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));out.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));return own(out);
    }
    const placed=(x,y,z,rx=0,ry=0,rz=0,s=1)=>new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)),new THREE.Vector3(s,s,s));
    // A fir: a dark trunk and three tiers of needles, 1 m to the scale.
    function firGeometry(){return joined([[new THREE.CylinderGeometry(.025,.05,1,7),0x2e2219,placed(0,.5,0)],[new THREE.ConeGeometry(.3,.42,9),0x16261c,placed(0,.46,0)],[new THREE.ConeGeometry(.23,.36,9),0x1a2d20,placed(0,.67,0)],[new THREE.ConeGeometry(.15,.3,9),0x1d3324,placed(0,.86,0)]])}
    // A bare old tree: a leaning trunk and crooked upward branches, grey with lichen.
    function bareGeometry(){const parts=[[new THREE.CylinderGeometry(.03,.055,.62,7),0x3a352e,placed(0,.31,0,0,0,.04)]];
      for(const [y,yaw,tilt,len] of [[.5,0,.8,.34],[.56,2.2,.7,.3],[.6,4.1,.9,.28],[.42,1.1,1.05,.26],[.62,3.2,.45,.22]])parts.push([new THREE.CylinderGeometry(.012,.028,len,5),0x423b32,new THREE.Matrix4().makeRotationY(yaw).multiply(placed(Math.sin(tilt)*len/2,y+Math.cos(tilt)*len/2,0,0,0,-tilt))]);
      return joined(parts)}
    function nearPath(x,z,distance){
      for(const chain of PATHS)for(let i=0;i<chain.length-1;i++){const a=SPOTS[chain[i]],b=SPOTS[chain[i+1]],dx=b.x-a.x,dz=b.z-a.z,l=dx*dx+dz*dz,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/l));if(Math.hypot(x-a.x-t*dx,z-a.z-t*dz)<distance)return true}
      return false;
    }
    function inClearing(x,z,pad=0){for(const key in SPOTS){const s=SPOTS[key];if(Math.hypot(x-s.x,z-s.z)<s.r+pad)return true}return false}

    // ---------- the ground ----------
    // One texture over the whole wood: moss and leaf litter, the paths worn paler, and the clearings open.
    function buildGround(){
      const size=EDGE+12,map=own(canvasTexture((c,W,H)=>{const k=W/(size*2),px=x=>(x+size)*k,pz=z=>(z+size)*k,rand=mulberry(7);
        c.fillStyle='#1c2117';c.fillRect(0,0,W,H);
        for(let i=0;i<9000;i++){c.fillStyle=['#232a1c','#181d14','#2a2a1c','#2c2418','#1f2619'][i%5];const r=1+rand()*3;c.fillRect(rand()*W,rand()*H,r,r)}
        c.lineCap='round';c.lineJoin='round';
        for(const key in SPOTS){const s=SPOTS[key],g=c.createRadialGradient(px(s.x),pz(s.z),0,px(s.x),pz(s.z),s.r*k);g.addColorStop(0,'rgba(74,66,46,.55)');g.addColorStop(1,'rgba(74,66,46,0)');c.fillStyle=g;c.beginPath();c.arc(px(s.x),pz(s.z),s.r*k,0,7);c.fill()}
        for(const [width,colour] of [[2.6,'rgba(70,58,40,.7)'],[1.5,'rgba(96,80,56,.75)']])for(const chain of PATHS){c.strokeStyle=colour;c.lineWidth=width*k;c.beginPath();chain.forEach((key,i)=>{const s=SPOTS[key];i?c.lineTo(px(s.x),pz(s.z)):c.moveTo(px(s.x),pz(s.z))});c.stroke()}
        c.strokeStyle='rgba(70,58,40,.45)';c.lineWidth=1.2*k;c.beginPath();c.moveTo(px(CRUMBS.from.x),pz(CRUMBS.from.z));c.lineTo(px(CRUMBS.to.x),pz(CRUMBS.to.z));c.stroke();
        // Fallen needles and leaves over everything, paths included.
        for(let i=0;i<5000;i++){c.fillStyle=['rgba(120,84,40,.35)','rgba(60,72,40,.4)','rgba(20,24,16,.5)'][i%3];c.fillRect(rand()*W,rand()*H,1.5,1.5)}
      },1024,1024));
      const ground=add(own(new THREE.CircleGeometry(size,48)),std({map,roughness:1,color:0xa8b0a0}),CENTRE.x,0,CENTRE.z,root);ground.rotation.x=-Math.PI/2;
    }

    // ---------- the trees ----------
    function buildTrees(){
      const rand=mulberry(31),firs=[],bare=[];
      for(let tries=0;tries<9000&&firs.length+bare.length<520;tries++){
        const a=rand()*Math.PI*2,r=Math.sqrt(rand())*EDGE,x=Math.cos(a)*r,z=Math.sin(a)*r;
        if(inClearing(x,z,1.2)||nearPath(x,z,2.1)||Math.hypot(x-CRUMBS.to.x,z-CRUMBS.to.z)<2.5)continue;
        if([...firs,...bare].some(t=>Math.hypot(t.x-x,t.z-z)<(r>WALK?1.6:2.3)))continue;
        (rand()<.24?bare:firs).push({x,z,s:(r>WALK?9:7)+rand()*7,yaw:rand()*Math.PI*2,lean:(rand()-.5)*.08});
      }
      const firMaterial=std({vertexColors:true,roughness:.95}),bareMaterial=std({vertexColors:true,roughness:1});
      for(const [list,geometry,material,name,radius] of [[firs,firGeometry(),firMaterial,'forest-firs',.5],[bare,bareGeometry(),bareMaterial,'forest-bare-trees',.45]]){
        const mesh=new THREE.InstancedMesh(geometry,material,list.length);mesh.name=name;const o=new THREE.Object3D();
        list.forEach((t,i)=>{o.position.set(CENTRE.x+t.x,0,CENTRE.z+t.z);o.rotation.set(t.lean,t.yaw,0);o.scale.set(t.s*(name==='forest-firs'?.9:1.1),t.s,t.s*(name==='forest-firs'?.9:1.1));o.updateMatrix();mesh.setMatrixAt(i,o.matrix);
          if(Math.hypot(t.x,t.z)<WALK+1)trunks.push({x:CENTRE.x+t.x,z:CENTRE.z+t.z,r:radius*t.s/10+.15})});
        mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere?.();root.add(mesh);
      }
      state.trees={firs:firs.length,bare:bare.length};
    }

    // ---------- the places of the tales ----------
    function standingBook(book,x,y,z,yaw,tilt,shelfKey){
      const mesh=add(own(new THREE.BoxGeometry(.42,.58,.06)),own(bookMaterial(book)),x,y,z,root);mesh.rotation.order='YXZ';mesh.rotation.y=yaw;mesh.rotation.x=tilt;
      mesh.userData={type:'book',book,loaded:false,forest:true,shelf:shelfKey,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:root}};
      interactables.push(mesh);ours.push(mesh);books.push(mesh);return mesh;
    }
    function label(text,w,h){return own(canvasTexture((c,W,H)=>{c.fillStyle='#3b2e20';c.fillRect(0,0,W,H);c.strokeStyle='#1c140c';c.lineWidth=5;c.strokeRect(3,3,W-6,H-6);c.fillStyle='#e9dcc0';c.textAlign='center';c.font=`bold ${Math.round(H*.5)}px Georgia`;c.fillText(text,W/2,H*.68)},w,h))}
    function buildPlaces(){
      const bark=std({color:0x3a2c20,roughness:1}),stone=std({color:0x6c6a62,roughness:1}),dark=std({color:0x1e1914,roughness:1}),thatch=std({color:0x5a4a2c,roughness:1});
      const {tales,eerie}=catalogue(),byPlace={};
      for(const book of tales)(byPlace[PLACES[book.id]||'hub']||(byPlace[PLACES[book.id]||'hub']=[])).push(book);
      const P=key=>at(key);

      // The window home: its frame standing alone among the trees, lamplight behind the glass.
      {const p=P('window'),g=new THREE.Group();g.position.set(p.x,0,p.z);root.add(g);
        const lamp=own(canvasTexture((c,W,H)=>{const grad=c.createLinearGradient(0,0,0,H);grad.addColorStop(0,'#f4c27a');grad.addColorStop(1,'#a8682e');c.fillStyle=grad;c.fillRect(0,0,W,H);
          c.fillStyle='rgba(40,60,36,.55)';for(let i=0;i<6;i++){c.beginPath();c.arc(20+i*44,H-10,18+i%3*6,0,7);c.fill()}c.fillStyle='rgba(60,36,20,.5)';c.fillRect(W*.3,H*.25,W*.4,H*.08)},256,384));
        const glass=add(own(new THREE.PlaneGeometry(1.5,2.3)),own(new THREE.MeshBasicMaterial({map:lamp,side:THREE.DoubleSide})),0,2.15,0,g);
        const frame=std({color:0xd9d0bd,roughness:.6});
        for(const [w,h,x,y] of [[1.74,.12,0,3.36],[1.74,.12,0,.94],[.12,2.5,-.81,2.15],[.12,2.5,.81,2.15],[1.5,.05,0,2.15],[.05,2.3,0,2.15]])box(w,h,.1,frame,x,y,0,g);
        const sill=box(1.9,.08,.36,frame,0,.9,.05,g);
        const data={type:'forest-exit',title:'The window back to the Garden Room',author:QUOTES.window,action:'CLIMB BACK'};mark(glass,data);mark(sill,data);block(p.x,p.z,2,.6);
        state.window=g;
      }
      // The fingerpost at the crossroads.
      {const p=P('cross'),g=new THREE.Group();g.position.set(p.x+1.6,0,p.z);g.rotation.z=.05;root.add(g);const post=box(.12,2.6,.12,bark,0,1.3,0,g);
        for(const [text,yaw,y] of [['GRANDMOTHER’S',Math.PI,2.3],['THE SPRING',0,2.05],['DEEPER IN',-Math.PI/2,2.5],['THE WINDOW',Math.PI/2,1.8]]){
          const arm=add(own(new THREE.BoxGeometry(1.1,.2,.04)),std({map:label(text,320,58),roughness:.9}),Math.cos(yaw)*.55,y,-Math.sin(yaw)*.55,g);arm.rotation.y=yaw;mark(arm,card('post','A fingerpost'))}
        mark(post,card('post','A fingerpost'));block(p.x+1.6,p.z,.4,.4);
      }
      // Hansel's pebbles, from the middle of the wood back to the window, and the crumbs that lead nowhere.
      {const pebbles=[],rand=mulberry(3);const chain=PATHS[0];
        for(let i=0;i<chain.length-1;i++){const a=SPOTS[chain[i]],b=SPOTS[chain[i+1]],n=Math.round(Math.hypot(b.x-a.x,b.z-a.z)/.9);for(let k=0;k<n;k++){const t=k/n;pebbles.push([a.x+(b.x-a.x)*t+(rand()-.5)*.9,a.z+(b.z-a.z)*t+(rand()-.5)*.9,.05+rand()*.04])}}
        const shine=own(new THREE.MeshStandardMaterial({color:0xe8eef4,emissive:0xb8c8e0,emissiveIntensity:.55,roughness:.4}));
        const mesh=new THREE.InstancedMesh(own(new THREE.SphereGeometry(1,8,6)),shine,pebbles.length);mesh.name='forest-pebbles';const o=new THREE.Object3D();
        pebbles.forEach(([x,z,s],i)=>{o.position.set(CENTRE.x+x,s*.5,CENTRE.z+z);o.scale.set(s*1.3,s*.7,s);o.rotation.set(0,rand()*3,0);o.updateMatrix();mesh.setMatrixAt(i,o.matrix)});
        mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere?.();root.add(mesh);mark(mesh,card('pebbles','White pebbles'));state.pebbles=shine;
        const crumbs=new THREE.InstancedMesh(own(new THREE.BoxGeometry(.05,.03,.04)),std({color:0xb08850,roughness:.9}),9);
        for(let i=0;i<9;i++){const t=i/12;o.position.set(CENTRE.x+CRUMBS.from.x+(CRUMBS.to.x-CRUMBS.from.x)*t,.02,CENTRE.z+CRUMBS.from.z+(CRUMBS.to.z-CRUMBS.from.z)*t);o.scale.setScalar(1.6);o.updateMatrix();crumbs.setMatrixAt(i,o.matrix)}
        crumbs.instanceMatrix.needsUpdate=true;crumbs.computeBoundingSphere?.();root.add(crumbs);mark(crumbs,card('crumbs','Crumbs of bread'));
        // A bird or two at the end of the crumbs, black, still, watching.
        for(const [dx,dz] of [[0,0],[.5,.3]]){const b=add(own(new THREE.SphereGeometry(.09,8,6)),dark,CENTRE.x+CRUMBS.to.x+dx,.1,CENTRE.z+CRUMBS.to.z+dz,root);b.scale.set(1,.8,1.5);add(own(new THREE.ConeGeometry(.025,.07,5)),std({color:0x8a6a20}),CENTRE.x+CRUMBS.to.x+dx,.13,CENTRE.z+CRUMBS.to.z+dz-.16,root).rotation.x=-Math.PI/2;mark(b,card('crumbs','A bird'))}
      }
      // The house built of bread, covered with cakes, with windows of clear sugar.
      {const p=P('cottage'),g=new THREE.Group();g.position.set(p.x,0,p.z);g.rotation.y=-Math.PI/2.6;root.add(g);
        const bread=std({map:own(canvasTexture((c,W,H)=>{c.fillStyle='#9a6431';c.fillRect(0,0,W,H);for(let i=0;i<400;i++){c.fillStyle=i%2?'rgba(70,40,16,.35)':'rgba(200,150,90,.25)';c.beginPath();c.arc(Math.random()*W,Math.random()*H,1+Math.random()*2.5,0,7);c.fill()}},128,128)),roughness:.85});
        const walls=box(4,2.4,3.4,bread,0,1.2,0,g);
        const roof=std({map:own(canvasTexture((c,W,H)=>{c.fillStyle='#6b3a1c';c.fillRect(0,0,W,H);for(let y=0;y<H;y+=32)for(let x=(y/32%2)*16;x<W;x+=32){c.fillStyle=['#c9675a','#e8d2a8','#7a3e1e','#d99a4c'][(x+y)/16%4|0];c.beginPath();c.arc(x+16,y+16,11,0,7);c.fill()}
          c.fillStyle='#f6f0e6';for(let x=0;x<W;x+=16){c.beginPath();c.arc(x+8,H-6,8,0,Math.PI);c.fill()}},256,128)),roughness:.8});
        for(const side of [-1,1]){const half=box(4.6,.16,2.25,roof,0,2.95,side*.92,g);half.rotation.x=side*.72}
        box(.2,3.4,3.42,bread,-2.02,1.7,0,g);box(.2,3.4,3.42,bread,2.02,1.7,0,g);
        const sugar=std({color:0xd8f0f8,emissive:0xffcf88,emissiveIntensity:.35,transparent:true,opacity:.75,roughness:.1});
        for(const x of [-1,1])box(.8,.7,.05,sugar,x*1.1,1.5,1.72,g);
        box(.9,1.7,.06,std({color:0x5a2e14,roughness:.8}),0,.85,1.72,g);
        void walls;for(const child of g.children)if(!child.userData.type)mark(child,card('cottage','A house built of bread'));
        // The oven at the side, cold.
        const oven=box(1.3,1.1,1.1,stone,2.8,.55,-.6,g);add(own(new THREE.CircleGeometry(.3,12,0,Math.PI)),dark,3.46,.35,-.6,g).rotation.y=Math.PI/2;mark(oven,card('cottage','The oven'));
        block(p.x,p.z,5.6,5.6);
        g.updateMatrixWorld(true);const sill=new THREE.Vector3(-1.1,1.12,1.9).applyMatrix4(g.matrixWorld);
        (byPlace.cottage||[]).forEach((book,i)=>standingBook(book,sill.x+i*.5,sill.y+.29,sill.z,g.rotation.y,-.2,'tales'));
      }
      // Rapunzel's tower: no stairs, no door, a little window at the top, and a golden braid down to the ground.
      {const p=P('tower'),g=new THREE.Group();g.position.set(p.x,0,p.z);root.add(g);
        const masonry=std({map:own(canvasTexture((c,W,H)=>{c.fillStyle='#5f5b52';c.fillRect(0,0,W,H);c.strokeStyle='#3c3a34';c.lineWidth=2;for(let y=0;y<H;y+=16){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke();for(let x=(y/16%2)*20;x<W;x+=40){c.beginPath();c.moveTo(x,y);c.lineTo(x,y+16);c.stroke()}}},256,256)),roughness:1});
        masonry.map.wrapS=masonry.map.wrapT=THREE.RepeatWrapping;masonry.map.repeat?.set?.(3,6);
        const shaft=cyl(1.7,1.9,15,16,masonry,0,7.5,0,g);const cap=add(own(new THREE.ConeGeometry(2.2,3.2,16)),std({color:0x2e2a3a,roughness:.9}),0,16.6,0,g);
        const win=box(.6,.9,.1,std({color:0x2a1a0c,emissive:0xffbf66,emissiveIntensity:1.2}),0,13.6,1.72,g);
        const braidMat=std({color:0xd8a83c,emissive:0x5a3a08,emissiveIntensity:.5,roughness:.6});const braid=new THREE.Group();braid.position.set(0,13.2,1.95);g.add(braid);
        for(let i=0;i<26;i++){const k=add(own(new THREE.SphereGeometry(.09,7,5)),braidMat,(i%2?.03:-.03),-i*.5,0,braid);k.scale.set(1,2.4,1);mark(k,card('braid','A golden braid','CALL UP'))}
        mark(shaft,card('tower','A tower in the wood'));mark(cap,card('tower','A tower in the wood'));mark(win,card('braid','A little window','CALL UP'));
        block(p.x,p.z,4,4);state.braid=braid;
        (byPlace.tower||[]).forEach((book,i)=>standingBook(book,p.x-.9+i*.5,.29,p.z+2.3,0,-.3,'tales'));
      }
      // The cool spring, the golden ball on its stones, and the frog.
      {const p=P('spring'),g=new THREE.Group();g.position.set(p.x,0,p.z);root.add(g);
        const water=add(own(new THREE.CircleGeometry(1.5,24)),std({color:0x0d1a20,metalness:.6,roughness:.08,emissive:0x0a1c26,emissiveIntensity:.5}),0,.04,0,g);water.rotation.x=-Math.PI/2;
        for(let i=0;i<14;i++){const a=i/14*Math.PI*2,s=add(own(new THREE.DodecahedronGeometry(.32,0)),stone,Math.cos(a)*1.7,.15,Math.sin(a)*1.7,g);s.scale.set(1,.55,1);s.rotation.y=a}
        const ball=add(own(new THREE.SphereGeometry(.13,16,12)),std({color:0xe8b830,metalness:.8,roughness:.25,emissive:0x4a3000,emissiveIntensity:.4}),1.45,.42,.6,g);
        const frog=new THREE.Group();frog.position.set(-1.6,.34,.4);frog.rotation.y=1.2;g.add(frog);const skin=std({color:0x4e6a2a,roughness:.6});
        const body=add(own(new THREE.SphereGeometry(.14,10,8)),skin,0,0,0,frog);body.scale.set(1,.6,1.2);for(const x of [-.07,.07])add(own(new THREE.SphereGeometry(.035,8,6)),std({color:0xd8c860,roughness:.3}),x,.07,-.1,frog);
        for(const part of [water,ball,body])mark(part,card('spring','A cool spring'));block(p.x,p.z,3.8,3.8);state.frog=frog;
        (byPlace.spring||[]).forEach((book,i)=>standingBook(book,p.x+.2+i*.5,.42,p.z+2.2,Math.PI,-.4,'tales'));
      }
      // Grandmother's house under the three large oak-trees, with the nut-trees below.
      {const p=P('granny'),g=new THREE.Group();g.position.set(p.x,0,p.z);g.rotation.y=Math.PI*.55;root.add(g);
        const lime=std({color:0xb8b0a0,roughness:1});const house=box(3.6,2.3,3,lime,0,1.15,0,g);
        for(const side of [-1,1]){const half=box(4,.3,2.1,thatch,0,2.75,side*.85,g);half.rotation.x=side*.75}
        const door=box(.85,1.75,.06,std({color:0x40301e,roughness:.8}),0,.88,1.52,g);
        const window_=box(.6,.5,.05,std({color:0x1a1408,emissive:0xffb85c,emissiveIntensity:.8}),1.05,1.45,1.52,g);
        for(const part of [house,door,window_])mark(part,card('granny','Grandmother’s house'));
        // The three oaks behind, broad and bare-armed, and a row of hazels in front.
        for(const [x,z] of [[-2.4,-3.2],[.4,-4],[2.8,-3]]){cyl(.35,.55,4.5,8,bark,x,2.25,z,g);for(let k=0;k<5;k++){const b=cyl(.06,.16,3,6,bark,x,4.4,z,g);b.rotation.set(Math.cos(k*1.3)*.9,0,Math.sin(k*1.3)*.9);b.position.y=4.2}
          const crown=add(own(new THREE.IcosahedronGeometry(2.6,1)),std({color:0x23301e,roughness:1,flatShading:true}),x,6.4,z,g);crown.scale.set(1,.6,1)}
        for(let k=0;k<5;k++)add(own(new THREE.IcosahedronGeometry(.55,0)),std({color:0x2c3a22,roughness:1,flatShading:true}),-2+k,.5,3.2,g);
        block(p.x,p.z,5,5);
        g.updateMatrixWorld(true);const step=new THREE.Vector3(.7,.3,2.05).applyMatrix4(g.matrixWorld);
        (byPlace.granny||[]).forEach((book,i)=>standingBook(book,step.x+i*.5,step.y,step.z,g.rotation.y,-.35,'tales'));
      }
      // Red-Cap's basket, set down by the path: cake, a bottle of wine, and a book.
      {const p=P('basket'),g=new THREE.Group();g.position.set(p.x,0,p.z+1.4);g.rotation.y=.4;root.add(g);
        const wicker=std({color:0x8a6a3a,roughness:1});const basket=cyl(.32,.26,.3,14,wicker,0,.15,0,g);const handle=add(own(new THREE.TorusGeometry(.28,.025,6,16,Math.PI)),wicker,0,.3,0,g);
        add(own(new THREE.PlaneGeometry(.6,.6)),std({color:0xe6dccc,roughness:.9,side:THREE.DoubleSide}),0,.31,0,g).rotation.x=-Math.PI/2+.2;
        cyl(.04,.05,.32,8,std({color:0x2a0a12,roughness:.2,metalness:.2}),.12,.38,-.05,g);
        for(const part of [basket,handle])mark(part,card('basket','A basket on the path'));
        g.updateMatrixWorld(true);(byPlace.basket||[]).forEach((book,i)=>{const s=new THREE.Vector3(-.12+i*.2,.42,.05).applyMatrix4(g.matrixWorld);standingBook(book,s.x,s.y,s.z,g.rotation.y,-.5,'tales')});
      }
      // The hedge of thorns round Briar Rose's palace, a turret above it, and books caught in the briars.
      {const p=P('hedge'),briar=std({color:0x1c2414,roughness:1,flatShading:true}),rose=std({color:0x8a2030,emissive:0x2a0610,emissiveIntensity:.6,roughness:.7});
        const parts=[],rand=mulberry(11);
        for(let i=0;i<34;i++){const x=p.x-13+i*.8,z=p.z-1.2+Math.sin(i*.7)*.6;const b=add(own(new THREE.IcosahedronGeometry(1.1+rand()*.5,0)),briar,x,1.2+rand()*.8,z,root);b.scale.set(1,1.4+rand()*.6,.9);parts.push(b);
          if(i%3===0)add(own(new THREE.SphereGeometry(.09,8,6)),rose,x+(rand()-.5),1+rand()*2,z+1.1,root)}
        for(let i=0;i<40;i++){const t=add(own(new THREE.ConeGeometry(.02,.22,4)),std({color:0x3a2a1a}),p.x-13+rand()*26,.6+rand()*2.6,p.z-.2+rand()*.4,root);t.rotation.set(rand()*3,rand()*3,rand()*3)}
        const turret=cyl(1.4,1.6,9,12,stone,p.x+2,4.5,p.z-9,root),spire=add(own(new THREE.ConeGeometry(1.8,3.5,12)),std({color:0x2a2440,roughness:.9}),p.x+2,10.7,p.z-9,root);
        for(const part of [...parts,turret,spire])mark(part,card('hedge','A hedge of thorns'));
        blockers.push({minX:p.x-14.5,maxX:p.x+14.5,minZ:p.z-2.6,maxZ:p.z+.4});
        (byPlace.hedge||[]).forEach((book,i)=>standingBook(book,p.x-6+i*5.5,1.1+(i%2)*.5,p.z+.75,(i-1)*.25,-.1,'tales'));
      }
      // Baba Yaga's hut on hen's legs, turning slowly.
      {const p=P('hut'),g=new THREE.Group();g.position.set(p.x,0,p.z);root.add(g);const legs=std({color:0xb89a5a,roughness:.8}),logs=std({color:0x4a3826,roughness:1});
        for(const x of [-.6,.6]){const thigh=cyl(.16,.1,1.4,7,legs,x,.9,0,g);thigh.rotation.z=x*.3;const shin=cyl(.08,.06,1.1,6,legs,x*1.25,.5,.2,g);shin.rotation.x=-.4;for(const yaw of [-.6,0,.6]){const toe=cyl(.03,.015,.5,5,legs,x*1.3+Math.sin(yaw)*.22,.05,.4+Math.cos(yaw)*.22,g);toe.rotation.set(Math.PI/2,0,-yaw)}}
        const hut=box(2.6,2,2.2,logs,0,2.6,0,g);for(const side of [-1,1]){const half=box(3,.16,1.6,thatch,0,3.95,side*.62,g);half.rotation.x=side*.82}
        box(.5,.5,.05,std({color:0x1a1206,emissive:0xff9a40,emissiveIntensity:.6}),.6,2.8,-1.12,g);
        for(const child of g.children)mark(child,card('hut','A hut on hen’s legs'));state.hut=g;block(p.x,p.z,3.2,3.2);
        (byPlace.hut||[]).forEach((book,i)=>standingBook(book,p.x+1.9+i*.5,.29,p.z+1.6,-.6,-.3,'tales'));
      }
      // The great fir of the Little Glass Man, with a little glass figure among its roots.
      {const p=P('fir');const trunk=cyl(.55,.9,6,10,bark,p.x,3,p.z,root);
        for(const [r,h,y] of [[4,4.5,4.5],[3.2,4,7.5],[2.3,3.5,10.3],[1.4,3,12.8]])mark(add(own(new THREE.ConeGeometry(r,h,12)),std({color:0x142218,roughness:1}),p.x,y,p.z,root),card('fir','The great fir'));
        const glassMan=add(own(new THREE.CapsuleGeometry(.06,.14,4,8)),std({color:0xc8e8ff,emissive:0x7ab8ff,emissiveIntensity:1.2,transparent:true,opacity:.8,roughness:.05}),p.x-.4,.2,p.z+1.05,root);
        mark(trunk,card('fir','The great fir'));mark(glassMan,card('fir','A little figure of glass'));state.glassMan=glassMan;block(p.x,p.z,2,2);
        (byPlace.fir||[]).forEach((book,i)=>standingBook(book,p.x+.3+i*.5,.29,p.z+1.25,-.3,-.3,'tales'));
      }
      // The old oak at the heart of the wood, hollow, with the eerie books among its roots and a raven above them.
      {const p=P('oak'),g=new THREE.Group();g.position.set(p.x,0,p.z);root.add(g);
        const oak=std({color:0x2c261e,roughness:1});const trunk=cyl(1.1,1.8,6,12,oak,0,3,0,g);const hollow=add(own(new THREE.CircleGeometry(.55,12)),dark,0,1.2,1.62,g);hollow.scale.set(.8,1.4,1);hollow.rotation.x=-.12;
        for(let k=0;k<7;k++){const a=k/7*Math.PI*2,limb=cyl(.12,.38,5,7,oak,Math.cos(a)*1.6,6.8,Math.sin(a)*1.6,g);limb.rotation.set(Math.sin(a)*.8,0,-Math.cos(a)*.8)}
        for(let k=0;k<6;k++){const a=k/6*Math.PI*2+.3,rootPart=cyl(.08,.32,2.2,6,oak,Math.cos(a)*1.7,.2,Math.sin(a)*1.7,g);rootPart.rotation.set(Math.sin(a)*1.35,0,-Math.cos(a)*1.35)}
        const raven=new THREE.Group();raven.position.set(1.7,4.6,1.3);raven.rotation.y=-.6;g.add(raven);const black=std({color:0x0c0c10,roughness:.5,metalness:.2});
        const rb=add(own(new THREE.SphereGeometry(.16,10,8)),black,0,0,0,raven);rb.scale.set(.8,1,1.6);add(own(new THREE.SphereGeometry(.09,8,6)),black,0,.12,-.22,raven);add(own(new THREE.ConeGeometry(.035,.14,5)),black,0,.11,-.36,raven).rotation.x=-Math.PI/2;
        for(const part of [trunk,hollow,rb])mark(part,card('oak','The old oak','LOOK'));block(p.x,p.z,4,4);
        g.updateMatrixWorld(true);
        eerie.forEach((book,i)=>{const a=-Math.PI*.15+(i-(eerie.length-1)/2)*.42,r=2.15,x=p.x+Math.sin(a)*r,z=p.z+Math.cos(a)*r;standingBook(book,x,.29,z,a,-.32,'eerie')});
        // A fairy ring of pale toadstools beside it.
        const cap=std({color:0xe2d8c0,emissive:0x3a3a30,emissiveIntensity:.5,roughness:.8});const ring=[];
        for(let k=0;k<13;k++){const a=k/13*Math.PI*2;const m=add(own(new THREE.SphereGeometry(.11,8,5,0,Math.PI*2,0,Math.PI/2)),cap,p.x-4.2+Math.cos(a)*1.3,.09,p.z+3.4+Math.sin(a)*1.3,root);cyl(.025,.03,.09,5,cap,m.position.x,.045,m.position.z,root);ring.push(m)}
        for(const m of ring)mark(m,card('ring','A fairy ring'));
      }
    }

    // ---------- moonlight, mist and the wisps ----------
    function buildAir(){
      // The moon, high in the south-east; seen only through gaps in the canopy.
      const moon=add(own(new THREE.CircleGeometry(4,32)),own(new THREE.MeshBasicMaterial({color:0xe8ecf4,fog:false})),CENTRE.x+18,58,CENTRE.z-46,root);moon.lookAt(CENTRE.x,0,CENTRE.z);
      const halo=own(canvasTexture((c,W,H)=>{const g=c.createRadialGradient(W/2,H/2,0,W/2,H/2,W/2);g.addColorStop(0,'rgba(210,225,255,.55)');g.addColorStop(1,'rgba(210,225,255,0)');c.fillStyle=g;c.fillRect(0,0,W,H)},128,128));
      const haloSprite=new THREE.Sprite(own(new THREE.SpriteMaterial({map:halo,fog:false,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending})));haloSprite.scale.set(26,26,1);haloSprite.position.copy(moon.position);root.add(haloSprite);
      // Shafts of moonlight into the clearings: faint, open-ended cones.
      const beam=own(new THREE.MeshBasicMaterial({color:0xaabcdc,transparent:true,opacity:.055,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));
      for(const key of ['hub','spring','cottage','oak','window']){const p=at(key),cone=add(own(new THREE.CylinderGeometry(.9,3.2,16,16,1,true)),beam,p.x+1.2,8,p.z-1,root);cone.rotation.z=.12}
      // Mist lying low among the trees.
      const mistMap=own(canvasTexture((c,W,H)=>{c.clearRect(0,0,W,H);const rand=mulberry(5);for(let i=0;i<70;i++){const x=rand()*W,y=rand()*H,r=20+rand()*60,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(200,210,225,.16)');g.addColorStop(1,'rgba(200,210,225,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)}},512,512));
      mistMap.wrapS=mistMap.wrapT=THREE.RepeatWrapping;mistMap.repeat?.set?.(3,3);
      state.mist=[];for(const [y,o] of [[.35,.8],[.9,.5]]){const m=add(own(new THREE.PlaneGeometry(EDGE*2,EDGE*2)),own(new THREE.MeshBasicMaterial({map:mistMap,transparent:true,opacity:o,depthWrite:false,color:0xb4bfd0})),CENTRE.x,y,CENTRE.z,root);m.rotation.x=-Math.PI/2;state.mist.push(m)}
      // Will-o'-the-wisps: the first goes ahead of the reader towards a book not yet found; the rest drift.
      const glow=own(canvasTexture((c,W,H)=>{const g=c.createRadialGradient(W/2,H/2,0,W/2,H/2,W/2);g.addColorStop(0,'rgba(235,255,240,1)');g.addColorStop(.25,'rgba(170,240,210,.6)');g.addColorStop(1,'rgba(120,220,190,0)');c.fillStyle=g;c.fillRect(0,0,W,H)},64,64));
      const wispMaterial=own(new THREE.SpriteMaterial({map:glow,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,color:0xc8ffe8}));
      state.wisps=['hub','cottage','granny','spring','tower','oak','hut'].map((key,i)=>{const s=new THREE.Sprite(wispMaterial);const p=at(key);s.position.set(p.x+2,1.4,p.z+2);s.scale.setScalar(i?.45:.6);root.add(s);return {sprite:s,home:p,phase:i*1.7}});
    }

    // ---------- the Garden Room's window ----------
    // Hung on the west wall when the Garden Room is built (game.js calls this), and kept: the room is never freed.
    function hangGardenWindow(){
      if(gardenWindow)return gardenWindow;const g=new THREE.Group();g.name='forest-garden-window';g.position.set(GARDEN_WINDOW.x,0,GARDEN_WINDOW.z);g.rotation.y=GARDEN_WINDOW.yaw;scene.add(g);
      const night=canvasTexture((c,W,H)=>{const sky=c.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#0a1220');sky.addColorStop(.7,'#16222c');sky.addColorStop(1,'#0c120e');c.fillStyle=sky;c.fillRect(0,0,W,H);
        c.fillStyle='#e8ecf4';c.beginPath();c.arc(W*.72,H*.16,W*.06,0,7);c.fill();
        const rand=mulberry(9);for(let layer=0;layer<3;layer++){c.fillStyle=['#1a2a26','#111c18','#070c0a'][layer];for(let i=0;i<9;i++){const x=rand()*W,w=W*(.08+layer*.03),top=H*(.25+rand()*.2+layer*.06);c.beginPath();c.moveTo(x,top);c.lineTo(x-w,H);c.lineTo(x+w,H);c.fill()}}
        c.fillStyle='rgba(200,215,230,.12)';c.fillRect(0,H*.8,W,H*.2);c.strokeStyle='rgba(140,120,90,.6)';c.lineWidth=W*.05;c.beginPath();c.moveTo(W*.5,H);c.quadraticCurveTo(W*.45,H*.86,W*.56,H*.78);c.stroke();
        c.fillStyle='rgba(200,255,225,.9)';c.beginPath();c.arc(W*.55,H*.74,3,0,7);c.fill()},256,384);
      const glass=new THREE.Mesh(new THREE.PlaneGeometry(1.5,2.3),new THREE.MeshStandardMaterial({map:night,emissive:0xffffff,emissiveMap:night,emissiveIntensity:.55,roughness:.15}));glass.position.set(0,2.25,.02);g.add(glass);
      const frame=new THREE.MeshStandardMaterial({color:0xd9d0bd,roughness:.6});
      for(const [w,h,x,y] of [[1.74,.12,0,3.46],[1.74,.12,0,1.04],[.12,2.5,-.81,2.25],[.12,2.5,.81,2.25],[1.5,.05,0,2.25],[.05,2.3,0,2.25]]){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,.1),frame);m.position.set(x,y,.05);g.add(m)}
      const sill=new THREE.Mesh(new THREE.BoxGeometry(1.9,.08,.36),frame);sill.position.set(0,1,.16);g.add(sill);
      // Ivy over the frame, as if the wood were already coming in.
      const ivy=new THREE.MeshStandardMaterial({color:0x2c4a2a,roughness:.9});for(let i=0;i<14;i++){const leaf=new THREE.Mesh(new THREE.SphereGeometry(.09,6,4),ivy);const t=i/13;leaf.position.set(-.85+Math.sin(t*9)*.08,1.1+t*2.4,.12);leaf.scale.set(1,.5,1);g.add(leaf)}
      const data={type:'forest-window',title:'A window onto a wood',author:'The Garden Room has no outside. But through this window, open a crack, there is a wood at night, and a path going into it.',action:'CLIMB THROUGH'};
      for(const part of [glass,sill]){part.userData=data;interactables.push(part)}
      gardenWindow={group:g,glass,sill};return gardenWindow;
    }

    // ---------- building and freeing ----------
    function build(){
      if(root)return;root=new THREE.Group();root.name='forest';state={};
      buildGround();buildPlaces();buildTrees();buildAir();scene.add(root);
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
      const r=player.radius||.42;if(Math.hypot(x-CENTRE.x,z-CENTRE.z)>WALK-r)return false;
      if(blockers.some(b=>x+r>b.minX&&x-r<b.maxX&&z+r>b.minZ&&z-r<b.maxZ))return false;
      return !trunks.some(t=>Math.abs(t.x-x)<2&&Math.abs(t.z-z)<2&&Math.hypot(t.x-x,t.z-z)<t.r+r);
    }

    // ---------- doing things ----------
    function enter(from='link'){
      activate();move(ARRIVAL.x,ARRIVAL.z,ARRIVAL.yaw);
      showNotice(from==='window'?'You climb out over the sill, and the Garden Room is behind you. A wood, at night: moonlight, mist, and a path going in. Somewhere ahead, a small light is moving.'
        :from==='grimm'?'The woodcut grows until it is all there is. You are standing on a path in a wood at night; behind you, among the trees, a window shows lamplight. Somewhere ahead, a small light is moving.'
        :'The Deep Wood. Moonlight, mist, and a path going in; behind you, among the trees, a window shows lamplight. Somewhere ahead, a small light is moving.',11);
      analytics?.track('Room Explored',{room:'forest'});
    }
    function leave(){if(toGarden)toGarden(GARDEN_SPOT);else move(GARDEN_SPOT.x,GARDEN_SPOT.z,GARDEN_SPOT.yaw);playSample?.('doorOpen',.6,1.1);showNotice('Back over the sill into the Garden Room. The window shows the wood still, and the path.',5)}
    // A book picked up in the wood: remembered as found, for good.
    function noteFound(id){
      const all=found(),{tales,eerie}=catalogue(),total=tales.length+eerie.length;const first=!all.has(id);all.add(id);foundCache=all;try{storage?.setItem(FOUND_KEY,JSON.stringify([...all]))}catch(e){}
      const here=new Set([...tales,...eerie].map(b=>b.id)),count=[...all].filter(n=>here.has(n)).length;
      if(first&&count===total)analytics?.track('Secret Found',{secret:'forest-every-book'});
      return first?(count===total?`Found in the wood: all ${total}. The wisps go out one by one, as if satisfied.`:`Found in the wood: ${count} of ${total}.`):null;
    }
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('forest-'))return false;
      if(data.type==='forest-window'){enter('window');playSample?.('doorOpen',.6,.9);return true}
      if(data.type==='forest-exit'){leave();return true}
      if(data.type==='forest-card'){
        if(data.key==='braid'&&state?.braid)state.braidSway=1;
        if(data.key==='spring'&&sound){sound(140,.12,'square',.04);setTimeout(()=>sound(120,.16,'square',.04),180)}
        if(data.key==='oak'&&sound)sound(520,.2,'sawtooth',.02);
        showNotice(`${data.title}: ${data.author}`,data.author.length>160?13:9);return true;
      }
      return false;
    }

    // ---------- each frame ----------
    const target=new THREE.Vector3();
    function update(t,dt=0){
      time=t;const {x,z}=player.pos,inside=contains(x,z);if(inside)activate();
      if(!root)return;
      if(!inside&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==root)){unload();return}
      if(inside){scene.background.setRGB(.025,.035,.055);scene.fog.color.setRGB(.045,.06,.08);scene.fog.density=.05}
      const reduced=isReducedMotion(),still=reduced?0:1;
      if(state.hut)state.hut.rotation.y+=dt*.12*still;
      if(state.braid){state.braidSway=Math.max(0,(state.braidSway||0)-dt*.4);state.braid.rotation.z=Math.sin(t*.7)*.02*still+Math.sin(t*3)*.12*state.braidSway*still}
      if(state.glassMan)state.glassMan.material.emissiveIntensity=1+.4*Math.sin(t*2.3);
      if(state.pebbles)state.pebbles.emissiveIntensity=.45+.12*Math.sin(t*.9);
      for(const m of state.mist||[]){m.material.map.offset.set(t*.004*still,t*.0025*still)}
      // The wisps: the first leads towards the nearest book not yet found, staying a few steps ahead.
      const all=foundCache||(foundCache=found()),left=books.filter(b=>b.parent===root&&!all.has(b.userData.book.id));
      (state.wisps||[]).forEach((w,i)=>{
        if(i===0&&left.length&&inside){let best=null,bestD=1e9;for(const b of left){const d=Math.hypot(b.position.x-x,b.position.z-z);if(d<bestD){bestD=d;best=b}}
          const dx=best.position.x-x,dz=best.position.z-z,d=Math.max(.001,Math.hypot(dx,dz)),ahead=Math.max(0,Math.min(d-.6,6));target.set(x+dx/d*ahead,1.3+Math.sin(t*2)*.15,z+dz/d*ahead);
          w.sprite.position.lerp(target,1-Math.exp(-dt*1.4));w.sprite.visible=true;return}
        w.sprite.visible=!(i===0&&!left.length);
        target.set(w.home.x+Math.sin(t*.31+w.phase)*3,1.1+Math.sin(t*.9+w.phase)*.4,w.home.z+Math.cos(t*.27+w.phase)*3);w.sprite.position.lerp(target,1-Math.exp(-dt*.8));
      });
    }

    return {contains,floorAt,allowed,interact,update,enter,leave,unload,hangGardenWindow,noteFound,catalogue,zoneAt:(x,z)=>contains(x,z)?'forest':null,
      centre:CENTRE,walk:WALK,spots:SPOTS,places:PLACES,quotes:QUOTES,arrival:ARRIVAL,gardenWindow:GARDEN_WINDOW,gardenSpot:GARDEN_SPOT,
      get built(){return !!root},get books(){return books.slice()},get trees(){return state?.trees||null},get trunks(){return trunks.slice()}};
  };
})();
