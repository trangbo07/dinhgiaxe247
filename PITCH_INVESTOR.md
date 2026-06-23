# VALUCAR — PITCH DECK ĐẦU TƯ
### "Định giá xe minh bạch, có AI, thời gian thực — cho cả khách lẻ lẫn showroom"

---

## MỤC LỤC TRÌNH BÀY (Trình tự khuyến nghị)

```
1. Vấn đề thị trường         → Tại sao ValuCar cần tồn tại?
2. Giải pháp                 → ValuCar là gì?
3. Demo sản phẩm             → Luồng người dùng thực tế
4. Tính năng cốt lõi         → Sức mạnh hệ thống
5. Điểm mạnh kỹ thuật        → Lợi thế cạnh tranh
6. Mô hình kinh doanh        → Cách kiếm tiền
7. Bảng giá & Gói            → Cấu trúc doanh thu
8. Stack công nghệ            → Độ tin cậy & khả năng mở rộng
9. Roadmap                   → Kế hoạch tương lai
10. Lời kêu gọi đầu tư       → Vì sao ngay bây giờ?
```

---

## SLIDE 1 — VẤN ĐỀ THỊ TRƯỜNG

### Thị trường xe cũ Việt Nam đang "mù giá"

> **Mỗi ngày hàng chục nghìn người Việt mua/bán xe mà không có một con số giá đáng tin.**

**3 nỗi đau lớn:**

| Người mua/bán lẻ | Showroom / Đại lý | Thị trường |
|---|---|---|
| Không biết xe mình trị giá bao nhiêu | Định giá thủ công, tốn thời gian | Giá cả thiếu minh bạch, dễ ép giá |
| Phụ thuộc "giá cò", dễ bị thiệt | Bỏ sót lead khách từ web | Không có dữ liệu tham chiếu đáng tin |
| Mất hàng giờ tra thủ công Chợ Tốt, Bonbanh | Không có báo cáo xu hướng thị trường | Mỗi nơi một giá, không thể so sánh |

**Quy mô thị trường:**
- Hơn **400.000 xe cũ** giao dịch mỗi năm tại Việt Nam
- Hàng nghìn showroom, đại lý xe trên toàn quốc
- Thị trường xe cũ tăng trưởng ~15% mỗi năm

---

## SLIDE 2 — GIẢI PHÁP: VALUCAR LÀ GÌ?

### Nền tảng định giá xe AI — một hệ sinh thái, hai đối tượng

```
┌─────────────────────────────────────────────────────┐
│                    VALUCAR                          │
│                                                     │
│  👤 KHÁCH LẺ              🏢 DOANH NGHIỆP           │
│  ──────────────           ──────────────────        │
│  Định giá miễn phí        Dashboard đầy đủ          │
│  Không cần tài khoản      Lead khách tự động        │
│  Kết quả trong vài phút   Báo cáo thị trường        │
│  Có lý do, có nguồn       Xuất PDF chuyên nghiệp    │
└─────────────────────────────────────────────────────┘
              ↕ Dữ liệu thực từ:
         Chợ Tốt  ·  Bonbanh  ·  AI Gemini
```

**Tagline:** *"Biết giá xe trong vài phút — minh bạch, có lý do."*

---

## SLIDE 3 — DEMO: LUỒNG NGƯỜI DÙNG

### Luồng 1: Khách vãng lai (không cần đăng ký)

```
Vào trang chủ
     ↓
Nhập thông tin xe (hãng, dòng, năm, km, màu, nhu cầu)
     ↓
AI phân tích & tham chiếu thị trường (Chợ Tốt + Bonbanh)
     ↓
Nhận kết quả:
  • Khoảng giá tham chiếu (low – mid – high)
  • 3+ lý do giải thích chi tiết
  • Gợi ý liên hệ showroom
     ↓
Lead tự động vào dashboard doanh nghiệp ✓
```

### Luồng 2: Doanh nghiệp (Dashboard đầy đủ)

