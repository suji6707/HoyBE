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
import { UpdateTaskDto } from './dtos/update-task.dto';

@Controller('workspace/:workspaceId/tasks')
export class TaskController {
  constructor(
    private taskService: TaskService,
    private commentService: CommentService,
  ) {}

  // task 생성
  @UseGuards(AuthGuard, WorkspaceGuard)
  @Post()
  async createTask(
    @Req() req,
    @Param('workspaceId') workspaceId: number,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    const userId = req.userId;
    return await this.taskService.createTask(
      workspaceId,
      userId,
      createTaskDto,
    );
  }

  // 나의 task 조회 (3일치)
  @UseGuards(AuthGuard, WorkspaceGuard)
  @Get()
  async getTasksByDate(
    @Req() req,
    @Param('workspaceId') workspaceId: number,
    @Query('date') date?: string,
  ) {
    const userId = req.userId;
    const tasks = await this.taskService.getTasksByDate(
      workspaceId,
      userId,
      date,
    );
    return tasks;
  }

  // 그룹 멤버 - 한 유저의 tasks 조회
  @UseGuards(AuthGuard, WorkspaceGuard)
  @Get('member/:userId')
  async getTasksByUser(
    @Param('workspaceId') workspaceId: number,
    @Param('userId') userId: number,
    @Query('date') date: string,
  ) {
    const tasks = await this.taskService.getTasksByUser(
      workspaceId,
      userId,
      date,
    );
    return tasks;
  }

  // 즐겨찾기 - 한 유저의 3일치 tasks 조회
  @UseGuards(AuthGuard, WorkspaceGuard)
  @Get('member/:userId/three-days')
  async get3DaysTasksForUser(
    @Param('workspaceId') workspaceId: number,
    @Param('userId') userId: number,
    @Query('date') date?: string,
  ) {
    const tasks = await this.taskService.getTasksByDate(
      workspaceId,
      userId,
      date,
    );
    return tasks;
  }

  // task 상세 조회 (with Comments)
  @UseGuards(AuthGuard, WorkspaceGuard)
  @Get(':taskId')
  async getTaskDetail(
    @Param('workspaceId') workspaceId: number,
    @Param('taskId') taskId: number,
    @Req() req,
  ) {
    const userId = req.userId;
    const { user, task } = await this.taskService.getTaskDetail(userId, taskId);
    const comments = await this.commentService.viewComment(
      userId, // task 작성자
      workspaceId,
      taskId,
    );
    return { user, task, comments };
  }

  // task 수정 - todo 완료 표시
  @UseGuards(AuthGuard, WorkspaceGuard)
  @Put(':taskId/status')
  async updateTaskStatus(@Param('taskId') taskId: number) {
    return await this.taskService.updateTaskStatus(taskId);
  }

  // task 수정 - 중요도 표시
  @UseGuards(AuthGuard, WorkspaceGuard)
  @Put(':taskId/priority')
  async updateTaskPriority(@Param('taskId') taskId: number) {
    return await this.taskService.updateTaskPriority(taskId);
  }

  // task 수정 - todo 디테일 수정
  @UseGuards(AuthGuard, WorkspaceGuard)
  @Put(':taskId/detail')
  async updateTaskDetail(
    @Param('taskId') taskId: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    console.log('fr: updateTaskDto: ', updateTaskDto);
    return await this.taskService.updateTaskDetail(taskId, updateTaskDto);
  }

  // task 수정 - 날짜 변경
  @UseGuards(AuthGuard, WorkspaceGuard)
  @Put(':taskId/drag')
  async updateTaskDate(
    @Param('taskId') taskId: number,
    @Body('date') date: string,
  ) {
    return await this.taskService.updateTaskDate(taskId, date);
  }

  // task 삭제
  @UseGuards(AuthGuard, WorkspaceGuard)
  @Delete(':taskId')
  async deleteTask(@Param('taskId') taskId: number) {
    return await this.taskService.deleteTask(taskId);
  }
}
