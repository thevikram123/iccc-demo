import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuditLog } from '../context/AuditLogContext';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function AuditLogSidebar({ isMinimized, setIsMinimized }: { isMinimized: boolean, setIsMinimized: (val: boolean) => void }) {
  const { logs } = useAuditLog();
  
  return (
    <aside className={cn("flex flex-col fixed right-0 top-14 bottom-8 z-40 bg-white border-l border-black/10 transition-all duration-300", isMinimized ? "w-12" : "w-72")}>
      <div className="p-4 border-b border-black/10 bg-surface-container-lowest flex justify-between items-center">
        {!isMinimized && (
          <h2 className="font-headline font-black text-sm tracking-widest text-black uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-black">history</span>
            GLOBAL AUDIT LOG
          </h2>
        )}
        <button onClick={() => setIsMinimized(!isMinimized)} className="text-black hover:text-black transition-colors mx-auto">
          <span className="material-symbols-outlined text-sm">{isMinimized ? 'keyboard_double_arrow_left' : 'keyboard_double_arrow_right'}</span>
        </button>
      </div>
      {!isMinimized && (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="flex flex-col gap-1 border-b border-black/5 pb-3 last:border-0">
              <div className="flex justify-between items-start">
                <span className="font-mono text-[9px] bg-[#ffe600] text-black font-bold uppercase tracking-widest px-1.5 py-0.5 border border-black/10 inline-block mb-1">{log.action}</span>
                <span className="font-mono text-[8px] text-black font-bold">{log.timestamp}</span>
              </div>
              <div className="font-mono text-[10px] text-black leading-relaxed font-medium">
                {log.details}
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}

export default function Layout() {
  const [isAuditLogMinimized, setIsAuditLogMinimized] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const { addLog } = useAuditLog();

  const handleNavClick = (path: string) => {
    addLog('NAVIGATION', `Navigated to ${path}`);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="flex justify-between items-center w-full px-6 h-14 bg-white dark:bg-white bg-opacity-90 backdrop-blur-md fixed top-0 z-50 border-b border-black/10 shadow-[0_0_15px_rgba(255,230,0,0.05)]">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-black font-mono tracking-tighter uppercase text-2xl font-bold">
              PWD PULSE
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-auto text-black">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <nav className="hidden md:flex gap-6 items-center">
            <span className="text-black font-mono font-headline tracking-tighter uppercase text-sm font-bold px-2 py-1">
              STREAMS: 1,284
            </span>
            <span className="bg-[#ffe600] text-black font-headline tracking-tighter uppercase text-sm font-bold px-2 py-0.5 border border-black/10">
              ALERTS: 42
            </span>
            <span className="text-black font-mono font-headline tracking-tighter uppercase text-sm font-bold px-2 py-1">
              UPTIME: 99.9%
            </span>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => addLog('UI_ACTION', 'Clicked Filter button')}
            className="material-symbols-outlined bg-[#ffe600] text-black border border-black hover:bg-black hover:text-white p-2 transition-colors duration-100"
          >
            filter_alt
          </button>
          <button 
            onClick={() => addLog('UI_ACTION', 'Clicked User Profile button')}
            className="material-symbols-outlined bg-[#ffe600] text-black border border-black hover:bg-black hover:text-white p-2 transition-colors duration-100"
          >
            account_circle
          </button>
        </div>
      </header>

      {/* Side Navigation Bar */}
      <aside className={cn("flex flex-col fixed left-0 top-14 bottom-0 z-40 bg-white border-r border-black/10 transition-all duration-300", isSidebarMinimized ? "w-16" : "w-64")}>
        <div className={cn("p-4 border-b border-black/10 flex flex-col gap-4", isSidebarMinimized ? "items-center" : "")}>
          <div className="flex items-center justify-between w-full">
            {!isSidebarMinimized && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-surface-container-highest flex items-center justify-center border border-black/10 shrink-0">
                  <span className="material-symbols-outlined text-xs text-black">shield</span>
                </div>
                <div>
                  <div className="text-black font-mono text-[10px] font-bold tracking-[0.2em]">OPERATOR_792</div>
                </div>
              </div>
            )}
            {isSidebarMinimized && (
                <div className="w-8 h-8 bg-surface-container-highest flex items-center justify-center border border-black/10 shrink-0">
                  <span className="material-symbols-outlined text-xs text-black">shield</span>
                </div>
            )}
            <button 
              onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
              className="text-black hover:bg-black/5 p-1 rounded-sm flex items-center justify-center shrink-0"
            >
              <span className="material-symbols-outlined text-sm">{isSidebarMinimized ? 'keyboard_double_arrow_right' : 'keyboard_double_arrow_left'}</span>
            </button>
          </div>
          {!isSidebarMinimized && (
            <div>
              <div className="bg-[#ffe600] text-black font-mono text-[10px] font-bold tracking-widest uppercase px-1.5 py-0.5 mb-1 border border-black/10 inline-block">SECTOR-01</div>
              <div className="text-black font-mono text-[9px] font-bold tracking-widest uppercase">STATUS: ACTIVE_DUTY</div>
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 flex flex-col overflow-y-auto overflow-x-hidden custom-scrollbar">
          <NavLink
            to="/"
            onClick={() => handleNavClick('DASHBOARD')}
            className={({ isActive }) =>
              cn(
                "flex items-center py-4 font-mono text-xs tracking-widest cursor-crosshair transition-colors whitespace-nowrap",
                isSidebarMinimized ? "justify-center px-0" : "px-6",
                isActive
                  ? "bg-[#ffe600] text-black font-bold border-y border-black/10"
                  : "text-black font-bold hover:bg-[#e9ecef] hover:text-[#007bc0]"
              )
            }
          >
            <span className={cn("material-symbols-outlined", !isSidebarMinimized && "mr-4")} style={{ fontVariationSettings: "'FILL' 1" }}>
              dashboard
            </span>
            {!isSidebarMinimized && "DASHBOARD"}
          </NavLink>
          <NavLink
            to="/gis-map"
            onClick={() => handleNavClick('GIS MAP')}
            className={({ isActive }) =>
              cn(
                "flex items-center py-4 font-mono text-xs tracking-widest cursor-crosshair transition-colors whitespace-nowrap",
                isSidebarMinimized ? "justify-center px-0" : "px-6",
                isActive
                  ? "bg-[#ffe600] text-black font-bold border-y border-black/10"
                  : "text-black font-bold hover:bg-[#e9ecef] hover:text-[#007bc0]"
              )
            }
          >
            <span className={cn("material-symbols-outlined", !isSidebarMinimized && "mr-4")} style={{ fontVariationSettings: "'FILL' 1" }}>
              map
            </span>
            {!isSidebarMinimized && "GIS MAP"}
          </NavLink>
          <NavLink
            to="/infrastructure"
            onClick={() => handleNavClick('INFRASTRUCTURE')}
            className={({ isActive }) =>
              cn(
                "flex items-center py-4 font-mono text-xs tracking-widest cursor-crosshair transition-colors whitespace-nowrap",
                isSidebarMinimized ? "justify-center px-0" : "px-6",
                isActive
                  ? "bg-[#ffe600] text-black font-bold border-y border-black/10"
                  : "text-black font-bold hover:bg-[#e9ecef] hover:text-[#007bc0]"
              )
            }
          >
            <span className={cn("material-symbols-outlined", !isSidebarMinimized && "mr-4")}>settings_input_component</span>
            {!isSidebarMinimized && "INFRASTRUCTURE"}
          </NavLink>
          <NavLink
            to="/survey-tracking"
            onClick={() => handleNavClick('SURVEY TRACKING')}
            className={({ isActive }) =>
              cn(
                "flex items-center py-4 font-mono text-xs tracking-widest cursor-crosshair transition-colors whitespace-nowrap",
                isSidebarMinimized ? "justify-center px-0" : "px-6",
                isActive
                  ? "bg-[#ffe600] text-black font-bold border-y border-black/10"
                  : "text-black font-bold hover:bg-[#e9ecef] hover:text-[#007bc0]"
              )
            }
          >
            <span className={cn("material-symbols-outlined", !isSidebarMinimized && "mr-4")}>assignment</span>
            {!isSidebarMinimized && "SURVEY TRACKING"}
          </NavLink>
          <NavLink
            to="/cctv-feeds"
            onClick={() => handleNavClick('CCTV FEEDS')}
            className={({ isActive }) =>
              cn(
                "flex items-center py-4 font-mono text-xs tracking-widest cursor-crosshair transition-colors whitespace-nowrap",
                isSidebarMinimized ? "justify-center px-0" : "px-6",
                isActive
                  ? "bg-[#ffe600] text-black font-bold border-y border-black/10"
                  : "text-black font-bold hover:bg-[#e9ecef] hover:text-[#007bc0]"
              )
            }
          >
            <span className={cn("material-symbols-outlined", !isSidebarMinimized && "mr-4")}>videocam</span>
            {!isSidebarMinimized && "CCTV FEEDS"}
          </NavLink>
          <NavLink
            to="/topology"
            onClick={() => handleNavClick('TOPOLOGY')}
            className={({ isActive }) =>
              cn(
                "flex items-center py-4 font-mono text-xs tracking-widest cursor-crosshair transition-colors whitespace-nowrap",
                isSidebarMinimized ? "justify-center px-0" : "px-6",
                isActive
                  ? "bg-[#ffe600] text-black font-bold border-y border-black/10"
                  : "text-black font-bold hover:bg-[#e9ecef] hover:text-[#007bc0]"
              )
            }
          >
            <span className={cn("material-symbols-outlined", !isSidebarMinimized && "mr-4")}>hub</span>
            {!isSidebarMinimized && "TOPOLOGY"}
          </NavLink>
          <NavLink
            to="/anomalies"
            onClick={() => handleNavClick('ANOMALIES')}
            className={({ isActive }) =>
              cn(
                "flex items-center py-4 font-mono text-xs tracking-widest cursor-crosshair transition-colors whitespace-nowrap",
                isSidebarMinimized ? "justify-center px-0" : "px-6",
                isActive
                  ? "bg-[#ffe600] text-black font-bold border-y border-black/10"
                  : "text-black font-bold hover:bg-[#e9ecef] hover:text-[#007bc0]"
              )
            }
          >
            <span className={cn("material-symbols-outlined", !isSidebarMinimized && "mr-4")}>warning</span>
            {!isSidebarMinimized && "ANOMALIES"}
          </NavLink>
          <NavLink
            to="/alerts"
            onClick={() => handleNavClick('ALERTS')}
            className={({ isActive }) =>
              cn(
                "flex items-center py-4 font-mono text-xs tracking-widest cursor-crosshair transition-colors whitespace-nowrap",
                isSidebarMinimized ? "justify-center px-0" : "px-6",
                isActive
                  ? "bg-[#ffe600] text-black font-bold border-y border-black/10"
                  : "text-black font-bold hover:bg-[#e9ecef] hover:text-[#007bc0]"
              )
            }
          >
            <span className={cn("material-symbols-outlined", !isSidebarMinimized && "mr-4")}>notifications_active</span>
            {!isSidebarMinimized && "ALERTS"}
          </NavLink>
          <NavLink
            to="/frs-search"
            onClick={() => handleNavClick('FRS SEARCH')}
            className={({ isActive }) =>
              cn(
                "flex items-center py-4 font-mono text-xs tracking-widest cursor-crosshair transition-colors whitespace-nowrap",
                isSidebarMinimized ? "justify-center px-0" : "px-6",
                isActive
                  ? "bg-[#ffe600] text-black font-bold border-y border-black/10"
                  : "text-black font-bold hover:bg-[#e9ecef] hover:text-[#007bc0]"
              )
            }
          >
            <span className={cn("material-symbols-outlined", !isSidebarMinimized && "mr-4")}>face</span>
            {!isSidebarMinimized && "FRS SEARCH"}
          </NavLink>
          <NavLink
            to="/copilot"
            onClick={() => handleNavClick('AI COPILOT')}
            className={({ isActive }) =>
              cn(
                "flex items-center py-4 font-mono text-xs tracking-widest cursor-crosshair transition-colors mt-auto border-t border-black/5 whitespace-nowrap",
                isSidebarMinimized ? "justify-center px-0" : "px-6",
                isActive
                  ? "bg-secondary text-black font-bold"
                  : "text-black hover:bg-[#e9ecef] hover:text-black"
              )
            }
          >
            <span className={cn("material-symbols-outlined", !isSidebarMinimized && "mr-4")}>smart_toy</span>
            {!isSidebarMinimized && "AI COPILOT"}
          </NavLink>
        </nav>

        <div className="p-4">
          <button 
            onClick={() => addLog('UI_ACTION', 'Clicked SYSTEM_LOGS button')}
            className="w-full py-3 flex items-center justify-center bg-surface-container-highest text-black font-mono text-[10px] tracking-widest border border-black/10 hover:bg-surface-bright transition-colors uppercase"
            title="SYSTEM_LOGS"
          >
            {isSidebarMinimized ? (
               <span className="material-symbols-outlined text-xs">terminal</span>
            ) : "SYSTEM_LOGS"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn("mt-14 mb-8 h-[calc(100vh-5.5rem)] relative overflow-hidden bg-surface-dim transition-all duration-300", isSidebarMinimized ? "ml-16" : "ml-64", isAuditLogMinimized ? "mr-12" : "mr-72")}>
        <Outlet />
      </main>
      
      {/* Right Audit Log Sidebar */}
      <AuditLogSidebar isMinimized={isAuditLogMinimized} setIsMinimized={setIsAuditLogMinimized} />

      {/* Footer */}
      <footer className="fixed bottom-0 w-full h-8 flex justify-between items-center px-6 z-50 bg-white border-t border-black/10 font-mono text-[10px] uppercase tracking-[0.2em]">
        <div className="text-black font-bold">SENTINEL_OS_v4.0.2</div>
        <div className="flex gap-8">
          <span className="bg-[#ffe600]/10 text-black flex items-center gap-2 px-2 py-0.5 border border-[#ffe600]/30 font-bold">
            <span className="w-1 h-1 bg-[#ffe600]"></span>
            LATENCY: 4ms
          </span>
          <span className="text-black font-bold flex items-center gap-2">
            <span className="w-1 h-1 bg-black"></span>
            SYNC: NOMINAL
          </span>
          <span className="text-black font-bold flex items-center gap-2">
            <span className="w-1 h-1 bg-black"></span>
            SRV_HLTH: 100%
          </span>
        </div>
      </footer>
    </div>
  );
}
