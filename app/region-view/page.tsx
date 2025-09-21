"use client";
import { useState, useEffect, useMemo } from 'react';
import { fetchMarketingData } from '../../src/lib/api';
import { MarketingData, Campaign, RegionalPerformance } from '../../src/types/marketing';
import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import { CardMetric } from '../../src/components/ui/card-metric';
import { LineChart } from '../../src/components/ui/line-chart';
import { BubbleMap } from '../../src/components/ui/bubble-map';
import { Table } from '../../src/components/ui/table';
import { MapPin, DollarSign, TrendingUp, Globe, BarChart3 } from 'lucide-react';

interface RegionalAggregation {
  region: string;
  country: string;
  totalSpend: number;
  totalRevenue: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  averageCTR: number;
  averageConversionRate: number;
  averageROAS: number;
}

interface WeeklyRegionalData {
  week: string;
  totalSpend: number;
  totalRevenue: number;
}

export default function RegionView() {
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

  // Process regional data
  const regionalData = useMemo(() => {
    if (!marketingData?.campaigns) return null;

    const regionMap: { [key: string]: RegionalAggregation } = {};
    const weeklyData: { [key: string]: { spend: number; revenue: number } } = {};

    marketingData.campaigns.forEach((campaign: Campaign) => {
      // Process regional performance
      campaign.regional_performance.forEach((regional: RegionalPerformance) => {
        const key = regional.region; // Use just region as key to avoid duplicates

        if (!regionMap[key]) {
          regionMap[key] = {
            region: regional.region,
            country: regional.country,
            totalSpend: 0,
            totalRevenue: 0,
            totalImpressions: 0,
            totalClicks: 0,
            totalConversions: 0,
            averageCTR: 0,
            averageConversionRate: 0,
            averageROAS: 0
          };
        }

        regionMap[key].totalSpend += regional.spend;
        regionMap[key].totalRevenue += regional.revenue;
        regionMap[key].totalImpressions += regional.impressions;
        regionMap[key].totalClicks += regional.clicks;
        regionMap[key].totalConversions += regional.conversions;
      });

      // Process weekly data
      campaign.weekly_performance.forEach((week) => {
        if (!weeklyData[week.week_start]) {
          weeklyData[week.week_start] = { spend: 0, revenue: 0 };
        }
        weeklyData[week.week_start].spend += week.spend;
        weeklyData[week.week_start].revenue += week.revenue;
      });
    });

    // Calculate averages for regions
    Object.values(regionMap).forEach(region => {
      region.averageCTR = region.totalImpressions > 0 ? (region.totalClicks / region.totalImpressions) * 100 : 0;
      region.averageConversionRate = region.totalClicks > 0 ? (region.totalConversions / region.totalClicks) * 100 : 0;
      region.averageROAS = region.totalSpend > 0 ? region.totalRevenue / region.totalSpend : 0;
    });

    // Prepare weekly line chart data (last 12 weeks for better trend visibility)
    const sortedWeeks = Object.entries(weeklyData)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-12); // Show last 12 weeks

    const weeklySpendData = sortedWeeks.map(([week, data]) => ({
      label: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: data.spend,
      date: week
    }));

    const weeklyRevenueData = sortedWeeks.map(([week, data]) => ({
      label: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: data.revenue,
      date: week
    }));

    // Prepare bubble map data with better regional grouping
    const bubbleMapData = Object.values(regionMap)
      .filter(region => region.totalRevenue > 0) // Only show regions with revenue
      .map(region => ({
        region: region.region,
        country: region.country,
        value: region.totalRevenue,
        revenue: region.totalRevenue,
        spend: region.totalSpend
      }));

    const regions = Object.values(regionMap).sort((a, b) => b.totalRevenue - a.totalRevenue);

    return {
      regions,
      weeklySpendData,
      weeklyRevenueData,
      bubbleMapData,
      totalRegions: regions.length,
      totalSpend: regions.reduce((sum, r) => sum + r.totalSpend, 0),
      totalRevenue: regions.reduce((sum, r) => sum + r.totalRevenue, 0),
      averageROAS: regions.length > 0 ? regions.reduce((sum, r) => sum + r.averageROAS, 0) / regions.length : 0,
      topPerformingRegion: regions[0],
      totalImpressions: regions.reduce((sum, r) => sum + r.totalImpressions, 0),
      totalClicks: regions.reduce((sum, r) => sum + r.totalClicks, 0)
    };
  }, [marketingData]);

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
                  Regional Analytics
                </h1>
              )}
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto w-full max-w-full">
          {marketingData && regionalData && (
            <>
              {/* Regional Summary Cards */}
              <div className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
                  Regional Performance Overview
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
                  <CardMetric
                    title="Active Regions"
                    value={regionalData.totalRegions}
                    icon={<Globe className="h-5 w-5" />}
                  />

                  <CardMetric
                    title="Total Impressions"
                    value={regionalData.totalImpressions.toLocaleString()}
                    icon={<TrendingUp className="h-5 w-5" />}
                  />

                  <CardMetric
                    title="Total Clicks"
                    value={regionalData.totalClicks.toLocaleString()}
                    icon={<MapPin className="h-5 w-5" />}
                  />

                  <CardMetric
                    title="Total Spend"
                    value={`$${regionalData.totalSpend.toLocaleString()}`}
                    icon={<DollarSign className="h-5 w-5" />}
                  />

                  <CardMetric
                    title="Total Revenue"
                    value={`$${regionalData.totalRevenue.toLocaleString()}`}
                    icon={<TrendingUp className="h-5 w-5" />}
                  />

                  <CardMetric
                    title="Average ROAS"
                    value={`${regionalData.averageROAS.toFixed(1)}x`}
                    icon={<BarChart3 className="h-5 w-5" />}
                  />
                </div>
              </div>

              {/* Top Performing Region Highlight */}
              {regionalData.topPerformingRegion && (
                <div className="mb-6 sm:mb-8">
                  <div className="bg-gradient-to-r from-green-900 to-green-800 rounded-lg p-4 border border-green-700">
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                      Top Performing Region
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-xl font-bold text-green-400">
                          {regionalData.topPerformingRegion.region}
                        </div>
                        <div className="text-sm text-green-300">{regionalData.topPerformingRegion.country}</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-white">
                          ${regionalData.topPerformingRegion.totalRevenue.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-300">Revenue</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-white">
                          {regionalData.topPerformingRegion.averageROAS.toFixed(1)}x
                        </div>
                        <div className="text-xs text-gray-300">ROAS</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-white">
                          {regionalData.topPerformingRegion.averageCTR.toFixed(2)}%
                        </div>
                        <div className="text-xs text-gray-300">CTR</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Regional Bubble Map - Now with better positioning */}
              <div className="mb-6 sm:mb-8">
                <BubbleMap
                  title="Regional Performance World Map"
                  data={regionalData.bubbleMapData}
                  height={500}
                  formatValue={(value) => `$${value.toLocaleString()}`}
                  colorScheme="green"
                  showLegend={true}
                />
              </div>

              {/* Weekly Performance Line Charts */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <LineChart
                  title="Weekly Regional Spend Trend (Last 12 Weeks)"
                  data={regionalData.weeklySpendData}
                  color="#F59E0B"
                  formatValue={(value) => `$${value.toLocaleString()}`}
                  height={300}
                />

                <LineChart
                  title="Weekly Regional Revenue Trend (Last 12 Weeks)"
                  data={regionalData.weeklyRevenueData}
                  color="#10B981"
                  formatValue={(value) => `$${value.toLocaleString()}`}
                  height={300}
                />
              </div>

              {/* Regional Performance Table */}
              <div className="overflow-x-auto w-full max-w-full">
                <Table
                  title="Detailed Regional Performance"
                  showIndex={true}
                  maxHeight="500px"
                  columns={[
                    {
                      key: 'region',
                      header: 'Region',
                      width: '15%',
                      sortable: true,
                      sortType: 'string',
                      render: (value) => (
                        <span className="font-medium text-blue-400">{value}</span>
                      )
                    },
                    {
                      key: 'country',
                      header: 'Country',
                      width: '12%',
                      sortable: true,
                      sortType: 'string',
                      render: (value) => (
                        <span className="text-gray-300">{value}</span>
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
                    }
                  ]}
                  defaultSort={{ key: 'totalRevenue', direction: 'desc' }}
                  data={regionalData.regions}
                  emptyMessage="No regional data available"
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
