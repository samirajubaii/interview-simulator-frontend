import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Interview from "../pages/Interview";
import Review from "../pages/ReviewPage";
import Dashboard from "../pages/Dashboard";
import AuthPage from "../pages/AuthPage";
import ProtectedRoute from "../components/ProtectedRoute";
import ResultDetail from "../pages/ResultDetail";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";


function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/interview"
        element={
          <ProtectedRoute>
            <Interview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/review"
        element={
          <ProtectedRoute>
            <Review />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/results/:id"
        element={
          <ProtectedRoute>
            <ResultDetail />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRouter;