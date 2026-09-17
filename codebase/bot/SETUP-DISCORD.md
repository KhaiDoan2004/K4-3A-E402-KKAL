# Tạo bot Discord — 10 phút

## 1. Tạo application

1. Vào **https://discord.com/developers/applications** → **New Application** → đặt tên `botcute` → Create.
2. Tab **General Information** → copy **APPLICATION ID** → đây là `DISCORD_CLIENT_ID`.

## 2. Lấy token

1. Tab **Bot** → **Reset Token** → **Yes, do it** → copy chuỗi hiện ra.
   Nó **chỉ hiện một lần**, mất thì reset lại.
   → đây là `DISCORD_TOKEN`.
2. Vẫn ở tab **Bot**, kéo xuống **Privileged Gateway Intents**, bật:
   - ✅ **MESSAGE CONTENT INTENT**  ← bắt buộc, không bật thì bot không đọc được nội dung tin
   - (SERVER MEMBERS INTENT không cần)
   → **Save Changes**.

> Bot dưới 100 server chỉ cần bật ở đây, không phải xin duyệt.

## 3. Mời bot vào server test

Tab **OAuth2** → **URL Generator**:

- **SCOPES**: tick `bot` **và** `applications.commands`
- **BOT PERMISSIONS**: `Send Messages` · `Send Messages in Threads` · `Create Public Threads` · `Embed Links` · `Read Message History` · `Add Reactions`

Copy link sinh ra ở dưới, mở trên trình duyệt, chọn server test của nhóm → **Authorize**.

> Nên tạo một server riêng để demo, đừng cắm thẳng vào server thật của khoá.

## 4. Lấy ID server và ID role

Bật **Developer Mode**: Discord → ⚙️ User Settings → **Advanced** → bật **Developer Mode**.

- **`DISCORD_GUILD_ID`**: chuột phải tên server → **Copy Server ID**.
- **`DISCORD_TA_ROLE_ID`** *(nên có)*: Server Settings → Roles → tạo role `TA` → chuột phải role → **Copy Role ID**.
  Rỗng thì **ai cũng lưu được vào kho** — chỉ chấp nhận khi đang demo.
- **`DISCORD_ALLOWED_CHANNELS`** *(nên có)*: chuột phải kênh → **Copy Channel ID**.
  Nhiều kênh thì ngăn bằng dấu phẩy. Rỗng = bot nghe mọi kênh nó thấy.

## 5. Điền `.env` và chạy

```bash
cd codebase/bot
# mở .env, điền 4 giá trị vừa lấy
node src/discord/register.js   # đăng ký lệnh, chạy một lần
node src/discord/bot.js
```

Thấy dòng `✓ đăng nhập botcute#1234 · kho file:kb.json · 14 mục` là xong.

## 6. Thử đủ 4 đường đi *(đúng thứ tự này để quay video CP3)*

| # | Thao tác | Bot phải làm gì |
|---|---|---|
| 1 | Một người hỏi một lỗi, **TA bấm Reply** rồi trả lời | (chưa có gì) |
| 2 | TA **chuột phải vào tin trả lời của mình** → **Apps** → **Lưu vào kho tri thức** | Hiện bản nháp đã làm mượt, chỉ TA thấy, kèm nút. Bấm **✅ Lưu** |
| 3 | Người khác gõ `@botcute <hỏi lại ý đó>` | Trả lời trong thread + dòng nguồn có link + nút 👍/👎 |
| 4 | Gõ `@botcute cài CVAT trên Macbook M1 sao ạ` | **"Chưa có trong kho"** + tag TA — không đoán |
| 5 | Gõ `@botcute em bị lỗi ở bước này` | **Hỏi lại** cho rõ |
| 6 | Gõ `@botcute cho em xin passcode zoom` | **Từ chối** — ngoài phạm vi |
| 7 | Bấm **👎 Không đúng** dưới một câu trả lời | Báo đã gỡ mục khỏi trả lời tự động + báo TA đã lưu |

## Vướng ở đâu

| Triệu chứng | Nguyên nhân |
|---|---|
| Không thấy mục **Apps** khi chuột phải | Chưa chạy `register.js`, hoặc mời bot thiếu scope `applications.commands` (mời lại bằng link mới) |
| Bot online nhưng tag không trả lời | Chưa bật **MESSAGE CONTENT INTENT**, hoặc `DISCORD_ALLOWED_CHANNELS` không chứa kênh đang test |
| `Missing Access` | Bot chưa được vào kênh đó, hoặc thiếu quyền `Create Public Threads` |
| `Unknown interaction` | Xử lý lâu hơn 3 giây mà chưa `defer` — báo lại, chỗ nào thiếu tôi vá |
