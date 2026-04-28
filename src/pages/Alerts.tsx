import React, { useState } from 'react';
import { useAuditLog } from '../context/AuditLogContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Alert {
  id: string;
  type: string;
  camera: string;
  location: string;
  timestamp: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  status: 'NEW' | 'ESCALATED' | 'RESOLVED';
  timeline: { time: string; event: string }[];
  image?: string;
}

const MOCK_ALERT_TYPES = [
  'DISTRESS_WOMAN_ALONE', 'MOB_GATHERING', 'POTHOLE_DETECTED', 
  'GARBAGE_OVERFLOW', 'SMOKE_FIRE_DETECTION', 'UNATTENDED_CHILD', 
  'ESCALATOR_BREAKDOWN', 'CAMERA_TAMPERING', 'STREETLIGHT_BREAKDOWN'
];

const generateMockAlerts = (): Alert[] => {
  const alerts: Alert[] = [];
  let idCounter = 1000;
  
  const rules: Record<string, { severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW', descriptions: string[], timelines: string[], image: string }> = {
    'DISTRESS_WOMAN_ALONE': { 
      severity: 'CRITICAL', 
      descriptions: ['Video analytics detected anomalous movement patterns for lone female pedestrian.', 'Object tracking indicates distress gestures.'],
      timelines: ['Video analytics algorithmic trigger.', 'Alert escalated to local PCR.'],
      image: '/images/distress woman.png'
    },
    'MOB_GATHERING': { 
      severity: 'HIGH', 
      descriptions: ['Crowd density exceeded threshold in restricted zone.', 'Rapid accumulation detected by CCTV feed analysis.'],
      timelines: ['Crowd density analytics breached.', 'Alert generated.'],
      image: '/images/mob gathering.png'
    },
    'POTHOLE_DETECTED': { 
      severity: 'MEDIUM', 
      descriptions: ['Large pothole detected causing traffic slowdown via traffic camera.', 'Surface anomaly detected from CCTV.'],
      timelines: ['Video analytics detected surface anomaly.', 'Alert logged to dashboard.'],
      image: '/images/pothole detection.png'
    },
    'GARBAGE_OVERFLOW': { 
      severity: 'LOW', 
      descriptions: ['Municipal bin overflow identified by static CCTV camera.', 'Garbage spilling onto pedestrian walkway detected.'],
      timelines: ['Volumetric analysis via camera feed exceeded 100%.', 'Sanitation alert queued.'],
      image: '/images/garbage monitoring.png'
    },
    'SMOKE_FIRE_DETECTION': { 
      severity: 'CRITICAL', 
      descriptions: ['Thick smoke and open flames identified by video analytics.', 'Fire signatures detected in waste management area.'],
      timelines: ['Video analytics detected smoke/fire signatures.', 'Emergency dispatch alert generated.'],
      image: '/images/smoke fire detection.png'
    },
    'UNATTENDED_CHILD': { 
      severity: 'HIGH', 
      descriptions: ['Child appearing to be wandering alone without adult supervision detected by station CCTV.', 'Unaccompanied minor identified in restricted zone.'],
      timelines: ['Video analytics tracked unaccompanied minor.', 'Alert sent to protection force.'],
      image: '/images/child loitering.png'
    },
    'ESCALATOR_BREAKDOWN': { 
      severity: 'MEDIUM', 
      descriptions: ['Foot overbridge escalator has stopped abruptly, logged by terminal camera.', 'Escalator stoppage without passengers cleared.'],
      timelines: ['Video flow analysis detected sudden halt.', 'Maintenance alert generated.'],
      image: '/images/escalator running.png'
    },
    'CAMERA_TAMPERING': { 
      severity: 'HIGH', 
      descriptions: ['Abrupt loss of feed and lens occlusion detected.', 'Camera feed obstructed by external object.'],
      timelines: ['Video feed diagnostic detected >90% lens occlusion.', 'Security personnel notified.'],
      image: '/images/camera fov tampering.png'
    },
    'STREETLIGHT_BREAKDOWN': { 
      severity: 'MEDIUM', 
      descriptions: ['Low illumination identified by night-vision CCTV analysis.', 'Streetlight out alert generated from video feed.'],
      timelines: ['Video analytic exposure adjustment indicates failed illumination.', 'Maintenance alert queued.'],
      image: '/images/streetlight.png'
    }
  };

  const locations = [
    'Vasant Kunj Sector C', 'Connaught Place - Palika', 'Dwarka Sector 10 Road', 
    'Karol Bagh Market', 'Industrial Area Phase 1', 'New Delhi Railway Station - Platform 1', 
    'ITO Foot Overbridge', 'South Extension Part 2', 'RK Puram Sector 5', 'Greater Kailash M-Block', 'Okhla Phase 3'
  ];

  const statuses = ['NEW', 'ESCALATED', 'RESOLVED'];

  MOCK_ALERT_TYPES.forEach(type => {
    // Generate between 12 and 24 alerts for each type
    const count = 12 + Math.floor(Math.random() * 13);
    for (let i = 0; i < count; i++) {
      const rule = rules[type];
      const descIdx = Math.floor(Math.random() * rule.descriptions.length);
      const locIdx = Math.floor(Math.random() * locations.length);
      const statIdx = Math.floor(Math.random() * statuses.length);
      
      const hour = 10 + Math.floor(Math.random() * 8);
      const min = Math.floor(Math.random() * 60).toString().padStart(2, '0');
      const sec = Math.floor(Math.random() * 60).toString().padStart(2, '0');

      alerts.push({
        id: `ALT-${idCounter++}`,
        type,
        camera: `CAM_${Math.random().toString(36).substring(2, 5).toUpperCase()}_${Math.floor(Math.random() * 100).toString().padStart(3, '0')}`,
        location: locations[locIdx],
        timestamp: `${hour}:${min}:${sec} UTC`,
        severity: rule.severity,
        description: rule.descriptions[descIdx],
        status: statuses[statIdx] as 'NEW' | 'ESCALATED' | 'RESOLVED',
        timeline: [
          { time: `${hour}:${min}:${sec}`, event: rule.timelines[0] },
          ...(statIdx > 0 ? [{ time: `${hour}:${(parseInt(min)+5).toString().padStart(2, '0')}:${sec}`, event: rule.timelines[1] }] : [])
        ],
        image: rule.image
      });
    }
  });

  return alerts.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
};

