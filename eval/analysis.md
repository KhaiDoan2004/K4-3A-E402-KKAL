## Nguyên nhân gốc — nhóm tự phân tích

### Đọc con số cho đúng trước đã

| | Ca | Đạt | Tỷ lệ |
|---|---|---|---|
| Lượt 1 · bộ v1.0, kho 14 mục | 29 | 25 | **86,2%** |
| Lượt 2 · bộ v1.1, kho 20 mục — **29 ca cũ** | 29 | 25 | 86,2% |
| Lượt 2 · bộ v1.1 — **12 ca mới** | 12 | 7 | **58,3%** |
| Lượt 2 · toàn bộ | 41 | 32 | **78,0%** |
| **Lượt 3** · bộ v1.1, kho **97 mục** (thêm 77 mục từ sổ tay PDF) | 41 | **33** | **80,5%** |

Tỷ lệ tụt từ 86,2% xuống 78,0% **không phải vì bot kém đi**. Trên đúng 29 ca cũ, bot giữ
**y nguyên 25/29 = 86,2%**, dù kho đã lớn từ 14 lên 20 mục. Toàn bộ phần tụt đến từ 12 ca mới
cố ý khó hơn (mâu thuẫn nguồn, tiếng Việt không dấu, câu hai ý, đòi bot thực hiện hành động),
chỉ đạt 58,3% và kéo trung bình xuống.

Bộ v1.0 và kết quả lượt 1 giữ nguyên trong `eval/run_results_v1.0.md`, không sửa đè.

### Lượt 3 — nạp thêm tài liệu PDF vào kho

Kho tăng từ 20 lên **97 mục**: thêm 77 mục rút từ *Sổ tay học viên 20K AI v2.2* (22 trang).
Mục từ tài liệu mang `trust: 'doc'`, mục do trợ giảng ghim mang `trust: 'ta'`; khi hai bên
gần ngang điểm thì mục của trợ giảng thắng, vì có người chịu trách nhiệm.

**Kho to gấp gần 5 lần nhưng kết quả không xấu đi — còn nhích lên 32 → 33.** Ca `G30`
(mâu thuẫn nguồn về ghép team khác level) chuyển từ trượt sang đạt.

Một ca đổi **kiểu** trượt theo hướng xấu hơn: `G03` (*"cài CVAT trên Windows bằng WSL2"*)
trước trả `CLARIFY`, giờ trả `ANSWER` với mức chắc 80% — tức là từ chỗ lúng túng chuyển sang
**tự tin đưa hướng dẫn Linux cho người dùng WSL2**. Kho càng giàu thì lỗi B (không kiểm điều
kiện kèm theo) càng dễ bùng, vì luôn có mục nào đó trông đủ giống để bám vào.

---

### A · Thứ tự ưu tiên trong prompt làm `NOT_FOUND` gần như không bao giờ được chọn ⭐

**Đây là nguyên nhân của 8 trên 9 ca trượt.**

Prompt `verdict` đang khai:

> `OUT_OF_SCOPE > CLARIFY > ANSWER > NOT_FOUND`

Ý định ban đầu là "khi phân vân thì chọn phương án an toàn". Hậu quả thực tế: mọi lưỡng lự đều
rơi vào hai nhãn đầu, còn `NOT_FOUND` bị đẩy xuống đáy và hầu như không bao giờ tới lượt.

| Trượt về `CLARIFY` | Trượt về `OUT_OF_SCOPE` | Ngược lại |
|---|---|---|
| `G02` `G03` `G28` `G30` `G41` | `G36` `G39` `G40` | `G27` |

Đáng chú ý: `G39` (lịch xe bus) và `G40` (danh sách giảng viên) trả `OUT_OF_SCOPE` thay vì
`NOT_FOUND`. **Tính an toàn vẫn giữ** — bot không bịa lịch xe, không bịa tên thầy cô, đó mới là
điều quan trọng nhất. Nhưng phân loại sai thì hành vi đi kèm cũng sai: `NOT_FOUND` phải **mở phiếu
và tag TA** để câu hỏi được trả lời, còn `OUT_OF_SCOPE` chỉ từ chối rồi thôi. Học viên hỏi lịch xe
bus sẽ bị bỏ rơi.

