import React, { useState, useEffect } from 'react';
import type { AiProvider } from '../../App';
import type { User } from '../../types';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
    user: User;
    onUpdateUser: (user: User) => void;
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

type ModalTab = 'profile' | 'settings' | 'history';

const ProfileModal: React.FC<ProfileModalProps> = ({ 
    isOpen, 
    onClose, 
    onLogout,
    user,
    onUpdateUser, 
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
    const [activeTab, setActiveTab] = useState<ModalTab>('profile');
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    // State for User Profile Data
    const [userName, setUserName] = useState(user.name);
    const [userAge, setUserAge] = useState(user.age);
    const [userWeight, setUserWeight] = useState(user.weight);
    const [userHeight, setUserHeight] = useState(user.height);

    const loadProfileData = () => {
        setUserName(user.name);
        setUserAge(user.age);
        setUserWeight(user.weight);
        setUserHeight(user.height);
    };

    useEffect(() => {
        if (isOpen) {
            // Load AI settings
            setLocalProvider(aiProvider);
            setLocalGeminiKey(geminiApiKey);
            setLocalOpenAiKey(openAiApiKey);
            setLocalGroqKey(groqApiKey);
            setLocalCustomKey(customApiKey);
            setLocalCustomBaseUrl(customApiBaseUrl);
            setLocalCustomModel(customApiModel);

            // Load user profile data
            loadProfileData();
            
            // Reset UI state
            setSaveMessage(''); 
            setIsError(false);
            setActiveTab('profile');
            setIsEditingProfile(false);
        }
    }, [isOpen, user, aiProvider, geminiApiKey, openAiApiKey, groqApiKey, customApiKey, customApiBaseUrl, customApiModel]);
    
    if (!isOpen) return null;

    const handleAiSave = () => {
        setSaveMessage('');
        setIsError(false);

        if (localProvider === 'gemini' && !localGeminiKey.trim()) {
            setSaveMessage('Gemini API Key cannot be empty.');
            setIsError(true);
            return;
        }
        if (localProvider === 'openai' && !localOpenAiKey.trim()) {
            setSaveMessage('OpenAI API Key cannot be empty.');
            setIsError(true);
            return;
        }
        if (localProvider === 'groq' && !localGroqKey.trim()) {
            setSaveMessage('Groq API Key cannot be empty.');
            setIsError(true);
            return;
        }
        if (localProvider === 'custom') {
            if (!localCustomKey.trim() || !localCustomBaseUrl.trim() || !localCustomModel.trim()) {
                setSaveMessage('All custom provider fields are required.');
                setIsError(true);
                return;
            }
        }

        onAiSettingsSave(localProvider, localGeminiKey, localOpenAiKey, localGroqKey, localCustomKey, localCustomBaseUrl, localCustomModel);
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
        loadProfileData(); // Revert changes by reloading from props
        setIsEditingProfile(false);
    };
    
    const ModalTabButton = ({ tab, icon, label }: { tab: ModalTab; icon: string; label: string }) => (
        <button
            onClick={() => {
                setActiveTab(tab);
                setIsEditingProfile(false);
            }}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === tab ? 'bg-gray-200 text-[#00838f]' : 'text-gray-500 hover:bg-gray-100'}`}
        >
            <i className={`fas ${icon} mr-2`}></i>
            {label}
        </button>
    );

    const renderAiSettings = () => (
        <div className="animate-fade-in-fast">
            <h2 id="profile-modal-title" className="text-2xl font-bold text-[#37474f] text-center mb-4">AI Settings</h2>
            <div className="space-y-4">
                <div>
                    <label htmlFor="aiProviderSelect" className="block text-[#78909c] text-sm font-bold mb-2">
                        AI Provider
                    </label>
                    <select
                        id="aiProviderSelect"
                        value={localProvider}
                        onChange={(e) => setLocalProvider(e.target.value as AiProvider)}
                        className="w-full px-4 py-3 rounded-lg border border-[#e0e0e0] bg-white focus:outline-none focus:ring-2 focus:ring-[#00838f]"
                    >
                        <option value="gemini">Google Gemini</option>
                        <option value="openai">OpenAI (Not Implemented)</option>
                        <option value="groq">Groq (Not Implemented)</option>
                        <option value="custom">Custom (OpenAI-Compatible)</option>
                    </select>
                </div>
                {localProvider === 'gemini' && (
                     <div>
                        <label htmlFor="geminiApiKeyInput" className="block text-[#78909c] text-sm font-bold mb-2">API Key</label>
                        <input id="geminiApiKeyInput" type="password" value={localGeminiKey} onChange={(e) => setLocalGeminiKey(e.target.value)} placeholder="Enter your Gemini API key" className="w-full px-4 py-3 rounded-lg border border-[#e0e0e0] bg-white focus:outline-none focus:ring-2 focus:ring-[#00838f]" />
                    </div>
                )}
                {localProvider === 'openai' && (
                    <div>
                        <label htmlFor="openAiApiKeyInput" className="block text-[#78909c] text-sm font-bold mb-2">API Key</label>
                        <input id="openAiApiKeyInput" type="password" value={localOpenAiKey} onChange={(e) => setLocalOpenAiKey(e.target.value)} placeholder="Enter your OpenAI API key" className="w-full px-4 py-3 rounded-lg border border-[#e0e0e0] bg-white focus:outline-none focus:ring-2 focus:ring-[#00838f]" />
                    </div>
                )}
                {localProvider === 'groq' && (
                    <div>
                        <label htmlFor="groqApiKeyInput" className="block text-[#78909c] text-sm font-bold mb-2">API Key</label>
                        <input id="groqApiKeyInput" type="password" value={localGroqKey} onChange={(e) => setLocalGroqKey(e.target.value)} placeholder="Enter your Groq API key" className="w-full px-4 py-3 rounded-lg border border-[#e0e0e0] bg-white focus:outline-none focus:ring-2 focus:ring-[#00838f]" />
                    </div>
                )}
                {localProvider === 'custom' && (
                     <>
                        <div>
                            <label htmlFor="customApiKeyInput" className="block text-[#78909c] text-sm font-bold mb-2">API Key</label>
                            <input id="customApiKeyInput" type="password" value={localCustomKey} onChange={(e) => setLocalCustomKey(e.target.value)} placeholder="Enter your custom API key" className="w-full px-4 py-3 rounded-lg border border-[#e0e0e0] bg-white focus:outline-none focus:ring-2 focus:ring-[#00838f]" />
                        </div>
                        <div>
                            <label htmlFor="customApiBaseUrlInput" className="block text-[#78909c] text-sm font-bold mb-2">API Base URL</label>
                            <input id="customApiBaseUrlInput" type="text" value={localCustomBaseUrl} onChange={(e) => setLocalCustomBaseUrl(e.target.value)} placeholder="e.g., https://api.openai.com/v1" className="w-full px-4 py-3 rounded-lg border border-[#e0e0e0] bg-white focus:outline-none focus:ring-2 focus:ring-[#00838f]" />
                        </div>
                        <div>
                            <label htmlFor="customApiModelInput" className="block text-[#78909c] text-sm font-bold mb-2">Model Name</label>
                            <input id="customApiModelInput" type="text" value={localCustomModel} onChange={(e) => setLocalCustomModel(e.target.value)} placeholder="e.g., gpt-4o" className="w-full px-4 py-3 rounded-lg border border-[#e0e0e0] bg-white focus:outline-none focus:ring-2 focus:ring-[#00838f]" />
                        </div>
                    </>
                )}
                <p className="text-xs text-[#78909c] mt-2 text-center">
                    Your API keys are stored only in your browser's local storage.
                </p>
                <button
                    onClick={handleAiSave}
                    className="w-full bg-[#00bfa5] hover:bg-[#00a794] text-white font-bold py-2 px-4 rounded-lg focus:outline-none transition-colors"
                >
                    Save Settings
                </button>
                {saveMessage && <p className={`${isError ? 'text-red-600' : 'text-green-600'} text-xs text-center mt-2 animate-fade-in`}>{saveMessage}</p>}
            </div>
        </div>
    );

    const renderProfileView = () => (
         <div className="animate-fade-in-fast">
            <div className="text-center">
                <div className="w-24 h-24 rounded-full mx-auto bg-gray-200 flex items-center justify-center mb-4 ring-4 ring-[#00c4cc]/50">
                    <i className="fas fa-user text-5xl text-[#00838f]"></i>
                </div>
                <h2 id="profile-modal-title" className="text-2xl font-bold text-[#37474f]">{user.name}</h2>
                <p className="text-[#78909c]">{user.email}</p>
                {user.isPremium && (
                    <span className="mt-2 inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        <i className="fas fa-star mr-1"></i>Premium Member
                    </span>
                )}
            </div>
            
            <div className="mt-8 space-y-4">
                <div className="flex items-center bg-gray-100 p-3 rounded-lg">
                    <i className="fas fa-birthday-cake w-6 text-center text-[#78909c] mr-3"></i>
                    <span className="text-sm font-medium text-[#78909c] mr-2">Age:</span>
                    <span className="text-[#37474f] font-semibold">{user.age} years</span>
                </div>
                <div className="flex items-center bg-gray-100 p-3 rounded-lg">
                    <i className="fas fa-weight-hanging w-6 text-center text-[#78909c] mr-3"></i>
                    <span className="text-sm font-medium text-[#78909c] mr-2">Weight:</span>
                    <span className="text-[#37474f] font-semibold">{user.weight} kg</span>
                </div>
                <div className="flex items-center bg-gray-100 p-3 rounded-lg">
                    <i className="fas fa-ruler-vertical w-6 text-center text-[#78909c] mr-3"></i>
                    <span className="text-sm font-medium text-[#78909c] mr-2">Height:</span>
                    <span className="text-[#37474f] font-semibold">{user.height} cm</span>
                </div>
            </div>

            <div className="mt-8 space-y-3">
                <button
                    onClick={() => setIsEditingProfile(true)}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-[#37474f] font-bold py-3 px-4 rounded-lg focus:outline-none transition-colors"
                >
                    <i className="fas fa-edit mr-2"></i>
                    Edit Profile
                </button>
                <button
                    onClick={onLogout}
                    className="w-full bg-[#f44336] hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none transition-colors"
                >
                    <i className="fas fa-sign-out-alt mr-2"></i>
                    Logout
                </button>
            </div>
        </div>
    );

     const renderProfileEdit = () => (
         <div className="animate-fade-in-fast">
            <h2 className="text-2xl font-bold text-[#37474f] text-center mb-6">Edit Profile</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-[#78909c] text-sm font-bold mb-2">Name</label>
                    <input type="text" value={userName} onChange={e => setUserName(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <label className="block text-[#78909c] text-sm font-bold mb-2">Age</label>
                        <input type="number" value={userAge} onChange={e => setUserAge(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white" />
                    </div>
                    <div>
                        <label className="block text-[#78909c] text-sm font-bold mb-2">Weight (kg)</label>
                        <input type="number" value={userWeight} onChange={e => setUserWeight(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white" />
                    </div>
                     <div>
                        <label className="block text-[#78909c] text-sm font-bold mb-2">Height (cm)</label>
                        <input type="number" value={userHeight} onChange={e => setUserHeight(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white" />
                    </div>
                </div>
            </div>
            <div className="mt-8 flex gap-3">
                <button
                    onClick={handleCancelEdit}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-[#37474f] font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                 <button
                    onClick={handleProfileSave}
                    className="w-full bg-[#00bfa5] hover:bg-[#00a794] text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
    
    const renderHistoryView = () => (
        <div className="animate-fade-in-fast">
            <h2 className="text-2xl font-bold text-[#37474f] text-center mb-4">Activity History</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {user.planHistory && user.planHistory.length > 0 ? (
                    user.planHistory.slice().reverse().map((item, index) => (
                         <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                             <div className="flex justify-between items-start">
                                <h3 className="font-semibold text-[#37474f] pr-2">{item.planTitle}</h3>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${
                                    item.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
                                }`}>
                                    {item.status}
                                </span>
                            </div>
                            <p className="text-sm text-[#78909c] mt-1">
                                Finished on: {new Date(item.completedDate).toLocaleDateString()}
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="text-center p-8 bg-gray-50 rounded-lg">
                        <i className="fas fa-history text-4xl text-gray-400 mb-3"></i>
                        <p className="text-[#78909c]">Your completed exercise plans will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );


    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in-fast"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-modal-title"
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative transform transition-all duration-300 scale-95 animate-modal-pop"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
                    aria-label="Close profile modal"
                >
                    <i className="fas fa-times text-2xl"></i>
                </button>
                
                <div className="p-1 mb-6 flex justify-center rounded-lg bg-gray-100">
                    <ModalTabButton tab="profile" icon="fa-user" label="Profile" />
                    <ModalTabButton tab="history" icon="fa-history" label="History" />
                    <ModalTabButton tab="settings" icon="fa-cog" label="Settings" />
                </div>
                
                <div className="px-2">
                    {activeTab === 'profile' && (isEditingProfile ? renderProfileEdit() : renderProfileView())}
                    {activeTab === 'settings' && renderAiSettings()}
                    {activeTab === 'history' && renderHistoryView()}
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;