import { Module } from '@nestjs/common';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceService } from 'src/workspace/workspace.service';
import { WorkspaceGuard } from 'src/workspace.guard';
import { Favorites } from './entity/favorites.entity';
import { WorkspaceMember } from 'src/workspace/entity/workspace_member.entity';
import { Workspace } from 'src/workspace/entity/workspace.entity';
import { WorkspaceInvitation } from 'src/workspace/entity/workspace_invitations.entity';
import { User } from 'src/users/entity/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Favorites,
      User,
      WorkspaceMember,
      Workspace,
      WorkspaceInvitation,
    ]),
  ],
  controllers: [FavoritesController],
  providers: [FavoritesService, WorkspaceService, WorkspaceGuard],
})
export class FavoritesModule {}
