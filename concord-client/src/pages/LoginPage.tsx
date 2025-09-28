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
import { useAuthStore } from "@/stores/authStore";

const LoginPage: React.FC = () => {
  const { isAuthenticated, setAuth } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/channels/@me" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Replace with actual login API call
      setTimeout(() => {
        setAuth(
          {
            id: "1",
            username,
            nickname: username,
            bio: "Test user",
            picture: "",
            banner: "",
            hashPassword: "",
            admin: false,
            status: "online",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            roles: [],
          },
          "fake-token",
          "fake-refresh-token",
        );
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoading(false);
    }
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
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Log In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
