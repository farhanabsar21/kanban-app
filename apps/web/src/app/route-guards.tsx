import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useMe } from "../features/auth/hooks/use-auth";

type Props = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: Props) {
  const { data, isLoading } = useMe();

  if (isLoading) return <div>Loading...</div>;

  if (!data?.user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function GuestRoute({ children }: Props) {
  const { data, isLoading } = useMe();

  if (isLoading) return <div>Loading...</div>;

  if (data?.user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
