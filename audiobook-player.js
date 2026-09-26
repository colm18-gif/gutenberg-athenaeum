// Listening inside the library: plays a book's LibriVox recording chapter by chapter, streamed from the
// Internet Archive, without ever leaving the page. The recordings were matched to the library's books by
// scripts/audiobooks.mjs; data/audiobooks.js lists which books have one, and each book's chapter list
// (data/audio/<id>.json) is fetched only when someone presses Listen.
//
// A brass "now playing" card stays on screen while the reader walks about, the place in every recording is
// remembered, the phone's lock screen shows the controls, and the room sounds dip while someone is reading
// aloud. If a chapter cannot be reached, the card says so and nothing else changes.
(function(){
  'use strict';

  window.createAudiobookPlayer=function({onChange,analytics,notice}={}){
    const index=window.ATHENAEUM_AUDIOBOOKS||{},SPEEDS=[1,1.25,1.5,.8],STORE='athenaeum-listening';
    const audio=new Audio();audio.preload='none';
    const cache=new Map();let book=null,recording=null,chapter=0,speed=1,state='idle',card=null,saveTimer=0;
    const store={read(){try{return JSON.parse(localStorage.getItem(STORE)||'{}')}catch(error){return {}}},write(value){try{localStorage.setItem(STORE,JSON.stringify(value))}catch(error){}}};

    function entryFor(target){const id=target?.id;return id&&index[id]?{seconds:index[id][0],reader:index[id][1],chapters:index[id][2]}:null}
    function length(seconds){const hours=Math.floor(seconds/3600),minutes=Math.round(seconds%3600/60);return hours?`${hours} h ${String(minutes).padStart(2,'0')} min`:`${Math.max(1,minutes)} min`}
    function label(target){const entry=entryFor(target);if(!entry)return '';if(book===target&&state!=='idle')return state==='playing'?'Pause reading aloud':'Resume reading aloud';return `Listen · ${length(entry.seconds)}`}
    async function load(target){if(cache.has(target.id))return cache.get(target.id);const response=await fetch(`data/audio/${target.id}.json`);if(!response.ok)throw new Error('No chapter list');const data=await response.json();cache.set(target.id,data);return data}

    // Chapter matching: the reader's running head reads e.g. "CHAPTER IV" or "Chapter 12"; LibriVox sections
    // are titled "Chapter 4", "Chapter IV - The Storm" and so on. Numbers are compared, not words.
    const ROMAN={i:1,v:5,x:10,l:50,c:100,d:500,m:1000};
    function roman(text){let total=0,previous=0;for(const letter of text.toLowerCase().split('').reverse()){const value=ROMAN[letter]||0;total+=value<previous?-value:value;previous=Math.max(previous,value)}return total}
    function chapterNumber(text){const match=String(text||'').match(/\b(?:chapter|letter|book|part|stave)\s+([ivxlcdm]+|\d+)\b/i);return match?(/^\d+$/.test(match[1])?Number(match[1]):roman(match[1])):null}
    function chapterFor(data,heading){const wanted=chapterNumber(heading);if(!wanted)return -1;return data.chapters.findIndex(entry=>chapterNumber(entry.title)===wanted)}

    function saved(target){return store.read()[target.id]||null}
    function savePlace(){if(!book||!recording)return;const all=store.read();all[book.id]={chapter,time:Math.floor(audio.currentTime||0)};store.write(all)}

    // ---------- the now-playing card ----------
    function ensureCard(){
      if(card)return card;card=document.createElement('div');card.id='nowPlaying';card.className='now-playing hidden';card.setAttribute('role','region');card.setAttribute('aria-label','Reading aloud');
      card.innerHTML='<div class="np-text"><b class="np-book"></b><span class="np-chapter"></span><small class="np-reader"></small></div><div class="np-controls"><button class="np-prev" aria-label="Previous chapter">⏮</button><button class="np-play" aria-label="Pause">⏸</button><button class="np-next" aria-label="Next chapter">⏭</button><button class="np-speed" aria-label="Reading speed">1×</button><button class="np-close" aria-label="Stop reading aloud" title="Stop (Shift+L)">■ Stop</button></div><div class="np-progress"><i></i></div><small class="np-hint">Press <kbd>L</kbd> to pause · <kbd>Shift</kbd>+<kbd>L</kbd> to stop</small>';
      document.body.appendChild(card);
      const stop=event=>event.stopPropagation();for(const button of card.querySelectorAll('button')){button.addEventListener('pointerdown',stop);button.addEventListener('mousedown',stop)}
      card.querySelector('.np-play').addEventListener('click',toggle);card.querySelector('.np-prev').addEventListener('click',()=>step(-1));card.querySelector('.np-next').addEventListener('click',()=>step(1));
      card.querySelector('.np-speed').addEventListener('click',()=>{speed=SPEEDS[(SPEEDS.indexOf(speed)+1)%SPEEDS.length];audio.playbackRate=speed;render()});card.querySelector('.np-close').addEventListener('click',stop_);
      return card;
    }
    function render(){
      const c=ensureCard();c.classList.toggle('hidden',state==='idle');if(state==='idle'){onChange?.();return}
      const current=recording?.chapters[chapter];c.querySelector('.np-book').textContent=book.title;
      c.querySelector('.np-chapter').textContent=state==='loading'?'Finding the recording…':state==='error'?'This recording could not be reached just now.':current?`${current.title} · ${chapter+1} of ${recording.chapters.length}`:'';
      c.querySelector('.np-reader').textContent=current?.reader?`Read by ${current.reader} · LibriVox`:'LibriVox';
      const play=c.querySelector('.np-play');play.textContent=state==='playing'?'⏸':'▶';play.setAttribute('aria-label',state==='playing'?'Pause':'Play');play.title=state==='playing'?'Pause (L)':'Play (L)';
      c.querySelector('.np-speed').textContent=`${speed}×`;c.querySelector('.np-prev').disabled=!recording||chapter<=0;c.querySelector('.np-next').disabled=!recording||chapter>=recording.chapters.length-1;
      c.classList.toggle('np-error',state==='error');
      if('mediaSession'in navigator&&current&&window.MediaMetadata){navigator.mediaSession.metadata=new MediaMetadata({title:`${book.title}: ${current.title}`,artist:current.reader||book.author,album:'The Library After Dark'});navigator.mediaSession.playbackState=state==='playing'?'playing':'paused'}
      onChange?.();
    }
    function progress(){if(!card||state==='idle')return;const bar=card.querySelector('.np-progress i');bar.style.width=audio.duration?`${Math.min(100,audio.currentTime/audio.duration*100)}%`:'0%'}

    // ---------- playback ----------
    function playChapter(index,from=0){
      if(!recording)return;chapter=Math.max(0,Math.min(recording.chapters.length-1,index));const entry=recording.chapters[chapter];
      audio.src=entry.url;audio.playbackRate=speed;const begin=()=>{if(from>0){try{audio.currentTime=from}catch(error){}}audio.removeEventListener('loadedmetadata',begin)};audio.addEventListener('loadedmetadata',begin);
      state='loading';render();audio.play().then(()=>{state='playing';render()}).catch(error=>{if(error?.name==='NotAllowedError'){state='paused';render()}else{state='error';render()}});
    }
    async function start(target,{heading}={}){
      if(!entryFor(target))return false;
      if(book===target&&state!=='idle'){toggle();return true}
      savePlace();audio.pause();book=target;recording=null;state='loading';render();
      try{recording=await load(target)}catch(error){if(book===target){state='error';render()}return true}
      if(book!==target)return true;
      const place=saved(target),matched=chapterFor(recording,heading);
      if(matched>=0&&(!place||place.chapter!==matched)){playChapter(matched);notice?.(`Reading aloud from ${recording.chapters[matched].title}, where you are in the book.`)}
      else if(place)playChapter(place.chapter,place.time);else playChapter(0);
      analytics?.track('Audiobook Played');return true;
    }
    function toggle(){if(state==='idle'||!recording)return;if(state==='playing'){audio.pause();state='paused';savePlace();render()}else{audio.play().then(()=>{state='playing';render()}).catch(()=>{state='error';render()})}}
    function step(direction){if(!recording)return;savePlace();playChapter(chapter+direction)}
    function stop_(){savePlace();audio.pause();audio.removeAttribute('src');audio.load();state='idle';book=null;recording=null;render()}

    audio.addEventListener('ended',()=>{if(recording&&chapter<recording.chapters.length-1)playChapter(chapter+1);else{const all=store.read();if(book)delete all[book.id];store.write(all);state='paused';render()}});
    audio.addEventListener('error',()=>{if(state!=='idle'&&audio.getAttribute('src')){state='error';render()}});
    audio.addEventListener('timeupdate',()=>{progress();const now=performance.now();if(now-saveTimer>5000){saveTimer=now;savePlace()}});
    audio.addEventListener('waiting',()=>{if(state==='playing'){card?.classList.add('np-buffering')}});audio.addEventListener('playing',()=>card?.classList.remove('np-buffering'));
    if('mediaSession'in navigator)try{navigator.mediaSession.setActionHandler('play',toggle);navigator.mediaSession.setActionHandler('pause',toggle);navigator.mediaSession.setActionHandler('previoustrack',()=>step(-1));navigator.mediaSession.setActionHandler('nexttrack',()=>step(1))}catch(error){}
    window.addEventListener('pagehide',savePlace);
    // L pauses and resumes, Shift+L stops, from anywhere in the library (the mouse is often steering the view,
    // so the card's buttons cannot be clicked). Esc is left alone: it closes menus and releases the mouse.
    window.addEventListener('keydown',event=>{if(event.code!=='KeyL'||state==='idle'||event.ctrlKey||event.metaKey||event.altKey||event.repeat)return;const target=event.target;if(target&&(/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)||target.isContentEditable))return;event.preventDefault();if(event.shiftKey)stop_();else toggle()});
    // With the book open the card moves up into the reader's header, beside the title, clear of the text.
    const reader=document.getElementById('reader');if(reader&&window.MutationObserver){const sync=()=>document.body.classList.toggle('reader-open',!reader.classList.contains('hidden'));new MutationObserver(sync).observe(reader,{attributes:true,attributeFilter:['class']});sync()}

    function setVolume(level){if(Math.abs(audio.volume-level)>.01)audio.volume=level}
    return {available:target=>!!entryFor(target),label,start,toggle,stop:stop_,setVolume,get playing(){return state==='playing'},get active(){return state!=='idle'},get book(){return book},
      get count(){return Object.keys(index).length},chapterNumber,chapterFor};
  };
})();
