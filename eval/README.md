# eval/ — bằng chứng & kiểm thử

**Track B2** — ghim tri thức sau khi gỡ xong sự cố kỹ thuật.

| File | Là gì |
|---|---|
| `dem-discord.py` | **Phương pháp đếm** cho evidence (rubric R1 đòi "kiểm lại được"). Mọi con số trong `canvas.md` ra từ script này |

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
| Bot né → có người tiếp nhận | **0 / 27** |
| Câu hỏi không có reply trực tiếp | 45 / 211 = 21% |
| Nhóm câu hỏi trùng gần đúng | 10 nhóm / 21 tin |

## ⚠️ Hai hạn chế phải nhớ khi xây golden set

1. **Pack không có cột reaction/emoji** — 12 cột, không có reaction. Sự kiện ghim 📌 **phải dựng fixture**, khai rõ là mock trong spec §4.
2. `is_q` là heuristic (dấu `?` hoặc 1 trong 22 cụm hỏi). **Chấm tay 30 mẫu đo độ chính xác trước CP4.**
3. n nhỏ (19 tin / 7 người, 3 ngày) → **bắt buộc bù bằng khảo sát ≥20 người** (chuẩn A) trước CP4.

## Sẽ thêm ở các mốc sau
- `golden-set.csv` — ≥20 case, ≥10 case từ `k4_messages.csv`, ≥2 case cho mỗi lớp chỗ khó (CP3)
- `ket-qua-luot-1.md` — bảng chạy trọn bộ có %, đối chiếu quality bar (CP3)
