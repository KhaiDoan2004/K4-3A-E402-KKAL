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
    await this.sweepExpired();
    const res = await decide(this.store, question, opts);
    if (res.source?.id) {
      const e = await this.store.get(res.source.id);
      if (e) await this.store.update(e.id, { stats: { ...e.stats, served: (e.stats?.served || 0) + 1 } });
    }
    return res;
  }

  /**
   * Bấm 👎. Quyền khác nhau thì hậu quả khác nhau:
   *
   *   Học viên  -> ghi khiếu nại + báo TA, mục VẪN dùng được.
   *                Người gặp câu trả lời sai chính là người biết nó sai, nên nút
   *                phải mở cho mọi người (HAX G9, G15). Nhưng một cú click của
   *                một người thì chưa đủ để xoá kiến thức của cả lớp.
   *
   *   TA        -> gỡ khỏi trả lời tự động NGAY, không đợi ai duyệt.
   *                Thà bot nói "chưa có" còn hơn tiếp tục trả lời sai (HAX G10).
   *
   * Một người một phiếu cho mỗi mục — bấm lại không cộng thêm, không báo TA lần nữa.
   */
  async flag(entryId, { by, byId, isTA = false, note } = {}) {
    const e = await this.store.get(entryId);
    if (!e) return null;

    const voters = e.voters ?? { up: [], down: [] };
    const voterKey = byId || by;
    const already = voterKey ? voters.down.includes(voterKey) : false;
    if (!already && voterKey) voters.down = [...voters.down, voterKey];

    const patch = { voters };
    if (!already) patch.stats = { ...e.stats, thumbsDown: (e.stats?.thumbsDown || 0) + 1 };

    if (isTA) {
      patch.status = 'flagged';
      patch.flag = { by: by ?? null, note: note ?? null, at: new Date().toISOString() };
    } else if (!already) {
      patch.reports = [...(e.reports ?? []), { by: by ?? null, note: note ?? null, at: new Date().toISOString() }];
    }

    const updated = await this.store.update(entryId, patch);
    trace({ kind: isTA ? 'flag' : 'report', id: entryId, by, already });

    return {
      entry: updated,
      removed: isTA,                       // TA bấm thì mục bị gỡ ngay
      already,                             // người này đã bấm 👎 mục này trước đó
      notify: e.savedById || e.savedBy,    // TA đã lưu mục này
      reportCount: updated?.reports?.length ?? 0,
    };
  }

  async approve(entryId, { by, byId } = {}) {
    const e = await this.store.get(entryId);
    if (!e) return null;
    const voters = e.voters ?? { up: [], down: [] };
    const voterKey = byId || by;
    const already = voterKey ? voters.up.includes(voterKey) : false;
    if (already) return { entry: e, already: true };
    if (voterKey) voters.up = [...voters.up, voterKey];
    const updated = await this.store.update(entryId, {
      voters, stats: { ...e.stats, thumbsUp: (e.stats?.thumbsUp || 0) + 1 },
    });
    return { entry: updated, already: false };
  }

  /**
   * Hết hạn thì ĐỔI TRẠNG THÁI, không xoá — còn document thì còn audit và rollback.
   * Trả về danh sách vừa đổi để lớp Discord đi báo trợ giảng.
   */
  async sweepExpired() {
    const now = Date.now();
    const swept = [];
    for (const e of await this.store.all({ status: 'active' })) {
      if (!e.expiresAt || new Date(e.expiresAt).getTime() > now) continue;
      const to = e.lifespan === 'temp' ? 'archived' : 'needs_review';
      const updated = await this.store.update(e.id, { status: to, expiredAt: new Date().toISOString() });
      trace({ kind: 'expire', id: e.id, to });
      swept.push({ ...(updated ?? e), status: to });
    }
    return swept;
  }

  /** TA xác nhận mục hết hạn vẫn còn đúng -> dùng lại, gia hạn thêm. */
  async renew(entryId, { by, days = 90 } = {}) {
    const e = await this.store.get(entryId);
    if (!e) return null;
    const upd = await this.store.update(entryId, {
      status: 'active',
      expiresAt: new Date(Date.now() + days * 86400000).toISOString(),
      renewedBy: by ?? null, renewedAt: new Date().toISOString(),
    });
    trace({ kind: 'renew', id: entryId, by, days });
    return upd;
  }

  /** TA quyết định bỏ hẳn mục hết hạn. Vẫn không xoá, chỉ lưu trữ. */
  async retire(entryId, { by } = {}) {
    const e = await this.store.get(entryId);
    if (!e) return null;
    const upd = await this.store.update(entryId, {
      status: 'archived', retiredBy: by ?? null, retiredAt: new Date().toISOString(),
    });
    trace({ kind: 'retire', id: entryId, by });
    return upd;
  }

  /** Các mục đang chờ trợ giảng duyệt lại. */
  async pendingReview() { return this.store.all({ status: 'needs_review' }); }

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
