import { Injectable } from "@nestjs/common";
import { RunEvent } from "@agent-flow/shared";
import { RunStore } from "../store/run-store";
import { ToolRegistry } from "./tools/registry";
import { OpenAIClient } from "./llm/openai-client";

@Injectable()
export class RunExecutor {
  constructor(
    private readonly store: RunStore,
    private readonly tools: ToolRegistry,
    private readonly llm: OpenAIClient
  ) {}

  async execute(run: { runId: string; workflow: { id: string }; input: { url: string } }) {
    const runId = run.runId;
    this.emit(runId, "run_started", { workflowId: run.workflow.id, input: run.input });

    try {
      this.emit(runId, "step_started", { stepId: "fetch" });
      this.emit(runId, "tool_called", { tool: "fetch_url", input: { url: run.input.url } });
      const fetchResult = await this.tools.call("fetch_url", { url: run.input.url });
      this.emit(runId, "tool_result", { tool: "fetch_url", output: { textLength: fetchResult.text.length } });

      this.emit(runId, "step_started", { stepId: "summarize" });
      const prompt = this.buildPrompt(fetchResult.text);
      const response = await this.llm.streamJson(prompt, (chunk) => {
        this.emit(runId, "llm_chunk", { chunk });
      });

      const output = safeParseJson(response);
      this.emit(runId, "run_succeeded", { output });
      this.store.complete(runId, output);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.emit(runId, "run_failed", { error: message });
      this.store.fail(runId, message);
    }
  }

  private emit(runId: string, type: RunEvent["type"], data?: Record<string, unknown>) {
    const event: RunEvent = {
      runId,
      type,
      timestamp: new Date().toISOString(),
      data
    };
    this.store.appendEvent(runId, event);
  }

  private buildPrompt(text: string) {
    return [
      "You are a helpful assistant. Summarize the following article into strict JSON with fields:",
      "{\\n  \"title\": string,\n  \"summary\": string,\n  \"key_points\": string[]\n}",
      "Do not include extra commentary. Respond with JSON only.",
      "\nArticle:\n",
      text
    ].join("\n");
  }
}

export function safeParseJson(text: string) {
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as Record<string, unknown>;
      } catch {
        return { raw: text } as Record<string, unknown>;
      }
    }
    return { raw: text } as Record<string, unknown>;
  }
}
