import React from 'react';

interface NavItemProps {
    label: string;
    icon: string;
    isActive: boolean;
    onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ label, icon, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center w-20 transition-all duration-300 relative ${isActive ? 'text-sky-500' : 'text-slate-400 hover:text-slate-600'
                }`}
            aria-current={isActive ? 'page' : undefined}
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            {/* Icon with scale animation */}
            <i className={`fas ${icon} text-2xl mb-1 transition-transform duration-300 ${isActive ? 'scale-110' : ''
                }`}></i>

            {/* Label */}
            <span className={`text-xs font-semibold transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-70'
                }`}>
                {label}
            </span>


        </button>
    );
};

export default NavItem;
