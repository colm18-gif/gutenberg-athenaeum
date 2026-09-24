(()=>{
'use strict';

/** Shared visual language for Library After Dark rooms. */
window.LIBRARY_THEME={
  materials:{
    oak:{colour:0x3a2414,roughness:0.78},
    brass:{colour:0x9b6b2f,roughness:0.45},
    leather:{colour:0x24140d,roughness:0.9},
    parchment:{colour:0xd6c39a,roughness:0.95}
  },
  rooms:{
    grand:{light:'warm',decay:0},
    reading:{light:'soft',decay:0.15},
    forgotten:{light:'cold',decay:0.75},
    secret:{light:'themed',decay:0.25}
  },
  getRoomStyle(name){return this.rooms[name]||this.rooms.grand;}
};
})();
