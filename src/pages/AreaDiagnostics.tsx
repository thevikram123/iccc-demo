import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useAuditLog } from '../context/AuditLogContext';

const SWITCH_DATA = [
  { id: 'SW-01', status: 'ONLINE', uptime: '99.9%', latency: '2ms', load: '45%' },
  { id: 'SW-02', status: 'ONLINE', uptime: '99.9%', latency: '3ms', load: '62%' },
  { id: 'SW-03', status: 'WARNING', uptime: '98.5%', latency: '15ms', load: '89%' },
  { id: 'SW-04', status: 'ONLINE', uptime: '99.9%', latency: '2ms', load: '30%' },
];

const BANDWIDTH_DATA = [
  { time: '00:00', usage: 45 }, { time: '04:00', usage: 30 },
  { time: '08:00', usage: 85 }, { time: '12:00', usage: 95 },
  { time: '16:00', usage: 90 }, { time: '20:00', usage: 75 },
  { time: '24:00', usage: 50 },
];

export default function AreaDiagnostics() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addLog } = useAuditLog();
  const areaName = location.state?.area || 'SELECTED LOCALITY';

  const cameraStatusData = [
    { name: 'Online', value: 850, color: '#ffe600' },
    { name: 'Offline', value: 12, color: '#ffb4ab' },
    { name: 'Maintenance', value: 5, color: '#93000a' },
  ];

  return (
    <div className="w-full h-full p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-end">
        <div>
          <button 
            onClick={() => {
              addLog('NAVIGATION', 'Navigated back to Infrastructure from Area Diagnostics');
              navigate('/infrastructure');
            }}
            className="text-black hover:text-black font-mono text-xs flex items-center gap-2 mb-4 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            BACK TO INFRASTRUCTURE
          </button>
          <h1 className="font-headline font-black text-3xl tracking-tighter text-black uppercase">{areaName} DIAGNOSTICS</h1>
          <p className="font-mono text-xs text-black font-bold mt-1 tracking-widest">LOCAL AREA NETWORK & HARDWARE HEALTH</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera Status */}
        <div className="glass-panel border border-black/10 p-6 flex flex-col">
          <h3 className="font-mono text-sm text-black font-bold uppercase tracking-widest mb-6">Camera Nodes Status</h3>
          <div className="flex-1 relative min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cameraStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {cameraStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#000000' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
              <span className="text-2xl font-mono font-bold text-black">867</span>
              <span className="text-[10px] font-mono text-black font-bold uppercase tracking-widest">TOTAL</span>
            </div>
          </div>
        </div>

        {/* Bandwidth Usage */}
        <div className="glass-panel border border-black/10 p-6 flex flex-col lg:col-span-2">
          <h3 className="font-mono text-sm text-black font-bold uppercase tracking-widest mb-6">24H Bandwidth Usage (Gbps)</h3>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={BANDWIDTH_DATA} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" vertical={false} />
                <XAxis dataKey="time" stroke="#000000" tick={{ fill: '#000000', fontWeight: 'bold', fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis stroke="#000000" tick={{ fill: '#000000', fontWeight: 'bold', fontSize: 11, fontFamily: 'monospace' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#000000' }}
                />
                <Line type="monotone" dataKey="usage" stroke="#ffe600" strokeWidth={2} dot={{ fill: '#ffe600', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Network Switches */}
      <div className="glass-panel border border-black/10 p-6">
        <h3 className="font-mono text-sm text-black font-bold uppercase tracking-widest mb-6">Network Switches & Edge Nodes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-sm">
            <thead className="text-black text-[10px] uppercase font-bold tracking-widest border-b border-black/10">
              <tr>
                <th className="pb-3 font-bold">Hardware ID</th>
                <th className="pb-3 font-bold">Status</th>
                <th className="pb-3 font-bold">Uptime</th>
                <th className="pb-3 font-bold">Latency</th>
                <th className="pb-3 font-bold">Load</th>
              </tr>
            </thead>
            <tbody className="text-black">
              {SWITCH_DATA.map((sw) => (
                <tr key={sw.id} className="border-b border-black/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 font-bold">{sw.id}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 text-[10px] font-bold tracking-widest ${sw.status === 'ONLINE' ? 'bg-primary-fixed text-black' : 'bg-error text-black'}`}>
                      {sw.status}
                    </span>
                  </td>
                  <td className="py-4 text-black font-medium">{sw.uptime}</td>
                  <td className="py-4 text-black font-medium">{sw.latency}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1 bg-surface-container-highest">
                        <div 
                          className={`h-full ${parseInt(sw.load) > 80 ? 'bg-error' : 'bg-primary-fixed'}`} 
                          style={{ width: sw.load }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-black font-bold">{sw.load}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
