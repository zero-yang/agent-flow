import { Injectable } from "@nestjs/common";
import { Subject } from "rxjs";
import { RunEvent, WorkflowDef } from "@agent-flow/shared";
import { createId } from "../../common/id";

export type RunState = "running" | "succeeded" | "failed";

export type RunRecord = {
  runId: string;
  workflow: WorkflowDef;
  input: { url: string };
  status: RunState;
  output?: Record<string, unknown>;
  error?: string;
  events: RunEvent[];
  eventStream: Subject<RunEvent>;
};

@Injectable()
export class RunStore {
  private readonly runs = new Map<string, RunRecord>();

  createRun(workflow: WorkflowDef, input: { url: string }) {
    const runId = createId("run");
    const eventStream = new Subject<RunEvent>();
    const record: RunRecord = {
      runId,
      workflow,
      input,
      status: "running",
      events: [],
      eventStream
    };
    this.runs.set(runId, record);
    return record;
  }

  getRun(runId: string) {
    return this.runs.get(runId);
  }

  getEventStream(runId: string) {
    return this.runs.get(runId)?.eventStream;
  }

  appendEvent(runId: string, event: RunEvent) {
    const run = this.runs.get(runId);
    if (!run) return;
    run.events.push(event);
    run.eventStream.next(event);
  }

  complete(runId: string, output: Record<string, unknown>) {
    const run = this.runs.get(runId);
    if (!run) return;
    run.status = "succeeded";
    run.output = output;
    run.eventStream.complete();
  }

  fail(runId: string, message: string) {
    const run = this.runs.get(runId);
    if (!run) return;
    run.status = "failed";
    run.error = message;
    run.eventStream.complete();
  }
}
