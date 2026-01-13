import { getSupabase, isSupabaseConfigured, handleSupabaseError } from '../lib/supabase';
import type { Journal } from '../types';

const DB_KEY = 'physcio_app_data';

const initialJournalData: Omit<Journal, 'id'>[] = [
    { title: 'Journal of Orthopaedic & Sports Physical Therapy (JOSPT)', publisher: 'JOSPT', year: 1979, link: 'https://www.jospt.org/' },
    { title: 'Physical Therapy Journal (PTJ)', publisher: 'Oxford University Press', year: 1921, link: 'https://academic.oup.com/ptj' },
    { title: 'PubMed', publisher: 'National Library of Medicine (NLM)', year: 1996, link: 'https://pubmed.ncbi.nlm.nih.gov/' },
    { title: 'The Lancet', publisher: 'Elsevier', year: 1823, link: 'https://www.thelancet.com/' },
    { title: 'ResearchGate', publisher: 'ResearchGate GmbH', year: 2008, link: 'https://www.researchgate.net/' },
    { title: 'British Journal of Sports Medicine (BJSM)', publisher: 'BMJ', year: 1964, link: 'https://bjsm.bmj.com/' },
    { title: 'Archives of Physical Medicine and Rehabilitation', publisher: 'Elsevier', year: 1920, link: 'https://www.archives-pmr.org/' },
];

// ====================================
// LOCALSTORAGE IMPLEMENTATION
// ====================================

const getDb = (): { users: any[], announcements?: any[], journals?: Journal[] } => {
    try {
        const data = localStorage.getItem(DB_KEY);
        const parsed = data ? JSON.parse(data) : { users: [], announcements: [], journals: [] };

        if (!parsed.journals) {
            parsed.journals = initialJournalData.map((j, index) => ({ ...j, id: `journal_${index + 1}` }));
        }

        return parsed;
    } catch (error) {
        console.error("Failed to parse data from localStorage", error);
        return { users: [], announcements: [], journals: [] };
    }
};

const saveDb = (db: { users: any[], announcements?: any[], journals?: Journal[] }) => {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
};

// Initialize DB with journals if they don't exist (localStorage only)
if (!isSupabaseConfigured()) {
    const db = getDb();
    saveDb(db);
}

const getJournals_localStorage = async (): Promise<Journal[]> => {
    const db = getDb();
    return (db.journals || []).sort((a, b) => a.title.localeCompare(b.title));
};

const addJournal_localStorage = async (journal: Omit<Journal, 'id'>): Promise<void> => {
    const db = getDb();
    const newJournal: Journal = {
        ...journal,
        id: `journal_${Date.now()}`,
    };
    db.journals = [newJournal, ...(db.journals || [])];
    saveDb(db);
};

const deleteJournal_localStorage = async (journalId: string): Promise<void> => {
    const db = getDb();
    db.journals = (db.journals || []).filter(j => j.id !== journalId);
    saveDb(db);
};

// ====================================
// SUPABASE IMPLEMENTATION
// ====================================

const getJournals_supabase = async (): Promise<Journal[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('journals')
        .select('*')
        .order('title') as any;

    if (error) {
        handleSupabaseError(error, 'getJournals');
    }

    return (data || []).map(j => ({
        id: j.id,
        title: j.title,
        publisher: j.publisher,
        year: j.year,
        link: j.link,
    }));
};

const addJournal_supabase = async (journal: Omit<Journal, 'id'>): Promise<void> => {
    const supabase = getSupabase();
    const { error } = await supabase
        .from('journals')
        .insert({
            title: journal.title,
            publisher: journal.publisher,
            year: journal.year,
            link: journal.link,
        } as any);

    if (error) {
        handleSupabaseError(error, 'addJournal');
    }
};

const deleteJournal_supabase = async (journalId: string): Promise<void> => {
    const supabase = getSupabase();
    const { error } = await supabase
        .from('journals')
        .delete()
        .eq('id', journalId);

    if (error) {
        handleSupabaseError(error, 'deleteJournal');
    }
};

// ====================================
// PUBLIC API - Auto-detects mode
// ====================================

export const getJournals = async (): Promise<Journal[]> => {
    if (isSupabaseConfigured()) {
        return await getJournals_supabase();
    }
    return await getJournals_localStorage();
};

export const addJournal = async (journal: Omit<Journal, 'id'>): Promise<void> => {
    if (isSupabaseConfigured()) {
        return await addJournal_supabase(journal);
    }
    return await addJournal_localStorage(journal);
};

export const deleteJournal = async (journalId: string): Promise<void> => {
    if (isSupabaseConfigured()) {
        return await deleteJournal_supabase(journalId);
    }
    return await deleteJournal_localStorage(journalId);
};