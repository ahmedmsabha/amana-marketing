"use client";
import { useState, useEffect, useMemo } from 'react';
import { fetchMarketingData } from '../../src/lib/api';
import { MarketingData, Campaign, DevicePerformance } from '../../src/types/marketing';
import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import { CardMetric } from '../../src/components/ui/card-metric';
import { BarChart } from '../../src/components/ui/bar-chart';
import { Table } from '../../src/components/ui/table';
import { Monitor, Smartphone, Tablet, TrendingUp, DollarSign, MousePointer } from 'lucide-react';

interface DeviceAggregation {
  device: string;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  totalSpend: number;
  totalRevenue: number;
  averageCTR: number;
  averageConversionRate: number;
  averageROAS: number;
  trafficPercentage: number;
}

export default function DeviceView() {
  const [marketingData, setMarketingData] = useState<MarketingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchMarketingData();
        setMarketingData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error loading marketing data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Process device data
  const deviceData = useMemo(() => {
    if (!marketingData?.campaigns) return null;

    const deviceMap: { [key: string]: DeviceAggregation } = {};

    marketingData.campaigns.forEach((campaign: Campaign) => {
      campaign.device_performance.forEach((device: DevicePerformance) => {
        if (!deviceMap[device.device]) {
          deviceMap[device.device] = {
            device: device.device,
            totalImpressions: 0,
            totalClicks: 0,
            totalConversions: 0,
            totalSpend: 0,
            totalRevenue: 0,
            averageCTR: 0,
            averageConversionRate: 0,
            averageROAS: 0,
            trafficPercentage: 0
          };
        }

        // Calculate proportional spend and revenue based on traffic percentage
        const proportionalSpend = campaign.spend * (device.percentage_of_traffic / 100);
        const proportionalRevenue = campaign.revenue * (device.percentage_of_traffic / 100);

        deviceMap[device.device].totalImpressions += device.impressions;
        deviceMap[device.device].totalClicks += device.clicks;
        deviceMap[device.device].totalConversions += device.conversions;
        deviceMap[device.device].totalSpend += proportionalSpend;
        deviceMap[device.device].totalRevenue += proportionalRevenue;
        deviceMap[device.device].trafficPercentage += device.percentage_of_traffic;
      });
    });

    // Calculate averages for each device
    Object.values(deviceMap).forEach(device => {
      device.averageCTR = device.totalImpressions > 0 ? (device.totalClicks / device.totalImpressions) * 100 : 0;
      device.averageConversionRate = device.totalClicks > 0 ? (device.totalConversions / device.totalClicks) * 100 : 0;
      device.averageROAS = device.totalSpend > 0 ? device.totalRevenue / device.totalSpend : 0;
    });

    const devices = Object.values(deviceMap);

    // Prepare chart data
    const clicksData = devices.map(device => ({
      label: device.device,
      value: device.totalClicks,
      color: device.device === 'Mobile' ? '#10B981' : 
             device.device === 'Desktop' ? '#3B82F6' : 
             device.device === 'Tablet' ? '#F59E0B' : '#8B5CF6'
    }));

    const revenueData = devices.map(device => ({
      label: device.device,
      value: device.totalRevenue,
      color: device.device === 'Mobile' ? '#10B981' : 
             device.device === 'Desktop' ? '#3B82F6' : 
             device.device === 'Tablet' ? '#F59E0B' : '#8B5CF6'
    }));

    return {
      devices: devices.sort((a, b) => b.totalRevenue - a.totalRevenue),
      clicksData,
      revenueData,
      totalDevices: devices.length,
      totalSpend: devices.reduce((sum, d) => sum + d.totalSpend, 0),
      totalRevenue: devices.reduce((sum, d) => sum + d.totalRevenue, 0),
      totalClicks: devices.reduce((sum, d) => sum + d.totalClicks, 0)
    };
  }, [marketingData]);

  const getDeviceIcon = (deviceName: string) => {
    const device = deviceName.toLowerCase();
    if (device.includes('mobile') || device.includes('phone')) {
      return <Smartphone className="h-5 w-5" />;
    } else if (device.includes('tablet')) {
      return <Tablet className="h-5 w-5" />;
    } else {
      return <Monitor className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-900">
      <Navbar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-hidden">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-8 sm:py-12">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {error ? (
                <div className="bg-red-900 border border-red-700 text-red-200 px-3 sm:px-4 py-3 rounded mb-4 max-w-2xl mx-auto text-sm sm:text-base">
                  Error loading data: {error}
                </div>
              ) : (
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
                  Device Performance Analytics
                </h1>
              )}
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto w-full max-w-full">
          {marketingData && deviceData && (
            <>
              {/* Device Summary Cards */}
              <div className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
                  Device Performance Overview
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <CardMetric
                    title="Active Device Types"
                    value={deviceData.totalDevices}
                    icon={<Monitor className="h-5 w-5" />}
                  />
                  
                  <CardMetric
                    title="Total Device Clicks"
                    value={deviceData.totalClicks.toLocaleString()}
                    icon={<MousePointer className="h-5 w-5" />}
                  />
                  
                  <CardMetric
                    title="Total Device Spend"
                    value={`$${deviceData.totalSpend.toLocaleString()}`}
                    icon={<DollarSign className="h-5 w-5" />}
                  />
                  
                  <CardMetric
                    title="Total Device Revenue"
                    value={`$${deviceData.totalRevenue.toLocaleString()}`}
                    icon={<TrendingUp className="h-5 w-5" />}
                  />
                </div>
              </div>

              {/* Device Performance Charts */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <BarChart
                  title="Total Clicks by Device"
                  data={deviceData.clicksData}
                  formatValue={(value) => value.toLocaleString()}
                />

                <BarChart
                  title="Total Revenue by Device"
                  data={deviceData.revenueData}
                  formatValue={(value) => `$${value.toLocaleString()}`}
                />
              </div>

              {/* Device Performance Table */}
              <div className="overflow-x-auto w-full max-w-full">
                <Table
                  title="Detailed Device Performance"
                  showIndex={true}
                  maxHeight="500px"
                  columns={[
                    {
                      key: 'device',
                      header: 'Device Type',
                      width: '15%',
                      sortable: true,
                      sortType: 'string',
                      render: (value) => (
                        <div className="flex items-center space-x-2">
                          {getDeviceIcon(value)}
                          <span className="font-medium text-blue-400">{value}</span>
                        </div>
                      )
                    },
                    {
                      key: 'totalImpressions',
                      header: 'Impressions',
                      width: '12%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => value.toLocaleString()
                    },
                    {
                      key: 'totalClicks',
                      header: 'Clicks',
                      width: '10%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => value.toLocaleString()
                    },
                    {
                      key: 'totalConversions',
                      header: 'Conversions',
                      width: '10%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => value.toLocaleString()
                    },
                    {
                      key: 'averageCTR',
                      header: 'CTR',
                      width: '8%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => (
                        <span className="text-yellow-400 font-medium">
                          {value.toFixed(2)}%
                        </span>
                      )
                    },
                    {
                      key: 'averageConversionRate',
                      header: 'Conv. Rate',
                      width: '10%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => (
                        <span className="text-green-400 font-medium">
                          {value.toFixed(2)}%
                        </span>
                      )
                    },
                    {
                      key: 'totalSpend',
                      header: 'Spend',
                      width: '12%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => `$${value.toLocaleString()}`
                    },
                    {
                      key: 'totalRevenue',
                      header: 'Revenue',
                      width: '12%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => (
                        <span className="text-green-400 font-medium">
                          ${value.toLocaleString()}
                        </span>
                      )
                    },
                    {
                      key: 'averageROAS',
                      header: 'ROAS',
                      width: '9%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => (
                        <span className="text-blue-400 font-medium">
                          {value.toFixed(1)}x
                        </span>
                      )
                    },
                    {
                      key: 'trafficPercentage',
                      header: 'Traffic %',
                      width: '10%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => (
                        <span className="text-purple-400 font-medium">
                          {value.toFixed(1)}%
                        </span>
                      )
                    }
                  ]}
                  defaultSort={{ key: 'totalRevenue', direction: 'desc' }}
                  data={deviceData.devices}
                  emptyMessage="No device data available"
                />
              </div>
            </>
          )}
        </div>
        
        <Footer />
      </div>
    </div>
  );
}