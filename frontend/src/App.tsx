import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Companies from './pages/Companies';
import JobOffers from './pages/JobOffers';
import Kanban from './pages/Kanban';
import GraduateProfile from './pages/GraduateProfile';
import GraduateExperience from './pages/GraduateExperience';
import GraduateEducation from './pages/GraduateEducation';
import JobBoard from './pages/JobBoard';
import GraduateApplications from './pages/GraduateApplications';
import GraduateSurveys from './pages/GraduateSurveys';
import AdminGraduates from './pages/AdminGraduates';
import AdminApplications from './pages/AdminApplications';
import AdminSectors from './pages/AdminSectors';
import AdminCities from './pages/AdminCities';
import AdminPrograms from './pages/AdminPrograms';
import AdminUsers from './pages/AdminUsers';
import CompanyTalentPool from './pages/CompanyTalentPool';

const HomeRedirect = () => {
  const rawUser = localStorage.getItem('user');
  if (!rawUser) return <Navigate to="/login" replace />;
  const user = JSON.parse(rawUser);
  if (user.role_name === 'GRADUATE') return <Navigate to="/profile" replace />;
  return <Navigate to="/companies" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* Pública */}
        <Route path="/login" element={<Login />} />

        {/* Privadas — Módulo 2 (Empresas y Administrador) */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'COMPANY']} />}>
          <Route
            path="/companies"
            element={<Layout><Companies /></Layout>}
          />
          <Route
            path="/talent-pool"
            element={<Layout><CompanyTalentPool /></Layout>}
          />
          <Route
            path="/job-offers"
            element={<Layout><JobOffers /></Layout>}
          />
          <Route
            path="/kanban"
            element={<Layout><Kanban /></Layout>}
          />
          <Route
            path="/admin/graduates"
            element={<Layout><AdminGraduates /></Layout>}
          />
          <Route
            path="/admin/applications"
            element={<Layout><AdminApplications /></Layout>}
          />
          <Route
            path="/admin/sectors"
            element={<Layout><AdminSectors /></Layout>}
          />
          <Route
            path="/admin/cities"
            element={<Layout><AdminCities /></Layout>}
          />
          <Route
            path="/admin/programs"
            element={<Layout><AdminPrograms /></Layout>}
          />
          <Route
            path="/admin/users"
            element={<Layout><AdminUsers /></Layout>}
          />
        </Route>

        {/* Privadas — Módulo 1 (Egresados) */}
        <Route element={<ProtectedRoute allowedRoles={['GRADUATE', 'ADMIN']} />}>
          <Route
            path="/profile"
            element={<Layout><GraduateProfile /></Layout>}
          />
          <Route
            path="/experience"
            element={<Layout><GraduateExperience /></Layout>}
          />
          <Route
            path="/education"
            element={<Layout><GraduateEducation /></Layout>}
          />
          <Route
            path="/jobs"
            element={<Layout><JobBoard /></Layout>}
          />
          <Route
            path="/applications"
            element={<Layout><GraduateApplications /></Layout>}
          />
          <Route
            path="/surveys"
            element={<Layout><GraduateSurveys /></Layout>}
          />
        </Route>

        {/* Redirige raíz */}
        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}