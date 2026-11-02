// The mountain in the painting: a painting of a peak by moonlight hangs on the Grand Hall's north wall, beside the
// fire, and a reader who steps into it stands in a meadow at the foot of the mountain it shows. One path climbs from
// the meadow round and round the mountain to the summit, getting higher, snowier and craggier as it goes: pines and
// grass at the foot, scree and boulders above the trees, snow lying thicker with every turn, then crags and pinnacles
// and falling snow, and the summit standing above a sea of cloud, ringed by other peaks. The books are found, not
// shelved: the valley's in the stone hut in the meadow, the climbers' at small cairns beside the path, each cairn
// scratched with the year of its climb. A rope fixed at the summit lets the reader down the west face in one long
// abseil to the meadow, where the painting's frame stands in the grass with the Grand Hall's lamplight in it.
// The summit's secret: look down at the cloud on the side away from the moon, and a giant figure stands on it with a
// glory round its head, which is the reader's own shadow (the spectre of the Brocken); when it has been seen, the
// library's Coleridge lies on the summit cairn, open at the poem about it. Every quotation is checked by a test.
//
// Nothing but the painting is built until the reader goes in, and it is all freed a while after they leave. It adds
// no lights: the library's moonlight and ambient light it, the snow is pale enough to read by, and the ground is one
// mesh, the trees, rocks and crags three InstancedMeshes.
(function(){
  'use strict';

  // Far from everything else: Nemo's salon is at x 1000, z 200, the Deep Wood at x 800, z 400.
  const CENTRE={x:1100,z:700},KEEP=25;
  // The mountain's shape: the path rises from the meadow (r 50) to the rim of the summit (r 7, y 44). The flanks
  // steepen towards the top (a quarter cosine), so the path, which keeps one gentle grade, winds closer and closer.
  const TOP=46,R0=50,R1=5,GRADE=.21,MEADOW={inner:47,outer:66},WALL=64,EDGE=120;
  // The path starts at the south, in the meadow, and goes round anticlockwise seen from above; it reaches the summit
  // on its east side. The rope goes down the west face; the cloud is watched from the north rim, away from the moon.
  const ROPE_THETA=Math.PI*1.5,LEDGE_THETA=Math.PI;
  // The moon: low in the south. Its antipoint, where a shadow falls, is to the north and below the horizon.
  const MOON_DIR=(()=>{const az=.3,el=.44;return {x:Math.sin(az)*Math.cos(el),y:Math.sin(el),z:Math.cos(az)*Math.cos(el)}})();
  const CLOUD_Y=30;
  // The painting on the Grand Hall's north wall, on the pier between the fireplace and the next window.
  const HALL_PAINTING={x:-7.78,y:4.45,z:-29.93,w:1.9,h:2.6};
  const HALL_SPOT={x:-7.8,z:-26.6,yaw:Math.PI};
  // The library's own copies left beside the path (book-pages.mjs reads this list).
  const OWN=[755,32540];
  // The cairns beside the path: how far up the path (0 at the meadow, 1 at the summit), the year scratched on the top
  // stone, and the books left there. In the order the climbs were made, except Whymper, who waits by the rope.
  const STATIONS=[
    {f:.07,year:1336,ids:[48776]},{f:.14,year:1819,ids:[32823]},{f:.21,year:1848,ids:[6478]},{f:.28,year:1856,ids:[34192,31623]},
    {f:.35,year:1861,ids:[47209]},{f:.42,year:1864,ids:[54046]},{f:.49,year:1873,ids:[755]},{f:.55,year:1878,ids:[35434]},
    {f:.61,year:1886,ids:[37993]},{f:.67,year:1890,ids:[60919]},{f:.73,year:1894,ids:[10012,32540]},{f:.79,year:1895,ids:[45747]},
    {f:.85,year:1897,ids:[56043]},{f:.91,year:1903,ids:[42758]},{f:.97,year:1865,ids:[41234]}
  ];
  const QUOTES={
    // Whymper's last words in Scrambles Amongst the Alps (book 41234), on the rope's anchor.
    rope:'An iron stanchion leaded into the rock, and a rope fixed to it going down the west face into the cloud, all the way to the meadow. Someone has scratched on the iron: “Do nothing in haste, look well to each step, and from the beginning think what may be the end.” (Whymper, Scrambles Amongst the Alps)',
    // Muir in a Douglas spruce in a gale, The Mountains of California (book 10012), on the bent pine.
    pine:'A pine bent by the wind, its top still swaying. John Muir climbed one in a storm in the Sierra to hear the forest from above: “never before did I enjoy so noble an exhilaration of motion.” (The Mountains of California)',
    // Coleridge, Constancy to an Ideal Object (book 29090), when the shadow on the cloud has been seen.
    spectre:'“An image with a glory round its head; / The enamoured rustic worships its fair hues, / Nor knows he makes the shadow he pursues!” (Coleridge, Constancy to an Ideal Object)',
    signpost:'A yellow signpost, as in the Alps. Its arms say THE SUMMIT, pointing up the path; THE HUT; and, pointing back the way you came, THE PAINTING.',
    hut:'A stone hut for anyone caught on the mountain: a slate roof, a lantern, a bench, and a shelf of books about the valleys, left for the next comer. Somewhere below, out of sight, a cowbell clanks.',
    frame:'The frame you stepped through, standing on its own in the grass. Through it, the Grand Hall: lamplight, the fire, the shelves.',
    summit:'The summit: a cairn, an old tin box with a register in it, and nothing higher in sight but the other peaks and the moon.',
    cloud:'A sea of cloud, lying in the valleys and lit by the moon, with the peaks standing out of it like islands. The moon is behind you. Look down at the cloud on the side away from it.',
    snow:'Snow lying on the path, trodden by somebody who came up before you.'
  };
  const mulberry=seed=>()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296};
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t)};

  // ---------- the shape of the mountain ----------
  function baseHeight(r){
    if(r<=R1)return TOP+.25*(1-(r/R1)**2);
    if(r>=R0)return 0;
    return TOP*((R0-r)/(R0-R1))**1.8;
  }
  function baseSlope(r){return r<=R1||r>=R0?0:TOP*1.8*((R0-r)/(R0-R1))**.8/(R0-R1)}
  // Value noise, for crags: a hash on a grid, smoothly interpolated, in a few octaves.
  function hash(ix,iz){let h=Math.imul(ix,374761393)+Math.imul(iz,668265263)|0;h=Math.imul(h^h>>>13,1274126177);return ((h^h>>>16)>>>0)/4294967296}
  function noise(x,z){const ix=Math.floor(x),iz=Math.floor(z),fx=x-ix,fz=z-iz,u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz);
    const a=hash(ix,iz),b=hash(ix+1,iz),c=hash(ix,iz+1),d=hash(ix+1,iz+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
  function crag(x,z){let s=0,a=1,f=.12;for(let i=0;i<5;i++){s+=(1-Math.abs(noise(x*f,z*f)*2-1))**2*a;a*=.52;f*=2.05}return s}
  // The ring of other peaks round the valley.
  function ringHeight(r,theta){if(r<=WALL)return 0;const rise=smooth(WALL,WALL+34,r);
    return rise*rise*(36+18*Math.sin(3*theta+1)+12*Math.sin(7*theta+2.3)+7*Math.sin(13*theta+.4)+4*Math.sin(29*theta))}

  // ---------- the path ----------
  // Traced once: from the meadow straight towards the mountain until the slope steepens past the grade, then round
  // it, always at the same grade, until it reaches the rim of the summit, and a few steps on across the top.
  const PATH=(()=>{
    const pts=[],dl=.4;let r=R0+5,theta=0,length=0;
    while(r>R1+.02){pts.push({x:r*Math.sin(theta),z:r*Math.cos(theta),y:baseHeight(r),s:length,r,theta});const s=baseSlope(r),a=s<=GRADE?1:GRADE/s;r-=a*dl;theta+=Math.sqrt(1-a*a)*dl/r;length+=dl}
    for(let k=1;k<=8;k++){const rr=R1-k*.45;length+=.5;pts.push({x:rr*Math.sin(theta),z:rr*Math.cos(theta),y:baseHeight(rr),s:length,r:rr,theta})}
    for(const p of pts)p.f=p.s/length;
    return {pts,length,endTheta:theta};
  })();
  // A coarse grid of the path's segments, so the nearest point on it is found quickly.
  const CELL=6,cells=new Map();
  for(let i=0;i<PATH.pts.length-1;i++){const a=PATH.pts[i];const k=`${Math.floor(a.x/CELL)},${Math.floor(a.z/CELL)}`;if(!cells.has(k))cells.set(k,[]);cells.get(k).push(i)}
  // The nearest point of the path to a place (in the mountain's own frame): its distance, height and how far up it is.
  function nearestPath(x,z){
    const cx=Math.floor(x/CELL),cz=Math.floor(z/CELL);let best=null,bestD=1e9;
    for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){const list=cells.get(`${cx+dx},${cz+dz}`);if(!list)continue;
      for(const i of list){const a=PATH.pts[i],b=PATH.pts[i+1],ex=b.x-a.x,ez=b.z-a.z,l=ex*ex+ez*ez||1,t=clamp(((x-a.x)*ex+(z-a.z)*ez)/l,0,1),d=Math.hypot(x-a.x-t*ex,z-a.z-t*ez);
        if(d<bestD){bestD=d;best={d,y:a.y+(b.y-a.y)*t,f:a.f+(b.f-a.f)*t,i}}}}
    return best||{d:1e9,y:0,f:0,i:-1};
  }
  // The ground: the mountain, its crags and the ring of peaks, with a level shelf cut for the path.
  function groundAt(x,z){
    const r=Math.hypot(x,z),theta=Math.atan2(x,z),base=baseHeight(r)+ringHeight(r,theta);
    const rough=r>=MEADOW.inner&&r<=WALL?.35:(.5+4.6*smooth(4,40,baseHeight(r))+6*smooth(WALL,WALL+24,r))*smooth(R1+.5,R1+5,r);
    const wild=base+(crag(x,z)-.45)*rough;
    const p=nearestPath(x,z);if(p.d>4.2)return wild;
    const w=smooth(1.4,4.2,p.d);return p.y+(wild-p.y)*w;
  }
  const pointAt=f=>{const pts=PATH.pts,i=clamp(Math.round(f*(pts.length-1)),0,pts.length-1);return pts[i]};

  window.createMountain=function(options){
    const {THREE,scene,MAT,player,camera=null,ambient=null,moon:moonlight=null,interactables,canvasTexture,bookMaterial,findBook,arrivals={},showNotice,playSample,sound,
      move,moveTo=null,analytics,toHall=null,registerSeat=null,isHolding=()=>false,isReducedMotion=()=>false,storage=window.localStorage}=options;
    const FOUND_KEY='athenaeum-mountain-found',SPECTRE_KEY='athenaeum-mountain-spectre',SUMMITS_KEY='athenaeum-mountain-summits';
    const W=(x,z)=>({x:CENTRE.x+x,z:CENTRE.z+z});
    const ARRIVAL={...W(0,57.4),yaw:0},FRAME={...W(0,60.4)},ROPE_FOOT={...W(-53.5,0),yaw:-Math.PI/2};
    let root=null,time=0,lastNeeded=-1e9,state=null,hallPainting=null,foundCache=null,abseil=null,spectreSeen=false,watch=0,visitedSummit=false;
    const owned=[],ours=[],books=[],blockers=[],trunks=[];
    const own=thing=>{owned.push(thing);return thing};
    const std=params=>own(new THREE.MeshStandardMaterial(params));
    function add(geometry,material,x,y,z,parent){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
    const cyl=(rt,rb,h,seg,material,x,y,z,parent)=>add(own(new THREE.CylinderGeometry(rt,rb,h,seg)),material,x,y,z,parent);
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    const card=(key,title,action='LOOK')=>({type:'mountain-card',key,title,author:QUOTES[key],action});
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const read=key=>{try{return storage?.getItem(key)}catch(e){return null}};
    const write=(key,value)=>{try{storage?.setItem(key,value)}catch(e){}};
    const found=()=>{try{return new Set(JSON.parse(read(FOUND_KEY)||'[]'))}catch(e){return new Set()}};
    spectreSeen=read(SPECTRE_KEY)==='1';
    // Heights in the world.
    const groundWorld=(x,z)=>groundAt(x-CENTRE.x,z-CENTRE.z);

    // The books: those listed for each shelf in data/new-books.js, and the library's own two.
    const shelf=room=>(arrivals[room]||[]).map(id=>findBook(id)).filter(Boolean);
    function catalogue(){const path=shelf('path');for(const id of OWN){const b=findBook(id);if(b&&!path.some(p=>p.id===id))path.push(b)}return {valley:shelf('valley'),path,spectre:shelf('spectre')}}

    // ---------- geometry helpers ----------
    function joined(parts){
      const positions=[],normals=[],colours=[],colour=new THREE.Color();
      for(const [geometry,hex,matrix] of parts){const g=geometry.index?geometry.toNonIndexed():geometry;if(matrix)g.applyMatrix4(matrix);g.computeVertexNormals();colour.setHex(hex);
        const p=g.attributes.position,n=g.attributes.normal;for(let i=0;i<p.count;i++){positions.push(p.getX(i),p.getY(i),p.getZ(i));normals.push(n.getX(i),n.getY(i),n.getZ(i));colours.push(colour.r,colour.g,colour.b)}
        g.dispose();if(g!==geometry)geometry.dispose()}
      const out=new THREE.BufferGeometry();out.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));out.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));out.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));return own(out);
    }
    const placed=(x,y,z,rx=0,ry=0,rz=0,s=1)=>new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)),new THREE.Vector3(s,s,s));
    function instanced(geometry,material,list,name){
      const mesh=new THREE.InstancedMesh(geometry,material,Math.max(1,list.length));mesh.name=name;mesh.count=list.length;const o=new THREE.Object3D();
      list.forEach((t,i)=>{o.position.set(t.x,t.y,t.z);o.rotation.set(t.rx||0,t.ry||0,t.rz||0);o.scale.set(t.sx??t.s,t.sy??t.s,t.sz??t.s);o.updateMatrix();mesh.setMatrixAt(i,o.matrix)});
      mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere?.();root.add(mesh);return mesh;
    }

    // ---------- the ground ----------
    // One mesh from the meadow to the far peaks, coloured by height and steepness: grass, then scree and rock, then
    // snow, which lies everywhere high up except on the steepest crags.
    function groundColour(y,slope,n,r){
      const grass=[.16,.2,.12],scree=[.24,.23,.22],rock=[.17,.17,.19],snow=[.66,.7,.78];
      const snowy=clamp(smooth(13,34,y+(n-.5)*12)*(1-.9*smooth(.85,1.45,slope+(n-.5)*.6))+(r>WALL?smooth(30,55,y)*(1-.7*smooth(1.1,1.8,slope)):0),0,1);
      const grassy=(1-smooth(5,12,y+(n-.5)*4))*(1-smooth(.5,.9,slope));
      const rocky=smooth(.9,1.6,slope);
      const out=[];for(let k=0;k<3;k++){let c=scree[k]*(1-grassy)+grass[k]*grassy;c=c*(1-rocky)+rock[k]*rocky;c=c*(1-snowy)+snow[k]*snowy;out.push(Math.pow(clamp(c*(.85+n*.3),0,1),2.2))}
      return out;
    }
    function buildGround(){
      const N=150,size=EDGE*2,step=size/N,positions=new Float32Array((N+1)*(N+1)*3),colours=new Float32Array((N+1)*(N+1)*3),index=[];
      const heights=new Float32Array((N+1)*(N+1));
      for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){const x=-EDGE+i*step,z=-EDGE+j*step,r=Math.hypot(x,z);let y=r>EDGE+4?ringHeight(EDGE,Math.atan2(x,z)):groundAt(x,z);
        // Under the path's own strip the ground sits a little lower, so the strip is always seen.
        if(r<R0+8){const p=nearestPath(x,z);if(p.d<1.3)y-=.14}
        heights[j*(N+1)+i]=y}
      for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){const k=j*(N+1)+i,x=-EDGE+i*step,z=-EDGE+j*step,y=heights[k];
        const hx=heights[j*(N+1)+Math.min(N,i+1)]-heights[j*(N+1)+Math.max(0,i-1)],hz=heights[Math.min(N,j+1)*(N+1)+i]-heights[Math.max(0,j-1)*(N+1)+i],slope=Math.hypot(hx,hz)/(2*step);
        positions.set([CENTRE.x+x,y,CENTRE.z+z],k*3);colours.set(groundColour(y,slope,noise(x*.31,z*.31),Math.hypot(x,z)),k*3)}
      for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+1,c=a+N+1,d=c+1;index.push(a,c,b,b,c,d)}
      const g=own(new THREE.BufferGeometry());g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));g.setIndex(index);g.computeVertexNormals();
      const ground=new THREE.Mesh(g,std({vertexColors:true,roughness:1,emissive:0x0a0d14,emissiveIntensity:1}));ground.name='mountain-ground';root.add(ground);state.ground=ground;
    }
    // The path's own strip: worn earth at the foot, scree in the middle, trodden snow at the top.
    function buildPath(){
      const pts=PATH.pts,positions=[],colours=[],index=[],half=1.15;
      pts.forEach((p,i)=>{const q=pts[Math.min(pts.length-1,i+1)],o=pts[Math.max(0,i-1)],dx=q.x-o.x,dz=q.z-o.z,l=Math.hypot(dx,dz)||1,nx=-dz/l,nz=dx/l;
        const snowy=smooth(16,30,p.y),earthy=1-smooth(4,10,p.y),c=[.3*earthy+.32*(1-earthy),.24*earthy+.31*(1-earthy),.17*earthy+.3*(1-earthy)].map(v=>v*(1-snowy)+.72*snowy);
        for(const side of [-1,1]){positions.push(CENTRE.x+p.x+nx*half*side,p.y+.03,CENTRE.z+p.z+nz*half*side);colours.push(c[0]**2.2,c[1]**2.2,(c[2]+.04*snowy)**2.2)}
        if(i<pts.length-1){const a=i*2;index.push(a,a+2,a+1,a+1,a+2,a+3)}});
      const g=own(new THREE.BufferGeometry());g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));g.setIndex(index);g.computeVertexNormals();
      const strip=new THREE.Mesh(g,std({vertexColors:true,roughness:1,emissive:0x0c0f16,emissiveIntensity:1,polygonOffset:true,polygonOffsetFactor:-2,side:THREE.DoubleSide}));strip.name='mountain-path';root.add(strip);
    }

    // ---------- pines, boulders and crags ----------
    function firGeometry(){return joined([[new THREE.CylinderGeometry(.025,.05,1,7),0x2e2219,placed(0,.5,0)],[new THREE.ConeGeometry(.3,.42,9),0x172a1e,placed(0,.46,0)],[new THREE.ConeGeometry(.23,.36,9),0x1b2f22,placed(0,.67,0)],[new THREE.ConeGeometry(.15,.3,9),0x1e3526,placed(0,.86,0)]])}
    function rockGeometry(){return joined([[new THREE.IcosahedronGeometry(1,0),0x56545a,placed(0,0,0,0,0,0,1)]])}
    // A crag: a sharp tooth of dark rock, its upper ledges white.
    function cragGeometry(){return joined([[new THREE.ConeGeometry(.5,1,5),0x2e2d31,placed(0,.5,0)],[new THREE.ConeGeometry(.32,.62,4),0x3a3a40,placed(.22,.3,.1,.2,.6,.15)],[new THREE.DodecahedronGeometry(.18,0),0xaab4c4,placed(-.18,.42,.12,0,0,0,1)]])}
    const nearRope=(x,z)=>{const t=Math.sin(ROPE_THETA)*x+Math.cos(ROPE_THETA)*z;return t>0&&Math.abs(Math.cos(ROPE_THETA)*x-Math.sin(ROPE_THETA)*z)<4.5};
    const nearPlace=(x,z,pad)=>Math.hypot(x-0,z-58.8)<6+pad||Math.hypot(x+10.5,z-57.5)<5+pad;
    function buildLandscape(){
      const rand=mulberry(23),firs=[],rocks=[],crags=[];
      for(let tries=0;tries<20000&&firs.length<240;tries++){
        const a=rand()*Math.PI*2,r=34+rand()*60,x=Math.sin(a)*r,z=Math.cos(a)*r,y=groundAt(x,z);if(y>11-rand()*3||nearPlace(x,z,1)||nearRope(x,z))continue;
        if(r>MEADOW.inner-2&&r<WALL-1&&rand()<.82||Math.abs(x)<14&&z>28)continue;
        const p=nearestPath(x,z);if(p.d<2.6)continue;if(firs.some(t=>Math.hypot(t.x-CENTRE.x-x,t.z-CENTRE.z-z)<2.4))continue;
        const s=(y>6?5:7)+rand()*6;firs.push({x:CENTRE.x+x,y:y-.1,z:CENTRE.z+z,s,sx:s*.9,sz:s*.9,ry:rand()*6,rx:(rand()-.5)*.06});
        if(Math.hypot(x,z)<MEADOW.outer+2)trunks.push({x:CENTRE.x+x,z:CENTRE.z+z,r:.04*s+.15});
      }
      for(let tries=0;tries<9000&&rocks.length<340;tries++){
        const a=rand()*Math.PI*2,r=8+rand()*104,x=Math.sin(a)*r,z=Math.cos(a)*r,y=groundAt(x,z);if(y<2&&rand()<.8||nearPlace(x,z,0)||nearRope(x,z))continue;
        const p=nearestPath(x,z);if(p.d<2.4)continue;
        const s=.3+rand()*(.6+2.2*smooth(6,40,y));rocks.push({x:CENTRE.x+x,y:y-s*.35,z:CENTRE.z+z,s,sy:s*(.55+rand()*.4),ry:rand()*6,rx:rand()*.6,rz:rand()*.6});
      }
      for(let tries=0;tries<9000&&crags.length<70;tries++){
        const a=rand()*Math.PI*2,r=11+rand()*29,x=Math.sin(a)*r,z=Math.cos(a)*r,y=groundAt(x,z);if(y<20||nearRope(x,z)||r<16&&Math.abs(Math.atan2(Math.sin(a-LEDGE_THETA),Math.cos(a-LEDGE_THETA)))<.9)continue;
        const p=nearestPath(x,z);if(p.d<3.6)continue;
        const s=1.4+rand()*2.6*smooth(20,44,y);crags.push({x:CENTRE.x+x,y:y-.8,z:CENTRE.z+z,s,sx:s*(1.1+rand()*.9),sy:Math.min(8,s*(1.1+rand()*1.9)),sz:s*(1+rand()*.9),ry:rand()*6,rx:(rand()-.5)*.5,rz:(rand()-.5)*.5});
      }
      instanced(firGeometry(),std({vertexColors:true,roughness:.95}),firs,'mountain-pines');
      instanced(rockGeometry(),std({vertexColors:true,roughness:1,flatShading:true,emissive:0x07080b}),rocks,'mountain-rocks');
      instanced(cragGeometry(),std({vertexColors:true,roughness:1,flatShading:true,emissive:0x08090d}),crags,'mountain-crags');
      state.counts={pines:firs.length,rocks:rocks.length,crags:crags.length};
    }

    // ---------- the places on the mountain ----------
    function standingBook(book,x,y,z,yaw,tilt,shelfKey){
      const mesh=add(own(new THREE.BoxGeometry(.42,.58,.06)),own(bookMaterial(book)),x,y,z,root);mesh.rotation.order='YXZ';mesh.rotation.y=yaw;mesh.rotation.x=tilt;
      mesh.userData={type:'book',book,loaded:false,mountain:true,shelf:shelfKey,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent:root}};
      interactables.push(mesh);ours.push(mesh);books.push(mesh);return mesh;
    }
    function label(text,w,h,bg='#d8b23a',fg='#1c1a12'){return own(canvasTexture((c,W,H)=>{c.fillStyle=bg;c.fillRect(0,0,W,H);c.strokeStyle='#222';c.lineWidth=4;c.strokeRect(2,2,W-4,H-4);c.fillStyle=fg;c.textAlign='center';c.font=`bold ${Math.round(H*.46)}px Helvetica, Arial, sans-serif`;c.fillText(text,W/2,H*.66)},w,h))}
    function buildPlaces(){
      const stone=std({color:0x6e6b66,roughness:1,flatShading:true}),dark=std({color:0x1c1916,roughness:1}),wood=std({color:0x5a4430,roughness:.9}),slate=std({color:0x34363c,roughness:.9}),iron=std({color:0x2c2e33,roughness:.5,metalness:.6});
      const {valley,path,spectre}=catalogue();
      // The frame home, standing on its own in the grass, with the Grand Hall's lamplight in it.
      {const g=new THREE.Group();g.position.set(FRAME.x,groundWorld(FRAME.x,FRAME.z),FRAME.z);root.add(g);
        const lamp=own(canvasTexture((c,W,H)=>{const grad=c.createLinearGradient(0,0,0,H);grad.addColorStop(0,'#3a2412');grad.addColorStop(.5,'#b07a3e');grad.addColorStop(1,'#5a3418');c.fillStyle=grad;c.fillRect(0,0,W,H);
          c.fillStyle='rgba(255,214,140,.9)';c.beginPath();c.arc(W*.5,H*.22,W*.08,0,7);c.fill();c.fillStyle='rgba(50,28,14,.75)';for(let i=0;i<5;i++)c.fillRect(W*(.06+i*.19),H*.42,W*.13,H*.5);
          c.fillStyle='rgba(255,160,60,.8)';c.fillRect(W*.4,H*.8,W*.2,H*.08)},256,320));
        const glass=add(own(new THREE.PlaneGeometry(2.1,2.8)),own(new THREE.MeshBasicMaterial({map:lamp,side:THREE.DoubleSide})),0,1.75,0,g);
        const gilt=std({color:0xb08a3c,roughness:.45,metalness:.6});
        for(const [w,h,x,y] of [[2.5,.2,0,3.25],[2.5,.2,0,.25],[.2,3.2,-1.15,1.75],[.2,3.2,1.15,1.75]])box(w,h,.16,gilt,x,y,0,g);
        const data={type:'mountain-exit',title:'The frame back to the Grand Hall',author:QUOTES.frame,action:'STEP BACK'};mark(glass,data);block(FRAME.x,FRAME.z,2.7,.6);
      }
      // The signpost where the path leaves the meadow.
      {const p=W(2.2,53.2),y=groundWorld(p.x,p.z),g=new THREE.Group();g.position.set(p.x,y,p.z);root.add(g);const post=box(.12,2.6,.12,wood,0,1.3,0,g);
        for(const [text,yaw,h] of [['THE SUMMIT',0,2.35],['THE HUT',Math.PI*.75,2.05],['THE PAINTING',Math.PI,1.75]]){
          const arm=add(own(new THREE.BoxGeometry(1.2,.22,.04)),std({map:label(text,340,62),roughness:.8}),Math.sin(yaw+Math.PI/2)*.6,h,Math.cos(yaw+Math.PI/2)*.6,g);arm.rotation.y=yaw+Math.PI/2;mark(arm,card('signpost','A signpost'))}
        mark(post,card('signpost','A signpost'));block(p.x,p.z,.4,.4);
      }
      // The hut in the meadow: dry-stone walls, a slate roof, open on the side towards the path, with a shelf of the
      // valley's books inside and a bench by the door.
      {const p=W(-10.5,57.5),y=groundWorld(p.x,p.z),g=new THREE.Group();g.position.set(p.x,y-.1,p.z);g.rotation.y=Math.PI*.42;root.add(g);
        const walls=std({map:own(canvasTexture((c,Wd,H)=>{c.fillStyle='#55524c';c.fillRect(0,0,Wd,H);const rand=mulberry(4);for(let row=0;row<12;row++)for(let x=-(row%2)*12;x<Wd;x+=18+rand()*14){c.fillStyle=['#6c6860','#4a4741','#5f5b53','#77736a'][Math.floor(rand()*4)];c.fillRect(x+1,row*H/12+1,16+rand()*10,H/12-2)}},256,256)),roughness:1});
        box(4.2,2.3,.4,walls,0,1.15,-1.6,g);for(const x of [-1.9,1.9])box(.4,2.3,3.6,walls,x,1.15,0,g);
        for(const side of [-1,1]){const half=box(4.8,.12,2.4,slate,0,2.75,side*.9,g);half.rotation.x=side*.6}
        box(.4,.9,.4,walls,-1.5,.45,1.6,g);box(.4,.9,.4,walls,1.5,.45,1.6,g);
        const shelfBoard=box(3.2,.06,.42,wood,0,1.15,-1.2,g);box(3.2,.06,.42,wood,0,1.75,-1.2,g);
        const lanternGlass=add(own(new THREE.BoxGeometry(.22,.3,.22)),std({color:0x2a1a08,emissive:0xffb050,emissiveIntensity:1.4}),1.3,2.05,-1.15,g);
        for(const part of [shelfBoard,lanternGlass])mark(part,card('hut','A stone hut'));for(const child of g.children)if(!child.userData.type)mark(child,card('hut','A stone hut'));
        block(p.x,p.z,4.8,4.8);
        valley.forEach((book,i)=>{const row=i<4?0:1,col=row?i-4:i,s=onGroup(g,-1.25+col*.62,(row?1.78:1.18)+.29,-1.2);standingBook(book,s.x,s.y,s.z,g.rotation.y,-.18,'valley')});
        // The bench outside, facing the meadow: one of the library's seats.
        const bg=new THREE.Group(),bp=onGroup(g,0,0,3.1);bg.position.set(bp.x,groundWorld(bp.x,bp.z),bp.z);bg.rotation.y=g.rotation.y;root.add(bg);
        const seat=box(1.8,.08,.42,wood,0,.46,0,bg),back=box(1.8,.42,.06,wood,0,.78,-.22,bg);for(const x of [-.75,.75])box(.1,.46,.38,wood,x,.23,0,bg);
        block(bp.x,bp.z,2,.8);
        if(registerSeat){const data=registerSeat([seat,back],bg,new THREE.Vector3(0,1.2,0),bg.rotation.y,{title:'A bench outside the hut',author:'Sit and read, with the mountain in front of you'});Object.defineProperty(data,'bookIds',{get:()=>books.map(m=>m.userData.book.id),configurable:true});ours.push(seat,back)}
        else for(const part of [seat,back])mark(part,card('hut','A bench outside the hut'));
      }
      // A pine at the foot of the path, bent by the wind.
      {const p=W(5.6,47),y=groundWorld(p.x,p.z),g=new THREE.Group();g.position.set(p.x,y-.1,p.z);g.rotation.z=-.18;root.add(g);const bark=std({color:0x3a2c20,roughness:1});
        const trunk=cyl(.14,.26,6,7,bark,0,3,0,g);for(const [r,h,yy] of [[1.6,2.2,3.6],[1.2,1.9,4.8],[.8,1.6,5.9]])mark(add(own(new THREE.ConeGeometry(r,h,8)),std({color:0x1a2e20,roughness:1}),.3,yy,0,g),card('pine','A wind-bent pine'));
        mark(trunk,card('pine','A wind-bent pine'));trunks.push({x:p.x,z:p.z,r:.45});state.pine=g;
      }
      // The cairns beside the path, each with a waymark painted on a stone, the year of its climb scratched on top, and
      // its books leaning against it on the uphill side.
      {const stones=[],rand=mulberry(17),byId=new Map(path.map(b=>[b.id,b]));
        for(const station of STATIONS){
          const p=pointAt(station.f),q=pointAt(Math.min(1,station.f+.004)),dx=q.x-p.x,dz=q.z-p.z,l=Math.hypot(dx,dz)||1;
          // The uphill side is the side towards the mountain's middle.
          let nx=-dz/l,nz=dx/l;if(nx*p.x+nz*p.z>0){nx=-nx;nz=-nz}
          const cx=p.x+nx*1.75,cz=p.z+nz*1.75,cy=p.y;
          for(let k=0;k<5;k++){const s=.34-k*.05;stones.push({x:CENTRE.x+cx+(rand()-.5)*.1,y:cy+.12+k*.2,z:CENTRE.z+cz+(rand()-.5)*.1,s,sy:s*.6,ry:rand()*6})}
          const cardStone=add(own(new THREE.BoxGeometry(.36,.06,.3)),std({map:label(String(station.year),160,64,'#8a8680','#2a2622'),roughness:1}),CENTRE.x+cx,cy+1.08,CENTRE.z+cz,root);cardStone.rotation.y=Math.atan2(-nx,-nz);
          mark(cardStone,{type:'mountain-card',key:'cairn',title:'A cairn beside the path',author:`A cairn, with a red and white waymark painted on its foot. Scratched on the top stone: ${station.year}. Someone has left ${station.ids.length>1?'books':'a book'} against it.`,action:'LOOK'});
          const blaze=add(own(new THREE.PlaneGeometry(.3,.18)),std({map:label('',96,56,'#c8c4bc'),roughness:1}),0,0,0,root);blaze.position.set(CENTRE.x+cx-nx*.36,cy+.22,CENTRE.z+cz-nz*.36);blaze.rotation.y=Math.atan2(-nx,-nz);
          const red=add(own(new THREE.PlaneGeometry(.3,.05)),std({color:0xb02a24,roughness:1}),0,0,0,root);red.position.copy(blaze.position);red.position.y+=.045;red.rotation.y=blaze.rotation.y;
          const red2=red.clone();red2.position.y-=.09;root.add(red2);
          station.ids.map(id=>byId.get(id)).filter(Boolean).forEach((book,i,list)=>{const side=(i-(list.length-1)/2)*.48,tx=-nz,tz=nx;
            standingBook(book,CENTRE.x+cx-nx*.42+tx*side,cy+.31,CENTRE.z+cz-nz*.42+tz*side,Math.atan2(-nx,-nz),-.22,'path')});
        }
        instanced(own(new THREE.DodecahedronGeometry(1,0)),stone,stones,'mountain-cairns');
      }
      // The summit: the cairn and its tin box, the rope's iron stanchion on the west rim, and a short rail on the
      // north rim where the cloud is watched.
      {const top=groundWorld(CENTRE.x,CENTRE.z),g=new THREE.Group();g.position.set(CENTRE.x,top,CENTRE.z);root.add(g);
        const rand=mulberry(29),parts=[];for(let k=0;k<14;k++){const a=rand()*6.28,r=k<8?.6:.3,m=add(own(new THREE.DodecahedronGeometry(.36-k*.012,0)),stone,Math.sin(a)*r,.2+Math.floor(k/4)*.32,Math.cos(a)*r,g);m.scale.y=.7;m.rotation.y=a;parts.push(m)}
        for(const part of parts)mark(part,card('summit','The summit cairn'));
        const tin=box(.36,.2,.24,std({color:0x6a5a3a,roughness:.5,metalness:.5}),.75,.12,.35,g);tin.rotation.y=.4;
        mark(tin,{type:'mountain-register',title:'A tin box on the cairn',author:'Inside, wrapped in oilcloth, a summit register and the stub of a pencil.',action:'SIGN'});
        block(CENTRE.x,CENTRE.z,1.9,1.9);state.summitCairn=g;
        if(spectre.length){state.spectreBooks=spectre;if(spectreSeen)placeSpectreBooks()}
        // The rope.
        const rx=Math.sin(ROPE_THETA)*(R1-.2),rz=Math.cos(ROPE_THETA)*(R1-.2),ry=groundWorld(CENTRE.x+rx,CENTRE.z+rz);
        const stanchion=cyl(.05,.06,1.2,8,iron,CENTRE.x+rx,ry+.6,CENTRE.z+rz,root);const ring=add(own(new THREE.TorusGeometry(.09,.02,6,12)),iron,CENTRE.x+rx,ry+1.12,CENTRE.z+rz,root);
        const coil=add(own(new THREE.TorusGeometry(.32,.05,6,18)),std({color:0xb2502c,roughness:.8}),CENTRE.x+rx-.45,ry+.06,CENTRE.z+rz+.3,root);coil.rotation.x=Math.PI/2;
        const rope={type:'mountain-rope',title:'A fixed rope',author:QUOTES.rope,action:'ABSEIL DOWN'};for(const part of [stanchion,ring,coil])mark(part,rope);block(CENTRE.x+rx,CENTRE.z+rz,.4,.4);
        // The rope itself, down the face to the meadow.
        const line=[];for(let k=0;k<=60;k++){const r=R1+.1+(R0+3.5-R1)*k/60;line.push(new THREE.Vector3(CENTRE.x+Math.sin(ROPE_THETA)*r,baseHeight(r)+.35,CENTRE.z+Math.cos(ROPE_THETA)*r))}
        const ropeGeometry=own(new THREE.BufferGeometry());ropeGeometry.setFromPoints?.(line);root.add(new THREE.Line(ropeGeometry,own(new THREE.LineBasicMaterial({color:0xc06a3a}))));
        // The foot of the rope in the meadow.
        const foot=add(own(new THREE.TorusGeometry(.3,.05,6,18)),std({color:0xb2502c,roughness:.8}),ROPE_FOOT.x+.6,groundWorld(ROPE_FOOT.x,ROPE_FOOT.z)+.05,ROPE_FOOT.z,root);foot.rotation.x=Math.PI/2;
        mark(foot,{type:'mountain-card',key:'rope-foot',title:'The end of the rope',author:'The fixed rope from the summit ends here, coiled in the grass. It only goes one way: down.',action:'LOOK'});
        // The rail on the north rim.
        const lx=Math.sin(LEDGE_THETA)*(R1-.5),lz=Math.cos(LEDGE_THETA)*(R1-.5),ly=groundWorld(CENTRE.x+lx,CENTRE.z+lz),rail=new THREE.Group();rail.position.set(CENTRE.x+lx,ly,CENTRE.z+lz);rail.rotation.y=LEDGE_THETA;root.add(rail);
        const railParts=[box(2.4,.05,.05,iron,0,.95,0,rail)];for(const x of [-1.1,1.1])railParts.push(cyl(.03,.03,.95,6,iron,x,.48,0,rail));for(const part of railParts)mark(part,card('cloud','A sea of cloud'));
      }
    }
    function onGroup(g,x,y,z){const c=Math.cos(g.rotation.y),s=Math.sin(g.rotation.y);return {x:g.position.x+x*c+z*s,y:g.position.y+y,z:g.position.z-x*s+z*c}}
    // Coleridge, on the summit cairn, once the shadow has been seen.
    function placeSpectreBooks(){
      if(!state?.spectreBooks||state.spectrePlaced)return;state.spectrePlaced=true;const g=state.summitCairn;
      state.spectreBooks.forEach((book,i)=>standingBook(book,g.position.x-.2+i*.45,g.position.y+1.42,g.position.z+.42,0,-.35,'spectre'));
    }

    // ---------- the sky, the cloud and the weather ----------
    function buildAir(){
      // The sky goes with the reader: a dome painted with stars and, all round its horizon, the far ranges.
      const sky=own(canvasTexture((c,Wd,H)=>{const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#03050c');g.addColorStop(.36,'#0a1122');g.addColorStop(.5,'#1c2a40');g.addColorStop(.52,'#0d1420');g.addColorStop(1,'#05070c');c.fillStyle=g;c.fillRect(0,0,Wd,H);
        const rand=mulberry(41);for(let i=0;i<900;i++){const y=rand()*H*.48,s=rand()<.06?1.6:.8;c.fillStyle=`rgba(230,236,255,${.25+rand()*.6})`;c.fillRect(rand()*Wd,y,s,s)}
        // The far ranges: two layers of ridges along the horizon, their crests catching the moon.
        for(const [base,amp,dark,lit,seed] of [[.5,.05,'#1e283a','rgba(150,166,194,.3)',3],[.506,.032,'#141b28','rgba(120,138,168,.22)',8]]){const r=mulberry(seed),pts=[];
          let y=base;for(let x=0;x<=Wd+8;x+=8){y=clamp(y+(r()-.5)*amp*.35,base-amp,base-amp*.15);pts.push([x,H*y])}
          const fill=c.createLinearGradient(0,H*(base-amp),0,H*.52);fill.addColorStop(0,lit);fill.addColorStop(.35,dark);fill.addColorStop(1,dark);
          c.fillStyle=fill;c.beginPath();c.moveTo(0,H*.53);for(const [x,yy] of pts)c.lineTo(x,yy);c.lineTo(Wd,H*.53);c.fill()}
      },2048,1024));
      const dome=new THREE.Mesh(own(new THREE.SphereGeometry(118,32,16)),own(new THREE.MeshBasicMaterial({map:sky,side:THREE.BackSide,fog:false,depthWrite:false})));dome.renderOrder=-10;dome.name='mountain-sky';root.add(dome);state.dome=dome;
      // The moon, and its halo.
      const moonDisc=add(own(new THREE.CircleGeometry(3.4,32)),own(new THREE.MeshBasicMaterial({color:0xeef1f8,fog:false,depthWrite:false})),0,0,0,root);moonDisc.renderOrder=-9;
      const halo=own(canvasTexture((c,Wd,H)=>{const g=c.createRadialGradient(Wd/2,H/2,0,Wd/2,H/2,Wd/2);g.addColorStop(0,'rgba(210,225,255,.5)');g.addColorStop(1,'rgba(210,225,255,0)');c.fillStyle=g;c.fillRect(0,0,Wd,H)},128,128));
      const haloSprite=new THREE.Sprite(own(new THREE.SpriteMaterial({map:halo,fog:false,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending})));haloSprite.scale.set(30,30,1);haloSprite.renderOrder=-9;root.add(haloSprite);
      state.moon={disc:moonDisc,halo:haloSprite};
      // The sea of cloud, seen only from above.
      const cloudMap=own(canvasTexture((c,Wd,H)=>{c.clearRect(0,0,Wd,H);const rand=mulberry(5);
        for(let i=0;i<420;i++){const x=rand()*Wd,y=rand()*H,r=14+rand()*46,lit=rand(),g=c.createRadialGradient(x-r*.2,y-r*.25,0,x,y,r);
          g.addColorStop(0,`rgba(${Math.round(190+lit*45)},${Math.round(198+lit*42)},${Math.round(214+lit*36)},.55)`);g.addColorStop(.6,'rgba(120,132,156,.3)');g.addColorStop(1,'rgba(90,100,124,0)');
          for(const [ox,oy] of [[0,0],[Wd,0],[-Wd,0],[0,H],[0,-H]]){c.fillStyle=g;c.save();c.translate(ox,oy);c.fillRect(x-r,y-r,r*2,r*2);c.restore()}}},512,512));
      cloudMap.wrapS=cloudMap.wrapT=THREE.RepeatWrapping;cloudMap.repeat?.set?.(5,5);
      const layerMap=rep=>{if(rep===5)return cloudMap;const m=own(cloudMap.clone());m.repeat?.set?.(rep,rep);m.needsUpdate=true;return m};
      state.clouds=[];for(const [y,o,rep] of [[CLOUD_Y,1,5],[CLOUD_Y+.9,.8,3],[CLOUD_Y+1.8,.45,7]]){const m=add(own(new THREE.CircleGeometry(EDGE+6,64)),own(new THREE.MeshBasicMaterial({map:layerMap(rep),transparent:true,opacity:o,depthWrite:false,color:0xc4cede,side:THREE.FrontSide})),CENTRE.x,y,CENTRE.z,root);m.rotation.x=-Math.PI/2;state.clouds.push(m)}
      // Falling snow round the reader, heavier as they climb.
      const N=700,flakes=new Float32Array(N*3),rand=mulberry(13);for(let i=0;i<N;i++){flakes[i*3]=(rand()-.5)*26;flakes[i*3+1]=rand()*16;flakes[i*3+2]=(rand()-.5)*26}
      const snowGeometry=own(new THREE.BufferGeometry());snowGeometry.setAttribute('position',new THREE.Float32BufferAttribute(flakes,3));
      const flake=own(canvasTexture((c,Wd,H)=>{c.clearRect(0,0,Wd,H);const g=c.createRadialGradient(Wd/2,H/2,0,Wd/2,H/2,Wd/2);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,Wd,H)},32,32));
      const snow=new THREE.Points(snowGeometry,own(new THREE.PointsMaterial({color:0xe8edf6,map:flake,size:.06,transparent:true,opacity:0,depthWrite:false})));snow.frustumCulled=false;snow.name='mountain-snow';root.add(snow);state.snow=snow;
      // The shadow on the cloud, with its glory: drawn once, shown only from the summit.
      const ghost=own(canvasTexture((c,Wd,H)=>{c.clearRect(0,0,Wd,H);const cx=Wd/2,cy=H*.3;
        for(const [r,col] of [[.3,'rgba(255,90,80,.18)'],[.27,'rgba(255,200,90,.16)'],[.24,'rgba(120,255,140,.14)'],[.21,'rgba(110,170,255,.16)'],[.18,'rgba(200,120,255,.12)'],[.14,'rgba(240,240,255,.22)']]){c.strokeStyle=col;c.lineWidth=Wd*.022;c.beginPath();c.arc(cx,cy,Wd*r,0,7);c.stroke()}
        const g=c.createRadialGradient(cx,cy,0,cx,cy,Wd*.13);g.addColorStop(0,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,Wd,H);
        c.fillStyle='rgba(14,16,26,.8)';c.beginPath();c.ellipse(cx,cy,Wd*.045,Wd*.055,0,0,7);c.fill();
        c.beginPath();c.moveTo(cx-Wd*.05,cy+Wd*.06);c.lineTo(cx+Wd*.05,cy+Wd*.06);c.lineTo(cx+Wd*.07,H*.98);c.lineTo(cx-Wd*.07,H*.98);c.fill();
        c.lineWidth=Wd*.03;c.strokeStyle='rgba(14,16,26,.72)';c.beginPath();c.moveTo(cx-Wd*.05,cy+Wd*.09);c.lineTo(cx-Wd*.12,cy+Wd*.32);c.moveTo(cx+Wd*.05,cy+Wd*.09);c.lineTo(cx+Wd*.12,cy+Wd*.32);c.stroke()},256,320));
      const spectre=new THREE.Sprite(own(new THREE.SpriteMaterial({map:ghost,transparent:true,depthWrite:false,opacity:0,fog:false})));spectre.scale.set(13,16,1);spectre.renderOrder=6;spectre.visible=false;spectre.name='mountain-spectre';root.add(spectre);state.spectre=spectre;
    }

    // ---------- the painting in the Grand Hall ----------
    // Hung at startup, and kept: the hall is never freed. Moonlight on a snowy peak, the path going round it, cloud
    // below the summit and a light in the hut at its foot.
    function paintPeak(c,Wd,H){
      const sky=c.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#060a18');sky.addColorStop(.55,'#1c2a46');sky.addColorStop(1,'#0e1420');c.fillStyle=sky;c.fillRect(0,0,Wd,H);
      const rand=mulberry(61);for(let i=0;i<160;i++){c.fillStyle=`rgba(235,240,255,${.3+rand()*.6})`;c.fillRect(rand()*Wd,rand()*H*.5,1.4,1.4)}
      c.fillStyle='#eef1f8';c.beginPath();c.arc(Wd*.8,H*.13,Wd*.05,0,7);c.fill();const halo=c.createRadialGradient(Wd*.8,H*.13,0,Wd*.8,H*.13,Wd*.2);halo.addColorStop(0,'rgba(200,215,255,.35)');halo.addColorStop(1,'rgba(200,215,255,0)');c.fillStyle=halo;c.fillRect(0,0,Wd,H*.5);
      // Far ranges.
      for(const [base,colour] of [[.5,'#26324a'],[.56,'#1c2638']]){c.fillStyle=colour;c.beginPath();c.moveTo(0,H);let x=0;c.lineTo(0,H*base);while(x<Wd){x+=Wd*(.04+rand()*.06);c.lineTo(x,H*(base-.04-rand()*.08))}c.lineTo(Wd,H);c.fill()}
      // The peak.
      const peak=[[Wd*.12,H*.78],[Wd*.3,H*.5],[Wd*.4,H*.36],[Wd*.47,H*.2],[Wd*.5,H*.16],[Wd*.54,H*.21],[Wd*.62,H*.32],[Wd*.72,H*.47],[Wd*.9,H*.78]];
      c.fillStyle='#3a4256';c.beginPath();c.moveTo(peak[0][0],peak[0][1]);for(const [x,y] of peak)c.lineTo(x,y);c.closePath();c.fill();
      const snow=c.createLinearGradient(Wd*.3,0,Wd*.7,0);snow.addColorStop(0,'#c8d2e4');snow.addColorStop(1,'#8e9ab2');c.fillStyle=snow;c.beginPath();c.moveTo(Wd*.36,H*.42);c.lineTo(Wd*.47,H*.2);c.lineTo(Wd*.5,H*.16);c.lineTo(Wd*.54,H*.21);c.lineTo(Wd*.65,H*.36);
      for(let x=.65;x>.36;x-=.03)c.lineTo(Wd*x,H*(.36+rand()*.08));c.fill();
      c.strokeStyle='rgba(30,34,46,.7)';c.lineWidth=2;for(let i=0;i<14;i++){const x=Wd*(.38+rand()*.26),y=H*(.25+rand()*.3);c.beginPath();c.moveTo(x,y);c.lineTo(x+(rand()-.5)*Wd*.04,y+H*.08);c.stroke()}
      // The path, going round.
      c.strokeStyle='rgba(225,215,190,.55)';c.lineWidth=2;c.setLineDash?.([5,4]);c.beginPath();c.moveTo(Wd*.5,H*.86);c.quadraticCurveTo(Wd*.78,H*.72,Wd*.62,H*.6);c.quadraticCurveTo(Wd*.36,H*.52,Wd*.44,H*.42);c.quadraticCurveTo(Wd*.6,H*.33,Wd*.5,H*.24);c.stroke();c.setLineDash?.([]);
      // Cloud below the summit.
      for(let i=0;i<26;i++){const x=rand()*Wd,y=H*(.58+rand()*.08),r=Wd*(.05+rand()*.08),g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(170,182,205,.55)');g.addColorStop(1,'rgba(170,182,205,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)}
      // The meadow, pines, and a light in the hut.
      c.fillStyle='#121a14';c.beginPath();c.moveTo(0,H*.84);c.quadraticCurveTo(Wd*.5,H*.78,Wd,H*.86);c.lineTo(Wd,H);c.lineTo(0,H);c.fill();
      c.fillStyle='#0b120d';for(let i=0;i<16;i++){const x=rand()*Wd,y=H*(.84+rand()*.1),h=H*(.06+rand()*.06);c.beginPath();c.moveTo(x,y-h);c.lineTo(x-h*.3,y);c.lineTo(x+h*.3,y);c.fill()}
      c.fillStyle='#ffc070';c.fillRect(Wd*.3,H*.865,Wd*.012,H*.01);
    }
    function hangHallPainting(){
      if(hallPainting)return hallPainting;const g=new THREE.Group();g.name='mountain-hall-painting';g.position.set(HALL_PAINTING.x,HALL_PAINTING.y,HALL_PAINTING.z);scene.add(g);
      const map=canvasTexture(paintPeak,480,640);
      const canvas=new THREE.Mesh(new THREE.PlaneGeometry(HALL_PAINTING.w,HALL_PAINTING.h),new THREE.MeshStandardMaterial({map,emissive:0xffffff,emissiveMap:map,emissiveIntensity:.32,roughness:.8}));canvas.position.z=.045;g.add(canvas);
      const gilt=new THREE.MeshStandardMaterial({color:0xa8823a,roughness:.4,metalness:.65}),w=HALL_PAINTING.w,h=HALL_PAINTING.h;
      for(const [fw,fh,x,y] of [[w+.36,.18,0,h/2+.09],[w+.36,.18,0,-h/2-.09],[.18,h,-w/2-.09,0],[.18,h,w/2+.09,0]]){const m=new THREE.Mesh(new THREE.BoxGeometry(fw,fh,.1),gilt);m.position.set(x,y,.05);g.add(m)}
      const plate=new THREE.Mesh(new THREE.BoxGeometry(.6,.13,.02),new THREE.MeshStandardMaterial({map:canvasTexture((c,Wd,H)=>{c.fillStyle='#b8954a';c.fillRect(0,0,Wd,H);c.fillStyle='#2a1e0c';c.textAlign='center';c.font=`italic ${Math.round(H*.5)}px Georgia`;c.fillText('A Mountain by Moonlight',Wd/2,H*.66)},256,56),roughness:.5,metalness:.4}));plate.position.set(0,-h/2-.32,.05);g.add(plate);
      const data={type:'mountain-painting',title:'A mountain by moonlight',author:'Snow on the peak, a path going round it to the top, and cloud lying below the summit. The paint is cold to the touch, and there is a breath of wind from the canvas.',action:'STEP IN'};
      for(const part of [canvas,plate]){part.userData=data;interactables.push(part)}
      hallPainting={group:g,canvas};return hallPainting;
    }
    hangHallPainting();

    // ---------- building and freeing ----------
    function build(){
      if(root)return;root=new THREE.Group();root.name='mountain';state={};
      buildGround();buildPath();buildLandscape();buildPlaces();buildAir();scene.add(root);
    }
    function unload(){
      if(!root)return;root.removeFromParent();root=null;state=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0;trunks.length=0;
    }
    function activate(){build();lastNeeded=time}

    // ---------- walking ----------
    const local=(x,z)=>({x:x-CENTRE.x,z:z-CENTRE.z});
    function contains(x,z){return Math.hypot(x-CENTRE.x,z-CENTRE.z)<MEADOW.outer+2}
    function floorAt(x,z){return contains(x,z)?groundWorld(x,z):null}
    // On the path, on the summit, or in the meadow round the mountain's foot; never off the edge.
    function allowed(x,z){
      if(!contains(x,z))return false;const p=local(x,z),r=Math.hypot(p.x,p.z),rad=player.radius||.42;
      const open=(r>=MEADOW.inner&&r<=MEADOW.outer)||r<R1-.35||nearestPath(p.x,p.z).d<1.05;if(!open)return false;
      if(blockers.some(b=>x+rad>b.minX&&x-rad<b.maxX&&z+rad>b.minZ&&z-rad<b.maxZ))return false;
      return !trunks.some(t=>Math.abs(t.x-x)<2&&Math.abs(t.z-z)<2&&Math.hypot(t.x-x,t.z-z)<t.r+rad);
    }
    // Where on the mountain: the meadow, the path, or the summit.
    function zoneAt(x,z){if(!contains(x,z))return null;const p=local(x,z),r=Math.hypot(p.x,p.z);return r<R1+1.2?'mountain-summit':r>=MEADOW.inner?'mountain':'mountain-heights'}
    // Underfoot: snow high up and grass in the meadow are soft; the scree and rock of the middle are stone.
    function surfaceAt(x,z){const y=groundWorld(x,z);return y>20||y<4?'carpet':'stone'}

    // ---------- doing things ----------
    const go=(x,z,yaw)=>{if(moveTo)moveTo(x,groundWorld(x,z),z,yaw);else move(x,z,yaw)};
    function enter(from='link'){
      activate();go(ARRIVAL.x,ARRIVAL.z,ARRIVAL.yaw);
      showNotice(from==='painting'?'You step up into the frame, and through it. Cold air, the smell of snow and pine: a meadow at night, and the mountain going up in front of you, its summit white under the moon. A path leaves the grass and climbs.'
        :'A meadow at night at the foot of a mountain, its summit white under the moon. A path leaves the grass and climbs. Behind you, a picture frame stands in the grass with the Grand Hall’s lamplight in it.',11);
      analytics?.track('Room Explored',{room:'mountain'});
    }
    function leave(){if(toHall)toHall(HALL_SPOT);else move(HALL_SPOT.x,HALL_SPOT.z,HALL_SPOT.yaw);playSample?.('doorOpen',.5,1.2);showNotice('Back through the frame into the Grand Hall, and the warmth of the fire. The painting shows the mountain as before, but there is a little snow on the hearth.',6)}
    function noteFound(id){
      const all=found(),{valley,path,spectre}=catalogue(),here=new Set([...valley,...path,...spectre].map(b=>b.id)),total=valley.length+path.length;if(!here.has(id))return null;
      const first=!all.has(id);all.add(id);foundCache=all;write(FOUND_KEY,JSON.stringify([...all]));
      const count=[...all].filter(n=>here.has(n)&&!spectre.some(b=>b.id===n)).length;
      if(spectre.some(b=>b.id===id))return first?'Found on the summit, where only those who have seen the shadow on the cloud will find it.':null;
      if(first&&count===total)analytics?.track('Secret Found',{secret:'mountain-every-book'});
      return first?(count===total?`Found on the mountain: all ${total}.`:`Found on the mountain: ${count} of ${total}.`):null;
    }
    function signRegister(){
      const n=(parseInt(read(SUMMITS_KEY)||'0',10)||0)+1;write(SUMMITS_KEY,String(n));sound?.(1900,.04,'triangle',.015);
      return n===1?'You write your name in the register under the last entry, and the date, and put it back in its oilcloth. Your first time at the top.'
        :`You sign the register again. By its pages, this is your ${ordinal(n)} time at the top.`;
    }
    function ordinal(n){const s=['th','st','nd','rd'],v=n%100;return n+(s[(v-20)%10]||s[v]||s[0])}
    function startAbseil(){
      if(abseil)return;activate();const reduced=isReducedMotion();abseil={t:0,duration:reduced?4:9};
      playSample?.('secretDoor',.3,1.3);showNotice('You clip on to the rope, lean back over the edge, and let it run.',5);
      analytics?.track('Room Explored',{room:'mountain-abseil'});
    }
    function updateAbseil(dt){
      const a=abseil;a.t+=dt;const p=clamp(a.t/a.duration,0,1),e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
      const r=R1+.4+(R0+3.2-R1-.4)*e,lx=Math.sin(ROPE_THETA)*r,lz=Math.cos(ROPE_THETA)*r,y=baseHeight(r)+1.5+Math.sin(p*Math.PI)*.8;
      player.pos.set(CENTRE.x+lx,y-1.72,CENTRE.z+lz);
      if(camera){const sway=isReducedMotion()?0:Math.sin(a.t*2.1)*.03;camera.position.set(CENTRE.x+lx,y,CENTRE.z+lz);camera.rotation.set(-.28,Math.atan2(-lx,-lz)+.35,sway,'YXZ');camera.updateMatrixWorld?.()}
      if(p>=1)land();
    }
    function land(){if(!abseil)return;abseil=null;go(ROPE_FOOT.x,ROPE_FOOT.z,ROPE_FOOT.yaw);showNotice('Your boots touch grass. The rope hangs above you into the cloud, and the summit is a long way up. The frame home stands round the mountain’s foot to the south, past the hut.',8)}
    function reset(){if(abseil)land()}
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('mountain-'))return false;
      if(data.type==='mountain-painting'){playSample?.('doorOpen',.4,.7);enter('painting');return true}
      if(data.type==='mountain-exit'){leave();return true}
      if(data.type==='mountain-rope'){startAbseil();return true}
      if(data.type==='mountain-register'){showNotice(signRegister(),8);return true}
      if(data.type==='mountain-card'){showNotice(`${data.title}: ${data.author}`,data.author.length>160?13:9);return true}
      return false;
    }
    // The shadow on the cloud: seen by standing on the summit and looking down, away from the moon, for a moment.
    function seeSpectre(){
      spectreSeen=true;write(SPECTRE_KEY,'1');placeSpectreBooks();sound?.(660,1.2,'sine',.02);
      showNotice(`Down on the cloud, opposite the moon, a giant figure stands with rings of pale colour round its head. You lift an arm, and so does it: it is your own shadow, thrown on the mist, the spectre of the Brocken, seen by moonlight, which is rarer than by sun. ${QUOTES.spectre} When you look back at the cairn, a book is lying on it.`,16);
      analytics?.track('Secret Found',{secret:'mountain-spectre'});
    }

    // ---------- each frame ----------
    const forward=new THREE.Vector3();
    function update(t,dt=0){
      time=t;const {x,z}=player.pos,inside=contains(x,z)||!!abseil;if(inside)activate();
      if(!root)return;
      if(!inside&&t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==root)){unload();return}
      if(abseil){lastNeeded=t;updateAbseil(dt)}
      if(!inside||!state)return;
      const eye=camera?.position||{x,y:player.pos.y+1.72,z},height=eye.y,reduced=isReducedMotion();
      // Night on the mountain: a dark sky; mist low down, thick cloud in the cloud layer, clear air at the top.
      const inCloud=smooth(CLOUD_Y-7,CLOUD_Y-1,height)*(1-smooth(CLOUD_Y+2,CLOUD_Y+6,height));
      scene.background?.setRGB?.(.02,.03,.06);if(scene.fog){scene.fog.color?.setRGB?.(.04+inCloud*.08,.05+inCloud*.085,.08+inCloud*.09);scene.fog.density=.011+inCloud*.05-smooth(32,44,height)*.006}
      if(ambient)ambient.intensity*=.55;if(moonlight)moonlight.intensity*=.85;
      if(state.dome)state.dome.position.set(eye.x,eye.y,eye.z);
      if(state.moon){const m=state.moon;m.disc.position.set(eye.x+MOON_DIR.x*110,eye.y+MOON_DIR.y*110,eye.z+MOON_DIR.z*110);m.disc.lookAt?.(eye.x,eye.y,eye.z);m.halo.position.copy(m.disc.position)}
      for(const [i,m] of (state.clouds||[]).entries())m.material.map.offset?.set?.(t*.002*(i?1.4:1)*(reduced?0:1),t*.001*(reduced?0:1));
      // Snow falls above the trees, more of it the higher the reader goes.
      if(state.snow){const s=state.snow,amount=smooth(14,36,height);s.material.opacity=amount*.85;s.visible=amount>.01;
        if(s.visible){s.position.set(eye.x,eye.y-8,eye.z);const p=s.geometry.attributes.position;if(p?.array){const arr=p.array,fall=dt*(reduced?.3:.9);for(let i=0;i<arr.length;i+=3){arr[i+1]-=fall*(.6+(i%7)/10);arr[i]+=Math.sin(t*.5+i)*dt*.12;if(arr[i+1]<0)arr[i+1]+=16}p.needsUpdate=true}}}
      if(state.pine&&!reduced)state.pine.rotation.z=-.18+Math.sin(t*.9)*.02;
      // The shadow on the cloud: where the moon's light, passing the reader's head, meets the top of the cloud.
      const s=state.spectre,l=local(x,z),onTop=Math.hypot(l.x,l.z)<R1+.8&&height>CLOUD_Y+8;
      if(s){if(onTop){const d=(height-CLOUD_Y-.4)/MOON_DIR.y;s.position.set(eye.x-MOON_DIR.x*d,eye.y-MOON_DIR.y*d+3.5,eye.z-MOON_DIR.z*d);s.visible=true;s.material.opacity=Math.min(.95,(s.material.opacity||0)+dt*.6)}
        else{s.material.opacity=Math.max(0,(s.material.opacity||0)-dt);s.visible=s.material.opacity>0}}
      if(onTop&&!visitedSummit){visitedSummit=true;analytics?.track('Room Explored',{room:'mountain-summit'})}
      if(onTop&&!spectreSeen&&camera?.getWorldDirection){camera.getWorldDirection(forward);const dot=-(forward.x*MOON_DIR.x+forward.y*MOON_DIR.y+forward.z*MOON_DIR.z);watch=dot>.93?watch+dt:0;if(watch>1.2)seeSpectre()}
    }

    return {contains,floorAt,allowed,interact,update,enter,leave,unload,reset,zoneAt,surfaceAt,noteFound,catalogue,hangHallPainting,seeSpectre,signRegister,
      centre:CENTRE,path:PATH,stations:STATIONS,quotes:QUOTES,own:OWN,arrival:ARRIVAL,hallSpot:HALL_SPOT,hallPainting:HALL_PAINTING,ropeFoot:ROPE_FOOT,moonDir:MOON_DIR,
      groundAt:groundWorld,nearestPath:(x,z)=>nearestPath(x-CENTRE.x,z-CENTRE.z),
      get built(){return !!root},get travelling(){return !!abseil},get books(){return books.slice()},get counts(){return state?.counts||null},get spectreSeen(){return spectreSeen}};
  };
})();
