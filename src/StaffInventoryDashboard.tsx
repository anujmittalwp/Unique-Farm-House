import React, { useState, useEffect, useMemo } from 'react';
import { db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, where, getDocs } from 'firebase/firestore';
import { 
  Users, Package, Plus, Edit2, Trash2, X, Check, AlertTriangle, 
  Search, IndianRupee, Wallet, Calendar, ArrowUpRight, ArrowDownLeft, 
  Filter, CheckCircle2, History, CreditCard, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

export const StaffInventoryDashboard = ({ showToast }: { showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [activeTab, setActiveTab] = useState<'staff' | 'payroll' | 'inventory'>('staff');
  
  // Data States
  const [staffList, setStaffList] = useState<any[]>([]);
  const [inventoryList, setInventoryList] = useState<any[]>([]);
  const [payrollList, setPayrollList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Month & Filter States for Payroll
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Modals
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  
  // Editing State
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form States
  const [staffForm, setStaffForm] = useState({ 
    name: '', 
    role: 'Caretaker', 
    phone: '', 
    salary: '', 
    status: 'Active' 
  });
  
  const [invForm, setInvForm] = useState({ 
    itemName: '', 
    category: 'Grocery', 
    quantity: 0, 
    unit: 'pcs', 
    threshold: 5 
  });

  const [payrollForm, setPayrollForm] = useState({
    staffId: '',
    type: 'advance' as 'advance' | 'salary' | 'bonus' | 'deduction',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    paidBy: 'owner' as 'owner' | 'caretaker',
    note: '',
    syncFinance: true
  });

  const [search, setSearch] = useState('');
  
  useEffect(() => {
    // 1. Staff Listener
    const unsubStaff = onSnapshot(collection(db, 'staff'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
      setStaffList(data);
    }, (error) => {
      console.error("Staff listener error:", error);
    });
    
    // 2. Inventory Listener
    const unsubInv = onSnapshot(collection(db, 'inventory'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a: any, b: any) => (a.itemName || '').localeCompare(b.itemName || ''));
      setInventoryList(data);
      setLoading(false);
    }, (error) => {
      console.error("Inventory listener error:", error);
      setLoading(false);
    });

    // 3. Payroll Listener
    const unsubPayroll = onSnapshot(collection(db, 'staff_payroll'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a: any, b: any) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
      setPayrollList(data);
    }, (error) => {
      console.error("Payroll listener error:", error);
    });
    
    return () => { 
      unsubStaff(); 
      unsubInv(); 
      unsubPayroll();
    };
  }, []);

  // Staff Save
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
      setStaffForm({ name: '', role: 'Caretaker', phone: '', salary: '', status: 'Active' });
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  // Inventory Save
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

  // Payroll Save
  const handleSavePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payrollForm.staffId) return showToast("Please select a staff member", "error");
    const amountNum = parseFloat(payrollForm.amount);
    if (isNaN(amountNum) || amountNum <= 0) return showToast("Please enter a valid amount", "error");

    const targetStaff = staffList.find(s => s.id === payrollForm.staffId);
    if (!targetStaff) return showToast("Staff not found", "error");

    const entryMonth = payrollForm.date.slice(0, 7); // e.g. "2026-09"

    try {
      if (editingItem) {
        await updateDoc(doc(db, 'staff_payroll', editingItem.id), {
          staffId: payrollForm.staffId,
          staffName: targetStaff.name,
          staffRole: targetStaff.role,
          type: payrollForm.type,
          amount: amountNum,
          date: payrollForm.date,
          month: entryMonth,
          paidBy: payrollForm.paidBy,
          note: payrollForm.note,
          updatedAt: new Date().toISOString()
        });
        showToast("Payroll entry updated", "success");
      } else {
        const docRef = await addDoc(collection(db, 'staff_payroll'), {
          staffId: payrollForm.staffId,
          staffName: targetStaff.name,
          staffRole: targetStaff.role,
          type: payrollForm.type,
          amount: amountNum,
          date: payrollForm.date,
          month: entryMonth,
          paidBy: payrollForm.paidBy,
          note: payrollForm.note,
          createdAt: new Date().toISOString()
        });

        // Optionally sync to Global Expenses (Finance Dashboard)
        if (payrollForm.syncFinance && (payrollForm.type === 'advance' || payrollForm.type === 'salary' || payrollForm.type === 'bonus')) {
          await addDoc(collection(db, 'global_expenses'), {
            amount: amountNum,
            category: 'Salaries',
            paidBy: payrollForm.paidBy,
            note: `[Staff: ${targetStaff.name} - ${payrollForm.type.toUpperCase()}] ${payrollForm.note || ''}`.trim(),
            date: payrollForm.date,
            createdAt: new Date().toISOString(),
            payrollRefId: docRef.id
          });
        }

        showToast("Payroll entry recorded successfully", "success");
      }

      setIsPayrollModalOpen(false);
      setEditingItem(null);
      setPayrollForm({
        staffId: '',
        type: 'advance',
        amount: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        paidBy: 'owner',
        note: '',
        syncFinance: true
      });
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const deleteRecord = async (collectionName: string, id: string) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await deleteDoc(doc(db, collectionName, id));
      
      // If deleting a payroll entry, check if there is an associated global_expenses record
      if (collectionName === 'staff_payroll') {
        const qExp = query(collection(db, 'global_expenses'), where('payrollRefId', '==', id));
        const snap = await getDocs(qExp);
        snap.forEach(async (d) => {
          await deleteDoc(doc(db, 'global_expenses', d.id));
        });
      }

      showToast("Record deleted", "info");
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  // Open Payroll Modal for specific staff
  const openPayrollForStaff = (staffId: string, defaultType: 'advance' | 'salary' = 'advance') => {
    setEditingItem(null);
    setPayrollForm({
      staffId,
      type: defaultType,
      amount: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      paidBy: 'owner',
      note: '',
      syncFinance: true
    });
    setIsPayrollModalOpen(true);
  };

  // Filtered staff and inventory
  const filteredStaff = staffList.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.role.toLowerCase().includes(search.toLowerCase())
  );
  
  const filteredInv = inventoryList.filter(i => 
    i.itemName.toLowerCase().includes(search.toLowerCase()) || 
    i.category.toLowerCase().includes(search.toLowerCase())
  );

  // Month-filtered payroll entries
  const currentMonthEntries = useMemo(() => {
    return payrollList.filter(entry => {
      const matchMonth = (entry.month === selectedMonth) || (entry.date && entry.date.startsWith(selectedMonth));
      const matchStaff = staffFilter === 'all' || entry.staffId === staffFilter;
      const matchType = typeFilter === 'all' || entry.type === typeFilter;
      const matchSearch = !search || 
        (entry.staffName && entry.staffName.toLowerCase().includes(search.toLowerCase())) ||
        (entry.note && entry.note.toLowerCase().includes(search.toLowerCase()));
      return matchMonth && matchStaff && matchType && matchSearch;
    });
  }, [payrollList, selectedMonth, staffFilter, typeFilter, search]);

  // Overall Month Statistics
  const monthStats = useMemo(() => {
    const monthAllEntries = payrollList.filter(entry => 
      (entry.month === selectedMonth) || (entry.date && entry.date.startsWith(selectedMonth))
    );

    const activeStaff = staffList.filter(s => s.status === 'Active');
    const totalBaseSalary = activeStaff.reduce((sum, s) => sum + (parseFloat(s.salary) || 0), 0);
    
    let totalAdvance = 0;
    let totalSalaryPaid = 0;
    let totalBonus = 0;
    let totalDeductions = 0;

    monthAllEntries.forEach(e => {
      const amt = parseFloat(e.amount) || 0;
      if (e.type === 'advance') totalAdvance += amt;
      else if (e.type === 'salary') totalSalaryPaid += amt;
      else if (e.type === 'bonus') totalBonus += amt;
      else if (e.type === 'deduction') totalDeductions += amt;
    });

    const netRemaining = Math.max(0, totalBaseSalary + totalBonus - totalDeductions - totalAdvance - totalSalaryPaid);

    return {
      activeStaffCount: activeStaff.length,
      totalBaseSalary,
      totalAdvance,
      totalSalaryPaid,
      totalBonus,
      totalDeductions,
      netRemaining
    };
  }, [payrollList, staffList, selectedMonth]);

  // Staff-wise Balance Calculations for Selected Month
  const staffBalances = useMemo(() => {
    const monthAllEntries = payrollList.filter(entry => 
      (entry.month === selectedMonth) || (entry.date && entry.date.startsWith(selectedMonth))
    );

    return staffList.map(staff => {
      const baseSalary = parseFloat(staff.salary) || 0;
      const staffEntries = monthAllEntries.filter(e => e.staffId === staff.id);

      let advance = 0;
      let salaryPaid = 0;
      let bonus = 0;
      let deductions = 0;

      staffEntries.forEach(e => {
        const amt = parseFloat(e.amount) || 0;
        if (e.type === 'advance') advance += amt;
        else if (e.type === 'salary') salaryPaid += amt;
        else if (e.type === 'bonus') bonus += amt;
        else if (e.type === 'deduction') deductions += amt;
      });

      const netPayable = Math.max(0, baseSalary + bonus - deductions - advance - salaryPaid);

      return {
        staff,
        baseSalary,
        advance,
        salaryPaid,
        bonus,
        deductions,
        netPayable,
        isSettled: netPayable === 0 && (advance + salaryPaid > 0 || baseSalary === 0)
      };
    });
  }, [staffList, payrollList, selectedMonth]);

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex flex-wrap gap-2 bg-luxury-dark/5 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab('staff')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'staff' ? 'bg-luxury-dark text-white shadow' : 'text-luxury-dark hover:bg-white'}`}
          >
            <div className="flex items-center gap-2"><Users size={16} /> Staff Profiles ({staffList.length})</div>
          </button>
          <button 
            onClick={() => setActiveTab('payroll')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'payroll' ? 'bg-luxury-dark text-white shadow' : 'text-luxury-dark hover:bg-white'}`}
          >
            <div className="flex items-center gap-2">
              <Wallet size={16} /> Payroll & Advance Khata
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-luxury-dark text-white shadow' : 'text-luxury-dark hover:bg-white'}`}
          >
            <div className="flex items-center gap-2"><Package size={16} /> Inventory ({inventoryList.length})</div>
          </button>
        </div>

        <div className="flex gap-3 w-full md:w-auto items-center">
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
                setStaffForm({ name: '', role: 'Caretaker', phone: '', salary: '', status: 'Active' });
                setIsStaffModalOpen(true);
              } else if (activeTab === 'payroll') {
                setPayrollForm({
                  staffId: staffList[0]?.id || '',
                  type: 'advance',
                  amount: '',
                  date: format(new Date(), 'yyyy-MM-dd'),
                  paidBy: 'owner',
                  note: '',
                  syncFinance: true
                });
                setIsPayrollModalOpen(true);
              } else {
                setInvForm({ itemName: '', category: 'Grocery', quantity: 0, unit: 'pcs', threshold: 5 });
                setIsInventoryModalOpen(true);
              }
            }}
            className="px-5 py-2.5 bg-luxury-gold text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-luxury-gold/90 transition-all flex items-center gap-2 flex-shrink-0 shadow-sm active:scale-95"
          >
            <Plus size={16} /> 
            {activeTab === 'staff' ? 'Add Staff' : activeTab === 'payroll' ? 'Record Entry' : 'Add Item'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center text-luxury-dark/40 border border-black/5">
          Loading Staff & Payroll records...
        </div>
      ) : activeTab === 'staff' ? (
        /* ================= 1. STAFF PROFILES TAB ================= */
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] uppercase font-bold tracking-widest text-luxury-dark/40 border-b border-black/5">
                <tr>
                  <th className="px-4 py-4">Name</th>
                  <th className="px-4 py-4">Role</th>
                  <th className="px-4 py-4">Phone</th>
                  <th className="px-4 py-4">Monthly Salary</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4 text-center">Khata Action</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-black/40">No staff found. Click "Add Staff" to create one.</td></tr>
                ) : filteredStaff.map(staff => (
                  <tr key={staff.id} className="border-b border-black/5 last:border-0 hover:bg-black/5 transition-colors">
                    <td className="px-4 py-4 font-bold text-luxury-dark">{staff.name}</td>
                    <td className="px-4 py-4">
                      <span className="px-2.5 py-1 bg-luxury-dark/5 rounded-lg text-xs font-medium text-luxury-dark">
                        {staff.role}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-black/60 font-mono text-xs">{staff.phone || '-'}</td>
                    <td className="px-4 py-4 font-bold text-luxury-dark">₹{Number(staff.salary || 0).toLocaleString()}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${staff.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'}`}>
                        {staff.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button 
                        onClick={() => {
                          setStaffFilter(staff.id);
                          setActiveTab('payroll');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors"
                      >
                        <Wallet size={13} /> View Khata
                      </button>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { 
                            setEditingItem(staff); 
                            setStaffForm({
                              name: staff.name || '',
                              role: staff.role || 'Caretaker',
                              phone: staff.phone || '',
                              salary: staff.salary || '',
                              status: staff.status || 'Active'
                            }); 
                            setIsStaffModalOpen(true); 
                          }} 
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Staff"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => deleteRecord('staff', staff.id)} 
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Staff"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'payroll' ? (
        /* ================= 2. PAYROLL & ADVANCE KHATA TAB ================= */
        <div className="space-y-6">
          {/* Month Selector & Controls */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold">Billing Month</p>
                <input 
                  type="month" 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)} 
                  className="text-base font-bold text-luxury-dark bg-transparent border-none outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-luxury-dark/40 tracking-wider">Staff:</span>
                <select 
                  value={staffFilter} 
                  onChange={(e) => setStaffFilter(e.target.value)}
                  className="px-3 py-2 bg-luxury-cream border border-black/5 rounded-xl text-xs font-bold focus:outline-none focus:border-luxury-gold"
                >
                  <option value="all">All Staff ({staffList.length})</option>
                  {staffList.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-luxury-dark/40 tracking-wider">Type:</span>
                <select 
                  value={typeFilter} 
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 bg-luxury-cream border border-black/5 rounded-xl text-xs font-bold focus:outline-none focus:border-luxury-gold"
                >
                  <option value="all">All Types</option>
                  <option value="advance">Advances Only</option>
                  <option value="salary">Salary Paid</option>
                  <option value="bonus">Bonus / Tips</option>
                  <option value="deduction">Deductions</option>
                </select>
              </div>
            </div>
          </div>

          {/* Monthly KPI Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-black/5 shadow-sm space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold">Total Monthly Base</p>
              <p className="text-2xl font-serif font-bold text-luxury-dark">
                ₹{monthStats.totalBaseSalary.toLocaleString()}
              </p>
              <p className="text-[10px] text-luxury-dark/50">For {monthStats.activeStaffCount} active staff</p>
            </div>

            <div className="bg-amber-50/60 p-5 rounded-3xl border border-amber-200/60 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-widest text-amber-800 font-bold">Advance Given</p>
                <ArrowDownLeft size={16} className="text-amber-600" />
              </div>
              <p className="text-2xl font-serif font-bold text-amber-900">
                ₹{monthStats.totalAdvance.toLocaleString()}
              </p>
              <p className="text-[10px] text-amber-700/70">Taken in {selectedMonth}</p>
            </div>

            <div className="bg-emerald-50/60 p-5 rounded-3xl border border-emerald-200/60 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-widest text-emerald-800 font-bold">Salary Disbursed</p>
                <CheckCircle2 size={16} className="text-emerald-600" />
              </div>
              <p className="text-2xl font-serif font-bold text-emerald-900">
                ₹{monthStats.totalSalaryPaid.toLocaleString()}
              </p>
              <p className="text-[10px] text-emerald-700/70">Settled this month</p>
            </div>

            <div className="bg-luxury-dark p-5 rounded-3xl border border-luxury-dark shadow-sm text-white space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Net Remaining to Pay</p>
                <Wallet size={16} className="text-luxury-gold" />
              </div>
              <p className="text-2xl font-serif font-bold text-luxury-gold">
                ₹{monthStats.netRemaining.toLocaleString()}
              </p>
              <p className="text-[10px] text-white/40">Pending month-end balance</p>
            </div>
          </div>

          {/* Staff Balance Khata (Summary by Staff) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg text-luxury-dark">Individual Staff Statement ({selectedMonth})</h3>
                <p className="text-xs text-luxury-dark/40">Real-time salary calculation, advance adjustment, and balance per staff member.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] uppercase font-bold tracking-widest text-luxury-dark/40 border-b border-black/5">
                  <tr>
                    <th className="px-4 py-3">Staff Name</th>
                    <th className="px-4 py-3">Base Salary</th>
                    <th className="px-4 py-3">Advance Taken</th>
                    <th className="px-4 py-3">Salary Paid</th>
                    <th className="px-4 py-3">Net Balance Remaining</th>
                    <th className="px-4 py-3 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody>
                  {staffBalances.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-6 text-black/40">No staff members configured.</td></tr>
                  ) : staffBalances.map(({ staff, baseSalary, advance, salaryPaid, netPayable, isSettled }) => (
                    <tr key={staff.id} className="border-b border-black/5 last:border-0 hover:bg-black/5 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-luxury-dark">{staff.name}</p>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-luxury-dark/5 text-luxury-dark">
                            {staff.role}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-bold text-luxury-dark">
                        ₹{baseSalary.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 font-bold text-amber-800">
                        {advance > 0 ? `₹${advance.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-4 py-4 font-bold text-emerald-800">
                        {salaryPaid > 0 ? `₹${salaryPaid.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-4 py-4">
                        {netPayable === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold">
                            <Check size={12} /> Cleared (₹0)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold">
                            Pending: ₹{netPayable.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openPayrollForStaff(staff.id, 'advance')}
                            className="px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold rounded-xl hover:bg-amber-100 transition-colors"
                          >
                            + Advance
                          </button>
                          <button
                            onClick={() => openPayrollForStaff(staff.id, 'salary')}
                            className="px-3 py-1.5 bg-luxury-dark text-white text-xs font-bold rounded-xl hover:bg-black transition-colors"
                          >
                            Pay Salary
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transactions / Ledger History */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg text-luxury-dark">Khata Transactions & History</h3>
                <p className="text-xs text-luxury-dark/40">All salary and advance disbursement logs for {selectedMonth}.</p>
              </div>
              <span className="text-xs font-bold text-luxury-dark/40">{currentMonthEntries.length} Records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] uppercase font-bold tracking-widest text-luxury-dark/40 border-b border-black/5">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Staff Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Paid Via</th>
                    <th className="px-4 py-3">Note</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMonthEntries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-black/40 italic">
                        No transactions recorded for {selectedMonth}. Click "Record Entry" to add one.
                      </td>
                    </tr>
                  ) : currentMonthEntries.map(entry => {
                    const typeBadge = entry.type === 'advance' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800">Advance</span>
                    ) : entry.type === 'salary' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">Salary</span>
                    ) : entry.type === 'bonus' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">Bonus</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-100 text-purple-800">Deduction</span>
                    );

                    const paidViaBadge = entry.paidBy === 'caretaker' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                        Caretaker Cash
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200">
                        Owner Bank / UPI
                      </span>
                    );

                    return (
                      <tr key={entry.id} className="border-b border-black/5 last:border-0 hover:bg-black/5 transition-colors">
                        <td className="px-4 py-4 text-xs font-mono text-luxury-dark/60">{entry.date || '—'}</td>
                        <td className="px-4 py-4 font-bold text-luxury-dark">
                          {entry.staffName} <span className="text-[10px] font-normal text-luxury-dark/40">({entry.staffRole})</span>
                        </td>
                        <td className="px-4 py-4">{typeBadge}</td>
                        <td className="px-4 py-4 font-bold text-luxury-dark">₹{Number(entry.amount || 0).toLocaleString()}</td>
                        <td className="px-4 py-4">{paidViaBadge}</td>
                        <td className="px-4 py-4 text-xs text-luxury-dark/60">{entry.note || '—'}</td>
                        <td className="px-4 py-4 text-right">
                          <button 
                            onClick={() => deleteRecord('staff_payroll', entry.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ================= 3. INVENTORY TAB ================= */
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5">
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
        </div>
      )}

      {/* ================= MODAL: STAFF ================= */}
      <AnimatePresence>
        {isStaffModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-luxury-dark/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-serif text-luxury-dark">{editingItem ? 'Edit Staff Profile' : 'Add New Staff Profile'}</h3>
                <button onClick={() => setIsStaffModalOpen(false)} className="p-2 hover:bg-black/5 rounded-full"><X size={20} /></button>
              </div>
              <form onSubmit={handleSaveStaff} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-luxury-dark/70 uppercase tracking-wider mb-2">Name</label>
                  <input type="text" value={staffForm.name} onChange={e => setStaffForm({...staffForm, name: e.target.value})} className="w-full p-3 bg-black/5 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-luxury-gold" placeholder="Staff Full Name" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-luxury-dark/70 uppercase tracking-wider mb-2">Role</label>
                    <select value={staffForm.role} onChange={e => setStaffForm({...staffForm, role: e.target.value})} className="w-full p-3 bg-black/5 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-luxury-gold">
                      <option value="Caretaker">Caretaker</option>
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
                    <input type="text" value={staffForm.phone} onChange={e => setStaffForm({...staffForm, phone: e.target.value})} className="w-full p-3 bg-black/5 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-luxury-gold" placeholder="Mobile No." />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-luxury-dark/70 uppercase tracking-wider mb-2">Monthly Salary (₹)</label>
                    <input type="number" value={staffForm.salary} onChange={e => setStaffForm({...staffForm, salary: e.target.value})} className="w-full p-3 bg-black/5 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-luxury-gold" placeholder="e.g. 15000" />
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

      {/* ================= MODAL: RECORD PAYROLL / ADVANCE ================= */}
      <AnimatePresence>
        {isPayrollModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-luxury-dark/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-serif text-luxury-dark">Record Staff Khata Entry</h3>
                  <p className="text-xs text-luxury-dark/40">Log salary payment, advance, or bonus.</p>
                </div>
                <button onClick={() => setIsPayrollModalOpen(false)} className="p-2 hover:bg-black/5 rounded-full"><X size={20} /></button>
              </div>
              <form onSubmit={handleSavePayroll} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-luxury-dark/70 uppercase tracking-wider mb-2">Select Staff</label>
                  <select 
                    value={payrollForm.staffId} 
                    onChange={e => setPayrollForm({...payrollForm, staffId: e.target.value})} 
                    className="w-full p-3 bg-black/5 rounded-xl border-none text-sm font-bold outline-none focus:ring-2 focus:ring-luxury-gold"
                    required
                  >
                    <option value="">-- Choose Staff --</option>
                    {staffList.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.role}) - Base Salary: ₹{Number(s.salary || 0).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-luxury-dark/70 uppercase tracking-wider mb-2">Entry Type</label>
                    <select 
                      value={payrollForm.type} 
                      onChange={e => setPayrollForm({...payrollForm, type: e.target.value as any})} 
                      className="w-full p-3 bg-black/5 rounded-xl border-none text-sm font-bold outline-none focus:ring-2 focus:ring-luxury-gold"
                    >
                      <option value="advance">Advance</option>
                      <option value="salary">Salary Payment</option>
                      <option value="bonus">Bonus / Tip</option>
                      <option value="deduction">Deduction</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-luxury-dark/70 uppercase tracking-wider mb-2">Amount (₹)</label>
                    <input 
                      type="number" 
                      value={payrollForm.amount} 
                      onChange={e => setPayrollForm({...payrollForm, amount: e.target.value})} 
                      className="w-full p-3 bg-black/5 rounded-xl border-none text-sm font-bold outline-none focus:ring-2 focus:ring-luxury-gold" 
                      placeholder="e.g. 5000"
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-luxury-dark/70 uppercase tracking-wider mb-2">Payment Date</label>
                    <input 
                      type="date" 
                      value={payrollForm.date} 
                      onChange={e => setPayrollForm({...payrollForm, date: e.target.value})} 
                      className="w-full p-3 bg-black/5 rounded-xl border-none text-sm font-bold outline-none focus:ring-2 focus:ring-luxury-gold" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-luxury-dark/70 uppercase tracking-wider mb-2">Paid Via</label>
                    <select 
                      value={payrollForm.paidBy} 
                      onChange={e => setPayrollForm({...payrollForm, paidBy: e.target.value as any})} 
                      className="w-full p-3 bg-black/5 rounded-xl border-none text-sm font-bold outline-none focus:ring-2 focus:ring-luxury-gold"
                    >
                      <option value="owner">Owner Bank / UPI</option>
                      <option value="caretaker">Caretaker Cash</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-luxury-dark/70 uppercase tracking-wider mb-2">Note / Remarks (Optional)</label>
                  <input 
                    type="text" 
                    value={payrollForm.note} 
                    onChange={e => setPayrollForm({...payrollForm, note: e.target.value})} 
                    className="w-full p-3 bg-black/5 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-luxury-gold" 
                    placeholder="e.g. Diwali advance, Medical emergency, Final settlement" 
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={payrollForm.syncFinance} 
                      onChange={e => setPayrollForm({...payrollForm, syncFinance: e.target.checked})}
                      className="w-4 h-4 rounded text-luxury-gold focus:ring-luxury-gold"
                    />
                    <span className="text-xs text-luxury-dark/70 font-medium">
                      Also sync as expense in Finance Dashboard (Category: Salaries)
                    </span>
                  </label>
                  {payrollForm.paidBy === 'caretaker' && payrollForm.syncFinance && (
                    <p className="text-[10px] text-amber-800 ml-6 mt-1">
                      Note: This will automatically deduct from Caretaker Cash in Hand.
                    </p>
                  )}
                </div>

                <button type="submit" className="w-full py-3 mt-4 bg-luxury-dark text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black transition-colors">
                  Save Khata Entry
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: INVENTORY ================= */}
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
