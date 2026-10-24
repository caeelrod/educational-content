import type { ComponentType } from 'react';
import type { SectionId } from './sections';
import FractionExplorer from './lessons/grade-school/math/fraction-explorer/Lesson';
import ElevatorDoors from './lessons/grade-school/math/elevator-doors/Lesson';
import DecimalMagnets from './lessons/grade-school/math/decimal-magnets/Lesson';
import WaterCycle from './lessons/grade-school/science/water-cycle/Lesson';
import HumanCell from './lessons/grade-school/science/human-cell/Lesson';
import MusicTheory from './lessons/grade-school/music/music-theory-basics/Lesson';
import Induction from './lessons/college/math/induction/Lesson';
import GeometricSeries from './lessons/college/math/geometric-series/Lesson';

export type Subject = 'math' | 'science' | 'music';
export type Lesson = {
  id: string;
  title: string;
  section: SectionId;
  subject: Subject;
  summary: string;
  durationMinutes: number;
  type: 'interactive' | 'animation' | 'activity';
  standards: string[];
  status: 'demo' | 'reviewed';
  Component: ComponentType;
};

// Lessons live in src/lessons/<section>/<subject>/<slug>/.
// Every lesson must supply matching teacher-guide.md and lesson.json in its directory.
export const lessons: Lesson[] = [
  { id: 'fraction-explorer', title: 'Fraction Explorer', section: 'grade-school', subject: 'math',
    summary: 'See and compare fractions using adjustable models.', durationMinutes: 15,
    type: 'interactive', standards: [], status: 'demo', Component: FractionExplorer },
  { id: 'elevator-doors', title: 'Elevator Doors', section: 'grade-school', subject: 'math',
    summary: 'Find every factor of a number as the elevator doors close in.', durationMinutes: 15,
    type: 'interactive', standards: [], status: 'demo', Component: ElevatorDoors },
  { id: 'decimal-magnets', title: 'Decimal Magnets', section: 'grade-school', subject: 'math',
    summary: 'Slide the button-magnet decimal point to multiply and divide by 10, 100, and 1,000.', durationMinutes: 20,
    type: 'activity', standards: [], status: 'demo', Component: DecimalMagnets },
  { id: 'water-cycle', title: 'The Water Cycle', section: 'grade-school', subject: 'science',
    summary: 'Follow water through evaporation, condensation, and precipitation.',
    durationMinutes: 15, type: 'interactive', standards: [], status: 'demo', Component: WaterCycle },
  { id: 'human-cell', title: 'Inside a Human Cell', section: 'grade-school', subject: 'science',
    summary: 'Zoom into the parts of a cell, follow a protein on its journey, and meet the many kinds of cells in your body.',
    durationMinutes: 30, type: 'interactive', standards: [], status: 'demo', Component: HumanCell },
  { id: 'music-theory-basics', title: 'Music Theory Basics', section: 'grade-school', subject: 'music',
    summary: 'Play a piano to explore pitch, build rhythms from long and short notes, read a real song, and test your eyes and ears.',
    durationMinutes: 35, type: 'interactive', standards: [], status: 'demo', Component: MusicTheory },
  { id: 'induction', title: 'Proof by Induction', section: 'college', subject: 'math',
    summary: 'See why induction is not circular, build three proofs line by line, tile any board with L-shapes, and find the flaw in broken proofs.',
    durationMinutes: 45, type: 'interactive', standards: [], status: 'demo', Component: Induction },
  { id: 'geometric-series', title: 'Geometric Series', section: 'college', subject: 'math',
    summary: 'See why infinitely many terms can add up to a finite number, derive the sum formula, and learn to read any geometric series off its sigma notation.',
    durationMinutes: 45, type: 'interactive', standards: [], status: 'demo', Component: GeometricSeries }
];
