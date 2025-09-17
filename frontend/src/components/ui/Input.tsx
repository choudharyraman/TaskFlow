import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DesignSystem from '../../styles/designSystem';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
}

export default function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  variant = 'default',
  size = 'md',
  containerStyle,
  inputStyle,
  labelStyle,
  ...textInputProps
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      marginBottom: DesignSystem.Spacing[4],
    };

    return baseStyle;
  };

  const getInputContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: DesignSystem.BorderRadius.md,
      borderWidth: 1,
    };

    // Size styles
    const sizeStyles = {
      sm: {
        paddingVertical: DesignSystem.Spacing[2],
        paddingHorizontal: DesignSystem.Spacing[3],
        minHeight: 36,
      },
      md: {
        paddingVertical: DesignSystem.Spacing[3],
        paddingHorizontal: DesignSystem.Spacing[4],
        minHeight: 44,
      },
      lg: {
        paddingVertical: DesignSystem.Spacing[4],
        paddingHorizontal: DesignSystem.Spacing[5],
        minHeight: 52,
      },
    };

    // Variant styles
    const variantStyles = {
      default: {
        backgroundColor: DesignSystem.Colors.neutral[50],
        borderColor: error 
          ? DesignSystem.Colors.error[500]
          : isFocused 
            ? DesignSystem.Colors.primary[500]
            : DesignSystem.Colors.neutral[200],
      },
      filled: {
        backgroundColor: DesignSystem.Colors.neutral[100],
        borderColor: 'transparent',
        ...(isFocused && {
          backgroundColor: DesignSystem.Colors.neutral[50],
          borderColor: DesignSystem.Colors.primary[500],
        }),
        ...(error && {
          borderColor: DesignSystem.Colors.error[500],
        }),
      },
      outlined: {
        backgroundColor: 'transparent',
        borderColor: error 
          ? DesignSystem.Colors.error[500]
          : isFocused 
            ? DesignSystem.Colors.primary[500]
            : DesignSystem.Colors.neutral[300],
        borderWidth: isFocused ? 2 : 1,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getInputStyle = (): TextStyle => {
    const sizeStyles = {
      sm: {
        fontSize: DesignSystem.Typography.sizes.sm,
      },
      md: {
        fontSize: DesignSystem.Typography.sizes.base,
      },
      lg: {
        fontSize: DesignSystem.Typography.sizes.lg,
      },
    };

    return {
      flex: 1,
      color: DesignSystem.Colors.neutral[800],
      ...sizeStyles[size],
      ...(leftIcon && { marginLeft: DesignSystem.Spacing[2] }),
      ...(rightIcon && { marginRight: DesignSystem.Spacing[2] }),
    };
  };

  const getLabelStyle = (): TextStyle => {
    return {
      fontSize: DesignSystem.Typography.sizes.sm,
      fontWeight: DesignSystem.Typography.weights.medium,
      color: error 
        ? DesignSystem.Colors.error[600]
        : DesignSystem.Colors.neutral[700],
      marginBottom: DesignSystem.Spacing[2],
    };
  };

  const getHelperTextStyle = (): TextStyle => {
    return {
      fontSize: DesignSystem.Typography.sizes.xs,
      color: error 
        ? DesignSystem.Colors.error[600]
        : DesignSystem.Colors.neutral[500],
      marginTop: DesignSystem.Spacing[1],
      marginLeft: DesignSystem.Spacing[1],
    };
  };

  const getIconColor = () => {
    if (error) return DesignSystem.Colors.error[500];
    if (isFocused) return DesignSystem.Colors.primary[500];
    return DesignSystem.Colors.neutral[400];
  };

  const getIconSize = () => {
    const iconSizes = {
      sm: 16,
      md: 20,
      lg: 24,
    };
    return iconSizes[size];
  };

  return (
    <View style={[getContainerStyle(), containerStyle]}>
      {label && (
        <Text style={[getLabelStyle(), labelStyle]}>
          {label}
        </Text>
      )}
      
      <View style={getInputContainerStyle()}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={getIconSize()}
            color={getIconColor()}
          />
        )}
        
        <TextInput
          style={[getInputStyle(), inputStyle]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={DesignSystem.Colors.neutral[400]}
          {...textInputProps}
        />
        
        {rightIcon && (
          <Ionicons
            name={rightIcon}
            size={getIconSize()}
            color={getIconColor()}
            onPress={onRightIconPress}
            style={{ padding: DesignSystem.Spacing[1] }}
          />
        )}
      </View>
      
      {(error || helperText) && (
        <Text style={getHelperTextStyle()}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Additional styles if needed
});