import { handleApiResponse } from "@/contexts/AuthContext";

// Check if token is valid
const isTokenValid = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  } catch {
    return false;
  }
};

export const useApi = () => {
  const apiCall = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("accessToken");
    
    // Check token validity before making API call
    if (token && !isTokenValid(token)) {
      const authContext = document.querySelector('[data-auth-context]') as any;
      if (authContext?._authContext?.handleSessionExpired) {
        authContext._authContext.handleSessionExpired();
      }
      throw new Error('Session expired');
    }
    
    const headers = {
      ...options.headers,
      ...(token && { "Authorization": `Bearer ${token}` }),
    };
    
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    await handleApiResponse(response);
    return response;
  };

  return { apiCall };
};