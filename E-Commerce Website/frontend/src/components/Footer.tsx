const footerColumns = [
  {
    title: "Shop",
    links: ["New Arrivals", "Best Sellers", "Accessories", "Gift Cards"],
  },
  {
    title: "Support",
    links: ["Help Center", "Shipping", "Returns", "Track Order"],
  },
  {
    title: "Company",
    links: ["About Us", "Careers", "Sustainability", "Contact"],
  },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="space-y-3">
          <h3 className="text-xl font-bold tracking-tight text-slate-900">NovaCart</h3>
          <p className="text-sm text-slate-600">
            Curated products, fast shipping, and a premium shopping experience.
          </p>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title}>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
              {column.title}
            </h4>
            <ul className="mt-4 space-y-2">
              {column.links.map((link) => (
                <li key={link} className="text-sm text-slate-600 hover:text-slate-900">
                  <a href="#">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-200">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} NovaCart. All rights reserved.</p>
          <p>Made for modern online shopping.</p>
        </div>
      </div>
    </footer>
  );
}
