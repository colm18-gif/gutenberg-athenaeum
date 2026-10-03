/* The Grand Hall's private correspondence desk: a letter handed to the reader's email app. */
(()=>{
  'use strict';
  window.createCorrespondenceDesk=function({THREE,MAT,desk,interactables,canvasTexture,onOpen,onClose}){
    const address='libraryafterdark1@gmail.com',dialog=document.getElementById('correspondence'),form=document.getElementById('letterForm');
    const name=document.getElementById('letterName'),subject=document.getElementById('letterSubject'),message=document.getElementById('letterMessage'),status=document.getElementById('letterStatus'),copyText=document.getElementById('letterCopyText');
    const data={type:'correspondence-desk',title:'The correspondence desk',author:'A private letter to the keeper of The Library After Dark.',action:'WRITE A LETTER'};
    function part(geometry,material,x,y,z,interactive=false){const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);desk.add(mesh);if(interactive){mesh.userData=data;interactables.push(mesh)}return mesh}
    // Leather blotter, addressed stationery, sealed envelope, ink and a feather pen.
    const leather=new THREE.MeshStandardMaterial({color:0x243b31,roughness:.92});
    part(new THREE.BoxGeometry(1.6,.025,.96),leather,-.62,1.455,-.46);
    const letterTex=canvasTexture((c,w,h)=>{c.fillStyle='#e8d9b5';c.fillRect(0,0,w,h);c.fillStyle='#47311d';c.textAlign='center';c.font='24px Georgia';c.fillText('To the keeper',w/2,55);c.font='18px Georgia';c.fillText('of The Library After Dark',w/2,85);c.strokeStyle='#a68b61';c.lineWidth=2;for(let y=132;y<h-25;y+=28){c.beginPath();c.moveTo(35,y);c.lineTo(w-35,y);c.stroke()}},384,384);
    const paper=part(new THREE.PlaneGeometry(.72,.72),new THREE.MeshStandardMaterial({map:letterTex,roughness:.95}),-.62,1.48,-.43,true);paper.rotation.x=-Math.PI/2;paper.rotation.z=.08;
    const envelope=part(new THREE.BoxGeometry(.48,.018,.3),MAT.paper,-1.23,1.49,-.73,true);envelope.rotation.y=-.12;
    const wax=new THREE.MeshStandardMaterial({color:0x782d30,roughness:.55});
    part(new THREE.CylinderGeometry(.065,.065,.02,12),wax,-1.23,1.511,-.73,true);
    const pen=part(new THREE.CylinderGeometry(.008,.014,.49,8),MAT.brass,.7,1.76,-.4,true);pen.rotation.z=-.28;
    const feather=part(new THREE.PlaneGeometry(.13,.35),new THREE.MeshStandardMaterial({color:0xe7ddc4,side:THREE.DoubleSide,roughness:.9}),.81,2.09,-.4,true);feather.rotation.z=-.28;
    // A low carved letter rack, kept below the sightline across the hall.
    part(new THREE.BoxGeometry(3.25,.12,.3),MAT.darkWood,0,1.49,-1.04);
    for(const x of [-1.54,0,1.54])part(new THREE.BoxGeometry(.08,.48,.3),MAT.darkWood,x,1.73,-1.04);
    part(new THREE.BoxGeometry(3.25,.08,.3),MAT.wood,0,1.98,-1.04);
    const plaqueTex=canvasTexture((c,w,h)=>{c.fillStyle='#261b12';c.fillRect(0,0,w,h);c.strokeStyle='#bc9758';c.lineWidth=7;c.strokeRect(6,6,w-12,h-12);c.fillStyle='#eed9a9';c.textAlign='center';c.font='bold 29px Georgia';c.fillText('CORRESPONDENCE',w/2,43);c.font='italic 20px Georgia';c.fillText('Letters to the keeper',w/2,73)},640,96);
    part(new THREE.PlaneGeometry(2.15,.33),new THREE.MeshStandardMaterial({map:plaqueTex,emissiveMap:plaqueTex,emissive:0x78562c,emissiveIntensity:.35,roughness:.8}),0,1.74,-.88,true);
    function letter(){const heading='[Library After Dark] '+(subject.value.trim()||'A letter to the keeper');const body=message.value.trim()+(name.value.trim()?'\n\nFrom '+name.value.trim():'')+'\n\nWritten at the correspondence desk in The Library After Dark.\nhttps://libraryafterdark.space/';return {heading,body,uri:'mailto:'+address+'?subject='+encodeURIComponent(heading)+'&body='+encodeURIComponent(body)}}
    function open(){dialog.classList.remove('hidden');status.textContent='';onOpen?.();name.focus()}
    function close(){dialog.classList.add('hidden');onClose?.()}
    form.addEventListener('submit',event=>{event.preventDefault();if(!message.value.trim()){message.setCustomValidity('Write a few words before addressing your letter.');message.reportValidity();return}message.setCustomValidity('');if(!form.reportValidity())return;window.location.href=letter().uri;status.textContent='Your email app should open with your letter addressed. Send it there when you are ready. If it does not open, copy the letter and use the address below.'});
    message.addEventListener('input',()=>message.setCustomValidity(''));
    document.getElementById('letterCopy').addEventListener('click',async()=>{const draft=letter();copyText.value='To: '+address+'\nSubject: '+draft.heading+'\n\n'+draft.body;try{await navigator.clipboard.writeText(copyText.value);status.textContent='Letter copied. Paste it into an email to '+address+'.'}catch(error){copyText.classList.remove('hidden');copyText.focus();copyText.select();status.textContent='Select and copy the letter below, then paste it into your email.'}});
    document.getElementById('closeLetter').addEventListener('click',close);
    window.addEventListener('keydown',event=>{if(dialog.classList.contains('hidden'))return;event.stopImmediatePropagation();if(event.code==='Escape'){event.preventDefault();close();return}if(event.code==='Tab'){const fields=[...dialog.querySelectorAll('input,textarea,button,a')].filter(el=>!el.classList.contains('hidden'));const first=fields[0],last=fields.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}},true);
    return {open,close,interact(object){if(object?.userData?.type!==data.type)return false;open();return true},get isOpen(){return !dialog.classList.contains('hidden')}};
  };
})();
