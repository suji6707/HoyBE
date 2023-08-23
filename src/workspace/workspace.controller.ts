import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { AuthGuard } from 'src/auth.guard';
import { CreateWorkspaceDto } from './dtos/create-workspace.dto';
import { SendEmailDto } from './dtos/email-invitations.dto';
import { EmailService } from './email.service';
import { AcceptInvitationDto } from './dtos/accpet-invitation.dto';

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
    return await this.emailService.sendEmail(workspaceId, sendEmailDto.emails);
  }

  @UseGuards(AuthGuard)
  @Post('accept-invitation')
  async acceptInvitation(
    @Req() req,
    @Body() acceptInvitationDto: AcceptInvitationDto,
  ) {
    const userId = req.userId;
    const { uniqueToken, email } = acceptInvitationDto;
    return await this.workspaceService.acceptInvitaion(
      uniqueToken,
      email,
      userId,
    );
  }

  // @Post('test')
  // async test() {
  //   return await this.workspaceService.acceptInvitaion(
  //     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3b3Jrc3BhY2VJZCI6IjEiLCJlbWFpbCI6Imhlb2ppc3U2NzA3QGdtYWlsLmNvbSIsImlhdCI6MTY5MjcyMDMxMywiZXhwIjoxNjkyNzIwMzQzfQ.tN2sZgGeilaZy_HDQE2trWofmmAphrWN4l-m-1q_bOg',
  //     'heojisu6707@gmail.com',
  //     1,
  //   );
  // }
}
