import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { MapIcon, MapPin } from 'lucide-react';
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

const siteIcons = {
  new: createColorIcon('green'),
  active: createColorIcon('blue'),
  inProgress: createColorIcon('orange'),
  completed: createColorIcon('violet'),
  inactive: createColorIcon('red'),
};

export default function SiteMap({ filteredSites, assignments }) {
  const withCoords = filteredSites.filter(s => s.lat && s.long);
  
  const mapCenter = (() => {
    if (withCoords.length === 0) return [20.5937, 78.9629];
    const avgLat = withCoords.reduce((sum, s) => sum + parseFloat(s.lat), 0) / withCoords.length;
    const avgLng = withCoords.reduce((sum, s) => sum + parseFloat(s.long), 0) / withCoords.length;
    return [avgLat, avgLng];
  })();

  return (
    <div className="card" style={{ height: 550, padding: 0, overflow: 'hidden', position: 'relative', borderRadius: 16 }}>
      {/* Map Legend */}
      <div style={{
        position: 'absolute', top: 12, right: 12, zIndex: 1000,
        background: 'rgba(15, 17, 25, 0.92)', backdropFilter: 'blur(12px)',
        borderRadius: 12, padding: '14px 18px',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Site Legend</div>
        {[
          { color: '#2ecc40', label: 'New Sites (< 7 days)' },
          { color: '#ff851b', label: 'In Progress' },
          { color: '#b266ff', label: 'Completed' },
          { color: '#4a90d9', label: 'Active' },
          { color: '#e74c3c', label: 'Inactive / Archived' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0, boxShadow: `0 0 6px ${item.color}60` }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Site count badge */}
      <div style={{
        position: 'absolute', bottom: 12, left: 12, zIndex: 1000,
        background: 'rgba(15, 17, 25, 0.92)', backdropFilter: 'blur(12px)',
        borderRadius: 10, padding: '8px 14px',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', gap: 8
      }}>
        <MapPin size={14} color="var(--primary-400)" />
        <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
          {withCoords.length} of {filteredSites.length} sites on map
        </span>
      </div>

      {withCoords.length > 0 ? (
        <MapContainer
          center={mapCenter}
          zoom={12}
          style={{ height: '100%', width: '100%', borderRadius: 16 }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {withCoords.map(site => {
            const createdDate = new Date(site.created_at);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const isNew = createdDate >= sevenDaysAgo;
            const isInProgress = ['En Route', 'On Site'].includes(site.execution_status);
            const isCompleted = ['Completed', 'Finished'].includes(site.execution_status);
            const isInactive = ['Inactive', 'Archived'].includes(site.status);

            let icon = siteIcons.active;
            let circleColor = '#4a90d9';
            if (isInactive) { icon = siteIcons.inactive; circleColor = '#e74c3c'; }
            else if (isCompleted) { icon = siteIcons.completed; circleColor = '#b266ff'; }
            else if (isInProgress) { icon = siteIcons.inProgress; circleColor = '#ff851b'; }
            else if (isNew) { icon = siteIcons.new; circleColor = '#2ecc40'; }

            return (
              <React.Fragment key={site.id}>
                {/* Geofence circle */}
                <Circle
                  center={[parseFloat(site.lat), parseFloat(site.long)]}
                  radius={site.geofence_radius || 100}
                  pathOptions={{
                    color: circleColor,
                    fillColor: circleColor,
                    fillOpacity: 0.1,
                    weight: 1.5,
                    dashArray: '6 4'
                  }}
                />
                {/* Site marker */}
                <Marker
                  position={[parseFloat(site.lat), parseFloat(site.long)]}
                  icon={icon}
                >
                  <Popup>
                    <div style={{ minWidth: 200, fontFamily: 'Inter, sans-serif' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <span style={{
                          padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700,
                          fontFamily: 'monospace', background: '#6366f120', color: '#818cf8'
                        }}>#{site.site_id}</span>
                        <strong style={{ fontSize: 14 }}>{site.name}</strong>
                      </div>
                      <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>
                        📍 {site.address || 'No address'}
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                          background: site.status === 'Active' ? '#2ecc4020' : '#e74c3c20',
                          color: site.status === 'Active' ? '#2ecc40' : '#e74c3c'
                        }}>{site.status}</span>
                        {isNew && <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: '#2ecc4020', color: '#2ecc40' }}>New</span>}
                        {isInProgress && <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: '#ff851b20', color: '#ff851b' }}>In Progress</span>}
                        {isCompleted && <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: '#b266ff20', color: '#b266ff' }}>Completed</span>}
                      </div>
                      <div style={{ fontSize: 11, color: '#888', borderTop: '1px solid #eee', paddingTop: 6 }}>
                        <div>🎯 Geofence: {site.geofence_radius || 100}m radius</div>
                        <div>👥 {(assignments[site.id] || []).length} personnel assigned</div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapContainer>
      ) : (
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, opacity: 0.5 }}>
          <MapIcon size={64} />
          <p style={{ fontSize: 14, fontWeight: 500 }}>No sites with GPS coordinates found</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Add latitude & longitude to your sites to see them on the map</p>
        </div>
      )}
    </div>
  );
}
