import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth.guard';
import { CreateGroupDto, UpdateGroupDto } from './dtos/create-group.dto';
import { GroupService } from './group.service';
import { WorkspaceGuard } from 'src/workspace.guard';

@Controller('workspace/:workspaceId/group')
export class GroupController {
  constructor(private groupService: GroupService) {}

  // 그룹 생성: 모달창
  // @Get()
  // async getAvailableUsers(@Req())

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

  // 그룹 수정 모달창
  // workspaceId -> 에 초대되어있는 멤버들 리스트. userId랑 username만.
  // groupId -> 해당 group의 이름과, 추가되어있는 멤버들 리스트. relations [members] 필요.
  // userId -> 워크스페이스멤버,그룹멤버 리스트 둘 다 자기 이름 제외하고 보여주기.
  @UseGuards(AuthGuard, WorkspaceGuard)
  @Get(':groupId')
  async getAvailableUsers(
    @Req() req,
    @Param('workspaceId') workspaceId: number,
    @Param('groupId') groupId: number,
  ) {
    const userId = req.userId;
    const workspaceMembers = await this.groupService.getAvailableUsers(
      userId,
      workspaceId,
      groupId,
    );
    return workspaceMembers;
  }

  // 기존 그룹에 유저 추가
  // POST /workspace/{workspaceId}/group/{groupId}
  @Post(':groupId')
  async updateGroup(
    @Param('groupId') groupId: number,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    await this.groupService.updateGroup(groupId, updateGroupDto);
  }
}
