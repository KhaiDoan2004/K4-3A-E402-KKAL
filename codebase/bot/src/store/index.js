import { config } from '../config.js';
import { FileStore } from './fileStore.js';
import { MongoStore } from './mongoStore.js';

/**
 * Có MONGODB_URI thì dùng Mongo, không thì lưu file JSON.
 * Giữ hai backend để máy nào cũng chạy được ngay, kể cả máy của TA chấm bài.
 */
export async function openStore() {
  const { mongoUri, mongoDb, kbFile } = config.store;
  const store = mongoUri ? new MongoStore(mongoUri, mongoDb) : new FileStore(kbFile);
  await store.connect();
  return store;
}
