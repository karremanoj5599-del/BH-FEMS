import React from 'react';
import { MapPin, Map as MapIcon } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const createColorIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const taskStatusIcons = {
  'todo': createColorIcon('violet'),
  'in-progress': createColorIcon('orange'),
  'review': createColorIcon('blue'),
  'done': createColorIcon('green'),
};

const taskStatusColors = {
  'todo': '#8b5cf6',
  'in-progress': '#f59e0b',
  'review': '#3b82f6',
  'done': '#10b981',
};

const COLUMN_TITLES = {
  'todo': 'Pending',
  'in-progress': 'In Progress',
  'review': 'Under Review',
  'done': 'Completed'
};

const PRIORITY_GRADIENTS = {
  high: { bg: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.04) 100%)', accent: '#ef4444', accentBg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
  medium: { bg: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(245,158,11,0.04) 100%)', accent: '#f59e0b', accentBg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
  low: { bg: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.04) 100%)', accent: '#10b981', accentBg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
};

export default function MapTab({ filteredAllTasks, sites, tasks }) {
  const mappableTasks = filteredAllTasks.map(task => {
    const linkedSite = sites.find(s => s.id === task.site_id);
    return {
      ...task,
      mapLat: linkedSite?.lat ? parseFloat(linkedSite.lat) : null,
      mapLng: linkedSite?.long ? parseFloat(linkedSite.long) : null,
      siteName: linkedSite?.name || task.site_name || task.site || 'Unknown',
      geofenceRadius: linkedSite?.geofence_radius || 100,
    };
  });
  const tasksWithCoords = mappableTasks.filter(t => t.mapLat && t.mapLng);
  const center = tasksWithCoords.length > 0
    ? [
        tasksWithCoords.reduce((sum, t) => sum + t.mapLat, 0) / tasksWithCoords.length,
        tasksWithCoords.reduce((sum, t) => sum + t.mapLng, 0) / tasksWithCoords.length
      ]
    : [20.5937, 78.9629];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card" style={{ height: 550, padding: 0, overflow: 'hidden', position: 'relative', borderRadius: 16, flex: 1 }}>
        {/* Legend */}
        <div style={{
          position: 'absolute', top: 12, right: 12, zIndex: 1000,
          background: 'rgba(15, 17, 25, 0.92)', backdropFilter: 'blur(12px)',
          borderRadius: 12, padding: '14px 18px', border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Task Legend</div>
          {[
            { color: '#8b5cf6', label: 'Pending' },
            { color: '#f59e0b', label: 'In Progress' },
            { color: '#3b82f6', label: 'Under Review' },
            { color: '#10b981', label: 'Completed' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0, boxShadow: `0 0 6px ${item.color}60` }} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Task count badge */}
        <div style={{
          position: 'absolute', bottom: 12, left: 12, zIndex: 1000,
          background: 'rgba(15, 17, 25, 0.92)', backdropFilter: 'blur(12px)',
          borderRadius: 10, padding: '8px 14px', border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          <MapPin size={14} color="var(--primary-400)" />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
            {tasksWithCoords.length} of {tasks.length} tasks on map
          </span>
        </div>

        {/* Priority summary badges */}
        <div style={{
          position: 'absolute', top: 12, left: 12, zIndex: 1000, display: 'flex', gap: 6
        }}>
          {[{status: 'todo', label: 'Pending'}, {status: 'in-progress', label: 'Active'}, {status: 'review', label: 'Review'}, {status: 'done', label: 'Done'}].map(s => {
             const count = tasksWithCoords.filter(t => t.status === s.status).length;
             if (count === 0) return null;
             return (
               <div key={s.status} style={{
                 background: 'rgba(15, 17, 25, 0.92)', backdropFilter: 'blur(12px)',
                 borderRadius: 8, padding: '6px 12px', border: '1px solid rgba(255,255,255,0.08)',
                 display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: taskStatusColors[s.status]
               }}>
                 <div style={{ width: 7, height: 7, borderRadius: '50%', background: taskStatusColors[s.status] }} />
                 {count} {s.label}
               </div>
             );
          })}
        </div>

        {tasksWithCoords.length > 0 ? (
          <MapContainer
            center={center}
            zoom={12}
            style={{ height: '100%', width: '100%', borderRadius: 16 }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {tasksWithCoords.map(task => {
                const statusColor = taskStatusColors[task.status] || '#8b5cf6';
                const icon = taskStatusIcons[task.status] || taskStatusIcons['todo'];
                const pStyle = PRIORITY_GRADIENTS[task.priority] || PRIORITY_GRADIENTS.medium;

                return (
                  <span key={task.id}>
                    <Circle
                      center={[task.mapLat, task.mapLng]}
                      radius={task.geofenceRadius}
                      pathOptions={{
                        color: statusColor, fillColor: statusColor, fillOpacity: 0.08, weight: 1.5, dashArray: '6 4'
                      }}
                    />
                    <Marker position={[task.mapLat, task.mapLng]} icon={icon}>
                      <Popup>
                        <div style={{ minWidth: 220, fontFamily: 'Inter, sans-serif' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                            <span style={{
                              padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700,
                              fontFamily: 'monospace', background: '#6366f120', color: '#818cf8'
                            }}>#{task.id}</span>
                            <strong style={{ fontSize: 13 }}>{task.title || task.content}</strong>
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                            <span style={{
                              padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                              background: `${statusColor}20`, color: statusColor
                            }}>
                              {COLUMN_TITLES[task.status] || task.status}
                            </span>
                            <span style={{
                              padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                              background: `${pStyle.accent}20`, color: pStyle.accent, textTransform: 'capitalize'
                            }}>
                              {task.priority} Priority
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: '#888', borderTop: '1px solid #eee', paddingTop: 6 }}>
                            <div style={{ marginBottom: 4 }}>📍 Site: {task.siteName}</div>
                            <div style={{ marginBottom: 4 }}>👤 {task.assignee_name || 'Unassigned'}</div>
                            {(task.due_date || task.deadline) && <div>📅 Due: {task.due_date || task.deadline}</div>}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  </span>
                );
              })}
          </MapContainer>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, opacity: 0.5 }}>
            <MapIcon size={64} />
            <p style={{ fontSize: 14, fontWeight: 500 }}>No tasks with site locations found</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Assign tasks to sites with GPS coordinates to see them on the map</p>
          </div>
        )}
      </div>
    </div>
  );
}
