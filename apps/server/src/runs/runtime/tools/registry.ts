import { Injectable } from "@nestjs/common";
import { FetchUrlTool } from "./fetch-url.tool";

export type ToolCallResult = { text: string };

@Injectable()
export class ToolRegistry {
  constructor(private readonly fetchUrl: FetchUrlTool) {}

  async call(name: string, input: { url: string }): Promise<ToolCallResult> {
    if (name === "fetch_url") {
      return this.fetchUrl.run(input);
    }
    throw new Error(`Unknown tool: ${name}`);
  }
}
