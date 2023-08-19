import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entity/task.entity';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { Workspace } from 'src/workspace/entity/workspace.entity';
import { CommentModule } from 'src/comment/comment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Workspace]),
    WorkspaceModule,
    CommentModule,
  ],
  providers: [TaskService],
  controllers: [TaskController],
})
export class TaskModule {}
