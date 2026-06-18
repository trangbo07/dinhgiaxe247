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
}

function fmtVnd(n: number | null) {
  if (n == null) return '—'
  return `${n.toLocaleString('vi-VN')} VND`
}

function fmtMillion(n: number | null) {
  if (n == null) return '—'
  return `${(n / 1e6).toFixed(0)} triệu`
}

function wrapText(doc: import('jspdf').jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight = 5) {
  const lines = doc.splitTextToSize(text, maxWidth) as string[]
  lines.forEach((line, i) => doc.text(line, x, y + i * lineHeight))
  return y + lines.length * lineHeight
}

/** Xuất PDF báo cáo tổng hợp doanh nghiệp */
export async function downloadBusinessSummaryPdf(report: BusinessReportData) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 14
  let y = 18

  doc.setFillColor(37, 99, 235)
  doc.rect(0, 0, pageW, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.text('ValuCar — Bao cao tong hop doanh nghiep', margin, 12)
  doc.setFontSize(9)
  doc.text(report.businessName, margin, 20)
  doc.text(
    `Ngay xuat: ${new Date(report.generatedAt).toLocaleString('vi-VN')}`,
    pageW - margin,
    20,
    { align: 'right' }
  )

  doc.setTextColor(30, 41, 59)
  y = 36
  doc.setFontSize(12)
  doc.text('1. Tong quan', margin, y)
  y += 7
  doc.setFontSize(10)
  const summary = [
    `Tong dinh gia: ${report.totals.valuations} | Thang nay: ${report.totals.valuationsThisMonth}`,
    `Tong lead khach: ${report.totals.leads} | Thang nay: ${report.totals.leadsThisMonth}`,
    `Tang truong dinh gia: ${report.growth.valuationsPct != null ? `${report.growth.valuationsPct}%` : '—'}`,
    `Tang truong lead: ${report.growth.leadsPct != null ? `${report.growth.leadsPct}%` : '—'}`,
    `Gia tham chieu TB: ${fmtMillion(report.avgValuationMid)}`,
    `Ti le lead da xu ly: ${report.leadContactRate != null ? `${report.leadContactRate}%` : '—'}`,
  ]
  summary.forEach((line) => {
    doc.text(line, margin, y)
    y += 5
  })

  y += 4
  doc.setFontSize(12)
  doc.text('2. Lead khach website', margin, y)
  y += 7
  doc.setFontSize(10)
  doc.text(
    `Mua: ${report.intentBreakdown.mua} | Ban: ${report.intentBreakdown.ban}`,
    margin,
    y
  )
  y += 5
  doc.text(
    `Trang thai — Moi: ${report.statusBreakdown.moi} | Da lien he: ${report.statusBreakdown.da_lien_he} | Dong: ${report.statusBreakdown.dong}`,
    margin,
    y
  )

  y += 8
  doc.setFontSize(12)
  doc.text('3. Xu huong 6 thang', margin, y)
  y += 7
  doc.setFontSize(9)
  report.monthlyTrend.forEach((m) => {
    doc.text(`${m.label}: ${m.valuations} dinh gia, ${m.leads} lead`, margin, y)
    y += 4.5
  })

  y += 4
  doc.setFontSize(12)
  doc.text('4. Top hang xe dinh gia', margin, y)
  y += 7
  doc.setFontSize(10)
  if (report.topBrands.length === 0) {
    doc.text('Chua co du lieu', margin, y)
    y += 5
  } else {
    report.topBrands.forEach((b, i) => {
      doc.text(`${i + 1}. ${b.brand}: ${b.count} lan`, margin, y)
      y += 5
    })
  }

  y += 4
  doc.setFontSize(12)
  doc.text('5. Nhan xet & goi y', margin, y)
  y += 7
  doc.setFontSize(10)
  report.insights.forEach((ins) => {
    y = wrapText(doc, `• ${ins}`, margin, y, pageW - margin * 2)
    y += 2
    if (y > 270) {
      doc.addPage()
      y = 20
    }
  })

  doc.setFontSize(8)
  doc.setTextColor(120, 120, 120)
  doc.text('Bao cao tu dong tu ValuCar — chi mang tinh tham khao.', margin, 285)

  const slug = report.businessName.replace(/[^\w]+/g, '_').slice(0, 30)
  doc.save(`ValuCar_BaoCao_${slug}_${new Date().toISOString().slice(0, 10)}.pdf`)
}

