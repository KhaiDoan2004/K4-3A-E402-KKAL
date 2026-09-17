#!/usr/bin/env python3
"""
Chấm tay 30 mẫu để đo độ chính xác của bộ lọc `is_q` trong dem-discord.py.

    python3 eval/cham-tay.py tao  <thư-mục-data-pack>     # tạo phiếu chấm
    python3 eval/cham-tay.py cham <thư-mục-data-pack>     # chấm và ra kết quả

Vì sao cần: `is_q` là thứ quyết định "tin này có phải câu hỏi không", và nó nằm ở
MẪU SỐ của con số evidence chính (50/245 = 20% câu hỏi không ai reply). Máy gắn nhãn
sai thì con số đó sai theo, mà không ai biết sai bao nhiêu.

Mẫu chia đôi có chủ đích: 15 tin máy nói CÓ + 15 tin máy nói KHÔNG.
Bốc ngẫu nhiên thuần 30 tin thì chỉ được ~9 tin dương — không đủ để đo cả hai chiều sai.
Phiếu KHÔNG hiện máy đoán gì, để người chấm không bị dắt theo.
"""
import csv, sys, re, random, unicodedata, pathlib, collections

SEED = 42
N_MOI_BEN = 15
PHIEU = pathlib.Path(__file__).parent / 'cham-tay-phieu.md'
KETQUA = pathlib.Path(__file__).parent / 'cham-tay-ketqua.md'

def norm(s):
    s = s.lower().replace('đ', 'd')
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    s = re.sub(r'\[@?\w+\]', ' ', s)
    return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9\s]', ' ', s)).strip()

QW = ['cho em hoi','cho minh hoi','cho hoi','the nao','nhu the nao','lam sao',
      'khi nao','bao gio','o dau','tai sao','vi sao','bao nhieu','la gi',
      'co phai','duoc khong','dc ko','duoc ko','co can','ai biet','giup em',
      'giup minh','huong dan']
is_q = lambda c: '?' in c or any(k in norm(c) for k in QW)

def doc_pack(p):
    rows = list(csv.DictReader(open(pathlib.Path(p) / 'k4_messages.csv', encoding='utf-8')))
    return [r for r in rows if r['is_bot'] != 'True']

def lay_mau(human):
    co  = [r for r in human if is_q(r['content'])]
    kho = [r for r in human if not is_q(r['content'])]
    rnd = random.Random(SEED)
    mau = rnd.sample(co, N_MOI_BEN) + rnd.sample(kho, N_MOI_BEN)
    rnd.shuffle(mau)                      # trộn lại để người chấm không đoán được nhóm
    return mau

def tao(pack):
    human = doc_pack(pack)
    mau = lay_mau(human)
    out = ["""# Phiếu chấm tay — `is_q`

**Câu hỏi cần trả lời cho từng tin:** *tin này có đang nhờ người khác cung cấp thông tin
hoặc trợ giúp không?* — bất kể có dấu `?` hay không.

- `c` = **có**, đây là câu hỏi cần ai đó trả lời
- `k` = **không** (kể chuyện, thông báo, cảm thán, trả lời người khác…)

Sửa `nhan: ?` thành `nhan: c` hoặc `nhan: k`. Chấm xong chạy:

```
python3 eval/cham-tay.py cham <thư-mục-data-pack>
```

> Phiếu này **không hiện máy đoán gì** — chấm theo cảm nhận của mình trước đã.
> Phân vân thì hỏi: *nếu không ai trả lời tin này, người gửi có bị kẹt không?*

---
"""]
    for i, r in enumerate(mau, 1):
        noi_dung = r['content'].strip().replace('\n', ' ')
        out.append(f"### {i}. `{r['msg_id']}`\n\n> {noi_dung}\n\n`nhan: ?`\n")
    PHIEU.write_text('\n'.join(out), encoding='utf-8')
    print(f"Đã tạo {PHIEU}  ({len(mau)} tin)")
    print("Mở file đó, điền c/k vào 30 dòng `nhan:`, rồi chạy lại với 'cham'.")

