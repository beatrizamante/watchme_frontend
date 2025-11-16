import "dotenv";
import { Env, EnvType } from "./infrastructure/api/_lib/env";

const env = Env.string("ENVIRONMENT", "development") as EnvType;

const http = {
  baseUrl: Env.string("SERVER_BASE_URL", "http://localhost:3000"),
};

const config = { env, http };

type Config = typeof config;

export { config };
export type { Config };
