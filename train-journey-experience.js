/*
 * Train Journey Experience
 * Adds narrative journey flow around the conductor system.
 */

(function () {
  window.TrainJourneyExperience = {
    states: [
      'approaching',
      'boarding',
      'countdown',
      'departing',
      'travelling',
      'arriving',
      'complete'
    ],

    destinations: [
      {
        id: 'forgotten_observatory',
        name: 'The Forgotten Observatory',
        description: 'A remote station overlooking forgotten astronomical records.'
      },
      {
        id: 'lost_archive',
        name: 'The Lost Archive',
        description: 'A hidden collection of manuscripts and rare works.'
      },
      {
        id: 'verne_workshop',
        name: "Jules Verne's Workshop",
        description: 'A world of invention, imagination and exploration.'
      }
    ],

    currentState: 'approaching',
    currentDestination: null,

    beginJourney(destinationId) {
      this.currentDestination = this.destinations.find(d => d.id === destinationId);
      this.currentState = 'boarding';
      return this.currentDestination;
    },

    advance() {
      const index = this.states.indexOf(this.currentState);
      if (index < this.states.length - 1) {
        this.currentState = this.states[index + 1];
      }
      return this.currentState;
    }
  };
})();
