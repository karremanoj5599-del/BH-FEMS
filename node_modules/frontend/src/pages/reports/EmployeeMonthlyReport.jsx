import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  ArrowLeft, Calendar, Briefcase, User, Clock,
  CheckCircle2, XCircle, TrendingUp, MapPin, FileText,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Map as MapIcon, Activity, AlertCircle
} from 'lucide-react';
import api from '../../services/api';

// Fix Leaflet default marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const siteMarkerIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export default function EmployeeMonthlyReport() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract month from date param (YYYY-MM-DD -> YYYY-MM) or use current
  const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const initialMonth = dateParam.slice(0, 7);

  const [month, setMonth] = useState(initialMonth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/reports/employee/${id}/monthly?month=${month}`);
        setReport(res.data);
      } catch (err) {
        console.error("Failed to fetch monthly report:", err);
        setError("Failed to load monthly report. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id, month]);

  const navigateMonth = (direction) => {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m - 1 + direction, 1);
    const newMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    setMonth(newMonth);
  };

  const mapCenter = useMemo(() => {
    if (!report?.overall?.sitesMapData?.length) return null;
    const sites = report.overall.sitesMapData.filter(s => s.lat && s.long);
    if (!sites.length) return null;
    const avgLat = sites.reduce((s, x) => s + x.lat, 0) / sites.length;
    const avgLong = sites.reduce((s, x) => s + x.long, 0) / sites.length;
    return [avgLat, avgLong];
  }, [report]);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (error) return <div style={{ padding: 24, color: 'var(--danger-400)' }}>{error}</div>;
  if (!report) return null;

  const { overall, dayWise } = report;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': case 'On-Time': return 'var(--success-400)';
      case 'Absent': return 'var(--danger-400)';
      case 'Late': case 'Half-Day': return 'var(--warning-400)';
      default: return 'var(--text-muted)';
    }
  };

  const getStatusBadge = (status) => {
    const cls = status === 'Present' || status === 'On-Time' ? 'badge-active'
      : status === 'Absent' ? 'badge-danger'
      : 'badge-pending';
    return <span className={`badge ${cls}`} style={{ fontSize: 11 }}>{status}</span>;
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost"
          style={{ padding: 8, height: 'auto' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {report.employeeName}
            <span style={{
              fontSize: 14, fontWeight: 500, color: 'var(--text-muted)',
              background: 'var(--surface-2)', padding: '4px 12px', borderRadius: 6
            }}>
              Monthly Report
            </span>
          </h1>
          <p style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span><Briefcase size={14} style={{ display: 'inline', marginRight: 4 }} /> {report.employeeCode}</span>
            <span><User size={14} style={{ display: 'inline', marginRight: 4 }} /> {report.department}</span>
          </p>
        </div>

        {/* Month Navigation */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--surface-2)', borderRadius: 10, padding: '6px 12px',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={() => navigateMonth(-1)}
            style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex'
            }}
          >
            <ChevronLeft size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={16} style={{ color: 'var(--primary-400)' }} />
            <span style={{ fontWeight: 600, fontSize: 15, minWidth: 120, textAlign: 'center' }}>
              {report.monthLabel}
            </span>
          </div>
          <button
            onClick={() => navigateMonth(1)}
            style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex'
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Overall Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Present Days</p>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--success-400)' }}>{overall.presentDays}</h2>
            </div>
            <div className="icon-box" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success-400)' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            out of {overall.totalWorkingDays} working days
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Absent Days</p>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--danger-400)' }}>{overall.absentDays}</h2>
            </div>
            <div className="icon-box" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-400)' }}>
              <XCircle size={20} />
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            Attendance Rate: <strong style={{ color: 'var(--success-400)' }}>{overall.attendanceRate}</strong>
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Total Overtime</p>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--warning-400)' }}>{overall.totalOTFormatted}</h2>
            </div>
            <div className="icon-box" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning-400)' }}>
              <Clock size={20} />
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            Accumulated over the month
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Sites Visited</p>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary-400)' }}>{overall.totalSitesVisited}</h2>
            </div>
            <div className="icon-box" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-400)' }}>
              <MapPin size={20} />
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            Unique sites this month
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Tasks Completed</p>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: '#a78bfa' }}>{overall.totalTasksCompleted}</h2>
            </div>
            <div className="icon-box" style={{ background: 'rgba(167, 139, 250, 0.1)', color: '#a78bfa' }}>
              <FileText size={20} />
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            Total task updates
          </p>
        </div>
      </div>

      {/* Sites Map */}
      {mapCenter && (
        <div className="card" style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <MapIcon size={18} /> Sites Map Overview
            </h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {overall.sitesMapData.filter(s => s.lat && s.long).length} sites plotted
            </span>
          </div>
          <div style={{ height: 350 }}>
            <MapContainer
              center={mapCenter}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {overall.sitesMapData.filter(s => s.lat && s.long).map(site => (
                <React.Fragment key={site.id}>
                  <Marker position={[site.lat, site.long]} icon={siteMarkerIcon}>
                    <Popup>
                      <div style={{ fontSize: 13, minWidth: 160 }}>
                        <strong>{site.name}</strong><br />
                        <span style={{ color: '#666' }}>{site.address || 'No address'}</span><br />
                        <span style={{ color: '#6366f1', fontWeight: 600 }}>
                          {site.visitCount} visit{site.visitCount !== 1 ? 's' : ''} this month
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                  <Circle
                    center={[site.lat, site.long]}
                    radius={100}
                    pathOptions={{
                      color: '#6366f1',
                      fillColor: '#6366f1',
                      fillOpacity: 0.15,
                      weight: 2
                    }}
                  />
                </React.Fragment>
              ))}
            </MapContainer>
          </div>
        </div>
      )}

      {/* Day-Wise Breakdown Table */}
      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={18} /> Day-Wise Breakdown
        </h3>

        <div className="data-table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th>Date</th>
                <th>Day</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>OT</th>
                <th style={{ textAlign: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <MapPin size={12} /> Sites
                  </span>
                </th>
                <th style={{ textAlign: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <FileText size={12} /> Tasks
                  </span>
                </th>
                <th style={{ textAlign: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <Activity size={12} /> Events
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {dayWise.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    No data available for this month.
                  </td>
                </tr>
              ) : (
                dayWise.map((day) => {
                  const isExpanded = expandedDay === day.date;
                  const hasSites = day.sitesList?.length > 0;
                  const hasTasks = day.tasksList?.length > 0;
                  const canExpand = hasSites || hasTasks;

                  return (
                    <React.Fragment key={day.date}>
                      <tr
                        onClick={() => {
                          if (canExpand) setExpandedDay(isExpanded ? null : day.date);
                          else {
                            // Navigate to daily report for this specific day
                            navigate(`/reports/employee/${id}?date=${day.date}`);
                          }
                        }}
                        style={{
                          cursor: 'pointer',
                          background: isExpanded ? 'rgba(99, 102, 241, 0.05)' : undefined,
                          borderLeft: isExpanded ? '3px solid var(--primary-400)' : '3px solid transparent'
                        }}
                        className="hover-row"
                      >
                        <td style={{ textAlign: 'center', padding: '8px 4px' }}>
                          {canExpand ? (
                            isExpanded ?
                              <ChevronUp size={14} style={{ color: 'var(--primary-400)' }} /> :
                              <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>—</span>
                          )}
                        </td>
                        <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: 13 }}>
                          {day.dayNum}
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                          {day.dayShort}
                        </td>
                        <td>{getStatusBadge(day.status)}</td>
                        <td style={{
                          color: day.checkIn ? 'var(--success-400)' : 'var(--text-muted)',
                          fontWeight: day.checkIn ? 500 : 400,
                          fontFamily: 'monospace', fontSize: 13
                        }}>
                          {day.checkIn || '--:--'}
                        </td>
                        <td style={{
                          color: day.checkOut ? 'var(--warning-400)' : 'var(--text-muted)',
                          fontWeight: day.checkOut ? 500 : 400,
                          fontFamily: 'monospace', fontSize: 13
                        }}>
                          {day.checkOut || '--:--'}
                        </td>
                        <td style={{
                          fontFamily: 'monospace', fontSize: 13,
                          color: day.otMinutes > 0 ? 'var(--warning-400)' : 'var(--text-muted)'
                        }}>
                          {day.otFormatted}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            color: day.sitesVisited > 0 ? 'var(--primary-400)' : 'var(--text-muted)',
                            fontWeight: day.sitesVisited > 0 ? 600 : 400
                          }}>
                            {day.sitesVisited}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            color: day.tasksCompleted > 0 ? '#a78bfa' : 'var(--text-muted)',
                            fontWeight: day.tasksCompleted > 0 ? 600 : 400
                          }}>
                            {day.tasksCompleted}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            color: day.timelineCount > 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                            fontSize: 12
                          }}>
                            {day.timelineCount}
                          </span>
                        </td>
                      </tr>

                      {/* Expanded Row Detail */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={10} style={{ padding: 0, background: 'rgba(99, 102, 241, 0.02)' }}>
                            <div style={{
                              padding: '16px 24px',
                              display: 'grid',
                              gridTemplateColumns: hasSites && hasTasks ? '1fr 1fr' : '1fr',
                              gap: 20,
                              borderTop: '1px solid rgba(99, 102, 241, 0.1)'
                            }}>
                              {/* Sites Detail */}
                              {hasSites && (
                                <div>
                                  <h4 style={{
                                    fontSize: 13, fontWeight: 600, marginBottom: 10,
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    color: 'var(--primary-400)'
                                  }}>
                                    <MapPin size={14} /> Sites Visited ({day.sitesList.length})
                                  </h4>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {day.sitesList.map((site, idx) => (
                                      <div key={idx} style={{
                                        background: 'var(--surface-2)',
                                        borderRadius: 8,
                                        padding: '10px 14px',
                                        border: '1px solid var(--border-subtle)'
                                      }}>
                                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{site.name}</div>
                                        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                                          <span>In: <strong style={{ color: 'var(--success-400)' }}>{site.checkIn || '-'}</strong></span>
                                          <span>Out: <strong style={{ color: 'var(--warning-400)' }}>{site.checkOut || '-'}</strong></span>
                                          <span className={`badge ${site.status === 'Completed' ? 'badge-active' : 'badge-pending'}`} style={{ fontSize: 10 }}>
                                            {site.status}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Tasks Detail */}
                              {hasTasks && (
                                <div>
                                  <h4 style={{
                                    fontSize: 13, fontWeight: 600, marginBottom: 10,
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    color: '#a78bfa'
                                  }}>
                                    <FileText size={14} /> Tasks Updated ({day.tasksList.length})
                                  </h4>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {day.tasksList.map((task, idx) => (
                                      <div key={idx} style={{
                                        background: 'var(--surface-2)',
                                        borderRadius: 8,
                                        padding: '10px 14px',
                                        border: '1px solid var(--border-subtle)'
                                      }}>
                                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{task.title}</div>
                                        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                                          <span>Time: <strong>{task.time}</strong></span>
                                          <span>Progress: <strong style={{ color: '#a78bfa' }}>{task.progress}</strong></span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* View Full Daily Report Link */}
                            <div style={{
                              padding: '8px 24px 12px',
                              borderTop: '1px solid var(--border-subtle)',
                              textAlign: 'right'
                            }}>
                              <button
                                className="btn btn-sm btn-ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/reports/employee/${id}?date=${day.date}`);
                                }}
                                style={{ color: 'var(--primary-400)', fontSize: 12 }}
                              >
                                View Full Daily Report →
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
