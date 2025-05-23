import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

import Login from "./pages/login";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Chatbot from "./pages/Chatbot";
import Cluster from "./pages/Cluster";
import Forecast from "./pages/Forecast";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

// Create a wrapper component to handle initial auth check
const AppRoutes = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const location = useLocation();
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  useEffect(() => {
    // Check if this is the first visit
    const hasVisited = localStorage.getItem("hasVisited");
    if (!hasVisited) {
      localStorage.setItem("hasVisited", "true");
    }
    setIsInitialized(true);
  }, []);

  if (!isInitialized) {
    return null; // or a loading spinner
  }

  // If user is authenticated and tries to access login, redirect to home
  if (isAuthenticated && location.pathname === "/login") {
    return <Navigate to="/home" replace />;
  }

  // If user is not authenticated and tries to access protected routes, redirect to login
  if (!isAuthenticated && location.pathname !== "/login") {
    return <Navigate to="/login" replace />;
  }

  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />} />

        {/* Protected routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Index />
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
          path="/upload"
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chatbot"
          element={
            <ProtectedRoute>
              <Chatbot />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cluster"
          element={
            <ProtectedRoute>
              <Cluster />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forecast"
          element={
            <ProtectedRoute>
              <Forecast />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster />
        <Sonner />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
