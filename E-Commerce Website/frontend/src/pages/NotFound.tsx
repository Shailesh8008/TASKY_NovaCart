import { Link } from "react-router-dom";

type NotFoundProps = {
  compact?: boolean;
};

export default function NotFound({ compact = false }: NotFoundProps) {
  return (
    <main
      className={
        compact
          ? "grid min-h-[60vh] place-items-center rounded-3xl px-6 pt-16 sm:pt-20"
          : "grid min-h-full place-items-center px-6 pt-24 pb-16 sm:pt-32 lg:px-8"
      }
    >
      <div className="text-center">
        <p className="text-base font-semibold text-indigo-400">404</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance sm:text-7xl">
          Page not found
        </h1>
        <p className="mt-6 text-lg font-medium text-pretty text-gray-400 sm:text-xl/8">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            to="/"
            className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-400"
          >
            Go back home
          </Link>
        </div>
      </div>
    </main>
  );
}
