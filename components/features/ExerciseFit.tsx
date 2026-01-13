import React, { useState } from 'react';
import { generateExercisePlan } from '../../services/geminiService';
import type { ExercisePlan } from '../../types';
import FooterDisclaimer from '../shared/FooterDisclaimer';

interface ExerciseFitProps {
    onAcceptPlan: (plan: ExercisePlan) => void;
}

const complaintOptions = [
    // Full Body / General
    "Improve posture",
    "General flexibility and mobility",
    "Core strengthening",
    "Improve overall balance and coordination",
    "Post-surgical rehabilitation (general)",
    // Upper Body
    "Mild lower back pain and stiffness",
    "Upper back and neck tension",
    "Shoulder mobility improvement",
    "Wrist and hand strengthening (for office work)",
    "Elbow pain (e.g., Tennis Elbow)",
    // Lower Body
    "Hip flexibility and strength",
    "Knee stability and pain reduction",
    "Ankle sprain recovery",
    "Foot pain (e.g., Plantar Fasciitis)",
];


const ExerciseFit: React.FC<ExerciseFitProps> = ({ onAcceptPlan }) => {
    const [age, setAge] = useState('35');
    const [weight, setWeight] = useState('70');
    const [height, setHeight] = useState('170');
    const [complaints, setComplaints] = useState(complaintOptions[0]);
    const [activityLevel, setActivityLevel] = useState('Sedentary (office job)');
    const [plan, setPlan] = useState<ExercisePlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setPlan(null);
        try {
            const generatedPlan = await generateExercisePlan(age, weight, height, complaints, activityLevel);
            setPlan(generatedPlan);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAcceptClick = () => {
        if (plan) {
            onAcceptPlan(plan);
        }
    }

    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-slate-800 mb-2 font-heading">
                Exercise Program Generator
            </h2>
            <p className="text-slate-500 mb-8">
                Create a personalized physiotherapy plan tailored to your specific needs and goals.
            </p>

            <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 mb-8 space-y-6">
                {/* Physical Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="age" className="block text-slate-700 text-sm font-bold mb-2">
                            <i className="fas fa-birthday-cake text-emerald-500 mr-2"></i>
                            Age (years)
                        </label>
                        <input
                            id="age"
                            type="number"
                            value={age}
                            onChange={e => setAge(e.target.value)}
                            min="10"
                            max="100"
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                        />
                    </div>
                    <div>
                        <label htmlFor="weight" className="block text-slate-700 text-sm font-bold mb-2">
                            <i className="fas fa-weight-hanging text-emerald-500 mr-2"></i>
                            Weight (kg)
                        </label>
                        <input
                            id="weight"
                            type="number"
                            value={weight}
                            onChange={e => setWeight(e.target.value)}
                            min="30"
                            max="200"
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                        />
                    </div>
                    <div>
                        <label htmlFor="height" className="block text-slate-700 text-sm font-bold mb-2">
                            <i className="fas fa-ruler-vertical text-emerald-500 mr-2"></i>
                            Height (cm)
                        </label>
                        <input
                            id="height"
                            type="number"
                            value={height}
                            onChange={e => setHeight(e.target.value)}
                            min="100"
                            max="250"
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                        />
                    </div>
                </div>

                {/* Goals & Activity Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="complaints" className="block text-slate-700 text-sm font-bold mb-2">
                            <i className="fas fa-bullseye text-emerald-500 mr-2"></i>
                            Complaints / Goals
                        </label>
                        <div className="relative">
                            <select
                                id="complaints"
                                value={complaints}
                                onChange={e => setComplaints(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none font-medium"
                            >
                                {complaintOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                                <i className="fas fa-chevron-down text-xs"></i>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="activityLevel" className="block text-slate-700 text-sm font-bold mb-2">
                            <i className="fas fa-running text-emerald-500 mr-2"></i>
                            Activity Level
                        </label>
                        <div className="relative">
                            <select
                                id="activityLevel"
                                value={activityLevel}
                                onChange={e => setActivityLevel(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none font-medium"
                            >
                                <option>Sedentary (office job)</option>
                                <option>Lightly Active (walks 1-2 times/week)</option>
                                <option>Moderately Active (exercises 3-4 times/week)</option>
                                <option>Very Active (exercises 5+ times/week)</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                                <i className="fas fa-chevron-down text-xs"></i>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Generate Button */}
                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:transform-none transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-300/50"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <i className="fas fa-spinner fa-spin"></i>
                                Generating Your Plan...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <i className="fas fa-sparkles"></i>
                                Generate My Program
                            </span>
                        )}
                    </button>
                </div>
            </form>

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-700 px-6 py-4 rounded-xl mb-8 flex items-start gap-3" role="alert">
                    <i className="fas fa-exclamation-circle text-xl mt-0.5 text-red-500"></i>
                    <div>
                        <h4 className="font-bold">Error Generating Plan</h4>
                        <p className="text-sm opacity-90">{error}</p>
                    </div>
                </div>
            )}

            {plan && (
                <div className="animate-fade-in space-y-6">
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border border-emerald-100 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <span className="bg-white text-emerald-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border border-emerald-100 mb-3 inline-block">
                                Recommended Plan
                            </span>
                            <h3 className="text-2xl md:text-3xl font-bold text-slate-800 font-heading mb-1">{plan.planTitle}</h3>
                            <p className="text-slate-600 font-medium">
                                <i className="fas fa-calendar-alt mr-2 text-emerald-500"></i>
                                {plan.weeklyPlans.length} Week Program
                            </p>
                        </div>
                        <button
                            onClick={handleAcceptClick}
                            className="bg-white text-emerald-600 hover:bg-emerald-50 font-bold py-3.5 px-8 rounded-xl shadow-md hover:shadow-lg border border-emerald-100 transition-all duration-300 whitespace-nowrap"
                        >
                            <i className="fas fa-plus-circle mr-2"></i>
                            Add to Dashboard
                        </button>
                    </div>

                    <div className="grid gap-6">
                        {plan.weeklyPlans.map(week => (
                            <div key={week.week} className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-xl border border-emerald-100">
                                        {week.week}
                                    </div>
                                    <h4 className="font-bold text-xl text-slate-800 font-heading">
                                        {week.focus}
                                    </h4>
                                </div>

                                <ul className="grid md:grid-cols-2 gap-4">
                                    {week.exercises.map(ex => (
                                        <li key={ex.name} className="p-5 bg-slate-50 rounded-2xl border border-slate-200/60 hover:border-emerald-200/60 transition-colors group">
                                            <p className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                                                <i className="fas fa-dumbbell text-slate-400 group-hover:text-emerald-500 transition-colors"></i>
                                                {ex.name}
                                            </p>
                                            <p className="text-sm font-semibold text-emerald-600 mb-2 pl-7">
                                                {ex.sets} sets × {ex.reps} reps
                                            </p>
                                            <p className="text-sm text-slate-500 pl-7 leading-relaxed">{ex.notes}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <FooterDisclaimer />
        </div>
    );
}

export default ExerciseFit;