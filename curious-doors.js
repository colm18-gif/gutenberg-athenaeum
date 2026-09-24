// Curious doors: four new thresholds in the Grand Hall, each with its own mechanism, each
// opening onto a small themed room built on demand in otherwise empty space.
//   - a round clockwork door that must be wound       → The Horologist's Study
//   - a stained-glass lancet door, faintly green-lit   → The Night Conservatory
//   - a bookcase near the hearth with one volume proud  → The Ghost-Story Parlour (secret)
//   - a small painted nursery door that wants a knock   → The Children's Attic
(function(){
  'use strict';

  window.createCuriousDoors=function(options){
    const {THREE,scene,MAT,player,camera,interactables,books,bookMaterial,canvasTexture,showNotice,playSample,sound,move,registerSeat,doorKit,isLowBandwidth=()=>false,isReducedMotion=()=>false,analytics}=options;
    const KEEP_WARM_SECONDS=25,PRELOAD_DISTANCE=9,TAU=Math.PI*2;
    const rooms={
      horologist:{key:'horologist',cx:-240,cz:-60,w:18,d:14,h:5.4,title:'The Horologist’s Study',door:{x:-18.72,z:22.9,yaw:Math.PI/2}},
      conservatory:{key:'conservatory',cx:-240,cz:-20,w:20,d:16,h:6.4,title:'The Night Conservatory',door:{x:18.72,z:-28,yaw:-Math.PI/2}},
      parlour:{key:'parlour',cx:-240,cz:20,w:16,d:13,h:4.8,title:'The Ghost-Story Parlour',door:{x:-18.72,z:-28,yaw:Math.PI/2}},
      attic:{key:'attic',cx:-240,cz:60,w:16,d:13,h:4.6,title:'The Children’s Attic',door:{x:18.72,z:-13.5,yaw:-Math.PI/2}}
    };
    const blockers=[],animated=[],doors={};let time=0;
    const store={get:key=>{try{return localStorage.getItem(key)}catch(e){return null}},set:(key,value)=>{try{localStorage.setItem(key,value)}catch(e){}}};

    // ---------- small builders ----------
    const add=(geometry,material,x,y,z,parent)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=m.receiveShadow=false;parent.add(m);return m};
    const box=(w,h,d,material,x,y,z,parent)=>add(new THREE.BoxGeometry(w,h,d),material,x,y,z,parent);
    const cyl=(rt,rb,h,seg,material,x,y,z,parent)=>add(new THREE.CylinderGeometry(rt,rb,h,seg),material,x,y,z,parent);
    const sphere=(r,material,x,y,z,parent,seg=16)=>add(new THREE.SphereGeometry(r,seg,Math.max(8,seg>>1)),material,x,y,z,parent);
    const mark=(object,data)=>{object.userData=data;interactables.push(object);return object};
    const detail=(object,title,author,action='EXAMINE')=>mark(object,{type:'curious-detail',title,author,action});
    const block=(room,x,z,w,d)=>blockers.push({room:room.key,minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2});
    const std=(color,extra={})=>new THREE.MeshStandardMaterial(Object.assign({color,roughness:.8},extra));
    const glow=(color,intensity=1.6)=>new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:intensity,roughness:.6});
    function light(parent,color,intensity,distance,x,y,z){const l=new THREE.PointLight(color,intensity,distance,2);l.position.set(x,y,z);l.castShadow=false;parent.add(l);return l}
    function plaqueTexture(title,subtitle,{bg='#1f1510',ink='#e5c98f',rule='#b88a4e'}={}){return canvasTexture((c,w,h)=>{c.fillStyle=bg;c.fillRect(0,0,w,h);c.strokeStyle=rule;c.lineWidth=6;c.strokeRect(9,9,w-18,h-18);c.fillStyle=ink;c.textAlign='center';c.font='bold 36px Georgia';c.fillText(title,w/2,h*.47);if(subtitle){c.font='italic 21px Georgia';c.fillText(subtitle,w/2,h*.78)}},640,120)}
    function plaque(parent,title,subtitle,x,y,z,width=2.4,rotY=0,colors){const m=add(new THREE.PlaneGeometry(width,width*120/640),new THREE.MeshStandardMaterial({map:plaqueTexture(title,subtitle,colors),roughness:.8}),x,y,z,parent);m.rotation.y=rotY;return m}
    function clockFaceTexture(roman=true,tint='#efe2c0'){return canvasTexture((c,w,h)=>{const r=w/2;c.fillStyle=tint;c.beginPath();c.arc(r,r,r-2,0,TAU);c.fill();c.strokeStyle='#5b4526';c.lineWidth=w*.03;c.beginPath();c.arc(r,r,r*.93,0,TAU);c.stroke();c.fillStyle='#2b2016';c.textAlign='center';c.textBaseline='middle';c.font=`${w*.1}px Georgia`;const numerals=roman?['XII','I','II','III','IIII','V','VI','VII','VIII','IX','X','XI']:['12','1','2','3','4','5','6','7','8','9','10','11'];numerals.forEach((n,i)=>{const a=i/12*TAU-Math.PI/2;c.fillText(n,r+Math.cos(a)*r*.74,r+Math.sin(a)*r*.74)});for(let i=0;i<60;i++){const a=i/60*TAU;c.fillRect(r+Math.cos(a)*r*.86-1,r+Math.sin(a)*r*.86-1,i%5?2:5,i%5?2:5)}},256,256)}
    // A clock face with two hands on a pivot; returns the hands so they can be animated.
    function clock(parent,radius,x,y,z,rotY=0,roman=true,tint){const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=rotY;parent.add(g);const rim=add(new THREE.TorusGeometry(radius,radius*.08,8,28),MAT.brass,0,0,0,g);const face=add(new THREE.CircleGeometry(radius,28),new THREE.MeshStandardMaterial({map:clockFaceTexture(roman,tint),roughness:.7}),0,0,.01,g);const hour=new THREE.Group(),minute=new THREE.Group();hour.position.z=minute.position.z=.03;g.add(hour,minute);box(radius*.07,radius*.52,.015,MAT.black,0,radius*.24,0,hour);box(radius*.045,radius*.8,.015,MAT.black,0,radius*.38,.01,minute);sphere(radius*.06,MAT.brass,0,0,.05,g,8);return {group:g,hour,minute,face,rim}}
    function gear(parent,radius,teeth,material,x,y,z){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);const disc=add(new THREE.CylinderGeometry(radius,radius,.08,Math.max(12,teeth)),material,0,0,0,g);disc.rotation.x=Math.PI/2;const toothGeometry=new THREE.BoxGeometry(radius*.22,radius*.22,.08);for(let i=0;i<teeth;i++){const a=i/teeth*TAU,t=add(toothGeometry,material,Math.cos(a)*radius,Math.sin(a)*radius,0,g);t.rotation.z=a}const hub=add(new THREE.CylinderGeometry(radius*.25,radius*.25,.14,10),MAT.darkWood,0,0,0,g);hub.rotation.x=Math.PI/2;return g}

    // Face-out display of a room's books on a ledge: covers visible, each one a real, readable volume.
    const displayGeometry=new THREE.BoxGeometry(.72,1.02,.12);
    function displayBooks(room,parent,x0,y,z,spacing=.95,rotY=0){
      const list=books.filter(book=>book.room===room.key);
      list.forEach((book,i)=>{const mesh=add(displayGeometry,bookMaterial(book),x0+i*spacing,y,z,parent);mesh.rotation.order='YXZ';mesh.rotation.y=rotY;mesh.rotation.x=-.12;mesh.rotation.z=Math.sin(book.id)*.03;mesh.userData={type:'book',book,loaded:false,home:{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),parent}};interactables.push(mesh)});
      return list.length;
    }
    function armchair(room,parent,x,z,yaw,fabric,title,author){
      const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=yaw;parent.add(g);
      const seat=box(1.2,.42,1.1,fabric,0,.52,0,g),back=box(1.2,1.25,.26,fabric,0,1.2,-.46,g),arms=[box(.22,.62,1.1,fabric,-.62,.78,0,g),box(.22,.62,1.1,fabric,.62,.78,0,g)];
      for(const [lx,lz] of [[-.5,-.45],[.5,-.45],[-.5,.45],[.5,.45]])box(.1,.32,.1,MAT.darkWood,lx,.16,lz,g);
      registerSeat?.([seat,back,...arms],g,new THREE.Vector3(0,1.45,.05),yaw+Math.PI,{title,author});
      const s=Math.abs(Math.sin(yaw)),c=Math.abs(Math.cos(yaw));block(room,x,z,1.5*c+1.3*s,1.3*c+1.5*s);return g;
    }

    // ---------- room shell ----------
    function shell(room,{floor,wall,ceiling,exitTitle,exitAuthor,trim=MAT.darkWood}){
      const r=room.root,{cx,cz,w,d,h}=room;
      box(w,.3,d,floor,cx,-.15,cz,r);
      box(w,h,.3,wall,cx,h/2,cz-d/2,r);box(.3,h,d,wall,cx-w/2,h/2,cz,r);box(.3,h,d,wall,cx+w/2,h/2,cz,r);box(w,h,.3,wall,cx,h/2,cz+d/2,r);
      if(ceiling)box(w,.25,d,ceiling,cx,h+.12,cz,r);
      // Skirting and a picture rail give every room the same joinery as the Grand Hall.
      for(const [x,z,sw,sd] of [[cx,cz-d/2+.17,w-.4,.05],[cx,cz+d/2-.17,w-.4,.05],[cx-w/2+.17,cz,.05,d-.4],[cx+w/2-.17,cz,.05,d-.4]]){box(sw,.22,sd,trim,x,.11,z,r)}
      const exitData={type:'curious-exit',room:room.key,title:exitTitle||'Back to the Grand Hall',author:exitAuthor||'The door remembers which way the lamps are.',action:'RETURN'};
      const exit=mark(box(1.9,3.1,.16,MAT.darkWood,cx,1.55,cz+d/2-.2,r),exitData);
      for(const px of [-1.05,1.05])box(.16,3.35,.24,MAT.brass,cx+px,1.68,cz+d/2-.22,r);box(2.3,.16,.24,MAT.brass,cx,3.3,cz+d/2-.22,r);
      const knob=sphere(.08,MAT.brass,cx+.65,1.45,cz+d/2-.32,r,10);knob.userData=exitData;interactables.push(knob);
      return exit;
    }

    // ---------- 1. The Horologist's Study ----------
    function buildHorologist(room){
      const r=room.root,{cx,cz,w,d,h}=room,walnut=std(0x2d1c12,{roughness:.62}),panel=std(0x3a2618,{roughness:.7});
      shell(room,{floor:MAT.wood,wall:walnut,ceiling:std(0x1d140e),exitTitle:'The door back to the hall',exitAuthor:'Its clock insists you have been gone no time at all.'});
      plaque(r,'THE HOROLOGIST’S STUDY','time, other dimensions, and the long sleep',cx,4.3,cz-d/2+.17,4.2);
      // Wall of clocks, each keeping a different, private hour. Two run backwards.
      const specs=[[-6.5,3,.7,1],[-4.2,3.6,.45,-1.6],[-2.2,2.9,.55,2.4],[2.2,2.9,.55,.7],[4.2,3.6,.45,-3],[6.5,3,.7,1.3],[-7.4,1.9,.35,5]];
      for(const [dx,y,radius,speed] of specs){const c=clock(r,radius,cx+dx,y,cz-d/2+.2,0,speed>0,speed<0?'#d9ccb0':'#efe2c0');animated.push({kind:'clock',room,hands:c,speed,phase:dx})}
      // Long display shelf for the room's books under the clocks.
      box(12.4,.12,.62,MAT.darkWood,cx,1.18,cz-d/2+.5,r);box(12.4,.06,.12,MAT.brass,cx,1.26,cz-d/2+.78,r);block(room,cx,cz-d/2+.5,12.6,.9);
      const count=displayBooks(room,r,cx-(books.filter(b=>b.room===room.key).length-1)*1.1/2,1.75,cz-d/2+.5,1.1);
      // Grandfather clock with a real swinging pendulum.
      const gx=cx+w/2-1.1,gz=cz-d/2+1.1;box(1.05,4.1,.7,panel,gx,2.05,gz,r);const gc=clock(r,.38,gx-.53,3.4,gz,-Math.PI/2);animated.push({kind:'clock',room,hands:gc,speed:.5,phase:0});
      const pendulum=new THREE.Group();pendulum.position.set(gx-.37,2.95,gz);r.add(pendulum);box(.03,1.3,.03,MAT.brass,0,-.65,0,pendulum);const bob=cyl(.16,.16,.04,16,MAT.gold||MAT.brass,0,-1.32,0,pendulum);bob.rotation.z=Math.PI/2;animated.push({kind:'pendulum',room,object:pendulum,phase:0});
      box(.02,1.7,.5,new THREE.MeshPhysicalMaterial({color:0x9fb0b4,transparent:true,opacity:.18,roughness:.05}),gx-.54,2.2,gz,r);block(room,gx,gz,1.3,1);
      detail(box(1.05,4.1,.72,new THREE.MeshBasicMaterial({visible:false}),gx,2.05,gz,r),'A long-case clock','Its pendulum keeps perfect time for a day that has not happened yet.');
      // The orrery: brass planets turning about a lamp-bright sun.
      const tx=cx,tz=cz+.4;cyl(1.2,1.25,.1,24,MAT.darkWood,tx,1.02,tz,r);cyl(.22,.34,1,12,MAT.darkWood,tx,.5,tz,r);block(room,tx,tz,2.7,2.7);
      const sun=sphere(.24,glow(0xffc46b,2.2),tx,1.62,tz,r);detail(sun,'An orrery','The planets keep their courses. One tiny moon is labelled, in ink, “the Library”.');cyl(.03,.03,.5,6,MAT.brass,tx,1.3,tz,r);
      const planets=[[.55,.07,0x9a8f84,1.6],[.8,.1,0xc9a36b,1.1],[1.05,.11,0x4c7aa6,.8],[1.3,.09,0xb25d3d,.55]].map(([radius,size,color,speed],i)=>{const arm=new THREE.Group();arm.position.set(tx,1.62,tz);r.add(arm);box(radius,.015,.015,MAT.brass,radius/2,0,0,arm);sphere(size,std(color,{metalness:.3,roughness:.45}),radius,0,0,arm,12);arm.rotation.y=i*1.7;return {arm,speed}});
      animated.push({kind:'orrery',room,planets});
      light(r,0xffc27a,7,9,tx,2.2,tz);light(r,0xffb865,5,10,cx-5,3.8,cz-2);
      // Workbench of loose gears.
      const bx=cx-w/2+1.1;box(1.1,1,3,panel,bx,.5,cz+1,r);block(room,bx,cz+1,1.3,3.2);for(let i=0;i<5;i++){const g=gear(r,.12+i%3*.07,10+i*2,MAT.brass,bx+(i%2?.15:-.2),1.06,cz-.2+i*.55);g.rotation.x=-Math.PI/2;animated.push({kind:'spin',room,object:g,speed:(i%2?1:-1)*(.3+i*.1),axis:'z'})}
      detail(box(1.1,.05,3,new THREE.MeshBasicMaterial({visible:false}),bx,1.05,cz+1,r),'A horologist’s bench','Escapements, a jeweller’s loupe, and a gear with a tooth missing for every year it has been lost.');
      armchair(room,r,cx+4.2,cz+2.6,Math.PI+.35,std(0x5a2a22,{roughness:.9}),'A wing chair by the orrery','Sit and read while the little planets go round.');
      return count;
    }

    // ---------- 2. The Night Conservatory ----------
    function buildConservatory(room){
      const r=room.root,{cx,cz,w,d,h}=room,iron=std(0x1a2320,{metalness:.55,roughness:.5}),glass=new THREE.MeshPhysicalMaterial({color:0x6f93a0,transparent:true,opacity:.16,roughness:.08,metalness:0,depthWrite:false});
      box(w,.3,d,MAT.stone,cx,-.15,cz,r);
      // Glass walls and a pitched glass roof on iron ribs, with the night sky beyond.
      for(const [x,z,gw,gd] of [[cx,cz-d/2,w,.06],[cx-w/2,cz,.06,d],[cx+w/2,cz,.06,d]])box(gw,h,gd,glass,x,h/2,z,r);
      box(w,h,.3,std(0x243029),cx,h/2,cz+d/2,r);
      for(let i=0;i<=10;i++){const x=cx-w/2+i*w/10;box(.12,h,.12,iron,x,h/2,cz-d/2,r)}for(let i=0;i<=8;i++){const z=cz-d/2+i*d/8;box(.12,h,.12,iron,cx-w/2,h/2,z,r);box(.12,h,.12,iron,cx+w/2,h/2,z,r)}
      for(const side of [-1,1]){const roof=box(w,.05,d*.56,glass,cx,h+1.1,cz+side*d*.24,r);roof.rotation.x=side*.28;for(let i=0;i<=10;i++){const rib=box(.1,.1,d*.56,iron,cx-w/2+i*w/10,h+1.1,cz+side*d*.24,r);rib.rotation.x=side*.28}}
      box(w,.1,.1,iron,cx,h+2.25,cz,r);
      const sky=add(new THREE.SphereGeometry(30,24,12),new THREE.MeshBasicMaterial({color:0x07101d,side:THREE.BackSide,fog:false}),cx,0,cz,r);sky.renderOrder=-1;
      sphere(1.3,new THREE.MeshBasicMaterial({color:0xe9efe4,fog:false}),cx+9,17,cz-17,r);
      const starGeo=new THREE.BufferGeometry(),starPos=new Float32Array(300*3);for(let i=0;i<300;i++){const a=Math.random()*TAU,e=.15+Math.random()*1.2;starPos.set([cx+Math.cos(a)*27*Math.cos(e),Math.sin(e)*27,cz+Math.sin(a)*27*Math.cos(e)],i*3)}starGeo.setAttribute('position',new THREE.BufferAttribute(starPos,3));r.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xdfe8ff,size:.25,fog:false})));
      const moonLight=new THREE.DirectionalLight(0x9fb8e0,1.4);moonLight.position.set(cx+9,17,cz-17);moonLight.target.position.set(cx,0,cz);r.add(moonLight,moonLight.target);
      shell(room,{floor:MAT.stone,wall:new THREE.MeshBasicMaterial({visible:false}),exitTitle:'The garden door',exitAuthor:'Beyond it, the Grand Hall smells faintly of paper again.',trim:iron});
      plaque(r,'THE NIGHT CONSERVATORY','gardens, green things, and what grows in the dark',cx,4.1,cz+d/2-.18,4.4,Math.PI,{bg:'#12211a',ink:'#cfe3bd',rule:'#6f8f5a'});
      // Fountain at the centre, water rippling.
      const fx=cx,fz=cz-1;cyl(1.9,2.1,.6,32,MAT.stone,fx,.3,fz,r);const water=add(new THREE.CircleGeometry(1.75,32),new THREE.MeshStandardMaterial({color:0x1d3b44,emissive:0x0d2a33,emissiveIntensity:.6,metalness:.2,roughness:.08}),fx,.58,fz,r);water.rotation.x=-Math.PI/2;cyl(.18,.28,1.5,12,MAT.stone,fx,1.2,fz,r);const basin=cyl(.7,.35,.25,20,MAT.stone,fx,1.95,fz,r);
      const jet=cyl(.03,.05,.6,6,new THREE.MeshStandardMaterial({color:0xa9d4e0,transparent:true,opacity:.55,emissive:0x2a5561,emissiveIntensity:.5}),fx,2.35,fz,r);animated.push({kind:'water',room,water,jet});block(room,fx,fz,4.4,4.4);
      detail(basin,'A moonlit fountain','Someone has dropped a bookmark into the water. The ink has not run.');
      // Planters of ferns, palms and night-flowering vines.
      const leaf=std(0x2f5a31,{roughness:.75,side:THREE.DoubleSide}),leafDark=std(0x1e3f24,{roughness:.8,side:THREE.DoubleSide}),blossom=glow(0xf2f0d8,.9),pot=std(0x7a4a33,{roughness:.9});
      const plant=(x,z,scale=1,flowers=false)=>{cyl(.45*scale,.35*scale,.7*scale,14,pot,x,.35*scale,z,r);for(let i=0;i<7;i++){const a=i/7*TAU,frond=add(new THREE.ConeGeometry(.16*scale,1.4*scale,5),i%2?leaf:leafDark,x+Math.cos(a)*.35*scale,1.1*scale,z+Math.sin(a)*.35*scale,r);frond.rotation.z=Math.cos(a)*.9;frond.rotation.x=-Math.sin(a)*.9;animated.push({kind:'sway',room,object:frond,base:frond.rotation.z,phase:x+z+i})}if(flowers)for(let i=0;i<5;i++)sphere(.07*scale,blossom,x+Math.cos(i*1.3)*.5*scale,1.55*scale+i%2*.2,z+Math.sin(i*1.3)*.5*scale,r,8);block(room,x,z,1*scale,1*scale)};
      for(const [x,z,s,f] of [[-8,-6,1.2,true],[-8,4,1,false],[8,-6,1.3,false],[8,4,1.1,true],[-4.5,-6.5,.8,true],[4.5,-6.5,.9,false],[-8.5,-1,.8,true],[8.5,-1,.85,true]])plant(cx+x,cz+z,s,f);
      const palm=(x,z)=>{cyl(.13,.2,3.4,8,std(0x5b4631),x,1.7,z,r);for(let i=0;i<8;i++){const a=i/8*TAU,f=add(new THREE.ConeGeometry(.25,2.2,4),leaf,x+Math.cos(a)*.8,3.3,z+Math.sin(a)*.8,r);f.rotation.z=Math.cos(a)*1.25;f.rotation.x=-Math.sin(a)*1.25;animated.push({kind:'sway',room,object:f,base:f.rotation.z,phase:i})}block(room,x,z,.6,.6)};palm(cx-6,cz+5.2);palm(cx+6,cz+5.2);
      // Fireflies drift between the leaves.
      const count=60,flyGeo=new THREE.BufferGeometry(),flyPos=new Float32Array(count*3),seeds=[];for(let i=0;i<count;i++){seeds.push([Math.random()*TAU,Math.random()*TAU,.5+Math.random()]);flyPos.set([cx,1,cz],i*3)}flyGeo.setAttribute('position',new THREE.BufferAttribute(flyPos,3));const flies=new THREE.Points(flyGeo,new THREE.PointsMaterial({color:0xd8ff8a,size:.09,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false}));r.add(flies);animated.push({kind:'fireflies',room,points:flies,seeds});
      // Potting bench display of the room's books, and an iron bench to read on.
      box(9,.1,.8,std(0x4a3a2a),cx,1.02,cz-d/2+.8,r);for(const x of [-4.2,0,4.2])box(.1,1,.7,iron,cx+x,.5,cz-d/2+.8,r);block(room,cx,cz-d/2+.8,9.2,1);
      const n=books.filter(b=>b.room===room.key).length,shown=displayBooks(room,r,cx-(n-1)*1.3/2,1.6,cz-d/2+.8,1.3);
      const benchG=new THREE.Group();benchG.position.set(cx+3.2,0,cz+3.4);benchG.rotation.y=Math.PI;r.add(benchG);const seat=box(2.2,.1,.7,iron,0,.55,0,benchG),back=box(2.2,.7,.08,iron,0,1,-.33,benchG);for(const x of [-1,1])box(.08,.55,.6,iron,x,.27,0,benchG);registerSeat?.([seat,back],benchG,new THREE.Vector3(0,1.4,.1),0,{title:'A wrought-iron garden bench',author:'Cold at first, then pleasant. Sit and read by moonlight.'});block(room,cx+3.2,cz+3.4,2.4,.9);
      light(r,0xcfe6c0,6,12,cx,3.6,cz-1);light(r,0xffcf8a,4,9,cx,2.4,cz-d/2+1.8);
      return shown;
    }

    // ---------- 3. The Ghost-Story Parlour ----------
    function buildParlour(room){
      const r=room.root,{cx,cz,w,d,h}=room;
      const damask=canvasTexture((c,cw,ch)=>{c.fillStyle='#2a1a1f';c.fillRect(0,0,cw,ch);c.fillStyle='rgba(120,78,70,.35)';for(let y=0;y<4;y++)for(let x=0;x<4;x++){const px=x*64+(y%2)*32,py=y*64;c.beginPath();c.ellipse(px+32,py+32,14,24,0,0,TAU);c.fill();c.beginPath();c.moveTo(px+32,py+2);c.lineTo(px+40,py+32);c.lineTo(px+32,py+62);c.lineTo(px+24,py+32);c.closePath();c.fill()}},256,256);damask.wrapS=damask.wrapT=THREE.RepeatWrapping;damask.repeat.set(5,2);
      shell(room,{floor:MAT.darkWood,wall:new THREE.MeshStandardMaterial({map:damask,roughness:.9}),ceiling:std(0x1a1214),exitTitle:'The back of the bookcase',exitAuthor:'From this side it is simply a door. From the other, it is a shelf of books.'});
      plaque(r,'THE GHOST-STORY PARLOUR','told by the fire, with the lamps turned low',cx-3.8,3.95,cz-d/2+.17,3.6,0,{bg:'#1c1012',ink:'#e2c7b4',rule:'#8a5a4a'});
      // Fireplace with a low, living fire.
      const fx=cx+2.2,fz=cz-d/2+.55;box(3.2,2.3,.8,MAT.stone,fx,1.15,fz,r);box(3.6,.18,1,MAT.darkWood,fx,2.35,fz+.05,r);box(1.9,1.3,.5,MAT.black,fx,.85,fz+.2,r);block(room,fx,fz,3.8,1.4);
      const flameMats=[glow(0xff8a2a,2.4),glow(0xffc25c,2.8)];const flames=[];for(let i=0;i<5;i++){const f=add(new THREE.ConeGeometry(.16+i%2*.06,.55+i%3*.15,8),flameMats[i%2],fx-.5+i*.25,.62,fz+.32,r);flames.push(f)}
      const fire=light(r,0xff8c3c,9,11,fx,1.1,fz+1);animated.push({kind:'fire',room,flames,light:fire});
      const mantelCount=books.filter(b=>b.room===room.key).length,shown=displayBooks(room,r,fx-(mantelCount-1)*.8/2,2.93,fz-.05,.8);
      const rug=add(new THREE.PlaneGeometry(7.5,5.2),new THREE.MeshStandardMaterial({map:canvasTexture((c,cw,ch)=>{c.fillStyle='#4a1a1e';c.fillRect(0,0,cw,ch);c.strokeStyle='#a0713e';c.lineWidth=10;c.strokeRect(14,14,cw-28,ch-28);c.lineWidth=3;c.strokeRect(34,34,cw-68,ch-68);c.fillStyle='#6b2a2c';for(let i=0;i<6;i++){c.beginPath();c.ellipse(cw/2,ch/2,40+i*28,24+i*18,0,0,TAU);c.stroke()}},512,356),roughness:1}),fx,.012,fz+3,r);rug.rotation.x=-Math.PI/2;
      // A tall looking-glass that shows a little more of the room than is there.
      const mirror=add(new THREE.PlaneGeometry(1.2,2.4),new THREE.MeshStandardMaterial({color:0x9aa4a8,metalness:1,roughness:.04}),cx-w/2+.2,1.9,cz-1.5,r);mirror.rotation.y=Math.PI/2;box(.08,2.6,1.4,MAT.gold||MAT.brass,cx-w/2+.17,1.9,cz-1.5,r);detail(mirror,'A tall looking-glass','For a moment the reflection shows an extra chair by the fire. There is no extra chair.');
      // Dust-sheeted furniture, and two chairs drawn up to the hearth.
      const sheet=std(0xcfc8bb,{roughness:1});for(const [x,z,sw,sh,sd] of [[-5,3.5,2.2,1.1,1],[-5.6,-2.4,1.1,1.5,1.1],[5.4,3.7,1.4,.9,1.4]]){const m=box(sw,sh,sd,sheet,cx+x,sh/2,cz+z,r);m.rotation.y=(x+z)*.1;detail(m,'Furniture under a dust sheet','The sheet has settled into the shape of someone sitting very still.');block(room,cx+x,cz+z,sw+.3,sd+.3)}
      armchair(room,r,fx-1.6,fz+2.6,Math.PI*.82,std(0x4a1c20,{roughness:.9}),'A fireside chair','Its cushion is warm, as if someone has only just stood up.');
      armchair(room,r,fx+1.7,fz+2.6,-Math.PI*.82,std(0x2c3a2c,{roughness:.9}),'A second fireside chair','Sit and read. Stories are always better with the chair beside you empty.');
      // Candles that gutter now and then.
      const wax=std(0xe9e0c8),candleFlame=glow(0xffc46b,3);const candles=[];for(const [x,z] of [[-6.8,-5.6],[-6.8,5.6],[6.8,5.6]]){cyl(.06,.06,.4,8,wax,cx+x,1.4,cz+z,r);box(.3,1.2,.3,MAT.darkWood,cx+x,.6,cz+z,r);block(room,cx+x,cz+z,.5,.5);candles.push(add(new THREE.ConeGeometry(.04,.12,6),candleFlame,cx+x,1.66,cz+z,r))}
      animated.push({kind:'candles',room,candles});light(r,0xffb46b,3.5,9,cx-4,2.6,cz);
      return shown;
    }

    // ---------- 4. The Children's Attic ----------
    function buildAttic(room){
      const r=room.root,{cx,cz,w,d,h}=room,boards=std(0x6b4a30,{roughness:.85}),plaster=std(0x8c7a64,{roughness:.95}),beam=std(0x3b2818,{roughness:.8});
      shell(room,{floor:boards,wall:plaster,exitTitle:'The little door',exitAuthor:'Mind your head on the way out.'});
      // Pitched roof on heavy rafters.
      for(const side of [-1,1]){const roof=box(w,.12,d*.62,plaster,cx,h+.9,cz+side*d*.27,r);roof.rotation.x=side*.42}
      for(let i=0;i<7;i++){const x=cx-w/2+1+i*(w-2)/6;for(const side of [-1,1]){const rafter=box(.22,.22,d*.62,beam,x,h+.75,cz+side*d*.27,r);rafter.rotation.x=side*.42}}box(w,.22,.22,beam,cx,h+2.1,cz,r);for(const side of [-1,1])box(.3,2.5,d,plaster,cx+side*w/2,h+1.25,cz,r);
      plaque(r,'THE CHILDREN’S ATTIC','fairy tales, talking animals and toys that become real',cx,3.95,cz+d/2-.18,4.1,Math.PI,{bg:'#1b2440',ink:'#f1dfae',rule:'#c9a45c'});
      // Round window with the moon, and a window seat beneath it full of books.
      const win=add(new THREE.CircleGeometry(1.1,32),new THREE.MeshBasicMaterial({map:canvasTexture((c,cw,ch)=>{const g=c.createLinearGradient(0,0,0,ch);g.addColorStop(0,'#0c1532');g.addColorStop(1,'#1f2f5c');c.fillStyle=g;c.fillRect(0,0,cw,ch);for(let i=0;i<60;i++){c.fillStyle=`rgba(255,250,220,${.4+Math.random()*.6})`;c.fillRect(Math.random()*cw,Math.random()*ch*.8,2,2)}c.fillStyle='#f6efcf';c.beginPath();c.arc(cw*.68,ch*.32,26,0,TAU);c.fill();c.fillStyle='#16224a';c.beginPath();c.arc(cw*.63,ch*.29,24,0,TAU);c.fill()},256,256)}),cx,3.2,cz-d/2+.17,r);
      add(new THREE.TorusGeometry(1.12,.09,8,32),beam,cx,3.2,cz-d/2+.2,r);box(.08,2.2,.06,beam,cx,3.2,cz-d/2+.22,r);box(2.2,.08,.06,beam,cx,3.2,cz-d/2+.22,r);detail(win,'A round attic window','The moon is the kind drawn in picture books: exactly crescent, faintly smiling.','LOOK');
      const seatBase=box(7.2,.55,1.2,std(0x6e3b2e),cx,.28,cz-d/2+.75,r),seatCushion=box(7.2,.18,1.1,std(0x2d4b6e,{roughness:.95}),cx,.64,cz-d/2+.8,r);block(room,cx,cz-d/2+.8,7.4,1.5);
      const n=books.filter(b=>b.room===room.key).length;box(n*.82+.4,.08,.34,beam,cx,1.05,cz-d/2+.3,r);const shown=displayBooks(room,r,cx-(n-1)*.82/2,1.58,cz-d/2+.32,.82);
      const seatGroup=new THREE.Group();seatGroup.position.set(cx,0,cz-d/2+.9);r.add(seatGroup);registerSeat?.([seatBase,seatCushion],seatGroup,new THREE.Vector3(0,1.35,.2),Math.PI,{title:'The window seat',author:'Plump cushions and a view of the moon. Sit and read a story.'});
      // Rocking horse that rocks when you pass.
      const hx=cx-4.8,hz=cz+1.5,horse=new THREE.Group();horse.position.set(hx,0,hz);horse.rotation.y=.6;r.add(horse);const dapple=std(0xe8e0d0,{roughness:.8}),red=std(0x8c2a22);
      const rocker=add(new THREE.TorusGeometry(1.4,.06,6,24,1.3),red,0,1.45,0,horse);rocker.rotation.z=Math.PI+(Math.PI-1.3)/2;rocker.rotation.y=Math.PI/2;box(.5,.5,1.3,dapple,0,1.05,0,horse);box(.36,.6,.36,dapple,0,1.5,.62,horse);box(.3,.3,.55,dapple,0,1.72,.9,horse);box(.08,.5,.3,std(0x3a2418),0,1.7,.5,horse);for(const [x,z] of [[-.2,-.45],[.2,-.45],[-.2,.45],[.2,.45]])box(.1,.6,.1,dapple,x,.62,z,horse);
      detail(box(.6,.9,1.5,new THREE.MeshBasicMaterial({visible:false}),0,1.2,.1,horse),'A dappled rocking horse','Its name, painted under the saddle, is “Dobbin (Real)”.','ROCK');animated.push({kind:'rock',room,object:horse});block(room,hx,hz,1.6,1.6);
      // Alphabet blocks and a doll's house.
      const letters='ABCDEFGH';for(let i=0;i<8;i++){const t=canvasTexture((c,cw,ch)=>{c.fillStyle=['#c0392b','#2e6fa7','#d4a017','#3a8a4f'][i%4];c.fillRect(0,0,cw,ch);c.fillStyle='#fff7e0';c.font='bold 90px Georgia';c.textAlign='center';c.textBaseline='middle';c.fillText(letters[i],cw/2,ch/2+4)},128,128);const b=box(.32,.32,.32,new THREE.MeshStandardMaterial({map:t,roughness:.7}),cx+2.2+(i%4)*.36,.16+Math.floor(i/4)*.32,cz+2.4+(i%2)*.05,r);b.rotation.y=(i*.37)%.6}
      const dh=new THREE.Group();dh.position.set(cx+5.4,0,cz-1.6);r.add(dh);box(1.6,1.3,.9,std(0xc9b089),0,.65,0,dh);const roofL=box(1.7,.08,.62,red,0,1.5,-.2,dh);roofL.rotation.x=.75;const roofR=box(1.7,.08,.62,red,0,1.5,.2,dh);roofR.rotation.x=-.75;for(const [x,y] of [[-.45,.4],[.45,.4],[-.45,.95],[.45,.95]])box(.28,.28,.02,glow(0xffd28a,1.2),x,y,.46,dh);detail(box(1.6,1.7,.9,new THREE.MeshBasicMaterial({visible:false}),0,.85,0,dh),'A doll’s house','A light is on in the smallest bedroom. The dolls downstairs are all facing the stairs.');block(room,cx+5.4,cz-1.6,1.9,1.2);
      // A clockwork train that circles the rug all night.
      const rug=add(new THREE.CircleGeometry(2.3,40),new THREE.MeshStandardMaterial({color:0x6a2f3a,roughness:1}),cx,.012,cz+1.2,r);rug.rotation.x=-Math.PI/2;const track=add(new THREE.TorusGeometry(1.7,.03,6,48),MAT.brass,cx,.03,cz+1.2,r);track.rotation.x=Math.PI/2;
      const train=new THREE.Group();r.add(train);const loco=new THREE.Group();train.add(loco);box(.34,.22,.2,std(0x1f5a3a,{metalness:.3,roughness:.5}),0,.14,0,loco);cyl(.07,.07,.14,8,MAT.black,.1,.3,0,loco);for(let i=1;i<=3;i++){const car=box(.3,.18,.18,std([0x8c2a22,0x2e6fa7,0xd4a017][i-1]),-.4*i,.12,0,train);car.userData.offset=i}animated.push({kind:'train',room,train,cx,cz:cz+1.2});
      detail(box(.4,.3,.3,new THREE.MeshBasicMaterial({visible:false}),0,.15,0,loco),'A clockwork train','Nobody has wound it for years. It goes round anyway.');
      light(r,0xffcf8f,5.5,11,cx,3.4,cz+1);light(r,0xa9b9ff,2.5,8,cx,2.6,cz-d/2+1.5);
      return shown;
    }

    // ---------- the doors in the Grand Hall ----------
    // Each opening shows a lamplit passage through a stencil portal (from the shared door kit), so the wall
    // behind the door never shows through; the moving part is drawn after it.
    const noPortal={set(){}};
    function portal(parent,geometry,z,moving){if(!doorKit)return noPortal;const p=doorKit.makePortal(parent,geometry,z);if(moving)doorKit.drawAfterPortal(moving);return p}
    function doorGroup(room){const g=new THREE.Group();g.position.set(room.door.x,0,room.door.z);g.rotation.y=room.door.yaw;scene.add(g);return g}

    function clockDoor(room){
      const g=doorGroup(room),data={type:'curious-door',room:room.key,title:'A round brass door with a clock for a face',author:'A winding key waits in the keyhole at its centre.',action:'WIND THE KEY'};
      const surround=add(new THREE.TorusGeometry(1.58,.2,10,40),MAT.stone,0,1.72,.05,g);const ring=add(new THREE.TorusGeometry(1.42,.09,8,40),MAT.brass,0,1.72,.16,g);
      const clockOpening=new THREE.CircleGeometry(1.38,40);clockOpening.translate(0,1.72,0);
      const disc=new THREE.Group();disc.position.set(0,1.72,.12);g.add(disc);const slab=add(new THREE.CylinderGeometry(1.38,1.38,.14,40),std(0x3a2616,{roughness:.6}),0,0,0,disc);slab.rotation.x=Math.PI/2;
      const face=clock(disc,1.05,0,0,.09,0,true,'#e8d8b0');const key=box(.08,.34,.05,MAT.brass,0,0,.2,disc);
      for(const m of [slab,face.face,key])mark(m,data);
      const gears=[gear(g,.42,14,MAT.brass,-1.55,3.25,.15),gear(g,.3,11,MAT.brass,-1.12,3.62,.18),gear(g,.36,12,MAT.gold||MAT.brass,1.5,3.3,.15)];
      plaque(g,'THE HOROLOGIST','please wind before entering',0,.2,.25,1.7);
      const glowLight=light(g,0xffc27a,0,6,0,1.7,1);
      doors[room.key]={room,group:g,disc,face,gears,glowLight,state:'closed',t:0,kind:'clock',portal:portal(g,clockOpening,.03,disc)};
    }
    function lancetShape(width,height){const s=new THREE.Shape(),hw=width/2,spring=height-width*.9;s.moveTo(-hw,0);s.lineTo(-hw,spring);s.quadraticCurveTo(-hw,spring+width*.62,0,height);s.quadraticCurveTo(hw,spring+width*.62,hw,spring);s.lineTo(hw,0);s.lineTo(-hw,0);return s}
    function uvFromBounds(geometry){geometry.computeBoundingBox();const b=geometry.boundingBox,p=geometry.attributes.position,uv=geometry.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,(p.getX(i)-b.min.x)/(b.max.x-b.min.x),(p.getY(i)-b.min.y)/(b.max.y-b.min.y));uv.needsUpdate=true;return geometry}
    function glassDoor(room){
      const g=doorGroup(room),data={type:'curious-door',room:room.key,title:'A stained-glass door, green with leaves',author:'The glass is warm. Something beyond it is breathing slowly, like a garden at night.',action:'PUSH THE GLASS'};
      const stained=canvasTexture((c,w,h)=>{c.fillStyle='#0d1f16';c.fillRect(0,0,w,h);const cols=['#2f7a45','#4ea35c','#1f5c3d','#c9a441','#6fb3a3','#8fcf6a'];for(let i=0;i<70;i++){const x=Math.random()*w,y=Math.random()*h,rx=18+Math.random()*30,ry=8+Math.random()*14;c.fillStyle=cols[i%cols.length];c.beginPath();c.ellipse(x,y,rx,ry,Math.random()*Math.PI,0,TAU);c.fill()}c.strokeStyle='#15110c';c.lineWidth=5;for(let i=0;i<70;i++){c.beginPath();c.moveTo(Math.random()*w,Math.random()*h);c.lineTo(Math.random()*w,Math.random()*h);c.stroke()}c.strokeStyle='#e8d38a';c.lineWidth=3;c.beginPath();c.moveTo(w/2,h);for(let y=h;y>h*.12;y-=18)c.lineTo(w/2+Math.sin(y*.05)*18,y);c.stroke();for(let i=0;i<9;i++){const y=h*.2+i*h*.08;c.fillStyle='#c9e39a';c.beginPath();c.ellipse(w/2+(i%2?26:-26),y,22,9,i%2?.5:-.5,0,TAU);c.fill()}},256,512);
      const pivot=new THREE.Group();pivot.position.set(-1.05,0,.1);g.add(pivot);const glassPortal=portal(g,uvFromBounds(new THREE.ShapeGeometry(lancetShape(1.93,3.93),12)),.01,pivot);
      const glassMat=new THREE.MeshStandardMaterial({map:stained,emissive:0xffffff,emissiveMap:stained,emissiveIntensity:.55,roughness:.35,side:THREE.DoubleSide});
      const pane=add(uvFromBounds(new THREE.ShapeGeometry(lancetShape(1.9,3.9),12)),glassMat,1.05,0,.02,pivot);mark(pane,data);
      const frameShape=lancetShape(2.5,4.35);frameShape.holes.push(new THREE.Path(lancetShape(1.95,3.95).getPoints(24)));const frame=add(new THREE.ExtrudeGeometry(frameShape,{depth:.22,bevelEnabled:false,curveSegments:16}),std(0x1a2320,{metalness:.55,roughness:.5}),0,0,-.02,g);
      box(.08,3.2,.05,std(0x1a2320,{metalness:.5}),1.05,1.6,.06,pivot);const handle=sphere(.07,MAT.brass,1.8,1.3,.12,pivot,10);mark(handle,data);
      // Ivy climbing the iron frame.
      const ivy=std(0x24502c,{side:THREE.DoubleSide,roughness:.8});for(let i=0;i<46;i++){const t=i/45,a=t*Math.PI,x=Math.cos(a)*1.3*(t<.5?1:1)*(i%2?1:-1),y=t<.5?t*2*3.1:3.1+Math.sin((t-.5)*Math.PI)*1.1,l=add(new THREE.CircleGeometry(.13,5),ivy,(i%2?1:-1)*(1.28-Math.max(0,t-.6)*1.6)+Math.sin(i)*.08,y+Math.cos(i*2.1)*.12,.24,g);l.rotation.z=i}
      plaque(g,'THE NIGHT CONSERVATORY','',0,4.75,.1,1.9,0,{bg:'#12211a',ink:'#cfe3bd',rule:'#6f8f5a'});
      const glowLight=light(g,0x9fe3a8,2.5,6,0,1.9,.9);
      doors[room.key]={room,group:g,pivot,glassMat,glowLight,state:'closed',t:0,kind:'glass',portal:glassPortal};
    }
    function bookcaseDoor(room){
      const g=doorGroup(room),found=store.get('athenaeum-parlour-found')==='1',caseData={type:'curious-detail',title:'A tall bookcase beside the hearth',author:'One black volume on the middle shelf sits a finger’s width proud of the others.',action:'LOOK CLOSER'};
      const swing=new THREE.Group();swing.position.set(-1.75,0,0);g.add(swing);
      const parts=[box(3.5,4.3,.62,MAT.darkWood,1.75,2.15,.2,swing)];parts[0].material=MAT.darkWood;
      for(const y of [.35,1.2,2.05,2.9,3.75])box(3.3,.08,.5,MAT.wood2,1.75,y,.34,swing);
      const spines=new THREE.InstancedMesh(new THREE.BoxGeometry(.18,.66,.4),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.85}),75),dummy=new THREE.Object3D(),palette=[0x3a1a1a,0x1f2e2a,0x40301c,0x28233a,0x4a2323,0x2b2b2b];let n=0;
      for(let row=0;row<5;row++)for(let slot=0;slot<16;slot++){if(row===2&&slot===8)continue;if(n>=75)break;const h=.52+((row*7+slot*3)%5)*.035;dummy.position.set(.28+slot*.2,[.35,1.2,2.05,2.9,3.75][row]+.04+h/2,.38);dummy.scale.set(1,h/.66,1);dummy.rotation.set(0,0,((slot*5+row)%4===0)?.07:0);dummy.updateMatrix();spines.setMatrixAt(n,dummy.matrix);spines.setColorAt(n,new THREE.Color(palette[(row*3+slot)%palette.length]));n++}
      spines.count=n;swing.add(spines);for(const p of parts)mark(p,caseData);
      const lever=box(.18,.64,.42,std(0x0c0c0c,{roughness:.5}),.28+8*.2,2.05+.04+.32,.52,swing);mark(lever,{type:'curious-door',room:room.key,title:found?'The black volume (the Parlour)':'A black volume with no title',author:found?'Tilt it and the bookcase will swing aside.':'Its spine is cold to the touch, colder than the room.',action:'TILT THE VOLUME'});
      const passage=add(new THREE.PlaneGeometry(3.3,4.1),new THREE.MeshBasicMaterial({visible:false}),0,2.05,.03,g);const caseOpening=new THREE.PlaneGeometry(3.3,4.1);caseOpening.translate(0,2.05,0);const passageData={type:'curious-door',room:room.key,title:'A narrow passage behind the shelves',author:'Firelight moves at the far end, and a chair creaks.',action:'ENTER'};mark(passage,passageData);
      // A cold draught: pale motes creep out along the floor at the bookcase's foot.
      const motes=new THREE.BufferGeometry(),pos=new Float32Array(40*3);for(let i=0;i<40;i++)pos.set([(Math.random()-.5)*3.2,Math.random()*.5,.5+Math.random()*1.4],i*3);motes.setAttribute('position',new THREE.BufferAttribute(pos,3));const draught=new THREE.Points(motes,new THREE.PointsMaterial({color:0xc9d6e6,size:.05,transparent:true,opacity:.45,depthWrite:false}));g.add(draught);
      const glowLight=light(g,0xff9a4a,0,5,0,1.6,-.6);
      doors[room.key]={room,group:g,swing,lever,draught,glowLight,state:'closed',t:0,kind:'bookcase',hinted:false,portal:portal(g,caseOpening,.02,swing)};
    }
    function nurseryDoor(room){
      const g=doorGroup(room),data={type:'curious-door',room:room.key,title:'A small blue door, painted with stars',author:'It is only just tall enough for a grown-up. There is a brass knocker shaped like a hare.',action:'KNOCK'};
      const painted=canvasTexture((c,w,h)=>{c.fillStyle='#2c4a7a';c.fillRect(0,0,w,h);c.strokeStyle='#223a61';c.lineWidth=6;c.strokeRect(22,40,w-44,h*.34);c.strokeRect(22,h*.5,w-44,h*.44);c.fillStyle='#f2d98a';for(let i=0;i<16;i++){const x=20+Math.random()*(w-40),y=20+Math.random()*(h-40),s=4+Math.random()*7;c.beginPath();for(let k=0;k<10;k++){const a=k/10*TAU-Math.PI/2,rr=k%2?s*.45:s;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}c.fill()}c.beginPath();c.arc(w*.7,h*.18,18,0,TAU);c.fill();c.fillStyle='#2c4a7a';c.beginPath();c.arc(w*.66,h*.16,16,0,TAU);c.fill()},256,512);
      const frame=canvasTexture((c,w,h)=>{c.fillStyle='#e7dcc4';c.fillRect(0,0,w,h);c.strokeStyle='#5a4a3a';c.fillStyle='#5a4a3a';c.font='14px Georgia';const marks=[['Wendy',.62],['John',.55],['Michael',.44],['Alice',.66]];for(const [name,f] of marks){const y=h*(1-f);c.fillRect(8,y,w*.55,2);c.save();c.translate(w*.62,y+4);c.fillText(name,0,0);c.restore()}},128,512);
      const arch=new THREE.Shape();arch.moveTo(-.68,0);arch.lineTo(-.68,2.05);arch.absarc(0,2.05,.68,Math.PI,0,true);arch.lineTo(.68,0);arch.lineTo(-.68,0);
      const hinge=new THREE.Group();hinge.position.set(-.68,0,.08);g.add(hinge);const leaf=add(uvFromBounds(new THREE.ShapeGeometry(arch,16)),new THREE.MeshStandardMaterial({map:painted,roughness:.7,side:THREE.DoubleSide}),.68,0,0,hinge);mark(leaf,data);
      const porthole=add(new THREE.CircleGeometry(.2,20),glow(0xffd08a,1.6),.68,1.95,.02,hinge);add(new THREE.TorusGeometry(.21,.035,6,20),MAT.brass,.68,1.95,.03,hinge);const knocker=add(new THREE.TorusGeometry(.1,.025,6,16),MAT.brass,.68,1.35,.05,hinge);mark(knocker,data);sphere(.05,MAT.brass,1.2,1.1,.06,hinge,8);
      const nurseryOpening=uvFromBounds(new THREE.ShapeGeometry(arch,16));
      for(const x of [-.82,.82]){const post=box(.2,2.2,.18,new THREE.MeshStandardMaterial({map:frame,roughness:.9}),x,1.1,.1,g);if(x<0)detail(post,'Pencil marks on the door frame','Heights of children, dated across a century: Wendy, John, Michael — and, near the top, Alice.','READ')}
      add(new THREE.TorusGeometry(.8,.1,8,24,Math.PI),std(0xe7dcc4),0,2.05,.1,g);
      // A ball and a tin soldier left outside, as if someone was called in to bed.
      sphere(.16,std(0xc0392b,{roughness:.5}),1.1,.16,.8,g,14);const soldier=new THREE.Group();soldier.position.set(-1.1,0,.6);g.add(soldier);box(.1,.28,.08,std(0xa31d1d),0,.3,0,soldier);box(.08,.16,.07,std(0x1d2a4a),0,.08,0,soldier);cyl(.05,.05,.14,8,MAT.black,0,.52,0,soldier);
      plaque(g,'NURSERY','knock first',0,3.15,.12,1.2,0,{bg:'#1b2440',ink:'#f1dfae',rule:'#c9a45c'});
      const glowLight=light(g,0xffd08a,0,5,0,1.5,.7);
      doors[room.key]={room,group:g,hinge,glowLight,state:'closed',t:0,kind:'nursery',portal:portal(g,nurseryOpening,.03,hinge)};
    }

    // ---------- lifecycle ----------
    function build(room){if(room.built)return;room.built=true;room.root=new THREE.Group();room.root.name='curious-'+room.key;({horologist:buildHorologist,conservatory:buildConservatory,parlour:buildParlour,attic:buildAttic})[room.key](room);scene.add(room.root);room.active=true;room.lastNeeded=time}
    function activate(room){build(room);if(!room.active){scene.add(room.root);room.active=true}room.lastNeeded=time}
    function unload(room){if(!room.active)return;room.root.removeFromParent();room.active=false}
    function zoneAt(x,z){for(const room of Object.values(rooms))if(x>room.cx-room.w/2&&x<room.cx+room.w/2&&z>room.cz-room.d/2&&z<room.cz+room.d/2)return room;return null}
    function contains(x,z){return !!zoneAt(x,z)}
    function floorAt(x,z){return contains(x,z)?0:null}
    function allowed(x,z){const room=zoneAt(x,z);if(!room)return false;const radius=player.radius||.42;if(x-radius<room.cx-room.w/2+.4||x+radius>room.cx+room.w/2-.4||z-radius<room.cz-room.d/2+.4||z+radius>room.cz+room.d/2-.4)return false;return !blockers.some(b=>b.room===room.key&&x+radius>b.minX&&x-radius<b.maxX&&z+radius>b.minZ&&z-radius<b.maxZ)}

    const ARRIVALS={horologist:'A hundred clocks disagree about the hour. The orrery turns; one tiny moon is labelled “the Library”.',conservatory:'Warm, wet air and moonlight through the glass. Fireflies drift between the palms.',parlour:'The bookcase swings shut behind you. A fire is lit, two chairs are drawn up, and the dust sheets have not moved. Probably.',attic:'“Come in — but mind your head.” Nobody is there. The clockwork train is already going round.'};
    function enter(room){activate(room);move(room.cx,room.cz+room.d/2-1.8,0);showNotice(ARRIVALS[room.key],8);analytics?.track('Room Explored',{room:'curious-'+room.key});if(!store.get('athenaeum-curious-'+room.key)){store.set('athenaeum-curious-'+room.key,'1')}}
    function openDoor(door){
      if(door.state!=='closed')return;door.state='opening';door.t=0;activate(door.room);
      if(door.kind==='clock'){sound?.(1900,.05,'square',.03);for(let i=1;i<9;i++)setTimeout(()=>sound?.(1500+i*90,.05,'square',.025),i*110);showNotice('You wind the key. The hands race to midnight, the gears catch, and the whole door rolls aside.',4)}
      else if(door.kind==='glass'){playSample?.('doorOpen',.7,1.1);showNotice('The glass door swings inward on a breath of warm, green air.',4)}
      else if(door.kind==='bookcase'){playSample?.('secretDoor',.9,.9);store.set('athenaeum-parlour-found','1');door.lever.userData.title='The black volume (the Parlour)';showNotice('The volume tilts with a click. Somewhere a counterweight drops, and the whole bookcase swings away from the wall.',5)}
      else if(door.kind==='nursery'){for(let i=0;i<3;i++)setTimeout(()=>sound?.(150,.12,'triangle',.14),i*260);showNotice('Knock, knock, knock. A pause — then, from very close, a small voice: “Come in!”',4)}
    }

    function interact(object){
      const data=object?.userData;if(!data)return false;
      if(data.type==='curious-door'){const door=doors[data.room];if(door.kind==='bookcase'&&door.state==='open'){enter(door.room);return true}openDoor(door);return true}
      if(data.type==='curious-exit'){const room=rooms[data.room],door=doors[room.key],back=1.9;move(room.door.x+Math.sin(room.door.yaw)*back,room.door.z+Math.cos(room.door.yaw)*back,room.door.yaw+Math.PI);playSample?.('doorOpen',.8,1);showNotice('The Grand Hall again, and its familiar lamplight.',4);door.state='closing';door.t=0;return true}
      if(data.type==='curious-detail'){showNotice(data.author,7);sound?.(300,.12,'triangle',.035);if(data.title==='A dappled rocking horse'){const horse=animated.find(a=>a.kind==='rock');if(horse)horse.kick=time}return true}
      return false;
    }

    const flyPosition=new THREE.Vector3();
    function update(t,dt,reduced=isReducedMotion()){
      time=t;const motion=reduced?0:1;
      // Keep rooms warm near their doors; free them when the reader has been away a while.
      for(const room of Object.values(rooms)){const near=Math.hypot(player.pos.x-room.door.x,player.pos.z-room.door.z)<PRELOAD_DISTANCE,inside=zoneAt(player.pos.x,player.pos.z)===room;if(near||inside){if(inside||room.built)activate(room)}else if(room.active&&t-room.lastNeeded>KEEP_WARM_SECONDS)unload(room)}
      // Door mechanisms.
      for(const door of Object.values(doors)){
        const nearDoor=Math.hypot(player.pos.x-door.room.door.x,player.pos.z-door.room.door.z)<14;if(!nearDoor&&door.state==='closed')continue;
        if(door.kind==='clock'){const fast=door.state==='opening'?9:.25;door.gears.forEach((g,i)=>g.rotation.z+=dt*fast*(i%2?-1.4:1)*motion);door.face.minute.rotation.z-=dt*(door.state==='opening'?14:.1);door.face.hour.rotation.z-=dt*(door.state==='opening'?1.2:.008)}
        if(door.kind==='bookcase'&&!reduced){const p=door.draught.geometry.attributes.position;for(let i=0;i<p.count;i++){let z=p.getZ(i)+dt*.18;if(z>2.2)z=.45;p.setZ(i,z);p.setY(i,.05+Math.abs(Math.sin(t*.7+i))*.4)}p.needsUpdate=true;if(!door.hinted&&Math.hypot(player.pos.x-door.room.door.x,player.pos.z-door.room.door.z)<4.5){door.hinted=true;if(store.get('athenaeum-parlour-found')!=='1')showNotice('A cold draught stirs the dust along the foot of the bookcase beside the hearth.',6)}}
        door.portal.set(door.state!=='closed');
        if(door.kind==='glass')door.glassMat.emissiveIntensity=.5+Math.sin(t*1.3)*.08+(door.state==='opening'?.6:0);
        if(door.state==='opening'){door.t+=dt;const k=Math.min(1,door.t/1.3),e=k*k*(3-2*k);door.glowLight.intensity=e*6;
          if(door.kind==='clock'){door.disc.position.x=e*2.9;door.disc.rotation.z=-e*2.1}
          else if(door.kind==='glass')door.pivot.rotation.y=-e*1.35;
          else if(door.kind==='bookcase')door.swing.rotation.y=-e*1.15;
          else if(door.kind==='nursery')door.hinge.rotation.y=-e*1.5*Math.min(1,Math.max(0,(door.t-.8)/.5));
          if(door.kind==='nursery'?door.t>2.1:door.t>1.5){if(door.kind==='bookcase'){door.state='open';showNotice('Behind the bookcase: a narrow passage, and firelight.',5)}else{door.state='open';enter(door.room)}}
        }else if(door.state==='closing'){door.t+=dt;const k=Math.max(0,1-door.t/1.2),e=k*k*(3-2*k);door.glowLight.intensity=e*6;if(door.kind==='clock'){door.disc.position.x=e*2.9;door.disc.rotation.z=-e*2.1}else if(door.kind==='glass')door.pivot.rotation.y=-e*1.35;else if(door.kind==='bookcase')door.swing.rotation.y=-e*1.15;else if(door.kind==='nursery')door.hinge.rotation.y=-e*1.5;if(k===0)door.state='closed'}
        else if(door.state==='open'&&door.kind!=='bookcase'){door.state='closing';door.t=0}
      }
      // Room life, only for the room the reader is standing in.
      const room=zoneAt(player.pos.x,player.pos.z);if(!room||!room.active)return;room.lastNeeded=t;
      for(const a of animated){if(a.room!==room)continue;
        if(a.kind==='clock'){a.hands.minute.rotation.z=-(t*a.speed*.35+a.phase);a.hands.hour.rotation.z=-(t*a.speed*.03+a.phase*.3)}
        else if(a.kind==='pendulum')a.object.rotation.z=Math.sin(t*Math.PI)*.18*(motion||.3);
        else if(a.kind==='orrery')a.planets.forEach(p=>p.arm.rotation.y+=dt*p.speed*.35);
        else if(a.kind==='spin')a.object.rotation.z+=dt*a.speed*motion;
        else if(a.kind==='sway')a.object.rotation.z=a.base+Math.sin(t*.6+a.phase)*.05*motion;
        else if(a.kind==='water'){a.water.material.emissiveIntensity=.55+Math.sin(t*2)*.08;a.jet.scale.y=1+Math.sin(t*6)*.08*motion}
        else if(a.kind==='fireflies'){const p=a.points.geometry.attributes.position;a.seeds.forEach(([u,v,s],i)=>{p.setXYZ(i,room.cx+Math.sin(t*.13*s+u)*8.2,1.1+Math.sin(t*.4*s+v)*.9+s*.7,room.cz+Math.cos(t*.11*s+v)*6.2)});p.needsUpdate=true;a.points.material.opacity=.55+Math.sin(t*3)*.3}
        else if(a.kind==='fire'){a.flames.forEach((f,i)=>{const flicker=1+Math.sin(t*9+i*1.7)*.12*(motion||.3);f.scale.set(1/flicker,flicker,1/flicker)});a.light.intensity=8.5+Math.sin(t*7.3)*.9+Math.sin(t*13.1)*.5}
        else if(a.kind==='candles'){a.candles.forEach((c,i)=>{c.scale.y=1+Math.sin(t*8+i*2)*.15*(motion||.3);c.visible=!(Math.sin(t*.37+i*2.1)>.995)})}
        else if(a.kind==='rock'){const since=a.kick!==undefined?t-a.kick:99;a.object.rotation.x=(since<6?Math.sin(since*3.2)*.16*Math.exp(-since*.45):Math.sin(t*.8)*.012)*(motion||.2)}
        else if(a.kind==='train'){const base=t*.45*(motion||.25);a.train.children.forEach((car,i)=>{const ang=base-i*.25;car.position.set(a.cx+Math.cos(ang)*1.7,car.position.y,a.cz+Math.sin(ang)*1.7);car.rotation.y=-ang})}
      }
      if(room.key==='horologist'&&Math.floor(t*2)!==Math.floor((t-dt)*2))sound?.(Math.floor(t*2)%2?2800:2300,.025,'square',.006);
    }

    clockDoor(rooms.horologist);glassDoor(rooms.conservatory);bookcaseDoor(rooms.parlour);nurseryDoor(rooms.attic);
    return {contains,floorAt,allowed,interact,update,zoneAt,rooms,doors,activate};
  };
})();
