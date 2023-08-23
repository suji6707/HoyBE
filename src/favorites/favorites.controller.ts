import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { FavoritesService } from './favorites.service';

@Controller('workspace/:workspaceId/favorites')
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Get('search')
  async searchMembers(
    @Param('workspaceId') workspaceId: number,
    @Query('query') query: string,
  ) {
    return this.favoritesService.searchMembers(workspaceId, query);
  }

  @Post('add-user/:userId')
  async addFavorites(
    @Param('workspaceId') workspaceId: number,
    @Param('userId') userId: number,
  ) {
    return await this.favoritesService.addFavorites(workspaceId, userId);
  }
}
