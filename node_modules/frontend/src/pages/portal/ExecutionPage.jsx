import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, MapPin, ClipboardList, Loader2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import ExecutionTracker from '../../components/ExecutionTracker';

export default function ExecutionPage() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [type, id]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = type === 'site' ? `/sites/${id}` : `/tasks/${id}`;
      const res = await api.get(endpoint);
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch target data:', err);
      setError(`Failed to load ${type} details.`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <Loader2 className="spinner" size={40} color="var(--primary-400)" />
        <p style={{ color: 'var(--text-muted)' }}>Loading execution details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <AlertCircle size={48} color="var(--danger-400)" style={{ marginBottom: 16 }} />
        <h3>{error}</h3>
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: 800, margin: '0 auto', padding: '20px 16px' }}>
      {/* Navigation Header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button 
          className="btn btn-ghost" 
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', marginLeft: -12 }}
        >
          <ChevronLeft size={20} />
          Back to {type === 'site' ? 'My Sites' : 'Tasks'}
        </button>
      </div>

      {/* Hero Header */}
      <div className="card" style={{ 
        padding: 24, 
        marginBottom: 24, 
        background: 'linear-gradient(135deg, var(--surface-2) 0%, var(--surface-1) 100%)',
        border: '1px solid var(--border-subtle)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.05 }}>
           {type === 'site' ? <MapPin size={120} /> : <ClipboardList size={120} />}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div style={{ 
            width: 56, height: 56, borderRadius: 16, 
            background: 'rgba(99,102,241,0.1)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            {type === 'site' ? <MapPin size={28} color="var(--primary-400)" /> : <ClipboardList size={28} color="var(--primary-400)" />}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-400)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
               {type === 'site' ? `Site ID: ${data.site_id}` : `Task ID: #${data.id}`}
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>{data.name || data.title || data.content}</h1>
          </div>
        </div>

        {data.address || data.location ? (
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
             <MapPin size={14} /> {data.address || data.location}
          </p>
        ) : null}
      </div>

      {/* Tracker Card */}
      <ExecutionTracker 
        targetType={type}
        targetId={id}
        targetData={data}
        onComplete={() => {
           // Maybe navigate back after completion?
           // Or just let them stay
        }}
      />
      
      <div style={{ marginTop: 32, textAlign: 'center', opacity: 0.5 }}>
         <p style={{ fontSize: 12 }}>Execution Mode • Field Employee Management System</p>
      </div>
    </div>
  );
}
