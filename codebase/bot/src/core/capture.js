import crypto from 'node:crypto';
import { chatJSON, embed } from '../llm/client.js';
import { smooth } from '../llm/prompts.js';
import { scrub, clip, stripMentions } from '../util/scrub.js';
import { trace } from '../util/trace.js';
import { config } from '../config.js';
import { rank } from './similarity.js';

const DAY = 86400000;
const EXPIRY = { long: null, term: 90, temp: 7 };

/**
 * Bước 1 của luồng: TA lưu một cặp hỏi–đáp.
 * Q + A thô  ->  LLM làm mượt  ->  mục tri thức có embedding, chưa ghi xuống kho.
 * Trả về bản NHÁP để TA duyệt trước, đúng tinh thần HAX G9.
 */
export async function draftEntry({ question, answer, meta = {} }) {
  const q = clip(scrub(stripMentions(question)), 1200);
  const a = clip(scrub(stripMentions(answer)), 3000);
  if (!q || !a) throw new Error('Thiếu câu hỏi hoặc câu trả lời.');

  const { parsed } = await chatJSON({
    label: 'smooth',
    system: smooth.system,
    user: smooth.user({ question: q, answer: a, meta }),
  });

  const now = new Date();
  const life = ['long', 'term', 'temp'].includes(parsed.lifespan) ? parsed.lifespan : 'long';
  const days = EXPIRY[life];

  const draft = {
    id: `qa_${crypto.randomBytes(6).toString('hex')}`,
    title: String(parsed.title || '').slice(0, 120),
    question: parsed.question || q,
    answer: parsed.answer || '',
    answerRaw: a,                       // giữ bản gốc để đối chiếu khi LLM làm sai
    questionRaw: q,
    topic: parsed.topic || 'khac',
    keywords: (parsed.keywords || []).map((k) => String(k).toLowerCase()),
    lifespan: life,
    lifespanReason: parsed.lifespan_reason || '',
    expiresAt: days ? new Date(now.getTime() + days * DAY).toISOString() : null,
    status: 'active',
    version: 1,
    supersededBy: null,
    previousVersion: null,
    source: {
      guildId: meta.guildId ?? null,
      channelId: meta.channelId ?? null,
      messageId: meta.answerMsgId ?? null,
      questionMessageId: meta.questionMsgId ?? null,
      jumpUrl: meta.jumpUrl ?? null,
    },
    askedBy: meta.askedBy ?? null,
    savedBy: meta.savedBy ?? null,
    savedById: meta.savedById ?? null,     // id Discord thật, để ping đúng người khi bị báo sai
    voters: { up: [], down: [] },
    reports: [],
    savedAt: now.toISOString(),
    updatedAt: now.toISOString(),
    stats: { served: 0, thumbsUp: 0, thumbsDown: 0 },
  };

  draft.embedding = await embed(`${draft.title}\n${draft.question}\n${draft.keywords.join(' ')}`);
  trace({ kind: 'capture_draft', id: draft.id, title: draft.title, lifespan: life });
  return draft;
}

/** Tìm mục đã có gần trùng, để hỏi TA "thay thế hay lưu riêng" thay vì âm thầm tạo bản sao. */
export async function findDuplicate(store, draft) {
  const entries = await store.all({ status: 'active' });
  const near = rank(draft.embedding, `${draft.title} ${draft.question}`, entries, {
    floor: config.bar.duplicate, topK: 1,
  });
  return near[0] || null;
}

/** TA bấm Lưu. `replaces` có giá trị thì bản cũ chuyển sang superseded, không xoá. */
export async function commitEntry(store, draft, { replaces = null } = {}) {
  if (replaces) {
    const old = await store.get(replaces);
    if (old) {
      draft.version = (old.version || 1) + 1;
      draft.previousVersion = old.id;
      await store.update(old.id, { status: 'superseded', supersededBy: draft.id });
    }
  }
  await store.insert(draft);
  trace({ kind: 'capture_commit', id: draft.id, replaces, version: draft.version });
  return draft;
}
