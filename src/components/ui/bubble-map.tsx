"use client";
import { useMemo } from 'react';

interface BubbleMapDataPoint {
  region: string;
  country: string;
  value: number;
  revenue?: number;
  spend?: number;
  latitude?: number;
  longitude?: number;
}

interface BubbleMapProps {
  title: string;
  data: BubbleMapDataPoint[];
  className?: string;
  height?: number;
  formatValue?: (value: number) => string;
  showLegend?: boolean;
  colorScheme?: 'blue' | 'green' | 'red' | 'purple';
}

// Regional coordinates for major cities/regions (simplified world map)
const REGION_COORDINATES: { [key: string]: { x: number; y: number; country: string } } = {
  // North America
  'New York': { x: 22, y: 18, country: 'USA' },
  'Los Angeles': { x: 15, y: 22, country: 'USA' },
  'Chicago': { x: 20, y: 20, country: 'USA' },
  'Toronto': { x: 21, y: 17, country: 'Canada' },
  'Vancouver': { x: 15, y: 15, country: 'Canada' },
  'Mexico City': { x: 18, y: 30, country: 'Mexico' },

  // Europe
  'London': { x: 48, y: 16, country: 'UK' },
  'Paris': { x: 50, y: 18, country: 'France' },
  'Berlin': { x: 52, y: 15, country: 'Germany' },
  'Madrid': { x: 47, y: 22, country: 'Spain' },
  'Rome': { x: 52, y: 24, country: 'Italy' },
  'Amsterdam': { x: 50, y: 15, country: 'Netherlands' },
  'Vienna': { x: 54, y: 18, country: 'Austria' },
  'Stockholm': { x: 56, y: 10, country: 'Sweden' },
  'Moscow': { x: 70, y: 12, country: 'Russia' },

  // Middle East & North Africa
  'Dubai': { x: 72, y: 28, country: 'UAE' },
  'Abu Dhabi': { x: 71, y: 29, country: 'UAE' },
  'Sharjah': { x: 73, y: 28, country: 'UAE' },
  'Riyadh': { x: 68, y: 29, country: 'Saudi Arabia' },
  'Jeddah': { x: 65, y: 31, country: 'Saudi Arabia' },
  'Kuwait City': { x: 69, y: 26, country: 'Kuwait' },
  'Doha': { x: 70, y: 28, country: 'Qatar' },
  'Manama': { x: 69, y: 27, country: 'Bahrain' },
  'Cairo': { x: 60, y: 25, country: 'Egypt' },
  'Casablanca': { x: 43, y: 23, country: 'Morocco' },

  // Asia-Pacific
  'Tokyo': { x: 88, y: 20, country: 'Japan' },
  'Seoul': { x: 84, y: 18, country: 'South Korea' },
  'Beijing': { x: 80, y: 17, country: 'China' },
  'Shanghai': { x: 81, y: 21, country: 'China' },
  'Hong Kong': { x: 79, y: 27, country: 'Hong Kong' },
  'Mumbai': { x: 74, y: 32, country: 'India' },
  'Delhi': { x: 75, y: 26, country: 'India' },
  'Singapore': { x: 79, y: 42, country: 'Singapore' },
  'Bangkok': { x: 77, y: 38, country: 'Thailand' },
  'Sydney': { x: 89, y: 52, country: 'Australia' },
  'Melbourne': { x: 87, y: 54, country: 'Australia' },

  // South America
  'São Paulo': { x: 33, y: 47, country: 'Brazil' },
  'Rio de Janeiro': { x: 34, y: 45, country: 'Brazil' },
  'Buenos Aires': { x: 30, y: 52, country: 'Argentina' },
  'Lima': { x: 28, y: 42, country: 'Peru' },

  // Africa
  'Lagos': { x: 51, y: 38, country: 'Nigeria' },
  'Johannesburg': { x: 62, y: 48, country: 'South Africa' },
  'Cape Town': { x: 59, y: 52, country: 'South Africa' },
  'Nairobi': { x: 65, y: 42, country: 'Kenya' }
};

const COLOR_SCHEMES = {
  blue: ['#E0F2FE', '#BAE6FD', '#7DD3FC', '#38BDF8', '#0EA5E9', '#0284C7'],
  green: ['#DCFCE7', '#BBF7D0', '#86EFAC', '#4ADE80', '#22C55E', '#16A34A'],
  red: ['#FEE2E2', '#FECACA', '#FCA5A5', '#F87171', '#EF4444', '#DC2626'],
  purple: ['#F3E8FF', '#E9D5FF', '#C4B5FD', '#A78BFA', '#8B5CF6', '#7C3AED']
};

