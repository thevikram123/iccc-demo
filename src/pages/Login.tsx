import { img } from '../utils/imagePath';
import React, { useState, useEffect } from 'react';

const PRELOAD_IMAGES = [
  img('/images/Raju 1.jpeg'),
  img('/images/Raju 2.jpeg'),
  img('/images/Raju 3.jpeg'),
  img('/images/Raju 4.jpeg'),
  img('/images/Raju Motorcycle.jpeg'),
  img('/images/blob zoom .jpeg'),
  img('/images/blob.jpeg'),
  img('/images/camera fov tampering.png'),
  img('/images/child loitering.png'),
  img('/images/connaught place.jpeg'),
  img('/images/distress woman.png'),
  img('/images/dwarka.jpeg'),
  img('/images/escalator running.png'),
  img('/images/garbage monitoring.png'),
  img('/images/hauz khas.jpeg'),
  img('/images/missing child.jpeg'),
  img('/images/mob gathering.png'),
  img('/images/pothole detection.png'),
  img('/images/pov 1.jpeg'),
  img('/images/pov 2.jpeg'),
  img('/images/pov 3.jpeg'),
  img('/images/pov 4.jpeg'),
  img('/images/pov 5.jpeg'),
  img('/images/pov 6.jpeg'),
  img('/images/rohini.jpeg'),
  img('/images/smoke fire detection.png'),
  img('/images/streetlight.png'),
  img('/images/survey 1.jpeg'),
  img('/images/survey 2.jpeg'),
  img('/images/survey 3.png'),
  img('/images/survey 4.png'),
  img('/images/sus 1.jpeg'),
  img('/images/vip.jpeg')
];

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Preload all critical images on login page load
    PRELOAD_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userId === 'admin123' && password === 'eypwd123') {
      onLogin();
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center font-mono">
      <div className="w-full max-w-md p-8 bg-surface-container border border-black/10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="bg-primary-fixed text-black w-16 h-16 flex items-center justify-center border border-black/10 mb-4 mx-auto">
            <span className="material-symbols-outlined text-5xl">admin_panel_settings</span>
          </div>
          <h1 className="font-headline font-black text-2xl tracking-tighter text-black uppercase">SYSTEM LOGIN</h1>
          <p className="text-xs text-black tracking-widest mt-2">AUTHORIZED PERSONNEL ONLY</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] text-black uppercase tracking-widest mb-2">User ID</label>
            <input 
              type="text" 
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full bg-white border border-black/20 text-black p-3 focus:outline-none focus:border-primary-fixed transition-colors"
              placeholder="Enter User ID"
            />
          </div>
          <div>
            <label className="block text-[10px] text-black uppercase tracking-widest mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-black/20 text-black p-3 focus:outline-none focus:border-primary-fixed transition-colors"
              placeholder="Enter Password"
            />
          </div>

          {error && (
            <div className="text-error text-xs text-center bg-error/10 py-2 border border-error/20">
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full py-3 bg-primary-fixed text-black font-bold tracking-widest uppercase hover:bg-white transition-colors"
          >
            AUTHENTICATE
          </button>
        </form>
      </div>
    </div>
  );
}
