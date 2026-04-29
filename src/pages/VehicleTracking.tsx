import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { img } from '../utils/imagePath';
import { useAuditLog } from '../context/AuditLogContext';

type Mode = 'garbage' | 'sprinkler';
type LatLng = [number, number];

type CctvHit = {
  cameraId: string;
  location: string;
  timestamp: string;
  position: LatLng;
  confidence: number;
  image: string;
};

type Vehicle = {
  id: string;
  plate: string;
  ward: string;
  driver: string;
  status: string;
  speed: number;
  gpsSignature: string;
  route: LatLng[];
  cctvHits: CctvHit[];
  offset: number;
};

type TrackingConfig = {
  title: string;
  subtitle: string;
  icon: string;
  accent: string;
  light: string;
  feedLabel: string;
  vehicles: Vehicle[];
};

const CENTER: LatLng = [28.5921, 77.2290];

const CONFIG: Record<Mode, TrackingConfig> = {
  garbage: {
    title: 'Garbage Truck Tracking',
    subtitle: 'Live sanitation fleet trace through GPS signatures and CCTV evidence hits',
    icon: 'delete',
    accent: '#198754',
    light: '#d9f7e5',
    feedLabel: 'SOLID WASTE FLEET',
    vehicles: [
      {
        id: 'MCD-GT-014',
        plate: 'DL1GC 4812',
        ward: 'Karol Bagh to Connaught Place',
        driver: 'R. Meena',
        status: 'Collection route active',
        speed: 28,
        gpsSignature: 'GPS/SWACHH/GT014/0x7A91F2',
        offset: 0,
        route: [[28.6510, 77.1904], [28.6448, 77.1985], [28.6336, 77.2079], [28.6258, 77.2166], [28.6155, 77.2222], [28.6067, 77.2264], [28.5993, 77.2303]],
        cctvHits: [
          { cameraId: 'CAM_KB_044', location: 'Ajmal Khan Road', timestamp: '09:12:08', position: [28.6448, 77.1985], confidence: 96, image: '/images/garbage monitoring.png' },
          { cameraId: 'CAM_CP_118', location: 'Panchkuian Road', timestamp: '09:20:41', position: [28.6258, 77.2166], confidence: 94, image: '/images/pov 2.jpeg' },
          { cameraId: 'CAM_CP_031', location: 'Outer Circle', timestamp: '09:31:17', position: [28.6067, 77.2264], confidence: 98, image: '/images/pov 3.jpeg' },
        ],
      },
      {
        id: 'MCD-GT-027',
        plate: 'DL1GC 7395',
        ward: 'Lajpat Nagar to Defence Colony',
        driver: 'S. Khan',
        status: 'Bin pickup verified',
        speed: 22,
        gpsSignature: 'GPS/SWACHH/GT027/0x2C44D9',
        offset: 2,
        route: [[28.5702, 77.2431], [28.5657, 77.2418], [28.5608, 77.2394], [28.5549, 77.2353], [28.5502, 77.2308], [28.5468, 77.2247], [28.5426, 77.2199]],
        cctvHits: [
          { cameraId: 'CAM_LN_052', location: 'Central Market', timestamp: '09:08:52', position: [28.5657, 77.2418], confidence: 97, image: '/images/pov 4.jpeg' },
          { cameraId: 'CAM_DC_019', location: 'Defence Colony Flyover', timestamp: '09:18:36', position: [28.5549, 77.2353], confidence: 93, image: '/images/pov 5.jpeg' },
          { cameraId: 'CAM_DC_087', location: 'Ring Road service lane', timestamp: '09:29:03', position: [28.5468, 77.2247], confidence: 95, image: '/images/pov 6.jpeg' },
        ],
      },
      {
        id: 'MCD-GT-039',
        plate: 'DL1GC 9051',
        ward: 'Saket to Hauz Khas',
        driver: 'N. Rawat',
        status: 'Transfer station inbound',
        speed: 31,
        gpsSignature: 'GPS/SWACHH/GT039/0xB51E20',
        offset: 4,
        route: [[28.5245, 77.2066], [28.5318, 77.2109], [28.5397, 77.2168], [28.5482, 77.2201], [28.5567, 77.2173], [28.5641, 77.2129], [28.5716, 77.2077]],
        cctvHits: [
          { cameraId: 'CAM_SK_016', location: 'Saket District Centre', timestamp: '09:05:14', position: [28.5318, 77.2109], confidence: 92, image: '/images/survey 1.jpeg' },
          { cameraId: 'CAM_HK_073', location: 'Aurobindo Marg', timestamp: '09:19:22', position: [28.5567, 77.2173], confidence: 96, image: '/images/hauz khas.jpeg' },
          { cameraId: 'CAM_HK_099', location: 'Hauz Khas Metro loop', timestamp: '09:27:40', position: [28.5716, 77.2077], confidence: 94, image: '/images/survey 2.jpeg' },
        ],
      },
    ],
  },
  sprinkler: {
    title: 'Water Sprinkler Tanker Tracking',
    subtitle: 'Dust suppression tanker telemetry with GPS traces and CCTV route confirmation',
    icon: 'water_drop',
    accent: '#007bc0',
    light: '#dff2ff',
    feedLabel: 'SPRINKLER TANKER FLEET',
    vehicles: [
      {
        id: 'PWD-WS-006',
        plate: 'DL1WT 2046',
        ward: 'ITO to Pragati Maidan',
        driver: 'A. Bisht',
        status: 'Sprinkling active',
        speed: 18,
        gpsSignature: 'GPS/PWD/WS006/0x31AF90',
        offset: 1,
        route: [[28.6304, 77.2426], [28.6261, 77.2399], [28.6200, 77.2352], [28.6142, 77.2318], [28.6092, 77.2328], [28.6048, 77.2369], [28.6013, 77.2419]],
        cctvHits: [
          { cameraId: 'CAM_ITO_023', location: 'ITO Junction', timestamp: '10:04:12', position: [28.6261, 77.2399], confidence: 97, image: '/images/pov 1.jpeg' },
          { cameraId: 'CAM_PM_041', location: 'Bhairon Marg', timestamp: '10:12:55', position: [28.6142, 77.2318], confidence: 95, image: '/images/connaught place.jpeg' },
          { cameraId: 'CAM_PM_064', location: 'Pragati Maidan gate', timestamp: '10:23:09', position: [28.6048, 77.2369], confidence: 96, image: '/images/pov 2.jpeg' },
        ],
      },
      {
        id: 'PWD-WS-012',
        plate: 'DL1WT 6118',
        ward: 'Dwarka Sector loop',
        driver: 'P. Saini',
        status: 'Median watering active',
        speed: 24,
        gpsSignature: 'GPS/PWD/WS012/0x992AC7',
        offset: 3,
        route: [[28.5924, 77.0460], [28.5862, 77.0529], [28.5805, 77.0610], [28.5751, 77.0695], [28.5707, 77.0788], [28.5664, 77.0874], [28.5622, 77.0966]],
        cctvHits: [
          { cameraId: 'CAM_DW_017', location: 'Sector 10 crossing', timestamp: '10:07:48', position: [28.5862, 77.0529], confidence: 94, image: '/images/dwarka.jpeg' },
          { cameraId: 'CAM_DW_053', location: 'Sector 12 market road', timestamp: '10:20:14', position: [28.5751, 77.0695], confidence: 92, image: '/images/pov 5.jpeg' },
          { cameraId: 'CAM_DW_081', location: 'Sector 13 metro approach', timestamp: '10:31:36', position: [28.5664, 77.0874], confidence: 97, image: '/images/pov 6.jpeg' },
        ],
      },
      {
        id: 'PWD-WS-018',
        plate: 'DL1WT 8821',
        ward: 'Rohini arterial roads',
        driver: 'K. Tomar',
        status: 'AQI priority corridor',
        speed: 20,
        gpsSignature: 'GPS/PWD/WS018/0xF04219',
        offset: 5,
        route: [[28.7041, 77.1025], [28.7004, 77.1114], [28.6966, 77.1208], [28.6918, 77.1301], [28.6867, 77.1392], [28.6812, 77.1485], [28.6764, 77.1577]],
        cctvHits: [
          { cameraId: 'CAM_RH_011', location: 'Rohini Sector 3', timestamp: '10:02:37', position: [28.7004, 77.1114], confidence: 93, image: '/images/rohini.jpeg' },
          { cameraId: 'CAM_RH_048', location: 'Outer Ring Road', timestamp: '10:16:19', position: [28.6918, 77.1301], confidence: 96, image: '/images/pov 3.jpeg' },
          { cameraId: 'CAM_RH_077', location: 'Madhuban Chowk', timestamp: '10:28:25', position: [28.6812, 77.1485], confidence: 95, image: '/images/pov 4.jpeg' },
        ],
      },
    ],
  },
};

