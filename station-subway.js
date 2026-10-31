// The Station Subway: the plain way from the Grand Hall to the night trains. In the hall's east aisle, between the
// columns, a stairwell goes down through the floor under an iron arch signed TO THE TRAINS; at its foot a white-tiled
// subway runs to the gates of the Library Platform (night-train.js), and a way out at the platform's south end leads
// back. The long way, through the memory rooms to the gates beyond the Repository, is still there for readers who
// follow the tremor under the brass rails.
// The stairwell is built at startup and is small. Its well is really sunk below the floor: its tiles and steps are drawn
// first, then an invisible lid at floor level writes only depth, so the hall's parquet is not drawn over the opening.
// The subway itself stands far out (x 1260, z −640 to −600, clear of the back ways at x 1200), is built when the reader
// goes down and freed 25 s after they leave. Its walls glow faintly of themselves; it has one lamp, its own.
(function(){
  'use strict';

  // The opening in the hall floor: open to the south, where readers come from; the steps go down northwards.
  const WELL={x0:12.6,x1:15.4,z0:-21,z1:-14.5,depth:3};
  // The subway: a top landing (y 3) under the way out to the hall, a flight down, and the tiled passage to the gates.
  const SUB={x:1260,width:3.6,north:-640,landing:-638,foot:-632,south:-600,top:3};
  const KEEP=25;
  // Where a reader arrives: up in the hall facing away from the well, at the head of the subway's stair, at its gates.
  const ARRIVE={hall:{x:14,z:-13.2,y:0,yaw:Math.PI},top:{x:SUB.x,z:SUB.north+1.1,y:SUB.top,yaw:Math.PI},gates:{x:SUB.x,z:SUB.south-1.5,y:0,yaw:0}};
  // The posters: the line's stops, and two of the railway books the library keeps. Every card says only what is so.
  const POSTERS=[
    {key:'signal',side:-1,z:-627,title:'THE SIGNAL HOUSE',sub:'Railway stories under green glass',card:'A poster for the Signal House, a request stop on the Night Collections line, where the signal ledger and railway stories wait under green glass. Ask the conductor for it.'},
    {key:'tide',side:1,z:-624,title:'TIDEBOUND QUAY',sub:'Distant travel by the tide clock',card:'A poster for Tidebound Quay, where the tide clock stands beside books about distant travel. The conductor will stop there if asked.'},
    {key:'children',side:-1,z:-619,title:'THE RAILWAY CHILDREN',sub:'E. Nesbit',card:'A poster for E. Nesbit’s The Railway Children (1906), in which three children wave red flannel petticoats to stop a train before a landslide. A copy waits at the Collections Depot.'},
    {key:'depot',side:1,z:-610,title:'THE COLLECTIONS DEPOT',sub:'Where books wait between readers',card:'A poster for the Collections Depot, at the end of the line: drawers of books waiting between readers, arranged by how they speak to each other.'},
    {key:'mugby',side:-1,z:-607,title:'MUGBY JUNCTION',sub:'Charles Dickens and others',card:'A poster for Mugby Junction, the Christmas number of All the Year Round for 1866, by Dickens and his collaborators: stories that branch from a railway junction, The Signal-Man among them. A copy waits at the Collections Depot.'},
    {key:'fog',side:1,z:-604,title:'—  —  —',sub:'',card:'A poster with no name on it, only fog and one lamp on an empty platform. Someone has written underneath in pencil: “Ask anyway.”'}
  ];
  const MACHINE={side:1,z:-618};

  window.createStationSubway=function(options){
    const {THREE,scene,MAT,interactables,collider,player,canvasTexture,showNotice=()=>{},playSample,sound,analytics,move,railway=null,isReduced=()=>false}=options;
    let time=0,built=null,lastInside=0,platformExit=null,nextRumble=0,rumbleUntil=0,heardRumble=false;
    const mark=(object,data,list)=>{object.userData=data;interactables.push(object);list?.push(object);return object};

    // ---------- shared looks (kept for the life of the page) ----------
    // Glazed white tiles in brick bond, 1.2 m of wall to a texture; a green dado; a frieze with the line's name.
    const tileTexture=(base,grout,shine)=>canvasTexture((c,w,h)=>{c.fillStyle=grout;c.fillRect(0,0,w,h);const cols=8,rows=16,tw=w/cols,th=h/rows;
      for(let r=0;r<rows;r++)for(let k=-1;k<cols;k++){const x=k*tw+(r%2)*tw/2,y=r*th;const g=c.createLinearGradient(x,y,x+tw,y+th);g.addColorStop(0,shine);g.addColorStop(.35,base);g.addColorStop(1,base);c.fillStyle=g;c.fillRect(x+2,y+2,tw-4,th-4)}},256,256);
    function repeat(texture,x,y){const t=texture.clone();t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(x,y);t.needsUpdate=true;return t}
    const whiteTiles=tileTexture('#e9e3d2','#8f877a','#fffdf4'),greenTiles=tileTexture('#2f5a43','#1a2a20','#5f8f72');
    const ink='#1f3a2c',cream='#efe6cc';
    // An enamel sign: green, cream letters, a thin red border. Lines are [text, size] from the top.
    function enamel(lines,w=512,h=128){return canvasTexture((c,W,H)=>{c.fillStyle='#1f4a35';c.fillRect(0,0,W,H);c.strokeStyle='#8a2f22';c.lineWidth=H*.06;c.strokeRect(H*.05,H*.05,W-H*.1,H-H*.1);
      c.strokeStyle=cream;c.lineWidth=H*.02;c.strokeRect(H*.12,H*.12,W-H*.24,H-H*.24);c.fillStyle=cream;c.textAlign='center';c.textBaseline='middle';
      const fit=.62/lines.reduce((s,[,k])=>s+k,0);let y=H*.19;for(let [text,k] of lines){k*=fit;let size=Math.round(H*k*.8);c.font=`bold ${size}px Georgia`;while(c.measureText(text).width>W*.86&&size>8){size-=2;c.font=`bold ${size}px Georgia`}c.fillText(text,W/2,y+k*H/2);y+=k*H}},w,h)}
    const iron=new THREE.MeshStandardMaterial({color:0x1d2320,metalness:.55,roughness:.5});
    const glow=new THREE.MeshStandardMaterial({color:0xfff0d0,emissive:0xffd59a,emissiveIntensity:1.6,roughness:.4});
    const brass=MAT.brass||iron;

    // ---------- the stairwell in the Grand Hall ----------
    const hall=new THREE.Group();hall.name='station-subway-stairwell';scene.add(hall);
    function hallStairwell(){
      const {x0,x1,z0,z1,depth}=WELL,w=x1-x0,l=z1-z0,cx=(x0+x1)/2,cz=(z0+z1)/2,low=-depth-.6;
      // Drawn before everything else, so the lid can keep the floor off them.
      const sunk=m=>{m.renderOrder=-2;return m};
      const add=(geometry,material,x,y,z,parent=hall)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m};
      // The tiles in three bands, each darker than the one above, so the well deepens as it goes down.
      const band=-low/3;[0xe8e4dc,0x9c978e,0x5e5a54].forEach((color,k)=>{const y=-band*(k+.5);
        const side=new THREE.MeshStandardMaterial({map:repeat(whiteTiles,l/1.2,band/1.2),color,roughness:.35});
        for(const [x,yaw] of [[x0,Math.PI/2],[x1,-Math.PI/2]]){const p=sunk(add(new THREE.PlaneGeometry(l,band),side,x,y,cz));p.rotation.y=yaw}
        sunk(add(new THREE.PlaneGeometry(w,band),new THREE.MeshStandardMaterial({map:repeat(whiteTiles,w/1.2,band/1.2),color,roughness:.35}),cx,y,z0))});
      // The steps (seventeen, as in the subway below) and the landing at their foot, with brass nosings.
      const n=17,rise=depth/n,run=l-1.4,tread=run/n,stone=new THREE.MeshStandardMaterial({color:0x8d877b,roughness:.9}),shade=new THREE.Color();
      const steps=sunk(new THREE.InstancedMesh(new THREE.BoxGeometry(w,1,tread),stone,n)),noses=sunk(new THREE.InstancedMesh(new THREE.BoxGeometry(w,.03,.05),brass,n));
      const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),v=new THREE.Vector3(),s=new THREE.Vector3();
      for(let i=0;i<n;i++){const top=-(i+1)*rise,z=z1-tread*(i+.5);v.set(cx,(top+low)/2,z);s.set(1,top-low,1);m4.compose(v,q,s);steps.setMatrixAt(i,m4);steps.setColorAt?.(i,shade.setScalar(1-.55*i/(n-1)));v.set(cx,top+.015,z1-tread*i-.025);s.set(1,1,1);m4.compose(v,q,s);noses.setMatrixAt(i,m4)}
      steps.instanceMatrix.needsUpdate=noses.instanceMatrix.needsUpdate=true;if(steps.instanceColor)steps.instanceColor.needsUpdate=true;hall.add(steps,noses);
      sunk(add(new THREE.BoxGeometry(w,.3,1.4),new THREE.MeshStandardMaterial({color:0x4a4640,roughness:.9}),cx,-depth-.15,z0+.7));
      for(const x of [x0+.07,x1-.07]){const rail=sunk(add(new THREE.BoxGeometry(.06,.06,Math.hypot(run,depth)),brass,x,-depth/2+.9,z1-run/2));rail.rotation.x=-Math.atan2(depth,run)}
      // At the foot, a sign and a lamp: the way on turns out of sight.
      const footSign=sunk(add(new THREE.PlaneGeometry(2.2,.55),new THREE.MeshStandardMaterial({map:enamel([['PLATFORM 1  ·  NIGHT COLLECTIONS',1]],768,192),emissive:0xffffff,emissiveIntensity:.25,roughness:.5}),cx,-depth+2.05,z0+.02));
      footSign.material.emissiveMap=footSign.material.map;
      sunk(add(new THREE.SphereGeometry(.13,12,10),glow,cx,-depth+2.65,z0+.18));
      // The lid: level with the floor, writing only depth, so the parquet is not drawn over the opening.
      const lid=add(new THREE.PlaneGeometry(w,l),new THREE.MeshBasicMaterial({colorWrite:false}),cx,.012,cz);lid.rotation.x=-Math.PI/2;lid.renderOrder=-1;
      // A stone kerb round the opening, iron railings on three sides, and an arch with two lamps over the open end.
      const kerb=MAT.stone||stone;
      add(new THREE.BoxGeometry(w+.5,.07,.25),kerb,cx,.035,z0-.125);for(const x of [x0-.125,x1+.125])add(new THREE.BoxGeometry(.25,.07,l+.25),kerb,x,.035,cz-.125);add(new THREE.BoxGeometry(w+.5,.04,.12),kerb,cx,.02,z1+.06);
      const railH=1.02,sides=[[x0-.12,cz-.12,.06,l+.24],[x1+.12,cz-.12,.06,l+.24],[cx,z0-.12,w+.3,.06]];
      for(const [x,z,sw,sd] of sides){add(new THREE.BoxGeometry(sw,.06,sd),iron,x,railH,z);add(new THREE.BoxGeometry(sw,.04,sd),iron,x,.14,z)}
      const posts=[];for(const [x,z,sw,sd] of sides){const len=Math.max(sw,sd),count=Math.round(len/.16);for(let i=0;i<=count;i++){const t=-len/2+len*i/count;posts.push(sw>sd?[x+t,z]:[x,z+t])}}
      const balusters=new THREE.InstancedMesh(new THREE.CylinderGeometry(.016,.016,railH-.14,6),iron,posts.length);
      posts.forEach(([x,z],i)=>{v.set(x,(railH+.14)/2,z);s.set(1,1,1);m4.compose(v,q,s);balusters.setMatrixAt(i,m4)});balusters.instanceMatrix.needsUpdate=true;hall.add(balusters);
      for(const x of [x0-.12,x1+.12]){add(new THREE.CylinderGeometry(.07,.09,2.75,10),iron,x,1.375,z1);add(new THREE.CylinderGeometry(.13,.13,.12,10),iron,x,.06,z1);add(new THREE.SphereGeometry(.17,14,10),glow,x,2.95,z1);add(new THREE.CylinderGeometry(.05,.1,.12,10),iron,x,2.78,z1)}
      add(new THREE.BoxGeometry(w+.3,.08,.08),iron,cx,2.62,z1);add(new THREE.BoxGeometry(w+.3,.06,.06),iron,cx,2.02,z1);
      const signData={type:'station-subway',key:'down',title:'The Station Subway',author:'Steps down through the floor, to the night trains.',action:'GO DOWN'};
      const signTex=enamel([['NIGHT COLLECTIONS',.36],['TO THE TRAINS',.64]],512,176);
      for(const [dz,yaw] of [[.045,0],[-.045,Math.PI]]){const sign=add(new THREE.PlaneGeometry(2.3,.79),new THREE.MeshStandardMaterial({map:signTex,emissive:0xffffff,emissiveMap:signTex,emissiveIntensity:.3,roughness:.5}),cx,2.32,z1+dz);sign.rotation.y=yaw;mark(sign,signData)}
      add(new THREE.BoxGeometry(2.42,.9,.06),iron,cx,2.32,z1);
      // Where a reader steps down: the open end of the well.
      mark(add(new THREE.BoxGeometry(w,1.6,.9),new THREE.MeshBasicMaterial({visible:false}),cx,.8,z1-.6),signData);
      collider?.(cx,cz-.1,w+.7,l+.55,'station-stairwell');
    }
    hallStairwell();

    // ---------- the subway ----------
    const W=SUB.width,half=W/2;
    function floorY(z){if(z<SUB.landing)return SUB.top;if(z<SUB.foot)return SUB.top*(SUB.foot-z)/(SUB.foot-SUB.landing);return 0}
    function contains(x,z){return Math.abs(x-SUB.x)<half+.2&&z>SUB.north-.2&&z<SUB.south+.2}
    function floorAt(x,z){return contains(x,z)?floorY(z):null}
    const blockers=[{x:SUB.x+MACHINE.side*(half-.3),z:MACHINE.z,w:.62,d:.9}];
    function allowed(x,z){
      if(!contains(x,z))return false;const r=player.radius||.42;
      if(Math.abs(x-SUB.x)+r>half-.08||z-r<SUB.north+.15||z+r>SUB.south-.15)return false;
      return !blockers.some(b=>Math.abs(x-b.x)<b.w/2+r&&Math.abs(z-b.z)<b.d/2+r);
    }

    function posterTexture(p){return canvasTexture((c,w,h)=>{
      const sky=c.createLinearGradient(0,0,0,h*.75);sky.addColorStop(0,'#0e1a2c');sky.addColorStop(1,p.key==='fog'?'#8b9694':'#33465a');c.fillStyle=sky;c.fillRect(0,0,w,h);
      c.fillStyle='#f3ead0';for(let i=0;i<40&&p.key!=='fog';i++){c.globalAlpha=.3+(i*37%10)/14;c.fillRect((i*97)%w,(i*53)%(h*.4),2,2)}c.globalAlpha=1;
      const ground=h*.66;
      if(p.key==='signal'){c.fillStyle='#14100c';c.fillRect(w*.58,h*.18,w*.035,ground-h*.18);c.save();c.translate(w*.6,h*.24);c.rotate(-.5);c.fillStyle='#b8322a';c.fillRect(0,-h*.018,w*.32,h*.036);c.fillStyle='#f3ead0';c.fillRect(w*.24,-h*.018,w*.025,h*.036);c.restore();
        const g=c.createRadialGradient(w*.6,h*.3,2,w*.6,h*.3,w*.22);g.addColorStop(0,'rgba(110,255,170,.9)');g.addColorStop(1,'rgba(110,255,170,0)');c.fillStyle=g;c.fillRect(0,0,w,h*.6);
        c.fillStyle='#2a2018';c.fillRect(w*.1,ground-h*.16,w*.32,h*.16);c.fillStyle='#ffd88a';for(const k of [0,1,2])c.fillRect(w*(.13+k*.1),ground-h*.12,w*.06,h*.05)}
      else if(p.key==='tide'){c.fillStyle='#132a3a';c.fillRect(0,h*.5,w,ground-h*.5);c.strokeStyle='rgba(220,230,240,.45)';c.lineWidth=2;for(let i=0;i<9;i++){const y=h*.53+i*h*.015;c.beginPath();c.moveTo((i*41)%w*.6,y);c.lineTo((i*41)%w*.6+w*.3,y);c.stroke()}
        c.fillStyle='#f4efd8';c.beginPath();c.arc(w*.72,h*.2,w*.07,0,7);c.fill();c.fillStyle='#3a2a1c';c.fillRect(w*.08,h*.32,w*.08,ground-h*.32);c.fillStyle='#e8dcc0';c.beginPath();c.arc(w*.12,h*.3,w*.07,0,7);c.fill();c.strokeStyle='#3a2a1c';c.lineWidth=3;c.beginPath();c.moveTo(w*.12,h*.3);c.lineTo(w*.12,h*.26);c.moveTo(w*.12,h*.3);c.lineTo(w*.15,h*.31);c.stroke()}
      else if(p.key==='depot'){c.fillStyle='#3a2a1c';c.fillRect(w*.1,h*.16,w*.8,ground-h*.16);for(let r=0;r<6;r++)for(let k=0;k<4;k++){c.fillStyle=(r+k)%3?'#6a4a2c':'#7a5634';c.fillRect(w*(.13+k*.19),h*(.19+r*.075),w*.16,h*.06);c.fillStyle='#d8b26a';c.fillRect(w*(.2+k*.19),h*(.215+r*.075),w*.03,h*.01)}}
      else if(p.key==='fog'){c.fillStyle='rgba(225,230,228,.55)';for(let i=0;i<6;i++){c.beginPath();c.ellipse(w*(i%3)*.45,h*(.3+i*.06),w*.5,h*.05,0,0,7);c.fill()}c.fillStyle='#2a2f2e';c.fillRect(w*.48,h*.28,w*.02,ground-h*.28);const g=c.createRadialGradient(w*.49,h*.27,2,w*.49,h*.27,w*.2);g.addColorStop(0,'rgba(255,230,170,.9)');g.addColorStop(1,'rgba(255,230,170,0)');c.fillStyle=g;c.fillRect(0,0,w,h*.6)}
      else if(p.key==='children'){c.fillStyle='#2c4a2a';c.beginPath();c.moveTo(0,h*.3);c.lineTo(w*.35,ground);c.lineTo(0,ground);c.fill();c.beginPath();c.moveTo(w,h*.28);c.lineTo(w*.65,ground);c.lineTo(w,ground);c.fill();
        c.strokeStyle='#9a8a70';c.lineWidth=3;c.beginPath();c.moveTo(w*.44,ground);c.lineTo(w*.49,h*.42);c.moveTo(w*.56,ground);c.lineTo(w*.51,h*.42);c.stroke();
        for(const [x,y] of [[.22,.5],[.3,.53],[.76,.5]]){c.fillStyle='#14100c';c.fillRect(w*x,h*y,w*.03,h*.07);c.fillStyle='#c0302a';c.fillRect(w*(x+.02),h*(y-.03),w*.07,h*.035)}}
      else if(p.key==='mugby'){c.strokeStyle='#c8b890';c.lineWidth=3;c.beginPath();c.moveTo(w*.5,ground);c.lineTo(w*.5,h*.45);c.moveTo(w*.5,h*.52);c.lineTo(w*.15,h*.4);c.moveTo(w*.5,h*.52);c.lineTo(w*.85,h*.4);c.stroke();
        c.fillStyle='#2a2018';c.fillRect(w*.62,h*.3,w*.16,h*.15);c.fillStyle='#ff6a4a';c.beginPath();c.arc(w*.7,h*.27,w*.025,0,7);c.fill()}
      c.fillStyle='#1c140e';c.fillRect(0,ground,w,h-ground);c.fillStyle=cream;c.textAlign='center';
      let size=30;c.font=`bold ${size}px Georgia`;while(c.measureText(p.title).width>w*.88&&size>14){size-=2;c.font=`bold ${size}px Georgia`}c.fillText(p.title,w/2,ground+h*.12);
      c.font=`italic ${Math.round(h*.04)}px Georgia`;c.fillStyle='#d9c48e';c.fillText(p.sub,w/2,ground+h*.2);
      c.font=`${Math.round(h*.028)}px Georgia`;c.fillStyle='#a99a78';c.fillText('THE NIGHT COLLECTIONS LINE',w/2,ground+h*.29);
      c.strokeStyle='#c8a85a';c.lineWidth=6;c.strokeRect(3,3,w-6,h-6)},300,420)}
    function boardTexture(){return canvasTexture((c,w,h)=>{c.fillStyle='#0d0f0e';c.fillRect(0,0,w,h);c.strokeStyle='#8a6a2e';c.lineWidth=8;c.strokeRect(4,4,w-8,h-8);c.fillStyle='#f2c75a';c.textAlign='left';
      c.font='bold 30px Georgia';c.fillText('PLATFORM 1  ·  NIGHT COLLECTIONS LINE',28,48);c.fillStyle='#8a7a5a';c.fillRect(28,62,w-56,2);c.font='24px Georgia';c.fillStyle='#e8d6a0';
      ['Calling at:','   The Signal House','   Tidebound Quay','   —  —  —','   The Collections Depot'].forEach((t,i)=>c.fillText(t,28,100+i*32));
      c.textAlign='right';c.fillStyle='#f2c75a';c.font='bold 22px Georgia';c.fillText('NEXT TRAIN',w-28,100);c.font='italic 22px Georgia';c.fillStyle='#e8d6a0';c.fillText('when you are ready',w-28,132);c.fillText('the conductor will wait',w-28,164)},768,288)}
    function viewTexture(kind){return canvasTexture((c,w,h)=>{
      if(kind==='up'){const g=c.createLinearGradient(0,h,0,0);g.addColorStop(0,'#3a2c1c');g.addColorStop(1,'#f2c98a');c.fillStyle=g;c.fillRect(0,0,w,h);c.fillStyle='rgba(30,20,12,.55)';for(let i=0;i<9;i++)c.fillRect(0,h-(i+1)*h*.1,w,h*.012)}
      else{c.fillStyle='#151e27';c.fillRect(0,0,w,h);c.fillStyle='#4a4339';c.fillRect(0,h*.72,w,h*.28);c.fillStyle='#24452f';c.fillRect(w*.6,h*.3,w*.4,h*.42);c.fillStyle='#ffd88a';for(const y of [.4])for(let k=0;k<3;k++)c.fillRect(w*(.64+k*.12),h*y,w*.07,h*.12);
        for(const x of [.15,.45]){const g=c.createRadialGradient(w*x,h*.3,2,w*x,h*.3,w*.25);g.addColorStop(0,'rgba(255,214,150,.85)');g.addColorStop(1,'rgba(255,214,150,0)');c.fillStyle=g;c.fillRect(0,0,w,h)}}},256,384)}

    function build(){
      if(built)return built;
      const root=new THREE.Group();root.name='station-subway';root.position.set(SUB.x,0,0);
      const owned=[],ours=[],own=t=>{owned.push(t);return t};
      const add=(geometry,material,x,y,z)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);root.add(m);return m};
      const box=(w,h,d,material,x,y,z)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z);
      const plane=(w,h,material,x,y,z,yaw=0)=>{const m=add(own(new THREE.PlaneGeometry(w,h)),material,x,y,z);m.rotation.y=yaw;return m};
      const lit=(map,k=.09)=>{const m=own(new THREE.MeshStandardMaterial({map,roughness:.35,emissive:0xffffff,emissiveMap:map,emissiveIntensity:k}));return m};
      const N=SUB.north,F=SUB.foot,S=SUB.south,T=SUB.top,run=F-SUB.landing,len=S-N,spring=2.7,hallSpring=T+2.7;
      // Walls: green tiles to the dado, white above, a maroon line between, and the line's name in a frieze.
      const frieze=own(canvasTexture((c,w,h)=>{c.fillStyle='#e9e3d2';c.fillRect(0,0,w,h);c.fillStyle='#7a2a20';c.fillRect(0,0,w,h*.1);c.fillRect(0,h*.9,w,h*.1);c.fillStyle=ink;c.font=`bold ${Math.round(h*.36)}px Georgia`;c.textAlign='center';c.textBaseline='middle';c.fillText('NIGHT COLLECTIONS  ✦',w/2,h/2)},1024,128));
      frieze.wrapS=THREE.RepeatWrapping;
      for(const sx of [-1,1]){const yaw=-sx*Math.PI/2,x=sx*half;
        // The passage, level, from the foot of the stair to the gates.
        const cl=S-F,cz=(S+F)/2;
        plane(cl,1.05,lit(own(repeat(greenTiles,cl/1.2,1.05/1.2)),.12),x,.525,cz,yaw);plane(cl,.07,own(new THREE.MeshStandardMaterial({color:0x7a2a20,roughness:.5})),x-sx*.001,1.085,cz,yaw);
        plane(cl,1.1,lit(own(repeat(whiteTiles,cl/1.2,1.1/1.2))),x,1.67,cz,yaw);
        const f=own(frieze.clone());f.wrapS=THREE.RepeatWrapping;f.repeat.set(cl/6,1);f.needsUpdate=true;plane(cl,.48,lit(f,.12),x,2.46,cz,yaw);
        // The stair hall, taller, from the top landing down to the passage.
        const sl=F-N,sz=(F+N)/2;plane(sl,hallSpring,lit(own(repeat(whiteTiles,sl/1.2,hallSpring/1.2))),x,hallSpring/2,sz,yaw);
      }
      // Tiled vaults over the passage and the stair hall, and an arched wall where they meet.
      const vault=(length,z,springY)=>{const tex=own(repeat(whiteTiles,Math.PI*half/1.2,length/1.2)),g=own(new THREE.CylinderGeometry(half,half,length,20,1,true,Math.PI/2,Math.PI));const m=add(g,lit(tex,.06),0,springY,z);m.material.side=THREE.BackSide;m.rotation.x=Math.PI/2;return m};
      vault(S-F,(S+F)/2,spring);vault(F-N,(F+N)/2,hallSpring);
      // The wall between the arch of the passage's vault and the stair hall's taller one.
      const shape=new THREE.Shape();shape.moveTo(-half,spring);shape.lineTo(-half,hallSpring+half);shape.lineTo(half,hallSpring+half);shape.lineTo(half,spring);shape.absarc(0,spring,half,0,Math.PI,false);
      const arch=add(own(new THREE.ShapeGeometry(shape,20)),lit(own(repeat(whiteTiles,1/1.2,1/1.2)),.07),0,0,F);arch.material.side=THREE.DoubleSide;
      // The end walls: the way out, up to the hall, at the north; the gates at the south.
      plane(W,hallSpring+half-T,lit(own(repeat(whiteTiles,W/1.2,(hallSpring+half-T)/1.2))),0,T+(hallSpring+half-T)/2,N);
      plane(W,spring+half,lit(own(repeat(whiteTiles,W/1.2,(spring+half)/1.2))),0,(spring+half)/2,S,Math.PI);
      // Floors: red and black quarry tiles in the passage, stone on the stair.
      const quarry=own(canvasTexture((c,w,h)=>{const n=8;for(let r=0;r<n;r++)for(let k=0;k<n;k++){c.fillStyle=(r+k)%2?'#5a2018':'#1a1412';c.fillRect(k*w/n,r*h/n,w/n,h/n);c.fillStyle='rgba(255,255,255,.04)';c.fillRect(k*w/n+2,r*h/n+2,w/n-4,3)}},256,256));quarry.wrapS=quarry.wrapT=THREE.RepeatWrapping;quarry.repeat.set(W/2.4,(S-F)/2.4);
      const floor=plane(W,S-F,own(new THREE.MeshStandardMaterial({map:quarry,roughness:.6})),0,0,(S+F)/2);floor.rotation.x=-Math.PI/2;
      const stone=own(new THREE.MeshStandardMaterial({color:0x8d877b,roughness:.9}));
      box(W,.3,SUB.landing-N,stone,0,T-.15,(N+SUB.landing)/2);
      const n=17,tread=run/n,steps=own(new THREE.InstancedMesh(own(new THREE.BoxGeometry(W,1,tread)),stone,n)),noses=own(new THREE.InstancedMesh(own(new THREE.BoxGeometry(W,.03,.05)),brass,n));
      const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),v=new THREE.Vector3(),s=new THREE.Vector3();
      for(let i=0;i<n;i++){const h=T*(i+1)/n,z=F-tread*(i+.5);v.set(0,h/2-.01,z);s.set(1,h,1);m4.compose(v,q,s);steps.setMatrixAt(i,m4);v.set(0,h+.005,F-tread*i-.025);s.set(1,1,1);m4.compose(v,q,s);noses.setMatrixAt(i,m4)}
      steps.instanceMatrix.needsUpdate=noses.instanceMatrix.needsUpdate=true;root.add(steps,noses);
      for(const sx of [-1,1]){const r=box(.06,.06,Math.hypot(run,T),brass,sx*(half-.08),T/2+.92,(F+SUB.landing)/2);r.rotation.x=Math.atan2(T,run)}
      // Lamps: globes hung from the crown of the vault (no light of their own), and the module's one lamp.
      const globes=[];for(let z=F+3;z<S-1;z+=6)globes.push([spring+half-.75,z]);globes.push([hallSpring+half-.9,(N+F)/2]);
      const globeMesh=own(new THREE.InstancedMesh(own(new THREE.SphereGeometry(.16,14,10)),glow,globes.length)),rodMesh=own(new THREE.InstancedMesh(own(new THREE.CylinderGeometry(.015,.015,.6,6)),iron,globes.length));
      globes.forEach(([y,z],i)=>{v.set(0,y,z);s.set(1,1,1);m4.compose(v,q,s);globeMesh.setMatrixAt(i,m4);v.set(0,y+.42,z);m4.compose(v,q,s);rodMesh.setMatrixAt(i,m4)});globeMesh.instanceMatrix.needsUpdate=rodMesh.instanceMatrix.needsUpdate=true;root.add(globeMesh,rodMesh);
      const lamp=new THREE.PointLight(0xffd8a8,7,30,2);lamp.position.set(0,3.6,-616);root.add(lamp);
      // Signs: at the foot of the stair (both faces), over the gates, and over the way out.
      const signMat=tex=>own(new THREE.MeshStandardMaterial({map:tex,emissive:0xffffff,emissiveMap:tex,emissiveIntensity:.35,roughness:.5}));
      box(.04,.5,.04,iron,0,2.55,F+.6);box(2.5,.62,.05,iron,0,2.05,F+.6);
      plane(2.4,.52,signMat(own(enamel([['TO THE TRAINS',1]]))),0,2.05,F+.57,Math.PI);
      plane(2.4,.52,signMat(own(enamel([['WAY OUT',.45],['THE GRAND HALL',.42]]))),0,2.05,F+.63);
      const card=(object,key,title,author,action='LOOK')=>mark(object,{type:'station-subway',key,title,author,action},ours);
      // The way out: an arch in the north wall, the stair beyond it climbing towards warm light.
      const out=plane(1.7,2.5,own(new THREE.MeshBasicMaterial({map:own(viewTexture('up'))})),0,T+1.25,N+.02);
      card(out,'up','The way out','Up the steps to the Grand Hall.','UP TO THE GRAND HALL');
      for(const sx of [-1,1])box(.18,2.7,.12,brass,sx*.94,T+1.35,N+.08);box(2.06,.18,.12,brass,0,T+2.7,N+.08);
      plane(2.4,.52,signMat(own(enamel([['WAY OUT',.45],['THE GRAND HALL',.42]]))),0,T+3.25,N+.03);
      // The gates: a lattice of iron across the passage's end, the lamplit platform beyond, and the platform's name.
      const beyond=plane(W-.2,2.7,own(new THREE.MeshBasicMaterial({map:own(viewTexture('platform'))})),0,1.35,S-.03,Math.PI);
      const bars=[];for(let x=-half+.15;x<half-.1;x+=.22)bars.push([x,0]);for(let x=-half+.15;x<half-.1;x+=.44)bars.push([x,1]);
      const barMesh=own(new THREE.InstancedMesh(own(new THREE.BoxGeometry(.03,2.6,.03)),iron,bars.length));
      bars.forEach(([x,k],i)=>{v.set(x+(k?.11:0),1.3,S-.35);s.set(1,1,1);m4.compose(v,q,s);barMesh.setMatrixAt(i,m4)});barMesh.instanceMatrix.needsUpdate=true;root.add(barMesh);
      for(const y of [.12,1.3,2.55])box(W,.05,.05,iron,0,y,S-.35);
      const gate=box(W-.2,2.6,.05,own(new THREE.MeshBasicMaterial({visible:false})),0,1.3,S-.4);
      card(gate,'gates','The platform gates','Beyond them, the Library Platform and the reading carriage.','TO THE PLATFORM');
      plane(3.2,.6,signMat(own(enamel([['PLATFORM 1  ·  THE LIBRARY PLATFORM',1]],768,144))),0,3.1,S-.04,Math.PI);
      // The departure board, hung over the passage.
      box(.04,.9,.04,iron,-.9,3.85,-616.2);box(.04,.9,.04,iron,.9,3.85,-616.2);box(2.5,1,.12,own(new THREE.MeshStandardMaterial({color:0x101210,roughness:.6})),0,2.95,-616.2);
      const board=plane(2.36,.88,signMat(own(boardTexture())),0,2.95,-616.27,Math.PI);
      card(board,'board','The departure board','Calling at the Signal House, Tidebound Quay, a stop with no name and the Collections Depot. No time is given for the next train: the conductor waits until a reader boards, then asks where they would like to stop.','READ');
      // Posters in brass frames, three to a wall.
      const frameGeo=own(new THREE.BoxGeometry(.05,1.72,1.26)),posterGeo=own(new THREE.PlaneGeometry(1.14,1.6));
      for(const p of POSTERS){const x=p.side*(half-.03);add(frameGeo,brass,x,1.75,p.z);const m=add(posterGeo,own(new THREE.MeshStandardMaterial({map:own(posterTexture(p)),roughness:.75,emissive:0xffffff,emissiveIntensity:.12})),x-p.side*.03,1.75,p.z);
        m.material.emissiveMap=m.material.map;m.rotation.y=-p.side*Math.PI/2;card(m,'poster-'+p.key,p.title.replace(/[—\s]+$/,'')||'A poster',p.card)}
      // A ticket machine in maroon enamel and brass.
      const mx=MACHINE.side*(half-.3),maroon=own(new THREE.MeshStandardMaterial({color:0x5a1a18,roughness:.45,metalness:.2}));
      const body=box(.55,1.55,.8,maroon,mx,.775,MACHINE.z);box(.57,.08,.82,brass,mx,1.58,MACHINE.z);box(.04,.05,.3,brass,mx-MACHINE.side*.28,1.05,MACHINE.z);
      const face=plane(.62,.32,signMat(own(enamel([['TICKETS',1]],256,128))),mx-MACHINE.side*.285,1.3,MACHINE.z,-MACHINE.side*Math.PI/2);
      for(const m of [body,face])card(m,'machine','A ticket machine','Maroon enamel and brass, with a slot and a lever.','PULL THE LEVER');
      scene.add(root);
      built={root,owned,ours,lamp};return built;
    }
    function free(){
      if(!built)return;const state=built;built=null;
      state.lamp.userData.freed=true;state.root.removeFromParent();
      for(let i=interactables.length-1;i>=0;i--)if(state.ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of state.owned)thing.dispose?.();
    }

    // ---------- the way back from the platform ----------
    // An archway in the Library Platform's south wall, added to the platform's own group once the railway builds it,
    // so it is shown and hidden with the platform.
    function hangPlatformExit(){
      const group=railway?.groups?.platform;if(platformExit||!railway?.built||!group)return;
      const g=new THREE.Group();g.position.set(213,0,-5.05);group.add(g);
      const tiles=new THREE.MeshStandardMaterial({map:repeat(whiteTiles,2.4/1.2,3/1.2),roughness:.35,emissive:0xffffff,emissiveIntensity:.14});tiles.emissiveMap=tiles.map;
      const back=new THREE.Mesh(new THREE.PlaneGeometry(2.4,3),tiles);back.position.set(0,1.5,.02);back.rotation.y=Math.PI;g.add(back);
      const view=new THREE.Mesh(new THREE.PlaneGeometry(1.6,2.4),new THREE.MeshBasicMaterial({map:viewTexture('up')}));view.position.set(0,1.2,-.01);view.rotation.y=Math.PI;g.add(view);
      for(const sx of [-1,1]){const jamb=new THREE.Mesh(new THREE.BoxGeometry(.16,2.6,.12),brass);jamb.position.set(sx*.88,1.3,-.06);g.add(jamb)}
      const head=new THREE.Mesh(new THREE.BoxGeometry(1.92,.16,.12),brass);head.position.set(0,2.6,-.06);g.add(head);
      const tex=enamel([['WAY OUT',.45],['SUBWAY TO THE GRAND HALL',.42]]);
      const sign=new THREE.Mesh(new THREE.PlaneGeometry(2.3,.5),new THREE.MeshStandardMaterial({map:tex,emissive:0xffffff,emissiveMap:tex,emissiveIntensity:.35,roughness:.5}));sign.position.set(0,3.1,-.03);sign.rotation.y=Math.PI;g.add(sign);
      const data={type:'station-subway',key:'from-platform',title:'The way out',author:'The subway, back to the Grand Hall.',action:'TO THE GRAND HALL'};
      mark(view,data);mark(sign,data);platformExit=g;
    }

    // ---------- going through ----------
    function arrive(at){move(at.x,at.z,at.yaw,at.y);lastInside=time}
    function enter(from='hall'){
      build();lastInside=time;
      if(from==='platform'){arrive(ARRIVE.gates);showNotice('The Station Subway. The steps at the far end go up to the Grand Hall.',6)}
      else{arrive(ARRIVE.top);showNotice('The Station Subway: down the steps and along to the platform gates. The night trains leave from beyond them.',7)}
      playSample?.('doorOpen',.35,.8);
      analytics?.track('Journey Taken',{journey:'station-subway'});
      nextRumble=time+8+Math.random()*10;
    }
    function toHall(){arrive(ARRIVE.hall);playSample?.('doorOpen',.35,.85);showNotice('Up the steps, into the Grand Hall.',3)}
    function toPlatform(){
      if(railway?.entrance&&railway.interact(railway.entrance))return;
      showNotice('The gates are locked tonight.',4);
    }
    function interact(object){
      const d=object?.userData;if(d?.type!=='station-subway')return false;
      switch(d.key){
        case 'down':enter('hall');break;
        case 'from-platform':enter('platform');break;
        case 'up':toHall();break;
        case 'gates':toPlatform();break;
        case 'machine':sound?.(900,.05,'square',.04);sound?.(520,.12,'triangle',.04);showNotice('The machine whirrs and prints a ticket: GRAND HALL — LIBRARY PLATFORM, ONE READER, RETURN. The fare is given as “one curiosity”.',8);break;
        default:showNotice(`${d.title}: ${d.author}`,9);
      }
      return true;
    }

    // ---------- every frame ----------
    // Now and then a train passes somewhere beneath: a low rumble, and the lamp trembles.
    function update(t){
      time=t;hangPlatformExit();
      const inside=contains(player.pos.x,player.pos.z);
      if(!built)return;
      if(inside)lastInside=t;else if(t-lastInside>KEEP){free();return}
      if(inside&&t>=nextRumble){nextRumble=t+40+Math.random()*40;rumbleUntil=t+2.6;sound?.(38,2.6,'sine',.09);sound?.(55,2.2,'triangle',.035);
        if(!heardRumble){heardRumble=true;showNotice('Somewhere beneath the subway, a train passes. The lamps tremble.',5)}}
      const lamp=built.lamp,k=t<rumbleUntil&&!isReduced()?1-.18*Math.abs(Math.sin(t*23)):1;lamp.intensity=7*k;
    }
    return {contains,floorAt,allowed,interact,update,enter,free,build,well:WELL,subway:SUB,arrive:ARRIVE,posters:POSTERS,
      get built(){return !!built},get platformExit(){return platformExit},zoneAt:(x,z)=>contains(x,z)?'station-subway':null};
  };
})();
