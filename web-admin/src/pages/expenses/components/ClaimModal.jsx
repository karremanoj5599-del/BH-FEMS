import React from 'react';
import { Plus, X, Image as ImageIcon, Camera } from 'lucide-react';
import expenseService from '../../../services/expenseService';

const CATEGORIES = ['Travel', 'Materials', 'Food', 'Fuel', 'Others'];

export default function ClaimModal({
  claimItems, setClaimItems, 
  setShowClaimModal, setIsSubmitting, isSubmitting, 
  setActiveCameraIndex, startCamera, fetchData
}) {
  const addClaimItem = () => {
    setClaimItems([...claimItems, { description: '', category: 'Travel', amount: '', receipt_url: null }]);
  };

  const removeClaimItem = (index) => {
    if (claimItems.length > 1) {
      setClaimItems(claimItems.filter((_, i) => i !== index));
    }
  };

  const updateClaimItem = (index, field, value) => {
    const updatedItems = [...claimItems];
    updatedItems[index][field] = value;
    setClaimItems(updatedItems);
  };

  const totalClaimAmount = claimItems.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = claimItems.map(item => ({
        ...item,
        amount: parseFloat(item.amount || "0"),
        date_incurred: new Date().toISOString().split('T')[0],
        status: 'Pending'
      }));
      await expenseService.submitBulkExpenses(payload);
      setShowClaimModal(false);
      fetchData();
    } catch (err) {
      console.error("Failed to submit claims:", err);
      alert("Failed to submit claims. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setShowClaimModal(false)}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 650, width: '90%' }}>
        <div className="modal-header">
          <div>
            <h2 style={{ margin: 0 }}>New Expense Claim</h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>You can add multiple items to this claim</p>
          </div>
          <button className="btn btn-ghost" onClick={() => setShowClaimModal(false)}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto', padding: '20px 24px' }}>
            {claimItems.map((item, index) => (
              <div key={index} className="claim-item-row" style={{ 
                padding: 20, background: 'var(--surface-2)', borderRadius: 16, 
                marginBottom: 16, border: '1px solid var(--border-subtle)', position: 'relative'
              }}>
                {claimItems.length > 1 && (
                  <button 
                    type="button" className="btn btn-ghost" 
                    onClick={() => removeClaimItem(index)}
                    style={{ position: 'absolute', top: 12, right: 12, color: 'var(--danger-400)', width: 32, height: 32, padding: 0 }}
                  >
                    <X size={16} />
                  </button>
                )}
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ 
                    width: 24, height: 24, borderRadius: '50%', background: 'var(--primary-500)', 
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 
                  }}>
                    {index + 1}
                  </div>
                  <h4 style={{ margin: 0, fontSize: 14 }}>Expense Item</h4>
                </div>

                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <input 
                    type="text" className="form-input" placeholder="e.g. Travel to client site" 
                    required value={item.description} onChange={(e) => updateClaimItem(index, 'description', e.target.value)}
                  />
                </div>
                
                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select 
                      className="form-select" value={item.category}
                      onChange={(e) => updateClaimItem(index, 'category', e.target.value)}
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Amount (₹) *</label>
                    <input 
                      type="number" step="0.01" className="form-input" placeholder="0.00" 
                      required value={item.amount} onChange={(e) => updateClaimItem(index, 'amount', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Attach Receipt</label>
                  {!item.receipt_url ? (
                    <div style={{ display: 'flex', gap: 10 }}>
                      <label style={{ 
                        flex: 1, border: '2px dashed var(--border-subtle)', 
                        padding: '12px 16px', borderRadius: 12, textAlign: 'center', cursor: 'pointer', margin: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                      }}>
                        <ImageIcon size={16} style={{ opacity: 0.5 }} />
                        <div style={{ fontSize: 12 }}>Upload File</div>
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => updateClaimItem(index, 'receipt_url', reader.result);
                            reader.readAsDataURL(file);
                          }
                        }} />
                      </label>
                      <div 
                        onClick={() => { setActiveCameraIndex(index); startCamera(); }}
                        style={{ 
                          flex: 1, border: '2px dashed var(--primary-500)', 
                          padding: '12px 16px', borderRadius: 12, textAlign: 'center', cursor: 'pointer',
                          background: 'rgba(99, 102, 241, 0.05)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                        }}
                      >
                        <Camera size={16} style={{ color: 'var(--primary-400)' }} />
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary-400)' }}>Click Photo</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ position: 'relative', width: 120 }}>
                      <img src={item.receipt_url} style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 8 }} alt="receipt" />
                      <button 
                        type="button" className="btn btn-ghost" 
                        onClick={() => updateClaimItem(index, 'receipt_url', null)} 
                        style={{ position: 'absolute', top: -8, right: -8, background: 'var(--danger-500)', borderRadius: '50%', width: 24, height: 24, padding: 0 }}
                      >
                        <X size={12} color="white" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            <button 
              type="button" className="btn btn-ghost" onClick={addClaimItem}
              style={{ width: '100%', border: '2px dashed var(--border-subtle)', borderRadius: 16, padding: 16, color: 'var(--primary-400)' }}
            >
              <Plus size={16} style={{ marginRight: 8 }} /> Add Another Expense
            </button>
          </div>
          
          <div className="modal-footer" style={{ background: 'var(--surface-1)', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Amount</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>₹{totalClaimAmount.toFixed(2)}</div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowClaimModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : `Submit ${claimItems.length} Claim${claimItems.length > 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
