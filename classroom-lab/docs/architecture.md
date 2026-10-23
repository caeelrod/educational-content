# Architecture

The homepage (`src/app/App.tsx`) displays entries declared in `src/registry.ts`. Every lesson exports a React component and owns its instructional materials. Shared components belong in `src/components` only when at least two lessons benefit from them.

## Lesson contract
- `Lesson.tsx`: interactive presentation, usable without accounts, keypress-accessible.
- `lesson.json`: machine-readable brief, review status, standards references, known simplifications.
- `teacher-guide.md`: teacher preparation, learning objectives, discussion prompts, misconceptions, and review approval.
- `registry.ts`: public navigation metadata and lazy or direct component import.

Keep lesson-specific logic inside its own directory. Avoid installing an animation library for a lesson that SVG or CSS can handle. The eventual library may add renderers for printable worksheets, videos, and packaged media without forcing every lesson to use them.
