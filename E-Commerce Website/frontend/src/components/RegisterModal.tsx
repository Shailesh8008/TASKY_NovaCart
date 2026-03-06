import type { FormEvent } from "react";
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
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create account">
      <p className="mb-4 text-sm text-slate-600">
        Register to track orders, save favorites, and get faster checkout.
      </p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="register-name"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Full name
          </label>
          <input
            id="register-name"
            type="text"
            placeholder="Your full name"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
            required
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
            type="email"
            placeholder="you@example.com"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
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
            type="password"
            placeholder="Create a password"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
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
            type="password"
            placeholder="Re-enter your password"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 cursor-pointer"
        >
          Create account
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
