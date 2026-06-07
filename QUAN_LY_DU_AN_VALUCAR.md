# ValuCar — Bảng quản lý & kiểm soát dự án

> **File điều khiển (Control Board)** — theo dõi *phải làm · sẽ làm · đang làm · đã làm* và biết **khi nào coi là hoàn thành**.
>
> Cập nhật mỗi khi xong task: đổi trạng thái, ghi ngày, tick checkbox.  
> Tài liệu kỹ thuật chi tiết: [`VALUCAR_TONG_QUAN_DU_AN.md`](./VALUCAR_TONG_QUAN_DU_AN.md)

**Dự án:** ValuCar — Định giá xe ô tô thông minh  
**Cập nhật lần cuối:** 2026-05-28  
**Người quản lý:** _[điền tên]_

---

## 1. Cách dùng file này

| Việc | Hướng dẫn |
|------|-----------|
| **Hàng ngày** | Xem mục [Đang làm](#4-đang-làm-in-progress), kéo task xong sang [Đã làm](#3-đã-làm-done) |
| **Lập kế hoạch** | Thêm task mới vào [Sẽ làm](#5-sẽ-làm-planned--backlog) hoặc [Phải làm](#6-phải-làm-must-do--ưu-tiên) |
| **Báo cáo tiến độ** | Cập nhật [Bảng % hoàn thành](#2-tổng-quan-tiến-độ) + [Nhật ký](#8-nhật-ký-cập-nhật) |
| **Review tuần** | Điền [Checklist review](#9-checklist-review-cuối-tuần) |

### Ký hiệu trạng thái

| Ký hiệu | Nghĩa |
|---------|--------|
| ✅ | **Đã làm** — merge/deploy/test xong |
| 🔄 | **Đang làm** — đang code/test |
| 📋 | **Sẽ làm** — đã lên kế hoạch, chưa bắt đầu |
| 🔴 | **Phải làm** — blocker / ưu tiên cao / bắt buộc trước go-live |
| ⏸️ | Tạm dừng |
| ❌ | Hủy / không làm |

### Mức ưu tiên

| P | Ý nghĩa |
|---|---------|
| P0 | Chặn go-live — làm ngay |
| P1 | Cần cho MVP production |
| P2 | Cải thiện sau MVP |
| P3 | Tương lai / nice-to-have |

---

## 2. Tổng quan tiến độ

### 2.1. % theo giai đoạn (cập nhật tay)

| Giai đoạn | Mô tả | Tiến độ | Trạng thái |
|-----------|--------|---------|------------|
| **A — MVP Demo** | Chạy local, demo khách, ví giả | **~75%** | 🟡 Gần xong |
| **B — MVP Production** | Thanh toán thật, DB, deploy | **~15%** | 🔴 Chưa |
| **C — Accuracy+** | Vision ảnh, vùng miền, thêm nguồn | **~0%** | ⏸️ Chưa bắt đầu |
| **D — Platform** | API đối tác, dashboard, app | **~0%** | ⏸️ Chưa bắt đầu |

**Công thức gợi ý:**  
`Tiến độ tổng ≈ (task ✅) / (task ✅ + 🔄 + 📋 + 🔴 có trong scope hiện tại) × 100%`

### 2.2. Thanh tiến độ trực quan

```
Giai đoạn A (Demo)      [████████████████░░░░] 75%
Giai đoạn B (Production)[███░░░░░░░░░░░░░░░░░] 15%
Giai đoạn C (Accuracy)  [░░░░░░░░░░░░░░░░░░░░]  0%
Giai đoạn D (Platform)  [░░░░░░░░░░░░░░░░░░░░]  0%
```

### 2.3. Cột Kanban (tóm tắt số task)

| Cột | Số hạng mục (ước lượng) |
|-----|-------------------------|
| ✅ Đã làm | 28 |
| 🔄 Đang làm | 2 |
| 📋 Sẽ làm | 18 |
| 🔴 Phải làm (P0–P1) | 12 |

---

## 3. Đã làm (DONE)

> Những gì **đã có trong code** và dùng được (có thể cần polish thêm).

### 3.1. Sản phẩm & UI

| ID | Hạng mục | Ghi chú | Ngày |
|----|----------|---------|------|
| D-01 | Landing page `/` (Hero, Features, Process, Pricing, Contact) | | |
| D-02 | Form định giá `#valuation` (hãng/model/năm/phiên bản/màu/km) | `data.json` | |
| D-03 | Hiển thị giá low–high + giải thích | | |
| D-04 | Modal kết quả định giá | | |
| D-05 | Workflow upload 6 ảnh (UI 6 bước) | Chưa vision AI | |
| D-06 | Báo cáo PRO (risk, confidence, đàm phán, checklist) | Client-side | |
| D-07 | Bảng giá Cá nhân / Doanh nghiệp | `/api/data` PlansData | |
| D-08 | Trang `/adocar`, `/documentation` | | |
| D-09 | Trang `/signin`, `/signup` | | |
| D-10 | Responsive + Tailwind UI | | |

### 3.2. Engine & API

| ID | Hạng mục | Ghi chú | Ngày |
|----|----------|---------|------|
| D-11 | API `/api/valuation` — crawl Chợ Tốt + Bonbanh | Cache 10 phút | |
| D-12 | Tầng market → Gemini → fallback | | |
| D-13 | `clampToMarket` chống giá ảo AI | | |
| D-14 | API `/api/chat` — Gemini + context xe | | |
| D-15 | API `/api/data` — menu, plans, features | | |
| D-16 | API `/api/vehicle-catalog` (Supabase) | Cần service role key | |

### 3.3. Auth & tài khoản

| ID | Hạng mục | Ghi chú | Ngày |
|----|----------|---------|------|
| D-17 | Đăng ký DN: tên + email + mật khẩu → Supabase | `/api/register` | 2026-05 |
| D-18 | Đăng nhập Supabase + NextAuth JWT | | 2026-05 |
| D-19 | Modal Đăng nhập / Đăng ký DN trên Header | `openSignInModal`, `openSignUpModal` | |
| D-20 | Header hiển thị tên DN + ví + đăng xuất | | |

### 3.4. Gói & quota

| ID | Hạng mục | Ghi chú | Ngày |
|----|----------|---------|------|
| D-21 | 3 lượt định giá free/tháng/email | `localStorage` | |
| D-22 | Ví demo 1.8M + mua gói trừ ví → `isPro` | Mất khi refresh | |
| D-23 | Chặn định giá khi chưa login / hết lượt | Toast + modal | |

### 3.5. Tài liệu

| ID | Hạng mục | Ghi chú | Ngày |
|----|----------|---------|------|
| D-24 | `VALUCAR_TONG_QUAN_DU_AN.md` — master doc | v2.0 | 2026-05 |
| D-25 | `QUAN_LY_DU_AN_VALUCAR.md` — file này | | 2026-05 |
| D-26 | `.env.example` hướng dẫn biến môi trường | | |

### 3.6. Chat & hỗ trợ

| ID | Hạng mục | Ghi chú | Ngày |
|----|----------|---------|------|
| D-27 | ExpertChatWidget sau định giá | | |
| D-28 | `npm run build` production pass | | |

---

## 4. Đang làm (IN PROGRESS)

> Ghi **người phụ trách** và **% ước lượng** mỗi task.

| ID | Hạng mục | P | Người | % | Ghi chú / blocker |
|----|----------|---|--------|---|-----------------|
| W-01 | _[điền task đang làm]_ | | | 0% | |
| W-02 | Cấu hình Supabase production (URL, keys, confirm email) | P1 | | 30% | `SERVICE_ROLE_KEY` trống |

**Quy tắc:** Mỗi người nên có **≤ 2** task 🔄 cùng lúc.

---

## 5. Sẽ làm (PLANNED / Backlog)

> Đã quyết định làm nhưng **chưa bắt đầu** — xếp theo phase.

### Phase B — MVP Production (ưu tiên cao)

| ID | Hạng mục | P | Phụ thuộc | Ước lượng |
|----|----------|---|-----------|-----------|
| P-01 | Tích hợp thanh toán (VNPay / MoMo / Stripe) | P0 | — | 1–2 tuần |
| P-02 | Lưu `subscriptions` + `is_pro` trên Supabase | P0 | P-01 | 3–5 ngày |
| P-03 | Persist ví / số dư thật (hoặc bỏ ví, chỉ subscription) | P1 | P-01 | 2–3 ngày |
| P-04 | Bảng `valuations` — lưu mỗi lần định giá | P1 | Supabase | 3–5 ngày |
| P-05 | Bảng `business_profiles` (mở rộng hồ sơ DN sau) | P2 | — | 2–3 ngày |
| P-06 | Deploy Vercel + domain + `NEXTAUTH_URL` production | P0 | Keys | 1–2 ngày |
| P-07 | Rate limit `/api/valuation`, `/api/chat` | P1 | Deploy | 1–2 ngày |
| P-08 | Logging lỗi API (Sentry / Vercel Logs) | P2 | Deploy | 1 ngày |
| P-09 | RLS Supabase + policy bảo mật bảng | P1 | Supabase | 2–3 ngày |
| P-10 | Trang lịch sử định giá (đọc từ DB) | P2 | P-04 | 3–5 ngày |
| P-11 | Email xác nhận / quên mật khẩu hoàn chỉnh | P2 | Supabase | 2–3 ngày |
| P-12 | Form liên hệ gửi email hoặc lưu DB | P3 | — | 1–2 ngày |

### Phase C — Accuracy & AI

| ID | Hạng mục | P | Ước lượng |
|----|----------|---|-----------|
| P-20 | Vision AI: 6 ảnh → nhận diện hãng/model/km | P2 | 2–4 tuần |
| P-21 | Giá theo tỉnh/thành (region) | P2 | 1–2 tuần |
| P-22 | Thêm nguồn crawl (Oto.com.vn, …) | P3 | 1 tuần/nguồn |
| P-23 | Dashboard độ phủ `sampleCount` theo model | P3 | 1 tuần |

### Phase D — Platform & mở rộng

| ID | Hạng mục | P | Ước lượng |
|----|----------|---|-----------|
| P-30 | REST API public + API key đối tác | P3 | 2–3 tuần |
| P-31 | Dashboard analytics cho chuỗi showroom | P3 | 3–4 tuần |
| P-32 | PWA / mobile app | P3 | 4+ tuần |
| P-33 | White-label AdoCar | P3 | 2 tuần |

---

## 6. Phải làm (MUST DO — ưu tiên)

> **Không làm thì không được gọi là "production" hoặc "bán được gói DN thật".**

| ID | Hạng mục | P | Lý do bắt buộc | Deadline |
|----|----------|---|-----------------|----------|
| M-01 | Điền `GEMINI_API_KEY` production ổn định | P0 | Tránh fallback giá sai | |
| M-02 | Điền `SUPABASE_SERVICE_ROLE_KEY` + test catalog API | P0 | Catalog / DB | |
| M-03 | Thanh toán thật thay ví demo | P0 | Doanh thu | |
| M-04 | Lưu trạng thái gói PRO trên server (không mất refresh) | P0 | UX / công bằng khách trả tiền | |
| M-05 | Deploy HTTPS + `NEXTAUTH_SECRET` production | P0 | Bảo mật | |
| M-06 | Chính sách bảo mật / điều khoản (link thật, không `#`) | P1 | Pháp lý | |
| M-07 | Test E2E: đăng ký → đăng nhập → định giá → mua gói | P1 | QA | |
| M-08 | Không commit `.env` / API key lên Git | P0 | Bảo mật | ✅ quy trình |

---

## 7. Dự án HOÀN THÀNH khi nào?

### 7.1. Ba mức “xong” (định nghĩa rõ)

| Mức | Tên | Điều kiện | Trạng thái hiện tại |
|-----|-----|-----------|---------------------|
| **1** | **Demo OK** | Chạy local, định giá + auth + UI đầy đủ, pitch được | ✅ **Đạt ~75%** |
| **2** | **MVP Production** | Deploy public, trả tiền thật, PRO persist, lưu valuation | ❌ **Chưa đạt** |
| **3** | **Product v1.0** | + Vision ảnh, lịch sử, region, ổn định 1 tháng production | ❌ **Chưa đạt** |

### 7.2. Checklist “MVP Production” (= coi là hoàn thành phase chính)

Đánh dấu `[x]` khi xong **tất cả**:

**Công nghệ & vận hành**

- [ ] Deploy production (Vercel hoặc server) + domain
- [ ] `.env` production đầy đủ (Supabase, Gemini, NextAuth)
- [ ] `npm run build` pass trên CI
- [ ] HTTPS, cookie session ổn định

**Sản phẩm cốt lõi**

- [ ] Đăng ký / đăng nhập DN hoạt động trên production
- [ ] Định giá trả kết quả `market` hoặc `gemini` (không phụ thuộc fallback liên tục)
- [ ] Quota 3 lượt/tháng hoạt động đúng
- [ ] Mua gói DN → trừ tiền thật → `isPro` còn sau refresh

**Dữ liệu**

- [ ] Mỗi valuation lưu vào Supabase (user, xe, giá, source, thời gian)
- [ ] Subscription ghi nhận gói + ngày hết hạn

**Bảo mật & pháp lý**

- [ ] RLS Supabase bật
- [ ] Rate limit API cơ bản
- [ ] Trang chính sách / điều khoản có nội dung thật

**QA**

- [ ] 10 case test định giá xe phổ biến (Vios, City, CX-5…) so khớp thị trường ±15%
- [ ] 0 lỗi P0 trên luồng: signup → login → valuation → payment

**Kinh doanh**

- [ ] Bảng giá trên web khớp hóa đơn thật
- [ ] 1–3 khách DN pilot dùng thật ≥ 2 tuần

→ **Khi checklist trên ≥ 95% tick** → ghi ngày: **MVP Production HOÀN THÀNH**.

### 7.3. Checklist “Product v1.0” (hoàn thành dự án đầy đủ vision)

Thêm vào MVP:

- [ ] Vision 6 ảnh nhận diện thật (không demo Toyota Vios cứng)
- [ ] Lịch sử định giá + export PDF báo cáo PRO
- [ ] Giá theo vùng miền (ít nhất 3 miền)
- [ ] Uptime ≥ 99% trong 30 ngày
- [ ] Tài liệu vận hành + runbook sự cố

---

## 8. Nhật ký cập nhật

> Ghi **mới nhất lên trên**. Mỗi tuần ít nhất 1 dòng.

| Ngày | Người | Đã làm | Đang làm | Blocker | % tổng |
|------|-------|---------|----------|---------|--------|
| 2026-05-28 | — | Tạo file quản lý dự án; đăng ký DN đơn giản; master doc v2 | Cấu hình Supabase | SERVICE_ROLE trống | ~75% (Demo) |
| _yyyy-mm-dd_ | | | | | |

---

## 9. Checklist review cuối tuần

Copy mỗi tuần:

```
Tuần: ___________

[ ] Cập nhật cột Đã làm / Đang làm / Sẽ làm
[ ] Cập nhật % giai đoạn A–D
[ ] M-01 → M-08 còn mục P0 nào chưa xong?
[ ] Demo được cho stakeholder chưa?
[ ] Ghi nhật ký mục 8
[ ] Điều chỉnh deadline cột Phải làm
```

---

## 10. Ma trận module × trạng thái

| Module | Đã làm | Đang làm | Phải làm tiếp |
|--------|--------|----------|---------------|
| Landing / Marketing | ✅ | | Polish SEO |
| Form định giá | ✅ | | |
| Engine valuation | ✅ | | Monitor crawl |
| Chat AI | ✅ | | Rate limit |
| Auth Supabase | ✅ | 🔄 config | Production keys |
| Đăng ký DN | ✅ | | |
| Pricing / Wallet | ✅ demo | | Payment + persist PRO |
| 6 ảnh | ✅ UI | | Vision AI |
| Báo cáo PRO | ✅ | | Export PDF |
| Catalog Supabase | ⚠️ một phần | 🔄 | Service role |
| Thanh toán | ❌ | | VNPay/MoMo |
| Lịch sử DB | ❌ | | Bảng valuations |
| Deploy production | ❌ | | Vercel |
| Pháp lý (policy) | ❌ | | Nội dung trang |

---

## 11. Rủi ro & phụ thuộc

| Rủi ro | Mức | Giảm thiểu | Trạng thái |
|--------|-----|------------|------------|
| Crawl Chợ Tốt/Bonbanh đổi HTML | Cao | Cache + fallback Gemini + alert | 📋 Monitor |
| Gemini API lỗi / hết quota | Trung bình | Fallback + nhiều key | |
| Khách trả tiền nhưng mất PRO (refresh) | Cao | P-02, M-04 | 🔴 Chưa fix |
| Key lộ trên Git | Cao | .gitignore, review | ✅ |
| Định giá bị abuse (spam API) | Trung bình | P-07 rate limit | 📋 |

---

## 12. Liên kết nhanh

| Tài liệu | File |
|----------|------|
| Mô tả đầy đủ tính năng & công nghệ | [`VALUCAR_TONG_QUAN_DU_AN.md`](./VALUCAR_TONG_QUAN_DU_AN.md) |
| Biến môi trường | [`.env.example`](./.env.example) |
| Bảng giá (code) | `src/app/api/data/route.ts` → `PlansData` |
| Engine định giá | `src/app/api/valuation/route.ts` |

---

## 13. Hướng dẫn cập nhật nhanh (30 giây)

1. Xong task → chuyển dòng từ **§4 / §5 / §6** sang **§3**, tick `[x]` nếu thuộc checklist §7.  
2. Bắt đầu task mới → thêm vào **§4** với % 0%.  
3. Cuối tuần → **§8** + **§9** + sửa % ở **§2**.  
4. Trước pitch khách → kiểm tra **M01–M-08** và **Mức 1 Demo OK**.

---

*File quản lý ValuCar — phiên bản 1.0. Đồng bộ với codebase tháng 5/2026.*
