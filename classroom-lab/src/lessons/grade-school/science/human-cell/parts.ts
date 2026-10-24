import {
 CENTROSOME, EXO, EXO_T, GENE_START, GOLGI, LYSOSOMES, MITOS, NUCLEOLUS, PORE_EXIT, POLYSOME, RIBO_ON_ER, VESICLES,
 cellPoint, erPoint, golgiPoint, local, nucPoint, type Pt, type View
} from './geometry';

export type PartId =
 | 'membrane' | 'cytoplasm' | 'nucleus' | 'nucleolus' | 'roughER' | 'smoothER' | 'ribosomes'
 | 'golgi' | 'vesicles' | 'mitochondria' | 'lysosomes' | 'centrosome' | 'cytoskeleton';

export type Sub = { id: string; name: string; text: string; at: Pt; part?: PartId };
export type Part = {
 id: PartId;
 name: string;
 short: string; // name for chips and labels
 color: string;
 job: string;
 more: string;
 city: { name: string; text: string };
 fact: string;
 count: string;
 clue: string;
 zoom: number; // width of the scene shown in the lens when this part is chosen
 home: Pt; // where the lens looks when the part is chosen from the list or keyboard
 label: { text: Pt; anchor: 'start' | 'middle' | 'end' };
 closeup?: { view: View; subs: Sub[] };
};

const mito0 = MITOS[0];
const mtEnd = cellPoint(-1.78, 20);
const mtNear: Pt = [mtEnd[0] + (CENTROSOME[0] - mtEnd[0]) * 0.1, mtEnd[1] + (CENTROSOME[1] - mtEnd[1]) * 0.1];
const [px, py] = POLYSOME;

