import { img } from '../utils/imagePath';
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Polygon, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';
import { useAuditLog } from '../context/AuditLogContext';
import { IS_OFFLINE_DEMO, OFFLINE_TILE_ATTRIBUTION, OFFLINE_TILE_URL } from '../utils/offlineDemo';

function MapUpdater() {
  const map = useMap();
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      map.invalidateSize();
    }, 300);
    return () => clearTimeout(timeout);
  }, [map]);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);

  return null;
}

// Fix for default marker icon in react-leaflet when online tile assets are available.
if (!IS_OFFLINE_DEMO) {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

// Custom icon for nodes
const nodeIcon = new L.DivIcon({
  className: 'bg-transparent',
  html: `<div class="w-3 h-3 bg-[#ffe600] shadow-[0_0_10px_rgba(255,230,0,0.8)] rounded-full"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const alertIcon = new L.DivIcon({
  className: 'bg-transparent',
  html: `<div class="w-4 h-4 bg-[#ffb4ab] animate-pulse shadow-[0_0_15px_rgba(255,180,171,0.8)] rounded-full"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const createClusterCustomIcon = function (cluster: any) {
  return new L.DivIcon({
    html: `<div class="w-8 h-8 bg-primary-fixed border-2 border-black rounded-full flex items-center justify-center text-black font-extrabold font-mono text-[10px] shadow-[0_0_15px_rgba(255,230,0,0.4)]"><span>${cluster.getChildCount()}</span></div>`,
    className: 'bg-transparent',
    iconSize: L.point(32, 32, true),
  });
};

const SOUTH_DELHI: [number, number] = [28.5355, 77.2410];

const ANALYTICS_TYPES = [
  'ANPR_MATCH', 
  'FACIAL_RECOGNITION_ALERT', 
  'MOB_GATHERING', 
  'POTHOLE_DETECTED', 
  'GARBAGE_OVERFLOW', 
  'DISTRESS_WOMAN_ALONE'
];

// Mock Data for AI Analytics Overlays
const POTHOLE_ZONES = [
  { center: [28.5300, 77.2300], radius: 300 },
  { center: [28.5600, 77.2600], radius: 450 },
];

const CRIME_PRONE_AREAS = [
  { positions: [[28.5400, 77.2400], [28.5500, 77.2400], [28.5450, 77.2500]] },
];

const DARK_SPOTS = [
  { center: [28.5200, 77.2200], radius: 250 },
  { center: [28.5700, 77.2800], radius: 350 },
];

const HIGH_FOOTFALL = [
  { positions: [[28.5355, 77.2355], [28.5455, 77.2455], [28.5555, 77.2555]] },
];

const WOMEN_SAFETY_PRIORITY = [
  { center: [28.5555, 77.2555], radius: 500 },
];

const TRAFFIC_ZONES = [
  { positions: [[28.5410, 77.2000], [28.5450, 77.2100], [28.5500, 77.2150]], color: '#ff0000' }, // Heavy
  { positions: [[28.5200, 77.1900], [28.5250, 77.1950], [28.5300, 77.2000]], color: '#ffba38' }, // Moderate
];

const AQI_ZONES = [
  { center: [28.5400, 77.2000], radius: 1000, aqi: 350, color: '#93000a' }, // Severe
  { center: [28.5200, 77.2200], radius: 800, aqi: 250, color: '#ffba38' },  // Poor
];

// Generate random points around South Delhi for the heatmap and clusters
const generatePoints = (count: number, center: [number, number], radius: number) => {
  return Array.from({ length: count }).map((_, i) => {
    const isAlert = Math.random() > 0.95; // 5% chance of alert
    let alertType = 'NOMINAL';
    if (isAlert) {
      // Force one specific distress alert for demonstration
      if (i === 0) {
        alertType = 'DISTRESS_WOMAN_ALONE';
      } else {
        alertType = ANALYTICS_TYPES[Math.floor(Math.random() * ANALYTICS_TYPES.length)];
      }
    }
    
    return [
      center[0] + (Math.random() - 0.5) * radius,
      center[1] + (Math.random() - 0.5) * radius,
      alertType
    ] as [number, number, string];
  });
};

const points = generatePoints(500, SOUTH_DELHI, 0.1);
const heatPoints = points.map(p => [p[0], p[1], p[2] !== 'NOMINAL' ? 1 : 0.2] as [number, number, number]);

function HeatmapLayer({ points }: { points: [number, number, number][] }) {
  const map = useMap();

  useEffect(() => {
    const heat = (L as any).heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 15,
      gradient: {
        0.2: '#ffe600', // primary-fixed
        0.5: '#ffba38', // tertiary-fixed-dim
        1.0: '#ffb4ab'  // error
      }
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);

  return null;
}

export default function GisMap() {
  const [showAlerts, setShowAlerts] = useState(true);
  const [showHUD, setShowHUD] = useState(true);
  const [isLocalityMinimized, setIsLocalityMinimized] = useState(false);
  const [isMetricsMinimized, setIsMetricsMinimized] = useState(false);
  const [isLayersMinimized, setIsLayersMinimized] = useState(false);
  const [isLogsMinimized, setIsLogsMinimized] = useState(false);
  
  // Layer Toggles
  const [layers, setLayers] = useState({
    satellite: true,
    cameras: true,
    potholes: true,
    crime: true,
    darkSpots: true,
    footfall: true,
    womenSafety: true,
    traffic: false,
    aqi: false
  });

  const navigate = useNavigate();
  const { addLog } = useAuditLog();

  const toggleLayer = (layer: keyof typeof layers) => {
    setLayers(prev => {
      const newState = !prev[layer];
      addLog('MAP_LAYER_TOGGLED', `Toggled ${String(layer)} layer to ${newState ? 'ON' : 'OFF'}`);
      return { ...prev, [layer]: newState };
    });
  };

  const handleMinimizeLocality = () => {
    setIsLocalityMinimized(!isLocalityMinimized);
    addLog('UI_ACTION', `Toggled Locality HUD to ${!isLocalityMinimized ? 'MINIMIZED' : 'MAXIMIZED'}`);
  };

  const handleMinimizeMetrics = () => {
    setIsMetricsMinimized(!isMetricsMinimized);
    addLog('UI_ACTION', `Toggled Metrics HUD to ${!isMetricsMinimized ? 'MINIMIZED' : 'MAXIMIZED'}`);
  };

  const handleMinimizeLayers = () => {
    setIsLayersMinimized(!isLayersMinimized);
    addLog('UI_ACTION', `Toggled Layers HUD to ${!isLayersMinimized ? 'MINIMIZED' : 'MAXIMIZED'}`);
  };

  const handleMinimizeLogs = () => {
    setIsLogsMinimized(!isLogsMinimized);
    addLog('UI_ACTION', `Toggled Logs HUD to ${!isLogsMinimized ? 'MINIMIZED' : 'MAXIMIZED'}`);
  };

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div className="absolute inset-0 z-0 bg-surface-dim">
        <MapContainer
          center={SOUTH_DELHI}
          zoom={13}
          style={{ height: '100%', width: '100%', background: '#ffffff' }}
          zoomControl={false}
        >
          <MapUpdater />
          {/* Realistic Satellite Tiles */}
          {layers.satellite ? (
            <TileLayer
              url={IS_OFFLINE_DEMO ? OFFLINE_TILE_URL : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"}
              attribution={IS_OFFLINE_DEMO ? OFFLINE_TILE_ATTRIBUTION : 'Tiles &copy; Esri'}
            />
          ) : (
            <TileLayer
              url={IS_OFFLINE_DEMO ? OFFLINE_TILE_URL : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"}
              attribution={IS_OFFLINE_DEMO ? OFFLINE_TILE_ATTRIBUTION : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'}
            />
          )}
          {/* Subtle Overlay to make the map look clean */}
          <div className="absolute inset-0 bg-white/20 pointer-events-none z-[400]" />

          {showAlerts && <HeatmapLayer points={heatPoints} />}

          {/* AI Analytics Layers */}
          {layers.potholes && POTHOLE_ZONES.map((zone, idx) => (
            <Circle key={`pothole-${idx}`} center={zone.center as [number, number]} radius={zone.radius} pathOptions={{ color: '#ffb4ab', fillColor: '#ffb4ab', fillOpacity: 0.2, weight: 1 }} />
          ))}

          {layers.crime && CRIME_PRONE_AREAS.map((area, idx) => (
            <Polygon key={`crime-${idx}`} positions={area.positions as [number, number][]} pathOptions={{ color: '#93000a', fillColor: '#93000a', fillOpacity: 0.3, weight: 2 }} />
          ))}

          {layers.darkSpots && DARK_SPOTS.map((spot, idx) => (
            <Circle key={`dark-${idx}`} center={spot.center as [number, number]} radius={spot.radius} pathOptions={{ color: '#000000', fillColor: '#000000', fillOpacity: 0.6, weight: 2, dashArray: '4' }} />
          ))}

          {layers.footfall && HIGH_FOOTFALL.map((path, idx) => (
            <Polyline key={`footfall-${idx}`} positions={path.positions as [number, number][]} pathOptions={{ color: '#ffe600', weight: 4, opacity: 0.6 }} />
          ))}

          {layers.womenSafety && WOMEN_SAFETY_PRIORITY.map((zone, idx) => (
            <Circle key={`women-${idx}`} center={zone.center as [number, number]} radius={zone.radius} pathOptions={{ color: '#ff00ff', fillColor: '#ff00ff', fillOpacity: 0.1, weight: 2, dashArray: '5, 5' }} />
          ))}

          {layers.traffic && TRAFFIC_ZONES.map((zone, idx) => (
            <Polygon key={`traffic-${idx}`} positions={zone.positions as [number, number][]} pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: 0.4, weight: 2 }} />
          ))}

          {layers.aqi && AQI_ZONES.map((zone, idx) => (
            <Circle key={`aqi-${idx}`} center={zone.center as [number, number]} radius={zone.radius} pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: 0.2, weight: 1 }}>
              <Popup className="custom-popup">
                <div className="bg-surface-container-highest p-2 text-black font-mono text-xs border border-black/10">
                  AQI: <span style={{ color: zone.color }} className="font-bold">{zone.aqi}</span>
                </div>
              </Popup>
            </Circle>
          ))}

          {layers.cameras && (
            <MarkerClusterGroup
              chunkedLoading
              iconCreateFunction={createClusterCustomIcon}
              maxClusterRadius={60}
            >
              {points.map((p, i) => {
                if (!showAlerts && p[2] !== 'NOMINAL') return null;
                return (
                  <Marker key={i} position={[p[0], p[1]]} icon={p[2] !== 'NOMINAL' ? alertIcon : nodeIcon}>
                    <Popup className="custom-popup">
                      <div className="bg-surface-container-highest p-3 text-black font-mono text-xs border border-black/10 min-w-[200px]">
                        <div className="font-bold mb-1 border-b border-black/10 pb-1">CAM_ID: SD_CAM_{i}</div>
                        <div className="grid grid-cols-2 gap-1 mb-2 mt-2">
                          <img src={img("/images/survey 1.jpeg")} alt="Survey 1" className="w-full h-12 object-cover border border-black/10" />
                          <img src={img("/images/survey 2.jpeg")} alt="Survey 2" className="w-full h-12 object-cover border border-black/10" />
                          <img src={img("/images/survey 3.png")} alt="Survey 3" className="w-full h-12 object-cover border border-black/10" />
                          <img src={img("/images/survey 4.png")} alt="Survey 4" className="w-full h-12 object-cover border border-black/10" />
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-black">STATUS:</span>
                          <span className={p[2] !== 'NOMINAL' ? "text-[#ffb4ab] font-bold" : "bg-[#ffe600] text-black px-1 border border-black font-bold"}>
                            {p[2] !== 'NOMINAL' ? 'ALERT' : 'NOMINAL'}
                          </span>
                        </div>
                        {p[2] !== 'NOMINAL' && (
                          <div className="mt-2 p-1.5 bg-error/20 border border-error/30 text-error text-[10px] uppercase break-words">
                            {p[2].replace(/_/g, ' ')}
                          </div>
                        )}
                        <button 
                          onClick={() => navigate('/anomalies')}
                          className="mt-3 w-full py-1.5 bg-primary-fixed text-black border border-black/10 font-bold text-[9px] uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                        >
                          VIEW DIAGNOSTICS
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MarkerClusterGroup>
          )}
        </MapContainer>
      </div>

      {/* Floating HUD Panels */}
      {showHUD && (
        <>
          {/* Top Left: Locality Identity */}
          <div className="absolute top-8 left-8 z-[500] pointer-events-none">
            <div className="glass-panel border-l-4 border-primary-fixed p-6 w-80 pointer-events-auto shadow-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="font-headline text-3xl font-black tracking-tighter text-black uppercase">DELHI</h1>
                  <p className="font-mono text-[10px] text-black font-bold tracking-[0.3em] mt-1">ICCC_ANALYTICS_VIEW_4.2</p>
                </div>
                <button onClick={handleMinimizeLocality} className="text-black hover:text-black transition-colors">
                  <span className="material-symbols-outlined text-sm">{isLocalityMinimized ? 'expand_more' : 'expand_less'}</span>
                </button>
              </div>
              
              {!isLocalityMinimized && (
                <div className="mt-6 flex flex-col gap-4">
                  <div>
                    <span className="text-black font-bold font-mono text-[9px] block uppercase">Active Camera Feeds</span>
                    <span className="font-mono text-xl bg-primary-fixed text-black px-2 py-0.5 font-bold">14,204 / 14,210</span>
                  </div>
                  <div>
                    <span className="text-black font-bold font-mono text-[9px] block uppercase">AI Processing Load</span>
                    <div className="w-full bg-surface-container-highest h-1 mt-1">
                      <div className="bg-primary-fixed h-full" style={{ width: '88%' }}></div>
                    </div>
                    <span className="font-mono text-xs text-black font-bold mt-1 block text-right">88.2% UTILIZATION</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Right: Detailed Metrics Bento */}
          <div className="absolute bottom-8 right-8 z-[500] flex gap-4 pointer-events-none items-end">
            <button 
              onClick={handleMinimizeMetrics} 
              className="bg-surface-container-lowest/90 backdrop-blur-md border border-black/5 p-2 text-black font-bold hover:bg-black hover:text-white transition-colors h-fit pointer-events-auto"
            >
              <span className="material-symbols-outlined text-sm">{isMetricsMinimized ? 'expand_less' : 'expand_more'}</span>
            </button>
            
            {!isMetricsMinimized && (
              <div className="grid grid-cols-2 gap-4 w-[480px]">
                {/* Bandwidth Metric */}
                <div className="col-span-2 bg-surface-container-highest/80 backdrop-blur-md p-5 border border-black/5 pointer-events-auto">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-black font-bold font-mono text-[10px] tracking-widest uppercase">Video Ingestion Rate</h3>
                      <div className="font-mono text-3xl text-black font-bold mt-1">
                        4.82 <span className="text-sm font-bold text-black">TBPS</span>
                      </div>
                    </div>
                    <div className="bg-primary-fixed text-black w-8 h-8 flex items-center justify-center border border-black/10">
                      <span className="material-symbols-outlined text-xl">videocam</span>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-6 gap-1 h-8 items-end">
                    <div className="bg-primary-fixed/20 h-2"></div>
                    <div className="bg-primary-fixed/40 h-4"></div>
                    <div className="bg-primary-fixed/60 h-6"></div>
                    <div className="bg-primary-fixed h-8"></div>
                    <div className="bg-primary-fixed/50 h-5"></div>
                    <div className="bg-primary-fixed/30 h-3"></div>
                  </div>
                </div>
                
                {/* Active Incidents */}
                <div className="bg-surface-container-low/80 backdrop-blur-md p-5 border border-black/5 pointer-events-auto">
                  <h3 className="text-black font-bold font-mono text-[10px] tracking-widest uppercase mb-4">AI_ALERTS</h3>
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-mono font-black text-error">24</span>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-mono text-error uppercase font-extrabold tracking-tighter">1 Distress</span>
                      <span className="text-[9px] font-mono text-black font-bold uppercase tracking-tighter">5 Mob, 18 ANPR</span>
                    </div>
                  </div>
                </div>
                
                {/* System Health */}
                <div className="bg-surface-container-low/80 backdrop-blur-md p-5 border border-black/5 pointer-events-auto">
                  <h3 className="text-black font-bold font-mono text-[10px] tracking-widest uppercase mb-4">ANALYTICS_HEALTH</h3>
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-mono font-black text-black">98%</span>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-mono text-black font-bold uppercase tracking-tighter">Models: ONLINE</span>
                      <span className="text-[9px] font-mono text-black font-bold uppercase tracking-tighter">Latency: 12ms</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Top Right: Live Log Feed & Layer Controls */}
          <div className="absolute top-8 right-8 z-[500] flex flex-col gap-4 w-96 pointer-events-auto">
            {/* Layer Controls */}
            <div className="bg-surface-container-lowest/90 backdrop-blur-md border border-black/5 p-4">
              <div className="flex justify-between items-center mb-3 border-b border-black/5 pb-2">
                <span className="text-black font-bold font-mono text-[10px] tracking-widest uppercase">AI ANALYTICS LAYERS</span>
                <button onClick={handleMinimizeLayers} className="text-black font-bold hover:bg-primary-fixed text-black px-1 border border-black transition-colors">
                  <span className="material-symbols-outlined text-sm">{isLayersMinimized ? 'expand_more' : 'expand_less'}</span>
                </button>
              </div>
              
              {!isLayersMinimized && (
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => toggleLayer('cameras')}
                    className={`text-left px-3 py-2 font-mono text-[9px] uppercase tracking-widest border transition-colors ${layers.cameras ? 'bg-primary-fixed border-primary-fixed text-black font-bold' : 'bg-surface-container border-black/10 text-black font-bold'}`}
                  >
                    <span className="material-symbols-outlined text-[12px] align-middle mr-1">videocam</span> Cameras
                  </button>
                  <button 
                    onClick={() => toggleLayer('potholes')}
                    className={`text-left px-3 py-2 font-mono text-[9px] uppercase tracking-widest border transition-colors ${layers.potholes ? 'bg-[#ffb4ab] border-[#ffb4ab] text-black font-bold' : 'bg-surface-container border-black/10 text-black font-bold'}`}
                  >
                    <span className="material-symbols-outlined text-[12px] align-middle mr-1">warning</span> Potholes
                  </button>
                  <button 
                    onClick={() => toggleLayer('crime')}
                    className={`text-left px-3 py-2 font-mono text-[9px] uppercase tracking-widest border transition-colors ${layers.crime ? 'bg-[#93000a] border-[#93000a] text-white font-bold' : 'bg-surface-container border-black/10 text-black font-bold'}`}
                  >
                    <span className="material-symbols-outlined text-[12px] align-middle mr-1">local_police</span> Crime Prone
                  </button>
                  <button 
                    onClick={() => toggleLayer('darkSpots')}
                    className={`text-left px-3 py-2 font-mono text-[9px] uppercase tracking-widest border transition-colors ${layers.darkSpots ? 'bg-black border-black text-white font-bold' : 'bg-surface-container border-black/10 text-black font-bold'}`}
                  >
                    <span className="material-symbols-outlined text-[12px] align-middle mr-1">visibility_off</span> Dark Spots
                  </button>
                  <button 
                    onClick={() => toggleLayer('footfall')}
                    className={`text-left px-3 py-2 font-mono text-[9px] uppercase tracking-widest border transition-colors ${layers.footfall ? 'bg-[#ffe600] border-[#ffe600] text-black font-bold' : 'bg-surface-container border-black/10 text-black font-bold'}`}
                  >
                    <span className="material-symbols-outlined text-[12px] align-middle mr-1">groups</span> High Footfall
                  </button>
                  <button 
                    onClick={() => toggleLayer('womenSafety')}
                    className={`text-left px-3 py-2 font-mono text-[9px] uppercase tracking-widest border transition-colors ${layers.womenSafety ? 'bg-[#ff00ff] border-[#ff00ff] text-white font-bold' : 'bg-surface-container border-black/10 text-black font-bold'}`}
                  >
                    <span className="material-symbols-outlined text-[12px] align-middle mr-1">female</span> Women Safety
                  </button>
                  <button 
                    onClick={() => toggleLayer('satellite')}
                    className={`text-left px-3 py-2 font-mono text-[9px] uppercase tracking-widest border transition-colors ${layers.satellite ? 'bg-secondary border-secondary text-white font-bold' : 'bg-surface-container border-black/10 text-black font-bold'}`}
                  >
                    <span className="material-symbols-outlined text-[12px] align-middle mr-1">satellite</span> Satellite Map
                  </button>
                  <button 
                    onClick={() => toggleLayer('traffic')}
                    className={`text-left px-3 py-2 font-mono text-[9px] uppercase tracking-widest border transition-colors ${layers.traffic ? 'bg-[#ff0000] border-[#ff0000] text-white font-bold' : 'bg-surface-container border-black/10 text-black font-bold'}`}
                  >
                    <span className="material-symbols-outlined text-[12px] align-middle mr-1">traffic</span> Traffic
                  </button>
                  <button 
                    onClick={() => toggleLayer('aqi')}
                    className={`text-left px-3 py-2 font-mono text-[9px] uppercase tracking-widest border transition-colors ${layers.aqi ? 'bg-[#ffba38] border-[#ffba38] text-black font-bold' : 'bg-surface-container border-black/10 text-black font-bold'}`}
                  >
                    <span className="material-symbols-outlined text-[12px] align-middle mr-1">air</span> AQI
                  </button>
                </div>
              )}
            </div>

            {/* Live Log Feed */}
            <div className="bg-surface-container-lowest/90 backdrop-blur-md border border-black/5 flex flex-col transition-all duration-300 ${isLogsMinimized ? 'h-auto' : 'h-72'}">
              <div className="px-4 py-2 border-b border-black/5 bg-surface-container flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-black font-bold font-mono text-[10px] tracking-widest uppercase">AI_ANALYTICS_LOGS</span>
                  {!isLogsMinimized && <span className="w-2 h-2 rounded-full bg-primary-fixed animate-pulse"></span>}
                </div>
                <button onClick={handleMinimizeLogs} className="text-black font-bold hover:bg-black hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-sm">{isLogsMinimized ? 'expand_more' : 'expand_less'}</span>
                </button>
              </div>
              
              {!isLogsMinimized && (
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 font-mono text-[10px] space-y-3">
                  <div className="flex gap-2">
                    <span className="text-black font-bold">[14:02:11]</span>
                    <span className="text-black font-bold">CAM_HK_042 &gt;&gt; ANPR_MATCH: DL1C AA 1234</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-black font-bold">[14:02:15]</span>
                    <span className="text-error font-extrabold uppercase">CAM_VK_012 &gt;&gt; DISTRESS_DETECTED: WOMAN WALKING ALONE AT NIGHT</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-black font-bold">[14:03:01]</span>
                    <span className="text-black font-bold">CAM_CP_088 &gt;&gt; MOB_GATHERING_DETECTED (COUNT &gt; 50)</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-black font-bold">[14:03:22]</span>
                    <span className="text-black font-bold">CAM_DW_015 &gt;&gt; POTHOLE_DETECTED: SECTOR 10 ROAD</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-black font-bold">[14:03:45]</span>
                    <span className="text-black font-bold">CAM_KB_004 &gt;&gt; GARBAGE_OVERFLOW_DETECTED</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Bottom Navigation HUD */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[500] glass-panel border border-black/10 p-2 flex items-center gap-2 pointer-events-auto">
        <button className="bg-surface-container-highest p-2 border border-black/10 text-black hover:bg-surface-bright transition-all">
          <span className="material-symbols-outlined">zoom_in</span>
        </button>
        <button className="bg-surface-container-highest p-2 border border-black/10 text-black hover:bg-surface-bright transition-all">
          <span className="material-symbols-outlined">zoom_out</span>
        </button>
        <button className="bg-surface-container-highest p-2 border border-black/10 text-black hover:bg-surface-bright transition-all">
          <span className="material-symbols-outlined">my_location</span>
        </button>
        <div className="h-12 w-px bg-white/10 mx-2"></div>
        <button
          onClick={() => navigate('/gis-map/garbage-trucks')}
          className="px-4 border border-black/10 font-mono text-[10px] tracking-widest flex items-center gap-2 bg-surface-container-highest text-black hover:bg-[#198754] hover:text-white transition-all"
        >
          <span className="material-symbols-outlined text-sm">local_shipping</span>
          GARBAGE TRUCKS
        </button>
        <button
          onClick={() => navigate('/gis-map/water-sprinklers')}
          className="px-4 border border-black/10 font-mono text-[10px] tracking-widest flex items-center gap-2 bg-surface-container-highest text-black hover:bg-secondary hover:text-white transition-all"
        >
          <span className="material-symbols-outlined text-sm">water_drop</span>
          WATER SPRINKLERS
        </button>
        <div className="h-12 w-px bg-white/10 mx-2"></div>
        <button 
          onClick={() => setShowAlerts(!showAlerts)}
          className={`px-4 border border-black/10 font-mono text-[10px] tracking-widest flex items-center gap-2 transition-all ${showAlerts ? 'bg-primary-fixed text-black' : 'bg-surface-container-highest text-black hover:bg-surface-bright'}`}
        >
          <span className="material-symbols-outlined text-sm">{showAlerts ? 'visibility' : 'visibility_off'}</span>
          {showAlerts ? 'ALERTS ON' : 'ALERTS OFF'}
        </button>
        <button 
          onClick={() => setShowHUD(!showHUD)}
          className={`px-4 border border-black/10 font-mono text-[10px] tracking-widest flex items-center gap-2 transition-all ${showHUD ? 'bg-primary-fixed text-black' : 'bg-surface-container-highest text-black hover:bg-surface-bright'}`}
        >
          <span className="material-symbols-outlined text-sm">{showHUD ? 'layers' : 'layers_clear'}</span>
          {showHUD ? 'HUD ON' : 'HUD OFF'}
        </button>
      </div>
    </div>
  );
}
