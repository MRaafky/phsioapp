import React from 'react';
import ExerciseProgramTracker from '../widgets/ExerciseProgramTracker';
import CurrentWeekPlan from '../widgets/CurrentWeekPlan';
import AdminMessages from '../widgets/AdminMessages';
import Announcements from '../widgets/Announcements';
import type { ExercisePlan, ProgramProgress, User } from '../../types';

interface HomeProps {
    progressData: ProgramProgress | null;
    onUpdateProgress: () => void;
    onNavigate: (tab: 'journal' | 'tele' | 'exercise' | 'posture') => void;
    activePlan: ExercisePlan | null;
    user: User;
    onUpdateUser: (user: User) => void;
}

const Home: React.FC<HomeProps> = ({ progressData, onUpdateProgress, onNavigate, activePlan, user, onUpdateUser }) => {
    const isCompleted = activePlan && progressData ? (progressData.completedSessions >= progressData.totalWeeks * progressData.sessionsPerWeek) : false;

    const handleMarkAsRead = (messageId: string) => {
        const updatedMessages = user.messagesFromAdmin.map(msg =>
            msg.id === messageId ? { ...msg, read: true } : msg
        );
        onUpdateUser({ ...user, messagesFromAdmin: updatedMessages });
    };

    return (
        <div className="space-y-8">
            <Announcements />
            <AdminMessages messages={user.messagesFromAdmin} onMarkAsRead={handleMarkAsRead} />

            {activePlan && progressData ? (
                <>
                    <ExerciseProgramTracker progressData={progressData} />
                    <CurrentWeekPlan plan={activePlan} currentWeek={progressData.currentWeek} />
                    <button
                        onClick={onUpdateProgress}
                        disabled={isCompleted}
                        title={isCompleted ? "Program Complete!" : "Log a Session"}
                        aria-label={isCompleted ? "Program Complete!" : "Log a Session"}
                        className="fixed bottom-24 right-6 md:bottom-12 md:right-12 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-emerald-300/50 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:scale-100 disabled:hover:scale-100 z-40"
                    >
                        {isCompleted ? <i className="fas fa-check text-2xl"></i> : <i className="fas fa-plus text-2xl"></i>}
                    </button>
                </>
            ) : (
                <div className="text-center p-10 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-dumbbell text-4xl text-emerald-600"></i>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-3 font-heading">
                        No Active Exercise Plan
                    </h2>
                    <p className="text-slate-500 mb-8 text-base max-w-md mx-auto">
                        Get started by generating a personalized physiotherapy program tailored to your needs.
                    </p>
                    <button
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-300/50"
                        onClick={() => onNavigate('exercise')}
                    >
                        <i className="fas fa-plus-circle mr-2"></i>
                        Generate New Plan
                    </button>
                </div>
            )}

            <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-6 font-heading">
                    More Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div
                        className="flex flex-col items-center justify-center text-center p-8 rounded-2xl shadow-sm cursor-pointer transition-all duration-300 transform bg-white hover:shadow-xl hover:-translate-y-1 border border-slate-100 group"
                        onClick={() => onNavigate('posture')}
                        role="button"
                        tabIndex={0}
                        aria-label="Go to Posture IQ"
                    >
                        <div className="relative mb-4">
                            <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center group-hover:bg-sky-100 transition-colors">
                                <i className="fas fa-user-check text-3xl text-sky-600"></i>
                            </div>
                            {!user.isPremium && (
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow-md">
                                    <i className="fas fa-lock text-xs text-white"></i>
                                </div>
                            )}
                        </div>
                        <h4 className="font-bold text-lg text-slate-800 mb-2 font-heading">Posture IQ</h4>
                        <p className="text-sm text-slate-500">Analyze your posture with AI</p>
                    </div>
                    <div
                        className="flex flex-col items-center justify-center text-center p-8 rounded-2xl shadow-sm cursor-pointer transition-all duration-300 transform bg-white hover:shadow-xl hover:-translate-y-1 border border-slate-100 group"
                        onClick={() => onNavigate('tele')}
                        role="button"
                        tabIndex={0}
                        aria-label="Go to TelePhysio"
                    >
                        <div className="relative mb-4">
                            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                                <i className="fas fa-video text-3xl text-purple-600"></i>
                            </div>
                            {!user.isPremium && (
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow-md">
                                    <i className="fas fa-lock text-xs text-white"></i>
                                </div>
                            )}
                        </div>
                        <h4 className="font-bold text-lg text-slate-800 mb-2 font-heading">TelePhysio</h4>
                        <p className="text-sm text-slate-500">Start a virtual consultation</p>
                    </div>
                    <div
                        className="flex flex-col items-center justify-center text-center p-8 rounded-2xl shadow-sm cursor-pointer transition-all duration-300 transform bg-white hover:shadow-xl hover:-translate-y-1 border border-slate-100 group"
                        onClick={() => onNavigate('journal')}
                        role="button"
                        tabIndex={0}
                        aria-label="Go to Journal Link"
                    >
                        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
                            <i className="fas fa-book-open text-3xl text-orange-600"></i>
                        </div>
                        <h4 className="font-bold text-lg text-slate-800 mb-2 font-heading">Journal Link</h4>
                        <p className="text-sm text-slate-500">Access trusted journals</p>
                    </div>
                </div>
            </div>

            {/* Recommended Exercises Slider */}
            <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-6 font-heading">
                    Recommended Exercises
                </h3>
                <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                    <div className="flex gap-6 [min-width:max-content]">
                        {/* Neck Stretch */}
                        <div className="w-72 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300">
                            <img
                                src="/images/exercises/neck-stretch.png"
                                alt="Neck Stretch Exercise"
                                className="h-40 w-full object-cover"
                            />
                            <div className="p-5">
                                <h4 className="font-bold text-lg text-slate-800 mb-2 font-heading">
                                    Neck Stretch
                                </h4>
                                <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                                    Gently tilt your head to release neck tension. Hold for 15-20 seconds each side.
                                </p>
                                <div className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-md">
                                    <i className="fas fa-clock mr-1.5"></i>
                                    <span>2-3 mins</span>
                                </div>
                            </div>
                        </div>

                        {/* Shoulder Roll */}
                        <div className="w-72 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300">
                            <img
                                src="/images/exercises/shoulder-roll.png"
                                alt="Shoulder Roll Exercise"
                                className="h-40 w-full object-cover"
                            />
                            <div className="p-5">
                                <h4 className="font-bold text-lg text-slate-800 mb-2 font-heading">
                                    Shoulder Roll
                                </h4>
                                <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                                    Circular shoulder movements to improve mobility. Do 10 rolls forward and backward.
                                </p>
                                <div className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-md">
                                    <i className="fas fa-clock mr-1.5"></i>
                                    <span>3-4 mins</span>
                                </div>
                            </div>
                        </div>

                        {/* Spinal Twist */}
                        <div className="w-72 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300">
                            <img
                                src="/images/exercises/spinal-twist.png"
                                alt="Seated Spinal Twist Exercise"
                                className="h-40 w-full object-cover"
                            />
                            <div className="p-5">
                                <h4 className="font-bold text-lg text-slate-800 mb-2 font-heading">
                                    Seated Spinal Twist
                                </h4>
                                <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                                    Improve spine flexibility with gentle rotations. Hold 20 seconds each side.
                                </p>
                                <div className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-md">
                                    <i className="fas fa-clock mr-1.5"></i>
                                    <span>2-3 mins</span>
                                </div>
                            </div>
                        </div>

                        {/* Quad Stretch */}
                        <div className="w-72 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300">
                            <img
                                src="/images/exercises/quad-stretch.png"
                                alt="Quad Stretch Exercise"
                                className="h-40 w-full object-cover"
                            />
                            <div className="p-5">
                                <h4 className="font-bold text-lg text-slate-800 mb-2 font-heading">
                                    Quad Stretch
                                </h4>
                                <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                                    Standing leg stretch for quadriceps muscles. Hold 15-20 seconds per leg.
                                </p>
                                <div className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-md">
                                    <i className="fas fa-clock mr-1.5"></i>
                                    <span>2 mins</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
