import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, 
  MapPin, 
  Calendar, 
  Users, 
  Star, 
  Wifi, 
  Waves, 
  Shield, 
  Heart, 
  Maximize, 
  Coffee,
  Menu,
  X,
  ArrowRight,
  MessageCircle,
  Navigation,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Images
} from 'lucide-react';

// --- Components ---

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Amenities', href: '#amenities' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Reviews', href: '#reviews' },
    { name: 'Location', href: '#location' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'glass-nav py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <a href="#" className="flex flex-col">
          <span className={`text-2xl font-serif font-bold tracking-tighter ${isScrolled ? 'text-luxury-dark' : 'text-white'}`}>UNIQUE</span>
          <span className={`text-[10px] tracking-[0.4em] uppercase -mt-1 ${isScrolled ? 'text-luxury-gold' : 'text-white/80'}`}>Farmhouse</span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className={`text-sm font-medium tracking-wide hover:text-luxury-gold transition-colors ${isScrolled ? 'text-luxury-dark' : 'text-white'}`}
            >
              {link.name}
            </a>
          ))}
          <a 
            href="https://wa.me/917503001001" 
            target="_blank" 
            rel="noopener noreferrer"
            className="luxury-button !py-2 !px-6 text-sm flex items-center gap-2"
          >
            <MessageCircle size={16} />
            Book Now
          </a>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className={isScrolled ? 'text-luxury-dark' : 'text-white'} /> : <Menu className={isScrolled ? 'text-luxury-dark' : 'text-white'} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white border-b border-black/5 p-6 md:hidden flex flex-col space-y-4 shadow-xl"
          >
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className="text-lg font-serif text-luxury-dark hover:text-luxury-gold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <a 
              href="tel:+917503001001"
              className="luxury-button w-full text-center flex justify-center items-center gap-2"
            >
              <Phone size={18} /> Call Now
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720358/1_w50zwj.jpg" 
          alt="Unique Farmhouse Exterior" 
          className="w-full h-full object-cover scale-105 animate-slow-zoom"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white">
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-block text-sm md:text-base uppercase tracking-[0.4em] mb-6 font-medium text-luxury-gold"
        >
          Welcome to Noida's Finest Retreat
        </motion.span>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-5xl md:text-7xl lg:text-8xl font-serif mb-8 leading-[1.1]"
        >
          Experience Luxury & Serenity at <br />
          <span className="italic text-luxury-gold">Unique Farmhouse</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-lg md:text-xl font-light mb-12 max-w-2xl mx-auto text-white/90"
        >
          Premium Private Villa / Farmhouse Stay in Noida. A sanctuary for celebrations, staycations, and unforgettable moments.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a href="#booking" className="luxury-button w-full sm:w-auto">Check Availability</a>
          <a href="tel:+917503001001" className="luxury-button-outline !border-white !text-white hover:!bg-white hover:!text-luxury-dark w-full sm:w-auto flex items-center justify-center gap-2">
            <Phone size={18} /> Call Now
          </a>
          <a href="https://wa.me/917503001001" target="_blank" rel="noopener noreferrer" className="luxury-button !bg-emerald-600 hover:!bg-emerald-700 w-full sm:w-auto flex items-center justify-center gap-2">
            <MessageCircle size={18} /> Book Now
          </a>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/60 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
        <div className="w-[1px] h-12 bg-white/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-luxury-gold animate-scroll-line"></div>
        </div>
      </motion.div>
    </section>
  );
};

