import { ElasticsearchService } from "./elasticsearch";

interface OnlineUsersConfig {
  url: string;
  apiKey: string;
  indexName: string;
}

interface ElasticsearchResponse {
  hits: {
    hits: Array<{
      _source: {
        ip?: string;
      };
    }>;
  };
}

export class OnlineUsersService {
  private elasticsearch: ElasticsearchService;
  private readonly ONLINE_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds

  constructor(config: OnlineUsersConfig) {
    this.elasticsearch = new ElasticsearchService({
      url: config.url,
      apiKey: config.apiKey,
    });
  }

  async getOnlineUsers() {
    const now = Date.now();
    const query = {
      size: 10000,
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
    const hits = result.hits?.hits || [];
    const onlineIPs = hits.map((hit) => hit._source.ip).filter(Boolean);

    // Remove duplicate IPs
    const uniqueIPs = [...new Set(onlineIPs)];

    return {
      usersOnline: uniqueIPs.length,
      users: uniqueIPs,
    };
  }
}
