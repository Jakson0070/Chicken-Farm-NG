const testimonials = [
  {
    text: '"Chicken Farm NG has completely changed how we source poultry for our restaurant. Fresh delivery every single time, no delays."',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    name: 'Fatima Abdullahi',
    role: 'Restaurant Owner',
    faded: true,
  },
  {
    text: '"I order eggs, chicken and vegetables for my family every week. The quality is always top-notch and they deliver the same day. I recommend Chicken Farm to everyone I know!"',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    name: 'Amina Ibrahim',
    role: 'Regular Customer',
    faded: false,
  },
  {
    text: '"As a bulk buyer, I need consistent supply and fair prices. Chicken Farm delivers on both fronts. Very reliable service."',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
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
          <p className="text-farmGreen font-bold uppercase text-[10px] sm:text-xs tracking-widest mb-2">Testimonials</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">What people say?</h2>
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
                className="bg-white p-6 sm:p-8 lg:p-10 rounded-2xl shadow-2xl flex flex-col items-center text-center relative z-10 border-t-4 border-farmGreen"
              >
                <div className="text-yellow-400 mb-3 sm:mb-4 flex gap-0.5 text-base sm:text-lg">{'★'.repeat(5)}</div>
                <p className="text-gray-600 font-medium leading-relaxed mb-6 sm:mb-8 text-xs sm:text-sm">{t.text}</p>
                <img
                  alt={t.name}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-white shadow-lg mb-2 object-cover"
                  src={t.avatar}
                />
                <h4 className="font-bold text-farmGreen text-base sm:text-lg">{t.name}</h4>
                <p className="text-xs text-gray-400">{t.role}</p>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
