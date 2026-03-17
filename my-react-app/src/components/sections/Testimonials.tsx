const testimonials = [
  {
    text: '“ChickenFarm helped my restaurant get fresh poultry every day. Reliable and affordable.”',
    avatar: 'data:image/svg+xml;charset=UTF-8,%3csvg xmlns%3d%22http%3a//www.w3.org/2000/svg%22 width%3d%2264%22 height%3d%2264%22 viewBox%3d%220 0 64 64%22%3e%3crect width%3d%2264%22 height%3d%2264%22 fill%3d%22%23ffffff%22 stroke%3d%22%23000000%22 stroke-width%3d%221%22/%3e%3ccircle cx%3d%2232%22 cy%3d%2224%22 r%3d%2212%22 fill%3d%22%23000000%22/%3e%3crect x%3d%2220%22 y%3d%2236%22 width%3d%2224%22 height%3d%2220%22 fill%3d%22%23000000%22 rx%3d%222%22/%3e%3c/svg%3e',
    name: 'Hajiya',
    role: 'Restaurant Owner',
    faded: true,
  },
  {
    text: '“As a farmer, I now sell my chickens directly to customers without middlemen.”',
    avatar: 'data:image/svg+xml;charset=UTF-8,%3csvg xmlns%3d%22http%3a//www.w3.org/2000/svg%22 width%3d%2264%22 height%3d%2264%22 viewBox%3d%220 0 64 64%22%3e%3crect width%3d%2264%22 height%3d%2264%22 fill%3d%22%23ffffff%22 stroke%3d%22%23000000%22 stroke-width%3d%221%22/%3e%3ccircle cx%3d%2232%22 cy%3d%2224%22 r%3d%2212%22 fill%3d%22%23000000%22/%3e%3crect x%3d%2220%22 y%3d%2236%22 width%3d%2224%22 height%3d%2220%22 fill%3d%22%23000000%22 rx%3d%222%22/%3e%3c/svg%3e',
    name: 'Kabiru',
    role: 'Poultry Farmer',
    faded: false,
  },
  {
    text: '"As a bulk buyer, I need consistent supply and fair prices. Chicken Farm delivers on both fronts. Very reliable service."',
    avatar: 'data:image/svg+xml;charset=UTF-8,%3csvg xmlns%3d%22http%3a//www.w3.org/2000/svg%22 width%3d%2264%22 height%3d%2264%22 viewBox%3d%220 0 64 64%22%3e%3crect width%3d%2264%22 height%3d%2264%22 fill%3d%22%23ffffff%22 stroke%3d%22%23000000%22 stroke-width%3d%221%22/%3e%3ccircle cx%3d%2232%22 cy%3d%2224%22 r%3d%2212%22 fill%3d%22%23000000%22/%3e%3crect x%3d%2220%22 y%3d%2236%22 width%3d%2224%22 height%3d%2220%22 fill%3d%22%23000000%22 rx%3d%222%22/%3e%3c/svg%3e',
    name: 'Musa Bello',
    role: 'Wholesale Buyer',
    faded: true,
  },
];

export default function Testimonials() {
  return (
    <section className="py-14 sm:py-20 lg:py-24 bg-green-50/30">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <p className="text-green-600 font-bold uppercase text-[10px] sm:text-xs tracking-widest mb-2">Testimonials</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">What Our Customers Say</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-center">
          {testimonials.map((t) =>
            t.faded ? (
              <div
                key={t.name}
                className="bg-white p-6 sm:p-8 lg:p-10 rounded-2xl card-shadow flex flex-col items-center text-center hover:shadow-lg transition-shadow duration-300"
              >
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-6 sm:mb-8 italic">{t.text}</p>
                <img alt={t.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mb-2 object-cover" src={t.avatar} />
                <h4 className="font-bold text-gray-700 text-sm sm:text-base">{t.name}</h4>
                <p className="text-[10px] sm:text-xs text-gray-400">{t.role}</p>
              </div>
            ) : (
              <div
                key={t.name}
                className="bg-white p-6 sm:p-8 lg:p-10 rounded-2xl shadow-2xl flex flex-col items-center text-center relative z-10 border-t-4 border-green-600"
              >
                <div className="text-yellow-400 mb-3 sm:mb-4 flex gap-0.5 text-base sm:text-lg">{'★'.repeat(5)}</div>
                <p className="text-gray-600 font-medium leading-relaxed mb-6 sm:mb-8 text-xs sm:text-sm">{t.text}</p>
                <img
                  alt={t.name}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-white shadow-lg mb-2 object-cover"
                  src={t.avatar}
                />
                <h4 className="font-bold text-green-600 text-base sm:text-lg">{t.name}</h4>
                <p className="text-xs text-gray-400">{t.role}</p>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
