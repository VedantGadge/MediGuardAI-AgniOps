import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { UserPlus, Activity, Loader2, Send, CheckCircle2, TrendingUp, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import GlassmorphismHeader from '../components/GlassmorphismHeader';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { NumberInput } from '../components/ui/number-input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';

const AddPatientPage = () => {
    const BIOMARKER_RANGES = {
        "Glucose": { min: 0, max: 1000, unit: "mg/dL" },
        "Cholesterol": { min: 0, max: 1000, unit: "mg/dL" },
        "Hemoglobin": { min: 0, max: 30, unit: "g/dL" },
        "Platelets": { min: 0, max: 2000000, unit: "per µL" },
        "White Blood Cells": { min: 0, max: 100000, unit: "per mm³" },
        "Red Blood Cells": { min: 0, max: 15, unit: "million cells/µL" },
        "Hematocrit": { min: 0, max: 100, unit: "%" },
        "Mean Corpuscular Volume": { min: 0, max: 200, unit: "fL" },
        "Mean Corpuscular Hemoglobin": { min: 0, max: 100, unit: "pg" },
        "Mean Corpuscular Hemoglobin Concentration": { min: 0, max: 100, unit: "g/dL" },
        "Insulin": { min: 0, max: 500, unit: "µU/mL" },
        "BMI": { min: 0, max: 200, unit: "kg/m²" },
        "Systolic Blood Pressure": { min: 0, max: 300, unit: "mmHg" },
        "Diastolic Blood Pressure": { min: 0, max: 200, unit: "mmHg" },
        "Triglycerides": { min: 0, max: 2000, unit: "mg/dL" },
        "HbA1c": { min: 0, max: 25, unit: "%" },
        "LDL Cholesterol": { min: 0, max: 500, unit: "mg/dL" },
        "HDL Cholesterol": { min: 0, max: 200, unit: "mg/dL" },
        "ALT": { min: 0, max: 5000, unit: "U/L" },
        "AST": { min: 0, max: 5000, unit: "U/L" },
        "Heart Rate": { min: 0, max: 300, unit: "bpm" },
        "Creatinine": { min: 0, max: 30, unit: "mg/dL" },
        "Troponin": { min: 0, max: 100, unit: "ng/mL" },
        "C-reactive Protein": { min: 0, max: 500, unit: "mg/L" }
    };

    const DISEASE_BIOMARKER_MAP = {
        "Anemia": {
            "Hemoglobin": 0.45,
            "Red Blood Cells": 0.25,
            "Hematocrit": 0.10
        },
        "Prediabetes": {
            "Glucose": 0.45,
            "HbA1c": 0.25,
            "BMI": 0.10
        },
        "Diabetes": {
            "Glucose": 0.45,
            "HbA1c": 0.25,
            "Triglycerides": 0.10
        },
        "Severe Inflammation": {
            "C-reactive Protein": 0.45,
            "White Blood Cells": 0.25,
            "Heart Rate": 0.10
        },
        "Thrombocytopenia": {
            "Platelets": 0.45,
            "PlateletWBC_Ratio": 0.25,
            "Hemoglobin": 0.10
        },
        "Obesity": {
            "BMI": 0.45,
            "Triglycerides": 0.25,
            "BloodPressure": 0.10
        },
        "IronDeficiencyAnemia": {
            "Hemoglobin": 0.45,
            "Mean Corpuscular Volume": 0.25,
            "Mean Corpuscular Hemoglobin": 0.10
        },
        "ThalassemiaMajorLike": {
            "Mean Corpuscular Volume": 0.45,
            "Red Blood Cells": 0.25,
            "Mean Corpuscular Hemoglobin": 0.10
        },
        "ThalassemiaTrait": {
            "Mean Corpuscular Volume": 0.45,
            "Red Blood Cells": 0.25,
            "Hemoglobin": 0.10
        },
        "KidneyImpairment": {
            "Creatinine": 0.45,
            "BloodPressure": 0.25,
            "C-reactive Protein": 0.10
        },
        "Thromboc": {
            "Platelets": 0.45,
            "Red Blood Cells": 0.25,
            "Hemoglobin": 0.10
        },
        "MetabolicSyndrome": {
            "Triglycerides": 0.45,
            "BMI": 0.25,
            "BloodPressure": 0.10
        },
        "HyperthyroidismLike": {
            "Heart Rate": 0.45,
            "BMI": 0.25,
            "ALT": 0.10
        },
        "CoronaryArteryDisease": {
            "LDL Cholesterol": 0.45,
            "C-reactive Protein": 0.25,
            "BloodPressure": 0.10
        },
        "Hypertension": {
            "Systolic Blood Pressure": 0.45,
            "Diastolic Blood Pressure": 0.25,
            "BMI": 0.10
        },
        "ArrhythmiaRisk": {
            "Heart Rate": 0.45,
            "C-reactive Protein": 0.25,
            "Troponin": 0.10
        },
        "Dyslipidemia": {
            "LDL Cholesterol": 0.45,
            "Triglycerides": 0.25,
            "HDL Cholesterol": 0.10
        },
        "Hepatitis": {
            "ALT": 0.45,
            "AST": 0.25,
            "Platelets": 0.10
        },
        "NAFLD": {
            "ALT": 0.45,
            "BMI": 0.25,
            "Triglycerides": 0.10
        },
        "InfectionInflammation": {
            "White Blood Cells": 0.45,
            "C-reactive Protein": 0.25,
            "Heart Rate": 0.10
        },
        "Polycythemia": {
            "Red Blood Cells": 0.45,
            "Hemoglobin": 0.25,
            "Hematocrit": 0.10
        },
        "ACS": {
            "Troponin": 0.45,
            "C-reactive Protein": 0.25,
            "Heart Rate": 0.10
        }
    };

    const [biomarkers, setBiomarkers] = useState(Object.keys(BIOMARKER_RANGES));
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [predictionResults, setPredictionResults] = useState(null);
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
        const toastId = toast.loading('Getting disease prediction...');

        try {
            // Prepare biomarker data with all required fields, defaulting to 0 for empty ones
            const biomarkerData = {};
            biomarkers.forEach(biomarker => {
                biomarkerData[biomarker] = formData[biomarker] && formData[biomarker] !== ''
                    ? parseFloat(formData[biomarker])
                    : 0;
            });

            console.log('=== ML Prediction Request ===');
            console.log('Input biomarkers:', biomarkerData);

            // Call ML prediction API
            const mlResponse = await fetch(`${process.env.REACT_APP_ML_API_URL || 'https://harshilforworks-redact-ml-model-agni.hf.space'}/api/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(biomarkerData)
            });

            if (!mlResponse.ok) {
                throw new Error(`ML API error: ${mlResponse.status}`);
            }

            const predictionResult = await mlResponse.json();

            console.log('=== ML Prediction Response ===');
            console.log('Prediction:', predictionResult.prediction);
            console.log('Confidence:', (predictionResult.confidence * 100).toFixed(2) + '%');
            console.log('Top 5 Predictions:', predictionResult.top_5_predictions);
            console.log('Raw Values:', predictionResult.raw_values);
            console.log('Model Info:', predictionResult.model_info);
            console.log('Full Response:', predictionResult);

            // Get the predicted disease
            const predictedDisease = predictionResult.prediction;

            // Map the disease to get relevant biomarkers with weights
            const diseaseBiomarkers = DISEASE_BIOMARKER_MAP[predictedDisease] || {};

            // Create the final payload with biomarkers from the disease map
            const finalPayload = {};

            // Add biomarkers from the disease map with their weight values
            Object.keys(diseaseBiomarkers).forEach(biomarker => {
                finalPayload[biomarker] = diseaseBiomarkers[biomarker];
            });

            // Add the predicted disease
            finalPayload.predicted_disease = predictedDisease;

            console.log('=== Final Payload for Backend ===');
            console.log(finalPayload);

            // Send to backend API
            let backendExplanation = null;
            let backendTopFeatures = null;
            let backendConfidence = null;

            try {
                const backendResponse = await fetch('https://yashganatra-mediguardai-api.hf.space/api/predict', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(finalPayload)
                });

                if (!backendResponse.ok) {
                    const errorText = await backendResponse.text();
                    console.error('=== Backend API Error Response ===');
                    console.error('Status:', backendResponse.status);
                    console.error('Response:', errorText);
                    throw new Error(`Backend API error: ${backendResponse.status} - ${errorText}`);
                }

                const backendResult = await backendResponse.json();

                console.log('=== Backend API Response ===');
                console.log(backendResult);

                // Extract explanation and features from backend response
                if (backendResult.success) {
                    backendExplanation = backendResult.explanation;
                    backendTopFeatures = backendResult.top_features;
                    backendConfidence = backendResult.confidence;
                }
            } catch (backendError) {
                console.error('=== Backend API Error ===');
                console.error('Failed to send to backend:', backendError);
                // Don't throw - still show prediction success
            }

            // TODO: Save to database
            // await savePatientData({
            //     patientId: formData.patientId,
            //     patientName: formData.patientName,
            //     ...finalPayload,
            //     timestamp: new Date().toISOString()
            // });

            // Store results and show modal
            setPredictionResults({
                prediction: predictionResult.prediction,
                confidence: backendConfidence || predictionResult.confidence,
                topFeatures: backendTopFeatures || [],
                explanation: backendExplanation || null
            });

            toast.success('Prediction complete!', { id: toastId });
            setShowResultModal(true);

            // Reset form
            const resetData = { patientId: '', patientName: '' };
            biomarkers.forEach(biomarker => {
                resetData[biomarker] = '';
            });
            setFormData(resetData);

        } catch (error) {
            console.error('=== Error ===');
            console.error('Error submitting patient data:', error);
            toast.error('Failed to get prediction: ' + error.message, { id: toastId });
        } finally {
            setSubmitting(false);
        }
    };

    const generatePDF = async () => {
        const input = document.getElementById('prediction-report-content');
        if (!input) return;

        const toastId = toast.loading('Generating PDF report...');

        try {
            const canvas = await html2canvas(input, {
                scale: 2,
                logging: false,
                useCORS: true
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`MediGuard-Report-${formData.patientId}.pdf`);

            toast.success('Report downloaded successfully!', { id: toastId });
        } catch (error) {
            console.error('PDF Generation Error:', error);
            toast.error('Failed to generate PDF report', { id: toastId });
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
                    <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
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

                        <div>
                            <input
                                type="file"
                                id="report-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;

                                    const uploadFormData = new FormData();
                                    uploadFormData.append('image', file);

                                    const toastId = toast.loading('Processing report image...');

                                    try {
                                        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/ocr/extract`, {
                                            method: 'POST',
                                            body: uploadFormData,
                                        });

                                        if (!response.ok) {
                                            throw new Error('Failed to process image');
                                        }

                                        const responseData = await response.json();
                                        console.log('[OCR] Full response:', responseData);

                                        // Extract the actual data
                                        let ocrData = responseData;
                                        if (responseData.success && responseData.data) {
                                            ocrData = responseData.data;
                                        } else if (responseData.data) {
                                            ocrData = responseData.data;
                                        }

                                        // Comprehensive synonym mapping for OCR parameter names to biomarker fields
                                        const synonymMap = {
                                            // Blood components
                                            'hemoglobin': 'Hemoglobin',
                                            'hb': 'Hemoglobin',
                                            'platelets': 'Platelets',
                                            'platelet count': 'Platelets',
                                            'plt': 'Platelets',

                                            // White blood cells
                                            'white blood cells': 'White Blood Cells',
                                            'wbc': 'White Blood Cells',
                                            'total leukocyte count': 'White Blood Cells',
                                            'tlc': 'White Blood Cells',
                                            'leukocytes': 'White Blood Cells',

                                            // Red blood cells
                                            'red blood cells': 'Red Blood Cells',
                                            'rbc': 'Red Blood Cells',
                                            'total rbc count': 'Red Blood Cells',
                                            'erythrocytes': 'Red Blood Cells',

                                            // Hematocrit
                                            'hematocrit': 'Hematocrit',
                                            'hct': 'Hematocrit',
                                            'hematocrit value': 'Hematocrit',
                                            'pcv': 'Hematocrit',

                                            // MCV, MCH, MCHC
                                            'mean corpuscular volume': 'Mean Corpuscular Volume',
                                            'mcv': 'Mean Corpuscular Volume',
                                            'mean cell volume': 'Mean Corpuscular Volume',

                                            'mean corpuscular hemoglobin': 'Mean Corpuscular Hemoglobin',
                                            'mch': 'Mean Corpuscular Hemoglobin',
                                            'mean cell hemoglobin': 'Mean Corpuscular Hemoglobin',
                                            'mean cell haemoglobin': 'Mean Corpuscular Hemoglobin',

                                            'mean corpuscular hemoglobin concentration': 'Mean Corpuscular Hemoglobin Concentration',
                                            'mchc': 'Mean Corpuscular Hemoglobin Concentration',
                                            'mean cell hemoglobin concentration': 'Mean Corpuscular Hemoglobin Concentration',
                                            'mean cell haemoglobin con': 'Mean Corpuscular Hemoglobin Concentration',

                                            // Metabolic
                                            'glucose': 'Glucose',
                                            'blood glucose': 'Glucose',
                                            'blood sugar': 'Glucose',
                                            'fbs': 'Glucose',

                                            'cholesterol': 'Cholesterol',
                                            'total cholesterol': 'Cholesterol',
                                            'chol': 'Cholesterol',

                                            'triglycerides': 'Triglycerides',
                                            'tg': 'Triglycerides',
                                            'trigs': 'Triglycerides',

                                            'hdl cholesterol': 'HDL Cholesterol',
                                            'hdl': 'HDL Cholesterol',
                                            'hdl-c': 'HDL Cholesterol',

                                            'ldl cholesterol': 'LDL Cholesterol',
                                            'ldl': 'LDL Cholesterol',
                                            'ldl-c': 'LDL Cholesterol',

                                            'hba1c': 'HbA1c',
                                            'a1c': 'HbA1c',
                                            'glycated hemoglobin': 'HbA1c',

                                            // Vitals
                                            'systolic blood pressure': 'Systolic Blood Pressure',
                                            'systolic': 'Systolic Blood Pressure',
                                            'sbp': 'Systolic Blood Pressure',

                                            'diastolic blood pressure': 'Diastolic Blood Pressure',
                                            'diastolic': 'Diastolic Blood Pressure',
                                            'dbp': 'Diastolic Blood Pressure',

                                            'heart rate': 'Heart Rate',
                                            'hr': 'Heart Rate',
                                            'pulse': 'Heart Rate',
                                            'pulse rate': 'Heart Rate',

                                            'bmi': 'BMI',
                                            'body mass index': 'BMI',

                                            // Liver enzymes
                                            'alt': 'ALT',
                                            'sgpt': 'ALT',
                                            'alanine aminotransferase': 'ALT',

                                            'ast': 'AST',
                                            'sgot': 'AST',
                                            'aspartate aminotransferase': 'AST',

                                            // Kidney & cardiac
                                            'creatinine': 'Creatinine',
                                            'creat': 'Creatinine',

                                            'troponin': 'Troponin',
                                            'trop': 'Troponin',
                                            'troponin i': 'Troponin',
                                            'troponin t': 'Troponin',

                                            'c-reactive protein': 'C-reactive Protein',
                                            'crp': 'C-reactive Protein',
                                            'c reactive protein': 'C-reactive Protein',

                                            'insulin': 'Insulin',
                                            'ins': 'Insulin'
                                        };

                                        // Normalize string for matching
                                        const normalize = (str) => str?.toString().toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');

                                        // Parse and normalize value
                                        const parseValue = (value, unit) => {
                                            if (!value) return '';
                                            let val = value.toString().replace(/,/g, ''); // Remove commas

                                            // Handle lakhs conversion (1 lakh = 100,000)
                                            if (unit && unit.toLowerCase().includes('lakh')) {
                                                val = (parseFloat(val) * 100000).toString();
                                            }

                                            return val;
                                        };

                                        const newFormData = { ...formData };
                                        let matchCount = 0;

                                        // Handle array of parameters (actual OCR format)
                                        if (ocrData.parameters && Array.isArray(ocrData.parameters)) {
                                            ocrData.parameters.forEach(param => {
                                                const paramName = normalize(param.parameter_name);
                                                const paramValue = parseValue(param.value, param.unit);

                                                // Try to find matching biomarker
                                                const matchedBiomarker = synonymMap[paramName];

                                                if (matchedBiomarker && biomarkers.includes(matchedBiomarker)) {
                                                    newFormData[matchedBiomarker] = paramValue;
                                                    matchCount++;
                                                    console.log(`[OCR] Mapped: ${param.parameter_name} -> ${matchedBiomarker} = ${paramValue}`);
                                                } else {
                                                    console.log(`[OCR] No match for: ${param.parameter_name}`);
                                                }
                                            });

                                            // Try to extract patient info
                                            if (ocrData.patient_info && ocrData.patient_info.name && !newFormData.patientName) {
                                                newFormData.patientName = ocrData.patient_info.name;
                                                console.log(`[OCR] Set patient name: ${ocrData.patient_info.name}`);
                                            }
                                        }

                                        setFormData(newFormData);

                                        if (matchCount > 0) {
                                            toast.success(`Report processed! Mapped ${matchCount} biomarker(s).`, { id: toastId });
                                        } else {
                                            toast.warning('Report processed but no matching biomarkers found.', { id: toastId });
                                        }

                                    } catch (error) {
                                        console.error('OCR Error:', error);
                                        toast.error('Failed to extract data from report', { id: toastId });
                                    } finally {
                                        e.target.value = '';
                                    }
                                }}
                            />
                            <Button
                                variant="outline"
                                className="bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-400 hover:text-slate-900 shadow-sm transition-all"
                                onClick={() => document.getElementById('report-upload').click()}
                            >
                                <Activity className="w-4 h-4 mr-2 text-slate-500" />
                                Upload Report
                            </Button>
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
                                                className="bg-white border-slate-200 focus:border-slate-400 focus:ring-slate-400 text-gray-900"
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
                                                className="bg-white border-slate-200 focus:border-slate-400 focus:ring-slate-400 text-gray-900"
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
                                    className="px-8 border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 hover:text-slate-900 transition-all"
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

            {/* Prediction Results Modal */}
            <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl text-slate-900">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                            Prediction Results
                        </DialogTitle>
                        <DialogDescription className="text-slate-700">
                            Disease prediction analysis based on biomarker data
                        </DialogDescription>
                    </DialogHeader>

                    {predictionResults && (
                        <div className="space-y-6 mt-4">
                            {/* Disease Prediction */}
                            <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-lg border border-slate-200">
                                <div>
                                    <p className="text-sm text-slate-700 font-medium mb-2">Predicted Disease</p>
                                    <h3 className="text-3xl font-bold text-slate-900">
                                        {predictionResults.prediction}
                                    </h3>
                                </div>
                            </div>

                            {/* Top Contributing Features */}
                            {predictionResults.topFeatures && predictionResults.topFeatures.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <h4 className="text-lg font-bold text-slate-900">Top Contributing Factors</h4>
                                    </div>
                                    <div className="space-y-4">
                                        {predictionResults.topFeatures.slice(0, 3).map((feature, index) => {
                                            // Calculate bar width as percentage (normalize to max value)
                                            const maxContribution = Math.max(...predictionResults.topFeatures.map(f => f.contribution));
                                            const widthPercentage = (feature.contribution / maxContribution) * 100;

                                            // Color gradient based on rank
                                            const colors = [
                                                'from-slate-500 to-slate-600',
                                                'from-slate-400 to-slate-500',
                                                'from-slate-300 to-slate-400'
                                            ];

                                            return (
                                                <div key={index} className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium text-slate-700">{feature.feature}</span>
                                                        <span className="text-xs text-slate-500">#{index + 1}</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 rounded-full h-8 overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${widthPercentage}%` }}
                                                            transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                                                            className={`h-full bg-gradient-to-r ${colors[index]} rounded-full flex items-center justify-end pr-3`}
                                                        >
                                                            <span className="text-white text-xs font-semibold opacity-0"></span>
                                                        </motion.div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Explanation */}
                            {predictionResults.explanation && (
                                <div>
                                    <h4 className="text-lg font-semibold text-slate-900 mb-3">Analysis Explanation</h4>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="text-slate-700 leading-relaxed">
                                            {predictionResults.explanation}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Action Button */}
                            <div className="flex justify-end pt-4 border-t border-slate-200">
                                <Button
                                    onClick={generatePDF}
                                    variant="outline"
                                    className="mr-3 border-slate-300 text-slate-700 hover:bg-slate-50"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Export Report
                                </Button>
                                <Button
                                    onClick={() => setShowResultModal(false)}
                                    className="bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700"
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Hidden content for PDF generation */}
                    {predictionResults && (
                        <div className="absolute left-[-9999px] top-0 w-[800px] bg-white p-8" id="prediction-report-content">
                            <div className="mb-8 border-b border-slate-200 pb-4">
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">Medical Prediction Report</h1>
                                <p className="text-slate-500">Generated by MediGuard AI</p>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Patient Name</p>
                                    <p className="text-xl font-bold text-slate-900">{formData.patientName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Patient ID</p>
                                    <p className="text-xl font-bold text-slate-900">{formData.patientId}</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
                                <p className="text-sm text-slate-500 font-medium mb-2">Predicted Condition</p>
                                <h2 className="text-4xl font-bold text-slate-900">{predictionResults.prediction}</h2>
                                <p className="text-slate-600 mt-2">Confidence Score: {(predictionResults.confidence * 100).toFixed(1)}%</p>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-slate-900 mb-4">Top Contributing Factors</h3>
                                <div className="space-y-4">
                                    {predictionResults.topFeatures && predictionResults.topFeatures.slice(0, 3).map((feature, index) => {
                                        const maxContribution = Math.max(...predictionResults.topFeatures.map(f => f.contribution));
                                        const widthPercentage = (feature.contribution / maxContribution) * 100;

                                        return (
                                            <div key={index} className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-slate-700">{feature.feature}</span>
                                                    <span className="text-sm text-slate-500">Impact Score: {feature.contribution.toFixed(3)}</span>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                                                    <div
                                                        style={{ width: `${widthPercentage}%` }}
                                                        className="h-full bg-slate-600 rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {predictionResults.explanation && (
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-4">Analysis Summary</h3>
                                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                                        <p className="text-slate-700 leading-relaxed text-lg">
                                            {predictionResults.explanation}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="mt-12 pt-8 border-t border-slate-200 text-center text-slate-400 text-sm">
                                <p>This report is generated by AI and should be reviewed by a medical professional.</p>
                                <p className="mt-1">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AddPatientPage;
