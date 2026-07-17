<p align="center"><img src="docs/logo.svg" alt="optimize-images" width="128"></p>

<h1 align="center">optimize-images</h1>

<p align="center">Bulk lossless image optimization for JPEG and PNG, powered by <a href="https://sharp.pixelplumbing.com/">sharp</a>.</p>

Optimizes images in-place with sensible defaults — no configuration needed.

## Install

```bash
npm install -g @milbareu/optimize-images
```

## Usage

```bash
# Optimize all images in the current directory (recursive)
optimize-images

# Optimize specific files
optimize-images photo1.jpg logo.png ./batch/*.jpg

# Log skipped/error files to a file
optimize-images --logfile errors.log ./photos/

# Custom JPEG quality (1-100, default: 80)
optimize-images --jpeg-quality 90 ./photos/

# Custom PNG compression level (0-9, default: 9)
optimize-images --png-level 6 ./photos/

# Disable mozjpeg / adaptive filtering
optimize-images --no-mozjpeg --no-adaptive-filtering ./photos/
```

### Example output

```
Found 42 images.
Optimizing with concurrency 10...
[42/42] 38 optimized, 4 skipped, 1.2 MB saved in 3.4s.
```

## What it does

| Format | Settings |
|--------|----------|
| JPEG   | Quality 80, mozjpeg enabled |
| PNG    | Compression level 9, adaptive filtering |

- Recursively scans directories for `.jpg`, `.jpeg`, and `.png` files
- Skips unsupported formats silently
- Processes 10 files in parallel
- Writes to a temp file first, then replaces the original (safe)
- Reports progress per 100 files and a final summary

## Programmatic use

```js
const { findImages, optimize, runPool, main } = require('optimize-images');

const files = findImages('/path/to/images');
await runPool(files, optimize, 10);
```

### Exported functions

| Function | Description |
|----------|-------------|
| `findImages(dir)` | Recursively find all supported images in a directory |
| `optimize(filePath)` | Optimize a single image file |
| `runPool(items, fn, limit)` | Run an async function over items with concurrency limit |
| `main()` | CLI entry point — parses `process.argv` and runs the pipeline |

## Requirements

- Node.js 14+
- `sharp` (installed automatically as a dependency)

## Built with opencode

Fully vibecoded with [opencode](https://opencode.ai/go?ref=VXC1CVGCVG) big pickle.

## License

MIT
