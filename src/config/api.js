const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Helper function to prepare headers with auth token
export const prepareHeadersWithAuth = (headers) => {
  // Get token from localStorage
  const token = localStorage.getItem("token");

  // If token exists, add it to Authorization header
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
};

export default API_BASE_URL;
