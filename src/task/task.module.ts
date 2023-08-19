import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entity/task.entity';
import { Workspace } from 'src/workspace/entity/workspace.entity';
import { CommentModule } from 'src/comment/comment.module';
import { WorkspaceGuard } from 'src/workspace.guard';
import { User } from 'src/users/entity/user.entity';
import { WorkspaceMember } from 'src/workspace/entity/workspace_member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Workspace, User, WorkspaceMember]),
    CommentModule,
  ],
  providers: [TaskService, WorkspaceGuard],
  controllers: [TaskController],
})
export class TaskModule {}
