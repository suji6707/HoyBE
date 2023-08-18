import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth.guard';
import { WorkspaceGuard } from 'src/workspace/workspace.guard';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dtos/create-task.dto';

@Controller('workspace/:workspaceId/tasks')
export class TaskController {
  constructor(private taskService: TaskService) {}

  // task 생성
  @UseGuards(AuthGuard, WorkspaceGuard)
  @Post()
  async addTask(
    @Req() req,
    @Param('workspaceId') workspaceId: number,
    @Body() createTaskDto: CreateTaskDto,
    @Query('date') date: string,
  ) {
    const userId = req.userId;
    return await this.taskService.addTask(
      workspaceId,
      userId,
      createTaskDto,
      date,
    );
  }

  // task 조회
  @UseGuards(AuthGuard, WorkspaceGuard)
  @Get()
  async findTasksByDate(
    @Req() req,
    @Param('workspaceId') workspaceId: number,
    @Query('date') date?: string,
  ) {
    const userId = req.userId;
    const tasks = await this.taskService.findTasksByDate(
      workspaceId,
      userId,
      date,
    );
    return tasks;
  }

  // task 수정
  @UseGuards(AuthGuard, WorkspaceGuard)
  @Put(':taskId')
  async updateTask(
    @Param('taskId') taskId: number,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return await this.taskService.updateTask(taskId, createTaskDto);
  }

  // task 삭제
  @UseGuards(AuthGuard, WorkspaceGuard)
  @Delete(':taskId')
  async deleteTask(@Param('taskId') taskId: number) {
    return await this.taskService.deleteTask(taskId);
  }
}
