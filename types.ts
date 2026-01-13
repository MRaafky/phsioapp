export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  notes: string;
}

export interface WeeklyPlan {
  week: number;
  focus: string;
  exercises: Exercise[];
}

export interface ExercisePlan {
  planTitle: string;
  durationWeeks: number;
  weeklyPlans: WeeklyPlan[];
}

export interface Journal {
    // Fix: Changed id from number to string to match implementation where IDs are like 'journal_123'.
    id: string;
    title: string;
    publisher: string;
    year: number;
    link: string;
}

export interface PostureAnalysisResult {
    deviations: {
        area: string;
        deviation: string;
    }[];
    riskLevel: 'Low' | 'Medium' | 'High';
    recommendations: string[];
}

export interface ProgramProgress {
    progressPercent: number;
    currentWeek: number;
    completedSessions: number;
    totalWeeks: number;
    sessionsPerWeek: number;
    weeklyCompletions: number[];
}

export interface AdminMessage {
    id: string;
    text: string;
    timestamp: string;
    read: boolean;
}

export interface PlanHistoryItem {
    planTitle: string;
    durationWeeks: number;
    completedDate: string; // ISO string
    status: 'Completed' | 'Replaced';
}

export interface User {
    id:string;
    name: string;
    email: string;
    age: string;
    weight: string;
    height: string;
    isPremium: boolean;
    activePlan: ExercisePlan | null;
    progressData: ProgramProgress | null;
    messagesFromAdmin: AdminMessage[];
    planHistory: PlanHistoryItem[];
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    createdAt: string;
}