// Element facts used throughout the lesson.
// Every element gets its symbol, name, and table position. Only the main-group elements of
// periods 1 to 5 carry measured data; the lesson's counting rules are written for them.
//
// Data sources (checked October 2026):
// - Electronegativity: Pauling scale, Chemistry LibreTexts Reference Table A2 "Electronegativity Values".
// - Atomic radius: single-bond covalent radius in pm from Cordero et al., "Covalent radii revisited",
//   Dalton Trans. 2008, 2832-2838, as listed in Chemistry LibreTexts Reference Table A3 "Covalent Radii".
// - First ionization energy in kJ/mol: Chemistry LibreTexts Reference Table A6 "Atomic Ionization Energies".

const SYMBOLS = 'H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og'.split(' ');
const NAMES = 'Hydrogen Helium Lithium Beryllium Boron Carbon Nitrogen Oxygen Fluorine Neon Sodium Magnesium Aluminum Silicon Phosphorus Sulfur Chlorine Argon Potassium Calcium Scandium Titanium Vanadium Chromium Manganese Iron Cobalt Nickel Copper Zinc Gallium Germanium Arsenic Selenium Bromine Krypton Rubidium Strontium Yttrium Zirconium Niobium Molybdenum Technetium Ruthenium Rhodium Palladium Silver Cadmium Indium Tin Antimony Tellurium Iodine Xenon Cesium Barium Lanthanum Cerium Praseodymium Neodymium Promethium Samarium Europium Gadolinium Terbium Dysprosium Holmium Erbium Thulium Ytterbium Lutetium Hafnium Tantalum Tungsten Rhenium Osmium Iridium Platinum Gold Mercury Thallium Lead Bismuth Polonium Astatine Radon Francium Radium Actinium Thorium Protactinium Uranium Neptunium Plutonium Americium Curium Berkelium Californium Einsteinium Fermium Mendelevium Nobelium Lawrencium Rutherfordium Dubnium Seaborgium Bohrium Hassium Meitnerium Darmstadtium Roentgenium Copernicium Nihonium Flerovium Moscovium Livermorium Tennessine Oganesson'.split(' ');

// [electronegativity (null = no Pauling value), covalent radius pm, first ionization energy kJ/mol]
const DATA: Record<string, [number | null, number, number]> = {
 H: [2.20, 31, 1312], He: [null, 28, 2372.3],
 Li: [0.98, 128, 520.2], Be: [1.57, 96, 899.5], B: [2.04, 84, 800.6], C: [2.55, 76, 1086.5], N: [3.04, 71, 1402.3], O: [3.44, 66, 1313.9], F: [3.98, 57, 1681.0], Ne: [null, 58, 2080.7],
 Na: [0.93, 166, 495.8], Mg: [1.31, 141, 737.7], Al: [1.61, 121, 577.5], Si: [1.90, 111, 786.5], P: [2.19, 107, 1011.8], S: [2.58, 105, 999.6], Cl: [3.16, 102, 1251.2], Ar: [null, 106, 1520.6],
 K: [0.82, 203, 418.8], Ca: [1.00, 176, 589.8], Ga: [1.81, 122, 578.8], Ge: [2.01, 120, 762], As: [2.18, 119, 947.0], Se: [2.55, 120, 941.0], Br: [2.96, 120, 1139.9], Kr: [3.00, 116, 1350.8],
 Rb: [0.82, 220, 403.0], Sr: [0.95, 195, 549.5], In: [1.78, 142, 558.3], Sn: [1.96, 139, 708.6], Sb: [2.05, 139, 834], Te: [2.10, 138, 869.3], I: [2.66, 139, 1008.4], Xe: [2.60, 140, 1170.4]
};

const METALLOIDS = new Set(['B', 'Si', 'Ge', 'As', 'Sb', 'Te']);
const NONMETALS = new Set(['H', 'C', 'N', 'O', 'F', 'P', 'S', 'Cl', 'Se', 'Br', 'I']);

export type Kind = 'metal' | 'metalloid' | 'nonmetal' | 'noble';
export type Block = 'main' | 'transition' | 'lanthanide' | 'actinide';
export type Element = {
 z: number; sym: string; name: string;
 period: number; group: number | null; // group is null for the lanthanides and actinides
 row: number; col: number;              // position in the full 18-column table (rows 9 and 10 hold the f-block)
 block: Block;
 data: { en: number | null; radius: number; ie: number } | null; // main-group, periods 1 to 5 only
};

function place(z: number): Pick<Element, 'period' | 'group' | 'row' | 'col' | 'block'> {
 const starts = [1, 3, 11, 19, 37, 55, 87, 119];
 const period = starts.findIndex(s => s > z);
 const k = z - starts[period - 1]; // 0-based position within the period
 if (period === 1) { const group = z === 1 ? 1 : 18; return { period, group, row: 1, col: group, block: 'main' }; }
 if (period <= 3) { const group = k < 2 ? k + 1 : k + 11; return { period, group, row: period, col: group, block: 'main' }; }
 if (period <= 5) { const group = k + 1; return { period, group, row: period, col: group, block: group >= 3 && group <= 12 ? 'transition' : 'main' }; }
 // Periods 6 and 7: two s-block elements, fifteen f-block elements shown below the table, then groups 4 to 18.
 if (k < 2) return { period, group: k + 1, row: period, col: k + 1, block: 'main' };
 if (k < 17) return { period, group: null, row: period + 3, col: k + 1, block: period === 6 ? 'lanthanide' : 'actinide' };
 const group = k - 13;
 return { period, group, row: period, col: group, block: group <= 12 ? 'transition' : 'main' };
}

