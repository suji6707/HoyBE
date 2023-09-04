import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entity/group.entity';
import { Workspace } from 'src/workspace/entity/workspace.entity';
import { User } from 'src/users/entity/user.entity';
import { GroupController } from './group.controller';
import { WorkspaceMember } from 'src/workspace/entity/workspace_member.entity';
import { WorkspaceGuard } from 'src/workspace.guard';
import { WorkspaceService } from 'src/workspace/workspace.service';
import { WorkspaceInvitation } from 'src/workspace/entity/workspace_invitations.entity';
import { FavoritesService } from 'src/favorites/favorites.service';
import { Favorites } from 'src/favorites/entity/favorites.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Group,
      Workspace,
      User,
      WorkspaceMember,
      WorkspaceInvitation,
      Favorites,
    ]),
  ],
  providers: [GroupService, WorkspaceService, FavoritesService, WorkspaceGuard],
  exports: [GroupService],
  controllers: [GroupController],
})
export class GroupModule {}
