/**
 * Chạy trọn bộ golden set qua ĐÚNG engine mà bot Discord dùng (codebase/bot/src/core),
 * không có đường code riêng cho eval.
 *
 *   node eval/run_eval.mjs                 # chạy hết, ghi run_results.md
 *   node eval/run_eval.mjs --only G05,G09  # chạy vài ca
 *   node eval/run_eval.mjs --out eval/run_results_2.md
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { KnowledgeBot } from '../codebase/bot/src/core/index.js';
import { initTrace, traceFile } from '../codebase/bot/src/util/trace.js';
import { config } from '../codebase/bot/src/config.js';
import { log, color } from '../codebase/bot/src/util/log.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const CONC = Number(arg('conc', 4));

const norm = (s) => String(s || '').toLowerCase();

/** Chấm một ca theo đúng hai chiều đã khai trong golden_set.json. */
function grade(c, res, kbBySourceMsg) {
  const fails = [];
  const want = [c.expect.decision, ...(c.expect.also_ok || [])];

  if (!want.includes(res.decision))
    fails.push(`hành vi: mong ${want.join('/')}, nhận ${res.decision}`);

  if (c.expect.source_of) {
    const wantId = kbBySourceMsg[c.expect.source_of]?.id;
    if (!wantId) fails.push(`không dựng được mục từ ${c.expect.source_of} (kho thiếu)`);
    else if (res.source?.id !== wantId)
      fails.push(`căn cứ: mong mục của ${c.expect.source_of}, nhận ${res.source?.id ?? 'không trích dẫn'}`);
  }

  const hay = norm(res.answer);
  for (const m of c.must_include || []) if (!hay.includes(norm(m))) fails.push(`thiếu "${m}"`);
  for (const m of c.must_not_include || []) if (hay.includes(norm(m))) fails.push(`lộ "${m}"`);

  return {
    pass: fails.length === 0,
    strict: res.decision === c.expect.decision && fails.filter((f) => !f.startsWith('hành vi')).length === 0,
    fails,
  };
}

async function pool(items, n, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); }
  }));
  return out;
}

const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n+/g, ' ').trim();
const cut = (s, n) => (s && s.length > n ? s.slice(0, n - 1) + '…' : s ?? '');

