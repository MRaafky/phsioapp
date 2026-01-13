import React, { useState } from 'react';
import AdminDashboard from './AdminDashboard';
import AdminUsers from './AdminUsers';
import AdminContent from './AdminContent';
import AdminJournals from './AdminJournals';

interface AdminPanelProps {
    onLogout: () => void;
}

type AdminTab = 'dashboard' | 'users' | 'content' | 'journals';

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'dashboard':
                return <AdminDashboard onNavigate={setActiveTab} />;
            case 'users':
                return <AdminUsers />;
            case 'content':
                return <AdminContent />;
            case 'journals':
                return <AdminJournals />;
            default:
                return <AdminDashboard onNavigate={setActiveTab} />;
        }
    };

    const NavLink = ({ tab, icon, label }: { tab: AdminTab, icon: string, label: string }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex items-center w-full px-4 py-3.5 text-left rounded-xl transition-all duration-200 group ${activeTab === tab
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                : 'text-indigo-200 hover:bg-slate-800 hover:text-white'
                }`}
        >
            <i className={`fas ${icon} w-6 text-center mr-3 transition-transform group-hover:scale-110 ${activeTab === tab ? 'text-white' : 'text-indigo-400 group-hover:text-white'}`}></i>
            <span className="font-medium">{label}</span>
        </button>
    )

    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl z-10">
                <div className="p-8 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                            <i className="fas fa-shield-alt text-xl"></i>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold font-heading tracking-wide">Physio Admin</h2>
                            <p className="text-xs text-indigo-300">Control Center</p>
                        </div>
                    </div>
                </div>
                <nav className="flex-grow p-6 space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">Main Menu</p>
                    <NavLink tab="dashboard" icon="fa-chart-pie" label="Dashboard" />
                    <NavLink tab="users" icon="fa-users" label="User Management" />

                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-8 mb-4 px-2">Content</p>
                    <NavLink tab="content" icon="fa-bullhorn" label="Announcements" />
                    <NavLink tab="journals" icon="fa-book-open" label="Medical Journals" />
                </nav>
                <div className="p-6 border-t border-slate-800">
                    <button
                        onClick={onLogout}
                        className="flex items-center w-full px-4 py-3.5 text-left rounded-xl transition-all duration-200 text-slate-400 hover:bg-red-500/10 hover:text-red-400 group"
                    >
                        <i className="fas fa-sign-out-alt w-6 text-center mr-3 group-hover:text-red-400"></i>
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 p-6 sticky top-0 z-20">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 capitalize font-heading">
                                {activeTab === 'content' ? 'Announcements & Messages' : activeTab}
                            </h1>
                            <p className="text-sm text-slate-500 mt-1">
                                Manage and monitor your application
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                                <i className="fas fa-bell"></i>
                            </div>
                            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-800">Admin User</p>
                                    <p className="text-xs text-slate-500">Super Admin</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200">
                                    AD
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-8">
                    {renderActiveTab()}
                </main>
            </div>
        </div>
    );
};

export default AdminPanel;