const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const antipodes=fs.readFileSync('antipodes.js','utf8'),wing=fs.readFileSync('international-wing.js','utf8');
const block=(src,name)=>{const i=src.indexOf(`const ${name}={`);assert(i>=0,`${name} is defined`);return src.slice(i,src.indexOf('};',i))};

test('Akademik Vernadsky in the polar hut: its picture, card and flag, in Ukrainian and English, saying only what is so',()=>{
  const cards=block(antipodes,'VERNADSKY');
  for(const words of ['Галіндез','Galindez Island','1947','Faraday in 1977','6 February 1996','6 лютого 1996','first President of the Academy of Sciences of Ukraine (1918)','Ozone','озон','Drawn for the library','Намальовано для бібліотеки'])assert(cards.includes(words),words);
  // The pound is a story: the card never says it was paid.
  assert.match(cards,/is said to be set into the wood of the bar/);assert.match(cards,/Tellings differ/);assert.doesNotMatch(cards,/was sold for/i);
  assert.match(antipodes,/buildVernadsky\(cx,cz,front,back\);/,'it is built with the hut');
  assert.match(antipodes,/case 'antipodes-pound':\{[\s\S]{0,200}athenaeum-vernadsky-pound/,'the coin is found for good');
  assert.match(antipodes,/drawVernadsky/);assert.doesNotMatch(antipodes,/new THREE\.PointLight[^;]*\)[^;]*vernadsky/i,'no light of its own');
});

test('a postcard in the Ukrainian Reading Room tells the way to the polar hut, and the way it tells is there',()=>{
  const card=block(wing,'POSTCARD');
  for(const words of ['«Академік Вернадський»','Akademik Vernadsky','great globe in the Grand Hall','Antipodes','compass on the sea-chart cabinet','polar hut'])assert(card.includes(words),words);
  assert.match(wing,/title:POSTCARD\.title,author:POSTCARD\.card/);
  // The way it describes: the globe, the sea-chart cabinet's compass and the ship are all in antipodes.js.
  assert.match(antipodes,/TURN TO THE ANTIPODES/);assert.match(antipodes,/sea-chart|SOUTHERN PASSAGE/);assert.match(antipodes,/THE POLAR READING ROOM/);
});
