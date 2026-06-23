# VALUCAR — TÀI LIỆU HỆ THỐNG TOÀN DIỆN
## Tính Năng · Điểm Mạnh · Công Nghệ · Ưu Điểm

> **ValuCar** — Nền tảng định giá xe AI thời gian thực đầu tiên tại Việt Nam,  
> tích hợp dữ liệu thị trường thực từ Chợ Tốt & Bonbanh với Google Gemini 2.5 Flash.

---

# PHẦN I — TỔNG QUAN HỆ THỐNG

## 1.1 Định Nghĩa Sản Phẩm

ValuCar là một **nền tảng SaaS hai chiều (two-sided platform)**:

```
┌──────────────────────────────────────────────────────────────────┐
│                        VALUCAR PLATFORM                          │
│                                                                  │
│   NGƯỜI DÙNG LẺ (B2C)          DOANH NGHIỆP (B2B SaaS)         │
│   ─────────────────────         ─────────────────────────        │
│   • Định giá miễn phí           • Dashboard quản lý đầy đủ      │
│   • Không cần tài khoản         • Lead khách tự động             │
│   • Kết quả < 2 phút            • Báo cáo thị trường             │
│   • Có giải thích, có nguồn     • Chat AI không giới hạn         │
│                                                                  │
│              ↕  Flywheel dữ liệu tự cung                        │
│         Khách lẻ → Lead → Doanh nghiệp trả phí                  │
└──────────────────────────────────────────────────────────────────┘
```

## 1.2 Hai Nhóm Người Dùng

| Đặc điểm | Khách vãng lai | Doanh nghiệp |
|---|---|---|
| Đăng ký | Không bắt buộc | Bắt buộc |
| Tính phí | Miễn phí | Freemium → SaaS |
| Mục đích | Định giá nhanh | Quản lý kinh doanh |
| Giá trị nhận | Khoảng giá + lý do | Lead + báo cáo + công cụ |

---

# PHẦN II — CÁC TÍNH NĂNG CHI TIẾT

## 2.1 Tính Năng Trang Chủ (Landing Page)

### Form Định Giá Khách (GuestValuationForm)
**File:** `src/components/Home/GuestValuationForm/index.tsx`

- Ai cũng có thể định giá ngay, **không cần tạo tài khoản**
- Input: Hãng xe, dòng xe, năm sản xuất, màu sắc, số km, nhu cầu (mua/bán)
- Output: Khoảng giá Low – Mid – High kèm giải thích bằng tiếng Việt
- Rate limit thông minh: 1 lượt/5 giây · 8 lượt/giờ · 30 lượt/ngày/IP
- Sau khi có kết quả: hiển thị widget Chat AI tư vấn thêm
- Mỗi lần định giá = 1 lead tự động lưu vào Supabase → showroom nhận ngay

### Landing Page Structure
**File:** `src/components/Home/LandingPage.tsx`

Cấu trúc tối ưu cho conversion:
```
Hero (tagline + CTA)
  → TrustBand (Minh bạch · Nhanh · Cho showroom · An toàn)
  → GuestValuationForm (định giá ngay)
  → ValuationProcess (4 bước trực quan)
  → Features (1 nền tảng, 2 đối tượng)
  → Testimonials (xã hội chứng thực)
  → Pricing (tab Cá Nhân / Doanh Nghiệp)
  → BusinessCTA (showroom đăng ký)
  → ContactForm (liên hệ trực tiếp)
```

**Tính năng thông minh trên Landing:**
- Người dùng đã đăng nhập → tự động redirect về `/dashboard`
- Query param `?login=1` → tự mở modal đăng nhập (deep link)
- Hiển thị banner nhắc nhở khi dùng link cần đăng nhập
- Hero Stats: "30 ngày · 2 nguồn · Miễn phí"

---

## 2.2 Hệ Thống Định Giá AI (Core Engine)

### Engine Định Giá Chính
**File:** `src/lib/valuation-engine.ts` | **API:** `POST /api/valuation`

**Luồng xử lý 4 tầng:**

```
Input (brand, model, year, color, mileage, intent)
  │
  ▼
[Tầng 1] Fetch Market Data
  ├── Chợ Tốt API (JSON) → lọc 30 ngày gần nhất
  └── Bonbanh (HTML scraping) → parse giá niêm yết
  │
  ▼
[Tầng 2] IQR Outlier Filtering
  ├── Lọc giá dưới 40 triệu hoặc trên 15 tỷ
  ├── Tính Q1, Q3, IQR
  └── Loại bỏ ngoại lệ: giá < Q1 - 1.5×IQR hoặc > Q3 + 1.5×IQR
  │
  ▼
[Tầng 3] Gemini AI Analysis (gemini-2.5-flash)
  ├── Prompt có cấu trúc: thông tin xe + dữ liệu thị trường + hướng dẫn
  ├── Output chuẩn: GIÁ_THẤP_NHẤT, GIÁ_CAO_NHẤT, GIẢI THÍCH
  └── Sanity check: kẹp giá trong khoảng 60%–140% median thị trường
  │
  ▼
[Tầng 4] Buy Intent Adjustment
  ├── Nếu nhu cầu = "mua": trừ ~65 triệu (mức thương lượng phổ biến)
  └── Output: price, priceLow, priceHigh, explanation, source, marketInsights

Fallback tự động:
  • Gemini lỗi → dùng median thị trường
  • Không có market data → dùng thuật toán khấu hao (6%/năm + ODO)
  • Không có cả hai → trả về kết quả dự phòng với cảnh báo
```

