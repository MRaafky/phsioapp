import React, { useState, useEffect, useRef } from 'react';
import Home from './features/Home';
import ExerciseFit from './features/ExerciseFit';
import NearTherapy from './features/NearTherapy';
import PostureIQ from './features/PostureIQ';
import TelePhysio from './features/TelePhysio';
import JournalLink from './features/JournalLink';
import ProfilePage from './ProfilePage';
import NavItem from './shared/NavItem';
import PremiumModal from './shared/PremiumModal';
import type { AiProvider } from '../App';
import type { ExercisePlan, User, PlanHistoryItem } from '../types';

type Tab = 'home' | 'exercise' | 'posture' | 'therapy' | 'journal' | 'tele' | 'profile';

interface DashboardProps {
    user: User;
    onUpdateUser: (user: User) => void;
    onLogout: () => void;
    onNavigateToPayment?: () => void;
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

const TABS: { [key in Tab]: { title: string; component: React.FC<any>; icon: string; isPremium?: boolean } } = {
    home: { title: "Dashboard", component: Home, icon: "fa-home" },
    exercise: { title: "Exercise Fit", component: ExerciseFit, icon: "fa-dumbbell" },
    posture: { title: "Posture IQ", component: PostureIQ, icon: "fa-user-check", isPremium: true },
    therapy: { title: "Near Therapy", component: NearTherapy, icon: "fa-map-location-dot" },
    journal: { title: "Journal Link", component: JournalLink, icon: "fa-book-open" },
    tele: { title: "TelePhysio", component: TelePhysio, icon: "fa-video", isPremium: true },
    profile: { title: "Profile", component: ProfilePage, icon: "fa-user-cog" },
};

const NAV_ITEMS: Tab[] = ['home', 'exercise', 'posture', 'therapy', 'profile'];

const Dashboard: React.FC<DashboardProps> = ({
    user,
    onUpdateUser,
    onLogout,
    onNavigateToPayment,
    aiProvider,
    geminiApiKey,
    openAiApiKey,
    groqApiKey,
    customApiKey,
    customApiBaseUrl,
    customApiModel,
    onAiSettingsSave
}) => {
    const [activeTab, setActiveTab] = useState<Tab>('home');
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
    const [showScrollTopButton, setShowScrollTopButton] = useState(false);
    const mainContentRef = useRef<HTMLElement>(null);

    const activePlan = user.activePlan;
    const progressData = user.progressData;

    useEffect(() => {
        const mainEl = mainContentRef.current;
        if (!mainEl) return;

        const handleScroll = () => {
            if (mainEl.scrollTop > 300) {
                setShowScrollTopButton(true);
            } else {
                setShowScrollTopButton(false);
            }
        };

        mainEl.addEventListener('scroll', handleScroll);

        return () => {
            mainEl.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        mainContentRef.current?.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const updateProgress = () => {
        if (!progressData || !activePlan) return;

        const totalSessions = progressData.totalWeeks * progressData.sessionsPerWeek;

        if (progressData.completedSessions >= totalSessions) {
            alert("This program is already complete!");
            return;
        }

        const newCompletedSessions = progressData.completedSessions + 1;

        // Check if this session completes the plan
        if (newCompletedSessions >= totalSessions) {
            const historyItem: PlanHistoryItem = {
                planTitle: activePlan.planTitle,
                durationWeeks: activePlan.durationWeeks,
                completedDate: new Date().toISOString(),
                status: 'Completed',
            };
            const updatedHistory = [...(user.planHistory || []), historyItem];
            onUpdateUser({ ...user, activePlan: null, progressData: null, planHistory: updatedHistory });
            alert("Congratulations! You've completed your exercise program.");
            return;
        }

        // Standard progress update
        const newProgressPercent = Math.round((newCompletedSessions / totalSessions) * 100);

        const newWeeklyCompletions = [...progressData.weeklyCompletions];
        const weekIndexToUpdate = Math.floor(progressData.completedSessions / progressData.sessionsPerWeek);

        if (weekIndexToUpdate < newWeeklyCompletions.length) {
            const sessionsInPreviousWeeks = weekIndexToUpdate * progressData.sessionsPerWeek;
            const sessionsCompletedInCurrentWeek = progressData.completedSessions - sessionsInPreviousWeeks;
            newWeeklyCompletions[weekIndexToUpdate] = sessionsCompletedInCurrentWeek + 1;
        }

        const newCurrentWeek = Math.min(progressData.totalWeeks, Math.floor(newCompletedSessions / progressData.sessionsPerWeek) + 1);

        const newProgress = {
            ...progressData,
            completedSessions: newCompletedSessions,
            currentWeek: newCurrentWeek,
            progressPercent: newProgressPercent,
            weeklyCompletions: newWeeklyCompletions,
        };

        onUpdateUser({ ...user, progressData: newProgress });
    };

    const handleAcceptPlan = (plan: ExercisePlan) => {
        let updatedHistory = user.planHistory || [];

        // If there's an active plan, move it to history as 'Replaced'
        if (user.activePlan) {
            const historyItem: PlanHistoryItem = {
                planTitle: user.activePlan.planTitle,
                durationWeeks: user.activePlan.durationWeeks,
                completedDate: new Date().toISOString(),
                status: 'Replaced',
            };
            updatedHistory = [...updatedHistory, historyItem];
        }

        const newProgress = {
            progressPercent: 0,
            currentWeek: 1,
            completedSessions: 0,
            totalWeeks: plan.durationWeeks,
            sessionsPerWeek: 3, // Default sessions per week
            weeklyCompletions: Array(plan.durationWeeks).fill(0),
        };

        onUpdateUser({ ...user, activePlan: plan, progressData: newProgress, planHistory: updatedHistory });
        alert("Program added to your dashboard!");
        setActiveTab('home');
    };

    const handleHomeNavigation = (tab: Tab) => {
        const isPremiumFeature = TABS[tab].isPremium;
        if (isPremiumFeature && !user.isPremium) {
            setIsPremiumModalOpen(true);
        } else {
            setActiveTab(tab);
        }
    };

    const handleNavClick = (tabKey: Tab) => {
        const isPremiumFeature = TABS[tabKey].isPremium;
        if (isPremiumFeature && !user.isPremium) {
            setIsPremiumModalOpen(true);
        } else {
            setActiveTab(tabKey);
        }
    };

    const ActiveComponent = TABS[activeTab].component;
    const componentProps = {
        home: {
            progressData: progressData,
            onUpdateProgress: updateProgress,
            onNavigate: handleHomeNavigation,
            activePlan: activePlan,
            user: user,
            onUpdateUser: onUpdateUser,
        },
        exercise: { onAcceptPlan: handleAcceptPlan },
        posture: {},
        therapy: {},
        journal: {},
        tele: {},
        profile: {
            user: user,
            onUpdateUser: onUpdateUser,
            onLogout: onLogout,
            aiProvider: aiProvider,
            geminiApiKey: geminiApiKey,
            openAiApiKey: openAiApiKey,
            groqApiKey: groqApiKey,
            customApiKey: customApiKey,
            customApiBaseUrl: customApiBaseUrl,
            customApiModel: customApiModel,
            onAiSettingsSave: onAiSettingsSave,
        },
    }[activeTab];


    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white">
                        <i className="fas fa-heartbeat text-sm"></i>
                    </div>
                    <span className="text-xl font-bold text-slate-800 font-heading">PhysioConnect</span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {NAV_ITEMS.map((tabKey) => (
                        <button
                            key={tabKey}
                            onClick={() => handleNavClick(tabKey)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tabKey
                                ? 'bg-emerald-50 text-emerald-600 font-semibold shadow-sm'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <i className={`fas ${TABS[tabKey].icon} w-5 text-center`}></i>
                            <span>{TABS[tabKey].title}</span>
                            {TABS[tabKey].isPremium && !user.isPremium && (
                                <i className="fas fa-lock text-xs ml-auto text-amber-400"></i>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-200">
                    <button onClick={onLogout} className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-red-500 transition-colors text-sm">
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white">
                            <i className="fas fa-heartbeat text-sm"></i>
                        </div>
                        <span className="text-lg font-bold text-slate-800">PhysioConnect</span>
                    </div>
                    <button onClick={onLogout} className="text-slate-400 hover:text-red-500" aria-label="Sign Out">
                        <i className="fas fa-sign-out-alt"></i>
                    </button>
                </header>

                <main ref={mainContentRef} className="flex-grow scroll-auto overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
                    <div className="max-w-5xl mx-auto">
                        <div className="animate-fade-in">
                            <ActiveComponent {...componentProps} />
                        </div>
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 pb-safe">
                <div className="flex justify-around items-center h-16">
                    {NAV_ITEMS.map(tabKey => (
                        <button
                            key={tabKey}
                            onClick={() => handleNavClick(tabKey)}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === tabKey ? 'text-emerald-600' : 'text-slate-400'
                                }`}
                        >
                            <i className={`fas ${TABS[tabKey].icon} text-lg ${activeTab === tabKey ? 'transform scale-110' : ''} transition-transform`}></i>
                            <span className="text-[10px] font-medium">{TABS[tabKey].title}</span>
                        </button>
                    ))}
                </div>
            </nav>

            <PremiumModal
                isOpen={isPremiumModalOpen}
                onClose={() => setIsPremiumModalOpen(false)}
                onUpgrade={() => {
                    setIsPremiumModalOpen(false);
                    if (onNavigateToPayment) {
                        onNavigateToPayment();
                    }
                }}
            />

            {/* Scroll to top button */}
            {showScrollTopButton && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-20 md:bottom-8 right-6 bg-slate-800 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-slate-700 transition-all z-40"
                    aria-label="Scroll to top"
                >
                    <i className="fas fa-arrow-up"></i>
                </button>
            )}
        </div>
    );
};

export default Dashboard;