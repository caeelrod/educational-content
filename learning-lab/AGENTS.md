# AI Agent Operating Instructions

You are contributing to Learning Lab, a library of interactive learning experiences organized into sections by level (see `docs/sections/`). The first section is Grade School; more advanced sections will follow.

## Mission
Produce accurate, engaging, accessible educational material that stays under the control of the people who teach it. Favor student discovery over passive exposition.

## Required workflow
1. Identify the lesson's section. Read `README.md`, `docs/content-standards.md`, `docs/architecture.md`, the section guide in `docs/sections/`, and that section's curriculum folder (for example `curriculum/grade-school/`).
2. For new work, create a brief from `templates/lesson-brief.md`; identify learning goal, misconceptions, format, and evidence of understanding.
3. Identify authoritative references and verify standards or syllabus references against the sources named in the section guide (for example a jurisdiction and adoption year). Never invent standard codes.
4. Choose the simplest suitable medium. Prefer a standalone browser interaction; don't introduce new dependencies without explaining why.
5. Implement the artifact inside `src/lessons/<section>/<subject>/<slug>/` with accompanying `lesson.json` and `teacher-guide.md`.
6. Register the lesson in `src/registry.ts` with its `section`. Mark `status: 'demo'` until reviewed by the section's reviewer.
7. Run `npm run build`. Check usability at narrow and wide screen widths and test keyboard operation.
8. In the PR description report: objective, educational sources, assumptions, testing, and limitations.

## Non-negotiable rules
- Explanations pitched at the level and audience of the lesson's section; no fabricated facts, citations, standards, or measurements.
- Avoid misleading science models. Label simplifications and distinguish models from literal reality.
- No personally identifiable learner information or external trackers; no accounts, ads, or API keys in client code.
- No learner-facing generative AI chat, external network calls, or remote services without explicit approval.
- Support keyboard use, accessible labels, readable contrast, reduced motion where relevant.
- Interactions must provide meaningful feedback and clear instructions.
- Do not silently change shared components or unrelated lessons.
- No copyrighted textbook images or copied question banks without permission.
- Never claim a lesson is approved, standards-aligned, or classroom-ready until evidence and human review are recorded.

## Publication gate
`demo` means illustrative/under review; `reviewed` requires approval of educational accuracy and usage context by the reviewer the section guide names (a teacher, instructor, or subject expert). Approval must be recorded in the lesson's `teacher-guide.md` with reviewer and date before changing status.