const About = () => {
  return (
    <section id="about" className="py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl">
              <img 
                src="https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720359/3_n28gmr.jpg" 
                alt="Luxury Interior" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 w-2/3 aspect-square overflow-hidden rounded-2xl shadow-2xl border-8 border-white hidden md:block">
              <img 
                src="https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720359/2_tebs6z.jpg" 
                alt="Private Pool" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-subtitle text-left">The Experience</span>
            <h2 className="section-title text-left">A Private Sanctuary in the Heart of Noida</h2>
            <div className="space-y-6 text-luxury-dark/70 text-lg leading-relaxed">
              <p>
                Unique Farmhouse offers a refined escape from the urban hustle. Our premium 4BHK private villa is designed for those who seek exclusivity, comfort, and a touch of nature without leaving the city.
              </p>
              <p>
                Whether you're planning an intimate family gathering, a vibrant party, or traditional ceremonies like Haldi, Mehndi, and Sangeet, our spacious interiors and lush outdoors provide the perfect backdrop.
              </p>
              <p className="font-medium text-luxury-dark flex items-center gap-2">
                <Heart className="text-luxury-gold fill-luxury-gold" size={20} />
                Proudly LGBTQ+ Friendly & Inclusive
              </p>
              <div className="pt-6 flex flex-wrap gap-4">
                <div className="px-4 py-2 bg-luxury-cream border border-luxury-gold/20 rounded-full text-sm font-medium">Staycations</div>
                <div className="px-4 py-2 bg-luxury-cream border border-luxury-gold/20 rounded-full text-sm font-medium">Parties</div>
                <div className="px-4 py-2 bg-luxury-cream border border-luxury-gold/20 rounded-full text-sm font-medium">Weddings</div>
                <div className="px-4 py-2 bg-luxury-cream border border-luxury-gold/20 rounded-full text-sm font-medium">Family Gatherings</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Amenities = () => {
  const amenities = [
    { icon: <Maximize size={32} />, title: "Private Villa", desc: "Spacious 4BHK with luxury furnishings" },
    { icon: <Waves size={32} />, title: "Private Pool", desc: "Crystal clear pool for your exclusive use" },
    { icon: <Shield size={32} />, title: "Secure & Private", desc: "24/7 security in a gated location" },
    { icon: <Users size={32} />, title: "Spacious Interiors", desc: "Large living areas for gatherings" },
    { icon: <Heart size={32} />, title: "LGBTQ+ Friendly", desc: "A safe and welcoming space for all" },
    { icon: <Coffee size={32} />, title: "Premium Stay", desc: "High-end amenities and service" },
    { icon: <Wifi size={32} />, title: "High-Speed WiFi", desc: "Stay connected in every corner" },
    { icon: <MapPin size={32} />, title: "Easy Access", desc: "Located conveniently in Sector 135" },
  ];

  return (
    <section id="amenities" className="py-24 px-6 bg-luxury-cream">
      <div className="max-w-7xl mx-auto">
        <span className="section-subtitle">Curated For Comfort</span>
        <h2 className="section-title">World-Class Amenities</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
          {amenities.map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-black/5 hover:shadow-xl transition-all duration-500 group"
            >
              <div className="text-luxury-gold mb-6 group-hover:scale-110 transition-transform duration-500">
                {item.icon}
              </div>
              <h3 className="text-xl font-serif mb-2">{item.title}</h3>
              <p className="text-luxury-dark/60 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Gallery = () => {
  const [view, setView] = useState<'grid' | 'carousel'>('grid');
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720360/7_njohl7.jpg", title: "Grand Entrance", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720360/5_jgyrsh.jpg", title: "Luxury Living Room", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720360/6_vohx9o.jpg", title: "Private Pool Area", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720360/8_ldyqz4.jpg", title: "Master Bedroom", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720360/9_dimmxb.jpg", title: "Dining Experience", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720361/10_cqiiz0.jpg", title: "Modern Kitchen", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720361/4_rghbk0.jpg", title: "Designer Bathroom", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720366/11_by6w6j.jpg", title: "Lush Garden", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720395/12_u3lwmc.jpg", title: "Evening View", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720397/13.1_e9ejt0.jpg", title: "Cozy Lounge", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720429/13_zi1f4k.jpg", title: "Villa Night View", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720563/15_gtwa17.jpg", title: "Poolside Relaxation", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720563/14_q7pecm.jpg", title: "Interior Lounge", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720563/16_hnu7kn.jpg", title: "Bedroom Suite", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720563/17_dadfct.jpg", title: "Garden Path", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720564/18_jscf2j.jpg", title: "Living Space", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720564/19_qbqdte.jpg", title: "Outdoor Seating", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720565/20_hpzg1q.jpg", title: "Modern Decor", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720581/21_xudpvb.jpg", title: "Villa Facade", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720581/22_adlt8z.jpg", title: "Dining Detail", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720582/23_czfkcy.jpg", title: "Pool View", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720582/24.1_mlxwh4.jpg", title: "Bedroom View", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720585/24.2_jwm62w.jpg", title: "Luxury Suite", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720593/24_owlcft.jpg", title: "Villa Exterior", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720596/25_e5rtfq.jpg", title: "Kitchen Detail", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720602/26_bzoxx0.jpg", title: "Bathroom Luxury", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720602/42_ua0rcq.jpg", title: "Garden View", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720609/29_dxwezp.jpg", title: "Entrance Gate", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720609/30_jvwyob.jpg", title: "Lounge Area", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720610/31_wbkk7e.jpg", title: "Pool at Night", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720611/32_pry8jz.jpg", title: "Master Bath", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720620/33_o0las8.jpg", title: "Villa Side View", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720621/34_hvefd6.jpg", title: "Elegant Living", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720622/35_uwijsn.jpg", title: "Pool Deck", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720632/36_azxit4.jpg", title: "Bedroom Comfort", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720632/37_o1jpil.jpg", title: "Dining Area", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720633/38_zv3kex.jpg", title: "Kitchen Modern", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720644/40_ajnhuo.jpg", title: "Villa Entrance", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720645/39_nd6ctt.jpg", title: "Lush Lawn", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720645/41_ahh1ur.jpg", title: "Interior Design", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720645/28_hszcpi.jpg", title: "Poolside View", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720646/27_tffeod.jpg", title: "Villa Night", category: "Exterior" },
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <section id="gallery" className="py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
          <div className="text-center md:text-left">
            <span className="section-subtitle !text-left !mx-0">Visual Journey</span>
            <h2 className="section-title !text-left !mb-0">Peek Inside Our Villa</h2>
          </div>
          
          <div className="flex bg-luxury-cream p-1 rounded-xl border border-black/5">
            <button 
              onClick={() => setView('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'grid' ? 'bg-white text-luxury-dark shadow-sm' : 'text-luxury-dark/40 hover:text-luxury-dark'}`}
            >
              <LayoutGrid size={16} /> Grid
            </button>
            <button 
              onClick={() => setView('carousel')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'carousel' ? 'bg-white text-luxury-dark shadow-sm' : 'text-luxury-dark/40 hover:text-luxury-dark'}`}
            >
              <Images size={16} /> Carousel
            </button>
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          {view === 'grid' ? (
            <motion.div 
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6"
            >
              {images.map((img, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="relative group overflow-hidden rounded-2xl"
                >
                  <img 
                    src={img.src} 
                    alt={img.title} 
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center text-white p-6">
                    <span className="text-[10px] uppercase tracking-[0.3em] mb-2 text-luxury-gold font-bold">{img.category}</span>
                    <h3 className="text-xl font-serif text-center">{img.title}</h3>
                    <div className="mt-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <Maximize size={18} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="carousel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden group shadow-2xl"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentIndex}
                  src={images[currentIndex].src}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute inset-0 w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={`info-${currentIndex}`}
                  transition={{ delay: 0.3 }}
                >
                  <span className="text-xs md:text-sm uppercase tracking-[0.4em] text-luxury-gold font-bold mb-2 block">
                    {images[currentIndex].category}
                  </span>
                  <h3 className="text-3xl md:text-5xl font-serif mb-2">
                    {images[currentIndex].title}
                  </h3>
                </motion.div>
              </div>

              <div className="absolute inset-y-0 left-4 md:left-8 flex items-center">
                <button 
                  onClick={prevSlide}
                  className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-luxury-dark transition-all active:scale-90"
                >
                  <ChevronLeft size={24} />
                </button>
              </div>
              
              <div className="absolute inset-y-0 right-4 md:right-8 flex items-center">
                <button 
                  onClick={nextSlide}
                  className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-luxury-dark transition-all active:scale-90"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              <div className="absolute bottom-8 right-8 flex gap-2">
                {images.map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-1.5 rounded-full transition-all duration-500 ${i === currentIndex ? 'w-8 bg-luxury-gold' : 'w-2 bg-white/30 hover:bg-white/50'}`}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

const Reviews = () => {
  return (
    <section id="reviews" className="py-24 px-6 bg-luxury-dark text-white">
      <div className="max-w-4xl mx-auto text-center">
        <span className="section-subtitle !text-luxury-gold">Guest Testimonials</span>
        <h2 className="section-title !text-white">What Our Guests Say</h2>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 p-12 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 relative"
        >
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={24} className="text-luxury-gold fill-luxury-gold" />
            ))}
          </div>
          
          <p className="text-2xl md:text-3xl font-serif italic mb-8 leading-relaxed">
            "An absolutely stunning property! We hosted a family get-together here and everything was perfect. The pool is clean, the rooms are massive, and the staff is very helpful. Highly recommended for anyone looking for a private luxury stay in Noida."
          </p>
          
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-luxury-gold/20 flex items-center justify-center mb-4">
              <span className="text-xl font-bold text-luxury-gold">A</span>
            </div>
            <h4 className="text-lg font-medium">Anuj Mittal</h4>
            <span className="text-sm text-white/50">Verified Guest</span>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-center items-center gap-8">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-serif font-bold text-luxury-gold">5.0</span>
              <div className="text-left">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-luxury-gold fill-luxury-gold" />)}
                </div>
                <span className="text-xs uppercase tracking-widest text-white/40">Average Rating</span>
              </div>
            </div>
            <div className="h-8 w-[1px] bg-white/10 hidden md:block"></div>
            <div className="text-white/60 text-sm">
              Based on 1 Verified Review
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const BookingSection = () => {
  return (
    <section id="booking" className="py-24 px-6 bg-luxury-cream">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-subtitle text-left">Reserve Your Stay</span>
            <h2 className="section-title text-left">Check Availability</h2>
            <p className="text-luxury-dark/60 mb-8 text-lg">
              Plan your perfect getaway. Fill in your details and we'll get back to you with the best rates and availability for your selected dates.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-luxury-gold shadow-sm shrink-0">
                  <Calendar size={20} />
                </div>
                <div>
                  <h4 className="font-medium">Flexible Booking</h4>
                  <p className="text-sm text-luxury-dark/50">Contact us for custom event packages and long stays.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-luxury-gold shadow-sm shrink-0">
                  <Shield size={20} />
                </div>
                <div>
                  <h4 className="font-medium">Free Cancellation</h4>
                  <p className="text-sm text-luxury-dark/50">Enjoy peace of mind with our flexible cancellation policy.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-luxury-gold shadow-sm shrink-0">
                  <Phone size={20} />
                </div>
                <div>
                  <h4 className="font-medium">Direct Support</h4>
                  <p className="text-sm text-luxury-dark/50">Call us directly at +91 7503001001 for instant confirmation.</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl border border-black/5"
          >
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-semibold text-luxury-dark/40">Check-In</label>
                  <div className="relative">
                    <input type="date" className="w-full px-4 py-3 bg-luxury-cream border border-black/5 rounded-xl focus:outline-none focus:border-luxury-gold transition-colors" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-semibold text-luxury-dark/40">Check-Out</label>
                  <div className="relative">
                    <input type="date" className="w-full px-4 py-3 bg-luxury-cream border border-black/5 rounded-xl focus:outline-none focus:border-luxury-gold transition-colors" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-semibold text-luxury-dark/40">Guests</label>
                <div className="relative">
                  <select className="w-full px-4 py-3 bg-luxury-cream border border-black/5 rounded-xl focus:outline-none focus:border-luxury-gold transition-colors appearance-none">
                    <option>1-5 Guests</option>
                    <option>6-10 Guests</option>
                    <option>11-20 Guests</option>
                    <option>20+ Guests (Event)</option>
                  </select>
                  <Users className="absolute right-4 top-1/2 -translate-y-1/2 text-luxury-dark/20" size={18} />
                </div>
              </div>

              <div className="p-4 bg-luxury-gold/10 rounded-xl border border-luxury-gold/20">
                <p className="text-sm text-luxury-dark/70 text-center italic">
                  "Contact for Best Rates & Exclusive Offers"
                </p>
              </div>

              <button className="luxury-button w-full !py-4 flex items-center justify-center gap-2">
                Check Availability <ArrowRight size={18} />
              </button>
              
              <div className="flex flex-col gap-3">
                <a href="tel:+917503001001" className="luxury-button-outline w-full text-center flex items-center justify-center gap-2">
                  <Phone size={18} /> Call to Book
                </a>
                <a href="https://wa.me/917503001001" target="_blank" rel="noopener noreferrer" className="luxury-button !bg-emerald-600 hover:!bg-emerald-700 w-full flex items-center justify-center gap-2">
                  <MessageCircle size={18} /> WhatsApp Booking
                </a>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const LocationSection = () => {
  return (
    <section id="location" className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-subtitle text-left">Our Location</span>
            <h2 className="section-title text-left">Find Us in Noida</h2>
            
            <div className="space-y-8 mt-8">
              <div className="flex items-start gap-4">
                <MapPin className="text-luxury-gold shrink-0 mt-1" size={24} />
                <div>
                  <h4 className="text-xl font-serif mb-2">Address</h4>
                  <p className="text-luxury-dark/60 leading-relaxed">
                    Plot No 22, Phase 17, Sector 135, <br />
                    Noida, Uttar Pradesh 201305
                  </p>
                  <div className="mt-4 inline-block px-3 py-1 bg-luxury-cream border border-luxury-gold/20 rounded text-xs font-mono text-luxury-gold">
                    Plus Code: F9PV+JW Noida
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="https://www.google.com/maps/dir/?api=1&destination=28.5034,77.4012" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="luxury-button flex items-center justify-center gap-2"
                >
                  <Navigation size={18} /> Get Directions
                </a>
                <a 
                  href="tel:+917503001001" 
                  className="luxury-button-outline flex items-center justify-center gap-2"
                >
                  <Phone size={18} /> Call Property
                </a>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="h-[450px] rounded-3xl overflow-hidden shadow-2xl border border-black/5"
          >
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3506.223456789!2d77.4012!3d28.5034!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDMwJzEyLjIiTiA3N8KwMjQnMDQuMyJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy"
              title="Unique Farmhouse Location"
            ></iframe>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-luxury-dark text-white py-16 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-6">
            <a href="#" className="flex flex-col">
              <span className="text-3xl font-serif font-bold tracking-tighter">UNIQUE</span>
              <span className="text-xs tracking-[0.4em] uppercase -mt-1 text-luxury-gold">Farmhouse</span>
            </a>
            <p className="text-white/50 text-sm leading-relaxed">
              Experience the pinnacle of luxury and privacy in Noida. Our farmhouse is the ideal destination for celebrations and serene retreats.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-luxury-gold transition-colors">
                <Heart size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-luxury-gold transition-colors">
                <Star size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-serif mb-6">Quick Links</h4>
            <ul className="space-y-4 text-white/50 text-sm">
              <li><a href="#about" className="hover:text-luxury-gold transition-colors">About Us</a></li>
              <li><a href="#amenities" className="hover:text-luxury-gold transition-colors">Amenities</a></li>
              <li><a href="#gallery" className="hover:text-luxury-gold transition-colors">Gallery</a></li>
              <li><a href="#reviews" className="hover:text-luxury-gold transition-colors">Reviews</a></li>
              <li><a href="#booking" className="hover:text-luxury-gold transition-colors">Book Now</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-serif mb-6">Contact Info</h4>
            <ul className="space-y-4 text-white/50 text-sm">
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-luxury-gold" />
                <a href="tel:+917503001001" className="hover:text-luxury-gold transition-colors">+91 7503001001</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-luxury-gold mt-1" />
                <span>Plot No 22, Phase 17, Sector 135, Noida, UP 201305</span>
              </li>
              <li className="flex items-center gap-3">
                <Heart size={16} className="text-luxury-gold" />
                <span>LGBTQ+ Friendly Stay</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-serif mb-6">Newsletter</h4>
            <p className="text-white/50 text-sm mb-4">Subscribe for exclusive offers and updates.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="Email Address" className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-luxury-gold w-full" />
              <button className="bg-luxury-gold text-luxury-dark px-4 py-2 rounded-lg text-sm font-bold hover:bg-white transition-colors">Join</button>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-white/30 text-xs uppercase tracking-widest">
          <p>© 2024 Unique Farmhouse. All Rights Reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- Main App ---

export default function App() {
  return (
    <div className="relative">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Amenities />
        <Gallery />
        <Reviews />
        <BookingSection />
        <LocationSection />
      </main>
      <Footer />
      
      {/* Floating Action Buttons for Mobile */}
      <div className="fixed bottom-6 left-6 right-6 z-40 md:hidden flex gap-3">
        <a 
          href="tel:+917503001001" 
          className="flex-1 bg-luxury-dark text-white py-4 rounded-2xl flex items-center justify-center gap-2 shadow-2xl font-bold"
        >
          <Phone size={20} /> Call
        </a>
        <a 
          href="https://wa.me/917503001001" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl flex items-center justify-center gap-2 shadow-2xl font-bold"
        >
          <MessageCircle size={20} /> WhatsApp
        </a>
      </div>
    </div>
  );
}