const MOCK_ALERTS: Alert[] = generateMockAlerts();

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(MOCK_ALERTS[0]);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [viewMode, setViewMode] = useState<'LIST' | 'DASHBOARD'>('DASHBOARD');
  const { addLog } = useAuditLog();

  const handleEscalate = (alertId: string, action: string) => {
    addLog('ALERT_ESCALATED', `Alert ${alertId} escalated with action: ${action}`);
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return {
          ...a,
          status: 'ESCALATED',
          timeline: [...a.timeline, { time: new Date().toLocaleTimeString('en-GB', { timeZone: 'UTC' }), event: `Escalated: ${action}` }]
        };
      }
      return a;
    }));
    if (selectedAlert?.id === alertId) {
      setSelectedAlert(prev => prev ? {
        ...prev,
        status: 'ESCALATED',
        timeline: [...prev.timeline, { time: new Date().toLocaleTimeString('en-GB', { timeZone: 'UTC' }), event: `Escalated: ${action}` }]
      } : null);
    }
  };

  const getActionButtons = (type: string, id: string) => {
    switch (type) {
      case 'DISTRESS_WOMAN_ALONE':
      case 'UNATTENDED_CHILD':
        return (
          <button onClick={() => handleEscalate(id, 'DISPATCH PCR VAN')} className="w-full py-3 bg-error text-black font-mono text-xs font-bold tracking-widest uppercase hover:bg-white hover:text-error transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">local_police</span> DISPATCH PCR VAN
          </button>
        );
      case 'MOB_GATHERING':
        return (
          <button onClick={() => handleEscalate(id, 'ALERT RIOT CONTROL')} className="w-full py-3 bg-error text-black font-mono text-xs font-bold tracking-widest uppercase hover:bg-white hover:text-error transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">groups</span> ALERT RIOT CONTROL
          </button>
        );
      case 'POTHOLE_DETECTED':
      case 'STREETLIGHT_BREAKDOWN':
        return (
          <button onClick={() => handleEscalate(id, 'ALERT PWD/MCD')} className="w-full py-3 bg-tertiary-container text-black font-mono text-xs font-bold tracking-widest uppercase hover:bg-white transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">construction</span> ALERT PWD/MCD
          </button>
        );
      case 'ESCALATOR_BREAKDOWN':
      case 'CAMERA_TAMPERING':
        return (
          <button onClick={() => handleEscalate(id, 'ALERT MAINTENANCE TEAM')} className="w-full py-3 bg-tertiary-container text-black font-mono text-xs font-bold tracking-widest uppercase hover:bg-white transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">build</span> ALERT MAINTENANCE TEAM
          </button>
        );
      case 'GARBAGE_OVERFLOW':
        return (
          <button onClick={() => handleEscalate(id, 'ALERT SANITATION DEPT')} className="w-full py-3 bg-secondary text-black font-mono text-xs font-bold tracking-widest uppercase hover:bg-white transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">delete</span> ALERT SANITATION DEPT
          </button>
        );
      case 'SMOKE_FIRE_DETECTION':
        return (
          <button onClick={() => handleEscalate(id, 'DISPATCH FIRE BRIGADE')} className="w-full py-3 bg-error text-black font-mono text-xs font-bold tracking-widest uppercase hover:bg-white hover:text-error transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">local_fire_department</span> DISPATCH FIRE BRIGADE
          </button>
        );
      default:
        return (
          <button onClick={() => handleEscalate(id, 'GENERAL ESCALATION')} className="w-full py-3 bg-primary-fixed text-black font-mono text-xs font-bold tracking-widest uppercase hover:bg-white transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">campaign</span> ESCALATE INCIDENT
          </button>
        );
    }
  };

  // Dashboard calculations
  const totalAlerts = alerts.length;
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL').length;
  const highAlerts = alerts.filter(a => a.severity === 'HIGH').length;
  const mediumAlerts = alerts.filter(a => a.severity === 'MEDIUM').length;
  const lowAlerts = alerts.filter(a => a.severity === 'LOW').length;

  const alertsByTypeData = alerts.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.type);
    if (existing) existing.count += 1;
    else acc.push({ name: curr.type, count: 1 });
    return acc;
  }, [] as { name: string; count: number }[]);

  const alertsByStateData = [
    { name: 'NEW', count: alerts.filter(a => a.status === 'NEW').length },
    { name: 'ESCALATED', count: alerts.filter(a => a.status === 'ESCALATED').length },
    { name: 'RESOLVED', count: alerts.filter(a => a.status === 'RESOLVED').length },
  ];
  
  const CATEGORY_COLORS = [
    'border-l-[#ffb4ab] text-black',
    'border-l-[#ffe600] text-black',
    'border-l-[#b5f5d1] text-black',
    'border-l-[#ffc085] text-black',
    'border-l-[#c4e0f9] text-black',
    'border-l-[#e3d1ff] text-black',
    'border-l-[#ffa8c5] text-black',
    'border-l-[#aee8ff] text-black',
    'border-l-[#000000] text-black',
  ];

  const COLORS = ['#ffe600', '#ffb4ab', '#b5f5d1', '#000000'];

  return (
    <div className="w-full h-full flex flex-col bg-surface-dim overflow-hidden">
      {/* Top Bar for View Toggle */}
      <div className="p-4 border-b border-black/10 bg-surface-dim flex justify-between items-center z-10 shrink-0">
        <div>
           <h1 className="font-headline font-black text-2xl tracking-tighter text-black uppercase">ALERTS & DASHBOARD</h1>
           <p className="font-mono text-[10px] text-black tracking-widest hidden md:block">AI DETECTIONS & METRICS OVERVIEW</p>
        </div>
        <div className="flex bg-surface-container border border-black/10 p-1">
          <button 
            onClick={() => {
              setViewMode('DASHBOARD');
              addLog('UI_ACTION', 'Switched to Alerts Dashboard view');
            }}
            className={`font-mono text-[10px] font-bold tracking-widest uppercase px-4 py-2 transition-colors flex items-center gap-2 ${viewMode === 'DASHBOARD' ? 'bg-primary-fixed text-black shadow-sm' : 'text-black/60 hover:text-black hover:bg-black/5'}`}
          >
            <span className="material-symbols-outlined text-[14px]">dashboard</span> DASHBOARD
          </button>
          <button 
            onClick={() => {
              setViewMode('LIST');
              addLog('UI_ACTION', 'Switched to Alerts List view');
            }}
            className={`font-mono text-[10px] font-bold tracking-widest uppercase px-4 py-2 transition-colors flex items-center gap-2 ${viewMode === 'LIST' ? 'bg-primary-fixed text-black shadow-sm' : 'text-black/60 hover:text-black hover:bg-black/5'}`}
          >
            <span className="material-symbols-outlined text-[14px]">list_alt</span> ALERT FEED
          </button>
        </div>
      </div>

      {viewMode === 'DASHBOARD' ? (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-surface-dim">
          {/* Top KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="glass-panel border-l-4 border-black p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="text-[10px] font-mono text-black font-bold uppercase tracking-widest mb-2">Total Alerts</div>
              <div className="text-4xl font-mono text-black font-black">{totalAlerts}</div>
            </div>
            <div className="glass-panel border-l-4 border-error p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="text-[10px] font-mono text-error font-bold uppercase tracking-widest mb-2">Critical</div>
              <div className="text-4xl font-mono text-error font-black">{criticalAlerts}</div>
            </div>
            <div className="glass-panel border-l-4 border-tertiary-container p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="text-[10px] font-mono text-tertiary-container font-bold uppercase tracking-widest mb-2 text-tertiary-container">High</div>
              <div className="text-4xl font-mono text-black font-black">{highAlerts}</div>
            </div>
            <div className="glass-panel border-l-4 border-secondary p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="text-[10px] font-mono text-secondary font-bold uppercase tracking-widest mb-2 text-secondary">Medium</div>
              <div className="text-4xl font-mono text-black font-black">{mediumAlerts}</div>
            </div>
            <div className="glass-panel border-l-4 border-primary-fixed p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="text-[10px] font-mono text-black font-bold uppercase tracking-widest mb-2">Low</div>
              <div className="text-4xl font-mono text-black font-black">{lowAlerts}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
            <div className="glass-panel p-6 border border-black/10 flex flex-col bg-white overflow-hidden shadow-sm">
              <h3 className="font-mono text-sm font-bold text-black uppercase tracking-widest mb-6 border-b border-black/5 pb-4">Alerts By Category</h3>
              <div className="flex-1 grid grid-cols-2 gap-4">
                {alertsByTypeData.map((type, idx) => (
                  <div key={idx} className={`bg-surface-dim border-y border-r border-black/5 border-l-4 ${CATEGORY_COLORS[idx % CATEGORY_COLORS.length].split(' ')[0]} p-4 flex flex-col justify-between hover:bg-black/5 transition-colors group shadow-sm`}>
                    <div className="font-mono text-[10px] font-bold text-black/70 uppercase tracking-tighter leading-tight group-hover:text-black">
                      {type.name.replace(/_/g, ' ')}
                    </div>
                    <div className="flex items-baseline gap-1 mt-3">
                      <span className="font-mono text-3xl font-black text-black">{type.count}</span>
                      <span className="font-mono text-[9px] text-black font-bold uppercase">Incidents</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="glass-panel p-6 border border-black/10 flex flex-col bg-white flex-1 min-h-[400px]">
              <h3 className="font-mono text-sm font-bold text-black uppercase tracking-widest mb-2 border-b border-black/5 pb-4">Alert Resolution Status</h3>
              <div className="flex-1 w-full min-h-[220px] relative mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={alertsByStateData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={5}
                      dataKey="count"
                      stroke="none"
                    >
                      {alertsByStateData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', fontFamily: 'monospace', fontSize: '10px' }} itemStyle={{ color: '#000000' }} />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <div className="text-4xl font-mono text-black font-black">{totalAlerts}</div>
                  <div className="text-[10px] font-mono text-black font-bold uppercase tracking-widest mt-1">Total</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {alertsByStateData.map((entry, index) => (
                  <div key={entry.name} className="flex flex-col items-center gap-1 border-r border-black/5 last:border-r-0">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="font-mono text-[9px] text-black font-bold uppercase tracking-widest">{entry.name}</span>
                    <span className="font-mono text-sm text-black font-bold">{entry.count}</span>
                  </div>
                ))}
              </div>

              {/* Ticker Section */}
              <div className="mt-8 pt-4 border-t border-black/10 overflow-hidden relative">
                <div className="font-mono text-[10px] font-bold text-error uppercase tracking-widest mb-3 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></div> Live Detections
                </div>
                <div className="flex overflow-hidden">
                  <div className="flex whitespace-nowrap animate-marquee gap-8 items-center text-[11px] font-mono font-bold uppercase tracking-widest text-black/80">
                     <span>🚨 POTHOLE DETECTED IN VASANT KUNJ (CAM-VK-04)</span>
                     <span className="text-black/30">•</span>
                     <span>🔥 SMOKE & FIRE DETECTED IN OKHLA PHASE 2</span>
                     <span className="text-black/30">•</span>
                     <span className="text-secondary">⚠️ UNATTENDED CHILD AT CONNAUGHT PLACE</span>
                     <span className="text-black/30">•</span>
                     <span>🚨 MOB GATHERING IN ROHINI SECTOR 9</span>
                     <span className="text-black/30">•</span>
                     <span>⚠️ STREETLIGHT BREAKDOWN IN SOUTH EX</span>
                     <span className="text-black/30">•</span>
                  </div>
                  {/* Duplicate for seamless looping */}
                  <div className="flex whitespace-nowrap animate-marquee gap-8 items-center text-[11px] font-mono font-bold uppercase tracking-widest text-black/80" aria-hidden="true">
                     <span className="pl-8">🚨 POTHOLE DETECTED IN VASANT KUNJ (CAM-VK-04)</span>
                     <span className="text-black/30">•</span>
                     <span>🔥 SMOKE & FIRE DETECTED IN OKHLA PHASE 2</span>
                     <span className="text-black/30">•</span>
                     <span className="text-secondary">⚠️ UNATTENDED CHILD AT CONNAUGHT PLACE</span>
                     <span className="text-black/30">•</span>
                     <span>🚨 MOB GATHERING IN ROHINI SECTOR 9</span>
                     <span className="text-black/30">•</span>
                     <span>⚠️ STREETLIGHT BREAKDOWN IN SOUTH EX</span>
                     <span className="text-black/30">•</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Alerts List */}
          <div className="w-1/3 border-r border-black/10 flex flex-col bg-surface-dim">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-2">
              {alerts.map(alert => (
                <div 
                  key={alert.id}
                  onClick={() => {
                    addLog('UI_ACTION', `Viewed details for alert ${alert.id}`);
                    setSelectedAlert(alert);
                  }}
                  className={`p-4 border cursor-pointer transition-colors ${selectedAlert?.id === alert.id ? 'bg-surface-container-highest border-primary-fixed shadow-md' : 'bg-surface-container-low border-black/5 hover:border-black/20'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`font-mono text-[10px] font-bold px-2 py-0.5 ${alert.severity === 'CRITICAL' ? 'bg-error text-black' : alert.severity === 'HIGH' ? 'bg-tertiary-container text-black' : 'bg-secondary text-black'}`}>
                      {alert.severity}
                    </span>
                    <span className="font-mono text-[10px] text-black">{alert.timestamp}</span>
                  </div>
                  <div className="font-mono text-xs text-black font-bold mb-1">{alert.type}</div>
                  <div className="font-mono text-[10px] text-black truncate">{alert.location}</div>
                  {alert.status === 'ESCALATED' && (
                    <div className="mt-2 font-mono text-[9px] bg-primary-fixed text-black font-bold uppercase tracking-widest flex items-center gap-1 px-1.5 py-0.5 inline-block">
                      <span className="material-symbols-outlined text-[12px]">check_circle</span> ESCALATED
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel: Alert Details & Action */}
          <div className="flex-1 flex flex-col bg-white">
            {selectedAlert ? (
              <>
                <div className="p-8 border-b border-black/10">
                  <div className="flex gap-8 items-start">
                    <div className="w-1/3 aspect-video bg-black border border-black overflow-hidden shadow-inner">
                      {selectedAlert.image && (
                        <img 
                          src={selectedAlert.image} 
                          alt="Incident Analytics Feed" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-all duration-700" 
                        />
                      )}
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-error text-white font-mono text-[8px] font-bold animate-pulse">LIVE FEED ANALYTICS</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h2 className="font-headline font-black text-3xl tracking-tighter text-black uppercase">{selectedAlert.type.replace(/_/g, ' ')}</h2>
                            <span className={`font-mono text-xs font-bold px-2 py-1 ${selectedAlert.severity === 'CRITICAL' ? 'bg-error text-black' : selectedAlert.severity === 'HIGH' ? 'bg-tertiary-container text-black' : 'bg-secondary text-black'}`}>
                              {selectedAlert.severity}
                            </span>
                          </div>
                          <div className="font-mono text-sm text-black tracking-widest">{selectedAlert.id} • {selectedAlert.camera} • {selectedAlert.location}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-xs text-black uppercase tracking-widest mb-1">Detected At</div>
                          <div className="font-mono text-lg text-black">{selectedAlert.timestamp}</div>
                        </div>
                      </div>
                      <p className="font-mono text-sm text-black leading-relaxed border-l-2 border-black/20 pl-4 py-1 mt-4">
                        {selectedAlert.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar flex gap-8">
                  {/* Timeline */}
                  <div className="flex-1">
                    <h3 className="font-mono text-xs text-black uppercase tracking-widest mb-6">Incident Timeline</h3>
                    <div className="relative border-l border-black/20 ml-3 space-y-6">
                      {selectedAlert.timeline.map((item, idx) => (
                        <div key={idx} className="relative pl-6">
                          <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-primary-fixed rounded-full shadow-[0_0_10px_rgba(255,230,0,0.5)]"></div>
                          <div className="font-mono text-[10px] bg-primary-fixed text-black px-1 font-bold inline-block mb-1">{item.time}</div>
                          <div className="font-mono text-sm text-black">{item.event}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Panel */}
                  <div className="w-80 flex flex-col gap-4">
                    <h3 className="font-mono text-xs text-black uppercase tracking-widest mb-2">Standard Operating Procedure</h3>
                    <div className="glass-panel border border-black/10 p-6 flex flex-col gap-4">
                      {selectedAlert.status === 'NEW' ? (
                        <>
                          <div className="font-mono text-xs text-black mb-4">
                            Review the incident details and timeline. If the anomaly is verified, escalate to the appropriate response team immediately.
                          </div>
                          {getActionButtons(selectedAlert.type, selectedAlert.id)}
                          <button 
                            onClick={() => setShowEvidenceModal(true)}
                            className="w-full py-3 bg-surface-container border border-black/20 text-black font-mono text-xs tracking-widest uppercase hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[16px]">send</span> SEND EVIDENCE PACKET
                          </button>
                          <button 
                            onClick={() => addLog('EVIDENCE_ACTION', `Downloaded evidence zip for alert ${selectedAlert.id}`)}
                            className="w-full py-3 bg-surface-container border border-black/20 text-black font-mono text-xs tracking-widest uppercase hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[16px]">folder_zip</span> DOWNLOAD AS ZIP
                          </button>
                          <button className="w-full py-3 bg-surface-container border border-black/20 text-black font-mono text-xs tracking-widest uppercase hover:bg-white/10 transition-colors mt-4">
                            DISMISS (FALSE POSITIVE)
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
                          <div className="bg-primary-fixed text-black w-12 h-12 flex items-center justify-center border border-black/10">
                            <span className="material-symbols-outlined text-4xl">task_alt</span>
                          </div>
                          <div>
                            <div className="font-mono text-lg bg-primary-fixed text-black px-2 py-1 font-bold mb-1">INCIDENT ESCALATED</div>
                            <div className="font-mono text-xs text-black">Response team has been notified.</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center font-mono text-black">
                SELECT AN ALERT TO VIEW DETAILS
              </div>
            )}
          </div>
        </div>
      )}

      {/* Evidence Packet Modal */}
      {showEvidenceModal && selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-[800px] bg-white border border-black/10 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-black/10 flex justify-between items-center bg-surface-container-lowest">
              <h2 className="font-headline font-black text-xl tracking-widest text-black uppercase flex items-center gap-2">
                <span className="material-symbols-outlined bg-primary-fixed text-black px-1 border border-black">inventory_2</span>
                EVIDENCE PACKET PREVIEW
              </h2>
              <button onClick={() => setShowEvidenceModal(false)} className="text-black hover:text-black transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="font-mono text-[10px] text-black uppercase tracking-widest mb-1">Analytics Frame Evidence</div>
                    <div className="w-full aspect-video bg-black border border-black/20 overflow-hidden shadow-lg mb-4">
                      {selectedAlert.image && (
                        <img 
                          src={selectedAlert.image} 
                          alt="Evidence Frame" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] text-black uppercase tracking-widest mb-1">Case Reference</div>
                    <div className="font-mono text-sm text-black">{selectedAlert.id}</div>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] text-black uppercase tracking-widest mb-1">Incident Type</div>
                    <div className="font-mono text-sm bg-primary-fixed text-black px-1.5 py-0.5 font-bold inline-block">{selectedAlert.type.replace(/_/g, ' ')}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="font-mono text-[10px] text-black uppercase tracking-widest mb-1">Location</div>
                    <div className="font-mono text-sm text-black">{selectedAlert.location}</div>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] text-black uppercase tracking-widest mb-1">Timestamp</div>
                    <div className="font-mono text-sm text-black">{selectedAlert.timestamp}</div>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] text-black uppercase tracking-widest mb-1">Severity</div>
                    <div className="font-mono text-sm text-error font-bold border border-error px-2 py-1 inline-block">{selectedAlert.severity}</div>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] text-black uppercase tracking-widest mb-1">Detection Source</div>
                    <div className="font-mono text-sm text-black">{selectedAlert.camera} • Video Analytics Engine</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-black/10 pt-6">
                <h3 className="font-mono text-[10px] text-black uppercase tracking-widest mb-4">Attached Assets</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-surface-container border border-black/10 p-3 flex flex-col items-center justify-center text-center gap-2">
                    <span className="material-symbols-outlined text-3xl text-black">image</span>
                    <div className="font-mono text-[10px] text-black">1x High-Res Frame</div>
                    <div className="font-mono text-[8px] text-black">JPEG • 2.1 MB</div>
                  </div>
                  <div className="bg-surface-container border border-black/10 p-3 flex flex-col items-center justify-center text-center gap-2">
                    <span className="material-symbols-outlined text-3xl text-black">movie</span>
                    <div className="font-mono text-[10px] text-black">1x Video Clip (±15s)</div>
                    <div className="font-mono text-[8px] text-black">MP4 • 45 MB</div>
                  </div>
                  <div className="bg-surface-container border border-black/10 p-3 flex flex-col items-center justify-center text-center gap-2">
                    <span className="material-symbols-outlined text-3xl text-black">description</span>
                    <div className="font-mono text-[10px] text-black">AI Detection Metadata</div>
                    <div className="font-mono text-[8px] text-black">JSON • 8 KB</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-black/10 pt-6">
                <h3 className="font-mono text-[10px] text-black uppercase tracking-widest mb-2">Recipient Agencies</h3>
                <select className="w-full bg-surface-container border border-black/20 text-black font-mono text-xs p-3 focus:outline-none focus:border-primary-fixed">
                  <option>Delhi Police - Central Command</option>
                  <option>Delhi Police - Local Station</option>
                  <option>Municipal Corporation of Delhi (MCD)</option>
                  <option>Public Works Department (PWD)</option>
                </select>
              </div>
            </div>

            <div className="p-4 border-t border-black/10 bg-surface-container-lowest flex justify-end gap-4">
              <button 
                onClick={() => setShowEvidenceModal(false)}
                className="px-6 py-2 border border-black/20 text-black font-mono text-xs tracking-widest uppercase hover:bg-white/10 transition-colors"
              >
                CANCEL
              </button>
              <button 
                onClick={() => {
                  addLog('EVIDENCE_ACTION', `Sent evidence packet for alert ${selectedAlert.id}`);
                  setShowEvidenceModal(false);
                }}
                className="px-6 py-2 bg-primary-fixed text-black font-mono text-xs font-bold tracking-widest uppercase hover:bg-white transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">send</span> CONFIRM & SEND
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

