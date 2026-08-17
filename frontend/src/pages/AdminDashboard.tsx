import { DashboardHeader } from '../components/AdminDashboard/DashboardHeader';
import { KpiGrid } from '../components/AdminDashboard/KpiGrid';
import { EmploymentByProgram } from '../components/AdminDashboard/EmploymentByProgram';
import { TopIndustries } from '../components/AdminDashboard/TopIndustries';
import { SalaryByProgram } from '../components/AdminDashboard/SalaryByProgram';
import { EmploymentStatus } from '../components/AdminDashboard/EmploymentStatus';

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <DashboardHeader />

      <KpiGrid />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <EmploymentByProgram />
        <TopIndustries />
      </div>

      <SalaryByProgram />

      <EmploymentStatus />
    </div>
  );
}

export default AdminDashboard;