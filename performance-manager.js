(()=>{
'use strict';

// Adaptive performance manager for Library After Dark.
// Keeps atmosphere while scaling expensive effects for different devices.
window.LibraryPerformance={
  profile:'high',
  settings:{
    high:{particles:true,shadows:true,maxEffects:100},
    medium:{particles:true,shadows:false,maxEffects:40},
    low:{particles:false,shadows:false,maxEffects:10}
  },
  detect(){
    const memory=navigator.deviceMemory||8;
    const cores=navigator.hardwareConcurrency||8;
    if(memory<=4||cores<=4)this.profile='low';
    else if(memory<=8||cores<=6)this.profile='medium';
    else this.profile='high';
    return this.settings[this.profile];
  },
  apply(){
    return this.detect();
  }
};
})();
