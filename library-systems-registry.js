(()=>{
'use strict';

// Shared registry for optional Library After Dark systems.
// Keeps new features modular while allowing the main runtime to discover them.
window.LibrarySystems = window.LibrarySystems || {
  atmosphere: null,
  reading: null,
  librarian: null,
  conductor: null,
  rooms: null,
  register(name, system){
    this[name]=system;
    return system;
  },
  get(name){
    return this[name] || null;
  }
};
})();
