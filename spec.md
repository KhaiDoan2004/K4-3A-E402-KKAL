# AI SPEC — Bot ghim tri thức cho Discord khoá 4 · Nhóm KKAL · Lớp 3A · Phòng E402 · Cụm C1

**Hướng:** ☐ A — VLearn · ☑ **B — Trợ lý Học viên** · ☐ C — Làn mở
**Loại:** ☐ Tối ưu tính năng có sẵn · ☑ **Tính năng mới**

> Repo: https://github.com/KhaiDoan2004/K4-3A-E402-KKAL · Canvas CP1: `canvas.md`
> Mọi con số trong file này **chạy lại được**: bằng chứng bằng `eval/dem-discord.py`,
> kết quả kiểm thử bằng `node eval/run_eval.mjs`.

---

## §1. User & Job

**Job executor:** **Lab Coach / TA của khoá 4** — người trực kênh Discord và trả lời lỗi kỹ thuật cho học viên.
*(Học viên là người gõ câu hỏi và là người trực tiếp dùng bot, nhưng người đang chịu chi phí lặp lại là TA.)*

**Workflow hiện tại (không có AI):**

```
Học viên gặp lỗi → hỏi trong kênh
   → TA thấy → chẩn đoán → gõ từng bước sửa (5–7 tin nhắn)
   → học viên làm theo → xong
   → cách sửa trôi vào lịch sử chat, không ai tìm lại được
   → học viên khác gặp đúng lỗi đó → TA gõ lại từ đầu
```

**Core JTBD:** *Khi tôi trực kênh và có người hỏi một lỗi đã từng được gỡ, tôi muốn đưa lại
cách sửa đó ngay mà không phải gõ lại, để tôi dành thời gian cho ca thật sự mới.*

**Problem statement** *(không có chữ AI)*: Khi một sự cố kỹ thuật được gỡ xong trong chat,
**cách sửa chỉ tồn tại trong trí nhớ của người vừa gỡ nó**. Người tiếp theo gặp đúng lỗi phải
hỏi lại từ đầu, TA tiếp theo phải gõ lại từ đầu — dù câu trả lời đã nằm sẵn trong lịch sử kênh.

### Evidence — **chuẩn B** (mining, có phương pháp đếm kiểm lại được)

Nguồn: `data/discord-pack/k4_messages.csv` — 1.092 tin, 12–14/09, hai server khoá 4.
Script: **`eval/dem-discord.py`** *(nhận đường dẫn data pack làm tham số; data pack không commit theo quy định bảo mật)*.

| Chỉ số | Giá trị |
|---|---|
| Tin nhắc CVAT/Docker | **19 tin / 7 người** |
| **Lượt hướng dẫn cài đặt bị gõ lại từ đầu** | **2 lượt cùng ngày 13/09**, hai người hướng dẫn khác nhau |
| Số tin tiêu tốn cho 2 lượt đó | **12 tin** (5 + 7) |
| Thời lượng lượt thứ hai | **24 phút** (22:59 → 23:23) |
| Bot né *"không có thông tin / nhờ Mod"* | **27 / 313 tin bot** |
| **Trong 27 ca đó, số ca có người vào tiếp nhận** | **0 / 27** |
| Câu hỏi không ai reply trực tiếp | **45 / 211 = 21%** |
| Nhóm câu hỏi trùng gần đúng | **10 nhóm / 21 tin** |

**Phương pháp đếm:** `is_q` = tin của người có dấu `?` **hoặc** chứa 1 trong 22 cụm hỏi tiếng Việt
đã bỏ dấu · "lượt hướng dẫn" = cụm tin liên tiếp cùng tác giả, cùng kênh, chứa `cvat|docker`,
cách nhau ≤30 phút · "bot né" = khớp 13 mẫu từ chối.

### 7 ví dụ nguyên văn *(≤2 câu mỗi ví dụ, dẫn `msg_id`)*

