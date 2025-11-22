import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { User, Mail, Lock, CreditCard, ArrowRight } from 'lucide-react'

const SignupPage = () => {
    return (
        <div className="min-h-screen flex">
            {/* Left side - Image with enhanced overlay */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-700 via-slate-800 to-gray-900 items-center justify-center p-12 relative overflow-hidden">
                {/* Background image */}
                <img
                    src="/assets/pic1.avif"
                    alt="MediGuard AI - Medical Professional"
                    className="absolute inset-0 w-full h-full object-cover opacity-20"
                />
                {/* Gradient overlay for better contrast */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-700/80 via-slate-800/80 to-gray-900/80" />

                {/* Animated background elements */}
                <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '700ms' }} />

                {/* Content */}
                <div className="text-white text-center relative z-10 space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-5xl font-bold tracking-tight">MediGuard AI</h1>
                        <div className="h-1 w-24 bg-slate-400 mx-auto rounded-full" />
                    </div>
                    <p className="text-xl font-light opacity-90">Intelligent Triage Assistant</p>
                    <p className="text-sm opacity-75 max-w-md mx-auto leading-relaxed">
                        Empowering healthcare professionals with AI-driven insights for faster, more accurate patient triage decisions.
                    </p>
                </div>
            </div>

            {/* Right side - Signup form with enhanced design */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 overflow-y-auto">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border-0 my-8">
                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-gray-800 bg-clip-text text-transparent mb-2">
                            Create Account
                        </h2>
                        <p className="text-gray-600">Join MediGuard AI to assist in medical triage</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
                            <div className="relative group">
                                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-slate-600" />
                                <Input
                                    id="name"
                                    placeholder="Dr. Jane Doe"
                                    className="pl-11 h-12 border-gray-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="userid" className="text-sm font-medium text-gray-700">User ID</Label>
                            <div className="relative group">
                                <CreditCard className="absolute left-3 top-3 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-slate-600" />
                                <Input
                                    id="userid"
                                    placeholder="MG-2024-001"
                                    className="pl-11 h-12 border-gray-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-slate-600" />
                                <Input
                                    id="email"
                                    placeholder="doctor@hospital.com"
                                    type="email"
                                    className="pl-11 h-12 border-gray-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role" className="text-sm font-medium text-gray-700">Role</Label>
                            <Select>
                                <SelectTrigger className="h-12 border-gray-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-500 transition-all">
                                    <SelectValue placeholder="Select your role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="doctor">Doctor</SelectItem>
                                    <SelectItem value="nurse">Nurse</SelectItem>
                                    <SelectItem value="admin">Administrator</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-slate-600" />
                                <Input
                                    id="password"
                                    type="password"
                                    className="pl-11 h-12 border-gray-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-500 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <Button className="w-full h-12 bg-gradient-to-r from-slate-700 to-gray-800 hover:from-slate-800 hover:to-gray-900 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 group mt-6">
                            Sign Up
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>

                        <p className="text-sm text-center text-gray-600 mt-4">
                            Already have an account?{' '}
                            <Link to="/login" className="text-slate-600 hover:text-slate-700 font-semibold hover:underline transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SignupPage
