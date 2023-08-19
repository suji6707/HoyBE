import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateGroupDto, UpdateGroupDto } from './dtos/create-group.dto';
import { Group } from './entity/group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from 'src/workspace/entity/workspace.entity';
import { User } from 'src/users/entity/user.entity';
import { WorkspaceMember } from 'src/workspace/entity/workspace_member.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group) private groupRepo: Repository<Group>,
    @InjectRepository(Workspace) private workspaceRepo: Repository<Workspace>,
    @InjectRepository(WorkspaceMember)
    private workspaceMemberRepo: Repository<WorkspaceMember>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  // 그룹 생성
  async createGroup(
    userId: number,
    workspaceId: number,
    createGroupDto: CreateGroupDto,
  ) {
    const { name, memberIds } = createGroupDto;
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

    await this.addUserToGroup(group, memberIds);

    return group;
  }

  // 그룹에 유저 초대 (여러명 입력)
  async addUserToGroup(group: Group, memberIds: number[]) {
    for (const memberId of memberIds) {
      // 해당 유저가 이미 그룹 멤버인지 확인
      if (group.members.some((member) => member.id === memberId)) {
        throw new BadRequestException('User already in the group');
      }
      const addedUser = await this.userRepo.findOne({
        where: { id: memberId },
      });
      group.members.push(addedUser);
    }

    console.log('fr: group.members: ', group.members);

    await this.groupRepo.save(group);
  }

  // 그룹 모달창
  async getAvailableUsers(
    userId: number,
    workspaceId: number,
    groupId: number,
  ) {
    // 워크스페이스 멤버 가져오기
    const workspaceMembers = await this.workspaceMemberRepo
      .createQueryBuilder('workspaceMember')
      .select(['workspaceMember.member.id', 'workspaceMember.member'])
      .innerJoin(User, 'user', 'workspaceMember.member.id = user.id')
      .where('workspaceMember.workspace.id = :workspaceId', { workspaceId })
      .getMany();

    return workspaceMembers;
  }

  // 그룹 수정
  async updateGroup(groupId: number, updateGroupDto: UpdateGroupDto) {
    const { name, memberIds } = updateGroupDto;

    // groupId 기준으로 그룹을 찾는다
    // const group = await this.groupRepo.findOne({ where: { id: groupId } });
    // if (!group) {
    //   throw new NotFoundException('해당 그룹이 존재하지 않습니다');
    // }

    // group 존재 여부
    const count = await this.groupRepo.count({ where: { id: groupId } });
    if (count === 0) {
      throw new NotFoundException('해당 그룹이 존재하지 않습니다');
    }

    // name 수정 (있으면)
  }
}

/**
 * 디테일
 * 그룹을 생성한 사람은 자동으로 그룹 멤버 배열에 추가됨.
 * -> 유저 배열로 저장할 때 중복을 방지하려면?
 * 
 * 1. 그룹 멤버 추가시 워크스페이스에 존재하는 모든 멤버 조회되어야 함.
 * 이 때 userId, user.name이 프론트에 보내져야 하고, 
 * 사용자를 추가할 때는 user.name 중 클릭 -> 해당 userId가 입력되도록.
 * 
 * 즉, 추가할 멤버들이 배열에 담겨서 백엔드로 전달되고.
 * 이것을 dto로 어떻게?
 * 
 * 입력되는 데이터:
 
groupName: " ",
members: [userId1, userId2, ...]
-> group_member 매핑테이블에 관계가 추가되고,
그룹을 클릭해서 조회하면 이 테이블을 기준으로
그 그룹에 해당하는 유저들을 배열로 리턴할 수 있어야 함!
 * 
 * 
 * 
 * 
 *  */

/* SELECT 
    workspaceMember.member.id AS memberId,
    user.name AS username
  FROM 
    workspace_member workspaceMember
  INNER JOIN
    User ON workspaceMember.member_id = user.id
  WHERE
    workspaceMember.workspace_id = :workspaceId;
  member.name FROM workspace_member workspaceMember
// WHERE workspaceMember
*/
