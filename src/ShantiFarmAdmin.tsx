import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { Calendar, Users, Home, Plus, X, Trash2, Edit } from 'lucide-react';
import { CustomInteractiveCalendar } from './App';
import { format } from 'date-fns';

export const ShantiFarmAdmin = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('bookings');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', checkIn: '', checkOut: '', amount: '0', status: 'confirmed' });

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'shanti_farm_bookings'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    try {
      await addDoc(collection(db, 'shanti_farm_bookings'), {
        ...formData,
        checkIn: new Date(formData.checkIn),
        checkOut: new Date(formData.checkOut),
        amount: Number(formData.amount),
        createdAt: serverTimestamp()
      });
      setShowAddModal(false);
      setFormData({ name: '', phone: '', checkIn: '', checkOut: '', amount: '0', status: 'confirmed' });
    } catch (err) {
      console.error(err);
      alert('Error creating booking');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this booking?')) {
      await deleteDoc(doc(db, 'shanti_farm_bookings', id));
    }
  };

  return (
    <div className="min-h-screen bg-luxury-dark/5 flex">
      {/* Sidebar */}
      <div className="w-64 bg-luxury-dark text-white p-6">
        <h2 className="text-xl font-serif mb-8 text-luxury-gold">Shanti Farm Admin</h2>
        <nav className="space-y-4">
          <button onClick={() => setActiveTab('bookings')} className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${activeTab === 'bookings' ? 'bg-white/10 text-luxury-gold' : 'hover:bg-white/5'}`}>
            <Users size={20} /> Bookings
          </button>
          <button onClick={() => setActiveTab('calendar')} className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${activeTab === 'calendar' ? 'bg-white/10 text-luxury-gold' : 'hover:bg-white/5'}`}>
            <Calendar size={20} /> Calendar
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-serif text-luxury-dark capitalize">{activeTab}</h1>
            {activeTab === 'bookings' && (
              <button onClick={() => setShowAddModal(true)} className="luxury-button flex items-center gap-2">
                <Plus size={18} /> New Booking
              </button>
            )}
          </div>

          {activeTab === 'bookings' && (
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-luxury-dark/5 border-b border-black/5 text-[10px] uppercase tracking-widest font-bold text-luxury-dark/40 text-center">
                  <tr>
                    <th className="p-4 text-left">Guest Name</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Check-in</th>
                    <th className="p-4">Check-out</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-b border-black/5 last:border-0 hover:bg-black/[0.02] text-sm text-center">
                      <td className="p-4 text-left font-medium">{b.name}</td>
                      <td className="p-4">{b.phone}</td>
                      <td className="p-4">{b.checkIn?.seconds ? format(new Date(b.checkIn.seconds * 1000), 'MMM d, yyyy') : '-'}</td>
                      <td className="p-4">{b.checkOut?.seconds ? format(new Date(b.checkOut.seconds * 1000), 'MMM d, yyyy') : '-'}</td>
                      <td className="p-4 font-mono font-medium">₹{b.amount}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold ${b.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDelete(b.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr><td colSpan={7} className="p-8 text-center text-luxury-dark/40">No bookings found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
              <CustomInteractiveCalendar
                allBookings={bookings.map(b => ({
                  ...b,
                  checkIn: b.checkIn?.seconds ? new Date(b.checkIn.seconds * 1000) : new Date(),
                  checkOut: b.checkOut?.seconds ? new Date(b.checkOut.seconds * 1000) : new Date()
                }))}
                userRole="admin"
              />
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-luxury-dark/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-8 relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 p-2 hover:bg-black/5 rounded-full"><X size={20} /></button>
            <h2 className="text-2xl font-serif mb-6">New Shanti Farm Booking</h2>
            <form onSubmit={handleAddBooking} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-luxury-dark/40">Guest Name</label>
                <input type="text" required className="w-full border-b border-black/10 focus:border-luxury-gold outline-none py-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-luxury-dark/40">Phone</label>
                <input type="text" required className="w-full border-b border-black/10 focus:border-luxury-gold outline-none py-2" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-luxury-dark/40">Check-In</label>
                  <input type="date" required className="w-full border-b border-black/10 focus:border-luxury-gold outline-none py-2" value={formData.checkIn} onChange={e => setFormData({...formData, checkIn: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-luxury-dark/40">Check-Out</label>
                  <input type="date" required className="w-full border-b border-black/10 focus:border-luxury-gold outline-none py-2" value={formData.checkOut} onChange={e => setFormData({...formData, checkOut: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-luxury-dark/40">Amount</label>
                <input type="number" className="w-full border-b border-black/10 focus:border-luxury-gold outline-none py-2" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-luxury-dark/40">Status</label>
                <select className="w-full border-b border-black/10 focus:border-luxury-gold outline-none py-2" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <button type="submit" className="luxury-button w-full mt-6">Create Booking</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
