// A section groups lessons for one audience and level. Each section sets its own
// language level, review expectations, and curriculum sources (see docs/sections/).
// Add more advanced sections here (for example 'high-school' or 'university') as content arrives.
export type SectionId = 'grade-school';
export type Section = {
  id: SectionId;
  title: string;
  audience: string;
  summary: string;
  icon: string;
  reviewNote: string;
};

export const sections: Section[] = [
  { id: 'grade-school', title: 'Grade School', audience: 'Elementary · first built for Grade 5', icon: '✏',
    summary: 'Hands-on science, math, and music activities built around a fifth-grade classroom.',
    reviewNote: 'Teacher note: Demo content. Review accuracy, age appropriateness, and alignment before classroom use.' }
];
