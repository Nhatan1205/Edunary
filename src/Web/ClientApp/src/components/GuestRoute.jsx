import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";

/**
 * GuestRoute - Restricts authenticated users from accessing guest-only pages
 * (login, register, forget-password)
 * Redirects authenticated users to homepage
 */
const GuestRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show nothing while checking auth status
  if (isLoading) {
    return null;
  }

  // If user is authenticated, redirect to homepage
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If user is not authenticated, allow access to guest pages
  return children;
};

export default GuestRoute;
