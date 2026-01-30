export type RunEventType =
  | "run_started"
  | "step_started"
  | "tool_called"
  | "tool_result"
  | "llm_chunk"
  | "run_succeeded"
  | "run_failed";

export type RunEvent = {
  runId: string;
  type: RunEventType;
  timestamp: string;
  data?: Record<string, unknown>;
};
