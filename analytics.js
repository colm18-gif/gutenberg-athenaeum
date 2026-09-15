// Site-specific URL supplied by the owner from Plausible's installation screen.
const PLAUSIBLE_SCRIPT_URL = 'https://plausible.io/js/pa-nD_g44fQQBbeVFD1ofS4k.js';

(() => {
  const enabled = /^https:\/\/plausible\.io\/js\/pa-[A-Za-z0-9_-]+\.js$/.test(PLAUSIBLE_SCRIPT_URL)
    && location.hostname === 'libraryafterdark.space';
  if (!enabled) {
    window.libraryAnalytics = { track() {} };
    return;
  }
  // Plausible's current snippet initializes its command queue before loading the script.
  window.plausible = window.plausible || function () {
    (window.plausible.q = window.plausible.q || []).push(arguments);
  };
  window.plausible.init = window.plausible.init || function (options) {
    window.plausible.o = options || {};
  };
  window.plausible.init();
  const script = document.createElement('script');
  script.async = true;
  script.src = PLAUSIBLE_SCRIPT_URL;
  window.libraryAnalytics = {
    track(name, props) {
      // The site's entry button may be used before the async tracker loads.
      // Plausible's documented command queue preserves that first event.
      if (typeof window.plausible !== 'function') return;
      // Only fixed event names and finite, non-personal room labels are accepted.
      const allowed = ['Library Entered', 'Room Explored', 'Book Picked Up', 'Book Opened',
        'Reading Started', 'Book Returned', 'Secret Discovered', 'Librarian Talked To',
        'Cat Petted', 'Rabbit Door Entered', 'Engaged 5 Minutes', 'Engaged 10 Minutes'];
      if (!allowed.includes(name)) return;
      const rooms = ['main-library', 'upper-floor', 'roof-garden', 'west-wing', 'east-wing',
        'restricted-stacks', 'below-catalogue', 'portrait-room', 'tunnel', 'archive',
        'rabbit-room', 'returning', 'quiet', 'unread', 'repository', 'gothic', 'inquiry',
        'chart', 'drawing', 'study', 'garden', 'contested'];
      if (name === 'Room Explored' && typeof props?.room === 'string'
        && rooms.includes(props.room)) window.plausible(name, { props: { room: props.room } });
      else if (name !== 'Room Explored') window.plausible(name);
    }
  };
  document.head.appendChild(script);
})();