**Điểm kỹ thuật nổi bật:**
- **Không bao giờ crash:** 3 tầng fallback đảm bảo luôn trả về kết quả
- **Giá có lý do:** explanation bắt buộc, trích dẫn nguồn
- **Adaptive:** nếu có nhiều nguồn dữ liệu, trọng số theo số mẫu

### Lấy Dữ Liệu Thị Trường Thực
**File:** `src/lib/market-data.ts`

**Chợ Tốt (JSON API):**
```
GET https://gateway.chotot.com/v2/public/ad/listing
  ?cg=2010&q={tên xe}&limit=100&st=s,k
→ Filter: chỉ lấy tin đăng trong 30 ngày gần nhất
→ Dữ liệu: giá, thời gian đăng
```

**Bonbanh (HTML Scraping):**
```
GET https://bonbanh.com/xe-cu/{tên xe}
→ Parse HTML: tìm giá niêm yết từ listing
→ Timeout: 4.5 giây (tránh block request)
```

**Thống kê sau khi có dữ liệu:**
- Tính P25, Median, P75 (tứ phân vị)
- Lọc IQR outlier (loại bỏ giá bất thường)
- Cache 10 phút (tránh gọi API liên tục)
- Output: `{ source, sampleCount, low, high, p25, median, p75 }`

---

## 2.3 Định Giá Bằng Ảnh (AI Vision)

**File:** `src/lib/vehicle-recognition.ts` | **API:** `POST /api/vehicle-detect`

- Upload 1 ảnh xe → AI Gemini Vision nhận diện
- Output có 3 mode:
  - `single_result`: chắc chắn → điền form tự động (confidence, brand, model, year_range, body_type)
  - `multiple_options`: nhiều khả năng → hiển thị dropdown cho user chọn
  - `undetected`: không nhận diện được → thông báo lý do
- Rate limit: 1 lượt/5 giây · 30 lượt/giờ · 100 lượt/ngày/user
- Tiết kiệm thao tác: từ 5 field nhập tay → 0 field cần nhập

---

## 2.4 So Sánh 2 Dòng Xe

**File:** `src/lib/car-compare-prompt.ts` | **API:** `GET /api/valuation/compare`

- So sánh song song 2 xe: giá, xu hướng giá, thanh khoản, rủi ro
- Output AI: phân tích chi tiết, khuyến nghị nên chọn xe nào
- Quota theo đối tượng:
  - Khách không đăng nhập: **5 lượt/thiết bị/tháng** (Device ID tracking)
  - User đăng nhập doanh nghiệp: **40 lượt/giờ · 150 lượt/ngày**
  - Chống spam: 1 lượt/20 giây/IP

---

## 2.5 Chat AI Chuyên Gia

**File:** `src/app/api/chat/route.ts`

**Context AI đầy đủ mỗi lần chat:**
```
[System Prompt]:
  - Vai trò: chuyên gia định giá xe ValuCar
  - Ngôn ngữ: tiếng Việt, súc tích
  - Thông tin xe đang tư vấn (brand, model, year, color, mileage)
  - Giá đã định (basePrice, priceLow, priceHigh)
  - Dữ liệu thị trường THỰC TẾ từ Chợ Tốt + Bonbanh
  - Trung vị tổng hợp + số mẫu
  - Quy tắc: trích dẫn nguồn, không bịa số liệu

[Conversation History]: 8 tin nhắn gần nhất
[User Message]: câu hỏi hiện tại
```

**Model:** `gemini-2.5-flash` (cấu hình qua `.env`)

**Ví dụ câu hỏi AI trả lời tốt:**
- "Xe ngập nước giảm giá bao nhiêu?"
- "Xe sơn lại ảnh hưởng giá như thế nào?"
- "Nên bán nhanh hay giữ giá thêm 1 tháng?"
- "So với Chợ Tốt giá mình đang cao hay thấp?"
- "Checklist chuẩn bị xe trước khi chụp ảnh đăng tin"

**Quota:**
- Khách vãng lai: 25 lượt/giờ · 80 lượt/ngày
- Doanh nghiệp đăng nhập: 80 lượt/giờ · 300 lượt/ngày

---

