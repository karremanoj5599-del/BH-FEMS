import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import { MapIcon, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GEOFENCE_RADIUS = 500; // 500 meters

export default function LiveMap({ activeTab, location, liveLocations, selectedSession, timeline }) {
  const navigate = useNavigate();

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', height: 400 }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
          <MapIcon size={18} color="var(--primary-400)" />
          Real-time Location
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Navigation size={12} /> Live polling active
        </span>
      </div>
      <div style={{ height: 'calc(100% - 53px)', width: '100%' }}>
        <MapContainer center={location} zoom={activeTab === 'monitoring' ? 12 : 15} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 0 }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {activeTab === 'personal' ? (
            <>
              <Marker position={location}>
                <Popup>Current Location: Near Site SIT-001</Popup>
              </Marker>
              <Circle 
                center={location} 
                radius={GEOFENCE_RADIUS} 
                pathOptions={{ color: 'var(--primary-400)', fillColor: 'var(--primary-400)', fillOpacity: 0.15 }} 
              />
            </>
          ) : (
            <>
              {liveLocations.map(emp => (
                <Marker 
                  key={emp.id} 
                  position={[emp.latest_lat || emp.lat, emp.latest_long || emp.long]}
                  eventHandlers={{
                    click: () => navigate(`/attendance/timeline/${emp.id}`)
                  }}
                >
                  <Popup>
                    <div style={{ minWidth: 150 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: 14 }}>{emp.employee_name}</h4>
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{emp.department}</p>
                      <div style={{ marginTop: 8, fontSize: 11 }}>
                        Status: <span style={{ color: 'var(--success-400)' }}>Active</span><br/>
                        Check-in: {new Date(emp.check_in).toLocaleTimeString()}
                      </div>
                      <button 
                        className="btn btn-primary btn-sm" 
                        style={{ width: '100%', marginTop: 8, height: 28, fontSize: 11 }}
                        onClick={() => navigate(`/attendance/timeline/${emp.id}`)}
                      >
                        View Timeline
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
              
              {selectedSession && timeline.length > 1 && (
                <Polyline 
                  positions={timeline.map(t => [t.lat, t.long])}
                  pathOptions={{ color: 'var(--primary-400)', weight: 3, dashArray: '5, 10' }}
                />
              )}
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