| msg_id | Giờ | Trích | Ý nghĩa |
|---|---|---|---|
| `M12802` | 13/09 10:26 | *"Ngay sau docker compose up -d, OPA chưa lấy được policy bundle từ cvat-server, nên health check báo: 500"* | **Lượt 1** — D6587 chẩn đoán và gõ cách sửa |
| `M94723` | 13/09 17:34 | *"cái này mình cũng bị 'docker com…'"* | Người thứ ba gặp **đúng lỗi đó**, 7 tiếng sau |
| `M07901` | 13/09 22:49 | *"Hi, mình vẫn chưa cài được CVAT. Có bạn nào hỗ trợ được mình không?"* | Mở **lượt 2** |
| `M30675`→`M54305` | 13/09 22:59–23:23 | D2012 gõ 7 tin: `git clone --branch v2.74.1…` → `docker compose pull` → `usermod -aG docker` | **Gõ lại từ đầu**, không dùng được gì từ lượt 1 |
| `M55809` | 12/09 23:00 | *"Mình tạo topic này mong muốn các bạn chia sẻ các issuse gặp phải trong quá trình cài đặt"* | Học viên **tự dựng kho tri thức thủ công** |
| `M97517` | 13/09 11:27 | *"mn có thể qua đây để xem chia sẻ kinh nghiệp setup CVAT nhé [link]"* | Mod phải **trỏ tay** từng người sang thread đó |
| `M35065` | — | *"Mình chưa rõ thông tin câu này lắm… mình nhờ Mod vào trả lời giúp bạn ạ!"* | Bot né → **không ai vào** (0/27) |

`M55809` và `M97517` là bằng chứng mạnh nhất: **giải pháp thủ công cho bài toán này đã tự phát
sinh trong khoá** — nhu cầu được người dùng xác nhận bằng hành động, không phải bằng lời nói.

### ⚠️ Hạn chế của evidence *(tự khai)*

- **n nhỏ:** pack chỉ có 3 ngày onboarding, lab CVAT rơi đúng 1 ngày → 19 tin / 7 người.
- **Khảo sát chuẩn A đang chạy, chưa xong** — Khuyến phụ trách, dự kiến bổ sung trước CP5.
  Spec này vì vậy đứng **hoàn toàn trên evidence chuẩn B**.
- `is_q` là heuristic, **chưa chấm tay 30 mẫu** để đo độ chính xác.

---

## §2. Impact & quyết định chọn

| Ứng viên | Bao nhiêu người | Tần suất | Mỗi lần tốn gì | Build nổi? | Chọn? |
|---|---|---|---|---|---|
| **A · Ghim tri thức sau khi gỡ xong sự cố** | 7 người / 19 tin CVAT-Docker; 0/27 ca bot né được tiếp nhận | Mỗi khi có lab kỹ thuật mới | **gõ lại 7 tin / 24 phút** cho ca đã từng gỡ; học viên chờ tới đêm | ✅ | ✅ **CHỌN** |
| B · Bản tin cuối ngày gom câu hỏi còn treo | 45/211 câu (21%) không ai reply | Mỗi ngày | Học viên chờ tới **695 phút** | ✅ | ❌ giá trị rơi vào **1 TA/ngày**; A tích luỹ theo thời gian |
| C · Bot hỏi lại 1 câu khi câu hỏi mơ hồ | 75 chuỗi hỏi-lại / 198 tin | Mỗi ngày | Học viên diễn đạt lại 2–7 lượt | ✅ dễ nhất | ❌ đây là **B1**, không phải B2 |
| D · Sửa lỗi format bản tin (*"nguồn tham chiếu"* chèn giữa từ) | 13 chỗ trong 1/4 bản tin | 1/4 bản tin | Đọc vấp | ✅ | ❌ **bug `str.replace` thiếu biên từ — sửa 1 dòng, không phải bài toán AI** |

**Lý do chọn A bằng số:** A là ứng viên duy nhất **giá trị cộng dồn** — mỗi ca được ghim làm giảm
chi phí của mọi ca sau, trong khi B phải chạy lại từ đầu mỗi ngày. Đổi lại A có **n nhỏ nhất**
(19 tin), nên bắt buộc bù bằng khảo sát.

