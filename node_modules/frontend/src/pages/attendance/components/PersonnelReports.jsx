import React from 'react';
import { Users, Download } from 'lucide-react';

export default function PersonnelReports({ 
  selectedMonth, 
  searchTerm, 
  setSearchTerm, 
  setSelectedMonth, 
  filteredReports 
}) {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 600 }}>Personnel Reports</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Individual performance metrics for {selectedMonth}</p>
        </div>
        <button className="btn btn-ghost btn-sm">Export All <Download size={14} /></button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search staff..." 
            style={{ paddingLeft: 32, height: 36, fontSize: 13 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Users size={14} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-muted)' }} />
        </div>
        <select 
          className="form-select" 
          style={{ width: 140, height: 36, fontSize: 13 }}
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option>March 2026</option>
          <option>February 2026</option>
          <option>January 2026</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 600, overflowY: 'auto' }}>
        {filteredReports.map(emp => {
          const rate = parseInt(emp.rate);
          const accentColor = rate > 90 ? '#10b981' : rate > 80 ? 'var(--primary-400)' : '#f59e0b';
          
          return (
            <div key={emp.id} style={{ 
              borderRadius: 16, background: 'var(--surface-2)', overflow: 'hidden',
              border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column'
            }} className="monitoring-card">
              <div style={{ height: 4, background: accentColor, opacity: 0.8 }} />
              
              <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: 'rgba(99,102,241,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 700, color: 'var(--primary-400)'
                }}>
                  {emp.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{emp.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Users size={12} /> {emp.dept}
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: 120 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: accentColor, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Attendance Health
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: 'var(--surface-3)', borderRadius: 3, width: 80 }}>
                      <div style={{ 
                        width: emp.rate, height: '100%', 
                        background: accentColor,
                        borderRadius: 3
                      }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 800 }}>{emp.rate}</span>
                  </div>
                </div>
                <div style={{ paddingLeft: 20, borderLeft: '1px solid var(--border-subtle)', textAlign: 'center', minWidth: 80 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4, fontWeight: 600 }}>Overtime</div>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>{emp.ot}h</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
