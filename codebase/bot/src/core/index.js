import { openStore } from '../store/index.js';
import { draftEntry, findDuplicate, commitEntry } from './capture.js';
import { decide } from './decide.js';
import { trace } from '../util/trace.js';

/** Mặt tiền gọn cho cả bot Discord, CLI và bộ eval dùng chung một engine. */
export class KnowledgeBot {
  static async open() { return new KnowledgeBot(await openStore()); }
  constructor(store) { this.store = store; }
  async close() { await this.store.close(); }
  get storeLabel() { return this.store.label; }

  /** TA lưu một cặp hỏi–đáp -> bản nháp + cảnh báo trùng. Chưa ghi xuống kho. */
  async draft(input) {
    const draft = await draftEntry(input);
    const duplicate = await findDuplicate(this.store, draft);
    return { draft, duplicate };
  }

  /** TA bấm Lưu (hoặc Thay thế bản cũ). */
  async commit(draft, opts) { return commitEntry(this.store, draft, opts); }

  /** Học viên hỏi -> quyết định trung tâm. */
  async ask(question, opts) {
    await this.#sweepExpired();
    const res = await decide(this.store, question, opts);
    if (res.source?.id) {
      const e = await this.store.get(res.source.id);
      if (e) await this.store.update(e.id, { stats: { ...e.stats, served: (e.stats?.served || 0) + 1 } });
    }
    return res;
  }

  /**
   * Người dùng bấm 👎. Gỡ mục khỏi trả lời tự động NGAY, không đợi TA duyệt.
   * Thà bot nói "chưa có" còn hơn tiếp tục trả lời sai (HAX G10).
   */
  async flag(entryId, { by, note } = {}) {
    const e = await this.store.get(entryId);
    if (!e) return null;
    const updated = await this.store.update(entryId, {
      status: 'flagged',
      stats: { ...e.stats, thumbsDown: (e.stats?.thumbsDown || 0) + 1 },
      flag: { by: by ?? null, note: note ?? null, at: new Date().toISOString() },
    });
    trace({ kind: 'flag', id: entryId, by });
    return { entry: updated, notify: e.savedBy };
  }

  async approve(entryId, { by } = {}) {
    const e = await this.store.get(entryId);
    if (!e) return null;
    return this.store.update(entryId, {
      stats: { ...e.stats, thumbsUp: (e.stats?.thumbsUp || 0) + 1 },
    });
  }

  /** Hết hạn thì ĐỔI TRẠNG THÁI, không xoá — còn document thì còn audit và rollback. */
  async #sweepExpired() {
    const now = Date.now();
    for (const e of await this.store.all({ status: 'active' })) {
      if (!e.expiresAt || new Date(e.expiresAt).getTime() > now) continue;
      const to = e.lifespan === 'temp' ? 'archived' : 'needs_review';
      await this.store.update(e.id, { status: to });
      trace({ kind: 'expire', id: e.id, to });
    }
  }

  async stats() {
    const all = await this.store.all({ status: null });
    const by = (s) => all.filter((e) => e.status === s).length;
    return {
      total: all.length, active: by('active'), flagged: by('flagged'),
      superseded: by('superseded'), needsReview: by('needs_review'), archived: by('archived'),
    };
  }
}

export { decide };
