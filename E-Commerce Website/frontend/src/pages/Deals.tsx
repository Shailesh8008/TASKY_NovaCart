const deals = [
  {
    title: "Weekend Flash Sale",
    discount: "Up to 50% OFF",
    details: "Limited-time markdowns on fashion, accessories, and daily essentials.",
    badge: "Ends in 12h",
  },
  {
    title: "Tech Bundle Savings",
    discount: "Save 30%",
    details: "Buy 2 or more gadgets and unlock instant bundle pricing at checkout.",
    badge: "Bundle Deal",
  },
  {
    title: "Home Refresh Offer",
    discount: "Flat 25% OFF",
    details: "Exclusive prices on decor, storage, and kitchen upgrades.",
    badge: "Today Only",
  },
  {
    title: "Fitness Starter Packs",
    discount: "From $29",
    details: "Grab curated kits for home workouts, hydration, and recovery.",
    badge: "Best Value",
  },
  {
    title: "Free Shipping Boost",
    discount: "On orders $49+",
    details: "No shipping fee on eligible products across all categories.",
    badge: "Auto Applied",
  },
  {
    title: "New User Offer",
    discount: "Extra 10% OFF",
    details: "Create your account and apply the welcome code during checkout.",
    badge: "Welcome",
  },
];

export default function Deals() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400 px-6 py-14 text-white sm:px-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-100">
          Deals Hub
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          Limited-time offers worth checking out
        </h1>
        <p className="mt-4 max-w-3xl text-amber-50">
          Browse active promotions, flash discounts, and bundle pricing curated
          to help you save more on every order.
        </p>
      </section>

      <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {deals.map((deal) => (
          <article
            key={deal.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
              {deal.badge}
            </p>
            <h2 className="mt-4 text-xl font-bold text-slate-900">{deal.title}</h2>
            <p className="mt-2 text-lg font-semibold text-rose-600">{deal.discount}</p>
            <p className="mt-3 text-sm text-slate-600">{deal.details}</p>
            <button className="mt-5 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
              Grab deal
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
