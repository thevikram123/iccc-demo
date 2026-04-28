import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuditLog } from '../context/AuditLogContext';

const CAMERA_STATUS_DATA = [
  { name: 'Online', value: 92450, color: '#ffe600' },
  { name: 'Offline', value: 4200, color: '#ffb4ab' },
  { name: 'Maintenance', value: 3350, color: '#93000a' },
];

const ALERTS_DATA = [
  { name: 'Mob Gathering', count: 145 },
  { name: 'Distress', count: 32 },
  { name: 'ANPR Flags', count: 890 },
  { name: 'Garbage', count: 420 },
  { name: 'Potholes', count: 215 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { addLog } = useAuditLog();

  return (
    <div className="w-full h-full p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-headline font-black text-3xl tracking-tighter text-black uppercase">DELHI ICCC DASHBOARD</h1>
          <p className="font-mono text-xs text-black font-bold mt-1 tracking-widest">OVERALL SYSTEM HEALTH & ANALYTICS OVERVIEW</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => {
              addLog('NAVIGATION', 'Navigated to Infrastructure (View Localities)');
              navigate('/infrastructure');
            }}
            className="px-6 py-2 bg-primary-fixed text-black font-mono text-xs tracking-widest uppercase hover:bg-white transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">explore</span>
            VIEW LOCALITIES
          </button>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel border-l-4 border-primary-fixed p-5">
          <div className="text-[10px] font-mono text-black font-bold uppercase tracking-widest mb-2">Total Cameras</div>
          <div className="text-3xl font-mono text-black font-bold">140,000<span className="bg-primary-fixed text-black text-[10px] px-1 ml-1 align-top">+</span></div>
        </div>
        <div className="glass-panel border-l-4 border-secondary p-5">
          <div className="text-[10px] font-mono text-black font-bold uppercase tracking-widest mb-2">Network Uptime</div>
          <div className="text-3xl font-mono text-black font-bold">99.8<span className="text-black text-sm">%</span></div>
        </div>
        <div className="glass-panel border-l-4 border-error p-5">
          <div className="text-[10px] font-mono text-black font-bold uppercase tracking-widest mb-2">Critical Alerts (24h)</div>
          <div className="text-3xl font-mono text-black font-bold">1,245</div>
        </div>
        <div className="glass-panel border-l-4 border-tertiary-container p-5">
          <div className="text-[10px] font-mono text-black font-bold uppercase tracking-widest mb-2">AI Processing Load</div>
          <div className="text-3xl font-mono text-black font-bold">84.2<span className="text-tertiary-container text-sm">%</span></div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        {/* Camera Status Pie Chart */}
        <div className="glass-panel border border-black/10 p-6 flex flex-col">
          <h3 className="font-mono text-sm text-black font-bold uppercase tracking-widest mb-6">Camera Network Status</h3>
          <div className="flex-1 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CAMERA_STATUS_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {CAMERA_STATUS_DATA.map((entry, index) => (
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
              <span className="text-3xl font-mono font-bold text-black">92.4%</span>
              <span className="text-[9px] font-mono bg-primary-fixed text-black px-2 py-0.5 font-bold uppercase tracking-widest">ONLINE</span>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {CAMERA_STATUS_DATA.map(stat => (
              <div key={stat.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: stat.color }}></span>
                <span className="font-mono text-[10px] text-black font-bold uppercase">{stat.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts Bar Chart */}
        <div className="glass-panel border border-black/10 p-6 flex flex-col">
          <h3 className="font-mono text-sm text-black font-bold uppercase tracking-widest mb-6">AI Analytics Detections (Last 24h)</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ALERTS_DATA} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#000000', fontWeight: 'bold', fontSize: 11, fontFamily: 'monospace' }} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#000000' }}
                />
                <Bar dataKey="count" fill="#ffe600" radius={[0, 4, 4, 0]} barSize={24}>
                  {ALERTS_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'Distress' ? '#ffb4ab' : '#ffe600'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
