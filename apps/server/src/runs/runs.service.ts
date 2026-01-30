import { Injectable, NotFoundException } from "@nestjs/common";
import { RunEvent, WorkflowDef } from "@agent-flow/shared";
import { WorkflowsService } from "../workflows/workflows.service";
import { RunStore, RunState } from "./store/run-store";
import { RunExecutor } from "./runtime/executor";
import { map } from "rxjs";

@Injectable()
export class RunsService {
  constructor(
    private readonly workflows: WorkflowsService,
    private readonly store: RunStore,
    private readonly executor: RunExecutor
  ) {}

  async createRun(workflowId: string, input: { url: string }) {
    const workflow = this.workflows.getById(workflowId);
    if (!workflow) {
      throw new NotFoundException("Workflow not found");
    }
    const run = this.store.createRun(workflow, input);
    this.executor.execute(run);
    return run.runId;
  }

  getRun(runId: string) {
    const run = this.store.getRun(runId);
    if (!run) {
      throw new NotFoundException("Run not found");
    }
    return run;
  }

  getEvents(runId: string) {
    const stream = this.store.getEventStream(runId);
    if (!stream) {
      throw new NotFoundException("Run not found");
    }
    return stream.asObservable().pipe(map((event) => ({ data: event })));
  }
}

export type RunRecord = {
  runId: string;
  workflow: WorkflowDef;
  input: { url: string };
  status: RunState;
  output?: Record<string, unknown>;
  error?: string;
  events: RunEvent[];
};
