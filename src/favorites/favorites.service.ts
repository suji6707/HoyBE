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
  async addFavorites(workspaceId: number, userId: number) {}

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
