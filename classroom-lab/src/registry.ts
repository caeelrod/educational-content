import type { ComponentType } from 'react';
import FractionExplorer from './lessons/math/fraction-explorer/Lesson';
import WaterCycle from './lessons/science/water-cycle/Lesson';

export type Subject = 'math' | 'science';
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
  { id: 'water-cycle', title: 'The Water Cycle', subject: 'science',
    summary: 'Follow water through evaporation, condensation, and precipitation.',
    durationMinutes: 15, type: 'interactive', standards: [], status: 'demo', Component: WaterCycle }
];
