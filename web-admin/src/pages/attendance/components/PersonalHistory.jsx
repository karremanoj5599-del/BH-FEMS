import React from 'react';
import { History, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PersonalHistory({ selfieMode, isPresent, history }) {
  const navigate = useNavigate();

  return (
    <>
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <History size={18} /> Today's Log
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--text-muted)' }}>Scheduled Shift</span>
            <span>Morning (06:00 - 14:00)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--text-muted)' }}>Site Code</span>
            <span>SIT-001</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--text-muted)' }}>Grace Period</span>
            <span style={{ color: 'var(--success-400)' }}>Valid</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--text-muted)' }}>Selfie Verified</span>
            <span style={{ color: selfieMode === 'verified' || isPresent ? 'var(--success-400)' : 'var(--text-muted)' }}>
              {selfieMode === 'verified' || isPresent ? '✓ Yes' : 'Pending'}
            </span>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600 }}>Attendance History</h3>
          <button 
            onClick={() => navigate('/attendance/calendar')}
            className="btn btn-ghost btn-sm"
          >
            View Full Calendar <ChevronRight size={14} />
          </button>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Site</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(history || [])
                .sort((a, b) => new Date(b.check_in) - new Date(a.check_in))
                .slice(0, 5)
                .map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.check_in ? new Date(item.check_in).toLocaleDateString() : '-'}</td>
                  <td>{item.check_in ? new Date(item.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '-'}</td>
                  <td>{item.site || 'Main Site'}</td>
                  <td>
                    <span className={`badge ${item.status === 'On-Time' || item.status === 'Present' ? 'badge-active' : 'badge-pending'}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