```
Đăng nhập tài khoản DN
     ↓
Dashboard tổng quan (KPI, định giá gần đây)
     ↓
┌─────────────────────────────────────────┐
│  Định giá không giới hạn                │
│    → Nhập tay HOẶC chụp ảnh (AI nhận diện)
│    → Xuất PDF kết quả định giá          │
│                                         │
│  Quản lý Lead Khách                     │
│    → Xem khách từ landing page          │
│    → SĐT, xe, nhu cầu, khoảng giá      │
│    → Cập nhật trạng thái: Mới→Liên hệ  │
│                                         │
│  Báo cáo Tổng Hợp                       │
│    → Biểu đồ 6 tháng xu hướng          │
│    → Top hãng, tỉ lệ lead, tăng trưởng │
│    → Xuất PDF báo cáo                   │
│                                         │
│  Chat AI không giới hạn                 │
│    → Tư vấn xe ngập nước, sơn lại...   │
│    → Chiến lược bán hàng               │
└─────────────────────────────────────────┘
```

---

## SLIDE 4 — TÍNH NĂNG CỐT LÕI

### 4.1 Định Giá AI Thời Gian Thực
- Tích hợp **Google Gemini AI** phân tích tình trạng xe
- Tham chiếu dữ liệu **Chợ Tốt & Bonbanh** (30 ngày gần nhất)
- Hệ số điều chỉnh thông minh: mua vs bán, màu xe, km
- Kết quả kèm **giải thích rõ ràng**, không phải con số "trên trời"

### 4.2 Định Giá Bằng Ảnh (AI Vision)
- Upload 1 ảnh xe → AI tự nhận diện hãng, dòng, năm
- Giảm thao tác nhập tay, tăng trải nghiệm người dùng
- Ứng dụng thực tế tại showroom khi tiếp nhận xe mới

### 4.3 Lead Management Tích Hợp
- Mỗi khách vãng lai định giá trên web = **1 lead tự động**
- Showroom nhận đầy đủ: tên, SĐT, xe, nhu cầu mua/bán, khoảng giá
- Quản lý trạng thái: Mới → Đã liên hệ → Đóng
- **Không bỏ sót khách hàng tiềm năng nào**

### 4.4 Báo Cáo Kinh Doanh
- Biểu đồ xu hướng 6 tháng: định giá + lead
- Phân tích nhu cầu thị trường (Mua/Bán, Top hãng)
- KPI: tỉ lệ xử lý lead, tăng trưởng %
- **Xuất PDF chuyên nghiệp** cho họp nội bộ

### 4.5 So Sánh 2 Dòng Xe
- So sánh song song: giá, xu hướng, rủi ro
- Hỗ trợ tư vấn khách hàng chọn lựa tốt hơn

### 4.6 Chat AI Chuyên Gia
- Hỏi đáp không giới hạn với AI Gemini
- Tư vấn: xe ngập nước, sơn lại, chiến lược bán, checklist

---

## SLIDE 5 — ĐIỂM MẠNH KỸ THUẬT & LỢI THẾ CẠNH TRANH

### "Tại sao ValuCar khó copy?"

| Lợi thế | Mô tả |
|---|---|
| **Dữ liệu đa nguồn** | Tổng hợp Chợ Tốt + Bonbanh + AI Gemini = góc nhìn đa chiều |
| **Flywheel dữ liệu** | Càng nhiều showroom → càng nhiều lead → dữ liệu định giá càng chính xác |
| **Two-sided platform** | Khách lẻ dùng free → tạo lead → showroom trả phí để nhận → vòng tự cung |
| **Rate limiting thông minh** | Bảo vệ chi phí AI, chống spam, đảm bảo uptime |
| **Realtime & cloud** | Supabase cloud, lịch sử lưu vĩnh viễn, truy cập mọi thiết bị |
| **Mobile-first** | Responsive hoàn toàn, dashboard dùng tốt trên điện thoại |

### Kiến trúc bảo mật
- **NextAuth** xác thực session an toàn
- **Supabase Row Level Security** — mỗi DN chỉ thấy data của mình
- Rate limit API theo IP + user ID
- Không lưu thông tin thẻ ngân hàng

---

## SLIDE 6 — MÔ HÌNH KINH DOANH

### B2C miễn phí → B2B trả phí (Freemium SaaS)

