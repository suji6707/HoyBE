import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateGroupDto } from './dtos/create-group.dto';
import { Group } from './entity/group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from 'src/workspace/entity/workspace.entity';
import { User } from 'src/users/entity/user.entity';
import { WorkspaceMember } from 'src/workspace/entity/workspace_member.entity';
import { UpdateGroupDto } from './dtos/update-group.dto';

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
    group.creator = user;
    group.members = [user]; // 해당 유저를 그룹 멤버에 추가

    // 해당 그룹 저장
    await this.groupRepo.save(group); // tasks만 null 상태
    // memberIds가 있을 때만 해당 유저 추가
    if (memberIds) {
      await this.addUserToGroup(group, memberIds);
    }
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
      group.memberCount += 1;
    }
    console.log('fr: group.members: ', group.members);
    await this.groupRepo.save(group);
  }

  // 내가 만든 그룹 조회
  async getMyGroups(userId: number, workspaceId: number) {
    const groupList = await this.groupRepo.find({
      where: {
        workspace: { id: workspaceId },
        creator: { id: userId },
      },
    });
    return groupList;
  }

  // 그룹 유저 조회 (그룹 수정시 모달창)
  async getGroupMembers(groupId: number, workspaceId: number) {
    const groupMemberIds = await this.getGroupMemberIds(groupId);
    console.log(`fr: 그룹 ${groupId}에 해당하는 유저들`, groupMemberIds);

    if (groupMemberIds.length === 0) {
      return [];
    }
    const groupMembersWithNicknames = await this.workspaceMemberRepo
      .createQueryBuilder('workspaceMember')
      .innerJoinAndSelect(
        'workspaceMember.workspace',
        'workspace',
        'workspace.id = :workspaceId',
        { workspaceId: workspaceId },
      )
      .innerJoin('workspaceMember.member', 'user')
      .where('user.id IN (:...groupMemberIds)', {
        groupMemberIds: groupMemberIds,
      })
      .select('user.id', 'userId')
      .addSelect('user.imgUrl', 'imgUrl')
      .addSelect('workspaceMember.nickname', 'nickname')
      .getRawMany();

    console.log('fr: ', groupMembersWithNicknames);
    return groupMembersWithNicknames;
  }

  // 그룹 유저 id 조회
  async getGroupMemberIds(groupId: number): Promise<number[]> {
    const groupMembers = await this.groupRepo
      .createQueryBuilder('group')
      .innerJoin('group.members', 'users')
      .where('group.id = :id', { id: groupId })
      .select('users.id', 'userId')
      .getRawMany();

    // Extract the userIds into a new array
    const groupMemberIds = groupMembers.map((member) => member.userId);
    return groupMemberIds;
  }

  // 수정 모달창 전처리: flag 처리 (기 초대된 유저)
  async addFlagToWorkspaceMembers(availableUsers, groupMembers) {
    // groupMembers의 userId 목록 생성
    const groupMemberIds = groupMembers.map((member) => member.userId);
    // workspaceMembers에 flag 추가
    const workspaceMembersWithFlag = availableUsers.map((member) => {
      return {
        ...member,
        flag: groupMemberIds.includes(member.userId),
      };
    });
    return workspaceMembersWithFlag;
  }

  // 그룹 수정
  async updateGroup(groupId: number, updateGroupDto: UpdateGroupDto) {
    const { name, addMemberIds, removeMemberIds } = updateGroupDto;

    // groupId로 그룹 조회
    const group = await this.groupRepo.findOne({
      where: { id: groupId },
      relations: ['members'],
    });
    if (!group) {
      throw new NotFoundException('해당 그룹이 존재하지 않습니다');
    }
    // name 수정
    if (name) {
      group.name = name;
    }
    // 추가할 멤버 설정
    if (addMemberIds && addMemberIds.length > 0) {
      const newMembers = await this.userRepo
        .createQueryBuilder('user')
        .where('user.id IN (:...addMemberIds)', {
          addMemberIds: addMemberIds,
        })
        .getMany();

      group.members.push(...newMembers);
    }
    // 삭제할 멤버 설정
    if (removeMemberIds && removeMemberIds.length > 0) {
      group.members = group.members.filter(
        (member) => !removeMemberIds.includes(member.id),
      );
    }
    // memberCount 업데이트
    const addCount = addMemberIds?.length ?? 0;
    const removeCount = removeMemberIds?.length ?? 0;
    const memberCountChange = addCount - removeCount;
    group.memberCount += memberCountChange;

    // DB 저장
    return await this.groupRepo.save(group);
  }

  // 그룹 삭제
  async deleteGroup(groupId: number) {
    return await this.groupRepo
      .createQueryBuilder('group')
      .delete()
      .where('id = :id', { id: groupId })
      .execute();
  }
}
