/** Cosine giữa hai vector đã chuẩn hoá hay chưa đều đúng. */
export function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  const d = Math.sqrt(na) * Math.sqrt(nb);
  return d === 0 ? 0 : dot / d;
}

const STOP = new Set(['của','là','có','không','ko','k','thì','mà','cho','em','anh','chị','bạn',
  'mình','ạ','nhé','nha','với','được','đc','này','đó','ở','và','hay','sao','gì','vào','ra','bị','làm']);

export function tokens(text = '') {
  return String(text).toLowerCase()
    .replace(/[^\p{L}\p{N}\s._/-]+/gu, ' ')
    .split(/\s+/).filter((t) => t.length > 1 && !STOP.has(t));
}

/**
 * Xếp hạng lai: cosine là chính, từ khoá trùng cộng thêm một chút.
 * Lỗi kỹ thuật rất giàu từ khoá đặc trưng (500, cvat, permission denied),
 * nên tín hiệu từ khoá bù đúng chỗ mà embedding hay trượt.
 */
export function rank(queryVec, queryText, entries, { floor = 0.3, topK = 3 } = {}) {
  const qt = new Set(tokens(queryText));
  return entries
    .map((e) => {
      const cos = e.embedding?.length ? cosine(queryVec, e.embedding) : 0;
      const kws = new Set([...(e.keywords || []), ...tokens(e.title)]);
      let hit = 0;
      for (const k of kws) if (qt.has(k)) hit++;
      const boost = Math.min(0.08, hit * 0.02);
      return { ...e, cosine: cos, keywordHits: hit, score: cos + boost };
    })
    .filter((e) => e.score >= floor)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
