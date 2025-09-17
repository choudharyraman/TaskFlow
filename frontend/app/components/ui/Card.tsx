import React from 'react';
import {
  View,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import DesignSystem from '../../styles/designSystem';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  margin?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  style?: ViewStyle;
}

export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  margin = 'none',
  style,
}: CardProps) {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: DesignSystem.BorderRadius.lg,
      backgroundColor: DesignSystem.Colors.neutral[50],
    };

    // Variant styles
    const variantStyles = {
      default: {
        ...DesignSystem.Shadows.sm,
      },
      elevated: {
        ...DesignSystem.Shadows.md,
      },
      outlined: {
        borderWidth: 1,
        borderColor: DesignSystem.Colors.neutral[200],
        backgroundColor: 'transparent',
      },
      ghost: {
        backgroundColor: 'transparent',
      }
    };

    // Padding styles
    const paddingStyles = {
      none: { padding: 0 },
      sm: { padding: DesignSystem.Spacing[3] },
      md: { padding: DesignSystem.Spacing[4] },
      lg: { padding: DesignSystem.Spacing[5] },
      xl: { padding: DesignSystem.Spacing[6] },
    };

    // Margin styles
    const marginStyles = {
      none: { margin: 0 },
      sm: { margin: DesignSystem.Spacing[2] },
      md: { margin: DesignSystem.Spacing[3] },
      lg: { margin: DesignSystem.Spacing[4] },
      xl: { margin: DesignSystem.Spacing[5] },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
      ...paddingStyles[padding],
      ...marginStyles[margin],
    };
  };

  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  // Additional styles if needed
});