import { Body, Controller, Get, MessageEvent, Param, Post, Sse } from "@nestjs/common";
import { Observable } from "rxjs";
import { RunsService } from "./runs.service";
import { CreateRunDto } from "./dto";

@Controller("runs")
export class RunsController {
  constructor(private readonly runs: RunsService) {}

  @Post()
  async create(@Body() body: CreateRunDto) {
    const runId = await this.runs.createRun(body.workflowId, body.input);
    return { runId };
  }

  @Get(":runId")
  get(@Param("runId") runId: string) {
    return this.runs.getRun(runId);
  }

  @Sse(":runId/events")
  events(@Param("runId") runId: string): Observable<MessageEvent> {
    return this.runs.getEvents(runId);
  }
}
