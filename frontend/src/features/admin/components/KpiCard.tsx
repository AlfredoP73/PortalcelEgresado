import type React from 'react'

export interface KpiCardProps {
  title: string
  value: string
  description?: string
  icon?: React.ReactNode
}

export function KpiCard({ title, value, description, icon }: KpiCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground text-pretty">{title}</p>
        {icon ? (
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-primary">
            {icon}
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
      {description ? (
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}

export default KpiCard
