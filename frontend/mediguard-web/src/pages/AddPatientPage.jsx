import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { UserPlus, Activity, Loader2, Send } from 'lucide-react';
import GlassmorphismHeader from '../components/GlassmorphismHeader';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { NumberInput } from '../components/ui/number-input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const AddPatientPage = () => {
    const BIOMARKER_RANGES = {
        "Glucose": { min: 70, max: 140, unit: "mg/dL" },
        "Cholesterol": { min: 125, max: 200, unit: "mg/dL" },
        "Hemoglobin": { min: 13.5, max: 17.5, unit: "g/dL" },
        "Platelets": { min: 150000, max: 450000, unit: "per µL" },
        "White Blood Cells": { min: 4000, max: 11000, unit: "per mm³" },
        "Red Blood Cells": { min: 4.2, max: 5.4, unit: "million cells/µL" },
        "Hematocrit": { min: 38, max: 52, unit: "%" },
        "Mean Corpuscular Volume": { min: 80, max: 100, unit: "fL" },
        "Mean Corpuscular Hemoglobin": { min: 27, max: 33, unit: "pg" },
        "Mean Corpuscular Hemoglobin Concentration": { min: 32, max: 36, unit: "g/dL" },
        "Insulin": { min: 5, max: 25, unit: "µU/mL" },
        "BMI": { min: 18.5, max: 24.9, unit: "kg/m²" },
        "Systolic Blood Pressure": { min: 90, max: 120, unit: "mmHg" },
        "Diastolic Blood Pressure": { min: 60, max: 80, unit: "mmHg" },
        "Triglycerides": { min: 50, max: 150, unit: "mg/dL" },
        "HbA1c": { min: 4, max: 6, unit: "%" },
        "LDL Cholesterol": { min: 70, max: 130, unit: "mg/dL" },
        "HDL Cholesterol": { min: 40, max: 60, unit: "mg/dL" },
        "ALT": { min: 10, max: 40, unit: "U/L" },
        "AST": { min: 10, max: 40, unit: "U/L" },
        "Heart Rate": { min: 60, max: 100, unit: "bpm" },
        "Creatinine": { min: 0.6, max: 1.2, unit: "mg/dL" },
        "Troponin": { min: 0, max: 0.04, unit: "ng/mL" },
        "C-reactive Protein": { min: 0, max: 3, unit: "mg/L" }
    };

    const [biomarkers, setBiomarkers] = useState(Object.keys(BIOMARKER_RANGES));
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState(() => {
        const initialData = { patientId: '', patientName: '' };
        Object.keys(BIOMARKER_RANGES).forEach(biomarker => {
            initialData[biomarker] = '';
        });
        return initialData;
    });
    const [errors, setErrors] = useState({});

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Validation logic
        if (BIOMARKER_RANGES[field] && value !== '') {
            const numValue = parseFloat(value);
            const { min, max } = BIOMARKER_RANGES[field];

            if (isNaN(numValue)) {
                setErrors(prev => ({ ...prev, [field]: 'Must be a number' }));
            } else if (numValue < min || numValue > max) {
                setErrors(prev => ({ ...prev, [field]: `Enter correct value (${min}-${max})` }));
            } else {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[field];
                    return newErrors;
                });
            }
        } else {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.patientId || !formData.patientName) {
            toast.error('Please fill in Patient ID and Name');
            return;
        }

        // Validate that at least some biomarkers are filled
        const filledBiomarkers = biomarkers.filter(b => formData[b] && formData[b] !== '');
        if (filledBiomarkers.length === 0) {
            toast.error('Please fill in at least one biomarker value');
            return;
        }

        setSubmitting(true);

        try {
            // Prepare data for model prediction
            const biomarkerData = {};
            biomarkers.forEach(biomarker => {
                if (formData[biomarker] && formData[biomarker] !== '') {
                    biomarkerData[biomarker] = parseFloat(formData[biomarker]);
                }
            });

            const payload = {
                patientId: formData.patientId,
                patientName: formData.patientName,
                biomarkers: biomarkerData,
                timestamp: new Date().toISOString()
            };

            // TODO: Replace with actual model prediction endpoint
            console.log('Submitting patient data:', payload);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            toast.success('Patient data submitted successfully!');

            // Reset form
            const resetData = { patientId: '', patientName: '' };
            biomarkers.forEach(biomarker => {
                resetData[biomarker] = '';
            });
            setFormData(resetData);

        } catch (error) {
            console.error('Error submitting patient data:', error);
            toast.error('Failed to submit patient data');
        } finally {
            setSubmitting(false);
        }
    };

    // Group biomarkers for better organization
    const groupBiomarkers = (biomarkers) => {
        const itemsPerColumn = Math.ceil(biomarkers.length / 3);
        const columns = [];

        for (let i = 0; i < biomarkers.length; i += itemsPerColumn) {
            columns.push(biomarkers.slice(i, i + itemsPerColumn));
        }

        return columns;
    };

    const biomarkerColumns = groupBiomarkers(biomarkers);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100">
                <GlassmorphismHeader />
                <div className="flex items-center justify-center min-h-screen">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <Loader2 className="w-12 h-12 animate-spin text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-600 font-medium">Loading biomarker fields...</p>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100">
            <GlassmorphismHeader />

            <div className="max-w-[1600px] mx-auto px-8 py-8 pt-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Page Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-lg">
                                <UserPlus className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                                    Add New Patient
                                </h1>
                                <p className="text-slate-600 text-sm">
                                    Enter patient biomarker data for disease prediction
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            {/* Main Form Container */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-white/20"
                            >
                                {/* Patient Information Section */}
                                <div className="mb-8">
                                    <div className="flex items-center gap-2 mb-1">
                                        <UserPlus className="w-5 h-5 text-slate-700" />
                                        <h2 className="text-xl font-semibold text-slate-800">Patient Information</h2>
                                    </div>
                                    <p className="text-slate-500 text-sm mb-6 ml-7">Basic patient identification details</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-1">
                                        <div className="space-y-2">
                                            <Label htmlFor="patientId" className="text-slate-700 font-semibold">
                                                Patient ID *
                                            </Label>
                                            <Input
                                                id="patientId"
                                                type="text"
                                                placeholder="e.g., P12345"
                                                value={formData.patientId}
                                                onChange={(e) => handleInputChange('patientId', e.target.value)}
                                                required
                                                className="bg-white border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="patientName" className="text-slate-700 font-semibold">
                                                Patient Name *
                                            </Label>
                                            <Input
                                                id="patientName"
                                                type="text"
                                                placeholder="e.g., John Doe"
                                                value={formData.patientName}
                                                onChange={(e) => handleInputChange('patientName', e.target.value)}
                                                required
                                                className="bg-white border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Subtle Divider */}
                                <hr className="border-slate-200 my-8" />

                                {/* Biomarker Data Section */}
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Activity className="w-5 h-5 text-slate-700" />
                                        <h2 className="text-xl font-semibold text-slate-800">Biomarker Data</h2>
                                    </div>
                                    <p className="text-slate-500 text-sm mb-6 ml-7">Enter patient biomarker values (numeric values only)</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6 ml-1">
                                        {biomarkerColumns.map((column, colIndex) => (
                                            <div key={colIndex} className="space-y-4">
                                                {column.map((biomarker, index) => (
                                                    <motion.div
                                                        key={biomarker}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.3 + (colIndex * 0.1) + (index * 0.02) }}
                                                        className="space-y-2"
                                                    >
                                                        <Label
                                                            htmlFor={biomarker}
                                                            className="text-slate-700 text-sm font-medium"
                                                        >
                                                            {biomarker}
                                                        </Label>
                                                        <NumberInput
                                                            id={biomarker}
                                                            step={0.01}
                                                            placeholder={BIOMARKER_RANGES[biomarker] ? `${BIOMARKER_RANGES[biomarker].min} - ${BIOMARKER_RANGES[biomarker].max}` : "0.00"}
                                                            value={formData[biomarker] || ''}
                                                            onChange={(e) => handleInputChange(biomarker, e.target.value)}
                                                            className={`border-slate-200 focus:border-slate-400 focus:ring-slate-400 ${errors[biomarker] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                                        />
                                                        {errors[biomarker] && (
                                                            <p className="text-red-500 text-xs mt-1 font-medium animate-pulse">
                                                                {errors[biomarker]}
                                                            </p>
                                                        )}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Submit Button */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="flex justify-end gap-4"
                            >
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        const resetData = { patientId: '', patientName: '' };
                                        biomarkers.forEach(biomarker => {
                                            resetData[biomarker] = '';
                                        });
                                        setFormData(resetData);
                                    }}
                                    className="px-8 border-slate-300 text-slate-700 hover:bg-slate-50"
                                >
                                    Clear Form
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-8 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white shadow-lg hover:shadow-xl transition-all"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Submit for Prediction
                                        </>
                                    )}
                                </Button>
                            </motion.div>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default AddPatientPage;
