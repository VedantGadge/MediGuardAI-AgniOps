import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export const ContributingFactorsChart = ({ data }) => {
    if (!data || data.length === 0) {
        return null;
    }

    // Transform data for the chart - since values are normalized correlations, we'll use them directly
    const chartData = data.map((factor, index) => ({
        name: factor.biomarker,
        patientValue: parseFloat(factor.patientValue.toFixed(4)),
        diseaseAverage: parseFloat(factor.diseaseAverage.toFixed(4)),
        correlation: parseFloat(factor.patientValue.toFixed(4)), // Normalized correlation value
        deviation: parseFloat(factor.deviation.toFixed(2)),
        status: factor.status,
        rank: index + 1
    }));

    // Prepare data for radar chart - top 6 factors
    const radarData = chartData.slice(0, 6).map(factor => ({
        biomarker: factor.name.length > 15 ? factor.name.substring(0, 15) + '...' : factor.name,
        fullName: factor.name,
        value: factor.correlation * 100, // Scale to 0-100 for better visualization
        deviation: factor.deviation
    }));

    // Get color based on correlation strength
    const getCorrelationColor = (value) => {
        if (value >= 0.7) return '#ef4444'; // High correlation - red
        if (value >= 0.5) return '#f59e0b'; // Medium-high - orange
        if (value >= 0.3) return '#eab308'; // Medium - yellow
        return '#3b82f6'; // Low - blue
    };

    // Custom tooltip for bar chart
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-4 rounded-lg shadow-xl border-2 border-purple-200">
                    <p className="font-bold text-gray-900 mb-2 text-base">{data.name}</p>
                    <div className="space-y-1">
                        <p className="text-sm text-blue-600 font-medium">
                            Patient Correlation: <span className="font-bold">{data.patientValue}</span>
                        </p>
                        <p className="text-sm text-purple-600 font-medium">
                            Disease Avg: <span className="font-bold">{data.diseaseAverage}</span>
                        </p>
                        <div className="pt-2 mt-2 border-t border-gray-200">
                            <p className="text-sm text-gray-700">
                                Deviation: <span className="font-bold text-orange-600">{data.deviation}%</span>
                            </p>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Custom tooltip for radar chart
    const RadarTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 rounded-lg shadow-lg border border-purple-200">
                    <p className="font-semibold text-gray-900 text-sm">{data.fullName}</p>
                    <p className="text-xs text-purple-600 mt-1">
                        Correlation Strength: <span className="font-bold">{(data.value / 100).toFixed(4)}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-0">
            {/* Radar & List Section - Unified */}
            <div className="py-6">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Contribution Analysis</h3>
                    <p className="text-sm text-gray-500">Correlation strength and risk factors</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Radar */}
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="#e5e7eb" />
                                <PolarAngleAxis
                                    dataKey="biomarker"
                                    tick={{ fill: '#4b5563', fontSize: 11, fontWeight: 500 }}
                                />
                                <PolarRadiusAxis
                                    angle={90}
                                    domain={[0, 100]}
                                    tick={{ fill: '#6b7280', fontSize: 10 }}
                                />
                                <Radar
                                    name="Correlation"
                                    dataKey="value"
                                    stroke="#8b5cf6"
                                    fill="#8b5cf6"
                                    fillOpacity={0.6}
                                />
                                <Tooltip content={<RadarTooltip />} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* List - Clean, no boxes */}
                    <div className="space-y-4">
                        {chartData.slice(0, 3).map((factor, index) => (
                            <div key={index} className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-purple-50 text-purple-600 font-bold text-sm">
                                    {index + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between mb-1">
                                        <span className="font-medium text-gray-900 truncate">{factor.name}</span>
                                        <span className="text-sm font-bold" style={{ color: getCorrelationColor(factor.patientValue) }}>
                                            {factor.patientValue}
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ width: `${factor.correlation * 100}%`, backgroundColor: getCorrelationColor(factor.patientValue) }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Bar Chart - Clean */}
            <div className="py-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Detailed Comparison</h3>
                        <p className="text-sm text-gray-500">Patient values vs disease average</p>
                    </div>
                    {/* Legend */}
                    <div className="flex gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-red-500" /> High
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-orange-500" /> Med-High
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-yellow-500" /> Med
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-blue-500" /> Low
                        </div>
                    </div>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                            <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={60}
                                tick={{ fill: '#6b7280', fontSize: 11 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                domain={[0, 1]}
                                tick={{ fill: '#6b7280', fontSize: 11 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey="patientValue"
                                name="Patient Correlation"
                                radius={[4, 4, 0, 0]}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getCorrelationColor(entry.patientValue)} />
                                ))}
                            </Bar>
                            <Bar
                                dataKey="diseaseAverage"
                                name="Disease Average"
                                fill="#e5e7eb"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default ContributingFactorsChart;
