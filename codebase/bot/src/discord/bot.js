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
import { stripMentions } from '../util/scrub.js';
import * as ui from './ui.js';

const DRAFT_TTL = 15 * 60 * 1000;
const drafts = new Map();                       // key -> { draft, duplicate, at, userId }
setInterval(() => {
  for (const [k, v] of drafts) if (Date.now() - v.at > DRAFT_TTL) drafts.delete(k);
}, 60_000).unref();

const put = (v) => { const k = Math.random().toString(36).slice(2, 10); drafts.set(k, { ...v, at: Date.now() }); return k; };
const eph = (content) => ({ content, flags: MessageFlags.Ephemeral });

let bot;

const QUESTION_WINDOW = 30 * 60 * 1000;
const LOOKS_LIKE_QUESTION =
  /\?|\b(sao|thế nào|the nao|làm gì|lam gi|bị lỗi|bi loi|lỗi|loi|giúp|giup|hỏi|hoi|có .* (không|ko|k)\b|được không|đc ko)\b/i;

/**
 * Tìm tin câu hỏi tương ứng với tin trả lời — 3 tầng, giảm dần độ chắc.
 * Tầng 3 bị siết lại: chỉ nhìn trong 30 phút, bỏ tin của chính người trả lời,
 * và ưu tiên tin trông giống câu hỏi. Trước đây nó quét 20 tin bất kỳ nên
 * hay bốc nhầm một tin cũ chẳng liên quan.
 */
async function findQuestion(msg) {
  if (msg.reference?.messageId) {
    const r = await msg.channel.messages.fetch(msg.reference.messageId).catch(() => null);
    if (r) return { msg: r, how: 'reply', sure: true };
  }
  if (msg.channel.isThread()) {
    const s = await msg.channel.fetchStarterMessage().catch(() => null);
    if (s && s.id !== msg.id) return { msg: s, how: 'tin mở thread', sure: true };
  }

  const before = await msg.channel.messages.fetch({ limit: 30, before: msg.id }).catch(() => null);
  if (!before) return null;
  const pool = [...before.values()].filter((m) =>
    !m.author.bot &&
    m.author.id !== msg.author.id &&
    m.content.trim().length > 10 &&
    msg.createdTimestamp - m.createdTimestamp <= QUESTION_WINDOW);
  if (!pool.length) return null;

  pool.sort((a, b) => {
    const qa = LOOKS_LIKE_QUESTION.test(a.content) ? 1 : 0;
    const qb = LOOKS_LIKE_QUESTION.test(b.content) ? 1 : 0;
    return qb - qa || b.createdTimestamp - a.createdTimestamp;
  });
  return { msg: pool[0], how: 'đoán từ 30 phút gần nhất', sure: false };
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

  // Tin được chọn trông như một CÂU HỎI chứ không phải câu trả lời -> gần như chắc chọn nhầm.
  const looksLikeQuestion =
    answerMsg.mentions.users.has(itx.client.user.id) ||
    (config.discord.taRoleId && answerMsg.mentions.roles.has(config.discord.taRoleId)) ||
    (answerMsg.content.trim().length < 120 && LOOKS_LIKE_QUESTION.test(answerMsg.content));

  const found = await findQuestion(answerMsg);
  if (!found) return itx.editReply(eph(
    'Không tìm được câu hỏi đi kèm.\n' +
    'Cách chắc ăn: **Reply** vào tin câu hỏi khi trả lời, rồi lưu chính tin trả lời của bạn.'));

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
  const warn = looksLikeQuestion
    ? '🚨 **Tin bạn chọn trông giống CÂU HỎI, không phải câu trả lời.** ' +
      'Nhớ chọn tin *trả lời* nhé — đọc kỹ hai khối bên dưới trước khi Lưu.\n'
    : (!found.sure
        ? '⚠️ Không có Reply nên mình **đoán** câu hỏi. Đối chiếu hai khối bên dưới giúp mình.\n'
        : '');

  await itx.editReply({
    content: warn + `Câu hỏi lấy theo: **${found.how}**. Sai thì bấm ❌ Bỏ, Reply đúng tin rồi lưu lại.`,
    embeds: [ui.draftEmbed(draft, duplicate, {
      rawQuestion: found.msg.content, rawAnswer: answerMsg.content,
      askedBy: found.msg.author.username, answeredBy: answerMsg.author.username,
    })],
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

  if (action === 'renew' || action === 'retire') {
    if (!isTA(itx.member)) return itx.reply(eph('Chỉ trợ giảng mới quyết được mục này.'));
    const r = action === 'renew'
      ? await bot.renew(key, { by: itx.user.username })
      : await bot.retire(key, { by: itx.user.username });
    if (!r) return itx.reply(eph('Không tìm thấy mục này nữa.'));
    const msg = action === 'renew'
      ? `✅ **${itx.user.username}** xác nhận còn đúng — dùng tiếp tới ${r.expiresAt?.slice(0, 10)}.`
      : `🗑️ **${itx.user.username}** đã bỏ mục này khỏi kho.`;
    return itx.update({ content: msg, embeds: [], components: [] });
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

  // Rà mục hết hạn rồi BÁO người đã lưu nó. Không có bước này thì mục chuyển
  // needs_review xong nằm im, không ai biết mà duyệt lại.
  async function sweepAndNotify(client) {
    let swept;
    try { swept = await bot.sweepExpired(); } catch (e) { return log.err(e.message); }
    const need = swept.filter((e) => e.status === 'needs_review');
    if (!need.length) return;
    log.info(`${need.length} mục hết hạn, đang báo trợ giảng`);

    for (const e of need) {
      const payload = { embeds: [ui.reviewEmbed(e)], components: ui.reviewButtons(e.id) };
      // Ưu tiên nhắn riêng đúng người đã lưu; không được thì đăng ở kênh duyệt.
      let sent = false;
      if (e.savedById) {
        sent = await client.users.fetch(e.savedById)
          .then((u) => u.send(payload)).then(() => true).catch(() => false);
      }
      if (!sent) {
        const chId = config.discord.reviewChannelId || e.source?.channelId;
        const ch = chId && await client.channels.fetch(chId).catch(() => null);
        if (ch?.isTextBased()) {
          const ping = config.discord.taRoleId ? `<@&${config.discord.taRoleId}> ` : '';
          await ch.send({ content: ping + 'mục này hết hạn, nhờ xem lại giúp:', ...payload }).catch(() => {});
          sent = true;
        }
      }
      if (!sent) log.warn(`không báo được cho mục ${e.id} — đặt DISCORD_REVIEW_CHANNEL_ID trong .env`);
    }
  }

  client.once(Events.ClientReady, async (c) => {
    log.ok(`đăng nhập ${color.bold(c.user.tag)} · kho ${bot.storeLabel} · ${(await bot.stats()).active} mục`);
    log.info(`trace: ${traceFile()}`);
    await sweepAndNotify(c);
    setInterval(() => sweepAndNotify(c), 60 * 60 * 1000).unref();   // mỗi giờ
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
    // Chỉ tính khi tag đúng TÀI KHOẢN bot. mentions.has() tính cả role bot đang mang,
    // nên nếu có role trùng tên thì mọi lượt ping TA cũng đánh thức bot.
    if (!msg.mentions.users.has(client.user.id)) return;
    const q = stripMentions(msg.content);
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
