# codebase/ — prototype

**Mức prototype hiện tại: Working** *(theo `02-guide.md` §3.2)* — từ CP3, bot gọi LLM thật và chạy được trên Discord.

| Thư mục / file | Là gì | Mốc |
|---|---|---|
| **`bot/`** | **Bot Discord chạy thật** — ghim → LLM làm mượt → kho → tra cứu. Xem `bot/README.md` | **CP3** |
| `mock-cp2.html` | Mock bấm được, một file, không cần cài gì — mở thẳng bằng trình duyệt | CP2 |
| `cp2_workflow.html` | Sơ đồ luồng nghiệp vụ (mermaid) | CP2 |

**Lời gọi AI thật nằm ở đâu:** `bot/src/core/decide.js` (quyết định trung tâm) và
`bot/src/core/capture.js` (làm mượt). Trace mọi lượt gọi: `eval/traces/*.jsonl`.
Kết quả kiểm thử lượt 1: `eval/run_results.md` — **25/29 = 86,2%**.

Bản chạy online: https://claude.ai/artifact/RcDFrLhdXG147cFsjPZCzU

## Luồng đã chốt

```
TA trả lời câu hỏi trong #hỏi-đáp
            ↓
     TA thả 📌 lên tin trả lời
            ↓
Bot gộp cặp hỏi–đáp (câu hỏi + tin được ghim)
            ↓
     Gọi LLM "làm mượt" → viết lại thành
     một mục tri thức sạch (triệu chứng → cách sửa)
            ↓
     Lưu vào MongoDB, collection qa_pairs
     {question, answer, source_msg, pinned_by}
            ↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     Học viên khác hỏi lại (bất kỳ lúc nào sau đó)
            ↓
     Bot tìm trong MongoDB (so nghĩa với câu hỏi)
            ↓
      ┌─── có khớp ───┴─── không khớp ───┐
      ↓                                   ↓
 trả lời + link tới               nói rõ "chưa có trong
 tin gốc trên Discord              kho" + tag TA + mở phiếu
      ↓                                   (không đoán bừa)
 [người dùng bấm "Không đúng"]
      ↓
 gắn cờ document, dừng dùng để
 trả lời tự động, đẩy về đúng TA
 đã ghim nó để duyệt lại
```

## Bốn kịch bản bấm được — phủ đủ 4 đường đi trải nghiệm (rubric R3)

| Kịch bản | Gì xảy ra |
|---|---|
| 1 · TA ghim câu trả lời | Bấm nút 📌 dưới hội thoại → chạy pipeline gộp Q+A → LLM làm mượt → lưu Mongo, document mới hiện ngay trong panel kho |
| 2 · Hỏi trùng — có trong kho | Học viên khác hỏi lại ý tương tự → bot tìm thấy document → trả lời kèm link nguồn |
| 3 · Hỏi mới — chưa có | Hỏi điều chưa từng được ghim (Mac M1) → bot nói rõ không có, không đoán → tag TA + mở phiếu |
| 4 · Sửa sai | Bot trả lời theo document cũ nhưng không khớp đúng ca → bấm "Không đúng" → document bị gắn cờ, TA đã ghim nó phải duyệt lại |

## Phần nào mock, phần nào thật *(rubric R5)*

- **Mock:** kết quả tra MongoDB hardcode theo kịch bản · bước "gọi LLM làm mượt" hiện văn bản có sẵn thay vì gọi model thật · kho chỉ có 2 document · sự kiện ghim 📌 là nút bấm, không phải reaction Discord thật.
- **Thật:** mọi tin nhắn lấy nguyên văn từ `k4_messages.csv` — `M12802`, `M07901`, `M39872`, `M23695`, `M54305`.
- **Vì sao ghim phải mock:** data pack có 12 cột và **không có cột reaction/emoji**, nên không lấy được sự kiện ghim thật từ data.

## CP3 sẽ thay gì

Hai bước trong pipeline chuyển từ hardcode sang thật:
1. **Gọi LLM làm mượt** — prompt thật, model thật, thay vì văn bản có sẵn.
2. **Tìm trong MongoDB** — Mongo thật (Atlas hoặc local) với tìm kiếm theo nghĩa, thay vì mảng JS hardcode.

Giữ nguyên toàn bộ luồng: ghim → gộp → làm mượt → lưu → tra cứu → trả lời kèm link / tag TA.

## Nguyên tắc HAX áp ở đâu *(rubric R2)*

| Mã | Áp vào chỗ nào |
|---|---|
| **G10** Thu hẹp phạm vi khi nghi ngờ | Kịch bản 3 — không có document khớp thì nói rõ và tag TA, không đoán |
| **G11** Giải thích vì sao | Thẻ nguồn dưới mỗi câu trả lời: ai hỏi, ai ghim, link tới tin gốc |
| **G9** Sửa dễ dàng | Nút "Không đúng" ngay dưới câu trả lời |
| **G2** Nói rõ làm tốt đến đâu | Bot chỉ trả lời khi có document khớp; không có thì nói thẳng |
