import React from 'react';
import { Link } from 'react-router-dom';

export default function ScheduleTab({ 
  formatDateRange, 
  handlePrevWeek, 
  handleToday, 
  handleNextWeek, 
  getWeekDays, 
  displaySchedule, 
  employees 
}) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: 20, borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600 }}>Weekly Roster ({formatDateRange()})</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={handlePrevWeek}>Previous</button>
          <button className="btn btn-secondary btn-sm" onClick={handleToday}>Today</button>
          <button className="btn btn-ghost btn-sm" onClick={handleNextWeek}>Next</button>
        </div>
      </div>
      <div className="data-table-wrapper">
         <table className="data-table">
           <thead>
             <tr>
               <th>Employee</th>
               {getWeekDays().map((day, idx) => (
                 <th key={idx}>{day.label} {day.date}</th>
               ))}
             </tr>
           </thead>
           <tbody>
             {displaySchedule.map(row => (
               <tr key={row.employee}>
                 <td style={{ fontWeight: 600 }}>
                    <Link 
                      to={`/shifts/employee/${employees.find(e => e.name === row.employee)?.id}`}
                      style={{ color: 'var(--primary-400)', textDecoration: 'none' }}
                    >
                      {row.employee}
                    </Link>
                 </td>
                 {row.shifts.map((shift, idx) => (
                   <td key={idx}>
                     <span className={`badge ${shift === 'Off' ? 'badge-danger' : shift === 'Morning' ? 'badge-active' : shift === 'Night' ? '' : 'badge-pending'}`}>
                       {shift}
                     </span>
                   </td>
                 ))}
               </tr>
             ))}
           </tbody>
         </table>
      </div>
    </div>
  );
}
