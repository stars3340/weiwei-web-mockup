import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();

function frameIdToStem(frameId) {
  return String(frameId).replace(/:/g, '-');
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function readText(filePath) {
  return fs.readFile(filePath, 'utf8');
}

function parseRemoteFrameSvgs(tsSource) {
  // Matches: '1:33': 'https://...'
  const re = /'(\d+:\d+)'\s*:\s*'([^']+)'/g;
  const out = [];
  for (let m; (m = re.exec(tsSource)); ) out.push([m[1], m[2]]);
  return out;
}

function parseRemoteLogo(tsSource) {
  const m = tsSource.match(/export const WEIWEI_WZX_LOGO_REMOTE\s*=\s*'([^']+)'/);
  return m?.[1] ?? null;
}

async function download(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} ${res.statusText} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const ct = res.headers.get('content-type') ?? '';
  return { buf, contentType: ct };
}

async function main() {
  const frameMapPath = path.join(ROOT, 'src/figma/weiwei-wzx-svgs.ts');
  const logoPath = path.join(ROOT, 'src/figma/weiwei-wzx.ts');
  const outDir = path.join(ROOT, 'public/figma/weiwei-wzx/frames');
  const outLogo = path.join(ROOT, 'public/figma/weiwei-wzx/logo.svg');

  await ensureDir(outDir);

  const frameMapSrc = await readText(frameMapPath);
  const pairs = parseRemoteFrameSvgs(frameMapSrc);
  if (pairs.length === 0) throw new Error(`No frame URLs found in ${frameMapPath}`);

  console.log(`Found ${pairs.length} frame SVG URLs`);

  let ok = 0;
  let skipped = 0;

  for (const [id, url] of pairs) {
    const stem = frameIdToStem(id);
    const outFile = path.join(outDir, `${stem}.svg`);
    try {
      await fs.access(outFile);
      skipped += 1;
      continue;
    } catch {}

    const { buf, contentType } = await download(url);
    if (!contentType.includes('svg')) {
      console.warn(`[warn] ${id} content-type=${contentType} (expected svg)`);
    }
    await fs.writeFile(outFile, buf);
    ok += 1;
    process.stdout.write('.');
  }
  process.stdout.write('\n');

  const logoSrc = await readText(logoPath);
  const logoUrl = parseRemoteLogo(logoSrc);
  if (logoUrl) {
    try {
      await fs.access(outLogo);
      // skip
    } catch {
      await ensureDir(path.dirname(outLogo));
      const { buf, contentType } = await download(logoUrl);
      if (!contentType.includes('svg')) console.warn(`[warn] logo content-type=${contentType} (expected svg)`);
      await fs.writeFile(outLogo, buf);
      console.log('Downloaded logo.svg');
    }
  } else {
    console.warn('[warn] No WEIWEI_WZX_LOGO_REMOTE found; logo not downloaded');
  }

  console.log(`Done. downloaded=${ok}, skipped=${skipped}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

