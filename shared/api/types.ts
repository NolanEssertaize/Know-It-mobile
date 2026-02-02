/**
 * @file shared/api/types.ts
 * @description API request/response types
 */

import type { Topic, Session, User, Analysis } from '@/types';

// ═══════════════════════════════════════════════════════════════════════════
// GENERIC API TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTH API TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export type RegisterResponse = LoginResponse;

// ═══════════════════════════════════════════════════════════════════════════
// TOPIC API TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface CreateTopicRequest {
  title: string;
  category?: string;
}

export interface UpdateTopicRequest {
  title?: string;
  category?: string;
}

export type TopicResponse = Topic;
export type TopicsResponse = Topic[];

// ═══════════════════════════════════════════════════════════════════════════
// SESSION API TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface CreateSessionRequest {
  audio_uri: string;
  duration: number;
}

export type SessionResponse = Session;

// ═══════════════════════════════════════════════════════════════════════════
// ANALYSIS API TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface TranscribeRequest {
  audio_uri: string;
}

export interface TranscribeResponse {
  transcription: string;
}

export interface AnalyzeRequest {
  topic_id: string;
  transcription: string;
}

export interface AnalyzeResponse {
  analysis: Analysis;
}
