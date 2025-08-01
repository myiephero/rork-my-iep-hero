import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/auth-store';
import { useIEP } from '@/hooks/iep-store';
import { useCase } from '@/hooks/case-store';
import { useAdvocate } from '@/hooks/advocate-store';
import { useScheduling } from '@/hooks/scheduling-store';
import { useAudit } from '@/hooks/audit-store';
import Card from '@/components/Card';
import Button from '@/components/Button';
import IEPSummaryCard from '@/components/IEPSummaryCard';
import ChildCard from '@/components/ChildCard';
import FeedbackButton from '@/components/FeedbackButton';
import Colors from '@/constants/colors';
import { AlertTriangle, FileText, Users, MessageSquare, Calendar, Shield, Star, Clock } from 'lucide-react-native';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, isParent, isAdvocate, isAuthenticated } = useAuth();
  const { ieps, children, isLoading: iepLoading } = useIEP();
  const { cases, isLoading: caseLoading } = useCase();
  const { getMatchedAdvocate, getWaitlistPosition } = useAdvocate();
  const { getUpcomingAppointments } = useScheduling();
  const { logAction } = useAudit();
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/' as any);
    }
  }, [isAuthenticated, router]);
  
  if (!user || iepLoading || caseLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  
  const renderParentDashboard = () => {
    const hasChildren = children.length > 0;
    const hasIEPs = ieps.length > 0;
    const latestIEP = hasIEPs ? ieps[ieps.length - 1] : null;
    const matchedAdvocate = user ? getMatchedAdvocate(user.id) : null;
    const waitlistPosition = user ? getWaitlistPosition(user.id) : null;
    const upcomingAppointments = user ? getUpcomingAppointments(user.id, 2) : [];
    
    return (
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome, {user.name}</Text>
          <Text style={styles.dateText}>July 28, 2025</Text>
        </View>
        
        {!hasChildren && (
          <Card style={styles.emptyStateCard}>
            <View style={styles.emptyStateContent}>
              <Users size={40} color={Colors.primary} />
              <Text style={styles.emptyStateTitle}>Add Your Child</Text>
              <Text style={styles.emptyStateText}>
                Start by adding information about your child to get personalized support.
              </Text>
              <Button
                title="Add Child"
                onPress={() => router.push('/children/add' as any)}
                style={styles.emptyStateButton}
                testID="add-child-button"
              />
            </View>
          </Card>
        )}
        
        {hasChildren && !hasIEPs && (
          <Card style={styles.emptyStateCard}>
            <View style={styles.emptyStateContent}>
              <FileText size={40} color={Colors.primary} />
              <Text style={styles.emptyStateTitle}>Upload an IEP</Text>
              <Text style={styles.emptyStateText}>
                Upload your child's IEP to get AI-powered insights and advocate support.
              </Text>
              <Button
                title="Upload IEP"
                onPress={() => router.push('/children' as any)}
                style={styles.emptyStateButton}
                testID="upload-iep-button"
              />
            </View>
          </Card>
        )}
        
        {hasChildren && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Children</Text>
              <Button
                title="View All"
                variant="text"
                onPress={() => router.push('/children' as any)}
                testID="view-all-children-button"
              />
            </View>
            
            {children.slice(0, 2).map((child) => (
              <ChildCard
                key={child.id}
                child={child}
                ieps={ieps.filter(iep => iep.childId === child.id)}
                onPress={() => router.push(`/children/${child.id}` as any)}
                testID={`child-card-${child.id}`}
              />
            ))}
            
            {children.length > 2 && (
              <Text style={styles.moreText}>
                +{children.length - 2} more children
              </Text>
            )}
          </View>
        )}
        
        {latestIEP && latestIEP.summary && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Latest IEP Summary</Text>
              <Button
                title="View Details"
                variant="text"
                onPress={() => router.push(`/iep/${latestIEP.id}` as any)}
                testID="view-iep-details-button"
              />
            </View>
            
            <IEPSummaryCard
              summary={latestIEP.summary}
              compact={true}
              testID="latest-iep-summary"
            />
          </View>
        )}
        
        {/* Advocate Matching Section */}
        {matchedAdvocate ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Advocate</Text>
            </View>
            
            <Card style={styles.advocateCard}>
              <View style={styles.advocateHeader}>
                <Image 
                  source={{ uri: matchedAdvocate.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=60&auto=format&fit=crop' }}
                  style={styles.advocateAvatar}
                />
                <View style={styles.advocateInfo}>
                  <Text style={styles.advocateName}>{matchedAdvocate.name}</Text>
                  <View style={styles.advocateRating}>
                    <Star size={14} color="#FFD700" fill="#FFD700" />
                    <Text style={styles.advocateRatingText}>
                      {matchedAdvocate.rating} ({matchedAdvocate.reviewCount} reviews)
                    </Text>
                  </View>
                  <Text style={styles.advocateSpecialties}>
                    {matchedAdvocate.specialties.slice(0, 2).join(', ')}
                  </Text>
                </View>
              </View>
              
              <View style={styles.advocateActions}>
                <Button
                  title="Message"
                  onPress={() => {
                    logAction('ADVOCATE_MESSAGE', 'COMMUNICATION', 'Started conversation with advocate');
                    router.push(`/messages/${matchedAdvocate.id}` as any);
                  }}
                  variant="outline"
                  size="small"
                  style={styles.advocateActionButton}
                  testID="message-advocate-button"
                />
                <Button
                  title="Schedule Call"
                  onPress={() => {
                    logAction('CALL_SCHEDULE', 'COMMUNICATION', 'Initiated call scheduling with advocate');
                    router.push('/schedule-call' as any);
                  }}
                  variant="primary"
                  size="small"
                  style={styles.advocateActionButton}
                  testID="schedule-call-button"
                />
              </View>
            </Card>
          </View>
        ) : waitlistPosition ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Advocate Matching</Text>
            </View>
            
            <Card style={styles.waitlistCard}>
              <View style={styles.waitlistContent}>
                <Clock size={24} color={Colors.primary} />
                <View style={styles.waitlistInfo}>
                  <Text style={styles.waitlistTitle}>You are in the queue</Text>
                  <Text style={styles.waitlistPosition}>Position #{waitlistPosition.position}</Text>
                  <Text style={styles.waitlistTime}>Estimated wait: {waitlistPosition.estimatedWaitTime}</Text>
                </View>
              </View>
            </Card>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Need Help?</Text>
            </View>
            
            <Card style={styles.helpCard}>
              <View style={styles.helpCardContent}>
                <View style={styles.helpCardIcon}>
                  <MessageSquare size={24} color="#fff" />
                </View>
                <View style={styles.helpCardText}>
                  <Text style={styles.helpCardTitle}>Connect with an Advocate</Text>
                  <Text style={styles.helpCardDescription}>
                    Get personalized guidance from a special education advocate.
                  </Text>
                </View>
              </View>
              <Button
                title="Request Help"
                onPress={() => {
                  logAction('HELP_REQUEST', 'SUPPORT', 'Initiated advocate matching request');
                  router.push('/request-help' as any);
                }}
                variant="primary"
                style={styles.helpCardButton}
                testID="request-help-button"
              />
            </Card>
          </View>
        )}
        
        {/* Upcoming Appointments */}
        {upcomingAppointments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
            </View>
            
            {upcomingAppointments.map((appointment) => (
              <Card key={appointment.id} style={styles.appointmentCard}>
                <View style={styles.appointmentHeader}>
                  <Calendar size={20} color={Colors.primary} />
                  <Text style={styles.appointmentTitle}>{appointment.title}</Text>
                </View>
                <Text style={styles.appointmentDate}>
                  {new Date(appointment.date).toLocaleDateString()} at {appointment.startTime}
                </Text>
                <Text style={styles.appointmentType}>
                  {appointment.type === 'video' ? '📹 Video Call' : '📞 Phone Call'}
                </Text>
              </Card>
            ))}
          </View>
        )}
        
        {/* Security Status */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Security & Privacy</Text>
          </View>
          
          <Card style={styles.securityCard}>
            <View style={styles.securityHeader}>
              <Shield size={20} color={Colors.success} />
              <Text style={styles.securityTitle}>Your data is secure</Text>
            </View>
            <View style={styles.securityFeatures}>
              <View style={styles.securityFeature}>
                <Text style={styles.securityFeatureText}>🔒 End-to-end encryption</Text>
              </View>
              <View style={styles.securityFeature}>
                <Text style={styles.securityFeatureText}>📋 Complete audit trail</Text>
              </View>
              <View style={styles.securityFeature}>
                <Text style={styles.securityFeatureText}>🛡️ FERPA-conscious design</Text>
              </View>
            </View>
          </Card>
        </View>
        
        <View style={styles.disclaimerContainer}>
          <AlertTriangle size={16} color={Colors.warning} />
          <Text style={styles.disclaimerText}>
            My IEP Hero is not a FERPA-compliant system. This MVP is for educational guidance only.
          </Text>
        </View>
      </ScrollView>
    );
  };
  
  const renderAdvocateDashboard = () => {
    const activeCases = cases.filter(c => c.status === 'active');
    const pendingCases = cases.filter(c => c.status === 'pending');
    
    return (
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome, {user.name}</Text>
          <Text style={styles.dateText}>July 28, 2025</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{activeCases.length}</Text>
            <Text style={styles.statLabel}>Active Cases</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{pendingCases.length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{cases.length}</Text>
            <Text style={styles.statLabel}>Total Cases</Text>
          </View>
        </View>
        
        {cases.length === 0 ? (
          <Card style={styles.emptyStateCard}>
            <View style={styles.emptyStateContent}>
              <FileText size={40} color={Colors.primary} />
              <Text style={styles.emptyStateTitle}>No Cases Yet</Text>
              <Text style={styles.emptyStateText}>
                You don't have any assigned cases yet. New cases will appear here when parents request help.
              </Text>
            </View>
          </Card>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Cases</Text>
              <Button
                title="View All"
                variant="text"
                onPress={() => router.push('/cases' as any)}
                testID="view-all-cases-button"
              />
            </View>
            
            {cases.slice(0, 3).map((caseItem) => {
              const child = children.find(c => c.id === caseItem.childId);
              const iep = ieps.find(i => i.id === caseItem.iepId);
              
              return (
                <Card key={caseItem.id} style={styles.caseCard} onPress={() => router.push(`/cases/${caseItem.id}` as any)}>
                  <View style={styles.caseHeader}>
                    <View style={styles.caseNameContainer}>
                      <Text style={styles.caseName}>{child?.name || 'Unknown Child'}</Text>
                      <View style={[
                        styles.caseStatus,
                        caseItem.status === 'active' ? styles.caseStatusActive : 
                        caseItem.status === 'pending' ? styles.caseStatusPending : 
                        styles.caseStatusCompleted
                      ]}>
                        <Text style={styles.caseStatusText}>
                          {caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.caseType}>{caseItem.helpType}</Text>
                  </View>
                  
                  {iep && iep.summary && (
                    <View style={styles.caseSummary}>
                      <Text style={styles.caseSummaryTitle}>IEP Summary</Text>
                      <Text style={styles.caseSummaryText} numberOfLines={2}>
                        {iep.summary.goals[0]}
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.caseActions}>
                    <Button
                      title="View Details"
                      variant="outline"
                      size="small"
                      onPress={() => router.push(`/cases/${caseItem.id}` as any)}
                      style={styles.caseActionButton}
                      testID={`view-case-${caseItem.id}-button`}
                    />
                    <Button
                      title="Message"
                      variant="primary"
                      size="small"
                      onPress={() => router.push(`/messages/${caseItem.parentId}` as any)}
                      style={styles.caseActionButton}
                      testID={`message-parent-${caseItem.parentId}-button`}
                    />
                  </View>
                </Card>
              );
            })}
            
            {cases.length > 3 && (
              <Text style={styles.moreText}>
                +{cases.length - 3} more cases
              </Text>
            )}
          </View>
        )}
        
        <View style={styles.disclaimerContainer}>
          <AlertTriangle size={16} color={Colors.warning} />
          <Text style={styles.disclaimerText}>
            My IEP Hero is not a FERPA-compliant system. This MVP is for educational guidance only.
          </Text>
        </View>
      </ScrollView>
    );
  };
  
  return (
    <View style={{ flex: 1 }}>
      {isParent ? renderParentDashboard() : renderAdvocateDashboard()}
      <FeedbackButton
        location="Dashboard"
        variant="floating"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  dateText: {
    fontSize: 16,
    color: Colors.textLight,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
  },
  emptyStateCard: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  emptyStateContent: {
    alignItems: 'center',
    padding: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  emptyStateButton: {
    minWidth: 150,
  },
  moreText: {
    fontSize: 14,
    color: Colors.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  helpCard: {
    backgroundColor: Colors.card,
  },
  helpCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  helpCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  helpCardText: {
    flex: 1,
  },
  helpCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
  },
  helpCardDescription: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  helpCardButton: {
    alignSelf: 'flex-end',
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 20,
    marginTop: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 8,
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  caseCard: {
    marginBottom: 12,
  },
  caseHeader: {
    marginBottom: 12,
  },
  caseNameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  caseName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
  },
  caseStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  caseStatusActive: {
    backgroundColor: '#E8F5E9',
  },
  caseStatusPending: {
    backgroundColor: '#FFF8E1',
  },
  caseStatusCompleted: {
    backgroundColor: '#E3F2FD',
  },
  caseStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  caseType: {
    fontSize: 14,
    color: Colors.textLight,
  },
  caseSummary: {
    backgroundColor: '#F5F7FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  caseSummaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
  },
  caseSummaryText: {
    fontSize: 14,
    color: Colors.text,
    fontStyle: 'italic',
  },
  caseActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  caseActionButton: {
    marginLeft: 8,
  },
  advocateCard: {
    marginBottom: 12,
  },
  advocateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  advocateAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  advocateInfo: {
    flex: 1,
  },
  advocateName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
  },
  advocateRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  advocateRatingText: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 4,
  },
  advocateSpecialties: {
    fontSize: 14,
    color: Colors.text,
    fontStyle: 'italic',
  },
  advocateActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  advocateActionButton: {
    marginLeft: 8,
  },
  waitlistCard: {
    marginBottom: 12,
  },
  waitlistContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  waitlistInfo: {
    marginLeft: 16,
    flex: 1,
  },
  waitlistTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
  },
  waitlistPosition: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 2,
  },
  waitlistTime: {
    fontSize: 14,
    color: Colors.textLight,
  },
  appointmentCard: {
    marginBottom: 12,
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginLeft: 8,
  },
  appointmentDate: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  appointmentType: {
    fontSize: 14,
    color: Colors.textLight,
  },
  securityCard: {
    marginBottom: 12,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginLeft: 8,
  },
  securityFeatures: {
    marginVertical: 4,
  },
  securityFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  securityFeatureText: {
    fontSize: 14,
    color: Colors.text,
  },
});