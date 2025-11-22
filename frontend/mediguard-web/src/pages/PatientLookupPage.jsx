import React from 'react';
import GlassmorphismHeader from '../components/GlassmorphismHeader';
import PatientLookup from '../components/PatientLookup';

const PatientLookupPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 overflow-x-hidden">
            {/* Animated Pill Header */}
            <GlassmorphismHeader />

            {/* Main Content with top padding for fixed header */}
            <div className="max-w-[1600px] mx-auto px-8 py-8 pt-24">
                <PatientLookup />
            </div>
        </div>
    );
};

export default PatientLookupPage;
