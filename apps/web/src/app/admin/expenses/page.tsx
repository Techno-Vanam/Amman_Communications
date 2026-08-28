'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Expense {
  id: string;
  title: string;
  description: string | null;
  category: string;
  amount: number | string;
  expenseDate: string;
  paymentMethod: string | null;
  isVoided: boolean;
  notes: string | null;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: { id: string; name: string };
}

export default function AdminExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<{ totalAmount: number; currentMonthAmount: number; currentYearAmount: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'ADD' | 'EDIT' | 'DETAILS'>('ADD');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'OFFICE', amount: '', expenseDate: new Date().toISOString().split('T')[0], paymentMethod: 'CASH', notes: ''
  });
  
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; action: () => void } | null>(null);
  
  const router = useRouter();

  const fetchExpenses = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterCategory) params.append('category', filterCategory);

      const res = await fetch(`/api/v1/admin/expenses?${params.toString()}`);
      if (res.status === 401) return router.push('/login');
      if (!res.ok) throw new Error(`Unable to load expenses.`);
      const data = await res.json();
      setExpenses(data.data || []);
      setError('');
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
    }
  }, [searchTerm, filterCategory, router]);

  const fetchStats = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterCategory) params.append('category', filterCategory);
      const res = await fetch(`/api/v1/admin/expenses/stats?${params.toString()}`);
      if (res.status === 401) return router.push('/login');
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      const data = await res.json();
      setStats(data);
    } catch (e: unknown) {
      if (e instanceof Error) console.error(e.message);
    }
  }, [filterCategory, router]);

  const loadData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    await Promise.all([fetchExpenses(), fetchStats()]);
    if (showLoader) setLoading(false);
  }, [fetchExpenses, fetchStats]);

  useEffect(() => { loadData(); }, [loadData]);
  
  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const openConfirmation = (title: string, message: string, action: () => void) => {
    setConfirmModal({ isOpen: true, title, message, action });
  };



  const handleDeleteExpense = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/expenses/${id}`, {
        method: 'DELETE',
      });
      if (res.status === 401) return router.push('/login');
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      await loadData(false);
      setConfirmModal(null);
      setOpenDropdownId(null);
    } catch (e: unknown) {
      if (e instanceof Error) alert(e.message);
      setConfirmModal(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'DETAILS') return setIsModalOpen(false);
    
    setSubmitting(true);
    try {
      const url = modalMode === 'ADD' ? '/api/admin/expenses' : `/api/admin/expenses/${selectedExpense?.id}`;
      const method = modalMode === 'ADD' ? 'POST' : 'PATCH';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          amount: parseFloat(formData.amount),
          expenseDate: new Date(formData.expenseDate).toISOString() 
        })
      });
      if (res.status === 401) return router.push('/login');
      if (!res.ok) throw new Error(`Update failed: ${res.status}`);
      setIsModalOpen(false);
      await loadData(false);
    } catch (e: unknown) {
      if (e instanceof Error) alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openAdd = () => {
    setFormData({ title: '', description: '', category: 'OFFICE', amount: '', expenseDate: new Date().toISOString().split('T')[0], paymentMethod: 'CASH', notes: '' });
    setModalMode('ADD');
    setIsModalOpen(true);
  };

  const openEdit = (e: React.MouseEvent, expense: Expense) => {
    e.stopPropagation();
    setSelectedExpense(expense);
    setFormData({
      title: expense.title, description: expense.description || '', category: expense.category, amount: expense.amount.toString(), 
      expenseDate: new Date(expense.expenseDate).toISOString().split('T')[0], paymentMethod: expense.paymentMethod || 'CASH', notes: expense.notes || ''
    });
    setModalMode('EDIT');
    setIsModalOpen(true);
  };

  const openDetails = async (id: string) => {
    setModalMode('DETAILS');
    setSelectedExpense(null);
    setIsModalOpen(true);
    setDetailsLoading(true);
    try {
      const res = await fetch(`/api/admin/expenses/${id}`);
      if (res.status === 401) return router.push('/login');
      if (!res.ok) throw new Error('Failed to load details');
      const data = await res.json();
      setSelectedExpense(data);
    } catch (e: unknown) {
      if (e instanceof Error) alert(e.message);
      setIsModalOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  const formatCurrency = (amount: number | string) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(amount));

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Expenses</h1>
          <p className="mt-1 text-gray-500">Record and review business expenses.</p>
        </div>
        <button onClick={openAdd} className="bg-brand-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-800 transition-colors shrink-0">
          + Add Expense
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">{filterCategory ? `${filterCategory} Total` : 'Total Expenses'}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats ? formatCurrency(stats.totalAmount) : '--'}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">{filterCategory ? `${filterCategory} Year` : 'Current Year'}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats ? formatCurrency(stats.currentYearAmount) : '--'}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">{filterCategory ? `${filterCategory} Month` : 'Current Month'}</p>
          <p className="mt-2 text-3xl font-bold text-brand-600">{stats ? formatCurrency(stats.currentMonthAmount) : '--'}</p>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex-1 relative">
          <input 
            type="text" 
            placeholder="Search expenses..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-brand-500 focus:border-brand-500"
            suppressHydrationWarning
          />
          <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-brand-500 focus:border-brand-500" suppressHydrationWarning>
          <option value="">All Categories</option>
          <option value="OFFICE">OFFICE</option><option value="TRAVEL">TRAVEL</option><option value="EMPLOYEE">EMPLOYEE</option><option value="PROPERTY">PROPERTY</option><option value="UTILITIES">UTILITIES</option><option value="MARKETING">MARKETING</option><option value="EQUIPMENT">EQUIPMENT</option><option value="OTHER">OTHER</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4"><div className="animate-pulse h-10 bg-gray-100 rounded"></div></div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : expenses.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No expenses found. Click "+ Add Expense" to record one.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map((exp) => (
                  <tr key={exp.id} onClick={() => openDetails(exp.id)} className={`transition-colors cursor-pointer ${exp.isVoided ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <span className={exp.isVoided ? 'line-through text-gray-400' : ''}>{exp.title}</span>
                      {exp.isVoided && <span className="ml-2 text-xs font-bold text-red-500 px-1.5 py-0.5 rounded border border-red-200 bg-red-50">VOIDED</span>}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${exp.isVoided ? 'text-gray-400' : 'text-gray-500'}`}>{exp.category}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${exp.isVoided ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{formatCurrency(exp.amount)}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${exp.isVoided ? 'text-gray-400' : 'text-gray-500'}`}>{new Date(exp.expenseDate).toLocaleDateString()}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${exp.isVoided ? 'text-gray-400' : 'text-gray-500'}`}>{exp.paymentMethod || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={(e) => openEdit(e, exp)} className="text-brand-600 hover:text-brand-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-brand-600" disabled={exp.isVoided}>
                          Edit
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); openConfirmation('Delete Expense?', 'This will permanently delete the expense from the database. This action cannot be undone.', () => handleDeleteExpense(exp.id)); }} className="text-red-600 hover:text-red-900 font-medium">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirmModal?.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{confirmModal.title}</h3>
            <p className="text-sm text-gray-500 mb-6">{confirmModal.message}</p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmModal(null)} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="button" onClick={confirmModal.action} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {modalMode === 'ADD' ? 'Record Expense' : modalMode === 'EDIT' ? 'Edit Expense' : 'Expense Details'}
                {modalMode === 'DETAILS' && selectedExpense?.isVoided && <span className="text-xs font-bold text-red-500 px-1.5 py-0.5 rounded border border-red-200 bg-red-50">VOIDED</span>}
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {modalMode === 'DETAILS' ? (
                detailsLoading ? (
                   <div className="animate-pulse space-y-4"><div className="h-10 bg-gray-100 rounded"></div></div>
                ) : selectedExpense ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div><p className="text-xs text-gray-500">Title</p><p className={`font-medium ${selectedExpense.isVoided ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{selectedExpense.title}</p></div>
                      <div><p className="text-xs text-gray-500">Amount</p><p className={`font-medium ${selectedExpense.isVoided ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{formatCurrency(selectedExpense.amount)}</p></div>
                      <div><p className="text-xs text-gray-500">Category</p><p className="font-medium text-gray-900">{selectedExpense.category}</p></div>
                      <div><p className="text-xs text-gray-500">Date</p><p className="font-medium text-gray-900">{new Date(selectedExpense.expenseDate).toLocaleDateString()}</p></div>
                      <div><p className="text-xs text-gray-500">Payment Method</p><p className="font-medium text-gray-900">{selectedExpense.paymentMethod || '-'}</p></div>
                      <div><p className="text-xs text-gray-500">Notes</p><p className="text-sm text-gray-900">{selectedExpense.notes || '-'}</p></div>
                    </div>
                    <div className="border-t border-gray-100 pt-4 mt-4 space-y-4">
                      <div><p className="text-xs text-gray-500">Description</p><p className="text-sm text-gray-900">{selectedExpense.description || '-'}</p></div>
                    </div>
                    <div className="border-t border-gray-100 pt-4 mt-4 grid grid-cols-2 gap-4">
                      <div><p className="text-xs text-gray-500">Recorded By</p><p className="text-sm text-gray-900">{selectedExpense.createdBy?.name || '-'}</p></div>
                      <div><p className="text-xs text-gray-500">Recorded At</p><p className="text-sm text-gray-900">{selectedExpense.createdAt ? new Date(selectedExpense.createdAt).toLocaleString() : '-'}</p></div>
                    </div>
                  </div>
                ) : (
                  <p className="text-red-500">Failed to load details.</p>
                )
              ) : (
                <form id="expense-form" onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                      <input required type="number" step="0.01" min="0" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                      <input required type="date" value={formData.expenseDate} onChange={e => setFormData({...formData, expenseDate: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                      <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white">
                        <option value="OFFICE">OFFICE</option>
                        <option value="TRAVEL">TRAVEL</option>
                        <option value="EMPLOYEE">EMPLOYEE</option>
                        <option value="PROPERTY">PROPERTY</option>
                        <option value="UTILITIES">UTILITIES</option>
                        <option value="MARKETING">MARKETING</option>
                        <option value="EQUIPMENT">EQUIPMENT</option>
                        <option value="OTHER">OTHER</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                      <select value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white">
                        <option value="CASH">CASH</option>
                        <option value="BANK_TRANSFER">BANK TRANSFER</option>
                        <option value="CREDIT_CARD">CREDIT CARD</option>
                        <option value="UPI">UPI</option>
                        <option value="CHEQUE">CHEQUE</option>
                        <option value="OTHER">OTHER</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                </form>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 shrink-0">
              {modalMode === 'DETAILS' ? (
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Close</button>
              ) : (
                <>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled={submitting}>Cancel</button>
                  <button type="submit" form="expense-form" className="px-4 py-2 bg-brand-700 text-white rounded-lg hover:bg-brand-800 disabled:opacity-50 flex items-center" disabled={submitting}>
                    {submitting ? 'Saving...' : modalMode === 'ADD' ? 'Record Expense' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
