import React from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LoadingSpinner } from "../ui";

const ProtectedRoute = ({
  children,
  requiredPermission = null,
  fallback = "/login",
}) => {
  const { isAuthenticated, loading, hasPermission } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={fallback} state={{ from: location }} replace />;
  }

  // Check specific permission if required
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <div className="max-w-md mx-auto">
            <div className="surface-card-elevated p-8">
              <div className="text-6xl text-text-secondary mb-4">
                🚫
              </div>
              <h1 className="text-2xl font-display font-bold text-text-primary mb-4">
                Access Denied
              </h1>
              <p className="text-text-secondary mb-6">
                You don't have permission to access this page.
                {requiredPermission === "admin" && " Admin access required."}
                {requiredPermission === "premium" &&
                  " Premium subscription required."}
                {requiredPermission === "pro" && " Pro subscription required."}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => window.history.back()}
                  className="w-full px-4 py-2 bg-surface-elevated border border-border text-text-primary rounded-md hover:border-accent/30 transition-colors"
                >
                  Go Back
                </button>
                <Link
                  to="/dashboard"
                  className="block w-full px-4 py-2 bg-accent text-bg rounded-md transition-colors text-center hover:bg-accent-hover"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
