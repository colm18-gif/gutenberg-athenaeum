// The Kelmscott Chaucer, a facsimile: the Periodicals Room's secret book (periodicals-room.js keeps it on the shelf of an
// Albion hand press, which prints its first page when the bar is pulled). The Works of Geoffrey Chaucer, printed by
// William Morris at the Kelmscott Press in 1896, with Edward Burne-Jones's pictures: pages photographed from the Internet
// Archive's scan and from museum leaves, in the public domain on Wikimedia Commons (scripts/fetch-book-pages.mjs,
// assets/kelmscott), bound with a title page and a colophon on thick board leaves (fine-books.js).
(function(){
  'use strict';

  // The pages, in the book's order, each with its card. Morris designed each opening as a pair of pages, so the pages
  // are bound to face each other as they do in the book.
  const FOLIOS={};
  const DRAWN={
    'paste-front':['The front pastedown','Ex libris','The library’s bookplate.'],
    title:['The title page','The Kelmscott Chaucer','The Works of Geoffrey Chaucer, as the Kelmscott Press printed them: some of its pages, in facsimile.'],
    colophon:['The colophon','The Kelmscott Chaucer','How the book was made.'],
    'paste-back':['The back pastedown','Finis','The end.']
  };
  const FACES=['cover','paste-front','title','colophon'];
  const INK='#1d1610',RED='#a8321f',PAPER='#ece4d0';

  // Laid paper, as Morris had it made by hand: warm, a little uneven, with the fine laid lines and the wider chain lines
  // of the mould showing through.
  function paper(c,w,h,seed=1){
    c.fillStyle=PAPER;c.fillRect(0,0,w,h);
    let s=seed*9301+49297;const rnd=()=>(s=(s*9301+49297)%233280)/233280;
    for(let i=0;i<40;i++){const x=rnd()*w,y=rnd()*h,r=60+rnd()*200,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${rnd()<.5?'170,150,110':'255,252,240'},${.04+rnd()*.05})`);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)}
    c.fillStyle='rgba(120,100,70,.05)';for(let y=0;y<h;y+=3)c.fillRect(0,y,w,1);
    c.fillStyle='rgba(120,100,70,.07)';for(let x=w*.04;x<w;x+=w/9)c.fillRect(x,0,2,h);
    const edge=c.createRadialGradient(w/2,h/2,Math.min(w,h)*.4,w/2,h/2,Math.max(w,h)*.75);edge.addColorStop(0,'rgba(0,0,0,0)');edge.addColorStop(1,'rgba(110,85,50,.18)');c.fillStyle=edge;c.fillRect(0,0,w,h);
  }
  // A border of vine in the manner of Morris's: a stem winding along a band, with leaves and small flowers in each turn,
  // drawn in black on a ground left white.
  function vineBand(c,x0,y0,x1,y1,width,ink=INK){
    const len=Math.hypot(x1-x0,y1-y0),ang=Math.atan2(y1-y0,x1-x0),turns=Math.max(2,Math.round(len/(width*1.8))),a=width*.3;
    c.save();c.translate(x0,y0);c.rotate(ang);c.fillStyle=ink;c.fillRect(0,-width/2,len,width);
    c.strokeStyle=PAPER;c.fillStyle=PAPER;c.lineWidth=width*.07;c.lineCap='round';
    c.beginPath();for(let t=0;t<=1.0001;t+=.002){const x=t*len,y=Math.sin(t*turns*Math.PI*2)*a;t?c.lineTo(x,y):c.moveTo(x,y)}c.stroke();
    for(let k=0;k<turns*2;k++){const t=(k+.5)/(turns*2),x=t*len,side=k%2?1:-1,y=side*a*.15;
      for(const [dx,dy,r] of [[-.22,.55,.2],[.22,.55,.2],[0,.85,.16]]){c.save();c.translate(x+dx*width,y+side*dy*width*.5);c.rotate(dx*2);c.beginPath();c.ellipse(0,0,width*r,width*r*.45,0,0,Math.PI*2);c.fill();c.restore()}
      c.beginPath();c.arc(x,-side*a*.85,width*.09,0,Math.PI*2);c.fill()}
    c.restore();
  }
  function vineFrame(c,x,y,w,h,width,ink){for(const [a,b,cc,d] of [[x,y,x+w,y],[x,y+h,x+w,y+h],[x,y,x,y+h],[x+w,y,x+w,y+h]])vineBand(c,a,b,cc,d,width,ink)}

  const KELMSCOTT={id:'kelmscott',base:'assets/kelmscott/',manifestFile:'kelmscott.json',aspect:1730/1190,FOLIOS,DRAWN,FACES,
    header:'THE KELMSCOTT CHAUCER · THE WORKS OF GEOFFREY CHAUCER, 1896',label:'The Kelmscott Chaucer, a facsimile',source:'The Works of Geoffrey Chaucer, Kelmscott Press, 1896.',
    coverCard:['The Kelmscott Chaucer','A facsimile in white pigskin, blind-tooled. Turn the cover to open it.'],
    font:{family:'Kelmscott Fell',url:'assets/fonts/im-fell-english-sc-latin-400-normal.woff2'},
    binding:{leather:0xd9ccb0,edges:0xe6dcc4,gilt:false},
    paper,
    painters({lines,fontFamily}){
      return {
        'paste-front':(c,w,h)=>{paper(c,w,h,3);const bw=w*.52,bh=h*.26,x=(w-bw)/2,y=h*.32;vineFrame(c,x,y,bw,bh,30);
          c.fillStyle=INK;c.textAlign='center';c.font=`40px ${fontFamily()}`;c.fillText('EX LIBRIS',w/2,y+bh*.4);c.fillStyle=RED;c.font=`34px ${fontFamily()}`;c.fillText('THE LIBRARY',w/2,y+bh*.6);c.fillText('AFTER DARK',w/2,y+bh*.6+42)},
        title:(c,w,h)=>{paper(c,w,h,5);vineFrame(c,70,70,w-140,h-140,54);
          c.fillStyle=INK;c.textAlign='center';c.font=`72px ${fontFamily()}`;c.fillText('THE KELMSCOTT',w/2,h*.3);c.fillText('CHAUCER',w/2,h*.3+86);
          c.fillStyle=RED;c.font=`40px ${fontFamily()}`;c.fillText('THE WORKS OF',w/2,h*.48);c.fillText('GEOFFREY CHAUCER',w/2,h*.48+50);
          c.fillStyle=INK;c.font='italic 34px Georgia, serif';c.fillText('some of its pages, in facsimile',w/2,h*.66);
          c.font='28px Georgia, serif';c.fillText('Kelmscott Press, Hammersmith, 1896',w/2,h*.71);c.fillStyle=RED;c.font=`30px ${fontFamily()}`;c.fillText('FOR THE LIBRARY AFTER DARK',w/2,h*.8)},
        colophon:(c,w,h)=>{paper(c,w,h,7);vineBand(c,120,130,w-120,130,34);vineBand(c,120,h-130,w-120,h-130,34);
          c.fillStyle=RED;c.font=`96px ${fontFamily()}`;c.textAlign='left';c.fillText('T',120,300);
          c.fillStyle=INK;c.font='31px Georgia, serif';let y=262;
          y=lines(c,'he Works of Geoffrey Chaucer, now newly imprinted, was printed by William Morris at the Kelmscott Press in Hammersmith and finished in May 1896.',196,y,w-316,46);
          c.textAlign='left';y=lines(c,'Edward Burne-Jones designed its eighty-seven pictures; Morris designed its borders, its initials and its type, a smaller cut of his Troy type that he named Chaucer. It was printed in black and red, in four hundred and twenty-five copies on paper and thirteen on vellum.',120,y+28,w-240,46);
          y=lines(c,'Burne-Jones called it a pocket cathedral. Morris died that October.',120,y+28,w-240,46);
          c.font='italic 29px Georgia, serif';y=lines(c,'This facsimile, made for the library, holds some of its pages, from photographs in the public domain on Wikimedia Commons; each is credited beneath it. Its leaves are board, so that they stay stiff as they turn.',120,y+28,w-240,44)},
        'paste-back':(c,w,h)=>{paper(c,w,h,11);vineFrame(c,w*.3,h*.42,w*.4,h*.14,22);c.fillStyle=RED;c.textAlign='center';c.font=`54px ${fontFamily()}`;c.fillText('FINIS',w/2,h*.5+18)}
      };
    },
    // White pigskin over boards, blind-tooled: a border of vines round a large diapered panel, as the Doves Bindery bound
    // the Chaucer for Morris, with two clasps on the fore-edge.
    paintCover(c,w,h,{fontFamily}){
      c.fillStyle='#ddd0b4';c.fillRect(0,0,w,h);
      let s=9;const rnd=()=>(s=(s*9301+49297)%233280)/233280;
      for(let i=0;i<w*h/160;i++){c.fillStyle=`rgba(${rnd()<.5?'120,100,70':'255,250,235'},${.04+rnd()*.08})`;c.beginPath();c.arc(rnd()*w,rnd()*h,.6+rnd()*1.6,0,Math.PI*2);c.fill()}
      const blind='rgba(95,75,48,.55)',light='rgba(255,250,236,.45)';
      const tool=(x,y,ww,hh,lw=4)=>{c.strokeStyle=blind;c.lineWidth=lw;c.strokeRect(x,y,ww,hh);c.strokeStyle=light;c.lineWidth=1.5;c.strokeRect(x+2,y+2,ww,hh)};
      tool(30,30,w-60,h-60);tool(52,52,w-104,h-104,2);
      vineFrame(c,90,90,w-180,h-180,46,'rgba(120,96,62,.45)');
      tool(140,140,w-280,h-280);
      c.save();c.beginPath();c.rect(142,142,w-284,h-284);c.clip();c.strokeStyle=blind;c.lineWidth=3;
      for(let d=-h;d<w+h;d+=56){c.beginPath();c.moveTo(d,142);c.lineTo(d+h,142+h);c.stroke();c.beginPath();c.moveTo(d,142+h);c.lineTo(d+h,142);c.stroke()}
      c.fillStyle='rgba(120,96,62,.4)';for(let y=170;y<h-140;y+=56)for(let x=170+((y/56)%2?28:0);x<w-140;x+=56){c.beginPath();c.arc(x,y,5,0,Math.PI*2);c.fill()}
      c.restore();
      c.fillStyle='rgba(222,210,182,.92)';c.fillRect(w*.22,h*.42,w*.56,h*.13);tool(w*.22,h*.42,w*.56,h*.13,3);
      c.fillStyle='rgba(80,62,40,.85)';c.textAlign='center';c.font=`50px ${fontFamily()}`;c.fillText('CHAUCER',w/2,h*.42+h*.065+8);c.font='24px Georgia, serif';c.fillText('KELMSCOTT · MDCCCXCVI',w/2,h*.42+h*.065+44);
      for(const y of [h*.3,h*.7]){c.fillStyle='#b9bcbf';c.fillRect(w-46,y-26,46,52);c.strokeStyle='#6e7276';c.lineWidth=3;c.strokeRect(w-44,y-24,42,48)}
    }
  };
  window.KELMSCOTT_BOOK=KELMSCOTT;
  window.createKelmscottBook=options=>{const book=window.createFineBook(options,KELMSCOTT);book.sheetUrl=KELMSCOTT.sheet?`${KELMSCOTT.base}${KELMSCOTT.sheet}.jpg`:null;return book};
})();
