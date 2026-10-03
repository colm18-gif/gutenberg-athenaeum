// The roof telescope borrows the real destination geometry for one bounded snapshot.
// No second WebGL context, background animation, teleport or duplicate world books.
(function(){
  'use strict';
  window.createTelescopeViewer=function({THREE,renderer,scene,destinations,stars=()=>0,beforeRender=()=>{},onOpen=()=>{},onClose=()=>{},size=640}){
    const panel=document.createElement('section');panel.className='telescope-view hidden';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','telescopeTitle');
    panel.innerHTML='<div class="telescope-card"><small>THE ROOF OBSERVATORY</small><h2 id="telescopeTitle">Through the brass telescope</h2><div class="telescope-targets" role="group" aria-label="Aim the telescope"><button type="button" data-target="moon" aria-pressed="true">Moon</button><button type="button" data-target="mars" aria-pressed="false">Mars</button></div><div class="telescope-lens"><canvas role="img" aria-label="A view through the telescope"></canvas><span aria-hidden="true" class="telescope-crosshair"></span></div><h3 class="telescope-destination"></h3><p class="telescope-caption" aria-live="polite"></p><div class="telescope-magnification" role="group" aria-label="Magnification"><button type="button" data-zoom="out" aria-label="Reduce magnification">−</button><output aria-label="Current magnification">1×</output><button type="button" data-zoom="in" aria-label="Increase magnification">+</button></div><p class="telescope-route">To visit, climb the high staircase to the Rocket Hall. Set the course dial, then press the launch button.</p><p class="telescope-stars"></p><button type="button" class="telescope-close">Step away from the telescope</button></div>';
    document.body.appendChild(panel);
    const canvas=panel.querySelector('canvas'),caption=panel.querySelector('.telescope-caption'),title=panel.querySelector('.telescope-destination'),closeButton=panel.querySelector('.telescope-close'),zoomLabel=panel.querySelector('output');
    canvas.width=canvas.height=size;let target='moon',zoom=1,open=false,previousFocus=null;
    function draw(){
      const destination=destinations[target];title.textContent=destination.title;caption.textContent=destination.description;canvas.setAttribute('aria-label',`${destination.title}: ${destination.description}`);
      for(const button of panel.querySelectorAll('[data-target]'))button.setAttribute('aria-pressed',String(button.dataset.target===target));
      zoomLabel.textContent=`${zoom.toFixed(2).replace(/\.?0+$/,'')}×`;panel.querySelector('[data-zoom="out"]').disabled=zoom<=1;panel.querySelector('[data-zoom="in"]').disabled=zoom>=2;
      const count=stars();panel.querySelector('.telescope-stars').textContent=count?`${count} ${count===1?'star remembers a book':'stars remember the books'} whose pages you have turned.`:'Your reader’s constellation is waiting for its first book.';
      let view=null,root=null,parent=null,worldMatrix=null,localMatrix=null,matrixAutoUpdate=null,rootVisible=true,renderTarget=null,previousTarget=null,viewport=null,scissor=null,scissorTest=false,autoClear=true;
      try{
        view=destination.view();if(!view?.root)throw Error('The destination is unavailable');beforeRender(view);
        root=view.root;root.updateWorldMatrix(true,true);parent=root.parent;worldMatrix=root.matrixWorld.clone();localMatrix=root.matrix.clone();matrixAutoUpdate=root.matrixAutoUpdate;rootVisible=root.visible;
        const preview=new THREE.Scene();preview.background=new THREE.Color(view.background);preview.fog=new THREE.FogExp2(view.fog,.009);preview.environment=scene.environment;
        preview.add(new THREE.HemisphereLight(view.light,0x332a24,1.6));const light=new THREE.DirectionalLight(view.light,2);light.position.fromArray(view.eye).add(new THREE.Vector3(-8,18,6));light.target.position.fromArray(view.look);preview.add(light,light.target);
        preview.add(root);root.matrix.copy(worldMatrix);root.matrixAutoUpdate=false;root.visible=true;
        const camera=new THREE.PerspectiveCamera(44/zoom,1,.1,105);camera.position.fromArray(view.eye);camera.lookAt(...view.look);camera.updateMatrixWorld();
        renderTarget=new THREE.WebGLRenderTarget(size,size,{depthBuffer:true});renderTarget.texture.colorSpace=THREE.SRGBColorSpace;
        previousTarget=renderer.getRenderTarget();viewport=renderer.getViewport(new THREE.Vector4());scissor=renderer.getScissor(new THREE.Vector4());scissorTest=renderer.getScissorTest();autoClear=renderer.autoClear;
        renderer.setRenderTarget(renderTarget);renderer.setViewport(0,0,size,size);renderer.setScissorTest(false);renderer.autoClear=true;renderer.clear();renderer.render(preview,camera);
        const pixels=new Uint8Array(size*size*4);renderer.readRenderTargetPixels(renderTarget,0,0,size,size,pixels);const context=canvas.getContext('2d'),image=context.createImageData(size,size),stride=size*4;
        for(let row=0;row<size;row++)image.data.set(pixels.subarray(row*stride,(row+1)*stride),(size-1-row)*stride);context.putImageData(image,0,0);
      }catch(error){const context=canvas.getContext('2d');context.clearRect(0,0,size,size);caption.textContent='The lens clouds over. Choose the destination again to refocus.';console.warn('Telescope view unavailable',error)}
      finally{
        if(root){root.removeFromParent();if(parent)parent.add(root);root.matrix.copy(localMatrix);root.matrixAutoUpdate=matrixAutoUpdate;root.visible=rootVisible;root.updateWorldMatrix(true,true)}
        if(viewport){renderer.setRenderTarget(previousTarget);renderer.setViewport(viewport);renderer.setScissor(scissor);renderer.setScissorTest(scissorTest);renderer.autoClear=autoClear}
        renderTarget?.dispose();
      }
    }
    function close(){if(!open)return;open=false;panel.classList.add('hidden');document.body.classList.remove('telescope-open');onClose();previousFocus?.focus?.()}
    function show(destination='moon'){if(!open){previousFocus=document.activeElement;open=true;onOpen();document.body.classList.add('telescope-open');panel.classList.remove('hidden')}target=destinations[destination]?destination:'moon';zoom=1;draw();closeButton.focus()}
    for(const button of panel.querySelectorAll('[data-target]'))button.addEventListener('click',()=>{target=button.dataset.target;zoom=1;draw()});
    for(const button of panel.querySelectorAll('[data-zoom]'))button.addEventListener('click',()=>{zoom=Math.max(1,Math.min(2,zoom+(button.dataset.zoom==='in'?.25:-.25)));draw()});
    closeButton.addEventListener('click',close);
    window.addEventListener('keydown',event=>{if(!open)return;event.stopImmediatePropagation();if(event.code==='Escape'){event.preventDefault();close()}else if(event.code==='Tab'){const buttons=[...panel.querySelectorAll('button')].filter(button=>!button.disabled),first=buttons[0],last=buttons.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}},true);
    return {open:show,close,get isOpen(){return open}};
  };
})();
