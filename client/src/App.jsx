import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import UploadPage from './pages/UploadPage';
import DashboardRouter from './components/DashboardRouter';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <Routes>
      {/* Public Routes (No Layout) */}
      <Route path="/" element={<LandingPage/>} />
      <Route path="/login" element={<Login/>} />
      
      {/* Protected Routes (With Layout) */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<DashboardRouter />} />
        <Route path="/upload" element={<UploadPage />} />
      </Route>
    </Routes>
  );
}
export default App;