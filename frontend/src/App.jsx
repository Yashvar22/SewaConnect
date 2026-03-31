import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import NGOListPage from "./pages/NGOListPage";
import NGODetailPage from "./pages/NGODetailPage";
import EventPage from "./pages/EventPage";
import EventDetailPage from "./pages/EventDetailPage";
import DonatePage from "./pages/DonatePage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main>
          <Routes>
            {/* Home as the root landing page */}
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/ngos" element={<NGOListPage />} />
            <Route path="/ngos/:id" element={<NGODetailPage />} />
            <Route path="/events" element={<EventPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            {/* Protected routes */}
            <Route path="/donate" element={
              <PrivateRoute><DonatePage /></PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute><ProfilePage /></PrivateRoute>
            } />
            <Route path="/dashboard" element={
              <PrivateRoute><DashboardPage /></PrivateRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
