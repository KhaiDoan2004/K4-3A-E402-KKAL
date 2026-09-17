# @botcute — bot ghim tri thức cho Discord khoá 4

Trợ giảng trả lời một câu hỏi rồi **lưu cặp hỏi–đáp đó vào kho**. Lần sau có người hỏi lại,
bot trả lời bằng chính câu trả lời đã được duyệt, **kèm link tới tin gốc**. Không có trong kho
thì nói thẳng là chưa có và tag trợ giảng — không đoán.

## Chạy trong 4 lệnh

```bash
cd codebase/bot
npm install
cp .env.example .env          # điền OPENAI_API_KEY
node src/seed.js --pack "../../../K4-3A-Day05-06-AI-Product-Hackathon/data/discord-pack/k4_messages.csv"
node src/cli.js               # hỏi thử, không cần Discord
```

Chạy bộ kiểm thử:

```bash
cd ../.. && node eval/run_eval.mjs
```

Chạy bot thật trên Discord:

```bash
cd codebase/bot
node src/discord/register.js  # một lần, và mỗi khi đổi tên lệnh
node src/discord/bot.js
```

## Lời gọi AI thật nằm ở đâu

Hai chỗ, đều là API thật, không có nhánh hardcode nào:

| Bước | File | Model | Làm gì |
|---|---|---|---|
| **Làm mượt** | `src/core/capture.js` → `src/llm/prompts.js` `smooth` | `gpt-4o-mini` | Cặp hỏi–đáp thô trên Discord → một mục tri thức sạch, kèm tự phân loại tuổi thọ |
| **Phán quyết** ⭐ | `src/core/decide.js` → `prompts.js` `verdict` | `text-embedding-3-small` + `gpt-4o-mini` | **Quyết định trung tâm**: câu hỏi mới có được trả lời từ kho không, bằng mục nào, chắc bao nhiêu |

Mọi prompt vào và phản hồi thô ra đều ghi xuống `eval/traces/*.jsonl` (`src/util/trace.js`).

## Quyết định trung tâm chạy thế nào

```
câu hỏi mới
   │
   ├─ scrub: xoá key, token, email, đường dẫn máy cá nhân        src/util/scrub.js
   ├─ embed câu hỏi                                    ← API thật
   ├─ xếp hạng lai: cosine + từ khoá trùng → top-3     src/core/similarity.js
   └─ LLM phán quyết trên (câu hỏi + 3 ứng viên)       ← API thật
          │
          ├─ ANSWER        → trả lời + link tin gốc + nút 👍/👎
          ├─ UNCERTAIN     → trả lời kèm cảnh báo + tag TA      (confidence < 0.75)
          ├─ CLARIFY       → hỏi lại đúng thứ còn thiếu          (lớp ② mơ hồ)
          ├─ OUT_OF_SCOPE  → từ chối + chỉ hỏi ai                (lớp ③ ngoài thẩm quyền)
          └─ NOT_FOUND     → "chưa có trong kho" + tag TA        (lớp ① không căn cứ)
```

Ngưỡng số **không** sinh ra nội dung — LLM quyết định, ngưỡng chỉ hạ cấp mức chắc.
Một `NOT_FOUND` không bao giờ được ngưỡng nâng thành `ANSWER`.

## Quality bar

Chốt bằng số trong `src/config.js` → `config.bar`, commit trước hạn 21:00 17/9 (CP4).

| Ngưỡng | Giá trị | Nghĩa |
|---|---:|---|
| `retrieveFloor` | 0.30 | dưới mức này thì mục không được đưa vào danh sách ứng viên |
| `answerFloor` | 0.45 | mục được LLM chọn phải đạt mức này mới cho trả lời thẳng |
| `answer` | 0.75 | LLM confidence từ đây trở lên → trả lời |
| `uncertain` | 0.50 | trong khoảng [0.50, 0.75) → trả lời dè dặt + tag TA |
| `passive` | 0.85 | chế độ bot tự đọc kênh: chỉ lên tiếng khi rất chắc |
| `duplicate` | 0.90 | giống mức này với mục đã có → hỏi TA "thay thế hay lưu riêng" |

## Cấu trúc

```
src/
├── core/            ← thuần, không biết gì về Discord; eval gọi thẳng vào đây
│   ├── decide.js      QUYẾT ĐỊNH TRUNG TÂM
│   ├── capture.js     làm mượt + phát hiện trùng + versioning
│   ├── similarity.js  cosine + xếp hạng lai
│   └── index.js       KnowledgeBot — mặt tiền chung cho bot/CLI/eval
├── llm/             client OpenAI (retry + ghi vết) và toàn bộ prompt
├── store/           FileStore (mặc định) · MongoStore (khi có MONGODB_URI)
├── discord/         bot.js · register.js · ui.js — lớp vỏ mỏng
├── util/            scrub PII · trace JSONL · render · log
├── cli.js           bàn thử không cần Discord
└── seed.js          nạp kho từ cặp hỏi–đáp thật trong data pack
```

Tách `core/` ra là để **bộ eval chạy qua đúng engine mà bot dùng**, không có đường code riêng.

## Lưu trữ

Mặc định lưu `data/kb.json` — clone về là chạy, không cần cài gì.
Đặt `MONGODB_URI` trong `.env` thì tự chuyển sang MongoDB, cùng một giao diện.
Cần Mongo local: `docker compose up -d`.

`data/` bị gitignore vì nội dung dựng từ data pack của khoá — chạy `seed.js` để dựng lại.

## Nguyên tắc HAX áp ở đâu

| Mã | Chỗ cụ thể trong code | Ca kiểm trong golden set |
|---|---|---|
| **G10** Thu hẹp phạm vi khi nghi ngờ | `decide.js` — `NOT_FOUND` / `CLARIFY`; ngưỡng không bao giờ nâng cấp một NOT_FOUND | G02 G03 G05–G08 G27 |
| **G11** Giải thích vì sao | `util/render.js` `sourceLine()` — ai hỏi, TA nào lưu, link tới tin gốc | G01 G14–G25 |
| **G9** Sửa dễ dàng | nút 👎 → `core/index.js` `flag()` gỡ mục khỏi trả lời tự động ngay; nút ✏️ Sửa mở modal trước khi lưu | G28 |
| **G2** Nói rõ làm tốt đến đâu | mức chắc ở footer embed; nhãn ⏳ cho mục tạm thời; tuổi thông tin trong dòng nguồn | G04 |
| **G8** Gạt bỏ dễ dàng | bản nháp là ephemeral, chỉ TA thấy; chế độ passive chỉ thả reaction, không chen tin vào kênh | — |

## Phần nào thật, phần nào chưa

- **Thật:** cả hai lời gọi LLM · embedding · lưu trữ · versioning · scrub PII · toàn bộ luồng Discord (context menu, modal, nút, thread).
- **Chưa làm (cố ý, ghi trong spec là non-goal):** chế độ passive đọc cả kênh (mới có sẵn ngưỡng, chưa bật) · bot chủ động gợi ý lưu · rà soát định kỳ mục hết hạn (mới có đổi trạng thái tự động, chưa có nhắc TA).
