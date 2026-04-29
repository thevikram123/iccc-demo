import React, { createContext, useCallback, useContext, useState } from 'react';

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
}

interface AuditLogContextType {
  logs: AuditLog[];
  addLog: (action: string, details: string) => void;
}

const AuditLogContext = createContext<AuditLogContextType | undefined>(undefined);

export const AuditLogProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [logs, setLogs] = useState<AuditLog[]>([
    { 
      id: 'init-1', 
      timestamp: new Date().toLocaleTimeString('en-GB', { timeZone: 'UTC' }) + ' UTC', 
      action: 'SYSTEM_START', 
      details: 'ICCC OS Initialized. Operator logged in.' 
    }
  ]);

  const addLog = useCallback((action: string, details: string) => {
    setLogs(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString('en-GB', { timeZone: 'UTC' }) + ' UTC',
      action,
      details
    }, ...prev]);
  }, []);

  return (
    <AuditLogContext.Provider value={{ logs, addLog }}>
      {children}
    </AuditLogContext.Provider>
  );
};

export const useAuditLog = () => {
  const context = useContext(AuditLogContext);
  if (!context) throw new Error('useAuditLog must be used within AuditLogProvider');
  return context;
};
