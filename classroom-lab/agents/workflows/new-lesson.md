# New lesson workflow (agent prompt)

Read `AGENTS.md`, `docs/content-standards.md`, the section guide in `docs/sections/`, and that section's `curriculum/<section>/scope-and-sequence.md` first.

Using a completed lesson brief, do the following:
1. Confirm the lesson's section, then restate the learning objective and standards evidence; flag any missing references.
2. Propose the best instructional medium and explain why.
3. Create the artifact in a new lesson directory under `src/lessons/<section>/<subject>/<slug>/`, following `docs/architecture.md`.
4. Add machine-readable `lesson.json` and a teacher guide using the template.
5. Add a registry entry with its `section`, marked `demo`.
6. Run `npm run build`, then report what worked, what was not tested, and what requires human review.

Don't change unrelated lessons, silently install packages, invent standards alignment, or mark content reviewed.
