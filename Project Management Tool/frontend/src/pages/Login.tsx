import React, { useState } from "react";
import { Mail, Lock, ArrowRight } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Login: React.FC = () => {
  const [wait, setWait] = useState(false);
  const { user, loading, setUser } = useAuth();
  const navigate = useNavigate();
  const [isPass, setIsPass] = useState(false);
  const [error, setError] = useState({ email: false, pass: false });
  const [form, setForm] = useState({
    email: "",
    pass: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
    setError({
      ...error,
      [e.target.id]: false,
    });
  };

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    setWait(true);
    if (!form.email || !form.pass) {
      setError({
        email: form.email ? false : true,
        pass: form.pass ? false : true,
      });
      setWait(false);
      return;
    }

    if (!isValidEmail(form.email)) {
      toast.error("Please enter a valid email");
      setWait(false);
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.ok) {
        toast.error(data.message);
        setWait(false);
        return;
      }
      setUser(data.user ?? null);
      navigate("/dashboard", { replace: true });
    } catch {
      setWait(false);
      toast.error("Something went wrong");
    }
  };

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to manage your active projects."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-gray-700 mb-1 w-fit"
          >
            Email Address
            {error.email && (
              <span className="text-red-600 ml-1">*Required</span>
            )}
          </label>
          <div className="relative group">
            <Mail
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-all ${error.email ? "text-red-500" : "text-gray-400 group-focus-within:text-blue-500"}`}
            />
            <input
              id="email"
              type="text"
              value={form.email}
              onChange={handleChange}
              placeholder="abc123@gmail.com"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                error.email
                  ? "border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              }  outline-none transition-all`}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label
              htmlFor="pass"
              className="block text-sm font-semibold text-gray-700"
            >
              Password
              {error.pass && (
                <span className="text-red-600 ml-1">*Required</span>
              )}
            </label>
            <Link to="" className="text-sm text-blue-600 hover:underline">
              Forgot?
            </Link>
          </div>
          <div className="relative group">
            <Lock
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${error.pass ? "text-red-500" : "text-gray-400 group-focus-within:text-blue-500"} transition-all`}
            />
            <input
              id="pass"
              type={isPass ? "text" : "password"}
              value={form.pass}
              onChange={handleChange}
              placeholder={isPass ? "strong@pass" : "••••••••••"}
              className={`w-full pl-10 pr-12 py-3 rounded-xl border ${
                error.pass
                  ? "border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              } outline-none transition-all`}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none"
              onClick={() => setIsPass(!isPass)}
            >
              {isPass ? (
                <FaEye className="h-5 w-5" aria-hidden="true" />
              ) : (
                <FaEyeSlash className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={wait}
          className={`w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group ${
            wait ? "opacity-75 cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          {wait ? (
            <svg
              className="animate-spin -ml-1 mr-1 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : null}
          {wait ? (
            "please wait..."
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <p className="text-center text-gray-600 text-sm mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 font-bold hover:underline"
          >
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;
