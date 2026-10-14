Warning: truncated output (original token count: 139851)
Total output lines: 2483

(()=>{
    'use strict';
    const $=s=>document.querySelector(s), clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
    // Books read aloud inside the library (audiobook-player.js); the Listen button follows what is playing, and
    // the recording follows the library's own volume and mute settings.
    const audiobooks=window.createAudiobookPlayer?.({analytics:window.libraryAnalytics,notice:text=>showNotice(text,5),onChange:()=>{const book=selected?.userData?.book,listen=$('#listenBook');if(book&&listen&&audiobooks?.available(book))listen.textContent=audiobooks.label(book);if(book)refreshListenAction(book)}})||null;
    if(audiobooks)setInterval(()=>audiobooks.setVolume(muted?0:clamp(soundLevel/.13,0,1)),400);
    let lastListenable=null;
    // A book with a recording shows Listen beside Open book as soon as it is picked up, so it can be heard without opening it.
    function refreshListenAction(book){const button=$('#listenAction');if(!button)return;const on=!!(book&&audiobooks?.available(book));button.classList.toggle('hidden',!on);if(on){lastListenable=book;const full=audiobooks.label(book);button.textContent=full.startsWith('Listen')?'Listen':full.startsWith('Pause')?'Pause':'Resume';button.title=full}}
    const ui={veil:$('#veil'),enter:$('#enter'),reticle:$('#reticle'),prompt:$('#prompt'),notice:$('#notice'),status:$('#status'),time:$('#timeLabel'),weather:$('#weatherLabel'),mute:$('#mute'),actions:$('#bookActions'),reader:$('#reader'),journal:$('#journal'),pause:$('#pause')};
    const touchMode=matchMedia('(hover:none) and (pointer:coarse)').matches||navigator.maxTouchPoints>0;let touchMoveX=0,touchMoveY=0,touchSprint=false;
    if(!window.THREE){ui.veil.querySelector('.crest').innerHTML='<h1>THE DOORS REMAIN CLOSED</h1><p>The library could not load its 3D engine. Check your connection and try again.</p>';return;}

    function loadSavedProgress(id){try{const raw=localStorage.getItem('athenaeum-progress-'+id);if(!raw)return 0;const parsed=JSON.parse(raw);if(parsed&&typeof parsed==='object'&&typeof parsed.p==='number'&&typeof parsed.n==='number'&&parsed.n>1)return parsed.p;return 0}catch(e){return 0}}
    const books=[
      [1342,'Pride and Prejudice','Jane Austen','Society',100],[84,'Frankenstein','Mary Shelley','Gothic',100],[2701,'Moby-Dick','Herman Melville','Sea',100],[11,"Alice’s Adventures in Wonderland",'Lewis Carroll','Wonder',100],[1661,'The Adventures of Sherlock Holmes','Arthur Conan Doyle','Mystery',100],[98,'A Tale of Two Cities','Charles Dickens','History',90],[174,'The Picture of Dorian Gray','Oscar Wilde','Gothic',95],[345,'Dracula','Bram Stoker','Gothic',100],[5200,'Metamorphosis','Franz Kafka','Strange',90],[1232,'The Prince','Niccolò Machiavelli','Philosophy',80],
      [1952,'The Yellow Wallpaper','Charlotte Perkins Gilman','Gothic',70],[1400,'Great Expectations','Charles Dickens','Society',90],[4300,'Ulysses','James Joyce','Modern',95],[1080,'A Modest Proposal','Jonathan Swift','Satire',75],[46,'A Christmas Carol','Charles Dickens','Ghosts',90],[768,'Wuthering Heights','Emily Brontë','Gothic',95],[2554,'Crime and Punishment','Fyodor Dostoyevsky','Conscience',95],[219,'Heart of Darkness','Joseph Conrad','Journey',85],[16328,'Beowulf','Anonymous','Legend',70],[6130,'The Iliad','Homer','Epic',85],
      [19942,'Candide','Voltaire','Satire',75],[55,'The Wonderful Wizard of Oz','L. Frank Baum','Wonder',80],[244,'A Study in Scarlet','Arthur Conan Doyle','Mystery',80],[514,'Little Women','Louisa May Alcott','Society',90],[1260,'Jane Eyre','Charlotte Brontë','Gothic',95],[2097,'The Sign of the Four','Arthur Conan Doyle','Mystery',70],[1727,'The Odyssey','Homer','Epic',90],[27827,'The Kama Sutra of Vatsyayana','Vatsyayana','Customs',65],[5740,'Tractatus Logico-Philosophicus','Ludwig Wittgenstein','Philosophy',55],[1064,'The Masque of the Red Death','Edgar Allan Poe','Gothic',65],
      [145,'Middlemarch','George Eliot','Society',80],[35,'The Time Machine','H. G. Wells','Speculative',90],[5230,'The Invisible Man','H. G. Wells','Speculative',85],[236,'The Jungle Book','Rudyard Kipling','Adventure',85],[3296,'The Confessions of St. Augustine','Saint Augustine','Memory',55],[1524,'Hamlet','William Shakespeare','Drama',95],[10002,'The House on the Borderland','William Hope Hodgson','Uncanny',25],[389,'The Great God Pan','Arthur Machen','Uncanny',25],[1695,'The Man Who Was Thursday','G. K. Chesterton','Strange',30],[1934,'Songs of Innocence and of Experience','William Blake','Poetry',35],[2005,'Piccadilly Jim','P. G. Wodehouse','Comedy',25],[10897,'The Wendigo','Algernon Blackwood','Uncanny',20],[1144,'In the Cage','Henry James','Society',20],[204,'The Innocence of Father Brown','G. K. Chesterton','Mystery',30],[1154,'The Voyages of Doctor Dolittle','Hugh Lofting','Adventure',30],[72,'Thuvia, Maid of Mars','Edgar Rice Burroughs','Adventure',15],[965,'The Black Arrow','Robert Louis Stevenson','Adventure',35],[215,'The Call of the Wild','Jack London','Adventure',70],
      [43,'Strange Case of Dr Jekyll and Mr Hyde','Robert Louis Stevenson','Gothic',95],[74,'The Adventures of Tom Sawyer','Mark Twain','Adventure',90],[76,'Adventures of Huckleberry Finn','Mark Twain','Adventure',95],[120,'Treasure Island','Robert Louis Stevenson','Adventure',95],[164,'Twenty Thousand Leagues under the Sea','Jules Verne','Adventure',90],
      [161,'Sense and Sensibility','Jane Austen','Society',95],[158,'Emma','Jane Austen','Society',95],[105,'Persuasion','Jane Austen','Society',90],[141,'Mansfield Park','Jane Austen','Society',90],[730,'Oliver Twist','Charles Dickens','Society',90],
      [1184,'The Count of Monte Cristo','Alexandre Dumas','Adventure',95],[2600,'War and Peace','Leo Tolstoy','History',100],[1399,'Anna Karenina','Leo Tolstoy','Society',95],[996,'Don Quixote','Miguel de Cervantes','Adventure',100],[28054,'The Brothers Karamazov','Fyodor Dostoyevsky','Conscience',95],
      [2500,'Siddhartha','Hermann Hesse','Philosophy',85],[1322,'Leaves of Grass','Walt Whitman','Poetry',90],[2148,'The Works of Edgar Allan Poe — Volume 2','Edgar Allan Poe','Gothic',75],[3207,'Leviathan','Thomas Hobbes','Philosophy',80],[1497,'The Republic','Plato','Philosophy',90],
      [61,'The Communist Manifesto','Karl Marx and Friedrich Engels','Contested',90],[160,'The Awakening and Selected Short Stories','Kate Chopin','Contested',85],[153,'Jude the Obscure','Thomas Hardy','Contested',85],[33,'The Scarlet Letter','Nathaniel Hawthorne','Contested',90],[140,'The Jungle','Upton Sinclair','Contested',90],
      [408,'The Souls of Black Folk','W. E. B. Du Bois','Contested',90],[203,"Uncle Tom’s Cabin",'Harriet Beecher Stowe','Contested',90],[1998,'Thus Spake Zarathustra','Friedrich Nietzsche','Contested',85],[3420,'A Vindication of the Rights of Woman','Mary Wollstonecraft','Contested',90],[25305,'Memoirs of Fanny Hill','John Cleland','Contested',70],
      [16, "Peter Pan", "J. M. Barrie", "Wonder", 65],
      [23, "Narrative of the Life of Frederick Douglass, an American Slave", "Frederick Douglass", "Memory", 65],
      [36, "The War of the Worlds", "H. G. Wells", "Speculative", 65],
      [41, "The Legend of Sleepy Hollow", "Washington Irving", "Ghosts", 65],
      [45, "Anne of Green Gables", "L. M. Montgomery", "Society", 65],
      [62, "A Princess of Mars", "Edgar Rice Burroughs", "Adventure", 65],
      [73, "The Red Badge of Courage: An Episode of the American Civil War", "Stephen Crane", "History", 65],
      [82, "Ivanhoe: A Romance", "Walter Scott", "Adventure", 65],
      [86, "A Connecticut Yankee in King Arthur's Court", "Mark Twain", "Comedy", 65],
      [90, "The Son of Tarzan", "Edgar Rice Burroughs", "Adventure", 65],
      [103, "Around the World in Eighty Days", "Jules Verne", "Journey", 65],
      [107, "Far from the Madding Crowd", "Thomas Hardy", "Society", 65],
      [113, "The Secret Garden", "Frances Hodgson Burnett", "Wonder", 65],
      [125, "A Girl of the Limberlost", "Gene Stratton-Porter", "Society", 65],
      [135, "Les Misérables", "Victor Hugo", "Society", 65],
      [151, "The Rime of the Ancient Mariner", "Samuel Taylor Coleridge", "Poetry", 65],
      [163, "Flower Fables", "Louisa May Alcott", "Wonder", 65],
      [171, "Charlotte Temple", "Mrs. Rowson", "Society", 65],
      [209, "The Turn of the Screw", "Henry James", "Ghosts", 65],
      [202, "My Bondage and My Freedom", "Frederick Douglass", "Memory", 65],
      [205, "Walden, and On The Duty Of Civil Disobedience", "Henry David Thoreau", "Philosophy", 65],
      [208, "Daisy Miller: A Study", "Henry James", "Society", 65],
      [213, "The Man from Snowy River", "A. B. Paterson", "Poetry", 65],
      [221, "The Return of Sherlock Holmes", "Arthur Conan Doyle", "Mystery", 65],
      [226, "Cicero's Orations", "Marcus Tullius Cicero", "Philosophy", 65],
      [230, "The Bucolics and Eclogues", "Virgil", "Poetry", 65],
      [234, "Child Christopher and Goldilind the Fair", "William Morris", "Legend", 65],
      [245, "Life on the Mississippi", "Mark Twain", "Memory", 65],
      [268, "The Octopus : A Story of California", "Frank Norris", "Society", 65],
      [285, "The Lost Continent", "C. J. Cutcliffe Hyne", "Adventure", 65],
      [910, "White Fang", "Jack London", "Adventure", 65],
      [1155, "The Secret Adversary", "Agatha Christie", "Mystery", 65],
      [308, "Three Men in a Boat (To Say Nothing of the Dog)", "Jerome K. Jerome", "Comedy", 65],
      [317, "The Culprit Fay, and Other Poems", "Joseph Rodman Drake", "Poetry", 65],
      [332, "The Burial of the Guns", "Thomas Nelson Page", "History", 65],
      [349, "The Harvester", "Gene Stratton-Porter", "Society", 65],
      [360, "What is Property? An Inquiry into the Principle of Right and of Government", "P.-J. Proudhon", "Philosophy", 65],
      [394, "Cranford", "Elizabeth Cleghorn Gaskell", "Society", 65],
      [421, "Kidnapped", "Robert Louis Stevenson", "Adventure", 65],
      [436, "The Master Key", "L. Frank Baum", "Speculative", 65],
      [451, "The Shadow Line: A Confession", "Joseph Conrad", "Sea", 65],
      [470, "Heretics", "G. K. Chesterton", "Philosophy", 65],
      [521, "The Life and Adventures of Robinson Crusoe", "Daniel Defoe", "Adventure", 65],
      [534, "An Inland Voyage", "Robert Louis Stevenson", "Journey", 65],
      [543, "Main Street", "Sinclair Lewis", "Society", 65],
      [599, "Vanity Fair", "William Makepeace Thackeray", "Society", 65],
      [605, "Pellucidar", "Edgar Rice Burroughs", "Adventure", 65],
      [1137, "A Lover's Complaint", "William Shakespeare", "Poetry", 65],
      [863, "The Mysterious Affair at Styles", "Agatha Christie", "Mystery", 65],
      [1206, "The Flying U Ranch", "B. M. Bower", "Adventure", 65],
      [12352,'Iola Leroy; Or, Shadows Uplifted','Frances Ellen Watkins Harper','Returning Voices',18],
      [11666,'The Conjure Woman','Charles W. Chesnutt','Returning Voices',17],
      [11214,'The Garies and Their Friends','Frank J. Webb','Returning Voices',16],
      [15265,'The Quest of the Silver Fleece','W. E. B. Du Bois','Returning Voices',16],
      [32,'Herland','Charlotte Perkins Gilman','Returning Voices',15],
      [11228,'The Marrow of Tradition','Charles W. Chesnutt','Returning Voices',14],
      [241,'Clotelle; Or, The Colored Heroine','William Wells Brown','Returning Voices',13],
      [15454,'Imperium in Imperio','Sutton E. Griggs','Returning Voices',12],
      [17854,'The Sport of the Gods','Paul Laurence Dunbar','Returning Voices',11],
      [472,'The House Behind the Cedars','Charles W. Chesnutt','Returning Voices',10],
      [14107,'The Lost Stradivarius','John Meade Falkner','Fading Supernatural',9],
      [10052,'The Open Door, and the Portrait','Margaret Oliphant','Fading Supernatural',9],
      [14471,'The Empty House and Other Ghost Stories','Algernon Blackwood','Fading Supernatural',8],
      [25016,'The House of Souls','Arthur Machen','Fading Supernatural',8],
      [10662,'The Night Land','William Hope Hodgson','Fading Speculative',7],
      [11229,'The Purple Cloud','M. P. Shiel','Fading Speculative',7],
      [10542,'The Boats of the Glen Carrig','William Hope Hodgson','Fading Adventure',6],
      [11045,'The Ghost Ship','Richard Middleton','Fading Supernatural',6],
      [35517,'The Three Impostors','Arthur Machen','Fading Supernatural',5],
      [5164,'The Beetle: A Mystery','Richard Marsh','Fading Supernatural',5],
      [51568,'Some Haunted Houses of England & Wales','Elliott O’Donnell','Almost Unread',4],
      [64930,'The Goddess: A Demon','Richard Marsh','Almost Unread',3],
      [79291,'The Mysterious Locket','Ruth Lynn','Almost Unread',3],
      [23608,'The Day of Wrath','Mór Jókai','Almost Unread',3],
      [23515,'The Spectre in the Cart','Thomas Nelson Page','Almost Unread',2],
      [68753,'Forgotten Danger','Joseph Samachson','Almost Unread',2],
      [64031,'Is That You Xeluchli?','Dick Hetschel','Almost Unread',1],
      [29272,'No Hiding Place','Richard Rein Smith','Almost Unread',1],
      [14275,'The Necromancers','Robert Hugh Benson','Almost Unread',2],
      [14317,'The Sorcery Club','Elliott O’Donnell','Almost Unread',2],
      [1302,'The Enemies of Books','William Blades','Archive',5],
      [26378,'The Care of Books','John Willis Clark','Archive',5],
      [22136,'The Book-Hunter','John Hill Burton','Archive',4],
      [28540,'Bibliomania; or Book-Madness','Thomas Frognall Dibdin','Archive',4],
      [36764,'In the Track of the Bookworm','Irving Browne','Archive',3],
      [22608,'A Book for All Readers','Ainsworth Rand Spofford','Archive',3],
      [19553,'The Private Diary of Dr. John Dee and the Catalog of His Library','John Dee','Archive',2],
      [443,'The Love Affairs of a Bibliomaniac','Eugene Field','Archive',2],
      [1615,'Old English Libraries','Ernest Albert Savage','Archive',2],
      [28174,'The Private Library','Arthur Lee Humphreys','Archive',1],
    [1513,'Romeo and Juliet','William Shakespeare','Drama',65],
    [3268,'The Mysteries of Udolpho','Ann Radcliffe','Gothic',65],
    [601,'The Monk','M. G. Lewis','Gothic',65],
    [2680,'Meditations','Marcus Aurelius','Philosophy',65],
    [3011,'The Lady of the Lake','Walter Scott','Poetry',65],
    [921,'De Profundis','Oscar Wilde','Memory',65],
    [2825,'Undine','Friedrich de la Motte Fouqué','Wonder',65],
    [8492,'The King in Yellow','Robert W. Chambers','Uncanny',65],
    [2852,'The Hound of the Baskervilles','Arthur Conan Doyle','Mystery',65],
    [834,'The Memoirs of Sherlock Holmes','Arthur Conan Doyle','Mystery',65],
    [223,'The Wisdom of Father Brown','G. K. Chesterton','Mystery',65],
    [5197,'My Life','Richard Wagner','Memory',65],
    [20203,'Autobiography of Benjamin Franklin','Benjamin Franklin','Memory',65],
    [175,'The Phantom of the Opera','Gaston Leroux','Gothic',65],
    [2641,'A Room with a View','E. M. Forster','Society',65],
    [17460,'Lorna Doone','R. D. Blackmore','Adventure',65],
    [2002,'Sonnets from the Portuguese','Elizabeth Barrett Browning','Poetry',65],
    [14244,'The Romance of Tristan and Iseult','Joseph Bédier','Legend',65],
    [36462,'King Arthur and the Knights of the Round Table','Thomas Malory','Legend',65],
    [69087,'The Murder of Roger Ackroyd','Agatha Christie','Mystery',65],
    [6133,'The Extraordinary Adventures of Arsène Lupin','Maurice Leblanc','Adventure',65],
    [766,'David Copperfield','Charles Dickens','Society',65],
    [1023,'Bleak House','Charles Dickens','Society',65],
    [110,'Tess of the d’Urbervilles','Thomas Hardy','Contested',65],
    [589,'Catriona','Robert Louis Stevenson','Adventure',65],
    [1013,'The First Men in the Moon','H. G. Wells','Speculative',75],
    [1633,'The Brick Moon, and Other Stories','Edward Everett Hale','Speculative',45],
    [46547,'A Voyage to the Moon','Cyrano de Bergerac','Speculative',40],
    [10430,'Trips to the Moon','Lucian of Samosata','Speculative',35],
    [10005,'A Voyage to the Moon','George Tucker','Speculative',30],
    [69338,'The Moon Maid','Edgar Rice Burroughs','Speculative',45],
    [66510,'The Moon: A Popular Treatise','Garrett Putman Serviss','Science',25],
    [62779,'The Moon Hoax','Richard Adams Locke','Speculative',35],
    [19103,'The Discovery of a World in the Moone','John Wilkins','Science',25],
    [4552,'From the Earth to the Moon','Jules Verne','Speculative',65],
    [1268,'The Mysterious Island','Jules Verne','Adventure',75],
    [18857,'A Journey to the Centre of the Earth','Jules Verne','Speculative',85],
    [46597,'In Search of the Castaways','Jules Verne','Journey',65],
    [1842,'Michael Strogoff; Or, The Courier of the Czar','Jules Verne','Adventure',65],
    [16457,'All Around the Moon','Jules Verne','Speculative',65],
    [10339,'An Antarctic Mystery','Jules Verne','Adventure',60],
    [3808,'Robur the Conqueror','Jules Verne','Speculative',60],
    [159,'The Island of Doctor Moreau','H. G. Wells','Speculative',65],
    [2147,'The Works of Edgar Allan Poe — Volume 1','Edgar Allan Poe','Gothic',65],
    [77,'The House of the Seven Gables','Nathaniel Hawthorne','Gothic',65],
    [1837,'The Prince and the Pauper','Mark Twain','Adventure',65],
    [54,'The Marvelous Land of Oz','L. Frank Baum','Wonder',65],
    [146,'A Little Princess','Frances Hodgson Burnett','Wonder',65],
    [12,'Through the Looking-Glass','Lewis Carroll','Wonder',65],
    [1600,'The Symposium','Plato','Philosophy',65],
    [132,'The Art of War','Sun Tzu','Philosophy',65],
    [1228,'On the Origin of Species','Charles Darwin','Contested',65],
    [829,'Gulliver’s Travels','Jonathan Swift','Satire',65],
    [26,'Paradise Lost','John Milton','Epic',65],
    [2591,'Grimms’ Fairy Tales','The Brothers Grimm','Wonder',65],
    [1597,'Andersen’s Fairy Tales','Hans Christian Andersen','Wonder',65],
    [1074,'The Sea-Wolf','Jack London','Sea',65],
    [2226,'Kim','Rudyard Kipling','Adventure',65],
    [2376,'Up from Slavery','Booker T. Washington','Memory',65],
    [3300,'The Wealth of Nations','Adam Smith','Philosophy',65],
    [4363,'Beyond Good and Evil','Friedrich Nietzsche','Contested',65],
    [147,'Common Sense','Thomas Paine','Contested',65],
    [2542,'A Doll’s House','Henrik Ibsen','Drama',65],
    [550,'Silas Marner','George Eliot','Society',65],
    [1257,'The Three Musketeers','Alexandre Dumas','Adventure',65],
    [65238,'The Secret of Chimneys','Agatha Christie','Mystery',65],
    [13,'The Hunting of the Snark','Lewis Carroll','Wonder',60],[651,'Phantasmagoria and Other Poems','Lewis Carroll','Wonder',35],[4763,'The Game of Logic','Lewis Carroll','Wonder',30],[29042,'A Tangled Tale','Lewis Carroll','Wonder',30],
      [139,'The Lost World','Arthur Conan Doyle','Adventure',70],[126,'The Poison Belt','Arthur Conan Doyle','Speculative',55],[439,'The Vital Message','Arthur Conan Doyle','Philosophy',30],[1638,'The New Revelation','Arthur Conan Doyle','Philosophy',25],[3155,'She','H. Rider Haggard','Adventure',55],[2166,"King Solomon's Mines",'H. Rider Haggard','Adventure',65],
      [711,'Allan Quatermain','H. Rider Haggard','Adventure',55],[5228,'Ayesha, the Return of She','H. Rider Haggard','Gothic',45],[6769,'The People of the Mist','H. Rider Haggard','Adventure',40],[1207,'Nada the Lily','H. Rider Haggard','History',45],[2769,'Cleopatra','H. Rider Haggard','History',45],[2721,'Eric Brighteyes','H. Rider Haggard','Legend',40],[5746,'The Ancient Allan','H. Rider Haggard','Adventure',35],[2841,'The Ivory Child','H. Rider Haggard','Adventure',35],[1690,'Marie: An Episode in the Life of the Late Allan Quatermain','H. Rider Haggard','History',35],
      [1951,'The Coming Race','Edward Bulwer-Lytton','Adventure',30],[1906,'Erewhon','Samuel Butler','Adventure',40]
].map((b,i)=>({id:b[0],title:b[1],author:b[2],category:b[3],fame:b[4],source:'Project Gutenberg',sourceUrl:`https://www.gutenberg.org/ebooks/${b[0]}`,licence:'Public Domain',textUrl:`https://www.gutenberg.org/cache/epub/${b[0]}/pg${b[0]}.txt`,progress:loadSavedProgress(b[0]),index:i}));
    for(const record of window.ATHENAEUM_RAILWAY_BOOKS||[])if(!books.some(b=>b.id===record.id))books.push({...record,source:'Project Gutenberg',sourceUrl:`https://www.gutenberg.org/ebooks/${record.id}`,licence:'Public Domain',textUrl:`https://www.gutenberg.org/cache/epub/${record.id}/pg${record.id}.txt`,progress:loadSavedProgress(record.id),index:books.length});
    for(const record of window.ATHENAEUM_CURIOUS_BOOKS||[])if(!books.some(b=>b.id===record.id))books.push({...record,source:'Project Gutenberg',sourceUrl:`https://www.gutenberg.org/ebooks/${record.id}`,licence:'Public Domain',textUrl:`https://www.gutenberg.org/cache/epub/${record.id}/pg${record.id}.txt`,progress:loadSavedProgress(record.id),index:books.length});
    for(const record of window.ATHENAEUM_AFTER_DARK_BOOKS||[])if(!books.some(b=>b.id===record.id))books.push({...record,source:'Project Gutenberg',sourceUrl:`https://www.gutenberg.org/ebooks/${record.id}`,licence:'Public Domain',textUrl:`https://www.gutenberg.org/cache/epub/${record.id}/pg${record.id}.txt`,progress:loadSavedProgress(record.id),index:books.length});
    const openAccessSources=window.ATHENAEUM_OPEN_ACCESS_SOURCES||{},openAccessBooks=window.ATHENAEUM_OPEN_ACCESS_BOOKS||[],bookEnrichments=window.ATHENAEUM_BOOK_ENRICHMENTS||{};
    for(const record of openAccessBooks){const source=openAccessSources[record.source]||{};books.push(Object.assign({},record,{sourceKey:record.source,source:source.name||record.source,progress:loadSavedProgress(record.id),index:books.length}))}
    // Poems from the Anthologies (scripts/anthology.mjs): the library's own binding of public-domain poems from Wikisource, for the Set Texts Room.
    books.push({id:940001,title:'Poems from the Anthologies',author:'Various',category:'Poetry',fame:40,source:'Wikisource',sourceKey:'wikisource',sourceUrl:'https://en.wikisource.org/',licence:'Public Domain',progress:loadSavedProgress(940001),index:books.length});
    const verneCatalog=window.ATHENAEUM_VERNE_BOOKS||[],knownBookIds=new Set(books.map(book=>book.id));
    for(const [id,title] of verneCatalog){if(knownBookIds.has(id))continue;books.push({id,title,author:'Jules Verne',category:'Extraordinary Voyages',fame:45,source:'Project Gutenberg',sourceUrl:`https://www.gutenberg.org/ebooks/${id}`,licence:'Public Domain',textUrl:`https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`,progress:loadSavedProgress(id),index:books.length});knownBookIds.add(id)}
    const doyleCatalog=window.ATHENAEUM_DOYLE_BOOKS||[];
    for(const [id,title] of doyleCatalog){if(knownBookIds.has(id))continue;books.push({id,title,author:'Arthur Conan Doyle',category:'The Consulting Room',fame:45,source:'Project Gutenberg',sourceUrl:`https://www.gutenberg.org/ebooks/${id}`,licence:'Public Domain',textUrl:`https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`,progress:loadSavedProgress(id),index:books.length});knownBookIds.add(id)}
    const wellsCatalog=window.ATHENAEUM_WELLS_BOOKS||[];
    for(const [id,title] of wellsCatalog){if(knownBookIds.has(id))continue;books.push({id,title,author:'H. G. Wells',category:'The Time Laboratory',fame:45,source:'Project Gutenberg',sourceUrl:`https://www.gutenberg.org/ebooks/${id}`,licence:'Public Domain',textUrl:`https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`,progress:loadSavedProgress(id),index:books.length});knownBookIds.add(id)}
    const haggardCatalog=window.ATHENAEUM_HAGGARD_BOOKS||[];
    for(const [id,title] of haggardCatalog){if(knownBookIds.has(id))continue;books.push({id,title,author:'H. Rider Haggard',category:'The Lost Kingdoms',fame:45,source:'Project Gutenberg',sourceUrl:`https://www.gutenberg.org/ebooks/${id}`,licence:'Public Domain',textUrl:`https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`,progress:loadSavedProgress(id),index:books.length});knownBookIds.add(id)}
    // New arrivals (data/new-books.js), grouped by the room they were bought for. Only books whose text has been
    // checked and bundled (data/new-books-resolved.js) are brought in; each brings its librarian's note.
    const newArrivals=(()=>{const resolved=window.ATHENAEUM_NEW_BOOKS_RESOLVED?.books||{},rooms={},words={},ROOM_LANGUAGES={spanish:'es',portuguese:'pt',chinese:'zh',french:'fr',latin:'la',italian:'it',ukrainian:'uk','irish-gaeilge':'ga'};window.ATHENAEUM_EXTRA_NOTES=window.ATHENAEUM_EXTRA_NOTES||{};
      // add() runs again when the International Wing's books arrive (data/new-books-wing.js, loaded on the way there).
      const add=list=>{for(const [,title,author,category,room,note] of list||[]){const found=resolved[ROOM_LANGUAGES[room]?`${title} [${ROOM_LANGUAGES[room]}]`:title];if(!found?.id)continue;const id=found.id;
        let book=books.find(b=>b.id===id);if(!book){book={id,title,author,category,fame:30,source:'Project Gutenberg',sourceUrl:`https://www.gutenberg.org/ebooks/${id}`,licence:'Public Domain',textUrl:`https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`,progress:loadSavedProgress(id),index:books.length,newArrival:true};if(found.source==='wikisource')Object.assign(book,{source:'Wikisource',sourceUrl:found.page,textUrl:null});books.push(book);knownBookIds.add(id)}
        if(ROOM_LANGUAGES[room])book.language=ROOM_LANGUAGES[room];if(note&&!window.ATHENAEUM_EXTRA_NOTES[id])window.ATHENAEUM_EXTRA_NOTES[id]=note;if(found.words)words[id]=found.words;(rooms[room]||(rooms[room]=[])).push(book);Object.assign(book,bookEnrichments[book.id]||{})}};
      add(window.ATHENAEUM_NEW_BOOKS);add(window.ATHENAEUM_NEW_BOOKS_WING);
      return {rooms,words,add,list:room=>rooms[room]||[]}})();
    for(const book of books)Object.assign(book,bookEnrichments[book.id]||{});
    // Links from the book pages (book/*.html, scripts/book-pages.mjs): /?book=ID opens that book in the reader as soon
    // as the reader steps inside, instead of the first-visit tour.
    // /?room=mars (or evening-room, boathouse, consulting-room…) takes the reader straight to that room instead.
    const linkedRoom=(()=>{try{return (new URLSearchParams(location.search).get('room')||'').toLowerCase().replace(/[^a-z-]/g,'')||null}catch(e){return null}})();
    const linkedBook=(()=>{try{const id=Number(new URLSearchParams(location.search).get('book'));return id?books.find(b=>b.id===id)||null:null}catch(e){return null}})();
    const offlineExtracts={
      1342:`It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.\n\nHowever little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered as the rightful property of some one or other of their daughters.\n\n“My dear Mr. Bennet,” said his lady to him one day, “have you heard that Netherfield Park is let at last?”`,
      84:`You will rejoice to hear that no disaster has accompanied the commencement of an enterprise which you have regarded with such evil forebodings. I arrived here yesterday, and my first task is to assure my dear sister of my welfare and increasing confidence in the success of my undertaking.\n\nI am already far north of London, and as I walk in the streets of Petersburgh, I feel a cold northern breeze play upon my cheeks, which braces my nerves and fills me with delight.`,
      2701:`Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.\n\nIt is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; then, I account it high time to get to sea as soon as I can.`,
      11:`Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, “and what is the use of a book,” thought Alice “without pictures or conversations?”\n\nSo she was considering in her own mind whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.`,
      1661:`To Sherlock Holmes she is always the woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex.\n\nIt was not that he felt any emotion akin to love for Irene Adler. All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind.`,
      98:`It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair.`,
      174:`The studio was filled with the rich odour of roses, and when the light summer wind stirred amidst the trees of the garden, there came through the open door the heavy scent of the lilac, or the more delicate perfume of the pink-flowering thorn.`,
      345:`3 May. Bistritz.—Left Munich at 8:35 P.M., on 1st May, arriving at Vienna early next morning; should have arrived at 6:46, but train was an hour late. Buda-Pesth seems a wonderful place, from the glimpse which I got of it from the train and the little I could walk through the streets.`,
      5200:`One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.`,
      46:`Marley was dead: to begin with. There is no doubt whatever about that. The register of his burial was signed by the clergyman, the clerk, the undertaker, and the chief mourner. Scrooge signed it. And Scrooge’s name was good upon ’Change, for anything he chose to put his hand to.`,
      768:`1801.—I have just returned from a visit to my landlord—the solitary neighbour that I shall be troubled with. This is certainly a beautiful country! In all England, I do not believe that I could have fixed on a situation so completely removed from the stir of society.`,
      2554:`On an exceptionally hot evening early in July a young man came out of the garret in which he lodged and in S. Place and walked slowly, almost hesitatingly, towards K. bridge. He had successfully avoided meeting his landlady on the staircase.`,
      1260:`There was no possibility of taking a walk that day. We had been wandering, indeed, in the leafless shrubbery an hour in the morning; but since dinner the cold winter wind had brought with it clouds so sombre, and a rain so penetrating, that further out-door exercise was now out of the question.`,
      35:`The Time Traveller—for so it will be convenient to speak of him—was expounding a recondite matter to us. His grey eyes shone and twinkled, and his usually pale face was flushed and animated. The fire burned brightly, and the soft radiance of the incandescent lights in the lilies of silver caught the bubbles that flashed and passed in our glasses.`,
      236:`It was seven o’clock of a very warm evening in the Seeonee hills when Father Wolf woke up from his day’s rest, scratched himself, yawned, and spread out his paws one after the other to get rid of the sleepy feeling in their tips.`,
      215:`Buck did not read the newspapers, or he would have known that trouble was brewing, not alone for himself, but for every tide-water dog, strong of muscle and with warm, long hair, from Puget Sound to San Diego.`
    };
    function offlineEdition(book){const excerpt=offlineExtracts[book.id],source=book.source||'the source archive';return excerpt?`${book.title}\nby ${book.author}\n\nSelected opening from the public-domain edition\n\n${excerpt}`:`${book.title}\nby ${book.author}\n\nThe complete ${source} edition could not be fetched just now. The catalogue record, provenance and your reading place are still kept.\n\nCategory: ${book.category}`}
    function cleanEdition(text){const start=text.search(/\*\*\* START OF (THE|THIS) (PROJECT GUTENBERG EBOOK|WIKISOURCE TEXT)/i);if(start>=0)text=text.slice(text.indexOf('\n',start)+1);const end=text.search(/\*\*\* END OF (THE|THIS) (PROJECT GUTENBERG EBOOK|WIKISOURCE TEXT)/i);if(end>1000)text=text.slice(0,end);return text.replace(/\r/g,'').replace(/\n{4,}/g,'\n\n').trim()}
    function loadLocalEdition(book){window.ATHENAEUM_LOCAL_TEXTS=window.ATHENAEUM_LOCAL_TEXTS||{};const cached=window.ATHENAEUM_LOCAL_TEXTS[book.id];if(cached)return Promise.resolve(cached);return new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=`texts/local/pg${book.id}.js`;script.onload=()=>{script.remove();const text=window.ATHENAEUM_LOCAL_TEXTS[book.id];text?resolve(text):reject(new Error('Local edition was empty'))};script.onerror=()=>{script.remove();reject(new Error('Local edition could not be loaded'))};document.head.appendChild(script)})}

    // A lamp added anywhere (a room built on approach, a door, a prop) is noticed at once and the light budget
    // runs before the next frame, so the count of lamps never rises above LIGHT_BUDGET even for a frame: one
    // frame with more lamps would compile every shader in view a second time.
    let lampsAdded=false;{const add=THREE.Object3D.prototype.add,holdsLight=object=>{const stack=[object];while(stack.length){const next=stack.pop();if(next?.isLight)return true;if(next?.children?.length)stack.push(...next.children)}return false};THREE.Object3D.prototype.add=function(...objects){if(!lampsAdded&&objects.some(holdsLight))lampsAdded=true;return add.apply(this,objects)}}
    const scene=new THREE.Scene();scene.background=new THREE.Color(0x211b16);scene.fog=new THREE.FogExp2(0x211a14,.013);
    const camera=new THREE.PerspectiveCamera(67,innerWidth/innerHeight,.08,130);camera.position.set(0,1.72,24);scene.add(camera);
    // Tablets and phones are only treated as low-power when their hardware is genuinely weak; modern ones
    // render sharply (up to 1.5x, since their screens pack 2-3 pixels per CSS pixel) and the adaptive loop
    // below steps resolution and effects down if frames run slow.
    const weakHardware=(navigator.deviceMemory&&navigator.deviceMemory<=2)||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=2),lowPowerDevice=weakHardware||(!touchMode&&((navigator.deviceMemory&&navigator.deviceMemory<=4)||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=4))),pixelRatioCap=touchMode?(lowPowerDevice?1:1.5):lowPowerDevice?.9:1,adaptiveQualityFloor=touchMode?.5:lowPowerDevice?.72:.72;
    let renderer,adaptiveRenderScale=1,adaptiveSampleStarted=performance.now(),adaptiveSampleFrames=0,adaptiveSlowFrames=0,adaptiveFastFrames=0,adaptiveLastChange=0;
    function applyAdaptiveRenderScale(){renderer.setPixelRatio(Math.min(devicePixelRatio,pixelRatioCap*adaptiveRenderScale))}
    // Desktop machines render through the post pipeline, which does its own multisampling, so the
    // default framebuffer skips it. Touch devices keep the simpler direct path.
    const VISUAL_TIERS=['off','low','medium','high'],automaticTier=lowPowerDevice?'low':touchMode?'medium':'high',savedTier=localStorage.getItem('athenaeum-visual-quality'),requestedTier=[new URLSearchParams(location.search).get('quality'),savedTier].find(tier=>VISUAL_TIERS.includes(tier))||null,visualTier=!window.createVisualQuality?'off':requestedTier||automaticTier;
    try{renderer=new THREE.WebGLRenderer({antialias:!window.WebGL2RenderingContext,powerPreference:'high-performance'})}catch(error){window.__ATHENAEUM_BOOT_FAILED__?.(error);return}renderer.setSize(innerWidth,innerHeight);applyAdaptiveRenderScale();renderer.shadowMap.enabled=false;renderer.debug.checkShaderErrors=new URLSearchParams(location.search).has('debug');renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.95;renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','Explorable library');renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();window.__ATHENAEUM_BOOT_FAILED__?.(new Error('The WebGL context was lost'))},{once:true});document.body.prepend(renderer.domElement);
    let visualTierPinned=!!requestedTier;const visual=window.createVisualQuality?.({THREE,renderer,scene,camera,initialTier:visualTier,reducedMotion:()=>reducedMotion})||null;
    const clock=new THREE.Clock(), raycaster=new THREE.Raycaster();raycaster.far=6.5;
    const seats=[],colliders=[], interactables=[], coverQueue=[],pullSequence=[];
    // A title has one available physical volume, even when several room builders offer it.
    // Keep the dormant placements so a lazy room can be freed and rebuilt safely. Only its
    // chosen volume is visible or pickable; carrying/placing it keeps that volume in charge.
    function createSingleCopyLibrary({objects,scene,held=()=>null,priority=()=>0}){
      const states=new WeakMap(),ids=new Map(),winners=new Map();
      const normal=text=>String(text||'').normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim();
      function key(book){const id=String(book.id);if(ids.has(id))return ids.get(id);const title=normal(book.title),author=normal(book.author),value=title&&author?`${normal(book.language||'en')}|${author}|${title}`:`id:${id}`;ids.set(id,value);return value}
      function attached(object,extraRoot){let root=object;for(;;){if(root===extraRoot)return true;if(!root.parent)return root===scene;root=root.parent}}
      function sync(extraRoot=null){
        winners.clear();const candidates=[];
        for(const object of objects){const data=object.userData;if(data?.type!=='book'||!data.book?.id)continue;
          let state=states.get(object);if(!state){state={wanted:object.visible!==false,suppressed:false};states.set(object,state);
            // Room scripts can still reveal/hide a secret, but cannot reveal a second copy.
            Object.defineProperty(object,'visible',{configurable:true,enumerable:true,get:()=>state.wanted&&!state.suppressed,set:value=>{state.wanted=!!value}})}
          state.suppressed=true;if(!attached(object,extraRoot))continue;
          const identity=key(data.book),score=object===held()?10000:data.singleCopyMoved?1000:priority(object),current=winners.get(identity);
          candidates.push(object);if(!current||score>current.score)winners.set(identity,{object,score});
        }
        for(const {object} of winners.values())states.get(object).suppressed=false;
        // Progress labels belong to their displayed volume, not its dormant placements.
        for(const object of candidates)for(const extra of object.userData.continueExtras||[])extra.visible=object.visible;
      }
      function find(book,refresh=true){if(refresh)sync();return winners.get(key(book))?.object||null}
      function available(){sync();return [...winners.values()].map(entry=>entry.object).filter(object=>{for(let n=object;n;n=n.parent)if(!n.visible)return false;return true})}
      return {sync,find,available};
    }
    const singleCopyLibrary=createSingleCopyLibrary({objects:interactables,scene,held:()=>selected,priority:object=>{
      const data=object.userData;if(data.secret||data.secretId||data.underBoard||data.underStair)return 100;
      if(data.customBinding)return 90;if(data.returnSlip)return 25;if(data.machineTray)return 80;if(data.halloween)return 60;if(data.expeditionCopy||data.subterraneanCopy)return 50;if(data.continueExtras)return data.book.secretBindingTexture?95:40;if(data.readingStand)return 30;
      if(data.singleCopyPriority===undefined){object.getWorldPosition(tmpWorldPosition);data.singleCopyPriority=Math.abs(tmpWorldPosition.x)>20||Math.abs(tmpWorldPosition.z)>32?20:10}
      return data.singleCopyPriority;
    }});
    const tmpWorldPosition=new THREE.Vector3(),tmpWorldPosition2=new THREE.Vector3(),tmpVector=new THREE.Vector3(),tmpVector2=new THREE.Vector3(),tmpQuaternion=new THREE.Quaternion(),tmpQuaternion2=new THREE.Quaternion(),tmpEuler=new THREE.Euler(),screenCentre=new THREE.Vector2(0,0);
    const SPATIAL_CELL_SIZE=12,colliderCells=new Map();
    const spatialKey=(x,z)=>`${Math.floor(x/SPATIAL_CELL_SIZE)},${Math.floor(z/SPATIAL_CELL_SIZE)}`;
    function indexCollider(c){const minCellX=Math.floor(c.minX/SPATIAL_CELL_SIZE),maxCellX=Math.floor(c.maxX/SPATIAL_CELL_SIZE),minCellZ=Math.floor(c.minZ/SPATIAL_CELL_SIZE),maxCellZ=Math.floor(c.maxZ/SPATIAL_CELL_SIZE);for(let cx=minCellX;cx<=maxCellX;cx++)for(let cz=minCellZ;cz<=maxCellZ;cz++){const key=`${cx},${cz}`;if(!colliderCells.has(key))colliderCells.set(key,[]);colliderCells.get(key).push(c)}}
    let started=false,galleryReaderY=5/* the reader's height as they last moved: under the gallery, the floor is theirs */,locked=false,hadPointerLock=false,dragging=false,lastPointerX=0,lastPointerY=0,muted=false,settingsOpen=false,settingsReturnToPause=false,soundLevel=clamp(Number(localStorage.getItem('athenaeum-sound-level')||13)/100,0,1),reducedMotion=localStorage.getItem('athenaeum-reduced-motion')==='1',lowBandwidth=localStorage.getItem('athenaeum-low-bandwidth')==='1',highContrast=localStorage.getItem('athenaeum-high-contrast')==='1',largeText=localStorage.getItem('athenaeum-large-text')==='1',mouseLook=localStorage.getItem('athenaeum-mouse-arrow')!=='1',selected=null,carryingBook=false,focus=null,noticeTimer=0,weather='RAIN',dayPhase=.68,secretOpen=0,portraitOpen=0,portraitTargetOpen=0,tunnelOpen=0,finalDoorOpen=0,leverTime=0,readerSize=16,machineBook=null,resizeTimer=0,finalDoor=null,finalDoorCollider=null,catGuideTarget=null,catGuideLabel='',rooftopVisited=localStorage.getItem('athenaeum-rooftop-visited')==='1',machinePulls=Number(localStorage.getItem('athenaeum-machine-pulls')||0),lastReadCategory='',lastDiscoveryAt=performance.now(),lastHintAt=0,nextAmbientAt=performance.now()+45000+Math.random()*35000,midnightRoomOpen=false,rabbitActive=false,rabbitWaypoint=0,insectTime=0,insectQueued=false,whiteVolumeLevel=0,rockingUntil=0,readerAsideTimer=null,readerOpenedAt=0,cheshireCat=null,cheshireNextAt=0,nightShelfIndex=0,nightBookIndex=0,nextTrainRumbleAt=0,trainPass=null,trainZoneWasActive='';
    document.body.classList.toggle('reduced-motion',reducedMotion);document.body.classList.toggle('high-contrast',highContrast);document.body.classList.toggle('large-text',largeText);
    const keys={},player={pos:new THREE.Vector3(0,0,24),vel:new THREE.Vector3(),yaw:0,pitch:0,radius:.42};
    const MYSTERIES=[['folded-note','The folded note'],['book-under-table','A misplaced volume'],['book-mantel','The firekeeper’s book'],['book-balcony','A book above the rain'],['roof-book','The weatherbound volume'],['west-shelf','The false western shelf'],['portrait-passage','The room behind the portrait'],['unlabelled-orb','The nameless object'],['tunnel','The breathing wall'],['below-catalogue','The door beneath the catalogue'],['redacted-catalogue','The redacted catalogue']],SECRET_TOTAL=MYSTERIES.length;
    const lastSafePosition=player.pos.clone();
    let discovered=new Set();try{const saved=JSON.parse(localStorage.getItem('athenaeum-mysteries')||'[]');if(Array.isArray(saved))discovered=new Set(saved)}catch(ignore){}
    let collection=new Set();try{const saved=JSON.parse(localStorage.getItem('athenaeum-collection')||'[]');if(Array.isArray(saved))collection=new Set(saved)}catch(ignore){}
    const ROOM_RECORDS={
      gothic:{title:'The last candle',text:'This room was sealed after every witness to the final vigil described a different person in the empty chair. The night porter kept the candle burning so the stories could disagree in peace.'},
      inquiry:{title:'The case without a culprit',text:'The investigator solved the disappearance, then hid the answer. The missing reader had simply walked into a book and wanted no one to fetch her back.'},
      chart:{title:'The chart of a vanished shore',text:'Every map here points to an island erased by the sea. Its books were kept out of the public catalogue because the island appears again whenever someone reads its name aloud.'},
      drawing:{title:'The unfinished invitation',text:'A guest was struck from every invitation, yet her cup was always laid. This room preserves the conversation that continued after everyone agreed she had never existed.'},
      study:{title:'The argument under glass',text:'Two scholars reached opposite conclusions from the same page. Rather than choose one, the librarian shut their debate in this room and left both chairs facing the evidence.'},
      garden:{title:'The gardener’s impossible seed',text:'The gardener planted a word clipped from a poem. By morning it had roots. The room was hidden before anyone could decide whether the new flowers belonged in a catalogue or a garden.'},
      verne:{title:'The engineer’s impossible itinerary',text:'The room was planned for journeys no railway could yet make: under the sea, through the earth, around the world, and upward toward the moon. Its architect left the final destination blank.'},
      haggard:{title:'The country omitted from every atlas',text:'An explorer returned with a route no surveyor could repeat. The librarians filed his map sideways, where its mountains slowly gathered names from stories of lost kingdoms.'},
      doyle:{title:'The inference behind the locked glass',text:'Three clues were preserved without their case: a footprint, a stopped watch, and a thread of red wool. The consulting room opens only when a reader notices what the catalogue does not say.'},
      wells:{title:'The clock that ran ahead',text:'The laboratory clock was found one evening showing a time eight hundred thousand years too late. The staff sealed the room rather than wind it back, and every so often the dust on the workbench is disturbed by someone who has not arrived yet.'},
      portrait:{title:'The keeper’s private ledger',text:'The portrait was turned toward the hall to hide this ledger. It lists readers who found books no one had meant to recommend, and the small changes those accidents made to their lives.'}
    };
    let roomRecords=new Set();try{const saved=JSON.parse(localStorage.getItem('athenaeum-room-records')||'[]');if(Array.isArray(saved))roomRecords=new Set(saved.filter(id=>ROOM_RECORDS[id]))}catch(ignore){}
    let awakenedBooks=new Set();try{const saved=JSON.parse(localStorage.getItem('athenaeum-awakened-books')||'[]');if(Array.isArray(saved))awakenedBooks=new Set(saved)}catch(ignore){}
    let deskBooks=new Set();try{const saved=JSON.parse(localStorage.getItem('athenaeum-desk-books')||'[]');if(Array.isArray(saved))deskBooks=new Set(saved)}catch(ignore){}
    let restoredMemoryBooks=new Set();try{const saved=JSON.parse(localStorage.getItem('library-returning-names')||'[]');if(Array.isArray(saved))restoredMemoryBooks=new Set(saved)}catch(ignore){}
    let exploredRooms=new Set();try{const saved=JSON.parse(localStorage.getItem('athenaeum-explored-rooms')||'[]');if(Array.isArray(saved))exploredRooms=new Set(saved)}catch(ignore){}
    const libraryMemory=window.createLibraryMemory({storage:localStorage,books});
    function tileTex(draw,w,h,rx,ry){const t=canvasTexture(draw,w,h);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);return t}
    function drawPlankGrain(ctx,w,h){ctx.fillStyle='#5c5c5c';ctx.fillRect(0,0,w,h);const planks=6,ph=h/planks;for(let i=0;i<planks;i++){const y=i*ph,shade=120+((i*53)%80);ctx.fillStyle=`rgb(${shade},${shade},${shade})`;ctx.fillRect(0,y,w,ph-3);ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(0,y+ph-3,w,3);for(let g=0;g<4;g++){const gy=y+3+(g/4)*(ph-6)+Math.random()*3;ctx.strokeStyle='rgba(0,0,0,.32)';ctx.beginPath();ctx.moveTo(0,gy);ctx.bezierCurveTo(w*.3,gy+Math.random()*6-3,w*.7,gy+Math.random()*6-3,w,gy);ctx.stroke()}}for(let n=0;n<600;n++){ctx.fillStyle=`rgba(255,255,255,${Math.random()*.08})`;ctx.fillRect(Math.random()*w,Math.random()*h,2,1)}}
    function drawMasonryGrain(ctx,w,h){ctx.fillStyle='#4a4a46';ctx.fillRect(0,0,w,h);const rows=6,rh=h/rows,cols=8,cw=w/cols;for(let r=0;r<rows;r++){const y=r*rh,offset=(r%2)*(cw/2);for(let c=0;c<cols;c++){const x=(c*cw+offset)%w,shade=95+((r*53+c*29)%75);ctx.fillStyle=`rgb(${shade},${shade},${shade-4})`;ctx.fillRect(x+1,y+1,cw-2,rh-2)}}ctx.strokeStyle='rgba(0,0,0,.6)';ctx.lineWidth=3;for(let r=0;r<=rows;r++){ctx.beginPath();ctx.moveTo(0,r*rh);ctx.lineTo(w,r*rh);ctx.stroke()}for(let n=0;n<800;n++){ctx.fillStyle=`rgba(0,0,0,${Math.random()*.09})`;ctx.fillRect(Math.random()*w,Math.random()*h,2,2)}}
    function drawMetalGrain(ctx,w,h){ctx.fillStyle='#78787a';ctx.fillRect(0,0,w,h);for(let i=0;i<260;i++){const y=Math.random()*h;ctx.strokeStyle=`rgba(255,255,255,${Math.random()*.18})`;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y+Math.random()*8-4);ctx.stroke()}for(let i=0;i<260;i++){const y=Math.random()*h;ctx.strokeStyle=`rgba(0,0,0,${Math.random()*.18})`;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y+Math.random()*8-4);ctx.stroke()}}
    const plankTex=tileTex(drawPlankGrain,256,256,4,3),masonryTex=tileTex(drawMasonryGrain,256,256,4,3),metalTex=tileTex(drawMetalGrain,256,256,3,3);
    const MAT={wood:new THREE.MeshStandardMaterial({color:0x4d2d19,roughness:.72}),wood2:new THREE.MeshStandardMaterial({color:0x321c10,roughness:.82}),darkWood:new THREE.MeshStandardMaterial({color:0x25140d,roughness:.7}),brass:new THREE.MeshStandardMaterial({color:0x9f7330,metalness:.65,roughness:.32,map:metalTex,bumpMap:metalTex,bumpScale:.02}),paper:new THREE.MeshStandardMaterial({color:0xd4c59f,roughness:.86}),stone:new THREE.MeshStandardMaterial({color:0x4a4339,roughness:.94,map:masonryTex,bumpMap:masonryTex,bumpScale:.07}),fabric:new THREE.MeshStandardMaterial({color:0x5d1e22,roughness:.96}),green:new THREE.MeshStandardMaterial({color:0x1f4034,roughness:.92}),black:new THREE.MeshStandardMaterial({color:0x0d0b09,roughness:.75}),glass:new THREE.MeshStandardMaterial({color:0x263a4a,transparent:true,opacity:.48,roughness:.08,metalness:.08}),gold:new THREE.MeshStandardMaterial({color:0xbe914c,metalness:.45,roughness:.42,map:metalTex,bumpMap:metalTex,bumpScale:.02})};
    // Real-scale wall textures and contact shadows (wall-finish.js); low-bandwidth mode keeps the plain walls.
    const wallFinish=lowBandwidth?null:window.createWallFinish?.({THREE})||null;
    // GPU-compressed (.ktx2) copies of the photographic textures use a quarter to an eighth of the
    // graphics memory. They are only requested when the device can keep them compressed; the
    // original JPGs remain the fallback for everything else, or if the decoder cannot be fetched.
    const compressedTextureFormats=['WEBGL_compressed_texture_astc','WEBGL_compressed_texture_etc','WEBGL_compressed_texture_s3tc','EXT_texture_compression_bptc','WEBGL_compressed_texture_etc1','WEBGL_compressed_texture_pvrtc'].filter(name=>renderer.extensions.has(name));
    let ktx2LoaderPromise=null;
    function ktx2Loader(){if(!compressedTextureFormats.length||new URLSearchParams(location.search).has('noktx2'))return Promise.resolve(null);return ktx2LoaderPromise||(ktx2LoaderPromise=Promise.race([import('https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/loaders/KTX2Loader.js/+esm').then(module=>new module.KTX2Loader().setTranscoderPath('https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/libs/basis/').detectSupport(renderer)),new Promise(resolve=>setTimeout(()=>resolve(null),8000))]).catch(()=>null))}
    function loadSharedTexture(url,apply,colorSpace=THREE.NoColorSpace){const fallback=()=>new THREE.TextureLoader().load(url,texture=>{texture.colorSpace=colorSpace;apply(texture)});ktx2Loader().then(loader=>{if(!loader){fallback();return}loader.load(url.replace(/\.(jpe?g|png)$/i,'.ktx2'),texture=>{texture.colorSpace=colorSpace;apply(texture)},undefined,fallback)})}
    function standInTexture(rgb,colorSpace=THREE.NoColorSpace){const texture=new THREE.DataTexture(new Uint8Array([...rgb,255]),1,1);texture.colorSpace=colorSpace;texture.userData.standIn=true;texture.needsUpdate=true;return texture}
    if(!lowBandwidth){const sharedTextureLoader={load:(url,apply)=>loadSharedTexture(url,apply,/diffuse/.test(url)?THREE.SRGBColorSpace:THREE.NoColorSpace)},applySharedMaterial=(material,base,normal,roughness,repeat=[3,3])=>{/* Plain stand-ins until the textures arrive, so the material's shader is the same before and after (and is compiled once). */material.map=standInTexture([255,255,255],THREE.SRGBColorSpace);if(normal)material.normalMap=standInTexture([128,128,255]);if(roughness)material.roughnessMap=standInTexture([255,255,255]);material.bumpMap=null;material.needsUpdate=true;sharedTextureLoader.load(base,texture=>{texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(...repeat);material.map=texture;material.needsUpdate=true});if(normal)sharedTextureLoader.load(normal,texture=>{texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(...repeat);material.normalMap=texture;material.normalScale.set(.36,.36);material.needsUpdate=true});if(roughness)sharedTextureLoader.load(roughness,texture=>{texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(...repeat);material.roughnessMap=texture;material.needsUpdate=true})};applySharedMaterial(MAT.wood,'assets/polyhaven/materials/smoked_walnut_veneer/diffuse.jpg','assets/polyhaven/materials/smoked_walnut_veneer/normal.jpg','assets/polyhaven/materials/smoked_walnut_veneer/roughness.jpg',[4,2]);applySharedMaterial(MAT.darkWood,'assets/polyhaven/materials/smoked_walnut_veneer/diffuse.jpg','assets/polyhaven/materials/smoked_walnut_veneer/normal.jpg','assets/polyhaven/materials/smoked_walnut_veneer/roughness.jpg',[4,2]);applySharedMaterial(MAT.fabric,'assets/polyhaven/materials/leather_red_02/diffuse.jpg','assets/polyhaven/materials/leather_red_02/normal.jpg','assets/polyhaven/materials/leather_red_02/roughness.jpg',[2,2])}
    function mesh(geo,mat,x=0,y=0,z=0,shadow=true){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=false;m.receiveShadow=false;scene.add(m);return m}
    function box(w,h,d,mat,x,y,z,shadow=true){const m=mesh(new THREE.BoxGeometry(w,h,d),mat,x,y,z,shadow);if(wallFinish?.isWall(mat))wallFinish.finishBox(m,w,h,d);return m}
    function cylinder(rt,rb,h,seg,mat,x,y,z){return mesh(new THREE.CylinderGeometry(rt,rb,h,seg),mat,x,y,z)}
    function collider(x,z,w,d,name='furniture',minY=-Infinity,maxY=Infinity){const c={minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,name,minY,maxY,inactive:false};colliders.push(c);indexCollider(c);return c}
    function nearbyColliders(x,z){return colliderCells.get(spatialKey(x,z))||[]}
    function addBox(w,h,d,mat,x,y,z,solid=true){const m=box(w,h,d,mat,x,y,z);if(solid)collider(x,z,w,d);return m}
    function trim(x,y,z,w,h,d){return box(w,h,d,MAT.darkWood,x,y,z)}
    const lampShadeMaterial=new THREE.MeshStandardMaterial({color:0xd6ad69,emissive:0xb86c27,emissiveIntensity:2.35,roughness:.8});
    function addLamp(x,y,z,scale=1){lampSpots.push([x,y,z]);cylinder(.55,.75,.24,10,MAT.brass,x,y,z);return cylinder(.32,.74,.64,12,lampShadeMaterial,x,y+.46,z)}
    const flickerLights=[],lampSpots=[];
    function addSoftRoomLight(x,y,z,color=0xe0b77a,intensity=7,distance=15){const light=new THREE.PointLight(color,intensity,distance,2);light.position.set(x,y,z);light.castShadow=false;scene.add(light);flickerLights.push(light);return light}
    function mergedBoxParts(parts,mat){const positions=[],normals=[],uvs=[];for(const [w,h,d,x,y,z] of parts){const source=new THREE.BoxGeometry(w,h,d).toNonIndexed();source.translate(x,y,z);positions.push(...source.attributes.position.array);normals.push(...source.attributes.normal.array);uvs.push(...source.attributes.uv.array);source.dispose()}const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.computeBoundingSphere();return new THREE.Mesh(geometry,mat)}
    // One small woven design serves all rugs; tint and wear follow the room.
    const rugTexture=canvasTexture((c,w,h)=>{c.fillStyle='#432127';c.fillRect(0,0,w,h);for(let y=0;y<h;y+=3){c.fillStyle=y%9?'rgba(207,163,111,.035)':'rgba(23,14,16,.11)';c.fillRect(0,y,w,1)}for(const inset of [9,19,34,45]){c.strokeStyle=inset%2?'#aa8451':'#775443';c.lineWidth=inset===9?7:3;c.strokeRect(inset,inset*.48,w-inset*2,h-inset*.96)}c.strokeStyle='#b2915d';c.lineWidth=3;for(let x=53;x<w-48;x+=24){for(const y of [26,h-27]){c.beginPath();c.moveTo(x-8,y);c.lineTo(x,y-7);c.lineTo(x+8,y);c.lineTo(x,y+7);c.closePath();c.stroke()}}for(let y=54;y<h-50;y+=21)for(const x of [28,w-28]){c.beginPath();c.arc(x,y,3.5,0,Math.PI*2);c.stroke()}c.save();c.translate(w/2,h/2);for(const scale of [1,.68,.38]){c.beginPath();c.moveTo(0,-72*scale);c.lineTo(112*scale,0);c.lineTo(0,72*scale);c.lineTo(-112*scale,0);c.closePath();c.strokeStyle=scale===1?'#b38b56':'#795c47';c.lineWidth=scale===1?5:3;c.stroke()}for(const [x,y] of [[-140,0],[140,0],[0,-85],[0,85]]){c.beginPath();c.ellipse(x,y,11,6,0,0,Math.PI*2);c.fillStyle='#8b694d';c.fill()}c.restore();for(let i=0;i<90;i++){const x=(i*137)%w,y=(i*89)%h;c.fillStyle='rgba(196,161,116,.065)';c.fillRect(x,y,2+i%4,1)}},512,256);const rugMaterials=new Map();
    function rug(x,z,w,d,color=0x561d1e){let material=rugMaterials.get(color);if(!material){const tint=new THREE.Color(color).lerp(new THREE.Color(0xffffff),.65);material=new THREE.MeshStandardMaterial({map:rugTexture,roughness:1,color:tint});rugMaterials.set(color,material)}const r=mesh(new THREE.PlaneGeometry(w,d),material,x,.021,z,false);r.rotation.x=-Math.PI/2;return r}
    function canvasTexture(draw,w=384,h=560){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t}
    // A real period plate (assets/plates) drawn over its hand-drawn stand-in once it loads; low-bandwidth mode keeps the drawing.
    function plateTexture(url,fallback,w=750,h=1000){if(lowBandwidth)return fallback;const t=canvasTexture(c=>c.drawImage(fallback.image,0,0,w,h),w,h);fallback.dispose();/* Downloaded the first time the plate is actually drawn, not at start-up. */let requested=false;t.onUpdate=()=>{if(requested)return;requested=true;const img=new Image();img.onload=()=>{t.image.getContext('2d').drawImage(img,0,0,w,h);t.needsUpdate=true};img.src=url};return t}
    const bookPalettes=[['#182d2a','#c49a53'],['#4a1618','#d6b36c'],['#18243d','#c59b56'],['#432612','#d2ad68'],['#24201d','#ba8741']],coverTextureCache=new Map(),lightweightCoverTextureCache=new Map();
    function lightweightCoverTexture(book){if(lightweightCoverTextureCache.has(book.id))return lightweightCoverTextureCache.get(book.id);const p=bookPalettes[book.index%bookPalettes.length],texture=canvasTexture((c,w,h)=>{c.fillStyle=p[0];c.fillRect(0,0,w,h);c.strokeStyle=p[1];c.lineWidth=3;c.strokeRect(5,5,w-10,h-10);c.lineWidth=1;c.strokeRect(9,9,w-18,h-18);c.fillStyle=p[1];c.textAlign='center';c.font='8px Georgia';c.fillText('THE ATHENAEUM',w/2,24);c.beginPath();c.moveTo(24,31);c.lineTo(w-24,31);c.stroke();c.font=book.title.length>55?'bold 9px Georgia':book.title.length>30?'bold 11px Georgia':'bold 13px Georgia';wrapText(c,book.title,w/2,54,w-24,15);c.font='italic 8px Georgia';wrapText(c,book.author,w/2,h-31,w-22,10);c.font='13px Georgia';c.fillText('❦',w/2,h-12)},128,188);texture.anisotropy=1;texture.generateMipmaps=false;texture.minFilter=THREE.LinearFilter;lightweightCoverTextureCache.set(book.id,texture);return texture}
    function bookMaterial(book,roughness=.72){return new THREE.MeshStandardMaterial({map:lightweightCoverTexture(book),color:0xffffff,roughness})}
    // Detailed covers are separate files so approaching one book never parses or decodes
    // an entire shard. Work is limited to one cover at a time while the reader is still.
    const realCoverTextureCache=new Map(),missingRealCoverIds=new Set(),coverWorkQueue=[],queuedCoverMeshes=new Set(),pendingRealCoverIds=new Set(),coverFrustum=new THREE.Frustum(),coverProjectionMatrix=new THREE.Matrix4();let coverIdleHandle=0,realCoverController=null,realCoverInFlightId='',coverLoadGeneration=0,lastCoverMotionAt=performance.now(),lastCoverUploadAt=0;
    const requestLibraryIdle=callback=>window.requestIdleCallback?window.requestIdleCallback(callback,{timeout:700}):setTimeout(()=>callback({timeRemaining:()=>8,didTimeout:true}),lowPowerDevice?250:160);
    function playerIsMoving(){return player.vel.x*player.vel.x+player.vel.z*player.vel.z>.12||performance.now()-lastCoverMotionAt<900}
    function noteCoverMotion(){lastCoverMotionAt=performance.now();coverLoadGeneration++;if(realCoverController){realCoverController.abort();realCoverController=null;if(realCoverInFlightId)pendingRealCoverIds.add(realCoverInFlightId);realCoverInFlightId=''}}
    function scheduleCoverWork(){if(coverIdleHandle||realCoverController||!coverWorkQueue.length&&(lowBandwidth||!pendingRealCoverIds.size))return;coverIdleHandle=requestLibraryIdle(processCoverWork)}
    function queueCoverMesh(bm){if(!bm||queuedCoverMeshes.has(bm)||bm.userData?.realCover)return;queuedCoverMeshes.add(bm);coverWorkQueue.push(bm);scheduleCoverWork()}
    function refreshCoverFrustum(){camera.updateMatrixWorld();coverProjectionMatrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);coverFrustum.setFromProjectionMatrix(coverProjectionMatrix)}
    function coverObjectIsVisible(object){if(object===selected)return true;if(!object?.parent||!object.visible)return false;let root=object;while(root.parent)root=root.parent;if(root!==scene)return false;object.getWorldPosition(tmpWorldPosition);return tmpWorldPosition.distanceToSquared(camera.position)<144&&coverFrustum.containsPoint(tmpWorldPosition)}
    function applyBookCover(id,texture,detailed=true){refreshCoverFrustum();for(const object of interactables){const book=object.userData?.book;if(String(book?.id)!==String(id)||book.secretBindingTexture||object.userData.cinderBinding||!object.material||!coverObjectIsVisible(object))continue;object.material.map=texture;if(object.material.color)object.material.color.setHex(0xffffff);object.material.needsUpdate=true;object.userData.realCover=detailed}}
    function visibleCoverNeeded(id){refreshCoverFrustum();return interactables.some(object=>String(object.userData?.book?.id)===String(id)&&coverObjectIsVisible(object))}
    function textureFromBlob(blob,signal){return new Promise((resolve,reject)=>{const url=URL.createObjectURL(blob),image=new Image(),finish=()=>URL.revokeObjectURL(url);image.onload=()=>{finish();if(signal.aborted){reject(new DOMException('Aborted','AbortError'));return}const texture=new THREE.Texture(image);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=2;texture.needsUpdate=true;resolve(texture)};image.onerror=()=>{finish();reject(new Error('Cover image could not be decoded'))};image.src=url})}
    async function loadRealCover(id){const generation=coverLoadGeneration,controller=new AbortController();realCoverController=controller;realCoverInFlightId=id;try{const response=await fetch(`covers/books/${encodeURIComponent(id)}.jpg`,{signal:controller.signal,cache:'force-cache'});if(!response.ok)throw new Error(`Cover ${id} was not found`);const texture=await textureFromBlob(await response.blob(),controller.signal);if(controller.signal.aborted||generation!==coverLoadGeneration||playerIsMoving()){texture.dispose();pendingRealCoverIds.add(id);return}realCoverTextureCache.set(id,texture);lastCoverUploadAt=performance.now();applyBookCover(id,texture)}catch(error){if(error.name==='AbortError')pendingRealCoverIds.add(id);else{missingRealCoverIds.add(id);const book=books.find(item=>String(item.id)===String(id));if(book){lastCoverUploadAt=performance.now();applyBookCover(id,coverTexture(book),false)}}}finally{if(realCoverController===controller)realCoverController=null;if(realCoverInFlightId===id)realCoverInFlightId='';scheduleCoverWork()}}
    function processCoverWork(deadline){coverIdleHandle=0;if(playerIsMoving()||!gameActive()&&!selected){scheduleCoverWork();return}const bm=coverWorkQueue.shift();if(bm){queuedCoverMeshes.delete(bm);const data=bm.userData;refreshCoverFrustum();if(data?.type==='book'&&bm.parent&&coverObjectIsVisible(bm)){if(lowBandwidth)data.loaded=true;else requestRealCover(data.book)}else if(data)data.coverRequested=false}else if(!lowBandwidth&&pendingRealCoverIds.size&&performance.now()-lastCoverUploadAt>=650){const id=pendingRealCoverIds.values().next().value;pendingRealCoverIds.delete(id);if(visibleCoverNeeded(id)){const cached=realCoverTextureCache.get(id);if(cached)applyBookCover(id,cached);else loadRealCover(id)}}if(coverWorkQueue.length||!lowBandwidth&&pendingRealCoverIds.size)scheduleCoverWork()}
    function requestRealCover(book){if(book?.secretBindingTexture)return Promise.resolve();const id=String(book?.id||'');if(lowBandwidth||!id||missingRealCoverIds.has(id))return Promise.resolve();const cached=realCoverTextureCache.get(id);if(cached){applyBookCover(id,cached);return Promise.resolve(cached)}if(id!==realCoverInFlightId)pendingRealCoverIds.add(id);scheduleCoverWork();return Promise.resolve()}
function coverTexture(book){if(book.secretBindingTexture)return book.secretBindingTexture;if(coverTextureCache.has(book.id))return coverTextureCache.get(book.id);const texture=canvasTexture((c,w,h)=>{const design=window.ATHENAEUM_COVER_DESIGNS?.[book.id],p=design||bookPalettes[book.index%bookPalettes.length],imprint=(book.source||'THE ATHENAEUM').toUpperCase().slice(0,28);c.fillStyle=p[0];c.fillRect(0,0,w,h);c.strokeStyle=p[1];c.lineWidth=9;c.strokeRect(20,20,w-40,h-40);c.lineWidth=2;c.strokeRect(31,31,w-62,h-62);c.fillStyle=p[1];c.textAlign='center';c.font='24px Georgia';c.fillText(imprint,w/2,82);c.beginPath();c.moveTo(75,104);c.lineTo(w-75,104);c.stroke();c.font=design?(book.title.length>100?'bold 22px Georgia':book.title.length>65?'bold 26px Georgia':'bold 32px Georgia'):'bold 37px Georgia';wrapText(c,book.title,w/2,design?135:195,w-92,design?34:47);if(design)window.drawAthenaeumCoverEmblem(c,w,h,design[2]);c.font='italic 25px Georgia';c.fillText(book.author,w/2,design?h-50:h-92);c.font='32px Georgia';if(!design)c.fillText('❦',w/2,h-42)},384,560);coverTextureCache.set(book.id,texture);return texture}
    function wrapText(c,text,x,y,max,line){const words=text.split(' ');let s='',rows=[];for(const word of words){const n=s?`${s} ${word}`:word;if(c.measureText(n).width>max&&s){rows.push(s);s=word}else s=n}rows.push(s);rows.forEach((r,i)=>c.fillText(r,x,y+i*line))}

    const grain=canvasTexture((c,w,h)=>{c.fillStyle='#ad8c66';c.fillRect(0,0,w,h);for(let i=0;i<1800;i++){const y=Math.random()*h;c.strokeStyle=`rgba(45,22,9,${Math.random()*.16})`;c.beginPath();c.moveTo(0,y);c.bezierCurveTo(w*.3,y+Math.random()*8,w*.6,y-4,w,y+2);c.stroke()}},256,256);grain.wrapS=grain.wrapT=THREE.RepeatWrapping;grain.repeat.set(2,4);for(const m of [MAT.wood,MAT.wood2,MAT.darkWood]){if(m.normalMap){if(m.map?.userData.standIn)m.map=grain;continue}m.map=grain;m.bumpMap=grain;m.bumpScale=.045;m.needsUpdate=true}
        const entranceStone=lowBandwidth?MAT.stone:(()=>{const tex=tileTex((c,w,h)=>{c.fillStyle='#4b413b';c.fillRect(0,0,w,h);const bw=w/8,bh=h/8;for(let row=0;row<8;row++)for(let col=-1;col<8;col++){const x=col*bw+(row%2)*bw/2,y=row*bh,v=(row*19+col*37+193)%11,shade=142+v*3,face=c.createLinearGradient(x,y,x+bw,y+bh);face.addColorStop(0,`rgb(${shade+7},${shade+1},${shade-6})`);face.addColorStop(1,`rgb(${shade-17},${shade-21},${shade-24})`);c.fillStyle=face;c.fillRect(x+2,y+2,bw-4,bh-4);for(let mark=0;mark<9;mark++){const px=x+6+((mark*31+v*13)%(bw-12)),py=y+5+((mark*19+v*7)%(bh-10));c.fillStyle=mark%3?'rgba(245,220,184,.065)':'rgba(31,22,16,.09)';c.fillRect(px,py,2+mark%3,1)}}},512,512,8,4);tex.anisotropy=4;return new THREE.MeshStandardMaterial({color:0x9a8877,roughness:.93,map:tex,bumpMap:tex,bumpScale:.035})})();
    // Photographic walls (Poly Haven, CC0): sandstone blocks, tinted per room, laid out in metres. Stone is matte,
    // so the (glossier) roughness map is left out. The drawn stone stands in (at the same scale) until the photographs arrive, and the flat
    // stand-in maps keep the shader identical before and after, so nothing recompiles when they do.
    const wallSets={},wallStandIn=wallFinish?wallFinish.scaleTexture(entranceStone.map.clone(),[4.8,2.4]):null;
    function wallSet(name,tile){if(wallSets[name])return wallSets[name];const set=wallSets[name]={materials:[],textures:{}};for(const [channel,space] of [['diffuse',THREE.SRGBColorSpace],['normal',THREE.NoColorSpace]])loadSharedTexture(`assets/polyhaven/materials/${name}/${channel}.jpg`,texture=>{wallFinish.scaleTexture(texture,tile);set.textures[channel]=texture;for(const m of set.materials)wallTexture(m,channel,texture)},space);return set}
    function wallTexture(m,channel,texture){if(channel==='diffuse')m.map=texture;else m.normalMap=texture;m.needsUpdate=true}
    function photoWall(name,tile,color,normalScale=.9){const set=wallSet(name,tile),m=new THREE.MeshStandardMaterial({color,roughness:.95,map:set.textures.diffuse||wallStandIn,normalMap:set.textures.normal||standInTexture([128,128,255])});m.normalScale.set(normalScale,normalScale);set.materials.push(m);return wallFinish.wallMaterial(m)}
    const hallWall=wallFinish?photoWall('sandstone_blocks_08',[2.4,2.4],0x8a7a6a,2):entranceStone;
    // architecture
    addBox(38,.5,62,MAT.wood,0,-.28,0,false);rug(0,11,11,20);rug(0,-15,13,15);rug(-27,-2,14,15,0x3b1b22);rug(27,-2,14,15,0x3b1b22);
    addBox(38,10,.6,hallWall,0,5,-31);addBox(30.4,10,.6,hallWall,-3.8,5,31);/* The corner piece opens on the cupboard under the stairs. */box(1.9,7.85,.6,hallWall,18.05,6.075,31);addBox(.2,2.15,.6,hallWall,17.2,1.075,31);addBox(.2,2.15,.6,hallWall,18.9,1.075,31);collider(18.05,31,1.9,.6,'south wall',2.5);
    addBox(18,.45,24,MAT.wood,-28,-.2,-2,false);addBox(18,.45,24,MAT.wood,28,-.2,-2,false);addBox(.5,8,8,hallWall,-37,4,-10);addBox(.5,8,10,hallWall,-37,4,5);addBox(.5,8,9,hallWall,37,4,-9.5);addBox(.5,8,9,hallWall,37,4,5.5);addBox(18,8,.5,hallWall,-28,4,-14);addBox(18,8,.5,hallWall,-28,4,10);addBox(18,8,.5,hallWall,28,4,-14);addBox(18,8,.5,hallWall,28,4,10);
    // openings between wings; the eastern upper wall leaves a concealed portrait passage
    for(const side of [-1,1]){const x=side*19;addBox(.5,10,22,hallWall,x,5,-20);if(side<0)addBox(.5,10,22,hallWall,x,5,20);else{addBox(.5,10,4,hallWall,x,5,15);addBox(.5,10,8,hallWall,x,5,27)}trim(x,7.4,0,.7,.5,8);trim(x,3.7,-4,.7,7.4,.5);trim(x,3.7,4,.7,7.4,.5);addBox(.5,2,26,hallWall,x,8.9,0,false);addBox(.5,10,3,hallWall,x,5,11.5);for(const z of [-6.425,6.425])addBox(.5,7.4,5.15,hallWall,x,3.7,z);addBox(.5,1.2,8,hallWall,x,7.4,0,false)}
    wallFinish?.settle(wallFinish.pieces.map(piece=>piece.mesh));
    // Closed wing doors conceal each wing from the entrance. They slide aside as the visitor approaches.
    // The wing doors are bookcases: from the Grand Hall each end reads as a wall of books, which parts down the middle
    // and slides into the walls as the reader comes near. Per leaf: a backing, one instanced set of shelf boards and a
    // painted plane of spines on each face, the spines drawn once and shared by all four leaves.
    function wingLeaf(side,direction){
      const W=3.85,H=6.9,rows=6,rowH=(H-.5)/rows,g=new THREE.Group();
      const spines=wingLeaf.spines||(wingLeaf.spines=[0,1].map(seed=>{const t=canvasTexture((c,w,h)=>{c.fillStyle='#0d0805';c.fillRect(0,0,w,h);
        const cols=['#4a1c18','#1f2e44','#2a3a26','#4a3218','#33203a','#5a4524','#1c2630','#3b1712','#24403f','#4d3b26','#2d2a24','#5b2a20'];let k=seed*7919+11;const rnd=()=>(k=(k*9301+49297)%233280)/233280,rh=h/rows;
        for(let r=0;r<rows;r++){let x=0;const base=(r+1)*rh-rh*.06;while(x<w){const bw=10+rnd()*20,bh=rh*(.62+rnd()*.28);if(rnd()<.05){x+=6+rnd()*14;continue}// now and then a gap
          const col=cols[Math.floor(rnd()*cols.length)];c.fillStyle=col;c.fillRect(x,base-bh,bw-1.5,bh);
          c.fillStyle='rgba(255,236,200,.06)';c.fillRect(x+1.5,base-bh,2,bh);c.fillStyle='rgba(0,0,0,.35)';c.fillRect(x+bw-4,base-bh,2.5,bh);
          c.fillStyle=rnd()<.5?'#a8843c':'#8a6a30';for(const f of [.1,.15,.86])c.fillRect(x+2,base-bh+bh*f,bw-5,1.6);if(rnd()<.4)c.fillRect(x+3,base-bh+bh*(.3+rnd()*.15),bw-7,bh*.08);x+=bw}}},512,1024);return t}));
      const faceMat=wingLeaf.faceMat||(wingLeaf.faceMat=spines.map(map=>new THREE.MeshStandardMaterial({map,roughness:.88})));
      const back=new THREE.Mesh(wingLeaf.backGeo||(wingLeaf.backGeo=new THREE.BoxGeometry(.14,H,W)),MAT.darkWood);g.add(back);
      const boards=[];for(const face of [1,-1]){for(let r=0;r<=rows;r++)boards.push([face*.155,-H/2+.25+r*rowH-(r===rows?.02:0),0,.17,.07,W]);for(const z of [W/2-.05,-W/2+.05])boards.push([face*.155,0,z,.17,H,.1])}
      const shelf=new THREE.InstancedMesh(wingLeaf.unit||(wingLeaf.unit=new THREE.BoxGeometry(1,1,1)),MAT.wood2||MAT.darkWood,boards.length),m=new THREE.Matrix4(),q=new THREE.Quaternion(),v=new THREE.Vector3(),sc=new THREE.Vector3();
      boards.forEach(([x,y,z,sx,sy,sz],i)=>shelf.setMatrixAt(i,m.compose(v.set(x,y,z),q,sc.set(sx,sy,sz))));g.add(shelf);
      for(const face of [1,-1]){const plane=new THREE.Mesh(wingLeaf.faceGeo||(wingLeaf.faceGeo=new THREE.PlaneGeometry(W-.2,H-.5)),faceMat[(face>0)===(direction>0)?0:1]);plane.position.set(face*.075,-.0,0);plane.rotation.y=face*Math.PI/2;g.add(plane)}
      return g}
    const wingDoors=[];
    for(const side of [-1,1]){
      const panels=[];
      for(const direction of [-1,1]){
        const panel=wingLeaf(side,direction);
        panel.position.set(side*19,3.45,direction*1.95);scene.add(panel);panels.push(panel);
      }
      wingDoors.push({side,panels,opening:0});
    }
    function playWingDoorCreak(){
      if(!audioCtx||muted)return;
      playSample('doorOpen',.45,.82);
      const t=audioCtx.currentTime,osc=audioCtx.createOscillator(),filter=audioCtx.createBiquadFilter(),gain=audioCtx.createGain();
      osc.type='sawtooth';
      osc.frequency.setValueAtTime(118,t);
      osc.frequency.linearRampToValueAtTime(172,t+.22);
      osc.frequency.linearRampToValueAtTime(95,t+.68);
      filter.type='bandpass';filter.frequency.value=440;filter.Q.value=1.8;
      gain.gain.setValueAtTime(.001,t);
      gain.gain.linearRampToValueAtTime(.055,t+.08);
      gain.gain.linearRampToValueAtTime(.018,t+.4);
      gain.gain.exponentialRampToValueAtTime(.001,t+.72);
      osc.connect(filter).connect(gain).connect(master);
      osc.start(t);osc.stop(t+.73);
      osc.onended=()=>{osc.disconnect();filter.disconnect();gain.disconnect()};
    }
    function updateWingDoors(dt){
      for(const door of wingDoors){
        const near=Math.abs(player.pos.x-door.side*19)<7.5&&Math.abs(player.pos.z)<8;
        if(near&&!door.wasNear&&started)playWingDoorCreak();
        door.wasNear=near;
        door.opening=THREE.MathUtils.damp(door.opening,near?1:0,5,dt);
        for(let i=0;i<2;i++)door.panels[i].position.z=(i===0?-1:1)*(1.95+door.opening*2.15);
      }
    }
    // complete roofs and lintels close every seam while preserving intentional entrances
    const roofMat=new THREE.MeshStandardMaterial({color:0x39342e,roughness:.96});box(38,.38,62,roofMat,0,9.62,0,false);box(18,.38,24,roofMat,-28,8.18,-2,false);box(18,.38,24,roofMat,28,8.18,-2,false);box(20,.38,20,roofMat,47,8.18,-2,false);box(14,.38,18,roofMat,-45,7.18,-3,false);box(10,.38,4,roofMat,-57,4.18,-3,false);box(10,.38,10,roofMat,-67,6.18,-3,false);box(9,.38,8,roofMat,23.5,12.18,20,false);
    box(1.05,7.7,.65,MAT.stone,11.92,5.75,31,false);box(1.05,7.7,.65,MAT.stone,16.58,5.75,31,false);box(5.7,.7,.65,MAT.stone,14.25,9.25,31,false);const roofStairUnderwall=box(5.65,6.55,.72,MAT.stone,14.25,3.275,31.08,false);for(let i=0;i<14;i++){const z=27.15+i*.72,y=5.08+i*.36;box(5.1,.22,.78,MAT.wood,14.25,y,z,false)}box(.55,1.8,6,MAT.stone,37,7.08,-2,false);box(.55,.3,6,MAT.darkWood,-37,7.82,-3,false);for(const x of [-37,-19,19,37,57])for(const z of [-14,10])trim(x,8.05,z,.7,.3,.7);
    const parquet=lowBandwidth?canvasTexture((c,w,h)=>{for(let row=0;row<8;row++)for(let col=-1;col<4;col++){const x=col*128+(row%2)*64,y=row*32;c.fillStyle=['#583a24','#62432b','#715035','#503520'][(row*3+col+4)%4];c.fillRect(x,y,127,31);for(let k=0;k<12;k++){c.strokeStyle='rgba(20,9,3,.12)';c.beginPath();c.moveTo(x,y+k*2.5);c.lineTo(x+127,y+k*2.5+1);c.stroke()}}},512,256):canvasTexture((c,w,h)=>{c.fillStyle='#2b1b13';c.fillRect(0,0,w,h);const plankW=64,plankH=32,tones=['#67442d','#754d33','#80563a','#5d3b29','#704831'];for(let row=0;row<16;row++)for(let col=-1;col<9;col++){const x=col*plankW+(row%2)*plankW/2,y=row*plankH,seed=(row*17+col*29+251)%tones.length,grain=c.createLinearGradient(x,y,x,y+plankH);grain.addColorStop(0,tones[seed]);grain.addColorStop(.55,tones[(seed+1)%tones.length]);grain.addColorStop(1,tones[seed]);c.fillStyle=grain;c.fillRect(x+1,y+1,plankW-2,plankH-2);for(let k=0;k<8;k++){const gy=y+4+k*3.3,drift=Math.sin((row*13+col*7+k)*.74)*1.8;c.strokeStyle=k%3?'rgba(24,11,6,.13)':'rgba(236,179,116,.12)';c.lineWidth=k%4===0?1.3:.65;c.beginPath();c.moveTo(x+3,gy);c.bezierCurveTo(x+plankW*.3,gy+drift,x+plankW*.7,gy-drift,x+plankW-3,gy+drift*.4);c.stroke()}if((row+col)%5===0){c.strokeStyle='rgba(31,16,9,.23)';c.lineWidth=.8;c.beginPath();c.ellipse(x+plankW*.55,y+plankH*.52,7,2.7,-.06,0,Math.PI*2);c.stroke()}}},512,512);parquet.wrapS=parquet.wrapT=THREE.RepeatWrapping;parquet.repeat.set(6,12);const parquetFloor=mesh(new THREE.PlaneGeometry(37.8,61.8),new THREE.MeshStandardMaterial({map:parquet,roughness:.76,bumpMap:parquet,bumpScale:.018}),0,.005,0,false);parquetFloor.rotation.x=-Math.PI/2;
    // Continue the hall's board scale into the western wing without a second floor texture.
    const westFloorGeometry=new THREE.PlaneGeometry(17.8,23.8),westUV=westFloorGeometry.attributes.uv;for(let i=0;i<westUV.count;i++)westUV.setXY(i,westUV.getX(i)*17.8/37.8,westUV.getY(i)*23.8/61.8);const westFloor=mesh(westFloorGeometry,parquetFloor.material,-28,.006,-2,false);westFloor.rotation.x=-Math.PI/2;const eastFloorGeometry=westFloorGeometry.clone(),eastFloor=mesh(eastFloorGeometry,parquetFloor.material,28,.006,-2,false);eastFloor.rotation.x=-Math.PI/2;
    // Walnut dado links the public rooms; geometry is merged into one trim mesh per run.
    function publicDado(x,z,width){box(width,2.15,.12,MAT.wood2,x,1.075,z,false);const parts=[[width,.12,.18,0,.11,.08],[width,.13,.2,0,2.14,.08],[width,.09,.17,0,1.84,.08]];for(let dx=-width/2+1.35;dx<width/2-1.1;dx+=2.7)parts.push([.11,1.58,.17,dx,1.03,.08]);const trimMesh=mergedBoxParts(parts,MAT.darkWood);trimMesh.position.set(x,0,z);scene.add(trimMesh)}
    publicDado(0,-30.58,37.6);publicDado(-3.8,30.58,30.1);publicDado(-28,-13.62,17.6);publicDado(-28,9.62,17.6);/* Split around the Librarian's Office door (x 33.8 to 36.2) and the doorway to the Verne descent (x 32 to 36). */publicDado(26.5,-13.62,14.6);publicDado(36.5,-13.62,.6);publicDado(25.6,9.62,12.8);publicDado(36.4,9.62,.8);
    // ceiling beams and columns
    for(let z=-27;z<=27;z+=9)trim(0,9.3,z,38,.35,.42);for(const x of [-17,-11,11,17])for(const z of [-25,-5,15,27]){cylinder(.45,.62,8,10,MAT.stone,x,4,z);cylinder(.7,.7,.25,10,MAT.brass,x,.25,z);cylinder(.63,.48,.32,10,MAT.brass,x,8,z)}
    // windows with rainy exterior
    // Time of day: the library's own quick hours, or the reader's real clock (mapped so morning is 6–12,
    // afternoon 12–18, evening 18–24 and night 0–6).
    let timeMode=localStorage.getItem('athenaeum-time-mode')==='clock'?'clock':'library';
    function clockDayPhase(){const d=new Date(),x=((d.getHours()+d.getMinutes()/60+d.getSeconds()/3600)-6+24)%24;return x<12?x/24:x<18?.5+(x-12)/24:.75+(x-18)/24}
    // A painted sky behind the tall north windows: dawn, daylight with drifting cloud, sunset, then stars
    // and the moon; rain streaks the glass in wet weather.
    const skyWindows=(()=>{const uniforms={uPhase:{value:.68},uTime:{value:0},uRain:{value:0}},material=new THREE.ShaderMaterial({uniforms,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`
      uniform float uPhase,uTime,uRain;varying vec2 vUv;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){
        float day=clamp(sin(clamp(uPhase/.62,0.,1.)*3.14159),0.,1.),dusk=smoothstep(.42,.56,uPhase)*(1.-smoothstep(.62,.72,uPhase))+(1.-smoothstep(.0,.06,uPhase))*.7,night=1.-smoothstep(.02,.12,uPhase)*(1.-smoothstep(.64,.74,uPhase));
        vec2 p=vec2(vUv.x*4.,vUv.y);
        vec3 top=mix(vec3(.015,.025,.07),vec3(.2,.42,.72),day),low=mix(vec3(.04,.06,.13),vec3(.62,.76,.86),day);
        vec3 col=mix(low,top,smoothstep(.0,1.,vUv.y));
        col=mix(col,mix(vec3(.98,.42,.14),vec3(.5,.2,.42),vUv.y),dusk*.9*(1.-vUv.y*.45));
        float cloud=smoothstep(.45,.85,noise(p*vec2(1.2,3.)+vec2(uTime*.01,0.))*.7+noise(p*vec2(3.,7.)+vec2(uTime*.02,0.))*.3);
        col=mix(col,mix(vec3(.06,.07,.1),vec3(.92,.9,.88),day)+dusk*vec3(.35,.12,.05),cloud*(.35+uRain*.5));
        float star=step(.9965,hash(floor(p*vec2(60.,90.))))*night*(1.-cloud)*(.6+.4*sin(uTime*2.+hash(floor(p*90.))*30.));col+=vec3(star);
        vec2 m=vec2(3.35,.78);float moonD=length((p-m)*vec2(1.,4.)*.5);col+=vec3(.95,.92,.8)*night*(smoothstep(.07,.05,moonD)+.25*smoothstep(.35,.05,moonD))*(1.-cloud*.7);
        col*=(1.-uRain*.35)*.42;/* The hall is exposed brightly for its lamps; keep the sky from blowing out to white. */
        float streak=uRain*step(.93,hash(vec2(floor(vUv.x*140.),0.)))*smoothstep(.0,.25,fract(vUv.y*1.5+uTime*(.6+hash(vec2(floor(vUv.x*140.),1.)))));col+=vec3(.25,.3,.35)*streak*.35;
        gl_FragColor=vec4(col,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`});
      const panes=[];for(const x of [-12,-4,4,12]){const pane=new THREE.Mesh(new THREE.PlaneGeometry(4.9,5.7),material);pane.position.set(x,5.2,-30.68);const uv=pane.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setX(i,(uv.getX(i)+(x+12)/8)/4);scene.add(pane);panes.push(pane)}
      let rain=0;return {panes,update(phase,t,weatherNow){uniforms.uPhase.value=phase;uniforms.uTime.value=reducedMotion?0:t;rain+=((weatherNow==='CLEAR'?0:weatherNow==='STORM'?1:.6)-rain)*.02;uniforms.uRain.value=rain}}})();
    const windowMeshes=[];for(const x of [-12,-4,4,12]){const frame=box(5,5.8,.18,MAT.glass,x,5.2,-30.62,false);windowMeshes.push(frame);trim(x,5.2,-30.5,.14,6,.28);trim(x,5.2,-30.5,5.2,.14,.28);trim(x,2.2,-30.45,5.4,.26,.3);trim(x,8.2,-30.45,5.4,.26,.3)}
    // balcony and staircase
    addBox(7,.38,14,MAT.wood,15,5,22,false);collider(11.45,23,.45,13,'balcony rail',4,8);for(let z=16;z<=28;z+=2){trim(11.5,6,z,.22,1.8,.22);trim(11.5,6.9,z,.25,.2,2)}
    const stairMasonry=new THREE.MeshStandardMaterial({color:0x4a433d,roughness:.98,map:masonryTex,bumpMap:masonryTex,bumpScale:.09});
    for(let i=0;i<12;i++){const y=.22+i*.4,z=7+i*.75,fillTop=.42+i*.4;box(6,.4,.82,MAT.wood,15,y,z);box(5.55,fillTop,.68,stairMasonry,15,fillTop/2,z,false)}
    for(let i=0;i<11;i++){trim(11.8,1+i*.4,7+i*.75,.2,1.2,.2);trim(18.2,1+i*.4,7+i*.75,.2,1.2,.2)}
    // chandelier
    cylinder(.06,.06,3,8,MAT.brass,0,8,2);const ring=mesh(new THREE.TorusGeometry(2.1,.1,8,28),MAT.brass,0,6.55,2);ring.rotation.x=Math.PI/2;for(let i=0;i<8;i++){const a=i/8*Math.PI*2,x=Math.cos(a)*2.1,z=2+Math.sin(a)*2.1;addLamp(x,6.7,z,.35)}
    // layered logs, embers and translucent flames give both hearths depth instead of a flat orange panel
    const realisticFlames=[];function createHearthFire(x,y,z,scale=1,parent=scene){const group=new THREE.Group();group.position.set(x,y,z);group.scale.setScalar(scale);parent.add(group);const emberMat=new THREE.MeshStandardMaterial({color:0x4a1308,emissive:0xff3b08,emissiveIntensity:2.7,roughness:.8}),flameMats=[new THREE.MeshBasicMaterial({color:0xffae35,transparent:true,opacity:.82,blending:THREE.AdditiveBlending,depthWrite:false}),new THREE.MeshBasicMaterial({color:0xff5324,transparent:true,opacity:.67,blending:THREE.AdditiveBlending,depthWrite:false})];for(const dz of [-.18,.18]){const log=new THREE.Mesh(new THREE.CylinderGeometry(.13,.17,1.75,10),MAT.darkWood);log.rotation.z=Math.PI/2;log.rotation.y=dz<0?.18:-.18;log.position.set(0,.12,dz);group.add(log)}const ember=new THREE.Mesh(new THREE.SphereGeometry(.52,14,8),emberMat);ember.scale.set(1.8,.28,.55);ember.position.y=.18;group.add(ember);for(let i=0;i<7;i++){const flame=new THREE.Mesh(new THREE.ConeGeometry(.18+(i%3)*.045,.78+(i%2)*.35,10,1,true),flameMats[i%2]);flame.position.set((i-3)*.24,.5+(i%2)*.08,(i%3-1)*.08);flame.rotation.z=(i-3)*.04;flame.userData.phase=i*.83;group.add(flame);realisticFlames.push(flame)}const light=new THREE.PointLight(0xff7430,22*scale,10*scale,2);light.position.set(0,1.5,1.6);light.castShadow=false;group.add(light);return {group,ember,light}}
    // fireplace
    addBox(8,5,1.2,MAT.stone,-13,2.5,-28.8);box(4.8,3.1,1.25,MAT.black,-13,1.65,-28.1);trim(-13,5.25,-28.1,9,.45,1.5);const mainHearth=createHearthFire(-13,.18,-27.38,1.25),fire=mainHearth.ember,fireLight=mainHearth.light;collider(-13,-28,8,2);
    // The entrance clock, mounted above the doorway on the south wall; its hands keep the library's own time.
    const clockFaceTex=canvasTexture((c,w,h)=>{c.fillStyle='#1c1409';c.beginPath();c.arc(w/2,h/2,w/2-6,0,Math.PI*2);c.fill();c.strokeStyle='#b9924f';c.lineWidth=10;c.beginPath();c.arc(w/2,h/2,w/2-11,0,Math.PI*2);c.stroke();c.fillStyle='#d8bd88';for(let i=0;i<12;i++){const a=i/12*Math.PI*2,r=i%3===0?w/2-34:w/2-28,rad=i%3===0?5:3,x=w/2+Math.sin(a)*r,y=h/2-Math.cos(a)*r;c.beginPath();c.arc(x,y,rad,0,Math.PI*2);c.fill()}},260,260);
    const clockGroup=new THREE.Group();clockGroup.position.set(0,7.1,30.55);clockGroup.rotation.y=Math.PI;scene.add(clockGroup);
    const clockFace=new THREE.Mesh(new THREE.CircleGeometry(1.05,32),new THREE.MeshStandardMaterial({map:clockFaceTex,roughness:.75}));clockGroup.add(clockFace);
    const clockRim=new THREE.Mesh(new THREE.TorusGeometry(1.08,.08,8,28),MAT.brass);clockRim.position.z=.01;clockGroup.add(clockRim);
    function clockHand(length,width,mat,z){const pivot=new THREE.Group();pivot.position.z=z;const hand=new THREE.Mesh(new THREE.BoxGeometry(width,length,.03),mat);hand.position.y=length/2;pivot.add(hand);clockGroup.add(pivot);return pivot}
    const clockHourHand=clockHand(.6,.085,MAT.black,.05),clockMinuteHand=clockHand(.88,.055,MAT.darkWood,.08);
    const clockPin=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.12,10),MAT.brass);clockPin.rotation.x=Math.PI/2;clockPin.position.z=.1;clockGroup.add(clockPin);
    clockFace.userData={type:'object',title:'The entrance clock',author:'Its hands have never once agreed with a watch carried in from outside.',action:'EXAMINE'};interactables.push(clockFace);
    // reading tables, tea, spectacles suggested
    function bookTableTarget(parent,x,y,z,width=3.5,depth=1.2){const target=new THREE.Mesh(new THREE.BoxGeometry(width,.08,depth),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));target.position.set(x,y,z);target.userData={type:'book-table',title:'A reading table',author:'Set down the book you are carrying.',action:'LEAVE BOOK',placed:0};parent.add(target);interactables.push(target);return target}
    function table(x,z){addBox(5,.35,2.5,MAT.wood,x,1.45,z);for(const dx of [-2,2])for(const dz of [-.9,.9])addBox(.25,1.4,.25,MAT.darkWood,x+dx,.7,z+dz);addLamp(x,1.75,z,1);collider(x,z,5,2.5);bookTableTarget(scene,x,1.69,z,.98,1.35)}
    const returnDeskGroups=[],returnDeskFallback=[];
    // Two return tables run north-south either side of the rug, so the view from the entrance runs clear down the hall to the
    // globe. Each is turned so its local +z faces the rug and its lamp stands at the north end.
    function returnDiscoveryTable(x,z,west){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=west?Math.PI/2:-Math.PI/2;g.name='return-and-discovery-table';scene.add(g);returnDeskGroups.push(g);const north=west?1:-1,part=(geometry,material,px,py,pz)=>{const m=new THREE.Mesh(geometry,material);m.position.set(px,py,pz);m.castShadow=false;m.receiveShadow=false;g.add(m);return m};returnDeskFallback.push(part(new THREE.BoxGeometry(7,.34,3.2),MAT.wood,0,1.45,0));for(const dx of [-3.1,3.1])for(const dz of [-1.2,1.2])returnDeskFallback.push(part(new THREE.BoxGeometry(.26,1.4,.26),MAT.darkWood,dx,.7,dz));part(new THREE.BoxGeometry(6.5,.035,.055),MAT.brass,0,1.64,0);addLamp(x,1.76,z-2.7,1);if(west){bookTableTarget(g,-2.6*north,1.69,.3,1.4,1.2);for(const px of [-.3,-1.1]){const page=part(new THREE.BoxGeometry(.82,.025,.58),MAT.paper,px*north,1.64,.35);page.rotation.y=(px+.7)*.12}const stamp=part(new THREE.CylinderGeometry(.13,.17,.34,10),MAT.darkWood,-.7*north,1.82,-.45);stamp.userData={type:'object',title:'The date stamp',author:'It is set to tomorrow. No one admits changing it.',action:'EXAMINE'};interactables.push(stamp);const slips=part(new THREE.BoxGeometry(1.05,.035,.68),MAT.paper,-1.6*north,1.66,-.45);slips.rotation.y=-.16;slips.userData={type:'object',trailEvent:'returns-letter',title:'A fan of return slips',author:'Three books were returned before they were borrowed.',action:'EXAMINE'};interactables.push(slips)}collider(x,z,3.45,7.2,'return-and-discovery table')}
    returnDiscoveryTable(-7.6,5,true);returnDiscoveryTable(7.6,5,false);table(-28,-3);table(28,-3);
    const supportBox=new THREE.Group();supportBox.position.set(-6.2,0,22.3);supportBox.rotation.y=.12;scene.add(supportBox);const supportData={type:'support-box',title:'Light Another Lamp',author:'The Library Restoration Fund — every contribution keeps a lamp burning.',action:'INSPECT FUND'},supportPedestal=new THREE.Mesh(new THREE.BoxGeometry(1.5,1.05,1.18),MAT.darkWood);supportPedestal.position.y=.52;supportBox.add(supportPedestal);const supportChest=new THREE.Mesh(new THREE.BoxGeometry(1.62,.9,1.12),MAT.wood);supportChest.position.y=1.42;supportChest.castShadow=true;supportChest.userData=supportData;supportBox.add(supportChest);interactables.push(supportChest);const supportLid=new THREE.Mesh(new THREE.BoxGeometry(1.78,.16,1.26),MAT.darkWood);supportLid.position.y=1.94;supportBox.add(supportLid);const supportSlot=new THREE.Mesh(new THREE.BoxGeometry(.82,.035,.13),MAT.brass);supportSlot.position.set(0,2.04,-.04);supportSlot.rotation.x=-.18;supportBox.add(supportSlot);const fundTex=canvasTexture((c,w,h)=>{c.fillStyle='#20150c';c.fillRect(0,0,w,h);c.strokeStyle='#c49a51';c.lineWidth=12;c.strokeRect(10,10,w-20,h-20);c.fillStyle='#ead4a0';c.textAlign='center';c.font='bold 35px Georgia';c.fillText('LIGHT ANOTHER LAMP',w/2,58);c.font='italic 24px Georgia';c.fillText('LIBRARY RESTORATION FUND',w/2,101)},700,140),supportPlaque=new THREE.Mesh(new THREE.PlaneGeometry(1.52,.5),new THREE.MeshStandardMaterial({map:fundTex,emissiveMap:fundTex,emissive:0x38210f,emissiveIntensity:.45,roughness:.72}));supportPlaque.position.set(0,1.46,.575);supportPlaque.userData=supportData;supportBox.add(supportPlaque);interactables.push(supportPlaque);for(const x of [-.7,.7]){const finial=new THREE.Mesh(new THREE.SphereGeometry(.1,10,8),MAT.gold);finial.position.set(x,2.08,0);supportBox.add(finial)}for(let i=0;i<9;i++){const coin=new THREE.Mesh(new THREE.CylinderGeometry(.095,.095,.025,16),MAT.gold);coin.rotation.x=Math.PI/2;coin.position.set(-.42+(i%5)*.21,.93+Math.floor(i/5)*.04,.58);supportBox.add(coin)}const supportGlow=new THREE.PointLight(0xffbd67,6.5,7,2);supportGlow.position.set(0,2.3,.35);supportBox.add(supportGlow);collider(-6.2,22.3,1.8,1.3);
    supportBox.rotation.y+=Math.PI;
box(.45,.12,.45,MAT.paper,-27,1.72,-3,false);cylinder(.22,.18,.35,16,new THREE.MeshStandardMaterial({color:0x365748,roughness:.8}),-29,1.78,-3);
    const collectionDisplay=new THREE.Group();collectionDisplay.position.set(-7.6,1.72,4.1);collectionDisplay.rotation.y=Math.PI/2;scene.add(collectionDisplay);const deskToken=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.06,18),MAT.gold);deskToken.rotation.x=Math.PI/2;deskToken.position.x=-.55;collectionDisplay.add(deskToken);const deskMap=new THREE.Mesh(new THREE.BoxGeometry(.72,.03,.48),MAT.paper);deskMap.rotation.y=.18;collectionDisplay.add(deskMap);const deskKey=new THREE.Group(),keyRing=new THREE.Mesh(new THREE.TorusGeometry(.15,.035,6,16),MAT.brass),keyStem=new THREE.Mesh(new THREE.BoxGeometry(.42,.055,.055),MAT.brass);keyStem.position.x=.27;deskKey.add(keyRing,keyStem);deskKey.position.x=.65;deskKey.rotation.x=Math.PI/2;collectionDisplay.add(deskKey);const memoryLight=new THREE.PointLight(0xd8a55c,0,13,2);memoryLight.position.set(-7.6,4.5,4);scene.add(memoryLight);
    function registerSeat(parts,group,eye,yaw,options={}){const data=Object.assign({type:'seat',title:'A place to read',author:'Sit down with a random book',action:'SIT & READ',group,eye,yaw,categories:[]},options);for(const part of parts){part.userData=data;interactables.push(part)}if(data.type==='seat')seats.push(data);return data}
    // CC0 Poly Haven models are progressive enhancements: the lightweight procedural seats remain
    // usable while loading, in low-bandwidth mode, and whenever the asset CDN is unavailable.
    const seatAssetBase='assets/polyhaven/models/';
    const seatAssets={
      armchair:{url:seatAssetBase+'ArmChair_01/ArmChair_01_1k.gltf',height:2.35,yaw:Math.PI},
      sofa:{url:seatAssetBase+'Sofa_01/Sofa_01_1k.gltf',height:2.15,yaw:Math.PI},
      feature:{url:seatAssetBase+'WoodenChair_01/WoodenChair_01_1k.gltf',height:2.75,yaw:Math.PI},
      painted:{url:seatAssetBase+'painted_wooden_chair_01/painted_wooden_chair_01_1k.gltf',height:2.15,yaw:Math.PI},
      bench:{url:seatAssetBase+'painted_wooden_bench/painted_wooden_bench_1k.gltf',height:1.55,yaw:Math.PI},
      paintedSofa:{url:seatAssetBase+'painted_wooden_sofa/painted_wooden_sofa_1k.gltf',height:1.85,yaw:Math.PI}
    };
    const seatModelTemplates=new Map();
    let seatLoaderPromise=null;
    function seatLoader(){return seatLoaderPromise||(seatLoaderPromise=Promise.all([import('https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/loaders/GLTFLoader.js/+esm'),ktx2Loader()]).then(([module,ktx2])=>{const loader=new module.GLTFLoader();if(ktx2)loader.setKTX2Loader(ktx2);return loader}))}
    function seatTemplate(asset){if(!seatModelTemplates.has(asset.url))seatModelTemplates.set(asset.url,seatLoader().then(loader=>new Promise((resolve,reject)=>loader.load(asset.url,gltf=>resolve(gltf.scene),undefined,reject))));return seatModelTemplates.get(asset.url)}
    // Bundled CC0 models are shared by type and loaded only for the seats that use them.
    // Procedural seating remains usable while loading and in reduced-performance modes.
    function decorateSeat(group,parts,data,modelKey){
      if(!['armchair','sofa','feature'].includes(modelKey)||lowBandwidth||lowPowerDevice)return;
      const asset=seatAssets[modelKey];
      seatTemplate(asset).then(template=>{
        let root=group;while(root.parent)root=root.parent;if(root!==scene&&!Object.values(performanceZones).some(zone=>zone.group===root))return;
        const model=template.clone(true);
        model.rotation.y=asset.yaw;
        const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3());
        if(!size.y)return;
        model.scale.setScalar(asset.height/size.y);
        model.updateMatrixWorld(true);
        const fitted=new THREE.Box3().setFromObject(model),center=fitted.getCenter(new THREE.Vector3());
        model.position.set(-center.x,-fitted.min.y,-center.z);
        model.traverse(node=>{
          if(!node.isMesh)return;
          node.castShadow=false;node.receiveShadow=false;
          node.userData=data;interactables.push(node);
        });
        group.add(model);
        parts.forEach(part=>{part.visible=false});
      }).catch(()=>{});
    }
    function decorateReturnDesk(){if(lowBandwidth||!returnDeskGroups.length)return;seatTemplate({url:'assets/polyhaven/models/WoodenTable_01/WoodenTable_01_1k.gltf'}).then(template=>{for(const group of returnDeskGroups){const model=template.clone(true),bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),scale=1.58/Math.max(size.y,.001);model.scale.set(7/Math.max(size.x,.001),scale,scale);model.updateMatrixWorld(true);const fitted=new THREE.Box3().setFromObject(model),center=fitted.getCenter(new THREE.Vector3());model.position.set(-center.x,-fitted.min.y,-center.z);model.traverse(node=>{if(node.isMesh){node.castShadow=false;node.receiveShadow=false}});group.add(model)}returnDeskFallback.forEach(part=>part.visible=false)}).catch(()=>{})}
    decorateReturnDesk();
    function chair(x,z,rot=0,options={}){const y=floorHeight(x,z),g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=rot;scene.add(g);if(options.model==='painted'){const seat=new THREE.Mesh(new THREE.BoxGeometry(1.55,.2,1.35),MAT.wood2),back=new THREE.Mesh(new THREE.BoxGeometry(1.55,1.45,.18),MAT.darkWood),cushion=new THREE.Mesh(new THREE.BoxGeometry(1.37,.08,1.16),MAT.fabric);seat.position.y=.75;back.position.set(0,1.39,.6);cushion.position.y=.89;g.add(seat,back,cushion);for(const dx of [-.64,.64])for(const dz of [-.52,.52]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.14,.75,.14),MAT.darkWood);leg.position.set(dx,.38,dz);g.add(leg)}collider(x,z,1.75,1.65,'reading chair',y-1,y+2.5);registerSeat([seat,back,cushion],g,new THREE.Vector3(0,1.35,-.1),rot,options);return g}const seat=new THREE.Mesh(new THREE.BoxGeometry(2.1,.55,1.9),MAT.fabric);seat.position.y=.75;g.add(seat);const back=new THREE.Mesh(new THREE.BoxGeometry(2.1,2.4,.5),MAT.fabric);back.position.set(0,1.65,.72);g.add(back);const parts=[seat,back];for(const dx of [-.84,.84]){const a=new THREE.Mesh(new THREE.BoxGeometry(.3,.75,1.8),MAT.wood);a.position.set(dx,.65,0);g.add(a);parts.push(a)}collider(x,z,2.4,2.2,'armchair',y-1,y+3);const data=registerSeat([seat,back],g,new THREE.Vector3(0,1.35,-.1),rot,options);decorateSeat(g,parts,data,options.model);return g}
    function sofa(x,z,rot=0,options={}){const y=floorHeight(x,z),g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=rot;scene.add(g);const seat=new THREE.Mesh(new THREE.BoxGeometry(4.1,.48,1.75),MAT.fabric);seat.position.y=.72;const back=new THREE.Mesh(new THREE.BoxGeometry(4.1,1.85,.42),MAT.fabric);back.position.set(0,1.55,.68);g.add(seat,back);const parts=[seat,back];for(const dx of [-1.85,1.85]){const arm=new THREE.Mesh(new THREE.BoxGeometry(.35,.72,1.75),MAT.wood);arm.position.set(dx,.72,0);g.add(arm);parts.push(arm)}collider(x,z,4.5,2.15,'sofa',y-1,y+3);const data=registerSeat([seat,back],g,new THREE.Vector3(0,1.32,-.08),rot,options);decorateSeat(g,parts,data,options.model||'sofa');return g}
    function bench(x,z,rot=0,options={}){const y=floorHeight(x,z),g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=rot;scene.add(g);const cushion=new THREE.MeshStandardMaterial({color:0x3f1721,roughness:.92}),seat=new THREE.Mesh(new THREE.BoxGeometry(4.8,.34,1.35),cushion);seat.position.y=.72;const back=new THREE.Mesh(new THREE.BoxGeometry(4.8,1.18,.22),MAT.darkWood);back.position.set(0,1.38,.62);g.add(seat,back);const parts=[seat,back];for(const dx of [-2.18,2.18]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.25,1.82,.25),MAT.darkWood);leg.position.set(dx,.82,.48);g.add(leg);parts.push(leg);const finial=new THREE.Mesh(new THREE.ConeGeometry(.19,.45,8),MAT.brass);finial.position.set(dx,1.96,.48);g.add(finial);parts.push(finial)}for(const dx of [-1.55,-.78,0,.78,1.55]){const slat=new THREE.Mesh(new THREE.BoxGeometry(.12,.88,.12),MAT.wood);slat.position.set(dx,1.38,.53);g.add(slat);parts.push(slat)}const width=Math.abs(Math.cos(rot))*5.1+Math.abs(Math.sin(rot))*1.55,depth=Math.abs(Math.sin(rot))*5.1+Math.abs(Math.cos(rot))*1.55;collider(x,z,width,depth,'bench',y-1,y+2.5);const data=registerSeat([seat,back],g,new THREE.Vector3(0,1.3,-.05),rot,options);if(options.model!==false)decorateSeat(g,parts,data,options.model||'bench',{height:1.7});return g}
    chair(-13,-23,Math.PI,{model:'armchair',title:'A fireside Victorian armchair',author:'Settle beside the crackling hearth with a ghost story.',categories:['Ghosts']});
    sofa(-8.2,-23,Math.PI,{title:'A carved Gothic sofa',author:'The worn upholstery holds room for two, though the library admits one reader at a time.',categories:['Gothic','Ghosts','Society']});
    chair(10.6,6.2,Math.PI/2,{model:'armchair',title:'A deep reading chair',author:'Drawn up to the return table, within reach of the reading stand.',categories:['Wonder','Poetry','Philosophy']});
    chair(-10.3,6.2,-Math.PI/2,{model:'painted',title:'A chair at the return-and-discovery table',author:'Pulled back just far enough for another reader to take the place.',categories:['Travel','Natural History','Strange']});
    chair(-28,-.9,0,{model:'painted',title:'A worn catalogue chair',author:'Pulled up to the western reading desk, its paint has softened beneath generations of searching hands.',categories:['Mystery','Memory']});
    chair(28,-.9,0,{model:'painted',title:'A plain reading chair',author:'Pulled up to the eastern desk: unshowy, sturdy, and exactly where a reader needs it.',categories:['Society','Comedy','Journey']});
    chair(14,22,Math.PI/2,{model:'feature',title:'The librarian’s Gothic chair',author:'Carved tracery rises like a small wooden cathedral. It feels improper to sit here.',categories:['Gothic','Philosophy','Strange']});
    function windowSeat(x){const g=new THREE.Group();g.position.set(x,0,-28.65);scene.add(g);const base=new THREE.Mesh(new THREE.BoxGeometry(3.4,.72,1.25),MAT.wood);base.position.y=.36;g.add(base);const cushion=new THREE.Mesh(new THREE.BoxGeometry(3.12,.26,1.08),MAT.fabric);cushion.position.y=.83;g.add(cushion);for(const dx of [-1.28,1.28]){const pillow=new THREE.Mesh(new THREE.SphereGeometry(.38,10,7),MAT.fabric);pillow.scale.set(1.1,.75,.45);pillow.position.set(dx,.98,.22);g.add(pillow)}collider(x,-28.65,3.5,1.35,'window seat');const windowSeatData=registerSeat([cushion],g,new THREE.Vector3(0,1.3,0),0,{title:'A rain-window seat',author:'Read while the rain writes its own story on the glass.',categories:['Journey','Sea','Adventure','Poetry']});decorateSeat(g,[base,cushion,...g.children.filter(child=>child!==base&&child!==cushion)],windowSeatData,'paintedSofa',{height:1.75})}
    windowSeat(-4);windowSeat(4);windowSeat(12);
    function writingDesk(x,z,carrel=false){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);const top=new THREE.Mesh(new THREE.BoxGeometry(3.5,.22,1.5),MAT.wood);top.position.set(0,1.32,-.45);g.add(top);bookTableTarget(g,.8,1.48,-.45,1.15,.95);for(const dx of [-1.45,1.45]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.18,1.25,.18),MAT.darkWood);leg.position.set(dx,.63,-.45);g.add(leg)}const writingChair=new THREE.Mesh(new THREE.BoxGeometry(1.45,.3,1.25),MAT.green);writingChair.position.set(0,.72,1);g.add(writingChair);const writingBack=new THREE.Mesh(new THREE.BoxGeometry(1.45,1.5,.2),MAT.green);writingBack.position.set(0,1.35,1.52);g.add(writingBack);const page=new THREE.Mesh(new THREE.BoxGeometry(.78,.025,.54),MAT.paper);page.position.set(-.35,1.46,-.42);page.rotation.y=.12;g.add(page);const ink=new THREE.Mesh(new THREE.CylinderGeometry(.12,.15,.22,10),MAT.black);ink.position.set(.72,1.52,-.4);g.add(ink);if(carrel){for(const dx of [-1.82,1.82]){const side=new THREE.Mesh(new THREE.BoxGeometry(.12,2.35,2.7),MAT.darkWood);side.position.set(dx,1.18,-.1);g.add(side)}const hood=new THREE.Mesh(new THREE.BoxGeometry(3.75,.15,2.7),MAT.darkWood);hood.position.set(0,2.32,-.1);g.add(hood)}collider(x,z,carrel?3.9:3.6,3.2,carrel?'study carrel':'writing desk');const deskSeatData=registerSeat([writingChair,writingBack],g,new THREE.Vector3(0,1.32,.92),0,{title:carrel?'A private study carrel':'A reader’s writing desk',author:carrel?'Outside sounds soften when you sit inside.':'Ink, paper, and a chair for arguing in the margins.',categories:carrel?['Mystery','Philosophy','Conscience']:['Philosophy','Poetry','Society','Satire']});decorateSeat(g,[writingChair,writingBack],deskSeatData,'painted',{height:1.9,z:1});return g}
    const correspondenceFurniture=writingDesk(-8,14,false);writingDesk(-14,15,true);
    // The returns desk: a small stand that keeps a physical stack of whatever is currently being read, and what has been finished.
    function readingStandBook(book,x,z,layer,baseY,turn=0){const bm=new THREE.Mesh(new THREE.BoxGeometry(1.25,1.65,.22),new THREE.MeshStandardMaterial({map:coverTexture(book),roughness:.68}));const h=book.id%97,jx=Math.sin(h*12.9898+layer*3.7)*.07,jz=Math.cos(h*78.233+layer*1.3)*.07,yaw=turn+Math.sin(h*4.51+layer)*.4;bm.position.set(x+jx,baseY+layer*.235+.11,z+jz);const q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),-Math.PI/2);q.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),yaw));bm.quaternion.copy(q);scene.add(bm);bm.userData={type:'book',book,loaded:true,readingStand:true,home:{position:bm.position.clone(),quaternion:bm.quaternion.clone(),parent:scene}};interactables.push(bm);return bm}
    const readingStandMeshes=[],placedBookIds=new Set();function clearReadingStand(){for(const bm of readingStandMeshes){if(bm===selected||bm.userData.singleCopyMoved)continue;const idx=interactables.indexOf(bm);if(idx>=0)interactables.splice(idx,1);scene.remove(bm);bm.geometry.dispose();bm.material.dispose()}readingStandMeshes.length=0}
    const readingStandPos={x:7.6,z:5.6,top:1.78};
    const readingStandTopMat=new THREE.MeshStandardMaterial({color:0x3a2213,roughness:.72});addBox(1.45,.09,2.8,readingStandTopMat,readingStandPos.x,1.7,readingStandPos.z,false);for(const dz of [-1.34,0,1.34])addBox(1.5,.24,.08,MAT.darkWood,readingStandPos.x,1.82,readingStandPos.z+dz,false);
    const readingHit=box(1.3,.5,1.4,new THREE.MeshBasicMaterial({transparent:true,opacity:.001,depthWrite:false}),readingStandPos.x,1.5,readingStandPos.z-.55,false),finishedHit=box(1.3,.5,1.4,new THREE.MeshBasicMaterial({transparent:true,opacity:.001,depthWrite:false}),readingStandPos.x,1.5,readingStandPos.z+.55,false);
    const readingPileData={type:'object',title:'An empty side of the stand',author:'Nothing is left open here just now.',action:'EXAMINE'},finishedPileData={type:'object',title:'Nothing shelved here yet',author:'No book has been read to its final page yet.',action:'EXAMINE'};readingHit.userData=readingPileData;finishedHit.userData=finishedPileData;interactables.push(readingHit,finishedHit);
    function refreshReadingStack(){if(selected&&readingStandMeshes.includes(selected))return;clearReadingStand();const order=[...new Set([...awakenedBooks,...deskBooks])].reverse(),readingList=[],finishedList=[];for(const id of order){const b=books.find(bk=>bk.id===id);if(!b||placedBookIds.has(id))continue;if(b.progress>=.95)finishedList.push(b);else if(deskBooks.has(id)||b.progress>.02)readingList.push(b)}const showReading=readingList.slice(0,5),showFinished=finishedList.slice(0,5);showReading.forEach((b,i)=>readingStandMeshes.push(readingStandBook(b,readingStandPos.x,readingStandPos.z-.55,i,readingStandPos.top,Math.PI/2)));showFinished.forEach((b,i)=>readingStandMeshes.push(readingStandBook(b,readingStandPos.x,readingStandPos.z+.55,i,readingStandPos.top,Math.PI/2)));const totalFinished=books.filter(b=>b.progress>=.95).length;readingPileData.title=showReading.length?'Currently reading':'An empty side of the stand';readingPileData.author=showReading.length?`Left at the desk or partway through: ${showReading.map(b=>b.title).join(', ')}.`:'Nothing is left open here just now.';finishedPileData.title=showFinished.length?'Recently finished':'Nothing shelved here yet';finishedPileData.author=totalFinished?`${totalFinished} volume${totalFinished===1?'':'s'} read to the last page. Most recent: ${showFinished.map(b=>b.title).join(', ')}.`:'No book has been read to its final page yet.'}
    refreshReadingStack();
    const rockingChair=new THREE.Group();rockingChair.position.set(-3.5,0,-23);scene.add(rockingChair);const rockerSeat=new THREE.Mesh(new THREE.BoxGeometry(1.65,.3,1.45),MAT.green);rockerSeat.position.y=.85;rockingChair.add(rockerSeat);const rockerBack=new THREE.Mesh(new THREE.BoxGeometry(1.65,2,.22),MAT.wood);rockerBack.position.set(0,1.65,.6);rockerBack.rotation.x=-.12;rockingChair.add(rockerBack);const rockerParts=[rockerSeat,rockerBack];for(const x of [-.68,.68]){const runner=new THREE.Mesh(new THREE.BoxGeometry(.14,.12,2.4),MAT.darkWood);runner.position.set(x,.16,0);runner.rotation.x=.08;rockingChair.add(runner)}collider(-3.5,-23,2,2.5,'rocking chair');const rockingSeatData=registerSeat([rockerSeat,rockerBack],rockingChair,new THREE.Vector3(0,1.34,-.05),Math.PI,{title:'An old Victorian rocking chair',author:'It continues rocking after its reader leaves.',categories:['Ghosts','Gothic','Memory']});decorateSeat(rockingChair,rockerParts,rockingSeatData,'armchair',{height:2.15});
    const reservedChair=chair(7,22,Math.PI,{model:'feature',type:'object',title:'A chair reserved for someone absent',author:'A silver card says: PLEASE DO NOT DISTURB THE READER.',action:'EXAMINE'}),invisibleReader=new THREE.Group();reservedChair.add(invisibleReader);const ghostMat=new THREE.MeshBasicMaterial({color:0xbcc9d8,transparent:true,opacity:.08,depthWrite:false});const ghostBody=new THREE.Mesh(new THREE.SphereGeometry(.55,12,8),ghostMat);ghostBody.scale.set(.75,1.5,.65);ghostBody.position.y=1.55;invisibleReader.add(ghostBody);const ghostHead=new THREE.Mesh(new THREE.SphereGeometry(.27,12,8),ghostMat);ghostHead.position.y=2.45;invisibleReader.add(ghostHead);invisibleReader.visible=false;
    // paintings and mysterious note
    const paintingTextureLoader=new THREE.TextureLoader(),paintingTextures=new Map();
    const pendingPaintings=[];
    function painting(x,y,z,w,h,rot=0,colors=['#342016','#a87b45'],imageUrl='',hinged=false){const tex=canvasTexture((c,W,H)=>{const g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,colors[0]);g.addColorStop(1,'#080706');c.fillStyle=g;c.fillRect(0,0,W,H);c.fillStyle=colors[1];c.globalAlpha=.45;c.beginPath();c.ellipse(W*.5,H*.38,W*.19,H*.28,0,0,7);c.fill();c.fillRect(W*.32,H*.65,W*.36,H*.3);c.globalAlpha=.3;c.fillStyle='#e3c68f';c.fillRect(0,H*.78,W,H*.03)},256,320),group=new THREE.Group();group.position.set(x,y,z);group.rotation.y=rot;scene.add(group);const offset=hinged?w/2:0,frame=new THREE.Group(),rail=.23,depth=.18,panel=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:tex,color:0xf7f0df,roughness:.91,emissive:0xffffff,emissiveMap:tex,emissiveIntensity:.16,side:THREE.DoubleSide})),backing=new THREE.Mesh(new THREE.BoxGeometry(w,h,.06),MAT.darkWood);frame.position.set(offset,0,.08);
      const timber=mergedBoxParts([[w+rail*2,rail,depth,0,h/2+rail/2,0],[w+rail*2,rail,depth,0,-h/2-rail/2,0],[rail,h,depth,-w/2-rail/2,0,0],[rail,h,depth,w/2+rail/2,0,0]],MAT.darkWood);
      const brass=mergedBoxParts([[w,.045,.035,0,h/2-.024,.12],[w,.045,.035,0,-h/2+.024,.12],[.045,h-.09,.035,-w/2+.024,0,.12],[.045,h-.09,.035,w/2-.024,0,.12]],MAT.brass);
      frame.add(timber,brass);panel.position.set(offset,0,.07);backing.position.set(offset,0,-.03);group.add(backing,panel,frame);
      const applyTexture=image=>{if(panel.material.map!==image){panel.material.map.dispose();panel.material.map=image;panel.material.emissiveMap=image;panel.material.needsUpdate=true}};
      if(imageUrl?.isTexture)applyTexture(imageUrl);
      else if(imageUrl)pendingPaintings.push({group,load:()=>{let cached=paintingTextures.get(imageUrl);if(!cached){cached={image:null,waiting:[]};paintingTextures.set(imageUrl,cached);paintingTextureLoader.load(imageUrl,image=>{image.colorSpace=THREE.SRGBColorSpace;image.anisotropy=2;cached.image=image;for(const waiting of cached.waiting)waiting(image);cached.waiting.length=0},undefined,()=>{cached.waiting.length=0})}if(cached.image)applyTexture(cached.image);else cached.waiting.push(applyTexture)}});
      return{group,panel,frame}}
    // Paintings used to download all at once on entry, including rooms at the far end of the building (about 2 MB).
    // Each now shows its painted placeholder until the reader comes within about thirty metres, then loads.
    const PAINTING_LOAD_DISTANCE=30,paintingSpot=new THREE.Vector3();let nextPaintingCheck=0;
    function loadNearbyPaintings(t){if(t<nextPaintingCheck||!pendingPaintings.length)return;nextPaintingCheck=t+.5;for(let i=pendingPaintings.length-1;i>=0;i--){const entry=pendingPaintings[i];entry.group.getWorldPosition(paintingSpot);if(paintingSpot.distanceTo(player.pos)<PAINTING_LOAD_DISTANCE){pendingPaintings.splice(i,1);entry.load()}}}
    painting(8,5,-30.05,2.6,3.5,0,['#263324','#b58249'],'assets/moonlit-bay.jpg');const secretPortrait=painting(18.65,5,17.175,5.65,9.4,-Math.PI/2,['#201f38','#8a6240'],'assets/secret-librarian-portrait.jpg',true);painting(-18.65,4,19,3.5,4.5,Math.PI/2,['#3b1717','#9b7748'],'assets/botanist.jpg');
    secretPortrait.panel.userData={type:'portrait',title:'A portrait hung slightly askew',author:'A cold thread of air touches the frame.',action:'OPEN'};interactables.push(secretPortrait.panel);const portraitDoorCollider=collider(19,20,.6,6,'portrait door');
    addBox(.5,10,1,MAT.stone,19,5,17,false);addBox(.5,10,1,MAT.stone,19,5,23,false);addBox(.5,1,6,MAT.stone,19,9.6,20,false);addBox(.5,1,6,MAT.stone,19,.4,20,false);
    function galleryPicture(x,y,z,w,h,rot,image,title,inscription){const art=painting(x,y,z,w,h,rot,['#17120f','#8d6b3e'],image);art.panel.userData={type:'object',title,author:inscription,action:'EXAMINE'};interactables.push(art.panel);return art}
    const veiledWidow=galleryPicture(-18.65,4,-20,3.4,4.8,Math.PI/2,'assets/portrait-veiled-widow.jpg','The Veiled Widow','The plaque is warm. Her painted eyes are not.');
    // The listening corner: a gramophone that reads aloud the last book you opened (or any recorded book).
    const gramophone=(()=>{const g=new THREE.Group();g.position.set(-18.25,0,10);g.rotation.y=Math.PI/2;scene.add(g);
      const part=(geometry,material,x,y,z)=>{const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);g.add(mesh);return mesh};
      const data={type:'gramophone',title:'The gramophone',author:'A brass horn and a record that never needs turning. It will read aloud the last book you opened.',action:'PLAY'};
      part(new THREE.BoxGeometry(1.1,.08,.72),MAT.darkWood,0,.78,0);for(const [x,z] of [[-.48,-.3],[.48,-.3],[-.48,.3],[.48,.3]])part(new THREE.BoxGeometry(.07,.76,.07),MAT.darkWood,x,.38,z);
      const cabinet=part(new THREE.BoxGeometry(.56,.2,.5),MAT.wood,0,.92,.02),platter=part(new THREE.CylinderGeometry(.21,.21,.025,28),new THREE.MeshStandardMaterial({color:0x111111,roughness:.35}),0,1.035,.02),label=part(new THREE.CylinderGeometry(.06,.06,.028,20),new THREE.MeshStandardMaterial({color:0x8a2a22,roughness:.6}),0,1.04,.02);
      const neck=part(new THREE.CylinderGeometry(.025,.035,.42,10),MAT.brass,.2,1.2,-.16);neck.rotation.z=-.5;
      const horn=part(new THREE.CylinderGeometry(.36,.03,.62,28,1,true),new THREE.MeshStandardMaterial({color:0xb08a45,metalness:.75,roughness:.32,side:THREE.DoubleSide}),.42,1.52,-.2);horn.rotation.z=-.95;
      const arm=part(new THREE.BoxGeometry(.24,.02,.02),MAT.brass,.1,1.07,.14);arm.rotation.y=.5;
      const plate=part(new THREE.PlaneGeometry(.62,.16),new THREE.MeshStandardMaterial({map:canvasTexture((c,w,h)=>{c.fillStyle='#24170d';c.fillRect(0,0,w,h);c.strokeStyle='#d7ae60';c.lineWidth=5;c.strokeRect(4,4,w-8,h-8);c.fillStyle='#ffe2a0';c.textAlign='center';c.font='bold 30px Georgia';c.fillText('THE LISTENING CORNER',w/2,44)},420,64)}),0,.66,.37);
      for(const mesh of [cabinet,platter,label,neck,horn,arm,plate]){mesh.userData=data;interactables.push(mesh)}
      collider(-18.25,10,.9,1.3,'gramophone table');return {platter}})();
    galleryPicture(-51.68,3.5,-7.15,3.1,4.45,Math.PI/2,'assets/portrait-impossible-stairs.jpg','The Stair That Returns','Every landing appears to lead back to this room.');
    galleryPicture(-17.62,-3,-58,3.4,4.8,Math.PI/2,'assets/portrait-lantern-librarian.jpg','The Last Librarian','She carries a lantern into an aisle the catalogue denies exists.');
    function vernePortalTexture(){return canvasTexture((c,W,H)=>{
      // A foxed nineteenth-century steel engraving, rather than a modern poster.
      c.fillStyle='#d6c294';c.fillRect(0,0,W,H);const wash=c.createRadialGradient(W*.47,H*.38,W*.05,W*.5,H*.44,W*.68);wash.addColorStop(0,'rgba(255,248,214,.34)');wash.addColorStop(1,'rgba(66,43,21,.28)');c.fillStyle=wash;c.fillRect(0,0,W,H);
      c.strokeStyle='#2d2318';c.lineWidth=7;c.strokeRect(18,18,W-36,H-36);c.lineWidth=2;c.strokeRect(29,29,W-58,H-58);c.strokeRect(38,38,W-76,H-76);
      for(const [x,y,sx,sy] of [[46,46,1,1],[W-46,46,-1,1],[46,H-46,1,-1],[W-46,H-46,-1,-1]]){c.save();c.translate(x,y);c.scale(sx,sy);c.beginPath();c.moveTo(0,28);c.bezierCurveTo(5,5,9,5,28,0);c.bezierCurveTo(12,13,14,20,0,28);c.stroke();c.restore()}
      c.save();c.beginPath();c.rect(48,70,W-96,H-158);c.clip();c.strokeStyle='rgba(48,35,22,.26)';c.lineWidth=1;for(let i=-H;i<W+H;i+=9){c.beginPath();c.moveTo(i,58);c.lineTo(i-H,H-70);c.stroke()}for(let y=H*.5;y<H*.82;y+=13){c.beginPath();c.moveTo(40,y);c.bezierCurveTo(W*.27,y-16,W*.7,y+18,W-40,y-4);c.stroke()}
      c.strokeStyle='#2a2117';c.fillStyle='rgba(214,194,148,.88)';c.lineWidth=4;
      c.beginPath();c.arc(W*.76,H*.19,W*.095,0,Math.PI*2);c.fill();c.stroke();for(let i=0;i<10;i++){const a=i*.63;c.beginPath();c.arc(W*.76+Math.cos(a)*W*.048,H*.19+Math.sin(a)*W*.048,3+i%3,0,Math.PI*2);c.stroke()}
      c.beginPath();c.ellipse(W*.24,H*.23,W*.105,H*.14,0,0,Math.PI*2);c.fill();c.stroke();for(let i=-3;i<=3;i++){c.beginPath();c.moveTo(W*(.15+i*.006),H*(.2+i*.008));c.quadraticCurveTo(W*.24,H*(.27+i*.006),W*(.33-i*.006),H*(.2+i*.008));c.stroke()}c.beginPath();c.moveTo(W*.17,H*.34);c.lineTo(W*.2,H*.39);c.lineTo(W*.28,H*.39);c.lineTo(W*.31,H*.34);c.strokeRect(W*.2,H*.385,W*.08,H*.045);c.stroke();
      c.save();c.translate(W*.5,H*.69);c.beginPath();c.ellipse(0,0,W*.3,H*.073,0,0,Math.PI*2);c.fill();c.stroke();c.beginPath();c.moveTo(-W*.3,0);c.lineTo(-W*.39,-H*.042);c.lineTo(-W*.37,H*.038);c.closePath();c.fill();c.stroke();c.beginPath();c.moveTo(W*.02,-H*.073);c.lineTo(W*.065,-H*.12);c.lineTo(W*.12,-H*.073);c.stroke();for(const px of [-.18,-.06,.06,.18]){c.beginPath();c.arc(W*px,0,W*.021,0,Math.PI*2);c.stroke()}for(let i=-5;i<=5;i++){c.beginPath();c.moveTo(-W*.27,H*(.012+i*.004));c.lineTo(W*.26,H*(-.01+i*.004));c.stroke()}c.restore();c.restore();
      c.fillStyle='#2a2117';c.textAlign='center';c.font='small-caps bold 25px Georgia';c.fillText('VOYAGES EXTRAORDINAIRES',W/2,H*.91);c.font='italic 16px Georgia';c.fillText('MER  •  TERRE  •  LUNE',W/2,H*.945)
    },512,640)}
    function haggardPortalTexture(){return canvasTexture((c,W,H)=>{
      c.fillStyle='#c8b37e';c.fillRect(0,0,W,H);c.strokeStyle='#493822';c.lineWidth=6;c.strokeRect(20,20,W-40,H-40);c.lineWidth=2;c.strokeRect(31,31,W-62,H-62);
      c.globalAlpha=.22;for(let i=-H;i<W+H;i+=10){c.beginPath();c.moveTo(i,42);c.lineTo(i-H,H-45);c.stroke()}c.globalAlpha=1;
      c.lineWidth=4;c.beginPath();c.moveTo(W*.12,H*.76);c.bezierCurveTo(W*.27,H*.5,W*.28,H*.34,W*.45,H*.23);c.bezierCurveTo(W*.59,H*.14,W*.75,H*.38,W*.88,H*.17);c.stroke();
      c.lineWidth=2;for(const y of [.64,.69,.74]){c.beginPath();c.moveTo(W*.12,H*y);c.bezierCurveTo(W*.35,H*(y-.05),W*.58,H*(y+.04),W*.88,H*(y-.03));c.stroke()}
      c.setLineDash([9,8]);c.strokeStyle='#7b281e';c.lineWidth=4;c.beginPath();c.moveTo(W*.19,H*.73);c.quadraticCurveTo(W*.34,H*.62,W*.32,H*.47);c.quadraticCurveTo(W*.3,H*.32,W*.49,H*.29);c.quadraticCurveTo(W*.66,H*.25,W*.73,H*.39);c.stroke();c.setLineDash([]);
      c.strokeStyle='#493822';c.lineWidth=3;c.beginPath();c.arc(W*.73,H*.39,16,0,Math.PI*2);c.moveTo(W*.72,H*.37);c.lineTo(W*.75,H*.42);c.moveTo(W*.75,H*.37);c.lineTo(W*.72,H*.42);c.stroke();
      for(const [x,y] of [[.22,.43],[.57,.58],[.78,.66]]){c.beginPath();c.moveTo(W*x-12,H*y+18);c.lineTo(W*x,H*y-18);c.lineTo(W*x+13,H*y+18);c.closePath();c.stroke()}
      c.fillStyle='#352719';c.textAlign='center';c.font='small-caps bold 27px Georgia';c.fillText('SURVEY OF AN UNNAMED COUNTRY',W/2,H*.89);c.font='italic 17px Georgia';c.fillText('route incomplete — trace by hand',W/2,H*.935)
    },512,640)}
    function doyleClueTexture(){return canvasTexture((c,W,H)=>{
      c.fillStyle='#382b20';c.fillRect(0,0,W,H);c.strokeStyle='#b48b4d';c.lineWidth=6;c.strokeRect(15,15,W-30,H-30);c.fillStyle='#d7c79e';c.fillRect(42,44,W-84,H-88);c.strokeStyle='#5b4530';c.lineWidth=2;
      for(const [x,y,a] of [[.25,.27,-.12],[.67,.23,.08],[.48,.58,-.04]]){c.save();c.translate(W*x,H*y);c.rotate(a);c.strokeRect(-58,-45,116,90);c.fillStyle='#eee3c4';c.fillRect(-53,-40,106,80);c.fillStyle='#4a3927';c.font='bold 18px Georgia';c.textAlign='center';c.fillText(y>.5?'RED THREAD':x<.5?'FOOTPRINT':'STOPPED WATCH',0,-15);c.font='italic 14px Georgia';c.fillText(y>.5?'from a torn cuff':x<.5?'heel worn left':'quarter past two',0,15);c.restore()}
      c.strokeStyle='#7f201d';c.lineWidth=3;c.beginPath();c.moveTo(W*.25,H*.33);c.lineTo(W*.48,H*.51);c.lineTo(W*.67,H*.29);c.stroke();c.beginPath();c.arc(W*.48,H*.72,48,0,Math.PI*2);c.stroke();c.beginPath();c.arc(W*.48,H*.72,27,0,Math.PI*2);c.stroke();c.moveTo(W*.515,H*.755);c.lineTo(W*.63,H*.88);c.stroke();
      c.fillStyle='#34261a';c.textAlign='center';c.font='small-caps bold 24px Georgia';c.fillText('THE FACTS, BEFORE THE THEORY',W/2,H*.95)
    },512,640)}
    galleryPicture(18.65,4,-20,3.5,4.9,-Math.PI/2,'assets/painting-journey-caravan.jpg','The Long Road East','The caravan has crossed the same moonlit pass for a hundred years.');
    galleryPicture(18.65,7,27,3.5,4.9,-Math.PI/2,'assets/painting-wonder-garden.jpg','The Garden Between Verses','A place for poetry, wonder, and paths that only appear at night.');
    addBox(9,.4,8,MAT.wood,23.5,4.8,20,false);addBox(.5,7,8,MAT.stone,28,8.5,20);addBox(9,7,.5,MAT.stone,23.5,8.5,16);addBox(9,7,.5,MAT.stone,23.5,8.5,24);const portraitRug=rug(23.5,20,6,5,0x232f3c);portraitRug.position.y=5.021;addLamp(26.8,8.6,20,.7);
    const portraitDesk=box(2.6,.18,1.4,MAT.darkWood,24,5.9,20,false);for(const dx of [-1.1,1.1])for(const dz of [-.5,.5])box(.14,.9,.14,MAT.wood,24+dx,5.4,20+dz,false);const portraitLedger=box(.9,.08,.65,MAT.paper,24,6.06,20,false);portraitLedger.rotation.y=-.24;portraitLedger.userData={type:'room-record',recordId:'portrait',title:'A ledger beneath the portrait',author:'Its names are written in several different hands.',action:'READ'};interactables.push(portraitLedger);
    const note=box(.72,.03,.5,MAT.paper,7.35,1.66,3.55,false);note.rotation.y=.4;note.userData={type:'note',title:'A folded note',author:'“The west wall remembers what the catalogue forgets.”',secretId:'folded-note'};interactables.push(note);

    // shelves and cover-facing books
    let bookCursor=0,addedBookCursor=78,secretShelf=null,shelfArrivalCursor=0;
    const nextShelfArrival=()=>newArrivals.list('shelves')[shelfArrivalCursor++]||null;
    const shelvedBookGeometry=new THREE.BoxGeometry(1.25,1.65,.22);
    // Real shelves are uneven: a handful of book sizes (chosen per title, so a book is always the same
    // size), the odd volume leaning on its neighbour, and plain spine-out volumes filling the gaps.
    const BOOK_SIZES=[[1.25,1.65,.22],[1.16,1.52,.27],[1.3,1.74,.19],[1.08,1.44,.31],[1.21,1.6,.24]].map(([w,h,d])=>({w,h,d,geometry:new THREE.BoxGeometry(w,h,d)}));
    const bookSize=book=>BOOK_SIZES[Math.abs((book.id*2654435761)>>>0)%BOOK_SIZES.length];
    function settleShelvedBook(bm,book,lean=true){const size=bookSize(book);bm.geometry=size.geometry;bm.position.y-=(1.65-size.h)/2;if(lean&&(book.id%9===4)){const dir=book.id%2?1:-1;bm.rotation.z=dir*.075;bm.position.x+=dir*.05}}
    const spineTexture=canvasTexture((c,w,h)=>{c.fillStyle='#e8e2d6';c.fillRect(0,0,w,h);const shade=c.createLinearGradient(0,0,w,0);shade.addColorStop(0,'rgba(0,0,0,.28)');shade.addColorStop(.5,'rgba(255,255,255,.08)');shade.addColorStop(1,'rgba(0,0,0,.3)');c.fillStyle=shade;c.fillRect(0,0,w,h);c.fillStyle='rgba(214,176,98,.95)';for(const y of [h*.1,h*.14,h*.86,h*.9])c.fillRect(0,y,w,h*.018);c.fillRect(w*.2,h*.42,w*.6,h*.12)},32,128);
    const spineMaterial=new THREE.MeshStandardMaterial({map:spineTexture,roughness:.78}),spineGeometry=new THREE.BoxGeometry(1,1,1),SPINE_COLOURS=[0x5b1d1d,0x1f3a2c,0x1d2944,0x4a3018,0x3a2436,0x6b4a22,0x2c2a26,0x44552f].map(hex=>new THREE.Color(hex));
    function fillShelfGaps(g,gaps){const spines=[];for(const [x0,x1,y] of gaps){let x=x0+.02;while(x<x1-.1){const t=.09+Math.random()*.06;if(x+t>x1-.02)break;const h=1.15+Math.random()*.45;spines.push([x+t/2,y+h/2,t,h]);x+=t+.004}}if(!spines.length)return;const mesh=new THREE.InstancedMesh(spineGeometry,spineMaterial,spines.length),m=new THREE.Matrix4(),q=new THREE.Quaternion(),sc=new THREE.Vector3(),pos=new THREE.Vector3();spines.forEach(([x,y,t,h],i)=>{pos.set(x,y,.34);sc.set(t,h,.46);m.compose(pos,q,sc);mesh.setMatrixAt(i,m);mesh.setColorAt(i,SPINE_COLOURS[Math.floor(Math.random()*SPINE_COLOURS.length)])});mesh.instanceMatrix.needsUpdate=true;g.add(mesh)}
    const shelfPlaques=new Map();function shelfFinish(g,width,height,neglect=0){if(lowBandwidth)return;const tag=neglect>=2?'UNREAD · KEEP':'READING ROOM';let material=shelfPlaques.get(tag);if(!material){const texture=canvasTexture((c,w,h)=>{c.fillStyle=neglect>=2?'#372e29':'#2d2017';c.fillRect(0,0,w,h);c.strokeStyle=neglect>=2?'#7c6a50':'#bd975b';c.lineWidth=6;c.strokeRect(6,6,w-12,h-12);c.fillStyle='#ddc39a';c.textAlign='center';c.font='bold 29px Georgia';c.fillText(tag,w/2,42)},320,56);material=new THREE.MeshStandardMaterial({map:texture,roughness:.8,side:THREE.DoubleSide});shelfPlaques.set(tag,material)}const hardware=mergedBoxParts([[width-.3,.045,.06,0,height-.13,.43],[.07,.4,.08,-width/2+.18,height-.28,.43],[.07,.4,.08,width/2-.18,height-.28,.43]],neglect>=2?MAT.gold:MAT.brass);g.add(hardware);const plate=new THREE.Mesh(new THREE.PlaneGeometry(1.45,.25),material);plate.position.set(0,height-.07,.49);g.add(plate)}
    function shelf(x,z,rot=0,count=6,secret=false,level=0,lighter=false){const g=new THREE.Group();g.position.set(x,level,z);g.rotation.y=rot;scene.add(g);const W=7.2,H=7.8,D=.8,structure=mergedBoxParts([[W,.18,D,0,.2,0],[W,.18,D,0,2.05,0],[W,.18,D,0,3.9,0],[W,.18,D,0,5.75,0],[W,.18,D,0,7.6,0],[.25,H,D,-W/2,H/2,0],[.25,H,D,W/2,H/2,0]],MAT.darkWood),back=mergedBoxParts([[W,H,.18,0,H/2,-.35]],MAT.wood2);g.add(structure,back);shelfFinish(g,W,H);for(const panel of [structure,back]){panel.userData={type:'book-shelf',title:'A bookshelf',author:'Set the book back among the other volumes.',action:'SHELVE BOOK',shelf:g};interactables.push(panel)}
      // The secret bookcase is filled with its own new arrivals (four full columns once there are sixteen); other
      // bookcases that have run through the main catalogue take new arrivals before repeating any book.
      const cols=Math.ceil(count/4),secretFill=secret?newArrivals.list('secret'):null,secretCols=secret?Math.max(cols,Math.min(4,Math.floor(secretFill.length/4))):0,ownFill=secret&&secretFill.length>=secretCols*4;
      for(let row=0;row<4;row++)for(let col=0;col<(secret?secretCols:(lighter?3:4));col++){let b;if(ownFill)b=secretFill[row*secretCols+col];else if(col>=cols){if(addedBookCursor>=books.length)continue;b=books[addedBookCursor++]}else b=bookCursor<78?books[bookCursor++]:(nextShelfArrival()||books[36+((row*cols+col)%12)]);const mat=bookMaterial(b);const bm=new THREE.Mesh(shelvedBookGeometry,mat);bm.position.set(lighter?-2.3+col*2.3:-2.65+col*1.72,1.14+row*1.85,.48);bm.rotation.x=(col%2?-.02:.018);if(!secret)settleShelvedBook(bm,b);g.add(bm);bm.userData={type:'book',book:b,home:null,loaded:false};interactables.push(bm);coverQueue.push(bm);if(secret&&row===2&&col===1){bm.userData.secret=true;bm.userData.action='PULL';bm.position.x+=.12;bm.position.z=.76;bm.rotation.z=-.18;bm.material.emissive=new THREE.Color(0x3b210d);bm.material.emissiveIntensity=.42}bm.userData.home={position:bm.position.clone(),quaternion:bm.quaternion.clone(),parent:g}}
      if(!secret||secretCols===4){const perRow=lighter?3:4,spacing=lighter?2.3:1.72,first=lighter?-2.3:-2.65,gaps=[];for(let row=0;row<4;row++){const y=.29+row*1.85;gaps.push([-W/2+.13,first-.66,y]);for(let col=0;col<perRow-1;col++)gaps.push([first+col*spacing+.66,first+(col+1)*spacing-.66,y]);gaps.push([first+(perRow-1)*spacing+.66,W/2-.13,y])}fillShelfGaps(g,gaps)}
      g.userData.collider=collider(x,z,Math.abs(Math.cos(rot))*W+Math.abs(Math.sin(rot))*D,Math.abs(Math.sin(rot))*W+Math.abs(Math.cos(rot))*D);return g}
    function curatedShelf(ids,x,z,rot=0,neglect=0){
      const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;scene.add(g);const W=9,H=4.5,D=.8,structure=mergedBoxParts([[W,.18,D,0,.2,0],[W,.18,D,0,2.25,0],[W,.18,D,0,4.4,0],[.25,H,D,-W/2,H/2,0],[.25,H,D,W/2,H/2,0]],MAT.darkWood),back=mergedBoxParts([[W,H,.18,0,H/2,-.35]],MAT.wood2);g.add(structure,back);shelfFinish(g,W,H,neglect);for(const panel of [structure,back]){panel.userData={type:'book-shelf',title:'A bookshelf',author:'Set the book back among the other volumes.',action:'SHELVE BOOK',shelf:g};interactables.push(panel)}
      ids.forEach((id,i)=>{const b=books.find(book=>book.id===id);if(!b)return;const row=Math.floor(i/5),col=i%5,bm=new THREE.Mesh(shelvedBookGeometry,bookMaterial(b)),wobble=Math.sin((id%997)*.73+i*2.17),fallen=neglect>=2&&i>=ids.length-(neglect-1);if(fallen){bm.position.set(-2.5+(i%3)*2.15,.14,1.25+(i%2)*.58);bm.rotation.set(-Math.PI/2,wobble*.22,wobble*.48)}else{bm.position.set(-3.5+col*1.75+wobble*neglect*.11,1.2+row*2.05-(i%2)*neglect*.045,.48+(i%3)*neglect*.035);bm.rotation.set((col%2?-.018:.015)+wobble*neglect*.035,0,wobble*neglect*.13);settleShelvedBook(bm,b,!neglect)}g.add(bm);bm.userData={type:'book',book:b,loaded:false,home:{position:bm.position.clone(),quaternion:bm.quaternion.clone(),parent:g}};interactables.push(bm);coverQueue.push(bm)});
      if(neglect>=2){const brokenPlank=new THREE.Mesh(new THREE.BoxGeometry(W*.42,.13,D*.7),MAT.darkWood);brokenPlank.position.set(1.7,2.13,.35);brokenPlank.rotation.z=.055*neglect;brokenPlank.rotation.y=-.08*neglect;g.add(brokenPlank)}
      g.userData.collider=collider(x,z,Math.abs(Math.cos(rot))*W+Math.abs(Math.sin(rot))*D,Math.abs(Math.sin(rot))*W+Math.abs(Math.cos(rot))*D);return g
    }
    function looseBook(book,x,y,z,rot=0,secretId=''){const bm=new THREE.Mesh(new THREE.BoxGeometry(1.25,1.65,.22),bookMaterial(book)),safeY=Math.max(y,floorHeight(x,z)+.68);bm.position.set(x,safeY,z);bm.rotation.set(0,rot,Math.PI/2);bm.castShadow=true;scene.add(bm);bm.userData={type:'book',book,loaded:false,secretId,home:{position:bm.position.clone(),quaternion:bm.quaternion.clone(),parent:scene}};interactables.push(bm);coverQueue.push(bm);return bm}
    // Lighter entrance trial: retain all five shelves, with three accessible books per row instead of four.
    shelf(-7.3,-17,0,12,false,0,true);shelf(0,-17,0,12,false,0,true);shelf(7.3,-17,0,12,false,0,true);shelf(-15,-7,Math.PI/2,8,false,0,true);shelf(15,-7,-Math.PI/2,8,false,0,true);shelf(-28,-12,0,6);shelf(-28,8,Math.PI,6);shelf(28,-12,0,6);shelf(28,8,Math.PI,6);
    // Hidden passages: each Reading Room is reached only by finding its own scattered secret in the main hall or wings - no obvious door, no shared lobby.
    // Three small in-house engravings replace unrelated pictures and empty author-room canvases.
    function periodEngraving(kind){return canvasTexture((c,W,H)=>{const paper=c.createLinearGradient(0,0,W,H);paper.addColorStop(0,'#d5c39b');paper.addColorStop(1,'#9e8865');c.fillStyle=paper;c.fillRect(0,0,W,H);const ink='#382b20';c.strokeStyle=ink;c.lineWidth=5;c.strokeRect(19,19,W-38,H-38);c.lineWidth=1.5;c.strokeRect(30,30,W-60,H-60);c.save();c.beginPath();c.rect(44,49,W-88,H-129);c.clip();
      c.fillStyle='rgba(48,37,27,.07)';for(let i=0;i<95;i++){const x=(i*97)%W,y=(i*139)%H;c.fillRect(x,y,1+i%3,1+i%4)}
      c.strokeStyle='rgba(60,42,27,.18)';c.lineWidth=1;for(let i=-H;i<W+H;i+=12){c.beginPath();c.moveTo(i,48);c.lineTo(i-H,H-75);c.stroke()}
      c.strokeStyle=ink;c.fillStyle='rgba(66,47,31,.18)';c.lineWidth=3;
      if(kind==='parlour'){
        c.beginPath();c.moveTo(76,375);c.lineTo(76,125);c.quadraticCurveTo(76,72,130,72);c.lineTo(366,72);c.quadraticCurveTo(420,72,420,125);c.lineTo(420,375);c.stroke();for(const x of [104,390]){c.beginPath();c.moveTo(x,90);c.bezierCurveTo(x+32,177,x-22,255,x+24,383);c.stroke()}
        c.strokeRect(174,120,152,205);c.beginPath();c.moveTo(250,120);c.lineTo(250,325);c.moveTo(174,220);c.lineTo(326,220);c.stroke();for(let i=0;i<8;i++){c.beginPath();c.moveTo(179+i*20,310);c.lineTo(188+i*20,304);c.stroke()}
        c.fillRect(88,376,142,19);c.fillRect(102,396,124,68);c.strokeRect(88,376,142,88);c.fillRect(279,376,142,19);c.fillRect(291,396,119,68);c.strokeRect(279,376,142,88);
        c.beginPath();c.ellipse(255,466,76,15,0,0,Math.PI*2);c.fill();c.stroke();for(const x of [205,301]){c.beginPath();c.moveTo(x,475);c.lineTo(x-5,528);c.stroke()}c.beginPath();c.ellipse(255,448,32,9,0,0,Math.PI*2);c.stroke();c.strokeRect(234,431,42,16);c.beginPath();c.arc(279,439,9,-Math.PI/2,Math.PI/2);c.stroke();c.beginPath();c.moveTo(245,425);c.bezierCurveTo(237,406,262,409,254,393);c.stroke()
      }else if(kind==='inquiry'){
        c.strokeRect(76,104,360,256);c.beginPath();c.arc(256,165,52,0,Math.PI*2);c.stroke();for(let i=0;i<12;i++){const a=i*Math.PI/6;c.beginPath();c.moveTo(256+Math.sin(a)*42,165-Math.cos(a)*42);c.lineTo(256+Math.sin(a)*49,165-Math.cos(a)*49);c.stroke()}c.beginPath();c.moveTo(256,165);c.lineTo(256,132);c.moveTo(256,165);c.lineTo(284,183);c.stroke();for(const [x,y] of [[116,254],[335,248],[161,318]]){c.strokeRect(x,y,75,48);c.beginPath();c.moveTo(x+11,y+14);c.lineTo(x+59,y+14);c.moveTo(x+11,y+26);c.lineTo(x+48,y+26);c.stroke()}
        c.fillRect(62,399,388,19);c.strokeRect(79,418,356,107);c.save();c.translate(208,443);c.rotate(-.12);c.fillStyle='#c7b48b';c.fillRect(-88,-33,176,97);c.strokeRect(-88,-33,176,97);for(let y=-15;y<49;y+=14){c.beginPath();c.moveTo(-69,y);c.lineTo(65,y);c.stroke()}c.restore();c.beginPath();c.arc(340,448,42,0,Math.PI*2);c.stroke();c.lineWidth=7;c.beginPath();c.moveTo(369,477);c.lineTo(409,515);c.stroke();c.lineWidth=3;c.beginPath();c.arc(210,478,12,0,Math.PI*2);c.fill()
      }else{
        c.beginPath();c.arc(256,278,155,0,Math.PI*2);c.stroke();c.beginPath();c.arc(256,278,133,0,Math.PI*2);c.stroke();for(let i=0;i<12;i++){const a=i*Math.PI/6;c.beginPath();c.moveTo(256+Math.sin(a)*134,278-Math.cos(a)*134);c.lineTo(256+Math.sin(a)*151,278-Math.cos(a)*151);c.stroke()}c.beginPath();c.moveTo(256,278);c.lineTo(256,172);c.moveTo(256,278);c.lineTo(341,321);c.stroke();for(const [x,y,r] of [[196,240,37],[322,346,27]]){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.stroke();for(let i=0;i<12;i++){const a=i*Math.PI/6;c.beginPath();c.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r);c.lineTo(x+Math.cos(a)*(r+9),y+Math.sin(a)*(r+9));c.stroke()}}
        c.beginPath();c.moveTo(150,496);c.lineTo(364,496);c.lineTo(342,515);c.lineTo(170,515);c.closePath();c.fill();c.stroke();c.beginPath();c.ellipse(256,424,75,25,0,0,Math.PI*2);c.stroke();c.moveTo(190,424);c.lineTo(176,490);c.moveTo(322,424);c.lineTo(337,490);c.stroke();c.beginPath();c.arc(394,119,23,0,Math.PI*2);c.fill();c.stroke()
      }c.restore();c.fillStyle=ink;c.textAlign='center';c.font='bold 20px Georgia';c.fillText(kind==='parlour'?'AFTER THE CONVERSATION':kind==='inquiry'?'THE UNFINISHED QUESTION':'THE TIME LABORATORY',W/2,H-42)
    },512,640)}
    const inquiryEngraving=plateTexture('assets/plates/paget-a-man-entered.jpg',periodEngraving('inquiry')),parlourEngraving=plateTexture('assets/plates/paget-good-night.jpg',periodEngraving('parlour'));let timeEngraving=null;const getTimeEngraving=()=>timeEngraving||(timeEngraving=plateTexture('assets/plates/wright-great-orrery.jpg',periodEngraving('time')));
    const hiddenPassages=[];function enterHiddenRoom(hp){if(themeRoomKeys.has(hp.destination))buildThemeRooms(hp.destination);player.pos.set(hp.spawn[0],hp.spawn[1],hp.spawn[2]);player.vel.set(0,0,0);player.yaw=hp.yaw;lastSafePosition.copy(player.pos);showNotice(themeArrivals[hp.destination]||'The library rearranges itself around you.',6);sound(170,.9,'triangle',.12)}
    function panelledDoorFace(parent,faceZ,width,height,material=MAT.gold){for(const py of [-height*.24,height*.23]){const frame=new THREE.Mesh(new THREE.BoxGeometry(width*.7,height*.32,.045),material);frame.position.set(width*.5,py,faceZ);parent.add(frame);const inset=new THREE.Mesh(new THREE.BoxGeometry(width*.58,height*.24,.055),MAT.wood2);inset.position.set(width*.5,py,faceZ+.025);parent.add(inset)}const rail=new THREE.Mesh(new THREE.BoxGeometry(width*.72,.07,.07),material);rail.position.set(width*.5,0,faceZ+.02);parent.add(rail)}
    function hiddenDoor(x,z,rot,opts){const group=new THREE.Group();group.position.set(x,0,z);group.rotation.y=rot;scene.add(group);const panel=new THREE.Mesh(new THREE.BoxGeometry(2.25,4.8,.14),MAT.darkWood);panel.geometry.translate(1.125,0,0);panel.position.set(-1.125,2.45,0);group.add(panel);panelledDoorFace(panel,.12,2.25,4.8);for(const side of [-1,1]){const jamb=new THREE.Mesh(new THREE.BoxGeometry(.16,5.1,.24),MAT.gold);jamb.position.set(side*1.2,2.55,.08);group.add(jamb)}const lintel=new THREE.Mesh(new THREE.BoxGeometry(2.55,.16,.24),MAT.gold);lintel.position.set(0,5.02,.08);group.add(lintel);const pediment=new THREE.Mesh(new THREE.TorusGeometry(.58,.07,6,18,Math.PI),MAT.brass);pediment.position.set(0,5.02,.18);group.add(pediment);const backplate=new THREE.Mesh(new THREE.BoxGeometry(.16,.46,.05),MAT.brass);backplate.position.set(1.9,-.05,.17);panel.add(backplate);const handle=new THREE.Mesh(new THREE.SphereGeometry(.12,10,8),MAT.brass);handle.position.set(1.9,-.05,.24);panel.add(handle);const hp={progress:0,destination:opts.destination,spawn:opts.spawn,yaw:opts.yaw,instantEnter:opts.instantEnter===true,passageSound:'doorOpen',apply:p=>{panel.rotation.y=-p*.95}};panel.userData={type:'hidden-passage',hp,title:opts.title,author:opts.author,action:'OPEN'};interactables.push(panel);hiddenPassages.push(hp);return group}function hiddenPainting(x,y,z,w,h,rot,colors,opts){const art=painting(x,y,z,w,h,rot,colors,opts.image);if(opts.texture){art.panel.material.map.dispose();art.panel.material.map=opts.texture;art.panel.material.emissiveMap=opts.texture;art.panel.material.needsUpdate=true}const witness=new THREE.Mesh(new THREE.SphereGeometry(.055,8,6),MAT.brass);witness.position.set(w/2+.12,-h/2-.08,.18);art.frame.add(witness);const hp={progress:0,destination:opts.destination,spawn:opts.spawn,yaw:opts.yaw,passageSound:'picturePassage',apply:p=>{art.group.rotation.z=p*.12}};art.panel.userData={type:'hidden-passage',hp,title:opts.title,author:opts.author,action:opts.action||'PRESS'};interactables.push(art.panel);hiddenPassages.push(hp);return art}function hiddenEvidenceCase(x,y,z,rot,opts){const art=painting(x,y,z,3.4,4.7,rot,['#2c2118','#b48b4d'],opts.image,true),closedRot=rot;const glass=new THREE.Mesh(new THREE.PlaneGeometry(3.05,4.35),MAT.glass);glass.position.set(1.7,0,.12);art.group.add(glass);const hp={progress:0,destination:opts.destination,spawn:opts.spawn,yaw:opts.yaw,passageSound:'picturePassage',apply:p=>{art.group.rotation.y=closedRot-p*.82}};art.panel.userData={type:'hidden-passage',hp,title:opts.title,author:opts.author,action:'ALIGN CLUES'};glass.userData=art.panel.userData;interactables.push(art.panel,glass);hiddenPassages.push(hp);return art}
    hiddenDoor(0,-30.5,0,{destination:'gothic',spawn:[95,0,14],yaw:Math.PI,title:'A narrow door in the south wall',author:'The handle is cold, and a thread of candle smoke escapes the seam.'});
    hiddenPainting(14,4.6,-30.05,2.6,3.5,0,['#241a2c','#6a4a5a'],{texture:inquiryEngraving,destination:'inquiry',spawn:[120,0,14],yaw:Math.PI,title:'A faded engraving of a masked visitor',author:'One line in the drawing appears to continue beyond the frame.'});
    hiddenDoor(-30,9.7,Math.PI,{destination:'chart',spawn:[145,0,14],yaw:Math.PI,title:'A door marked with a compass rose',author:'A scratched brass compass points somewhere beyond the western wing.'});
    hiddenPainting(-36.7,4.4,-8,2.6,3.5,Math.PI/2,['#3a3020','#7a6a3a'],{texture:parlourEngraving,destination:'drawing',spawn:[95,0,46],yaw:Math.PI,title:'An engraving of a leave-taking',author:'The last guest bows toward the door. Behind him, the table is still laid.'});
    hiddenDoor(30,-13.7,0,{destination:'study',spawn:[120,0,46],yaw:Math.PI,title:'A quiet door behind the eastern shelves',author:'The handle is polished by a single, familiar hand.'});
    hiddenPainting(36.7,4.4,-9,2.6,3.5,-Math.PI/2,['#1c2c1e','#4a6a3a'],{image:'assets/painting-wonder-garden.jpg',destination:'garden',spawn:[145,0,46],yaw:Math.PI,title:'A small painted garden, oddly overgrown',author:'New flowers seem to bloom between visits.'});
const verneEngraving=plateTexture('assets/plates/verne-nautilus-window.jpg',vernePortalTexture());hiddenPainting(36.65,4,5,3.5,4.9,-Math.PI/2,['#3a2a19','#b59660'],{texture:verneEngraving,destination:'verne',spawn:[190,0,70],yaw:-Math.PI/2,title:'An old engraving of impossible voyages',author:'De Neuville’s plate from Vingt mille lieues: three men at the Nautilus window, watching the deep. The tarnished frame resembles a hatch.'});
    hiddenPainting(-36.65,4.1,5,3.5,4.9,Math.PI/2,['#4a3922','#b9a36f'],{image:'assets/painting-haggard-lost-kingdom.jpg',destination:'haggard',spawn:[120,0,61],yaw:0,title:'A lost kingdom under old varnish',author:'In the painted mist, a dotted route appears only when the brass frame is warm beneath your finger.',action:'TRACE ROUTE'});
    hiddenEvidenceCase(20,4,-13.65,0,{image:'assets/painting-doyle-consulting-room.jpg',destination:'doyle',spawn:[140,0,95],yaw:0,title:'A gaslit consulting room behind glass',author:'The watch, violin, and sealed papers look unrelated until their reflections align.'});
    hiddenDoor(-14,30.5,Math.PI,{destination:'wells',spawn:[220,0,110],yaw:Math.PI,instantEnter:true,title:'A brass door marked 802,701 A.D.',author:'Its clock has two hands, neither of which agrees with the present.'});
    // Literary Easter eggs: a climbing white volume, a midnight doorway, and creatures glimpsed between shelves.
    const whiteVolumeTex=canvasTexture((c,w,h)=>{const paper=c.createLinearGradient(0,0,w,h);paper.addColorStop(0,'#d8d0bd');paper.addColorStop(.48,'#f0eadc');paper.addColorStop(1,'#bdb3a0');c.fillStyle=paper;c.fillRect(0,0,w,h);c.strokeStyle='#8d7651';c.lineWidth=12;c.strokeRect(18,18,w-36,h-36);c.lineWidth=3;c.strokeRect(32,32,w-64,h-64);c.fillStyle='#5a4932';c.textAlign='center';c.font='bold 28px Georgia';c.fillText('THE WHITE',w/2,105);c.fillText('VOLUME',w/2,143);c.beginPath();c.arc(w/2,245,62,.2,Math.PI*1.7);c.lineWidth=7;c.stroke();c.beginPath();c.moveTo(w/2-58,250);c.quadraticCurveTo(w/2,205,w/2+58,250);c.quadraticCurveTo(w/2,285,w/2-58,250);c.stroke();c.font='italic 18px Georgia';c.fillText('A book without a catalogue mark',w/2,h-55)},384,560),whiteVolumeGroup=new THREE.Group();whiteVolumeGroup.position.set(-7.3,1.14,-16.48);scene.add(whiteVolumeGroup);const whiteVolume=new THREE.Mesh(new THREE.BoxGeometry(1.22,1.62,.2),new THREE.MeshStandardMaterial({map:whiteVolumeTex,roughness:.76,bumpMap:whiteVolumeTex,bumpScale:.012}));whiteVolumeGroup.add(whiteVolume);const whitePages=new THREE.Mesh(new THREE.BoxGeometry(1.08,1.48,.08),new THREE.MeshStandardMaterial({color:0xbeb49e,roughness:1}));whitePages.position.z=-.14;whiteVolumeGroup.add(whitePages);const whiteSpine=new THREE.Mesh(new THREE.BoxGeometry(.12,1.62,.28),new THREE.MeshStandardMaterial({color:0x8d7651,roughness:.82}));whiteSpine.position.x=-.61;whiteVolumeGroup.add(whiteSpine);whiteVolume.userData={type:'object',title:'The White Volume',author:'An ivory cloth binding, a faded whale device, and no catalogue mark. It smells faintly of salt.',action:'EXAMINE'};interactables.push(whiteVolume);
    const midnightDoor=new THREE.Group(),initialRabbitDoorScale=awakenedBooks.has(11)?1.22:.16;midnightDoor.position.set(-28,1.86*initialRabbitDoorScale,9.58);midnightDoor.scale.setScalar(initialRabbitDoorScale);scene.add(midnightDoor);const midnightDoorSlab=new THREE.Mesh(new THREE.BoxGeometry(1.65,3.7,.16),MAT.darkWood);midnightDoorSlab.userData={type:'midnight-door',title:'A door no taller than a book',author:'A brass rabbit is engraved above a keyhole smaller than your thumbnail.',action:'TRY DOOR'};if(awakenedBooks.has(11))Object.assign(midnightDoorSlab.userData,{title:'The grown rabbit door',author:'After reading Alice, it has become larger than an ordinary door.',action:'ENTER'});midnightDoor.add(midnightDoorSlab);for(const y of [-.9,.55]){const trim=new THREE.Mesh(new THREE.BoxGeometry(1.36,1.23,.035),MAT.gold);trim.position.set(0,y,.09);midnightDoor.add(trim);const inset=new THREE.Mesh(new THREE.BoxGeometry(1.18,1.05,.06),MAT.wood2);inset.position.set(0,y,.12);midnightDoor.add(inset)}for(const x of [-.96,.96]){const edge=new THREE.Mesh(new THREE.BoxGeometry(.2,4.1,.26),MAT.gold);edge.position.x=x;midnightDoor.add(edge)}const midnightLintel=new THREE.Mesh(new THREE.BoxGeometry(2.12,.2,.26),MAT.gold);midnightLintel.position.y=2.02;midnightDoor.add(midnightLintel);const rabbitArch=new THREE.Mesh(new THREE.TorusGeometry(.82,.08,7,22,Math.PI),MAT.brass);rabbitArch.position.set(0,2.01,.18);midnightDoor.add(rabbitArch);const rabbitHeadMark=new THREE.Mesh(new THREE.CircleGeometry(.16,12),MAT.brass);rabbitHeadMark.position.set(0,.62,.18);midnightDoor.add(rabbitHeadMark);for(const x of [-.1,.1]){const ear=new THREE.Mesh(new THREE.BoxGeometry(.09,.34,.04),MAT.brass);ear.position.set(x,.88,.18);ear.rotation.z=x*1.8;midnightDoor.add(ear)}const rabbitKnob=new THREE.Mesh(new THREE.SphereGeometry(.09,8,6),MAT.brass);rabbitKnob.position.set(.5,0,.16);midnightDoor.add(rabbitKnob);midnightDoor.visible=true;const rabbitDoorGlow=new THREE.PointLight(0xd7bd87,4.5,7,2);rabbitDoorGlow.position.set(-28,.65,8.8);scene.add(rabbitDoorGlow);interactables.push(midnightDoorSlab);
    const rabbit=new THREE.Group(),rabbitMat=new THREE.MeshStandardMaterial({color:0xe9e5da,roughness:.95}),rabbitEyeMat=new THREE.MeshStandardMaterial({color:0xb53a42,emissive:0x541018,emissiveIntensity:.5});scene.add(rabbit);const rabbitBody=new THREE.Mesh(new THREE.SphereGeometry(.38,12,9),rabbitMat);rabbitBody.scale.set(1.2,.8,.72);rabbitBody.position.y=.42;rabbit.add(rabbitBody);const rabbitHead=new THREE.Mesh(new THREE.SphereGeometry(.25,12,8),rabbitMat);rabbitHead.position.set(.38,.7,0);rabbit.add(rabbitHead);for(const z of [-.11,.11]){const ear=new THREE.Mesh(new THREE.ConeGeometry(.09,.48,8),rabbitMat);ear.position.set(.4,1.02,z);ear.rotation.z=-.12;rabbit.add(ear)}const rabbitEye=new THREE.Mesh(new THREE.SphereGeometry(.045,8,6),rabbitEyeMat);rabbitEye.position.set(.56,.76,-.18);rabbit.add(rabbitEye);rabbit.scale.setScalar(.72);rabbit.visible=false;
    const insectShadow=new THREE.Group(),shadowMat=new THREE.MeshBasicMaterial({color:0x080706,transparent:true,opacity:.72,depthWrite:false});scene.add(insectShadow);const insectBody=new THREE.Mesh(new THREE.SphereGeometry(.42,10,6),shadowMat);insectBody.scale.set(1.45,.08,.65);insectShadow.add(insectBody);const insectHead=new THREE.Mesh(new THREE.SphereGeometry(.22,9,6),shadowMat);insectHead.scale.y=.1;insectHead.position.x=.55;insectShadow.add(insectHead);for(const side of [-1,1])for(let i=0;i<3;i++){const leg=new THREE.Mesh(new THREE.BoxGeometry(.7,.015,.035),shadowMat);leg.position.set(.05-i*.18,.01,side*(.24+i*.09));leg.rotation.y=side*(.35+i*.18);insectShadow.add(leg)}insectShadow.position.set(-12,.055,-16);insectShadow.visible=false;
    // The Library at Night is built only when Alice opens its impossible door.
    const nightRoom={cx:-110,cz:-25,w:64,d:70,h:15};let nightRoomBuilt=false;
    const cheshireLines=['Only the smile is visible tonight. The rest, apparently, had somewhere better to be.','It offers an opinion on your reading pace, then vanishes before you can object.','A pair of eyes considers you for a long moment, unblinking, and then simply isn’t there.','It grins wider the longer you look, for no reason it cares to explain.','Its voice arrives a half-second before the rest of it, and leaves a half-second after.','It suggests, unhelpfully, that you are exactly as lost as you ought to be.'];
    function nightShelfScale(){const i=nightShelfIndex++;return i%6===2?1.6:i%6===4?.55:1}
    function carrollShelf(x,z,rot=0,scale=1){const carrollBooks=books.filter(b=>b.author==='Lewis Carroll');const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;g.scale.setScalar(scale);scene.add(g);const W=7.2,H=7.8,D=.8,structure=mergedBoxParts([[W,.18,D,0,.2,0],[W,.18,D,0,2.05,0],[W,.18,D,0,3.9,0],[W,.18,D,0,5.75,0],[W,.18,D,0,7.6,0],[.25,H,D,-W/2,H/2,0],[.25,H,D,W/2,H/2,0]],MAT.darkWood),back=mergedBoxParts([[W,H,.18,0,H/2,-.35]],MAT.wood2);g.add(structure,back);for(let row=0;row<4;row++)for(let col=0;col<4;col++){const b=carrollBooks[nightBookIndex%carrollBooks.length];nightBookIndex++;const mat=bookMaterial(b);const bm=new THREE.Mesh(shelvedBookGeometry,mat);bm.position.set(-2.65+col*1.72,1.14+row*1.85,.48);bm.rotation.x=(col%2?-.02:.018);g.add(bm);bm.userData={type:'book',book:b,home:null,loaded:false};interactables.push(bm);coverQueue.push(bm);bm.userData.home={position:bm.position.clone(),quaternion:bm.quaternion.clone(),parent:g}}g.userData.collider=collider(x,z,(Math.abs(Math.cos(rot))*W+Math.abs(Math.sin(rot))*D)*scale,(Math.abs(Math.sin(rot))*W+Math.abs(Math.cos(rot))*D)*scale,'night shelf');return g}
    function checkerFloor(x,z,w,d,squares=10){const tex=canvasTexture((c,W,H)=>{const cell=W/squares,cellH=H/squares;for(let r=0;r<squares;r++)for(let col=0;col<squares;col++){c.fillStyle=(r+col)%2===0?'#e7ddc6':'#241c30';c.fillRect(col*cell,r*cellH,cell,cellH)}},512,512);const floorMesh=mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshStandardMaterial({map:tex,roughness:.85}),x,.015,z,false);floorMesh.rotation.x=-Math.PI/2;return floorMesh}
    function cardSoldier(x,z,rot,suitSymbol,suitColor){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;scene.add(g);const tex=canvasTexture((c,W,H)=>{c.fillStyle='#e9e2cf';c.fillRect(0,0,W,H);c.strokeStyle='#8a7a58';c.lineWidth=10;c.strokeRect(14,14,W-28,H-28);c.fillStyle=suitColor;c.textAlign='center';c.font='bold 220px Georgia';c.fillText(suitSymbol,W/2,H*.56);c.font='bold 64px Georgia';c.fillText(suitSymbol,64,84);c.save();c.translate(W-64,H-84);c.rotate(Math.PI);c.fillText(suitSymbol,0,0);c.restore()},260,420);const face=mesh(new THREE.PlaneGeometry(1.15,2.15),new THREE.MeshStandardMaterial({map:tex,roughness:.85}),0,1.08,.075,false);g.add(face);const backing=new THREE.Mesh(new THREE.BoxGeometry(1.15,2.15,.1),new THREE.MeshStandardMaterial({color:0xcfc6ab,roughness:.9}));backing.position.y=1.08;g.add(backing);const halberd=new THREE.Mesh(new THREE.BoxGeometry(.06,2.6,.06),MAT.darkWood);halberd.position.set(.68,1.3,0);g.add(halberd);const blade=new THREE.Mesh(new THREE.BoxGeometry(.3,.36,.05),MAT.brass);blade.position.set(.68,2.5,0);g.add(blade);face.userData={type:'object',title:`A card soldier, ${suitSymbol}`,author:'It stands at attention and does not blink. It does not appear to breathe, either.',action:'EXAMINE'};interactables.push(face);collider(x,z,1.2,.6,'card soldier');return g}
    function nightSign(x,y,z,rotY,text){const tex=canvasTexture((c,w,h)=>{c.fillStyle='#161014';c.fillRect(0,0,w,h);c.strokeStyle='#8a6b40';c.lineWidth=6;c.strokeRect(10,10,w-20,h-20);c.fillStyle='#e8d9b0';c.textAlign='center';c.font='italic 26px Georgia';const words=text.split(' ');let line='';const lines=[];for(const wd of words){const test=line+wd+' ';if(c.measureText(test).width>w-40&&line){lines.push(line);line=wd+' '}else line=test}lines.push(line);const startY=h/2-(lines.length-1)*16;lines.forEach((ln,i)=>c.fillText(ln.trim(),w/2,startY+i*32))},420,150);const sign=mesh(new THREE.PlaneGeometry(3.4,1.2),new THREE.MeshStandardMaterial({map:tex,roughness:.85}),x,y,z,false);sign.rotation.y=rotY;sign.userData={type:'object',title:'A sign that should not be here',author:text,action:'READ'};interactables.push(sign);return sign}
    function drinkMeCorner(x,z){cylinder(.3,.28,.6,10,MAT.darkWood,x,.3,z);const bottle=mesh(new THREE.CylinderGeometry(.09,.11,.34,10),new THREE.MeshStandardMaterial({color:0x8fd4c8,transparent:true,opacity:.5,roughness:.15}),x-.12,.77,z,false);bottle.userData={type:'object',title:'A small bottle labelled “DRINK ME”',author:'Beside it sits a slice of cake marked “EAT ME” in dried currants. Neither offers instructions, or a reason to trust them.',action:'EXAMINE'};interactables.push(bottle);box(.22,.12,.22,new THREE.MeshStandardMaterial({color:0xcf9a5c,roughness:.85}),x+.16,.66,z,false)}
    function updateCheshireCat(){if(!nightRoomBuilt||!cheshireCat)return;const inRoom=player.pos.x>-142&&player.pos.x<-78&&player.pos.z>-60&&player.pos.z<10;if(!inRoom){if(cheshireCat.visible)cheshireCat.visible=false;return}const now=performance.now();if(now>cheshireNextAt){if(cheshireCat.visible){cheshireCat.visible=false;cheshireNextAt=now+6000+Math.random()*9000}else{const spots=[[-22,-12],[10,-40],[-4,4],[18,10]],p=spots[Math.floor(Math.random()*spots.length)];cheshireCat.position.set(nightRoom.cx+p[0],3.2+Math.random()*2,nightRoom.cz+p[1]);cheshireCat.visible=true;cheshireNextAt=now+3200+Math.random()*2200;showNotice(cheshireLines[Math.floor(Math.random()*cheshireLines.length)],5);sound(660,.3,'sine',.05)}}}
    function buildNightRoom(){if(nightRoomBuilt)return;nightRoomBuilt=true;const existing=new Set(scene.children);addBox(nightRoom.w,.42,nightRoom.d,MAT.wood,nightRoom.cx,-.21,nightRoom.cz,false);addBox(nightRoom.w,nightRoom.h,.55,MAT.stone,nightRoom.cx,nightRoom.h/2,nightRoom.cz-nightRoom.d/2);addBox(nightRoom.w,nightRoom.h,.55,MAT.stone,nightRoom.cx,nightRoom.h/2,nightRoom.cz+nightRoom.d/2);addBox(.55,nightRoom.h,nightRoom.d,MAT.stone,nightRoom.cx-nightRoom.w/2,nightRoom.h/2,nightRoom.cz);addBox(.55,nightRoom.h,nightRoom.d,MAT.stone,nightRoom.cx+nightRoom.w/2,nightRoom.h/2,nightRoom.cz);box(nightRoom.w,.38,nightRoom.d,roofMat,nightRoom.cx,nightRoom.h+.1,nightRoom.cz,false);rug(nightRoom.cx,nightRoom.cz+22,18,18,0x20283b);checkerFloor(nightRoom.cx,nightRoom.cz,nightRoom.w-3,nightRoom.d-3,12);
    for(const x of [-134,-122,-110,-98,-86]){carrollShelf(x,-59.35,0,nightShelfScale());carrollShelf(x,-41,Math.PI,nightShelfScale())}for(const z of [-52,-38,-24,-10,4]){carrollShelf(-141.35,z,Math.PI/2,nightShelfScale());carrollShelf(-78.65,z,-Math.PI/2,nightShelfScale())}for(const x of [-126,-110,-94]){carrollShelf(x,-24,0,nightShelfScale());carrollShelf(x,-8,Math.PI,nightShelfScale())}
    for(const x of [-134,-118,-102,-86])for(const z of [-49,-33,-17,-1]){cylinder(.48,.72,13.8,12,MAT.stone,x,6.9,z);collider(x,z,1.2,1.2,'monumental column');const capital=mesh(new THREE.CylinderGeometry(.9,.55,.55,12),MAT.brass,x,13.7,z,false);capital.rotation.y=Math.PI/12}for(const x of [-126,-110,-94])for(const z of [-50,-32,-14,3])addLamp(x,2,z,.7);
    const nightChandelier=new THREE.Group();nightChandelier.position.set(nightRoom.cx,12,nightRoom.cz);scene.add(nightChandelier);const chandelierGlow=new THREE.PointLight(0xf1c787,9,16,2);chandelierGlow.position.y=-.3;nightChandelier.add(chandelierGlow);for(let i=0;i<12;i++){const a=i/12*Math.PI*2,arm=new THREE.Mesh(new THREE.BoxGeometry(4.8,.08,.08),MAT.brass);arm.position.set(Math.cos(a)*2.2,0,Math.sin(a)*2.2);arm.rotation.y=-a;nightChandelier.add(arm);const flame=new THREE.Mesh(new THREE.SphereGeometry(.13,8,6),lampShadeMaterial);flame.position.set(Math.cos(a)*4.5,-.25,Math.sin(a)*4.5);nightChandelier.add(flame)}
    const suitDeck=[['♠','#1c1c1c'],['♥','#8f1d1d'],['♣','#1c1c1c'],['♦','#8f1d1d']];let suitCursor=0;for(const z of [-52,-38,-24,-10,4]){const sw=suitDeck[suitCursor++%suitDeck.length];cardSoldier(-137.5,z,Math.PI/2,sw[0],sw[1]);const se=suitDeck[suitCursor++%suitDeck.length];cardSoldier(-82.5,z,-Math.PI/2,se[0],se[1])}
    const teaSeats=[[-12,'The March Hare’s place setting','A teacup sits precisely where a saucer ought to be, and vice versa.'],[-6,'The Hatter’s cup','It has been moved along from a dirtier one, one seat over. This one is no cleaner.'],[0,'An empty place, set anyway','No room, insists a card propped against the pot. There is, in fact, a great deal of room.'],[6,'The Dormouse’s seat','The cushion is still warm, though no one admits to having sat here.'],[12,'A seat for no one in particular','The chair is pulled out. The library has not said for whom.']];for(const [dx,title,desc] of teaSeats)themeProp({cx:nightRoom.cx+dx,cz:nightRoom.cz+24,w:6},{kind:'tea-table',title,desc});
    nightSign(nightRoom.cx-15,4.4,nightRoom.cz-nightRoom.d/2+.25,0,'NO ROOM! NO ROOM! (There is, in fact, a great deal of room.)');
    nightSign(nightRoom.cx+10,4.4,nightRoom.cz+nightRoom.d/2-.25,Math.PI,'TIME HAS BEEN ASKED TO WAIT OUTSIDE, AND HAS AGREED, FOR NOW.');
    nightSign(nightRoom.cx-32+.25,4.4,nightRoom.cz-16,Math.PI/2,'ALL THE DOORS HERE ARE THE RIGHT SIZE FOR SOMEONE.');
    nightSign(nightRoom.cx+32-.25,4.4,nightRoom.cz-2,-Math.PI/2,'PLEASE DO NOT FEED THE FOOTNOTES.');
    nightSign(nightRoom.cx+16,4.4,nightRoom.cz+24+2.6,Math.PI,'THIS CHAIR IS RESERVED FOR SOMEONE WHO LEFT SOME TIME AGO.');
    drinkMeCorner(nightRoom.cx-22,nightRoom.cz+nightRoom.d/2-4);
    const cheshireTex=canvasTexture((c,w,h)=>{c.clearRect(0,0,w,h);c.strokeStyle='#f4ede0';c.lineWidth=10;c.lineCap='round';c.beginPath();c.moveTo(w*.16,h*.4);c.quadraticCurveTo(w*.5,h*.86,w*.84,h*.4);c.stroke();c.fillStyle='#f4ede0';c.beginPath();c.ellipse(w*.35,h*.26,w*.045,h*.075,0,0,7);c.fill();c.beginPath();c.ellipse(w*.65,h*.26,w*.045,h*.075,0,0,7);c.fill()},300,220);cheshireCat=mesh(new THREE.PlaneGeometry(2.6,1.9),new THREE.MeshStandardMaterial({map:cheshireTex,transparent:true,emissive:0xf4ede0,emissiveMap:cheshireTex,emissiveIntensity:.7,side:THREE.DoubleSide}),nightRoom.cx-22,3.6,nightRoom.cz-12,false);cheshireCat.visible=false;cheshireCat.userData={type:'object',title:'A grin, hanging in the dark',author:'Only the smile remains, considering you carefully.',action:'LISTEN'};interactables.push(cheshireCat);
    const nightPlaqueTex=canvasTexture((c,w,h)=>{c.fillStyle='#121a22';c.fillRect(0,0,w,h);c.strokeStyle='#b89d70';c.lineWidth=8;c.strokeRect(12,12,w-24,h-24);c.fillStyle='#e5d5b1';c.textAlign='center';c.font='bold 31px Georgia';c.fillText('THE LIBRARY AT NIGHT',w/2,54);c.font='italic 18px Georgia';c.fillText('Every library becomes a different library after dark.',w/2,95)},800,125);const nightPlaque=mesh(new THREE.PlaneGeometry(12,1.9),new THREE.MeshStandardMaterial({map:nightPlaqueTex,roughness:.8}),nightRoom.cx,8.5,nightRoom.cz-nightRoom.d/2+.3,false);nightPlaque.userData={type:'object',title:'THE LIBRARY AT NIGHT',author:'“Every library becomes a different library after dark.”',action:'READ'};interactables.push(nightPlaque);
    const nightExit=box(3.4,5.2,.22,MAT.darkWood,nightRoom.cx,2.6,nightRoom.cz+nightRoom.d/2-.3,false);nightExit.userData={type:'night-exit',title:'The little door, seen from the enormous side',author:'From here, its brass handle seems perfectly ordinary.',action:'RETUR…59851 tokens truncated….length()>7){librarian.rotation.y=THREE.MathUtils.damp(librarian.rotation.y,Math.atan2(-toPlayer.x,-toPlayer.z),4,dt);return}
        const v=tmpVector2.copy(librarianGuideTarget).sub(librarian.position);v.y=0;
        if(v.length()<.7){librarianGuideTarget=null;librarianPause=8;showNotice(`The librarian stops beside ${librarianGuideLabel}. “The next step should be yours.”`,6);return}
        v.normalize();librarian.position.addScaledVector(v,dt*.95);librarian.position.y=THREE.MathUtils.damp(librarian.position.y,floorHeight(librarian.position.x,librarian.position.z)+Math.abs(Math.sin(t*5))*.025,8,dt);librarian.rotation.y=THREE.MathUtils.damp(librarian.rotation.y,Math.atan2(-v.x,-v.z),5,dt);carriedBook.rotation.z=.08+Math.sin(t*3)*.015;return
      }
      if(librarianPause>0){librarianPause-=dt;if(toPlayer.length()<5)librarian.rotation.y=THREE.MathUtils.damp(librarian.rotation.y,Math.atan2(-toPlayer.x,-toPlayer.z),4,dt);return}
      const target=librarianPath[librarianTarget],v=tmpVector2.copy(target).sub(librarian.position);v.y=0;if(v.length()<.55){librarianTarget=(librarianTarget+1)%librarianPath.length;librarianPause=1.5+Math.random()*3;return}v.normalize();librarian.position.addScaledVector(v,dt*.72);librarian.position.y=THREE.MathUtils.damp(librarian.position.y,floorHeight(librarian.position.x,librarian.position.z)+Math.abs(Math.sin(t*5))*.025,8,dt);librarian.rotation.y=THREE.MathUtils.damp(librarian.rotation.y,Math.atan2(-v.x,-v.z),5,dt);carriedBook.rotation.z=.08+Math.sin(t*3)*.015
    }
    let nextCoverBatchAt=0;
    function loadNearbyCovers(t){if(t<nextCoverBatchAt||playerIsMoving())return;nextCoverBatchAt=t+.5;collectActiveInteractables();refreshCoverFrustum();let queued=0;for(const bm of focusCandidates){if(queued>=2)break;const data=bm.userData;if(data?.type!=='book')continue;let root=bm;while(root.parent)root=root.parent;if(root!==scene||!bm.visible)continue;bm.getWorldPosition(tmpWorldPosition);if(tmpWorldPosition.distanceToSquared(camera.position)>=144||!coverFrustum.containsPoint(tmpWorldPosition))continue;if(data.coverRequested){if(!lowBandwidth&&!data.realCover)requestRealCover(data.book);continue}data.coverRequested=true;queueCoverMesh(bm);queued++}}
    function syncMobileControls(){if(!touchMode)return;const active=gameActive();document.body.classList.toggle('mobile-controls-active',active);if(!active){touchMoveX=0;touchMoveY=0;touchSprint=false}const button=$('#touchInteract');if(focus){const d=focus.userData||{};focus.getWorldPosition(tmpWorldPosition2);const action=carryingBook&&d.type==='seat'?'READ':d.action||(d.type==='book'&&tmpWorldPosition2.y-camera.position.y>2?'TAKE':d.type==='book'?'OPEN':'USE');button.textContent=action.length>9?action.split(' ')[0]:action;button.classList.add('ready')}else{button.textContent='LOOK';button.classList.remove('ready')}}
    function worldIsCovered(){return document.hidden||chatOpen||supportOpen||settingsOpen||!ui.reader.classList.contains('hidden')||!ui.journal.classList.contains('hidden')||!ui.pause.classList.contains('hidden')}
    const performanceMonitor=document.createElement('div');performanceMonitor.id='performanceMonitor';performanceMonitor.setAttribute('aria-live','off');performanceMonitor.style.cssText='position:fixed;right:10px;top:10px;z-index:40;padding:6px 9px;border:1px solid rgba(220,190,130,.45);border-radius:4px;background:rgba(10,8,6,.82);color:#ead7aa;font:12px/1.35 ui-monospace,monospace;pointer-events:none;display:none;white-space:pre';document.body.appendChild(performanceMonitor);let performanceMonitorVisible=new URLSearchParams(location.search).has('perf'),monitorStarted=performance.now(),monitorLast=monitorStarted,monitorFrames=0,monitorMax=0,monitorSpikes=0;performanceMonitor.style.display=performanceMonitorVisible?'block':'none';
    function updatePerformanceMonitor(now){const frameMs=Math.min(100,now-monitorLast);monitorLast=now;monitorFrames++;monitorMax=Math.max(monitorMax,frameMs);if(frameMs>40)monitorSpikes++;const elapsed=now-monitorStarted;if(elapsed<1000)return frameMs;const renderInfo=renderer.info.render;performanceMonitor.textContent=`${Math.round(monitorFrames*1000/elapsed)} FPS  max ${monitorMax.toFixed(1)} ms\n${monitorSpikes} frame spikes >40 ms\n${renderInfo.calls} calls  ${Math.round(renderInfo.triangles/1000)}k tris  ${renderer.info.memory.textures} tex\nrender scale ${Math.round(adaptiveRenderScale*100)}%`;monitorStarted=now;monitorFrames=0;monitorMax=0;monitorSpikes=0;return frameMs}
    function updateAdaptiveQuality(now,frameMs){adaptiveSampleFrames++;if(frameMs>25)adaptiveSlowFrames++;if(frameMs<18)adaptiveFastFrames++;if(now-adaptiveSampleStarted<1600)return;const slowRatio=adaptiveSlowFrames/adaptiveSampleFrames,fastRatio=adaptiveFastFrames/adaptiveSampleFrames;if(now-adaptiveLastChange>2500){if(slowRatio>.28&&adaptiveRenderScale<=adaptiveQualityFloor&&!visualTierPinned&&visual?.stepDown()){adaptiveLastChange=now}else if(slowRatio>.28&&adaptiveRenderScale>adaptiveQualityFloor){adaptiveRenderScale=Math.max(adaptiveQualityFloor,Math.round((adaptiveRenderScale-.1)*100)/100);adaptiveLastChange=now;applyAdaptiveRenderScale()}else if(slowRatio<.04&&fastRatio>.72&&adaptiveRenderScale<1){adaptiveRenderScale=Math.min(1,Math.round((adaptiveRenderScale+.05)*100)/100);adaptiveLastChange=now;applyAdaptiveRenderScale()}}adaptiveSampleStarted=now;adaptiveSampleFrames=0;adaptiveSlowFrames=0;adaptiveFastFrames=0}
    document.addEventListener('keydown',event=>{if(event.code!=='F3')return;event.preventDefault();performanceMonitorVisible=!performanceMonitorVisible;performanceMonitor.style.display=performanceMonitorVisible?'block':'none'});
    // Whatever the reader taps or clicks at a point of the screen, if it is in reach: found as the ring in the middle of
    // the view finds things, then used as E or the round button would use it. Returns whether anything answered.
    function interactAt(clientX,clientY){
      if(!gameActive())return false;const r=renderer.domElement.getBoundingClientRect();if(!r.width||!r.height)return false;
      screenCentre.set((clientX-r.left)/r.width*2-1,-((clientY-r.top)/r.height)*2+1);focusCheckTimer=0;
      try{updateFocus(0)}finally{screenCentre.set(0,0);focusCheckTimer=0}
      if(focus){approach=null;interact();return true}
      return approachAt(clientX,clientY);
    }
    // A book (or anything else that answers) seen across the room but out of reach: the reader walks to it, turning to
    // face it, and takes it once it is in reach. Any key or stick stops the walk; if the way is blocked, the reader is told.
    let approach=null;
    // The nearest thing that answers at a point of the screen, up to 24 m away and on the reader's own floor, or null.
    function pickAt(clientX,clientY){
      const r=renderer.domElement.getBoundingClientRect();if(!r.width||!r.height)return null;const ndc=new THREE.Vector2((clientX-r.left)/r.width*2-1,-((clientY-r.top)/r.height)*2+1);
      collectActiveInteractables();raycaster.setFromCamera(ndc,camera);const far=raycaster.far;raycaster.far=24;
      let hits;try{hits=raycaster.intersectObjects(focusCandidates.filter(o=>{for(let n=o;n;n=n.parent)if(n.visible===false)return false;let root=o;while(root.parent)root=root.parent;return root===scene&&o!==selected}),false)}finally{raycaster.far=far}
      const target=hits[0]?.object;if(!target)return null;target.getWorldPosition(tmpWorldPosition);return Math.abs(tmpWorldPosition.y-camera.position.y)>3?null:target;
    }
    function approachAt(clientX,clientY){
      if(carryingBook)return false;const target=pickAt(clientX,clientY);if(!target)return false;
      approach={target,last:player.pos.clone(),stuck:0,time:0};return true;
    }
    function steerApproach(dt){
      if(!approach)return 0;const a=approach;
      if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].some(k=>keys[k])||touchMoveX||touchMoveY||!gameActive()){approach=null;return 0}
      const p=a.target.getWorldPosition(tmpWorldPosition),dx=p.x-player.pos.x,dz=p.z-player.pos.z,dist=Math.hypot(dx,dz);
      const reach=a.target.userData?.type==='book'?2.6:1.9;
      let diff=Math.atan2(-dx,-dz)-player.yaw;diff=Math.atan2(Math.sin(diff),Math.cos(diff));player.yaw+=diff*Math.min(1,dt*6);
      player.pitch+=(clamp(Math.atan2(p.y-camera.position.y,Math.max(dist,.5)),-1.1,1.1)-player.pitch)*Math.min(1,dt*4);
      if(dist<=reach){approach=null;player.vel.set(0,0,0);focus=a.target;interact();return 0}
      a.time+=dt;if(a.time>.5){if(player.pos.distanceTo(a.last)<.12){approach=null;showNotice('Something is in the way. Walk round it with the arrow keys, or W, A, S and D.',6);return 0}a.last.copy(player.pos);a.time=0}
      return Math.abs(diff)<.6?1:0;
    }
    function animate(now=performance.now()){requestAnimationFrame(animate);const frameMs=updatePerformanceMonitor(now),dt=Math.min(clock.getDelta(),.05),t=clock.elapsedTime;if(worldIsCovered()){stopFootsteps();return}updateAdaptiveQuality(now,frameMs);syncMobileControls();if(gameActive())movePlayer(dt);updateFootsteps(dt);updatePerformanceVisibility(dt);updateWingDoors(dt);loadNearbyCovers(t);loadNearbyPaintings(t);singleCopyLibrary.sync();updateFocus(dt);updateSelected(dt);updateGrabKick();updateDustPuffs(dt);updateWorld(t,dt);updateTrainPass(t);updateSoundscape(dt);if(lightningFlash>0){moon.intensity+=lightningFlash*7;ambient.intensity+=lightningFlash*.9;lightningFlash=Math.max(0,lightningFlash-dt*5)}updateSeating(t,dt);singleCopyLibrary.sync();if(noticeTimer>0){noticeTimer-=dt;if(noticeTimer<=0)ui.notice.style.opacity=0}if(lampsAdded){lampsAdded=false;refreshBudgetLights.stamp=null;budgetRefreshTimer=0;applyLightBudget()}staticBatcher?.update(dt);if(visual){visual.update(dt);visual.render(dt)}else renderer.render(scene,camera)}

    const entranceMessages=['The clock has forgotten the hour.','A page turns somewhere beyond the locked stacks.','The library has been expecting someone, though not necessarily you.','Every lamp is lit. No caretaker admits to lighting them.','The rain stops at the windows, but something wet crossed the floor.','One book is already open to a page bearing today’s date.','The catalogue records your arrival before you enter.','Quill watches an empty doorway, waiting for it to move.','The fire remembers a conversation no living reader heard.','Tonight, the shelves are arranged in the shape of a warning.','The building settles around you like a held breath.','Somewhere below, a ladder creaks under an invisible weight.','The front door was unlocked, though no one recalls unlocking it.','A single chair has been pulled out from an otherwise empty table.','The last borrower never returned what they took.','Dust does not seem to settle here the way it settles elsewhere.','The lights dim once, briefly, as if in greeting.','A returned book sits on the counter with no record of who brought it back.','Somewhere a shelf sighs under a weight that was not there this morning.','The library door closes behind you on its own, gently, as if by habit.'];
    const ROOM_ALIASES={'voynich-manuscript':'voynich',restricted:'voynich','restricted-catalogue':'voynich',ciphers:'voynich',within:'within-room','books-within-books':'within-room',imaginary:'within-room','imaginary-books':'within-room',catalogue:'within-room','card-catalogue':'within-room',burns:'burns-room','robert-burns':'burns-room',rabbie:'burns-room',scotland:'burns-room',cuttysark:'burns-room',austen:'austen-room','jane-austen':'austen-room',udolpho:'austen-room','rudyard-kipling':'kipling',rudyard:'kipling',cinder:'cinder-archive','cinder-room':'cinder-archive',ashes:'cinder-archive',chance:'chance-room','room-of-chance':'chance-room','set-texts':'set-texts-room',settexts:'set-texts-room','gcse':'set-texts-room',shakespeare:'set-texts-room','consulting-room':'doyle',maps:'map-room',map:'map-room',medicine:'medicine-room',vesalius:'medicine-room',fabrica:'medicine-room','history-of-medicine':'medicine-room',atlas:'map-room',atlases:'map-room',irish:'irish-room',ireland:'irish-room',ga:'irish-room',eire:'irish-room',gaeilge:'irish-room',poe:'poe-room',raven:'poe-room','tell-tale-heart':'poe-room','time-laboratory':'wells','lost-kingdoms':'haggard','verne-rooms':'verne',island:'boathouse',evening:'evening-room',periodicals:'periodicals-room',international:'international-wing',spanish:'international-wing',espanol:'international-wing',es:'international-wing',pt:'portuguese-room',portuguese:'portuguese-room',portugues:'portuguese-room',zh:'chinese-room',chinese:'chinese-room',zhongwen:'chinese-room',fr:'french-room',french:'french-room',francais:'french-room',la:'latin-room',latin:'latin-room',latina:'latin-room',it:'italian-room',italian:'italian-room',italiano:'italian-room',italia:'italian-room',uk:'ukrainian-room',ua:'ukrainian-room',ukrainian:'ukrainian-room',ukrainska:'ukrainian-room','українська':'ukrainian-room',english:'learners-room','english-reading-room':'learners-room','room-of-the-day':'daily-room',rocket:'rocket-hall',australia:'australian-room',australian:'australian-room',au:'australian-room',nz:'new-zealand-room','new-zealand':'new-zealand-room',newzealand:'new-zealand-room',aotearoa:'new-zealand-room','through-the-earth':'antipodes',globe:'antipodes',africa:'african-room',african:'african-room',balloon:'african-room',lift:'lost-property','book-lift':'lost-property',dumbwaiter:'lost-property','lost-property-office':'lost-property'};
    function moveReaderTo(x,y,z,yaw){finishTrainPass();for(const k in keys)keys[k]=false;touchMoveX=touchMoveY=0;player.pos.set(x,y,z);player.vel.set(0,0,0);player.yaw=yaw;player.pitch=0;lastSafePosition.copy(player.pos);camera.position.set(x,y+1.72,z);camera.rotation.set(0,yaw,0,'YXZ');camera.updateMatrixWorld();focus=null}
    function roomLink(key){
      if(themeRoomKeys.has(key)){const hp=hiddenPassages.find(h=>h.destination===key);return hp?()=>enterHiddenRoom(hp):null}
      return {boathouse:crusoeIsland&&(()=>crusoeIsland.enter()),'evening-room':eveningRoom&&(()=>eveningRoom.enter()),'poe-room':poeRoom&&(()=>poeRoom.enter()),'irish-room':irishRoom&&(()=>irishRoom.enter()),'map-room':mapRoom&&(()=>mapRoom.enter()),'medicine-room':medicineRoom&&(()=>medicineRoom.enter()),'austen-room':austenRoom&&(()=>austenRoom.enter()),'burns-room':burnsRoom&&(()=>burnsRoom.enter()),'within-room':withinRoom&&(()=>withinRoom.enter()),antipodes:antipodes&&(()=>antipodes.enter()),'african-room':africanRoom&&(()=>africanRoom.enter()),'australian-room':antipodes&&(()=>antipodes.enter('australian-room')),'new-zealand-room':antipodes&&(()=>antipodes.enter('new-zealand-room')),'learners-room':learnersRoom&&(()=>learnersRoom.enter()),'set-texts-room':setTextsRoom&&(()=>setTextsRoom.enter()),'chance-room':chanceRoom&&(()=>chanceRoom.enter()),'cinder-archive':cinderArchive&&(()=>cinderArchive.enter()),'lost-property':bookLift&&(()=>bookLift.enter()),
        'periodicals-room':periodicalsRoom&&(()=>periodicalsRoom.enter()),'international-wing':internationalWing&&(()=>enterWing('spanish')),'portuguese-room':internationalWing&&(()=>enterWing('portuguese')),'chinese-room':internationalWing&&(()=>enterWing('chinese')),'french-room':internationalWing&&(()=>enterWing('french')),'latin-room':internationalWing&&(()=>enterWing('latin')),'italian-room':internationalWing&&(()=>enterWing('italian')),'ukrainian-room':internationalWing&&(()=>enterWing('ukrainian')),'daily-room':dailyRoom&&(()=>dailyRoom.enter()),mars:marsWorld&&(()=>marsWorld.arrive()),
        moon:()=>moveReaderTo(340,0,36,Math.PI),voynich:()=>moveReaderTo(47,0,.5,Math.PI),kipling:()=>moveReaderTo(-15.9,0,29.1,Math.PI/2),'rocket-hall':()=>moveReaderTo(highStaircase.center.x-1.3,highStaircase.topY,highStaircase.center.z+1.6,Math.PI)}[key]||null;
    }
    function goToLinkedRoom(){const key=ROOM_ALIASES[linkedRoom]||linkedRoom,go=roomLink(key);if(!go)return false;tour?.finish?.();window.libraryAnalytics?.track('Room Link Opened',{room:key});setTimeout(go,600);return true}
    function openLinkedBook(){tour?.finish?.();window.libraryAnalytics?.track('Book Link Opened',{book:linkedBook.id});setTimeout(()=>{const bm=singleCopyLibrary.find(linkedBook)||looseBook(linkedBook,player.pos.x,1,player.pos.z-1.4);selectBook(bm);openReader()},900)}
    function enterLibrary(){if(started)return;started=true;if(linkedBook)openLinkedBook();else if(!(linkedRoom&&goToLinkedRoom()))tour?.begin();window.libraryAnalytics?.track('Library Entered');if(touchMode)document.body.classList.add('mobile-started');ui.veil.classList.add('leaving');setTimeout(()=>ui.veil.classList.add('hidden'),950);requestLookLock();startAudio();showNotice(entranceMessages[Math.floor(Math.random()*entranceMessages.length)],4.5);if(localStorage.getItem('athenaeum-exploration-prompt-seen')!=='1')setTimeout(()=>{const nudge=$('#exploreNudge');if(!nudge)return;nudge.classList.add('show');localStorage.setItem('athenaeum-exploration-prompt-seen','1');setTimeout(()=>nudge.classList.remove('show'),9000)},1700)}
    function syncSettingsForm(){if($('#timeMode'))$('#timeMode').value=timeMode;if($('#visualQuality'))$('#visualQuality').value=visualTierPinned&&visual?visual.tier:'auto';$('#volumeControl').value=Math.round(soundLevel*100);$('#reducedMotion').checked=reducedMotion;$('#lowBandwidth').checked=lowBandwidth;$('#highContrast').checked=highContrast;$('#largeText').checked=largeText;if($('#mouseLook'))$('#mouseLook').checked=mouseLook}
    function applySettings(save=false){if($('#timeMode')){timeMode=$('#timeMode').value==='clock'?'clock':'library';if(save)localStorage.setItem('athenaeum-time-mode',timeMode)}const qualityChoice=$('#visualQuality')?.value;if(visual&&qualityChoice){visualTierPinned=qualityChoice!=='auto';visual.setTier(visualTierPinned?qualityChoice:automaticTier);if(save){if(visualTierPinned)localStorage.setItem('athenaeum-visual-quality',qualityChoice);else localStorage.removeItem('athenaeum-visual-quality')}}const bandwidthChanged=lowBandwidth!==$('#lowBandwidth').checked;soundLevel=clamp(Number($('#volumeControl').value)/100,0,1);reducedMotion=$('#reducedMotion').checked;lowBandwidth=$('#lowBandwidth').checked;highContrast=$('#highContrast').checked;largeText=$('#largeText').checked;if($('#mouseLook')){mouseLook=$('#mouseLook').checked;if(!mouseLook&&locked)document.exitPointerLock?.()}if(bandwidthChanged){noteCoverMotion();scheduleCoverWork()}document.body.classList.toggle('reduced-motion',reducedMotion);document.body.classList.toggle('high-contrast',highContrast);document.body.classList.toggle('large-text',largeText);if(master)master.gain.setTargetAtTime(muted?0:soundLevel,audioCtx.currentTime,.08);if(save){localStorage.setItem('athenaeum-sound-level',Math.round(soundLevel*100));localStorage.setItem('athenaeum-reduced-motion',reducedMotion?'1':'0');localStorage.setItem('athenaeum-low-bandwidth',lowBandwidth?'1':'0');localStorage.setItem('athenaeum-high-contrast',highContrast?'1':'0');localStorage.setItem('athenaeum-large-text',largeText?'1':'0');localStorage.setItem('athenaeum-mouse-arrow',mouseLook?'0':'1')}}
    function openSettings(){if(settingsOpen)return;settingsReturnToPause=!ui.pause.classList.contains('hidden');settingsOpen=true;for(const k in keys)keys[k]=false;player.vel.set(0,0,0);syncSettingsForm();ui.pause.classList.add('hidden');$('#settings').classList.remove('hidden');document.exitPointerLock?.();setTimeout(()=>$('#volumeControl').focus(),0)}
    function closeSettings(){if(!settingsOpen)return;applySettings(true);settingsOpen=false;$('#settings').classList.add('hidden');if(settingsReturnToPause)ui.pause.classList.remove('hidden');else if(started)requestLookLock()}
    ui.enter.addEventListener('click',()=>{if(shadersWarm)enterLibrary()});
    renderer.domElement.addEventListener('click',()=>{if(gameActive()&&!locked)requestLookLock()});
    renderer.domElement.addEventListener('pointerdown',e=>{if(e.button!==0||!gameActive())return;dragging=true;lastPointerX=e.clientX;lastPointerY=e.clientY;renderer.domElement.focus()});
    // A quick click on a book (or anything else the library answers to) takes it, as E does: with the pointer locked,
    // whatever is under the ring in the middle of the view; otherwise whatever is under the pointer. A drag only looks.
    let clickStart=null;
    renderer.domElement.addEventListener('pointerdown',e=>{if(e.button===0&&e.pointerType!=='touch')clickStart={x:e.clientX,y:e.clientY,t:performance.now()}});
    // With the arrow showing, it becomes a hand over anything a click would take or use, and a closed hand while dragging.
    let hoverAt=0;
    renderer.domElement.addEventListener('pointermove',e=>{if(locked||touchMode||e.pointerType==='touch')return;const c=renderer.domElement;
      if(dragging){c.style.cursor='grabbing';return}const now=performance.now();if(now-hoverAt<120)return;hoverAt=now;c.style.cursor=gameActive()&&pickAt(e.clientX,e.clientY)?'pointer':''});
    document.addEventListener('pointerup',()=>{if(!locked)renderer.domElement.style.cursor=''});
    renderer.domElement.addEventListener('pointerup',e=>{const s=clickStart;clickStart=null;if(!s||e.button!==0||!gameActive()||performance.now()-s.t>450||Math.hypot(e.clientX-s.x,e.clientY-s.y)>6)return;
      if(locked){const r=renderer.domElement.getBoundingClientRect();interactAt(r.left+r.width/2,r.top+r.height/2)}else interactAt(e.clientX,e.clientY)});
    document.addEventListener('pointerup',()=>dragging=false);window.addEventListener('blur',()=>{dragging=false;for(const k in keys)keys[k]=false});
    document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===renderer.domElement;if(locked){hadPointerLock=true;ui.pause.classList.add('hidden')}else if(started&&hadPointerLock&&!chatOpen&&!supportOpen&&!settingsOpen&&!telescopeViewer?.isOpen&&!correspondenceDesk?.isOpen&&(!selected||carryingBook)&&ui.reader.classList.contains('hidden')&&ui.journal.classList.contains('hidden'))ui.pause.classList.remove('hidden')});
    document.addEventListener('mousemove',e=>{if(!locked&&!dragging)return;const dx=locked?e.movementX:e.clientX-lastPointerX,dy=locked?e.movementY:e.clientY-lastPointerY;lastPointerX=e.clientX;lastPointerY=e.clientY;if(dx||dy)noteCoverMotion();player.yaw-=dx*.00185;player.pitch=clamp(player.pitch-dy*.0017,-1.42,1.42)});
    document.addEventListener('keydown',e=>{if(supportOpen){if(e.code==='Escape'){e.preventDefault();closeSupport()}else if(e.code==='Tab'){const buttons=[...$('#support').querySelectorAll('a,button')];if(e.shiftKey&&document.activeElement===buttons[0]){e.preventDefault();buttons.at(-1).focus()}else if(!e.shiftKey&&document.activeElement===buttons.at(-1)){e.preventDefault();buttons[0].focus()}}return}if(chatOpen&&!$('#journeyPicker').classList.contains('hidden')){if(e.code==='Escape'){e.preventDefault();closeJourneyPicker()}return}if(chatOpen){if(e.code==='Escape'){e.preventDefault();closeChat()}else if(e.code==='Tab'){const buttons=[...$('#conversation').querySelectorAll('button')];if(e.shiftKey&&document.activeElement===buttons[0]){e.preventDefault();buttons.at(-1).focus()}else if(!e.shiftKey&&document.activeElement===buttons.at(-1)){e.preventDefault();buttons[0].focus()}}return}if(e.repeat&&['KeyE','KeyJ'].includes(e.code))return;keys[e.code]=true;if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)){e.preventDefault();noteCoverMotion()}const reading=!ui.reader.classList.contains('hidden'),journaling=!ui.journal.classList.contains('hidden');if(e.code==='KeyE'&&gameActive())interact();if(e.code==='KeyC'&&selected&&!carryingBook&&ui.reader.classList.contains('hidden'))carrySelected();if(e.code==='KeyR'&&started)resetPosition();if(e.code==='KeyJ'&&started&&!reading&&!selected){journaling?closeJournal():openJournal();return}if(reading&&e.code==='ArrowLeft')pageStep(-1);if(reading&&e.code==='ArrowRight')pageStep(1);if(e.code==='Escape'&&journaling)closeJournal();else if(e.code==='Escape'&&reading)closeReader()});document.addEventListener('keyup',e=>keys[e.code]=false);
    // Laptops without arrow keys have them on the number pad (8, 4, 6 and 2), and some keyboards send arrows under other
    // names: those walk and turn as the arrow keys do, with Num Lock on or off, unless the reader is typing.
    const ARROW_CODES={Numpad8:'ArrowUp',Numpad2:'ArrowDown',Numpad4:'ArrowLeft',Numpad6:'ArrowRight'};
    const arrowFor=e=>/^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName||'')||e.target?.isContentEditable?null:ARROW_CODES[e.code]||(/^Arrow(Up|Down|Left|Right)$/.test(e.key)&&e.code!==e.key?e.key:null);
    document.addEventListener('keydown',e=>{const arrow=arrowFor(e);if(arrow&&gameActive()){keys[arrow]=true;e.preventDefault();noteCoverMotion()}});
    document.addEventListener('keyup',e=>{const arrow=arrowFor(e);if(arrow)keys[arrow]=false});
    $('#resume').addEventListener('click',()=>{ui.pause.classList.add('hidden');requestLookLock()});$('#openJournal').addEventListener('click',openJournal);$('#closeJournal').addEventListener('click',closeJournal);$('#resetPosition').addEventListener('click',resetPosition);$('#openBook').addEventListener('click',openReader);$('#carryBook').addEventListener('click',carrySelected);$('#askLibrarian').addEventListener('click',askLibrarianAboutBook);$('#leaveBook').addEventListener('click',leaveSelectedAtDesk);$('#returnBook').addEventListener('click',returnSelected);$('#closeReader').addEventListener('click',closeReader);$('#listenBook').addEventListener('click',()=>{const book=selected?.userData?.book;if(book)audiobooks?.start(book,{heading:$('#chapter').textContent})});
    $('#listenAction').addEventListener('click',()=>{const book=selected?.userData?.book;if(book)audiobooks?.start(book)});
    $('#finishReading').addEventListener('click',()=>{if(seated){closeReader();return}const wasCarried=carryingBook;closeReader();if(!wasCarried)returnSelected()});$('#leaveOnChair').addEventListener('click',leaveBookOnSeat);$('#placeNearby').addEventListener('click',placeOnNearestTable);$('#prevPage').addEventListener('click',()=>pageStep(-1));$('#nextPage').addEventListener('click',()=>pageStep(1));$('#listenBook').addEventListener('click',()=>window.libraryAnalytics?.track('Audiobook Link Opened'));
    // Touch reading: swipe or tap an outer edge to turn, pinch with two fingers to resize the text.
    if(touchMode){const readerPages=$('.pages'),touches=new Map();let swipeId=null,swipeStartX=0,swipeStartY=0,swipeAt=0,pinch=null;
      const pinchDistance=()=>{const [a,b]=[...touches.values()];return Math.hypot(a.x-b.x,a.y-b.y)||1};
      readerPages.addEventListener('pointerdown',e=>{if(ui.reader.classList.contains('hidden'))return;touches.set(e.pointerId,{x:e.clientX,y:e.clientY});try{readerPages.setPointerCapture(e.pointerId)}catch(ignore){}if(touches.size===2){swipeId=null;pinch={distance:pinchDistance(),scale:readerPrefs.scale}}else if(touches.size===1){swipeId=e.pointerId;swipeStartX=e.clientX;swipeStartY=e.clientY;swipeAt=performance.now()}});
      readerPages.addEventListener('pointermove',e=>{if(!touches.has(e.pointerId))return;touches.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pinch&&touches.size===2){e.preventDefault();setReaderScale(pinch.scale*pinchDistance()/pinch.distance,false)}});
      const release=e=>{if(!touches.delete(e.pointerId))return;if(pinch){if(touches.size<2){pinch=null;swipeId=null;applyReaderPrefs(true)}return}if(e.type!=='pointerup'||e.pointerId!==swipeId)return;swipeId=null;const dx=e.clientX-swipeStartX,dy=e.clientY-swipeStartY;if(Math.abs(dx)>46&&Math.abs(dx)>Math.abs(dy)*1.25){e.preventDefault();pageStep(dx<0?1:-1);return}if(Math.abs(dx)<12&&Math.abs(dy)<12&&performance.now()-swipeAt<400){const r=readerPages.getBoundingClientRect(),f=(e.clientX-r.left)/r.width;if(!$('#readerPrefs').classList.contains('hidden'))return;/* With word help on, a tap looks up the word instead; swipes still turn. */if(window.libraryWordHelp?.active)return;if(f>.68)pageStep(1);else if(f<.32)pageStep(-1)}};
      readerPages.addEventListener('pointerup',release);readerPages.addEventListener('pointercancel',release)}
    // Reading comfort (the Aa panel): text size, typeface, page tone and spacing, remembered between visits.
    const READER_FACES={classic:"Georgia,'Times New Roman',serif",garamond:"'Cormorant Garamond',Georgia,serif",clear:"system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif"},READER_LEADING={snug:.92,comfortable:1,airy:1.14},READER_TONES=['parchment','sepia','night'];
    const readerPrefs=Object.assign({scale:1,face:'classic',tone:'parchment',leading:'comfortable'},(()=>{try{return JSON.parse(localStorage.getItem('athenaeum-reader-prefs')||'{}')}catch(ignore){return {}}})());
    function applyReaderPrefs(repaginate=true){readerPrefs.scale=clamp(Math.round((Number(readerPrefs.scale)||1)*100)/100,.8,1.6);if(!READER_FACES[readerPrefs.face])readerPrefs.face='classic';if(!READER_TONES.includes(readerPrefs.tone))readerPrefs.tone='parchment';if(!READER_LEADING[readerPrefs.leading])readerPrefs.leading='comfortable';const root=document.documentElement.style;root.setProperty('--reader-scale',readerPrefs.scale);root.setProperty('--reader-face',READER_FACES[readerPrefs.face]);root.setProperty('--reader-leading',READER_LEADING[readerPrefs.leading]);for(const tone of READER_TONES)ui.reader.classList.toggle('tone-'+tone,readerPrefs.tone===tone);$('#readerScaleLabel').textContent=Math.round(readerPrefs.scale*100)+'%';for(const group of document.querySelectorAll('#readerPrefs .pref-choices'))for(const button of group.querySelectorAll('button'))button.setAttribute('aria-pressed',String(readerPrefs[group.dataset.group]===button.dataset.value));try{localStorage.setItem('athenaeum-reader-prefs',JSON.stringify(readerPrefs))}catch(ignore){}if(!repaginate)return;/* Measure with the chosen face once it has loaded, or the pages would be cut for the fallback font. */const face=READER_FACES[readerPrefs.face];Promise.resolve(document.fonts?.load?.(`16px ${face}`)).catch(()=>{}).then(()=>{if(!ui.reader.classList.contains('hidden'))repaginateSelected()})}
    function setReaderScale(scale,repaginate=true){readerPrefs.scale=scale;applyReaderPrefs(repaginate)}
    function toggleReaderPrefs(open=$('#readerPrefs').classList.contains('hidden')){$('#readerPrefs').classList.toggle('hidden',!open);$('#readerStyle').setAttribute('aria-expanded',String(open))}
    $('#readerPrefsTip').textContent=touchMode?'Tip: pinch the page to resize the text, and tap its left or right edge to turn.':'Tip: the arrow keys turn pages; A− and A+ also change the size.';
    $('#readerStyle').addEventListener('click',e=>{e.stopPropagation();toggleReaderPrefs()});
    $('#readerPrefs').addEventListener('click',e=>{const button=e.target.closest('button');if(!button)return;e.stopPropagation();if(button.dataset.pref==='smaller')setReaderScale(readerPrefs.scale-.08);else if(button.dataset.pref==='larger')setReaderScale(readerPrefs.scale+.08);else{const group=button.closest('.pref-choices')?.dataset.group;if(group){readerPrefs[group]=button.dataset.value;applyReaderPrefs(group!=='tone')}}});
    ui.reader.addEventListener('click',e=>{if(!$('#readerPrefs').classList.contains('hidden')&&!e.target.closest('#readerPrefs,#readerStyle'))toggleReaderPrefs(false)});
    window.addEventListener('keydown',e=>{if(e.code==='Escape'&&!$('#readerPrefs').classList.contains('hidden')){e.preventDefault();e.stopImmediatePropagation();toggleReaderPrefs(false)}},true);
    $('#fontUp').addEventListener('click',()=>setReaderScale(readerPrefs.scale+.08));$('#fontDown').addEventListener('click',()=>setReaderScale(readerPrefs.scale-.08));
    applyReaderPrefs(false);
    $('#bookmark').addEventListener('click',()=>{if(!selected)return;const b=selected.userData.book,key='athenaeum-bookmark-'+b.id;if(localStorage.getItem(key)==b.page)localStorage.removeItem(key);else localStorage.setItem(key,b.page);renderReader(b)});
    // Word help for English learners (word-help.js): a footer toggle, tap a word for its meaning.
    window.libraryWordHelp?.install();
    $('#modeToggle').addEventListener('click',()=>{const imm=ui.reader.classList.toggle('immersive');ui.reader.classList.toggle('comfort',!imm);$('#modeToggle').textContent=imm?'Comfort mode':'Immersive mode';repaginateSelected()});
    ui.mute.addEventListener('click',()=>{muted=!muted;soundscape?.setMuted(muted);ui.mute.textContent=muted?'♩':'♪';ui.mute.title=muted?'Unmute sound':'Mute sound';if(master)master.gain.setTargetAtTime(muted?0:soundLevel,audioCtx.currentTime,.08);for(const {pool}of samplePools.values())for(const audio of pool){audio.muted=muted;if(muted){audio.pause();audio.currentTime=0}}});
    // Reading cards (reading-card.js): the reader's place in each book, carried to their other devices by a code.
    {const card=window.AthenaeumCard,panel=$('#cardSync');
      const refresh=()=>{if(!card||!panel)return;panel.hidden=!card.available();const c=card.code;$('#cardState').textContent=c?`This device uses the reading card ${c}. Enter the same code on your other devices.`:'';$('#cardMake').hidden=!!c;$('#cardForget').hidden=!c;$('#cardJoin').hidden=!!c};
      // Bookmarks brought back from the card, for the books not open just now.
      const settle=result=>{if(result?.pulled)for(const b of books)if(b!==selected?.userData?.book)b.progress=loadSavedProgress(b.id)};
      const say=text=>{$('#cardState').textContent=text};
      if(card&&panel){refresh();
        $('#cardMake').addEventListener('click',async()=>{say('Making a card…');try{await card.make();refresh();card.start()}catch(error){say(error.message)}});
        $('#cardUse').addEventListener('click',async()=>{say('Finding the card…');try{settle(await card.use($('#cardCode').value));$('#cardCode').value='';refresh();card.start()}catch(error){say(error.message)}});
        $('#cardForget').addEventListener('click',()=>{card.forget();refresh();say('This device has forgotten the card. Your bookmarks here are kept.')});
        if(card.code){card.sync().then(settle);card.start()}}}
    $('#settingsButton').addEventListener('click',openSettings);$('#pauseSettings').addEventListener('click',openSettings);$('#closeSettings').addEventListener('click',closeSettings);$('#saveSettings').addEventListener('click',closeSettings);$('#volumeControl').addEventListener('input',()=>applySettings(false));$('#reducedMotion').addEventListener('change',()=>applySettings(false));$('#lowBandwidth').addEventListener('change',()=>applySettings(false));$('#highContrast').addEventListener('change',()=>applySettings(false));$('#largeText').addEventListener('change',()=>applySettings(false));$('#freshVisit').addEventListener('click',()=>{if(!confirm('Start a fresh visit? This clears reading progress, discoveries, and saved settings in this browser.'))return;for(let i=localStorage.length-1;i>=0;i--){const key=localStorage.key(i);if(key?.startsWith('athenaeum-')||key?.startsWith('library-'))localStorage.removeItem(key)}location.reload()});
    document.addEventListener('keydown',e=>{if(settingsOpen){e.stopImmediatePropagation();/* O closes the panel, except while typing a reading card's code */if(e.code==='Escape'||e.code==='KeyO'&&e.target?.type!=='text'){e.preventDefault();closeSettings()}return}if(e.code==='KeyO'&&started&&!chatOpen&&!selected&&ui.reader.classList.contains('hidden')&&ui.journal.classList.contains('hidden')){e.preventDefault();e.stopImmediatePropagation();openSettings()}},true);
    // cycle weather unobtrusively every two minutes; begin with rain
    setInterval(()=>{weather=weather==='RAIN'?'CLEAR':weather==='CLEAR'?'STORM':'RAIN';ui.weather.textContent=weather;if(rainFilter)rainFilter.frequency.setTargetAtTime(rainCutoff(),audioCtx.currentTime,2);if(noiseGain)noiseGain.gain.setTargetAtTime(weather==='CLEAR'?.05:weather==='STORM'?.42:.28,audioCtx.currentTime,2)},120000);
    addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(!ui.reader.classList.contains('hidden'))repaginateSelected()},180)});
    // --- touch controls (mobile) ---
    (function(){
      const tMove=$('#touchMove'),tStick=$('#touchStick'),tLook=$('#touchLook'),tInteract=$('#touchInteract'),tRun=$('#touchRun'),tJournal=$('#touchJournal'),tReturn=$('#touchReturn'),tMenu=$('#touchMenu');
      if(!touchMode||!tMove||!tLook||!tStick||!tInteract||!tRun||!tJournal||!tReturn||!tMenu)return;
      let moveId=null, moveOrigin={x:0,y:0}, lookId=null, lookLast={x:0,y:0};
      const STICK_MAX=46,DEAD=.12;
      function stickReset(){tStick.style.transform='translate(0,0)';touchMoveX=0;touchMoveY=0}
      function stickUpdate(dx,dy){const dist=Math.min(Math.hypot(dx,dy),STICK_MAX),ang=Math.atan2(dy,dx),cx=Math.cos(ang)*dist,cy=Math.sin(ang)*dist;tStick.style.transform=`translate(${cx}px,${cy}px)`;const strength=dist/STICK_MAX;if(strength<DEAD){touchMoveX=0;touchMoveY=0}else{touchMoveX=(cx/STICK_MAX-DEAD*Math.sign(cx))/(1-DEAD);touchMoveY=-(cy/STICK_MAX-DEAD*Math.sign(cy))/(1-DEAD);noteCoverMotion()}}
      tMove.addEventListener('pointerdown',e=>{if(!gameActive())return;e.preventDefault();moveId=e.pointerId;const r=tMove.getBoundingClientRect();moveOrigin={x:r.left+r.width/2,y:r.top+r.height/2};stickUpdate(e.clientX-moveOrigin.x,e.clientY-moveOrigin.y);try{tMove.setPointerCapture(moveId)}catch(err){}});
      tMove.addEventListener('pointermove',e=>{if(e.pointerId!==moveId)return;e.preventDefault();stickUpdate(e.clientX-moveOrigin.x,e.clientY-moveOrigin.y)});
      function moveEnd(e){if(moveId===null||e.pointerId!==moveId)return;moveId=null;stickReset()}
      tMove.addEventListener('pointerup',moveEnd);tMove.addEventListener('pointercancel',moveEnd);

      let tapStart=null;
      tLook.addEventListener('pointerdown',e=>{if(!gameActive())return;e.preventDefault();lookId=e.pointerId;lookLast={x:e.clientX,y:e.clientY};tapStart={x:e.clientX,y:e.clientY,t:performance.now()};try{tLook.setPointerCapture(lookId)}catch(err){}});
      tLook.addEventListener('pointermove',e=>{if(e.pointerId!==lookId)return;e.preventDefault();const dx=e.clientX-lookLast.x,dy=e.clientY-lookLast.y;lookLast={x:e.clientX,y:e.clientY};if(dx||dy)noteCoverMotion();player.yaw-=dx*.0034;player.pitch=clamp(player.pitch-dy*.0032,-1.42,1.42)});
      // A quick tap, without dragging, on a book or anything else in reach uses it, as the round button does.
      function lookEnd(e){if(lookId===null||e.pointerId!==lookId)return;lookId=null;const s=tapStart;tapStart=null;if(e.type==='pointerup'&&s&&performance.now()-s.t<450&&Math.hypot(e.clientX-s.x,e.clientY-s.y)<12)interactAt(e.clientX,e.clientY)}
      tLook.addEventListener('pointerup',lookEnd);tLook.addEventListener('pointercancel',lookEnd);

      tInteract.addEventListener('pointerdown',e=>{e.preventDefault();if(gameActive())interact()});
      tRun.addEventListener('pointerdown',e=>{e.preventDefault();touchSprint=true;tRun.classList.add('ready');try{tRun.setPointerCapture(e.pointerId)}catch(err){}});const stopRun=e=>{e.preventDefault();touchSprint=false;tRun.classList.remove('ready')};tRun.addEventListener('pointerup',stopRun);tRun.addEventListener('pointercancel',stopRun);
      tJournal.addEventListener('pointerdown',e=>{e.preventDefault();if(started&&gameActive())openJournal()});
      tReturn.addEventListener('pointerdown',e=>{e.preventDefault();if(started)resetPosition()});
      tMenu.addEventListener('pointerdown',e=>{e.preventDefault();if(!started||!gameActive())return;for(const k in keys)keys[k]=false;player.vel.set(0,0,0);ui.pause.classList.remove('hidden')});
      window.addEventListener('blur',()=>{moveId=null;lookId=null;touchSprint=false;stickReset()});
    })();

    // Additive descent integration: all existing navigation and interaction handlers remain fallbacks.
    const expeditionBook={...books.find(b=>b.id===18857),id:3748,title:'Journey to the Centre of the Earth',category:'Journey',progress:loadSavedProgress(3748),textPath:'texts/pg3748.txt',textUrl:'https://www.gutenberg.org/cache/epub/3748/pg3748.txt',sourceUrl:'https://www.gutenberg.org/ebooks/3748'};
    const subterraneanBooks=[
      [1355,'The Underground City; Or, The Black Indies','Jules Verne','#34434a','A coal mine thought exhausted opens into a hidden underground world. Verne asks what happens when the depths become a home rather than merely a passage. I keep this beside the expedition copy: the earth has more than one kind of interior.'],
      [545,"At the Earth's Core",'Edgar Rice Burroughs','#593e2f','A drilling machine carries two explorers into Pellucidar, an imagined world inside the earth. Its geology belongs to adventure, not science; its confidence belongs to its era. After all those stairs, a mechanical descent may sound rather tempting.'],
      [1951,'The Coming Race','Edward Bulwer-Lytton','#413647','A descent through a chasm reveals a subterranean civilisation and the unsettling power called Vril. Read its apparent perfection with care: the visitor brings the prejudices of the surface below ground with him. A hidden world is not necessarily a welcoming one.']
    ].map(([id,title,author,fieldColour,note])=>{librarianNotes[id]=librarianNotes[id]||note;window.ATHENAEUM_EXTRA_NOTES[id]=window.ATHENAEUM_EXTRA_NOTES[id]||note;return {...expeditionBook,id,title,author,fieldColour,progress:loadSavedProgress(id),textPath:`texts/pg${id}.txt`,textUrl:`https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`,sourceUrl:`https://www.gutenberg.org/ebooks/${id}`}});
    const returnFade=document.createElement('div');returnFade.setAttribute('aria-hidden','true');returnFade.style.cssText='position:fixed;inset:0;background:#080604;opacity:0;pointer-events:none;z-index:22;';document.body.appendChild(returnFade);
    const verneDescent=window.createVerneDescent({THREE,scene,MAT,collider,colliders,interactables,canvasTexture,wrapText,player,camera,book:expeditionBook,companionBooks:subterraneanBooks,performanceZones,rememberLights,
      onFade:opacity=>{returnFade.style.opacity=String(opacity)},
      onBell:()=>{for(const k in keys)keys[k]=false;touchMoveX=touchMoveY=0;touchSprint=false;player.vel.set(0,0,0);sound(880,1.2,'sine',.16);sound(1320,.85,'sine',.055)},
      onReturn:()=>{resetPosition();showNotice('The bell answers from the entrance clock. You are back among the shelves.',5)},
      notice:text=>showNotice(text,5),click:()=>{sound(1500,.05,'triangle',.06);setTimeout(()=>sound(1150,.05,'triangle',.035),110)}
    });
    // Going down: the earth's rumble grows, a brass gauge shows the depth, and every minute or so a distant
    // tremor shakes loose some grit (the view trembles only if motion is allowed).
    let nextTremorAt=0,depthGauge=null,gaugeShown=-1;
    function showDepth(metres){
      if(!depthGauge){if(metres<=0)return;depthGauge=document.createElement('div');depthGauge.className='depth-gauge';depthGauge.setAttribute('role','img');
        depthGauge.innerHTML='<svg viewBox="-30 -30 60 60" aria-hidden="true"><circle r="27" class="dg-rim"/><circle r="23" class="dg-face"/>'+Array.from({length:7},(_,i)=>{const a=(-135+i*45)*Math.PI/180;return `<line x1="${(Math.sin(a)*17).toFixed(1)}" y1="${(-Math.cos(a)*17).toFixed(1)}" x2="${(Math.sin(a)*22).toFixed(1)}" y2="${(-Math.cos(a)*22).toFixed(1)}"/>`}).join('')+'<g class="dg-needle"><line x1="0" y1="4" x2="0" y2="-19"/></g><circle r="2.6" class="dg-hub"/></svg><div><small>Depth</small><b></b></div>';
        ui.status.prepend(depthGauge)}
      const shown=Math.round(metres);depthGauge.classList.toggle('visible',metres>.5);if(shown===gaugeShown)return;gaugeShown=shown;
      depthGauge.querySelector('b').textContent=`${shown} m`;depthGauge.setAttribute('aria-label',`Depth ${shown} metres below the reading room`);
      depthGauge.querySelector('.dg-needle').style.transform=`rotate(${-135+clamp(metres/60,0,1)*270}deg)`;
    }
    function updateDeep(t,dt,metres){
      soundscape?.setDepth?.(clamp(metres/58,0,1));showDepth(metres);
      // The rock presses in: the view narrows a little the deeper it goes.
      camera.userData.pressing=7*clamp(metres/58,0,1);
      soundscape?.setSea?.(verneDescent.seaLevel||0);
      camera.userData.shake=Math.max(0,(camera.userData.shake||0)-dt);
      if(metres<12){nextTremorAt=0;return}
      if(!nextTremorAt)nextTremorAt=t+14+Math.random()*14;
      if(t<nextTremorAt)return;nextTremorAt=t+50+Math.random()*45;
      const strength=clamp(.55+metres/60,.6,1);soundscape?.tremor?.(strength);verneDescent.tremor();
      if(!reducedMotion)camera.userData.shake=1.5;
      if(depthGauge){depthGauge.classList.remove('shiver');void depthGauge.offsetWidth;depthGauge.classList.add('shiver')}
    }
    const libraryGameActive=gameActive;
    gameActive=function(){return !verneDescent.returning&&libraryGameActive()};
    const libraryFloorHeight=floorHeight;
    floorHeight=function(x,z){return verneDescent.floorAt(x,z)??libraryFloorHeight(x,z)};
    const libraryAllowed=allowed;
    allowed=function(x,z,y=floorHeight(x,z)){
      if(!verneDescent.contains(x,z))return libraryAllowed(x,z,y);
      const r=player.radius,floorY=floorHeight(x,z);
      for(const [dx,dz] of [[r,0],[-r,0],[0,r],[0,-r],[r*.707,r*.707],[-r*.707,r*.707],[r*.707,-r*.707],[-r*.707,-r*.707]]){
        const sx=x+dx,sz=z+dz;
        if(!verneDescent.contains(sx,sz)&&!(sx>19&&sx<37&&sz>-14&&sz<10))return false;
      }
      for(const c of nearbyColliders(x,z)){if(c.inactive||floorY<c.minY||floorY>c.maxY)continue;if(x+r>c.minX&&x-r<c.maxX&&z+r>c.minZ&&z-r<c.maxZ)return false}
      return true;
    };
    const libraryInteract=interact;
    interact=function(){if(verneDescent.returning)return;if(focus&&!selected&&verneDescent.interact(focus)){if(focus.userData.type==='verne-descent-panel'&&!playSample('secretDoor',.85,.92))sound(85,.65,'triangle',.1);return}return libraryInteract()};
    const libraryFocus=updateFocus;
    updateFocus=function(dt){libraryFocus(dt);if(focus&&verneDescent.contains(player.pos.x,player.pos.z)){focus.getWorldPosition(tmpWorldPosition2);raycaster.setFromCamera(screenCentre,camera);if(!verneDescent.clearLine(raycaster,focus,tmpWorldPosition2.distanceTo(camera.position))){focus=null;ui.prompt.style.opacity=0;ui.reticle.classList.remove('active')}}};
    const libraryAmbientEvent=triggerAmbientEvent;
    triggerAmbientEvent=function(){if(verneDescent.contains(player.pos.x,player.pos.z)&&player.pos.y<-.5){nextAmbientAt=performance.now()+65000+Math.random()*50000;sound(48,2,'sine',.025);return}return libraryAmbientEvent()};
    const libraryWorldUpdate=updateWorld,fillLights=scene.children.filter(l=>l.isAmbientLight).map(l=>({light:l,intensity:l.intensity}));
    updateWorld=function(t,dt){
      libraryWorldUpdate(t,dt);
      const depth=verneDescent.update(t,dt,reducedMotion,sound);
      updateDeep(t,dt,verneDescent.metres);
      ambient.intensity*=1-depth*.62;moon.intensity*=1-depth*.8;
      for(const {light,intensity} of fillLights)light.intensity=intensity*(1-depth*.65);
      readerLantern.intensity=selected?6.4:6.4*(1-depth*.45);
      if(depth>0){scene.background.lerp(skyTarget.setHex(0x11140f),depth);/* Warmer towards the bottom, as Verne found it. */const warmth=clamp((verneDescent.metres-24)/32,0,1);if(warmth>0)scene.background.lerp(skyTarget.setHex(0x2c1608),warmth);scene.fog.color.copy(scene.background);scene.fog.density=Math.max(scene.fog.density,.028*depth);if(noiseGain)noiseGain.gain.setTargetAtTime((weather==='CLEAR'?.05:weather==='STORM'?.42:.28)*(1-depth*.98),audioCtx.currentTime,.4);if(fireCrackleGain)fireCrackleGain.gain.setTargetAtTime(.003,audioCtx.currentTime,.3)}
      else if(noiseGain)noiseGain.gain.setTargetAtTime(weather==='CLEAR'?.05:weather==='STORM'?.42:.28,audioCtx.currentTime,.4);
    };
    const nightRailway=window.createNightTrain({ride:trainRide,whistle:()=>playSample('trainWhistle',1,.97+Math.random()*.05),steam:steamHiss,THREE,scene,MAT,player,collider,colliders,nearbyColliders,interactables,registerSeat,camera,chooseDestination:openJourneyPicker,canvasTexture,wrapText,coverTexture,
      books:[1874,27924,614,103,46597,18857,900001,900002,900003,900004,900005,900006,51568,1268,1906,14107,1302].map(id=>books.find(b=>b.id===id)).filter(Boolean),arrivals:{signal:newArrivals.list('signal'),tide:newArrivals.list('tide')},performanceZones,rememberLights,
      modelTemplate:url=>seatTemplate({url}),isLowBandwidth:()=>lowBandwidth,
      move:(x,z,yaw)=>{finishTrainPass();for(const k in keys)keys[k]=false;touchMoveX=touchMoveY=0;touchSprint=false;const spot=nearestWalkable(x,z)||{x,z};x=spot.x;z=spot.z;player.pos.set(x,0,z);player.vel.set(0,0,0);player.yaw=yaw;player.pitch=0;lastSafePosition.copy(player.pos);camera.position.set(x,1.72,z);camera.rotation.set(0,yaw,0,'YXZ');camera.updateMatrixWorld();focus=null},
      notice:showNotice,sound,home:()=>{resetPosition();sound(880,.9,'sine',.12);showNotice('The conductor’s bell answers from the entrance clock. Your return ticket is still valid.',6)}
    });
    const originalMemoryVisibility=performanceZones.memory.isNeeded;performanceZones.memory.isNeeded=()=>player.pos.x<190&&originalMemoryVisibility();
    const preRailAllowed=allowed;allowed=function(x,z,y=floorHeight(x,z)){return nightRailway.zoneAt(x,z)?nightRailway.allowed(x,z):preRailAllowed(x,z,y)};
    const preRailInteract=interact;interact=function(){if(focus&&!selected&&nightRailway.interact(focus)){sound(180,.3,'triangle',.07);return}return preRailInteract()};
    const preRailReset=resetPosition;resetPosition=function(){nightRailway.cancel();return preRailReset()};
    const preRailFocus=updateFocus;updateFocus=function(dt){preRailFocus(dt);if(focus&&nightRailway.zoneAt(player.pos.x,player.pos.z)){focus.getWorldPosition(tmpWorldPosition2);raycaster.setFromCamera(screenCentre,camera);if(!nightRailway.clearLine(raycaster,focus,tmpWorldPosition2.distanceTo(camera.position))){focus=null;ui.prompt.style.opacity=0;ui.reticle.classList.remove('active')}}};
    const preRailAmbient=triggerAmbientEvent;triggerAmbientEvent=function(){if(nightRailway.zoneAt(player.pos.x,player.pos.z)){nextAmbientAt=performance.now()+90000;return}return preRailAmbient()};
    const preRailWorld=updateWorld;updateWorld=function(t,dt){preRailWorld(t,dt);const active=started&&!settingsOpen&&!chatOpen&&!supportOpen&&ui.pause.classList.contains('hidden')&&ui.journal.classList.contains('hidden');const onRailway=nightRailway.update(t,dt,reducedMotion,active,sound);if(!onRailway)trainRide(0);if(onRailway){const depot=nightRailway.zoneAt(player.pos.x,player.pos.z)?.key==='depot';scene.background.setHex(depot?0x18232c:0x151e27);scene.fog.color.copy(scene.background);scene.fog.density=depot?.014:.032;ambient.intensity=depot?1.12:.58;moon.intensity=depot?.3:.18;if(noiseGain)noiseGain.gain.setTargetAtTime(.015,audioCtx.currentTime,.3);if(fireCrackleGain)fireCrackleGain.gain.setTargetAtTime(.002,audioCtx.currentTime,.3)}};
    // Keep travelling while the 2D reader covers the world, but pause with menus or a hidden tab.
    // The existing rumble asset gets a separate lazy pool, so ambient train passes remain untouched.
    const preRailCovered=worldIsCovered;let lastRailTick=performance.now(),rideAudio=null,ridePlaying=false;
    worldIsCovered=function(){const now=performance.now(),dt=Math.min(.05,Math.max(0,(now-lastRailTick)/1000));lastRailTick=now;const covered=preRailCovered(),paused=document.hidden||settingsOpen||chatOpen||supportOpen||!ui.pause.classList.contains('hidden')||!ui.journal.classList.contains('hidden');
      if(covered&&!paused&&started&&!ui.reader.classList.contains('hidden')&&nightRailway.travelling)nightRailway.update(clock.elapsedTime,dt,reducedMotion,true,sound);
      const moving=started&&!paused&&!muted&&nightRailway.travelling&&nightRailway.zoneAt(player.pos.x,player.pos.z)?.key==='carriage';
      if(moving&&!rideAudio){rideAudio=new Audio('assets/audio/train-rumble-distant.ogg');rideAudio.loop=true;rideAudio.playsInline=true;samplePools.set('nightRideRumble',{pool:[rideAudio],index:0})}
      if(rideAudio){rideAudio.muted=muted;rideAudio.volume=clamp(.12*(soundLevel/.13),0,1);if(moving&&!ridePlaying){ridePlaying=true;const attempt=rideAudio.play();if(attempt?.catch)attempt.catch(()=>{})}else if(!moving&&ridePlaying){rideAudio.pause();ridePlaying=false;if(!nightRailway.travelling)rideAudio.currentTime=0}}
      return covered;
    };
    document.addEventListener('visibilitychange',()=>{if(document.hidden&&rideAudio){rideAudio.pause();ridePlaying=false}});
    const librarianOffice=window.createLibrarianOffice({THREE,scene,MAT,publicStone:entranceStone,publicParquet:parquetFloor.material,player,interactables,books,coverTexture,canvasTexture,showNotice,playSample,
      move:(x,z,yaw)=>{finishTrainPass();for(const k in keys)keys[k]=false;touchMoveX=touchMoveY=0;touchSprint=false;const spot=nearestWalkable(x,z)||{x,z};x=spot.x;z=spot.z;player.pos.set(x,0,z);player.vel.set(0,0,0);player.yaw=yaw;player.pitch=0;lastSafePosition.copy(player.pos);camera.position.set(x,1.72,z);camera.rotation.set(0,yaw,0,'YXZ');camera.updateMatrixWorld();focus=null}
    });
    const preOfficeFloor=floorHeight;floorHeight=function(x,z){return librarianOffice.floorAt(x,z)??preOfficeFloor(x,z)};
    const preOfficeAllowed=allowed;allowed=function(x,z,y=floorHeight(x,z)){return librarianOffice.contains(x,z)?librarianOffice.allowed(x,z):preOfficeAllowed(x,z,y)};
    const preOfficeInteract=interact;interact=function(){if(focus&&!selected&&librarianOffice.interact(focus)){focus=null;ui.prompt.style.opacity=0;return}return preOfficeInteract()};
    const afterDarkExpansion=window.createAfterDarkExpansion({doorKit:getDoorKit(),THREE,scene,MAT,publicStone:entranceStone,publicParquet:parquetFloor.material,player,camera,interactables,books,bookMaterial,canvasTexture,showNotice,playSample,sound,analytics:window.libraryAnalytics,isLowBandwidth:()=>lowBandwidth,modelTemplate:url=>seatTemplate({url}),
      move:(x,z,yaw)=>{finishTrainPass();for(const k in keys)keys[k]=false;touchMoveX=touchMoveY=0;touchSprint=false;const spot=nearestWalkable(x,z)||{x,z};x=spot.x;z=spot.z;player.pos.set(x,0,z);player.vel.set(0,0,0);player.yaw=yaw;player.pitch=0;lastSafePosition.copy(player.pos);camera.position.set(x,1.72,z);camera.rotation.set(0,yaw,0,'YXZ');camera.updateMatrixWorld();focus=null}
    });
    const preAfterDarkFloor=floorHeight;floorHeight=function(x,z){return afterDarkExpansion.floorAt(x,z)??preAfterDarkFloor(x,z)};
    const preAfterDarkAllowed=allowed;allowed=function(x,z,y=floorHeight(x,z)){return afterDarkExpansion.contains(x,z)?afterDarkExpansion.allowed(x,z):preAfterDarkAllowed(x,z,y)};
    const preAfterDarkInteract=interact;interact=function(){if(focus&&!selected&&afterDarkExpansion.interact(focus)){focus=null;ui.prompt.style.opacity=0;return}return preAfterDarkInteract()};
    // Four curious doors in the Grand Hall, each opening onto a small themed room built on demand.
    const curiousDoors=window.createCuriousDoors?.({doorKit:getDoorKit(),THREE,scene,MAT,player,camera,interactables,books,bookMaterial,canvasTexture,showNotice,playSample,sound,registerSeat,analytics:window.libraryAnalytics,isLowBandwidth:()=>lowBandwidth,isReducedMotion:()=>reducedMotion,
      move:(x,z,yaw)=>{finishTrainPass();for(const k in keys)keys[k]=false;touchMoveX=touchMoveY=0;touchSprint=false;const spot=nearestWalkable(x,z)||{x,z};x=spot.x;z=spot.z;player.pos.set(x,0,z);player.vel.set(0,0,0);player.yaw=yaw;player.pitch=0;lastSafePosition.copy(player.pos);camera.position.set(x,1.72,z);camera.rotation.set(0,yaw,0,'YXZ');camera.updateMatrixWorld();focus=null}
    });
    if(curiousDoors){
      const preCuriousFloor=floorHeight;floorHeight=function(x,z){return curiousDoors.floorAt(x,z)??preCuriousFloor(x,z)};
      const preCuriousAllowed=allowed;allowed=function(x,z,y=floorHeight(x,z)){return curiousDoors.contains(x,z)?curiousDoors.allowed(x,z):preCuriousAllowed(x,z,y)};
      const preCuriousInteract=interact;interact=function(){if(focus&&!selected&&curiousDoors.interact(focus)){focus=null;ui.prompt.style.opacity=0;return}return preCuriousInteract()};
      
    }
    // The Room of the Day: one reusable room, dressed each day with ten books (daily-room.js, data/daily-rooms.js).
    const dailyRoom=window.createDailyRoom?.({doorKit:getDoorKit(),THREE,scene,MAT,player,interactables,registerSeat,canvasTexture,bookMaterial,showNotice,playSample,sound,analytics:window.libraryAnalytics,
      registerBook:record=>{if(!record?.id)return null;let book=books.find(b=>b.id===record.id);if(book)return book;book={...record,category:'daily',fame:1,source:'Project Gutenberg',sourceUrl:`https://www.gutenberg.org/ebooks/${record.id}`,licence:'Public Domain',textUrl:`https://www.gutenberg.org/cache/epub/${record.id}/pg${record.id}.txt`,progress:loadSavedProgress(record.id),index:books.length};books.push(book);return book},
      move:(x,z,yaw)=>{finishTrainPass();for(const k in keys)keys[k]=false;touchMoveX=touchMoveY=0;touchSprint=false;player.pos.set(x,0,z);player.vel.set(0,0,0);player.yaw=yaw;player.pitch=0;lastSafePosition.copy(player.pos);camera.position.set(x,1.72,z);camera.rotation.set(0,yaw,0,'YXZ');camera.updateMatrixWorld();focus=null}
    });
    if(dailyRoom){
      const preDailyFloor=floorHeight;floorHeight=function(x,z){return dailyRoom.floorAt(x,z)??preDailyFloor(x,z)};
      const preDailyAllowed=allowed;allowed=function(x,z,y=floorHeight(x,z)){return dailyRoom.contains(x,z)?dailyRoom.allowed(x,z):preDailyAllowed(x,z,y)};
      const preDailyInteract=interact;interact=function(){if(focus&&!selected&&dailyRoom.interact(focus)){focus=null;ui.prompt.style.opacity=0;return}return preDailyInteract()};
    }
    // The Room of Chance: a hidden portrait on the east wall opens onto shelves shuffled without theme or hierarchy.
    const chanceRoom=window.createChanceRoom?.({THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,showNotice,playSample,analytics:window.libraryAnalytics,isHolding:()=>!!selected,
      findBook:id=>books.find(b=>b.id===id),
      move:(x,z,yaw)=>{finishTrainPass();for(const k in keys)keys[k]=false;touchMoveX=touchMoveY=0;touchSprint=false;player.pos.set(x,0,z);player.vel.set(0,0,0);player.yaw=yaw;player.pitch=0;lastSafePosition.copy(player.pos);camera.position.set(x,1.72,z);camera.rotation.set(0,yaw,0,'YXZ');camera.updateMatrixWorld();focus=null}
    });
    if(chanceRoom){
      const preChanceFloor=floorHeight;floorHeight=function(x,z){return chanceRoom.floorAt(x,z)??preChanceFloor(x,z)};
      const preChanceAllowed=allowed;allowed=function(x,z,y=floorHeight(x,z)){return chanceRoom.contains(x,z)?chanceRoom.allowed(x,z):preChanceAllowed(x,z,y)};
      const preChanceInteract=interact;interact=function(){if(focus&&!selected&&chanceRoom.interact(focus)){focus=null;ui.prompt.style.opacity=0;return}return preChanceInteract()};
    }
    // The archive script downloads only after the cold hearth is discovered.
    const cinderArchive=window.createCinderArchive?.({THREE,scene,MAT,player,interactables,canvasTexture,showNotice,playSample,isHolding:()=>!!selected,
      findBook:id=>books.find(b=>b.id===id),arrivals:()=>newArrivals.list('cinder'),prepareReturn:()=>buildThemeRooms('gothic'),
      move:(x,z,yaw)=>{finishTrainPass();for(const k in keys)keys[k]=false;touchMoveX=touchMoveY=0;touchSprint=false;player.pos.set(x,0,z);player.vel.set(0,0,0);player.yaw=yaw;player.pitch=0;lastSafePosition.copy(player.pos);camera.position.set(x,1.72,z);camera.rotation.set(0,yaw,0,'YXZ');camera.updateMatrixWorld();focus=null}
    });
    if(cinderArchive){
      const preCinderFloor=floorHeight;floorHeight=function(x,z){return cinderArchive.floorAt(x,z)??preCinderFloor(x,z)};
      const preCinderAllowed=allowed;allowed=function(x,z,y=floorHeight(x,z)){return cinderArchive.contains(x,z)?cinderArchive.allowed(x,z):preCinderAllowed(x,z,y)};
      const preCinderInteract=interact;interact=function(){if(focus&&!selected&&cinderArchive.interact(focus)){focus=null;ui.prompt.style.opacity=0;return}return preCinderInteract()};
    }
    // The Boathouse and Crusoe's island (crusoe-island.js): a door in the hall, a sunrise crossing, an island.
    const crusoeIsland=window.createCrusoeIsland?.({doorKit:getDoorKit(),THREE,scene,MAT,player,camera,interactables,canvasTexture,bookMaterial,renderer,ambient,moon,showNotice,playSample,sound,
      findBook:id=>books.find(b=>b.id===id),noise:(d,v,f)=>paperNoise(d,v,f),fade:o=>{returnFade.style.opacity=String(o)},analytics:window.libraryAnalytics,
      isReducedMotion:()=>reducedMotion,isHolding:()=>!!selected,storage:(()=>{try{return localStorage}catch(e){return null}})(),
      move:(x,z,yaw)=>{finishTrainPass();for(const k in keys)keys[k]=false;touchMoveX=touchMoveY=0;touchSprint=false;player.pos.set(x,0,z);player.vel.set(0,0,0);player.yaw=yaw;player.pitch=0;lastSafePosition.copy(player.pos);camera.position.set(x,1.72,z);camera.rotation.set(0,yaw,0,'YXZ');camera.updateMatrixWorld();focus=null}
    });
    if(crusoeIsland){
      const preIsleFloor=floorHeight;floorHeight=function(x,z){return crusoeIsland.floorAt(x,z)??preIsleFloor(x,z)};
      const preIsleAllowed=allowed;allowed=function(x,z,y=floorHeight(x,z)){return crusoeIsland.contains(x,z)?crusoeIsland.allowed(x,z):preIsleAllowed(x,z,y)};
      const preIsleInteract=interact;interact=function(){if(focus&&!selected&&crusoeIsland.interact(focus)){focus=null;ui.prompt.style.opacity=0;return}return preIsleInteract()};
      const preIsleActive=gameActive;gameActive=function(){return !crusoeIsland.travelling&&preIsleActive()};
      const preIsleReset=resetPosition;resetPosition=function(){crusoeIsland.reset();return preIsleReset()};
      const preIsleSurface=footstepSurface;footstepSurface=function(){return crusoeIsland.onSand(player.pos.x,player.pos.z)?'carpet':preIsleSurface()};
      const preIsleSpace=acousticSpace;acousticSpace=function(){const zone=crusoeIsland.zoneAt(player.pos.x,player.pos.z);return zone==='crusoe-island'?'outdoor':zone==='boathouse'?'room':preIsleSpace()};
    }
    // The English Reading Room (learners-room.js), off the west wing: graded shelves and word help.
    // Reading times for the new arrivals come from their own word counts (data/new-books-resolved.js), in the
    // same [level, minutes at a learner's pace, words] shape as data/learner-levels.js; their shelf sets the level.
    const learnerLevels={...(window.ATHENAEUM_LEARNER_LEVELS||{})};for(const [id,words] of Object.entries(newArrivals.words))if(!learnerLevels[id])learnerLevels[id]=[0,Math.max(1,Math.round(words/150)),words];
    const arrivalIds=room=>newArrivals.list(room).map(book=>book.id);
    const learnersRoom=window.createLearnersRoom?.({doorKit:getDoorKit(),THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,showNotice,playSample,sound,
      findBook:id=>books.find(b=>b.id===id),levels:learnerLevels,arrivals:{1:arrivalIds('learners-1'),2:arrivalIds('learners-2'),3:arrivalIds('learners-3'),4:arrivalIds('learners-4'),short:arrivalIds('learners-short')},wordHelp:window.libraryWordHelp,analytics:window.libraryAnalytics,
      language:()=>navigator.language||'en',isHolding:()=>!!selected,
      move:(x,z,yaw)=>{finishTrainPass();for(const k in keys)keys[k]=false;touchMoveX=touchMoveY=0;touchSprint=false;player.pos.set(x,0,z);player.vel.set(0,0,0);player.yaw=yaw;player.pitch=0;lastSafePosition.copy(player.pos);camera.position.set(x,1.72,z);camera.rotation.set(0,yaw,0,'YXZ');camera.updateMatrixWorld();focus=null}
    });
    if(learnersRoom){
      const preLearnersFloor=floorHeight;floorHeight=function(x,z){return learnersRoom.floorAt(x,z)??preLearnersFloor(x,z)};
      const preLearnersAllowed=allowed;allowed=function(x,z,y=floorHeight(x,z)){return learnersRoom.contains(x,z)?learnersRoom.allowed(x,z):preLearnersAllowed(x,z,y)};
      const preLearnersInteract=interact;interact=function(){if(focus&&!selected&&learnersRoom.interact(focus)){focus=null;ui.prompt.style.opacity=0;return}return preLearnersInteract()};
    }
    // The Set Texts Room (set-texts-room.js), through a door in the English Reading Room's east wall: the plays and
    // novels set for GCSE English Literature, kept out of the English Reading Room, which has only one darker book.
    const setTextsRoom=window.createSetTextsRoom?.({doorKit:getDoorKit(),THREE,scene,MAT,player,interactables,registerSeat,canvasTexture,bookMaterial,showNotice,playSample,
      findBook:id=>books.find(b=>b.id===id),arrivals:arrivalIds('set-texts'),learners:learnersRoom?.room,analytics:window.libraryAnalytics,isHolding:()=>!!selected,
      move:(x,z,yaw)=>{finishTrainPass();for(const k in keys)keys[k]=false;touchMoveX=touchMoveY=0;touchSprint=false;player.pos.set(x,0,z);player.vel.set(0,0,0);player.yaw=yaw;player.pitch=0;lastSafePosition.copy(player.pos);camera.position.set(x,1.72,z);camera.rotation.set(0,yaw,0,'YXZ');camera.updateMatrixWorld();focus=null}
    });
    if(setTextsRoom){
      const preSetFloor=floorHeight;floorHeight=function(x,z){return setTextsRoom.floorAt(x,z)??preSetFloor(x,z)};
      const preSetAllowed=allowed;allowed=function(x,z,y=floorHeight(x,z)){return setTextsRoom.contains(x,z)?setTextsRoom.allowed(x,z):preSetAllowed(x,z,y)};
      const preSetInteract=interact;interact=function(){if(focus&&!selected&&setTextsRoom.interact(focus)){focus=null;ui.prompt.style.opacity=0;return}return preSetInteract()};
      // Taking a book down in the Set Texts Room shows the librarian's note.
      const preSetSelect=selectBook;selectBook=function(bm){const result=preSetSelect(bm);const d=bm?.userData;if(d?.setText){const note=librarianNotes[d.book.id]||window.ATHENAEUM_EXTRA_NOTES?.[d.book.id];if(note)showNotice(`The librarian’s note: “${note}”`,11)}return result};
    }
    // The Evening Room (evening-room.js), off the east wing: books to finish in one sitting, each with a note.
    const eveningRoom=window.createEveningRoom?.({doorKit:getDoorKit(),THREE,scene,MAT,player,interactables,registerSeat,canvasTexture,bookMaterial,showNotice,playSample,
      // A book the main shelves do not list (some live only in the Room of the Day's schedule) is brought in, as the daily room does.
      findBook:(id,record)=>books.find(b=>b.id===id)||(record?.title?(()=>{const book={...record,category:'evening',fame:1,source:'Project Gutenberg',sourceUrl:`https://www.gutenberg.org/ebooks/${id}`,licence:'Public Domain',textUrl:`https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`,progress:loadSavedProgress(id),index:books.length};books.push(book);return book})():null),
      levels:learnerLevels,arrivals:{quick:arrivalIds('evening-quick'),hour:arrivalIds('evening-hour'),evening:arrivalIds('evening-evening')},analytics:window.libraryAnalytics,isHolding:()=>!!selected,
      move:(x,z,yaw)=>{finishTrainPass();for(const k in keys)keys[k]=false;touchMoveX=touchMoveY=0;touchSprint=false;player.pos.set(x,0,z);player.vel.set(0,0,0);player.yaw=yaw;player.pitch=0;lastSafePosition.copy(player.pos);camera.position.set(x,1.72,z);camera.rotation.set(0,yaw,0,'YXZ');camera.updateMatrixWorld();focus=null}
    });
    if(eveningRoom){
      const preEveningFloor=floorHeight;floorHeight=function(x,z){return eveningRoom.floorAt(x,z)??preEveningFloor(x,z)};
      const preEveningAllowed=allowed;allowed=function(x,z,y=floorHeight(x,z)){return eveningRoom.contains(x,z)?eveningRoom.allowed(x,z):preEveningAllowed(x,z,y)};
      const preEveningInteract=interact;interact=function(){if(focus&&!selected&&eveningRoom.interact(focus)){focus=null;ui.prompt.style.opacity=0;return}return preEveningInteract()};
      // Taking a book down in the Evening Room: its reading time under the title, and the librarian's note.
      const preEveningSelect=selectBook;selectBook=function(bm){const result=preEveningSelect(bm);const d=bm?.userData;if(d?.evening){const book=d.book;ui.actions.querySelector('em').textContent=`${book.author} · about ${d.readingTime}`;const note=librarianNotes[book.id]||window.ATHENAEUM_EXTRA_NOTES?.[book.id];if(note)showNotice(`The librarian’s note: “${note}”`,11)}return result};
    }
    // The Irish Room (irish-room.js), behind a green Georgian door in the Grand Hall's south wall: myth and legend, the
    // Revival, Irish writers and a small shelf of books in Irish, round a turf fire.
    // The fine books (fine-books.js): the Irish Room's Book of Kells on show under glass (kells-book.js) and the Book of
    // Durrow under a sod by the hearth (durrow-book.js), and the
    // Periodicals Room's Kelmscott Chaucer on the shelf of an Albion press (kelmscott-book.js), and the Medicine Room's
    // Fabrica of Vesalius under glass (vesalius-book.js). While one is open the world
    // is not drawn or walked; the book draws its own scene with the same renderer.
    const fineBookOptions={THREE,renderer,playSample,sound,
      onOpen:()=>{dragging=false;for(const k in keys)keys[k]=false;touchMoveX=touchMoveY=0;player.vel.set(0,0,0);document.exitPointerLock?.();document.body.classList.add('fine-book-open')},
      onClose:()=>{document.body.classList.remove('fine-book-open');requestLookLock()}};
    const kellsBook=window.createKellsBook?.(fineBookOptions),durrowBook=window.createDurrowBook?.(fineBookOptions),kelmscottBook=window.createKelmscottBook?.(fineBookOptions),vesaliusBook=window.createVesaliusBook?.(fineBookOptions),voynichBook=window.createVoynichBook?.(fineBookOptions);
    const fineBookOpen=()=>!!(kellsBook?.isOpen||durrowBook?.isOpen||kelmscottBook?.isOpen||vesaliusBook?.isOpen||voynichBook?.isOpen);
    // The Voynich Manuscript (voynich-book.js) lies open on the Restricted Catalogue's lectern at the pansy of folio 9v and
    // the plant facing it, chained to the lectern as the books of old libraries were, its padlock open: the one book here
    // nobody has ever needed to forbid. Anything on it opens the facsimile. The room is built at startup and never freed.
    if(voynichBook){
      const desk=new THREE.Group();desk.position.set(47,1.72,2.35);desk.rotation.x=-.22;scene.add(desk);
      // Turned to face a reader standing on the gate's side of the lectern, so the pages read the right way up.
      const book=new THREE.Group();book.position.set(-.4,.09,.02);book.rotation.y=Math.PI;desk.add(book);
      const vellum=new THREE.MeshStandardMaterial({color:0xd2c29c,roughness:.85}),loader=new THREE.TextureLoader(),pageW=.46,pageH=.46*1690/1160;
      const boards=new THREE.Mesh(new THREE.BoxGeometry(pageW*2+.06,.03,pageH+.04),vellum);boards.position.y=.015;book.add(boards);
      const page=(key,side)=>{const map=loader.load(`assets/voynich/${key}-case.jpg`);map.colorSpace=THREE.SRGBColorSpace;
        const mat=new THREE.MeshStandardMaterial({color:0xd8ceb8,map,emissive:0xffffff,emissiveMap:map,emissiveIntensity:.16,roughness:.9});
        const hinge=new THREE.Group();hinge.position.set(side*.006,.05,0);hinge.rotation.z=side*.05;book.add(hinge);
        const block=new THREE.Mesh(new THREE.BoxGeometry(pageW,.03,pageH),vellum);block.position.set(side*pageW/2,-.015,0);hinge.add(block);
        const m=new THREE.Mesh(new THREE.PlaneGeometry(pageW,pageH),mat);m.rotation.x=-Math.PI/2;m.position.set(side*pageW/2,.001,0);hinge.add(m);return m};
      const left=page('009v',-1),right=page('010r',1);
      // The chain, from the spine to the open padlock: iron links in one InstancedMesh.
      const links=9,chain=new THREE.InstancedMesh(new THREE.TorusGeometry(.045,.012,5,10),new THREE.MeshStandardMaterial({color:0x2c2e30,metalness:.8,roughness:.4}),links),o=new THREE.Object3D();
      for(let i=0;i<links;i++){const t=i/(links-1);o.position.set(-.4+pageW+.02+t*(1.32-pageW),.1+Math.sin(t*Math.PI)*.012,-.24-t*.08);o.rotation.set(i%2?Math.PI/2:0,0,.12);o.updateMatrix();chain.setMatrixAt(i,o.matrix)}
      desk.add(chain);
      // Its card, on the front of the lectern.
      const cardTex=canvasTexture((c,w,h)=>{c.fillStyle='#241712';c.fillRect(0,0,w,h);c.strokeStyle='#b88a4e';c.lineWidth=6;c.strokeRect(8,8,w-16,h-16);c.fillStyle='#e0c28f';c.textAlign='center';c.font='bold 30px Georgia';c.fillText('MS 408 · THE VOYNICH MANUSCRIPT',w/2,52);
        c.font='italic 21px Georgia';c.fillText('The one book here nobody has ever needed to forbid: nobody can read it.',w/2,90);c.font='18px Georgia';c.fillStyle='#bfa27a';c.fillText('A facsimile. Open it; the chain is long enough, and the lock is open.',w/2,122)},820,146);
      const card=new THREE.Mesh(new THREE.PlaneGeometry(1.9,.34),new THREE.MeshStandardMaterial({map:cardTex,roughness:.8}));card.position.set(47,1.2,1.73);card.rotation.y=Math.PI;scene.add(card);
      const data={type:'restricted-voynich',title:'The Voynich Manuscript, in facsimile',author:'Beinecke MS 408, open at a pansy and a plant nobody has named. Fifteen of its pages, on board leaves, and the whole book from Yale’s photographs.',action:'OPEN'};
      for(const m of [left,right,card]){m.userData={...data};interactables.push(m)}
      const preVoynichInteract=interact;interact=function(){if(focus&&!selected&&focus.userData?.type==='restricted-voynich'){focus=null;ui.prompt.style.opacity=0;voynichBook.open();return}return preVoynichInteract()};
    }
    {const preFineCovered=worldIsCovered;worldIsCovered=function(){return fineBookOpen()||preFineCovered()};const preFineActive=gameActive;gameActive=function(){return !fineBookOpen()&&preFineActive()}}
    const irishRoom=window.createIrishRoom?.({doorKit:getDoorKit(),THREE,scene,MAT,player,interactables,registerSeat,canvasTexture,bookMaterial,showNotice,playSample,kells:kellsBook,durrow:durrowBook,
      findBook:id=>books.find(b=>b.id===id),arrivals:{myth:arrivalIds('irish-myth'),revival:arrivalIds('irish-revival'),writers:arrivalIds('irish-writers'),gaeilge:arrivalIds('irish-gaeilge')},
      analytics:window.libraryAnalytics,isHolding:()=>!!selected,
      move:(x,z,yaw)=>{finishTrainPass();for(const k in keys)keys[k]=false;touchMoveX=touchMoveY=0;touchSprint=false;player.pos.set(x,0,z);player.vel.set(0,0,0);player.yaw=yaw;player.pitch=0;lastSafePosition.copy(player.pos);camera.position.set(x,1.72,z);camera.rotation.set(0,yaw,0,'YXZ');camera.updateMatrixWorld();focus=null}
    });
    if(irishRoom){
      const preIrishFloor=floorHeight;floorHeight=function(x,z){return irishRoom.floorAt(x,z)??preIrishFloor(x,z)};
      const preIrishAllowed=allowed;allowed=function(x,z,y=floorHeight(x,z)){return irishRoom.contains(x,z)?irishRoom.allowed(x,z):preIrishAllowed(x,z,y)};
      const preIrishInteract=interact;interact=function(){if(focus&&!selected&&irishRoom.interact(focus)){focus=null;ui.prompt.style.opacity=0;return}return preIrishInteract()};
      // Taking a book down in the Irish Room shows the librarian's note.
      const preIrishSelect=selectBook;selectBook=function(bm){const result=preIrishSelect(bm);const d=bm?.userData;if(d?.irish){const note=librarianNotes[d.book.id]||window.ATHENAEUM_EXTRA_NOTES?.[d.book.id];if(note)showNotice(`The librarian’s note: “${note}”`,11)}return result};
    }
    // The Map Room (map-room.js), behind a door in the west wing's north wall: old maps of the world on every wall, each
    // to be taken down and looked at closely, and shelves of voyages, mapmakers and lands that are not on any map.
    const mapRoom=window.createMapRoom?.({onMapViewed:key=>rememberPaper('map-'+key,false)?.text||'',doorKit:getDoorKit(),THREE,scene,MAT,player,interactables,registerSeat,canvasTexture,bookMaterial,showNotice,playSample,
      findBook:id=>books.find(b=>b.id===id),arrivals:{voyages:arrivalIds('map-voyages'),makers:arrivalIds('map-makers'),lands:arrivalIds('map-lands')},
      analytics:window.libraryAnalytics,isHolding:()=>!!selected,
      onViewerOpen:()=>{dragging=false;for(const k in keys)keys[k]=false;touchMoveX=touchMoveY=0;player.vel.set(0,0,0);document.exitPointerLock?.()},onViewerClose:()=>requestLookLock(),
      move:(x,z,yaw)=>{finishTrainPass();for(const k in keys)keys[k]=false;touchMoveX=touchMoveY=0;touchSprint=false;player.pos.set(x,0,z);player.vel.set(0,0,0);player.yaw=yaw;player.pitch=0;lastSafePosition.copy(player.pos);camera.position.set(x,1.72,z);camera.rotation.set(0,yaw,0,'YXZ');camera.updateMatrixWorld();focus=null}
    });
    if(mapRoom){
      const preMapFloor=floorHeight;floorHeight=function(x,z){return mapRoom.floorAt(x,z)??preMapFloor(x,z)};
      const preMapAllowed=allowed;allowed=function(x,z,y=floorHeight(x,z)){return mapRoom.contains(x,z)?mapRoom.allowed(x,z):preMapAllowed(x,z,y)};
      const preMapInteract=interact;interact=function(){if(focus&&!selected&&mapRoom.interact(focus)){focus=null;ui.prompt.style.opacity=0;return}return preMapInteract()};
      const preMapActive=gameActive;gameActive=function(){return !mapRoom.viewer.isOpen&&preMapActive()};
      // Taking a book down in the Map Room shows the librarian's note.
      const preMapSelect=selectBook;selectBook=function(bm){const result=preMapSelect(bm);const d=bm?.userData;if(d?.mapRoom){const note=librarianNotes[d.book.id]||window.ATHENAEUM_EXTRA_NOTES?.[d.book.id];if(note)showNotice(`The librarian’s note: “${note}”`,11)}return result};
    }
    // The Medicine Room (medicine-room.js), behind a door at the south end of the Map Room's east wall: a history of
    // medicine on three shelves, and the Fabrica of Vesalius open under glass.
    const medicineRoom=window.createMedicineRoom?.({doorKit:getDoorKit(),THREE,scene,MAT,player,interactables,registerSeat,canvasTexture,bookMaterial,showNotice,playSample,vesalius:vesaliusBook,
      findBook:id=>books.find(b=>b.id===id),arrivals:{physic:arrivalIds('medicine-physic'),discovery:arrivalIds('medicine-discovery'),healers:arrivalIds('medicine-healers')},mapRoom:mapRoom?.room,
      analytics:window.libraryAnalytics,isHolding:()=>!!selected,
      move:(x,z,yaw)=>{finishTrainPass();for(const k in keys)keys[k]=false;touchMoveX=touchMoveY=0;touchSprint=false;player.pos.set(x,0,z);player.vel.set(0,0,0);player.yaw=yaw;player.pitch=0;lastSafePosition.copy(player.pos);camera.position.set(x,1.72,z);camera.rotation.set(0,yaw,0,'YXZ');camera.updateMatrixWorld();focus=null}
    });
    if(medicineRoom){
      const preMedicineFloor=floorHeight;floorHeight=function(x,z){return medicineRoom.floorAt(x,z)??preMedicineFloor(x,z)};
      const preMedicineAllowed=allowed;allowed=function(x,z,y=floorHeight(x,z)){return medicineRoom.contains(x,z)?medicineRoom.allowed(x,z):preMedicineAllowed(x,z,y)};
      const preMedicineInteract=interact;interact=function(){if(focus&&!selected&&medicineRoom.interact(focus)){focus=null;ui.prompt.style.opacity=0;return}return preMedicineInteract()};
      // Taking a book down in the Medicine Room shows the librarian's note.
      const preMedicineSelect=selectBook;selectBook=function(bm){const result=preMedicineSelect(bm);const d=bm?.userData;if(d?.medicine){const note=librarianNotes[d.book.id]||window.ATHENAEUM_EXTRA_NOTES?.[d.book.id];if(note)showNotice(`The librarian’s note: “${note}”`,11)}return result};
    }
    // The Austen Room (austen-room.js), behind a door in the Grand Hall's west wall: Jane Austen's six novels, what else
    // she wrote, the first books about her and what she read, in a Regency drawing room; and Catherine Morland's black
    // cabinet, with Mrs Radcliffe inside. The rooms' instruments play on the library's own audio, no files: the Austen
    // Room's pianoforte, and the Burns Room's fiddle and the Devil's pipes (voice 'fiddle' or 'pipes').
    const pianoTone=(freq,at=0,dur=.6,vol=.08,voice='piano')=>{if(!audioCtx||muted)return;const start=audioCtx.currentTime+at,g=audioCtx.createGain(),bowed=voice!=='piano';
      g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(vol,start+(voice==='fiddle'?.06:.01));if(bowed)g.gain.setValueAtTime(vol,start+Math.max(.07,dur-.12));g.gain.exponentialRampToValueAtTime(.0001,start+dur);
      let out=g;if(bowed){const filter=audioCtx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=voice==='pipes'?2600:1800;filter.connect(g);out=filter}g.connect(master);
      const partials=bowed?[[1,'sawtooth',1]]:[[1,'triangle',1],[2,'sine',.35],[3,'sine',.12]];
      for(const [ratio,type,level] of partials){const o=audioCtx.createOscillator(),og=audioCtx.createGain();o.type=type;o.frequency.setValueAtTime(freq*ratio,start);og.gain.value=level;o.connect(og).connect(out);
        // The fiddle's vibrato.
        if(voice==='fiddle'){const lfo=audioCtx.createOscillator(),depth=audioCtx.createGain();lfo.frequency.value=5.5;depth.gain.value=freq*.006;lfo.connect(depth).connect(o.frequency);lfo.start(start);lfo.stop(start+dur+.05)}
        o.start(start);o.stop(start+dur+.05)}};
    const austenRoom=window.createAustenRoom?.({doorKit:getDoorKit(),THREE,scene,MAT,player,interactables,registerSeat,canvasTexture,bookMaterial,showNotice,playSample,tone:pianoTone,
      findBook:id=>books.find(b=>b.id===id),arrivals:{novels:arrivalIds('austen-novels'),writings:arrivalIds('austen-writings'),lives:arrivalIds('austen-lives'),read:arrivalIds('austen-read'),horrid:arrivalIds('austen-horrid')},
      analytics:window.libraryAnalytics,isHolding:()=>!!selected,
      move:(x,z,yaw)=>{finishTrainPass();for(const k in keys)keys[k]=false;touchMoveX=touchMoveY=0;touchSprint=false;player.pos.set(x,0,z);player.vel.set(0,0,0);player.yaw=yaw;player.pitch=0;lastSafePosition.copy(player.pos);camera.position.set(x,1.72,z);camera.rotation.set(0,yaw,0,'YXZ');camera.updateMatrixWorld();focus=null}
    });
    if(austenRoom){
      const preAustenFloor=floorHeight;floorHeight=function(x,z){return austenRoom.floorAt(x,z)??preAustenFloor(x,z)};
      const preAustenAllowed=allowed;allowed=function(x,z,y=floorHeight(x,z)){return austenRoom.contains(x,z)?austenRoom.allowed(x,z):preAustenAllowed(x,z,y)};
      const preAustenInteract=interact;interact=function(){if(focus&&!selected&&austenRoom.interact(focus)){focus=null;ui.prompt.style.opacity=0;return}return preAustenInteract()};
      // Taking a book down in the Austen Room shows the librarian's note.
      const preAustenSelect=selectBook;selectBook=function(bm){const result=preAustenSelect(bm);const d=bm?.userData;if(d?.austen){const note=librarianNotes[d.book.id]||window.ATHENAEUM_EXTRA_NOTES?.[d.book.id];if(note)showNotice(`The librarian’s note: “${note}”`,11)}return result};
    }
    // The Burns Room (burns-room.js), through a door at the east end of the Irish Room's south wall: Robert Burns's poems,
    // songs and letters, his lives and his Scotland, in an Ayrshire cottage; and Alloway Kirk through the window.
    const burnsRoom=window.createBurnsRoom?.({doorKit:getDoorKit(),THREE,scene,MAT,player,interactables,registerSeat,canvasTexture,bookMaterial,showNotice,playSample,tone:pianoTone,irishRoom:irishRoom?.room,
      findBook:id=>books.find(b=>b.id===id),arrivals:{works:arrivalIds('burns-works'),lives:arrivalIds('burns-lives'),scotland:arrivalIds('burns-scotland'),cutty:arrivalIds('burns-cutty')},
      analytics:window.libraryAnalytics,isHolding:()=>!!selected,
      move:(x,z,yaw)=>{finishTrainPass();for(const k in keys)keys[k]=false;touchMoveX=touchMoveY=0;touchSprint=false;player.pos.set(x,0,z);player.vel.set(0,0,0);player.yaw=yaw;player.pitch=0;lastSafePosition.copy(player.pos);camera.position.set(x,1.72,z);camera.rotation.set(0,yaw,0,'YXZ');camera.updateMatrixWorld();focus=null}
    });
    if(burnsRoom){
      const preBurnsFloor=floorHeight;floorHeight=function(x,z){return burnsRoom.floorAt(x,z)??preBurnsFloor(x,z)};
      const preBurnsAllowed=allowed;allowed=function(x,z,y=floorHeight(x,z)){return burnsRoom.contains(x,z)?burnsRoom.allowed(x,z):preBurnsAllowed(x,z,y)};
      const preBurnsInteract=interact;interact=function(){if(focus&&!selected&&burnsRoom.interact(focus)){focus=null;ui.prompt.style.opacity=0;return}return preBurnsInteract()};
      // Taking a book down in the Burns Room shows the librarian's note.
      const preBurnsSelect=selectBook;selectBook=function(bm){const result=preBurnsSelect(bm);const d=bm?.userData;if(d?.burns){const note=librarianNotes[d.book.id]||window.ATHENAEUM_EXTRA_NOTES?.[d.book.id];if(note)showNotice(`The librarian’s note: “${note}”`,11)}return result};
    }
    // The Room of Books Within Books (within-room.js), through the card catalogue against the Grand Hall's west wall: the
    // books that exist only inside other books, and the real books that people in other books read. A book that never was
    // opens the real one at its page (pendingPassage, matched on letters alone, since the reader's pages are wrapped).
    const withinRoom=window.createWithinRoom?.({THREE,scene,MAT,player,interactables,registerSeat,collider,canvasTexture,bookMaterial,showNotice,playSample,
      findBook:id=>books.find(b=>b.id===id),arrivals:{copperfield:arrivalIds('within-copperfield'),read:arrivalIds('within-read'),lectern:arrivalIds('within-lectern')},
      analytics:window.libraryAnalytics,isHolding:()=>!!selected,
      openBook:(id,passage)=>{const book=books.find(b=>b.id===id);if(!book)return false;if(selected){showNotice('Put down the book you are holding first.',4);return true}
        book.pendingPassage=passage;const bm=singleCopyLibrary.find(book)||looseBook(book,player.pos.x,1,player.pos.z-1.4);selectBook(bm);openReader();return true},
      move:(x,z,yaw)=>{finishTrainPass();for(const k in keys)keys[k]=false;touchMoveX=touchMoveY=0;touchSprint=false;player.pos.set(x,0,z);player.vel.set(0,0,0);player.yaw=yaw;player.pitch=0;lastSafePosition.copy(player.pos);camera.position.set(x,1.72,z);camera.rotation.set(0,yaw,0,'YXZ');camera.updateMatrixWorld();focus=null}
    });
    if(withinRoom){
      const preWithinFloor=floorHeight;floorHeight=function(x,z){return withinRoom.floorAt(x,z)??preWithinFloor(x,z)};
      const preWithinAllowed=allowed;allowed=function(x,z,y=floorHeight(x,z)){return withinRoom.contains(x,z)?withinRoom.allowed(x,z):preWithinAllowed(x,z,y)};
      const preWithinInteract=interact;interact=function(){if(focus&&!selected&&withinRoom.interact(focus)){focus=null;ui.prompt.style.opacity=0;return}return preWithinInteract()};
      // Taking a book down here says who read it, in which book; the lectern's says who bought it.
      const preWithinSelect=selectBook;selectBook=function(bm){const result=preWithinSelect(bm);const d=bm?.userData;if(d?.within){const read=withinRoom.readBy(d.book.id),note=librarianNotes[d.book.id]||window.ATHENAEUM_EXTRA_NOTES?.[d.book.id];
        if(read)showNotice(`Read in another book: ${read}`,14);else if(note)showNotice(`The librarian’s note: “${note}”`,11)}return result};
      const letters=text=>String(text).toLowerCase().replace(/[^a-z0-9]+/g,' ');
      const preWithinRender=renderReader;renderReader=function(book){if(book?.pendingPassage&&book.pages){const want=letters(book.pendingPassage).trim();book.pendingPassage=null;
        let at=book.pages.findIndex(page=>letters(page).includes(want));if(at<0)at=book.pages.findIndex((page,i)=>letters(page+' '+(book.pages[i+1]||'').slice(0,200)).includes(want));if(at>=0)book.progress=at/Math.max(1,book.pages.length-1)}return preWithinRender(book)};
    }
    // The Antipodes (antipodes.js): turn the great globe in the middle of the Grand Hall and a trapdoor opens at its foot;
    // the reader falls through the Earth, as Alice expected to, and comes up at the far side of the world, between the
    // Australian Room and the New Zealand Room.
    const antipodes=window.createAntipodes?.({THREE,scene,MAT,player,camera,interactables,registerSeat,canvasTexture,bookMaterial,showNotice,playSample,sound,
      findBook:id=>books.find(b=>b.id===id),arrivals:{voyages:arrivalIds('antipodes'),australian:arrivalIds('australian'),nz:arrivalIds('new-zealand')},
      fade:o=>{returnFade.style.opacity=String(o)},analytics:window.libraryAnalytics,isHolding:()=>!!selected,isReducedMotion:()=>reducedMotion,
      move:(x,z,yaw)=>{finishTrainPass();for(const k in keys)keys[k]=false;touchMoveX=touchMoveY=0;touchSprint=false;player.pos.set(x,0,z);player.vel.set(0,0,0);player.yaw=yaw;player.pitch=0;lastSafePosition.copy(player.pos);camera.position.set(x,1.72,z);camera.rotation.set(0,yaw,0,'YXZ');camera.updateMatrixWorld();focus=null}
    });
    if(antipodes){
      const preFarFloor=floorHeight;floorHeight=function(x,z){return antipodes.floorAt(x,z)??preFarFloor(x,z)};
      const preFarAllowed=allowed;allowed=function(x,z,y=floorHeight(x,z)){if(antipodes.contains(x,z))return antipodes.allowed(x,z);if(y<1&&antipodes.blocksHall(x,z,player.radius||.42))return false;return preFarAllowed(x,z,y)};
      const preFarInteract=interact;interact=function(){if(focus&&!selected&&antipodes.interact(focus)){focus=null;ui.prompt.style.opacity=0;return}return preFarInteract()};
      const preFarActive=gameActive;gameActive=function(){return !antipodes.travelling&&preFarActive()};
      const preFarReset=resetPosition;resetPosition=function(){antipodes.reset();return preFarReset()};
      const preFarWorld=updateWorld;updateWorld=function(t,dt){preFarWorld(t,dt);antipodes.update(t,dt)};
      // Taking a book down at the Antipodes shows the librarian's note.
      const preFarSelect=selectBook;selectBook=function(bm){const result=preFarSelect(bm);const d=bm?.userData;if(d?.antipodes){const note=librarianNotes[d.book.id]||window.ATHENAEUM_EXTRA_NOTES?.[d.book.id];if(note)showNotice(`The librarian’s note: “${note}”`,11)}return result};
    }
    // The book lift (book-lift.js): ring at the hatch in the west wing's south wall and a dumbwaiter lets the reader down
    // its shaft to the Lost Property Office, where a random handful of books that no other shelf holds is out each visit.
    const bookLift=window.createBookLift?.({THREE,scene,MAT,player,camera,interactables,canvasTexture,bookMaterial,showNotice,playSample,sound,
      findBook:id=>books.find(b=>b.id===id),arrivals:arrivalIds('lost-property'),
      fade:o=>{returnFade.style.opacity=String(o)},analytics:window.libraryAnalytics,isHolding:()=>!!selected,isReducedMotion:()=>reducedMotion,
      move:(x,z,yaw)=>{finishTrainPass();for(const k in keys)keys[k]=false;touchMoveX=touchMoveY=0;touchSprint=false;player.pos.set(x,0,z);player.vel.set(0,0,0);player.yaw=yaw;player.pitch=0;lastSafePosition.copy(player.pos);camera.position.set(x,1.72,z);camera.rotation.set(0,yaw,0,'YXZ');camera.updateMatrixWorld();focus=null}
    });
    if(bookLift){
      const preLiftFloor=floorHeight;floorHeight=function(x,z){return bookLift.floorAt(x,z)??preLiftFloor(x,z)};
      const preLiftAllowed=allowed;allowed=function(x,z,y=floorHeight(x,z)){return bookLift.contains(x,z)?bookLift.allowed(x,z):preLiftAllowed(x,z,y)};
      const preLiftInteract=interact;interact=function(){if(focus&&!selected&&bookLift.interact(focus)){focus=null;ui.prompt.style.opacity=0;return}return preLiftInteract()};
      const preLiftActive=gameActive;gameActive=function(){return !bookLift.travelling&&preLiftActive()};
      const preLiftReset=resetPosition;resetPosition=function(){bookLift.reset();return preLiftReset()};
      const preLiftWorld=updateWorld;updateWorld=function(t,dt){preLiftWorld(t,dt);bookLift.update(t,dt)};
      // Taking a book out of its pigeonhole reads its tag, and the librarian's note.
      const preLiftSelect=selectBook;selectBook=function(bm){const result=preLiftSelect(bm);const d=bm?.userData;if(d?.lostProperty){const note=librarianNotes[d.book.id]||window.ATHENAEUM_EXTRA_NOTES?.[d.book.id];showNotice(`The tag says: “${d.tag}.”${note?` The librarian’s note: “${note}”`:''}`,12)}return result};
    }
    // The African Reading Room (african-room.js): a balloon moored on the roof garden flies the reader over the clouds
    // to a walled courtyard and a reading room in the Sahelian manner, and back again.
    const cloudOverlay=(()=>{const el=document.createElement('div');el.setAttribute('aria-hidden','true');el.style.cssText='position:fixed;inset:0;background:#aab4c4;opacity:0;pointer-events:none;z-index:22;';document.body.appendChild(el);return o=>{el.style.opacity=String(o)}})();
    const africanRoom=window.createAfricanRoom?.({THREE,scene,MAT,player,camera,interactables,registerSeat,canvasTexture,bookMaterial,showNotice,playSample,sound,
      findBook:id=>books.find(b=>b.id===id),arrivals:{ancient:arrivalIds('african-ancient'),voices:arrivalIds('african-voices'),tales:arrivalIds('african-tales')},
      moveTo:(x,y,z,yaw)=>moveReaderTo(x,y,z,yaw),floorAt:(x,z)=>floorHeight(x,z),prepareRoof:()=>{buildRoofGarden();freeableBuilds.roof.hold=performance.now()/1000+60},overlay:cloudOverlay,
      analytics:window.libraryAnalytics,isHolding:()=>!!selected,isReducedMotion:()=>reducedMotion});
    if(africanRoom){
      const preAfricaFloor=floorHeight;floorHeight=function(x,z){return africanRoom.floorAt(x,z)??preAfricaFloor(x,z)};
      const preAfricaAllowed=allowed;allowed=function(x,z,y=floorHeight(x,z)){if(africanRoom.contains(x,z))return africanRoom.allowed(x,z);if(africanRoom.nearMoor(x,y,z,player.radius||.42))return false;return preAfricaAllowed(x,z,y)};
      const preAfricaInteract=interact;interact=function(){if(focus&&!selected&&africanRoom.interact(focus)){focus=null;ui.prompt.style.opacity=0;return}return preAfricaInteract()};
      const preAfricaActive=gameActive;gameActive=function(){return !africanRoom.travelling&&preAfricaActive()};
      const preAfricaReset=resetPosition;resetPosition=function(){africanRoom.reset();return preAfricaReset()};
      const preAfricaWorld=updateWorld;updateWorld=function(t,dt){preAfricaWorld(t,dt);africanRoom.update(t,dt)};
      const preAfricaSpace=acousticSpace;acousticSpace=function(){return africanRoom.zoneAt(player.pos.x,player.pos.z)==='african-courtyard'?'outdoor':preAfricaSpace()};
      // Taking a book down in the African Reading Room shows the librarian's note.
      const preAfricaSelect=selectBook;selectBook=function(bm){const result=preAfricaSelect(bm);const d=bm?.userData;if(d?.african){const note=librarianNotes[d.book.id]||window.ATHENAEUM_EXTRA_NOTES?.[d.book.id];if(note)showNotice(`The librarian’s note: “${note}”`,11)}return result};
    }
    // The Poe Room (poe-room.js), behind the chamber door in the Gothic Parlour's west wall, under a raven on a bust of
    // Pallas: Poe's books, a pendulum, the oval portrait, a purloined letter, a cask, and a heart beating under the floor.
    const poeRoom=window.createPoeRoom?.({doorKit:getDoorKit(),THREE,scene,MAT,player,interactables,registerSeat,canvasTexture,bookMaterial,showNotice,playSample,sound,
      findBook:(id,record)=>books.find(b=>b.id===id)||(record?.title?(()=>{const book={...record,category:'Gothic',fame:1,source:'Project Gutenberg',sourceUrl:`https://www.gutenberg.org/ebooks/${id}`,licence:'Public Domain',textUrl:`https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`,progress:loadSavedProgress(id),index:books.length};books.push(book);return book})():null),
      analytics:window.libraryAnalytics,isHolding:()=>!!selected,isReading:()=>!ui.reader.classList.contains('hidden'),prepareReturn:()=>buildThemeRooms('gothic'),
      move:(x,z,yaw)=>{finishTrainPass();for(const k in keys)keys[k]=false;touchMoveX=touchMoveY=0;touchSprint=false;player.pos.set(x,0,z);player.vel.set(0,0,0);player.yaw=yaw;player.pitch=0;lastSafePosition.copy(player.pos);camera.position.set(x,1.72,z);camera.rotation.set(0,yaw,0,'YXZ');camera.updateMatrixWorld();focus=null}
    });
    if(poeRoom){
      for(const [id,note] of Object.entries(poeRoom.notes))if(!librarianNotes[id]&&!window.ATHENAEUM_EXTRA_NOTES?.[id]){window.ATHENAEUM_EXTRA_NOTES=window.ATHENAEUM_EXTRA_NOTES||{};window.ATHENAEUM_EXTRA_NOTES[id]=note}
      const prePoeFloor=floorHeight;floorHeight=function(x,z){return poeRoom.floorAt(x,z)??prePoeFloor(x,z)};
      const prePoeAllowed=allowed;allowed=function(x,z,y=floorHeight(x,z)){return poeRoom.contains(x,z)?poeRoom.allowed(x,z):prePoeAllowed(x,z,y)};
      const prePoeInteract=interact;interact=function(){if(focus&&!selected&&poeRoom.interact(focus)){focus=null;ui.prompt.style.opacity=0;return}return prePoeInteract()};
      // Taking down one of Poe's books shows its note; the book from under the floorboards opens at its story.
      const prePoeSelect=selectBook;selectBook=function(bm){const result=prePoeSelect(bm);const d=bm?.userData;if(d?.poe){if(d.story)d.book.pendingStory=d.story;const note=librarianNotes[d.book.id]||window.ATHENAEUM_EXTRA_NOTES?.[d.book.id];if(note)showNotice(`The librarian’s note: “${note}”`,11)}return result};
      const prePoeRender=renderReader;renderReader=function(book){if(book?.pendingStory&&book.pages){const story=book.pendingStory;book.pendingStory=null;let at=-1;book.pages.forEach((page,i)=>{if(String(page).includes(story))at=i});if(at>0)book.progress=at/Math.max(1,book.pages.length-1)}return prePoeRender(book)};
    }
    // The Periodicals Room (periodicals-room.js), behind a door beneath the clock on the Grand Hall's south wall:
    // magazines as they first appeared, and the library's own nightly paper, The After Dark Gazette.
    const periodicalsRoom=window.createPeriodicalsRoom?.({doorKit:getDoorKit(),THREE,scene,MAT,player,interactables,registerSeat,canvasTexture,bookMaterial,showNotice,playSample,kelmscott:kelmscottBook,
      findBook:id=>books.find(b=>b.id===id),arrivals:()=>newArrivals.list('periodicals').map(book=>book.id),analytics:window.libraryAnalytics,isHolding:()=>!!selected,
      news:()=>({room:dailyRoom?.entryFor?.(dailyRoom.todayKey)?.entry||null,visitors:visitorsBook?.entries||[],weather}),
      move:(x,z,yaw)=>{finishTrainPass();for(const k in keys)keys[k]=false;touchMoveX=touchMoveY=0;touchSprint=false;player.pos.set(x,0,z);player.vel.set(0,0,0);player.yaw=yaw;player.pitch=0;lastSafePosition.copy(player.pos);camera.position.set(x,1.72,z);camera.rotation.set(0,yaw,0,'YXZ');camera.updateMatrixWorld();focus=null}
    });
    if(periodicalsRoom){
      const prePeriodicalsFloor=floorHeight;floorHeight=function(x,z){return periodicalsRoom.floorAt(x,z)??prePeriodicalsFloor(x,z)};
      const prePeriodicalsAllowed=allowed;allowed=function(x,z,y=floorHeight(x,z)){return periodicalsRoom.contains(x,z)?periodicalsRoom.allowed(x,z):prePeriodicalsAllowed(x,z,y)};
      const prePeriodicalsInteract=interact;interact=function(){if(focus&&!selected&&periodicalsRoom.interact(focus)){focus=null;ui.prompt.style.opacity=0;return}return prePeriodicalsInteract()};
      // Taking a magazine down: the librarian's note about it.
      const prePeriodicalsSelect=selectBook;selectBook=function(bm){const result=prePeriodicalsSelect(bm);if(bm?.userData?.periodical){const note=librarianNotes[bm.userData.book.id]||window.ATHENAEUM_EXTRA_NOTES?.[bm.userData.book.id];if(note)showNotice(`“${note}”`,12)}return result};
    }
    // The International Wing (international-wing.js), behind a door on the Grand Hall's south wall beside the visitors'
    // book: the Spanish Reading Room and, through its green door, the Portuguese Reading Room; Chinese to follow.
    const internationalWing=window.createInternationalWing?.({doorKit:getDoorKit(),THREE,scene,MAT,player,interactables,canvasTexture,bookMaterial,showNotice,playSample,
      findBook:id=>books.find(b=>b.id===id),arrivals:room=>newArrivals.list(room).map(book=>book.id),analytics:window.libraryAnalytics,isHolding:()=>!!selected,registerSeat,
      wallMaterial:wallFinish?photoWall('sandstone_blocks_08',[2.4,2.4],0xb07a50,2):null,
      finishWalls:wallFinish&&(walls=>{for(const [mesh,w,h,d] of walls)wallFinish.finishBox(mesh,w,h,d);wallFinish.settle(walls.map(([mesh])=>mesh),{ceiling:true})}),
      move:(x,z,yaw)=>{finishTrainPass();for(const k in keys)keys[k]=false;touchMoveX=touchMoveY=0;touchSprint=false;player.pos.set(x,0,z);player.vel.set(0,0,0);player.yaw=yaw;player.pitch=0;lastSafePosition.copy(player.pos);camera.position.set(x,1.72,z);camera.rotation.set(0,yaw,0,'YXZ');camera.updateMatrixWorld();focus=null}
    });
    // Halloween night (halloween.js): lanterns and a table of ghost stories in the Grand Hall, 24 October to 2 November.
    const halloween=window.createHalloween?.({THREE,scene,MAT,interactables,canvasTexture,bookMaterial,findBook:id=>books.find(b=>b.id===id),showNotice,collider});
    if(halloween?.active){
      const preHalloweenInteract=interact;interact=function(){if(focus&&!selected&&halloween.interact(focus)){focus=null;ui.prompt.style.opacity=0;return}return preHalloweenInteract()};
      let greeted=false;const preHalloweenWorld=updateWorld;updateWorld=function(t,dt){preHalloweenWorld(t,dt);halloween.update(t);
        // Once, a little after the reader steps in, so it does not talk over the first-visit tour's opening words.
        if(started&&!greeted){greeted=true;setTimeout(()=>showNotice(halloween.greeting,9),tour.step>=0||!localStorage.getItem('athenaeum-tour-done')?20000:5000)}};
    }
    // The Kipling bookcase (kipling-shelf.js): his books in the order he published them, in the Grand Hall's south-west corner.
    const kiplingShelf=window.createKiplingShelf?.({THREE,scene,MAT,interactables,canvasTexture,bookMaterial,books:newArrivals.list('kipling'),showNotice,collider});
    if(kiplingShelf){const preKiplingInteract=interact;interact=function(){if(focus&&!selected&&kiplingShelf.interact(focus)){focus=null;ui.prompt.style.opacity=0;return}return preKiplingInteract()}}
    // The wing's books (data/new-books-wing.js) are fetched on the way there: near its door, at one of its doors, or on
    // a link into it. Until they arrive the rooms are not built, so no shelf is ever made empty.
    const wingBooks={ready:!!window.ATHENAEUM_NEW_BOOKS_WING,loading:null,
      load(){if(this.ready)return Promise.resolve();return this.loading||(this.loading=new Promise(done=>{const script=document.createElement('script');
        script.src=(window.libraryVersionedSource||(src=>src))('data/new-books-wing.js');
        script.onload=()=>{newArrivals.add(window.ATHENAEUM_NEW_BOOKS_WING);this.ready=true;done()};script.onerror=()=>{script.remove();this.loading=null;done()};document.head.appendChild(script)}))},
      near(){if(internationalWing&&Math.hypot(player.pos.x-internationalWing.door.x,player.pos.z-internationalWing.door.z)<9)this.load()}};
    function enterWing(key){wingBooks.load().then(()=>internationalWing.enter(key))}
    if(internationalWing){
      const preWingFloor=floorHeight;floorHeight=function(x,z){return internationalWing.floorAt(x,z)??preWingFloor(x,z)};
      const preWingAllowed=allowed;allowed=function(x,z,y=floorHeight(x,z)){return internationalWing.contains(x,z)?internationalWing.allowed(x,z):preWingAllowed(x,z,y)};
      const preWingInteract=interact;interact=function(){if(focus&&!selected&&!wingBooks.ready&&String(focus.userData?.type).startsWith('intl-')){const door=focus;wingBooks.load().then(()=>internationalWing.interact(door));focus=null;ui.prompt.style.opacity=0;return}
        if(focus&&!selected&&internationalWing.interact(focus)){focus=null;ui.prompt.style.opacity=0;return}return preWingInteract()};
      // Taking a book down: the librarian's note, in Spanish.
      const preWingSelect=selectBook;selectBook=function(bm){const result=preWingSelect(bm);
        // A book from the racks, or one opened by sitting in one of the wing's chairs: its note in the room's language.
        const wingRoom=bm?.userData?.international?bm.userData.wingRoom:bm?.userData?.seatCopy?seated?.seat?.wingRoom:null;
        if(wingRoom){const note=librarianNotes[bm.userData.book.id]||window.ATHENAEUM_EXTRA_NOTES?.[bm.userData.book.id];if(note){const label=internationalWing.rooms[wingRoom]?.note||'La nota de la bibliotecaria';showNotice(wingRoom==='chinese'?`${label}：「${note}」`:`${label}: “${note}”`,12)}}return result};
    }
    // Traces of other readers (other-readers.js): invented, but the same for everyone on a given day.
    const correspondenceDesk=window.createCorrespondenceDesk?.({THREE,MAT,desk:correspondenceFurniture,interactables,canvasTexture,
      onOpen:()=>{dragging=false;for(const k in keys)keys[k]=false;touchMoveX=touchMoveY=0;player.vel.set(0,0,0);ui.prompt.style.opacity=0;document.exitPointerLock?.()},
      onClose:()=>{ui.pause.classList.add('hidden');requestLookLock()}});
    if(correspondenceDesk){const preLetterInteract=interact;interact=function(){if(focus&&correspondenceDesk.interact(focus)){focus=null;return}return preLetterInteract()};const preLetterActive=gameActive;gameActive=function(){return !correspondenceDesk.isOpen&&preLetterActive()};const preLetterCovered=worldIsCovered;worldIsCovered=function(){return correspondenceDesk.isOpen||preLetterCovered()}}
    // The real visitors' book (visitors-book.js), once its small service is set up (data/visitors-book-config.js).
    const visitorsBook=window.ATHENAEUM_VISITORS_BOOK?.endpoint?window.createVisitorsBook?.({endpoint:window.ATHENAEUM_VISITORS_BOOK.endpoint,books:()=>books,
      language:()=>navigator.language||'en',storage:(()=>{try{return localStorage}catch(e){return null}})(),
      onOpen:()=>{dragging=false;for(const k in keys)keys[k]=false;touchMoveX=touchMoveY=0;player.vel.set(0,0,0);document.exitPointerLock?.()},
      onClose:()=>requestLookLock(),onSigned:()=>{window.libraryAnalytics?.track('Visitors Book Signed');showNotice('Your name is in the visitors’ book. Thank you for coming in.',5)}}):null;
    if(visitorsBook){const preBookActive=gameActive;gameActive=function(){return !visitorsBook.isOpen&&preBookActive()}}
    const otherReaders=window.createOtherReaders?.({THREE,scene,MAT,interactables,canvasTexture,showNotice,playSample,findBook:id=>books.find(b=>b.id===id),visitorsBook,
      isQuietMoment:()=>gameActive()&&ui.reader.classList.contains('hidden')&&Math.abs(player.pos.x)<58&&Math.abs(player.pos.z)<32&&player.pos.y>-1&&player.pos.y<12});
    if(otherReaders){const preTraceInteract=interact;interact=function(){if(focus&&!selected&&otherReaders.interact(focus)){focus=null;ui.prompt.style.opacity=0;return}return preTraceInteract()}}
    // The gramophone: pause or resume what is playing, else read aloud the last book opened, else any recorded book.
    {const preGramophoneInteract=interact;interact=function(){if(focus?.userData?.type==='gramophone'&&!selected&&audiobooks){if(audiobooks.active)audiobooks.toggle();else{const shelved=books.filter(book=>audiobooks.available(book)),choice=lastListenable||shelved[Math.floor(Math.random()*shelved.length)];if(!choice)showNotice('The record is blank tonight. Try again when the recordings have arrived.',5);else{audiobooks.start(choice);showNotice(`The needle drops. ${choice.title}, by ${choice.author}, read aloud.`,6)}}focus=null;ui.prompt.style.opacity=0;return}return preGramophoneInteract()}}
    // The western door opens onto a spatially separate stair, allowing its many turns to rise
    // far beyond the existing roof without changing the carefully packed library floor plan.
    // Mars (mars.js): reached by turning the Rocket Hall projectile's course dial. Built only when the reader lands.
    let marsWorld=null;
    const highStaircase=window.createHighStaircase({THREE,scene,MAT,player,camera,interactables,books,coverTexture,canvasTexture,showNotice,sound,playSample,lastSafePosition,modelTemplate:url=>seatTemplate({url}),isLowBandwidth:()=>lowBandwidth,isReducedMotion:()=>reducedMotion,slideSound:level=>slideWhoosh(level),
      mars:window.createMars?{arrive:()=>marsWorld?.arrive(),stepOut:()=>marsWorld?.stepOut()}:null});
    marsWorld=window.createMars?.({THREE,scene,MAT,player,camera,interactables,canvasTexture,bookMaterial,renderer,ambient,moon,showNotice,playSample,sound,
      findBook:id=>books.find(b=>b.id===id),arrivals:()=>newArrivals.list('mars').map(book=>book.id),boardHome:()=>highStaircase.board('summit-mars'),analytics:window.libraryAnalytics,
      isReducedMotion:()=>reducedMotion,isHolding:()=>!!selected,storage:(()=>{try{return localStorage}catch(e){return null}})(),
      move:(x,z,yaw)=>{finishTrainPass();for(const k in keys)keys[k]=false;touchMoveX=touchMoveY=0;touchSprint=false;player.pos.set(x,0,z);player.vel.set(0,0,0);player.yaw=yaw;player.pitch=0;lastSafePosition.copy(player.pos);camera.position.set(x,1.72,z);camera.rotation.set(0,yaw,0,'YXZ');camera.updateMatrixWorld();focus=null}
    });
    if(marsWorld){
      const preMarsFloor=floorHeight;floorHeight=function(x,z){return marsWorld.floorAt(x,z)??preMarsFloor(x,z)};
      const preMarsAllowed=allowed;allowed=function(x,z,y=floorHeight(x,z)){return marsWorld.contains(x,z)?marsWorld.allowed(x,z):preMarsAllowed(x,z,y)};
      const preMarsInteract=interact;interact=function(){if(focus&&!selected&&marsWorld.interact(focus)){focus=null;ui.prompt.style.opacity=0;return}return preMarsInteract()};
      const preMarsReset=resetPosition;resetPosition=function(){marsWorld.reset();return preMarsReset()};
      const preMarsSurface=footstepSurface;footstepSurface=function(){return marsWorld.onSand(player.pos.x,player.pos.z)?'carpet':preMarsSurface()};
      // The library's own ambient notes (a page turning, the midnight rabbit) do not reach Mars.
      const preMarsAmbient=triggerAmbientEvent;triggerAmbientEvent=function(){if(marsWorld.contains(player.pos.x,player.pos.z)){nextAmbientAt=performance.now()+90000;return}return preMarsAmbient()};
      const preMarsMidnight=triggerMidnight;triggerMidnight=function(){if(marsWorld.contains(player.pos.x,player.pos.z))return;return preMarsMidnight()};
      const preMarsSpace=acousticSpace;acousticSpace=function(){return marsWorld.contains(player.pos.x,player.pos.z)?'outdoor':preMarsSpace()};
    }showNotice.gate=()=>highStaircase.noticeAllowed();
    const preStairFloor=floorHeight;floorHeight=function(x,z){return highStaircase.floorAt(x,z)??preStairFloor(x,z)};
    const preStairAllowed=allowed;allowed=function(x,z,y=floorHeight(x,z)){return highStaircase.contains(x,z)?highStaircase.allowed(x,z):preStairAllowed(x,z,y)};
    const preStairInteract=interact;interact=function(){if(focus&&!selected&&highStaircase.interact(focus)){focus=null;ui.prompt.style.opacity=0;return}return preStairInteract()};
    const carriedBookInteract=interact;interact=function(){if(carryingBook&&focus?.userData?.type==='correspondence-desk'&&correspondenceDesk?.interact(focus)){focus=null;ui.prompt.style.opacity=0;return}if(carryingBook&&focus?.userData?.type==='daily-exit'&&dailyRoom?.interact(focus)){focus=null;ui.prompt.style.opacity=0;return}if(carryingBook&&cinderArchive?.atExit()){returnSelected(false);cinderArchive.leave();focus=null;ui.prompt.style.opacity=0;return}if(carryingBook&&chanceRoom?.atExit()){returnSelected(false);chanceRoom.leave(true);focus=null;ui.prompt.style.opacity=0;return}if(carryingBook&&focus?.userData?.type==='lift-car'&&bookLift){bookLift.carryUp(()=>returnSelected(false));focus=null;ui.prompt.style.opacity=0;return}if(carryingBook){if(focus?.userData?.type==='seat')return sitWithBook(focus.userData);if(focus?.userData?.type==='book-table'||focus?.userData?.type==='book-shelf')return placeSelected(focus);placeOnSurface();return}return carriedBookInteract()};
    const preStairReset=resetPosition;resetPosition=function(){highStaircase.reset();return preStairReset()};
    const preStairWorld=updateWorld;updateWorld=function(t,dt){preStairWorld(t,dt);highStaircase.update(t,dt);afterDarkExpansion.update(t,dt,reducedMotion);curiousDoors?.update(t,dt,reducedMotion);dailyRoom?.update(t);chanceRoom?.update(t);cinderArchive?.update(t);if(audiobooks?.playing)gramophone.platter.rotation.y-=dt*3.6;getDoorKit()?.update(dt);dressExitDoors(dt)};
    const telescopeViewer=window.createTelescopeViewer?.({THREE,renderer,scene,size:lowBandwidth||lowPowerDevice?384:640,stars:()=>awakenedBooks.size,beforeRender:view=>singleCopyLibrary.sync(view.root),
      destinations:{moon:{title:'The Selenite Reading Outpost',description:'Pale dust, a brass sign, and books waiting beneath the lunar sky.',view:()=>highStaircase.preview()},mars:{title:'The Reading Room of Helium',description:'Broken columns on the red plain. Someone is still keeping the shelves.',view:()=>marsWorld?.preview()}},
      onOpen:()=>{for(const key in keys)keys[key]=false;player.vel.set(0,0,0);touchMoveX=touchMoveY=0;touchSprint=false;dragging=false;ui.pause.classList.add('hidden');document.exitPointerLock?.()},onClose:()=>{if(started)requestLookLock()}});
    {const preTelescopeInteract=interact;interact=function(){if(focus?.userData?.type==='constellation'&&!selected&&telescopeViewer){telescopeViewer.open();focus=null;ui.prompt.style.opacity=0;return}return preTelescopeInteract()};
      const preTelescopeActive=gameActive;gameActive=function(){return !telescopeViewer?.isOpen&&preTelescopeActive()};const preTelescopeCovered=worldIsCovered;worldIsCovered=function(){return telescopeViewer?.isOpen||preTelescopeCovered()}}
    // ---- Where things are: one register of every room, used by the map and the discovery tallies.
    const titleCase=text=>text.toLowerCase().replace(/(^|[\s—-])([a-z])/g,(m,a,b)=>a+b.toUpperCase()).replace(/\b(The|Of|In|A|For|Where|After|Past)\b/g,(w,_,i)=>i?w.toLowerCase():w).replace(/^./,c=>c.toUpperCase());
    const PLACE_GROUPS=[
      {title:'The Grand Hall and its wings',places:[['main-library','The Grand Hall'],['upper-floor','The upper gallery'],['roof-garden','The roof garden'],['east-wing','The east wing'],['west-wing','The west wing'],['restricted-stacks','The restricted stacks'],['librarian-office','The librarian’s office'],['daily-room','The room of the day'],['learners-room','The English reading room'],['set-texts-room','The set texts room'],['chance-room','The Room of Chance'],['cinder-archive','The Cinder Archive'],['evening-room','The evening room'],['periodicals-room','The periodicals room'],['irish-room','The Irish room'],['map-room','The map room'],['medicine-room','The medicine room'],['austen-room','The Austen room'],['burns-room','The Burns room'],['within-room','The room of books within books'],['international-wing','The International Wing']]},
      {title:'Hidden ways',secret:true,places:[['portrait-room','The hidden reading room'],['tunnel','The breathing tunnel'],['archive','The final archive'],['below-catalogue','Below the catalogue'],['rabbit-room','The rabbit room'],['poe-room','The Poe room'],['lost-property','The Lost Property Office'],['afterdark-sorting','Staff · Sorting'],['afterdark-departures','Departures']]},
      {title:'Memory rooms',places:[['returning','Names in the Dust'],['quiet','The Longer Silence'],['unread','St—ll W—ting'],['repository','What Was Kept']]},
      {title:'Reading rooms',places:[...themeRoomDefs.map(def=>[def.key,titleCase(def.sign[0])]),['contested','The Unwelcome Spines']]},
      {title:'Curious rooms',secret:true,places:[['curious-parlour','The ghost-story parlour'],['curious-conservatory','The night conservatory'],['curious-horologist','The horologist’s study'],['curious-attic','The children’s attic']]},
      {title:'The night railway',places:[['railway-platform','The night platform'],['railway-carriage','The reading carriage'],['railway-depot','The depot'],['fog-stop','The unmarked fog stop'],['signal-stop','The signal box'],['tide-stop','The tide station']]},
      {title:'Heights and depths',places:[['high-staircase','The high staircase'],['rocket','The rocket'],['moon','The Moon'],['mars','Mars'],['verne-descent','The Verne descent']]},
      {title:'Across the water',places:[['boathouse','The boathouse'],['crusoe-island','Crusoe’s island']]},
      {title:'Through the Earth',places:[['antipodes','The Antipodes'],['australian-room','The Australian room'],['new-zealand-room','The New Zealand room']]},
      {title:'By balloon',places:[['african-courtyard','The courtyard and the baobab'],['african-room','The African Reading Room']]}
    ];
    const PLACE_INFO={};for(const group of PLACE_GROUPS)for(const [id,label] of group.places)PLACE_INFO[id]={id,label,group};
    window.libraryAnalytics?.allowRooms?.([...Object.keys(PLACE_INFO),'rocket-hall','selenite-outpost','sorting','departures','antipodes-fall','antipodes-return','balloon-flight','balloon-return','book-lift','lost-property-restock']);
    const RAIL_PLACES={platform:'railway-platform',carriage:'railway-carriage',depot:'railway-depot','fog-platform':'fog-stop','fog-room':'fog-stop','signal-platform':'signal-stop','signal-room':'signal-stop','tide-platform':'tide-stop','tide-room':'tide-stop'};
    {const baseModulePlace=placeAt;placeAt=function(x,y,z){
      if(marsWorld?.contains(x,z))return 'mars';if(highStaircase.onMoon(x,z))return 'moon';if(highStaircase.contains(x,z))return Math.hypot(x-highStaircase.center.x,z-highStaircase.center.z)<14.2?'high-staircase':'rocket';
      const rail=nightRailway.zoneAt(x,z)?.key;if(rail)return RAIL_PLACES[rail]||'railway-platform';
      if(librarianOffice.contains(x,z))return 'librarian-office';
      const curious=curiousDoors?.zoneAt(x,z);if(curious)return 'curious-'+curious.key;
      if(dailyRoom?.contains(x,z))return 'daily-room';
      const isle=crusoeIsland?.zoneAt(x,z);if(isle)return isle;
      const far=antipodes?.zoneAt(x,z);if(far)return far;
      const africa=africanRoom?.zoneAt(x,z);if(africa)return africa;
      if(learnersRoom?.contains(x,z))return 'learners-room';if(setTextsRoom?.contains(x,z))return 'set-texts-room';if(chanceRoom?.contains(x,z))return 'chance-room';if(cinderArchive?.contains(x,z))return 'cinder-archive';if(bookLift?.contains(x,z))return 'lost-property';
      if(eveningRoom?.contains(x,z))return 'evening-room';if(poeRoom?.contains(x,z))return 'poe-room';if(irishRoom?.contains(x,z))return 'irish-room';if(mapRoom?.contains(x,z))return 'map-room';if(medicineRoom?.contains(x,z))return 'medicine-room';if(austenRoom?.contains(x,z))return 'austen-room';if(burnsRoom?.contains(x,z))return 'burns-room';if(withinRoom?.contains(x,z))return 'within-room';if(periodicalsRoom?.contains(x,z))return 'periodicals-room';if(internationalWing?.contains(x,z))return 'international-wing';
      const room=afterDarkExpansion.zoneAt(x,z);if(room)return 'afterdark-'+room.key;
      if(z>10&&verneDescent.contains(x,z))return 'verne-descent';
      return baseModulePlace(x,y,z)}}
    const placeLabel=id=>PLACE_INFO[id]?.label||'the library';
    const placeKnown=id=>id==='main-library'||exploredRooms.has(id);

    // The Grand Hall plan is drawn to scale from the same bounds the walking code uses; north (away from the entrance) is up.
    const HALL_AREAS=[
      {id:'main-library',x:[-19,19],z:[-31,31],label:'Grand Hall'},{id:'east-wing',x:[19,37],z:[-14,10],label:'East wing'},{id:'west-wing',x:[-37,-19],z:[-14,10],label:'West wing'},{id:'restricted-stacks',x:[37,57],z:[-12,8],label:'Restricted'},
      {id:'portrait-room',x:[-52,-37],z:[-12,6],label:'Hidden room',secret:true},{id:'tunnel',x:[-62,-52],z:[-5,-1],label:'Tunnel',secret:true},{id:'archive',x:[-72,-62],z:[-8,2],label:'Archive',secret:true},
      {id:'roof-garden',x:[-16.7,16.7],z:[37,61],label:'Roof garden (up the east stair)',kind:'above'},{id:'upper-floor',x:[19,28],z:[16,24],label:'Upper gallery',kind:'above'},
      {id:'below-catalogue',x:[-17.8,17.8],z:[-67.8,-40.2],label:'Below the catalogue (through the hatch)',kind:'below',secret:true}];
    function renderHallPlan(here){const plan=$('#hallPlan');if(!plan)return;const svg=[],bounds={x0:-24,x1:24,z0:-35,z1:36};
      for(const area of HALL_AREAS){const known=placeKnown(area.id)||here===area.id;if(!known&&area.secret)continue;bounds.x0=Math.min(bounds.x0,area.x[0]-3);bounds.x1=Math.max(bounds.x1,area.x[1]+3);bounds.z0=Math.min(bounds.z0,area.z[0]-3);bounds.z1=Math.max(bounds.z1,area.z[1]+3);const w=area.x[1]-area.x[0],d=area.z[1]-area.z[0],cls=['area',area.kind||'',known?'':'uncharted',here===area.id?'here':''].join(' ');
        svg.push(`<rect class="${cls}" x="${area.x[0]}" y="${area.z[0]}" width="${w}" height="${d}" rx="1"><title>${known?area.label:'Uncharted'}</title></rect>`);
        const small=w<14||d<6;svg.push(`<text class="${small||!known?'small':''}" x="${area.x[0]+w/2}" y="${area.z[0]+d/2}">${known?area.label.replace(/ \(.*/,''):'?'}</text>`)}
      svg.push('<text class="small" x="0" y="33.5">entrance</text>');
      if(HALL_AREAS.some(area=>area.id===here)){const deg=-player.yaw*180/Math.PI;svg.push(`<g transform="translate(${player.pos.x.toFixed(2)} ${player.pos.z.toFixed(2)}) rotate(${deg.toFixed(1)})"><path class="you" d="M0 -3.4 L2.4 2.6 L0 1.3 L-2.4 2.6 Z"/></g>`)}
      /* Frame only what has been found, so an early map is not a speck in a sea of blank paper. */const w=bounds.x1-bounds.x0,d=bounds.z1-bounds.z0;plan.innerHTML=`<svg viewBox="${bounds.x0} ${bounds.z0} ${w} ${d}" role="img" aria-label="Plan of the Grand Hall and the rooms found around it">${svg.join('')}</svg>`}
    var renderLibraryAtlas=function(){const here=analyticsRoom();renderHallPlan(here);
      $('#mapWhere').textContent=`You are in ${placeLabel(here)}.`;
      const atlas=$('#journalMap');if(!atlas)return;atlas.replaceChildren();
      for(const group of PLACE_GROUPS){if(group===PLACE_GROUPS[0])continue;const found=group.places.filter(([id])=>placeKnown(id)||id===here).length,section=document.createElement('section'),heading=document.createElement('h4'),cards=document.createElement('div');section.className='atlas-group';heading.textContent=group.title;const tally=document.createElement('small');tally.textContent=`${found} of ${group.places.length} found`;heading.append(tally);cards.className='atlas-cards';
        for(const [id,label] of group.places){const card=document.createElement('div'),known=placeKnown(id)||here===id;card.className='atlas-card'+(known?'':' unknown')+(here===id?' here':'');card.textContent=known?label:group.secret?'A place not on any plan':'Uncharted';if(here===id){const note=document.createElement('small');note.textContent='You are here';card.append(note)}cards.append(card)}
        section.append(heading,cards);atlas.append(section)}};

    // Discovery tallies at the top of the catalogue.
    var renderDiscoveryStats=function(){const box=$('#discoveryStats');if(!box)return;const all=Object.keys(PLACE_INFO),secret=all.filter(id=>PLACE_INFO[id].group.secret),opened=books.filter(book=>book.progress>.001||awakenedBooks.has(book.id)).length,finished=books.filter(book=>book.progress>=.95).length;
      const tiles=[['Rooms found',all.filter(placeKnown).length,all.length],['Secret places',secret.filter(placeKnown).length,secret.length],['Books opened',opened,books.length],['Books finished',finished,books.length],['Mysteries solved',mysteryCount(),SECRET_TOTAL],['Keepsakes',collection.size,Object.keys(COLLECTION_NAMES).length],['Reasons found',roomRecords.size,Object.keys(ROOM_RECORDS).length]];
      box.replaceChildren(...tiles.map(([label,value,total])=>{const tile=document.createElement('div'),number=document.createElement('strong'),name=document.createElement('span'),bar=document.createElement('i'),fill=document.createElement('b');tile.className='stat-tile';number.textContent=`${value} / ${total}`;name.textContent=label;fill.style.width=`${total?Math.round(value/total*100):0}%`;bar.append(fill);tile.append(number,name,bar);return tile}))};
    var announceCharted=function(room){const info=PLACE_INFO[room];if(!info||room==='main-library')return;const all=Object.keys(PLACE_INFO);showNotice(`New room charted: ${info.label}. ${all.filter(placeKnown).length} of ${all.length} rooms found.`,4)};

    function selectJournalTab(tab){for(const button of document.querySelectorAll('.journal-tabs [role="tab"]')){const on=button.dataset.tab===tab;button.setAttribute('aria-selected',String(on));button.tabIndex=on?0:-1;$('#panel-'+button.dataset.tab).hidden=!on}if(tab==='map')renderLibraryAtlas()}
    for(const button of document.querySelectorAll('.journal-tabs [role="tab"]'))button.addEventListener('click',()=>selectJournalTab(button.dataset.tab));
    $('.journal-tabs').addEventListener('keydown',e=>{if(e.code!=='ArrowRight'&&e.code!=='ArrowLeft')return;const tabs=[...document.querySelectorAll('.journal-tabs [role="tab"]')],i=tabs.findIndex(tab=>tab.getAttribute('aria-selected')==='true'),next=tabs[(i+(e.code==='ArrowRight'?1:tabs.length-1))%tabs.length];e.preventDefault();selectJournalTab(next.dataset.tab);next.focus()});
    $('#journalHome').addEventListener('click',()=>resetPosition());
    renderJournal();
    // ---- Lamplight: dust drifting up through the light above the Grand Hall's reading lamps, and a
    // gentle flame flicker. Both hold still under Reduce motion.
    const hallLamps=lampSpots.filter(([x,y,z])=>Math.abs(x)<37&&Math.abs(z)<31&&y<4).slice(0,12);
    const MOTES_PER_LAMP=lowPowerDevice?16:34,moteCount=hallLamps.length*MOTES_PER_LAMP,moteBase=new Float32Array(moteCount*4),motePositions=new Float32Array(moteCount*3),moteColors=new Float32Array(moteCount*3);
    hallLamps.forEach(([x,y,z],lamp)=>{for(let k=0;k<MOTES_PER_LAMP;k++){const i=lamp*MOTES_PER_LAMP+k,a=Math.random()*Math.PI*2,r=Math.sqrt(Math.random())*1.7;moteBase.set([x+Math.cos(a)*r,y+.35,z+Math.sin(a)*r,Math.random()],i*4)}});
    const moteGeometry=new THREE.BufferGeometry();moteGeometry.setAttribute('position',new THREE.BufferAttribute(motePositions,3).setUsage(THREE.DynamicDrawUsage));moteGeometry.setAttribute('color',new THREE.BufferAttribute(moteColors,3).setUsage(THREE.DynamicDrawUsage));moteGeometry.boundingSphere=new THREE.Sphere(new THREE.Vector3(0,3,0),48);
    const lampMotes=new THREE.Points(moteGeometry,new THREE.PointsMaterial({color:0xffd9a0,size:.055,map:softParticleTexture(),vertexColors:true,transparent:true,opacity:.8,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true}));lampMotes.renderOrder=2;if(moteCount)scene.add(lampMotes);
    function updateLamplight(t){
      const still=reducedMotion,time=still?0:t;
      if(moteCount&&Math.abs(player.pos.x)<45&&Math.abs(player.pos.z)<40&&player.pos.y>-1&&player.pos.y<4){lampMotes.visible=true;
        for(let i=0;i<moteCount;i++){const bx=moteBase[i*4],by=moteBase[i*4+1],bz=moteBase[i*4+2],seed=moteBase[i*4+3],rise=(seed+time*(.012+seed*.01))%1,sway=time*.35+seed*40;
          motePositions[i*3]=bx+Math.sin(sway)*.22+Math.sin(sway*.37+seed*9)*.12;motePositions[i*3+1]=by+rise*3.2;motePositions[i*3+2]=bz+Math.cos(sway*.8+seed*5)*.2;
          /* Brightest in the heart of the light, fading as a mote rises out of it; each catches the light now and then. */const glow=Math.sin(Math.PI*rise)*(.45+.55*Math.max(0,Math.sin(sway*1.7+seed*20)))*(1-rise*.45);moteColors[i*3]=moteColors[i*3+1]=moteColors[i*3+2]=glow}
        moteGeometry.attributes.position.needsUpdate=true;moteGeometry.attributes.color.needsUpdate=true}else lampMotes.visible=false;
      // Flame flicker: a slow breath with a faint quick waver, applied on top of whatever brightness a light is set to.
      const flame=i=>still?1:1+Math.sin(t*1.7+i*2.1)*.025+Math.sin(t*7.3+i*5.7)*.018+Math.sin(t*13.1+i)*.01;
      lampShadeMaterial.emissiveIntensity=2.35*flame(0);
      flickerLights.forEach((light,i)=>{const d=light.userData,factor=flame(i+1);if(d.flickerApplied!==undefined&&light.intensity!==d.flickerApplied)d.flickerBase=light.intensity/(d.flickerFactor||1);if(d.flickerBase===undefined)d.flickerBase=light.intensity;light.intensity=d.flickerBase*factor;d.flickerApplied=light.intensity;d.flickerFactor=factor})
    }
    {const preLampWorld=updateWorld;updateWorld=function(t,dt){preLampWorld(t,dt);if(nightRailway?.zoneAt(player.pos.x,player.pos.z))ensureSample('trainWhistle');updateLamplight(t);crusoeIsland?.update(t,dt);marsWorld?.update(t);otherReaders?.update(dt);learnersRoom?.update(t,dt);setTextsRoom?.update(t);eveningRoom?.update(t,dt,reducedMotion);poeRoom?.update(t,dt,reducedMotion);irishRoom?.update(t,dt,reducedMotion);mapRoom?.update(t);medicineRoom?.update(t);austenRoom?.update(t);burnsRoom?.update(t);withinRoom?.update(t);periodicalsRoom?.update(t);(wingBooks.ready?internationalWing?.update(t):wingBooks.near())}}
    // Quill's haunts: now and then the library cat is found asleep in one of the rooms behind doors (by the Irish
    // Room's turf fire, beside Poe's desk, on a reading table in the International Wing). The same cat, moved and
    // curled up; nothing new is built, and it goes back to its rounds of the Grand Hall when the reader does.
    {const legs=cat.children.filter(o=>o.geometry?.type==='CylinderGeometry'),eyes=cat.children.filter(o=>o.userData.catEye),rest=cat.children.filter(o=>!legs.includes(o)&&!eyes.includes(o));
      const pose=rest.map(o=>({o,y:o.position.y})),awake={...body.userData},haunts={};let away=null,home=null,lastZone=null,greeted=false;const alwaysQuill=new URLSearchParams(location.search).has('quill');// ?quill: always there
      const spot=zone=>{
        if(zone==='irish-room'&&irishRoom?.built){const r=irishRoom.room;return {x:r.cx-1,y:0,z:r.cz-r.d/2+2.1,yaw:.3,line:'Quill is asleep on the hearth, warming one side and then the other.'}}
        if(zone==='poe-room'&&poeRoom?.built){const r=poeRoom.room;return {x:r.cx-2.3,y:0,z:r.cz+2.1,yaw:-.4,line:'Quill is curled up beside Poe’s desk, one eye half open. Poe kept a cat too: Catterina, a tortoiseshell, who is said to have sat on his shoulder while he wrote.'}}
        const key=zone==='international-wing'&&internationalWing?.roomAt(player.pos.x,player.pos.z);
        if(key&&internationalWing.isBuilt(key)){const r=internationalWing.rooms[key];return {x:r.cx+2.8,y:.84,z:r.cz+1.2,yaw:0,key,line:'Quill is asleep on the reading table, between the lamp and the books. A cat is the same in every language.'}}
        return null};
      const curl=on=>{legs.forEach(o=>o.visible=!on);eyes.forEach(o=>o.visible=!on);for(const {o,y} of pose)o.position.y=on?y-.42:y;head.position.x=on?.6:.68;head.position.y=on?.6:1.12;tail.rotation.set(on?Math.PI/2:0,on?0:Math.PI/2,0);// the tail laid flat round the body, then up again
        const text=on?{...awake,author:'Fast asleep. It might not mind a scratch behind the ears.'}:awake;for(const part of [body,head])part.userData=text};
      const preQuillWorld=updateWorld;updateWorld=function(t,dt){preQuillWorld(t,dt);
        const zone=irishRoom?.contains(player.pos.x,player.pos.z)?'irish-room':poeRoom?.contains(player.pos.x,player.pos.z)?'poe-room':internationalWing?.contains(player.pos.x,player.pos.z)?'international-wing':null;
        const where=zone==='international-wing'?'wing:'+internationalWing.roomAt(player.pos.x,player.pos.z):zone;
        if(away){petTime=Math.max(0,petTime-dt);head.rotation.z=petTime>0?Math.sin(petTime*5)*.13:0;
          if(where!==away.where){// back to the hall, or on to another room: Quill goes home
            cat.position.copy(home);cat.rotation.set(0,0,0);curl(false);away=null}
          else if(!greeted&&Math.hypot(player.pos.x-cat.position.x,player.pos.z-cat.position.z)<3.2){greeted=true;showNotice(away.line,7)}}
        // On arriving in a room, Quill is there half the time on a first visit and one in three after (never while leading the reader somewhere).
        if(where&&where!==lastZone&&!away&&!catGuideTarget){const s=spot(zone);if(s&&(alwaysQuill||Math.random()<(haunts[where]===undefined?.5:.33))){home=cat.position.clone();cat.position.set(s.x,s.y,s.z);cat.rotation.set(0,s.yaw,0);curl(true);away={...s,where};greeted=false}haunts[where]=true}
        lastZone=where}}
    // ---- First visit: a short tour that moves on as the reader does each thing, with Quill leading to a shelf.
    const tour=(()=>{const box=$('#tour'),stepLabel=$('#tourStep'),text=$('#tourText');
      const pending=!localStorage.getItem('athenaeum-tour-done')&&exploredRooms.size<3&&!awakenedBooks.size;
      /* The tour carries the old one-line nudge's advice, so the nudge is not shown on top of it. */if(pending)localStorage.setItem('athenaeum-exploration-prompt-seen','1');
      const key=(desk,touch)=>touchMode?touch:desk;
      const STEPS=[
        {text:key(mouseLook?'Click the view, then move the mouse to look around.':'Hold the mouse button down and drag to look around.','Drag on the right side of the screen to look around.'),done:s=>s.turned>.8},
        {text:key('Walk with the up and down arrow keys, and turn with left and right. Hold Shift to hurry.','Walk with the stick in the bottom-left corner.'),done:s=>s.walked>3},
        {text:key('Quill will show you a shelf. Click a book to take it down.','Quill will show you a shelf. Tap a book to take it down.'),done:()=>!!selected,start:()=>leadToShelf()},
        {text:'Choose Open to read it. Turn pages with the arrow keys or by swiping, and try Aa for comfortable text.',done:()=>!ui.reader.classList.contains('hidden')},
        {text:'When you have read enough, put it back on its shelf, carry it about, or take it to any chair that says SIT & READ.',done:()=>ui.reader.classList.contains('hidden')&&(!selected||carryingBook||!!seated)},
        {text:key('Press J for your journal: what you have discovered, and a map of where you have been.','Tap J for your journal: what you have discovered, and a map of where you have been.'),done:()=>!ui.journal.classList.contains('hidden')},
        {text:'That is everything. There is no required route: follow a lamp, Quill, or a book left out of place. Press R, or ⌂, if you ever want to come back to the Grand Hall.',done:s=>s.shownFor>9}
      ];
      let step=-1,state=null;
      // Quill leads to a real, reachable shelf: a visible book standing on a shelf in the room the reader is in
      // (never a hidden or secret one), and waits in front of that shelf rather than beside the book itself.
      function leadToShelf(){const here=analyticsRoom(),at=new THREE.Vector3(),forward=new THREE.Vector3();let best=null,bestD=Infinity;
        for(const object of interactables){const data=object.userData,shelf=data?.home?.parent;if(data?.type!=='book'||data.secret||data.secretId||data.seatCopy||!shelf?.userData?.collider||object.parent!==shelf)continue;
          let shown=true;for(let n=object;n;n=n.parent){if(!n.visible)shown=false;if(!n.parent&&n!==scene)shown=false}if(!shown)continue;
          object.getWorldPosition(at);if(at.y>3.2||placeAt(at.x,floorHeight(at.x,at.z),at.z)!==here)continue;
          forward.set(0,0,1).applyQuaternion(shelf.getWorldQuaternion(tmpQuaternion)).setY(0).normalize();const stand=at.clone().addScaledVector(forward,1.7).setY(0);if(!allowed(stand.x,stand.z))continue;
          const d=stand.distanceTo(player.pos);if(d>2.5&&d<bestD){bestD=d;best=stand}}
        if(!best)return;catGuideTarget=best;catGuideLabel='a shelf of books';catPause=0;lastHintAt=performance.now();lastDiscoveryAt=performance.now()}
      function show(i){step=i;if(i>=STEPS.length){finish();return}$('#pauseSkipTour').classList.remove('hidden');state={turned:0,walked:0,shownFor:0,yaw:player.yaw,pitch:player.pitch,x:player.pos.x,z:player.pos.z};stepLabel.textContent=i<STEPS.length-1?`Your first visit · ${i+1} of ${STEPS.length-1}`:'Welcome to the library';text.textContent=STEPS[i].text;box.classList.remove('hidden');STEPS[i].start?.()}
      function finish(){step=STEPS.length;box.classList.add('hidden');$('#pauseSkipTour').classList.add('hidden');localStorage.setItem('athenaeum-tour-done','1')}
      /* The pointer is captured while looking around, so the link alone is not enough: X skips, and so does the pause menu. */
      const skip=e=>{e?.preventDefault?.();e?.stopPropagation?.();if(step<0||step>=STEPS.length)return;finish();showNotice('Tour skipped. Press R at any time to return to the Grand Hall.',4);if(started&&gameActive())requestLookLock()};
      $('#tourSkip').textContent=touchMode?'Skip tour':'Skip tour (press X)';$('#tourSkip').addEventListener('click',skip);$('#tourSkip').addEventListener('pointerup',skip);
      $('#pauseSkipTour').addEventListener('click',()=>{skip();ui.pause.classList.add('hidden')});
      window.addEventListener('keydown',e=>{if(e.code==='KeyX'&&step>=0&&step<STEPS.length&&!e.target?.closest?.('input,textarea')&&ui.reader.classList.contains('hidden'))skip(e)});
      setInterval(()=>{if(step<0||step>=STEPS.length||!started)return;/* Stay out from under other panels: hide while a book is open, move to the top while the book's own buttons show. */box.classList.toggle('hidden',chatOpen||supportOpen||settingsOpen||!ui.pause.classList.contains('hidden')||!ui.reader.classList.contains('hidden')||!ui.journal.classList.contains('hidden'));box.classList.toggle('tour-top',!ui.actions.classList.contains('hidden'));state.turned+=Math.abs(player.yaw-state.yaw)+Math.abs(player.pitch-state.pitch);state.yaw=player.yaw;state.pitch=player.pitch;state.walked+=Math.hypot(player.pos.x-state.x,player.pos.z-state.z);state.x=player.pos.x;state.z=player.pos.z;state.shownFor+=.3;if(step===2&&!catGuideTarget&&Math.floor(state.shownFor/20)>Math.floor((state.shownFor-.3)/20))leadToShelf();/* if Quill has sat down and no book has been taken, lead again */if(STEPS[step].done(state))show(step+1)},300);
      return {begin(){if(pending&&step<0)setTimeout(()=>show(0),1400)},get step(){return step},get guide(){return catGuideTarget},cat:()=>cat.position,finish}})();
    // ---- Continue reading: a slanted book rest just inside the entrance holding the books the reader has
    // started, each with how far they have got. Taking one down resumes it where they left off.
    const continueDisplay=(()=>{const x=-10,z=19.6,yaw=.9,group=new THREE.Group();group.position.set(x,0,z);group.rotation.y=yaw;scene.add(group);
      const part=(w,h,d,mat,px,py,pz,rx=0)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(px,py,pz);m.rotation.x=rx;group.add(m);return m};
      part(3,.9,.72,MAT.darkWood,0,.45,0);part(3.1,.07,1.05,MAT.wood,0,1.05,.02,-.5);part(3.1,.1,.09,MAT.brass,0,.86,.5);for(const px of [-1.5,1.5])part(.09,2.3,.09,MAT.brass,px,1.15,-.3);
      const signTexture=canvasTexture((c,w,h)=>{c.fillStyle='#231811';c.fillRect(0,0,w,h);c.strokeStyle='#c49a5a';c.lineWidth=5;c.strokeRect(7,7,w-14,h-14);c.fillStyle='#e6cf9f';c.textAlign='center';c.font='bold 30px Georgia';c.fillText('CONTINUE READING',w/2,46);c.font='italic 17px Georgia';c.fillStyle='#c9b184';c.fillText('Books you have started wait for you here',w/2,76)},512,96);
      const sign=part(3.05,.58,.05,new THREE.MeshStandardMaterial({map:signTexture,roughness:.75}),0,2.2,-.3);
      const emptyData={type:'resume-waiting',title:'Continue reading',author:'Nothing waits here yet. Start any book and it will be kept on this rest for you.',action:'EXAMINE'};for(const m of group.children)if(m.isMesh){m.userData=emptyData;interactables.push(m)}
      collider(x,z,3.2,1.8);
      const meshes=[];
      function clear(){for(const bm of meshes.splice(0)){if(bm===selected)continue;if(bm.userData.singleCopyMoved){for(const extra of bm.userData.continueExtras||[]){extra.parent?.remove(extra);extra.material.map?.dispose();extra.material.dispose()}bm.userData.continueExtras=[];continue;}const i=interactables.indexOf(bm);if(i>=0)interactables.splice(i,1);bm.parent?.remove(bm);bm.material.dispose();for(const extra of bm.userData.continueExtras||[]){extra.parent?.remove(extra);extra.material.map?.dispose();extra.material.dispose()}}}
      function refresh(){if(selected&&meshes.includes(selected))return;clear();const started=libraryMemory.unfinished().filter(book=>!placedBookIds.has(book.id)).slice(0,4);
        emptyData.book=started[0]||null;emptyData.action=started.length?'RESUME':'EXAMINE';emptyData.title=started.length?'I kept your place':'Continue reading';emptyData.author=started.length?`“${started[0].title}” is waiting where you left off. There is no hurry. — The librarian`:'Nothing waits here yet. Start any book and it will be kept on this rest for you.';const canvas=signTexture.image;if(canvas?.getContext){const c=canvas.getContext('2d');c.fillStyle='#231811';c.fillRect(12,12,488,72);c.textAlign='center';c.fillStyle='#e6cf9f';c.font='bold 30px Georgia';c.fillText(started.length?'I KEPT YOUR PLACE':'CONTINUE READING',256,46);c.font='italic 17px Georgia';c.fillStyle='#c9b184';c.fillText(started.length?'Your latest book is waiting. There is no hurry.':'Books you have started wait for you here',256,76);signTexture.needsUpdate=true}
        started.forEach((book,i)=>{const bm=new THREE.Mesh(shelvedBookGeometry,new THREE.MeshStandardMaterial({map:coverTexture(book),roughness:.68})),px=(i-(started.length-1)/2)*.72;bm.scale.setScalar(.5);bm.position.set(px,1.42,.02);bm.rotation.x=-.5;group.add(bm);group.updateMatrixWorld(true);
          const label=new THREE.Mesh(new THREE.PlaneGeometry(.6,.16),new THREE.MeshBasicMaterial({map:canvasTexture((c,w,h)=>{c.fillStyle='#1c140e';c.fillRect(0,0,w,h);c.fillStyle='#e6cf9f';c.textAlign='center';c.font='bold 30px Georgia';c.fillText(`${Math.round(book.progress*100)}% read`,w/2,38)},192,52)}));label.position.set(px,.93,.555);label.rotation.x=-.12;group.add(label);
          bm.userData={type:'book',book,loaded:false,continueExtras:[label],home:{parent:group,position:bm.position.clone(),quaternion:bm.quaternion.clone(),scale:.5}};interactables.push(bm);meshes.push(bm)})}
      refresh();return {refresh,group}})();
    {const preStack=refreshReadingStack;refreshReadingStack=function(){preStack();continueDisplay.refresh()}}
    // Three invented return histories, laid on the existing western returns table. No new lights.
    const tonightReturns=libraryMemory.returnSlips();
    for(const [i,slip] of tonightReturns.entries()){
      const bm=readingStandBook(slip.book,-6.8,3.45+i*1.45,0,1.67,0);bm.scale.setScalar(.52);bm.userData.home.scale=.52;bm.userData.returnSlip=slip.text;
      const texture=canvasTexture((c,w,h)=>{c.fillStyle='#e6d6b5';c.fillRect(0,0,w,h);c.strokeStyle='#987546';c.strokeRect(8,8,w-16,h-16);c.fillStyle='#463321';c.textAlign='center';c.font='bold 23px Georgia';c.fillText('RETURNED WITHOUT EXPLANATION',w/2,34);c.font='italic 24px Georgia';const words=slip.text.split(' ');let line='',y=72;for(const word of words){if(c.measureText(line+word).width>w-38){c.fillText(line.trim(),w/2,y);line='';y+=29}line+=word+' '}c.fillText(line.trim(),w/2,y)},512,192);
      const label=new THREE.Mesh(new THREE.PlaneGeometry(1.05,.39),new THREE.MeshStandardMaterial({map:texture,roughness:1}));label.position.set(-6.4,1.685,3.45+i*1.45+.53);label.rotation.x=-Math.PI/2;label.userData={type:'return-history',title:'A return slip: '+slip.book.title,author:slip.text,action:'READ'};scene.add(label);interactables.push(label);bm.userData.continueExtras=[label];
    }
    // Keep the story on the actual object being examined. If a later clue is found early,
    // its ordinary description still works and no later pages are added to the journal.
    {const preLivingInteract=interact;interact=function(){
      if(focus&&!selected){const object=focus,d=object.userData;
        if(d.type==='resume-waiting'){if(d.book){const bm=singleCopyLibrary.find(d.book);if(bm){selectBook(bm);openReader()}}else showNotice(d.author,6);focus=null;ui.prompt.style.opacity=0;return}
        if(d.trailEvent){const clue=rememberPaper(d.trailEvent);if(clue){focus=null;ui.prompt.style.opacity=0;return}}
        if(d.type==='night-railway'&&d.key==='signal-relic'){const result=preLivingInteract();rememberPaper('signal-ledger');return result}
      }return preLivingInteract();
    }}
    {const preReturnSelect=selectBook;selectBook=function(bm){const result=preReturnSelect(bm);if(selected?.userData.hiddenReward)showNotice('The librarian’s note: '+selected.userData.machineNote,14);else if(selected?.userData.returnSlip)showNotice('Pinned to the return slip: “'+selected.userData.returnSlip+'”',10);return result}}
    // ---- Grand Hall lighting, baked once into the floor: soft contact shadows beneath every shelf, table and
    // pillar, darker corners along the walls, and warm pools of light under the lamps and chandeliers.
    // Two painted textures on the floor cost the same every frame however many lamps there are.
    const hallLightmap=new URLSearchParams(location.search).has('nolightmap')?null:(()=>{const X0=-19,X1=19,Z0=-31,Z1=31,PX=16,w=(X1-X0)*PX,h=(Z1-Z0)*PX,toX=x=>(x-X0)*PX,toY=z=>(z-Z0)*PX;
      const shade=document.createElement('canvas'),glow=document.createElement('canvas');shade.width=glow.width=w;shade.height=glow.height=h;const s=shade.getContext('2d'),g=glow.getContext('2d');
      // Walls: the floor darkens gently towards every edge of the hall.
      for(const [x0,y0,x1,y1] of [[0,0,0,h*.09],[0,h,0,h*.91],[0,0,w*.12,0],[w,0,w*.88,0]]){const edge=s.createLinearGradient(x0,y0,x1,y1);edge.addColorStop(0,'rgba(0,0,0,.55)');edge.addColorStop(1,'rgba(0,0,0,0)');s.fillStyle=edge;s.fillRect(0,0,w,h)}
      // Contact shadows: stacked, widening rectangles give a soft edge without canvas blur filters.
      for(const c of colliders){if(c.inactive||c.minX<X0-1||c.maxX>X1+1||c.minZ<Z0-1||c.maxZ>Z1+1)continue;const cw=c.maxX-c.minX,cd=c.maxZ-c.minZ;if(cw*cd>60||cw<.05||cd<.05)continue;
        for(let k=0;k<9;k++){const m=k*.12-.08;s.fillStyle=`rgba(0,0,0,${k===0?.22:.085})`;s.fillRect(toX(c.minX-m),toY(c.minZ-m),(cw+m*2)*PX,(cd+m*2)*PX)}}
      // Light: pools under each lamp, wide and faint beneath the high chandeliers, tight and warm beneath the table lamps.
      const pools=lampSpots.filter(([x,y,z])=>x>X0&&x<X1&&z>Z0&&z<Z1).map(([x,y,z])=>[x,z,y>4?4.4:2.8,y>4?.13:.3]).concat([[0,4,5,.12],[0,-14,5,.12]]);
      g.globalCompositeOperation='lighter';for(const [x,z,r,a] of pools){const pool=g.createRadialGradient(toX(x),toY(z),0,toX(x),toY(z),r*PX);pool.addColorStop(0,`rgba(255,190,110,${a})`);pool.addColorStop(.45,`rgba(255,170,90,${a*.55})`);pool.addColorStop(1,'rgba(255,150,70,0)');g.fillStyle=pool;g.fillRect(toX(x-r),toY(z-r),r*2*PX,r*2*PX)}
      const texture=canvas=>{const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;return t};
      const plane=(canvas,y,options)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(X1-X0,Z1-Z0),new THREE.MeshBasicMaterial(Object.assign({map:texture(canvas),transparent:true,depthWrite:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2},options)));m.rotation.x=-Math.PI/2;m.position.set((X0+X1)/2,y,(Z0+Z1)/2);m.renderOrder=1;m.userData={type:'lightmap'};scene.add(m);return m};
      return {shadow:plane(shade,.028,{}),light:plane(glow,.03,{blending:THREE.AdditiveBlending})}})();
    // ---- Share a quote: turns a passage into a square image (for posts and messages) with the book, author
    // and the library's address. Uses the page's selected text, or the opening lines of the page in view.
    const quoteShare=(()=>{const dialog=$('#quoteShare'),text=$('#quoteText'),canvas=$('#quoteCanvas'),status=$('#quoteStatus');let book=null,drawTimer=0;
      function openingLines(page){const clean=String(page||'').replace(/\s+/g,' ').trim(),sentences=clean.match(/[^.!?]+[.!?]+["’”)]?/g)||[clean];let out='';for(const sentence of sentences){if((out+sentence).length>260&&out)break;out+=sentence}return out.trim().slice(0,380)}
      function selectedText(){const sel=window.getSelection?.();if(!sel||sel.isCollapsed)return '';const node=sel.anchorNode;return node&&$('#reader .pages')?.contains(node)?sel.toString().replace(/\s+/g,' ').trim():''}
      function wrap(c,words,width){const lines=[];let line='';for(const word of words){const test=line?line+' '+word:word;if(c.measureText(test).width>width&&line){lines.push(line);line=word}else line=test}if(line)lines.push(line);return lines}
      function draw(){const c=canvas.getContext('2d'),W=canvas.width,quote=text.value.trim()||'…';
        c.fillStyle='#16100b';c.fillRect(0,0,W,W);const glow=c.createRadialGradient(W*.5,W*.38,40,W*.5,W*.5,W*.75);glow.addColorStop(0,'rgba(196,132,62,.28)');glow.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=glow;c.fillRect(0,0,W,W);
        c.strokeStyle='#b88a4e';c.lineWidth=3;c.strokeRect(46,46,W-92,W-92);c.lineWidth=1;c.strokeRect(60,60,W-120,W-120);
        c.fillStyle='#c49a5a';c.font='220px Georgia, serif';c.textAlign='left';c.fillText('“',96,300);
        let size=quote.length>300?38:quote.length>200?44:quote.length>120?52:60,lines;do{c.font=`italic ${size}px "Cormorant Garamond", Georgia, serif`;lines=wrap(c,quote.split(' '),W-260);size-=2}while(lines.length*size*1.32>W*.52&&size>26);size+=2;
        const lh=size*1.32,top=W*.5-lines.length*lh/2+size*.2;c.fillStyle='#f0e2c4';c.textAlign='center';lines.forEach((line,i)=>c.fillText(line,W/2,top+i*lh));
        c.fillStyle='#d9b36c';c.font='600 30px Georgia, serif';const credit=wrap(c,`— ${book?.title||''}${book?.author?', '+book.author:''}`.split(' '),W-280);credit.forEach((line,i)=>c.fillText(line,W/2,top+lines.length*lh+40+i*38));
        c.fillStyle='#a8906a';c.font='28px "IM Fell English SC", Georgia, serif';c.fillText('THE LIBRARY AFTER DARK',W/2,W-120);c.font='22px Georgia, serif';c.fillStyle='#8d7858';c.fillText('libraryafterdark.space',W/2,W-86);
        $('#quoteCount').textContent=`${quote.length} / 420`}
      const redraw=()=>{clearTimeout(drawTimer);drawTimer=setTimeout(draw,60)};
      const blob=()=>new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
      const fileName=()=>`${(book?.title||'quote').replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').toLowerCase().slice(0,50)}-quote.png`;
      function open(){if(!selected)return;book=selected.userData.book;const chosen=selectedText(),page=book.pages?.[book.page||0]||'';text.value=(chosen||openingLines(page)).slice(0,420);status.textContent='';dialog.classList.remove('hidden');$('#quoteSend').hidden=!(navigator.canShare&&navigator.canShare({files:[new File([''],'q.png',{type:'image/png'})]}));Promise.all(['italic 40px "Cormorant Garamond"','28px "IM Fell English SC"'].map(f=>document.fonts?.load?.(f)).filter(Boolean)).catch(()=>{}).then(draw);draw();setTimeout(()=>text.focus(),0);window.libraryAnalytics?.track('Quote Opened')}
      function close(){dialog.classList.add('hidden')}
      text.addEventListener('input',redraw);$('#closeQuote').addEventListener('click',close);dialog.addEventListener('click',e=>{if(e.target===dialog)close()});
      $('#shareQuote').addEventListener('mousedown',e=>e.preventDefault());/* keep the page selection alive while clicking */
      $('#shareQuote').addEventListener('click',open);
      $('#quoteDownload').addEventListener('click',async()=>{draw();const b=await blob(),url=URL.createObjectURL(b),a=document.createElement('a');a.href=url;a.download=fileName();document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);status.textContent='Image saved.';window.libraryAnalytics?.track('Quote Shared',{how:'download'})});
      $('#quoteCopy').addEventListener('click',async()=>{const line=`“${text.value.trim()}” — ${book?.title||''}${book?.author?', '+book.author:''}\nRead it in The Library After Dark: https://libraryafterdark.space/`;try{await navigator.clipboard.writeText(line);status.textContent='Quote copied, with a link to the library.'}catch(e){status.textContent='Copying is not allowed here; select the text and copy it instead.'}window.libraryAnalytics?.track('Quote Shared',{how:'copy'})});
      $('#quoteSend').addEventListener('click',async()=>{draw();try{const file=new File([await blob()],fileName(),{type:'image/png'});await navigator.share({files:[file],title:book?.title||'The Library After Dark',text:`From ${book?.title||'a book'} in The Library After Dark — https://libraryafterdark.space/`});status.textContent='Shared.';window.libraryAnalytics?.track('Quote Shared',{how:'share'})}catch(e){if(e?.name!=='AbortError')status.textContent='Sharing did not work here; try Download image instead.'}});
      /* Typing a quote must not turn pages or walk: keys stay inside the text box, and Escape closes the dialog. */
      window.addEventListener('keydown',e=>{if(dialog.classList.contains('hidden'))return;if(e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();return}if(e.target===text||dialog.contains(e.target))e.stopImmediatePropagation()},true);
      return {open,close,get isOpen(){return !dialog.classList.contains('hidden')}}})();
    // A cheap fingerprint of the scene: it changes when rooms are built, zones swap in or new geometry is first drawn.
    const sceneStamp=()=>`${scene.children.length}:${renderer.info.memory.geometries}`;
    // Pieces that never move are merged per material into single draw calls (see static-batching.js).
    const staticBatcher=new URLSearchParams(location.search).has('nobatch')?null:window.createStaticBatcher?.({THREE,scene,exclusions:()=>interactables,changeStamp:sceneStamp})||null;
    const warmedMaterials=new WeakSet();let shadersWarm=false,warmingShaders=false;
    function materialsOf(object){return Array.isArray(object.material)?object.material:object.material?[object.material]:[]}
    // Areas that are built but not yet in the scene (wings and rooms added as the reader arrives).
    const detachedAreas=()=>Object.values(performanceZones).filter(zone=>!zone.active&&zone.group).map(zone=>zone.group);
    // Chrome and Edge compile shaders off the main thread, so every unvisited area is warmed in the background.
    // Elsewhere (Safari on every iPhone and iPad, some Firefox) compiling freezes the page, so only areas within
    // about 45 m are warmed, one piece at a time, and only while the reader is standing still.
    const areaCentres=new WeakMap();
    function areaNear(group,range){let centre=areaCentres.get(group);if(!centre){const box=new THREE.Box3().setFromObject(group);centre=box.isEmpty()?null:box.getCenter(new THREE.Vector3());areaCentres.set(group,centre)}return !!centre&&centre.distanceTo(player.pos)<range}
    function warmUnvisitedAreas(){if(warmingShaders||!started)return;const parallel=renderer.extensions.has('KHR_parallel_shader_compile'),roots=parallel?detachedAreas():detachedAreas().filter(group=>areaNear(group,45));if(roots.length)warmShaders(null,{roots,chunkSize:parallel?2:1,pause:parallel?16:40,whenIdle:!parallel}).catch(()=>{})}
    async function warmShaders(progress,{roots=[scene],chunkSize=3,pause=0,whenIdle=false}={}){
      /* Compile for the light count that will really be used (see budgetFillers), not every lamp in the building. */
      refreshBudgetLights.stamp=null;budgetRefreshTimer=0;applyLightBudget();
      const pending=[];for(const root of roots)root.traverse(object=>{if(object.isLight)return;const fresh=materialsOf(object).filter(material=>!warmedMaterials.has(material));if(!fresh.length)return;fresh.forEach(material=>warmedMaterials.add(material));pending.push(object)});
      if(!pending.length){progress?.(1);return}
      // An area not yet in the scene brings its own lamps; while compiling they are switched off, because once
      // it is added the light budget keeps the total the same, and the shaders must match that total.
      // (Only for the moment of compiling, piece by piece: an area may be walked into while a slow warm-up waits.)
      const detached=roots.filter(root=>root!==scene),hideLamps=()=>{const hidden=[];for(const root of detached)root.traverse(object=>{if(object.isLight&&object.visible){object.visible=false;hidden.push(object)}});return hidden};
      warmingShaders=true;const parallel=renderer.extensions.has('KHR_parallel_shader_compile'),chunk=parallel?pending.length:chunkSize,previousTarget=renderer.getRenderTarget();
      try{
        for(let i=0;i<pending.length;i+=chunk){
          /* Where compiling blocks the page, wait for the reader to stand still (or look away) before each piece. */
          if(whenIdle)while(playerIsMoving()||document.hidden)await new Promise(resolve=>setTimeout(resolve,250));
          const batch=pending.slice(i,i+chunk),hidden=hideLamps();visual?.bindSceneTarget?.();
          try{for(const object of batch)if(!detached.length||object.parent)renderer.compile(object,camera,scene)}finally{for(const light of hidden)light.visible=true}
          /* Without parallel compilation the driver finishes linking on first use; do that now, here. */
          if(!parallel)for(const object of batch)for(const material of materialsOf(object))renderer.properties.get(material).currentProgram?.getUniforms();
          renderer.setRenderTarget(previousTarget);progress?.((i+batch.length)/pending.length*(parallel?.3:1));
          await new Promise(resolve=>setTimeout(resolve,pause));
        }
        if(parallel){const programs=[...new Set(pending.flatMap(object=>materialsOf(object).map(material=>renderer.properties.get(material).currentProgram).filter(Boolean)))],started=performance.now();for(;;){const ready=programs.filter(program=>program.isReady()).length;progress?.(.3+.7*ready/programs.length);if(ready===programs.length||performance.now()-started>12000)break;await new Promise(resolve=>setTimeout(resolve,30))}}
      }finally{renderer.setRenderTarget(previousTarget);warmingShaders=false}
    }
    // Opt-in inspection hook for automated visual and performance checks (?debug).
    if(new URLSearchParams(location.search).has('debug'))window.__athenaeum={THREE,MAT,seats,telescopeViewer,hiddenEditions,libraryMemory,openChat,openReader,renderReader,renderJournal,singleCopyLibrary,sitWithBook,returnSelected,carrySelected,placeSelected,refreshReadingStack,get selected(){return selected},hallLightmap,quoteShare,selectBook:bm=>selectBook(bm),staticBatcher,tour,continueDisplay,lampSpots,get dayPhase(){return dayPhase},set dayPhase(v){dayPhase=v},get roomAmbience(){return roomAmbience},placeAt:(x,y,z)=>placeAt(x,y,z),resetPosition:()=>resetPosition(),afterDarkExpansion,librarianOffice,dailyRoom,cinderArchive,crusoeIsland,otherReaders,learnersRoom,poeRoom,irishRoom,kellsBook,kelmscottBook,voynichBook,mapRoom,medicineRoom,austenRoom,burnsRoom,withinRoom,vesaliusBook,setTextsRoom,antipodes,africanRoom,eveningRoom,bookLift,visitorsBook,wordHelp:window.libraryWordHelp,verneDescent,analyticsRoom:()=>analyticsRoom(),floorAt:(x,z)=>floorHeight(x,z),renderer,scene,camera,player,visual,books,curiousDoors,get librarianNotes(){return librarianNotes},interactables,zones:()=>({memoryZones,themeZones}),buildTheme:key=>buildThemeRooms(key),dressExits(){exitDressTimer=0;dressExitDoors(0)},allowedAt:(x,z)=>allowed(x,z),wallFaceOffset,buildAll(){buildBasement();buildMemoryRooms();for(const z of themeZones)try{buildThemeRooms(z.key)}catch(e){}try{buildContestedRoom()}catch(e){}},nightRailway,highStaircase,marsWorld,periodicalsRoom,internationalWing,interact:()=>interact(),get focus(){return focus},get soundscape(){return soundscape},get audioCtx(){return audioCtx},playSample,teleport(x,y,z,yaw=0,pitch=0){player.pos.set(x,y,z);player.vel.set(0,0,0);player.yaw=yaw;player.pitch=pitch;lastSafePosition.copy(player.pos)}};
    // Compiling every shader on the first frame froze the page for seconds, longest on tablets.
    // Compile them behind the entrance veil instead, a few at a time so the progress bar keeps
    // moving, then keep warming the materials of rooms that are built later, before they are seen.
    singleCopyLibrary.sync();
    const bootProgress=document.querySelector('#entryProgress i');
    warmShaders(fraction=>{if(bootProgress)bootProgress.style.width=`${80+Math.round(fraction*20)}%`}).catch(error=>console.warn('Shader warm-up skipped',error)).finally(()=>{shadersWarm=true;animate();if(window.__ATHENAEUM_ENTERED__)enterLibrary();/* Then the wings and rooms not yet visited, so walking into them later does not stall (see warmUnvisitedAreas). */setTimeout(warmUnvisitedAreas,4000);setInterval(warmUnvisitedAreas,6000);let warmedStamp=sceneStamp();setInterval(()=>{const stamp=sceneStamp();if(warmingShaders||stamp===warmedStamp)return;warmedStamp=stamp;warmShaders().catch(()=>{})},1500)});
  })();

