// Room ambience for The Library After Dark.
//
// Every room has its own quiet bed of sound: clocks in the horologist's study, a fountain and
// crickets in the night conservatory, wind in the attic rafters, water dripping below the
// catalogue, waves at the tide station. Like the rest of the soundscape it is generated with the
// Web Audio API, so it costs no downloads and has no licensing strings attached.
//
// A room is made of continuous "beds" (wind, water, fire, hum) and occasional "events" (a tick, a
// drip, a gull). Beds are built the first time a room is entered and crossfade as the reader
// walks between rooms; rooms left behind are torn down once silent, so only nearby sound runs.
(function(){
  'use strict';
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const rand=(a,b)=>a+Math.random()*(b-a);
  const pick=list=>list[Math.floor(Math.random()*list.length)];

  window.createRoomAmbience=function({audioCtx,master}){
    const ctx=audioCtx,sr=ctx.sampleRate;
    const bus=ctx.createGain();bus.gain.value=1;bus.connect(master);

    // ---------- Buffers (built once, on first use) ----------
    const cache=new Map();
    function once(key,build){if(!cache.has(key))cache.set(key,build());return cache.get(key)}
    function buffer(seconds,fill,channels=1){const length=Math.max(1,Math.floor(sr*seconds)),b=ctx.createBuffer(channels,length,sr);for(let c=0;c<channels;c++)fill(b.getChannelData(c),length,c);return b}
    // Loopable noise; the seam is crossfaded so it never clicks.
    function seamless(data,length){const fade=Math.floor(sr*.08);for(let i=0;i<fade;i++){const w=i/fade;data[i]=data[i]*w+data[length-fade+i]*(1-w)}}
    function normalise(data,length,rms){let sum=0;for(let i=0;i<length;i++)sum+=data[i]*data[i];const scale=rms/Math.max(1e-6,Math.sqrt(sum/length));for(let i=0;i<length;i++)data[i]*=scale}
    const noise=color=>once('noise-'+color,()=>buffer(6,(d,n)=>{let pink=0,brown=0;for(let i=0;i<n;i++){const w=Math.random()*2-1;pink=pink*.97+w*.03;brown=brown*.996+w*.004;d[i]=color==='white'?w:color==='pink'?pink*3:brown*9}seamless(d,n);normalise(d,n,.25)},2));
    // Water falling into a basin: noise whose level flickers like breaking bubbles.
    const fountain=()=>once('fountain',()=>buffer(5,(d,n)=>{let flicker=.6,target=.6;for(let i=0;i<n;i++){if(i%64===0)target=.35+Math.random()*.65;flicker+=(target-flicker)*.02;d[i]=(Math.random()*2-1)*flicker}seamless(d,n);normalise(d,n,.25)},2));
    // Waves: two swells per loop, so the loop edges fall in the quiet trough between them.
    const waves=()=>once('waves',()=>buffer(12,(d,n,c)=>{let pink=0,brown=0;for(let i=0;i<n;i++){const t=i/sr,w=Math.random()*2-1;pink=pink*.97+w*.03;brown=brown*.996+w*.004;const swell=Math.pow(Math.sin(Math.PI*(t+c*.4)/6),2),hiss=Math.pow(Math.max(0,Math.sin(Math.PI*(t+c*.4)/6-.35)),6);d[i]=(brown*7+pink*2)*(.25+swell*.9)+w*hiss*.35}seamless(d,n);normalise(d,n,.25)},2));
    // Embers: a hiss with pops, the same recipe as the hall fireplace.
    const embers=()=>once('embers',()=>buffer(4,(d,n)=>{let ember=0;for(let i=0;i<n;i++){if(Math.random()<.0014)ember=.45+Math.random()*.85;ember*=.994;d[i]=(Math.random()*2-1)*(.02+ember)}seamless(d,n);normalise(d,n,.2)},1));

    // One-shot sounds, each a short synthesised buffer replayed at slightly different pitches.
    const decay=(t,rate)=>Math.exp(-t*rate);
    const EVENTS={
      tick:()=>buffer(.05,(d,n)=>{for(let i=0;i<n;i++){const t=i/sr;d[i]=(Math.sin(t*2*Math.PI*2600)*.5+Math.sin(t*2*Math.PI*1150)*.5+(Math.random()*2-1)*.35)*decay(t,150)}}),
      tock:()=>buffer(.12,(d,n)=>{for(let i=0;i<n;i++){const t=i/sr;d[i]=(Math.sin(t*2*Math.PI*820)*.6+Math.sin(t*2*Math.PI*1640)*.2+(Math.random()*2-1)*.25*decay(t,400))*decay(t,45)}}),
      chime:()=>buffer(3,(d,n)=>{for(let i=0;i<n;i++){const t=i/sr;d[i]=[[1,1,1.1],[2.76,.5,1.8],[5.4,.28,3],[8.93,.14,4.5]].reduce((sum,[ratio,amp,k])=>sum+Math.sin(t*2*Math.PI*660*ratio)*amp*decay(t,k),0)*.5}}),
      drip:()=>buffer(.22,(d,n)=>{let phase=0;for(let i=0;i<n;i++){const t=i/sr,f=1500-700*Math.min(1,t/.04);phase+=2*Math.PI*f/sr;d[i]=Math.sin(phase)*decay(t,26)*.8+(t<.004?(Math.random()*2-1)*.4:0)}}),
      cricket:()=>buffer(.2,(d,n)=>{for(let i=0;i<n;i++){const t=i/sr,pulse=t%.045<.022?Math.sin(Math.PI*(t%.045)/.022):0;d[i]=Math.sin(t*2*Math.PI*4700)*pulse*(t<.14?1:0)*.6}}),
      bird:()=>buffer(.5,(d,n)=>{let phase=0;for(let i=0;i<n;i++){const t=i/sr,k=Math.floor(t/.12),u=(t%.12)/.12,on=k<3&&u<.75?Math.sin(Math.PI*u/.75):0,f=2600+k*260+1400*u;phase+=2*Math.PI*f/sr;d[i]=Math.sin(phase+Math.sin(t*2*Math.PI*55)*.8)*on*.45}}),
      owl:()=>buffer(1.3,(d,n)=>{let phase=0;for(let i=0;i<n;i++){const t=i/sr,first=t<.45?Math.sin(Math.PI*t/.45):0,second=t>.65&&t<1.25?Math.sin(Math.PI*(t-.65)/.6):0,f=390-(t>.65?25:0)+Math.sin(t*2*Math.PI*6)*4;phase+=2*Math.PI*f/sr;d[i]=Math.sin(phase)*(first*.8+second)*.45}}),
      // A floorboard or shelf taking weight: slow, irregular stick-slip catches exciting a low wooden body.
      // (An earlier, higher and faster version read as crickets.)
      creak:()=>buffer(1.1,(d,n)=>{let next=0,lp=0,b1=0,v1=0,b2=0,v2=0,hp=0,prev=0;const w1=2*Math.PI*190/sr,w2=2*Math.PI*310/sr;for(let i=0;i<n;i++){const t=i/sr,env=Math.pow(Math.sin(Math.PI*t/1.1),1.5);let kick=0;if(i>=next){kick=.6+Math.random()*.4;next=i+Math.floor(sr/(16+22*Math.sin(Math.PI*t/1.1)+Math.random()*9))}const w=Math.random()*2-1;lp+=(w-lp)*.08;const drive=kick+lp*.05;v1=v1*.9985-b1*w1*w1+drive*.02;b1+=v1;v2=v2*.998-b2*w2*w2+drive*.012;b2+=v2;const x=b1*1.4+b2*.8;hp=x-prev+.96*hp;prev=x;d[i]=hp*env}let peak=0;for(let i=0;i<n;i++)peak=Math.max(peak,Math.abs(d[i]));for(let i=0;i<n;i++)d[i]*=.45/Math.max(1e-6,peak)}),
      clink:()=>buffer(.6,(d,n)=>{for(let i=0;i<n;i++){const t=i/sr;d[i]=(Math.sin(t*2*Math.PI*2900)*.5+Math.sin(t*2*Math.PI*4350)*.3+Math.sin(t*2*Math.PI*6120)*.2)*decay(t,9)*.6}}),
      rustle:()=>buffer(.45,(d,n)=>{let hp=0,lp=0;for(let i=0;i<n;i++){const t=i/sr,w=Math.random()*2-1;lp+=(w-lp)*.5;hp=w-lp;const env=Math.pow(Math.sin(Math.PI*t/.45),2)*(.6+.4*Math.sin(t*70));d[i]=hp*env*.5}}),
      gull:()=>buffer(1.1,(d,n)=>{let phase=0;for(let i=0;i<n;i++){const t=i/sr,k=t<.45?0:1,u=((t-(k?.55:0))/.45),on=u>=0&&u<=1?Math.sin(Math.PI*u):0,f=1750-650*clamp(u,0,1);phase+=2*Math.PI*f/sr;d[i]=(Math.sin(phase)+Math.sin(phase*2)*.35+Math.sin(phase*3)*.15)*on*.3}}),
      foghorn:()=>buffer(3.4,(d,n)=>{for(let i=0;i<n;i++){const t=i/sr,env=Math.min(1,t/.5)*Math.min(1,(3.4-t)/1.2);let s=0;for(let h=1;h<=7;h++)s+=Math.sin(t*2*Math.PI*98*h)/(h*h*.8);d[i]=s*env*.35}}),
      clop:()=>buffer(1.3,(d,n)=>{let lp=0;for(let i=0;i<n;i++){const t=i/sr;let s=0;for(const at of [0,.27,.62,.89]){const u=t-at;if(u>=0&&u<.09){const w=Math.random()*2-1;lp+=(w-lp)*.25;s+=(lp*.8+Math.sin(u*2*Math.PI*310)*.5)*decay(u,60)}}d[i]=s*.55}}),
      musicbox:()=>buffer(1.6,(d,n)=>{for(let i=0;i<n;i++){const t=i/sr;d[i]=(Math.sin(t*2*Math.PI*880)+Math.sin(t*2*Math.PI*1760)*.3+Math.sin(t*2*Math.PI*2651)*.12)*decay(t,3.2)*.4}}),
      telegraph:()=>buffer(.35,(d,n)=>{for(let i=0;i<n;i++){const t=i/sr;let s=0;for(const at of [0,.09,.14,.26]){const u=t-at;if(u>=0&&u<.02)s+=(Math.random()*2-1)*decay(u,300)+Math.sin(u*2*Math.PI*1900)*decay(u,200)}d[i]=s*.5}}),
      bubble:()=>buffer(.12,(d,n)=>{let phase=0;for(let i=0;i<n;i++){const t=i/sr,f=320+900*t/.12;phase+=2*Math.PI*f/sr;d[i]=Math.sin(phase)*decay(t,30)*.6}}),
      whisper:()=>buffer(1.4,(d,n)=>{let a=0,b=0;for(let i=0;i<n;i++){const t=i/sr,w=Math.random()*2-1;a+=(w-a)*.18;b+=(a-b)*.18;const env=Math.pow(Math.sin(Math.PI*t/1.4),2)*(.5+.5*Math.sin(t*2*Math.PI*(3.2+Math.sin(t*2))));d[i]=(a-b)*env*1.6}}),
      scratch:()=>buffer(.9,(d,n)=>{for(let i=0;i<n;i++){const t=i/sr,stroke=Math.max(0,Math.sin(t*2*Math.PI*3.6));d[i]=(Math.random()*2-1)*stroke*stroke*.18}}),
      bell:()=>buffer(2.4,(d,n)=>{for(let i=0;i<n;i++){const t=i/sr;let s=0;for(const at of [0,.55,1.1]){const u=t-at;if(u>=0)s+=[[1,1,1.6],[2.4,.4,2.6],[4.1,.18,4]].reduce((sum,[r,amp,k])=>sum+Math.sin(u*2*Math.PI*740*r)*amp*decay(u,k),0)}d[i]=s*.28}}),
      hoot:()=>buffer(1.8,(d,n)=>{for(let i=0;i<n;i++){const t=i/sr,env=Math.min(1,t/.3)*Math.min(1,(1.8-t)/.6);d[i]=(Math.sin(t*2*Math.PI*440)+Math.sin(t*2*Math.PI*554)*.8+Math.sin(t*2*Math.PI*659)*.6)*env*.18}}),
      thump:()=>buffer(.5,(d,n)=>{let lp=0;for(let i=0;i<n;i++){const t=i/sr,w=Math.random()*2-1;lp+=(w-lp)*.04;d[i]=(lp*3+Math.sin(t*2*Math.PI*55))*decay(t,9)*.5}})
    };
    const eventBuffer=type=>once('event-'+type,EVENTS[type]);

    // ---------- Room recipes ----------
    // beds: [kind, gain, options]; events: [type, per minute, gain, pitch spread]; ticks: [interval s, type, gain].
    const QUIET_ROOM={beds:[['air',.05]],events:[['creak',.8,.05],['rustle',1,.04]]};
    const RECIPES={
      // The Grand Hall and its gallery keep only their own rain, fire and lamplit hum: nothing chirps or creaks there.
      'main-library':{beds:[]},
      'upper-floor':{beds:[]},
      'east-wing':QUIET_ROOM,'west-wing':QUIET_ROOM,
      'restricted-stacks':{beds:[['air',.06]],events:[['whisper',1.2,.04],['creak',.8,.05]]},
      'roof-garden':{beds:[['wind',.14]],events:[['chimes',2.2,.08],['owl',.4,.06]]},
      'librarian-office':{beds:[['air',.04]],ticks:[[1,'tick',.06]],events:[['scratch',2.5,.05],['rustle',1.5,.04]]},
      'portrait-room':{beds:[['air',.06]],events:[['whisper',1.4,.035],['creak',.7,.05]]},
      'tunnel':{beds:[['rumble',.12],['air',.05]],events:[['drip',9,.07]]},
      'archive':{beds:[['rumble',.08]],events:[['drip',4,.05],['whisper',.8,.03]]},
      'below-catalogue':{beds:[['rumble',.13]],events:[['drip',12,.08],['thump',.5,.05]]},
      'rabbit-room':{beds:[['air',.05]],ticks:[[.5,'tick',.05]],events:[['musicbox',1,.05]]},
      'afterdark-sorting':{beds:[['air',.05]],events:[['rustle',4,.05],['thump',.8,.04]]},
      'afterdark-departures':{beds:[['air',.06],['wind',.04]],events:[['bell',.3,.05],['rustle',1.5,.035]]},
      returning:{beds:[['air',.05]],events:[['whisper',1.4,.03],['rustle',1,.035]]},
      quiet:{beds:[['air',.04]],events:[['creak',.5,.035]]},
      unread:{beds:[['air',.06],['rumble',.05]],events:[['whisper',2,.035]]},
      repository:{beds:[['air',.05]],ticks:[[2,'tock',.04]],events:[['rustle',1.2,.035]]},
      gothic:{beds:[['wind',.07],['air',.04]],events:[['owl',.7,.05],['creak',1.2,.06]]},
      inquiry:{beds:[['air',.04]],ticks:[[1,'tick',.05]],events:[['scratch',1.5,.04]]},
      chart:{beds:[['waves',.1]],events:[['gull',.8,.045],['creak',.8,.05]]},
      drawing:{beds:[['fire',.07]],ticks:[[1.5,'tock',.035]],events:[['clink',1.5,.05]]},
      study:{beds:[['fire',.05],['air',.03]],ticks:[[1,'tick',.045]],events:[['rustle',1.5,.04]]},
      garden:{beds:[['wind',.06],['fountain',.07]],events:[['bird',3,.05],['cricket',6,.035]]},
      verne:{beds:[['rumble',.08],['waves',.05]],events:[['bubble',8,.05],['creak',1,.05]]},
      wells:{beds:[['hum',.05]],events:[['telegraph',.6,.04]]},
      haggard:{beds:[['wind',.08],['insects',.07]],events:[['thump',.6,.045]]},
      doyle:{beds:[['fire',.06]],ticks:[[1,'tock',.04]],events:[['clop',.8,.045],['rustle',1,.035]]},
      contested:{beds:[['air',.06]],events:[['whisper',2.2,.035],['scratch',.8,.035]]},
      // No ticking: it pulled attention from the page. The clocks only chime, softly and rarely.
      'curious-horologist':{beds:[['air',.04]],events:[['chime',.35,.05]]},
      'curious-conservatory':{beds:[['fountain',.12],['insects',.08]],events:[['cricket',14,.04],['owl',.6,.045],['drip',3,.035]]},
      'curious-parlour':{beds:[['fire',.12]],ticks:[[1.2,'tock',.035]],events:[['creak',.8,.05],['clink',.4,.035]]},
      'curious-attic':{beds:[['wind',.12]],events:[['creak',3,.07],['musicbox',.6,.04]]},
      'railway-platform':{beds:[['wind',.06]],events:[['bell',.4,.05]]},
      'railway-carriage':{beds:[],events:[['rustle',1,.035]]},
      'railway-depot':{beds:[['air',.05]],events:[['telegraph',.8,.04],['clink',.6,.04],['thump',.6,.04]]},
      'fog-stop':{beds:[['wind',.05],['air',.05]],events:[['foghorn',.5,.07],['drip',4,.04]]},
      'signal-stop':{beds:[['wind',.1]],events:[['telegraph',2,.05],['bell',.3,.04]]},
      'tide-stop':{beds:[['waves',.1],['wind',.05]],events:[['gull',1.6,.05]]},
      'high-staircase':{beds:[['wind',.06,{rises:true}]],events:[['creak',1,.04]]},
      'rocket':{beds:[['hum',.05]],events:[['telegraph',1,.04]]},
      // Almost nothing on the Moon: a faint rush in the helmet and the reader's own heartbeat.
      'moon':{beds:[['air',.02]],ticks:[[1.1,'thump',.025]]},
      'verne-descent':{beds:[['rumble',.14]],events:[['drip',10,.07],['bubble',3,.04]]}
    };

    // ---------- Beds ----------
    function loop(source){const node=ctx.createBufferSource();node.buffer=source;node.loop=true;node.loopStart=0;node.playbackRate.value=rand(.97,1.03);return node}
    function lfo(frequency,depth,target){const osc=ctx.createOscillator(),gain=ctx.createGain();osc.frequency.value=frequency;gain.gain.value=depth;osc.connect(gain).connect(target);osc.start();return [osc,gain]}
    function makeBed(kind,level,options={},out){
      const nodes=[],gain=ctx.createGain();gain.gain.value=level;gain.connect(out);nodes.push(gain);
      const filter=type=>{const f=ctx.createBiquadFilter();f.type=type;nodes.push(f);return f},start=node=>{node.start(ctx.currentTime+rand(0,.3));nodes.push(node);return node};
      if(kind==='air'){const src=start(loop(noise('brown'))),f=filter('lowpass');f.frequency.value=320;src.connect(f).connect(gain)}
      else if(kind==='rumble'){const src=start(loop(noise('brown'))),f=filter('lowpass');f.frequency.value=110;f.Q.value=.8;src.connect(f).connect(gain);gain.gain.value=level*.8}
      else if(kind==='wind'){const src=start(loop(noise('pink'))),f=filter('bandpass');f.frequency.value=460;f.Q.value=.9;src.connect(f).connect(gain);nodes.push(...lfo(.06,240,f.frequency),...lfo(.11,level*.45,gain.gain))}
      else if(kind==='fountain'){const src=start(loop(fountain())),f=filter('bandpass');f.frequency.value=1300;f.Q.value=.45;src.connect(f).connect(gain)}
      else if(kind==='waves'){const src=start(loop(waves())),f=filter('lowpass');f.frequency.value=1100;src.connect(f).connect(gain)}
      else if(kind==='fire'){const src=start(loop(embers())),f=filter('bandpass');f.frequency.value=1500;f.Q.value=.6;src.connect(f).connect(gain);const low=start(loop(noise('brown'))),lf=filter('lowpass'),lg=ctx.createGain();lf.frequency.value=160;lg.gain.value=.6;nodes.push(lg);low.connect(lf).connect(lg).connect(gain)}
      else if(kind==='hum'){for(const [f,a] of [[50,.5],[100,.3],[150,.12]]){const osc=ctx.createOscillator(),g=ctx.createGain();osc.frequency.value=f;g.gain.value=a;osc.connect(g).connect(gain);start(osc);nodes.push(g)}gain.gain.value=level*.6}
      else if(kind==='insects'){const src=start(loop(noise('white'))),f=filter('bandpass');f.frequency.value=5200;f.Q.value=6;src.connect(f).connect(gain);nodes.push(...lfo(13,level*.5,gain.gain))}
      return {gain,nodes,level,rises:!!options.rises};
    }

    // ---------- Rooms: built on entry, crossfaded, torn down once silent ----------
    const rooms=new Map();let current=null,duck=1;
    function buildRoom(id){const recipe=RECIPES[id];if(!recipe)return null;const out=ctx.createGain();out.gain.value=0;out.connect(bus);const room={id,recipe,out,beds:recipe.beds.map(([kind,level,options])=>makeBed(kind,level,options,out)),next:new Map(),silentSince:0};rooms.set(id,room);return room}
    function teardown(room){for(const bed of room.beds)for(const node of bed.nodes){try{node.stop?.()}catch(ignore){}try{node.disconnect()}catch(ignore){}}try{room.out.disconnect()}catch(ignore){}rooms.delete(room.id)}
    function playEvent(room,type,gain,when){
      if(type==='chimes'){for(let i=0;i<5;i++)playEvent(room,'clink',gain*rand(.4,.9),when+i*rand(.08,.25));return}
      const src=ctx.createBufferSource(),amp=ctx.createGain();src.buffer=eventBuffer(type);src.playbackRate.value=type==='musicbox'?pick([1,1.122,1.26,1.498,1.682]):type==='clink'?rand(.8,1.5):rand(.9,1.1);amp.gain.value=gain;
      let tail=amp;if(ctx.createStereoPanner){const pan=ctx.createStereoPanner();pan.pan.value=rand(-.7,.7);amp.connect(pan);tail=pan}
      src.connect(amp);tail.connect(room.out);src.start(when);src.onended=()=>{src.disconnect();amp.disconnect();if(tail!==amp)tail.disconnect()};
    }
    function schedule(room){
      const now=ctx.currentTime,horizon=now+.35;
      for(const [interval,type,gain] of room.recipe.ticks||[]){const key='tick'+interval+type;let at=room.next.get(key)??now+rand(.05,interval);while(at<horizon){playEvent(room,type,gain,Math.max(at,now));at+=interval}room.next.set(key,at)}
      for(const [type,perMinute,gain] of room.recipe.events||[]){const key='event'+type;let at=room.next.get(key);if(at===undefined){at=now+rand(.5,60/perMinute);room.next.set(key,at)}if(at<horizon){playEvent(room,type,gain*rand(.6,1.1),Math.max(at,now));room.next.set(key,at+(60/perMinute)*rand(.4,1.6))}}
    }

    // state: {place, covered, reading, height}
    function update(state){
      if(ctx.state!=='running')return;
      const now=ctx.currentTime,id=RECIPES[state.place]?state.place:null;
      if(id&&!rooms.has(id))buildRoom(id);current=id;
      // Menus soften the room; a book keeps it, a little quieter, as company while reading.
      const target=state.covered?.25:state.reading?.7:1;if(target!==duck){duck=target;bus.gain.setTargetAtTime(duck,now,.4)}
      for(const room of [...rooms.values()]){
        const on=room.id===current;room.out.gain.setTargetAtTime(on?1:0,now,on?.9:.6);
        if(on){room.silentSince=0;schedule(room);for(const bed of room.beds)if(bed.rises)bed.gain.gain.setTargetAtTime(bed.level*(1+clamp(state.height/30,0,1)*2.5),now,.8)}
        else{room.silentSince||=now;if(now-room.silentSince>6)teardown(room)}
      }
    }
    return {update,get room(){return current},get active(){return rooms.size},recipes:RECIPES};
  };
})();
