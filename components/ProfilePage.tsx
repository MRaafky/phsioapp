import React, { useState } from 'react';
import type { AiProvider } from '../App';
import type { User } from '../types';

interface ProfilePageProps {
    user: User;
    onUpdateUser: (user: User) => void;
    onLogout: () => void;
    aiProvider: AiProvider;
    geminiApiKey: string;
    openAiApiKey: string;
    groqApiKey: string;
    customApiKey: string;
    customApiBaseUrl: string;
    customApiModel: string;
    onAiSettingsSave: (
        provider: AiProvider,
        geminiKey: string,
        openAiKey: string,
        groqKey: string,
        customKey: string,
        customBaseUrl: string,
        customModel: string
    ) => void;
}

type ProfileTab = 'profile' | 'settings' | 'history';

const ProfilePage: React.FC<ProfilePageProps> = ({
    user,
    onUpdateUser,
    onLogout,
    aiProvider,
    geminiApiKey,
    openAiApiKey,
    groqApiKey,
    customApiKey,
    customApiBaseUrl,
    customApiModel,
    onAiSettingsSave
}) => {
    // State for AI Settings
    const [localProvider, setLocalProvider] = useState<AiProvider>(aiProvider);
    const [localGeminiKey, setLocalGeminiKey] = useState(geminiApiKey);
    const [localOpenAiKey, setLocalOpenAiKey] = useState(openAiApiKey);
    const [localGroqKey, setLocalGroqKey] = useState(groqApiKey);
    const [localCustomKey, setLocalCustomKey] = useState(customApiKey);
    const [localCustomBaseUrl, setLocalCustomBaseUrl] = useState(customApiBaseUrl);
    const [localCustomModel, setLocalCustomModel] = useState(customApiModel);
    const [saveMessage, setSaveMessage] = useState('');
    const [isError, setIsError] = useState(false);

    // State for UI control
    const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    // State for User Profile Data
    const [userName, setUserName] = useState(user.name);
    const [userAge, setUserAge] = useState(user.age);
    const [userWeight, setUserWeight] = useState(user.weight);
    const [userHeight, setUserHeight] = useState(user.height);

    const handleAiSave = () => {
        setSaveMessage('');
        setIsError(false);
        // ... (validation logic as before but cleaner structure if needed, keeping existing logic for now)
        if (localProvider === 'gemini' && !localGeminiKey.trim()) {
            setSaveMessage('Gemini API Key cannot be empty.');
            setIsError(true);
            return;
        }

        onAiSettingsSave('gemini', localGeminiKey, localOpenAiKey, localGroqKey, localCustomKey, localCustomBaseUrl, localCustomModel);
        setSaveMessage('Settings saved successfully!');
        setIsError(false);
        setTimeout(() => setSaveMessage(''), 3000);
    };

    const handleProfileSave = () => {
        onUpdateUser({
            ...user,
            name: userName,
            age: userAge,
            weight: userWeight,
            height: userHeight,
        });
        setIsEditingProfile(false);
    };

    const handleCancelEdit = () => {
        setUserName(user.name);
        setUserAge(user.age);
        setUserWeight(user.weight);
        setUserHeight(user.height);
        setIsEditingProfile(false);
    };

    const TabButton = ({ tab, icon, label }: { tab: ProfileTab; icon: string; label: string }) => (
        <button
            onClick={() => {
                setActiveTab(tab);
                setIsEditingProfile(false);
            }}
            className={`flex-1 py-3 px-4 text-sm font-semibold rounded-xl transition-all duration-300 ${activeTab === tab
                ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-black/5'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
        >
            <i className={`fas ${icon} mr-2`}></i>
            {label}
        </button>
    );

    const renderAiSettings = () => (
        <div className="animate-fade-in space-y-6">
            <h3 className="text-xl font-bold text-slate-800 font-heading">
                <i className="fas fa-key text-emerald-500 mr-2"></i>
                Token Premium Settings
            </h3>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                <div>
                    <label htmlFor="geminiApiKeyInput" className="block text-slate-700 text-sm font-bold mb-2">
                        API Token
                    </label>
                    <input
                        id="geminiApiKeyInput"
                        type="password"
                        value={localGeminiKey}
                        onChange={(e) => setLocalGeminiKey(e.target.value)}
                        placeholder="Enter your API token"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    />
                </div>

                <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl text-emerald-800 text-sm">
                    <i className="fas fa-shield-alt mt-1"></i>
                    <p>Your API key is stored securely in your browser's local storage. We do not save it on any server.</p>
                </div>

                <div className="pt-2">
                    <button
                        onClick={handleAiSave}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                        <i className="fas fa-save mr-2"></i>
                        Save Settings
                    </button>
                </div>

                {saveMessage && (
                    <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${isError ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'
                        }`}>
                        <i className={`fas ${isError ? 'fa-exclamation-circle' : 'fa-check-circle'}`}></i>
                        {saveMessage}
                    </div>
                )}
            </div>
        </div>
    );

    const renderProfileView = () => (
        <div className="animate-fade-in">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-6 text-center">
                <div className="w-28 h-28 rounded-full mx-auto bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-4 ring-4 ring-white shadow-lg">
                    <i className="fas fa-user text-5xl text-emerald-600"></i>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-1 font-heading">
                    {user.name}
                </h3>
                <p className="text-slate-500 mb-3 font-medium">
                    {user.email}
                </p>
                {user.isPremium && (
                    <span className="inline-flex items-center bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-amber-100">
                        <i className="fas fa-crown mr-1.5 text-amber-500"></i>
                        Premium Member
                    </span>
                )}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: 'Age', value: `${user.age} years`, icon: 'fa-birthday-cake' },
                    { label: 'Weight', value: `${user.weight} kg`, icon: 'fa-weight-hanging' },
                    { label: 'Height', value: `${user.height} cm`, icon: 'fa-ruler-vertical' }
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                        <div className="w-10 h-10 mx-auto bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 mb-2">
                            <i className={`fas ${stat.icon}`}></i>
                        </div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                        <p className="text-slate-800 font-bold">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="space-y-3">
                <button
                    onClick={() => setIsEditingProfile(true)}
                    className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3.5 px-4 rounded-xl transition-all duration-300"
                >
                    <i className="fas fa-edit mr-2"></i>
                    Edit Profile
                </button>
                <button
                    onClick={onLogout}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3.5 px-4 rounded-xl transition-all duration-300"
                >
                    <i className="fas fa-sign-out-alt mr-2"></i>
                    Logout
                </button>
            </div>
        </div>
    );

    const renderProfileEdit = () => (
        <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-slate-800 mb-6 font-heading">
                <i className="fas fa-user-edit text-emerald-500 mr-2"></i>
                Edit Profile
            </h3>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-5">
                <div>
                    <label htmlFor="edit-name" className="block text-slate-700 text-sm font-bold mb-2">
                        Full Name
                    </label>
                    <input
                        id="edit-name"
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                    />
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="edit-age" className="block text-slate-700 text-sm font-bold mb-2">
                            Age
                        </label>
                        <input
                            id="edit-age"
                            type="number"
                            value={userAge}
                            onChange={(e) => setUserAge(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-weight" className="block text-slate-700 text-sm font-bold mb-2">
                            Weight (kg)
                        </label>
                        <input
                            id="edit-weight"
                            type="number"
                            value={userWeight}
                            onChange={(e) => setUserWeight(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-height" className="block text-slate-700 text-sm font-bold mb-2">
                            Height (cm)
                        </label>
                        <input
                            id="edit-height"
                            type="number"
                            value={userHeight}
                            onChange={(e) => setUserHeight(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-6 flex gap-3">
                <button
                    onClick={handleCancelEdit}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-3.5 px-4 rounded-xl transition-all duration-300"
                >
                    Cancel
                </button>
                <button
                    onClick={handleProfileSave}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );

    const renderHistoryView = () => (
        <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-slate-800 mb-6 font-heading">
                <i className="fas fa-history text-emerald-500 mr-2"></i>
                Activity History
            </h3>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {user.planHistory && user.planHistory.length > 0 ? (
                    user.planHistory
                        .slice()
                        .reverse()
                        .map((item, index) => (
                            <div key={index} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-bold text-slate-800 pr-2 font-heading">
                                        {item.planTitle}
                                    </h4>
                                    <span
                                        className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${item.status === 'Completed'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-slate-100 text-slate-600'
                                            }`}
                                    >
                                        {item.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                                    <div className="flex items-center">
                                        <i className="fas fa-calendar-alt mr-1.5 opacity-70"></i>
                                        {new Date(item.completedDate).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center">
                                        <i className="fas fa-clock mr-1.5 opacity-70"></i>
                                        {item.durationWeeks} weeks
                                    </div>
                                </div>
                            </div>
                        ))
                ) : (
                    <div className="text-center p-12 bg-white rounded-3xl border border-slate-100 border-dashed">
                        <div className="w-16 h-16 mx-auto mb-4 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                            <i className="fas fa-history text-2xl"></i>
                        </div>
                        <p className="text-slate-500 font-medium">
                            No history yet. Complete a plan to see it here!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto">
            {/* Tab Navigation */}
            <div className="p-1.5 mb-8 flex gap-1 rounded-2xl bg-slate-100/50">
                <TabButton tab="profile" icon="fa-user" label="Profile" />
                <TabButton tab="history" icon="fa-history" label="History" />
                <TabButton tab="settings" icon="fa-cog" label="Settings" />
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'profile' && (isEditingProfile ? renderProfileEdit() : renderProfileView())}
                {activeTab === 'settings' && renderAiSettings()}
                {activeTab === 'history' && renderHistoryView()}
            </div>
        </div>
    );
};

export default ProfilePage;
