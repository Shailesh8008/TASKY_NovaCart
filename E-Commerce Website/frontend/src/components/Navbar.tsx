import { Link } from "react-router-dom";

const navLinks = [
  { label: "Shop", to: "/" },
  { label: "Collections", to: "/collections" },
  { label: "Deals", to: "/" },
  { label: "About", to: "/" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-xl font-bold tracking-tight text-slate-900">
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
          <button className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900">
            Sign in
          </button>
          <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
            Cart (2)
          </button>
        </div>
      </nav>
    </header>
  );
}
