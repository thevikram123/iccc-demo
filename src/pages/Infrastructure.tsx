import { img } from '../utils/imagePath';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../components/Layout';
import { useAuditLog } from '../context/AuditLogContext';

interface Cluster {
  id: string;
  name: string;
  health: number;
  activeNodes: number;
  totalNodes: number;
  image: string;
}

interface Junction {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'warning';
  cameras: number;
  switchImage: string;
  cctvImage: string;
}

const CLUSTERS: Cluster[] = [
  { id: 'cp', name: 'CONNAUGHT PLACE', health: 98, activeNodes: 450, totalNodes: 452, image: img('/images/connaught place.jpeg')},
  { id: 'hk', name: 'HAUZ KHAS', health: 85, activeNodes: 310, totalNodes: 320, image: img('/images/hauz khas.jpeg')},
  { id: 'dw', name: 'DWARKA', health: 99, activeNodes: 890, totalNodes: 900, image: img('/images/dwarka.jpeg')},
  { id: 'ro', name: 'ROHINI', health: 92, activeNodes: 1500, totalNodes: 1600, image: img('/images/rohini.jpeg')},
];

const JUNCTIONS: Record<string, Junction[]> = {
  'cp': [
    { id: 'j1', name: 'INNER_CIRCLE_N', status: 'online', cameras: 12, switchImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=400', cctvImage: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=400' },
    { id: 'j2', name: 'RADIAL_ROAD_3', status: 'warning', cameras: 8, switchImage: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=400', cctvImage: 'https://images.unsplash.com/photo-1548092372-0d1bd40894a3?auto=format&fit=crop&q=80&w=400' },
    { id: 'j3', name: 'PALIKA_BAZAR_ENT', status: 'offline', cameras: 4, switchImage: 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?auto=format&fit=crop&q=80&w=400', cctvImage: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=400' },
    { id: 'j4', name: 'OUTER_CIRCLE_S', status: 'online', cameras: 16, switchImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400', cctvImage: 'https://images.unsplash.com/photo-1548092372-0d1bd40894a3?auto=format&fit=crop&q=80&w=400' },
  ],
  'hk': [
    { id: 'hk1', name: 'INNER_CIRCLE_N', status: 'online', cameras: 12, switchImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=400', cctvImage: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=400' },
    { id: 'hk2', name: 'RADIAL_ROAD_3', status: 'warning', cameras: 8, switchImage: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=400', cctvImage: 'https://images.unsplash.com/photo-1548092372-0d1bd40894a3?auto=format&fit=crop&q=80&w=400' },
    { id: 'hk3', name: 'PALIKA_BAZAR_ENT', status: 'offline', cameras: 4, switchImage: 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?auto=format&fit=crop&q=80&w=400', cctvImage: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=400' },
    { id: 'hk4', name: 'OUTER_CIRCLE_S', status: 'online', cameras: 16, switchImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400', cctvImage: 'https://images.unsplash.com/photo-1548092372-0d1bd40894a3?auto=format&fit=crop&q=80&w=400' },
  ],
  'dw': [
    { id: 'dw1', name: 'INNER_CIRCLE_N', status: 'online', cameras: 12, switchImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=400', cctvImage: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=400' },
    { id: 'dw2', name: 'RADIAL_ROAD_3', status: 'warning', cameras: 8, switchImage: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=400', cctvImage: 'https://images.unsplash.com/photo-1548092372-0d1bd40894a3?auto=format&fit=crop&q=80&w=400' },
    { id: 'dw3', name: 'PALIKA_BAZAR_ENT', status: 'offline', cameras: 4, switchImage: 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?auto=format&fit=crop&q=80&w=400', cctvImage: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=400' },
    { id: 'dw4', name: 'OUTER_CIRCLE_S', status: 'online', cameras: 16, switchImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400', cctvImage: 'https://images.unsplash.com/photo-1548092372-0d1bd40894a3?auto=format&fit=crop&q=80&w=400' },
  ],
  'ro': [
    { id: 'ro1', name: 'INNER_CIRCLE_N', status: 'online', cameras: 12, switchImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=400', cctvImage: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=400' },
    { id: 'ro2', name: 'RADIAL_ROAD_3', status: 'warning', cameras: 8, switchImage: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=400', cctvImage: 'https://images.unsplash.com/photo-1548092372-0d1bd40894a3?auto=format&fit=crop&q=80&w=400' },
    { id: 'ro3', name: 'PALIKA_BAZAR_ENT', status: 'offline', cameras: 4, switchImage: 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?auto=format&fit=crop&q=80&w=400', cctvImage: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=400' },
    { id: 'ro4', name: 'OUTER_CIRCLE_S', status: 'online', cameras: 16, switchImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400', cctvImage: 'https://images.unsplash.com/photo-1548092372-0d1bd40894a3?auto=format&fit=crop&q=80&w=400' },
  ]
};

export default function Infrastructure() {
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const navigate = useNavigate();
  const { addLog } = useAuditLog();

  // Preload cluster images to improve loading time
  React.useEffect(() => {
    CLUSTERS.forEach(cluster => {
      const img = new Image();
      img.src = cluster.image;
    });
  }, []);

  return (
    <div className="w-full h-full flex flex-col p-8 overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-headline font-black text-3xl tracking-tighter text-black uppercase">
            {selectedCluster ? 'JUNCTION LEVEL DATA' : 'DELHI LOCALITIES DASHBOARD'}
          </h1>
          <p className="font-mono text-xs text-black font-bold mt-1 tracking-widest">
            {selectedCluster ? `VIEWING LOCALITY: ${CLUSTERS.find(c => c.id === selectedCluster)?.name}` : 'OVERVIEW OF ALL MONITORED LOCALITIES'}
          </p>
        </div>
        {selectedCluster && (
          <button 
            onClick={() => {
              addLog('UI_ACTION', 'Clicked BACK TO LOCALITIES');
              setSelectedCluster(null);
            }}
            className="px-6 py-2 bg-surface-container-highest text-black font-mono text-xs tracking-widest uppercase border border-black/10 hover:bg-white hover:text-black transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            BACK TO LOCALITIES
          </button>
        )}
      </div>

      {!selectedCluster ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CLUSTERS.map(cluster => (
            <div 
              key={cluster.id} 
              onClick={() => {
                addLog('UI_ACTION', `Selected Locality: ${cluster.name}`);
                setSelectedCluster(cluster.id);
              }}
              className="glass-panel border border-black/10 overflow-hidden cursor-pointer group hover:border-primary-fixed transition-colors"
            >
              <div className="h-48 relative overflow-hidden">
                <img src={cluster.image} alt={cluster.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#ffffff] to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <h2 className="font-mono text-xl font-bold text-black">{cluster.name}</h2>
                </div>
              </div>
              <div className="p-6 grid grid-cols-3 gap-4 bg-surface-container-lowest">
                <div>
                  <div className="text-black font-bold font-mono text-[10px] uppercase tracking-widest mb-1">Health</div>
                  <div className={cn("font-mono text-xl font-bold inline-block px-1.5 py-0.5", cluster.health < 90 ? "bg-error text-black" : "bg-primary-fixed text-black")}>
                    {cluster.health}%
                  </div>
                </div>
                <div>
                  <div className="text-black font-bold font-mono text-[10px] uppercase tracking-widest mb-1">Active Nodes</div>
                  <div className="font-mono text-xl text-black font-bold">{cluster.activeNodes}</div>
                </div>
                <div>
                  <div className="text-black font-bold font-mono text-[10px] uppercase tracking-widest mb-1">Total Nodes</div>
                  <div className="font-mono text-xl text-black font-bold">{cluster.totalNodes}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(JUNCTIONS[selectedCluster] || []).map(junction => (
            <div key={junction.id} className="glass-panel border border-black/10 p-6 flex flex-col gap-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-mono text-lg font-bold text-black">{junction.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={cn("w-2 h-2 rounded-full", 
                      junction.status === 'online' ? 'bg-primary-fixed' : 
                      junction.status === 'warning' ? 'bg-tertiary-container' : 'bg-error'
                    )}></span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-black font-bold">
                      STATUS: {junction.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-black font-bold font-mono text-[10px] uppercase tracking-widest mb-1">Cameras</div>
                  <div className="font-mono text-xl text-black font-bold">{junction.cameras}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative h-32 border border-black/10 overflow-hidden group">
                  <img src={junction.switchImage} alt="Network Switch" loading="lazy" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                  <div className="absolute bottom-2 left-2 bg-black px-2 py-1 font-mono text-[9px] text-white uppercase font-bold">Switch Gear</div>
                </div>
                <div className="relative h-32 border border-black/10 overflow-hidden group">
                  <img src={junction.cctvImage} alt="CCTV Camera" loading="lazy" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                  <div className="absolute bottom-2 left-2 bg-black px-2 py-1 font-mono text-[9px] text-white uppercase font-bold">CCTV Array</div>
                </div>
              </div>

              <div className="flex gap-2 mt-auto">
                <button 
                  onClick={() => {
                    addLog('NAVIGATION', `Navigated to Diagnostics for ${junction.name}`);
                    navigate('/area-diagnostics', { state: { area: junction.name } });
                  }}
                  className="flex-1 py-2 bg-surface-container-highest text-black font-mono text-[10px] tracking-widest uppercase hover:bg-primary-fixed hover:text-black transition-colors"
                >
                  DIAGNOSTICS
                </button>
                <button 
                  onClick={() => addLog('DEVICE_ACTION', `Initiated reboot sequence for ${junction.name} equipment`)}
                  className="flex-1 py-2 bg-surface-container-highest text-black font-mono text-[10px] tracking-widest uppercase hover:bg-primary-fixed hover:text-black transition-colors"
                >
                  REBOOT
                </button>
              </div>
            </div>
          ))}
          {(!JUNCTIONS[selectedCluster] || JUNCTIONS[selectedCluster].length === 0) && (
            <div className="col-span-full p-12 text-center font-mono text-black border border-black/10 border-dashed">
              NO JUNCTION DATA AVAILABLE FOR THIS LOCALITY
            </div>
          )}
        </div>
      )}
    </div>
  );
}