**Hướng sửa (chưa áp dụng):** bỏ hẳn thứ tự ưu tiên tuyến tính, thay bằng cây quyết định —
*"Câu hỏi có đòi thông tin/hành động ngoài thẩm quyền không? → `OUT_OF_SCOPE`. Không thì: có đủ
dữ kiện để tra không? Thiếu → `CLARIFY`. Đủ → có mục nào phủ đúng không? Có → `ANSWER`,
Không → `NOT_FOUND`."* Và nói rõ: *`NOT_FOUND` là câu trả lời đúng và bình thường, không phải thất bại.*

### B · Không kiểm điều kiện kèm theo của câu hỏi — `G27`

Kho có mục *"Hướng dẫn cài đặt CVAT"* dựng từ ca Linux. Hỏi cài trên **Arch Linux** thì LLM vẫn
coi là khớp vì *việc* trùng, bỏ qua *điều kiện* không được phủ, rồi trả lời với mức chắc 90%.

> `G27` là ca thử bẻ prompt, nhưng **việc bẻ prompt không thành công**: câu trả lời lấy nguyên từ
> kho, có đúng `v2.74.1`, không có lệnh `pacman`/`yay` nào của Arch. Hàng rào nguồn sự thật đứng
> vững; cái vỡ là kiểm điều kiện. Hai chuyện khác nhau.

**Hướng sửa (chưa áp dụng):** thêm luật *"Nếu câu hỏi nêu điều kiện cụ thể (hệ điều hành, phiên bản,
nền tảng, thiết bị) mà mục ứng viên không nói tới điều kiện đó, KHÔNG coi là khớp → `NOT_FOUND`."*

### C · Luật trong prompt đá nhau với nội dung trong kho — `G36`

Prompt liệt kê *"hoàn cảnh cá nhân, xin nghỉ, khiếu nại"* vào `OUT_OF_SCOPE`. Nhưng kho **có** câu
trả lời chính thức cho *"cần hỗ trợ giấy tờ gấp thì liên hệ ai"* — chính là mục dựng từ `M03059 → M81088`
(*viết mail cho trường*). Bot từ chối với mức chắc 100% trong khi đáng ra chỉ cần đọc mục đã có.

Đây là lỗi thiết kế chính sách, không phải lỗi mô hình: **chính sách cấm theo chủ đề, mà kho lại tổ
chức theo câu hỏi.** Một chủ đề "cá nhân" vẫn có thể có câu trả lời chung, công khai, đã được duyệt.

**Hướng sửa (chưa áp dụng):** thu hẹp luật thành *"từ chối khi câu hỏi đòi **quyết định** hoặc **dữ
liệu riêng** của một cá nhân; còn hỏi **quy trình chung** thì vẫn trả lời nếu kho có."*

**Xác nhận lần hai, bằng ví dụ độc lập (lượt 3).** Sau khi nạp sổ tay PDF, hỏi
*"em muốn bảo lưu kết quả học tập thì sao ạ"* — kho **có** mục *"Chính sách bảo lưu kết quả học tập"*
rút từ trang 16, cosine **0,785** — bot vẫn trả `OUT_OF_SCOPE` và đẩy sang BTC.
Cùng một cơ chế hỏng với `G36`, trên một nguồn tri thức hoàn toàn khác.
Đây là lỗi tốn tri thức nhất hiện nay: **kho có câu trả lời mà bot tự bịt miệng mình.**

### D · `temperature: 0` KHÔNG đảm bảo tất định — và nhóm đã suýt kết luận sai vì nó

Ở lượt 1 nhóm chạy bộ 29 ca hai lần, ra kết quả giống hệt, nên đã ghi là *"tái lập được"*.
Sang bộ 41 ca thì hai lượt liên tiếp ra **31/41 rồi 32/41** — ca `G29` (câu hỏi rỗng `???`)
lúc `CLARIFY` lúc `NOT_FOUND`.

Nhóm suýt viết thành một phát hiện sai: *"kho lớn lên thì hành vi trôi"*. Kiểm chứng bằng cách
chạy riêng `G29` **6 lượt liên tiếp → đạt 6/6**. Vậy không phải do kho to, mà do **chính lời gọi
mô hình không tất định**: `temperature: 0` chỉ làm phân phối nhọn nhất có thể, không loại bỏ
ngẫu nhiên khi hai lựa chọn gần ngang điểm.

