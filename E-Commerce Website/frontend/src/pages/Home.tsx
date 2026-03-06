import FeaturedProductGrid from "../components/FeaturedProductGrid";

const categories = [
  { name: "Streetwear", items: "120+ items", color: "bg-amber-100" },
  { name: "Tech Essentials", items: "80+ items", color: "bg-orange-100" },
  { name: "Home Living", items: "95+ items", color: "bg-rose-100" },
  { name: "Fitness", items: "70+ items", color: "bg-red-100" },
];

const benefits = [
  {
    title: "Fast Delivery",
    desc: "Get your orders in 24-48 hours with reliable shipping partners.",
  },
  {
    title: "Secure Payments",
    desc: "Multiple trusted payment options with end-to-end encryption.",
  },
  {
    title: "Easy Returns",
    desc: "Hassle-free returns and exchanges within 14 days of delivery.",
  },
];

const testimonials = [
  {
    name: "Aarav S.",
    quote: "Clean shopping experience and lightning-fast checkout.",
  },
  {
    name: "Mia R.",
    quote: "The quality is consistently great across every order.",
  },
  {
    name: "Daniel K.",
    quote: "Finally an online store that feels premium and simple to use.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400 px-6 py-16 text-white sm:px-10">
        <div className="absolute right-[-40px] top-[-20px] h-56 w-56 rounded-full bg-amber-200/25 blur-3xl" />
        <div className="absolute bottom-[-30px] left-[-20px] h-52 w-52 rounded-full bg-rose-200/25 blur-3xl" />
        <div className="relative max-w-2xl space-y-5">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-100">
            New Season Collection
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Elevate your daily style with modern essentials
          </h1>
          <p className="text-base text-slate-200 sm:text-lg">
            Explore curated products across fashion, tech, and home. Built for
            people who want quality, speed, and seamless shopping.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button className="rounded-full bg-white px-6 py-3 text-sm font-semibold active:scale-95 transition-all text-slate-900 hover:bg-slate-100 cursor-pointer">
              Shop now
            </button>
            <button className="rounded-full border border-white/50 px-6 py-3 text-sm font-semibold text-white hover:border-white cursor-pointer hover:bg-white hover:text-orange-600 active:scale-95 transition-all">
              Explore deals
            </button>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Shop by category
          </h2>
          <a href="#" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
            View all
          </a>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <article
              key={category.name}
              className={`rounded-2xl p-6 ${category.color} transition hover:-translate-y-1`}
            >
              <h3 className="text-lg font-semibold text-slate-900">{category.name}</h3>
              <p className="mt-2 text-sm text-slate-700">{category.items}</p>
            </article>
          ))}
        </div>
      </section>

      <FeaturedProductGrid />

      <section className="mt-16 grid gap-6 lg:grid-cols-3">
        {benefits.map((benefit) => (
          <article key={benefit.title} className="rounded-2xl bg-amber-50 p-6">
            <h3 className="text-lg font-semibold text-slate-900">{benefit.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{benefit.desc}</p>
          </article>
        ))}
      </section>

      <section className="mt-16 rounded-3xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400 px-6 py-12 text-white sm:px-10">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-100">
            Limited Time
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Up to 40% off selected products
          </h2>
          <p className="mt-3 text-amber-50">
            Refresh your setup with handpicked drops and exclusive bundles.
            Offer valid through this week.
          </p>
          <button className="mt-6 rounded-full bg-white px-6 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-50 cursor-pointer active:scale-95 transition-all">
            Grab deals
          </button>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          What customers say
        </h2>
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article key={testimonial.name} className="rounded-2xl border border-slate-200 p-6">
              <p className="text-slate-700">"{testimonial.quote}"</p>
              <p className="mt-4 text-sm font-semibold text-slate-900">{testimonial.name}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16 rounded-3xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400 px-6 py-12 text-center text-white sm:px-10">
        <h2 className="text-3xl font-bold tracking-tight">Stay in the loop</h2>
        <p className="mx-auto mt-3 max-w-2xl text-amber-50">
          Be the first to know about launches, flash sales, and member-only offers.
        </p>
        <div className="mx-auto mt-6 flex max-w-xl flex-col gap-3 sm:flex-row">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full rounded-full border border-white/60 bg-white/15 px-5 py-3 text-white placeholder:text-amber-100 focus:border-white focus:outline-none"
          />
          <button className="rounded-full bg-white px-6 py-3 font-semibold text-rose-700 hover:bg-rose-50 cursor-pointer active:scale-95 transition-all">
            Subscribe
          </button>
        </div>
      </section>
    </div>
  );
}
