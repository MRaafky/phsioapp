import { getSupabase, isSupabaseConfigured, handleSupabaseError } from '../lib/supabase';
import type { Announcement } from '../types';

const DB_KEY = 'physcio_app_data';

// ====================================
// LOCALSTORAGE IMPLEMENTATION
// ====================================

const getDb = (): { users: any[], announcements?: Announcement[] } => {
    try {
        const data = localStorage.getItem(DB_KEY);
        const parsed = data ? JSON.parse(data) : { users: [], announcements: [] };
        if (!parsed.announcements) {
            parsed.announcements = [];
        }
        return parsed;
    } catch (error) {
        console.error("Failed to parse data from localStorage", error);
        return { users: [], announcements: [] };
    }
};

const saveDb = (db: { users: any[], announcements?: Announcement[] }) => {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
};

const getAnnouncements_localStorage = async (): Promise<Announcement[]> => {
    const db = getDb();
    return (db.announcements || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

const addAnnouncement_localStorage = async (announcement: Omit<Announcement, 'id' | 'createdAt'>): Promise<void> => {
    const db = getDb();
    const newAnnouncement: Announcement = {
        ...announcement,
        id: `ann_${Date.now()}`,
        createdAt: new Date().toISOString(),
    };
    db.announcements = [newAnnouncement, ...(db.announcements || [])];
    saveDb(db);
};

const updateAnnouncement_localStorage = async (updatedAnnouncement: Announcement): Promise<void> => {
    const db = getDb();
    const index = (db.announcements || []).findIndex(a => a.id === updatedAnnouncement.id);
    if (index > -1) {
        db.announcements![index] = updatedAnnouncement;
        saveDb(db);
    }
};

const deleteAnnouncement_localStorage = async (announcementId: string): Promise<void> => {
    const db = getDb();
    db.announcements = (db.announcements || []).filter(a => a.id !== announcementId);
    saveDb(db);
};

// ====================================
// SUPABASE IMPLEMENTATION
// ====================================

const getAnnouncements_supabase = async (): Promise<Announcement[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false }) as any;

    if (error) {
        handleSupabaseError(error, 'getAnnouncements');
    }

    return (data || []).map(a => ({
        id: a.id,
        title: a.title,
        content: a.content,
        createdAt: a.created_at,
    }));
};

const addAnnouncement_supabase = async (announcement: Omit<Announcement, 'id' | 'createdAt'>): Promise<void> => {
    const supabase = getSupabase();
    const { error } = await supabase
        .from('announcements')
        .insert({
            title: announcement.title,
            content: announcement.content,
        } as any);

    if (error) {
        handleSupabaseError(error, 'addAnnouncement');
    }
};

const updateAnnouncement_supabase = async (updatedAnnouncement: Announcement): Promise<void> => {
    const supabase = getSupabase();
    const { error } = await supabase
        .from('announcements')
        .update({
            title: updatedAnnouncement.title,
            content: updatedAnnouncement.content,
        } as any)
        .eq('id', updatedAnnouncement.id);

    if (error) {
        handleSupabaseError(error, 'updateAnnouncement');
    }
};

const deleteAnnouncement_supabase = async (announcementId: string): Promise<void> => {
    const supabase = getSupabase();
    const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', announcementId);

    if (error) {
        handleSupabaseError(error, 'deleteAnnouncement');
    }
};

// ====================================
// PUBLIC API - Auto-detects mode
// ====================================

export const getAnnouncements = async (): Promise<Announcement[]> => {
    if (isSupabaseConfigured()) {
        return await getAnnouncements_supabase();
    }
    return await getAnnouncements_localStorage();
};

export const addAnnouncement = async (announcement: Omit<Announcement, 'id' | 'createdAt'>): Promise<void> => {
    if (isSupabaseConfigured()) {
        return await addAnnouncement_supabase(announcement);
    }
    return await addAnnouncement_localStorage(announcement);
};

export const updateAnnouncement = async (updatedAnnouncement: Announcement): Promise<void> => {
    if (isSupabaseConfigured()) {
        return await updateAnnouncement_supabase(updatedAnnouncement);
    }
    return await updateAnnouncement_localStorage(updatedAnnouncement);
};

export const deleteAnnouncement = async (announcementId: string): Promise<void> => {
    if (isSupabaseConfigured()) {
        return await deleteAnnouncement_supabase(announcementId);
    }
    return await deleteAnnouncement_localStorage(announcementId);
};
