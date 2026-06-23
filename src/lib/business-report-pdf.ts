import type { BusinessReportData } from '@/lib/business-report-stats'

export type ValuationPdfInput = {
  businessName: string
  brand: string
  model: string
  year: number | null
  version: string | null
  color: string | null
  mileage: number | null
  price: number | null
  priceLow: number | null
  priceHigh: number | null
  explanation: string | null
  createdAt: string
  source?: string | null
  // Pro data
  riskScore?: number
  confidenceScore?: number
  liquidityScore?: number
  negotiateFast?: number | null
  negotiateTarget?: number | null
  negotiateHold?: number | null
  negotiateAnchor?: number | null
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtM(n: number | null | undefined): string {
  if (n == null) return '—'
  return `${(n / 1_000_000).toFixed(0)} triệu`
}

function fmtVnd(n: number | null | undefined): string {
  if (n == null) return '—'
  return n.toLocaleString('vi-VN') + ' ₫'
}

function fmtSource(src: string | null | undefined): string {
  if (!src) return 'ValuCar AI'
  if (src === 'gemini+market') return 'AI Gemini + Chợ Tốt & Bonbanh'
  if (src === 'market') return 'Chợ Tốt & Bonbanh'
  if (src === 'gemini') return 'AI Gemini'
  if (src === 'fallback') return 'Mô hình khấu hao'
  return src
}

// ─── Core: render HTML element → PDF via html2canvas ────────────────────────

async function renderToPdf(el: HTMLElement, filename: string): Promise<void> {
  // Gắn vào DOM nhưng ngoài vùng nhìn thấy
  el.style.position = 'fixed'
  el.style.left = '-9999px'
  el.style.top = '0'
  el.style.zIndex = '-1'
  document.body.appendChild(el)

  try {
    const html2canvas = (await import('html2canvas')).default
    const { jsPDF } = await import('jspdf')

    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      width: el.scrollWidth,
      height: el.scrollHeight,
    })

    const imgData = canvas.toDataURL('image/png', 1.0)
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    const pageW = pdf.internal.pageSize.getWidth()   // 210 mm
    const pageH = pdf.internal.pageSize.getHeight()  // 297 mm
    const imgW = pageW
    const imgH = (canvas.height * imgW) / canvas.width

    let heightLeft = imgH
    let positionY = 0

    // Trang đầu
    pdf.addImage(imgData, 'PNG', 0, positionY, imgW, imgH)
    heightLeft -= pageH

    // Trang tiếp theo nếu nội dung dài
    while (heightLeft > 0) {
      positionY -= pageH
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, positionY, imgW, imgH)
      heightLeft -= pageH
    }

    pdf.save(filename)
  } finally {
    document.body.removeChild(el)
  }
}

// ─── Template: Định giá chi tiết ────────────────────────────────────────────

