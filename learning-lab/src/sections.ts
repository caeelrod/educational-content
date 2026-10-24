// A section groups lessons for one audience and level. Each section sets its own
// language level, review expectations, and curriculum sources (see docs/sections/).
// Add more sections here as content arrives.
export type SectionId = 'grade-school' | 'middle-school' | 'high-school' | 'college';
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
    reviewNote: 'Teacher note: Demo content. Review accuracy, age appropriateness, and alignment before classroom use.' },
  { id: 'middle-school', title: 'Middle School', audience: 'Grades 6 to 8', icon: '◆',
    summary: 'Lessons for grades 6 to 8 that move from hands-on exploring toward evidence, models, and reasoning.',
    reviewNote: 'Teacher note: Demo content. Have a middle-school teacher of the subject review accuracy, age appropriateness, and alignment before classroom use.' },
  { id: 'high-school', title: 'High School', audience: 'Grades 9 to 12 · first courses in each subject', icon: '⚛',
    summary: 'Simulations and models for the big ideas of high-school courses, with room to test predictions against evidence.',
    reviewNote: 'Teacher note: Demo content. Have a high-school teacher of the subject check accuracy, level, and alignment before classroom use.' },
  { id: 'college', title: 'College', audience: 'Undergraduate · first-year and second-year math', icon: '∑',
    summary: 'The college topics that click once they are explained well, built to be explored rather than memorized.',
    reviewNote: 'Instructor note: Demo content. Have a course instructor or subject expert check accuracy and fit before assigning it.' }
];
