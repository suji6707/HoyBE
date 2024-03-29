import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { AuthGuard } from 'src/auth.guard';
import { WorkspaceGuard } from 'src/workspace.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('Authorization')
@Controller('workspace/:workspaceId/tasks/:taskId/comment')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @UseGuards(AuthGuard, WorkspaceGuard)
  @Post()
  async addComment(
    @Req() req,
    @Param('taskId') taskId: number,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const userId = req.userId;
    const comment = await this.commentService.addComment(
      userId,
      taskId,
      createCommentDto,
    );
    return comment;
  }

  @UseGuards(AuthGuard, WorkspaceGuard)
  @Put(':commentId')
  async updateComment(
    @Param('commentId') commentId: number,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return await this.commentService.updateComment(commentId, createCommentDto);
  }

  @UseGuards(AuthGuard, WorkspaceGuard)
  @Delete(':commentId')
  async deleteComment(
    @Param('taskId') taskId: number,
    @Param('commentId') commentId: number,
  ) {
    return await this.commentService.deleteComment(taskId, commentId);
  }
}
