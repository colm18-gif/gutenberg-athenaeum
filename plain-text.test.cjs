const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

test('every book page offers the book as plain text, and the plain reader shares the 3D reader’s bookmark',()=>{
  const page=fs.readFileSync('book/345-dracula.html','utf8'),reader=fs.readFileSync('read.html','utf8');
  assert.match(page,/<a class="plain" href="\/read\.html\?book=345&amp;from=345-dracula\.html">Or read it as plain text<\/a>/);
  assert.match(reader,/const KEY='athenaeum-progress-'\+id/,'the same key as game.js’s loadSavedProgress');assert.match(reader,/JSON\.stringify\(\{p,n:100\}\)/);
  assert.match(reader,/texts\/bundled-gzip\/pg\$\{id\}\.txt\.gz/);assert.match(reader,/texts\/pg\$\{id\}\.txt/);
  assert.match(reader,/START OF \(THE\|THIS\) \(PROJECT GUTENBERG EBOOK\|WIKISOURCE TEXT\)/,'Wikisource texts too');
  assert.doesNotMatch(reader,/<script src=/,'no scripts to download: one small page');
});

test('the 3D reader and the opening screen point to the plain text',()=>{
  const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8');
  assert.match(html,/<a id="readerPlain" class="reader-source reader-report" target="_blank" rel="noopener"><\/a>/);
  assert.match(game,/plainLink\.href=`read\.html\?book=\$\{book\.id\}`/);
  assert.match(html,/<p class="entry-plain"><a href="\/book\/">No 3D\? Every book can be read as plain text →<\/a><\/p>/);
  assert.match(html,/read the books as plain text: /,'and the message shown when the 3D library cannot start');
});
