'use client'

import { useEffect, useState } from 'react'
import { Users, TrendingUp, DollarSign, Clock } from 'lucide-react'

import {
  getDashboard,
  type DashboardData,
} from '../../api/dashboardServices'

interface Props {
  programId?: number;
  year?: number;
}

const KPI_ICONS = [
  Users,
  TrendingUp,
  DollarSign,
  Clock,
]

export function KpiGrid({ programId, year }: Props) {
  const [data, setData] =
    useState<DashboardData['summary'] | null>(null)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true)
        const dashboard = await getDashboard(programId, year)

        setData(dashboard.summary)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [programId, year])

  const cards = [
    {
      title: 'Total de egresados',
      value: data
        ? data.total_graduates.toLocaleString()
        : '0',
      description:
        'Egresados registrados en el sistema',
    },
    {
      title: 'Tasa de empleabilidad',
      value: data
        ? `${data.employment_rate}%`
        : '0%',
      description: 'Egresados contratados',
    },
    {
      title: 'Salario promedio',
      value: data
        ? `$${data.average_salary.toLocaleString()}`
        : '$0',
      description:
        'Salario promedio de contratados',
    },
    {
      title: 'Tiempo al primer empleo',
      value: data
        ? `${data.average_time_to_first_job} meses`
        : '0 meses',
      description:
        'Promedio después de graduarse',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, idx) => {
        const Icon = KPI_ICONS[idx]
        return (
          <div
            key={card.title}
            className="card p-6"
          >
            <div className="flex items-start justify-between">
              <p className="label-upper">{card.title}</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: '#dcfce7' }}>
                <Icon className="w-5 h-5" style={{ color: '#15803d' }} />
              </span>
            </div>

            <p className="kpi-value mt-3">
              {loading ? '...' : card.value}
            </p>

            <p className="mt-2 text-xs text-ink-tertiary">
              {card.description}
            </p>
          </div>
        )
      })}
    </div>
  )
}

export default KpiGrid

