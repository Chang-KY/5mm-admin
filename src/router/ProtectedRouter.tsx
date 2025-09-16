import {Navigate} from "react-router-dom";
import {useAuth} from "@/hooks/useAuth";
import Loading from "@/components/loading/Loading";

const ProtectedRouter = ({children}: { children: React.ReactNode }) => {
  const {loading, isAuthenticated} = useAuth();

  if (loading) return <Loading/>;
  if (!isAuthenticated) return <Navigate to="/login" replace/>;

  return <>{children}</>;
};

export default ProtectedRouter;
