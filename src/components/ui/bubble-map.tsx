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

// World map coordinates for regions and cities (SVG coordinate system 0-100 x, 0-60 y)
const REGION_COORDINATES: { [key: string]: { x: number; y: number; country: string } } = {
  // North America
  'New York': { x: 25, y: 18, country: 'USA' },
  'Los Angeles': { x: 18, y: 22, country: 'USA' },
  'Chicago': { x: 23, y: 20, country: 'USA' },
  'Miami': { x: 27, y: 28, country: 'USA' },
  'Seattle': { x: 16, y: 15, country: 'USA' },
  'Toronto': { x: 26, y: 17, country: 'Canada' },
  'Vancouver': { x: 15, y: 14, country: 'Canada' },
  'Mexico City': { x: 21, y: 32, country: 'Mexico' },
  'Guadalajara': { x: 19, y: 30, country: 'Mexico' },
  
  // Europe
  'London': { x: 48, y: 16, country: 'UK' },
  'Paris': { x: 50, y: 18, country: 'France' },
  'Berlin': { x: 52, y: 15, country: 'Germany' },
  'Madrid': { x: 47, y: 22, country: 'Spain' },
  'Rome': { x: 52, y: 24, country: 'Italy' },
  'Amsterdam': { x: 50, y: 15, country: 'Netherlands' },
  'Zurich': { x: 51, y: 18, country: 'Switzerland' },
  'Vienna': { x: 54, y: 18, country: 'Austria' },
  'Barcelona': { x: 49, y: 23, country: 'Spain' },
  'Milan': { x: 51, y: 22, country: 'Italy' },
  'Stockholm': { x: 56, y: 10, country: 'Sweden' },
  'Copenhagen': { x: 52, y: 12, country: 'Denmark' },
  'Oslo': { x: 51, y: 9, country: 'Norway' },
  'Prague': { x: 53, y: 16, country: 'Czech Republic' },
  'Warsaw': { x: 58, y: 15, country: 'Poland' },
  'Budapest': { x: 55, y: 18, country: 'Hungary' },
  'Athens': { x: 60, y: 26, country: 'Greece' },
  'Istanbul': { x: 63, y: 24, country: 'Turkey' },
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
  'Tel Aviv': { x: 62, y: 23, country: 'Israel' },
  'Beirut': { x: 63, y: 22, country: 'Lebanon' },
  'Amman': { x: 64, y: 23, country: 'Jordan' },
  'Baghdad': { x: 68, y: 22, country: 'Iraq' },
  'Tehran': { x: 72, y: 20, country: 'Iran' },
  'Ankara': { x: 61, y: 21, country: 'Turkey' },
  'Casablanca': { x: 43, y: 23, country: 'Morocco' },
  'Tunis': { x: 51, y: 25, country: 'Tunisia' },
  
  // Asia-Pacific
  'Tokyo': { x: 88, y: 20, country: 'Japan' },
  'Osaka': { x: 87, y: 21, country: 'Japan' },
  'Seoul': { x: 84, y: 18, country: 'South Korea' },
  'Busan': { x: 85, y: 20, country: 'South Korea' },
  'Beijing': { x: 80, y: 17, country: 'China' },
  'Shanghai': { x: 81, y: 21, country: 'China' },
  'Guangzhou': { x: 78, y: 26, country: 'China' },
  'Shenzhen': { x: 79, y: 27, country: 'China' },
  'Hong Kong': { x: 79, y: 27, country: 'Hong Kong' },
  'Taipei': { x: 81, y: 28, country: 'Taiwan' },
  'Mumbai': { x: 74, y: 32, country: 'India' },
  'Delhi': { x: 75, y: 26, country: 'India' },
  'Bangalore': { x: 75, y: 35, country: 'India' },
  'Chennai': { x: 77, y: 36, country: 'India' },
  'Kolkata': { x: 78, y: 30, country: 'India' },
  'Hyderabad': { x: 76, y: 34, country: 'India' },
  'Singapore': { x: 79, y: 42, country: 'Singapore' },
  'Bangkok': { x: 77, y: 38, country: 'Thailand' },
  'Manila': { x: 81, y: 38, country: 'Philippines' },
  'Jakarta': { x: 78, y: 43, country: 'Indonesia' },
  'Kuala Lumpur': { x: 78, y: 41, country: 'Malaysia' },
  'Ho Chi Minh City': { x: 78, y: 39, country: 'Vietnam' },
  'Hanoi': { x: 77, y: 35, country: 'Vietnam' },
  'Sydney': { x: 89, y: 52, country: 'Australia' },
  'Melbourne': { x: 87, y: 54, country: 'Australia' },
  'Brisbane': { x: 91, y: 49, country: 'Australia' },
  'Perth': { x: 80, y: 52, country: 'Australia' },
  'Auckland': { x: 96, y: 55, country: 'New Zealand' },
  
  // South America
  'São Paulo': { x: 33, y: 47, country: 'Brazil' },
  'Rio de Janeiro': { x: 35, y: 46, country: 'Brazil' },
  'Brasília': { x: 34, y: 42, country: 'Brazil' },
  'Buenos Aires': { x: 31, y: 52, country: 'Argentina' },
  'Santiago': { x: 28, y: 52, country: 'Chile' },
  'Lima': { x: 25, y: 45, country: 'Peru' },
  'Bogotá': { x: 29, y: 40, country: 'Colombia' },
  'Caracas': { x: 32, y: 39, country: 'Venezuela' },
  'Montevideo': { x: 32, y: 52, country: 'Uruguay' },
  
  // Africa
  'Lagos': { x: 50, y: 42, country: 'Nigeria' },
  'Abuja': { x: 52, y: 40, country: 'Nigeria' },
  'Johannesburg': { x: 62, y: 48, country: 'South Africa' },
  'Cape Town': { x: 59, y: 52, country: 'South Africa' },
  'Nairobi': { x: 65, y: 42, country: 'Kenya' },
  'Accra': { x: 48, y: 42, country: 'Ghana' },
  'Addis Ababa': { x: 66, y: 40, country: 'Ethiopia' },
  'Khartoum': { x: 61, y: 38, country: 'Sudan' },
  'Kinshasa': { x: 54, y: 43, country: 'DRC' },
  'Dakar': { x: 42, y: 38, country: 'Senegal' },
  'Rabat': { x: 44, y: 22, country: 'Morocco' },
  'Algiers': { x: 50, y: 20, country: 'Algeria' },
  'Tripoli': { x: 54, y: 21, country: 'Libya' }
};

