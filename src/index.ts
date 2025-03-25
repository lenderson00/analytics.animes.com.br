import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "hono/adapter";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ElasticsearchService } from "./services/elasticsearch";
import { UAParser } from "@ua-parser-js/pro-personal";
import { UAAgenteParser } from "./services/ua-agent";
import { LocationParser } from "./services/location";

type ENVIRONMENT = {
  ELASTICSEARCH_URL: string;
  ELASTICSEARCH_EVENTS_API_KEY: string;
  APP_URL: string;
};

const app = new Hono<{ Bindings: ENVIRONMENT }>();

app.use(cors());

const eventSchema = zValidator(
  "json",
  z.object({
    o: z.string(),
    sv: z.string(),
    sdkn: z.string(),
    sdkv: z.string(),
    ts: z.number(),
    r: z.string(),
    en: z.string().optional(),
    ed: z.any().optional(),
  })
);

app.post("/view", eventSchema, async (c) => {
  const { ELASTICSEARCH_URL, ELASTICSEARCH_EVENTS_API_KEY } =
    env<ENVIRONMENT>(c);
  const { o, ts, r, en, ed } = c.req.valid("json");

  const elasticsearch = new ElasticsearchService({
    url: ELASTICSEARCH_URL,
    apiKey: ELASTICSEARCH_EVENTS_API_KEY,
  });

  const uaParser = new UAParser(c.req.header("User-Agent"));
  const uaAgentParser = new UAAgenteParser(uaParser);

  // @ts-ignore
  const cf = c.req.cf as {
    city?: string;
    country?: string;
    region?: string;
    timezone?: string;
  };

  const locationParser = new LocationParser(cf);

  try {
    const eventData = {
      origin: o,
      timestamp: new Date(ts),
      requestId: r,
      eventName: en ?? "",
      eventData: ed ?? {},
      ...uaAgentParser.getAllUserAgentInfo(),
      ...locationParser.getLocation(),
    };

    await elasticsearch.indexEvent(eventData);

    return c.json({ success: true }, 200);
  } catch (error) {
    console.error("Elasticsearch error:", error);
    return c.json({ error: "Failed to index event" }, 500);
  }
});

app.all("*", (c) => {
  return c.json(
    {
      message: "bad request",
    },
    {
      status: 400,
    }
  );
});

export default app;