function buildValuationTemplate(v: ValuationPdfInput): HTMLElement {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const logoUrl = `${origin}/images/logo/logo_Valucar.png`

  const mid =
    v.price ??
    (v.priceLow != null && v.priceHigh != null
      ? Math.round((v.priceLow + v.priceHigh) / 2)
      : null)

  const negotiateLow = mid != null ? Math.round(mid * 0.96) : null

  const riskScore = v.riskScore ?? 40
  const confidenceScore = v.confidenceScore ?? 75
  const liquidityScore = v.liquidityScore ?? 70

  const scoreColor = (s: number) =>
    s >= 70 ? '#16a34a' : s >= 45 ? '#d97706' : '#dc2626'

  const scoreLabel = (s: number) =>
    s >= 70 ? 'Tốt' : s >= 45 ? 'Trung bình' : 'Rủi ro'

  const riskLabel = (s: number) =>
    s <= 30 ? 'Thấp' : s <= 60 ? 'Trung bình' : 'Cao'

  const riskColor = (s: number) =>
    s <= 30 ? '#16a34a' : s <= 60 ? '#d97706' : '#dc2626'

  const specItems = [
    { label: 'Năm sản xuất', value: v.year ? String(v.year) : '—' },
    { label: 'Phiên bản', value: v.version || '—' },
    { label: 'Màu sắc', value: v.color || '—' },
    {
      label: 'Số km',
      value: v.mileage != null ? `${v.mileage.toLocaleString('vi-VN')} km` : '—',
    },
  ]

  const checklistItems = [
    'Kiểm tra lịch sử xe (đăng kiểm, tai nạn, ngập nước)',
    'Đối chiếu số khung, số máy với giấy tờ đăng ký',
    'Test lái tối thiểu 15 phút trên nhiều loại đường',
    'Kiểm tra điện, điều hoà, cửa kính, đèn toàn bộ',
    'Hỏi rõ lịch bảo dưỡng định kỳ, các hạng mục đã thay',
    'So sánh với ít nhất 2–3 xe cùng loại đang rao cùng thời điểm',
  ]

  const now = new Date().toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const el = document.createElement('div')
  el.style.cssText =
    'width:794px;font-family:"Segoe UI",Arial,sans-serif;color:#1e293b;background:#f8fafc;box-sizing:border-box;'

  el.innerHTML = `
    <!-- ═══ HEADER ═══ -->
    <div style="background:linear-gradient(135deg,#1e40af 0%,#2563eb 60%,#3b82f6 100%);padding:28px 36px 24px;position:relative;overflow:hidden;">
      <div style="position:absolute;top:-40px;right:-40px;width:180px;height:180px;background:rgba(255,255,255,0.07);border-radius:50%;"></div>
      <div style="position:absolute;bottom:-30px;right:100px;width:120px;height:120px;background:rgba(255,255,255,0.04);border-radius:50%;"></div>
      <div style="display:flex;align-items:center;justify-content:space-between;position:relative;">
        <div style="display:flex;align-items:center;gap:14px;">
          <img src="${logoUrl}" alt="ValuCar" style="height:40px;width:auto;" />
          <div>
            <div style="color:rgba(255,255,255,0.75);font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;">Báo Cáo Định Giá Xe</div>
            <div style="color:#ffffff;font-size:18px;font-weight:800;margin-top:2px;letter-spacing:0.5px;">ValuCar Business</div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="color:rgba(255,255,255,0.65);font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Doanh nghiệp</div>
          <div style="color:#fff;font-size:13px;font-weight:700;margin-top:4px;">${v.businessName}</div>
          <div style="color:rgba(255,255,255,0.6);font-size:10px;margin-top:4px;">${new Date(v.createdAt).toLocaleString('vi-VN')}</div>
        </div>
      </div>
    </div>

    <!-- ═══ BODY ═══ -->
    <div style="padding:28px 36px;background:#ffffff;">

      <!-- Tên xe -->
      <div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:24px;">
        <div style="width:5px;height:100%;min-height:44px;background:linear-gradient(180deg,#2563eb,#3b82f6);border-radius:3px;flex-shrink:0;"></div>
        <div>
          <h1 style="font-size:26px;font-weight:900;color:#0f172a;margin:0 0 8px;">${v.brand} ${v.model}</h1>
          <div style="display:flex;flex-wrap:wrap;gap:6px;">
            ${specItems.filter(s => s.value !== '—').map(s =>
              `<span style="background:#eff6ff;color:#1d4ed8;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;border:1px solid #bfdbfe;">${s.label}: ${s.value}</span>`
            ).join('')}
          </div>
        </div>
      </div>

      <!-- Specs Grid -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px;margin-bottom:22px;">
        ${specItems.map(s => `
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px 14px;">
            <div style="font-size:9px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:5px;">${s.label}</div>
            <div style="font-size:14px;color:#0f172a;font-weight:700;">${s.value}</div>
          </div>
        `).join('')}
      </div>

      <!-- Khoảng giá -->
      <div style="background:linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%);border:2px solid #93c5fd;border-radius:14px;padding:24px 28px;margin-bottom:22px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:-25px;right:-25px;width:130px;height:130px;background:rgba(37,99,235,0.07);border-radius:50%;"></div>
        <div style="display:flex;justify-content:space-between;align-items:flex-start;position:relative;">
          <div>
            <div style="font-size:10px;color:#2563eb;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;">Khoảng Giá Tham Chiếu</div>
            ${v.priceLow != null && v.priceHigh != null ? `
              <div style="font-size:36px;font-weight:900;color:#1d4ed8;line-height:1;letter-spacing:-1px;">${fmtM(v.priceLow)} – ${fmtM(v.priceHigh)}</div>
              <div style="font-size:12px;color:#64748b;margin-top:8px;">${fmtVnd(v.priceLow)} – ${fmtVnd(v.priceHigh)}</div>
            ` : `
              <div style="font-size:36px;font-weight:900;color:#1d4ed8;line-height:1;">${fmtM(v.price)}</div>
              <div style="font-size:12px;color:#64748b;margin-top:8px;">${fmtVnd(v.price)}</div>
            `}
            ${mid != null ? `
              <div style="display:inline-block;background:#2563eb;color:#fff;font-size:11px;font-weight:700;padding:4px 14px;border-radius:20px;margin-top:10px;">
                Giá trung tâm: ${fmtVnd(mid)}
              </div>
            ` : ''}
          </div>
          <div style="text-align:right;">
            <div style="font-size:9px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Nguồn dữ liệu</div>
            <div style="font-size:12px;color:#1d4ed8;font-weight:700;">${fmtSource(v.source)}</div>
            <div style="font-size:10px;color:#94a3b8;margin-top:4px;">30 ngày gần nhất</div>
          </div>
        </div>
      </div>

      <!-- Chỉ số thị trường -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:22px;">
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;">
          <div style="font-size:9px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;">Độ tin cậy dữ liệu</div>
          <div style="font-size:22px;font-weight:900;color:${scoreColor(confidenceScore)};">${confidenceScore}<span style="font-size:13px;font-weight:600;color:#94a3b8;">/100</span></div>
          <div style="font-size:10px;font-weight:700;color:${scoreColor(confidenceScore)};margin-top:3px;">${scoreLabel(confidenceScore)}</div>
        </div>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;">
          <div style="font-size:9px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;">Thanh khoản thị trường</div>
          <div style="font-size:22px;font-weight:900;color:${scoreColor(liquidityScore)};">${liquidityScore}<span style="font-size:13px;font-weight:600;color:#94a3b8;">/100</span></div>
          <div style="font-size:10px;font-weight:700;color:${scoreColor(liquidityScore)};margin-top:3px;">${scoreLabel(liquidityScore)}</div>
        </div>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;">
          <div style="font-size:9px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;">Điểm rủi ro xe</div>
          <div style="font-size:22px;font-weight:900;color:${riskColor(riskScore)};">${riskScore}<span style="font-size:13px;font-weight:600;color:#94a3b8;">/100</span></div>
          <div style="font-size:10px;font-weight:700;color:${riskColor(riskScore)};margin-top:3px;">${riskLabel(riskScore)}</div>
        </div>
      </div>

      <!-- Phân tích AI -->
      <div style="margin-bottom:20px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
          <div style="width:4px;height:18px;background:#2563eb;border-radius:2px;flex-shrink:0;"></div>
          <h3 style="font-size:14px;font-weight:800;color:#0f172a;margin:0;">Phân Tích & Lý Do Định Giá</h3>
        </div>
        <div style="background:#f8fafc;border-left:4px solid #2563eb;border-radius:0 10px 10px 0;padding:14px 18px;font-size:12px;color:#334155;line-height:1.75;">
          ${v.explanation || 'Không có giải thích từ AI.'}
        </div>
      </div>

      <!-- Chiến lược thương lượng -->
      ${mid != null && negotiateLow != null ? `
      <div style="margin-bottom:20px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
          <div style="width:4px;height:18px;background:#10b981;border-radius:2px;flex-shrink:0;"></div>
          <h3 style="font-size:14px;font-weight:800;color:#0f172a;margin:0;">Chiến Lược Thương Lượng</h3>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:12px 14px;">
            <div style="font-size:9px;color:#16a34a;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px;">Bán Nhanh</div>
            <div style="font-size:15px;font-weight:800;color:#15803d;">${fmtM(v.negotiateFast ?? negotiateLow)}</div>
            <div style="font-size:10px;color:#4ade80;margin-top:3px;">Chốt ngay trong 48h</div>
          </div>
          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:12px 14px;">
            <div style="font-size:9px;color:#1d4ed8;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px;">Mức Mục Tiêu</div>
            <div style="font-size:15px;font-weight:800;color:#1d4ed8;">${fmtM(v.negotiateTarget ?? mid)}</div>
            <div style="font-size:10px;color:#60a5fa;margin-top:3px;">Xe zin, đủ hồ sơ</div>
          </div>
          <div style="background:#fefce8;border:1px solid #fde68a;border-radius:10px;padding:12px 14px;">
            <div style="font-size:9px;color:#b45309;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px;">Giá Neo Đăng</div>
            <div style="font-size:15px;font-weight:800;color:#b45309;">${fmtM(v.negotiateAnchor ?? Math.round(mid * 1.015))}</div>
            <div style="font-size:10px;color:#fbbf24;margin-top:3px;">Tạo dư địa thương lượng</div>
          </div>
        </div>
      </div>
      ` : ''}

    </div>

    <!-- ═══ BODY PHẦN 2 (nền xám) ═══ -->
    <div style="padding:0 36px 28px;background:#f8fafc;">

      <!-- Checklist -->
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:18px 20px;margin-bottom:16px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
          <div style="width:4px;height:18px;background:#f59e0b;border-radius:2px;flex-shrink:0;"></div>
          <h3 style="font-size:14px;font-weight:800;color:#0f172a;margin:0;">Checklist Trước Khi Quyết Định</h3>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          ${[
            'Kiểm tra lịch sử xe (đăng kiểm, tai nạn, ngập nước)',
            'Đối chiếu số khung, số máy với giấy tờ đăng ký',
            'Test lái tối thiểu 15 phút trên nhiều loại đường',
            'Kiểm tra điện, điều hoà, cửa kính, đèn toàn bộ',
            'Hỏi rõ lịch bảo dưỡng định kỳ và hạng mục đã thay',
            'So sánh với ít nhất 2–3 xe cùng loại đang rao',
          ].map(item => `
            <div style="display:flex;align-items:flex-start;gap:7px;font-size:11px;color:#475569;line-height:1.5;">
              <span style="color:#2563eb;font-weight:900;flex-shrink:0;margin-top:1px;">✓</span>
              <span>${item}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Lưu ý -->
      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:12px 16px;margin-bottom:16px;">
        <div style="font-size:11px;color:#92400e;line-height:1.6;">
          <strong>Lưu ý:</strong> Kết quả định giá dựa trên dữ liệu niêm yết thực từ Chợ Tốt & Bonbanh (30 ngày), kết hợp phân tích AI Gemini.
          Giá chốt thực tế phụ thuộc vào tình trạng xe cụ thể, khu vực giao dịch và thời điểm thị trường.
          Tài liệu này chỉ mang tính tham khảo, không thay thế kiểm định chuyên nghiệp.
        </div>
      </div>

      <!-- Metadata & ID -->
      <div style="display:flex;justify-content:space-between;align-items:center;padding-top:8px;border-top:1px solid #e2e8f0;">
        <div style="font-size:9px;color:#94a3b8;">Mã báo cáo: VC-${Date.now().toString(36).toUpperCase().slice(-8)}</div>
        <div style="font-size:9px;color:#94a3b8;">Xuất lúc: ${now}</div>
      </div>
    </div>

    <!-- ═══ FOOTER ═══ -->
    <div style="background:#0f172a;padding:14px 36px;display:flex;justify-content:space-between;align-items:center;">
      <div style="color:rgba(255,255,255,0.4);font-size:9px;">Chỉ mang tính tham khảo · Không thay thế định giá chuyên nghiệp</div>
      <div style="display:flex;align-items:center;gap:10px;">
        <img src="${logoUrl}" alt="ValuCar" style="height:20px;width:auto;opacity:0.7;" />
        <div style="color:rgba(255,255,255,0.65);font-size:10px;font-weight:700;">valucar.vn</div>
      </div>
    </div>
  `

  return el
}

// ─── Template: Báo cáo tổng hợp doanh nghiệp ────────────────────────────────

function buildSummaryTemplate(report: BusinessReportData): HTMLElement {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const logoUrl = `${origin}/images/logo/logo_Valucar.png`

  const now = new Date().toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const growthBadge = (pct: number | null) => {
    if (pct == null) return '<span style="color:#94a3b8;font-size:11px;">—</span>'
    const up = pct >= 0
    return `<span style="color:${up ? '#16a34a' : '#dc2626'};font-size:11px;font-weight:700;">${up ? '▲' : '▼'} ${Math.abs(pct)}%</span>`
  }

  const kpis = [
    {
      label: 'Tổng định giá',
      value: String(report.totals.valuations),
      sub: `Tháng này: ${report.totals.valuationsThisMonth}`,
      badge: growthBadge(report.growth.valuationsPct),
      color: '#2563eb',
      bg: '#eff6ff',
      border: '#bfdbfe',
    },
    {
      label: 'Tổng lead khách',
      value: String(report.totals.leads),
      sub: `Tháng này: ${report.totals.leadsThisMonth}`,
      badge: growthBadge(report.growth.leadsPct),
      color: '#7c3aed',
      bg: '#f5f3ff',
      border: '#ddd6fe',
    },
    {
      label: 'Giá TB tham chiếu',
      value: report.avgValuationMid != null ? `${(report.avgValuationMid / 1_000_000).toFixed(0)} tr` : '—',
      sub: 'Tính trên tất cả định giá',
      badge: '',
      color: '#0891b2',
      bg: '#ecfeff',
      border: '#a5f3fc',
    },
    {
      label: 'Tỉ lệ lead xử lý',
      value: report.leadContactRate != null ? `${report.leadContactRate}%` : '—',
      sub: `Đã liên hệ / đóng`,
      badge: '',
      color: '#059669',
      bg: '#f0fdf4',
      border: '#bbf7d0',
    },
  ]

  const el = document.createElement('div')
  el.style.cssText =
    'width:794px;font-family:"Segoe UI",Arial,sans-serif;color:#1e293b;background:#f8fafc;box-sizing:border-box;'

  el.innerHTML = `
    <!-- HEADER -->
    <div style="background:linear-gradient(135deg,#1e40af 0%,#2563eb 60%,#3b82f6 100%);padding:28px 36px 24px;position:relative;overflow:hidden;">
      <div style="position:absolute;top:-40px;right:-40px;width:180px;height:180px;background:rgba(255,255,255,0.06);border-radius:50%;"></div>
      <div style="display:flex;align-items:center;justify-content:space-between;position:relative;">
        <div style="display:flex;align-items:center;gap:14px;">
          <img src="${logoUrl}" alt="ValuCar" style="height:40px;width:auto;" />
          <div>
            <div style="color:rgba(255,255,255,0.75);font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;">Báo Cáo Tổng Hợp</div>
            <div style="color:#fff;font-size:18px;font-weight:800;margin-top:2px;">ValuCar Business</div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="color:rgba(255,255,255,0.65);font-size:10px;font-weight:600;text-transform:uppercase;">Doanh nghiệp</div>
          <div style="color:#fff;font-size:13px;font-weight:700;margin-top:4px;">${report.businessName}</div>
          <div style="color:rgba(255,255,255,0.6);font-size:10px;margin-top:4px;">Xuất lúc: ${now}</div>
        </div>
      </div>
    </div>

    <!-- BODY -->
    <div style="padding:28px 36px;background:#ffffff;">

      <!-- KPI Cards -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px;margin-bottom:24px;">
        ${kpis.map(k => `
          <div style="background:${k.bg};border:1.5px solid ${k.border};border-radius:12px;padding:14px 16px;">
            <div style="font-size:9px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px;">${k.label}</div>
            <div style="font-size:26px;font-weight:900;color:${k.color};line-height:1;">${k.value}</div>
            <div style="font-size:10px;color:#94a3b8;margin-top:5px;">${k.sub}</div>
            ${k.badge ? `<div style="margin-top:5px;">${k.badge} so với tháng trước</div>` : ''}
          </div>
        `).join('')}
      </div>

      <!-- Xu hướng 6 tháng -->
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px 20px;margin-bottom:20px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;">
          <div style="width:4px;height:18px;background:#2563eb;border-radius:2px;flex-shrink:0;"></div>
          <h3 style="font-size:14px;font-weight:800;color:#0f172a;margin:0;">Xu Hướng 6 Tháng</h3>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr>
              <th style="text-align:left;padding:7px 10px;background:#eff6ff;color:#1d4ed8;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;border-radius:6px 0 0 6px;">Tháng</th>
              <th style="text-align:center;padding:7px 10px;background:#eff6ff;color:#1d4ed8;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;">Định giá</th>
              <th style="text-align:center;padding:7px 10px;background:#eff6ff;color:#1d4ed8;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;">Lead</th>
              <th style="text-align:center;padding:7px 10px;background:#eff6ff;color:#1d4ed8;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;border-radius:0 6px 6px 0;">Bar định giá</th>
            </tr>
          </thead>
          <tbody>
            ${report.monthlyTrend.map((m, i) => {
              const maxVal = Math.max(...report.monthlyTrend.map(x => x.valuations), 1)
              const barW = Math.round((m.valuations / maxVal) * 120)
              return `
                <tr style="border-bottom:1px solid #f1f5f9;">
                  <td style="padding:8px 10px;font-weight:700;color:#374151;">${m.label}</td>
                  <td style="padding:8px 10px;text-align:center;font-weight:700;color:#2563eb;">${m.valuations}</td>
                  <td style="padding:8px 10px;text-align:center;font-weight:700;color:#7c3aed;">${m.leads}</td>
                  <td style="padding:8px 10px;">
                    <div style="background:#e0f2fe;border-radius:4px;height:10px;width:120px;overflow:hidden;">
                      <div style="background:#2563eb;height:100%;width:${barW}px;border-radius:4px;"></div>
                    </div>
                  </td>
                </tr>
              `
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Lead & Nhu cầu -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px;">

        <!-- Nhu cầu -->
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 18px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
            <div style="width:4px;height:16px;background:#7c3aed;border-radius:2px;"></div>
            <h4 style="font-size:13px;font-weight:800;color:#0f172a;margin:0;">Nhu Cầu Khách</h4>
          </div>
          <div style="display:flex;gap:10px;">
            <div style="flex:1;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:10px;text-align:center;">
              <div style="font-size:22px;font-weight:900;color:#15803d;">${report.intentBreakdown.ban}</div>
              <div style="font-size:10px;color:#16a34a;font-weight:700;margin-top:3px;">Có xe bán</div>
            </div>
            <div style="flex:1;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:10px;text-align:center;">
              <div style="font-size:22px;font-weight:900;color:#1d4ed8;">${report.intentBreakdown.mua}</div>
              <div style="font-size:10px;color:#2563eb;font-weight:700;margin-top:3px;">Tìm xe mua</div>
            </div>
          </div>
        </div>

        <!-- Trạng thái lead -->
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 18px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
            <div style="width:4px;height:16px;background:#0891b2;border-radius:2px;"></div>
            <h4 style="font-size:13px;font-weight:800;color:#0f172a;margin:0;">Trạng Thái Lead</h4>
          </div>
          <div style="display:flex;gap:8px;">
            ${[
              { label: 'Mới', value: report.statusBreakdown.moi, color: '#f59e0b', bg: '#fefce8', border: '#fde68a' },
              { label: 'Đã liên hệ', value: report.statusBreakdown.da_lien_he, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
              { label: 'Đóng', value: report.statusBreakdown.dong, color: '#059669', bg: '#f0fdf4', border: '#bbf7d0' },
            ].map(s => `
              <div style="flex:1;background:${s.bg};border:1px solid ${s.border};border-radius:8px;padding:8px;text-align:center;">
                <div style="font-size:20px;font-weight:900;color:${s.color};">${s.value}</div>
                <div style="font-size:9px;color:${s.color};font-weight:700;margin-top:3px;">${s.label}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Top hãng -->
      ${report.topBrands.length > 0 ? `
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 18px;margin-bottom:20px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
          <div style="width:4px;height:16px;background:#f59e0b;border-radius:2px;"></div>
          <h4 style="font-size:13px;font-weight:800;color:#0f172a;margin:0;">Top Hãng Xe Định Giá Nhiều Nhất</h4>
        </div>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;">
          ${report.topBrands.slice(0, 5).map((b, i) => `
            <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:10px;text-align:center;">
              <div style="font-size:10px;color:#94a3b8;font-weight:700;margin-bottom:4px;">#${i + 1}</div>
              <div style="font-size:13px;font-weight:800;color:#0f172a;">${b.brand}</div>
              <div style="font-size:10px;color:#2563eb;font-weight:700;margin-top:3px;">${b.count} lần</div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      <!-- Nhận xét AI -->
      ${report.insights.length > 0 ? `
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 18px;margin-bottom:16px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
          <div style="width:4px;height:16px;background:#10b981;border-radius:2px;"></div>
          <h4 style="font-size:13px;font-weight:800;color:#0f172a;margin:0;">Nhận Xét & Gợi Ý Hành Động</h4>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${report.insights.map(ins => `
            <div style="display:flex;gap:10px;align-items:flex-start;font-size:11px;color:#374151;line-height:1.6;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;">
              <span style="color:#10b981;font-weight:900;font-size:13px;flex-shrink:0;margin-top:-1px;">→</span>
              <span>${ins}</span>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      <!-- Metadata -->
      <div style="display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px solid #e2e8f0;">
        <div style="font-size:9px;color:#94a3b8;">Báo cáo tự động · Dữ liệu từ Supabase · ValuCar</div>
        <div style="font-size:9px;color:#94a3b8;">Xuất lúc: ${now}</div>
      </div>
    </div>

    <!-- FOOTER -->
    <div style="background:#0f172a;padding:14px 36px;display:flex;justify-content:space-between;align-items:center;">
      <div style="color:rgba(255,255,255,0.4);font-size:9px;">Chỉ mang tính tham khảo · Không thay thế kiểm định chuyên nghiệp</div>
      <div style="display:flex;align-items:center;gap:10px;">
        <img src="${logoUrl}" alt="ValuCar" style="height:20px;width:auto;opacity:0.7;" />
        <div style="color:rgba(255,255,255,0.65);font-size:10px;font-weight:700;">valucar.vn</div>
      </div>
    </div>
  `

  return el
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** Xuất PDF chi tiết một lần định giá */
export async function downloadValuationDetailPdf(v: ValuationPdfInput): Promise<void> {
  const el = buildValuationTemplate(v)
  const name = `${v.brand}_${v.model}`.replace(/\s+/g, '_').slice(0, 40)
  await renderToPdf(el, `ValuCar_DinhGia_${name}.pdf`)
}

/** Xuất PDF báo cáo tổng hợp doanh nghiệp */
export async function downloadBusinessSummaryPdf(report: BusinessReportData): Promise<void> {
  const el = buildSummaryTemplate(report)
  const slug = report.businessName.replace(/[^\w]+/g, '_').slice(0, 30)
  await renderToPdf(el, `ValuCar_BaoCao_${slug}_${new Date().toISOString().slice(0, 10)}.pdf`)
}
