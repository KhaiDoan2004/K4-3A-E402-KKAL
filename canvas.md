# CP1 Canvas — Track B2 (Trợ lý Discord · tính năng mới) · Nhóm KKAL · 3A · E402 · Cụm C1

**Đội trưởng nộp form: Đoàn Bá Khải — 2A202602728**
**Repo:** https://github.com/KhaiDoan2004/K4-3A-E402-KKAL

> Mọi con số đếm trên `data/discord-pack/`, **chạy lại được** bằng `eval/dem-discord.py`.
> Bản mining đầy đủ: `AN/pain-points-discord-k4.md` (không commit — quy định bảo mật data).

---

## Ô 1 · PAIN CỤ THỂ
*(ai — đang làm gì — vướng đâu — hậu quả gì)*

**TA/Mod của khoá 4, khi có học viên báo lỗi kỹ thuật trong Discord,** phải gõ tay lại từng bước sửa lỗi. Cách sửa đó **đã từng được gõ ra rồi**, nằm đâu đó trong lịch sử chat, nhưng **không ai tìm lại được và bot không biết gì về nó** — nên TA tiếp theo gõ lại từ đầu. Hậu quả đo được: **ngày 13/09, hai người khác nhau gõ 12 tin nhắn hướng dẫn cài CVAT/Docker cách nhau 12 tiếng** — D6587 lúc 10:26 (5 tin, kéo 9 phút), D2012 lúc 22:59 (7 tin, kéo 24 phút) — cho cùng một lớp sự cố; và **0/27 ca bot tự nhận "không có thông tin" được ai vào tiếp nhận**, tri thức chưa bao giờ quay lại hệ thống.

---

## Ô 2 · BẰNG CHỨNG
*(đường B — mining: số đếm + ví dụ nguyên văn + phương pháp kiểm lại được)*

### Tri thức bị gõ lại

| Chỉ số | Giá trị |
|---|---|
| Tin nhắn của người nhắc CVAT/Docker | **19 tin / 7 người** (12–14/09) |
| **Lượt hướng dẫn cài đặt bị gõ lại từ đầu** | **2 lượt trong cùng ngày 13/09**, hai người hướng dẫn khác nhau |
| Số tin nhắn tiêu tốn cho 2 lượt đó | **12 tin** (5 + 7) |
| Thời lượng lượt thứ hai | **24 phút** (22:59 → 23:23) |
| Bot né "không có thông tin / nhờ Mod" | **27 / 313 tin bot** |
| **Trong 27 ca đó, số ca có người vào tiếp nhận** | **0 / 27** |
| Nhóm câu hỏi trùng gần đúng (mọi chủ đề) | **10 nhóm / 21 tin** |

### Ví dụ nguyên văn *(≤2 câu mỗi ví dụ, dẫn `msg_id`)*

| msg_id | Giờ | Trích | Ý nghĩa |
|---|---|---|---|
| `M12802` | 13/09 10:26 | *"Ngay sau docker compose up -d, OPA chưa lấy được policy bundle từ cvat-server, nên health check báo: 500"* | **Lượt 1** — D6587 chẩn đoán và gõ cách sửa |
| `M94723` | 13/09 17:34 | *"cái này mình cũng bị 'docker com…'"* | Người thứ ba gặp **đúng lỗi đó**, 7 tiếng sau |
| `M07901` | 13/09 22:49 | *"Hi, mình vẫn chưa cài được CVAT. Có bạn nào hỗ trợ được mình không?"* | Mở **lượt 2** |
| `M30675`→`M54305` | 13/09 22:59–23:23 | D2012 gõ 7 tin: `git clone --branch v2.74.1…` → `docker compose pull` → `usermod -aG docker` | **Gõ lại từ đầu**, không dùng được gì từ lượt 1 |
| `M55809` | 12/09 23:00 | *"Mình tạo topic này mong muốn các bạn chia sẻ các issuse gặp phải trong quá trình cài đặt"* | Học viên **tự dựng kho tri thức thủ công** — đúng nhu cầu, sai công cụ |
| `M97517` | 13/09 11:27 | *"mn có thể qua đây để xem chia sẻ kinh nghiệp setup CVAT nhé [link]"* | Mod phải **trỏ tay** từng người sang thread đó |
| `M35065` | — | *"Mình chưa rõ thông tin câu này lắm… mình nhờ Mod vào trả lời giúp bạn ạ!"* | Bot né → **không ai vào** (0/27) |

`M55809` và `M97517` là bằng chứng mạnh nhất: **giải pháp thủ công cho bài toán này đã tự phát sinh trong khoá.** Người học tự lập topic gom issue, mod tự trỏ người sang đó. Nhu cầu có thật, chỉ là đang làm bằng tay và không tìm lại được.

**Phương pháp đếm:** `is_q` = tin của người có dấu `?` **hoặc** chứa 1 trong 22 cụm hỏi tiếng Việt đã bỏ dấu. "Lượt hướng dẫn" = cụm tin liên tiếp cùng tác giả, cùng kênh, chứa `cvat|docker`, cách nhau ≤30 phút. "Bot né" = khớp 13 mẫu (*không có thông tin / chưa rõ / nhờ Mod / ngoài phạm vi…*). Script: `eval/dem-discord.py`.

