import React, { useState, useEffect, useMemo } from 'react';
import { getUsers, updateUser, registerUser } from '../../services/userService';
import type { User } from '../../types';

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [messageText, setMessageText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const refreshData = async () => {
        const allUsers = await getUsers();
        setUsers(allUsers);
        if (selectedUser) {
            setSelectedUser(allUsers.find(u => u.id === selectedUser.id) || null);
        }
    };

    useEffect(() => {
        getUsers().then(allUsers => {
            setUsers(allUsers);
            if (allUsers.length > 0) {
                setSelectedUser(allUsers[0]);
            }
        }).catch(err => {
            console.error('Failed to load users:', err);
        });
    }, []);

    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    const handleUserSelect = (user: User) => {
        setSelectedUser(user);
        setMessageText('');
    };

    const handleTogglePremium = async () => {
        if (!selectedUser) return;
        const updatedUser = { ...selectedUser, isPremium: !selectedUser.isPremium };
        await updateUser(updatedUser);
        refreshData();
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser || !messageText.trim()) return;

        const newMessage = {
            id: `msg_${Date.now()}`,
            text: messageText,
            timestamp: new Date().toISOString(),
            read: false,
        };

        const updatedUser = {
            ...selectedUser,
            messagesFromAdmin: [...selectedUser.messagesFromAdmin, newMessage],
        };

        await updateUser(updatedUser);
        refreshData();
        setMessageText('');
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName || !newEmail || !newPassword) {
            alert('All fields are required');
            return;
        }

        const result = await registerUser(newName, newEmail, newPassword); if (result.success) {
            refreshData();
            setIsCreateModalOpen(false);
            setNewName('');
            setNewEmail('');
            setNewPassword('');
            // Optional: Select the new user
            if (result.user) {
                setSelectedUser(result.user);
            }
        } else {
            alert(result.message);
        }
    };

    const renderUserDetails = () => {
        if (!selectedUser) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-white rounded-3xl shadow-sm border border-slate-100 p-12">
                    <i className="fas fa-user-friends text-6xl mb-4 text-slate-200"></i>
                    <p className="text-lg">Select a user to view details</p>
                </div>
            );
        }

        return (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-8 animate-fade-in h-full overflow-y-auto">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 text-2xl font-bold shadow-inner">
                            {selectedUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800 font-heading">{selectedUser.name}</h3>
                            <p className="text-sm text-slate-500 flex items-center gap-2">
                                <i className="fas fa-envelope text-slate-400"></i>
                                {selectedUser.email}
                            </p>
                        </div>
                    </div>
                    <span className={`px-4 py-2 text-sm font-bold rounded-xl flex items-center gap-2 shadow-sm ${selectedUser.isPremium
                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                        : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>
                        {selectedUser.isPremium ? <i className="fas fa-crown text-amber-500"></i> : <i className="fas fa-user"></i>}
                        {selectedUser.isPremium ? 'Premium Plan' : 'Standard Plan'}
                    </span>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="font-bold mb-4 text-slate-700 font-heading flex items-center gap-2">
                        <i className="fas fa-ruler-combined text-indigo-500"></i>
                        Physical Stats
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                            <span className="block text-2xl font-bold text-slate-800 font-heading">{selectedUser.age}</span>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Age</span>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                            <span className="block text-2xl font-bold text-slate-800 font-heading">{selectedUser.weight} <span className="text-sm text-slate-500 font-sans">kg</span></span>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Weight</span>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                            <span className="block text-2xl font-bold text-slate-800 font-heading">{selectedUser.height} <span className="text-sm text-slate-500 font-sans">cm</span></span>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Height</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-bold mb-4 text-slate-700 font-heading">Account Actions</h4>
                        <button
                            onClick={handleTogglePremium}
                            className={`w-full py-4 px-6 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-3 shadow-md ${selectedUser.isPremium
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:shadow-lg hover:-translate-y-0.5'
                                }`}
                        >
                            {selectedUser.isPremium ? (
                                <><i className="fas fa-ban"></i> Revoke Premium</>
                            ) : (
                                <><i className="fas fa-crown"></i> Grant Premium</>
                            )}
                        </button>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4 text-slate-700 font-heading">Current Plan</h4>
                        {selectedUser.activePlan ? (
                            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 h-[56px] flex items-center justify-between">
                                <p className="font-bold text-emerald-800 truncate mr-2">{selectedUser.activePlan.planTitle}</p>
                                <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                                    {selectedUser.progressData?.progressPercent || 0}%
                                </span>
                            </div>
                        ) : (
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-500 h-[56px] flex items-center justify-center italic text-sm">
                                No active plan assigned.
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                    <h4 className="font-bold mb-4 text-slate-700 font-heading flex items-center gap-2">
                        <i className="fas fa-paper-plane text-indigo-500"></i>
                        Send Private Message
                    </h4>
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                        <input
                            type="text"
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder={`Message ${selectedUser.name}...`}
                            className="flex-grow px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700 placeholder-slate-400"
                        />
                        <button
                            type="submit"
                            disabled={!messageText.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Send
                        </button>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-[calc(100vh-140px)] gap-6 animate-fade-in relative">
            <aside className="w-1/3 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-slate-800 font-heading">Registered Users</h2>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md transition-transform hover:-translate-y-0.5 flex items-center gap-1"
                        >
                            <i className="fas fa-plus"></i> New
                        </button>
                    </div>
                    <div className="relative">
                        <i className="fas fa-search absolute left-4 top-3.5 text-slate-400"></i>
                        <input
                            type="text"
                            placeholder="Search user..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700 placeholder-slate-400 text-sm"
                        />
                    </div>
                </div>
                <ul className="overflow-y-auto flex-1 p-2 space-y-1">
                    {filteredUsers.map(user => (
                        <li key={user.id}>
                            <button
                                onClick={() => handleUserSelect(user)}
                                className={`w-full text-left p-4 rounded-xl transition-all duration-200 flex items-center gap-3 ${selectedUser?.id === user.id
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                    : 'hover:bg-slate-50 text-slate-600'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${selectedUser?.id === user.id
                                    ? 'bg-white/20 text-white'
                                    : 'bg-indigo-50 text-indigo-600'
                                    }`}>
                                    {user.isPremium && <i className="fas fa-crown text-xxs absolute -top-1 -right-1 text-amber-400"></i>}
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className={`font-bold text-sm truncate ${selectedUser?.id === user.id ? 'text-white' : 'text-slate-800'}`}>{user.name}</p>
                                    <p className={`text-xs truncate ${selectedUser?.id === user.id ? 'text-indigo-200' : 'text-slate-400'}`}>{user.email}</p>
                                </div>
                                {user.isPremium && (
                                    <i className={`fas fa-star text-xs ${selectedUser?.id === user.id ? 'text-amber-300' : 'text-amber-400'}`}></i>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            </aside>
            <main className="flex-1">
                {renderUserDetails()}
            </main>

            {/* Create User Modal */}
            {isCreateModalOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsCreateModalOpen(false)}></div>
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-modal-pop border border-slate-100">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800 font-heading">Create New User</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                    placeholder="e.g. John Doe"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={e => setNewEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                    placeholder="e.g. john@example.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-200 hover:-translate-y-0.5"
                                >
                                    Create Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
