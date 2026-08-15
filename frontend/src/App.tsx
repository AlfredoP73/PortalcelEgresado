import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Companies from './pages/Companies';
import JobOffers from './pages/JobOffers';
import Kanban from './pages/Kanban';
import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/empresas" replace />} />
          <Route path="/empresas" element={<Companies />} />
          <Route path="/vacantes" element={<JobOffers />} />
          <Route path="/kanban" element={<Kanban />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
