const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, 'analytics.js'), 'utf8');

function run(url, hostname, preloaded = true) {
  const appended = [], events = [];
  const context = {
    location: { hostname },
    window: preloaded ? { plausible: (...args) => events.push(args) } : {},
    document: { createElement: () => ({}), head: { appendChild: el => appended.push(el) } }
  };
  vm.runInNewContext(source.replace(/const PLAUSIBLE_SCRIPT_URL = '[^']*';/, `const PLAUSIBLE_SCRIPT_URL = '${url}';`), context);
  return { context, appended, events };
}

for (const host of ['localhost', 'libraryafterdark.space']) {
  const disabled = run('', host);
  disabled.context.window.libraryAnalytics.track('Library Entered');
  assert.equal(disabled.appended.length, 0);
  assert.equal(disabled.events.length, 0);
}
const preview = run('https://plausible.io/js/pa-TEST123.js', 'localhost');
assert.equal(preview.appended.length, 0);
const active = run('https://plausible.io/js/pa-TEST123.js', 'libraryafterdark.space');
assert.equal(active.appended.length, 1);
assert.equal(typeof active.context.window.plausible.init, 'function');
active.context.window.libraryAnalytics.track('Library Entered'); // Queued even before script load.
assert.equal(active.events.length, 1);
active.context.window.libraryAnalytics.track('Library Entered');
active.context.window.libraryAnalytics.track('Room Explored', { room: 'main-library' });
active.context.window.libraryAnalytics.track('Room Explored', { room: 'invented-room' });
active.context.window.libraryAnalytics.track('Room Explored', { room: 'visitor@example.com' });
active.context.window.libraryAnalytics.track('Unapproved Event');
assert.equal(active.events.length, 3);
assert.equal(active.events[0][0], 'Library Entered');
assert.equal(active.events[2][1].props.room, 'main-library');
const queued = run('https://plausible.io/js/pa-TEST123.js', 'libraryafterdark.space', false);
queued.context.window.libraryAnalytics.track('Library Entered');
assert.equal(queued.context.window.plausible.q.length, 1);
assert.equal(queued.context.window.plausible.q[0][0], 'Library Entered');
console.log('Analytics guard and event tests passed');