## 2.6 Dashboard Tổng Quan

**File:** `src/components/Dashboard/DashboardOverview.tsx`
**Route:** `/dashboard`

**KPI Cards:**
- Tổng số lead từ website
- Tổng số lần định giá
- Định giá tháng này
- Quota định giá (∞ nếu gói Pro)

**6 Feature Cards:**
```
[∞] Định giá không giới hạn
[🤖] Chat AI không giới hạn
[👥] Lead khách website (SĐT + xe + giá)
[📊] Báo cáo chuyên sâu
[📷] Định giá bằng ảnh
[📈] Tham chiếu thị trường (Chợ Tốt + Bonbanh + AI)
```

**Danh sách 5 định giá gần nhất** (brand, model, year, giá)

---

## 2.7 Quản Lý Lead Khách

**File:** `src/components/Dashboard/DashboardGuestLeads.tsx`
**Route:** `/dashboard/leads` | **API:** `GET/PATCH /api/guest-leads`

**Thông tin mỗi lead:**
```
┌─────────────────────────────────────────┐
│ Tên khách: [name]                       │
│ SĐT: [phone] ← clickable tel: link     │
│ Nhu cầu: [Mua / Bán]                   │
│ Xe: [brand] [model] [year]              │
│ Phiên bản: [version], Màu: [color]      │
│ ODO: [mileage] km                       │
│ Khoảng giá: [price_low] – [price_high]  │
│ Ghi chú: [note]                         │
│ Ngày tạo: [created_at]                  │
│ Trạng thái: [Mới / Đã liên hệ / Đóng]  │
└─────────────────────────────────────────┘
```

**Tính năng lọc:**
- Lọc nhu cầu: Tất cả / Mua / Bán
- Lọc trạng thái: Tất cả / Mới / Đã liên hệ / Đóng
- Cập nhật trạng thái realtime (PATCH API)
- Làm mới danh sách

---

## 2.8 Lịch Sử Định Giá

**File:** `src/components/Dashboard/DashboardHistory.tsx`
**Route:** `/dashboard/history` | **API:** `GET /api/valuations` (max 50)

- Xem tất cả lịch sử định giá của doanh nghiệp
- Chi tiết mỗi bản ghi: xe, giá, khoảng, giải thích, nguồn, ngày
- **Xuất PDF chi tiết từng xe** (jsPDF):
  - Header: tên doanh nghiệp
  - Thông tin xe đầy đủ
  - Giá định giá + khoảng tham chiếu
  - Giải thích từ AI
  - Timestamp
- Nút truy cập nhanh sang Báo Cáo Tổng Hợp

---

## 2.9 Báo Cáo Kinh Doanh (Business Reports)

**File:** `src/components/Dashboard/DashboardReports.tsx`
**Route:** `/dashboard/reports` | **API:** `GET /api/reports/business`
**Chỉ dành cho:** tài khoản doanh nghiệp

### KPI Cards (4 chỉ số chính):
```
[📊] Tổng định giá     → tháng này / tăng trưởng %
[👥] Tổng lead khách   → tháng này / tăng trưởng %
[💰] Giá TB tham chiếu → trung bình (triệu VND)
[✅] Tỉ lệ lead xử lý  → % đã liên hệ hoặc đóng
```

### Biểu Đồ & Phân Tích:

**Component:** `src/components/Dashboard/ReportCharts.tsx`
**Type:** `src/lib/business-report-stats.ts`

```
TrendLineChart:
  → 14 ngày gần nhất: Lead/ngày vs Định giá/ngày
  
GrowthBarChart:
  → 6 tháng: Định giá + Lead (trend tăng trưởng)
  
DonutStat × 2:
  → Nhu cầu: Mua (%) vs Bán (%)
  → Trạng thái Lead: Mới / Liên hệ / Đóng
  
TopBrands:
  → Top hãng định giá nhiều nhất
  → Top hãng lead tìm nhiều nhất
```

### Insights AI Tự Động:
- Nhận xét dựa trên dữ liệu thực của doanh nghiệp
- Gợi ý hành động cụ thể

### Xuất PDF Báo Cáo Tổng Hợp:
**File:** `src/lib/business-report-pdf.ts`
- `downloadBusinessSummaryPdf(report)`: PDF đầy đủ KPI + biểu đồ
- `downloadValuationDetailPdf(row)`: PDF chi tiết từng xe

---

## 2.10 Cài Đặt Doanh Nghiệp

**File:** `src/components/Dashboard/DashboardSettings.tsx`
**Route:** `/dashboard/settings` | **API:** `GET/PATCH /api/profile`

**4 tab cài đặt:**

| Tab | Nội dung |
|---|---|
| Hồ Sơ DN | Tên công ty, tên liên hệ, SĐT (validate VN), địa chỉ, MST, website |
| Tài Khoản | Xem email, đổi mật khẩu, đăng xuất |
| Thông Báo | Bật/tắt email thông báo khi có lead mới |
| Tùy Chọn | Tuỳ chỉnh khác |

