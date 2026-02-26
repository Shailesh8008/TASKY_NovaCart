import "dotenv/config";
import { defineConfig } from "prisma/config";

if (!process.env.DIRECT_URL) {
  throw new Error("DIRECT_URL is not set");
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
