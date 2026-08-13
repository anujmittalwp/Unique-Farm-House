import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Users, Package, Plus, Edit2, Trash2, X, Check, AlertTriangle, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const StaffInventoryDashboard = ({ showToast }: { showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [activeTab, setActiveTab] = useState<'staff' | 'inventory'>('staff');
  
  // Data States
  const [staffList, setStaffList] = useState<any[]>([]);
  const [inventoryList, setInventoryList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form States
  const [staffForm, setStaffForm] = useState({ name: '', role: 'Cleaner', phone: '', salary: '', status: 'Active' });
  const [invForm, setInvForm] = useState({ itemName: '', category: 'Grocery', quantity: 0, unit: 'pcs', threshold: 5 });

  const [search, setSearch] = useState('');
  
  useEffect(() => {
    const unsubStaff = onSnapshot(collection(db, 'staff'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
      setStaffList(data);
    }, (error) => {
      console.error("Staff listener error:", error);
    });
    
    const unsubInv = onSnapshot(collection(db, 'inventory'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a: any, b: any) => (a.itemName || '').localeCompare(b.itemName || ''));
      setInventoryList(data);
      setLoading(false);
    }, (error) => {
      console.error("Inventory listener error:", error);
      setLoading(false);
    });
    
    return () => { unsubStaff(); unsubInv(); };
  }, []);

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.role) return showToast("Name and role are required", "error");
    
    try {
      if (editingItem) {
        await updateDoc(doc(db, 'staff', editingItem.id), { ...staffForm });
        showToast("Staff updated successfully", "success");
      } else {
        await addDoc(collection(db, 'staff'), { ...staffForm, joinDate: new Date().toISOString() });
        showToast("Staff added successfully", "success");
      }
      setIsStaffModalOpen(false);
      setEditingItem(null);
      setStaffForm({ name: '', role: 'Cleaner', phone: '', salary: '', status: 'Active' });
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleSaveInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invForm.itemName) return showToast("Item name is required", "error");
    
    try {
      if (editingItem) {
        await updateDoc(doc(db, 'inventory', editingItem.id), { ...invForm });
        showToast("Inventory item updated successfully", "success");
      } else {
        await addDoc(collection(db, 'inventory'), { ...invForm, lastUpdated: new Date().toISOString() });
        showToast("Inventory item added successfully", "success");
      }
      setIsInventoryModalOpen(false);
      setEditingItem(null);
      setInvForm({ itemName: '', category: 'Grocery', quantity: 0, unit: 'pcs', threshold: 5 });
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const deleteRecord = async (collectionName: string, id: string) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await deleteDoc(doc(db, collectionName, id));
      showToast("Record deleted", "info");
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const filteredStaff = staffList.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.role.toLowerCase().includes(search.toLowerCase()));
  const filteredInv = inventoryList.filter(i => i.itemName.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex gap-2 bg-luxury-dark/5 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab('staff')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'staff' ? 'bg-luxury-dark text-white' : 'text-luxury-dark hover:bg-white hover:shadow'}`}
          >
            <div className="flex items-center gap-2"><Users size={16} /> Staff</div>
          </button>
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-luxury-dark text-white' : 'text-luxury-dark hover:bg-white hover:shadow'}`}
          >
            <div className="flex items-center gap-2"><Package size={16} /> Inventory</div>
          </button>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-luxury-dark/40" size={16} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-luxury-dark/5 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-luxury-gold"
            />
          </div>
          <button 
            onClick={() => {
              setEditingItem(null);
              if (activeTab === 'staff') {
                setStaffForm({ name: '', role: 'Cleaner', phone: '', salary: '', status: 'Active' });
                setIsStaffModalOpen(true);
              } else {
                setInvForm({ itemName: '', category: 'Grocery', quantity: 0, unit: 'pcs', threshold: 5 });
                setIsInventoryModalOpen(true);
              }
            }}
            className="px-5 py-2.5 bg-luxury-gold text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-luxury-gold/90 transition-all flex items-center gap-2"
          >
            <Plus size={16} /> Add New
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5">
        {loading ? (
          <div className="flex justify-center py-20 text-luxury-dark/40">Loading data...</div>
        ) : activeTab === 'staff' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] uppercase font-bold tracking-widest text-luxury-dark/40 border-b border-black/5">
                <tr>
                  <th className="px-4 py-4">Name</th>
                  <th className="px-4 py-4">Role</th>
                  <th className="px-4 py-4">Phone</th>
                  <th className="px-4 py-4">Salary</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-black/40">No staff found.</td></tr>
                ) : filteredStaff.map(staff => (
                  <tr key={staff.id} className="border-b border-black/5 last:border-0 hover:bg-black/5 transition-colors">
                    <td className="px-4 py-4 font-medium text-luxury-dark">{staff.name}</td>
                    <td className="px-4 py-4"><span className="px-2 py-1 bg-black/5 rounded text-xs">{staff.role}</span></td>
                    <td className="px-4 py-4 text-black/60">{staff.phone || '-'}</td>
                    <td className="px-4 py-4 text-black/60">₹{staff.salary || '0'}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${staff.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {staff.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setEditingItem(staff); setStaffForm(staff); setIsStaffModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => deleteRecord('staff', staff.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] uppercase font-bold tracking-widest text-luxury-dark/40 border-b border-black/5">
                <tr>
                  <th className="px-4 py-4">Item Name</th>
                  <th className="px-4 py-4">Category</th>
                  <th className="px-4 py-4">Quantity</th>
                  <th className="px-4 py-4">Threshold</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInv.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-black/40">No inventory found.</td></tr>
                ) : filteredInv.map(item => (
                  <tr key={item.id} className="border-b border-black/5 last:border-0 hover:bg-black/5 transition-colors">
                    <td className="px-4 py-4 font-medium text-luxury-dark">{item.itemName}</td>
                    <td className="px-4 py-4"><span className="px-2 py-1 bg-black/5 rounded text-xs">{item.category}</span></td>
                    <td className="px-4 py-4 font-bold text-luxury-dark">{item.quantity} <span className="text-xs font-normal text-black/40">{item.unit}</span></td>
                    <td className="px-4 py-4 text-black/60">{item.threshold}</td>
                    <td className="px-4 py-4">
                      {item.quantity <= item.threshold ? (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-fit">
                          <AlertTriangle size={12} /> Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-fit">
                          <Check size={12} /> In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setEditingItem(item); setInvForm(item); setIsInventoryModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => deleteRecord('inventory', item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Staff Modal */}
      <AnimatePresence>
        {isStaffModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-luxury-dark/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-serif text-luxury-dark">{editingItem ? 'Edit Staff' : 'Add New Staff'}</h3>
                <button onClick={() => setIsStaffModalOpen(false)} className="p-2 hover:bg-black/5 rounded-full"><X size={20} /></button>
              </div>
              <form onSubmit={handleSaveStaff} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-luxury-dark/70 uppercase tracking-wider mb-2">Name</label>
                  <input type="text" value={staffForm.name} onChange={e => setStaffForm({...staffForm, name: e.target.value})} className="w-full p-3 bg-black/5 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-luxury-gold" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-luxury-dark/70 uppercase tracking-wider mb-2">Role</label>
                    <select value={staffForm.role} onChange={e => setStaffForm({...staffForm, role: e.target.value})} className="w-full p-3 bg-black/5 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-luxury-gold">
                      <option value="Manager">Manager</option>
                      <option value="Cleaner">Cleaner</option>
                      <option value="Guard">Guard</option>
                      <option value="Cook">Cook</option>
                      <option value="Gardener">Gardener</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-luxury-dark/70 uppercase tracking-wider mb-2">Status</label>
                    <select value={staffForm.status} onChange={e => setStaffForm({...staffForm, status: e.target.value})} className="w-full p-3 bg-black/5 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-luxury-gold">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-luxury-dark/70 uppercase tracking-wider mb-2">Phone</label>
                    <input type="text" value={staffForm.phone} onChange={e => setStaffForm({...staffForm, phone: e.target.value})} className="w-full p-3 bg-black/5 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-luxury-gold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-luxury-dark/70 uppercase tracking-wider mb-2">Salary (₹)</label>
                    <input type="number" value={staffForm.salary} onChange={e => setStaffForm({...staffForm, salary: e.target.value})} className="w-full p-3 bg-black/5 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-luxury-gold" />
                  </div>
                </div>
                <button type="submit" className="w-full py-3 mt-4 bg-luxury-dark text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black transition-colors">
                  {editingItem ? 'Save Changes' : 'Add Staff'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Inventory Modal */}
      <AnimatePresence>
        {isInventoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-luxury-dark/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-serif text-luxury-dark">{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
                <button onClick={() => setIsInventoryModalOpen(false)} className="p-2 hover:bg-black/5 rounded-full"><X size={20} /></button>
              </div>
              <form onSubmit={handleSaveInventory} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-luxury-dark/70 uppercase tracking-wider mb-2">Item Name</label>
                  <input type="text" value={invForm.itemName} onChange={e => setInvForm({...invForm, itemName: e.target.value})} className="w-full p-3 bg-black/5 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-luxury-gold" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-luxury-dark/70 uppercase tracking-wider mb-2">Category</label>
                  <select value={invForm.category} onChange={e => setInvForm({...invForm, category: e.target.value})} className="w-full p-3 bg-black/5 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-luxury-gold">
                    <option value="Grocery">Grocery / Food</option>
                    <option value="Toiletries">Toiletries</option>
                    <option value="Linen">Linen / Bedding</option>
                    <option value="Cleaning">Cleaning Supplies</option>
                    <option value="Equipment">Equipment / Tools</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-luxury-dark/70 uppercase tracking-wider mb-2">Quantity</label>
                    <input type="number" value={invForm.quantity} onChange={e => setInvForm({...invForm, quantity: Number(e.target.value)})} className="w-full p-3 bg-black/5 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-luxury-gold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-luxury-dark/70 uppercase tracking-wider mb-2">Unit (e.g kg)</label>
                    <input type="text" value={invForm.unit} onChange={e => setInvForm({...invForm, unit: e.target.value})} className="w-full p-3 bg-black/5 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-luxury-gold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-luxury-dark/70 uppercase tracking-wider mb-2">Min. Alert</label>
                    <input type="number" value={invForm.threshold} onChange={e => setInvForm({...invForm, threshold: Number(e.target.value)})} className="w-full p-3 bg-black/5 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-luxury-gold" />
                  </div>
                </div>
                <button type="submit" className="w-full py-3 mt-4 bg-luxury-dark text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black transition-colors">
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