```
KHÁCH LẺ (Freemium)          DOANH NGHIỆP (SaaS)
────────────────────         ───────────────────────
Định giá miễn phí            Gói Tháng / Quý / Năm
Tạo lead cho showroom    →   Nhận lead, dashboard đầy đủ
Traffic tự nhiên             Doanh thu định kỳ (recurring)
```

**Vòng lặp tăng trưởng:**
```
Khách lẻ vào định giá miễn phí
        ↓
Lead tự động tạo ra
        ↓
Showroom thấy giá trị → mua gói trả phí
        ↓
Showroom dùng nhiều → dữ liệu định giá tốt hơn
        ↓
Kéo thêm khách lẻ → lặp lại
```

**Doanh thu từ:**
1. Gói doanh nghiệp (monthly recurring)
2. Gói năm (discount, tiền mặt trước)
3. Ultra Trial conversion (free 1 tháng → chuyển đổi trả phí)

---

## SLIDE 7 — BẢNG GIÁ & CẤU TRÚC GÓI

### Cá Nhân (Freemium)
| Tính năng | Cá nhân miễn phí |
|---|---|
| Định giá/tháng | 10 lượt |
| Chat AI | 10 lượt/lần |
| Checklist xe cũ | ✓ |
| Lịch sử định giá | ✓ |
| So sánh xe | 5 lượt/tháng |
| Lead khách | ✗ |
| Báo cáo PDF | ✗ |

### Doanh Nghiệp (SaaS Trả Phí)
| Tính năng | DN Trial (free) | Gói Tháng | Gói Quý | Gói Năm |
|---|---|---|---|---|
| Định giá | 3 lượt/tháng | **Không giới hạn** | ∞ | ∞ |
| Chat AI | 5 lượt | **Không giới hạn** | ∞ | ∞ |
| Lead khách website | ✓ | ✓ | ✓ | ✓ |
| Báo cáo + PDF | ✗ | ✓ | ✓ | ✓ |
| Xuất PDF định giá | ✗ | ✓ | ✓ | ✓ |
| So sánh xe | 5/tháng | ∞ | ∞ | ∞ |
| Định giá bằng ảnh | ✓ | ✓ | ✓ | ✓ |

> **Ultra Trial**: 1 tháng dùng đầy đủ miễn phí — không cần thẻ, hủy bất cứ lúc nào
> → Giảm rào cản onboarding, tăng tỉ lệ chuyển đổi

---

## SLIDE 8 — STACK CÔNG NGHỆ

### "Xây để scale, không phải để demo"

```
Frontend:     Next.js 14 (App Router) + TypeScript + Tailwind CSS
Backend:      Next.js API Routes (serverless)
Database:     Supabase (PostgreSQL + Realtime + Auth)
AI Engine:    Google Gemini API (định giá + chat + vision)
Auth:         NextAuth.js + Supabase Auth
Deployment:   Vercel (edge, CDN toàn cầu)
PDF:          Client-side PDF generation
Rate Limit:   Custom in-memory limiter (IP + user)
```

**Tại sao stack này mạnh:**
- **Serverless** = không cần lo server, scale tự động
- **Supabase** = PostgreSQL production-grade, RLS security
- **Vercel Edge** = latency thấp, uptime cao
- **Gemini AI** = model mạnh nhất hiện tại cho tiếng Việt
- **TypeScript toàn bộ** = ít bug, dễ maintain, dễ onboard dev mới

---

## SLIDE 9 — KIẾN TRÚC HỆ THỐNG

```
                    ┌─────────────────┐
                    │   USER (Web)    │
                    └────────┬────────┘
                             │ HTTPS
                    ┌────────▼────────┐
                    │   Next.js App   │
                    │  (Vercel Edge)  │
                    └──┬──────────┬───┘
                       │          │
          ┌────────────▼──┐  ┌────▼──────────────┐
          │  Supabase DB  │  │   Gemini AI API   │
          │  (PostgreSQL) │  │  (Định giá + Chat)│
          │  + Auth + RLS │  │  + Vision (ảnh)   │
          └───────────────┘  └───────────────────┘
                       │
          ┌────────────▼──────────┐
          │  Market Data Layer    │
          │  Chợ Tốt + Bonbanh   │
          └───────────────────────┘
```

