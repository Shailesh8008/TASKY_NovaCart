import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import About from "./pages/About";
import Collections from "./pages/Collections";
import Deals from "./pages/Deals";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { fetchProducts } from "./store/productsSlice";

function App() {
  const dispatch = useAppDispatch();
  const productsStatus = useAppSelector((state) => state.products.status);

  useEffect(() => {
    if (productsStatus === "idle") {
      void dispatch(fetchProducts());
    }
  }, [dispatch, productsStatus]);

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
              <Route path="/deals" element={<Deals />} />
              <Route path="/about" element={<About />} />
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
