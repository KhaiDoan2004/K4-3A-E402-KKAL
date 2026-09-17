import { embed, chatJSON } from '../llm/client.js';
import { verdict } from '../llm/prompts.js';
import { rank } from './similarity.js';
import { scrub, clip, stripMentions } from '../util/scrub.js';
import { config } from '../config.js';
import { trace } from '../util/trace.js';

/**
 * ─── QUYẾT ĐỊNH TRUNG TÂM ───────────────────────────────────────────
 * Không có câu trả lời nào được gán cứng ở đây.
 *
 *   1. Nhúng câu hỏi bằng model thật.
 *   2. Xếp hạng lai cosine + từ khoá -> lấy top-K ứng viên.
 *   3. Đưa câu hỏi + ứng viên cho LLM phán quyết.
 *   4. Ngưỡng số (config.bar) chỉ dùng để phân MỨC CHẮC, không tự bịa nội dung.
 *
 * Trả về một trong: ANSWER · UNCERTAIN · CLARIFY · OUT_OF_SCOPE · NOT_FOUND
 * ────────────────────────────────────────────────────────────────────
 */
export async function decide(store, rawQuestion, { mode = 'mention' } = {}) {
  const t0 = Date.now();
  const question = clip(scrub(stripMentions(rawQuestion)), 1200);
  if (!question) {
    return final({ decision: 'CLARIFY', confidence: 1, answer: 'Bạn nhắn câu hỏi giúp mình nhé.', reason: 'câu hỏi rỗng' }, [], mode, t0);
  }

  const entries = await store.all({ status: 'active' });
  const qVec = await embed(question);
  const candidates = rank(qVec, question, entries, {
    floor: config.bar.retrieveFloor,
    topK: config.bar.topK,
  });

  const { parsed } = await chatJSON({
    label: 'verdict',
    system: verdict.system,
    user: verdict.user({ question, candidates }),
  });

  return final(parsed, candidates, mode, t0, entries.length);
}

function final(parsed, candidates, mode, t0, kbSize = 0) {
  const bar = config.bar;
  let decision = String(parsed.decision || 'NOT_FOUND').toUpperCase();
  const confidence = clamp01(Number(parsed.confidence ?? 0));
  const sourceId = parsed.source_id || null;
  const source = candidates.find((c) => c.id === sourceId) || null;
  const topScore = candidates[0]?.score ?? 0;

  // Ngưỡng chỉ hạ cấp mức chắc, không bao giờ nâng cấp một NOT_FOUND thành ANSWER.
  if (decision === 'ANSWER') {
    const srcScore = source?.score ?? 0;
    if (!source) decision = 'NOT_FOUND';
    else if (confidence < bar.uncertain || srcScore < bar.retrieveFloor) decision = 'NOT_FOUND';
    else if (confidence < bar.answer || srcScore < bar.answerFloor) decision = 'UNCERTAIN';
  }

  // Chế độ passive: bot tự đọc kênh chứ không bị tag -> chỉ lên tiếng khi rất chắc.
  const speak = mode !== 'passive' || (decision === 'ANSWER' && confidence >= bar.passive);

  const out = {
    decision, confidence, speak, mode,
    answer: String(parsed.answer || '').trim(),
    reason: String(parsed.reason || '').trim(),
    source: source && {
      id: source.id, title: source.title, savedBy: source.savedBy,
      savedAt: source.savedAt, lifespan: source.lifespan,
      trust: source.trust ?? 'ta',
      type: source.source?.type ?? 'discord',
      docName: source.source?.docName ?? null,
      page: source.source?.page ?? null,
      pageTo: source.source?.pageTo ?? null,
      jumpUrl: source.source?.jumpUrl ?? null, score: round(source.score),
    },
    candidates: candidates.map((c) => ({ id: c.id, title: c.title, score: round(c.score), cosine: round(c.cosine), keywordHits: c.keywordHits })),
    meta: { kbSize, topScore: round(topScore), ms: Date.now() - t0 },
  };
  trace({ kind: 'decision', decision, confidence, sourceId: out.source?.id ?? null, topScore: out.meta.topScore, ms: out.meta.ms });
  return out;
}

const clamp01 = (n) => (Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0);
const round = (n) => Math.round(n * 1000) / 1000;
