import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const TopNavBar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogoClick = () => {
    if (user?.role === "Admin") {
      navigate("/admin/dashboard");
    } else if (user?.role === "Analyst") {
      navigate("/analyst/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-accent/90 via-accent/85 to-primary/60 border-b border-white/20 shadow-medium z-50 backdrop-blur-sm">
      <div className="flex items-center h-full px-6">
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-3 cursor-pointer group transition-all duration-300 hover:scale-105"
        >
          <div className="w-10 h-10 rounded-xl bg-white/90 flex items-center justify-center group-hover:scale-110 transition-all">
            <span className="text-xl">🔍</span>
          </div>
          <span className="text-xl text-white font-bold tracking-wide drop-shadow-md">
            ObscureIQ
          </span>
        </button>
      </div>
    </header>
  );
};

export default TopNavBar;
