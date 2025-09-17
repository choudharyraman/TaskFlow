import React from 'react';
import {
  Text,
  TextStyle,
  StyleSheet,
} from 'react-native';
import DesignSystem from '../../styles/designSystem';

interface TypographyProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body1' | 'body2' | 'caption' | 'overline';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | string;
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  align?: 'left' | 'center' | 'right' | 'justify';
  numberOfLines?: number;
  style?: TextStyle;
}

export default function Typography({
  children,
  variant = 'body1',
  color = 'primary',
  weight,
  align = 'left',
  numberOfLines,
  style,
}: TypographyProps) {
  const getTextStyle = (): TextStyle => {
    // Variant styles
    const variantStyles = {
      h1: {
        fontSize: DesignSystem.Typography.sizes['4xl'],
        fontWeight: DesignSystem.Typography.weights.bold,
        lineHeight: DesignSystem.Typography.sizes['4xl'] * DesignSystem.Typography.lineHeights.tight,
      },
      h2: {
        fontSize: DesignSystem.Typography.sizes['3xl'],
        fontWeight: DesignSystem.Typography.weights.bold,
        lineHeight: DesignSystem.Typography.sizes['3xl'] * DesignSystem.Typography.lineHeights.tight,
      },
      h3: {
        fontSize: DesignSystem.Typography.sizes['2xl'],
        fontWeight: DesignSystem.Typography.weights.semibold,
        lineHeight: DesignSystem.Typography.sizes['2xl'] * DesignSystem.Typography.lineHeights.tight,
      },
      h4: {
        fontSize: DesignSystem.Typography.sizes.xl,
        fontWeight: DesignSystem.Typography.weights.semibold,
        lineHeight: DesignSystem.Typography.sizes.xl * DesignSystem.Typography.lineHeights.normal,
      },
      body1: {
        fontSize: DesignSystem.Typography.sizes.base,
        fontWeight: DesignSystem.Typography.weights.normal,
        lineHeight: DesignSystem.Typography.sizes.base * DesignSystem.Typography.lineHeights.normal,
      },
      body2: {
        fontSize: DesignSystem.Typography.sizes.sm,
        fontWeight: DesignSystem.Typography.weights.normal,
        lineHeight: DesignSystem.Typography.sizes.sm * DesignSystem.Typography.lineHeights.normal,
      },
      caption: {
        fontSize: DesignSystem.Typography.sizes.xs,
        fontWeight: DesignSystem.Typography.weights.normal,
        lineHeight: DesignSystem.Typography.sizes.xs * DesignSystem.Typography.lineHeights.normal,
      },
      overline: {
        fontSize: DesignSystem.Typography.sizes.xs,
        fontWeight: DesignSystem.Typography.weights.semibold,
        lineHeight: DesignSystem.Typography.sizes.xs * DesignSystem.Typography.lineHeights.normal,
        textTransform: 'uppercase',
        letterSpacing: 1,
      },
    };

    // Color styles
    const getColorValue = () => {
      switch (color) {
        case 'primary':
          return DesignSystem.Colors.neutral[800];
        case 'secondary':
          return DesignSystem.Colors.neutral[600];
        case 'success':
          return DesignSystem.Colors.success[600];
        case 'warning':
          return DesignSystem.Colors.warning[600];
        case 'error':
          return DesignSystem.Colors.error[600];
        case 'info':
          return DesignSystem.Colors.info[600];
        default:
          return color; // Custom color
      }
    };

    return {
      ...variantStyles[variant],
      color: getColorValue(),
      textAlign: align,
      ...(weight && { fontWeight: DesignSystem.Typography.weights[weight] }),
    };
  };

  return (
    <Text 
      style={[getTextStyle(), style]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  // Additional styles if needed
});