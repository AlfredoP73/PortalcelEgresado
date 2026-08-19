'use client'

import { useEffect, useState } from 'react'

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  getDashboard,
  type DashboardData,
} from '../../../api/dashboardServices'

interface Props { programId?: number; year?: number; }
export function SalaryByProgram({ programId, year }: Props) {
  const [data, setData] = useState<
    DashboardData['salary_by_program']
  >([])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true); const dashboard = await getDashboard(programId, year)

        setData(dashboard.salary_by_program)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [programId, year])

  return (
    <section className="card p-5">
      <div>
        <h2 className="text-base font-semibold text-ink">
          Salario promedio por programa
        </h2>

        <p className="mt-1 text-xs text-ink-secondary">
          Ingreso mensual reportado por egresados
        </p>
      </div>

      {loading ? (
        <div className="flex h-[300px] items-center justify-center">
          <p className="text-sm text-ink-secondary">
            Cargando datos...
          </p>
        </div>
      ) : data.length === 0 ? (
        <div className="flex h-[300px] items-center justify-center">
          <p className="text-sm text-ink-secondary">
            No hay datos disponibles todavía.
          </p>
        </div>
      ) : (
        <div className="mt-4 h-[320px] w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid
                vertical={false}
                stroke="var(--border-color)"
              />

              <XAxis
                dataKey="program"
                tickLine={false}
                axisLine={false}
                tick={{
                  fontSize: 11,
                  fill: 'var(--text-secondary)',
                }}
                angle={-25}
                textAnchor="end"
                interval={0}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{
                  fontSize: 11,
                  fill: 'var(--text-secondary)',
                }}
                tickFormatter={(value) =>
                  `$${Number(value).toLocaleString()}`
                }
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  color: 'var(--text-main)',
                }}
                formatter={(value) =>
                  `$${Number(value).toLocaleString()}`
                }
              />

              <Bar
                dataKey="average_salary"
                fill="var(--color-brand-500)"
                radius={[6, 6, 0, 0]}
                maxBarSize={55}
              >
                <LabelList
                  dataKey="average_salary"
                  position="top"
                  fill="var(--text-secondary)"
                  fontSize={11}
                  formatter={(value) =>
                    `$${Number(value).toLocaleString()}`
                  }
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}

export default SalaryByProgram
