# Reflection — Trần Ngọc Khuyến

**Mã học viên:** 2A202602682 · **Vai trò:** Mining data & evidence

---

## ① Vai trò & phần mình làm

Siết mẫu đếm trên `k4_messages.csv` bằng `eval/dem-discord.py` và khảo sát 21 người ngoài nhóm có log đầy đủ (`docs/khao-sat-nguoi-dung.md`).

**Khó nhất** là làm cho con số *chạy lại được*: không phải đếm tay rồi điền vào bảng, mà phải viết script nhận đường dẫn data pack làm tham số, ra đúng số ghi trong spec. Khó vì định nghĩa mơ hồ — "lượt hướng dẫn" là gì, "câu hỏi" là gì — phải chốt phương pháp trước rồi mới code.

**Quyết định mình đề xuất, cả nhóm đi theo:** kết quả khảo sát cho thấy chỉ 2/21 người *thường xuyên* phải đợi TA lâu — tốc độ không phải nỗi đau chính. Mình đề xuất đổi value proposition từ *"trả lời nhanh hơn TA"* sang *"trả lời có nguồn, và im lặng đúng lúc khi không có nguồn"*. Nhóm đồng ý và Khải sửa lại problem statement trong spec theo đó.

**Chỗ làm chưa tốt:** bản đầu của `dem-discord.py` dùng hàm bỏ dấu tự viết, và hàm đó **ăn mất chữ `đ`**, làm 3 cụm hỏi (`được`, `đúng`, `địa`) không bao giờ khớp. Số `is_q` bị đếm thiếu, mãi CP4 mới phát hiện khi An chạy lại script và thấy số không khớp spec. Đã vá, nhưng hanh kiểm lại sớm hơn thì đã tránh được việc spec ghi số sai trong nhiều ngày.

## ② AI hỗ trợ mình thế nào

Dùng AI để viết skeleton `dem-discord.py` và phần regex nhận diện câu hỏi. AI nhanh ở phần lặp: parse CSV, nhóm tin theo cửa sổ thời gian, viết test case nhỏ.

**Lần AI sai mình bắt được:** mình hỏi AI viết hàm bỏ dấu tiếng Việt, nó dùng `unicodedata.normalize('NFKD')` rồi strip combining characters — nhìn qua thì hợp lý, nhưng chữ `đ` *không phải* ký tự có dấu kết hợp mà là ký tự riêng (`U+0111`), nên bị strip luôn. AI không cảnh báo gì. Phát hiện ra khi nhìn log thấy cụm `"duoc"` không bao giờ xuất hiện trong kết quả khớp dù data rõ ràng có. Bài học: hàm xử lý ngôn ngữ đặc thù cần test với ký tự biên trước khi dùng.

## ③ Một bài học từ case fail của chính nhóm

**Chuyện gì xảy ra.** Script `dem-discord.py` báo 19 tin nhắn về CVAT/Docker, nhưng con số "10 nhóm câu hỏi trùng gần đúng" trong spec thực ra được đếm với hàm bỏ dấu bị lỗi. Khi vá lại, số nhóm tăng lên — tức là mức độ lặp của câu hỏi trong kênh *nhiều hơn* mình báo cáo.

**Mình hiểu sai ở đâu.** Mình tin vào output của script mà không chạy thủ công một vài dòng để xác minh. Đặc biệt với xử lý văn bản tiếng Việt, có rất nhiều edge case mà bộ test tiếng Anh thông thường không bắt được.

**Lần sau làm khác thế nào.** Với bất kỳ hàm xử lý text nào, **viết assert nhỏ ngay tại chỗ** với ít nhất 5 từ tiếng Việt có dấu đặc biệt (`đ`, `ă`, `ơ`, tổ hợp thanh điệu) trước khi dùng trong pipeline chính. Không tin output số nếu chưa xem qua ít nhất 10 dòng kết quả thực tế.

## ④ Nếu làm lại

Mình sẽ viết và chạy script mining *trước khi* ngồi khảo sát — để biết cần hỏi gì, thay vì hỏi trước rồi mới đi đếm xác nhận. Và sẽ commit version phương pháp đếm kèm test case nhỏ ngay từ đầu, không để đến CP4 mới phát hiện hàm bỏ dấu sai.

---