**Bảo mật theo lớp:**
```
Layer 1: Rate Limiting (IP + User ID)
Layer 2: NextAuth Session
Layer 3: Supabase Row Level Security
Layer 4: Admin-only API guards
```

---

## SLIDE 10 — TRANG CHỦ & TRẢI NGHIỆM

### Landing Page được thiết kế để convert

**Cấu trúc trang chủ (từ trên xuống):**
1. **Hero** — Tagline + Định giá miễn phí + Stats (30 ngày dữ liệu, 2 nguồn, miễn phí)
2. **Trust Band** — Minh bạch · Nhanh · Cho showroom · An toàn
3. **Form Định Giá Guest** — Không cần đăng ký, dùng ngay
4. **Quy Trình 4 Bước** — Nhập → AI phân tích → Kết quả → Quyết định
5. **Tính Năng** — Một nền tảng cho cả khách lẻ & showroom
6. **Testimonials** — Người dùng nói gì
7. **Bảng Giá** — Cá nhân / Doanh nghiệp, tab chuyển đổi
8. **Business CTA** — Showroom đăng ký/đăng nhập
9. **Contact** — Form liên hệ

**Điểm mạnh UX:**
- Người dùng có thể định giá ngay mà không cần tài khoản
- Mỗi lần khách định giá = 1 lead tự động cho showroom
- Sau định giá → gợi ý đăng ký để lưu lịch sử

---

## SLIDE 11 — ADMIN & QUẢN TRỊ

### Hệ thống admin toàn diện

**Admin Control Center** (`/dashboard/admin`):
- Thống kê toàn hệ thống: Users, Leads, Định giá
- Biểu đồ 14 ngày: Lead/ngày, Định giá/ngày
- Top hãng xe được tìm nhiều nhất
- Phân tích nhu cầu Mua/Bán toàn hệ thống
- **Toggle theme sự kiện** (vd: FIFA World Cup) — không cần deploy

**Quản lý người dùng:**
- Danh sách tất cả tài khoản, ngày đăng ký, lần đăng nhập cuối
- Cấp/thu hồi quyền Admin realtime

**Giám sát dữ liệu:**
- 500 lead mới nhất toàn hệ thống
- 1000 định giá mới nhất toàn hệ thống

---

## SLIDE 12 — ROADMAP

### Đã hoàn thành (v1.0)
- [x] Landing page + form định giá guest
- [x] AI định giá tích hợp Gemini
- [x] Định giá bằng ảnh (AI Vision)
- [x] Dashboard doanh nghiệp đầy đủ
- [x] Lead management tự động
- [x] Báo cáo + biểu đồ xu hướng
- [x] Xuất PDF định giá & báo cáo
- [x] Chat AI không giới hạn
- [x] So sánh 2 dòng xe
- [x] Admin dashboard & quản lý user
- [x] Rate limiting & bảo mật
- [x] Supabase cloud database
- [x] Hệ thống gói & subscription

### Kế hoạch v2.0 (với vốn đầu tư)
- [ ] App mobile native (iOS + Android)
- [ ] Tích hợp thêm nguồn dữ liệu (XeSang, MuaBanNhanh)
- [ ] API mở cho đại lý (B2B2B)
- [ ] Định giá xe theo video (AI Video)
- [ ] Hệ thống đặt lịch xem xe
- [ ] Thanh toán online (VNPAY, MoMo)
- [ ] Báo cáo thị trường tổng hợp theo vùng
- [ ] Multi-language (EN, KH)

---

## SLIDE 13 — TẠI SAO ĐẦU TƯ VÀO VALUCAR?

### 5 lý do mạnh nhất

**1. Thị trường lớn, chưa có đối thủ xứng tầm**
> Không có nền tảng nào tại Việt Nam kết hợp được: AI định giá + lead management + dashboard doanh nghiệp trong một hệ thống.

**2. Mô hình flywheel tự tăng trưởng**
> Khách lẻ dùng free → tạo lead → showroom trả phí → kéo thêm khách → dữ liệu tốt hơn → vòng lặp.

**3. Sản phẩm đã hoàn chỉnh, sẵn sàng scale**
> Không phải MVP, không phải ý tưởng — đây là sản phẩm đầy đủ tính năng, đang chạy thực tế.

