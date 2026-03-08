import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  FiGrid,
  FiHome,
  FiInfo,
  FiLogIn,
  FiLogOut,
  FiPackage,
  FiShoppingBag,
  FiShoppingCart,
  FiUser,
} from "react-icons/fi";
import { logoutUser } from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import CartModal from "./CartModal";
import LoginModal from "./LoginModal";
import Modal from "./Modal";
import RegisterModal from "./RegisterModal";

const navLinks = [
  { label: "Home", to: "/", icon: FiHome },
  { label: "Shop", to: "/shop", icon: FiShoppingBag },
  { label: "Collections", to: "/collections", icon: FiGrid },
  { label: "About", to: "/about", icon: FiInfo },
];

export default function Navbar() {
  const dispatch = useAppDispatch();
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const user = useAppSelector((state) => state.auth.user);
  const cartCount = useAppSelector((state) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const menuRef = useRef<HTMLDivElement | null>(null);

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

  const handleLoginSuccess = () => closeSignIn();
  const toggleUserMenu = () => setIsUserMenuOpen((prev) => !prev);
  const closeUserMenu = () => setIsUserMenuOpen(false);
  const openLogoutConfirm = () => {
    closeUserMenu();
    setIsLogoutConfirmOpen(true);
  };
  const closeLogoutConfirm = () => setIsLogoutConfirmOpen(false);
  const placeholderAction = (label: string) => {
    closeUserMenu();
    toast(`${label} will be added soon.`);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const message = await dispatch(logoutUser()).unwrap();
      toast.success(message);
      closeLogoutConfirm();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Logout failed";
      toast.error(message);
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    if (!isUserMenuOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeUserMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 md:grid md:grid-cols-[1fr_auto_1fr] md:justify-normal">
          <Link
            to="/"
            className="justify-self-start text-xl font-bold tracking-tight text-slate-900"
          >
            NovaCart
          </Link>

          <ul className="hidden items-center gap-8 md:flex md:justify-self-center">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="justify-self-end flex items-center gap-3">
            <button
              type="button"
              onClick={openCart}
              className="inline-flex min-w-20 items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 cursor-pointer"
            >
              <FiShoppingCart className="h-4 w-4" />
              Cart {cartCount != 0 ? `(${cartCount})` : ""}
            </button>
            {user ? (
              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  onClick={toggleUserMenu}
                  className="flex items-center gap-2 rounded-full border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900 cursor-pointer"
                >
                  <FiUser className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.name}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                    <button
                      type="button"
                      onClick={() => placeholderAction("Dashboard")}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 cursor-pointer"
                    >
                      <FiGrid className="h-4 w-4" />
                      Dashboard
                    </button>
                    <Link
                      to="/my-orders"
                      onClick={closeUserMenu}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                    >
                      <FiPackage className="h-4 w-4" />
                      My Orders
                    </Link>
                    <button
                      type="button"
                      onClick={openLogoutConfirm}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50 cursor-pointer"
                    >
                      <FiLogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={openSignIn}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900 cursor-pointer"
              >
                <FiLogIn className="h-4 w-4" />
                Login
              </button>
            )}
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
        isLoggedIn={Boolean(user)}
        cartCount={cartCount}
        onLoginClick={openSignInFromCart}
      />

      <Modal
        isOpen={isLogoutConfirmOpen}
        onClose={closeLogoutConfirm}
        title="Confirm logout"
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to logout from your account?
        </p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={closeLogoutConfirm}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={handleLogout}
            className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </Modal>
    </>
  );
}
