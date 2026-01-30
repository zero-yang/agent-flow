import { Module } from "@nestjs/common";
import { WorkflowsModule } from "./workflows/workflows.module";
import { RunsModule } from "./runs/runs.module";

@Module({
  imports: [WorkflowsModule, RunsModule]
})
export class AppModule {}
