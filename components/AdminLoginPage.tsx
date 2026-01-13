import React, { useState } from 'react';

interface AdminLoginPageProps {
    onAdminLogin: (email: string, pass: string) => boolean;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onAdminLogin }) => {
    const [email, setEmail] = useState('admin@physcio.com');
    const [password, setPassword] = useState('password123');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = onAdminLogin(email, password);
        if (!success) {
            setError('Invalid admin credentials. Please try again.');
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-slate-100 p-4">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-200/40 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-slate-300/40 rounded-full blur-3xl animate-pulse [animation-delay:1.5s]"></div>
            </div>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-sm bg-white/90 backdrop-blur-xl border border-white/60 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>

                <div className="p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-indigo-50 text-indigo-600 text-2xl mb-4 border border-indigo-100 shadow-inner">
                            <i className="fas fa-shield-alt"></i>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 font-heading">
                            Admin Portal
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">
                            Restricted access area
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Admin Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium text-slate-700 placeholder-slate-400"
                                placeholder="admin@physcio.com"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium text-slate-700 placeholder-slate-400"
                                placeholder="Enter admin password"
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs font-semibold border border-red-100 flex items-center gap-2">
                                <i className="fas fa-ban"></i>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                        >
                            <i className="fas fa-key mr-2 opacity-50"></i>
                            Login to Console
                        </button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-slate-100">
                        <a href="/" className="inline-flex items-center text-xs font-medium text-slate-400 hover:text-indigo-600 transition-colors">
                            <i className="fas fa-arrow-left mr-1"></i>
                            Back to Patient Login
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;
