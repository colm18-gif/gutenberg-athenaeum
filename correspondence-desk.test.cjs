const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('correspondence-desk.js','utf8');
function stub(){const t=function(){};return new Proxy(t,{get(t,k){if(k in t)return t[k];if(k==='then'||k===Symbol.iterator)return undefined;return t[k]=stub()},apply(){return stub()},construct(){return stub()},set(t,k,v){t[k]=v;return true}})}
function setup(clipboard={writeText:async()=>{}}){
  const elements={},document={activeElement:null,getElementById:id=>elements[id]},keys=[];
  for(const id of ['correspondence','letterForm','letterName','letterSubject','letterMessage','letterStatus','letterCopyText','letterCopy','closeLetter']){
    const hidden=new Set(id==='correspondence'||id==='letterCopyText'?['hidden']:[]);
    elements[id]={value:'',textContent:'',events:{},classList:{add:v=>hidden.add(v),remove:v=>hidden.delete(v),contains:v=>hidden.has(v)},addEventListener(type,fn){this.events[type]=fn},focus(){document.activeElement=this},select(){this.selected=true},setCustomValidity(v){this.error=v},reportValidity(){return !this.error}};
  }
  elements.correspondence.querySelectorAll=()=>['letterName','letterSubject','letterMessage','letterCopy','letterCopyText','closeLetter'].map(id=>elements[id]);
  const window={location:{href:''},addEventListener(type,fn,capture){if(type==='keydown'){assert.equal(capture,true);keys.push(fn)}}};
  const context={window,document,navigator:{clipboard}};vm.runInNewContext(source,context);
  const interactables=[],callbacks={opens:0,closes:0};
  const desk=window.createCorrespondenceDesk({THREE:stub(),MAT:stub(),desk:stub(),interactables,canvasTexture:()=>stub(),onOpen:()=>callbacks.opens++,onClose:()=>callbacks.closes++});
  return {elements,window,document,desk,interactables,callbacks,keydown:keys[0]};
}
test('desk stationery opens a private letter and closes with Escape',()=>{
  const s=setup();assert(s.interactables.length>=3);assert.equal(s.desk.isOpen,false);
  assert.equal(s.desk.interact({userData:{type:'book'}}),false);
  assert.equal(s.desk.interact(s.interactables[0]),true);assert.equal(s.desk.isOpen,true);assert.equal(s.callbacks.opens,1);assert.equal(s.document.activeElement,s.elements.letterName);
  let stopped=0,prevented=0;s.keydown({code:'KeyR',stopImmediatePropagation(){stopped++}});assert.equal(stopped,1,'typing R cannot reset the player');assert.equal(s.desk.isOpen,true);
  s.keydown({code:'Escape',stopImmediatePropagation(){stopped++},preventDefault(){prevented++}});assert.equal(s.desk.isOpen,false);assert.equal(s.callbacks.closes,1);assert.equal(prevented,1);
});
test('letters preserve punctuation and Unicode in an encoded email draft, without claiming delivery',()=>{
  const s=setup(),e=s.elements;s.desk.open();e.letterSubject.value='Books & suggestions?';e.letterMessage.value='I loved Quill.\nA suggestion: Éire & Mars #2';e.letterName.value='A reader';
  e.letterForm.events.submit({preventDefault(){}});
  assert(s.window.location.href.startsWith('mailto:libraryafterdark1@gmail.com?'));
  const params=new URLSearchParams(s.window.location.href.split('?')[1]);assert.equal(params.get('subject'),'[Library After Dark] Books & suggestions?');assert.match(params.get('body'),/Éire & Mars #2\n\nFrom A reader/);assert.match(e.letterStatus.textContent,/Send it there/);assert.equal(e.letterMessage.value,'I loved Quill.\nA suggestion: Éire & Mars #2','draft survives closing and reopening');
});
test('blank letters cannot launch email and clipboard denial leaves selectable text',async()=>{
  const s=setup({writeText:async()=>{throw Error('denied')}}),e=s.elements;e.letterMessage.value='  ';e.letterForm.events.submit({preventDefault(){}});assert.equal(s.window.location.href,'');assert(e.letterMessage.error);
  e.letterMessage.value='Hello, keeper.';e.letterMessage.events.input();assert.equal(e.letterMessage.error,'');
  await e.letterCopy.events.click();assert.equal(e.letterCopyText.classList.contains('hidden'),false);assert.equal(e.letterCopyText.selected,true);assert.match(e.letterCopyText.value,/To: libraryafterdark1@gmail.com/);assert.match(e.letterCopyText.value,/Hello, keeper\./);
});
test('keyboard focus stays in the letter and the game pauses while it is open',()=>{
  const s=setup();s.desk.open();let prevented=0;s.keydown({code:'Tab',shiftKey:true,stopImmediatePropagation(){},preventDefault(){prevented++}});assert.equal(s.document.activeElement,s.elements.closeLetter);s.keydown({code:'Tab',shiftKey:false,stopImmediatePropagation(){},preventDefault(){prevented++}});assert.equal(s.document.activeElement,s.elements.letterName);assert.equal(prevented,2);
  const game=fs.readFileSync('game.js','utf8');assert.match(game,/return !correspondenceDesk\.isOpen&&preLetterActive\(\)/);assert.match(game,/return correspondenceDesk\.isOpen\|\|preLetterCovered\(\)/);assert.match(game,/!correspondenceDesk\?\.isOpen&&\(!selected\|\|carryingBook\)/);assert.match(game,/type==='correspondence-desk'&&correspondenceDesk\?\.interact\(focus\)/);
});
