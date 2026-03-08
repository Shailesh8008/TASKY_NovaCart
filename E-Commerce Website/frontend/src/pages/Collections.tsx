const collectionCards = [
  {
    title: "Urban Minimal",
    subtitle: "Clean silhouettes for everyday wear",
    items: "48 products",
  },
  {
    title: "Tech Forward",
    subtitle: "Smart accessories and modern gadgets",
    items: "36 products",
  },
  {
    title: "Home Edit",
    subtitle: "Functional pieces for a better living space",
    items: "52 products",
  },
  {
    title: "Active Motion",
    subtitle: "Performance picks for movement and recovery",
    items: "41 products",
  },
  {
    title: "Travel Light",
    subtitle: "Compact essentials for every journey",
    items: "29 products",
  },
  {
    title: "Premium Daily",
    subtitle: "Top-tier materials and timeless design",
    items: "33 products",
  },
];

const trendingTags = [
  "Spring Drop",
  "Sustainable",
  "Under ₹100",
  "Best Sellers",
  "Editor Picks",
];

export default function Collections() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl bg-slate-900 px-6 py-14 text-white sm:px-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-cyan-300">
          Curated Collections
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          Discover looks built around your lifestyle
        </h1>
        <p className="mt-4 max-w-3xl text-slate-300">
          Browse handpicked product groups designed for work, travel, fitness,
          and everyday living. New curation drops weekly.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Trending now</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {trendingTags.map((tag) => (
            <button
              key={tag}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {collectionCards.map((collection) => (
          <article
            key={collection.title}
            className="rounded-2xl border border-slate-200 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="h-36 rounded-xl bg-slate-100" />
            <h3 className="mt-5 text-lg font-semibold text-slate-900">{collection.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{collection.subtitle}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{collection.items}</span>
              <button className="text-sm font-semibold text-slate-900">View Collection</button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
