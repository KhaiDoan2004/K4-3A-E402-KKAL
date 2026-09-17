#!/usr/bin/env python3
"""Phương pháp đếm evidence cho B2 — ghim tri thức sau khi gỡ xong sự cố.
Rubric R1 đòi "phương pháp đếm kiểm lại được": mọi con số trong canvas.md ra từ đây.

Chạy:
    python3 eval/dem-discord.py <đường dẫn>/data/discord-pack

Data pack KHÔNG commit vào repo này (quy định bảo mật) — truyền đường dẫn tới
bản data của repo đề bài.
"""
import csv, re, sys, unicodedata, datetime, collections, statistics as st
from pathlib import Path

PACK = Path(sys.argv[1] if len(sys.argv) > 1 else 'data/discord-pack')
rows = list(csv.DictReader(open(PACK / 'k4_messages.csv', encoding='utf-8')))
for r in rows:
    r['is_bot'] = r['is_bot'] == 'True'
    r['mentions_bot'] = r['mentions_bot'] == 'True'
    r['t'] = datetime.datetime.strptime(r['created_at_vn'], '%Y-%m-%d %H:%M')
    r['n_chars'] = int(r['n_chars'])

def norm(s):
    """bỏ dấu, bỏ mask [@D####], còn a-z0-9 + space"""
    # đ/Đ KHÔNG có canonical decomposition trong NFD, nên nó sống sót qua bước
    # bỏ dấu rồi bị [^a-z0-9] xoá thành khoảng trắng. Phải đổi tay TRƯỚC khi NFD,
    # nếu không thì "được không" -> "uoc khong" và 3 cụm hỏi không bao giờ khớp.
    s = s.lower().replace('đ', 'd')
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    s = re.sub(r'\[@?\w+\]', ' ', s)
    return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9\s]', ' ', s)).strip()

# 22 cụm hỏi tiếng Việt đã bỏ dấu. ĐÂY LÀ HEURISTIC —
# phải chấm tay 30 mẫu để đo độ chính xác trước khi đưa vào spec (CP4).
QW = ['cho em hoi','cho minh hoi','cho hoi','the nao','nhu the nao','lam sao',
      'khi nao','bao gio','o dau','tai sao','vi sao','bao nhieu','la gi',
      'co phai','duoc khong','dc ko','duoc ko','co can','ai biet','giup em',
      'giup minh','huong dan']
is_q = lambda r: '?' in r['content'] or any(k in norm(r['content']) for k in QW)

human = [r for r in rows if not r['is_bot']]
bot   = [r for r in rows if r['is_bot']]
hq    = [r for r in human if is_q(r)]

print(f"Tổng {len(rows)} tin · người {len(human)} · bot {len(bot)}")
print(f"Câu hỏi của người (is_q): {len(hq)} / {len(human)} = {len(hq)/len(human):.0%}\n")

# ---------- Câu hỏi rơi: KHÔNG ai reply trực tiếp ----------
replied = {r['reply_to'] for r in rows if r['reply_to'].strip()}
roi = [r for r in hq if r['msg_id'] not in replied]
print(f"Câu hỏi KHÔNG có reply trực tiếp : {len(roi):3d} / {len(hq)} = {len(roi)/len(hq):.0%}   ← số chính")
print("   ⚠️ cận trên: Discord cho trả lời không dùng nút reply nên reply_to có thể rỗng dù đã được trả lời.\n")

# ---------- Thời gian chờ ----------
kids = collections.defaultdict(list)
for r in rows:
    if r['reply_to']:
        kids[r['reply_to']].append(r)
lat_bot, lat_hum = [], []
for r in hq:
    ks = sorted(kids.get(r['msg_id'], []), key=lambda x: x['t'])
    if ks:
        d = (ks[0]['t'] - r['t']).total_seconds() / 60
        (lat_bot if ks[0]['is_bot'] else lat_hum).append(d)
for ten, lat in (("bot ", lat_bot), ("người", lat_hum)):
    q = sorted(lat)
    print(f"Chờ khi {ten} trả lời : n={len(lat):3d} · median {st.median(lat):.0f}′ · "
          f"p75 {q[int(.75*len(q))]:.0f}′ · max {max(lat):.0f}′")
