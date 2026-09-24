(()=>{
'use strict';

// Connect optional Library After Dark modules without increasing coupling in game.js.
window.initialiseLibrarySystems=function(){
  const registry=window.LibrarySystems;
  if(!registry) return null;

  const systems={
    atmosphere: window.createAtmosphereSystem ? window.createAtmosphereSystem() : null,
    reading: window.BookReadingSystem || null,
    librarian: window.LibrarianGuidanceSystem || null,
    conductor: window.TrainConductorSystem || null,
    rooms: window.RoomStylePresets || null
  };

  Object.entries(systems).forEach(([name,system])=>{
    if(system) registry.register(name,system);
  });

  return registry;
};

// Allow both explicit boot-time initialisation and late module loading.
// This avoids waiting for window.load when the interactive library starts.
window.initialiseLibrarySystems();
window.addEventListener('load',()=>{
  if(window.initialiseLibrarySystems) window.initialiseLibrarySystems();
});
})();