export const parts: Part[] = [
 {
  id: 'nucleus', name: 'Nucleus', short: 'Nucleus', color: '#8b6cc9',
  job: "The control center. It holds DNA, the cell's instructions.",
  more: 'DNA is a very long molecule that carries the instructions for building proteins, and proteins do most of the jobs in a cell. The nucleus keeps the DNA safe inside a double membrane called the nuclear envelope. Copies of the instructions travel out through tiny holes called nuclear pores.',
  city: { name: 'City hall', text: 'City hall keeps the plans for the city and sends out orders. The nucleus keeps the DNA and sends out copies of its instructions.' },
  fact: 'If you could stretch out all the DNA from just one of your cells, it would be about 2 meters long, taller than most adults.',
  count: 'Usually one. Mature red blood cells have none, and skeletal muscle cells have many.',
  clue: "I'm the control center. I keep the cell's DNA safe.",
  zoom: 300, home: [350, 280], label: { text: [300, 205], anchor: 'middle' },
  closeup: {
   view: { x: 392, y: 264, w: 184 },
   subs: [
    { id: 'envelope', name: 'Nuclear envelope', at: nucPoint(-0.95, 2), text: 'Two membranes wrap around the nucleus and keep the DNA apart from the rest of the cell.' },
    { id: 'pore', name: 'Nuclear pore', at: nucPoint(PORE_EXIT, 2), text: 'A doorway through the envelope. Copies of DNA instructions leave through pores, and materials the nucleus needs come in. One nucleus has thousands of pores.' },
    { id: 'chromatin', name: 'Chromatin (DNA)', at: GENE_START, text: 'DNA wrapped around proteins, spread out like loose thread. Before a cell divides, it coils up tightly into chromosomes. Most of your body cells have 46 chromosomes.' },
    { id: 'nucleolus', name: 'Nucleolus', at: NUCLEOLUS, part: 'nucleolus', text: 'A dense spot inside the nucleus that builds the parts of ribosomes.' }
   ]
  }
 },
 {
  id: 'nucleolus', name: 'Nucleolus', short: 'Nucleolus', color: '#5d3f9c',
  job: 'A dense spot inside the nucleus that makes the parts of ribosomes.',
  more: 'The nucleolus does not have its own membrane. It is a busy area of the nucleus where pieces of ribosomes are put together. The pieces leave through the nuclear pores, then join up in the cytoplasm to make working ribosomes.',
  city: { name: 'Machine-parts workshop', text: "A workshop inside city hall that builds parts for the city's machines." },
  fact: 'Cells that make a lot of protein often have a large nucleolus, or more than one.',
  count: 'One or a few in each nucleus',
  clue: "I'm a dark spot inside the nucleus where the parts of ribosomes are made.",
  zoom: 140, home: NUCLEOLUS, label: { text: [378, 238], anchor: 'middle' }
 },
 {
  id: 'roughER', name: 'Rough endoplasmic reticulum (rough ER)', short: 'Rough ER', color: '#3f8fd2',
  job: 'Folded sheets covered with ribosomes, where many proteins are built and folded.',
  more: "The rough ER is a maze of flattened sacs connected to the nuclear envelope. Ribosomes on its surface give it a bumpy, \"rough\" look. The proteins they build go inside the sacs, where they fold into the right shape. Then they are sent off in small bubbles called vesicles, usually to the Golgi apparatus.",
  city: { name: 'Assembly line', text: 'Workers on an assembly line build products and pass them along to be finished and shipped.' },
  fact: '"Endoplasmic reticulum" comes from words that mean "a little net inside the cell."',
  count: 'One connected network',
  clue: "I'm a stack of folded sheets covered with ribosomes. New proteins fold inside me.",
  zoom: 220, home: erPoint(150, 0), label: { text: [512, 178], anchor: 'start' },
  closeup: {
   view: { x: 478, y: 256, w: 80 },
   subs: [
    { id: 'attached', name: 'Attached ribosome', at: RIBO_ON_ER, part: 'ribosomes', text: 'Ribosomes stuck to the outside of the sacs. As they build a protein, they feed it into the sac.' },
    { id: 'sac', name: 'Flattened sac', at: erPoint(142, -2), text: 'The ER is made of membrane folded into flat sacs and tubes, all connected into one network.' },
    { id: 'lumen', name: 'Inside space', at: erPoint(158, -10), text: "The space inside the sacs, where new proteins fold. It connects to the space between the nuclear envelope's two membranes." }
   ]
  }
 },
 {
  id: 'smoothER', name: 'Smooth endoplasmic reticulum (smooth ER)', short: 'Smooth ER', color: '#3aa7bf',
  job: 'Tubes with no ribosomes that make fats and help break down harmful substances.',
  more: 'The smooth ER connects to the rough ER, but it has no ribosomes. It makes lipids (fats and oils), including the ones the cell uses to build new membranes. In liver cells, it helps break down some drugs and poisons. In muscle cells, it stores calcium, which helps muscles squeeze.',
  city: { name: 'Specialty workshop', text: 'A workshop that makes building materials and cleans up harmful chemicals.' },
  fact: 'Liver cells have lots of smooth ER because they help clean harmful substances out of the blood.',
  count: 'Part of the same network as the rough ER',
  clue: "I'm a network of tubes with no ribosomes. I make fats and help break down harmful substances.",
  zoom: 190, home: [208, 396], label: { text: [150, 470], anchor: 'middle' }
 },
 {
  id: 'ribosomes', name: 'Ribosomes', short: 'Ribosomes', color: '#27365f',
  job: 'Tiny machines that build proteins by following instructions from DNA.',
  more: 'A ribosome reads a copy of a DNA instruction, called messenger RNA, and links small building blocks called amino acids into a chain. The chain folds into a protein. Some ribosomes are free in the cytoplasm and make proteins the cell uses there. Others sit on the rough ER and make proteins that will be shipped.',
  city: { name: 'Builders', text: 'Builders follow plans from city hall to put things together, one piece at a time.' },
  fact: 'One cell can have millions of ribosomes. They are drawn much bigger here than they really are.',
  count: 'Millions',
  clue: 'We are the tiny builders that link amino acids together to make proteins.',
  zoom: 70, home: POLYSOME, label: { text: [618, 482], anchor: 'middle' },
  closeup: {
   view: { x: px, y: py, w: 30 },
   subs: [
    { id: 'large', name: 'Large subunit', at: [px - 3, py], text: 'Every ribosome has two parts. The large part links the amino acids together.' },
    { id: 'small', name: 'Small subunit', at: [px + 3, py - 2.6], text: 'The small part holds on to the messenger RNA and helps read it.' },
    { id: 'mrna', name: 'Messenger RNA', at: [px + 12, py + 1.5], text: 'A copy of one instruction from the DNA. Several ribosomes can read the same copy at once.' },
    { id: 'chain', name: 'New protein chain', at: [px + 6, py - 9], text: 'A growing chain of amino acids. Ribosomes that have read farther along the copy have longer chains.' }
   ]
  }
 },
 {
  id: 'golgi', name: 'Golgi apparatus', short: 'Golgi apparatus', color: '#d39a22',
  job: 'A stack of flat sacs that finishes, sorts, and packages proteins for delivery.',
  more: 'Vesicles from the ER arrive at the receiving side of the Golgi. As proteins move through the stack, they are changed, for example by adding sugars to them. On the shipping side, they are sorted and wrapped in new vesicles that carry them where they need to go: to the cell membrane, to lysosomes, or out of the cell.',
  city: { name: 'Post office', text: 'A post office sorts packages, labels them, and sends each one to the right address.' },
  fact: 'It is named after Camillo Golgi, an Italian scientist who described it in 1898.',
  count: 'Usually one, close to the nucleus',
  clue: "I'm a stack of flat sacs. I sort and package proteins, like a post office.",
  zoom: 190, home: [616, 300], label: { text: [640, 392], anchor: 'middle' },
  closeup: {
   view: { x: 618, y: 300, w: 124 },
   subs: [
    { id: 'cis', name: 'Receiving side', at: golgiPoint(GOLGI[0].r, 0.18), text: 'This side faces the ER. Vesicles arrive here and join the first sac.' },
    { id: 'trans', name: 'Shipping side', at: golgiPoint(GOLGI[4].r, -0.15), text: 'This side faces the cell membrane. Finished proteins leave from here.' },
    { id: 'bud', name: 'New vesicle', at: VESICLES[0], part: 'vesicles', text: 'A vesicle pinching off with finished proteins inside, ready to be delivered.' }
   ]
  }
 },
 {
  id: 'vesicles', name: 'Vesicles', short: 'Vesicles', color: '#d79a2a',
  job: 'Small bubbles of membrane that carry materials around the cell.',
  more: 'A vesicle forms when a bit of membrane pinches off with materials inside. Vesicles carry new proteins from the ER to the Golgi, and from the Golgi to where they are needed. When a vesicle joins the cell membrane, it empties its cargo outside the cell. Cells can also take things in by wrapping them in a vesicle made from the cell membrane.',
  city: { name: 'Delivery trucks', text: 'Trucks carry packages from the post office to homes and businesses, and sometimes out of the city.' },
  fact: 'Motor proteins "walk" vesicles along the tubes of the cytoskeleton, a bit like trucks on a highway.',
  count: 'Many, always forming and merging',
  clue: 'We are little bubbles of membrane that carry materials from place to place.',
  zoom: 110, home: VESICLES[1], label: { text: [728, 250], anchor: 'middle' },
  closeup: {
   view: { x: EXO[0] - 6, y: EXO[1], w: 54 },
   subs: [
    { id: 'merge', name: 'Joining the membrane', at: [EXO[0] - 4, EXO[1] + 4], text: "This vesicle is merging with the cell membrane. Its own membrane becomes part of the cell's outer edge." },
    { id: 'cargo', name: 'Cargo leaving the cell', at: cellPoint(EXO_T, -9), text: 'What was inside spills out of the cell. This is how some cells send out things like insulin or digestive enzymes.' }
   ]
  }
 },
 {
  id: 'mitochondria', name: 'Mitochondria', short: 'Mitochondria', color: '#d0563c',
  job: 'Power plants that release the energy stored in food so the cell can use it.',
  more: 'Inside mitochondria, sugar from food is broken down using oxygen. This releases energy, which is stored in small molecules called ATP that power the work of the cell. Carbon dioxide and water are left over. That is a big reason you breathe in oxygen and breathe out carbon dioxide.',
  city: { name: 'Power plant', text: "A power plant doesn't make energy out of nothing. It changes the energy in fuel into a form people can use. Mitochondria do the same thing with food." },
  fact: 'Mitochondria have their own small loop of DNA. You got yours from your mother.',
  count: 'From a few to thousands, depending on how much energy the cell needs',
  clue: 'We release the energy stored in food so the cell can use it.',
  zoom: 150, home: [mito0.x, mito0.y], label: { text: [92, 150], anchor: 'middle' },
  closeup: {
   view: { x: mito0.x, y: mito0.y, w: 108 },
   subs: [
    { id: 'outer', name: 'Outer membrane', at: local(mito0, -18, -19), text: 'A smooth outer layer that wraps the whole mitochondrion.' },
    { id: 'cristae', name: 'Inner folds (cristae)', at: local(mito0, -9, 6), text: 'The inner membrane is folded again and again. The folds give it lots of surface for releasing energy.' },
    { id: 'matrix', name: 'Matrix', at: local(mito0, 28, -3), text: 'The fluid in the middle, where food molecules are broken down.' },
    { id: 'mtdna', name: 'Mitochondrial DNA', at: local(mito0, 10, 4), text: "A small loop of DNA with instructions for a few of the mitochondrion's own proteins." }
   ]
  }
 },
 {
  id: 'lysosomes', name: 'Lysosomes', short: 'Lysosomes', color: '#6d9b37',
  job: 'Sacs of digestive enzymes that break down and recycle old parts, food, and germs.',
  more: 'Lysosomes hold enzymes that cut big molecules into small pieces. They digest worn-out parts of the cell, food the cell has taken in, and bacteria caught by white blood cells. The small pieces are reused to build new things. The inside of a lysosome is more acidic than the rest of the cell, which helps its enzymes work.',
  city: { name: 'Recycling center', text: 'A recycling center breaks old things down so the materials can be used again.' },
  fact: 'White blood cells use lysosomes to digest the bacteria they swallow.',
  count: 'Many, often hundreds',
  clue: 'We are sacs of enzymes that break down worn-out parts so they can be recycled.',
  zoom: 100, home: LYSOSOMES[0], label: { text: [104, 348], anchor: 'middle' },
  closeup: {
   view: { x: LYSOSOMES[0][0], y: LYSOSOMES[0][1], w: 50 },
   subs: [
    { id: 'lmem', name: 'Lysosome membrane', at: [LYSOSOMES[0][0] - 11, LYSOSOMES[0][1] - 11], text: 'A membrane that keeps the strong enzymes sealed inside, away from the rest of the cell.' },
    { id: 'enzymes', name: 'Digestive enzymes', at: [LYSOSOMES[0][0] - 7, LYSOSOMES[0][1] + 7], text: 'Proteins that break big molecules into small pieces the cell can reuse.' },
    { id: 'old', name: 'Worn-out part', at: [LYSOSOMES[0][0] + 5, LYSOSOMES[0][1] - 3], text: 'A piece of an old organelle being taken apart for recycling.' }
   ]
  }
 },
 {
  id: 'centrosome', name: 'Centrosome', short: 'Centrosome', color: '#2f8a6e',
  job: "Organizes the cell's tube-shaped fibers and helps the cell divide.",
  more: "The centrosome sits near the nucleus and holds a pair of centrioles set at right angles to each other. Microtubules, the cell's long tubes, grow out from here. When a cell divides, the centrosome is copied, and the two centrosomes help pull the chromosomes apart so that each new cell gets a full set.",
  city: { name: 'Road crew', text: "A crew that lays down the city's main roads, and helps split everything evenly if the city divides in two." },
  fact: 'Each centriole is a ring of 9 small groups of tubes.',
  count: 'One, or two when the cell is getting ready to divide',
  clue: 'I sit near the nucleus with my two centrioles. I help pull chromosomes apart when a cell divides.',
  zoom: 110, home: CENTROSOME, label: { text: [245, 112], anchor: 'middle' },
  closeup: {
   view: { x: CENTROSOME[0] + 2, y: CENTROSOME[1] - 1, w: 60 },
   subs: [
    { id: 'c1', name: 'Centriole', at: [CENTROSOME[0] - 8, CENTROSOME[1]], text: 'A short tube made of smaller tubes. The two centrioles sit at right angles, like the letter L.' },
    { id: 'c2', name: 'Second centriole', at: [CENTROSOME[0] + 9, CENTROSOME[1] - 10], text: 'Before a cell divides, each centriole makes a new partner, so there is a pair for each new cell.' },
    { id: 'mt', name: 'Microtubule', at: [CENTROSOME[0] - 18, CENTROSOME[1] - 16], part: 'cytoskeleton', text: 'A hollow protein tube growing out from the centrosome.' }
   ]
  }
 },
 {
  id: 'cytoskeleton', name: 'Cytoskeleton', short: 'Cytoskeleton', color: '#6f8f9c',
  job: 'A network of protein fibers that gives the cell its shape and helps things move.',
  more: 'Unlike your bones, the cytoskeleton is always being taken apart and rebuilt. Long, hollow microtubules act like tracks that vesicles travel along. Thin actin filaments make a mesh under the membrane that helps the cell hold its shape, change shape, and even crawl. The drawing shows only a few fibers; a real cell is crisscrossed with them.',
  city: { name: 'Frame and rail lines', text: 'The steel frames that hold buildings up, plus the rail lines that trains run on.' },
  fact: 'Your muscles move because protein fibers, including actin, slide past each other inside muscle cells.',
  count: 'A network all through the cell',
  clue: "I'm a web of protein fibers that gives the cell its shape and works as tracks.",
  zoom: 200, home: cellPoint(-1.78, 60), label: { text: [372, 62], anchor: 'middle' },
  closeup: {
   view: { x: cellPoint(-1.78, 26)[0], y: cellPoint(-1.78, 26)[1], w: 80 },
   subs: [
    { id: 'mt', name: 'Microtubule', at: mtNear, text: 'A long, hollow tube. Motor proteins carry vesicles along microtubules like trains on a track.' },
    { id: 'actin', name: 'Actin filaments', at: cellPoint(-1.7, 16), text: 'Thin fibers that form a mesh just under the membrane. They help the cell hold and change its shape.' }
   ]
  }
 },
 {
  id: 'membrane', name: 'Cell membrane', short: 'Cell membrane', color: '#c9643f',
  job: 'A thin, flexible layer around the cell that controls what goes in and out.',
  more: 'The membrane is made of two layers of fat-like molecules, with proteins tucked into it. Small things such as oxygen and carbon dioxide can slip right through. Other things, like sugar, need help from proteins in the membrane that work like doorways. Because it lets some things through and keeps others out, scientists call it selectively permeable.',
  city: { name: 'City border with gates', text: 'Like a border with guarded gates, it decides what comes in and what stays out. Unlike a wall, it is soft and can bend.' },
  fact: 'The membrane is less than 1/10,000 as thick as a sheet of paper.',
  count: 'One, wrapped around the whole cell',
  clue: 'I wrap around the whole cell and decide what can come in or go out.',
  zoom: 150, home: cellPoint(-0.5, 4), label: { text: [788, 84], anchor: 'end' },
  closeup: {
   view: { x: cellPoint(-0.5, 4.5)[0], y: cellPoint(-0.5, 4.5)[1], w: 70 },
   subs: [
    { id: 'bilayer', name: 'Two-layer sheet', at: cellPoint(-0.43, 4.5), text: 'Two layers of fat-like molecules. Their heads face the water inside and outside the cell, and their tails hide in the middle, away from water.' },
    { id: 'channel', name: 'Protein doorway', at: cellPoint(-0.5, 4.5), text: 'Some proteins make tunnels or pumps through the membrane. They let certain things, like some salts, pass when the cell needs them.' },
    { id: 'outside', name: 'Outside the cell', at: cellPoint(-0.54, -15), text: 'The cell sits in a watery fluid. Food molecules and oxygen arrive from the blood through this fluid.' },
    { id: 'inside', name: 'Inside the cell', at: cellPoint(-0.46, 21), part: 'cytoplasm', text: 'The cytoplasm. The membrane keeps it separate from the outside.' }
   ]
  }
 },
 {
  id: 'cytoplasm', name: 'Cytoplasm', short: 'Cytoplasm', color: '#7fbfae',
  job: "The jelly-like filling where the organelles sit and much of the cell's work happens.",
  more: "Cytoplasm is everything inside the membrane except the nucleus. It is mostly water, with salts, sugars, and proteins dissolved in it. It isn't still: materials are always moving through it. Many chemical reactions happen here, including the first steps of breaking down sugar.",
  city: { name: 'City grounds', text: 'The land, air, and streets of the city, where everything is located and everything moves around.' },
  fact: 'Most of the weight of a cell is water.',
  count: 'Fills the whole cell',
  clue: "I'm the jelly-like filling of the cell. All the organelles sit in me.",
  zoom: 220, home: [200, 290], label: { text: [205, 300], anchor: 'middle' }
 }
];

export const partById = Object.fromEntries(parts.map(p => [p.id, p])) as Record<PartId, Part>;
// For use mid-sentence: "the rough ER", but the Golgi keeps its capital.
export const lower = (p: Part) => p.id === 'golgi' ? p.short : p.short[0].toLowerCase() + p.short.slice(1);
