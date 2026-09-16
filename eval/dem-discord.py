#!/usr/bin/env python3
"""Phương pháp đếm evidence cho B1 — chạy lại được (rubric R1).
    python3 eval/dem-discord.py <đường dẫn>/data/discord-pack/k4_messages.csv
"""
import csv, re, sys, statistics
rows = list(csv.DictReader(open(sys.argv[1], encoding='utf-8')))
H = [r for r in rows if r['is_bot'] == 'False']
B = [r for r in rows if r['is_bot'] == 'True']
tag = [r for r in H if r['mentions_bot'] == 'True']

LOGISTICS = re.compile(r'(deadline|hạn nộp|hạn chót|khi nào|mấy giờ|điểm danh|nộp ở đâu|'
                       r'nộp bài|link|lịch|standup|xp |ticket|point|nghỉ|buổi|zoom|meet|form)', re.I)
# "Co dan nguon" = co the kiem lai duoc: link, tag kenh, hoac noi ro lay tu dau
NGUON = re.compile(r'(\[link:|nguồn|theo thông báo|kênh \[#|#channel)', re.I)
# Bot thua nhan khong chac / chuyen nguoi
CHUYEN_TA = re.compile(r'(mình không (chắc|biết|có thông tin)|chưa có thông tin|'
                       r'liên hệ (TA|trợ giảng|mod)|hỏi TA|không tìm thấy)', re.I)
KHONG_QUYEN = re.compile(r'(không (thể )?truy cập|không xem được|không có quyền|'
                         r'không nắm được thông tin cá nhân|mình không biết bạn)', re.I)

lg = [r for r in tag if LOGISTICS.search(r['content'])]
co_nguon = [r for r in B if NGUON.search(r['content'])]
chuyen = [r for r in B if CHUYEN_TA.search(r['content'])]
tu_choi_quyen = [r for r in B if KHONG_QUYEN.search(r['content'])]
da_reply = {r['reply_to'] for r in rows if r['reply_to'].strip()}
khong_ai_tra = [r for r in H if '?' in r['content'] and r['msg_id'] not in da_reply]

print(f"Tổng {len(rows)} tin · người {len(H)} · bot {len(B)}\n")
print(f"Người tag bot              : {len(tag):4d} / {len(H)} = {len(tag)/len(H):.0%} lưu lượng người")
print(f"  trong đó hỏi hành chính  : {len(lg):4d} / {len(tag)} = {len(lg)/len(tag):.0%}")
print()
print(f"Bot trả lời CÓ dẫn nguồn   : {len(co_nguon):4d} / {len(B)} = {len(co_nguon)/len(B):.0%}")
print(f"→ KHÔNG dẫn nguồn          : {len(B)-len(co_nguon):4d} / {len(B)} = {(len(B)-len(co_nguon))/len(B):.0%}   ← số chính")
print(f"Bot nói 'không chắc'/chuyển TA : {len(chuyen):4d} / {len(B)} = {len(chuyen)/len(B):.1%}")
print(f"Bot nói 'không truy cập được dữ liệu cá nhân' : {len(tu_choi_quyen)} / {len(B)}")
print(f"Độ dài trả lời bot: trung vị {statistics.median(int(r['n_chars']) for r in B):.0f} ký tự, "
      f"p90 {sorted(int(r['n_chars']) for r in B)[int(.9*len(B))]}")
print(f"\nCâu hỏi (có dấu ?) không ai trả lời : {len(khong_ai_tra)}")
print("  ⚠️ heuristic dấu '?' còn bắt nhầm — phải chấm tay trước khi đưa vào spec.\n")

by = {r['msg_id']: r for r in rows}
print("--- Cặp [người hỏi hành chính] → [bot trả lời], 5 ví dụ để chấm tay ---")
n = 0
for b in B:
    p = by.get(b['reply_to'])
    if p and p['is_bot'] == 'False' and LOGISTICS.search(p['content']) and n < 5:
        n += 1
        co = "CÓ nguồn" if NGUON.search(b['content']) else "KHÔNG nguồn"
        print(f"\n  HỎI [{p['msg_id']}]: {p['content'][:90]}")
        print(f"  BOT [{b['msg_id']}] ({b['n_chars']} ký tự, {co}): {b['content'][:130]}")
