import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AnimatedPillHeader = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Determine active tab based on current route
    const getActiveTab = () => {
        if (location.pathname === '/nurse-dashboard') return 'dashboard';
        if (location.pathname === '/patient-lookup') return 'patient-lookup';
        if (location.pathname === '/add-patient') return 'add-patient';
        return 'dashboard';
    };

    const activeTab = getActiveTab();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', path: '/nurse-dashboard' },
        { id: 'patient-lookup', label: 'Patient Lookup', path: '/patient-lookup' },
        { id: 'add-patient', label: 'Add Patient', path: '/add-patient' }
    ];

    const handleNavigation = (path) => {
        navigate(path);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center transition-all duration-[350ms] ease-in-out ${isScrolled ? 'py-2' : 'py-5'
                }`}
        >
            <div
                className={`
                    flex items-center relative
                    ${isScrolled
                        ? 'w-fit max-w-none px-6 py-3 gap-5 bg-white/70 backdrop-blur-xl rounded-full shadow-lg justify-center'
                        : 'w-full max-w-[1400px] px-8 py-0 gap-8 justify-between'
                    }
                `}
                style={{
                    transition: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1), width 350ms cubic-bezier(0.4, 0, 0.2, 1), gap 350ms cubic-bezier(0.4, 0, 0.2, 1), padding 350ms cubic-bezier(0.4, 0, 0.2, 1)',
                }}
            >
                {/* Logo/Brand */}
                <div className="flex items-center gap-2 flex-shrink-0 cursor-pointer group transition-all duration-300">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md transition-transform group-hover:-translate-y-0.5">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <span className="text-xl font-black bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent tracking-tight transition-all duration-300">
                        MediGuard
                    </span>
                </div>

                {/* Navigation Links */}
                <div
                    className="flex items-center"
                    style={{
                        gap: isScrolled ? '1.25rem' : '1.5rem',
                        transition: 'gap 350ms cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                >
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleNavigation(item.path)}
                            className="relative group"
                        >
                            <span className={`
                                text-[15px] font-semibold transition-colors duration-300 whitespace-nowrap
                                ${activeTab === item.id ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'}
                            `}>
                                {item.label}
                            </span>
                            <span
                                className={`
                                    absolute -bottom-1 left-0 h-[2.5px] bg-gradient-to-r from-blue-500 to-blue-600 rounded-full
                                    transition-all duration-300 origin-left
                                    ${activeTab === item.id ? 'w-full' : 'w-0 group-hover:w-full'}
                                `}
                            />
                        </button>
                    ))}
                </div>

                {/* CTA Button */}
                <button 
                    onClick={handleLogout}
                    className="relative px-6 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold text-sm rounded-full shadow-lg shadow-rose-500/25 overflow-hidden group flex-shrink-0 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-rose-500/30"
                >
                    <span className="relative z-10 whitespace-nowrap">
                        Logout
                    </span>
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                </button>
            </div>
        </nav>
    );
};

export default AnimatedPillHeader;
