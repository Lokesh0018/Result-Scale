import { Routes, Route } from 'react-router-dom'
import { ToastProvider } from './components/Toast'
import { ThemeProvider } from './components/ThemeProvider'
import { LoadingProvider } from './components/LoadingProvider'
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
import RequestQuotation from './pages/RequestQuotation'
import InstitutionSelection from './pages/InstitutionSelection'

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <LoadingProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/client/login" element={<ClientLogin />} />
            <Route path="/student/select-institution" element={<InstitutionSelection />} />
            <Route path="/student/login" element={<StudentLogin />} />
            <Route path="/student/verify-otp" element={<VerifyOTP />} />
            <Route path="/student/result" element={<StudentResult />} />
            <Route path="/student/expired" element={<ExpiredAccess />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/client/dashboard" element={<ClientDashboard />} />
            <Route path="/database" element={<DatabaseStructure />} />
            <Route path="/request-quotation" element={<RequestQuotation />} />
          </Routes>
        </LoadingProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
