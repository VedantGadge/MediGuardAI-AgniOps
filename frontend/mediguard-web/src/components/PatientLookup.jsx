import React, { useState } from 'react';
import { Search, User, Activity, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import ContributingFactorsChart from './ContributingFactorsChart';
import { getPatientAnalysis } from '../lib/api';
import { toast } from 'sonner';

export const PatientLookup = () => {
    const [patientId, setPatientId] = useState('');
    const [loading, setLoading] = useState(false);
    const [patientData, setPatientData] = useState(null);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (!patientId.trim()) {
            toast.error('Please enter a Patient ID');
            return;
        }

        setLoading(true);
        setError(null);
        setPatientData(null);

        try {
            const data = await getPatientAnalysis(patientId.trim());
            setPatientData(data);
            toast.success('Patient data loaded successfully!');
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to fetch patient data';
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

    const getDiseaseColor = (disease) => {
        const colors = {
            'Diabetes': 'text-red-600 bg-red-50 border-red-200',
            'Healthy': 'text-green-600 bg-green-50 border-green-200',
            'Prediabetes': 'text-yellow-600 bg-yellow-50 border-yellow-200',
            'NAFLD': 'text-orange-600 bg-orange-50 border-orange-200',
            'Thalassemia': 'text-purple-600 bg-purple-50 border-purple-200',
            'Coronary Artery Disease': 'text-rose-600 bg-rose-50 border-rose-200',
            'Infection/Inflammation': 'text-amber-600 bg-amber-50 border-amber-200',
            'Hepatitis-like inflammation': 'text-red-700 bg-red-50 border-red-200',
            'Dyslipidemia': 'text-blue-600 bg-blue-50 border-blue-200',
            'Polycythemia': 'text-indigo-600 bg-indigo-50 border-indigo-200',
        };
        return colors[disease] || 'text-gray-600 bg-gray-50 border-gray-200';
    };

    return (
        <div className="space-y-6">
            {/* Search Section */}
            <Card className="shadow-xl rounded-2xl border-0 bg-gradient-to-br from-white to-blue-50">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                        <Search className="w-6 h-6 text-blue-600" />
                        Patient Lookup
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-2">
                        Enter a Patient ID to view disease prediction and contributing factors
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="flex-1">
                            <Input
                                type="text"
                                placeholder="Enter Patient ID (e.g., P001)"
                                value={patientId}
                                onChange={(e) => setPatientId(e.target.value)}
                                className="h-12 text-lg border-2 focus:border-blue-500"
                                disabled={loading}
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Searching...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Search className="w-5 h-5" />
                                    Search
                                </span>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Error State */}
            {error && (
                <Card className="shadow-lg rounded-2xl border-2 border-red-200 bg-red-50">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 text-red-700">
                            <AlertCircle className="w-6 h-6" />
                            <div>
                                <p className="font-semibold">Error</p>
                                <p className="text-sm">{error}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Patient Data Display */}
            {patientData && (
                <div className="space-y-6 animate-fade-in">
                    {/* Patient Info Card */}
                    <Card className="shadow-xl rounded-2xl border-0 bg-gradient-to-br from-white to-purple-50">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <User className="w-5 h-5 text-purple-600" />
                                Patient Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Patient ID */}
                                <div className="p-4 rounded-lg bg-white shadow-sm border border-purple-100">
                                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                                        <User className="w-4 h-4" />
                                        <span className="text-sm font-medium">Patient ID</span>
                                    </div>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {patientData.patientId}
                                    </p>
                                </div>

                                {/* Disease Prediction */}
                                <div className="p-4 rounded-lg bg-white shadow-sm border border-purple-100">
                                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                                        <Activity className="w-4 h-4" />
                                        <span className="text-sm font-medium">Predicted Disease</span>
                                    </div>
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border-2 ${getDiseaseColor(patientData.disease)}`}>
                                        {patientData.disease === 'Healthy' ? (
                                            <CheckCircle className="w-4 h-4" />
                                        ) : (
                                            <AlertCircle className="w-4 h-4" />
                                        )}
                                        <span className="font-bold text-sm">
                                            {patientData.disease}
                                        </span>
                                    </div>
                                </div>

                                {/* Timestamp */}
                                <div className="p-4 rounded-lg bg-white shadow-sm border border-purple-100">
                                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-sm font-medium">Sample Date</span>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-800">
                                        {formatDate(patientData.timestamp)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contributing Factors Chart */}
                    {patientData.topContributingFactors && patientData.topContributingFactors.length > 0 && (
                        <ContributingFactorsChart data={patientData.topContributingFactors} />
                    )}

                    {/* Key Biomarkers Table */}
                    <Card className="shadow-xl rounded-2xl border-0 bg-gradient-to-br from-white to-gray-50">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-gray-800">
                                Key Biomarker Values
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {patientData.topContributingFactors.slice(0, 8).map((factor, index) => (
                                    <div
                                        key={index}
                                        className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100"
                                    >
                                        <p className="text-xs font-medium text-gray-600 mb-1">
                                            {factor.biomarker}
                                        </p>
                                        <p className="text-lg font-bold text-blue-600">
                                            {factor.patientValue.toFixed(4)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Avg: {factor.diseaseAverage.toFixed(4)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default PatientLookup;
