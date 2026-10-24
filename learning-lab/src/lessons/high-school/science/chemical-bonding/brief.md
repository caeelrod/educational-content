# Lesson brief: The Periodic Table and Chemical Bonding

- Section / subject / level: High School / Science / Chemistry, written for grades 10 to 11 (also fits a physical science course that covers bonding). Teacher to confirm placement.
- Student learning objective (observable): The student reads the number of valence electrons for a main-group element from its group; uses position on the table to predict which of two atoms is larger, has the higher first ionization energy, or is more electronegative, and explains why in terms of protons and shells; shows how electrons move or are shared to give each atom a full outer shell; writes the formula of a simple binary ionic compound from ion charges; and classifies a bond as nonpolar covalent, polar covalent, or ionic.
- Topic / motivating question: Why do atoms bond at all, and how can the position of two elements on the periodic table tell you what kind of bond they will form?
- Standards: TBD. The teacher must confirm the school's adopted high-school chemistry or physical science standards and adoption year (see `docs/sections/high-school.md`). For reference only, not as an alignment claim: NGSS HS-PS1-1 ("Use the periodic table as a model to predict the relative properties of elements based on the patterns of electrons in the outermost energy level of atoms") covers similar ground.
- Lesson type: Interactive (browser), six parts meant to be done in order:
  1. **Read the table:** a clickable periodic table (all 118 elements, or main groups only) with a shell model, electrons per shell, valence electrons, Lewis symbol, and the ion each element tends to form. A pattern check asks for valence electrons from the group alone, with feedback for the two usual slips (answering the period, counting groups 13 to 18 as 1 to 6).
  2. **Spot the patterns:** the main-group table colored by atomic radius, first ionization energy, or electronegativity with real values, and a nine-question predict-then-check round. Two rounds are genuine exceptions (N vs O and Be vs B ionization energy), so the data sometimes disagree with the trend and the lesson explains why.
  3. **Ionic bonds:** pick a metal and a nonmetal, predict the formula, then move electrons one at a time from metal atoms to nonmetal atoms, adding atoms until every atom has a full shell and the charges cancel. Eight pairs from NaCl to Al₂O₃ and Mg₃N₂.
  4. **Covalent bonds:** eleven molecules (H₂ to C₂H₄) start unbonded with their valence electrons drawn. Students set each bond to none, single, double, or triple; unpaired electrons point at possible partners, lone pairs are drawn automatically, and a table counts electrons around every atom. Optional δ+/δ− labels.
  5. **Polar or ionic?** choose any two main-group elements and see the bonding pair shift in a tug of war, with the electronegativity difference placed on a nonpolar / polar / ionic scale. The two rules of thumb (difference cutoffs; metal + nonmetal) are compared, including pairs where they disagree (LiI, SiF₄) and metal–metal pairs.
  6. **Practice:** a round of eight randomly generated questions, one per skill, with feedback aimed at the specific slip.
- Target duration: About 50 minutes for all six; parts 1 and 2 work as one 20-minute periodic-table lesson, and parts 3 to 5 as a 25-minute bonding lesson. Part 6 alone takes about 10 minutes.
- Setting: Whole-class projection, individual or partner work on Chromebooks, tablets, or phones, and homework review.
- Prior knowledge: Atoms have a nucleus of protons and neutrons with electrons around it; atomic number = number of protons; a neutral atom has as many electrons as protons.
- Key misconceptions:
  - Atoms get bigger across a period because they have more electrons.
  - The number of valence electrons equals the period number, or the group number for groups 13 to 18.
  - Metals gain electrons and nonmetals lose them; ion charges have the wrong sign.
  - Ionic formulas are written 1:1, or with the subscripts swapped.
  - Ionic compounds are made of separate molecules (one Na paired with one Cl).
  - Every bond is either "fully ionic" or "fully covalent," with nothing in between.
  - Trends are laws with no exceptions.
  - The shell model shows electrons orbiting in circles.
- Student actions and feedback: Click elements and read the shell model; answer pattern checks; predict then check trend pairs; predict formulas and build them electron by electron with messages for every wrong move (a full shell, an empty metal, too few atoms); set bond orders with per-atom feedback (short of 8, over 8, too many bonds for hydrogen); compare pairs of elements on the electronegativity scale; answer a mixed practice round.
- Formative assessment / evidence of learning: Pattern-check score (part 1), trend round score (part 2), formula prediction vs result (part 3), completed Lewis structures (part 4), practice round score with a review list (part 6). Nothing is stored.
- Accessibility / device constraints: Every control is a native button, select, or checkbox with an accessible name. The periodic table keeps one cell in the tab order and moves with the arrow keys (Home and End jump to the ends). Drawings have text descriptions (`role="img"` with labels), and feedback uses polite live regions. Colors are paired with text values and labels. The table switches to a main-groups view on narrow screens and scrolls inside its own box when the full table is chosen. The only animation (the bonding pair sliding) turns off under reduced motion.
- Reliable educational sources:
  - OpenStax, *Chemistry 2e*, Section 6.5 (Periodic Variations in Element Properties) and Sections 7.1 to 7.3 (Ionic Bonding; Covalent Bonding, including the electronegativity-difference guide and its exceptions; Lewis Symbols and Structures). https://openstax.org/details/books/chemistry-2e
  - Chemistry LibreTexts Reference Tables A2 (Pauling electronegativities), A3 (covalent radii; single-bond values from Cordero et al., *Dalton Trans.* 2008, 2832–2838), and A6 (first ionization energies).
  - All drawings are original SVG. No textbook images or question banks were copied.
- Known simplifications and limitations: See `lesson.json` `modelLimitations`.
- Reviewer sign-off needed: Yes, a high-school chemistry teacher. Check the accuracy of the explanations (especially the exception explanations in part 2 and the ionic/covalent rules of thumb in part 5), the reading level, and fit with the course's pacing and standards.
