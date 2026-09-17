/**
 * Nạp một file PDF vào kho tri thức.
 *
 *   node src/ingest-pdf.js --file "/đường/dẫn/tài-liệu.pdf" --name "Sổ tay học viên 20K AI v2.2"
 *
 * Khác với seed.js (nguồn là cặp hỏi–đáp đã được TA duyệt trên Discord), nguồn ở đây
 * là tài liệu chính thức. Mục sinh ra được đánh dấu trust='doc' để phân biệt: khi cả
 * hai cùng khớp một câu hỏi thì mục do TA ghim được ưu tiên, vì có người chịu trách nhiệm.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { KnowledgeBot } from './core/index.js';
import { chatJSON, embed } from './llm/client.js';
import { docExtract } from './llm/prompts.js';
import { readPdf, chunkPages } from './util/pdf.js';
import { initTrace, traceFile } from './util/trace.js';
import { config } from './config.js';
import { log, color } from './util/log.js';

const DAY = 86400000;
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };

async function main() {
  const file = arg('file');
  if (!file || !fs.existsSync(file)) {
    console.error('Thiếu --file hoặc không thấy file.\n  node src/ingest-pdf.js --file <đường dẫn .pdf> [--name "Tên tài liệu"]');
    process.exit(1);
  }
  const docName = arg('name', path.basename(file, '.pdf'));
  const lifespan = arg('lifespan', 'term');          // tài liệu gắn với phiên bản -> mặc định theo kỳ
  const dry = process.argv.includes('--dry');

  initTrace(config.traceDir, 'ingest-pdf');
  log.info(`đọc ${color.bold(path.basename(file))} …`);
  const { numPages, pages } = await readPdf(file);
  const chunks = chunkPages(pages);
  log.info(`${numPages} trang · ${pages.length} trang có text · ${chunks.length} khối`);

  const bot = await KnowledgeBot.open();
  if (process.argv.includes('--reset-doc')) {
    for (const e of await bot.store.all({ status: null }))
      if (e.source?.docName === docName) await bot.store.update(e.id, { status: 'archived' });
    log.warn(`đã lưu trữ các mục cũ của "${docName}"`);
  }

  let made = 0, skipped = 0;
  for (const [i, ch] of chunks.entries()) {
    const where = ch.from === ch.to ? `tr.${ch.from}` : `tr.${ch.from}-${ch.to}`;
    process.stdout.write(color.gray(`[${i + 1}/${chunks.length}] ${where} … `));
    try {
      const { parsed } = await chatJSON({
        label: 'doc_extract',
        system: docExtract.system,
        user: docExtract.user({ text: ch.text, from: ch.from, to: ch.to, docName }),
      });
      const items = Array.isArray(parsed.items) ? parsed.items : [];
      if (!items.length) { console.log(color.gray('bỏ qua (bìa/mục lục)')); skipped++; continue; }

      for (const it of items) {
        if (!it.question || !it.answer) continue;
        const entry = {
          id: `doc_${crypto.randomBytes(6).toString('hex')}`,
          title: String(it.title || '').slice(0, 120),
          question: it.question,
          answer: it.answer,
          answerRaw: ch.text.slice(0, 2000),
          questionRaw: null,
          topic: it.topic || 'khac',
          keywords: (it.keywords || []).map((k) => String(k).toLowerCase()),
          lifespan,
          lifespanReason: 'trích từ tài liệu có số phiên bản',
          expiresAt: new Date(Date.now() + 90 * DAY).toISOString(),
          status: 'active',
          version: 1, supersededBy: null, previousVersion: null,
          trust: 'doc',                                  // <-> 'ta' cho mục do TA ghim
          source: {
            type: 'pdf', docName, file: path.basename(file),
            page: ch.from, pageTo: ch.to,
            guildId: null, channelId: null, messageId: null,
            questionMessageId: null, jumpUrl: null,
          },
          askedBy: null, savedBy: docName, savedById: null,
          savedAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
          voters: { up: [], down: [] }, reports: [],
          stats: { served: 0, thumbsUp: 0, thumbsDown: 0 },
        };
        entry.embedding = await embed(`${entry.title}\n${entry.question}\n${entry.keywords.join(' ')}`);
        if (!dry) await bot.store.insert(entry);
        made++;
      }
      console.log(color.green(`✓ ${items.length} mục`) + color.gray(`  ${items[0].title?.slice(0, 50) ?? ''}`));
    } catch (e) { console.log(color.red('✗ ' + e.message)); skipped++; }
  }

  log.ok(`${dry ? '[DRY] ' : ''}tạo ${made} mục từ ${chunks.length - skipped}/${chunks.length} khối`);
  log.info(`trace: ${traceFile()}`);
  console.log(await bot.stats());
  await bot.close();
}

main().catch((e) => { log.err(e.stack || e.message); process.exit(1); });
