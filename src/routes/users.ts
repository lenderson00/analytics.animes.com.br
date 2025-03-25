import { Hono } from "hono";
import { OnlineUsersService } from "../services/online-users";

type Bindings = {
  ELASTICSEARCH_URL: string;
  ELASTICSEARCH_EVENTS_API_KEY: string;
  ELASTICSEARCH_INDEX_ONLINE_USERS: string;
};

const users = new Hono<{ Bindings: Bindings }>();

users.get("/online", async (c) => {
  try {
    const onlineUsersService = new OnlineUsersService({
      url: c.env.ELASTICSEARCH_URL,
      apiKey: c.env.ELASTICSEARCH_EVENTS_API_KEY,
      indexName: c.env.ELASTICSEARCH_INDEX_ONLINE_USERS,
    });

    const onlineUsers = await onlineUsersService.getOnlineUsers();
    return c.json(onlineUsers);
  } catch (error) {
    console.error("Failed to fetch online users:", error);
    return c.json({ error: "Failed to fetch online users" }, 500);
  }
});

export default users;
