"use client";
import { useMemo } from 'react';

interface LineChartDataPoint {
  label: string;
  value: number;
  date?: string;
}

interface LineChartProps {
  title: string;
  data: LineChartDataPoint[];
  className?: string;
  height?: number;
  showPoints?: boolean;
  showGrid?: boolean;
  formatValue?: (value: number) => string;
  color?: string;
}

interface ChartPoint {
  x: number;
  y: number;
  value: number;
  label: string;
}

export function LineChart({
  title,
  data,
  className = "",
  height = 300,
  showPoints = true,
  showGrid = true,
  formatValue = (value) => value.toLocaleString(),
  color = '#3B82F6'
}: LineChartProps) {
  const { maxValue, minValue, points, pathData } = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        maxValue: 0,
        minValue: 0,
        points: [] as ChartPoint[],
        pathData: ''
      };
    }

    const values = data.map(item => item.value);
    const max = Math.max(...values);
    const min = Math.min(...values);

    const range = max - min;
    const padding = range * 0.1;
    const adjustedMax = max + padding;
    const adjustedMin = Math.max(0, min - padding);

    const chartWidth = 85; // Leave space for labels
    const chartHeight = height - 80;

    const calculatedPoints: ChartPoint[] = data.map((item, index) => {
      const x = 10 + (index / Math.max(data.length - 1, 1)) * chartWidth;
      const y = 40 + chartHeight - ((item.value - adjustedMin) / Math.max(adjustedMax - adjustedMin, 1)) * chartHeight;
      return { x, y, value: item.value, label: item.label };
    });

    const path = calculatedPoints.reduce((acc, point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${acc} ${command} ${point.x} ${point.y}`;
    }, '');

    return {
      maxValue: adjustedMax,
      minValue: adjustedMin,
      points: calculatedPoints,
      pathData: path
    };
  }, [data, height]);

  if (!data || data.length === 0) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center h-48 text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>

      <div className="relative" style={{ height: `${height}px` }}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 100 ${height}`}
          className="overflow-visible"
        >
          {showGrid && (
            <g className="opacity-20">
              {[0.25, 0.5, 0.75].map((ratio) => (
                <line
                  key={ratio}
                  x1="10"
                  y1={40 + ratio * (height - 80)}
                  x2="95"
                  y2={40 + ratio * (height - 80)}
                  stroke="#6B7280"
                  strokeWidth="0.5"
                />
              ))}
              {data.map((_, index) => {
                if (index === 0 || index === data.length - 1) return null;
                const x = 10 + (index / Math.max(data.length - 1, 1)) * 85;
                return (
                  <line
                    key={index}
                    x1={x}
                    y1="40"
                    x2={x}
                    y2={height - 40}
                    stroke="#6B7280"
                    strokeWidth="0.5"
                  />
                );
              })}
            </g>
          )}

          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth="2"
            className="drop-shadow-sm"
          />

          {showPoints && points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill={color}
                stroke="white"
                strokeWidth="2"
                className="drop-shadow-sm"
              />
              <circle
                cx={point.x}
                cy={point.y}
                r="8"
                fill="transparent"
                className="cursor-pointer hover:fill-gray-700 hover:fill-opacity-20"
              >
                <title>{`${point.label}: ${formatValue(point.value)}`}</title>
              </circle>
            </g>
          ))}
        </svg>

        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4">
          {data.map((item, index) => (
            <div
              key={index}
              className="text-xs text-gray-400 text-center"
              style={{
                transform: index === 0 ? 'translateX(0)' :
                  index === data.length - 1 ? 'translateX(-100%)' :
                    'translateX(-50%)'
              }}
            >
              {item.label}
            </div>
          ))}
        </div>

        <div className="absolute top-0 left-0 bottom-0 flex flex-col justify-between py-10 -ml-16">
          {[maxValue, maxValue * 0.75, maxValue * 0.5, maxValue * 0.25, minValue].map((value, index) => (
            <div key={index} className="text-xs text-gray-400 text-right">
              {formatValue(value)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}