def cham(pack):
    if not PHIEU.exists():
        sys.exit(f"Chưa có {PHIEU} — chạy 'tao' trước.")
    txt = PHIEU.read_text(encoding='utf-8')
    nhan = dict(re.findall(r'### \d+\. `([^`]+)`.*?`nhan:\s*([cCkK?])`', txt, re.S))
    human = doc_pack(pack)
    theo_id = {r['msg_id']: r for r in human}
    mau = lay_mau(human)

    chua = [m for m in mau if nhan.get(m['msg_id'], '?') == '?']
    if chua:
        sys.exit(f"Còn {len(chua)} tin chưa chấm: {', '.join(m['msg_id'] for m in chua[:5])}…")

    tp = fp = tn = fn = 0
    sai_duong, sai_am = [], []
    for m in mau:
        nguoi = nhan[m['msg_id']].lower() == 'c'
        may = is_q(m['content'])
        if may and nguoi: tp += 1
        elif may and not nguoi: fp += 1; sai_duong.append(m)
        elif not may and nguoi: fn += 1; sai_am.append(m)
        else: tn += 1

    tong_co = sum(1 for r in human if is_q(r['content']))
    tong_kho = len(human) - tong_co
    do_chinh_xac = tp / (tp + fp) if tp + fp else 0      # máy nói CÓ thì đúng bao nhiêu
    ti_le_sot   = fn / (fn + tn) if fn + tn else 0       # máy nói KHÔNG thì sót bao nhiêu
    uoc_that = tong_co * do_chinh_xac + tong_kho * ti_le_sot

    L = [f"""# Kết quả chấm tay — `is_q`

Mẫu **{len(mau)} tin** ({N_MOI_BEN} máy nói *có* + {N_MOI_BEN} máy nói *không*), seed `{SEED}`.
Người chấm không nhìn thấy máy đoán gì.

| | Người: **có hỏi** | Người: **không** |
|---|---:|---:|
| Máy nói **có** | {tp} | {fp} |
| Máy nói **không** | {fn} | {tn} |

| Chỉ số | Giá trị | Nghĩa là |
|---|---:|---|
| Máy nói *có* thì đúng | **{do_chinh_xac:.0%}** | {fp}/{N_MOI_BEN} tin bị gắn nhầm thành câu hỏi |
| Máy nói *không* thì sót | **{ti_le_sot:.0%}** | {fn}/{N_MOI_BEN} câu hỏi thật bị bỏ qua |

## Suy ra cho toàn bộ pack

Máy đang gắn **{tong_co}** tin là câu hỏi trên tổng **{len(human)}** tin của người.
Áp hai tỉ lệ trên: số câu hỏi thật ước khoảng **{uoc_that:.0f}** tin
— lệch **{uoc_that - tong_co:+.0f}** so với con số máy đếm.

> Đây là ước lượng từ mẫu 30, **không phải số đếm chính xác**. Mẫu nhỏ nên khoảng dao động rộng;
> dùng để biết con số evidence lệch về hướng nào và cỡ nào, không dùng để thay thế nó.
"""]
    if sai_duong:
        L.append("\n## Máy gắn nhầm thành câu hỏi\n\n| msg_id | Trích |\n|---|---|")
        for m in sai_duong:
            L.append(f"| `{m['msg_id']}` | *\"{m['content'].strip()[:100]}\"* |")
    if sai_am:
        L.append("\n## Câu hỏi thật máy bỏ sót\n\n| msg_id | Trích |\n|---|---|")
        for m in sai_am:
            L.append(f"| `{m['msg_id']}` | *\"{m['content'].strip()[:100]}\"* |")
    L.append("\n*(Trích cắt ở 100 ký tự. Sinh bởi `eval/cham-tay.py`.)*")

    KETQUA.write_text('\n'.join(L), encoding='utf-8')
    print(f"máy nói CÓ  → đúng {tp}/{tp+fp} = {do_chinh_xac:.0%}")
    print(f"máy nói KHÔNG → sót {fn}/{fn+tn} = {ti_le_sot:.0%}")
    print(f"ước số câu hỏi thật: {uoc_that:.0f} (máy đang đếm {tong_co})")
    print(f"\nĐã ghi {KETQUA}")

if __name__ == '__main__':
    if len(sys.argv) < 3 or sys.argv[1] not in ('tao', 'cham'):
        sys.exit(__doc__)
    (tao if sys.argv[1] == 'tao' else cham)(sys.argv[2])
