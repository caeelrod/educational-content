# College section

Id: `college` · Lessons: `src/lessons/college/` · Curriculum: `curriculum/college/`

## Audience and level
Undergraduates in first- and second-year mathematics courses: Discrete Mathematics, Calculus I and II, and similar courses taken by math, computer science, engineering, and science majors. Lessons also suit self-study by anyone reviewing these courses later.

The section targets topics students commonly find hard on first contact and easy once they see the right explanation. Each lesson should lead with that explanation: a picture, a mechanism, or an analogy that makes the idea feel inevitable, then connect it to the formal statement the course uses.

Each lesson states its prerequisites in its brief and on its first screen. Assume high-school algebra and whatever earlier courses the lesson names, and nothing else.

## Language level
Adult, college-level reading. Use standard mathematical vocabulary and notation, because students need to recognize it in their textbooks and exams, but define each term the first time it appears and pair formal statements with plain-language readings. Keep the main path focused on the core idea; put deeper or optional material (alternative proofs, generalizations, history) in clearly marked extensions.

## Review authority
A course instructor or subject-matter expert in the lesson's field (for example someone who teaches or has taught the course). A lesson stays `demo` until the reviewer approves its mathematical accuracy and fit for the course, and the approval is recorded in its `teacher-guide.md` with reviewer and date.

## Curriculum sources
- There is no single standards body for undergraduate mathematics. Place each lesson by the courses and topics it supports in `curriculum/college/syllabus-map.md`, not by invented standard codes.
- Cite openly licensed or widely used references for the mathematics, such as OpenStax *Calculus Volume 2* (https://openstax.org/details/books/calculus-volume-2) or Oscar Levin's *Discrete Mathematics: An Open Introduction* (https://discrete.openmathbooks.org/). Name the chapter or section you checked against.
- Leave `standards` empty in `lesson.json` and `registry.ts`. Course placement belongs in the syllabus map and the lesson's teacher guide.

## Setting and devices
Self-study on a laptop or phone, a lecture or recitation projected from an instructor's laptop, and tutoring sessions. Lessons should work on a phone-width screen and on a projector, and should not depend on external assets or network calls.

## Extra safety and privacy rules
- The shared policies apply unchanged: no accounts, no tracking, and no collection of anything that identifies a learner.
- Do not present a lesson as a substitute for a course's own definitions when they differ (for example, whether the naturals start at 0 or 1). Note the convention the lesson uses.
