"use client"

import { useEffect, useState } from "react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from "recharts"
import axios from "axios"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select"
import { ChartContainer } from "./ui/chart"

const COLORS = [
    'hsl(210, 70%, 50%)',  // Blue
    'hsl(340, 75%, 55%)',  // Pink/Red
    'hsl(160, 60%, 45%)',  // Teal
    'hsl(45, 90%, 55%)',   // Yellow
    'hsl(280, 65%, 60%)',  // Purple
    'hsl(25, 85%, 55%)',   // Orange
    'hsl(140, 55%, 50%)',  // Green
    'hsl(320, 70%, 55%)',  // Magenta
];

const chartConfig = {
    count: {
        label: "Cases",
    },
}

export function DiseaseTemporalChart() {
    const [diseases, setDiseases] = useState([])
    const [selectedDiseases, setSelectedDiseases] = useState([])
    const [temporalData, setTemporalData] = useState([])
    const [interval, setInterval] = useState("weekly")
    const [loading, setLoading] = useState(false)

    // Fetch diseases on mount
    useEffect(() => {
        const fetchDiseases = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/dashboard/disease-distribution")
                const diseaseList = response.data
                    .filter(item => item.Disease.toLowerCase() !== 'healthy')
                    .map(item => item.Disease)
                    .slice(0, 5) // Top 5 diseases
                setDiseases(diseaseList)

                // Auto-select top 3 diseases
                if (diseaseList.length > 0) {
                    setSelectedDiseases(diseaseList.slice(0, 3))
                }
            } catch (error) {
                console.error("Error fetching diseases:", error)
            }
        }
        fetchDiseases()
    }, [])

    // Fetch temporal data when diseases or interval changes
    useEffect(() => {
        if (selectedDiseases.length === 0) return

        const fetchTemporalData = async () => {
            setLoading(true)
            try {
                // Fetch data for all selected diseases
                const promises = selectedDiseases.map(disease =>
                    axios.get("http://localhost:5000/api/dashboard/disease-temporal", {
                        params: { disease, interval }
                    })
                )

                const responses = await Promise.all(promises)

                // Combine data from all diseases
                const allData = responses.flatMap(response => response.data)

                // Group by period
                const groupedByPeriod = {}
                allData.forEach(item => {
                    if (!groupedByPeriod[item.period]) {
                        groupedByPeriod[item.period] = { period: item.period }
                    }
                    groupedByPeriod[item.period][item.disease] = parseInt(item.count)
                })

                // Convert to array and sort by period
                const formattedData = Object.values(groupedByPeriod).sort((a, b) =>
                    a.period.localeCompare(b.period)
                )

                // Limit data based on interval
                let limitedData = formattedData;
                if (interval === 'weekly') {
                    // Show only last 40 weeks
                    limitedData = formattedData.slice(-40);
                } else if (interval === 'monthly') {
                    // Show only last 15 months
                    limitedData = formattedData.slice(-15);
                } else if (interval === 'yearly') {
                    // Show only last 10 years
                    limitedData = formattedData.slice(-10);
                }

                setTemporalData(limitedData)
            } catch (error) {
                console.error("Error fetching temporal data:", error)
                setTemporalData([])
            } finally {
                setLoading(false)
            }
        }

        fetchTemporalData()
    }, [selectedDiseases, interval])

    const toggleDisease = (disease) => {
        setSelectedDiseases(prev => {
            if (prev.includes(disease)) {
                return prev.filter(d => d !== disease)
            } else {
                return [...prev, disease]
            }
        })
    }

    return (
        <div className="flex flex-col space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Disease Trends Over Time</h2>

            {/* Controls */}
            <div className="flex flex-wrap gap-4 items-center">
                {/* Interval Selector */}
                <div className="flex-1 min-w-[200px]">
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Time Interval</label>
                    <Select value={interval} onValueChange={setInterval}>
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Disease Toggles */}
                <div className="flex-1">
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Select Diseases</label>
                    <div className="flex flex-wrap gap-2">
                        {diseases.map((disease, index) => (
                            <button
                                key={disease}
                                onClick={() => toggleDisease(disease)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedDiseases.includes(disease)
                                    ? 'text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                style={{
                                    backgroundColor: selectedDiseases.includes(disease)
                                        ? COLORS[index % COLORS.length]
                                        : undefined
                                }}
                            >
                                {disease}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700 mx-auto mb-4"></div>
                        <p className="text-slate-600">Loading temporal data...</p>
                    </div>
                </div>
            )}

            {/* Line Chart */}
            {!loading && temporalData.length > 0 && (
                <ChartContainer config={chartConfig} className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={temporalData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="period"
                                tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
                                interval="preserveStartEnd"
                                height={60}
                            />
                            <YAxis
                                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                                label={{ value: 'Number of Cases', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                    padding: '12px'
                                }}
                            />
                            <Legend
                                wrapperStyle={{ paddingTop: '20px' }}
                                iconType="line"
                            />
                            {selectedDiseases.map((disease, index) => (
                                <Line
                                    key={disease}
                                    type="monotoneX"
                                    dataKey={disease}
                                    stroke={COLORS[diseases.indexOf(disease) % COLORS.length]}
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                    name={disease}
                                    connectNulls={true}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
            )}

            {/* Empty State */}
            {!loading && temporalData.length === 0 && selectedDiseases.length > 0 && (
                <div className="text-center py-12">
                    <p className="text-slate-500">No temporal data available for selected diseases</p>
                </div>
            )}

            {/* Initial State */}
            {!loading && selectedDiseases.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-slate-500">Select at least one disease to view trends</p>
                </div>
            )}
        </div>
    )
}
