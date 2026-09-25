// load .env before anything imports the db module
import { config } from "node:process";

void config;

if (!process.env.DATABASE_URL) {
  const { readFileSync, existsSync } = await import("node:fs");

  if (existsSync(".env")) {
    for (const line of readFileSync(".env", "utf8").split("\n")) {
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].trim();
      }
    }
  }
}
