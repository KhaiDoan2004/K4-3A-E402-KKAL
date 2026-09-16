# CP1 Canvas — Track B2 (Bản tin cuối ngày cho TA) · Nhóm KKAL · 3A · E402 · Cụm C1

**Đội trưởng nộp form: Đoàn Bá Khải — 2A202602728**
**Repo:** https://github.com/KhaiDoan2004/K4-3A-E402-KKAL

> Mọi con số dưới đây đếm trên `data/discord-pack/` và **chạy lại được** bằng `eval/dem-discord.py`.
> Chi tiết mining: `AN/pain-points-discord-k4.md` (bản đầy đủ, không commit theo quy định bảo mật data).

---

## Ô 1 · PAIN CỤ THỂ
*(ai — đang làm gì — vướng đâu — hậu quả gì)*

**TA/Learning Coach của khoá 4, cuối mỗi ngày,** cần biết học viên nào đang kẹt mà chưa ai gỡ. Hôm nay họ có bản tin ngày do bot tự sinh, nhưng **bản tin chỉ nhắc được 5 câu hỏi trong khi ngày đó có 32–37 câu hỏi thật** (phủ 14–16%), và **2/4 bản tin thiếu hẳn mục "Học viên đang hỏi gì"**. Hậu quả: **45/211 câu hỏi (21%) không ai trả lời trực tiếp**, và **27 ca bot tự nhận "không có thông tin, nhờ Mod" thì 0/27 ca có người vào tiếp nhận** — câu hỏi chết tại đó, học viên ngồi chờ, TA không hề biết là mình đã bỏ sót.

---

## Ô 2 · BẰNG CHỨNG
*(đường B — mining: số đếm được + ví dụ nguyên văn + phương pháp kiểm lại được)*

### Bản tin hiện tại hỏng ở đâu

| Chỉ số | Giá trị |
|---|---|
| **Độ phủ câu hỏi của bản tin 13/09** | **5/32 (16%)** server L2-3 · **5/37 (14%)** server L3-4 |
| Bản tin **thiếu hẳn** mục "Học viên đang hỏi gì" | **2 / 4** |
| Lỗi chuỗi "nguồn tham chiếu" chèn vào giữa từ | **13 chỗ**, tất cả trong bản tin `K4-L2-3 · 14/09` |
| Nhãn "Đã có phản hồi, chưa xác nhận đã xử lý" — không kiểm chứng được, không nói TA phải làm gì | **7 dòng** |
| Tóm tắt bị cắt cụt giữa câu | 1 bản tin (`K4-L2-3 · 13/09`, kết thúc ở *"…chưa được giải đá"*) |

### Câu hỏi đang rơi

| Chỉ số | Giá trị |
|---|---|
| Câu hỏi của người (định nghĩa `is_q`) | **211 / 779** |
| **Không có reply trực tiếp** | **45 / 211 = 21%** |
| Bot né ("không có thông tin" / "nhờ Mod") | **27 / 313 tin bot** |
| **Trong 27 ca đó, số ca có người vào tiếp nhận** | **0 / 27** |
| Thời gian chờ khi **người** trả lời | median 5 phút · p75 **17 phút** · max **695 phút** |
| Câu hỏi/ngày (tăng liên tục) | 25 → 32 → 84 |

### Ví dụ nguyên văn *(≤2 câu mỗi ví dụ, dẫn `msg_id` theo quy định bảo mật)*

| msg_id | Trích | Vì sao đắt |
|---|---|---|
| `M35065` | *"Mình chưa rõ thông tin câu này lắm, để chắc chắn không sai sót thì mình nhờ Mod vào trả lời giúp bạn ạ!"* | Bot tag `[@role]` rồi thôi — không ticket, không trạng thái, **không ai vào** |
| `M02666` | hỏi hạn thành lập team → bot né | Câu hỏi có deadline, để lỡ là mất quyền lợi |
| `M41569` | hỏi clone hay fork code cho Lab 1 → bot né | Chặn học viên bắt đầu được bài |
| `M43428` | *"mình mới nhắn tin, bạn reply giúp mình nhé"* | Học viên phải **tự đi đòi** được trả lời |
| `M07901` | *"Hi, mình vẫn chưa cài được CVAT. Có bạn nào hỗ trợ được mình không?"* | Kẹt kỹ thuật, không ai gỡ |

**Phương pháp đếm:** `is_q` = tin của người có dấu `?` **hoặc** chứa 1 trong 22 cụm hỏi tiếng Việt đã bỏ dấu. "Bot né" = khớp 13 mẫu (*không có thông tin / chưa rõ / nhờ Mod / ngoài phạm vi…*). "Không ai tiếp nhận" = không tin nào có `reply_to` trỏ vào tin bot né đó. Script: `eval/dem-discord.py`.

