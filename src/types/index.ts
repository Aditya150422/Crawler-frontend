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

// Learning Path Types
export interface LearningModule {
  id: string;
  title: string;
  description?: string;
}

export interface NodePosition {
  x: number;
  y: number;
}

export interface LearningNode {
  id: string;
  label: string;
  module?: string;
  summary?: string;
  description?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  type: "core_topic" | "sub_topic";
  position: NodePosition;
  level?: string; // backward compatibility
}

export interface LearningEdge {
  source: string;
  target: string;
  type: string;
}

export interface LearningPathResponse {
  modules: LearningModule[];
  nodes: LearningNode[];
  edges: LearningEdge[];
  learning_path: string[];
}

export interface GenerateLearningPathRequest {
  urls: string[];
}

export interface LearningNodeSummaryResponse {
  collection_id: string;
  node_id: string;
  node_label: string;
  summary: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  module?: string;
  type: "core_topic" | "sub_topic";
}

// Quiz Types
export type QuizOption = "A" | "B" | "C" | "D";
export type QuizScopeMode = "focused" | "broad";

export interface QuizCollectionInfo {
  collection_id: string;
  name: string;
  url: string;
  available_questions: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: Record<QuizOption, string>;
}

export interface QuizAnswerPayload {
  question_id: string;
  selected_option: QuizOption;
}

export interface QuizWrongAnswer {
  question_id: string;
  question: string;
  selected_option: QuizOption;
  correct_option: QuizOption;
  options: Record<QuizOption, string>;
  explanation: string;
}

export interface QuizStartResponse {
  quiz_session_id: string;
  collection_id: string;
  total_questions: number;
  questions: QuizQuestion[];
  created_at: string;
}

export interface QuizStartRequest {
  collection_id: string;
  question_count: number;
  user_id?: string;
  scope_mode: QuizScopeMode;
  focus_query?: string;
  min_semantic_score?: number;
  max_questions_per_url?: number;
  min_distinct_urls?: number;
  use_llm_classifier?: boolean;
}

export interface QuizSubmitResponse {
  quiz_session_id: string;
  score: number;
  total_questions: number;
  percentage: number;
  wrong_answers: QuizWrongAnswer[];
  llm_suggestions: string;
  completed_at: string;
}