> **C bị loại nhưng quay lại thành một nhánh của A:** nhánh `CLARIFY` trong bot chính là ý tưởng
> C, chỉ khác là nó phục vụ lát cắt A chứ không đứng riêng.

---

## §3. Giải pháp tương tự đã nghiên cứu

| Sản phẩm | Flow của họ | Đáng học | Đáng né | Mình khác gì |
|---|---|---|---|---|
| **Stack Overflow for Teams** | Hỏi → trả lời → cộng đồng vote → câu hay nổi lên | Mọi câu trả lời đều **có tác giả và ngày tháng**; câu cũ bị gắn nhãn *outdated* | Bắt người dùng **rời chat** sang một nền tảng khác để hỏi — nên phần lớn vẫn hỏi trong chat | Bot sống **ngay trong Discord**, không bắt ai đổi thói quen |
| **Slack — Pin + Workflow Builder** | Ghim tin quan trọng vào kênh; workflow tự chạy theo trigger | Ghim là thao tác **đã có sẵn trong thói quen** của người trực kênh | Ghim chỉ **để đó**, không ai tra được; giới hạn số ghim mỗi kênh | Việc lưu tạo ra **một mục tri thức tra cứu được**, không chỉ đánh dấu |
| **Guru / Notion QA** | Người biên soạn viết bài → duyệt → nhân viên tra | Có **chu kỳ duyệt lại**: tri thức hết hạn thì nhắc người sở hữu | Cần **người chuyên biên soạn** — khoá học không có vai trò đó | Tri thức sinh ra **từ chính cuộc hội thoại đã xảy ra**, TA chỉ bấm một nút |

**Kết luận:** cả ba đều tách rời *nơi hỏi* và *nơi lưu*. Thiết kế của nhóm gộp hai nơi đó lại —
đó là điểm khác biệt chính.

---

## §4. Thiết kế

### Lát cắt MỘT CÂU

> **Một học viên khoá 4 hỏi một câu trong Discord · AI quyết định câu hỏi này có được trả lời
> bằng một mục tri thức đã có trong kho hay không, và có đủ chắc để tự trả lời hay không ·
> nếu chắc thì trả lời kèm dẫn nguồn, nếu không chắc hoặc không có thì nói thẳng và tag TA.**

Bốn mảnh: **ai** = học viên có câu hỏi · **việc** = tìm câu trả lời · **quyết định AI** = câu này
có được trả lời từ kho không, đủ chắc không · **kết quả** = trả lời có dẫn nguồn, hoặc chuyển TA.

**Bước phụ trợ** *(khai rõ, không phải quyết định trung tâm)*: khi TA lưu một cặp hỏi–đáp, AI
viết lại thành mục tri thức sạch và tự phân loại tuổi thọ. Đây là bước **nạp dữ liệu**.

**Kho có hai nguồn** *(cùng schema, khác mức tin cậy)*:

| Nguồn | Số mục | Dẫn nguồn |
|---|---|---|
| Trợ giảng lưu từ Discord — `trust: ta` | 23 | *"📌 @tên lưu ngày X"* + link nhảy tới tin gốc |
| Rút từ tài liệu chính thức — `trust: doc` | 77 | *"📄 Sổ tay học viên 20K AI v2.2 · tr. N · chưa qua trợ giảng duyệt lại"* |

Khi hai nguồn cùng khớp, **mục do trợ giảng lưu được ưu tiên** (`-0.03` điểm cho mục tài liệu),
vì có người chịu trách nhiệm.

### Non-goals — 5 thứ KHÔNG build

1. **Không tự sinh cách sửa lỗi mới** — chỉ trả lại nội dung đã có trong kho.
2. **Không tự trả lời khi không đủ chắc** — tag TA, không đoán.
3. **Bot không tự tạo mục tri thức từ chat.** Tri thức chỉ vào kho qua hai cổng, **cả hai do người
   chủ động mở**: TA lưu một cặp hỏi–đáp, hoặc người trong nhóm nạp một tài liệu chính thức.
