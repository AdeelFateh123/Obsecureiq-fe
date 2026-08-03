import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Eye, EyeOff } from "lucide-react";
import ForgotPasswordModal from "@/components/modals/ForgotPasswordModal";
import bgImage from "@/assets/bgImage.jpg";
import { BASE_URL } from "@/constants/api";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/use-api";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  const { toast } = useToast();
  const navigate = useNavigate();
  const { apiCall } = useApi();
  const { setUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiCall(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Login Failed",
          description: data.detail || "Invalid credentials.",
          variant: "destructive",
        });
        return;
      }

      // Store JWT and role in localStorage
      localStorage.setItem("accessToken", data.access_token);
      localStorage.setItem("userRole", data.role);
      
      // Create user object and store in context
      const user = {
        email: data.email || email,
        role: data.role,
        name: data.name || data.email || email
      };
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      toast({
        title: "Success!",
        description: data.message || "Login successful",
      });

      // Redirect based on role
      if (data.role === "Admin") {
        navigate("/admin/dashboard");
      } else if (data.role === "Analyst") {
        navigate("/analyst/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (email: string) => {
    try {
      const response = await apiCall(`${BASE_URL}/reset-password-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.detail || "Failed to send reset email.",
          variant: "destructive",
        });
        return;
      }

      setIsForgotPasswordOpen(false);
      toast({
        title: "Email Sent!",
        description: "Password reset link has been sent to your email.",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };



  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <Card className="w-full max-w-sm bg-transparent border-0 shadow-none">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-accent/90 via-accent/85 to-primary/60 flex items-center justify-center">
              <FileText className="h-7 w-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-white">Welcome back</CardTitle>
          <CardDescription className="text-white/80">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="text-sm hover:underline"
                  style={{ color: "#00FFFF" }}
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-accent/90 via-accent/85 to-primary/60 text-white hover:scale-105 transition-all"
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            <p className="text-sm text-white text-center">
              Don't have an account?{" "}
              <Link to="/signup" className="hover:underline" style={{ color: "#00FFFF" }}>
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        onEmailSubmit={handleForgotPasswordSubmit}
      />


    </div>
  );
};

export default Login;
