import { ConflictException, Injectable } from '@nestjs/common';
import { CreateGroupDto } from './dtos/create-group.dto';
import { Group } from './entity/group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from 'src/workspace/entity/workspace.entity';
import { User } from 'src/users/entity/user.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group) private groupRepo: Repository<Group>,
    @InjectRepository(Workspace) private workspaceRepo: Repository<Workspace>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async createGroup(
    userId: number,
    workspaceId: number,
    createGroupDto: CreateGroupDto,
  ) {
    const { name } = createGroupDto;
    // 이미 존재하는 그룹인지 확인(해당 워크스페이스내)
    const existingGroup = await this.groupRepo.findOne({
      where: { name: name },
    });
    if (existingGroup) {
      throw new ConflictException('그룹 이름이 이미 존재합니다.');
    }

    // 그룹 객체 생성 및 정보 채워넣기
    const group = new Group();
    const workspace = await this.workspaceRepo.findOne({
      where: { id: workspaceId },
    });
    const user = await this.userRepo.findOne({ where: { id: userId } });

    group.name = name;
    group.workspace = workspace;
    // 해당 유저를 그룹 멤버에 추가
    group.members = [user];

    // 해당 그룹 저장
    await this.groupRepo.save(group); // tasks만 null 상태
    return group;
  }
}
