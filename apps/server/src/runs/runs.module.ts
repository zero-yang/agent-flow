import { Module } from "@nestjs/common";
import { WorkflowsModule } from "../workflows/workflows.module";
import { RunsController } from "./runs.controller";
import { RunsService } from "./runs.service";
import { RunStore } from "./store/run-store";
import { ToolRegistry } from "./runtime/tools/registry";
import { FetchUrlTool } from "./runtime/tools/fetch-url.tool";
import { OpenAIClient } from "./runtime/llm/openai-client";
import { RunExecutor } from "./runtime/executor";

@Module({
  imports: [WorkflowsModule],
  controllers: [RunsController],
  providers: [RunsService, RunStore, ToolRegistry, FetchUrlTool, OpenAIClient, RunExecutor]
})
export class RunsModule {}