### ⚠️ Hai hạn chế tự khai *(khai từ CP1, không giấu)*

1. **Pack chỉ có 3 ngày onboarding** và lab CVAT rơi đúng 1 ngày → **n nhỏ: 19 tin / 7 người**. Trước CP4 nhóm sẽ bổ sung bằng **khảo sát ≥20 người** (chuẩn A) hỏi *"lần gần nhất bạn hỏi một lỗi kỹ thuật trong Discord, bạn mất bao lâu để có câu trả lời?"* — vì mining một mình chưa đủ đô cho lát cắt này.
2. **Data pack KHÔNG có cột reaction/emoji** (12 cột: `msg_id, guild, channel, author, is_bot, msg_type, created_at_vn, reply_to, mentions_bot, n_attachments, n_chars, content`). Nghĩa là **không thể lấy sự kiện ghim 📌 thật từ data** → golden set sẽ dùng **fixture tự dựng**: nhóm tự đánh dấu các cụm tin đã giải quyết trong pack làm "ca đã ghim". Phần này khai rõ là mock trong spec §4.

---

## Ô 3 · PROBLEM STATEMENT + IMPACT
*(problem statement không có chữ "AI")*

**Problem statement:** Khi một sự cố kỹ thuật được gỡ xong trong chat, **cách sửa chỉ tồn tại trong trí nhớ của người vừa gỡ nó**. Người tiếp theo gặp đúng lỗi đó phải hỏi lại từ đầu, và TA tiếp theo phải gõ lại từ đầu — dù câu trả lời đã nằm sẵn trong lịch sử kênh.

### Bảng impact — 4 ứng viên đã cân nhắc

| Ứng viên | Bao nhiêu người gặp | Tần suất | Mỗi lần tốn gì | Build nổi? | Chọn? |
|---|---|---|---|---|---|
| **A · Ghim tri thức sau khi gỡ xong sự cố** | 7 người / 19 tin CVAT-Docker; 0/27 ca bot né được tiếp nhận | Mỗi khi có lab kỹ thuật mới | **gõ lại 7 tin / 24 phút** cho ca đã từng gỡ; học viên chờ tới đêm | ⚠️ được, nhưng **phải mock sự kiện ghim** (pack không có reaction) | ✅ **CHỌN** |
| B · Bản tin cuối ngày gom câu hỏi còn treo cho TA | 45/211 câu (21%) không ai reply | Mỗi ngày | Học viên chờ tới **695 phút** | ✅ có baseline thật để so trước/sau | ❌ giá trị rơi vào **1 TA/ngày**; A tích luỹ giá trị theo thời gian và càng dùng càng mạnh |
| C · Bot hỏi lại 1 câu khi câu hỏi mơ hồ | 75 chuỗi hỏi-lại / 198 tin | Mỗi ngày | Học viên diễn đạt lại 2–7 lượt | ✅ dễ nhất | ❌ đây là **B1**, không phải B2 |
| D · Sửa lỗi format bản tin ("nguồn tham chiếu" chèn giữa từ) | 13 chỗ trong 1/4 bản tin | 1/4 bản tin | Đọc vấp | ✅ | ❌ **bug `str.replace` thiếu biên từ — sửa 1 dòng, không phải bài toán AI.** Vẫn báo lại team vận hành |

**Lý do chọn A bằng số:** A là ứng viên duy nhất mà **giá trị cộng dồn** — mỗi ca được ghim làm giảm chi phí của mọi ca sau, trong khi B phải chạy lại từ đầu mỗi ngày. Bằng chứng A còn cho thấy **giải pháp thủ công đã tự phát sinh** (`M55809` học viên tự lập topic gom issue, `M97517` mod trỏ người sang đó) — nhu cầu được người dùng tự xác nhận bằng hành động, không phải bằng lời nói. Đổi lại A có **n nhỏ nhất** (19 tin) nên bắt buộc bù bằng khảo sát ≥20 người trước CP4.

---

## Ô 4 · LÁT CẮT — MỘT CÂU

> **Một học viên khoá 4 hỏi một lỗi kỹ thuật trong Discord · AI quyết định câu hỏi này có khớp với một mục tri thức đã được TA ghim hay không, và có đủ chắc để tự trả lời hay không · nếu chắc thì trả lời kèm link tới ca gốc đã được TA duyệt, nếu không chắc thì tag TA — TA không phải gõ lại hướng dẫn đã gõ.**

Bốn mảnh: **ai** = học viên gặp lỗi kỹ thuật · **việc** = hỏi cách sửa · **quyết định AI** = câu này có khớp một mục tri thức đã ghim, đủ chắc để trả lời không · **kết quả** = trả lời có dẫn ca gốc, hoặc chuyển TA.

**Bước phụ trợ (khai rõ, không phải quyết định trung tâm):** khi TA thả 📌 lên một đoạn chat đã gỡ xong, AI tóm tắt đoạn đó thành một mục tri thức *(triệu chứng → cách sửa → link ca gốc)*. Đây là bước nạp dữ liệu; **quyết định được chấm điểm là bước truy hồi ở trên**.

