(()=>{
'use strict';

/**
 * Library After Dark atmosphere and quality manager.
 * Centralises mood settings so rooms can share a coherent Victorian style.
 */
window.createAtmosphereSystem=function({scene,renderer}={}){
  const profiles={
    grand:{ambient:0.55, warmth:1.0, fog:0.008, dust:true},
    reading:{ambient:0.5, warmth:0.9, fog:0.012, dust:true},
    forgotten:{ambient:0.32, warmth:0.55, fog:0.025, dust:true},
    secret:{ambient:0.45, warmth:1.2, fog:0.015, dust:true}
  };

  const quality={
    high:{particles:true, shadows:true},
    medium:{particles:true, shadows:false},
    low:{particles:false, shadows:false}
  };

  let current='grand';
  let tier='high';

  function detectQuality(){
    const memory=navigator.deviceMemory||8;
    const cores=navigator.hardwareConcurrency||8;
    tier=(memory<=4||cores<=4)?'low':(memory<=8||cores<=6?'medium':'high');
    return quality[tier];
  }

  function setRoomMood(name){
    current=profiles[name]?name:'grand';
    const mood=profiles[current];
    if(scene && scene.fog){
      scene.fog.density=mood.fog;
    }
    return mood;
  }

  function apply(){
    const settings=detectQuality();
    if(renderer && renderer.shadowMap){
      renderer.shadowMap.enabled=settings.shadows;
    }
    return {mood:profiles[current],quality:tier};
  }

  return {profiles,quality,setRoomMood,apply,getQuality:()=>tier};
};
})();
