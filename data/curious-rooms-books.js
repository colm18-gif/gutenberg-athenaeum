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
    {id:289,title:'The Wind in the Willows',author:'Kenneth Grahame',category:'Wonder',fame:70,room:'attic',note:'Messing about in boats, and Toad’s disastrous love of motor-cars.'}
  ];
})();