---

## 2.11 Quản Lý Gói & Subscription

**File:** `src/components/Dashboard/DashboardPlans.tsx`
**Route:** `/dashboard/plans`

**Logic hiển thị thông minh:**
- Gói cá nhân → hiển thị quota còn lại
- Gói doanh nghiệp dùng thử → "Còn X lượt tháng này"
- Gói Pro → "Không giới hạn"
- Ultra Trial → "Hết hạn ngày XX/XX/XXXX"

**Ultra Trial 1 Tháng Miễn Phí:**
- Đầy đủ tính năng Pro trong 30 ngày
- Không cần thẻ ngân hàng
- Hủy bất cứ lúc nào
- Nút kích hoạt ngay trong dashboard

---

## 2.12 Tips & AI Insights

**File:** `src/components/Dashboard/DashboardInsights.tsx`
**Route:** `/dashboard/insights`

**5 Tips định giá thực chiến:**
1. Chụp ảnh trước khi định giá (AI nhận diện)
2. Hỏi AI về tình trạng xe trước khi ra giá
3. Đăng tin khung giờ vàng: 19:30 – 22:00
4. Chiến lược neo giá rồi giảm dần
5. Minh bạch tình trạng xe → tăng tin tưởng

**Gợi ý câu hỏi AI:**
- Xe ngập nước giảm giá bao nhiêu?
- Nên bán nhanh hay giữ giá?
- So Chợ Tốt, giá đang cao hay thấp?
- Checklist chuẩn bị xe trước chụp ảnh

---

## 2.13 Admin Dashboard

**File:** `src/components/Dashboard/AdminDashboard.tsx`
**Route:** `/dashboard/admin` | **Chỉ dành cho:** Admin

**KPI Toàn Hệ Thống:**
- Tổng Users + phát sinh tháng này
- Tổng Leads + xu hướng (tăng/bằng/giảm)
- Tổng Định giá
- Leads mới chờ xử lý

**Biểu đồ 14 ngày:** Leads/ngày + Định giá/ngày

**Phân tích nhu cầu:** Mua vs Bán, Top hãng xe

**8 Users mới nhất:** email, ngày đăng ký, vai trò

**Toggle Theme Sự Kiện (đặc biệt):**
- Bật/tắt theme FIFA World Cup 2026
- Áp dụng realtime, không cần redeploy
- API: `POST /api/admin/site-settings`

**Quản lý Users:** `/dashboard/admin/users`
- Cấp/thu hồi quyền Admin realtime

**Giám sát dữ liệu:**
- 500 leads mới nhất: `/dashboard/admin/leads`
- 1000 định giá mới nhất: `/dashboard/admin/valuations`

---

## 2.14 Checklist Xe Cũ

**File:** `src/lib/used-car-checklist.ts`

- Checklist tiêu chuẩn kiểm tra xe cũ theo quy trình chuyên nghiệp
- Hỗ trợ sales tư vấn khách mua xe
- Tích hợp vào dashboard cá nhân

---

## 2.15 Catalog Xe Việt Nam

**File:** `src/lib/vehicle-catalog-data.ts`, `src/lib/vehicle-catalog-match.ts`

- Database hãng/dòng/phiên bản xe phổ biến tại VN
- Dùng để gợi ý autocomplete trong form định giá
- Dùng để match kết quả nhận diện từ ảnh
- API: `GET /api/vehicle-catalog`

---

# PHẦN III — KIẾN TRÚC CÔNG NGHỆ

## 3.1 Tech Stack

```
┌─────────────────────────────────────────────────────────┐
│                    TECH STACK                           │
├─────────────────────────────────────────────────────────┤
│  FRONTEND                                               │
│  ├── Next.js 15.2.8 (App Router + Turbopack)           │
│  ├── React 19.0.0                                       │
│  ├── TypeScript 5                                       │
│  ├── Tailwind CSS 4                                     │
│  ├── Framer Motion 12 (animations)                      │
│  ├── @iconify/react 5 (icons)                           │
│  └── AOS (scroll animations)                            │
├─────────────────────────────────────────────────────────┤
│  BACKEND (Serverless API Routes)                        │
│  ├── Next.js API Routes (Node.js serverless)            │
│  ├── next-auth 4.24 (session management)                │
│  └── Custom middleware (rate limiting, auth guard)      │
├─────────────────────────────────────────────────────────┤
│  DATABASE & AUTH                                        │
│  ├── Supabase (PostgreSQL + Auth + Realtime)            │
│  ├── Row Level Security (data isolation/user)           │
│  └── JWT strategy (NextAuth + Supabase Auth)            │
├─────────────────────────────────────────────────────────┤
│  AI ENGINE                                              │
│  ├── Google Gemini 2.5 Flash (định giá + chat)         │
│  ├── Gemini Vision (nhận diện xe từ ảnh)               │
│  └── Configurable model via .env (GEMINI_MODEL)         │
├─────────────────────────────────────────────────────────┤
│  MARKET DATA                                            │
│  ├── Chợ Tốt JSON API (real-time)                      │
│  ├── Bonbanh HTML scraping                             │
│  ├── IQR outlier filtering                             │
│  └── In-memory cache (10 phút TTL)                     │
├─────────────────────────────────────────────────────────┤
│  DOCUMENT GENERATION                                    │
│  └── jsPDF 4 (xuất PDF client-side)                    │
├─────────────────────────────────────────────────────────┤
│  DEPLOYMENT                                             │
│  └── Vercel (Edge Network, CDN toàn cầu)               │
└─────────────────────────────────────────────────────────┘
```

