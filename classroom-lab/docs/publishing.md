# Publishing

1. Push repository to GitHub; create `main` as the default branch.
2. In **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**.
3. The included workflow builds with Vite and deploys `dist/` on pushes to `main`.
4. Share the Pages URL with the teacher. A repository named `classroom-lab` is usually served at `https://<owner>.github.io/classroom-lab/`.
5. Test on classroom hardware/network. Many school networks filter sites or block external assets.

The scaffold uses relative Vite asset paths to support project Pages deployments. GitHub Actions and any third-party dependencies should be periodically updated and reviewed.

## Important
A public GitHub Pages site is not a private LMS; do not publish identifiable student information, answer keys intended to be secret, or restricted curriculum materials. Host teacher-only documents privately if needed.

Note: This starter archive does not include a dependency lockfile. After the first successful local `npm install`, commit `package-lock.json` and switch CI back to `npm ci` for reproducible builds.
