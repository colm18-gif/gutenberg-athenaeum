// The library that was never built. In 1785 Étienne-Louis Boullée drew a reading room for the King's Library in Paris:
// the old library's long courtyard roofed with one coffered barrel vault, open to the sky along its crown, with the books
// in tiers down both sides ("a vast amphitheatre of books") under a colonnade. It was never built; the drawings are in
// the Bibliothèque nationale de France. This is the library's own building of it, about a hundred metres long.
//
// The way in is his drawing, framed in the Long Corridor's east wall (third bay): step into it, as into the mountain
// painting. Inside: a marble floor 16 m wide, four tiers of bookcases a side (each 3.4 m high, its terrace 3.6 m deep),
// zigzag stairs at both ends of both sides (the steps are the floor there; `allowed` takes them a step or two at a
// time and treats a tier's face as a wall), a colonnade on the top terrace and the vault 45 m up. Everything is painted:
// unlit materials, no lights, the books of the tiers one tiling texture, columns, steps and the small figures in antique
// dress (as he drew them) InstancedMeshes. Inside, the sky and fog are turned to a pale haze.
//
// Eight of the library's own books about books and libraries (`OWN`) stand on stone lecterns up the tiers. The secret:
// brass letters let into the floor, each taller than a reader, can only be read from the top terrace; read from there,
// they leave the catalogue of Dr John Dee's lost library (`SECRET`) on the stand at the north end, found for good
// (`athenaeum-boullee-pavement`; `?pavement`). Built when the reader steps in, freed a while after they leave.
(function(){
  'use strict';
  const HALL={cx:2000,cz:0,len:96,floor:8,tiers:4,tread:3.6,rise:3.4,colX:21.2,wallX:24.4,colH:9,ent:1.4},KEEP=25;
  const TOP=HALL.tiers*HALL.rise,SPRING=TOP+HALL.colH+HALL.ent,R=HALL.colX,GAP=.25;// the vault springs 24 m up; the skylight is ±GAP radians about its crown
  const face=k=>HALL.floor+k*HALL.tread;// where tier k's bookcase stands (its terrace, on top, runs back to the next)
  // The stairs: sixteen steps and a landing to each tier, against the tier's own bookcase, doubling back up the side.
  const STEPS=16,STEP_RISE=HALL.rise/STEPS,STEP_RUN=.3375,FLIGHT=STEPS*STEP_RUN,LANDING=1.2,STAIR_W=1.4,STACKS=[{z0:36,d:-1},{z0:-36,d:1}];
  const flightOf=(stack,k)=>({k,start:k%2?stack.z0+stack.d*(FLIGHT+LANDING):stack.z0,dir:k%2?-stack.d:stack.d});
  const PAVEMENT='A LIBRARY NEVER BUILT IS NEVER CLOSED';
  // The library's own copies, low to high: [id, side, level, z].
  const OWN=[[1302,-1,0,20],[22608,1,0,6],[22136,-1,1,-4],[443,1,1,22],[26378,1,2,-14],[36764,-1,2,12],[28540,-1,3,-22],[1615,1,3,2]];
  const SECRET=19553;
  const CARDS={
    about:['The library that was never built','In 1785 Étienne-Louis Boullée drew a new reading room for the King’s Library in Paris: the long courtyard of the old library roofed with one immense coffered vault, lit from the sky, with the books in tiers down both sides. He called it a vast amphitheatre of books, and said the idea came to him from Raphael’s School of Athens. It was never built. His drawings are kept in the Bibliothèque nationale de France, the library he drew it for. This is the library’s own building of it, about a hundred metres from end to end. The stairs are at both ends of each side.'],
    hands:['From hand to hand','Boullée meant the books to be passed down from hand to hand by attendants standing along the tiers, to the reader waiting below. The figures are as he drew them: in antique dress, and very small.'],
    colonnade:['The colonnade','Above the last tier a row of columns carries the vault, and the vault is open to the sky along its crown. Boullée taught more than he built: almost nothing he designed at this size was ever put up, and he is remembered for his drawings.'],
    floor:['Brass letters in the floor','Letters of brass let into the marble, each taller than a reader, running the length of the hall. They were not laid to be read from down here.'],
    frame:['The way back','A gilt frame standing at the south end, with the Long Corridor’s lamplight in it.'],
    stand:['An empty stand','A stone book stand at the north end of the top terrace, with nothing on it. It faces the floor far below.']
  };

  window.createBoulleeLibrary=function(options){
    const {THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,findBook,showNotice,playSample,move,registerSeat=null,analytics,corridor=null,
      isHolding=()=>false,storage=null,search=''}=options;
    const PICTURE=corridor?{x:corridor.room.cx+corridor.room.w/2-.19,z:corridor.bayZ(2),yaw:-Math.PI/2,bay:2,side:'east'}:null;
    const get=k=>{try{return storage?.getItem(k)}catch(e){return null}},put=(k,v)=>{try{storage?.setItem(k,v)}catch(e){}};
    let root=null,time=0,lastNeeded=-1e9,state=null,found=get('athenaeum-boullee-pavement')==='1'||/[?&]pavement\b/.test(search);
    const owned=[],ours=[],books=[],blockers=[];
    const own=thing=>{owned.push(thing);return thing};
    const basic=params=>own(new THREE.MeshBasicMaterial(params));
    function add(geometry,material,x,y,z,parent=root){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m}
    function mark(object,data){object.userData=data;interactables.push(object);ours.push(object);return object}
    const card=key=>({type:'boullee-card',title:CARDS[key][0],author:CARDS[key][1],action:'READ'});
    function block(x,z,w,d){blockers.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
    const seeded=seed=>()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646};
    const {cx,cz}=HALL,L=HALL.len;

    // ---------- the floor: marble, four tiers a side, and the stairs ----------
    function stairHeight(ax,lz){
      for(const stack of STACKS)for(let k=0;k<HALL.tiers;k++){if(ax<face(k)-STAIR_W||ax>face(k))continue;const f=flightOf(stack,k),a=(lz-f.start)*f.dir;
        if(a>=0&&a<=FLIGHT+LANDING)return k*HALL.rise+(a>=FLIGHT?HALL.rise:Math.min(STEPS,Math.floor(a/STEP_RUN)+1)*STEP_RISE)}
      return null}
    function heightAt(lx,lz){const ax=Math.abs(lx),stair=stairHeight(ax,lz);if(stair!=null)return stair;for(let k=0;k<HALL.tiers;k++)if(ax<=face(k))return k*HALL.rise;return TOP}
    function contains(x,z){return Math.abs(x-cx)<HALL.wallX+1&&Math.abs(z-cz)<L/2+1}
    function floorAt(x,z){return contains(x,z)?heightAt(x-cx,z-cz):null}
    function allowed(x,z){
      if(!root||!contains(x,z))return false;const lx=x-cx,lz=z-cz,rad=player.radius||.42;
      if(Math.abs(lz)>L/2-.7||Math.abs(lx)>HALL.wallX-.6)return false;
      const h=heightAt(lx,lz),here=contains(player.pos.x,player.pos.z)?heightAt(player.pos.x-cx,player.pos.z-cz):h;
      if(Math.abs(h-here)>.45)return false;// a step or two at a time: no stepping off a terrace, no climbing a bookcase
      for(const [dx,dz] of [[.3,0],[-.3,0],[0,.3],[0,-.3]])if(heightAt(lx+dx,lz+dz)>h+.45)return false;// a tier's face is a wall
      return !blockers.some(b=>x+rad>b.minX&&x-rad<b.maxX&&z+rad>b.minZ&&z-rad<b.maxZ)}

    // ---------- painting ----------
    const speckle=(c,W,H,r,n,lo,hi,a)=>{for(let i=0;i<n;i++){const v=lo+r()*(hi-lo)|0;c.fillStyle=`rgba(${v},${v-6},${v-18},${a})`;c.fillRect(r()*W,r()*H,2+r()*14,1+r()*5)}};
    function textures(){const r=seeded(1785),t={};
      const tex=(fn,W,H,rx=1,ry=1)=>{const x=own(canvasTexture(fn,W,H));x.wrapS=x.wrapT=THREE.RepeatWrapping;x.repeat?.set?.(rx,ry);return x};
      // One bay of a bookcase, 4.8 m by 3.4 m: seven shelves of spines between two stone uprights.
      t.books=tex((c,W,H)=>{c.fillStyle='#2a2018';c.fillRect(0,0,W,H);const rows=7,rh=H/rows,pal=['#6b3a24','#7d4a2a','#58301f','#8a5a34','#3f2a1c','#7a2d24','#2f4634','#28364c','#b9a57c','#cbbd96','#8c6b3c','#5a4630'];
        for(let j=0;j<rows;j++){const y0=j*rh;let x=30;while(x<W-30){const w=7+r()*13,h=rh*(.66+r()*.24),col=pal[r()*pal.length|0];if(r()<.04){x+=w;continue}c.fillStyle=col;c.fillRect(x,y0+rh-8-h,w-1,h);
            c.fillStyle='rgba(255,236,190,.16)';c.fillRect(x,y0+rh-8-h,1.5,h);if(r()<.55){c.fillStyle='rgba(214,178,96,.75)';c.fillRect(x+1,y0+rh-8-h*(.72+r()*.1),w-3,2);if(r()<.5)c.fillRect(x+1,y0+rh-8-h*.22,w-3,2)}x+=w}
          const g=c.createLinearGradient(0,y0,0,y0+rh);g.addColorStop(0,'rgba(0,0,0,.6)');g.addColorStop(.35,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,y0,W,rh);
          c.fillStyle='#c9bb9d';c.fillRect(0,y0+rh-8,W,8);c.fillStyle='rgba(0,0,0,.25)';c.fillRect(0,y0+rh-2,W,2)}
        for(const x of [0,W-30]){const g=c.createLinearGradient(x,0,x+30,0);g.addColorStop(0,'#b5a78a');g.addColorStop(.5,'#ddd0b3');g.addColorStop(1,'#a89a7e');c.fillStyle=g;c.fillRect(x,0,30,H)}},1024,512,L/4.8,1);
      t.stone=tex((c,W,H)=>{c.fillStyle='#cfc3a8';c.fillRect(0,0,W,H);speckle(c,W,H,r,500,170,225,.35);c.strokeStyle='rgba(90,78,58,.45)';c.lineWidth=2;for(let i=0;i<=4;i++){c.beginPath();c.moveTo(0,i*H/4);c.lineTo(W,i*H/4);c.stroke();for(let j=0;j<2;j++){const x=(j+(i%2)*.5)*W/2;c.beginPath();c.moveTo(x,i*H/4);c.lineTo(x,(i+1)*H/4);c.stroke()}}},256,256);
      t.side=tex((c,W,H)=>{c.fillStyle='#978b72';c.fillRect(0,0,W,H);speckle(c,W,H,r,300,120,168,.35)},128,128);
      t.shade=tex((c,W,H)=>{c.fillStyle='#7c715c';c.fillRect(0,0,W,H);speckle(c,W,H,r,300,100,146,.35)},128,128);
      // The pavement: chequered marble, with the brass letters down each half, each line upright to the terrace opposite.
      t.floor=own(canvasTexture((c,W,H)=>{c.fillStyle='#d8cdb4';c.fillRect(0,0,W,H);const s=W/8;for(let j=0;j*s<H;j++)for(let i=0;i<8;i++)if((i+j)%2){c.fillStyle='#a79a82';c.fillRect(i*s,j*s,s,s)}
        speckle(c,W,H,r,2500,160,235,.22);c.fillStyle='#8a5f1c';c.fillRect(W/2-3,0,6,H);c.strokeStyle='#7a5418';c.lineWidth=6;c.strokeRect(8,8,W-16,H-16);
        c.font=`bold ${Math.round(W*.2)}px Georgia`;c.textAlign='center';c.textBaseline='middle';
        for(const [x,turn] of [[W*.355,-1],[W*.645,1]]){c.save();c.translate(x,H/2);c.rotate(turn*Math.PI/2);c.fillStyle='#5d3f10';c.fillText(PAVEMENT,3,3);c.fillStyle='#c79a3a';c.fillText(PAVEMENT,0,0);c.restore()}},384,2304));
      t.coffer=tex((c,W,H)=>{c.fillStyle='#c4b89e';c.fillRect(0,0,W,H);for(const [m,col] of [[18,'#93876f'],[34,'#7b705b'],[52,'#665c4a']]){c.fillStyle=col;c.fillRect(m,m,W-2*m,H-2*m)}
        c.fillStyle='rgba(255,244,214,.25)';c.fillRect(18,H-34,W-36,16);c.fillStyle='#b9a66f';c.beginPath();c.arc(W/2,H/2,16,0,7);c.fill()},256,256);
      t.sky=own(canvasTexture((c,W,H)=>{const g=c.createLinearGradient(0,0,W,0);g.addColorStop(0,'#f6f1e4');g.addColorStop(.5,'#dfe9f2');g.addColorStop(1,'#f6f1e4');c.fillStyle=g;c.fillRect(0,0,W,H);
        for(let i=0;i<26;i++){const x=r()*W,y=r()*H,g2=c.createRadialGradient(x,y,2,x,y,30+r()*50);g2.addColorStop(0,'rgba(255,255,255,.9)');g2.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g2;c.fillRect(0,0,W,H)}},128,1024));
      t.shaft=own(canvasTexture((c,W,H)=>{const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(255,244,214,.9)');g.addColorStop(1,'rgba(255,244,214,0)');c.fillStyle=g;c.fillRect(0,0,W,H);
        c.globalCompositeOperation='destination-out';for(let i=0;i<40;i++){c.fillStyle=`rgba(0,0,0,${.15+r()*.5})`;c.fillRect(r()*W,0,2+r()*10,H)}},256,128));
      t.column=tex((c,W,H)=>{const g=c.createLinearGradient(0,0,W,0);g.addColorStop(0,'#8f846e');g.addColorStop(.3,'#e6dbc0');g.addColorStop(.55,'#cdc1a6');g.addColorStop(1,'#8f846e');c.fillStyle=g;c.fillRect(0,0,W,H);
        c.fillStyle='rgba(60,50,36,.22)';for(let i=0;i<20;i++)c.fillRect(i*W/20,0,W/60,H)},256,32);
      // An end wall, 49 m square: the vault's own arch, and in it a great niche (lit like sky at the north end) over a portal.
      const end=bright=>own(canvasTexture((c,W,H)=>{const m=W/49,gy=H-m,ay=gy-SPRING*m;c.fillStyle='#b3a78d';c.fillRect(0,0,W,H);speckle(c,W,H,r,1400,150,205,.3);
        for(const [rad,col] of [[R,'#8f8368'],[R-1.2,'#c9bda2'],[R-2.2,'#7d7260']]){c.fillStyle=col;c.beginPath();c.arc(W/2,ay,rad*m,Math.PI,0);c.lineTo(W/2+rad*m,gy);c.lineTo(W/2-rad*m,gy);c.fill()}
        const nr=15*m,g=c.createLinearGradient(0,ay-nr,0,gy);if(bright){g.addColorStop(0,'#fbf6e6');g.addColorStop(.6,'#e9e4d2');g.addColorStop(1,'#cfc6ae')}else{g.addColorStop(0,'#5c5445');g.addColorStop(1,'#8b806a')}
        c.fillStyle=g;c.beginPath();c.arc(W/2,ay,nr,Math.PI,0);c.lineTo(W/2+nr,gy);c.lineTo(W/2-nr,gy);c.fill();
        c.strokeStyle=bright?'rgba(150,140,115,.5)':'rgba(30,26,20,.5)';c.lineWidth=2;for(let i=1;i<12;i++){const a=Math.PI+i*Math.PI/12;c.beginPath();c.moveTo(W/2,ay);c.lineTo(W/2+Math.cos(a)*nr,ay+Math.sin(a)*nr);c.stroke()}
        for(const rr of [.35,.62,.85]){c.beginPath();c.arc(W/2,ay,nr*rr,Math.PI,0);c.stroke()}
        c.fillStyle='#a2967c';c.fillRect(W/2-4.4*m,gy-12.6*m,8.8*m,12.6*m);c.beginPath();c.moveTo(W/2-5.2*m,gy-12.6*m);c.lineTo(W/2,gy-15*m);c.lineTo(W/2+5.2*m,gy-12.6*m);c.fill();
        c.fillStyle=bright?'#f3ecd8':'#2b251d';c.fillRect(W/2-2.6*m,gy-10.4*m,5.2*m,10.4*m)},1024,1024));
      t.north=end(true);t.south=end(false);
      // The colonnade's back wall: a niche in each bay.
      t.niche=tex((c,W,H)=>{c.fillStyle='#978b73';c.fillRect(0,0,W,H);speckle(c,W,H,r,300,120,170,.3);const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#4f4739');g.addColorStop(1,'#6f6552');c.fillStyle=g;c.beginPath();c.arc(W/2,H*.38,W*.26,Math.PI,0);c.lineTo(W*.76,H*.92);c.lineTo(W*.24,H*.92);c.fill()},256,512,L/4,1);
      // The corridor in the frame at the south end.
      t.frame=own(canvasTexture((c,W,H)=>{c.fillStyle='#2a1a10';c.fillRect(0,0,W,H);c.fillStyle='#3d2616';c.beginPath();c.moveTo(0,H);c.lineTo(W*.36,H*.62);c.lineTo(W*.64,H*.62);c.lineTo(W,H);c.fill();c.fillStyle='#1c120b';c.fillRect(W*.36,H*.2,W*.28,H*.42);
        for(const [x,y,s] of [[.5,.14,60],[.5,.3,26]]){const g=c.createRadialGradient(W*x,H*y,2,W*x,H*y,s);g.addColorStop(0,'rgba(255,214,150,1)');g.addColorStop(1,'rgba(255,190,110,0)');c.fillStyle=g;c.fillRect(0,0,W,H)}},256,384));
      return t}
    // His drawing, for the corridor's wall: the hall in one-point perspective, in grey wash on buff paper.
    const drawing=(c,W,H)=>{c.fillStyle='#cdbf9f';c.fillRect(0,0,W,H);const vx=W/2,vy=H*.6,sx=W*.46,per=d=>1/(1+d*.9);c.lineWidth=2;
      for(let d=0;d<=10;d++){const p=per(d),y=vy-(vy-H*.06)*0+0,sp=vy-H*.16*p;c.strokeStyle=`rgba(40,34,26,${.9-d*.06})`;c.beginPath();c.arc(vx,sp,sx*p,Math.PI,0);c.stroke();
        c.beginPath();c.moveTo(vx-sx*p,sp);c.lineTo(vx-sx*p,vy+H*.34*p);c.moveTo(vx+sx*p,sp);c.lineTo(vx+sx*p,vy+H*.34*p);c.stroke()}
      c.strokeStyle='rgba(40,34,26,.85)';for(const s of [-1,1])for(let k=0;k<=5;k++){const f=.36+k*.128;c.beginPath();c.moveTo(vx+s*sx*f,vy+H*.34-k*H*.085);c.lineTo(vx+s*sx*f*per(10),vy+(H*.34-k*H*.085)*per(10));c.stroke()}
      c.fillStyle='rgba(255,252,240,.85)';c.beginPath();c.moveTo(vx-sx*.2,vy-H*.16-sx*.98);c.lineTo(vx+sx*.2,vy-H*.16-sx*.98);c.lineTo(vx+sx*.2*per(10),vy-(H*.16+sx*.98)*per(10));c.lineTo(vx-sx*.2*per(10),vy-(H*.16+sx*.98)*per(10));c.fill();
      c.fillStyle='rgba(50,44,34,.8)';let k=7;const rnd=()=>(k=(k*9301+49297)%233280)/233280;for(let i=0;i<26;i++){const d=rnd()*8,p=per(d),x=vx+(rnd()-.5)*sx*.6*p,y=vy+H*.34*p;c.fillRect(x,y-7*p,2.2*p,7*p)}
      c.strokeStyle='#6d624e';c.lineWidth=3;c.strokeRect(6,6,W-12,H-12);c.fillStyle='#4a4234';c.font='italic 15px Georgia';c.textAlign='center';c.fillText('Boullée · Bibliothèque du Roi · 1785',W/2,H-16)};

    // ---------- his drawing, in the Long Corridor (built at startup and kept) ----------
    function hangPicture(){if(!PICTURE)return;const g=new THREE.Group();g.name='boullee-picture';g.position.set(PICTURE.x,2.45,PICTURE.z);g.rotation.y=PICTURE.yaw;scene.add(g);
      const data={type:'boullee-picture',title:'A library that was never built',author:'A drawing in grey wash: one immense vaulted hall, open to the sky, with books in tiers down both sides and readers the size of ants. Étienne-Louis Boullée, for the King’s Library in Paris, 1785. It looks as though one could step into it.',action:'STEP IN'};
      const gilt=MAT.brass||new THREE.MeshStandardMaterial({color:0xb08d3a,metalness:.6,roughness:.4});
      const frame=add(new THREE.BoxGeometry(3,2.1,.08),gilt,0,0,0,g);frame.userData=data;interactables.push(frame);
      const tex=canvasTexture(drawing,768,512),sheet=add(new THREE.PlaneGeometry(2.76,1.86),new THREE.MeshStandardMaterial({map:tex,emissive:0xffffff,emissiveMap:tex,emissiveIntensity:.12,roughness:.9}),0,0,.045,g);sheet.userData=data;interactables.push(sheet);
      const plate=add(new THREE.BoxGeometry(.9,.14,.03),gilt,0,-1.22,.02,g);plate.userData=data;interactables.push(plate)}

    // ---------- the hall ----------
    function build(){
      if(root)return;root=new THREE.Group();root.name='boullee-library';const t=textures(),r=seeded(99),X=lx=>cx+lx,Z=lz=>cz+lz;
      const stone=basic({map:t.stone}),side=basic({map:t.side}),shade=basic({map:t.shade}),blocks=[side,side,stone,shade,shade,shade];// a block: light on top, darker on its faces
      const flat=(w,d,mat,x,y,z)=>{const m=add(own(new THREE.PlaneGeometry(w,d)),mat,x,y,z);m.rotation.x=-Math.PI/2;return m};
      mark(flat(HALL.floor*2,L,basic({map:t.floor}),cx,0,cz),card('floor'));
      // Four tiers a side: the bookcase, the terrace on top of it and a kerb along its edge.
      const shelves=basic({map:t.books}),paving=k=>{const p=own(t.stone.clone?.()||t.stone);p.repeat?.set?.(k,L/2.4);p.needsUpdate=true;return basic({map:p})},walk=paving(1.5),wide=paving(2.4);
      for(const s of [-1,1]){
        for(let k=0;k<HALL.tiers;k++){const f=face(k),wall=add(own(new THREE.PlaneGeometry(L,HALL.rise)),shelves,X(s*f),k*HALL.rise+HALL.rise/2,cz);wall.rotation.y=-s*Math.PI/2;
          const last=k===HALL.tiers-1,depth=last?HALL.wallX-f:HALL.tread;flat(depth,L,last?wide:walk,X(s*(f+depth/2)),(k+1)*HALL.rise,cz);
          add(own(new THREE.BoxGeometry(.3,.22,L)),blocks,X(s*(f+.15)),(k+1)*HALL.rise+.11,cz)}
        // The colonnade's entablature, its back wall and the ceiling of the walk behind the columns.
        add(own(new THREE.BoxGeometry(2.2,HALL.ent,L)),blocks,X(s*HALL.colX),TOP+HALL.colH+HALL.ent/2,cz);
        const back=add(own(new THREE.PlaneGeometry(L,HALL.colH)),basic({map:t.niche}),X(s*HALL.wallX),TOP+HALL.colH/2,cz);back.rotation.y=-s*Math.PI/2;
        const lid=flat(HALL.wallX-HALL.colX,L,shade,X(s*(HALL.colX+HALL.wallX)/2),TOP+HALL.colH,cz);lid.rotation.x=Math.PI/2}
      // Columns, their bases and capitals, and the steps: three InstancedMeshes.
      const dummy=new THREE.Object3D(),place=(mesh,i,x,y,z,sx=1,sy=1,sz=1)=>{dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.updateMatrix?.();mesh.setMatrixAt?.(i,dummy.matrix)};
      const colZ=[];for(let z=-46;z<=46;z+=4)colZ.push(z);
      const columns=new THREE.InstancedMesh(own(new THREE.CylinderGeometry(.5,.56,HALL.colH-1,14,1,true)),basic({map:t.column}),colZ.length*2),caps=new THREE.InstancedMesh(own(new THREE.BoxGeometry(1,1,1)),blocks,colZ.length*4);
      colZ.forEach((z,i)=>{for(const [j,s] of [[0,-1],[1,1]]){const n=i*2+j,x=X(s*HALL.colX);place(columns,n,x,TOP+HALL.colH/2,Z(z));place(caps,n*2,x,TOP+.25,Z(z),1.3,.5,1.3);place(caps,n*2+1,x,TOP+HALL.colH-.25,Z(z),1.4,.5,1.4);block(x,Z(z),1.3,1.3)}});
      const flights=[];for(const s of [-1,1])for(const stack of STACKS)for(let k=0;k<HALL.tiers;k++)flights.push({s,...flightOf(stack,k)});
      const steps=new THREE.InstancedMesh(own(new THREE.BoxGeometry(1,1,1)),blocks,flights.length*(STEPS+1));
      flights.forEach((f,n)=>{const x=X(f.s*(face(f.k)-STAIR_W/2)),base=f.k*HALL.rise;for(let i=0;i<STEPS;i++){const h=(i+1)*STEP_RISE;place(steps,n*(STEPS+1)+i,x,base+h/2,Z(f.start+f.dir*(i+.5)*STEP_RUN),STAIR_W,h,STEP_RUN)}
        place(steps,n*(STEPS+1)+STEPS,x,base+HALL.rise/2,Z(f.start+f.dir*(FLIGHT+LANDING/2)),STAIR_W,HALL.rise,LANDING)});
      for(const m of [columns,caps,steps]){m.position.set(0,0,0);m.frustumCulled=false;m.raycast=()=>{};root.add(m)}
      // The vault, in two halves either side of the skylight, and the sky in the opening.
      const arc=(a0,a1)=>{const n=20,pos=[],uv=[],idx=[];for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n,x=cx+Math.cos(a)*R,y=SPRING+Math.sin(a)*R;pos.push(x,y,cz-L/2,x,y,cz+L/2);uv.push(a*R/2.6,0,a*R/2.6,L/2.6);if(i<n){const p=i*2;idx.push(p,p+1,p+2,p+1,p+3,p+2)}}
        const g=own(new THREE.BufferGeometry());g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);return g};
      const coffers=basic({map:t.coffer,side:THREE.DoubleSide});for(const [a0,a1] of [[0,Math.PI/2-GAP],[Math.PI/2+GAP,Math.PI]]){const half=add(arc(a0,a1),coffers,0,0,0);half.frustumCulled=false;half.raycast=()=>{}}
      const sky=flat(2*R*Math.sin(GAP)+.6,L,basic({map:t.sky,fog:false,side:THREE.DoubleSide}),cx,SPRING+R*Math.cos(GAP)+.1,cz);sky.raycast=()=>{};
      // Light coming down through it: a few faint sheets, across the hall and along it.
      const beam=basic({map:t.shaft,transparent:true,opacity:.11,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false}),high=SPRING+R*Math.cos(GAP);
      for(const z of [-30,-6,18]){const m=add(own(new THREE.PlaneGeometry(12,high)),beam,cx,high/2,Z(z));m.raycast=()=>{};m.renderOrder=5}
      for(const [x,tilt] of [[-2.2,.09],[2.2,-.09]]){const m=add(own(new THREE.PlaneGeometry(L-8,high)),beam,X(x),high/2,cz);m.rotation.y=Math.PI/2;m.rotation.z=tilt;m.raycast=()=>{};m.renderOrder=5}
      // The end walls.
      add(own(new THREE.PlaneGeometry(49,49)),basic({map:t.north}),cx,23.5,Z(-L/2));add(own(new THREE.PlaneGeometry(49,49)),basic({map:t.south}),cx,23.5,Z(L/2)).rotation.y=Math.PI;
      // Readers and attendants, as he drew them: in antique dress, and very small. Two InstancedMeshes; each is in the way.
      const people=[];for(let i=0;i<14;i++){const lx=(r()<.5?-1:1)*(1.6+r()*4.2),lz=-42+r()*76;people.push([lx,0,lz])}
      for(const s of [-1,1])for(let k=1;k<=HALL.tiers;k++)for(let i=0;i<4;i++){const top=k===HALL.tiers,lz=top?-24+i*16:-26+r()*52,ax=top?HALL.colX:face(k)-.6;people.push([s*ax,k*HALL.rise,lz])}// on the top terrace they stand between the columns, out of the walk
      const robes=new THREE.InstancedMesh(own(new THREE.CylinderGeometry(.15,.3,1.45,10)),basic({color:0xffffff}),people.length),heads=new THREE.InstancedMesh(own(new THREE.SphereGeometry(.13,10,8)),basic({color:0xc9a98a}),people.length);
      const dress=[0xe9e2cf,0xd9cdb0,0x9b6f5c,0x7b8795,0xb9a274,0xefe9da,0xdcd3bd],tint=new THREE.Color();
      people.forEach(([lx,y,lz],i)=>{place(robes,i,X(lx),y+.725,Z(lz));place(heads,i,X(lx),y+1.58,Z(lz));tint.set?.(dress[r()*dress.length|0]);robes.setColorAt?.(i,tint);block(X(lx),Z(lz),.7,.7)});
      for(const m of [robes,heads]){m.frustumCulled=false;m.raycast=()=>{};root.add(m)}
      // A stone book stand: a block with a sloped top, turned to face a reader on the open side.
      const plinth=own(new THREE.BoxGeometry(.6,1.02,.46)),desk=own(new THREE.BoxGeometry(.72,.06,.6)),cover=own(new THREE.BoxGeometry(.62,.86,.09));
      const stand=(lx,level,lz,yaw)=>{const g=new THREE.Group();g.position.set(X(lx),level*HALL.rise,Z(lz));g.rotation.y=yaw;root.add(g);add(plinth,blocks,0,.51,0,g);add(desk,blocks,0,1.1,.02,g).rotation.x=.42;block(X(lx),Z(lz),.8,.8);return g};
      const shelve=(g,book)=>{const bm=add(cover,own(bookMaterial(book)),0,1.42,.2,g);bm.rotation.x=-.38;bm.userData={type:'book',book,loaded:false,boullee:true,home:{position:bm.position.clone(),quaternion:bm.quaternion.clone(),parent:g}};interactables.push(bm);ours.push(bm);books.push(bm);return bm};
      for(const [id,s,level,lz] of OWN){const book=findBook(id);if(!book)continue;const lx=level?s*(face(level-1)+.75):s*5.6;shelve(stand(lx,level,lz,(level?s:-s)*Math.PI/2),book)}
      // The secret's stand, at the north end of the east top terrace, looking down on the floor.
      const last=stand(HALL.colX,HALL.tiers,-40,-Math.PI/2);state={stand:last,looked:0};mark(last.children[0],card('stand'));mark(last.children[1],card('stand'));if(found)reveal(false);
      // Cards on brass plates; the frame back to the corridor; a bench at the north end.
      const brass=MAT.brass||basic({color:0xb08d3a}),plate=(key,lx,y,lz,yaw)=>{const p=add(own(new THREE.BoxGeometry(.9,.5,.05)),brass,X(lx),y,Z(lz));p.rotation.y=yaw;return mark(p,card(key))};
      const about=stand(-2.6,0,40.5,0);mark(about.children[0],card('about'));mark(about.children[1],card('about'));
      plate('hands',face(1)-.04,HALL.rise+1.6,10,-Math.PI/2);plate('hands',-(face(1)-.04),HALL.rise+1.6,-10,Math.PI/2);
      plate('colonnade',HALL.wallX-.05,TOP+1.6,0,-Math.PI/2);plate('colonnade',-(HALL.wallX-.05),TOP+1.6,0,Math.PI/2);
      const frame=new THREE.Group();frame.position.set(cx,0,Z(L/2-2.4));root.add(frame);const out={...card('frame'),type:'boullee-out',action:'STEP BACK'};
      mark(add(own(new THREE.BoxGeometry(2.5,3.5,.16)),brass,0,1.9,0,frame),out);mark(add(own(new THREE.PlaneGeometry(2.2,3.2)),basic({map:t.frame}),0,1.9,-.09,frame),out).rotation.y=Math.PI;block(cx,Z(L/2-2.4),2.7,.5);
      const bench=new THREE.Group();bench.position.set(cx,0,Z(-L/2+3));root.add(bench);const seat=add(own(new THREE.BoxGeometry(2.6,.46,.7)),blocks,0,.23,0,bench);block(cx,Z(-L/2+3),2.8,.9);
      registerSeat?.([seat],bench,new THREE.Vector3(0,1.15,0),Math.PI,{title:'A stone bench',author:'Sit at the north end with the whole length of the hall before you, and read one of its books.',bookIds:()=>books.map(b=>b.userData.book.id)});
      scene.add(root);
    }
    function reveal(announce=true){if(!state||state.revealed)return;const book=findBook(SECRET);state.revealed=true;if(!book)return;
      const bm=new THREE.Mesh(own(new THREE.BoxGeometry(.62,.86,.09)),own(bookMaterial(book)));bm.position.set(0,1.42,.2);bm.rotation.x=-.38;state.stand.add(bm);
      bm.userData={type:'book',book,loaded:false,boullee:true,home:{position:bm.position.clone(),quaternion:bm.quaternion.clone(),parent:state.stand}};interactables.push(bm);ours.push(bm);books.push(bm);
      if(announce){playSample?.('pageTurn',.5,.8);showNotice(`From up here the brass letters in the floor can be read at last: ${PAVEMENT}. And on the stand at the north end of this terrace there is a book that was not there before: the catalogue of Dr John Dee’s library at Mortlake, which was plundered while he was abroad. The catalogue outlasted the library.`,14)}}
    function unload(){if(!root)return;root.removeFromParent();root=null;state=null;
      for(let i=interactables.length-1;i>=0;i--)if(ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of owned.splice(0))thing.dispose?.();ours.length=0;books.length=0;blockers.length=0}

    // ---------- coming and going ----------
    function enter(){build();lastNeeded=time;move(cx,cz+L/2-6,0);playSample?.('pageTurn',.4,.7);
      showNotice('You step up into the drawing, and through it. Daylight, falling from an opening in a vault higher than seems possible; books in tiers up both sides like the seats of an amphitheatre; small figures in antique dress. The library that was never built. There are stairs at both ends of each side.',12);
      analytics?.track('Room Explored',{room:'boullee-library'})}
    function leave(){const p=PICTURE&&corridor?.standBefore?.(PICTURE,2);if(!p)return;move(p.x,p.z,p.yaw);showNotice('The Long Corridor again, and the drawing back in its frame.',4)}
    function interact(object){const d=object?.userData;if(!d||typeof d.type!=='string'||!d.type.startsWith('boullee-'))return false;
      if(d.type==='boullee-picture'){enter();return true}
      if(d.type==='boullee-out'){leave();return true}
      if(d.type==='boullee-card'){showNotice(`${d.title}: ${d.author}`,d.author.length>220?16:d.author.length>120?11:8);return true}
      return false}
    function update(t,dt=0){time=t;const inside=contains(player.pos.x,player.pos.z);if(inside)lastNeeded=t;if(!root)return;
      if(!inside){if(t-lastNeeded>KEEP&&!isHolding()&&!books.some(b=>b.parent!==b.userData.home.parent))unload();return}
      // Daylight: a pale haze instead of the library's night.
      scene.background?.setRGB?.(.8,.76,.68);if(scene.fog){scene.fog.color?.setRGB?.(.8,.76,.68);scene.fog.density=.0075}
      // The secret: from the top terrace's edge, looking down at the floor for a moment.
      if(!found&&state){const lx=player.pos.x-cx,up=heightAt(lx,player.pos.z-cz)>=TOP-.01&&Math.abs(lx)<HALL.colX-.6&&(player.pitch||0)<-.3;state.looked=up?state.looked+dt:0;
        if(state.looked>1.2){found=true;put('athenaeum-boullee-pavement','1');reveal()}}}
    hangPicture();
    return {contains,floorAt,allowed,interact,update,enter,leave,unload,activate:build,zoneAt:(x,z)=>contains(x,z)?'boullee-library':null,heightAt,
      hall:HALL,top:TOP,own:OWN,secret:SECRET,cards:CARDS,pavement:PAVEMENT,picture:PICTURE,stacks:STACKS,flight:{steps:STEPS,rise:STEP_RISE,run:STEP_RUN,landing:LANDING,width:STAIR_W},face,
      get built(){return !!root},get found(){return found},get books(){return books.slice()}};
  };
})();
