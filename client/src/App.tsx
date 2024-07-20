import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import ProjectPage from "./pages/ProjectPage";
import EditProject from "./components/EditProject";
import CreateProject from "./components/CreateProject";
// import { AuthProvider } from "./context/AuthContext";
import "./App.css";
import Navbar from "./components/Navbar";
const App: React.FC = () => {
  const Layout = () => {
    return (
      <div>
        <Navbar />
        <div className="main">
          <Home />
        </div>
      </div>
    );
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "/project/:id",
          element: <ProjectPage />,
        },
        {
          path: "/create-project",
          element: <CreateProject />,
        },
        {
          path: "/edit-project/:id",
          element: <EditProject />,
        },
      ],
    },
  ]);

  return (
    // <AuthProvider>
    //   <BrowserRouter>
    //     <Routes>
    //       <Route path="/" element={<Home />} />
    //       <Route path="/project/:id" element={<ProjectPage />} />
    //       <Route path="/create-project" element={<CreateProject />} />
    //       <Route path="/edit-project/:id" element={<EditProject />} />
    //     </Routes>
    //   </BrowserRouter>
    // </AuthProvider>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;