interface ProcessedDataPoint extends BubbleMapDataPoint {
  x: number;
  y: number;
  size: number;
  intensity: number;
}

export function BubbleMap({
  title,
  data,
  className = "",
  height = 400,
  formatValue = (value) => value.toLocaleString(),
  showLegend = true,
  colorScheme = 'blue'
}: BubbleMapProps) {
  const { processedData, maxValue, minValue } = useMemo(() => {
    if (!data || data.length === 0) {
      return { processedData: [] as ProcessedDataPoint[], maxValue: 0, minValue: 0 };
    }

    const values = data.map(item => item.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min;

    const processed = data
      .map(item => {
        const coordinates = REGION_COORDINATES[item.region];
        if (!coordinates) {
          console.warn(`No coordinates found for region: ${item.region}`);
          return null;
        }

        // Scale bubble size between 2 and 8
        const size = range > 0 ? 2 + (6 * (item.value - min) / range) : 4;

        return {
          ...item,
          x: coordinates.x,
          y: coordinates.y,
          size: Math.max(size, 2),
          intensity: range > 0 ? (item.value - min) / range : 0.5
        };
      })
      .filter((item): item is ProcessedDataPoint => item !== null);

    return {
      processedData: processed,
      maxValue: max,
      minValue: min
    };
  }, [data]);

  const getColor = (intensity: number) => {
    const colors = COLOR_SCHEMES[colorScheme];
    const index = Math.min(Math.floor(intensity * (colors.length - 1)), colors.length - 1);
    return colors[index];
  };

  if (!data || data.length === 0) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center h-48 text-gray-400">
          No regional data available
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>

      <div className="relative bg-gray-900 rounded-lg p-4" style={{ height: `${height}px` }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 60"
          className="absolute inset-0"
        >
          {/* World Map Background */}
          <rect width="100" height="60" fill="#374151" opacity={0.3} />

          {/* Simplified continent shapes */}
          <path d="M5,15 L25,12 L30,18 L28,28 L20,32 L8,28 Z" fill="#4B5563" opacity={0.6} />
          <path d="M22,32 L30,30 L32,38 L28,45 L24,42 Z" fill="#4B5563" opacity={0.6} />
          <path d="M45,12 L58,10 L62,16 L55,20 L45,18 Z" fill="#4B5563" opacity={0.6} />
          <path d="M48,20 L65,18 L68,28 L62,38 L55,35 L45,30 Z" fill="#4B5563" opacity={0.6} />
          <path d="M65,10 L88,12 L92,22 L85,28 L70,25 Z" fill="#4B5563" opacity={0.6} />
          <ellipse cx="87" cy="50" rx="8" ry="6" fill="#4B5563" opacity={0.6} />

          {/* Data Bubbles */}
          {processedData.map((item, index) => (
            <g key={index}>
              <circle
                cx={item.x}
                cy={item.y}
                r={item.size}
                fill={getColor(item.intensity)}
                stroke="white"
                strokeWidth="0.3"
                opacity={0.9}
                className="cursor-pointer hover:opacity-100 transition-all duration-200 hover:stroke-yellow-400"
              >
                <title>
                  {`${item.region}, ${item.country}\n${formatValue(item.value)}`}
                </title>
              </circle>

              {item.size > 3 && (
                <text
                  x={item.x}
                  y={item.y + item.size + 1.5}
                  textAnchor="middle"
                  className="fill-gray-300 text-xs pointer-events-none select-none"
                  fontSize="1.2"
                >
                  {item.region.length > 8 ? item.region.substring(0, 8) + '...' : item.region}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {showLegend && processedData.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-gray-400">Bubble Size:</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <span className="text-gray-500">Small</span>
              <div className="w-4 h-4 rounded-full bg-blue-400"></div>
              <span className="text-gray-500">Large</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-400">Intensity:</span>
            <div className="flex space-x-1">
              {COLOR_SCHEMES[colorScheme].slice(1, 5).map((color, index) => (
                <div
                  key={index}
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: color }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-lg font-bold text-white">{processedData.length}</div>
          <div className="text-xs text-gray-400">Mapped Regions</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-lg font-bold text-green-400">{formatValue(maxValue)}</div>
          <div className="text-xs text-gray-400">Highest Value</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-lg font-bold text-blue-400">
            {formatValue(processedData.reduce((sum, item) => sum + item.value, 0))}
          </div>
          <div className="text-xs text-gray-400">Total Value</div>
        </div>
      </div>
    </div>
  );
}