import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { useAuditLog } from '../context/AuditLogContext';

type Mode = 'garbage' | 'sprinkler';
type LatLng = [number, number];

type CctvHit = {
  cameraId: string;
  location: string;
  timestamp: string;
  position: LatLng;
  confidence: number;
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
  center: LatLng;
  zoom: number;
  vehicles: Vehicle[];
};

const CONFIG: Record<Mode, TrackingConfig> = {
  garbage: {
    title: 'Garbage Truck Tracking',
    subtitle: 'Live sanitation fleet trace through GPS signatures and CCTV evidence hits',
    icon: 'local_shipping',
    accent: '#198754',
    light: '#d9f7e5',
    feedLabel: 'SOLID WASTE FLEET',
    center: [28.6139, 77.2295],
    zoom: 14,
    vehicles: [
      {
        id: 'MCD-GT-014',
        plate: 'DL1GC 4812',
        ward: 'Connaught Place inner service loop',
        driver: 'R. Meena',
        status: 'Collection route active',
        speed: 18,
        gpsSignature: 'GPS/SWACHH/GT014/0x7A91F2',
        offset: 0,
        route: [[28.6328, 77.2191], [28.6294, 77.2236], [28.6312, 77.2283], [28.6268, 77.2327], [28.6233, 77.2298], [28.6199, 77.2341], [28.6168, 77.2304], [28.6129, 77.2338], [28.6093, 77.2296]],
        cctvHits: [
          { cameraId: 'CAM_CP_044', location: 'Baba Kharak Singh Marg', timestamp: '09:12:08', position: [28.6294, 77.2236], confidence: 96 },
          { cameraId: 'CAM_CP_118', location: 'Outer Circle north', timestamp: '09:20:41', position: [28.6268, 77.2327], confidence: 94 },
          { cameraId: 'CAM_CP_031', location: 'Janpath service lane', timestamp: '09:31:17', position: [28.6168, 77.2304], confidence: 98 },
        ],
      },
      {
        id: 'MCD-GT-027',
        plate: 'DL1GC 7395',
        ward: 'Mandi House civic lane circuit',
        driver: 'S. Khan',
        status: 'Bin pickup verified',
        speed: 16,
        gpsSignature: 'GPS/SWACHH/GT027/0x2C44D9',
        offset: 2,
        route: [[28.6261, 77.2384], [28.6232, 77.2411], [28.6201, 77.2379], [28.6175, 77.2418], [28.6149, 77.2384], [28.6115, 77.2422], [28.6082, 77.2390], [28.6049, 77.2434], [28.6014, 77.2402]],
        cctvHits: [
          { cameraId: 'CAM_MH_052', location: 'Mandi House circle', timestamp: '09:08:52', position: [28.6232, 77.2411], confidence: 97 },
          { cameraId: 'CAM_BM_019', location: 'Bhairon Marg slip road', timestamp: '09:18:36', position: [28.6175, 77.2418], confidence: 93 },
          { cameraId: 'CAM_PG_087', location: 'Pragati Maidan service gate', timestamp: '09:29:03', position: [28.6082, 77.2390], confidence: 95 },
        ],
      },
      {
        id: 'MCD-GT-039',
        plate: 'DL1GC 9051',
        ward: 'India Gate sanitation loop',
        driver: 'N. Rawat',
        status: 'Transfer station inbound',
        speed: 19,
        gpsSignature: 'GPS/SWACHH/GT039/0xB51E20',
        offset: 4,
        route: [[28.6173, 77.2212], [28.6138, 77.2244], [28.6166, 77.2286], [28.6127, 77.2315], [28.6094, 77.2273], [28.6058, 77.2311], [28.6026, 77.2269], [28.5998, 77.2308], [28.5964, 77.2267]],
        cctvHits: [
          { cameraId: 'CAM_IG_016', location: 'Kartavya Path north', timestamp: '09:05:14', position: [28.6138, 77.2244], confidence: 92 },
          { cameraId: 'CAM_IG_073', location: 'India Gate hexagon east', timestamp: '09:19:22', position: [28.6094, 77.2273], confidence: 96 },
          { cameraId: 'CAM_IG_099', location: 'Shahjahan Road approach', timestamp: '09:27:40', position: [28.6026, 77.2269], confidence: 94 },
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
    center: [28.6139, 77.2295],
    zoom: 14,
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
        route: [[28.6298, 77.2364], [28.6259, 77.2398], [28.6228, 77.2355], [28.6188, 77.2392], [28.6152, 77.2351], [28.6116, 77.2390], [28.6078, 77.2354], [28.6041, 77.2397]],
        cctvHits: [
          { cameraId: 'CAM_ITO_023', location: 'Tilak Bridge approach', timestamp: '10:04:12', position: [28.6259, 77.2398], confidence: 97 },
          { cameraId: 'CAM_PM_041', location: 'Bhairon Marg', timestamp: '10:12:55', position: [28.6152, 77.2351], confidence: 95 },
          { cameraId: 'CAM_PM_064', location: 'Pragati Maidan gate', timestamp: '10:23:09', position: [28.6078, 77.2354], confidence: 96 },
        ],
      },
      {
        id: 'PWD-WS-012',
        plate: 'DL1WT 6118',
        ward: 'Central Vista misting loop',
        driver: 'P. Saini',
        status: 'Median watering active',
        speed: 24,
        gpsSignature: 'GPS/PWD/WS012/0x992AC7',
        offset: 3,
        route: [[28.6207, 77.2151], [28.6171, 77.2197], [28.6199, 77.2238], [28.6154, 77.2264], [28.6117, 77.2225], [28.6080, 77.2262], [28.6044, 77.2221], [28.6009, 77.2259]],
        cctvHits: [
          { cameraId: 'CAM_CV_017', location: 'Rafi Marg', timestamp: '10:07:48', position: [28.6171, 77.2197], confidence: 94 },
          { cameraId: 'CAM_CV_053', location: 'Kartavya Path median', timestamp: '10:20:14', position: [28.6117, 77.2225], confidence: 92 },
          { cameraId: 'CAM_CV_081', location: 'Man Singh Road', timestamp: '10:31:36', position: [28.6044, 77.2221], confidence: 97 },
        ],
      },
      {
        id: 'PWD-WS-018',
        plate: 'DL1WT 8821',
        ward: 'Supreme Court AQI corridor',
        driver: 'K. Tomar',
        status: 'AQI priority corridor',
        speed: 20,
        gpsSignature: 'GPS/PWD/WS018/0xF04219',
        offset: 5,
        route: [[28.6269, 77.2472], [28.6226, 77.2440], [28.6197, 77.2485], [28.6154, 77.2452], [28.6120, 77.2493], [28.6082, 77.2460], [28.6049, 77.2503], [28.6012, 77.2471]],
        cctvHits: [
          { cameraId: 'CAM_SC_011', location: 'Tilak Marg', timestamp: '10:02:37', position: [28.6226, 77.2440], confidence: 93 },
          { cameraId: 'CAM_SC_048', location: 'Supreme Court crossing', timestamp: '10:16:19', position: [28.6154, 77.2452], confidence: 96 },
          { cameraId: 'CAM_SC_077', location: 'Mathura Road slip lane', timestamp: '10:28:25', position: [28.6049, 77.2503], confidence: 95 },
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

function createVehicleIcon(vehicle: Vehicle, accent: string, mode: Mode) {
  const secondaryIcon = mode === 'sprinkler' ? 'water_drop' : 'recycling';
  return new L.DivIcon({
    className: 'bg-transparent',
    html: `<div class="relative flex flex-col items-center"><div style="background:${accent}" class="w-12 h-12 rounded-[10px] border border-black/70 shadow-[0_8px_22px_rgba(0,0,0,0.22)] flex items-center justify-center"><span class="material-symbols-outlined text-white text-[28px]">local_shipping</span><span class="material-symbols-outlined absolute right-[9px] bottom-[19px] text-white text-[13px]">${secondaryIcon}</span></div><div class="mt-1 rounded-sm border border-black/20 bg-white/95 px-1.5 py-0.5 font-mono text-[8px] font-black text-black shadow-sm whitespace-nowrap">${vehicle.id}</div></div>`,
    iconSize: [110, 64],
    iconAnchor: [24, 24],
  });
}

const cameraIcon = new L.DivIcon({
  className: 'bg-transparent',
  html: '<div class="w-8 h-8 rounded-full bg-white border border-black/50 shadow-[0_6px_18px_rgba(0,0,0,0.18)] flex items-center justify-center"><span class="material-symbols-outlined text-black text-[17px]">videocam</span></div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
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
  const goBackToMap = () => {
    addLog('NAVIGATION', 'Returned to GIS MAP from fleet tracking');
    navigate('/gis-map', { replace: false });
  };

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
        <MapContainer center={config.center} zoom={config.zoom} zoomControl={false} style={{ height: '100%', width: '100%', background: '#ffffff' }}>
          <MapSizeUpdater />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {config.vehicles.map((vehicle) => (
            <React.Fragment key={`trace-${vehicle.id}`}>
              <Polyline positions={vehicle.route} pathOptions={{ color: '#111111', weight: 3, opacity: 0.18, dashArray: '6, 10' }} />
              <Polyline positions={tracedRoute(vehicle, tick)} pathOptions={{ color: config.accent, weight: selectedId === vehicle.id ? 5 : 3, opacity: selectedId === vehicle.id ? 0.95 : 0.45 }} />
              <Polyline positions={vehicle.cctvHits.map((hit) => hit.position)} pathOptions={{ color: '#111111', weight: 2, opacity: 0.45, dashArray: '3, 8' }} />
              {vehicle.cctvHits.map((hit) => (
                <Marker key={`${vehicle.id}-${hit.cameraId}`} position={hit.position} icon={cameraIcon}>
                  <Popup className="custom-popup">
                    <div className="min-w-[220px] bg-white p-3 font-mono text-[10px] text-black">
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
            <Marker key={vehicle.id} position={position} icon={createVehicleIcon(vehicle, config.accent, mode)} eventHandlers={{ click: () => setSelectedId(vehicle.id) }}>
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

      <button
        onClick={goBackToMap}
        className="absolute left-6 top-6 z-[700] flex items-center gap-2 rounded-sm border border-black bg-white px-3 py-2 font-mono text-[10px] font-black uppercase tracking-widest text-black shadow-lg transition-colors hover:bg-black hover:text-white"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Back to GIS Map
      </button>

      <section className="absolute left-6 top-20 z-[500] w-[min(560px,calc(100%-3rem))] rounded-sm border border-black/10 bg-white/95 p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-sm border border-black/10 bg-white px-2 py-1 font-mono text-[10px] font-black tracking-widest" style={{ color: config.accent }}>
              <span className="material-symbols-outlined text-sm">{config.icon}</span>
              {config.feedLabel}
            </div>
            <h1 className="font-headline text-3xl font-black uppercase tracking-tighter">{config.title}</h1>
            <p className="mt-1 max-w-xl font-mono text-[11px] font-bold uppercase tracking-widest">{config.subtitle}</p>
          </div>
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

      <section className="absolute bottom-6 left-6 z-[500] w-[min(560px,calc(100%-3rem))] rounded-sm border border-black/10 bg-white/95 p-4 shadow-2xl">
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
                className={`pointer-events-auto rounded-sm border p-3 text-left transition-colors ${selectedId === vehicle.id ? 'border-black bg-white' : 'border-black/10 bg-white hover:bg-surface-container-highest'}`}
                style={{ boxShadow: selectedId === vehicle.id ? `inset 4px 0 0 ${config.accent}` : undefined }}
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

      <aside className="absolute bottom-6 right-6 top-6 z-[500] flex w-[min(420px,calc(100%-3rem))] flex-col rounded-sm border border-black/10 bg-white/95 shadow-2xl">
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
          <div className="mb-4 font-mono text-[10px] font-black uppercase tracking-widest">CCTV Evidence Timeline</div>
          <div className="relative space-y-0 border-l border-black/20 pl-5">
            {selectedVehicle.cctvHits.map((hit, index) => {
              const isConfirmed = index < activeHitCount;
              return (
                <div key={hit.cameraId} className="relative pb-5">
                  <div
                    className="absolute -left-[27px] top-1 h-3.5 w-3.5 rounded-full border border-black bg-white"
                    style={{ boxShadow: isConfirmed ? `0 0 0 4px ${config.light}` : 'none' }}
                  />
                  <div className={`rounded-sm border p-3 ${isConfirmed ? 'border-black/20 bg-white' : 'border-black/10 bg-surface-container-highest opacity-70'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-mono text-[10px] font-black">{hit.timestamp} / {hit.cameraId}</div>
                        <div className="mt-1 font-mono text-[10px] font-bold">{hit.location}</div>
                      </div>
                      <span className="material-symbols-outlined rounded-full border border-black/20 bg-white p-1 text-[15px]">videocam</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 font-mono text-[9px] font-black uppercase tracking-widest">
                      <span className="rounded-sm px-2 py-1" style={{ background: isConfirmed ? config.light : '#f5f5f5' }}>
                        {isConfirmed ? 'Confirmed' : 'Upcoming'}
                      </span>
                      <span>{hit.confidence}% match</span>
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
