import fs from 'fs/promises';
import path from 'path';

const MODEL_BASE = process.env.FACE_MODELS_DOWNLOAD_BASE || 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
const OUT_DIR = process.env.FACE_MODELS_PATH || path.join(process.cwd(), 'models', 'face');

const manifests = [
  'ssd_mobilenetv1_model-weights_manifest.json',
  'face_landmark_68_model-weights_manifest.json',
  'face_recognition_model-weights_manifest.json'
];

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function download(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.arrayBuffer();
}

async function save(filePath, arrayBuffer) {
  await fs.writeFile(filePath, Buffer.from(arrayBuffer));
}

async function main() {
  try {
    console.log('Downloading face-api.js models to', OUT_DIR);
    await ensureDir(OUT_DIR);

    for (const manifest of manifests) {
      const manifestUrl = `${MODEL_BASE}/${manifest}`;
      console.log('Fetching manifest', manifestUrl);
      const manifestBuf = await download(manifestUrl);
      const manifestJson = JSON.parse(Buffer.from(manifestBuf).toString('utf8'));
      const manifestPath = path.join(OUT_DIR, manifest);
      await save(manifestPath, manifestBuf);

      // manifestJson is an array, each entry has 'weights' array with 'paths'
      for (const entry of manifestJson) {
        for (const w of entry.weights || []) {
          for (const p of w.paths || []) {
            const binUrl = `${MODEL_BASE}/${p}`;
            const outPath = path.join(OUT_DIR, p);
            const outDir = path.dirname(outPath);
            await ensureDir(outDir);
            console.log('Downloading', binUrl);
            const binBuf = await download(binUrl);
            await save(outPath, binBuf);
          }
        }
      }
    }

    console.log('All model files downloaded to', OUT_DIR);
  } catch (err) {
    console.error('Failed to download models:', err.message || err);
    console.error('You can set FACE_MODELS_PATH to point to a local models folder or place model files manually.');
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('download-face-models.js')) {
  main();
}
