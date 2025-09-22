# Repository Guidelines

The repository is currently a bare scaffold containing only the project README; follow the conventions below as you add the actual typing trainer codebase.

## Project Structure & Module Organization

- Expand the root with these standard folders: for application modules, for automated suites, for keyboard layouts or media, for reference material, and for repeatable tooling.
- Organize by feature (for example, and ) instead of large technology-based buckets.
- Keep configuration versioned: for lesson metadata, for environment variables (never commit real secrets), and archive any experiments under .

## Build, Test, and Development Commands

- Use Node 18+ with npm or pnpm; commit dependency manifests alongside lockfiles.
- Maintain the following scripts in as the canonical entry points:
  - added 2 packages, changed 12 packages, and audited 170 packages in 2s

53 packages are looking for funding
run `npm fund` for details

found 0 vulnerabilities restores dependencies.

- starts the local playground with hot reload.
- creates production-ready bundles; fail on lint or test errors.
- executes the full automated suite (CI should call this command).
- Wrap non-JavaScript tasks (Rust, Python, etc.) behind shims so contributors share the same interface.

## Coding Style & Naming Conventions

- Prefer TypeScript with mode; use two-space indentation and keep lines under 100 characters.
- Run Prettier and ESLint () before committing; never mix formatter noise with functional changes.
- Name components in PascalCase, utility modules in camelCase, constants in SCREAMING_SNAKE_CASE, and test files as .

## Testing Guidelines

- Adopt Vitest or Jest for unit tests; colocate fast specs with implementation and keep broader integration flows in .
- Add at least one regression test per bug fix and ensure snapshots are reviewed.
- Target 80%+ branch coverage; publish the coverage report via .

## Commit & Pull Request Guidelines

- Follow the existing imperative tone (); keep subject lines ≤50 characters and wrap body text at 72.
- Reference issues with when applicable and list the manual/automated checks you ran.
- Pull requests must include a clear summary, screenshots or GIFs for UI-visible changes, and call out follow-up work before requesting review.

## Security & Configuration Tips

- Store secrets only in and share placeholder values through .
- Run found 0 vulnerabilities (or ) quarterly and log findings in .
