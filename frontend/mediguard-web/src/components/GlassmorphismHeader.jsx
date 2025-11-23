import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const navItems = [
    { id: "dashboard", label: "Dashboard", path: "/nurse-dashboard" },
    { id: "patient-lookup", label: "Patient Lookup", path: "/patient-lookup" },
    { id: "add-patient", label: "Add Patient", path: "/add-patient" },
];

const AnimatedGlassHeader = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);

    const activeTab = navItems.find(
        (item) => item.path === location.pathname
    )?.id || "dashboard";

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center transition-all duration-[350ms] ease-in-out ${isScrolled ? "py-2" : "py-5"
            }`}>
            <div className={`
                flex items-center relative transition-all duration-[350ms] ease-in-out
                ${isScrolled
                    ? "w-fit max-w-none px-6 py-3 gap-5 bg-white/70 backdrop-blur-xl rounded-full shadow-lg border border-white/20"
                    : "w-full max-w-[1400px] px-8 py-0 gap-8 justify-between"
                }
            `}>

                {/* LOGO */}
                <div
                    className="flex items-center gap-2 cursor-pointer flex-shrink-0 group transition-all duration-300"
                    onClick={() => navigate("/nurse-dashboard")}
                >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-md transition-transform group-hover:-translate-y-0.5">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <span className="text-xl font-black bg-gradient-to-r from-slate-500 to-slate-600 bg-clip-text text-transparent tracking-tight">
                        MediGuard
                    </span>
                </div>

                {/* NAVIGATION */}
                <div className="relative flex items-center gap-1 bg-white/40 backdrop-blur-2xl px-3 py-2 rounded-full border border-white/30">
                    {navItems.map((item) => {
                        const isActive = activeTab === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => navigate(item.path)}
                                className="relative px-5 py-2 font-semibold text-sm"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-pill"
                                        className="absolute inset-0 bg-gradient-to-r from-slate-500 to-slate-600 rounded-full shadow-lg"
                                        transition={{
                                            type: "spring",
                                            stiffness: 350,
                                            damping: 25
                                        }}
                                    />
                                )}

                                <span className={`relative z-10 transition-colors ${isActive ? "text-white" : "text-gray-700"
                                    }`}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* LOGOUT */}
                <button
                    onClick={handleLogout}
                    className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold text-sm rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex-shrink-0"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default AnimatedGlassHeader;
