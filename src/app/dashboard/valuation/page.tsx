import ValuationForm from '@/components/Home/ValuationForm'

export default function DashboardValuationPage() {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="lg:hidden">
        <p className="text-xs text-slate-500">
          Vuốt form · Kết quả bên dưới · Chat góc phải (trên thanh menu)
        </p>
      </div>
      <ValuationForm variant="dashboard" />
    </div>
  )
}