*Tự kiểm: bỏ chữ AI đi thì việc "tìm lại cách sửa lỗi đã từng được gỡ" vẫn tồn tại — hiện đang làm bằng tay qua topic `M55809`.* ✅

**Non-goals *(bản build không được vi phạm)*:**
1. **Không tự sinh cách sửa lỗi mới** — chỉ trả lại nội dung đã được TA ghim.
2. **Không tự trả lời khi không khớp chắc** — tag TA, không đoán.
3. **Không ghim tự động** — chỉ TA mới tạo được mục tri thức *(đây là cổng người trong thiết kế)*.
4. Không làm intent/hỏi lại của bot (B1), không làm bản tin cuối ngày.
5. Không nêu tên/định danh học viên trong mục tri thức — dẫn link ca gốc, không dẫn người.

---

## Ô 5 · AUTOMATION + LÝ DO *(theo cost-of-error)*

☐ Augment ☑ **Conditional** ☐ Automate

**Thiết kế:** AI **tự trả lời** khi câu hỏi khớp chắc một mục đã được TA ghim; **chuyển TA** khi không đủ chắc.

**Lý do:** nội dung trả lời đã qua cổng người (TA ghim) nên **phát lại nội dung đó là an toàn** — đó là lý do được phép tự động. Nhưng thứ AI tự quyết là **việc khớp**: khớp sai thì học viên chạy nhầm lệnh `docker`/`usermod` cho một lỗi khác và **hỏng môi trường ngay trước buổi lab** — sửa rất đắt. Ngược lại chuyển nhầm sang TA khi thật ra có mục khớp thì chỉ tốn TA vài giây — rất rẻ. Lệch giá đó buộc **chỉ tự trả lời ở case chắc, còn lại chuyển người**.

> **Ghi chú so với bản canvas trước:** bản trước ghi *"Automate toàn bộ"*. Theo taxonomy ở `02-guide.md` §2.3, thiết kế "AI tự làm case chắc, chuyển người case mơ hồ" **chính là Conditional** — Automate là tự làm hết kể cả case mơ hồ. Đây là **sửa tên gọi cho đúng rubric, không đổi thiết kế**. Ghi "Automate" mà bản build lại có nhánh chuyển TA thì R2 mất điểm vì khai không khớp bản build.

---

## Ô 6 · WILLING USERS *(≥2 người thật ngoài nhóm)*

| # | Họ tên | Mã học viên | Đã đồng ý thử trước CP5 |
|---|---|---|---|
| 1 | **Nguyễn Văn Biển** | 2A202602416 | ✅ |
| 2 | **Nguyễn Phúc Bảo** | 2A202602925 | ✅ |
| 3 | *(nên xin thêm 1 TA/Mod — họ là job executor thật của lát cắt này)* | | ☐ |

---

## Ô 7 · PHÂN CÔNG

| Ai | Mã học viên | Phần việc |
|---|---|---|
| **Đoàn Bá Khải** *(đội trưởng)* | 2A202602728 | Nộp cả 5 form CP1–CP5 bằng **cùng một mã học viên**; viết `spec.md` |
| **Nguyễn Văn An** | 2A202602782 | Code prototype: flow bấm được (CP2) + lời gọi AI thật ở quyết định khớp/không khớp (CP3) |
| **Trần Ngọc Khuyến** | 2A202602682 | Mining data: siết mẫu đếm, chấm tay 30 mẫu, khảo sát ≥20 người có log nguyên văn |
| **Đỗ Thanh Lâm** | 2A202602577 | Chạy kiểm thử & demo: golden set ≥20 case, quality bar bằng số, bảng kết quả trong `eval/` |

---

## Chỗ khó đã nhìn thấy trước *(để dành spec §5 — CP4)*

| # | Lớp | Tình huống thật |
|---|---|---|
| ① | Nguồn sự thật | Mục tri thức ghim từ 2 tuần trước **đã lỗi thời** (CVAT đổi version) — trả lại là hại |
| ② | Mơ hồ | *"em bị lỗi 500"* — 500 có thể là OPA, có thể là migration chưa xong. Khớp mục nào? |
| ③ | Ngoài thẩm quyền | Hỏi *"máy em Mac M1 thì sao"* trong khi mục ghim viết cho Ubuntu |
| ④ | Đặc thù domain | Trả nhầm lệnh `sudo usermod -aG docker` cho lỗi khác → hỏng quyền, **học viên mất buổi lab** |

---

## Checklist nộp CP1

- [x] Canvas đủ 4 ô bắt buộc (Ô 1–4) + 3 ô guide §1.5 (Ô 5–7)
- [x] Lát cắt đúng format một câu, đủ 4 mảnh
- [x] Evidence có số đếm + 7 ví dụ nguyên văn + phương pháp kiểm lại được
- [x] Bảng impact 4 ứng viên + lý do chọn bằng số
- [x] Phân công có tên từng người
- [x] **≥2 willing user:** Nguyễn Văn Biển, Nguyễn Phúc Bảo
- [x] Đội trưởng + mã học viên · link repo công khai
