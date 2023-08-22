import {
  Body,
  Controller,
  Delete,
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
import { WorkspaceService } from 'src/workspace/workspace.service';

@Controller('workspace/:workspaceId/group')
export class GroupController {
  constructor(
    private groupService: GroupService,
    private workspaceService: WorkspaceService,
  ) {}

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

  // 내가 만든 그룹 조회
  @UseGuards(AuthGuard, WorkspaceGuard)
  @Get()
  async getMyGroups(@Req() req, @Param('workspaceId') workspaceId: number) {
    const userId = req.userId;
    return await this.groupService.getMyGroups(userId, workspaceId);
  }

  // 그룹에 초대가능 유저 조회
  @UseGuards(AuthGuard, WorkspaceGuard)
  @Get('available-users')
  async getAvailableUsers(
    @Req() req,
    @Param('workspaceId') workspaceId: number,
  ) {
    const userId = req.userId;
    const availableUsers = await this.workspaceService.getAvailableUsers(
      workspaceId,
    );
    const availableUsersWithMe =
      await this.workspaceService.addMeToWorkspaceMembers(
        availableUsers,
        userId,
      );

    // Add flag
    const workspaceMembers = availableUsersWithMe.map((member, index) => {
      if (index == 0) {
        return { ...member, flag: true };
      }
      return { ...member, flag: false };
    });

    return { workspaceMembers };
  }

  // 그룹 수정 모달창
  @UseGuards(AuthGuard, WorkspaceGuard)
  @Get(':groupId/available-users')
  async getAvailableUsersWithGroup(
    @Req() req,
    @Param('workspaceId') workspaceId: number,
    @Param('groupId') groupId: number,
  ) {
    const userId = req.userId;
    const availableUsers = await this.workspaceService.getAvailableUsers(
      workspaceId,
    );
    const groupMembers = await this.groupService.getGroupMembers(
      groupId,
      workspaceId,
    );

    const availableUsersWithFlag =
      await this.groupService.addFlagToWorkspaceMembers(
        availableUsers,
        groupMembers,
      );

    const workspaceMembers =
      await this.workspaceService.addMeToWorkspaceMembers(
        availableUsersWithFlag,
        userId,
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

  // 그룹 삭제
  @Delete(':groupId')
  async deleteGroup(@Param('groupId') groupId: number) {
    return await this.groupService.deleteGroup(groupId);
  }
}
