import React from 'react';
import type { AdminMessage } from '../../types';

interface AdminMessagesProps {
    messages: AdminMessage[];
    onMarkAsRead: (messageId: string) => void;
}

const AdminMessages: React.FC<AdminMessagesProps> = ({ messages, onMarkAsRead }) => {
    const unreadMessages = messages.filter(m => !m.read);

    if (unreadMessages.length === 0) {
        return null;
    }

    return (
        <div className="mb-6 p-4 bg-blue-100 border-l-4 border-blue-500 text-blue-800 rounded-r-lg shadow-md animate-fade-in">
            <h3 className="font-bold text-lg mb-2"><i className="fas fa-info-circle mr-2"></i>New Message from Your Admin</h3>
            {unreadMessages.map(msg => (
                <div key={msg.id} className="text-sm mb-2 pb-2 border-b border-blue-200 last:border-b-0 last:mb-0 last:pb-0">
                    <p className="mb-2">{msg.text}</p>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-blue-600">{new Date(msg.timestamp).toLocaleString()}</span>
                        <button 
                            onClick={() => onMarkAsRead(msg.id)}
                            className="bg-white text-blue-600 text-xs font-semibold py-1 px-3 rounded-full hover:bg-blue-50 transition-colors"
                        >
                            Mark as read
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AdminMessages;
