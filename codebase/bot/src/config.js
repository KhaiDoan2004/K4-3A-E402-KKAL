import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
// Nạp .env theo vị trí file này, không theo thư mục đang đứng —
// nhờ vậy chạy `node eval/run_eval.mjs` từ gốc repo vẫn thấy key.
dotenv.config({ path: path.resolve(here, '..', '.env') });
const abs = (p) => (path.isAbsolute(p) ? p : path.resolve(here, '..', p));

export const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    chatModel: process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini',
    embedModel: process.env.OPENAI_EMBED_MODEL || 'text-embedding-3-small',
  },
  discord: {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.DISCORD_CLIENT_ID,
    guildId: process.env.DISCORD_GUILD_ID,
    allowedChannels: (process.env.DISCORD_ALLOWED_CHANNELS || '')
      .split(',').map((s) => s.trim()).filter(Boolean),
    taRoleId: process.env.DISCORD_TA_ROLE_ID || '',
    reviewChannelId: process.env.DISCORD_REVIEW_CHANNEL_ID || '',
  },
  store: {
    mongoUri: process.env.MONGODB_URI || '',
    mongoDb: process.env.MONGODB_DB || 'botcute',
    kbFile: abs(process.env.KB_FILE || './data/kb.json'),
  },
  traceDir: abs(process.env.TRACE_DIR || '../../eval/traces'),

  // ─────────────────────────────────────────────────────────────────
  // QUALITY BAR — chốt bằng số, commit trước 21:00 17/9 (CP4).
  // Sau mốc đó không sửa. Mọi ngưỡng quyết định nằm gọn ở đây.
  // ─────────────────────────────────────────────────────────────────
  bar: {
    // Cosine tối thiểu để một mục được đưa vào danh sách ứng viên cho LLM.
    retrieveFloor: 0.30,
    // Số ứng viên tối đa đưa cho LLM phán quyết.
    topK: 3,
    // LLM confidence >= mức này -> trả lời thẳng.
    answer: 0.75,
    // LLM confidence trong [uncertain, answer) -> trả lời kèm cảnh báo + tag TA.
    uncertain: 0.50,
    // Cosine tối thiểu của mục được LLM chọn thì mới cho phép trả lời thẳng.
    answerFloor: 0.45,
    // Chế độ passive (bot tự đọc kênh, không bị tag): chỉ lên tiếng khi rất chắc.
    passive: 0.85,
    // Coi là trùng nghĩa với mục đã có -> hỏi TA "thay thế hay lưu riêng".
    duplicate: 0.90,
  },
};

export function requireOpenAI() {
  if (!config.openai.apiKey) {
    throw new Error(
      'Thiếu OPENAI_API_KEY.\n' +
      '  cp codebase/bot/.env.example codebase/bot/.env  rồi điền key vào.'
    );
  }
}
