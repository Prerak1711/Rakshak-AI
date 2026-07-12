import { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import BottomNav from "./components/layout/BottomNav";
import { VoiceSOSIndicator } from "./components/common/VoiceSOSIndicator";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SOS from "./pages/SOS";
import Contacts from "./pages/Contacts";
import Location from "./pages/Location";
import Tracking from "./pages/Tracking";
import EmergencyMessage from "./pages/EmergencyMessage";
import SafeRoute from "./pages/SafeRoute";
import Settings from "./pages/Settings";
import ControlCenter from "./pages/ControlCenter";

import { auth } from "./services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { SOSFlowProvider } from "./hooks/useSOSFlow";
import { VoiceSOSProvider } from "./hooks/useVoiceSOS";

const publicRoutes = ["/", "/login", "/register"];

function AppContent() {
  const location = useLocation();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const showShell = !publicRoutes.includes(location.pathname);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 text-slate-200">
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-6 py-4 shadow-2xl shadow-slate-950/40">
          Loading Rakshak AI...
        </div>
      </div>
    );
  }

  const appShell = (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {showShell && <Navbar />}

      <main className={showShell ? "min-h-screen pb-24 pt-4 md:pt-6" : "min-h-screen"}>
        <Routes>
          {/* Public Routes */}

          <Route path="/" element={<Landing />} />

          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login />
              )
            }
          />

          <Route
            path="/register"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Register />
              )
            }
          />

          {/* Protected Routes */}

          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <Dashboard />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/sos"
            element={
              isAuthenticated ? (
                <SOS />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/contacts"
            element={
              isAuthenticated ? (
                <Contacts />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/location"
            element={
              isAuthenticated ? (
                <Location />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/tracking"
            element={
              isAuthenticated ? (
                <Tracking />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/safe-route"
            element={
              isAuthenticated ? (
                <SafeRoute />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/settings"
            element={
              isAuthenticated ? (
                <Settings />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/emergency-message"
            element={
              isAuthenticated ? (
                <EmergencyMessage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/control-center"
            element={
              isAuthenticated ? (
                <ControlCenter />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {showShell && <BottomNav />}
    </div>
  );

  if (!isAuthenticated) return appShell;

  return (
    <SOSFlowProvider>
      <VoiceSOSProvider>
        {appShell}
        {showShell && <VoiceSOSIndicator />}
      </VoiceSOSProvider>
    </SOSFlowProvider>
  );
}

export default function App() {
  return (
    
      <AppContent />
    
  );
}
