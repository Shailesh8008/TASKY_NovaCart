import { useState, type ChangeEvent, type FormEvent } from "react";
import toast from "react-hot-toast";
import { registerUser } from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import Modal from "./Modal";

type RegisterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
};

export default function RegisterModal({
  isOpen,
  onClose,
  onOpenLogin,
}: RegisterModalProps) {
  const dispatch = useAppDispatch();
  const registerStatus = useAppSelector((state) => state.auth.registerStatus);
  const registerError = useAppSelector((state) => state.auth.registerError);
  const [form, setForm] = useState({
    fname: "",
    lname: "",
    email: "",
    pass1: "",
    pass2: "",
  });
  const [error, setError] = useState({
    fname: false,
    email: false,
    pass1: false,
    pass2: false,
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const field = event.target.name as keyof typeof form;
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    if (field in error) {
      setError((prev) => ({ ...prev, [field]: false }));
    }
  };

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const fname = form.fname.trim();
    const lname = form.lname.trim();
    const email = form.email.trim();
    const pass1 = form.pass1.trim();
    const pass2 = form.pass2.trim();

    if (!fname || !email || !pass1 || !pass2) {
      setError({
        fname: !fname,
        email: !email,
        pass1: !pass1,
        pass2: !pass2,
      });
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email");
      return;
    }

    if (pass1.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (pass1 !== pass2) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const message = await dispatch(
        registerUser({ fname, lname: lname || undefined, email, pass1 }),
      ).unwrap();
      toast.success(message);
      setForm({ fname: "", lname: "", email: "", pass1: "", pass2: "" });
      onClose();
      onOpenLogin();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      toast.error(message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create account">

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="register-fname"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            First name
          </label>
          <input
            id="register-fname"
            name="fname"
            type="text"
            value={form.fname}
            onChange={handleChange}
            placeholder="Your first name"
            className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none ${
              error.fname ? "border-rose-500" : "border-slate-300"
            }`}
            required
          />
        </div>

        <div>
          <label
            htmlFor="register-lname"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Last name (optional)
          </label>
          <input
            id="register-lname"
            name="lname"
            type="text"
            value={form.lname}
            onChange={handleChange}
            placeholder="Your last name"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="register-email"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Email
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none ${
              error.email ? "border-rose-500" : "border-slate-300"
            }`}
            required
          />
        </div>

        <div>
          <label
            htmlFor="register-password"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Password
          </label>
          <input
            id="register-password"
            name="pass1"
            type="password"
            value={form.pass1}
            onChange={handleChange}
            placeholder="Create a password"
            className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none ${
              error.pass1 ? "border-rose-500" : "border-slate-300"
            }`}
            required
          />
        </div>

        <div>
          <label
            htmlFor="register-confirm-password"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Confirm password
          </label>
          <input
            id="register-confirm-password"
            name="pass2"
            type="password"
            value={form.pass2}
            onChange={handleChange}
            placeholder="Re-enter your password"
            className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none ${
              error.pass2 ? "border-rose-500" : "border-slate-300"
            }`}
            required
          />
        </div>

        {registerError && <p className="text-sm text-rose-600">{registerError}</p>}

        <button
          type="submit"
          disabled={registerStatus === "loading"}
          className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 cursor-pointer"
        >
          {registerStatus === "loading" ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onOpenLogin}
          className="font-semibold text-slate-900 underline-offset-2 underline cursor-pointer"
        >
          Sign in
        </button>
      </p>
    </Modal>
  );
}
