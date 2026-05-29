import ValuationForm from '@/components/Home/ValuationForm'

export default function DashboardValuationPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-midnight_text">Định giá xe</h2>
        <p className="text-sm text-slate-500 mt-1">
          Không giới hạn lượt · Kết quả tự động lưu Supabase · Chat AI không giới hạn
        </p>
      </div>
      <ValuationForm variant="dashboard" />
    </div>
  )
}
