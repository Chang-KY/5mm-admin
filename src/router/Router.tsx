import {createBrowserRouter, Navigate, type RouteObject} from "react-router-dom";
import NotAuthError from "@/pages/error/NotAuthError";
import Login from "@/pages/Login";
import NotFound from "@/pages/error/NotFound";
import App from "@/App";
import ProtectedRouter from "@/router/ProtectedRouter.tsx";
import Start from "@/router/Start.tsx";
import PublicOnlyRouter from "@/router/PublicOnlyRouter.tsx";
import Dashboard from "@/pages/Dashboard.tsx";
import AddProject from "@/pages/AddProject.tsx";
import DetailProject from "@/pages/DetailProject.tsx";
import UpdateProject from "@/pages/UpdateProject.tsx";
import EditContact from "@/pages/EditContact.tsx";
import Contact from "@/pages/Contact.tsx";
import ReorderProjects from "@/pages/ReorderProjects.tsx";
import ErrorNotProject from "@/pages/error/ErrorNotProject.tsx";

const routes: RouteObject[] = [
  {
    path: '',
    element: <App/>,
    children: [
      {
        path: '',
        element: <ProtectedRouter><Start/></ProtectedRouter>,
        errorElement: <NotAuthError/>,
        children: [
          {
            index: true,
            element: <Navigate to="dashboard" replace/>,
          },
          {
            path: 'dashboard',
            element: <Dashboard/>
          },
          {
            path: 'reorder-projects',
            element: <ReorderProjects/>
          },
          {
            path: 'contact',
            element: <Contact/>
          },
          {
            path: 'edit-contact',
            element: <EditContact/>
          },
          {
            path: 'add-project',
            element: <AddProject/>
          },
          {
            path: 'update-project/:id',
            element: <UpdateProject/>
          },
          {
            path: 'detail-project/:id',
            element: <DetailProject/>
          },
        ],
      },
      {
        path: 'not-project',
        element: <ErrorNotProject/>,
      },
      {
        path: 'login',
        element: <PublicOnlyRouter><Login/></PublicOnlyRouter>
      },
      {
        path: '*',
        element: <NotFound/>,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
