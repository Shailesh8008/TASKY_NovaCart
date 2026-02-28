import React, { useState } from "react";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Register: React.FC = () => {
  const naviate = useNavigate();
  const [wait, setWait] = useState(false);
  const { user, loading } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    pass1: "",
    pass2: "",
  });
  const [error, setError] = useState({
    name: false,
    email: false,
    pass: false,
    pass1: false,
    pass2: false,
  });
  const [isPass, setIsPass] = useState(false);
  const [isChecked, setIsChecked] = useState(true);
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
    setError({ ...error, [e.target.id]: false, pass: false });
  };

  const handleForm = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    setWait(true);
    if (!form.name || !form.email || !form.pass1 || !form.pass2) {
      setError({
        ...error,
        name: form.name ? false : true,
        email: form.email ? false : true,
        pass1: form.pass1 ? false : true,
        pass2: form.pass2 ? false : true,
      });
      setWait(false);
      return;
    }

    if (!isValidEmail(form.email)) {
      toast.error("Please enter a valid email");
      setWait(false);
      return;
    }

    if (form.pass1 !== form.pass2) {
      setError({ ...error, pass: true });
      setWait(false);
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/api/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.ok) {
        toast.error(data.message || "Some error occurred");
        setWait(false);
        return;
      }
      setForm({
        name: "",
        email: "",
        pass1: "",
        pass2: "",
      });
      naviate("/login");
      toast.success("Account created successfully. Please login.");
    } catch (error) {
      setWait(false);
      console.log("error: ", error);
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
      title="Create account"
      subtitle="Start your 14-day free trial. No credit card required."
    >
      <form className="space-y-4" onSubmit={handleForm}>
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-semibold text-gray-700 mb-1 w-fit"
          >
            Full Name
            {error.name && <span className="text-red-600 ml-1">*Required</span>}
          </label>
          <div className="relative group">
            <User
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${error.name ? "text-red-500" : "text-gray-400 group-focus-within:text-blue-500"} transition-all`}
            />
            <input
              id="name"
              value={form.name}
              onChange={handleChange}
              type="text"
              placeholder="John Doe"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border ${error.name ? "border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500" : "border-gray-200 focus:ring-blue-500"} focus:border-transparent focus:ring-2 outline-none transition-all`}
            />
          </div>
        </div>

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
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${error.email ? "text-red-500" : "text-gray-400 group-focus-within:text-blue-500"} transition-all`}
            />
            <input
              id="email"
              type="text"
              value={form.email}
              onChange={handleChange}
              placeholder="john.doe@gmail.com"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                error.email
                  ? "border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-200 focus:ring-blue-500"
              } focus:border-transparent focus:ring-2 outline-none transition-all`}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="pass1"
            className="block text-sm font-semibold text-gray-700 mb-1 w-fit"
          >
            Password
            {error.pass1 && (
              <span className="text-red-600 ml-1">*Required</span>
            )}
            {error.pass && (
              <span className="text-red-600 ml-1 font-normal text-xs">
                (Passwords do not match)
              </span>
            )}
          </label>
          <div className="relative group">
            <Lock
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${error.pass1 ? "text-red-500" : "text-gray-400 group-focus-within:text-blue-500"} transition-all`}
            />
            <input
              id="pass1"
              type={isPass ? "text" : "password"}
              value={form.pass1}
              onChange={handleChange}
              placeholder="Create a strong password"
              className={`w-full pl-10 pr-12 py-3 rounded-xl border ${
                error.pass1 || error.pass2
                  ? "border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-200 focus:ring-blue-500"
              } focus:border-transparent focus:ring-2 outline-none transition-all`}
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

        <div>
          <label
            htmlFor="pass2"
            className="block text-sm font-semibold text-gray-700 mb-1 w-fit"
          >
            Confirm Password
            {error.pass2 && (
              <span className="text-red-600 ml-1">*Required</span>
            )}
            {error.pass && (
              <span className="text-red-600 ml-1 font-normal text-xs">
                (Passwords do not match)
              </span>
            )}
          </label>
          <div className="relative group">
            <Lock
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${error.pass2 ? "text-red-500" : "text-gray-400 group-focus-within:text-blue-500"} transition-all`}
            />
            <input
              id="pass2"
              type={isPass ? "text" : "password"}
              value={form.pass2}
              onChange={handleChange}
              placeholder="Confirm your password"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border ${error.pass2 || error.pass ? "border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500" : "border-gray-200 focus:ring-blue-500"} focus:border-transparent focus:ring-2 outline-none transition-all`}
            />
          </div>
        </div>

        <div className="flex items-start gap-2 py-2">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => setIsChecked(!isChecked)}
            className="mt-1 rounded text-blue-600"
            id="terms"
          />
          <label
            htmlFor="terms"
            className="text-xs text-gray-500 leading-tight"
          >
            I agree to the{" "}
            <Link to="#" className="text-blue-600 underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="#" className="text-blue-600 underline">
              Privacy Policy
            </Link>
            .
          </label>
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
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
            "Creating account..."
          ) : (
            <>
              Create Account
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <p className="text-center text-gray-600 text-sm mt-4">
          Already using Tasky?{" "}
          <Link to="/login" className="text-blue-600 font-bold hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Register;
