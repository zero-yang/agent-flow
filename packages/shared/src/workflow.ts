export type WorkflowStep = {
  id: string;
  type: "tool" | "llm";
  toolName?: string;
  promptTemplate?: string;
};

export type WorkflowDef = {
  id: string;
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  steps: WorkflowStep[];
};
