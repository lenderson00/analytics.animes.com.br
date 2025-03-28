import { Context, Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "hono/adapter";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ElasticsearchService } from "./services/elasticsearch";
import { UAParser } from "@ua-parser-js/pro-personal";
import { UAAgenteParser } from "./services/ua-agent";
import { LocationParser } from "./services/location";
import { QueryParams } from "./services/query-params";
import { GeoLocation } from "./services/location";
import users from "./routes/users";

type ENVIRONMENT = {
  ELASTICSEARCH_URL: string;
  ELASTICSEARCH_EVENTS_API_KEY: string;
  ELASTICSEARCH_INDEX_ONLINE_USERS: string;
  APP_URL: string;
};

interface CFRequest extends Request {
  cf: GeoLocation;
}

const app = new Hono<{ Bindings: ENVIRONMENT }>();

app.use(
  cors({
    origin: (origin, c) => {
      if (!origin) return null;
      return origin === "http://localhost:3000" ||
        origin.endsWith("animes.com.br")
        ? origin
        : null;
    },
  })
);

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

const handleEvent = async (c: Context) => {
  const { ELASTICSEARCH_URL, ELASTICSEARCH_EVENTS_API_KEY } =
    env<ENVIRONMENT>(c);
  // @ts-ignore
  const { o, ts, r, en, ed } = c.req.valid("json");

  const elasticsearch = new ElasticsearchService({
    url: ELASTICSEARCH_URL,
    apiKey: ELASTICSEARCH_EVENTS_API_KEY,
  });

  const uaParser = new UAParser(c.req.header("User-Agent"));
  const uaAgentParser = new UAAgenteParser(uaParser);

  const queryParamsParser = new QueryParams(o);

  const queryParams = queryParamsParser.getQueryParams();
  const utmParams = queryParamsParser.getUtmParams();

  const ip = c.req.header("CF-Connecting-IP");
  const cf = (c.req.raw as CFRequest).cf;

  const locationParser = new LocationParser(cf);

  try {
    const eventData = {
      origin: o,
      timestamp: new Date(ts),
      referrer: r,
      eventName: en ?? "page_view",
      eventData: ed ?? {},
      ...uaAgentParser.getAllUserAgentInfo(),
      ...locationParser.getLocation(),
      queryParams,
      utmParams,
      ip,
    };

    await elasticsearch.indexEvent(eventData);

    return c.json({ success: true }, 200);
  } catch (error) {
    console.error("Elasticsearch error:", error);
    return c.json({ error: "Failed to index event" }, 500);
  }
};

app.post("/view", eventSchema, handleEvent);
app.post("/event", eventSchema, handleEvent);

app.route("/users", users);

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
