import fs from 'node:fs';
import path from 'node:path';

/** Kho lưu trong một file JSON. Không cần cài gì — clone về là chạy. */
export class FileStore {
  constructor(file) { this.file = file; this.entries = []; }

  async connect() {
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    if (fs.existsSync(this.file)) {
      try { this.entries = JSON.parse(fs.readFileSync(this.file, 'utf8')); }
      catch { this.entries = []; }
    }
    return this;
  }

  async close() {}
  #flush() { fs.writeFileSync(this.file, JSON.stringify(this.entries, null, 2), 'utf8'); }

  async all({ status = 'active' } = {}) {
    return status ? this.entries.filter((e) => e.status === status) : [...this.entries];
  }
  async get(id) { return this.entries.find((e) => e.id === id) || null; }
  async findBySourceMessage(messageId) {
    return this.entries.find((e) => e.source?.messageId === messageId) || null;
  }
  async insert(entry) { this.entries.push(entry); this.#flush(); return entry; }
  async update(id, patch) {
    const e = await this.get(id);
    if (!e) return null;
    Object.assign(e, patch, { updatedAt: new Date().toISOString() });
    this.#flush();
    return e;
  }
  async clear() { this.entries = []; this.#flush(); }
  get label() { return `file:${path.basename(this.file)}`; }
}
