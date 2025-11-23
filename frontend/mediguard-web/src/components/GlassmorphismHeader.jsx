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
                    className="flex items-center gap-3 cursor-pointer flex-shrink-0 group transition-all duration-300"
                    onClick={() => navigate("/nurse-dashboard")}
                >
                    <img
                        src="/assets/logo.png"
                        alt="MediGuard Logo"
                        className="w-10 h-10 object-contain transition-transform group-hover:-translate-y-0.5"
                    />
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
