// Soundscape layer for The Library After Dark.
//
// Built entirely with the Web Audio API so it needs no extra downloads:
//   - short recorded effects (footsteps, pages, doors) are decoded once and played as
//     buffers, which removes HTML audio latency and lets pitch vary naturally per step;
//   - a generated impulse response gives every sound the tail of the room it is heard in:
//     long in the vaulted hall, dry on the roof, cavernous below the catalogue;
//   - rain is rebuilt as drops striking glass over a soft wash, storms bring distant
//     thunder, and the entrance clock ticks for anyone standing near it.
// If anything here is unsupported, the game keeps its original HTML audio path.
(function(){
  'use strict';
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

  // Stereo, exponentially decaying noise with high frequencies dying first, like a timber hall.
  function impulseResponse(ctx,seconds,decay,brightness){
    const rate=ctx.sampleRate,length=Math.floor(rate*seconds),buffer=ctx.createBuffer(2,length,rate);
    for(let channel=0;channel<2;channel++){
      const data=buffer.getChannelData(channel);let low=0;
      for(let i=0;i<length;i++){
        const t=i/length,envelope=Math.pow(1-t,decay),white=Math.random()*2-1;
        // A one-pole low-pass that closes over time, darkening the tail.
        const k=brightness*(1-t*.85);low+=(white-low)*k;
        data[i]=(low*.8+white*.2*(1-t))*envelope;
      }
      // Soft onset so the direct sound stays in front of the reflections.
      for(let i=0;i<Math.min(length,rate*.012);i++)data[i]*=i/(rate*.012);
    }
    return buffer;
  }

  // Rain on tall windows: a filtered wash plus thousands of tiny, individually pitched drops.
  function rainBuffer(ctx,seconds=6){
    const rate=ctx.sampleRate,length=Math.floor(rate*seconds),buffer=ctx.createBuffer(2,length,rate);
    for(let channel=0;channel<2;channel++){
      const data=buffer.getChannelData(channel);let pink=0,brown=0;
      for(let i=0;i<length;i++){const white=Math.random()*2-1;pink=pink*.96+white*.04;brown=brown*.995+white*.005;data[i]=pink*.9+brown*1.6+white*.05}
      const drops=Math.floor(seconds*420);
      for(let d=0;d<drops;d++){
        const start=Math.floor(Math.random()*length),freq=1800+Math.random()*5200,decay=.0009+Math.random()*.0025,amp=.04+Math.random()*Math.random()*.22,span=Math.floor(rate*decay*6);
        for(let j=0;j<span;j++){const index=(start+j)%length,t=j/rate;data[index]+=Math.sin(Math.PI*2*freq*t)*Math.exp(-t/decay)*amp}
      }
      // Crossfade the loop seam so the wash never clicks.
      const fade=Math.floor(rate*.05);for(let i=0;i<fade;i++){const w=i/fade;data[i]=data[i]*w+data[length-fade+i]*(1-w)}
      // Match the loudness of the original filtered-noise rain so existing gain levels still hold.
      let sum=0;for(let i=0;i<length;i++)sum+=data[i]*data[i];const scale=.03/Math.max(1e-6,Math.sqrt(sum/length));for(let i=0;i<length;i++)data[i]*=scale;
    }
    return buffer;
  }

  window.createSoundscape=function({audioCtx,master}){
    const ctx=audioCtx,destination=ctx.destination;
    // Recorded samples bypass the master gain because their volumes already include the sound level.
    const sampleBus=ctx.createGain();sampleBus.connect(destination);
    const reverb=ctx.createConvolver(),reverbSend=ctx.createGain(),reverbReturn=ctx.createGain();
    reverb.buffer=impulseResponse(ctx,3.2,3.4,.32);reverbSend.gain.value=1;reverbReturn.gain.value=.75;
    reverbSend.connect(reverb).connect(reverbReturn).connect(destination);
    const masterSend=ctx.createGain(),sampleSend=ctx.createGain();masterSend.gain.value=.55;sampleSend.gain.value=.8;
    master.connect(masterSend).connect(reverbSend);sampleBus.connect(sampleSend).connect(reverbSend);

    // ---------- Decoded one-shot samples ----------
    const buffers=new Map(),loading=new Map(),active=new Map();let muted=false;
    function load(name,src){if(buffers.has(name)||loading.has(name))return;const job=fetch(src).then(response=>{if(!response.ok)throw new Error(src);return response.arrayBuffer()}).then(data=>new Promise((resolve,reject)=>{const result=ctx.decodeAudioData(data,resolve,reject);if(result?.then)result.then(resolve,reject)})).then(buffer=>{buffers.set(name,buffer)}).catch(()=>{}).finally(()=>loading.delete(name));loading.set(name,job)}
    function preload(definitions,skip=[]){for(const [name,definition] of Object.entries(definitions))if(!skip.includes(name))load(name,definition.src)}
    function play(name,gain,rate,maxDuration){
      const buffer=buffers.get(name);if(!buffer||muted||ctx.state!=='running')return false;
      const source=ctx.createBufferSource(),amp=ctx.createGain(),now=ctx.currentTime;
      source.buffer=buffer;source.playbackRate.value=clamp(rate,.6,1.6);amp.gain.value=clamp(gain,0,1.5);
      source.connect(amp).connect(sampleBus);
      source.start(now);
      if(maxDuration){const fade=.08,end=now+maxDuration;amp.gain.setValueAtTime(amp.gain.value,Math.max(now,end-fade));amp.gain.linearRampToValueAtTime(0,end);source.stop(end+.02)}
      let set=active.get(name);if(!set){set=new Set();active.set(name,set)}set.add(source);
      source.onended=()=>{set.delete(source);source.disconnect();amp.disconnect()};
      return true;
    }
    function stop(names){const now=ctx.currentTime;for(const name of names){const set=active.get(name);if(!set)continue;for(const source of set){try{source.stop(now+.03)}catch(ignore){}}}}
    function stopAll(){stop([...active.keys()])}
    function setMuted(value){muted=value;if(muted)stopAll()}

    // ---------- Room acoustics ----------
    // Wet level and tail brightness follow the kind of space the reader is standing in.
    const SPACES={hall:{wet:.75,send:.55},room:{wet:.4,send:.45},wing:{wet:.55,send:.5},cellar:{wet:1,send:.65},outdoor:{wet:.12,send:.3},carriage:{wet:.2,send:.35},stair:{wet:.85,send:.6},deep:{wet:1.2,send:.8,echo:.34}};
    // Deep underground a short slap echo comes back off the rock after every footstep and drip.
    const echoSend=ctx.createGain(),echoDelay=ctx.createDelay(1),echoFeedback=ctx.createGain(),echoTone=ctx.createBiquadFilter();
    echoSend.gain.value=0;echoDelay.delayTime.value=.26;echoFeedback.gain.value=.32;echoTone.type='lowpass';echoTone.frequency.value=1700;
    sampleBus.connect(echoSend);master.connect(echoSend);echoSend.connect(echoDelay).connect(echoTone).connect(echoFeedback).connect(echoDelay);echoTone.connect(destination);
    let space='hall';
    function setSpace(name){if(!SPACES[name]||name===space)return;space=name;const s=SPACES[name],now=ctx.currentTime;reverbReturn.gain.setTargetAtTime(s.wet,now,.6);masterSend.gain.setTargetAtTime(s.send,now,.6);echoSend.gain.setTargetAtTime(s.echo||0,now,.6)}

    // ---------- The deep ----------
    // A low rumble of the earth that grows with depth (built the first time anyone goes down), and now and
    // then a distant tremor.
    let rumble=null;
    function noiseBuffer(seconds,brown=true){const length=Math.floor(ctx.sampleRate*seconds),buffer=ctx.createBuffer(1,length,ctx.sampleRate),data=buffer.getChannelData(0);let last=0;for(let i=0;i<length;i++){const white=Math.random()*2-1;last=brown?(last+.02*white)/1.02:white;data[i]=brown?last*3.5:white}return buffer}
    function setDepth(depth){
      if(!rumble){if(depth<=0)return;const gain=ctx.createGain(),tone=ctx.createBiquadFilter();gain.gain.value=0;tone.type='lowpass';tone.frequency.value=140;tone.connect(gain).connect(master);
        const noise=ctx.createBufferSource();noise.buffer=noiseBuffer(4);noise.loop=true;noise.connect(tone);noise.start();
        const hum=[37,41.5].map(frequency=>{const o=ctx.createOscillator(),level=ctx.createGain();o.frequency.value=frequency;level.gain.value=.22;o.connect(level).connect(tone);o.start();return o});
        rumble={gain,noise,hum}}
      rumble.gain.gain.setTargetAtTime(muted?0:clamp(depth,0,1)**1.4*.34,ctx.currentTime,.8);
    }
    function tremor(strength=1){
      if(muted||ctx.state!=='running')return;const now=ctx.currentTime,source=ctx.createBufferSource(),tone=ctx.createBiquadFilter(),gain=ctx.createGain();
      source.buffer=noiseBuffer(3.2);tone.type='lowpass';tone.frequency.value=95;gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.9*strength,now+.7);gain.gain.exponentialRampToValueAtTime(.001,now+3.1);
      source.connect(tone).connect(gain).connect(master);source.start(now);source.stop(now+3.2);source.onended=()=>{source.disconnect();tone.disconnect();gain.disconnect()};
      // Loosened grit pattering down a moment later.
      for(let i=0;i<7;i++){const at=now+.9+Math.random()*1.6,o=ctx.createOscillator(),g=ctx.createGain();o.type='triangle';o.frequency.value=900+Math.random()*1600;g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(.025*strength,at+.004);g.gain.exponentialRampToValueAtTime(.0005,at+.07);o.connect(g).connect(sampleBus);o.start(at);o.stop(at+.08);o.onended=()=>{o.disconnect();g.disconnect()}}
    }

    // ---------- Weather ----------
    function makeRainSource(){const source=ctx.createBufferSource();source.buffer=rainBuffer(ctx);source.loop=true;return source}
    let nextThunderAt=ctx.currentTime+18+Math.random()*20;
    function thunder(distance=1){
      if(muted)return;const now=ctx.currentTime,length=Math.floor(ctx.sampleRate*(5+Math.random()*3)),buffer=ctx.createBuffer(2,length,ctx.sampleRate);
      for(let c=0;c<2;c++){const data=buffer.getChannelData(c);let low=0,rumble=0;for(let i=0;i<length;i++){const t=i/ctx.sampleRate,white=Math.random()*2-1;low+=(white-low)*.02;rumble=rumble*.9995+white*.0005;const crack=t<.25?Math.exp(-t*14)*(1-distance*.7):0,roll=Math.exp(-t*.55)*(.55+.45*Math.sin(t*2.3+c));data[i]=low*roll*2.4+rumble*9*roll+white*crack*.25}}
      const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=buffer;filter.type='lowpass';filter.frequency.value=380-distance*160;gain.gain.value=.5*(1-distance*.5);
      source.connect(filter).connect(gain).connect(master);source.start(now+distance*1.8);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect()};
      return distance*1.8;
    }

    // ---------- Entrance clock ----------
    const tickGain=ctx.createGain(),tickPan=ctx.createStereoPanner?ctx.createStereoPanner():null;tickGain.gain.value=0;
    if(tickPan)tickGain.connect(tickPan).connect(master);else tickGain.connect(master);
    const tickBuffer=(()=>{const length=Math.floor(ctx.sampleRate*.06),buffer=ctx.createBuffer(1,length,ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<length;i++){const t=i/ctx.sampleRate;data[i]=(Math.sin(t*2*Math.PI*2600)*.5+Math.sin(t*2*Math.PI*1150)*.5+(Math.random()*2-1)*.35)*Math.exp(-t*140)}return buffer})();
    let nextTickAt=ctx.currentTime+1,tock=false;
    function scheduleTicks(){while(nextTickAt<ctx.currentTime+.25){const source=ctx.createBufferSource();source.buffer=tickBuffer;source.playbackRate.value=tock?.82:1;source.connect(tickGain);source.start(Math.max(nextTickAt,ctx.currentTime));source.onended=()=>source.disconnect();tock=!tock;nextTickAt+=1}}

    // state: {x,y,z,yaw,space,weather,indoorsNearGlass,covered}
    let lightningHandler=null;
    function update(state){
      if(ctx.state!=='running')return;
      setSpace(state.space);
      // Clock: audible within ~16 m of the entrance wall, panned by where it sits relative to the view.
      const dx=state.clock.x-state.x,dz=state.clock.z-state.z,distance=Math.hypot(dx,dz,(state.clock.y-state.y-1.7)*.5),level=muted||state.covered?0:clamp(1-distance/16,0,1);
      tickGain.gain.setTargetAtTime(level*level*.16,ctx.currentTime,.25);
      if(tickPan&&distance>.1){const angle=Math.atan2(dx,dz)-Math.atan2(-Math.sin(state.yaw),-Math.cos(state.yaw));tickPan.pan.setTargetAtTime(clamp(-Math.sin(angle)*.8,-1,1),ctx.currentTime,.2)}
      if(level>0)scheduleTicks();else nextTickAt=ctx.currentTime+.3;
      // Thunder only during storms and only where the sky can be heard.
      if(state.weather==='STORM'&&state.hearsSky&&!state.covered&&ctx.currentTime>=nextThunderAt){const distanceFactor=Math.random()*.8;const delay=thunder(distanceFactor);lightningHandler?.(1-distanceFactor,delay);nextThunderAt=ctx.currentTime+22+Math.random()*38}
      else if(state.weather!=='STORM')nextThunderAt=Math.max(nextThunderAt,ctx.currentTime+12);
    }

    return {preload,play,stop,stopAll,setMuted,setSpace,update,setDepth,tremor,makeRainSource,thunder,onLightning(handler){lightningHandler=handler},get space(){return space}};
  };
})();
