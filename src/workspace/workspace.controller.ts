import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { AuthGuard } from 'src/auth.guard';
import { CreateWorkspaceDto } from './dtos/create-workspace.dto';
import { SendEmailDto } from './dtos/email-invitations.dto';
import { EmailService } from './email.service';
import { AcceptInvitationDto } from './dtos/accpet-invitation.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';

@Controller('workspace')
export class WorkspaceController {
  constructor(
    private workspaceService: WorkspaceService,
    private readonly emailService: EmailService,
  ) {}

  // 워크스페이스 생성 (및 해당 유저 추가)
  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: path.join(__dirname, '..', '..', 'public', 'uploads'), // '../../public/uploads'
        filename: (req, file, callback) => {
          const userId = (req as any).userId;
          const extension = path.extname(file.originalname);
          const filename = `${Date.now()}-user${userId}${extension}`;
          callback(null, filename);
        },
      }),
    }),
  )
  async createWorkspace(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req,
    @Body() createWorkspaceDto: CreateWorkspaceDto,
  ) {
    const userId = req.userId;

    if (file) {
      console.log('fr: 워크스페이스 이미지 업로드: ', file);
    }
    // workspace 함수에 file 인자로 같이 전달하기. 안에서는 undefined가 아닐 경우 imgUrl에 넣고.
    return await this.workspaceService.createWorkspace(
      userId,
      createWorkspaceDto,
      file,
    );
  }

  // 내 워크스페이스 조회
  @UseGuards(AuthGuard)
  @Get()
  async findMyWorkspaces(@Req() req) {
    const userId = req.userId;
    return await this.workspaceService.findMyWorkspaces(userId);
  }

  // 해당 워크스페이스에서 내 정보 (sidebar)
  @UseGuards(AuthGuard)
  @Get(':workspaceId/current-user')
  async getMyInfo(@Req() req, @Param('workspaceId') workspaceId: number) {
    const userId = req.userId;
    console.log('fr: ', userId);
    return await this.workspaceService.getMyInfo(userId, workspaceId);
  }

  // 초대가능 이메일인지 확인
  @UseGuards(AuthGuard)
  @Get(':workspaceId/invitations/availability')
  async isEmailInvitable(
    @Param('workspaceId') workspaceId: number,
    @Query('email') email: string,
  ) {
    return this.emailService.isEmailInvitable(workspaceId, email);
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
    console.log('fr:  uniqueToken, email', uniqueToken, email);
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
