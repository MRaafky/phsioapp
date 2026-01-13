import React, { useState, useEffect } from 'react';
import { getAnnouncements, addAnnouncement, updateAnnouncement, deleteAnnouncement } from '../../services/contentService';
import type { Announcement } from '../../types';

const AdminContent: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
        loadAnnouncements();
    }, []);

    const loadAnnouncements = async () => {
        const announcements = await getAnnouncements();
        setAnnouncements(announcements);
    };

    const handleOpenForm = (announcement: Announcement | null = null) => {
        if (announcement) {
            setEditingAnnouncement(announcement);
            setTitle(announcement.title);
            setContent(announcement.content);
        } else {
            setEditingAnnouncement(null);
            setTitle('');
            setContent('');
        }
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingAnnouncement(null);
        setTitle('');
        setContent('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            alert('Title and content cannot be empty.');
            return;
        }

        if (editingAnnouncement) {
            await updateAnnouncement({ ...editingAnnouncement, title, content });
        } else {
            await addAnnouncement({ title, content });
        }

        loadAnnouncements();
        handleCloseForm();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this announcement?')) {
            await deleteAnnouncement(id);
            loadAnnouncements();
        }
    };

    return (
        <div className="animate-fade-in h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 font-heading">Announcements</h2>
                    <p className="text-slate-500 text-sm">Manage news and updates for all users</p>
                </div>
                <button
                    onClick={() => handleOpenForm()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-200 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                    <i className="fas fa-plus"></i>
                    <span>New Announcement</span>
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex-1 overflow-hidden flex flex-col">
                {announcements.length > 0 ? (
                    <ul className="overflow-y-auto p-2 space-y-2">
                        {announcements.map(ann => (
                            <li key={ann.id} className="p-6 rounded-2xl bg-white border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all duration-200 group">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-2 py-1 rounded-md">
                                                <i className="fas fa-bullhorn mr-1"></i> Update
                                            </span>
                                            <span className="text-xs text-slate-400 font-medium">
                                                {new Date(ann.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-lg text-slate-800 font-heading mb-2 group-hover:text-indigo-700 transition-colors">{ann.title}</h3>
                                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleOpenForm(ann)}
                                            className="w-10 h-10 rounded-lg bg-slate-50 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center justify-center border border-slate-200 hover:border-indigo-200"
                                            title="Edit"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(ann.id)}
                                            className="w-10 h-10 rounded-lg bg-slate-50 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center justify-center border border-slate-200 hover:border-red-200"
                                            title="Delete"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center flex-1 p-12 text-center text-slate-400">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <i className="fas fa-bullhorn text-3xl text-slate-300"></i>
                        </div>
                        <h3 className="text-lg font-bold text-slate-600 mb-1">No Announcements Yet</h3>
                        <p className="max-w-xs mx-auto text-sm">Keep your users informed by creating your first announcement.</p>
                        <button
                            onClick={() => handleOpenForm()}
                            className="mt-6 text-indigo-600 font-bold hover:underline"
                        >
                            Create Announcement
                        </button>
                    </div>
                )}
            </div>

            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleCloseForm}>
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"></div>
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-modal-pop border border-slate-100" onClick={e => e.stopPropagation()}>
                        <div className="p-8 pb-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="text-2xl font-bold text-slate-800 font-heading">
                                {editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}
                            </h3>
                            <button onClick={handleCloseForm} className="text-slate-400 hover:text-slate-600">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="e.g., New Feature Alert!"
                                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700">Content</label>
                                <textarea
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    rows={5}
                                    placeholder="Write your announcement message here..."
                                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium resize-none"
                                ></textarea>
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
                                    {editingAnnouncement ? 'Update' : 'Publish'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminContent;
