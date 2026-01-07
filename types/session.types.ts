/**
 * @file session.types.ts
 * @description Types relatifs aux sessions d'enregistrement et analyses
 */

export interface AnalysisResult {
  readonly valid: string[];
  readonly corrections: string[];
  readonly missing: string[];
}

export interface Session {
  readonly id: string;
  readonly date: string;
  readonly audioUri?: string;
  readonly transcription?: string;
  readonly analysis: AnalysisResult;
}

export type RecordingState = 'idle' | 'recording' | 'analyzing' | 'complete';
