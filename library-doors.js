// A shared kit of detailed library doors. Every door is modelled rather than a flat slab:
// raised and bevelled panels in the Poly Haven walnut veneer, a moulded architrave with plinth
// blocks and cornice, a glowing fanlight, brass furniture, and a leaf that swings on its hinges
// before the reader passes through. Four styles keep each part of the library distinct:
//   walnut    - the library's own panelled doors
//   painted   - the lighter doors back from the themed rooms
//   iron      - riveted fire doors in the service spaces and repository
//   forbidden - studded, strapped and chained, for the restricted collections
// Rooms behind doors dress their own doors from the kit too: `color` paints the leaf (or is its material), `frame` and `trim` change the
// surround and the fittings, `fanColor` tints the fanlight, `glazed` puts glass in the upper panels and `planked`
// swaps the panels for boards, and `gilt` ({title,sub}) glazes the upper half with the room's name in gold leaf. Geometry and materials are shared between doors, so a room rebuilt on every visit
// costs nothing new, and a door whose room has been freed drops out of the kit on its own.
(function(){
  'use strict';

  window.createDoorKit=function({THREE,MAT,canvasTexture}){
    const TAU=Math.PI*2,doors=[];
    const mat={
      walnut:MAT.darkWood,
      // A warmer, lighter walnut for the reading-room doors, so they stand out from the dark dado behind them.
      readingWalnut:new THREE.MeshStandardMaterial({color:0x5a3620,roughness:.55,metalness:.02,map:MAT.darkWood.map||null}),
      painted:new THREE.MeshStandardMaterial({color:0x1d332d,roughness:.5,metalness:.05}),
      iron:new THREE.MeshStandardMaterial({color:0x2b3133,roughness:.5,metalness:.7}),
      forbidden:new THREE.MeshStandardMaterial({color:0x2a1a12,roughness:.85,map:MAT.darkWood.map||null}),
      frame:MAT.wood2||MAT.darkWood,
      brass:MAT.brass,
      iron2:new THREE.MeshStandardMaterial({color:0x151819,roughness:.45,metalness:.8}),
      fan:new THREE.MeshStandardMaterial({color:0xffd9a0,emissive:0xffb35c,emissiveIntensity:1.25,roughness:.3,transparent:true,opacity:.92}),
      beyond:new THREE.MeshBasicMaterial({color:0x2a1608})
    };
    const add=(parent,geometry,material,x,y,z)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m};
    const shared=new Map(),keep=(key,make)=>{if(!shared.has(key))shared.set(key,make());return shared.get(key)};
    const box=(parent,w,h,d,material,x,y,z)=>add(parent,keep(`box${w.toFixed(3)},${h.toFixed(3)},${d.toFixed(3)}`,()=>new THREE.BoxGeometry(w,h,d)),material,x,y,z);
    // A painted leaf, a fanlight tint: one material per colour, however many doors share it.
    const paint=color=>keep('paint'+color,()=>new THREE.MeshStandardMaterial({color,roughness:.55,metalness:.04}));
    const fanGlass=color=>keep('fan'+color,()=>new THREE.MeshStandardMaterial({color:0x3a2614,emissive:color,emissiveIntensity:1.05,roughness:.3,transparent:true,opacity:.92}));
    const paneGlass=color=>keep('pane'+color,()=>new THREE.MeshStandardMaterial({color:0x2a1c10,emissive:color,emissiveIntensity:.62,roughness:.2,metalness:.1}));

    // A raised, bevelled panel: the moulding that makes a Victorian door read at a glance.
    const panelCache=new Map();
    function panelGeometry(w,h){const key=w.toFixed(2)+'x'+h.toFixed(2);if(panelCache.has(key))return panelCache.get(key);const s=new THREE.Shape(),r=Math.min(w,h)*.08;s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);const g=new THREE.ExtrudeGeometry(s,{depth:.03,bevelEnabled:true,bevelThickness:.035,bevelSize:.05,bevelSegments:2,curveSegments:4});panelCache.set(key,g);return g}

    function plateTexture(text){return keep('plate'+text,()=>canvasTexture((c,w,h)=>{c.fillStyle='#caa15a';c.fillRect(0,0,w,h);c.strokeStyle='#6b4d22';c.lineWidth=5;c.strokeRect(6,6,w-12,h-12);c.fillStyle='#2b1d0e';c.textAlign='center';c.textBaseline='middle';let size=34;c.font=`bold ${size}px Georgia`;while(c.measureText(text).width>w-30&&size>14){size-=2;c.font=`bold ${size}px Georgia`}c.fillText(text,w/2,h/2+2)},512,96))}

    // Gilt lettering on a glazed reading-room door: gold-leaf capitals with a fine rule, on glass lit warm from the room
    // beyond, as on the doors of the old institutional reading rooms. One texture per name, shared by every door using it.
    function giltTexture(title,sub){return keep('gilt'+title+'|'+sub,()=>canvasTexture((c,w,h)=>{
      const g=c.createRadialGradient(w/2,h*.55,10,w/2,h*.55,w*.7);g.addColorStop(0,'#8a5a26');g.addColorStop(.55,'#4a2c12');g.addColorStop(1,'#1c1008');c.fillStyle=g;c.fillRect(0,0,w,h);
      c.fillStyle='rgba(255,230,180,.05)';c.beginPath();c.moveTo(w*.08,0);c.lineTo(w*.3,0);c.lineTo(w*.12,h);c.lineTo(0,h);c.closePath();c.fill();// a sheen across the glass
      const gold=c.createLinearGradient(0,h*.25,0,h*.75);gold.addColorStop(0,'#f7df9a');gold.addColorStop(.5,'#c9953d');gold.addColorStop(1,'#f0cf7a');
      c.textAlign='center';c.textBaseline='middle';const lines=String(title).split('\n'),fit=(text,size,style)=>{do{c.font=`${style} ${size}px Georgia`;size-=2}while(c.measureText(text).width>w*.84&&size>12);return size+2};
      const size=Math.min(...lines.map(l=>fit(l,Math.round(h*(lines.length>1?.17:.2)),'bold'))),lineH=size*1.15,top=h*(sub?.44:.5)-(lines.length-1)*lineH/2;
      c.lineWidth=Math.max(2,size*.08);c.strokeStyle='#2a1706';
      lines.forEach((l,i)=>{c.font=`bold ${size}px Georgia`;c.strokeText(l,w/2,top+i*lineH);c.fillStyle=gold;c.fillText(l,w/2,top+i*lineH)});
      const ruleY=top+(lines.length-1)*lineH+size*.78;c.fillStyle=gold;c.fillRect(w*.3,ruleY,w*.4,Math.max(2,h*.008));c.beginPath();c.arc(w/2,ruleY+1,h*.014,0,7);c.fill();
      if(sub){const s2=fit(sub,Math.round(h*.085),'italic');c.font=`italic ${s2}px Georgia`;c.fillStyle='#e9c77e';c.fillText(sub,w/2,ruleY+h*.1)}
      c.strokeStyle='rgba(240,200,120,.55)';c.lineWidth=3;c.strokeRect(w*.04,h*.05,w*.92,h*.9)},512,448))}

    // A painted passage beyond every door: a lamplit corridor receding to a warm glow.
    let passageTexture=null;
    function passageMap(){if(passageTexture)return passageTexture;passageTexture=canvasTexture((c,w,h)=>{const vx=w/2,vy=h*.52;c.fillStyle='#120a06';c.fillRect(0,0,w,h);const wall=(pts,col)=>{c.fillStyle=col;c.beginPath();c.moveTo(...pts[0]);for(const p of pts.slice(1))c.lineTo(...p);c.closePath();c.fill()};const ix=w*.36,iy=h*.3,iw=w*.28,ih=h*.4;wall([[0,0],[ix,iy],[ix,iy+ih],[0,h]],'#2a170d');wall([[w,0],[ix+iw,iy],[ix+iw,iy+ih],[w,h]],'#24140b');wall([[0,h],[ix,iy+ih],[ix+iw,iy+ih],[w,h]],'#3b2414');wall([[0,0],[ix,iy],[ix+iw,iy],[w,0]],'#170d07');const g=c.createRadialGradient(vx,vy,4,vx,vy,w*.5);g.addColorStop(0,'rgba(255,200,120,.95)');g.addColorStop(.25,'rgba(230,150,70,.45)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,w,h);c.fillStyle='rgba(255,214,150,.9)';c.fillRect(ix+iw*.3,iy+ih*.12,iw*.4,ih*.7);c.strokeStyle='rgba(120,80,40,.5)';c.lineWidth=2;for(let i=1;i<7;i++){const t=i/7;c.beginPath();c.moveTo(t*ix,h-t*(h-iy-ih));c.lineTo(w-t*(w-ix-iw),h-t*(h-iy-ih));c.stroke()}},256,384);return passageTexture}
    // Stencil portal: the visible part of the doorway is marked first, then the passage is drawn into it
    // regardless of any wall behind the door, so an opening never reveals brick. Parts drawn after it
    // (the swinging leaf) keep their normal depth.
    function makePortal(parent,geometry,z){const mask=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:false,stencilWrite:true,stencilRef:1,stencilFunc:THREE.AlwaysStencilFunc,stencilZPass:THREE.ReplaceStencilOp})),view=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({map:passageMap(),depthTest:false,depthWrite:false,stencilWrite:true,stencilRef:1,stencilFunc:THREE.EqualStencilFunc,stencilZPass:THREE.KeepStencilOp,stencilWriteMask:0,fog:false}));mask.renderOrder=1000;view.renderOrder=1001;mask.position.z=z;view.position.z=z;mask.visible=view.visible=false;parent.add(mask,view);return {mask,view,set(open){mask.visible=view.visible=open}}}
    // Anything that must stay in front of the passage (a moving leaf) is drawn after it.
    function drawAfterPortal(object){object.traverse(o=>{if(o.isMesh)o.renderOrder=1002})}

    // Builds a door facing +z with its threshold at y=0. Returns handles for animation.
    function build(parent,{style='walnut',width=2.2,height=3.6,label='',glow=true,fanlight:hasFan=true,color=null,frame=null,trim:trimOption=null,fanColor=null,glazed=false,planked=false,plain=false,cornice=true,pediment=null,gilt=null}={}){
      const group=new THREE.Group();parent.add(group);const fanlight=hasFan;
      const leafMaterial=color?.isMaterial?color:color!=null?paint(color):gilt?mat.readingWalnut:mat[style]||mat.walnut,trim=trimOption||(style==='forbidden'?mat.iron2:mat.brass),frameMat=frame||(style==='iron'?mat.iron2:mat.frame);
      const hasPediment=cornice&&(pediment??(style==='walnut'||style==='painted')),glass=fanColor!=null?fanGlass(fanColor):mat.fan,paneMaterial=fanColor!=null?paneGlass(fanColor):mat.fan;
      // What lies beyond: a warm, dim opening revealed as the leaf swings.
      const portalGeometry=new THREE.PlaneGeometry(width-.02,height-.02);portalGeometry.translate(0,height/2,0);const portal=makePortal(group,portalGeometry,.11);
      // Architrave with plinth blocks, cornice and (for walnut) a small pediment.
      for(const side of [-1,1]){box(group,.22,height+.1,.16,frameMat,side*(width/2+.11),height/2+.05,.04);box(group,.3,.46,.2,frameMat,side*(width/2+.11),.23,.06);box(group,.07,height-.3,.04,frameMat,side*(width/2+.03),height/2+.1,.13)}
      const topY=height+(fanlight?width*.36:0);
      if(cornice){box(group,width+.62,.18,.26,frameMat,0,topY+.12,.08);box(group,width+.8,.08,.34,frameMat,0,topY+.25,.1)}
      if(hasPediment){const ped=new THREE.Shape();ped.moveTo(-width/2-.4,0);ped.lineTo(0,.42);ped.lineTo(width/2+.4,0);ped.lineTo(-width/2-.4,0);const p=add(group,new THREE.ExtrudeGeometry(ped,{depth:.14,bevelEnabled:false}),frameMat,0,topY+.29,.03);const orn=add(group,new THREE.TorusGeometry(.12,.03,6,16),trim,0,topY+.46,.2)}
      // Semicircular fanlight with radiating glazing bars, lit from the room beyond.
      let fan=null;if(fanlight){fan=add(group,keep('fan'+width.toFixed(3),()=>new THREE.CircleGeometry(width/2-.05,32,0,Math.PI)),glass.clone(),0,height,.02);fan.scale.y=.72;for(let i=1;i<6;i++){const a=i/6*Math.PI,bar=box(group,.035,(width/2)*.72,.03,frameMat,Math.cos(a)*width*.18,height+Math.sin(a)*width*.13,.05);bar.rotation.z=a-Math.PI/2}box(group,width,.08,.08,frameMat,0,height+.02,.06)}
      // The hinged leaf.
      const pivot=new THREE.Group();pivot.position.set(-width/2,0,.02);group.add(pivot);const leaf=new THREE.Group();leaf.position.x=width/2;pivot.add(leaf);
      const slab=box(leaf,width-.04,height-.04,.1,leafMaterial,0,height/2,0);const hits=[slab],panes=[];
      if(style==='iron'){for(const y of [.5,height-.5])box(leaf,width-.1,.12,.05,mat.iron2,0,y,.07);for(let i=0;i<14;i++){const y=.25+(i%7)*(height-.5)/6,x=i<7?-width/2+.14:width/2-.14;add(leaf,new THREE.SphereGeometry(.035,6,4),trim,x,y,.07)}const port=add(leaf,new THREE.CircleGeometry(.22,20),mat.fan,0,height*.68,.06);add(leaf,new THREE.TorusGeometry(.23,.035,6,20),trim,0,height*.68,.07);const bar=box(leaf,.5,.07,.08,trim,width/2-.45,height*.45,.1);box(leaf,.8,.26,.02,new THREE.MeshStandardMaterial({color:0x9a2a1e,roughness:.6}),0,height*.3,.06)}
      else if(style==='forbidden'){for(let i=0;i<6;i++)box(leaf,.02,height-.1,.105,MAT.black||mat.iron2,-width/2+(i+.5)*width/6,height/2,.01);for(const y of [.55,height/2,height-.55]){box(leaf,width-.08,.14,.05,mat.iron2,0,y,.07);for(let i=0;i<7;i++)add(leaf,new THREE.SphereGeometry(.04,6,4),mat.iron2,-width/2+.2+i*(width-.4)/6,y,.1)}const ring=add(leaf,new THREE.TorusGeometry(.13,.025,6,16),mat.iron2,width/2-.38,height*.47,.12);for(let i=0;i<5;i++){const link=add(leaf,new THREE.TorusGeometry(.05,.012,5,10),mat.iron2,width/2-.38+i*.06,height*.47-.18-i*.07,.13);link.rotation.y=i%2?Math.PI/2:0}}
      else if(plain){}
      else if(planked){// Boards, grooved on both faces, with a ledge across top and bottom.
        const boards=7,bw=(width-.04)/boards;for(let i=1;i<boards;i++)for(const z of [-.051,.051])box(leaf,.025,height-.1,.012,MAT.black||mat.iron2,-width/2+.02+i*bw,height/2,z);
        for(const y of [.45,height-.45])for(const z of [-.07,.07])box(leaf,width-.14,.2,.04,leafMaterial,0,y,z)}
      else{const cols=2,rows=3,pw=(width-.5)/cols,rowsH=(gilt?[.27,.2,.39]:[.3,.22,.34]).map(f=>f*(height-.45));let y=.2;for(let r=0;r<rows;r++){const ph=rowsH[r]-.16;for(let c=0;c<cols;c++){const x=-width/2+.25+pw*(c+.5);if(gilt&&r===rows-1){if(c)continue;const gw=width-.5-.12,pane=box(leaf,gw,ph+.04,.115,keep('giltMat'+gilt.title+'|'+(gilt.sub||''),()=>new THREE.MeshStandardMaterial({map:giltTexture(gilt.title,gilt.sub||''),emissive:0xffffff,emissiveMap:giltTexture(gilt.title,gilt.sub||''),emissiveIntensity:.5,roughness:.6,metalness:0,envMapIntensity:.2})),0,y+ph/2+.08,0);hits.push(pane);panes.push(pane);for(const z of [-.062,.062]){box(leaf,gw+.04,.04,.02,frameMat,0,y+ph+.1,z);box(leaf,gw+.04,.04,.02,frameMat,0,y+.06,z)}continue}
            if(glazed&&r===rows-1){const pane=box(leaf,pw-.12,ph+.04,.115,paneMaterial,x,y+ph/2+.08,0);hits.push(pane);panes.push(pane);for(const z of [-.062,.062]){box(leaf,.03,ph,.02,frameMat,x,y+ph/2+.08,z);box(leaf,pw-.14,.03,.02,frameMat,x,y+ph/2+.08,z)}continue}const p=add(leaf,panelGeometry(pw-.16,ph),leafMaterial,x,y+ph/2+.08,.05);hits.push(p)}y+=rowsH[r]}
        if(style==='painted')box(leaf,.5,.13,.03,trim,0,height*.53,.1);
        // The same panels on the far face, so the door looks right from either room.
        y=.2;for(let r=0;r<rows;r++){const ph=rowsH[r]-.16;for(let c=0;c<cols;c++){if((glazed||gilt)&&r===rows-1)continue;const x=-width/2+.25+pw*(c+.5);const p=add(leaf,panelGeometry(pw-.16,ph),leafMaterial,x,y+ph/2+.08,-.05);p.rotation.y=Math.PI}y+=rowsH[r]}}
      // Brass furniture: knob on its rose, keyhole escutcheon, hinges and a kick plate.
      const knobX=width/2-.24,knobY=Math.min(1.05,height*.3);if(style!=='iron')add(leaf,new THREE.SphereGeometry(.07,14,10),trim,knobX,knobY,-.14);if(style!=='iron'){add(leaf,new THREE.CylinderGeometry(.075,.075,.02,16),trim,knobX,knobY,.07).rotation.x=Math.PI/2;add(leaf,new THREE.SphereGeometry(.07,14,10),trim,knobX,knobY,.14);const esc=box(leaf,.06,.14,.02,trim,knobX,knobY-.2,.07);box(leaf,.022,.06,.022,MAT.black||mat.iron2,knobX,knobY-.21,.08)}
      for(const y of [.35,height/2,height-.35])box(leaf,.06,.24,.12,trim,-width/2+.03,y,.02);
      if((style==='walnut'||style==='painted')&&!planked&&!plain)box(leaf,width-.12,.18,.015,trim,0,.12,.06);
      if(label&&!gilt){const plate=add(leaf,new THREE.PlaneGeometry(.9,.17),keep('plateMat'+label,()=>new THREE.MeshStandardMaterial({map:plateTexture(label),metalness:.6,roughness:.35})),0,glazed?height-.36:planked?height*.52:height*.75+(style==='iron'?.05:0),style==='iron'||planked?.105:.125);hits.push(plate)}
      // Light spilling through the opening once the leaf moves.
      const spill=glow?new THREE.PointLight(0xffc27a,0,7,2):null;if(spill){spill.position.set(0,height*.55,-.8);group.add(spill)}
      drawAfterPortal(leaf);const door={group,pivot,leaf,hits,panes,fan,spill,portal,open:0,target:0,onOpened:null,swing:style==='iron'?-1.25:-1.45};
      doors.push(door);return door;
    }
    // Swing a door open, call back once the reader can pass, then let it settle shut again.
    function open(door,onOpened,hold=.6){if(!doors.includes(door))doors.push(door);door.target=1;door.onOpened=onOpened;door.hold=hold;door.elapsed=0}
    // A door for a room behind a door: placed, every part pointing at `data` (through the room's own `mark`), and
    // no light of its own. Anything added to the leaf afterwards goes through drawAfterPortal(door.leaf).
    function hang(parent,{data,mark,x=0,y=0,z=0,yaw=0,glow=false,...options}){const door=build(parent,{...options,glow});door.group.position.set(x,y,z);door.group.rotation.y=yaw;for(const hit of door.hits)mark(hit,data);if(door.fan)mark(door.fan,data);data.kit=door;return door}
    // A room's door: swing it, then let the reader through once, however often they press.
    function pass(door,data,onOpened){if(!door){onOpened();return}if(data.opening)return;data.opening=true;open(door,()=>{data.opening=false;onOpened()})}
    // Doors built inside a room are dropped from the kit once the room has been freed.
    const attached=object=>{for(let depth=0;object.parent&&depth<24;depth++)object=object.parent;return object.isScene===true};let pruneIn=4;
    function update(dt){pruneIn-=dt;if(pruneIn<0){pruneIn=4;for(let i=doors.length-1;i>=0;i--){const d=doors[i];if(attached(d.group))d.placed=true;else if(d.placed)doors.splice(i,1)}}for(const d of doors){if(d.target===0&&d.open===0)continue;d.elapsed=(d.elapsed||0)+dt;const goal=d.target;d.open+=Math.sign(goal-d.open)*Math.min(Math.abs(goal-d.open),dt*2.2);const e=d.open*d.open*(3-2*d.open);d.pivot.rotation.y=d.swing*e;d.portal.set(d.open>.01);if(d.spill)d.spill.intensity=e*7;if(d.fan)d.fan.material.emissiveIntensity=1.25+e*.8;if(d.target===1&&d.elapsed>=d.hold&&d.onOpened){const cb=d.onOpened;d.onOpened=null;cb()}if(d.target===1&&d.elapsed>d.hold+.9)d.target=0}}
    // The Grand Hall's side of a room behind a door: the library's own walnut, with the room's name gilded on the glass,
    // so the hall reads as one library rather than a street of front doors. (The room's side keeps its own colours.)
    const readingRoom=(title,sub='')=>({style:'walnut',color:null,frame:null,fanColor:null,fanlight:false,pediment:false,glazed:false,planked:false,plain:false,gilt:{title,sub},width:1.9,height:3.1});
    return {build,hang,open,pass,update,doors,makePortal,drawAfterPortal,paint,readingRoom};
  };
})();