## 3.2 Dependency Highlights

```json
{
  "next": "15.2.8",           // App Router, Turbopack, Server Components
  "react": "^19.0.0",         // Latest React với concurrent features
  "typescript": "^5",          // Type safety toàn bộ codebase
  "tailwindcss": "^4",         // Utility-first CSS, JIT compiler
  "@supabase/supabase-js": "^2.106.1",  // Supabase client + Auth
  "next-auth": "^4.24.11",    // Session + JWT management
  "framer-motion": "^12.6.3", // Production-grade animations
  "jspdf": "^4.2.1",          // PDF generation không cần server
  "react-hot-toast": "^2.5.2",// Toast notifications
  "date-fns": "^4.1.0",       // Date utilities
  "@openrouter/sdk": "^0.9.11" // Dự phòng AI router
}
```

---

# PHẦN IV — BẢO MẬT & RATE LIMITING

## 4.1 Kiến Trúc Bảo Mật Đa Lớp

```
REQUEST
  │
  ▼ Layer 1: Rate Limiting (src/lib/rate-limit.ts)
  │   • Sliding window algorithm
  │   • Theo IP (khách) hoặc UserID (đăng nhập)
  │   • Multi-window: burst + hourly + daily
  │   • Auto cleanup mỗi 5 phút
  │
  ▼ Layer 2: Authentication (NextAuth + Supabase)
  │   • JWT strategy: token không thể giả mạo
  │   • Session chứa: id, email, role, accountType
  │   • Email confirmation bắt buộc khi đăng ký
  │
  ▼ Layer 3: Authorization (require-admin.ts)
  │   • Admin-only endpoints: kiểm tra role từ token
  │   • Business-only features: kiểm tra accountType
  │
  ▼ Layer 4: Supabase Row Level Security
      • Mỗi user chỉ đọc/ghi data của mình
      • Không thể truy cập data DN khác dù biết ID
```

## 4.2 Rate Limit Chi Tiết

```
ĐỊNH GIÁ:
  Khách (IP):     1/5s · 8/giờ · 30/ngày
  DN đăng nhập:   1/3s · 120/giờ · 500/ngày

CHAT AI:
  Khách (IP):     1/2s · 25/giờ · 80/ngày
  DN đăng nhập:   1/2s · 80/giờ · 300/ngày

NHẬN DIỆN ẢNH:
  DN đăng nhập:   1/5s · 30/giờ · 100/ngày

SO SÁNH XE:
  Khách (device): 5/thiết bị/tháng
  Khách (IP):     1/20s (chống spam)
  DN đăng nhập:   1/10s · 40/giờ · 150/ngày

LEAD:
  Khách (IP):     1/10s · 10/giờ · 40/ngày
```

**Lợi ích của rate limiting:**
- Bảo vệ chi phí Gemini API (quan trọng nhất)
- Ngăn crawl/scraping tự động
- Đảm bảo công bằng giữa các user
- Tự động recovery (retry-after header)

---

# PHẦN V — LUỒNG XỬ LÝ VÀ TÍCH HỢP

## 5.1 Luồng Định Giá Hoàn Chỉnh

```
User nhập thông tin xe
        │
        ▼
POST /api/valuation
        │
   ┌────┴────┐
   │ Check   │ Rate limit → 429 nếu vượt
   │ Auth    │ Xác định: khách hay DN
   └────┬────┘
        │
        ▼
fetchMarketInsights(brand, model, year)
   ├── Chợ Tốt API → [price1, price2, ...]
   └── Bonbanh scraping → [price3, price4, ...]
        │
        ▼
aggregateMarket(insights)
   ├── filterOutliers (IQR method)
   ├── Tính P25, Median, P75
   └── Return: { median, p25, p75, totalSamples }
        │
        ▼
buildValuationPrompt(xe, thị trường)
   └── Structured prompt → Gemini 2.5 Flash
        │
        ▼
parseGeminiResponse(text)
   ├── Extract: GIÁ_THẤP_NHẤT, GIÁ_CAO_NHẤT, GIẢI THÍCH
   └── Sanity check: kẹp trong 60%–140% median
        │
        ▼
applyBuyIntent(result, intent)
   └── Nếu mua: trừ 65 triệu (thương lượng phổ biến)
        │
        ▼
Response: { price, priceLow, priceHigh, explanation, source, marketInsights }
        │
        ▼ (nếu đăng nhập)
Lưu vào Supabase (bảng valuations)
```

