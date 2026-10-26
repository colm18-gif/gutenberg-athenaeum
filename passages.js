// Back ways: short passages between neighbouring rooms behind doors, so a reader can wander from one to the next without
// going back through the Grand Hall every time. Each is a door in one room, a few steps of hallway, stair or gallery,
// and a door into the next: the Cellar Stair (Poe Room to Irish Room), the Night Corridor (English Reading Room to Poe
// Room), the Long Gallery (Medicine Room to English Reading Room), the Back Stair (Austen Room to Burns Room), the Stacks
// Stair (Burns Room to the Room of Books Within Books), the Servants' Passage (Evening Room, Set Texts Room and
// Periodicals Room) and the Sorting Corridor (Room of Chance to Lost Property Office). The rooms reached by air, by
// boat and by rocket are left that way on purpose.
// Nothing here is built at startup. A passage's door appears in a room only while that room is built, the passage
// itself is built when the reader steps in and freed a little while after they leave, and one lamp, the module's own,
// moves to whichever passage is in use, so no passage adds a light. Each stands far out to the east (x 1200), beyond
// the camera's reach from anything else.
(function(){
  'use strict';

  // Where each passage's doors are, as a wall of a room and a distance along it from the wall's middle (x for the north
  // and south walls, z for the east and west), measured clear of the rooms' shelves, pictures and furniture. The Map
  // Room's walls are hung edge to edge, so its way round is through the Medicine Room next door.
  const PASSAGES=[
    {key:'cellar-stair',name:'The Cellar Stair',kind:'stair',length:15,width:2.3,rise:2.4,walls:0x4b4540,stone:true,
      ends:[{room:'poe',label:'THE POE ROOM',wall:'north',at:5,high:true},{room:'irish',label:'THE IRISH ROOM',wall:'south',at:-6}],
      look:{style:'painted',color:0x241a14,planked:true,fanColor:0xffb35c},
      prints:[{motif:'raven',side:-1,at:3.4,title:'A raven',text:'A small print of a raven, hung where the stair leaves the Poe Room. Someone has pencilled “Nevermore” on the mount, and someone else has rubbed it out.'},
        {motif:'harp',side:1,at:12.2,title:'A harp',text:'The harp, Ireland’s emblem, on a little framed card at the foot of the stair. The Irish Room is through the door below.'}],
      candle:{side:1,at:7.6}},
    {key:'night-corridor',name:'The Night Corridor',kind:'hall',length:14,width:2.6,walls:0x23352d,
      ends:[{room:'learners',label:'THE ENGLISH READING ROOM',wall:'north',at:5.6},{room:'poe',label:'THE POE ROOM',wall:'south',at:4}],
      look:{style:'walnut',fanColor:0xffc27a},
      windows:[{scene:'storm',side:-1,at:7}],
      prints:[{motif:'quill',side:1,at:4.4,title:'A quill',text:'A goose quill and an inkwell, framed. Between the English Reading Room and the Poe Room, it seemed the right thing to hang.'},
        {motif:'lamp',side:1,at:9.6,title:'A reading lamp',text:'A green-shaded reading lamp in a little frame, for anyone reading late in the rooms at either end.'}]},
    {key:'long-gallery',name:'The Long Gallery',kind:'hall',length:20,width:3,walls:0x5a4632,
      ends:[{room:'medicine',label:'THE MEDICINE ROOM',wall:'south',at:6},{room:'learners',label:'THE ENGLISH READING ROOM',wall:'west',at:5.3}],
      look:{style:'painted',color:0x30413a,glazed:true,fanColor:0xe8d8a8},
      windows:[{scene:'garden',side:-1,at:5},{scene:'garden',side:-1,at:10},{scene:'garden',side:-1,at:15}],
      prints:[{motif:'globe',side:1,at:5,title:'A terrestrial globe',text:'An engraving of a terrestrial globe on its stand. The Map Room, with its twenty maps, is through the Medicine Room at this gallery’s far end.'},
        {motif:'compass',side:1,at:10,title:'A compass rose',text:'A compass rose of thirty-two points, of the kind drawn on the old sea charts.'},
        {motif:'leaf',side:1,at:15,title:'A pressed leaf',text:'A pressed leaf in a frame, with a herbalist’s careful label too faded to read.'}]},
    {key:'back-stair',name:'The Back Stair',kind:'stair',length:14,width:2.2,rise:2.6,walls:0x9c8e70,
      ends:[{room:'burns',label:'THE BURNS ROOM',wall:'south',at:2.4},{room:'austen',label:'THE AUSTEN ROOM',wall:'south',at:-2.6}],
      look:{style:'painted',color:0x2f4a3a,fanColor:0xf0e0b0},
      prints:[{motif:'thistle',side:-1,at:3.2,title:'A thistle',text:'A Scottish thistle, framed at the foot of the stair by the Burns Room’s door.'},
        {motif:'profile',side:1,at:11.4,title:'A silhouette',text:'A cut-paper profile of a lady in a Regency cap, the kind of likeness taken in an afternoon at Bath. The Austen Room is at the top of the stair.'}]},
    {key:'stacks-stair',name:'The Stacks Stair',kind:'stair',length:14,width:2.2,rise:3,walls:0x3a3530,stacks:true,iron:true,
      ends:[{room:'burns',label:'THE BURNS ROOM',wall:'north',at:-4.5},{room:'within',label:'BOOKS WITHIN BOOKS',wall:'south',at:-4}],
      look:{style:'iron'},
      prints:[{motif:'key',side:1,at:7,title:'A key on a nail',text:'A long iron key hangs on a nail halfway up the stacks. Nobody remembers what it opens.'}]},
    {key:'servants-passage',name:'The Servants’ Passage',kind:'hall',length:22,width:2.4,walls:0x9a927e,bells:true,
      ends:[{room:'evening',label:'THE EVENING ROOM',wall:'south',at:4},{room:'periodicals',label:'THE PERIODICALS ROOM',wall:'east',at:4.5},{room:'setTexts',label:'THE SET TEXTS ROOM',wall:'south',at:4,middle:true}],
      look:{style:'painted',color:0x5b6b58,fanColor:0xf2e6c4},
      windows:[{scene:'town',side:-1,at:6},{scene:'town',side:-1,at:16}],
      prints:[{motif:'hooks',side:-1,at:11,title:'Coat hooks',text:'A row of coat hooks, with one forgotten scarf.'}]},
    {key:'sorting-corridor',name:'The Sorting Corridor',kind:'hall',length:14,width:2.4,walls:0x4a4238,pigeonholes:true,
      ends:[{room:'chance',label:'THE ROOM OF CHANCE',wall:'east',at:5.5},{room:'lostProperty',label:'LOST PROPERTY',wall:'east',at:-4.5}],
      look:{style:'iron'},
      prints:[{motif:'tag',side:-1,at:7,title:'A luggage label',text:'A brown luggage label pinned to the wall: “Found between two shelves. Owner unknown.” It might belong to either room.'}]}
  ];
  const BASE={x:1200,z:-600,step:40},KEEP=25,DOOR={width:1.5,height:2.8,fanlight:false,pediment:false};
  // The inside face of each room's walls: most are 0.3 m thick, the Room of Chance's and the Lost Property Office's 0.4 m.
  const INSET={chance:.2,lostProperty:.2};
  const TITLES={poe:'The Poe Room',irish:'The Irish Room',learners:'The English Reading Room',medicine:'The Medicine Room',austen:'The Austen Room',burns:'The Burns Room',
    within:'The Room of Books Within Books',evening:'The Evening Room',setTexts:'The Set Texts Room',periodicals:'The Periodicals Room',chance:'The Room of Chance',lostProperty:'The Lost Property Office'};

  window.createPassages=function(options){
    const {THREE,scene,MAT,player,interactables,canvasTexture,showNotice,playSample,move,analytics,doorKit=null,rooms={},storage=window.localStorage}=options;
    const FOUND_KEY='athenaeum-back-ways';
    const found=new Set((()=>{try{return JSON.parse(storage?.getItem(FOUND_KEY)||'[]')}catch(e){return []}})());
    let time=0,lamp=null;
    const built=new Map();

    // ---------- where things are ----------
    const origin=index=>({x:BASE.x,z:BASE.z-index*BASE.step});
    // A door on a room's wall: its place, the way it faces (into the room) and where a reader steps out of it.
    function roomDoor(end){
      const room=rooms[end.room]?.room;if(!room)return null;const {cx,cz,w,d}=room,inset=INSET[end.room]??.15;
      const at={north:[cx+end.at,cz-d/2+inset,0],south:[cx+end.at,cz+d/2-inset,Math.PI],west:[cx-w/2+inset,cz+end.at,Math.PI/2],east:[cx+w/2-inset,cz+end.at,-Math.PI/2]}[end.wall];
      const [x,z,yaw]=at;return {x,z,yaw,out:{x:x+Math.sin(yaw)*1.6,z:z+Math.cos(yaw)*1.6,yaw:yaw+Math.PI}};
    }
    // The height of the floor a distance along a passage: level landings at either end, a flight of steps between. The
    // Cellar Stair goes down from the Poe Room (its first end is the high one); the others climb from their first room.
    const LANDING=2.4;
    function floorY(p,lz){if(p.kind!=='stair')return 0;const f=Math.min(1,Math.max(0,(lz-LANDING)/(p.length-2*LANDING)));return p.rise*(p.ends[0].high?1-f:f)}
    // The doors inside a passage, in its own frame: the first end at the near wall, the second at the far wall, a third
    // (the Servants' Passage's) halfway along the east side.
    function passageDoor(p,i){
      const end=p.ends[i],o=origin(PASSAGES.indexOf(p));
      const [lx,lz,yaw]=end.middle?[p.width/2-.1,p.length/2,-Math.PI/2]:i===0?[0,.1,0]:[0,p.length-.1,Math.PI];
      const y=floorY(p,end.middle?p.length/2:i===0?0:p.length);
      return {lx,lz,yaw,y,x:o.x+lx,z:o.z+lz,out:{x:o.x+lx+Math.sin(yaw)*1.4,z:o.z+lz+Math.cos(yaw)*1.4,yaw:yaw+Math.PI,y}};
    }
    function passageAt(x,z){for(const p of PASSAGES){const o=origin(PASSAGES.indexOf(p)),lx=x-o.x,lz=z-o.z;if(Math.abs(lx)<p.width/2&&lz>0&&lz<p.length)return {p,lx,lz}}return null}
    function contains(x,z){return !!passageAt(x,z)}
    function floorAt(x,z){const at=passageAt(x,z);return at?floorY(at.p,at.lz):null}
    function allowed(x,z){
      const at=passageAt(x,z);if(!at)return false;const r=player.radius||.42,{p,lx,lz}=at;
      if(Math.abs(lx)+r>p.width/2-.12||lz-r<.2||lz+r>p.length-.2)return false;
      return !(built.get(p.key)?.blockers||[]).some(b=>lx+r>b.minX&&lx-r<b.maxX&&lz+r>b.minZ&&lz-r<b.maxZ);
    }

    // ---------- pictures ----------
    // Small framed prints and painted night views, drawn on canvases: one texture per picture, freed with its passage.
    const ink='#2a1d12';
    const MOTIFS={
      raven(c,w,h){c.fillStyle=ink;c.beginPath();c.moveTo(w*.18,h*.62);c.quadraticCurveTo(w*.35,h*.4,w*.55,h*.42);c.quadraticCurveTo(w*.66,h*.28,w*.74,h*.32);c.lineTo(w*.86,h*.36);c.lineTo(w*.75,h*.4);
        c.quadraticCurveTo(w*.72,h*.55,w*.6,h*.62);c.lineTo(w*.66,h*.78);c.lineTo(w*.6,h*.78);c.lineTo(w*.55,h*.64);c.quadraticCurveTo(w*.38,h*.7,w*.18,h*.62);c.fill();
        c.fillRect(w*.2,h*.79,w*.6,h*.025);c.fillStyle='#e9dcc0';c.beginPath();c.arc(w*.72,h*.335,w*.012,0,7);c.fill()},
      harp(c,w,h){c.strokeStyle='#7a5418';c.lineWidth=w*.035;c.beginPath();c.moveTo(w*.3,h*.82);c.lineTo(w*.3,h*.2);c.quadraticCurveTo(w*.55,h*.12,w*.72,h*.3);c.quadraticCurveTo(w*.6,h*.5,w*.32,h*.8);c.stroke();
        c.lineWidth=1.5;c.strokeStyle='#b89a5a';for(let i=1;i<9;i++){const t=i/9,x=w*(.3+t*.36),top=h*(.2+t*.05),bottom=h*(.8-t*.52);c.beginPath();c.moveTo(x,top+(t>.75?h*.06:0));c.lineTo(x,Math.max(top+h*.05,bottom));c.stroke()}},
      quill(c,w,h){c.fillStyle=ink;c.fillRect(w*.3,h*.7,w*.4,h*.12);c.beginPath();c.ellipse(w*.5,h*.7,w*.2,h*.04,0,0,7);c.fill();c.strokeStyle='#5a4a3a';c.fillStyle='#efe6d2';c.lineWidth=2;
        c.beginPath();c.moveTo(w*.52,h*.68);c.quadraticCurveTo(w*.5,h*.4,w*.75,h*.12);c.quadraticCurveTo(w*.66,h*.45,w*.54,h*.68);c.fill();c.stroke()},
      lamp(c,w,h){c.fillStyle='#2f5a3a';c.beginPath();c.moveTo(w*.28,h*.42);c.lineTo(w*.72,h*.42);c.lineTo(w*.62,h*.3);c.lineTo(w*.38,h*.3);c.closePath();c.fill();c.fillStyle='#b88a3a';c.fillRect(w*.48,h*.42,w*.04,h*.32);c.fillRect(w*.36,h*.74,w*.28,h*.05);
        const g=c.createRadialGradient(w*.5,h*.5,2,w*.5,h*.55,w*.3);g.addColorStop(0,'rgba(255,220,140,.6)');g.addColorStop(1,'rgba(255,220,140,0)');c.fillStyle=g;c.fillRect(0,h*.4,w,h*.5)},
      globe(c,w,h){c.strokeStyle=ink;c.lineWidth=2.5;c.beginPath();c.arc(w*.5,h*.42,w*.27,0,7);c.stroke();for(const k of [-.6,-.2,.2,.6]){c.beginPath();c.ellipse(w*.5,h*.42,w*.27*Math.sqrt(1-k*k)*1.0,w*.27,0,0,7);c.stroke()}
        for(const k of [-.5,0,.5]){c.beginPath();c.moveTo(w*.5-w*.27*Math.sqrt(1-k*k),h*.42+w*.27*k);c.lineTo(w*.5+w*.27*Math.sqrt(1-k*k),h*.42+w*.27*k);c.stroke()}
        c.beginPath();c.arc(w*.5,h*.42,w*.31,Math.PI*.15,Math.PI*1.05);c.stroke();c.fillStyle=ink;c.fillRect(w*.48,h*.72,w*.04,h*.1);c.fillRect(w*.36,h*.82,w*.28,h*.03)},
      compass(c,w,h){c.translate(w/2,h*.48);for(let i=0;i<32;i++){const a=i/32*Math.PI*2,len=(i%8===0?.36:i%4===0?.26:i%2===0?.18:.12)*w;c.fillStyle=i%2?'#8a6a3a':ink;c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(a-.06)*len*.25,Math.sin(a-.06)*len*.25);c.lineTo(Math.cos(a)*len,Math.sin(a)*len);c.lineTo(Math.cos(a+.06)*len*.25,Math.sin(a+.06)*len*.25);c.fill()}
        c.strokeStyle=ink;c.lineWidth=1.5;c.beginPath();c.arc(0,0,w*.38,0,7);c.stroke();c.setTransform(1,0,0,1,0,0)},
      leaf(c,w,h){c.fillStyle='#5a6a3a';c.beginPath();c.moveTo(w*.5,h*.15);c.quadraticCurveTo(w*.85,h*.4,w*.5,h*.8);c.quadraticCurveTo(w*.15,h*.4,w*.5,h*.15);c.fill();c.strokeStyle='#3a4a26';c.lineWidth=2;c.beginPath();c.moveTo(w*.5,h*.15);c.lineTo(w*.5,h*.88);c.stroke();
        for(let i=1;i<6;i++){const y=h*(.2+i*.1);c.beginPath();c.moveTo(w*.5,y+h*.04);c.lineTo(w*(.5-.06*Math.sin(i)),y-h*.02);c.moveTo(w*.5,y+h*.04);c.lineTo(w*(.5+.06*Math.sin(i)),y-h*.02);c.stroke()}
        c.fillStyle='#d8ccb0';c.fillRect(w*.3,h*.86,w*.4,h*.06)},
      thistle(c,w,h){c.strokeStyle='#4a5a32';c.lineWidth=3;c.beginPath();c.moveTo(w*.5,h*.85);c.lineTo(w*.5,h*.45);c.stroke();c.fillStyle='#4a5a32';c.beginPath();c.ellipse(w*.5,h*.47,w*.12,h*.08,0,0,7);c.fill();
        c.strokeStyle='#7a4a8a';c.lineWidth=2;for(let i=0;i<13;i++){const a=Math.PI*(1.1+i/12*.8);c.beginPath();c.moveTo(w*.5,h*.42);c.lineTo(w*.5+Math.cos(a)*w*.16,h*.42+Math.sin(a)*h*.16);c.stroke()}
        c.fillStyle='#4a5a32';for(const s of [-1,1]){c.beginPath();c.moveTo(w*.5,h*.7);c.quadraticCurveTo(w*(.5+s*.2),h*.62,w*(.5+s*.28),h*.52);c.quadraticCurveTo(w*(.5+s*.16),h*.68,w*.5,h*.74);c.fill()}},
      profile(c,w,h){c.fillStyle='#e8dcc0';c.beginPath();c.ellipse(w*.5,h*.45,w*.32,h*.34,0,0,7);c.fill();c.fillStyle=ink;c.beginPath();c.moveTo(w*.42,h*.78);c.quadraticCurveTo(w*.36,h*.6,w*.44,h*.52);c.lineTo(w*.4,h*.47);c.lineTo(w*.45,h*.44);
        c.quadraticCurveTo(w*.42,h*.36,w*.47,h*.32);c.quadraticCurveTo(w*.48,h*.2,w*.6,h*.2);c.quadraticCurveTo(w*.72,h*.22,w*.7,h*.38);c.quadraticCurveTo(w*.66,h*.5,w*.62,h*.56);c.quadraticCurveTo(w*.66,h*.7,w*.7,h*.78);c.closePath();c.fill();
        c.fillStyle='#f4ecd8';c.beginPath();c.ellipse(w*.6,h*.22,w*.12,h*.05,-.2,0,7);c.fill()},
      key(c,w,h){c.strokeStyle='#2a2a2a';c.lineWidth=w*.04;c.beginPath();c.arc(w*.5,h*.25,w*.1,0,7);c.stroke();c.beginPath();c.moveTo(w*.5,h*.35);c.lineTo(w*.5,h*.82);c.stroke();c.lineWidth=w*.03;c.beginPath();c.moveTo(w*.5,h*.74);c.lineTo(w*.6,h*.74);c.moveTo(w*.5,h*.81);c.lineTo(w*.58,h*.81);c.stroke();
        c.fillStyle='#555';c.beginPath();c.arc(w*.5,h*.1,w*.03,0,7);c.fill()},
      hooks(c,w,h){c.fillStyle='#5a3a22';c.fillRect(w*.05,h*.3,w*.9,h*.08);c.fillStyle='#b8943a';for(let i=0;i<5;i++){c.beginPath();c.arc(w*(.15+i*.175),h*.42,w*.025,0,7);c.fill()}
        c.fillStyle='#7a2a2a';c.beginPath();c.moveTo(w*.5,h*.42);c.lineTo(w*.44,h*.9);c.lineTo(w*.5,h*.88);c.lineTo(w*.56,h*.92);c.closePath();c.fill()},
      tag(c,w,h){c.fillStyle='#c8a878';c.beginPath();c.moveTo(w*.2,h*.25);c.lineTo(w*.7,h*.25);c.lineTo(w*.82,h*.4);c.lineTo(w*.82,h*.75);c.lineTo(w*.2,h*.75);c.closePath();c.fill();c.fillStyle='#f4ecd8';c.beginPath();c.arc(w*.72,h*.36,w*.03,0,7);c.fill();
        c.fillStyle=ink;c.font=`italic ${Math.round(h*.07)}px Georgia`;c.fillText('Found between',w*.26,h*.48);c.fillText('two shelves.',w*.26,h*.57);c.fillText('Owner unknown.',w*.26,h*.66)}
    };
    function printTexture(motif){return canvasTexture((c,w,h)=>{c.fillStyle='#ede2c8';c.fillRect(0,0,w,h);c.strokeStyle='#b8a47e';c.lineWidth=3;c.strokeRect(14,14,w-28,h-28);(MOTIFS[motif]||(()=>{}))(c,w,h)},256,320)}
    // A night view through a window: sky, stars and moon, with gardens, the sea in a storm, or roofs and chimneys.
    function viewTexture(kind,seed){return canvasTexture((c,w,h)=>{
      let s=seed*9301+49297;const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647};
      const sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,kind==='storm'?'#0b0f18':'#0c1530');sky.addColorStop(1,kind==='storm'?'#273040':'#2a3a5a');c.fillStyle=sky;c.fillRect(0,0,w,h);
      c.fillStyle='#e8eef8';for(let i=0;i<(kind==='storm'?12:60);i++){c.globalAlpha=.4+rnd()*.6;c.fillRect(rnd()*w,rnd()*h*.6,1.5,1.5)}c.globalAlpha=1;
      const mx=w*(.25+rnd()*.5),my=h*(.18+rnd()*.12),glow=c.createRadialGradient(mx,my,4,mx,my,w*.25);glow.addColorStop(0,'rgba(240,240,220,.5)');glow.addColorStop(1,'rgba(240,240,220,0)');c.fillStyle=glow;c.fillRect(0,0,w,h);
      c.fillStyle='#f4f0dc';c.beginPath();c.arc(mx,my,w*.05,0,7);c.fill();
      if(kind==='storm'){c.fillStyle='rgba(30,36,48,.85)';for(let i=0;i<5;i++){c.beginPath();c.ellipse(rnd()*w,h*(.15+rnd()*.35),w*(.25+rnd()*.2),h*.06,0,0,7);c.fill()}
        c.fillStyle='#141a24';c.fillRect(0,h*.72,w,h*.28);c.strokeStyle='rgba(200,210,230,.35)';c.lineWidth=1.5;for(let i=0;i<14;i++){const x=rnd()*w,y=h*(.74+rnd()*.22);c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+12,y-4,x+26,y);c.stroke()}
        c.fillStyle='#0a0d12';c.fillRect(w*.78,h*.5,w*.05,h*.24);c.fillStyle='#f6d88a';c.fillRect(w*.785,h*.5,w*.04,h*.03)}
      else if(kind==='garden'){c.fillStyle='#0d1810';c.beginPath();c.moveTo(0,h);for(let x=0;x<=w;x+=w/12)c.lineTo(x,h*(.66+rnd()*.08));c.lineTo(w,h);c.fill();
        for(let i=0;i<4;i++){const x=rnd()*w,r=w*(.08+rnd()*.08);c.beginPath();c.arc(x,h*.66,r,Math.PI,0);c.fill()}c.fillStyle='#1c2a1c';c.fillRect(w*.45,h*.75,w*.1,h*.25)}
      else{c.fillStyle='#10131c';let x=0;while(x<w){const bw=w*(.12+rnd()*.12),bh=h*(.2+rnd()*.25);c.fillRect(x,h-bh,bw,bh);c.fillRect(x+bw*.6,h-bh-h*.06,bw*.12,h*.06);if(rnd()<.6){c.fillStyle='#f2c66a';c.fillRect(x+bw*.25,h-bh*.6,bw*.18,bh*.12);c.fillStyle='#10131c'}x+=bw}}
    },256,320)}
    function signTexture(title,sub){return canvasTexture((c,w,h)=>{c.fillStyle='#1d140d';c.fillRect(0,0,w,h);c.strokeStyle='#b8925a';c.lineWidth=5;c.strokeRect(6,6,w-12,h-12);c.fillStyle='#ecd8a4';c.textAlign='center';
      let size=30;c.font=`bold ${size}px Georgia`;while(c.measureText(title).width>w-30&&size>14){size-=2;c.font=`bold ${size}px Georgia`}c.fillText(title,w/2,46);c.font='italic 20px Georgia';c.fillStyle='#d7c08a';c.fillText(sub,w/2,80)},512,100)}
    // A row of spines for the stacks, drawn once per visit.
    function spinesTexture(){return canvasTexture((c,w,h)=>{c.fillStyle='#1a120c';c.fillRect(0,0,w,h);const cols=['#5a2a1e','#2a3a4a','#4a3a1a','#2a4a32','#6a5a3a','#3a2a3a','#7a3a22'];let s=7;const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647};
      for(let row=0;row<4;row++){const y0=row*h/4;c.fillStyle='#3a2416';c.fillRect(0,y0+h/4-8,w,8);let x=4;while(x<w-6){const bw=8+rnd()*12,bh=h/4-18-rnd()*16;c.fillStyle=cols[Math.floor(rnd()*cols.length)];c.fillRect(x,y0+h/4-8-bh,bw,bh);c.fillStyle='rgba(220,190,120,.5)';c.fillRect(x+2,y0+h/4-8-bh+8,bw-4,2);x+=bw+1}}},512,512)}
    function pigeonTexture(){return canvasTexture((c,w,h)=>{c.fillStyle='#2a1d12';c.fillRect(0,0,w,h);let s=11;const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647};
      for(let r=0;r<6;r++)for(let k=0;k<8;k++){const x=k*w/8,y=r*h/6;c.fillStyle='#0f0a06';c.fillRect(x+5,y+5,w/8-10,h/6-10);if(rnd()<.55){c.fillStyle=rnd()<.5?'#d8c8a0':'#c8a878';c.fillRect(x+10+rnd()*10,y+h/6-24-rnd()*14,w/8-26,14+rnd()*10)}if(rnd()<.35){c.fillStyle='#e8dcc0';c.fillRect(x+w/16,y+8,10,7)}}},512,384)}

    // A texture repeated along a wall, so its pattern keeps its size however long the wall.
    function tiled(texture,x,y){texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(x,y);texture.needsUpdate=true;return texture}

    // ---------- building a passage ----------
    function build(p){
      if(built.has(p.key))return built.get(p.key);
      const index=PASSAGES.indexOf(p),o=origin(index),root=new THREE.Group();root.name='passage-'+p.key;root.position.set(o.x,0,o.z);
      const owned=[],ours=[],blockers=[],own=thing=>{owned.push(thing);return thing};
      const add=(geometry,material,x,y,z,parent=root)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m};
      const box=(w,h,d,material,x,y,z,parent)=>add(own(new THREE.BoxGeometry(w,h,d)),material,x,y,z,parent);
      const mark=(object,data)=>{object.userData=data;interactables.push(object);ours.push(object);return object};
      const {width:W,length:L}=p,top=Math.max(floorY(p,0),floorY(p,L)),H=4.1,ceiling=top+H;
      const wall=own(new THREE.MeshStandardMaterial({color:p.walls,roughness:.92,map:p.stone?MAT.stone?.map||null:null})),trim=MAT.darkWood,floorMat=p.iron?own(new THREE.MeshStandardMaterial({color:0x2c2f31,roughness:.5,metalness:.6})):MAT.wood;
      // Walls, ceiling and the far ends (the doors stand against them, and their portals paint the way through).
      box(.2,ceiling+.2,L,wall,-W/2-.1,ceiling/2,L/2);box(.2,ceiling+.2,L,wall,W/2+.1,ceiling/2,L/2);
      box(W+.4,ceiling+.2,.2,wall,0,ceiling/2,-.1);box(W+.4,ceiling+.2,.2,wall,0,ceiling/2,L+.1);
      box(W+.4,.2,L+.4,MAT.darkWood,0,ceiling+.1,L/2);
      // The floor: level, or two landings and a flight of steps between them.
      if(p.kind==='stair'){
        const y0=floorY(p,0),y1=floorY(p,L),run=L-2*LANDING,n=Math.max(2,Math.round(Math.abs(y1-y0)/.18)),tread=run/n;
        box(W,.3+y0,LANDING,floorMat,0,(y0-.3)/2,LANDING/2);box(W,.3+y1,LANDING,floorMat,0,(y1-.3)/2,L-LANDING/2);
        const steps=new THREE.InstancedMesh(own(new THREE.BoxGeometry(W,1,tread)),floorMat,n),m=new THREE.Matrix4(),q=new THREE.Quaternion(),v=new THREE.Vector3(),s=new THREE.Vector3();
        for(let i=0;i<n;i++){const h=y0+(y1-y0)*(i+(y1>y0?1:0))/n+.001;v.set(0,(h-.3)/2,LANDING+tread*(i+.5));s.set(1,h+.3,1);m.compose(v,q,s);steps.setMatrixAt(i,m)}
        steps.instanceMatrix.needsUpdate=true;own(steps);root.add(steps);
        // A handrail on each side, following the flight.
        const slope=Math.atan2(y1-y0,run),rail=Math.hypot(run,y1-y0);
        for(const sx of [-1,1]){const r=box(.07,.07,rail,p.iron?MAT.black||trim:trim,sx*(W/2-.08),(y0+y1)/2+.95,L/2);r.rotation.x=-slope}
        if(p.stacks){// Shelves of books on both walls, climbing with the stair.
          const tall=top+3.4,map=own(tiled(spinesTexture(),(L-1.2)/3,tall/2.6)),spines=own(new THREE.MeshStandardMaterial({map,roughness:.85}));
          for(const sx of [-1,1]){const shelf=add(own(new THREE.PlaneGeometry(L-1.2,tall)),spines,sx*(W/2-.01),tall/2,L/2);shelf.rotation.y=-sx*Math.PI/2}}
      }else{
        box(W,.3,L,floorMat,0,-.15,L/2);
        // A runner down the middle, a dado and a rail on both walls.
        const runner=add(own(new THREE.PlaneGeometry(W*.55,L-.6)),own(new THREE.MeshStandardMaterial({color:0x5a1f1a,roughness:1})),0,.012,L/2);runner.rotation.x=-Math.PI/2;
        for(const sx of [-1,1]){box(.04,1,L,trim,sx*(W/2-.02),.5,L/2);box(.07,.06,L,trim,sx*(W/2-.04),1.02,L/2);box(.05,.14,L,trim,sx*(W/2-.03),.07,L/2)}
        if(p.pigeonholes){const holes=own(new THREE.MeshStandardMaterial({map:own(tiled(pigeonTexture(),(L-3.4)/3,1)),roughness:.9}));const ph=add(own(new THREE.PlaneGeometry(L-3.4,2)),holes,W/2-.05,2.1,L/2);ph.rotation.y=-Math.PI/2}
        if(p.bells){// A board of servants' bells above the middle door, one to a room.
          const board=box(.05,.5,2.2,MAT.darkWood,W/2-.04,3.55,L/2);const bell=own(new THREE.SphereGeometry(.07,10,8,0,Math.PI*2,0,Math.PI/2));for(let i=0;i<6;i++){const b=add(bell,MAT.brass,W/2-.12,3.42,L/2-.9+i*.36);b.rotation.x=Math.PI}
          mark(board,{type:'passage-card',title:'A bell board',author:'A row of bells on coiled springs, one to each room the passage serves, with the rooms’ names painted out. None of them rings now.',action:'READ'})}
      }
      // Sconces down both walls: a brass plate and a glowing candle, no light of their own.
      const flame=own(new THREE.MeshStandardMaterial({color:0xffe0a8,emissive:0xffb35c,emissiveIntensity:1.8})),flameGeo=own(new THREE.SphereGeometry(.06,8,6)),plateGeo=own(new THREE.BoxGeometry(.04,.32,.18));
      for(let z=2.5,i=0;z<L-1.5;z+=4.5,i++){const sx=i%2?1:-1,y=floorY(p,z)+2.25;add(plateGeo,MAT.brass,sx*(W/2-.02),y,z);add(flameGeo,flame,sx*(W/2-.16),y+.18,z)}
      // The pictures: prints in dark frames, and windows onto the night.
      const frameGeo=own(new THREE.BoxGeometry(.05,1.02,.84)),printGeo=own(new THREE.PlaneGeometry(.68,.86));
      for(const pr of p.prints||[]){const y=floorY(p,pr.at)+1.85,x=pr.side*(W/2-.03);add(frameGeo,MAT.darkWood,x,y,pr.at);
        const pic=add(printGeo,own(new THREE.MeshStandardMaterial({map:own(printTexture(pr.motif)),roughness:.85})),x-pr.side*.03,y,pr.at);pic.rotation.y=-pr.side*Math.PI/2;
        mark(pic,{type:'passage-card',title:pr.title,author:pr.text,action:'LOOK'})}
      (p.windows||[]).forEach((win,i)=>{const y=floorY(p,win.at)+2.05,x=win.side*(W/2-.02);box(.08,1.75,1.2,MAT.darkWood,x,y,win.at);
        const glass=add(own(new THREE.PlaneGeometry(1.0,1.55)),own(new THREE.MeshStandardMaterial({map:own(viewTexture(win.scene,index*7+i+1)),emissive:0xffffff,emissiveMap:null,emissiveIntensity:0,roughness:.3})),x-win.side*.05,y,win.at);
        glass.material.emissiveMap=glass.material.map;glass.material.emissiveIntensity=.55;glass.rotation.y=-win.side*Math.PI/2;
        box(.1,1.6,.05,MAT.darkWood,x-win.side*.02,y,win.at);box(.1,.05,1.05,MAT.darkWood,x-win.side*.02,y,win.at);box(.3,.06,1.3,MAT.darkWood,x-win.side*.12,y-.88,win.at);
        mark(glass,{type:'passage-card',title:'A window',author:{storm:'Rain on the glass, a sea running high under the moon, and a light far out on the point.',garden:'A walled garden under the moon, its paths pale between the dark beds.',town:'Roofs and chimneys under the stars, and here and there a lit window where someone else is still up reading.'}[win.scene],action:'LOOK'})});
      if(p.candle){const y=floorY(p,p.candle.at)+1.2,x=p.candle.side*(W/2-.12);box(.24,.06,.4,MAT.stone||wall,x,y,p.candle.at);box(.05,.16,.05,own(new THREE.MeshStandardMaterial({color:0xeee4cc,roughness:.8})),x,y+.11,p.candle.at);add(flameGeo,flame,x,y+.24,p.candle.at)}
      // The name, by each door.
      const signMat=own(new THREE.MeshStandardMaterial({map:own(signTexture(p.name.toUpperCase(),'')),roughness:.6,emissive:0x2a1a0c,emissiveIntensity:.4})),signGeo=own(new THREE.PlaneGeometry(1.5,.3));
      for(const [z,yaw] of [[.13,0],[L-.13,Math.PI]]){const s=add(signGeo,signMat,0,floorY(p,z)+3.62,z);s.rotation.y=yaw}
      // The doors out, each named for the room beyond.
      const doors=p.ends.map((end,i)=>{const d=passageDoor(p,i),data={type:'passage-exit',passage:p.key,end:i,title:TITLES[end.room],author:`Through to ${TITLES[end.room]}.`,action:'ENTER'};
        if(!doorKit?.hang(root,{data,mark,x:d.lx,y:d.y,z:d.lz,yaw:d.yaw,label:end.label,...DOOR,...p.look}))mark(box(DOOR.width,DOOR.height,.12,trim,d.lx,d.y+DOOR.height/2,d.lz),data);return data});
      scene.add(root);
      const state={root,owned,ours,blockers,doors,last:time};built.set(p.key,state);return state;
    }
    // The module's one lamp goes to the passage the reader is in: hung in the middle, near the ceiling.
    function hangLamp(p,state){if(!lamp)lamp=new THREE.PointLight(0xffd2a0,9,26,2);delete lamp.userData.freed;lamp.position.set(0,floorY(p,p.length/2)+3.2,p.length/2);state.root.add(lamp)}
    function free(p){
      const state=built.get(p.key);if(!state)return;built.delete(p.key);
      if(lamp?.parent===state.root)state.root.remove(lamp);
      state.root.removeFromParent();for(let i=interactables.length-1;i>=0;i--)if(state.ours.includes(interactables[i]))interactables.splice(i,1);
      for(const thing of state.owned)thing.dispose?.();
    }

    // ---------- the doors in the rooms ----------
    // Built only while the room is, and taken down with it: a room that is not built costs nothing.
    const roomDoors=[];for(const p of PASSAGES)p.ends.forEach((end,i)=>roomDoors.push({p,end,i,group:null,hits:[]}));
    function hangRoomDoor(rd){
      const at=roomDoor(rd.end);if(!at)return;const g=new THREE.Group();g.name='passage-door-'+rd.p.key;g.position.set(at.x,0,at.z);g.rotation.y=at.yaw;scene.add(g);rd.group=g;rd.hits=[];
      const data={type:'passage-door',passage:rd.p.key,end:rd.i,title:rd.p.name,author:`A back way to ${rd.p.ends.filter((e,k)=>k!==rd.i).map(e=>TITLES[e.room]).join(' and ')}.`,action:'ENTER'};
      const mark=(object,d)=>{object.userData=d;interactables.push(object);rd.hits.push(object);return object};
      if(!doorKit?.hang(g,{data,mark,label:rd.p.name.toUpperCase().replace('THE ',''),...DOOR,...rd.p.look})){const m=new THREE.Mesh(new THREE.BoxGeometry(DOOR.width,DOOR.height,.12),MAT.darkWood);m.position.set(0,DOOR.height/2,.08);g.add(m);mark(m,data)}
    }
    function takeDownRoomDoor(rd){if(!rd.group)return;rd.group.removeFromParent();for(const hit of rd.hits){const k=interactables.indexOf(hit);if(k>=0)interactables.splice(k,1)}rd.group=null;rd.hits=[]}

    // ---------- going through ----------
    const through=(data,go)=>doorKit&&data.kit?doorKit.pass(data.kit,data,go):go();
    function enterPassage(p,i){
      const state=build(p);state.last=time;hangLamp(p,state);const d=passageDoor(p,i);move(d.out.x,d.out.z,d.out.yaw,d.out.y);playSample?.('doorOpen',.7,1.05);
      const others=p.ends.filter((e,k)=>k!==i).map(e=>TITLES[e.room]);
      showNotice(`${p.name}: ${p.kind==='stair'?(floorY(p,i===0?0:p.length)>floorY(p,i===0?p.length:0)?'down':'up'):'through'} to ${others.join(', or ')}.`,6);
      if(!found.has(p.key)){found.add(p.key);try{storage?.setItem(FOUND_KEY,JSON.stringify([...found]))}catch(e){}}
      analytics?.track('Room Explored',{room:p.key});
    }
    function leavePassage(p,i){
      const end=p.ends[i],room=rooms[end.room],at=roomDoor(end);if(!room||!at)return;room.activate?.();
      move(at.out.x,at.out.z,at.out.yaw,0);playSample?.('doorOpen',.7,1);showNotice(`${TITLES[end.room]}.`,3);
    }
    function interact(object){
      const data=object?.userData;if(!data||typeof data.type!=='string'||!data.type.startsWith('passage-'))return false;
      const p=PASSAGES.find(x=>x.key===data.passage);
      if(data.type==='passage-door'&&p){through(data,()=>enterPassage(p,data.end));return true}
      if(data.type==='passage-exit'&&p){through(data,()=>leavePassage(p,data.end));return true}
      if(data.type==='passage-card'){showNotice(`${data.title}: ${data.author}`,9);return true}
      return false;
    }

    // ---------- every frame ----------
    function update(t){
      time=t;const here=passageAt(player.pos.x,player.pos.z);
      for(const p of PASSAGES){const state=built.get(p.key);if(!state)continue;if(here?.p===p)state.last=t;else if(t-state.last>KEEP)free(p)}
      for(const rd of roomDoors){const up=!!rooms[rd.end.room]?.built;if(up&&!rd.group)hangRoomDoor(rd);else if(!up&&rd.group)takeDownRoomDoor(rd)}
    }
    return {contains,floorAt,allowed,interact,update,passages:PASSAGES,roomDoor,passageDoor,floorY,enterPassage,leavePassage,free,
      get built(){return [...built.keys()]},get found(){return [...found]},get roomDoors(){return roomDoors},zoneAt:(x,z)=>passageAt(x,z)?.p.key||null};
  };
})();
