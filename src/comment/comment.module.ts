import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entity/user.entity';
import { Task } from 'src/task/entity/task.entity';
import { Comment } from './entity/comment.entity';
import { WorkspaceModule } from 'src/workspace/workspace.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Task, Comment]), WorkspaceModule],
  providers: [CommentService],
  controllers: [CommentController],
  exports: [CommentService],
})
export class CommentModule {}