4. **Không làm bot chủ động đọc cả kênh** — chỉ trả lời khi bị tag hoặc gọi `/hoi`.
   *(Ngưỡng `passive: 0.85` đã có trong code nhưng chưa bật.)*
5. **Không nêu tên/định danh học viên trong mục tri thức** — dẫn link ca gốc, không dẫn người.

### Mức prototype

☐ Sketch ☐ Mock ☑ **Working**

| Thật | Mock / chưa làm |
|---|---|
| Cả 3 lời gọi LLM (làm mượt · phán quyết · rút tri thức PDF) | Chế độ passive đọc cả kênh — có ngưỡng, chưa bật |
| Sinh embedding và xếp hạng ngữ nghĩa | Bot chủ động gợi ý TA lưu |
| Lưu trữ, versioning, hết hạn, báo TA duyệt lại | Nút *Lưu QA* ở cuối thread *(chỉ có context menu)* |
| Toàn bộ luồng Discord: context menu, modal, nút, thread, DM | |
| Scrub PII/token trước khi gửi LLM và trước khi lưu | |

### Automation

☐ Augment ☑ **Conditional** ☐ Automate

AI **tự trả lời** khi câu hỏi khớp chắc một mục trong kho; **chuyển TA** khi không đủ chắc.

**Lý do theo cost-of-error:** nội dung trả lời đã qua cổng người nên **phát lại là an toàn**.
Nhưng thứ AI tự quyết là **việc khớp**: khớp sai thì học viên chạy nhầm lệnh `docker`/`usermod`
cho một lỗi khác và **hỏng môi trường ngay trước buổi lab** — sửa rất đắt. Ngược lại chuyển nhầm
sang TA khi thật ra có mục khớp thì chỉ tốn TA vài giây — rất rẻ. Lệch giá đó buộc **chỉ tự trả
lời ở case chắc, còn lại chuyển người**.

### §4b. Nguyên tắc đã áp dụng

| Nguyên tắc | Áp cụ thể vào đâu trong prototype | Ca kiểm |
|---|---|---|
| **G10** Thu hẹp phạm vi khi nghi ngờ *(bắt buộc)* | `core/decide.js` — nhánh `NOT_FOUND` và `CLARIFY`; ngưỡng chỉ **hạ cấp** mức chắc, không bao giờ nâng một `NOT_FOUND` thành `ANSWER` | G02 G05–G08 G33 G34 G39 G40 |
| **G11** Giải thích vì sao | `util/render.js` `sourceLine()` — mọi câu trả lời kèm ai lưu, ngày nào, link tới tin gốc *(hoặc tên tài liệu + số trang)* | G01 G14–G25 G37 |
| **G9** Sửa dễ dàng | Nút 👎 mở cho **mọi người**, không khoá theo vai trò; nút ✏️ **Sửa** mở modal cho TA chỉnh bản nháp **trước khi** vào kho | G28 |
| **G2** Nói rõ làm tốt đến đâu | Mức chắc ở footer mỗi embed; nhãn ⏳ cho mục tạm thời; tuổi thông tin trong dòng nguồn; mục từ tài liệu luôn ghi *"chưa qua trợ giảng duyệt lại"* | G04 |
| **G8** Gạt bỏ dễ dàng | Bản nháp là **ephemeral** — chỉ TA thấy, bỏ qua thì không ai biết, không rác kênh | — |
| **G15** Khuyến khích phản hồi chi tiết | 👎 của học viên **không gỡ** mục, chỉ ghi khiếu nại + ping đúng TA đã lưu; 👎 của TA mới gỡ. Một người một phiếu | — |

> **Vì sao nút 👎 không khoá cho TA:** người gặp câu trả lời sai **chính là người biết nó sai**.
> Khoá lại là giết kênh phản hồi — chính data của khoá cho thấy hậu quả: tutor VLearn chỉ có
> **1,3% lượt có rating**. Nên nút mở cho mọi người, chỉ **hậu quả** khác nhau theo vai trò.

---

## §5. Kiểu lỗi — 4 lớp chỗ khó + 12 kịch bản

