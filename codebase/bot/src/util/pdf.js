import fs from 'node:fs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

// pdfjs cảnh báo thiếu DOMMatrix/Path2D khi chạy trên Node — chỉ ảnh hưởng việc
// vẽ ảnh, không ảnh hưởng rút text. Nuốt cảnh báo cho log đỡ rối.
const hush = () => {
  const w = console.warn;
  console.warn = (...a) => { if (!String(a[0]).includes('polyfill')) w(...a); };
};

/** Chữ Đ trong PDF này bị tách thành "Ð " + phần còn lại. Nối lại. */
function fixDiacritics(s) {
  return s.replace(/Ð\s*(?=[A-ZÀ-Ỹ])/g, 'Đ').replace(/Ð\s*(?=[a-zà-ỹ])/g, 'đ');
}

/** Trang bìa lặp cùng một cụm 2-3 lần do hiệu ứng thiết kế. Bỏ cụm lặp liền kề. */
function dedupePhrases(s) {
  const w = s.split(' ');
  for (let len = 12; len >= 3; len--) {
    for (let i = 0; i + len * 2 <= w.length; i++) {
      const a = w.slice(i, i + len).join(' ');
      while (w.slice(i + len, i + len * 2).join(' ') === a) w.splice(i + len, len);
    }
  }
  return w.join(' ');
}

const clean = (s) => dedupePhrases(fixDiacritics(s).replace(/\s+/g, ' ')).trim();

/** Rút text từng trang. Trả về [{ page, text }] — giữ số trang để còn dẫn nguồn. */
export async function readPdf(file) {
  hush();
  const doc = await getDocument({
    data: new Uint8Array(fs.readFileSync(file)),
    useSystemFonts: true,
  }).promise;

  const pages = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const tc = await (await doc.getPage(n)).getTextContent();
    const text = clean(tc.items.map((i) => i.str).join(' '));
    if (text.length > 40) pages.push({ page: n, text });
  }
  return { numPages: doc.numPages, pages };
}

/** Gộp trang quá ngắn vào trang sau, để mỗi khối đủ ngữ cảnh cho LLM. */
export function chunkPages(pages, { min = 600, max = 3500 } = {}) {
  const out = [];
  let buf = null;
  for (const p of pages) {
    if (!buf) { buf = { from: p.page, to: p.page, text: p.text }; continue; }
    if (buf.text.length < min && buf.text.length + p.text.length <= max) {
      buf.text += '\n' + p.text; buf.to = p.page;
    } else { out.push(buf); buf = { from: p.page, to: p.page, text: p.text }; }
  }
  if (buf) out.push(buf);
  return out;
}
