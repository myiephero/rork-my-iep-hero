import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import { useAuth } from './auth-store';

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Mock audit log entries
const mockAuditLogs: AuditLogEntry[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Parent User',
    action: 'DOCUMENT_UPLOAD',
    resource: 'IEP',
    resourceId: 'iep-1',
    details: 'Uploaded IEP document for John Doe',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    timestamp: '2025-07-28T10:30:00Z',
    severity: 'medium'
  },
  {
    id: '2',
    userId: '2',
    userName: 'Advocate User',
    action: 'DOCUMENT_ACCESS',
    resource: 'IEP',
    resourceId: 'iep-1',
    details: 'Accessed IEP document for review',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    timestamp: '2025-07-28T11:15:00Z',
    severity: 'low'
  },
  {
    id: '3',
    userId: '1',
    userName: 'Parent User',
    action: 'MESSAGE_SEND',
    resource: 'MESSAGE',
    resourceId: 'msg-1',
    details: 'Sent secure message to advocate',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    timestamp: '2025-07-28T12:00:00Z',
    severity: 'low'
  },
  {
    id: '4',
    userId: '3',
    userName: 'Admin User',
    action: 'USER_ACCESS',
    resource: 'ADMIN_DASHBOARD',
    details: 'Accessed admin dashboard',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    timestamp: '2025-07-28T13:30:00Z',
    severity: 'high'
  }
];

export const [AuditProvider, useAudit] = createContextHook(() => {
  const { user } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAuditLogs = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, we would fetch from an API with proper filtering
        // For now, use mock data
        const stored = await AsyncStorage.getItem('auditLogs');
        const logs = stored ? JSON.parse(stored) : mockAuditLogs;
        
        setAuditLogs(logs);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
        setError('Failed to load audit logs');
      } finally {
        setIsLoading(false);
      }
    };

    loadAuditLogs();
  }, []);

  const logAction = async (
    action: string,
    resource: string,
    details: string,
    resourceId?: string,
    severity: AuditLogEntry['severity'] = 'low'
  ) => {
    try {
      if (!user) return;
      
      const newEntry: AuditLogEntry = {
        id: `${Date.now()}`,
        userId: user.id,
        userName: user.name,
        action,
        resource,
        resourceId,
        details,
        ipAddress: '192.168.1.100', // In a real app, get actual IP
        userAgent: 'React Native App', // In a real app, get actual user agent
        timestamp: new Date().toISOString(),
        severity
      };
      
      const updatedLogs = [newEntry, ...auditLogs];
      setAuditLogs(updatedLogs);
      
      // Save to storage
      await AsyncStorage.setItem('auditLogs', JSON.stringify(updatedLogs));
      
      console.log('Audit log entry created:', newEntry);
    } catch (err) {
      console.error('Failed to create audit log entry:', err);
      setError('Failed to log action');
    }
  };

  const getLogsByUser = (userId: string) => {
    return auditLogs.filter(log => log.userId === userId);
  };

  const getLogsByResource = (resource: string, resourceId?: string) => {
    return auditLogs.filter(log => 
      log.resource === resource && 
      (!resourceId || log.resourceId === resourceId)
    );
  };

  const getLogsBySeverity = (severity: AuditLogEntry['severity']) => {
    return auditLogs.filter(log => log.severity === severity);
  };

  const getRecentLogs = (limit: number = 10) => {
    return auditLogs.slice(0, limit);
  };

  const getSecurityStats = () => {
    const total = auditLogs.length;
    const critical = auditLogs.filter(log => log.severity === 'critical').length;
    const high = auditLogs.filter(log => log.severity === 'high').length;
    const medium = auditLogs.filter(log => log.severity === 'medium').length;
    const low = auditLogs.filter(log => log.severity === 'low').length;
    
    return {
      total,
      critical,
      high,
      medium,
      low,
      riskScore: Math.round(((critical * 4) + (high * 3) + (medium * 2) + (low * 1)) / total * 10) || 0
    };
  };

  return {
    auditLogs,
    isLoading,
    error,
    logAction,
    getLogsByUser,
    getLogsByResource,
    getLogsBySeverity,
    getRecentLogs,
    getSecurityStats
  };
});