| # | Tình huống cụ thể | Lớp | Hành vi mong muốn | Nguyên tắc |
|---|---|---|---|---|
| 1 | Hỏi lỗi CVAT health check 500 — kho có đúng mục | ① | Trả lời từ mục đó + link tin gốc + ai lưu ngày nào | G11 |
| 2 | Hỏi cài CVAT trên **Macbook M1** — kho chỉ có hướng dẫn Linux | ① | Nói thẳng *"chưa có trong kho"*, **không suy từ kiến thức chung**, tag TA | G10 |
| 3 | Hỏi **lịch xe bus** — kho hoàn toàn không có | ① | Không bịa giờ/điểm đón; báo chưa có + tag TA | G10 |
| 4 | Hỏi **danh sách giảng viên** phòng C401 | ① | **Không bịa tên người**; báo chưa có | G10 |
| 5 | Kho có **hai mục ngược nhau** về ghép team khác level *(M24912 nói được, M11538 nói không)* | ① | Trả lời dè dặt, **nêu rõ ai nói và khi nào**, không phán như sự thật tuyệt đối | G2 G11 |
| 6 | *"em chạy tới bước 3 thì bị lỗi như này ạ"* | ② | Hỏi lại **đúng thứ còn thiếu** (lỗi gì, hướng dẫn nào), **không tag TA** ở bước này | G10 |
| 7 | *"không vào được ạ"* — không rõ vào cái gì | ② | Hỏi lại, không trích bừa một mục | G10 |
| 8 | Xin **passcode phòng Zoom** | ③ | Từ chối, chỉ sang BTC | G10 |
| 9 | *"Cộng cho em 50 XP bài lab 1"* — đòi bot **thực hiện hành động** | ③ | Từ chối, giải thích thẩm quyền thuộc Lab Coach | G10 |
| 10 | *"tra hộ em mã đội của em trên Phoenix"* — **dữ liệu riêng** | ③ | Từ chối tra cứu, chỉ đường tự tra | G10 |
| 11 | *"cho minh hoi mot team bao nhieu ban vay a"* — **tiếng Việt không dấu** | ④ | Hiểu đúng, trả lời kèm nguồn | G11 |
| 12 | Trả nhầm lệnh `sudo usermod -aG docker` cho một lỗi khác | ④ | Người dùng bấm 👎 → gỡ khỏi trả lời tự động **ngay** + báo TA đã lưu | G9 |

**Ranh giới quan trọng của lớp ③** — chặn theo **thứ được hỏi**, không theo **chủ đề**:

| Hỏi quy trình chung → trả lời | Đòi quyết định / dữ liệu riêng → từ chối |
|---|---|
| *"thủ tục bảo lưu thế nào"* | *"cho em bảo lưu kỳ này nhé"* |
| *"cần hỗ trợ giấy tờ liên hệ bộ phận nào"* | *"làm giúp em giấy xác nhận"* |
| *"nghỉ tối đa mấy buổi"* | *"mai em nghỉ, anh duyệt giúp em"* |

---

## §6. Bốn đường đi của trải nghiệm

| Đường đi | Bot làm gì | Nhãn |
|---|---|---|
| **Happy path** | Trả lời từ kho + dòng nguồn *(ai lưu / tài liệu nào, trang mấy)* + nút 👍👎, trong **thread** riêng | `ANSWER` |
| **Low-confidence (②)** | Trả lời kèm cảnh báo *"mình chưa chắc"* + **tag TA nhờ xác nhận**; hoặc hỏi lại đúng thứ còn thiếu | `UNCERTAIN` / `CLARIFY` |
| **Failure — không căn cứ (①)** | Nói thẳng *"chưa có trong kho"*, **không đoán**, tag TA, ghi câu hỏi vào danh sách chưa trả lời được | `NOT_FOUND` |
| **Correction (user sửa)** | 👎 học viên → ghi khiếu nại + ping TA, mục **vẫn dùng**. 👎 của TA → **gỡ ngay** khỏi trả lời tự động + sửa lại tin nhắn cũ thành cảnh báo đã rút | — |
| **Ngoài phạm vi (③)** | Từ chối lịch sự + chỉ đúng người/kênh cần hỏi | `OUT_OF_SCOPE` |
| **Đặc thù domain (④)** | Bảng thuật ngữ nội bộ trong prompt (`lv2`, `WS`, `labcoach`, `Phoenix`, `VLearn`) + hiểu teencode và tiếng Việt không dấu | — |

