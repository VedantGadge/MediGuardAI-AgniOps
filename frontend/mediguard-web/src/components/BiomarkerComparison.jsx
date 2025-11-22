"use client"

import { useEffect, useState } from "react"
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Line, Scatter } from "recharts"
import axios from "axios"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "./ui/card"
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
        label: "Value",
        color: "hsl(var(--chart-1))",
    },
}

export function BiomarkerComparison() {
    const [diseases, setDiseases] = useState([])
    const [biomarkers, setBiomarkers] = useState([])
    const [selectedDisease, setSelectedDisease] = useState("")
    const [selectedBiomarker, setSelectedBiomarker] = useState("")
    const [stats, setStats] = useState(null)
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
            } catch (error) {
                console.error("Error fetching diseases:", error)
            }
        }
        fetchDiseases()
    }, [])

    // Fetch biomarkers on mount
    useEffect(() => {
        const fetchBiomarkers = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/dashboard/available-biomarkers")
                setBiomarkers(response.data)
            } catch (error) {
                console.error("Error fetching biomarkers:", error)
            }
        }
        fetchBiomarkers()
    }, [])

    // Fetch stats when both selections are made
    useEffect(() => {
        if (selectedDisease && selectedBiomarker) {
            const fetchStats = async () => {
                setLoading(true)
                try {
                    const response = await axios.get("http://localhost:5000/api/dashboard/biomarker-data", {
                        params: {
                            disease: selectedDisease,
                            biomarker: selectedBiomarker
                        }
                    })
                    setStats(response.data)
                } catch (error) {
                    console.error("Error fetching biomarker stats:", error)
                    setStats(null)
                } finally {
                    setLoading(false)
                }
            }
            fetchStats()
        }
    }, [selectedDisease, selectedBiomarker])

    const renderBoxPlot = () => {
        if (!stats) return null

        const data = [
            { name: 'Min', value: parseFloat(stats.min) },
            { name: 'Q1', value: parseFloat(stats.q1) },
            { name: 'Median', value: parseFloat(stats.median) },
            { name: 'Q3', value: parseFloat(stats.q3) },
            { name: 'Max', value: parseFloat(stats.max) },
        ]

        return (
            <div className="space-y-6">
                {/* Box Plot Visualization */}
                <ChartContainer config={chartConfig} className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <ChartTooltip />
                            <Bar dataKey="value" fill="hsl(210, 70%, 50%)" radius={4} />
                            <Line type="monotone" dataKey="value" stroke="hsl(340, 75%, 55%)" strokeWidth={2} />
                            <Scatter dataKey="value" fill="hsl(280, 65%, 60%)" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </ChartContainer>

                {/* Statistics Summary */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-sm text-slate-600">Minimum</p>
                        <p className="text-2xl font-bold text-slate-800">{parseFloat(stats.min).toFixed(2)}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-sm text-slate-600">Q1 (25%)</p>
                        <p className="text-2xl font-bold text-slate-800">{parseFloat(stats.q1).toFixed(2)}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-600">Median</p>
                        <p className="text-2xl font-bold text-blue-800">{parseFloat(stats.median).toFixed(2)}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-sm text-slate-600">Q3 (75%)</p>
                        <p className="text-2xl font-bold text-slate-800">{parseFloat(stats.q3).toFixed(2)}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-sm text-slate-600">Maximum</p>
                        <p className="text-2xl font-bold text-slate-800">{parseFloat(stats.max).toFixed(2)}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-green-600">Mean</p>
                        <p className="text-2xl font-bold text-green-800">{parseFloat(stats.mean).toFixed(2)}</p>
                    </div>
                </div>

                <div className="bg-slate-100 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Sample Size</p>
                    <p className="text-lg font-semibold text-slate-800">{stats.count} patients</p>
                </div>
            </div>
        )
    }

    return (
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
                <CardTitle className="text-2xl text-slate-800">Biomarker Analysis</CardTitle>
                <CardDescription className="text-slate-600">
                    Compare biomarker levels across different diseases
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                {/* Dropdowns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Select Disease</label>
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

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Select Biomarker</label>
                        <Select value={selectedBiomarker} onValueChange={setSelectedBiomarker}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Choose a biomarker" />
                            </SelectTrigger>
                            <SelectContent>
                                {biomarkers.map(biomarker => (
                                    <SelectItem key={biomarker} value={biomarker}>
                                        {biomarker}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700 mx-auto mb-4"></div>
                            <p className="text-slate-600">Loading biomarker data...</p>
                        </div>
                    </div>
                )}

                {/* Results */}
                {!loading && stats && renderBoxPlot()}

                {/* Empty State */}
                {!loading && !stats && selectedDisease && selectedBiomarker && (
                    <div className="text-center py-12">
                        <p className="text-slate-500">No data available for this combination</p>
                    </div>
                )}

                {/* Initial State */}
                {!loading && !selectedDisease && !selectedBiomarker && (
                    <div className="text-center py-12">
                        <p className="text-slate-500">Select a disease and biomarker to view analysis</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