export const elements: Element[] = SYMBOLS.map((sym, i) => {
 const z = i + 1, d = DATA[sym];
 return { z, sym, name: NAMES[i], ...place(z), data: d ? { en: d[0], radius: d[1], ie: d[2] } : null };
});
export const bySym = (s: string) => elements.find(e => e.sym === s)!;
export const byZ = (z: number) => elements[z - 1];
/** The main-group elements of periods 1 to 5: the ones with data. */
export const mainGroup = elements.filter(e => e.data);

export function kind(e: Element): Kind | null {
 if (!e.data) return null;
 if (e.group === 18) return 'noble';
 if (METALLOIDS.has(e.sym)) return 'metalloid';
 return NONMETALS.has(e.sym) ? 'nonmetal' : 'metal';
}
export const kindLabel: Record<Kind, string> = { metal: 'Metal', metalloid: 'Metalloid', nonmetal: 'Nonmetal', noble: 'Noble gas' };

/** Valence (outer-shell) electrons for a main-group element. */
export function valence(e: Element) {
 if (e.sym === 'He') return 2;
 return e.group! <= 2 ? e.group! : e.group! - 10;
}

/** Electrons per shell (n = 1, 2, 3, ...) for the main-group elements of periods 1 to 5. */
export function shells(e: Element): number[] {
 const inner: Record<number, number[]> = { 1: [], 2: [2], 3: [2, 8], 4: e.group! <= 2 ? [2, 8, 8] : [2, 8, 18], 5: e.group! <= 2 ? [2, 8, 18, 8] : [2, 8, 18, 18] };
 const before = inner[e.period];
 return [...before, e.z - before.reduce((s, n) => s + n, 0)];
}

/** The simple ion the octet rule predicts, or null when the element usually shares electrons instead. */
export function ionCharge(e: Element): number | null {
 if (e.sym === 'H' || !e.group) return null;
 if (e.group === 1 || e.group === 2) return e.group;
 if (['Al', 'Ga', 'In'].includes(e.sym)) return 3;
 if (['N', 'P'].includes(e.sym)) return -3;
 if (['O', 'S', 'Se', 'Te'].includes(e.sym)) return -2;
 if (e.group === 17) return -1;
 return null;
}

export const noble: Record<number, string> = { 1: 'He', 2: 'Ne', 3: 'Ar', 4: 'Kr', 5: 'Xe' };
/**
 * The noble gas whose electron arrangement an ion of this element matches. Ga³⁺ and In³⁺ keep a
 * filled shell of 18 underneath instead, which is not a noble-gas arrangement, so they get null.
 */
export function ionMatches(e: Element) {
 const c = ionCharge(e);
 if (c === null || e.sym === 'Ga' || e.sym === 'In') return null;
 return c > 0 ? noble[e.period - 1] : noble[e.period];
}

/** An ion's charge as plain text ("2+"), for drawings that position it themselves. */
export const charge = (c: number) => c === 0 ? '' : `${Math.abs(c) === 1 ? '' : Math.abs(c)}${c > 0 ? '+' : '−'}`;
/** An ion's charge in superscript characters ("²⁺"), for running text such as "Mg²⁺". */
export const superscript = (c: number) => [...charge(c)].map(ch => ({ '1': '¹', '2': '²', '3': '³', '+': '⁺', '−': '⁻' } as Record<string, string>)[ch] ?? ch).join('');
export const anionName: Record<string, string> = { N: 'nitride', P: 'phosphide', O: 'oxide', S: 'sulfide', Se: 'selenide', F: 'fluoride', Cl: 'chloride', Br: 'bromide', I: 'iodide' };

export type Property = 'radius' | 'ie' | 'en';
export const properties: Record<Property, { label: string; short: string; unit: string; get: (e: Element) => number | null }> = {
 radius: { label: 'Atomic radius', short: 'Radius', unit: 'pm', get: e => e.data && e.group !== 18 ? e.data.radius : null },
 ie: { label: 'First ionization energy', short: 'Ionization energy', unit: 'kJ/mol', get: e => e.data ? e.data.ie : null },
 en: { label: 'Electronegativity', short: 'Electronegativity', unit: '', get: e => e.data ? e.data.en : null }
};
export const fmt = (p: Property, v: number) => p === 'en' ? v.toFixed(2) : p === 'ie' ? Math.round(v).toLocaleString('en-US') : String(v);

/** Where an element sits, in words: "Group 17, period 3". */
export const where = (e: Element) => e.group ? `Group ${e.group}, period ${e.period}` : `${e.block === 'lanthanide' ? 'Lanthanide' : 'Actinide'}, period ${e.period}`;
