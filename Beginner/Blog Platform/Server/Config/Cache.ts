import redis from "redis";
import { REDIS_URL } from "./Env.js";

export const cacheClient = redis.createClient({
  url: REDIS_URL!,
});

export async function get(key: string): Promise<any> {
  try {
    const resource = await cacheClient.hGetAll(key);
    return resource;
  } catch (error) {
    Error((error as Error).message, error as Error);
  }
}

export async function set(key: string, value: any): Promise<void> {
  try {
    await cacheClient.hSet(key, value);
  } catch (error) {
    Error((error as Error).message, error as Error);
  }
}
