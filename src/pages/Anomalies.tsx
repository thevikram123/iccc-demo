import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuditLog } from '../context/AuditLogContext';

export default function Anomalies() {
  const navigate = useNavigate();
  const { addLog } = useAuditLog();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState<any>(null);
  const [technicianTeam, setTechnicianTeam] = useState('FIELD_TEAM_ALPHA (Rapid Response)');

  const [anomalies, setAnomalies] = useState([
    { id: 'ANM-092', type: 'MOB_GATHERING', location: 'ITO Intersection', severity: 'CRITICAL', time: '14:22:01 UTC', desc: 'Crowd density exceeded 500 persons in 50sqm area. Potential protest or unrest.', status: 'NEW' },
    { id: 'ANM-093', type: 'NETWORK_DROP', location: 'SD_EDGE_44', severity: 'HIGH', time: '14:18:44 UTC', desc: 'Packet loss exceeded 15% threshold. Camera feed degraded.', status: 'NEW' },
    { id: 'ANM-094', type: 'UNAUTHORIZED_ACCESS', location: 'JBX-CENTRAL-09', severity: 'CRITICAL', time: '14:15:12 UTC', desc: 'Multiple failed auth attempts detected on maintenance port.', status: 'NEW' },
    { id: 'ANM-095', type: 'DISTRESS_DETECTED', location: 'Kashmere Gate', severity: 'MEDIUM', time: '14:10:05 UTC', desc: 'Woman walking alone at night. AI distress detection alert fired.', status: 'NEW' },
  ]);

  const severityColors = {
    'CRITICAL': 'bg-error text-black border-error',
    'HIGH': 'bg-tertiary-container text-black border-tertiary-container',
    'MEDIUM': 'bg-secondary text-black border-secondary',
    'LOW': 'bg-primary-fixed text-black border-primary-fixed',
  };

  const statusColors = {
    'NEW': 'text-error border-error/30 bg-error/10',
    'TECHNICIAN_ASSIGNED': 'text-black border-secondary/30 bg-secondary/10',
    'RESOLVED': 'bg-primary-fixed text-black px-1 border border-black border-primary-fixed/30 bg-primary-fixed/10',
  };

  const handleAssignClick = (anomaly: any) => {
    setSelectedAnomaly(anomaly);
    setShowAssignModal(true);
  };

  const handleDispatch = () => {
    if (!selectedAnomaly) return;
    
    setAnomalies(prev => prev.map(anm => 
      anm.id === selectedAnomaly.id ? { ...anm, status: 'TECHNICIAN_ASSIGNED' } : anm
    ));
    
    addLog('TECHNICIAN_DISPATCHED', `Dispatched ${technicianTeam} for anomaly ${selectedAnomaly.id} (${selectedAnomaly.type}) at ${selectedAnomaly.location}.`);
    
    setShowAssignModal(false);
    setSelectedAnomaly(null);
  };

  const handleResolve = (anomaly: any) => {
    setAnomalies(prev => prev.map(anm => 
      anm.id === anomaly.id ? { ...anm, status: 'RESOLVED' } : anm
    ));
    addLog('ANOMALY_RESOLVED', `Anomaly ${anomaly.id} marked as resolved by operator.`);
  };

  return (
    <div className="relative w-full h-full p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-headline font-black text-3xl tracking-tighter text-black uppercase">ANOMALY DETECTION</h1>
          <p className="font-mono text-xs text-black font-bold mt-1 tracking-widest">AI-DRIVEN INCIDENT & NETWORK ANALYSIS</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-surface-container-highest px-4 py-2 border-l-2 border-error">
            <div className="text-[10px] font-mono text-black font-bold uppercase">Active Critical</div>
            <div className="text-xl font-mono text-black font-bold">
              {anomalies.filter(a => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length.toString().padStart(2, '0')} <span className="text-[10px] font-extrabold text-error">INCIDENTS</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 flex-1">
        {anomalies.map((anm) => (
          <div key={anm.id} className="glass-panel p-5 border-l-4 border-surface-container-highest hover:border-primary-fixed transition-colors flex items-center justify-between group">
            <div className="flex items-center gap-6">
              <div className={`px-3 py-1 font-mono text-[10px] font-bold tracking-widest ${severityColors[anm.severity as keyof typeof severityColors]}`}>
                {anm.severity}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-sm text-black font-bold">{anm.id}</span>
                  <span className="font-mono text-[10px] text-black font-bold">{anm.time}</span>
                  <span className={`font-mono text-[9px] px-2 py-0.5 border uppercase border-black font-bold tracking-widest ${statusColors[anm.status as keyof typeof statusColors]}`}>
                    {anm.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="font-mono text-[10px] bg-primary-fixed text-black px-1.5 py-0.5 inline-block font-bold mb-1 tracking-widest uppercase">
                  {anm.type} @ {anm.location}
                </div>
                <div className="font-mono text-[11px] text-black font-medium">{anm.desc}</div>
              </div>
            </div>
            
            <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                className="px-4 py-2 bg-primary-fixed text-black font-bold font-mono text-[10px] hover:bg-white transition-colors flex items-center gap-2"
                onClick={() => {
                  addLog('AI_ANALYSIS_REQUESTED', `Requested AI Copilot analysis for anomaly ${anm.id}`);
                  navigate('/copilot', { state: { initialMessage: `Analyze anomaly ${anm.id}: ${anm.type} at ${anm.location}. Context: ${anm.desc}`, location: [28.6139, 77.2090] } });
                }}
              >
                <span className="material-symbols-outlined text-sm">smart_toy</span> AI ANALYZE
              </button>
              
              {anm.status !== 'RESOLVED' && (
                <button 
                  onClick={() => handleAssignClick(anm)}
                  className="px-4 py-2 bg-surface-container border border-black/10 text-black font-mono text-[10px] tracking-widest uppercase hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">engineering</span> ASSIGN TECHNICIAN
                </button>
              )}
              
              {anm.status === 'TECHNICIAN_ASSIGNED' && (
                <button 
                  onClick={() => handleResolve(anm)}
                  className="px-4 py-2 bg-surface-container border border-secondary/30 text-black font-mono text-[10px] tracking-widest uppercase hover:bg-secondary/10 transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">check_circle</span> MARK RESOLVED
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Assign Technician Modal */}
      {showAssignModal && selectedAnomaly && (
        <div className="absolute inset-0 z-[600] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-black/10 p-8 w-full max-w-md">
            <h2 className="font-headline font-black text-2xl tracking-tighter text-black uppercase mb-2">DISPATCH TECHNICIAN</h2>
            <p className="font-mono text-[10px] text-black font-bold tracking-widest mb-6">GENERATE STRUCTURED REPORT FOR {selectedAnomaly.id}</p>
            
            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-black font-bold uppercase mb-2">Select Technician / Team</label>
                <select 
                  className="w-full bg-surface-container border border-black/20 text-black p-3 focus:outline-none focus:border-primary-fixed"
                  value={technicianTeam}
                  onChange={(e) => setTechnicianTeam(e.target.value)}
                >
                  <option>FIELD_TEAM_ALPHA (Rapid Response)</option>
                  <option>MCD_SANITATION_DEPT</option>
                  <option>PWD_ROAD_MAINTENANCE</option>
                  <option>IT_NETWORK_SUPPORT</option>
                </select>
              </div>
              
              <div>
                <label className="block text-black font-bold uppercase mb-2">Priority Level</label>
                <select className="w-full bg-surface-container border border-black/20 text-black p-3 focus:outline-none focus:border-primary-fixed" defaultValue={selectedAnomaly.severity}>
                  <option value="CRITICAL">CRITICAL (Immediate Dispatch)</option>
                  <option value="HIGH">HIGH (SLA: 2 Hours)</option>
                  <option value="MEDIUM">MEDIUM (SLA: 24 Hours)</option>
                  <option value="LOW">LOW (SLA: 48 Hours)</option>
                </select>
              </div>

              <div>
                <label className="block text-black font-bold uppercase mb-2">Dispatch Notes</label>
                <textarea 
                  className="w-full bg-surface-container border border-black/20 text-black p-3 focus:outline-none focus:border-primary-fixed h-24 resize-none" 
                  defaultValue={`Please investigate ${selectedAnomaly.type} at ${selectedAnomaly.location}. \n\nDetails: ${selectedAnomaly.desc}`}
                ></textarea>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setShowAssignModal(false)}
                className="flex-1 py-3 bg-surface-container border border-black/10 text-black font-mono text-xs tracking-widest uppercase hover:bg-white/10 transition-colors"
              >
                CANCEL
              </button>
              <button 
                onClick={handleDispatch}
                className="flex-1 py-3 bg-primary-fixed text-black font-mono text-xs font-bold tracking-widest uppercase hover:bg-white transition-colors"
              >
                DISPATCH REPORT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
