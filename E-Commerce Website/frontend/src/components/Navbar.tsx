import { useState } from "react";
import { Link } from "react-router-dom";
import CartModal from "./CartModal";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";

const navLinks = [
  { label: "Shop", to: "/" },
  { label: "Collections", to: "/collections" },
  { label: "Deals", to: "/deals" },
  { label: "About", to: "/about" },
];

export default function Navbar() {
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const openSignIn = () => setIsSignInOpen(true);
  const closeSignIn = () => setIsSignInOpen(false);
  const openRegister = () => setIsRegisterOpen(true);
  const closeRegister = () => setIsRegisterOpen(false);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const switchToRegister = () => {
    closeSignIn();
    openRegister();
  };

  const switchToSignIn = () => {
    closeRegister();
    openSignIn();
  };

  const openSignInFromCart = () => {
    closeCart();
    openSignIn();
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    closeSignIn();
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="text-xl font-bold tracking-tight text-slate-900"
          >
            NovaCart
          </Link>

          <ul className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openSignIn}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900 cursor-pointer"
            >
              Login
            </button>
            <button
              type="button"
              onClick={openCart}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 cursor-pointer"
            >
              Cart (2)
            </button>
          </div>
        </nav>
      </header>

      <LoginModal
        isOpen={isSignInOpen}
        onClose={closeSignIn}
        onOpenRegister={switchToRegister}
        onLoginSuccess={handleLoginSuccess}
      />
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={closeRegister}
        onOpenLogin={switchToSignIn}
      />
      <CartModal
        isOpen={isCartOpen}
        onClose={closeCart}
        isLoggedIn={isLoggedIn}
        onLoginClick={openSignInFromCart}
      />
    </>
  );
}
