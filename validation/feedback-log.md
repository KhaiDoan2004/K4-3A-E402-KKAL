# Feedback log — người ngoài nhóm dùng thử

Hai willing user đã dùng thử bản prototype chạy thật trên Discord và cho nhận xét.

Cả hai gửi nhận xét **bằng tin nhắn**, nên bản gốc còn nguyên trong chat.
Phần tóm tắt dưới đây là **nhóm diễn giải lại**; ô *quote nguyên văn* để chép đúng từng chữ từ tin nhắn.

> ⚠️ **Nguyên tắc:** chỉ chép, không viết hộ. Ô nào chưa chép được thì để trống,
> **không dựng lại câu chữ theo trí nhớ**.

Buổi thử **có quan sát** (xem họ dùng bot trực tiếp) vẫn còn nợ — cách làm ở cuối file.

---

## Nguyễn Văn Biển · 2A202602416 · học viên khoá 4

**Nhóm tóm tắt:** tích hợp được vào Discord, gọi API thật và ra kết quả thật —
nhưng **cần xem xét kĩ hơn bài toán dữ liệu và chi phí**.

> **Quote nguyên văn** *(chép từ tin nhắn của Biển)*
> `(chưa chép — dán nguyên văn tin nhắn vào đây)`

Đây là phản hồi có sức nặng nhất nhóm nhận được, vì nó chỉ đúng hai chỗ yếu thật:

**① Dữ liệu.** Đúng. Số liệu khảo sát xác nhận: hai chủ đề học viên hỏi nhiều nhất —
**Daily Standup (93%)** và **chọn/đổi đề tài (53%)** — hiện có **0 mục** trong kho.
Kho đang nghiêng về nội dung giới thiệu chương trình (77/100 mục từ sổ tay) và
3 ngày chat onboarding, chứ không phải quy trình vận hành hằng ngày.
→ Chi tiết: `docs/khao-sat-nguoi-dung.md`.

**② Chi phí.** Trước đó nhóm chưa có số, chỉ ước chừng. Đã đo lại từ
`eval/traces/*.jsonl` (n = 741 lượt hỏi, 842 lượt embed thật):

| | Token thật | Giá *(bảng giá niêm yết gpt-4o-mini + text-embedding-3-small)* |
|---|---|---|
| 1 câu hỏi | 1.830 in + 112 out + 28 embed | **≈ 0,00034 $** → **1.000 câu ≈ 0,34 $** |
| 1 lượt TA lưu tri thức | 849 in + 167 out + 28 embed | ≈ 0,00023 $ |
| Nạp trọn cuốn sổ tay 22 trang | 19 lượt gọi | ≈ 0,01 $ (một lần) |

Độ trễ đo được: **p50 ≈ 1,5 giây** một câu trả lời (1,3 s phán quyết + 0,2 s embed).

**Kết luận:** chi phí **không** phải rào cản ở quy mô một khoá — rào cản là **dữ liệu**.
Biển nói đúng cả hai, nhưng hai vế không nặng như nhau.

---

## Nguyễn Phúc Bảo · 2A202602925 · học viên khoá 4

**Nhóm tóm tắt:** tính năng **có triển vọng, tiện dụng**, hiện **hoạt động được ở mức cơ bản**.

> **Quote nguyên văn** *(chép từ tin nhắn của Bảo)*
> `(chưa chép — dán nguyên văn tin nhắn vào đây)`

Nhóm không nâng câu này lên thành "đã nghiệm thu". *"Mức cơ bản"* khớp đúng với mức prototype
nhóm tự khai ở `spec.md` §4 — **Working**, chạy thật nhưng chưa lên lớp thật.
Bảo không nêu chỗ vướng cụ thể nào, nên phản hồi này **xác nhận hướng đi, không sửa được gì**.

---

## Thay đổi sinh ra từ feedback

| Feedback | Xử lý |
|---|---|
| Biển — *bài toán dữ liệu* | **Đổi ưu tiên.** Mẻ tri thức tiếp theo nhặt câu trả lời của TA về **Daily Standup** và **quy trình đề tài** trước mọi chủ đề khác. Ghi vào `spec.md` §9 |
| Biển — *chi phí* | **Không đổi thiết kế**, nhưng thay ước chừng bằng **số đo thật** (bảng trên). Chi phí ở quy mô một khoá là không đáng kể |
| Bảo — *mức cơ bản* | **Giữ nguyên cách tự khai** mức prototype là *Working*. Không nâng lên *Deployed* |

---

## Còn nợ trước CP5 — buổi thử có quan sát (15 phút/người)

1. **Không hướng dẫn trước.** Chỉ đưa tên bot và nói *"thử hỏi nó một câu xem sao"*.
2. Giao **2 task**: **T1** hỏi một lỗi kỹ thuật từng gặp thật · **T2** hỏi một câu kho chắc chắn chưa có.
3. **Quan sát, không can thiệp.** Ghi: họ gõ gì · đợi bao lâu · có đọc dòng nguồn không ·
   có bấm 👍/👎 không · có hỏi lại không.
4. Chép **quote nguyên văn**, đặc biệt lúc bot nói *"chưa có trong kho"* — phản ứng ở đó cho biết
   người dùng thấy bot **thành thật** hay thấy bot **vô dụng**. Đây là câu hỏi quan trọng nhất
   chưa ai trả lời được: hai nhận xét ở trên đều là đánh giá tổng quát sau khi dùng,
   **không phải phản ứng tại chỗ lúc bot từ chối trả lời**.
