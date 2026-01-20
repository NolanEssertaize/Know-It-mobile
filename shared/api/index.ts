/**
 * @file index.ts
 * @description API Module - Centralized exports
 */

// Configuration
export { API_BASE_URL, API_VERSION, API_ENDPOINTS, API_TIMEOUT, UPLOAD_TIMEOUT } from './config';

// HTTP Client
export { api, apiRequest, uploadFile, ApiException, TokenManager, STORAGE_KEYS } from './client';

// Types
export type {
    // Auth
    AuthProvider,
    UserCreate,
    UserLogin,
    UserRead,
    UserUpdate,
    Token,
    TokenRefresh,
    AuthResponse,
    PasswordChange,
    MessageResponse,
    AuthError,
    // Transcription
    TranscriptionResponse,
    TranscriptionError,
    // Analysis
    AnalysisResult,
    AnalysisRequest,
    AnalysisResponse,
    AnalysisError,
    // Session
    SessionRead,
    // Topic
    TopicCreate,
    TopicRead,
    TopicDetail,
    TopicUpdate,
    TopicList,
    TopicError,
    // Generic
    ValidationError,
    HTTPValidationError,
    ApiError,
    PaginationParams,
} from './types';