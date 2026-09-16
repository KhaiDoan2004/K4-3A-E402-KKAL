# codebase/ — prototype

**Mức prototype hiện tại: Sketch** *(theo `02-guide.md` §3.2)*

| File | Là gì | Mốc |
|---|---|---|
| `mock-cp2.html` | Mock bấm được, một file, không cần cài gì — mở thẳng bằng trình duyệt | CP2 |

Bản chạy online: https://claude.ai/artifact/RcDFrLhdXG147cFsjPZCzU

## Luồng trong mock

```
VÒNG NẠP (TA)                      VÒNG TRUY HỒI (học viên) ← demo chính
TA thấy ca đã gỡ xong              Học viên hỏi lỗi kỹ thuật
      ↓                                    ↓
TA bấm 📌 ghim ca                  AI so với kho mục đã ghim
      ↓                                    ↓
AI tóm tắt → mục KB-02      ┌─ khớp ≥0,75 ─┴─ dưới ngưỡng ─┐
      ↓                     ↓                              ↓
chờ TA duyệt          trả lời + link ca gốc         hỏi lại / tag TA + phiếu
                            ↓
                      [Không đúng] → gắn cờ mục, chuyển TA duyệt lại
```

## Bốn đường đi trải nghiệm — bấm thử được cả bốn

| Kịch bản | Câu hỏi | AI quyết định | Kết quả |
|---|---|---|---|
| 1 · Khớp chắc | *"docker compose up -d xong mà health check báo 500"* | 0,91 ≥ 0,75 | Trả lời + dẫn ca gốc `M12802` |
| 2 · Khớp mờ | *"em bị lỗi 500 ạ"* | 0,54 — hai ứng viên sát nhau | Hỏi lại đúng một câu |
| 3 · Không khớp | *"máy em Mac M1 thì cài được không"* | 0,18 | Tag TA + mở phiếu có trạng thái |
| 4 · Sửa sai | như kịch bản 1, bấm *"Không đúng"* | — | Gắn cờ mục, dừng tự trả lời, TA duyệt lại |

## Phần nào mock, phần nào thật *(rubric R5)*

- **Mock:** điểm khớp hardcode theo kịch bản · kho chỉ có 2 mục · nút 📌 thay cho reaction Discord thật.
- **Thật:** mọi tin nhắn lấy nguyên văn từ `k4_messages.csv` — `M12802`, `M07901`, `M30675`, `M39872`, `M54305`.
- **Vì sao ghim phải mock:** data pack có 12 cột và **không có cột reaction/emoji**, nên không lấy được sự kiện ghim thật.

## CP3 sẽ thay gì

Bước **2 và 3** trong bảng quyết định (nhúng câu hỏi → chấm điểm khớp) thay bằng lời gọi model thật. Phần còn lại giữ nguyên. Ngưỡng 0,75 là giá trị nháp — **chốt bằng số thật trong `spec.md` trước 21:00 17/9** rồi không đổi nữa.

## Nguyên tắc HAX áp ở đâu *(rubric R2)*

| Mã | Áp vào chỗ nào |
|---|---|
| **G10** Thu hẹp phạm vi khi nghi ngờ | Kịch bản 2 — 0,54 thì hỏi lại, không chọn bừa |
| **G11** Giải thích vì sao | Thẻ nguồn dưới mỗi câu trả lời + bảng điểm khớp bên phải |
| **G9** Sửa dễ dàng | Nút "Không đúng" ngay dưới câu trả lời |
| **G2** Nói rõ làm tốt đến đâu | Bot nói mức chắc chắn trước khi trả lời |
