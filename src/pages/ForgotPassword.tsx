import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import bgImage from "@/assets/bgImage.jpg";
import { BASE_URL } from "@/constants/api";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/use-api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();
  const { apiCall } = useApi();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

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

      setSent(true);
    } catch (error) {
      console.error("Forgot password error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Card */}
      <div className="relative w-full max-w-md animate-fade-in">
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 space-y-6">

          {/* Header */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent via-accent/80 to-primary/70 flex items-center justify-center shadow-lg">
                <ShieldCheck className="h-7 w-7 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">ObscureIQ</h1>
              <p className="text-white/60 text-sm mt-1">
                {sent ? "Check your inbox" : "Reset your password"}
              </p>
            </div>
          </div>

          {sent ? (
            <div className="space-y-4 text-center">
              <div className="bg-white/10 border border-white/20 rounded-xl p-4">
                <Mail className="h-8 w-8 text-accent mx-auto mb-2" />
                <p className="text-white/80 text-sm">
                  A password reset link has been sent to <span className="text-white font-medium">{email}</span>. Check your inbox and follow the instructions.
                </p>
              </div>
              <Link to="/login">
                <Button className="w-full h-11 bg-gradient-to-r from-accent/90 via-accent/85 to-primary/60 text-white font-semibold hover:scale-[1.02] hover:shadow-lg transition-all duration-200">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-white/60 text-sm text-center">
                Enter your email and we'll send you a reset link.
              </p>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-white/80 text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-11 pl-10 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/50"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-gradient-to-r from-accent/90 via-accent/85 to-primary/60 text-white font-semibold hover:scale-[1.02] hover:shadow-lg transition-all duration-200"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          )}

          {!sent && (
            <p className="text-center text-sm text-white/50">
              <Link
                to="/login"
                className="flex items-center justify-center gap-1.5 text-accent hover:text-accent/80 transition-colors font-medium"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Sign In
              </Link>
            </p>
          )}

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
