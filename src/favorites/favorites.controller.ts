import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { AuthGuard } from 'src/auth.guard';

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

  @UseGuards(AuthGuard)
  @Post('toggle-user/:userId')
  async addFavorites(
    @Param('workspaceId') workspaceId: number,
    @Param('userId') userId: number,
  ) {
    return await this.favoritesService.toggleFavorites(workspaceId, userId);
  }
}
