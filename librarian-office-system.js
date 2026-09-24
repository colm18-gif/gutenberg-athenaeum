(()=>{
'use strict';

window.createLibrarianOfficeSystem=function(){
  const office={
    name:'Librarian Office',
    discoveries:[],
    notes:[
      'A ledger records visitors who wandered beyond the main halls.',
      'Some books appear to have returned themselves to the shelves.'
    ],
    objects:[
      'visitor ledger',
      'old keys',
      'unreturned book slips',
      'annotated manuscripts'
    ]
  };

  function recordDiscovery(item){
    if(item && !office.discoveries.includes(item)){
      office.discoveries.push(item);
    }
  }

  function getClue(){
    const remaining=office.notes.filter(n=>!office.discoveries.includes(n));
    return remaining[0] || 'The librarian has no further notes for now.';
  }

  return {office,recordDiscovery,getClue};
};
})();
