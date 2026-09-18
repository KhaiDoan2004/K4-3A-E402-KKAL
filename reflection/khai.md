# Reflection — Đoàn Bá Khải

**Mã học viên:** 2A202602728 · **Vai trò:** Đội trưởng · Spec

---

## ① Vai trò & phần mình làm

Viết toàn bộ `spec.md` §1–§9, chốt quality bar ≥ 85% trước 21:00 ngày 17/9 tại CP4, và nộp cả 5 form CP1–CP5.

**Khó nhất** là phần bằng chứng (§1–§2): phải lấy được con số *chạy lại được* từ dữ liệu thực — không phải tự ước. Mình phải phối hợp với Khuyến để script `dem-discord.py` ra đúng số ghi trong spec, và với Lâm để bộ golden set phủ đủ 6 lớp ca.

**Quyết định mình đề xuất, cả nhóm đi theo:** khi lượt 2 tụt xuống 78,0%, mình chủ trương **không hạ `config.bar`**. Lý do đọc được từ 9 ca trượt: 8/9 là sai nhãn quyết định xảy ra bên trong LLM — hạ ngưỡng số không can thiệp được chỗ đó. Nhóm đồng ý sửa prompt thay vì sửa bar → lượt 4 đạt 36/41.

**Chỗ làm chưa tốt:** spec §9 mô tả hướng sửa nguyên nhân B (*bot không kiểm điều kiện kèm theo — hỏi WSL2 vẫn lấy hướng dẫn Linux*) nhưng mình không ép được nhóm áp dụng trước CP5. Ca `G03` và `G27` vẫn trượt trong lượt 4 — lỗi đó còn trong sản phẩm.

## ② AI hỗ trợ mình thế nào

Dùng AI để dựng khung spec và gợi ý cách viết problem statement. AI nhanh ở phần cấu trúc: đề mục, bảng, thứ tự trình bày — tiết kiệm khoảng 1–2 giờ so với viết từ đầu.

**Lần AI sai mình bắt được:** mình hỏi AI cách phát biểu JTBD, nó đưa ra bản *"Tôi muốn bot trả lời nhanh hơn TA"*. Mình đã sắp dùng thì Khuyến gửi kết quả khảo sát — 2/21 người mới *thường xuyên* phải đợi TA lâu; 7/21 *chưa bao giờ*. Tốc độ không phải nỗi đau chính. Phải sửa lại thành *"trả lời có nguồn, và im lặng đúng lúc khi không có nguồn"* — bản AI đưa nghe hợp lý nhưng sai dữ liệu.

## ③ Một bài học từ case fail của chính nhóm

**Chuyện gì xảy ra.** Lượt 2 bộ golden set mở rộng lên 41 ca, điểm tụt từ 86,2% xuống 78,0% — trượt chính cái bar 85% mình vừa chốt một ngày trước.

**Mình hiểu sai ở đâu.** Nhìn con số tụt, phản xạ đầu tiên là "hạ bar hoặc hạ ngưỡng cosine cho dễ đạt hơn". Nhưng đọc kỹ: 29 ca cũ vẫn đạt 86,2% y nguyên — toàn bộ phần tụt đến từ 12 ca *mới* cố ý khó hơn, chỉ đạt 58,3%. Vấn đề không phải bot kém đi, mà là bộ đo cũ chưa bắt được lớp ca khó. Hạ bar lúc này là tự lừa mình.

**Lần sau làm khác thế nào.** Khi điểm tụt sau khi mở rộng bộ đo, **phân tách kết quả theo nhóm ca cũ / ca mới trước khi kết luận**. Nếu ca cũ giữ nguyên thì đó là bộ đo tốt hơn, không phải sản phẩm tệ hơn. Và các ca an toàn (`OUT_OF_SCOPE`) phải là cổng chặn riêng — trượt một ca trong nhóm đó là chặn merge, không bù bằng điểm ở nhóm khác.

## ④ Nếu làm lại

Mình sẽ yêu cầu có bộ golden set ngay từ CP2 — trước khi viết một dòng prompt. Hai lượt sửa đầu gần như là đoán vì chưa có công cụ đọc ca trượt. Và mình sẽ tách nguyên nhân B thành task riêng có deadline, không để nó nằm trong "hướng sửa" của spec mà không ai nhận.

---
