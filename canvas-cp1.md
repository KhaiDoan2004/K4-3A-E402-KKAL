# CANVAS CP1 — Nhóm KKAL · 3A · E402 · Track B1 (Trợ lý Discord)

**Đội trưởng nộp form: Đoàn Bá Khải — 2A202602728**

> Số liệu đếm trên `data/discord-pack/k4_messages.csv` (1.092 tin, 12–14/09/2026).
> Chạy lại: `python3 eval/dem-discord.py <đường dẫn>/k4_messages.csv`

---

## Ô 1 · PAIN CỤ THỂ
*(ai — đang làm gì — vướng đâu — hậu quả gì)*

**Học viên khoá 4 trong tuần onboarding** tag bot "Trợ lý" trên Discord để hỏi việc hành chính (hạn nộp, điểm danh, nộp ở đâu, XP) — **bot trả lời trôi chảy và tự tin nhưng 81% câu trả lời không dẫn một nguồn chính thức nào**, và chỉ **6,4%** số lần nó chịu nói "mình không chắc, hỏi TA". Học viên **không có cách nào kiểm lại**; làm theo một thông tin sai thì **trễ hạn nộp hoặc mất điểm danh thật** — và đến lúc phát hiện thì đã muộn.

---

## Ô 2 · BẰNG CHỨNG
*(đường B — mining: số đếm được + ví dụ nguyên văn + phương pháp kiểm lại được)*

| Chỉ số | Con số |
|---|---|
| Tin của người tag bot | **307 / 779 = 39%** lưu lượng người |
| Trong đó hỏi việc hành chính | **122 / 307 = 40%** |
| **Câu trả lời của bot KHÔNG dẫn nguồn nào** | **253 / 313 = 81%** |
| Bot nói "mình không chắc" hoặc chuyển TA | **20 / 313 = 6,4%** |
| Bot nói rõ "mình không truy cập được dữ liệu cá nhân của bạn" | **2 / 313** |
| Câu hỏi của người không ai trả lời | **23** (chỉ đếm tin có dấu `?`) — **84** nếu tính cả câu hỏi không dấu `?`. Cả hai đều là heuristic, phải chấm tay. |

**Ví dụ nguyên văn (dẫn `msg_id`, không dán dài — theo quy định bảo mật data):**

1. `M13974` hỏi *"việc mình được điểm danh hay chưa có thể check ở đâu ạ"* → `M21536` bot trả **955 ký tự** về *điều kiện* để được điểm danh, **không trả lời câu được hỏi** là xem ở đâu.
2. `M67840` hỏi *"kiểm tra điểm danh trên lớp"* → `M14476` bot lại đưa quy định chung về đặt tên Zoom.
3. `M79611` hỏi *"tại sao ko thấy lịch sử bên activity"* → `M67216` bot đáp *"commit và PR vào main thành công sẽ được ghi nhận"* — né câu hỏi "tại sao không thấy".
4. `M19079` hỏi *"Record của workshop lưu ở đâu?"* → `M14899` *"tại channel Tài Nguyên"* — **không kèm link, không dẫn nguồn**, học viên không kiểm được.
5. `M58070` hỏi *"làm thế nào để tôi biết là tôi đã điểm danh"* → `M20301` bot **hỏi lại** *"Bạn muốn kiểm tra trong ngữ cảnh nào? 1. Zoom 2. lệnh bot 3. kênh Discord"* ← **đây là 1 trong số ít lần bot làm ĐÚNG.** Giữ làm case chuẩn trong golden set.

**Phương pháp đếm:** lọc `is_bot` để tách người/bot; `mentions_bot=True` để lấy câu gửi cho bot; "có dẫn nguồn" = nội dung chứa `[link:`, chữ "nguồn", "theo thông báo", hoặc tag kênh; "chuyển TA" = khớp mẫu *không chắc / chưa có thông tin / liên hệ TA / hỏi TA*. Script kèm theo, chạy lại ra đúng số này.
⚠️ Hạn chế tự khai: mẫu từ khoá là heuristic, sẽ siết lại và chấm tay 30 mẫu trước CP4.

---

## Ô 3 · PROBLEM STATEMENT + IMPACT
*(không có chữ "AI" trong problem statement)*

**Problem statement:** Học viên cần biết chắc một thông tin hành chính của khoá (hạn nộp, cách điểm danh, nơi nộp bài) **ngay tại chỗ họ đang đứng là Discord**, và cần biết thông tin đó có đáng tin không — hôm nay họ nhận được câu trả lời nghe rất chắc chắn mà không kiểm lại được, nên hoặc tin nhầm, hoặc phải đi hỏi lại người thật.

### Bảng impact — 4 ứng viên đã cân nhắc

