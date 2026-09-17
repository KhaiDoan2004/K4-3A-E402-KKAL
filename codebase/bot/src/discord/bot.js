/**
 * Bot Discord — lớp vỏ mỏng quanh core/. Mọi quyết định nằm ở core/decide.js.
 *   node src/discord/register.js   (một lần)
 *   node src/discord/bot.js
 */
import { Client, GatewayIntentBits, Partials, Events, MessageFlags, ChannelType } from 'discord.js';
import { KnowledgeBot } from '../core/index.js';
import { config } from '../config.js';
import { initTrace, traceFile, trace } from '../util/trace.js';
import { log, color } from '../util/log.js';
import * as ui from './ui.js';

const DRAFT_TTL = 15 * 60 * 1000;
const drafts = new Map();                       // key -> { draft, duplicate, at, userId }
setInterval(() => {
  for (const [k, v] of drafts) if (Date.now() - v.at > DRAFT_TTL) drafts.delete(k);
}, 60_000).unref();

const put = (v) => { const k = Math.random().toString(36).slice(2, 10); drafts.set(k, { ...v, at: Date.now() }); return k; };
const eph = (content) => ({ content, flags: MessageFlags.Ephemeral });

let bot;

/** Tìm tin câu hỏi tương ứng với tin trả lời — 3 tầng, giảm dần độ chắc. */
async function findQuestion(msg) {
  if (msg.reference?.messageId) {
    const r = await msg.channel.messages.fetch(msg.reference.messageId).catch(() => null);
    if (r) return { msg: r, how: 'reply' };
  }
  if (msg.channel.isThread()) {
    const s = await msg.channel.fetchStarterMessage().catch(() => null);
    if (s) return { msg: s, how: 'thread' };
  }
  const before = await msg.channel.messages.fetch({ limit: 20, before: msg.id }).catch(() => null);
  const cand = before && [...before.values()]
    .filter((m) => !m.author.bot && m.author.id !== msg.author.id && m.content.length > 15)
    .sort((a, b) => b.createdTimestamp - a.createdTimestamp)[0];
  return cand ? { msg: cand, how: 'gần nhất trong kênh' } : null;
}

function isTA(member) {
  const role = config.discord.taRoleId;
  if (!role) return true;                        // không cấu hình role -> ai cũng lưu được (chỉ nên dùng khi demo)
  return member?.roles?.cache?.has(role) ?? false;
}
const channelAllowed = (id) =>
  !config.discord.allowedChannels.length || config.discord.allowedChannels.includes(id);

// ── Lưu vào kho: context menu ──────────────────────────────────────
async function onSaveCommand(itx) {
  if (!isTA(itx.member)) return itx.reply(eph('Chỉ trợ giảng mới lưu được vào kho.'));
  await itx.deferReply({ flags: MessageFlags.Ephemeral });

  const answerMsg = itx.targetMessage;
  const found = await findQuestion(answerMsg);
  if (!found) return itx.editReply(eph('Không tìm được câu hỏi tương ứng. Thử dùng Reply khi trả lời rồi lưu lại nhé.'));

  const { draft, duplicate } = await bot.draft({
    question: found.msg.content,
    answer: answerMsg.content,
    meta: {
      guildId: itx.guildId, channelId: itx.channelId,
      questionMsgId: found.msg.id, answerMsgId: answerMsg.id,
      askedBy: found.msg.author.username,
      savedBy: itx.user.username, savedById: itx.user.id,
      jumpUrl: answerMsg.url,
    },
  });

  const key = put({ draft, duplicate, userId: itx.user.id });
  await itx.editReply({
    content: `Câu hỏi lấy theo: **${found.how}** — sai thì bấm Bỏ rồi Reply đúng tin và lưu lại.`,
    embeds: [ui.draftEmbed(draft, duplicate)],
    components: ui.draftButtons(key, duplicate),
  });
}

// ── Hỏi bot ────────────────────────────────────────────────────────
async function answer(itxOrMsg, question, { ephemeral = false } = {}) {
  const res = await bot.ask(question, { mode: 'mention' });
  const taMention = config.discord.taRoleId ? `<@&${config.discord.taRoleId}>` : null;
  const payload = {
    embeds: [ui.answerEmbed(res, { taMention })],
    components: ui.answerButtons(res),
    ...(ephemeral ? { flags: MessageFlags.Ephemeral } : {}),
  };
  return { res, payload };
}

