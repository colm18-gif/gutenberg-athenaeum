// The Peresopnytsia Gospel, a facsimile: the Ukrainian Reading Room's great book, under glass in the middle of the room
// (international-wing.js). The four Gospels put into the Ukrainian of its day, written in 1556–61 and kept in Kyiv, on
// which Ukraine's presidents take their oath. Three photographs of its pages, in colour, and seven plates of the facsimile
// printed in Kiev in 1911, all in the public domain on Wikimedia Commons (scripts/fetch-book-pages.mjs,
// assets/peresopnytsia), bound with a title page, two notes and a colophon on thick board leaves (fine-books.js).
(function(){
  'use strict';

  // The pages, in the manuscript's order, each with its card. A plate keeps the 1911 caption printed beneath it.
  const FOLIOS={
    l002:['Leaf 2, from the facsimile of 1911','The first page','The heading of the book in tall, close-packed letters, and the first lines beneath it, in plate I of the 1911 facsimile.'],
    matthew:['From the facsimile of 1911','The evangelist Matthew','Matthew writing, inside a deep frame of acanthus and flowers: plate II, printed at half the size of the page.'],
    l082:['Leaf 82, from the facsimile of 1911','Into the coasts of Judaea','Matthew 19:1, where Jesus leaves Galilee and comes into the coasts of Judaea beyond Jordan, printed the size of the page itself (plate III). The marks in the margin are the old divisions for reading.'],
    mark:['From the facsimile of 1911','The evangelist Mark','Mark at his desk, in a frame of red and blue acanthus on gold: plate IV, printed in colour.'],
    l129:['Leaf 129','The beginning of Mark','The opening of Mark’s Gospel under a panel of interlace, its first line in gold capitals, in a border of flowers. A photograph of the manuscript.'],
    luke:['From the facsimile of 1911','The evangelist Luke','Luke writing, a building behind him, in a frame of acanthus growing out of vases: plate VII.'],
    l291:['Leaf 291','A page in the scribe’s hand','The end of one reading and the start of the next under a red initial, with notes in red in the margin. A photograph of the manuscript.'],
    l340:['Leaf 340','John and Prochorus','John the Theologian, turning to heaven, as his disciple Prochorus writes down what he says, in a frame of gold scrolls. A photograph of the manuscript.'],
    john:['From the facsimile of 1911','In the beginning was the Word','The opening of John’s Gospel under a panel of interlace, in a border of great scrolls: plate IX.'],
    last:['The last page, from the facsimile of 1911','The end of the book','The last page, the size of the page itself (plate XI): lines in the scribe’s hand round two stars and a vase of ornament.']
  };
  const DRAWN={
    'paste-front':['The front pastedown','Ex libris','The library’s bookplate.'],
    title:['The title page','Пересопницьке Євангеліє','The Peresopnytsia Gospel: ten of its pages, in facsimile.'],
    ukraine:['A note','The word on leaf 82','Coasts, borders and Ukraine.'],
    oath:['A note','The oath','Why a president lays a hand on this book.'],
    colophon:['The colophon','Пересопницьке Євангеліє','How the book was made, and where it went.'],
    'paste-back':['The back pastedown','Кінець','The end.']
  };
  // The faces of the eight leaves that turn, front then back of each: so the portraits of Mark and of John face the first
  // pages of their Gospels, as they do in the book.
  const FACES=['cover','paste-front','title','l002','matthew','l082','ukraine','mark','l129','luke','l291','l340','john','last','oath','colophon'];
  const INK='#231710',RED='#a0281c',GOLD='#b8892e',BLUE='#2b4a7a',PARCHMENT='#e6d8b8';

  // Parchment: warm, uneven, darker at the edges where hands have held it.
  function paper(c,w,h,seed=1){
    c.fillStyle=PARCHMENT;c.fillRect(0,0,w,h);
    let s=seed*9301+49297;const rnd=()=>(s=(s*9301+49297)%233280)/233280;
    for(let i=0;i<60;i++){const x=rnd()*w,y=rnd()*h,r=50+rnd()*180,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${rnd()<.5?'150,120,76':'255,248,226'},${.04+rnd()*.06})`);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)}
    const edge=c.createRadialGradient(w/2,h/2,Math.min(w,h)*.36,w/2,h/2,Math.max(w,h)*.75);edge.addColorStop(0,'rgba(0,0,0,0)');edge.addColorStop(1,'rgba(104,72,34,.26)');c.fillStyle=edge;c.fillRect(0,0,w,h);
  }
  // A band of acanthus in the book's manner: a red stem winding along a gold ground, with blue leaves in each turn.
  function acanthus(c,x0,y0,x1,y1,width){
    const len=Math.hypot(x1-x0,y1-y0),ang=Math.atan2(y1-y0,x1-x0),turns=Math.max(2,Math.round(len/(width*1.6))),a=width*.28;
    c.save();c.translate(x0,y0);c.rotate(ang);c.fillStyle=GOLD;c.fillRect(0,-width/2,len,width);
    c.strokeStyle=INK;c.lineWidth=2;c.strokeRect(0,-width/2,len,width);
    c.strokeStyle=RED;c.lineWidth=width*.09;c.lineCap='round';
    c.beginPath();for(let t=0;t<=1.0001;t+=.002){const x=t*len,y=Math.sin(t*turns*Math.PI*2)*a;t?c.lineTo(x,y):c.moveTo(x,y)}c.stroke();
    for(let k=0;k<turns*2;k++){const t=(k+.5)/(turns*2),x=t*len,side=k%2?1:-1;
      c.fillStyle=k%4<2?BLUE:RED;c.save();c.translate(x,side*a*.2);c.rotate(side*.5);c.beginPath();c.ellipse(0,side*width*.18,width*.2,width*.09,0,0,Math.PI*2);c.fill();c.restore();
      c.fillStyle=INK;c.beginPath();c.arc(x,-side*a*.9,width*.05,0,Math.PI*2);c.fill()}
    c.restore();
  }
  function frame(c,x,y,w,h,width){for(const [a,b,cc,d] of [[x,y,x+w,y],[x,y+h,x+w,y+h],[x,y,x,y+h],[x+w,y,x+w,y+h]])acanthus(c,a,b,cc,d,width)}
  // An interlace panel like the one over the opening of each Gospel: gold cords crossing on a dark ground.
  function interlace(c,x,y,w,h){
    c.fillStyle='#3a2416';c.fillRect(x,y,w,h);c.save();c.beginPath();c.rect(x,y,w,h);c.clip();
    c.strokeStyle=GOLD;c.lineWidth=7;const step=h/2;
    for(let d=-h;d<w+h;d+=step){c.beginPath();c.moveTo(x+d,y);c.lineTo(x+d+h,y+h);c.stroke();c.beginPath();c.moveTo(x+d,y+h);c.lineTo(x+d+h,y);c.stroke()}
    c.restore();c.strokeStyle=INK;c.lineWidth=3;c.strokeRect(x,y,w,h);
  }

  const PERESOPNYTSIA={id:'peresopnytsia',base:'assets/peresopnytsia/',manifestFile:'peresopnytsia.json',aspect:1820/1190,FOLIOS,DRAWN,FACES,
    header:'ПЕРЕСОПНИЦЬКЕ ЄВАНГЕЛІЄ · THE PERESOPNYTSIA GOSPEL, 1556–1561',label:'The Peresopnytsia Gospel, a facsimile',source:'The Peresopnytsia Gospel, Vernadsky National Library of Ukraine, Kyiv.',
    coverCard:['Пересопницьке Євангеліє','A facsimile in red leather with silver corners and clasps. Turn the cover to open it.'],
    binding:{leather:0x6e1a16,edges:0xc9a24e},
    paper,
    painters({lines}){
      const serif='Georgia, "Times New Roman", serif';
      return {
        'paste-front':(c,w,h)=>{paper(c,w,h,3);const bw=w*.54,bh=h*.24,x=(w-bw)/2,y=h*.34;frame(c,x,y,bw,bh,28);
          c.fillStyle=INK;c.textAlign='center';c.font=`40px ${serif}`;c.fillText('EX LIBRIS',w/2,y+bh*.42);c.fillStyle=RED;c.font=`32px ${serif}`;c.fillText('THE LIBRARY',w/2,y+bh*.6);c.fillText('AFTER DARK',w/2,y+bh*.6+40)},
        title:(c,w,h)=>{paper(c,w,h,5);frame(c,64,64,w-128,h-128,50);interlace(c,150,170,w-300,150);
          c.fillStyle=RED;c.textAlign='center';c.font=`bold 76px ${serif}`;c.fillText('ПЕРЕСОПНИЦЬКЕ',w/2,h*.33);c.fillText('ЄВАНГЕЛІЄ',w/2,h*.33+90);
          c.fillStyle=INK;c.font=`44px ${serif}`;c.fillText('The Peresopnytsia Gospel',w/2,h*.47);
          c.font=`italic 34px ${serif}`;c.fillText('ten of its pages, in facsimile',w/2,h*.6);
          c.font=`30px ${serif}`;c.fillText('Dvorets and Peresopnytsia, 1556–1561',w/2,h*.65);c.fillStyle=BLUE;c.font=`34px ${serif}`;c.fillText('for the Library After Dark',w/2,h*.78)},
        ukraine:(c,w,h)=>{paper(c,w,h,9);acanthus(c,100,130,w-100,130,30);
          c.fillStyle=RED;c.textAlign='center';c.font=`64px ${serif}`;c.fillText('The word on leaf 82',w/2,270);
          c.fillStyle=INK;c.textAlign='left';c.font=`36px ${serif}`;let y=370;
          y=lines(c,'The page opposite is Matthew 19:1. When Jesus had finished these sayings, he departed from Galilee and came into the coasts of Judaea beyond Jordan.',100,y,w-200,52);
          y=lines(c,'For “coasts”, the borders of a land, the Peresopnytsia Gospel writes оукраины: the borderlands, a word of the same family as Ukraine’s own name.',100,y+30,w-200,52);
          c.textAlign='center';c.fillStyle=RED;c.font=`bold 96px ${serif}`;c.fillText('оукраины',w/2,Math.min(h-300,y+150));
          c.fillStyle=INK;c.textAlign='left';c.font=`italic 32px ${serif}`;lines(c,'The scribes put the Gospels into the language people spoke, not the Church Slavonic of the services, so that, as the book says, the people could understand them.',100,Math.min(h-200,y+250),w-200,46);
          acanthus(c,100,h-130,w-100,h-130,30)},
        oath:(c,w,h)=>{paper(c,w,h,15);acanthus(c,100,130,w-100,130,30);
          c.fillStyle=RED;c.textAlign='center';c.font=`64px ${serif}`;c.fillText('The oath',w/2,270);
          c.fillStyle=INK;c.textAlign='left';c.font=`36px ${serif}`;let y=370;
          y=lines(c,'Since Ukraine became independent in 1991, each of its presidents has taken the oath of office with a hand on the Constitution and on this book.',100,y,w-200,52);
          y=lines(c,'The rest of the time it is kept in Kyiv, in the Institute of Manuscripts of the Vernadsky National Library of Ukraine.',100,y+30,w-200,52);
          y=lines(c,'It is not the oldest book written in Ukraine, nor the richest, but it is one of the first in which the Gospels were put into the language its readers spoke.',100,y+30,w-200,52);
          acanthus(c,100,h-130,w-100,h-130,30)},
        colophon:(c,w,h)=>{paper(c,w,h,7);interlace(c,100,110,w-200,80);acanthus(c,100,h-130,w-100,h-130,30);
          c.fillStyle=RED;c.font=`bold 104px ${serif}`;c.textAlign='left';c.fillText('П',100,330);
          c.fillStyle=INK;c.font=`32px ${serif}`;let y=270;
          y=lines(c,'eresopnytsia Gospel: the four Gospels, put from Church Slavonic into the Ukrainian of the sixteenth century by Archimandrite Hryhorii, and written out by Mykhailo Vasylovych, son of the archpriest of Sanok.',190,y,w-290,46);
          c.textAlign='left';y=lines(c,'The writing began on 15 August 1556 at the Dvorets monastery near Zaslav, for Princess Anastasia Zaslavska, and was finished on 29 August 1561 at the monastery of Peresopnytsia in Volhynia.',100,y+26,w-200,46);
          y=lines(c,'In 1701 Hetman Ivan Mazepa had it bound in silver and gave it to the Ascension Cathedral in Pereiaslav. It passed later to the library of the seminary, where in 1837 the scholar Osyp Bodiansky drew attention to it again.',100,y+26,w-200,46);
          c.font=`italic 29px ${serif}`;y=lines(c,'This facsimile, made for the library, holds three photographs of its pages and seven plates of the facsimile printed in Kiev in 1911 for Al. S. Gruzinsky’s study of it, all in the public domain on Wikimedia Commons; each is credited beneath it. Its leaves are board, so that they stay stiff as they turn.',100,y+26,w-200,42)},
        'paste-back':(c,w,h)=>{paper(c,w,h,11);frame(c,w*.3,h*.42,w*.4,h*.14,24);c.fillStyle=RED;c.textAlign='center';c.font=`54px ${serif}`;c.fillText('Кінець',w/2,h*.5+18)}
      };
    },
    // Red leather over boards, with silver corner pieces, a silver centre-piece with a cross, and two clasps,
    // after the silver Mazepa gave it.
    paintCover(c,w,h){
      c.fillStyle='#6e1a16';c.fillRect(0,0,w,h);
      let s=17;const rnd=()=>(s=(s*9301+49297)%233280)/233280;
      for(let i=0;i<w*h/200;i++){c.fillStyle=`rgba(${rnd()<.5?'30,4,2':'160,60,48'},${.05+rnd()*.1})`;c.fillRect(rnd()*w,rnd()*h,1+rnd()*2.5,1+rnd()*2.5)}
      const SILVER='#c9ccd0',DARK='#6f747a';
      c.strokeStyle='rgba(20,4,2,.7)';c.lineWidth=5;c.strokeRect(40,40,w-80,h-80);c.strokeRect(70,70,w-140,h-140);
      const corner=(x,y,sx,sy)=>{c.save();c.translate(x,y);c.scale(sx,sy);c.fillStyle=SILVER;c.beginPath();c.moveTo(0,0);c.lineTo(190,0);c.quadraticCurveTo(110,30,80,80);c.quadraticCurveTo(30,110,0,190);c.closePath();c.fill();
        c.strokeStyle=DARK;c.lineWidth=4;c.stroke();c.fillStyle=DARK;c.beginPath();c.arc(55,55,14,0,Math.PI*2);c.fill();c.restore()};
      corner(20,20,1,1);corner(w-20,20,-1,1);corner(20,h-20,1,-1);corner(w-20,h-20,-1,-1);
      const cx=w/2,cy=h*.52,r=w*.2;c.fillStyle=SILVER;c.beginPath();c.ellipse(cx,cy,r,r*1.3,0,0,Math.PI*2);c.fill();c.strokeStyle=DARK;c.lineWidth=6;c.stroke();
      c.lineWidth=3;c.beginPath();c.ellipse(cx,cy,r*.86,r*1.16,0,0,Math.PI*2);c.stroke();
      c.fillStyle=DARK;c.fillRect(cx-9,cy-r*.85,18,r*1.7);c.fillRect(cx-r*.45,cy-r*.45,r*.9,16);c.fillRect(cx-r*.3,cy-r*.7,r*.6,12);c.save();c.translate(cx,cy+r*.5);c.rotate(-.3);c.fillRect(-r*.3,-6,r*.6,12);c.restore();
      c.fillStyle='#e8d29a';c.textAlign='center';c.font='bold 54px Georgia, serif';c.fillText('ЄВАНГЕЛІЄ',w/2,h*.2);c.font='italic 30px Georgia, serif';c.fillText('Пересопниця · 1561',w/2,h*.2+46);
      for(const y of [h*.28,h*.72]){c.fillStyle=SILVER;c.fillRect(w-50,y-28,50,56);c.strokeStyle=DARK;c.lineWidth=3;c.strokeRect(w-48,y-26,46,52)}
    }
  };
  window.PERESOPNYTSIA_BOOK=PERESOPNYTSIA;
  window.createPeresopnytsiaBook=options=>window.createFineBook(options,PERESOPNYTSIA);
})();
