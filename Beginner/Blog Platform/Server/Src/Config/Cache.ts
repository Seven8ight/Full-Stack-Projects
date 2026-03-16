import redis from "redis";
import { REDIS_URL } from "./Env.js";
import { ErrorMsg } from "../../Utils/Logger.js";

export const cacheClient = redis.createClient({
  url: REDIS_URL!,
});

export function sanitizeForCache(
  obj: Record<string, any>,
): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => {
      if (v === null || v === undefined) return [k, ""];
      if (v instanceof Date) return [k, v.toISOString()];
      if (typeof v === "object") return [k, JSON.stringify(v)];
      if (typeof v == "boolean") return [k, v == true ? 1 : 0];

      return [k, v];
    }),
  );
}

export async function getResource(
  key: string,
): Promise<Record<string, string | string[]> | null> {
  try {
    const resource = await cacheClient.get(key);

    if (resource) return JSON.parse(resource);
    return null;
  } catch (error) {
    ErrorMsg("Redis getResource error:", error as Error);
    throw error;
  }
}

export async function setResource(
  key: string,
  value: any,
  type: "rate" | "other",
  expiry?: number,
): Promise<void> {
  try {
    if (type == "other") await cacheClient.set(key, JSON.stringify(value));
    else await cacheClient.set(key, value);

    if (expiry) {
      await cacheClient.expire(key, expiry);
    }
  } catch (error) {
    ErrorMsg("Redis setResource error:", error as Error);
    throw error;
  }
}

export async function incrementResource(key: string): Promise<number> {
  try {
    const value = await cacheClient.incr(key);
    return value;
  } catch (error) {
    ErrorMsg("Redis incrementResource error:", error as Error);
    throw error;
  }
}

export async function expireResource(
  key: string,
  seconds: number,
): Promise<void> {
  try {
    await cacheClient.expire(key, seconds);
  } catch (error) {
    ErrorMsg("Redis expireResource error:", error as Error);
    throw error;
  }
}

export async function deleteResource(key: string): Promise<void> {
  try {
    await cacheClient.del(key);
  } catch (error) {
    ErrorMsg("Redis deleteResource error:", error as Error);
    throw error;
  }
}
