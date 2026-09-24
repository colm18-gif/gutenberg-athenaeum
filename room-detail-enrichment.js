(()=>{
'use strict';

// Environmental storytelling layer for Library After Dark.
// Provides reusable details so rooms feel inhabited rather than empty.
window.LibraryRoomDetails={
  grandHall:{
    props:['visitor ledger','brass lamp stands','restoration notes'],
    clues:['old portraits','forgotten invitations']
  },
  readingRoom:{
    props:['open notebooks','reading glasses','bookmark slips'],
    clues:['librarian annotations','unfinished research']
  },
  forgottenArchive:{
    props:['fallen books','broken shelf pieces','dust covered papers'],
    decay:['misaligned shelves','collapsed stacks','faded labels']
  },
  secretRoom:{
    props:['themed artefacts','curated manuscripts','hidden notes'],
    clues:['previous explorers','room history']
  }
};
})();
