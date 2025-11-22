import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

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
        <div className="space-y-6">
            {/* Radar Chart - Correlation Strength Overview */}
            <Card className="w-full shadow-xl rounded-2xl border-0 bg-gradient-to-br from-purple-50 via-white to-blue-50">
                <CardHeader className="space-y-2 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-100">
                            <Activity className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                Top Contributing Biomarkers
                            </CardTitle>
                            <p className="text-sm text-gray-600 mt-1">
                                Normalized correlation values showing disease contribution strength
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Radar Chart */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                                Correlation Strength Profile
                            </h3>
                            <ResponsiveContainer width="100%" height={400}>
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

                        {/* Top Factors List */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                Ranked Contribution Factors
                            </h3>
                            <div className="space-y-3">
                                {chartData.slice(0, 6).map((factor, index) => (
                                    <div
                                        key={index}
                                        className="p-4 rounded-xl bg-white border-2 border-gray-100 hover:border-purple-300 transition-all duration-200 hover:shadow-md"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                                                        {factor.rank}
                                                    </span>
                                                    <p className="font-semibold text-gray-900 text-sm">
                                                        {factor.name}
                                                    </p>
                                                </div>
                                                <div className="ml-8 space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <div 
                                                            className="w-3 h-3 rounded-full" 
                                                            style={{ backgroundColor: getCorrelationColor(factor.patientValue) }}
                                                        />
                                                        <p className="text-xs text-gray-600">
                                                            Correlation: <span className="font-bold text-gray-900">{factor.patientValue}</span>
                                                        </p>
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        Deviation: <span className="font-semibold text-orange-600">{factor.deviation}%</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="ml-2">
                                                {factor.status === 'above' ? (
                                                    <TrendingUp className="w-5 h-5 text-red-500" />
                                                ) : (
                                                    <TrendingDown className="w-5 h-5 text-blue-500" />
                                                )}
                                            </div>
                                        </div>
                                        {/* Progress bar */}
                                        <div className="mt-3 ml-8">
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="h-2 rounded-full transition-all duration-300"
                                                    style={{
                                                        width: `${factor.correlation * 100}%`,
                                                        backgroundColor: getCorrelationColor(factor.patientValue)
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Detailed Bar Chart Comparison */}
            <Card className="w-full shadow-xl rounded-2xl border-0 bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="space-y-2 pb-4">
                    <CardTitle className="text-xl font-bold text-gray-800">
                        Detailed Correlation Comparison
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                        Patient values vs disease average normalized correlations
                    </p>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart
                            data={chartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={100}
                                tick={{ fill: '#4b5563', fontSize: 11 }}
                            />
                            <YAxis
                                domain={[0, 1]}
                                tick={{ fill: '#4b5563', fontSize: 11 }}
                                label={{ value: 'Correlation Value', angle: -90, position: 'insideLeft', fill: '#4b5563' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{ paddingTop: '20px' }}
                                iconType="circle"
                            />
                            <Bar
                                dataKey="patientValue"
                                name="Patient Correlation"
                                radius={[8, 8, 0, 0]}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getCorrelationColor(entry.patientValue)} />
                                ))}
                            </Bar>
                            <Bar
                                dataKey="diseaseAverage"
                                name="Disease Average"
                                fill="#8b5cf6"
                                radius={[8, 8, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>

                    {/* Legend for correlation strength */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-semibold text-gray-700 mb-3">Correlation Strength Guide:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-red-500" />
                                <span className="text-xs text-gray-600">High (≥0.7)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-orange-500" />
                                <span className="text-xs text-gray-600">Med-High (0.5-0.7)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-yellow-500" />
                                <span className="text-xs text-gray-600">Medium (0.3-0.5)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-blue-500" />
                                <span className="text-xs text-gray-600">Low (&lt;0.3)</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ContributingFactorsChart;
