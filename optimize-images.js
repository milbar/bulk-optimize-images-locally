const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SUPPORTED = ['.jpg', '.jpeg', '.png'];
const CONCURRENCY = 10;

let total = 0;
let done = 0;
let skipped = 0;
let savedBytes = 0;

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
      return;
    }

    if (meta.format === 'jpeg') {
      await image.jpeg({ quality: 80, mozjpeg: true }).toFile(temp);
    } else if (meta.format === 'png') {
      await image.png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(temp);
    } else {
      skipped++;
      return;
    }

    const outputSize = fs.statSync(temp).size;
    fs.copyFileSync(temp, filePath);
    fs.unlinkSync(temp);

    const saved = inputSize - outputSize;
    savedBytes += saved;
    done++;
  } catch {
    skipped++;
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
  const args = process.argv.slice(2);

  let files;
  if (args.length > 0) {
    files = args.map(a => path.resolve(a));
    console.log(`Processing ${files.length} file(s)...`);
  } else {
    console.log('Scanning for images...');
    const dir = __dirname;
    files = findImages(dir);
    console.log(`Found ${files.length} images.`);
  }

  total = files.length;
  console.log(`Optimizing with concurrency ${CONCURRENCY}...`);

  const start = Date.now();
  await runPool(files, optimize, CONCURRENCY);

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\nDone. ${done} optimized, ${skipped} skipped, ${formatBytes(savedBytes)} saved in ${elapsed}s.`);
}

if (require.main === module) {
  main();
}

module.exports = { findImages, optimize, runPool, main };
