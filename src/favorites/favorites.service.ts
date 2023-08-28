import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Favorites } from './entity/favorites.entity';
import { Repository } from 'typeorm';
import { Workspace } from 'src/workspace/entity/workspace.entity';
import { User } from 'src/users/entity/user.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorites) private favoritesRepo: Repository<Favorites>,
  ) {}

  // 사이드바 즐겨찾기 멤버 조회
  async getFavorites(userId: number, workspaceId: number) {
    const favorites = await this.favoritesRepo
      .createQueryBuilder('favorites')
      .innerJoinAndSelect('favorites.target', 'targetUser')
      .innerJoin(
        'workspace_member',
        'workspaceMember',
        'workspaceMember.userId = targetUser.id AND workspaceMember.workspaceId = :workspaceId',
      )
      .select('targetUser.id', 'userId')
      .addSelect('targetUser.imgUrl', 'imgUrl')
      .addSelect('workspaceMember.nickname', 'nickname')
      .where('favorites.workspace.id = :workspaceId', { workspaceId })
      .andWhere('favorites.source.id = :userId', { userId })
      .getRawMany();

    return favorites;
  }

  // 즐겨찾기 추가/삭제 토글
  async toggleFavorites(
    workspaceId: number,
    sourceId: number,
    targetId: number,
  ) {
    const favorite = await this.favoritesRepo.findOne({
      where: {
        workspace: { id: workspaceId },
        source: { id: sourceId },
        target: { id: targetId },
      },
    });

    if (favorite) {
      // 존재하면 삭제
      await this.favoritesRepo.remove(favorite);
      return { actionTaken: 'removed' };
    }

    const newFavorite = new Favorites();
    newFavorite.workspace = { id: workspaceId } as Workspace;
    newFavorite.source = { id: sourceId } as User;
    newFavorite.target = { id: targetId } as User;

    await this.favoritesRepo.insert(newFavorite);

    console.log('fr: 즐겨찾기', newFavorite);
    return { actionTaken: 'added' };
  }

  // favorites target인 유저 조회
  async getFavoriteMemberIds(userId: number, workspaceId: number) {
    const favorites = await this.favoritesRepo
      .createQueryBuilder('favorites')
      .select('favorites.target.id')
      .where('favorites.source.id = :id', { id: userId })
      .andWhere('favorites.workspace.id = :workspaceId', {
        workspaceId: workspaceId,
      })
      .getRawMany();

    const favoriteMemberIds = favorites.map(
      (favorite) => favorite.favorites_target,
    );

    return favoriteMemberIds;
  }
}
