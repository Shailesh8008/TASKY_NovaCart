import type { Product } from "../store/productsSlice";

type ProductTile = {
  id: string;
  name: string;
  price: string;
  tag: string;
  accent: string;
  imageUrl: string | null;
};

const fallbackProducts: ProductTile[] = [
  {
    id: "fallback-1",
    name: "Urban Pulse Sneakers",
    price: "$129",
    tag: "Best Seller",
    accent: "from-amber-200 to-orange-100",
    imageUrl: null,
  },
  {
    id: "fallback-2",
    name: "CloudFit Smart Watch",
    price: "$199",
    tag: "New",
    accent: "from-sky-200 to-cyan-100",
    imageUrl: null,
  },
  {
    id: "fallback-3",
    name: "Minimal Desk Lamp",
    price: "$59",
    tag: "Popular",
    accent: "from-emerald-200 to-teal-100",
    imageUrl: null,
  },
  {
    id: "fallback-4",
    name: "Commuter Sling Bag",
    price: "$79",
    tag: "Limited",
    accent: "from-rose-200 to-pink-100",
    imageUrl: null,
  },
];

const accents = [
  "from-amber-200 to-orange-100",
  "from-sky-200 to-cyan-100",
  "from-emerald-200 to-teal-100",
  "from-rose-200 to-pink-100",
];

const tileSpanClasses = ["lg:col-span-3", "lg:col-span-2", "lg:col-span-1"];

type FeaturedProductGridProps = {
  products: Product[];
  isLoading: boolean;
};

function mapProductTiles(products: Product[]): ProductTile[] {
  return products.slice(0, 4).map((product, index) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    tag: product.tag,
    accent: accents[index % accents.length],
    imageUrl: product.imageUrl,
  }));
}

export default function FeaturedProductGrid({
  products,
  isLoading,
}: FeaturedProductGridProps) {
  const featuredProducts =
    products.length > 0 ? mapProductTiles(products) : fallbackProducts;

  return (
    <section className="mt-16">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Featured picks
        </h2>
        <button className="text-sm font-semibold text-slate-600 hover:text-slate-900 cursor-pointer">
          View all
        </button>
      </div>
      {isLoading && (
        <p className="mb-4 text-sm text-slate-500">Loading products...</p>
      )}

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
            className={`mt-7 h-80 rounded-2xl bg-gradient-to-br ${featuredProducts[0].accent}`}
          >
            {featuredProducts[0].imageUrl && (
              <img
                src={featuredProducts[0].imageUrl}
                alt={featuredProducts[0].name}
                className="h-full w-full rounded-2xl object-contain"
              />
            )}
          </div>
          <h3 className="mt-6 text-xl font-semibold text-slate-900">
            {featuredProducts[0].name}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {featuredProducts[0].price}
          </p>
        </article>

        {featuredProducts.slice(1).map((product, index) => (
          <article
            key={product.id}
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
            <div
              className={`mt-5 h-24 rounded-xl bg-gradient-to-br ${product.accent}`}
            >
              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full rounded-xl object-contain"
                />
              )}
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">
              {product.name}
            </h3>
            <p className="mt-1 text-sm text-slate-600">{product.price}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
