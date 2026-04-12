import React from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import { tokenService } from "../utils/tokenService";
import LoadingSpinner from "./LoadingSpinner";
import AccessDenied from "./AccessDenied";

function AdminRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const isAdmin = tokenService.isAdmin();

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return children;
}

export default AdminRoute;
