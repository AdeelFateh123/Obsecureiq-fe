import { ReactNode, useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Users, FileText, LogOut, KeyRound, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import TopNavBar from "./TopNavBar";
import { useAuth } from "@/contexts/AuthContext";
import ChangePasswordModal from "@/components/modals/ChangePasswordModal";
import { AnalystOverviewModal, ANALYST_STORAGE_KEY } from "@/components/modals/AnalystOverviewModal";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/use-api";
import { BASE_URL } from "@/constants/api";

interface AnalystLayoutProps {
  children: ReactNode;
}

const AnalystLayout = ({ children }: AnalystLayoutProps) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { apiCall } = useApi();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [showOverview, setShowOverview] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(ANALYST_STORAGE_KEY)) {
      setShowOverview(true);
      localStorage.setItem(ANALYST_STORAGE_KEY, "true");
    }
  }, []);

  const navItems = [
    { name: "Clients", path: "/analyst/dashboard", icon: Users },
    { name: "Generated Documents", path: "/analyst/generated-documents", icon: FileText },
  ];

  const isActive = (path: string) => location.pathname === path;

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "A";

  const handleChangePassword = async (oldPassword: string, newPassword: string) => {
    try {
      const response = await apiCall(`${BASE_URL}/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
      });

      if (response.ok) {
        setIsChangePasswordOpen(false);
        toast({ title: "Success", description: "Password changed successfully." });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.detail || "Failed to change password.",
          variant: "destructive",
        });
      }
    } catch {
      toast({ title: "Error", description: "An error occurred while changing password.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <TopNavBar />

      <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-gradient-to-b from-accent/10 via-background to-primary/10 backdrop-blur-sm border-r border-accent/30 shadow-medium z-40 flex flex-col">
        <nav className="flex-1 p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link key={item.path} to={item.path}>
                <div
                  className={cn(
                    "w-full rounded-lg px-4 py-3 flex items-center text-sm font-medium cursor-pointer transition-all duration-200",
                    active
                      ? "bg-gradient-to-r from-accent/90 via-accent/85 to-primary/60 text-white shadow-soft"
                      : "text-foreground hover:bg-gradient-to-r hover:from-accent/20 hover:to-primary/20 hover:scale-[1.02]"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </div>
              </Link>
            );
          })}
          <button
            onClick={() => setShowOverview(true)}
            className="w-full rounded-lg px-4 py-3 flex items-center text-sm font-medium text-foreground hover:bg-gradient-to-r hover:from-accent/20 hover:to-primary/20 hover:scale-[1.02] transition-all duration-200"
          >
            <BookOpen className="mr-3 h-5 w-5" />
            Overview
          </button>
        </nav>

        {/* User info + actions */}
        <div className="p-4 border-t border-accent/20 flex-shrink-0 space-y-1">
          <div className="flex items-center gap-3 px-1 pb-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent/80 to-primary/60 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-semibold">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name || "Analyst"}</p>
              <p className="text-xs text-muted-foreground">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={() => setIsChangePasswordOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent/10 rounded-lg transition-colors"
          >
            <KeyRound className="h-4 w-4 text-muted-foreground" />
            Change Password
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="pt-16 ml-64">
        <div className="p-8">{children}</div>
      </main>

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        onChangePassword={handleChangePassword}
      />

      <AnalystOverviewModal
        open={showOverview}
        onClose={() => setShowOverview(false)}
      />
    </div>
  );
};

export default AnalystLayout;