function MapSizeUpdater() {
  const map = useMap();

  useEffect(() => {
    const timeout = window.setTimeout(() => map.invalidateSize(), 250);
    return () => window.clearTimeout(timeout);
  }, [map]);

  return null;
}

function createVehicleIcon(vehicle: Vehicle, accent: string, icon: string) {
  return new L.DivIcon({
    className: 'bg-transparent',
    html: `<div style="background:${accent}" class="w-9 h-9 border-2 border-black rounded-full flex items-center justify-center shadow-[0_0_18px_rgba(0,0,0,0.25)]"><span class="material-symbols-outlined text-white text-[18px]">${icon}</span></div><div class="font-mono text-[8px] font-black text-black bg-white/95 border border-black px-1 mt-1 whitespace-nowrap">${vehicle.id}</div>`,
    iconSize: [90, 48],
    iconAnchor: [18, 18],
  });
}

const cameraIcon = new L.DivIcon({
  className: 'bg-transparent',
  html: '<div class="w-6 h-6 bg-black border-2 border-[#ffe600] rounded-sm flex items-center justify-center shadow-lg"><span class="material-symbols-outlined text-[#ffe600] text-[14px]">videocam</span></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function interpolate(route: LatLng[], tick: number, offset: number) {
  const progress = ((tick + offset) % 12) / 12;
  const scaled = progress * (route.length - 1);
  const index = Math.min(Math.floor(scaled), route.length - 2);
  const local = scaled - index;
  const current = route[index];
  const next = route[index + 1];

  return {
    index,
    position: [
      current[0] + (next[0] - current[0]) * local,
      current[1] + (next[1] - current[1]) * local,
    ] as LatLng,
  };
}

function tracedRoute(vehicle: Vehicle, tick: number) {
  const { index, position } = interpolate(vehicle.route, tick, vehicle.offset);
  return [...vehicle.route.slice(0, index + 1), position];
}

export default function VehicleTracking({ mode }: { mode: Mode }) {
  const navigate = useNavigate();
  const { addLog } = useAuditLog();
  const [tick, setTick] = useState(0);
  const [selectedId, setSelectedId] = useState(CONFIG[mode].vehicles[0].id);
  const config = CONFIG[mode];
  const selectedVehicle = config.vehicles.find((vehicle) => vehicle.id === selectedId) || config.vehicles[0];

  useEffect(() => {
    addLog('FLEET_TRACKING_OPENED', `${config.title} opened with GPS and CCTV evidence overlays`);
  }, [addLog, config.title]);

  useEffect(() => {
    const interval = window.setInterval(() => setTick((value) => value + 1), 1200);
    return () => window.clearInterval(interval);
  }, []);

  const livePositions = useMemo(() => {
    return config.vehicles.map((vehicle) => ({
      vehicle,
      ...interpolate(vehicle.route, tick, vehicle.offset),
    }));
  }, [config.vehicles, tick]);

  const activeHitCount = selectedVehicle.cctvHits.filter((_, index) => index <= interpolate(selectedVehicle.route, tick, selectedVehicle.offset).index).length;

  return (
    <div className="relative h-full w-full overflow-hidden bg-white text-black">
      <div className="absolute inset-0">
        <MapContainer center={CENTER} zoom={11} zoomControl={false} style={{ height: '100%', width: '100%', background: '#ffffff' }}>
          <MapSizeUpdater />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {config.vehicles.map((vehicle) => (
            <React.Fragment key={`trace-${vehicle.id}`}>
              <Polyline positions={vehicle.route} pathOptions={{ color: '#000000', weight: 2, opacity: 0.2, dashArray: '4, 8' }} />
              <Polyline positions={tracedRoute(vehicle, tick)} pathOptions={{ color: config.accent, weight: selectedId === vehicle.id ? 6 : 4, opacity: selectedId === vehicle.id ? 0.95 : 0.55 }} />
              <Polyline positions={vehicle.cctvHits.map((hit) => hit.position)} pathOptions={{ color: '#ffba38', weight: 3, opacity: 0.85, dashArray: '10, 8' }} />
              {vehicle.cctvHits.map((hit) => (
                <Marker key={`${vehicle.id}-${hit.cameraId}`} position={hit.position} icon={cameraIcon}>
                  <Popup className="custom-popup">
                    <div className="min-w-[220px] bg-white p-3 font-mono text-[10px] text-black">
                      <img src={img(hit.image)} alt={hit.location} className="mb-2 h-24 w-full border border-black/10 object-cover" />
                      <div className="font-black">{hit.cameraId}</div>
                      <div>{hit.location}</div>
                      <div className="mt-1 bg-[#ffe600] px-1 font-black">CCTV HIT: {hit.timestamp}</div>
                      <div>Vehicle match confidence: {hit.confidence}%</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </React.Fragment>
          ))}

          {livePositions.map(({ vehicle, position }) => (
            <Marker key={vehicle.id} position={position} icon={createVehicleIcon(vehicle, config.accent, config.icon)} eventHandlers={{ click: () => setSelectedId(vehicle.id) }}>
              <Popup className="custom-popup">
                <div className="min-w-[240px] bg-white p-3 font-mono text-[10px] text-black">
                  <div className="mb-1 text-sm font-black">{vehicle.id}</div>
                  <div>Plate: {vehicle.plate}</div>
                  <div>Route: {vehicle.ward}</div>
                  <div>Driver: {vehicle.driver}</div>
                  <div>Speed: {vehicle.speed + (tick % 4)} km/h</div>
                  <div className="mt-2 break-all bg-black px-2 py-1 text-white">{vehicle.gpsSignature}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-white/10" />

      <section className="absolute left-6 top-6 z-[500] w-[min(560px,calc(100%-3rem))] border border-black/10 bg-white/95 p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 border border-black bg-[#ffe600] px-2 py-1 font-mono text-[10px] font-black tracking-widest">
              <span className="material-symbols-outlined text-sm">{config.icon}</span>
              {config.feedLabel}
            </div>
            <h1 className="font-headline text-3xl font-black uppercase tracking-tighter">{config.title}</h1>
            <p className="mt-1 max-w-xl font-mono text-[11px] font-bold uppercase tracking-widest">{config.subtitle}</p>
          </div>
          <button
            onClick={() => navigate('/gis-map')}
            className="pointer-events-auto shrink-0 border border-black bg-white p-2 text-black transition-colors hover:bg-black hover:text-white"
            title="Back to GIS map"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="border border-black/10 bg-surface-container-highest p-3">
            <div className="font-mono text-[9px] font-black uppercase tracking-widest">Live GPS Units</div>
            <div className="font-mono text-2xl font-black">{config.vehicles.length}</div>
          </div>
          <div className="border border-black/10 bg-surface-container-highest p-3">
            <div className="font-mono text-[9px] font-black uppercase tracking-widest">CCTV Evidence</div>
            <div className="font-mono text-2xl font-black">{config.vehicles.reduce((total, vehicle) => total + vehicle.cctvHits.length, 0)}</div>
          </div>
          <div className="border border-black/10 p-3" style={{ background: config.light }}>
            <div className="font-mono text-[9px] font-black uppercase tracking-widest">Trace Refresh</div>
            <div className="font-mono text-2xl font-black">{(1.2).toFixed(1)}s</div>
          </div>
        </div>
      </section>

      <section className="absolute bottom-6 left-6 z-[500] w-[min(560px,calc(100%-3rem))] border border-black/10 bg-white/95 p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between border-b border-black/10 pb-2">
          <span className="font-mono text-[10px] font-black uppercase tracking-widest">Fleet Units</span>
          <span className="font-mono text-[10px] font-black" style={{ color: config.accent }}>GPS + CCTV FUSED</span>
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          {config.vehicles.map((vehicle) => {
            const live = livePositions.find((item) => item.vehicle.id === vehicle.id);
            return (
              <button
                key={vehicle.id}
                onClick={() => setSelectedId(vehicle.id)}
                className={`pointer-events-auto border p-3 text-left transition-colors ${selectedId === vehicle.id ? 'border-black bg-[#ffe600]' : 'border-black/10 bg-white hover:bg-surface-container-highest'}`}
              >
                <div className="font-mono text-[11px] font-black">{vehicle.id}</div>
                <div className="mt-1 font-mono text-[9px] font-bold uppercase">{vehicle.plate}</div>
                <div className="mt-1 font-mono text-[9px] font-bold">{vehicle.ward}</div>
                <div className="mt-2 font-mono text-[9px] font-bold">{vehicle.status}</div>
                <div className="mt-2 font-mono text-[9px] font-black">GPS {live?.position[0].toFixed(4)}, {live?.position[1].toFixed(4)}</div>
              </button>
            );
          })}
        </div>
      </section>

      <aside className="absolute bottom-6 right-6 top-6 z-[500] flex w-[min(420px,calc(100%-3rem))] flex-col border border-black/10 bg-white/95 shadow-2xl">
        <div className="border-b border-black/10 p-4">
          <div className="font-mono text-[10px] font-black uppercase tracking-widest">Selected Track</div>
          <h2 className="mt-1 font-headline text-2xl font-black uppercase tracking-tighter">{selectedVehicle.id}</h2>
          <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-[10px] font-bold">
            <span>Plate: {selectedVehicle.plate}</span>
            <span>Speed: {selectedVehicle.speed + (tick % 4)} km/h</span>
            <span>Driver: {selectedVehicle.driver}</span>
            <span>CCTV Hits: {activeHitCount}/{selectedVehicle.cctvHits.length}</span>
          </div>
          <div className="mt-2 font-mono text-[10px] font-bold">Route: {selectedVehicle.ward}</div>
          <div className="mt-3 break-all border border-black bg-black px-3 py-2 font-mono text-[10px] font-bold text-white">
            GPS SIGNATURE: {selectedVehicle.gpsSignature}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="mb-3 font-mono text-[10px] font-black uppercase tracking-widest">CCTV Video Evidence Timeline</div>
          <div className="space-y-3">
            {selectedVehicle.cctvHits.map((hit, index) => {
              const isConfirmed = index < activeHitCount;
              return (
                <div key={hit.cameraId} className={`border p-3 ${isConfirmed ? 'border-black bg-white' : 'border-black/10 bg-surface-container-highest opacity-70'}`}>
                  <div className="flex gap-3">
                    <img src={img(hit.image)} alt={hit.location} className="h-20 w-28 shrink-0 border border-black/10 object-cover" />
                    <div className="min-w-0 font-mono text-[10px]">
                      <div className="font-black">{hit.timestamp} / {hit.cameraId}</div>
                      <div className="mt-1 font-bold">{hit.location}</div>
                      <div className="mt-2 inline-block px-2 py-1 font-black" style={{ background: isConfirmed ? config.light : '#f5f5f5' }}>
                        {isConfirmed ? 'CONFIRMED PASSAGE' : 'UPCOMING CAMERA'}
                      </div>
                      <div className="mt-2 font-bold">Video match: {hit.confidence}%</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
}
