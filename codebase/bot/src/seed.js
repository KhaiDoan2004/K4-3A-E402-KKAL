/**
 * Nạp kho tri thức ban đầu từ các cặp hỏi–đáp CÓ THẬT trong data pack của khoá.
 *
 *   node src/seed.js --pack "../../../K4-3A-Day05-06-AI-Product-Hackathon/data/discord-pack/k4_messages.csv"
 *
 * Mỗi cặp đi qua đúng pipeline mà TA sẽ dùng khi bấm "Lưu vào kho":
 * LLM làm mượt thật -> sinh embedding thật -> ghi xuống kho.
 * Không có nội dung nào viết tay ở đây.
 *
 * Data pack KHÔNG được commit (quy định bảo mật của khoá). Script nhận đường dẫn
 * từ tham số để ai có pack cũng dựng lại được kho y hệt.
 */
import fs from 'node:fs';
import path from 'node:path';
import { KnowledgeBot } from './core/index.js';
import { initTrace, traceFile } from './util/trace.js';
import { config } from './config.js';
import { log, color } from './util/log.js';

// (câu hỏi, các tin trả lời) — chọn tay từ k4_messages.csv, dẫn nguồn bằng msg_id.
const PAIRS = [
  { q: 'M51326', a: ['M12802', 'M29806', 'M62112', 'M17439', 'M57970'] },
  { q: 'M07901', a: ['M30675', 'M41033', 'M18165', 'M23695', 'M07679', 'M39872', 'M54305'] },
  { q: 'M44947', a: ['M94723'] },
  { q: 'M40002', a: ['M60614'] },
  { q: 'M63574', a: ['M43132'] },
  { q: 'M56857', a: ['M17046'] },
  { q: 'M83711', a: ['M81490'] },
  { q: 'M90166', a: ['M13316'] },
  { q: 'M89580', a: ['M24912'] },
  { q: 'M73509', a: ['M29762'] },
  { q: 'M12580', a: ['M18708'] },
  { q: 'M02512', a: ['M94913'] },
  { q: 'M71241', a: ['M10708'] },
  { q: 'M57545', a: ['M14573'] },

  // Bổ sung sau khi đối chiếu golden set của Khuyến (17/9)
  { q: 'M83358', a: ['M43101'] },              // một team mấy người -> 5
  { q: 'M00554', a: ['M26380', 'M11538'] },    // khác level ghép team -> NGƯỢC với M24912, cố ý giữ cả hai
  { q: 'M03059', a: ['M81088'] },              // giấy tờ gấp -> viết mail cho trường
  { q: 'M37242', a: ['M11596'] },              // tạo ticket -> /ticket create
  { q: null,     a: ['M47011'] },              // THÔNG BÁO đổi tên Discord (không có ai hỏi trước)
];

function parseCsv(text) {
  const rows = []; let row = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; }
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const head = rows.shift();
  return rows.filter((r) => r.length === head.length)
             .map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]])));
}

const arg = (name, dflt) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : dflt;
};

async function main() {
  const packArg = arg('pack');
  if (!packArg) {
    console.error(`Thiếu --pack.
  node src/seed.js --pack <đường dẫn tới k4_messages.csv>`);
    process.exit(1);
  }
  const pack = path.resolve(packArg);
  if (!fs.existsSync(pack)) { console.error(`Không thấy file: ${pack}`); process.exit(1); }

  initTrace(config.traceDir, 'seed');
  // Pack có 3 msg_id bị trùng (1.092 dòng / 1.089 mã). Giữ bản ĐẦU TIÊN để
  // việc dẫn nguồn theo msg_id cho ra cùng một tin mỗi lần chạy.
  const byId = {};
  for (const r of parseCsv(fs.readFileSync(pack, 'utf8'))) byId[r.msg_id] ??= r;
  const bot = await KnowledgeBot.open();
  log.info(`kho: ${color.bold(bot.storeLabel)}`);

  if (process.argv.includes('--reset')) { await bot.store.clear(); log.warn('đã xoá kho cũ'); }

  let ok = 0, skip = 0;
  for (const [n, p] of PAIRS.entries()) {
    const qm = p.q ? byId[p.q] : null;            // p.q = null -> ghim thông báo
    const ams = p.a.map((id) => byId[id]).filter(Boolean);
    if ((p.q && !qm) || !ams.length) { log.warn(`bỏ qua ${p.q ?? p.a[0]} — không có trong pack`); skip++; continue; }

    if (await bot.store.findBySourceMessage(ams.at(-1).msg_id)) {
      log.info(`${p.q} đã có trong kho, bỏ qua`); skip++; continue;
    }

    process.stdout.write(color.gray(`[${n + 1}/${PAIRS.length}] ${p.q ?? '(thông báo)'} → ${p.a.join(',')} … `));
    try {
      const { draft } = await bot.draft({
        question: qm ? qm.content : '',
        answer: ams.map((m) => m.content).join('\n'),
        meta: {
          questionMsgId: qm?.msg_id ?? null, answerMsgId: ams.at(-1).msg_id,
          answerMsgIds: p.a, askedBy: qm?.author ?? null, savedBy: ams.at(-1).author,
          channelId: (qm ?? ams[0]).channel, guildId: (qm ?? ams[0]).guild,
        },
      });
      await bot.commit(draft);
      console.log(color.green('✓') + color.gray(`  ${draft.lifespan}  ${draft.title.slice(0, 64)}`));
      ok++;
    } catch (e) { console.log(color.red('✗ ' + e.message)); skip++; }
  }

  log.ok(`nạp ${ok} mục, bỏ qua ${skip}`);
  log.info(`trace: ${traceFile()}`);
  console.log(await bot.stats());
  await bot.close();
}

main().catch((e) => { log.err(e.message); process.exit(1); });