**4. Chi phí vận hành thấp, scale nhanh**
> Serverless + Supabase = không cần thuê server, scale tự động theo demand.

**5. Đội ngũ hiểu sản phẩm và thị trường**
> Xây từ nhu cầu thực của showroom Việt Nam, không phải copy mô hình nước ngoài.

---

## SLIDE 14 — KẾU GỌI ĐẦU TƯ

### "Ngay bây giờ là thời điểm đúng"

**Vốn tìm kiếm:** [Điền số tiền]

**Phân bổ sử dụng:**
```
40% — Marketing & Sales (onboarding showroom)
30% — Phát triển tính năng mới (mobile app, API mở)
20% — Đội ngũ (dev, sales, support)
10% — Hạ tầng & vận hành
```

**Mục tiêu 12 tháng:**
- 500+ showroom đăng ký tài khoản doanh nghiệp
- 50+ showroom chuyển sang gói trả phí
- 10.000+ lượt định giá/tháng
- MRR: [mục tiêu doanh thu]

**Liên hệ:**
- Email: nguyenkhactrang2911@gmail.com
- Website: [URL sản phẩm]

---

## CHECKLIST TRƯỚC BUỔI TRÌNH BÀY

### Chuẩn bị demo live
- [ ] Mở sẵn trang chủ — demo định giá guest ngay trước mặt nhà đầu tư
- [ ] Đăng nhập sẵn tài khoản DN demo — show dashboard
- [ ] Chuẩn bị 1 ảnh xe để demo "định giá bằng ảnh"
- [ ] Mở báo cáo có sẵn dữ liệu đẹp (không dùng tài khoản trống)
- [ ] Test kết nối internet trước 30 phút

### Những con số cần thuộc lòng
- Thị trường 400.000+ xe cũ/năm
- 30 ngày dữ liệu thị trường realtime
- 2 nguồn dữ liệu: Chợ Tốt + Bonbanh
- 14 tính năng chính trong dashboard
- 4 bước định giá (< 2 phút)
- Gói trial 1 tháng miễn phí (không cần thẻ)

### Câu hỏi nhà đầu tư hay hỏi — chuẩn bị sẵn
1. **"Dữ liệu giá có chính xác không?"**
   → Kết hợp 2 nguồn thực tế + AI Gemini phân tích + kèm giải thích rõ lý do

2. **"Tại sao showroom cần trả tiền?"**
   → Họ nhận lead khách đã có sẵn xe + giá kỳ vọng, tiết kiệm 80% thời gian tư vấn

3. **"Đối thủ là ai?"**
   → Chợ Tốt (chỉ đăng tin, không định giá), Carmudi (thiếu AI), Excel nội bộ (không có lead)

4. **"Mô hình AI tốn tiền không?"**
   → Rate limiting tự động kiểm soát chi phí AI theo user tier

5. **"Scale lên 1000 showroom có vấn đề không?"**
   → Serverless + Supabase = scale tự động, không cần thêm infra

6. **"Bảo mật dữ liệu khách hàng?"**
   → Row Level Security, mỗi showroom chỉ thấy data của mình

---

## TÓM TẮT 1 TRANG (Elevator Pitch)

> **ValuCar** là nền tảng định giá xe AI đầu tiên tại Việt Nam kết hợp dữ liệu thị trường thực từ Chợ Tốt & Bonbanh với Google Gemini để cho ra khoảng giá tham chiếu minh bạch, có giải thích rõ ràng — trong vài phút.
>
> Mô hình hai chiều: khách lẻ định giá miễn phí → tự động tạo lead cho showroom → showroom trả phí gói dashboard để nhận lead, quản lý lịch sử và xem báo cáo xu hướng thị trường.
>
> Sản phẩm đã hoàn chỉnh, sẵn sàng scale. Thị trường 400.000+ xe cũ/năm, chưa có đối thủ xứng tầm. Đây là thời điểm.

---

*Tài liệu này được chuẩn bị cho buổi trình bày ngày 20/06/2026*
*ValuCar · Định giá xe thông minh · Made in Vietnam 🇻🇳*
