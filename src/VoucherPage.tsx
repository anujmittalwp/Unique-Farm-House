import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Printer, Share2, ArrowLeft, Download, MapPin, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { format, parse } from 'date-fns';
import html2pdf from 'html2pdf.js';

export const VoucherPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const targetRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'bookings', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBooking({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError('Booking not found');
        }
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!targetRef.current) return;
    
    setIsDownloading(true);
    try {
        const element = targetRef.current;
        const opt = {
          margin: 0,
          filename: `Unique-Farmhouse-Voucher-${booking.id?.slice(0, 8).toUpperCase() || 'Booking'}.pdf`,
          image: { type: 'jpeg' as const, quality: 0.98 },
          html2canvas: { 
            scale: 2, 
            useCORS: true,
            letterRendering: true,
            onclone: (clonedDoc: Document) => {
            console.log("Sanitizing CSS colors for html2canvas compatibility...");
            const canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = 1;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });

            const getHexColor = (colorStr: string) => {
              if (!ctx) return colorStr;
              try {
                ctx.fillStyle = '#123456';
                ctx.fillStyle = colorStr;
                ctx.clearRect(0, 0, 1, 1);
                ctx.fillRect(0, 0, 1, 1);
                const data = ctx.getImageData(0, 0, 1, 1).data;
                if (data[0] === 0x12 && data[1] === 0x34 && data[2] === 0x56 && data[3] === 255) {
                  return colorStr; 
                }
                return `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
              } catch (e) {
                return colorStr;
              }
            };

            const extractAndReplace = (str: string) => {
              if (!str || typeof str !== 'string') return str;
              let res = str;
              const funcs = ['color-mix', 'oklch', 'oklab', 'lch', 'lab', 'color'];
              
              funcs.forEach(func => {
                const searchStr = func + '(';
                let idx = 0;
                while ((idx = res.indexOf(searchStr, idx)) !== -1) {
                  if (idx > 0 && res[idx - 1] === '-') {
                    idx += searchStr.length;
                    continue;
                  }
                  
                  let open = 0;
                  let endIdx = -1;
                  for (let i = idx + searchStr.length; i < res.length; i++) {
                    if (res[i] === '(') open++;
                    else if (res[i] === ')') {
                      if (open === 0) {
                        endIdx = i;
                        break;
                      }
                      open--;
                    }
                  }
                  if (endIdx !== -1) {
                    const match = res.substring(idx, endIdx + 1);
                    const hex = getHexColor(match);
                    res = res.substring(0, idx) + hex + res.substring(endIdx + 1);
                    idx += hex.length;
                  } else {
                    idx += searchStr.length;
                  }
                }
              });
              return res;
            };

            // Process all elements' computed styles
            const elements = clonedDoc.getElementsByTagName('*');
            for (let i = 0; i < elements.length; i++) {
              const el = elements[i] as HTMLElement;
              if (!el.style) continue;
              
              try {
                const styles = clonedDoc.defaultView?.getComputedStyle(el);
                if (!styles) continue;
                
                for (let j = 0; j < styles.length; j++) {
                  const prop = styles[j];
                  const val = styles.getPropertyValue(prop);
                  if (val && typeof val === 'string' && (val.includes('okl') || val.includes('lab(') || val.includes('lch(') || val.includes('color(') || val.includes('color-mix('))) {
                    const sanitized = extractAndReplace(val);
                    if (sanitized !== val) {
                      el.style.setProperty(prop, sanitized, 'important');
                    }
                  }
                }
              } catch (e) {
                // Ignore errors
              }
            }

            // Also attempt to sanitize style tags just in case
            const styleTags = clonedDoc.querySelectorAll('style');
            for (let i = 0; i < styleTags.length; i++) {
              if (styleTags[i].innerHTML) {
                styleTags[i].innerHTML = extractAndReplace(styleTags[i].innerHTML);
              }
            }
          }
        },
        jsPDF: { 
          unit: 'px', 
          format: [element.offsetWidth, element.offsetHeight] as [number, number], 
          orientation: (element.offsetWidth > element.offsetHeight ? 'landscape' : 'portrait') as 'portrait' | 'landscape'
        }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF. You can also use the Share button.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    let baseUrl = window.location.origin;
    // If the app is accessed from the developer URL, convert it to the public preview URL for sharing
    if (baseUrl.includes('ais-dev-')) {
      baseUrl = baseUrl.replace('ais-dev-', 'ais-pre-');
    }
    const url = `${baseUrl}/voucher/${id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Unique Farmhouse Booking Voucher',
          text: `Here is your booking voucher for Unique Farmhouse (ID: ${id?.slice(0, 8)})`,
          url: url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert('Voucher link copied to clipboard! You can now paste and share it.');
      } catch (err) {
        alert('Could not copy link. Please copy the URL from your browser address bar.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-cream flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-luxury-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-luxury-cream flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
          <p className="text-red-500 font-bold mb-4">{error || 'Booking not found'}</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-luxury-dark text-white rounded-xl font-bold uppercase tracking-widest text-xs"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const parseDate = (dateStr: string) => {
    try {
      return parse(dateStr, 'dd/MM/yyyy', new Date());
    } catch {
      return new Date();
    }
  };

  const checkInDate = booking.checkIn ? parseDate(booking.checkIn) : new Date();
  const checkOutDate = booking.checkOut ? parseDate(booking.checkOut) : new Date();
  
  const balance = (booking.totalAmount || 0) - (booking.amountPaid || 0) - (booking.bookingSource === 'partner' ? (booking.advanceByPartner || 0) : 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* Action Buttons - Hidden when printing */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <button 
            onClick={() => window.close()}
            className="flex items-center gap-2 text-sm font-bold text-luxury-dark/60 hover:text-luxury-dark transition-colors"
          >
            <ArrowLeft size={16} /> Close
          </button>
        </div>

        {/* Printable Voucher Area */}
        <div ref={targetRef} id="voucher-content" className="bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none print:rounded-none">
          
          {/* Header */}
          <div className="bg-luxury-dark text-white p-8 sm:p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="text-8xl font-serif">U</span>
            </div>
            <h1 className="text-3xl font-serif font-bold mb-2 relative z-10">Unique Farmhouse</h1>
            <p className="text-luxury-gold uppercase tracking-[0.2em] text-[10px] font-bold relative z-10">Sector 135, Noida, Uttar Pradesh</p>
            <div className="mt-6 inline-block bg-white/10 px-6 py-2 rounded-full border border-white/20 relative z-10">
              <p className="text-sm tracking-widest uppercase font-bold text-white">Confirmation Voucher</p>
            </div>
          </div>

          <div className="p-8 sm:p-10">
            {/* Booking ID & Status */}
            <div className="flex flex-wrap justify-between items-center pb-6 border-b border-black/5 mb-8 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold mb-1">Booking ID</p>
                <p className="font-mono font-bold text-luxury-dark text-lg">{booking.id.toUpperCase().slice(0, 8)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold mb-1">Status</p>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                  booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                  booking.status === 'cancelled' ? 'bg-red-50 text-red-600 border border-red-200' :
                  'bg-orange-50 text-orange-600 border border-orange-200'
                }`}>
                  {booking.status === 'confirmed' && <CheckCircle2 size={12} />}
                  {booking.status || 'Pending'}
                </div>
              </div>
            </div>

            {/* Guest & Dates Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
              
              {/* Guest Info */}
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold mb-1">Primary Guest</p>
                  <p className="font-bold text-luxury-dark text-lg">{booking.name}</p>
                </div>
                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-sm text-luxury-dark/70">
                    <Phone size={14} className="text-luxury-gold" /> {booking.mobile}
                  </p>
                  {booking.email && (
                    <p className="flex items-center gap-2 text-sm text-luxury-dark/70">
                      <Mail size={14} className="text-luxury-gold" /> {booking.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Dates Info */}
              <div className="bg-gray-50 p-5 rounded-xl border border-black/5">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold mb-1">Check-in</p>
                    <p className="font-bold text-luxury-dark">{format(checkInDate, 'dd MMM, yyyy')}</p>
                    <p className="text-xs text-luxury-dark/60 mt-0.5">2:00 PM</p>
                  </div>
                  <div className="w-8 h-px bg-luxury-dark/20"></div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold mb-1">Check-out</p>
                    <p className="font-bold text-luxury-dark">{format(checkOutDate, 'dd MMM, yyyy')}</p>
                    <p className="text-xs text-luxury-dark/60 mt-0.5">11:00 AM</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-black/5 flex justify-between text-sm">
                  <span className="text-luxury-dark/60">Guests (Day/Night)</span>
                  <span className="font-bold text-luxury-dark">
                    {(booking.dayGuestAdults || 0) + (booking.dayGuestChildren?.length || 0)} / {(booking.nightGuestAdults || 0) + (booking.nightGuestChildren?.length || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Addons if any */}
            {booking.addons && booking.addons.length > 0 && (
               <div className="mb-8">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-luxury-dark/40 mb-3">Included Add-ons</h3>
                 <div className="bg-gray-50 rounded-xl p-4 border border-black/5">
                   <div className="space-y-2">
                     {booking.addons.map((addon: any, idx: number) => (
                       <div key={idx} className="flex justify-between items-center text-sm">
                         <span className="text-luxury-dark/70">{addon.name} {addon.quantity && addon.quantity > 1 ? `(x${addon.quantity})` : ''}</span>
                         <span className="font-medium text-luxury-dark">₹{Number(addon.price * (addon.quantity || 1)).toLocaleString()}</span>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
            )}

            {/* Payment Summary */}
            <div className="mb-8">
              <h3 className="text-xs font-bold uppercase tracking-widest text-luxury-dark/40 mb-3">Payment Summary</h3>
              <div className="border border-black/5 rounded-xl overflow-hidden">
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-luxury-dark/60">Booking Amount</span>
                    <span className="font-medium">₹{(booking.bookingAmount || 0).toLocaleString()}</span>
                  </div>
                  {booking.addons && booking.addons.length > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-luxury-dark/60">Add-ons Total</span>
                      <span className="font-medium">₹{booking.addons.reduce((sum: number, a: any) => sum + (Number(a.price) * (a.quantity || 1)), 0).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-luxury-dark/60">Security Deposit <span className="text-[10px] italic">(Refundable)</span></span>
                    <span className="font-medium">₹{(booking.securityDeposit || 0).toLocaleString()}</span>
                  </div>
                  
                  <div className="pt-3 border-t border-black/5 flex justify-between items-center">
                    <span className="font-bold text-luxury-dark">Total Amount</span>
                    <span className="font-bold text-luxury-dark text-lg">₹{(booking.totalAmount || 0).toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 border-t border-black/5 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-emerald-600 font-medium">Amount Paid</span>
                    <span className="text-emerald-600 font-bold">₹{(booking.amountPaid || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-black/5">
                    <span className="text-luxury-dark font-bold">Balance Due</span>
                    <span className={`font-bold ${balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      ₹{Math.max(0, balance).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Address */}
            <div className="border-t border-black/5 pt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40 mb-2">Property Address</h3>
                <p className="text-sm text-luxury-dark/70 flex items-start gap-2">
                  <MapPin size={16} className="text-luxury-gold shrink-0 mt-0.5" />
                  <span>Unique Farmhouse<br/>Sector 135, Noida<br/>Uttar Pradesh</span>
                </p>
              </div>
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40 mb-2">Important Information</h3>
                <ul className="text-[10px] text-luxury-dark/60 space-y-1 list-disc pl-4">
                  <li>Valid government ID required at check-in.</li>
                  <li>Security deposit is collected and refunded post-checkout inspection.</li>
                  <li>Please adhere to the check-in and check-out timings.</li>
                </ul>
              </div>
            </div>

          </div>
          
          <div className="bg-luxury-dark text-white text-center py-4 text-[10px] uppercase tracking-widest opacity-90">
            Thank you for choosing Unique Farmhouse
          </div>
        </div>
        
        {/* Bottom Action Buttons - Hidden when printing */}
        <div className="flex items-center justify-center gap-4 mt-8 print:hidden">
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-luxury-dark/10 rounded-xl text-xs font-bold text-luxury-dark hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Share2 size={16} /> Share Voucher
          </button>
          <button 
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex items-center gap-2 px-6 py-3 bg-luxury-dark text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors shadow-sm disabled:opacity-50"
          >
            <Download size={16} /> {isDownloading ? 'Generating PDF...' : 'Download As PDF'}
          </button>
        </div>

      </div>
    </div>
  );
};