## 5.2 Luồng Lead Tự Động

```
Khách định giá trên Landing Page
        │
        ▼
Điền form: tên, SĐT, ghi chú (optional)
        │
        ▼
POST /api/guest-leads
   ├── Rate limit check (IP)
   └── Lưu vào Supabase:
       { name, phone, intent, brand, model, year,
         version, color, mileage, price, price_low,
         price_high, note, status: 'new' }
        │
        ▼
Tất cả showroom có tài khoản DN
  → thấy ngay trong /dashboard/leads
  → SĐT clickable để gọi ngay
  → Cập nhật trạng thái: Mới → Đã liên hệ → Đóng
```

## 5.3 Luồng Xác Thực

```
Đăng ký:
POST /api/register
  ├── Validate: name, email, password (≥6 ký tự)
  ├── Supabase Auth signUp
  │   └── user_metadata: { account_type, company_name/full_name }
  └── Gửi email xác nhận (Supabase built-in)

Đăng nhập:
NextAuth CredentialsProvider
  ├── Supabase Auth signInWithPassword
  ├── Đọc user_metadata: company_name, account_type
  ├── Đọc app_metadata: role (admin check)
  └── JWT token: { id, email, name, role, accountType }

Session:
  └── JWT strategy → token trong cookie http-only
      → Không lộ thông tin, không thể tamper
```

---

# PHẦN VI — MÔ HÌNH DỮ LIỆU

## 6.1 Các Bảng Supabase Chính

```sql
-- Lịch sử định giá (per business user)
valuations (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  brand text, model text, year int,
  color text, mileage int, version text,
  price bigint, price_low bigint, price_high bigint,
  explanation text, source text,
  created_at timestamptz DEFAULT now()
)
-- RLS: user_id = auth.uid()

-- Lead khách vãng lai (shared across all business users)
guest_leads (
  id uuid PRIMARY KEY,
  name text, phone text,
  intent text,  -- 'mua' | 'ban'
  brand text, model text, year int,
  version text, color text, mileage int,
  price bigint, price_low bigint, price_high bigint,
  note text,
  status text DEFAULT 'new',  -- 'new' | 'contacted' | 'closed'
  created_at timestamptz DEFAULT now()
)
-- Visible to all business users

-- Profile doanh nghiệp
business_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users,
  company_name text,
  contact_name text,
  phone text,
  address text,
  tax_code text,
  website text,
  notify_lead boolean DEFAULT true,
  notify_email text,
  updated_at timestamptz
)
-- RLS: user_id = auth.uid()
```

---

# PHẦN VII — CÁC ƯU ĐIỂM VÀ ĐIỂM MẠNH

## 7.1 Ưu Điểm Kỹ Thuật

### Không bao giờ crash — 3 tầng fallback
```
Bình thường:  Gemini AI + Market Data → kết quả tối ưu
Gemini lỗi:   Market Data median → vẫn có kết quả
Không có data: Thuật toán khấu hao → kết quả dự phòng
```
Người dùng **không bao giờ thấy màn hình trắng** vì định giá thất bại.

### Dữ liệu thực, không phải dữ liệu giả
- Pull real-time từ Chợ Tốt API & Bonbanh (2 nguồn độc lập)
- IQR filtering loại bỏ giá bất thường trước khi feed vào AI
- Cache 10 phút để tránh gọi lặp, giảm latency
- Giá luôn có **trích dẫn nguồn** ("Theo Chợ Tốt/Bonbanh...")

### Rate limiting thông minh
- Không dùng Redis (không cần infra phức tạp)
- Sliding window in-memory với auto-cleanup
- Multi-window: burst + hourly + daily (không bị bypass bằng cách đợi)
- Configurable hoàn toàn qua `.env`

### TypeScript end-to-end
- Toàn bộ codebase typed: API response, component props, database types
- Lỗi bắt compile time, không phải runtime
- Dễ refactor, dễ onboard developer mới

### Serverless by design
- Mỗi API route là serverless function
- Auto-scale với traffic
- Không cần quản lý server
- Chi phí = $0 khi không có traffic

## 7.2 Ưu Điểm Sản Phẩm

### Two-sided platform flywheel
```
Khách lẻ dùng free → Tạo lead tự động
Lead chất lượng → Showroom thấy giá trị
Showroom trả phí → Doanh thu tăng
Doanh thu → Cải thiện AI → Định giá tốt hơn
Định giá tốt hơn → Kéo thêm khách lẻ → Lặp lại
```

