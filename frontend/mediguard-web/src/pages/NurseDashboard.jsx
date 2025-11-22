import React from 'react';
import { TopDiseasesChart } from '../components/TopDiseasesChart';
import { DiseaseRadarChart } from '../components/DiseaseRadarChart';
import { DiseaseTemporalChart } from '../components/DiseaseTemporalChart';
import GlassmorphismHeader from '../components/GlassmorphismHeader';

const NurseDashboard = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 overflow-x-hidden">
            {/* Animated Pill Header */}
            <GlassmorphismHeader />

            {/* Main Content with top padding for fixed header */}
            <div className="max-w-[1600px] mx-auto px-8 py-8 pt-24">
                <div className="space-y-16">
                    {/* Top Row: Pie and Radar Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        <div>
                            <TopDiseasesChart />
                        </div>
                        <div>
                            <DiseaseRadarChart />
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200"></div>

                    {/* Temporal Chart - Full Width */}
                    <div>
                        <DiseaseTemporalChart />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NurseDashboard;
