import type { ComponentType } from 'react';
import FractionExplorer from './lessons/math/fraction-explorer/Lesson';
import ElevatorDoors from './lessons/math/elevator-doors/Lesson';
import DecimalMagnets from './lessons/math/decimal-magnets/Lesson';
import WaterCycle from './lessons/science/water-cycle/Lesson';
import HumanCell from './lessons/science/human-cell/Lesson';
import MusicTheory from './lessons/music/music-theory-basics/Lesson';

export type Subject = 'math' | 'science' | 'music';
export type Lesson = {
  id: string;
  title: string;
  subject: Subject;
  summary: string;
  durationMinutes: number;
  type: 'interactive' | 'animation' | 'activity';
  standards: string[];
  status: 'demo' | 'reviewed';
  Component: ComponentType;
};

// Every lesson must supply matching teacher-guide.md and lesson.json in its directory.
export const lessons: Lesson[] = [
  { id: 'fraction-explorer', title: 'Fraction Explorer', subject: 'math',
    summary: 'See and compare fractions using adjustable models.', durationMinutes: 15,
    type: 'interactive', standards: [], status: 'demo', Component: FractionExplorer },
  { id: 'elevator-doors', title: 'Elevator Doors', subject: 'math',
    summary: 'Find every factor of a number as the elevator doors close in.', durationMinutes: 15,
    type: 'interactive', standards: [], status: 'demo', Component: ElevatorDoors },
  { id: 'decimal-magnets', title: 'Decimal Magnets', subject: 'math',
    summary: 'Slide the button-magnet decimal point to multiply and divide by 10, 100, and 1,000.', durationMinutes: 20,
    type: 'activity', standards: [], status: 'demo', Component: DecimalMagnets },
  { id: 'water-cycle', title: 'The Water Cycle', subject: 'science',
    summary: 'Follow water through evaporation, condensation, and precipitation.',
    durationMinutes: 15, type: 'interactive', standards: [], status: 'demo', Component: WaterCycle },
  { id: 'human-cell', title: 'Inside a Human Cell', subject: 'science',
    summary: 'Zoom into the parts of a cell, follow a protein on its journey, and meet the many kinds of cells in your body.',
    durationMinutes: 30, type: 'interactive', standards: [], status: 'demo', Component: HumanCell },
  { id: 'music-theory-basics', title: 'Music Theory Basics', subject: 'music',
    summary: 'Play a piano to explore pitch, build rhythms from long and short notes, read a real song, and test your eyes and ears.',
    durationMinutes: 35, type: 'interactive', standards: [], status: 'demo', Component: MusicTheory }
];
