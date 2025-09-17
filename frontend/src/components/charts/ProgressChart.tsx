import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Path, G, Text as SvgText } from 'react-native-svg';
import DesignSystem from '../../styles/designSystem';

const { width } = Dimensions.get('window');

interface ProgressChartProps {
  data: {
    label: string;
    value: number;
    maxValue: number;
    color: string;
  }[];
  size?: number;
  strokeWidth?: number;
  showLabels?: boolean;
}

export default function ProgressChart({
  data,
  size = Math.min(width * 0.8, 280),
  strokeWidth = 8,
  showLabels = true,
}: ProgressChartProps) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const renderProgressRing = (item: any, index: number) => {
    const progress = Math.min(item.value / item.maxValue, 1);
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference * (1 - progress);
    
    // Calculate ring position for multiple rings
    const ringRadius = radius - (index * (strokeWidth + 4));
    const ringCircumference = 2 * Math.PI * ringRadius;
    const ringStrokeDasharray = ringCircumference;
    const ringStrokeDashoffset = ringCircumference * (1 - progress);

    return (
      <G key={index}>
        {/* Background ring */}
        <Circle
          cx={center}
          cy={center}
          r={ringRadius}
          stroke={DesignSystem.Colors.neutral[200]}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress ring */}
        <Circle
          cx={center}
          cy={center}
          r={ringRadius}
          stroke={item.color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={ringStrokeDasharray}
          strokeDashoffset={ringStrokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </G>
    );
  };

  const renderCenterText = () => {
    if (data.length === 1) {
      const item = data[0];
      const percentage = Math.round((item.value / item.maxValue) * 100);
      
      return (
        <G>
          <SvgText
            x={center}
            y={center - 10}
            textAnchor="middle"
            fontSize={size * 0.12}
            fontWeight="bold"
            fill={DesignSystem.Colors.neutral[800]}
          >
            {percentage}%
          </SvgText>
          <SvgText
            x={center}
            y={center + 15}
            textAnchor="middle"
            fontSize={size * 0.05}
            fill={DesignSystem.Colors.neutral[600]}
          >
            {item.label}
          </SvgText>
        </G>
      );
    }
    
    return (
      <SvgText
        x={center}
        y={center}
        textAnchor="middle"
        fontSize={size * 0.08}
        fontWeight="600"
        fill={DesignSystem.Colors.neutral[800]}
      >
        Progress
      </SvgText>
    );
  };

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {data.map((item, index) => renderProgressRing(item, index))}
        {renderCenterText()}
      </Svg>
      
      {showLabels && data.length > 1 && (
        <View style={styles.legendContainer}>
          {data.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={styles.legendLabel}>
                {item.label}: {item.value}/{item.maxValue}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  legendContainer: {
    marginTop: DesignSystem.Spacing[4],
    alignItems: 'flex-start',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignSystem.Spacing[2],
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: DesignSystem.Spacing[2],
  },
  legendLabel: {
    fontSize: DesignSystem.Typography.sizes.sm,
    color: DesignSystem.Colors.neutral[700],
  },
});