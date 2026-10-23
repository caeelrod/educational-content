# Classroom Lab

A reusable, AI-assisted platform for creating interactive fifth-grade science and math materials. Its audience is students and teachers; its contributors may include humans and coding agents.

## Local development

Requirements: recent Node.js LTS and npm.

```bash
npm install
npm run dev
npm run build
```

## Current examples
- **Fraction Explorer** — adjustable fraction bars.
- **The Water Cycle** — step-through simplified water cycle illustration.

**Both are demos, not independently validated curriculum.** Do not assume standards alignment.

## Create a lesson
1. Copy `templates/lesson-brief.md` into a new lesson folder (or into an issue) and complete it.
2. Have your agent read `AGENTS.md` and `docs/content-standards.md`.
3. Add a React `Lesson.tsx`, `lesson.json`, and `teacher-guide.md` under `src/lessons/<subject>/<slug>/`.
4. Register it in `src/registry.ts`.
5. Run `npm run build`, test on mobile, then request teacher review.
6. Publish to GitHub Pages after approval.

## Design principles
- Reusable platform, independent lessons, no student accounts.
- Static-hosted; accessible on school Chromebooks and projectors.
- Teacher-reviewed accuracy and explicit treatment of misconceptions.
- Agent-agnostic repository instructions via `AGENTS.md`.

Read `docs/architecture.md`, `docs/content-standards.md`, `docs/publishing.md`.
