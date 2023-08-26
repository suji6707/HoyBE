import { Module } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceController } from './workspace.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from 'src/task/entity/task.entity';
import { Workspace } from './entity/workspace.entity';
import { User } from 'src/users/entity/user.entity';
import { EmailService } from './email.service';
import { WorkspaceInvitation } from './entity/workspace_invitations.entity';
import { WorkspaceMember } from './entity/workspace_member.entity';
import { WorkspaceGuard } from '../workspace.guard';
import { GroupService } from 'src/group/group.service';
import { Group } from 'src/group/entity/group.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Task,
      Workspace,
      User,
      Group,
      WorkspaceMember,
      WorkspaceInvitation,
    ]),
  ],
  providers: [WorkspaceService, GroupService, EmailService, WorkspaceGuard],
  controllers: [WorkspaceController],
  exports: [WorkspaceService, TypeOrmModule],
})
export class WorkspaceModule {}
