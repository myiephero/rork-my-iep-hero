import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useAudit, AuditLogEntry } from '@/hooks/audit-store';
import Card from '@/components/Card';
import Colors from '@/constants/colors';
import { formatDistanceToNow } from '@/utils/date';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  Eye, 
  Lock, 
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react-native';

interface SecurityDashboardProps {
  testID?: string;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ testID }) => {
  const { auditLogs, getSecurityStats, getRecentLogs, getLogsBySeverity, isLoading } = useAudit();
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | AuditLogEntry['severity']>('all');
  
  const stats = getSecurityStats();
  const recentLogs = getRecentLogs(10);
  const filteredLogs = selectedSeverity === 'all' ? recentLogs : getLogsBySeverity(selectedSeverity);
  
  const getSeverityIcon = (severity: AuditLogEntry['severity']) => {
    switch (severity) {
      case 'critical':
        return <ShieldX size={16} color={Colors.error} />;
      case 'high':
        return <ShieldAlert size={16} color="#FF9800" />;
      case 'medium':
        return <Shield size={16} color="#FFC107" />;
      case 'low':
        return <ShieldCheck size={16} color={Colors.success} />;
      default:
        return <Shield size={16} color={Colors.textLight} />;
    }
  };
  
  const getSeverityColor = (severity: AuditLogEntry['severity']) => {
    switch (severity) {
      case 'critical':
        return Colors.error;
      case 'high':
        return '#FF9800';
      case 'medium':
        return '#FFC107';
      case 'low':
        return Colors.success;
      default:
        return Colors.textLight;
    }
  };
  
  const getActionIcon = (action: string) => {
    if (action.includes('ACCESS')) return <Eye size={16} color={Colors.primary} />;
    if (action.includes('UPLOAD') || action.includes('CREATE')) return <CheckCircle size={16} color={Colors.success} />;
    if (action.includes('DELETE') || action.includes('REMOVE')) return <XCircle size={16} color={Colors.error} />;
    if (action.includes('LOGIN') || action.includes('AUTH')) return <Lock size={16} color={Colors.primary} />;
    return <Activity size={16} color={Colors.textLight} />;
  };
  
  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return Colors.error;
    if (score >= 60) return '#FF9800';
    if (score >= 40) return '#FFC107';
    return Colors.success;
  };
  
  if (isLoading) {
    return (
      <Card style={styles.container}>
        <Text style={styles.loadingText}>Loading security data...</Text>
      </Card>
    );
  }
  
  return (
    <ScrollView style={styles.container} testID={testID}>
      {/* Security Overview */}
      <Card style={styles.overviewCard}>
        <View style={styles.overviewHeader}>
          <Shield size={24} color={Colors.primary} />
          <Text style={styles.overviewTitle}>Security Overview</Text>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Events</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: getRiskScoreColor(stats.riskScore) }]}>
              {stats.riskScore}
            </Text>
            <Text style={styles.statLabel}>Risk Score</Text>
          </View>
        </View>
        
        <View style={styles.severityBreakdown}>
          <View style={styles.severityItem}>
            <ShieldX size={16} color={Colors.error} />
            <Text style={styles.severityCount}>{stats.critical}</Text>
            <Text style={styles.severityLabel}>Critical</Text>
          </View>
          
          <View style={styles.severityItem}>
            <ShieldAlert size={16} color="#FF9800" />
            <Text style={styles.severityCount}>{stats.high}</Text>
            <Text style={styles.severityLabel}>High</Text>
          </View>
          
          <View style={styles.severityItem}>
            <Shield size={16} color="#FFC107" />
            <Text style={styles.severityCount}>{stats.medium}</Text>
            <Text style={styles.severityLabel}>Medium</Text>
          </View>
          
          <View style={styles.severityItem}>
            <ShieldCheck size={16} color={Colors.success} />
            <Text style={styles.severityCount}>{stats.low}</Text>
            <Text style={styles.severityLabel}>Low</Text>
          </View>
        </View>
      </Card>
      
      {/* FERPA Compliance Status */}
      <Card style={styles.complianceCard}>
        <View style={styles.complianceHeader}>
          <CheckCircle size={20} color={Colors.success} />
          <Text style={styles.complianceTitle}>FERPA Compliance Status</Text>
        </View>
        
        <View style={styles.complianceItems}>
          <View style={styles.complianceItem}>
            <CheckCircle size={16} color={Colors.success} />
            <Text style={styles.complianceText}>End-to-end encryption enabled</Text>
          </View>
          
          <View style={styles.complianceItem}>
            <CheckCircle size={16} color={Colors.success} />
            <Text style={styles.complianceText}>Audit logging active</Text>
          </View>
          
          <View style={styles.complianceItem}>
            <CheckCircle size={16} color={Colors.success} />
            <Text style={styles.complianceText}>Access controls enforced</Text>
          </View>
          
          <View style={styles.complianceItem}>
            <AlertTriangle size={16} color="#FFC107" />
            <Text style={styles.complianceText}>MVP - Full compliance pending</Text>
          </View>
        </View>
      </Card>
      
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Recent Activity</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedSeverity === 'all' && styles.filterButtonActive
            ]}
            onPress={() => setSelectedSeverity('all')}
            testID="filter-all-button"
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedSeverity === 'all' && styles.filterButtonTextActive
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          
          {(['critical', 'high', 'medium', 'low'] as const).map((severity) => (
            <TouchableOpacity
              key={severity}
              style={[
                styles.filterButton,
                selectedSeverity === severity && styles.filterButtonActive
              ]}
              onPress={() => setSelectedSeverity(severity)}
              testID={`filter-${severity}-button`}
            >
              {getSeverityIcon(severity)}
              <Text
                style={[
                  styles.filterButtonText,
                  selectedSeverity === severity && styles.filterButtonTextActive,
                  { marginLeft: 4 }
                ]}
              >
                {severity.charAt(0).toUpperCase() + severity.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Audit Log */}
      <Card style={styles.logCard}>
        {filteredLogs.length === 0 ? (
          <View style={styles.emptyState}>
            <Activity size={40} color={Colors.textLight} />
            <Text style={styles.emptyStateText}>No audit logs found</Text>
          </View>
        ) : (
          <FlatList
            data={filteredLogs}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.logItem} testID={`audit-log-${item.id}`}>
                <View style={styles.logHeader}>
                  <View style={styles.logIcons}>
                    {getActionIcon(item.action)}
                    {getSeverityIcon(item.severity)}
                  </View>
                  <Text style={styles.logTime}>
                    {formatDistanceToNow(new Date(item.timestamp))}
                  </Text>
                </View>
                
                <Text style={styles.logAction}>{item.action}</Text>
                <Text style={styles.logDetails}>{item.details}</Text>
                
                <View style={styles.logMeta}>
                  <Text style={styles.logMetaText}>User: {item.userName}</Text>
                  <Text style={styles.logMetaText}>IP: {item.ipAddress}</Text>
                </View>
              </View>
            )}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.logSeparator} />}
          />
        )}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    color: Colors.textLight,
    fontSize: 16,
    padding: 20,
  },
  overviewCard: {
    marginBottom: 16,
    padding: 16,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  severityBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F5F7FF',
    padding: 12,
    borderRadius: 8,
  },
  severityItem: {
    alignItems: 'center',
    flex: 1,
  },
  severityCount: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginTop: 4,
  },
  severityLabel: {
    fontSize: 10,
    color: Colors.textLight,
    marginTop: 2,
  },
  complianceCard: {
    marginBottom: 16,
    padding: 16,
  },
  complianceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  complianceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginLeft: 8,
  },
  complianceItems: {
    gap: 8,
  },
  complianceItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  complianceText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 8,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  filterScroll: {
    paddingHorizontal: 4,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#F5F7FF',
  },
  filterButtonActive: {
    backgroundColor: Colors.primaryLight,
  },
  filterButtonText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  filterButtonTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  logCard: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 8,
  },
  logItem: {
    paddingVertical: 12,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  logIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  logTime: {
    fontSize: 12,
    color: Colors.textLight,
  },
  logAction: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 2,
  },
  logDetails: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
  },
  logMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logMetaText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  logSeparator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
});

export default SecurityDashboard;