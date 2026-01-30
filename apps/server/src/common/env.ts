import { config } from "dotenv";

export function loadEnv() {
  config();
  if (!process.env.OPENAI_API_KEY) {
    // eslint-disable-next-line no-console
    console.warn("OPENAI_API_KEY is not set. LLM calls will fail.");
  }
}
