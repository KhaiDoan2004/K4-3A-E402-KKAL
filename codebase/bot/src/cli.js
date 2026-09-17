/**
 * Bàn thử engine mà không cần Discord.
 *
 *   node src/cli.js                       # chế độ hỏi liên tục
 *   node src/cli.js "cvat báo lỗi 500"    # hỏi một câu rồi thoát
 *   node src/cli.js --kb                  # xem kho đang có gì
 */
import readline from 'node:readline';
import { KnowledgeBot } from './core/index.js';
import { initTrace, traceFile } from './util/trace.js';
import { config } from './config.js';
import { renderCli } from './util/render.js';
import { log, color } from './util/log.js';

const BANNER = `
${color.bold('@botcute')} ${color.gray('· bot ghim tri thức — bàn thử CLI')}
${color.gray('gõ câu hỏi rồi Enter · /kb xem kho · /stats · /q thoát')}`;

async function main() {
  initTrace(config.traceDir, 'cli');
  const bot = await KnowledgeBot.open();
  const kb = await bot.store.all({ status: 'active' });

  if (process.argv.includes('--kb')) {
    console.log(color.bold(`\nKho ${bot.storeLabel} — ${kb.length} mục đang hoạt động\n`));
    for (const e of kb) {
      console.log(`${color.cyan(e.id)}  ${color.gray(`[${e.topic}/${e.lifespan}]`)}  ${e.title}`);
      console.log(color.gray(`   nguồn ${e.source.questionMessageId} → ${e.source.messageId} · TA ${e.savedBy} · đã dùng ${e.stats.served}\n`));
    }
    return bot.close();
  }

  const one = process.argv.slice(2).filter((a) => !a.startsWith('--')).join(' ');
  if (one) {
    console.log(color.bold(`\n❓ ${one}\n`));
    console.log(renderCli(await bot.ask(one)));
    console.log(color.gray(`\ntrace: ${traceFile()}`));
    return bot.close();
  }

  console.log(BANNER);
  console.log(color.gray(`kho: ${bot.storeLabel} · ${kb.length} mục · model ${config.openai.chatModel}\n`));

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: color.cyan('❓ ') });
  rl.prompt();
  rl.on('line', async (line) => {
    const q = line.trim();
    if (!q) return rl.prompt();
    if (q === '/q' || q === '/exit') return rl.close();
    if (q === '/stats') { console.log(await bot.stats(), '\n'); return rl.prompt(); }
    if (q === '/kb') {
      for (const e of await bot.store.all({ status: 'active' }))
        console.log(`  ${color.cyan(e.id)} ${color.gray(`[${e.topic}]`)} ${e.title}`);
      console.log();
      return rl.prompt();
    }
    try { console.log('\n' + renderCli(await bot.ask(q)) + '\n'); }
    catch (e) { log.err(e.message); }
    rl.prompt();
  });
  rl.on('close', async () => {
    console.log(color.gray(`\ntrace: ${traceFile()}`));
    await bot.close();
    process.exit(0);
  });
}

main().catch((e) => { log.err(e.message); process.exit(1); });
