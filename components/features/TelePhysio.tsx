import React, { useState, useEffect, useRef } from 'react';
import { generateChatResponse } from '../../services/geminiService';

type Mode = 'chat' | 'video';
interface Message {
    sender: 'user' | 'physio';
    text: string;
}

const TelePhysio: React.FC = () => {
    const [mode, setMode] = useState<Mode>('video');
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const startSession = (selectedMode: Mode) => {
        setMode(selectedMode);
        setIsSessionActive(true);
        if (selectedMode === 'chat') {
            setMessages([{ sender: 'physio', text: "Hello! I'm your AI physiotherapy assistant. How can I help you today?" }]);
        }
    };

    const endSession = () => {
        setIsSessionActive(false);
        setMessages([]);
        setInputValue('');
        setError(null);
        setIsLoading(false);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() === '' || isLoading) return;

        const userMessage: Message = { sender: 'user', text: inputValue };
        const newMessages = [...messages, userMessage];

        setMessages(newMessages);
        setInputValue('');
        setIsLoading(true);
        setError(null);

        try {
            const responseText = await generateChatResponse(newMessages);
            const physioReply: Message = { sender: 'physio', text: responseText };
            setMessages(prev => [...prev, physioReply]);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderWelcomeScreen = () => (
        <div className="text-center p-12 bg-white rounded-3xl shadow-sm border border-slate-100">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
                <i className="fas fa-headset text-4xl"></i>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2 font-heading">Virtual Consultation</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
                Connect with our AI assistant for immediate advice or schedule a video call with a certified physiotherapist.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-emerald-200 transition-all duration-300 transform hover:-translate-y-0.5"
                    onClick={() => startSession('chat')}
                >
                    <i className="fas fa-comments mr-2"></i>
                    Start AI Chat
                </button>
                <button
                    className="bg-slate-100 text-slate-400 font-bold py-3 px-8 rounded-xl cursor-not-allowed border border-slate-200"
                    title="Video feature is a mock-up"
                >
                    <i className="fas fa-video mr-2"></i>
                    Video Call (Coming Soon)
                </button>
            </div>
        </div>
    );

    const renderVideoCall = () => (
        <div className="animate-fade-in">
            <div className="bg-slate-900 rounded-3xl h-[500px] flex items-center justify-center mb-6 shadow-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 opacity-60"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-8 backdrop-blur-md bg-white/10 rounded-2xl border border-white/20">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <i className="fas fa-video text-3xl text-white"></i>
                        </div>
                        <p className="text-white font-medium text-lg">Interactive Video Session</p>
                        <p className="text-slate-300 text-sm mt-1">Camera feed inactive in demo mode</p>
                    </div>
                </div>
            </div>
            <div className="flex justify-center">
                <button onClick={endSession} className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-red-200 transition-all duration-300 transform hover:-translate-y-0.5">
                    <i className="fas fa-phone-slash mr-2"></i> End Session
                </button>
            </div>
        </div>
    );

    const TypingIndicator = () => (
        <div className="flex mb-4 justify-start animate-fade-in">
            <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm py-4 px-5 shadow-sm">
                <div className="flex items-center space-x-1.5">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0s]"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.15s]"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.3s]"></div>
                </div>
            </div>
        </div>
    );

    const renderChat = () => (
        <div className="flex flex-col h-[65vh] bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden animate-fade-in">
            {/* Chat Header */}
            <div className="bg-white border-b border-slate-100 p-4 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <i className="fas fa-robot"></i>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm">AI Assistant</h3>
                        <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Online
                        </p>
                    </div>
                </div>
                <button
                    onClick={endSession}
                    className="text-slate-400 hover:text-red-500 transition-colors p-2"
                    aria-label="End Chat Session"
                >
                    <i className="fas fa-times text-xl"></i>
                </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-grow p-6 overflow-y-auto bg-slate-50/30 scroll-smooth">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                        <div className={`rounded-2xl py-3 px-5 max-w-[85%] sm:max-w-md break-words shadow-sm ${msg.sender === 'user'
                            ? 'bg-emerald-500 text-white rounded-tr-sm'
                            : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm'
                            }`}>
                            {msg.text.split('\n').map((line, i) => <p key={i} className="leading-relaxed">{line}</p>)}
                        </div>
                    </div>
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={chatEndRef} />
            </div>

            {error && <div className="bg-red-50 text-red-600 text-xs px-4 py-2 text-center border-t border-red-100">{error}</div>}

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type your message..."
                        disabled={isLoading}
                        className="flex-grow px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-700 placeholder:text-slate-400 disabled:bg-slate-100"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !inputValue.trim()}
                        className="bg-emerald-500 text-white font-bold w-12 h-12 rounded-xl hover:bg-emerald-600 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-200"
                        aria-label="Send Message"
                    >
                        <i className="fas fa-paper-plane"></i>
                    </button>
                </div>
            </form>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-slate-800 mb-2 font-heading">TelePhysio Session</h2>
            <p className="text-slate-500 mb-8">Consult with AI or start a video session.</p>

            {!isSessionActive ? (
                renderWelcomeScreen()
            ) : (
                mode === 'video' ? renderVideoCall() : renderChat()
            )}

            <div className="mt-8 p-4 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl flex gap-3 shadow-sm">
                <i className="fas fa-exclamation-triangle mt-1 text-amber-500 shrink-0"></i>
                <div>
                    <p className="font-bold text-sm uppercase tracking-wide opacity-80 mb-1">Disclaimer</p>
                    <p className="text-sm opacity-90 leading-relaxed">
                        The AI chat is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TelePhysio;