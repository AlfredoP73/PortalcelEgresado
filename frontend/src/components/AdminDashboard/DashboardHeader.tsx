export function DashboardHeader() {
  return (
    <header className="border-b border-black/5 pb-5">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-ink">
          Dashboard Administrativo
        </h1>

        <p className="mt-1 text-sm text-ink-secondary">
          Resumen de empleabilidad y seguimiento de egresados
        </p>
      </div>
    </header>
  )
}

export default DashboardHeader