import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();

function frameIdToStem(frameId) {
  return String(frameId).replace(/:/g, '-');
}

// Extra UI assets (SVG/PNG) exported from Figma nodes via MCP.
// These are remote render URLs; runtime should use only local files.
const EXTRA_ASSETS = [
  // Pills / nav
  { out: 'public/figma/weiwei-wzx/ui/pills/status_pill.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/11397459-9b1d-4474-be37-37aefc0221d5', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/pills/top_pill.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/c25054d6-1387-46b7-9822-c43746b31a32', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/pills/avatar_badge.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/0268680f-7af0-4454-9064-ce1be34925ea', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/nav/bottom_home.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/0bc9416c-f91a-42e5-b333-104fc032d661', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/nav/bottom_trends.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/8733bcdf-da55-4218-8fe1-cd1d4a24fd1a', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/nav/bottom_guard.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/f3dd03d5-5c8b-4c5a-b319-2c8f92f9bc27', kind: 'svg' },

  // Bubbles
  { out: 'public/figma/weiwei-wzx/ui/bubbles/home_question.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/e29e0b2d-1b1b-4436-88b2-7ef196ed9387', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/bubbles/feeling_tip.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/890d5f02-6724-423b-96dd-0daadb0698eb', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/bubbles/breathing_tip.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/1236b0d2-85a2-4465-9f06-b36eeb9e3e33', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/bubbles/checkin_tip.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/e0a304ae-ecd7-4b17-955f-a49ef38784ae', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/bubbles/desire_tip.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/0ac63496-d162-4b73-b1fd-0d5a49a5cf90', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/bubbles/actions_tip.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/c1675791-3bbf-4ee9-8c2d-38ba6f649bf2', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/bubbles/stage_tip.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/76377971-14f5-4a2d-89f6-79c37d74015b', kind: 'svg' },

  // Text (Feeling)
  { out: 'public/figma/weiwei-wzx/ui/text/feeling_1.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/63c6c9cb-208c-4dbd-9085-6595573001ba', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/text/feeling_2.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/87a178aa-1b21-481c-b845-6bee568278b6', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/text/feeling_3.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/8ef23dcc-94a2-46ff-a275-af5000bb0177', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/text/feeling_tip.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/e711b9ad-2c53-40ca-a928-401a6530672a', kind: 'svg' },

  // Text (Breathing / Checkin)
  { out: 'public/figma/weiwei-wzx/ui/text/breathing_tip.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/6339d43a-80d0-410f-ba30-4159bbf9ef62', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/text/checkin_tip.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/8c5695f4-5a94-4969-aad7-1cf72f574e98', kind: 'svg' },

  // Text (Desire)
  { out: 'public/figma/weiwei-wzx/ui/text/desire_q.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/69e3b2f2-4dbd-4864-be13-e41a403fae22', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/text/desire_1.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/13e86f6e-a5ac-4042-a78a-ad55d6c2e9a3', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/text/desire_2.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/1a2f6fd0-816f-4cb3-ad9c-608150d577b0', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/text/desire_3.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/3d220c6e-4be8-4965-afeb-b8ec153e2d31', kind: 'svg' },

  // Text (Actions)
  { out: 'public/figma/weiwei-wzx/ui/text/actions_q.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/bd82ff35-5c8c-4b24-be74-7f66fa8cd8a5', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/text/actions_1.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/bcbdc9f2-a419-4c3e-a2b7-e42b718f5254', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/text/actions_2.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/d249b2f7-945a-4169-98f7-1ab74bea508e', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/text/actions_3.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/cc9d8eef-cec4-478f-8abe-0f0269a3b4d0', kind: 'svg' },

  // Text (Stage)
  { out: 'public/figma/weiwei-wzx/ui/text/stage_tip.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/2bae2f26-4c1b-4b38-aa9c-5b044a22a9bb', kind: 'svg' },

  // Guard block (Meituan)
  { out: 'public/figma/weiwei-wzx/ui/text/guard_block_desc.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/191ae0d3-ee8b-4015-9216-11b12b4af1e7', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/text/guard_block_last.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/a1972d0b-bbe7-4385-9521-b909241caa66', kind: 'svg' },

  // Trends
  { out: 'public/figma/weiwei-wzx/ui/text/trends_title.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/b615b1d2-f45c-4d5a-a7d1-c7a66aee7d68', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/text/trends_daily.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/63011ceb-7de0-462e-afc4-2f06830e47b9', kind: 'svg' },

  // Guard config text
  { out: 'public/figma/weiwei-wzx/ui/text/guard_title.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/bf4e3ee5-fc8c-43b2-ba3c-74ebeebab4d1', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/text/guard_auth.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/5ba76e50-ba4f-47ce-9ccf-233e828521ee', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/text/guard_config.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/76789bb2-17fd-4003-aa59-57f68dff1f03', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/text/guard_app_label.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/79f2a5cd-56bd-400b-bc9c-1607abc85deb', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/text/guard_time_label.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/38811c9f-8d51-4e7b-b1e1-2df7b53bd1a8', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/text/guard_intensity_label.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/37ec19d5-aa05-4805-9809-d982475851d5', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/text/guard_app_meituan.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/9594ddff-f9a4-4834-b071-4211113b4a03', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/text/guard_time_value.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/05914813-f981-416b-a958-6eff92bb25e3', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/text/guard_intensity_value.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/21471f99-47e1-4669-b716-2395ea0b7c3a', kind: 'svg' },

  // Guard config rows / icons
  { out: 'public/figma/weiwei-wzx/ui/guard/row_auth.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/bcf7af79-5d4e-40ec-8f27-9ecfe3b5cdc9', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/guard/row_config.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/7309525e-118c-4a12-b1c5-0eec34138af7', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/icons/chevron_right.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/0ae10c8a-682c-4098-8b65-57274c5aeb38', kind: 'svg' },

  // Trends content groups
  { out: 'public/figma/weiwei-wzx/ui/trends/daily_list.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/721bb26d-26b2-4444-973b-d17d76e396df', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/trends/chart_top.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/cd4d86b2-2c9e-4395-a12a-5183a70a620d', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/trends/card_bottom.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/8f22f59c-1f46-4e6c-b667-e18cbe68d92c', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/trends/badge_left.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/0ea16306-cfae-443d-80e6-f29c1909230b', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/trends/badge_right.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/52170230-b39e-43a0-a180-8cd6d18b75d6', kind: 'svg' },

  // Choice icons
  { out: 'public/figma/weiwei-wzx/ui/icons/desire_1.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/545d3d6a-53f8-478d-8603-47cf2d28d77a', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/icons/desire_2.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/4a89136d-1039-4f3a-ae1f-33fa77ace779', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/icons/desire_3.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/b04e3ad5-c376-4d1a-82b3-71ceff2635cc', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/icons/actions_1.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/03a5293f-16e2-4c97-8b95-90360d14770e', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/icons/actions_2.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/e380b566-1d3e-4541-870d-b17f1206ed5e', kind: 'svg' },
  // NOTE: scale=2 for this node sometimes returns 403; use a scale=1 render URL.
  { out: 'public/figma/weiwei-wzx/ui/icons/actions_3.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/c99800df-f058-4cd0-ad29-943044e21394', kind: 'svg' },

  // Check-in buttons
  { out: 'public/figma/weiwei-wzx/ui/buttons/checkin_btn_1.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/af13b447-e4dd-40ae-8f56-ff7dde05a552', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/buttons/checkin_btn_2.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/a256d174-5c3d-461b-b42c-ea7023f01e9c', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/buttons/checkin_btn_3.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/fee123b4-ea60-47ef-8b76-9b144004cd49', kind: 'svg' },

  // Breathing visuals
  { out: 'public/figma/weiwei-wzx/ui/breathing/ellipse_glow.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/672fab90-ca6f-43cf-bc0a-89a968456114', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/breathing/ring_outer.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/d1422b6b-67a1-40bd-b9aa-1ae3591a1765', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/breathing/ring_inner.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/d58887fc-5999-40fe-bb14-f20f4effdb34', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/breathing/timer_circle.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/ae18f2ff-13f2-4b55-9fae-f512448e4b43', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/breathing/orbit.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/c4aa003f-d9ba-4f95-b769-84b70ec0f7d8', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/breathing/orbit_dot.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/a17fc4ec-c28a-4b47-9227-61696fa78c2d', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/breathing/circle_bg.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/ce4f0444-77e7-40e5-82b5-28917e68f06d', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/breathing/circle_fg.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/5057346f-ed27-481e-b0d1-d33148076f5e', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/breathing/circle_timer.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/4fa39802-28a8-446f-b171-f0a3391313e2', kind: 'svg' },

  // Stage / Guard block buttons + settings sheet
  { out: 'public/figma/weiwei-wzx/ui/buttons/sos_fab.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/a79984d9-5b37-4e05-ab33-49bd8c1d20d0', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/buttons/guard_close.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/1e62062d-f9f0-4956-a890-9b0689a3497f', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/buttons/guard_primary.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/d1242ffc-b1cb-4f26-9e06-6b1baba6de6d', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/buttons/guard_secondary.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/143825ea-e1fa-4dcf-99bf-e9705358ba9e', kind: 'svg' },
  { out: 'public/figma/weiwei-wzx/ui/sheets/settings_sheet.svg', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/a496ff22-9c06-49a5-a4ee-e09185d18bc7', kind: 'svg' },

  // Monsters (PNG)
  { out: 'public/figma/weiwei-wzx/ui/monsters/monster_small.png', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/df061027-ffd9-43e8-ac76-e97f1ddb7177', kind: 'png' },
  { out: 'public/figma/weiwei-wzx/ui/monsters/monster_small_checkin.png', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/5916556c-7eee-4881-a288-3c865babd022', kind: 'png' },
  { out: 'public/figma/weiwei-wzx/ui/monsters/monster_main.png', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/ea512c90-1e70-4c62-9620-7577d3110ad7', kind: 'png' },
  { out: 'public/figma/weiwei-wzx/ui/monsters/monster_stage.png', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/a8370683-cb4e-4768-a52e-d938affa3a65', kind: 'png' },
  { out: 'public/figma/weiwei-wzx/ui/monsters/monster_guard_block.png', url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/c500f343-e57d-4697-ac05-3ffe2be0b758', kind: 'png' },
];

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

async function downloadToFile(outFile, url, kind) {
  await ensureDir(path.dirname(outFile));
  try {
    await fs.access(outFile);
    return { status: 'skipped' };
  } catch {}

  const { buf, contentType } = await download(url);
  if (kind === 'svg' && !contentType.includes('svg')) {
    console.warn(`[warn] ${outFile} content-type=${contentType} (expected svg)`);
  }
  if (kind === 'png' && !contentType.includes('png')) {
    console.warn(`[warn] ${outFile} content-type=${contentType} (expected png)`);
  }
  await fs.writeFile(outFile, buf);
  return { status: 'downloaded' };
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

  if (EXTRA_ASSETS.length) {
    console.log(`Downloading extra UI assets: ${EXTRA_ASSETS.length}`);
    let extraOk = 0;
    let extraSkipped = 0;
    for (const a of EXTRA_ASSETS) {
      const outFile = path.join(ROOT, a.out);
      const r = await downloadToFile(outFile, a.url, a.kind);
      if (r.status === 'downloaded') extraOk += 1;
      else extraSkipped += 1;
    }
    console.log(`Extra assets done. downloaded=${extraOk}, skipped=${extraSkipped}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
