import React, { useEffect, useRef, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import Modal from "./Modal";
import { Menu, X } from "lucide-react";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Navbar: React.FC = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const guestMenuRef = useRef<HTMLDivElement | null>(null);
  const [showGuestMenu, setShowGuestMenu] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isActive = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
      if (guestMenuRef.current && !guestMenuRef.current.contains(event.target as Node)) {
        setShowGuestMenu(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/logout`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!data.ok) {
        toast.error(data.message || "Logout failed");
        return;
      }
      setUser(null);
      setIsOpen(false);
      toast.success("Logged out successfully");
      navigate("/login", { replace: true });
    } catch {
      toast.error("Something went wrong during logout");
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {!user ? (
              <div className="relative md:hidden ml-auto order-3" ref={guestMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowGuestMenu((prev) => !prev)}
                  className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition-colors cursor-pointer"
                  aria-label="Toggle menu"
                >
                  <span className="relative block w-5 h-5">
                    <Menu
                      className={`absolute inset-0 w-5 h-5 transition-all duration-200 ${
                        showGuestMenu
                          ? "opacity-0 rotate-90 scale-75"
                          : "opacity-100 rotate-0 scale-100"
                      }`}
                    />
                    <X
                      className={`absolute inset-0 w-5 h-5 transition-all duration-200 ${
                        showGuestMenu
                          ? "opacity-100 rotate-0 scale-100"
                          : "opacity-0 -rotate-90 scale-75"
                      }`}
                    />
                  </span>
                </button>
                {showGuestMenu ? (
                  <div className="absolute right-0 mt-2 w-44 rounded-lg border border-gray-100 bg-white shadow-lg py-2">
                    <Link
                      to="/register"
                      onClick={() => setShowGuestMenu(false)}
                      className={`block px-4 py-2 text-sm hover:bg-gray-50 ${
                        isActive("/register") ? "text-blue-600 bg-blue-50" : "text-gray-700"
                      }`}
                    >
                      Get Started
                    </Link>
                    <Link
                      to="/login"
                      onClick={() => setShowGuestMenu(false)}
                      className={`block px-4 py-2 text-sm hover:bg-gray-50 ${
                        isActive("/login") ? "text-blue-600 bg-blue-50" : "text-gray-700"
                      }`}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/features"
                      onClick={() => setShowGuestMenu(false)}
                      className={`block px-4 py-2 text-sm hover:bg-gray-50 ${
                        isActive("/features") ? "text-blue-600 bg-blue-50" : "text-gray-700"
                      }`}
                    >
                      Features
                    </Link>
                  </div>
                ) : null}
              </div>
            ) : null}

            <Link to={"/"} className="flex items-center">
              <span className="text-2xl font-extrabold text-blue-600 tracking-tight">
                Tasky
              </span>
            </Link>
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setShowMenu((prev) => !prev)}
                  className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <FaUserCircle className="w-8 h-8" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-44 rounded-lg border border-gray-100 bg-white shadow-lg py-2">
                    <Link
                      to="/dashboard"
                      onClick={() => setShowMenu(false)}
                      className={`block px-4 py-2 text-sm hover:bg-gray-50 ${
                        isActive("/dashboard") ? "text-blue-600 bg-blue-50" : "text-gray-700"
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/projects"
                      onClick={() => setShowMenu(false)}
                      className={`block px-4 py-2 text-sm hover:bg-gray-50 ${
                        isActive("/projects") ? "text-blue-600 bg-blue-50" : "text-gray-700"
                      }`}
                    >
                      Projects
                    </Link>
                    <Link
                      to="/my-tasks"
                      onClick={() => setShowMenu(false)}
                      className={`block px-4 py-2 text-sm hover:bg-gray-50 ${
                        isActive("/my-tasks") ? "text-blue-600 bg-blue-50" : "text-gray-700"
                      }`}
                    >
                      My Tasks
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        setIsOpen(true);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:block ml-auto">
                <div className="flex items-center gap-6">
                  <Link
                    to={"/features"}
                    className={`px-3 py-2 font-medium hover:text-blue-600 ${
                      isActive("/features") ? "text-blue-600" : "text-gray-600"
                    }`}
                  >
                    Features
                  </Link>
                  <Link
                    to={"/login"}
                    className={`px-3 py-2 font-medium hover:text-blue-600 ${
                      isActive("/login") ? "text-blue-600" : "text-gray-600"
                    }`}
                  >
                    Sign In
                  </Link>
                  <Link
                    to={"/register"}
                    className={`px-5 py-2 rounded-lg font-medium transition-colors ${
                      isActive("/register")
                        ? "bg-blue-700 text-white"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        panelClassName="max-w-md border border-gray-100"
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Confirm Logout
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Are you sure you want to logout from your account?
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Navbar;
