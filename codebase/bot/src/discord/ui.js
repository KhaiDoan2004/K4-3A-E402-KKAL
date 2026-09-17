import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
         ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { sourceLine } from '../util/render.js';

const HUE = {
  ANSWER: 0x2dd4a7, UNCERTAIN: 0xf0b429, CLARIFY: 0x4f9cf5,
  OUT_OF_SCOPE: 0xef5350, NOT_FOUND: 0x8d9499, DRAFT: 0x7c5cff,
};
const LIFE = {
  long: '🟢 Lâu dài', term: '🟡 Theo kỳ', temp: '🔴 Tạm thời',
};
const cut = (s, n) => (s && s.length > n ? s.slice(0, n - 1) + '…' : s || '—');

/** Bản nháp TA duyệt trước khi vào kho — HAX G9, và để TA verify đúng thứ sắp được lưu. */
export function draftEmbed(draft, duplicate) {
  const e = new EmbedBuilder()
    .setColor(HUE.DRAFT)
    .setTitle('📝 Bản nháp — chưa lưu')
    .setDescription(cut(draft.title, 250))
    .addFields(
      { name: 'Câu hỏi', value: cut(draft.question, 900) },
      { name: 'Cách xử lý', value: cut(draft.answer, 1024) },
      { name: 'Chủ đề', value: draft.topic, inline: true },
      { name: 'Loại', value: LIFE[draft.lifespan] ?? draft.lifespan, inline: true },
      { name: 'Hết hạn', value: draft.expiresAt ? draft.expiresAt.slice(0, 10) : 'không', inline: true },
    )
    .setFooter({ text: `${draft.lifespanReason || ''}`.slice(0, 200) || 'LLM đã tự đoán loại — sửa được bằng nút bên dưới' });

  if (duplicate) {
    e.addFields({
      name: '🔍 Kho đã có mục tương tự',
      value: `**${cut(duplicate.title, 180)}**\nTA \`${duplicate.savedBy}\` lưu ${duplicate.savedAt?.slice(0, 10)} · đã dùng ${duplicate.stats?.served ?? 0} lượt · giống ${(duplicate.score * 100).toFixed(0)}%`,
    });
  }
  return e;
}

export function draftButtons(key, duplicate) {
  const rows = [new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`save:${key}`).setLabel('Lưu').setEmoji('✅').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`edit:${key}`).setLabel('Sửa').setEmoji('✏️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`life:${key}:term`).setLabel('Theo kỳ').setEmoji('🟡').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`life:${key}:temp`).setLabel('Tạm thời').setEmoji('🔴').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`discard:${key}`).setLabel('Bỏ').setEmoji('❌').setStyle(ButtonStyle.Danger),
  )];
  if (duplicate) {
    rows.push(new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`replace:${key}:${duplicate.id}`)
        .setLabel('Thay thế bản cũ').setEmoji('🔄').setStyle(ButtonStyle.Primary),
    ));
  }
  return rows;
}

export function editModal(key, draft) {
  return new ModalBuilder().setCustomId(`modal:${key}`).setTitle('Sửa mục tri thức')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('title').setLabel('Tiêu đề')
          .setStyle(TextInputStyle.Short).setValue(cut(draft.title, 100)).setMaxLength(120)),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('answer').setLabel('Cách xử lý')
          .setStyle(TextInputStyle.Paragraph).setValue(cut(draft.answer, 3900)).setRequired(true)),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('keywords').setLabel('Từ khoá (cách nhau bằng dấu phẩy)')
          .setStyle(TextInputStyle.Short).setValue(cut(draft.keywords.join(', '), 100)).setRequired(false)),
    );
}

const HEAD = {
  ANSWER: '✅ Có trong kho',
  UNCERTAIN: '⚠️ Có thể liên quan — mình chưa chắc',
  CLARIFY: '❓ Cho mình hỏi thêm',
  OUT_OF_SCOPE: '🚫 Ngoài phạm vi của mình',
  NOT_FOUND: '🔍 Chưa có trong kho',
};

export function answerEmbed(res, { taMention } = {}) {
  const e = new EmbedBuilder()
    .setColor(HUE[res.decision] ?? HUE.NOT_FOUND)
    .setTitle(HEAD[res.decision] ?? res.decision)
    .setDescription(cut(res.answer, 3800));

  if (res.source) e.addFields({ name: 'Nguồn', value: sourceLine(res.source, { markdown: true }) });
  if (res.decision === 'UNCERTAIN' && taMention)
    e.addFields({ name: 'Nhờ xác nhận', value: `${taMention} xem giúp câu này với ạ.` });
  if ((res.decision === 'NOT_FOUND' || res.decision === 'CLARIFY') && taMention && res.decision === 'NOT_FOUND')
    e.addFields({ name: 'Đã báo trợ giảng', value: `${taMention} — câu này chưa có trong kho.` });

  e.setFooter({ text: `mức chắc ${(res.confidence * 100).toFixed(0)}% · kho ${res.meta.kbSize} mục · ${res.meta.ms}ms` });
  return e;
}

export function answerButtons(res) {
  if (!res.source) return [];
  return [new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`up:${res.source.id}`).setLabel('Đúng rồi').setEmoji('👍').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`down:${res.source.id}`).setLabel('Không đúng').setEmoji('👎').setStyle(ButtonStyle.Danger),
  )];
}
