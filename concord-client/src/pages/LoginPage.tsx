import React, { useState } from "react";
import { Navigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/stores/authStore";
import { useLogin } from "@/hooks/useAuth";

const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Use the real login hook
  const { mutate: login, isPending, error } = useLogin();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      return;
    }

    login({ username: username.trim(), password });
  };

  return (
    <div className="min-h-screen bg-concord-primary flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-concord-secondary border-concord">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-concord-primary">
            Welcome back!
          </CardTitle>
          <CardDescription className="text-concord-secondary">
            We're so excited to see you again!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error instanceof Error
                    ? error.message
                    : "Login failed. Please try again."}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-concord-primary">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-concord-tertiary border-concord text-concord-primary"
                placeholder="Enter your username"
                disabled={isPending}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-concord-primary">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-concord-tertiary border-concord text-concord-primary"
                placeholder="Enter your password"
                disabled={isPending}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isPending || !username.trim() || !password.trim()}
            >
              {isPending ? "Logging in..." : "Log In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
