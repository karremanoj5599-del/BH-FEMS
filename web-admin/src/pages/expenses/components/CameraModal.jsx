import React from 'react';
import { X } from 'lucide-react';

export default function CameraModal({ 
  tempCapturedImage, videoRef, closeCamera, 
  capturePhoto, retakePhoto, usePhoto, canvasRef 
}) {
  return (
    <div className="modal-overlay" style={{ zIndex: 2000 }}>
      <div className="modal" style={{ maxWidth: 400, padding: 0, overflow: 'hidden' }}>
        <div style={{ position: 'relative', background: '#000', aspectRatio: '4/3' }}>
          {!tempCapturedImage ? (
            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <img src={tempCapturedImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="captured" />
          )}
          <button className="btn btn-ghost" onClick={closeCamera} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.4)' }}>
            <X color="white" />
          </button>
        </div>
        <div style={{ padding: 20, textAlign: 'center' }}>
          {!tempCapturedImage ? (
            <button className="btn btn-primary" onClick={capturePhoto} style={{ width: 64, height: 64, borderRadius: '50%', padding: 0 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', border: '4px solid white' }} />
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary" onClick={retakePhoto} style={{ flex: 1 }}>Retake</button>
              <button className="btn btn-primary" onClick={usePhoto} style={{ flex: 1 }}>Use Photo</button>
            </div>
          )}
        </div>
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}
