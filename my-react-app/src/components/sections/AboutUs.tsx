export default function AboutUs() {
  return (
    <section id="about" className="py-14 sm:py-20 lg:py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-farmGreen mb-3 sm:mb-4">About us</h2>
          <p className="text-gray-500 max-w-lg mx-auto text-sm px-2">
            ChickenFarm is a digital agricultural marketplace connecting farmers directly with consumers, retailers, and businesses.

Our platform makes it easier to buy and sell farm products by removing middlemen and ensuring fair prices for farmers while providing fresh and affordable food for customers.

We are building a trusted farm-to-market supply system that supports local farmers and improves food accessibility across Nigeria.
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
              Nigeria’s Smart Agriculture Marketplace
            </h2>
            <p className="text-green-600 font-semibold mb-4 text-sm sm:text-base">
              ChickenFarm is a modern agritech platform connecting farmers directly with buyers, homes, restaurants, and businesses across Nigeria.
            </p>
            <p className="text-gray-500 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
              Our mission is to transform agricultural trade by making it easier to buy and sell fresh farm produce through technology. We help farmers reach larger markets while ensuring customers receive fresh, hygienic, and affordable products delivered directly from trusted farms
            </p>
            <ul className="space-y-3 mb-8 sm:mb-10">
              {[
                'Direct connection between farmers and buyers',
                'Fresh farm produce sourced from verified farms',
                'Reliable delivery to homes, restaurants, and businesses',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm font-medium text-gray-700">
                  <span className="w-5 h-5 bg-farmGreen/10 text-farmGreen rounded-full flex items-center justify-center text-xs flex-shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="#products"
              className="inline-block bg-green-600 text-white px-8 py-3.5 rounded-lg font-bold hover:bg-green-600 hover:shadow-lg hover:shadow-green-200 transition-all"
            >
              Discover More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
