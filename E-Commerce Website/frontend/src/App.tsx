import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import About from "./pages/About";
import Collections from "./pages/Collections";
import Home from "./pages/Home";
import MyOrders from "./pages/MyOrders";
import Shop from "./pages/Shop";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { fetchCurrentUser } from "./store/authSlice";
import { clearCart, fetchUserCart } from "./store/cartSlice";
import { fetchProducts } from "./store/productsSlice";

function App() {
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector((state) => state.auth.status);
  const user = useAppSelector((state) => state.auth.user);
  const productsStatus = useAppSelector((state) => state.products.status);

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
        <div className="min-h-screen bg-white text-slate-900">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/about" element={<About />} />
              <Route path="/my-orders" element={<MyOrders />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
      <Toaster />
    </>
  );
}

export default App;
