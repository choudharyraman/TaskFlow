import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DesignSystem from '../../styles/designSystem';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: DesignSystem.BorderRadius.md,
      ...DesignSystem.Shadows.sm,
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
        paddingHorizontal: DesignSystem.Spacing[6],
        minHeight: 52,
      },
    };

    // Variant styles
    const variantStyles = {
      primary: {
        backgroundColor: disabled ? DesignSystem.Colors.neutral[300] : DesignSystem.Colors.primary[500],
      },
      secondary: {
        backgroundColor: disabled ? DesignSystem.Colors.neutral[100] : DesignSystem.Colors.neutral[200],
        borderWidth: 1,
        borderColor: disabled ? DesignSystem.Colors.neutral[200] : DesignSystem.Colors.neutral[300],
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: disabled ? DesignSystem.Colors.neutral[300] : DesignSystem.Colors.primary[500],
      },
      ghost: {
        backgroundColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
      },
      danger: {
        backgroundColor: disabled ? DesignSystem.Colors.neutral[300] : DesignSystem.Colors.error[500],
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(fullWidth && { width: '100%' }),
      ...(disabled && { opacity: 0.6 }),
    };
  };

  const getTextStyle = (): TextStyle => {
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

    const variantStyles = {
      primary: {
        color: DesignSystem.Colors.neutral[50],
        fontWeight: DesignSystem.Typography.weights.semibold,
      },
      secondary: {
        color: disabled ? DesignSystem.Colors.neutral[400] : DesignSystem.Colors.neutral[700],
        fontWeight: DesignSystem.Typography.weights.medium,
      },
      outline: {
        color: disabled ? DesignSystem.Colors.neutral[400] : DesignSystem.Colors.primary[500],
        fontWeight: DesignSystem.Typography.weights.medium,
      },
      ghost: {
        color: disabled ? DesignSystem.Colors.neutral[400] : DesignSystem.Colors.primary[500],
        fontWeight: DesignSystem.Typography.weights.medium,
      },
      danger: {
        color: DesignSystem.Colors.neutral[50],
        fontWeight: DesignSystem.Typography.weights.semibold,
      },
    };

    return {
      ...sizeStyles[size],
      ...variantStyles[variant],
      textAlign: 'center',
    };
  };

  const getIconSize = () => {
    const iconSizes = {
      sm: 16,
      md: 20,
      lg: 24,
    };
    return iconSizes[size];
  };

  const getIconColor = () => {
    const variantColors = {
      primary: DesignSystem.Colors.neutral[50],
      secondary: disabled ? DesignSystem.Colors.neutral[400] : DesignSystem.Colors.neutral[700],
      outline: disabled ? DesignSystem.Colors.neutral[400] : DesignSystem.Colors.primary[500],
      ghost: disabled ? DesignSystem.Colors.neutral[400] : DesignSystem.Colors.primary[500],
      danger: DesignSystem.Colors.neutral[50],
    };
    return variantColors[variant];
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? DesignSystem.Colors.neutral[50] : DesignSystem.Colors.primary[500]}
        />
      );
    }

    const iconElement = icon ? (
      <Ionicons
        name={icon}
        size={getIconSize()}
        color={getIconColor()}
        style={iconPosition === 'left' ? { marginRight: DesignSystem.Spacing[2] } : { marginLeft: DesignSystem.Spacing[2] }}
      />
    ) : null;

    const textElement = (
      <Text style={[getTextStyle(), textStyle]} numberOfLines={1}>
        {title}
      </Text>
    );

    return (
      <>
        {iconPosition === 'left' && iconElement}
        {textElement}
        {iconPosition === 'right' && iconElement}
      </>
    );
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      accessibilityLabel={title}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}