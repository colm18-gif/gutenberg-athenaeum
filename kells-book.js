// The Book of Kells, a facsimile: the Irish Room's great book, on show under glass in the middle of the room
// (irish-room.js). Eighteen of its pages, photographs in the public
// domain from Wikimedia Commons (scripts/fetch-book-pages.mjs, assets/kells), bound with a title page and a colophon on
// thick board leaves (fine-books.js turns them, lights them and lets the reader look closely).
(function(){
  'use strict';

  // The eighteen pages, in the order they come in the manuscript (Trinity College Dublin, MS 58), each with its card.
  const FOLIOS={
    '005r':['Folio 5r','A canon table','The concordance that Eusebius of Caesarea made of the passages the four Gospels share, set out in columns under arches, with the evangelists’ symbols in the arches above.'],
    '007v':['Folio 7v','The Virgin and Child','The oldest surviving picture of the Virgin Mary in a Western manuscript. She sits on a throne with the Child on her knee, and four angels round them.'],
    '008r':['Folio 8r','Breves causae','A summary of Matthew’s Gospel that comes before it, beginning “Nativitas Christi in Bethlem”, the Nativity in Bethlehem, its first letters grown into ornament.'],
    '027v':['Folio 27v','The four symbols','A man for Matthew, a lion for Mark, a calf for Luke and an eagle for John, each in a quarter of a cross-shaped frame. They stand before the Gospel of Matthew.'],
    '028v':['Folio 28v','Saint Matthew','The evangelist enthroned under a round arch, holding his book. He faces the first words of his Gospel.'],
    '029r':['Folio 29r','Liber generationis','The opening of Matthew, “The book of the generation of Jesus Christ”, its first letters made into one great ornament.'],
    '032v':['Folio 32v','Christ enthroned','Christ holds a book, with a peacock either side of his head. Peacocks were thought not to decay, and stood for the Resurrection.'],
    '033r':['Folio 33r','The carpet page','The only carpet page in the book: a cross of eight circles, every space filled with interlace. It comes just before the Chi Rho.'],
    '034r':['Folio 34r','The Chi Rho','XPI, the first letters of Christ’s name in Greek, beginning Matthew’s account of the Nativity. Look closely for the cats and mice, and an otter with a fish.'],
    '114r':['Folio 114r','The arrest of Christ','Christ held by two men, under the words that close the Last Supper: “And when they had sung a hymn, they went out to the Mount of Olives.”'],
    '130r':['Folio 130r','Initium evangelii','The opening of the Gospel of Mark, “The beginning of the gospel of Jesus Christ”, its first letters filling most of the page.'],
    '183r':['Folio 183r','Erat autem hora tertia','From Mark: “And it was the third hour, and they crucified him”, the words in great letters filling the page.'],
    '188r':['Folio 188r','Quoniam quidem','The opening of the Gospel of Luke, “Forasmuch as many have taken in hand”, set out in great decorated letters.'],
    '200r':['Folio 200r','Qui fuit','From Luke’s genealogy of Christ, which runs back name by name to Adam: “qui fuit”, “which was the son of”, again and again down the page.'],
    '202v':['Folio 202v','The temptation of Christ','From Luke: Christ on the pinnacle of the Temple, tempted by a small black devil, with a crowd of figures below.'],
    '203r':['Folio 203r','Iesus autem plenus','From Luke: “And Jesus being full of the Holy Ghost returned from Jordan”, the words that lead into his temptation in the wilderness, set in a frame of interlace.'],
    '292r':['Folio 292r','In principio erat verbum','“In the beginning was the Word”: the opening of the Gospel of John.'],
    '309r':['Folio 309r','A page of John','From John 6: “All that the Father giveth me shall come to me.” Most of the book’s pages look like this, in the scribes’ great round script with an animal or a knot in every capital.']
  };
  const DRAWN={
    'paste-front':['The front pastedown','Ex libris','The library’s bookplate.'],
    title:['The title page','Leabhar Cheanannais','The Book of Kells: eighteen of its pages, in facsimile.'],
    colophon:['The colophon','The Book of Kells','How the book was made, lost and found.'],
    'paste-back':['The back pastedown','Críoch','The end.']
  };
  // The faces of the eight leaves that turn (the front cover and seven board leaves), front then back of each.
  // The back cover does not turn; its inside is the last page.
  const FACES=['cover','paste-front','title','005r','007v','008r','027v','028v','029r','032v','033r','034r','114r','130r','183r','188r','200r','202v','203r','292r','309r','colophon'];
  const INK='#2a1a10',RED='#b8442b',YELLOW='#d6a32e',GREEN='#3f7656',BLUE='#2e4478';

  // The book's drawn ornament, shared with the Book of Durrow (durrow-book.js).
  function ornament(fontFamily){
      // A two-strand plait running from (x0,y0) to (x1,y1): drawn in short pieces, the strands taking turns to pass over.
    function plait(c,x0,y0,x1,y1,width,colours){
      const len=Math.hypot(x1-x0,y1-y0),ang=Math.atan2(y1-y0,x1-x0),period=width*1.6,steps=Math.max(2,Math.round(len/period))*2,a=width*.32;
      c.save();c.translate(x0,y0);c.rotate(ang);
      const strand=(k,from,to)=>{c.beginPath();for(let t=from;t<=to+1e-6;t+=(to-from)/10){const x=t*len,y=Math.sin(t*steps*Math.PI+k*Math.PI)*a;t===from?c.moveTo(x,y):c.lineTo(x,y)}};
      for(let i=0;i<steps;i++){const from=i/steps,to=(i+1)/steps,order=i%2?[0,1]:[1,0];
        for(const k of order){c.lineCap='round';strand(k,from,to);c.strokeStyle=INK;c.lineWidth=width*.36;c.stroke();strand(k,from,to);c.strokeStyle=colours[k];c.lineWidth=width*.2;c.stroke()}}
      c.restore();
    }
    function plaitFrame(c,x,y,w,h,width,colours){c.fillStyle=INK;for(const [a,b,cc,d] of [[x,y,x+w,y],[x,y+h,x+w,y+h],[x,y,x,y+h],[x+w,y,x+w,y+h]])plait(c,a,b,cc,d,width,colours);
      for(const [cx,cy] of [[x,y],[x+w,y],[x,y+h],[x+w,y+h]]){c.fillStyle=INK;c.beginPath();c.arc(cx,cy,width*.62,0,Math.PI*2);c.fill();c.fillStyle=colours[1];c.beginPath();c.arc(cx,cy,width*.44,0,Math.PI*2);c.fill();c.fillStyle=colours[0];c.beginPath();c.arc(cx,cy,width*.2,0,Math.PI*2);c.fill()}}
    // Letters outlined in red dots, as the Kells scribes outlined their initials.
    function dotted(c,text,x,y,size,fill){c.font=`${size}px ${fontFamily()}`;c.textAlign='center';c.textBaseline='alphabetic';c.save();c.setLineDash([0,size*.075]);c.lineCap='round';c.lineWidth=size*.05;c.strokeStyle=RED;c.lineJoin='round';
      c.strokeText(text,x,y);c.restore();c.fillStyle=fill;c.fillText(text,x,y)}
    function triskele(c,x,y,r){c.save();c.translate(x,y);c.strokeStyle=INK;c.lineWidth=r*.09;c.lineCap='round';for(let k=0;k<3;k++){c.rotate(Math.PI*2/3);c.beginPath();for(let t=0;t<=1.0001;t+=.02){const a=t*Math.PI*2.4,rr=r*(1-t*.85);const px=Math.cos(a)*rr*.55+r*.42,py=Math.sin(a)*rr*.55;t?c.lineTo(px,py):c.moveTo(px,py)}c.stroke()}c.fillStyle=RED;c.beginPath();c.arc(0,0,r*.1,0,Math.PI*2);c.fill();c.restore()}
    return {plait,plaitFrame,dotted,triskele};
  }
  const KELLS={id:'kells',base:'assets/kells/',manifestFile:'kells.json',aspect:1700/1290,FOLIOS,DRAWN,FACES,
    header:'LEABHAR CHEANANNAIS · THE BOOK OF KELLS',label:'The Book of Kells, a facsimile',source:'Trinity College Dublin, MS 58.',
    coverCard:['Leabhar Cheanannais','A facsimile in a binding of dark calf. Turn the cover to open it.'],
    font:{family:'Uncial Antiqua',url:'assets/fonts/uncial-antiqua-latin-400-normal.woff2'},
    // Calfskin: warm and uneven, darker towards the edges, with the faint speckle of the hair side.
    paper(c,w,h,seed=1){
      c.fillStyle='#e7d7b5';c.fillRect(0,0,w,h);
      let s=seed*9301+49297;const rnd=()=>(s=(s*9301+49297)%233280)/233280;
      for(let i=0;i<70;i++){const x=rnd()*w,y=rnd()*h,r=40+rnd()*160,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${rnd()<.5?'150,118,70':'255,246,220'},${.05+rnd()*.06})`);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)}
      for(let i=0;i<w*h/900;i++){c.fillStyle=`rgba(110,80,40,${.05+rnd()*.12})`;c.fillRect(rnd()*w,rnd()*h,1+rnd()*1.6,1+rnd()*1.6)}
      const edge=c.createRadialGradient(w/2,h/2,Math.min(w,h)*.35,w/2,h/2,Math.max(w,h)*.75);edge.addColorStop(0,'rgba(0,0,0,0)');edge.addColorStop(1,'rgba(92,60,24,.32)');c.fillStyle=edge;c.fillRect(0,0,w,h);
    },
    painters({paper:vellum,lines,fontFamily}){
      const {plait,plaitFrame,dotted,triskele}=ornament(fontFamily);
      return {
      'paste-front':(c,w,h)=>{vellum(c,w,h,3);const bw=w*.5,bh=h*.3,x=(w-bw)/2,y=h*.3;c.fillStyle='rgba(255,250,236,.55)';c.fillRect(x,y,bw,bh);plaitFrame(c,x,y,bw,bh,26,[GREEN,YELLOW]);
        c.fillStyle=INK;c.textAlign='center';c.font=`44px ${fontFamily()}`;c.fillText('ex libris',w/2,y+bh*.36);c.font=`34px ${fontFamily()}`;c.fillText('The Library',w/2,y+bh*.6);c.fillText('After Dark',w/2,y+bh*.6+42)},
      title:(c,w,h)=>{vellum(c,w,h,5);plaitFrame(c,60,60,w-120,h-120,40,[RED,YELLOW]);plaitFrame(c,96,96,w-192,h-192,22,[GREEN,BLUE]);
        dotted(c,'Leabhar',w/2,h*.3,124,INK);dotted(c,'Cheanannais',w/2,h*.3+140,112,INK);
        c.fillStyle=RED;c.font=`54px ${fontFamily()}`;c.textAlign='center';c.fillText('The Book of Kells',w/2,h*.52);
        triskele(c,w/2,h*.62,60);
        c.fillStyle=INK;c.font=`italic 34px Georgia, serif`;c.fillText('eighteen of its pages, in facsimile',w/2,h*.74);
        c.font='28px Georgia, serif';c.fillText('Trinity College Dublin, MS 58',w/2,h*.79);c.fillStyle=GREEN;c.font=`30px ${fontFamily()}`;c.fillText('for the Library After Dark',w/2,h*.86)},
      colophon:(c,w,h)=>{vellum(c,w,h,7);plait(c,110,120,w-110,120,24,[RED,GREEN]);plait(c,110,h-120,w-110,h-120,24,[RED,GREEN]);
        const big=c=>{c.font=`92px ${fontFamily()}`;c.fillStyle=RED};big(c);c.textAlign='left';c.fillText('T',120,272);
        c.fillStyle=INK;c.font='31px Georgia, serif';let y=230;
        y=lines(c,'he Book of Kells is a book of the four Gospels in Latin, written and painted by the community of Colum Cille about the year 800, probably begun on Iona and finished at Kells, in Meath. It has been in Trinity College Dublin since the seventeenth century.',190,y,w-300,44);
        c.textAlign='left';y=lines(c,'In 1007 the annals record that the great Gospel of Colum Cille was stolen by night from the church at Kells, and found two months and twenty nights later, its gold taken from it and a sod over it. The book still has 340 of its leaves.',120,y+26,w-240,44);
        y=lines(c,'There is no gold on its pages: the yellow is orpiment.',120,y+26,w-240,44);
        c.font='italic 29px Georgia, serif';y=lines(c,'This facsimile, made for the library, holds eighteen of its pages, from photographs in the public domain on Wikimedia Commons; each is credited beneath it. Its leaves are board, so that they stay stiff as they turn.',120,y+26,w-240,42);
        triskele(c,w/2,Math.min(h-210,y+70),44)},
      'paste-back':(c,w,h)=>{vellum(c,w,h,11);triskele(c,w/2,h*.46,70);c.fillStyle=INK;c.textAlign='center';c.font=`58px ${fontFamily()}`;c.fillText('Críoch',w/2,h*.62)}
      };
    },
    // Dark calf over boards, blind-tooled, with a gilt interlace cross and the title: the facsimile's own binding (the
    // manuscript's jewelled cover was the gold that was taken in 1007).
    paintCover(c,w,h,{fontFamily}){
      c.fillStyle='#3a2216';c.fillRect(0,0,w,h);
      let s=7;const rnd=()=>(s=(s*9301+49297)%233280)/233280;
      for(let i=0;i<w*h/220;i++){c.fillStyle=`rgba(${rnd()<.5?'20,10,4':'120,80,50'},${.05+rnd()*.1})`;c.fillRect(rnd()*w,rnd()*h,1+rnd()*2.5,1+rnd()*2.5)}
      const tool=(x,y,ww,hh)=>{c.strokeStyle='rgba(12,6,2,.75)';c.lineWidth=5;c.strokeRect(x,y,ww,hh);c.strokeStyle='rgba(150,100,60,.35)';c.lineWidth=2;c.strokeRect(x+3,y+3,ww,hh)};
      tool(36,36,w-72,h-72);tool(64,64,w-128,h-128);
      const GOLD='#d2a64c',DARKGOLD='#7a5a22';const gx=w/2,gy=h*.55,arm=w*.3;
      c.save();c.globalAlpha=.95;for(const [x0,y0,x1,y1] of [[gx-arm,gy,gx+arm,gy],[gx,gy-arm*1.15,gx,gy+arm*1.15]]){const ang=Math.atan2(y1-y0,x1-x0),len=Math.hypot(x1-x0,y1-y0);c.save();c.translate(x0,y0);c.rotate(ang);
        for(let k=0;k<2;k++){c.beginPath();for(let t=0;t<=1;t+=.005){const x=t*len,y=Math.sin(t*20*Math.PI+k*Math.PI)*14;t?c.lineTo(x,y):c.moveTo(x,y)}c.strokeStyle=DARKGOLD;c.lineWidth=11;c.stroke();c.strokeStyle=GOLD;c.lineWidth=6;c.stroke()}c.restore()}
      c.beginPath();c.arc(gx,gy,arm*.42,0,Math.PI*2);c.strokeStyle=DARKGOLD;c.lineWidth=14;c.stroke();c.strokeStyle=GOLD;c.lineWidth=8;c.stroke();c.restore();
      c.fillStyle=GOLD;c.textAlign='center';c.font=`64px ${fontFamily()}`;c.fillText('Leabhar Cheanannais',w/2,h*.17);c.font='italic 30px Georgia, serif';c.fillText('The Book of Kells',w/2,h*.17+50);
    }
  };
  KELLS.ornament=ornament;KELLS.colours={INK,RED,YELLOW,GREEN,BLUE};
  window.KELLS_BOOK=KELLS;
  window.createKellsBook=options=>window.createFineBook(options,KELLS);
})();
