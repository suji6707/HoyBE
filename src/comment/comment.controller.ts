import { Body, Controller, Param, Post, Req } from '@nestjs/common';
import { Comment } from './entity/comment.entity';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dtos/create-comment.dto';

@Controller('workspace/:workspaceId/tasks/:taskId/comment')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Post()
  async addComment(
    @Req() req,
    @Param('taskId') taskId: number,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const userId = req.userId;
    await this.commentService.addComment(userId, taskId, createCommentDto);
  }
}
