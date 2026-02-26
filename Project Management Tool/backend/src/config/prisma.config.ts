import "dotenv/config";
import { defineConfig, env } from "prisma/config";

if (!process.env.DIRECT_URL && !process.env.DATABASE_URL) {
  throw new Error("Either DIRECT_URL or DATABASE_URL must be set");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DIRECT_URL,
  },
});