⚠️ **Hạn chế tự khai:** `is_q` là heuristic, sẽ chấm tay 30 mẫu để đo độ chính xác trước CP4. Con số 21% câu rơi là **cận trên** — Discord cho phép trả lời mà không dùng nút reply, nên một số câu có thể đã được trả lời không qua `reply_to`. Pack chỉ có 3 ngày onboarding, chỉ kênh public, đã loại 8 tin hoàn cảnh cá nhân → **pain hành chính bị lệch cao, không suy ra cho cả khoá**.

---

## Ô 3 · PROBLEM STATEMENT + IMPACT
*(problem statement không có chữ "AI")*

**Problem statement:** Cuối ngày, TA cần biết **học viên nào hỏi mà chưa được ai trả lời**, để gỡ trước khi người đó bỏ cuộc hoặc trễ việc. Hôm nay TA phải tự cuộn lại 10 kênh của 2 server — hoặc tin vào một bản tin chỉ nhắc được 1/6 số câu hỏi trong ngày và không phân biệt được câu nào đã xong, câu nào còn treo.

### Bảng impact — 4 ứng viên đã cân nhắc

| Ứng viên | Bao nhiêu người gặp | Tần suất | Mỗi lần tốn gì | Build nổi? | Chọn? |
|---|---|---|---|---|---|
| **A · Bản tin bỏ sót câu hỏi chưa ai trả lời** | 45/211 câu rơi (21%) + 27 ca bot né chết; bản tin phủ 14–16% | **Mỗi ngày**, tăng dần (25→32→84 câu/ngày) | Học viên chờ tới **695 phút** hoặc không bao giờ được trả lời; TA không biết mình sót | ✅ **có baseline thật đang chạy để so trước/sau** | ✅ **CHỌN** |
| B · Bot hỏi lại 1 câu khi câu hỏi mơ hồ | 75 chuỗi hỏi-lại / 198 tin | Mỗi ngày | Học viên phải diễn đạt lại 2–7 lượt | ✅ dễ | ❌ đây là **B1**, không phải B2; và bài toán "đoán ý" khó đo hơn nhiều |
| C · Bot trả lời quá dài | 46/313 tin bot ≥1.000 ký tự (15%) | Mỗi ngày | Cuộn vài màn hình trên mobile | ✅ rất dễ | ❌ hậu quả nhẹ nhất trong 4 cái — khó chịu, không mất mát |
| D · Sửa lỗi format bản tin (chuỗi "nguồn tham chiếu") | 13 chỗ trong 1 bản tin | 1/4 bản tin | Đọc vấp | ✅ | ❌ **đây là bug `str.replace` thiếu biên từ — sửa 1 dòng, không phải bài toán AI.** Vẫn báo lại cho team vận hành |

**Lý do chọn A bằng số:** A là ứng viên duy nhất có **hậu quả rơi vào người học và không ai nhìn thấy** — 0/27 ca bot né được tiếp nhận nghĩa là hệ thống hiện tại **không có đường nào phát hiện việc bỏ sót**. B và C thì học viên vẫn nhận được phản hồi, chỉ là dở. D là lỗi lập trình, sửa 1 dòng. A cũng là ứng viên duy nhất **có baseline thật đang chạy** (4 bản tin bot đã đăng) nên đo được trước/sau — thứ mà B, C, D không có.

---

## Ô 4 · LÁT CẮT — MỘT CÂU

> **Một TA của khoá 4 · cuối ngày muốn biết còn ai đang bị bỏ rơi · AI quyết định tin nào là câu hỏi thật chưa được trả lời · trả về danh sách gom theo chủ đề, mỗi câu kèm link tới tin gốc và lý do xếp là "còn treo", để TA vào trả lời đúng người.**

Bốn mảnh: **ai** = TA khoá 4 · **việc** = cuối ngày rà ai chưa được gỡ · **quyết định AI** = tin này có phải câu hỏi thật chưa được trả lời không · **kết quả** = danh sách có link, TA hành động được ngay.

*Tự kiểm: bỏ chữ AI đi thì việc "TA rà cuối ngày xem ai chưa được trả lời" vẫn tồn tại (hiện đang làm tay) → không phải đang tìm chỗ nhét AI.* ✅

**Non-goals *(bản build không được vi phạm)*:**
1. **Không tự trả lời hộ** câu hỏi — chỉ phát hiện và gom cho TA.
2. **Không tự động gửi tin cho học viên** khi chưa có người duyệt *(luật an toàn của track B)*.
3. **Không nêu tên/định danh học viên** trong bản tin công khai — dẫn link tin, không dẫn người.
4. Không làm phần intent / hỏi lại của bot — đó là B1.
5. Không làm mục "Thảo luận học tập" và "Learning Coach nên chú ý" của bản tin — chỉ làm **một mục: câu hỏi còn treo**.

