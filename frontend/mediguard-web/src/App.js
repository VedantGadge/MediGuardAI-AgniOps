import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import NurseDashboard from './pages/NurseDashboard';
import PatientLookupPage from './pages/PatientLookupPage';
import AddPatientPage from './pages/AddPatientPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/nurse-dashboard" element={<NurseDashboard />} />
        <Route path="/patient-lookup" element={<PatientLookupPage />} />
        <Route path="/add-patient" element={<AddPatientPage />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
