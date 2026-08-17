import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import DashboardPage from './pages/Dashboard'
import LoginPage from './pages/Login'
import MfaAuthenticationPage from './pages/MfaAuthentication'
import NotFoundPage from './pages/NotFound'
import SignUpPage from './pages/SignUp'
import ProtectedRoute from './routing/ProtectedRoute'
import PublicOnlyRoute from './routing/PublicOnlyRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Route>

        <Route path="/mfa" element={<MfaAuthenticationPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
