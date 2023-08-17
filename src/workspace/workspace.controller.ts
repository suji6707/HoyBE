import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { AuthGuard } from 'src/auth.guard';
import { CreateWorkspaceDto } from './dtos/create-workspace.dto';
import { SendEmailDto } from './dtos/email-invitations.dto';
import { EmailService } from './email.service';

@Controller('workspace')
export class WorkspaceController {
  constructor(
    private workspaceService: WorkspaceService,
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
    @Param('workspaceId') workspaceId: number,
    @Body() sendEmailDto: SendEmailDto,
  ) {
    return await this.emailService.sendEmail(workspaceId, sendEmailDto.email);
  }
}
