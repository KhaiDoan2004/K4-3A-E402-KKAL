# Khảo sát người dùng — chất lượng Discord Bot khoá 4

**Nguồn:** `docs/Khảo-sát-chất-lượng-Discord-Bot-Level-34-Khóa-4-VIN-AI-20K-Câu-trả-lời.xlsx`
**Mẫu:** **N = 21** học viên khoá 4 · 9 câu hỏi đóng, không có câu trả lời mở.

## Đứng ở đâu so với chuẩn evidence của BTC

BTC nhận evidence theo **chuẩn A và/hoặc B**. Nhóm đạt **cả hai**.

| Điều kiện chuẩn A | Yêu cầu | Khảo sát này |
|---|---|---|
| Số người ngoài nhóm | ≥ 20 | **21** ✅ |
| Tỉ lệ xác nhận nỗi đau | ≥ 50% | **86–90%** ✅ |
| Log đủ câu hỏi + từng câu trả lời | bắt buộc | ✅ file gốc `.xlsx` commit trong `docs/` |

Chuẩn B *(mining 1.092 tin Discord)* nằm ở `spec.md` §1.

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
| Đã từng hỏi bot | **21/21 (100%)** |
| Dùng gần như hằng ngày / vài lần mỗi tuần | **18/21 (86%)** |
| Mức bot hiểu đúng ngay lần đầu *(thang 1–5)* | **median 3** · 18/21 chấm ≤ 3 |
| Đã phải **hỏi lại** vì câu đầu không đúng ý | **19/21 (90%)** |
| Đã phải **tự đi kiểm tra lại** câu trả lời bằng nguồn khác | **18/21 (86%)** |
| Khi kiểm tra lại, bot **không hoàn toàn đúng** | **19/21 (90%)** — *đúng một phần* 16 · *hiểu sai câu hỏi* 2 · *thông tin sai* 1 |

**Kiểm tra lại bằng cách nào** *(chọn nhiều)*: xem thông báo Discord 16/21 · hỏi Mentor/Lab Coach/TA 12/21 ·
hỏi BTC/Mod 11/21 · hỏi bạn học 3/21. Không kiểm tra: 3/21.

---

## Bốn điều rút ra

**1. Bot hiện tại không kết thúc câu hỏi, nó thêm một bước.**
18/21 phải đi xác minh lại, và **14 trong 18 người đó xác minh bằng cách hỏi người thật**
(Mentor/Lab Coach/TA 12 · BTC/Mod 11 · bạn học 3).
Nghĩa là mỗi lượt hỏi bot vẫn đẻ ra một lượt hỏi người — đúng chi phí mà nhóm muốn cắt.

**2. Kiểu lỗi phổ biến nhất là "đúng một phần" (16/21), không phải "sai hẳn".**
Đây là kiểu lỗi khó chịu nhất: người dùng không có cách nào biết phần nào đúng nếu không đi kiểm tra.
Nó xác nhận hai lựa chọn thiết kế của nhóm — **bắt buộc dẫn nguồn** *(ai trả lời, lúc nào, link tin gốc
hoặc số trang)* và tách riêng nhãn **`UNCERTAIN`** thay vì gộp vào câu trả lời thường.

**3. Câu hỏi lặp lại là có thật:** **11/21 (52%)** thấy *thường xuyên* hoặc *rất thường xuyên*
bạn học hỏi lại câu BTC/TA đã trả lời rồi; thêm 10/21 thấy *thỉnh thoảng* — tức **21/21 đều từng thấy**.
Đây là bằng chứng chuẩn A cho lát cắt nhóm đã chọn.

**4. Chờ TA lâu thì **không** đau như nhóm từng giả định.**
Chỉ 2/21 nói *thường xuyên* phải đợi lâu hoặc bị miss; 7/21 nói *chưa bao giờ*.
Nỗi đau nằm ở **độ tin cậy của câu trả lời**, không nằm ở tốc độ. Nhóm giữ nguyên lát cắt nhưng
sửa cách phát biểu vấn đề: giá trị của bot **không** phải "trả lời nhanh hơn TA" mà là
**"trả lời có nguồn, và im lặng đúng lúc khi không có nguồn"**.

---

## Phát hiện bất lợi: kho tri thức đang lệch chủ đề

Đối chiếu chủ đề học viên hay hỏi với số mục thật trong kho *(đếm bằng khớp từ khoá trên
tiêu đề + câu hỏi + keywords — chỉ là ước lượng thô)*:

| Chủ đề học viên hỏi | % người hỏi | Số mục trong kho |
|---|---|---|
| **Daily Standup** | **95%** | **0** |
| **Chọn / đổi / đề xuất đề tài** | **67%** | **0** |
| Mentor / Lab Coach | 62% | 3 |
| Thành lập / ghép / đổi team · mã đội | 57% / 33% | 8 |
| Workshop / Office Hours | 57% | 1 |
| XP / điểm | 52% | 6 |
| Phoenix | 48% | 2 |
| Quy chế / nội dung bắt buộc | 38% | 1 |
| GitHub / repo / quyền truy cập | 29% | 2 |
| *(CVAT / Docker — không có trong khảo sát)* | — | 5 |

**Hai chủ đề hỏi nhiều nhất lại có 0 mục**, và đây là hai chủ đề bỏ xa phần còn lại.
Nguyên nhân rõ: 77/100 mục đến từ cuốn sổ tay giới thiệu chương trình — nó nói về L1–L7, phụ cấp,
chứng chỉ, chứ không phải quy trình vận hành hằng ngày. 23 mục còn lại lấy từ 3 ngày chat onboarding,
mà 3 ngày đó đang bận cài CVAT.

Nên hiểu đúng: với hai chủ đề này bot sẽ trả `NOT_FOUND` — **đúng theo thiết kế, không phải lỗi**.
Nhưng nó cho thấy kho còn mỏng so với nhu cầu thật, và chỉ dày lên được khi TA dùng thật.
Đây là hạn chế của bản CP3, không phải thứ vá được bằng sửa prompt.

**Việc cần làm:** nhặt câu trả lời của TA về Standup và quy trình đề tài làm mẻ tri thức tiếp theo —
ưu tiên trước mọi chủ đề khác.

---

## Hạn chế của khảo sát *(tự khai)*

- **Mẫu tự nguyện, không ngẫu nhiên.** Người chịu bỏ công điền form nhiều khả năng là người
  dùng bot nhiều hơn mức trung bình của khoá, nên các con số ở trên có thể **nghiêng về phía
  người dùng nặng**.
- **Chỉ hỏi học viên, không hỏi TA** — trong khi TA mới là job executor trong spec.
- **Không có câu mở**, nên không có quote nguyên văn nào từ khảo sát; mọi con số đều là tự đánh giá.
- Câu 4 dùng thang 1–5 nhưng **không định nghĩa từng mức**, nên "3" của hai người có thể khác nhau.
  86% dồn vào đúng mức 3 — có thể là tín hiệu thật, cũng có thể là xu hướng chọn mức giữa.