### Zero friction onboarding
- Khách lẻ: **không cần tạo tài khoản**, định giá ngay
- Showroom: đăng ký 3 field (tên, email, mật khẩu) → vào dashboard ngay
- Ultra Trial: 1 click kích hoạt, không cần thẻ

### Minh bạch tạo niềm tin
- Kết quả **luôn kèm giải thích** (không phải con số mơ hồ)
- **Trích dẫn nguồn**: "Theo 47 tin rao trên Chợ Tốt..."
- Hiển thị khoảng giá (low-high), không phải 1 con số giả tạo

### Mobile-first thực sự
- Dashboard responsive hoàn toàn
- Bottom navigation mobile-friendly
- Tap to call SĐT khách hàng
- Upload ảnh từ camera điện thoại

### Bảo vệ dữ liệu doanh nghiệp
- Row Level Security: DN A không xem được data DN B
- Admin không thể giả mạo user session
- Passwords không lưu plaintext (Supabase bcrypt)

## 7.3 Ưu Điểm Kinh Doanh

### Chi phí thấp, scale nhanh
| Thành phần | Chi phí | Scale |
|---|---|---|
| Vercel | $0 (Hobby) → $20/tháng (Pro) | Auto |
| Supabase | $0 (Free) → $25/tháng (Pro) | Auto |
| Gemini AI | Pay-per-use | Theo request |
| Tổng cơ bản | ~$45/tháng | Unlimited users |

### Mô hình doanh thu đa dạng
1. **Gói Tháng**: recurring MRR
2. **Gói Quý**: tiền mặt trước × 3 tháng
3. **Gói Năm**: tiền mặt trước × 12 tháng (discount)
4. **Ultra Trial → Conversion**: free 30 ngày → trả phí

### Competitive moat
- **Dữ liệu proprietary**: lịch sử định giá × N showroom × M tháng = dataset độc quyền
- **Network effects**: thêm showroom → thêm lead chất lượng → thêm showroom
- **Switching cost**: lịch sử, lead, báo cáo đã tích lũy → khó chuyển đi

---

# PHẦN VIII — API ENDPOINTS HOÀN CHỈNH

## 8.1 Public APIs (Không cần xác thực)

| Method | Route | Chức năng |
|---|---|---|
| `POST` | `/api/valuation` | Định giá xe |
| `POST` | `/api/chat` | Chat AI |
| `POST` | `/api/guest-leads` | Lưu lead khách |
| `GET` | `/api/valuation/compare` | So sánh 2 xe |
| `GET` | `/api/vehicle-catalog` | Catalog xe |
| `GET` | `/api/data` | Landing page data |
| `POST` | `/api/register` | Đăng ký tài khoản |
| `POST` | `/api/forgot-password` | Quên mật khẩu |

## 8.2 Business APIs (Cần xác thực)

| Method | Route | Chức năng |
|---|---|---|
| `GET` | `/api/valuations` | Lịch sử định giá (max 50) |
| `POST` | `/api/valuations` | Lưu định giá mới |
| `GET` | `/api/guest-leads` | Danh sách lead |
| `PATCH` | `/api/guest-leads/[id]` | Cập nhật trạng thái lead |
| `GET` | `/api/reports/business` | Báo cáo tổng hợp |
| `GET` | `/api/profile` | Lấy thông tin DN |
| `PATCH` | `/api/profile` | Cập nhật hồ sơ DN |
| `POST` | `/api/profile/password` | Đổi mật khẩu |
| `POST` | `/api/vehicle-detect` | Nhận diện xe từ ảnh |

## 8.3 Admin APIs (Chỉ Admin)

| Method | Route | Chức năng |
|---|---|---|
| `GET` | `/api/admin/stats` | Thống kê hệ thống |
| `GET` | `/api/admin/users` | Danh sách users |
| `PATCH` | `/api/admin/users/[id]` | Cấp/thu hồi admin |
| `GET` | `/api/admin/leads` | 500 leads mới nhất |
| `GET` | `/api/admin/valuations` | 1000 định giá mới nhất |
| `GET/POST` | `/api/admin/site-settings` | Cài đặt theme/sự kiện |

---

# PHẦN IX — NAVIGATION & ROUTING

## 9.1 Public Routes

```
/                    → Landing page (Hero, Form định giá, Pricing...)
/dashboard           → Redirect nếu chưa đăng nhập
/checklist           → Checklist mua xe cũ
/compare             → So sánh 2 dòng xe
/signin              → Đăng nhập
/signup              → Đăng ký
/forgot-password     → Quên mật khẩu
/reset-password      → Đặt lại mật khẩu
```

## 9.2 Dashboard Routes (Cần đăng nhập)

