import React, { useEffect, useRef, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import Modal from "./Modal";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Navbar: React.FC = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
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
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/projects"
                      onClick={() => setShowMenu(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Projects
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
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-8">
                  <Link
                    to={"/features"}
                    className="text-gray-600 hover:text-blue-600 px-3 py-2 font-medium"
                  >
                    Features
                  </Link>
                  <Link
                    to={"/login"}
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
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