/** PDF chi tiet mot lan dinh gia */
export async function downloadValuationDetailPdf(v: ValuationPdfInput) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 14
  let y = 18

  doc.setFillColor(37, 99, 235)
  doc.rect(0, 0, pageW, 26, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(15)
  doc.text('ValuCar — Bao cao dinh gia chi tiet', margin, 11)
  doc.setFontSize(9)
  doc.text(v.businessName, margin, 19)

  doc.setTextColor(30, 41, 59)
  y = 34
  doc.setFontSize(14)
  doc.text(`${v.brand} ${v.model}`, margin, y)
  y += 8

  doc.setFontSize(10)
  const specs = [
    `Nam SX: ${v.year ?? '—'}`,
    `Phien ban: ${v.version ?? '—'}`,
    `Mau: ${v.color ?? '—'}`,
    `So km: ${v.mileage != null ? v.mileage.toLocaleString('vi-VN') : '—'}`,
    `Ngay dinh gia: ${new Date(v.createdAt).toLocaleString('vi-VN')}`,
    v.source ? `Nguon: ${v.source}` : '',
  ].filter(Boolean)
  specs.forEach((s) => {
    doc.text(s, margin, y)
    y += 5
  })

  y += 4
  doc.setFillColor(239, 246, 255)
  doc.roundedRect(margin, y, pageW - margin * 2, 22, 2, 2, 'F')
  doc.setFontSize(11)
  doc.setTextColor(37, 99, 235)
  doc.text('Khoang gia tham chieu', margin + 4, y + 7)
  doc.setFontSize(13)
  doc.setTextColor(15, 23, 42)
  doc.text(
    v.priceLow != null && v.priceHigh != null
      ? `${fmtMillion(v.priceLow)} – ${fmtMillion(v.priceHigh)}`
      : fmtMillion(v.price),
    margin + 4,
    y + 15
  )
  if (v.price != null) {
    doc.setFontSize(9)
    doc.setTextColor(100, 116, 139)
    doc.text(`Gia giua: ${fmtVnd(v.price)}`, margin + 4, y + 20)
  }
  y += 28

  doc.setTextColor(30, 41, 59)
  doc.setFontSize(12)
  doc.text('Phan tich & ly do dinh gia', margin, y)
  y += 6
  doc.setFontSize(10)
  y = wrapText(doc, v.explanation || 'Khong co ghi chu tu AI.', margin, y, pageW - margin * 2)

  y += 8
  doc.setFontSize(10)
  doc.text('Goi y thuong luong:', margin, y)
  y += 5
  const mid =
    v.price ??
    (v.priceLow != null && v.priceHigh != null ? Math.round((v.priceLow + v.priceHigh) / 2) : null)
  const negotiate = mid != null ? `Chot muc ${fmtMillion(Math.round(mid * 0.97))} – ${fmtMillion(mid)} neu xe zin.` : 'Can xem xe thuc te truoc khi chot.'
  y = wrapText(doc, negotiate, margin, y, pageW - margin * 2)

  doc.setFontSize(8)
  doc.setTextColor(120, 120, 120)
  doc.text('Bao cao ValuCar — tham khao mua ban, khong thay thay dinh gia chuyen nghiep.', margin, 285)

  const name = `${v.brand}_${v.model}`.replace(/\s+/g, '_').slice(0, 40)
  doc.save(`ValuCar_DinhGia_${name}.pdf`)
}
