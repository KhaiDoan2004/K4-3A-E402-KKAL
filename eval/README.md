# eval/ — bằng chứng & kiểm thử

**Track B2** — ghim tri thức sau khi gỡ xong sự cố kỹ thuật.

| File | Là gì | Mốc |
|---|---|---|
| `dem-discord.py` | **Phương pháp đếm** cho evidence (rubric R1 đòi "kiểm lại được"). Mọi con số trong `canvas.md` ra từ script này | CP1 |
| `golden_set.json` | **29 ca kiểm thử**, phân loại theo 4 lớp chỗ khó. Khai luôn cách chấm ở khoá `grading` | CP3 |
| `run_eval.mjs` | Chạy trọn bộ qua **đúng engine** bot Discord dùng (`codebase/bot/src/core`), sinh `run_results.md` | CP3 |
| `run_results.md` | Bảng kết quả **tự sinh** — đừng sửa tay, chạy lại để cập nhật | CP3 |
| `analysis.md` | Phân tích nguyên nhân do nhóm viết, được nối vào cuối `run_results.md` | CP3 |
| `traces/*.jsonl` | **Ghi vết mọi lời gọi LLM**: prompt vào + phản hồi thô ra (rubric R5) | CP3 |

```bash
python3 eval/dem-discord.py <đường dẫn>/data/discord-pack
```

Data pack **không** commit vào repo này theo quy định bảo mật — script nhận đường dẫn tới bản data của repo đề bài.

## Baseline (chạy 16/9)

| Chỉ số | Giá trị |
|---|---|
| Tin nhắc CVAT/Docker | 19 tin / 7 người |
| **Lượt hướng dẫn cài đặt gõ lại từ đầu** | **2 lượt cùng ngày 13/09, 2 người khác nhau, 12 tin** |
| Lượt 1 · D6587 | 10:26 → 10:35 · 5 tin · 9 phút |
| Lượt 2 · D2012 | 22:59 → 23:23 · 7 tin · 24 phút |
| Bot né → có người tiếp nhận | **0 / 29** |
| Câu hỏi không có reply trực tiếp | 50 / 245 = 20% |
| Nhóm câu hỏi trùng gần đúng | 10 nhóm / 21 tin |

## ⚠️ Hai hạn chế phải nhớ khi xây golden set

1. **Pack không có cột reaction/emoji** — 12 cột, không có reaction. Sự kiện ghim 📌 **phải dựng fixture**, khai rõ là mock trong spec §4.
2. `is_q` là heuristic (dấu `?` hoặc 1 trong 22 cụm hỏi). **Chấm tay 30 mẫu đo độ chính xác trước CP4.**
3. n nhỏ (19 tin / 7 người, 3 ngày) → **bắt buộc bù bằng khảo sát ≥20 người** (chuẩn A) trước CP4.

## Kiểm thử (CP3)

```bash
cd codebase/bot && npm install
cp .env.example .env                 # điền OPENAI_API_KEY
node src/seed.js --pack <…>/data/discord-pack/k4_messages.csv --reset
cd ../.. && node eval/run_eval.mjs
```

| Lượt | Bộ | Kho | Đạt | Thước nghiêm |
|---|---|---|---|---|
| 1 | v1.0 · 29 ca | 14 mục | 25/29 = **86,2%** | 23/29 = 79,3% |
| 2 | v1.1 · 41 ca | 20 mục | 32/41 = **78,0%** | 30/41 = 73,2% |

Lượt 2 thấp hơn **không phải vì bot kém đi**: trên đúng 29 ca của lượt 1, bot giữ y nguyên
25/29 = 86,2%. Phần tụt đến từ 12 ca mới cố ý khó hơn (58,3%). Chi tiết: `analysis.md`.

Kết quả lượt 1 (**25/29 = 86,2%**) giữ ở bảng §7 `spec.md` + trace gốc; file kết quả riêng của lượt 1 đã gỡ
để repo chỉ còn **một** bảng kết quả hiện hành.

Thành phần golden set so với chuẩn R4:

| Yêu cầu | Chuẩn | v1.0 | v1.1 |
|---|---|---|---|
| Tổng số ca | ≥20 | 29 | **41** |
| Mỗi lớp chỗ khó | ≥2 | ①4 ②4 ③5 ④4 | **①7 ②6 ③7 ④8** |
| Ca thường gặp | 8–10 | 8 | 8 |
| Ca hiếm | 2–4 | 4 | 5 |
| Lấy từ chatlog thật | ≥10 | 17 | **27** |

## ⚠️ `temperature: 0` không đảm bảo tất định

Phát hiện ở lượt 2: hai lần chạy liên tiếp ra 31/41 rồi 32/41. Đã vá bằng `seed: 42` cố định
trong `codebase/bot/src/llm/client.js`, và ghi `system_fingerprint` vào trace. Sau khi vá,
hai lượt đầy đủ đều ra 32/41. **Chạy lại để đối chiếu thì phải dùng đúng seed đó.**

Quality bar bằng số nằm ở `codebase/bot/src/config.js` → `config.bar`.

## Nguyên tắc trung thực

Kỳ vọng từng ca (`expect`) và luật chấm (`grading`, gồm cả `also_ok`) được khai **trước khi chạy**
và **không sửa sau khi thấy kết quả**. Bốn ca trượt ở lượt 1 giữ nguyên trong báo cáo kèm phân tích
nguyên nhân; hướng sửa ghi rõ là **chưa áp dụng**, để dành cho lượt 2.
