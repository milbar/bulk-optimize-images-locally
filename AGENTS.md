# AGENTS.md

## What this is

Node.js CLI tool and npm package for bulk lossless JPEG/PNG optimization using `sharp`.

## Prerequisites

```bash
npm install
```

## How to run

```bash
# As a CLI tool (after npm install -g)
optimize-images
optimize-images path/to/img1.jpg path/to/img2.png

# Via npm scripts (from repo root)
npx optimize-images .
```

## Key details

- `sharp` is the only dependency, declared in `package.json`.
- Supported formats: `.jpg`, `.jpeg`, `.png` only. All other extensions are skipped.
- JPEG quality: 80 with mozjpeg. PNG: compression level 9 with adaptive filtering.
- Concurrency: 10 parallel workers (hardcoded constant `CONCURRENCY`).
- Files are optimized in-place (overwrite original after writing temp file).
- Errors on individual files are silently caught and counted as skipped.
- No tests, no lint, no build step — this is a standalone utility script.
- CLI entry point: `bin/optimize-images.js` (shebang, requires `optimize-images.js`).
- Core logic exports `findImages`, `optimize`, `runPool`, `main` for programmatic use.

## Commit conventions

All commits **must** follow [Conventional Commits](https://www.conventionalcommits.org/). The `commit-msg` hook enforces this via `commitlint`.

Examples: `feat: add WebP support`, `fix: handle corrupted JPEG`, `docs: update README`.

## Release workflow

Releases are automated via [release-please](https://github.com/googleapis/release-please-action):

### Stable releases (`master` branch)

1. Push to `master` — release-please opens/updates a release PR with version bump + changelog.
2. Merge the release PR — creates a GitHub Release + tag.
3. The `release.yml` workflow publishes to npm with `--tag latest`.

### Pre-releases (`dev` branch)

1. Push to `dev` — release-please opens/updates a pre-release PR (e.g. `1.1.0-beta.0`).
2. Merge the pre-release PR — creates a GitHub Pre-release + tag.
3. The `release-next.yml` workflow publishes to npm with `--tag next`.

Users install pre-releases with:
```bash
npm install optimize-images@next
```

**Setup required:** Add an `NPM_TOKEN` secret in repo Settings > Secrets > Actions.

## File structure

```
bin/optimize-images.js    CLI entry point (shebang)
optimize-images.js        Core logic
.github/workflows/        CI + release-please + npm publish
.husky/                   Git hooks (commit-msg, pre-commit)
```
