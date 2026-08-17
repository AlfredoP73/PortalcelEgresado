const DASHBOARD_URL =
  import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:8004'

export interface DashboardData {
  summary: {
    total_graduates: number
    employment_rate: number
    average_salary: number
    average_time_to_first_job: number
  }

  employment_by_program: {
    program: string
    percentage: number
  }[]

  industries: {
    sector: string
    percentage: number
  }[]

  salary_by_program: {
    program: string
    average_salary: number
  }[]

  application_status: {
    status: string
    count: number
  }[]
}

export async function getDashboard(): Promise<DashboardData> {
  const token = localStorage.getItem('access_token')

  const response = await fetch(`${DASHBOARD_URL}/api/dashboard`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('No se pudieron obtener los datos del dashboard')
  }

  return response.json()
}