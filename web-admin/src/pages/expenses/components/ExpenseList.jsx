import React from 'react';
import { Receipt, Clock, Eye, Download, CheckCircle2, XCircle, Edit, Trash2 } from 'lucide-react';

const getStatusBadge = (status) => {
  switch(status) {
    case 'Approved': return <span className="badge badge-active"><CheckCircle2 size={12} /> Approved</span>;
    case 'Rejected': return <span className="badge badge-danger" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-400)' }}><XCircle size={12} /> Rejected</span>;
    default: return <span className="badge badge-pending"><Clock size={12} /> Pending</span>;
  }
};

export default function ExpenseList({ expenses, filter, openDetails, openEdit, handleDelete }) {
  const filteredExpenses = expenses.filter(expense => {
    const matchesCategory = filter === 'All' || expense.category === filter;
    return matchesCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {filteredExpenses.map(expense => (
        <div key={expense.id} className="card expense-admin-card animate-slide-up" style={{ 
          padding: 0, overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
          transition: 'all 0.2s ease',
          background: 'var(--surface-2)',
          borderRadius: 16
        }}>
          {/* Top Accent Strip */}
          <div style={{ 
            height: 4, 
            background: expense.status === 'Approved' ? '#10b981' : expense.status === 'Rejected' ? '#ef4444' : '#f59e0b',
            opacity: 0.8
          }} />

          <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ 
              width: 52, height: 52, borderRadius: 14, flexShrink: 0,
              background: 'rgba(99,102,241,0.08)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Receipt size={24} color="var(--primary-400)" />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{expense.description}</h3>
                <span style={{ 
                  padding: '2px 8px', borderRadius: 6, background: 'var(--surface-3)', 
                  fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' 
                }}>{expense.category}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={12} /> {expense.date} {expense.staff_name && `• ${expense.staff_name}`}
              </div>
            </div>

            <div style={{ textAlign: 'right', minWidth: 120 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                ₹{expense.amount}
              </div>
              {getStatusBadge(expense.status)}
            </div>

            <div style={{ display: 'flex', gap: 8, paddingLeft: 20, borderLeft: '1px solid var(--border-subtle)' }}>
              <button 
                className="btn btn-ghost btn-sm" 
                style={{ width: 36, height: 36, padding: 0, borderRadius: 10 }}
                onClick={() => openDetails(expense)}
              >
                <Eye size={16} />
              </button>
              {expense.status === 'Pending' && (
                <>
                  <button 
                    className="btn btn-ghost btn-sm" 
                    style={{ width: 36, height: 36, padding: 0, borderRadius: 10, color: 'var(--primary-400)' }}
                    onClick={(e) => { e.stopPropagation(); openEdit(expense); }}
                    title="Edit Expense"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="btn btn-ghost btn-sm" 
                    style={{ width: 36, height: 36, padding: 0, borderRadius: 10, color: 'var(--danger-400)' }}
                    onClick={(e) => { e.stopPropagation(); handleDelete(expense.id); }}
                    title="Delete Expense"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
              {expense.receipt && (
                <button 
                  className="btn btn-ghost btn-sm" 
                  style={{ width: 36, height: 36, padding: 0, borderRadius: 10 }}
                  title="Download Receipt"
                  onClick={(e) => {
                    e.stopPropagation();
                    const link = document.createElement('a');
                    link.href = expense.receipt;
                    link.download = `receipt_${expense.id}.png`;
                    link.click();
                  }}
                >
                  <Download size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