```
/dashboard                  → Tổng quan
/dashboard/leads            → Lead khách (businessOnly)
/dashboard/valuation        → Định giá xe
/dashboard/history          → Lịch sử định giá
/dashboard/reports          → Báo cáo (businessOnly)
/dashboard/insights         → Tips & AI
/dashboard/plans            → Gói của tôi
/dashboard/settings         → Cài đặt
/dashboard/admin            → Admin dashboard (adminOnly)
/dashboard/admin/users      → Quản lý users (adminOnly)
/dashboard/admin/leads      → Tất cả leads (adminOnly)
/dashboard/admin/valuations → Tất cả định giá (adminOnly)
```

---

# PHẦN X — BẢNG SO SÁNH GÓI

## 10.1 Tính Năng Theo Gói

| Tính năng | Cá nhân (Free) | DN Trial | DN Pro | Ultra Trial |
|---|:---:|:---:|:---:|:---:|
| Định giá/tháng | 10 | 3 | **∞** | **∞** |
| Chat AI/lần định giá | 10 | 5 | **∞** | **∞** |
| Định giá bằng ảnh | ✓ | ✓ | ✓ | ✓ |
| Lịch sử định giá | ✓ | ✓ | ✓ | ✓ |
| So sánh xe | 5/tháng/device | 5/tháng | **∞** | **∞** |
| Lead khách website | ✗ | ✓ | ✓ | ✓ |
| Báo cáo tổng hợp | ✗ | ✗ | ✓ | ✓ |
| Xuất PDF định giá | ✗ | ✗ | ✓ | ✓ |
| Xuất PDF báo cáo | ✗ | ✗ | ✓ | ✓ |
| Biểu đồ xu hướng | ✗ | ✗ | ✓ | ✓ |
| Cài đặt hồ sơ DN | ✗ | ✓ | ✓ | ✓ |
| Thông báo lead | ✗ | ✓ | ✓ | ✓ |

## 10.2 Rate Limit Theo Gói

| Endpoint | Khách | Cá nhân | DN (mọi gói) |
|---|---|---|---|
| Định giá/giờ | 8 | ~8 | 120 |
| Định giá/ngày | 30 | ~30 | 500 |
| Chat/giờ | 25 | 25 | 80 |
| Chat/ngày | 80 | 80 | 300 |
| Nhận diện ảnh/giờ | 0 | 0 | 30 |

---

# PHẦN XI — ĐIỂM KHÁC BIỆT SO VỚI THỊ TRƯỜNG

## 11.1 So Sánh Với Các Giải Pháp Hiện Tại

| Tiêu chí | ValuCar | Chợ Tốt | Xe.com | Excel nội bộ | Hỏi "chuyên gia" |
|---|---|---|---|---|---|
| Định giá AI tức thời | ✅ | ❌ | ❌ | ❌ | ❌ |
| Dữ liệu thị trường thực | ✅ | ⚠️ | ⚠️ | ❌ | ⚠️ |
| Giải thích kèm theo | ✅ | ❌ | ❌ | ❌ | ⚠️ |
| Lead management | ✅ | ❌ | ❌ | ❌ | ❌ |
| Báo cáo xu hướng | ✅ | ❌ | ❌ | ⚠️ | ❌ |
| Định giá bằng ảnh | ✅ | ❌ | ❌ | ❌ | ❌ |
| Chat AI tư vấn | ✅ | ❌ | ❌ | ❌ | ❌ |
| Xuất PDF chuyên nghiệp | ✅ | ❌ | ❌ | ⚠️ | ❌ |
| Miễn phí cho khách lẻ | ✅ | ✅ | ✅ | ❌ | ❌ |
| SaaS cho showroom | ✅ | ❌ | ❌ | ❌ | ❌ |

---

# PHẦN XII — TÓAM TẮT EXECUTIVE SUMMARY

## ValuCar trong 5 câu:

> **Vấn đề:** Thị trường xe cũ Việt Nam thiếu công cụ định giá minh bạch, showroom định giá thủ công và bỏ sót lead từ web.
>
> **Giải pháp:** ValuCar kết hợp dữ liệu Chợ Tốt + Bonbanh với Google Gemini 2.5 Flash để định giá trong vài phút, kèm giải thích rõ ràng.
>
> **Mô hình:** Khách lẻ định giá miễn phí → tạo lead cho showroom → showroom trả phí SaaS để nhận lead và dashboard đầy đủ.
>
> **Công nghệ:** Next.js 15 + Supabase + Gemini AI, serverless, scale tự động, bảo mật đa lớp, 3 tầng fallback đảm bảo uptime.
>
> **Sẵn sàng:** Sản phẩm đầy đủ tính năng, đang vận hành thực tế, chờ nguồn lực để scale lên hàng nghìn showroom.

---

*Tài liệu được tổng hợp từ source code thực tế của hệ thống ValuCar*  
*Ngày tạo: 20/06/2026*  
*Version: 1.0*
