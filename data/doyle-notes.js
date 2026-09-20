/* Librarian commentary for every English-language Conan Doyle edition in the Project Gutenberg catalogue. */
window.ATHENAEUM_EXTRA_NOTES=window.ATHENAEUM_EXTRA_NOTES||{};
const doyleThemes=[
  [/Sherlock|Wisteria|Cardboard|Red Circle|Bruce-Partington|Dying Detective|Frances Carfax|Devil's Foot|His last bow|Hound|Baskerville|Valley of Fear|Sign of the Four|case-book/i,'This edition belongs to Doyle’s great detective shelf, where observation matters, Watson supplies the human warmth, and London always keeps one fact hidden until the proper moment.'],
  [/Challenger|Poison Belt|Lost World|land of mist/i,'Professor Challenger brings scientific certainty into circumstances that refuse to behave scientifically. Doyle gives the impossible just enough evidence to make disbelief feel rash.'],
  [/Gerard|Napoleon|Bernac|Great Shadow/i,'Doyle treats the Napoleonic age with energy and affectionate irony. Courage is plentiful here; accurate self-knowledge is rather harder to obtain.'],
  [/White Company|Sir Nigel|Micah Clarke|Refugees|Legions/i,'This historical adventure shows how seriously Doyle took the past and how eagerly he filled it with roads, battles, divided loyalties, and people tested under pressure.'],
  [/Boer|British Campaign|German War|Three Fronts|Congo|South Africa/i,'This is Doyle writing as a public historian and advocate. Read its detailed record alongside the loyalties and assumptions of the moment in which it was written.'],
  [/Spiritual|Fairies|Spirit|Vital Message|New Revelation/i,'This volume records the spiritualist convictions that shaped Doyle’s later life. Its urgency comes from a writer trying to reconcile evidence, grief, wonder, and hope.'],
  [/Songs|Poems|Guards Came Through/i,'Doyle’s verse favours movement, duty, memory, and public feeling. These poems often sound made to be spoken aloud rather than left silently on a page.'],
  [/Round the Red Lamp|Stark Munro|Croxley|medical|doctor/i,'Doyle’s medical training gives this work its close observation of professional life. The mystery is often moral before it is diagnostic.'],
  [/Terror|Mystery|Polestar|Fire Stories|Keinplatz|Cloomber|Archangel|Bluemansdyke/i,'Doyle stands comfortably at the border between rational explanation and the uncanny. Even when a solution arrives, the room rarely becomes entirely safe again.'],
  [/Pirates|Sharkey|Adventure|Danger|Raffles Haw|Korosko/i,'This is Doyle in full adventure mode: brisk danger, tested courage, and a premise pursued without apology. The momentum is part of the craft.']
];
for(const [id,title] of window.ATHENAEUM_DOYLE_BOOKS||[]){const theme=doyleThemes.find(([pattern])=>pattern.test(title));window.ATHENAEUM_EXTRA_NOTES[id]=window.ATHENAEUM_EXTRA_NOTES[id]||(theme?theme[1]:`“${title}” reveals another side of Doyle beyond the familiar silhouette at Baker Street. This English Project Gutenberg edition also preserves its own scan and textual history, which is why it keeps a distinct place on these shelves.`)}
