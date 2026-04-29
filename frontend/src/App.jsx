import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import NGOListPage from "./pages/NGOListPage";
import EventPage from "./pages/EventPage";
import DonatePage from "./pages/DonatePage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";

// Lazy-load pages that embed the Leaflet map (reduces initial bundle)
const NGODetailPage  = lazy(() => import("./pages/NGODetailPage"));
const EventDetailPage = lazy(() => import("./pages/EventDetailPage"));

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main>
          <Suspense fallback={<div className="loading" style={{ padding: "4rem", textAlign: "center" }}><div className="spinner-ring" style={{ margin: "0 auto 1rem" }} />Loading...</div>}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/ngos" element={<NGOListPage />} />
              <Route path="/ngos/:id" element={<NGODetailPage />} />
              <Route path="/events" element={<EventPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />

              {/* Protected routes — require login */}
              <Route path="/donate" element={
                <PrivateRoute><DonatePage /></PrivateRoute>
              } />
              <Route path="/profile" element={
                <PrivateRoute><ProfilePage /></PrivateRoute>
              } />
              <Route path="/dashboard" element={
                <PrivateRoute><DashboardPage /></PrivateRoute>
              } />

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
