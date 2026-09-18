# Nhật ký thử nghiệm người dùng ngoài nhóm — R6

**Hai task giao cho mọi người thử** *(cùng một bộ, để so sánh được giữa các phiên)*:

- **T1** — *"Bạn dùng con bot này để tìm lại cách sửa một lỗi kỹ thuật bạn từng gặp trong khoá."*
- **T2** — *"Bây giờ hỏi nó một câu mà bạn đoán là kho chưa có."* → chỗ đáng quan sát nhất là
  phản ứng lúc bot nói *"chưa có trong kho"*.

---

## Bảng nhật ký

| # | Người thử (tên · vai · willing user?) | Task | Điểm tắc nghẽn *(quan sát được)* | Quote nguyên văn | Mức nghiêm trọng | Quyết định của nhóm |
|---|---|---|---|---|---|---|
| 1 | Nguyễn Văn Biển · học viên K4 · **willing user CP1** | T1 + T2 | data + chi phí | tích hợp được vào Discord, gọi API thật và ra kết quả thật — nhưng cần xem xét kĩ hơn bài toán dữ liệu và chi phí. | low| Đổi ưu tiên mẻ tri thức: Standup + đề tài. Chi phí: đo thật, không đổi thiết kế → `spec.md` §9 |
| 2 | Nguyễn Phúc Bảo · học viên K4 · **willing user CP1** | T1 + T2 | tạm thời chưa thấy vấn đề | ính năng có triển vọng, tiện dụng, hiện hoạt động được ở mức cơ bản. | | Giữ nguyên mức tự khai prototype = *Working* |
| 3 | Hoàng Ngọc Đăng Khoa| T1 + T2 |Chất lượng phản hồi | có những câu hỏi lẽ ra nên phân loại để là out of scope nhưng bot chỉ trả lời không có trong kho| high| upadate thêm prompt|
| 4 | Nguyễn Minh Thắng| T1 + T2 | thời gian lưu QnA | Hiện chưa tự căn chỉnh được thời gian lưu câu hỏi và câu trả lời muốn lưu| medium| Nếu có thời gian sẽ update thêm|
| 5 | Nguyễn Thái Anh| T1 + T2 | Data storage| Data hiện tại mới được lưu ở local khó check lại và scale|medium | Hiện nhóm tạm thời lưu ở local dưới dạng json để kịp có mvp demo, nếu có thêm thời gian sẽ lưu ở các db ngoài để dễ quản lý hơn|

