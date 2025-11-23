"use client"

import { useEffect, useState } from "react"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts"
import axios from "axios"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select"
import { ChartContainer, ChartTooltip } from "./ui/chart"

const chartConfig = {
    value: {
        label: "Average Value",
        color: "hsl(210, 70%, 50%)",
    },
}

export function DiseaseRadarChart() {
    const [diseases, setDiseases] = useState([])
    const [selectedDisease, setSelectedDisease] = useState("")
    const [radarData, setRadarData] = useState([])
    const [loading, setLoading] = useState(false)

    // Fetch diseases on mount
    useEffect(() => {
        const fetchDiseases = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/dashboard/disease-distribution")
                const diseaseList = response.data
                    .filter(item => item.Disease.toLowerCase() !== 'healthy')
                    .map(item => item.Disease)
                setDiseases(diseaseList)

                // Auto-select first disease
                if (diseaseList.length > 0) {
                    setSelectedDisease(diseaseList[0])
                }
            } catch (error) {
                console.error("Error fetching diseases:", error)
            }
        }
        fetchDiseases()
    }, [])

    // Fetch radar data when disease is selected
    useEffect(() => {
        if (selectedDisease) {
            const fetchRadarData = async () => {
                setLoading(true)
                try {
                    const response = await axios.get("http://localhost:5000/api/dashboard/disease-profile", {
                        params: { disease: selectedDisease }
                    })
                    const filteredData = response.data.filter(item => {
                        const name = item.biomarker?.toString().trim().toLowerCase();
                        return name && name !== 'id' && name !== '_id';
                    });

                    // Sort by value descending and take top 7
                    const top7Data = filteredData
                        .sort((a, b) => b.value - a.value)
                        .slice(0, 7);

                    setRadarData(top7Data)
                } catch (error) {
                    console.error("Error fetching disease profile:", error)
                    setRadarData([])
                } finally {
                    setLoading(false)
                }
            }
            fetchRadarData()
        }
    }, [selectedDisease])

    return (
        <div className="flex flex-col items-center space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Disease Biomarker Profile</h2>

            {/* Disease Selector */}
            <div className="w-full max-w-md">
                <label className="text-sm font-medium text-slate-700 mb-2 block">Select Disease</label>
                <Select value={selectedDisease} onValueChange={setSelectedDisease}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a disease" />
                    </SelectTrigger>
                    <SelectContent>
                        {diseases.map(disease => (
                            <SelectItem key={disease} value={disease}>
                                {disease}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700 mx-auto mb-4"></div>
                        <p className="text-slate-600">Loading biomarker profile...</p>
                    </div>
                </div>
            )}

            {/* Radar Chart */}
            {!loading && radarData.length > 0 && (
                <ChartContainer config={chartConfig} className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                            <PolarGrid stroke="hsl(var(--border))" />
                            <PolarAngleAxis
                                dataKey="biomarker"
                                tick={{
                                    fill: '#1e293b',
                                    fontSize: 13,
                                    fontWeight: 600
                                }}
                            />
                            <PolarRadiusAxis angle={90} domain={[0, 1]} axisLine={false} tick={false} />
                            <Radar
                                name="Average Value"
                                dataKey="value"
                                stroke="hsl(210, 70%, 50%)"
                                fill="hsl(210, 70%, 50%)"
                                fillOpacity={0.6}
                                label={(props) => {
                                    const { cx, cy, value, index } = props;

                                    // Comprehensive validation
                                    if (!radarData[index] ||
                                        typeof cx !== 'number' ||
                                        typeof cy !== 'number' ||
                                        typeof value !== 'number' ||
                                        typeof index !== 'number' ||
                                        isNaN(cx) || isNaN(cy) || isNaN(value) || isNaN(index)) {
                                        return null;
                                    }

                                    const total = radarData.length;
                                    const angle = (90 - (360 / total) * index) * (Math.PI / 180);

                                    // Get the max value from the data to calculate radius
                                    const maxValue = Math.max(...radarData.map(d => d.value));
                                    if (maxValue === 0 || isNaN(maxValue)) return null;

                                    const chartRadius = 120;
                                    const valueRadius = (value / maxValue) * chartRadius;

                                    // Calculate label position
                                    const labelOffset = 35;
                                    const x = cx + (valueRadius + labelOffset) * Math.cos(angle);
                                    const y = cy - (valueRadius + labelOffset) * Math.sin(angle);

                                    // Final validation
                                    if (isNaN(x) || isNaN(y)) return null;

                                    return (
                                        <g>
                                            <text
                                                x={x}
                                                y={y - 8}
                                                fill="#475569"
                                                fontSize="12"
                                                fontWeight="600"
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                {radarData[index].biomarker}
                                            </text>
                                            <text
                                                x={x}
                                                y={y + 8}
                                                fill="#60a5fa"
                                                fontSize="14"
                                                fontWeight="bold"
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                {value.toFixed(2)}
                                            </text>
                                        </g>
                                    );
                                }}
                            />
                            <ChartTooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-lg border bg-background p-3 shadow-lg">
                                                <p className="font-bold text-sm mb-1">{payload[0].payload.biomarker}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Average: <span className="font-semibold text-foreground">
                                                        {payload[0].value.toFixed(2)}
                                                    </span>
                                                </p>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            )}

            {/* Empty State */}
            {!loading && radarData.length === 0 && selectedDisease && (
                <div className="text-center py-12">
                    <p className="text-slate-500">No biomarker data available for {selectedDisease}</p>
                </div>
            )}

            {/* Initial State */}
            {!loading && !selectedDisease && (
                <div className="text-center py-12">
                    <p className="text-slate-500">Select a disease to view its biomarker profile</p>
                </div>
            )}
        </div>
    )
}
