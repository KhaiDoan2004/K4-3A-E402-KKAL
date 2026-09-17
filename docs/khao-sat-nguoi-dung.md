# Khảo sát người dùng — chất lượng Discord Bot khoá 4

**Nguồn:** `docs/Khảo-sát-chất-lượng-Discord-Bot-Level-34-Khóa-4-VIN-AI-20K-Câu-trả-lời.xlsx`
**Mẫu:** **N = 15** học viên khoá 4 · 9 câu hỏi đóng, không có câu trả lời mở.

## Đứng ở đâu so với chuẩn evidence của BTC

BTC nhận evidence theo **chuẩn A và/hoặc B** — chỉ cần đạt một đường là đủ 6 điểm R1.
Nhóm **đã đạt trọn chuẩn B** bằng mining *(xem `spec.md` §1)*. Khảo sát này là đường A, còn thiếu một điều kiện:

| Điều kiện chuẩn A | Yêu cầu | Khảo sát này |
|---|---|---|
| Số người ngoài nhóm | ≥ 20 | **15** ❌ thiếu 5 |
| Tỉ lệ xác nhận nỗi đau | ≥ 50% | **80–87%** ✅ |
| Log đủ câu hỏi + từng câu trả lời | bắt buộc | ✅ file gốc `.xlsx` commit trong `docs/` |

Nói cách khác: **thiếu đúng 5 người là đạt cả hai đường evidence.**

---

## Khảo sát này đo cái gì

Đo **con bot sẵn có của khoá 4**, không phải bot của nhóm KKAL. Nên nó là bằng chứng cho
**bài toán**, không phải bằng chứng rằng sản phẩm của nhóm giải được bài toán đó.
Phần nghiệm thu sản phẩm nằm ở `eval/` và `validation/feedback-log.md`.

Người trả lời đều là **học viên**. Người đang chịu chi phí lặp lại trong JTBD của nhóm là **TA** —
nhóm chưa khảo sát được TA.

---

## Sáu con số chính

| Chỉ số | Kết quả |
|---|---|
| Đã từng hỏi bot | **15/15 (100%)** |
| Dùng gần như hằng ngày / vài lần mỗi tuần | **14/15 (93%)** |
| Mức bot hiểu đúng ngay lần đầu *(thang 1–5)* | **median 3** · 12/15 chấm ≤ 3 |
| Đã phải **hỏi lại** vì câu đầu không đúng ý | **13/15 (87%)** |
| Đã phải **tự đi kiểm tra lại** câu trả lời bằng nguồn khác | **12/15 (80%)** |
| Khi kiểm tra lại, bot **không hoàn toàn đúng** | **13/15 (87%)** — trong đó *đúng một phần* 10, *hiểu sai câu hỏi* 2, *thông tin sai* 1 |

**Kiểm tra lại bằng cách nào** *(chọn nhiều)*: xem thông báo Discord 10/15 · hỏi Mentor/Lab Coach/TA 8/15 ·
hỏi BTC/Mod 7/15 · hỏi bạn học 2/15. Không kiểm tra: 3/15.

---

## Bốn điều rút ra

**1. Bot hiện tại không kết thúc câu hỏi, nó thêm một bước.**
12/15 phải đi xác minh lại, và **10 trong 12 người đó xác minh bằng cách hỏi người thật**
(Mentor/Lab Coach/TA 8 · BTC/Mod 7 · bạn học 2).
Nghĩa là mỗi lượt hỏi bot vẫn đẻ ra một lượt hỏi người — đúng chi phí mà nhóm muốn cắt.

**2. Kiểu lỗi phổ biến nhất là "đúng một phần" (10/15), không phải "sai hẳn".**
Đây là kiểu lỗi khó chịu nhất: người dùng không có cách nào biết phần nào đúng nếu không đi kiểm tra.
Nó xác nhận hai lựa chọn thiết kế của nhóm — **bắt buộc dẫn nguồn** *(ai trả lời, lúc nào, link tin gốc
hoặc số trang)* và tách riêng nhãn **`UNCERTAIN`** thay vì gộp vào câu trả lời thường.

