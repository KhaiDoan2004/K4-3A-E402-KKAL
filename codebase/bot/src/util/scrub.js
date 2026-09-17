// Xoá bí mật & PII trước khi đưa nội dung vào LLM hoặc lưu xuống kho.
// Tin nhắn báo lỗi rất hay dính token, API key, đường dẫn máy cá nhân.
// Quy định bảo mật dữ liệu của khoá cũng cấm mang nguyên văn log dài ra ngoài.

const RULES = [
  [/\b(sk|pk|ghp|gho|ghu|ghs|xox[baprs])[-_][A-Za-z0-9_-]{16,}\b/g, '[REDACTED_KEY]'],
  [/\bey[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, '[REDACTED_JWT]'],
  [/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[EMAIL]'],
  // Không cho khớp khi nằm giữa một dãy số dài — ID Discord (snowflake, 17-20 chữ số)
  // từng bị nuốt thành [PHONE], làm hỏng cả mention lẫn link nguồn.
  [/(?<!\d)(?:\+?84|0)(?:\d[ .-]?){8,9}\d(?!\d)/g, '[PHONE]'],
  [/\/(?:Users|home)\/[^\s/\\]+/g, '/$HOME'],
  [/\bC:\\Users\\[^\s\\]+/gi, 'C:\\Users\\$USER'],
  [/\b(?:password|passcode|passwd|mật khẩu|mat khau)\s*[:=]\s*\S+/gi, '$& '.replace(/.*/, '[PASSCODE]')],
  [/\b(?:20\d{8}|\d{8,12})\b(?=\s*(?:mssv|MSSV))/g, '[MSSV]'],
];

/**
 * Bỏ mention và thẻ Discord khỏi nội dung trước khi xử lý.
 * `<@123>` người · `<@&123>` vai trò · `<#123>` kênh · `<a:tên:123>` emoji riêng.
 * Phải chạy TRƯỚC scrub(), nếu không ID sẽ bị nhầm thành số điện thoại.
 */
export function stripMentions(text = '') {
  return String(text)
    .replace(/<a?:(\w+):\d+>/g, ':$1:')
    .replace(/<@[!&]?\d+>/g, '')
    .replace(/<#\d+>/g, '')
    .replace(/@(everyone|here)\b/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function scrub(text = '') {
  let out = String(text);
  for (const [re, to] of RULES) out = out.replace(re, to);
  return out.trim();
}

/** Cắt bớt cho vừa context, giữ đầu và đuôi vì lỗi hay nằm ở cuối log. */
export function clip(text = '', max = 1500) {
  const s = String(text);
  if (s.length <= max) return s;
  const head = Math.floor(max * 0.6), tail = max - head - 20;
  return s.slice(0, head) + '\n…[cắt bớt]…\n' + s.slice(-tail);
}
