import React from 'react';
import { Eye, FileText } from 'lucide-react';

export default function ReportsTab({ isEmployee, myCompletedTasks, completedTasks, setSelectedTask, setModalType, setShowModal, fetchExecutionReport }) {
  const tasksToDisplay = isEmployee ? myCompletedTasks : completedTasks;

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: 20, borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <h3 style={{ fontSize: 16, fontWeight: 600 }}>Completed Task Reports</h3>
      </div>
      <div className="data-table-wrapper">
         <table className="data-table">
           <thead>
             <tr>
               <th>Task ID</th>
               <th>Description</th>
               <th>Site</th>
               <th>Executant</th>
               <th>Start Time</th>
               <th>Completion Notes</th>
               <th>Execution Proof</th>
               <th>Status</th>
             </tr>
           </thead>
           <tbody>
             {tasksToDisplay.length === 0 ? (
               <tr><td colSpan="8" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No completed tasks found.</td></tr>
             ) : tasksToDisplay.map(task => (
               <tr key={task.id}>
                 <td style={{ fontWeight: 600 }}>#{task.id}</td>
                 <td style={{ fontWeight: 500 }}>{task.content || task.title}</td>
                 <td>
                    {task.location ? (
                      <a href={task.location.match(/^https?:\/\//) ? task.location : `https://maps.google.com/?q=${encodeURIComponent(task.location)}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-500)', textDecoration: 'underline' }}>
                         {task.location.length > 25 ? task.location.substring(0, 25) + '...' : task.location}
                      </a>
                    ) : (
                      <span>{task.site_name || task.site || '—'}</span>
                    )}
                 </td>
                 <td style={{ fontWeight: 600 }}>{task.assignee_name || task.assignee || '—'}</td>
                 <td>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                       {task.start_time ? new Date(task.start_time).toLocaleString() : 'N/A'}
                    </span>
                 </td>
                 <td style={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-secondary)' }}>
                   <FileText size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'text-bottom' }} />
                   {task.notes || 'No notes provided'}
                 </td>
                 <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedTask(task); setModalType('executionReport'); setShowModal(true); fetchExecutionReport(task.id); }}>
                         <Eye size={14} style={{ marginRight: 4 }} /> View Report
                      </button>
                 </td>
                 <td>
                    <span className={`badge ${task.status === 'done' ? 'badge-active' : 'badge-pending'}`}>{task.status === 'done' ? 'Verified' : 'Needs Review'}</span>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
      </div>
    </div>
  );
}
