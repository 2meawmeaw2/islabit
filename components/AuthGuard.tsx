import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { router } from "expo-router";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { user, loading } = useAuth();
  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // User is not authenticated and auth is required
        router.replace("/sign");
      } else if (!requireAuth && user) {
        // User is authenticated but auth is not required (e.g., on sign page)
        router.replace("/");
      }
    }
  }, [user, loading, requireAuth]);

  // Show loading state while checking auth
  if (loading) {
    return null; // You can add a loading spinner here
  }

  // If auth requirements are met, render children
  if ((requireAuth && user) || (!requireAuth && !user)) {
    return <>{children}</>;
  }

  // Otherwise, don't render anything (redirecting)
  return null;
}