| Ứng viên | Bao nhiêu người gặp | Tần suất | Mỗi lần tốn gì | Build nổi? | Chọn? |
|---|---|---|---|---|---|
| **A · Bot trả lời hành chính không căn cứ** | 122/307 lượt hỏi bot là hành chính; 81% câu trả lời không nguồn | Mỗi ngày, cao nhất tuần onboarding | Trễ hạn nộp = **0 điểm mốc**; hoặc 5–15' đi hỏi lại TA | ✅ có baseline thật để so trước/sau | ✅ **CHỌN** |
| B · Bản tin TA sót câu chưa ai trả lời | 23–84 câu không ai reply trong 3 ngày (**khoảng rộng vì chính định nghĩa còn mơ hồ**) | Mỗi ngày | TA bỏ sót học viên đang kẹt | ⚠️ khó: định nghĩa "câu hỏi thật" rất nhập nhằng — heuristic dấu `?` bắt cả "E cảm ơn ạ" | ❌ |
| C · Bot không phân biệt chào hỏi với hỏi thật | 76 tin ≤15 ký tự | Liên tục | Bot đổ đoạn dài cho câu "hi" | ⚠️ pain nhẹ, hậu quả thấp | ❌ |
| D · Tutor VLearn trả lời không căn cứ | 788/3.097 lượt = 25,4% | Mỗi buổi học | Học sai kiến thức | ✅ dễ làm | ❌ **loại vì trùng quyết định AI với A nhưng đông nhóm chọn**; A có hậu quả đo được bằng điểm số rõ hơn |

**Lý do chọn A bằng số:** hậu quả của A là thứ **đếm được thành điểm mất** (trễ hạn = 0 điểm mốc), trong khi B/C hậu quả mờ. A có **baseline thật đang chạy** (bot hiện tại, 313 câu trả lời) nên đo được trước/sau — B không có gì để so. D tuy dễ hơn nhưng quyết định AI y hệt A mà lại là lát cắt gợi ý sẵn trong đề, nhiều nhóm sẽ trùng.

---

## Ô 4 · LÁT CẮT — MỘT CÂU

> **Một học viên khoá 4 trong Discord · tag bot hỏi một câu hành chính (hạn nộp / điểm danh / nộp ở đâu) · AI quyết định câu hỏi này có tìm được căn cứ trong nguồn thông báo chính thức hay không · trả về câu trả lời kèm trích dẫn nguồn, hoặc nói rõ "chưa có căn cứ" và tag TA — không đoán.**

Bốn mảnh: **ai** = học viên K4 trong Discord · **việc** = hỏi một câu hành chính · **quyết định AI** = có căn cứ trong nguồn chính thức hay không · **kết quả** = trả lời có trích dẫn, hoặc chuyển TA.

*Tự kiểm: bỏ chữ AI đi thì việc "học viên cần biết chắc hạn nộp" vẫn tồn tại → không phải đang tìm chỗ nhét AI. ✅*

**Non-goals (≥3, để bản build không trượt khỏi lát cắt):**
1. Không trả lời câu hỏi **chuyên môn/bài học** — chỉ hành chính.
2. Không trả lời câu hỏi về **trạng thái cá nhân** ("tôi đã điểm danh chưa") — bot không có quyền truy cập, phải nói rõ và chuyển TA.
3. Không tự động nhắn cho học viên khi chưa ai duyệt.
4. Không làm bản tin ngày (đó là B2).

---

## Ô 5 · AUTOMATION + LÝ DO *(1 dòng, theo cost-of-error)*

☐ Augment ☑ **Conditional** ☐ Automate

**Lý do:** trả lời sai một deadline thì học viên nộp muộn và **mất trắng điểm mốc đó**, mà họ **không có cách nào tự phát hiện mình đang bị sai** — sửa cực đắt; ngược lại chuyển nhầm sang TA khi thật ra có căn cứ chỉ tốn TA vài giây — sửa cực rẻ. Lệch giá đó buộc bot **chỉ được tự trả lời khi có căn cứ**, còn lại chuyển người.

---

## Ô 6 · WILLING USERS *(≥2 người thật, ngoài nhóm — khai TỪ CP1)*

| # | Họ tên | Vai | Đã đồng ý thử trước CP5? |
|---|---|---|---|
| 1 | | học viên K4 | ☐ |
| 2 | | học viên K4 | ☐ |
| 3 | | TA / Mod | ☐ |

> Câu đi xin: *"Tuần này nhóm mình có bản thử trợ lý Discord, bạn cho mình 10 phút ngồi thử được không?"* — ai gật thì ghi tên vào đây ngay.

---

## Ô 7 · PHÂN CÔNG CÓ TÊN

| Ai | Mã học viên | Làm gì cụ thể |
|---|---|---|
| **Đoàn Bá Khải** *(đội trưởng)* | 2A202602728 | Nộp cả 5 form CP1–CP5 bằng **cùng một mã học viên**; dựng flow bấm được (CP2) + lời gọi AI thật (CP3) |
| **Nguyễn Văn An** | 2A202602782 | Siết mẫu đếm, chấm tay 30 mẫu, khảo sát ≥20 người có log nguyên văn; spec §1–§2 |
| **Đỗ Thanh Lâm** | 2A202602577 | Bộ nguồn thông báo chính thức; prompt quyết định trả lời/chuyển TA; 4 lớp chỗ khó + ≥8 kịch bản |
| **Trần Ngọc Khuyến** | 2A202602682 | Golden set ≥20 case (≥10 từ `k4_messages.csv`), quality bar bằng số, bảng kết quả trong `eval/` |

---

## Ghi chú khi nộp form CP1

- Canvas = **Ô 1 → Ô 4** (4 ô theo 4 tiêu chí nghiệm thu trong `01-challenge-brief.md`).
- Ô 5–7 là phần guide §1.5 đòi thêm — TA tích ở CP1: ☐ lát cắt đúng format 1 câu ☐ có evidence ban đầu ☐ đủ tên phân công.
- Nộp kèm: tên + **mã học viên đội trưởng** · **link repo public** · **≥2 willing user**.
