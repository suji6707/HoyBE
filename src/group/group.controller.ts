import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth.guard';
import { CreateGroupDto } from './dtos/create-group.dto';
import { GroupService } from './group.service';
import { WorkspaceGuard } from 'src/workspace.guard';
import { UpdateGroupDto } from './dtos/update-group.dto';

@Controller('workspace/:workspaceId/group')
export class GroupController {
  constructor(private groupService: GroupService) {}

  // 그룹 생성 (및 해당 유저 추가)
  @UseGuards(AuthGuard, WorkspaceGuard)
  @Post()
  async createGroup(
    @Req() req,
    @Param('workspaceId') workspaceId: number,
    @Body() createGroupDto: CreateGroupDto,
  ) {
    const userId = req.userId;
    const group = await this.groupService.createGroup(
      userId,
      workspaceId,
      createGroupDto,
    );
    return group;
  }

  // 그룹에 초대가능 유저 조회
  @UseGuards(AuthGuard, WorkspaceGuard)
  @Get()
  async getAvailableUsers(
    // @Req() req,
    @Param('workspaceId') workspaceId: number,
  ) {
    // const userId = req.userId;
    const workspaceMembers = await this.groupService.getAvailableUsers(
      // userId, // 자신을 제외한 모든 멤버 - innerJoinSelect로 바꿔서 user.id !== userId로.
      workspaceId,
    );
    return { workspaceMembers };
  }

  // 그룹 수정 모달창
  // userId -> 워크스페이스멤버,그룹멤버 리스트 둘 다 자기 이름 제외하고 보여주기.
  @UseGuards(AuthGuard, WorkspaceGuard)
  @Get(':groupId')
  async getAvailableUsersWithGroup(
    // @Req() req,
    @Param('workspaceId') workspaceId: number,
    @Param('groupId') groupId: number,
  ) {
    // const userId = req.userId;
    const workspaceMembers = await this.groupService.getAvailableUsers(
      // userId, // 자신을 제외한 모든 멤버 - innerJoinSelect로 바꿔서 user.id !== userId로.
      workspaceId,
    );
    const groupMembers = await this.groupService.getGroupMembers(
      groupId,
      workspaceId,
    );
    return { workspaceMembers, groupMembers };
  }

  // 그룹 수정(그룹명 및 유저 추가/삭제)
  @UseGuards(AuthGuard, WorkspaceGuard)
  @Put(':groupId')
  async updateGroup(
    @Param('groupId') groupId: number,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    return await this.groupService.updateGroup(groupId, updateGroupDto);
  }

  // 그룹 멤버 조회
  @UseGuards(AuthGuard, WorkspaceGuard)
  @Get(':groupId/members')
  async getGroupMembers(
    @Param('workspaceId') workspaceId: number,
    @Param('groupId') groupId: number,
  ) {
    const groupMembers = await this.groupService.getGroupMembers(
      groupId,
      workspaceId,
    );
    return groupMembers;
  }
}
