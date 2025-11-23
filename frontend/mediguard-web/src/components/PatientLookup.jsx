import React, { useState } from 'react';
import { Search, User, Activity, Calendar, AlertCircle } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import ContributingFactorsChart from './ContributingFactorsChart';
import { getPatientAnalysis, getPatientDates } from '../lib/api';
import { toast } from 'sonner';

export const PatientLookup = () => {
    const [patientId, setPatientId] = useState('');
    const [loading, setLoading] = useState(false);
    const [patientData, setPatientData] = useState(null);
    const [error, setError] = useState(null);
    const [availableDates, setAvailableDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedYear, setSelectedYear] = useState('all');

    const handleSearch = async (e) => {
        e.preventDefault();

        if (!patientId.trim()) {
            toast.error('Please enter a Patient ID');
            return;
        }

        setLoading(true);
        setError(null);
        setPatientData(null);
        setAvailableDates([]);
        setSelectedDate('');
        setSelectedYear('all');

        try {
            // Fetch available dates first
            const dates = await getPatientDates(patientId.trim());
            setAvailableDates(dates);

            // Fetch latest analysis
            const data = await getPatientAnalysis(patientId.trim());
            setPatientData(data);
            setSelectedDate(data.timestamp);
            toast.success('Patient data loaded successfully!');
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to fetch patient data';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = async (newDate) => {
        setSelectedDate(newDate);
        setLoading(true);

        try {
            const data = await getPatientAnalysis(patientId.trim(), newDate);
            setPatientData(data);
            toast.success('Analysis data updated!');
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to fetch analysis data';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getDiseaseBadgeVariant = (disease) => {
        if (disease === 'Healthy') return 'default';
        return 'destructive';
    };

    // Get unique years from available dates
    const getAvailableYears = () => {
        const years = availableDates.map(date => new Date(date).getFullYear());
        return ['all', ...new Set(years)].sort((a, b) => {
            if (a === 'all') return -1;
            if (b === 'all') return 1;
            return b - a; // Most recent first
        });
    };

    // Filter dates by selected year
    const getFilteredDates = () => {
        if (selectedYear === 'all') return availableDates;
        return availableDates.filter(date =>
            new Date(date).getFullYear() === selectedYear
        );
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-6 animate-in fade-in duration-500">
            {/* Header & Search - Clean & Prominent */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Patient Lookup</h1>
                    <p className="text-gray-500 mt-1">View disease prediction and analysis</p>
                </div>
                <form onSubmit={handleSearch} className="flex w-full md:w-auto gap-3 min-w-[400px]">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Enter Patient ID (e.g., P001)"
                            value={patientId}
                            onChange={(e) => setPatientId(e.target.value)}
                            className="pl-10 h-12 bg-white border-gray-200 focus:border-blue-500 text-lg text-gray-900 shadow-sm rounded-xl"
                            disabled={loading}
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm transition-all"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Searching...
                            </span>
                        ) : (
                            'Search'
                        )}
                    </Button>
                </form>
            </div>

            {/* Error State */}
            {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {/* Patient Data Display */}
            {patientData && (
                <div className="space-y-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Patient Info Bar */}
                    <div className="py-6 flex flex-wrap gap-8 items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 rounded-full">
                                <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Patient ID</p>
                                <p className="text-xl font-bold text-gray-900">{patientData.patientId}</p>
                            </div>
                        </div>
                        <div className="h-10 w-px bg-gray-200 hidden md:block" />
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-50 rounded-full">
                                <Activity className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Predicted Disease</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-bold text-gray-900">{patientData.disease}</span>
                                    <Badge variant={getDiseaseBadgeVariant(patientData.disease)} className="ml-2">
                                        {patientData.disease === 'Healthy' ? 'Low Risk' : 'High Risk'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <div className="h-10 w-px bg-gray-200 hidden md:block" />
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-50 rounded-full">
                                <Calendar className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Analysis Date</p>
                                {availableDates.length > 1 ? (
                                    <div className="flex gap-2 items-center">
                                        {/* Year Filter */}
                                        {getAvailableYears().length > 2 && (
                                            <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(val === 'all' ? 'all' : parseInt(val))}>
                                                <SelectTrigger className="w-[100px] h-8 text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {getAvailableYears().map((year) => (
                                                        <SelectItem key={year} value={year.toString()}>
                                                            {year === 'all' ? 'All Years' : year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                        {/* Date Dropdown */}
                                        <Select value={selectedDate} onValueChange={handleDateChange}>
                                            <SelectTrigger className="w-[200px] h-8 text-sm font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {getFilteredDates().map((date) => (
                                                    <SelectItem key={date} value={date}>
                                                        {formatDate(date)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ) : (
                                    <p className="text-xl font-bold text-gray-900">{formatDate(patientData.timestamp)}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200"></div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pt-8">
                        {/* Left Column: Charts & Analysis (Span 2) */}
                        <div className="xl:col-span-2 space-y-8">
                            {patientData.topContributingFactors && (
                                <ContributingFactorsChart data={patientData.topContributingFactors} />
                            )}
                        </div>

                        {/* Right Column: Key Biomarkers (Span 1) */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Key Biomarkers</h3>
                                <p className="text-sm text-gray-500">Critical values analysis</p>
                            </div>
                            <div className="space-y-4">
                                {patientData.topContributingFactors.slice(0, 5).map((factor, index) => (
                                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                        <div>
                                            <p className="font-medium text-gray-900">{factor.biomarker}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">vs {factor.diseaseAverage.toFixed(2)} avg</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-gray-900">{factor.patientValue.toFixed(2)}</p>
                                            <span className={`text-xs font-bold ${factor.status === 'above' ? 'text-red-500' : 'text-blue-500'
                                                }`}>
                                                {factor.status === 'above' ? 'High' : 'Low'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientLookup;
