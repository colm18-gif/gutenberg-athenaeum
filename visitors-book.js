// The visitors' book by the entrance, signed by real readers. A signature is a first name or initials, a country,
// a book from the library and one line chosen from a fixed list, kept by a very small service
// (worker/visitors-book). It only appears once that service is set up (data/visitors-book-config.js); until then
// the lectern keeps the library's invented visitors' book (other-readers.js).
(function(){
  'use strict';

  // Keep in step with worker/visitors-book/worker.js (a test checks they match).
  const PHRASES=[
    'Came for one chapter, stayed for six.','The quiet was exactly what I needed.','Found a book I have meant to read for years.',
    'Read by the fire until very late.','I will be back tomorrow night.','Greetings from a fellow reader.','Got happily lost.',
    'The cat ignored me beautifully.','Followed the lamps and found a story.','Thank you for keeping the lights on.',
    'Reading in English, one page at a time.','Went to the Moon and back.'
  ];
  const COUNTRIES=('AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ '+
    'DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ '+
    'LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW '+
    'SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS XK YE YT ZA ZM ZW').split(' ');
  const LOCALIZED={"es":{"ui":["Libro de visitas","Lectores que vinieron después del anochecer, del más reciente al primero.","Firma el libro","Tu nombre o iniciales","¿Desde dónde lees?","Elige un país…","Un libro de la biblioteca que te guste","(opcional)","Escribe un título","Elige una frase","Tu nombre, país, libro y frase serán visibles para quienes abran el libro. No se guarda nada más.","Firmar el libro de visitas","Cerrar","Ya has firmado esta noche. Gracias por visitarnos.","Abriendo el libro…","No se pudo abrir el libro.","Nadie ha firmado todavía. ¡Sé el primero!","Firmando…","Por favor, escribe tu nombre o iniciales.","Elige desde dónde lees.","Elige una frase.","Elige un libro de la lista o deja el campo vacío.","No se pudo conectar con el libro. Inténtalo de nuevo.","No se pudo guardar la firma."],"phrases":["Vine por un capítulo y me quedé seis.","El silencio era justo lo que necesitaba.","Encontré un libro que llevaba años queriendo leer.","Leí junto al fuego hasta muy tarde.","Volveré mañana por la noche.","Saludos de otro lector.","Me perdí felizmente.","El gato me ignoró con elegancia.","Seguí las lámparas y encontré una historia.","Gracias por mantener las luces encendidas.","Leo en inglés, página a página.","Fui a la Luna y regresé."]},"pt":{"ui":["Livro de visitas","Leitores que chegaram depois de anoitecer, dos mais recentes aos mais antigos.","Assinar o livro","Nome próprio ou iniciais","De onde está a ler?","Escolha um país…","Um livro da biblioteca de que gosta","(opcional)","Escreva um título","Escolha uma frase","O seu nome, país, livro e frase ficam visíveis para quem abrir o livro. Não se guarda mais nada.","Assinar o livro de visitas","Fechar","Já assinou esta noite. Obrigado pela visita.","A abrir o livro…","Não foi possível abrir o livro.","Ainda ninguém assinou. Seja o primeiro!","A assinar…","Indique o seu nome ou iniciais.","Escolha de onde está a ler.","Escolha uma frase.","Escolha um livro da lista ou deixe em branco.","Não foi possível contactar o livro. Tente novamente.","Não foi possível guardar a assinatura."],"phrases":["Vim por um capítulo e fiquei por seis.","O silêncio era exatamente aquilo de que precisava.","Encontrei um livro que queria ler há anos.","Li junto à lareira até muito tarde.","Voltarei amanhã à noite.","Saudações de outro leitor.","Perdi-me com gosto.","O gato ignorou-me lindamente.","Segui as luzes e encontrei uma história.","Obrigado por manterem as luzes acesas.","Leio em inglês, uma página de cada vez.","Fui à Lua e voltei."]},"fr":{"ui":["Livre d’or","Les lecteurs venus après la tombée de la nuit, du plus récent au plus ancien.","Signer le livre","Prénom ou initiales","D’où lisez-vous ?","Choisissez un pays…","Un livre de la bibliothèque que vous aimez","(facultatif)","Saisissez un titre","Choisissez une phrase","Votre nom, pays, livre et phrase seront visibles pour tous les lecteurs du livre. Rien d’autre n’est conservé.","Signer le livre d’or","Fermer","Vous avez déjà signé ce soir. Merci de votre visite.","Ouverture du livre…","Impossible d’ouvrir le livre.","Personne n’a encore signé. Soyez le premier !","Signature en cours…","Indiquez votre prénom ou vos initiales.","Choisissez votre pays.","Choisissez une phrase.","Choisissez un livre de la liste ou laissez ce champ vide.","Impossible de joindre le livre. Réessayez.","Impossible d’enregistrer la signature."],"phrases":["Je suis venu pour un chapitre, je suis resté pour six.","Le calme était exactement ce qu’il me fallait.","J’ai trouvé un livre que je voulais lire depuis des années.","J’ai lu près du feu jusque tard dans la nuit.","Je reviendrai demain soir.","Salutations d’un autre lecteur.","Je me suis perdu avec bonheur.","Le chat m’a superbement ignoré.","J’ai suivi les lampes et découvert une histoire.","Merci de garder les lumières allumées.","Je lis en anglais, une page à la fois.","Je suis allé sur la Lune et j’en suis revenu."]},"zh":{"ui":["訪客留言簿","夜訪讀者的留言，最新的排在最前面。","簽名留言","名字或姓名縮寫","您從哪個國家閱讀？","選擇國家或地區…","您喜歡的館藏書籍","（選填）","輸入書名","選擇一句留言","您的名字、國家、書籍及留言會公開給閱覽者。不會儲存其他資料。","簽名留言","關閉","您今晚已簽過名。謝謝來訪。","正在開啟留言簿…","目前無法開啟留言簿。","尚無留言。歡迎成為第一位！","正在送出…","請填寫名字或姓名縮寫。","請選擇閱讀所在地。","請選擇一句留言。","請從清單選書，或留空。","暫時無法連線，請重試。","無法儲存簽名。"],"phrases":["原本只想讀一章，結果讀了六章。","這份寧靜正是我所需要的。","找到一本多年來一直想讀的書。","在爐火旁讀書直到深夜。","明晚我還會回來。","另一位讀者向大家問好。","迷路也迷得很快樂。","貓咪優雅地無視了我。","循著燈光，找到了一個故事。","謝謝你們讓燈光長明。","我一頁一頁地讀英文書。","我去了月球，又回來了。"]},"la":{"ui":["Liber hospitum","Lectores post noctem ingressi, recentissimi primi.","Nomen inscribe","Praenomen vel initiales","Unde legis?","Patriam elige…","Liber bibliothecae tibi gratus","(si vis)","Titulum scribe","Sententiam elige","Nomen, patria, liber et sententia omnibus qui librum aperiunt ostendentur. Nihil aliud servatur.","Inscribe nomen","Claude","Hac nocte iam subscripsisti. Gratias quod venisti.","Liber aperitur…","Liber nunc aperiri non potest.","Nemo adhuc subscripsit. Primus esto!","Nomen inscribitur…","Praenomen vel initiales da.","Patriam tuam elige.","Sententiam elige.","Librum e indice elige aut vacuum relinque.","Liber nunc attingi non potest. Iterum conare.","Nomen inscribi non potuit."],"phrases":["Unum capitulum petivi, sex legi.","Silentium ipsum mihi opus erat.","Librum diu quaesitum inveni.","Ad ignem usque ad noctem seram legi.","Cras nocte redibo.","Salutem lector alter dicit.","Laetus erravi.","Feles me prorsus neglexit.","Lumina secutus fabulam inveni.","Gratias quod lumina accensa manent.","Anglice lego, paginam post paginam.","Ad Lunam ivi et redii."]},"it":{"ui":["Libro degli ospiti","I lettori arrivati dopo il tramonto, dai più recenti.","Firma il libro","Nome o iniziali","Da dove leggi?","Scegli un Paese…","Un libro della biblioteca che ti piace","(facoltativo)","Inizia a scrivere un titolo","Scegli una frase","Nome, Paese, libro e frase saranno visibili a chi apre il registro. Non viene conservato altro.","Firma il libro degli ospiti","Chiudi","Hai già firmato stasera. Grazie della visita.","Apertura del libro…","Impossibile aprire il libro.","Nessuno ha ancora firmato. Sii il primo!","Firma in corso…","Inserisci il nome o le iniziali.","Scegli da dove leggi.","Scegli una frase.","Scegli un libro dall’elenco o lascia vuoto.","Impossibile contattare il libro. Riprova.","Impossibile salvare la firma."],"phrases":["Ero venuto per un capitolo e ne ho letti sei.","Il silenzio era proprio ciò di cui avevo bisogno.","Ho trovato un libro che volevo leggere da anni.","Ho letto accanto al fuoco fino a tardi.","Tornerò domani sera.","Un saluto da un altro lettore.","Mi sono perso felicemente.","Il gatto mi ha ignorato con eleganza.","Ho seguito le lampade e trovato una storia.","Grazie per aver tenuto accese le luci.","Leggo in inglese, una pagina alla volta.","Sono andato sulla Luna e sono tornato."]},"uk":{"ui":["Книга відгуків","Читачі, які завітали після настання темряви. Найновіші записи — першими.","Залишити запис","Ім’я або ініціали","Звідки ви читаєте?","Оберіть країну…","Улюблена книжка з бібліотеки","(необов’язково)","Почніть вводити назву","Оберіть фразу","Ваше ім’я, країну, книжку й фразу бачитимуть усі відвідувачі книги. Інші дані не зберігаються.","Підписати книгу відгуків","Закрити","Сьогодні ви вже залишили запис. Дякуємо за візит.","Відкриваємо книгу…","Не вдалося відкрити книгу.","Записів ще немає. Станьте першими!","Підписуємо…","Вкажіть ім’я або ініціали.","Оберіть країну, з якої читаєте.","Оберіть фразу.","Оберіть книжку зі списку або залиште поле порожнім.","Не вдалося зв’язатися з книгою. Спробуйте ще раз.","Не вдалося зберегти підпис."],"phrases":["Прийшлося за одним розділом, а залишилося на шість.","Тиша була саме тим, що мені потрібно.","Знайшлася книжка, яку давно хотілося прочитати.","Читалося біля каміна до пізньої ночі.","Повернуся завтра ввечері.","Вітання від ще одного читача.","Із радістю заблукалося.","Кіт блискуче мене проігнорував.","Пішлося за світлом ламп і знайшлася історія.","Дякую, що не гасите світла.","Читаю англійською, сторінка за сторінкою.","Побував на Місяці й повернувся."]}};
  const DEFAULT_UI=["The visitors’ book","Readers who came in after dark, most recent first.","Sign the book","Your first name or initials","Where you are reading from","Choose a country…","A book from the library you like","(optional)","Start typing a title","And a line for the book","Your name, country, book and line are shown to everyone who opens the book. Nothing else is kept.","Sign the visitors’ book","Close","You have signed the book tonight. Thank you for visiting.","Opening the book…","The book could not be opened just now.","No one has signed yet. Be the first.","Signing…","Please give a first name or initials.","Please choose where you are reading from.","Please choose a line to write.","Please choose a book from the list, or leave it empty.","The book could not be reached just now. Please try again.","The book could not take that signature."];
  const SIGNED_KEY='athenaeum-visitors-signed';

  let names=null;
  function countryName(code){
    try{names=names||new Intl.DisplayNames(['en'],{type:'region'});return names.of(code)||code}catch(e){return code}
  }

  window.ATHENAEUM_VISITORS_BOOK_RULES={PHRASES,COUNTRIES};
  window.createVisitorsBook=function(options){
    const {endpoint,books=()=>[],onOpen=()=>{},onClose=()=>{},onSigned=()=>{},fetchImpl=(...a)=>fetch(...a),storage=null,language=()=>'en',today=()=>new Date()}=options;
    const base=String(endpoint||'').replace(/\/+$/,'');
    const store={get(k){try{return storage?.getItem(k)??null}catch(e){return null}},set(k,v){try{storage?.setItem(k,v)}catch(e){}}};
    let entries=[],loaded=false,loading=null,dialog=null,open=false,locale='en';const listeners=[];
    const normalizedLocale=value=>{const code=String(value||'en').toLowerCase().split(/[-_]/)[0];return LOCALIZED[code]?code:'en'};
    const ui=()=>LOCALIZED[locale]?.ui||DEFAULT_UI;
    const phraseText=index=>LOCALIZED[locale]?.phrases[index]||PHRASES[index]||'';
    const countryLabel=code=>{try{return new Intl.DisplayNames([locale==='la'?'en':locale],{type:'region'}).of(code)||countryName(code)}catch(e){return countryName(code)}};
    const titleOf=id=>{const b=books().find(x=>x.id===id);return b?b.title:null};
    const signedToday=()=>store.get(SIGNED_KEY)===today().toISOString().slice(0,10);
    function describe(e){return {id:e.id,name:e.n,place:countryName(e.c),phraseIndex:e.p,country:e.c,book:e.b?titleOf(e.b):null,note:PHRASES[e.p]||'',date:new Date(e.d+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'long',timeZone:'UTC'})}}

    function refresh(){
      if(!base)return Promise.resolve([]);
      if(!loading)loading=fetchImpl(base+'/entries').then(r=>r.ok?r.json():Promise.reject(new Error(String(r.status)))).then(data=>{entries=(data.entries||[]).map(describe);loaded=true;for(const fn of listeners)fn(entries);return entries}).finally(()=>{loading=null});
      return loading;
    }
    async function sign(values){
      const name=String(values.name||'').replace(/\s+/g,' ').trim();
      if(!name)return {error:ui()[18]};
      if(!COUNTRIES.includes(values.country))return {error:ui()[19]};
      const phrase=Number(values.phrase);if(!(phrase>=0&&phrase<PHRASES.length))return {error:ui()[20]};
      let book=0;const title=String(values.book||'').trim();if(title){const match=books().find(b=>b.title.toLowerCase()===title.toLowerCase());if(!match)return {error:ui()[21]};book=match.id}
      let response;try{response=await fetchImpl(base+'/sign',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,country:values.country,book,phrase})})}catch(e){return {error:ui()[22]}}
      let data={};try{data=await response.json()}catch(e){}
      if(!response.ok)return {error:data.error||ui()[23]};
      store.set(SIGNED_KEY,today().toISOString().slice(0,10));
      const entry=describe(data.entry);entries=[entry,...entries.filter(e=>e.id!==entry.id)];for(const fn of listeners)fn(entries);onSigned(entry);
      return {entry};
    }

    // While the book is open, keys belong to it: typing never walks or turns pages, and Escape closes it.
    window.addEventListener?.('keydown',e=>{if(!open)return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();return}e.stopImmediatePropagation()},true);
    window.addEventListener?.('keyup',e=>{if(open)e.stopImmediatePropagation()},true);

    // ---------- the dialog ----------
    function build(){
      dialog=document.createElement('div');dialog.id='visitorsBook';dialog.className='hidden';dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-labelledby','vbTitle');
      dialog.innerHTML=`<section class="vb-card"><small>THE LIBRARY AFTER DARK</small><h2 id="vbTitle">The visitors’ book</h2>
        <p class="vb-intro">Readers who came in after dark, most recent first.</p><ol class="vb-list" aria-live="polite"></ol>
        <form class="vb-form" novalidate><h3>Sign the book</h3>
          <label>Your first name or initials<input name="name" maxlength="24" autocomplete="given-name" required></label>
          <label>Where you are reading from<select name="country" required><option value="">Choose a country…</option></select></label>
          <label>A book from the library you like <em>(optional)</em><input name="book" list="vbBooks" autocomplete="off" placeholder="Start typing a title"><datalist id="vbBooks"></datalist></label>
          <label>And a line for the book<select name="phrase" required></select></label>
          <p class="vb-privacy">Your name, country, book and line are shown to everyone who opens the book. Nothing else is kept.</p>
          <p class="vb-status" role="status"></p>
          <div class="vb-actions"><button type="submit" class="primary">Sign the visitors’ book</button><button type="button" class="ghost vb-close">Close</button></div>
        </form>
        <div class="vb-signed hidden"><p>You have signed the book tonight. Thank you for visiting.</p><button type="button" class="ghost vb-close">Close</button></div></section>`;
      document.body.appendChild(dialog);
      const form=dialog.querySelector('form'),country=form.elements.country,phrase=form.elements.phrase;
      for(const code of [...COUNTRIES].sort((a,b)=>countryName(a).localeCompare(countryName(b)))){const o=document.createElement('option');o.value=code;o.textContent=countryName(code);country.append(o)}
      const region=(String(language()||'').match(/[-_]([A-Za-z]{2})$/)||[])[1];if(region&&COUNTRIES.includes(region.toUpperCase()))country.value=region.toUpperCase();
      PHRASES.forEach((text,i)=>{const o=document.createElement('option');o.value=String(i);o.textContent=text;phrase.append(o)});
      const list=dialog.querySelector('#vbBooks');for(const b of books().slice().sort((a,b)=>a.title.localeCompare(b.title))){const o=document.createElement('option');o.value=b.title;list.append(o)}
      localize();
      form.addEventListener('submit',async e=>{e.preventDefault();const status=dialog.querySelector('.vb-status'),button=form.querySelector('button[type=submit]');
        button.disabled=true;status.textContent=ui()[17];const result=await sign({name:form.elements.name.value,country:country.value,book:form.elements.book.value,phrase:phrase.value});button.disabled=false;
        if(result.error){status.textContent=result.error;return}status.textContent='';render()});
      dialog.addEventListener('click',e=>{if(e.target.closest('.vb-close')||e.target===dialog)close()});
    }
    function localize(){
      if(!dialog)return;const t=ui(),form=dialog.querySelector('form');dialog.lang=locale;
      dialog.querySelector('#vbTitle').textContent=t[0];dialog.querySelector('.vb-intro').textContent=t[1];form.querySelector('h3').textContent=t[2];
      const labels=form.querySelectorAll('label');labels[0].firstChild.textContent=t[3];labels[1].firstChild.textContent=t[4];labels[2].firstChild.textContent=t[6]+' ';labels[2].querySelector('em').textContent=t[7];labels[3].firstChild.textContent=t[9];
      form.elements.book.placeholder=t[8];form.querySelector('.vb-privacy').textContent=t[10];form.querySelector('button[type=submit]').textContent=t[11];
      dialog.querySelector('.vb-signed p').textContent=t[13];dialog.querySelectorAll('.vb-close').forEach(b=>b.textContent=t[12]);
      const country=form.elements.country;country.options[0].textContent=t[5];for(let i=1;i<country.options.length;i++)country.options[i].textContent=countryLabel(country.options[i].value);
      for(let i=0;i<form.elements.phrase.options.length;i++)form.elements.phrase.options[i].textContent=phraseText(i);
    }
    function render(){
      if(!dialog)return;const list=dialog.querySelector('.vb-list');list.replaceChildren();
      if(!loaded){const li=document.createElement('li');li.className='vb-empty';li.textContent=loading?ui()[14]:ui()[15];list.append(li)}
      else if(!entries.length){const li=document.createElement('li');li.className='vb-empty';li.textContent=ui()[16];list.append(li)}
      for(const e of entries.slice(0,40)){
        const li=document.createElement('li'),who=document.createElement('strong'),line=document.createElement('q'),meta=document.createElement('small');
        who.textContent=`${e.name} · ${countryLabel(e.country)}`;line.textContent=phraseText(e.phraseIndex);meta.textContent=[e.book,e.date].filter(Boolean).join(' · ');li.append(who,line,meta);list.append(li);
      }
      const done=signedToday();dialog.querySelector('.vb-form').classList.toggle('hidden',done);dialog.querySelector('.vb-signed').classList.toggle('hidden',!done);
    }
    function openBook(requestedLocale){
      locale=normalizedLocale(requestedLocale||language());if(!dialog)build();localize();open=true;dialog.classList.remove('hidden');onOpen();render();
      refresh().then(render,render);
      setTimeout(()=>{const first=signedToday()?dialog.querySelector('.vb-signed button'):dialog.querySelector('input[name=name]');first?.focus()},50);
    }
    function close(){if(!open)return;open=false;dialog.classList.add('hidden');onClose()}
    return {open:openBook,close,refresh,sign,onChange(fn){listeners.push(fn)},get entries(){return entries.slice()},get loaded(){return loaded},get isOpen(){return open},PHRASES,COUNTRIES,countryName};
  };
})();
