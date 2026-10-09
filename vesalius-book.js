// The Fabrica, a facsimile: the Medicine Room's great book, on show under glass in the middle of the room
// (medicine-room.js). Andreas Vesalius's De humani corporis fabrica libri septem, printed at Basel by Johannes Oporinus in
// 1543, with the woodcuts made in Venice: its title, the portrait of Vesalius, the three skeletons, four of the muscle men,
// a page of text, the arteries, the nerves and the opening of the fifth book, photographs in the public domain from
// Wikimedia Commons (scripts/fetch-book-pages.mjs, assets/vesalius), bound with a title page, a page on the seven books
// and a colophon on thick board leaves (fine-books.js).
(function(){
  'use strict';

  // The pages, in the book's order, each with its card. The plates are named for their page in the 1543 edition.
  const FOLIOS={
    title:['The title page','De humani corporis fabrica libri septem','Vesalius himself stands at the dissecting table in a crowded anatomy theatre, his hand in the body of a woman, with students, doctors and onlookers packed round him and a skeleton standing over them. The woodcut was made in Venice, probably in the workshop of Titian; the cutter is not known.'],
    portrait:['The portrait','Vesalius at twenty-eight','Vesalius at the age of twenty-eight, as the inscription says, laying bare the muscles of a forearm, with a page of his own writing on the table beside him. It is the one portrait of him that is thought to be true to life.'],
    p163:['Page 163','The skeleton from the front','The first of the three skeletons that close the first book, on the bones. It stands in a landscape, leaning on a spade.'],
    p164:['Page 164','The thinking skeleton','The skeleton from the side, leaning on a tomb with its hand on a skull. On the tomb: VIVITUR INGENIO, CAETERA MORTIS ERUNT, genius lives on, all else is death’s.'],
    p165:['Page 165','The mourning skeleton','The skeleton from behind, its head bowed and its hands to its face, as if in grief.'],
    p174:['Page 174','The second plate of the muscles','The second of fourteen figures stripped of their muscles layer by layer, striding past a ruin. The hills behind run on from plate to plate, and laid side by side the plates are said to make one view of the country near Padua.'],
    p178:['Page 178','The third plate of the muscles','The third figure from the front, with more of the outer muscles taken away, before a town and its hills.'],
    p184:['Page 184','The fifth plate of the muscles','Deeper still: muscles cut through and left hanging, so that those beneath them can be seen.'],
    p194:['Page 194','The ninth plate of the muscles','The figures have turned their backs, and the landscape goes on behind them.'],
    p239:['Page 239','A page of the text','The muscles that move the eye, from the second book. Most of the Fabrica looks like this: Latin in a fine roman type, with the figures set into the page, lettered, and a key to the letters beneath.'],
    p295:['Page 295','The arteries','From the third book, on the veins and arteries: the great artery and its branches, traced through the whole body.'],
    p332:['Page 332','The nerves','From the fourth book: the pairs of nerves that leave the spinal marrow, followed out to the hands and feet.'],
    p355:['Page 355','The fifth book begins','The first figure of the fifth book, on the organs of nutrition: the belly opened, drawn as a torso broken from a classical statue.']
  };
  const DRAWN={
    'paste-front':['The front pastedown','Ex libris','The library’s bookplate.'],
    'f-title':['The title page','The Fabrica','De humani corporis fabrica libri septem: thirteen of its pages, in facsimile.'],
    books:['A note','The seven books','What each of the Fabrica’s seven books is about.'],
    colophon:['The colophon','The Fabrica','How the book was made.'],
    'paste-back':['The back pastedown','Finis','The end.']
  };
  // The faces of the nine leaves that turn, front then back of each, so the skeletons of pages 164 and 165 lie open
  // together, and so do the title and the portrait, as the frontispiece faces the title in many books.
  const FACES=['cover','paste-front','f-title','portrait','title','books','p163','p164','p165','p174','p178','p184','p194','p239','p295','p332','p355','colophon'];
  const INK='#1e1712',RED='#9a2f1e',PAPER='#ebe0c6';

  // Rag paper of the sixteenth century: warm, a little foxed, with the laid and chain lines of the mould.
  function paper(c,w,h,seed=1){
    c.fillStyle=PAPER;c.fillRect(0,0,w,h);
    let s=seed*9301+49297;const rnd=()=>(s=(s*9301+49297)%233280)/233280;
    for(let i=0;i<50;i++){const x=rnd()*w,y=rnd()*h,r=50+rnd()*190,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${rnd()<.55?'160,128,82':'255,250,236'},${.04+rnd()*.06})`);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)}
    for(let i=0;i<w*h/6000;i++){c.fillStyle=`rgba(130,90,45,${.06+rnd()*.14})`;c.beginPath();c.arc(rnd()*w,rnd()*h,.8+rnd()*2.2,0,Math.PI*2);c.fill()}
    c.fillStyle='rgba(120,96,64,.045)';for(let y=0;y<h;y+=3)c.fillRect(0,y,w,1);
    c.fillStyle='rgba(120,96,64,.06)';for(let x=w*.05;x<w;x+=w/8)c.fillRect(x,0,2,h);
    const edge=c.createRadialGradient(w/2,h/2,Math.min(w,h)*.38,w/2,h/2,Math.max(w,h)*.75);edge.addColorStop(0,'rgba(0,0,0,0)');edge.addColorStop(1,'rgba(110,80,40,.22)');c.fillStyle=edge;c.fillRect(0,0,w,h);
  }
  // A printer's ivy leaf, the fleuron of the period's books.
  function hedera(c,x,y,size,ink=INK){
    c.save();c.translate(x,y);c.fillStyle=ink;c.beginPath();c.moveTo(0,size*.55);
    c.bezierCurveTo(-size*.9,size*.1,-size*.75,-size*.75,0,-size*.35);c.bezierCurveTo(size*.75,-size*.75,size*.9,size*.1,0,size*.55);c.fill();
    c.strokeStyle=ink;c.lineWidth=size*.09;c.lineCap='round';c.beginPath();c.moveTo(0,-size*.3);c.quadraticCurveTo(size*.15,-size*.8,size*.55,-size*.9);c.stroke();c.restore();
  }
  // A double rule round the page, as the printers boxed their title pages.
  function rules(c,x,y,w,h,ink=INK){c.strokeStyle=ink;c.lineWidth=5;c.strokeRect(x,y,w,h);c.lineWidth=1.6;c.strokeRect(x+12,y+12,w-24,h-24)}

  const VESALIUS={id:'vesalius',base:'assets/vesalius/',manifestFile:'vesalius.json',aspect:1780/1190,FOLIOS,DRAWN,FACES,
    header:'ANDREAS VESALIUS · DE HUMANI CORPORIS FABRICA, 1543',label:'The Fabrica of Vesalius, a facsimile',source:'De humani corporis fabrica, Basel, 1543.',
    coverCard:['De humani corporis fabrica','A facsimile in brown calf, blind-tooled. Turn the cover to open it.'],
    font:{family:'Fabrica Garamond',url:'assets/fonts/cormorant-garamond-latin-500-normal.woff2'},
    binding:{leather:0x5a3a22,edges:0xcfae6e},
    paper,
    painters({lines,fontFamily}){
      return {
        'paste-front':(c,w,h)=>{paper(c,w,h,3);const bw=w*.5,bh=h*.24,x=(w-bw)/2,y=h*.34;rules(c,x,y,bw,bh);
          c.fillStyle=INK;c.textAlign='center';c.font=`italic 44px ${fontFamily()}`;c.fillText('Ex libris',w/2,y+bh*.36);c.font=`40px ${fontFamily()}`;c.fillText('THE LIBRARY',w/2,y+bh*.6);c.fillText('AFTER DARK',w/2,y+bh*.6+46);hedera(c,w/2,y+bh+60,26,RED)},
        'f-title':(c,w,h)=>{paper(c,w,h,5);rules(c,70,70,w-140,h-140);
          c.fillStyle=INK;c.textAlign='center';c.font=`64px ${fontFamily()}`;c.fillText('ANDREAE VESALII',w/2,h*.22);c.font=`italic 38px ${fontFamily()}`;c.fillText('Bruxellensis',w/2,h*.22+52);
          c.fillStyle=RED;c.font=`70px ${fontFamily()}`;c.fillText('DE HVMANI',w/2,h*.38);c.fillText('CORPORIS FABRICA',w/2,h*.38+82);c.fillStyle=INK;c.font=`50px ${fontFamily()}`;c.fillText('LIBRI SEPTEM',w/2,h*.38+152);
          hedera(c,w/2,h*.6,34,RED);
          c.font=`italic 36px ${fontFamily()}`;c.fillText('thirteen of its pages, in facsimile',w/2,h*.68);
          c.font=`32px ${fontFamily()}`;c.fillText('Basileae, ex officina Ioannis Oporini, 1543',w/2,h*.73);c.fillStyle=RED;c.font=`34px ${fontFamily()}`;c.fillText('FOR THE LIBRARY AFTER DARK',w/2,h*.82)},
        books:(c,w,h)=>{paper(c,w,h,9);rules(c,70,70,w-140,h-140);
          c.fillStyle=RED;c.textAlign='center';c.font=`64px ${fontFamily()}`;c.fillText('The seven books',w/2,250);
          c.fillStyle=INK;c.font=`italic 34px ${fontFamily()}`;lines(c,'The body as Vesalius took it apart, from the frame outwards and then inwards, from the bones to the brain.',w/2,320,w-300,46);
          let y=470;c.textAlign='left';
          for(const [n,text] of [['I','The bones and cartilages'],['II','The ligaments and the muscles'],['III','The veins and the arteries'],['IV','The nerves'],['V','The organs of nutrition and of generation'],['VI','The heart and the organs that serve it'],['VII','The brain and the organs of sense']]){
            c.fillStyle=RED;c.font=`54px ${fontFamily()}`;c.textAlign='right';c.fillText(n,250,y);c.fillStyle=INK;c.font=`42px ${fontFamily()}`;c.textAlign='left';c.fillText(text,290,y);y+=104}
          hedera(c,w/2,Math.min(h-180,y+40),28,RED)},
        colophon:(c,w,h)=>{paper(c,w,h,7);rules(c,70,70,w-140,h-140);
          c.fillStyle=RED;c.font=`120px ${fontFamily()}`;c.textAlign='left';c.fillText('A',130,320);
          c.fillStyle=INK;c.font=`34px ${fontFamily()}`;let y=232;
          y=lines(c,'ndreas Vesalius was born in Brussels in 1514 and was made professor of surgery and anatomy at Padua at twenty-three. His teachers had read Galen aloud from the chair while a barber did the cutting; Vesalius did the dissecting himself, and found that much of Galen described apes, not men.',220,y,w-350,48);
          c.textAlign='left';y=lines(c,'De humani corporis fabrica libri septem, seven books on the fabric of the human body, was printed at Basel by Johannes Oporinus in 1543, the year Copernicus’s book on the heavens appeared. Its woodblocks were cut in Venice and carried over the Alps to the printer.',130,y+30,w-260,48);
          c.font=`italic 32px ${fontFamily()}`;y=lines(c,'This facsimile, made for the library, holds its title, its portrait and eleven of its pages, from photographs in the public domain on Wikimedia Commons; each is credited beneath it. Its leaves are board, so that they stay stiff as they turn.',130,y+30,w-260,46);
          hedera(c,w/2,Math.min(h-170,y+60),30,RED)},
        'paste-back':(c,w,h)=>{paper(c,w,h,11);hedera(c,w/2,h*.44,44,RED);c.fillStyle=INK;c.textAlign='center';c.font=`64px ${fontFamily()}`;c.fillText('FINIS',w/2,h*.56)}
      };
    },
    // Brown calf over boards, blind-tooled with a roll border and a panel of fillets, a gilt fleuron at the centre and the
    // title gilt above it, as a German binder might have bound it for a physician's library.
    paintCover(c,w,h,{fontFamily}){
      c.fillStyle='#5a3a22';c.fillRect(0,0,w,h);
      let s=13;const rnd=()=>(s=(s*9301+49297)%233280)/233280;
      for(let i=0;i<w*h/200;i++){c.fillStyle=`rgba(${rnd()<.5?'30,16,6':'140,98,60'},${.05+rnd()*.1})`;c.fillRect(rnd()*w,rnd()*h,1+rnd()*2.5,1+rnd()*2.5)}
      const blind=(x,y,ww,hh,lw=5)=>{c.strokeStyle='rgba(20,10,4,.7)';c.lineWidth=lw;c.strokeRect(x,y,ww,hh);c.strokeStyle='rgba(170,120,76,.3)';c.lineWidth=1.5;c.strokeRect(x+3,y+3,ww,hh)};
      blind(30,30,w-60,h-60);blind(48,48,w-96,h-96,3);
      // The roll: a band of small blind-stamped lozenges between two fillets.
      c.save();c.fillStyle='rgba(22,12,5,.55)';for(const [x0,y0,x1,y1] of [[70,70,w-70,70],[70,h-70,w-70,h-70]])for(let x=x0+14;x<x1-10;x+=28){c.beginPath();c.moveTo(x,y0-9);c.lineTo(x+9,y0);c.lineTo(x,y0+9);c.lineTo(x-9,y0);c.closePath();c.fill()}
      for(const x of [70,w-70])for(let y=84;y<h-80;y+=28){c.beginPath();c.moveTo(x,y-9);c.lineTo(x+9,y);c.lineTo(x,y+9);c.lineTo(x-9,y);c.closePath();c.fill()}c.restore();
      blind(96,96,w-192,h-192);blind(150,150,w-300,h-300,3);
      // The panel's diagonals, in fillets, meeting at the centre.
      c.strokeStyle='rgba(20,10,4,.5)';c.lineWidth=3;c.beginPath();c.moveTo(150,150);c.lineTo(w-150,h-150);c.moveTo(w-150,150);c.lineTo(150,h-150);c.stroke();
      const GOLD='#d4a84e',DARK='#6e4e1c';
      c.fillStyle='#5a3a22';c.beginPath();c.ellipse(w/2,h*.55,w*.17,w*.17,0,0,Math.PI*2);c.fill();
      c.strokeStyle=DARK;c.lineWidth=10;c.beginPath();c.arc(w/2,h*.55,w*.15,0,Math.PI*2);c.stroke();c.strokeStyle=GOLD;c.lineWidth=5;c.stroke();
      hedera(c,w/2,h*.56,w*.09,GOLD);
      c.fillStyle='#5a3a22';c.fillRect(w*.2,h*.19,w*.6,h*.14);c.strokeStyle=GOLD;c.lineWidth=3;c.strokeRect(w*.2,h*.19,w*.6,h*.14);
      c.fillStyle=GOLD;c.textAlign='center';c.font=`58px ${fontFamily()}`;c.fillText('VESALIVS',w/2,h*.255);c.font=`28px ${fontFamily()}`;c.fillText('DE HVMANI CORPORIS FABRICA',w/2,h*.255+44);c.fillText('MDXLIII',w/2,h*.255+80);
    }
  };
  window.VESALIUS_BOOK=VESALIUS;
  window.createVesaliusBook=options=>window.createFineBook(options,VESALIUS);
})();
