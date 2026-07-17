const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SUPPORTED = ['.jpg', '.jpeg', '.png'];
const CONCURRENCY = 10;

let total = 0;
let done = 0;
let skipped = 0;
let savedBytes = 0;
let logFile = null;
const skippedFiles = [];

const defaults = {
  jpegQuality: 80,
  mozjpeg: true,
  pngLevel: 9,
  adaptiveFiltering: true,
};

let opts = { files: [], ...defaults };

function parseArgs(argv) {
  const result = { files: [], ...defaults, logfile: null };
  const args = argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--logfile' && args[i + 1]) {
      result.logfile = path.resolve(args[++i]);
    } else if (arg === '--jpeg-quality' && args[i + 1]) {
      result.jpegQuality = Math.min(100, Math.max(1, parseInt(args[++i], 10)));
    } else if (arg === '--no-mozjpeg') {
      result.mozjpeg = false;
    } else if (arg === '--png-level' && args[i + 1]) {
      result.pngLevel = Math.min(9, Math.max(0, parseInt(args[++i], 10)));
    } else if (arg === '--no-adaptive-filtering') {
      result.adaptiveFiltering = false;
    } else {
      result.files.push(path.resolve(arg));
    }
  }
  return result;
}

function findImages(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findImages(full));
    } else if (SUPPORTED.includes(path.extname(entry.name).toLowerCase())) {
      results.push(full);
    }
  }
  return results;
}

async function optimize(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  try {
    const inputSize = fs.statSync(filePath).size;
    const temp = filePath + '.optimize-tmp';

    const image = sharp(filePath, { failOn: 'none', limitInputPixels: false });
    const meta = await image.metadata().catch(() => null);

    if (!meta || !meta.format) {
      skipped++;
      skippedFiles.push({ file: filePath, reason: 'unable to read metadata' });
      return;
    }

    if (meta.format === 'jpeg') {
      await image.jpeg({ quality: opts.jpegQuality, mozjpeg: opts.mozjpeg }).toFile(temp);
    } else if (meta.format === 'png') {
      await image.png({ compressionLevel: opts.pngLevel, adaptiveFiltering: opts.adaptiveFiltering }).toFile(temp);
    } else {
      skipped++;
      skippedFiles.push({ file: filePath, reason: `unsupported format: ${meta.format}` });
      return;
    }

    const outputSize = fs.statSync(temp).size;

    if (outputSize >= inputSize) {
      fs.unlinkSync(temp);
      skipped++;
      return;
    }

    fs.unlinkSync(filePath);
    fs.renameSync(temp, filePath);

    const saved = inputSize - outputSize;
    savedBytes += saved;
    done++;
  } catch (err) {
    skipped++;
    skippedFiles.push({ file: filePath, reason: err.message || 'unknown error' });
    const temp = filePath + '.optimize-tmp';
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
  }

  if ((done + skipped) % 100 === 0 || done + skipped === total) {
    process.stdout.write(`\r[${done + skipped}/${total}] ${done} optimized, ${skipped} skipped, ${formatBytes(savedBytes)} saved`);
  }
}

function formatBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(1) + ' MB';
}

async function runPool(items, fn, limit) {
  const queue = [...items];
  const workers = Array.from({ length: limit }, async () => {
    while (queue.length) {
      await fn(queue.shift());
    }
  });
  await Promise.all(workers);
}

async function main() {
  opts = parseArgs(process.argv);
  logFile = opts.logfile;

  let files;
  if (opts.files.length > 0) {
    files = opts.files;
    console.log(`Processing ${files.length} file(s)...`);
  } else {
    console.log('Scanning for images...');
    const dir = process.cwd();
    files = findImages(dir);
    console.log(`Found ${files.length} images.`);
  }

  total = files.length;
  console.log(`Optimizing with concurrency ${CONCURRENCY}...`);

  const start = Date.now();
  await runPool(files, optimize, CONCURRENCY);

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\nDone. ${done} optimized, ${skipped} skipped, ${formatBytes(savedBytes)} saved in ${elapsed}s.`);

  if (logFile && skippedFiles.length > 0) {
    const lines = skippedFiles.map(f => `${f.file}\t${f.reason}`);
    fs.writeFileSync(logFile, lines.join('\n') + '\n');
    console.log(`Skipped files written to ${logFile}`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { findImages, optimize, runPool, main };
