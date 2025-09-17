import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, G, Text as SvgText, Line } from 'react-native-svg';
import DesignSystem from '../../styles/designSystem';

const { width } = Dimensions.get('window');

interface DataPoint {
  x: number;
  y: number;
  label?: string;
  date?: string;
}

interface LineChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
  showDots?: boolean;
  showLabels?: boolean;
  animate?: boolean;
}

export default function LineChart({
  data,
  width: chartWidth = width * 0.9,
  height: chartHeight = 200,
  color = DesignSystem.Colors.primary[500],
  showDots = true,
  showLabels = true,
  animate = false,
}: LineChartProps) {
  if (!data || data.length === 0) return null;

  const padding = 40;
  const innerWidth = chartWidth - padding * 2;
  const innerHeight = chartHeight - padding * 2;

  // Find min and max values
  const minY = Math.min(...data.map(d => d.y));
  const maxY = Math.max(...data.map(d => d.y));
  const minX = Math.min(...data.map(d => d.x));
  const maxX = Math.max(...data.map(d => d.x));

  // Scale functions
  const scaleX = (value: number) => ((value - minX) / (maxX - minX)) * innerWidth + padding;
  const scaleY = (value: number) => chartHeight - padding - ((value - minY) / (maxY - minY)) * innerHeight;

  // Generate path string
  const generatePath = () => {
    if (data.length === 0) return '';
    
    let path = `M ${scaleX(data[0].x)} ${scaleY(data[0].y)}`;
    
    for (let i = 1; i < data.length; i++) {
      const x = scaleX(data[i].x);
      const y = scaleY(data[i].y);
      
      // Create smooth curve using quadratic bezier
      if (i < data.length - 1) {
        const nextX = scaleX(data[i + 1].x);
        const nextY = scaleY(data[i + 1].y);
        const controlX = x + (nextX - x) * 0.5;
        path += ` Q ${controlX} ${y} ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    }
    
    return path;
  };

  // Generate gradient area path
  const generateAreaPath = () => {
    if (data.length === 0) return '';
    
    let path = generatePath();
    const lastPoint = data[data.length - 1];
    const firstPoint = data[0];
    
    path += ` L ${scaleX(lastPoint.x)} ${chartHeight - padding}`;
    path += ` L ${scaleX(firstPoint.x)} ${chartHeight - padding}`;
    path += ' Z';
    
    return path;
  };

  const renderGridLines = () => {
    const ySteps = 4;
    const lines = [];
    
    for (let i = 0; i <= ySteps; i++) {
      const y = padding + (innerHeight / ySteps) * i;
      const value = maxY - ((maxY - minY) / ySteps) * i;
      
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
          {showLabels && (
            <SvgText
              x={padding - 10}
              y={y + 4}
              fontSize={12}
              fill={DesignSystem.Colors.neutral[500]}
              textAnchor="end"
            >
              {Math.round(value)}
            </SvgText>
          )}
        </G>
      );
    }
    
    return lines;
  };

  const renderDataPoints = () => {
    return data.map((point, index) => {
      const x = scaleX(point.x);
      const y = scaleY(point.y);
      
      return (
        <G key={`point-${index}`}>
          {showDots && (
            <Circle
              cx={x}
              cy={y}
              r={4}
              fill={color}
              stroke={DesignSystem.Colors.neutral[50]}
              strokeWidth={2}
            />
          )}
          {point.label && (
            <SvgText
              x={x}
              y={y - 10}
              fontSize={10}
              fill={DesignSystem.Colors.neutral[600]}
              textAnchor="middle"
            >
              {point.label}
            </SvgText>
          )}
        </G>
      );
    });
  };

  return (
    <View style={styles.container}>
      <Svg width={chartWidth} height={chartHeight}>
        {/* Grid lines */}
        {renderGridLines()}
        
        {/* Area fill */}
        <Path
          d={generateAreaPath()}
          fill={`${color}20`}
          fillOpacity={0.3}
        />
        
        {/* Line */}
        <Path
          d={generatePath()}
          stroke={color}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {renderDataPoints()}
      </Svg>
      
      {/* X-axis labels */}
      {showLabels && (
        <View style={styles.xAxisLabels}>
          {data.map((point, index) => (
            <Text key={index} style={styles.xAxisLabel}>
              {point.date || point.x}
            </Text>
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
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    paddingHorizontal: DesignSystem.Spacing[4],
    marginTop: DesignSystem.Spacing[2],
  },
  xAxisLabel: {
    fontSize: DesignSystem.Typography.sizes.xs,
    color: DesignSystem.Colors.neutral[500],
    textAlign: 'center',
  },
});