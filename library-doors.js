// A shared kit of detailed library doors. Every door is modelled rather than a flat slab:
// raised and bevelled panels in the Poly Haven walnut veneer, a moulded architrave with plinth
// blocks and cornice, a glowing fanlight, brass furniture, and a leaf that swings on its hinges
// before the reader passes through. Four styles keep each part of the library distinct:
//   walnut    - the library's own panelled doors
//   painted   - the lighter doors back from the themed rooms
//   iron      - riveted fire doors in the service spaces and repository
//   forbidden - studded, strapped and chained, for the restricted collections
(function(){
  'use strict';

  window.createDoorKit=function({THREE,MAT,canvasTexture}){
    const TAU=Math.PI*2,doors=[];
    const mat={
      walnut:MAT.darkWood,
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
    const box=(parent,w,h,d,material,x,y,z)=>add(parent,new THREE.BoxGeometry(w,h,d),material,x,y,z);

    // A raised, bevelled panel: the moulding that makes a Victorian door read at a glance.
    const panelCache=new Map();
    function panelGeometry(w,h){const key=w.toFixed(2)+'x'+h.toFixed(2);if(panelCache.has(key))return panelCache.get(key);const s=new THREE.Shape(),r=Math.min(w,h)*.08;s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);const g=new THREE.ExtrudeGeometry(s,{depth:.03,bevelEnabled:true,bevelThickness:.035,bevelSize:.05,bevelSegments:2,curveSegments:4});panelCache.set(key,g);return g}

    function plateTexture(text){return canvasTexture((c,w,h)=>{c.fillStyle='#caa15a';c.fillRect(0,0,w,h);c.strokeStyle='#6b4d22';c.lineWidth=5;c.strokeRect(6,6,w-12,h-12);c.fillStyle='#2b1d0e';c.textAlign='center';c.textBaseline='middle';let size=34;c.font=`bold ${size}px Georgia`;while(c.measureText(text).width>w-30&&size>14){size-=2;c.font=`bold ${size}px Georgia`}c.fillText(text,w/2,h/2+2)},512,96)}

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
    function build(parent,{style='walnut',width=2.2,height=3.6,label='',glow=true,fanlight=true}={}){
      const group=new THREE.Group();parent.add(group);
      const leafMaterial=mat[style]||mat.walnut,trim=style==='forbidden'?mat.iron2:mat.brass,frameMat=style==='iron'?mat.iron2:mat.frame;
      // What lies beyond: a warm, dim opening revealed as the leaf swings.
      const portalGeometry=new THREE.PlaneGeometry(width-.02,height-.02);portalGeometry.translate(0,height/2,0);const portal=makePortal(group,portalGeometry,.11);
      // Architrave with plinth blocks, cornice and (for walnut) a small pediment.
      for(const side of [-1,1]){box(group,.22,height+.1,.16,frameMat,side*(width/2+.11),height/2+.05,.04);box(group,.3,.46,.2,frameMat,side*(width/2+.11),.23,.06);box(group,.07,height-.3,.04,frameMat,side*(width/2+.03),height/2+.1,.13)}
      const topY=height+(fanlight?width*.36:0);
      box(group,width+.62,.18,.26,frameMat,0,topY+.12,.08);box(group,width+.8,.08,.34,frameMat,0,topY+.25,.1);
      if(style==='walnut'||style==='painted'){const ped=new THREE.Shape();ped.moveTo(-width/2-.4,0);ped.lineTo(0,.42);ped.lineTo(width/2+.4,0);ped.lineTo(-width/2-.4,0);const p=add(group,new THREE.ExtrudeGeometry(ped,{depth:.14,bevelEnabled:false}),frameMat,0,topY+.29,.03);const orn=add(group,new THREE.TorusGeometry(.12,.03,6,16),trim,0,topY+.46,.2)}
      // Semicircular fanlight with radiating glazing bars, lit from the room beyond.
      let fan=null;if(fanlight){fan=add(group,new THREE.CircleGeometry(width/2-.05,32,0,Math.PI),mat.fan.clone(),0,height,.02);fan.scale.y=.72;for(let i=1;i<6;i++){const a=i/6*Math.PI,bar=box(group,.035,(width/2)*.72,.03,frameMat,Math.cos(a)*width*.18,height+Math.sin(a)*width*.13,.05);bar.rotation.z=a-Math.PI/2}box(group,width,.08,.08,frameMat,0,height+.02,.06)}
      // The hinged leaf.
      const pivot=new THREE.Group();pivot.position.set(-width/2,0,.02);group.add(pivot);const leaf=new THREE.Group();leaf.position.x=width/2;pivot.add(leaf);
      const slab=box(leaf,width-.04,height-.04,.1,leafMaterial,0,height/2,0);const hits=[slab];
      if(style==='iron'){for(const y of [.5,height-.5])box(leaf,width-.1,.12,.05,mat.iron2,0,y,.07);for(let i=0;i<14;i++){const y=.25+(i%7)*(height-.5)/6,x=i<7?-width/2+.14:width/2-.14;add(leaf,new THREE.SphereGeometry(.035,6,4),trim,x,y,.07)}const port=add(leaf,new THREE.CircleGeometry(.22,20),mat.fan,0,height*.68,.06);add(leaf,new THREE.TorusGeometry(.23,.035,6,20),trim,0,height*.68,.07);const bar=box(leaf,.5,.07,.08,trim,width/2-.45,height*.45,.1);box(leaf,.8,.26,.02,new THREE.MeshStandardMaterial({color:0x9a2a1e,roughness:.6}),0,height*.3,.06)}
      else if(style==='forbidden'){for(let i=0;i<6;i++)box(leaf,.02,height-.1,.105,MAT.black||mat.iron2,-width/2+(i+.5)*width/6,height/2,.01);for(const y of [.55,height/2,height-.55]){box(leaf,width-.08,.14,.05,mat.iron2,0,y,.07);for(let i=0;i<7;i++)add(leaf,new THREE.SphereGeometry(.04,6,4),mat.iron2,-width/2+.2+i*(width-.4)/6,y,.1)}const ring=add(leaf,new THREE.TorusGeometry(.13,.025,6,16),mat.iron2,width/2-.38,height*.47,.12);for(let i=0;i<5;i++){const link=add(leaf,new THREE.TorusGeometry(.05,.012,5,10),mat.iron2,width/2-.38+i*.06,height*.47-.18-i*.07,.13);link.rotation.y=i%2?Math.PI/2:0}}
      else{const cols=2,rows=3,pw=(width-.5)/cols,rowsH=[.3,.22,.34].map(f=>f*(height-.45));let y=.2;for(let r=0;r<rows;r++){const ph=rowsH[r]-.16;for(let c=0;c<cols;c++){const x=-width/2+.25+pw*(c+.5);const p=add(leaf,panelGeometry(pw-.16,ph),leafMaterial,x,y+ph/2+.08,.05);hits.push(p)}y+=rowsH[r]}
        if(style==='painted')box(leaf,.5,.13,.03,trim,0,height*.53,.1);
        // The same panels on the far face, so the door looks right from either room.
        y=.2;for(let r=0;r<rows;r++){const ph=rowsH[r]-.16;for(let c=0;c<cols;c++){const x=-width/2+.25+pw*(c+.5);const p=add(leaf,panelGeometry(pw-.16,ph),leafMaterial,x,y+ph/2+.08,-.05);p.rotation.y=Math.PI}y+=rowsH[r]}}
      // Brass furniture: knob on its rose, keyhole escutcheon, hinges and a kick plate.
      const knobX=width/2-.24,knobY=Math.min(1.05,height*.3);if(style!=='iron')add(leaf,new THREE.SphereGeometry(.07,14,10),trim,knobX,knobY,-.14);if(style!=='iron'){add(leaf,new THREE.CylinderGeometry(.075,.075,.02,16),trim,knobX,knobY,.07).rotation.x=Math.PI/2;add(leaf,new THREE.SphereGeometry(.07,14,10),trim,knobX,knobY,.14);const esc=box(leaf,.06,.14,.02,trim,knobX,knobY-.2,.07);box(leaf,.022,.06,.022,MAT.black||mat.iron2,knobX,knobY-.21,.08)}
      for(const y of [.35,height/2,height-.35])box(leaf,.06,.24,.12,trim,-width/2+.03,y,.02);
      if(style==='walnut'||style==='painted')box(leaf,width-.12,.18,.015,trim,0,.12,.06);
      if(label){const plate=add(leaf,new THREE.PlaneGeometry(.9,.17),new THREE.MeshStandardMaterial({map:plateTexture(label),metalness:.6,roughness:.35}),0,height*.75+(style==='iron'?.05:0),.105);hits.push(plate)}
      // Light spilling through the opening once the leaf moves.
      const spill=glow?new THREE.PointLight(0xffc27a,0,7,2):null;if(spill){spill.position.set(0,height*.55,-.8);group.add(spill)}
      drawAfterPortal(leaf);const door={group,pivot,leaf,hits,fan,spill,portal,open:0,target:0,onOpened:null,swing:style==='iron'?-1.25:-1.45};
      doors.push(door);return door;
    }
    // Swing a door open, call back once the reader can pass, then let it settle shut again.
    function open(door,onOpened,hold=.6){door.target=1;door.onOpened=onOpened;door.hold=hold;door.elapsed=0}
    function update(dt){for(const d of doors){if(d.target===0&&d.open===0)continue;d.elapsed=(d.elapsed||0)+dt;const goal=d.target;d.open+=Math.sign(goal-d.open)*Math.min(Math.abs(goal-d.open),dt*2.2);const e=d.open*d.open*(3-2*d.open);d.pivot.rotation.y=d.swing*e;d.portal.set(d.open>.01);if(d.spill)d.spill.intensity=e*7;if(d.fan)d.fan.material.emissiveIntensity=1.25+e*.8;if(d.target===1&&d.elapsed>=d.hold&&d.onOpened){const cb=d.onOpened;d.onOpened=null;cb()}if(d.target===1&&d.elapsed>d.hold+.9)d.target=0}}
    return {build,open,update,doors,makePortal,drawAfterPortal};
  };
})();
