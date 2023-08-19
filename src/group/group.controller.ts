import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth.guard';
import { CreateGroupDto } from './dtos/create-group.dto';
import { GroupService } from './group.service';

@Controller('workspace/:workspaceId/group')
export class GroupController {
  constructor(private groupService: GroupService) {}

  // 이미 워크스페이스에 초대된 사용자를 그룹에 초대
  // POST /workspace/{workspaceId}/group/{groupId}/members

  // 그룹 생성 (및 해당 유저 추가)
  @UseGuards(AuthGuard)
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
}
