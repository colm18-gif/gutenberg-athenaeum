(()=>{
'use strict';

// Applies furniture intent to rooms without coupling layout code to specific assets.
// Designed to support future CC0 Gothic/Victorian asset replacements.
window.FurnitureApplication={
  rules:{
    readingRoom:{
      seating:'victorian-reading-chair',
      orientation:'face-books',
      purpose:'quiet reading'
    },
    grandHall:{
      seating:'carved-gothic-armchair',
      orientation:'conversation-and-discovery',
      purpose:'arrival'
    },
    forgottenArchive:{
      seating:'worn-abandoned-chair',
      orientation:'irregular',
      details:['fallen-books','crooked-furniture','dust']
    },
    secretRoom:{
      seating:'themed-antique-seating',
      orientation:'toward-discovery'
    }
  },
  get(roomType){
    return this.rules[roomType] || this.rules.readingRoom;
  }
};
})();
