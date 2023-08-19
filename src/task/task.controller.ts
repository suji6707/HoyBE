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
import { WorkspaceGuard } from 'src/workspace.guard';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dtos/create-task.dto';
import { CommentService } from 'src/comment/comment.service';

@Controller('workspace/:workspaceId/tasks')
export class TaskController {
  constructor(
    private taskService: TaskService,
    private commentService: CommentService,
  ) {}

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

  // task 상세 조회 (with Comments)
  @UseGuards(AuthGuard, WorkspaceGuard)
  @Get(':taskId')
  async viewTask(@Param('taskId') taskId: number, @Req() req) {
    const userId = req.userId;
    const task = await this.taskService.viewTask(taskId);
    const comments = await this.commentService.viewComment(userId, taskId);
    return { task, comments };
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
