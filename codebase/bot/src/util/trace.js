import fs from 'node:fs';
import path from 'node:path';

// Ghi vết mọi lời gọi LLM: prompt vào, phản hồi thô ra.
// Rubric R5 đòi "log/trace trong repo" để xác minh AI được gọi thật, không hardcode.

let dir = null;
let runId = null;

export function initTrace(traceDir, tag = 'run') {
  dir = traceDir;
  fs.mkdirSync(dir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  runId = `${tag}-${ts}`;
  return path.join(dir, `${runId}.jsonl`);
}

export function trace(event) {
  if (!dir) return;
  const line = JSON.stringify({ ts: new Date().toISOString(), runId, ...event });
  fs.appendFileSync(path.join(dir, `${runId}.jsonl`), line + '\n', 'utf8');
}

export const traceFile = () => (dir && runId ? path.join(dir, `${runId}.jsonl`) : null);
