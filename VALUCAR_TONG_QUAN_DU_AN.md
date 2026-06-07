# ValuCar — Tài liệu dự án đầy đủ (Master Document)

> **Mục đích:** Một file duy nhất để nắm **100%** dự án ValuCar — công nghệ sử dụng, kiến trúc, tính năng, cách định giá chính xác, giá & gói, giá trị cho cá nhân/doanh nghiệp, và **vì sao người dùng nên tin dùng**.
>
> **Phiên bản:** 2.0 — chi tiết tối đa theo source code thực tế  
> **Stack:** Next.js 15.2.8 · React 19 · TypeScript 5 · Tailwind CSS 4  
> **Thương hiệu:** ValuCar (template gốc: Paidin)

---

## Mục lục

1. [Tóm tắt điều hành](#1-tóm-tắt-điều-hành)
2. [Bài toán & giải pháp](#2-bài-toán--giải-pháp)
3. [Công nghệ sử dụng (toàn bộ stack)](#3-công-nghệ-sử-dụng-toàn-bộ-stack)
4. [Kiến trúc hệ thống](#4-kiến-trúc-hệ-thống)
5. [Luồng dữ liệu & API](#5-luồng-dữ-liệu--api)
6. [Tính năng chi tiết từng module](#6-tính-năng-chi-tiết-từng-module)
7. [Engine định giá — độ chính xác & thuật toán](#7-engine-định-giá--độ-chính-xác--thuật-toán)
8. [Báo cáo Doanh nghiệp & chỉ số PRO](#8-báo-cáo-doanh-nghiệp--chỉ-số-pro)
9. [Gói giá & mô hình kinh doanh](#9-gói-giá--mô-hình-kinh-doanh)
10. [Giá trị cho Cá nhân vs Doanh nghiệp](#10-giá-trị-cho-cá-nhân-vs-doanh-nghiệp)
11. [Vì sao nên tin dùng ValuCar (đầy đủ)](#11-vì-sao-nên-tin-dùng-valucar-đầy-đủ)
12. [So sánh với phương án khác](#12-so-sánh-với-phương-án-khác)
13. [Bảo mật, quyền riêng tư & vận hành](#13-bảo-mật-quyền-riêng-tư--vận-hành)
14. [Hạn chế hiện tại & roadmap](#14-hạn-chế-hiện-tại--roadmap)
15. [Cấu trúc mã nguồn](#15-cấu-trúc-mã-nguồn)
16. [FAQ & thuật ngữ](#16-faq--thuật-ngữ)

---

## 1. Tóm tắt điều hành

**ValuCar** là nền tảng web **định giá ô tô bản địa hóa Việt Nam**, kết hợp:

| Lớp | Vai trò |
|-----|---------|
| **Dữ liệu thị trường** | Crawl tin đăng thực từ Chợ Tốt, Bonbanh (ưu tiên tin ≤ 30 ngày) |
| **Trí tuệ nhân tạo** | Google Gemini phân tích, giải thích tiếng Việt, chat theo ngữ cảnh từng xe |
| **Sản phẩm B2B** | Gói Doanh nghiệp: định giá không giới hạn, báo cáo đàm phán, checklist bán xe |

**Đối tượng:** Người mua/bán lẻ (freemium 3 lượt/tháng) · Showroom/đại lý/salon (subscription) · Đối tác AdoCar.

**Pitch một câu:**

> *ValuCar cho biết “giá thị trường hôm nay là bao nhiêu và vì sao” — dựa trên tin đăng Việt Nam và AI minh bạch, không phải cảm tính một người.*

---

## 2. Bài toán & giải pháp

### 2.1. Pain point thị trường

- Người bán **không biết giá sàn** → bán rẻ hoặc treo lâu không có khách.
- Người mua **sợ bị “hớ”** → thiếu căn cứ đàm phán.
- Showroom **phụ thuộc 1–2 “ông chủ biết giá”** → không scale, báo giá không đồng nhất giữa nhân viên.
- Bảng giá sách / US **không phản ánh** Chợ Tốt, Bonbanh, xe đã qua sử dụng tại VN.

### 2.2. ValuCar giải quyết thế nào

```
Pain                    →    Giải pháp ValuCar
─────────────────────────────────────────────────────────
Giá không có căn cứ   →    Khoảng low–high + explanation
Thị trường VN đặc thù  →    Crawl Chợ Tốt / Bonbanh
Cần giải thích        →    Gemini + luận cứ tách dòng
Scale showroom          →    Gói DN unlimited + báo cáo PRO
Thử trước khi trả tiền →    3 lượt/tháng (cá nhân, sau đăng nhập)
```

---

## 3. Công nghệ sử dụng (toàn bộ stack)

### 3.1. Frontend & UI

| Công nghệ | Phiên bản | Dùng để làm gì trong ValuCar |
|-----------|-----------|-------------------------------|
| **Next.js** | 15.2.8 | App Router, SSR/SSG, API Routes (`/app/api/*`) |
| **React** | 19 | Component UI, hooks, client islands (`'use client'`) |
| **TypeScript** | 5.x | Type-safe toàn project (`strict: true`) |
| **Tailwind CSS** | 4.x | Styling utility-first, responsive, gradient, shadow |
| **PostCSS** | (via `@tailwindcss/postcss`) | Build CSS |
| **Poppins** (Google Font) | — | Typography toàn site (`layout.tsx`) |
| **Framer Motion** | 12.x | Animation (template / section) |
| **AOS** | 2.3.4 | Scroll reveal (`utils/aos.tsx`) |
| **Iconify** | 5.x | Icon Tabler (`tabler:car`, `tabler:login`, …) |
| **react-hot-toast** | 2.5 | Thông báo đăng nhập, mua gói, lỗi form |
| **react-slick** + slick-carousel | 0.30 | Carousel (nếu dùng trên landing) |
| **next-themes** | 0.4 | Dark/light (sẵn trong template) |

**Tại sao chọn Next.js 15?**

- Một codebase vừa **website marketing** vừa **API backend** (valuation, chat, auth).
- Deploy dễ trên **Vercel** hoặc Node server.
- SEO tốt cho landing “định giá xe”.

---

### 3.2. Backend & API (trong cùng repo Next.js)

| Endpoint | Method | File | Chức năng |
|----------|--------|------|-----------|
| `/api/valuation` | POST | `api/valuation/route.ts` | **Engine định giá chính** |
| `/api/chat` | POST | `api/chat/route.ts` | Chat AI chuyên gia (Gemini) |
| `/api/register` | POST | `api/register/route.ts` | Đăng ký DN → Supabase signUp |
| `/api/auth/[...nextauth]` | GET/POST | `api/auth/[...nextauth]/route.ts` | Session NextAuth + Supabase login |
| `/api/data` | GET | `api/data/route.ts` | Menu, features, plans JSON |
| `/api/vehicle-catalog` | GET | `api/vehicle-catalog/route.ts` | Catalog xe từ Supabase |

**Runtime:** Node.js trên server Next (Route Handlers).

---

### 3.3. Xác thực & cơ sở dữ liệu

| Công nghệ | Vai trò |
|-----------|---------|
| **Supabase** (`@supabase/supabase-js` 2.106) | Auth (email/password), PostgreSQL cloud |
| **Supabase Auth** | `signUp`, `signInWithPassword`, `user_metadata` (company_name, account_type) |
| **NextAuth.js** | 4.24 — JWT session phía client (`useSession`, `signIn`, `signOut`) |
| **Credentials Provider** | Bridge: form login → Supabase → trả user vào JWT |

**Metadata user doanh nghiệp (khi đăng ký):**

```json
{
  "account_type": "business",
  "company_name": "Tên showroom",
  "full_name": "Tên showroom"
}
```

**Client Supabase:**

- `createSupabaseBrowserClient()` — anon key, phía browser (nếu cần).
- `createSupabaseAuthClient()` — anon key, server auth (register/login API).
- `createSupabaseServerClient()` — service role, catalog API (cần `SUPABASE_SERVICE_ROLE_KEY`).

---

### 3.4. Trí tuệ nhân tạo (AI)

| Công nghệ | Cấu hình | Dùng ở đâu |
|-----------|----------|------------|
| **Google Gemini API** | `GEMINI_API_KEY`, `GEMINI_MODEL` (vd: `gemini-3.1-flash-lite-preview`), `GEMINI_API_VERSION` (`v1` / `v1beta`) | `/api/valuation`, `/api/chat` |
| **OpenRouter SDK** | Có trong `package.json` | Dự phòng / mở rộng model khác (chưa là luồng chính) |

**Gemini trong định giá:**

- Prompt có: hãng, model, năm, màu, km + bảng insight crawl.
- Output chuẩn hóa: `GIÁ_THẤP_NHẤT`, `GIÁ_CAO_NHẤT`, `GIẢI THÍCH`.
- Hậu xử lý: `clampToMarket` (±30% median thị trường).

**Gemini trong chat:**

- System context: giá hiện tại, thông tin xe, crawl market.
- Lịch sử hội thoại tối đa **8 tin** gần nhất.
- Yêu cầu: không bịa; trích dẫn Chợ Tốt/Bonbanh khi có data.

---

### 3.5. Dữ liệu xe & thị trường

| Nguồn | Định dạng | Mô tả |
|-------|-----------|--------|
| **`data.json`** | JSON ~3900+ dòng | Cây `brands → models → years → versions → colors` (BMW, Toyota, …) |
| **Supabase tables** | PostgreSQL | `brands`, `car_models`, `car_generations`, `car_versions`, `version_years`, `version_colors` |
| **Chợ Tốt** | HTML crawl | `https://xe.chotot.com/mua-ban-oto?q=...` |
| **Bonbanh** | HTML crawl | `https://bonbanh.com/oto/?q=...` |

**Cache thị trường:** `Map` in-memory, TTL **10 phút** (`MARKET_CACHE_TTL_MS`). Nếu crawl fail → dùng cache cũ (last known good).

---

### 3.6. State management & lưu trữ phía client

| Cơ chế | File | Dữ liệu |
|--------|------|---------|
| **React Context** | `Providers.tsx` | Ví (`balance`), `isPro`, `remainingFreeValuations` |
| **localStorage** | `valucar_free_usage_v1_{email}` | Số lượt định giá free đã dùng trong tháng |
| **NextAuth session** | Cookie/JWT | `user.id`, `user.email`, `user.name` (tên công ty nếu DN) |

**Lưu ý:** Ví 1.800.000đ và `isPro` **reset khi refresh** (chưa persist server) — xem mục 14.

---

### 3.7. DevOps & công cụ phát triển

| Công nghệ | Mục đích |
|-----------|----------|
| **ESLint 9** + `eslint-config-next` | Lint code |
| **Turbopack** | `next dev --turbopack` — dev nhanh |
| **`.env` / `.env.example`** | Secrets: Supabase, NextAuth, Gemini |

**Biến môi trường đầy đủ:**

```env
# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
GEMINI_API_VERSION=v1
```

---

## 4. Kiến trúc hệ thống

### 4.1. Sơ đồ tổng quan

```mermaid
flowchart TB
  subgraph Client["Trình duyệt (React 19)"]
    VF[ValuationForm]
    PR[Pricing]
    HD[Header Auth Modal]
    CH[ExpertChatWidget]
    WL[Wallet Context]
  end

  subgraph Next["Next.js 15 Server"]
    API_V[/api/valuation]
    API_C[/api/chat]
    API_R[/api/register]
    API_A[/api/auth NextAuth]
    API_D[/api/data]
    API_CAT[/api/vehicle-catalog]
  end

  subgraph External["Dịch vụ ngoài"]
    SB[(Supabase Auth + DB)]
    GM[Google Gemini API]
    CT[Chợ Tốt HTML]
    BB[Bonbanh HTML]
  end

  VF --> API_V
  CH --> API_C
  HD --> API_A
  HD --> API_R
  PR --> WL
  VF --> WL
  API_A --> SB
  API_R --> SB
  API_CAT --> SB
  API_V --> GM
  API_V --> CT
  API_V --> BB
  API_C --> GM
  API_C --> CT
  API_C --> BB
  VF --> dataJSON[(data.json)]
```

### 4.2. Phân lớp kiến trúc (layered)

| Lớp | Thành phần | Trách nhiệm |
|-----|------------|-------------|
| **Presentation** | `components/Home/*`, `Auth/*`, `Layout/*` | UI, modal, form, toast |
| **Application** | `Providers.tsx`, hooks `useWallet`, `useSession` | Quota free, PRO, session |
| **API / Domain** | `api/valuation`, `api/chat` | Business logic định giá, AI |
| **Integration** | Supabase, Gemini, HTTP crawl | Dữ liệu & AI bên ngoài |
| **Data** | `data.json`, Supabase PG, in-memory cache | Persistence |

---

## 5. Luồng dữ liệu & API

### 5.1. Luồng định giá (end-to-end)

```
User chọn hãng/model/năm/phiên bản/màu + km
        │
        ▼
[Đã đăng nhập?] ──No──► Modal đăng nhập / toast
        │ Yes
        ▼
[Còn lượt free hoặc isPro?] ──No──► Modal nâng cấp DN
        │ Yes
        ▼
POST /api/valuation { brand, model, year, color, mileage }
        │
        ├─► scrapeMarket() → Chợ Tốt + Bonbanh
        │       │
        │       ├─ Có median → return source: "market"
        │       │
        │       └─ Không đủ mẫu
        │               │
        │               ├─ Có GEMINI_API_KEY → Gemini → clampToMarket → source: "gemini"
        │               │
        │               └─ Lỗi / không key → fallbackValuation() → source: "fallback"
        ▼
Hiển thị price, priceLow, priceHigh, explanation
        │
        ├─ consumeValuationUse(email) nếu không PRO
        └─ Mở ExpertChatWidget + báo cáo PRO (nếu có quyền)
```

### 5.2. Response mẫu `/api/valuation`

```json
{
  "price": 385000000,
  "priceLow": 370000000,
  "priceHigh": 400000000,
  "explanation": "Định giá được suy ra từ dữ liệu thị trường...",
  "source": "market",
  "marketInsights": [
    {
      "source": "ChoTot",
      "sampleCount": 45,
      "low": 350000000,
      "high": 420000000,
      "median": 385000000
    }
  ]
}
```

**`source` ý nghĩa:**

| Giá trị | Ý nghĩa | Độ tin cậy gợi ý |
|---------|---------|------------------|
| `market` | Chủ yếu từ crawl tin đăng | Cao nhất |
| `gemini` | AI + có thể có clamp market | Trung bình–cao |
| `fallback` | Công thức km + tuổi xe | Tham khảo |

### 5.3. Luồng đăng ký / đăng nhập

```
Đăng ký DN: Tên DN + Email + Password
        → POST /api/register
        → supabase.auth.signUp({ options.data: { company_name, account_type } })
        → (có thể cần confirm email tùy Supabase Dashboard)

Đăng nhập: Email + Password
        → NextAuth signIn('credentials')
        → authorize(): supabase.auth.signInWithPassword
        → JWT session: id, name (ưu tiên company_name), email
        → Header: "Xin chào, {tên DN}" + Ví + Đăng xuất
```

### 5.4. Luồng mua gói Doanh nghiệp (demo)

```
Chọn gói Tháng/Quý/Năm trên /#pricing
        → handleBuy(planPrice)
        → buyPro(price): balance >= price ?
        → isPro = true, trừ ví, toast success
        → canUseValuation() luôn true (unlimited)
```

---

## 6. Tính năng chi tiết từng module

### 6.1. Trang chủ (`/`)

| Section | ID | Component | Mô tả |
|---------|-----|-----------|--------|
| Hero | — | `Hero` | CTA "Định giá ngay" → `#valuation` |
| **Form định giá** | `#valuation` | `ValuationForm` | **Trái tim sản phẩm** |
| Tính năng | `#features` | `Features` | 3 card từ `/api/data` |
| Quy trình | — | `ValuationProcess` | 4 bước: nhập → AI → minh bạch → quyết định |
| Bảng giá | `#pricing` | `Pricing` | Cá nhân / Doanh nghiệp |
| Liên hệ | `#contact` | `ContactForm` | Form gửi tin (client-side) |
| People | — | `People` | Social proof / team |

### 6.2. ValuationForm — chi tiết từng nút

| Hành động | Điều kiện | Kết quả |
|-----------|-----------|---------|
| **Định giá** | Login + còn lượt hoặc PRO | Gọi API, hiện giá + giải thích |
| **Định giá bằng hình ảnh** | Login + lượt | Modal 6 bước upload ảnh → `calcPrice()` |
| **Xem báo cáo chi tiết** | Login + `businessAccessForCurrentResult` | Modal báo cáo PRO |
| **Mua gói** (trong form) | Có plans embed | Chuyển pricing / buyPro |

**Cascade select:** Chọn hãng → load model → năm → phiên bản → màu (từ `data.json`).

### 6.3. Workflow 6 ảnh (showroom standard)

| Bước | Ảnh | Mục đích nghiệp vụ |
|------|-----|-------------------|
| 1 | Đuôi xe | Nhận diện hãng/dòng (tương lai: vision AI) |
| 2 | Vô lăng / công tơ mét | Xác minh km |
| 3–4 | Góc chéo trước/sau | Tổng thể ngoại thất |
| 5 | Nội thất | Đánh giá giữ gìn |
| 6 | Vết xước | Điều chỉnh giá theo tình trạng |

**Hiện trạng kỹ thuật:** Upload và validate đủ 6 ảnh → vẫn định giá theo **form text**. Modal kết quả nhận diện (Toyota Vios demo) là **placeholder UI**.

### 6.4. ExpertChatWidget

- Nổi góc màn hình sau khi có giá.
- Gửi câu hỏi → `POST /api/chat` với `vehicle`, `basePrice`, `priceLow`, `priceHigh`, `history`.
- Use case: *"Xe ngập nước giảm bao nhiêu?"*, *"Sơn lại cánh cửa?"*, *"Nên bán nhanh hay giữ giá?"*.

### 6.5. Pricing & Wallet

**Gói Cá nhân (0đ):**

- 3 lượt/tháng/email (localStorage key theo tháng `YYYY-MM`).
- Không trừ ví khi bấm mua.

**Gói Doanh nghiệp:**

| Gói | Giá | Tính năng (theo PlansData) |
|-----|-----|----------------------------|
| Gói Tháng | 129.000đ | Unlimited định giá + chat + báo cáo + lịch sử (marketing) |
| Gói Quý | 350.000đ | Như trên |
| Gói Năm | 1.499.000đ | Như trên — **GIÁ TRỊ CAO NHẤT** (UI badge) |

**Ví demo:** Khởi tạo **1.800.000đ** — đủ mua ~13 tháng hoặc ~1 năm gói trong demo.

### 6.6. Auth & Header

- `openSignInModal()` / `openSignUpModal()` — global trên `window` cho ValuationForm gọi.
- Đăng ký DN: chỉ **tên doanh nghiệp + email + mật khẩu** (kê khai pháp lý sau).
- Đăng xuất: `signOut()` NextAuth.

### 6.7. Trang phụ

| Route | Nội dung |
|-------|----------|
| `/signup` | Form đăng ký DN (card layout) |
| `/signin` | Form đăng nhập |
| `/adocar` | Landing đối tác AdoCar |
| `/documentation` | Docs template kỹ thuật |

---

## 7. Engine định giá — độ chính xác & thuật toán

### 7.1. Thứ tự ưu tiên (3 tầng)

#### Tầng 1 — MARKET (ưu tiên cao nhất)

**File:** `scrapeMarket()` trong `api/valuation/route.ts`

1. Query = `{brand} {model} {year}`.
2. Fetch HTML Chợ Tốt + Bonbanh (timeout 2.5s mỗi nguồn).
3. Regex trích giá: `triệu`, `tr`, `tỷ`, `đ`, `vnd`.
4. Lọc tin **≤ 30 ngày** (parse "hôm nay", "3 ngày trước", ngày đăng).
5. Lọc giá hợp lệ: **40 triệu – 15 tỷ VND**.
6. Tối đa 120 mẫu/nguồn → `median`, `min`, `max`.
7. `marketAnchor()`: gộp median các nguồn.
8. Tính khoảng: median ± 6% spread, clamp theo low/high thực tế.

**Ưu điểm:** Phản ánh **giá người bán đang chào** trên sàn VN.

**Hạn chế:** Phụ thuộc cấu trúc HTML (có thể đổi); không phân biệt tỉnh thành trong code hiện tại.

#### Tầng 2 — GEMINI AI

Khi không đủ mẫu market:

- Prompt tiếng Việt, yêu cầu output 3 dòng chuẩn.
- Đính kèm bảng `marketInsights` đã crawl (kể cả 0 mẫu).
- Parse regex `GIÁ_THẤP_NHẤT` / `GIÁ_CAO_NHẤT` / `GIẢI THÍCH`.
- **`clampToMarket`:** Nếu có median thị trường, giá AI bị giới hạn trong **[0.7 × median, 1.3 × median]** để tránh ảo giá.

#### Tầng 3 — FALLBACK

```text
age = năm_hiện_tại - năm_sản_xuất
depreciation = min(75%, age × 6%)
mileageImpact = min(20%, max(0, km-30000)/100000 × 8%)
center = 700_000_000 × max(0.2, 1 - depreciation - mileageImpact)
spread = max(20_000_000, center × 5%)
```

Dùng khi: không có API key, Gemini lỗi, không parse được output.

### 7.2. Bảng kỳ vọng độ chính xác

| Tình huống | Nguồn | Sai số ước tính | Ghi chú |
|------------|-------|------------------|---------|
| Xe phổ biến, nhiều tin 30 ngày | market | ±5–8% | Tin cậy cao nhất |
| Xe ít tin, có Gemini + clamp | gemini | ±10–15% | Nên đọc explanation |
| Xe hiếm / API lỗi | fallback | ±15–25%+ | Chỉ tham khảo |
| Xe tai nạn / độ / ngập | Bất kỳ | Không đủ | Phải khai báo + chat AI |

### 7.3. Cách vận hành để “chính xác nhất”

1. **Luôn hiển thị khoảng giá** (low–high), không một số tuyệt đối.
2. **Ưu tiên `source: market`** — log `sampleCount` cho sales biết độ phủ.
3. **Bổ sung tình trạng** qua chat (ngập, va, sơn) trước khi chốt giá.
4. **So khớp km** với ảnh công tơ mét (workflow 6 ảnh).
5. Production: bật `SUPABASE_SERVICE_ROLE_KEY` + Gemini key ổn định.

---

## 8. Báo cáo Doanh nghiệp & chỉ số PRO

Tính toán client-side trong `proValuation` useMemo (`ValuationForm`):

| Chỉ số | Công thức / logic |
|--------|-------------------|
| **riskScore** (0–100) | `kmRisk × 0.45 + ageRisk × 0.55` |
| **kmRisk** | `min(100, km/150000 × 100)` |
| **ageRisk** | `min(100, tuổi_xe/15 × 100)` |
| **confidenceScore** | `max(55, 95 - riskScore×0.35)` |
| **liquidityScore** | `max(40, 92 - (riskScore+kmRisk)×0.3)` |
| **negotiateFast** | `center × 0.97` |
| **negotiateTarget** | `center × 0.99` |
| **negotiateHold** | `high` hoặc `center` |
| **negotiateAnchor** | `high × 1.015` |
| **premiumHighlights** | Band km, độ tuổi xe, confidence, liquidity |
| **actionPlan** | 4 gợi ý: vệ sinh xe, bảo dưỡng, chiến lược giá, khung giờ đăng tin 19:30–22:00 |

**Giá trị cho sales:** In/copy báo cáo cho khách → tăng **trust** và **tốc độ chốt deal**.

---

## 9. Gói giá & mô hình kinh doanh

### 9.1. Bảng giá chính thức (trong code)

| Segment | Gói | Giá (VNĐ) | Giới hạn định giá |
|---------|-----|-----------|-------------------|
| Cá nhân | Miễn phí | 0 | **3 / tháng / email** |
| Doanh nghiệp | Tháng | 129.000 | Không giới hạn |
| Doanh nghiệp | Quý | 350.000 | Không giới hạn |
| Doanh nghiệp | Năm | 1.499.000 | Không giới hạn |

**Quy đổi tiết kiệm:**

- Gói năm ≈ **9.7 tháng** giá tháng (tiết kiệm ~17% so với 12×129k).
- Gói quý ≈ **2.7 tháng** (tiết kiệm ~10% so với 3×129k).

### 9.2. ROI cho showroom (logic bán hàng)

| Kịch bản | Chi phí ValuCar | Lợi ích |
|----------|-----------------|---------|
| Bán underprice 10tr do đoán sai | 129k/tháng | Tránh lỗ 10tr = ROI **77×** |
| 20 xe/tháng cần định giá | 129k vs thuê appraiser | Scale không cần thêm headcount |
| Sales mới vào nghề | Chat AI + báo cáo | Giảm thời gian training |

### 9.3. Mô hình doanh thu mở rộng (tương lai)

1. **Subscription** (đang có UI).
2. **Pay-per-valuation API** cho CRM đại lý.
3. **White-label** cho AdoCar / ngân hàng.
4. **Lead generation** từ người bán lẻ cần showroom.
5. **Data insight** báo cáo xu hướng giá theo model (B2B data).

---

## 10. Giá trị cho Cá nhân vs Doanh nghiệp

### 10.1. Người dùng cá nhân — nhận được gì?

| # | Cung cấp | Lợi ích cụ thể |
|---|----------|----------------|
| 1 | Khoảng giá thị trường VND | Biết mặc cả hợp lý khi mua/bán |
| 2 | Giải thích tiếng Việt | Tự tin đàm phán, không bị “mù giá” |
| 3 | 3 lượt free/tháng | Trải nghiệm đủ trước khi trả phí |
| 4 | Đăng nhập email đơn giản | Không cần hồ sơ pháp lý |
| 5 | Chat AI theo xe | Hỏi tình trạng đặc biệt (ngập, va…) |
| 6 | UI mobile-friendly | Dùng trên điện thoại tại chỗ xem xe |
| 7 | Quy trình 4 bước rõ ràng | Không cần biết kỹ thuật |

**Khi nào nên dùng:** Trước khi đăng tin bán, trước khi chuyển cọc mua xe cũ, khi so sánh 2–3 chiếc.

---

### 10.2. Doanh nghiệp — nhận được gì?

| # | Cung cấp | Lợi ích cụ thể |
|---|----------|----------------|
| 1 | Tài khoản DN (tên + email) | Onboarding 2 phút |
| 2 | Định giá unlimited | 50–200 xe/tháng không lo quota |
| 3 | Báo cáo PRO đàm phán | Sales pitch bằng số liệu |
| 4 | Checklist tăng giá bán | Ops chuẩn hóa trước khi chụp ảnh tin |
| 5 | Workflow 6 ảnh | Quy trình showroom đồng nhất |
| 6 | Chat training tool | Nhân viên mới hỏi AI thay hỏi sếp |
| 7 | Header hiển thị tên DN | Professional khi demo cho khách |
| 8 | Gói quý/năm | Giảm chi phí cho chuỗi cửa hàng |

**Khi nào nên dùng:** Đại lý ô tô đã qua sử dụng, salon xe, trader nhập lô, đấu giá nội bộ.

---

## 11. Vì sao nên tin dùng ValuCar (đầy đủ)

### 11.1. Tin về **dữ liệu**

1. **Nguồn tin công khai** — Chợ Tốt, Bonbanh là sàn lớn tại VN, giá phản ánh cung cầu thực.
2. **Tin mới** — Chỉ parse giá từ ngữ cảnh tin ≤ 30 ngày (valuation) / 20 ngày (chat crawl).
3. **Lọc outlier** — Giá < 40tr hoặc > 15 tỷ bị loại (tránh parse lỗi).
4. **Median thay vì 1 tin** — Giảm nhiễu từ 1 listing giá ảo.
5. **Cache + fallback** — Không trả rỗng khi mạng chập chờn; dùng cache 10 phút.
6. **marketInsights minh bạch** — User thấy `sampleCount`, low/high/median từng nguồn.

### 11.2. Tin về **AI**

7. **AI không chạy một mình** — Market-first; Gemini chỉ bổ sung hoặc khi thiếu tin.
8. **clampToMarket** — Chống Gemini đưa giá ảo cao/thấp (±30% median).
9. **Prompt có cấu trúc** — Bắt buộc format `GIÁ_THẤP` / `GIÁ_CAO` / `GIẢI THÍCH`.
10. **Chat có guardrail** — “Không bịa”; bắt trích dẫn crawl khi có; hỏi thêm nếu thiếu dữ kiện.
11. **Model đổi được** — `GEMINI_MODEL` trong `.env` (Flash = nhanh + rẻ).

### 11.3. Tin về **sản phẩm & trải nghiệm**

12. **Minh bạch** — Mỗi giá có `explanation`, không black box.
13. **Khoảng giá** — Thành thật về uncertainty (low–high).
14. **Freemium thử** — 3 lượt/tháng, không cần thẻ ngay.
15. **Đăng ký DN gọn** — Không ép kê khai dài ngày đầu.
16. **Tiếng Việt end-to-end** — UI, AI, toast, lỗi.
17. **Modal không rời trang** — Giảm friction đăng ký/đăng nhập.

### 11.4. Tin về **công nghệ & bảo mật**

18. **Supabase Auth** — Hạ tầng auth đã được dùng rộng rãi globally.
19. **NextAuth JWT** — Session chuẩn, không lưu password plain trên client.
20. **API key server-side** — `GEMINI_API_KEY` chỉ chạy trên server Route Handler.
21. **TypeScript strict** — Giảm bug logic định giá/UI.
22. **Stack hiện đại** — Dễ maintain, tuyển dev, scale Vercel.

### 11.5. Tin về **kinh doanh B2B**

23. **Giá subscription thấp** — 129k/tháng << 1 sai sót giá xe.
24. **Báo cáo đàm phán** — Khác biệt so với tool chỉ show 1 số.
25. **Chuẩn hóa nhiều chi nhánh** — Cùng engine, cùng format báo cáo.
26. **Đối tác AdoCar** — Hướng ecosystem, không đơn lẻ.

### 11.6. Thành thật — điều kiện để tin tuyệt đối

| Điều kiện | Lý do |
|-----------|-------|
| Có `sampleCount` cao từ market | Đủ tin so sánh |
| User khai báo đúng km, năm, tình trạng | Garbage in → garbage out |
| Xe đặc biệt (siêu hiếm, độ) | Cần thẩm định người + AI |
| Production keys đầy đủ | Tránh fallback quá nhiều |

---

## 12. So sánh với phương án khác

| Tiêu chí | Đoán giá thủ công | Bảng giá sách | App quốc tế | ValuCar |
|----------|-------------------|---------------|-------------|---------|
| Data VN realtime | Thấp | Thấp | Thấp | **Cao** (crawl) |
| Giải thích cho khách | Khó | Không | Hạn chế | **Có** |
| Scale nhiều xe/ngày | Không | Không | Trung bình | **Cao** (gói DN) |
| Chi phí | Lương appraiser | Mua sách | USD subscription | **129k VND/th** |
| Chat theo từng xe | Không | Không | Hiếm | **Có** |
| Freemium | Không | Không | Trial ngắn | **3 lượt/tháng** |
| Báo cáo đàm phán | Tùy người | Không | Không | **Có (PRO)** |

---

## 13. Bảo mật, quyền riêng tư & vận hành

### 13.1. Bảo mật hiện tại

- Mật khẩu do **Supabase** hash & lưu (không lưu plain text trong Next.js).
- Session **JWT** qua NextAuth (`NEXTAUTH_SECRET`).
- API keys (`GEMINI`, `SERVICE_ROLE`) chỉ trong **server env**, không `NEXT_PUBLIC_*` (trừ anon key Supabase — đúng chuẩn).

### 13.2. Khuyến nghị production

- [ ] Bật **Confirm email** Supabase nếu cần chống spam.
- [ ] **RLS** (Row Level Security) trên bảng Supabase.
- [ ] Rate limit `/api/valuation` và `/api/chat` (chống abuse).
- [ ] Không commit `.env` lên Git.
- [ ] HTTPS only (`NEXTAUTH_URL` production).

### 13.3. Deploy

| Nền tảng | Ghi chú |
|----------|---------|
| **Vercel** | Tối ưu cho Next.js 15 |
| **Node** `npm run build && npm start` | Self-host |
| **Supabase Cloud** | Auth + DB region gần VN (Singapore) |

---

## 14. Hạn chế hiện tại & roadmap

### 14.1. Trạng thái thật (trung thực 100%)

| Hạng mục | Trạng thái | Impact |
|----------|------------|--------|
| Thanh toán VNPay/MoMo/Stripe | ❌ Chưa | Mua gói = ví demo |
| Persist `isPro` / balance server | ❌ Chưa | Refresh mất PRO |
| Lịch sử định giá DB | ❌ Chưa đầy đủ | Marketing có, code chưa lưu hết |
| Vision AI 6 ảnh → auto fill | ❌ UI only | Giá từ form, không từ ảnh |
| Phân vùng Bắc/Trung/Nam | ❌ Engine | Marketing có |
| `SUPABASE_SERVICE_ROLE_KEY` trống | ⚠️ | Catalog API lỗi nếu gọi |
| OpenRouter | 📦 Có package | Chưa wired làm default |

### 14.2. Roadmap đề xuất

**Phase 1 — Production-ready**

- Payment gateway + sync subscription Supabase.
- Bảng `valuations`, `subscriptions`, `business_profiles`.
- Rate limit & logging API.

**Phase 2 — Accuracy++**

- Vision model nhận diện hãng/model/km từ ảnh.
- Tách giá theo `city` / region.
- Thêm nguồn: Oto.com.vn, Facebook Marketplace (nếu policy cho phép).

**Phase 3 — Platform**

- API public cho đối tác.
- Dashboard analytics cho chuỗi showroom.
- Mobile app (React Native / PWA).

---

## 15. Cấu trúc mã nguồn

```
package/
├── data.json                          # ~3900 dòng catalog xe
├── .env / .env.example
├── VALUCAR_TONG_QUAN_DU_AN.md         # File này
├── package.json
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Poppins, Providers, AOS
│   │   ├── page.tsx                   # Landing chính
│   │   ├── Providers.tsx              # Wallet + SessionProvider
│   │   ├── globals.css
│   │   ├── (site)/(auth)/signin|signup/
│   │   ├── adocar/page.tsx
│   │   └── api/
│   │       ├── valuation/route.ts     # ★ Engine định giá
│   │       ├── chat/route.ts          # ★ Chat Gemini
│   │       ├── register/route.ts
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── data/route.ts          # Plans, features, menu
│   │       └── vehicle-catalog/route.ts
│   ├── components/
│   │   ├── Home/
│   │   │   ├── ValuationForm/         # ★ Form + PRO report + ảnh
│   │   │   ├── Pricing/
│   │   │   ├── Hero|Features|Business|ValuationProcess
│   │   ├── Auth/SignIn|SignUp/
│   │   ├── Layout/Header/             # Auth modal, wallet display
│   │   └── Support/ExpertChatWidget.tsx
│   ├── types/
│   │   ├── plans.ts, vehicle.ts, next-auth.d.ts
│   └── utils/
│       ├── supabase.ts
│       └── aos.tsx
└── public/images/                     # Logo, car examples, pricing art
```

---

## 16. FAQ & thuật ngữ

### FAQ

**H: Chưa đăng nhập có định giá được không?**  
Đ: Không. Phải đăng nhập; cá nhân còn 3 lượt/tháng sau khi login.

**H: Hết 3 lượt thì sao?**  
Đ: Nâng cấp gói Doanh nghiệp hoặc đợi tháng mới (counter reset theo `YYYY-MM`).

**H: Giá hiển thị là giá chốt được không?**  
Đ: Không — là **khoảng tham chiếu thị trường**; giá chốt phụ thuộu đàm phán, hợp đồng, tình trạng thực tế.

**H: `source: market` có nghĩa gì?**  
Đ: Giá tính chủ yếu từ crawl Chợ Tốt/Bonbanh, không phải công thức ước lượng.

**H: Tại sao đăng ký DN chỉ cần tên + email?**  
Đ: Giảm friction; hồ sơ pháp lý (MST, địa chỉ) có thể bổ sung sau trong phase 2.

**H: AdoCar là gì?**  
Đ: Trang đối tác `/adocar` — kênh hợp tác/thương hiệu liên minh trong ecosystem.

### Thuật ngữ

| Thuật ngữ | Định nghĩa |
|-----------|------------|
| **Valuation** | Một lần chạy định giá (tiêu thụ quota nếu free) |
| **PRO / isPro** | Trạng thái gói Doanh nghiệp đã kích hoạt (demo: trong session) |
| **marketInsights** | Thống kê giá crawl từng sàn |
| **clampToMarket** | Giới hạn output AI theo median thị trường |
| **Freemium** | 3 lượt free → trả phí unlimited |

---

## Phụ lục: Câu chuyện bán hàng (Sales Script ngắn)

**Cho cá nhân:**  
*"Anh/chị đăng ký free, thử 3 lần định giá tháng này — biết ngay xe mình đang được thị trường chào bao nhiêu, có lý do cụ thể từ Chợ Tốt và Bonbanh, không phải nghe lời một người."*

**Cho showroom:**  
*"129.000đ/tháng — unlimited định giá, báo cáo đàm phán cho sales, checklist chuẩn bị xe. Một deal tránh underprice 10 triệu là đã hoàn vốn cả năm."*

---

*Tài liệu Master Document v2.0 — đồng bộ với source code. Khi thay đổi tính năng, cập nhật file này trước khi pitch khách hàng.*
