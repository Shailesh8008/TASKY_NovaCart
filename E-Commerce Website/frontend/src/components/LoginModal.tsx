import type { FormEvent } from "react";
import Modal from "./Modal";

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
  onLoginSuccess?: () => void;
};

export default function LoginModal({
  isOpen,
  onClose,
  onOpenRegister,
  onLoginSuccess,
}: LoginModalProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onLoginSuccess?.();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sign in">
      <p className="mb-4 text-sm text-slate-600">
        Access your orders, saved products, and personalized deals.
      </p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="login-email"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Email
          </label>
          <input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
            required
          />
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Password
          </label>
          <input
            id="login-password"
            type="password"
            placeholder="Enter your password"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 cursor-pointer"
        >
          Sign in
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600">
        New here?{" "}
        <button
          type="button"
          onClick={onOpenRegister}
          className="font-semibold text-slate-900 underline-offset-2 underline cursor-pointer"
        >
          Create an account
        </button>
      </p>
    </Modal>
  );
}
