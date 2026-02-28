import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ScrollToTop from "./components/ScrollToTop";
import Project from "./pages/Project";
import ProjectDetails from "./pages/ProjectDetails";
import Features from "./pages/Features";
import { useAuth } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import MyTasks from "./pages/MyTasks";
import "react-loading-skeleton/dist/skeleton.css";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

const PublicOnlyRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

const HomeRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Home />;
};

const AppShellSkeleton = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Skeleton width={120} height={32} />
          <div className="hidden md:flex items-center gap-4">
            <Skeleton width={90} height={20} />
            <Skeleton width={110} height={36} borderRadius={8} />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton width={320} height={36} />
        <Skeleton count={3} height={18} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <Skeleton height={180} borderRadius={12} />
          <Skeleton height={180} borderRadius={12} />
          <Skeleton height={180} borderRadius={12} />
        </div>
      </main>

      <div className="border-t border-gray-100 px-4 sm:px-6 lg:px-8 py-6 mt-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Skeleton width={180} height={16} />
          <Skeleton width={220} height={16} />
        </div>
      </div>
    </div>
  );
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <>
        <AppShellSkeleton />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <BrowserRouter>
        <ScrollToTop />
        <Navbar />
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Project />} />
            <Route path="/projects/:projectId" element={<ProjectDetails />} />
            <Route path="/my-tasks" element={<MyTasks />} />
          </Route>
          <Route path="/features" element={<Features />} />
        </Routes>
        <Footer />
      </BrowserRouter>
      <Toaster />
    </>
  );
}

export default App;
