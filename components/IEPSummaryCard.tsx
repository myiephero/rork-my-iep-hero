import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { IEPSummary } from '@/types';
import Card from './Card';
import Colors from '@/constants/colors';
import { AlertTriangle, Target, Stethoscope, Settings } from 'lucide-react-native';

interface IEPSummaryCardProps {
  summary: IEPSummary;
  compact?: boolean;
  testID?: string;
}

export const IEPSummaryCard: React.FC<IEPSummaryCardProps> = ({
  summary,
  compact = false,
  testID
}) => {
  const renderSection = (title: string, items: string[], icon: React.ReactNode) => {
    const filteredItems = items.filter(item => item && typeof item === 'string' && item.trim().length > 0);
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          {icon}
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {filteredItems.length > 0 ? (
          <View>
            {filteredItems.map((item, index) => {
              const cleanItem = String(item).trim();
              if (!cleanItem) return null;
              
              return (
                <View key={index} style={styles.itemContainer}>
                  <View style={styles.bullet} />
                  <Text style={styles.itemText}>{cleanItem}</Text>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.itemContainer}>
            <View style={styles.bullet} />
            <Text style={styles.itemText}>No specific {title.toLowerCase()} identified</Text>
          </View>
        )}
      </View>
    );
  };
  
  return (
    <Card style={styles.card} testID={testID}>
      <Text style={styles.title}>IEP Summary</Text>
      
      {compact ? (
        <ScrollView style={styles.compactContainer}>
          {renderSection('Goals', summary.goals.slice(0, 2), 
            <Target size={20} color={Colors.primary} />
          )}
          {summary.goals.length > 2 && (
            <View style={styles.moreTextContainer}>
              <Text style={styles.moreText}>+{summary.goals.length - 2} more goals</Text>
            </View>
          )}
          
          {renderSection('Services', summary.services.slice(0, 2), 
            <Stethoscope size={20} color={Colors.secondary} />
          )}
          {summary.services.length > 2 && (
            <View style={styles.moreTextContainer}>
              <Text style={styles.moreText}>+{summary.services.length - 2} more services</Text>
            </View>
          )}
          
          {renderSection('Accommodations', summary.accommodations.slice(0, 2), 
            <Settings size={20} color={Colors.accent} />
          )}
          {summary.accommodations.length > 2 && (
            <View style={styles.moreTextContainer}>
              <Text style={styles.moreText}>+{summary.accommodations.length - 2} more accommodations</Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <>
          {renderSection('Goals', summary.goals, 
            <Target size={20} color={Colors.primary} />
          )}
          
          {renderSection('Services', summary.services, 
            <Stethoscope size={20} color={Colors.secondary} />
          )}
          
          {renderSection('Accommodations', summary.accommodations, 
            <Settings size={20} color={Colors.accent} />
          )}
          
          {summary.notes && String(summary.notes).trim() && (
            <View style={styles.notesContainer}>
              <View style={styles.notesHeader}>
                <AlertTriangle size={20} color={Colors.warning} />
                <Text style={styles.notesTitle}>Notes</Text>
              </View>
              <Text style={styles.notesText}>{String(summary.notes).trim()}</Text>
            </View>
          )}
        </>
      )}
      
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          This is an AI-generated summary and not legal advice.
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 16,
  },
  compactContainer: {
    maxHeight: 300,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  itemContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 8,
    marginRight: 8,
  },
  itemText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  moreTextContainer: {
    marginLeft: 32,
    marginBottom: 8,
  },
  moreText: {
    fontSize: 14,
    color: Colors.primary,
    fontStyle: 'italic',
  },
  notesContainer: {
    backgroundColor: '#FFF9E6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  notesText: {
    fontSize: 14,
    color: Colors.text,
    fontStyle: 'italic',
  },
  disclaimer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    marginTop: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: Colors.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default IEPSummaryCard;