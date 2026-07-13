import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../../generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Environment variable DATABASE_URL is not set");

}

let client: PrismaClient | null = null;

export function getClient(): PrismaClient {
  client ??= new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl })

  });

  return client;

}
