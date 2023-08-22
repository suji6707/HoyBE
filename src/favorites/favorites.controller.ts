import { Controller, Get, Param, Query } from '@nestjs/common';
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
}
