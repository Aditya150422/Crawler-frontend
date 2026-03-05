const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "An error occurred" }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Auth endpoints
  async register(data: { email: string; username: string; password: string }) {
    const response = await fetch(`${this.baseUrl}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return this.handleResponse<{ access_token: string; token_type: string }>(response);
  }

  async login(email: string, password: string) {
    const response = await fetch(`${this.baseUrl}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return this.handleResponse<{ access_token: string; token_type: string }>(response);
  }

  async getMe() {
    const response = await fetch(`${this.baseUrl}/users/me`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<{
      id: string;
      email: string;
      username: string;
      created_at: string;
      is_active: boolean;
    }>(response);
  }

  async updateMe(data: { username?: string; email?: string }) {
    const response = await fetch(`${this.baseUrl}/users/me`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async deleteMe() {
    const response = await fetch(`${this.baseUrl}/users/me`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getMyJobs() {
    const response = await fetch(`${this.baseUrl}/users/me/jobs`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<{ jobs: unknown[]; count: number }>(response);
  }

  async getMyCollections() {
    const response = await fetch(`${this.baseUrl}/users/me/collections`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<{ collections: unknown[]; count: number }>(response);
  }

  // Collection endpoints
  async createCollection(data: {
    name: string;
    url: string;
    max_pages?: number;
    max_depth?: number;
    user_id?: string;
  }) {
    const response = await fetch(`${this.baseUrl}/collections/`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<{
      collection_id: string;
      job_id: string;
      name: string;
      url: string;
      status: string;
      message: string;
    }>(response);
  }

  async getCollections() {
    const response = await fetch(`${this.baseUrl}/collections/`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<{
      collections: Array<{
        id: string;
        name: string;
        url: string;
        status: string;
        pages_count: number;
        job_id?: string;
        user_id?: string;
        chat_sessions: unknown[];
        created_at: string;
        updated_at: string;
      }>;
      count: number;
    }>(response);
  }

  async getCollection(id: string) {
    const response = await fetch(`${this.baseUrl}/collections/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getCollectionByName(name: string) {
    const response = await fetch(`${this.baseUrl}/collections/name/${name}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateCollection(id: string, data: { name?: string }) {
    const response = await fetch(`${this.baseUrl}/collections/${id}`, {
      method: "PATCH",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async deleteCollection(id: string) {
    const response = await fetch(`${this.baseUrl}/collections/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getCollectionJob(id: string) {
    const response = await fetch(`${this.baseUrl}/collections/${id}/job`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Scrape endpoints
  async startScrape(data: {
    start_url: string;
    max_pages?: number;
    max_depth?: number;
    collection_name?: string;
  }) {
    const response = await fetch(`${this.baseUrl}/scrape/start`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<{
      job_id: string;
      message: string;
      status: string;
    }>(response);
  }

  async getJob(jobId: string) {
    const response = await fetch(`${this.baseUrl}/scrape/job/${jobId}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getJobs() {
    const response = await fetch(`${this.baseUrl}/scrape/jobs`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async searchContent(data: { query: string; top_k?: number; collection_name?: string }) {
    const response = await fetch(`${this.baseUrl}/scrape/search`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<{
      query: string;
      results: Array<{
        url: string;
        title: string;
        content: string;
        similarity: number;
      }>;
      count: number;
    }>(response);
  }

  async askQuestion(data: { question: string; top_k?: number; collection_name?: string }) {
    const response = await fetch(`${this.baseUrl}/scrape/ask`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<{
      question: string;
      answer: string | null;
      sources: Array<{
        url: string;
        title: string;
        similarity: number;
        content?: string;
      }>;
      error?: string;
    }>(response);
  }

  async checkCrawled(url: string) {
    const response = await fetch(`${this.baseUrl}/scrape/check-crawled`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ url }),
    });
    return this.handleResponse<{
      is_crawled: boolean;
      collection_name: string | null;
      document_count: number;
      urls: string[];
      message: string;
    }>(response);
  }

  async getStats(collectionName?: string) {
    const url = collectionName
      ? `${this.baseUrl}/scrape/stats?collection_name=${collectionName}`
      : `${this.baseUrl}/scrape/stats`;
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Chat endpoints
  async createChatSession(collectionId: string, title?: string) {
    const response = await fetch(`${this.baseUrl}/chat/sessions`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ collection_id: collectionId, title }),
    });
    return this.handleResponse<{
      id: string;
      collection_id: string;
      title: string;
      messages: unknown[];
      created_at: string;
      updated_at: string;
    }>(response);
  }

  async getChatSessions(collectionId: string) {
    const response = await fetch(`${this.baseUrl}/chat/sessions/${collectionId}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<{
      sessions: Array<{
        id: string;
        collection_id: string;
        title: string;
        messages: unknown[];
        created_at: string;
        updated_at: string;
      }>;
      count: number;
    }>(response);
  }

  async getChatSession(collectionId: string, sessionId: string) {
    const response = await fetch(
      `${this.baseUrl}/chat/session/${collectionId}/${sessionId}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return this.handleResponse(response);
  }

  async deleteChatSession(collectionId: string, sessionId: string) {
    const response = await fetch(
      `${this.baseUrl}/chat/session/${collectionId}/${sessionId}`,
      {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      }
    );
    return this.handleResponse(response);
  }

  async sendMessage(
    collectionId: string,
    sessionId: string,
    message: string,
    topK?: number
  ) {
    const response = await fetch(
      `${this.baseUrl}/chat/message/${collectionId}/${sessionId}`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ message, top_k: topK }),
      }
    );
    return this.handleResponse<{
      user_message: {
        id: string;
        role: string;
        content: string;
        sources: unknown[];
        created_at: string;
      };
      assistant_message: {
        id: string;
        role: string;
        content: string;
        sources: Array<{
          url: string;
          title: string;
          similarity: number;
        }>;
        created_at: string;
      } | null;
      error?: string;
    }>(response);
  }

  async getChatHistory(collectionId: string, sessionId: string) {
    const response = await fetch(
      `${this.baseUrl}/chat/history/${collectionId}/${sessionId}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return this.handleResponse(response);
  }

  // Learning Path endpoints
  async generateLearningPath(urls: string[]) {
    const response = await fetch(`${this.baseUrl}/collections/learning-path`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ urls }),
    });
    return this.handleResponse<{
      modules: Array<{
        id: string;
        title: string;
        description?: string;
      }>;
      nodes: Array<{
        id: string;
        label: string;
        module?: string;
        difficulty: "beginner" | "intermediate" | "advanced";
        type: "core_topic" | "sub_topic";
        position: { x: number; y: number };
      }>;
      edges: Array<{
        source: string;
        target: string;
        type: string;
      }>;
      learning_path: string[];
    }>(response);
  }

  async generateLearningPathForCollection(collectionId: string) {
    const response = await fetch(
      `${this.baseUrl}/collections/${collectionId}/learning-path`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
      }
    );
    return this.handleResponse<{
      modules: Array<{
        id: string;
        title: string;
        description?: string;
      }>;
      nodes: Array<{
        id: string;
        label: string;
        module?: string;
        difficulty: "beginner" | "intermediate" | "advanced";
        type: "core_topic" | "sub_topic";
        position: { x: number; y: number };
      }>;
      edges: Array<{
        source: string;
        target: string;
        type: string;
      }>;
      learning_path: string[];
    }>(response);
  }

  async getCollectionRoutes(collectionId: string) {
    const response = await fetch(
      `${this.baseUrl}/collections/${collectionId}/routes`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return this.handleResponse<{
      collection_id: string;
      job_id: string;
      routes_crawled_count: number;
      routes_not_crawled_count: number;
      routes_crawled: string[];
      routes_not_crawled: string[];
      crawl_summary: Record<string, unknown>;
    }>(response);
  }
}

export const api = new ApiClient();