const COLOR_SCHEMES = {
  blue: ['#E0F2FE', '#BAE6FD', '#7DD3FC', '#38BDF8', '#0EA5E9', '#0284C7', '#0369A1'],
  green: ['#DCFCE7', '#BBF7D0', '#86EFAC', '#4ADE80', '#22C55E', '#16A34A', '#15803D'],
  red: ['#FEE2E2', '#FECACA', '#FCA5A5', '#F87171', '#EF4444', '#DC2626', '#B91C1C'],
  purple: ['#F3E8FF', '#E9D5FF', '#C4B5FD', '#A78BFA', '#8B5CF6', '#7C3AED', '#6D28D9']
};

// Convert longitude/latitude to SVG coordinates (simplified, no longer needed with direct coordinates)
function coordsToSVG(lng: number, lat: number, width: number, height: number) {
  // Simple conversion for fallback
  const x = ((lng + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return { x: Math.max(0, Math.min(width, x)), y: Math.max(0, Math.min(height, y)) };
}

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
          // Try to use latitude/longitude if provided
          if (item.latitude !== undefined && item.longitude !== undefined) {
            const svgCoords = coordsToSVG(item.longitude, item.latitude, 100, 60);
            return {
              ...item,
              x: svgCoords.x,
              y: svgCoords.y,
              size: Math.max(2, Math.min(8, ((item.value - min) / range) * 6 + 2)),
              intensity: range > 0 ? (item.value - min) / range : 0.5
            };
          }
          console.warn(`No coordinates found for region: ${item.region}`);
          return null;
        }
        
        // Use predefined coordinates directly (already in SVG coordinate system)
        return {
          ...item,
          x: coordinates.x,
          y: coordinates.y,
          size: Math.max(2, Math.min(8, ((item.value - min) / range) * 6 + 2)),
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
      
      <div className="relative bg-gray-900 rounded-lg p-4 overflow-hidden" style={{ height: `${height}px` }}>
        {/* World Map */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 60"
          className="absolute inset-0"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* World map background */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#374151" strokeWidth="0.1" opacity="0.3"/>
            </pattern>
          </defs>
          
          <rect width="100" height="60" fill="#1F2937" />
          <rect width="100" height="60" fill="url(#grid)" />
          
          {/* Simplified continent shapes with proper positioning */}
          {/* North America */}
          <path
            d="M10,10 L35,8 L40,15 L38,25 L35,35 L25,38 L15,35 L8,25 Z"
            fill="#374151"
            stroke="#4B5563"
            strokeWidth="0.2"
            opacity={0.7}
          />
          
          {/* South America */}
          <path
            d="M25,35 L35,33 L37,40 L35,50 L30,55 L25,52 L22,45 L24,38 Z"
            fill="#374151"
            stroke="#4B5563"
            strokeWidth="0.2"
            opacity={0.7}
          />
          
          {/* Europe */}
          <path
            d="M45,8 L58,6 L62,12 L60,20 L55,22 L48,20 L44,15 Z"
            fill="#374151"
            stroke="#4B5563"
            strokeWidth="0.2"
            opacity={0.7}
          />
          
          {/* Africa */}
          <path
            d="M48,20 L62,18 L65,25 L63,35 L60,45 L55,50 L50,48 L45,40 L47,30 Z"
            fill="#374151"
            stroke="#4B5563"
            strokeWidth="0.2"
            opacity={0.7}
          />
          
          {/* Asia */}
          <path
            d="M62,8 L85,6 L92,12 L90,20 L88,30 L82,35 L75,32 L68,25 L62,18 Z"
            fill="#374151"
            stroke="#4B5563"
            strokeWidth="0.2"
            opacity={0.7}
          />
          
          {/* Australia */}
          <ellipse cx="87" cy="52" rx="8" ry="4" fill="#374151" stroke="#4B5563" strokeWidth="0.2" opacity={0.7} />
          
          {/* Data Bubbles */}
          {processedData.map((item, index) => (
            <g key={`${item.region}-${index}`}>
              {/* Main bubble */}
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
              
              {/* Region label for larger bubbles - positioned better */}
              {item.size > 3 && (
                <text
                  x={item.x}
                  y={item.y + item.size + 1.5}
                  textAnchor="middle"
                  className="fill-gray-300 text-xs pointer-events-none select-none"
                  fontSize="1.2"
                  fontWeight="400"
                >
                  {item.region}
                </text>
              )}
            </g>
          ))}
        </svg>
        
        {/* Missing regions notice */}
        {data.length > processedData.length && (
          <div className="absolute top-2 right-2 bg-yellow-900 bg-opacity-80 text-yellow-200 px-2 py-1 rounded text-xs">
            {data.length - processedData.length} regions not mapped
          </div>
        )}
      </div>
      
      {/* Enhanced Legend */}
      {showLegend && processedData.length > 0 && (
        <div className="mt-6 space-y-4">
          {/* Color intensity legend */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-300">Intensity:</span>
              <div className="flex space-x-1">
                {COLOR_SCHEMES[colorScheme].map((color, index) => (
                  <div
                    key={index}
                    className="w-4 h-4 rounded-sm border border-gray-600"
                    style={{ backgroundColor: color }}
                    title={`${Math.round((index / (COLOR_SCHEMES[colorScheme].length - 1)) * 100)}%`}
                  />
                ))}
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <span>{formatValue(minValue)}</span>
                <span>→</span>
                <span>{formatValue(maxValue)}</span>
              </div>
            </div>
            
            {/* Bubble size legend */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-300">Bubble Size:</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-400 border border-gray-500"></div>
                <span className="text-xs text-gray-400">Small</span>
                <div className="w-3 h-3 rounded-full bg-gray-400 border border-gray-500"></div>
                <span className="text-xs text-gray-400">Medium</span>
                <div className="w-4 h-4 rounded-full bg-gray-400 border border-gray-500"></div>
                <span className="text-xs text-gray-400">Large</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Enhanced Summary Stats */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-white">{processedData.length}</div>
          <div className="text-xs text-gray-400">Mapped Regions</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-green-400">{formatValue(maxValue)}</div>
          <div className="text-xs text-gray-400">Highest Value</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-blue-400">
            {formatValue(processedData.reduce((sum, item) => sum + item.value, 0))}
          </div>
          <div className="text-xs text-gray-400">Total Value</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-purple-400">
            {formatValue(processedData.reduce((sum, item) => sum + item.value, 0) / processedData.length)}
          </div>
          <div className="text-xs text-gray-400">Average Value</div>
        </div>
      </div>
    </div>
  );
}