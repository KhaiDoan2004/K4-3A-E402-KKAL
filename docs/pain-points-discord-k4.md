# Pain point mining — Discord khoá 4

**Nguồn:** `data/discord-pack/k4_messages.csv` (1.092 tin) + `data/discord-pack/k4_daily_reports.md` (4 bản tin bot).
**Phạm vi:** 12/09/2026 06:57 → 14/09/2026 23:54 (giờ VN), 2 server, 10 kênh có tin, 202 tác giả đã mã hoá.
**Cách đếm:** script ở [Phụ lục A](#phụ-lục-a--cách-đếm-lại). Mọi con số dưới đây chạy lại được.

> Giới hạn: pack chỉ có 3 ngày đầu onboarding, chỉ kênh public, đã loại 8 tin hoàn cảnh cá nhân. Pain hành chính bị lệch cao; không suy ra cho cả khoá. Không có tên kênh — `channel_##` giữ nguyên, không đoán.

---

## 1. Bức tranh chung

| Chỉ số | Giá trị |
|---|---|
| Tin nhắn | 1.092 (779 người / 313 bot = 29%) |
| Tác giả | 202 (201 người + `BOT`) |
| Câu hỏi của người | **258 / 779 = 33%** |
| Câu hỏi/ngày | 58 (12/09) → 69 (13/09) → 84 (14/09), tăng liên tục |
| Người từng tag bot | 120 / 201 = 60% |
| Tin người tag bot | 307 / 779 = 39% |
| Kênh tập trung | `channel_10` 654 tin (60%), `channel_02` 200, `channel_11` 170 |

Định nghĩa "câu hỏi": tin của người có dấu `?` **hoặc** chứa 1 trong 17 cụm hỏi tiếng Việt đã bỏ dấu (`cho em hoi`, `lam sao`, `o dau`, `la gi`, `duoc khong`, …). Xem `is_q()` ở Phụ lục A.

---

## 2. Pain point xếp hạng

### Bảng chủ đề (nhãn chồng nhau, 1 tin có thể vào nhiều nhãn)

| # | Chủ đề | Tin | Người hỏi |
|---|---|---|---|
| 1 | Ghép team: số thành viên, khác level, đổi/rời nhóm | 49 | 31 |
| 2 | Daily standup: cú pháp, nộp ở đâu, cá nhân hay cả nhóm | 24 | 16 |
| 3 | Repo GitHub: invite 404, clone vs fork, quyền | 18 | 13 |
| 4 | Mentor/Lab Coach: ai phụ trách, liên hệ ai | 14 | 12 |
| 5 | Workshop / office hours: record ở đâu, có tính nghỉ không | 12 | 10 |
| 6 | Phoenix: đăng nhập, mã đội / mã nhóm ở đâu | 10 | 10 |
| 7 | Bắt buộc hay optional, quy chế, sổ tay | 9 | 8 |
| 8 | XP: cộng thế nào, mất XP khi nào | 8 | 7 |
| 9 | Mã nhóm / mã đội / đổi tên định danh | 7 | 4 |
| 10 | Lịch & deadline (hạn nộp, giờ học) | 5 | 5 |
| 11 | CVAT / Docker cài lỗi | 5 | 5 |
| 12 | Chọn / đổi / đề xuất đề tài | 4 | 4 |
| 13 | Tạo / dùng ticket | 3 | 2 |

---

### P1 — Không có nguồn sự thật duy nhất cho quy tắc vận hành

**Số đếm:** 11 nhóm câu hỏi trùng gần đúng, 23 tin. Cộng thêm 24 tin trả lời kiểu "đọc lại tài liệu/thông báo".

Cùng một câu hỏi lặp qua nhiều người, nhiều kênh, nhiều ngày — tài liệu **có tồn tại**, người học không tìm ra.

Ví dụ nguyên văn (≤2 câu mỗi ví dụ, dẫn `msg_id`):

| msg_id | Kênh | Trích |
|---|---|---|
| M83358 | channel_02 | "cho mình hỏi một team bao nhiêu bạn ?" |
| M00554 | channel_02 | "a ơi cho em hỏi là khác level có chung team được k ạ" |
| M01844 | channel_02 | "cho em hỏi là lv2 có cần phải lập team không ạ" |
| M37242 / M55412 | channel_10 | "làm sao để tạo ticket" — 2 người khác nhau, cùng câu |
| M07981 / M90856 | channel_10 | "mã đội với mã nhóm là gì" — 2 người khác nhau |
| M21700 / M74296 | — | "tôi muốn đề xuất đề tài mới thì phải làm sao" |
| M42852 / M84422 | — | "Cú pháp của lệnh bot để thực hiện daily standup?" |

Bằng chứng phía người trả lời — 24 tin đẩy ngược về tài liệu:

| msg_id | Trích |
|---|---|
| M18708 | "Đọc lại thông tin nhé [HV], thông báo là hướng dẫn các bạn hoàn thành quy trình onboard" |
| M25574 | "Ở đây nhé kênh thông báo quan trọng sẽ ở kênh này [link:discord.com]" |
| M10708 | "bro đọc lại hướng dẫn sử dụng đi, tạo team là có lời mời từ bot vào org đấy" |

---

### P2 — Bot trả lời ngay nhưng không đúng ý; người phải hỏi lại 3–7 lượt

**Pain lớn nhất của bot hiện tại.**

**Số đếm:** 75 chuỗi hỏi-lại (cùng người tag bot ≥2 lần trong ≤10 phút, cùng kênh), 198 tin liên quan. Phân bố độ dài chuỗi: 2 lượt × 45, 3 lượt × 21, 4 lượt × 3, 5 lượt × 4, 6 lượt × 1, 7 lượt × 1.

**Chuỗi 6 lượt — D1631, `channel_10`, 19:53 → 19:56 (3 phút):**

| msg_id | Giờ | Trích |
|---|---|---|
| M88243 | 19:53 | "tôi đã lập đội ở trên phoenix, tôi muốn tìm mã đội, thì tìm ở đâu" |
| M81645 | 19:54 | "cụ thể là tìm ở đâu" |
| M65250 | 19:55 | "trên nền tảng phoenix" |
| M06365 | 19:56 | "tìm mã đội, mã nhóm trên nền tảng phoenix" |
| M49339 | 19:56 | "cụ thể từng bước tìm mã đội, mã nhóm trên nền tảng phoenix" |

**Chuỗi 5 lượt — D7699, `channel_10`, 09:05 → 09:14 (standup):**

| msg_id | Trích |
|---|---|
| M57734 | "quy cách nộp daily standup, cả nhóm có phải nộp ko? hình thức nộp như nào, viết ra sao, có mẫu ko" |
| M37965 | "quy cách nộp daily sandup thôi" |
| M01157 | "cả 2 Quy cách nộp daily standup cho cả nhóm và Quy cách nộp daily standup cho cá nhân" |
| M65205 | "nộp ở đâu cơ, phần này mình đánh lệnh /daily-standup rồi mà ko được" |

Thêm: M44772 "[@BOT] ý tôi là miss điểm danh ý" — người học phải tự diễn giải lại ý mình.

**Thời gian chờ trả lời (câu hỏi có reply trực tiếp):**

| Người trả lời | n | median | p75 | max |
|---|---|---|---|---|
| Bot | 109 | **0 phút** | 0 phút | 1 phút |
| Người | 57 | 5 phút | 17 phút | 695 phút |
| Không ai | 45 | — | — | — |

Bot nhanh tuyệt đối nhưng phải 3–7 lượt mới ra đáp án. **Tốc độ không phải pain; độ chính xác lượt đầu mới là pain.**

---

### P3 — Bot trả lời quá dài so với câu hỏi

| Chỉ số | Giá trị |
|---|---|
| Câu hỏi người (tag bot), median | 48 ký tự |
| Trả lời bot, median | 256 ký tự |
| Trả lời bot, p75 / p90 / max | 819 / 1.150 / 1.905 ký tự |
| Tin bot ≥1.000 ký tự | 46 / 313 = **15%** |

Hỏi một dòng, nhận một bức tường. Trên Discord mobile, 1.150 ký tự là vài màn hình cuộn.

---

### P4 — 9% câu bot né, và không có đường thoát

**Số đếm:** 29 / 313 tin bot (9%) thuộc dạng "không có thông tin trong dữ liệu" / "nhờ Mod trả lời giúp".

| msg_id | Nội dung né |
|---|---|
| M35065 | "Mình chưa rõ thông tin câu này lắm, để chắc chắn không sai sót thì mình nhờ Mod vào trả lời giúp bạn ạ!" |
| M73510 | đăng ký phương tiện di chuyển — "không có thông tin cụ thể trong dữ liệu hỗ trợ" |
| M01645 | danh sách giảng viên lớp `c401` / `e403` |
| M41569 | clone hay fork code cho Lab 1 |
| M02666 | hạn thành lập team |

**Số người reply tiếp sau khi bot né: 0 / 29.** Câu hỏi chết tại đó. Bot tag `[@role]` nhưng không tạo ticket, không có trạng thái, không ai xác nhận đã tiếp nhận.

---

### P5 — Câu hỏi rơi

| Chỉ số | Giá trị |
|---|---|
| Câu hỏi không có reply trực tiếp | 70 / 258 = **27%** |
| Không reply **và** không tin nào khác trong kênh 60 phút sau | 15 |

M43428 "mình mới nhắn tin, bạn reply giúp mình nhé" — người học phải tự đi đòi trả lời.

*Lưu ý đọc số:* trong 15 tin trên có cả thông báo `@everyone` của BTC (M47011, M49744, M21817) — thông báo không cần reply. Câu hỏi thật bị rơi nằm trong nhóm 70 tin "không reply trực tiếp"; con số 27% là cận trên vì Discord cho phép trả lời không dùng nút reply.

---

### P6 — Sự cố kỹ thuật chỉ được điều hướng, không được giải

**Số đếm:** 5 người hỏi CVAT / Docker.

| msg_id | Trích |
|---|---|
| M07901 | "Hi, mình vẫn chưa cài được CVAT. Có bạn nào hỗ trợ được mình không?" |
| M12802 | "Ngay sau docker compose up -d, OPA chưa lấy được policy bundle từ cvat-server, nên health check báo: 500" |

M12802 tự tìm ra nguyên nhân (CVAT server chưa xong migration, chờ ~1 phút là hết). Kiến thức này **không được lưu lại ở đâu** — người tiếp theo gặp lại từ đầu. Bot hiện tại không nắm được loại tri thức này.

---

## 3. Baseline "bản tin cuối ngày" — 4 lỗi đếm được

`k4_daily_reports.md`: 4 bản tin (2 server × 2 ngày).

### Lỗi 1 — ký tự `k` bị thay bằng chuỗi "nguồn tham chiếu"

**14 chỗ**, toàn bộ nằm trong bản tin `K4-L2-3 · gửi 2026-09-14`. Các bản tin khác: 0.

| Đúng | Trong bản tin |
|---|---|
| `khi` | `nguồn tham chiếuhi` |
| `kết thúc` | `nguồn tham chiếuết thúc` |
| `khó khăn` | `nguồn tham chiếuhó nguồn tham chiếuhăn` |
| `health check` | `health checnguồn tham chiếu` |
| `kịp thời` | `nguồn tham chiếuịp thời` |

**Root cause:** thay chuỗi cho token nguồn dài đúng 1 ký tự (`k`) bằng `str.replace` không có biên từ. Mọi chữ `k` trong bài đều trúng. Sửa 1 dòng — dùng regex có `\b` / token không trùng ký tự thường, hoặc thay bằng marker không phải chữ cái.

### Lỗi 2 — 2/4 bản tin không có mục "Học viên đang hỏi gì"

| Bản tin | Có mục "Học viên đang hỏi gì" | Số bullet |
|---|---|---|
| K4-L2-3 · gửi 13/09 | ❌ | 0 |
| K4-L2-3 · gửi 14/09 | ✅ | 11 |
| K4-L3-4 · gửi 13/09 | ❌ | 0 |
| K4-L3-4 · gửi 14/09 | ✅ | 11 |

Hai bản tin 13/09 chỉ có một đoạn văn ~1.200 ký tự, không phân mục, không bullet, không có "Learning Coach nên chú ý". Format không ổn định giữa các lần chạy.

### Lỗi 3 — tóm tắt bị cắt cụt giữa câu

Bản tin `K4-L2-3 · gửi 13/09` kết thúc bằng: *"… Một số câu hỏi chưa được giải đá"*. Cắt theo số ký tự, không cắt theo ranh giới câu.

### Lỗi 4 — phủ sót nặng + nhãn trạng thái vô nghĩa

| Bản tin (phủ ngày 13/09) | Bot liệt kê | Câu hỏi thật trong pack | Tỉ lệ phủ |
|---|---|---|---|
| K4-L2-3 | 5 | 30 | 17% |
| K4-L3-4 | 5 | 37 | 14% |

Và **7 dòng** ghi "Đã có phản hồi, chưa xác nhận đã xử lý" — nhãn này không nói được Learning Coach phải làm gì tiếp, cũng không kiểm chứng được từ dữ liệu.

**Lỗi 5 (bổ sung):** bản tin trộn thông báo BTC vào mục "Thảo luận học tập". Ví dụ bản tin `K4-L3-4 · 14/09` xếp "Thông báo lịch workshop định kỳ vào tối thứ 5 và chủ nhật hàng tuần" vào mục thảo luận học viên — đây là thông báo một chiều, không phải thảo luận. Phân loại sai nguồn phát ngôn.

---

## 4. Kết luận — chọn gì để làm

Pain đậm nhất, đo được, sửa được trong hackathon: **P2 + P4**.

Bot hiện tại **nhanh nhưng sai ý** (75 chuỗi hỏi-lại) và **né 9% rồi bỏ rơi** (0/29 ca được ai tiếp nhận). Hai đòn bẩy rẻ:

1. **Hỏi lại 1 câu làm rõ khi câu hỏi mơ hồ**, thay vì trả lời dài đoán bừa. Nhắm vào P2 + P3 cùng lúc.
2. **Khi không có thông tin → tạo ticket / tag TA có trạng thái theo dõi**, không chỉ nói "nhờ Mod". Nhắm vào P4 + P5.

### Metric so với baseline (đã đo sẵn từ pack)

| Metric | Baseline hiện tại | Mục tiêu |
|---|---|---|
| Số lượt hỏi/câu hỏi (median) | 2, p90 ≈ 3 | 1 |
| Tỉ lệ ca bot né được người tiếp nhận | 0% (0/29) | 100% có ticket |
| Độ dài trả lời (median / p90) | 256 / 1.150 ký tự | ≤ 400 ở p90 |
| Câu hỏi không có reply trực tiếp | 27% (70/258) | < 10% |
| Phủ câu hỏi trong bản tin ngày | 14–17% | ≥ 80% nhóm chủ đề |

### Golden set gợi ý

13 chủ đề ở mục 2 là 13 nhóm intent. Mỗi nhóm lấy 3–5 câu thật làm test case, kỳ vọng: trả lời đúng ở lượt 1, hoặc chuyển TA nếu ngoài phạm vi. Các `msg_id` trong báo cáo này dùng được trực tiếp làm seed.

---

## Phụ lục A — cách đếm lại

Chạy từ gốc repo. Không cần cài thêm gì (chỉ stdlib Python 3).

```python
import csv, re, unicodedata, datetime, collections, statistics as st

rows = list(csv.DictReader(open('data/discord-pack/k4_messages.csv')))
for r in rows:
    r['is_bot'] = r['is_bot'] == 'True'
    r['mentions_bot'] = r['mentions_bot'] == 'True'
    r['t'] = datetime.datetime.strptime(r['created_at_vn'], '%Y-%m-%d %H:%M')
    r['n_chars'] = int(r['n_chars'])

def norm(s):
    """bỏ dấu, bỏ mask [@D####], còn a-z0-9 + space"""
    s = unicodedata.normalize('NFD', s.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    s = re.sub(r'\[@?\w+\]', ' ', s)
    return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9\s]', ' ', s)).strip()

QW = ['cho em hoi','cho minh hoi','cho hoi','the nao','nhu the nao','lam sao',
      'khi nao','bao gio','o dau','tai sao','vi sao','bao nhieu','la gi',
      'co phai','duoc khong','dc ko','duoc ko','co can','ai biet','giup em',
      'giup minh','huong dan']
is_q = lambda r: '?' in r['content'] or any(k in norm(r['content']) for k in QW)

human = [r for r in rows if not r['is_bot']]
bot   = [r for r in rows if r['is_bot']]
hq    = [r for r in human if is_q(r)]          # 258

# --- P1: nhóm câu hỏi trùng gần đúng (bag-of-words, 12 từ >2 ký tự, đã sort)
key = lambda r: ' '.join(sorted(set(w for w in norm(r['content']).split() if len(w) > 2))[:12])
g = collections.defaultdict(list)
for r in hq: g[key(r)].append(r)
dups = [v for v in g.values() if len(v) > 1]   # 11 nhóm / 23 tin

# --- P2: chuỗi hỏi-lại (cùng người tag bot >=2 lần trong <=10 phút, cùng kênh)
gg = collections.defaultdict(list)
for r in human:
    if r['mentions_bot']: gg[(r['guild'], r['channel'], r['author'])].append(r)
bursts = []
for v in gg.values():
    v.sort(key=lambda x: x['t']); cur = [v[0]]
    for a, b in zip(v, v[1:]):
        if (b['t'] - a['t']).total_seconds() <= 600: cur.append(b)
        else:
            if len(cur) > 1: bursts.append(cur)
            cur = [b]
    if len(cur) > 1: bursts.append(cur)
# len(bursts) == 75 ; sum(len(b) for b in bursts) == 198 ; max == 7

# --- P2b: thời gian chờ reply
kids = collections.defaultdict(list)
for r in rows:
    if r['reply_to']: kids[r['reply_to']].append(r)
lat_bot, lat_hum, nore = [], [], 0
for r in hq:
    ks = sorted(kids.get(r['msg_id'], []), key=lambda x: x['t'])
    if not ks: nore += 1; continue
    d = (ks[0]['t'] - r['t']).total_seconds() / 60
    (lat_bot if ks[0]['is_bot'] else lat_hum).append(d)
# n=109 median 0p ; n=57 median 5p ; nore=45

# --- P3: độ dài trả lời bot
sizes = sorted(r['n_chars'] for r in bot)      # median 256, p90 1150, max 1905
over1k = sum(1 for s in sizes if s >= 1000)    # 46 / 313

# --- P4: bot né
FAIL = ['khong co thong tin','chua co thong tin','khong tim thay','minh chua ro',
        'chua ro thong tin','nho mod','hoi mod','lien he btc','hoi btc',
        'ngoai pham vi','khong nam trong du lieu','trong du lieu ho tro','tao ticket de']
bf = [r for r in bot if any(k in norm(r['content']) for k in FAIL)]   # 27
bfset = set(r['msg_id'] for r in bf)
followup = sum(1 for r in human if r['reply_to'] in bfset)            # 0

# --- P5: câu hỏi rơi
replied = set(r['reply_to'] for r in rows if r['reply_to'])
no_reply = [r for r in hq if r['msg_id'] not in replied]              # 70
```

Lỗi bản tin:

```python
import re
t = open('data/discord-pack/k4_daily_reports.md').read()
len(re.findall(r'nguồn tham chiếu(?=[a-zà-ỹ])|\w nguồn tham chiếu\w', t))  # 14
t.count('chưa xác nhận')                                                   # 7
[s.split('\n')[0] for s in re.split(r'\n## ', t)[1:]]                      # 4 bản tin
```

---

## Phụ lục B — luật dùng dữ liệu

Theo `data/discord-pack/README.md`:

- Trích dẫn tối đa 2 câu mỗi ví dụ — báo cáo này tuân thủ, ưu tiên dẫn `msg_id`.
- Không nhận diện người từ `D####`, thời gian, ngữ cảnh.
- Không đổ nguyên `k4_messages.csv` vào repo nộp bài, không đưa lên nơi công khai.
- Đưa vào công cụ AI ngoài: chỉ phần tối thiểu.
- Xoá bản sao sau sự kiện khi BTC yêu cầu.