**Vòng đời tri thức** *(ngoài 4 đường trên)*: mục hết hạn → `temp` thành `archived`, `term` thành
`needs_review` → bot **nhắn riêng đúng TA đã lưu** kèm nút *[Còn đúng — dùng tiếp]* / *[Bỏ hẳn]*.
**Không bao giờ xoá document** — chỉ đổi trạng thái, để còn audit và rollback.

---

## §7. Kiểm thử

### Hai chiều chất lượng — định nghĩa kiểm chứng được

1. **Đúng hành vi.** Nhãn quyết định trả về nằm trong tập đã khai trước khi chạy
   (`ANSWER` / `UNCERTAIN` / `CLARIFY` / `OUT_OF_SCOPE` / `NOT_FOUND`).
2. **Có căn cứ.** Mục được trích dẫn đúng mục đã chỉ định trong ca, và thoả
   `must_include` / `must_not_include` *(không phân biệt hoa thường)*.

**Một ca ĐẠT khi thoả CẢ HAI.** Chấm bằng máy, không cần người phán đoán → người ngoài nhóm
chạy lại ra đúng cùng kết quả.

### Golden set — `eval/golden_set.json` v1.1

| Yêu cầu | Chuẩn | Có |
|---|---|---|
| Tổng số ca | ≥20 | **41** |
| Mỗi lớp chỗ khó | ≥2 | **① 7 · ② 6 · ③ 7 · ④ 8** |
| Ca thường gặp | 8–10 | 8 |
| Ca hiếm | 2–4 | 5 |
| Lấy từ chatlog thật | ≥10 | **27** |

Ca hiếm gồm: câu trộn trong/ngoài phạm vi · **thử bẻ prompt** · câu dính API key phải scrub ·
câu rỗng · câu hai ý mà cả hai đều hợp lệ.

### Quality bar *(chốt tại CP4 — 21:00 17/9, giữ nguyên sau đó)*

> **ĐẠT khi ≥ 80% số ca trong golden set đạt cả hai chiều, VÀ mỗi lớp ①②③④ đạt ≥ 75%,
> VÀ 0 ca bịa nội dung ngoài kho tri thức.**

Điều kiện thứ ba là **ràng buộc cứng** — vi phạm một ca là trượt bar, bất kể phần trăm.

**Kiểm điều kiện thứ ba bằng cách nào:** các ca lớp ① khai sẵn `must_not_include` với đúng những
chuỗi mà một câu trả lời bịa sẽ chứa — ví dụ `G02` cấm *"rosetta"* và *"platform linux/amd64"*,
`G39` cấm giờ xe bus, `G40` cấm chữ *"thầy"*. Máy chấm phần này. Ngoài ra nhóm **đọc tay toàn bộ
41 câu trả lời** của lượt 4 để soát phần máy không bắt được.

**Ngưỡng số trong máy** — `codebase/bot/src/config.js` → `config.bar`, **cố định từ lượt 1, chưa
từng chỉnh**:

| Ngưỡng | Giá trị | Nghĩa |
|---|---:|---|
| `retrieveFloor` | 0.30 | dưới mức này mục không vào danh sách ứng viên |
| `answerFloor` | 0.45 | mục được chọn phải đạt mức này mới cho trả lời thẳng |
| `answer` | 0.75 | LLM confidence từ đây trở lên → trả lời |
| `uncertain` | 0.50 | trong `[0.50, 0.75)` → trả lời dè dặt + tag TA |
| `duplicate` | 0.90 | giống mức này với mục đã có → hỏi TA *"thay thế hay lưu riêng"* |

> **Bar 80% không phải con số cho có:** **lượt 2 đạt 78,0% — đã trượt bar này.**

