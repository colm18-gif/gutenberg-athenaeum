const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, 'analytics.js'), 'utf8');

function run(url, hostname) {
  const appended = [], events = [];
  const context = {
    location: { hostname },
    window: { plausible: (...args) => events.push(args) },
    document: { createElement: () => ({}), head: { appendChild: el => appended.push(el) } }
  };
  vm.runInNewContext(source.replace("const PLAUSIBLE_SCRIPT_URL = '';", `const PLAUSIBLE_SCRIPT_URL = '${url}';`), context);
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
active.context.window.libraryAnalytics.track('Library Entered'); // Before script load, drop it.
assert.equal(active.events.length, 0);
active.appended[0].onload();
active.context.window.libraryAnalytics.track('Library Entered');
active.context.window.libraryAnalytics.track('Room Explored', { room: 'main-library' });
active.context.window.libraryAnalytics.track('Room Explored', { room: 'visitor@example.com' });
active.context.window.libraryAnalytics.track('Unapproved Event');
assert.equal(active.events.length, 2);
assert.equal(active.events[0][0], 'Library Entered');
assert.equal(active.events[1][1].props.room, 'main-library');
console.log('Analytics guard and event tests passed');