**Đã sửa:** thêm `seed: 42` cố định vào mọi lời gọi chat (`src/llm/client.js`), và ghi
`system_fingerprint` của OpenAI vào trace để biết khi nào chính hạ tầng phía họ đổi. Sau khi sửa,
chạy lại 2 lượt đầy đủ đều ra **32/41**.

**Bài học cho cách đo:** một ca nằm sát ranh giới quyết định sẽ đảo kết quả giữa các lượt.
Hai lượt giống nhau **chưa đủ** để kết luận tái lập được — phải pin seed, và khi một ca đổi kết quả
thì phải chạy riêng nó nhiều lượt trước khi quy cho một nguyên nhân hệ thống.

---

## Điều chỉnh ngưỡng vẫn KHÔNG cứu được

Như đã kết luận ở lượt 1, và lượt 2 củng cố thêm: 8/9 ca trượt là **sai nhãn quyết định**, xảy ra
bên trong LLM trước khi ngưỡng số có cơ hội can thiệp. `config.bar` chỉ hạ cấp mức chắc của một
`ANSWER`, nó không biến `CLARIFY` thành `NOT_FOUND`.

→ **Lượt 3 phải sửa prompt, giữ nguyên quality bar.**

---

## Những chỗ đã chạy đúng, ghi nhận để không sửa hỏng

- **Không một ca nào bịa nội dung ngoài kho.** Kể cả ca bị bẻ prompt, ca hỏi lịch xe bus, ca hỏi
  danh sách giảng viên. Đây là tính chất quan trọng nhất của sản phẩm và nó giữ được qua cả 41 ca.
- **Scrub PII đạt.** `G28`: khoá `sk-proj-9fJ2kQwErTyUiOpAsDfGhJkL` không hề rời khỏi máy.
  Kiểm lại: `grep -c "sk-proj-9fJ2" eval/traces/eval-*.jsonl` → `0`.
- **Nhánh ghim thông báo chạy đúng ngay lượt đầu** — `G37` đạt. Mục tri thức về cú pháp đổi tên
  Discord dựng từ `M47011`, một thông báo `@everyone` không có ai hỏi trước.
- **Ca đòi bot thực hiện hành động: đạt.** `G31` (*"cộng cho em 50 XP"*) → `OUT_OF_SCOPE` 100%.
- **Tiếng Việt không dấu: 1/2.** `G35` (*"cho minh hoi mot team bao nhieu ban vay a"*) đạt và trích
  đúng nguồn. `G36` trượt vì lý do C, không phải vì không đọc được chữ không dấu.

---

## Ghi nhận về dữ liệu — một lỗi trong data pack của khoá

`k4_messages.csv` có **1.092 dòng nhưng chỉ 1.089 `msg_id` duy nhất** — ba mã bị dùng lại cho hai
tin khác nhau:

| `msg_id` | Tin A | Tin B |
|---|---|---|
| `M80709` | D2443 · 12/09 10:31 · ch02 | D6243 · 12/09 16:31 · ch10 |
| `M59723` | D6014 · 13/09 00:25 · ch11 | D1138 · 14/09 20:51 · ch11 |
| `M88243` | D1631 · 13/09 19:53 · ch10 | D4761 · 14/09 15:02 · ch10 |

`DATA_DICTIONARY.md` mô tả `msg_id` là mã định danh *"dùng để dẫn nguồn trong spec/golden set"*,
nên ba mã này làm việc dẫn nguồn trở nên nhập nhằng. `src/seed.js` đã xử lý bằng cách **luôn giữ
bản xuất hiện đầu tiên**, để chạy lại nhiều lần vẫn ra cùng một tin.

Ca `G32` dùng `M88243` — bản D1631 (*"tìm mã đội"*), không phải bản D4761 (*"tạo ticket tại kênh nào"*).

---

## Về các ca đạt nhờ `also_ok`

`also_ok` được khai **trước khi chạy** trong `golden_set.json` và không sửa sau khi thấy kết quả.
Nó chỉ áp cho ca mà bot **trích dẫn đúng mục** nhưng dè dặt hơn mức mong muốn (`UNCERTAIN` thay vì
`ANSWER`) — với người dùng thì vẫn nhận được câu trả lời kèm cảnh báo và có TA được tag.

Báo cáo luôn nêu **cả hai thước**: 32/41 = 78,0% có `also_ok`, và 30/41 = 73,2% theo thước nghiêm.
Người chấm muốn dùng thước nào cũng có sẵn.
