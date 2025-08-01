import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Child, IEP } from '@/types';
import Card from './Card';
import Colors from '@/constants/colors';
import { ChevronRight, FileText } from 'lucide-react-native';

interface ChildCardProps {
  child: Child;
  ieps?: IEP[];
  onPress?: () => void;
  testID?: string;
}

export const ChildCard: React.FC<ChildCardProps> = ({
  child,
  ieps = [],
  onPress,
  testID
}) => {
  return (
    <Card style={styles.card} testID={testID}>
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.content}>
          <View style={styles.nameContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {child.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.name}>{child.name}</Text>
              {child.grade && (
                <Text style={styles.detail}>{child.grade}</Text>
              )}
              {child.school && (
                <Text style={styles.detail}>{child.school}</Text>
              )}
            </View>
          </View>
          
          <View style={styles.iepContainer}>
            <FileText size={16} color={Colors.primary} />
            <Text style={styles.iepText}>
              {ieps.length === 0 
                ? 'No IEPs uploaded' 
                : ieps.length === 1 
                  ? '1 IEP on file' 
                  : `${ieps.length} IEPs on file`}
            </Text>
          </View>
        </View>
        
        <ChevronRight size={20} color={Colors.textLight} />
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  content: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 2,
  },
  detail: {
    fontSize: 14,
    color: Colors.textLight,
  },
  iepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  iepText: {
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 6,
  },
});

export default ChildCard;