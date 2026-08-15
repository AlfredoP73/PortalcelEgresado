import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Companies from "./pages/Companies";
import JobOffers from "./pages/JobOffers";
import Kanban from "./pages/Kanban";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pública */}

        {/* Privadas — todo lo que esté aquí dentro requiere token */}
        <Route element={<ProtectedRoute />}>
          <Route path="/companies" element={<Companies />} />
          <Route path="/job-offers" element={<JobOffers />} />
          <Route path="/kanban" element={<Kanban />} />
        </Route>

        {/* Redirige raíz */}
        <Route path="/" element={<Navigate to="/companies" replace />} />
      </Routes>
    </BrowserRouter>
  );
}