---

## Ô 5 · AUTOMATION + LÝ DO *(theo cost-of-error)*

☑ **Augment** — AI đề xuất danh sách, **TA là người đọc và quyết định trả lời ai**. ☐ Conditional ☐ Automate

**Lý do:** bỏ sót một câu hỏi thật thì học viên ngồi chờ tới 695 phút hoặc bỏ luôn, **và không ai trong hệ thống phát hiện được** — sai kiểu đó cực đắt; ngược lại liệt kê thừa một câu đã được trả lời thì TA liếc 2 giây là bỏ qua — cực rẻ. Lệch giá đó buộc thiết kế **ưu tiên không bỏ sót hơn là liệt kê gọn**, và buộc **giữ người ở vòng cuối**: bản tin là bản nháp cho TA, không phải tin tự gửi cho học viên.

---

## Ô 6 · WILLING USERS *(≥2 người thật ngoài nhóm — PHẢI khai từ CP1)*

| # | Họ tên | Vai | Đã đồng ý thử trước CP5? |
|---|---|---|---|
| 1 | ⬜ **CHƯA ĐIỀN** | TA / Mod khoá 4 *(ưu tiên — đây là user thật của B2)* | ☐ |
| 2 | ⬜ **CHƯA ĐIỀN** | TA / Mod hoặc học viên từng đi trả lời trong Discord | ☐ |
| 3 | | học viên K4 | ☐ |

> Câu đi xin: *"Tụi mình làm bản tin cuối ngày gom câu hỏi chưa ai trả lời cho TA. Anh/bạn cho tụi mình 10 phút ngồi thử trước hôm demo được không?"*
> **Khối R6 đáng 8 điểm và bắt buộc 2 người phải được khai TỪ CP1** — không khai bây giờ thì trần điểm nhóm là 92.

---

## Ô 7 · PHÂN CÔNG

| Ai | Mã học viên | Làm gì cụ thể |
|---|---|---|
| **Đoàn Bá Khải** *(đội trưởng)* | 2A202602728 | Nộp cả 5 form CP1–CP5 bằng **cùng một mã học viên**; dựng flow bản tin bấm đi hết được (CP2) + lời gọi AI thật ở quyết định "câu này còn treo hay không" (CP3) |
| **Nguyễn Văn An** | 2A202602782 | Evidence: siết `is_q`, chấm tay 30 mẫu đo độ chính xác, khảo sát ≥20 người có log nguyên văn; spec §1–§2 |
| **Đỗ Thanh Lâm** | 2A202602577 | Mining & baseline: phân tích 4 bản tin hiện có, prompt phân loại "còn treo / đã xong / không phải câu hỏi", 4 lớp chỗ khó + ≥8 kịch bản; spec §5–§6 |
| **Trần Ngọc Khuyến** | 2A202602682 | Golden set ≥20 case (≥10 case từ `k4_messages.csv`), chốt quality bar bằng số, chạy trọn bộ + bảng kết quả trong `eval/`; spec §7 |

---

## Chỗ khó đã nhìn thấy trước *(để dành cho spec §5 — CP4)*

| # | Lớp | Tình huống thật trong data |
|---|---|---|
| ① | Nguồn sự thật | Câu đã được trả lời **không dùng nút reply** → `reply_to` rỗng, AI tưởng còn treo |
| ② | Mơ hồ | *"E cảm ơn ạ"*, *"Dạ vâng ạ"* có dấu `?` hoặc cụm hỏi nhưng **không phải câu hỏi** |
| ③ | Ngoài thẩm quyền | Câu hỏi về hoàn cảnh cá nhân — **không được đưa vào bản tin công khai** |
| ④ | Đặc thù domain | Cùng một câu 10 người hỏi khác cách → gom nhóm sai thì TA trả lời sót người |

---

## Checklist nộp CP1

- [x] Canvas đủ 4 ô bắt buộc (Ô 1–4) + 3 ô của guide §1.5 (Ô 5–7)
- [x] Lát cắt đúng format một câu, đủ 4 mảnh
- [x] Evidence có số đếm + ví dụ nguyên văn + phương pháp kiểm lại được
- [x] Bảng impact ≥3 ứng viên + ứng viên đã loại có lý do bằng số
- [x] Phân công có tên từng người
- [x] Đội trưởng + mã học viên
- [x] Link repo công khai
- [ ] **≥2 willing user — CHƯA ĐIỀN, đây là thứ duy nhất còn thiếu**
