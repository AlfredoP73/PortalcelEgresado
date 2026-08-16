import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Companies from './pages/Companies';
import JobOffers from './pages/JobOffers';
import Kanban from './pages/Kanban';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pública */}
        <Route path="/login" element={<Login />} />

        {/* Privadas — envueltas en Layout */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/companies"
            element={<Layout><Companies /></Layout>}
          />
          <Route
            path="/job-offers"
            element={<Layout><JobOffers /></Layout>}
          />
          <Route
            path="/kanban"
            element={<Layout><Kanban /></Layout>}
          />
        </Route>

        {/* Redirige raíz */}
        <Route path="/" element={<Navigate to="/companies" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}