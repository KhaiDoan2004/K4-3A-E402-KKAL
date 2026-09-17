import { color } from './log.js';

const LABEL = {
  ANSWER:       { icon: '✅', text: 'Trả lời từ kho', paint: color.green },
  UNCERTAIN:    { icon: '⚠️', text: 'Có thể liên quan — chưa chắc', paint: color.yellow },
  CLARIFY:      { icon: '❓', text: 'Hỏi lại cho rõ', paint: color.cyan },
  OUT_OF_SCOPE: { icon: '🚫', text: 'Ngoài phạm vi', paint: color.red },
  NOT_FOUND:    { icon: '🔍', text: 'Chưa có trong kho', paint: color.gray },
};
export const label = (d) => LABEL[d] ?? { icon: '•', text: d, paint: color.gray };

const daysAgo = (iso) => {
  if (!iso) return null;
  const d = Math.floor((Date.now() - new Date(iso)) / 86400000);
  return d <= 0 ? 'hôm nay' : `${d} ngày trước`;
};

/** Dòng nguồn dưới mỗi câu trả lời — đây chính là chỗ áp HAX G11 và G2. */
export function sourceLine(src, { markdown = false } = {}) {
  if (!src) return '';

  // Mục rút từ tài liệu: dẫn tên tài liệu + số trang, không có tin gốc để nhảy tới.
  if (src.type === 'pdf') {
    const pg = src.pageTo && src.pageTo !== src.page ? `tr. ${src.page}-${src.pageTo}` : `tr. ${src.page}`;
    return `📄 ${src.docName} · ${pg} · tài liệu chính thức, chưa qua trợ giảng duyệt lại`;
  }
  const who = src.savedBy ? `@${src.savedBy}` : 'trợ giảng';
  const when = daysAgo(src.savedAt);
  const life = src.lifespan === 'temp' ? ' · ⏳ thông tin tạm, nên kiểm lại với TA'
             : src.lifespan === 'term' ? ' · gắn với kỳ/phiên bản hiện tại' : '';
  const link = src.jumpUrl ? (markdown ? ` · [xem tin gốc](${src.jumpUrl})` : ` · ${src.jumpUrl}`) : '';
  return `📌 ${who} lưu ${src.savedAt?.slice(0, 10) ?? ''}${when ? ` · ${when}` : ''}${life}${link}`;
}

/** Bản text cho CLI. */
export function renderCli(res) {
  const L = label(res.decision);
  const out = [`${L.icon} ${L.paint(L.text)}  ${color.gray(`(chắc ${(res.confidence * 100).toFixed(0)}% · ${res.meta.ms}ms · kho ${res.meta.kbSize} mục)`)}`, ''];
  out.push(res.answer || color.gray('(trống)'));
  if (res.source) out.push('', color.gray(sourceLine(res.source)));
  if (res.candidates.length) {
    out.push('', color.gray('ứng viên: ' + res.candidates.map((c) => `${c.id.slice(0, 9)}…=${c.score}`).join('  ')));
  }
  out.push(color.gray(`vì sao: ${res.reason}`));
  return out.join('\n');
}
