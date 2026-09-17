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
  const onlyGuild  = process.argv.includes('--guild');
  const onlyGlobal = process.argv.includes('--global');

  // Mặc định đăng ký CẢ HAI:
  //  - guild: hiện ngay lập tức, dùng để test
  //  - global: hiện ở mọi server bot được mời, nhưng Discord mất tới 1 tiếng mới lan
  // Chỉ đăng ký guild thì sang server khác sẽ thấy "No Commands Available".
  if (guildId && !onlyGlobal) {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
    log.ok(`guild ${guildId}: ${commands.length} lệnh — hiện ngay`);
  }
  if (!onlyGuild) {
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    log.ok(`toàn cục: ${commands.length} lệnh — mọi server bot được mời, lan trong vòng 1 tiếng`);
  }

  log.info('Bot phải được MỜI vào server thì lệnh mới hiện. Link mời: xem SETUP-DISCORD.md mục 3.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { log.err(e.message); process.exit(1); });
}
