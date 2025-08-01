import React, { ReactNode } from 'react';
import { 
  StyleSheet, 
  View, 
  ViewStyle, 
  StyleProp, 
  TouchableOpacity 
} from 'react-native';
import Colors from '@/constants/colors';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  testID?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  testID
}) => {
  const CardComponent = onPress ? TouchableOpacity : View;
  
  return (
    <CardComponent
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      testID={testID}
    >
      {children}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginVertical: 8,
  },
});

export default Card;