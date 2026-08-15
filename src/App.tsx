import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import  LoginPage from './pages/Login';
import  DashboardPage from './pages/Dashboard'
import ProtectedRoute from './routing/ProtectedRoute';
import MfaAuthenticationPage from './pages/MfaAuthentication';
import SignUpPage from './pages/SignUp';
import NotFoundPage from './pages/NotFound';
import PublicOnlyRoute from './routing/PublicOnlyRoute';

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