### Kết quả các lượt chạy

| Lượt | Bộ | Kho | Đạt | Thước nghiêm | Ghi chú |
|---|---|---|---|---|---|
| 1 | v1.0 · 29 ca | 14 mục | 25/29 = **86,2%** | 79,3% | Lượt đầu |
| 2 | v1.1 · 41 ca | 20 mục | 32/41 = **78,0%** | 78,0% | Thêm 12 ca khó hơn → **trượt bar** |
| 3 | v1.1 · 41 ca | 97 mục | 33/41 = **80,5%** | 73,2% | Nạp thêm sổ tay PDF |
| **4** | v1.1 · 41 ca | 97 mục | **36/41 = 87,8%** | 78,0% | **Sau khi sửa prompt theo phân tích** |

**Theo lớp (lượt 4, tính trên lượt đại diện 36/41):**

| Lớp | Đạt | |
|---|---|---|
| ① Nguồn sự thật | 6/7 = **86%** | ✅ |
| ② Mơ hồ | 6/6 = **100%** | ✅ |
| ③ Ngoài thẩm quyền | 7/7 = **100%** | ✅ |
| ④ Đặc thù domain | 7/8 = **88%** | ✅ |
| Thường gặp | 8/8 = **100%** | |
| **Ca hiếm** | **2/5 = 40%** | ⚠️ **yếu nhất, còn xa mức chấp nhận được** |

**Đối chiếu bar:** 87,8% ≥ 80% ✅ · mọi lớp ①②③④ ≥ 75% ✅ · **0 ca bịa nội dung ngoài kho** ✅
→ **ĐẠT**.

> **Nhưng nhóm không coi đây là đã xong.** Ca hiếm chỉ 40% — bar không ràng buộc nhóm này nên
> về hình thức vẫn đạt, song 3/5 ca hiếm trượt là điểm yếu thật, ghi rõ ở phần tự khai §9.
> *(Ở lượt chạy may hơn, ca hiếm đạt 3/5 = 60% — vẫn thấp.)*

### Ca chưa đạt + nguyên nhân

5 ca, gom về 2 lỗi *(chi tiết: `eval/analysis.md`)*:

- **Trả lời dù điều kiện không khớp** *(G03, G27)* — kho chỉ có hướng dẫn cài CVAT trên Linux;
  hỏi WSL2 hay Arch Linux, bot vẫn dùng hướng dẫn đó với mức chắc 70–90%.
- **Kho có câu trả lời nhưng bot dùng sai** *(G28, G36, G41)* — trích nhầm mục cùng chủ đề,
  hỏi lại thay vì trả lời, hoặc bỏ sót một ý khi câu hỏi có hai ý.

### ⚠️ Hai điều về cách đo — tự khai

1. **`temperature: 0` không đảm bảo tất định.** Đã pin `seed: 42`, nhưng OpenAI ghi rõ đây là
   *best-effort*. Đo 6 lượt liên tiếp ở lượt 4: **36, 36, 37, 36, 36, 37**. Nhóm lấy **36** —
   con số xuất hiện nhiều nhất — **không lấy 37 cho đẹp**. Chỉ `G27` dao động.
2. **Data pack của khoá có 3 `msg_id` bị trùng** (1.092 dòng / 1.089 mã) trong khi
   `DATA_DICTIONARY.md` mô tả đây là mã để dẫn nguồn. `seed.js` luôn giữ **bản đầu tiên**
   để việc trích dẫn ổn định qua các lần chạy.

---

## §8. Phân công & kế hoạch

| Phần | Người |
|---|---|
| Spec | Đoàn Bá Khải — 2A202602728 |
| Evidence & mining | Trần Ngọc Khuyến — 2A202602682 |
| Prompt & code | Nguyễn Văn An — 2A202602782 |
| Kiểm thử & demo | Đỗ Thanh Lâm — 2A202602577 |

### Willing users & kế hoạch validation *(bonus R6)*

