import { Navigate, Outlet } from "react-router-dom";

const getToken = () => localStorage.getItem("access_token");

export default function ProtectedRoute() {
    const token = getToken();
    return token ? <Outlet /> : <Navigate to="/login" replace />;
}