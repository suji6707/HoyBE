import { Module } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceController } from './workspace.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from 'src/task/entity/task.entity';
import { Workspace } from './entity/workspace.entity';
import { User } from 'src/users/entity/user.entity';
import { GroupModule } from 'src/group/group.module';
import { EmailService } from './email.service';
import { WorkspaceInvitation } from './entity/workspace_invitations.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Workspace, User, WorkspaceInvitation]),
    GroupModule,
  ],
  providers: [WorkspaceService, EmailService],
  controllers: [WorkspaceController],
})
export class WorkspaceModule {}
