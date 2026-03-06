import { Toaster } from "react-hot-toast";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import About from "./pages/About";
import Collections from "./pages/Collections";
import Deals from "./pages/Deals";
import Home from "./pages/Home";

function App() {
  return (
    <>
      <BrowserRouter>
        <div className="min-h-screen bg-white text-slate-900">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
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
