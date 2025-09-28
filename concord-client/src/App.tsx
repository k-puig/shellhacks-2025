import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/sonner";

import { ThemeProvider } from "@/components/theme-provider";
import AppLayout from "@/components/layout/AppLayout";
import LoginPage from "@/pages/LoginPage";
import ChatPage from "@/pages/ChatPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFoundPage from "@/pages/NotFoundPage";

// import { useAuthStore } from "@/stores/authStore";
// import { useUiStore } from "@/stores/uiStore";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { Home } from "lucide-react";

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

// Home page component - shows server selection
const HomePage: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center bg-concord-primary">
      <div className="text-center text-concord-secondary max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 bg-concord-secondary rounded-full flex items-center justify-center">
          <Home />
        </div>
        <h2 className="text-xl font-semibold mb-2 text-concord-primary">
          Welcome to Concord
        </h2>
        <p className="text-sm mb-4">
          Select a server from the sidebar to start chatting, or create a new
          server
        </p>
      </div>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="discord-theme">
          <Router>
            <div className="h-screen w-screen overflow-hidden bg-background text-foreground">
              <Routes>
                {/* Auth routes */}
                <Route path="/login" element={<LoginPage />} />

                {/* Protected routes with layout */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  {/* Default redirect to home */}
                  <Route index element={<HomePage />} />

                  {/* Server and channel routes */}
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

          {import.meta.env.DEV === true && <ReactQueryDevtools />}
          {/* Toast notifications */}
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
