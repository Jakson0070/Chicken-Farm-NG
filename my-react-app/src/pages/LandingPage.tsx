import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Hero from '../components/sections/Hero';
import FeaturesBar from '../components/sections/FeaturesBar';
import Products from '../components/sections/Products';
import AboutUs from '../components/sections/AboutUs';
import StatsBar from '../components/sections/StatsBar';
import WhyChooseUs from '../components/sections/WhyChooseUs';
import BannerCTA from '../components/sections/BannerCTA';
import OrganicCTA from '../components/sections/OrganicCTA';
import HowItWorks from '../components/sections/HowItWorks';
import Testimonials from '../components/sections/Testimonials';
import Contact from '../components/sections/Contact';

export default function LandingPage() {
  return (
    <div className="bg-white text-gray-800">
      <Header />
      <Hero />
      <FeaturesBar />
      <Products />
      <AboutUs />
      <StatsBar />
      <WhyChooseUs />
      <BannerCTA />
      <OrganicCTA />
      <HowItWorks />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
}