print()

# ---------- Bot né rồi bỏ rơi ----------
NE = ['khong co thong tin','chua co thong tin','khong tim thay','minh chua ro',
      'chua ro thong tin','nho mod','hoi mod','lien he btc','hoi btc','ngoai pham vi',
      'khong nam trong du lieu','trong du lieu ho tro','tao ticket de']
bot_ne = [r for r in bot if any(k in norm(r['content']) for k in NE)]
ne_ids = {r['msg_id'] for r in bot_ne}
tiep_nhan = sum(1 for r in human if r['reply_to'] in ne_ids)
print(f"Bot né ('không có thông tin' / 'nhờ Mod') : {len(bot_ne):3d} / {len(bot)}")
print(f"  → số ca có người vào tiếp nhận          : {tiep_nhan:3d} / {len(bot_ne)}   ← câu hỏi chết tại đó\n")

# ---------- Tri thức bị gõ lại: các lượt hướng dẫn kỹ thuật lặp ----------
TECH = re.compile(r'cvat|docker', re.I)
tech = [r for r in rows if TECH.search(r['content'])]
tech_h = [r for r in tech if not r['is_bot']]
print(f"Tin nhắn nhắc CVAT/Docker : {len(tech_h)} tin / {len(set(r['author'] for r in tech_h))} người\n")

# "Lượt hướng dẫn" = cụm tin liên tiếp CÙNG tác giả, CÙNG kênh, cách nhau <= 30 phút
luot = []
by_ac = collections.defaultdict(list)
for r in tech_h:
    by_ac[(r['channel'], r['author'])].append(r)
for v in by_ac.values():
    v.sort(key=lambda x: x['t']); cur = [v[0]]
    for a, b in zip(v, v[1:]):
        if (b['t'] - a['t']).total_seconds() <= 1800:
            cur.append(b)
        else:
            if len(cur) >= 3: luot.append(cur)
            cur = [b]
    if len(cur) >= 3: luot.append(cur)
print(f"Lượt hướng dẫn cài đặt (>=3 tin liên tiếp cùng người) : {len(luot)}")
for c in sorted(luot, key=lambda c: c[0]['t']):
    phut = (c[-1]['t'] - c[0]['t']).total_seconds() / 60
    print(f"  {c[0]['created_at_vn']} → {c[-1]['created_at_vn'][-5:]}  "
          f"{c[0]['author']}  {len(c)} tin, kéo {phut:.0f}′")
print(f"  → tổng {sum(len(c) for c in luot)} tin gõ tay cho cùng một lớp sự cố"
      f", bởi {len(set(c[0]['author'] for c in luot))} người khác nhau\n")

# ---------- Câu hỏi thật mỗi ngày mỗi server ----------
print("Câu hỏi thật theo server × ngày:")
dem = collections.Counter((r['guild'], r['created_at_vn'][:10]) for r in hq)
for k in sorted(dem):
    print(f"  {k[0]:9} {k[1]} : {dem[k]:3d}")
print()

# ---------- Baseline: 4 bản tin bot đang chạy ----------
t = open(PACK / 'k4_daily_reports.md', encoding='utf-8').read()
ban_tin = re.split(r'\n## ', t)[1:]
print(f"Baseline — {len(ban_tin)} bản tin bot đã đăng:")
for p in ban_tin:
    ten = p.split('\n')[0][:34]
    co = 'CÓ    ' if 'Học viên đang hỏi gì' in p else 'KHÔNG '
    print(f"  {ten:36} | mục 'Học viên đang hỏi gì': {co}")
loi_k = len(re.findall(r'nguồn tham chiếu(?=[a-zà-ỹ])|\w nguồn tham chiếu\w', t))
print(f"\n  Lỗi chuỗi 'nguồn tham chiếu' chèn giữa từ : {loi_k} chỗ")
print(f"  Nhãn 'chưa xác nhận' (không kiểm chứng được): {t.count('chưa xác nhận')} dòng")
print("  → Độ phủ bản tin 13/09: 5 câu được nhắc / 32 câu thật (L2-3) và / 37 (L3-4) = 14–16%")
