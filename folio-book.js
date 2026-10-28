// The First Folio, a facsimile: the Set Texts Room's great book, on show under glass in the middle of the room
// (set-texts-room.js). Mr. William Shakespeares Comedies, Histories, & Tragedies, printed in London by Isaac Jaggard and
// Edward Blount in 1623: the title with Droeshout's engraving, the preliminaries, the Catalogue and fifteen openings
// of the plays, from the one copy on Wikimedia Commons photographed complete, a page at a time (scripts/fetch-book-pages.mjs,
// assets/folio), bound with a title page, a page on the thirty-six plays and a colophon on thick board leaves
// (fine-books.js). The whole book (whole-book.js) reads every page of the same copy.
(function(){
  'use strict';

  // The pages, in the book's order, each with its card. A page's scan is its place in the Commons series (SCAN). The
  // Comedies are named for the page number printed on them; the Tragedies are misnumbered, and keep the number printed.
  const FOLIOS={
    reader:['The facing page','To the Reader','Ben Jonson’s ten lines on the engraving opposite: “This Figure, that thou here seest put, / It was for gentle Shakespeare cut;” and, since no engraver could draw his wit, “Reader, looke / Not on his Picture, but his Booke.” They are signed B. I.'],
    title:['The title page','Mr. William Shakespeares Comedies, Histories, & Tragedies','“Published according to the True Originall Copies”, and printed by Isaac Jaggard and Edward Blount, 1623. The engraving is by Martin Droeshout, who was fifteen when Shakespeare died and probably never saw him; with the bust on his tomb at Stratford, it is one of only two likenesses with a good claim to show him.'],
    dedication:['The dedication','The Epistle Dedicatorie','The end of the dedication to William, Earl of Pembroke, and Philip, Earl of Montgomery, by John Heminge and Henry Condell, two of the actors in Shakespeare’s company, who gathered his plays into this book seven years after his death “onely to keepe the memory of so worthy a Friend, & Fellow aliue, as was our SHAKESPEARE”.'],
    readers:['The address','To the great Variety of Readers','Heminge and Condell to the buyer, “From the most able, to him that can but spell”: judge the book, but “Do so, but buy it first.” Shakespeare’s “mind and hand went together”, they say, and they had “scarse receiued from him a blot in his papers.” Then: “Reade him, therefore; and againe, and againe.”'],
    jonson:['Ben Jonson’s poem','To the memory of my beloued, The Author','The second page of Jonson’s poem, on the friend and rival who had died in 1616. It holds the line still quoted of him, “He was not of an age, but for all time!”, and hails him as the “Sweet Swan of Auon!”'],
    digges:['Two more poems','To the memorie of the deceased Authour','Leonard Digges promises that the book will outlast “thy Stratford Moniment”, the first mention in print of the bust on his tomb; below, I. M., perhaps James Mabbe, wonders that he went so soon “From the Worlds-Stage, to the Graues-Tyring-roome.”'],
    actors:['The actors','The Names of the Principall Actors in all these Playes','Twenty-six men of the company that became the King’s Men, Shakespeare himself first and Richard Burbage, who played Hamlet, Lear and Othello, second. Heminge and Condell are on the list, and so is Will Kemp, the clown who left the company in 1599.'],
    catalogue:['The contents','A Catalogue of the seuerall Comedies, Histories, and Tragedies','Thirty-five plays under the three heads of the title, with the page each begins on. Troilus and Cressida is not here: it was printed late, after a delay over the rights, and squeezed in between the histories and the tragedies with hardly a page number.'],
    tempest:['Comedies, page 1','The Tempest','The first play in the book, though one of the last he wrote, and one of eighteen printed here for the first time: without the Folio they might be lost. It opens on “A tempestuous noise of Thunder and Lightning heard”, and the ship goes down.'],
    errors:['Comedies, page 100','The end of The Comedy of Errors','The last page of the shortest of the plays: “And now let’s go hand in hand, not one before another.” Then FINIS and a printer’s ornament.'],
    'much-ado':['Comedies, page 101','Much adoe about Nothing','Beatrice and Benedick, a set text for GCSE. Her first words are of him: “I pray you, is Signior Mountanto return’d from the warres, or no?” It had been printed once before, in 1600, and the Folio’s text was set from that edition.'],
    dream:['Comedies, page 162','The end of A Midsommer nights Dreame','The fairies bless the house, and Puck speaks the epilogue: “If we shadowes haue offended, / Thinke but this (and all is mended)”.'],
    merchant:['Comedies, page 163','The Merchant of Venice','Shylock, Portia and the pound of flesh, a set text for GCSE. It opens with Antonio’s “In sooth I know not why I am so sad”.'],
    'alls-well':['Comedies, page 254','The end of All’s Well, that Ends Well','The King’s epilogue, “The Kings a Begger, now the Play is done”, and FINIS.'],
    'twelfth-night':['Comedies, page 255','Twelfe Night, Or what you will','Viola, Olivia, Malvolio and the twins, a set text for GCSE and another of the eighteen printed here first. It opens on Orsino: “If Musicke be the food of Loue, play on”.'],
    'romeo-58':['Tragedies, page 58','The Tragedie of Romeo and Iuliet','The Capulets’ feast. Romeo and Juliet meet, and their first words together make a sonnet: “If I prophane with my vnworthiest hand, / This holy shrine…” The Folio’s text was set from a quarto, though it leaves out the Prologue the quartos print.'],
    'romeo-59':['Tragedies, page 59','The Tragedie of Romeo and Iuliet','Romeo in the orchard: “But soft, what light through yonder window breaks? / It is the East, and Iuliet is the Sunne”. Above him, “O Romeo, Romeo, wherefore art thou Romeo?” and “What’s in a name? that which we call a Rose, / By any other word would smell as sweete”.'],
    'caesar-118':['Tragedies, page 118','The Tragedie of Iulius Cæsar','Act III begins, on the Ides of March: “The Ides of March are come.” — “I Cæsar, but not gone.” Julius Caesar was printed for the first time in the Folio.'],
    'caesar-119':['Tragedies, page 119','The Tragedie of Iulius Cæsar','The assassination: “Et Tu Brutè? — Then fall Cæsar.” And Cassius, washing in the blood: “How many Ages hence / Shall this our lofty Scene be acted ouer, / In State vnborne, and Accents yet vnknowne?”'],
    'macbeth-142':['Tragedies, page 142','The Tragedie of Macbeth','The banquet, and Banquo’s ghost in Macbeth’s place: “Thou canst not say I did it: neuer shake / Thy goary lockes at me.” Macbeth was first printed here; there is no other early text, and every edition since rests on these pages.'],
    'macbeth-143':['Tragedies, page 143','The Tragedie of Macbeth','Act IV opens on thunder and the three witches at the cauldron: “Thrice the brinded Cat hath mew’d.” Then all three: “Double, double, toile and trouble; / Fire burne, and Cauldron bubble.”'],
    'hamlet-264':['Tragedies, page 264','The Tragedie of Hamlet','Hamlet’s pages are numbered a hundred too high from a few pages in, so this is really page 164. The players have come, and Hamlet, alone: “O what a Rogue and Pesant slaue am I?” It ends “The Play’s the thing, / Wherein Ile catch the Conscience of the King.”'],
    'hamlet-265':['Tragedies, page 265','The Tragedie of Hamlet','Ophelia is set in Hamlet’s way, and he comes in: “To be, or not to be, that is the Question”. The Folio’s Hamlet has some seventy lines the second quarto lacks, and lacks some two hundred it has.'],
    cymbeline:['Tragedies, page 398','The Tragedie of Cymbeline','The last play in the book, counted among the tragedies, though it ends happily: Cymbeline finds the sons he lost twenty years before.'],
    colophon:['Tragedies, page 399','The last page','Cymbeline ends, numbered 993 for 399, and beneath it the colophon: “Printed at the Charges of W. Iaggard, Ed. Blount, I. Smithweeke, and W. Aspley, 1623.”']
  };
  const DRAWN={
    'paste-front':['The front pastedown','Ex libris','The library’s bookplate.'],
    'f-title':['The title page','The First Folio','Mr. William Shakespeares Comedies, Histories, & Tragedies: its title, its preliminaries and fifteen openings of its plays, in facsimile.'],
    plays:['A note','The thirty-six plays','Every play in the book, in its order, with the eighteen printed here for the first time marked.'],
    about:['The colophon','The First Folio','How the book was made, and how this facsimile was.'],
    'paste-back':['The back pastedown','Finis','The end.']
  };
  // The faces of the fifteen leaves that turn, front then back of each. Every opening is a real one, left page and right as
  // they face each other in the book, except the Actors and the Catalogue (the leaf between has a blank side).
  const FACES=['cover','paste-front','f-title','reader','title','dedication','readers','jonson','digges','actors','catalogue','plays','tempest',
    'errors','much-ado','dream','merchant','alls-well','twelfth-night','romeo-58','romeo-59','caesar-118','caesar-119','macbeth-142','macbeth-143',
    'hamlet-264','hamlet-265','cymbeline','colophon','about'];
  // Each page's place in the scan on Commons (First Folio, Shakespeare - 0001.jpg to 0907.jpg).
  const SCAN={reader:2,title:3,dedication:6,readers:7,jonson:10,digges:11,actors:15,catalogue:17,tempest:19,errors:118,'much-ado':119,dream:180,merchant:181,
    'alls-well':272,'twelfth-night':273,'romeo-58':673,'romeo-59':674,'caesar-118':725,'caesar-119':726,'macbeth-142':749,'macbeth-143':750,'hamlet-264':771,'hamlet-265':772,
    cymbeline:905,colophon:906};
  // The plays in the Folio's order, the eighteen first printed in it marked.
  const PLAYS=[
    ['Comedies',[['The Tempest',1],['The Two Gentlemen of Verona',1],['The Merry Wives of Windsor'],['Measure for Measure',1],['The Comedy of Errors',1],['Much Ado About Nothing'],['Love’s Labour’s Lost'],['A Midsummer Night’s Dream'],['The Merchant of Venice'],['As You Like It',1],['The Taming of the Shrew',1],['All’s Well That Ends Well',1],['Twelfth Night',1],['The Winter’s Tale',1]]],
    ['Histories',[['King John',1],['Richard II'],['Henry IV, Part 1'],['Henry IV, Part 2'],['Henry V'],['Henry VI, Part 1',1],['Henry VI, Part 2'],['Henry VI, Part 3'],['Richard III'],['Henry VIII',1]]],
    ['Tragedies',[['Troilus and Cressida'],['Coriolanus',1],['Titus Andronicus'],['Romeo and Juliet'],['Timon of Athens',1],['Julius Caesar',1],['Macbeth',1],['Hamlet'],['King Lear'],['Othello'],['Antony and Cleopatra',1],['Cymbeline',1]]]
  ];
  const INK='#1f1813',RED='#8e2c1c',PAPER='#ece1c8';

  // Paper of the 1620s: rag, warm, a little foxed, with the laid and chain lines of the mould.
  function paper(c,w,h,seed=1){
    c.fillStyle=PAPER;c.fillRect(0,0,w,h);
    let s=seed*9301+49297;const rnd=()=>(s=(s*9301+49297)%233280)/233280;
    for(let i=0;i<46;i++){const x=rnd()*w,y=rnd()*h,r=50+rnd()*190,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${rnd()<.55?'158,126,80':'255,250,236'},${.04+rnd()*.06})`);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)}
    for(let i=0;i<w*h/6500;i++){c.fillStyle=`rgba(130,90,45,${.06+rnd()*.13})`;c.beginPath();c.arc(rnd()*w,rnd()*h,.8+rnd()*2.2,0,Math.PI*2);c.fill()}
    c.fillStyle='rgba(120,96,64,.045)';for(let y=0;y<h;y+=3)c.fillRect(0,y,w,1);
    c.fillStyle='rgba(120,96,64,.06)';for(let x=w*.06;x<w;x+=w/7.5)c.fillRect(x,0,2,h);
    const edge=c.createRadialGradient(w/2,h/2,Math.min(w,h)*.38,w/2,h/2,Math.max(w,h)*.75);edge.addColorStop(0,'rgba(0,0,0,0)');edge.addColorStop(1,'rgba(110,80,40,.22)');c.fillStyle=edge;c.fillRect(0,0,w,h);
  }
  // The band of printer's ornament that heads each play in the Folio, drawn as a row of scrolls and leaves.
  function headpiece(c,x,y,w,hh,ink=INK){
    c.save();c.fillStyle=ink;c.fillRect(x,y,w,hh);c.fillStyle=PAPER;c.fillRect(x+5,y+5,w-10,hh-10);c.fillStyle=ink;
    const n=Math.max(4,Math.round(w/hh/1.2)),step=(w-10)/n;
    for(let i=0;i<n;i++){const cx=x+5+step*(i+.5),cy=y+hh/2,r=hh*.3;
      c.beginPath();c.ellipse(cx-r*.55,cy,r*.62,r*.38,-.6,0,Math.PI*2);c.ellipse(cx+r*.55,cy,r*.62,r*.38,.6,0,Math.PI*2);c.fill();
      c.beginPath();c.arc(cx,cy,r*.22,0,Math.PI*2);c.fill();c.lineWidth=2;c.strokeStyle=ink;c.beginPath();c.moveTo(cx-step/2,cy);c.quadraticCurveTo(cx,cy-r*1.2,cx+step/2,cy);c.stroke()}
    c.restore();
  }
  // The double rule round the page.
  function rules(c,x,y,w,h,ink=INK){c.strokeStyle=ink;c.lineWidth=4;c.strokeRect(x,y,w,h);c.lineWidth=1.4;c.strokeRect(x+10,y+10,w-20,h-20)}

  const FOLIO={id:'folio',base:'assets/folio/',manifestFile:'folio.json',aspect:1800/1190,FOLIOS,DRAWN,FACES,SCAN,PLAYS,
    header:'MR. WILLIAM SHAKESPEARES COMEDIES, HISTORIES, & TRAGEDIES · 1623',label:'The First Folio of Shakespeare, a facsimile',source:'The First Folio, London, 1623.',
    coverCard:['The First Folio','A facsimile in plain brown calf, as many copies were bound when new. Turn the cover to open it.'],
    font:{family:'Folio Garamond',url:'assets/fonts/cormorant-garamond-latin-500-normal.woff2'},
    binding:{leather:0x5c3b22,edges:0xc9a868},
    paper,
    painters({lines,fontFamily}){
      return {
        'paste-front':(c,w,h)=>{paper(c,w,h,3);const bw=w*.5,bh=h*.24,x=(w-bw)/2,y=h*.34;rules(c,x,y,bw,bh);
          c.fillStyle=INK;c.textAlign='center';c.font=`italic 44px ${fontFamily()}`;c.fillText('Ex libris',w/2,y+bh*.36);c.font=`40px ${fontFamily()}`;c.fillText('THE LIBRARY',w/2,y+bh*.6);c.fillText('AFTER DARK',w/2,y+bh*.6+46);headpiece(c,w/2-90,y+bh+40,180,40,RED)},
        'f-title':(c,w,h)=>{paper(c,w,h,5);rules(c,70,70,w-140,h-140);
          c.fillStyle=INK;c.textAlign='center';c.font=`52px ${fontFamily()}`;c.fillText('Mr. WILLIAM',w/2,h*.2);
          c.fillStyle=RED;c.font=`86px ${fontFamily()}`;c.fillText('SHAKESPEARES',w/2,h*.2+96);c.fillStyle=INK;c.font=`54px ${fontFamily()}`;c.fillText('COMEDIES,',w/2,h*.2+176);c.fillText('HISTORIES, &',w/2,h*.2+238);c.fillText('TRAGEDIES.',w/2,h*.2+300);
          headpiece(c,w*.25,h*.5,w*.5,52,RED);
          c.font=`italic 36px ${fontFamily()}`;c.fillText('its title, its preliminaries,',w/2,h*.6);c.fillText('and fifteen openings of its plays, in facsimile',w/2,h*.6+46);
          c.font=`32px ${fontFamily()}`;c.fillText('London, printed by Isaac Iaggard and Ed. Blount, 1623',w/2,h*.72);c.fillStyle=RED;c.font=`34px ${fontFamily()}`;c.fillText('FOR THE LIBRARY AFTER DARK',w/2,h*.82)},
        plays:(c,w,h)=>{paper(c,w,h,9);rules(c,70,70,w-140,h-140);
          c.fillStyle=RED;c.textAlign='center';c.font=`60px ${fontFamily()}`;c.fillText('The thirty-six plays',w/2,200);
          c.fillStyle=INK;c.font=`italic 31px ${fontFamily()}`;lines(c,'In the Folio’s order. The eighteen marked † were printed here for the first time; without this book they might be lost.',w/2,256,w-300,40);
          // Each head's plays run down two columns, in the book's order.
          let y=430;
          for(const [head,list] of PLAYS){
            c.fillStyle=RED;c.textAlign='center';c.font=`42px ${fontFamily()}`;c.fillText(head.toUpperCase(),w/2,y);y+=50;c.font=`28px ${fontFamily()}`;c.textAlign='left';
            const rows=Math.ceil(list.length/2);
            list.forEach(([title,first],i)=>{const x=i<rows?120:w/2+6,yy=y+(i%rows)*36;c.fillStyle=INK;c.fillText(title,x+26,yy);if(first){c.fillStyle=RED;c.fillText('†',x,yy)}});
            y+=rows*36+46;
          }},
        about:(c,w,h)=>{paper(c,w,h,7);rules(c,70,70,w-140,h-140);
          c.fillStyle=RED;c.font=`120px ${fontFamily()}`;c.textAlign='left';c.fillText('S',130,320);
          c.fillStyle=INK;c.font=`34px ${fontFamily()}`;let y=232;
          y=lines(c,'hakespeare died in April 1616 without having printed a play himself. Half of his plays had come out in cheap quartos, some of them good, some garbled; the rest were in the playhouse, in manuscript.',210,y,w-340,48);
          c.textAlign='left';y=lines(c,'Seven years later two of his fellow actors, John Heminge and Henry Condell, gathered thirty-six of them into this book, printed in the shop of William and Isaac Jaggard. William, who was blind, died as it was being finished. Perhaps 750 copies were printed; some 235 are known to survive.',130,y+30,w-260,48);
          c.font=`italic 32px ${fontFamily()}`;y=lines(c,'This facsimile, made for the library, holds the title, the preliminaries and fifteen openings of the plays, from one copy photographed page by page and in the public domain on Wikimedia Commons; each page is credited beneath it. The whole book, every page of that copy, is a button away.',130,y+30,w-260,46);
          headpiece(c,w/2-110,Math.min(h-200,y+40),220,46,RED)},
        'paste-back':(c,w,h)=>{paper(c,w,h,11);headpiece(c,w/2-130,h*.42,260,52,RED);c.fillStyle=INK;c.textAlign='center';c.font=`64px ${fontFamily()}`;c.fillText('FINIS',w/2,h*.56)}
      };
    },
    // Plain brown calf over boards with a gilt double fillet round the edge and a small centre ornament, the title in gilt
    // above it: a plain trade binding, as a London stationer might have bound the book for a buyer in 1623.
    paintCover(c,w,h,{fontFamily}){
      c.fillStyle='#5c3b22';c.fillRect(0,0,w,h);
      let s=17;const rnd=()=>(s=(s*9301+49297)%233280)/233280;
      for(let i=0;i<w*h/200;i++){c.fillStyle=`rgba(${rnd()<.5?'30,16,6':'140,98,60'},${.05+rnd()*.1})`;c.fillRect(rnd()*w,rnd()*h,1+rnd()*2.5,1+rnd()*2.5)}
      const GOLD='#d4a84e',DARK='#6e4e1c';
      for(const [m,lw] of [[42,5],[58,2]]){c.strokeStyle=DARK;c.lineWidth=lw+3;c.strokeRect(m,m,w-2*m,h-2*m);c.strokeStyle=GOLD;c.lineWidth=lw;c.strokeRect(m,m,w-2*m,h-2*m)}
      // A lozenge of small gilt tools at the centre.
      c.save();c.translate(w/2,h*.56);c.fillStyle=GOLD;
      for(let i=0;i<8;i++){c.save();c.rotate(i*Math.PI/4);c.beginPath();c.ellipse(0,-w*.07,w*.022,w*.05,0,0,Math.PI*2);c.fill();c.restore()}
      c.beginPath();c.arc(0,0,w*.03,0,Math.PI*2);c.fill();c.restore();
      c.fillStyle=GOLD;c.textAlign='center';c.font=`58px ${fontFamily()}`;c.fillText('SHAKESPEARE',w/2,h*.25);
      c.font=`28px ${fontFamily()}`;c.fillText('COMEDIES · HISTORIES · TRAGEDIES',w/2,h*.25+48);c.fillText('MDCXXIII',w/2,h*.25+86);
    }
  };
  // The whole book (whole-book.js): every page of the same copy, a photograph a page on Commons. The MD5 folders of each
  // file's name, two hexadecimal digits a page, since browsers have no MD5 (folio.test.cjs checks them).
  const HASHES='b70192ef5a47e670acbcb91ab14dc14f8a76f2618ea98068a297fb3613f8de65611659a477ec628d3cb236a8d596d1f12e3dbe6fcf50447ad176b9e664f47c11d22f889bb2257500971bcf3b072cc73dbc6949f24a00457959b9f45320a19cfcacc34154be742d5e6e38e7bcd2f5ec0688e480eef651ac4c278c1f2648a8cdef27136c2e9f88a24a74bd76445bd7380b527333f08a9f1d65bc24cbbce2bba60084dba63643a13c204dd242f397d38c76cfb0164f0623ed351c359ec46c3cc26257da944be3bd5d476ebfb6113eb480d25bb77b8405cc517bb85dd5a34fc9bd81b38819576ff90a7217ea6ec2555ef887ae39c4f8780d250575960c72948058d266651954b8f265927cd1e838c24f600d870448591c1d38090fac4ac3f0dcf72472567885907dc3a1f21a4f1dade4366a01854da7ac3ed9c306482c02b697bdbad0aa8dcf2df983acb8f777e0210ed078adb15659d89585c17b80f5d3c040c161680ea0bb658cca873a3c4a15b47be4c208a09aef4411f5a9e900860d432369090160781e43db68a1cb96e5841acb76840ad23cea980306669fb2d182638e94efd014245e4f67ef998acd3b8906d2399834582bb84cf94cd19e53df68a1042a0e3bff0ca0c89980d6a36507f15bf961dfc1a8387b3fb8b0fed0e05d52a492aa0d82e0e99b88005a284f7adf240bdb28d055601cfa858b8cd9d763e676af5bacd1dfd88b1d6874fdaaa9a576382d1d4195c47e506d49b641ddbcdf230b1b5e4269785e66c6ea537da935aed214b9d1ba03186d018c5cc4e11424bb9d632cf5cff6f52ab7e96b56db8a806d8ddca2f99b45aeacfa88b6536ea5c3a95a6d077bf745e9f9ce9f86971f5245b4a3f14d70a3ef55ae18bc1ecf272657fc2b0d4dfe5903a8ac182b4c2ff014751f384b7cd2be3450bdf59aaf1a7970f301b6e148cb96638a27c4a502ae86032a74d08f225fe516515c72c8769ffbe46818c5258d74a78227f5e7c8e8126ad1487f84295493dcae8e406adc8db9864532ba9af89fc0c567cf5ce135e996e3ce29fcf0988e55f0ab28c3e60627ab878d13683de22de26a8b110d1efe31df14de5681c47c56dcbc3eb78e6b29fc0d9e07ef6d9e4c042e448cdddcf441539f97a165c0f3b8419b543d0a911dd8aef7302e54edf561e550a83ceff0f822e507b69a4e39ca663b78f4e5a0c19bc11dd9debb133ca4f5ead3ba1ee99b078c662590c1b39924dd7989b9511be661d188eafb908235faed472c6e1fb8a74d31dacc0081194d7b';
  FOLIO.whole={id:'folio',title:'Mr. William Shakespeares Comedies, Histories, & Tragedies',sub:'The First Folio, London, 1623: all of it',pages:907,widths:[960],
    series:n=>`First Folio, Shakespeare - ${String(n).padStart(4,'0')}.jpg`,hashes:HASHES,
    commons:'https://commons.wikimedia.org/wiki/Category:First_Folio',
    source:'The First Folio, London, 1623.',label:n=>`Page ${n} of the scan, of 907`,goLabel:'Go to a page of the scan',goPlaceholder:'1–907',start:3,
    marks:[['The title page',3],['To the Reader',2],['The dedication',5],['To the great Variety of Readers',7],['Ben Jonson’s poem',9],['The principal actors',15],['The Catalogue',17],['The Tempest',19],
      ['Much Ado About Nothing',119],['The Merchant of Venice',181],['Twelfth Night',273],['Romeo and Juliet: the orchard',673],['Julius Caesar: the Ides of March',725],['Macbeth: the cauldron',750],['Hamlet: to be, or not to be',772],['King Lear',790],['The colophon',906]],
    pageFor:key=>SCAN[key]||null};
  window.FOLIO_BOOK=FOLIO;
  window.createFolioBook=options=>window.createFineBook(options,FOLIO);
})();
