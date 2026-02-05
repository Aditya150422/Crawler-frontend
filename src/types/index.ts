// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
  is_active: boolean;
}

export interface UserCreate {
  email: string;
  username: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserUpdate {
  username?: string;
  email?: string;
  is_active?: boolean;
}

export interface Token {
  access_token: string;
  token_type: string;
}

// Collection Types
export interface Collection {
  id: string;
  name: string;
  url: string;
  status: "pending" | "crawling" | "embedding" | "completed" | "error";
  pages_count: number;
  job_id?: string;
  user_id?: string;
  chat_sessions: ChatSession[];
  created_at: string;
  updated_at: string;
  vector_stats?: Record<string, unknown>;
}

export interface CreateCollectionRequest {
  name: string;
  url: string;
  max_pages?: number;
  max_depth?: number;
  user_id?: string;
}

export interface CreateCollectionResponse {
  collection_id: string;
  job_id: string;
  name: string;
  url: string;
  status: string;
  message: string;
}

// Job Types
export interface ScrapeJob {
  id: string;
  job_id?: string;
  url: string;
  status: "pending" | "crawling" | "embedding" | "completed" | "error";
  pages_stored: number;
  pages_crawled?: number;
  collection_name: string;
  error?: string;
  created_at: string;
  updated_at: string;
}

export interface ScrapeRequest {
  start_url: string;
  max_pages?: number;
  max_depth?: number;
  collection_name?: string;
}

// Search Types
export interface SearchRequest {
  query: string;
  top_k?: number;
  collection_name?: string;
}

export interface SearchResult {
  url: string;
  title: string;
  content: string;
  similarity: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  count: number;
}

// Chat Types
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  sources: ChatSource[];
  created_at: string;
}

export interface ChatSource {
  url: string;
  title: string;
  similarity: number;
  content?: string;
}

export interface ChatSession {
  id: string;
  collection_id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface CreateSessionRequest {
  collection_id: string;
  title?: string;
}

export interface SendMessageRequest {
  message: string;
  top_k?: number;
}

export interface MessageExchangeResponse {
  user_message: ChatMessage;
  assistant_message: ChatMessage | null;
  error?: string;
}

// Socket.IO Event Types
export interface ProgressEvent {
  job_id: string;
  current: number;
  total: number;
  percentage: number;
  message: string;
  stage: "crawling" | "embedding";
}

export interface JobUpdateEvent {
  job_id: string;
  status: string;
  message: string;
  pages_stored?: number;
  pages_crawled?: number;
  error?: string;
}

export interface CollectionUpdateEvent {
  collection_id: string;
  status: string;
  pages_count?: number;
  error?: string;
}
