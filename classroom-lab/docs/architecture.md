# Architecture

The homepage (`src/app/App.tsx`) lists the sections declared in `src/sections.ts`. Choosing a section shows its lessons from `src/registry.ts`, filtered by subject.

## Sections
A section groups lessons for one audience and level (for example Grade School today, and later more advanced levels). Each section has:
- an entry in `src/sections.ts` (title, audience, summary, review note shown under each lesson);
- a lesson folder at `src/lessons/<section>/`;
- a guide at `docs/sections/<section>.md` covering audience, language level, review authority, and curriculum sources;
- a curriculum folder at `curriculum/<section>/` for scope-and-sequence and standards crosswalks.

Subjects are shared across sections. Add a new value to `Subject` in `src/registry.ts` when a section needs one.

Lessons are otherwise independent: Every lesson exports a React component and owns its instructional materials. Shared components belong in `src/components` only when at least two lessons benefit from them.

## Lesson contract
Every lesson lives at `src/lessons/<section>/<subject>/<slug>/`.
- `Lesson.tsx`: interactive presentation, usable without accounts, keypress-accessible.
- `lesson.json`: machine-readable brief, `section`, review status, standards references, known simplifications.
- `teacher-guide.md`: preparation for whoever teaches or facilitates (teacher, instructor, or tutor), learning objectives, discussion prompts, misconceptions, and review approval.
- `registry.ts`: public navigation metadata including `section`, and lazy or direct component import.

Keep lesson-specific logic inside its own directory. Avoid installing an animation library for a lesson that SVG or CSS can handle. The eventual library may add renderers for printable worksheets, videos, and packaged media without forcing every lesson to use them.
