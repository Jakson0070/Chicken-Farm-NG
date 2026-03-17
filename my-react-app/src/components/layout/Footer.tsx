import { Facebook, Twitter, Instagram, Send, MapPin, Phone, Mail, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const socialLinks: { icon: LucideIcon; href: string; label: string }[] = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Facebook, href: 'https://www.facebook.com/share/174k9Hr6nq/?mibextid=wwXIfr', label: 'Facebook' },
  { icon: Send, href: '#', label: 'Pinterest' },
  { icon: Instagram, href: '#', label: 'Instagram' },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 sm:gap-12 lg:gap-16">
          {/* Brand */}
          <div>
            <a href="#" className="flex items-center gap-2 mb-8 group">
              <img
                src="/images/5%20Full%20Logo%20-%20Black%20&%20White%20Background.png"
                alt="Chicken Farm"
                className="h-10 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <span className="text-white font-bold text-lg">Chicken Farm</span>
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm hidden">
                CF
              </div>
            </a>
            <p className="text-sm leading-relaxed mb-8">
              ChickenFarm is a digital agricultural marketplace connecting farmers, businesses, and consumers across Nigeria.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    className="w-9 h-9 rounded-full border border-gray-700 flex items-center justify-center hover:bg-green-600 hover:border-green-600 transition-all hover:scale-110"
                    href={s.href}
                    aria-label={s.label}
                  >
                    <Icon size={15} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-white font-bold mb-8 inline-block border-b-2 border-green-500">Explore</h4>
            <ul className="space-y-4 text-sm">
              {[
                { label: 'About', href: '#about' },
                { label: 'Services', href: '#' },
                { label: 'Our Projects', href: '#products' },
                { label: 'Meet the Farmers', href: '#' },
                { label: 'Contact', href: '#contact' },
              ].map((item) => (
                <li key={item.label}>
                  <a className="hover:text-green-600 transition-colors flex items-center gap-2 group" href={item.href}>
                    <ArrowRight size={12} className="text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-8 inline-block border-b-2 border-green-500">Contact</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span> 2040 Faruk Labaran Street, Kano, Nigeria</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-green-600 flex-shrink-0" />
                <span>+234 9067740405</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-green-600 flex-shrink-0" />
                <span>support@chickenfarm.com.ng</span>
              </li>
              <li className="pt-4">
                <form
                  className="flex"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <input
                    className="bg-gray-800 border-none rounded-l-lg p-3 text-xs w-full focus:ring-1 focus:ring-green-600 placeholder-gray-500"
                    placeholder="Email Address"
                    type="email"
                  />
                  <button className="bg-green-600 text-white px-4 rounded-r-lg font-bold hover:bg-green-600 transition-colors" type="submit">
                    <ArrowRight size={16} />
                  </button>
                </form>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 sm:mt-16 lg:mt-20 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between text-xs gap-3">
          <p>© 2026 Chickenfarm Team. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a className="hover:text-white transition-colors" href="#">Terms of Use</a>
            <a className="hover:text-white transition-colors" href="#">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
