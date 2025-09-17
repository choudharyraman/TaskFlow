import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, G, Text as SvgText, Line } from 'react-native-svg';
import DesignSystem from '../../styles/designSystem';

const { width } = Dimensions.get('window');

interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarData[];
  width?: number;
  height?: number;
  showValues?: boolean;
  showLabels?: boolean;
  horizontal?: boolean;
}

export default function BarChart({
  data,
  width: chartWidth = width * 0.9,
  height: chartHeight = 200,
  showValues = true,
  showLabels = true,
  horizontal = false,
}: BarChartProps) {
  if (!data || data.length === 0) return null;

  const padding = 40;
  const innerWidth = chartWidth - padding * 2;
  const innerHeight = chartHeight - padding * 2;

  const maxValue = Math.max(...data.map(d => d.value));
  const barSpacing = innerWidth / data.length;
  const barWidth = barSpacing * 0.7;

  const renderBars = () => {
    return data.map((item, index) => {
      const barHeight = (item.value / maxValue) * innerHeight;
      const x = padding + index * barSpacing + (barSpacing - barWidth) / 2;
      const y = chartHeight - padding - barHeight;
      
      const color = item.color || DesignSystem.Colors.primary[500];

      return (
        <G key={`bar-${index}`}>
          {/* Bar */}
          <Rect
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            fill={color}
            rx={4}
            ry={4}
          />
          
          {/* Value label on top of bar */}
          {showValues && (
            <SvgText
              x={x + barWidth / 2}
              y={y - 8}
              fontSize={12}
              fill={DesignSystem.Colors.neutral[700]}
              textAnchor="middle"
              fontWeight="600"
            >
              {item.value}
            </SvgText>
          )}
          
          {/* Label below bar */}
          {showLabels && (
            <SvgText
              x={x + barWidth / 2}
              y={chartHeight - padding + 16}
              fontSize={11}
              fill={DesignSystem.Colors.neutral[600]}
              textAnchor="middle"
            >
              {item.label}
            </SvgText>
          )}
        </G>
      );
    });
  };

  const renderHorizontalBars = () => {
    return data.map((item, index) => {
      const barWidth = (item.value / maxValue) * innerWidth;
      const barHeight = innerHeight / data.length * 0.7;
      const y = padding + index * (innerHeight / data.length) + (innerHeight / data.length - barHeight) / 2;
      const x = padding;
      
      const color = item.color || DesignSystem.Colors.primary[500];

      return (
        <G key={`bar-${index}`}>
          {/* Bar */}
          <Rect
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            fill={color}
            rx={4}
            ry={4}
          />
          
          {/* Value label */}
          {showValues && (
            <SvgText
              x={x + barWidth + 8}
              y={y + barHeight / 2 + 4}
              fontSize={12}
              fill={DesignSystem.Colors.neutral[700]}
              fontWeight="600"
            >
              {item.value}
            </SvgText>
          )}
          
          {/* Label */}
          {showLabels && (
            <SvgText
              x={x - 8}
              y={y + barHeight / 2 + 4}
              fontSize={11}
              fill={DesignSystem.Colors.neutral[600]}
              textAnchor="end"
            >
              {item.label}
            </SvgText>
          )}
        </G>
      );
    });
  };

  const renderGridLines = () => {
    const steps = 4;
    const lines = [];
    
    for (let i = 0; i <= steps; i++) {
      const value = (maxValue / steps) * i;
      
      if (horizontal) {
        const x = padding + (innerWidth / steps) * i;
        lines.push(
          <Line
            key={`grid-${i}`}
            x1={x}
            y1={padding}
            x2={x}
            y2={chartHeight - padding}
            stroke={DesignSystem.Colors.neutral[200]}
            strokeWidth={1}
            strokeDasharray="4,4"
          />
        );
      } else {
        const y = chartHeight - padding - (innerHeight / steps) * i;
        lines.push(
          <G key={`grid-${i}`}>
            <Line
              x1={padding}
              y1={y}
              x2={chartWidth - padding}
              y2={y}
              stroke={DesignSystem.Colors.neutral[200]}
              strokeWidth={1}
              strokeDasharray="4,4"
            />
            <SvgText
              x={padding - 10}
              y={y + 4}
              fontSize={10}
              fill={DesignSystem.Colors.neutral[500]}
              textAnchor="end"
            >
              {Math.round(value)}
            </SvgText>
          </G>
        );
      }
    }
    
    return lines;
  };

  return (
    <View style={styles.container}>
      <Svg width={chartWidth} height={chartHeight}>
        {/* Grid lines */}
        {renderGridLines()}
        
        {/* Bars */}
        {horizontal ? renderHorizontalBars() : renderBars()}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
});