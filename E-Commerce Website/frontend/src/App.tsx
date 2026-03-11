import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import About from "./pages/About";
import Collections from "./pages/Collections";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import MyOrders from "./pages/MyOrders";
import Shop from "./pages/Shop";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminQueries from "./pages/admin/AdminQueries";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { fetchCurrentUser } from "./store/authSlice";
import { clearCart, fetchUserCart } from "./store/cartSlice";
import { fetchFeaturedProducts, fetchProducts } from "./store/productsSlice";
import ScrollToTop from "./components/ScrollToTop";

function StorefrontLayout() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector((state) => state.auth.status);
  const user = useAppSelector((state) => state.auth.user);
  const productsStatus = useAppSelector((state) => state.products.status);
  const featuredProductsStatus = useAppSelector(
    (state) => state.products.featuredStatus,
  );

  useEffect(() => {
    if (authStatus === "idle") {
      void dispatch(fetchCurrentUser());
    }
  }, [authStatus, dispatch]);

  useEffect(() => {
    if (productsStatus === "idle") {
      void dispatch(fetchProducts());
    }
  }, [dispatch, productsStatus]);

  useEffect(() => {
    if (featuredProductsStatus === "idle") {
      void dispatch(fetchFeaturedProducts());
    }
  }, [dispatch, featuredProductsStatus]);

  useEffect(() => {
    if (authStatus === "loading") {
      return;
    }
    if (user) {
      void dispatch(fetchUserCart());
      return;
    }
    dispatch(clearCart());
  }, [authStatus, dispatch, user]);

  return (
    <>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="queries" element={<AdminQueries />} />
          </Route>

          <Route element={<StorefrontLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/about" element={<About />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/my-orders" element={<MyOrders />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  );
}

export default App;
