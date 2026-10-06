// The Book of Durrow, a facsimile: the Irish Room's secret, under a sod of turf by the hearth (irish-room.js), now that
// the Book of Kells is on show. Five of its pages, photographs in the public domain from Wikimedia Commons
// (scripts/fetch-book-pages.mjs, assets/durrow), with a title page, a page on its symbols and a colophon, on the same
// thick board leaves as the Kells (fine-books.js), and drawn with the Kells book's ornament (kells-book.js).
(function(){
  'use strict';

  // The five pages, in the order they come in the manuscript (Trinity College Dublin, MS 57), each with its card.
  const FOLIOS={
    '021v':['Folio 21v','The man','The symbol of Matthew, standing before his Gospel in a cloak of red, yellow and green squares like enamel or millefiori glass, with only his head and feet showing.'],
    '086r':['Folio 86r','Initium evangelii','The opening of Mark, “The beginning of the gospel of Jesus Christ”, its first letters grown into spirals and trumpet patterns, outlined in red dots.'],
    '124v':['Folio 124v','The calf','The symbol of Luke, a calf walking alone in a wide frame of interlace, before his Gospel.'],
    '125v':['Folio 125v','A carpet page','Panels of knotwork, ribbons woven over and under, filling the whole page before the opening of Luke.'],
    '192v':['Folio 192v','The carpet page before John','A disc of interlace in a frame of long-jawed animals biting one another, like the animal ornament on the metalwork of the same age, such as the treasure from Sutton Hoo.']
  };
  const DRAWN={
    'paste-front':['The front pastedown','Ex libris','The library’s bookplate.'],
    title:['The title page','Leabhar Darú','The Book of Durrow: five of its pages, in facsimile.'],
    symbols:['A note','The four symbols','Why the eagle here belongs to Mark, and the lion to John.'],
    colophon:['The colophon','The Book of Durrow','How the book was made, kept and found.'],
    'paste-back':['The back pastedown','Críoch','The end.']
  };
  // The faces of the five leaves that turn (the front cover and four board leaves), front then back of each.
  const FACES=['cover','paste-front','title','021v','086r','124v','125v','192v','symbols','colophon'];
  const KELLS=window.KELLS_BOOK,{INK,RED,YELLOW,GREEN}=KELLS.colours;

  const DURROW={id:'durrow',base:'assets/durrow/',manifestFile:'durrow.json',aspect:1690/1000,FOLIOS,DRAWN,FACES,
    header:'LEABHAR DARÚ · THE BOOK OF DURROW',label:'The Book of Durrow, a facsimile',source:'Trinity College Dublin, MS 57.',
    coverCard:['Leabhar Darú','A facsimile in a binding of dark calf. Turn the cover to open it.'],
    font:KELLS.font,
    binding:{leather:0x2e1c12},
    paper:KELLS.paper,
    painters(tools){
      const {paper:vellum,lines,fontFamily}=tools,{plait,plaitFrame,dotted,triskele}=KELLS.ornament(fontFamily),kells=KELLS.painters(tools);
      return {
      'paste-front':kells['paste-front'],
      title:(c,w,h)=>{vellum(c,w,h,13);plaitFrame(c,60,60,w-120,h-120,36,[YELLOW,RED]);plaitFrame(c,94,94,w-188,h-188,20,[GREEN,YELLOW]);
        dotted(c,'Leabhar',w/2,h*.28,140,INK);dotted(c,'Darú',w/2,h*.28+170,150,INK);
        c.fillStyle=RED;c.font=`64px ${fontFamily()}`;c.textAlign='center';c.fillText('The Book of Durrow',w/2,h*.5);
        triskele(c,w/2,h*.6,70);
        c.fillStyle=INK;c.font='italic 40px Georgia, serif';c.fillText('five of its pages, in facsimile',w/2,h*.71);
        c.font='34px Georgia, serif';c.fillText('Trinity College Dublin, MS 57',w/2,h*.76);c.fillStyle=GREEN;c.font=`36px ${fontFamily()}`;c.fillText('for the Library After Dark',w/2,h*.83)},
      symbols:(c,w,h)=>{vellum(c,w,h,17);plait(c,100,140,w-100,140,24,[YELLOW,GREEN]);
        c.fillStyle=RED;c.textAlign='center';c.font=`76px ${fontFamily()}`;c.fillText('The four symbols',w/2,300);
        c.fillStyle=INK;c.font='38px Georgia, serif';c.textAlign='left';let y=400;
        y=lines(c,'Each Gospel opens with a creature taken from the vision of Ezekiel and the Revelation of John: a man, a lion, a calf and an eagle.',100,y,w-200,54);
        y=lines(c,'Since Saint Jerome, most books have given the lion to Mark and the eagle to John. The Book of Durrow keeps an older order, from Irenaeus: the man for Matthew, the eagle for Mark, the calf for Luke and the lion for John.',100,y+34,w-200,54);
        c.textAlign='center';c.font=`50px ${fontFamily()}`;y+=120;
        for(const [creature,gospel] of [['the man','Matthew'],['the eagle','Mark'],['the calf','Luke'],['the lion','John']]){c.fillStyle=RED;c.fillText(creature,w/2-170,y);c.fillStyle=INK;c.fillText(gospel,w/2+180,y);y+=88}
        triskele(c,w/2,Math.min(h-260,y+90),60);plait(c,100,h-140,w-100,h-140,24,[YELLOW,GREEN])},
      colophon:(c,w,h)=>{vellum(c,w,h,19);plait(c,100,130,w-100,130,24,[RED,GREEN]);plait(c,100,h-130,w-100,h-130,24,[RED,GREEN]);
        c.font=`104px ${fontFamily()}`;c.fillStyle=RED;c.textAlign='left';c.fillText('T',100,300);
        c.fillStyle=INK;c.font='35px Georgia, serif';let y=250;
        y=lines(c,'he Book of Durrow is a book of the four Gospels in Latin, made in the second half of the seventh century in a house of Colum Cille’s community: at Durrow, in Offaly, or perhaps on Iona or in Northumbria, for scholars still disagree.',180,y,w-280,50);
        c.textAlign='left';y=lines(c,'It is the earliest of the great Irish Gospel books to survive, a century or more older than the Book of Kells. About the year 900 King Flann Sinna had a shrine made for it, since lost.',100,y+34,w-200,50);
        y=lines(c,'In the 1600s Conall Mageoghagan wrote that the farmer who kept it would pour water over it and give the water to his sick cattle. It came to Trinity College Dublin, with the Book of Kells, through Henry Jones, bishop of Meath.',100,y+34,w-200,50);
        c.font='italic 32px Georgia, serif';y=lines(c,'This facsimile, made for the library, holds five of its pages, from photographs in the public domain on Wikimedia Commons; each is credited beneath it. Its leaves are board, so that they stay stiff as they turn.',100,y+34,w-200,46);
        triskele(c,w/2,Math.min(h-240,y+90),50)},
      'paste-back':(c,w,h)=>{vellum(c,w,h,23);triskele(c,w/2,h*.46,66);c.fillStyle=INK;c.textAlign='center';c.font=`56px ${fontFamily()}`;c.fillText('Críoch',w/2,h*.62)}
      };
    },
    // Dark calf over boards, blind-tooled, with a gilt roundel of three spirals, after the disc on folio 192v.
    paintCover(c,w,h,{fontFamily}){
      c.fillStyle='#2e1c12';c.fillRect(0,0,w,h);
      let s=11;const rnd=()=>(s=(s*9301+49297)%233280)/233280;
      for(let i=0;i<w*h/220;i++){c.fillStyle=`rgba(${rnd()<.5?'16,8,3':'110,74,46'},${.05+rnd()*.1})`;c.fillRect(rnd()*w,rnd()*h,1+rnd()*2.5,1+rnd()*2.5)}
      const tool=(x,y,ww,hh)=>{c.strokeStyle='rgba(10,5,2,.75)';c.lineWidth=5;c.strokeRect(x,y,ww,hh);c.strokeStyle='rgba(140,95,58,.32)';c.lineWidth=2;c.strokeRect(x+3,y+3,ww,hh)};
      tool(34,34,w-68,h-68);tool(60,60,w-120,h-120);
      const GOLD='#d2a64c',DARKGOLD='#7a5a22',gx=w/2,gy=h*.55,r=w*.26;
      for(const [width,colour] of [[14,DARKGOLD],[8,GOLD]]){c.strokeStyle=colour;c.lineWidth=width;c.beginPath();c.arc(gx,gy,r,0,Math.PI*2);c.stroke();
        for(let k=0;k<3;k++){const a0=k*Math.PI*2/3;c.beginPath();for(let t=0;t<=1.0001;t+=.02){const a=a0+t*Math.PI*2.2,rr=r*.82*(1-t*.8);const px=gx+Math.cos(a0)*r*.36+Math.cos(a)*rr*.5,py=gy+Math.sin(a0)*r*.36+Math.sin(a)*rr*.5;t?c.lineTo(px,py):c.moveTo(px,py)}c.stroke()}}
      c.fillStyle=GOLD;c.textAlign='center';c.font=`66px ${fontFamily()}`;c.fillText('Leabhar Darú',w/2,h*.17);c.font='italic 30px Georgia, serif';c.fillText('The Book of Durrow',w/2,h*.17+50);
    }
  };
  window.DURROW_BOOK=DURROW;
  window.createDurrowBook=options=>window.createFineBook(options,DURROW);
})();
