import { Controller, Get, NotFoundException, Param } from "@nestjs/common";
import { WorkflowsService } from "./workflows.service";

@Controller("workflows")
export class WorkflowsController {
  constructor(private readonly workflows: WorkflowsService) {}

  @Get()
  list() {
    return this.workflows.list();
  }

  @Get(":id")
  get(@Param("id") id: string) {
    const wf = this.workflows.getById(id);
    if (!wf) {
      throw new NotFoundException("Workflow not found");
    }
    return wf;
  }
}