async function main() {
  const gs = JSON.parse(fs.readFileSync(path.join(HERE, 'golden_set.json'), 'utf8'));
  const only = (arg('only') || '').split(',').map((s) => s.trim()).filter(Boolean);
  const cases = only.length ? gs.cases.filter((c) => only.includes(c.id)) : gs.cases;

  const tracePath = initTrace(config.traceDir, 'eval');
  const bot = await KnowledgeBot.open();
  const kb = await bot.store.all({ status: 'active' });
  if (!kb.length) {
    log.err('Kho rỗng. Chạy seed trước:\n  cd codebase/bot && node src/seed.js --pack <đường dẫn k4_messages.csv>');
    process.exit(1);
  }
  const kbBySourceMsg = {};
  for (const e of kb) if (e.source?.messageId) kbBySourceMsg[e.source.messageId] = e;

  log.info(`${cases.length} ca · kho ${bot.storeLabel} (${kb.length} mục) · model ${config.openai.chatModel} + ${config.openai.embedModel}`);
  const startedAt = new Date();
  const t0 = Date.now();

  const rows = await pool(cases, CONC, async (c) => {
    let res, error = null;
    try { res = await bot.ask(c.question, { mode: 'eval' }); }
    catch (e) {
      error = e.message;
      res = { decision: 'ERROR', confidence: 0, answer: '', reason: e.message, source: null, candidates: [], meta: { ms: 0, kbSize: kb.length, topScore: 0 } };
    }
    const g = grade(c, res, kbBySourceMsg);
    console.log(`${g.pass ? color.green('PASS') : color.red('FAIL')} ${c.id} ${color.gray(`[${c.layer}]`)} ${color.gray(`${c.expect.decision}→${res.decision} ${(res.confidence * 100).toFixed(0)}%`)}${g.pass ? '' : color.yellow('  ' + g.fails.join('; '))}`);
    return { c, res, g, error };
  });

  const ms = Date.now() - t0;
  const pass = rows.filter((r) => r.g.pass).length;
  const strict = rows.filter((r) => r.g.strict && r.res.decision === r.c.expect.decision).length;
  const pct = (n) => ((n / rows.length) * 100).toFixed(1);

  const byLayer = {};
  for (const r of rows) {
    const k = r.c.layer;
    byLayer[k] ??= { n: 0, ok: 0 };
    byLayer[k].n++; if (r.g.pass) byLayer[k].ok++;
  }

  const md = [];
  md.push('# Kết quả chạy golden set — lượt 1', '');
  md.push(`> Sinh tự động bởi \`eval/run_eval.mjs\`. **Đừng sửa tay file này** — chạy lại để cập nhật.`, '');
  md.push('| | |', '|---|---|');
  md.push(`| Thời điểm chạy | ${startedAt.toISOString().replace('T', ' ').slice(0, 19)} UTC |`);
  md.push(`| Golden set | \`eval/golden_set.json\` v${gs.version}, ${rows.length} ca |`);
  md.push(`| Kho tri thức | ${kb.length} mục đang hoạt động (${bot.storeLabel}) |`);
  md.push(`| Model | chat \`${config.openai.chatModel}\` · embedding \`${config.openai.embedModel}\` |`);
  md.push(`| Ngưỡng | trả lời ≥ ${config.bar.answer} · dè dặt ≥ ${config.bar.uncertain} · sàn cosine ${config.bar.retrieveFloor} / ${config.bar.answerFloor} |`);
  md.push(`| Trace | \`${path.relative(path.join(HERE, '..'), tracePath)}\` |`);
  md.push(`| Tổng thời gian | ${(ms / 1000).toFixed(1)}s (${CONC} luồng) |`);
  md.push('');

  md.push('## Tổng hợp', '');
  md.push('| Chỉ số | Số ca | Tỷ lệ |', '|---|---:|---:|');
  md.push(`| **ĐẠT** (đủ hai chiều) | ${pass}/${rows.length} | **${pct(pass)}%** |`);
  md.push(`| Không đạt | ${rows.length - pass}/${rows.length} | ${pct(rows.length - pass)}% |`);
  md.push(`| Trùng khít \`expect.decision\` (thước nghiêm) | ${strict}/${rows.length} | ${pct(strict)}% |`);
  md.push('');
  md.push('| Lớp | Đạt | Tỷ lệ |', '|---|---:|---:|');
  for (const [k, v] of Object.entries(byLayer))
    md.push(`| ${k} | ${v.ok}/${v.n} | ${((v.ok / v.n) * 100).toFixed(0)}% |`);
  md.push('');

  md.push('## Từng ca', '');
  md.push('| Ca | Lớp | Câu hỏi | Mong đợi | Nhận được | Chắc | Căn cứ | KQ |');
  md.push('|---|---|---|---|---|---:|---|---|');
  for (const { c, res, g } of rows) {
    md.push(`| \`${c.id}\` | ${c.layer} | ${esc(cut(c.question, 60))} | ${c.expect.decision}${c.expect.also_ok ? `<br>*(hoặc ${c.expect.also_ok.join('/')})*` : ''} | ${res.decision} | ${(res.confidence * 100).toFixed(0)}% | ${res.source ? `\`${esc(cut(res.source.id, 12))}\`` : '—'} | ${g.pass ? '✅' : '❌'} |`);
  }
  md.push('');

  const bad = rows.filter((r) => !r.g.pass);
  md.push('## Phân tích ca chưa đạt', '');
  if (!bad.length) md.push('_Không có ca nào trượt ở lượt này._', '');
  for (const { c, res, g, error } of bad) {
    md.push(`### \`${c.id}\` · lớp ${c.layer} · ${c.kind}`, '');
    md.push(`**Câu hỏi.** ${c.question}`, '');
    md.push(`**Mong đợi.** \`${[c.expect.decision, ...(c.expect.also_ok || [])].join('` hoặc `')}\`${c.expect.source_of ? ` · căn cứ phải là mục sinh từ \`${c.expect.source_of}\`` : ''}`, '');
    md.push(`**Nhận được.** \`${res.decision}\` · mức chắc ${(res.confidence * 100).toFixed(0)}% · căn cứ ${res.source ? `\`${res.source.id}\`` : 'không có'} · ứng viên tốt nhất ${res.meta.topScore}`, '');
    md.push(`**Sai ở đâu.** ${g.fails.map((f) => `\`${f}\``).join(' · ')}`, '');
    if (error) md.push(`**Lỗi kỹ thuật.** \`${error}\``, '');
    md.push(`**Bot đã nói.** ${esc(cut(res.answer, 300)) || '_(trống)_'}`, '');
    md.push(`**Bot tự giải thích.** ${esc(cut(res.reason, 300))}`, '');
    if (c.note) md.push(`**Ghi chú khi dựng ca.** ${c.note}`, '');
    md.push('');
  }

  // Phân tích do người viết, nằm ở eval/analysis.md — nối vào cuối báo cáo tự sinh.
  const anaPath = path.join(HERE, 'analysis.md');
  if (fs.existsSync(anaPath)) md.push(fs.readFileSync(anaPath, 'utf8').trim(), '');

  md.push('## Cách chạy lại', '');
  md.push('```bash', 'cd codebase/bot && npm install',
    'cp .env.example .env            # điền OPENAI_API_KEY',
    'node src/seed.js --pack <đường dẫn tới k4_messages.csv> --reset',
    'cd ../.. && node eval/run_eval.mjs', '```', '');

  const out = path.resolve(arg('out', path.join(HERE, 'run_results.md')));
  fs.writeFileSync(out, md.join('\n'), 'utf8');

  console.log('');
  log.ok(`ĐẠT ${color.bold(`${pass}/${rows.length}`)} = ${color.bold(pct(pass) + '%')}  ·  thước nghiêm ${strict}/${rows.length} = ${pct(strict)}%`);
  log.info(`bảng kết quả: ${path.relative(process.cwd(), out)}`);
  log.info(`trace: ${path.relative(process.cwd(), traceFile())}`);
  await bot.close();
}

main().catch((e) => { log.err(e.stack || e.message); process.exit(1); });
