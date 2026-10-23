# AI Agent Operating Instructions

You are contributing to Classroom Lab, a library of fifth-grade science and math learning experiences.

## Mission
Produce accurate, engaging, accessible, teacher-controlled educational material. Favor student discovery over passive exposition.

## Required workflow
1. Read `README.md`, `docs/content-standards.md`, `docs/architecture.md`, and `curriculum/scope-and-sequence.md`.
2. For new work, create a brief from `templates/lesson-brief.md`; identify learning goal, misconceptions, format, and evidence of understanding.
3. Identify authoritative references and verify standards against the configured jurisdiction and adoption year. Never invent standard codes.
4. Choose the simplest suitable medium. Prefer a standalone browser interaction; don't introduce new dependencies without explaining why.
5. Implement the artifact inside `src/lessons/<subject>/<slug>/` with accompanying `lesson.json` and `teacher-guide.md`.
6. Register the lesson in `src/registry.ts`. Mark `status: 'demo'` until teacher-reviewed.
7. Run `npm run build`. Check usability at narrow and wide screen widths and test keyboard operation.
8. In the PR description report: objective, educational sources, assumptions, testing, and limitations.

## Non-negotiable rules
- Grade-appropriate explanations; no fabricated facts, citations, standards, or measurements.
- Avoid misleading science models. Label simplifications and distinguish models from literal reality.
- No personally identifiable student information or external trackers; no accounts, ads, or API keys in client code.
- No student-facing generative AI chat, external network calls, or remote services without explicit approval.
- Support keyboard use, accessible labels, readable contrast, reduced motion where relevant.
- Interactions must provide meaningful feedback and clear instructions.
- Do not silently change shared components or unrelated lessons.
- No copyrighted textbook images or copied question banks without permission.
- Never claim a lesson is approved, standards-aligned, or classroom-ready until evidence and human review are recorded.

## Publication gate
`demo` means illustrative/under review; `reviewed` requires teacher approval of educational accuracy and usage context. Approval must be recorded in the relevant teacher guide with reviewer and date before changing status.
