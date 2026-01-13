import React from 'react';

interface PremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade?: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onUpgrade }) => {
    if (!isOpen) return null;

    const handleUpgrade = () => {
        if (onUpgrade) {
            onUpgrade();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-gradient-to-br from-slate-900/80 via-sky-900/80 to-cyan-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-fast"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="premium-modal-title"
        >
            <div
                className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-md p-8 text-center relative animate-modal-pop border border-white/50"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Premium Icon */}
                <div className="w-20 h-20 rounded-full mx-auto bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mb-6 ring-4 ring-amber-200/50 shadow-lg">
                    <i className="fas fa-crown text-4xl text-white"></i>
                </div>

                {/* Title */}
                <h2 id="premium-modal-title" className="text-3xl font-bold text-slate-800 mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Premium Feature
                </h2>

                {/* Description */}
                <p className="text-slate-600 mb-6 text-base leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Unlock this exclusive feature and many more with Premium membership
                </p>

                {/* Features List */}
                <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl p-6 mb-6 text-left">
                    <p className="text-sm font-semibold text-slate-700 mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Premium Benefits:
                    </p>
                    <ul className="space-y-2 text-sm text-slate-600" style={{ fontFamily: "'Inter', sans-serif" }}>
                        <li className="flex items-center">
                            <i className="fas fa-check-circle text-sky-500 mr-2"></i>
                            Posture IQ Analysis
                        </li>
                        <li className="flex items-center">
                            <i className="fas fa-check-circle text-sky-500 mr-2"></i>
                            TelePhysio Consultations
                        </li>
                        <li className="flex items-center">
                            <i className="fas fa-check-circle text-sky-500 mr-2"></i>
                            Priority Support
                        </li>
                    </ul>
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={handleUpgrade}
                        className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-amber-300/50"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                        <i className="fas fa-star mr-2"></i>
                        Upgrade to Premium
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-slate-300/50"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                        Maybe Later
                    </button>
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
                    aria-label="Close"
                >
                    <i className="fas fa-times"></i>
                </button>
            </div>

            {/* Add Google Fonts */}
            <link
                href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap"
                rel="stylesheet"
            />
        </div>
    );
};

export default PremiumModal;
