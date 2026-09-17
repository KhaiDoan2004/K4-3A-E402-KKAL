/**
 * Đăng ký lệnh với Discord. Chạy một lần, và chạy lại mỗi khi đổi tên/mô tả lệnh.
 *   node src/discord/register.js
 */
import { pathToFileURL } from 'node:url';
import { REST, Routes, ApplicationCommandType, ContextMenuCommandBuilder,
         SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { config } from '../config.js';
import { log } from '../util/log.js';

export const commands = [
  new ContextMenuCommandBuilder()
    .setName('Lưu vào kho tri thức')
    .setType(ApplicationCommandType.Message)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  new SlashCommandBuilder()
    .setName('hoi')
    .setDescription('Hỏi bot một câu — bot chỉ trả lời từ kho tri thức đã được trợ giảng duyệt')
    .addStringOption((o) => o.setName('cauhoi').setDescription('Câu hỏi của bạn').setRequired(true)),
  new SlashCommandBuilder()
    .setName('kho')
    .setDescription('Xem kho tri thức đang có bao nhiêu mục'),
].map((c) => c.toJSON());

async function main() {
  const { token, clientId, guildId } = config.discord;
  if (!token || !clientId) throw new Error('Thiếu DISCORD_TOKEN hoặc DISCORD_CLIENT_ID trong .env');

  const rest = new REST({ version: '10' }).setToken(token);
  const route = guildId ? Routes.applicationGuildCommands(clientId, guildId)
                        : Routes.applicationCommands(clientId);
  await rest.put(route, { body: commands });
  log.ok(`đã đăng ký ${commands.length} lệnh ${guildId ? `cho guild ${guildId}` : 'toàn cục (có thể mất tới 1 tiếng để hiện)'}`);
}

// So bằng pathToFileURL, không nối chuỗi — đường dẫn có dấu cách sẽ thành %20 và không khớp.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { log.err(e.message); process.exit(1); });
}
