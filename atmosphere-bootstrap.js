(()=>{
'use strict';

// Bootstrap helper for the Victorian atmosphere layer.
// Room modules can call window.libraryAtmosphere.setRoomMood('forgotten')
// without needing to know how the system was created.

window.libraryAtmosphere = window.libraryAtmosphere || {
  mood:'grand',
  quality:'high',
  setRoomMood(name){
    this.mood=name;
    document.body.dataset.libraryMood=name;
  },
  setQuality(name){
    this.quality=name;
    document.body.dataset.quality=name;
  }
};
})();
