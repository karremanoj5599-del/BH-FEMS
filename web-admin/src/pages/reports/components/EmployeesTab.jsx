import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, Search, Filter, X, ChevronUp, ChevronDown, MapPin, FileText } from 'lucide-react';

function FilterSelect({ label, value, onChange, style, children }) {
  return (
    <div>
      <label style={{ 
        fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4, 
        display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' 
      }}>
        {label}
      </label>
      <select value={value} onChange={e => onChange(e.target.value)} style={style}>
        {children}
      </select>
    </div>
  );
}

export default function EmployeesTab({
  granularity, setGranularity, selectedDate, setSelectedDate,
  navigateDate, isToday, goToToday, searchTerm, setSearchTerm,
  showFilters, setShowFilters, activeFilterCount, clearAllFilters,
  filters, updateFilter, filterOptions, filteredData, employeeReports,
  navigate
}) {
  const selectStyle = {
    background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
    color: 'var(--text-primary)', borderRadius: 6, padding: '6px 10px',
    fontSize: 13, outline: 'none', cursor: 'pointer', minWidth: 140, width: '100%'
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className={`btn btn-sm ${granularity === 'Daily' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setGranularity('Daily')}>Daily</button>
          <button className={`btn btn-sm ${granularity === 'Monthly' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setGranularity('Monthly')}>Monthly</button>
          <button className={`btn btn-sm ${granularity === 'Yearly' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setGranularity('Yearly')}>Yearly</button>

          <div style={{ 
            display: 'flex', alignItems: 'center', gap: 6, marginLeft: 12,
            background: 'var(--surface-2)', borderRadius: 8, padding: '4px 6px',
            border: '1px solid var(--border-subtle)'
          }}>
            <button 
              onClick={() => navigateDate(-1)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex', transition: 'color 0.15s' }}
              title="Previous"
            >
              <ChevronLeft size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={14} style={{ color: 'var(--primary-400)', flexShrink: 0 }} />
              <input 
                type={granularity === 'Daily' ? 'date' : 'month'}
                value={granularity === 'Daily' ? selectedDate : selectedDate.slice(0, 7)}
                onChange={(e) => {
                  if (!e.target.value) return;
                  if (granularity === 'Daily') setSelectedDate(e.target.value);
                  else setSelectedDate(e.target.value + '-01');
                }}
                style={{
                  background: 'none', border: 'none', outline: 'none',
                  color: 'var(--text-primary)', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', colorScheme: 'dark', width: granularity === 'Daily' ? 140 : 130
                }}
              />
            </div>

            <button 
              onClick={() => navigateDate(1)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex', transition: 'color 0.15s' }}
              title="Next"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {!isToday && (
            <button className="btn btn-sm btn-ghost" onClick={goToToday} style={{ fontSize: 12, color: 'var(--primary-400)', marginLeft: 4 }}>
              Today
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Search name or code..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: 32, height: 36, fontSize: 13, minWidth: 200 }}
            />
            <Search size={14} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-muted)' }} />
          </div>
          <button 
            className={`btn btn-sm ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowFilters(!showFilters)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Filter size={14} /> Filters
            {activeFilterCount > 0 && (
              <span style={{ 
                background: 'var(--danger-400)', color: '#fff', borderRadius: '50%', 
                width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, marginLeft: 2
              }}>
                {activeFilterCount}
              </span>
            )}
            {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {activeFilterCount > 0 && (
            <button className="btn btn-sm btn-ghost" onClick={clearAllFilters} style={{ color: 'var(--danger-400)', gap: 4 }}>
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div style={{ 
          background: 'var(--surface-2)', borderRadius: 10, padding: 16, marginBottom: 20,
          border: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12
        }}>
          <FilterSelect label="Department" value={filters.department} onChange={v => updateFilter('department', v)} style={selectStyle}>
            <option value="">All</option>
            {filterOptions.departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
          </FilterSelect>
          <FilterSelect label="Team" value={filters.team} onChange={v => updateFilter('team', v)} style={selectStyle}>
            <option value="">All</option>
            {filterOptions.teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
          </FilterSelect>
          {granularity === 'Daily' && (
            <>
              <FilterSelect label="Status" value={filters.status} onChange={v => updateFilter('status', v)} style={selectStyle}>
                <option value="">All</option>
                {filterOptions.statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </FilterSelect>
              <FilterSelect label="Shift" value={filters.shift} onChange={v => updateFilter('shift', v)} style={selectStyle}>
                <option value="">All</option>
                {filterOptions.shifts.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </FilterSelect>
              <FilterSelect label="Sites Visited" value={filters.sitesVisited} onChange={v => updateFilter('sitesVisited', v)} style={selectStyle}>
                <option value="">All</option><option value="yes">Has Visits</option><option value="no">No Visits</option>
              </FilterSelect>
              <FilterSelect label="Sites Missing" value={filters.sitesMissing} onChange={v => updateFilter('sitesMissing', v)} style={selectStyle}>
                <option value="">All</option><option value="yes">Has Missing</option><option value="no">None Missing</option>
              </FilterSelect>
              <FilterSelect label="Tasks Done" value={filters.tasksVisited} onChange={v => updateFilter('tasksVisited', v)} style={selectStyle}>
                <option value="">All</option><option value="yes">Has Updates</option><option value="no">No Updates</option>
              </FilterSelect>
              <FilterSelect label="Tasks Missed" value={filters.tasksMissed} onChange={v => updateFilter('tasksMissed', v)} style={selectStyle}>
                <option value="">All</option><option value="yes">Has Missed</option><option value="no">None Missed</option>
              </FilterSelect>
              <FilterSelect label="Shift Swaps" value={filters.hasSwaps} onChange={v => updateFilter('hasSwaps', v)} style={selectStyle}>
                <option value="">All</option><option value="yes">Has Swaps</option><option value="no">No Swaps</option>
              </FilterSelect>
            </>
          )}
          <FilterSelect label="Overtime" value={filters.hasOT} onChange={v => updateFilter('hasOT', v)} style={selectStyle}>
            <option value="">All</option><option value="yes">Has OT</option><option value="no">No OT</option>
          </FilterSelect>
        </div>
      )}

      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
        Showing <strong style={{ color: 'var(--text-primary)' }}>{filteredData.length}</strong> of {(employeeReports[granularity] || []).length} employees
      </div>

      <div className="data-table-wrapper" style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee</th><th>Code</th><th>Department</th><th>Team</th>
              {granularity === 'Daily' ? (
                <>
                  <th>Shift</th><th>Check In</th><th>Check Out</th><th>Status</th><th>OT</th>
                  <th style={{ textAlign: 'center' }}><span title="Sites Visited" style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}><MapPin size={12}/>Visited</span></th>
                  <th style={{ textAlign: 'center' }}><span title="Sites Missing" style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}><MapPin size={12}/>Missing</span></th>
                  <th style={{ textAlign: 'center' }}><span title="Tasks Done" style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}><FileText size={12}/>Done</span></th>
                  <th style={{ textAlign: 'center' }}><span title="Tasks Missed" style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}><FileText size={12}/>Missed</span></th>
                  <th style={{ textAlign: 'center' }}>Swaps</th>
                </>
              ) : (
                <>
                  <th>Present</th><th>Absent</th><th>Late</th><th>OT (Hrs)</th><th>Rate %</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr><td colSpan={granularity === 'Daily' ? 14 : 9} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No employees match the current filters.</td></tr>
            ) : filteredData.map(emp => (
              <tr key={emp.id} onClick={() => navigate(granularity === 'Monthly' ? `/reports/employee/${emp.id}/monthly?date=${selectedDate}` : `/reports/employee/${emp.id}?date=${selectedDate}`)} style={{ cursor: 'pointer' }} className="hover-row">
                <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{emp.name}</td>
                <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>{emp.empCode || '—'}</td>
                <td>{emp.dept}</td><td>{emp.team || '—'}</td>
                {granularity === 'Daily' ? (
                  <>
                    <td>{emp.shift && emp.shift !== '—' ? <span className="badge badge-pending" style={{ fontSize: 11 }}>{emp.shift}</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td style={{ color: emp.checkIn !== '-' ? 'var(--success-400)' : 'var(--text-muted)', fontWeight: 500 }}>{emp.checkIn}</td>
                    <td style={{ color: emp.checkOut !== '-' ? 'var(--warning-400)' : 'var(--text-muted)', fontWeight: 500 }}>{emp.checkOut}</td>
                    <td><span className={`badge ${emp.status === 'Present' || emp.status === 'On-Time' ? 'badge-active' : emp.status === 'Absent' ? 'badge-danger' : 'badge-pending'}`}>{emp.status}</span></td>
                    <td>{emp.ot}</td>
                    <td style={{ textAlign: 'center' }}><span style={{ color: (emp.sitesVisited || 0) > 0 ? 'var(--success-400)' : 'var(--text-muted)', fontWeight: (emp.sitesVisited || 0) > 0 ? 600 : 400 }}>{emp.sitesVisited || 0}</span></td>
                    <td style={{ textAlign: 'center' }}><span style={{ color: (emp.sitesMissing || 0) > 0 ? 'var(--danger-400)' : 'var(--text-muted)', fontWeight: (emp.sitesMissing || 0) > 0 ? 600 : 400 }}>{emp.sitesMissing || 0}</span></td>
                    <td style={{ textAlign: 'center' }}><span style={{ color: (emp.tasksVisited || 0) > 0 ? 'var(--success-400)' : 'var(--text-muted)', fontWeight: (emp.tasksVisited || 0) > 0 ? 600 : 400 }}>{emp.tasksVisited || 0}</span></td>
                    <td style={{ textAlign: 'center' }}><span style={{ color: (emp.tasksMissed || 0) > 0 ? 'var(--danger-400)' : 'var(--text-muted)', fontWeight: (emp.tasksMissed || 0) > 0 ? 600 : 400 }}>{emp.tasksMissed || 0}</span></td>
                    <td style={{ textAlign: 'center' }}>{(emp.swaps || 0) > 0 ? <span className="badge badge-pending" style={{ fontSize: 11 }}>{emp.swaps}</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                  </>
                ) : (
                  <>
                    <td>{emp.present}</td>
                    <td style={{ color: emp.absent > 0 ? 'var(--danger-400)' : undefined }}>{emp.absent}</td>
                    <td>{emp.late}</td><td>{emp.ot}h</td>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}><div style={{ width: emp.rate, height: '100%', background: 'var(--primary-400)', borderRadius: 2 }} /></div>{emp.rate}</div></td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
