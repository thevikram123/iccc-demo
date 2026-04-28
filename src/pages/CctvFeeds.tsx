import { img } from '../utils/imagePath';
import React, { useState, useEffect } from 'react';
import { useAuditLog } from '../context/AuditLogContext';

const LOCALITIES = [
  'CONNAUGHT PLACE', 'HAUZ KHAS', 'DWARKA', 'ROHINI',
  'LAJPAT NAGAR', 'CHANDNI CHOWK'
];

const CAMERA_FEEDS = [
  { id: 'CAM-CP-01', location: 'Connaught Place', type: 'PTZ', status: 'LIVE', analytics: ['CROWD_DENSITY'], image: img('/images/pov%201.jpeg')},
  { id: 'CAM-HK-01', location: 'Hauz Khas', type: 'FIXED', status: 'LIVE', analytics: ['ANPR'], image: img('/images/pov%202.jpeg')},
  { id: 'CAM-DW-01', location: 'Dwarka', type: 'PTZ', status: 'LIVE', analytics: ['FACIAL_RECOGNITION', 'DISTRESS_DETECTION'], image: img('/images/pov%203.jpeg')},
  { id: 'CAM-RO-01', location: 'Rohini', type: 'FIXED', status: 'LIVE', analytics: ['MOB_DETECTION'], image: img('/images/pov%204.jpeg')},
  { id: 'CAM-LN-01', location: 'Lajpat Nagar', type: 'PTZ', status: 'LIVE', analytics: ['ANPR', 'POTHOLE_DETECTION'], image: img('/images/pov%205.jpeg')},
  { id: 'CAM-CC-01', location: 'Chandni Chowk', type: 'FIXED', status: 'LIVE', analytics: ['ANPR', 'TRAFFIC_VIOLATION'], image: img('/images/pov%206.jpeg')},
];

export default function CctvFeeds() {
  const [selectedLocality, setSelectedLocality] = useState('ALL');
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const { addLog } = useAuditLog();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Preload camera feed images to improve loading time
  useEffect(() => {
    CAMERA_FEEDS.forEach(feed => {
      const img = new Image();
      img.src = feed.image;
    });
  }, []);

  const filteredFeeds = selectedLocality === 'ALL' 
    ? CAMERA_FEEDS 
    : CAMERA_FEEDS.filter(feed => feed.location.toUpperCase().includes(selectedLocality));

  return (
    <div className="w-full h-full p-6 flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-headline font-black text-3xl tracking-tighter text-black uppercase">LIVE CCTV FEEDS</h1>
          <p className="font-mono text-xs text-black mt-1 tracking-widest">ICCC VIDEO MANAGEMENT SYSTEM</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              addLog('UI_ACTION', 'Filtered CCTV Feeds by ALL');
              setSelectedLocality('ALL');
            }}
            className={`px-4 py-2 font-mono text-xs border ${selectedLocality === 'ALL' ? 'bg-primary-fixed text-black border-primary-fixed' : 'bg-surface-container border-black/10 text-black hover:bg-surface-container-high'}`}
          >
            ALL
          </button>
          {LOCALITIES.slice(0, 4).map(loc => (
            <button 
              key={loc}
              onClick={() => {
                addLog('UI_ACTION', `Filtered CCTV Feeds by ${loc}`);
                setSelectedLocality(loc);
              }}
              className={`px-4 py-2 font-mono text-xs border ${selectedLocality === loc ? 'bg-primary-fixed text-black border-primary-fixed' : 'bg-surface-container border-black/10 text-black hover:bg-surface-container-high'}`}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {filteredFeeds.map(feed => (
          <div key={feed.id} className="bg-surface-container-lowest border border-black/10 rounded overflow-hidden flex flex-col relative group">
            {/* Simulated Video Feed */}
            <div className="relative aspect-video bg-white overflow-hidden">
              <img 
                src={feed.image} 
                alt={feed.location} 
                loading="lazy"
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                referrerPolicy="no-referrer"
              />
              
              {/* Overlay UI */}
              <div className="absolute top-2 left-2 flex items-center gap-2">
                <div className="bg-error text-black font-mono text-[9px] px-1.5 py-0.5 rounded-sm flex items-center gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span> REC
                </div>
                <div className="bg-black/60 backdrop-blur-sm text-black font-mono text-[9px] px-1.5 py-0.5 rounded-sm border border-black/10">
                  {feed.id}
                </div>
              </div>

              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm bg-primary-fixed text-black px-1 border border-black font-mono text-[9px] px-1.5 py-0.5 rounded-sm border border-primary-fixed/30">
                {time}
              </div>

              {/* Simulated AI Bounding Boxes */}
              {feed.analytics.includes('FACIAL_RECOGNITION') && (
                <div className="absolute top-[30%] left-[40%] w-16 h-16 border-2 border-primary-fixed bg-primary-fixed/10 flex flex-col justify-end">
                  <div className="bg-primary-fixed text-black font-mono text-[6px] px-1 font-bold">MATCH: 98%</div>
                </div>
              )}
              {feed.analytics.includes('ANPR') && (
                <div className="absolute bottom-[20%] right-[30%] w-24 h-8 border-2 border-secondary bg-secondary/10 flex flex-col justify-end">
                  <div className="bg-secondary text-black font-mono text-[6px] px-1 font-bold">DL 1C AA 1234</div>
                </div>
              )}
              {feed.analytics.includes('DISTRESS_DETECTION') && (
                <div className="absolute top-[40%] left-[50%] w-20 h-32 border-2 border-error bg-error/20 flex flex-col justify-end animate-pulse">
                  <div className="bg-error text-black font-mono text-[6px] px-1 font-bold">DISTRESS DETECTED</div>
                </div>
              )}

              {/* Crosshair */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
                <div className="w-full h-px bg-white/50"></div>
                <div className="h-full w-px bg-white/50 absolute"></div>
                <div className="w-8 h-8 border border-black/50 rounded-full absolute"></div>
              </div>
            </div>

            {/* Feed Metadata */}
            <div className="p-3 bg-surface-container-highest border-t border-black/10">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-mono text-xs text-black font-bold truncate pr-2">{feed.location}</h3>
                <span className="font-mono text-[9px] bg-primary-fixed text-black px-1.5 py-0.5 font-bold border border-primary-fixed">
                  {feed.type}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {feed.analytics.map(a => (
                  <span key={a} className={`font-mono text-[8px] px-1.5 py-0.5 rounded-sm ${
                    a === 'DISTRESS_DETECTION' || a === 'MOB_DETECTION' ? 'bg-error/20 text-error border border-error/30' : 'bg-surface-container-low text-black border border-secondary/30'
                  }`}>
                    {a.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
