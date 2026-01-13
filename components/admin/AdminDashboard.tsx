import React, { useState, useEffect } from 'react';
import { getUsers } from '../../services/userService';
import type { User } from '../../types';

const AdminDashboard: React.FC<{ onNavigate: (tab: 'dashboard' | 'users' | 'content' | 'journals') => void }> = ({ onNavigate }) => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        premiumUsers: 0,
    });

    useEffect(() => {
        getUsers().then(allUsers => {
            const premiumCount = allUsers.filter(u => u.isPremium).length;
            setStats({
                totalUsers: allUsers.length,
                premiumUsers: premiumCount,
            });
        }).catch(err => {
            console.error('Failed to load users:', err);
        });
    }, []);

    const premiumPercentage = stats.totalUsers > 0
        ? ((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)
        : 0;

    const handleExportData = () => {
        const data = localStorage.getItem('physcio_app_data');
        if (data) {
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `physio_connect_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else {
            alert('No data to export.');
        }
    };

    const StatCard = ({ icon, title, value, colorClass, trend }: { icon: string, title: string, value: string | number, colorClass: string, trend?: string }) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
                    <i className={`fas ${icon} text-xl text-white`}></i>
                </div>
                {trend && (
                    <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2 py-1 rounded-lg">
                        <i className="fas fa-arrow-up mr-1"></i> {trend}
                    </span>
                )}
            </div>
            <div>
                <h3 className="text-3xl font-bold text-slate-800 font-heading mb-1">{value}</h3>
                <p className="text-slate-500 text-sm font-medium">{title}</p>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in space-y-8">
            <h2 className="text-xl font-bold text-slate-800 font-heading">Performance Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    icon="fa-users"
                    title="Total Registered Users"
                    value={stats.totalUsers}
                    colorClass="bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30"
                    trend="12% vs last month"
                />
                <StatCard
                    icon="fa-crown"
                    title="Premium Subscribers"
                    value={stats.premiumUsers}
                    colorClass="bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30"
                    trend="5% new today"
                />
                <StatCard
                    icon="fa-chart-pie"
                    title="Conversion Rate"
                    value={`${premiumPercentage}%`}
                    colorClass="bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Welcome Card */}
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl -ml-12 -mb-12"></div>

                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold mb-4 font-heading">Welcome back, Admin!</h3>
                        <p className="text-indigo-100 mb-6 leading-relaxed max-w-md">
                            Everything looks good today. You have new activity to review.
                        </p>
                        <button onClick={() => onNavigate('users')} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-indigo-900/50">
                            Check Activity
                        </button>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 font-heading">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => onNavigate('users')}
                            className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-600 transition-all text-left group"
                        >
                            <div className="bg-white w-10 h-10 rounded-lg flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                <i className="fas fa-user-plus text-slate-400 group-hover:text-indigo-500"></i>
                            </div>
                            <span className="font-semibold text-slate-600 group-hover:text-indigo-700 text-sm">Manage Users</span>
                        </button>
                        <button
                            onClick={() => onNavigate('content')}
                            className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-emerald-50 hover:border-emerald-100 hover:text-emerald-600 transition-all text-left group"
                        >
                            <div className="bg-white w-10 h-10 rounded-lg flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                <i className="fas fa-bullhorn text-slate-400 group-hover:text-emerald-500"></i>
                            </div>
                            <span className="font-semibold text-slate-600 group-hover:text-emerald-700 text-sm">Post Update</span>
                        </button>
                        <button
                            onClick={handleExportData}
                            className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-sky-50 hover:border-sky-100 hover:text-sky-600 transition-all text-left group"
                        >
                            <div className="bg-white w-10 h-10 rounded-lg flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                <i className="fas fa-file-export text-slate-400 group-hover:text-sky-500"></i>
                            </div>
                            <span className="font-semibold text-slate-600 group-hover:text-sky-700 text-sm">Export Data</span>
                        </button>
                        <button className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-amber-50 hover:border-amber-100 hover:text-amber-600 transition-all text-left group opacity-50 cursor-not-allowed" title="Coming Soon">
                            <div className="bg-white w-10 h-10 rounded-lg flex items-center justify-center shadow-sm mb-3">
                                <i className="fas fa-cog text-slate-400"></i>
                            </div>
                            <span className="font-semibold text-slate-600 text-sm">Settings</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
