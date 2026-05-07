import React from 'react';
import { Users, Info, ArrowUpRight } from 'lucide-react';

export default function TeamCoverageAndEarnings({ coverage, earnings }) {
  return (
    <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
      <div className="card">
        <h3 style={{ fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={18} color="var(--primary-400)" /> Team Availability & Coverage
        </h3>
        <div style={{ background: 'var(--surface-3)', borderRadius: 12, padding: 16 }}>
          {coverage ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13 }}>Next 7 Days Impact</span>
                <span className={`badge ${coverage.summary.includes('High') ? 'badge-danger' : 'badge-active'}`}>
                  {coverage.days.find(d => d.impact_level === 'high') ? 'High Volume' : 'Optimal Coverage'}
                </span>
              </div>
              <div className="alert alert-warning" style={{ 
                fontSize: 12, 
                display: 'flex', 
                gap: 8, 
                padding: 10, 
                background: coverage.summary.includes('High') ? 'rgba(239,68,68,0.05)' : 'rgba(34,197,94,0.05)', 
                border: coverage.summary.includes('High') ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(34,197,94,0.2)', 
                borderRadius: 8 
              }}>
                <Info size={14} color={coverage.summary.includes('High') ? 'var(--danger-400)' : 'var(--success-400)'} />
                <span>{coverage.summary}</span>
              </div>
            </>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Calculating coverage...</p>
          )}
        </div>
      </div>
      
      <div className="card">
         <h3 style={{ fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
           <ArrowUpRight size={18} color="var(--accent-400)" /> Comp-off Earnings
         </h3>
         <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
           {earnings.length === 0 ? (
             <p style={{ fontSize: 13, color: 'var(--text-muted)', padding: '12px 0' }}>No recent comp-off earnings detected.</p>
           ) : (
             earnings.map((earn, idx) => (
               <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 0', borderBottom: idx === earnings.length - 1 ? 'none' : '1px solid var(--border-subtle)' }}>
                 <span>{earn.label}</span>
                 <span style={{ color: 'var(--success-400)', fontWeight: 600 }}>+{earn.days_earned.toFixed(1)} Day</span>
               </div>
             ))
           )}
           <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
             *Auto-credited for working on designated off-days.
           </p>
         </div>
      </div>
    </div>
  );
}
