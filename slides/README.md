# Nguồn của `demo-slides.pdf`

| File | Là gì |
|---|---|
| `demo-slides.html` | bản gốc 6 trang — sửa ở đây rồi xuất lại PDF |
| `bg.png` | nền lấy từ *Discord Template.pptx* (Slidechef) |
| `demo-goc-truoc.png` · `demo-goc-sau.png` | **ảnh chụp gốc** luồng thật 17/09/2026, chưa cắt |
| `demo-truoc.png` · `demo-sau.png` | bản đã cắt, dùng trên trang 3 |

Bảng màu, font và bố cục theo template: nền `#0C0F43`, accent `#9BE6F3`,
font **Montserrat · Roboto · Roboto Mono · Special Gothic Expanded One**.

## Sáu trang

1. Bối cảnh, bài toán, bằng chứng chuẩn A/B
2. Lát cắt một câu + kiến trúc tổng quan + non-goals
3. 4 lớp chỗ khó + demo thật trước/sau khi Lab Coach lưu
4. Bảng đo đối chiếu Quality Bar khoá tại CP4
5. Bài học từ thất bại + phản hồi người dùng (R6)
6. Kế hoạch mở rộng + đóng góp từng thành viên

## Xuất lại PDF

```bash
cd "<gốc repo>"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --no-pdf-header-footer \
  --virtual-time-budget=25000 --run-all-compositor-stages-before-draw \
  --print-to-pdf="$PWD/demo-slides.pdf" \
  "file://$PWD/slides/demo-slides.html"
```

Ra đúng **6 trang, 960×540 pt** (13,333 × 7,5 in — 16:9).

> ⚠️ **Trang 5 còn 2 ô `⟨ QUOTE NGUYÊN VĂN ⟩`.** Dán đúng từng chữ tin nhắn của
> Biển và Bảo vào, rồi xuất lại PDF **trước khi nộp**. R6 chỉ tính quote nguyên văn.

**Font tải từ Google Fonts lúc render** → cần mạng khi xuất PDF.
PDF đã xuất thì nhúng sẵn font, không cần mạng nữa.
