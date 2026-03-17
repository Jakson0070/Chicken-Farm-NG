import { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const navLinks = [
  { label: 'Home', href: '#', active: true },
  { label: 'About Us', href: '#about' },
  { label: 'Our Products', href: '#products' },
  { label: 'Contact Us', href: '#contact' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${
        scrolled ? 'shadow-md border-b border-gray-100' : 'border-b border-gray-100'
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-1.5 sm:gap-2 group">
          <img
            src="/images/5%20Full%20Logo%20-%20Black%20&%20White%20Background.png"
            alt="Chicken Farm"
            className="h-8 sm:h-10 object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          /> <span className="font-bold text-gray-800 text-base sm:text-lg">Chicken Farm</span>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-farmGreen rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm hidden">
            CF
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <ul className="hidden lg:flex space-x-8 text-sm font-medium text-gray-600">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                className={`relative py-2 ${
                  link.active
                    ? 'text-farmGreen after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-farmGreen after:rounded-full'
                    : 'hover:text-farmGreen'
                } transition-colors`}
                href={link.href}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Link
            className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-green-600 hover:shadow-lg hover:shadow-green-200 transition-all hidden md:inline-flex items-center gap-2"
            to="/market"
          >
            <ShoppingBag size={16} />
            Shop now
          </Link>
          <Link className="text-gray-600 font-medium text-sm hover:text-farmGreen transition-colors hidden md:inline-block" to="/login">
            Log in
          </Link>

          {/* Mobile Hamburger */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} className="text-gray-800" /> : <Menu size={24} className="text-gray-800" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white border-t border-gray-100 px-4 pb-6">
          <ul className="space-y-1 py-4 text-sm font-medium text-gray-600">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  className={`block py-3 px-4 rounded-lg transition-colors ${
                    link.active ? 'text-farmGreen bg-green-50' : 'hover:text-farmGreen hover:bg-gray-50'
                  }`}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3 pt-3 border-t border-gray-100">
            <Link
              to="/market"
              className="bg-farmGreen text-white px-6 py-3 rounded-lg font-semibold text-sm text-center hover:bg-green-600 transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag size={16} />
              Shop now
            </Link>
            <Link to="/login" className="text-gray-600 font-medium text-sm text-center py-2 hover:text-farmGreen transition-colors">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
