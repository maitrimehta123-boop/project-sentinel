import { Navigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/hooks/useAuth";

type Props = { children: React.ReactNode };

const AdminRoute = ({ children }: Props) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <PageLayout title="Loading">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="h-10 w-10 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
        </div>
      </PageLayout>
    );
  }

  // Unauthenticated visitors and signed-in customers are both sent to the
  // standalone admin sign-in; the panel is never rendered without the DB role.
  if (!user || !isAdmin) return <Navigate to="/admin/login" replace />;

  return <>{children}</>;
};

export default AdminRoute;
