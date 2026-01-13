import React, { useState, useEffect } from 'react';
import { getJournals, addJournal, deleteJournal } from '../../services/journalService';
import type { Journal } from '../../types';

const AdminJournals: React.FC = () => {
    const [journals, setJournals] = useState<Journal[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const [title, setTitle] = useState('');
    const [publisher, setPublisher] = useState('');
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [link, setLink] = useState('');

    useEffect(() => {
        loadJournals();
    }, []);

    const loadJournals = () => {
        setJournals(getJournals());
    };

    const resetForm = () => {
        setTitle('');
        setPublisher('');
        setYear(new Date().getFullYear());
        setLink('');
    };

    const handleOpenForm = () => {
        resetForm();
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !publisher.trim() || !link.trim()) {
            alert('All fields are required.');
            return;
        }

        addJournal({ title, publisher, year, link });

        loadJournals();
        handleCloseForm();
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this journal link?')) {
            deleteJournal(id);
            loadJournals();
        }
    };

    return (
        <div className="animate-fade-in h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 font-heading">Medical Journals</h2>
                    <p className="text-slate-500 text-sm">Curate trusted resources for your users</p>
                </div>
                <button
                    onClick={handleOpenForm}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-200 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                    <i className="fas fa-plus"></i>
                    <span>Add Journal</span>
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex-1 overflow-hidden flex flex-col">
                {journals.length > 0 ? (
                    <div className="overflow-y-auto p-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {journals.map(journal => (
                                <div key={journal.id} className="p-6 rounded-2xl bg-white border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all duration-200 group relative">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-xl shadow-sm flex-shrink-0">
                                            <i className="fas fa-book-medical"></i>
                                        </div>
                                        <div className="flex-1 min-w-0 pr-8">
                                            <a
                                                href={journal.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-bold text-lg text-slate-800 font-heading hover:text-indigo-600 transition-colors line-clamp-1 block"
                                                title={journal.title}
                                            >
                                                {journal.title}
                                            </a>
                                            <p className="text-slate-500 text-sm mt-1">{journal.publisher}</p>
                                            <div className="flex items-center gap-2 mt-3">
                                                <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md">
                                                    {journal.year}
                                                </span>
                                                <span className="text-xs text-indigo-400 hover:text-indigo-600 truncate flex-1">
                                                    {journal.link}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(journal.id)}
                                        className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors p-2"
                                        aria-label="Delete Journal"
                                        title="Delete Journal"
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center flex-1 p-12 text-center text-slate-400">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <i className="fas fa-book-open text-3xl text-slate-300"></i>
                        </div>
                        <h3 className="text-lg font-bold text-slate-600 mb-1">No Journals Found</h3>
                        <p className="max-w-xs mx-auto text-sm">Start building your library of medical resources.</p>
                        <button
                            onClick={handleOpenForm}
                            className="mt-6 text-indigo-600 font-bold hover:underline"
                        >
                            Add Journal Link
                        </button>
                    </div>
                )}
            </div>

            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleCloseForm}>
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"></div>
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-modal-pop border border-slate-100" onClick={e => e.stopPropagation()}>
                        <div className="p-8 pb-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="text-2xl font-bold text-slate-800 font-heading">Add New Journal</h3>
                            <button onClick={handleCloseForm} className="text-slate-400 hover:text-slate-600">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700">Journal Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="e.g. British Journal of Sports Medicine"
                                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700">Publisher</label>
                                    <input
                                        type="text"
                                        value={publisher}
                                        onChange={e => setPublisher(e.target.value)}
                                        placeholder="e.g. BMJ"
                                        className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700">Year</label>
                                    <input
                                        type="number"
                                        value={year}
                                        onChange={e => setYear(Number(e.target.value))}
                                        className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700">Link (URL)</label>
                                <input
                                    type="url"
                                    value={link}
                                    onChange={e => setLink(e.target.value)}
                                    placeholder="https://..."
                                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseForm}
                                    className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    Add Journal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminJournals;