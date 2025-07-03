// src/App.jsx
import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import { CitiesProvider } from "./contexts/CitiesContext";
import AuthProvider from "./contexts/AuthContext";
import { GroupsProvider } from "./contexts/GroupsContext";
import ProtectedRoute from "./pages/ProtectedRoute";

import UserList from "./components/UserList";
import GroupList from "./components/GroupList";
import City from "./components/City";
import Form from "./components/Form";
import SpinnerFullPage from "./components/SpinnerFullPage";

const Homepage = lazy(() => import("./pages/Homepage"));
const Product = lazy(() => import("./pages/Product"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const AppLayout = lazy(() => import("./pages/AppLayout"));
const PageNotFound = lazy(() => import("./pages/PageNotFound"));
const Profile = lazy(() => import("./pages/Profile"));


// Wrap protected routes with your ProtectedRoute component
const ProtectedAppLayout = () => (
  <ProtectedRoute>
    <AppLayout />
  </ProtectedRoute>
);

// Create the router object
const router = createBrowserRouter([
  {
    path: "/",
    element: <Homepage />,
  },
  {
    path: "product",
    element: <Product />,
  },
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "register",
    element: <Register />,
  },
  {
    path: "app",
    element: <ProtectedAppLayout />,
    children: [
      {
        index: true,
        element: <Navigate replace to="groups" />,
      },
      {
        path: "cities",
        element: <UserList />,
      },
      {
        path: "cities/:id",
        element: <City />,
      },
      {
        path: "groups",
        element: <GroupList />,
      },
      {
        path: "form",
        element: <Form />,
      },
       {
        path: "profile",
        element: <Profile />,
      },
    ],
  },
  {
    path: "*",
    element: <PageNotFound />,
  },
]);

function App() {
  return (
    <AuthProvider>
      <CitiesProvider>
        <GroupsProvider>
          <Suspense fallback={<SpinnerFullPage />}>
            <RouterProvider router={router} />
          </Suspense>
        </GroupsProvider>
      </CitiesProvider>
    </AuthProvider>
  );
}

export default App;
