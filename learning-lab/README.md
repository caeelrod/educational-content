# Learning Lab

A reusable, AI-assisted platform for creating interactive learning materials, organized into sections by level. Its audience is learners and the people who teach them; its contributors may include humans and coding agents.

## Sections
Each section serves one audience and level and sets its own language level, review expectations, and curriculum sources. See `docs/sections/`.

| Section | Audience | Lessons | Guide |
| --- | --- | --- | --- |
| Grade School | Elementary, first built for a Grade 5 classroom | `src/lessons/grade-school/` | `docs/sections/grade-school.md` |

More advanced sections (for example high school or university) can be added alongside it. `docs/sections/README.md` explains how.

## Local development

Requirements: recent Node.js LTS and npm.

```bash
npm install
npm run dev
npm run build
```

## Current lessons
All current lessons are in the Grade School section: Fraction Explorer, Elevator Doors, Decimal Magnets, The Water Cycle, Inside a Human Cell, and Music Theory Basics.

**All are demos, not independently validated curriculum.** Do not assume standards alignment.

## Create a lesson
1. Pick the lesson's section and read its guide in `docs/sections/`.
2. Copy `templates/lesson-brief.md` into a new lesson folder (or into an issue) and complete it.
3. Have your agent read `AGENTS.md` and `docs/content-standards.md`.
4. Add a React `Lesson.tsx`, `lesson.json`, and `teacher-guide.md` under `src/lessons/<section>/<subject>/<slug>/`.
5. Register it in `src/registry.ts` with its `section`.
6. Run `npm run build`, test on mobile, then request review from the section's reviewer (a teacher, instructor, or subject expert).
7. Publish to GitHub Pages after approval.

## Design principles
- Reusable platform, independent lessons grouped into sections, no learner accounts.
- Static-hosted; works on modest hardware such as school Chromebooks, projectors, and phones.
- Expert-reviewed accuracy (by a teacher or subject expert, as the section requires) and explicit treatment of misconceptions.
- Agent-agnostic repository instructions via `AGENTS.md`.

Read `docs/architecture.md`, `docs/content-standards.md`, `docs/publishing.md`, and `docs/sections/`.
