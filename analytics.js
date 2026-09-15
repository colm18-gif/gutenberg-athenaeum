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
  script.onload = () => { ready = true; };
  script.onerror = () => { ready = false; };
  let ready = false;
  window.libraryAnalytics = {
    track(name, props) {
      if (!ready || typeof window.plausible !== 'function') return;
      // Only fixed event names and finite, non-personal room labels are accepted.
      const allowed = ['Library Entered', 'Room Explored', 'Book Picked Up', 'Book Opened',
        'Reading Started', 'Book Returned', 'Secret Discovered', 'Librarian Talked To',
        'Cat Petted', 'Rabbit Door Entered', 'Engaged 5 Minutes', 'Engaged 10 Minutes'];
      if (!allowed.includes(name)) return;
      if (name === 'Room Explored' && typeof props?.room === 'string'
        && /^[a-z-]{1,32}$/.test(props.room)) window.plausible(name, { props: { room: props.room } });
      else if (name !== 'Room Explored') window.plausible(name);
    }
  };
  document.head.appendChild(script);
})();
