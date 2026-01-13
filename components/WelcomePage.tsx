import React from 'react';

interface WelcomePageProps {
  onNavigateToLogin: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onNavigateToLogin }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white">
                <i className="fas fa-heartbeat text-sm"></i>
              </div>
              <span className="text-xl font-bold text-slate-800 font-heading">PhysioConnect</span>
            </div>
            <button
              onClick={onNavigateToLogin}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">

          {/* Text Content */}
          <div className="space-y-8 animate-fade-in">
            <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 leading-tight font-heading">
              Recover Smarter, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
                Live Better.
              </span>
            </h1>
            <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
              Experience the future of physiotherapy with AI-powered posture analysis, real-time progress tracking, and personalized recovery plans.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onNavigateToLogin}
                className="px-8 py-4 bg-slate-900 text-white rounded-xl font-semibold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transform hover:-translate-y-1 transition-all"
              >
                Get Started Now
              </button>
              <button className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all">
                Learn More
              </button>
            </div>

            <div className="flex items-center gap-6 pt-4 text-slate-500 text-sm">
              <div className="flex items-center gap-2">
                <i className="fas fa-check-circle text-emerald-500"></i>
                <span>AI Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-check-circle text-emerald-500"></i>
                <span>Real-time Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-check-circle text-emerald-500"></i>
                <span>Expert Verified</span>
              </div>
            </div>
          </div>

          {/* Graphic/Visual */}
          <div className="relative relative lg:h-[600px] flex items-center justify-center animate-fade-in [animation-delay:0.2s]">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-200/30 to-sky-200/30 rounded-full blur-3xl animate-pulse"></div>

            {/* Abstract UI Representation */}
            <div className="relative z-10 w-full max-w-md bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl p-6">
              {/* Header of fake app */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="h-2 w-24 bg-slate-200 rounded-full mb-2"></div>
                  <div className="h-2 w-16 bg-slate-100 rounded-full"></div>
                </div>
                <div className="h-8 w-8 rounded-full bg-emerald-100"></div>
              </div>
              {/* Body of fake app */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                    <i className="fas fa-running"></i>
                  </div>
                  <div className="flex-1">
                    <div className="h-2 w-20 bg-slate-200 rounded-full mb-1"></div>
                    <div className="h-1.5 w-12 bg-slate-100 rounded-full"></div>
                  </div>
                  <span className="text-emerald-500 font-bold text-sm">98%</span>
                </div>

                <div className="p-4 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <div className="flex-1">
                    <div className="h-2 w-24 bg-slate-200 rounded-full mb-1"></div>
                    <div className="h-1.5 w-16 bg-slate-100 rounded-full"></div>
                  </div>
                </div>

                {/* Graph placeholder */}
                <div className="h-32 rounded-xl bg-slate-50 border border-slate-100 flex items-end justify-between p-4 px-6 gap-2">
                  <div className="w-full bg-emerald-400/20 rounded-t-lg h-[40%]"></div>
                  <div className="w-full bg-emerald-400/40 rounded-t-lg h-[60%]"></div>
                  <div className="w-full bg-emerald-400/60 rounded-t-lg h-[50%]"></div>
                  <div className="w-full bg-emerald-500 rounded-t-lg h-[80%]"></div>
                </div>
              </div>
            </div>

            {/* Floating Card */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-bounce [animation-duration:3s]">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg text-green-600">
                  <i className="fas fa-check"></i>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold">Status</p>
                  <p className="text-sm font-bold text-slate-800">Posture Correct</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} PhysioConnect. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;
