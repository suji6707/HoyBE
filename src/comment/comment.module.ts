import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entity/user.entity';
import { Task } from 'src/task/entity/task.entity';
import { Comment } from './entity/comment.entity';
import { WorkspaceGuard } from 'src/workspace.guard';
import { WorkspaceMember } from 'src/workspace/entity/workspace_member.entity';
import { Workspace } from 'src/workspace/entity/workspace.entity';
import { Alarm } from 'src/alarm/entity/alarm.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Task,
      Comment,
      Alarm,
      WorkspaceMember,
      Workspace,
    ]),
  ],
  providers: [CommentService, WorkspaceGuard],
  controllers: [CommentController],
  exports: [CommentService],
})
export class CommentModule {}
