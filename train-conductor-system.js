(()=>{
'use strict';

/**
 * Train journey framework for Library After Dark.
 * Provides a narrative travel layer: conductor -> destination -> departure -> arrival.
 */
window.createTrainConductorSystem=function(){
  const destinations=[
    {
      id:'observatory',
      name:'The Forgotten Observatory',
      description:'An abandoned station beneath the stars, filled with astronomical works.'
    },
    {
      id:'lost_archive',
      name:'The Lost Archive',
      description:'A hidden collection of rare and forgotten manuscripts.'
    },
    {
      id:'verne_workshop',
      name:'Jules Verne\'s Workshop',
      description:'A Victorian chamber of invention and imagination.'
    }
  ];

  let journey=null;

  function speak(){
    return 'The next journey awaits. Speak with the conductor when you are ready to depart.';
  }

  function begin(destinationId){
    const destination=destinations.find(d=>d.id===destinationId);
    if(!destination) return null;

    journey={
      destination,
      stage:'boarding',
      started:Date.now()
    };

    return journey;
  }

  function advance(){
    if(!journey) return null;
    const stages=['boarding','countdown','departing','travelling','arriving','complete'];
    const index=stages.indexOf(journey.stage);
    journey.stage=stages[Math.min(index+1,stages.length-1)];
    return journey;
  }

  return {
    destinations,
    speak,
    begin,
    advance,
    current:()=>journey
  };
};
})();
