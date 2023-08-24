import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Favorites } from './entity/favorites.entity';
import { Repository } from 'typeorm';
import { WorkspaceMember } from 'src/workspace/entity/workspace_member.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorites) private favoritesRepo: Repository<Favorites>,
    @InjectRepository(WorkspaceMember)
    private workspaceMemberRepo: Repository<WorkspaceMember>,
  ) {}

  // 즐겨찾기 추가
  async toggleFavorites(workspaceId: number, userId: number) {}

  // async toggleFavorites(workspaceId: number, userId: number) {
  //   const favorite = await this.findOne({
  //     where: {
  //       workspace: { id: workspaceId },
  //       target: { id: userId }
  //     }
  //   });

  //   if (favorite) {
  //     await this.remove(favorite);
  //   } else {
  //     const newFavorite = new Favorites();
  //     newFavorite.workspace = { id: workspaceId } as any;  // you might want to fetch the actual workspace entity for a more thorough implementation
  //     newFavorite.target = { id: userId } as any;  // same for the user
  //     await this.save(newFavorite);
  //   }
  // }

  // 닉네임 검색
  async searchMembers(workspaceId: number, query: string) {
    const availableUsers = await this.workspaceMemberRepo
      .createQueryBuilder('workspaceMember')
      .innerJoinAndSelect(
        'workspaceMember.workspace',
        'workspace',
        'workspace.id = :workspaceId',
        { workspaceId: workspaceId },
      )
      .innerJoin('workspaceMember.member', 'user')
      .select(['user.id', 'user.imgUrl'])
      .addSelect('workspaceMember.nickname', 'nickname')
      .where('workspaceMember.nickname LIKE :query', { query: `%${query}%` })
      .getRawMany();

    return availableUsers;
    // 검색결과는 query like인 유저들의(nickname, userId, imgUrl, favorites 여부)가 같이 와야함.
    // 2. Favorites-source=userId인 target 배열 중 userId가 있으면
  }
}

// const availableUsers = await this.workspaceMemberRepo
// .createQueryBuilder('workspaceMember')
// .innerJoinAndSelect(
//   'workspaceMember.workspace',
//   'workspace',
//   'workspace.id = :workspaceId',
//   { workspaceId: workspaceId },
// )
// .innerJoin('workspaceMember.member', 'user')
// .where('workspaceMember.nickname LIKE :query', { query: `%${query}%` })
// .select(['user.id', 'user.imgUrl'])
// .addSelect('workspaceMember.nickname', 'nickname')
// .getMany();
