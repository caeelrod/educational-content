# Publishing

1. Push repository to GitHub; create `main` as the default branch.
2. In **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**.
3. The included workflow builds with Vite and deploys `dist/` on pushes to `main`.
4. Share the Pages URL with the section's reviewers and teachers. A project site is usually served at `https://<owner>.github.io/<repository>/` (for this repository, `https://caeelrod.github.io/educational-content/`).
5. Test on the hardware and network the audience will use. Many school and campus networks filter sites or block external assets.

The scaffold uses relative Vite asset paths to support project Pages deployments. GitHub Actions and any third-party dependencies should be periodically updated and reviewed.

## Important
A public GitHub Pages site is not a private LMS; do not publish identifiable learner information, answer keys intended to be secret, or restricted curriculum materials. Host instructor-only documents privately if needed.

Note: The workflow lives at the repository root (`.github/workflows/deploy.yml`) and builds the `learning-lab/` folder. It uses `npm ci` with the committed `package-lock.json` for reproducible builds.
