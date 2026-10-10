// The Voynich Manuscript, a facsimile: the book on the lectern in the Restricted Catalogue (game.js), the one book in
// the library nobody has ever needed to forbid, because nobody can read it. Yale's Beinecke Library, MS 408: fifteen of
// its pages, a real opening from each part of the book, photographs in the public domain from Wikimedia Commons
// (scripts/fetch-book-pages.mjs, assets/voynich), bound with a title page, the manuscript's owners, its six parts, those
// who have tried to read it and a colophon, on thick board leaves (fine-books.js). Its drawn pages are written in lines
// of the script itself, drawn after the commonest words of the manuscript as they are transcribed.
(function(){
  'use strict';

  // The pages, in the manuscript's order, each named for its folio, with its card.
  const FOLIOS={
    '001r':['Folio 1r','The first page','Four paragraphs and no picture, with a few letters picked out large in red, as if the book began with a key, though nobody has made one of it. Near the foot, almost rubbed away, is the name of Jacobus Horčický de Tepenec, chemist to the Emperor Rudolf II, which became readable under ultraviolet light.'],
    '009v':['Folio 9v','The pansy','The plant most often named: three-coloured flowers that look like the wild pansy, Viola tricolor, in blue and yellow. It is one of the very few in the herbal that most people agree on.'],
    '010r':['Folio 10r','A plant nobody has named','Facing the pansy, broad leaves in green and olive, a blue head and red knots at the root. Most of the herbal is like this: plants that look half familiar, as if drawn from memory or put together from parts of several.'],
    '055v':['Folio 55v','A sheaf of leaves','A spike of dark seeds or berries on a stalk rising from a great sheaf of green leaves, over a branching root. The text sits round the drawing, as if the drawing came first.'],
    '056r':['Folio 56r','Blue flowers and a spiral','Dark blue flowers and a spiral of pointed blue leaves, with spiny rosettes at the foot of the stem. The photograph’s file calls it Drosera, the sundew; like every name given to these plants, it is a guess.'],
    '070v1':['Folio 70v','Aries, on a dark ground','From the zodiac: a ram at the centre of rings of small women, each holding a star on a thread, some standing in tubs. Beside each sign a month is written in ordinary letters, in a Romance language and perhaps by a later hand: the only plainly readable words in the book.'],
    '071r':['Folio 71r','Aries again','The ram once more, on a light ground, with its own rings of women and stars. The zodiac runs across twelve such pages, Aries and Taurus taking two each; Capricorn and Aquarius are missing, perhaps on a leaf that has been lost.'],
    '077v':['Folio 77v','The bathers','The part called balneological, for want of a better name: small, round-bellied women in pools of green and blue water, joined by pipes and tubes that some have likened to the organs of the body and others to the plumbing of a spa.'],
    '078r':['Folio 78r','The two pools','The most reproduced page in the book: bathers in two green pools, the water carried from one to the other in a long pipe. Its text has some of the manuscript’s strangest repetitions, the same word written again and again in a row.'],
    rosettes:['Folios 85 and 86','The nine rosettes','The largest fold-out, opened flat: nine roundels joined by causeways, with stars, a sun and what looks like a walled town or castle in one corner. Folded, it is several pages of the book; opened, it is the size of a small map.'],
    '099v':['Folio 99v','The jars','From the pharmaceutical part: jars like an apothecary’s, painted as if in wood or majolica, beside rows of roots and leaves, each with a word of the script beside it as if it were labelled.'],
    '100r':['Folio 100r','More roots and leaves','Facing the jars, more parts of plants laid out in rows and labelled, as on a shelf of simples. If the labels are names, they are the best hope of a key; nobody has yet made them give one.'],
    '102v':['Folio 102v','The last of the jars','The pharmaceutical part ends with more jars and roots, the page stained near its top. The paint here is thicker and brighter than the drawing beneath it, and the colours may have been added later, by another hand.'],
    '103r':['Folio 103r','The recipes begin','The last part of the book: no pictures, only short paragraphs, each beside a small star in the margin. Its readers call it the recipes, though nobody knows that it is.'],
    '116v':['Folio 116v','The last page','A few lines in a different hand, mixing ordinary letters with the script’s. They have been read as a charm, as a note of ownership, and as broken Latin and German; no reading is agreed.']
  };
  const DRAWN={
    'paste-front':['The front pastedown','Ex libris','The library’s bookplate.'],
    'v-title':['The title page','The Voynich Manuscript','Beinecke MS 408: fifteen of its pages, in facsimile.'],
    owners:['A note','Its owners','Who has had the manuscript, as far as anyone knows.'],
    sections:['A note','The six parts','How the manuscript divides, by its pictures.'],
    readers:['A note','Those who tried','Some of those who have tried to read it, and what they found.'],
    colophon:['The colophon','The Voynich Manuscript','How the book was made, as far as anyone can tell.'],
    'paste-back':['The back pastedown','The end','Or perhaps not.']
  };
  // The faces of the eleven leaves that turn, front then back of each. The manuscript's pages lie in real openings, a
  // verso facing the next recto, as they face each other in the book.
  const FACES=['cover','paste-front','v-title','owners','001r','009v','010r','055v','056r','070v1','071r','077v','078r','sections','rosettes','099v','100r','102v','103r','116v','readers','colophon'];
  const INK='#3b2a1c',BROWN='#6a4a2c',RED='#9c3b25',GREEN='#5d7d4e',BLUE='#4a6a8c',VELLUM='#e4d6b6';

  // Vellum, as the manuscript's is: warm and uneven, the hair side flecked where the follicles were, a little cockled,
  // darker at the edges where hands have held it for six hundred years.
  function paper(c,w,h,seed=1){
    c.fillStyle=VELLUM;c.fillRect(0,0,w,h);
    let s=seed*9301+49297;const rnd=()=>(s=(s*9301+49297)%233280)/233280;
    for(let i=0;i<60;i++){const x=rnd()*w,y=rnd()*h,r=60+rnd()*220,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${rnd()<.55?'158,128,84':'255,248,226'},${.04+rnd()*.06})`);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)}
    for(let i=0;i<w*h/4200;i++){c.fillStyle=`rgba(110,80,46,${.05+rnd()*.12})`;c.beginPath();c.arc(rnd()*w,rnd()*h,.6+rnd()*1.3,0,Math.PI*2);c.fill()}
    c.strokeStyle='rgba(120,92,58,.06)';c.lineWidth=14;for(let i=0;i<6;i++){c.beginPath();const y=rnd()*h;c.moveTo(0,y);c.bezierCurveTo(w*.3,y+rnd()*80-40,w*.7,y+rnd()*80-40,w,y+rnd()*60-30);c.stroke()}
    const edge=c.createRadialGradient(w/2,h/2,Math.min(w,h)*.36,w/2,h/2,Math.max(w,h)*.74);edge.addColorStop(0,'rgba(0,0,0,0)');edge.addColorStop(1,'rgba(104,74,40,.3)');c.fillStyle=edge;c.fillRect(0,0,w,h);
  }

  // The script, drawn: each letter a few strokes of a quill, after the shapes the transcriptions give names to (EVA:
  // o, a, i, n, e, ch, y, d, l, r, s, q and the tall "gallows" k, t, p, f). The words are among the manuscript's commonest.
  const WORDS=['daiin','chedy','ol','shedy','aiin','chol','or','ar','qokeedy','qokedy','chey','dy','okaiin','qokain','shol','otedy','okedy','dar','qokaiin','cthy','otaiin','chor','sain','okal','ykeedy','lchedy','oteey','pchedy','dal','fachys'];
  function glyphs(c,word,x,y,s,ink=INK,seed=1){
    let r=seed*7919+13;const j=()=>((r=(r*9301+49297)%233280)/233280-.5)*s*.06;
    c.save();c.strokeStyle=ink;c.lineWidth=Math.max(1.2,s*.11);c.lineCap='round';c.lineJoin='round';
    const bowl=(cx)=>{c.beginPath();c.ellipse(cx+j(),y-s*.32+j(),s*.24,s*.3,0,0,Math.PI*2);c.stroke()};
    const cee=(cx)=>{c.beginPath();c.arc(cx+s*.2+j(),y-s*.3+j(),s*.24,Math.PI*.3,Math.PI*1.75);c.stroke()};
    const minim=(cx,tail)=>{c.beginPath();c.moveTo(cx+j(),y-s*.6);c.lineTo(cx+j(),y);if(tail){c.quadraticCurveTo(cx+s*.1,y+s*.12,cx+s*.34,y-s*.28)}c.stroke()};
    const gallows=(cx,loops)=>{c.beginPath();c.moveTo(cx,y);c.lineTo(cx+j(),y-s*1.35);c.moveTo(cx+s*.42,y);c.lineTo(cx+s*.42+j(),y-s*1.15);c.stroke();
      c.beginPath();c.moveTo(cx,y-s*1.1);c.bezierCurveTo(cx+s*.5,y-s*1.75,cx+s*1.05,y-s*1.25,cx+s*.42,y-s*.82);c.stroke();
      if(loops>1){c.beginPath();c.moveTo(cx+s*.42,y-s*1.0);c.bezierCurveTo(cx+s*.9,y-s*1.5,cx+s*1.2,y-s*.9,cx+s*.7,y-s*.6);c.stroke()}};
    let px=x;const w=word.toLowerCase();
    for(let i=0;i<w.length;i++){const ch=w[i],next=w[i+1];
      if(ch==='o'){bowl(px+s*.26);px+=s*.6}
      else if(ch==='a'){cee(px);minim(px+s*.46);px+=s*.68}
      else if(ch==='i'){minim(px+s*.08);px+=s*.22}
      else if(ch==='n'){minim(px+s*.08,true);px+=s*.5}
      else if(ch==='e'){cee(px);px+=s*.44}
      else if(ch==='c'&&next==='h'){cee(px);cee(px+s*.36);c.beginPath();c.moveTo(px+s*.1,y-s*.6);c.lineTo(px+s*.74,y-s*.6);c.stroke();px+=s*.86;i++}
      else if(ch==='c'&&next==='t'){cee(px);gallows(px+s*.4,1);cee(px+s*.7);px+=s*1.22;i++}
      else if(ch==='s'&&next==='h'){cee(px);c.beginPath();c.moveTo(px+s*.1,y-s*.62);c.quadraticCurveTo(px+s*.3,y-s*.95,px+s*.5,y-s*.62);c.stroke();cee(px+s*.36);px+=s*.86;i++}
      else if(ch==='c'){cee(px);px+=s*.44}
      else if(ch==='y'){cee(px);c.beginPath();c.moveTo(px+s*.46,y-s*.55);c.lineTo(px+s*.46+j(),y+s*.1);c.quadraticCurveTo(px+s*.4,y+s*.42,px,y+s*.36);c.stroke();px+=s*.66}
      else if(ch==='d'){bowl(px+s*.26);c.beginPath();c.moveTo(px+s*.48,y-s*.3);c.quadraticCurveTo(px+s*.62,y-s*.95,px+s*.2,y-s*.92);c.stroke();px+=s*.66}
      else if(ch==='l'){c.beginPath();c.moveTo(px+s*.12,y-s*.95);c.lineTo(px+s*.12+j(),y-s*.05);c.quadraticCurveTo(px+s*.3,y+s*.12,px+s*.45,y-s*.18);c.stroke();px+=s*.55}
      else if(ch==='r'){c.beginPath();c.moveTo(px+s*.06,y-s*.55);c.quadraticCurveTo(px+s*.34,y-s*.75,px+s*.3,y-s*.4);c.lineTo(px+s*.12,y);c.lineTo(px+s*.42,y-s*.04);c.stroke();px+=s*.52}
      else if(ch==='s'){c.beginPath();c.moveTo(px+s*.42,y-s*.6);c.quadraticCurveTo(px+s*.02,y-s*.66,px+s*.12,y-s*.3);c.quadraticCurveTo(px+s*.24,y,px+s*.02,y+s*.02);c.stroke();px+=s*.52}
      else if(ch==='q'){c.beginPath();c.moveTo(px+s*.36,y);c.lineTo(px+s*.36,y-s*.85);c.lineTo(px+s*.02,y-s*.32);c.lineTo(px+s*.5,y-s*.32);c.stroke();px+=s*.6}
      else if(ch==='k'){gallows(px,2);px+=s*.9}
      else if(ch==='t'){gallows(px,1);px+=s*.9}
      else if(ch==='p'){gallows(px,2);c.beginPath();c.moveTo(px-s*.1,y-s*1.38);c.lineTo(px+s*.12,y-s*1.38);c.stroke();px+=s*.9}
      else if(ch==='f'){gallows(px,1);c.beginPath();c.moveTo(px-s*.1,y-s*1.38);c.lineTo(px+s*.12,y-s*1.38);c.stroke();px+=s*.9}
      else px+=s*.3}
    c.restore();return px-x;
  }
  // A line of the script from x0 to x1, word after word, as the scribes wrote it: no capitals, no punctuation, a space
  // between words.
  function scriptLine(c,x0,x1,y,s,seed,ink){let x=x0,k=seed;while(true){const word=WORDS[(k*7+3)%WORDS.length];k++;const w=glyphs(c,word,x,y,s,ink,k);if(x+w>x1)break;x+=w+s*.55;if(x>x1-s*2)break}}
  // A small rosette, like those on the great fold-out: rings and spokes, with a star at the middle.
  function rosette(c,x,y,r,ink=INK){
    c.save();c.strokeStyle=ink;c.lineWidth=r*.035;
    for(const k of [1,.78,.5])c.beginPath(),c.arc(x,y,r*k,0,Math.PI*2),c.stroke();
    for(let i=0;i<16;i++){const a=i*Math.PI/8;c.beginPath();c.moveTo(x+Math.cos(a)*r*.5,y+Math.sin(a)*r*.5);c.lineTo(x+Math.cos(a)*r*.78,y+Math.sin(a)*r*.78);c.stroke()}
    c.fillStyle=BLUE;for(let i=0;i<8;i++){const a=i*Math.PI/4+Math.PI/8;c.beginPath();c.ellipse(x+Math.cos(a)*r*.89,y+Math.sin(a)*r*.89,r*.07,r*.05,a,0,Math.PI*2);c.fill()}
    c.fillStyle=RED;c.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,rr=i%2?r*.12:r*.3;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}c.closePath();c.fill();c.restore();
  }
  // A star in the margin, as each paragraph of the recipes has one.
  function star(c,x,y,r,colour=RED){c.save();c.fillStyle=colour;c.beginPath();for(let i=0;i<14;i++){const a=i*Math.PI/7-Math.PI/2,rr=i%2?r*.38:r;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}c.closePath();c.fill();c.restore()}

  const VOYNICH={id:'voynich',sheet:null,base:'assets/voynich/',manifestFile:'voynich.json',aspect:1690/1160,FOLIOS,DRAWN,FACES,
    header:'THE VOYNICH MANUSCRIPT · BEINECKE MS 408',label:'The Voynich Manuscript, a facsimile',source:'Yale University, Beinecke Rare Book and Manuscript Library, MS 408.',
    coverCard:['The Voynich Manuscript','A facsimile in limp vellum, as plain as the manuscript’s own cover. Turn the cover to open it.'],
    font:{family:'Voynich Fell',url:'assets/fonts/im-fell-english-sc-latin-400-normal.woff2'},
    binding:{leather:0xd2c29c,edges:0xd8c8a2,gilt:false},
    paper,
    painters({lines,fontFamily}){
      return {
        'paste-front':(c,w,h)=>{paper(c,w,h,3);const bw=w*.5,bh=h*.24,x=(w-bw)/2,y=h*.34;c.strokeStyle=BROWN;c.lineWidth=4;c.strokeRect(x,y,bw,bh);c.lineWidth=1.5;c.strokeRect(x+12,y+12,bw-24,bh-24);
          c.fillStyle=INK;c.textAlign='center';c.font=`italic 42px Georgia, serif`;c.fillText('Ex libris',w/2,y+bh*.34);c.font=`40px ${fontFamily()}`;c.fillText('THE LIBRARY',w/2,y+bh*.58);c.fillText('AFTER DARK',w/2,y+bh*.58+46);
          rosette(c,w/2,y+bh+110,58,BROWN)},
        'v-title':(c,w,h)=>{paper(c,w,h,5);
          for(let k=0;k<3;k++)scriptLine(c,110,w-110,170+k*62,30,k*5+1,BROWN);
          c.fillStyle=INK;c.textAlign='center';c.font=`76px ${fontFamily()}`;c.fillText('THE VOYNICH',w/2,h*.33);c.fillText('MANUSCRIPT',w/2,h*.33+88);
          c.fillStyle=RED;c.font=`38px ${fontFamily()}`;c.fillText('BEINECKE MS 408',w/2,h*.47);
          rosette(c,w/2,h*.58,92);
          c.fillStyle=INK;c.font='italic 36px Georgia, serif';c.fillText('fifteen of its pages, in facsimile',w/2,h*.7);
          c.font='29px Georgia, serif';c.fillText('Yale University, Beinecke Rare Book and Manuscript Library',w/2,h*.745);
          c.fillStyle=RED;c.font=`32px ${fontFamily()}`;c.fillText('FOR THE LIBRARY AFTER DARK',w/2,h*.82);
          for(let k=0;k<2;k++)scriptLine(c,110,w-110,h-200+k*62,30,k*5+11,BROWN)},
        owners:(c,w,h)=>{paper(c,w,h,7);
          c.fillStyle=RED;c.textAlign='center';c.font=`64px ${fontFamily()}`;c.fillText('Its owners',w/2,190);
          c.fillStyle=INK;c.font='italic 31px Georgia, serif';lines(c,'as far as anyone knows, from the court at Prague to Yale',w/2,240,w-260,42);
          c.textAlign='left';let y=340;
          for(const [who,what] of [
            ['The Emperor Rudolf II','is said to have paid six hundred ducats for it, so a letter of 1665 or 1666 reports.'],
            ['Jacobus Horčický de Tepenec','his chemist, whose name is on the first page.'],
            ['Georg Baresch','an alchemist in Prague, who copied pages and sent them to Athanasius Kircher in Rome, hoping he could read them.'],
            ['Johannes Marcus Marci','rector of the university at Prague, who sent the book itself to Kircher with that letter.'],
            ['The Jesuits of the Collegio Romano','who kept it, and in time moved it to the Villa Mondragone near Frascati.'],
            ['Wilfrid Voynich','a dealer in rare books, who bought it there in 1912 and gave it his name.'],
            ['Ethel Lilian Voynich','his widow, the author of The Gadfly; after her death in 1960 it was sold to the dealer H. P. Kraus.'],
            ['Yale University','to which Kraus, unable to sell it, gave it in 1969.']]){
            star(c,118,y-12,13,RED);c.fillStyle=INK;c.font=`34px ${fontFamily()}`;c.fillText(who,148,y);c.font='29px Georgia, serif';y=lines(c,what,148,y+42,w-260,39)+18}
          scriptLine(c,110,w-110,Math.min(h-110,y+40),28,23,BROWN)},
        sections:(c,w,h)=>{paper(c,w,h,9);
          c.fillStyle=RED;c.textAlign='center';c.font=`64px ${fontFamily()}`;c.fillText('The six parts',w/2,190);
          c.fillStyle=INK;c.font='italic 31px Georgia, serif';lines(c,'named by its readers after its pictures, for nobody can read what its author called them',w/2,240,w-240,42);
          c.textAlign='left';let y=380;
          for(const [part,what] of [
            ['The herbal','plants, one or two to a page, few of which anyone can name.'],
            ['The astronomical','circles of the sun, moon and stars, and the signs of the zodiac.'],
            ['The balneological','women bathing in pools joined by pipes.'],
            ['The cosmological','rosettes and circles, among them the great fold-out of nine.'],
            ['The pharmaceutical','jars, and roots and leaves laid out in rows.'],
            ['The recipes','short paragraphs, each beside a star.']]){
            star(c,118,y-12,13,RED);c.fillStyle=INK;c.font=`38px ${fontFamily()}`;c.fillText(part,148,y);c.font='30px Georgia, serif';y=lines(c,what,148,y+44,w-260,40)+30}
          rosette(c,w/2,Math.min(h-170,y+80),70,BROWN)},
        readers:(c,w,h)=>{paper(c,w,h,11);
          c.fillStyle=RED;c.textAlign='center';c.font=`64px ${fontFamily()}`;c.fillText('Those who tried',w/2,180);
          c.textAlign='left';let y=280;
          for(const [who,what] of [
            ['William Newbold, 1921','announced that Roger Bacon had written it in a shorthand too small to see. The shorthand was the cracking of the ink.'],
            ['William Friedman','who led the breaking of Japan’s diplomatic cipher in 1940, worked on it for decades with two study groups, and came to think it might be written in an invented language.'],
            ['Prescott Currier, 1976','showed that it is written in two “languages”, A and B, in different hands, with different habits.'],
            ['Gordon Rugg, 2004','showed that text very like it could be made with tables of syllables and a card with holes, and so might mean nothing.'],
            ['The University of Arizona, 2009','dated the vellum by radiocarbon to between 1404 and 1438.'],
            ['Lisa Fagin Davis, 2020','found the hands of five scribes in it.']]){
            star(c,118,y-12,13,RED);c.fillStyle=INK;c.font=`34px ${fontFamily()}`;c.fillText(who,148,y);c.font='29px Georgia, serif';y=lines(c,what,148,y+42,w-260,39)+24}
          c.font='italic 31px Georgia, serif';y=lines(c,'Every year or so someone announces that it is solved. None of them has yet convinced anyone else.',118,y+10,w-236,42);
          scriptLine(c,110,w-110,Math.min(h-110,y+50),28,31,BROWN)},
        colophon:(c,w,h)=>{paper(c,w,h,13);
          for(let k=0;k<2;k++)scriptLine(c,110,w-110,150+k*58,28,k*7+41,BROWN);
          c.fillStyle=RED;c.font=`110px ${fontFamily()}`;c.textAlign='left';c.fillText('T',110,370);
          c.fillStyle=INK;c.font='32px Georgia, serif';let y=300;
          y=lines(c,'he Voynich Manuscript is a book of about two hundred and forty pages of vellum, some of them folding out, written with a quill in an alphabet found nowhere else and illustrated in ink and colour.',190,y,w-300,45);
          c.textAlign='left';y=lines(c,'Its vellum was made in the early fifteenth century; where, and by whom, and in what language its text is written, if it is written in a language at all, nobody knows. A few of its leaves are lost.',110,y+28,w-220,45);
          y=lines(c,'It is in Yale University’s Beinecke Rare Book and Manuscript Library, which has photographed every page and put the photographs in the public domain.',110,y+28,w-220,45);
          c.font='italic 30px Georgia, serif';y=lines(c,'This facsimile, made for the library, holds fifteen of its pages, a real opening from each of its parts, from the Beinecke’s photographs on Wikimedia Commons; each is credited beneath it. The script on its own pages is drawn after the commonest words of the manuscript. Its leaves are board, so that they stay stiff as they turn.',110,y+28,w-220,43);
          rosette(c,w/2,Math.min(h-160,y+90),62,BROWN)},
        'paste-back':(c,w,h)=>{paper(c,w,h,17);rosette(c,w/2,h*.42,76,BROWN);c.fillStyle=INK;c.textAlign='center';c.font=`50px ${fontFamily()}`;c.fillText('daiin',w/2,h*.56);glyphs(c,'daiin',w/2-110,h*.62,52,INK,3)}
      };
    },
    // Limp vellum, plain and creased, yellowed where it has been handled, with a paper label bearing the shelf mark and
    // a word of the script, and leather ties at the fore-edge.
    paintCover(c,w,h,{fontFamily}){
      c.fillStyle='#d6c6a0';c.fillRect(0,0,w,h);
      let s=19;const rnd=()=>(s=(s*9301+49297)%233280)/233280;
      for(let i=0;i<70;i++){const x=rnd()*w,y=rnd()*h,r=40+rnd()*260,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${rnd()<.6?'150,122,76':'244,232,204'},${.06+rnd()*.1})`);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)}
      c.strokeStyle='rgba(110,84,50,.22)';for(let i=0;i<26;i++){c.lineWidth=1+rnd()*2.5;c.beginPath();let x=rnd()*w,y=rnd()*h;c.moveTo(x,y);for(let k=0;k<4;k++){x+=(rnd()-.5)*240;y+=(rnd()-.5)*240;c.lineTo(x,y)}c.stroke()}
      const edge=c.createRadialGradient(w/2,h/2,Math.min(w,h)*.3,w/2,h/2,Math.max(w,h)*.72);edge.addColorStop(0,'rgba(0,0,0,0)');edge.addColorStop(1,'rgba(96,70,36,.38)');c.fillStyle=edge;c.fillRect(0,0,w,h);
      // The ties at the fore-edge, of plain leather thong.
      c.strokeStyle='#6a4a2a';c.lineWidth=7;for(const y of [h*.32,h*.68]){c.beginPath();c.moveTo(w-8,y);c.quadraticCurveTo(w-40,y+14,w-70,y+4);c.stroke()}
      // The label.
      const lw=w*.5,lh=h*.17,lx=(w-lw)/2,ly=h*.2;c.fillStyle='#efe4c8';c.fillRect(lx,ly,lw,lh);c.strokeStyle='rgba(90,64,34,.6)';c.lineWidth=3;c.strokeRect(lx,ly,lw,lh);
      c.fillStyle='#3b2a1c';c.textAlign='center';c.font=`48px ${fontFamily()}`;c.fillText('MS 408',w/2,ly+lh*.42);glyphs(c,'qokeedy',w/2-150,ly+lh*.78,34,'#5a3e24',7);
      c.font='italic 26px Georgia, serif';c.fillStyle='rgba(70,50,28,.7)';c.fillText('The Voynich Manuscript',w/2,h*.88);
    }
  };
  // The whole book (whole-book.js): every page of the manuscript, the Beinecke's own photographs, passed on by the
  // Internet Archive and on Wikimedia Commons as one file of 214 images, the covers, fold-outs, edges and spine included,
  // each captioned with its folio. Its images run one ahead of the Beinecke's photographs the facsimile's pages come
  // from (image 4 is folio 1r, 142 is 78r, 159 the rosettes, 207 is 116v), checked by eye against the captions.
  const SCAN={'001r':4,'009v':21,'010r':22,'055v':111,'056r':112,'070v1':129,'071r':130,'077v':141,'078r':142,rosettes:159,'099v':177,'100r':178,'102v':183,'103r':184,'116v':207};
  VOYNICH.whole={id:'voynich',title:'The Voynich Manuscript',sub:'Beinecke MS 408: every page',pages:214,widths:[960,1280],file:'Voynich Manuscript (IA voynich MS 408).pdf',hash:'5/55',
    commons:'https://commons.wikimedia.org/wiki/File:Voynich_Manuscript_(IA_voynich_MS_408).pdf',source:'Yale University, Beinecke Rare Book and Manuscript Library, MS 408: the library’s own photographs.',
    label:n=>`Image ${n} of 214`,goLabel:'Go to an image of the scan',goPlaceholder:'1–214',start:4,
    marks:[['The inside of the front cover, with Yale’s bookplate',3],['The first page (folio 1r)',4],['The pansy (folio 9v)',21],['Blue flowers and a spiral (folio 56r)',112],['Aries (folios 70v and 71r)',129],
      ['The two pools (folio 78r)',142],['The nine rosettes (folios 85v and 86r)',159],['The first jars (folio 88r)',162],['The recipes begin (folio 103r)',184],['The last page (folio 116v)',207],['The spine',213]],
    pageFor:key=>SCAN[key]||null};
  VOYNICH.glyphs=glyphs;VOYNICH.words=WORDS;
  window.VOYNICH_BOOK=VOYNICH;
  window.createVoynichBook=options=>window.createFineBook(options,VOYNICH);
})();
