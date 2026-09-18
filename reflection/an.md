# Reflection — Nguyễn Văn An

**Mã học viên:** 2A202602782 · **Vai trò:** Code prototype

---

## ① Vai trò & phần mình làm

Toàn bộ `codebase/bot/` và `eval/run_eval.mjs`.

- **`src/core/decide.js`** — nhúng câu hỏi, xếp hạng cosine + từ khoá, đưa ứng viên cho LLM phán quyết, phân mức chắc bằng ngưỡng số. Không câu trả lời nào gán cứng trong code.
- **Nạp kho** — `src/seed.js` + `src/ingest-pdf.js` (Sổ tay học viên PDF), 20 → 97 mục.
- **Adapter Discord** (`src/discord/`): scrub PII trước khi rời máy, trace mọi lời gọi LLM.

**Khó nhất:** giữ cho quyết định không bị gán cứng. Rất dễ viết `if` theo từng ca trượt — điểm eval lên nhưng sản phẩm chết. Nguyên tắc tự đặt: *chỉ sửa prompt hoặc sửa kho, không sửa code theo tên ca.*

**Quyết định cả nhóm đi theo:** lượt 2 tụt 78,0% — mình đề xuất không đụng `config.bar`. 8/9 ca trượt là sai nhãn bên trong LLM, hạ ngưỡng số không can thiệp được. Nhóm đồng ý sửa prompt → **36/41**.

**Chưa tốt:** nguyên nhân B (*hỏi WSL2/Arch, bot vẫn lấy hướng dẫn Linux*) mình đã viết hướng sửa nhưng chưa áp dụng — lỗi này vẫn còn trong sản phẩm.

## ② AI hỗ trợ mình thế nào

**Nhanh hơn hẳn:** dựng boilerplate — adapter Discord, client OpenAI, `fileStore`, parser PDF.

**Hai lần AI sai, cả hai còn dấu vết trong repo:**

1. **`temperature: 0` là tất định** — AI khẳng định, mình tin. Chạy 41 ca hai lượt ra 31 rồi 32, suýt kết luận sai *"kho lớn thì hành vi trôi"*. Chạy riêng ca dao động `G29` 6 lượt → đạt 6/6: không phải do kho, do mô hình không tất định. Sửa: thêm `seed: 42` + ghi `system_fingerprint` vào trace. Nhưng `seed` chỉ là *best-effort* — nên nhóm chuyển sang báo cáo **nhiều lượt, lấy mode, nêu khoảng dao động**.

2. **Thứ tự ưu tiên tuyến tính trong prompt** (`OUT_OF_SCOPE > CLARIFY > ANSWER > NOT_FOUND`) — nghe hợp lý nhưng hậu quả là `NOT_FOUND` gần như không bao giờ tới lượt, gây ra 8/9 ca trượt. Thay bằng cây quyết định 3 bước.

**Bài học:** AI sai ở những giả định nghe quá hợp lý để đi kiểm — chạy vẫn trơn, chỉ bộ kiểm thử mới lộ ra.

## ③ Một bài học từ case fail của chính nhóm

**Chuyện gì xảy ra.** Bản sửa prompt đầu viết luật "cứu tri thức" quá mạnh, đè cả bước kiểm thẩm quyền. `G13` (*"mai em xin nghỉ, anh duyệt giúp em"*) tụt từ `OUT_OF_SCOPE` xuống `UNCERTAIN` — bot bắt đầu trả lời một yêu cầu phê duyệt. Tổng điểm vẫn *tăng* (33 → 34).

**Sai ở đâu.** Coi tổng điểm là thước đo duy nhất của một lần sửa — trong khi đó là *đánh đổi*: được 2 ca tri thức, mất 1 ca an toàn. Hai loại không cùng đơn vị để cộng trừ.

**Lần sau.** Đọc diff từng ca sau mỗi lần sửa prompt, đặc biệt ca nào đổi từ đạt sang trượt. Ca `OUT_OF_SCOPE` và chống bẻ prompt là cổng chặn riêng — trượt một ca là block merge, không bù bằng điểm khác. Vòng sửa thứ hai thêm phân biệt *hỏi thông tin* vs *đòi hành động*, `G13` về đúng và tổng lên 36.

## ④ Nếu làm lại

Viết `eval/run_eval.mjs` **trước** khi viết prompt — mọi insight đều đến từ đọc ca trượt, nhưng công cụ đó mãi CP4 mới có, nên hai lượt đầu gần như đoán. Và tách ca an toàn thành cổng chặn riêng ngay từ đầu, không cộng chung vào một con số phần trăm.

---
