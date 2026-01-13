import React, { useState, useMemo, useEffect } from 'react';
import type { Journal } from '../../types';
import { getJournals } from '../../services/journalService';

const JournalLink: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [journals, setJournals] = useState<Journal[]>([]);

    useEffect(() => {
        setJournals(getJournals());
    }, []);

    const filteredJournals = useMemo(() => {
        return journals.filter(journal =>
            journal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            journal.publisher.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, journals]);

    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-slate-800 mb-2 font-heading">Trusted Journal Links</h2>
            <p className="text-slate-500 mb-8">Access trusted medical journals and physiotherapy resources.</p>

            <div className="mb-8 relative">
                <input
                    type="text"
                    placeholder="Search journals by title or publisher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-5 py-4 pl-12 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium shadow-sm"
                />
                <i className="fas fa-search absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg"></i>
            </div>

            <div className="grid gap-4">
                {filteredJournals.length > 0 ? (
                    filteredJournals.map(journal => (
                        <div key={journal.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md transition-all duration-300 group">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-110 transition-transform duration-300">
                                    <i className="fas fa-book-medical text-xl"></i>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 font-heading group-hover:text-emerald-600 transition-colors">
                                        {journal.title}
                                    </h3>
                                    <p className="text-sm font-medium text-slate-500">
                                        <span className="text-emerald-600">{journal.publisher}</span> • Est. {journal.year}
                                    </p>
                                </div>
                            </div>
                            <a
                                href={journal.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold py-3 px-6 rounded-xl transition-all duration-300 whitespace-nowrap text-center border border-slate-200 hover:border-emerald-200"
                            >
                                Visit Site <i className="fas fa-external-link-alt ml-2 text-xs opacity-70"></i>
                            </a>
                        </div>
                    ))
                ) : (
                    <div className="text-center p-12 bg-white rounded-3xl border border-slate-100 border-dashed">
                        <div className="w-16 h-16 mx-auto mb-4 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                            <i className="fas fa-search text-2xl"></i>
                        </div>
                        <h4 className="text-lg font-bold text-slate-700 font-heading mb-1">No journals found</h4>
                        <p className="text-slate-500">Try adjusting your search terms.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JournalLink;