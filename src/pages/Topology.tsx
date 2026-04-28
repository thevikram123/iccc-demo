import React, { useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useAuditLog } from '../context/AuditLogContext';

// Custom Node Component for realistic architecture look
const ArchNode = ({ data }: any) => {
  return (
    <div className="bg-surface-container-lowest border border-black/20 p-4 rounded-md shadow-lg min-w-[150px]">
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-primary-fixed" />
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-sm flex items-center justify-center ${data.color || 'bg-surface-container-highest text-black'}`}>
          <span className="material-symbols-outlined text-xl">{data.icon}</span>
        </div>
        <div>
          <div className="font-mono text-[10px] text-black font-bold uppercase tracking-widest">{data.type}</div>
          <div className="font-mono text-sm text-black font-bold">{data.label}</div>
        </div>
      </div>
      {data.status && (
        <div className="mt-3 pt-2 border-t border-black/10 flex justify-between items-center">
          <span className="font-mono text-[9px] uppercase font-bold">Status</span>
          <span className={`font-mono text-[9px] font-bold uppercase px-1 ${data.status === 'ONLINE' ? 'bg-primary-fixed text-black' : 'bg-error text-black'}`}>
            {data.status}
          </span>
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-primary-fixed" />
    </div>
  );
};

const nodeTypes = {
  arch: ArchNode,
};

const initialNodes = [
  { id: 'cloud', type: 'arch', position: { x: 400, y: 50 }, data: { label: 'AWS Region', type: 'Cloud Core', icon: 'cloud', status: 'ONLINE' } },
  
  { id: 'fw1', type: 'arch', position: { x: 250, y: 200 }, data: { label: 'Core FW-01', type: 'Firewall', icon: 'security', status: 'ONLINE' } },
  { id: 'fw2', type: 'arch', position: { x: 550, y: 200 }, data: { label: 'Core FW-02', type: 'Firewall', icon: 'security', status: 'ONLINE' } },
  
  { id: 'sw1', type: 'arch', position: { x: 250, y: 350 }, data: { label: 'Dist Switch N', type: 'Switch', icon: 'router', status: 'ONLINE' } },
  { id: 'sw2', type: 'arch', position: { x: 550, y: 350 }, data: { label: 'Dist Switch S', type: 'Switch', icon: 'router', status: 'ONLINE' } },
  
  { id: 'jb1', type: 'arch', position: { x: 100, y: 500 }, data: { label: 'J-Box N1', type: 'Junction', icon: 'hub', status: 'ONLINE' } },
  { id: 'jb2', type: 'arch', position: { x: 300, y: 500 }, data: { label: 'J-Box N2', type: 'Junction', icon: 'hub', status: 'OFFLINE', color: 'bg-error/20 text-error border border-error/30' } },
  { id: 'jb3', type: 'arch', position: { x: 500, y: 500 }, data: { label: 'J-Box S1', type: 'Junction', icon: 'hub', status: 'ONLINE' } },
  { id: 'jb4', type: 'arch', position: { x: 700, y: 500 }, data: { label: 'J-Box S2', type: 'Junction', icon: 'hub', status: 'ONLINE' } },
  
  { id: 'cam1', type: 'arch', position: { x: 50, y: 650 }, data: { label: 'CAM-N1-A', type: 'CCTV', icon: 'videocam', status: 'ONLINE' } },
  { id: 'cam2', type: 'arch', position: { x: 150, y: 650 }, data: { label: 'CAM-N1-B', type: 'CCTV', icon: 'videocam', status: 'ONLINE' } },
  { id: 'cam3', type: 'arch', position: { x: 250, y: 650 }, data: { label: 'CAM-N2-A', type: 'CCTV', icon: 'videocam_off', status: 'OFFLINE', color: 'bg-error/20 text-error border border-error/30' } },
  { id: 'cam4', type: 'arch', position: { x: 350, y: 650 }, data: { label: 'CAM-N2-B', type: 'CCTV', icon: 'videocam_off', status: 'OFFLINE', color: 'bg-error/20 text-error border border-error/30' } },
];

const initialEdges = [
  { id: 'e-c-fw1', source: 'cloud', target: 'fw1', animated: true, style: { stroke: '#ffe600' } },
  { id: 'e-c-fw2', source: 'cloud', target: 'fw2', animated: true, style: { stroke: '#ffe600' } },
  
  { id: 'e-fw1-sw1', source: 'fw1', target: 'sw1', style: { stroke: '#000000', opacity: 0.8 } },
  { id: 'e-fw2-sw2', source: 'fw2', target: 'sw2', style: { stroke: '#000000', opacity: 0.8 } },
  { id: 'e-sw1-sw2', source: 'sw1', target: 'sw2', type: 'step', style: { stroke: '#000000', opacity: 0.4, strokeDasharray: '5 5' } },
  
  { id: 'e-sw1-jb1', source: 'sw1', target: 'jb1', style: { stroke: '#000000', opacity: 0.8 } },
  { id: 'e-sw1-jb2', source: 'sw1', target: 'jb2', style: { stroke: '#ffb4ab', strokeWidth: 3 }, animated: true },
  { id: 'e-sw2-jb3', source: 'sw2', target: 'jb3', style: { stroke: '#000000', opacity: 0.8 } },
  { id: 'e-sw2-jb4', source: 'sw2', target: 'jb4', style: { stroke: '#000000', opacity: 0.8 } },
  
  { id: 'e-jb1-cam1', source: 'jb1', target: 'cam1', style: { stroke: '#000000', opacity: 0.8 } },
  { id: 'e-jb1-cam2', source: 'jb1', target: 'cam2', style: { stroke: '#000000', opacity: 0.8 } },
  { id: 'e-jb2-cam3', source: 'jb2', target: 'cam3', style: { stroke: '#ffb4ab', strokeWidth: 3 } },
  { id: 'e-jb2-cam4', source: 'jb2', target: 'cam4', style: { stroke: '#ffb4ab', strokeWidth: 3 } },
];

export default function Topology() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { addLog } = useAuditLog();

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: any) => {
    addLog('UI_ACTION', `Clicked topology node: ${node.data.label} (${node.data.type})`);
  }, [addLog]);

  return (
    <div className="w-full h-full relative bg-white">
      <div className="absolute top-8 left-8 z-10 pointer-events-none">
        <h1 className="font-headline font-black text-3xl tracking-tighter text-black uppercase">NETWORK ARCHITECTURE</h1>
        <p className="font-mono text-xs text-black font-bold mt-1 tracking-widest">REAL-TIME TOPOLOGY DIAGRAM</p>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#00000010" />
        <Controls className="bg-white border border-black/10 fill-black" />
        <MiniMap 
          className="bg-surface-container-lowest border border-black/10" 
          nodeColor={(node) => {
            if (node.data?.status === 'OFFLINE') return '#ffb4ab';
            return '#ffe600';
          }}
          maskColor="#00000080"
        />
      </ReactFlow>
    </div>
  );
}
