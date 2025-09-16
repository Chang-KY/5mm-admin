import {Navigate} from "react-router-dom";
import {useAuth} from "@/hooks/useAuth";
import Loading from "@/components/loading/Loading";

const PublicOnlyRouter = ({children}: { children: React.ReactNode }) => {
  const {loading, isAuthenticated} = useAuth();

  if (loading) return <Loading/>;
  if (isAuthenticated) return <Navigate to="/" replace/>; // 예: 홈이나 대시보드로 보냄

  return <>{children}</>;
};

export default PublicOnlyRouter;
