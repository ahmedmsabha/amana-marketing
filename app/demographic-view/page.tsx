"use client";
import { useState, useEffect, useMemo } from 'react';
import { fetchMarketingData } from '../../src/lib/api';
import { MarketingData, Campaign, DemographicBreakdown } from '../../src/types/marketing';
import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import { CardMetric } from '../../src/components/ui/card-metric';
import { BarChart } from '../../src/components/ui/bar-chart';
import { Table } from '../../src/components/ui/table';
import { Users, UserCheck, TrendingUp, Target, DollarSign, MousePointer } from 'lucide-react';

interface DemographicAggregation {
  totalClicks: number;
  totalSpend: number;
  totalRevenue: number;
  totalImpressions: number;
  totalConversions: number;
}

interface AgeGroupData {
  ageGroup: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  ctr: number;
  conversionRate: number;
}

export default function DemographicView() {
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

  // Calculate demographic aggregations
  const demographicData = useMemo(() => {
    if (!marketingData?.campaigns) return null;

    const maleData: DemographicAggregation = {
      totalClicks: 0,
      totalSpend: 0,
      totalRevenue: 0,
      totalImpressions: 0,
      totalConversions: 0
    };

    const femaleData: DemographicAggregation = {
      totalClicks: 0,
      totalSpend: 0,
      totalRevenue: 0,
      totalImpressions: 0,
      totalConversions: 0
    };

    const ageGroupSpend: { [key: string]: number } = {};
    const ageGroupRevenue: { [key: string]: number } = {};
    const maleAgeGroups: { [key: string]: AgeGroupData } = {};
    const femaleAgeGroups: { [key: string]: AgeGroupData } = {};

    marketingData.campaigns.forEach((campaign: Campaign) => {
      campaign.demographic_breakdown.forEach((demo: DemographicBreakdown) => {
        const genderKey = demo.gender.toLowerCase();

        if (genderKey === 'male') {
          maleData.totalClicks += demo.performance.clicks;
          maleData.totalImpressions += demo.performance.impressions;
          maleData.totalConversions += demo.performance.conversions;

          // Calculate proportional spend and revenue based on audience percentage
          const proportionalSpend = campaign.spend * (demo.percentage_of_audience / 100);
          const proportionalRevenue = campaign.revenue * (demo.percentage_of_audience / 100);

          maleData.totalSpend += proportionalSpend;
          maleData.totalRevenue += proportionalRevenue;

          // Age group data for males
          if (!maleAgeGroups[demo.age_group]) {
            maleAgeGroups[demo.age_group] = {
              ageGroup: demo.age_group,
              impressions: 0,
              clicks: 0,
              conversions: 0,
              spend: 0,
              revenue: 0,
              ctr: 0,
              conversionRate: 0
            };
          }
          maleAgeGroups[demo.age_group].impressions += demo.performance.impressions;
          maleAgeGroups[demo.age_group].clicks += demo.performance.clicks;
          maleAgeGroups[demo.age_group].conversions += demo.performance.conversions;
          maleAgeGroups[demo.age_group].spend += proportionalSpend;
          maleAgeGroups[demo.age_group].revenue += proportionalRevenue;
        }

        if (genderKey === 'female') {
          femaleData.totalClicks += demo.performance.clicks;
          femaleData.totalImpressions += demo.performance.impressions;
          femaleData.totalConversions += demo.performance.conversions;

          // Calculate proportional spend and revenue based on audience percentage
          const proportionalSpend = campaign.spend * (demo.percentage_of_audience / 100);
          const proportionalRevenue = campaign.revenue * (demo.percentage_of_audience / 100);

          femaleData.totalSpend += proportionalSpend;
          femaleData.totalRevenue += proportionalRevenue;

          // Age group data for females
          if (!femaleAgeGroups[demo.age_group]) {
            femaleAgeGroups[demo.age_group] = {
              ageGroup: demo.age_group,
              impressions: 0,
              clicks: 0,
              conversions: 0,
              spend: 0,
              revenue: 0,
              ctr: 0,
              conversionRate: 0
            };
          }
          femaleAgeGroups[demo.age_group].impressions += demo.performance.impressions;
          femaleAgeGroups[demo.age_group].clicks += demo.performance.clicks;
          femaleAgeGroups[demo.age_group].conversions += demo.performance.conversions;
          femaleAgeGroups[demo.age_group].spend += proportionalSpend;
          femaleAgeGroups[demo.age_group].revenue += proportionalRevenue;
        }

        // Age group totals
        if (!ageGroupSpend[demo.age_group]) {
          ageGroupSpend[demo.age_group] = 0;
          ageGroupRevenue[demo.age_group] = 0;
        }
        const proportionalSpend = campaign.spend * (demo.percentage_of_audience / 100);
        const proportionalRevenue = campaign.revenue * (demo.percentage_of_audience / 100);
        ageGroupSpend[demo.age_group] += proportionalSpend;
        ageGroupRevenue[demo.age_group] += proportionalRevenue;
      });
    });

    // Calculate CTR and conversion rates for age groups
    Object.values(maleAgeGroups).forEach(group => {
      group.ctr = group.impressions > 0 ? (group.clicks / group.impressions) * 100 : 0;
      group.conversionRate = group.clicks > 0 ? (group.conversions / group.clicks) * 100 : 0;
    });

    Object.values(femaleAgeGroups).forEach(group => {
      group.ctr = group.impressions > 0 ? (group.clicks / group.impressions) * 100 : 0;
      group.conversionRate = group.clicks > 0 ? (group.conversions / group.clicks) * 100 : 0;
    });

    return {
      male: maleData,
      female: femaleData,
      ageGroupSpend: Object.entries(ageGroupSpend).map(([age, spend]) => ({
        label: age,
        value: spend
      })),
      ageGroupRevenue: Object.entries(ageGroupRevenue).map(([age, revenue]) => ({
        label: age,
        value: revenue
      })),
      maleAgeGroups: Object.values(maleAgeGroups),
      femaleAgeGroups: Object.values(femaleAgeGroups)
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
                  Demographic Analytics
                </h1>
              )}
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto w-full max-w-full">
          {marketingData && demographicData && (
            <>
              {/* Gender-based Metrics */}
              <div className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
                  Performance by Gender
                </h2>

                {/* Male Metrics */}
                <div className="mb-6">
                  <h3 className="text-base sm:text-lg font-medium text-blue-400 mb-3">
                    Male Demographics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                    <CardMetric
                      title="Total Clicks by Males"
                      value={demographicData.male.totalClicks.toLocaleString()}
                      icon={<MousePointer className="h-5 w-5" />}
                    />

                    <CardMetric
                      title="Total Spend by Males"
                      value={`$${demographicData.male.totalSpend.toLocaleString()}`}
                      icon={<DollarSign className="h-5 w-5" />}
                    />

                    <CardMetric
                      title="Total Revenue by Males"
                      value={`$${demographicData.male.totalRevenue.toLocaleString()}`}
                      icon={<TrendingUp className="h-5 w-5" />}
                    />
                  </div>
                </div>

                {/* Female Metrics */}
                <div className="mb-6">
                  <h3 className="text-base sm:text-lg font-medium text-pink-400 mb-3">
                    Female Demographics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                    <CardMetric
                      title="Total Clicks by Females"
                      value={demographicData.female.totalClicks.toLocaleString()}
                      icon={<MousePointer className="h-5 w-5" />}
                    />

                    <CardMetric
                      title="Total Spend by Females"
                      value={`$${demographicData.female.totalSpend.toLocaleString()}`}
                      icon={<DollarSign className="h-5 w-5" />}
                    />

                    <CardMetric
                      title="Total Revenue by Females"
                      value={`$${demographicData.female.totalRevenue.toLocaleString()}`}
                      icon={<TrendingUp className="h-5 w-5" />}
                    />
                  </div>
                </div>
              </div>

              {/* Age Group Charts */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <BarChart
                  title="Total Spend by Age Group"
                  data={demographicData.ageGroupSpend.map(item => ({
                    ...item,
                    color: '#3B82F6'
                  }))}
                  formatValue={(value) => `$${value.toLocaleString()}`}
                />

                <BarChart
                  title="Total Revenue by Age Group"
                  data={demographicData.ageGroupRevenue.map(item => ({
                    ...item,
                    color: '#10B981'
                  }))}
                  formatValue={(value) => `$${value.toLocaleString()}`}
                />
              </div>

              {/* Demographic Performance Tables */}
              <div className="space-y-6 sm:space-y-8">
                {/* Male Age Groups Table */}
                <div className="overflow-x-auto w-full max-w-full">
                  <Table
                    title="Campaign Performance by Male Age Groups"
                    showIndex={true}
                    maxHeight="400px"
                    columns={[
                      {
                        key: 'ageGroup',
                        header: 'Age Group',
                        width: '15%',
                        sortable: true,
                        sortType: 'string',
                        render: (value) => (
                          <span className="font-medium text-blue-400">{value}</span>
                        )
                      },
                      {
                        key: 'impressions',
                        header: 'Impressions',
                        width: '15%',
                        align: 'right',
                        sortable: true,
                        sortType: 'number',
                        render: (value) => value.toLocaleString()
                      },
                      {
                        key: 'clicks',
                        header: 'Clicks',
                        width: '12%',
                        align: 'right',
                        sortable: true,
                        sortType: 'number',
                        render: (value) => value.toLocaleString()
                      },
                      {
                        key: 'conversions',
                        header: 'Conversions',
                        width: '12%',
                        align: 'right',
                        sortable: true,
                        sortType: 'number',
                        render: (value) => value.toLocaleString()
                      },
                      {
                        key: 'ctr',
                        header: 'CTR',
                        width: '10%',
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
                        key: 'conversionRate',
                        header: 'Conv. Rate',
                        width: '12%',
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
                        key: 'spend',
                        header: 'Spend',
                        width: '12%',
                        align: 'right',
                        sortable: true,
                        sortType: 'number',
                        render: (value) => `$${value.toLocaleString()}`
                      },
                      {
                        key: 'revenue',
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
                      }
                    ]}
                    defaultSort={{ key: 'revenue', direction: 'desc' }}
                    data={demographicData.maleAgeGroups}
                    emptyMessage="No male demographic data available"
                  />
                </div>

                {/* Female Age Groups Table */}
                <div className="overflow-x-auto w-full max-w-full">
                  <Table
                    title="Campaign Performance by Female Age Groups"
                    showIndex={true}
                    maxHeight="400px"
                    columns={[
                      {
                        key: 'ageGroup',
                        header: 'Age Group',
                        width: '15%',
                        sortable: true,
                        sortType: 'string',
                        render: (value) => (
                          <span className="font-medium text-pink-400">{value}</span>
                        )
                      },
                      {
                        key: 'impressions',
                        header: 'Impressions',
                        width: '15%',
                        align: 'right',
                        sortable: true,
                        sortType: 'number',
                        render: (value) => value.toLocaleString()
                      },
                      {
                        key: 'clicks',
                        header: 'Clicks',
                        width: '12%',
                        align: 'right',
                        sortable: true,
                        sortType: 'number',
                        render: (value) => value.toLocaleString()
                      },
                      {
                        key: 'conversions',
                        header: 'Conversions',
                        width: '12%',
                        align: 'right',
                        sortable: true,
                        sortType: 'number',
                        render: (value) => value.toLocaleString()
                      },
                      {
                        key: 'ctr',
                        header: 'CTR',
                        width: '10%',
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
                        key: 'conversionRate',
                        header: 'Conv. Rate',
                        width: '12%',
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
                        key: 'spend',
                        header: 'Spend',
                        width: '12%',
                        align: 'right',
                        sortable: true,
                        sortType: 'number',
                        render: (value) => `$${value.toLocaleString()}`
                      },
                      {
                        key: 'revenue',
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
                      }
                    ]}
                    defaultSort={{ key: 'revenue', direction: 'desc' }}
                    data={demographicData.femaleAgeGroups}
                    emptyMessage="No female demographic data available"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}
