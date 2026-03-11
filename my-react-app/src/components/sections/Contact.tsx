import type { FormEvent } from 'react';
import { Send } from 'lucide-react';

export default function Contact() {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <section id="contact" className="py-14 sm:py-20 lg:py-24 bg-amber-50/40">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-0 overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xl">
          {/* Map Area */}
          <div className="h-[240px] sm:h-[350px] md:h-auto md:min-h-[500px] w-full bg-gray-100">
            <img
              alt="Map"
              className="w-full h-full object-cover"
            src="/images/kmap.png"
            />
          </div>

          {/* Form Area */}
          <div className="p-6 sm:p-8 lg:p-12 bg-white flex flex-col justify-center">
            <p className="text-farmGreen font-handwritten text-base sm:text-lg mb-1 sm:mb-2">Contact Us</p>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 sm:mb-8 text-gray-900">Write a Message</h2>
            <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  className="p-3 sm:p-4 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-farmGreen text-sm transition-shadow"
                  placeholder="Name"
                  type="text"
                />
                <input
                  className="p-3 sm:p-4 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-farmGreen text-sm transition-shadow"
                  placeholder="Email Address"
                  type="email"
                />
              </div>
              <textarea
                className="w-full p-3 sm:p-4 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-farmGreen text-sm resize-none transition-shadow"
                placeholder="Write a Message"
                rows={4}
              />
              <button
                className="bg-farmGreen text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg font-bold hover:bg-green-600 hover:shadow-lg hover:shadow-green-200 transition-all w-fit flex items-center gap-2 text-sm active:scale-[0.98]"
                type="submit"
              >
                Send a Message
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