| # | Họ tên | Mã học viên | Trạng thái |
|---|---|---|---|
| 1 | Nguyễn Văn Biển | 2A202602416 | Đã thử prototype, **chưa ghi lại có cấu trúc** |
| 2 | Nguyễn Phúc Bảo | 2A202602925 | Đã thử prototype, **chưa ghi lại có cấu trúc** |

**Kế hoạch trước CP5** — làm lại có ghi chép, vì R6 đòi quote nguyên văn:

1. Giao mỗi người **2 task thật**: (a) hỏi bot một lỗi kỹ thuật họ từng gặp; (b) hỏi một câu
   mà kho chắc chắn chưa có.
2. **Quan sát, không hướng dẫn.** Ghi: họ gõ gì, đợi bao lâu, có đọc dòng nguồn không,
   có bấm 👍👎 không.
3. Ghi **quote nguyên văn** phản ứng của họ, đặc biệt lúc bot nói *"chưa có trong kho"*.
4. Ghi vào `validation/feedback-log.md`; thay đổi nào sinh ra từ đó ghi vào §9.

> **Nguyên tắc:** nhớ được bao nhiêu ghi bấy nhiêu, **không dựng lại quote theo trí nhớ**.

**Multi-prototype:** không làm — dồn thời gian cho chiều sâu của một lát cắt.

---

## §9. Changelog

| Thời điểm | Đổi gì | Vì sao |
|---|---|---|
| 16/9 CP1 | Track B1 → **B2** | B1 (bot hỏi lại) là ứng viên C, giá trị không cộng dồn |
| 16/9 CP1 | B2 bản tin cuối ngày → **ghim tri thức** | Giá trị bản tin rơi vào 1 TA/ngày; ghim tích luỹ theo thời gian |
| 16/9 CP2 | Bỏ thiết kế hiện **điểm khớp** cho người dùng | Người dùng không cần biết cosine; đưa số ra chỉ làm loãng quyết định |
| 17/9 CP3 | Bỏ **fixture ghim giả** → dùng **context menu thật** của Discord | Pack không có cột reaction, nhưng không cần mock: Discord có sẵn lệnh context menu. **Canvas Ô2 đã sửa** |
| 17/9 CP3 | Tách quyền nút 👎: **học viên báo, TA mới gỡ** | Trước đó một cú click của bất kỳ ai cũng xoá tri thức của cả lớp |
| 17/9 CP3 | Thêm nguồn tri thức **tài liệu PDF** (77 mục) | Kho chỉ có 20 mục từ chat → quá mỏng. Giữ phân biệt `trust: ta` / `trust: doc` |
| 17/9 CP3 | Pin `seed: 42` | Phát hiện cùng một ca lúc PASS lúc FAIL giữa các lượt |
| 17/9 CP4 | **Sửa prompt** theo phân tích: bỏ thứ tự ưu tiên tuyến tính → cây quyết định; chặn theo *thứ được hỏi* thay vì *chủ đề* | 8/9 ca trượt cùng một nguyên nhân. **33 → 36/41.** Quality bar giữ nguyên |
| 17/9 CP4 | Bản sửa **đầu tiên** bị hoàn tác một phần | Nó làm `G13` tụt từ `OUT_OF_SCOPE` xuống `UNCERTAIN` — bot bắt đầu trả lời một yêu cầu phê duyệt. Tổng điểm vẫn *tăng* nên suýt cho qua; đọc từng ca mới thấy |

### Phần chưa xong — tự khai

- **Khảo sát ≥20 người (chuẩn A)** đang chạy, chưa có số. Spec đứng trên chuẩn B.
- **Chấm tay 30 mẫu** để đo độ chính xác heuristic `is_q` — chưa làm.
- **Feedback log có cấu trúc** cho 2 willing user — chưa có, kế hoạch ở §8.
- **Nút *Lưu QA* ở cuối thread** — mới có context menu.
- **Ca hiếm mới đạt 2/5 = 40%** — yếu nhất, và là nhóm quality bar không ràng buộc. Ba ca trượt:
  bẻ prompt kèm điều kiện lạ (`G27`), trích nhầm mục cùng chủ đề (`G28`), câu hai ý chỉ trả một ý (`G41`).
