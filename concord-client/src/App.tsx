import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/sonner";

import AppLayout from "@/components/layout/AppLayout";
import LoginPage from "@/pages/LoginPage";
import ChatPage from "@/pages/ChatPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFoundPage from "@/pages/NotFoundPage";

import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";
import ErrorBoundary from "@/components/common/ErrorBoundary";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        if (error?.status === 401) return false;
        return failureCount < 3;
      },
    },
  },
});

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // const { isAuthenticated } = useAuthStore();

  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }

  return <>{children}</>;
};

function App() {
  const { theme } = useUiStore();

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div
            className={`h-screen w-screen overflow-hidden ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}
          >
            <Routes>
              {/* Auth routes */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected routes with layout */}
              <Route
                path="/"
                element={
                  // <ProtectedRoute>
                  <AppLayout />
                  // </ProtectedRoute>
                }
              >
                {/* Default redirect to channels */}
                <Route
                  index
                  element={<Navigate to="/channels/@me" replace />}
                />

                {/* Chat routes */}
                <Route
                  path="channels"
                  element={<Navigate to="/channels/@me" replace />}
                />
                <Route path="channels/@me" element={<ChatPage />} />
                <Route path="channels/:instanceId" element={<ChatPage />} />
                <Route
                  path="channels/:instanceId/:channelId"
                  element={<ChatPage />}
                />

                {/* Settings */}
                <Route path="settings" element={<SettingsPage />} />
                <Route path="settings/:section" element={<SettingsPage />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </Router>

        {/* Dev tools - only in development */}
        {/*process.env.NODE_ENV === "development" && <ReactQueryDevtools />*/}

        {/* Toast notifications */}
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
