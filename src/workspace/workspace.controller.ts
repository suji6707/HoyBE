import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { AuthGuard } from 'src/auth.guard';
import { CreateWorkspaceDto } from './dtos/create-workspace.dto';
import { CreateGroupDto } from 'src/group/dtos/create-group.dto';
import { GroupService } from 'src/group/group.service';
import { SendEmailDto } from './dtos/email-invitations.dto';
import { EmailService } from './email.service';

@Controller('workspace')
export class WorkspaceController {
  constructor(
    private workspaceService: WorkspaceService,
    private groupService: GroupService,
    private readonly emailService: EmailService,
  ) {}

  // 워크스페이스 생성 (및 해당 유저 추가)
  @UseGuards(AuthGuard)
  @Post()
  async createWorkspace(
    @Req() req,
    @Body() createWorkspaceDto: CreateWorkspaceDto,
  ) {
    const userId = req.userId;
    return await this.workspaceService.createWorkspace(
      userId,
      createWorkspaceDto,
    );
  }

  // 이메일로 워크스페이스 초대
  @UseGuards(AuthGuard)
  @Post(':workspaceId/invitations')
  async sendEmail(
    @Req() req,
    @Param('workspaceId') workspaceId: number,
    @Body() sendEmailDto: SendEmailDto,
  ) {
    return this.emailService.sendEmail(workspaceId, sendEmailDto.email);
  }
  /* Accept invitation */

  @Get('accept/:uniqueToken')

  // 입력된 이메일이 User 테이블에 존재할 경우 워크스페이스 초대만

  // 비회원일 경우 이메일 클릭시 가입부터 진행되도록 함.

  // 이미 워크스페이스에 초대된 사용자를 그룹에 초대
  // POST /workspace/{workspaceId}/group/{groupId}/members

  // 그룹 생성 (및 해당 유저 추가)
  @UseGuards(AuthGuard)
  @Post(':workspaceId/group')
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

  @UseGuards(AuthGuard) // WorkspaceGuard 추가
  @Get(':workspaceId/tasks')
  async findTasksByDate(
    @Req() req,
    @Param('workspaceId') workspaceId: number,
    @Query('date') date?: string,
  ) {
    const userId = req.userId;
    const tasks = await this.workspaceService.findTasksByDate(
      workspaceId,
      userId,
      date,
    );
    console.log(userId, tasks);

    return tasks;
  }
}
