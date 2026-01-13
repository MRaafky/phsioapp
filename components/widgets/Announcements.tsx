import React, { useState, useEffect } from 'react';
import { getAnnouncements } from '../../services/contentService';
import type { Announcement } from '../../types';

const Announcements: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);

    useEffect(() => {
        // Show only the 3 most recent announcements
        getAnnouncements().then(announcements => {
            setAnnouncements(announcements.slice(0, 3));
        }).catch(err => {
            console.error('Failed to load announcements:', err);
        });
    }, []);

    if (announcements.length === 0) {
        return null;
    }

    return (
        <div className="mb-6 p-4 bg-purple-100 border-l-4 border-purple-500 text-purple-800 rounded-r-lg shadow-md animate-fade-in">
            <h3 className="font-bold text-lg mb-2"><i className="fas fa-bullhorn mr-2"></i>Recent Announcements</h3>
            <div className="space-y-3">
                {announcements.map(ann => (
                    <div key={ann.id} className="text-sm">
                        <p className="font-semibold">{ann.title}</p>
                        <p className="text-purple-700">{ann.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Announcements;
