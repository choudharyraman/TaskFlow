/**
 * Design System - Consistent styling across all modules
 * Implements modern mobile-first design principles
 */

export const Colors = {
  // Primary Brand Colors
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF', 
    500: '#6366F1',
    600: '#4F46E5',
    700: '#4338CA',
    900: '#312E81',
  },
  
  // Semantic Colors
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
  },
  
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    500: '#F59E0B', 
    600: '#D97706',
    700: '#B45309',
  },
  
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },
  
  info: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    500: '#06B6D4',
    600: '#0891B2',
    700: '#0E7490',
  },
  
  // Neutral Colors
  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  
  // Module Specific Colors
  modules: {
    cbt: '#10B981',
    mindfulness: '#8B5CF6',
    pomodoro: '#F59E0B',
    intentions: '#EF4444',
    fiveMinute: '#06B6D4',
    activity: '#84CC16',
    sleep: '#6366F1',
    social: '#F97316',
    analytics: '#EC4899',
    environmental: '#84CC16',
    selfCompassion: '#EC4899',
    gamification: '#F59E0B',
    integrations: '#6366F1',
    research: '#8B5CF6',
  }
};

export const Typography = {
  // Font Sizes
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  // Font Weights
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  // Line Heights
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  }
};

export const Spacing = {
  // Base spacing unit: 4px
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
};

export const BorderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6.27,
    elevation: 10,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 13.16,
    elevation: 20,
  }
};

export const Layout = {
  // Container widths
  container: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
  
  // Header heights
  header: {
    default: 60,
    compact: 48,
  },
  
  // Navigation heights
  navigation: {
    bottom: 80,
    tab: 48,
  },
  
  // Touch target sizes
  touchTarget: {
    minimum: 44, // iOS minimum
    recommended: 48, // Android recommended
  }
};

// Animation configurations
export const Animations = {
  timing: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
  
  easing: {
    easeOut: 'ease-out',
    easeIn: 'ease-in',
    easeInOut: 'ease-in-out',
  }
};

// Common component styles
export const CommonStyles = {
  card: {
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.lg,
    padding: Spacing[5],
    ...Shadows.base,
  },
  
  button: {
    primary: {
      backgroundColor: Colors.primary[500],
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing[3],
      paddingHorizontal: Spacing[6],
      ...Shadows.sm,
    },
    
    secondary: {
      backgroundColor: Colors.neutral[100],
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing[3],
      paddingHorizontal: Spacing[6],
      borderWidth: 1,
      borderColor: Colors.neutral[200],
    }
  },
  
  input: {
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    fontSize: Typography.sizes.base,
  }
};

// Accessibility configurations
export const Accessibility = {
  // Minimum contrast ratios
  contrast: {
    normal: 4.5,
    large: 3.0,
  },
  
  // Focus indicators
  focus: {
    width: 2,
    color: Colors.primary[500],
    offset: 2,
  },
  
  // Touch target sizes
  touchTarget: Layout.touchTarget,
  
  // Animation preferences
  reducedMotion: {
    duration: 0,
    easing: 'linear',
  }
};

export default {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  Layout,
  Animations,
  CommonStyles,
  Accessibility,
};