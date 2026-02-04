/**
 * @file types.ts
 * @description API Types/DTOs matching backend schemas
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUTHENTICATION TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type AuthProvider = 'local' | 'google';

export interface UserCreate {
  readonly email: string;
  readonly password: string;
  readonly full_name?: string | null;
}

export interface UserLogin {
  readonly email: string;
  readonly password: string;
}

export interface UserRead {
  readonly id: string;
  readonly email: string;
  readonly full_name?: string | null;
  readonly picture_url?: string | null;
  readonly auth_provider: AuthProvider;
  readonly is_active: boolean;
  readonly is_verified: boolean;
  readonly created_at: string;
  readonly last_login?: string | null;
}

export interface UserUpdate {
  readonly full_name?: string | null;
  readonly picture_url?: string | null;
}

export interface Token {
  readonly access_token: string;
  readonly refresh_token: string;
  readonly token_type: string;
  readonly expires_in: number;
}

export interface TokenRefresh {
  readonly refresh_token: string;
}

export interface AuthResponse {
  readonly user: UserRead;
  readonly tokens: Token;
}

export interface PasswordChange {
  readonly current_password: string;
  readonly new_password: string;
}

export interface MessageResponse {
  readonly message: string;
}

export interface AuthError {
  readonly error: string;
  readonly code: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// TRANSCRIPTION TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface TranscriptionResponse {
  readonly text: string;
  readonly duration_seconds?: number | null;
  readonly language?: string | null;
}

export interface TranscriptionError {
  readonly error: string;
  readonly code: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// ANALYSIS TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface AnalysisResult {
  readonly valid: string[];
  readonly corrections: string[];
  readonly missing: string[];
}

export interface AnalysisRequest {
  readonly text: string;
  readonly topic_title: string;
  readonly topic_id?: string | null;
}

export interface AnalysisResponse {
  readonly analysis: AnalysisResult;
  readonly session_id?: string | null;
}

export interface AnalysisError {
  readonly error: string;
  readonly code: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// SESSION TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface SessionRead {
  readonly id: string;
  readonly date: string;
  readonly audio_uri?: string | null;
  readonly transcription?: string | null;
  readonly analysis: AnalysisResult;
  readonly topic_id: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// TOPIC TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface TopicCreate {
  readonly title: string;
}

export interface TopicRead {
  readonly id: string;
  readonly title: string;
  readonly created_at: string;
  readonly session_count: number;
  readonly is_favorite?: boolean;
}

export interface TopicDetail {
  readonly id: string;
  readonly title: string;
  readonly created_at: string;
  readonly sessions: SessionRead[];
  readonly is_favorite?: boolean;
}

export interface TopicUpdate {
  readonly title?: string | null;
  readonly is_favorite?: boolean | null;
}

export interface TopicList {
  readonly topics: TopicRead[];
  readonly total: number;
}

export interface TopicError {
  readonly error: string;
  readonly code: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// GENERIC ERROR & VALIDATION TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ValidationError {
  readonly loc: (string | number)[];
  readonly msg: string;
  readonly type: string;
}

export interface HTTPValidationError {
  readonly detail: ValidationError[];
}

// ═══════════════════════════════════════════════════════════════════════════
// API ERROR TYPE (Generic)
// ═══════════════════════════════════════════════════════════════════════════

export interface ApiError {
  readonly error: string;
  readonly code: string;
  readonly status?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGINATION PARAMS
// ═══════════════════════════════════════════════════════════════════════════

export interface PaginationParams {
  readonly skip?: number;
  readonly limit?: number;
}
