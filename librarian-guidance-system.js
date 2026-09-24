(()=>{
'use strict';

/**
 * Librarian and Quill guidance layer.
 * Keeps guidance contextual without replacing exploration.
 */
window.createLibrarianGuidanceSystem=function(){
  const discoveries=new Set();

  const messages={
    firstVisit:[
      'The library reveals itself slowly. Follow the paths that interest you.',
      'Many of the finest discoveries are not found by searching.'
    ],
    forgotten:[
      'Few visitors reach these forgotten shelves.',
      'Some books here have not been opened for many years.'
    ],
    secret:[
      'You have found a place the library rarely reveals.',
      'There are still many stories hidden here.'
    ]
  };

  function discover(id){
    discoveries.add(id);
  }

  function hasDiscovered(id){
    return discoveries.has(id);
  }

  function getHint(room='firstVisit'){
    const list=messages[room]||messages.firstVisit;
    return list[Math.floor(Math.random()*list.length)];
  }

  function quillInteract(){
    return 'Quill watches the shelves quietly, waiting for the next discovery.';
  }

  return {discover,hasDiscovered,getHint,quillInteract};
};
})();
