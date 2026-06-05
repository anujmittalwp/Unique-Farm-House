import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Menu, X, ArrowLeft } from 'lucide-react';
import { CustomInteractiveCalendar } from './App';
import { collection, query, onSnapshot, doc, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { format } from 'date-fns';
// Assuming we might need to reuse some components like BookingSection or Gallery.
// But we want it isolated. We can create a self-contained simple version, or reuse where appropriate.

const STATIC_PROPERTIES = [
  {
    id: 'shanti-farm',
    name: 'Shanti Farm By Unique Farms',
    description: 'A luxurious peaceful escape amidst lush greenery.',
    image: 'https://res.cloudinary.com/dxxd8os4d/image/upload/v1780397232/9_tjgvuz.jpg',
    gallery: [
      { type: 'image', url: 'https://res.cloudinary.com/dxxd8os4d/image/upload/v1780397235/10_jiqo6g.jpg' },
      { type: 'image', url: 'https://res.cloudinary.com/dxxd8os4d/image/upload/v1780397234/8_ywhdpb.jpg' },
      { type: 'video', url: 'https://res.cloudinary.com/dxxd8os4d/video/upload/v1780397234/11_lews2w.mp4' },
      { type: 'image', url: 'https://res.cloudinary.com/dxxd8os4d/image/upload/v1780397234/12_qww8z3.jpg' },
      { type: 'image', url: 'https://res.cloudinary.com/dxxd8os4d/image/upload/v1780397233/5_l0q7ep.jpg' },
      { type: 'image', url: 'https://res.cloudinary.com/dxxd8os4d/image/upload/v1780397233/3_erdlif.jpg' },
      { type: 'image', url: 'https://res.cloudinary.com/dxxd8os4d/image/upload/v1780397233/4_ovgcia.jpg' },
      { type: 'image', url: 'https://res.cloudinary.com/dxxd8os4d/image/upload/v1780397232/9_tjgvuz.jpg' },
      { type: 'image', url: 'https://res.cloudinary.com/dxxd8os4d/image/upload/v1780397232/1_frwefn.jpg' },
      { type: 'image', url: 'https://res.cloudinary.com/dxxd8os4d/image/upload/v1780397232/2_ly38yf.jpg' }
    ]
  }
];

export const OtherPropertiesPage = () => {
  return (
    <div className="pt-32 pb-24 min-h-screen bg-luxury-dark/5">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-serif text-luxury-dark text-center mb-4">Our Other Properties</h1>
        <p className="text-center text-luxury-dark/70 mb-12 max-w-2xl mx-auto">Explore our exclusive partner properties for your next memorable stay.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {STATIC_PROPERTIES.map(prop => (
            <Link key={prop.id} to={`/property/${prop.id}`} className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="relative h-64 overflow-hidden">
                <img src={prop.image} alt={prop.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-serif text-luxury-dark mb-2">{prop.name}</h3>
                <p className="text-luxury-dark/70">{prop.description}</p>
                <div className="mt-6 flex items-center text-luxury-gold font-bold uppercase tracking-widest text-sm group-hover:text-luxury-dark transition-colors">
                  Explore Property <span className="ml-2">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export const PropertySubSite = ({ allBookings = [], pricingSettings = {}, onBookNow }: { allBookings?: any[], pricingSettings?: any, onBookNow?: () => void }) => {
  const { propertyId } = useParams();
  const property = STATIC_PROPERTIES.find(p => p.id === propertyId) || STATIC_PROPERTIES[0];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [shantiBookings, setShantiBookings] = useState<any[]>([]);

  const [actionDate, setActionDate] = useState<Date | null>(null);
  const [isBlockingMode, setIsBlockingMode] = useState(false);
  const [blockRemarks, setBlockRemarks] = useState('');
  const [blockPassword, setBlockPassword] = useState('');

  const handleNormalSelection = (date: Date) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    if (date < today) return;

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(date);
      setCheckOut(null);
    } else {
      if (date.getTime() === checkIn.getTime()) {
        setCheckIn(null);
      } else if (date < checkIn) {
        setCheckIn(date);
        setCheckOut(null);
      } else {
        setCheckOut(date);
      }
    }
  };

  const handleBlockUnblock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (blockPassword !== 'admin123' && blockPassword !== 'shanti123') {
      alert('Incorrect password!');
      return;
    }
    if (!actionDate || !db) return;

    const existingBlock = shantiBookings.find(b => {
      const bDate = b.checkIn?.seconds ? new Date(b.checkIn.seconds * 1000) : b.checkIn;
      return b.status === 'blocked' && bDate && bDate.toDateString() === actionDate.toDateString();
    });

    try {
      if (existingBlock) {
        await deleteDoc(doc(db, 'shanti_farm_bookings', existingBlock.id));
        alert('Date unblocked successfully');
      } else {
        const nextDate = new Date(actionDate);
        nextDate.setDate(nextDate.getDate() + 1);

        await addDoc(collection(db, 'shanti_farm_bookings'), {
          name: 'Blocked',
          phone: '',
          checkIn: actionDate,
          checkOut: nextDate,
          amount: 0,
          status: 'blocked',
          remarks: blockRemarks,
          createdAt: serverTimestamp()
        });
        alert('Date blocked successfully');
      }
      setActionDate(null);
      setIsBlockingMode(false);
      setBlockPassword('');
      setBlockRemarks('');
    } catch (err) {
      console.error(err);
      alert('Error processing request');
    }
  };

  const existingBlock = actionDate ? shantiBookings.find(b => {
    const bDate = b.checkIn?.seconds ? new Date(b.checkIn.seconds * 1000) : b.checkIn;
    return b.status === 'blocked' && bDate && bDate.toDateString() === actionDate.toDateString();
  }) : null;

  useEffect(() => {
    if (!db || property.id !== 'shanti-farm') return;
    const q = query(collection(db, 'shanti_farm_bookings'));
    const unsub = onSnapshot(q, (snapshot) => {
      setShantiBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [property.id]);

  return (
    <div className="min-h-screen bg-white">
      {/* Sub-site Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-luxury-dark/10">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/other-properties" className="text-luxury-dark/50 hover:text-luxury-dark transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl font-serif text-luxury-dark">{property.name}</h1>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-sm font-bold uppercase tracking-widest text-luxury-dark hover:text-luxury-gold transition-colors">Home</a>
            <a href="#gallery" className="text-sm font-bold uppercase tracking-widest text-luxury-dark hover:text-luxury-gold transition-colors">Gallery</a>
            <a href="#calendar" className="text-sm font-bold uppercase tracking-widest text-luxury-dark hover:text-luxury-gold transition-colors">Calendar</a>
            <a href="#contact" className="text-sm font-bold uppercase tracking-widest text-luxury-dark hover:text-luxury-gold transition-colors">Contact Us</a>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-luxury-dark" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-luxury-dark/10 py-4 px-4 space-y-4">
            <a href="#home" onClick={() => setIsMenuOpen(false)} className="block text-sm font-bold uppercase tracking-widest text-luxury-dark">Home</a>
            <a href="#gallery" onClick={() => setIsMenuOpen(false)} className="block text-sm font-bold uppercase tracking-widest text-luxury-dark">Gallery</a>
            <a href="#calendar" onClick={() => setIsMenuOpen(false)} className="block text-sm font-bold uppercase tracking-widest text-luxury-dark">Calendar</a>
            <a href="#contact" onClick={() => setIsMenuOpen(false)} className="block text-sm font-bold uppercase tracking-widest text-luxury-dark">Contact Us</a>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={property.image} alt={property.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 text-center px-4">
          <h2 className="text-5xl md:text-7xl font-serif text-white mb-6 transform hover:scale-105 transition-transform duration-700">{property.name}</h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto font-light tracking-wide">{property.description}</p>
        </div>
      </section>

      {/* Calendar Section */}
      <section id="calendar" className="py-24 bg-luxury-dark/5">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-serif text-luxury-dark text-center mb-12">Availability Calendar</h2>
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 border border-luxury-dark/10">
            <CustomInteractiveCalendar
              checkIn={checkIn}
              checkOut={checkOut}
              setCheckIn={setCheckIn}
              setCheckOut={setCheckOut}
              allBookings={property.id === 'shanti-farm' ? shantiBookings.map(b => ({
                ...b, 
                checkIn: b.checkIn?.seconds ? format(new Date(b.checkIn.seconds * 1000), 'dd/MM/yyyy') : (b.checkIn instanceof Date ? format(b.checkIn, 'dd/MM/yyyy') : b.checkIn), 
                checkOut: b.checkOut?.seconds ? format(new Date(b.checkOut.seconds * 1000), 'dd/MM/yyyy') : (b.checkOut instanceof Date ? format(b.checkOut, 'dd/MM/yyyy') : b.checkOut)
              })) : allBookings.filter(b => b.propertyId === property.id)}
              pricingSettings={pricingSettings}
              userRole="user"
              isShantiFarmAdmin={property.id === 'shanti-farm'}
              onShantiDateClick={property.id === 'shanti-farm' ? (date: Date) => {
                setActionDate(date);
                setIsBlockingMode(false);
                setBlockPassword('');
                setBlockRemarks('');
              } : undefined}
            />
            
            <div className="mt-8 pt-8 border-t border-luxury-dark/10 text-center">
              <p className="text-luxury-dark/60 mb-6">Select your dates above and proceed to confirm your reservation.</p>
              <button 
                onClick={() => {
                  if (property.id === 'shanti-farm') {
                    window.open(`https://wa.me/919313501001?text=Hi, I want to book Shanti Farm from ${checkIn ? checkIn.toLocaleDateString() : '...'} to ${checkOut ? checkOut.toLocaleDateString() : '...'}`);
                  } else {
                    onBookNow && onBookNow();
                  }
                }}
                className="luxury-button w-full sm:w-auto inline-flex items-center justify-center gap-2"
              >
                Book Your Stay
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-serif text-luxury-dark text-center mb-12">Gallery</h2>
          {(property as any).gallery && (property as any).gallery.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {(property as any).gallery.map((item: any, index: number) => (
                <div key={index} className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  {item.type === 'video' ? (
                    <video 
                      src={item.url} 
                      className="w-full h-full object-cover"
                      controls
                      preload="metadata"
                    />
                  ) : (
                    <img src={item.url} alt={`${property.name} gallery ${index + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-luxury-dark/60 py-20 border border-luxury-dark/10 rounded-2xl bg-white">
              <p className="text-xl">Images coming soon for {property.name}</p>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-luxury-dark text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-serif text-center mb-16">Contact Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-4">
              <Phone className="w-8 h-8 text-luxury-gold mx-auto" />
              <p className="font-bold tracking-wider">CALL US</p>
              <p className="text-white/70"><a href="tel:+919313501001" className="hover:text-luxury-gold transition-colors">+91 9313501001</a></p>
            </div>
            <div className="space-y-4">
              <Mail className="w-8 h-8 text-luxury-gold mx-auto" />
              <p className="font-bold tracking-wider">EMAIL US</p>
              <p className="text-white/70">bookings@uniquefarmhouse.com</p>
            </div>
            <div className="space-y-4">
              <MapPin className="w-8 h-8 text-luxury-gold mx-auto" />
              <p className="font-bold tracking-wider">LOCATION</p>
              <p className="text-white/70">Plot No 22, Phase 17, Sector 135, Noida, UP 201305</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-black py-8 text-center text-white/50 text-sm">
        <p>&copy; {new Date().getFullYear()} {property.name}. All rights reserved.</p>
      </footer>

      {/* Date Action Modal */}
      {actionDate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-luxury-dark/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-6 relative">
            <button onClick={() => setActionDate(null)} className="absolute top-4 right-4 p-2 hover:bg-black/5 rounded-full">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-serif mb-2">Calendar Action</h2>
            <p className="text-luxury-dark/60 mb-6 text-sm">
              {actionDate.toDateString()}
            </p>
            
            {!isBlockingMode ? (
              <div className="space-y-4">
                <button 
                  className="w-full bg-luxury-gold hover:bg-luxury-gold/90 text-white py-3 rounded-xl font-bold uppercase tracking-widest text-sm transition-colors"
                  onClick={() => {
                    handleNormalSelection(actionDate);
                    setActionDate(null);
                  }}
                >
                  Select for Booking
                </button>
                
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-black/10"></div>
                  <span className="flex-shrink-0 mx-4 text-luxury-dark/40 text-[10px] font-bold tracking-widest uppercase">Admin Logic</span>
                  <div className="flex-grow border-t border-black/10"></div>
                </div>
                
                <button 
                  className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm tracking-widest hover:bg-red-100 transition-colors uppercase"
                  onClick={() => setIsBlockingMode(true)}
                >
                  Manage Block
                </button>
              </div>
            ) : (
              <form onSubmit={handleBlockUnblock} className="space-y-4">
                {!existingBlock && (
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40">Remarks / Reason</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full border-b border-black/10 focus:border-luxury-gold outline-none py-2 text-sm" 
                      value={blockRemarks} 
                      onChange={e => setBlockRemarks(e.target.value)} 
                      placeholder="e.g. Maintenance"
                    />
                  </div>
                )}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40">Admin Password</label>
                  <input 
                    type="password" 
                    required 
                    className="w-full border-b border-black/10 focus:border-luxury-gold outline-none py-2 text-sm" 
                    value={blockPassword} 
                    onChange={e => setBlockPassword(e.target.value)} 
                    placeholder="Enter password"
                  />
                </div>
                <div className="pt-2">
                  <button type="submit" className="w-full bg-luxury-dark text-white py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-black transition-colors">
                    {existingBlock ? 'Confirm Unblock' : 'Confirm Block'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
