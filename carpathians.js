// The polonyna (Полонина): the high summer pasture under Chornohora in Mykhailo Kotsiubynsky's Shadows of Forgotten
// Ancestors (Тіні забутих предків, 1911), where Ivan spends his summer with the shepherds. Reached from the Ukrainian
// Reading Room: a trembita, the Hutsuls' long wooden horn, stands in its north-east corner; blow it, and the reader is
// standing on the polonyna on a summer night, above a sea of mist. As the story has it: the staia, the shepherds' log
// hut, with the fire that was kindled on the first day and must not go out all summer, and the black cauldron over it;
// the vatah's trembita leaning by its door; the sheep in their pen, its fence of split rails whining in the wind; the four
// sheepdogs lying in the grass; cows grazing under the forest; the spruces; and on the skyline Chornohora with its snow.
// The library's own copy of the story lies on the bench in the staia, which is a seat. A carved door at the polonyna's
// south edge leads back to the reading room.
//
// The secret: Ivan's floyara lies on a mossy stone at the forest's edge, where as a boy he saw the shcheznyk playing.
// Played, it gives the shcheznyk's tune, «Нема моїх кіз…», and then «Є мої кози…», and bearded goats shake their heads
// out of the roots of the windfall; when they have gone back into the roots, Marko Cheremshyna's Hutsul stories are left
// on the stone, found for good. Once a visit, out on the knoll by the lone spruce, the white herdsman of the forest's
// deer is seen in the mist, and gone, as Ivan saw him. Every quotation is from the library's own text of the story
// (book 988269), checked by a test; the English after each is the library's plain rendering.
//
// Nothing is built until the reader goes in, and it is freed a while after they leave. It adds no lights: the library's
// moonlight lights it, the fire glows through its own colour, and the spruces, sheep and far ridges are InstancedMeshes.
(function(){
  'use strict';

  // Far from everything else: the Forest Song is at x 600, z 900, the mountain at x 1100, z 700.
  const CENTRE={x:200,z:1300},WALK=30,FLAT=33,KEEP=25,BOOK=988269,FOUND_BOOK=958034;
  // Places on the polonyna, relative to its centre (yaw 0 faces north, -z).
  const SPOTS={door:{x:0,z:24},staia:{x:-3,z:-2},trembita:{x:.42,z:-1.2},dogs:{x:-6.4,z:3.4},pen:{x:10,z:-4},gate:{x:4,z:1.5},lookout:{x:-13,z:-24},
    stone:{x:-22,z:4},roots:{x:-25.4,z:5},cows:{x:-8,z:-19},knoll:{x:-20,z:-33},chornohora:{x:-62,z:-88}};
  const STAIA={w:6,d:4.4,h:2.3},PEN={w:12,d:9};
  const PATHS=[['door','staia'],['door','gate'],['door','stone']];
  const QUOTES={
    polonyna:'«Полонина починала своє життя живим невгасимим вогнем, що мав її боронити од всього лихого.» (The polonyna began its life with a living, undying fire, which was to guard it from all harm.)',
    vatra:'Спузар Микола: «маю пильнувать ватри, аби не згасла через все літо, бо була б біда!..» (Mykola, the fire-keeper: “I have to watch the fire so it doesn’t go out all summer, or there’d be trouble!”)',
    cauldron:'«ватра з радости лиже чорний котел, в якому сироватка гуля коломийки» (the fire licks the black cauldron for joy, and the whey in it dances kolomyikas)',
    trembita:'«ватаг виносить з стаї трембіту і трубить побідно на всі пустинні гори, що день скінчився миром» (the head shepherd carries the trembita out of the hut and blows it in triumph to all the empty mountains: the day has ended in peace)',
    dogs:'«Чотири сильних вівчарки, поклавши в траву свої кожухи, дивились задумливо в гори, готові в одну хвилину скочить на ноги, показать зуби та наїжити шерсть.» (Four strong sheepdogs, lying with their shaggy coats in the grass, looked thoughtfully at the mountains, ready in a moment to spring up, bare their teeth and bristle.)',
    sheep:'«Треться вовна об вовну, біла об чорну, хвилюють пухнаті хребти, як дрібні в озері хвилі, і драгліє отара.» (Wool rubs on wool, white on black, the fleecy backs ripple like small waves on a lake, and the flock quivers.)',
    fence:'The rails of the pen. «Дзз… тонко співає він в одколоту скалку, докучно бринить, як муха.» (Dzz… the wind sings thin through a split splinter, buzzing like a fly.)',
    cows:'«дзвінки коров обзивались, як далеке зітхання» (the cows’ bells called out, like a far-off sigh)',
    chornohora:'«вже вставав на крайнебі блакитний привид Чорногори» (on the edge of the sky rose the blue ghost of Chornohora)',
    mist:'«Води обляли кругом полонину, потопили верхи, і полонина пливе самотою в безкрайому морі.» (Waters have flooded all round the polonyna, drowned the peaks, and the polonyna floats alone in a boundless sea.)',
    spruce:'«Ніжно дзвеніла над ним фоя смерек, змішавшись з шумом ріки» (The spruces’ needles rang softly over him, mingled with the noise of the river)',
    stone:'«Під ногами в Івана кожний камінь вкривали рудаві мхи, грубі, м’які, шовкові.» (Under Ivan’s feet every stone was covered with russet mosses, thick, soft, silken.) A floyara lies on this one.',
    floyara:'Ivan’s floyara, the shepherd’s long flute. Here, as a boy, he saw the shcheznyk, the forest’s imp, on a stone: «заплющивши очі, дув у флояру» (with his eyes shut, blowing on a floyara).',
    lost:'«Нема моїх кіз… Нема моїх кіз…» (My goats are gone… my goats are gone…)',
    goats:'«Є мої кози… є мої кози…» … «виткнувшись зза галузок, затрясли головами бородаті цапи.» (My goats are here… my goats are here… and poking out from behind the branches, bearded billy-goats shook their heads.)',
    roots:'«а цапи обернулись в коріння дерев, повалених вітром.» (and the goats turned into the roots of trees blown down by the wind.)',
    found:'«Так знайшов він у лісі те, чого шукав.» (So he found in the forest what he was looking for.) On the stone lies a book of Hutsul stories: Marko Cheremshyna’s, from these same mountains.',
    herdsman:'«І зараз вийшли з лісу олені, один за другим, а що вийде новий, то роги у нього все кращі та веселіші.» (And at once deer came out of the forest, one after another, and each new one had finer and merrier antlers.) A tall white herdsman stands by the lone spruce, grazing them.',
    gone:'«Отак якби хухнув на скло, воно запітніє, а потому щезне усе, наче нічого не було.» (As if you breathed on glass: it mists over, and then it all vanishes, as if nothing had been there.)',
    knoll:'The lone spruce on the knoll. «Де? Сама лиш мряка». (“Where? It’s only mist.”)',
    book:'«Іван був дев’ятнадцятою дитиною в гуцульській родині Палійчуків.» (Ivan was the nineteenth child in the Hutsul family of the Paliichuks.) The story lies on the bench by the fire. Sit, and read it.',
    star:'Марічка: «А як в погожу нічку зазоріє небо, я му дивитись, котра зірка над полонинков» (Marichka: “And on a fine night when the sky fills with stars, I’ll look for the star over the polonyna”)',
    door:'Різьблені двері з рушником. За ними Українська читальня. (A carved door with a rushnyk. Through it, the Ukrainian Reading Room.)'
  };
  // The trembita's call: natural harmonics over a low G, as a trembita plays them; the library's own call.
  const CALL=[[392,.9],[490,.5],[588,.6],[490,.4],[588,1.4],[784,.6],[588,.5],[490,.5],[392,1.8]];
  // The shcheznyk's tune on the floyara, in two phrases: «Нема моїх кіз» falling, «Є мої кози» leaping. The library's own.
  const LOST=[[659.25,.6],[587.33,.6],[554.37,.6],[493.88,1.2],[554.37,.6],[493.88,.6],[440,1.6]];
  const FOUND=[[587.33,.3],[739.99,.3],[880,.6],[739.99,.3],[880,.3],[987.77,.3],[880,.3],[739.99,.6],[587.33,.3],[659.25,.3],[739.99,.3],[880,.9]];
  const mulberry=seed=>()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296};
  // The ground: the polonyna's top is level where the reader walks, and falls away beyond it into the mist.
  const heightAt=r=>r<=FLAT?0:-Math.pow(r-FLAT,1.45)*.2;

  window.createCarpathians=function(options){
    const {THREE,scene,MAT,player,ambient=null,moon:moonlight=null,interactables,canvasTexture,bookMaterial,findBook,showNotice,playSample,tone=null,registerSeat=null,move,analytics,
      toRoom=null,isHolding=()=>false,isReducedMotion=()=>false,storage=window.localStorage,search=()=>window.location?.search||''}=options;
    const FOUND_KEY='athenaeum-carpathians-goats';
    const ARRIVAL={x:CENTRE.x+SPOTS.door.x,z:CENTRE.z+SPOTS.door.z-2.4,yaw:0};
    let root=null,time=0,lastNeeded=-1e9,state=null,arrivedAt=null;
    const owned=[],ours=[],books=[],blockers=[],trunks=[];
    const own=thing=>{owned.push(thing);return thing};
    const std=params=>own(new THREE.MeshStandardMaterial(params));
    const basic=params=>own(new THREE.MeshBasicMaterial(params));
    const at=key=>({x:CENTRE.x+SPOTS[key].x,z:CENTRE.z+SPOTS[key].z});
    function add(geometry,material,x,y,z,parent=root){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    const cyl=(rt,rb,h,seg,material,x,y,z,parent)=>add(own(new THREE.CylinderGeometry(rt,rb,h,seg)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    const card=(key,title,action='LOOK')=>({type:'carp-card',key,title,author:QUOTES[key],action});
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const asked=()=>/[?&]goats(?:[=&]|$)/.test(search());
    const found=()=>{if(asked())return true;try{return storage?.getItem(FOUND_KEY)==='1'}catch(e){return false}};

    // ---------- geometry helpers ----------
    function joined(parts){
      const positions=[],normals=[],colours=[],colour=new THREE.Color();
      for(const [geometry,hex,matrix] of parts){const g=geometry.index?geometry.toNonIndexed():geometry;if(matrix)g.applyMatrix4(matrix);g.computeVertexNormals();colour.setHex(hex);
        const p=g.attributes.position,n=g.attributes.normal;for(let i=0;i<p.count;i++){positions.push(p.getX(i),p.getY(i),p.getZ(i));normals.push(n.getX(i),n.getY(i),n.getZ(i));colours.push(colour.r,colour.g,colour.b)}
        g.dispose();if(g!==geometry)geometry.dispose()}
      const out=new THREE.BufferGeometry();out.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));out.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));out.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));return own(out);
    }
    const placed=(x,y,z,rx=0,ry=0,rz=0,s=1)=>new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)),new THREE.Vector3(s,s,s));
    // A Carpathian spruce, 1 m to the scale: a narrow dark spire of three tiers on a short trunk.
    const spruceGeometry=()=>joined([[new THREE.CylinderGeometry(.012,.022,.3,6),0x3a2a1e,placed(0,.15,0)],[new THREE.ConeGeometry(.2,.42,8),0x14261c,placed(0,.36,0)],
      [new THREE.ConeGeometry(.15,.36,8),0x172b1f,placed(0,.62,0)],[new THREE.ConeGeometry(.09,.3,8),0x1a3022,placed(0,.86,0)]]);
    function nearPath(x,z,distance){
      for(const [a0,b0] of PATHS){const a=SPOTS[a0],b=SPOTS[b0],dx=b.x-a.x,dz=b.z-a.z,l=dx*dx+dz*dz,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/l));if(Math.hypot(x-a.x-t*dx,z-a.z-t*dz)<distance)return true}
      return false;
    }

    // ---------- the ground ----------
    // One mesh in rings: the level top in summer grass, falling away beyond the walk into the mist, darker as it goes.
    function buildGround(){
      const rings=[0,3,6,9,12,15,18,21,24,27,30,33,36,40,45,51,58,66,75],seg=56,rand=mulberry(7),positions=[],colours=[],c=new THREE.Color();
      const vertex=(r,a)=>{const x=Math.cos(a)*r,z=Math.sin(a)*r,y=heightAt(r)+(r>FLAT?Math.sin(a*5+r*.3)*1.2*Math.min(1,(r-FLAT)/10):0);
        const k=r<=FLAT?1:Math.max(.35,1-(r-FLAT)/40),j=.9+rand()*.2;c.setRGB(.03*k*j,.046*k*j,.024*k*j);return [x,y,z,c.r,c.g,c.b]};
      const grid=rings.map(r=>Array.from({length:seg},(_,i)=>vertex(r,i/seg*Math.PI*2)));
      for(let ri=0;ri<rings.length-1;ri++)for(let i=0;i<seg;i++){const a=grid[ri][i],b=grid[ri][(i+1)%seg],p=grid[ri+1][i],q=grid[ri+1][(i+1)%seg];
        for(const v of [a,b,p,b,q,p]){positions.push(CENTRE.x+v[0],v[1],CENTRE.z+v[2]);colours.push(v[3],v[4],v[5])}}
      const geometry=own(new THREE.BufferGeometry());geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));geometry.computeVertexNormals();
      const ground=new THREE.Mesh(geometry,std({vertexColors:true,roughness:1}));ground.name='carp-ground';root.add(ground);
      // The trodden paths, a little above the grass.
      const path=std({color:0x2a2519,roughness:1});
      for(const [a0,b0] of PATHS){const a=SPOTS[a0],b=SPOTS[b0],l=Math.hypot(b.x-a.x,b.z-a.z);
        const strip=add(own(new THREE.PlaneGeometry(.75,l)),path,CENTRE.x+(a.x+b.x)/2,.012,CENTRE.z+(a.z+b.z)/2);strip.rotation.order='YXZ';strip.rotation.set(-Math.PI/2,Math.atan2(b.x-a.x,b.z-a.z),0)}
      // Summer flowers in the grass, pale in the moonlight: one instanced mesh.
      const n=160,flowers=own(new THREE.InstancedMesh(own(new THREE.IcosahedronGeometry(.03,0)),std({color:0xd8cce8,emissive:0xb8a8d8,emissiveIntensity:.15,roughness:.8}),n)),o=new THREE.Object3D();let i=0;
      for(let tries=0;tries<n*20&&i<n;tries++){const a=rand()*Math.PI*2,r=Math.sqrt(rand())*WALK,x=Math.cos(a)*r,z=Math.sin(a)*r;
        if(nearPath(x,z,.8)||Math.abs(x-SPOTS.staia.x)<4&&Math.abs(z-SPOTS.staia.z)<3.2||Math.abs(x-SPOTS.pen.x)<PEN.w/2+.5&&Math.abs(z-SPOTS.pen.z)<PEN.d/2+.5)continue;
        o.position.set(CENTRE.x+x,.04,CENTRE.z+z);o.scale.setScalar(.7+rand()*.6);o.updateMatrix();flowers.setMatrixAt(i++,o.matrix)}
      flowers.count=i;flowers.instanceMatrix.needsUpdate=true;root.add(flowers);
    }

    // ---------- the spruces ----------
    // A polonyna lies above the forest: the spruces stand down its slopes, below the reader's eye, so the mist and the
    // far ranges show over them. The forest comes up to the level only on the west, to the stone, and on the north,
    // behind the cows; the way to Chornohora is left open. One InstancedMesh.
    function buildSpruces(){
      const rand=mulberry(31),list=[];
      const ch=SPOTS.chornohora,chA=Math.atan2(ch.z,ch.x);
      for(let tries=0;tries<14000&&list.length<480;tries++){const a=rand()*Math.PI*2,r=24+Math.sqrt(rand())*44,x=Math.cos(a)*r,z=Math.sin(a)*r;
        const west=x<-17&&Math.abs(z-2)<16,north=z<-24&&Math.abs(x+8)<14;if(r<WALK+.5&&!west||r<44&&!west&&!north)continue;
        if(Math.abs(((a-chA+Math.PI*3)%(Math.PI*2))-Math.PI)<.3&&r<70)continue;
        if(Math.hypot(x-SPOTS.stone.x,z-SPOTS.stone.z)<4.5||Math.hypot(x-SPOTS.roots.x,z-SPOTS.roots.z)<3.4||Math.hypot(x-SPOTS.knoll.x,z-SPOTS.knoll.z)<7||Math.hypot(x-SPOTS.door.x,z-SPOTS.door.z)<5)continue;
        if(r<WALK+2&&nearPath(x,z,2.5))continue;
        {const k=SPOTS.knoll,l=Math.hypot(k.x,k.z),u=(x*k.x+z*k.z)/l;if(u>0&&u<l&&Math.abs(x*k.z-z*k.x)/l<5)continue}
        if(list.some(t=>Math.hypot(t.x-x,t.z-z)<(r>FLAT?2.2:2.6)))continue;
        list.push({x,z,y:heightAt(r),s:(r>FLAT?8:10)+rand()*(west||north?8:5),yaw:rand()*7})}
      // The lone spruce on the knoll, taller than the rest.
      const k=SPOTS.knoll;list.push({x:k.x,z:k.z,y:heightAt(Math.hypot(k.x,k.z))+.4,s:17,yaw:0});
      const mesh=new THREE.InstancedMesh(spruceGeometry(),std({vertexColors:true,roughness:.95}),list.length);mesh.name='carp-spruces';const o=new THREE.Object3D();
      list.forEach((t,i)=>{o.position.set(CENTRE.x+t.x,t.y,CENTRE.z+t.z);o.rotation.set(0,t.yaw,0);o.scale.setScalar(t.s);o.updateMatrix();mesh.setMatrixAt(i,o.matrix);
        if(Math.hypot(t.x,t.z)<WALK+1)trunks.push({x:CENTRE.x+t.x,z:CENTRE.z+t.z,r:.03*t.s+.15})});
      mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere?.();root.add(mesh);
      // The spruces are one InstancedMesh, which is picked by its own position (the origin), so a clear pane among the
      // trees at the forest's edge west of the stone answers for them.
      const edge=add(own(new THREE.BoxGeometry(1.4,3,6)),basic({transparent:true,opacity:0,depthWrite:false}),CENTRE.x-21.5,1.5,CENTRE.z-7);mark(edge,card('spruce','Смереки'));
      // The knoll's own spruce answers for itself: a clear pane where it stands.
      const kp=at('knoll'),hit=add(own(new THREE.PlaneGeometry(4,12)),basic({transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}),kp.x,heightAt(Math.hypot(k.x,k.z))+6,kp.z);hit.rotation.y=.55;mark(hit,card('knoll','Самотня смерека'));
      state.spruces=list.length;
    }

    // ---------- the far mountains, the mist and the sky ----------
    function buildDistance(){
      // Ranges all round, dark against the sky, their feet in the mist; Chornohora to the north-west, with its snow.
      const rand=mulberry(53),cone=own(new THREE.ConeGeometry(1,1,7)),o=new THREE.Object3D(),peaks=[];
      for(let i=0;i<46;i++){const a=i/46*Math.PI*2+rand()*.08,r=88+rand()*24,h=36+rand()*30;peaks.push({x:Math.cos(a)*r,z:Math.sin(a)*r,h,w:h*(.9+rand()*.6),y:-44})}
      const near=[];for(let i=0;i<22;i++){const a=i/22*Math.PI*2+.13,r=64+rand()*10,h=30+rand()*12;near.push({x:Math.cos(a)*r,z:Math.sin(a)*r,h,w:h*1.4,y:-50})}
      for(const [list,hex,name] of [[peaks,0x18223a,'carp-ridges'],[near,0x0f1626,'carp-near-ridges']]){
        const mesh=new THREE.InstancedMesh(cone,basic({color:hex,fog:false}),list.length);mesh.name=name;
        list.forEach((p,i)=>{o.position.set(CENTRE.x+p.x,p.y+p.h/2,CENTRE.z+p.z);o.rotation.set(0,p.x,0);o.scale.set(p.w,p.h,p.w);o.updateMatrix();mesh.setMatrixAt(i,o.matrix)});
        mesh.instanceMatrix.needsUpdate=true;root.add(mesh)}
      {const c=at('chornohora'),g=new THREE.Group();g.position.set(c.x,0,c.z);root.add(g);
        const massif=add(cone,basic({color:0x26324e,fog:false}),0,-14,0,g);massif.scale.set(70,64,48);
        // The snowfield: the top of the massif, the same shape, a little proud of it.
        const snow=add(cone,basic({color:0x9ea9c0,fog:false}),0,9.5,0,g);snow.scale.set(19.2,17,13.2);
        const shoulder=add(cone,basic({color:0x1a2640,fog:false}),26,-20,8,g);shoulder.scale.set(48,44,36);
        const snow2=add(cone,basic({color:0x8f9ab2,fog:false}),26,-2.2,8,g);snow2.scale.set(10,8.8,7.5);
        const hit=add(own(new THREE.PlaneGeometry(60,40)),basic({transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}),0,0,0,g);hit.lookAt(CENTRE.x,0,CENTRE.z);mark(hit,card('chornohora','Чорногора'))}
      // The sea of mist, lying below the polonyna's edge.
      const mistMap=own(canvasTexture((c,W,H)=>{c.fillStyle='rgba(150,160,182,.55)';c.fillRect(0,0,W,H);const r0=mulberry(9);for(let i=0;i<90;i++){const x=r0()*W,y=r0()*H,r=30+r0()*80,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(220,228,240,.35)');g.addColorStop(1,'rgba(220,228,240,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)}},512,512));
      mistMap.wrapS=mistMap.wrapT=THREE.RepeatWrapping;mistMap.repeat?.set(4,4);
      const mist=add(own(THREE.RingGeometry?new THREE.RingGeometry(38,128,64,1):new THREE.CircleGeometry(128,64)),basic({map:mistMap,transparent:true,opacity:.8,depthWrite:false,color:0x4b5568,fog:false,side:THREE.DoubleSide}),CENTRE.x,-15,CENTRE.z);
      mist.rotation.x=-Math.PI/2;mist.name='carp-mist';mark(mist,card('mist','Море мряки'));state.mist=mist;
      // The moon and its halo, and the stars over the polonyna.
      const moon=add(own(new THREE.CircleGeometry(3.4,32)),basic({color:0xeef0f6,fog:false}),CENTRE.x+46,48,CENTRE.z+58);moon.lookAt(CENTRE.x,0,CENTRE.z);
      const halo=own(canvasTexture((c,W,H)=>{const g=c.createRadialGradient(W/2,H/2,0,W/2,H/2,W/2);g.addColorStop(0,'rgba(215,228,255,.5)');g.addColorStop(1,'rgba(215,228,255,0)');c.fillStyle=g;c.fillRect(0,0,W,H)},128,128));
      const haloSprite=new THREE.Sprite(own(new THREE.SpriteMaterial({map:halo,fog:false,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending})));haloSprite.scale.set(26,26,1);haloSprite.position.copy(moon.position);root.add(haloSprite);
      const N=420,stars=new Float32Array(N*3),rs=mulberry(77);
      for(let i=0;i<N;i++){const a=rs()*Math.PI*2,e=.12+rs()*1.3,r=112;stars[i*3]=CENTRE.x+Math.cos(a)*Math.cos(e)*r;stars[i*3+1]=Math.sin(e)*r*.8;stars[i*3+2]=CENTRE.z+Math.sin(a)*Math.cos(e)*r}
      const sg=own(new THREE.BufferGeometry());sg.setAttribute('position',new THREE.BufferAttribute(stars,3));
      const sky=new THREE.Points(sg,own(new THREE.PointsMaterial({color:0xdfe6ff,size:.55,fog:false,transparent:true,opacity:.85,depthWrite:false})));sky.name='carp-stars';root.add(sky);
    }

    // ---------- the staia, its fire, the trembita and the dogs ----------
    function buildStaia(){
      const s=at('staia'),g=new THREE.Group();g.position.set(s.x,0,s.z);root.add(g);
      const logs=std({color:0x7a5a3c,roughness:1}),dark=std({color:0x2c2017,roughness:1});
      const logTex=own(canvasTexture((c,W,H)=>{c.fillStyle='#4b3624';c.fillRect(0,0,W,H);for(let y=0;y<H;y+=16){c.fillStyle='#2a1c12';c.fillRect(0,y,W,3);c.fillStyle='rgba(120,90,60,.25)';c.fillRect(0,y+6,W,2)}},64,128));
      logTex.wrapS=logTex.wrapT=THREE.RepeatWrapping;logs.map=logTex;
      const {w,d,h}=STAIA,t=.24,door=2.2;
      // The walls: north, west and east whole; the south wall either side of a wide opening onto the fire.
      box(w,h,t,logs,0,h/2,-d/2,g);box(t,h,d,logs,-w/2,h/2,0,g);box(t,h,d,logs,w/2,h/2,0,g);
      const side=(w-door)/2;box(side,h,t,logs,-w/2+side/2,h/2,d/2,g);box(side,h,t,logs,w/2-side/2,h/2,d/2,g);box(door,.35,t,logs,0,h-.17,d/2,g);
      // A steep roof of shingles, and the gables.
      const shingle=own(canvasTexture((c,W,H)=>{c.fillStyle='#3a2c20';c.fillRect(0,0,W,H);for(let y=0;y<H;y+=12)for(let x=(y/12%2)*8;x<W;x+=16){c.fillStyle=['#463526','#33271c','#3e2f22'][(x+y)%3];c.fillRect(x,y,14,10)}},128,128));
      const roofMat=std({map:shingle,roughness:1});const pitch=.75,half=w/2+.35,slope=(d/2+.5)/Math.cos(pitch);
      for(const sgn of [-1,1]){const r=box(half*2,.12,slope,roofMat,0,h+Math.sin(pitch)*slope/2,sgn*Math.cos(pitch)*slope/2,g);r.rotation.x=sgn*pitch}
      for(const sgn of [-1,1]){const gable=add(own(new THREE.ConeGeometry(d/2+.4,Math.tan(pitch)*(d/2+.4),3,1)),dark,sgn*(w/2),h+Math.tan(pitch)*(d/2+.4)/2,0,g);gable.rotation.set(0,Math.PI/2,0);gable.scale.set(1,1,.06)}
      for(const [x,z,ww,dd] of [[0,-d/2,w,t],[-w/2,0,t,d],[w/2,0,t,d],[-w/2+side/2,d/2,side,t],[w/2-side/2,d/2,side,t]])block(s.x+x,s.z+z,ww+.04,dd+.04);
      // The fire in the middle, ringed with stones, under the black cauldron on its chain from the ridge beam.
      const stone=std({color:0x57534d,roughness:1});for(let i=0;i<10;i++){const a=i/10*Math.PI*2,st=add(own(new THREE.DodecahedronGeometry(.15,0)),stone,Math.cos(a)*.62,.08,Math.sin(a)*.62,g);st.scale.set(1,.6,1)}
      const embers=add(own(new THREE.CircleGeometry(.5,16)),std({color:0x2a0c04,emissive:0xff5a14,emissiveIntensity:.8,roughness:1}),0,.03,0,g);embers.rotation.x=-Math.PI/2;
      const flameMat=std({color:0xffa040,emissive:0xff7a1c,emissiveIntensity:2,transparent:true,opacity:.85,depthWrite:false});
      const flames=[[0,0,.55,.17],[.16,.08,.38,.12],[-.14,-.06,.42,.12],[.05,-.15,.3,.1]].map(([x,z,hh,r])=>{const f=add(own(new THREE.ConeGeometry(r,hh,8)),flameMat,x,hh/2+.04,z,g);return {mesh:f,x,z,h:hh}});
      for(let i=0;i<4;i++){const b=cyl(.04,.05,.8,5,dark,(i-1.5)*.13,.08,0,g);b.rotation.set(Math.PI/2,i*.8,0)}
      const beam=box(w,.14,.14,dark,0,h+.05,0,g);const chain=cyl(.012,.012,1.35,4,std({color:0x1a1a1a,roughness:.6,metalness:.6}),0,h-.62,0,g);
      const pot=add(own(new THREE.SphereGeometry(.34,14,10,0,Math.PI*2,Math.PI*.35,Math.PI*.65)),std({color:0x111111,roughness:.5,metalness:.5,side:THREE.DoubleSide}),0,1.12,0,g);
      mark(embers,card('vatra','Ватра'));for(const f of flames)mark(f.mesh,embers.userData);mark(pot,card('cauldron','Чорний котел'));
      block(s.x,s.z,1.2,1.2);state.flames=flames;state.embers=embers;
      // The bench along the north wall, with the story lying on it. It is a seat.
      const bench=box(3.4,.1,.5,dark,-.6,.48,-d/2+.42,g);for(const x of [-2.1,.9])box(.1,.46,.4,dark,x,.23,-d/2+.42,g);block(s.x-.6,s.z-d/2+.42,3.4,.6);
      const book=findBook?.(BOOK);
      if(book){const mesh=add(own(new THREE.BoxGeometry(.32,.44,.05)),own(bookMaterial(book)),s.x+.6,.56,s.z-d/2+.42);mesh.rotation.order='YXZ';mesh.rotation.set(-Math.PI/2+.06,.2,0);
        mesh.userData={type:'book',book,loaded:false,carpathians:true,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:root}};interactables.push(mesh);ours.push(mesh);books.push(mesh)}
      if(registerSeat&&book){registerSeat([bench],g,new THREE.Vector3(-.6,1.08,-d/2+.75),0,{title:'Лавка в стаї',author:QUOTES.book,bookIds:[BOOK]});ours.push(bench)}else mark(bench,card('book','Лавка в стаї'));
      // The vatah's trembita, leaning against the hut's east wall: a long wooden horn bound in birch bark.
      {const p=at('trembita'),tg=new THREE.Group();tg.position.set(p.x,0,p.z);tg.rotation.set(.0,0,-.12);root.add(tg);
        const bark=own(canvasTexture((c,W,H)=>{c.fillStyle='#d8cfb8';c.fillRect(0,0,W,H);for(let y=0;y<H;y+=10){c.fillStyle='rgba(60,40,24,.6)';c.fillRect(0,y,W,2)}c.fillStyle='#7a5636';c.fillRect(0,H-12,W,12)},16,256));
        const horn=cyl(.018,.06,3.1,10,std({map:bark,roughness:.8}),0,1.55,0,tg);const bell=cyl(.06,.07,.08,10,dark,0,.04,0,tg);
        const reach=add(own(new THREE.BoxGeometry(.6,2.2,.6)),basic({transparent:true,opacity:0,depthWrite:false}),.05,1.1,0,tg);
        const data={type:'carp-trembita',title:'Трембіта',author:QUOTES.trembita,action:'BLOW'};for(const part of [horn,bell,reach])mark(part,data);block(p.x,p.z,.5,.5)}
      // The four sheepdogs, lying in the grass before the hut.
      {const fur=std({color:0x2a2622,roughness:1}),pale=std({color:0x8a8072,roughness:1}),p=at('dogs');
        [[-2.2,.2,.4,fur],[-.9,.6,-.3,pale],[.6,.1,.9,fur],[2,.5,2.6,pale]].forEach(([x,z,yaw,m])=>{const dg=new THREE.Group();dg.position.set(p.x+x,0,p.z+z);dg.rotation.y=yaw;root.add(dg);
          const body=add(own(new THREE.SphereGeometry(.3,10,8)),m,0,.2,0,dg);body.scale.set(1,.55,1.9);const head=add(own(new THREE.SphereGeometry(.15,10,8)),m,0,.3,.6,dg);head.scale.set(1,.9,1.3);
          for(const sx of [-.08,.08]){const ear=add(own(new THREE.ConeGeometry(.05,.1,4)),m,sx,.43,.58,dg);ear.rotation.x=-.3}
          for(const part of [body,head])mark(part,card('dogs','Вівчарки'));block(p.x+x,p.z+z,.8,.8)})}
    }

    // ---------- the sheep pen and the cows ----------
    function buildPen(){
      const p=at('pen'),{w,d}=PEN,rail=std({color:0x6a5a44,roughness:1}),parts=[];
      // Posts and split rails, the gate on the west side towards the hut left closed; merged into one mesh.
      const post=new THREE.CylinderGeometry(.06,.07,1.4,6),railG=(len)=>new THREE.BoxGeometry(len,.06,.05);
      const sides=[[-w/2,-d/2,w/2,-d/2],[w/2,-d/2,w/2,d/2],[w/2,d/2,-w/2,d/2],[-w/2,d/2,-w/2,-d/2]];
      for(const [x0,z0,x1,z1] of sides){const len=Math.hypot(x1-x0,z1-z0),n=Math.round(len/1.5),yaw=-Math.atan2(z1-z0,x1-x0);
        for(let i=0;i<n;i++){const x=x0+(x1-x0)*i/n,z=z0+(z1-z0)*i/n;parts.push([post.clone(),0x5a4a38,placed(x,.7,z)])}
        for(const y of [.35,.75,1.15])parts.push([railG(len),0x6a5a44,placed((x0+x1)/2,y,(z0+z1)/2,0,yaw,0)])}
      post.dispose();
      const fence=new THREE.Mesh(joined(parts),std({vertexColors:true,roughness:1}));fence.position.set(p.x,0,p.z);fence.name='carp-fence';root.add(fence);mark(fence,card('fence','Воринє'));
      block(p.x,p.z,w+.4,d+.4);
      // The flock: bodies and heads, white, grey and black. Two instanced meshes.
      const rand=mulberry(91),n=44,o=new THREE.Object3D(),bodies=own(new THREE.InstancedMesh(own(new THREE.SphereGeometry(.32,10,8)),std({color:0xffffff,roughness:1}),n)),heads=own(new THREE.InstancedMesh(own(new THREE.SphereGeometry(.12,8,6)),std({color:0x2a2420,roughness:1}),n));
      const tint=new THREE.Color(),list=[];
      for(let tries=0;tries<2000&&list.length<n;tries++){const x=(rand()-.5)*(w-1.2),z=(rand()-.5)*(d-1.2);if(list.some(s=>Math.hypot(s.x-x,s.z-z)<.85))continue;list.push({x,z,yaw:rand()*7,s:.85+rand()*.3,dark:rand()<.22})}
      list.forEach((s,i)=>{o.position.set(p.x+s.x,.42*s.s,p.z+s.z);o.rotation.set(0,s.yaw,0);o.scale.set(s.s,s.s*.85,s.s*1.45);o.updateMatrix();bodies.setMatrixAt(i,o.matrix);
        bodies.setColorAt?.(i,tint.setHex(s.dark?0x2b2622:[0xd9d2c4,0xc8c0b0,0xe4ddd0][i%3]));
        o.position.set(p.x+s.x+Math.sin(s.yaw)*.5*s.s,.4*s.s,p.z+s.z+Math.cos(s.yaw)*.5*s.s);o.scale.setScalar(s.s);o.updateMatrix();heads.setMatrixAt(i,o.matrix)});
      bodies.count=heads.count=list.length;bodies.instanceMatrix.needsUpdate=heads.instanceMatrix.needsUpdate=true;bodies.position.set(0,0,0);root.add(bodies,heads);
      // An InstancedMesh is picked by its own position: one stands where its sheep are, and answers for them.
      const flockHit=add(own(new THREE.BoxGeometry(w-.6,.9,d-.6)),basic({transparent:true,opacity:0,depthWrite:false}),p.x,.45,p.z);mark(flockHit,card('sheep','Отара'));
      state.sheep=list.length;
      // Three cows grazing under the forest to the north, with bells.
      const c=at('cows'),hide=std({color:0x6b4a2e,roughness:1}),pale=std({color:0xb8a890,roughness:1});
      [[0,0,.6,hide],[3.4,-2.2,2.2,pale],[-3,-1.5,-.8,hide]].forEach(([x,z,yaw,m])=>{const cg=new THREE.Group();cg.position.set(c.x+x,0,c.z+z);cg.rotation.y=yaw;root.add(cg);
        const body=box(.6,.6,1.4,m,0,.95,0,cg);const head=box(.3,.3,.45,m,0,.75,.86,cg);head.rotation.x=.7;
        for(const [lx,lz] of [[-.22,-.55],[.22,-.55],[-.22,.55],[.22,.55]])box(.1,.66,.1,m,lx,.33,lz,cg);
        const bell=add(own(new THREE.CylinderGeometry(.04,.07,.1,8)),std({color:0xa88a3a,roughness:.4,metalness:.7}),0,.5,.72,cg);
        for(const part of [body,head,bell])mark(part,card('cows','Корови'));block(c.x+x,c.z+z,1.4,1.4)});
    }

    // ---------- the stone, the floyara, the windfall and the goats ----------
    function buildStone(){
      const s=at('stone'),moss=std({color:0x5a4a2a,roughness:1,flatShading:true});
      const rock=add(own(new THREE.DodecahedronGeometry(.9,0)),moss,s.x,.5,s.z);rock.scale.set(1.3,.75,1);mark(rock,card('stone','Камінь у мохах'));block(s.x,s.z,2.3,1.8);
      const tufts=std({color:0x3c5a2a,roughness:1});for(let i=0;i<6;i++){const t=add(own(new THREE.IcosahedronGeometry(.18,0)),tufts,s.x+Math.cos(i)*1,.12,s.z+Math.sin(i*1.7)*.7);t.scale.set(1.4,.5,1.4)}
      // Ivan's floyara on top: a long flute with its holes near the foot, and a glint so it is found.
      const reed=own(canvasTexture((c,W,H)=>{c.fillStyle='#b48a52';c.fillRect(0,0,W,H);c.fillStyle='#2a1a0e';for(let i=0;i<6;i++){c.beginPath();c.arc(W/2,H*.62+i*H*.05,W*.2,0,7);c.fill()}c.fillStyle='#6a3a1e';for(const y of [.1,.3,.9])c.fillRect(0,H*y,W,H*.02)},16,256));
      const pipe=add(own(new THREE.CylinderGeometry(.016,.02,.9,8)),std({map:reed,roughness:.55}),s.x,1.17,s.z);pipe.rotation.set(0,.4,Math.PI/2-.06);
      const glint=add(own(new THREE.SphereGeometry(.045,8,6)),std({color:0xfff2c8,emissive:0xffe6a0,emissiveIntensity:1.1}),s.x+.4,1.2,s.z-.16);
      const reach=add(own(new THREE.BoxGeometry(1.2,1.4,.8)),basic({transparent:true,opacity:0,depthWrite:false}),s.x,1.5,s.z);
      const data={type:'carp-floyara',title:'Флояра',author:QUOTES.floyara,action:'PLAY'};for(const part of [pipe,glint,reach])mark(part,data);state.glint=glint;
      // The windfall behind it: three spruces blown down, their root-plates standing up like walls.
      const r=at('roots'),bark=std({color:0x3a2d22,roughness:1}),earth=std({color:0x2c2318,roughness:1});
      [[0,0,.3],[1.6,2.4,-.5],[-1.4,-2.2,.9]].forEach(([x,z,yaw])=>{const fg=new THREE.Group();fg.position.set(r.x+x,0,r.z+z);fg.rotation.y=yaw;root.add(fg);
        const trunk=cyl(.2,.28,7,8,bark,-3.5,.28,0,fg);trunk.rotation.z=Math.PI/2;const plate=add(own(new THREE.CircleGeometry(1.15,10)),earth,0,1,0,fg);plate.rotation.y=Math.PI/2;
        for(let i=0;i<7;i++){const a=i/7*Math.PI*2,root0=cyl(.03,.07,1.1,4,bark,.05,1+Math.sin(a)*.7,Math.cos(a)*.7,fg);root0.rotation.x=a}
        mark(plate,card('roots','Вивернуте коріння'));mark(trunk,plate.userData)});
      block(r.x,r.z,3.4,7.6);
      // The goats: bearded billy-goats who come out of the roots while the tune plays, and go back into them.
      const coat=std({color:0x6d6458,roughness:1}),horn=std({color:0x3b342c,roughness:.7}),eye=std({color:0x111111,emissive:0x998844,emissiveIntensity:.4});
      state.goats=[[-.6,1.6,1.3],[.2,-.4,1.6],[1.2,2.9,1.4],[-1.1,-2.6,1.8]].map(([x,z,yaw],i)=>{const gg=new THREE.Group();gg.position.set(r.x+1.5+x*.3,0,r.z+z);gg.rotation.y=yaw;root.add(gg);
        const body=box(.36,.36,.7,coat,0,.6,0,gg);const neck=new THREE.Group();neck.position.set(0,.8,.32);gg.add(neck);
        const head=box(.2,.22,.34,coat,0,.08,.14,neck);const beard=add(own(new THREE.ConeGeometry(.05,.18,5)),coat,0,-.08,.26,neck);beard.rotation.x=Math.PI;
        for(const sx of [-.06,.06]){const h0=add(own(new THREE.ConeGeometry(.025,.26,5)),horn,sx,.28,.02,neck);h0.rotation.x=-.6;add(own(new THREE.SphereGeometry(.02,6,4)),eye,sx*1.6,.14,.24,neck)}
        for(const [lx,lz] of [[-.12,-.25],[.12,-.25],[-.12,.25],[.12,.25]])box(.06,.44,.06,coat,lx,.22,lz,gg);
        gg.scale.setScalar(.001);gg.visible=false;return {group:gg,neck,phase:i*1.3}});
    }
    // The book left on the stone once the goats have gone: Marko Cheremshyna's Hutsul stories.
    function showFound(){
      if(!state||state.foundMesh)return;const book=findBook?.(FOUND_BOOK);if(!book)return;const s=at('stone');
      const mesh=add(own(new THREE.BoxGeometry(.3,.42,.05)),own(bookMaterial(book)),s.x-.35,1.21,s.z+.2);mesh.rotation.order='YXZ';mesh.rotation.set(-Math.PI/2+.1,-.5,0);
      mesh.userData={type:'book',book,loaded:false,carpathians:true,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:root}};interactables.push(mesh);ours.push(mesh);books.push(mesh);state.foundMesh=mesh;
    }

    // ---------- the white herdsman ----------
    // Out on the knoll by the lone spruce, once a visit, a tall white figure and his deer in the mist; then a gust, and gone.
    function buildHerdsman(){
      const k=SPOTS.knoll,ky=heightAt(Math.hypot(k.x,k.z))+.4,g=new THREE.Group();g.position.set(CENTRE.x+k.x+4,ky,CENTRE.z+k.z+3);root.add(g);
      const man=own(canvasTexture((c,W,H)=>{c.clearRect(0,0,W,H);const glow=c.createRadialGradient(W/2,H*.5,0,W/2,H*.5,W*.5);glow.addColorStop(0,'rgba(235,240,255,.22)');glow.addColorStop(1,'rgba(235,240,255,0)');c.fillStyle=glow;c.fillRect(0,0,W,H);
        c.fillStyle='rgba(238,242,250,.92)';c.beginPath();c.moveTo(W*.4,H*.2);c.lineTo(W*.3,H*.98);c.lineTo(W*.7,H*.98);c.lineTo(W*.6,H*.2);c.fill();c.beginPath();c.arc(W/2,H*.14,W*.09,0,7);c.fill();
        c.strokeStyle='rgba(238,242,250,.9)';c.lineWidth=W*.03;c.beginPath();c.moveTo(W*.66,H*.3);c.lineTo(W*.82,H*.98);c.stroke()},128,256));
      const deer=own(canvasTexture((c,W,H)=>{c.clearRect(0,0,W,H);c.fillStyle='rgba(225,230,242,.85)';c.beginPath();c.ellipse(W*.5,H*.55,W*.28,H*.13,0,0,7);c.fill();
        c.fillRect(W*.3,H*.6,W*.04,H*.35);c.fillRect(W*.38,H*.6,W*.04,H*.35);c.fillRect(W*.6,H*.6,W*.04,H*.35);c.fillRect(W*.68,H*.6,W*.04,H*.35);
        c.beginPath();c.moveTo(W*.72,H*.5);c.lineTo(W*.82,H*.3);c.lineTo(W*.9,H*.34);c.lineTo(W*.8,H*.55);c.fill();
        c.strokeStyle='rgba(225,230,242,.85)';c.lineWidth=3;c.beginPath();for(const [x0,y0,x1,y1] of [[.83,.3,.78,.08],[.8,.18,.7,.1],[.86,.3,.94,.08],[.9,.18,.98,.12]]){c.moveTo(W*x0,H*y0);c.lineTo(W*x1,H*y1)}c.stroke()},128,128));
      const figures=[];const sprite=(map,w,h,x,y,z)=>{const s=new THREE.Sprite(own(new THREE.SpriteMaterial({map,transparent:true,opacity:0,depthWrite:false,fog:false})));s.scale.set(w,h,1);s.position.set(x,y,z);g.add(s);figures.push(s);return s};
      sprite(man,1.3,2.9,0,1.45,0);for(const [x,z,s] of [[-3,1,1.6],[-1.6,2.4,1.9],[1.8,1.6,1.7],[3.2,-.4,2.1],[.4,3.6,1.8]])sprite(deer,s*1.3,s,x,s/2,z);
      g.visible=false;state.herdsman={group:g,figures,shownAt:0,done:false};
    }

    // ---------- the door home ----------
    function buildDoor(){
      const p=at('door'),g=new THREE.Group();g.position.set(p.x,0,p.z+1.2);root.add(g);
      const wood=std({color:0x6a4a2c,roughness:.7}),frame=std({color:0x3e2a18,roughness:.8});
      const carving=own(canvasTexture((c,W,H)=>{c.fillStyle='#6a4a2c';c.fillRect(0,0,W,H);c.strokeStyle='#d8b36a';c.lineWidth=3;
        for(let y=H*.12;y<H*.9;y+=H*.2){c.beginPath();c.moveTo(W/2,y);c.lineTo(W*.75,y+H*.08);c.lineTo(W/2,y+H*.16);c.lineTo(W*.25,y+H*.08);c.closePath();c.stroke();c.beginPath();c.arc(W/2,y+H*.08,W*.06,0,7);c.stroke()}
        c.fillStyle='#b3202a';for(let y=H*.05;y<H;y+=H*.2)c.fillRect(W*.1,y,W*.8,3)},128,256));
      const leaf=box(1.4,2.5,.12,std({map:carving,roughness:.7}),0,1.25,0,g);
      for(const [w,h,x,y] of [[1.7,.16,0,2.58],[.15,2.66,-.78,1.33],[.15,2.66,.78,1.33]])box(w,h,.2,frame,x,y,0,g);
      const towel=own(canvasTexture((c,W,H)=>{c.fillStyle='#efe6d2';c.fillRect(0,0,W,H);for(let y=20;y<H;y+=70){c.fillStyle='#b3202a';for(let i=0;i<5;i++){c.fillRect(W/2-6-i*6,y+i*6,12+i*12,6)}c.fillStyle='#1c1c1c';c.fillRect(W*.2,y+34,W*.6,4)}},64,256));
      const rushnyk=add(own(new THREE.PlaneGeometry(.3,1.5)),std({map:towel,roughness:.9,side:THREE.DoubleSide}),1.05,1.7,-.08,g);
      const plateMap=own(canvasTexture((c,W,H)=>{c.fillStyle='#b8913a';c.fillRect(0,0,W,H);c.strokeStyle='#5a4214';c.lineWidth=4;c.strokeRect(4,4,W-8,H-8);c.fillStyle='#2a1c08';c.textAlign='center';c.textBaseline='middle';
        c.font=`bold ${Math.round(H*.34)}px Georgia`;c.fillText('УКРАЇНСЬКА ЧИТАЛЬНЯ',W/2,H*.4);c.font=`italic ${Math.round(H*.22)}px Georgia`;c.fillText('The Ukrainian Reading Room',W/2,H*.74)},512,96));
      const plate=add(own(new THREE.PlaneGeometry(.9,.17)),std({map:plateMap,roughness:.4,metalness:.5}),0,1.75,-.07,g);plate.rotation.y=Math.PI;
      const data={type:'carp-exit',title:'Різьблені двері',author:QUOTES.door,action:'RETURN'};for(const part of [leaf,rushnyk,plate])mark(part,data);block(p.x,p.z+1.2,1.9,.5);
    }

    // ---------- the lookout ----------
    // A log bench at the polonyna's north-west edge, turned to Chornohora across the mist. It is a seat.
    function buildLookout(){
      const p=at('lookout'),c=at('chornohora'),yaw=Math.atan2(-(c.x-p.x),-(c.z-p.z)),g=new THREE.Group();g.position.set(p.x,0,p.z);g.rotation.y=yaw;root.add(g);
      const wood=std({color:0x4a3b2c,roughness:1});const log=cyl(.2,.22,2.2,9,wood,0,.36,0,g);log.rotation.z=Math.PI/2;
      for(const x of [-.8,.8])box(.3,.2,.34,wood,x,.1,0,g);block(p.x,p.z,2,2);
      if(registerSeat&&findBook?.(BOOK)){registerSeat([log],g,new THREE.Vector3(0,1.1,.35),yaw,{title:'Колода над урвищем',author:QUOTES.chornohora,bookIds:[BOOK]});ours.push(log)}else mark(log,card('chornohora','Колода над урвищем'));
    }

    // ---------- building and freeing ----------
    function build(){
      if(root)return;root=new THREE.Group();root.name='carpathians';state={playingUntil:0,callUntil:0,goatsAt:0,goatsShown:0,foundMesh:null};
      buildGround();buildSpruces();buildDistance();buildStaia();buildPen();buildStone();buildHerdsman();buildDoor();buildLookout();if(found())showFound();scene.add(root);
    }
    function unload(){
      if(!root)return;root.removeFromParent();root=null;state=null;arrivedAt=null;
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
      return !trunks.some(t=>Math.abs(t.x-x)<2.5&&Math.abs(t.z-z)<2.5&&Math.hypot(t.x-x,t.z-z)<t.r+r);
    }

    // ---------- doing things ----------
    function enter(from='link'){
      activate();move(ARRIVAL.x,ARRIVAL.z,ARRIVAL.yaw);arrivedAt=time;
      showNotice((from==='trembita'?'Трембіта озивається в горах, і читальня зникає. ':from==='book'?'Сторінка відкривається, як полонина. ':'')+
        'Полонина під Чорногорою, літня ніч: стая з ватрою, отара в кошарі, а внизу море мряки. ('+
        (from==='trembita'?'The trembita answers from the mountains, and the reading room is gone. ':from==='book'?'The page opens like a mountain pasture. ':'')+
        'The polonyna under Chornohora on a summer night: the shepherds’ hut with its fire, the flock in the pen, and below, a sea of mist.)',13);
      analytics?.track('Room Explored',{room:'carpathians'});
    }
    function leave(){if(toRoom)toRoom();playSample?.('doorOpen',.6,1.05)}
    const playNotes=(notes,voice,beat,startAt=0,vol=.06)=>{if(!tone)return notes.reduce((s,[,b])=>s+b*beat,0);let t=startAt;for(const [f,b] of notes){tone(f,t,b*beat+.18,vol,voice);t+=b*beat}return t-startAt};
    function blow(){
      if(!state)return;if(time<state.callUntil){showNotice('Трембіта ще звучить. (The trembita is still sounding.)',3);return}
      state.callUntil=time+Math.max(4,playNotes(CALL,'trembita',.55,0,.07));showNotice(QUOTES.trembita,11);
    }
    function play(){
      if(!state)return;if(time<state.playingUntil){showNotice('Флояра ще грає. (The floyara is still playing.)',3);return}
      const first=playNotes(LOST,'flute',.42),second=playNotes(FOUND,'flute',.3,first+.5);
      state.playingUntil=time+Math.max(8,first+.5+second);state.goatsAt=time+first+.5;state.goatsShown=0;
      showNotice(QUOTES.lost,Math.max(4,first+.5));
    }
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('carp-'))return false;
      if(data.type==='carp-floyara'){play();return true}
      if(data.type==='carp-trembita'){blow();return true}
      if(data.type==='carp-exit'){leave();return true}
      if(data.type==='carp-card'){showNotice(`${data.title}: ${data.author}`,data.author.length>180?14:10);return true}
      return false;
    }

    // ---------- each frame ----------
    function update(t,dt=0){
      time=t;const {x,z}=player.pos,inside=contains(x,z);if(inside){activate();if(arrivedAt===null)arrivedAt=t}
      if(!root)return;
      if(!inside&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==root)){unload();return}
      if(inside){scene.background.setRGB(.012,.018,.042);scene.fog.color.setRGB(.02,.028,.05);scene.fog.density=.012;if(ambient)ambient.intensity*=.55;if(moonlight)moonlight.intensity*=.9}
      const still=isReducedMotion()?0:1;
      // The fire: the flames flicker and lean, the embers breathe.
      for(const b of state.flames){const f=b.mesh,k=1+(.18*Math.sin(t*9.3+b.x*40)+.1*Math.sin(t*17.1+b.z*30))*still;f.scale.set(1,k,1);f.position.y=b.h*k/2+.04;f.position.x=b.x+Math.sin(t*5.1+b.z*20)*.012*still}
      state.embers.material.emissiveIntensity=.7+(.15*Math.sin(t*3.1)+.08*Math.sin(t*7.7))*still;
      if(state.glint)state.glint.material.emissiveIntensity=t<state.playingUntil?2:.8+.3*Math.sin(t*1.7);
      if(state.mist?.material.map)state.mist.material.map.offset.set(t*.003*still,t*.0015*still);
      // The goats: up out of the roots when the second phrase begins, shaking their heads, and back into the roots after it.
      if(state.goatsAt){const since=t-state.goatsAt,end=state.playingUntil-state.goatsAt,grow=since<0?0:since<.8?since/.8:since<end+1?1:Math.max(0,1-(since-end-1)/1.2);
        if(since>=0&&!state.goatsShown){state.goatsShown=1;showNotice(QUOTES.goats,10)}
        for(const goat of state.goats){goat.group.visible=grow>.01;goat.group.scale.setScalar(Math.max(.001,grow));goat.neck.rotation.z=Math.sin(t*7+goat.phase)*.35*still*grow}
        if(since>end+2.3){state.goatsAt=0;for(const goat of state.goats)goat.group.visible=false;
          const first=!found();if(first){try{storage?.setItem(FOUND_KEY,'1')}catch(e){}analytics?.track('Secret Found',{secret:'carpathians-goats'})}
          const had=!!state.foundMesh;showFound();showNotice(had?QUOTES.roots:QUOTES.found,12)}}
      // The white herdsman, once a visit, when the reader has been up here a little while.
      const hm=state.herdsman;
      if(inside&&!hm.done&&!hm.shownAt&&arrivedAt!==null&&t-arrivedAt>40){hm.shownAt=t;hm.group.visible=true;showNotice(QUOTES.herdsman,12)}
      if(hm.shownAt&&!hm.done){const since=t-hm.shownAt,o=since<2.5?since/2.5:since<11?1:Math.max(0,1-(since-11)/1.4);
        hm.figures.forEach((s,i)=>{s.material.opacity=o*(i?.75:.9);if(i)s.position.x+=Math.sin(t*.4+i)*.002*still});
        if(since>12.6){hm.done=true;hm.group.visible=false;showNotice(QUOTES.gone,9)}}
    }

    return {contains,floorAt,allowed,interact,update,enter,leave,unload,play,blow,zoneAt:(x,z)=>contains(x,z)?'carpathians':null,
      centre:CENTRE,walk:WALK,spots:SPOTS,staia:STAIA,pen:PEN,quotes:QUOTES,arrival:ARRIVAL,book:BOOK,foundBook:FOUND_BOOK,call:CALL,tune:[LOST,FOUND],heightAt,
      get built(){return !!root},get books(){return books.slice()},get spruces(){return state?.spruces??null},get sheep(){return state?.sheep??null},
      get goatsOut(){return !!state?.goats?.some(g=>g.group.visible)},get found(){return found()},get herdsmanSeen(){return !!state?.herdsman?.shownAt}};
  };
})();
