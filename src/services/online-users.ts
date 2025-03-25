import { ElasticsearchService } from "./elasticsearch";

interface OnlineUsersConfig {
  url: string;
  apiKey: string;
  indexName: string;
}

interface ElasticsearchResponse {
  aggregations?: {
    unique_ips?: {
      value: number;
    };
  };
}

export class OnlineUsersService {
  private elasticsearch: ElasticsearchService;
  private readonly ONLINE_THRESHOLD = 1 * 60 * 1000; // 1 minute in milliseconds

  constructor(config: OnlineUsersConfig) {
    this.elasticsearch = new ElasticsearchService({
      url: config.url,
      apiKey: config.apiKey,
    });
  }

  async getOnlineUsers() {
    const now = Date.now();
    const query = {
      size: 0,
      aggs: {
        unique_ips: {
          cardinality: {
            field: "ip",
          },
        },
      },
      query: {
        bool: {
          must: [
            {
              range: {
                timestamp: {
                  gte: new Date(now - this.ONLINE_THRESHOLD).toISOString(),
                },
              },
            },
          ],
        },
      },
    };

    const result = (await this.elasticsearch.searchEvents(
      query
    )) as ElasticsearchResponse;

    return {
      usersOnline: result.aggregations?.unique_ips?.value || 0,
    };
  }
}
