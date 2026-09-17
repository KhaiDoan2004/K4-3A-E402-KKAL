import { MongoClient } from 'mongodb';

/** Cùng một giao diện với FileStore, nhưng nằm trên MongoDB. */
export class MongoStore {
  constructor(uri, dbName) { this.uri = uri; this.dbName = dbName; }

  async connect() {
    this.client = new MongoClient(this.uri);
    await this.client.connect();
    this.col = this.client.db(this.dbName).collection('qa_pairs');
    // Ghim hai lần cùng một tin nhắn vẫn chỉ ra một mục.
    await this.col.createIndex({ 'source.messageId': 1 }, { unique: true, sparse: true });
    await this.col.createIndex({ status: 1 });
    await this.col.createIndex({ topic: 1 });
    await this.col.createIndex({ expiresAt: 1 });
    return this;
  }

  async close() { await this.client?.close(); }

  async all({ status = 'active' } = {}) {
    return this.col.find(status ? { status } : {}).toArray();
  }
  async get(id) { return this.col.findOne({ id }); }
  async findBySourceMessage(messageId) { return this.col.findOne({ 'source.messageId': messageId }); }
  async insert(entry) { await this.col.insertOne({ ...entry }); return entry; }
  async update(id, patch) {
    const r = await this.col.findOneAndUpdate(
      { id },
      { $set: { ...patch, updatedAt: new Date().toISOString() } },
      { returnDocument: 'after' }
    );
    return r?.value ?? r ?? null;
  }
  async clear() { await this.col.deleteMany({}); }
  get label() { return `mongo:${this.dbName}.qa_pairs`; }
}
