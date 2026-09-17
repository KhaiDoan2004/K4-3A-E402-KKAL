import OpenAI from 'openai';
import { config, requireOpenAI } from '../config.js';
import { trace } from '../util/trace.js';

let _client = null;
function client() {
  requireOpenAI();
  _client ??= new OpenAI({ apiKey: config.openai.apiKey });
  return _client;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function withRetry(label, fn, tries = 3) {
  let last;
  for (let i = 1; i <= tries; i++) {
    try { return await fn(); }
    catch (e) {
      last = e;
      const status = e?.status ?? e?.response?.status;
      // 4xx trừ 429 là lỗi của mình, thử lại vô ích.
      if (status && status !== 429 && status < 500) break;
      if (i < tries) await sleep(400 * 2 ** (i - 1));
    }
  }
  trace({ kind: 'llm_error', label, error: String(last?.message || last) });
  throw last;
}

/** Gọi chat, ép trả JSON. Ghi vết cả prompt vào lẫn phản hồi thô. */
// temperature 0 KHÔNG đảm bảo tất định — đo được: cùng một ca lúc PASS lúc FAIL
// giữa các lượt chạy. Thêm seed cố định để kết quả eval tái lập được (rubric R4).
const SEED = 42;

export async function chatJSON({ system, user, label, temperature = 0 }) {
  const model = config.openai.chatModel;
  const t0 = Date.now();
  const res = await withRetry(label, () =>
    client().chat.completions.create({
      model,
      temperature,
      seed: SEED,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    })
  );
  const raw = res.choices[0]?.message?.content ?? '';
  trace({
    kind: 'llm_chat', label, model, seed: SEED,
    system_fingerprint: res.system_fingerprint,
    prompt: { system, user },
    raw_response: raw,
    usage: res.usage,
    ms: Date.now() - t0,
  });

  let parsed;
  try { parsed = JSON.parse(raw); }
  catch {
    trace({ kind: 'llm_parse_error', label, raw_response: raw });
    throw new Error(`LLM trả về JSON không hợp lệ ở bước "${label}": ${raw.slice(0, 200)}`);
  }
  return { parsed, raw, usage: res.usage, model, ms: Date.now() - t0 };
}

/** Nhúng một hoặc nhiều đoạn text thành vector. */
export async function embed(texts) {
  const arr = Array.isArray(texts) ? texts : [texts];
  const clean = arr.map((t) => String(t ?? '').replace(/\s+/g, ' ').trim() || ' ');
  const model = config.openai.embedModel;
  const t0 = Date.now();
  const res = await withRetry('embed', () =>
    client().embeddings.create({ model, input: clean })
  );
  trace({
    kind: 'llm_embed', model, n: clean.length,
    sample: clean[0].slice(0, 160),
    dims: res.data[0]?.embedding?.length,
    usage: res.usage, ms: Date.now() - t0,
  });
  const vecs = res.data.map((d) => d.embedding);
  return Array.isArray(texts) ? vecs : vecs[0];
}
