import { z } from "zod";

export interface ElasticsearchConfig {
  url: string;
  apiKey: string;
}

export interface EventData {
  origin: string;
  timestamp: Date;
  requestId: string;
  eventName: string;
  eventData: unknown;
}

export class ElasticsearchService {
  private config: ElasticsearchConfig;

  constructor(config: ElasticsearchConfig) {
    this.config = config;
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.config.url}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `ApiKey ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Elasticsearch error: ${JSON.stringify(error)}`);
    }

    return response.json();
  }

  async indexEvent(eventData: EventData) {
    const document = {
      ...eventData,
      timestamp: eventData.timestamp.toISOString(),
    };

    return this.fetchWithAuth("/events/_doc", {
      method: "POST",
      body: JSON.stringify(document),
    });
  }

  async searchEvents(query: {
    from?: number;
    size?: number;
    sort?: Array<{ [key: string]: "asc" | "desc" }>;
    query?: {
      bool?: {
        must?: Array<{ [key: string]: any }>;
        filter?: Array<{ [key: string]: any }>;
      };
    };
  }) {
    return this.fetchWithAuth("/events/_search", {
      method: "POST",
      body: JSON.stringify(query),
    });
  }
}
