import { img } from '../utils/imagePath';
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuditLog } from '../context/AuditLogContext';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';

function MapUpdater({ selectedSite }: { selectedSite: any }) {
  const map = useMap();
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      map.invalidateSize();
    }, 300);
    return () => clearTimeout(timeout);
  }, [map, selectedSite]);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);

  return null;
}

function PhotoCycler({ photos }: { photos: string[] }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIdx(prev => (prev + 1) % photos.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [photos]);

  return (
    <div className="absolute top-0 left-0 bottom-0 w-1/3 bg-black z-[400] flex flex-col items-center justify-center border-r border-black/10 overflow-hidden shadow-2xl animate-in slide-in-from-left duration-300 group">
      <img key={idx} src={photos[idx]} alt="Survey view" className="w-full h-full object-cover opacity-90 transition-opacity duration-500" />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 bg-black/50 px-4 py-2 backdrop-blur-md rounded-full">
        {photos.map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === idx ? 'bg-[#ffe600]' : 'bg-white/30'}`} />
        ))}
      </div>
      <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 text-white border border-white/10">
        <span className="material-symbols-outlined text-[14px]">photo_camera</span>
        <span className="font-mono text-[10px] tracking-widest uppercase">Live Survey Feed</span>
      </div>
      {/* Zoom hint */}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
        <span className="material-symbols-outlined text-white text-6xl drop-shadow-lg">zoom_in</span>
      </div>
    </div>
  );
}

// Custom SVG Icon generator based on status
const getCustomIcon = (status: string) => {
  const color = status === 'COMPLETED' ? '#ffe600' : status === 'ONGOING' ? '#ffb4ab' : '#000000';
  
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="36px" height="36px" style="filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.5));">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `;

  return new L.DivIcon({
    html: svgIcon,
    className: 'custom-svg-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

const TOTAL_CAMERAS_TARGET = 50000;

const SURVEY_PROGRESS_DATA = [
  { name: 'W1', cameras: 1200 },
  { name: 'W2', cameras: 2500 },
  { name: 'W3', cameras: 4100 },
  { name: 'W4', cameras: 6800 },
  { name: 'W5', cameras: 9200 },
  { name: 'W6', cameras: 12450 },
];

const DISTRICT_DATA = [
  { name: 'South', completed: 1200, ongoing: 800 },
  { name: 'Central', completed: 900, ongoing: 1100 },
  { name: 'North', completed: 600, ongoing: 1500 },
  { name: 'East', completed: 800, ongoing: 1200 },
  { name: 'West', completed: 700, ongoing: 1400 },
];

const MOCK_SITES = [
  { id: 'SRV-001', name: 'Connaught Place Phase 1', status: 'COMPLETED', lat: 28.6304, lng: 77.2177, cameras: 150, progress: 100 },
  { id: 'SRV-002', name: 'Hauz Khas Village', status: 'ONGOING', lat: 28.5535, lng: 77.1936, cameras: 85, progress: 65 },
  { id: 'SRV-003', name: 'Lajpat Nagar Market', status: 'PENDING', lat: 28.5677, lng: 77.2433, cameras: 120, progress: 0 },
  { id: 'SRV-004', name: 'Karol Bagh', status: 'ONGOING', lat: 28.6519, lng: 77.1901, cameras: 200, progress: 40 },
  { id: 'SRV-005', name: 'Chandni Chowk', status: 'COMPLETED', lat: 28.6505, lng: 77.2303, cameras: 300, progress: 100 },
  { id: 'SRV-006', name: 'Vasant Kunj', status: 'ONGOING', lat: 28.5293, lng: 77.1533, cameras: 110, progress: 30 },
  { id: 'SRV-007', name: 'Saket District Centre', status: 'COMPLETED', lat: 28.5286, lng: 77.2193, cameras: 140, progress: 100 },
  { id: 'SRV-008', name: 'Dwarka Sector 21', status: 'PENDING', lat: 28.5523, lng: 77.0583, cameras: 250, progress: 0 },
  { id: 'SRV-009', name: 'Rohini Sector 15', status: 'ONGOING', lat: 28.7366, lng: 77.1132, cameras: 180, progress: 55 },
  { id: 'SRV-010', name: 'Janakpuri District Centre', status: 'COMPLETED', lat: 28.6295, lng: 77.0799, cameras: 160, progress: 100 },
  { id: 'SRV-011', name: 'Nehru Place', status: 'ONGOING', lat: 28.5494, lng: 77.2527, cameras: 220, progress: 80 },
  { id: 'SRV-012', name: 'Okhla Industrial Area', status: 'PENDING', lat: 28.5273, lng: 77.2786, cameras: 350, progress: 0 },
  { id: 'SRV-013', name: 'Mayur Vihar Phase 1', status: 'COMPLETED', lat: 28.6053, lng: 77.2958, cameras: 130, progress: 100 },
  { id: 'SRV-014', name: 'Shahdara', status: 'ONGOING', lat: 28.6988, lng: 77.2926, cameras: 190, progress: 45 },
  { id: 'SRV-015', name: 'Pitampura', status: 'PENDING', lat: 28.6981, lng: 77.1388, cameras: 170, progress: 0 },
];

const SITE_DETAILS_MOCK = {
  coverageZones: [
    { name: 'Crime-Prone', value: 45 },
    { name: 'Dark Spots', value: 25 },
    { name: 'Blind Zones', value: 20 },
    { name: 'Maintenance', value: 10 },
  ],
  infrastructure: [
    { name: 'Poles', value: 60 },
    { name: 'Buildings', value: 30 },
    { name: 'Gantries', value: 10 },
  ],
  powerFeasibility: 92, // percentage
  networkFeasibility: 88, // percentage
  fovVerified: 142, // out of 150
  photos: [
    img('/images/survey 1.jpeg'),
    img('/images/survey 2.jpeg'),
    img('/images/survey 3.png'),
    img('/images/survey 4.png')
  ]
};

const COLORS = ['#ffe600', '#ffb4ab', '#93000a', '#4a4a4a'];

export default function SurveyTracking() {
  const { addLog } = useAuditLog();
  const [selectedSite, setSelectedSite] = useState<any>(null);

  const totalSurveyed = 12450;
  const progressPercentage = (totalSurveyed / TOTAL_CAMERAS_TARGET) * 100;

  const handleSiteClick = (site: any) => {
    addLog('SURVEY_ACTION', `Viewed survey dashboard for site ${site.id}`);
    setSelectedSite(site);
  };

  return (
    <div className="w-full h-full flex flex-col bg-surface-dim overflow-hidden">
      <div className="p-6 border-b border-black/10 flex justify-between items-end bg-white shrink-0">
        <div>
          <h1 className="font-headline font-black text-3xl tracking-tighter text-black uppercase">SURVEY TRACKING</h1>
          <p className="font-mono text-xs text-black font-bold mt-1 tracking-widest">PHASE 1: 50,000 CAMERA DEPLOYMENT</p>
        </div>
        <div className="text-right">
          <div className="font-mono text-[10px] text-black font-bold uppercase tracking-widest mb-1">Overall Progress</div>
          <div className="font-mono text-xl bg-primary-fixed text-black px-2 py-0.5 font-bold inline-block">{totalSurveyed.toLocaleString()} / {TOTAL_CAMERAS_TARGET.toLocaleString()}</div>
          <div className="w-48 h-1 bg-black/10 mt-2 rounded-full overflow-hidden">
            <div className="h-full bg-primary-fixed" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {/* Full Screen Map */}
        <MapContainer 
          center={[28.6139, 77.2090]} 
          zoom={11} 
          className="absolute inset-0 w-full h-full bg-white z-0"
          zoomControl={false}
        >
          <MapUpdater selectedSite={selectedSite} />
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            className="opacity-60 saturate-50"
          />
          {MOCK_SITES.map(site => (
            <React.Fragment key={site.id}>
              {/* Coverage Zone Circle */}
              <Circle 
                center={[site.lat, site.lng]} 
                radius={1500} 
                pathOptions={{ 
                  color: site.status === 'COMPLETED' ? '#ffe600' : site.status === 'ONGOING' ? '#ffb4ab' : '#000000', 
                  fillColor: site.status === 'COMPLETED' ? '#ffe600' : site.status === 'ONGOING' ? '#ffb4ab' : '#000000', 
                  fillOpacity: 0.05, 
                  weight: 1,
                  dashArray: '4 4'
                }} 
              />
              {/* Core Density Circle (Heatmap-like) */}
              <Circle 
                center={[site.lat, site.lng]} 
                radius={500} 
                pathOptions={{ 
                  color: 'transparent', 
                  fillColor: site.status === 'COMPLETED' ? '#ffe600' : site.status === 'ONGOING' ? '#ffb4ab' : '#000000', 
                  fillOpacity: 0.2 
                }} 
              />
              <Marker 
                position={[site.lat, site.lng]}
                icon={getCustomIcon(site.status)}
                eventHandlers={{
                  click: () => handleSiteClick(site),
                }}
              >
                <Popup className="custom-popup">
                  <div className="font-mono text-xs font-bold">{site.name}</div>
                  <div className="font-mono text-[10px] text-black font-bold mb-2">Status: {site.status}</div>
                  <div className="grid grid-cols-2 gap-1 mb-2">
                    <img src={img("/images/survey 1.jpeg")} alt="Survey 1" className="w-full h-12 object-cover border border-black/10" />
                    <img src={img("/images/survey 2.jpeg")} alt="Survey 2" className="w-full h-12 object-cover border border-black/10" />
                    <img src={img("/images/survey 3.png")} alt="Survey 3" className="w-full h-12 object-cover border border-black/10" />
                    <img src={img("/images/survey 4.png")} alt="Survey 4" className="w-full h-12 object-cover border border-black/10" />
                  </div>
                  <div className="font-mono text-[10px] bg-primary-fixed text-black px-1 mt-1 font-bold inline-block">Cameras: {site.cameras}</div>
                </Popup>
              </Marker>
            </React.Fragment>
          ))}
        </MapContainer>

        {/* Legend Overlay */}
        <div className="absolute top-4 right-4 z-[400] bg-white/90 border border-black/10 p-3 backdrop-blur-md">
          <div className="font-mono text-[10px] text-black uppercase tracking-widest mb-2">Legend</div>
          <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-primary-fixed"></div><span className="font-mono text-[9px] text-black font-bold">COMPLETED</span></div>
          <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-tertiary-container"></div><span className="font-mono text-[9px] text-black font-bold">ONGOING</span></div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-black/20"></div><span className="font-mono text-[9px] text-black font-bold">PENDING</span></div>
        </div>

        {/* Dashboard at a Glance Overlay (Left Panel) */}
        {!selectedSite && (
          <div className="absolute top-0 left-0 bottom-0 w-[450px] bg-white/95 backdrop-blur-xl border-r border-black/10 z-[400] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-black/10">
              <h2 className="font-headline font-black text-xl tracking-tighter text-black uppercase">OVERVIEW</h2>
              <p className="font-mono text-[10px] text-black mt-1 tracking-widest">SURVEY STATUS AT A GLANCE</p>
            </div>
            <div className="p-6 border-b border-black/10 flex flex-col gap-4">
              <div className="glass-panel border border-black/10 p-4 text-center">
                <div className="font-mono text-[10px] text-black font-bold uppercase tracking-widest mb-1">Total Sites Surveyed</div>
                <div className="font-mono text-xl bg-primary-fixed text-black px-3 py-1 font-bold inline-block">12,450</div>
                <div className="font-mono text-[9px] text-black font-bold mt-1">Out of 50,000 Target</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-panel border border-black/10 p-4 text-center">
                  <div className="font-mono text-[10px] text-black font-bold uppercase tracking-widest mb-1">Completed</div>
                  <div className="font-mono text-xl text-black font-bold">4,200</div>
                </div>
                <div className="glass-panel border border-black/10 p-4 text-center">
                  <div className="font-mono text-[10px] text-black font-bold uppercase tracking-widest mb-1">Ongoing</div>
                  <div className="font-mono text-xl text-tertiary-container font-bold">8,250</div>
                </div>
              </div>

              {/* Progress Chart */}
              <div className="glass-panel border border-black/10 p-4 mt-2">
                <h3 className="font-mono text-[10px] text-black font-bold uppercase tracking-widest mb-4">Survey Velocity (Cameras/Week)</h3>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={SURVEY_PROGRESS_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" vertical={false} />
                      <XAxis dataKey="name" stroke="#000000" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                      <YAxis stroke="#000000" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', fontFamily: 'monospace', borderRadius: '0px' }}
                        itemStyle={{ color: '#000000', fontFamily: 'monospace', fontSize: '10px' }}
                        labelStyle={{ color: '#000000', fontFamily: 'monospace', fontSize: '10px' }}
                      />
                      <Line type="monotone" dataKey="cameras" stroke="#ffe600" strokeWidth={2} dot={{ r: 3, fill: '#000000', stroke: '#ffe600', strokeWidth: 2 }} activeDot={{ r: 5, fill: '#ffe600' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* District Breakdown */}
              <div className="glass-panel border border-black/10 p-4 mt-2">
                <h3 className="font-mono text-[10px] text-black font-bold uppercase tracking-widest mb-4">Status by District</h3>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={DISTRICT_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" vertical={false} />
                      <XAxis dataKey="name" stroke="#000000" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                      <YAxis stroke="#000000" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                      <Tooltip 
                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', fontFamily: 'monospace', borderRadius: '0px' }}
                        itemStyle={{ fontFamily: 'monospace', fontSize: '10px', color: '#000000' }}
                        labelStyle={{ color: '#000000', fontFamily: 'monospace', fontSize: '10px' }}
                      />
                      <Bar dataKey="completed" stackId="a" fill="#ffe600" name="Completed" />
                      <Bar dataKey="ongoing" stackId="a" fill="#ffb4ab" name="Ongoing" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-0">
              <h3 className="font-mono text-sm text-black font-bold uppercase tracking-widest mb-4">Survey Sites</h3>
              <div className="grid grid-cols-1 gap-3">
                {MOCK_SITES.map(site => (
                  <div 
                    key={site.id}
                    onClick={() => handleSiteClick(site)}
                    className="p-4 border bg-surface-container-low border-black/5 hover:border-black/20 cursor-pointer transition-colors flex justify-between items-center"
                  >
                    <div>
                      <div className="font-mono text-xs font-bold text-black mb-1">{site.name}</div>
                      <div className="font-mono text-[10px] text-black font-medium">{site.id} • {site.cameras} Cameras</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono text-[9px] px-2 py-0.5 font-bold tracking-widest mb-2 inline-block ${site.status === 'COMPLETED' ? 'bg-primary-fixed text-black' : site.status === 'ONGOING' ? 'bg-tertiary-container text-black' : 'bg-surface-container border border-black/20 text-black'}`}>
                        {site.status}
                      </div>
                      <div className="w-20 h-1 bg-surface-container rounded-full overflow-hidden ml-auto">
                        <div className={`h-full ${site.status === 'COMPLETED' ? 'bg-primary-fixed' : 'bg-tertiary-container'}`} style={{ width: `${site.progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Left Panel: Photo Slideshow when selectedSite is present */}
        {selectedSite && <PhotoCycler photos={SITE_DETAILS_MOCK.photos} />}

        {/* Right Panel: Site Dashboard Overlay */}
        {selectedSite && (
          <div className="absolute top-0 right-0 bottom-0 w-2/3 bg-white/95 backdrop-blur-xl border-l border-black/10 z-[400] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-black/10 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-10">
              <div>
                <h2 className="font-headline font-black text-2xl tracking-tighter text-black uppercase">{selectedSite.name}</h2>
                <div className="font-mono text-xs text-black tracking-widest">{selectedSite.id} • {selectedSite.cameras} Proposed Cameras</div>
              </div>
              <button 
                onClick={() => setSelectedSite(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              >
                <span className="material-symbols-outlined text-black">close</span>
              </button>
            </div>

            <div className="p-6 grid grid-cols-2 gap-6">
              {/* Coverage Zones */}
              <div className="glass-panel border border-black/10 p-5">
                <h3 className="font-mono text-[10px] text-black uppercase tracking-widest mb-4">Coverage Zones (Crime, Dark Spots, Blind Zones)</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={SITE_DETAILS_MOCK.coverageZones}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {SITE_DETAILS_MOCK.coverageZones.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', fontFamily: 'monospace', borderRadius: '0px' }}
                        itemStyle={{ color: '#000000', fontFamily: 'monospace', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {SITE_DETAILS_MOCK.coverageZones.map((zone, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                      <span className="font-mono text-[9px] text-black">{zone.name} ({zone.value}%)</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Infrastructure */}
              <div className="glass-panel border border-black/10 p-5">
                <h3 className="font-mono text-[10px] text-black uppercase tracking-widest mb-4">Mounting Infrastructure (Poles, Buildings, Gantries)</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={SITE_DETAILS_MOCK.infrastructure} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" horizontal={false} />
                      <XAxis type="number" stroke="#000000" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                      <YAxis dataKey="name" type="category" stroke="#000000" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                      <Tooltip 
                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', fontFamily: 'monospace', borderRadius: '0px' }}
                        itemStyle={{ color: '#000000', fontFamily: 'monospace', fontSize: '12px' }}
                      />
                      <Bar dataKey="value" fill="#ffe600" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Feasibility & Verification */}
              <div className="col-span-2 grid grid-cols-4 gap-4">
                <div className="glass-panel border border-black/10 p-4 flex flex-col items-center justify-center text-center">
                  <div className="bg-primary-fixed text-black w-10 h-10 flex items-center justify-center mb-2 border border-black/10">
                    <span className="material-symbols-outlined text-2xl">satellite_alt</span>
                  </div>
                  <div className="font-mono text-xl text-black font-bold mb-1">{selectedSite.cameras} / {selectedSite.cameras}</div>
                  <div className="font-mono text-[8px] text-black uppercase tracking-widest">GIS Tagged Locations</div>
                </div>
                <div className="glass-panel border border-black/10 p-4 flex flex-col items-center justify-center text-center">
                  <div className="bg-primary-fixed text-black w-10 h-10 flex items-center justify-center mb-2 border border-black/10">
                    <span className="material-symbols-outlined text-2xl">visibility</span>
                  </div>
                  <div className="font-mono text-xl text-black font-bold mb-1">{SITE_DETAILS_MOCK.fovVerified} / {selectedSite.cameras}</div>
                  <div className="font-mono text-[8px] text-black uppercase tracking-widest">FOV & LOS Verification</div>
                </div>
                <div className="glass-panel border border-black/10 p-4 flex flex-col items-center justify-center text-center">
                  <div className="bg-primary-fixed text-black w-10 h-10 flex items-center justify-center mb-2 border border-black/10">
                    <span className="material-symbols-outlined text-2xl">bolt</span>
                  </div>
                  <div className="font-mono text-xl text-black font-bold mb-1">{SITE_DETAILS_MOCK.powerFeasibility}%</div>
                  <div className="font-mono text-[8px] text-black uppercase tracking-widest">Power Availability</div>
                </div>
                <div className="glass-panel border border-black/10 p-4 flex flex-col items-center justify-center text-center">
                  <div className="bg-primary-fixed text-black w-10 h-10 flex items-center justify-center mb-2 border border-black/10">
                    <span className="material-symbols-outlined text-2xl">wifi</span>
                  </div>
                  <div className="font-mono text-xl text-black font-bold mb-1">{SITE_DETAILS_MOCK.networkFeasibility}%</div>
                  <div className="font-mono text-[8px] text-black uppercase tracking-widest">Network Connectivity</div>
                </div>
              </div>

              {/* Photos */}
              <div className="col-span-2 glass-panel border border-black/10 p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-mono text-[10px] text-black uppercase tracking-widest">Survey Site Photos</h3>
                  <button className="font-mono text-[9px] bg-primary-fixed text-black px-2 py-0.5 font-bold hover:bg-black hover:text-white transition-colors uppercase tracking-widest flex items-center gap-1">
                    VIEW ALL <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {SITE_DETAILS_MOCK.photos.map((photo, idx) => (
                    <div key={idx} className="aspect-square bg-surface-container border border-black/10 overflow-hidden group cursor-pointer relative">
                      <img src={photo} alt={`Survey ${idx}`} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                        <span className="material-symbols-outlined text-black">zoom_in</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