// ── Nút bấm ────────────────────────────────────────────────────────
async function onButton(itx) {
  const [action, key, extra] = itx.customId.split(':');

  if (action === 'up' || action === 'down') {
    const who = { by: itx.user.username, byId: itx.user.id };

    if (action === 'up') {
      const r = await bot.approve(key, who);
      return itx.reply(eph(r?.already ? 'Bạn bấm rồi mà 🙂' : 'Cảm ơn bạn 👍'));
    }

    // Học viên báo sai -> chỉ báo TA. TA báo sai -> gỡ luôn.
    const ta = isTA(itx.member);
    const r = await bot.flag(key, { ...who, isTA: ta, note: 'báo sai từ Discord' });
    if (!r) return itx.reply(eph('Không tìm thấy mục này nữa.'));
    if (r.already) return itx.reply(eph('Bạn đã báo mục này rồi, trợ giảng đang xem 👀'));

    if (r.removed) {
      await itx.reply(eph('Đã gỡ mục này khỏi trả lời tự động. Nhớ sửa lại rồi lưu bản mới nhé.'));
      // Sửa chính tin nhắn đang mang câu trả lời, để người đọc sau không tưởng nó còn đúng.
      await itx.message.edit({
        content: `⚠️ Trợ giảng **${itx.user.username}** đã rút câu trả lời này. Đừng làm theo nữa nhé.`,
        components: [],
      }).catch(() => {});
      return;
    }

    // Học viên: mục vẫn dùng được, nhưng TA phải thấy.
    await itx.reply(eph('Đã báo trợ giảng xem lại. Trong lúc chờ thì bạn đừng làm theo vội nhé 🙏'));
    const ping = r.notify && /^\d{17,20}$/.test(String(r.notify))
      ? `<@${r.notify}>`
      : (config.discord.taRoleId ? `<@&${config.discord.taRoleId}>` : 'Trợ giảng ơi');
    await itx.channel?.send(
      `${ping} — **${itx.user.username}** báo câu trả lời này chưa đúng (mục \`${key}\`, ${r.reportCount} lượt báo).\n` +
      `Mục vẫn đang được dùng để trả lời. Xem lại giúp: đúng thì bỏ qua, sai thì bấm 👎 để gỡ.`
    ).catch(() => {});
    return;
  }

  const slot = drafts.get(key);
  if (!slot) return itx.reply(eph('Bản nháp đã hết hạn (15 phút). Lưu lại giúp mình nhé.'));
  if (slot.userId !== itx.user.id) return itx.reply(eph('Bản nháp này của người khác.'));

  if (action === 'discard') { drafts.delete(key); return itx.update({ content: '❌ Đã bỏ.', embeds: [], components: [] }); }
  if (action === 'edit') return itx.showModal(ui.editModal(key, slot.draft));

  if (action === 'life') {
    const days = extra === 'temp' ? 7 : 90;
    slot.draft.lifespan = extra;
    slot.draft.expiresAt = new Date(Date.now() + days * 86400000).toISOString();
    return itx.update({ embeds: [ui.draftEmbed(slot.draft, slot.duplicate)], components: ui.draftButtons(key, slot.duplicate) });
  }

  if (action === 'save' || action === 'replace') {
    await itx.deferUpdate();
    const saved = await bot.commit(slot.draft, { replaces: action === 'replace' ? extra : null });
    drafts.delete(key);
    const note = action === 'replace' ? ` (thay cho bản trước, v${saved.version})` : '';
    return itx.editReply({ content: `✅ Đã lưu \`${saved.id}\`${note}.`, embeds: [], components: [] });
  }
}

async function onModal(itx) {
  const key = itx.customId.split(':')[1];
  const slot = drafts.get(key);
  if (!slot) return itx.reply(eph('Bản nháp đã hết hạn.'));
  slot.draft.title = itx.fields.getTextInputValue('title');
  slot.draft.answer = itx.fields.getTextInputValue('answer');
  const kw = itx.fields.getTextInputValue('keywords');
  if (kw) slot.draft.keywords = kw.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  await itx.update({ embeds: [ui.draftEmbed(slot.draft, slot.duplicate)], components: ui.draftButtons(key, slot.duplicate) });
}

// ── Khởi động ──────────────────────────────────────────────────────
async function main() {
  if (!config.discord.token) throw new Error('Thiếu DISCORD_TOKEN trong .env');
  initTrace(config.traceDir, 'discord');
  bot = await KnowledgeBot.open();

  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    partials: [Partials.Channel, Partials.Message],
  });

  client.once(Events.ClientReady, async (c) => {
    log.ok(`đăng nhập ${color.bold(c.user.tag)} · kho ${bot.storeLabel} · ${(await bot.stats()).active} mục`);
    log.info(`trace: ${traceFile()}`);
  });

  client.on(Events.InteractionCreate, async (itx) => {
    try {
      if (itx.isMessageContextMenuCommand() && itx.commandName === 'Lưu vào kho tri thức') return onSaveCommand(itx);
      if (itx.isButton()) return onButton(itx);
      if (itx.isModalSubmit()) return onModal(itx);
      if (itx.isChatInputCommand()) {
        if (itx.commandName === 'kho') {
          const s = await bot.stats();
          return itx.reply(eph(`Kho có **${s.active}** mục đang dùng · ${s.flagged} bị gắn cờ · ${s.needsReview} cần duyệt lại · ${s.superseded} đã bị thay · ${s.archived} đã lưu trữ.`));
        }
        if (itx.commandName === 'hoi') {
          await itx.deferReply();
          const { payload } = await answer(itx, itx.options.getString('cauhoi'));
          return itx.editReply(payload);
        }
      }
    } catch (e) {
      log.err(e.message);
      trace({ kind: 'interaction_error', error: String(e.message) });
      const msg = eph(`Có lỗi khi xử lý: ${e.message}`);
      itx.deferred || itx.replied ? itx.editReply(msg).catch(() => {}) : itx.reply(msg).catch(() => {});
    }
  });

  client.on(Events.MessageCreate, async (msg) => {
    if (msg.author.bot || !channelAllowed(msg.channelId)) return;
    if (!msg.mentions.has(client.user)) return;             // CP3: chỉ trả lời khi bị tag
    const q = msg.content.replace(/<@!?\d+>/g, '').trim();
    if (!q) return;
    try {
      await msg.channel.sendTyping();
      const { payload } = await answer(msg, q);
      const target = msg.channel.type === ChannelType.PublicThread ? msg.channel
        : await msg.startThread({ name: q.slice(0, 80) || 'hỏi đáp' }).catch(() => msg.channel);
      await target.send(payload);
    } catch (e) {
      log.err(e.message);
      await msg.reply(`Mình gặp lỗi khi xử lý: ${e.message}`).catch(() => {});
    }
  });

  await client.login(config.discord.token);
}

main().catch((e) => { log.err(e.message); process.exit(1); });
