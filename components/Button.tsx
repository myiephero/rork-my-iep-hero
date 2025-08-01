import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View,
  TouchableOpacity, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp
} from 'react-native';
import Colors from '@/constants/colors';

export interface ButtonProps {
  title: string;
  onPress: () => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
  icon?: React.ReactElement;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  testID,
  icon
}) => {
  const getButtonStyle = () => {
    const baseStyle: ViewStyle[] = [styles.button];
    
    // Add size style
    if (size === 'small') baseStyle.push(styles.buttonSmall);
    if (size === 'large') baseStyle.push(styles.buttonLarge);
    
    // Add variant style
    if (variant === 'primary') baseStyle.push(styles.buttonPrimary);
    if (variant === 'secondary') baseStyle.push(styles.buttonSecondary);
    if (variant === 'outline') baseStyle.push(styles.buttonOutline);
    if (variant === 'text') baseStyle.push(styles.buttonText);
    
    // Add disabled style
    if (disabled) baseStyle.push(styles.buttonDisabled);
    
    return baseStyle;
  };
  
  const getTextStyle = () => {
    const baseStyle: TextStyle[] = [styles.buttonLabel];
    
    // Add size style
    if (size === 'small') baseStyle.push(styles.buttonLabelSmall);
    if (size === 'large') baseStyle.push(styles.buttonLabelLarge);
    
    // Add variant style
    if (variant === 'primary') baseStyle.push(styles.buttonLabelPrimary);
    if (variant === 'secondary') baseStyle.push(styles.buttonLabelSecondary);
    if (variant === 'outline') baseStyle.push(styles.buttonLabelOutline);
    if (variant === 'text') baseStyle.push(styles.buttonLabelText);
    
    // Add disabled style
    if (disabled) baseStyle.push(styles.buttonLabelDisabled);
    
    return baseStyle;
  };
  
  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? '#fff' : Colors.primary} 
        />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
  },
  buttonSmall: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonLarge: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
  },
  buttonSecondary: {
    backgroundColor: Colors.secondary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  buttonText: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 4,
  },
  buttonDisabled: {
    backgroundColor: Colors.disabled,
    borderColor: Colors.disabled,
  },
  buttonLabel: {
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonLabelSmall: {
    fontSize: 14,
  },
  buttonLabelLarge: {
    fontSize: 18,
  },
  buttonLabelPrimary: {
    color: '#fff',
  },
  buttonLabelSecondary: {
    color: '#fff',
  },
  buttonLabelOutline: {
    color: Colors.primary,
  },
  buttonLabelText: {
    color: Colors.primary,
  },
  buttonLabelDisabled: {
    color: '#888',
  },
  iconContainer: {
    marginRight: 8,
  },
});

export default Button;