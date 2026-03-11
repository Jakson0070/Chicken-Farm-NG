export default function AboutUs() {
  return (
    <section id="about" className="py-14 sm:py-20 lg:py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-farmGreen mb-3 sm:mb-4">About us</h2>
          <p className="text-gray-500 max-w-lg mx-auto text-sm px-2">
            Order your fresh farm products, sold in practical quantities for homes and businesses
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center">
          {/* Images with decorative green bar */}
          <div className="relative mx-auto max-w-md md:max-w-none">
            <div className="flex">
              <div className="w-1.5 sm:w-2 bg-farmGreen rounded-l-lg flex-shrink-0" />
              <img
                alt="Farmer"
                className="rounded-r-xl shadow-lg w-full object-cover aspect-[4/4]"
                src="/images/about-01.webp.png"
              />
            </div>
            {/* Overlapping smaller image */}
            <img
              alt="Farm field"
              className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 w-28 sm:w-40 lg:w-52 rounded-xl shadow-xl border-4 border-white object-cover aspect-square hidden sm:block"
              src="/images/about-02.webp.png"
            />
          </div>

          <div>
            <h3 className="text-farmGreen font-handwritten mb-2 text-lg lg:text-xl">Get to Know us</h3>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-5 sm:mb-6 leading-tight text-gray-900">
              The Best Agriculture Market
            </h2>
            <p className="text-farmGreen font-semibold mb-4 text-sm sm:text-base">
              We connect local farms in Kano directly to your kitchen — fresh poultry, eggs, vegetables and more.
            </p>
            <p className="text-gray-500 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
              Chicken Farm NG is a trusted farm-to-door delivery platform built for homes, restaurants, and businesses across Nigeria. We source directly from verified local farms to guarantee freshness, hygiene, and same-day delivery.
            </p>
            <ul className="space-y-3 mb-8 sm:mb-10">
              {[
                'Same-day delivery across Kano and nearby cities',
                'Verified local farms with hygiene-certified produce',
                'Affordable bulk pricing for homes and businesses',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm font-medium text-gray-700">
                  <span className="w-5 h-5 bg-farmGreen/10 text-farmGreen rounded-full flex items-center justify-center text-xs flex-shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="#products"
              className="inline-block bg-farmGreen text-white px-8 py-3.5 rounded-lg font-bold hover:bg-green-600 hover:shadow-lg hover:shadow-green-200 transition-all"
            >
              Discover More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
