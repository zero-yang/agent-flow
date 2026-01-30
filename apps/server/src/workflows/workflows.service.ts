import { Injectable } from "@nestjs/common";
import { WorkflowDef } from "@agent-flow/shared";

@Injectable()
export class WorkflowsService {
  private readonly workflows: WorkflowDef[] = [
    {
      id: "demo-url-summary",
      name: "Demo URL Summary",
      description: "Fetch a URL, extract text, and summarize into JSON.",
      inputSchema: {
        type: "object",
        properties: {
          url: { type: "string" }
        },
        required: ["url"]
      },
      outputSchema: {
        type: "object",
        properties: {
          title: { type: "string" },
          summary: { type: "string" },
          key_points: { type: "array", items: { type: "string" } }
        },
        required: ["title", "summary", "key_points"]
      },
      steps: [
        { id: "fetch", type: "tool", toolName: "fetch_url" },
        { id: "summarize", type: "llm" }
      ]
    }
  ];

  list() {
    return this.workflows;
  }

  getById(id: string) {
    return this.workflows.find((wf) => wf.id === id);
  }
}
