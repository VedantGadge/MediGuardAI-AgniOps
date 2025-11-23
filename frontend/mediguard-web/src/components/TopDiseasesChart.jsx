"use client"

import { useEffect, useState } from "react"
import { Pie, PieChart, Cell, ResponsiveContainer } from "recharts"
import api from "../lib/api"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "./ui/card"
import {
    ChartContainer,
    ChartTooltip,
} from "./ui/chart"

// Color palette for the donut chart
const COLORS = [
    'hsl(210, 70%, 50%)',  // Blue
    'hsl(340, 75%, 55%)',  // Pink/Red
    'hsl(160, 60%, 45%)',  // Teal
    'hsl(45, 90%, 55%)',   // Yellow
    'hsl(280, 65%, 60%)',  // Purple
    'hsl(25, 85%, 55%)',   // Orange
    'hsl(140, 55%, 50%)',  // Green
    'hsl(320, 70%, 55%)',  // Magenta
    'hsl(60, 80%, 50%)',   // Lime
    'hsl(190, 65%, 50%)',  // Cyan
    'hsl(200, 50%, 40%)',  // Gray for "Others"
];

const chartConfig = {
    count: {
        label: "Patients",
    },
}

export function TopDiseasesChart() {
    const [chartData, setChartData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get("/dashboard/disease-distribution")

                // Filter out "Healthy" and sort by count
                const filteredData = response.data
                    .filter(item => item.Disease.toLowerCase() !== 'healthy')
                    .sort((a, b) => parseInt(b.count) - parseInt(a.count))

                // Take top 10 diseases and group the rest as "Others"
                const top10 = filteredData.slice(0, 10)
                const others = filteredData.slice(10)

                const formattedData = top10.map((item, index) => ({
                    name: item.Disease,
                    value: parseInt(item.count),
                    fill: COLORS[index % COLORS.length]
                }))

                // Add "Others" if there are more diseases
                if (others.length > 0) {
                    const othersTotal = others.reduce((sum, item) => sum + parseInt(item.count), 0)
                    formattedData.push({
                        name: 'Others',
                        value: othersTotal,
                        fill: COLORS[10 % COLORS.length]
                    })
                }

                setChartData(formattedData)
            } catch (error) {
                console.error("Error fetching disease data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading chart data...</p>
                </div>
            </div>
        )
    }

    const CustomLegend = ({ payload }) => (
        <div className="flex flex-wrap gap-x-6 gap-y-3 justify-center max-w-3xl">
            {payload.map((entry, index) => (
                <div key={`legend-${index}`} className="flex items-center space-x-2">
                    <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
                        {entry.value}: <span className="text-slate-500">{entry.payload.value.toLocaleString()}</span>
                    </span>
                </div>
            ))}
        </div>
    )

    return (
        <div className="flex flex-col items-center space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Disease Distribution</h2>

            {/* Chart */}
            <ChartContainer config={chartConfig} className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={140}
                            fill="#8884d8"
                            dataKey="value"
                            paddingAngle={2}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <ChartTooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                        Disease
                                                    </span>
                                                    <span className="font-bold text-muted-foreground">
                                                        {payload[0].name}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                        Count
                                                    </span>
                                                    <span className="font-bold">
                                                        {payload[0].value.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                                return null
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </ChartContainer>

            {/* Legend */}
            <CustomLegend payload={chartData.map(item => ({
                value: item.name,
                color: item.fill,
                payload: item
            }))} />
        </div>
    )
}
