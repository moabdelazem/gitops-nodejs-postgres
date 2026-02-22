import dotenv from "dotenv";

dotenv.config({ quiet: true });

interface Config {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 6767,
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL || "",
};

export default config;
