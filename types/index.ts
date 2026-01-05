export interface AnalysisResult {
    valid: string[];
    corrections: string[];
    missing: string[];
}

export interface Session {
    id: string;
    date: string; // ISO String
    audioUri?: string;
    transcription?: string;
    analysis: AnalysisResult;
}

export interface Topic {
    id: string;
    title: string;
    sessions: Session[];
}