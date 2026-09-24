(()=>{
'use strict';

// Shared room styling presets for Library After Dark.
// Keeps future rooms visually coherent while allowing themed spaces.
window.LibraryRoomStyles={
  grandHall:{
    palette:{wood:'walnut',metal:'aged-brass',fabric:'burgundy'},
    atmosphere:'warm scholarly elegance',
    decay:0
  },
  readingRoom:{
    palette:{wood:'dark-oak',metal:'brass',fabric:'deep-green'},
    atmosphere:'quiet study and discovery',
    decay:0.15
  },
  forgottenArchive:{
    palette:{wood:'weathered-oak',metal:'tarnished-iron',fabric:'faded-cloth'},
    atmosphere:'forgotten and abandoned',
    decay:0.75,
    details:['fallen books','crooked frames','dusty shelves']
  },
  secretRoom:{
    palette:{wood:'polished-dark-wood',metal:'antique-brass',fabric:'themed'},
    atmosphere:'hidden and remarkable',
    decay:0.25
  }
};
})();
