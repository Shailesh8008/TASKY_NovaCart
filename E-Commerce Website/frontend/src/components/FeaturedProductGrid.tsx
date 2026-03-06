type ProductTile = {
  name: string;
  price: string;
  tag: string;
  accent: string;
};

const featuredProducts: ProductTile[] = [
  {
    name: "Urban Pulse Sneakers",
    price: "$129",
    tag: "Best Seller",
    accent: "from-amber-200 to-orange-100",
  },
  {
    name: "CloudFit Smart Watch",
    price: "$199",
    tag: "New",
    accent: "from-sky-200 to-cyan-100",
  },
  {
    name: "Minimal Desk Lamp",
    price: "$59",
    tag: "Popular",
    accent: "from-emerald-200 to-teal-100",
  },
  {
    name: "Commuter Sling Bag",
    price: "$79",
    tag: "Limited",
    accent: "from-rose-200 to-pink-100",
  },
];

const tileSpanClasses = ["lg:col-span-3", "lg:col-span-2", "lg:col-span-1"];

export default function FeaturedProductGrid() {
  return (
    <section className="mt-16">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Featured picks</h2>
        <button className="text-sm font-semibold text-slate-600 hover:text-slate-900 cursor-pointer">
          View all
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-6 lg:grid-rows-2">
        <article className="rounded-3xl border border-slate-200 p-6 shadow-sm transition-all lg:col-span-3 lg:row-span-2 hover:shadow-lg hover:scale-[101%] active:scale-100">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {featuredProducts[0].tag}
            </span>
            <button className="text-sm font-semibold text-slate-600 hover:text-slate-900 cursor-pointer">
              + Cart
            </button>
          </div>
          <div
            className={`mt-7 h-56 rounded-2xl bg-gradient-to-br ${featuredProducts[0].accent}`}
          />
          <h3 className="mt-6 text-xl font-semibold text-slate-900">{featuredProducts[0].name}</h3>
          <p className="mt-1 text-sm text-slate-600">{featuredProducts[0].price}</p>
        </article>

        {featuredProducts.slice(1).map((product, index) => (
          <article
            key={product.name}
            className={`rounded-3xl border border-slate-200 p-5 shadow-sm transition hover:shadow-lg hover:scale-[101%] active:scale-100 ${tileSpanClasses[index]}`}
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {product.tag}
              </span>
              <button className="text-sm font-semibold text-slate-600 hover:text-slate-900 cursor-pointer">
                + Cart
              </button>
            </div>
            <div className={`mt-5 h-24 rounded-xl bg-gradient-to-br ${product.accent}`} />
            <h3 className="mt-4 font-semibold text-slate-900">{product.name}</h3>
            <p className="mt-1 text-sm text-slate-600">{product.price}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
