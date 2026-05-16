import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AdminLogin from './pages/AdminLogin'
import ClientLogin from './pages/ClientLogin'
import StudentLogin from './pages/StudentLogin'
import VerifyOTP from './pages/VerifyOTP'
import StudentResult from './pages/StudentResult'
import ExpiredAccess from './pages/ExpiredAccess'
import AdminDashboard from './pages/AdminDashboard'
import ClientDashboard from './pages/ClientDashboard'
import DatabaseStructure from './pages/DatabaseStructure'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/client/login" element={<ClientLogin />} />
      <Route path="/student/login" element={<StudentLogin />} />
      <Route path="/student/verify-otp" element={<VerifyOTP />} />
      <Route path="/student/result" element={<StudentResult />} />
      <Route path="/student/expired" element={<ExpiredAccess />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/client/dashboard" element={<ClientDashboard />} />
      <Route path="/database" element={<DatabaseStructure />} />
    </Routes>
  )
}

export default App
