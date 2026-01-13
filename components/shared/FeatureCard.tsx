
import React from 'react';

interface FeatureCardProps {
    title: string;
    icon: string;
    isActive: boolean;
    onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, icon, isActive, onClick }) => {
    return (
        <div
            className={`flex flex-col items-center justify-center text-center p-4 rounded-xl shadow-md cursor-pointer transition-all duration-300 transform ${isActive
                    ? 'bg-gradient-to-br from-sky-500 to-cyan-500 text-white scale-105 shadow-lg'
                    : 'bg-white text-slate-700 hover:bg-slate-50 hover:scale-105 border border-slate-100'
                }`}
            onClick={onClick}
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            <i className={`fas ${icon} text-3xl mb-2`}></i>
            <h3 className="font-semibold text-sm">{title}</h3>
        </div>
    );
}

export default FeatureCard;
