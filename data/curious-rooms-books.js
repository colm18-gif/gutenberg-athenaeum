/* Books for the four rooms behind the curious doors. Each text is bundled in texts/pg<id>.txt
   (Project Gutenberg editions via the GITenberg mirror), so they open without a network fetch. */
(function(){
  'use strict';

  window.ATHENAEUM_CURIOUS_BOOKS=[
    // The Horologist's Study — time, other dimensions and the worlds that come after us.
    {id:201,title:'Flatland: A Romance of Many Dimensions',author:'Edwin A. Abbott',category:'Speculative',fame:45,room:'horologist',note:'A square is visited by a sphere and learns that his whole world was a single page.'},
    {id:624,title:'Looking Backward: 2000–1887',author:'Edward Bellamy',category:'Speculative',fame:30,room:'horologist',note:'A Bostonian sleeps for 113 years and wakes to argue with the future.'},
    {id:2048,title:'The Sketch Book of Geoffrey Crayon, Gent.',author:'Washington Irving',category:'Legend',fame:40,room:'horologist',note:'Contains “Rip Van Winkle”, the most famous nap in literature, and “The Legend of Sleepy Hollow”.'},
    {id:18247,title:'The Last Man',author:'Mary Shelley',category:'Speculative',fame:28,room:'horologist',note:'Frankenstein’s author imagines the end of the twenty-first century and the last voice left to tell it.'},
    {id:837,title:'The Story of the Amulet',author:'E. Nesbit',category:'Wonder',fame:22,room:'horologist',note:'Four children and a half-amulet travel to Babylon, Atlantis and a very puzzled future.'},

    // The Night Conservatory — gardens, green things and the strange life of leaves.
    {id:512,title:'Mosses from an Old Manse',author:'Nathaniel Hawthorne',category:'Uncanny',fame:25,room:'conservatory',note:'Includes “Rappaccini’s Daughter”, whose garden is lovely and lethal.'},
    {id:16389,title:'The Enchanted April',author:'Elizabeth von Arnim',category:'Society',fame:30,room:'conservatory',note:'Four strangers rent a castle in Italy for the wisteria alone.'},
    {id:1429,title:'The Garden Party, and Other Stories',author:'Katherine Mansfield',category:'Modern',fame:35,room:'conservatory',note:'A perfect afternoon among the lilies, and the news that interrupts it.'},
    {id:942,title:'Green Mansions',author:'W. H. Hudson',category:'Journey',fame:18,room:'conservatory',note:'A romance of the forest and of Rima, who speaks the language of birds.'},
    {id:29220,title:'Monday or Tuesday',author:'Virginia Woolf',category:'Modern',fame:20,room:'conservatory',note:'Holds “Kew Gardens”: a flower bed, a snail, and the lives drifting past it.'},

    // The Ghost-Story Parlour — told by the fire, ideally with the lamps turned low.
    {id:8486,title:'Ghost Stories of an Antiquary',author:'M. R. James',category:'Ghosts',fame:40,room:'parlour',note:'Read aloud by James to friends at Christmas; the whistle on the beach is still blowing.'},
    {id:10007,title:'Carmilla',author:'J. Sheridan Le Fanu',category:'Gothic',fame:38,room:'parlour',note:'A lonely girl, a charming guest, and a portrait dated a century and a half too early.'},
    {id:170,title:'The Haunted Hotel',author:'Wilkie Collins',category:'Mystery',fame:18,room:'parlour',note:'A Venetian palace becomes a hotel. One bedroom never quite stops being a crime scene.'},
    {id:14522,title:'The Canterville Ghost',author:'Oscar Wilde',category:'Ghosts',fame:45,room:'parlour',note:'An American family refuses, politely and repeatedly, to be frightened.'},

    // The Children's Attic — fairy tales, talking animals and toys that become real.
    {id:2781,title:'Just So Stories',author:'Rudyard Kipling',category:'Wonder',fame:55,room:'attic',note:'How the leopard got his spots, O Best Beloved, and other important explanations.'},
    {id:503,title:'The Blue Fairy Book',author:'Andrew Lang (ed.)',category:'Legend',fame:35,room:'attic',note:'The first of Lang’s coloured fairy books: Aladdin, Rumpelstiltskin and the Sleeping Beauty.'},
    {id:11757,title:'The Velveteen Rabbit',author:'Margery Williams',category:'Wonder',fame:50,room:'attic',note:'Real isn’t how you are made. It’s a thing that happens to you.'},
    {id:14838,title:'The Tale of Peter Rabbit',author:'Beatrix Potter',category:'Wonder',fame:65,room:'attic',note:'Mr. McGregor’s garden, a lost jacket, and a dose of camomile tea.'},
    {id:708,title:'The Princess and the Goblin',author:'George MacDonald',category:'Wonder',fame:30,room:'attic',note:'A thread you cannot see leads through the dark under the mountain.'},
    {id:778,title:'Five Children and It',author:'E. Nesbit',category:'Wonder',fame:40,room:'attic',note:'A grumpy sand-fairy grants one wish a day. Every one goes wrong by sunset.'},
    {id:225,title:'At the Back of the North Wind',author:'George MacDonald',category:'Wonder',fame:22,room:'attic',note:'A coachman’s son is carried through the night by a wind with a woman’s voice.'},
    {id:289,title:'The Wind in the Willows',author:'Kenneth Grahame',category:'Wonder',fame:70,room:'attic',note:'Messing about in boats, and Toad’s disastrous love of motor-cars.'},
    // The Children's Attic, the painted bookcase on the west wall (shelf 'case'): picture books and rhymes on the top tier,
    // stories to grow into below. Most are copies of books that also stand elsewhere in the library.
    {id:10607,title:'The Real Mother Goose',author:'Blanche Fisher Wright (ill.)',category:'Poetry',fame:40,room:'attic',shelf:'case',note:'The old nursery rhymes, nearly every one with its own picture.'},
    {id:14407,title:'The Tale of Benjamin Bunny',author:'Beatrix Potter',category:'Wonder',fame:40,room:'attic',shelf:'case',note:'Peter goes back for his clothes, with his cousin, which is braver than it sounds.'},
    {id:14837,title:'The Tale of Tom Kitten',author:'Beatrix Potter',category:'Wonder',fame:35,room:'attic',shelf:'case',note:'Three kittens in their best clothes, and a garden wall.'},
    {id:14814,title:'The Tale of Jemima Puddle-Duck',author:'Beatrix Potter',category:'Wonder',fame:40,room:'attic',shelf:'case',note:'A duck in a bonnet meets a very polite gentleman with sandy whiskers.'},
    {id:902,title:'The Happy Prince, and Other Tales',author:'Oscar Wilde',category:'Wonder',fame:40,room:'attic',shelf:'case',note:'A golden statue, a swallow who stays too long, and a garden with a wall round it.'},
    {id:540,title:'The Red Fairy Book',author:'Andrew Lang',category:'Fairy Tale',fame:30,room:'attic',shelf:'case',note:'The second of Lang’s coloured fairy books, and Jack’s beanstalk is in it.'},
    {id:55,title:'The Wonderful Wizard of Oz',author:'L. Frank Baum',category:'Wonder',fame:70,room:'attic',shelf:'case',note:'A cyclone, a yellow brick road, and three friends who already have what they want.'},
    {id:236,title:'The Jungle Book',author:'Rudyard Kipling',category:'Adventure',fame:65,room:'attic',shelf:'case',note:'Mowgli among the wolves, and Rikki-tikki-tavi in the garden.'},
    {id:16,title:'Peter Pan',author:'J. M. Barrie',category:'Wonder',fame:75,room:'attic',shelf:'case',note:'Second to the right, and straight on till morning.'},
    {id:500,title:'The Adventures of Pinocchio',author:'Carlo Collodi',category:'Wonder',fame:55,room:'attic',shelf:'case',note:'A puppet who runs away from everyone who loves him, and comes back.'},
    {id:1874,title:'The Railway Children',author:'E. Nesbit',category:'Wonder',fame:50,room:'attic',shelf:'case',note:'Three children, a cottage by the line, and the 9.15 they wave to every day.'},
    {id:770,title:'The Story of the Treasure Seekers',author:'E. Nesbit',category:'Wonder',fame:30,room:'attic',shelf:'case',note:'Six Bastables set out to restore the family fortune. One of them is telling it.'},
    {id:113,title:'The Secret Garden',author:'Frances Hodgson Burnett',category:'Wonder',fame:70,room:'attic',shelf:'case',note:'A buried key, a locked door in a wall, and a garden nobody has been into for ten years.'},
    {id:146,title:'A Little Princess',author:'Frances Hodgson Burnett',category:'Wonder',fame:50,room:'attic',shelf:'case',note:'Sara Crewe loses everything but her imagination, and her attic is transformed in the night.'},
  ];
})();