**3. Câu hỏi lặp lại là có thật: 9/15 (60%) thấy *thường xuyên* hoặc *rất thường xuyên*** bạn học
hỏi lại câu BTC/TA đã trả lời rồi. Đây là bằng chứng chuẩn A cho lát cắt nhóm đã chọn.

**4. Chờ TA lâu thì **không** đau như nhóm từng giả định.**
Chỉ 2/15 nói *thường xuyên* phải đợi lâu hoặc bị miss; 5/15 nói *chưa bao giờ*.
Nỗi đau nằm ở **độ tin cậy của câu trả lời**, không nằm ở tốc độ. Nhóm giữ nguyên lát cắt nhưng
sửa cách phát biểu vấn đề: giá trị của bot **không** phải "trả lời nhanh hơn TA" mà là
**"trả lời có nguồn, và im lặng đúng lúc khi không có nguồn"**.

---

## Phát hiện bất lợi: kho tri thức đang lệch chủ đề

Đối chiếu chủ đề học viên hay hỏi với số mục thật trong kho *(đếm bằng khớp từ khoá trên
tiêu đề + câu hỏi + keywords — chỉ là ước lượng thô)*:

| Chủ đề học viên hỏi | % người hỏi | Số mục trong kho |
|---|---|---|
| **Daily Standup** | 93% | **0** |
| Mentor / Lab Coach | 67% | 3 |
| XP / điểm | 67% | 6 |
| Thành lập / ghép / đổi team · mã đội | 60% / 40% | 8 |
| Workshop / Office Hours | 53% | 1 |
| **Chọn / đổi / đề xuất đề tài** | 53% | **0** |
| Phoenix | 47% | 2 |
| Quy chế / nội dung bắt buộc | 40% | 1 |
| GitHub / repo / quyền truy cập | 27% | 2 |
| *(CVAT / Docker — không có trong khảo sát)* | — | 5 |

**Hai chủ đề hỏi nhiều nhất lại có 0 mục.** Nguyên nhân rõ: 77/100 mục đến từ cuốn sổ tay giới thiệu
chương trình — nó nói về L1–L7, phụ cấp, chứng chỉ, chứ không phải quy trình vận hành hằng ngày.
23 mục còn lại lấy từ 3 ngày chat onboarding, mà 3 ngày đó đang bận cài CVAT.

Nên hiểu đúng: với hai chủ đề này bot sẽ trả `NOT_FOUND` — **đúng theo thiết kế, không phải lỗi**.
Nhưng nó cho thấy kho còn mỏng so với nhu cầu thật, và chỉ dày lên được khi TA dùng thật.
Đây là hạn chế của bản CP3, không phải thứ vá được bằng sửa prompt.

**Việc cần làm:** nhặt câu trả lời của TA về Standup và quy trình đề tài làm mẻ tri thức tiếp theo —
ưu tiên trước mọi chủ đề khác.

---

## Hạn chế của khảo sát *(tự khai)*

- **N = 15, thiếu 5 người so với mốc ≥20 của chuẩn A** *(mốc này do BTC quy định, không phải nhóm tự đặt)*.
- **Mẫu tự nguyện, không ngẫu nhiên.** Người chịu bỏ công điền form nhiều khả năng là người
  dùng bot nhiều hơn mức trung bình của khoá, nên các con số ở trên có thể **nghiêng về phía
  người dùng nặng**.
- **Chỉ hỏi học viên, không hỏi TA** — trong khi TA mới là job executor trong spec.
- **Không có câu mở**, nên không có quote nguyên văn nào từ khảo sát; mọi con số đều là tự đánh giá.
- Câu 4 dùng thang 1–5 nhưng **không định nghĩa từng mức**, nên "3" của hai người có thể khác nhau.
