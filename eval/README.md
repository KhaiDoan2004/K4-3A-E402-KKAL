# eval/ — bằng chứng & kiểm thử

**Track B2** — bản tin cuối ngày cho TA: gom câu hỏi chưa ai trả lời.

| File | Là gì |
|---|---|
| `dem-discord.py` | **Phương pháp đếm** cho evidence (rubric R1 đòi "kiểm lại được"). Mọi con số trong `canvas.md` ra từ script này |

```bash
python3 eval/dem-discord.py <đường dẫn>/data/discord-pack
```

Data pack **không** commit vào repo này theo quy định bảo mật — script nhận đường dẫn tới bản data của repo đề bài.

## Số hiện tại (baseline, chạy 16/9)

| Chỉ số | Giá trị |
|---|---|
| Câu hỏi của người | 211 / 779 |
| Không có reply trực tiếp | **45 / 211 = 21%** |
| Bot né → có người tiếp nhận | **0 / 27** |
| Chờ khi người trả lời | median 5′ · p75 17′ · max 695′ |
| Bản tin thiếu mục "Học viên đang hỏi gì" | 2 / 4 |
| Độ phủ bản tin 13/09 | 5/32 và 5/37 = **14–16%** |

⚠️ `is_q` là heuristic (dấu `?` hoặc 1 trong 22 cụm hỏi). **Phải chấm tay 30 mẫu đo độ chính xác trước CP4.**

## Sẽ thêm ở các mốc sau
- `golden-set.csv` — ≥20 case, ≥10 case từ `k4_messages.csv`, ≥2 case cho mỗi lớp chỗ khó (CP3)
- `ket-qua-luot-1.md` — bảng chạy trọn bộ có %, đối chiếu quality bar (CP3)
