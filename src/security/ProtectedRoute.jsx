import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../config';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(null);

  const normalizePath = (path) => (path.startsWith("/") ? path : `/${path}`);

  useEffect(() => {
    const checkAccess = async () => {
      let user;
      try {
        const userData = localStorage.getItem("user");
        user = userData ? JSON.parse(userData) : null;
        if (!user) {
          setIsAuthenticated(false);
          setIsAuthorized(false);
          return;
        }
      } catch (err) {
        console.error("Error loading user:", err);
        setIsAuthenticated(false);
        setIsAuthorized(false);
        return;
      }

      setIsAuthenticated(true);
      const normalizedPath = normalizePath(currentPath);

      // ✅ Always allow dashboard
      if (normalizedPath === "/") {
        setIsAuthorized(true);
        return;
      }

      // ✅ Special case: "/settings" allowed only for Admin and Operation Head
      if (
        normalizedPath === "/settings" &&
        (user.role === "Admin" || user.role === "Operation Head")
      ) {
        setIsAuthorized(true);
        return;
      }

      const userOverrides = Array.isArray(user.routes) ? user.routes : [];

      const denyPaths = userOverrides
        .filter((r) => r.action === "deny")
        .map((r) => normalizePath(r.path));

      const allowPaths = userOverrides
        .filter((r) => r.action === "allow")
        .map((r) => normalizePath(r.path));

      const isExplicitlyDenied = denyPaths.some(
        (deny) =>
          normalizedPath === deny || normalizedPath.startsWith(`${deny}/`)
      );

      const isExplicitlyAllowed = allowPaths.some(
        (allow) =>
          normalizedPath === allow || normalizedPath.startsWith(`${allow}/`)
      );

      // ✅ Rule 1: Deny always wins
      if (isExplicitlyDenied) {
        setIsAuthorized(false);
        return;
      }

      // ✅ Rule 2: Explicit allow
      if (isExplicitlyAllowed) {
        setIsAuthorized(true);
        return;
      }

      // ✅ Rule 3: Fallback to role-based access
      try {
        const res = await axios.get(`${API_URL}/api/route-access/role-access/${user.role}`);
        const roleRoutes = res.data.routes || [];

        const allowedRolePaths = roleRoutes.map((r) => normalizePath(r.path));

        const isRoleAllowed = allowedRolePaths.some(
          (path) =>
            normalizedPath === path || normalizedPath.startsWith(`${path}/`)
        );

        setIsAuthorized(isRoleAllowed);
      } catch (error) {
        console.error("Failed to fetch role access:", error);
        setIsAuthorized(false);
      }
    };

    checkAccess();
  }, [currentPath]);

  // ⏳ Initial loading
  if (isAuthenticated === null || (isAuthenticated && isAuthorized === null)) return null;

  // ❌ Unauthenticated -> redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // ❌ Unauthorized -> redirect to 403 Forbidden
  if (!isAuthorized) {
    return <Navigate to="/403" replace />;
  }

  // ✅ Authorized
  return children;
};

export default ProtectedRoute;
