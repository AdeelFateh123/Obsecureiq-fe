import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

type UserRole = "Admin" | "Analyst";

interface User {
  email: string;
  role: UserRole;
  name: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  handleSessionExpired: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let isHandlingExpiration = false;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

// Global function to check token validity
const isTokenValid = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  } catch {
    return false;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const accessToken = localStorage.getItem("accessToken");
    
    if (storedUser && accessToken) {
      if (isTokenValid(accessToken)) {
        setUser(JSON.parse(storedUser));
      } else {
        // Token expired on app load
        handleSessionExpired();
      }
    }
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    toast({
      title: "Success",
      description: "Logout successful",
    });
    navigate("/login");
  };

  const handleSessionExpired = () => {
    if (isHandlingExpiration) return;
    isHandlingExpiration = true;
    
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    
    toast({
      title: "Session Expired",
      description: "Your session has expired. Please log in again.",
      variant: "destructive",
    });
    
    navigate("/login");
    
    setTimeout(() => {
      isHandlingExpiration = false;
    }, 1000);
  };

  return (
    <div data-auth-context ref={(el) => { if (el) (el as any)._authContext = { handleSessionExpired }; }}>
      <AuthContext.Provider
        value={{
          user,
          setUser,
          logout,
          handleSessionExpired,
          isAuthenticated: !!user,
        }}
      >
        {children}
      </AuthContext.Provider>
    </div>
  );
};

// Global API response handler
export const handleApiResponse = async (response: Response): Promise<Response> => {
  if (response.status === 401 && !isHandlingExpiration) {
    const authContext = document.querySelector('[data-auth-context]') as any;
    if (authContext?._authContext?.handleSessionExpired) {
      authContext._authContext.handleSessionExpired();
    } else {
      // Fallback if context not available
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userRole");
      window.location.href = "/login";
    }
  }
  return response;
};
