import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { AuthGuard } from 'src/auth.guard';
import { CreateWorkspaceDto } from './dtos/create-workspace.dto';
import { CreateGroupDto } from 'src/group/dtos/create-group.dto';
import { GroupService } from 'src/group/group.service';
import { SendEmailDto } from './dtos/email-invitations.dto';
import { EmailService } from './email.service';
import { JwtService } from '@nestjs/jwt';

@Controller('workspace')
export class WorkspaceController {
  constructor(
    private workspaceService: WorkspaceService,
    private groupService: GroupService,
    private readonly emailService: EmailService,
    private jwtService: JwtService,
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
    @Param('workspaceId') workspaceId: number,
    @Body() sendEmailDto: SendEmailDto,
  ) {
    return await this.emailService.sendEmail(workspaceId, sendEmailDto.email);
  }

  // 초대 수락: 어느 워크스페이스인지 정보만 가지고 로그인 하도록. (로그인에선 workspaceId가 있으면 워크스페이스 초대 메일을 통한 로그인임을 인식하고 auth/login으로 라우팅)
  @Get('accept/:uniqueToken')
  async acceptInvitation(
    @Param('uniqueToken') uniqueToken: string,
    @Req() req,
    @Res() res,
  ) {
    console.log(uniqueToken);
    const decoded = await this.jwtService.verifyAsync(uniqueToken);
    const { workspaceId, email } = decoded;
    console.log('fr: 사용자가 초대받은 워크스페이스: ', workspaceId);
    const redirectUrl = `${process.env.DOMAIN}/auth/login?workspaceId=${workspaceId}`;
    console.log(redirectUrl);
    return res.redirect(redirectUrl);
  }

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
}
