# Sections

Learning Lab groups lessons into sections. A section serves one audience and level, so the platform can hold grade-school activities and much more advanced material side by side without one set of rules limiting the other.

| Section | Id | Guide |
| --- | --- | --- |
| Grade School | `grade-school` | [grade-school.md](grade-school.md) |
| College | `college` | [college.md](college.md) |

## What a section guide defines
- **Audience and level:** who the lessons are for and what they are assumed to know.
- **Language level:** reading level and how much technical vocabulary is fine.
- **Review authority:** who must approve a lesson before it is marked `reviewed` (a classroom teacher, a course instructor, a subject expert).
- **Curriculum sources:** which standards, syllabi, or references alignments must cite, and how to verify them.
- **Setting and devices:** where and on what the lessons are used.
- **Extra safety or privacy rules:** for example, rules for content used by minors.

The shared rules in `AGENTS.md`, `docs/content-standards.md`, and `agents/policies/` apply to every section. A section guide can add to them but not relax them.

## Adding a section
1. Choose a short id (for example `high-school` or `university`) and add it to `SectionId` and `sections` in `src/sections.ts`.
2. Write `docs/sections/<id>.md` using the headings above, and add it to the table here and in `README.md`.
3. Create `curriculum/<id>/` for its scope and sequence or syllabus map.
4. Put its lessons in `src/lessons/<id>/<subject>/<slug>/` and register them with `section: '<id>'`. Add new subjects to `Subject` in `src/registry.ts` if needed.
