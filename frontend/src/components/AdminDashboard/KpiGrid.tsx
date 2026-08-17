'use client'

import { useEffect, useState } from 'react'

import {
  getDashboard,
  type DashboardData,
} from '../../api/dashboardServices'

export function KpiGrid() {
  const [data, setData] =
    useState<DashboardData['summary'] | null>(null)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      try {
        const dashboard = await getDashboard()

        setData(dashboard.summary)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

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
      {cards.map((card) => (
        <div
          key={card.title}
          className="card p-5"
        >
          <p className="text-sm font-medium text-ink-secondary">
            {card.title}
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-ink">
            {loading ? '...' : card.value}
          </p>

          <p className="mt-2 text-xs text-ink-tertiary">
            {card.description}
          </p>
        </div>
      ))}
    </div>
  )
}

export default KpiGrid