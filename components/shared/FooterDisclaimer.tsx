
import React from 'react';

const FooterDisclaimer: React.FC = () => {
    return (
        <div className="mt-8 p-4 bg-amber-50 border-l-4 border-amber-500 text-slate-700 rounded-r-xl" style={{ fontFamily: "'Inter', sans-serif" }}>
            <p className="font-semibold text-sm">
                <i className="fas fa-exclamation-triangle mr-2 text-amber-500"></i>
                Disclaimer
            </p>
            <p className="text-sm mt-1 text-slate-600">
                This tool is for assistance only. Consult a professional physiotherapist if pain persists or worsens.
            </p>
        </div>
    );
}

export default FooterDisclaimer;
