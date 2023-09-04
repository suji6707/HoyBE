import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { AuthGuard } from 'src/auth.guard';
import { WorkspaceService } from 'src/workspace/workspace.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('Authorization')
@Controller('workspace/:workspaceId/favorites')
export class FavoritesController {
  constructor(
    private favoritesService: FavoritesService,
    private workspaceService: WorkspaceService,
  ) {}

  // 사이드바 즐겨찾기 멤버 조회
  @UseGuards(AuthGuard)
  @Get()
  async getFavorites(@Req() req, @Param('workspaceId') workspaceId: number) {
    const userId = req.userId;
    return await this.favoritesService.getFavorites(userId, workspaceId);
  }

  // Flow 순서
  // 1. 즐겨찾기 가능한 멤버 조회 = getAvailableUsers + favorites 조건 flag
  @UseGuards(AuthGuard)
  @Get('available-users')
  async getAvailableUsers(
    @Req() req,
    @Param('workspaceId') workspaceId: number,
  ) {
    const userId = req.userId;
    const availableUsers = await this.workspaceService.getAvailableUsers(
      workspaceId,
    );
    const availableUsersWithMe =
      await this.workspaceService.addMeToWorkspaceMembers(
        availableUsers,
        userId,
      );

    const favoriteMembers = await this.favoritesService.getFavoriteMemberIds(
      userId,
      workspaceId,
    );

    // Add flag
    const workspaceMembers = availableUsersWithMe.map((member, index) => {
      return {
        ...member,
        flag: index === 0 || favoriteMembers.includes(member.userId),
      };
    });

    return workspaceMembers;
  }

  // 2. 멤버 검색
  @UseGuards(AuthGuard)
  @Get('search')
  async searchMembers(
    @Req() req,
    @Param('workspaceId') workspaceId: number,
    @Query('query') query: string,
  ) {
    const userId = req.userId;
    const resultMembers = await this.workspaceService.searchMembers(
      workspaceId,
      query,
    );

    const favoriteMembers = await this.favoritesService.getFavoriteMemberIds(
      userId,
      workspaceId,
    );

    const queryResult = resultMembers.map((member) => {
      return {
        ...member,
        flag: favoriteMembers.includes(member.user_id),
      };
    });
    return queryResult;
  }

  // 3. 즐겨찾기 추가/삭제
  @UseGuards(AuthGuard)
  @Post('toggle-user/:userId')
  async addFavorites(
    @Req() req,
    @Param('workspaceId') workspaceId: number,
    @Param('userId') userId: number,
  ) {
    const sourceUserId = req.userId;
    return await this.favoritesService.toggleFavorites(
      workspaceId,
      sourceUserId,
      userId,
    );
  }
}
